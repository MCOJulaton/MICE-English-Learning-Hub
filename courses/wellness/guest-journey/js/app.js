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

/* ===================== DATA COLLECTION MODULE ===================== */
const DATA_ENDPOINT = "https://script.google.com/macros/s/AKfycbxDECOuXf3HMxPVLT1fhfOHE5g-Gq1juG5enaCoUrShk9vEMfctgy-URKmqmvPGeoE/exec";

const TRACKED_ACTIVITIES = ['s0','s0b','s1','s1game','s1speak','s2','s2game','s2speak','s3','s3game','s3speak','s4','s5'];

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
    activity, score, completionStatus
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
  if(prev && prev.completionStatus===completionStatus && prev.score===score) return;
  Progress.activities[key] = { status:completionStatus, score, completionStatus };
  sendProgressRecord(buildRecord(key, {score, completionStatus}));
  updateTopbarBadge();
  saveCheckinState();
}
function completedCount(){ return TRACKED_ACTIVITIES.filter(k => Progress.activities[k]).length; }
function updateTopbarBadge(){
  const el = document.getElementById('studentBadge');
  if(!el) return;
  if(!Progress.studentName){ el.style.display='none'; return; }
  el.style.display='';
  el.innerHTML = `<b>${Progress.studentName}</b> · ${completedCount()}/${TRACKED_ACTIVITIES.length} done <button type="button" id="studentSwitchBtn" class="student-switch-btn" title="Not you? Check in again">Switch</button>`;
  const switchBtn = document.getElementById('studentSwitchBtn');
  if(switchBtn) switchBtn.addEventListener('click', resetCheckin);
}

/* ===================== RESUME IF THE PAGE RELOADS OR CLOSES =====================
   Saves check-in + current section to this browser only (localStorage), scoped to
   this unit, so an accidental reload/back/close picks up where you left off instead
   of showing the check-in gate again. Expires at midnight so it still asks a fresh
   check-in next class rather than skipping it forever on a shared computer. */
const CHECKIN_STORAGE_KEY = 'wellness_guest_journey_checkin';
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

/* ===================== VOICE ENGINE =====================
   A single default British female voice, used for every "Listen" button
   in this unit. There is no multi-turn scripted dialogue here (every
   voiced line is one guest speaking at a time), so one consistent voice
   is enough for students to follow along without a Thai-accented voice. */
const VoiceEngine = (function(){
  let allVoices = [];
  let voice = null;
  let playing = false;
  let onStateChange = ()=>{};

  const FEMALE_NAME_HINTS = /(kate|serena|stephanie|fiona|hazel|libby|sonia|olivia|amy|emma|joanna|shelley|grandma|moira|tessa|karen|susan|zira|samantha|victoria|ava|allison|zoe|nicky|jenny|aria|michelle)/i;
  const MALE_NAME_HINTS = /(daniel|arthur|george|oliver|ryan|brian|matthew|guy|eddy|rocko|reed|grandpa|alex|fred|tom|aaron|gordon|justin|bruce)/i;

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    voice = allVoices.find(v => /google uk english female/i.test(v.name))
         || allVoices.find(v => /^en-gb$/i.test(v.lang) && /female/i.test(v.name))
         || allVoices.find(v => /^en-gb$/i.test(v.lang) && FEMALE_NAME_HINTS.test(v.name))
         || allVoices.find(v => /^en-gb$/i.test(v.lang) && !MALE_NAME_HINTS.test(v.name))
         || allVoices.find(v => /^en-gb$/i.test(v.lang))
         || allVoices.find(v => /female/i.test(v.name) && /^en/i.test(v.lang))
         || allVoices[0] || null;
    onStateChange();
  }
  if('speechSynthesis' in window){
    window.speechSynthesis.onvoiceschanged = refresh;
    refresh();
  }
  function makeUtterance(text){
    const u = new SpeechSynthesisUtterance(text);
    if(voice){ u.voice = voice; u.lang = voice.lang; }
    u.rate = 1.0;
    return u;
  }
  return {
    isPlaying(){ return playing; },
    onChange(fn){ onStateChange = fn; },
    speak(text){
      this.stop();
      const u = makeUtterance(text);
      playing = true; onStateChange();
      u.onend = ()=>{ playing = false; onStateChange(); };
      u.onerror = ()=>{ playing = false; onStateChange(); };
      window.speechSynthesis.speak(u);
    },
    stop(){ window.speechSynthesis.cancel(); playing = false; onStateChange(); }
  };
})();
window.addEventListener('pagehide', ()=> VoiceEngine.stop());

function escAttr(s){
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
/* Renders a small icon-only "Listen" button. Call wireListenButtons() once
   per render so every button in that screen toggles play/stop reliably. */
function listenBtn(text){
  return `<button class="listen-btn" data-listen="${escAttr(text)}" title="Listen" aria-label="Listen">${icon('play',{size:14})}</button>`;
}
function wireListenButtons(){
  document.querySelectorAll('#app .listen-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(VoiceEngine.isPlaying()) VoiceEngine.stop();
      else VoiceEngine.speak(btn.dataset.listen);
    });
  });
  VoiceEngine.onChange(()=>{
    document.querySelectorAll('#app .listen-btn').forEach(btn=>{
      btn.innerHTML = VoiceEngine.isPlaying() ? icon('stop',{size:14}) : icon('play',{size:14});
      btn.title = VoiceEngine.isPlaying() ? 'Stop' : 'Listen';
    });
  });
}

/* A simple, non-scored, tap-to-toggle checklist. Used for the self-check
   lists after a speaking activity and for the audience's Wellness
   Supervisor Check during the Final Challenge. Purely a reflection tool,
   nothing here is graded or required to mark a section complete. */
