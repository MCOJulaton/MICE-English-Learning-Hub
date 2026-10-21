/* ===================== APP STATE / ROUTER =====================
   Same router, progress, check-in and voice system as the other English for
   Communication units. Unit 2 uses the browser's own text-to-speech (American
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7'];

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
const CHECKIN_STORAGE_KEY = 'efc_u2_checkin';
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

/* ===================== UNIT 2 HELPERS (shared) ===================== */
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
function stepsList(steps){ return `<ol class="u2-steps">${steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`; }
function chipRow(items){
  return `<div class="u2-chips">${items.map(t=>`<span class="u2-chip">${esc(t)}${sayBtn(t.replace(/___/g,'...').replace(/\s+\.\.\./,' '))}</span>`).join('')}</div>`;
}

/* ===================== UNIT 2 HELPERS (chat) ===================== */
function speakChat(lines){
  if(!('speechSynthesis' in window)){ alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakSequence(lines.map(l=>({text:l.text, opts:VOICE[l.who]})));
}
function chatHtml(lines, withRoles){
  return `<div class="u2-chat">${lines.map(l=>`
    <div class="u2-bubble ${l.who === 'A' ? 'a' : 'b'}">
      <span class="u2-who">${l.who}</span>
      <span class="u2-line">${esc(l.text)}</span>
      ${withRoles && l.role ? `<span class="u2-role r-${l.role}">${esc(ROLE_LABEL[l.role])}</span>` : ''}
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
    <div class="u2-wave" aria-hidden="true">💬</div>
    <h1>Let's chat! <span>Small talk.</span></h1>
    <p>Unit 2: Start a chat, keep it going, and react.</p>
    <div class="cover-objectives">
      <b>By the end of this lesson, you can:</b>
      <ul>${objectives}</ul>
    </div>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Chat pattern</div>
      <div class="signchip"><span class="arrow">→</span> Listening and games</div>
      <div class="signchip"><span class="arrow">→</span> 2-minute chat</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up, Stand Up, Sit Down ===== */
function renderS1(){
  const checks = ['I stood up for a sentence.', 'I said "Me too!" to a classmate.', 'I asked a classmate a question.'].map((t,i)=>`
    <div class="checklist-row" data-su="${i}"><div class="checklist-box">✓</div><div class="checklist-lbl">${esc(t)}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 1 · Warm-Up</div>
  <h2 class="section-title">Stand Up, Sit Down</h2>
  <p class="section-sub">A speaking game. Listen to your teacher. Put your phone away.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to play</h3>${stepsList(STAND_UP.steps)}</div>
    <h3 class="u2-h3">Practice these sentences. Say them out loud.</h3>
    ${chipRow(STAND_UP.sentences)}
    <h3 class="u2-h3" style="margin-top:16px;">You can say:</h3>
    ${chipRow(STAND_UP.helpers)}
  </div>
  <div class="panel">
    <h3 class="u2-h3">Check each one when you finish.</h3>
    ${checks}
  </div>`;
}
function wireS1(){
  wireSay();
  const done = new Set(getS('standup', []));
  document.querySelectorAll('#app [data-su]').forEach(row=>{
    if(done.has(row.dataset.su)) row.classList.add('checked');
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) done.add(row.dataset.su); else done.delete(row.dataset.su);
      setS('standup', [...done]);
      if(done.size >= 3) markActivityComplete('s1', {completionStatus:'reached'});
    });
  });
}

