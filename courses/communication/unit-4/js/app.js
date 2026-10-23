/* ===================== APP STATE / ROUTER =====================
   Same router, progress, check-in and voice system as the other English for
   Communication units. Unit 4 uses the browser's own text-to-speech (American
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8','exit'];

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
const CHECKIN_STORAGE_KEY = 'efc_u4_checkin';
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

/* ===================== UNIT 4 HELPERS (shared) ===================== */
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
function stepsList(steps){ return `<ol class="u4-steps">${steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`; }
function chipRow(items){
  return `<div class="u4-chips">${items.map(t=>`<span class="u4-chip">${esc(t)}${sayBtn(t.replace(/___/g,'...').replace(/\s+\.\.\./,' '))}</span>`).join('')}</div>`;
}

/* ===================== UNIT 4 HELPERS (chat) ===================== */
function speakChat(lines){
  if(!('speechSynthesis' in window)){ alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakSequence(lines.map(l=>({text:l.text, opts:VOICE[l.who]})));
}
function chatHtml(lines, withRoles){
  return `<div class="u4-chat">${lines.map(l=>`
    <div class="u4-bubble ${l.who === 'A' ? 'a' : 'b'}">
      <span class="u4-who">${l.who}</span>
      <span class="u4-line">${esc(l.text)}</span>
      ${withRoles && l.role ? `<span class="u4-role r-${l.role}">${esc(ROLE_LABEL[l.role])}</span>` : ''}
    </div>`).join('')}</div>`;
}
function pickRow(options, attr, idx){
  return `<div class="choices" ${attr}="${idx}">${options.map((o,oi)=>`<button type="button" class="choice-btn" data-v="${oi}"><span class="letter">${'ABC'[oi]}</span> ${esc(o)}</button>`).join('')}</div>`;
}

/* ===================== SECTION RENDERERS ===================== */
function placeImg(p, cls){
  return p.photo ? `<img class="${cls}" src="../../../assets/images/${p.photo}" alt="${esc('The ' + p.name)}" loading="lazy">` : `<span class="u4-tile-icon" aria-hidden="true">${p.icon}</span>`;
}
function placeByName(n){ return PKRU_PLACES.find(p=>p.name === n) || {name:n, icon:'📍', model:''}; }
function mapTiles(showNames){
  return `<div class="u4-map" id="u4Map">${PKRU_PLACES.map(p=>`
    <div class="u4-tile">${placeImg(p, 'u4-tile-photo')}<span class="u4-tile-name${showNames ? '' : ' hide'}">${esc(p.name)}</span></div>`).join('')}</div>`;
}
function quizHtml(list, attr){
  return list.map((q,i)=>`<div class="sit-card"><p class="u4-q">${esc(q.q || q.goal)}</p>${pickRow(q.options, attr, i)}</div>`).join('');
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
function renderCover(){
  const objectives = LESSON_OBJECTIVES.map(o=>`<li>${o}</li>`).join('');
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>Welcome to our school! <span>This is the library.</span></h1>
    <p>Unit 4: My school. What makes a good school?</p>
    <img class="section-hero-photo" src="../../../assets/images/efc-u4-cover.jpg" alt="Students walking along a path on a sunny university campus" loading="lazy">
    <div class="cover-objectives">
      <b>By the end of this lesson, you can:</b>
      <ul>${objectives}</ul>
    </div>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> PKRU places</div>
      <div class="signchip"><span class="arrow">→</span> There is, there are</div>
      <div class="signchip"><span class="arrow">→</span> School tour</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up, My Favorite Place ===== */
function renderS1(){
  return `
  <div class="section-eyebrow">Section 1 · Warm-Up</div>
  <h2 class="section-title">My Favorite Place</h2>
  <p class="section-sub">A speaking game. Use "because" from Unit 3. Put your phone away.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to play</h3>${stepsList(FAV_PLACE.steps)}</div>
    <h3 class="u4-h3">Practice these sentences. Say them out loud.</h3>
    ${chipRow(FAV_PLACE.sentences)}
    <h3 class="u4-h3" style="margin-top:16px;">You can say:</h3>
    ${chipRow(FAV_PLACE.helpers)}
  </div>
  <div class="panel">
    <h3 class="u4-h3">Check each one when you finish.</h3>
    ${checkRows('fp', FAV_CHECKS)}
  </div>`;
}
function wireS1(){
  wireSay();
  const done = new Set(getS('fav', []));
  document.querySelectorAll('#app [data-fp]').forEach(row=>{
    if(done.has(row.dataset.fp)) row.classList.add('checked');
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) done.add(row.dataset.fp); else done.delete(row.dataset.fp);
      setS('fav', [...done]);
      if(done.size >= FAV_CHECKS.length) markActivityComplete('s1', {completionStatus:'reached'});
    });
  });
}

