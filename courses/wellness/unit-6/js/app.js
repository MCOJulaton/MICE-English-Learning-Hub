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

/* ===================== DATA COLLECTION MODULE ===================== */
const DATA_ENDPOINT = "https://script.google.com/macros/s/AKfycbxDECOuXf3HMxPVLT1fhfOHE5g-Gq1juG5enaCoUrShk9vEMfctgy-URKmqmvPGeoE/exec";

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s5b','s6','s6b','s7'];

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
    activity, score, completionStatus
  };
}
function sendProgressRecord(record){
  if(!isEndpointConfigured()){ pendingRecords.push(record); return; }
  fetch(DATA_ENDPOINT, {
    method:'POST', mode:'no-cors',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify(record)
  }).catch(()=>{ pendingRecords.push(record); });
}
function flushPendingRecords(){
  if(!isEndpointConfigured() || !pendingRecords.length) return;
  const toSend = pendingRecords; pendingRecords = [];
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
  saveCheckinState();
}
function completedCount(){ return TRACKED_ACTIVITIES.filter(k => Progress.activities[k]).length; }
function updateTopbarBadge(){
  const el = document.getElementById('studentBadge');
  if(!el) return;
  if(!Progress.studentName){ el.style.display='none'; return; }
  el.style.display='';
  el.innerHTML = `<b>${Progress.studentName}</b> · ${completedCount()}/${TRACKED_ACTIVITIES.length} done <button type="button" id="studentSwitchBtn" class="student-switch-btn" title="Not you? Check in again">Switch</button>`;
  const switchBtn = document.getElementById('studentSwitchBtn');
  if(switchBtn) switchBtn.addEventListener('click', resetCheckin);
}

/* ===================== RESUME IF THE PAGE RELOADS OR CLOSES =====================
   Saves check-in + current section to this browser only (localStorage), scoped to
   this unit, so an accidental reload/back/close picks up where you left off instead
   of showing the check-in gate again. Expires at midnight so it still asks a fresh
   check-in next class rather than skipping it forever on a shared computer. */
const CHECKIN_STORAGE_KEY = 'wellness_u6_checkin';
function todayStr(){ return new Date().toISOString().slice(0,10); }
function saveCheckinState(){
  if(!Progress.studentId) return;
  try{
    localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify({
      studentId: Progress.studentId, firstName: Progress.firstName, lastName: Progress.lastName,
      studentName: Progress.studentName, date: Progress.date, startTime: Progress.startTime,
      activities: Progress.activities, current
    }));
  }catch(e){}
}
function clearCheckinState(){
  try{ localStorage.removeItem(CHECKIN_STORAGE_KEY); }catch(e){}
}
function restoreCheckinState(){
  let saved;
  try{ saved = JSON.parse(localStorage.getItem(CHECKIN_STORAGE_KEY)); }catch(e){ return false; }
  if(!saved || !saved.studentId || saved.date !== todayStr()) return false;
  Progress.studentId = saved.studentId;
  Progress.firstName = saved.firstName;
  Progress.lastName = saved.lastName;
  Progress.studentName = saved.studentName;
  Progress.date = saved.date;
  Progress.startTime = saved.startTime;
  Progress.activities = saved.activities || {};
  current = Math.max(0, Math.min(RENDERERS.length - 1, saved.current || 0));
  return true;
}
function resetCheckin(){
  clearCheckinState();
  Progress.studentId=''; Progress.firstName=''; Progress.lastName=''; Progress.studentName='';
  Progress.date=''; Progress.startTime=''; Progress.activities={};
  current = 0;
  const gate = document.getElementById('checkinGate');
  const form = document.getElementById('checkinForm');
  form.reset();
  form.classList.remove('checked-in');
  document.getElementById('checkinConfirm').classList.remove('show');
  gate.style.display='';
  updateTopbarBadge();
  renderAll();
}

/* ===================== DEEP LINKS ===================== */
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
    saveCheckinState();
    applyDeepLinkAfterCheckin();
    setTimeout(()=>{ gate.style.display='none'; }, 900);
  });
}

