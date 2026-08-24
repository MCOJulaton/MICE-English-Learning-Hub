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
   Same architecture as the rest of the English Learning Hub: this page ->
   Google Apps Script Web App -> Google Sheets. Paste a deployed Apps
   Script Web App URL below to go live. Until then, nothing is sent
   anywhere, and nothing pretends to have been saved.

   Record shape sent by every call to sendProgressRecord():
   { studentId, studentName, course, unit, date, timestamp, activity, score, completionStatus } */
const DATA_ENDPOINT = "https://script.google.com/macros/s/AKfycbxDECOuXf3HMxPVLT1fhfOHE5g-Gq1juG5enaCoUrShk9vEMfctgy-URKmqmvPGeoE/exec";

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','practice','s11','s12'];

const Progress = {
  studentId:'', firstName:'', lastName:'', studentName:'',
  date:'', startTime:'',
  activities:{}
};
let pendingRecords = [];

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

function sendProgressRecord(record){
  if(!isEndpointConfigured()){
    pendingRecords.push(record);
    return;
  }
  fetch(DATA_ENDPOINT, {
    method:'POST',
    mode:'no-cors',
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
setInterval(flushPendingRecords, 20000);

function markActivityComplete(key, opts={}){
  const score = opts.score ?? null;
  const completionStatus = opts.completionStatus || 'completed';
  const prev = Progress.activities[key];
  if(prev && prev.completionStatus===completionStatus && prev.score===score) return;
  Progress.activities[key] = { status:completionStatus, score, completionStatus };
  sendProgressRecord(buildRecord(key, {score, completionStatus}));
  updateTopbarBadge();
}
function sendGranularRecord(label, opts={}){
  sendProgressRecord(buildRecord(label, {score: opts.score ?? null, completionStatus: opts.completionStatus || 'completed'}));
}
function completedCount(){
  return TRACKED_ACTIVITIES.filter(k => Progress.activities[k]).length;
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
  let voiceA = null, voiceB = null;
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
    const femaleA = allVoices.find(v => /google us english/i.test(v.name))
                  || allVoices.find(v => /samantha|ava|zoe|aria/i.test(v.name));
    const femaleB = allVoices.find(v => /google uk english female/i.test(v.name))
                  || allVoices.find(v => /^en-gb$/i.test(v.lang) && /female/i.test(v.name))
                  || allVoices.find(v => /^en-gb$/i.test(v.lang));
    const ranked = [...allVoices].sort((a,b)=> scoreVoice(b)-scoreVoice(a));
    voiceA = femaleA || ranked[0] || allVoices[0] || null;
    voiceB = femaleB || ranked[1] || allVoices[1] || allVoices[0] || null;
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
    const voice = kind==='b' ? voiceB : voiceA;
    if(voice) u.voice = voice;
    u.lang = 'en-US';
    u.rate = (slower ? 0.86 : 1.0);
    u.pitch = kind==='b' ? 1.04 : 0.98;
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
        setTimeout(playNext, 420);
        return;
      }
      const u = makeUtterance(sentences[sIdx], item.kind);
      u.onend = ()=>{ sIdx++; setTimeout(playSentence, 160); };
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
    speakLine(text, kind){
      this.stop();
      queue = [{text, kind: kind||'a'}];
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
    speakConversation(lines){
      this.stop();
      queue = lines.map(l=>({text:l.text, kind: l.who==='Narumon' ? 'b' : 'a'}));
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
    pause(){ if(playing && !paused){ window.speechSynthesis.pause(); paused=true; onStateChange(); } },
    resume(){ if(playing && paused){ window.speechSynthesis.resume(); paused=false; onStateChange(); } },
    stop(){ window.speechSynthesis.cancel(); playing=false; paused=false; queue=[]; queueIndex=0; onStateChange(); }
  };
})();

function speak(text, kind){
  if(!('speechSynthesis' in window)) { alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakLine(text, kind==='b' ? 'b' : 'a');
}

function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">PHUKET TOURISM INTERNATIONAL CONVENTION</div>
    <h1>Make the first word <span>count.</span></h1>
    <p>Unit 4: Professional Greetings and Networking. Practice real-world greetings, the "Because Bridge," and confident small talk, then put it all to work meeting people at a simulated MICE expo.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Introduction</div>
      <div class="signchip"><span class="arrow">→</span> Icebreaker</div>
      <div class="signchip"><span class="arrow">→</span> Because Bridge</div>
      <div class="signchip"><span class="arrow">→</span> The Close</div>
    </div>
    <button class="startbtn" onclick="goNext()">Start networking →</button>
  </div>`;
}

function renderS1(){
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">First Impressions</h2>
  <p class="section-sub">Two professionals are meeting for the first time at a MICE networking reception. Which greeting is the most professional?</p>
  <div class="panel">
    <img class="venue-photo" src="${SECTION_PHOTOS.warmup.src}" alt="${SECTION_PHOTOS.warmup.alt}" loading="lazy" style="margin-bottom:22px;">
    <div class="choices" id="s1choices">
      <button class="choice-btn" data-v="wrong"><span class="letter">A</span> They walk up with their hands in their pockets, glance at their phone, and mutter "hey" without much eye contact.</button>
      <button class="choice-btn" data-v="right"><span class="letter">B</span> They approach with a warm smile, steady eye contact, a firm handshake, and say "Hi, I'm [name] from [company]."</button>
      <button class="choice-btn" data-v="wrong"><span class="letter">C</span> They wave and shout a greeting from across the room without actually approaching.</button>
    </div>
    <div class="feedback" id="s1feedback"></div>
    <hr class="hairline">
    <h3 style="font-size:16px;color:var(--navy)">Did You Know?</h3>
    <div class="phrase-list" style="margin-top:12px;">
      <div class="phrase-card"><span class="txt">First impressions are formed within 7 seconds of meeting someone.</span></div>
      <div class="phrase-card"><span class="txt">Using a person's name during a conversation makes them feel valued and remembered.</span></div>
      <div class="phrase-card"><span class="txt">A firm handshake, steady eye contact, and a warm smile all signal confidence and professionalism.</span></div>
      <div class="phrase-card"><span class="txt">Exchanging business cards is an important ritual across much of Asia, including Japan, Korea, and China.</span></div>
    </div>
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
      fb.textContent='Exactly. Warm, confident, and it gives your name AND your company right away. This is the professional standard for MICE networking.';
    } else {
      btn.classList.add('wrong');
      fb.className='feedback show meh';
      fb.textContent='Not quite professional enough. Try option B. Approach warmly and introduce yourself clearly.';
    }
    markActivityComplete('s1');
  });
}

function renderS2(){
  const cards = VOCAB.map(v=>`
    <div class="loc-card" data-id="${v.id}">
      <div class="ic">${v.ic}</div>
      <div class="nm">${v.nm}</div>
      <div class="loc-detail">
        <span style="font-family:'Oswald';font-size:11px;color:var(--muted);">${v.type}</span><br>
        ${v.def}<br>
        <span style="color:var(--orange-deep);">${v.ex}</span>
        <br><button class="audio-mini" data-say="${v.ex.replace(/"/g,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Key Vocabulary</h2>
  <p class="section-sub">Click a word to see its definition, hear it, and read an example sentence.</p>
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
    const pick = VOCAB[Math.floor(Math.random()*VOCAB.length)];
    s2target = pick.id;
    qEl.textContent = `Which word means: "${pick.def}"`;
    fb.className='feedback';
  }
  newQuestion();
  grid.addEventListener('click', e=>{
    const audioBtn = e.target.closest('.audio-mini');
    if(audioBtn){ speak(audioBtn.dataset.say,'a'); e.stopPropagation(); return; }
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
        fb.className='feedback show meh'; fb.textContent='That\'s a word, but not the one asked for. Keep looking!';
      }
    }
  });
}

