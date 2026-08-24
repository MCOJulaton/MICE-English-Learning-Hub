/* ===================== APP STATE / ROUTER ===================== */
let current = 0;
const app = document.getElementById('app');
const progressWrap = document.getElementById('progressWrap');

function buildProgress(){
  progressWrap.innerHTML = '';
  SECTION_META.forEach((s,i)=>{
    const wrap = document.createElement('div');
    wrap.className = 'dot-wrap';
    wrap.title = s.label;
    const d = document.createElement('div');
    d.className = 'dot' + (i===current?' active':'') + (i<current?' done':'');
    wrap.setAttribute('role','button');
    wrap.tabIndex = 0;
    wrap.setAttribute('aria-label', `Go to ${s.label}`);
    wrap.appendChild(d);
    wrap.addEventListener('click', ()=>{ current = i; renderAll(); });
    wrap.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); current = i; renderAll(); } });
    progressWrap.appendChild(wrap);
  });
}

/* ===================== DATA COLLECTION MODULE =====================
   Preferred architecture: this page -> Google Apps Script Web App -> Google
   Sheets. Paste your deployed Apps Script Web App URL below to go live.
   Until then, the site works exactly as before — nothing is sent anywhere,
   and nothing pretends to have been saved.

   Every record is shaped for the whole English Learning Hub, not just this
   unit, so the same app.js pattern can be reused by future courses/units:
     { studentId, studentName, course, unit, date, timestamp,
       activity, score, completionStatus }

   completionStatus distinguishes four record types (per the platform spec):
     'checked-in'  -> COURSE CHECK-IN / ATTENDANCE (explicit, not just a page open)
     'completed'   -> ACTIVITY COMPLETION (score, if any, travels alongside)
     'reached'     -> live teacher-graded activity reached (e.g. Final Challenge)
     'completed' on the 'Lesson Complete' activity -> FINAL UNIT COMPLETION */
const DATA_ENDPOINT = "https://script.google.com/macros/s/AKfycbxDECOuXf3HMxPVLT1fhfOHE5g-Gq1juG5enaCoUrShk9vEMfctgy-URKmqmvPGeoE/exec";

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','practice','s11','s12'];

const Progress = {
  studentId:'', firstName:'', lastName:'', studentName:'',
  date:'', startTime:'',
  activities:{} // key -> {status:'completed', score:null|string, completionStatus}
};
let pendingRecords = []; // in-memory only for this session — cleared on reload, never persisted to disk

function isEndpointConfigured(){
  return typeof DATA_ENDPOINT === 'string' && DATA_ENDPOINT.trim() !== '' && DATA_ENDPOINT.indexOf('PASTE_') !== 0;
}

function buildRecord(activity, {score=null, completionStatus='completed'}={}){
  return {
    studentId: Progress.studentId,
    studentName: Progress.studentName,
    course: COURSE_META.course,
    unit: COURSE_META.unit,
    date: Progress.date,
    timestamp: new Date().toISOString(),
    activity,
    score,
    completionStatus
  };
}

/* ===================== TEACHER DASHBOARD (future use) =====================
   This page intentionally does NOT build a teacher dashboard — a real one needs
   a login/auth layer so students can never see each other's records, and that
   can't be done securely in a static HTML file. Instead, every record below is
   already shaped so Google Sheets can BE the teacher dashboard once DATA_ENDPOINT
   is connected:

   1. Deploy a Google Apps Script Web App (Extensions → Apps Script in a Sheet)
      with a doPost(e) function that reads e.postData.contents, JSON.parse()s it,
      and appends a row: [studentId, studentName, course, unit, date, timestamp,
      activity, score, completionStatus] — one column per key in the record below.
   2. Paste the deployed Web App URL into DATA_ENDPOINT above.
   3. In the Sheet, a Pivot Table (rows: studentName, columns: activity, values:
      score/completionStatus) reproduces the "Student / Attendance / Listening
      Score / Practice Score / Activities Completed / Final Challenge Status"
      view described in the spec — filterable, sortable, and exportable, without
      any student-facing dashboard code needing to exist in this file at all.

   Record shape sent by every call to sendProgressRecord():
   { studentId, studentName, course, unit, date, timestamp, activity, score, completionStatus } */

/* Sends one record to the Apps Script endpoint. Never throws, never blocks the
   lesson, never shows a scary error — a failed send is just queued for retry. */
function sendProgressRecord(record){
  if(!isEndpointConfigured()){
    pendingRecords.push(record);
    return;
  }
  fetch(DATA_ENDPOINT, {
    method:'POST',
    mode:'no-cors', // Apps Script web apps typically need no-cors from a plain static page
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify(record)
  }).catch(()=>{ pendingRecords.push(record); });
}

function flushPendingRecords(){
  if(!isEndpointConfigured() || !pendingRecords.length) return;
  const toSend = pendingRecords;
  pendingRecords = [];
  toSend.forEach(r=> sendProgressRecord(r));
}
window.addEventListener('online', flushPendingRecords);
setInterval(flushPendingRecords, 20000); // quiet periodic retry — never interrupts the lesson

function markActivityComplete(key, opts={}){
  const score = opts.score ?? null;
  const completionStatus = opts.completionStatus || 'completed';
  const prev = Progress.activities[key];
  if(prev && prev.completionStatus===completionStatus && prev.score===score) return;
  Progress.activities[key] = { status:completionStatus, score, completionStatus };
  sendProgressRecord(buildRecord(key, {score, completionStatus}));
  updateTopbarBadge();
}
/* For fine-grained sub-scores (e.g. individual Practice Set tabs) that support the
   teacher's records but shouldn't affect the top-bar "X/13 done" section count. */
function sendGranularRecord(label, opts={}){
  sendProgressRecord(buildRecord(label, {score: opts.score ?? null, completionStatus: opts.completionStatus || 'completed'}));
}
function completedCount(){
  return TRACKED_ACTIVITIES.filter(k => Progress.activities[k]).length;
}
function keyIndex(key){
  return SECTION_META.findIndex(s=>s.key===key);
}
function updateTopbarBadge(){
  const el = document.getElementById('studentBadge');
  if(!el) return;
  if(!Progress.studentName){ el.style.display='none'; return; }
  el.style.display='';
  el.innerHTML = `<b>${Progress.studentName}</b> · ${completedCount()}/${TRACKED_ACTIVITIES.length} done`;
}

/* ===================== DEEP LINKS (Practice Hub, etc.) =====================
   ?section=<key> jumps straight to that section after check-in (e.g.
   ?section=practice). &tab=<tabkey> additionally clicks a tab button with
   data-ptab="<tabkey>" once it's rendered. Purely additive — with no
   params, behavior is exactly as before. */
function applyDeepLinkAfterCheckin(){
  const params = new URLSearchParams(location.search);
  const sectionKey = params.get('section');
  if(!sectionKey) return;
  const idx = SECTION_META.findIndex(s => s.key === sectionKey);
  if(idx < 0) return;
  goTo(idx);
  const tabKey = params.get('tab');
  if(tabKey){
    setTimeout(()=>{
      const tabBtn = document.querySelector(`#app [data-ptab="${tabKey}"]`);
      if(tabBtn) tabBtn.click();
    }, 50);
  }
}

