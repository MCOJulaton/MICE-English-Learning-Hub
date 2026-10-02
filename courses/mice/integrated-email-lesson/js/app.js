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
    d.className = 'dot' + (i===current?' active':'') + (Progress.activities[s.key]?' done':'');
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
    activity,
    score,
    completionStatus,
    answers
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
  const answers = opts.answers || '';
  if(prev && prev.completionStatus===completionStatus && prev.score===score) return;
  Progress.activities[key] = { status:completionStatus, score, completionStatus };
  sendProgressRecord(buildRecord(key, {score, completionStatus, answers}));
  updateTopbarBadge();
  saveCheckinState();
}
function completedCount(){
  return TRACKED_ACTIVITIES.filter(k => Progress.activities[k]).length;
}
function updateTopbarBadge(){
  const el = document.getElementById('studentBadge');
  if(!el) return;
  if(!Progress.studentName){ el.style.display='none'; return; }
  el.style.display='';
  el.innerHTML = `<b>${Progress.studentName}</b> · ${completedCount()}/${TRACKED_ACTIVITIES.length} done <button type="button" id="studentSwitchBtn" class="student-switch-btn" title="Not you? Check in again">Switch</button>`;
  const switchBtn = document.getElementById('studentSwitchBtn');
  if(switchBtn) switchBtn.addEventListener('click', resetCheckin);
}

/* ===================== RESUME IF THE PAGE RELOADS OR CLOSES ===================== */
const CHECKIN_STORAGE_KEY = 'mice_emaillesson_checkin';
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

/* ===================== STUDENT CHECK-IN / REMEMBER ME ===================== */
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

/* ===================== HELPERS ===================== */
function emailCard(item){
  const lines = item.lines.map(l=>`<p style="margin:0 0 6px;">${l}</p>`).join('');
  const signoff = item.signoff.map(l=>`<p style="margin:0;">${l}</p>`).join('');
  return `
  <div class="panel" style="background:var(--panel-soft,#f6f7f9);">
    <p style="margin:0 0 8px;"><b>Subject:</b> ${item.subject}</p>
    ${lines}
    ${signoff}
  </div>`;
}

/* ===================== COVER ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">INTEGRATED MICE COMMUNICATION LESSON</div>
    <h1>Professional MICE Emails: <span>Responding to a Problem</span></h1>
    <p>A client tells you about a real MICE problem. In this lesson you will see different types of professional emails, learn one simple structure, and write your own professional email responding to a realistic workplace problem.</p>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> 4 Email Types</div>
      <div class="signchip"><span class="arrow">→</span> 1 Simple Structure</div>
      <div class="signchip"><span class="arrow">→</span> Language You Already Know</div>
      <div class="signchip"><span class="arrow">→</span> 1 Final Email</div>
    </div>
    <button class="startbtn" onclick="goNext()">Start the lesson →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up ===== */
function renderS1(){
  const qs = WARMUP_QUESTIONS.map(q=>`<li>${q}</li>`).join('');
  return `
  <div class="section-eyebrow">Part 1</div>
  <h2 class="section-title">Warm-Up: A MICE Situation</h2>
  <p class="section-sub">Listen to your teacher. Think about this situation.</p>
  <div class="panel">
    <div class="scenario-message">${WARMUP_SITUATION}</div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:16px;">Think about:</h3>
    <ul style="margin:10px 0 0 18px;padding:0;line-height:1.9;font-size:14.5px;color:var(--ink);">${qs}</ul>
    <button class="startbtn" id="s1done" style="margin-top:20px;">I'm ready →</button>
  </div>`;
}
function wireS1(){
  document.getElementById('s1done').addEventListener('click', ()=>{
    markActivityComplete('s1', {completionStatus:'reached'});
    goNext();
  });
}