function renderS3(){
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">The "Because Bridge"</h2>
  <p class="section-sub">${BRIDGE.scene}</p>
  <div class="panel">
    <div class="scene">
      <div class="avatar delegate">${icon('user',{size:36})}</div>
      <div class="bubble">${BRIDGE.prompt}</div>
    </div>
    <hr class="hairline">
    <p style="font-family:'Oswald';font-size:20px;color:var(--navy);text-align:center;letter-spacing:.02em;">${BRIDGE.formula}</p>
    <div class="phrase-list" style="margin-top:18px;">
      <div class="phrase-card"><span class="txt">You say: ${BRIDGE.youSay}</span></div>
      <div class="phrase-card"><span class="txt">They reply: ${BRIDGE.theyReply}</span></div>
    </div>
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">Your Turn: Hint Words</h3>
    <div class="keyword-row">
      ${BRIDGE.hintWords.map(w=>`<span class="kw">${w.toUpperCase()}</span>`).join('<span class="kw-arrow">·</span>')}
    </div>
    <p style="margin-top:10px;color:var(--muted);font-size:13.5px;font-style:italic;">${BRIDGE.tip}</p>
  </div>

  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy)">Bridge Check</h3>
    <p class="section-sub" style="margin-top:6px;">Which response uses the Because Bridge, a reason PLUS a door-opener for the next question?</p>
    <div class="tabs" style="margin-top:16px;">
      ${[1,2,3].map(n=>`<button class="tab-btn${n===1?' active':''}" data-br="${n}">Round ${n}</button>`).join('')}
    </div>
    <div id="s3body" style="margin-top:16px;"></div>
  </div>`;
}
function wireS3(){
  const body = document.getElementById('s3body');
  const s3Answered = new Set();
  function showRound(n){
    document.querySelectorAll('#app [data-br]').forEach(b=>b.classList.toggle('active', +b.dataset.br===n));
    const r = BRIDGE_ROUNDS[n-1];
    body.innerHTML = `
      <p style="font-weight:700;color:var(--orange-deep);">${r.starter}</p>
      <div class="choices" id="s3choices">
        ${r.opts.map((o,i)=>`<button class="choice-btn" data-i="${i}"><span class="letter">${String.fromCharCode(65+i)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" id="s3feedback"></div>`;
    document.getElementById('s3choices').addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      const fb = document.getElementById('s3feedback');
      [...document.getElementById('s3choices').children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === r.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent=r.why; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Look for a reason PLUS a question back. Try again.'; }
      if(!s3Answered.has(n)){
        s3Answered.add(n);
        if(s3Answered.size >= 3) markActivityComplete('s3');
      }
    });
  }
  document.querySelectorAll('#app [data-br]').forEach(b=>b.addEventListener('click', ()=>showRound(+b.dataset.br)));
  showRound(1);
}

