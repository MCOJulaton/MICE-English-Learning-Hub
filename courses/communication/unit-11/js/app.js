/* ===================== APP STATE / ROUTER =====================
   Same router/progress/voice/checkin/deep-link/audio architecture as
   Units 8-10 (copied, unchanged in shape). Nothing here is a new
   system; Unit 11 plugs into the existing one. */
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6'];

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

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>Design <span>a Home</span></h1>
    <p>Unit 11: Architecture, Day 2. Listen to a real town meeting about student housing, learn compound nouns and prepositions of location, then design and present your dream home.</p>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Compound nouns</div>
      <div class="signchip"><span class="arrow">→</span> Prepositions of location</div>
      <div class="signchip"><span class="arrow">→</span> Final assignment</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Listening 2 — Housing Problems, Housing Solutions (real audio) ===== */
function renderS1(){
  const choiceRows = HOUSING_CHOICES.map(c=>`
    <div class="checklist-row" data-hc="${c.id}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${c.label}</div>
    </div>`).join('');
  const prosconsBlocks = Object.values(HOUSING_PROSCONS).map(pc=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${pc.label}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px;">
        <div><b style="color:var(--green-safe);font-size:12.5px;">PROS</b><ul style="margin:6px 0 0 16px;padding:0;font-size:13.5px;line-height:1.7;">${pc.pros.map(p=>`<li>${p}</li>`).join('')}</ul></div>
        <div><b style="color:var(--danger);font-size:12.5px;">CONS</b><ul style="margin:6px 0 0 16px;padding:0;font-size:13.5px;line-height:1.7;">${pc.cons.map(c=>`<li>${c}</li>`).join('')}</ul></div>
      </div>
    </div>`).join('');
  const tfRows = HOUSING_TF.map((t,i)=>`
    <div class="sit-card" data-tf="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${t.stmt}</p>
      <div class="choices" data-tfchoices="${i}">
        <button class="choice-btn" data-v="T"><span class="letter">T</span> True</button>
        <button class="choice-btn" data-v="F"><span class="letter">F</span> False</button>
      </div>
      <div class="feedback" data-tffb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Listening 2: Housing Problems, Housing Solutions</h2>
  <p class="section-sub">Listen to a real town meeting about student housing.</p>
  <div class="panel">
    ${renderAudioTrack(AUDIO.listening2, 'Housing Problems, Housing Solutions', 'A town meeting discusses student housing choices.')}
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">Activity A: Which 3 housing choices are discussed?</h3>
    ${choiceRows}
    <button class="reveal-btn" id="s1acheck">Check My Answers</button>
    <div class="feedback" id="s1anudge"></div>
    <div class="answer-key" id="s1akey"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Activity B: Pros and Cons of each choice</h3>
    <p class="section-sub" style="margin-top:0;">Listen again. Were you right? Compare with the chart below.</p>
    ${prosconsBlocks}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Activity C: True or False</h3>
    ${tfRows}
  </div>`;
}
function wireS1(){
  wireAudioTracks();
  const hcChecked = new Set();
  document.querySelectorAll('#app .checklist-row').forEach(row=>row.addEventListener('click', ()=>{
    row.classList.toggle('checked');
    if(row.classList.contains('checked')) hcChecked.add(row.dataset.hc); else hcChecked.delete(row.dataset.hc);
  }));
  document.getElementById('s1acheck').addEventListener('click', ()=>{
    const nudge = document.getElementById('s1anudge');
    if(!hcChecked.size){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please check at least one housing choice before checking.';
      return;
    }
    nudge.className = 'feedback';
    let correct = 0;
    document.querySelectorAll('#app .checklist-row').forEach(row=>{
      const c = HOUSING_CHOICES.find(x=>x.id===row.dataset.hc);
      if(row.classList.contains('checked') === c.mentioned) correct++;
    });
    const key = document.getElementById('s1akey');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Discussed at the meeting:</b> ' + HOUSING_CHOICES.filter(c=>c.mentioned).map(c=>c.label).join(', ');
    const answers = HOUSING_CHOICES.map(c=>`${c.label}: ${hcChecked.has(c.id) ? 'checked' : 'not checked'}${(hcChecked.has(c.id)===c.mentioned) ? ' [correct]' : ' [wrong]'}`).join(' | ');
    markActivityComplete('s1', {score:`Activity A: ${correct}/${HOUSING_CHOICES.length}`, answers});
  });
  const tfDone = new Set();
  HOUSING_TF.forEach((t,i)=>{
    const box = document.querySelector(`[data-tfchoices="${i}"]`);
    const fb = document.querySelector(`[data-tffb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(btn.dataset.v === t.answer){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent = t.note || 'Correct!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent = t.note || 'Try again.'; }
      tfDone.add(i);
      if(tfDone.size >= HOUSING_TF.length) markActivityComplete('s1', {score:`${tfDone.size}/${HOUSING_TF.length}`});
    });
  });
}

