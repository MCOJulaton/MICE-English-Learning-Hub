/* ===================== APP STATE / ROUTER =====================
   Same router, progress, check-in and voice system as the other English for
   Communication units. Unit 6 uses the browser's own text-to-speech (American
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','practice','s7','exit'];

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
const CHECKIN_STORAGE_KEY = 'efc_u6_checkin';
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

/* ===================== UNIT 6 HELPERS (shared) ===================== */
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
function stepsList(steps){ return `<ol class="u6-steps">${steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`; }
function chipRow(items){
  return `<div class="u6-chips">${items.map(t=>`<span class="u6-chip">${esc(t)}${sayBtn(t.replace(/___/g,'...').replace(/\s+\.\.\./,' '))}</span>`).join('')}</div>`;
}

/* ===================== UNIT 6 HELPERS (chat) ===================== */
function speakChat(lines){
  if(!('speechSynthesis' in window)){ alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakSequence(lines.map(l=>({text:l.text, opts:VOICE[l.who]})));
}
function chatHtml(lines, withRoles){
  return `<div class="u6-chat">${lines.map(l=>`
    <div class="u6-bubble ${l.who === 'A' ? 'a' : 'b'}">
      <span class="u6-who">${l.who}</span>
      <span class="u6-line">${esc(l.text)}</span>
      ${withRoles && l.role ? `<span class="u6-role r-${l.role}">${esc(ROLE_LABEL[l.role])}</span>` : ''}
    </div>`).join('')}</div>`;
}
function pickRow(options, attr, idx){
  return `<div class="choices" ${attr}="${idx}">${options.map((o,oi)=>`<button type="button" class="choice-btn" data-v="${oi}"><span class="letter">${'ABC'[oi]}</span> ${esc(o)}</button>`).join('')}</div>`;
}

/* ===================== SECTION RENDERERS ===================== */
function quizHtml(list, attr){
  return list.map((q,i)=>`<div class="sit-card"><p class="u6-q">${esc(q.q)}</p>${pickRow(q.options, attr, i)}</div>`).join('');
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
function bigGrid(items, key){
  return `<div class="big-choice-grid">${items.map((it,i)=>`<div class="big-choice" data-${key}="${i}"><div class="bc-ic">${it.ic}</div><div class="bc-lbl">${esc(it.nm)}</div></div>`).join('')}</div>`;
}

function renderCover(){
  const objectives = LESSON_OBJECTIVES.map(o=>`<li>${o}</li>`).join('');
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>Food <span>and Eating</span></h1>
    <p>Unit 6: Cultural Studies. Order a meal in a restaurant in English.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <div class="cover-objectives">
      <b>By the end of this lesson, you can:</b>
      <ul>${objectives}</ul>
    </div>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> I’d like ___, please</div>
      <div class="signchip"><span class="arrow">→</span> Prices in baht</div>
      <div class="signchip"><span class="arrow">→</span> Order a meal</div>
    </div>
    <button class="startbtn" onclick="goNext()">Look. Choose. Speak. →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up, How Do You Choose Food? ===== */
function renderS1(){
  const photos = CHOOSE_FOOD_PHOTOS.map(id=>`<img class="venue-photo loc-photo" src="${SECTION_PHOTOS[id].src}" alt="${SECTION_PHOTOS[id].alt}" loading="lazy">`).join('');
  const choices = CHOOSE_REASONS.map((r,i)=>`
    <div class="big-choice" data-i="${i}"><div class="bc-ic">${r.ic}</div><div class="bc-lbl">${r.lbl}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 1 · Warm-Up</div>
  <h2 class="section-title">How Do You Choose Food?</h2>
  <p class="section-sub">Use "because" from Unit 3. Say your answer out loud to a partner.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(CHOOSE_STEPS)}</div>
    <div class="loc-grid" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">${photos}</div>
    <hr class="hairline">
    <p class="u6-q">What is important to you?</p>
    <div class="big-choice-grid">${choices}</div>
    <div id="s1result" style="display:none;margin-top:18px;" class="feedback show good"></div>
    <h3 class="u6-h3" style="margin-top:18px;">Say these sentences out loud.</h3>
    ${chipRow(CHOOSE_FRAME_SENTENCES)}
  </div>
  <div class="panel">
    <h3 class="u6-h3">Check each one when you finish.</h3>
    ${checkRows('ck', CHOOSE_CHECKS)}
  </div>`;
}
function wireS1(){
  wireSay();
  const grid = document.querySelector('#app .big-choice-grid');
  const result = document.getElementById('s1result');
  const done = new Set(getS('choose', []));
  let picked = getS('chosenReason', null);
  function finish(){ if(picked !== null && done.size >= CHOOSE_CHECKS.length) markActivityComplete('s1', {completionStatus:'reached', score: CHOOSE_REASONS[picked].lbl}); }
  function showResult(){
    if(picked === null) return;
    const reason = CHOOSE_REASONS[picked];
    result.style.display = 'block';
    result.innerHTML = `Say it: "${esc(CHOOSE_SAY[picked])}" ${sayBtn(CHOOSE_SAY[picked])}`;
    wireSay();
  }
  grid.addEventListener('click', e=>{
    const c = e.target.closest('.big-choice'); if(!c) return;
    [...grid.children].forEach(x=>x.classList.remove('sel'));
    c.classList.add('sel');
    picked = +c.dataset.i; setS('chosenReason', picked); showResult(); finish();
  });
  if(picked !== null){ grid.children[picked].classList.add('sel'); showResult(); }
  document.querySelectorAll('#app [data-ck]').forEach(row=>{
    if(done.has(row.dataset.ck)) row.classList.add('checked');
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) done.add(row.dataset.ck); else done.delete(row.dataset.ck);
      setS('choose', [...done]); finish();
    });
  });
}

/* ===== Section 2: Food and Restaurant Words ===== */
function renderS2(){
  const food = FOOD_VOCAB.map(v=>{
    const photo = SECTION_PHOTOS[v.id];
    return `
    <div class="u6-card">
      <img class="u6-card-photo" src="${photo.src}" alt="${esc(photo.alt)}" loading="lazy">
      <div class="u6-card-main">${v.ic} ${esc(v.nm)}</div>
      <div class="u6-card-sub">${esc(v.ex)}</div>${sayBtn(v.ex)}
    </div>`;
  }).join('');
  const rest = RESTAURANT_VOCAB.map(v=>`
    <div class="u6-chip">${v.ic} ${esc(v.nm)}${sayBtn(v.nm)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · See It, Hear It, Say It</div>
  <h2 class="section-title">Food and Restaurant Words</h2>
  <p class="section-sub">Click "Hear it" to listen. Then say it out loud. Always say it out loud!</p>
  <div class="panel">
    <h3 class="u6-h3">Food words</h3>
    <div class="u6-cards">${food}</div>
  </div>
  <div class="panel">
    <h3 class="u6-h3">Restaurant words</h3>
    <div class="u6-chips">${rest}</div>
    <h3 class="u6-h3" style="margin-top:20px;">Check: which word?</h3>
    ${quizHtml(WORDS_QUIZ, 'data-wq')}
  </div>`;
}
function wireS2(){
  wireSay();
  const done = new Set(); let right = 0;
  wireQuiz('data-wq', WORDS_QUIZ, done, ()=>{ right++; }, ()=>{
    if(done.size >= WORDS_QUIZ.length) markActivityComplete('s2', {score:`${right}/${WORDS_QUIZ.length}`});
  });
}

/* ===== Section 3: Listen, At the Restaurant ===== */
let s3Order = [];
function renderS3(){
  s3Order = CONVERSATION_STEPS.map(s=>s.opts.map((_,k)=>k).sort(()=>Math.random()-0.5));
  const steps = CONVERSATION_STEPS.map((s,i)=>`
    <div class="sit-card"><div class="u6-listen-row"><button type="button" class="startbtn u6-play" data-hearw="${i}">${icon('play',{size:18})} Listen to the waiter</button><span class="u6-hint">Choose the best answer.</span></div>
      ${pickRow(s3Order[i].map(k=>s.opts[k].t),'data-cw',i)}</div>`).join('');
  const totals = LISTEN_TOTAL.map((c,i)=>`
    <div class="sit-card"><div class="u6-listen-row"><button type="button" class="startbtn u6-play" data-heart="${i}">${icon('play',{size:18})} Listen</button><span class="u6-hint">How much is it?</span></div>
      ${pickRow(c.options,'data-lt',i)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Listening</div>
  <h2 class="section-title">At the Restaurant</h2>
  <p class="section-sub">Part A: listen to the waiter and choose your answer. Part B: listen for the price. 13 or 30? 85 or 58?</p>
  <div class="panel"><h3 class="u6-h3">Part A: What does the waiter say?</h3>${steps}</div>
  <div class="panel"><h3 class="u6-h3">Part B: How much?</h3>${totals}
    <div class="u6-score" id="lcScore"></div></div>`;
}
function wireS3(){
  const needed = CONVERSATION_STEPS.length + LISTEN_TOTAL.length;
  let answered = 0, correct = 0;
  function bump(isRight){
    answered++; if(isRight) correct++;
    if(answered >= needed){
      document.getElementById('lcScore').textContent = `Your score: ${correct} / ${needed}`;
      markActivityComplete('s3', {score:`${correct}/${needed}`});
    }
  }
  CONVERSATION_STEPS.forEach((s,i)=>{
    document.querySelector(`[data-hearw="${i}"]`).addEventListener('click', ()=> speak(s.server, {pitch:0.9}));
    const box = document.querySelector(`[data-cw="${i}"]`);
    const ci = s3Order[i].indexOf(s.opts.findIndex(o=>o.correct));
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || box.dataset.done) return;
      box.dataset.done = '1';
      const right = +btn.dataset.v === ci;
      btn.classList.add(right ? 'correct' : 'wrong'); if(!right) box.children[ci].classList.add('correct');
      bump(right);
    });
  });
  LISTEN_TOTAL.forEach((c,i)=>{
    document.querySelector(`[data-heart="${i}"]`).addEventListener('click', ()=> speak(c.say, {pitch:c.pitch}));
    const box = document.querySelector(`[data-lt="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || box.dataset.done) return;
      box.dataset.done = '1';
      const right = +btn.dataset.v === c.correct;
      btn.classList.add(right ? 'correct' : 'wrong'); if(!right) box.children[c.correct].classList.add('correct');
      bump(right);
    });
  });
}

/* ===== Section 4: How to Order Food ===== */
const LADDER = [
  {key:'L1', title:'Level 1', sub:'Read and repeat'},
  {key:'L2', title:'Level 2', sub:'Build your order'},
  {key:'L3', title:'Level 3', sub:'Pictures only'},
  {key:'L4', title:'Level 4', sub:'No paper!'}
];
function myOrder(){ return getS('myOrder', {main:'', drink:'', dessert:''}); }
function orderSentence(){
  const m = myOrder();
  const parts = [m.main || 'fried rice', m.drink || 'orange juice'];
  if(m.dessert && m.dessert !== 'None') parts.push(m.dessert);
  const last = parts.length > 1 ? parts.slice(0,-1).join(', ') + ', and ' + parts[parts.length-1] : parts[0];
  return `Hello. I’d like ${last.toLowerCase()}, please.`;
}
function ladderPanel(i){
  const m = myOrder();
  if(i === 0){
    return `
      <p class="section-sub" style="margin-top:0;">Listen to each line. Say it out loud. Then say all four lines.</p>
      ${LADDER_MODEL.map(l=>`<div class="u6-frame"><span class="u6-frame-text">${esc(l)}</span>${sayBtn(l)}</div>`).join('')}
      <button type="button" class="reveal-btn" data-say="${esc(LADDER_MODEL.join(' '))}" style="margin-top:10px;">Hear all four lines</button>
      <button type="button" class="startbtn u6-did" data-did="L1">I said it out loud →</button>`;
  }
  if(i === 1){
    return `
      <p class="section-sub" style="margin-top:0;">Choose your meal. Then click "Hear mine" and say it.</p>
      <div class="order-step"><div class="order-step-title">1. Main dish</div>${bigGrid(BUILD_MAINS,'main')}</div>
      <div class="order-step"><div class="order-step-title">2. Drink</div>${bigGrid(BUILD_DRINKS,'drink')}</div>
      <div class="order-step"><div class="order-step-title">3. Dessert</div>${bigGrid(BUILD_DESSERTS,'dessert')}</div>
      <p class="u6-live" id="myOrderText">${esc(orderSentence())}</p>
      <button type="button" class="reveal-btn" id="hearMine">Hear mine</button>
      <button type="button" class="startbtn u6-did" data-did="L2">I said it out loud →</button>`;
  }
  if(i === 2){
    return `
      <p class="section-sub" style="margin-top:0;">Look only at the keywords. Order your meal to a partner. The partner is the waiter.</p>
      <div class="u6-keys"><span>HELLO</span><span>I’D LIKE FOOD</span><span>I’D LIKE A DRINK</span><span>ANYTHING ELSE? NO</span><span>THE BILL, PLEASE</span><span>THANK YOU</span></div>
      <button type="button" class="startbtn u6-did" data-did="L3">I ordered from the keywords →</button>`;
  }
  return `
      <p class="section-sub" style="margin-top:0;">No words! Order a whole meal from your partner, the waiter. Look at your partner, not the screen.</p>
      <div class="u6-nopaper" id="noPaper">Words are hidden. Ready?</div>
      <div class="u6-timer-row"><button class="reveal-btn" id="npBtn">Start 1 minute</button><span class="u6-timer" id="npTimer">1:00</span></div>
      <button type="button" class="startbtn u6-did" data-did="L4">I ordered with no paper →</button>`;
}
function renderS4(){
  const t = SOUND_TIPS;
  const phrases = ORDER_PHRASES.map(p=>`<div class="u6-frame"><span class="u6-frame-text">${esc(p)}</span>${sayBtn(p.replace('___','fried rice'))}</div>`).join('');
  const nums = t.numbers.map(n=>`<div class="u6-into"><span class="u6-into-text">${esc(n.text)}</span><span class="u6-into-note">${esc(n.note)}</span>${sayBtn(n.say)}</div>`).join('');
  const tabs = LADDER.map((l,i)=>`<button type="button" class="u6-lvl${i===0?' active':''}" data-lvl="${i}"><b>${l.title}</b><span>${l.sub}</span></button>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Say It!</div>
  <h2 class="section-title">How to Order Food</h2>
  <p class="section-sub">Each level has fewer words. At the end, you order with no paper.</p>
  <div class="panel">
    <h3 class="u6-h3">Useful phrases</h3>
    ${phrases}
  </div>
  <div class="panel">
    <h3 class="u6-h3">Sound tips</h3>
    <div class="u6-tip"><b>1. "I would like" is short</b><p>${esc(t.contraction.note)}</p><div class="u6-contr"><span>${esc(t.contraction.written)}</span><b>→</b><span class="u6-short">${esc(t.contraction.fast)}</span>${sayBtn(t.contraction.ex)}</div></div>
    <div class="u6-tip"><b>2. Prices: 13 or 30?</b>${nums}</div>
    <div class="u6-tip"><b>3. A polite question goes up</b><div class="u6-into"><span class="u6-into-text">${esc(t.polite.text)}</span><span class="u6-into-note">${esc(t.polite.note)}</span>${sayBtn(t.polite.text)}</div></div>
  </div>
  <div class="panel">
    <h3 class="u6-h3">The speaking ladder</h3>
    <div class="u6-levels" id="lvlTabs">${tabs}</div>
    <div class="u6-level-body" id="lvlBody"></div>
    <div class="u6-progress" id="lvlProgress"></div>
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
    document.querySelectorAll('#lvlTabs .u6-lvl').forEach((t,i)=>{
      t.classList.toggle('active', i === level);
      t.classList.toggle('finished', done.has(LADDER[i].key));
    });
  }
  function show(i){
    level = i; stopTimer(); body.innerHTML = ladderPanel(i);
    wireSay();
    if(i === 1){
      const m = myOrder();
      const lists = {main:BUILD_MAINS, drink:BUILD_DRINKS, dessert:BUILD_DESSERTS};
      Object.keys(lists).forEach(k=>{
        body.querySelectorAll(`[data-${k}]`).forEach(c=>{
          if(m[k] && lists[k][+c.dataset[k]].nm === m[k]) c.classList.add('sel');
          c.addEventListener('click', ()=>{
            body.querySelectorAll(`[data-${k}]`).forEach(x=>x.classList.remove('sel')); c.classList.add('sel');
            const cur = myOrder(); cur[k] = lists[k][+c.dataset[k]].nm; setS('myOrder', cur);
            document.getElementById('myOrderText').textContent = orderSentence();
          });
        });
      });
    }
    const hm = document.getElementById('hearMine');
    if(hm) hm.addEventListener('click', ()=> speak(orderSentence()));
    const np = document.getElementById('npBtn');
    if(np) np.addEventListener('click', ()=>{
      np.disabled = true; document.getElementById('noPaper').textContent = 'Order now!';
      runTimer(document.getElementById('npTimer'), 60, ()=>{ np.disabled = false; document.getElementById('noPaper').textContent = 'Great! Time is up.'; speak('Time is up. Great job!'); });
    });
    body.querySelectorAll('[data-did]').forEach(b=> b.addEventListener('click', ()=>{
      done.add(b.dataset.did); setS('ladder', [...done]); updProg();
      if(done.size >= LADDER.length) markActivityComplete('s4', {completionStatus:'completed'});
      if(level < LADDER.length - 1) show(level + 1);
    }));
    updProg();
  }
  document.querySelectorAll('#lvlTabs .u6-lvl').forEach(t=> t.addEventListener('click', ()=> show(+t.dataset.lvl)));
  show(0);
}

/* ===== Section 5: Restaurant Challenge ===== */
function menuPairs(){
  const flat = cat => RESTAURANT_MENU.find(c=>c.cat===cat).items;
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const rounds = [];
  while(rounds.length < MENU_MATHS_ROUNDS){
    const a = pick(flat('Main Dishes')), b = pick(flat('Drinks'));
    if(!rounds.some(r=>r.a.nm===a.nm && r.b.nm===b.nm)) rounds.push({a,b});
  }
  return rounds;
}
function renderS5(){
  return `
  <div class="section-eyebrow">Section 5 · Game</div>
  <h2 class="section-title">Restaurant Challenge</h2>
  <p class="section-sub">Part A: finish a mini conversation. Part B: add up the bill and say the total.</p>
  <div class="panel">
    <h3 class="u6-h3">Part A: Mini conversation</h3>
    <div class="checkpoint-track" id="s5track"></div>
    <div class="scene" style="margin-top:16px;">
      <div class="avatar">${icon('user',{size:36})}</div>
      <div class="bubble" id="s5q"></div>
    </div>
    <div class="choices" id="s5choices" style="margin-top:18px;"></div>
    <div id="s5win" class="feedback show good" style="display:none;margin-top:14px;">You completed the conversation!</div>
  </div>
  <div class="panel">
    <h3 class="u6-h3">Part B: Menu Maths</h3>
    <p class="section-sub" style="margin-top:0;">Look at the order. What is the total? Then say it: "That is ___ baht."</p>
    <div id="mathsBox"></div>
    <div class="u6-score" id="mathsScore"></div>
  </div>`;
}
function wireS5(){
  wireSay();
  let step = 0, aDone = false, bDone = false;
  function finish(){ if(aDone && bDone) markActivityComplete('s5', {completionStatus:'completed'}); }
  const track = document.getElementById('s5track'), q = document.getElementById('s5q');
  const choicesEl = document.getElementById('s5choices'), win = document.getElementById('s5win');
  function renderTrack(){ track.innerHTML = CHALLENGE_STEPS.map((s,i)=>`<span class="checkpoint-pill ${i<step?'done':i===step?'active':''}">${s.label}</span>`).join(''); }
  function showStep(){
    renderTrack();
    if(step >= CHALLENGE_STEPS.length){
      q.parentElement.style.display='none'; choicesEl.style.display='none'; win.style.display='block';
      aDone = true; finish(); return;
    }
    const s = CHALLENGE_STEPS[step];
    q.textContent = s.q; speak(s.q, {pitch:0.9});
    choicesEl.innerHTML = s.opts.map((o,i)=>`<button class="choice-btn"><span class="letter">${String.fromCharCode(65+i)}</span> ${esc(o)}</button>`).join('');
    choicesEl.querySelectorAll('.choice-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{ btn.classList.add('correct'); setTimeout(()=>{ step++; showStep(); }, 700); });
    });
  }
  showStep();
  /* Menu Maths */
  const rounds = menuPairs(); let ri = 0, good = 0;
  const box = document.getElementById('mathsBox');
  function showRound(){
    if(ri >= rounds.length){
      box.innerHTML = '';
      document.getElementById('mathsScore').textContent = `Menu Maths: ${good} / ${rounds.length}`;
      bDone = true; finish(); return;
    }
    const r = rounds[ri], total = r.a.price + r.b.price;
    const opts = [total, total + 10, total - 15].sort(()=>Math.random()-0.5);
    box.innerHTML = `
      <div class="sit-card"><p class="u6-q">${esc(r.a.nm)} (${r.a.price} baht) + ${esc(r.b.nm)} (${r.b.price} baht). What is the total?</p>
        <div class="choices" id="mathsChoices">${opts.map((o,i)=>`<button type="button" class="choice-btn" data-v="${o}"><span class="letter">${'ABC'[i]}</span> ${o} baht</button>`).join('')}</div>
        <div class="feedback" id="mathsFb"></div></div>`;
    const ch = document.getElementById('mathsChoices'), fb = document.getElementById('mathsFb');
    ch.addEventListener('click', e=>{
      const b = e.target.closest('.choice-btn'); if(!b || ch.dataset.done) return;
      ch.dataset.done = '1';
      const right = +b.dataset.v === total;
      if(right){ good++; b.classList.add('correct'); } else { b.classList.add('wrong'); [...ch.children].find(x=>+x.dataset.v===total).classList.add('correct'); }
      const say = `That is ${total} baht.`;
      fb.className = 'feedback show ' + (right ? 'good' : 'meh');
      fb.innerHTML = `Say it: <b>${esc(say)}</b> ${sayBtn(say)} <button type="button" class="reveal-btn" id="nextRound" style="margin-left:8px;">Next</button>`;
      wireSay();
      document.getElementById('nextRound').addEventListener('click', ()=>{ ri++; showRound(); });
    });
  }
  showRound();
}

/* ===== Section 6: Speaking Task, Sunny Café ===== */
function renderS6(){
  const menu = RESTAURANT_MENU.map(cat=>`
    <div class="menu-card"><h4>${cat.cat}</h4>
      <div class="menu-rows">${cat.items.map(it=>`<div class="menu-row"><span>${it.nm}</span><span class="price">${it.price} baht</span></div>`).join('')}</div>
    </div>`).join('');
  const conversation = MODEL_CONVERSATION.map(line=>`
    <div class="phrase-card ${line.who==='w' ? 'waiter' : 'customer'}">
      <span class="txt"><b>${line.label}:</b> ${esc(line.text)}</span>${sayBtn(line.text)}
    </div>`).join('');
  const phraseCol = (title, phrases, cls) => `
    <div class="roleplay-col ${cls}"><h4>${title}</h4>
      ${phrases.map(p=>`<div class="u6-frame"><span class="u6-frame-text">${esc(p)}</span>${sayBtn(p.replace('___','fried rice'))}</div>`).join('')}
    </div>`;
  return `
  <div class="section-eyebrow">Section 6 · Speaking Task</div>
  <h2 class="section-title">Sunny Café: Order a Meal</h2>
  <p class="section-sub">Work in a group of 3. Order a whole meal. No reading from paper!</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(ORDER_TASK.steps)}</div>
    <div class="role-row" style="margin-top:14px;">
      <span class="role-badge delegate">Student A: Customer</span>
      <span class="role-badge delegate">Student B: Customer</span>
      <span class="role-badge staff">Student C: Waiter</span>
    </div>
    <div class="u6-timer-row"><button class="reveal-btn" id="tourBtn">Start 3 minutes</button><span class="u6-timer" id="tourTimer">3:00</span></div>
  </div>
  <div class="panel">
    <h3 class="u6-h3">${esc(RESTAURANT_NAME)}: Menu</h3>
    <div class="menu-grid">${menu}</div>
  </div>
  <div class="panel">
    <h3 class="u6-h3">Model conversation</h3>
    <p class="section-sub" style="margin-top:0;">Listen to each line, then practice it with your group. Round 1: follow it. Round 2: choose different food. Round 3: no reading.</p>
    <div class="phrase-list">${conversation}</div>
    <button type="button" class="reveal-btn" id="hearConv" style="margin-top:10px;">Hear the whole conversation</button>
    <h3 class="u6-h3" style="margin-top:18px;">Useful restaurant English</h3>
    <div class="roleplay-cols">
      ${phraseCol('Customers', RESTAURANT_PHRASES_CUSTOMER, 'customer')}
      ${phraseCol('Waiter', RESTAURANT_PHRASES_WAITER, 'server')}
    </div>
  </div>
  <div class="panel">
    <h3 class="u6-h3">Group checklist</h3>
    <p class="section-sub" style="margin-top:0;">The waiter listens. Check what your group did.</p>
    ${checkRows('pc', PEER_CHECKLIST)}
    <div class="u6-score" id="pcScore">0 / ${PEER_CHECKLIST.length}</div>
    <button type="button" class="startbtn" id="s6done" style="margin-top:14px;">We finished the task →</button>
  </div>`;
}
function wireS6(){
  wireSay();
  document.getElementById('hearConv').addEventListener('click', ()=>{
    if(!('speechSynthesis' in window)) return;
    VoiceEngine.speakSequence(MODEL_CONVERSATION.map(l=>({text:l.text, opts:{pitch: l.who==='w' ? 0.85 : (l.who==='a' ? 1.1 : 1.0)}})));
  });
  const tb = document.getElementById('tourBtn');
  tb.addEventListener('click', ()=>{
    tb.disabled = true;
    runTimer(document.getElementById('tourTimer'), 180, ()=>{ tb.disabled = false; speak('Time is up. Change roles!'); });
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

/* ===== Practice Lab (take-home), with Food and Culture ===== */
function renderPractice(){
  const mc = (list, attr) => list.map((item,i)=>`
    <div class="sit-card" data-${attr}="${i}">
      <p class="u6-q">${i+1}. ${item.q}</p>
      <div class="choices" data-${attr}c="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-${attr}fb="${i}"></div>
    </div>`).join('');
  const listenCards = LAB_LISTEN.map((item,i)=>`
    <div class="sit-card" data-lq="${i}">
      <div class="u6-listen-row"><button type="button" class="startbtn u6-play" data-lplay="${i}">${icon('play',{size:18})} Listen</button><span class="u6-hint">Listen, then choose.</span></div>
      <div class="choices" style="margin-top:14px;" data-lchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-lfb="${i}"></div>
    </div>`).join('');
  const speakCards = LAB_SPEAK_PROMPTS.map(p=>`<div class="sit-card"><p class="u6-q" style="color:var(--orange-deep);">${p.text}</p></div>`).join('');
  const rows = CULTURE_TABLE.rows.map((r,ri)=>`<tr><td>${r}</td>${CULTURE_TABLE.countries.map(c=>`<td>${c.values[ri]}</td>`).join('')}</tr>`).join('');
  const head = CULTURE_TABLE.countries.map(c=>`<th><span class="culture-flag">${c.flag}</span>${c.name}</th>`).join('');
  const cultureQs = CULTURE_QUESTIONS.map((q,i)=>`
    <div class="sit-card"><p class="u6-q">${q.q}</p>
      <div class="choices" data-cq="${i}">${q.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}</div></div>`).join('');
  const tip = CULTURE_TIP.map(t=>`<li>${t}</li>`).join('');
  return `
  <div class="section-eyebrow">Practice Lab</div>
  <h2 class="section-title">Practice Lab</h2>
  <p class="section-sub">Practice more at home. (Optional)</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-ptab="vocab">Vocabulary</button>
      <button class="tab-btn" data-ptab="expr">Expressions</button>
      <button class="tab-btn" data-ptab="listen">Listening</button>
      <button class="tab-btn" data-ptab="speak">Speaking</button>
      <button class="tab-btn" data-ptab="partner">Partner</button>
      <button class="tab-btn" data-ptab="culture">Food and Culture</button>
    </div>
    <div class="tab-panel active" data-ppanel="vocab">${mc(LAB_FOOD_VOCAB,'v')}</div>
    <div class="tab-panel" data-ppanel="expr">${mc(LAB_RESTAURANT_EXPR,'e')}</div>
    <div class="tab-panel" data-ppanel="listen">${listenCards}</div>
    <div class="tab-panel" data-ppanel="speak">${speakCards}<p class="u6-hint" style="margin-top:10px;">Say it aloud. Ask your teacher or partner to check.</p></div>
    <div class="tab-panel" data-ppanel="partner">
      <div class="sit-card"><p class="u6-q">Ask your partner: "What is your favorite food?"</p></div>
      <div class="sit-card"><p class="u6-q">Ask your partner: "Do you like spicy food?"</p></div>
    </div>
    <div class="tab-panel" data-ppanel="culture">
      <p class="u6-hint" style="margin-bottom:10px;">Look and compare. What is the same? What is different?</p>
      <div class="culture-table-wrap"><table class="culture-table"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></div>
      ${cultureQs}
      <div class="rule-box" style="margin-top:14px;"><b>Cultural Tip</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul></div>
    </div>
  </div>`;
}
function wirePractice(){
  wireSay();
  const vA = new Set(); let vC = 0; const eA = new Set(); let eC = 0;
  function overall(){
    if(vA.size >= LAB_FOOD_VOCAB.length && eA.size >= LAB_RESTAURANT_EXPR.length) markActivityComplete('practice', {score:`Vocab ${vC}/${LAB_FOOD_VOCAB.length} | Expr ${eC}/${LAB_RESTAURANT_EXPR.length}`});
  }
  document.querySelectorAll('#app [data-ptab]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-ptab]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-ppanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-ppanel="${btn.dataset.ptab}"]`).classList.add('active');
    });
  });
  function wireMc(list, attr, seen, onRight){
    list.forEach((item,i)=>{
      const box = document.querySelector(`[data-${attr}c="${i}"]`), fb = document.querySelector(`[data-${attr}fb="${i}"]`);
      box.addEventListener('click', e=>{
        const btn = e.target.closest('.choice-btn'); if(!btn) return;
        [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
        const right = +btn.dataset.i === item.correct;
        btn.classList.add(right ? 'correct' : 'wrong');
        fb.className = 'feedback show ' + (right ? 'good' : 'meh'); fb.textContent = right ? 'Great!' : 'Try again.';
        if(!seen.has(i)){ seen.add(i); if(right) onRight(); overall(); }
      });
    });
  }
  wireMc(LAB_FOOD_VOCAB,'v',vA,()=>{ vC++; });
  wireMc(LAB_RESTAURANT_EXPR,'e',eA,()=>{ eC++; });
  LAB_LISTEN.forEach((item,i)=>{
    document.querySelector(`[data-lplay="${i}"]`).addEventListener('click', ()=> speak(item.audio));
    const box = document.querySelector(`[data-lchoices="${i}"]`), fb = document.querySelector(`[data-lfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      const right = +btn.dataset.i === item.correct;
      btn.classList.add(right ? 'correct' : 'wrong'); fb.className = 'feedback show ' + (right ? 'good' : 'meh'); fb.textContent = right ? 'Excellent!' : 'Listen again.';
    });
  });
  CULTURE_QUESTIONS.forEach((q,i)=>{
    const box = document.querySelector(`[data-cq="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct')); btn.classList.add('correct');
    });
  });
}

/* ===== Section 7: Self-Check and the real restaurant ===== */
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
    <div class="u6-score" id="canTotal"></div>
    <div class="feedback" id="canMsg"></div>
  </div>
  <div class="panel">
    <h3 class="u6-h3">Next: order for real</h3>
    <p class="section-sub" style="margin-top:0;">Go to a real restaurant with your group. Order real food in English and make a short video.</p>
    <p><span class="deadline-chip" data-deadline="a-comm-u6-roleplay">Deadline to be announced</span></p>
    <a class="startbtn u6-extra-link" href="../../../assignments/comm-u6-roleplay/index.html">Final Assignment: Order Food at a Restaurant →</a>
  </div>
  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">Food and Eating: Study Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review the key vocabulary, restaurant phrases, and cultural tips from Unit 6.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="Food and Eating: Study Guide preview" class="guide-thumb" loading="lazy">
    <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="downloadGuideBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
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
      msg.textContent = total >= 15 ? 'Great! You are ready for Unit 7.' : 'Good start! Practice the "Not yet" ones with a friend.';
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
    <div class="cover-badge">UNIT 6 COMPLETE</div>
    <h1>You can order <span>a meal in English.</span></h1>
    <p>Now try the final assignment: order real food in English at a real restaurant with your group.</p>
    <div class="complete-actions">
      <a href="../../../assignments/comm-u6-roleplay/index.html" class="download-btn">Final Assignment: Order Food at a Restaurant →</a>
      <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="completeDownloadBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
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
    const speakingTask = Progress.activities['s6'] ? 'Yes' : 'No';
    const challenge = Progress.activities['s5'] ? 'Yes' : 'No';
    const practice = Progress.activities['practice'] ? 'Yes' : 'No';
    stats.innerHTML = `
      <p class="complete-stats-intro">Your progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Activities Completed</div></div>
        <div class="complete-stat"><div class="num">${speakingTask}</div><div class="lbl">Speaking Task Practiced</div></div>
        <div class="complete-stat"><div class="num">${challenge}</div><div class="lbl">Challenge Completed</div></div>
        <div class="complete-stat"><div class="num">${practice}</div><div class="lbl">Practice Completed</div></div>
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
  {r:renderPractice, w:wirePractice},
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
  applyDeepLinkAfterCheckin();
}
renderAll();