function renderS4(){
  const tabs = Object.keys(SAFETY_NET_TABS).map((k,i)=>`<button class="tab-btn${i===0?' active':''}" data-tab="${k}">${SAFETY_NET_TABS[k].title}</button>`).join('');
  const panels = Object.keys(SAFETY_NET_TABS).map((k,i)=>`
    <div class="tab-panel${i===0?' active':''}" data-panel="${k}">
      <div class="phrase-list">
        ${SAFETY_NET_TABS[k].items.map(p=>`
          <div class="phrase-card" style="flex-direction:column;align-items:flex-start;">
            <div style="display:flex;justify-content:space-between;align-items:center;width:100%;gap:12px;">
              <span class="txt">"${p.ph}"</span>
              <button class="audio-mini" data-say="${p.ph.replace(/"/g,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button>
            </div>
            <span style="color:var(--muted);font-size:12.5px;font-style:italic;margin-top:6px;">${p.note}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Your Safety Net: Key Phrases</h2>
  <p class="section-sub">Three phrase families are your foundation for any professional networking conversation. Listen, repeat, then try them with a partner.</p>
  <div class="panel">
    <div class="tabs">${tabs}</div>
    ${panels}
  </div>`;
}
function wireS4(){
  const tabKeys = Object.keys(SAFETY_NET_TABS);
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
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'a')));
}

function renderS5(){
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Listen To The Networking Conversation</h2>
  <p class="section-sub">Networking at the Thailand Health &amp; Business Tourism Forum: Aim meets Narumon at the reception.</p>
  <div class="panel">
    <div class="playbar">
      <button class="play-btn" id="s5play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY THE CONVERSATION</div>
        <div class="play-sub" id="s5status">Aim and Narumon meet for the first time, exchange cards, and agree to follow up.</div>
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
        ? (VoiceEngine.isPaused() ? 'Paused' : 'Playing: Aim meets Narumon at the reception…')
        : 'Aim and Narumon meet for the first time, exchange cards, and agree to follow up.';
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
    document.querySelectorAll('#app [data-r]').forEach(b=>b.classList.toggle('active', +b.dataset.r===n));
    const r = S5_ROUNDS[n];
    const hideTranscript = n===5;
    body.innerHTML = `
      <p style="font-weight:700;color:var(--orange-deep);">${r.q}</p>
      ${hideTranscript ? '<p style="color:var(--muted);font-size:13px;">Transcript hidden for this round, listening only. Use the Play button above to replay.</p>' : ''}
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

function renderS6(){
  const tabs = PRO_TIPS.map((t,i)=>`<button class="tab-btn${i===0?' active':''}" data-tip="${t.id}">${t.ic} ${t.title}</button>`).join('');
  const panels = PRO_TIPS.map((t,i)=>`
    <div class="tab-panel${i===0?' active':''}" data-tippanel="${t.id}">
      <p style="font-weight:700;color:var(--navy);">Watch carefully. Which one is right?</p>
      <div class="tip-compare">
        <div class="tip-col tip-avoid">
          <img class="tip-photo" src="${t.avoidImg}" alt="Example of what to avoid: ${t.title}">
          <div class="tip-badge">AVOID</div><p>${t.avoid}</p>
        </div>
        <div class="tip-col tip-do">
          <img class="tip-photo" src="${t.doImg}" alt="Example of the correct way: ${t.title}">
          <div class="tip-badge"><span class="icon-inline">${icon('check',{size:14})}</span> DO THIS</div><p>${t.doThis}</p><button class="audio-mini" data-say="${t.doThis.replace(/"/g,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
        </div>
      </div>
      ${t.id==='eye' ? `
      <hr class="hairline">
      <h3 style="font-size:16px;color:var(--navy)">Eye Contact Techniques</h3>
      <div class="arrow-grid">
        ${EYE_CONTACT_TECHNIQUES.map(e=>`<div class="arrow-card"><img class="arrow-photo" src="${e.img}" alt="${e.title}"><span class="arrow-ico">${e.ic}</span><div class="lbl">${e.title}</div><p style="font-size:12.5px;color:var(--muted);margin-top:8px;text-align:left;">${e.body}</p></div>`).join('')}
      </div>` : ''}
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Model It! The 8 Pro Tips</h2>
  <p class="section-sub">Eight habits that separate a nervous first meeting from a confident, professional one. Click through every tip.</p>
  <div class="panel">
    <div class="tabs">${tabs}</div>
    ${panels}
  </div>`;
}
function wireS6(){
  const visited = new Set([PRO_TIPS[0].id]);
  document.querySelectorAll('#app [data-tip]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-tip]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-tippanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-tippanel="${btn.dataset.tip}"]`).classList.add('active');
      visited.add(btn.dataset.tip);
      document.querySelectorAll('#app .audio-mini').forEach(b=>{
        if(!b.dataset.wired){ b.dataset.wired='1'; b.addEventListener('click', ()=>speak(b.dataset.say,'a')); }
      });
      if(visited.size >= PRO_TIPS.length) markActivityComplete('s6');
    });
  });
  document.querySelectorAll('#app .audio-mini').forEach(b=>{
    if(!b.dataset.wired){ b.dataset.wired='1'; b.addEventListener('click', ()=>speak(b.dataset.say,'a')); }
  });
}

