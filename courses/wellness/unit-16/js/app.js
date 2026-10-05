/* ===================== APP STATE / ROUTER =====================
   Same router/progress/voice/checkin/deep-link architecture as the other units
   (copied, unchanged in shape). Unit 16 plugs into the existing one. */
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8','s9'];

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

/* ===================== RESUME IF THE PAGE RELOADS OR CLOSES ===================== */
const CHECKIN_STORAGE_KEY = 'wellness_u16_checkin';
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
  clearSharedIdentity();
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
}

/* ===================== STUDENT CHECK-IN ===================== */
/* ===================== REMEMBER ME (cross-unit) ===================== */
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
  if('speechSynthesis' in window){ window.speechSynthesis.onvoiceschanged = refresh; refresh(); }
  function splitSentences(text){ return text.replace(/([.!?])\s+/g,'$1|').split('|').map(s=>s.trim()).filter(Boolean); }
  function makeUtterance(text){
    const u = new SpeechSynthesisUtterance(text);
    if(voiceA) u.voice = voiceA;
    u.lang = 'en-US'; u.rate = 1.0; u.pitch = 0.98;
    return u;
  }
  function playNext(){
    if(queueIndex >= queue.length){ playing=false; paused=false; onStateChange(); return; }
    const item = queue[queueIndex];
    const sentences = splitSentences(item.text);
    let sIdx = 0;
    function playSentence(){
      if(sIdx >= sentences.length){ queueIndex++; setTimeout(playNext, 420); return; }
      const u = makeUtterance(sentences[sIdx]);
      u.onend = ()=>{ sIdx++; setTimeout(playSentence, 160); };
      window.speechSynthesis.speak(u);
    }
    playSentence();
  }
  return {
    isPlaying(){ return playing; },
    onChange(fn){ onStateChange = fn; },
    speakLine(text){ this.stop(); queue=[{text}]; queueIndex=0; playing=true; paused=false; onStateChange(); playNext(); },
    stop(){ window.speechSynthesis.cancel(); playing=false; paused=false; queue=[]; queueIndex=0; onStateChange(); }
  };
})();
function speak(text){
  if(!('speechSynthesis' in window)) { alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakLine(text);
}


/* ===================== SMALL SHARED HELPERS ===================== */
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }
  return a;
}
function escAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function listenBtn(text, label){
  return `<button type="button" class="audio-mini" data-say="${escAttr(text)}" aria-label="Listen: ${escAttr(text)}"><span class="icon-inline">${icon('headphones',{size:14})}</span> ${label || 'Listen'}</button>`;
}
function bindSay(root){
  (root || document).querySelectorAll('[data-say]').forEach(b=>{
    if(b.dataset.bound) return;
    b.dataset.bound = '1';
    b.addEventListener('click', e=>{ e.stopPropagation(); speak(b.dataset.say); });
  });
}
function sayIt(text){
  return `<p class="section-sub" style="margin-top:10px;"><b style="color:var(--navy);font-style:normal;">Say it:</b> ${text}</p>`;
}

/* ===== One round at a time: look, choose, instant feedback ===== */
function runQuiz(cfg){
  const el = cfg.el;
  let i = 0, firstTry = 0, missed = false;
  function show(){
    const r = cfg.rounds[i];
    el.innerHTML = `<div class="quiz-bar"><span>${i+1} / ${cfg.rounds.length}</span><div class="quiz-track"><div style="width:${Math.round(i / cfg.rounds.length * 100)}%"></div></div></div>
      ${cfg.render(r)}
      <div class="feedback" data-qfb></div>
      <div data-qextra></div>`;
    missed = false;
    bindSay(el);
    el.querySelectorAll('[data-ans]').forEach(b=>{
      b.addEventListener('click', ()=>{
        if(b.classList.contains('correct')) return;
        const fb = el.querySelector('[data-qfb]');
        if(cfg.isCorrect(r, b.dataset.ans)){
          b.classList.add('correct');
          el.querySelectorAll('[data-ans]').forEach(x=>{ x.style.pointerEvents = 'none'; });
          if(!missed) firstTry++;
          fb.className = 'feedback show good';
          fb.textContent = 'Yes!';
          if(cfg.extra){
            const ex = el.querySelector('[data-qextra]');
            ex.innerHTML = cfg.extra(r) + `<button type="button" class="reveal-btn" data-qnext>${i + 1 < cfg.rounds.length ? 'Next' : 'Finish'}</button>`;
            bindSay(ex);
            ex.querySelector('[data-qnext]').addEventListener('click', next);
          }else{
            setTimeout(next, 800);
          }
        }else{
          missed = true;
          b.classList.add('wrong');
          fb.className = 'feedback show meh';
          fb.textContent = 'Try again.';
        }
      });
    });
  }
  function next(){
    i++;
    if(i < cfg.rounds.length) show();
    else{
      el.innerHTML = `<div class="feedback show good">Great! ${firstTry} / ${cfg.rounds.length}</div>`;
      cfg.onDone(firstTry);
    }
  }
  show();
}