function checkToggleList(items, prefix){
  return `<div class="check-toggle-list">${items.map((t,i)=>`
    <button type="button" class="check-toggle-item" data-check="${prefix}-${i}"><span class="check-box">${icon('check',{size:13})}</span><span class="check-label">${t}</span></button>`).join('')}</div>`;
}
function wireCheckToggle(){
  document.querySelectorAll('#app .check-toggle-item').forEach(btn=>{
    btn.addEventListener('click', ()=> btn.classList.toggle('done'));
  });
}

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">WELLNESS TOURISM MANAGEMENT PROGRAM</div>
    <h1>The Wellness <span>Guest Journey.</span></h1>
    <p>An integrated wellness tourism communication challenge. Follow one guest through a full visit to Harmony Wellness Resort: welcome them, help them, guide them, and book their next treatment.</p>
    <button class="startbtn" onclick="goNext()">Begin the shift →</button>
  </div>`;
}

/* ---- Section 0: Warm-Up: Welcome to Harmony Wellness Resort ---- */
function renderS0(){
  const cards = WARMUP_CARDS.map(c=>`<button class="pick-tile" data-pick="${c.id}">${c.label}</button>`).join('');
  const support = WARMUP_SUPPORT.map(s=>`<div class="phrase-card"><span class="txt">${s}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Warm-Up</div>
  <h2 class="section-title">Welcome to Harmony Wellness Resort</h2>
  <p class="section-sub">${WARMUP_INTRO}</p>
  <div class="panel">
    <p style="font-weight:700;color:var(--navy);">${WARMUP_QUESTION}</p>
    <p style="color:var(--muted);font-size:13.5px;margin-top:4px;">Choose THREE things you think are most important for a wellness guest.</p>
    <div class="pick-grid" id="s0picks">${cards}</div>
    <p class="pick-counter" id="s0Counter">0 of 3 chosen</p>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Discuss With a Partner</h3>
    <p style="color:var(--muted);font-size:13.5px;margin-top:4px;">Explain your choices. Use this language to help you.</p>
    <div class="phrase-list" style="margin-top:14px;">${support}</div>
    <button class="tb-btn primary" id="s0Done" style="background:var(--teal);border-color:var(--teal);margin-top:18px;" disabled>Choose 3 things first</button>
  </div>`;
}
function wireS0(){
  const picks = document.getElementById('s0picks');
  const counter = document.getElementById('s0Counter');
  const doneBtn = document.getElementById('s0Done');
  const selected = new Set();
  function update(){
    counter.textContent = `${selected.size} of 3 chosen`;
    doneBtn.disabled = selected.size !== 3;
    doneBtn.textContent = selected.size === 3 ? "We discussed our choices" : 'Choose 3 things first';
  }
  picks.addEventListener('click', e=>{
    const btn = e.target.closest('.pick-tile'); if(!btn) return;
    const id = btn.dataset.pick;
    if(selected.has(id)){ selected.delete(id); btn.classList.remove('sel'); }
    else if(selected.size < 3){ selected.add(id); btn.classList.add('sel'); }
    update();
  });
  doneBtn.addEventListener('click', ()=>{
    if(selected.size !== 3) return;
    const labels = WARMUP_CARDS.filter(c=>selected.has(c.id)).map(c=>c.label);
    markActivityComplete('s0', {score: labels.join(', ')});
    doneBtn.disabled = true;
    doneBtn.textContent = 'Nice work! Continue when ready.';
  });
  update();
}

/* ---- Section 0b: Warm-Up 2: What Would You Do? ---- */
function renderS0b(){
  const facts = ARRIVAL_SCENARIO.facts.map(f=>`<li>${f}</li>`).join('');
  const options = ARRIVAL_SCENARIO.options.map((o,i)=>`<button class="choice-btn" data-i="${i}"><span class="letter">${String.fromCharCode(65+i)}</span> ${o.text}</button>`).join('');
  return `
  <div class="section-eyebrow">Warm-Up: The Story Begins</div>
  <h2 class="section-title">What Would You Do?</h2>
  <p class="section-sub">A guest is arriving right now. This is where the guest journey starts.</p>
  <div class="panel">
    <div class="guest-card">
      <ul class="fact-list">${facts}</ul>
      <p style="font-weight:700;color:var(--navy);margin-top:16px;">${ARRIVAL_SCENARIO.question}</p>
      <div class="choices" id="s0bChoices">${options}</div>
      <div class="feedback" id="s0bFb"></div>
    </div>
  </div>
  <div class="panel" id="s0bSpeakPanel" style="display:none;">
    <h3 style="font-size:15px;color:var(--navy);">What Would You Say?</h3>
    <p style="color:var(--muted);font-size:13.5px;margin-top:4px;">${ARRIVAL_SCENARIO.speakPrompt}</p>
    <textarea class="challenge-textarea" id="s0bSpeak" rows="2" placeholder="Try it in your own words first..." style="margin-top:12px;"></textarea>
    <button class="reveal-btn" id="s0bReveal">Show useful phrases</button>
    <div class="phrase-list" id="s0bPhrases" style="display:none;margin-top:14px;"></div>
    <button class="tb-btn primary" id="s0bDone" style="background:var(--teal);border-color:var(--teal);margin-top:18px;">Continue the story →</button>
  </div>`;
}
function wireS0b(){
  const choicesBox = document.getElementById('s0bChoices');
  const fb = document.getElementById('s0bFb');
  const speakPanel = document.getElementById('s0bSpeakPanel');
  let chosen = null;
  choicesBox.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    if(choicesBox.classList.contains('answered')) return;
    choicesBox.classList.add('answered');
    const i = +btn.dataset.i;
    const isCorrect = ARRIVAL_SCENARIO.options[i].correct;
    chosen = ARRIVAL_SCENARIO.options[i].text;
    [...choicesBox.children].forEach((b,k)=>{
      if(ARRIVAL_SCENARIO.options[k].correct) b.classList.add('correct');
      else if(k===i && !isCorrect) b.classList.add('wrong');
    });
    fb.className = 'feedback show ' + (isCorrect ? 'good' : 'meh');
    fb.textContent = ARRIVAL_SCENARIO.why;
    speakPanel.style.display = '';
  });
  document.getElementById('s0bReveal').addEventListener('click', ()=>{
    const box = document.getElementById('s0bPhrases');
    box.innerHTML = ARRIVAL_SCENARIO.usefulPhrases.map(p=>`
      <div class="phrase-card"><span class="txt">"${p}"</span>${listenBtn(p)}</div>`).join('');
    box.style.display = '';
    wireListenButtons();
  });
  document.getElementById('s0bDone').addEventListener('click', (e)=>{
    markActivityComplete('s0b', {score: chosen});
    e.target.disabled = true;
    e.target.textContent = 'Nice work! Continue when ready.';
  });
}

/* ---- Mission 1: Take Care of the Guest ---- */
function renderS1(){
  const options = MISSION1_SCENARIO.options.map((o,i)=>`<button class="choice-btn" data-i="${i}"><span class="letter">${String.fromCharCode(65+i)}</span> ${o.text}</button>`).join('');
  return `
  <div class="section-eyebrow">Mission 1</div>
  <h2 class="section-title">Take Care of the Guest</h2>
  <p class="section-sub">${MISSION1_RECAP}</p>
  <div class="panel">
    <div class="guest-card">
      <div class="guest-bubble">"${MISSION1_SCENARIO.situation}"</div>
      <p style="font-weight:700;color:var(--navy);margin-top:16px;">${MISSION1_SCENARIO.question}</p>
      <p style="color:var(--muted);font-size:13.5px;margin-top:4px;">Discuss with a partner, then choose what you would say.</p>
      <p style="font-weight:700;color:var(--navy);margin-top:14px;">${MISSION1_SCENARIO.speakQuestion}</p>
      <div class="choices" id="s1Choices">${options}</div>
      <div class="feedback" id="s1Fb"></div>
    </div>
  </div>
  <div class="panel" id="s1KeyPanel" style="display:none;">
    <h3 style="font-size:15px;color:var(--navy);">Key Ideas</h3>
    <ul class="do-list">${MISSION1_KEY_IDEAS.map(k=>`<li>${k}</li>`).join('')}</ul>
    <h3 style="font-size:15px;color:var(--navy);margin-top:20px;">Useful Language</h3>
    <div class="phrase-list" id="s1Phrases"></div>
    <button class="tb-btn primary" id="s1Done" style="background:var(--teal);border-color:var(--teal);margin-top:18px;">Continue to the Guest Service Challenge →</button>
  </div>`;
}
function wireS1(){
  const choicesBox = document.getElementById('s1Choices');
  const fb = document.getElementById('s1Fb');
  const keyPanel = document.getElementById('s1KeyPanel');
  let chosen = null;
  choicesBox.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    if(choicesBox.classList.contains('answered')) return;
    choicesBox.classList.add('answered');
    const i = +btn.dataset.i;
    const isCorrect = MISSION1_SCENARIO.options[i].correct;
    chosen = MISSION1_SCENARIO.options[i].text;
    [...choicesBox.children].forEach((b,k)=>{
      if(MISSION1_SCENARIO.options[k].correct) b.classList.add('correct');
      else if(k===i && !isCorrect) b.classList.add('wrong');
    });
    fb.className = 'feedback show ' + (isCorrect ? 'good' : 'meh');
    fb.textContent = MISSION1_SCENARIO.why;
    document.getElementById('s1Phrases').innerHTML = MISSION1_PHRASES.map(p=>`
      <div class="phrase-card"><span class="txt">"${p}"</span>${listenBtn(p)}</div>`).join('');
    keyPanel.style.display = '';
    wireListenButtons();
  });
  document.getElementById('s1Done').addEventListener('click', (e)=>{
    markActivityComplete('s1', {score: chosen});
    e.target.disabled = true;
    e.target.textContent = 'Nice work! Continue when ready.';
  });
}

/* ---- Guest Service Challenge (Mission 1 signature game) ---- */
function renderS1game(){
  return `
  <div class="section-eyebrow">Mission 1 Challenge</div>
  <h2 class="section-title">Guest Service Challenge</h2>
  <p class="section-sub">You are the guest services staff at Harmony Wellness Resort. Five guests, one at a time. Read what they say, choose the most professional response, and see how you did.</p>
  <div class="panel" id="gsBody"></div>`;
}
let gsState = { phase:'round', index:0, correct:0, skills:[] };
function gsReset(){ gsState = { phase:'round', index:0, correct:0, skills:[] }; }
function wireS1game(){
  const body = document.getElementById('gsBody');

  function showRound(i){
    const r = GUEST_ROUNDS[i];
    body.innerHTML = `
      <div class="section-eyebrow">Guest ${i+1} of ${GUEST_ROUNDS.length}</div>
      <div class="guest-card">
        <div class="guest-bubble">"${r.guest}"${listenBtn(r.guest)}</div>
        <p style="font-weight:700;color:var(--navy);margin-top:16px;">What should you say?</p>
        <div class="choices" id="gsChoices">
          ${r.options.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o.text}</button>`).join('')}
        </div>
        <div class="feedback" id="gsFb"></div>
        <div id="gsNextWrap" style="margin-top:16px;"></div>
      </div>
      <p class="guest-progress">Score so far: ${gsState.correct}/${i}</p>`;
    wireListenButtons();
    const choicesBox = document.getElementById('gsChoices');
    const fb = document.getElementById('gsFb');
    const correctIdx = r.options.findIndex(o=>o.correct);
    choicesBox.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      if(choicesBox.classList.contains('answered')) return;
      choicesBox.classList.add('answered');
      const j = +btn.dataset.i;
      const isCorrect = j === correctIdx;
      [...choicesBox.children].forEach((b,k)=>{
        if(k === correctIdx) b.classList.add('correct');
        else if(k === j) b.classList.add('wrong');
      });
      fb.className = 'feedback show ' + (isCorrect ? 'good' : 'meh');
      fb.textContent = isCorrect ? `Correct. ${r.why}` : `Not quite. ${r.why}`;
      if(isCorrect){ gsState.correct++; gsState.skills.push(r.skill); }
      const nextWrap = document.getElementById('gsNextWrap');
      const isLast = i >= GUEST_ROUNDS.length - 1;
      nextWrap.innerHTML = `<button class="tb-btn primary" id="gsNext" style="background:var(--teal);border-color:var(--teal);">${isLast ? 'See my Guest Service Score →' : 'Next guest →'}</button>`;
      document.getElementById('gsNext').addEventListener('click', ()=>{
        if(isLast){ gsState.phase='score'; showScore(); }
        else { gsState.index = i+1; showRound(gsState.index); }
      });
    });
  }

  function showScore(){
    const n = gsState.correct;
    const total = GUEST_ROUNDS.length;
    let tier;
    if(n===5) tier = 'Excellent Service';
    else if(n===4) tier = 'Very Good';
    else if(n===3) tier = 'Good. Keep Practicing.';
    else tier = "Let's Review the Key Phrases";
    const allSkills = GUEST_ROUNDS.map(r=>r.skill);
    const skillRows = allSkills.map(sk=>{
      const got = gsState.skills.includes(sk);
      return `<div class="rubric-row"><div><div class="lbl">${sk}</div></div><div style="font-weight:700;color:${got?'var(--green-safe)':'var(--muted)'};">${got ? icon('check',{size:18}) : '—'}</div></div>`;
    }).join('');
    body.innerHTML = `
      <div class="guest-card" style="text-align:center;">
        <div class="section-eyebrow" style="text-align:center;">GUEST SERVICE SCORE</div>
        <p style="font-family:'Oswald';font-size:44px;color:var(--navy);margin-top:8px;">${n}/${total}</p>
        <p style="font-family:'Oswald';font-size:18px;letter-spacing:.03em;color:var(--orange-deep);margin-top:4px;">${tier}</p>
        <hr class="hairline">
        <p style="font-weight:700;color:var(--navy);text-align:left;">Service skills you used correctly:</p>
        <div style="text-align:left;">${skillRows}</div>
        <button class="tb-btn primary" id="gsRetry" style="background:var(--teal);border-color:var(--teal);margin-top:20px;">Try the Challenge Again</button>
      </div>`;
    document.getElementById('gsRetry').addEventListener('click', ()=>{
      gsReset();
      showRound(0);
    });
    markActivityComplete('s1game', {score:`${n}/${total} (${tier})`});
  }

  if(gsState.phase==='round') showRound(gsState.index);
  else showScore();
}

