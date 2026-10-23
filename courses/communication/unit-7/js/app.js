/* ===================== APP STATE / ROUTER =====================
   Same router, progress, check-in and voice system as the other English for
   Communication units. Unit 7 uses the browser's own text-to-speech (American
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8','practice','s9','exit'];

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
const CHECKIN_STORAGE_KEY = 'efc_u7_checkin';
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

/* ===================== UNIT 7 HELPERS (shared) ===================== */
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
function stepsList(steps){ return `<ol class="u7-steps">${steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`; }
function chipRow(items){
  return `<div class="u7-chips">${items.map(t=>`<span class="u7-chip">${esc(t)}${sayBtn(t.replace(/___/g,'...').replace(/\s+\.\.\./,' '))}</span>`).join('')}</div>`;
}

/* ===================== UNIT 7 HELPERS (chat) ===================== */
function speakChat(lines){
  if(!('speechSynthesis' in window)){ alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakSequence(lines.map(l=>({text:l.text, opts:VOICE[l.who]})));
}
function chatHtml(lines, withRoles){
  return `<div class="u7-chat">${lines.map(l=>`
    <div class="u7-bubble ${l.who === 'A' ? 'a' : 'b'}">
      <span class="u7-who">${l.who}</span>
      <span class="u7-line">${esc(l.text)}</span>
      ${withRoles && l.role ? `<span class="u7-role r-${l.role}">${esc(ROLE_LABEL[l.role])}</span>` : ''}
    </div>`).join('')}</div>`;
}
function pickRow(options, attr, idx){
  return `<div class="choices" ${attr}="${idx}">${options.map((o,oi)=>`<button type="button" class="choice-btn" data-v="${oi}"><span class="letter">${'ABC'[oi]}</span> ${esc(o)}</button>`).join('')}</div>`;
}

/* ===================== SECTION RENDERERS ===================== */
function quizHtml(list, attr){
  return list.map((q,i)=>`<div class="sit-card"><p class="u7-q">${esc(q.q)}</p>${pickRow(q.options || q.opts, attr, i)}</div>`).join('');
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
function itemOf(id){ return MARKET_ITEMS.find(m=>m.id===id); }
function listOf(names){ return names.length === 1 ? names[0] : names.slice(0,-1).join(', ') + ' and ' + names[names.length-1]; }

function renderCover(){
  const objectives = LESSON_OBJECTIVES.map(o=>`<li>${o}</li>`).join('');
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>Food <span>Culture</span></h1>
    <p>Unit 7: Markets, meals, and eating habits. Shop at the market in English.</p>
    <div class="cover-objectives">
      <b>By the end of this lesson, you can:</b>
      <ul>${objectives}</ul>
    </div>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Market words</div>
      <div class="signchip"><span class="arrow">→</span> Prices in baht</div>
      <div class="signchip"><span class="arrow">→</span> Market role-play</div>
    </div>
    <button class="startbtn" onclick="goNext()">Look. Choose. Speak. →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up, Food Culture Around Us ===== */
function renderS1(){
  const questions = CULTURE_CHOICE_QUESTIONS.map((q,qi)=>`
    <p class="u7-q" style="margin-top:${qi===0?'0':'18px'};">${q.q}</p>
    <div class="big-choice-grid" data-q="${qi}">
      ${q.opts.map((o,i)=>`<div class="big-choice" data-i="${i}"><div class="bc-ic">${o.ic}</div><div class="bc-lbl">${o.lbl}</div></div>`).join('')}
    </div>`).join('');
  const rows = CULTURE_TABLE.rows.map((r,ri)=>`<tr><td>${r}</td>${CULTURE_TABLE.countries.map(c=>`<td>${c.values[ri]}</td>`).join('')}</tr>`).join('');
  const head = CULTURE_TABLE.countries.map(c=>`<th><span class="culture-flag">${c.flag}</span>${c.name}</th>`).join('');
  const tip = CULTURE_INTRO_TIP.map(t=>`<li>${t}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 1 · Warm-Up</div>
  <h2 class="section-title">Food Culture Around Us</h2>
  <p class="section-sub">Look. Choose. Then tell a partner.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(CULTURE_STEPS)}</div>
    ${questions}
    <div id="s1result" class="feedback" style="margin-top:18px;"></div>
    <h3 class="u7-h3" style="margin-top:18px;">Say these out loud.</h3>
    ${chipRow(CULTURE_SAY)}
  </div>
  <div class="panel" id="s1culture" style="display:none;">
    <div class="section-eyebrow">Around the World</div>
    <h3 class="u7-h3" style="margin-top:6px;">How do people eat?</h3>
    <div class="culture-table-wrap" style="margin-top:14px;"><table class="culture-table"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></div>
    <div class="rule-box" style="margin-top:18px;"><b>Remember</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul></div>
  </div>`;
}
function wireS1(){
  wireSay();
  const answered = new Set();
  const result = document.getElementById('s1result'), cultureBox = document.getElementById('s1culture');
  document.querySelectorAll('#app [data-q]').forEach(grid=>{
    grid.addEventListener('click', e=>{
      const c = e.target.closest('.big-choice'); if(!c) return;
      [...grid.children].forEach(x=>x.classList.remove('sel')); c.classList.add('sel');
      answered.add(grid.dataset.q);
      if(answered.size >= CULTURE_CHOICE_QUESTIONS.length){
        result.className = 'feedback show good';
        result.textContent = 'Thanks! Everyone eats a little differently. Now tell your partner.';
        cultureBox.style.display = 'block';
        markActivityComplete('s1', {score:`${answered.size}/${CULTURE_CHOICE_QUESTIONS.length}`});
      }
    });
  });
}

/* ===== Section 2: Find the Food ===== */
function renderS2(){
  const tiles = FIND_SCENE.map((id,i)=>`<div class="find-tile" data-i="${i}" data-id="${id}">${itemOf(id).ic}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · See It, Hear It, Say It</div>
  <h2 class="section-title">Find the Food</h2>
  <p class="section-sub">Look at the market. Say the word. Click the food.</p>
  <div class="panel">
    <h3 class="u7-h3">Market words</h3>
    ${chipRow(MARKET_ITEMS.map(m=>m.nm))}
  </div>
  <div class="panel">
    <div class="mission-banner" id="s2mission"><span id="s2instruction"></span><span class="count" id="s2count"></span></div>
    <button type="button" class="reveal-btn" id="s2hear">Hear the mission</button>
    <div class="find-scene" id="s2scene" style="margin-top:12px;">${tiles}</div>
    <div id="s2win" class="feedback" style="margin-top:16px;"></div>
  </div>`;
}
function wireS2(){
  wireSay();
  let missionIdx = 0, foundInMission = new Set();
  const instrEl = document.getElementById('s2instruction'), countEl = document.getElementById('s2count');
  const win = document.getElementById('s2win'), scene = document.getElementById('s2scene');
  function startMission(){
    foundInMission = new Set();
    scene.querySelectorAll('.find-tile').forEach(t=>t.classList.remove('found','wrong'));
    const m = FIND_MISSIONS[missionIdx];
    instrEl.textContent = m.instruction; countEl.textContent = `0/${m.count}`;
  }
  startMission();
  document.getElementById('s2hear').addEventListener('click', ()=> speak(FIND_MISSIONS[missionIdx].instruction));
  scene.addEventListener('click', e=>{
    const tile = e.target.closest('.find-tile'); if(!tile || tile.classList.contains('found')) return;
    const m = FIND_MISSIONS[missionIdx];
    if(tile.dataset.id === m.targetId){
      tile.classList.add('found'); foundInMission.add(tile.dataset.i);
      countEl.textContent = `${foundInMission.size}/${m.count}`;
      if(foundInMission.size >= m.count){
        if(missionIdx < FIND_MISSIONS.length - 1){
          win.className = 'feedback show good'; win.textContent = 'Good! Next mission.';
          setTimeout(()=>{ missionIdx++; startMission(); win.className='feedback'; }, 900);
        } else {
          win.className = 'feedback show good'; win.textContent = 'Great! You found all the food.';
          markActivityComplete('s2', {score:`${FIND_MISSIONS.length} missions`});
        }
      }
    } else {
      tile.classList.add('wrong'); setTimeout(()=> tile.classList.remove('wrong'), 500);
    }
  });
}

/* ===== Section 3: Basket and Budget ===== */
function renderS3(){
  const basketChoices = BASKET_CHOICES.map(id=>`<div class="big-choice" data-id="${id}"><div class="bc-ic">${itemOf(id).ic}</div><div class="bc-lbl">${itemOf(id).nm}</div></div>`).join('');
  const budgetChoices = MARKET_ITEMS.map(it=>`
    <div class="big-choice" data-id="${it.id}"><div class="bc-ic">${it.ic}</div><div class="bc-lbl">${it.nm}</div><div class="bc-price">${BUDGET_PRICES[it.id]} baht</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Numbers and Money</div>
  <h2 class="section-title">Basket and Budget</h2>
  <p class="section-sub">Choose foods. Add up the prices. Say the total.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(BASKET_STEPS)}</div>
  </div>
  <div class="panel">
    <h3 class="u7-h3">Part A: Build your market basket</h3>
    <div class="big-choice-grid" id="s3grid">${basketChoices}</div>
    <div class="basket-display" id="s3basket"><span class="basket-empty-note">Your basket is empty. Choose some food!</span></div>
    <div class="u7-live" id="s3sentence" style="display:none;"></div>
    <button type="button" class="reveal-btn" id="s3hearA" style="display:none;">Hear my sentence</button>
  </div>
  <div class="panel">
    <h3 class="u7-h3">Part B: Market Budget Challenge</h3>
    <p class="section-sub" style="margin-top:0;">You have ${BUDGET_LIMIT} baht. Buy ${BUDGET_MISSION_ITEMS} foods.</p>
    <div class="budget-bar">
      <div><div class="bb-label">YOU HAVE</div><div class="bb-value">${BUDGET_LIMIT} ฿</div></div>
      <div><div class="bb-label">IN YOUR BASKET</div><div class="bb-value" id="s5total">0 ฿</div></div>
      <div><div class="bb-label">ITEMS</div><div class="bb-value" id="s5items">0/${BUDGET_MISSION_ITEMS}</div></div>
    </div>
    <div class="big-choice-grid" id="s5grid" style="margin-top:20px;">${budgetChoices}</div>
    <div id="s5fb" class="feedback" style="margin-top:16px;"></div>
  </div>`;
}
function wireS3(){
  wireSay();
  /* Part A: basket */
  const sel = [];
  const grid = document.getElementById('s3grid'), basket = document.getElementById('s3basket');
  const sentence = document.getElementById('s3sentence'), hearA = document.getElementById('s3hearA');
  function updA(){
    if(!sel.length){ basket.innerHTML = '<span class="basket-empty-note">Your basket is empty. Choose some food!</span>'; sentence.style.display='none'; hearA.style.display='none'; return; }
    basket.innerHTML = sel.map(id=>`<span class="basket-chip">${itemOf(id).ic} ${itemOf(id).nm}</span>`).join('');
    sentence.style.display = 'block'; hearA.style.display = '';
    sentence.textContent = `Say it: "I’d like ${listOf(sel.map(id=>PLURAL_FOOD[id]))}, please."`;
  }
  grid.addEventListener('click', e=>{
    const c = e.target.closest('.big-choice'); if(!c) return;
    const id = c.dataset.id, k = sel.indexOf(id);
    if(k >= 0){ sel.splice(k,1); c.classList.remove('sel'); }
    else { if(sel.length >= 4) return; sel.push(id); c.classList.add('sel'); }
    updA();
  });
  hearA.addEventListener('click', ()=> speak(`I’d like ${listOf(sel.map(id=>PLURAL_FOOD[id]))}, please.`));
  /* Part B: budget */
  let cart = [];
  const g2 = document.getElementById('s5grid'), totalEl = document.getElementById('s5total'), itemsEl = document.getElementById('s5items'), fb = document.getElementById('s5fb');
  const total = ()=> cart.reduce((s,id)=> s + BUDGET_PRICES[id], 0);
  function updB(){
    const t = total();
    totalEl.textContent = `${t} ฿`; totalEl.classList.toggle('over', t > BUDGET_LIMIT);
    itemsEl.textContent = `${cart.length}/${BUDGET_MISSION_ITEMS}`;
    if(t > BUDGET_LIMIT){ fb.className = 'feedback show meh'; fb.textContent = 'Too expensive. Try removing something.'; }
    else if(cart.length === BUDGET_MISSION_ITEMS){
      const say = `That is ${t} baht.`;
      fb.className = 'feedback show good';
      fb.innerHTML = `Good choice! You stayed under budget. Say it: <b>${esc(say)}</b> ${sayBtn(say)}`;
      wireSay();
      markActivityComplete('s3', {score:`${t}/${BUDGET_LIMIT} baht`});
    } else fb.className = 'feedback';
  }
  g2.addEventListener('click', e=>{
    const c = e.target.closest('.big-choice'); if(!c) return;
    const id = c.dataset.id, k = cart.indexOf(id);
    if(k >= 0){ cart.splice(k,1); c.classList.remove('sel'); }
    else { if(cart.length >= BUDGET_MISSION_ITEMS) return; cart.push(id); c.classList.add('sel'); }
    updB();
  });
}

/* ===== Section 4: Useful English ===== */
function renderS4(){
  const patterns = USEFUL_PATTERNS.map(p=>`
    <div class="phrase-group"><h4>${p.pattern}</h4>
      ${p.examples.map(ex=>`<div class="u7-frame"><span class="u7-frame-text">${esc(ex)}</span>${sayBtn(ex)}</div>`).join('')}
    </div>`).join('');
  const market = MARKET_PHRASES.map(m=>`
    <div class="u7-frame"><span class="u7-frame-text">${esc(m.say)}</span><span class="u7-hint">${esc(m.who)}</span>${sayBtn(m.ex)}</div>`).join('');
  const starters = SENTENCE_STARTERS.map((s,i)=>`<button class="kw" data-start="${i}">${s}</button>`).join('');
  const endings = SENTENCE_ENDINGS.map((s,i)=>`<button class="kw" data-end="${i}">${s}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · See It, Hear It, Say It</div>
  <h2 class="section-title">Useful English</h2>
  <p class="section-sub">Listen. Say it out loud. Choose the right word. Build your own sentence.</p>
  <div class="panel"><h3 class="u7-h3">At the market</h3>${market}</div>
  <div class="panel"><h3 class="u7-h3">Likes and needs</h3>${patterns}</div>
  <div class="panel">
    <h3 class="u7-h3">Choose the correct word.</h3>
    ${quizHtml(USEFUL_MCQ, 'data-uq')}
  </div>
  <div class="panel">
    <h3 class="u7-h3">Build your own sentence.</h3>
    <p class="section-sub" style="margin-top:6px;">Click one, then the other.</p>
    <div class="keyword-row" style="margin-top:16px;">${starters}</div>
    <div class="keyword-row">${endings}</div>
    <div class="u7-live" id="s7sentence" style="display:none;"></div>
    <button type="button" class="reveal-btn" id="s7hear" style="display:none;">Hear my sentence</button>
  </div>`;
}
function wireS4(){
  wireSay();
  const done = new Set(); let right = 0;
  wireQuiz('data-uq', USEFUL_MCQ, done, ()=>{ right++; }, ()=>{
    if(done.size >= USEFUL_MCQ.length) markActivityComplete('s4', {score:`${right}/${USEFUL_MCQ.length}`});
  });
  let a = null, b = null;
  const box = document.getElementById('s7sentence'), hear = document.getElementById('s7hear');
  function upd(){
    if(a === null || b === null) return;
    const s = `${SENTENCE_STARTERS[a]} ${SENTENCE_ENDINGS[b]}.`;
    box.style.display = 'block'; box.textContent = s; hear.style.display = ''; hear.dataset.say = s;
  }
  hear.addEventListener('click', ()=> speak(hear.dataset.say));
  document.querySelectorAll('#app [data-start]').forEach(btn=>btn.addEventListener('click', ()=>{
    document.querySelectorAll('#app [data-start]').forEach(x=>x.classList.remove('sel')); btn.classList.add('sel'); a = +btn.dataset.start; upd();
  }));
  document.querySelectorAll('#app [data-end]').forEach(btn=>btn.addEventListener('click', ()=>{
    document.querySelectorAll('#app [data-end]').forEach(x=>x.classList.remove('sel')); btn.classList.add('sel'); b = +btn.dataset.end; upd();
  }));
}

/* ===== Section 5: Say It! ===== */
const LADDER = [
  {key:'L1', title:'Level 1', sub:'Read and repeat'},
  {key:'L2', title:'Level 2', sub:'Fill the frame'},
  {key:'L3', title:'Level 3', sub:'Keywords only'},
  {key:'L4', title:'Level 4', sub:'No paper!'}
];
function myBuy(){ return getS('myBuy', {f1:'', f2:'', price:''}); }
function buySentence(){
  const m = myBuy();
  return `Hello. I’d like ${m.f1 || 'three mangoes'} and ${m.f2 || 'two bananas'}, please. How much is it? It’s ${m.price || 'ninety'} baht. No, thank you. Thank you.`;
}
function ladderPanel(i){
  const m = myBuy();
  if(i === 0){
    return `
      <p class="section-sub" style="margin-top:0;">Listen to each line. Say it out loud. Then say all four lines.</p>
      ${LADDER_MODEL.map(l=>`<div class="u7-frame"><span class="u7-frame-text">${esc(l)}</span>${sayBtn(l)}</div>`).join('')}
      <button type="button" class="reveal-btn" data-say="${esc(LADDER_MODEL.join(' '))}" style="margin-top:10px;">Hear all four lines</button>
      <button type="button" class="startbtn u7-did" data-did="L1">I said it out loud →</button>`;
  }
  if(i === 1){
    return `
      <p class="section-sub" style="margin-top:0;">Use YOUR market food and a price. Fill the blanks. Then click "Hear mine".</p>
      <div class="u7-form">
        <label>Hello. I’d like <input type="text" class="u7-input" data-my="f1" value="${esc(m.f1)}" maxlength="30" placeholder="three mangoes" autocomplete="off"></label>
        <label>and <input type="text" class="u7-input" data-my="f2" value="${esc(m.f2)}" maxlength="30" placeholder="two bananas" autocomplete="off"></label>
        <label>It’s <input type="text" class="u7-input" data-my="price" value="${esc(m.price)}" maxlength="20" placeholder="ninety" autocomplete="off"> baht.</label>
      </div>
      <p class="u7-live" id="myBuyText"></p>
      <button type="button" class="reveal-btn" id="hearMine">Hear mine</button>
      <button type="button" class="startbtn u7-did" data-did="L2">I said it out loud →</button>`;
  }
  if(i === 2){
    return `
      <p class="section-sub" style="margin-top:0;">Look only at the keywords. Do the whole chat with a partner. The partner is the seller.</p>
      <div class="u7-keys"><span>HELLO</span><span>I’D LIKE ___</span><span>HOW MUCH?</span><span>IT’S ___ BAHT</span><span>ANYTHING ELSE?</span><span>THANK YOU</span></div>
      <button type="button" class="startbtn u7-did" data-did="L3">I did the chat from the keywords →</button>`;
  }
  return `
      <p class="section-sub" style="margin-top:0;">No words! Buy 2 foods from your partner, the seller. Look at your partner, not the screen.</p>
      <div class="u7-nopaper" id="noPaper">Words are hidden. Ready?</div>
      <div class="u7-timer-row"><button class="reveal-btn" id="npBtn">Start 1 minute</button><span class="u7-timer" id="npTimer">1:00</span></div>
      <button type="button" class="startbtn u7-did" data-did="L4">I talked with no paper →</button>`;
}
function renderS5(){
  const t = SOUND_TIPS;
  const nums = t.numbers.map(n=>`<div class="u7-into"><span class="u7-into-text">${esc(n.text)}</span><span class="u7-into-note">${esc(n.note)}</span>${sayBtn(n.say)}</div>`).join('');
  const tabs = LADDER.map((l,i)=>`<button type="button" class="u7-lvl${i===0?' active':''}" data-lvl="${i}"><b>${l.title}</b><span>${l.sub}</span></button>`).join('');
  return `
  <div class="section-eyebrow">Section 5 · Say It!</div>
  <h2 class="section-title">Say It!</h2>
  <p class="section-sub">Each level has fewer words. At the end, you buy food with no paper.</p>
  <div class="panel">
    <h3 class="u7-h3">Sound tips</h3>
    <div class="u7-tip"><b>1. "I would like" is short</b><p>${esc(t.contraction.note)}</p><div class="u7-contr"><span>${esc(t.contraction.written)}</span><b>→</b><span class="u7-short">${esc(t.contraction.fast)}</span>${sayBtn(t.contraction.ex)}</div></div>
    <div class="u7-tip"><b>2. Prices: 15 or 50?</b>${nums}</div>
    <div class="u7-tip"><b>3. A question goes up</b><div class="u7-into"><span class="u7-into-text">${esc(t.question.text)}</span><span class="u7-into-note">${esc(t.question.note)}</span>${sayBtn(t.question.text)}</div></div>
  </div>
  <div class="panel">
    <h3 class="u7-h3">The speaking ladder</h3>
    <div class="u7-levels" id="lvlTabs">${tabs}</div>
    <div class="u7-level-body" id="lvlBody"></div>
    <div class="u7-progress" id="lvlProgress"></div>
  </div>
  <div class="panel">
    <div class="assign-box"><h3>Class game: Echo Race</h3>${stepsList(ECHO_RACE.steps)}</div>
  </div>`;
}
function wireS5(){
  wireSay();
  const done = new Set(getS('ladder', []));
  let level = 0;
  const body = document.getElementById('lvlBody'), prog = document.getElementById('lvlProgress');
  function updProg(){
    prog.textContent = `Levels finished: ${done.size} / ${LADDER.length}`;
    document.querySelectorAll('#lvlTabs .u7-lvl').forEach((t,i)=>{
      t.classList.toggle('active', i === level); t.classList.toggle('finished', done.has(LADDER[i].key));
    });
  }
  function show(i){
    level = i; stopTimer(); body.innerHTML = ladderPanel(i); wireSay();
    function upd(){
      const el = document.getElementById('myBuyText'); if(!el) return;
      const m = myBuy();
      el.innerHTML = `Hello. I’d like <b>${esc(m.f1 || '___')}</b> and <b>${esc(m.f2 || '___')}</b>, please. How much is it? It’s <b>${esc(m.price || '___')}</b> baht.`;
    }
    body.querySelectorAll('[data-my]').forEach(inp=>{
      inp.addEventListener('input', ()=>{ const m = myBuy(); m[inp.dataset.my] = inp.value; setS('myBuy', m); upd(); });
    });
    upd();
    const hm = document.getElementById('hearMine'); if(hm) hm.addEventListener('click', ()=> speak(buySentence()));
    const np = document.getElementById('npBtn');
    if(np) np.addEventListener('click', ()=>{
      np.disabled = true; document.getElementById('noPaper').textContent = 'Buy now!';
      runTimer(document.getElementById('npTimer'), 60, ()=>{ np.disabled = false; document.getElementById('noPaper').textContent = 'Great! Time is up.'; speak('Time is up. Great job!'); });
    });
    body.querySelectorAll('[data-did]').forEach(b=> b.addEventListener('click', ()=>{
      done.add(b.dataset.did); setS('ladder', [...done]); updProg();
      if(done.size >= LADDER.length) markActivityComplete('s5', {completionStatus:'completed'});
      if(level < LADDER.length - 1) show(level + 1);
    }));
    updProg();
  }
  document.querySelectorAll('#lvlTabs .u7-lvl').forEach(t=> t.addEventListener('click', ()=> show(+t.dataset.lvl)));
  show(0);
}

/* ===== Section 6: Food Survey ===== */
function renderS6(){
  const questions = SURVEY_QUESTIONS.map((q,i)=>`<div class="big-choice" data-sq="${i}" style="min-height:90px;"><div class="bc-lbl">${esc(q)}</div></div>`).join('');
  const report = SURVEY_REPORT.model.map(l=>`${esc(l)} ${sayBtn(l)}`).join('<br>');
  return `
  <div class="section-eyebrow">Section 6 · Ask and Answer</div>
  <h2 class="section-title">Food Survey</h2>
  <p class="section-sub">Ask classmates about food habits. Write short notes.</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(SURVEY_STEPS)}</div>
    <p class="u7-q">Choose 3 questions to ask.</p>
    <div class="big-choice-grid">${questions}</div>
    <div id="s9form" style="margin-top:20px;"></div>
  </div>
  <div class="panel">
    <h3 class="u7-h3">Tell a partner what you found</h3>
    <div class="scenario-message">${report}</div>
    <div class="rule-box" style="margin-top:14px;"><b>Tip</b><p style="margin:8px 0 0;">${esc(SURVEY_REPORT.tip)}</p></div>
  </div>`;
}
function wireS6(){
  wireSay();
  const chosen = getS('svChosen', []); const answers = getS('svAnswers', {});
  const form = document.getElementById('s9form');
  function check(){
    const filled = chosen.filter(i => (answers[i]||'').trim()).length;
    if(chosen.length >= 3 && filled >= 2) markActivityComplete('s6', {score:`${filled}/${chosen.length} answered`});
  }
  function renderForm(){
    if(!chosen.length){ form.innerHTML = ''; return; }
    form.innerHTML = `<p class="u7-q">Ask your classmates. Write notes.</p>` + chosen.map(i=>`
      <div class="survey-row"><label>${esc(SURVEY_QUESTIONS[i])} ${sayBtn(SURVEY_QUESTIONS[i])}</label>
        <input type="text" data-sanswer="${i}" placeholder="Notes only" value="${esc(answers[i] || '')}" maxlength="60" autocomplete="off"></div>`).join('');
    wireSay();
    form.querySelectorAll('[data-sanswer]').forEach(inp=>{
      inp.addEventListener('input', ()=>{ answers[inp.dataset.sanswer] = inp.value; setS('svAnswers', answers); check(); });
    });
  }
  document.querySelectorAll('#app [data-sq]').forEach(c=>{
    const i = +c.dataset.sq;
    if(chosen.includes(i)) c.classList.add('sel');
    c.addEventListener('click', ()=>{
      const k = chosen.indexOf(i);
      if(k >= 0){ chosen.splice(k,1); c.classList.remove('sel'); }
      else { if(chosen.length >= 3) return; chosen.push(i); c.classList.add('sel'); }
      setS('svChosen', chosen); renderForm(); check();
    });
  });
  renderForm();
}

/* ===== Section 7: Market Role-Play Prep ===== */
function renderS7(){
  const col = (data, cls) => `
    <div class="roleplay-col ${cls}"><h4>${data.title}</h4>
      <ul>${data.tasks.map(t=>`<li>${t}</li>`).join('')}</ul>
      ${data.phrases.map(p=>`<div class="u7-frame"><span class="u7-frame-text">${esc(p)}</span>${sayBtn(p.replace('___','mangoes'))}</div>`).join('')}
    </div>`;
  const mission = ROLEPLAY_MISSION.map(m=>`<li>${m}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 7 · Get Ready</div>
  <h2 class="section-title">Market Role-Play Prep</h2>
  <p class="section-sub">Work with your partner. Choose who is the customer and who is the seller. Then plan.</p>
  <div class="panel">
    <div class="rule-box"><b>Mission</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${mission}</ul></div>
    <div class="roleplay-cols" style="margin-top:20px;">
      ${col(ROLE_CUSTOMER,'customer')}
      ${col(ROLE_SELLER,'server')}
    </div>
    <button class="startbtn" id="s11done" style="margin-top:20px;">We are ready →</button>
  </div>`;
}
function wireS7(){
  wireSay();
  document.getElementById('s11done').addEventListener('click', ()=>{ markActivityComplete('s7'); goNext(); });
}

/* ===== Section 8: Speaking Task, Market Role-Play ===== */
function renderS8(){
  const board = MARKET_ITEMS.map(it=>`<div class="u7-tile"><span class="u7-tile-icon" aria-hidden="true">${it.ic}</span><span class="u7-tile-name">${esc(it.nm)}</span><span class="u7-tile-price">${BUDGET_PRICES[it.id]} baht</span></div>`).join('');
  const conv = MARKET_MODEL.map(l=>`
    <div class="phrase-card ${l.who==='S' ? 'waiter' : 'customer'}"><span class="txt"><b>${l.who==='S' ? 'Seller' : 'Customer'}:</b> ${esc(l.text)}</span>${sayBtn(l.text)}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 8 · Speaking Task</div>
  <h2 class="section-title">Market Role-Play</h2>
  <p class="section-sub">Buy 3 foods under 200 baht. Both roles. No reading from paper!</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3>${stepsList(MARKET_TASK.steps)}</div>
    <div class="role-row" style="margin-top:14px;">
      <span class="role-badge delegate">Customer</span><span class="role-arrow">→</span><span class="role-badge staff">Seller</span>
    </div>
    <h3 class="u7-h3" style="margin-top:16px;">The price board</h3>
    <div class="u7-board">${board}</div>
    <div class="u7-timer-row"><button class="reveal-btn" id="tourBtn">Start 4 minutes</button><span class="u7-timer" id="tourTimer">4:00</span></div>
  </div>
  <div class="panel">
    <h3 class="u7-h3">A model chat</h3>
    <div class="phrase-list">${conv}</div>
    <button type="button" class="reveal-btn" id="hearConv" style="margin-top:10px;">Hear the whole chat</button>
  </div>
  <div class="panel">
    <h3 class="u7-h3">Partner checklist</h3>
    <p class="section-sub" style="margin-top:0;">Your partner listens. Check what you did.</p>
    ${checkRows('pc', PEER_CHECKLIST)}
    <div class="u7-score" id="pcScore">0 / ${PEER_CHECKLIST.length}</div>
    <button type="button" class="startbtn" id="s8done" style="margin-top:14px;">We finished the task →</button>
  </div>
  <div class="panel">
    <h3 class="u7-h3">Your graded video</h3>
    <p class="section-sub" style="margin-top:0;">It is the same task. Record one video with two rounds.</p>
    <p><span class="deadline-chip" data-deadline="a-comm-u7-market-roleplay">Deadline to be announced</span></p>
    <a class="startbtn u7-extra-link" href="../../../assignments/comm-u7-market-roleplay/index.html">Final Assignment: Market Role-Play →</a>
  </div>`;
}
function wireS8(){
  wireSay();
  document.getElementById('hearConv').addEventListener('click', ()=>{
    if(!('speechSynthesis' in window)) return;
    VoiceEngine.speakSequence(MARKET_MODEL.map(l=>({text:l.text, opts:{pitch: l.who==='S' ? 0.85 : 1.1}})));
  });
  const tb = document.getElementById('tourBtn');
  tb.addEventListener('click', ()=>{
    tb.disabled = true;
    runTimer(document.getElementById('tourTimer'), 240, ()=>{ tb.disabled = false; speak('Time is up. Change roles!'); });
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
  document.getElementById('s8done').addEventListener('click', ()=>{
    markActivityComplete('s8', {score:`${checked.size}/${PEER_CHECKLIST.length}`});
    goNext();
  });
}

/* ===== Practice Lab (take-home): the old quizzes, Spot the Difference, Food Habits ===== */
function renderPractice(){
  const mc = (bank, prefix) => bank.map((item,i)=>`
    <div class="sit-card" data-${prefix}q="${i}">
      <p class="u7-q">${i+1}. ${item.q}</p>
      <div class="choices" data-${prefix}choices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-${prefix}fb="${i}"></div>
    </div>`).join('');
  const listenCards = LAB_LISTEN.map((item,i)=>`
    <div class="sit-card" data-lq="${i}">
      <div class="u7-listen-row"><button type="button" class="startbtn u7-play" data-lplay="${i}">${icon('play',{size:18})} Listen</button><span class="u7-hint">Listen, then choose.</span></div>
      <div class="choices" style="margin-top:14px;" data-lchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-lfb="${i}"></div>
    </div>`).join('');
  const speakCards = LAB_SPEAK_PROMPTS.map(p=>`<div class="sit-card"><p class="u7-q" style="color:var(--orange-deep);">${p.text}</p></div>`).join('');
  const habits = HABITS_QUESTIONS.map((q,i)=>`
    <div class="sit-card"><p class="u7-q">${q.q}</p>
      <div class="choices" data-hq="${i}">${q.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}</div></div>`).join('');
  const habitTip = HABITS_TIP.map(t=>`<li>${t}</li>`).join('');
  const total = MARKET_DIFFERENCES.length;
  const hotspots = MARKET_DIFFERENCES.map(d=>`<button type="button" class="diff-hotspot" data-id="${d.id}" style="left:${d.hotspot.left}%;top:${d.hotspot.top}%;width:${d.hotspot.width}%;height:${d.hotspot.height}%;" aria-label="Check this area for a difference"></button>`).join('');
  const photoCol = side => `
    <div class="diff-photo-col"><div class="diff-scene-title">Image ${side.toUpperCase()}</div>
      <div class="diff-photo-wrap" data-side="${side}"><img src="${MARKET_DIFF_IMAGES[side].src}" alt="${MARKET_DIFF_IMAGES[side].alt}">${hotspots}</div></div>`;
  return `
  <div class="section-eyebrow">Practice Lab</div>
  <h2 class="section-title">Practice Lab</h2>
  <p class="section-sub">Practice more at home. (Optional)</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-ptab="vocab">Vocabulary</button>
      <button class="tab-btn" data-ptab="culture">Culture</button>
      <button class="tab-btn" data-ptab="useful">Useful English</button>
      <button class="tab-btn" data-ptab="listen">Listening</button>
      <button class="tab-btn" data-ptab="speak">Speaking</button>
      <button class="tab-btn" data-ptab="market">Market English</button>
      <button class="tab-btn" data-ptab="habits">Food Habits</button>
      <button class="tab-btn" data-ptab="diff">Spot the Difference</button>
    </div>
    <div class="tab-panel active" data-ppanel="vocab">${mc(LAB_VOCAB,'v')}</div>
    <div class="tab-panel" data-ppanel="culture">${mc(LAB_CULTURE,'c')}</div>
    <div class="tab-panel" data-ppanel="useful">${mc(LAB_USEFUL,'u')}</div>
    <div class="tab-panel" data-ppanel="listen">${listenCards}</div>
    <div class="tab-panel" data-ppanel="speak">${speakCards}<p class="u7-hint" style="margin-top:10px;">Say it aloud. Ask your teacher or partner to check.</p></div>
    <div class="tab-panel" data-ppanel="market">${mc(LAB_MARKET_EXPR,'m')}</div>
    <div class="tab-panel" data-ppanel="habits">${habits}
      <div class="rule-box" id="habitTip" style="margin-top:14px;display:none;"><b>Remember</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${habitTip}</ul></div></div>
    <div class="tab-panel" data-ppanel="diff">
      <p class="u7-hint" style="margin-bottom:10px;">Spot the ${total} differences! Then say what you see: "There is a blue basket."</p>
      <div class="mission-banner"><span>Differences found</span><span class="count" id="dxcount">0/${total}</span></div>
      <div class="diff-photo-scenes">${photoCol('a')}${photoCol('b')}</div>
      <div class="diff-try-again" id="dxtry" hidden>Try again!</div>
      <div class="diff-answers"><div class="diff-answers-title">Differences Found</div><ul class="diff-answers-list" id="dxlist"></ul></div>
    </div>
  </div>`;
}
function wirePractice(){
  wireSay();
  document.querySelectorAll('#app [data-ptab]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-ptab]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-ppanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-ppanel="${btn.dataset.ptab}"]`).classList.add('active');
    });
  });
  let vD=false, cD=false, uD=false;
  function overall(){ if(vD && cD && uD) markActivityComplete('practice'); }
  function wireMC(bank, prefix, onAll){
    const seen = new Set();
    bank.forEach((item,i)=>{
      const box = document.querySelector(`[data-${prefix}choices="${i}"]`), fb = document.querySelector(`[data-${prefix}fb="${i}"]`);
      box.addEventListener('click', e=>{
        const btn = e.target.closest('.choice-btn'); if(!btn) return;
        [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
        const right = +btn.dataset.i === item.correct;
        btn.classList.add(right ? 'correct' : 'wrong'); fb.className = 'feedback show ' + (right ? 'good' : 'meh'); fb.textContent = right ? 'Great!' : 'Try again.';
        if(!seen.has(i)){ seen.add(i); if(seen.size >= bank.length) onAll(); }
      });
    });
  }
  wireMC(LAB_VOCAB,'v',()=>{ vD=true; overall(); });
  wireMC(LAB_CULTURE,'c',()=>{ cD=true; overall(); });
  wireMC(LAB_USEFUL,'u',()=>{ uD=true; overall(); });
  wireMC(LAB_MARKET_EXPR,'m',()=>{});
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
  const hSeen = new Set();
  HABITS_QUESTIONS.forEach((q,i)=>{
    const box = document.querySelector(`[data-hq="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct')); btn.classList.add('correct'); hSeen.add(i);
      if(hSeen.size >= HABITS_QUESTIONS.length) document.getElementById('habitTip').style.display = 'block';
    });
  });
  const found = new Set(), total = MARKET_DIFFERENCES.length;
  const countEl = document.getElementById('dxcount'), list = document.getElementById('dxlist'), tryAgain = document.getElementById('dxtry');
  let timer = null;
  document.querySelectorAll('#app .diff-hotspot').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      const id = btn.dataset.id; if(found.has(id)) return;
      const diff = MARKET_DIFFERENCES.find(d=>d.id===id); found.add(id);
      document.querySelectorAll(`#app .diff-hotspot[data-id="${id}"]`).forEach(b=>{
        b.classList.add('found'); b.disabled = true;
        const circle = document.createElement('div'); circle.className = 'diff-circle';
        ['left','top','width','height'].forEach(k=> circle.style[k] = b.style[k]);
        b.insertAdjacentElement('afterend', circle);
      });
      const li = document.createElement('li'); li.textContent = diff.label; list.appendChild(li);
      countEl.textContent = `${found.size}/${total}`;
    });
  });
  document.querySelectorAll('#app .diff-photo-wrap').forEach(w=> w.addEventListener('click', ()=>{
    clearTimeout(timer); tryAgain.hidden = false; timer = setTimeout(()=>{ tryAgain.hidden = true; }, 1200);
  }));
}

/* ===== Section 9: Self-Check and Take Home ===== */
function renderS9(){
  const saved = getS('can', {});
  const rows = CAN_DO.map((c,i)=>`
    <div class="rubric-row"><div><div class="lbl">${esc(c)}</div></div>
      <div class="rate" data-can="${i}">${SCALE.map(s=>`<button type="button" data-pts="${s.v}" class="${saved[i]===s.v ? 'sel' : ''}">${esc(s.label)}</button>`).join('')}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 9 · Self-Check</div>
  <h2 class="section-title">What Can You Do?</h2>
  <p class="section-sub">Be honest. This is for you. Choose one for each sentence.</p>
  <div class="panel">${rows}
    <div class="u7-score" id="canTotal"></div>
    <div class="feedback" id="canMsg"></div>
  </div>
  <div class="panel">
    <h3 class="u7-h3">Next: your graded video</h3>
    <p class="section-sub" style="margin-top:0;">Record one video with a partner: buy food at a market, two rounds, both roles.</p>
    <p><span class="deadline-chip" data-deadline="a-comm-u7-market-roleplay">Deadline to be announced</span></p>
    <a class="startbtn u7-extra-link" href="../../../assignments/comm-u7-market-roleplay/index.html">Final Assignment: Market Role-Play →</a>
  </div>
  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">Food Culture: Study Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review the key vocabulary, useful expressions, and market English from Unit 7.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="Food Culture: Study Guide preview" class="guide-thumb" loading="lazy">
    <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="downloadGuideBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
  </div>`;
}
function wireS9(){
  const saved = getS('can', {});
  function upd(){
    const vals = Object.values(saved);
    const total = vals.reduce((a,b)=>a+b,0);
    document.getElementById('canTotal').textContent = vals.length ? `Your score: ${total} / ${CAN_DO.length*3}` : '';
    const msg = document.getElementById('canMsg');
    if(vals.length >= CAN_DO.length){
      msg.className = 'feedback show ' + (total >= 15 ? 'good' : 'meh');
      msg.textContent = total >= 15 ? 'Great! You are ready for Unit 8.' : 'Good start! Practice the "Not yet" ones with a friend.';
      markActivityComplete('s9', {score:`${total}/${CAN_DO.length*3}`});
    }
  }
  document.querySelectorAll('#app [data-can]').forEach(row=>{
    row.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...row.children].forEach(b=>b.classList.remove('sel')); btn.classList.add('sel');
      saved[row.dataset.can] = +btn.dataset.pts; setS('can', saved); upd();
    });
  });
  upd();
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 7 COMPLETE</div>
    <h1>You can talk about <span>food culture and shop at a market.</span></h1>
    <p>Now try the final assignment: buy food at a market in English with a partner.</p>
    <div class="complete-actions">
      <a href="../../../assignments/comm-u7-market-roleplay/index.html" class="download-btn">Final Assignment: Market Role-Play →</a>
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
    const rolePlay = Progress.activities['s8'] ? 'Yes' : 'No';
    const practice = Progress.activities['practice'] ? 'Yes' : 'No';
    stats.innerHTML = `
      <p class="complete-stats-intro">Your progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Activities Completed</div></div>
        <div class="complete-stat"><div class="num">${rolePlay}</div><div class="lbl">Role-Play Practiced</div></div>
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
  {r:renderS7, w:wireS7},
  {r:renderS8, w:wireS8},
  {r:renderPractice, w:wirePractice},
  {r:renderS9, w:wireS9},
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
