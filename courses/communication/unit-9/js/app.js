/* ===================== APP STATE / ROUTER =====================
   Same router/progress/voice/checkin/deep-link/audio architecture as
   Unit 8 (copied, unchanged in shape) — see that file's comments for
   the full rationale. Nothing here is a new system; Unit 9 plugs into
   the existing one. */
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

const TRACKED_ACTIVITIES = ['s0','s1','s2','s3','s5','s6'];

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
const CHECKIN_STORAGE_KEY = 'efc_u9_checkin';
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

/* ===================== VOICE ENGINE (TTS, for vocab/phrases) ===================== */
const VoiceEngine = (function(){
  let allVoices = [];
  let voiceA = null;
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
    onStateChange();
  }
  if('speechSynthesis' in window){
    window.speechSynthesis.onvoiceschanged = refresh;
    refresh();
  }
  function splitSentences(text){
    return text.replace(/([.!?])\s+/g,'$1|').split('|').map(s=>s.trim()).filter(Boolean);
  }
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
    speakLine(text){
      this.stop();
      queue = [{text}];
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
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
      a.addEventListener('play', notify);
      a.addEventListener('pause', notify);
      a.addEventListener('ended', notify);
      els.set(src, a);
    }
    return els.get(src);
  }
  function notify(){ onStateChange(); }
  function stopOthers(exceptSrc){
    els.forEach((a,src)=>{ if(src!==exceptSrc && !a.paused) a.pause(); });
  }
  return {
    onChange(fn){ onStateChange = fn; },
    toggle(src){
      const a = get(src);
      if(a.paused){ stopOthers(src); a.play(); }
      else { a.pause(); }
    },
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

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  const objectives = LESSON_OBJECTIVES.map(o=>`<li>${o}</li>`).join('');
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>Agree, Disagree <span>& Discuss</span></h1>
    <p>Unit 9: Sociology, Day 2.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <div class="cover-objectives">
      <b>By the end of this lesson, you can:</b>
      <ul>${objectives}</ul>
    </div>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Grammar practice</div>
      <div class="signchip"><span class="arrow">→</span> Video speaking task</div>
      <div class="signchip"><span class="arrow">→</span> Listening quiz</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 0: Quick Start — Do You Agree? =====
   A real topic intro, not an explanation — students just react. No
   right answer, ungraded, marks "reached" once all 3 are answered. */
function renderS0(){
  const cards = QUICK_START_STATEMENTS.map((s,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${s}</p>
      <div class="choices" data-qs="${i}">
        <button class="choice-btn" data-v="agree"><span class="letter">A</span> Agree</button>
        <button class="choice-btn" data-v="disagree"><span class="letter">D</span> Disagree</button>
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 1 · Quick Start</div>
  <h2 class="section-title">Do You Agree?</h2>
  <p class="section-sub">Read each sentence. Click Agree or Disagree. There is no wrong answer.</p>
  <div class="panel">${cards}</div>`;
}
function wireS0(){
  const answered = new Set();
  QUICK_START_STATEMENTS.forEach((s,i)=>{
    const box = document.querySelector(`[data-qs="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct'));
      btn.classList.add('correct');
      answered.add(i);
      if(answered.size >= QUICK_START_STATEMENTS.length) markActivityComplete('s0', {completionStatus:'reached'});
    });
  });
}