/* ===== Section 2: Types of Professional MICE Emails ===== */
function renderS2(){
  const cards = EMAIL_TYPES.map((item, i) => `
    <div class="panel" data-email="${i}">
      <h3 style="font-size:15px;color:var(--orange-deep);">Example ${String.fromCharCode(65+i)}</h3>
      ${emailCard(item)}
      <p style="font-weight:700;color:var(--navy);margin-top:12px;">What is the purpose of this email?</p>
      <div class="choices" data-choices="${i}" style="margin-top:8px;">
        ${EMAIL_PURPOSE_OPTIONS.map(opt=>`<button class="choice-btn" data-opt="${opt}">${opt}</button>`).join('')}
      </div>
      <div class="feedback" id="emailFeedback${i}" style="display:block;"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Part 2</div>
  <h2 class="section-title">Types of Professional MICE Emails</h2>
  <p class="section-sub">Read each email. Choose its purpose. Professional email writing is broader than just complaint emails.</p>
  ${cards}`;
}
function wireS2(){
  const answered = new Set();
  EMAIL_TYPES.forEach((item, i) => {
    const group = document.querySelector(`[data-choices="${i}"]`);
    const feedback = document.getElementById(`emailFeedback${i}`);
    group.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      const chosen = btn.dataset.opt;
      [...group.children].forEach(b=>b.classList.remove('sel','correct','wrong'));
      const correct = chosen === item.purpose;
      btn.classList.add('sel', correct ? 'correct' : 'wrong');
      feedback.className = 'feedback show ' + (correct ? 'good' : 'meh');
      feedback.textContent = correct ? `Correct! This is a ${item.purpose} email.` : `Not quite. Look again — this is a ${item.purpose} email.`;
      answered.add(i);
      if(answered.size >= EMAIL_TYPES.length) markActivityComplete('s2', {score:`${answered.size}/${EMAIL_TYPES.length}`});
    });
  });
}

/* ===== Section 3: Email Structure ===== */
function renderS3(){
  const rows = STRUCTURE_PARTS.map(p => `<tr><td style="padding:8px;font-weight:700;color:var(--navy);white-space:nowrap;">${p.part}</td><td style="padding:8px;">${p.does}</td></tr>`).join('');
  const example = EMAIL_TYPES[3];
  return `
  <div class="section-eyebrow">Part 3</div>
  <h2 class="section-title">Email Structure</h2>
  <p class="section-sub">Every professional email can use the same 8-part structure.</p>
  <div class="panel" style="text-align:center;">
    <p style="font-weight:700;color:var(--navy);font-family:'Oswald';letter-spacing:.02em;">Subject → Greeting → Purpose → Problem or Details → Solution or Action → Next Step → Closing → Sign-off</p>
  </div>
  <div class="panel">
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--orange-deep);">This same structure is already in Example D</h3>
    ${emailCard(example)}
    <button class="startbtn" id="s3done" style="margin-top:20px;">Got it →</button>
  </div>`;
}
function wireS3(){
  document.getElementById('s3done').addEventListener('click', ()=>{
    markActivityComplete('s3', {completionStatus:'reached'});
    goNext();
  });
}

/* ===== Section 4: Language Bank ===== */
function renderS4(){
  const rows = LANGUAGE_BANK.map(b => `<tr><td style="padding:8px;font-weight:700;color:var(--navy);vertical-align:top;white-space:nowrap;">${b.cat}</td><td style="padding:8px;">${b.phrases.join(' &nbsp;•&nbsp; ')}</td></tr>`).join('');
  return `
  <div class="section-eyebrow">Part 4</div>
  <h2 class="section-title">Language Bank</h2>
  <p class="section-sub">You already used some of this language out loud in earlier lessons. Now you will use it in writing.</p>
  <div class="panel">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
    <button class="startbtn" id="s4done" style="margin-top:20px;">Next →</button>
  </div>`;
}
function wireS4(){
  document.getElementById('s4done').addEventListener('click', ()=>{
    markActivityComplete('s4', {completionStatus:'reached'});
    goNext();
  });
}