/* ---- Now You Say It (Mission 1 speaking follow-up) ---- */
function renderS1speak(){
  return `
  <div class="section-eyebrow">Mission 1 Speaking</div>
  <h2 class="section-title">Now You Say It</h2>
  <p class="section-sub">Stop choosing an answer. This time, you actually say it.</p>
  <div class="panel">
    <div class="time-badge">Suggested time: ${NOW_YOU_SAY_IT.timeEstimate}</div>
    <div class="speak-banner"><p><b>Challenge:</b> ${NOW_YOU_SAY_IT.challenge}</p></div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:18px;">How to Play</h3>
    <ul class="do-list">
      <li>Work in pairs. Student A is the guest, Student B is the wellness staff.</li>
      <li>Give the guest ONE realistic problem below.</li>
      <li>The staff member responds naturally and professionally, out loud, not by reading a script.</li>
      <li>After one situation, switch roles and try another problem.</li>
    </ul>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Your Situation</h3>
    <div class="guest-card" id="nysCard">
      <p style="color:var(--muted);font-style:italic;">Click below for your first situation.</p>
    </div>
    <button class="tb-btn primary" id="nysDraw" style="background:var(--orange);border-color:var(--orange-deep);margin-top:14px;">Give Us a Problem</button>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">After You Finish: Self-Check</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Did your partner...</p>
    ${checkToggleList(NOW_YOU_SAY_IT.selfCheck, 'nys')}
    <button class="tb-btn primary" id="nysDone" style="background:var(--teal);border-color:var(--teal);margin-top:18px;">We practiced this activity</button>
  </div>`;
}
function wireS1speak(){
  let lastIdx = -1;
  const card = document.getElementById('nysCard');
  document.getElementById('nysDraw').addEventListener('click', (e)=>{
    let i = Math.floor(Math.random() * NOW_YOU_SAY_IT.problems.length);
    if(NOW_YOU_SAY_IT.problems.length > 1){
      while(i === lastIdx) i = Math.floor(Math.random() * NOW_YOU_SAY_IT.problems.length);
    }
    lastIdx = i;
    const problem = NOW_YOU_SAY_IT.problems[i];
    card.innerHTML = `<div class="guest-bubble">${problem}${listenBtn(problem)}</div>`;
    wireListenButtons();
    e.target.textContent = 'Give Us Another Problem';
  });
  wireCheckToggle();
  document.getElementById('nysDone').addEventListener('click', (e)=>{
    markActivityComplete('s1speak', {completionStatus:'reached'});
    e.target.disabled = true;
    e.target.textContent = 'Nice work! Continue when ready.';
  });
}