/* ===== small helpers for this unit ===== */
function capFirst(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function toggleList(rootSel, attr, onChange){
  const set = new Set();
  document.querySelectorAll(rootSel).forEach(c=>{
    const flip = ()=>{
      const k = c.dataset[attr];
      if(set.has(k)){ set.delete(k); c.classList.remove('done'); } else { set.add(k); c.classList.add('done'); }
      c.setAttribute('aria-pressed', set.has(k) ? 'true' : 'false');
      onChange(set);
    };
    c.addEventListener('click', flip);
    c.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); } });
  });
  return set;
}
function doneBanner(id, text){
  const el = document.getElementById(id);
  if(!el) return;
  el.className = 'feedback show good';
  el.textContent = text;
}

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR WELLNESS TOURISM · INTEGRATED UNIT</div>
    <h1>The Wellness <span>Feature</span></h1>
    <p>Unit 16. Bring everything together. Show a real wellness experience in Phuket like a professional.</p>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Your mission</div>
      <div class="signchip"><span class="arrow">→</span> Wild ideas</div>
      <div class="signchip"><span class="arrow">→</span> Guest language</div>
      <div class="signchip"><span class="arrow">→</span> Ready to present</div>
    </div>
    <button class="startbtn" onclick="goNext()">Start the mission →</button>
  </div>`;
}

/* ===== Section 1: Your Mission ===== */
function renderS1(){
  const outs = OUTPUTS.map(o=>`<div class="output-card"><div class="output-ic">${o.ic}</div><b>${o.title}</b><span>${o.text}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 1 · Mission</div>
  <h2 class="section-title">Your Mission</h2>
  <p class="section-sub">A new brief just arrived. Read it with your group.</p>
  <div class="scenario-message">
    <div class="sm-head"><b>From:</b> ${BRIEF.from}<br><b>Subject:</b> ${BRIEF.subject}</div>
    <p>${BRIEF.body}</p>
  </div>
  <div class="panel">
    <h3 class="step-title">Three outputs</h3>
    <div class="output-grid">${outs}</div>
    <p class="section-sub" style="margin-top:12px;">This final project is worth <b>10%</b> of your course grade. One simple rubric covers everything (see Section 9). The final presentation is on <b>${FINAL_DATE}</b>.</p>
  </div>
  <div class="panel">
    <h3 class="step-title">An integrated unit</h3>
    <p class="section-sub" style="margin:4px 0 10px;">Nothing here is brand new. Your feature brings together what you already practiced in earlier units.</p>
    <div class="scroll"><table class="rubric-table integ-table"><thead><tr><th>Earlier units</th><th>What you practiced</th><th>You use it for</th></tr></thead><tbody>${INTEGRATION.map(r=>`<tr><td><b>${r.from}</b></td><td>${r.skill}</td><td>${r.use}</td></tr>`).join('')}</tbody></table></div>
  </div>
  <div class="panel" id="s1quiz"></div>`;
}
function wireS1(){
  const rounds = shuffle(MISSION_RULES);
  runQuiz({
    el: document.getElementById('s1quiz'),
    rounds,
    render: r=>`<h3 class="quiz-q">True or false?</h3>
      <p class="quiz-stmt">${r.stmt}</p>
      <div class="choices wrap"><button type="button" class="choice-btn" data-ans="T">True</button><button type="button" class="choice-btn" data-ans="F">False</button></div>`,
    isCorrect: (r,v)=> v === r.answer,
    extra: r=>`<div class="rule-box" style="margin-top:12px;"><b>${r.answer === 'T' ? 'True.' : 'False.'}</b> ${r.note}</div>`,
    onDone: s=> markActivityComplete('s1', {completionStatus:'completed', score:`${s}/${rounds.length}`})
  });
}


/* ===== Section 2: Idea Lab ===== */
function renderS2Lab(){
  const acts = LAB_ACTIVITIES.map(a=>`<button type="button" class="lab-chip" data-lab="act" data-id="${a.id}"><span class="lab-ic">${a.ic}</span><b>${a.label}</b></button>`).join('');
  const styles = LAB_STYLES.map(s=>`<button type="button" class="lab-chip small" data-lab="style" data-id="${s.id}"><b>${s.label}</b><span>${s.text}</span></button>`).join('');
  const angles = LAB_ANGLES.map(s=>`<button type="button" class="lab-chip small" data-lab="angle" data-id="${s.id}"><b>${s.label}</b><span>${s.text}</span></button>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · Brainstorm</div>
  <h2 class="section-title">Idea Lab</h2>
  <p class="section-sub">Think big. Think different. Work with your group.</p>
  <div class="panel lab-rules"><ul>${LAB_RULES.map(r=>`<li>${r}</li>`).join('')}</ul></div>
  <div class="panel lab-board" id="labBoard" aria-live="polite"></div>
  <div class="panel"><h3 class="step-title">1. Pick a wellness world</h3><div class="lab-grid">${acts}</div></div>
  <div class="panel"><h3 class="step-title">2. Pick a style for your video</h3><div class="lab-grid wide">${styles}</div></div>
  <div class="panel"><h3 class="step-title">3. Pick an angle</h3><div class="lab-grid wide">${angles}</div></div>
  <div class="panel lab-spark"><h3 class="step-title">Spark a question</h3><p class="spark-q" id="sparkQ">Click the button. Discuss the question for one minute.</p><button type="button" class="reveal-btn" id="sparkBtn">Give me a question</button></div>`;
}
function wireS2Lab(){
  const sel = {act:null, style:null, angle:null};
  const board = document.getElementById('labBoard');
  const find = (list, id)=> list.find(x=> x.id === id);
  function draw(){
    document.querySelectorAll('#app [data-lab]').forEach(c=> c.classList.toggle('sel', sel[c.dataset.lab] === c.dataset.id));
    const a = find(LAB_ACTIVITIES, sel.act), s = find(LAB_STYLES, sel.style), g = find(LAB_ANGLES, sel.angle);
    const part = (lbl, v)=> `<div class="board-part${v ? ' set' : ''}"><span>${lbl}</span><b>${v || '?'}</b></div>`;
    board.innerHTML = `<h3 class="step-title">Our feature idea</h3>
      <div class="board-row">${part('Wellness world', a && a.label)}${part('Video style', s && s.label)}${part('Angle', g && g.label)}</div>
      ${a ? `<p class="board-spark">${a.ic} ${a.spark}</p>` : '<p class="sentence-hint">Choose below, or let the lab surprise you.</p>'}
      <div class="board-actions"><button type="button" class="startbtn" id="labSpin">🎲 Surprise us</button></div>
      ${a && s && g ? '<div class="feedback show good" style="margin-top:12px;">A real idea! Write your best ideas on the Group Sheet. Keep thinking.</div>' : ''}`;
    document.getElementById('labSpin').addEventListener('click', spin);
    if(a && s && g) markActivityComplete('s2', {completionStatus:'completed', answers:`${a.label} | ${s.label} | ${g.label}`});
  }
  const pick = arr => arr[Math.floor(Math.random() * arr.length)].id;
  function spin(){ sel.act = pick(LAB_ACTIVITIES); sel.style = pick(LAB_STYLES); sel.angle = pick(LAB_ANGLES); draw(); }
  document.querySelectorAll('#app [data-lab]').forEach(c=> c.addEventListener('click', ()=>{
    const k = c.dataset.lab;
    sel[k] = sel[k] === c.dataset.id ? null : c.dataset.id;
    draw();
  }));
  let last = -1;
  document.getElementById('sparkBtn').addEventListener('click', ()=>{
    let i; do{ i = Math.floor(Math.random() * LAB_SPARKS.length); }while(i === last && LAB_SPARKS.length > 1);
    last = i;
    document.getElementById('sparkQ').textContent = LAB_SPARKS[i];
  });
  draw();
}

/* ===== Section 3: Anatomy of a Feature ===== */
function renderS2(){
  const parts = FEATURE_PARTS.map(p=>`<div class="part-card part-${p.id}"><h4>${p.label}</h4><p>${p.job}</p></div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Learn</div>
  <h2 class="section-title">Anatomy of a Feature</h2>
  <p class="section-sub">A good feature has three parts. Learn them, then find where each line belongs.</p>
  <div class="panel"><div class="part-grid">${parts}</div></div>
  <div class="panel" id="s2quiz"></div>
  <div class="panel" id="s2after" style="display:none;"></div>`;
}
function wireS2(){
  const rounds = shuffle(MODEL_LINES);
  runQuiz({
    el: document.getElementById('s2quiz'),
    rounds,
    render: r=>`<h3 class="quiz-q">Which part is this line from?</h3>
      <p class="quiz-stmt">"${r.text}"</p>
      <p class="section-sub" style="margin:0 0 10px;">Model feature: Thai herbal compress massage. This is an example only.</p>
      <div class="choices wrap">${FEATURE_PARTS.map(p=>`<button type="button" class="choice-btn" data-ans="${p.id}">${p.label}</button>`).join('')}</div>`,
    isCorrect: (r,v)=> v === r.part,
    onDone: s=>{
      const box = document.getElementById('s2after');
      box.style.display = '';
      box.innerHTML = `<h3 class="step-title">What makes it sound natural</h3>
        <ul class="say-list">${FEATURE_TIPS.map(t=>`<li>${t}</li>`).join('')}</ul>
        <div class="rule-box" style="margin-top:12px;"><b>Remember</b><p style="margin-top:6px;">The lines above are a model. Your group researches and writes your own real information.</p></div>`;
      markActivityComplete('s3', {completionStatus:'completed', score:`${s}/${rounds.length}`});
    }
  });
}

/* ===== Section 4: Strong Information ===== */
function renderS3(){
  return `
  <div class="section-eyebrow">Section 4 · Information targets</div>
  <h2 class="section-title">Strong Information</h2>
  <p class="section-sub">Each target needs real, specific information. For each one, choose the stronger line.</p>
  <div class="panel" id="s3quiz"></div>
  <div class="panel" id="s3after" style="display:none;"></div>`;
}
function wireS3(){
  runQuiz({
    el: document.getElementById('s3quiz'),
    rounds: TARGET_ROUNDS,
    render: r=>{
      const opts = shuffle([{t:r.strong, k:'strong'}, {t:r.weak, k:'weak'}]);
      return `<div class="target-tag"><span>${r.no}</span> ${r.target}</div>
        <h3 class="quiz-q">Which line is stronger?</h3>
        <div class="choices">${opts.map(o=>`<button type="button" class="choice-btn" data-ans="${o.k}">${o.t}</button>`).join('')}</div>`;
    },
    isCorrect: (r,v)=> v === 'strong',
    onDone: s=>{
      const box = document.getElementById('s3after');
      box.style.display = '';
      box.innerHTML = `<div class="rule-box"><b>Rule</b><p style="margin-top:6px;">${STRONG_RULE}</p></div>
        <p class="section-sub" style="margin-top:12px;">Take this rule to your Group Sheet. Check every target against it.</p>`;
      markActivityComplete('s4', {completionStatus:'completed', score:`${s}/${TARGET_ROUNDS.length}`});
    }
  });
}

/* ===== Section 5: Guest Language ===== */
function renderS4(){
  const steps = CONSULT_STEPS.map(s=>`<div class="consult-col">
      <div class="consult-head"><span>${s.ic}</span> ${s.label}</div>
      <ul class="say-list plain">${s.phrases.map(p=>`<li><span>${p}</span> ${listenBtn(p)}</li>`).join('')}</ul>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 5 · Language</div>
  <h2 class="section-title">Guest Language</h2>
  <p class="section-sub">${CONSULT_NOTE}</p>
  <div class="panel"><div class="consult-grid">${steps}</div></div>
  <div class="panel" id="s4quiz"></div>`;
}
function wireS4(){
  bindSay(document.getElementById('app'));
  const pool = [];
  CONSULT_STEPS.forEach(s=> shuffle(s.phrases).slice(0, 2).forEach(p=> pool.push({text:p, step:s.id})));
  const rounds = shuffle(pool);
  runQuiz({
    el: document.getElementById('s4quiz'),
    rounds,
    render: r=>`<h3 class="quiz-q">Which step is this?</h3>
      <p class="quiz-stmt">"${r.text}"</p>
      <div class="choices wrap">${CONSULT_STEPS.map(s=>`<button type="button" class="choice-btn" data-ans="${s.id}">${s.ic} ${s.label}</button>`).join('')}</div>`,
    isCorrect: (r,v)=> v === r.step,
    onDone: s=> markActivityComplete('s5', {completionStatus:'completed', score:`${s}/${rounds.length}`})
  });
}

/* ===== Section 6: A Real Consideration ===== */
function renderS5(){
  const steps = FOUR_STEPS.map(s=>`<li><b>${s.n}. ${s.label}</b><span>"${s.say}"</span> ${listenBtn(s.say)}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 6 · Target 8</div>
  <h2 class="section-title">A Real Consideration</h2>
  <p class="section-sub">Guests have worries: allergies, pregnancy, pressure, fitness, price, time. A good consultant answers calmly in four steps.</p>
  <div class="panel"><ol class="step-list">${steps}</ol></div>
  <div class="panel" id="s5quiz"></div>
  <div class="panel" id="s5after" style="display:none;"></div>`;
}
function wireS5(){
  bindSay(document.getElementById('app'));
  const rounds = shuffle(WORRIES);
  runQuiz({
    el: document.getElementById('s5quiz'),
    rounds,
    render: r=>`<h3 class="quiz-q">The guest says:</h3>
      <div class="say-bubble"><span class="bubble-text">"${r.guest}"</span></div>
      <p class="section-sub" style="margin:10px 0 12px;">Choose the best staff response.</p>
      <div class="choices">${shuffle([r.answer].concat(r.wrong)).map(o=>`<button type="button" class="choice-btn" data-ans="${escAttr(o)}">${o}</button>`).join('')}</div>`,
    isCorrect: (r,v)=> v === r.answer,
    extra: r=>`<div class="rule-box" style="margin-top:12px;"><b>${r.answer}</b><p style="margin-top:8px;">${listenBtn(r.answer, 'Listen and say it')}</p></div>`,
    onDone: s=>{
      const box = document.getElementById('s5after');
      box.style.display = '';
      box.innerHTML = `<h3 class="step-title">Now do it for your own activity</h3>
        <p class="section-sub" style="margin:4px 0 0;">On your Group Sheet, write one real worry a guest might have about <b>your</b> activity. Then write the staff response in four steps. This is information target 8.</p>`;
      markActivityComplete('s6', {completionStatus:'completed', score:`${s}/${rounds.length}`});
    }
  });
}

/* ===== Section 7: Plan, Film, Present ===== */
function renderS6(){
  const miles = MILESTONES.map((m,i)=>`<div class="present-step" data-mile="${m.id}" role="button" tabindex="0" aria-pressed="false">
      <div class="present-num">${i + 1}</div>
      <div class="present-text"><b>${m.title}</b><span>${m.text}</span></div>
      <div class="present-check" aria-hidden="true">✓</div>
    </div>`).join('');
  const roles = ROLE_IDEAS.map(r=>`<li><b>${r.role}</b><span>${r.text}</span></li>`).join('');
  return `
  <div class="section-eyebrow">Section 7 · Plan</div>
  <h2 class="section-title">Plan, Film, Present</h2>
  <p class="section-sub">Plan your work. Click each step when your group finishes it.</p>
  <div class="panel">${miles}</div>
  <div class="panel">
    <h3 class="step-title">Who does what</h3>
    <ul class="role-list">${roles}</ul>
    <div class="rule-box" style="margin-top:12px;"><b>Take note</b><p style="margin-top:6px;">"Written by" is not "who presents it". Everyone researches and writes. The person who says a target on camera can be someone else.</p><p style="margin-top:6px;">Not everyone needs a speaking role in the video. But <b>every student speaks in the final group presentation</b>.</p></div>
  </div>
  <div class="panel" id="s6quiz"></div>`;
}
function wireS6(){
  toggleList('#app [data-mile]', 'mile', set=>{ });
  const rounds = shuffle(FILM_RULES);
  runQuiz({
    el: document.getElementById('s6quiz'),
    rounds,
    render: r=>`<h3 class="quiz-q">Filming rules: OK or not OK?</h3>
      <p class="quiz-stmt">${r.stmt}</p>
      <div class="choices wrap"><button type="button" class="choice-btn" data-ans="ok">OK</button><button type="button" class="choice-btn" data-ans="no">Not OK</button></div>`,
    isCorrect: (r,v)=> v === (r.ok ? 'ok' : 'no'),
    onDone: s=> markActivityComplete('s7', {completionStatus:'completed', score:`${s}/${rounds.length}`})
  });
}

/* ===== Section 8: Questions and Rehearsal ===== */
function renderS7(){
  const dk = DONT_KNOW.map(p=>`<li><span>${p}</span> ${listenBtn(p)}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 8 · Present</div>
  <h2 class="section-title">Questions and Rehearsal</h2>
  <p class="section-sub">Your group presentation has a clear job. Then classmates may ask questions. Be ready for both.</p>
  <div class="panel">
    <h3 class="step-title">Your group presentation includes</h3>
    <ol class="say-list">${PRESENTATION_CONTENT.map(p=>`<li>${p}</li>`).join('')}</ol>
    <div class="rule-box" style="margin-top:12px;"><ul class="say-list" style="margin-top:0;">${PRESENTATION_RULES.map(r=>`<li>${r}</li>`).join('')}</ul></div>
  </div>
  <div class="panel" id="s7quiz"></div>
  <div class="panel">
    <h3 class="step-title">If you do not know the answer</h3>
    <ul class="say-list plain">${dk}</ul>
  </div>
  <div class="panel" id="s7rehearse" style="display:none;"></div>`;
}
function wireS7(){
  bindSay(document.getElementById('app'));
  const rounds = shuffle(QA_ROUNDS);
  runQuiz({
    el: document.getElementById('s7quiz'),
    rounds,
    render: r=>`<h3 class="quiz-q">A classmate asks:</h3>
      <div class="say-bubble"><span class="bubble-text">"${r.q}"</span></div>
      <p class="section-sub" style="margin:10px 0 12px;">Choose the best answer.</p>
      <div class="choices">${shuffle([r.answer].concat(r.wrong)).map(o=>`<button type="button" class="choice-btn" data-ans="${escAttr(o)}">${o}</button>`).join('')}</div>`,
    isCorrect: (r,v)=> v === r.answer,
    extra: r=>`<div class="rule-box" style="margin-top:12px;"><b>${r.answer}</b><p style="margin-top:8px;">${listenBtn(r.answer, 'Listen and say it')}</p></div>`,
    onDone: s=>{
      const box = document.getElementById('s7rehearse');
      box.style.display = '';
      box.innerHTML = `<h3 class="step-title">Peer rehearsal checklist</h3>
        <p class="section-sub" style="margin:4px 0 12px;">Present to another group. They tick each item they see and hear.</p>
        ${REHEARSAL_CHECKS.map((c,i)=>`<div class="present-step" data-reh="${i}" role="button" tabindex="0" aria-pressed="false"><div class="present-num">${i + 1}</div><div class="present-text"><b>${c}</b></div><div class="present-check" aria-hidden="true">✓</div></div>`).join('')}`;
      toggleList('#s7rehearse [data-reh]', 'reh', ()=>{});
      markActivityComplete('s8', {completionStatus:'completed', score:`${s}/${rounds.length}`});
    }
  });
}

/* ===== Section 9: Self-Check ===== */
function renderS8(){
  const checks = READY_CHECKS.map((c,i)=>`<div class="present-step" data-ready="${i}" role="button" tabindex="0" aria-pressed="false"><div class="present-num">${i + 1}</div><div class="present-text"><b>${c}</b></div><div class="present-check" aria-hidden="true">✓</div></div>`).join('');
  const prompts = REFLECTION_PROMPTS.map(p=>`<li>${p}</li>`).join('');
  const rows = RUBRIC.map(r=>`<tr><td class="rb-c"><b>${r.c}</b><div class="rubric-sub">${r.d}</div></td><td>${r.l4}</td><td>${r.l3}</td><td>${r.l2}</td><td>${r.l1}</td></tr>`).join('');
  return `
  <div class="section-eyebrow">Section 9 · Check</div>
  <h2 class="section-title">Self-Check</h2>
  <p class="section-sub">Is your group ready? The first seven items are the same as the Project Checklist on your Group Sheet.</p>
  <div class="panel">${checks}<div class="feedback" id="s8fb"></div></div>
  <div class="panel">
    <h3 class="step-title">Your individual reflection</h3>
    <p class="section-sub" style="margin:4px 0 10px;">Write on your own Individual Reflection sheet, in your own simple English. You do not need difficult English. Five prompts, then a short takeaway:</p>
    <ol class="say-list">${prompts}</ol>
  </div>
  <div class="panel">
    <h3 class="step-title">How you are scored</h3>
    <p class="section-sub" style="margin:4px 0 10px;">One rubric covers the video, the presentation, teamwork, and the reflection. Each line is scored 4, 3, 2, or 1. Total 24 points. It counts for 10% of your grade.</p>
    <div class="scroll"><table class="rubric-table"><thead><tr><th>Criterion</th><th>4 Excellent</th><th>3 Good</th><th>2 Developing</th><th>1 Needs improvement</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}