/* ===================== VOICE ENGINE ===================== */
const VoiceEngine = (function(){
  let allVoices = [];
  let staffVoice = null, delegateVoice = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const FEMALE_NAME_HINTS = /(kate|serena|stephanie|fiona|hazel|libby|sonia|olivia|amy|emma|joanna|shelley|grandma|moira|tessa|karen|susan|zira|samantha|victoria|ava|allison|zoe|nicky|jenny|aria|michelle)/i;
  const MALE_NAME_HINTS = /(daniel|arthur|george|oliver|ryan|brian|matthew|guy|eddy|rocko|reed|grandpa|alex|fred|tom|aaron|gordon|justin|bruce)/i;

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    const ukFemaleVoice = allVoices.find(v => /google uk english female/i.test(v.name))
                        || allVoices.find(v => /^en-gb$/i.test(v.lang) && /female/i.test(v.name))
                        || allVoices.find(v => /^en-gb$/i.test(v.lang) && FEMALE_NAME_HINTS.test(v.name))
                        || allVoices.find(v => /^en-gb$/i.test(v.lang) && !MALE_NAME_HINTS.test(v.name))
                        || allVoices.find(v => /^en-gb$/i.test(v.lang))
                        || allVoices.find(v => /female/i.test(v.name) && /^en/i.test(v.lang))
                        || allVoices[0] || null;
    const usFemaleVoice = allVoices.find(v => /google us english female/i.test(v.name))
                        || allVoices.find(v => /^en-us$/i.test(v.lang) && /female/i.test(v.name) && !/male/i.test(v.name))
                        || allVoices.find(v => /^en-us$/i.test(v.lang) && FEMALE_NAME_HINTS.test(v.name))
                        || allVoices.find(v => /^en-us$/i.test(v.lang) && !MALE_NAME_HINTS.test(v.name))
                        || allVoices.find(v => /^en-us$/i.test(v.lang))
                        || ukFemaleVoice;
    staffVoice = ukFemaleVoice;
    delegateVoice = usFemaleVoice;
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
    if(voice){ u.voice = voice; u.lang = voice.lang; }
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
      queue = [{text, kind: kind||'staff'}];
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
    speakConversation(lines){
      this.stop();
      queue = lines.map(l=>({text:l.text, kind: l.kind || 'staff'}));
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
    pause(){ if(playing && !paused){ window.speechSynthesis.pause(); paused=true; onStateChange(); } },
    resume(){ if(playing && paused){ window.speechSynthesis.resume(); paused=false; onStateChange(); } },
    stop(){ window.speechSynthesis.cancel(); playing=false; paused=false; queue=[]; queueIndex=0; onStateChange(); }
  };
})();
window.addEventListener('pagehide', ()=> VoiceEngine.stop());
function speak(text, kind){
  if(!('speechSynthesis' in window)) { alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakLine(text, kind==='delegate' ? 'delegate' : 'staff');
}
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

/* Reservation data captured live in Section 4, reused for the Section 6
   completed-reservation summary. */
const reservationData = {};

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">WELLNESS TOURISM MANAGEMENT PROGRAM</div>
    <h1>Can you <span>handle this booking?</span></h1>
    <p>Unit 6: Reservations &amp; Appointments. Take a booking by listening carefully, handle a fully booked time slot or a cancellation, and confirm a reservation professionally.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <button class="startbtn" onclick="goNext()">Begin the shift →</button>
  </div>`;
}

/* ---- Section 1: Reservation Vocabulary ---- */
function renderS1(){
  const coreVocab = VOCAB.filter(v=>CORE_VOCAB_IDS.includes(v.w));
  const usefulVocab = VOCAB.filter(v=>!CORE_VOCAB_IDS.includes(v.w));
  const vocabRows = coreVocab.map(v=>`
    <div class="phrase-card"><span class="txt"><b>${v.w}</b> <i style="color:var(--muted);font-weight:400;">(${v.t})</i>: ${v.d}</span></div>`).join('');
  const usefulRows = usefulVocab.map(v=>`
    <div class="secondary-word"><b>${v.w}:</b> ${v.d}</div>`).join('');
  const words = MATCH_PAIRS.map(v=>`<div class="match-item" data-word="${v.id}">${v.word}</div>`).join('');
  const meanings = shuffle(MATCH_PAIRS).map(v=>`<div class="match-item" data-pic="${v.id}">${v.meaning}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Reservation Vocabulary</h2>
  <p class="section-sub">These 8 core words come up again and again in this unit. Study them, then match each word to its meaning.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Core Vocabulary</h3>
    <div class="phrase-list">${vocabRows}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Useful Words</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">A few more words you'll see in this unit. You don't need to memorize these, just recognize them.</p>
    <div class="secondary-word-list">${usefulRows}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Activity: Match the Word with Its Meaning</h3>
    <p class="match-hint">Click a word, then click its meaning to connect them. Click a connected item to undo it.</p>
    <div class="match-wrap">
      <svg class="match-svg"></svg>
      <div class="match-cols">
        <div><div class="match-col-title">Word</div>${words}</div>
        <div><div class="match-col-title">Meaning</div>${meanings}</div>
      </div>
    </div>
    <div class="feedback" id="s1matchfb"></div>
  </div>`;
}
function wireS1(){
  const matchWrap = document.querySelector('.match-wrap');
  const matchSvg = document.querySelector('.match-svg');
  const matchFb = document.getElementById('s1matchfb');
  const connections = new Map();
  let selectedWord = null;
  function sizeSvg(){ const r = matchWrap.getBoundingClientRect(); matchSvg.setAttribute('width', r.width); matchSvg.setAttribute('height', r.height); }
  function lineBetween(a, b, cls){
    const wrapRect = matchWrap.getBoundingClientRect();
    const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
    const x1 = ar.right - wrapRect.left, y1 = ar.top + ar.height/2 - wrapRect.top;
    const x2 = br.left - wrapRect.left, y2 = br.top + br.height/2 - wrapRect.top;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="match-connector ${cls||''}"></line>`;
  }
  function drawConnections(tempWrongPair){
    sizeSvg();
    let html = '';
    connections.forEach(({wordEl, picEl})=>{ html += lineBetween(wordEl, picEl); });
    if(tempWrongPair) html += lineBetween(tempWrongPair.wordEl, tempWrongPair.picEl, 'wrong');
    matchSvg.innerHTML = html;
  }
  window.addEventListener('resize', ()=>drawConnections());
  function clearSelection(){ document.querySelectorAll('#app [data-word]').forEach(x=>x.classList.remove('sel')); selectedWord = null; }
  function unmatch(id){
    connections.delete(id);
    document.querySelector(`[data-word="${id}"]`).classList.remove('matched');
    document.querySelector(`[data-pic="${id}"]`).classList.remove('matched');
    drawConnections();
  }
  document.querySelectorAll('#app [data-word]').forEach(w=>{
    w.addEventListener('click', ()=>{
      if(w.classList.contains('matched')){ unmatch(w.dataset.word); return; }
      clearSelection(); w.classList.add('sel'); selectedWord = w.dataset.word;
    });
  });
  document.querySelectorAll('#app [data-pic]').forEach(p=>{
    p.addEventListener('click', ()=>{
      if(p.classList.contains('matched')){ unmatch(p.dataset.pic); return; }
      if(!selectedWord) return;
      const wordEl = document.querySelector(`[data-word="${selectedWord}"]`);
      if(p.dataset.pic === selectedWord){
        wordEl.classList.add('matched'); wordEl.classList.remove('sel');
        p.classList.add('matched');
        connections.set(selectedWord, {wordEl, picEl:p});
        matchFb.className='feedback show good'; matchFb.textContent='Great match!';
        selectedWord = null;
        drawConnections();
        if(connections.size >= MATCH_PAIRS.length) markActivityComplete('s1');
      } else {
        matchFb.className='feedback show meh'; matchFb.textContent="That's not a match. Try again.";
        drawConnections({wordEl, picEl:p});
        setTimeout(()=>drawConnections(), 700);
        clearSelection();
      }
    });
  });
}