/* ---- Mission 2: Guide the Guest ---- */
/* A hand-placed layout so the resort map reads as an actual site plan
   instead of a linear list: each location sits at its own (x,y) on a
   700x460 canvas, connected by a dashed walking path. Icons are simple
   line-art, matching the stroke style already used across the icon set. */
const RESORT_MAP_ICONS = {
  reception: '<path d="M9 13a3 3 0 0 1 6 0v3H9v-3Z"/><path d="M7 19h10"/><path d="M12 8V6"/>',
  garden: '<path d="M6 20c0-7 4-13 12-14-1 8-5 13-12 14Z"/><path d="M8 18c3-4 6-7 9-11"/>',
  thai: '<path d="M12 3c3 4 6 8 6 12a6 6 0 1 1-12 0c0-4 3-8 6-12Z"/>',
  meditation: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.8 5.8l2.1 2.1M16.1 16.1l2.1 2.1M5.8 18.2l2.1-2.1M16.1 7.9l2.1-2.1"/>',
  cafe: '<path d="M6 8h10v6a5 5 0 0 1-5 5h0a5 5 0 0 1-5-5V8Z"/><path d="M16 10h1.5a2 2 0 1 1 0 4H16"/><path d="M9 4v2M12 4v2"/>'
};
const RESORT_MAP_LAYOUT = {
  reception: {x:350, y:380, color:'var(--navy)'},
  garden: {x:120, y:230, color:'var(--green-safe)'},
  thai: {x:230, y:90, color:'var(--orange)'},
  meditation: {x:470, y:90, color:'var(--teal)'},
  cafe: {x:580, y:230, color:'var(--orange-deep)'}
};
function renderResortMap(){
  const order = ['reception','garden','thai','meditation','cafe'];
  const pathD = order.map((id,i)=>{
    const p = RESORT_MAP_LAYOUT[id];
    return `${i===0?'M':'L'}${p.x},${p.y}`;
  }).join(' ') + ` L${RESORT_MAP_LAYOUT.reception.x},${RESORT_MAP_LAYOUT.reception.y}`;
  const markers = RESORT_MAP.map(loc=>{
    const p = RESORT_MAP_LAYOUT[loc.id];
    const iconPath = RESORT_MAP_ICONS[loc.id] || '';
    return `<g transform="translate(${p.x},${p.y})">
      <circle r="34" fill="${p.color}"/>
      <g transform="translate(-12,-12)" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${iconPath}</g>
    </g>`;
  }).join('');
  const labels = RESORT_MAP.map(loc=>{
    const p = RESORT_MAP_LAYOUT[loc.id];
    const left = (p.x/700*100).toFixed(2);
    const top = ((p.y+48)/460*100).toFixed(2);
    return `<div class="resort-map-label" style="left:${left}%;top:${top}%;">${loc.nm}</div>`;
  }).join('');
  return `
  <div class="resort-map-wrap">
    <svg class="resort-map-svg" viewBox="0 0 700 460" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect x="4" y="4" width="692" height="452" rx="22" fill="var(--cream)" stroke="var(--line)" stroke-width="2"/>
      <path d="${pathD}" fill="none" stroke="#C9BFA5" stroke-width="2.5" stroke-dasharray="8 8"/>
      ${markers}
    </svg>
    ${labels}
  </div>`;
}
function renderS2(){
  const prompts = MISSION2_PROMPTS.map(p=>`<p class="mission-prompt">${p}</p>`).join('');
  return `
  <div class="section-eyebrow">Mission 2</div>
  <h2 class="section-title">Guide the Guest</h2>
  <p class="section-sub">${MISSION2_RECAP}</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Harmony Wellness Resort Map</h3>
    ${renderResortMap()}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Plan the Walk</h3>
    ${prompts}
    <button class="reveal-btn" id="s2Reveal">Show useful guiding phrases</button>
    <div class="phrase-list" id="s2Phrases" style="display:none;margin-top:14px;"></div>
    <button class="tb-btn primary" id="s2Done" style="background:var(--teal);border-color:var(--teal);margin-top:18px;">Continue to Build the Wellness Tour →</button>
  </div>`;
}
function wireS2(){
  document.getElementById('s2Reveal').addEventListener('click', ()=>{
    const box = document.getElementById('s2Phrases');
    box.innerHTML = GUIDING_PHRASES.map(p=>`
      <div class="phrase-card"><span class="txt">${p}</span>${listenBtn(p)}</div>`).join('');
    box.style.display = '';
    wireListenButtons();
  });
  document.getElementById('s2Done').addEventListener('click', (e)=>{
    markActivityComplete('s2', {completionStatus:'reached'});
    e.target.disabled = true;
    e.target.textContent = 'Nice work! Continue when ready.';
  });
}

