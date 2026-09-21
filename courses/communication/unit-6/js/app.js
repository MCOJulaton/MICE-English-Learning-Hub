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

/* ===================== DATA COLLECTION MODULE =====================
   Same architecture as the rest of the English Learning Hub: this page ->
   Google Apps Script Web App -> Google Sheets. Paste a deployed Apps
   Script Web App URL below to go live. Until then, nothing is sent
   anywhere, and nothing pretends to have been saved.

   Record shape sent by every call to sendProgressRecord():
   { studentId, studentName, course, unit, date, timestamp, activity, score, completionStatus } */
const DATA_ENDPOINT = "https://script.google.com/macros/s/AKfycbxDECOuXf3HMxPVLT1fhfOHE5g-Gq1juG5enaCoUrShk9vEMfctgy-URKmqmvPGeoE/exec";

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','practice','s10'];

const Progress = {
  studentId:'', firstName:'', lastName:'', studentName:'',
  date:'', startTime:'',
  activities:{}
};
let pendingRecords = [];

function isEndpointConfigured(){
  return typeof DATA_ENDPOINT === 'string' && DATA_ENDPOINT.trim() !== '' && DATA_ENDPOINT.indexOf('PASTE_') !== 0;
}

function buildRecord(activity, {score=null, completionStatus='completed'}={}){
  return {
    studentId: Progress.studentId,
    studentName: Progress.studentName,
    course: COURSE_META.course,
    unit: COURSE_META.unit,
    date: Progress.date,
    timestamp: new Date().toISOString(),
    activity,
    score,
    completionStatus
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
  if(prev && prev.completionStatus===completionStatus && prev.score===score) return;
  Progress.activities[key] = { status:completionStatus, score, completionStatus };
  sendProgressRecord(buildRecord(key, {score, completionStatus}));
  updateTopbarBadge();
  saveCheckinState();
}
function sendGranularRecord(label, opts={}){
  sendProgressRecord(buildRecord(label, {score: opts.score ?? null, completionStatus: opts.completionStatus || 'completed'}));
}
function completedCount(){
  return TRACKED_ACTIVITIES.filter(k => Progress.activities[k]).length;
}
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

/* ===================== DEEP LINKS (Practice Hub, etc.) =====================
   ?section=<key> jumps straight to that section after check-in (e.g.
   ?section=practice). &tab=<tabkey> additionally clicks a tab button with
   data-ptab="<tabkey>" once it's rendered. Purely additive — with no
   params, behavior is exactly as before. */
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
      const tabBtn = document.querySelector(`#app [data-ptab="${tabKey}"]`);
      if(tabBtn) tabBtn.click();
    }, 50);
  }
}

/* ===================== STUDENT CHECK-IN ===================== */
function wireCheckin(){
  const gate = document.getElementById('checkinGate');
  const form = document.getElementById('checkinForm');
  const confirmEl = document.getElementById('checkinConfirm');
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
    applyDeepLinkAfterCheckin();
    setTimeout(()=>{ gate.style.display='none'; }, 900);
  });
}