/* ---- Section 2: Vocabulary In Context ---- */
function renderS2(){
  const blanks = FILL_BLANK.map((f,i)=>`
    <div class="fillblank-card">
      <p class="fillblank-q">${i+1}. ${f.q.replace('__________', '<span class="fillblank-gap">______</span>')}</p>
      <div class="fillblank-row">
        <input type="text" class="fillblank-input" id="fbInput${i}" placeholder="Type your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
        <button class="tb-btn" id="fbCheck${i}" style="background:var(--teal);border-color:var(--teal);">Check</button>
      </div>
      <div class="feedback" data-bfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Vocabulary In Context</h2>
  <p class="section-sub">Type the correct word or phrase for each sentence, then press Check. You can try again if you get it wrong.</p>
  <div class="panel">${blanks}</div>`;
}
function wireS2(){
  const answered = new Set();
  FILL_BLANK.forEach((f,i)=>{
    const input = document.getElementById(`fbInput${i}`);
    const fb = document.querySelector(`[data-bfb="${i}"]`);
    function check(){
      const val = input.value.trim().toLowerCase();
      if(!val) return;
      input.classList.remove('correct','wrong');
      if(val === f.a.toLowerCase()){
        input.classList.add('correct');
        fb.className='feedback show good'; fb.textContent='Correct!';
      } else {
        input.classList.add('wrong');
        fb.className='feedback show meh'; fb.textContent='Not quite. Try again.';
      }
      answered.add(i);
      if(answered.size >= FILL_BLANK.length) markActivityComplete('s2');
    }
    document.getElementById(`fbCheck${i}`).addEventListener('click', check);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); check(); } });
    input.addEventListener('input', ()=> input.classList.remove('correct','wrong'));
  });
}