/* ---- Build the Wellness Tour (Mission 2 signature game) ---- */
function renderS2game(){
  return `
  <div class="section-eyebrow">Mission 2 Challenge</div>
  <h2 class="section-title">Build the Wellness Tour</h2>
  <p class="section-sub">Choose 3 stops and put them in a logical order. Think about what makes a good opening, and what makes a memorable ending.</p>
  <div class="panel" id="towBody"></div>`;
}
let towSlots = [null, null, null];
let towActiveSlot = 0;
function towReset(){ towSlots = [null, null, null]; towActiveSlot = 0; }
function wireS2game(){
  const body = document.getElementById('towBody');
  function buildFeedback(){
    const stops = towSlots.map(id => TOUR_STOPS.find(s=>s.id===id));
    const [a,,c] = stops;
    const lines = [];
    if(a.bestAs==='opening') lines.push(`Good opening choice: ${a.nm} is calm and welcoming, a natural way to begin a tour.`);
    else if(a.bestAs==='closing') lines.push(`Consider placing ${a.nm} later in the tour. It usually works better as a memorable closing stop than an opener.`);
    else lines.push(`${a.nm} can open a tour, though a calmer first stop often eases guests in more gently.`);
    if(c.bestAs==='closing') lines.push(`Excellent use of ${c.nm} as your closing stop. Guests often say it becomes the highlight of their day.`);
    else if(c.bestAs==='opening') lines.push(`${c.nm} usually works better as an opener than a closer. Think about ending on something guests will remember.`);
    else lines.push('Good sequence! Each stop connects naturally to the next.');
    lines.push("Remember to guide your guests between stops, not just describe each one. That's what turns a list of facts into a real tour.");
    return lines;
  }
  function render(){
    const filledCount = towSlots.filter(Boolean).length;
    const usedIds = towSlots.filter(Boolean);
    const pool = TOUR_STOPS.filter(s=>!usedIds.includes(s.id));
    const slotsHtml = TOUR_TASKS.map((task,i)=>{
      const filled = towSlots[i] ? TOUR_STOPS.find(s=>s.id===towSlots[i]) : null;
      const isActive = i === towActiveSlot && !filled;
      return `
      <div class="tour-slot${filled?' filled':''}${isActive?' active':''}" data-slot="${i}">
        <div class="tour-slot-num">STOP ${task.n}</div>
        ${filled
          ? `<div class="tour-slot-fill">${filled.nm}</div><button class="tour-slot-clear" data-clear="${i}" aria-label="Remove this stop">${icon('x',{size:14})}</button>`
          : `<div class="tour-slot-empty">Click a stop below to add it here</div>`}
        <div class="tour-slot-task">Task: ${task.label}</div>
      </div>${i < TOUR_TASKS.length-1 ? '<div class="tour-arrow">↓</div>' : ''}`;
    }).join('');
    const poolHtml = pool.map(s=>`<button class="phrase-chip" data-stop="${s.id}">${s.nm}</button>`).join('');
    body.innerHTML = `
      <div class="tour-flow">
        <div class="tour-flow-cap">START</div>
        <div class="tour-arrow">↓</div>
        ${slotsHtml}
        <div class="tour-arrow">↓</div>
        <div class="tour-flow-cap">CLOSING</div>
      </div>
      <hr class="hairline">
      <p style="font-weight:700;color:var(--navy);">Available stops</p>
      <div class="phrase-chip-row" id="towPool">${poolHtml || '<p style="color:var(--muted);font-size:13.5px;">All stops placed. Check your tour below, or clear a stop to swap it.</p>'}</div>
      <div id="towAction" style="margin-top:18px;"></div>
      <div class="feedback" id="towFeedback"></div>`;
    document.querySelectorAll('#towBody [data-slot]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const i = +el.dataset.slot;
        if(!towSlots[i]){ towActiveSlot = i; render(); }
      });
    });
    document.querySelectorAll('#towBody [data-clear]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        const i = +btn.dataset.clear;
        towSlots[i] = null;
        towActiveSlot = i;
        render();
      });
    });
    const poolEl = document.getElementById('towPool');
    if(poolEl){
      poolEl.addEventListener('click', e=>{
        const chip = e.target.closest('[data-stop]'); if(!chip) return;
        if(towSlots[towActiveSlot]) return;
        towSlots[towActiveSlot] = chip.dataset.stop;
        const nextEmpty = towSlots.findIndex(v=>!v);
        towActiveSlot = nextEmpty >= 0 ? nextEmpty : towActiveSlot;
        render();
      });
    }
    const actionEl = document.getElementById('towAction');
    if(filledCount >= 3){
      actionEl.innerHTML = `<button class="tb-btn primary" id="towCheck" style="background:var(--orange);border-color:var(--orange-deep);">Check My Tour</button>`;
      document.getElementById('towCheck').addEventListener('click', ()=>{
        const fb = document.getElementById('towFeedback');
        fb.className = 'feedback show good';
        fb.innerHTML = buildFeedback().map(l=>`<p style="margin-top:6px;">${l}</p>`).join('');
        actionEl.innerHTML = `<button class="tb-btn" id="towRedo">Rearrange</button> <button class="tb-btn primary" id="towNext" style="background:var(--teal);border-color:var(--teal);">Now say your tour aloud →</button>`;
        document.getElementById('towRedo').addEventListener('click', ()=>{ towReset(); render(); });
        document.getElementById('towNext').addEventListener('click', ()=>{
          markActivityComplete('s2game', {score: towSlots.join(' → ')});
          document.getElementById('towNext').disabled = true;
          document.getElementById('towNext').textContent = 'Nice work! Continue when ready.';
        });
      });
    }
  }
  render();
}

/* ---- Be the Wellness Guide (Mission 2 speaking follow-up) ---- */
function renderS2speak(){
  const allPhrases = [...GUIDING_PHRASES, ...BE_THE_GUIDE.extraPhrases];
  const phrasesHtml = allPhrases.map(p=>`<div class="phrase-card"><span class="txt">${p}</span>${listenBtn(p)}</div>`).join('');
  return `
  <div class="section-eyebrow">Mission 2 Speaking</div>
  <h2 class="section-title">Be the Wellness Guide</h2>
  <p class="section-sub">Use the tour you just built. Now guide a real person through it, out loud.</p>
  <div class="panel">
    <div class="time-badge">Suggested time: ${BE_THE_GUIDE.timeEstimate}</div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:14px;">How to Play</h3>
    <ul class="do-list">
      <li>Work in pairs. Student A is the wellness guide, Student B is the guest.</li>
      <li>Student A gives a 60 to 90 second mini-tour, explaining at least THREE stops.</li>
      <li>Use one location phrase, one interesting fact, and one invitation or question.</li>
      <li>Student B asks at least ONE question during the tour.</li>
      <li>Then switch roles.</li>
    </ul>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Your Tour Stops</h3>
    <div id="s2speakStops"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Useful Language</h3>
    <div class="phrase-list">${phrasesHtml}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Self-Check</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Did I...</p>
    ${checkToggleList(BE_THE_GUIDE.selfCheck, 's2speak')}
    <button class="tb-btn primary" id="s2speakDone" style="background:var(--teal);border-color:var(--teal);margin-top:18px;">We practiced this activity</button>
  </div>`;
}
function wireS2speak(){
  const stopsBox = document.getElementById('s2speakStops');
  const builtStops = towSlots.filter(Boolean).map(id => TOUR_STOPS.find(s=>s.id===id)).filter(Boolean);
  if(builtStops.length === 3){
    stopsBox.innerHTML = `<p style="color:var(--muted);font-size:13.5px;margin-bottom:10px;">This is the tour your group built in Build the Wellness Tour.</p>`
      + builtStops.map((s,i)=>`<div class="phrase-card"><span class="txt">Stop ${i+1}: ${s.nm}</span></div>`).join('');
  } else {
    stopsBox.innerHTML = `<p style="color:var(--muted);font-size:13.5px;margin-bottom:10px;">No tour on record yet, that is fine. Choose any three stops below to guide your partner through.</p>`
      + TOUR_STOPS.map(s=>`<div class="phrase-card"><span class="txt">${s.nm}</span></div>`).join('');
  }
  wireListenButtons();
  wireCheckToggle();
  document.getElementById('s2speakDone').addEventListener('click', (e)=>{
    markActivityComplete('s2speak', {completionStatus:'reached'});
    e.target.disabled = true;
    e.target.textContent = 'Nice work! Continue when ready.';
  });
}

