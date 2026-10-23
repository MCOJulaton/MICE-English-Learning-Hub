/* ===================== APP STATE / ROUTER =====================
   Same router, progress, check-in and voice system as the other English for
   Communication units. Unit 1 uses the browser's own text-to-speech (American
   English) for every listening activity, so it has no audio files. */
let current = 0;
let unitState = {};
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','exit'];

const Progress = {
  studentId:'', firstName:'', lastName:'', studentName:'',
  date:'', startTime:'',
  activities:{}
};
let pendingRecords = [];

function isEndpointConfigured(){
  return typeof DATA_ENDPOINT === 'string' && DATA_ENDPOINT.trim() !== '' && DATA_ENDPOINT.indexOf('PASTE_') !== 0;
}
function buildRecord(activity, {score=null, completionStatus='completed', answers=''}={}){
  return {
    studentId: Progress.studentId,
    studentName: Progress.studentName,
    course: COURSE_META.course,
    unit: COURSE_META.unit,
    date: Progress.date,
    timestamp: new Date().toISOString(),
    activity, score, completionStatus, answers
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
  const answers = opts.answers || '';
  if(prev && prev.completionStatus===completionStatus && prev.score===score) return;
  Progress.activities[key] = { status:completionStatus, score, completionStatus };
  sendProgressRecord(buildRecord(key, {score, completionStatus, answers}));
  updateTopbarBadge();
  saveCheckinState();
}
function sendGranularRecord(label, opts={}){
  sendProgressRecord(buildRecord(label, {score: opts.score ?? null, completionStatus: opts.completionStatus || 'completed'}));
}
function completedCount(){ return TRACKED_ACTIVITIES.filter(k => Progress.activities[k]).length; }
function updateTopbarBadge(){
  const elx = document.getElementById('studentBadge');
  if(!elx) return;
  if(!Progress.studentName){ elx.style.display='none'; return; }
  elx.style.display='';
  elx.innerHTML = `<b>${Progress.studentName}</b> · ${completedCount()}/${TRACKED_ACTIVITIES.length} done <button type="button" id="studentSwitchBtn" class="student-switch-btn" title="Not you? Check in again">Switch</button>`;
  const switchBtn = document.getElementById('studentSwitchBtn');
  if(switchBtn) switchBtn.addEventListener('click', resetCheckin);
}

/* ===================== RESUME IF THE PAGE RELOADS OR CLOSES =====================
   Saves check-in + current section to this browser only (localStorage), scoped to
   this unit, so an accidental reload/back/close picks up where you left off instead
   of showing the check-in gate again. Expires at midnight so it still asks a fresh
   check-in next class rather than skipping it forever on a shared computer. */
const CHECKIN_STORAGE_KEY = 'efc_u1_checkin';
function todayStr(){ return new Date().toISOString().slice(0,10); }
function saveCheckinState(){
  if(!Progress.studentId) return;
  try{
    localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify({
      studentId: Progress.studentId, firstName: Progress.firstName, lastName: Progress.lastName,
      studentName: Progress.studentName, date: Progress.date, startTime: Progress.startTime,
      activities: Progress.activities, current, unitState
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
  unitState = saved.unitState || {};
  return true;
}
function resetCheckin(){
  clearCheckinState();
  clearSharedIdentity();
  Progress.studentId=''; Progress.firstName=''; Progress.lastName=''; Progress.studentName='';
  Progress.date=''; Progress.startTime=''; Progress.activities={};
  unitState = {};
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
}

/* ===================== STUDENT CHECK-IN ===================== */
/* ===================== REMEMBER ME (cross-unit) =====================
   A student's ID/first/last name, remembered site-wide (not per-unit, no
   daily expiry) so they don't have to retype it on every unit they open.
   This only PREFILLS the check-in form -- it never skips or auto-submits
   the gate, so check-in stays an explicit action per the rule above. */
const HUB_IDENTITY_KEY = 'hub_student_identity';
function saveSharedIdentity(id, first, last){
  try{ localStorage.setItem(HUB_IDENTITY_KEY, JSON.stringify({studentId:id, firstName:first, lastName:last})); }catch(e){}
}
function getSharedIdentity(){
  try{
    const saved = JSON.parse(localStorage.getItem(HUB_IDENTITY_KEY));
    if(!saved || !saved.studentId) return null;
    return saved;
  }catch(e){ return null; }
}
function clearSharedIdentity(){
  try{ localStorage.removeItem(HUB_IDENTITY_KEY); }catch(e){}
}
function prefillCheckinFromMemory(){
  const saved = getSharedIdentity();
  if(!saved) return;
  const idEl = document.getElementById('ciId');
  const firstEl = document.getElementById('ciFirst');
  const lastEl = document.getElementById('ciLast');
  if(idEl && !idEl.value) idEl.value = saved.studentId;
  if(firstEl && !firstEl.value) firstEl.value = saved.firstName;
  if(lastEl && !lastEl.value) lastEl.value = saved.lastName;
}

function wireCheckin(){
  const gate = document.getElementById('checkinGate');
  const form = document.getElementById('checkinForm');
  const confirmEl = document.getElementById('checkinConfirm');
  prefillCheckinFromMemory();
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
    saveSharedIdentity(id, first, last);
    applyDeepLinkAfterCheckin();
    setTimeout(()=>{ gate.style.display='none'; }, 900);
  });
}

/* ===================== VOICE ENGINE (TTS, for vocab/phrases) ===================== */
const VoiceEngine = (function(){
  let allVoices = [];
  let voiceA = null;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const QUALITY_HINTS = ['natural','neural','premium','enhanced','online','wavenet','studio'];
  const FEMALE_HINTS = ['female','kate','serena','stephanie','sonia','libby','hazel','susan','victoria','amy','emma','joanna','samantha','ava','zoe','aria','jenny','flo','shelley','sandy','moira','karen','tessa'];
  const MALE_HINTS = ['male','daniel','arthur','george','ryan','thomas','oliver','guy','matthew','james','fred','alex','eddy','reed','rocko','albert','ralph','junior'];
  const NOVELTY_HINTS = ['grandma','grandpa','bad news','good news','bahh','bells','boing','bubbles','cellos','jester','organ','superstar','trinoids','whisper','wobble','zarvox'];

  function scoreVoice(v){
    const n = v.name.toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    let score = 0;
    if(lang.startsWith('en-us')) score += 6;
    else if(lang.startsWith('en')) score += 1;
    QUALITY_HINTS.forEach(h=>{ if(n.includes(h)) score += 4; });
    FEMALE_HINTS.forEach(f=>{ if(n.includes(f)) score += 3; });
    MALE_HINTS.forEach(m=>{ if(n.includes(m)) score -= 3; });
    NOVELTY_HINTS.forEach(x=>{ if(n.includes(x)) score -= 8; });
    if(n.includes('compact') || n.includes('espeak')) score -= 5;
    return score;
  }
  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    const ranked = [...allVoices].sort((a,b)=> scoreVoice(b)-scoreVoice(a));
    voiceA = ranked[0] || allVoices[0] || null;
    onStateChange();
  }
  if('speechSynthesis' in window){
    window.speechSynthesis.onvoiceschanged = refresh;
    refresh();
  }
  function splitSentences(text){
    return text.replace(/([.!?])\s+/g,'$1|').split('|').map(s=>s.trim()).filter(Boolean);
  }
  function makeUtterance(text, opts){
    opts = opts || {};
    const u = new SpeechSynthesisUtterance(text);
    if(voiceA) u.voice = voiceA;
    u.lang = 'en-US'; u.rate = opts.rate || 0.95; u.pitch = opts.pitch || 0.98;
    return u;
  }
  function playNext(){
    if(queueIndex >= queue.length){ playing=false; paused=false; onStateChange(); return; }
    const item = queue[queueIndex];
    const sentences = splitSentences(item.text);
    let sIdx = 0;
    function playSentence(){
      if(sIdx >= sentences.length){ queueIndex++; setTimeout(playNext, 420); return; }
      const u = makeUtterance(sentences[sIdx], item.opts);
      u.onend = ()=>{ sIdx++; setTimeout(playSentence, 160); };
      window.speechSynthesis.speak(u);
    }
    playSentence();
  }
  return {
    isPlaying(){ return playing; },
    onChange(fn){ onStateChange = fn; },
    speakLine(text, opts){
      this.stop();
      queue = [{text, opts}];
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
    stop(){ window.speechSynthesis.cancel(); playing=false; paused=false; queue=[]; queueIndex=0; onStateChange(); }
  };
})();
function speak(text, opts){
  if(!('speechSynthesis' in window)) { alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakLine(text, opts);
}

function stopSpeech(){ if('speechSynthesis' in window) VoiceEngine.stop(); }

/* ===================== UNIT 1 HELPERS ===================== */
function esc(s){
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function sayBtn(text, pitch){
  return `<button type="button" class="say-btn" data-say="${esc(text)}"${pitch ? ` data-pitch="${pitch}"` : ''} aria-label="Hear: ${esc(text)}">${icon('headphones',{size:16})}<span>Hear it</span></button>`;
}
function wireSay(){
  document.querySelectorAll('#app [data-say]').forEach(b=>{
    b.addEventListener('click', ()=> speak(b.dataset.say, b.dataset.pitch ? {pitch:+b.dataset.pitch} : {}));
  });
}
function getS(k, def){ return (unitState[k] === undefined) ? def : unitState[k]; }
function setS(k, v){ unitState[k] = v; saveCheckinState(); }
function fmtTime(t){ return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`; }
let timerHandle = null;
function runTimer(el, seconds, onDone){
  if(timerHandle) clearInterval(timerHandle);
  let t = seconds;
  el.textContent = fmtTime(t);
  timerHandle = setInterval(()=>{
    t--; el.textContent = fmtTime(Math.max(t,0));
    if(t <= 0){ clearInterval(timerHandle); timerHandle = null; if(onDone) onDone(); }
  }, 1000);
}
function stopTimer(){ if(timerHandle){ clearInterval(timerHandle); timerHandle = null; } }
function stepsList(steps){ return `<ol class="u1-steps">${steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`; }
function chipRow(items){
  return `<div class="u1-chips">${items.map(t=>`<span class="u1-chip">${esc(t)}${sayBtn(t.replace(/___/g,'...').replace(/\s+\.\.\./,' '))}</span>`).join('')}</div>`;
}

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  const objectives = LESSON_OBJECTIVES.map(o=>`<li>${o}</li>`).join('');
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>Hello! <span>Nice to meet you.</span></h1>
    <p>Unit 1: Greetings and introductions.</p>
    <img class="section-hero-photo" src="../../../assets/images/efc-u1-cover.jpg" alt="Two friendly university students waving hello to each other on campus" loading="lazy">
    <div class="cover-objectives">
      <b>By the end of this lesson, you can:</b>
      <ul>${objectives}</ul>
    </div>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Speaking games</div>
      <div class="signchip"><span class="arrow">→</span> Listening game</div>
      <div class="signchip"><span class="arrow">→</span> Fun facts</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up, Hello Mingle ===== */
function renderS1(){
  const mingle = [0,1,2].map(i=>`
    <div class="checklist-row" data-mg="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">I said hello to classmate ${i+1}.</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 1 · Warm-Up</div>
  <h2 class="section-title">Hello Mingle</h2>
  <p class="section-sub">Stand up! This is a speaking game. Put your phone away. You do not need to read anything.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to play</h3>${stepsList(MINGLE.steps)}</div>
    <h3 class="u1-h3">You can say:</h3>
    ${chipRow(MINGLE.helpers)}
    <div class="u1-timer-row">
      <button class="reveal-btn" id="mgTimerBtn">Start 3-minute timer</button>
      <span class="u1-timer" id="mgTimer">3:00</span>
    </div>
  </div>
  <div class="panel">
    <h3 class="u1-h3">Check each one when you finish.</h3>
    ${mingle}
  </div>`;
}
function wireS1(){
  wireSay();
  const btn = document.getElementById('mgTimerBtn'), out = document.getElementById('mgTimer');
  btn.addEventListener('click', ()=>{
    btn.disabled = true;
    runTimer(out, 180, ()=>{ btn.disabled = false; speak('Time is up! Please sit down.'); });
  });
  const done = new Set(getS('mingle', []));
  document.querySelectorAll('#app [data-mg]').forEach(row=>{
    if(done.has(row.dataset.mg)) row.classList.add('checked');
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) done.add(row.dataset.mg); else done.delete(row.dataset.mg);
      setS('mingle', [...done]);
      if(done.size >= 3) markActivityComplete('s1', {completionStatus:'reached'});
    });
  });
}

/* ===== Section 2: Say Hello (see it, hear it) ===== */
function renderS2(){
  const times = GREETINGS_BY_TIME.map(g=>`
    <div class="u1-card">${g.img ? `<img class="u1-card-photo" src="../../../assets/images/${g.img}" alt="${esc(g.alt)}" loading="lazy">` : ''}<div class="u1-card-main">${esc(g.say)}</div><div class="u1-card-sub">${esc(g.when)}</div>${sayBtn(g.say)}</div>`).join('');
  const quiz = TIME_QUIZ.map((q,i)=>`
    <div class="sit-card">
      <p class="u1-q">What do you say at ${esc(q.time)}?</p>
      <div class="choices" data-tq="${i}">
        ${q.options.map((o,oi)=>`<button class="choice-btn" data-v="${oi}"><span class="letter">${'ABC'[oi]}</span> ${esc(o)}</button>`).join('')}
      </div>
    </div>`).join('');
  const answers = HOW_ARE_YOU.answers.map(a=>`<div class="u1-card u1-card-sm"><div class="u1-card-main">${esc(a)}</div>${sayBtn(a)}</div>`).join('');
  const frames = INTRO_FRAMES.map(f=>`
    <div class="u1-frame"><span class="u1-frame-text">${esc(f.frame)}</span>${sayBtn(f.example)}<span class="u1-frame-ex">Example: ${esc(f.example)}</span></div>`).join('');
  const build = BUILD_IT.map((b,i)=>`
    <div class="sit-card u1-build" id="bi${i}">
      <p class="u1-q">${i+1}. Tap the words in order.</p>
      <div class="u1-line" aria-live="polite"></div>
      <div class="u1-pool">${[...b.words].reverse().map((w,wi)=>`<button type="button" class="u1-word" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div>
      <div class="u1-build-actions"><button type="button" class="reveal-btn u1-undo">Start again</button></div>
      <div class="feedback u1-msg"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · See It, Hear It, Say It</div>
  <h2 class="section-title">Say Hello</h2>
  <p class="section-sub">Click "Hear it" to listen. Then say it out loud. Always say it out loud!</p>
  <div class="panel">
    <h3 class="u1-h3">Greetings: what time is it?</h3>
    <div class="u1-cards">${times}</div>
    <div class="rule-box" style="margin-top:14px;"><b>Tip</b><p style="margin:8px 0 0;">${esc(GREETING_TIP)}</p></div>
    <h3 class="u1-h3" style="margin-top:20px;">Check: choose the greeting.</h3>
    ${quiz}
  </div>
  <div class="panel">
    <h3 class="u1-h3">How are you?</h3>
    <div class="u1-ask">${esc(HOW_ARE_YOU.ask)} ${sayBtn(HOW_ARE_YOU.ask)}</div>
    <p class="section-sub" style="margin:8px 0 8px;">Answer with one of these:</p>
    <div class="u1-cards">${answers}</div>
    <div class="u1-ask" style="margin-top:12px;">Then ask back: ${esc(HOW_ARE_YOU.back)} ${sayBtn(HOW_ARE_YOU.back)}</div>
  </div>
  <div class="panel">
    <h3 class="u1-h3">Introduce yourself</h3>
    <p class="section-sub" style="margin-top:0;">Use these sentences. Change the blank to your own words.</p>
    ${frames}
  </div>
  <div class="panel">
    <h3 class="u1-h3">Build it, then say it</h3>
    <p class="section-sub" style="margin-top:0;">Tap the words to make a sentence. The computer reads it. Then say it three times!</p>
    ${build}
  </div>`;
}
function wireS2(){
  wireSay();
  const quizDone = new Set(), buildDone = new Set();
  let quizScore = 0, buildScore = 0;
  function maybeFinish(){
    if(quizDone.size >= TIME_QUIZ.length && buildDone.size >= BUILD_IT.length){
      markActivityComplete('s2', {score:`Greetings ${quizScore}/${TIME_QUIZ.length} | Build ${buildScore}/${BUILD_IT.length}`});
    }
  }
  TIME_QUIZ.forEach((q,i)=>{
    const box = document.querySelector(`[data-tq="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || quizDone.has(i)) return;
      quizDone.add(i);
      const pick = +btn.dataset.v;
      if(pick === q.correct){ btn.classList.add('correct'); quizScore++; }
      else { btn.classList.add('wrong'); [...box.children][q.correct].classList.add('correct'); }
      speak(q.options[q.correct]);
      maybeFinish();
    });
  });
  BUILD_IT.forEach((b,i)=>{
    const box = document.getElementById('bi'+i);
    const line = box.querySelector('.u1-line'), msg = box.querySelector('.u1-msg');
    const buttons = [...box.querySelectorAll('.u1-word')];
    let picked = [];
    function reset(){
      picked = []; line.textContent = ''; msg.className = 'feedback'; msg.textContent = '';
      line.classList.remove('ok','no'); buttons.forEach(x=> x.disabled = false);
    }
    buttons.forEach(btn=> btn.addEventListener('click', ()=>{
      if(btn.disabled) return;
      btn.disabled = true; picked.push(btn.dataset.w); line.textContent = picked.join(' ');
      if(picked.length === b.words.length){
        if(picked.join(' ') === b.answer){
          line.classList.add('ok');
          msg.className = 'feedback show good'; msg.textContent = 'Yes! Now say it three times.';
          speak(b.answer);
          if(!buildDone.has(i)){ buildDone.add(i); buildScore++; maybeFinish(); }
        } else {
          line.classList.add('no');
          msg.className = 'feedback show meh'; msg.textContent = 'Not yet. Tap "Start again" and try again.';
          if(!buildDone.has(i)){ buildDone.add(i); maybeFinish(); }
        }
      }
    }));
    box.querySelector('.u1-undo').addEventListener('click', reset);
  });
}

/* ===== Section 3: Who's Talking? (listening game) ===== */
function optionCard(o){
  const lines = [];
  if(o.from) lines.push(`From: ${esc(o.from)}`);
  if(o.study) lines.push(`Studies: ${esc(o.study)}`);
  if(o.fact) lines.push(`Fun fact: ${esc(o.fact)}`);
  return `<span class="u1-pick-name">${esc(o.name)}</span>${lines.map(l=>`<span class="u1-pick-line">${l}</span>`).join('')}`;
}
function renderS3(){
  const rounds = WHO_TALKING.map((r,i)=>`
    <div class="sit-card u1-round" data-wt="${i}">
      <p class="u1-q">Round ${i+1}</p>
      <div class="u1-listen-row">
        <button type="button" class="startbtn u1-play" data-play="${i}">${icon('play',{size:18})} Listen</button>
        <span class="u1-hint">You can listen again.</span>
      </div>
      <div class="u1-picks" data-picks="${i}">
        ${r.options.map((o,oi)=>`<button type="button" class="u1-pick" data-v="${oi}">${optionCard(o)}</button>`).join('')}
      </div>
      <div class="feedback u1-msg"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Listening Game</div>
  <h2 class="section-title">Who's Talking?</h2>
  <p class="section-sub">Listen to a person. Choose the right card. Listen for the name, the place, and the details. The cards are almost the same!</p>
  <div class="panel">${rounds}
    <div class="u1-score" id="wtScore"></div>
  </div>`;
}
function highlightKeys(text, keys){
  let out = esc(text);
  keys.forEach(k=>{ out = out.split(esc(k)).join(`<mark>${esc(k)}</mark>`); });
  return out;
}
function wireS3(){
  const answered = new Set(); let score = 0;
  WHO_TALKING.forEach((r,i)=>{
    const round = document.querySelector(`[data-wt="${i}"]`);
    round.querySelector('[data-play]').addEventListener('click', ()=> speak(r.say, {pitch:r.pitch}));
    const picks = round.querySelector('[data-picks]'), msg = round.querySelector('.u1-msg');
    picks.addEventListener('click', e=>{
      const btn = e.target.closest('.u1-pick'); if(!btn || answered.has(i)) return;
      answered.add(i);
      const pick = +btn.dataset.v;
      const kids = [...picks.children];
      if(pick === r.correct){ btn.classList.add('correct'); score++; msg.className = 'feedback show good'; msg.innerHTML = `Yes! You heard it. <br><span class="u1-script">${highlightKeys(r.say, r.key)}</span>`; }
      else { btn.classList.add('wrong'); kids[r.correct].classList.add('correct'); msg.className = 'feedback show meh'; msg.innerHTML = `Not this time. Read and listen again. <br><span class="u1-script">${highlightKeys(r.say, r.key)}</span>`; }
      if(answered.size >= WHO_TALKING.length){
        document.getElementById('wtScore').textContent = `Your score: ${score} / ${WHO_TALKING.length}`;
        markActivityComplete('s3', {score:`${score}/${WHO_TALKING.length}`});
      }
    });
  });
}

/* ===== Section 4: Say It! (the speaking ladder) ===== */
const LADDER = [
  {key:'L1', title:'Level 1', sub:'Read and repeat'},
  {key:'L2', title:'Level 2', sub:'Fill the frame'},
  {key:'L3', title:'Level 3', sub:'Keywords only'},
  {key:'L4', title:'Level 4', sub:'No paper!'}
];
function ladderPanel(i){
  const my = getS('my', {name:'', from:'', study:''});
  if(i === 0){
    return `
      <p class="section-sub" style="margin-top:0;">Listen to each line. Then say it out loud. You can see the words.</p>
      ${MODEL_INTRO.map(l=>`<div class="u1-frame"><span class="u1-frame-text">${esc(l)}</span>${sayBtn(l)}</div>`).join('')}
      <button type="button" class="reveal-btn" data-say="${esc(MODEL_INTRO.join(' '))}" style="margin-top:10px;">Hear the whole introduction</button>
      <button type="button" class="startbtn u1-did" data-did="L1">I said it out loud →</button>`;
  }
  if(i === 1){
    return `
      <p class="section-sub" style="margin-top:0;">Now it is about YOU. Fill the blanks. Then click "Hear my introduction".</p>
      <div class="u1-form">
        <label>My name <input type="text" class="u1-input" data-my="name" value="${esc(my.name)}" maxlength="30" autocomplete="off"></label>
        <label>I’m from <input type="text" class="u1-input" data-my="from" value="${esc(my.from)}" maxlength="30" autocomplete="off"></label>
        <label>I study <input type="text" class="u1-input" data-my="study" value="${esc(my.study)}" maxlength="30" autocomplete="off"></label>
      </div>
      <p class="u1-live" id="myIntro"></p>
      <button type="button" class="reveal-btn" id="hearMine">Hear my introduction</button>
      <button type="button" class="startbtn u1-did" data-did="L2">I said it out loud →</button>`;
  }
  if(i === 2){
    return `
      <p class="section-sub" style="margin-top:0;">Look only at the keywords. Say your full introduction.</p>
      <div class="u1-keys"><span>Hello</span><span>name</span><span>from</span><span>study</span><span>Nice to meet you</span></div>
      <button type="button" class="startbtn u1-did" data-did="L3">I said it from the keywords →</button>`;
  }
  return `
      <p class="section-sub" style="margin-top:0;">No words! Say your introduction to a partner. Look at your partner, not at the screen.</p>
      <div class="u1-nopaper" id="noPaper">Words are hidden. Ready?</div>
      <div class="u1-timer-row">
        <button class="reveal-btn" id="npBtn">Start 30 seconds</button>
        <span class="u1-timer" id="npTimer">0:30</span>
      </div>
      <button type="button" class="startbtn u1-did" data-did="L4">I said it with no paper →</button>`;
}
function renderS4(){
  const contr = SOUND_TIPS.contractions.map(c=>`<div class="u1-contr"><span>${esc(c.full)}</span><b>→</b><span class="u1-short">${esc(c.short)}</span>${sayBtn(c.short + (c.short==="I’m" ? ' Nok.' : ''))}</div>`).join('');
  const into = SOUND_TIPS.intonation.map(t=>`<div class="u1-into"><span class="u1-into-text">${esc(t.text)}</span><span class="u1-arrow ${t.arrow}">${t.arrow==='up' ? '↗' : '↘'}</span><span class="u1-into-note">${esc(t.note)}</span>${sayBtn(t.text)}</div>`).join('');
  const tabs = LADDER.map((l,i)=>`<button type="button" class="u1-lvl${i===0?' active':''}" data-lvl="${i}"><b>${l.title}</b><span>${l.sub}</span></button>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Say It!</div>
  <h2 class="section-title">Say It!</h2>
  <p class="section-sub">Each level has fewer words. At the end, you speak with no paper.</p>
  <div class="panel">
    <h3 class="u1-h3">Sound tips</h3>
    <div class="u1-tip"><b>1. Short forms</b><p>${esc(SOUND_TIPS.contractionNote)}</p>${contr}</div>
    <div class="u1-tip"><b>2. Important words</b><p>${esc(SOUND_TIPS.stress.note)}</p><div class="u1-stress">My <b>NAME</b> is Nok. ${sayBtn(SOUND_TIPS.stress.text)}</div></div>
    <div class="u1-tip"><b>3. Up or down?</b>${into}</div>
  </div>
  <div class="panel">
    <h3 class="u1-h3">The speaking ladder</h3>
    <div class="u1-levels" id="lvlTabs">${tabs}</div>
    <div class="u1-level-body" id="lvlBody"></div>
    <div class="u1-progress" id="lvlProgress"></div>
  </div>
  <div class="panel">
    <div class="assign-box"><h3>Class game: Echo Race</h3>${stepsList(ECHO_RACE.steps)}</div>
  </div>`;
}
function wireS4(){
  wireSay();
  const done = new Set(getS('ladder', []));
  let level = 0;
  const body = document.getElementById('lvlBody'), prog = document.getElementById('lvlProgress');
  function updProg(){
    prog.textContent = `Levels finished: ${done.size} / ${LADDER.length}`;
    document.querySelectorAll('#lvlTabs .u1-lvl').forEach((t,i)=>{
      t.classList.toggle('active', i === level);
      t.classList.toggle('finished', done.has(LADDER[i].key));
    });
  }
  function show(i){
    level = i; stopTimer(); body.innerHTML = ladderPanel(i);
    wireSay();
    body.querySelectorAll('[data-my]').forEach(inp=> inp.addEventListener('input', ()=>{
      const my = getS('my', {name:'', from:'', study:''}); my[inp.dataset.my] = inp.value; setS('my', my); upd();
    }));
    function upd(){
      const el = document.getElementById('myIntro'); if(!el) return;
      const my = getS('my', {name:'', from:'', study:''});
      el.innerHTML = `Hello! My name is <b>${esc(my.name || '___')}</b>. I’m from <b>${esc(my.from || '___')}</b>. I study <b>${esc(my.study || '___')}</b>. Nice to meet you.`;
    }
    upd();
    const hm = document.getElementById('hearMine');
    if(hm) hm.addEventListener('click', ()=>{
      const my = getS('my', {name:'', from:'', study:''});
      speak(`Hello! My name is ${my.name || 'Nok'}. I’m from ${my.from || 'Phuket'}. I study ${my.study || 'English'}. Nice to meet you.`);
    });
    const np = document.getElementById('npBtn');
    if(np) np.addEventListener('click', ()=>{
      np.disabled = true;
      document.getElementById('noPaper').textContent = 'Say it now!';
      runTimer(document.getElementById('npTimer'), 30, ()=>{ np.disabled = false; document.getElementById('noPaper').textContent = 'Great! Time is up.'; speak('Time is up. Great job!'); });
    });
    body.querySelectorAll('[data-did]').forEach(b=> b.addEventListener('click', ()=>{
      done.add(b.dataset.did); setS('ladder', [...done]); updProg();
      if(done.size >= LADDER.length) markActivityComplete('s4', {completionStatus:'completed'});
      if(level < LADDER.length - 1) show(level + 1);
    }));
    updProg();
  }
  document.querySelectorAll('#lvlTabs .u1-lvl').forEach(t=> t.addEventListener('click', ()=> show(+t.dataset.lvl)));
  show(0);
}

/* ===== Section 5: Fun Facts ===== */
const FACT_VERB = {'I have ...':'have', 'I can ...':'can', 'I like ...':'like', 'I live ...':'live'};
function renderS5(){
  const bank = WORD_BANK.map(g=>`
    <div class="u1-bank-group"><div class="u1-bank-title">${esc(g.group)}</div>
      <div class="u1-bank-items">${g.items.map(it=>`<button type="button" class="u1-bank-chip" data-g="${esc(g.group)}" data-it="${esc(it)}">${esc(it)}</button>`).join('')}</div></div>`).join('');
  const facts = getS('facts', ['','','']);
  const falseIdx = getS('falseIdx', '');
  const guess = TRUE_FALSE_GAME.guessFrames.map(g=>`<div class="u1-frame"><span class="u1-frame-text">${esc(g)}</span>${sayBtn(g)}</div>`).join('');
  const fq = FIND_SOMEONE.questions.map(q=>`
    <div class="u1-qa"><div class="u1-qa-q">${esc(q.q)} ${sayBtn(q.q)}</div>
      <div class="u1-qa-a"><span>${esc(q.yes)}</span>${sayBtn(q.yes)}<span>${esc(q.no)}</span>${sayBtn(q.no)}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 5 · Fun Facts</div>
  <h2 class="section-title">Fun Facts About Me</h2>
  <p class="section-sub">A fun fact is something interesting about you. You choose what to share. Keep it light and fun.</p>
  <div class="panel">
    <div class="u1-bigframe">${esc(FUN_FACT_FRAME)}</div>
    <p class="section-sub" style="margin:10px 0;">Tap a word to make a fun fact. The computer reads it.</p>
    <div class="u1-bank">${bank}</div>
    <div class="u1-output" id="factOut" aria-live="polite">Tap a word above.</div>
    <button type="button" class="reveal-btn" id="factSay" style="display:none;">Hear it again</button>
  </div>
  <div class="panel">
    <h3 class="u1-h3">My 3 facts: 2 true, 1 false</h3>
    <p class="section-sub" style="margin-top:0;">Write 3 short sentences. Mark the false one. Do not show it to your group yet!</p>
    ${[0,1,2].map(i=>`
      <div class="u1-factrow"><span class="u1-factnum">${i+1}</span>
        <input type="text" class="u1-input u1-fact" data-fact="${i}" value="${esc(facts[i])}" maxlength="60" placeholder="I have a cat." autocomplete="off">
        <label class="u1-false"><input type="radio" name="falseOne" value="${i}"${String(falseIdx)===String(i) ? ' checked' : ''}> false</label>
      </div>`).join('')}
  </div>
  <div class="panel">
    <div class="assign-box"><h3>Game 1: True or False?</h3>${stepsList(TRUE_FALSE_GAME.steps)}</div>
    <h3 class="u1-h3">You can say:</h3>${guess}
  </div>
  <div class="panel">
    <div class="assign-box"><h3>Game 2: Find Someone Who</h3><p style="margin:0 0 8px;">${esc(FIND_SOMEONE.intro)}</p></div>
    <div class="u1-qalist">${fq}</div>
    <div class="rule-box" style="margin-top:14px;"><b>Rule</b><p style="margin:8px 0 0;">${esc(FIND_SOMEONE.rule)}</p></div>
  </div>`;
}
function wireS5(){
  wireSay();
  let used = getS('factUsed', false);
  const out = document.getElementById('factOut'), sayB = document.getElementById('factSay');
  let last = '';
  document.querySelectorAll('#app .u1-bank-chip').forEach(c=> c.addEventListener('click', ()=>{
    const verb = FACT_VERB[c.dataset.g];
    last = `A fun fact about me: I ${verb} ${c.dataset.it}.`;
    out.textContent = last; sayB.style.display = ''; speak(last);
    used = true; setS('factUsed', true); check();
  }));
  sayB.addEventListener('click', ()=> { if(last) speak(last); });
  function check(){
    const facts = getS('facts', ['','','']);
    const filled = facts.every(f=> String(f).trim().length >= 3);
    if(used && filled && getS('falseIdx','') !== '') markActivityComplete('s5', {completionStatus:'reached'});
  }
  document.querySelectorAll('#app [data-fact]').forEach(inp=> inp.addEventListener('input', ()=>{
    const facts = getS('facts', ['','','']); facts[+inp.dataset.fact] = inp.value; setS('facts', facts); check();
  }));
  document.querySelectorAll('#app input[name="falseOne"]').forEach(r=> r.addEventListener('change', ()=>{ setS('falseIdx', r.value); check(); }));
  check();
}

/* ===== Section 6: Speaking Task (Speed Meeting + Introduce Yourself) ===== */
function renderS6(){
  const card = getS('partner', {});
  const keys = getS('selfKeys', {});
  const checklist = PEER_CHECKLIST.map((c,i)=>`
    <div class="checklist-row" data-pc="${i}"><div class="checklist-box">✓</div><div class="checklist-lbl">${esc(c)}</div></div>`).join('');
  const modelPlay = INTRODUCE_SELF.model.join(' ');
  return `
  <div class="section-eyebrow">Section 6 · Speaking Task</div>
  <h2 class="section-title">Introduce Yourself</h2>
  <p class="section-sub">Two parts. First you meet many classmates. Then you introduce yourself to a group, two times. No reading from paper!</p>
  <div class="panel">
    <div class="assign-box"><h3>Part A: ${esc(SPEED_MEETING.title)}</h3>${stepsList(SPEED_MEETING.steps)}</div>
    <h3 class="u1-h3">My notes card</h3>
    <p class="section-sub" style="margin-top:0;">Write short notes about a classmate you met. Notes only, not full sentences.</p>
    <div class="u1-form">
      ${PARTNER_CARD_FIELDS.map(f=>`<label>${esc(f.label)} <input type="text" class="u1-input" data-pc-field="${f.key}" value="${esc(card[f.key] || '')}" maxlength="40" autocomplete="off"></label>`).join('')}
    </div>
  </div>
  <div class="panel">
    <div class="assign-box"><h3>Part B: ${esc(INTRODUCE_SELF.title)}</h3>${stepsList(INTRODUCE_SELF.steps)}</div>
    <h3 class="u1-h3">My keyword card</h3>
    <div id="keyBox">
      <div class="u1-form">
        ${SELF_KEYWORDS.map(f=>`<label>${esc(f.label)} <input type="text" class="u1-input" data-key-field="${f.key}" value="${esc(keys[f.key] || '')}" maxlength="30" placeholder="${esc(f.ph)}" autocomplete="off"></label>`).join('')}
      </div>
    </div>
    <button type="button" class="reveal-btn" id="hideKeys" style="margin-top:10px;">Hide my keywords (round 2)</button>
    <h3 class="u1-h3" style="margin-top:18px;">Model</h3>
    <div class="scenario-message">${INTRODUCE_SELF.model.map(l=>`${esc(l)} ${sayBtn(l)}`).join('<br>')}</div>
    <button type="button" class="reveal-btn" data-say="${esc(modelPlay)}" style="margin-top:10px;">Hear the whole model</button>
  </div>
  <div class="panel">
    <h3 class="u1-h3">Partner checklist</h3>
    <p class="section-sub" style="margin-top:0;">A classmate listens. Check what you did.</p>
    ${checklist}
    <div class="u1-score" id="pcScore">0 / ${PEER_CHECKLIST.length}</div>
    <button type="button" class="startbtn" id="s6done" style="margin-top:14px;">We finished the task →</button>
  </div>`;
}
function wireS6(){
  wireSay();
  document.querySelectorAll('#app [data-pc-field]').forEach(inp=> inp.addEventListener('input', ()=>{
    const card = getS('partner', {}); card[inp.dataset.pcField] = inp.value; setS('partner', card);
  }));
  document.querySelectorAll('#app [data-key-field]').forEach(inp=> inp.addEventListener('input', ()=>{
    const keys = getS('selfKeys', {}); keys[inp.dataset.keyField] = inp.value; setS('selfKeys', keys);
  }));
  const hk = document.getElementById('hideKeys'), kb = document.getElementById('keyBox');
  hk.addEventListener('click', ()=>{
    const hide = kb.style.display !== 'none';
    kb.style.display = hide ? 'none' : '';
    hk.textContent = hide ? 'Show my keywords' : 'Hide my keywords (round 2)';
  });
  const checked = new Set(getS('peer', []));
  const score = document.getElementById('pcScore');
  function upd(){ score.textContent = `${checked.size} / ${PEER_CHECKLIST.length}`; }
  document.querySelectorAll('#app [data-pc]').forEach(row=>{
    if(checked.has(row.dataset.pc)) row.classList.add('checked');
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.pc); else checked.delete(row.dataset.pc);
      setS('peer', [...checked]); upd();
    });
  });
  upd();
  document.getElementById('s6done').addEventListener('click', ()=>{
    markActivityComplete('s6', {score:`${checked.size}/${PEER_CHECKLIST.length}`});
    goNext();
  });
}

/* ===== Section 7: Self-Check ===== */
function renderS7(){
  const saved = getS('can', {});
  const rows = CAN_DO.map((c,i)=>`
    <div class="rubric-row"><div><div class="lbl">${esc(c)}</div></div>
      <div class="rate" data-can="${i}">${SCALE.map(s=>`<button type="button" data-pts="${s.v}" class="${saved[i]===s.v ? 'sel' : ''}">${esc(s.label)}</button>`).join('')}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 7 · Self-Check</div>
  <h2 class="section-title">What Can You Do?</h2>
  <p class="section-sub">Be honest. This is for you. Choose one for each sentence.</p>
  <div class="panel">${rows}
    <div class="u1-score" id="canTotal"></div>
    <div class="feedback" id="canMsg"></div>
  </div>
  <div class="panel u1-extra">
    <h3 class="u1-h3">Practice at home</h3>
    <p class="section-sub" style="margin-top:0;">${esc(EXTRA.note)}</p>
    <a class="startbtn u1-extra-link" href="${EXTRA.href}" target="_blank" rel="noopener">${esc(EXTRA.label)} →</a>
  </div>`;
}
function wireS7(){
  const saved = getS('can', {});
  function upd(){
    const vals = Object.values(saved);
    const total = vals.reduce((a,b)=>a+b,0);
    document.getElementById('canTotal').textContent = vals.length ? `Your score: ${total} / ${CAN_DO.length*3}` : '';
    const msg = document.getElementById('canMsg');
    if(vals.length >= CAN_DO.length){
      msg.className = 'feedback show ' + (total >= 15 ? 'good' : 'meh');
      msg.textContent = total >= 15 ? 'Great! You are ready for Unit 2.' : 'Good start! Practice the "Not yet" ones with a friend.';
      markActivityComplete('s7', {score:`${total}/${CAN_DO.length*3}`});
    }
  }
  document.querySelectorAll('#app [data-can]').forEach(row=>{
    row.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...row.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      saved[row.dataset.can] = +btn.dataset.pts; setS('can', saved); upd();
    });
  });
  upd();
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 1 COMPLETE</div>
    <div class="u1-wave" aria-hidden="true">🎉</div>
    <h1>You can <span>say hello and introduce yourself.</span></h1>
    <p>Next: Unit 2 will be about small talk. Keep practicing your introduction!</p>
    <div class="complete-actions">
      <button class="tb-btn primary" id="completePracticeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('rotateCcw',{size:16})}</span> Practice Again</button>
      <button class="tb-btn" id="completeHomeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('home',{size:16})}</span> Back to Start</button>
      <a class="tb-btn" id="completeUnitsBtn" href="../index.html" style="padding:16px 26px;font-size:15px;">All Communication Units</a>
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

/* ===== Exit Ticket (shared component, see js/exit-ticket.js) ===== */
function renderExit(){ return renderExitTicket(EXIT_CFG); }
function wireExit(){
  wireExitTicket(EXIT_CFG, (score, note)=> markActivityComplete('exit', {score, answers: note}));
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
  {r:renderExit, w:wireExit},
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
  buildProgress();
  stopSpeech(); stopTimer();
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