/* ===================== STUDENT CHECK-IN ===================== */
/* Explicit check-in only — opening the page is never treated as attendance. */
function wireCheckin(){
  const gate = document.getElementById('checkinGate');
  const form = document.getElementById('checkinForm');
  const confirmEl = document.getElementById('checkinConfirm');
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const id = document.getElementById('ciId').value.trim();
    const first = document.getElementById('ciFirst').value.trim();
    const last = document.getElementById('ciLast').value.trim();
    if(!id || !first || !last) return;
    const now = new Date();
    Progress.studentId = id;
    Progress.firstName = first;
    Progress.lastName = last;
    Progress.studentName = `${first} ${last}`;
    Progress.date = now.toISOString().slice(0,10);
    Progress.startTime = now.toISOString();
    sendProgressRecord(buildRecord('Check-In', {score:null, completionStatus:'checked-in'}));
    form.classList.add('checked-in');
    confirmEl.classList.add('show');
    updateTopbarBadge();
    applyDeepLinkAfterCheckin();
    setTimeout(()=>{ gate.style.display='none'; }, 900);
  });
}

const VoiceEngine = (function(){
  let allVoices = [];
  let staffVoice = null, delegateVoice = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const QUALITY_HINTS = ['natural','neural','premium','enhanced','online','wavenet','studio'];
  const GOOD_NAMES = ['google us english','samantha','ava','zoe','aria','jenny','guy','matthew','joanna','ryan','emma'];

  function scoreVoice(v){
    const n = v.name.toLowerCase();
    let score = 0;
    if(v.lang && v.lang.toLowerCase().startsWith('en-us')) score += 3;
    else if(v.lang && v.lang.toLowerCase().startsWith('en')) score += 1;
    QUALITY_HINTS.forEach(h=>{ if(n.includes(h)) score += 4; });
    GOOD_NAMES.forEach(g=>{ if(n.includes(g)) score += 2; });
    if(n.includes('compact') || n.includes('espeak')) score -= 5;
    return score;
  }

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];

    // Fixed voice preferences requested for this lesson:
    // Nat (staff): a Thai-accented English voice if the device has one, else "Rishi"
    // Mr. Bauer (delegate): "Google UK English Male"
    const thaiVoice = allVoices.find(v => /th[-_]?th/i.test(v.lang) || /thai/i.test(v.name));
    const rishiVoice = allVoices.find(v => /rishi/i.test(v.name));
    const ukMaleVoice = allVoices.find(v => /google uk english male/i.test(v.name))
                      || allVoices.find(v => /^en-gb$/i.test(v.lang) && /male/i.test(v.name))
                      || allVoices.find(v => /^en-gb$/i.test(v.lang));

    staffVoice = thaiVoice || rishiVoice || allVoices[0] || null;
    delegateVoice = ukMaleVoice || allVoices[1] || allVoices[0] || null;

    onStateChange();
  }

  if('speechSynthesis' in window){
    window.speechSynthesis.onvoiceschanged = refresh;
    refresh();
  }

  function splitSentences(text){
    return text.replace(/([.!?])\s+/g,'$1|').split('|').map(s=>s.trim()).filter(Boolean);
  }

  function makeUtterance(text, kind){
    const u = new SpeechSynthesisUtterance(text);
    const voice = kind==='delegate' ? delegateVoice : staffVoice;
    if(voice) u.voice = voice;
    u.lang = 'en-US';
    u.rate = (slower ? 0.86 : 1.0);
    u.pitch = kind==='delegate' ? 1.06 : 0.98;
    return u;
  }

  function playNext(){
    if(queueIndex >= queue.length){ playing=false; paused=false; onStateChange(); return; }
    const item = queue[queueIndex];
    const sentences = splitSentences(item.text);
    let sIdx = 0;
    function playSentence(){
      if(sIdx >= sentences.length){
        queueIndex++;
        setTimeout(playNext, 420); // natural gap between speaker turns
        return;
      }
      const u = makeUtterance(sentences[sIdx], item.kind);
      u.onend = ()=>{ sIdx++; setTimeout(playSentence, 160); }; // micro-pause between sentences
      window.speechSynthesis.speak(u);
    }
    playSentence();
  }

  return {
    setSlower(v){ slower = v; },
    isSlower(){ return slower; },
    isPlaying(){ return playing; },
    isPaused(){ return paused; },
    onChange(fn){ onStateChange = fn; },
    getStaffVoice(){ return staffVoice; },
    getDelegateVoice(){ return delegateVoice; },
    listVoices(){ return allVoices; },
    speakLine(text, kind){
      this.stop();
      queue = [{text, kind: kind||'staff'}];
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
    speakConversation(lines){
      this.stop();
      queue = lines.map(l=>({text:l.text, kind: l.who==='Bauer' ? 'delegate' : 'staff'}));
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
    pause(){ if(playing && !paused){ window.speechSynthesis.pause(); paused=true; onStateChange(); } },
    resume(){ if(playing && paused){ window.speechSynthesis.resume(); paused=false; onStateChange(); } },
    stop(){ window.speechSynthesis.cancel(); playing=false; paused=false; queue=[]; queueIndex=0; onStateChange(); },
    replay(){ if(queue.length){ this.stop(); /* caller re-triggers original speak call */ } }
  };
})();

/* Backwards-compatible simple wrapper used by mini audio buttons throughout the site */
function speak(text, kind){
  if(!('speechSynthesis' in window)) { alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakLine(text, kind==='delegate' ? 'delegate' : 'staff');
}

function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">PHUKET INTERNATIONAL CONVENTION HALL</div>
    <h1>You are the <span>MICE staff.</span><br>Guests need your help.</h1>
    <p>Unit 5: Giving Directions at Events. A live 4-hour classroom console: listen, speak, navigate, and solve real communication problems as a wayfinding professional.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Ballroom A</div>
      <div class="signchip"><span class="arrow">→</span> Registration</div>
      <div class="signchip"><span class="arrow">→</span> Restrooms</div>
      <div class="signchip"><span class="arrow">→</span> Delegate Dining</div>
    </div>
    <button class="startbtn" onclick="goNext()">Begin the shift →</button>
  </div>`;
}

function renderS1(){
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">You Are The MICE Staff</h2>
  <p class="section-sub">A guest approaches you at the main entrance. Think first: what would you say?</p>
  <div class="panel">
    <img class="venue-photo" src="${SECTION_PHOTOS.staff.src}" alt="${SECTION_PHOTOS.staff.alt}" loading="lazy" style="margin-bottom:22px;">
    <div class="scene">
      <div class="avatar delegate">${icon('user',{size:36})}</div>
      <div class="bubble">"Excuse me. Could you help me?"</div>
    </div>
    <div class="choices" id="s1choices">
      <button class="choice-btn" data-v="wrong"><span class="letter">A</span> "What?"</button>
      <button class="choice-btn" data-v="right"><span class="letter">B</span> "Of course! May I help you?"</button>
      <button class="choice-btn" data-v="wrong"><span class="letter">C</span> "I don't know."</button>
    </div>
    <div class="feedback" id="s1feedback"></div>
  </div>`;
}
function wireS1(){
  const box = document.getElementById('s1choices');
  const fb = document.getElementById('s1feedback');
  box.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
    if(btn.dataset.v==='right'){
      btn.classList.add('correct');
      fb.className='feedback show good';
      fb.textContent='Nice! Warm, professional, and offers help right away. This is exactly how MICE staff greet guests.';
    } else {
      btn.classList.add('wrong');
      fb.className='feedback show meh';
      fb.textContent='Not quite professional enough. Try option B: offer help warmly and clearly.';
    }
    markActivityComplete('s1');
  });
}

