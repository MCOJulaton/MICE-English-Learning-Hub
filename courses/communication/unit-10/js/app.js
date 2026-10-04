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

/* ===================== AUDIO PLAYER (real licensed Q Skills recordings) ===================== */
const AudioPlayer = (function(){
  const els = new Map();
  let onStateChange = ()=>{};
  function get(src){
    if(!els.has(src)){
      const a = new Audio(src);
      a.preload = 'none';
      a.addEventListener('play', notify); a.addEventListener('pause', notify); a.addEventListener('ended', notify);
      els.set(src, a);
    }
    return els.get(src);
  }
  function notify(){ onStateChange(); }
  function stopOthers(exceptSrc){ els.forEach((a,src)=>{ if(src!==exceptSrc && !a.paused) a.pause(); }); }
  return {
    onChange(fn){ onStateChange = fn; },
    toggle(src){ const a = get(src); if(a.paused){ stopOthers(src); a.play(); } else { a.pause(); } },
    isPlaying(src){ const a = els.get(src); return !!a && !a.paused && !a.ended; },
    stopAll(){ els.forEach(a=>a.pause()); }
  };
})();
function renderAudioTrack(src, label, sub){
  return `<div class="playbar audio-track" data-audio-wrap="${src}">
    <button class="play-btn" data-audio-btn="${src}" aria-label="Play ${label}">${icon('play',{size:22})}</button>
    <div><div class="play-label">${label}</div><div class="play-sub">${sub}</div></div>
  </div>`;
}
function wireAudioTracks(){
  document.querySelectorAll('#app [data-audio-btn]').forEach(btn=>{
    btn.addEventListener('click', ()=> AudioPlayer.toggle(btn.dataset.audioBtn));
  });
  AudioPlayer.onChange(()=>{
    document.querySelectorAll('#app [data-audio-btn]').forEach(btn=>{
      const playing = AudioPlayer.isPlaying(btn.dataset.audioBtn);
      btn.classList.toggle('playing', playing);
      btn.innerHTML = playing ? icon('pause',{size:22}) : icon('play',{size:22});
    });
  });
}

/* ===================== SMALL SHARED HELPERS ===================== */
function teacherNote(text){
  return `<div class="rule-box" style="border-left:4px solid var(--teal);"><b>Teacher</b><p style="margin-top:6px;">${text}</p></div>`;
}
function partnerPrompt(text){
  return `<p class="section-sub" style="margin-top:10px;"><b style="color:var(--navy);font-style:normal;">🧑‍🤝‍🧑 With a partner:</b> ${text}</p>`;
}

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>What Makes a <span>Good Home?</span></h1>
    <p>Unit 10: Architecture, Day 1. Point, choose, and compare your way through three apartments, then decide which one Karen should choose.</p>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Housing vocabulary</div>
      <div class="signchip"><span class="arrow">→</span> Real listening practice</div>
      <div class="signchip"><span class="arrow">→</span> Compare apartments</div>
      <div class="signchip"><span class="arrow">→</span> Group decision</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up (point/choose first, listening last) ===== */