function renderS7(){
  const nav = [1,2,3,4].map(n=>`<button class="tab-btn${n===1?' active':''}" data-lvl="${n}">${S7_LEVELS[n].title}</button>`).join('');
  const panels = [1,2,3,4].map(n=>`<div class="tab-panel${n===1?' active':''}" data-lvlpanel="${n}">${S7_LEVELS[n].body}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Say It Yourself</h2>
  <p class="section-sub">From full support to a real, unscripted moment. Say every answer aloud.</p>
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
      if(visitedLevels.size >= 4) markActivityComplete('s7');
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
      const a=document.getElementById('l1a').value.trim();
      const b=document.getElementById('l1b').value.trim();
      const fb = document.getElementById('l1fb');
      fb.classList.add('show');
      fb.textContent = (a && b)
        ? `Great! A natural version: "Hi, I'm ${a} from ${b}."`
        : 'Fill in both blanks with your name and company/school. Model: "Hi, I\'m Aim from Pacific Convention Services."';
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
  <p class="section-sub">Pair speaking. Read only your own role card, then act it out with a partner. Only one screen should be visible per student.</p>
  <div class="panel">
    <div class="ab-toggle">
      <button class="ab-btn active" data-ab="A">Show Student A: Conference Event Manager</button>
      <button class="ab-btn" data-ab="B">Show Student B: Wellness Resort Sales Manager</button>
    </div>
    <div class="ab-view show" id="abA">
      <h3 style="color:var(--navy);font-size:16px;">${ROLE_CARDS_AB.A.title}</h3>
      <p>${ROLE_CARDS_AB.A.body}</p>
      <div class="phrase-list" style="margin-top:14px;">
        ${ROLE_CARDS_AB.A.phrases.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('')}
      </div>
    </div>
    <div class="ab-view" id="abB">
      <h3 style="color:var(--navy);font-size:16px;">${ROLE_CARDS_AB.B.title}</h3>
      <p>${ROLE_CARDS_AB.B.body}</p>
      <div class="phrase-list" style="margin-top:14px;">
        ${ROLE_CARDS_AB.B.phrases.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('')}
      </div>
    </div>
    <hr class="hairline">
    <p style="color:var(--muted);font-size:13px;">Now switch roles and try it again.</p>
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
      if(seenRoles.size >= 2) markActivityComplete('s8');
    });
  });
}

function renderS9(){
  const cards = SITUATIONS.map((s,i)=>`
    <div class="sit-card">
      <div style="font-family:'Oswald';font-size:12px;letter-spacing:.08em;color:var(--orange-deep);">${s.tag}</div>
      <p class="visitor">${s.visitor}</p>
      <p style="color:var(--muted)">${s.task}</p>
      <button class="reveal-btn" data-reveal="sit${i}">Show model response</button>
      <div class="model-answer" id="sit${i}">${s.model}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">Something Went Wrong</h2>
  <p class="section-sub">Real networking isn't always smooth. Practice recovering with honesty and professionalism.</p>
  <div class="panel">${cards}</div>`;
}
function wireS9(){
  const revealed = new Set();
  document.querySelectorAll('#app [data-reveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.reveal).classList.toggle('show');
      revealed.add(btn.dataset.reveal);
      if(revealed.size >= SITUATIONS.length) markActivityComplete('s9');
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
        <p><b>Challenge:</b> ${r.challenge}</p>
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 10</div>
  <h2 class="section-title">Real MICE Role-Play: Expo Simulation</h2>
  <p class="section-sub">Click a card for the scenario. No scripted dialogue. Create the conversation yourself, using everything from today's lesson.</p>
  <div class="panel">
    <img class="venue-photo" src="${SECTION_PHOTOS.reception.src}" alt="${SECTION_PHOTOS.reception.alt}" loading="lazy" style="margin-bottom:22px;">
    <div class="role-grid">${cards}</div>
  </div>`;
}
function wireS10(){
  const opened = new Set();
  document.querySelectorAll('#app .role-card').forEach(c=>c.addEventListener('click', ()=>{
    c.classList.toggle('open');
    opened.add(c.dataset.i);
    if(opened.size >= ROLEPLAYS.length) markActivityComplete('s10');
  }));
}

/* ===================== PRACTICE SETS (Section 11) ===================== */
function renderPractice(){
  const quizCards = QUICK_REVIEW.map((item,i)=>`
    <div class="sit-card" data-quiz="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${item.q}</p>
      <div class="choices" data-qchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-qfb="${i}"></div>
    </div>`).join('');

  const bridgeCards = BRIDGE_PRACTICE.map((b,i)=>`
    <div class="sit-card" data-bridge="${i}">
      <div style="font-family:'Oswald';font-size:12px;letter-spacing:.08em;color:var(--orange-deep);">Bridge ${i+1}</div>
      <p style="font-weight:700;color:var(--navy);margin-top:6px;">${b.starter}</p>
      <p style="color:var(--muted);font-size:13px;">Which reply is a real Because Bridge?</p>
      <div class="choices" data-bchoices="${i}">
        ${b.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-bfb="${i}"></div>
    </div>`).join('');

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
        ${item.lines.map(l=>`<div><b>${l.who}:</b> ${l.text}</div>`).join('')}
      </div>
    </div>`).join('');

  const speakCards = SAY_YOURSELF_PRACTICE.map((s,i)=>`
    <div class="sit-card" data-speak="${i}">
      <div style="font-family:'Oswald';font-size:11px;letter-spacing:.08em;color:var(--teal);">${s.support.toUpperCase()}</div>
      <p class="visitor" style="margin-top:6px;">${s.visitor}</p>
      ${s.hint ? `<div class="keyword-row" style="margin:10px 0;">${s.hint.split(' → ').map(k=>`<span class="kw">${k}</span>`).join('<span class="kw-arrow">→</span>')}</div>` : '<p style="color:var(--muted);font-size:13px;">No keyword hint. Use the Safety Net phrases (Section 4) if you need to check.</p>'}
      <p style="font-weight:700;color:var(--orange-deep);">Answer aloud.</p>
      <button class="reveal-btn" data-showmodel="${i}">Show Model Answer</button>
      <div class="model-answer" data-modeltx="${i}">${s.model}</div>
    </div>`).join('');

  return `
  <div class="section-eyebrow">Section 11</div>
  <h2 class="section-title">Practice Sets</h2>
  <p class="section-sub">Review • Bridge • Listen • Speak: can you use what you just learned?</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-ptab="review">1. Quick Review</button>
      <button class="tab-btn" data-ptab="bridge">2. Build the Bridge</button>
      <button class="tab-btn" data-ptab="listen">3. Listen &amp; Choose</button>
      <button class="tab-btn" data-ptab="speak">4. Say It Yourself</button>
    </div>

    <div class="tab-panel active" data-ppanel="review">${quizCards}</div>

    <div class="tab-panel" data-ppanel="bridge">${bridgeCards}</div>

    <div class="tab-panel" data-ppanel="listen">${listenCards}</div>

    <div class="tab-panel" data-ppanel="speak">
      ${speakCards}
      <p style="color:var(--muted);font-size:12px;margin-top:10px;">This site cannot grade your pronunciation. Say your answer aloud and ask your teacher or partner to check it.</p>
    </div>
  </div>`;
}

function wirePractice(){
  const qrAnswered = new Set(); let qrCorrect = 0;
  const brAnswered = new Set(); let brCorrect = 0;
  const lcAnswered = new Set(); let lcCorrect = 0;
  const sayRevealed = new Set();
  function checkPracticeOverall(){
    if(qrAnswered.size >= QUICK_REVIEW.length && brAnswered.size >= BRIDGE_PRACTICE.length){
      markActivityComplete('practice', {score: `QR ${qrCorrect}/${QUICK_REVIEW.length} · Bridge ${brCorrect}/${BRIDGE_PRACTICE.length}`});
    }
  }

  document.querySelectorAll('#app [data-ptab]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-ptab]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-ppanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-ppanel="${btn.dataset.ptab}"]`).classList.add('active');
    });
  });

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

  BRIDGE_PRACTICE.forEach((b,i)=>{
    const box = document.querySelector(`[data-bchoices="${i}"]`);
    const fb = document.querySelector(`[data-bfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(c=>c.classList.remove('correct','wrong'));
      if(+btn.dataset.i === b.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct: a reason PLUS a door-opener.'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Try again.'; }
      if(!brAnswered.has(i)){
        brAnswered.add(i);
        if(+btn.dataset.i === b.correct) brCorrect++;
        if(brAnswered.size >= BRIDGE_PRACTICE.length){
          sendGranularRecord('Practice: Build the Bridge', {score: `${brCorrect}/${BRIDGE_PRACTICE.length}`});
          checkPracticeOverall();
        }
      }
    });
  });

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

  document.querySelectorAll('#app [data-showmodel]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelector(`[data-modeltx="${btn.dataset.showmodel}"]`).classList.toggle('show');
      sayRevealed.add(btn.dataset.showmodel);
      if(sayRevealed.size >= SAY_YOURSELF_PRACTICE.length){
        sendGranularRecord('Practice: Say It Yourself', {completionStatus:'completed'});
      }
    });
  });
}

function renderS11(){
  return `
  <div class="section-eyebrow">Section 12</div>
  <h2 class="section-title">Final Challenge: The MICE Expo</h2>
  <p class="section-sub">Graded speaking preparation. Stand up and mingle. Your goal is to meet 3 different people using your Safety Net phrases and the Because Bridge.</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-round="1">Partners 1 &amp; 2</button>
      <button class="tab-btn" data-round="2">Partner 3: Challenge Round</button>
    </div>
    <div class="tab-panel active" data-roundpanel="1">
      <h3 style="font-size:16px;color:var(--navy);">Meet your first two partners, using all four steps:</h3>
      <div class="phrase-list">
        <div class="phrase-card"><span class="txt">Introduction: "Hi, I'm [name] from [company]."</span></div>
        <div class="phrase-card"><span class="txt">Icebreaker: "How's the expo going for you?"</span></div>
        <div class="phrase-card"><span class="txt">Connection: "I like your [company] because…"</span></div>
        <div class="phrase-card"><span class="txt">The Close: "Here is my card. Nice to meet you!"</span></div>
      </div>
    </div>
    <div class="tab-panel" data-roundpanel="2">
      <h3 style="font-size:16px;color:var(--navy);">Meet your third partner, the challenge round:</h3>
      <div class="phrase-list">
        <div class="phrase-card"><span class="txt">Use at least ONE Pro Tip from Section 6 on purpose (eye contact, a firm handshake, or using their name).</span></div>
        <div class="phrase-card"><span class="txt">Use the Because Bridge with a real, specific reason, not a generic one.</span></div>
        <div class="phrase-card"><span class="txt">End the conversation by suggesting a follow-up, not just handing over a card.</span></div>
      </div>
    </div>
    <hr class="hairline">
    <p style="color:var(--muted);font-size:13px;">Teacher observes this speaking task using the Speaking Rubric (Fluency, Pronunciation, Vocabulary, Interaction, Professionalism).</p>
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
  <p class="section-sub">After your expo simulation, rate yourself honestly. Your teacher remains the final evaluator.</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this lesson, you should feel more confident introducing yourself and networking professionally in English.</p>
  </div>

  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">Professional Greetings &amp; Networking: Quick Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review the key vocabulary, Safety Net phrases, the Because Bridge, and the 8 pro tips from Unit 4.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="Professional Greetings and Networking: Quick Guide preview" class="guide-thumb" loading="lazy">
    <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="downloadGuideBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Networking Study Guide</a>
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
        markActivityComplete('s12', {score: `self-rated ${ratedCount}/${rateGroups.length}`});
      }
    });
  });
}

/* ===================== COMPLETE (final end screen) ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 4 COMPLETE</div>
    <h1>You're ready to <span>make the connection.</span></h1>
    <p>Review the guide, practice the phrases, and network with confidence in English.</p>
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