function renderS2(){
  const cards = LOCATIONS.map(l=>{
    const photo = SECTION_PHOTOS[l.id];
    return `
    <div class="loc-card" data-id="${l.id}">
      <div class="ic">${l.ic}</div>
      <div class="nm">${l.nm}</div>
      <div class="loc-detail">
        ${photo ? `<img class="venue-photo loc-photo" src="${photo.src}" alt="${photo.alt}" loading="lazy" style="margin-bottom:10px;">` : ''}
        ${l.ex}
        <br><button class="audio-mini" data-say="${l.ex.replace(/"/g,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
      </div>
    </div>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Explore The Venue</h2>
  <p class="section-sub">Click a location to see it, hear it, and read one example sentence.</p>
  <div class="panel">
    <div class="loc-grid">${cards}</div>
    <hr class="hairline">
    <h3 style="font-size:16px;color:var(--navy)">Quick Check</h3>
    <p id="s2question" style="font-weight:700;color:var(--orange-deep);margin-top:6px;"></p>
    <p style="color:var(--muted);font-size:13px;">Click the matching card above.</p>
    <div class="feedback" id="s2feedback"></div>
  </div>`;
}
let s2target = null;
function wireS2(){
  const grid = document.querySelector('#app .loc-grid');
  const qEl = document.getElementById('s2question');
  const fb = document.getElementById('s2feedback');
  function newQuestion(){
    const pick = LOCATIONS[Math.floor(Math.random()*LOCATIONS.length)];
    s2target = pick.id;
    qEl.textContent = `Where is the ${pick.nm.toLowerCase()}?`;
    fb.className='feedback';
  }
  newQuestion();
  grid.addEventListener('click', e=>{
    const audioBtn = e.target.closest('.audio-mini');
    if(audioBtn){ speak(audioBtn.dataset.say,'staff'); e.stopPropagation(); return; }
    const card = e.target.closest('.loc-card'); if(!card) return;
    if(card.dataset.id === s2target){
      fb.className='feedback show good'; fb.textContent='Correct! Well spotted.';
      markActivityComplete('s2');
      setTimeout(newQuestion, 900);
    } else if(card.classList.contains('open')){
      card.classList.remove('open');
    } else {
      card.classList.add('open');
      if(card.dataset.id !== s2target){
        fb.className='feedback show meh'; fb.textContent='That\'s a location, but not the one asked for. Keep looking!';
      }
    }
  });
}

function renderS3(){
  const cards = DIRECTIONS.map(d=>`
    <div class="arrow-card"><span class="arrow-ico">${d.ic}</span><div class="lbl">${d.lbl}</div>
    <button class="audio-mini" style="margin-top:8px" data-say="${d.lbl}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Follow The Signs</h2>
  <p class="section-sub">The essential direction language, shown visually, not explained with grammar.</p>
  <div class="panel">
    <div class="arrow-grid">${cards}</div>
    <hr class="hairline">
    <h3 style="font-size:16px;color:var(--navy)">Your Turn</h3>
    <p style="font-weight:700;color:var(--orange-deep);margin-top:6px;">From the entrance, which way do you go to reach Ballroom A?</p>
    <div class="choices" id="s3choices" style="margin-top:14px;">
      <button class="choice-btn" data-v="wrong"><span class="letter">A</span> Turn left immediately</button>
      <button class="choice-btn" data-v="right"><span class="letter">B</span> Straight ahead, then turn right at the end of the corridor</button>
      <button class="choice-btn" data-v="wrong"><span class="letter">C</span> Take the elevator to floor 3</button>
    </div>
    <div class="feedback" id="s3feedback"></div>
  </div>`;
}
function wireS3(){
  document.querySelectorAll('.audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'staff')));
  const box = document.getElementById('s3choices'); const fb = document.getElementById('s3feedback');
  box.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
    if(btn.dataset.v==='right'){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct! That matches the real route.';}
    else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Try again. Think about the venue map.'; }
    markActivityComplete('s3');
  });
}

function renderS4(){
  const tabs = Object.keys(HELP_TABS).map((k,i)=>`<button class="tab-btn${i===0?' active':''}" data-tab="${k}">${HELP_TABS[k].title}</button>`).join('');
  const panels = Object.keys(HELP_TABS).map((k,i)=>`
    <div class="tab-panel${i===0?' active':''}" data-panel="${k}">
      <div class="phrase-list">
        ${HELP_TABS[k].items.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span><button class="audio-mini" data-say="${p}"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button></div>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">How To Help A Guest</h2>
  <p class="section-sub">The phrases MICE staff use, organized by moment, not as one long list.</p>
  <div class="panel">
    <div class="tabs">${tabs}</div>
    ${panels}
  </div>`;
}
function wireS4(){
  const tabKeys = Object.keys(HELP_TABS);
  const visited = new Set([tabKeys[0]]);
  document.querySelectorAll('#app .tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app .tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app .tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app .tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add('active');
      visited.add(btn.dataset.tab);
      if(visited.size >= tabKeys.length) markActivityComplete('s4');
    });
  });
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'staff')));
}

