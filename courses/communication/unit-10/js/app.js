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

/* ===== Section 2: Rooms in a Home ===== */
function renderS2(){
  const learn = ROOMS.map(r=> roomChip(r, r.word, `data-room="${r.id}"`)).join('');
  return `
  <div class="section-eyebrow">Section 2 · Learn</div>
  <h2 class="section-title">Rooms in a Home</h2>
  <p class="section-sub">Look. Click. Listen.</p>
  <div class="panel"><div class="big-choice-grid room-grid">${learn}</div></div>
  <div class="panel">
    <h3 class="step-title">Game: Click the room</h3>
    <div id="s2quiz"></div>
  </div>`;
}
function wireS2(){
  document.querySelectorAll('#app [data-room]').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-room]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      speak(ROOMS.find(r=>r.id === c.dataset.room).word);
    });
  });
  runQuiz({
    el: document.getElementById('s2quiz'),
    rounds: shuffle(ROOMS),
    render: r=>`<p class="quiz-q">Click the <b>${r.word}</b>. ${listenBtn(r.word)}</p>
      <div class="big-choice-grid room-grid">${ROOMS.map(x=> roomChip(x, '', `data-ans="${x.id}"`)).join('')}</div>`,
    isCorrect: (r,v)=> v === r.id,
    onDone: s=>{ markActivityComplete('s2', {score:`${s}/${ROOMS.length}`}); }
  });
}

/* ===== Section 3: Home Features ===== */
function renderS3(){
  const pairs = FEATURE_PAIRS.map(p=>`
    <div class="pair-col">
      ${photoChip(p.a.img, p.a.word, `data-sayword="${p.a.word}"`)}
      <div class="pair-vs">↕</div>
      ${photoChip(p.b.img, p.b.word, `data-sayword="${p.b.word}"`)}
    </div>`).join('');
  const singles = `<div class="pair-col singles-col">${FEATURE_SINGLES.map(s=> iconChip(s.id, s.word, `data-sayword="${s.word}"`)).join('')}</div>`;
  return `
  <div class="section-eyebrow">Section 3 · Learn</div>
  <h2 class="section-title">Home Features</h2>
  <p class="section-sub">Look. Click. Listen.</p>
  <div class="panel"><div class="pair-grid">${pairs}${singles}</div></div>
  <div class="panel">
    <h3 class="step-title">Game: Click the picture</h3>
    <div id="s3quiz"></div>
  </div>`;
}
function wireS3(){
  document.querySelectorAll('#app [data-sayword]').forEach(c=>{
    c.addEventListener('click', ()=>{ c.classList.add('sel'); speak(c.dataset.sayword); });
  });
  const rounds = shuffle(
    FEATURE_PAIRS.map(p=>({type:'pair', pair:p, target: Math.random() < .5 ? 'a' : 'b'}))
      .concat(FEATURE_SINGLES.map(s=>({type:'single', single:s})))
  );
  runQuiz({
    el: document.getElementById('s3quiz'),
    rounds,
    render: r=>{
      if(r.type === 'pair'){
        const word = r.pair[r.target].word;
        return `<p class="quiz-q">Click <b>${word}</b>. ${listenBtn(word)}</p>
          <div class="big-choice-grid" style="grid-template-columns:1fr 1fr;max-width:420px;margin-inline:auto;">${shuffle(['a','b']).map(s=> photoChip(r.pair[s].img, '', `data-ans="${s}"`, r.pair[s].word)).join('')}</div>`;
      }
      return `<div style="text-align:center;margin:8px 0 14px;">${homeIcon(r.single.id, 110)}</div>
        <p class="quiz-q" style="text-align:center;">What is it?</p>
        <div class="choices wrap" style="justify-content:center;">${shuffle(FEATURE_SINGLES).map(w=>`<button class="choice-btn" data-ans="${w.id}">${w.word}</button>`).join('')}</div>`;
    },
    isCorrect: (r,v)=> r.type === 'pair' ? v === r.target : v === r.single.id,
    onDone: s=>{ markActivityComplete('s3', {score:`${s}/${rounds.length}`}); }
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