/* ---- Section 3: Reading — Phone Phrases ---- */
function renderS3(){
  const phraseRows = PHONE_PHRASES.map((p,i)=>`
    <div class="resform-row" style="grid-template-columns:1fr 1fr;">
      <div class="flbl">${p.field}</div>
      <button class="reveal-btn" data-preveal="pp${i}" style="margin-top:0;">Show phrase</button>
      <div class="model-answer" id="pp${i}" style="grid-column:1/-1;">"${p.phrase}"</div>
    </div>`).join('');
  const politeRows = POLITE_FORMS.map(p=>`
    <div class="phrase-card"><span class="txt" style="color:var(--danger);text-decoration:line-through;">${p.direct}</span></div>
    <div class="phrase-card"><span class="txt" style="color:var(--green-safe);">${p.polite}</span></div>`).join('');
  const discussionCards = RESERVATION_DISCUSSION.map((d,i)=>`
    <div class="sit-card">
      <div style="font-family:'Oswald';font-size:12px;letter-spacing:.08em;color:var(--orange-deep);">${d.tag}</div>
      <p style="margin-top:6px;">${d.text}</p>
      <button class="reveal-btn" data-dreveal="dd${i}">Show useful language</button>
      <div class="model-answer" id="dd${i}">${d.model}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Reading: Reservation Form &amp; Phone Phrases</h2>
  <p class="section-sub">Study the table. The left column shows the information you need to collect. Cover the phrase and try to say it from memory, then click to check.</p>
  <div class="panel">
    <div class="resform">${phraseRows}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Language Focus: Polite Request Forms</h3>
    <p style="color:var(--muted);font-size:13.5px;">In professional hospitality English, we avoid direct questions and use softened forms instead.</p>
    <div class="phrase-list" style="grid-template-columns:1fr 1fr;display:grid;gap:10px;margin-top:14px;">${politeRows}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Reservation Situations</h3>
    <p style="color:var(--muted);font-size:13.5px;">Read each situation and discuss with a partner: how would you handle it?</p>
    ${discussionCards}
  </div>`;
}
function wireS3(){
  const pRevealed = new Set();
  document.querySelectorAll('#app [data-preveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.preveal).classList.toggle('show');
      pRevealed.add(btn.dataset.preveal);
      checkDone();
    });
  });
  const dRevealed = new Set();
  document.querySelectorAll('#app [data-dreveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.dreveal).classList.toggle('show');
      dRevealed.add(btn.dataset.dreveal);
      checkDone();
    });
  });
  function checkDone(){
    if(pRevealed.size >= PHONE_PHRASES.length && dRevealed.size >= RESERVATION_DISCUSSION.length) markActivityComplete('s3');
  }
}

/* ---- Section 4: The Reservation Call (main interactive) ---- */
function renderS4(){
  const rows = RESERVATION_FIELDS.map((f,i)=>`
    <div class="resform-row">
      <div class="flbl">${f.label}</div>
      <input type="text" class="fillblank-input" id="resInput${i}" placeholder="Listen and type..." autocomplete="off" autocapitalize="off" spellcheck="false">
      <button class="tb-btn" id="resCheck${i}" style="background:var(--teal);border-color:var(--teal);">Check</button>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">The Reservation Call</h2>
  <p class="section-sub">${LISTEN.intro} Listen to the call, then fill in the reservation form. Type your answer and press Check: correct answers turn green, wrong answers turn red.</p>
  <div class="panel">
    <img class="venue-photo" src="${SECTION_PHOTOS.phone.src}" alt="${SECTION_PHOTOS.phone.alt}" loading="lazy" style="margin-bottom:20px;">
    <div class="playbar">
      <button class="play-btn" id="s4play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY THE CALL</div>
        <div class="play-sub" id="s4status">Wan (staff) takes a spa booking from Ms. Parker (guest).</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="tb-btn" id="s4pause"><span class="icon-inline">${icon('pause',{size:14})}</span> <span class="lbl">Pause</span></button>
        <button class="tb-btn" id="s4resume"><span class="icon-inline">${icon('play',{size:14})}</span> <span class="lbl">Resume</span></button>
        <button class="tb-btn" id="s4replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
        <button class="tb-btn" id="s4slower"><span class="lbl">Slower</span></button>
      </div>
    </div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Reservation Form</h3>
    <div class="resform">${rows}</div>
  </div>`;
}
function normalizeField(v){
  return v.trim().toLowerCase().replace(/[.,]/g,'').replace(/\s+/g,' ');
}
function wireS4(){
  const statusEl = document.getElementById('s4status');
  const playBtn = document.getElementById('s4play');
  VoiceEngine.onChange(()=>{
    if(statusEl){
      statusEl.textContent = VoiceEngine.isPlaying()
        ? (VoiceEngine.isPaused() ? 'Paused' : 'Playing: Wan takes the booking…')
        : 'Wan (staff) takes a spa booking from Ms. Parker (guest).';
    }
    if(playBtn){
      playBtn.innerHTML = VoiceEngine.isPlaying() ? icon('stop',{size:20}) : icon('play',{size:20});
      playBtn.title = VoiceEngine.isPlaying() ? 'Stop' : 'Play';
    }
  });
  playBtn.addEventListener('click', ()=>{
    if(VoiceEngine.isPlaying()) VoiceEngine.stop();
    else VoiceEngine.speakConversation(LISTEN.lines);
  });
  document.getElementById('s4replay').addEventListener('click', ()=> VoiceEngine.speakConversation(LISTEN.lines));
  document.getElementById('s4pause').addEventListener('click', ()=> VoiceEngine.pause());
  document.getElementById('s4resume').addEventListener('click', ()=> VoiceEngine.resume());
  const slowerBtn = document.getElementById('s4slower');
  slowerBtn.addEventListener('click', ()=>{
    VoiceEngine.setSlower(!VoiceEngine.isSlower());
    slowerBtn.classList.toggle('primary', VoiceEngine.isSlower());
    slowerBtn.innerHTML = VoiceEngine.isSlower() ? '<span class="lbl">Slower: On</span>' : '<span class="lbl">Slower</span>';
  });

  const answered = new Set();
  RESERVATION_FIELDS.forEach((f,i)=>{
    const input = document.getElementById(`resInput${i}`);
    function check(){
      const val = normalizeField(input.value);
      if(!val) return;
      input.classList.remove('correct','wrong');
      const accepted = f.accept.map(normalizeField);
      if(accepted.includes(val)){
        input.classList.add('correct');
        reservationData[f.id] = input.value.trim();
      } else {
        input.classList.add('wrong');
      }
      answered.add(i);
      if(answered.size >= RESERVATION_FIELDS.length){
        const correctCount = RESERVATION_FIELDS.filter((ff,idx)=> document.getElementById(`resInput${idx}`).classList.contains('correct')).length;
        markActivityComplete('s4', {score:`${correctCount}/${RESERVATION_FIELDS.length}`});
      }
    }
    document.getElementById(`resCheck${i}`).addEventListener('click', check);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); check(); } });
    input.addEventListener('input', ()=> input.classList.remove('correct','wrong'));
  });
}