let s5round = 1;
function renderS5(){
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Listen To The Delegate</h2>
  <p class="section-sub">Finding Your Way at Phuket Convention Hall: Mr. Bauer asks Nat for help.</p>
  <div class="panel">
    <div class="playbar">
      <button class="play-btn" id="s5play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY THE CONVERSATION</div>
        <div class="play-sub" id="s5status">Nat (staff) helps Mr. Bauer (delegate) find Ballroom A, the restrooms, registration, and lunch.</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="tb-btn" id="s5pause"><span class="icon-inline">${icon('pause',{size:14})}</span> <span class="lbl">Pause</span></button>
        <button class="tb-btn" id="s5resume"><span class="icon-inline">${icon('play',{size:14})}</span> <span class="lbl">Resume</span></button>
        <button class="tb-btn" id="s5replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
        <button class="tb-btn" id="s5slower"><span class="lbl">Slower</span></button>
      </div>
    </div>
    <div class="tabs" style="margin-top:20px;">
      ${[1,2,3,4,5].map(n=>`<button class="tab-btn${n===1?' active':''}" data-r="${n}">Round ${n}</button>`).join('')}
    </div>
    <div id="s5body" style="margin-top:16px;"></div>
  </div>`;
}
function wireS5(){
  const statusEl = document.getElementById('s5status');
  const playBtn = document.getElementById('s5play');
  const pauseBtn = document.getElementById('s5pause');
  const resumeBtn = document.getElementById('s5resume');
  const replayBtn = document.getElementById('s5replay');
  const slowerBtn = document.getElementById('s5slower');

  VoiceEngine.onChange(()=>{
    if(statusEl){
      statusEl.textContent = VoiceEngine.isPlaying()
        ? (VoiceEngine.isPaused() ? 'Paused' : 'Playing: Nat (staff) helps Mr. Bauer (delegate)…')
        : 'Nat (staff) helps Mr. Bauer (delegate) find Ballroom A, the restrooms, registration, and lunch.';
    }
  });

  playBtn.addEventListener('click', ()=> VoiceEngine.speakConversation(LISTEN.lines));
  replayBtn.addEventListener('click', ()=> VoiceEngine.speakConversation(LISTEN.lines));
  pauseBtn.addEventListener('click', ()=> VoiceEngine.pause());
  resumeBtn.addEventListener('click', ()=> VoiceEngine.resume());
  slowerBtn.addEventListener('click', ()=>{
    VoiceEngine.setSlower(!VoiceEngine.isSlower());
    slowerBtn.classList.toggle('primary', VoiceEngine.isSlower());
    slowerBtn.innerHTML = VoiceEngine.isSlower() ? '<span class="lbl">Slower: On</span>' : '<span class="lbl">Slower</span>';
  });


  const body = document.getElementById('s5body');
  const s5Answered = new Set();
  let s5Correct = 0;
  function showRound(n){
    s5round = n;
    document.querySelectorAll('#app [data-r]').forEach(b=>b.classList.toggle('active', +b.dataset.r===n));
    const r = S5_ROUNDS[n];
    const hideTranscript = n===5;
    body.innerHTML = `
      <p style="font-weight:700;color:var(--orange-deep);">${r.q}</p>
      ${hideTranscript ? '<p style="color:var(--muted);font-size:13px;">Transcript hidden for this round (listening only). Use the Play button above to replay.</p>' : ''}
      <div class="choices" id="s5choices">
        ${r.opts.map((o,i)=>`<button class="choice-btn" data-i="${i}"><span class="letter">${String.fromCharCode(65+i)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" id="s5feedback"></div>
    `;
    document.getElementById('s5choices').addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      const fb = document.getElementById('s5feedback');
      [...document.getElementById('s5choices').children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === r.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else { btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Replay the audio and try again.'; }
      if(!s5Answered.has(n)){
        s5Answered.add(n);
        if(+btn.dataset.i === r.correct) s5Correct++;
        if(s5Answered.size >= 5) markActivityComplete('s5', {score: `${s5Correct}/5`});
      }
    });
  }
  document.querySelectorAll('#app [data-r]').forEach(b=>b.addEventListener('click', ()=>showRound(+b.dataset.r)));
  showRound(1);
}

/* ===== FLOOR PLAN SVG MARKUP =====
   Real proportioned rooms and corridors (not a grid of squares) so the shape a
   student sees on screen matches the walking route described in the script. */
function groundFloorSVG(){
  return `
  <svg class="floorplan-svg" viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg">
    <rect class="fp-outline" x="50" y="30" width="800" height="500" rx="16"/>

    <!-- corridors (drawn first, behind rooms) -->
    <rect class="fp-lobby" x="380" y="150" width="140" height="360" rx="6"/>
    <rect class="fp-corridor" x="450" y="175" width="380" height="60" rx="6"/>
    <rect class="fp-corridor" x="150" y="375" width="300" height="50" rx="6"/>

    <!-- Main Entrance -->
    <rect class="fp-entrance-door" x="415" y="490" width="70" height="14" rx="3"/>
    <text class="fp-label" x="450" y="535" font-size="15" text-anchor="middle">MAIN ENTRANCE</text>

    <!-- Main Lobby label -->
    <text class="fp-sub" x="450" y="470" font-size="13" text-anchor="middle" font-style="italic">Main Lobby</text>

    <!-- Registration Desk (counter inside lobby) -->
    <rect class="fp-room fp-desk" data-room="registration" x="395" y="300" width="110" height="55" rx="4"/>
    <text class="fp-label on-desk" x="450" y="333" font-size="12.5" text-anchor="middle">REGISTRATION</text>

    <!-- Restrooms -->
    <rect class="fp-room" data-room="restrooms" x="130" y="255" width="140" height="115" rx="8"/>
    <text class="fp-label" x="200" y="308" font-size="13" text-anchor="middle">RESTROOMS</text>

    <!-- First Aid -->
    <rect class="fp-room" data-room="firstaid" x="560" y="290" width="120" height="100" rx="8"/>
    <text class="fp-label" x="620" y="335" font-size="12.5" text-anchor="middle">FIRST AID</text>

    <!-- Lift / Escalator -->
    <rect class="fp-room" data-room="liftlobby" x="560" y="380" width="120" height="80" rx="8"/>
    <text class="fp-label" x="620" y="415" font-size="11.5" text-anchor="middle">LIFT /</text>
    <text class="fp-label" x="620" y="430" font-size="11.5" text-anchor="middle">ESCALATOR</text>

    <!-- Fire Exit -->
    <rect class="fp-room" data-room="fireexit" x="80" y="400" width="120" height="80" rx="8" style="stroke:var(--green-safe)"/>
    <text class="fp-label" x="140" y="445" font-size="12" text-anchor="middle" style="fill:var(--green-safe)">FIRE EXIT</text>

    <!-- Main Corridor label -->
    <text class="fp-sub" x="640" y="170" font-size="12" text-anchor="middle" font-style="italic">Main Corridor</text>

    <!-- Ballroom A -->
    <rect class="fp-room" data-room="ballroom" x="680" y="90" width="170" height="150" rx="10"/>
    <text class="fp-label" x="765" y="170" font-size="15" text-anchor="middle">BALLROOM A</text>

    <!-- route + marker (populated by JS) -->
    <path id="routeLine" class="fp-route" d=""/>
    <g id="markerGroup" style="display:none;">
      <circle class="fp-pulse" cx="0" cy="0" r="14"/>
      <circle class="fp-marker" cx="0" cy="0" r="9"/>
    </g>
    <circle class="fp-you-are-here" cx="450" cy="505" r="7"/>
    <text class="fp-sub" x="450" y="490" font-size="10.5" text-anchor="middle">YOU ARE HERE</text>
  </svg>`;
}
function secondFloorSVG(){
  return `
  <svg class="floorplan-svg" viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg">
    <rect class="fp-outline" x="50" y="30" width="800" height="500" rx="16"/>

    <rect class="fp-lobby" x="380" y="150" width="140" height="360" rx="6"/>
    <rect class="fp-corridor" x="380" y="405" width="470" height="50" rx="6"/>

    <rect class="fp-entrance-door" x="415" y="490" width="70" height="14" rx="3"/>
    <text class="fp-label" x="450" y="535" font-size="14" text-anchor="middle">LIFT LOBBY (2F)</text>
    <text class="fp-sub" x="450" y="470" font-size="11.5" text-anchor="middle" font-style="italic">arriving from ground floor</text>

    <!-- Catering / Delegate Dining -->
    <rect class="fp-room" data-room="catering" x="340" y="100" width="220" height="190" rx="10"/>
    <text class="fp-label" x="450" y="190" font-size="14" text-anchor="middle">DELEGATE DINING</text>
    <text class="fp-sub" x="450" y="210" font-size="11" text-anchor="middle" font-style="italic">Catering / Lunch Area</text>

    <!-- VIP Lounge -->
    <rect class="fp-room" data-room="vip" x="630" y="280" width="150" height="160" rx="10"/>
    <text class="fp-label" x="705" y="365" font-size="13.5" text-anchor="middle">VIP LOUNGE</text>

    <!-- Outdoor Terrace -->
    <rect class="fp-room fp-outdoor" data-room="terrace" x="770" y="280" width="140" height="160" rx="10"/>
    <text class="fp-label" x="838" y="360" font-size="12" text-anchor="middle" style="fill:var(--green-safe)">OUTDOOR</text>
    <text class="fp-label" x="838" y="376" font-size="12" text-anchor="middle" style="fill:var(--green-safe)">TERRACE</text>

    <path id="routeLine" class="fp-route" d=""/>
    <g id="markerGroup" style="display:none;">
      <circle class="fp-pulse" cx="0" cy="0" r="14"/>
      <circle class="fp-marker" cx="0" cy="0" r="9"/>
    </g>
    <circle class="fp-you-are-here" cx="450" cy="505" r="7"/>
  </svg>`;
}

function renderS6(){
  const opts = S6_DEST_LIST.map(d=>`<option value="${d.id}">${d.nm}</option>`).join('');
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">The Interactive Map</h2>
  <p class="section-sub">A real floor plan of Phuket International Convention Hall. Choose a destination, and the route draws exactly as Nat would describe it. This same map is used again in Sections 7, 8, and 11.</p>
  <div class="panel">
    <div class="floor-tabs">
      <button class="tab-btn active" id="floorGroundBtn">Ground Floor</button>
      <button class="tab-btn" id="floorSecondBtn">2nd Floor</button>
    </div>
    <div class="map-wrap">
      <p class="fp-scroll-hint">↔ scroll to see the full map</p>
      <div class="floorplan-shell" id="floorplanShell"></div>
    </div>
    <div class="map-controls">
      <label style="font-weight:700;">Destination:</label>
      <select id="destSel">${opts}</select>
      <button class="tb-btn primary" id="showRouteBtn" style="background:var(--teal);border-color:var(--teal);">Show Route</button>
      <button class="tb-btn" id="clearRouteBtn">Clear</button>
    </div>
    <p id="routeText" style="margin-top:14px;color:var(--muted);font-style:italic;"></p>
    <div class="phrase-list" id="routeSteps" style="margin-top:10px;"></div>
    <div class="toast" id="s6toast">You found it!</div>
  </div>`;
}

/* Reusable floor-plan engine — shared by Section 6 AND Practice Set 2, so both
   use the exact same map component instead of building a second map. */
function createFloorplanController(shell, {onFloorChange}={}){
  let currentFloor = 'ground';
  let animTimer = null;

  function pointsToPath(points){
    return points.map((p,i)=> (i===0?'M':'L') + p[0] + ' ' + p[1]).join(' ');
  }
  function drawFloor(floor){
    currentFloor = floor;
    shell.innerHTML = floor==='ground' ? groundFloorSVG() : secondFloorSVG();
    if(onFloorChange) onFloorChange(floor);
  }
  function clear(){
    if(animTimer) cancelAnimationFrame(animTimer);
    const line = shell.querySelector('#routeLine');
    const markerGroup = shell.querySelector('#markerGroup');
    if(line){ line.setAttribute('d',''); }
    if(markerGroup){ markerGroup.style.display='none'; }
    shell.querySelectorAll('.fp-room').forEach(r=>r.classList.remove('is-target'));
  }
  function showRoute(dest, {onDone, speakIt=true}={}){
    const needsFloor = SECOND_FLOOR_DESTS.includes(dest) ? 'second' : 'ground';
    if(needsFloor !== currentFloor){ drawFloor(needsFloor); }
    const data = FLOOR_PATHS[needsFloor][dest];
    if(!data) return null;

    const line = shell.querySelector('#routeLine');
    const markerGroup = shell.querySelector('#markerGroup');
    const targetRoom = shell.querySelector(`.fp-room[data-room="${dest}"]`);
    shell.querySelectorAll('.fp-room').forEach(r=>r.classList.remove('is-target'));

    const d = pointsToPath(data.path);
    line.setAttribute('d', d);
    const len = line.getTotalLength();
    line.style.transition = 'none';
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    line.getBoundingClientRect();
    line.style.transition = `stroke-dashoffset ${Math.min(2.2, 0.55 + len/500)}s ease-in-out`;
    line.style.strokeDashoffset = 0;

    markerGroup.style.display = '';
    const duration = Math.min(2200, 550 + len*1.8);
    const start = performance.now();
    if(animTimer) cancelAnimationFrame(animTimer);
    function step(now){
      const t = Math.min(1, (now-start)/duration);
      const pt = line.getPointAtLength(t*len);
      markerGroup.setAttribute('transform', `translate(${pt.x},${pt.y})`);
      if(t<1){ animTimer = requestAnimationFrame(step); }
      else{
        if(targetRoom) targetRoom.classList.add('is-target');
        if(onDone) onDone(data);
      }
    }
    animTimer = requestAnimationFrame(step);
    if(speakIt) speak(data.text,'staff');
    return data;
  }
  drawFloor('ground');
  return { drawFloor, showRoute, clear, getFloor:()=>currentFloor };
}

function wireS6(){
  const shell = document.getElementById('floorplanShell');
  const destSel = document.getElementById('destSel');
  const routeText = document.getElementById('routeText');
  const routeSteps = document.getElementById('routeSteps');
  const toast = document.getElementById('s6toast');
  const floorGroundBtn = document.getElementById('floorGroundBtn');
  const floorSecondBtn = document.getElementById('floorSecondBtn');

  const fp = createFloorplanController(shell, {
    onFloorChange: floor=>{
      floorGroundBtn.classList.toggle('active', floor==='ground');
      floorSecondBtn.classList.toggle('active', floor==='second');
    }
  });

  const s6Found = new Set();
  function clearAll(){
    fp.clear();
    routeText.textContent=''; routeSteps.innerHTML=''; toast.classList.remove('show');
  }
  floorGroundBtn.addEventListener('click', ()=>{ clearAll(); fp.drawFloor('ground'); });
  floorSecondBtn.addEventListener('click', ()=>{ clearAll(); fp.drawFloor('second'); });
  document.getElementById('showRouteBtn').addEventListener('click', ()=>{
    toast.classList.remove('show');
    const data = fp.showRoute(destSel.value, {
      onDone: ()=>{
        toast.classList.add('show');
        s6Found.add(destSel.value);
        markActivityComplete('s6', {score: `${s6Found.size}/${S6_DEST_LIST.length}`});
      }
    });
    if(data){
      routeText.textContent = data.text;
      routeSteps.innerHTML = data.steps.map(s=>`<div class="phrase-card" style="justify-content:center;"><span class="txt">${s}</span></div>`).join('');
    }
  });
  document.getElementById('clearRouteBtn').addEventListener('click', clearAll);
}

function renderS7(){
  const nav = [1,2,3,4].map(n=>`<button class="tab-btn${n===1?' active':''}" data-lvl="${n}">${S7_LEVELS[n].title}</button>`).join('');
  const panels = [1,2,3,4].map(n=>`<div class="tab-panel${n===1?' active':''}" data-lvlpanel="${n}">${S7_LEVELS[n].body}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Say It Yourself</h2>
  <p class="section-sub">From full support to a real, unscripted request. Say every answer aloud.</p>
  <div class="panel">
    <div class="tabs level-nav">${nav}</div>
    ${panels}
  </div>`;
}
function wireS7(){
  const visitedLevels = new Set(['1']);
  document.querySelectorAll('#app [data-lvl]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-lvl]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-lvlpanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-lvlpanel="${btn.dataset.lvl}"]`).classList.add('active');
      visitedLevels.add(btn.dataset.lvl);
      if(visitedLevels.size >= 4) markActivityComplete('s7'); // completion only — no auto speaking score
    });
  });
  document.querySelectorAll('#app [data-reveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = document.getElementById(btn.dataset.reveal);
      target.classList.toggle('show');
    });
  });
  const l1check = document.getElementById('l1check');
  if(l1check){
    l1check.addEventListener('click', ()=>{
      const a=document.getElementById('l1a').value.trim().toLowerCase();
      const b=document.getElementById('l1b').value.trim().toLowerCase();
      const c=document.getElementById('l1c').value.trim().toLowerCase();
      const fb = document.getElementById('l1fb');
      fb.classList.add('show');
      const okA = a.includes('straight'); const okB = b.includes('right')||b.includes('left'); const okC = c.includes('corridor')||c.includes('end');
      fb.textContent = (okA&&okB&&okC)
        ? 'Great! A natural version: "Go straight ahead and turn right at the end of the corridor."'
        : 'Close. Try direction words like "straight", "left/right", and a landmark like "corridor". Model: "Go straight ahead and turn right at the end of the corridor."';
    });
  }
  function newL4(){
    const p = L4_PROMPTS[Math.floor(Math.random()*L4_PROMPTS.length)];
    document.getElementById('l4prompt').textContent = p.q;
    const model = document.getElementById('l4model');
    model.textContent = p.a; model.classList.remove('show');
  }
  const l4new = document.getElementById('l4new');
  if(l4new){ l4new.addEventListener('click', newL4); newL4(); }
}