const VoiceEngine = (function(){
  let allVoices = [];
  let voiceA = null, voiceB = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const QUALITY_HINTS = ['natural','neural','premium','enhanced','online','wavenet','studio'];
  const GOOD_NAMES = ['google us english','samantha','ava','zoe','aria','jenny','guy','matthew','joanna','ryan','emma'];

  function scoreVoice(v){
    const n = v.name.toLowerCase();
    let score = 0;
    if(v.lang && v.lang.toLowerCase().startsWith('en-us')) score += 3;
    else if(v.lang && v.lang.toLowerCase().startsWith('en')) score += 1;
    QUALITY_HINTS.forEach(h=>{ if(n.includes(h)) score += 4; });
    GOOD_NAMES.forEach(g=>{ if(n.includes(g)) score += 2; });
    if(n.includes('compact') || n.includes('espeak')) score -= 5;
    return score;
  }

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    const ranked = [...allVoices].sort((a,b)=> scoreVoice(b)-scoreVoice(a));
    voiceA = ranked[0] || allVoices[0] || null;
    voiceB = ranked[1] || allVoices[1] || allVoices[0] || null;
    onStateChange();
  }

  if('speechSynthesis' in window){
    window.speechSynthesis.onvoiceschanged = refresh;
    refresh();
  }

  function splitSentences(text){
    return text.replace(/([.!?])\s+/g,'$1|').split('|').map(s=>s.trim()).filter(Boolean);
  }

  function makeUtterance(text, kind){
    const u = new SpeechSynthesisUtterance(text);
    const voice = kind==='b' ? voiceB : voiceA;
    if(voice) u.voice = voice;
    u.lang = 'en-US';
    u.rate = (slower ? 0.86 : 1.0);
    u.pitch = kind==='b' ? 1.04 : 0.98;
    return u;
  }

  function playNext(){
    if(queueIndex >= queue.length){ playing=false; paused=false; onStateChange(); return; }
    const item = queue[queueIndex];
    const sentences = splitSentences(item.text);
    let sIdx = 0;
    function playSentence(){
      if(sIdx >= sentences.length){
        queueIndex++;
        setTimeout(playNext, 420);
        return;
      }
      const u = makeUtterance(sentences[sIdx], item.kind);
      u.onend = ()=>{ sIdx++; setTimeout(playSentence, 160); };
      window.speechSynthesis.speak(u);
    }
    playSentence();
  }

  return {
    setSlower(v){ slower = v; },
    isSlower(){ return slower; },
    isPlaying(){ return playing; },
    isPaused(){ return paused; },
    onChange(fn){ onStateChange = fn; },
    speakLine(text, kind){
      this.stop();
      queue = [{text, kind: kind||'a'}];
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
    pause(){ if(playing && !paused){ window.speechSynthesis.pause(); paused=true; onStateChange(); } },
    resume(){ if(playing && paused){ window.speechSynthesis.resume(); paused=false; onStateChange(); } },
    stop(){ window.speechSynthesis.cancel(); playing=false; paused=false; queue=[]; queueIndex=0; onStateChange(); }
  };
})();