/* ===== Section 2: The Small Talk Pattern ===== */
function renderS2(){
  const pattern = PATTERN.map((p,i)=>`
    <div class="u2-step r-${p.key}"><div class="u2-step-n">${i+1}</div>
      <div class="u2-step-main"><b>${esc(p.name)}</b><span class="u2-step-ex">${esc(p.ex)} ${sayBtn(p.ex)}</span><span class="u2-step-note">${esc(p.note)}</span></div></div>`).join('');
  const bank = QUESTION_BANK.map(g=>`
    <div class="u2-bank-group"><div class="u2-bank-title">${esc(g.head)}</div>
      ${g.items.map(it=>`<div class="u2-qa"><div class="u2-qa-q">${esc(it.q)} ${sayBtn(it.q)}</div><div class="u2-qa-a">${esc(it.short)}</div></div>`).join('')}</div>`).join('');
  const reacts = REACTIONS.map(r=>`
    <div class="u2-card"><div class="u2-card-main">${esc(r.say)}</div><div class="u2-card-sub">${esc(r.note)}</div>${sayBtn(r.say)}</div>`).join('');
  const mt = ME_TOO_QUIZ.map((q,i)=>`
    <div class="sit-card"><p class="u2-q">"${esc(q.line)}"</p>${pickRow(q.options,'data-mt',i)}</div>`).join('');
  const pq = PICK_QUESTION.map((q,i)=>`
    <div class="sit-card"><p class="u2-q">${esc(q.goal)}</p>${pickRow(q.options,'data-pq',i)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · See It, Hear It, Say It</div>
  <h2 class="section-title">The Small Talk Pattern</h2>
  <p class="section-sub">Small talk is a short, friendly chat. Use these four steps. Click "Hear it" and say each sentence out loud.</p>
  <div class="panel">
    <h3 class="u2-h3">Ask, Answer, Add, Ask back</h3>
    <div class="u2-steps2">${pattern}</div>
  </div>
  <div class="panel">
    <h3 class="u2-h3">See the pattern in a chat</h3>
    ${chatHtml(MODEL_CHAT, true)}
    <button type="button" class="reveal-btn" id="hearModel" style="margin-top:12px;">Hear the whole chat</button>
  </div>
  <div class="panel">
    <h3 class="u2-h3">Questions you can ask</h3>
    <div class="u2-bank">${bank}</div>
  </div>
  <div class="panel">
    <h3 class="u2-h3">Reactions</h3>
    <div class="u2-cards">${reacts}</div>
    <div class="rule-box" style="margin-top:14px;"><b>Tip</b><p style="margin:8px 0 0;">${esc(ME_TOO_TIP)}</p></div>
    <h3 class="u2-h3" style="margin-top:20px;">Check: Me too or Me neither?</h3>
    ${mt}
  </div>
  <div class="panel">
    <h3 class="u2-h3">Choose the best question</h3>
    ${pq}
  </div>`;
}
function wireS2(){
  wireSay();
  document.getElementById('hearModel').addEventListener('click', ()=> speakChat(MODEL_CHAT));
  const mtDone = new Set(), pqDone = new Set(); let mtScore = 0, pqScore = 0;
  function maybeFinish(){
    if(mtDone.size >= ME_TOO_QUIZ.length && pqDone.size >= PICK_QUESTION.length){
      markActivityComplete('s2', {score:`Me too ${mtScore}/${ME_TOO_QUIZ.length} | Questions ${pqScore}/${PICK_QUESTION.length}`});
    }
  }
  function wireQuiz(attr, list, done, onRight){
    list.forEach((q,i)=>{
      const box = document.querySelector(`[${attr}="${i}"]`);
      box.addEventListener('click', e=>{
        const btn = e.target.closest('.choice-btn'); if(!btn || done.has(i)) return;
        done.add(i);
        const kids = [...box.children];
        if(+btn.dataset.v === q.correct){ btn.classList.add('correct'); onRight(); }
        else { btn.classList.add('wrong'); kids[q.correct].classList.add('correct'); }
        speak(q.options[q.correct]);
        maybeFinish();
      });
    });
  }
  wireQuiz('data-mt', ME_TOO_QUIZ, mtDone, ()=>{ mtScore++; });
  wireQuiz('data-pq', PICK_QUESTION, pqDone, ()=>{ pqScore++; });
}

/* ===== Section 3: Listen to the Chat ===== */
function renderS3(){
  const chats = CHATS.map((c,ci)=>`
    <div class="sit-card u2-chatcard" data-ch="${ci}">
      <p class="u2-q">${esc(c.title)}</p>
      <div class="u2-listen-row">
        <button type="button" class="startbtn u2-play" data-hearchat="${ci}">${icon('play',{size:18})} Hear the chat</button>
        <span class="u2-hint">Listen to each line. Click a number to hear one line.</span>
      </div>
      <div class="u2-lines">${c.lines.map((l,li)=>`<button type="button" class="u2-linebtn" data-hearline="${ci}-${li}" aria-label="Hear line ${li+1}">${li+1}</button>`).join('')}</div>
      ${c.tasks.map((t,ti)=>`
        <div class="u2-task"><p class="u2-q">${esc(t.q)}</p>
          <div class="u2-numrow" data-task="${ci}-${ti}">${c.lines.map((l,li)=>`<button type="button" class="u2-num" data-v="${li}">${li+1}</button>`).join('')}</div></div>`).join('')}
      <div class="feedback u2-msg"></div>
      <div class="u2-transcript" id="tr${ci}" style="display:none;">${chatHtml(c.lines.map((l,i)=>l), false)}</div>
    </div>`).join('');
  const reacts = REACTION_LISTEN.map((r,i)=>`
    <div class="sit-card"><div class="u2-listen-row"><button type="button" class="startbtn u2-play" data-hearreact="${i}">${icon('play',{size:18})} Listen</button><span class="u2-hint">Choose the best reaction.</span></div>
      ${pickRow(r.options,'data-rl',i)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Listening</div>
  <h2 class="section-title">Listen to the Chat</h2>
  <p class="section-sub">Part A: find the lines in the pattern. You cannot see the words, so listen carefully! Part B: choose a good reaction.</p>
  <div class="panel"><h3 class="u2-h3">Part A: Pattern detective</h3>${chats}</div>
  <div class="panel"><h3 class="u2-h3">Part B: Best reaction</h3>${reacts}
    <div class="u2-score" id="lcScore"></div></div>`;
}
function wireS3(){
  let total = 0, answered = 0, correct = 0;
  const needed = CHATS.reduce((n,c)=>n + c.tasks.length, 0) + REACTION_LISTEN.length;
  function bump(isRight){
    answered++; if(isRight) correct++;
    if(answered >= needed){
      document.getElementById('lcScore').textContent = `Your score: ${correct} / ${needed}`;
      markActivityComplete('s3', {score:`${correct}/${needed}`});
    }
  }
  CHATS.forEach((c,ci)=>{
    const card = document.querySelector(`[data-ch="${ci}"]`);
    card.querySelector(`[data-hearchat="${ci}"]`).addEventListener('click', ()=> speakChat(c.lines));
    card.querySelectorAll('[data-hearline]').forEach(b=> b.addEventListener('click', ()=>{
      const li = +b.dataset.hearline.split('-')[1]; const l = c.lines[li]; speak(l.text, VOICE[l.who]);
    }));
    let doneTasks = 0;
    c.tasks.forEach((t,ti)=>{
      const row = card.querySelector(`[data-task="${ci}-${ti}"]`);
      row.addEventListener('click', e=>{
        const btn = e.target.closest('.u2-num'); if(!btn || row.dataset.done) return;
        row.dataset.done = '1';
        const kids = [...row.children]; const right = +btn.dataset.v === t.correct;
        btn.classList.add(right ? 'correct' : 'wrong'); if(!right) kids[t.correct].classList.add('correct');
        doneTasks++; bump(right);
        if(doneTasks >= c.tasks.length){
          document.getElementById('tr'+ci).style.display = '';
          const msg = card.querySelector('.u2-msg'); msg.className = 'feedback show good'; msg.textContent = 'Now read the chat and listen again. Say each line out loud!';
        }
      });
    });
  });
  REACTION_LISTEN.forEach((r,i)=>{
    document.querySelector(`[data-hearreact="${i}"]`).addEventListener('click', ()=> speak(r.say, {pitch:r.pitch}));
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
function myChat(){ return getS('myChat', {topic:'', ans:'Yes, I do.', add:''}); }
function ladderPanel(i){
  const my = myChat();
  if(i === 0){
    return `
      <p class="section-sub" style="margin-top:0;">Listen to each line. Say it out loud. Then say the whole chat.</p>
      ${LADDER_CHAT.map(l=>`<div class="u2-frame"><span class="u2-frame-text">${esc(l)}</span>${sayBtn(l)}</div>`).join('')}
      <button type="button" class="reveal-btn" data-say="${esc(LADDER_CHAT.join(' '))}" style="margin-top:10px;">Hear the whole chat</button>
      <button type="button" class="startbtn u2-did" data-did="L1">I said it out loud →</button>`;
  }
  if(i === 1){
    return `
      <p class="section-sub" style="margin-top:0;">Now use YOUR ideas. Fill the frame. Then click "Hear my chat".</p>
      <div class="u2-form">
        <label>Do you like <input type="text" class="u2-input" data-my="topic" value="${esc(my.topic)}" maxlength="30" placeholder="music" autocomplete="off"> ?</label>
        <label>My answer
          <select class="u2-input" data-my="ans"><option${my.ans==='Yes, I do.'?' selected':''}>Yes, I do.</option><option${my.ans==='No, I don’t.'?' selected':''}>No, I don’t.</option></select></label>
        <label>I add one idea <input type="text" class="u2-input" data-my="add" value="${esc(my.add)}" maxlength="60" placeholder="I listen to music every day." autocomplete="off"></label>
      </div>
      <p class="u2-live" id="myChatText"></p>
      <button type="button" class="reveal-btn" id="hearMine">Hear my chat</button>
      <button type="button" class="startbtn u2-did" data-did="L2">I said it out loud →</button>`;
  }
  if(i === 2){
    return `
      <p class="section-sub" style="margin-top:0;">Look only at the keywords. Say a full chat with a partner.</p>
      <div class="u2-keys"><span>ASK</span><span>ANSWER</span><span>ADD</span><span>ASK BACK</span><span>REACT</span></div>
      <button type="button" class="startbtn u2-did" data-did="L3">I said it from the keywords →</button>`;
  }
  return `
      <p class="section-sub" style="margin-top:0;">No words! Chat with a partner for 1 minute. Look at your partner, not the screen.</p>
      <div class="u2-nopaper" id="noPaper">Words are hidden. Ready?</div>
      <div class="u2-timer-row"><button class="reveal-btn" id="npBtn">Start 1 minute</button><span class="u2-timer" id="npTimer">1:00</span></div>
      <button type="button" class="startbtn u2-did" data-did="L4">I chatted with no paper →</button>`;
}
function renderS4(){
  const link = SOUND_TIPS.linking.map(l=>`<div class="u2-contr"><span>${esc(l.full)}</span><b>→</b><span class="u2-short">${esc(l.fast)}</span>${sayBtn(l.ex)}</div>`).join('');
  const into = SOUND_TIPS.intonation.map(t=>`<div class="u2-into"><span class="u2-into-text">${esc(t.text)}</span><span class="u2-arrow ${t.arrow}">${t.arrow==='up' ? '↗' : '↘'}</span><span class="u2-into-note">${esc(t.note)}</span>${sayBtn(t.text)}</div>`).join('');
  const tabs = LADDER.map((l,i)=>`<button type="button" class="u2-lvl${i===0?' active':''}" data-lvl="${i}"><b>${l.title}</b><span>${l.sub}</span></button>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Say It!</div>
  <h2 class="section-title">Say It!</h2>
  <p class="section-sub">Each level has fewer words. At the end, you chat with no paper.</p>
  <div class="panel">
    <h3 class="u2-h3">Sound tips</h3>
    <div class="u2-tip"><b>1. Words join together</b><p>${esc(SOUND_TIPS.linkingNote)}</p>${link}</div>
    <div class="u2-tip"><b>2. Up or down?</b>${into}</div>
    <div class="u2-tip"><b>3. Important words</b><p>${esc(SOUND_TIPS.stress.note)}</p><div class="u2-stress">${esc(SOUND_TIPS.stress.text)} ${sayBtn(SOUND_TIPS.stress.text)}</div></div>
  </div>
  <div class="panel">
    <h3 class="u2-h3">The speaking ladder</h3>
    <div class="u2-levels" id="lvlTabs">${tabs}</div>
    <div class="u2-level-body" id="lvlBody"></div>
    <div class="u2-progress" id="lvlProgress"></div>
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
    document.querySelectorAll('#lvlTabs .u2-lvl').forEach((t,i)=>{
      t.classList.toggle('active', i === level);
      t.classList.toggle('finished', done.has(LADDER[i].key));
    });
  }
  function show(i){
    level = i; stopTimer(); body.innerHTML = ladderPanel(i);
    wireSay();
    function upd(){
      const el = document.getElementById('myChatText'); if(!el) return;
      const m = myChat();
      el.innerHTML = `Do you like <b>${esc(m.topic || '___')}</b>? <b>${esc(m.ans)}</b> <b>${esc(m.add || '___')}</b> What about you?`;
    }
    body.querySelectorAll('[data-my]').forEach(inp=>{
      const h = ()=>{ const m = myChat(); m[inp.dataset.my] = inp.value; setS('myChat', m); upd(); };
      inp.addEventListener('input', h); inp.addEventListener('change', h);
    });
    upd();
    const hm = document.getElementById('hearMine');
    if(hm) hm.addEventListener('click', ()=>{
      const m = myChat();
      speak(`Do you like ${m.topic || 'music'}? ${m.ans} ${m.add || 'I listen to music every day.'} What about you?`);
    });
    const np = document.getElementById('npBtn');
    if(np) np.addEventListener('click', ()=>{
      np.disabled = true; document.getElementById('noPaper').textContent = 'Chat now!';
      runTimer(document.getElementById('npTimer'), 60, ()=>{ np.disabled = false; document.getElementById('noPaper').textContent = 'Great! Time is up.'; speak('Time is up. Great job!'); });
    });
    body.querySelectorAll('[data-did]').forEach(b=> b.addEventListener('click', ()=>{
      done.add(b.dataset.did); setS('ladder', [...done]); updProg();
      if(done.size >= LADDER.length) markActivityComplete('s4', {completionStatus:'completed'});
      if(level < LADDER.length - 1) show(level + 1);
    }));
    updProg();
  }
  document.querySelectorAll('#lvlTabs .u2-lvl').forEach(t=> t.addEventListener('click', ()=> show(+t.dataset.lvl)));
  show(0);
}

/* ===== Section 5: Games ===== */
function renderS5(){
  const checks = SPIN_CHECKS.map((c,i)=>`
    <div class="checklist-row" data-sc="${i}"><div class="checklist-box">✓</div><div class="checklist-lbl">${esc(c)}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 5 · Games</div>
  <h2 class="section-title">Spin & Talk</h2>
  <p class="section-sub">Three games. First, play Spin & Talk on your phone with a partner.</p>
  <div class="panel">
    <div class="assign-box"><h3>Game 1: Spin & Talk</h3>${stepsList(SPIN_RULES)}</div>
    <div class="u2-spin">
      <button type="button" class="startbtn" id="spinBtn">Spin!</button>
      <div class="u2-spin-card" id="spinCard" aria-live="polite">Press "Spin" for a topic.</div>
    </div>
    <div class="u2-timer-row"><button class="reveal-btn" id="chatTimerBtn" disabled>Start 1 minute</button><span class="u2-timer" id="chatTimer">1:00</span></div>
    <h3 class="u2-h3" style="margin-top:14px;">Check each one when you do it:</h3>
    ${checks}
    <button type="button" class="reveal-btn" id="nextTopic" disabled style="margin-top:10px;">Next topic and switch roles</button>
    <div class="u2-score" id="spinCount"></div>
  </div>
  <div class="panel">
    <div class="assign-box"><h3>${esc(SNAKES.title)}</h3><p style="margin:0 0 8px;">${esc(SNAKES.intro)}</p>${stepsList(SNAKES.steps)}</div>
  </div>
  <div class="panel">
    <div class="assign-box"><h3>${esc(CHAT_CHAIN.title)}</h3>${stepsList(CHAT_CHAIN.steps)}</div>
  </div>`;
}
function wireS5(){
  wireSay();
  let spins = getS('spins', 0), current = null, last = -1;
  const card = document.getElementById('spinCard'), cnt = document.getElementById('spinCount');
  const timerBtn = document.getElementById('chatTimerBtn'), nextBtn = document.getElementById('nextTopic');
  const rows = [...document.querySelectorAll('#app [data-sc]')];
  function showCount(){ cnt.textContent = spins ? `Topics finished: ${spins}` : ''; }
  showCount();
  document.getElementById('spinBtn').addEventListener('click', ()=>{
    let i; do { i = Math.floor(Math.random()*SPIN_TOPICS.length); } while(i === last && SPIN_TOPICS.length > 1);
    last = i; current = SPIN_TOPICS[i];
    card.innerHTML = `<div class="u2-spin-topic">${esc(current.topic)}</div><div class="u2-spin-q">${esc(current.q)} ${sayBtn(current.q)}</div>`;
    wireSay();
    rows.forEach(r=> r.classList.remove('checked'));
    timerBtn.disabled = false; nextBtn.disabled = false;
    speak(current.q);
  });
  timerBtn.addEventListener('click', ()=>{
    timerBtn.disabled = true;
    runTimer(document.getElementById('chatTimer'), 60, ()=>{ timerBtn.disabled = false; speak('Time is up! Switch roles.'); });
  });
  rows.forEach(r=> r.addEventListener('click', ()=> r.classList.toggle('checked')));
  nextBtn.addEventListener('click', ()=>{
    if(!current) return;
    spins++; setS('spins', spins); showCount();
    nextBtn.disabled = true; card.textContent = 'Press "Spin" for a new topic.'; current = null;
    rows.forEach(r=> r.classList.remove('checked'));
    if(spins >= 2) markActivityComplete('s5', {completionStatus:'reached'});
  });
  if(spins >= 2) markActivityComplete('s5', {completionStatus:'reached'});
}

/* ===== Section 6: Speaking Task ===== */
function renderS6(){
  const counters = TRACKER.map((t,i)=>`
    <div class="u2-counter"><span class="u2-counter-lbl">${esc(t)}</span>
      <span class="u2-counter-ctl"><button type="button" class="u2-cbtn" data-cdec="${i}" aria-label="Minus one">−</button><b class="u2-cval" id="cv${i}">0</b><button type="button" class="u2-cbtn" data-cinc="${i}" aria-label="Plus one">+</button></span></div>`).join('');
  const checklist = PEER_CHECKLIST.map((c,i)=>`
    <div class="checklist-row" data-pc="${i}"><div class="checklist-box">✓</div><div class="checklist-lbl">${esc(c)}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 6 · Speaking Task</div>
  <h2 class="section-title">${esc(CHAT_TASK.title)}</h2>
  <p class="section-sub">Chat for 2 minutes with a classmate. No reading from paper!</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(CHAT_TASK.steps)}</div>
    <h3 class="u2-h3">Ideas to start a chat:</h3>
    ${chipRow(CHAT_TASK.starters)}
  </div>
  <div class="panel">
    <h3 class="u2-h3">My chat counter</h3>
    <p class="section-sub" style="margin-top:0;">Tap + each time you do it. Try to get at least 4 questions!</p>
    ${counters}
  </div>
  <div class="panel">
    <h3 class="u2-h3">Partner checklist</h3>
    <p class="section-sub" style="margin-top:0;">Your partner listens. Check what you did.</p>
    ${checklist}
    <div class="u2-score" id="pcScore">0 / ${PEER_CHECKLIST.length}</div>
    <button type="button" class="startbtn" id="s6done" style="margin-top:14px;">We finished the task →</button>
  </div>`;
}
function wireS6(){
  wireSay();
  const counts = getS('counts', [0,0,0,0]);
  function paint(){ counts.forEach((v,i)=>{ const el = document.getElementById('cv'+i); if(el) el.textContent = v; }); }
  paint();
  document.querySelectorAll('#app [data-cinc]').forEach(b=> b.addEventListener('click', ()=>{ counts[+b.dataset.cinc]++; setS('counts', counts); paint(); }));
  document.querySelectorAll('#app [data-cdec]').forEach(b=> b.addEventListener('click', ()=>{ const i = +b.dataset.cdec; counts[i] = Math.max(0, counts[i]-1); setS('counts', counts); paint(); }));
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
    markActivityComplete('s6', {score:`${checked.size}/${PEER_CHECKLIST.length} | questions ${counts[0]}`});
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
    <div class="u2-score" id="canTotal"></div>
    <div class="feedback" id="canMsg"></div>
  </div>
  <div class="panel u2-extra">
    <h3 class="u2-h3">Practice at home</h3>
    <p class="section-sub" style="margin-top:0;">${esc(EXTRA.note)}</p>
    <a class="startbtn u2-extra-link" href="${EXTRA.href}" target="_blank" rel="noopener">${esc(EXTRA.label)} →</a>
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
      msg.textContent = total >= 15 ? 'Great! You are ready for Unit 3.' : 'Good start! Practice the "Not yet" ones with a friend.';
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
    <div class="cover-badge">UNIT 2 COMPLETE</div>
    <div class="u2-wave" aria-hidden="true">🎉</div>
    <h1>You can <span>start a chat and keep it going.</span></h1>
    <p>Next: Unit 3 will be about likes and dislikes. Keep using Ask, Answer, Add, Ask back!</p>
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

const RENDERERS = [
  {r:renderCover, w:null},
  {r:renderS1, w:wireS1},
  {r:renderS2, w:wireS2},
  {r:renderS3, w:wireS3},
  {r:renderS4, w:wireS4},
  {r:renderS5, w:wireS5},
  {r:renderS6, w:wireS6},
  {r:renderS7, w:wireS7},
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