function renderS8(){
  return `
  <div class="section-eyebrow">Section 8</div>
  <h2 class="section-title">Information Gap</h2>
  <p class="section-sub">Pair speaking. Student A has the map. Student B does not look at it. Only one screen should be visible per student.</p>
  <div class="panel">
    <div class="ab-toggle">
      <button class="ab-btn active" data-ab="A">Show Student A: Venue Staff</button>
      <button class="ab-btn" data-ab="B">Show Student B: Delegate</button>
    </div>
    <div class="ab-view show" id="abA">
      <h3 style="color:var(--navy);font-size:16px;">Student A, you have the map</h3>
      <p>Use the Interactive Map from Section 6 to give directions. Do not show your screen to Student B.</p>
      <div class="phrase-list">
        <div class="phrase-card"><span class="txt">"Of course! Go straight ahead and…"</span></div>
        <div class="phrase-card"><span class="txt">"Take the elevator / escalator to…"</span></div>
        <div class="phrase-card"><span class="txt">"It's just past / next to / opposite the…"</span></div>
        <div class="phrase-card"><span class="txt">"Would you like me to walk with you?"</span></div>
      </div>
    </div>
    <div class="ab-view" id="abB">
      <h3 style="color:var(--navy);font-size:16px;">Student B, you do NOT have the map</h3>
      <p>Ask Student A for directions. Listen carefully and try to find the destination without looking at any map.</p>
      <div class="phrase-list">
        <div class="phrase-card"><span class="txt">"Excuse me, could you tell me where ___ is?"</span></div>
        <div class="phrase-card"><span class="txt">"Could you repeat that, please?"</span></div>
        <div class="phrase-card"><span class="txt">"So I go straight and then…?"</span></div>
        <div class="phrase-card"><span class="txt">"Thank you so much, that's very helpful!"</span></div>
      </div>
    </div>
    <hr class="hairline">
    <p style="color:var(--muted);font-size:13px;">Now switch roles and choose a new destination.</p>
  </div>`;
}
function wireS8(){
  const seenRoles = new Set(['A']);
  document.querySelectorAll('#app .ab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app .ab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app .ab-view').forEach(v=>v.classList.remove('show'));
      btn.classList.add('active');
      document.getElementById('ab'+btn.dataset.ab).classList.add('show');
      seenRoles.add(btn.dataset.ab);
      if(seenRoles.size >= 2) markActivityComplete('s8'); // pair speaking — completion only
    });
  });
}