/* ===== Section 1: Grammar — Subject and Object Pronouns ===== */
function renderS1(){
  const rows = PRONOUN_TABLE.map(p=>`<tr><td>${p.subject}</td><td>${p.object}</td></tr>`).join('');
  const circle = PRONOUN_CIRCLE.map((p,i)=>`
    <div class="sit-card" data-pc="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${p.sentence}</p>
      <div class="choices" data-pcchoices="${i}">
        ${p.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
    </div>`).join('');
  const replace = PRONOUN_REPLACE.map((r,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt">${r.sentence.replace(r.underline, `<u>${r.underline}</u>`)}</div>
      <input type="text" data-pr="${i}" placeholder="pronoun">
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 · Grammar</div>
  <h2 class="section-title">Subject and Object Pronouns</h2>
  <p class="section-sub">Subject pronouns come before the verb. Object pronouns come after the verb, or after a preposition.</p>
  <div class="panel">
    <div class="scenario-message">${PRONOUN_HOOK.line1}<br>${PRONOUN_HOOK.line2}</div>
    <p style="margin-top:12px;color:var(--ink);font-size:14.5px;">${PRONOUN_HOOK.note}</p>
  </div>
  <div class="panel">
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr><th style="text-align:left;padding:8px;color:var(--navy);font-family:var(--font-display);">Subject</th><th style="text-align:left;padding:8px;color:var(--navy);font-family:var(--font-display);">Object</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Activity A: Choose the correct pronoun.</h3>
    ${circle}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Activity B: Replace the underlined words with a pronoun.</h3>
    ${replace}
    <button class="reveal-btn" id="s1check">Check My Answers</button>
    <div class="feedback" id="s1nudge"></div>
    <div class="answer-key" id="s1key"></div>
  </div>`;
}
function answerMatches(given, correctRaw){
  const g = given.trim().toLowerCase();
  const m = correctRaw.match(/^(.*?)\s*\(or (.*?)\)$/i);
  if(m) return g === m[1].trim().toLowerCase() || g === m[2].trim().toLowerCase();
  return g === correctRaw.trim().toLowerCase();
}
function wireS1(){
  const aDone = new Set();
  PRONOUN_CIRCLE.forEach((p,i)=>{
    const box = document.querySelector(`[data-pcchoices="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === p.answer) btn.classList.add('correct'); else { btn.classList.add('wrong'); box.children[p.answer].classList.add('correct'); }
      aDone.add(i);
      if(aDone.size >= PRONOUN_CIRCLE.length) checkOverall();
    });
  });
  function checkOverall(){ if(aDone.size >= PRONOUN_CIRCLE.length) markActivityComplete('s1', {score:`A: ${aDone.size}/${PRONOUN_CIRCLE.length}`}); }
  document.getElementById('s1check').addEventListener('click', ()=>{
    const nudge = document.getElementById('s1nudge');
    const inputs = PRONOUN_REPLACE.map((r,i)=> document.querySelector(`[data-pr="${i}"]`));
    const values = inputs.map(inp=>inp.value.trim());
    if(values.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please answer every question before checking.';
      return;
    }
    nudge.className = 'feedback';
    let bCorrect = 0;
    const results = PRONOUN_REPLACE.map((r,i)=>{
      const isCorrect = answerMatches(values[i], r.answer);
      if(isCorrect) bCorrect++;
      inputs[i].classList.toggle('correct', isCorrect);
      inputs[i].classList.toggle('wrong', !isCorrect);
      return {given:values[i], isCorrect};
    });
    const key = document.getElementById('s1key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Results</b><br>' + results.map((r,i)=>
      r.isCorrect
        ? `${i+1}. ${r.given}, correct`
        : `${i+1}. ${r.given}, not quite. Correct answer: ${PRONOUN_REPLACE[i].answer}`
    ).join('<br>');
    const answers = results.map((r,i)=>`Q${i+1}: ${r.given}${r.isCorrect ? ' [correct]' : ` [wrong, correct: ${PRONOUN_REPLACE[i].answer}]`}`).join(' | ');
    markActivityComplete('s1', {score:`A: ${aDone.size}/${PRONOUN_CIRCLE.length} | B: ${bCorrect}/${PRONOUN_REPLACE.length}`, answers});
  });
}

/* ===== Section 2: Pronunciation — Reduced Pronouns (real audio) =====
   Practice only here — no grading. The real comprehension check on this
   same audio (fill in the missing pronoun) now lives in the Listening
   Quiz, Section 6, so it isn't scattered mid-unit. */