function speak(text, kind){
  if(!('speechSynthesis' in window)) { alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakLine(text, kind==='b' ? 'b' : 'a');
}

function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>Food <span>and Eating</span></h1>
    <p>Unit 6: Cultural Studies. Talk about food, learn restaurant words, and order a meal in English.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Food words</div>
      <div class="signchip"><span class="arrow">→</span> Restaurant words</div>
      <div class="signchip"><span class="arrow">→</span> Order food</div>
    </div>
    <button class="startbtn" onclick="goNext()">Look. Choose. Speak. →</button>
  </div>`;
}

/* ===== Section 1: How Do You Choose Food? ===== */
function renderS1(){
  const photos = CHOOSE_FOOD_PHOTOS.map(id=>`<img class="venue-photo loc-photo" src="${SECTION_PHOTOS[id].src}" alt="${SECTION_PHOTOS[id].alt}" loading="lazy">`).join('');
  const choices = CHOOSE_REASONS.map((r,i)=>`
    <div class="big-choice" data-i="${i}">
      <div class="bc-ic">${r.ic}</div>
      <div class="bc-lbl">${r.lbl}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">How Do You Choose Food?</h2>
  <p class="section-sub">Look at the food. Choose one answer.</p>
  <div class="panel">
    <div class="loc-grid" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">${photos}</div>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--navy);font-size:16px;">What is important to you?</p>
    <div class="big-choice-grid">${choices}</div>
    <div id="s1result" style="display:none;margin-top:18px;" class="feedback show good"></div>
  </div>`;
}
function wireS1(){
  const grid = document.querySelector('#app .big-choice-grid');
  const result = document.getElementById('s1result');
  grid.addEventListener('click', e=>{
    const c = e.target.closest('.big-choice'); if(!c) return;
    [...grid.children].forEach(x=>x.classList.remove('sel'));
    c.classList.add('sel');
    const reason = CHOOSE_REASONS[+c.dataset.i];
    result.style.display='block';
    result.textContent = `Great! "I choose it because ${reason.lbl.toLowerCase()}."`;
    markActivityComplete('s1', {score: reason.lbl});
  });
}

/* ===== Section 2: Food Vocabulary ===== */
function renderS2(){
  const cards = FOOD_VOCAB.map(v=>{
    const photo = SECTION_PHOTOS[v.id];
    return `
    <div class="loc-card" data-id="${v.id}">
      <div class="ic">${v.ic}</div>
      <div class="nm">${v.nm}</div>
      <div class="loc-detail">
        <img class="venue-photo loc-photo" src="${photo.src}" alt="${photo.alt}" loading="lazy" style="margin-bottom:10px;">
        "${v.ex}"
        <br><button class="audio-mini" data-say="${v.ex}"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
        <div style="margin-top:12px;font-weight:700;">Do you like ${v.nm.toLowerCase()}?</div>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button class="tb-btn" data-yn="yes" data-id="${v.id}" style="flex:1;justify-content:center;">Yes</button>
          <button class="tb-btn" data-yn="no" data-id="${v.id}" style="flex:1;justify-content:center;">No</button>
        </div>
      </div>
    </div>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Food Vocabulary</h2>
  <p class="section-sub">Click a card. Listen. Choose Yes or No.</p>
  <div class="panel">
    <div class="loc-grid">${cards}</div>
  </div>`;
}
function wireS2(){
  const opened = new Set();
  const grid = document.querySelector('#app .loc-grid');
  grid.addEventListener('click', e=>{
    const audioBtn = e.target.closest('.audio-mini');
    if(audioBtn){ speak(audioBtn.dataset.say,'a'); e.stopPropagation(); return; }
    const ynBtn = e.target.closest('[data-yn]');
    if(ynBtn){
      e.stopPropagation();
      const card = ynBtn.closest('.loc-card');
      [...card.querySelectorAll('[data-yn]')].forEach(b=>b.classList.remove('primary'));
      ynBtn.classList.add('primary');
      opened.add(ynBtn.dataset.id);
      if(opened.size >= FOOD_VOCAB.length) markActivityComplete('s2');
      return;
    }
    const card = e.target.closest('.loc-card'); if(!card) return;
    card.classList.toggle('open');
  });
}

/* ===== Section 3: Food and Culture ===== */
function renderS3(){
  const rows = CULTURE_TABLE.rows.map((r,ri)=>`
    <tr><td>${r}</td>${CULTURE_TABLE.countries.map(c=>`<td>${c.values[ri]}</td>`).join('')}</tr>`).join('');
  const head = CULTURE_TABLE.countries.map(c=>`<th><span class="culture-flag">${c.flag}</span>${c.name}</th>`).join('');
  const questions = CULTURE_QUESTIONS.map((q,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${q.q}</p>
      <div class="choices" data-cq="${i}">
        ${q.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
    </div>`).join('');
  const tip = CULTURE_TIP.map(t=>`<li>${t}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Food and Culture</h2>
  <p class="section-sub">Look and compare.</p>
  <div class="panel">
    <div class="culture-table-wrap">
      <table class="culture-table">
        <thead><tr><th></th>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--navy);">What is the same? What is different?</p>
    ${questions}
    <div class="rule-box" style="margin-top:18px;">
      <b>Cultural Tip</b>
      <ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul>
    </div>
  </div>`;
}
function wireS3(){
  const answered = new Set();
  CULTURE_QUESTIONS.forEach((q,i)=>{
    const box = document.querySelector(`[data-cq="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct'));
      btn.classList.add('correct');
      answered.add(i);
      if(answered.size >= CULTURE_QUESTIONS.length) markActivityComplete('s3');
    });
  });
}

/* ===== Section 4: Restaurant Vocabulary (matching) ===== */
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }
function renderS4(){
  const words = RESTAURANT_VOCAB.map(v=>`<div class="match-item" data-word="${v.id}">${v.nm}</div>`).join('');
  const pics = shuffle(RESTAURANT_VOCAB).map(v=>`<div class="match-item" data-pic="${v.id}"><span class="mi-ic">${v.ic}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Restaurant Vocabulary</h2>
  <p class="section-sub">Click a word, then click its picture to connect them.</p>
  <div class="panel">
    <div class="match-wrap">
      <svg class="match-svg"></svg>
      <div class="match-cols">
        <div>
          <div class="match-col-title">Word</div>
          ${words}
        </div>
        <div>
          <div class="match-col-title">Picture</div>
          ${pics}
        </div>
      </div>
    </div>
    <div class="feedback" id="s4fb"></div>
  </div>`;
}
function wireS4(){
  /* Connecting-line matching: click a word, then its picture. A correct
     pair draws a line between them. Click a connected item again to undo. */
  const matchWrap = document.querySelector('.match-wrap');
  const matchSvg = document.querySelector('.match-svg');
  const fb = document.getElementById('s4fb');
  const connections = new Map();
  let selectedWord = null;

  function sizeSvg(){
    const r = matchWrap.getBoundingClientRect();
    matchSvg.setAttribute('width', r.width);
    matchSvg.setAttribute('height', r.height);
  }
  function lineBetween(a, b, cls){
    const wrapRect = matchWrap.getBoundingClientRect();
    const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
    const x1 = ar.right - wrapRect.left, y1 = ar.top + ar.height/2 - wrapRect.top;
    const x2 = br.left - wrapRect.left, y2 = br.top + br.height/2 - wrapRect.top;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="match-connector ${cls||''}"></line>`;
  }
  function drawConnections(tempWrongPair){
    sizeSvg();
    let html = '';
    connections.forEach(({wordEl, picEl})=>{ html += lineBetween(wordEl, picEl); });
    if(tempWrongPair) html += lineBetween(tempWrongPair.wordEl, tempWrongPair.picEl, 'wrong');
    matchSvg.innerHTML = html;
  }
  window.addEventListener('resize', ()=>drawConnections());

  function unmatch(id){
    connections.delete(id);
    document.querySelector(`[data-word="${id}"]`).classList.remove('matched');
    document.querySelector(`[data-pic="${id}"]`).classList.remove('matched');
    drawConnections();
  }
  document.querySelectorAll('#app [data-word]').forEach(w=>{
    w.addEventListener('click', ()=>{
      if(w.classList.contains('matched')){ unmatch(w.dataset.word); return; }
      document.querySelectorAll('#app [data-word]').forEach(x=>x.classList.remove('sel'));
      w.classList.add('sel');
      selectedWord = w.dataset.word;
    });
  });
  document.querySelectorAll('#app [data-pic]').forEach(p=>{
    p.addEventListener('click', ()=>{
      if(p.classList.contains('matched')){ unmatch(p.dataset.pic); return; }
      if(!selectedWord) return;
      const wordEl = document.querySelector(`[data-word="${selectedWord}"]`);
      if(p.dataset.pic === selectedWord){
        p.classList.add('matched'); p.classList.remove('sel');
        wordEl.classList.add('matched'); wordEl.classList.remove('sel');
        connections.set(selectedWord, {wordEl, picEl:p});
        fb.className='feedback show good'; fb.textContent='Great!';
        selectedWord = null;
        drawConnections();
        if(connections.size >= RESTAURANT_VOCAB.length) markActivityComplete('s4', {score:`${connections.size}/${RESTAURANT_VOCAB.length}`});
      } else {
        fb.className='feedback show meh'; fb.textContent='Try again.';
        drawConnections({wordEl, picEl:p});
        setTimeout(()=>drawConnections(), 700);
      }
    });
  });
}

/* ===== Section 5: How to Order Food ===== */
function renderS5(){
  const phrases = ORDER_PHRASES.map(p=>`<div class="phrase-card"><span class="txt">${p}</span><button class="audio-mini" data-say="${p.replace('___','something')}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>`).join('');
  const foodChoices = ORDER_FOOD_CHOICES.map((f,i)=>`<div class="big-choice" data-food="${i}"><div class="bc-ic">${f.ic}</div><div class="bc-lbl">${f.nm}</div></div>`).join('');
  const drinkChoices = ORDER_DRINK_CHOICES.map((d,i)=>`<div class="big-choice" data-drink="${i}"><div class="bc-ic">${d.ic}</div><div class="bc-lbl">${d.nm}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">How to Order Food</h2>
  <p class="section-sub">Listen and repeat.</p>
  <div class="panel">
    <div class="phrase-list">${phrases}</div>
    <hr class="hairline">
    <div class="scene">
      <div class="avatar">${icon('user',{size:36})}</div>
      <div class="bubble" id="s5line">Hello. I'd like ___, please.</div>
    </div>
    <p style="margin-top:16px;font-weight:700;color:var(--navy);">Choose your food.</p>
    <div class="big-choice-grid">${foodChoices}</div>
    <div id="s5drinkStep" style="display:none;">
      <p style="margin-top:20px;font-weight:700;color:var(--navy);">Anything to drink?</p>
      <div class="big-choice-grid">${drinkChoices}</div>
    </div>
    <div id="s5done" class="feedback" style="margin-top:16px;"></div>
  </div>`;
}
function wireS5(){
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'a')));
  let food=null, drink=null;
  const line = document.getElementById('s5line');
  const drinkStep = document.getElementById('s5drinkStep');
  const done = document.getElementById('s5done');
  document.querySelectorAll('#app [data-food]').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-food]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      food = ORDER_FOOD_CHOICES[+c.dataset.food].nm;
      line.textContent = `Hello. I'd like ${food}, please.`;
      speak(line.textContent,'b');
      drinkStep.style.display='block';
    });
  });
  document.querySelectorAll('#app [data-drink]').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-drink]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      drink = ORDER_DRINK_CHOICES[+c.dataset.drink].nm;
      done.className='feedback show good';
      done.textContent = `Excellent! "I'd like ${food}, and ${drink}, please."`;
      markActivityComplete('s5', {score:`${food} + ${drink}`});
    });
  });
}