function renderS9(){
  const cards = SITUATIONS.map((s,i)=>`
    <div class="sit-card">
      <div style="font-family:'Oswald';font-size:12px;letter-spacing:.08em;color:var(--orange-deep);">${s.tag}</div>
      <p class="visitor">Visitor: ${s.visitor}</p>
      <p style="color:var(--muted)">${s.task}</p>
      <button class="reveal-btn" data-reveal="sit${i}">Show model response</button>
      <div class="model-answer" id="sit${i}">${s.model}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">Something Went Wrong</h2>
  <p class="section-sub">Real MICE conversations aren't always perfect. Practice repair, confirmation, and honesty.</p>
  <div class="panel">${cards}</div>`;
}
function wireS9(){
  const revealed = new Set();
  document.querySelectorAll('#app [data-reveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.reveal).classList.toggle('show');
      revealed.add(btn.dataset.reveal);
      if(revealed.size >= SITUATIONS.length) markActivityComplete('s9'); // communication repair — completion only
    });
  });
}

function renderS10(){
  const cards = ROLEPLAYS.map((r,i)=>`
    <div class="role-card" data-i="${i}">
      <div class="icon">${r.ic}</div>
      <h4>${r.title}</h4>
      <div class="role-body">
        <p><b>Role:</b> ${r.role}</p>
        <p><b>Situation:</b> ${r.situation}</p>
        <p><b>Destination:</b> ${r.dest}</p>
        <p><b>Challenge:</b> ${r.challenge}</p>
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 10</div>
  <h2 class="section-title">Real MICE Role-Play</h2>
  <p class="section-sub">Click a card for the role details. No scripted dialogue: students create the conversation.</p>
  <div class="panel"><div class="role-grid">${cards}</div></div>`;
}
function wireS10(){
  const opened = new Set();
  document.querySelectorAll('#app .role-card').forEach(c=>c.addEventListener('click', ()=>{
    c.classList.toggle('open');
    opened.add(c.dataset.i);
    if(opened.size >= ROLEPLAYS.length) markActivityComplete('s10'); // role-play — completion only
  }));
}

/* ===================== PRACTICE SETS (Section 11) ===================== */
/* One section, four tabs: Quick Review / Follow the Route / Listen & Choose / Say It Yourself.
   "Can I use what I just learned?" — quick, low-stakes, reuses existing components
   (the same floor plan, the same VoiceEngine) rather than inventing new ones. */
function renderPractice(){
  const quizCards = QUICK_REVIEW.map((item,i)=>`
    <div class="sit-card" data-quiz="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${item.q}</p>
      <div class="choices" data-qchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-qfb="${i}"></div>
    </div>`).join('');

  const routeCards = PRACTICE_ROUTES.map((r,i)=>`
    <div class="sit-card" data-route="${i}">
      <div style="font-family:'Oswald';font-size:12px;letter-spacing:.08em;color:var(--orange-deep);">${r.level}</div>
      <ul style="margin:8px 0 4px 18px;color:var(--ink);">${r.instructions.map(s=>`<li>${s}</li>`).join('')}</ul>
      <p style="font-weight:700;margin-top:10px;">Where do you arrive?</p>
      <div class="choices" data-rchoices="${i}">
        ${r.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-rfb="${i}"></div>
      <button class="reveal-btn" data-showmap="${i}" style="margin-top:10px;">Show route on the map</button>
    </div>`).join('');
  const routeMapBlock = `
    <div class="panel" style="margin-top:18px;background:var(--cream);">
      <div class="floor-tabs" id="prFloorTabs">
        <span style="font-family:'Oswald';font-size:12px;color:var(--muted);align-self:center;">Map view:</span>
        <button class="tab-btn active" id="prFloorGround">Ground Floor</button>
        <button class="tab-btn" id="prFloorSecond">2nd Floor</button>
      </div>
      <div class="map-wrap"><p class="fp-scroll-hint">↔ scroll to see the full map</p><div class="floorplan-shell" id="prFloorplanShell"></div></div>
      <p id="prRouteText" style="margin-top:12px;color:var(--muted);font-style:italic;"></p>
    </div>`;

  const listenCards = LISTEN_CHOOSE.map((item,i)=>`
    <div class="sit-card" data-listen="${i}">
      <div style="font-family:'Oswald';font-size:12px;letter-spacing:.08em;color:var(--orange-deep);">Situation ${i+1}</div>
      <div class="playbar" style="margin-top:10px;padding:12px 16px;">
        <button class="play-btn" style="width:44px;height:44px;font-size:17px;" data-lplay="${i}">${icon('play',{size:17})}</button>
        <div style="flex:1;"><div class="play-sub" data-lstatus="${i}">Listen first. The transcript is hidden.</div></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="tb-btn" data-lpause="${i}" style="padding:8px 12px;">${icon('pause',{size:14})}</button>
          <button class="tb-btn" data-lreplay="${i}" style="padding:8px 12px;">${icon('rotateCcw',{size:14})}</button>
          <button class="tb-btn" data-lslower="${i}" style="padding:8px 12px;">Slow</button>
        </div>
      </div>
      <p style="font-weight:700;margin-top:12px;">${item.q}</p>
      <div class="choices" data-lchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-lfb="${i}"></div>
      <button class="reveal-btn" data-ltranscript="${i}" style="margin-top:8px;">Show transcript</button>
      <div class="model-answer" data-ltx="${i}">
        ${item.lines.map(l=>`<div><b>${l.who==='Nat'?'Nat (staff)':'Mr. Bauer (delegate)'}:</b> ${l.text}</div>`).join('')}
      </div>
    </div>`).join('');

  const speakCards = SAY_YOURSELF_PRACTICE.map((s,i)=>`
    <div class="sit-card" data-speak="${i}">
      <div style="font-family:'Oswald';font-size:11px;letter-spacing:.08em;color:var(--teal);">${s.support.toUpperCase()}</div>
      <p class="visitor" style="margin-top:6px;">Visitor: ${s.visitor}</p>
      ${s.hint ? `<div class="keyword-row" style="margin:10px 0;"><span class="kw">${s.hint.split(' → ')[0]}</span><span class="kw-arrow">→</span><span class="kw">${s.hint.split(' → ')[1]}</span></div>` : '<p style="color:var(--muted);font-size:13px;">No keyword hint. Use the Interactive Map (Section 6) if you need to check the route.</p>'}
      <p style="font-weight:700;color:var(--orange-deep);">Answer aloud.</p>
      <button class="reveal-btn" data-showmodel="${i}">Show Model Answer</button>
      <div class="model-answer" data-modeltx="${i}">${s.model}</div>
    </div>`).join('');

  return `
  <div class="section-eyebrow">Section 11</div>
  <h2 class="section-title">Practice Sets</h2>
  <p class="section-sub">Review • Listen • Speak • Apply: can you use what you just learned?</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-ptab="review">1. Quick Review</button>
      <button class="tab-btn" data-ptab="route">2. Follow the Route</button>
      <button class="tab-btn" data-ptab="listen">3. Listen &amp; Choose</button>
      <button class="tab-btn" data-ptab="speak">4. Say It Yourself</button>
    </div>

    <div class="tab-panel active" data-ppanel="review">${quizCards}</div>

    <div class="tab-panel" data-ppanel="route">${routeCards}${routeMapBlock}</div>

    <div class="tab-panel" data-ppanel="listen">${listenCards}</div>

    <div class="tab-panel" data-ppanel="speak">
      ${speakCards}
      <p style="color:var(--muted);font-size:12px;margin-top:10px;">This site cannot grade your pronunciation. Say your answer aloud and ask your teacher or partner to check it.</p>
    </div>
  </div>`;
}

function wirePractice(){
  // ---- progress tracking state for this Practice Sets visit ----
  const qrAnswered = new Set(); let qrCorrect = 0;
  const routeAnswered = new Set(); let routeCorrect = 0;
  const lcAnswered = new Set(); let lcCorrect = 0;
  const sayRevealed = new Set();
  function checkPracticeOverall(){
    // The section is marked complete once both objectively-scored tabs (Quick
    // Review, Follow the Route) are finished; Listen & Choose / Say It Yourself
    // send their own granular records independently as students work through them.
    if(qrAnswered.size >= QUICK_REVIEW.length && routeAnswered.size >= PRACTICE_ROUTES.length){
      markActivityComplete('practice', {score: `QR ${qrCorrect}/${QUICK_REVIEW.length} · Route ${routeCorrect}/${PRACTICE_ROUTES.length}`});
    }
  }

  // tab switching
  document.querySelectorAll('#app [data-ptab]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-ptab]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-ppanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-ppanel="${btn.dataset.ptab}"]`).classList.add('active');
    });
  });

  // ---- Practice 1: Quick Review ----
  QUICK_REVIEW.forEach((item,i)=>{
    const box = document.querySelector(`[data-qchoices="${i}"]`);
    const fb = document.querySelector(`[data-qfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Try again.'; }
      if(!qrAnswered.has(i)){
        qrAnswered.add(i);
        if(+btn.dataset.i === item.correct) qrCorrect++;
        if(qrAnswered.size >= QUICK_REVIEW.length){
          sendGranularRecord('Practice: Quick Review', {score: `${qrCorrect}/${QUICK_REVIEW.length}`});
          checkPracticeOverall();
        }
      }
    });
  });

  // ---- Practice 2: Follow the Route (reuses the Section 6 floor-plan engine) ----
  const prShell = document.getElementById('prFloorplanShell');
  const prFloorGround = document.getElementById('prFloorGround');
  const prFloorSecond = document.getElementById('prFloorSecond');
  const prRouteText = document.getElementById('prRouteText');
  const prFp = createFloorplanController(prShell, {
    onFloorChange: floor=>{
      prFloorGround.classList.toggle('active', floor==='ground');
      prFloorSecond.classList.toggle('active', floor==='second');
    }
  });
  prFloorGround.addEventListener('click', ()=>{ prFp.clear(); prFp.drawFloor('ground'); prRouteText.textContent=''; });
  prFloorSecond.addEventListener('click', ()=>{ prFp.clear(); prFp.drawFloor('second'); prRouteText.textContent=''; });

  PRACTICE_ROUTES.forEach((r,i)=>{
    const box = document.querySelector(`[data-rchoices="${i}"]`);
    const fb = document.querySelector(`[data-rfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      const chosenName = r.opts[+btn.dataset.i];
      if(chosenName === DEST_NAME[r.dest]){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct! Click "Show route on the map" to see it.'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Try again, or reveal the route on the map.'; }
      if(!routeAnswered.has(i)){
        routeAnswered.add(i);
        if(chosenName === DEST_NAME[r.dest]) routeCorrect++;
        if(routeAnswered.size >= PRACTICE_ROUTES.length){
          sendGranularRecord('Practice: Follow the Route', {score: `${routeCorrect}/${PRACTICE_ROUTES.length}`});
          checkPracticeOverall();
        }
      }
    });
    document.querySelector(`[data-showmap="${i}"]`).addEventListener('click', ()=>{
      prFp.clear();
      prFp.showRoute(r.dest, { onDone: ()=>{ prRouteText.textContent = `${DEST_NAME[r.dest]}: ${FLOOR_PATHS[r.floor][r.dest].text}`; } } );
      document.querySelector(`[data-route="${i}"]`).scrollIntoView({behavior:'smooth', block:'nearest'});
    });
  });

  // ---- Practice 3: Listen & Choose ----
  LISTEN_CHOOSE.forEach((item,i)=>{
    const statusEl = document.querySelector(`[data-lstatus="${i}"]`);
    let slower = false;
    document.querySelector(`[data-lplay="${i}"]`).addEventListener('click', ()=>{
      VoiceEngine.setSlower(slower);
      statusEl.textContent = 'Playing…';
      VoiceEngine.speakConversation(item.lines);
    });
    document.querySelector(`[data-lreplay="${i}"]`).addEventListener('click', ()=>{
      VoiceEngine.setSlower(slower);
      statusEl.textContent = 'Playing…';
      VoiceEngine.speakConversation(item.lines);
    });
    document.querySelector(`[data-lpause="${i}"]`).addEventListener('click', ()=> VoiceEngine.pause());
    document.querySelector(`[data-lslower="${i}"]`).addEventListener('click', (e)=>{
      slower = !slower; e.target.closest('button').classList.toggle('primary', slower);
    });
    VoiceEngine.onChange(()=>{
      if(!VoiceEngine.isPlaying()) statusEl.textContent = 'Listen first. The transcript is hidden.';
    });
    const box = document.querySelector(`[data-lchoices="${i}"]`);
    const fb = document.querySelector(`[data-lfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Listen again and try once more.'; }
      if(!lcAnswered.has(i)){
        lcAnswered.add(i);
        if(+btn.dataset.i === item.correct) lcCorrect++;
        if(lcAnswered.size >= LISTEN_CHOOSE.length){
          sendGranularRecord('Practice: Listen & Choose', {score: `${lcCorrect}/${LISTEN_CHOOSE.length}`});
        }
      }
    });
    document.querySelector(`[data-ltranscript="${i}"]`).addEventListener('click', ()=>{
      document.querySelector(`[data-ltx="${i}"]`).classList.toggle('show');
    });
  });

  // ---- Practice 4: Say It Yourself ----
  document.querySelectorAll('#app [data-showmodel]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelector(`[data-modeltx="${btn.dataset.showmodel}"]`).classList.toggle('show');
      sayRevealed.add(btn.dataset.showmodel);
      if(sayRevealed.size >= SAY_YOURSELF_PRACTICE.length){
        sendGranularRecord('Practice: Say It Yourself', {completionStatus:'completed'}); // speaking — completion only
      }
    });
  });
}

function renderS11(){
  return `
  <div class="section-eyebrow">Section 12</div>
  <h2 class="section-title">Final Challenge: You Are The MICE Staff</h2>
  <p class="section-sub">Graded pair-task preparation. Can you perform this in a realistic MICE situation? Student B asks for four locations, without looking at the map.</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-round="1">Round 1</button>
      <button class="tab-btn" data-round="2">Round 2</button>
    </div>
    <div class="tab-panel active" data-roundpanel="1">
      <h3 style="font-size:16px;color:var(--navy);">Round 1: Student B asks for:</h3>
      <div class="phrase-list">
        <div class="phrase-card"><span class="txt">1. Ballroom A / main plenary hall</span></div>
        <div class="phrase-card"><span class="txt">2. Registration desk</span></div>
        <div class="phrase-card"><span class="txt">3. Nearest restrooms</span></div>
        <div class="phrase-card"><span class="txt">4. Catering / lunch area</span></div>
      </div>
    </div>
    <div class="tab-panel" data-roundpanel="2">
      <h3 style="font-size:16px;color:var(--navy);">Round 2: roles switch. New Student B asks for:</h3>
      <div class="phrase-list">
        <div class="phrase-card"><span class="txt">1. VIP lounge</span></div>
        <div class="phrase-card"><span class="txt">2. Outdoor terrace / wellness area</span></div>
        <div class="phrase-card"><span class="txt">3. First aid station</span></div>
        <div class="phrase-card"><span class="txt">4. Nearest fire exit</span></div>
      </div>
    </div>
    <hr class="hairline">
    <p style="color:var(--muted);font-size:13px;">Teacher observes both rounds using the Speaking Rubric (Fluency, Pronunciation, Vocabulary, Interaction, Professionalism).</p>
  </div>`;
}
function wireS11(){
  const viewedRounds = new Set(['1']);
  document.querySelectorAll('#app [data-round]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-round]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-roundpanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-roundpanel="${btn.dataset.round}"]`).classList.add('active');
      viewedRounds.add(btn.dataset.round);
      // "Reached", not "completed" — this is a live, teacher-graded speaking task.
      // The actual score is entered by the teacher separately (see rubric, Section 13).
      if(viewedRounds.size >= 2) markActivityComplete('s11', {completionStatus:'reached'});
    });
  });
}