/* ===== Section 5: Guided Practice ===== */
function renderS5(){
  const qs = PLANNING_QUESTIONS.map(q=>`<li>${q}</li>`).join('');
  return `
  <div class="section-eyebrow">Part 5</div>
  <h2 class="section-title">Guided Practice</h2>
  <p class="section-sub">Scenario: <i>${GUIDED_SCENARIO}</i></p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">With your class, plan the email together</h3>
    <ul style="margin:10px 0 0 18px;padding:0;line-height:1.9;font-size:14.5px;color:var(--ink);">${qs}</ul>
    <p class="section-sub" style="margin-top:10px;">Your teacher will build the email with the class, one part at a time, using the Structure and Language Bank.</p>
    <button class="startbtn" id="s5done" style="margin-top:20px;">Next →</button>
  </div>`;
}
function wireS5(){
  document.getElementById('s5done').addEventListener('click', ()=>{
    markActivityComplete('s5', {completionStatus:'reached'});
    goNext();
  });
}

/* ===== Section 6: Final Writing Task (preview only) ===== */
function renderS6(){
  const cards = FINAL_SCENARIOS.map(s => `
    <tr>
      <td style="padding:10px;font-weight:700;color:var(--navy);white-space:nowrap;vertical-align:top;">${s.n}. ${s.title}</td>
      <td style="padding:10px;">${s.situation}</td>
    </tr>`).join('');
  return `
  <div class="section-eyebrow">Part 6</div>
  <h2 class="section-title">Final Writing Task</h2>
  <p class="section-sub">Choose ONE scenario. You will plan and write your email by hand on your printed worksheet.</p>
  <div class="panel">
    <table style="width:100%;border-collapse:collapse;">${cards}</table>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--orange-deep);">On your worksheet</h3>
    <ul style="margin:10px 0 0 18px;padding:0;line-height:1.9;font-size:14.5px;color:var(--ink);">
      <li>Write the number of your chosen scenario.</li>
      <li>Fill in the 5 planning boxes, just like Part 5.</li>
      <li>Write your complete email (60–100 words).</li>
    </ul>
    <button class="startbtn" id="s6done" style="margin-top:20px;">I have my worksheet, I'm ready →</button>
  </div>`;
}
function wireS6(){
  document.getElementById('s6done').addEventListener('click', ()=>{
    markActivityComplete('s6', {completionStatus:'reached'});
    goNext();
  });
}

/* ===== Section 7: Self-Check (practice) ===== */
function renderS7(){
  const rows = CHECKLIST_ITEMS.map((c,i)=>`
    <div class="checklist-row" data-chk="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${c}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Part 7</div>
  <h2 class="section-title">Self-Check</h2>
  <p class="section-sub">Practice checking here. Then do the same check on your paper worksheet, and swap with a partner for a peer-check, before you submit.</p>
  <div class="panel">${rows}</div>`;
}
function wireS7(){
  const rows = document.querySelectorAll('#app .checklist-row');
  const checked = new Set();
  rows.forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.chk); else checked.delete(row.dataset.chk);
      if(checked.size >= rows.length) markActivityComplete('s7', {score:`${checked.size}/${rows.length}`});
    });
  });
}

/* ===== Complete ===== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">LESSON COMPLETE</div>
    <h1>You can <span>write a professional MICE email.</span></h1>
    <p>Finish your email on your printed worksheet, check it against the checklist, and submit it to your teacher.</p>
    <div class="complete-actions">
      <button class="tb-btn" id="completePracticeBtn" style="padding:16px 26px;font-size:15px;">Practice Again</button>
      <button class="tb-btn" id="completeHomeBtn" style="padding:16px 26px;font-size:15px;">Back to Start</button>
      <a class="tb-btn" id="completeUnitsBtn" href="../index.html" style="padding:16px 26px;font-size:15px;">All MICE Units</a>
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