/* ===== Section 2: Building Vocabulary — Compound Nouns ===== */
function renderS2(){
  const tip = COMPOUND_TIP.map(t=>`<li>${t}</li>`).join('');
  const spot = COMPOUND_SPOT.map((s,i)=>`<div class="sit-card"><p>${i+1}. ${s}</p></div>`).join('');
  const match = COMPOUND_MATCH.map((m,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt">${m.def}</div>
      <input type="text" data-cm="${i}" placeholder="compound noun">
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Building Vocabulary: Compound Nouns</h2>
  <p class="section-sub">Two words that make one meaning.</p>
  <div class="panel">
    <div class="rule-box"><b>Tip</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul></div>
    <h3 style="font-size:16px;color:var(--navy);margin-top:18px;">Find the compound noun in each sentence.</h3>
    ${spot}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Which compound noun matches each meaning?</h3>
    ${match}
    <button class="reveal-btn" id="s2check">Check My Answers</button>
    <div class="feedback" id="s2nudge"></div>
    <div class="answer-key" id="s2key"></div>
  </div>`;
}
function wireS2(){
  document.getElementById('s2check').addEventListener('click', ()=>{
    const nudge = document.getElementById('s2nudge');
    const inputs = COMPOUND_MATCH.map((m,i)=> document.querySelector(`[data-cm="${i}"]`));
    const values = inputs.map(inp=>inp.value.trim());
    if(values.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please answer every question before checking.';
      return;
    }
    nudge.className = 'feedback';
    let correct = 0;
    const results = COMPOUND_MATCH.map((m,i)=>{
      const isCorrect = values[i].toLowerCase() === m.answer;
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
        : `${i+1}. ${r.given}, not quite. Correct answer: ${COMPOUND_MATCH[i].answer}`
    ).join('<br>');
    const answers = results.map((r,i)=>`Q${i+1}: ${r.given}${r.isCorrect ? ' [correct]' : ` [wrong, correct: ${COMPOUND_MATCH[i].answer}]`}`).join(' | ');
    markActivityComplete('s2', {score:`${correct}/${COMPOUND_MATCH.length}`, answers});
  });
}

/* ===== Section 3: Pronunciation — Stress in Compound Nouns (real audio) ===== */
function renderS3(){
  const tip = STRESS_TIP.map(t=>`<li>${t}</li>`).join('');
  const words = STRESS_WORDS.map((w,i)=>{
    const parts = w.split(' ');
    return `<div class="sit-card" data-sw="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${w}</p>
      <div class="choices" data-swchoices="${i}">
        <button class="choice-btn" data-v="first">Stress on <b>${parts[0].toUpperCase()}</b></button>
        <button class="choice-btn" data-v="second">Stress on <b>${(parts[1]||parts[0]).toUpperCase()}</b></button>
      </div>
    </div>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 3 · Pronunciation</div>
  <h2 class="section-title">Stress in Compound Nouns</h2>
  <p class="section-sub">Listen to how stress works in compound nouns, then try it yourself.</p>
  <div class="panel">
    <div class="rule-box"><b>Tip</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul></div>
    ${renderAudioTrack(AUDIO.pronExamples, 'Examples', 'Listen to real compound nouns from the unit.')}
  </div>
  <div class="panel">
    ${renderAudioTrack(AUDIO.pronActivity, 'Practice Activity', 'Listen to more compound nouns for extra practice.')}
    <h3 style="font-size:16px;color:var(--navy);margin-top:18px;">Self-check: where does the stress go?</h3>
    ${words}
  </div>`;
}
function wireS3(){
  wireAudioTracks();
  const done = new Set();
  STRESS_WORDS.forEach((w,i)=>{
    const box = document.querySelector(`[data-swchoices="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(btn.dataset.v === 'first') btn.classList.add('correct'); else { btn.classList.add('wrong'); box.children[0].classList.add('correct'); }
      done.add(i);
      if(done.size >= STRESS_WORDS.length) markActivityComplete('s3', {score:`${STRESS_WORDS.length}/${STRESS_WORDS.length}`});
    });
  });
}