/* ---- Mission 3: Manage the Reservation ---- */
function renderS3(){
  const menuRows = SPA_MENU.map(m=>`
    <div class="spa-menu-item">
      <span class="spa-menu-name">${m.name}</span>
      <span class="spa-menu-duration">${m.duration}</span>
      <span class="spa-menu-price">${m.price}</span>
    </div>`).join('');
  const scheduleRows = SPA_SCHEDULE.map(s=>`
    <div class="spa-slot ${s.status}">
      <span class="spa-slot-time">${s.time}</span>
      <span class="spa-slot-status">${s.status==='available'?'Available':'Booked'}</span>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Mission 3</div>
  <h2 class="section-title">Manage the Reservation</h2>
  <p class="section-sub">${MISSION3_RECAP}</p>
  <div class="panel" style="margin-top:0;">
    <h3 style="font-size:15px;color:var(--navy);">Harmony Wellness Spa: Today's Menu</h3>
    <div class="spa-menu">${menuRows}</div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:22px;">Saturday Availability</h3>
    <div class="spa-schedule">${scheduleRows}</div>
  </div>
  <div class="panel">
    <div class="guest-card">
      <div class="guest-bubble">"${SPA_GUEST_REQUEST}"${listenBtn(SPA_GUEST_REQUEST)}</div>
    </div>
    <div id="m3Body" style="margin-top:16px;"></div>
  </div>`;
}
let m3State = { phase:'booking', step:0, answers:{} };
function m3Reset(){ m3State = { phase:'booking', step:0, answers:{} }; }
function wireS3(){
  wireListenButtons();
  const body = document.getElementById('m3Body');

  function showStep(i){
    const step = BOOKING_STEPS[i];
    const correctIdx = step.options.findIndex(o=>o.correct);
    body.innerHTML = `
      <div class="section-eyebrow">Booking Step ${i+1} of ${BOOKING_STEPS.length}</div>
      <p style="font-weight:700;color:var(--navy);margin-top:10px;">${step.prompt}</p>
      <div class="choices" id="m3Choices">
        ${step.options.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o.t}</button>`).join('')}
      </div>
      <div class="feedback" id="m3Fb"></div>
      <div id="m3NextWrap" style="margin-top:16px;"></div>`;
    const choicesBox = document.getElementById('m3Choices');
    const fb = document.getElementById('m3Fb');
    choicesBox.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      if(choicesBox.classList.contains('answered')) return;
      choicesBox.classList.add('answered');
      const j = +btn.dataset.i;
      const isCorrect = j === correctIdx;
      [...choicesBox.children].forEach((b,k)=>{
        if(k===correctIdx) b.classList.add('correct');
        else if(k===j) b.classList.add('wrong');
      });
      fb.className = 'feedback show ' + (isCorrect ? 'good' : 'meh');
      fb.textContent = isCorrect ? 'Correct.' : 'Not quite. The correct choice is highlighted above.';
      m3State.answers[step.id] = isCorrect;
      const nextWrap = document.getElementById('m3NextWrap');
      const isLast = i >= BOOKING_STEPS.length - 1;
      nextWrap.innerHTML = `<button class="tb-btn primary" id="m3Next" style="background:var(--teal);border-color:var(--teal);">${isLast ? 'Review the booking →' : 'Next step →'}</button>`;
      document.getElementById('m3Next').addEventListener('click', ()=>{
        if(isLast){ m3State.phase = 'confirm'; showConfirm(); }
        else { m3State.step = i+1; showStep(m3State.step); }
      });
    });
  }

  function showConfirm(){
    const service = SPA_MENU.find(m=>m.id==='thai');
    body.innerHTML = `
      <div class="section-eyebrow">Confirm the Booking</div>
      <div class="summary-card">
        <div class="summary-row"><span class="k">Service</span><span class="v">${service.name} (${service.duration})</span></div>
        <div class="summary-row"><span class="k">Guests</span><span class="v">2 people</span></div>
        <div class="summary-row"><span class="k">Day</span><span class="v">Saturday</span></div>
        <div class="summary-row"><span class="k">Time</span><span class="v">2:00 p.m.</span></div>
        <div class="summary-row"><span class="k">Rate</span><span class="v">${service.price} per person</span></div>
      </div>
      <button class="tb-btn primary" id="m3ConfirmBtn" style="background:var(--orange);border-color:var(--orange-deep);margin-top:18px;">Confirm Booking</button>`;
    document.getElementById('m3ConfirmBtn').addEventListener('click', ()=>{
      m3State.phase = 'problem';
      showProblem();
    });
  }

  function showProblem(){
    body.innerHTML = `
      <div class="section-eyebrow">A Reservation Problem</div>
      <div class="guest-card" style="margin-top:10px;">
        <div class="guest-bubble">${RESERVATION_PROBLEM.setup}${listenBtn(RESERVATION_PROBLEM.setup)}</div>
        <p style="font-weight:700;color:var(--navy);margin-top:16px;">${RESERVATION_PROBLEM.question}</p>
        <button class="reveal-btn" id="m3Reveal">Show useful phrases</button>
        <div class="phrase-list" id="m3Phrases" style="display:none;margin-top:14px;"></div>
      </div>
      <button class="tb-btn primary" id="m3Done" style="background:var(--teal);border-color:var(--teal);margin-top:18px;">Continue to the Spa Booking Challenge →</button>`;
    document.getElementById('m3Reveal').addEventListener('click', ()=>{
      const box = document.getElementById('m3Phrases');
      box.innerHTML = RESERVATION_PROBLEM.usefulPhrases.map(p=>`
        <div class="phrase-card"><span class="txt">${p}</span>${listenBtn(p)}</div>`).join('');
      box.style.display = '';
      wireListenButtons();
    });
    document.getElementById('m3Done').addEventListener('click', (e)=>{
      const correctCount = Object.values(m3State.answers).filter(Boolean).length;
      markActivityComplete('s3', {score:`${correctCount}/${BOOKING_STEPS.length}`});
      e.target.disabled = true;
      e.target.textContent = 'Nice work! Continue when ready.';
    });
    wireListenButtons();
  }

  if(m3State.phase==='booking') showStep(m3State.step);
  else if(m3State.phase==='confirm') showConfirm();
  else showProblem();
}

/* ---- Spa Booking Challenge (Mission 3 signature game) ---- */
function renderS3game(){
  return `
  <div class="section-eyebrow">Mission 3 Challenge</div>
  <h2 class="section-title">Spa Booking Challenge</h2>
  <p class="section-sub">You are the reservation staff at Harmony Wellness Spa. Handle five guest requests: check, ask, find, suggest, confirm.</p>
  <div class="panel" id="sbBody"></div>`;
}
let sbState = { phase:'round', index:0, correct:0 };
function sbReset(){ sbState = { phase:'round', index:0, correct:0 }; }
function wireS3game(){
  const body = document.getElementById('sbBody');

  function showChallenge(i){
    const c = SPA_CHALLENGES[i];
    const correctIdx = c.options.findIndex(o=>o.correct);
    body.innerHTML = `
      <div class="section-eyebrow">${c.tag}: ${i+1} of ${SPA_CHALLENGES.length}</div>
      <div class="guest-card">
        <div class="guest-bubble">${c.guest}${listenBtn(c.guest)}</div>
        <p style="font-weight:700;color:var(--navy);margin-top:16px;">What should you say?</p>
        <div class="choices" id="sbChoices">
          ${c.options.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o.t}</button>`).join('')}
        </div>
        <div class="feedback" id="sbFb"></div>
        <div id="sbNextWrap" style="margin-top:16px;"></div>
      </div>
      <p class="guest-progress">Score so far: ${sbState.correct}/${i}</p>`;
    wireListenButtons();
    const choicesBox = document.getElementById('sbChoices');
    const fb = document.getElementById('sbFb');
    choicesBox.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      if(choicesBox.classList.contains('answered')) return;
      choicesBox.classList.add('answered');
      const j = +btn.dataset.i;
      const isCorrect = j === correctIdx;
      [...choicesBox.children].forEach((b,k)=>{
        if(k===correctIdx) b.classList.add('correct');
        else if(k===j) b.classList.add('wrong');
      });
      fb.className = 'feedback show ' + (isCorrect ? 'good' : 'meh');
      fb.textContent = (isCorrect ? 'Correct. ' : 'Not quite. ') + c.why;
      if(isCorrect) sbState.correct++;
      const nextWrap = document.getElementById('sbNextWrap');
      const isLast = i >= SPA_CHALLENGES.length - 1;
      nextWrap.innerHTML = `<button class="tb-btn primary" id="sbNext" style="background:var(--teal);border-color:var(--teal);">${isLast ? 'See my Reservation Skills Score →' : 'Next guest →'}</button>`;
      document.getElementById('sbNext').addEventListener('click', ()=>{
        if(isLast){ sbState.phase = 'score'; showScore(); }
        else { sbState.index = i+1; showChallenge(sbState.index); }
      });
    });
  }

  function showScore(){
    const n = sbState.correct;
    const total = SPA_CHALLENGES.length;
    let tier;
    if(n===5) tier = 'Excellent Reservation Skills';
    else if(n===4) tier = 'Very Good';
    else if(n===3) tier = 'Good. Keep Practicing.';
    else tier = "Let's Review the Booking Phrases";
    body.innerHTML = `
      <div class="guest-card" style="text-align:center;">
        <div class="section-eyebrow" style="text-align:center;">RESERVATION SKILLS SCORE</div>
        <p style="font-family:'Oswald';font-size:44px;color:var(--navy);margin-top:8px;">${n}/${total}</p>
        <p style="font-family:'Oswald';font-size:18px;letter-spacing:.03em;color:var(--orange-deep);margin-top:4px;">${tier}</p>
        <button class="tb-btn primary" id="sbRetry" style="background:var(--teal);border-color:var(--teal);margin-top:20px;">Try the Challenge Again</button>
      </div>`;
    document.getElementById('sbRetry').addEventListener('click', ()=>{ sbReset(); showChallenge(0); });
    markActivityComplete('s3game', {score:`${n}/${total} (${tier})`});
  }

  if(sbState.phase==='round') showChallenge(sbState.index);
  else showScore();
}

