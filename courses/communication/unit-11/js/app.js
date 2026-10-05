/* ===================== APP STATE / ROUTER =====================
   Same router/progress/voice/checkin/deep-link architecture as Units 8 to 10
   (copied, unchanged in shape). Unit 11 plugs into the existing one. */
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8'];

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
const CHECKIN_STORAGE_KEY = 'efc_u11_checkin';
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
function homeIcon(id, size, inner){
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
    'clue-safe': parts.safe + `<rect x="60" y="56" width="30" height="26" rx="4" fill="${Y}" stroke="${N}" stroke-width="3.5"/><path d="M66 56 V48 A9 9 0 0 1 84 48 V56" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round"/><circle cx="75" cy="68" r="3.5" fill="${N}"/>`,
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
  if(inner) return parts[id] || '';
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
      ? {ic:'near', text:'near university', say:'It is near our university.'}
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

let activeDesigners = [];
app.addEventListener('click', e=>{
  const reset = e.target.closest('[data-reset]');
  if(reset){ const d = activeDesigners.find(x=> x.el.contains(reset)); if(d) d.reset(reset); return; }
  const row = e.target.closest('[data-row]');
  if(row){ const d = activeDesigners.find(x=> x.el.contains(row)); if(d) d.pick(row); }
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
      <div class="my-home-title">${client ? 'HOME FOR ' + client.name.replace('The ', '').toUpperCase() : 'OUR DREAM HOME'}</div>
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
  activeDesigners = activeDesigners.filter(x=> x.el !== el && document.body.contains(x.el));
  activeDesigners.push({el, pick, reset: resetAll});
  update();
}


/* ===== Preposition pictures: a ball and a box ===== */
function prepDiagram(id){
  const N='#163B65', R='#E85D75', BX='#C99A5B', BL='#DDB77E';
  const ball = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${R}" stroke="${N}" stroke-width="3"/><path d="M${cx - r * .55} ${cy - r * .35} Q${cx} ${cy - r * .9} ${cx + r * .5} ${cy - r * .45}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`;
  const box = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${BX}" stroke="${N}" stroke-width="3"/><rect x="${x}" y="${y}" width="${w}" height="10" fill="${BL}" stroke="${N}" stroke-width="3"/>`;
  let inner = '';
  if(id === 'in') inner = ball(120, 52, 15) + box(85, 58, 70, 42);
  if(id === 'on') inner = box(85, 56, 70, 44) + ball(120, 40, 16);
  if(id === 'next') inner = box(55, 52, 70, 48) + ball(168, 84, 16);
  if(id === 'between') inner = box(25, 52, 62, 48) + box(153, 52, 62, 48) + ball(120, 84, 16);
  if(id === 'behind') inner = ball(148, 56, 17) + box(80, 48, 70, 52);
  if(id === 'front') inner = box(85, 36, 70, 48) + ball(122, 88, 17);
  return `<svg viewBox="0 0 240 118" class="prep-svg" role="img" aria-label="${escAttr(PREPS.find(p=>p.id === id).say)}"><line x1="8" y1="102" x2="232" y2="102" stroke="#9AA8B5" stroke-width="3" stroke-linecap="round"/>${inner}</svg>`;
}

/* ===== Place icons for the neighborhood map ===== */
function placeIcon(id, size){
  size = size || 64;
  const N='#163B65', T='#0F766E', TL='#3FA89E', O='#D9740F', L='#EAF0F6', G='#4CA36B', B='#8B5E3C', Y='#F5C16C', W='#6EC1E4', R='#D9534F';
  const parts = {
    park: `<g transform="translate(2 4) scale(.72)">${homeIcon('tree', 100, true)}</g><g transform="translate(34 40) scale(.62)">${homeIcon('bench', 100, true)}</g><rect x="4" y="88" width="92" height="6" rx="3" fill="#7BC47F"/>`,
    coffee: `<path d="M18 38 H70 V62 Q70 82 50 82 H38 Q18 82 18 62Z" fill="#fff" stroke="${N}" stroke-width="4" stroke-linejoin="round"/><path d="M70 46 H78 Q88 46 88 56 Q88 66 78 66 H68" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round"/><rect x="24" y="44" width="40" height="10" fill="${B}"/><rect x="10" y="84" width="68" height="6" rx="3" fill="${N}"/><path d="M32 30 q-5 -6 0 -12 M46 30 q-5 -6 0 -12 M58 30 q-5 -6 0 -12" fill="none" stroke="${N}" stroke-width="3.5" stroke-linecap="round"/>`,
    bank: `<path d="M8 36 L50 10 L92 36Z" fill="${T}" stroke="${N}" stroke-width="3.5" stroke-linejoin="round"/><rect x="12" y="38" width="76" height="6" fill="${N}"/><g fill="${L}" stroke="${N}" stroke-width="3"><rect x="18" y="46" width="9" height="32"/><rect x="38" y="46" width="9" height="32"/><rect x="58" y="46" width="9" height="32"/><rect x="76" y="46" width="9" height="32"/></g><rect x="8" y="80" width="84" height="10" rx="2" fill="${N}"/><circle cx="50" cy="26" r="6" fill="${Y}" stroke="${N}" stroke-width="2.5"/>`,
    university: `<path d="M50 14 L94 34 L50 54 L6 34Z" fill="${N}"/><path d="M26 46 V62 Q50 76 74 62 V46 L50 58Z" fill="${T}" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><path d="M90 36 V62" stroke="${O}" stroke-width="4" stroke-linecap="round"/><circle cx="90" cy="66" r="5" fill="${O}"/><rect x="14" y="82" width="72" height="8" rx="2" fill="${N}"/>`,
    busstop: `<rect x="14" y="30" width="72" height="44" rx="9" fill="${Y}" stroke="${N}" stroke-width="4"/><rect x="22" y="38" width="22" height="16" rx="2" fill="${W}" stroke="${N}" stroke-width="2.5"/><rect x="50" y="38" width="22" height="16" rx="2" fill="${W}" stroke="${N}" stroke-width="2.5"/><rect x="14" y="58" width="72" height="5" fill="${N}"/><circle cx="32" cy="76" r="8" fill="${N}"/><circle cx="68" cy="76" r="8" fill="${N}"/><circle cx="32" cy="76" r="3" fill="#fff"/><circle cx="68" cy="76" r="3" fill="#fff"/><rect x="86" y="14" width="5" height="76" fill="${N}"/><rect x="78" y="8" width="22" height="14" rx="3" fill="${R}"/>`,
    supermarket: `<path d="M6 22 H22 L34 66 H80 L90 36 H26" fill="none" stroke="${N}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 40 H88 L80 64 H34Z" fill="${G}" opacity=".85"/><circle cx="40" cy="80" r="7" fill="${N}"/><circle cx="74" cy="80" r="7" fill="${N}"/>`,
    mall: `<rect x="8" y="28" width="84" height="58" rx="3" fill="${L}" stroke="${N}" stroke-width="4"/><path d="M6 28 H94 V40 H6Z" fill="${O}" stroke="${N}" stroke-width="3"/><g stroke="${N}" stroke-width="2"><path d="M20 28 V40 M34 28 V40 M48 28 V40 M62 28 V40 M76 28 V40"/></g><rect x="16" y="50" width="18" height="16" fill="${W}" stroke="${N}" stroke-width="2.5"/><rect x="66" y="50" width="18" height="16" fill="${W}" stroke="${N}" stroke-width="2.5"/><rect x="40" y="52" width="20" height="34" fill="${B}" stroke="${N}" stroke-width="2.5"/><rect x="30" y="10" width="40" height="14" rx="3" fill="${T}"/><circle cx="40" cy="17" r="3" fill="#fff"/><circle cx="50" cy="17" r="3" fill="#fff"/><circle cx="60" cy="17" r="3" fill="#fff"/>`,
    hospital: `<rect x="12" y="24" width="76" height="64" rx="4" fill="#fff" stroke="${N}" stroke-width="4"/><path d="M42 36 H58 V48 H70 V62 H58 V74 H42 V62 H30 V48 H42Z" fill="${R}"/><rect x="40" y="76" width="20" height="12" fill="${N}"/><rect x="18" y="30" width="10" height="8" fill="${W}"/><rect x="72" y="30" width="10" height="8" fill="${W}"/><rect x="8" y="88" width="84" height="5" rx="2" fill="${N}"/>`
  };
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${parts[id] || ''}</svg>`;
}

/* ===== Zoom: a big picture with the word, no voice ===== */
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
        ${it.img ? `<img src="${it.img}" alt="${escAttr(it.word)}">` : `<div class="zoom-icon">${it.svg}</div>`}
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
function capFirst(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function bindKeys(root, sel, fn){
  root.querySelectorAll(sel).forEach(c=>{
    c.addEventListener('click', ()=> fn(c));
    c.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fn(c); } });
  });
}

/* ===== The group's home (saved on this device for today) ===== */
let groupHome = freshHome();
function loadGroupHome(){
  try{
    const saved = JSON.parse(localStorage.getItem(GROUP_HOME_KEY));
    if(saved && saved.date === todayStr() && saved.v === 1) groupHome = Object.assign(freshHome(), saved.home);
  }catch(e){}
}
function saveGroupHome(){
  try{ localStorage.setItem(GROUP_HOME_KEY, JSON.stringify({date: todayStr(), v:1, home: groupHome})); }catch(e){}
}
function planRoomsFor(h){ return PLAN_ROOMS.filter(r=> r.has(h)); }
let groupPlan = [null, null, null, null, null, null];
function loadGroupPlan(){
  try{
    const saved = JSON.parse(localStorage.getItem(GROUP_PLAN_KEY));
    if(saved && saved.date === todayStr() && saved.v === 1 && Array.isArray(saved.plan)){
      const ok = planRoomsFor(groupHome).map(r=>r.id);
      groupPlan = saved.plan.slice(0, 6).map(id=> ok.includes(id) ? id : null);
      while(groupPlan.length < 6) groupPlan.push(null);
    }
  }catch(e){}
}
function saveGroupPlan(){
  try{ localStorage.setItem(GROUP_PLAN_KEY, JSON.stringify({date: todayStr(), v:1, plan: groupPlan})); }catch(e){}
}
function planSentences(plan){
  const name = id => PLAN_ROOMS.find(r=>r.id === id).the;
  const between = [], across = [], next = [];
  [[0,1,2],[3,4,5]].forEach(row=>{
    const [a,b,c] = row.map(i=> plan[i]);
    if(a && b && c) between.push(`${capFirst(name(b))} is between ${name(a)} and ${name(c)}.`);
    if(a && b) next.push(`${capFirst(name(a))} is next to ${name(b)}.`);
    if(b && c) next.push(`${capFirst(name(b))} is next to ${name(c)}.`);
  });
  [0,1,2].forEach(i=>{ if(plan[i] && plan[i + 3]) across.push(`${capFirst(name(plan[i]))} is across from ${name(plan[i + 3])}.`); });
  const out = between.slice(0, 1).concat(across.slice(0, 2));
  next.forEach(s=>{ if(out.length < 5) out.push(s); });
  return out;
}
function planIsDone(){
  const rooms = planRoomsFor(groupHome);
  return homeIsReady(groupHome) && rooms.length > 0 && rooms.every(r=> groupPlan.includes(r.id)) && planSentences(groupPlan).length >= 2;
}
function needStepHtml(msg, key, label){
  return `<div class="panel"><p class="section-sub">${msg}</p><button class="startbtn" data-goto="${key}">${label} →</button></div>`;
}
function wireGoto(){
  document.querySelectorAll('#app [data-goto]').forEach(b=> b.addEventListener('click', ()=> goToKey(b.dataset.goto)));
}

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover cover-photo">
    <div class="cover-text">
      <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
      <h1>Design a <span>Home</span></h1>
      <p>Unit 11: Architecture. Work with your group. Plan one home. Present it to the class.</p>
      <div class="signdock">
        <div class="signchip"><span class="arrow">→</span> Where is it?</div>
        <div class="signchip"><span class="arrow">→</span> Our neighborhood</div>
        <div class="signchip"><span class="arrow">→</span> Agree and disagree</div>
        <div class="signchip"><span class="arrow">→</span> Our dream home</div>
      </div>
      <button class="startbtn" onclick="goNext()">Let's begin →</button>
    </div>
    <img class="cover-img" src="${IMG}cover.jpg" alt="A beautiful modern home with warm lights at sunset">
  </div>`;
}

/* ===== Section 1: Review ===== */
function renderS1(){
  return `
  <div class="section-eyebrow">Section 1 · Review</div>
  <h2 class="section-title">Review: Rooms and Features</h2>
  <p class="section-sub">You know these words from Unit 10. Look. Click the word.</p>
  <div class="panel" id="s1quiz"></div>
  <div class="panel" id="s1say" style="display:none;"></div>`;
}
function wireS1(){
  let score = 0;
  runQuiz({
    el: document.getElementById('s1quiz'),
    rounds: shuffle(REVIEW_ROUNDS),
    render: r=>{
      const room = ROOMS.find(x=>x.id === r.id);
      const pic = room && room.img
        ? `<img class="quiz-photo" src="${room.img}" alt="">`
        : `<div class="quiz-icon">${homeIcon(r.id, 150)}</div>`;
      return `<h3 class="quiz-q">What is it?</h3><div class="quiz-visual">${pic}</div>
        <div class="choices wrap">${shuffle(r.opts).map(o=>`<button type="button" class="choice-btn" data-ans="${escAttr(o)}">${o}</button>`).join('')}</div>`;
    },
    isCorrect: (r,v)=> v === r.answer,
    onDone: s=>{
      score = s;
      const box = document.getElementById('s1say');
      box.style.display = '';
      box.innerHTML = `<h3 class="step-title">Say it</h3>
        <p class="section-sub" style="margin:4px 0 10px;">Say these sentences to your group.</p>
        <ol class="speech-list">${REVIEW_SAY.map(l=>`<li><span>${l}</span> ${listenBtn(l)}</li>`).join('')}</ol>`;
      bindSay(box);
      markActivityComplete('s1', {completionStatus:'completed', score:`${score}/${REVIEW_ROUNDS.length}`});
    }
  });
}

/* ===== Section 2: Where Is It? ===== */
function renderS2(){
  const cards = PREPS.map(p=>`<div class="prep-card" data-prep="${p.id}" role="button" tabindex="0" aria-label="Zoom in: ${p.word}">
      ${prepDiagram(p.id)}<div class="prep-word">${p.word}</div>
      <div class="prep-say">${p.say}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · Learn</div>
  <h2 class="section-title">Where Is It?</h2>
  <p class="section-sub">Look at the ball. Where is it? Click a picture to zoom in.</p>
  <div class="panel"><div class="prep-grid">${cards}</div></div>
  <div class="panel">
    <h3 class="step-title">Say it</h3>
    <ol class="speech-list">${PREPS.map(p=>`<li><span>${p.say}</span> ${listenBtn(p.say)}</li>`).join('')}</ol>
  </div>
  <div class="panel" id="s2quiz"></div>`;
}
function wireS2(){
  bindSay(document.getElementById('app'));
  const items = PREPS.map(p=>({word:p.word, svg:prepDiagram(p.id)}));
  bindKeys(document, '#app [data-prep]', c=> openZoom(items, PREPS.findIndex(p=>p.id === c.dataset.prep)));
  const rounds = PREP_ROUNDS.map(id=>({id, answer: PREPS.find(p=>p.id === id).word}));
  runQuiz({
    el: document.getElementById('s2quiz'),
    rounds,
    render: r=>{
      const others = shuffle(PREP_OPTIONS.filter(o=> o !== r.answer)).slice(0, 2);
      const opts = shuffle([r.answer].concat(others));
      const noun = r.id === 'between' ? 'boxes' : 'box';
      return `<h3 class="quiz-q">The ball is ___ the ${noun}.</h3><div class="prep-quiz-pic">${prepDiagram(r.id)}</div>
        <div class="choices wrap">${opts.map(o=>`<button type="button" class="choice-btn" data-ans="${escAttr(o)}">${o}</button>`).join('')}</div>`;
    },
    isCorrect: (r,v)=> v === r.answer,
    extra: r=>{
      const p = PREPS.find(x=>x.id === r.id);
      return `<div class="rule-box" style="margin-top:12px;"><b>${p.say}</b><p style="margin-top:8px;">${listenBtn(p.say, 'Listen and say it')}</p></div>`;
    },
    onDone: s=> markActivityComplete('s2', {completionStatus:'completed', score:`${s}/${rounds.length}`})
  });
}

/* ===== Section 3: Our Neighborhood ===== */
function placeById(id){ return PLACES.find(p=>p.id === id); }
function mapHtml(hl, clickable){
  const tile = id=>{
    const p = placeById(id);
    return `<div class="map-place${hl === id ? ' hl' : ''}"${clickable ? ` data-place="${id}" role="button" tabindex="0" aria-label="${p.word}"` : ''}>
      <span class="map-ic">${placeIcon(id, 56)}</span><span class="map-name">${p.word}</span></div>`;
  };
  return `<div class="street-map">
    <div class="map-row">${MAP_TOP.map(tile).join('')}</div>
    <div class="map-road" aria-hidden="true"><span>Main Street</span></div>
    <div class="map-row">${MAP_BOTTOM.map(tile).join('')}</div>
  </div>`;
}
function placeFacts(id){
  const nm = x=> placeById(x).the;
  const top = MAP_TOP.indexOf(id), bottom = MAP_BOTTOM.indexOf(id);
  const row = top >= 0 ? MAP_TOP : MAP_BOTTOM, idx = top >= 0 ? top : bottom;
  const opposite = (top >= 0 ? MAP_BOTTOM : MAP_TOP)[idx];
  const facts = [`${capFirst(nm(id))} is across from ${nm(opposite)}.`];
  const left = row[idx - 1], right = row[idx + 1];
  if(left && right) facts.push(`${capFirst(nm(id))} is between ${nm(left)} and ${nm(right)}.`);
  else facts.push(`${capFirst(nm(id))} is next to ${nm(left || right)}.`);
  return facts;
}
function renderS3(){
  const cards = PLACES.map(p=> `<div class="big-choice" data-learnplace="${p.id}" role="button" tabindex="0" aria-label="Zoom in: ${p.word}"><div class="bc-ic">${placeIcon(p.id, 80)}</div><div class="bc-lbl">${p.word}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Learn</div>
  <h2 class="section-title">Our Neighborhood</h2>
  <p class="section-sub">A good home is near good places. Look. Click a picture to zoom in.</p>
  <div class="panel"><div class="big-choice-grid place-grid">${cards}</div></div>
  <div class="panel">
    <h3 class="step-title">Look at the map</h3>
    <p class="section-sub" style="margin:4px 0 12px;">Click a place. Read where it is.</p>
    ${mapHtml(null, true)}
    <div class="map-facts" id="s3facts" aria-live="polite"><p class="sentence-hint">Click a place on the map.</p></div>
  </div>
  <div class="panel" id="s3quiz"></div>
  <div class="panel" id="s3say" style="display:none;"></div>`;
}
function wireS3(){
  const items = PLACES.map(p=>({word:p.word, svg:placeIcon(p.id, 260)}));
  bindKeys(document, '#app [data-learnplace]', c=> openZoom(items, PLACES.findIndex(p=>p.id === c.dataset.learnplace)));
  const facts = document.getElementById('s3facts');
  bindKeys(document.querySelector('#app .street-map'), '[data-place]', c=>{
    document.querySelectorAll('#app .street-map .map-place').forEach(x=> x.classList.remove('hl'));
    c.classList.add('hl');
    facts.innerHTML = `<h4 class="map-facts-title">${capFirst(placeById(c.dataset.place).the)}</h4><ul class="say-list">${placeFacts(c.dataset.place).map(f=>`<li><span>${f}</span> ${listenBtn(f)}</li>`).join('')}</ul>`;
    bindSay(facts);
  });
  const rounds = shuffle(MAP_ROUNDS);
  runQuiz({
    el: document.getElementById('s3quiz'),
    rounds,
    render: r=>{
      const target = PLACES.find(p=> r.q.toLowerCase().includes(p.word.toLowerCase()));
      return `<h3 class="quiz-q">${r.q}</h3>${mapHtml(target ? target.id : null, false)}
        <div class="choices">${shuffle([r.answer].concat(r.wrong)).map(o=>`<button type="button" class="choice-btn" data-ans="${escAttr(o)}">${o}</button>`).join('')}</div>`;
    },
    isCorrect: (r,v)=> v === r.answer,
    onDone: s=>{
      const box = document.getElementById('s3say');
      box.style.display = '';
      box.innerHTML = `<h3 class="step-title">Say it</h3>
        <p class="section-sub" style="margin:4px 0 10px;">Look at the map. Say these sentences to your group.</p>
        <ol class="speech-list">${MAP_MODEL.map(l=>`<li><span>${l}</span> ${listenBtn(l)}</li>`).join('')}</ol>`;
      bindSay(box);
      markActivityComplete('s3', {completionStatus:'completed', score:`${s}/${rounds.length}`});
    }
  });
}

/* ===== Section 4: Agree and Disagree ===== */
function renderS4(){
  const col = (title, cls, phrases) => `<div class="agree-col ${cls}"><h3 class="step-title">${title}</h3>
    <ul class="say-list">${phrases.map(p=>`<li><span>${p}</span> ${listenBtn(p)}</li>`).join('')}</ul></div>`;
  return `
  <div class="section-eyebrow">Section 4 · Say</div>
  <h2 class="section-title">Agree and Disagree</h2>
  <p class="section-sub">In a group, you do not always think the same. Be polite. Say why.</p>
  <div class="panel"><div class="agree-grid">
    ${col('Agree', 'yes', AGREE_PHRASES)}
    ${col('Disagree', 'no', DISAGREE_PHRASES)}
  </div>
  <div class="rule-box" style="margin-top:14px;"><b>Say why</b><p style="margin-top:6px;">I do not agree. A pool is expensive.</p><p>I agree. A garden is beautiful.</p></div></div>
  <div class="panel" id="s4quiz"></div>
  <div class="panel" id="s4cards" style="display:none;"></div>`;
}
function wireS4(){
  bindSay(document.getElementById('app'));
  const rounds = shuffle(AGREE_ROUNDS);
  runQuiz({
    el: document.getElementById('s4quiz'),
    rounds,
    render: r=>`<h3 class="quiz-q">Your friend says:</h3>
      <div class="say-bubble"><span class="bubble-ic">${homeIcon(r.icon, 56)}</span><span class="bubble-text">"${r.idea}"</span></div>
      <p class="section-sub" style="margin:10px 0 12px;">${r.think} What do you say?</p>
      <div class="choices">${shuffle([r.answer].concat(r.wrong)).map(o=>`<button type="button" class="choice-btn" data-ans="${escAttr(o)}">${o}</button>`).join('')}</div>`,
    isCorrect: (r,v)=> v === r.answer,
    extra: r=>`<div class="rule-box" style="margin-top:12px;"><b>${r.answer}</b><p style="margin-top:8px;">${listenBtn(r.answer, 'Listen and say it')}</p></div>`,
    onDone: s=>{
      markActivityComplete('s4', {completionStatus:'completed', score:`${s}/${rounds.length}`});
      const box = document.getElementById('s4cards');
      box.style.display = '';
      box.innerHTML = `<h3 class="step-title">Practice with your group</h3>
        <p class="section-sub" style="margin:4px 0 12px;">Click an idea. One student says it. The group says agree or disagree. Say why.</p>
        <div class="idea-row">${IDEA_CARDS.map((c,i)=>`<button type="button" class="idea-card" data-idea="${i}">${homeIcon(c.icon, 56)}<span>${c.text}</span></button>`).join('')}</div>
        <div class="idea-out" id="s4out"></div>`;
      box.querySelectorAll('[data-idea]').forEach(b=> b.addEventListener('click', ()=>{
        box.querySelectorAll('[data-idea]').forEach(x=> x.classList.toggle('sel', x === b));
        const idea = IDEA_CARDS[+b.dataset.idea];
        const out = document.getElementById('s4out');
        out.innerHTML = `<p><b>Student A:</b> "${idea.text}" ${listenBtn(idea.text)}</p>
          <p><b>Group:</b> "I agree." or "I do not agree. How about ...?"</p>`;
        bindSay(out);
      }));
    }
  });
}

/* ===== Section 5: Plan Our Home ===== */
function rulesPanel(){
  return `<div class="panel rules">
    <h3 class="step-title">Rules</h3>
    <p class="rule-line"><b>1.</b> Work in a group of 3 or 4. You have <b>${BUDGET_GROUP} coins</b> together.</p>
    <p class="rule-line"><b>2.</b> Every home needs a bedroom, a bathroom, and a kitchen. The first bedroom, the first bathroom, and a small kitchen are free.</p>
    <div class="cost-grid">${COST_CHIPS.map(c=>`<div class="cost-chip">${homeIcon(c.icon, 34)}<span>${c.label}</span><span class="cost"><span class="coin"></span>${c.cost}</span></div>`).join('')}</div>
    <p class="rule-line"><b>3.</b> You cannot buy everything. Talk. Agree. Then click.</p>
  </div>`;
}
function renderS5(){
  return `
  <div class="section-eyebrow">Section 5 · Plan</div>
  <h2 class="section-title">Plan Our Home</h2>
  <p class="section-sub">Your group has one home. Everyone gives an idea. Agree, then click.</p>
  ${rulesPanel()}
  <div class="panel">
    <h3 class="step-title">Talk like this</h3>
    <ul class="say-list">${GROUP_TALK.map(l=>`<li><span>${l}</span> ${listenBtn(l)}</li>`).join('')}</ul>
  </div>
  <div id="s5design"></div>`;
}
function wireS5(){
  bindSay(document.getElementById('app'));
  loadGroupHome();
  mountDesigner(document.getElementById('s5design'), {
    budget: BUDGET_GROUP, home: groupHome, listen: false,
    onUpdate: info=>{
      saveGroupHome();
      if(homeIsReady(groupHome)) markActivityComplete('s5', {completionStatus:'completed', score:`${info.cost}/${BUDGET_GROUP} coins`, answers: homeLines(groupHome).map(l=>l.text).join(', ')});
    }
  });
}

/* ===== Section 6: Floor Plan ===== */
function renderS6(){
  return `
  <div class="section-eyebrow">Section 6 · Plan</div>
  <h2 class="section-title">Our Floor Plan</h2>
  <p class="section-sub">Put the rooms in the house. Click a room. Click a place.</p>
  <div id="s6body"></div>`;
}
function wireS6(){
  loadGroupHome(); loadGroupPlan();
  const body = document.getElementById('s6body');
  if(!homeIsReady(groupHome)){
    body.innerHTML = needStepHtml('First, plan your home. Choose a bedroom, a bathroom, and a kitchen.', 's5', 'Go to Plan Our Home');
    wireGoto();
    return;
  }
  const rooms = planRoomsFor(groupHome);
  let selected = null;
  function draw(){
    const placed = new Set(groupPlan.filter(Boolean));
    const slot = i=>{
      const id = groupPlan[i];
      const r = id ? PLAN_ROOMS.find(x=>x.id === id) : null;
      return `<button type="button" class="plan-slot${r ? ' filled' : ''}" data-slot="${i}" aria-label="${r ? r.word + '. Click to remove.' : 'Empty place ' + (i + 1)}">
        ${r ? `<span class="plan-ic">${homeIcon(r.id, 46)}</span><span class="plan-name">${r.word}</span>` : '<span class="plan-empty">+</span>'}</button>`;
    };
    const outside = [groupHome.garden ? 'garden' : null, groupHome.pool ? 'pool' : null].filter(Boolean);
    const sentences = planSentences(groupPlan);
    const done = planIsDone();
    body.innerHTML = `
    <div class="panel">
      <h3 class="step-title">Rooms in our home</h3>
      <div class="tray">${rooms.map(r=>`<button type="button" class="tray-chip${placed.has(r.id) ? ' used' : ''}${selected === r.id ? ' sel' : ''}" data-tray="${r.id}" ${placed.has(r.id) ? 'aria-disabled="true"' : ''}>${homeIcon(r.id, 36)}<span>${r.word}</span></button>`).join('')}</div>
      <p class="section-sub" id="s6hint" style="margin:8px 0 0;">${selected ? 'Now click a place in the house.' : (placed.size === rooms.length ? 'All rooms are in the house.' : 'Click a room above first.')}</p>
    </div>
    <div class="panel">
      <div class="plan-house">
        <div class="plan-row">${[0,1,2].map(slot).join('')}</div>
        <div class="plan-hall" aria-hidden="true">Hall</div>
        <div class="plan-row">${[3,4,5].map(slot).join('')}</div>
      </div>
      ${outside.length ? `<div class="plan-outside"><span>Outside:</span>${outside.map(id=>`<span class="plan-out">${homeIcon(id, 34)} ${id}</span>`).join('')}</div>` : ''}
    </div>
    <div class="panel">
      <h3 class="step-title">Where are the rooms?</h3>
      ${sentences.length
        ? `<ul class="say-list">${sentences.map(s=>`<li><span>${s}</span> ${listenBtn(s)}</li>`).join('')}</ul>`
        : '<p class="sentence-hint">Put two rooms next to each other. Or put two rooms across from each other.</p>'}
      ${done ? '<div class="feedback show good" style="margin-top:12px;">Great! Your floor plan is ready. Say these sentences to your group.</div>' : (placed.size === rooms.length && sentences.length < 2 ? '<div class="feedback show meh" style="margin-top:12px;">Put the rooms closer together.</div>' : '')}
      <div style="margin-top:12px;"><button type="button" class="reset-small" data-clearplan>↺ Start again</button></div>
    </div>`;
    bindSay(body);
    body.querySelectorAll('[data-tray]').forEach(b=> b.addEventListener('click', ()=>{
      if(placed.has(b.dataset.tray)) return;
      selected = selected === b.dataset.tray ? null : b.dataset.tray;
      draw();
    }));
    body.querySelectorAll('[data-slot]').forEach(b=> b.addEventListener('click', ()=>{
      const i = +b.dataset.slot;
      if(groupPlan[i]){ groupPlan[i] = null; selected = null; }
      else if(selected){ groupPlan[i] = selected; selected = null; }
      else{ const h = document.getElementById('s6hint'); if(h) h.textContent = 'Click a room above first.'; return; }
      saveGroupPlan();
      draw();
      if(planIsDone()) markActivityComplete('s6', {completionStatus:'completed', answers: planSentences(groupPlan).join(' | ')});
    }));
    body.querySelector('[data-clearplan]').addEventListener('click', ()=>{ groupPlan = [null,null,null,null,null,null]; selected = null; saveGroupPlan(); draw(); });
  }
  draw();
}

/* ===== Section 7: Our Script ===== */
function scriptGroups(n, reasonText){
  const h = groupHome;
  const plural = k => k > 1 ? 's' : '';
  const s1 = ['Hello. This is our dream home.', `It has ${NUMBER_WORDS[h.bedrooms]} bedroom${plural(h.bedrooms)} and ${NUMBER_WORDS[h.bathrooms]} bathroom${plural(h.bathrooms)}.`, `It has a ${h.kitchen} kitchen.`];
  const extras = ['livingroom', 'study', 'balcony', 'garden', 'pool'].filter(k=> h[k]).map(k=> 'a ' + BUILD_ROWS.find(r=>r.id === k).label.toLowerCase());
  const s2 = [];
  if(extras.length) s2.push(`It also has ${listJoin(extras)}.`);
  if(h.near) s2.push('It is near our university.');
  s2.push(`Our home costs ${homeCost(h)} coins.`);
  const s3 = planSentences(groupPlan).slice(0, 3);
  const close = [`We agree on this home because ${reasonText}.`, 'Thank you.'];
  return n === 3 ? [s1, s2, s3.concat(close)] : [s1, s2, s3, close];
}
function listJoin(items){
  return items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}
function renderS7(){
  return `
  <div class="section-eyebrow">Section 7 · Speak</div>
  <h2 class="section-title">Our Script</h2>
  <p class="section-sub">Every student has lines. Listen. Say your lines. Practice two times.</p>
  <div id="s7body"></div>`;
}
function wireS7(){
  loadGroupHome(); loadGroupPlan();
  const body = document.getElementById('s7body');
  if(!homeIsReady(groupHome)){
    body.innerHTML = needStepHtml('First, plan your home.', 's5', 'Go to Plan Our Home');
    wireGoto(); return;
  }
  if(!planIsDone()){
    body.innerHTML = needStepHtml('First, finish your floor plan.', 's6', 'Go to Floor Plan');
    wireGoto(); return;
  }
  let n = 4, reason = GROUP_REASONS[0].id;
  try{ const saved = JSON.parse(localStorage.getItem(GROUP_REASON_KEY)); if(saved && saved.date === todayStr()){ n = saved.n === 3 ? 3 : 4; if(GROUP_REASONS.some(r=>r.id === saved.reason)) reason = saved.reason; } }catch(e){}
  const practiced = new Set();
  function save(){ try{ localStorage.setItem(GROUP_REASON_KEY, JSON.stringify({date: todayStr(), n, reason})); }catch(e){} }
  function draw(){
    const reasonText = GROUP_REASONS.find(r=>r.id === reason).text;
    const groups = scriptGroups(n, reasonText);
    const labels = ['Introduce the home', 'Tell the features', n === 3 ? 'Show the floor plan and finish' : 'Show the floor plan', 'Finish'];
    body.innerHTML = `
    <div class="panel">
      <h3 class="step-title">How many students are in your group?</h3>
      <div class="choices wrap"><button type="button" class="choice-btn${n === 3 ? ' sel' : ''}" data-n="3">3 students</button><button type="button" class="choice-btn${n === 4 ? ' sel' : ''}" data-n="4">4 students</button></div>
      <h3 class="step-title" style="margin-top:16px;">We agree on this home because ...</h3>
      <div class="choices wrap">${GROUP_REASONS.map(r=>`<button type="button" class="choice-btn${reason === r.id ? ' sel' : ''}" data-reason="${r.id}">${r.text}</button>`).join('')}</div>
    </div>
    ${groups.map((g,i)=>`<div class="panel speaker${practiced.has(i) ? ' done' : ''}">
      <div class="speaker-head"><span class="speaker-num">${i + 1}</span><div><b>Student ${i + 1}</b><span class="speaker-role">${labels[i]}</span></div></div>
      <ol class="speech-list">${g.map(l=>`<li><span>${l}</span> ${listenBtn(l)}</li>`).join('')}</ol>
      <div class="speech-actions"><button type="button" class="${practiced.has(i) ? 'reveal-btn' : 'startbtn'}" data-practiced="${i}">${practiced.has(i) ? '✓ Practiced' : 'I practiced'}</button></div>
    </div>`).join('')}
    <div class="feedback${practiced.size === groups.length ? ' show good' : ''}" id="s7fb">${practiced.size === groups.length ? 'Great! Everyone practiced. Now go to the final presentation.' : ''}</div>`;
    bindSay(body);
    body.querySelectorAll('[data-n]').forEach(b=> b.addEventListener('click', ()=>{ n = +b.dataset.n; practiced.clear(); save(); draw(); }));
    body.querySelectorAll('[data-reason]').forEach(b=> b.addEventListener('click', ()=>{ reason = b.dataset.reason; save(); draw(); }));
    body.querySelectorAll('[data-practiced]').forEach(b=> b.addEventListener('click', ()=>{
      const i = +b.dataset.practiced;
      if(practiced.has(i)) practiced.delete(i); else practiced.add(i);
      draw();
      if(practiced.size === groups.length) markActivityComplete('s7', {completionStatus:'completed', score:`${n} students`, answers: groups.map(g=>g.join(' ')).join(' | ')});
    }));
  }
  draw();
}

/* ===== Section 8: Final Presentation ===== */
function renderS8(){
  const checks = PRESENT_CHECKS.map((s,i)=>`
    <div class="present-step" data-pstep="${i}" role="button" tabindex="0">
      <div class="present-num">${i + 1}</div>
      <div class="present-ic">${s.ic}</div>
      <div class="present-text"><b>${s.title}</b><span>${s.text}</span></div>
      <div class="present-check" aria-hidden="true">✓</div>
    </div>`).join('');
  const scaleHead = RUBRIC_SCALE.map(s=>`<th>${s.pts}</th>`).join('');
  const rows = RUBRIC_ROWS.map(r=>`<tr><td><b>${r.lbl}</b><div class="rubric-sub">${r.sub}</div></td>${RUBRIC_SCALE.map(()=>'<td class="rubric-box"></td>').join('')}</tr>`).join('');
  return `
  <div class="section-eyebrow">Section 8 · Present</div>
  <h2 class="section-title">Final Group Presentation</h2>
  <p class="section-sub">Show your dream home to the class. Everyone speaks. You have 3 minutes. Click each step when it is done.</p>
  <div class="panel">${checks}<div class="feedback" id="s8fb"></div></div>
  <div class="panel timer-panel">
    <h3 class="step-title">Timer</h3>
    <div class="timer-clock" id="s8clock" role="timer" aria-live="off">3:00</div>
    <div class="timer-actions"><button type="button" class="startbtn" id="s8start">Start</button><button type="button" class="reset-small" id="s8reset">Reset</button></div>
  </div>
  <div class="panel">
    <h3 class="step-title">How we are scored (100 points)</h3>
    <p class="section-sub" style="margin:4px 0 10px;">Your teacher gives 20, 15, 10, or 0 points for each line.</p>
    <div class="scroll"><table class="rubric-table"><thead><tr><th>Our group</th>${scaleHead}</tr></thead><tbody>${rows}</tbody></table></div>
    <p class="rubric-scale">${RUBRIC_SCALE.map(s=>`<b>${s.pts}</b> ${s.note}`).join(' &nbsp; ')}</p>
  </div>`;
}
function wireS8(){
  const done = new Set();
  document.querySelectorAll('#app [data-pstep]').forEach(c=>{
    const toggle = ()=>{
      const i = +c.dataset.pstep;
      if(done.has(i)){ done.delete(i); c.classList.remove('done'); } else { done.add(i); c.classList.add('done'); }
      const fb = document.getElementById('s8fb');
      if(done.size === PRESENT_CHECKS.length){
        fb.className = 'feedback show good';
        fb.textContent = 'Your group is ready. Good luck!';
        markActivityComplete('s8', {completionStatus:'completed', score:`${done.size}/${PRESENT_CHECKS.length} steps`});
      }else{ fb.className = 'feedback'; fb.textContent = ''; }
    };
    c.addEventListener('click', toggle);
    c.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); } });
  });
  const clock = document.getElementById('s8clock'), startBtn = document.getElementById('s8start');
  let left = PRESENT_SECONDS, timer = null;
  const fmt = s=> `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function stop(){ if(timer){ clearInterval(timer); timer = null; } startBtn.textContent = 'Start'; }
  startBtn.addEventListener('click', ()=>{
    if(timer){ stop(); return; }
    if(left <= 0) left = PRESENT_SECONDS;
    startBtn.textContent = 'Pause';
    timer = setInterval(()=>{
      left--;
      clock.textContent = left > 0 ? fmt(left) : 'Time is up';
      clock.classList.toggle('over', left <= 0);
      if(left <= 0) stop();
    }, 1000);
  });
  document.getElementById('s8reset').addEventListener('click', ()=>{ stop(); left = PRESENT_SECONDS; clock.textContent = fmt(left); clock.classList.remove('over'); });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 11 COMPLETE</div>
    <h1>You designed a home <span>with your group.</span></h1>
    <p>You can say where things are. You can agree and disagree. Great work!</p>
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
  {r:renderS8, w:wireS8},
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
  activeDesigners = [];
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
  const key = SECTION_META[current].key;
  if(key === 's5'){
    groupHome = freshHome();
    try{ localStorage.removeItem(GROUP_HOME_KEY); localStorage.removeItem(GROUP_PLAN_KEY); }catch(e){}
    groupPlan = [null,null,null,null,null,null];
  }
  if(key === 's6'){
    groupPlan = [null,null,null,null,null,null];
    try{ localStorage.removeItem(GROUP_PLAN_KEY); }catch(e){}
  }
  renderAll();
});

wireCheckin();
if(restoreCheckinState()){
  document.getElementById('checkinGate').style.display='none';
}
renderAll();