/* ===== Section 6: Restaurant Conversation (branching) ===== */
function renderS6(){
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Restaurant Conversation</h2>
  <p class="section-sub">Choose the correct answer.</p>
  <div class="panel">
    <div class="scene">
      <div class="avatar">${icon('user',{size:36})}</div>
      <div class="bubble" id="s6server"></div>
    </div>
    <div class="choices" id="s6choices" style="margin-top:18px;"></div>
    <div class="feedback" id="s6fb"></div>
    <div class="checkpoint-track" id="s6track"></div>
  </div>`;
}
function wireS6(){
  let step = 0;
  const server = document.getElementById('s6server');
  const choicesEl = document.getElementById('s6choices');
  const fb = document.getElementById('s6fb');
  const track = document.getElementById('s6track');
  function renderTrack(){
    track.innerHTML = CONVERSATION_STEPS.map((s,i)=>`<span class="checkpoint-pill ${i<step?'done':i===step?'active':''}">${i+1}</span>`).join('');
  }
  function showStep(){
    if(step >= CONVERSATION_STEPS.length){
      server.textContent = "You finished the conversation!";
      choicesEl.innerHTML = '';
      fb.className='feedback show good'; fb.textContent='Excellent! Great job ordering food.';
      markActivityComplete('s6', {score:`${CONVERSATION_STEPS.length}/${CONVERSATION_STEPS.length}`});
      renderTrack();
      return;
    }
    const s = CONVERSATION_STEPS[step];
    server.textContent = s.server;
    speak(s.server,'a');
    fb.className='feedback';
    const shuffled = s.opts.map((o,i)=>({...o,i})).sort(()=>Math.random()-0.5);
    choicesEl.innerHTML = shuffled.map(o=>`<button class="choice-btn" data-correct="${o.correct}"><span class="letter">${String.fromCharCode(65+shuffled.indexOf(o))}</span> ${o.t}</button>`).join('');
    renderTrack();
    choicesEl.querySelectorAll('.choice-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if(btn.dataset.correct === 'true'){
          btn.classList.add('correct');
          fb.className='feedback show good'; fb.textContent = s.feedbackGood;
          setTimeout(()=>{ step++; showStep(); }, 900);
        } else {
          btn.classList.add('wrong');
          fb.className='feedback show meh'; fb.textContent = 'Try again.';
        }
      });
    });
  }
  showStep();
}

/* ===== Section 7: Build Your Order ===== */
function renderS7(){
  const group = (title, items, key) => `
    <div class="order-step">
      <div class="order-step-title">${title}</div>
      <div class="big-choice-grid">
        ${items.map((it,i)=>`<div class="big-choice" data-${key}="${i}"><div class="bc-ic">${it.ic}</div><div class="bc-lbl">${it.nm}</div></div>`).join('')}
      </div>
    </div>`;
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Build Your Order</h2>
  <p class="section-sub">Choose your order.</p>
  <div class="panel">
    ${group('1. Main dish', BUILD_MAINS, 'main')}
    ${group('2. Drink', BUILD_DRINKS, 'drink')}
    ${group('3. Dessert', BUILD_DESSERTS, 'dessert')}
    <div class="order-summary">
      <div class="order-summary-title">YOUR ORDER</div>
      <div class="order-summary-row" id="ordMain">Main dish: —</div>
      <div class="order-summary-row" id="ordDrink">Drink: —</div>
      <div class="order-summary-row" id="ordDessert">Dessert: —</div>
      <div class="order-say-box" id="ordSay" style="display:none;"></div>
    </div>
  </div>`;
}
function wireS7(){
  let main=null, drink=null, dessert=null;
  function update(){
    document.getElementById('ordMain').textContent = `Main dish: ${main || '—'}`;
    document.getElementById('ordDrink').textContent = `Drink: ${drink || '—'}`;
    document.getElementById('ordDessert').textContent = `Dessert: ${dessert || '—'}`;
    if(main && drink && dessert){
      const sayBox = document.getElementById('ordSay');
      sayBox.style.display='block';
      const parts = dessert==='None' ? [main,drink] : [main,drink,dessert];
      const sentence = `Tell the waiter: "I'd like ${parts.join(', ')}, please."`;
      sayBox.textContent = sentence;
      markActivityComplete('s7', {score:`${main}, ${drink}, ${dessert}`});
    }
  }
  document.querySelectorAll('#app [data-main]').forEach(c=>c.addEventListener('click', ()=>{
    document.querySelectorAll('#app [data-main]').forEach(x=>x.classList.remove('sel')); c.classList.add('sel');
    main = BUILD_MAINS[+c.dataset.main].nm; update();
  }));
  document.querySelectorAll('#app [data-drink]').forEach(c=>c.addEventListener('click', ()=>{
    document.querySelectorAll('#app [data-drink]').forEach(x=>x.classList.remove('sel')); c.classList.add('sel');
    drink = BUILD_DRINKS[+c.dataset.drink].nm; update();
  }));
  document.querySelectorAll('#app [data-dessert]').forEach(c=>c.addEventListener('click', ()=>{
    document.querySelectorAll('#app [data-dessert]').forEach(x=>x.classList.remove('sel')); c.classList.add('sel');
    dessert = BUILD_DESSERTS[+c.dataset.dessert].nm; update();
  }));
}