/* ---- Reservation Problem: Role-Play (Mission 3 speaking follow-up) ---- */
function renderS3speak(){
  const stepsHtml = RESERVATION_ROLEPLAY.steps.map(s=>`<li>${s}</li>`).join('');
  const phrasesHtml = RESERVATION_ROLEPLAY.examplePhrases.map(p=>`<div class="phrase-card"><span class="txt">${p}</span>${listenBtn(p)}</div>`).join('');
  return `
  <div class="section-eyebrow">Mission 3 Speaking</div>
  <h2 class="section-title">Reservation Problem: Role-Play</h2>
  <p class="section-sub">Now handle a real booking problem out loud, not just by clicking.</p>
  <div class="panel">
    <div class="time-badge">Suggested time: ${RESERVATION_ROLEPLAY.timeEstimate}</div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:14px;">How to Play</h3>
    <ul class="do-list">
      <li>Work in pairs. Student A is the guest, Student B is the wellness receptionist.</li>
      <li>The guest wants a specific treatment and time.</li>
      <li>The receptionist checks availability and introduces a problem.</li>
      <li>Negotiate a solution together, out loud, then confirm the booking.</li>
    </ul>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Base Situation</h3>
    <div class="guest-card">
      <div class="guest-bubble">${RESERVATION_ROLEPLAY.baseSituation}${listenBtn(RESERVATION_ROLEPLAY.baseSituation)}</div>
    </div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:20px;">Steps for the Receptionist</h3>
    <ol class="flow-list">${stepsHtml}</ol>
    <h3 style="font-size:15px;color:var(--navy);margin-top:20px;">Example Language</h3>
    <div class="phrase-list">${phrasesHtml}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Add a Variation</h3>
    <p style="color:var(--muted);font-size:13.5px;margin-top:4px;">Once you have tried the base situation, draw a variation to make it harder.</p>
    <div id="s3speakVariation" style="margin-top:12px;">
      <p style="color:var(--muted);font-style:italic;">Click below for your variation.</p>
    </div>
    <button class="tb-btn primary" id="s3speakDraw" style="background:var(--orange);border-color:var(--orange-deep);margin-top:14px;">Draw a Variation</button>
  </div>
  <div class="panel">
    <button class="tb-btn primary" id="s3speakDone" style="background:var(--teal);border-color:var(--teal);">We practiced this activity</button>
  </div>`;
}
function wireS3speak(){
  wireListenButtons();
  let lastIdx = -1;
  const box = document.getElementById('s3speakVariation');
  document.getElementById('s3speakDraw').addEventListener('click', (e)=>{
    let i = Math.floor(Math.random() * RESERVATION_ROLEPLAY.variations.length);
    if(RESERVATION_ROLEPLAY.variations.length > 1){
      while(i === lastIdx) i = Math.floor(Math.random() * RESERVATION_ROLEPLAY.variations.length);
    }
    lastIdx = i;
    const variation = RESERVATION_ROLEPLAY.variations[i];
    box.innerHTML = `<div class="guest-card"><div class="guest-bubble">${variation}${listenBtn(variation)}</div></div>`;
    wireListenButtons();
    e.target.textContent = 'Draw Another Variation';
  });
  document.getElementById('s3speakDone').addEventListener('click', (e)=>{
    markActivityComplete('s3speak', {completionStatus:'reached'});
    e.target.disabled = true;
    e.target.textContent = 'Nice work! Continue when ready.';
  });
}