/* ---- Section 5: Real-World Challenges ---- */
function renderS5(){
  const cards = CHALLENGES.map((c,i)=>`
    <div class="sit-card">
      <div style="font-family:'Oswald';font-size:12px;letter-spacing:.08em;color:var(--orange-deep);">${c.tag}</div>
      <p style="margin-top:6px;">${c.text}</p>
      <button class="reveal-btn" data-creveal="cc${i}">Show professional response</button>
      <div class="model-answer" id="cc${i}">${c.model}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Real-World Challenges</h2>
  <p class="section-sub">Real reservation problems happen every day. With a partner, discuss how you would respond, then check your answer.</p>
  <div class="panel">${cards}</div>`;
}
function wireS5(){
  const revealed = new Set();
  document.querySelectorAll('#app [data-creveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.creveal).classList.toggle('show');
      revealed.add(btn.dataset.creveal);
      if(revealed.size >= CHALLENGES.length) markActivityComplete('s5');
    });
  });
}

/* ---- Section 6 (NEW): Signature game — Spa Booking Challenge ---- */
function renderS5b(){
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Spa Booking Challenge</h2>
  <p class="section-sub">You are working the reservation desk at Harmony Wellness Spa. Take a real booking from start to finish, then handle five realistic guest requests.</p>
  <div id="s5bBody"></div>`;
}
let s5bState = { phase:'intro', step:0, bookingAnswers:{}, challengeIndex:0, challengeCorrect:0, flags:{} };
function s5bReset(){ s5bState = { phase:'intro', step:0, bookingAnswers:{}, challengeIndex:0, challengeCorrect:0, flags:{} }; }
function wireS5b(){
  const body = document.getElementById('s5bBody');

  function showIntro(){
    const menuRows = SPA_MENU.map(m=>`
      <div class="spa-menu-item">
        <span class="spa-menu-name">${m.name}</span>
        <span class="spa-menu-duration">${m.duration}</span>
        <span class="spa-menu-price">${m.price}</span>
      </div>`).join('');
    const scheduleRows = SPA_SCHEDULE.map(s=>`
      <div class="spa-slot ${s.status}">
        <span class="spa-slot-time">${s.time}</span>
        <span class="spa-slot-status">${s.status==='available'?'Available':'Booked'}</span>
      </div>`).join('');
    body.innerHTML = `
      <div class="panel" style="margin-top:0;">
        <h3 style="font-size:15px;color:var(--navy);">Harmony Wellness Spa: Today's Menu</h3>
        <div class="spa-menu">${menuRows}</div>
        <h3 style="font-size:15px;color:var(--navy);margin-top:22px;">Saturday Availability</h3>
        <div class="spa-schedule">${scheduleRows}</div>
      </div>
      <div class="guest-card">
        <div class="guest-bubble">"${SPA_GUEST_REQUEST}"</div>
        <p class="guest-need">A guest has just called the reservation desk. Use the menu and schedule above to help them.</p>
        <button class="tb-btn primary" id="s5bStart" style="background:var(--orange);border-color:var(--orange-deep);margin-top:16px;">Start the Booking →</button>
      </div>`;
    document.getElementById('s5bStart').addEventListener('click', ()=>{
      s5bState.phase = 'booking'; s5bState.step = 0; showBookingStep(0);
    });
  }

  function showBookingStep(i){
    const step = SPA_BOOKING_STEPS[i];
    const correctIdx = step.options.findIndex(o=>o.correct);
    body.innerHTML = `
      <div class="section-eyebrow">Booking Step ${i+1} of ${SPA_BOOKING_STEPS.length}</div>
      <div class="guest-card">
        <div class="guest-bubble">"${SPA_GUEST_REQUEST}"</div>
        <p style="font-weight:700;color:var(--navy);margin-top:16px;">${step.prompt}</p>
        <div class="choices" id="s5bChoices">
          ${step.options.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o.t}</button>`).join('')}
        </div>
        <div class="feedback" id="s5bFb"></div>
        <div id="s5bNextWrap" style="margin-top:16px;"></div>
      </div>`;
    const choicesBox = document.getElementById('s5bChoices');
    const fb = document.getElementById('s5bFb');
    choicesBox.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      if(choicesBox.classList.contains('answered')) return;
      choicesBox.classList.add('answered');
      const j = +btn.dataset.i;
      const isCorrect = j === correctIdx;
      [...choicesBox.children].forEach((b,k)=>{
        if(k===correctIdx) b.classList.add('correct');
        else if(k===j) b.classList.add('wrong');
      });
      fb.className = 'feedback show ' + (isCorrect ? 'good' : 'meh');
      fb.textContent = isCorrect ? 'Correct.' : 'Not quite. The correct choice is highlighted above.';
      s5bState.bookingAnswers[step.id] = isCorrect;
      const nextWrap = document.getElementById('s5bNextWrap');
      const isLast = i >= SPA_BOOKING_STEPS.length - 1;
      nextWrap.innerHTML = `<button class="tb-btn primary" id="s5bNext" style="background:var(--teal);border-color:var(--teal);">${isLast ? 'Review the booking →' : 'Next step →'}</button>`;
      document.getElementById('s5bNext').addEventListener('click', ()=>{
        if(isLast){ s5bState.phase = 'confirm'; showConfirm(); }
        else { s5bState.step = i+1; showBookingStep(s5bState.step); }
      });
    });
  }

  function showConfirm(){
    const service = SPA_MENU.find(m=>m.id==='thai');
    body.innerHTML = `
      <div class="section-eyebrow">Confirm the Booking</div>
      <div class="summary-card">
        <div class="summary-row"><span class="k">Service</span><span class="v">${service.name} (${service.duration})</span></div>
        <div class="summary-row"><span class="k">Guests</span><span class="v">2 people</span></div>
        <div class="summary-row"><span class="k">Day</span><span class="v">Saturday</span></div>
        <div class="summary-row"><span class="k">Time</span><span class="v">2:00 p.m.</span></div>
        <div class="summary-row"><span class="k">Rate</span><span class="v">${service.price} per person</span></div>
      </div>
      <button class="tb-btn primary" id="s5bConfirmBtn" style="background:var(--orange);border-color:var(--orange-deep);margin-top:18px;">Confirm Booking</button>`;
    document.getElementById('s5bConfirmBtn').addEventListener('click', ()=>{
      s5bState.flags.confirmed = true;
      s5bState.phase = 'challenges'; s5bState.challengeIndex = 0;
      showChallenge(0);
    });
  }

  function showChallenge(i){
    const c = SPA_CHALLENGES[i];
    const correctIdx = c.options.findIndex(o=>o.correct);
    body.innerHTML = `
      <div class="section-eyebrow">${c.tag}: ${i+1} of ${SPA_CHALLENGES.length}</div>
      <div class="guest-card">
        <div class="guest-bubble">${c.guest}</div>
        <p style="font-weight:700;color:var(--navy);margin-top:16px;">What should you say?</p>
        <div class="choices" id="s5bChChoices">
          ${c.options.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o.t}</button>`).join('')}
        </div>
        <div class="feedback" id="s5bChFb"></div>
        <div id="s5bChNextWrap" style="margin-top:16px;"></div>
      </div>
      <p class="guest-progress">Score so far: ${s5bState.challengeCorrect}/${i}</p>`;
    const choicesBox = document.getElementById('s5bChChoices');
    const fb = document.getElementById('s5bChFb');
    choicesBox.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      if(choicesBox.classList.contains('answered')) return;
      choicesBox.classList.add('answered');
      const j = +btn.dataset.i;
      const isCorrect = j === correctIdx;
      [...choicesBox.children].forEach((b,k)=>{
        if(k===correctIdx) b.classList.add('correct');
        else if(k===j) b.classList.add('wrong');
      });
      fb.className = 'feedback show ' + (isCorrect ? 'good' : 'meh');
      fb.textContent = (isCorrect ? 'Correct. ' : 'Not quite. ') + c.why;
      if(isCorrect) s5bState.challengeCorrect++;
      const nextWrap = document.getElementById('s5bChNextWrap');
      const isLast = i >= SPA_CHALLENGES.length - 1;
      nextWrap.innerHTML = `<button class="tb-btn primary" id="s5bChNext" style="background:var(--teal);border-color:var(--teal);">${isLast ? 'See my Reservation Skills Score →' : 'Next guest →'}</button>`;
      document.getElementById('s5bChNext').addEventListener('click', ()=>{
        if(isLast){ s5bState.phase = 'score'; showScore(); }
        else { s5bState.challengeIndex = i+1; showChallenge(s5bState.challengeIndex); }
      });
    });
  }

  function showScore(){
    s5bState.flags.info = !!s5bState.bookingAnswers.ask;
    s5bState.flags.availability = !!s5bState.bookingAnswers.time;
    s5bState.flags.polite = !!(s5bState.bookingAnswers.ask && s5bState.bookingAnswers.special);
    s5bState.flags.handled = s5bState.challengeCorrect >= 4;
    const checklist = [
      {k:'info', label:'Collected guest information'},
      {k:'availability', label:'Checked availability'},
      {k:'polite', label:'Used polite language'},
      {k:'confirmed', label:'Confirmed details'},
      {k:'handled', label:"Handled the guest's request correctly"}
    ];
    const rows = checklist.map(c=>{
      const got = s5bState.flags[c.k];
      return `<div class="rubric-row"><div><div class="lbl">${c.label}</div></div><div style="font-weight:700;color:${got?'var(--green-safe)':'var(--muted)'};">${got ? icon('check',{size:18}) : '—'}</div></div>`;
    }).join('');
    body.innerHTML = `
      <div class="guest-card" style="text-align:center;">
        <div class="section-eyebrow" style="text-align:center;">RESERVATION SKILLS SCORE</div>
        <p style="font-family:'Oswald';font-size:44px;color:var(--navy);margin-top:8px;">${s5bState.challengeCorrect}/${SPA_CHALLENGES.length}</p>
        <p style="font-family:'Oswald';font-size:15px;letter-spacing:.03em;color:var(--orange-deep);margin-top:4px;">challenge scenarios handled correctly</p>
        <hr class="hairline">
        <div style="text-align:left;">${rows}</div>
        <button class="tb-btn primary" id="s5bRetry" style="background:var(--teal);border-color:var(--teal);margin-top:20px;">Try the Challenge Again</button>
      </div>`;
    document.getElementById('s5bRetry').addEventListener('click', ()=>{ s5bReset(); showIntro(); });
    const passedCount = Object.values(s5bState.flags).filter(Boolean).length;
    markActivityComplete('s5b', {score:`${passedCount}/5 skills, ${s5bState.challengeCorrect}/${SPA_CHALLENGES.length} scenarios`});
  }

  if(s5bState.phase==='intro') showIntro();
  else if(s5bState.phase==='booking') showBookingStep(s5bState.step);
  else if(s5bState.phase==='confirm') showConfirm();
  else if(s5bState.phase==='challenges') showChallenge(s5bState.challengeIndex);
  else showScore();
}

/* ---- Section 7: Final Performance ---- */
function renderS6(){
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Can I Handle This Booking?</h2>
  <p class="section-sub">Complete a full reservation call: greet, ask for information, check availability, confirm the booking, and close professionally.</p>
  <div class="panel">
    <div class="roleplay-cols">
      <div class="roleplay-col">
        <h4>${ROLEPLAY.a.title}</h4>
        <p>${ROLEPLAY.a.body}</p>
        <div class="phrase-list" style="margin-top:12px;">${ROLEPLAY.a.phrases.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('')}</div>
      </div>
      <div class="roleplay-col">
        <h4>${ROLEPLAY.b.title}</h4>
        <p>${ROLEPLAY.b.body}</p>
        <div class="phrase-list" style="margin-top:12px;">${ROLEPLAY.b.phrases.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('')}</div>
      </div>
    </div>
    <button class="tb-btn primary" id="s6done" style="background:var(--teal);border-color:var(--teal);margin-top:18px;">We completed the call</button>
    <div id="s6summarywrap"></div>
  </div>`;
}
function wireS6(){
  document.getElementById('s6done').addEventListener('click', (e)=>{
    e.target.disabled = true;
    e.target.textContent = 'Completed!';
    const d = reservationData;
    const has = Object.keys(d).length > 0;
    const summary = has ? {
      'Guest Name': d.name || '—', 'Room Number': d.room || '—', 'Service': d.service || '—',
      'Day': d.day || '—', 'Time': d.time || '—', 'Rate': d.rate || '—'
    } : {
      'Guest Name': 'Emily Parker', 'Room Number': '14', 'Service': "Couple's Swedish Massage",
      'Day': 'Saturday', 'Time': '2 p.m.', 'Rate': '5,500 baht per person'
    };
    document.getElementById('s6summarywrap').innerHTML = `
      <div class="summary-card">
        <div class="section-eyebrow" style="color:var(--orange);">COMPLETED RESERVATION</div>
        ${Object.entries(summary).map(([k,v])=>`<div class="summary-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}
      </div>`;
    markActivityComplete('s6', {completionStatus:'reached'});
  });
}

/* ---- Section 8 (NEW): Writing — Reservation Confirmation Email ---- */
function renderS6b(){
  const situations = WRITING_TASK.situations.map(s=>`
    <button class="choice-btn" data-sit="${s.tag}"><span class="letter">${s.tag.slice(-1)}</span> ${s.text}</button>`).join('');
  const phrases = WRITING_TASK.usefulPhrases.map(p=>`<div class="phrase-card"><span class="txt">${p}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 8</div>
  <h2 class="section-title">Writing: Reservation Confirmation Email</h2>
  <p class="section-sub">${WRITING_TASK.prompt}</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Choose a Situation</h3>
    <div class="choices">${situations}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Useful Phrases</h3>
    <div class="phrase-list">${phrases}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Your Confirmation Email</h3>
    <textarea class="challenge-textarea" id="s6bEmail" rows="8" placeholder="Write your confirmation email here..."></textarea>
    <button class="tb-btn primary" id="s6bDone" style="background:var(--teal);border-color:var(--teal);margin-top:14px;">I've written my confirmation email</button>
  </div>`;
}
function wireS6b(){
  document.querySelectorAll('#app [data-sit]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-sit]').forEach(b=>b.classList.remove('sel','correct'));
      btn.classList.add('correct');
    });
  });
  document.getElementById('s6bDone').addEventListener('click', (e)=>{
    const val = document.getElementById('s6bEmail').value.trim();
    if(!val){ alert('Please write your confirmation email first.'); return; }
    e.target.disabled = true;
    e.target.textContent = 'Nice work! Continue to Section 9 when ready.';
    markActivityComplete('s6b', {completionStatus:'reached'});
  });
}

/* ---- Section 9: Self-Check ---- */
function renderS7(){
  const rows = REFLECTION.map((r,i)=>`
    <div class="rubric-row">
      <div><div class="lbl">${r}</div></div>
      <div class="rate" data-k="r${i}">
        ${[1,2,3].map(n=>`<button data-n="${n}">${n}</button>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">Self-Check</h2>
  <p class="section-sub">Rate yourself honestly: 1 = I need more practice, 2 = I'm getting there, 3 = I feel confident.</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this unit, you can take, confirm, and manage a wellness reservation or appointment.</p>
  </div>

  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">Reservations &amp; Appointments: Study Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review key reservation vocabulary, useful expressions, and booking communication tips.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="Reservations and Appointments Study Guide preview" class="guide-thumb" loading="lazy">
    <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="downloadGuideBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
  </div>`;
}
function wireS7(){
  const rateGroups = document.querySelectorAll('#app .rate');
  rateGroups.forEach(rate=>{
    rate.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...rate.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      const ratedCount = [...rateGroups].filter(r => r.querySelector('.sel')).length;
      if(ratedCount >= rateGroups.length){
        markActivityComplete('s7', {score: `self-rated ${ratedCount}/${rateGroups.length}`});
      }
    });
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 6 COMPLETE</div>
    <h1>You can <span>handle a booking.</span></h1>
    <p>Keep practicing. A confident reservation call makes every guest feel taken care of before they even arrive.</p>
    <div class="complete-actions">
      <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="completeDownloadBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
      <button class="tb-btn primary" id="completePracticeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('rotateCcw',{size:16})}</span> Practice Again</button>
      <button class="tb-btn" id="completeHomeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('home',{size:16})}</span> Back to Start</button>
      <a class="tb-btn" id="completeUnitsBtn" href="../index.html" style="padding:16px 26px;font-size:15px;">All Wellness Units</a>
    </div>
    <div class="complete-stats" id="completeStats"></div>
  </div>`;
}
let lessonCompleteSent = false;
function wireComplete(){
  document.getElementById('completePracticeBtn').addEventListener('click', ()=> goTo(1));
  document.getElementById('completeHomeBtn').addEventListener('click', ()=> goTo(0));
  const stats = document.getElementById('completeStats');
  if(stats){
    stats.innerHTML = `
      <p class="complete-stats-intro">Your progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Activities Completed</div></div>
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
  {r:renderS5b, w:wireS5b},
  {r:renderS6, w:wireS6},
  {r:renderS6b, w:wireS6b},
  {r:renderS7, w:wireS7},
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
  VoiceEngine.stop();
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
  updateTopbarBadge();
  saveCheckinState();
}
function goNext(){ if(current<RENDERERS.length-1){ current++; renderAll(); } }
function goPrev(){ if(current>0){ current--; renderAll(); } }
function goTo(i){ current = Math.max(0, Math.min(RENDERERS.length-1, i)); renderAll(); }

document.getElementById('btnNext').addEventListener('click', goNext);
document.getElementById('btnPrev').addEventListener('click', goPrev);
document.getElementById('btnHome').addEventListener('click', ()=>{ current=0; renderAll(); });
document.getElementById('btnReset').addEventListener('click', renderAll);

wireCheckin();
if(restoreCheckinState()){
  document.getElementById('checkinGate').style.display='none';
}
renderAll();