function wireS8(){
  toggleList('#app [data-ready]', 'ready', set=>{
    const fb = document.getElementById('s8fb');
    if(set.size === READY_CHECKS.length){
      doneBanner('s8fb', 'Your group is ready. Good luck on ' + FINAL_DATE + '!');
      markActivityComplete('s9', {completionStatus:'completed', score:`${set.size}/${READY_CHECKS.length} checks`});
    }else{ fb.className = 'feedback'; fb.textContent = ''; }
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 16 COMPLETE</div>
    <h1>You are ready to <span>make your feature.</span></h1>
    <p>Use the Group Sheet, your research, and this toolkit. You can come back to any section.</p>
    <div class="complete-actions">
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
  {r:renderS2Lab, w:wireS2Lab},
  {r:renderS2, w:wireS2},
  {r:renderS3, w:wireS3},
  {r:renderS4, w:wireS4},
  {r:renderS5, w:wireS5},
  {r:renderS6, w:wireS6},
  {r:renderS7, w:wireS7},
  {r:renderS8, w:wireS8},
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
  buildProgress();
  VoiceEngine.stop();
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
function goToKey(key){ const i = SECTION_META.findIndex(m=> m.key === key); if(i >= 0) goTo(i); }
function goTo(i){ current = Math.max(0, Math.min(RENDERERS.length-1, i)); renderAll(); }

document.getElementById('btnNext').addEventListener('click', goNext);
document.getElementById('btnPrev').addEventListener('click', goPrev);
document.getElementById('btnHome').addEventListener('click', ()=>{ current=0; renderAll(); });
document.getElementById('btnReset').addEventListener('click', ()=> renderAll());

wireCheckin();
if(restoreCheckinState()){
  document.getElementById('checkinGate').style.display='none';
}
renderAll();