/* ===== Section 8: Restaurant Role-Play ===== */
function renderS8(){
  const menu = RESTAURANT_MENU.map(cat=>`
    <div class="menu-card">
      <h4>${cat.cat}</h4>
      <div class="menu-rows">
        ${cat.items.map(it=>`<div class="menu-row"><span>${it.nm}</span><span class="price">${it.price} baht</span></div>`).join('')}
      </div>
    </div>`).join('');

  const conversation = MODEL_CONVERSATION.map(line=>`
    <div class="phrase-card ${line.who==='w' ? 'waiter' : 'customer'}">
      <span class="txt"><b>${line.label}:</b> ${line.text}</span>
      <button class="audio-mini" data-say="${line.text}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button>
    </div>`).join('');

  const rounds = PRACTICE_ROUNDS.map(r=>`<li>${r}</li>`).join('');

  const phraseCol = (title, phrases, cls) => `
    <div class="roleplay-col ${cls}">
      <h4>${title}</h4>
      <div class="phrase-list">${phrases.map(p=>`<div class="phrase-card"><span class="txt">${p}</span><button class="audio-mini" data-say="${p.replace('___','something')}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>`).join('')}</div>
    </div>`;

  return `
  <div class="section-eyebrow">Speaking Task</div>
  <h2 class="section-title">Ordering Food at a Restaurant</h2>
  <p class="section-sub">Work in a group of 3. Practice ordering food in English.</p>

  <div class="panel">
    <div class="rule-box">
      <b>The Situation</b>
      <p style="margin-top:8px;">Two friends go to a restaurant. They look at the menu, talk about what they like, choose their food, and order. The waiter welcomes them and takes their order.</p>
    </div>
    <div class="role-row" style="margin-top:18px;">
      <span class="role-badge delegate">Student A: Customer</span>
      <span class="role-badge delegate">Student B: Customer</span>
      <span class="role-badge staff">Student C: Waiter</span>
    </div>
  </div>

  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">${RESTAURANT_NAME}: Menu</h3>
    <p class="section-sub" style="margin-top:4px;">Use this menu for your speaking practice.</p>
    <div class="menu-grid">${menu}</div>
  </div>

  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Model Conversation</h3>
    <p class="section-sub" style="margin-top:4px;">Listen to each line, then practice it with your group.</p>
    <div class="phrase-list" style="margin-top:14px;">${conversation}</div>
  </div>

  <div class="panel">
    <div class="rule-box"><b>Practice It 3 Ways</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${rounds}</ul></div>
    <p style="color:var(--muted);font-size:13px;margin-top:12px;">Use the model conversation to help you, but try to speak naturally. You do not need to memorize every word. Small mistakes are okay. The goal is speaking and communication, not perfect grammar.</p>
  </div>

  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Useful Restaurant English</h3>
    <div class="roleplay-cols" style="margin-top:16px;">
      ${phraseCol('Customers', RESTAURANT_PHRASES_CUSTOMER, 'customer')}
      ${phraseCol('Waiter', RESTAURANT_PHRASES_WAITER, 'server')}
    </div>
    <button class="startbtn" id="s8done" style="margin-top:20px;">We practiced ordering food →</button>
  </div>`;
}
function wireS8(){
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'a')));
  document.getElementById('s8done').addEventListener('click', ()=>{ markActivityComplete('s8'); goNext(); });
}

/* ===== Section 9: Restaurant Challenge ===== */
function renderS9(){
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">Restaurant Challenge</h2>
  <p class="section-sub">Complete the mini conversation.</p>
  <div class="panel">
    <div class="checkpoint-track" id="s9track"></div>
    <div class="scene" style="margin-top:16px;">
      <div class="avatar">${icon('user',{size:36})}</div>
      <div class="bubble" id="s9q"></div>
    </div>
    <div class="choices" id="s9choices" style="margin-top:18px;"></div>
    <div id="s9win" style="display:none;text-align:center;margin-top:20px;">
      <div style="font-size:44px;"></div>
      <p style="font-family:'Oswald';color:var(--navy);font-size:20px;margin-top:8px;">You completed the challenge!</p>
      <p style="color:var(--muted);">Great job!</p>
    </div>
  </div>`;
}
function wireS9(){
  let step = 0;
  const track = document.getElementById('s9track');
  const q = document.getElementById('s9q');
  const choicesEl = document.getElementById('s9choices');
  const win = document.getElementById('s9win');
  function renderTrack(){
    track.innerHTML = CHALLENGE_STEPS.map((s,i)=>`<span class="checkpoint-pill ${i<step?'done':i===step?'active':''}">${s.label}</span>`).join('');
  }
  function showStep(){
    renderTrack();
    if(step >= CHALLENGE_STEPS.length){
      q.parentElement.style.display='none';
      choicesEl.style.display='none';
      win.style.display='block';
      markActivityComplete('s9', {completionStatus:'completed'});
      return;
    }
    const s = CHALLENGE_STEPS[step];
    q.textContent = s.q;
    choicesEl.innerHTML = s.opts.map((o,i)=>`<button class="choice-btn"><span class="letter">${String.fromCharCode(65+i)}</span> ${o}</button>`).join('');
    choicesEl.querySelectorAll('.choice-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        btn.classList.add('correct');
        setTimeout(()=>{ step++; showStep(); }, 700);
      });
    });
  }
  showStep();
}