/* ===== Section 4: Grammar — Prepositions of Location ===== */
function renderS4(){
  const p1 = PREP_PART1.map((p,i)=>`
    <div class="fill-row"><div class="fr-num">${i+1}</div><div class="fr-prompt">${p.sentence}</div><input type="text" data-p1="${i}" placeholder="in / on / at"></div>`).join('');
  const p2 = PREP_PART2.map((p,i)=>`
    <div class="fill-row"><div class="fr-num">${i+1}</div><div class="fr-prompt">${p.sentence}</div><input type="text" data-p2="${i}" placeholder="preposition"></div>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Grammar</div>
  <h2 class="section-title">Prepositions of Location</h2>
  <p class="section-sub">Use in / on / at for places, and next to / between / across from / on the corner of / behind for position.</p>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Part 1: in, on, or at?</h3>
    ${p1}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Part 2: Describe the position.</h3>
    ${p2}
    <button class="reveal-btn" id="s4check">Check My Answers</button>
    <div class="feedback" id="s4nudge"></div>
    <div class="answer-key" id="s4key"></div>
  </div>`;
}
function wireS4(){
  document.getElementById('s4check').addEventListener('click', ()=>{
    const nudge = document.getElementById('s4nudge');
    const in1 = PREP_PART1.map((p,i)=> document.querySelector(`[data-p1="${i}"]`));
    const in2 = PREP_PART2.map((p,i)=> document.querySelector(`[data-p2="${i}"]`));
    const v1 = in1.map(inp=>inp.value.trim());
    const v2 = in2.map(inp=>inp.value.trim());
    if(v1.some(v=>!v) || v2.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please answer every question before checking.';
      return;
    }
    nudge.className = 'feedback';
    let correct = 0;
    const r1 = PREP_PART1.map((p,i)=>{
      const isCorrect = v1[i].toLowerCase() === p.answer;
      if(isCorrect) correct++;
      in1[i].classList.toggle('correct', isCorrect);
      in1[i].classList.toggle('wrong', !isCorrect);
      return {given:v1[i], isCorrect};
    });
    const r2 = PREP_PART2.map((p,i)=>{
      const isCorrect = v2[i].toLowerCase() === p.answer;
      if(isCorrect) correct++;
      in2[i].classList.toggle('correct', isCorrect);
      in2[i].classList.toggle('wrong', !isCorrect);
      return {given:v2[i], isCorrect};
    });
    const key = document.getElementById('s4key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Part 1:</b> ' + r1.map((r,i)=>`${i+1}. ${r.given}${r.isCorrect?' ✓':` (correct: ${PREP_PART1[i].answer})`}`).join(', ') +
      '<br><b>Part 2:</b> ' + r2.map((r,i)=>`${i+1}. ${r.given}${r.isCorrect?' ✓':` (correct: ${PREP_PART2[i].answer})`}`).join(', ');
    const answers = [
      ...r1.map((r,i)=>`P1-Q${i+1}: ${r.given}${r.isCorrect?' [correct]':` [wrong, correct: ${PREP_PART1[i].answer}]`}`),
      ...r2.map((r,i)=>`P2-Q${i+1}: ${r.given}${r.isCorrect?' [correct]':` [wrong, correct: ${PREP_PART2[i].answer}]`}`)
    ].join(' | ');
    markActivityComplete('s4', {score:`${correct}/${PREP_PART1.length+PREP_PART2.length}`, answers});
  });
}

/* ===== Section 5: Consider the Ideas (real audio, 3-category checklist) ===== */
function renderS5(){
  const cat = (title, items, prefix) => `
    <div>
      <h3 style="font-size:15px;color:var(--navy);">${title}</h3>
      ${items.map(it=>`<div class="checklist-row" data-${prefix}="${it.id}"><div class="checklist-box">✓</div><div class="checklist-lbl">${it.label}</div></div>`).join('')}
    </div>`;
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Consider the Ideas</h2>
  <p class="section-sub">Listen to a sample home presentation. Check the ideas the speakers mention.</p>
  <div class="panel">
    ${renderAudioTrack(AUDIO.considerIdeas, 'Consider the Ideas', 'A sample presentation about a dream home.')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-top:22px;">
      ${cat('Inside the Home', CONSIDER_INSIDE, 'in')}
      ${cat('Outside the Home', CONSIDER_OUTSIDE, 'out')}
      ${cat('Neighborhood', CONSIDER_NEIGHBORHOOD, 'nb')}
    </div>
    <button class="reveal-btn" id="s5check" style="margin-top:20px;">Check My Answers</button>
    <div class="feedback" id="s5nudge"></div>
    <div class="answer-key" id="s5key"></div>
  </div>`;
}
function wireS5(){
  wireAudioTracks();
  const s5checked = new Set();
  document.querySelectorAll('#app .checklist-row').forEach(row=>row.addEventListener('click', ()=>{
    row.classList.toggle('checked');
    const key = `${row.getAttribute('data-in')!==null?'in:'+row.getAttribute('data-in'):row.getAttribute('data-out')!==null?'out:'+row.getAttribute('data-out'):'nb:'+row.getAttribute('data-nb')}`;
    if(row.classList.contains('checked')) s5checked.add(key); else s5checked.delete(key);
  }));
  document.getElementById('s5check').addEventListener('click', ()=>{
    const nudge = document.getElementById('s5nudge');
    if(!s5checked.size){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please check at least one idea before checking.';
      return;
    }
    nudge.className = 'feedback';
    let correct = 0, total = 0;
    const all = [
      ...CONSIDER_INSIDE.map(x=>({...x, prefix:'in'})),
      ...CONSIDER_OUTSIDE.map(x=>({...x, prefix:'out'})),
      ...CONSIDER_NEIGHBORHOOD.map(x=>({...x, prefix:'nb'}))
    ];
    all.forEach(a=>{
      total++;
      const row = document.querySelector(`[data-${a.prefix}="${a.id}"]`);
      if(row.classList.contains('checked') === a.mentioned) correct++;
    });
    const key = document.getElementById('s5key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Mentioned:</b> ' + all.filter(a=>a.mentioned).map(a=>a.label).join(', ');
    const answers = all.map(a=>{
      const isChecked = document.querySelector(`[data-${a.prefix}="${a.id}"]`).classList.contains('checked');
      return `${a.label}: ${isChecked?'checked':'not checked'}${(isChecked===a.mentioned)?' [correct]':' [wrong]'}`;
    }).join(' | ');
    markActivityComplete('s5', {score:`${correct}/${total}`, answers});
  });
}

/* ===== Section 6: Unit Assignment & Rubric ===== */
function renderS6(){
  const steps = ASSIGNMENT.steps.map(s=>`<li>${s}</li>`).join('');
  const rubric = RUBRIC_ROWS.map((r,i)=>`
    <div class="rubric-row">
      <div><div class="lbl">${r.lbl}</div><div class="sub">${r.sub}</div></div>
      <div class="rate" data-rubric="${i}">
        ${RUBRIC_SCALE.map(s=>`<button data-pts="${s.pts}" title="${s.note}">${s.pts}</button>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Unit Assignment</div>
  <h2 class="section-title">${ASSIGNMENT.title}</h2>
  <p class="section-sub">${ASSIGNMENT.prompt}</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3><ul>${steps}</ul></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Self-Check Rubric</h3>
    <p class="section-sub" style="margin-top:4px;">Rate yourself honestly after your presentation. Your teacher will also grade you with this rubric.</p>
    ${rubric}
    <div id="s6total" style="margin-top:18px;font-family:var(--font-display);color:var(--navy);font-size:16px;"></div>
  </div>`;
}
function wireS6(){
  const scores = {};
  document.querySelectorAll('#app [data-rubric]').forEach(row=>{
    row.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...row.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      scores[row.dataset.rubric] = +btn.dataset.pts;
      const total = Object.values(scores).reduce((a,b)=>a+b,0);
      document.getElementById('s6total').textContent = `Self-Check Total: ${total} / ${RUBRIC_ROWS.length*20} points`;
      if(Object.keys(scores).length >= RUBRIC_ROWS.length) markActivityComplete('s6', {score:`${total}/${RUBRIC_ROWS.length*20}`});
    });
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 11 COMPLETE</div>
    <h1>You designed <span>your dream home.</span></h1>
    <p>You've finished Sociology and Architecture. Great work on your listening, speaking, and grammar skills!</p>
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