/* ---- Final Integrated Challenge ---- */
function renderS4(){
  const flowHtml = FINAL_CHALLENGE.flow.map((step,i)=>`
    <div class="journey-step">${step}</div>${i < FINAL_CHALLENGE.flow.length-1 ? '<div class="journey-arrow">→</div>' : ''}`).join('');
  const langHtml = FINAL_CHALLENGE.usefulLanguage.map(p=>`
    <div class="phrase-card"><span class="txt">${p}</span>${listenBtn(p)}</div>`).join('');
  const roles = Object.values(FINAL_CHALLENGE.roles);
  const roleHtml = roles.map(r=>`
    <div class="role-card-mini"><h4>${r.title}</h4><p>${r.body}</p></div>`).join('');
  return `
  <div class="section-eyebrow">Final Challenge</div>
  <h2 class="section-title">Take Care of Your Guest</h2>
  <p class="section-sub">${FINAL_CHALLENGE.intro}</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Your Situation</h3>
    <div class="guest-card">
      <div class="guest-bubble">${FINAL_CHALLENGE.situation}</div>
    </div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:22px;">Your Goal</h3>
    <p style="color:var(--ink);line-height:1.6;margin-top:8px;">${FINAL_CHALLENGE.goal}</p>
    <h3 style="font-size:15px;color:var(--navy);margin-top:22px;">Your Challenge: Complete the Guest Journey</h3>
    <div class="journey-flow">${flowHtml}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Useful Language</h3>
    <div class="phrase-list">${langHtml}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Choose Your Roles</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">${FINAL_CHALLENGE.prepTime}</p>
    <div class="role-grid">${roleHtml}</div>
    <p style="color:var(--muted);font-size:13px;margin-top:14px;">If your group has only 3 students, combine the Wellness Guide and Wellness Receptionist roles into one.</p>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Your Team's Surprise Problem</h3>
    <p style="color:var(--muted);font-size:13.5px;margin-top:4px;">Once your team has planned the journey, draw your surprise problem. Respond to it as a team, in the moment.</p>
    <div id="s4Surprise" style="margin-top:12px;">
      <p style="color:var(--muted);font-style:italic;">Click below when your team is ready.</p>
    </div>
    <button class="tb-btn primary" id="s4Draw" style="background:var(--orange);border-color:var(--orange-deep);margin-top:14px;">Reveal Your Team's Surprise Problem</button>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Wellness Supervisor Check (For the Audience)</h3>
    <p style="color:var(--muted);font-size:13.5px;margin-top:4px;">Watching another group perform? Check whether the team...</p>
    ${checkToggleList(SUPERVISOR_CHECK, 's4sup')}
    <button class="tb-btn primary" id="s4Done" style="background:var(--teal);border-color:var(--teal);margin-top:18px;">We practiced this journey</button>
  </div>`;
}
let s4SurpriseCard = null;
function s4Reset(){ s4SurpriseCard = null; }
function wireS4(){
  wireListenButtons();
  wireCheckToggle();
  const surpriseBox = document.getElementById('s4Surprise');
  const drawBtn = document.getElementById('s4Draw');
  if(s4SurpriseCard){
    surpriseBox.innerHTML = `<div class="surprise-card"><div class="section-eyebrow">Surprise Problem</div><p>${s4SurpriseCard.text}</p></div>`;
    drawBtn.textContent = 'Draw a New Surprise Problem';
  }
  drawBtn.addEventListener('click', ()=>{
    const card = SURPRISE_CARDS[Math.floor(Math.random() * SURPRISE_CARDS.length)];
    s4SurpriseCard = card;
    surpriseBox.innerHTML = `<div class="surprise-card"><div class="section-eyebrow">Surprise Problem</div><p>${card.text}</p></div>`;
    drawBtn.textContent = 'Draw a New Surprise Problem';
  });
  document.getElementById('s4Done').addEventListener('click', (e)=>{
    markActivityComplete('s4', {completionStatus:'reached'});
    e.target.disabled = true;
    e.target.textContent = 'Great work! Continue when ready.';
  });
}

/* ---- Reflection ---- */
function renderS5(){
  const rows = REFLECTION_QUESTIONS.map((q,i)=>`
    <div class="reflect-row">
      <p class="reflect-q">${q}</p>
      <textarea class="challenge-textarea" id="reflect${i}" rows="2" placeholder="Type your answer..."></textarea>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Reflection</div>
  <h2 class="section-title">What Did You Learn Today?</h2>
  <p class="section-sub">Take a moment to think back on the guest journey.</p>
  <div class="panel">
    ${rows}
    <div class="exit-ticket">
      <div class="exit-ticket-label">Exit Ticket</div>
      <label for="exitTicket" style="display:block;font-weight:700;color:var(--navy);margin-top:8px;">${EXIT_TICKET_PROMPT} ________.</label>
      <input type="text" id="exitTicket" class="challenge-textarea" placeholder="Type one sentence..." style="margin-top:10px;">
    </div>
    <button class="tb-btn primary" id="s5Done" style="background:var(--teal);border-color:var(--teal);margin-top:18px;">Submit Reflection</button>
  </div>`;
}
function wireS5(){
  document.getElementById('s5Done').addEventListener('click', (e)=>{
    const answers = REFLECTION_QUESTIONS.map((q,i)=> document.getElementById(`reflect${i}`).value.trim()).filter(Boolean);
    const exitAnswer = document.getElementById('exitTicket').value.trim();
    markActivityComplete('s5', {score: `${answers.length}/${REFLECTION_QUESTIONS.length} answered, exit ticket: ${exitAnswer || 'blank'}`, completionStatus:'reached'});
    e.target.disabled = true;
    e.target.textContent = 'Thank you!';
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">GUEST JOURNEY COMPLETE</div>
    <h1>You took care of <span>your guest.</span></h1>
    <p>You welcomed, helped, guided, and booked for a real wellness guest, using skills from across the whole course. Keep practicing. A confident wellness professional makes every part of the journey feel effortless.</p>
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
  {r:renderS0, w:wireS0},
  {r:renderS0b, w:wireS0b},
  {r:renderS1, w:wireS1},
  {r:renderS1game, w:wireS1game},
  {r:renderS1speak, w:wireS1speak},
  {r:renderS2, w:wireS2},
  {r:renderS2game, w:wireS2game},
  {r:renderS2speak, w:wireS2speak},
  {r:renderS3, w:wireS3},
  {r:renderS3game, w:wireS3game},
  {r:renderS3speak, w:wireS3speak},
  {r:renderS4, w:wireS4},
  {r:renderS5, w:wireS5},
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
  VoiceEngine.stop();
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
document.getElementById('btnReset').addEventListener('click', ()=>{
  if(current === RENDERERS.findIndex(r=>r.r===renderS1game)) gsReset();
  if(current === RENDERERS.findIndex(r=>r.r===renderS2game)) towReset();
  if(current === RENDERERS.findIndex(r=>r.r===renderS3)) m3Reset();
  if(current === RENDERERS.findIndex(r=>r.r===renderS3game)) sbReset();
  if(current === RENDERERS.findIndex(r=>r.r===renderS4)) s4Reset();
  renderAll();
});

wireCheckin();
if(restoreCheckinState()){
  document.getElementById('checkinGate').style.display='none';
}
renderAll();