function renderS1(){
  const contrastRows = CONTRAST_PAIRS.map(p=>`
    <div class="sit-card" data-contrast="${p.id}">
      <div class="big-choice-grid" style="grid-template-columns:1fr 1fr;">
        <div class="big-choice" data-pick="${p.id}" data-side="a"><img class="bc-photo" src="${p.a.img}" alt="${p.a.lbl}" loading="lazy"><div class="bc-lbl">${p.a.lbl}</div></div>
        <div class="big-choice" data-pick="${p.id}" data-side="b"><img class="bc-photo" src="${p.b.img}" alt="${p.b.lbl}" loading="lazy"><div class="bc-lbl">${p.b.lbl}</div></div>
      </div>
    </div>`).join('');
  const wordChips = HOME_WORDS.map(w=>`<div class="big-choice" data-word="${w}"><div class="bc-lbl">${w}</div></div>`).join('');
  const matchRows = QCLASSROOM_MATCH.map((m,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt" style="font-weight:700;color:var(--navy);">${m.student} says:</div>
      <div class="fr-prompt">${m.idea}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 1 · Warm-Up</div>
  <h2 class="section-title">What Makes a Good Home?</h2>
  <p class="section-sub">Point to the one you like better. There is no wrong answer.</p>
  <div class="panel">${contrastRows}</div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Click the words for places people live.</h3>
    <div class="big-choice-grid">${wordChips}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Bonus: Listen</h3>
    ${renderAudioTrack(AUDIO.qClassroom, 'The Q Classroom', 'Four students share their opinion about what matters most in a home.')}
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">Listen. What does each student think matters most?</h3>
    ${matchRows}
    <button class="startbtn" id="s1done" style="margin-top:20px;">I'm ready →</button>
  </div>`;
}
function wireS1(){
  wireAudioTracks();
  CONTRAST_PAIRS.forEach(p=>{
    document.querySelectorAll(`[data-pick="${p.id}"]`).forEach(c=>{
      c.addEventListener('click', ()=>{
        document.querySelectorAll(`[data-pick="${p.id}"]`).forEach(x=>x.classList.remove('sel'));
        c.classList.add('sel');
      });
    });
  });
  document.querySelectorAll('#app [data-word]').forEach(c=>c.addEventListener('click', ()=> c.classList.toggle('sel')));
  document.getElementById('s1done').addEventListener('click', ()=>{ markActivityComplete('s1', {completionStatus:'reached'}); goNext(); });
}

/* ===== Section 2: Key Vocabulary (unchanged) ===== */
function renderS2(){
  const cards = VOCAB.map(v=>`
    <div class="vocab-card" data-vocab="${v.id}">
      <div class="vc-head"><span class="vc-ic">${v.ic}</span><div><div class="vc-nm">${v.nm}</div><div class="vc-type">${v.type}</div></div></div>
      <div class="vc-body"><div>${v.def}</div><div class="vc-ex">"${v.ex}"</div>
        <button class="audio-mini" data-say="${v.ex}" style="margin-top:10px;"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
      </div>
    </div>`).join('');
  const fills = VOCAB_FILL.map((f,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt">${f.sentence}</div>
      <input type="text" data-fill="${i}" placeholder="word">
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Key Vocabulary</h2>
  <p class="section-sub">Click a card to see the meaning. Then complete the sentences.</p>
  <div class="panel"><div class="vocab-grid">${cards}</div></div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Complete each sentence.</h3>
    ${fills}
    <button class="reveal-btn" id="s2check">Check My Answers</button>
    <div class="feedback" id="s2nudge"></div>
    <div class="answer-key" id="s2key"></div>
  </div>`;
}
function wireS2(){
  document.querySelectorAll('#app .vocab-card').forEach(c=>c.addEventListener('click', ()=> c.classList.toggle('open')));
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', e=>{ e.stopPropagation(); speak(b.dataset.say); }));
  document.getElementById('s2check').addEventListener('click', ()=>{
    const nudge = document.getElementById('s2nudge');
    const inputs = VOCAB_FILL.map((f,i)=> document.querySelector(`[data-fill="${i}"]`));
    const values = inputs.map(inp=>inp.value.trim());
    if(values.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please answer every question before checking.';
      return;
    }
    nudge.className = 'feedback';
    let correct = 0;
    const results = VOCAB_FILL.map((f,i)=>{
      const isCorrect = values[i].toLowerCase() === f.answer;
      if(isCorrect) correct++;
      inputs[i].classList.toggle('correct', isCorrect);
      inputs[i].classList.toggle('wrong', !isCorrect);
      return {given:values[i], isCorrect};
    });
    const key = document.getElementById('s2key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Results</b><br>' + results.map((r,i)=>
      r.isCorrect
        ? `${i+1}. ${r.given}, correct`
        : `${i+1}. ${r.given}, not quite. Correct answer: ${VOCAB_FILL[i].answer}`
    ).join('<br>');
    const answers = results.map((r,i)=>`Q${i+1}: ${r.given}${r.isCorrect ? ' [correct]' : ` [wrong, correct: ${VOCAB_FILL[i].answer}]`}`).join(' | ');
    markActivityComplete('s2', {score:`${correct}/${VOCAB_FILL.length}`, answers});
  });
}

/* ===== Section 3: Apartment Detective — Pair Task (NEW) ===== */
function renderApartmentMap(){
  const rent = APARTMENT_FACTS.find(f=>f.feature==='Rent');
  const F = 'font-family="Inter,Arial,sans-serif" font-weight="700"';
  const card = (x, y, num, name, value, color) => {
    const exp = value.toLowerCase() === 'expensive';
    const rLabel = 'Rent: ' + (exp ? '$$$ ' : '$ ') + value;
    return `<g>
      <rect x="${x}" y="${y}" width="480" height="176" rx="24" fill="#fff" stroke="${color}" stroke-width="7"/>
      <circle cx="${x+58}" cy="${y+54}" r="34" fill="${color}"/>
      <text x="${x+58}" y="${y+68}" text-anchor="middle" font-size="42" fill="#fff" ${F}>${num}</text>
      <text x="${x+112}" y="${y+72}" font-size="58" fill="#163B65" ${F}>${name}</text>
      <rect x="${x+22}" y="${y+100}" width="436" height="58" rx="29" fill="${exp ? '#FBE3DC' : '#DDF0EC'}" stroke="${exp ? '#C2452B' : '#0F766E'}" stroke-width="5"/>
      <text x="${x+240}" y="${y+141}" text-anchor="middle" font-size="40" fill="${exp ? '#8F2B14' : '#0B5A56'}" ${F}>${rLabel}</text>
    </g>`;
  };
  const route = (d, color) => `<path d="${d}" fill="none" stroke="#0A1B30" stroke-opacity=".55" stroke-width="18" stroke-linecap="round" stroke-dasharray="2 26"/><path d="${d}" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round" stroke-dasharray="2 26"/>`;
  const chip = (cx, cy, text, color) => `<rect x="${cx-70}" y="${cy-30}" width="140" height="60" rx="30" fill="${color}" stroke="#fff" stroke-width="5"/><text x="${cx}" y="${cy+13}" text-anchor="middle" font-size="36" fill="#fff" ${F}>${text}</text>`;
  const pin = (cx, cy, num, color) => `<circle cx="${cx}" cy="${cy}" r="40" fill="${color}" stroke="#fff" stroke-width="7"/><text x="${cx}" y="${cy+13}" text-anchor="middle" font-size="40" fill="#fff" ${F}>${num}</text>`;
  return `
  <svg viewBox="0 0 1200 669" role="img" aria-label="Map of the area from above. The campus is in the middle. First Street apartment is very close to the campus and has expensive rent. Beach apartment is far from the campus, by the sea, and has cheap rent. Downtown apartment is far from the campus, among tall buildings, and has cheap rent." style="width:100%;height:auto;display:block;border-radius:12px;">
    <image href="../../../assets/images/comm-unit10/map.jpg" width="1200" height="669" preserveAspectRatio="xMidYMid slice"/>
    ${route('M 520 300 C 420 260 330 230 250 175', '#F5A55B')}
    ${route('M 720 300 C 820 300 940 310 1030 330', '#F5A55B')}
    ${route('M 620 332 L 620 450', '#2CC4B8')}
    <rect x="490" y="268" width="260" height="64" rx="32" fill="#163B65" stroke="#fff" stroke-width="5"/>
    <text x="620" y="312" text-anchor="middle" font-size="36" fill="#fff" ${F}>CAMPUS</text>
    ${pin(620, 490, 1, '#0F766E')}
    ${chip(700, 395, 'Close', '#0F766E')}
    ${pin(1050, 340, 2, '#D9740F')}
    ${chip(880, 262, 'Far', '#D9740F')}
    ${pin(215, 150, 3, '#D9740F')}
    ${chip(385, 232, 'Far', '#D9740F')}
    ${card(690, 440, 1, 'First Street', rent.firstStreet, '#0F766E')}
    ${card(700, 24, 2, 'Beach', rent.beach, '#D9740F')}
    ${card(18, 450, 3, 'Downtown', rent.downtown, '#D9740F')}
  </svg>
  <p class="section-sub" style="margin-top:8px;font-size:12.5px;">Map of the area, not to scale. Each card shows the apartment's rent.</p>`;
}
function renderS3(){
  const rows = APARTMENT_FACTS.map(f=>`
    <tr>
      <td style="padding:8px 5px;font-weight:700;color:var(--navy);">${f.ic} ${f.feature}</td>
      <td style="padding:8px 5px;">${f.firstStreet}</td>
      <td style="padding:8px 5px;">${f.beach}</td>
      <td style="padding:8px 5px;">${f.downtown}</td>
    </tr>`).join('');
  const qRows = DETECTIVE_QUESTIONS.map((q,i)=>`
    <div class="sit-card" data-dq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${q.q}</p>
      <div class="choices" data-dqchoices="${i}">
        ${q.opts.map(o=>`<button class="choice-btn" data-v="${o}">${o}</button>`).join('')}
      </div>
      <div class="feedback" data-dqfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Pair Task</div>
  <h2 class="section-title">Apartment Detective</h2>
  <p class="section-sub">Karen is comparing three apartments: First Street, Beach, and Downtown. Look at the map. Then read the table together.</p>
  <div class="panel">${renderApartmentMap()}</div>
  <div class="panel">
    <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13.5px;">
      <tr><th style="padding:8px 5px;text-align:left;color:var(--muted);font-size:13px;"></th><th style="padding:8px 5px;text-align:left;color:var(--navy);">First Street</th><th style="padding:8px 5px;text-align:left;color:var(--navy);">Beach</th><th style="padding:8px 5px;text-align:left;color:var(--navy);">Downtown</th></tr>
      ${rows}
    </table></div>
  </div>
  <div class="panel">
    ${partnerPrompt(`Take turns reading the table out loud. Then answer together: <i>"${DETECTIVE_FRAME}"</i>`)}
    <h3 style="font-size:16px;color:var(--navy);margin-top:16px;">Now answer:</h3>
    ${qRows}
    <button class="startbtn" id="s3done" style="margin-top:20px;">We're ready →</button>
  </div>`;
}
function wireS3(){
  const done = new Set();
  DETECTIVE_QUESTIONS.forEach((q,i)=>{
    const box = document.querySelector(`[data-dqchoices="${i}"]`);
    const fb = document.querySelector(`[data-dqfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      const isCorrect = btn.dataset.v === q.answer;
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
      fb.className = 'feedback show ' + (isCorrect ? 'good' : 'meh');
      fb.textContent = isCorrect ? 'Correct!' : `Look at the table again. Answer: ${q.answer}`;
      done.add(i);
    });
  });
  document.getElementById('s3done').addEventListener('click', ()=>{
    markActivityComplete('s3', {score:`${done.size}/${DETECTIVE_QUESTIONS.length} answered`});
    goNext();
  });
}

/* ===== Section 4: Guided Listening — two listens (real audio) ===== */
function renderS4(){
  const notesBoxes = APARTMENT_NOTES.map(n=>`
    <div class="sit-card"><p style="font-weight:700;color:var(--navy);">${n}</p><textarea data-notes="${n}" rows="3" style="width:100%;margin-top:8px;padding:10px;border:2px solid var(--line);border-radius:8px;font-family:inherit;font-size:13.5px;" placeholder="Write notes here..."></textarea></div>`).join('');
  const pointRows = APARTMENT_POINTS.map((p,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt">${p.stmt}</div>
      <input type="text" data-ap="${i}" placeholder="First Street / Beach / Downtown">
    </div>`).join('');
  const tfRows = APARTMENT_TF.map((t,i)=>`
    <div class="sit-card" data-tf="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${t.stmt}</p>
      <div class="choices" data-tfchoices="${i}">
        <button class="choice-btn" data-v="T"><span class="letter">T</span> True</button>
        <button class="choice-btn" data-v="F"><span class="letter">F</span> False</button>
      </div>
      <div class="feedback" data-tffb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Guided Listening</div>
  <h2 class="section-title">Let's Find a New Apartment</h2>
  <p class="section-sub">Karen and a friend compare three apartments. You will listen two times.</p>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Listen 1: Karen's Favorite</h3>
    ${renderAudioTrack(AUDIO.listening1, "Let's Find a New Apartment", 'Two friends discuss three apartment choices.')}
    <p style="font-weight:700;color:var(--navy);margin-top:16px;">${LISTEN1_QUESTION.q}</p>
    <div class="choices" id="listen1choices">
      ${LISTEN1_QUESTION.opts.map(o=>`<button class="choice-btn" data-v="${o}">${o}</button>`).join('')}
    </div>
    <div class="feedback show" id="listen1fb" style="display:none;"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Listen 2: The Details</h3>
    <p class="section-sub">Take notes on each apartment.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:14px;">${notesBoxes}</div>
    ${partnerPrompt('Compare your notes before you match the sentences below.')}
    <h3 style="font-size:16px;color:var(--navy);margin-top:16px;">Which apartment does each point describe?</h3>
    ${pointRows}
    <button class="reveal-btn" id="s4bcheck">Check My Answers</button>
    <div class="feedback" id="s4bnudge"></div>
    <div class="answer-key" id="s4bkey"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">True or False</h3>
    ${tfRows}
  </div>`;
}
function apartmentAnswerMatches(given, correctRaw){
  const g = given.trim().toLowerCase();
  return correctRaw.split(' or ').some(opt => g === opt.trim().toLowerCase());
}
function wireS4(){
  wireAudioTracks();
  const l1box = document.getElementById('listen1choices');
  const l1fb = document.getElementById('listen1fb');
  l1box.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    [...l1box.children].forEach(b=>b.classList.remove('correct','wrong'));
    const isCorrect = btn.dataset.v === LISTEN1_QUESTION.answer;
    btn.classList.add(isCorrect ? 'correct' : 'wrong');
    l1fb.style.display='block';
    l1fb.className = 'feedback show ' + (isCorrect ? 'good' : 'meh');
    l1fb.textContent = isCorrect ? 'Correct! Karen likes the Beach apartment best.' : `Listen again. Answer: ${LISTEN1_QUESTION.answer}`;
  });
  document.getElementById('s4bcheck').addEventListener('click', ()=>{
    const nudge = document.getElementById('s4bnudge');
    const inputs = APARTMENT_POINTS.map((p,i)=> document.querySelector(`[data-ap="${i}"]`));
    const values = inputs.map(inp=>inp.value.trim());
    if(values.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please answer every question before checking.';
      return;
    }
    nudge.className = 'feedback';
    let correct = 0;
    const results = APARTMENT_POINTS.map((p,i)=>{
      const isCorrect = apartmentAnswerMatches(values[i], p.answer);
      if(isCorrect) correct++;
      inputs[i].classList.toggle('correct', isCorrect);
      inputs[i].classList.toggle('wrong', !isCorrect);
      return {given:values[i], isCorrect};
    });
    const key = document.getElementById('s4bkey');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Results</b><br>' + results.map((r,i)=>
      r.isCorrect
        ? `${i+1}. ${r.given}, correct`
        : `${i+1}. ${r.given}, not quite. Correct answer: ${APARTMENT_POINTS[i].answer}`
    ).join('<br>');
    const answers = results.map((r,i)=>`Q${i+1}: ${r.given}${r.isCorrect ? ' [correct]' : ` [wrong, correct: ${APARTMENT_POINTS[i].answer}]`}`).join(' | ');
    markActivityComplete('s4notes', {score:`${correct}/${APARTMENT_POINTS.length}`, answers});
  });
  const tfDone = new Set();
  APARTMENT_TF.forEach((t,i)=>{
    const box = document.querySelector(`[data-tfchoices="${i}"]`);
    const fb = document.querySelector(`[data-tffb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(btn.dataset.v === t.answer){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent = t.note || 'Correct!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent = t.note || 'Try again.'; }
      tfDone.add(i);
      if(tfDone.size >= APARTMENT_TF.length) markActivityComplete('s4', {score:`${tfDone.size}/${APARTMENT_TF.length}`});
    });
  });
}

/* ===== Section 5: Stand Up & Vote (NEW, break/movement) ===== */
function renderS5(){
  const chips = VOTE_FEATURES.map(f=>`<div class="big-choice" data-vote="${f.lbl}"><div class="bc-ic">${f.ic}</div><div class="bc-lbl">${f.lbl}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 5 · Break</div>
  <h2 class="section-title">Stand Up & Vote</h2>
  ${teacherNote('In class: call out one feature at a time. Students stand and walk to a corner of the room that matches their choice. Online or seated class: students click their choice below instead.')}
  <div class="panel">
    <p class="section-sub">Which feature matters most to you in a home? Click one.</p>
    <div class="big-choice-grid">${chips}</div>
    <div class="feedback show good" id="s5fb" style="display:none;margin-top:18px;"></div>
    <button class="startbtn" id="s5done" style="margin-top:20px;">Next →</button>
  </div>`;
}
function wireS5(){
  let picked = null;
  document.querySelectorAll('#app [data-vote]').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-vote]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      picked = c.dataset.vote;
      const fb = document.getElementById('s5fb');
      fb.style.display = 'block';
      fb.textContent = `You voted: ${picked}`;
    });
  });
  document.getElementById('s5done').addEventListener('click', ()=>{
    markActivityComplete('s5', {completionStatus:'reached', answers: picked || ''});
    goNext();
  });
}

/* ===== Section 6: Opinions & Pros/Cons (real audio, combined) ===== */
function renderS6(){
  const tip = OPINION_TIP.map(t=>`<li>${t}</li>`).join('');
  const convos = OPINION_CONVOS.map((c,i)=>`
    <div class="sit-card" data-oc="${i}">
      <p style="font-weight:700;color:var(--navy);">Conversation ${i+1}: ${c.names}</p>
      <p class="section-sub" style="margin-top:2px;">Check every opinion you hear.</p>
      <div class="choices" data-occhoices="${i}">
        ${c.opts.map((o,j)=>`<button class="choice-btn multi" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-ocfb="${i}"></div>
    </div>`).join('');
  const pros = PROSCONS_ROWS.filter(r=>r.side==='pro');
  const cons = PROSCONS_ROWS.filter(r=>r.side==='con');
  const col = (title,rows,prefix) => `
    <div>
      <h3 style="font-size:15px;color:var(--navy);">${title}</h3>
      ${rows.map((r,i)=>`<div class="fill-row"><div class="fr-num">${i+1}</div><input type="text" data-${prefix}="${i}" placeholder="what did you hear?"></div>`).join('')}
    </div>`;
  return `
  <div class="section-eyebrow">Section 6 · Step A</div>
  <h2 class="section-title">Listening for Opinions</h2>
  <p class="section-sub">Listen for opinion words and phrases.</p>
  <div class="panel">
    <div class="rule-box"><b>Tip</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul></div>
    ${renderAudioTrack(AUDIO.listenSkillEx, 'Examples', 'Listen to how opinions are signaled in short sentences.')}
  </div>
  <div class="panel">
    ${renderAudioTrack(AUDIO.listenSkillAct, 'Four Conversations', 'Listen to four short conversations about housing.')}
    ${convos}
    ${partnerPrompt('Compare your checked answers before you click to check.')}
    <button class="reveal-btn" id="s6check">Check My Answers</button>
    <div class="feedback" id="s6nudge"></div>
    <div class="answer-key" id="s6key"></div>
  </div>
  <div class="section-eyebrow" style="margin-top:36px;">Section 6 · Step B</div>
  <h2 class="section-title">Note-Taking: Pros and Cons</h2>
  <p class="section-sub">Listen to John and Amanda talk about John's dormitory. Take notes in a Pros/Cons chart.</p>
  <div class="panel">
    ${renderAudioTrack(AUDIO.notetaking, 'Pros and Cons', "John and Amanda talk about John's dormitory.")}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:22px;">
      ${col('Pros', pros, 'pro')}
      ${col('Cons', cons, 'con')}
    </div>
    ${partnerPrompt('Compare your notes before you click to check.')}
    <button class="reveal-btn" id="s6bcheck">Check My Answers</button>
    <div class="feedback" id="s6bnudge"></div>
    <div class="answer-key" id="s6bkey"></div>
  </div>`;
}
function wireS6(){
  wireAudioTracks();
  const selections = OPINION_CONVOS.map(()=>new Set());
  OPINION_CONVOS.forEach((c,i)=>{
    const box = document.querySelector(`[data-occhoices="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      const j = +btn.dataset.i;
      btn.classList.toggle('sel');
      if(btn.classList.contains('sel')) selections[i].add(j); else selections[i].delete(j);
    });
  });
  let step6aDone = false, step6bDone = false;
  function maybeComplete(){
    if(step6aDone && step6bDone) markActivityComplete('s6', {completionStatus:'completed'});
  }
  document.getElementById('s6check').addEventListener('click', ()=>{
    const nudge = document.getElementById('s6nudge');
    if(selections.some(s=>!s.size)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please check at least one opinion in every conversation before checking.';
      return;
    }
    nudge.className = 'feedback';
    let correctTotal = 0, possibleTotal = 0;
    const answersParts = [];
    OPINION_CONVOS.forEach((c,i)=>{
      possibleTotal += c.correct.length;
      c.correct.forEach(j=>{ if(selections[i].has(j)) correctTotal++; });
      const fb = document.querySelector(`[data-ocfb="${i}"]`);
      fb.className = 'feedback show good';
      fb.textContent = 'Correct opinions: ' + c.correct.map(j=>c.opts[j]).join(' / ');
      const given = [...selections[i]].map(j=>c.opts[j]).join(', ');
      answersParts.push(`Conversation ${i+1}: ${given}`);
    });
    sendGranularOpinions(`${correctTotal}/${possibleTotal}`, answersParts.join(' | '));
    step6aDone = true;
    maybeComplete();
  });
  function sendGranularOpinions(score, answers){
    sendProgressRecord(buildRecord('s6-opinions', {score, completionStatus:'completed', answers}));
  }
  const proRows = PROSCONS_ROWS.filter(r=>r.side==='pro');
  const conRows = PROSCONS_ROWS.filter(r=>r.side==='con');
  document.getElementById('s6bcheck').addEventListener('click', ()=>{
    const nudge = document.getElementById('s6bnudge');
    const proValues = proRows.map((r,i)=> document.querySelector(`[data-pro="${i}"]`).value.trim());
    const conValues = conRows.map((r,i)=> document.querySelector(`[data-con="${i}"]`).value.trim());
    if(proValues.some(v=>!v) || conValues.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please fill in every note before checking.';
      return;
    }
    nudge.className = 'feedback';
    const pros = proRows.map(r=>r.label).join(', ');
    const cons = conRows.map(r=>r.label).join(', ');
    const key = document.getElementById('s6bkey');
    key.className = 'answer-key show';
    key.innerHTML = `<b>Your Notes vs. What the Recording Covered</b><br><b>Your Pros:</b> ${proValues.join(', ')}<br><b>Recording's Pros:</b> ${pros}<br><b>Your Cons:</b> ${conValues.join(', ')}<br><b>Recording's Cons:</b> ${cons}`;
    const answers = `Pros: ${proValues.join(', ')} [recording: ${pros}] | Cons: ${conValues.join(', ')} [recording: ${cons}]`;
    sendProgressRecord(buildRecord('s6-procon', {score:`${PROSCONS_ROWS.length}/${PROSCONS_ROWS.length} answered`, completionStatus:'completed', answers}));
    step6bDone = true;
    maybeComplete();
  });
}

/* ===== Section 7: Group Decision Task (NEW) ===== */
let groupSentence = '';
function renderS7(){
  const apts = APARTMENT_NOTES.map(n=>`<div class="big-choice" data-decide="${n}"><div class="bc-lbl">${n}</div></div>`).join('');
  const reasons = DECISION_REASONS.map(r=>`<button class="choice-btn multi" data-reason="${r}"><span class="letter">+</span> ${r}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 7 · Group Decision</div>
  <h2 class="section-title">Which Apartment Should Karen Choose?</h2>
  <p class="section-sub">Work with your group. Choose ONE apartment, then choose your reasons.</p>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">1. Choose an apartment</h3>
    <div class="big-choice-grid">${apts}</div>
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">2. Choose your reasons (click all that apply)</h3>
    <div class="choices" id="s7reasons">${reasons}</div>
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">3. Complete the sentence</h3>
    <p class="section-sub">Use this frame: <i>"${DECISION_FRAME}"</i></p>
    <div class="fill-row" style="margin-top:10px;">
      <div class="fr-prompt">We choose</div>
      <input type="text" id="s7apt" placeholder="apartment" readonly style="background:var(--cream);font-weight:700;">
      <div class="fr-prompt">because it is</div>
      <input type="text" id="s7reason" placeholder="your reason(s)">
    </div>
    <button class="startbtn" id="s7done" style="margin-top:20px;">We decided →</button>
  </div>`;
}
function wireS7(){
  const aptInput = document.getElementById('s7apt');
  const reasonInput = document.getElementById('s7reason');
  const chosenReasons = new Set();
  document.querySelectorAll('#app [data-decide]').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-decide]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      aptInput.value = c.dataset.decide;
    });
  });
  document.getElementById('s7reasons').addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    btn.classList.toggle('sel');
    const r = btn.dataset.reason;
    if(btn.classList.contains('sel')) chosenReasons.add(r); else chosenReasons.delete(r);
    reasonInput.value = [...chosenReasons].join(', ');
  });
  document.getElementById('s7done').addEventListener('click', ()=>{
    if(!aptInput.value || !reasonInput.value.trim()){
      alert('Please choose an apartment and at least one reason first.');
      return;
    }
    const sentence = `We choose ${aptInput.value} because it is ${reasonInput.value.trim()}.`;
    groupSentence = sentence;
    markActivityComplete('s7', {completionStatus:'completed', answers: sentence});
    goNext();
  });
}

/* ===== Section 8: Share Your Choice (NEW, low-pressure) ===== */
function renderS8(){
  return `
  <div class="section-eyebrow">Section 8 · Share</div>
  <h2 class="section-title">Share Your Choice</h2>
  ${teacherNote('No unrehearsed speaking required. Groups may read their sentence aloud, nominate one speaker, or simply hold up / show their answer for the teacher to see.')}
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Your group's sentence</h3>
    <div class="rule-box" id="s8sentence"><i>Go back to Section 7 if this is empty.</i></div>
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">Choose how your group will share</h3>
    <div class="choices" id="s8mode">
      <button class="choice-btn" data-mode="read">We will read it out loud.</button>
      <button class="choice-btn" data-mode="nominate">We will nominate one speaker.</button>
      <button class="choice-btn" data-mode="show">We will just show our answer.</button>
    </div>
    <div class="fill-row" id="s8speakerRow" style="display:none;margin-top:16px;">
      <div class="fr-prompt">Our speaker is:</div>
      <input type="text" id="s8speaker" placeholder="name">
    </div>
    <button class="startbtn" id="s8done" style="margin-top:20px;">We're ready to share →</button>
  </div>`;
}
function wireS8(){
  if(groupSentence) document.getElementById('s8sentence').textContent = groupSentence;
  const box = document.getElementById('s8mode');
  const speakerRow = document.getElementById('s8speakerRow');
  let mode = '';
  box.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    [...box.children].forEach(b=>b.classList.remove('sel'));
    btn.classList.add('sel');
    mode = btn.dataset.mode;
    speakerRow.style.display = mode === 'nominate' ? 'flex' : 'none';
  });
  document.getElementById('s8done').addEventListener('click', ()=>{
    if(!mode){ alert('Please choose how your group will share first.'); return; }
    const speaker = document.getElementById('s8speaker').value.trim();
    markActivityComplete('s8', {completionStatus:'completed', answers:`mode: ${mode}${speaker ? `, speaker: ${speaker}` : ''}`});
    goNext();
  });
}

/* ===== Section 9: Exit Ticket (NEW) ===== */
function renderS9(){
  const wordChips = VOCAB.map(v=>`<div class="big-choice" data-exitword="${v.nm}"><div class="bc-ic">${v.ic}</div><div class="bc-lbl">${v.nm}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 9 · Exit Ticket</div>
  <h2 class="section-title">Before You Go</h2>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">1. Choose ONE new word from today.</h3>
    <div class="big-choice-grid">${wordChips}</div>
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">2. Finish the sentence.</h3>
    <p class="section-sub">"${EXIT_PROMPT}"</p>
    <input type="text" id="s9answer" placeholder="A good home is ___." style="width:100%;margin-top:10px;padding:12px;border:2px solid var(--line);border-radius:8px;font-family:inherit;font-size:14.5px;">
    <button class="startbtn" id="s9done" style="margin-top:20px;">Submit →</button>
  </div>`;
}
function wireS9(){
  let word = '';
  document.querySelectorAll('#app [data-exitword]').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-exitword]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      word = c.dataset.exitword;
    });
  });
  document.getElementById('s9done').addEventListener('click', ()=>{
    const answer = document.getElementById('s9answer').value.trim();
    if(!word || !answer){
      alert('Please choose a word and finish the sentence first.');
      return;
    }
    markActivityComplete('s9', {completionStatus:'completed', answers:`word: ${word} | sentence: A good home is ${answer}`});
    goNext();
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 10 COMPLETE</div>
    <h1>You can compare <span>apartments and opinions.</span></h1>
    <p>Next: Unit 11 continues Architecture with housing problems and your final "Design a Home" assignment.</p>
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
  {r:renderS9, w:wireS9},
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
  buildProgress();
  AudioPlayer.stopAll();
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
