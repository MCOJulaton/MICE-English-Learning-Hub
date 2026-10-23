/* ===================== APP STATE / ROUTER =====================
   Same router, progress, check-in and voice system as the other English for
   Communication units. Unit 5 uses the browser's own text-to-speech (American
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','practice','s8','exit'];

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
const CHECKIN_STORAGE_KEY = 'efc_u5_checkin';
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
  const tabKey = params.get('tab');
  if(tabKey){
    setTimeout(()=>{
      const tabBtn = document.querySelector('#app [data-ptab="'+tabKey+'"]');
      if(tabBtn) tabBtn.click();
    }, 50);
  }
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
    speakSequence(items){
      this.stop();
      queue = items; queueIndex = 0; playing = true; paused = false; onStateChange();
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

/* ===================== UNIT 5 HELPERS (shared) ===================== */
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
function stepsList(steps){ return `<ol class="u5-steps">${steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`; }
function chipRow(items){
  return `<div class="u5-chips">${items.map(t=>`<span class="u5-chip">${esc(t)}${sayBtn(t.replace(/___/g,'...').replace(/\s+\.\.\./,' '))}</span>`).join('')}</div>`;
}

/* ===================== UNIT 5 HELPERS (chat) ===================== */
function speakChat(lines){
  if(!('speechSynthesis' in window)){ alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakSequence(lines.map(l=>({text:l.text, opts:VOICE[l.who]})));
}
function chatHtml(lines, withRoles){
  return `<div class="u5-chat">${lines.map(l=>`
    <div class="u5-bubble ${l.who === 'A' ? 'a' : 'b'}">
      <span class="u5-who">${l.who}</span>
      <span class="u5-line">${esc(l.text)}</span>
      ${withRoles && l.role ? `<span class="u5-role r-${l.role}">${esc(ROLE_LABEL[l.role])}</span>` : ''}
    </div>`).join('')}</div>`;
}
function pickRow(options, attr, idx){
  return `<div class="choices" ${attr}="${idx}">${options.map((o,oi)=>`<button type="button" class="choice-btn" data-v="${oi}"><span class="letter">${'ABC'[oi]}</span> ${esc(o)}</button>`).join('')}</div>`;
}

/* ===================== SECTION RENDERERS ===================== */
function quizHtml(list, attr){
  return list.map((q,i)=>`<div class="sit-card"><p class="u5-q">${esc(q.q)}</p>${pickRow(q.options, attr, i)}</div>`).join('');
}
function wireQuiz(attr, list, done, onRight, after){
  list.forEach((q,i)=>{
    const box = document.querySelector(`[${attr}="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || done.has(i)) return;
      done.add(i);
      const kids = [...box.children];
      if(+btn.dataset.v === q.correct){ btn.classList.add('correct'); onRight(); }
      else { btn.classList.add('wrong'); kids[q.correct].classList.add('correct'); }
      if(after) after();
    });
  });
}
function checkRows(attr, list){
  return list.map((t,i)=>`<div class="checklist-row" data-${attr}="${i}"><div class="checklist-box">✓</div><div class="checklist-lbl">${esc(t)}</div></div>`).join('');
}
function photoStrip(showNames){
  const order = [['wake','Wake up'],['ready','Get ready'],['class','Attend class'],['notes','Review notes'],['bed','Go to bed']];
  return `<div class="u5-photos" id="u5Photos">${order.map(([k,n])=>`
    <div class="u5-photo"><img src="${SECTION_PHOTOS[k].src}" alt="${esc(SECTION_PHOTOS[k].alt)}" loading="lazy"><span class="u5-photo-name${showNames ? '' : ' hide'}">${n}</span></div>`).join('')}</div>`;
}

function renderCover(){
  const objectives = LESSON_OBJECTIVES.map(o=>`<li>${o}</li>`).join('');
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>My Daily <span>Routine</span></h1>
    <p>Unit 5: Tell about your day. Wake up, get ready, attend class, review notes, go to bed.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.wake.src}" alt="${SECTION_PHOTOS.wake.alt}" loading="lazy">
    <div class="cover-objectives">
      <b>By the end of this lesson, you can:</b>
      <ul>${objectives}</ul>
    </div>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Clock times with "at"</div>
      <div class="signchip"><span class="arrow">→</span> First, Then, After that</div>
      <div class="signchip"><span class="arrow">→</span> Tell your day</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up, Act It Out ===== */
function renderS1(){
  return `
  <div class="section-eyebrow">Section 1 · Warm-Up</div>
  <h2 class="section-title">Act It Out</h2>
  <p class="section-sub">A guessing game with no paper. Put your phone away.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to play</h3>${stepsList(ACT_IT_OUT.steps)}</div>
    <h3 class="u5-h3">Say these sentences out loud.</h3>
    ${chipRow(ACT_IT_OUT.sentences)}
    <h3 class="u5-h3" style="margin-top:16px;">You can say:</h3>
    ${chipRow(ACT_IT_OUT.helpers)}
  </div>
  <div class="panel">
    <h3 class="u5-h3">Check each one when you finish.</h3>
    ${checkRows('ac', ACT_CHECKS)}
  </div>`;
}
function wireS1(){
  wireSay();
  const done = new Set(getS('act', []));
  document.querySelectorAll('#app [data-ac]').forEach(row=>{
    if(done.has(row.dataset.ac)) row.classList.add('checked');
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) done.add(row.dataset.ac); else done.delete(row.dataset.ac);
      setS('act', [...done]);
      if(done.size >= ACT_CHECKS.length) markActivityComplete('s1', {completionStatus:'reached'});
    });
  });
}

/* ===== Section 2: Words and Times ===== */
function renderS2(){
  const cards = VOCAB.map(v=>{
    const photo = SECTION_PHOTOS[v.id];
    const ex = v.ex.replace(/"/g,'');
    return `
    <div class="u5-card">
      ${photo ? `<img class="u5-card-photo" src="${photo.src}" alt="${esc(photo.alt)}" loading="lazy">` : ''}
      <div class="u5-card-main">${v.ic} ${esc(v.nm)}</div>
      <div class="u5-card-sub">${esc(v.thai)}<br>${esc(ex)}</div>${sayBtn(ex)}
    </div>`;
  }).join('');
  const times = CLOCK_TIMES.map(c=>`
    <div class="u5-time"><span class="u5-time-digits">${esc(c.digits)}</span><span class="u5-time-say">${esc(c.say)}</span><span class="u5-time-ex">${esc(c.ex)}</span>${sayBtn(c.ex)}</div>`).join('');
  const frames = USUALLY_FRAMES.map(f=>`
    <div class="u5-frame"><span class="u5-frame-text">${esc(f.frame)}</span>${sayBtn(f.example)}<span class="u5-frame-ex">Example: ${esc(f.example)}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · See It, Hear It, Say It</div>
  <h2 class="section-title">Words and Times</h2>
  <p class="section-sub">Click "Hear it" to listen. Then say it out loud. Always say it out loud!</p>
  <div class="panel">
    <h3 class="u5-h3">The 5 routine words</h3>
    <div class="u5-cards">${cards}</div>
  </div>
  <div class="panel">
    <h3 class="u5-h3">Clock times with "at"</h3>
    ${times}
    <div class="rule-box" style="margin-top:14px;"><b>Tip</b><p style="margin:8px 0 0;">${esc(AT_RULE)}</p></div>
  </div>
  <div class="panel">
    <h3 class="u5-h3">Sentences to use</h3>
    ${frames}
    <h3 class="u5-h3" style="margin-top:20px;">Check: the grammar</h3>
    ${quizHtml(GRAMMAR_CHECK.map(g=>({q:g.q, options:g.opts, correct:g.correct})), 'data-gq')}
    <h3 class="u5-h3" style="margin-top:20px;">Check: times</h3>
    ${quizHtml(TIME_QUIZ, 'data-tq')}
  </div>`;
}
function wireS2(){
  wireSay();
  const G = GRAMMAR_CHECK.map(g=>({q:g.q, options:g.opts, correct:g.correct}));
  const d1=new Set(), d2=new Set(); let s1=0, s2=0;
  function maybeFinish(){
    if(d1.size>=G.length && d2.size>=TIME_QUIZ.length){
      markActivityComplete('s2', {score:`Grammar ${s1}/${G.length} | Times ${s2}/${TIME_QUIZ.length}`});
    }
  }
  wireQuiz('data-gq', G, d1, ()=>{ s1++; }, maybeFinish);
  wireQuiz('data-tq', TIME_QUIZ, d2, ()=>{ s2++; }, maybeFinish);
}

/* ===== Section 3: Listen for the Time ===== */
function renderS3(){
  const times = LISTEN_TIMES.map((c,i)=>`
    <div class="sit-card"><div class="u5-listen-row"><button type="button" class="startbtn u5-play" data-heart="${i}">${icon('play',{size:18})} Listen</button><span class="u5-hint">Which time do you hear?</span></div>
      ${pickRow(c.options,'data-lt',i)}</div>`).join('');
  const sents = LAB_LISTEN.map((c,i)=>`
    <div class="sit-card"><div class="u5-listen-row"><button type="button" class="startbtn u5-play" data-hears="${i}">${icon('play',{size:18})} Listen</button><span class="u5-hint">Which sentence matches?</span></div>
      ${pickRow(c.opts,'data-ls',i)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Listening</div>
  <h2 class="section-title">Listen for the Time</h2>
  <p class="section-sub">Six thirty or seven thirty? Listen carefully. Part A: the time. Part B: the sentence.</p>
  <div class="panel"><h3 class="u5-h3">Part A: Which time?</h3>${times}</div>
  <div class="panel"><h3 class="u5-h3">Part B: Which sentence?</h3>${sents}
    <div class="u5-score" id="lcScore"></div></div>`;
}
function wireS3(){
  const needed = LISTEN_TIMES.length + LAB_LISTEN.length;
  let answered = 0, correct = 0;
  function bump(isRight){
    answered++; if(isRight) correct++;
    if(answered >= needed){
      document.getElementById('lcScore').textContent = `Your score: ${correct} / ${needed}`;
      markActivityComplete('s3', {score:`${correct}/${needed}`});
    }
  }
  LISTEN_TIMES.forEach((c,i)=>{
    document.querySelector(`[data-heart="${i}"]`).addEventListener('click', ()=> speak(c.say, {pitch:c.pitch}));
    const box = document.querySelector(`[data-lt="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || box.dataset.done) return;
      box.dataset.done = '1';
      const kids = [...box.children]; const right = +btn.dataset.v === c.correct;
      btn.classList.add(right ? 'correct' : 'wrong'); if(!right) kids[c.correct].classList.add('correct');
      bump(right);
    });
  });
  LAB_LISTEN.forEach((c,i)=>{
    document.querySelector(`[data-hears="${i}"]`).addEventListener('click', ()=> speak(c.audio));
    const box = document.querySelector(`[data-ls="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || box.dataset.done) return;
      box.dataset.done = '1';
      const kids = [...box.children]; const right = +btn.dataset.v === c.correct;
      btn.classList.add(right ? 'correct' : 'wrong'); if(!right) kids[c.correct].classList.add('correct');
      bump(right);
    });
  });
}

/* ===== Section 4: Say It! ===== */
const LADDER = [
  {key:'L1', title:'Level 1', sub:'Read and repeat'},
  {key:'L2', title:'Level 2', sub:'Fill the frame'},
  {key:'L3', title:'Level 3', sub:'Pictures only'},
  {key:'L4', title:'Level 4', sub:'No paper!'}
];
function myDay(){ return getS('myDay', {v1:'', t1:'', v2:'', v3:'', v4:'', t4:''}); }
function daySentence(){
  const m = myDay();
  const t4 = m.t4 || 'ten p.m.';
  return `First, I ${m.v1 || 'wake up'} at ${m.t1 || 'six thirty'}. Then, I ${m.v2 || 'get ready'}. After that, I ${m.v3 || 'attend class'}. Finally, I ${m.v4 || 'go to bed'} at ${t4}${/\.$/.test(t4) ? '' : '.'}`;
}
function ladderPanel(i){
  const m = myDay();
  if(i === 0){
    return `
      <p class="section-sub" style="margin-top:0;">Listen to each line. Say it out loud. Then say all four lines.</p>
      ${LADDER_MODEL.map(l=>`<div class="u5-frame"><span class="u5-frame-text">${esc(l)}</span>${sayBtn(l)}</div>`).join('')}
      <button type="button" class="reveal-btn" data-say="${esc(LADDER_MODEL.join(' '))}" style="margin-top:10px;">Hear all four lines</button>
      <button type="button" class="startbtn u5-did" data-did="L1">I said it out loud →</button>`;
  }
  if(i === 1){
    return `
      <p class="section-sub" style="margin-top:0;">Use YOUR day. Fill the blanks. Then click "Hear mine".</p>
      <div class="u5-form">
        <label>First, I <input type="text" class="u5-input" data-my="v1" value="${esc(m.v1)}" maxlength="30" placeholder="wake up" autocomplete="off"></label>
        <label>at <input type="text" class="u5-input" data-my="t1" value="${esc(m.t1)}" maxlength="20" placeholder="six thirty" autocomplete="off"></label>
        <label>Then, I <input type="text" class="u5-input" data-my="v2" value="${esc(m.v2)}" maxlength="30" placeholder="get ready" autocomplete="off"></label>
        <label>After that, I <input type="text" class="u5-input" data-my="v3" value="${esc(m.v3)}" maxlength="30" placeholder="attend class" autocomplete="off"></label>
        <label>Finally, I <input type="text" class="u5-input" data-my="v4" value="${esc(m.v4)}" maxlength="30" placeholder="go to bed" autocomplete="off"></label>
        <label>at <input type="text" class="u5-input" data-my="t4" value="${esc(m.t4)}" maxlength="20" placeholder="ten p.m." autocomplete="off"></label>
      </div>
      <p class="u5-live" id="myDayText"></p>
      <button type="button" class="reveal-btn" id="hearMine">Hear mine</button>
      <button type="button" class="startbtn u5-did" data-did="L2">I said it out loud →</button>`;
  }
  if(i === 2){
    return `
      <p class="section-sub" style="margin-top:0;">Look only at the pictures. Tell your day to a partner. No full sentences.</p>
      ${photoStrip(false)}
      <div class="u5-keys"><span>FIRST</span><span>THEN</span><span>AFTER THAT</span><span>FINALLY</span><span>AT + TIME</span></div>
      <button type="button" class="startbtn u5-did" data-did="L3">I told my day from the pictures →</button>`;
  }
  return `
      <p class="section-sub" style="margin-top:0;">No words! Tell your day to a partner. Use clock times. Look at your partner, not the screen.</p>
      <div class="u5-nopaper" id="noPaper">Words are hidden. Ready?</div>
      <div class="u5-timer-row"><button class="reveal-btn" id="npBtn">Start 1 minute</button><span class="u5-timer" id="npTimer">1:00</span></div>
      <button type="button" class="startbtn u5-did" data-did="L4">I talked with no paper →</button>`;
}
function renderS4(){
  const t = SOUND_TIPS;
  const tabs = LADDER.map((l,i)=>`<button type="button" class="u5-lvl${i===0?' active':''}" data-lvl="${i}"><b>${l.title}</b><span>${l.sub}</span></button>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Say It!</div>
  <h2 class="section-title">Say It!</h2>
  <p class="section-sub">Each level has fewer words. At the end, you speak with no paper.</p>
  <div class="panel">
    <h3 class="u5-h3">Sound tips</h3>
    <div class="u5-tip"><b>1. "At" is weak, the time is strong</b><div class="u5-into"><span class="u5-into-text">${esc(t.weakAt.text)}</span><span class="u5-into-note">${esc(t.weakAt.note)}</span>${sayBtn(t.weakAt.text)}</div></div>
    <div class="u5-tip"><b>2. "Usually" is short</b><p>${esc(t.usually.note)}</p><div class="u5-contr"><span>${esc(t.usually.written)}</span><b>→</b><span class="u5-short">${esc(t.usually.fast)}</span>${sayBtn(t.usually.ex)}</div></div>
    <div class="u5-tip"><b>3. A small pause</b><div class="u5-into"><span class="u5-into-text">${esc(t.pause.text)}</span><span class="u5-into-note">${esc(t.pause.note)}</span>${sayBtn(t.pause.text)}</div></div>
  </div>
  <div class="panel">
    <h3 class="u5-h3">The speaking ladder</h3>
    <div class="u5-levels" id="lvlTabs">${tabs}</div>
    <div class="u5-level-body" id="lvlBody"></div>
    <div class="u5-progress" id="lvlProgress"></div>
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
    document.querySelectorAll('#lvlTabs .u5-lvl').forEach((t,i)=>{
      t.classList.toggle('active', i === level);
      t.classList.toggle('finished', done.has(LADDER[i].key));
    });
  }
  function show(i){
    level = i; stopTimer(); body.innerHTML = ladderPanel(i);
    wireSay();
    function upd(){
      const el = document.getElementById('myDayText'); if(!el) return;
      const m = myDay();
      el.innerHTML = `First, I <b>${esc(m.v1 || '___')}</b> at <b>${esc(m.t1 || '___')}</b>. Then, I <b>${esc(m.v2 || '___')}</b>. After that, I <b>${esc(m.v3 || '___')}</b>. Finally, I <b>${esc(m.v4 || '___')}</b> at <b>${esc(m.t4 || '___')}</b>${/\.$/.test(m.t4 || '') ? '' : '.'}`;
    }
    body.querySelectorAll('[data-my]').forEach(inp=>{
      inp.addEventListener('input', ()=>{ const m = myDay(); m[inp.dataset.my] = inp.value; setS('myDay', m); upd(); });
    });
    upd();
    const hm = document.getElementById('hearMine');
    if(hm) hm.addEventListener('click', ()=> speak(daySentence()));
    const np = document.getElementById('npBtn');
    if(np) np.addEventListener('click', ()=>{
      np.disabled = true; document.getElementById('noPaper').textContent = 'Talk now!';
      runTimer(document.getElementById('npTimer'), 60, ()=>{ np.disabled = false; document.getElementById('noPaper').textContent = 'Great! Time is up.'; speak('Time is up. Great job!'); });
    });
    body.querySelectorAll('[data-did]').forEach(b=> b.addEventListener('click', ()=>{
      done.add(b.dataset.did); setS('ladder', [...done]); updProg();
      if(done.size >= LADDER.length) markActivityComplete('s4', {completionStatus:'completed'});
      if(level < LADDER.length - 1) show(level + 1);
    }));
    updProg();
  }
  document.querySelectorAll('#lvlTabs .u5-lvl').forEach(t=> t.addEventListener('click', ()=> show(+t.dataset.lvl)));
  show(0);
}

/* ===== Section 5: Find Someone Who ===== */
function renderS5(){
  const squares = BINGO_ITEMS.map((item,i)=>{
    if(item.free) return `<div class="bingo-sq free"><div class="b-em"></div><div class="b-txt">FREE</div></div>`;
    return `<div class="bingo-sq" data-sq="${i}"><div class="b-em">${item.ic}</div><div class="b-txt">${item.short}</div></div>`;
  }).join('');
  const starters = REPORT_STARTERS.map(s=>`<div class="u5-frame"><span class="u5-frame-text">${esc(s)}</span>${sayBtn(s)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 5 · Ask and Answer</div>
  <h2 class="section-title">Find Someone Who... Bingo</h2>
  <p class="section-sub">Walk and talk! Ask classmates the full question and tap the square to save their name.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to play</h3>${stepsList(BINGO_TIPS)}</div>
    <div class="bingo-grid">${squares}</div>
    <div id="bingoWinBanner" class="bingo-win-banner" style="display:none;">BINGO! Keep asking or move on when you're ready.</div>
    <div id="bingoEditor"></div>
  </div>
  <div class="panel">
    <h3 class="u5-h3">${esc(REPORT_TIP.title)}</h3>
    ${starters}
    <div class="rule-box" style="margin-top:14px;"><b>Tip</b><p style="margin:8px 0 0;">${esc(REPORT_TIP.note)}</p></div>
  </div>`;
}
function wireS5(){
  wireSay();
  const filled = {};
  const grid = document.querySelector('#app .bingo-grid');
  const editorWrap = document.getElementById('bingoEditor');
  const winBanner = document.getElementById('bingoWinBanner');
  function checkWin(){ return BINGO_LINES.some(line => line.every(idx => idx===12 || filled[idx]!==undefined)); }
  function closeEditor(){ editorWrap.innerHTML=''; }
  grid.addEventListener('click', e=>{
    const sq = e.target.closest('.bingo-sq[data-sq]'); if(!sq) return;
    const i = +sq.dataset.sq;
    const item = BINGO_ITEMS[i];
    editorWrap.innerHTML = `
      <div class="bingo-editor">
        <div class="beq">"${esc(item.q)}" ${sayBtn(item.q)}</div>
        <input class="lvl-input" id="bingoNameInput" placeholder="Classmate's name" value="${esc(filled[i]||'')}">
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="tb-btn primary" id="bingoSave">Save</button>
          <button class="tb-btn" id="bingoCancel">Cancel</button>
        </div>
      </div>`;
    wireSay();
    document.getElementById('bingoSave').addEventListener('click', ()=>{
      const name = document.getElementById('bingoNameInput').value.trim();
      if(!name) return;
      filled[i] = name;
      sq.classList.add('filled');
      sq.querySelector('.b-txt').textContent = name;
      closeEditor();
      if(checkWin()) winBanner.style.display='block';
      if(Object.keys(filled).length >= 5) markActivityComplete('s5', {score:`${Object.keys(filled).length}/24`});
    });
    document.getElementById('bingoCancel').addEventListener('click', closeEditor);
  });
}

/* ===== Section 6: Speaking Task, Tell Your Day ===== */
function renderS6(){
  const qs = INTERVIEW_QUESTIONS.map(q=>`<div class="u5-frame"><span class="u5-frame-text">${esc(q)}</span>${sayBtn(q)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 6 · Speaking Task</div>
  <h2 class="section-title">${esc(TELL_DAY.title)}</h2>
  <p class="section-sub">Tell a partner about your day in 1 minute. No reading from paper!</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(TELL_DAY.steps)}</div>
    <h3 class="u5-h3">My 5 picture cards</h3>
    ${photoStrip(true)}
    <button type="button" class="reveal-btn" id="hideNames" style="margin-top:10px;">Hide the names (pictures only)</button>
    <div class="u5-timer-row"><button class="reveal-btn" id="tourBtn">Start 1 minute</button><span class="u5-timer" id="tourTimer">1:00</span></div>
  </div>
  <div class="panel">
    <h3 class="u5-h3">A model day</h3>
    <div class="scenario-message">${TELL_DAY.model.map(l=>`${esc(l)} ${sayBtn(l)}`).join('<br>')}</div>
    <button type="button" class="reveal-btn" data-say="${esc(TELL_DAY.model.join(' '))}" style="margin-top:10px;">Hear the whole model</button>
    <h3 class="u5-h3" style="margin-top:18px;">Questions your partner can ask (choose 2)</h3>
    ${qs}
  </div>
  <div class="panel">
    <h3 class="u5-h3">Partner checklist</h3>
    <p class="section-sub" style="margin-top:0;">Your partner listens. Check what you did.</p>
    ${checkRows('pc', PEER_CHECKLIST)}
    <div class="u5-score" id="pcScore">0 / ${PEER_CHECKLIST.length}</div>
    <button type="button" class="startbtn" id="s6done" style="margin-top:14px;">We finished the task →</button>
  </div>`;
}
function wireS6(){
  wireSay();
  document.getElementById('hideNames').addEventListener('click', e=>{
    const names = document.querySelectorAll('#u5Photos .u5-photo-name');
    const hide = !names[0].classList.contains('hide');
    names.forEach(n=> n.classList.toggle('hide', hide));
    e.target.textContent = hide ? 'Show the names' : 'Hide the names (pictures only)';
  });
  const tb = document.getElementById('tourBtn');
  tb.addEventListener('click', ()=>{
    tb.disabled = true;
    runTimer(document.getElementById('tourTimer'), 60, ()=>{ tb.disabled = false; speak('Time is up. Change roles!'); });
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

/* ===== Section 7: Vlog Assignment ===== */
function renderS7(){
  const phraseGroup = (title, items) => `
    <div class="phrase-group">
      <h4>${title}</h4>
      ${items.map(p=>`<div class="u5-frame"><span class="u5-frame-text">${esc(p)}</span>${sayBtn(p)}</div>`).join('')}
    </div>`;
  return `
  <div class="section-eyebrow">Section 7 · Take Home</div>
  <h2 class="section-title">"A Day in My Life" Vlog</h2>
  <p class="section-sub">It is the same talk as Tell Your Day, but you film it. Just like a TikTok or Reels "day in my life" video.</p>
  <div class="panel">
    <span class="deadline-chip"><span data-deadline="a-comm-u5-vlog">Deadline to be announced</span> · Submit on OpenChat</span>
    <div class="assign-box">
      <h3>Make a 1–2 minute vlog</h3>
      <ul>
        <li>Length: <b>1–2 minutes</b></li>
        <li>Use at least <b>4</b> routine phrases from today's lesson</li>
        <li>Use at least <b>2</b> vlog phrases (hook, transition, or outro)</li>
        <li>Mention at least <b>3</b> different times of day, with "at"</li>
        <li>Use at least <b>3</b> order words: First, Then, After that, Finally</li>
        <li>Send the video file or link on <b>OpenChat</b> by <b>Friday</b></li>
      </ul>
    </div>
    ${phraseGroup('Hook (start strong)', VLOG_HOOKS)}
    ${phraseGroup('Transitions (move through your day)', VLOG_TRANSITIONS)}
    ${phraseGroup('Routine phrases (from today)', VLOG_ROUTINE)}
    ${phraseGroup('Outro (end it well)', VLOG_OUTRO)}
    <button class="startbtn" id="s7done" style="margin-top:18px;">I understand the assignment →</button>
  </div>`;
}
function wireS7(){
  wireSay();
  document.getElementById('s7done').addEventListener('click', ()=>{ markActivityComplete('s7'); goNext(); });
}

/* ===== Practice at Home (the old practice sets, now take-home) ===== */
function renderPractice(){
  const mc = (list, attr, withExplain) => list.map((item,i)=>`
    <div class="sit-card" data-${attr}="${i}">
      <p class="u5-q">${i+1}. ${item.q || item.text}</p>
      <div class="choices" data-${attr}c="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-${attr}fb="${i}"></div>
    </div>`).join('');
  const timeCards = LAB_TIME.map(item=>`
    <div class="sit-card">
      <p class="u5-q">${item.q}</p>
      <div class="choices">
        ${item.choices.map(c=>`<button class="choice-btn" data-selfreport="1"><span class="letter">•</span> ${c}</button>`).join('')}
      </div>
    </div>`).join('');
  const listenCards = LAB_LISTEN.map((item,i)=>`
    <div class="sit-card" data-lq="${i}">
      <div class="u5-listen-row"><button type="button" class="startbtn u5-play" data-lplay="${i}">${icon('play',{size:18})} Listen</button><span class="u5-hint">Listen, then choose the matching sentence.</span></div>
      <div class="choices" style="margin-top:14px;" data-lchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-lfb="${i}"></div>
    </div>`).join('');
  const speakCards = LAB_SPEAK_PROMPTS.map(p=>`
    <div class="sit-card">
      <p class="u5-q" style="color:var(--orange-deep);">${p.text}</p>
      <div class="keyword-row">${LAB_SPEAK_STARTERS.map(s=>`<span class="kw">${s}</span>`).join('')}</div>
    </div>`).join('');
  const disc = DISCUSSION_PROMPTS.map(p=>`<div class="u5-frame"><span class="u5-frame-text">${esc(p)}</span>${sayBtn(p)}</div>`).join('');
  return `
  <div class="section-eyebrow">Practice at Home</div>
  <h2 class="section-title">Practice at Home</h2>
  <p class="section-sub">Quizzes and extra practice for home. Vocabulary • Grammar • Your Time • Listen • Speak.</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-ptab="vocab">1. Vocab Review</button>
      <button class="tab-btn" data-ptab="grammar">2. Grammar Check</button>
      <button class="tab-btn" data-ptab="time">3. Your Time</button>
      <button class="tab-btn" data-ptab="listen">4. Listen &amp; Choose</button>
      <button class="tab-btn" data-ptab="speak">5. Speak It</button>
    </div>
    <div class="tab-panel active" data-ppanel="vocab">${mc(LAB_VOCAB,'v')}</div>
    <div class="tab-panel" data-ppanel="grammar">${mc(LAB_GRAMMAR,'gg')}<h3 class="u5-h3" style="margin-top:18px;">Fill the blank</h3>${mc(PRACTICE_SENTENCES,'ps')}</div>
    <div class="tab-panel" data-ppanel="time"><p class="u5-hint" style="margin-bottom:10px;">No wrong answers. Just tell us about your own routine.</p>${timeCards}</div>
    <div class="tab-panel" data-ppanel="listen">${listenCards}</div>
    <div class="tab-panel" data-ppanel="speak">
      ${speakCards}
      <h3 class="u5-h3" style="margin-top:14px;">Talk about it with a friend</h3>${disc}
      <p class="u5-hint" style="margin-top:10px;">This site cannot grade your pronunciation. Say your answer aloud and ask your teacher or partner to check it.</p>
    </div>
  </div>`;
}
function wirePractice(){
  wireSay();
  const vA = new Set(); let vC = 0; const gA = new Set(); let gC = 0;
  function overall(){
    if(vA.size >= LAB_VOCAB.length && gA.size >= LAB_GRAMMAR.length) markActivityComplete('practice', {score:`Vocab ${vC}/${LAB_VOCAB.length} | Grammar ${gC}/${LAB_GRAMMAR.length}`});
  }
  document.querySelectorAll('#app [data-ptab]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-ptab]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-ppanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-ppanel="${btn.dataset.ptab}"]`).classList.add('active');
    });
  });
  function wireMc(list, attr, seen, onCount, explain){
    list.forEach((item,i)=>{
      const box = document.querySelector(`[data-${attr}c="${i}"]`);
      const fb = document.querySelector(`[data-${attr}fb="${i}"]`);
      box.addEventListener('click', e=>{
        const btn = e.target.closest('.choice-btn'); if(!btn) return;
        [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
        const right = +btn.dataset.i === item.correct;
        btn.classList.add(right ? 'correct' : 'wrong');
        fb.className = 'feedback show ' + (right ? 'good' : 'meh');
        fb.textContent = explain && item.explain ? item.explain : (right ? 'Correct!' : 'Not quite. Try again.');
        if(seen && !seen.has(i)){ seen.add(i); if(right) onCount(); overall(); }
      });
    });
  }
  wireMc(LAB_VOCAB, 'v', vA, ()=>{ vC++; }, false);
  wireMc(LAB_GRAMMAR, 'gg', gA, ()=>{ gC++; }, true);
  wireMc(PRACTICE_SENTENCES, 'ps', null, ()=>{}, false);
  document.querySelectorAll('#app [data-selfreport]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const box = btn.parentElement;
      [...box.children].forEach(b=>b.classList.remove('correct'));
      btn.classList.add('correct');
    });
  });
  LAB_LISTEN.forEach((item,i)=>{
    document.querySelector(`[data-lplay="${i}"]`).addEventListener('click', ()=> speak(item.audio));
    const box = document.querySelector(`[data-lchoices="${i}"]`);
    const fb = document.querySelector(`[data-lfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      const right = +btn.dataset.i === item.correct;
      btn.classList.add(right ? 'correct' : 'wrong');
      fb.className = 'feedback show ' + (right ? 'good' : 'meh');
      fb.textContent = right ? 'Correct!' : 'Listen again and try once more.';
    });
  });
}

/* ===== Section 8: Self-Check and Take Home ===== */
function renderS8(){
  const saved = getS('can', {});
  const rows = CAN_DO.map((c,i)=>`
    <div class="rubric-row"><div><div class="lbl">${esc(c)}</div></div>
      <div class="rate" data-can="${i}">${SCALE.map(s=>`<button type="button" data-pts="${s.v}" class="${saved[i]===s.v ? 'sel' : ''}">${esc(s.label)}</button>`).join('')}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 8 · Self-Check</div>
  <h2 class="section-title">What Can You Do?</h2>
  <p class="section-sub">Be honest. This is for you. Choose one for each sentence.</p>
  <div class="panel">${rows}
    <div class="u5-score" id="canTotal"></div>
    <div class="feedback" id="canMsg"></div>
  </div>
  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">My Daily Routine: Quick Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review the key vocabulary, sentence patterns, and useful phrases from Unit 5.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="My Daily Routine: Quick Guide preview" class="guide-thumb" loading="lazy">
    <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="downloadGuideBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Daily Routine Study Guide</a>
  </div>`;
}
function wireS8(){
  const saved = getS('can', {});
  function upd(){
    const vals = Object.values(saved);
    const total = vals.reduce((a,b)=>a+b,0);
    document.getElementById('canTotal').textContent = vals.length ? `Your score: ${total} / ${CAN_DO.length*3}` : '';
    const msg = document.getElementById('canMsg');
    if(vals.length >= CAN_DO.length){
      msg.className = 'feedback show ' + (total >= 15 ? 'good' : 'meh');
      msg.textContent = total >= 15 ? 'Great! You are ready for Unit 6.' : 'Good start! Practice the "Not yet" ones with a friend.';
      markActivityComplete('s8', {score:`${total}/${CAN_DO.length*3}`});
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
    <div class="cover-badge">UNIT 5 COMPLETE</div>
    <h1>You can <span>tell about your day.</span></h1>
    <p>Next: Unit 6 will be about food. What do you eat, and how do you order it?</p>
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
    const vlog = Progress.activities['s7'] ? 'Yes' : 'No';
    stats.innerHTML = `
      <p class="complete-stats-intro">Your progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Activities Completed</div></div>
        <div class="complete-stat"><div class="num">${vlog}</div><div class="lbl">Vlog Assignment Seen</div></div>
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
  {r:renderPractice, w:wirePractice},
  {r:renderS8, w:wireS8},
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
  applyDeepLinkAfterCheckin();
}
renderAll();
