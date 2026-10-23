/* ===================== APP STATE / ROUTER =====================
   Same router, progress, check-in and voice system as the other English for
   Communication units. Unit 3 uses the browser's own text-to-speech (American
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s5b','s6','s7','exit'];

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
const CHECKIN_STORAGE_KEY = 'efc_u3_checkin';
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

/* ===================== UNIT 3 HELPERS (shared) ===================== */
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
function stepsList(steps){ return `<ol class="u3-steps">${steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`; }
function chipRow(items){
  return `<div class="u3-chips">${items.map(t=>`<span class="u3-chip">${esc(t)}${sayBtn(t.replace(/___/g,'...').replace(/\s+\.\.\./,' '))}</span>`).join('')}</div>`;
}

/* ===================== UNIT 3 HELPERS (chat) ===================== */
function speakChat(lines){
  if(!('speechSynthesis' in window)){ alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakSequence(lines.map(l=>({text:l.text, opts:VOICE[l.who]})));
}
function chatHtml(lines, withRoles){
  return `<div class="u3-chat">${lines.map(l=>`
    <div class="u3-bubble ${l.who === 'A' ? 'a' : 'b'}">
      <span class="u3-who">${l.who}</span>
      <span class="u3-line">${esc(l.text)}</span>
      ${withRoles && l.role ? `<span class="u3-role r-${l.role}">${esc(ROLE_LABEL[l.role])}</span>` : ''}
    </div>`).join('')}</div>`;
}
function pickRow(options, attr, idx){
  return `<div class="choices" ${attr}="${idx}">${options.map((o,oi)=>`<button type="button" class="choice-btn" data-v="${oi}"><span class="letter">${'ABC'[oi]}</span> ${esc(o)}</button>`).join('')}</div>`;
}

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  const objectives = LESSON_OBJECTIVES.map(o=>`<li>${o}</li>`).join('');
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>I like it! <span>I don’t like it.</span></h1>
    <p>Unit 3: Likes and dislikes.</p>
    <img class="section-hero-photo" src="../../../assets/images/efc-u3-cover.jpg" alt="A group of friends at a cafe table, one giving a thumbs up and one a thumbs down" loading="lazy">
    <div class="cover-objectives">
      <b>By the end of this lesson, you can:</b>
      <ul>${objectives}</ul>
    </div>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Because + reasons</div>
      <div class="signchip"><span class="arrow">→</span> Listening and games</div>
      <div class="signchip"><span class="arrow">→</span> Favorites interview</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up, Thumbs Up, Thumbs Down ===== */
function renderS1(){
  const checks = ['I showed thumbs up or thumbs down.', 'I said "Me too!" or "Me neither."', 'I asked a classmate "Why?"'].map((t,i)=>`
    <div class="checklist-row" data-th="${i}"><div class="checklist-box">✓</div><div class="checklist-lbl">${esc(t)}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 1 · Warm-Up</div>
  <h2 class="section-title">Thumbs Up, Thumbs Down</h2>
  <p class="section-sub">A speaking game. Listen to your teacher. Put your phone away.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to play</h3>${stepsList(THUMBS.steps)}</div>
    <h3 class="u3-h3">Practice these sentences. Say them out loud.</h3>
    ${chipRow(THUMBS.sentences)}
    <h3 class="u3-h3" style="margin-top:16px;">You can say:</h3>
    ${chipRow(THUMBS.helpers)}
  </div>
  <div class="panel">
    <h3 class="u3-h3">Check each one when you finish.</h3>
    ${checks}
  </div>`;
}
function wireS1(){
  wireSay();
  const done = new Set(getS('thumbs', []));
  document.querySelectorAll('#app [data-th]').forEach(row=>{
    if(done.has(row.dataset.th)) row.classList.add('checked');
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) done.add(row.dataset.th); else done.delete(row.dataset.th);
      setS('thumbs', [...done]);
      if(done.size >= 3) markActivityComplete('s1', {completionStatus:'reached'});
    });
  });
}