function renderS2(){
  const tip = REDUCED_TIP.map(t=>`<li>${t}</li>`).join('');
  const filledDialogue = REDUCED_DIALOGUE.map(d=>{
    if(!d.answers) return `<p style="margin-top:10px;color:var(--ink);">${d.line}</p>`;
    let idx = 0;
    const line = d.line.replace(/___/g, ()=> `<b style="color:var(--teal);">${d.answers[idx++]}</b>`);
    return `<p style="margin-top:10px;color:var(--ink);">${line}</p>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 3 · Pronunciation</div>
  <h2 class="section-title">Reduced Pronouns</h2>
  <p class="section-sub">Listen. Then practice saying it the same way.</p>
  <div class="panel">
    <div class="rule-box"><b>Tip</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul></div>
    ${renderAudioTrack(AUDIO.pronExamples, 'Examples', 'Listen to reduced pronouns in short example sentences.')}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Practice With a Partner</h3>
    <p class="section-sub" style="margin-top:2px;">Listen once. Then read this dialogue out loud with a partner. Try to say the bold words fast and soft, the natural way.</p>
    ${renderAudioTrack(AUDIO.pronActivity, 'Practice Dialogue', 'Listen to the full dialogue.')}
    <div style="margin-top:18px;">${filledDialogue}</div>
    <button class="startbtn" id="s2done" style="margin-top:20px;">We practiced this →</button>
  </div>`;
}
function wireS2(){
  wireAudioTracks();
  document.getElementById('s2done').addEventListener('click', ()=>{
    markActivityComplete('s2', {completionStatus:'reached'});
    goNext();
  });
}

/* ===== Section 3: Speaking Skill — Agreeing and Disagreeing (real audio) ===== */
function renderS3(){
  const phrases = AGREE_PHRASES.map(p=>`<div class="phrase-card"><span class="txt">${p.ex}</span><button class="audio-mini" data-say="${p.ex}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>`).join('');
  const listen = AGREE_LISTEN_PROMPTS.map((p,i)=>`
    <div class="sit-card" data-al="${i}">
      <p style="font-weight:700;color:var(--navy);">${p}</p>
      <div class="choices" data-alchoices="${i}">
        <button class="choice-btn" data-v="agree"><span class="letter">A</span> Agree</button>
        <button class="choice-btn" data-v="disagree"><span class="letter">D</span> Disagree</button>
      </div>
    </div>`).join('');
  const create = AGREE_CREATE_PROMPTS.map((p,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt" style="flex:2;">${p}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Speaking Skill</div>
  <h2 class="section-title">Agreeing and Disagreeing</h2>
  <p class="section-sub">Use these expressions to agree or disagree politely in a conversation.</p>
  <div class="panel">
    <div class="phrase-list">${phrases}</div>
    ${renderAudioTrack(AUDIO.speakExamples, 'Examples', 'Listen to short example conversations.')}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Listen and decide: agree or disagree?</h3>
    ${renderAudioTrack(AUDIO.speakActivity, 'Practice Conversations', 'Listen to 6 short exchanges. There is no single right answer — discuss what you hear with a partner.')}
    ${listen}
    <button class="startbtn" id="s3done" style="margin-top:20px;">We discussed all 6 →</button>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Now it's your turn.</h3>
    <p class="section-sub" style="margin-top:0;">Complete each sentence about yourself. Share it with a partner. Agree or disagree with each other.</p>
    ${create}
  </div>`;
}
function wireS3(){
  wireAudioTracks();
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say)));
  AGREE_LISTEN_PROMPTS.forEach((p,i)=>{
    const box = document.querySelector(`[data-alchoices="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct'));
      btn.classList.add('correct');
    });
  });
  document.getElementById('s3done').addEventListener('click', ()=>{ markActivityComplete('s3'); goNext(); });
}

/* ===== Section 5: Speaking Task — Agree or Disagree (graded) =====
   The topic list lives right here, under "How to do it" — no separate
   topic-picking section. Students write their own script from the topic
   themselves; this page only gives the situation. */
function renderS5(){
  const steps = ASSIGNMENT.steps.map(s=>`<li>${s}</li>`).join('');
  const topics = TREND_STATEMENTS.map(t=>`<li>${t.text}</li>`).join('');
  const rubric = RUBRIC_ROWS.map((r,i)=>`
    <div class="rubric-row">
      <div><div class="lbl">${r.lbl}</div><div class="sub">${r.sub}</div></div>
      <div class="rate" data-rubric="${i}">
        ${RUBRIC_SCALE.map(s=>`<button data-pts="${s.pts}" title="${s.note}">${s.pts}</button>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 5 · Speaking Task</div>
  <h2 class="section-title">${ASSIGNMENT.title}</h2>
  <p class="section-sub">${ASSIGNMENT.prompt}</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3><ul>${steps}</ul></div>
    <h3 style="font-size:16px;color:var(--navy);margin-top:20px;">Choose a Topic</h3>
    <p class="section-sub" style="margin-top:2px;">Pick one statement below with your seatmate.</p>
    <ul style="margin:12px 0 0 18px;padding:0;line-height:1.9;font-size:14.5px;color:var(--ink);">${topics}</ul>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Self-Check Rubric</h3>
    <p class="section-sub" style="margin-top:4px;">Rate yourself honestly after your video. Your teacher will also grade you with this rubric.</p>
    ${rubric}
    <div id="s5total" style="margin-top:18px;font-family:var(--font-display);color:var(--navy);font-size:16px;"></div>
  </div>`;
}
function wireS5(){
  const scores = {};
  document.querySelectorAll('#app [data-rubric]').forEach(row=>{
    row.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...row.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      scores[row.dataset.rubric] = +btn.dataset.pts;
      const total = Object.values(scores).reduce((a,b)=>a+b,0);
      document.getElementById('s5total').textContent = `Self-Check Total: ${total} / ${RUBRIC_ROWS.length*20} points`;
      if(Object.keys(scores).length >= RUBRIC_ROWS.length) markActivityComplete('s5', {score:`${total}/${RUBRIC_ROWS.length*20}`});
    });
  });
}

/* ===== Section 6: Listening Quiz =====
   Combines the two real, objectively-gradable listening checks that used
   to be scattered mid-unit: the reduced-pronoun dialogue (Part A) and the
   Consider the Ideas checklist (Part B). Both use the same real audio and
   the same real answer key as before — only the placement changed. */
function renderS6(){
  const dialogueHtml = REDUCED_DIALOGUE.map((d,i)=>{
    if(!d.answers) return `<p style="margin-top:10px;color:var(--ink);">${d.line}</p>`;
    let idx = 0;
    const line = d.line.replace(/___/g, ()=>`<input type="text" data-rd="${i}-${idx++}" style="width:70px;display:inline-block;margin:0 4px;">`);
    return `<p style="margin-top:10px;color:var(--ink);">${line}</p>`;
  }).join('');
  const checklistRows = CONSIDER_ACTIVITIES.map(a=>`
    <div class="checklist-row" data-ci="${a.id}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${a.label}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 6 · Listening Quiz</div>
  <h2 class="section-title">Listening Quiz</h2>
  <p class="section-sub">Two parts. Listen carefully, then answer.</p>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Part A: Complete the Dialogue</h3>
    ${renderAudioTrack(AUDIO.pronActivity, 'Practice Dialogue', 'Listen and complete the dialogue below.')}
    <div style="margin-top:18px;">${dialogueHtml}</div>
    <button class="reveal-btn" id="s6checkA">Check Part A</button>
    <div class="feedback" id="s6nudgeA"></div>
    <div class="answer-key" id="s6keyA"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Part B: Consider the Ideas</h3>
    <p class="section-sub" style="margin-top:2px;">Listen to a group discuss free-time activities. Check the activities they mention.</p>
    ${renderAudioTrack(AUDIO.considerIdeas, 'Consider the Ideas', 'A group discusses activities they enjoy in their area.')}
    <div style="margin-top:20px;">${checklistRows}</div>
    <button class="reveal-btn" id="s6checkB">Check Part B</button>
    <div class="feedback" id="s6nudgeB"></div>
    <div class="answer-key" id="s6keyB"></div>
  </div>`;
}
function wireS6(){
  wireAudioTracks();
  let scoreA = null, scoreB = null;
  function maybeFinish(){
    if(scoreA !== null && scoreB !== null){
      markActivityComplete('s6', {score:`Part A: ${scoreA.correct}/${scoreA.total} | Part B: ${scoreB.correct}/${scoreB.total}`});
    }
  }
  const blanks = [];
  REDUCED_DIALOGUE.forEach((d,i)=>{
    if(!d.answers) return;
    d.answers.forEach((a,bi)=> blanks.push({answer:a, input: document.querySelector(`[data-rd="${i}-${bi}"]`)}));
  });
  document.getElementById('s6checkA').addEventListener('click', ()=>{
    const nudge = document.getElementById('s6nudgeA');
    const values = blanks.map(b=> b.input.value.trim());
    if(values.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please answer every blank before checking.';
      return;
    }
    nudge.className = 'feedback';
    let correct = 0;
    const results = blanks.map((b,i)=>{
      const given = values[i];
      const isCorrect = given.toLowerCase() === b.answer.toLowerCase();
      if(isCorrect) correct++;
      b.input.classList.toggle('correct', isCorrect);
      b.input.classList.toggle('wrong', !isCorrect);
      return {given, isCorrect, answer:b.answer};
    });
    const key = document.getElementById('s6keyA');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Results</b><br>' + results.map((r,i)=>
      r.isCorrect ? `${i+1}. ${r.given}, correct` : `${i+1}. ${r.given}, not quite. Correct answer: ${r.answer}`
    ).join('<br>');
    scoreA = {correct, total: blanks.length};
    maybeFinish();
  });
  const checked = new Set();
  document.querySelectorAll('#app .checklist-row').forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.ci); else checked.delete(row.dataset.ci);
    });
  });
  document.getElementById('s6checkB').addEventListener('click', ()=>{
    const nudge = document.getElementById('s6nudgeB');
    if(!checked.size){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please check at least one activity before checking.';
      return;
    }
    nudge.className = 'feedback';
    let correct = 0;
    document.querySelectorAll('#app .checklist-row').forEach(row=>{
      const a = CONSIDER_ACTIVITIES.find(x=>x.id===row.dataset.ci);
      const isChecked = row.classList.contains('checked');
      if(isChecked === a.mentioned) correct++;
      row.style.borderLeft = a.mentioned ? '4px solid var(--green-safe)' : '4px solid var(--danger)';
    });
    const key = document.getElementById('s6keyB');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Mentioned in the recording:</b> ' + CONSIDER_ACTIVITIES.filter(a=>a.mentioned).map(a=>a.label).join(', ');
    scoreB = {correct, total: CONSIDER_ACTIVITIES.length};
    maybeFinish();
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 9 COMPLETE</div>
    <h1>You can <span>agree, disagree, and discuss.</span></h1>
    <p>Next: Unit 10 begins Architecture, "What makes a good home?"</p>
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
  {r:renderS0, w:wireS0},
  {r:renderS1, w:wireS1},
  {r:renderS2, w:wireS2},
  {r:renderS3, w:wireS3},
  {r:renderS5, w:wireS5},
  {r:renderS6, w:wireS6},
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