/* ===== Section 2: PKRU Places, There Is, There Are ===== */
function renderS2(){
  const places = PKRU_PLACES.map(p=>`
    <div class="u4-card">${p.photo ? placeImg(p, 'u4-card-photo') : `<div class="u4-card-icon" aria-hidden="true">${p.icon}</div>`}
      <div class="u4-card-main">This is the ${esc(p.name)}.</div>
      <div class="u4-card-sub">${esc(p.model)}</div>${sayBtn(`This is the ${p.name}. ${p.model}`)}</div>`).join('');
  const frames = FRAMES.map(f=>`
    <div class="u4-frame"><span class="u4-frame-text">${esc(f.frame)}</span>${sayBtn(f.example)}<span class="u4-frame-ex">Example: ${esc(f.example)}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · See It, Hear It, Say It</div>
  <h2 class="section-title">PKRU Places: There Is, There Are</h2>
  <p class="section-sub">Click "Hear it" to listen. Then say it out loud. Always say it out loud!</p>
  <div class="panel">
    <h3 class="u4-h3">Name the place: "This is the ___."</h3>
    <div class="u4-cards">${places}</div>
  </div>
  <div class="panel">
    <h3 class="u4-h3">What is there? One thing or many?</h3>
    <div class="u4-scale">
      <div class="u4-scale-row plus1"><span class="u4-scale-mark">1</span>
        <div class="u4-scale-main"><b>${esc(IS_ARE_RULE.one.label)}</b><span class="u4-scale-ex">${esc(IS_ARE_RULE.one.frame)} ${sayBtn(IS_ARE_RULE.one.example)}</span><span class="u4-scale-note">Example: ${esc(IS_ARE_RULE.one.example)}</span></div></div>
      <div class="u4-scale-row plus2"><span class="u4-scale-mark">2+</span>
        <div class="u4-scale-main"><b>${esc(IS_ARE_RULE.many.label)}</b><span class="u4-scale-ex">${esc(IS_ARE_RULE.many.frame)} ${sayBtn(IS_ARE_RULE.many.example)}</span><span class="u4-scale-note">Example: ${esc(IS_ARE_RULE.many.example)}</span></div></div>
    </div>
    <div class="rule-box" style="margin-top:14px;"><b>Tip</b><p style="margin:8px 0 0;">${esc(IS_ARE_RULE.note)}</p></div>
    <h3 class="u4-h3" style="margin-top:20px;">Check: is or are?</h3>
    ${quizHtml(IS_ARE_QUIZ, 'data-ia')}
  </div>
  <div class="panel">
    <h3 class="u4-h3">Sentences to use</h3>
    ${frames}
    <h3 class="u4-h3" style="margin-top:20px;">Check: the short answer</h3>
    ${quizHtml(ANSWER_QUIZ, 'data-aq')}
    <h3 class="u4-h3" style="margin-top:20px;">Choose the best sentence</h3>
    ${quizHtml(PICK_QUESTION, 'data-pq')}
  </div>`;
}
function wireS2(){
  wireSay();
  const d1=new Set(), d2=new Set(), d3=new Set(); let s1=0, s2=0, s3=0;
  function maybeFinish(){
    if(d1.size>=IS_ARE_QUIZ.length && d2.size>=ANSWER_QUIZ.length && d3.size>=PICK_QUESTION.length){
      markActivityComplete('s2', {score:`Is/are ${s1}/${IS_ARE_QUIZ.length} | Short answers ${s2}/${ANSWER_QUIZ.length} | Sentences ${s3}/${PICK_QUESTION.length}`});
    }
  }
  wireQuiz('data-ia', IS_ARE_QUIZ, d1, ()=>{ s1++; }, maybeFinish);
  wireQuiz('data-aq', ANSWER_QUIZ, d2, ()=>{ s2++; }, maybeFinish);
  wireQuiz('data-pq', PICK_QUESTION, d3, ()=>{ s3++; }, maybeFinish);
}

/* ===== Section 3: Listen, Mark the Map ===== */
function renderS3(){
  const places = LISTEN_PLACES.map((p,i)=>`
    <div class="sit-card" data-lp="${i}">
      <div class="u4-listen-row"><button type="button" class="startbtn u4-play" data-hearp="${i}">${icon('play',{size:18})} Listen</button><span class="u4-hint">Which place is it? Tap it.</span></div>
      <div class="choices" data-lpc="${i}">${p.options.map((o,oi)=>`<button type="button" class="choice-btn" data-v="${oi}"><span class="letter" aria-hidden="true">${placeByName(o).icon}</span> ${esc(o)}</button>`).join('')}</div>
      <div class="feedback u4-msg"></div>
    </div>`).join('');
  const counts = LISTEN_COUNT.map((c,i)=>`
    <div class="sit-card"><div class="u4-listen-row"><button type="button" class="startbtn u4-play" data-hearc="${i}">${icon('play',{size:18})} Listen</button><span class="u4-hint">One thing or many?</span></div>
      ${pickRow(COUNT_OPTIONS,'data-lc',i)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Listening</div>
  <h2 class="section-title">Mark the Map</h2>
  <p class="section-sub">Part A: listen to the description. Tap the place. Part B: listen for "There is" or "There are".</p>
  <div class="panel"><h3 class="u4-h3">Part A: Which place?</h3>${mapTiles(true)}<div style="height:12px;"></div>${places}</div>
  <div class="panel"><h3 class="u4-h3">Part B: One or many?</h3>${counts}
    <div class="u4-score" id="lcScore"></div></div>`;
}
function wireS3(){
  const needed = LISTEN_PLACES.length + LISTEN_COUNT.length;
  let answered = 0, correct = 0;
  function bump(isRight){
    answered++; if(isRight) correct++;
    if(answered >= needed){
      document.getElementById('lcScore').textContent = `Your score: ${correct} / ${needed}`;
      markActivityComplete('s3', {score:`${correct}/${needed}`});
    }
  }
  LISTEN_PLACES.forEach((p,i)=>{
    const card = document.querySelector(`[data-lp="${i}"]`);
    card.querySelector(`[data-hearp="${i}"]`).addEventListener('click', ()=> speak(p.say, {pitch:p.pitch}));
    const box = card.querySelector(`[data-lpc="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || box.dataset.done) return;
      box.dataset.done = '1';
      const right = p.options[+btn.dataset.v] === p.answer;
      btn.classList.add(right ? 'correct' : 'wrong');
      if(!right){ [...box.children].find(b=> p.options[+b.dataset.v] === p.answer).classList.add('correct'); }
      const msg = card.querySelector('.u4-msg'); msg.className = 'feedback show good';
      msg.innerHTML = `Now say it: <b>${esc(p.say)}</b> ${sayBtn(p.say, p.pitch)}`;
      wireSay(); bump(right);
    });
  });
  LISTEN_COUNT.forEach((c,i)=>{
    document.querySelector(`[data-hearc="${i}"]`).addEventListener('click', ()=> speak(c.say, {pitch:c.pitch}));
    const box = document.querySelector(`[data-lc="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || box.dataset.done) return;
      box.dataset.done = '1';
      const kids = [...box.children]; const right = +btn.dataset.v === c.answer;
      btn.classList.add(right ? 'correct' : 'wrong'); if(!right) kids[c.answer].classList.add('correct');
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
function myTour(){ return getS('myTour', {p1:'', t1:'', p2:'', t2:'', op:'', why:''}); }
function tourSentence(){
  const m = myTour();
  return `This is the ${m.p1 || 'library'}. There ${m.t1 || 'are many books'}. This is the ${m.p2 || 'canteen'}. There ${m.t2 || 'is a lot of food'}. I think a good school has ${m.op || 'good teachers'} because ${m.why || 'they help us'}.`;
}
function ladderPanel(i){
  const m = myTour();
  if(i === 0){
    return `
      <p class="section-sub" style="margin-top:0;">Listen to each line. Say it out loud. Then say all four lines.</p>
      ${LADDER_MODEL.map(l=>`<div class="u4-frame"><span class="u4-frame-text">${esc(l)}</span>${sayBtn(l)}</div>`).join('')}
      <button type="button" class="reveal-btn" data-say="${esc(LADDER_MODEL.join(' '))}" style="margin-top:10px;">Hear all four lines</button>
      <button type="button" class="startbtn u4-did" data-did="L1">I said it out loud →</button>`;
  }
  if(i === 1){
    return `
      <p class="section-sub" style="margin-top:0;">Use YOUR PKRU places. After "There", type "is a ..." or "are ...". Then click "Hear mine".</p>
      <div class="u4-form">
        <label>This is the <input type="text" class="u4-input" data-my="p1" value="${esc(m.p1)}" maxlength="30" placeholder="library" autocomplete="off"></label>
        <label>There <input type="text" class="u4-input" data-my="t1" value="${esc(m.t1)}" maxlength="40" placeholder="are many books" autocomplete="off"></label>
        <label>This is the <input type="text" class="u4-input" data-my="p2" value="${esc(m.p2)}" maxlength="30" placeholder="canteen" autocomplete="off"></label>
        <label>There <input type="text" class="u4-input" data-my="t2" value="${esc(m.t2)}" maxlength="40" placeholder="is a lot of food" autocomplete="off"></label>
        <label>I think a good school has <input type="text" class="u4-input" data-my="op" value="${esc(m.op)}" maxlength="30" placeholder="good teachers" autocomplete="off"></label>
        <label>because <input type="text" class="u4-input" data-my="why" value="${esc(m.why)}" maxlength="40" placeholder="they help us" autocomplete="off"></label>
      </div>
      <p class="u4-live" id="myTourText"></p>
      <button type="button" class="reveal-btn" id="hearMine">Hear mine</button>
      <button type="button" class="startbtn u4-did" data-did="L2">I said it out loud →</button>`;
  }
  if(i === 2){
    return `
      <p class="section-sub" style="margin-top:0;">Look only at the pictures. Give a tour with a partner. No full sentences.</p>
      ${mapTiles(false)}
      <div class="u4-keys"><span>THIS IS</span><span>THERE IS / ARE</span><span>OPINION</span><span>BECAUSE</span></div>
      <button type="button" class="startbtn u4-did" data-did="L3">I gave a tour from the pictures →</button>`;
  }
  return `
      <p class="section-sub" style="margin-top:0;">No words! Give a tour of three places to a partner and say your opinion. Look at your partner, not the screen.</p>
      <div class="u4-nopaper" id="noPaper">Words are hidden. Ready?</div>
      <div class="u4-timer-row"><button class="reveal-btn" id="npBtn">Start 1 minute</button><span class="u4-timer" id="npTimer">1:00</span></div>
      <button type="button" class="startbtn u4-did" data-did="L4">I talked with no paper →</button>`;
}
function renderS4(){
  const t = SOUND_TIPS;
  const plural = t.plural.map(p=>`<div class="u4-into"><span class="u4-into-text">${esc(p.text)}</span><span class="u4-into-note">${esc(p.note)}</span>${sayBtn(p.text)}</div>`).join('');
  const tabs = LADDER.map((l,i)=>`<button type="button" class="u4-lvl${i===0?' active':''}" data-lvl="${i}"><b>${l.title}</b><span>${l.sub}</span></button>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Say It!</div>
  <h2 class="section-title">Say It!</h2>
  <p class="section-sub">Each level has fewer words. At the end, you speak with no paper.</p>
  <div class="panel">
    <h3 class="u4-h3">Sound tips</h3>
    <div class="u4-tip"><b>1. "There is" is short</b><p>${esc(t.contraction.note)}</p><div class="u4-contr"><span>${esc(t.contraction.written)}</span><b>→</b><span class="u4-short">${esc(t.contraction.fast)}</span>${sayBtn(t.contraction.ex)}</div></div>
    <div class="u4-tip"><b>2. The ending -s</b>${plural}</div>
    <div class="u4-tip"><b>3. A question goes up</b><div class="u4-into"><span class="u4-into-text">${esc(t.question.text)}</span><span class="u4-into-note">${esc(t.question.note)}</span>${sayBtn(t.question.text)}</div></div>
  </div>
  <div class="panel">
    <h3 class="u4-h3">The speaking ladder</h3>
    <div class="u4-levels" id="lvlTabs">${tabs}</div>
    <div class="u4-level-body" id="lvlBody"></div>
    <div class="u4-progress" id="lvlProgress"></div>
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
    document.querySelectorAll('#lvlTabs .u4-lvl').forEach((t,i)=>{
      t.classList.toggle('active', i === level);
      t.classList.toggle('finished', done.has(LADDER[i].key));
    });
  }
  function show(i){
    level = i; stopTimer(); body.innerHTML = ladderPanel(i);
    wireSay();
    function upd(){
      const el = document.getElementById('myTourText'); if(!el) return;
      const m = myTour();
      el.innerHTML = `This is the <b>${esc(m.p1 || '___')}</b>. There <b>${esc(m.t1 || '___')}</b>. This is the <b>${esc(m.p2 || '___')}</b>. There <b>${esc(m.t2 || '___')}</b>. I think a good school has <b>${esc(m.op || '___')}</b> because <b>${esc(m.why || '___')}</b>.`;
    }
    body.querySelectorAll('[data-my]').forEach(inp=>{
      inp.addEventListener('input', ()=>{ const m = myTour(); m[inp.dataset.my] = inp.value; setS('myTour', m); upd(); });
    });
    upd();
    const hm = document.getElementById('hearMine');
    if(hm) hm.addEventListener('click', ()=> speak(tourSentence()));
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
  document.querySelectorAll('#lvlTabs .u4-lvl').forEach(t=> t.addEventListener('click', ()=> show(+t.dataset.lvl)));
  show(0);
}

/* ===== Section 5: Game, Hidden Place ===== */
function renderS5(){
  return `
  <div class="section-eyebrow">Section 5 · Game</div>
  <h2 class="section-title">Hidden Place</h2>
  <p class="section-sub">Ask yes/no questions and find the secret place. Only the Keeper looks at the phone.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to play</h3>${stepsList(HIDDEN.steps)}</div>
    <div class="u4-spin">
      <button type="button" class="startbtn" id="hidPick">Pick a secret place</button>
      <div class="u4-spin-card" id="hidCard" aria-live="polite">Keeper: press "Pick a secret place". Then look. Nobody else looks!</div>
    </div>
    <button type="button" class="reveal-btn" id="hidHide" disabled>Hide the place</button>
    <button type="button" class="reveal-btn" id="hidDone" disabled>We finished this round</button>
    <div class="u4-score" id="hidCount"></div>
  </div>
  <div class="panel">
    <h3 class="u4-h3">Questions you can ask:</h3>
    ${chipRow(HIDDEN.starters)}
    <h3 class="u4-h3" style="margin-top:16px;">The Keeper answers:</h3>
    ${chipRow(HIDDEN.answers)}
    <h3 class="u4-h3" style="margin-top:16px;">Ideas for questions:</h3>
    ${chipRow(HIDDEN_CLUES)}
  </div>`;
}
function wireS5(){
  wireSay();
  let rounds = getS('rounds', 0), secret = null, last = -1;
  const card = document.getElementById('hidCard'), cnt = document.getElementById('hidCount');
  const hideBtn = document.getElementById('hidHide'), doneBtn = document.getElementById('hidDone');
  function showCount(){ cnt.textContent = rounds ? `Rounds finished: ${rounds}` : ''; }
  showCount();
  document.getElementById('hidPick').addEventListener('click', ()=>{
    let i; do { i = Math.floor(Math.random()*PKRU_PLACES.length); } while(i === last && PKRU_PLACES.length > 1);
    last = i; secret = PKRU_PLACES[i];
    card.innerHTML = `${secret.photo ? placeImg(secret, 'u4-tile-photo') : ''}<div class="u4-spin-topic">${secret.photo ? '' : secret.icon + ' '}${esc(secret.name)}</div><div class="u4-spin-q">Keeper only! Press "Hide the place".</div>`;
    hideBtn.disabled = false; doneBtn.disabled = false;
  });
  hideBtn.addEventListener('click', ()=>{
    card.textContent = 'The place is hidden. Ask your questions!'; hideBtn.disabled = true;
  });
  doneBtn.addEventListener('click', ()=>{
    if(!secret) return;
    rounds++; setS('rounds', rounds); showCount();
    doneBtn.disabled = true; hideBtn.disabled = true; secret = null;
    card.textContent = 'Press "Pick a secret place" for a new round. A new Keeper takes the phone.';
    if(rounds >= 2) markActivityComplete('s5', {completionStatus:'reached'});
  });
  if(rounds >= 2) markActivityComplete('s5', {completionStatus:'reached'});
}

/* ===== Section 6: What Makes a Good School? ===== */
function rankState(){ return getS('rank', {order:[], why:''}); }
function renderS6(){
  const r = rankState();
  const ideas = GOOD_IDEAS.map(g=>{
    const k = r.order.indexOf(g.id);
    return `<button type="button" class="u4-idea${k>=0?' ranked':''}" data-idea="${g.id}"><span class="u4-idea-badge">${k>=0 ? k+1 : ''}</span><span>${esc(g.text)}</span></button>`;
  }).join('');
  const frames = OPINION_FRAMES.map(f=>`
    <div class="u4-frame"><span class="u4-frame-text">${esc(f.frame)}</span>${sayBtn(f.example)}<span class="u4-frame-ex">Example: ${esc(f.example)}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 6 · Opinions</div>
  <h2 class="section-title">What Makes a Good School?</h2>
  <p class="section-sub">There is no wrong answer. Choose your top 3 and say why.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(RANK_STEPS)}</div>
    <h3 class="u4-h3">Tap your top 3 in order</h3>
    <div class="u4-ideas" id="ideaList">${ideas}</div>
    <p class="u4-live" id="rankText"></p>
    <div class="u4-form"><label>because <input type="text" class="u4-input" id="rankWhy" value="${esc(r.why)}" maxlength="50" placeholder="they help us" autocomplete="off"></label></div>
    <button type="button" class="reveal-btn" id="hearRank">Hear mine</button>
  </div>
  <div class="panel">
    <h3 class="u4-h3">Sentences to use</h3>
    ${frames}
  </div>`;
}
function wireS6(){
  wireSay();
  const st = rankState();
  const text = document.getElementById('rankText');
  function textOf(id){ return GOOD_IDEAS.find(g=>g.id === id).text; }
  function mineSentence(){
    if(!st.order.length) return '';
    return `I think a good school has ${textOf(st.order[0])} because ${st.why || '...'}. My number 2 is ${st.order[1] ? textOf(st.order[1]) : '...'}. My number 3 is ${st.order[2] ? textOf(st.order[2]) : '...'}.`;
  }
  function upd(){
    document.querySelectorAll('#ideaList .u4-idea').forEach(b=>{
      const k = st.order.indexOf(b.dataset.idea);
      b.classList.toggle('ranked', k >= 0);
      b.querySelector('.u4-idea-badge').textContent = k >= 0 ? k+1 : '';
    });
    text.innerHTML = st.order.length
      ? `I think a good school has <b>${esc(textOf(st.order[0]))}</b> because <b>${esc(st.why || '___')}</b>.`
      : 'Tap an idea to start.';
    if(st.order.length >= 3 && (st.why || '').trim().length >= 2) markActivityComplete('s6', {completionStatus:'completed'});
  }
  document.getElementById('ideaList').addEventListener('click', e=>{
    const b = e.target.closest('.u4-idea'); if(!b) return;
    const k = st.order.indexOf(b.dataset.idea);
    if(k >= 0) st.order.splice(k, 1); else if(st.order.length < 3) st.order.push(b.dataset.idea);
    setS('rank', st); upd();
  });
  document.getElementById('rankWhy').addEventListener('input', e=>{ st.why = e.target.value; setS('rank', st); upd(); });
  document.getElementById('hearRank').addEventListener('click', ()=>{ const s = mineSentence(); if(s) speak(s); });
  upd();
}

/* ===== Section 7: Speaking Task, School Tour ===== */
function renderS7(){
  const qs = TOUR.questions.map(q=>`<div class="u4-frame"><span class="u4-frame-text">${esc(q)}</span>${sayBtn(q)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 7 · Speaking Task</div>
  <h2 class="section-title">${esc(TOUR.title)}</h2>
  <p class="section-sub">Give a new student a tour of PKRU. 1 to 2 minutes. No reading from paper!</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(TOUR.steps)}</div>
    <h3 class="u4-h3">The PKRU map</h3>
    ${mapTiles(true)}
    <button type="button" class="reveal-btn" id="hideNames" style="margin-top:10px;">Hide the names (pictures only)</button>
    <div class="u4-timer-row"><button class="reveal-btn" id="tourBtn">Start 2 minutes</button><span class="u4-timer" id="tourTimer">2:00</span></div>
  </div>
  <div class="panel">
    <h3 class="u4-h3">A model tour</h3>
    <div class="scenario-message">${TOUR.model.map(l=>`${esc(l)} ${sayBtn(l)}`).join('<br>')}</div>
    <button type="button" class="reveal-btn" data-say="${esc(TOUR.model.join(' '))}" style="margin-top:10px;">Hear the whole model</button>
    <h3 class="u4-h3" style="margin-top:18px;">Questions the new student can ask</h3>
    ${qs}
  </div>
  <div class="panel">
    <h3 class="u4-h3">Partner checklist</h3>
    <p class="section-sub" style="margin-top:0;">Your partner listens. Check what you did.</p>
    ${checkRows('pc', PEER_CHECKLIST)}
    <div class="u4-score" id="pcScore">0 / ${PEER_CHECKLIST.length}</div>
    <button type="button" class="startbtn" id="s7done" style="margin-top:14px;">We finished the task →</button>
  </div>`;
}
function wireS7(){
  wireSay();
  document.getElementById('hideNames').addEventListener('click', e=>{
    const names = document.querySelectorAll('#u4Map .u4-tile-name');
    const hide = !names[0].classList.contains('hide');
    names.forEach(n=> n.classList.toggle('hide', hide));
    e.target.textContent = hide ? 'Show the names' : 'Hide the names (pictures only)';
  });
  const tb = document.getElementById('tourBtn');
  tb.addEventListener('click', ()=>{
    tb.disabled = true;
    runTimer(document.getElementById('tourTimer'), 120, ()=>{ tb.disabled = false; speak('Time is up. Great tour!'); });
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
  document.getElementById('s7done').addEventListener('click', ()=>{
    markActivityComplete('s7', {score:`${checked.size}/${PEER_CHECKLIST.length}`});
    goNext();
  });
}

/* ===== Section 8: Self-Check ===== */
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
    <div class="u4-score" id="canTotal"></div>
    <div class="feedback" id="canMsg"></div>
  </div>
  <div class="panel u4-extra">
    <h3 class="u4-h3">Practice at home</h3>
    <p class="section-sub" style="margin-top:0;">${esc(EXTRA.note)}</p>
    <a class="startbtn u4-extra-link" href="${EXTRA.href}" target="_blank" rel="noopener">${esc(EXTRA.label)} →</a>
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
      msg.textContent = total >= 15 ? 'Great! You are ready for Unit 5.' : 'Good start! Practice the "Not yet" ones with a friend.';
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
    <div class="cover-badge">UNIT 4 COMPLETE</div>
    <div class="u4-wave" aria-hidden="true">🎉</div>
    <h1>You can <span>show our school in English.</span></h1>
    <p>Next: Unit 5 will be about your day. What do you do at school and at home?</p>
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
}
renderAll();