function renderS12(){
  const rows = RUBRIC.map(r=>`
    <div class="rubric-row">
      <div><div class="lbl">${r.lbl}</div><div class="sub">${r.sub}</div></div>
      <div class="rate" data-k="${r.k}">
        ${[1,2,3].map(n=>`<button data-n="${n}">${n}</button>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 13</div>
  <h2 class="section-title">Self-Check &amp; Take Home</h2>
  <p class="section-sub">After your role-play, rate yourself honestly. Your teacher remains the final evaluator.</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this lesson, you should feel more confident helping an international guest find their way around a MICE venue in English.</p>
  </div>

  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">Giving Directions at Events: Quick Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review the key vocabulary, direction expressions, useful phrases, and professional MICE communication tips from Unit 5.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="Giving Directions at Events: Quick Guide preview" class="guide-thumb" loading="lazy">
    <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="downloadGuideBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Giving Directions Study Guide</a>
  </div>`;
}
function wireS12(){
  const rateGroups = document.querySelectorAll('#app .rate');
  document.querySelectorAll('#app .rate').forEach(rate=>{
    rate.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...rate.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      const ratedCount = [...rateGroups].filter(r => r.querySelector('.sel')).length;
      if(ratedCount >= rateGroups.length){
        // Student self-assessment only — the teacher remains the evaluator for the
        // actual speaking score (see Final Challenge / rubric above).
        markActivityComplete('s12', {score: `self-rated ${ratedCount}/${rateGroups.length}`});
      }
    });
  });
}

/* ===================== COMPLETE (final end screen) ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 5 COMPLETE</div>
    <h1>You're ready to <span>help your guests.</span></h1>
    <p>Review the guide, practice the phrases, and use English confidently in a MICE venue.</p>
    <div class="complete-actions">
      <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="completeDownloadBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
      <button class="tb-btn primary" id="completePracticeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('rotateCcw',{size:16})}</span> Practice Again</button>
      <button class="tb-btn" id="completeHomeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('home',{size:16})}</span> Back to Start</button>
      <a class="tb-btn" id="completeUnitsBtn" href="../index.html" style="padding:16px 26px;font-size:15px;">All MICE Units</a>
    </div>
    <div class="complete-stats" id="completeStats"></div>
  </div>`;
}
let lessonCompleteSent = false;
function wireComplete(){
  document.getElementById('completePracticeBtn').addEventListener('click', ()=> goTo(11));
  document.getElementById('completeHomeBtn').addEventListener('click', ()=> goTo(0));

  const stats = document.getElementById('completeStats');
  if(stats){
    const listening = Progress.activities['s5'] ? 'Yes' : 'No';
    const practice = Progress.activities['practice'] ? 'Yes' : 'No';
    stats.innerHTML = `
      <p class="complete-stats-intro">Your progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Activities Completed</div></div>
        <div class="complete-stat"><div class="num">${practice}</div><div class="lbl">Practice Completed</div></div>
        <div class="complete-stat"><div class="num">${listening}</div><div class="lbl">Listening Completed</div></div>
      </div>`;
  }
  if(!lessonCompleteSent && Progress.studentId){
    lessonCompleteSent = true;
    sendProgressRecord(buildRecord('Lesson Complete', {score: `${completedCount()}/${TRACKED_ACTIVITIES.length}`, completionStatus:'completed'}));
  }
}


const RENDERERS = [
  {r:renderCover, w:null},
  {r:renderS1, w:wireS1},
  {r:renderS2, w:wireS2},
  {r:renderS3, w:wireS3},
  {r:renderS4, w:wireS4},
  {r:renderS5, w:wireS5},
  {r:renderS6, w:wireS6},
  {r:renderS7, w:wireS7},
  {r:renderS8, w:wireS8},
  {r:renderS9, w:wireS9},
  {r:renderS10, w:wireS10},
  {r:renderPractice, w:wirePractice},
  {r:renderS11, w:wireS11},
  {r:renderS12, w:wireS12},
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
  buildProgress();
  app.innerHTML = RENDERERS[current].r();
  const isLast = current===RENDERERS.length-1;
  if(current>0 && !isLast){
    app.innerHTML += `<div class="navfoot">
      <button class="tb-btn" id="footPrev">← Back</button>
      <button class="tb-btn primary" id="footNext">Next →</button>
    </div>`;
  }
  if(RENDERERS[current].w) RENDERERS[current].w();
  document.getElementById('btnPrev').disabled = current===0;
  document.getElementById('btnNext').disabled = isLast;
  const fp=document.getElementById('footPrev'), fn=document.getElementById('footNext');
  if(fp) fp.addEventListener('click', goPrev);
  if(fn) fn.addEventListener('click', goNext);
  window.scrollTo({top:0, behavior:'smooth'});
}
function goNext(){ if(current<RENDERERS.length-1){ current++; renderAll(); } }
function goPrev(){ if(current>0){ current--; renderAll(); } }
function goTo(i){ current = Math.max(0, Math.min(RENDERERS.length-1, i)); renderAll(); }

document.getElementById('btnNext').addEventListener('click', goNext);
document.getElementById('btnPrev').addEventListener('click', goPrev);
document.getElementById('btnHome').addEventListener('click', ()=>{ current=0; renderAll(); });
document.getElementById('btnReset').addEventListener('click', renderAll);

renderAll();
wireCheckin();
