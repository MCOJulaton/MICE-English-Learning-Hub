/* ===================== APP STATE / ROUTER =====================
   Same router/progress/voice/checkin/deep-link/audio architecture as
   Unit 8/9 (copied, unchanged in shape). Nothing here is a new system;
   Unit 10 plugs into the existing one. */
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s7','s8','s9','s10'];

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
const CHECKIN_STORAGE_KEY = 'efc_u10_checkin';
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
function photoChip(img, label, attrs, alt){
  return `<div class="big-choice" ${attrs}><img class="bc-photo" src="${img}" alt="${escAttr(alt || label || '')}" loading="lazy">${label ? `<div class="bc-lbl">${label}</div>` : ''}</div>`;
}
function iconChip(iconId, label, attrs){
  return `<div class="big-choice" ${attrs}><div class="bc-ic">${homeIcon(iconId, 64)}</div>${label ? `<div class="bc-lbl">${label}</div>` : ''}</div>`;
}

function roomChip(r, label, attrs){
  return r.img ? photoChip(r.img, label, attrs, r.word) : iconChip(r.id, label, attrs);
}

/* ===== Simple flat icons for rooms, features, and extras ===== */
function homeIcon(id, size){
  size = size || 64;
  const N='#163B65', T='#0F766E', TL='#3FA89E', O='#D9740F', L='#EAF0F6', G='#4CA36B', B='#8B5E3C', Y='#F5C16C', W='#6EC1E4';
  const parts = {
    bedroom: `<rect x="10" y="30" width="9" height="46" rx="3" fill="${N}"/><rect x="10" y="54" width="80" height="20" rx="4" fill="${T}"/><rect x="22" y="44" width="24" height="12" rx="6" fill="#fff" stroke="${N}" stroke-width="2.5"/><rect x="48" y="46" width="42" height="14" rx="4" fill="${O}"/><rect x="10" y="74" width="8" height="12" fill="${N}"/><rect x="82" y="74" width="8" height="12" fill="${N}"/>`,
    bathroom: `<path d="M12 50 H88 V60 Q88 80 68 80 H32 Q12 80 12 60Z" fill="${T}"/><path d="M20 50 V30 Q20 22 30 22 H40" fill="none" stroke="${N}" stroke-width="5" stroke-linecap="round"/><circle cx="58" cy="38" r="7" fill="#fff" stroke="${N}" stroke-width="2.5"/><circle cx="72" cy="30" r="5" fill="#fff" stroke="${N}" stroke-width="2.5"/><circle cx="50" cy="28" r="4" fill="#fff" stroke="${N}" stroke-width="2.5"/><rect x="22" y="80" width="7" height="8" fill="${N}"/><rect x="71" y="80" width="7" height="8" fill="${N}"/>`,
    kitchen: `<rect x="14" y="54" width="72" height="34" rx="6" fill="${L}" stroke="${N}" stroke-width="3"/><circle cx="34" cy="68" r="8" fill="${N}"/><circle cx="66" cy="68" r="8" fill="${N}"/><rect x="22" y="34" width="28" height="18" rx="3" fill="${O}"/><rect x="18" y="32" width="36" height="5" rx="2" fill="${N}"/><path d="M30 26 q-5 -6 0 -11 M40 26 q-5 -6 0 -11" fill="none" stroke="${N}" stroke-width="3" stroke-linecap="round"/>`,
    livingroom: `<rect x="16" y="34" width="68" height="26" rx="9" fill="${TL}"/><rect x="8" y="48" width="16" height="32" rx="7" fill="${T}"/><rect x="76" y="48" width="16" height="32" rx="7" fill="${T}"/><rect x="20" y="52" width="60" height="22" rx="6" fill="${T}"/><rect x="26" y="40" width="18" height="14" rx="5" fill="${Y}"/><rect x="16" y="80" width="6" height="8" fill="${N}"/><rect x="78" y="80" width="6" height="8" fill="${N}"/>`,
    diningroom: `<rect x="18" y="50" width="64" height="9" rx="3" fill="${O}"/><rect x="26" y="59" width="6" height="28" fill="${N}"/><rect x="68" y="59" width="6" height="28" fill="${N}"/><ellipse cx="38" cy="46" rx="9" ry="3.5" fill="#fff" stroke="${N}" stroke-width="2"/><ellipse cx="62" cy="46" rx="9" ry="3.5" fill="#fff" stroke="${N}" stroke-width="2"/><rect x="4" y="38" width="6" height="38" rx="2" fill="${T}"/><rect x="4" y="62" width="14" height="6" rx="2" fill="${T}"/><rect x="90" y="38" width="6" height="38" rx="2" fill="${T}"/><rect x="82" y="62" width="14" height="6" rx="2" fill="${T}"/>`,
    garden: `<rect x="5" y="82" width="90" height="10" rx="5" fill="#7BC47F"/><rect x="44" y="52" width="12" height="32" fill="${B}"/><circle cx="50" cy="38" r="22" fill="${G}"/><circle cx="34" cy="48" r="13" fill="${G}"/><circle cx="66" cy="48" r="13" fill="${G}"/><line x1="16" y1="82" x2="16" y2="68" stroke="${G}" stroke-width="3"/><circle cx="16" cy="64" r="6" fill="${O}"/><line x1="86" y1="82" x2="86" y2="70" stroke="${G}" stroke-width="3"/><circle cx="86" cy="66" r="6" fill="#E85D75"/>`,
    balcony: `<circle cx="24" cy="26" r="13" fill="${Y}"/><rect x="10" y="52" width="80" height="6" rx="2" fill="${N}"/><rect x="10" y="84" width="80" height="6" rx="2" fill="${N}"/><g fill="${N}"><rect x="16" y="58" width="3" height="26"/><rect x="30" y="58" width="3" height="26"/><rect x="44" y="58" width="3" height="26"/><rect x="58" y="58" width="3" height="26"/><rect x="72" y="58" width="3" height="26"/><rect x="84" y="58" width="3" height="26"/></g><rect x="62" y="36" width="18" height="16" rx="3" fill="${O}"/><circle cx="71" cy="28" r="11" fill="${G}"/>`,
    pool: `<rect x="10" y="46" width="80" height="38" rx="9" fill="${W}"/><path d="M18 62 q8 -8 16 0 t16 0 t16 0 t16 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><path d="M18 74 q8 -8 16 0 t16 0 t16 0 t16 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><path d="M70 22 V52 M82 22 V52 M70 30 H82 M70 42 H82" fill="none" stroke="${N}" stroke-width="3.5" stroke-linecap="round"/>`,
    study: `<rect x="14" y="58" width="72" height="9" rx="3" fill="${O}"/><rect x="20" y="67" width="6" height="22" fill="${N}"/><rect x="74" y="67" width="6" height="22" fill="${N}"/><rect x="34" y="34" width="32" height="22" rx="3" fill="${N}"/><rect x="38" y="38" width="24" height="14" rx="1" fill="${W}"/><rect x="28" y="56" width="44" height="3" rx="1.5" fill="${N}"/><rect x="74" y="46" width="12" height="12" rx="1" fill="${T}"/><rect x="74" y="40" width="12" height="6" rx="1" fill="${Y}"/>`,
    near: `<path d="M50 92 C26 62 18 50 18 36 A32 32 0 0 1 82 36 C82 50 74 62 50 92Z" fill="${O}"/><circle cx="50" cy="36" r="13" fill="#fff"/><rect x="44" y="30" width="12" height="12" rx="2" fill="${N}"/>`,
    safe: `<path d="M50 10 L84 22 V50 Q84 76 50 90 Q16 76 16 50 V22Z" fill="${T}"/><path d="M33 50 L45 62 L68 37" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
    beautiful: `<path d="M50 10 Q55 45 90 50 Q55 55 50 90 Q45 55 10 50 Q45 45 50 10Z" fill="${O}"/><path d="M80 14 Q82 24 92 26 Q82 28 80 38 Q78 28 68 26 Q78 24 80 14Z" fill="${Y}"/><path d="M20 66 Q21 72 27 73 Q21 74 20 80 Q19 74 13 73 Q19 72 20 66Z" fill="${Y}"/>`,
    comfortable: `<rect x="22" y="22" width="56" height="42" rx="14" fill="${T}"/><rect x="12" y="46" width="76" height="26" rx="12" fill="${TL}"/><rect x="8" y="42" width="16" height="36" rx="8" fill="${T}"/><rect x="76" y="42" width="16" height="36" rx="8" fill="${T}"/><rect x="26" y="76" width="6" height="12" fill="${N}"/><rect x="68" y="76" width="6" height="12" fill="${N}"/><circle cx="50" cy="48" r="8" fill="${Y}"/>`
  };
  Object.assign(parts, {
    'clue-big': `<rect x="14" y="34" width="68" height="52" rx="3" fill="${L}" stroke="${N}" stroke-width="4"/><path d="M8 38 L48 8 L88 38Z" fill="${O}" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><rect x="38" y="56" width="20" height="30" fill="${B}"/><rect x="22" y="44" width="12" height="12" fill="${W}"/><rect x="62" y="44" width="12" height="12" fill="${W}"/><g stroke="${N}" stroke-width="3" stroke-linecap="round" fill="none"><circle cx="92" cy="72" r="3.5" fill="${N}"/><line x1="92" y1="76" x2="92" y2="84"/><line x1="92" y1="84" x2="89" y2="90"/><line x1="92" y1="84" x2="95" y2="90"/><line x1="89" y1="79" x2="95" y2="79"/></g>`,
    'clue-small': `<rect x="8" y="8" width="84" height="84" rx="6" fill="none" stroke="${N}" stroke-width="3" stroke-dasharray="6 6"/><rect x="40" y="56" width="20" height="16" fill="${L}" stroke="${N}" stroke-width="2.5"/><path d="M37 58 L50 46 L63 58Z" fill="${O}" stroke="${N}" stroke-width="2" stroke-linejoin="round"/><rect x="47" y="63" width="6" height="9" fill="${B}"/><g stroke="${N}" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M14 14 L30 30 M30 20 V30 H20"/><path d="M86 14 L70 30 M70 20 V30 H80"/></g>`,
    'clue-clean': `<circle cx="50" cy="54" r="30" fill="#fff" stroke="${N}" stroke-width="4"/><circle cx="50" cy="54" r="19" fill="none" stroke="#C9D1D9" stroke-width="3"/><path d="M24 8 Q27 20 38 23 Q27 26 24 38 Q21 26 10 23 Q21 20 24 8Z" fill="${Y}"/><path d="M82 6 Q84 14 92 16 Q84 18 82 26 Q80 18 72 16 Q80 14 82 6Z" fill="${Y}"/><path d="M86 70 Q88 78 94 80 Q88 82 86 90 Q84 82 78 80 Q84 78 86 70Z" fill="${Y}"/>`,
    'clue-dirty': `<circle cx="50" cy="58" r="30" fill="#fff" stroke="${N}" stroke-width="4"/><circle cx="40" cy="52" r="8" fill="${B}"/><circle cx="60" cy="64" r="10" fill="${B}"/><circle cx="54" cy="46" r="4" fill="#6B4A2E"/><circle cx="36" cy="68" r="4" fill="#6B4A2E"/><path d="M30 24 q-6 -6 0 -12 q6 -6 0 -10 M50 24 q-6 -6 0 -12 q6 -6 0 -10 M70 24 q-6 -6 0 -12 q6 -6 0 -10" fill="none" stroke="${N}" stroke-width="3" stroke-linecap="round"/><ellipse cx="82" cy="36" rx="4" ry="2.5" fill="${N}"/><ellipse cx="14" cy="44" rx="4" ry="2.5" fill="${N}"/>`,
    'clue-quiet': `<circle cx="50" cy="50" r="36" fill="${Y}" stroke="${N}" stroke-width="4"/><circle cx="37" cy="42" r="4.5" fill="${N}"/><circle cx="63" cy="42" r="4.5" fill="${N}"/><path d="M38 66 H62" stroke="${N}" stroke-width="4" stroke-linecap="round"/><rect x="45" y="46" width="11" height="40" rx="5.5" fill="#F2C9A5" stroke="${N}" stroke-width="3.5"/>`,
    'clue-noisy': `<path d="M10 38 H28 L48 20 V80 L28 62 H10Z" fill="${N}"/><path d="M58 36 Q68 50 58 64" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/><path d="M68 26 Q86 50 68 74" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/><path d="M78 16 Q104 50 78 84" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`,
    'clue-cheap': `<path d="M12 22 H56 L90 50 L56 78 H12Z" fill="${G}" stroke="${N}" stroke-width="4" stroke-linejoin="round"/><circle cx="24" cy="50" r="5" fill="#fff"/><text x="54" y="62" font-size="34" fill="#fff" font-weight="700" text-anchor="middle" font-family="Arial,sans-serif">$</text><path d="M86 82 V96 M79 89 L86 96 L93 89" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    'clue-comfortable': parts.comfortable + `<path d="M80 16 C80 9 71 7 69 14 C67 7 58 9 58 16 C58 23 69 29 69 29 C69 29 80 23 80 16Z" fill="#E85D75"/>`,
    'clue-beautiful': `<g fill="none" stroke-width="7" stroke-linecap="round"><path d="M10 70 A40 40 0 0 1 90 70" stroke="#E85D75"/><path d="M19 70 A31 31 0 0 1 81 70" stroke="${Y}"/><path d="M28 70 A22 22 0 0 1 72 70" stroke="${G}"/><path d="M37 70 A13 13 0 0 1 63 70" stroke="${W}"/></g><ellipse cx="18" cy="78" rx="16" ry="8" fill="#fff" stroke="#C9D1D9" stroke-width="2.5"/><ellipse cx="82" cy="78" rx="16" ry="8" fill="#fff" stroke="#C9D1D9" stroke-width="2.5"/><path d="M50 6 Q52 12 58 14 Q52 16 50 22 Q48 16 42 14 Q48 12 50 6Z" fill="${Y}"/>`,
    'clue-expensive': `<path d="M8 24 H58 L92 52 L58 80 H8Z" fill="#D9534F" stroke="${N}" stroke-width="4" stroke-linejoin="round"/><circle cx="20" cy="52" r="5" fill="#fff"/><text x="54" y="63" font-size="24" fill="#fff" font-weight="700" text-anchor="middle" font-family="Arial,sans-serif">$$$</text><path d="M86 20 V4 M79 11 L86 4 L93 11" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    'clue-modern': `<rect x="10" y="40" width="80" height="46" fill="#fff" stroke="${N}" stroke-width="4"/><rect x="5" y="30" width="90" height="11" fill="${N}"/><rect x="17" y="50" width="34" height="28" fill="${W}" stroke="${N}" stroke-width="2.5"/><line x1="34" y1="50" x2="34" y2="78" stroke="${N}" stroke-width="2.5"/><rect x="58" y="50" width="12" height="36" fill="${L}" stroke="${N}" stroke-width="2.5"/><rect x="76" y="52" width="10" height="20" fill="${W}" stroke="${N}" stroke-width="2.5"/>`,
    'clue-old': `<rect x="18" y="42" width="64" height="46" fill="#D9CDB4" stroke="${N}" stroke-width="4"/><path d="M10 48 L46 16 L92 52Z" fill="#8B7355" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><path d="M62 42 L55 58 L64 64 L53 86" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><rect x="24" y="52" width="16" height="16" fill="#fff" stroke="${N}" stroke-width="2.5"/><path d="M24 52 L40 68 M40 52 L24 68" stroke="${B}" stroke-width="3"/><rect x="66" y="64" width="12" height="24" fill="#5a4630"/><path d="M18 42 Q28 46 32 56 M18 42 Q22 54 32 56 M18 42 L32 56" fill="none" stroke="#888" stroke-width="1.5"/>`
  });
  Object.assign(parts, {
    bed: parts.bedroom,
    sofa: parts.livingroom,
    wardrobe: `<rect x="22" y="10" width="56" height="74" rx="4" fill="${B}"/><line x1="50" y1="10" x2="50" y2="84" stroke="${N}" stroke-width="3"/><circle cx="44" cy="48" r="3.5" fill="${Y}"/><circle cx="56" cy="48" r="3.5" fill="${Y}"/><rect x="26" y="84" width="8" height="8" fill="${N}"/><rect x="66" y="84" width="8" height="8" fill="${N}"/>`,
    pillow: `<rect x="14" y="32" width="72" height="38" rx="16" fill="#fff" stroke="${N}" stroke-width="3.5"/><path d="M26 46 Q50 38 74 46" fill="none" stroke="#C9D1D9" stroke-width="3" stroke-linecap="round"/>`,
    lamp: `<path d="M30 16 H70 L80 46 H20Z" fill="${Y}" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><rect x="47" y="46" width="6" height="32" fill="${N}"/><ellipse cx="50" cy="82" rx="18" ry="6" fill="${N}"/>`,
    shower: `<path d="M18 92 V24 Q18 14 28 14 H54" fill="none" stroke="${N}" stroke-width="5" stroke-linecap="round"/><path d="M42 24 Q62 8 82 24Z" fill="${TL}" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><g stroke="${W}" stroke-width="4" stroke-linecap="round"><line x1="48" y1="34" x2="46" y2="48"/><line x1="62" y1="34" x2="62" y2="52"/><line x1="76" y1="34" x2="78" y2="48"/><line x1="55" y1="56" x2="54" y2="70"/><line x1="69" y1="58" x2="70" y2="72"/></g>`,
    toilet: `<rect x="52" y="12" width="30" height="26" rx="4" fill="#fff" stroke="${N}" stroke-width="3.5"/><path d="M16 44 H82 Q82 68 60 72 V84 H38 V72 Q16 68 16 44Z" fill="#fff" stroke="${N}" stroke-width="3.5" stroke-linejoin="round"/><rect x="14" y="40" width="72" height="8" rx="4" fill="${L}" stroke="${N}" stroke-width="3"/>`,
    sink: `<path d="M12 40 H88 Q88 66 50 68 Q12 66 12 40Z" fill="${L}" stroke="${N}" stroke-width="3.5" stroke-linejoin="round"/><path d="M50 40 V24 Q50 18 58 18 H68" fill="none" stroke="${N}" stroke-width="5" stroke-linecap="round"/><rect x="42" y="68" width="16" height="22" fill="${L}" stroke="${N}" stroke-width="3"/>`,
    mirror: `<ellipse cx="50" cy="48" rx="26" ry="36" fill="#DDEFF7" stroke="${B}" stroke-width="6"/><path d="M38 34 Q44 26 52 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
    stove: `<rect x="12" y="36" width="76" height="52" rx="6" fill="${L}" stroke="${N}" stroke-width="3.5"/><circle cx="32" cy="52" r="7" fill="${N}"/><circle cx="68" cy="52" r="7" fill="${N}"/><rect x="26" y="66" width="48" height="16" rx="3" fill="#fff" stroke="${N}" stroke-width="3"/><circle cx="22" cy="42" r="2.5" fill="${O}"/><circle cx="50" cy="42" r="2.5" fill="${O}"/><circle cx="78" cy="42" r="2.5" fill="${O}"/>`,
    fridge: `<rect x="28" y="8" width="44" height="84" rx="7" fill="${L}" stroke="${N}" stroke-width="3.5"/><line x1="28" y1="38" x2="72" y2="38" stroke="${N}" stroke-width="3"/><rect x="62" y="18" width="4" height="14" rx="2" fill="${N}"/><rect x="62" y="48" width="4" height="22" rx="2" fill="${N}"/>`,
    pot: `<path d="M24 44 H76 V70 Q76 80 66 80 H34 Q24 80 24 70Z" fill="${O}"/><rect x="20" y="38" width="60" height="8" rx="3" fill="${N}"/><rect x="10" y="50" width="14" height="6" rx="3" fill="${N}"/><rect x="76" y="50" width="14" height="6" rx="3" fill="${N}"/><path d="M38 30 q-5 -6 0 -12 M50 30 q-5 -6 0 -12 M62 30 q-5 -6 0 -12" fill="none" stroke="${N}" stroke-width="3" stroke-linecap="round"/>`,
    tv: `<rect x="10" y="22" width="80" height="52" rx="5" fill="${N}"/><rect x="16" y="28" width="68" height="40" rx="2" fill="${W}"/><rect x="38" y="76" width="24" height="6" fill="${N}"/><rect x="28" y="82" width="44" height="5" rx="2" fill="${N}"/>`,
    table: `<rect x="10" y="38" width="80" height="10" rx="3" fill="${O}"/><rect x="18" y="48" width="7" height="38" fill="${B}"/><rect x="75" y="48" width="7" height="38" fill="${B}"/>`,
    chair: `<rect x="28" y="10" width="9" height="46" rx="2" fill="${B}"/><rect x="28" y="44" width="46" height="9" rx="2" fill="${O}"/><rect x="28" y="53" width="8" height="36" fill="${B}"/><rect x="66" y="53" width="8" height="36" fill="${B}"/><rect x="31" y="22" width="26" height="6" rx="2" fill="${B}"/>`,
    plate: `<circle cx="50" cy="50" r="36" fill="#fff" stroke="${N}" stroke-width="4"/><circle cx="50" cy="50" r="22" fill="none" stroke="#C9D1D9" stroke-width="3"/>`,
    glass: `<path d="M30 18 H70 L63 84 Q62 88 58 88 H42 Q38 88 37 84Z" fill="#DDEFF7" stroke="${N}" stroke-width="3.5" stroke-linejoin="round"/><path d="M34 46 H66 L63 84 Q62 88 58 88 H42 Q38 88 37 84Z" fill="${W}"/>`,
    tree: `<rect x="44" y="52" width="12" height="36" fill="${B}"/><circle cx="50" cy="38" r="26" fill="${G}"/><circle cx="34" cy="50" r="14" fill="${G}"/><circle cx="66" cy="50" r="14" fill="${G}"/>`,
    flower: `<line x1="50" y1="46" x2="50" y2="90" stroke="${G}" stroke-width="5"/><path d="M50 76 Q34 72 30 60 Q44 60 50 76Z" fill="${G}"/><g fill="#E85D75"><circle cx="50" cy="22" r="11"/><circle cx="66" cy="34" r="11"/><circle cx="60" cy="52" r="11"/><circle cx="40" cy="52" r="11"/><circle cx="34" cy="34" r="11"/></g><circle cx="50" cy="38" r="9" fill="${Y}"/>`,
    grass: `<g fill="${G}"><path d="M10 90 L18 36 L26 90Z"/><path d="M26 90 L38 24 L48 90Z"/><path d="M46 90 L58 40 L68 90Z"/><path d="M64 90 L78 28 L88 90Z"/></g><rect x="6" y="86" width="88" height="6" rx="3" fill="#7BC47F"/>`,
    bench: `<rect x="12" y="52" width="76" height="8" rx="2" fill="${B}"/><rect x="12" y="34" width="76" height="6" rx="2" fill="${B}"/><rect x="16" y="40" width="5" height="12" fill="${B}"/><rect x="79" y="40" width="5" height="12" fill="${B}"/><rect x="18" y="60" width="6" height="26" fill="${N}"/><rect x="76" y="60" width="6" height="26" fill="${N}"/>`,
    plant: `<path d="M36 62 H64 L60 88 H40Z" fill="${O}"/><path d="M50 62 Q30 46 32 24 Q48 32 50 62Z" fill="${G}"/><path d="M50 62 Q70 46 68 24 Q52 32 50 62Z" fill="${G}"/><path d="M50 62 Q50 36 50 14 Q58 36 50 62Z" fill="#7BC47F"/>`,
    railing: `<rect x="8" y="30" width="84" height="7" rx="3" fill="${N}"/><rect x="8" y="82" width="84" height="7" rx="3" fill="${N}"/><g fill="${N}"><rect x="16" y="37" width="4" height="45"/><rect x="31" y="37" width="4" height="45"/><rect x="46" y="37" width="4" height="45"/><rect x="61" y="37" width="4" height="45"/><rect x="76" y="37" width="4" height="45"/></g>`
  });
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${parts[id] || ''}</svg>`;
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

/* ===== My home (the coin game state, saved on this device) ===== */
function freshHome(){
  return {bedrooms:0, bathrooms:0, kitchen:null, near:null, livingroom:null, study:null, balcony:null, garden:null, pool:null, _built:false};
}
let myHome = freshHome();
function loadMyHome(){
  try{
    const saved = JSON.parse(localStorage.getItem(MY_HOME_KEY));
    if(saved && saved.date === todayStr() && saved.v === 3) myHome = Object.assign(freshHome(), saved.home);
  }catch(e){}
}
function saveMyHome(){
  try{ localStorage.setItem(MY_HOME_KEY, JSON.stringify({date: todayStr(), v:3, home: myHome})); }catch(e){}
}
function homeCost(h){
  let c = Math.max(0, h.bedrooms - 1) + Math.max(0, h.bathrooms - 1) + (h.kitchen === 'big' ? KITCHEN_BIG_COST : 0);
  BUILD_ROWS.forEach(r=>{ if(r.type === 'toggle' && h[r.id]) c += r.cost; });
  return c;
}
function basicsOk(h){ return h.bedrooms >= 1 && h.bathrooms >= 1 && !!h.kitchen; }
function homeLines(h){
  const lines = [];
  const plural = n => n > 1 ? 's' : '';
  if(h.bedrooms >= 1) lines.push({ic:'bedroom', text:`${h.bedrooms} bedroom${plural(h.bedrooms)}`, say:`It has ${NUMBER_WORDS[h.bedrooms]} bedroom${plural(h.bedrooms)}.`});
  if(h.bathrooms >= 1) lines.push({ic:'bathroom', text:`${h.bathrooms} bathroom${plural(h.bathrooms)}`, say:`It has ${NUMBER_WORDS[h.bathrooms]} bathroom${plural(h.bathrooms)}.`});
  if(h.kitchen) lines.push({ic:'kitchen', text:`${h.kitchen} kitchen`, say:`It has a ${h.kitchen} kitchen.`});
  BUILD_ROWS.filter(r=> r.type === 'toggle' && h[r.id]).forEach(r=>{
    lines.push(r.id === 'near'
      ? {ic:'near', text:'near university', say:'It is near my university.'}
      : {ic:r.icon, text:r.label.toLowerCase(), say:`It has a ${r.label.toLowerCase()}.`});
  });
  return lines;
}
function homeIsReady(h){ return basicsOk(h); }

function syncTopbarHeight(){
  const bar = document.getElementById('topbar');
  if(bar) document.documentElement.style.setProperty('--topbar-h', bar.offsetHeight + 'px');
}
window.addEventListener('resize', syncTopbarHeight);

let activeDesigner = null;
app.addEventListener('click', e=>{
  if(!activeDesigner) return;
  const reset = e.target.closest('[data-reset]');
  if(reset && activeDesigner.el.contains(reset)){ activeDesigner.reset(reset); return; }
  const row = e.target.closest('[data-row]');
  if(row && activeDesigner.el.contains(row)) activeDesigner.pick(row);
});

/* ===== The coin game: choose features, spend coins, meet the client's needs ===== */
function mountDesigner(el, cfg){
  const h = cfg.home, budget = cfg.budget, client = cfg.client || null;
  syncTopbarHeight();
  const rowHtml = r => {
    let opts = '';
    if(r.type === 'count') opts = r.opts.map(n=>`<button type="button" class="build-btn" data-row="${r.id}" data-v="${n}">${n}${n > 1 ? `<small class="bcost">+${n-1}</small>` : '<small class="bcost free">free</small>'}</button>`).join('');
    if(r.type === 'kitchen') opts = r.opts.map(k=>`<button type="button" class="build-btn wide" data-row="${r.id}" data-v="${k}">${k}${k === 'big' ? `<small class="bcost">+${KITCHEN_BIG_COST}</small>` : '<small class="bcost free">free</small>'}</button>`).join('');
    if(r.type === 'toggle') opts = `<button type="button" class="build-btn wide" data-row="${r.id}" data-v="0">No</button><button type="button" class="build-btn wide" data-row="${r.id}" data-v="1">Yes<small class="bcost">+${r.cost}</small></button>`;
    return `<div class="build-row"><div class="build-label">${homeIcon(r.icon, 40)}<span>${r.label}</span></div><div class="build-opts">${opts}</div></div>`;
  };
  el.innerHTML = `<div class="build-layout">
    <div class="panel">
      <div class="build-head"><span>Click one choice in each line.</span><button type="button" class="reset-small" data-reset>↺ Start again</button></div>
      <div class="coin-strip" data-coinstrip></div>
      ${BUILD_ROWS.map(rowHtml).join('')}
    </div>
    <div class="panel my-home-card" data-summary></div>
  </div>`;
  const valueOf = (btn, base) => {
    const r = BUILD_ROWS.find(x=>x.id === btn.dataset.row);
    if(r.type === 'count') return +btn.dataset.v;
    if(r.type === 'kitchen') return btn.dataset.v;
    return btn.dataset.v === '1';
  };
  function update(){
    const cost = homeCost(h), left = budget - cost;
    el.querySelectorAll('[data-row]').forEach(btn=>{
      const r = BUILD_ROWS.find(x=>x.id === btn.dataset.row);
      const v = valueOf(btn);
      const candidate = Object.assign({}, h, {[r.id]: v});
      btn.classList.toggle('sel', h[r.id] === v);
      const tooMuch = homeCost(candidate) > budget;
      btn.classList.toggle('off', tooMuch && h[r.id] !== v);
      btn.setAttribute('aria-disabled', tooMuch && h[r.id] !== v ? 'true' : 'false');
    });
    const lines = homeLines(h);
    const needsMet = client ? (basicsOk(h) && client.needs.every(n=> n.test(h))) : true;
    const strip = el.querySelector('[data-coinstrip]');
    const metCount = client ? client.needs.filter(n=> n.test(h)).length + (basicsOk(h) ? 1 : 0) : 0;
    strip.innerHTML = `<div class="strip-coins" role="img" aria-label="${left} coins left">${Array.from({length:budget}, (_, i)=>`<span class="coin ${i < left ? '' : 'spent'}"></span>`).join('')}</div>
      <div class="strip-text"><b>${left}</b> left${client ? ` · Needs ${metCount}/${client.needs.length + 1}` : ''}</div>`;
    const sum = el.querySelector('[data-summary]');
    sum.innerHTML = `<svg viewBox="0 0 200 60" class="roof" aria-hidden="true"><path d="M10 56 L100 8 L190 56Z" fill="${client ? client.color : '#D9740F'}"/></svg>
      <div class="my-home-title">${client ? 'HOME FOR ' + client.name.replace('The ', '').toUpperCase() : 'MY PERFECT HOME'}</div>
      <div class="coins" role="img" aria-label="${left} coins left">${Array.from({length:budget}, (_, i)=>`<span class="coin ${i < left ? '' : 'spent'}"></span>`).join('')}</div>
      <div class="coins-text"><b>${left}</b> coin${left === 1 ? '' : 's'} left</div>
      ${client ? `<ul class="needs"><li class="${basicsOk(h) ? 'met' : ''}"><span class="need-box">${basicsOk(h) ? '✓' : ''}</span>${homeIcon('bedroom', 26)}<span>Bedroom, bathroom, kitchen</span></li>${client.needs.map(n=>`<li class="${n.test(h) ? 'met' : ''}"><span class="need-box">${n.test(h) ? '✓' : ''}</span>${homeIcon(n.icon, 26)}<span>${n.label}</span></li>`).join('')}</ul>` : ''}
      ${lines.length ? `<ul class="home-lines">${lines.map(l=>`<li>${homeIcon(l.ic, 30)}<span>${l.text}</span></li>`).join('')}</ul>` : '<p class="sentence-hint" style="margin:8px 0;">Your home is empty. Click your choices.</p>'}
      ${cfg.listen && !basicsOk(h) ? '<p class="sentence-hint" style="margin-top:10px;">Choose a bedroom, a bathroom, and a kitchen.</p>' : ''}
      ${cfg.listen && homeIsReady(h) ? `<p style="margin-top:14px;">${listenBtn('This is my perfect home. ' + lines.map(l=>l.say).join(' '), 'Listen to my home')}</p>` : ''}`;
    bindSay(sum);
    if(cfg.onUpdate) cfg.onUpdate({cost, left, needsMet, home:h});
  }
  function pick(btn){
    const r = BUILD_ROWS.find(x=>x.id === btn.dataset.row);
    const candidate = Object.assign({}, h, {[r.id]: valueOf(btn)});
    if(homeCost(candidate) > budget){
      const warned = el.querySelectorAll('.coins-text, .strip-text');
      warned.forEach(t=>{ t.classList.add('warn'); t.innerHTML = 'No more coins. Choose something else.'; });
      if(warned.length) setTimeout(update, 1400);
      return;
    }
    h[r.id] = valueOf(btn);
    h._built = true;
    update();
  }
  function resetAll(btn){
    try{
      Object.assign(h, freshHome());
      if(cfg.onReset) cfg.onReset();
      update();
      const target = cfg.scrollTo || el;
      const bar = document.getElementById('topbar');
      target.style.scrollMarginTop = ((bar ? bar.offsetHeight : 0) + 12) + 'px';
      target.scrollIntoView({behavior:'smooth', block:'start'});
      const old = btn.dataset.label || btn.textContent;
      btn.dataset.label = old;
      btn.textContent = '✓ Fresh start';
      btn.classList.add('flash');
      setTimeout(()=>{ btn.textContent = old; btn.classList.remove('flash'); }, 1500);
    }catch(err){
      btn.textContent = 'Error: ' + err.message;
      console.error(err);
    }
  }
  activeDesigner = {el, pick, reset: resetAll};
  update();
}

/* ===== One client: read, design within the coins, then say why ===== */
function listJoin(items){
  return items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}
function mountClient(el, client, key, opts){
  opts = opts || {};
  const home = freshHome();
  const reasonDone = {};
  const sentences = {};
  let completed = false;
  el.innerHTML = `
    <div class="panel client-card" style="--cc:${client.color}">
      <div class="client-face">${client.face}</div>
      <div class="client-says">${client.lines.map(l=>`<p>${l}</p>`).join('')}</div>
      <div class="client-listen">${listenBtn(client.lines.join(' '), 'Listen')}</div>
    </div>
    <div data-designer></div>
    <div data-reasons></div>
    <div data-share></div>`;
  bindSay(el);
  let metBefore = null;
  function reasonsHtml(){
    return `<div class="panel"><h3 class="step-title">Why? Choose the reason.</h3>
      ${client.needs.map((n,i)=>{
        const options = shuffle([{ok:true, t:n.reason}, {ok:false, t:n.wrong}]);
        const done = reasonDone[n.id];
        return `<div class="sit-card" data-need="${n.id}">
          <p style="font-weight:700;color:var(--navy);display:flex;align-items:center;gap:10px;">${homeIcon(n.icon, 34)} I choose ${n.thing}</p>
          <div class="choices wrap">${options.map(o=>`<button type="button" class="choice-btn${done && o.ok ? ' correct' : ''}" data-ok="${o.ok ? 1 : 0}">because ${o.t}.</button>`).join('')}</div>
          <div class="feedback${done ? ' show good' : ''}" data-rfb>${done ? sentences[n.id] + ' ' + listenBtn(sentences[n.id]) : ''}</div>
        </div>`;
      }).join('')}
    </div>`;
  }
  function showReasons(met){
    const box = el.querySelector('[data-reasons]');
    if(!met){ box.innerHTML = ''; el.querySelector('[data-share]').innerHTML = ''; return; }
    box.innerHTML = reasonsHtml();
    bindSay(box);
    box.querySelectorAll('[data-need]').forEach(card=>{
      const need = client.needs.find(n=>n.id === card.dataset.need);
      card.querySelectorAll('.choice-btn').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const fb = card.querySelector('[data-rfb]');
          if(btn.dataset.ok === '1'){
            btn.classList.add('correct');
            card.querySelectorAll('.choice-btn').forEach(b=>{ b.style.pointerEvents = 'none'; });
            const s = `I choose ${need.thing} because ${need.reason}.`;
            reasonDone[need.id] = true; sentences[need.id] = s;
            fb.className = 'feedback show good';
            fb.innerHTML = `${s} ${listenBtn(s)}`;
            bindSay(fb);
            if(client.needs.every(n=> reasonDone[n.id])) finish();
          }else{
            btn.classList.add('wrong');
            fb.className = 'feedback show meh';
            fb.textContent = 'Try again.';
          }
        });
      });
    });
    if(client.needs.every(n=> reasonDone[n.id])) showShare();
  }
  function showShare(){
    const wants = listJoin(client.needs.map(n=>n.thing));
    const lines = [`This is ${client.shareName}.`, `${client.pron} ${client.wantVerb} ${wants}.`].concat(client.needs.map(n=> sentences[n.id]));
    const share = el.querySelector('[data-share]');
    share.innerHTML = `<div class="panel share-panel">
      <h3 class="step-title">Tell your partner</h3>
      <p class="section-sub">Say these sentences to your partner. Then design your own home.</p>
      <ol class="speech-list">${lines.map(l=>`<li><span>${l}</span> ${listenBtn(l)}</li>`).join('')}</ol>
    </div>`;
    bindSay(share);
  }
  function finish(){
    showShare();
    if(!completed){
      completed = true;
      markActivityComplete(key, {completionStatus:'completed', score:`${homeCost(home)}/${client.coins} coins`, answers:`${client.id}: ` + Object.values(sentences).join(' | ')});
    }
  }
  mountDesigner(el.querySelector('[data-designer]'), {
    budget: client.coins, home, client, scrollTo: el,
    onReset: ()=>{ Object.keys(reasonDone).forEach(k=> delete reasonDone[k]); },
    onUpdate: info=>{
      if(info.needsMet !== metBefore){ metBefore = info.needsMet; showReasons(info.needsMet); }
    }
  });
}

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover cover-photo">
    <div class="cover-text">
      <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
      <h1>What Makes a <span>Good Home?</span></h1>
      <p>Unit 10: Architecture. Be a home designer. Help Mina. Then design your perfect home.</p>
      <div class="signdock">
        <div class="signchip"><span class="arrow">→</span> Rooms</div>
        <div class="signchip"><span class="arrow">→</span> I like / I want</div>
        <div class="signchip"><span class="arrow">→</span> Help Mina</div>
        <div class="signchip"><span class="arrow">→</span> My Perfect Home</div>
      </div>
      <button class="startbtn" onclick="goNext()">Let's begin →</button>
    </div>
    <img class="cover-img" src="${IMG}cover.jpg" alt="A beautiful modern home with warm lights at sunset">
  </div>`;
}

/* ===== Section 1: Warm-Up ===== */
function renderS1(){
  const cards = HOME_TYPES.map(h=> photoChip(h.img, h.name, `data-home="${h.id}"`)).join('');
  return `
  <div class="section-eyebrow">Section 1 · Look</div>
  <h2 class="section-title">What Makes a Good Home?</h2>
  <p class="section-sub">Look. Click the home you like.</p>
  <div class="panel"><div class="big-choice-grid home-grid">${cards}</div></div>
  <div id="s1detail"></div>`;
}
function wireS1(){
  const detail = document.getElementById('s1detail');
  const answered = {};
  function showHome(id){
    const home = HOME_TYPES.find(h=>h.id === id);
    Object.keys(answered).forEach(k=> delete answered[k]);
    detail.innerHTML = `<div class="panel">
      <div class="home-detail">
        <img class="home-detail-img" src="${home.img}" alt="${escAttr(home.name)}">
        <div class="home-detail-qs">
          <h3 style="font-size:20px;color:var(--navy);">${home.name}</h3>
          ${WARMUP_QUESTIONS.map(q=>`
            <div class="sit-card" data-wq="${q.id}">
              <p style="font-weight:700;color:var(--navy);">${q.q}</p>
              <div class="choices">${q.opts.map((o,i)=>`<button class="choice-btn" data-i="${i}">${o.t}</button>`).join('')}</div>
              <div class="feedback" data-wfb></div>
            </div>`).join('')}
          <div class="feedback" data-wdone></div>
        </div>
      </div>
      ${sayIt('"I like the ' + home.name.toLowerCase() + '."')}
    </div>`;
    detail.querySelectorAll('[data-wq]').forEach(card=>{
      const q = WARMUP_QUESTIONS.find(x=>x.id === card.dataset.wq);
      card.querySelectorAll('.choice-btn').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          card.querySelectorAll('.choice-btn').forEach(b=>b.classList.remove('sel'));
          btn.classList.add('sel');
          const say = q.opts[+btn.dataset.i].say;
          const fb = card.querySelector('[data-wfb]');
          fb.className = 'feedback show good';
          fb.innerHTML = `${say} ${listenBtn(say)}`;
          bindSay(fb);
          answered[q.id] = q.opts[+btn.dataset.i].t;
          if(Object.keys(answered).length === WARMUP_QUESTIONS.length){
            const d = detail.querySelector('[data-wdone]');
            d.className = 'feedback show good';
            d.textContent = 'Good! Now go to the next section.';
            markActivityComplete('s1', {completionStatus:'completed', answers:`home: ${home.name} | ` + Object.entries(answered).map(([k,v])=>`${k}: ${v}`).join(', ')});
          }
        });
      });
    });
    detail.scrollIntoView({behavior:'smooth', block:'start'});
  }
  document.querySelectorAll('#app [data-home]').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-home]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      showHome(c.dataset.home);
    });
  });
}

/* ===== Zoom: a big photo with the word, no voice ===== */
function openZoom(items, startIndex){
  let i = startIndex;
  const prevFocus = document.activeElement;
  const ov = document.createElement('div');
  ov.className = 'zoom-overlay';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.setAttribute('aria-label', 'Zoomed picture');
  function draw(){
    const it = items[i];
    ov.innerHTML = `<button type="button" class="zoom-close" aria-label="Close">✕ Close</button>
      <button type="button" class="zoom-nav prev" aria-label="Previous">←</button>
      <figure class="zoom-fig">
        ${it.img ? `<img src="${it.img}" alt="${escAttr(it.word)}">` : `<div class="zoom-icon">${homeIcon(it.id, 260)}</div>`}
        <figcaption>${it.word}</figcaption>
      </figure>
      <button type="button" class="zoom-nav next" aria-label="Next">→</button>`;
    ov.querySelector('.zoom-close').addEventListener('click', close);
    ov.querySelector('.prev').addEventListener('click', e=>{ e.stopPropagation(); i = (i - 1 + items.length) % items.length; draw(); });
    ov.querySelector('.next').addEventListener('click', e=>{ e.stopPropagation(); i = (i + 1) % items.length; draw(); });
    ov.querySelector('.zoom-close').focus();
  }
  function close(){
    document.removeEventListener('keydown', onKey);
    ov.remove();
    if(prevFocus && prevFocus.focus) prevFocus.focus();
  }
  function onKey(e){
    if(e.key === 'Escape') close();
    else if(e.key === 'ArrowLeft'){ i = (i - 1 + items.length) % items.length; draw(); }
    else if(e.key === 'ArrowRight'){ i = (i + 1) % items.length; draw(); }
  }
  ov.addEventListener('click', e=>{ if(e.target === ov) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(ov);
  draw();
}

/* ===== Section 2: Rooms in a Home ===== */
function houseTile(id){
  const r = ROOMS.find(x=>x.id === id);
  const bg = r.img ? `style="background-image:url('${r.img}')"` : '';
  return `<button type="button" class="house-tile" data-hroom="${id}" ${bg} aria-label="Open the ${r.word}">
    ${r.img ? '' : `<span class="house-icon">${homeIcon(id, 70)}</span>`}
    <span class="house-label">${r.word}</span><span class="house-check" aria-hidden="true">✓</span>
  </button>`;
}
function renderS2(){
  const learn = ROOMS.map(r=> roomChip(r, r.word, `data-room="${r.id}" role="button" tabindex="0" aria-label="Zoom in: ${r.word}"`)).join('');
  const rows = HOUSE_ROWS.map(row=>`<div class="house-row">${row.map(houseTile).join('')}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · Learn</div>
  <h2 class="section-title">Rooms in a Home</h2>
  <p class="section-sub">Look. Click a room to zoom in.</p>
  <div class="panel"><div class="big-choice-grid room-grid">${learn}</div></div>
  <div class="panel">
    <h3 class="step-title">Explore the house</h3>
    <p class="section-sub" style="margin:4px 0 14px;">Click a room. What do we see in the room? Pick the things.</p>
    <div class="house">
      <svg class="house-roof" viewBox="0 0 400 70" aria-hidden="true"><rect x="290" y="8" width="26" height="40" fill="#8B5E3C"/><path d="M0 70 L200 6 L400 70Z" fill="#D9740F"/></svg>
      <div class="house-body">${rows}</div>
      ${houseTile('garden').replace('class="house-tile"', 'class="house-tile house-garden"')}
    </div>
    <div class="house-progress" id="s2progress" aria-live="polite">0 / ${ROOMS.length} rooms</div>
  </div>`;
}
function wireS2(){
  document.querySelectorAll('#app [data-room]').forEach(c=>{
    const open = ()=>{
      document.querySelectorAll('#app [data-room]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      openZoom(ROOMS, ROOMS.findIndex(r=>r.id === c.dataset.room));
    };
    c.addEventListener('click', open);
    c.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } });
  });
  const state = {};
  let wrongTotal = 0;
  const progress = document.getElementById('s2progress');
  function refresh(){
    const done = ROOMS.filter(r=> state[r.id] && state[r.id].done);
    document.querySelectorAll('#app [data-hroom]').forEach(t=> t.classList.toggle('done', !!(state[t.dataset.hroom] && state[t.dataset.hroom].done)));
    progress.textContent = `${done.length} / ${ROOMS.length} rooms`;
    if(done.length === ROOMS.length){
      progress.textContent = `${done.length} / ${ROOMS.length} rooms. Great! You know the house.`;
      markActivityComplete('s2', {completionStatus:'completed', score:`${ROOMS.length}/${ROOMS.length} rooms`, answers:`wrong picks: ${wrongTotal}`});
    }
  }
  function nextRoom(from){
    const order = ROOMS.map(r=>r.id);
    for(let k=1;k<=order.length;k++){
      const id = order[(order.indexOf(from) + k) % order.length];
      if(!(state[id] && state[id].done)) return id;
    }
    return null;
  }
  function openRoom(id){
    const room = ROOMS.find(r=>r.id === id);
    const cfg = ROOM_ITEMS[id];
    const st = state[id] = state[id] || {found:new Set(), wrong:new Set(), done:false, order:shuffle(cfg.items.concat(cfg.not))};
    const prevFocus = document.activeElement;
    const ov = document.createElement('div');
    ov.className = 'zoom-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Room: ' + room.word);
    function close(){
      document.removeEventListener('keydown', onKey);
      ov.remove();
      if(prevFocus && prevFocus.focus) prevFocus.focus();
    }
    function onKey(e){ if(e.key === 'Escape') close(); }
    function draw(){
      const prep = room.id === 'balcony' ? 'on' : 'in';
      const sentences = cfg.items.map(k=> `There is ${k === 'grass' ? '' : 'a '}${ITEM_WORDS[k]} ${prep} the ${room.word}.`);
      ov.innerHTML = `<button type="button" class="zoom-close" aria-label="Close">✕ Close</button>
        <div class="room-modal">
          <div class="room-modal-pic">
            ${room.img ? `<img src="${room.img}" alt="${escAttr(room.word)}">` : `<div class="zoom-icon">${homeIcon(room.id, 200)}</div>`}
            <div class="room-modal-name">${room.word}</div>
          </div>
          <div class="room-modal-pick">
            <h3 class="room-modal-q">What do we see ${room.id === 'balcony' ? 'on' : 'in'} the ${room.word}?</h3>
            <p class="room-modal-hint">Pick the things. Find ${cfg.items.length}. <b>${st.found.size} / ${cfg.items.length}</b></p>
            <div class="item-grid">${st.order.map(k=>{
              const good = cfg.items.includes(k);
              const cls = st.found.has(k) ? ' correct' : (st.wrong.has(k) ? ' wrong' : '');
              return `<button type="button" class="item-card${cls}" data-item="${k}" ${cls ? 'aria-disabled="true"' : ''}>
                <span class="item-ic">${homeIcon(k, 64)}</span><span class="item-word">${ITEM_WORDS[k]}</span>
                <span class="item-mark" aria-hidden="true">${st.found.has(k) ? '✓' : (st.wrong.has(k) ? '✕' : '')}</span></button>`;
            }).join('')}</div>
            <div class="feedback${st.done ? ' show good' : ''}" data-ifb>${st.done ? 'Great! ' + cfg.items.map(k=>ITEM_WORDS[k]).join(', ') + '.' : ''}</div>
            ${st.done ? `<div class="rule-box" style="margin-top:12px;"><b>Say it</b><ul class="say-list">${sentences.map(t=>`<li>${t}</li>`).join('')}</ul></div>
              ${nextRoom(id) ? '<button type="button" class="reveal-btn" data-nextroom>Next room →</button>' : '<button type="button" class="reveal-btn" data-finish>Finish ✓</button>'}` : ''}
          </div>
        </div>`;
      ov.querySelector('.zoom-close').addEventListener('click', close);
      ov.querySelectorAll('[data-item]').forEach(b=>{
        b.addEventListener('click', ()=>{
          const k = b.dataset.item;
          if(st.done || st.found.has(k) || st.wrong.has(k)) return;
          if(cfg.items.includes(k)){
            st.found.add(k);
            if(st.found.size === cfg.items.length){ st.done = true; refresh(); }
            draw();
          }else{
            st.wrong.add(k); wrongTotal++;
            draw();
            const fb = ov.querySelector('[data-ifb]');
            fb.className = 'feedback show meh';
            fb.textContent = `Not ${room.id === 'balcony' ? 'on' : 'in'} the ${room.word}. Try again.`;
          }
        });
      });
      const nb = ov.querySelector('[data-nextroom]');
      if(nb) nb.addEventListener('click', ()=>{ close(); openRoom(nextRoom(id)); });
      const fb2 = ov.querySelector('[data-finish]');
      if(fb2) fb2.addEventListener('click', close);
      const focusEl = ov.querySelector('[data-nextroom], [data-finish]') || ov.querySelector('.zoom-close');
      if(focusEl) focusEl.focus();
    }
    ov.addEventListener('click', e=>{ if(e.target === ov) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
    draw();
  }
  document.querySelectorAll('#app [data-hroom]').forEach(t=> t.addEventListener('click', ()=> openRoom(t.dataset.hroom)));
}

/* ===== Section 3: Home Features ===== */
function renderS3(){
  const pairs = FEATURE_PAIRS.map(p=>`
    <div class="pair-col">
      ${photoChip(p.a.img, p.a.word, `data-sayword="${p.a.word}" role="button" tabindex="0" aria-label="Zoom in: ${p.a.word}"`)}
      <div class="pair-vs">↕</div>
      ${photoChip(p.b.img, p.b.word, `data-sayword="${p.b.word}" role="button" tabindex="0" aria-label="Zoom in: ${p.b.word}"`)}
    </div>`).join('');
  const singles = `<div class="pair-col singles-col">${FEATURE_SINGLES.map(s=> iconChip(s.id, s.word, `data-sayword="${s.word}" role="button" tabindex="0" aria-label="Zoom in: ${s.word}"`)).join('')}</div>`;
  const starts = {};
  CW_WORDS.forEach(w=>{ starts[w.r + ',' + w.c] = w.num; });
  let cells = '';
  for(let r=0;r<CW_ROWS;r++){
    for(let c=0;c<CW_COLS;c++){
      const used = CW_WORDS.some(w=> w.dir === 'A' ? (w.r === r && c >= w.c && c < w.c + w.word.length) : (w.c === c && r >= w.r && r < w.r + w.word.length));
      cells += used
        ? `<div class="cw-cell">${starts[r + ',' + c] ? `<span class="cw-num">${starts[r + ',' + c]}</span>` : ''}<input type="text" maxlength="1" autocomplete="off" autocapitalize="characters" spellcheck="false" data-r="${r}" data-c="${c}" aria-label="Row ${r + 1}, column ${c + 1}"></div>`
        : '<div class="cw-block"></div>';
    }
  }
  const clue = w=>`<button type="button" class="cw-clue" data-clue="${w.word}" aria-label="Clue ${w.num} ${w.dir === 'A' ? 'across' : 'down'}"><span class="cw-clue-num">${w.num}</span><span class="cw-clue-ic">${homeIcon('clue-' + w.word, 78)}</span></button>`;
  const bank = shuffle(CW_WORDS.map(w=>w.word)).map(w=>`<span class="cw-chip" data-bank="${w}">${w}</span>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Learn</div>
  <h2 class="section-title">Home Features</h2>
  <p class="section-sub">Look. Click a picture to zoom in.</p>
  <div class="panel"><div class="pair-grid">${pairs}${singles}</div></div>
  <div class="panel">
    <h3 class="step-title">Game: Crossword</h3>
    <p class="section-sub" style="margin:4px 0 12px;">Look at the picture. Write the word in the grid.</p>
    <div class="cw-bank-row"><div class="cw-bank" id="cwBank">${bank}</div><button type="button" class="reset-small" id="cwToggleBank">Hide word bank</button></div>
    <div class="cw-now" id="cwNow" aria-live="polite"><span class="cw-now-hint">Click a square or a picture to start.</span></div>
    <div class="cw-wrap">
      <div class="cw-gridbox"><div class="cw-grid" id="cwGrid" style="--n:${CW_COLS}">${cells}</div></div>
      <div class="cw-clues">
        <div class="cw-clue-group"><h4>Across →</h4><div class="cw-clue-row">${CW_WORDS.filter(w=>w.dir === 'A').sort((a,b)=>a.num-b.num).map(clue).join('')}</div></div>
        <div class="cw-clue-group"><h4>Down ↓</h4><div class="cw-clue-row">${CW_WORDS.filter(w=>w.dir === 'D').sort((a,b)=>a.num-b.num).map(clue).join('')}</div></div>
      </div>
    </div>
    <div class="cw-actions">
      <button type="button" class="startbtn" id="cwCheck">Check</button>
      <button type="button" class="reveal-btn" id="cwHint">Hint</button>
      <button type="button" class="reset-small" id="cwClear">Start again</button>
    </div>
    <div class="feedback" id="cwFb" aria-live="polite"></div>
  </div>`;
}
function wireS3(){
  const zoomItems = [];
  FEATURE_PAIRS.forEach(p=>{ zoomItems.push({word:p.a.word, img:p.a.img}, {word:p.b.word, img:p.b.img}); });
  FEATURE_SINGLES.forEach(x=> zoomItems.push({word:x.word, id:x.id}));
  document.querySelectorAll('#app [data-sayword]').forEach(c=>{
    const open = ()=>{
      c.classList.add('sel');
      openZoom(zoomItems, zoomItems.findIndex(z=> z.word === c.dataset.sayword));
    };
    c.addEventListener('click', open);
    c.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } });
  });
  initCrossword();
}

function initCrossword(){
  const grid = document.getElementById('cwGrid');
  const inputs = {};
  grid.querySelectorAll('input').forEach(i=>{ inputs[i.dataset.r + ',' + i.dataset.c] = i; });
  const solution = {};
  const wordCells = {};
  CW_WORDS.forEach(w=>{
    wordCells[w.word] = [];
    for(let k=0;k<w.word.length;k++){
      const r = w.r + (w.dir === 'D' ? k : 0), c = w.c + (w.dir === 'A' ? k : 0);
      solution[r + ',' + c] = w.word[k].toUpperCase();
      wordCells[w.word].push(r + ',' + c);
    }
  });
  const wordsAt = key => CW_WORDS.filter(w=> wordCells[w.word].includes(key));
  let dir = 'A', activeWord = null, hints = 0, finished = false;
  const fb = document.getElementById('cwFb');
  function pickWord(key, preferred){
    const ws = wordsAt(key);
    return ws.find(w=> w.dir === preferred) || ws[0];
  }
  function highlight(){
    Object.values(inputs).forEach(i=> i.parentElement.classList.remove('active', 'cursor'));
    document.querySelectorAll('.cw-clue').forEach(b=> b.classList.toggle('on', !!activeWord && b.dataset.clue === activeWord.word));
    if(activeWord) wordCells[activeWord.word].forEach(k=> inputs[k].parentElement.classList.add('active'));
    const now = document.getElementById('cwNow');
    if(now) now.innerHTML = activeWord
      ? `<span class="cw-now-num">${activeWord.num}</span><span class="cw-now-dir">${activeWord.dir === 'A' ? 'Across →' : 'Down ↓'}</span><span class="cw-now-ic">${homeIcon('clue-' + activeWord.word, 64)}</span><span class="cw-now-len">${activeWord.word.length} letters</span>`
      : '<span class="cw-now-hint">Click a square or a picture to start.</span>';
  }
  function focusCell(key, toggle){
    const el = inputs[key]; if(!el) return;
    const ws = wordsAt(key);
    if(toggle && ws.length > 1 && activeWord && wordCells[activeWord.word].includes(key)) dir = dir === 'A' ? 'D' : 'A';
    activeWord = pickWord(key, dir);
    dir = activeWord.dir;
    highlight();
    el.focus(); el.select();
    el.parentElement.classList.add('cursor');
  }
  function markWords(){
    CW_WORDS.forEach(w=>{
      const ok = wordCells[w.word].every(k=> inputs[k].value.toUpperCase() === solution[k]);
      const chip = document.querySelector(`[data-bank="${w.word}"]`);
      if(chip) chip.classList.toggle('done', ok);
    });
  }
  function allCorrect(){ return Object.keys(solution).every(k=> inputs[k].value.toUpperCase() === solution[k]); }
  function finish(){
    if(finished) return;
    finished = true;
    fb.className = 'feedback show good';
    fb.textContent = 'Great! You finished the crossword.';
    markActivityComplete('s3', {completionStatus:'completed', score:`${CW_WORDS.length}/${CW_WORDS.length} words`, answers:`hints: ${hints}`});
  }
  grid.addEventListener('focusin', e=>{
    const i = e.target.closest('input'); if(!i) return;
    const key = i.dataset.r + ',' + i.dataset.c;
    if(!activeWord || !wordCells[activeWord.word].includes(key)){ activeWord = pickWord(key, dir); dir = activeWord.dir; highlight(); }
    i.parentElement.classList.add('cursor');
  });
  grid.addEventListener('focusout', e=>{ const i = e.target.closest('input'); if(i) i.parentElement.classList.remove('cursor'); });
  grid.addEventListener('click', e=>{
    const i = e.target.closest('input'); if(!i) return;
    focusCell(i.dataset.r + ',' + i.dataset.c, document.activeElement === i && activeWord && wordCells[activeWord.word].includes(i.dataset.r + ',' + i.dataset.c) && i.dataset.clicked === '1');
    i.dataset.clicked = '1';
    setTimeout(()=>{ i.dataset.clicked = ''; }, 1200);
  });
  grid.addEventListener('input', e=>{
    const i = e.target.closest('input'); if(!i) return;
    const ch = (i.value.match(/[a-zA-Z]/g) || []).pop();
    i.value = ch ? ch.toUpperCase() : '';
    i.parentElement.classList.remove('ok', 'bad', 'hint');
    markWords();
    if(allCorrect()){ finish(); return; }
    if(ch && activeWord){
      const cells = wordCells[activeWord.word], at = cells.indexOf(i.dataset.r + ',' + i.dataset.c);
      if(at >= 0 && at < cells.length - 1) focusCell(cells[at + 1], false);
    }
  });
  grid.addEventListener('keydown', e=>{
    const i = e.target.closest('input'); if(!i) return;
    const r = +i.dataset.r, c = +i.dataset.c, key = r + ',' + c;
    const move = (dr, dc)=>{ for(let k=1;k<Math.max(CW_ROWS, CW_COLS);k++){ const nk = (r + dr*k) + ',' + (c + dc*k); if(inputs[nk]){ focusCell(nk, false); return; } } };
    if(e.key === 'Backspace' && !i.value && activeWord){
      const cells = wordCells[activeWord.word], at = cells.indexOf(key);
      if(at > 0){ e.preventDefault(); const pk = cells[at - 1]; inputs[pk].value = ''; inputs[pk].parentElement.classList.remove('ok', 'bad', 'hint'); focusCell(pk, false); markWords(); }
    }else if(e.key === 'ArrowRight'){ e.preventDefault(); dir = 'A'; move(0, 1); }
    else if(e.key === 'ArrowLeft'){ e.preventDefault(); dir = 'A'; move(0, -1); }
    else if(e.key === 'ArrowDown'){ e.preventDefault(); dir = 'D'; move(1, 0); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); dir = 'D'; move(-1, 0); }
    else if(e.key === 'Enter'){ e.preventDefault(); document.getElementById('cwCheck').click(); }
  });
  document.querySelectorAll('.cw-clue').forEach(b=>{
    b.addEventListener('click', ()=>{
      const w = CW_WORDS.find(x=> x.word === b.dataset.clue);
      dir = w.dir; activeWord = w;
      const empty = wordCells[w.word].find(k=> !inputs[k].value) || wordCells[w.word][0];
      focusCell(empty, false);
    });
  });
  document.getElementById('cwCheck').addEventListener('click', ()=>{
    let wrong = 0, filled = 0;
    Object.keys(solution).forEach(k=>{
      const i = inputs[k], cell = i.parentElement;
      cell.classList.remove('ok', 'bad');
      if(!i.value) return;
      filled++;
      if(i.value.toUpperCase() === solution[k]) cell.classList.add('ok');
      else{ cell.classList.add('bad'); wrong++; }
    });
    markWords();
    if(allCorrect()){ finish(); return; }
    const done = CW_WORDS.filter(w=> wordCells[w.word].every(k=> inputs[k].value.toUpperCase() === solution[k])).length;
    fb.className = 'feedback show meh';
    fb.textContent = wrong ? `${done} / ${CW_WORDS.length} words are right. Red letters are not right. Try again.` : `${done} / ${CW_WORDS.length} words are right. Keep going.`;
  });
  document.getElementById('cwHint').addEventListener('click', ()=>{
    const w = activeWord || CW_WORDS[0];
    const k = wordCells[w.word].find(key=> inputs[key].value.toUpperCase() !== solution[key]);
    if(!k){ fb.className = 'feedback show good'; fb.textContent = 'This word is done. Click another picture.'; return; }
    inputs[k].value = solution[k];
    inputs[k].parentElement.classList.remove('bad', 'ok');
    inputs[k].parentElement.classList.add('hint');
    hints++;
    markWords();
    if(allCorrect()) finish(); else focusCell(k, false);
  });
  document.getElementById('cwClear').addEventListener('click', ()=>{
    Object.values(inputs).forEach(i=>{ i.value = ''; i.parentElement.classList.remove('ok', 'bad', 'hint'); });
    hints = 0; finished = false; activeWord = null;
    fb.className = 'feedback'; fb.textContent = '';
    markWords(); highlight();
  });
  const bankEl = document.getElementById('cwBank'), toggle = document.getElementById('cwToggleBank');
  toggle.addEventListener('click', ()=>{
    const hide = !bankEl.classList.contains('hidden');
    bankEl.classList.toggle('hidden', hide);
    toggle.textContent = hide ? 'Show word bank' : 'Hide word bank';
  });
}

/* ===== Section 4: I Like / I Want / Because ===== */
function thingVisual(t){
  return t.img ? `<img class="bc-photo" src="${t.img}" alt="${escAttr(t.text)}" loading="lazy">` : `<div class="bc-ic">${homeIcon(t.icon, 64)}</div>`;
}
function renderS4(){
  const starters = STARTERS.map(s=>`<button class="choice-btn" data-starter="${escAttr(s)}">${s}</button>`).join('');
  const things = THINGS.map(t=>`<div class="big-choice" data-thing="${t.id}">${thingVisual(t)}<div class="bc-lbl">${t.text}</div></div>`).join('');
  const reasons = REASONS.map(r=>`<button class="choice-btn" data-reason="${r.id}">${r.text}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Choose</div>
  <h2 class="section-title">I Like / I Want / Because</h2>
  <p class="section-sub">Build a sentence. Click 1, 2, and 3.</p>
  <div class="panel">
    <h3 class="step-title">1. Choose</h3>
    <div class="choices wrap" id="s4starters">${starters}</div>
    <h3 class="step-title" style="margin-top:20px;">2. Choose</h3>
    <div class="big-choice-grid things-grid" id="s4things">${things}</div>
    <h3 class="step-title" style="margin-top:20px;">3. Say why</h3>
    <div class="choices wrap" id="s4reasons">${reasons}</div>
    <div class="sentence-out" id="s4out"><span class="sentence-hint">Your sentence is here.</span></div>
    ${sayIt('Read your sentence. Say it two times.')}
  </div>
  <div class="panel">
    <h3 class="step-title">Game: Choose the reason</h3>
    <div id="s4quiz"></div>
  </div>`;
}
function wireS4(){
  let starter = null, thing = null, reason = null;
  const built = new Set();
  let withReason = 0, quizScore = null;
  function maybeDone(){
    if(quizScore !== null && built.size >= 3 && withReason >= 1) markActivityComplete('s4', {score:`${quizScore}/${WHY_ITEMS.length}`, answers:[...built].join(' | ')});
  }
  function update(){
    if(!starter || !thing) return;
    const t = THINGS.find(x=>x.id === thing);
    const r = reason ? REASONS.find(x=>x.id === reason).text : null;
    const sentence = r ? `${starter} ${t.text} ${r}` : `${starter} ${t.text}.`;
    const out = document.getElementById('s4out');
    out.innerHTML = `<span class="sentence-main">${starter}</span><span class="sentence-plus">+</span><span class="sentence-main thing">${t.text}</span>${r ? `<span class="sentence-plus">+</span><span class="sentence-main why">${r}</span>` : ''} ${listenBtn(sentence)}`;
    bindSay(out);
    if(!built.has(sentence)){ built.add(sentence); if(r) withReason++; }
    maybeDone();
  }
  function bindPick(sel, attr, set){
    document.querySelector(sel).addEventListener('click', e=>{
      const b = e.target.closest(`[${attr}]`); if(!b) return;
      document.querySelectorAll(`${sel} > *`).forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel');
      set(b.getAttribute(attr));
      update();
    });
  }
  bindPick('#s4starters', 'data-starter', v=>{ starter = v; });
  bindPick('#s4things', 'data-thing', v=>{ thing = v; });
  bindPick('#s4reasons', 'data-reason', v=>{ reason = v; });
  runQuiz({
    el: document.getElementById('s4quiz'),
    rounds: shuffle(WHY_ITEMS),
    render: r=>{
      const vis = r.img ? `<img class="quiz-photo" src="${r.img}" alt="">` : homeIcon(r.icon, 110);
      return `<div class="quiz-visual">${vis}</div>
        <p class="quiz-q" style="text-align:center;font-size:19px;"><b>${r.stem}</b> ...</p>
        <div class="choices">${shuffle(r.opts).map(o=>`<button class="choice-btn" data-ans="${o}">${REASONS.find(x=>x.id === o).text}</button>`).join('')}</div>`;
    },
    isCorrect: (r,v)=> v === r.answer,
    extra: r=>{
      const full = `${r.stem} ${REASONS.find(x=>x.id === r.answer).text}`;
      return `<div class="rule-box" style="margin-top:12px;"><b>${full}</b><p style="margin-top:8px;">${listenBtn(full, 'Listen and say it')}</p></div>`;
    },
    onDone: s=>{ quizScore = s; maybeDone(); }
  });
}

/* ===== Section 5: Client Mina (worked example, teacher leads) ===== */
function rulesPanel(){
  return `<div class="panel rules">
    <h3 class="step-title">Rules</h3>
    <p class="rule-line"><b>1.</b> Choose your rooms. Every home needs a bedroom, a bathroom, and a kitchen.</p>
    <p class="rule-line"><b>2.</b> The first bedroom, the first bathroom, and a small kitchen are free. Other things cost coins.</p>
    <div class="cost-grid">${COST_CHIPS.map(c=>`<div class="cost-chip">${homeIcon(c.icon, 34)}<span>${c.label}</span><span class="cost"><span class="coin"></span>${c.cost}</span></div>`).join('')}</div>
    <p class="rule-line"><b>3.</b> You cannot spend more coins than you have.</p>
  </div>`;
}
function renderS5(){
  return `
  <div class="section-eyebrow">Section 5 · Client</div>
  <h2 class="section-title">Client: Mina</h2>
  <p class="section-sub">You are a home designer. Help Mina. Your teacher shows you how.</p>
  ${rulesPanel()}
  <div id="s5client"></div>`;
}
function wireS5(){
  mountClient(document.getElementById('s5client'), CLIENTS.mina, 's5', {});
}

/* ===== Section 7: Design Your Perfect Home (own coins) ===== */
function renderS7(){
  return `
  <div class="section-eyebrow">Section 6 · Design</div>
  <h2 class="section-title">Design Your Perfect Home</h2>
  <p class="section-sub">Now it is your home. You have ${BUDGET_OWN} coins. Click your choices.</p>
  <div id="s7design"></div>`;
}
function wireS7(){
  loadMyHome();
  mountDesigner(document.getElementById('s7design'), {
    budget: BUDGET_OWN, home: myHome, listen: true,
    onUpdate: info=>{
      saveMyHome();
      if(homeIsReady(myHome)) markActivityComplete('s7', {completionStatus:'completed', score:`${info.cost}/${BUDGET_OWN} coins`, answers: homeLines(myHome).map(l=>l.text).join(', ')});
    }
  });
}

/* ===== Section 8: Write About Your Home ===== */
function modelSentences(h){
  const plural = n => n > 1 ? 's' : '';
  const extras = BUILD_ROWS.filter(r=> r.type === 'toggle' && r.id !== 'near' && h[r.id]).map(r=> r.label.toLowerCase());
  const out = ['This is my perfect home.'];
  out.push(`It has ${NUMBER_WORDS[h.bedrooms]} bedroom${plural(h.bedrooms)} and ${NUMBER_WORDS[h.bathrooms]} bathroom${plural(h.bathrooms)}.`);
  out.push(`It has a ${h.kitchen} kitchen.`);
  if(extras.length) out.push(`It also has ${listJoin(extras.map(e=> 'a ' + e))}.`);
  if(h.near) out.push('It is near my university.');
  return out;
}
function renderS8(){
  const checks = WRITE_CHECKS.map((c,i)=>`<button class="choice-btn multi" data-wcheck="${i}"><span class="letter">✓</span> ${c}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 7 · Write</div>
  <h2 class="section-title">Write About Your Home</h2>
  <p class="section-sub">Use your Design Your Home choices. Fill in Part 2 of your worksheet. Then write about your dream home in Part 3.</p>
  <div class="panel" id="s8plan"></div>
  <div class="panel">
    <h3 class="step-title">Write 6 sentences about your dream home</h3>
    <ol class="speech-list">${WRITE_FRAMES.map(f=>`<li><span>${f}</span></li>`).join('')}</ol>
    <button type="button" class="reveal-btn" id="s8model">Show my model</button>
    <div id="s8modelbox"></div>
  </div>
  <div class="panel">
    <h3 class="step-title">Check your writing</h3>
    <div class="choices">${checks}</div>
    <div class="feedback" id="s8fb"></div>
  </div>`;
}
function wireS8(){
  loadMyHome();
  const plan = document.getElementById('s8plan');
  const ready = homeIsReady(myHome);
  if(ready){
    const lines = homeLines(myHome);
    plan.innerHTML = `<h3 class="step-title">My dream home plan</h3>
      <p class="section-sub" style="margin:6px 0 12px;">Coins used: <b>${homeCost(myHome)} / ${BUDGET_OWN}</b>. Copy your choices into Part 2 of your worksheet.</p>
      <ul class="home-lines">${lines.map(l=>`<li>${homeIcon(l.ic, 30)}<span>${l.text}</span></li>`).join('')}</ul>`;
  }else{
    plan.innerHTML = `<h3 class="step-title">My dream home plan</h3>
      <p class="section-sub" style="margin:6px 0 12px;">First, design your home.</p>
      <button class="startbtn" id="s8go">Go to Design Your Home →</button>`;
    document.getElementById('s8go').addEventListener('click', ()=> goToKey('s7'));
  }
  document.getElementById('s8model').addEventListener('click', ()=>{
    const box = document.getElementById('s8modelbox');
    if(!homeIsReady(myHome)){ box.innerHTML = '<p class="section-sub" style="margin-top:10px;">First, design your home.</p>'; return; }
    const lines = modelSentences(myHome);
    box.innerHTML = `<div class="rule-box" style="margin-top:14px;"><b>My model</b>
      <ol class="speech-list" style="margin-top:8px;">${lines.map(l=>`<li><span>${l}</span> ${listenBtn(l)}</li>`).join('')}</ol>
      <p style="margin-top:8px;">Now write sentences 5 and 6 with your own ideas.</p></div>`;
    bindSay(box);
  });
  const done = new Set();
  document.querySelectorAll('#app [data-wcheck]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const i = +b.dataset.wcheck;
      b.classList.toggle('sel');
      if(b.classList.contains('sel')) done.add(i); else done.delete(i);
      const fb = document.getElementById('s8fb');
      if(done.size === WRITE_CHECKS.length){
        fb.className = 'feedback show good';
        fb.textContent = 'Good writing! Go to the next section.';
        markActivityComplete('s8', {completionStatus:'completed', answers:`checklist ${done.size}/${WRITE_CHECKS.length}`});
      }else{
        fb.className = 'feedback';
      }
    });
  });
}

/* ===== Section 9: Speaking Practice ===== */
function revealList(containerId, lines, onFinish){
  const el = document.getElementById(containerId);
  let shown = 0;
  function draw(){
    el.innerHTML = `<ol class="speech-list">${lines.slice(0, shown).map(l=>`<li><span>${l}</span> ${listenBtn(l)}</li>`).join('')}</ol>
      <div class="speech-actions">
        ${shown < lines.length ? `<button class="startbtn" data-practice>${shown === 0 ? 'Practice' : 'Next sentence'} →</button>` : `<button class="reveal-btn" data-all>${icon('headphones',{size:14})} Listen to all</button>`}
        <span class="speech-count">${shown} / ${lines.length}</span>
      </div>`;
    bindSay(el);
    const p = el.querySelector('[data-practice]');
    if(p) p.addEventListener('click', ()=>{ shown++; draw(); if(shown === lines.length && onFinish) onFinish(); });
    const a = el.querySelector('[data-all]');
    if(a) a.addEventListener('click', ()=> speak(lines.join(' ')));
  }
  draw();
}
function renderS9(){
  return `
  <div class="section-eyebrow">Section 8 · Speak</div>
  <h2 class="section-title">Speaking Practice</h2>
  <p class="section-sub">Listen. Say it. One sentence at a time.</p>
  <div class="panel">
    <h3 class="step-title">Model: Listen and say</h3>
    <div id="s9model"></div>
  </div>
  <div class="panel">
    <h3 class="step-title">Your turn: Make your script</h3>
    <div id="s9mine"></div>
  </div>`;
}
function wireS9(){
  loadMyHome();
  let modelDone = false, mineDone = false;
  function maybeDone(){ if(modelDone && mineDone) markActivityComplete('s9', {completionStatus:'completed'}); }
  revealList('s9model', MODEL_SPEECH, ()=>{ modelDone = true; maybeDone(); });
  const mine = document.getElementById('s9mine');
  if(!homeIsReady(myHome)){
    mine.innerHTML = `<p class="section-sub">First, design your home.</p><button class="startbtn" id="s9go">Go to Design Your Home →</button>`;
    document.getElementById('s9go').addEventListener('click', ()=> goToKey('s7'));
    return;
  }
  const rooms = ROOMS.map(r=>`<button class="choice-btn" data-fav="${escAttr(r.word)}">${r.word}</button>`).join('');
  const reasons = FAVORITE_REASONS.map(r=>`<button class="choice-btn" data-fr="${r}">${r}</button>`).join('');
  mine.innerHTML = `<p class="section-sub">My favorite room is the ...</p><div class="choices wrap" id="s9rooms">${rooms}</div>
    <p class="section-sub" style="margin-top:14px;">I like it because it is ...</p><div class="choices wrap" id="s9reasons">${reasons}</div>
    <div id="s9script" style="margin-top:18px;"></div>`;
  let fav = null, fr = null;
  function build(){
    if(!fav || !fr) return;
    const lines = ['Hello.', 'This is my perfect home.'].concat(homeLines(myHome).map(l=>l.say), [`My favorite room is my ${fav}.`, `I like it because it is ${fr}.`, 'Thank you.']);
    revealList('s9script', lines, ()=>{ mineDone = true; maybeDone(); });
  }
  document.getElementById('s9rooms').addEventListener('click', e=>{
    const b = e.target.closest('[data-fav]'); if(!b) return;
    document.querySelectorAll('#s9rooms .choice-btn').forEach(x=>x.classList.remove('sel'));
    b.classList.add('sel'); fav = b.dataset.fav; build();
  });
  document.getElementById('s9reasons').addEventListener('click', e=>{
    const b = e.target.closest('[data-fr]'); if(!b) return;
    document.querySelectorAll('#s9reasons .choice-btn').forEach(x=>x.classList.remove('sel'));
    b.classList.add('sel'); fr = b.dataset.fr; build();
  });
}

/* ===== Section 10: Final Presentation Preparation ===== */
function renderS10(){
  const steps = PRESENT_STEPS.map((s,i)=>`
    <div class="present-step" data-pstep="${i}">
      <div class="present-num">${i + 1}</div>
      <div class="present-ic">${s.ic}</div>
      <div class="present-text"><b>${s.title}</b><span>${s.text}</span></div>
      <div class="present-check" aria-hidden="true">✓</div>
    </div>`).join('');
  const can = CAN_DO.map((c,i)=>`<button class="choice-btn multi" data-can="${i}"><span class="letter">✓</span> ${c}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 9 · Present</div>
  <h2 class="section-title">My Perfect Home</h2>
  <p class="section-sub">This is your final presentation. You can do it. Click each step when it is done.</p>
  <div class="panel">${steps}</div>
  <div class="panel">
    <h3 class="step-title">I can ...</h3>
    <div class="choices">${can}</div>
    <div class="feedback" id="s10fb"></div>
  </div>
  <div class="panel">
    <div class="rule-box"><b>Next: Unit 11</b><p style="margin-top:8px;">Use your perfect home in the Unit 11 project: Design a Home and Give a Presentation.</p></div>
  </div>`;
}
function wireS10(){
  const doneSteps = new Set(), can = new Set();
  function check(){
    if(doneSteps.size === PRESENT_STEPS.length){
      const fb = document.getElementById('s10fb');
      fb.className = 'feedback show good';
      fb.textContent = 'You are ready!';
      markActivityComplete('s10', {completionStatus:'completed', answers:`ready steps: ${doneSteps.size}/${PRESENT_STEPS.length}, can-do: ${can.size}/${CAN_DO.length}`});
    }
  }
  document.querySelectorAll('#app [data-pstep]').forEach(c=>{
    c.addEventListener('click', ()=>{
      const i = +c.dataset.pstep;
      if(doneSteps.has(i)){ doneSteps.delete(i); c.classList.remove('done'); }
      else{ doneSteps.add(i); c.classList.add('done'); }
      check();
    });
  });
  document.querySelectorAll('#app [data-can]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const i = +b.dataset.can;
      b.classList.toggle('sel');
      if(b.classList.contains('sel')) can.add(i); else can.delete(i);
    });
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 10 COMPLETE</div>
    <h1>You can talk about <span>your perfect home.</span></h1>
    <p>Practice your script. Next: Unit 11, Design a Home and Give a Presentation.</p>
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
  {r:renderS7, w:wireS7},
  {r:renderS8, w:wireS8},
  {r:renderS9, w:wireS9},
  {r:renderS10, w:wireS10},
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
  activeDesigner = null;
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
document.getElementById('btnReset').addEventListener('click', ()=>{
  if(SECTION_META[current].key === 's7'){
    myHome = freshHome();
    try{ localStorage.removeItem(MY_HOME_KEY); }catch(e){}
  }
  renderAll();
});

wireCheckin();
if(restoreCheckinState()){
  document.getElementById('checkinGate').style.display='none';
}
renderAll();