/* ===================== PRACTICE LAB ===================== */
function renderPractice(){
  const vocabCards = LAB_FOOD_VOCAB.map((item,i)=>`
    <div class="sit-card" data-vq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${item.q}</p>
      <div class="choices" data-vchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-vfb="${i}"></div>
    </div>`).join('');
  const exprCards = LAB_RESTAURANT_EXPR.map((item,i)=>`
    <div class="sit-card" data-eq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${item.q}</p>
      <div class="choices" data-echoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-efb="${i}"></div>
    </div>`).join('');
  const listenCards = LAB_LISTEN.map((item,i)=>`
    <div class="sit-card" data-lq="${i}">
      <div class="playbar" style="padding:12px 16px;">
        <button class="play-btn" style="width:44px;height:44px;font-size:17px;" data-lplay="${i}">${icon('play',{size:17})}</button>
        <div style="flex:1;"><div class="play-sub">Listen, then choose.</div></div>
      </div>
      <div class="choices" style="margin-top:14px;" data-lchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-lfb="${i}"></div>
    </div>`).join('');
  const speakCards = LAB_SPEAK_PROMPTS.map(p=>`<div class="sit-card"><p style="font-weight:700;color:var(--orange-deep);">${p.text}</p></div>`).join('');
  return `
  <div class="section-eyebrow">Practice Lab</div>
  <h2 class="section-title">Practice Lab</h2>
  <p class="section-sub">Practice more! (Optional)</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-ptab="vocab">Vocabulary</button>
      <button class="tab-btn" data-ptab="expr">Expressions</button>
      <button class="tab-btn" data-ptab="listen">Listening</button>
      <button class="tab-btn" data-ptab="speak">Speaking</button>
      <button class="tab-btn" data-ptab="partner">Partner</button>
    </div>
    <div class="tab-panel active" data-ppanel="vocab">${vocabCards}</div>
    <div class="tab-panel" data-ppanel="expr">${exprCards}</div>
    <div class="tab-panel" data-ppanel="listen">${listenCards}</div>
    <div class="tab-panel" data-ppanel="speak">${speakCards}<p style="color:var(--muted);font-size:12px;margin-top:10px;">Say it aloud. Ask your teacher or partner to check.</p></div>
    <div class="tab-panel" data-ppanel="partner">
      <div class="sit-card"><p style="font-weight:700;color:var(--navy);">Ask your partner: "What is your favorite food?"</p></div>
      <div class="sit-card"><p style="font-weight:700;color:var(--navy);">Ask your partner: "Do you like spicy food?"</p></div>
    </div>
  </div>`;
}
function wirePractice(){
  const vAnswered = new Set(); let vCorrect = 0;
  const eAnswered = new Set(); let eCorrect = 0;
  function checkOverall(){
    if(vAnswered.size >= LAB_FOOD_VOCAB.length && eAnswered.size >= LAB_RESTAURANT_EXPR.length){
      markActivityComplete('practice', {score:`Vocab ${vCorrect}/${LAB_FOOD_VOCAB.length} · Expr ${eCorrect}/${LAB_RESTAURANT_EXPR.length}`});
    }
  }
  document.querySelectorAll('#app [data-ptab]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-ptab]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-ppanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-ppanel="${btn.dataset.ptab}"]`).classList.add('active');
    });
  });
  LAB_FOOD_VOCAB.forEach((item,i)=>{
    const box = document.querySelector(`[data-vchoices="${i}"]`);
    const fb = document.querySelector(`[data-vfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Great!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Try again.'; }
      if(!vAnswered.has(i)){ vAnswered.add(i); if(+btn.dataset.i === item.correct) vCorrect++; checkOverall(); }
    });
  });
  LAB_RESTAURANT_EXPR.forEach((item,i)=>{
    const box = document.querySelector(`[data-echoices="${i}"]`);
    const fb = document.querySelector(`[data-efb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Good choice!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Try again.'; }
      if(!eAnswered.has(i)){ eAnswered.add(i); if(+btn.dataset.i === item.correct) eCorrect++; checkOverall(); }
    });
  });
  LAB_LISTEN.forEach((item,i)=>{
    document.querySelector(`[data-lplay="${i}"]`).addEventListener('click', ()=> speak(item.audio,'a'));
    const box = document.querySelector(`[data-lchoices="${i}"]`);
    const fb = document.querySelector(`[data-lfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Excellent!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Listen again.'; }
    });
  });
}

/* ===== Section 10: Reflection & Take Home ===== */
function renderS10(){
  const rows = REFLECTION_ITEMS.map(r=>`
    <div class="checklist-row" data-k="${r.k}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${r.lbl}</div>
    </div>`).join('');
  const feelings = FEELING_OPTIONS.map((f,i)=>`
    <div class="big-choice" data-feel="${i}" style="flex:1;">
      <div class="bc-ic">${f.ic}</div>
      <div class="bc-lbl">${f.lbl}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 10</div>
  <h2 class="section-title">Reflection</h2>
  <p class="section-sub">What can you do now?</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-weight:700;color:var(--navy);">How did you feel?</p>
    <div style="display:flex;gap:12px;margin-top:12px;">${feelings}</div>
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
function wireS10(){
  const rows = document.querySelectorAll('#app .checklist-row');
  const checked = new Set();
  rows.forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.k); else checked.delete(row.dataset.k);
      if(checked.size >= REFLECTION_ITEMS.length) markActivityComplete('s10', {score:`${checked.size}/${REFLECTION_ITEMS.length} checked`});
    });
  });
  document.querySelectorAll('#app [data-feel]').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-feel]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      sendGranularRecord('Unit 6: Feeling', {score: FEELING_OPTIONS[+c.dataset.feel].lbl});
    });
  });
}

/* ===================== COMPLETE (final end screen) ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 6 COMPLETE</div>
    <h1>You can talk about <span>food and eating.</span></h1>
    <p>Now try the final assignment: order real food in English at a real restaurant with your group.</p>
    <div class="complete-actions">
      <a href="/assignments/comm-u6-roleplay/index.html" class="download-btn">Final Assignment: Order Food at a Restaurant →</a>
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
  document.getElementById('completePracticeBtn').addEventListener('click', ()=> goTo(10));
  document.getElementById('completeHomeBtn').addEventListener('click', ()=> goTo(0));

  const stats = document.getElementById('completeStats');
  if(stats){
    const speakingTask = Progress.activities['s8'] ? 'Yes' : 'No';
    const challenge = Progress.activities['s9'] ? 'Yes' : 'No';
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
  {r:renderS9, w:wireS9},
  {r:renderPractice, w:wirePractice},
  {r:renderS10, w:wireS10},
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