/* ===== Section 2: How Much Do You Like It? ===== */
function quizHtml(list, attr){
  return list.map((q,i)=>`<div class="sit-card"><p class="u3-q">${esc(q.q || q.goal)}</p>${pickRow(q.options, attr, i)}</div>`).join('');
}
function renderS2(){
  const scale = SCALE_CARDS.map(c=>`
    <div class="u3-scale-row ${c.level}"><span class="u3-scale-mark">${c.level==='plus2'?'++':c.level==='plus1'?'+':c.level==='minus1'?'−':'−−'}</span>
      <div class="u3-scale-main"><b>${esc(c.label)}</b><span class="u3-scale-ex">${esc(c.say)} ${sayBtn(c.say)}</span><span class="u3-scale-note">${esc(c.note)}</span></div></div>`).join('');
  const reasons = REASON_WORDS.map(r=>`
    <div class="u3-card"><div class="u3-card-main">${esc(r.word)}</div><div class="u3-card-sub">${esc(r.ex)}</div>${sayBtn(r.ex)}</div>`).join('');
  const frames = FRAMES.map(f=>`
    <div class="u3-frame"><span class="u3-frame-text">${esc(f.frame)}</span>${sayBtn(f.example)}<span class="u3-frame-ex">Example: ${esc(f.example)}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · See It, Hear It, Say It</div>
  <h2 class="section-title">How Much Do You Like It?</h2>
  <p class="section-sub">Click "Hear it" to listen. Then say it out loud. Always say it out loud!</p>
  <div class="panel">
    <h3 class="u3-h3">The like scale</h3>
    <div class="u3-scale">${scale}</div>
    <div class="rule-box" style="margin-top:14px;"><b>Tip</b><p style="margin:8px 0 0;">${esc(SCALE_TIP)}</p></div>
    <h3 class="u3-h3" style="margin-top:20px;">Check: strong words</h3>
    ${quizHtml(STRONGER_QUIZ, 'data-st')}
  </div>
  <div class="panel">
    <h3 class="u3-h3">Give a reason with "because"</h3>
    <p class="section-sub" style="margin-top:0;">A chat is more interesting with a reason. Use these words after "it’s".</p>
    <div class="u3-cards">${reasons}</div>
    <h3 class="u3-h3" style="margin-top:20px;">Check: because, but, or and?</h3>
    ${quizHtml(BECAUSE_QUIZ, 'data-bq')}
  </div>
  <div class="panel">
    <h3 class="u3-h3">Sentences to use</h3>
    ${frames}
    <h3 class="u3-h3" style="margin-top:20px;">Choose the best question</h3>
    ${quizHtml(PICK_QUESTION, 'data-pq')}
  </div>`;
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
function wireS2(){
  wireSay();
  const d1=new Set(), d2=new Set(), d3=new Set(); let s1=0, s2=0, s3=0;
  function maybeFinish(){
    if(d1.size>=STRONGER_QUIZ.length && d2.size>=BECAUSE_QUIZ.length && d3.size>=PICK_QUESTION.length){
      markActivityComplete('s2', {score:`Strong words ${s1}/${STRONGER_QUIZ.length} | Because ${s2}/${BECAUSE_QUIZ.length} | Questions ${s3}/${PICK_QUESTION.length}`});
    }
  }
  wireQuiz('data-st', STRONGER_QUIZ, d1, ()=>{ s1++; }, maybeFinish);
  wireQuiz('data-bq', BECAUSE_QUIZ, d2, ()=>{ s2++; }, maybeFinish);
  wireQuiz('data-pq', PICK_QUESTION, d3, ()=>{ s3++; }, maybeFinish);
}

/* ===== Section 3: Listen, Who Likes What? ===== */
function renderS3(){
  const speakers = SPEAKERS.map((s,si)=>`
    <div class="sit-card u3-spk" data-spk="${si}">
      <p class="u3-q">Speaker ${si+1}: ${esc(s.name)}</p>
      <div class="u3-listen-row">
        <button type="button" class="startbtn u3-play" data-hearspk="${si}">${icon('play',{size:18})} Listen</button>
        <span class="u3-hint">Listen as many times as you like.</span>
      </div>
      ${s.items.map((it,ii)=>`
        <div class="u3-tick" data-tick="${si}-${ii}">
          <span class="u3-tick-topic">${esc(it.topic)}</span>
          <span class="u3-tick-btns"><button type="button" class="u3-lk" data-v="1">Likes it</button><button type="button" class="u3-lk" data-v="0">Doesn’t like it</button></span>
        </div>`).join('')}
      <div class="feedback u3-msg"></div>
    </div>`).join('');
  const reasons = REASON_LISTEN.map((r,i)=>`
    <div class="sit-card"><div class="u3-listen-row"><button type="button" class="startbtn u3-play" data-hearr="${i}">${icon('play',{size:18})} Listen</button><span class="u3-hint">${esc(r.q)}</span></div>
      ${pickRow(r.options,'data-rl',i)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Listening</div>
  <h2 class="section-title">Who Likes What?</h2>
  <p class="section-sub">Part A: listen to each person. Choose if they like it or do not like it. Part B: listen for the reason after "because".</p>
  <div class="panel"><h3 class="u3-h3">Part A: Likes and dislikes</h3>${speakers}</div>
  <div class="panel"><h3 class="u3-h3">Part B: The reason</h3>${reasons}
    <div class="u3-score" id="lcScore"></div></div>`;
}
function wireS3(){
  const needed = SPEAKERS.reduce((n,s)=>n+s.items.length,0) + REASON_LISTEN.length;
  let answered = 0, correct = 0;
  function bump(isRight){
    answered++; if(isRight) correct++;
    if(answered >= needed){
      document.getElementById('lcScore').textContent = `Your score: ${correct} / ${needed}`;
      markActivityComplete('s3', {score:`${correct}/${needed}`});
    }
  }
  SPEAKERS.forEach((s,si)=>{
    const card = document.querySelector(`[data-spk="${si}"]`);
    card.querySelector(`[data-hearspk="${si}"]`).addEventListener('click', ()=> speak(s.say, {pitch:s.pitch}));
    let done = 0;
    s.items.forEach((it,ii)=>{
      const row = card.querySelector(`[data-tick="${si}-${ii}"]`);
      row.addEventListener('click', e=>{
        const btn = e.target.closest('.u3-lk'); if(!btn || row.dataset.done) return;
        row.dataset.done = '1';
        const right = (+btn.dataset.v === 1) === it.like;
        btn.classList.add(right ? 'correct' : 'wrong');
        if(!right){ [...row.querySelectorAll('.u3-lk')].find(b=> (+b.dataset.v === 1) === it.like).classList.add('correct'); }
        done++; bump(right);
        if(done >= s.items.length){
          const msg = card.querySelector('.u3-msg'); msg.className = 'feedback show good';
          msg.innerHTML = `Now read it and say it: <b>${esc(s.say)}</b> ${sayBtn(s.say, s.pitch)}`;
          wireSay();
        }
      });
    });
  });
  REASON_LISTEN.forEach((r,i)=>{
    document.querySelector(`[data-hearr="${i}"]`).addEventListener('click', ()=> speak(r.say, {pitch:r.pitch}));
    const box = document.querySelector(`[data-rl="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || box.dataset.done) return;
      box.dataset.done = '1';
      const kids = [...box.children]; const right = +btn.dataset.v === r.correct;
      btn.classList.add(right ? 'correct' : 'wrong'); if(!right) kids[r.correct].classList.add('correct');
      bump(right);
    });
  });
}

/* ===== Section 4: Say It! ===== */
const LADDER = [
  {key:'L1', title:'Level 1', sub:'Read and repeat'},
  {key:'L2', title:'Level 2', sub:'Fill the frame'},
  {key:'L3', title:'Level 3', sub:'Keywords only'},
  {key:'L4', title:'Level 4', sub:'No paper!'}
];
function myLikes(){ return getS('myLikes', {like:'', likeWhy:'', dis:'', disWhy:''}); }
function ladderPanel(i){
  const m = myLikes();
  if(i === 0){
    return `
      <p class="section-sub" style="margin-top:0;">Listen to each line. Say it out loud. Then say all four lines.</p>
      ${LADDER_MODEL.map(l=>`<div class="u3-frame"><span class="u3-frame-text">${esc(l)}</span>${sayBtn(l)}</div>`).join('')}
      <button type="button" class="reveal-btn" data-say="${esc(LADDER_MODEL.join(' '))}" style="margin-top:10px;">Hear all four lines</button>
      <button type="button" class="startbtn u3-did" data-did="L1">I said it out loud →</button>`;
  }
  if(i === 1){
    return `
      <p class="section-sub" style="margin-top:0;">Now use YOUR ideas. Fill the blanks. Then click "Hear mine".</p>
      <div class="u3-form">
        <label>I like <input type="text" class="u3-input" data-my="like" value="${esc(m.like)}" maxlength="30" placeholder="music" autocomplete="off"></label>
        <label>because it’s <input type="text" class="u3-input" data-my="likeWhy" value="${esc(m.likeWhy)}" maxlength="30" placeholder="relaxing" autocomplete="off"></label>
        <label>I don’t like <input type="text" class="u3-input" data-my="dis" value="${esc(m.dis)}" maxlength="30" placeholder="homework" autocomplete="off"></label>
        <label>because it’s <input type="text" class="u3-input" data-my="disWhy" value="${esc(m.disWhy)}" maxlength="30" placeholder="boring" autocomplete="off"></label>
      </div>
      <p class="u3-live" id="myLikesText"></p>
      <button type="button" class="reveal-btn" id="hearMine">Hear mine</button>
      <button type="button" class="startbtn u3-did" data-did="L2">I said it out loud →</button>`;
  }
  if(i === 2){
    return `
      <p class="section-sub" style="margin-top:0;">Look only at the keywords. Say a full chat with a partner.</p>
      <div class="u3-keys"><span>LIKE</span><span>BECAUSE</span><span>DON’T LIKE</span><span>BECAUSE</span><span>ASK BACK</span></div>
      <button type="button" class="startbtn u3-did" data-did="L3">I said it from the keywords →</button>`;
  }
  return `
      <p class="section-sub" style="margin-top:0;">No words! Tell a partner what you like and do not like, with reasons. Look at your partner, not the screen.</p>
      <div class="u3-nopaper" id="noPaper">Words are hidden. Ready?</div>
      <div class="u3-timer-row"><button class="reveal-btn" id="npBtn">Start 1 minute</button><span class="u3-timer" id="npTimer">1:00</span></div>
      <button type="button" class="startbtn u3-did" data-did="L4">I talked with no paper →</button>`;
}
function renderS4(){
  const stress = SOUND_TIPS.stress.map(t=>`<div class="u3-into"><span class="u3-into-text">${esc(t.text)}</span><span class="u3-into-note">${esc(t.note)}</span>${sayBtn(t.text)}</div>`).join('');
  const b = SOUND_TIPS.because;
  const tabs = LADDER.map((l,i)=>`<button type="button" class="u3-lvl${i===0?' active':''}" data-lvl="${i}"><b>${l.title}</b><span>${l.sub}</span></button>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Say It!</div>
  <h2 class="section-title">Say It!</h2>
  <p class="section-sub">Each level has fewer words. At the end, you speak with no paper.</p>
  <div class="panel">
    <h3 class="u3-h3">Sound tips</h3>
    <div class="u3-tip"><b>1. The feeling word is strong</b>${stress}</div>
    <div class="u3-tip"><b>2. "Because" is short</b><p>${esc(b.note)}</p><div class="u3-contr"><span>${esc(b.written)}</span><b>→</b><span class="u3-short">${esc(b.fast)}</span>${sayBtn(b.ex)}</div></div>
    <div class="u3-tip"><b>3. Two choices</b><div class="u3-into"><span class="u3-into-text">${esc(SOUND_TIPS.choice.text)}</span><span class="u3-into-note">${esc(SOUND_TIPS.choice.note)}</span>${sayBtn(SOUND_TIPS.choice.text)}</div></div>
  </div>
  <div class="panel">
    <h3 class="u3-h3">The speaking ladder</h3>
    <div class="u3-levels" id="lvlTabs">${tabs}</div>
    <div class="u3-level-body" id="lvlBody"></div>
    <div class="u3-progress" id="lvlProgress"></div>
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
    document.querySelectorAll('#lvlTabs .u3-lvl').forEach((t,i)=>{
      t.classList.toggle('active', i === level);
      t.classList.toggle('finished', done.has(LADDER[i].key));
    });
  }
  function mySentence(){
    const m = myLikes();
    return `I like ${m.like || 'music'}. I like ${m.like || 'music'} because it’s ${m.likeWhy || 'relaxing'}. I don’t like ${m.dis || 'homework'}. I don’t like ${m.dis || 'homework'} because it’s ${m.disWhy || 'boring'}.`;
  }
  function show(i){
    level = i; stopTimer(); body.innerHTML = ladderPanel(i);
    wireSay();
    function upd(){
      const el = document.getElementById('myLikesText'); if(!el) return;
      const m = myLikes();
      el.innerHTML = `I like <b>${esc(m.like || '___')}</b> because it’s <b>${esc(m.likeWhy || '___')}</b>. I don’t like <b>${esc(m.dis || '___')}</b> because it’s <b>${esc(m.disWhy || '___')}</b>.`;
    }
    body.querySelectorAll('[data-my]').forEach(inp=>{
      inp.addEventListener('input', ()=>{ const m = myLikes(); m[inp.dataset.my] = inp.value; setS('myLikes', m); upd(); });
    });
    upd();
    const hm = document.getElementById('hearMine');
    if(hm) hm.addEventListener('click', ()=> speak(mySentence()));
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
  document.querySelectorAll('#lvlTabs .u3-lvl').forEach(t=> t.addEventListener('click', ()=> show(+t.dataset.lvl)));
  show(0);
}

/* ===== Section 5: Games ===== */
function renderS5(){
  const checks = TOT_CHECKS.map((c,i)=>`
    <div class="checklist-row" data-tc="${i}"><div class="checklist-box">✓</div><div class="checklist-lbl">${esc(c)}</div></div>`).join('');
  const qb = QUESTION_BALL.questions.map(q=>`<div class="u3-frame"><span class="u3-frame-text">${esc(q)}</span>${sayBtn(q)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 5 · Games</div>
  <h2 class="section-title">This or That</h2>
  <p class="section-sub">Two games, and one extra game if there is time. First, play This or That on your phone with a partner.</p>
  <div class="panel">
    <div class="assign-box"><h3>Game 1: This or That</h3>${stepsList(TOT_RULES)}</div>
    <div class="u3-spin">
      <button type="button" class="startbtn" id="totBtn">Next pair!</button>
      <div class="u3-spin-card" id="totCard" aria-live="polite">Press "Next pair!" to start.</div>
    </div>
    <div class="u3-timer-row"><button class="reveal-btn" id="chatTimerBtn" disabled>Start 30 seconds</button><span class="u3-timer" id="chatTimer">0:30</span></div>
    <h3 class="u3-h3" style="margin-top:14px;">Check each one when you do it:</h3>
    ${checks}
    <button type="button" class="reveal-btn" id="totDone" disabled style="margin-top:10px;">We finished this pair</button>
    <div class="u3-score" id="totCount"></div>
  </div>
  <div class="panel">
    <div class="assign-box"><h3>${esc(QUESTION_BALL.title)}</h3>${stepsList(QUESTION_BALL.steps)}</div>
    <h3 class="u3-h3">Questions you can ask:</h3>
    ${qb}
  </div>
  <div class="panel">
    <div class="assign-box"><h3>${esc(BAR_GRAPH.title)}</h3>${stepsList(BAR_GRAPH.steps)}</div>
  </div>`;
}
function wireS5(){
  wireSay();
  let pairs = getS('pairs', 0), current = null, last = -1;
  const card = document.getElementById('totCard'), cnt = document.getElementById('totCount');
  const timerBtn = document.getElementById('chatTimerBtn'), doneBtn = document.getElementById('totDone');
  const rows = [...document.querySelectorAll('#app [data-tc]')];
  function showCount(){ cnt.textContent = pairs ? `Pairs finished: ${pairs}` : ''; }
  showCount();
  document.getElementById('totBtn').addEventListener('click', ()=>{
    let i; do { i = Math.floor(Math.random()*THIS_OR_THAT.length); } while(i === last && THIS_OR_THAT.length > 1);
    last = i; current = THIS_OR_THAT[i];
    card.innerHTML = `<div class="u3-spin-topic">${esc(current.a)} <span class="u3-or">or</span> ${esc(current.b)}?</div><div class="u3-spin-q">Say: "I like ${esc(current.a)} because it’s ___."</div>`;
    rows.forEach(r=> r.classList.remove('checked'));
    timerBtn.disabled = false; doneBtn.disabled = false;
    speak(`${current.a} or ${current.b}?`);
  });
  timerBtn.addEventListener('click', ()=>{
    timerBtn.disabled = true;
    runTimer(document.getElementById('chatTimer'), 30, ()=>{ timerBtn.disabled = false; speak('Time is up! Next pair.'); });
  });
  rows.forEach(r=> r.addEventListener('click', ()=> r.classList.toggle('checked')));
  doneBtn.addEventListener('click', ()=>{
    if(!current) return;
    pairs++; setS('pairs', pairs); showCount();
    doneBtn.disabled = true; card.textContent = 'Press "Next pair!" for a new pair.'; current = null;
    rows.forEach(r=> r.classList.remove('checked'));
    if(pairs >= 3) markActivityComplete('s5', {completionStatus:'reached'});
  });
  if(pairs >= 3) markActivityComplete('s5', {completionStatus:'reached'});
}

/* ===== Section 5b: Notes and He/She ===== */
function renderS5b(){
  const notes = NOTES_LISTEN.map((n,i)=>`
    <div class="sit-card"><div class="u3-listen-row"><button type="button" class="startbtn u3-play" data-hearn="${i}">${icon('play',{size:18})} Listen</button><span class="u3-hint">Write 2 keywords on paper. Then press "Show a model".</span></div>
      <button type="button" class="reveal-btn" data-shown="${i}">Show a model</button>
      <div class="feedback u3-nmsg" data-nmsg="${i}"></div></div>`).join('');
  const drill = HESHE_DRILL.map((h,i)=>`
    <div class="sit-card"><p class="u3-q">${esc(h.i)}</p><p class="u3-hint">Say it about a classmate (she or he). Then check.</p>
      <button type="button" class="reveal-btn" data-hsr="${i}">Check</button>
      <div class="feedback u3-hmsg" data-hmsg="${i}"></div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 6 · Two Skills for the Interview</div>
  <h2 class="section-title">Notes and He/She</h2>
  <p class="section-sub">In the interview you listen, write notes, and then tell a new partner. Practice both skills first.</p>
  <div class="panel">
    <h3 class="u3-h3">Part A: Keyword notes</h3>
    <div class="rule-box"><b>Tip</b><p style="margin:8px 0 0;">${esc(NOTES_TIP)}</p></div>
    ${notes}
  </div>
  <div class="panel">
    <h3 class="u3-h3">Part B: Say he or she</h3>
    <p class="section-sub" style="margin-top:0;">Say the sentence out loud with "she" or "he". Then check. Add -s to like, love and hate.</p>
    ${drill}
    <div class="u3-score" id="nhScore"></div>
  </div>`;
}
function wireS5b(){
  wireSay();
  const nSeen = new Set(), hSeen = new Set();
  function finish(){
    document.getElementById('nhScore').textContent = `Notes: ${nSeen.size} / ${NOTES_LISTEN.length} | He/she: ${hSeen.size} / ${HESHE_DRILL.length}`;
    if(nSeen.size >= NOTES_LISTEN.length && hSeen.size >= 4) markActivityComplete('s5b', {score:`Notes ${nSeen.size}/${NOTES_LISTEN.length} | He/she ${hSeen.size}/${HESHE_DRILL.length}`, completionStatus:'reached'});
  }
  NOTES_LISTEN.forEach((n,i)=>{
    document.querySelector(`[data-hearn="${i}"]`).addEventListener('click', ()=> speak(n.say, {pitch:n.pitch}));
    document.querySelector(`[data-shown="${i}"]`).addEventListener('click', ()=>{
      const m = document.querySelector(`[data-nmsg="${i}"]`); m.className = 'feedback show good';
      m.innerHTML = `Model notes: <b>${esc(n.model)}</b>`; nSeen.add(i); finish();
    });
  });
  HESHE_DRILL.forEach((h,i)=>{
    document.querySelector(`[data-hsr="${i}"]`).addEventListener('click', ()=>{
      const m = document.querySelector(`[data-hmsg="${i}"]`); m.className = 'feedback show good';
      m.innerHTML = `<b>${esc(h.she)}</b> ${sayBtn(h.she)}`; wireSay(); hSeen.add(i); finish();
    });
  });
  finish();
}

/* ===== Section 6: Speaking Task, Favorites Interview ===== */
function renderS6(){
  const card = getS('card', {});
  const fields = CARD_FIELDS.map(f=>`
    <div class="u3-cardrow"><div class="u3-cardrow-lbl">${esc(f.label)}</div>
      <input type="text" class="u3-input" data-cf="${f.key}" value="${esc(card[f.key] || '')}" maxlength="40" placeholder="answer" autocomplete="off">
      <input type="text" class="u3-input" data-cf="${f.key}w" value="${esc(card[f.key+'w'] || '')}" maxlength="40" placeholder="because ..." autocomplete="off"></div>`).join('');
  const checklist = PEER_CHECKLIST.map((c,i)=>`
    <div class="checklist-row" data-pc="${i}"><div class="checklist-box">✓</div><div class="checklist-lbl">${esc(c)}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 7 · Speaking Task</div>
  <h2 class="section-title">${esc(INTERVIEW.title)}</h2>
  <p class="section-sub">Interview a classmate about favorites. Then tell a new partner what your partner likes. No reading from paper!</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(INTERVIEW.steps)}</div>
    <h3 class="u3-h3">My partner card</h3>
    <p class="section-sub" style="margin-top:0;">Write short notes. Notes only, not full sentences.</p>
    ${fields}
  </div>
  <div class="panel">
    <h3 class="u3-h3">${esc(REPORT.title)}</h3>
    <div class="scenario-message">${REPORT.model.map(l=>`${esc(l)} ${sayBtn(l)}`).join('<br>')}</div>
    <button type="button" class="reveal-btn" data-say="${esc(REPORT.model.join(' '))}" style="margin-top:10px;">Hear the whole model</button>
    <h3 class="u3-h3" style="margin-top:18px;">He or she: add -s</h3>
    <table class="u3-table"><tbody>
      ${REPORT.sTip.map(r=>`<tr><td>${esc(r.i)}</td><td>→</td><td><b>${esc(r.she)}</b></td></tr>`).join('')}
    </tbody></table>
    <p class="section-sub" style="margin-top:8px;">${esc(REPORT.sTipNote)}</p>
  </div>
  <div class="panel">
    <h3 class="u3-h3">Partner checklist</h3>
    <p class="section-sub" style="margin-top:0;">Your partner listens. Check what you did.</p>
    ${checklist}
    <div class="u3-score" id="pcScore">0 / ${PEER_CHECKLIST.length}</div>
    <button type="button" class="startbtn" id="s6done" style="margin-top:14px;">We finished the task →</button>
  </div>`;
}
function wireS6(){
  wireSay();
  document.querySelectorAll('#app [data-cf]').forEach(inp=> inp.addEventListener('input', ()=>{
    const card = getS('card', {}); card[inp.dataset.cf] = inp.value; setS('card', card);
  }));
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
  <div class="section-eyebrow">Section 8 · Self-Check</div>
  <h2 class="section-title">What Can You Do?</h2>
  <p class="section-sub">Be honest. This is for you. Choose one for each sentence.</p>
  <div class="panel">${rows}
    <div class="u3-score" id="canTotal"></div>
    <div class="feedback" id="canMsg"></div>
  </div>
  <div class="panel u3-extra">
    <h3 class="u3-h3">Practice at home</h3>
    <p class="section-sub" style="margin-top:0;">${esc(EXTRA.note)}</p>
    <a class="startbtn u3-extra-link" href="${EXTRA.href}" target="_blank" rel="noopener">${esc(EXTRA.label)} →</a>
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
      msg.textContent = total >= 15 ? 'Great! You are ready for Unit 4.' : 'Good start! Practice the "Not yet" ones with a friend.';
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
    <div class="cover-badge">UNIT 3 COMPLETE</div>
    <div class="u3-wave" aria-hidden="true">🎉</div>
    <h1>You can <span>say what you like, and why.</span></h1>
    <p>Next: Unit 4 will be about your school. Keep using "because"!</p>
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
  {r:renderS5b, w:wireS5b},
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
