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
    <h1>What Makes a <span>Good Home?</span></h1>
    <p>Unit 10: Architecture, Day 1. Listen to a real conversation about choosing between three apartments, and learn to notice opinions.</p>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Housing vocabulary</div>
      <div class="signchip"><span class="arrow">→</span> Real listening practice</div>
      <div class="signchip"><span class="arrow">→</span> Compare apartments</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up ===== */
function renderS1(){
  const wordChips = HOME_WORDS.map(w=>`<div class="big-choice" data-word="${w}"><div class="bc-lbl">${w}</div></div>`).join('');
  const matchRows = QCLASSROOM_MATCH.map((m,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt" style="font-weight:700;color:var(--navy);">${m.student} says:</div>
      <div class="fr-prompt">${m.idea}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 1 · Unit Question</div>
  <h2 class="section-title">What Makes a Good Home?</h2>
  <p class="section-sub">Click the words for places people live.</p>
  <div class="panel"><div class="big-choice-grid">${wordChips}</div></div>
  <div class="panel">
    ${renderAudioTrack(AUDIO.qClassroom, 'The Q Classroom', 'Four students share their opinion about what matters most in a home.')}
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">Listen. What does each student think matters most?</h3>
    ${matchRows}
    <button class="startbtn" id="s1done" style="margin-top:20px;">I listened →</button>
  </div>`;
}
function wireS1(){
  wireAudioTracks();
  document.querySelectorAll('#app [data-word]').forEach(c=>c.addEventListener('click', ()=> c.classList.toggle('sel')));
  document.getElementById('s1done').addEventListener('click', ()=>{ markActivityComplete('s1'); goNext(); });
}

/* ===== Section 2: Key Vocabulary ===== */
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
    <div class="answer-key" id="s2key"></div>
  </div>`;
}
function wireS2(){
  document.querySelectorAll('#app .vocab-card').forEach(c=>c.addEventListener('click', ()=> c.classList.toggle('open')));
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', e=>{ e.stopPropagation(); speak(b.dataset.say); }));
  document.getElementById('s2check').addEventListener('click', ()=>{
    let correct = 0;
    VOCAB_FILL.forEach((f,i)=>{ if(document.querySelector(`[data-fill="${i}"]`).value.trim().toLowerCase() === f.answer) correct++; });
    const key = document.getElementById('s2key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Answer Key</b><br>' + VOCAB_FILL.map((f,i)=>`${i+1}. ${f.answer}`).join(' &nbsp; ');
    markActivityComplete('s2', {score:`${correct}/${VOCAB_FILL.length}`});
  });
}

/* ===== Section 3: Listening 1 — Let's Find a New Apartment (real audio) ===== */
function renderS3(){
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
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Listening 1: Let's Find a New Apartment</h2>
  <p class="section-sub">Karen and a friend compare three apartments. Listen for the good and bad points of each.</p>
  <div class="panel">
    ${renderAudioTrack(AUDIO.listening1, "Let's Find a New Apartment", 'Two friends discuss three apartment choices.')}
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">Activity A: Take notes on each apartment.</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:14px;">${notesBoxes}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Activity B: Which apartment does each point describe?</h3>
    ${pointRows}
    <button class="reveal-btn" id="s3bcheck">Check My Answers</button>
    <div class="answer-key" id="s3bkey"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Activity C: True or False</h3>
    ${tfRows}
  </div>`;
}
function wireS3(){
  wireAudioTracks();
  document.getElementById('s3bcheck').addEventListener('click', ()=>{
    const key = document.getElementById('s3bkey');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Answer Key</b><br>' + APARTMENT_POINTS.map((p,i)=>`${i+1}. ${p.answer}`).join('<br>');
    markActivityComplete('s3notes', {score:'notes reviewed', completionStatus:'completed'});
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
      if(tfDone.size >= APARTMENT_TF.length) markActivityComplete('s3', {score:`${tfDone.size}/${APARTMENT_TF.length}`});
    });
  });
}

/* ===== Section 4: Ranking Information ===== */
function renderS4(){
  const chips = RANK_FEATURES.map(f=>`<div class="big-choice" data-rank="${f}"><div class="bc-lbl">${f}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 4 · Critical Thinking</div>
  <h2 class="section-title">Ranking Information</h2>
  <p class="section-sub">Click the features in order, from most important to you (1) to least important.</p>
  <div class="panel">
    <div class="rank-source">${chips}</div>
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">Your ranking:</h3>
    <ol class="rank-list" id="s4list"></ol>
    <p class="rank-empty-note" id="s4empty">Click features above to add them here, in order.</p>
    <button class="startbtn" id="s4done" style="margin-top:16px;">My ranking is ready →</button>
  </div>`;
}
function wireS4(){
  const ranked = [];
  const list = document.getElementById('s4list');
  const emptyNote = document.getElementById('s4empty');
  function render(){
    list.innerHTML = ranked.map((f,i)=>`<li><span class="rk-num">${i+1}</span>${f}</li>`).join('');
    emptyNote.style.display = ranked.length ? 'none' : 'block';
  }
  document.querySelectorAll('#app [data-rank]').forEach(c=>{
    c.addEventListener('click', ()=>{
      const f = c.dataset.rank;
      if(ranked.includes(f)){ ranked.splice(ranked.indexOf(f),1); c.classList.remove('sel'); }
      else { ranked.push(f); c.classList.add('sel'); }
      render();
    });
  });
  document.getElementById('s4done').addEventListener('click', ()=>{
    markActivityComplete('s4', {score:`${ranked.length}/${RANK_FEATURES.length} ranked`});
    goNext();
  });
}

/* ===== Section 5: Listening Skill — Listening for Opinions (real audio) ===== */
function renderS5(){
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
  return `
  <div class="section-eyebrow">Section 5 · Listening Skill</div>
  <h2 class="section-title">Listening for Opinions</h2>
  <p class="section-sub">Listen for opinion words and phrases.</p>
  <div class="panel">
    <div class="rule-box"><b>Tip</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul></div>
    ${renderAudioTrack(AUDIO.listenSkillEx, 'Examples', 'Listen to how opinions are signaled in short sentences.')}
  </div>
  <div class="panel">
    ${renderAudioTrack(AUDIO.listenSkillAct, 'Four Conversations', 'Listen to four short conversations about housing.')}
    ${convos}
    <button class="reveal-btn" id="s5check">Check My Answers</button>
    <div class="answer-key" id="s5key"></div>
  </div>`;
}
function wireS5(){
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
  document.getElementById('s5check').addEventListener('click', ()=>{
    let correctTotal = 0, possibleTotal = 0;
    OPINION_CONVOS.forEach((c,i)=>{
      possibleTotal += c.correct.length;
      c.correct.forEach(j=>{ if(selections[i].has(j)) correctTotal++; });
      const fb = document.querySelector(`[data-ocfb="${i}"]`);
      fb.className = 'feedback show good';
      fb.textContent = 'Correct opinions: ' + c.correct.map(j=>c.opts[j]).join(' / ');
    });
    markActivityComplete('s5', {score:`${correctTotal}/${possibleTotal}`});
  });
}

/* ===== Section 6: Note-Taking Skill — Pros and Cons (real audio) ===== */
function renderS6(){
  const pros = PROSCONS_ROWS.filter(r=>r.side==='pro');
  const cons = PROSCONS_ROWS.filter(r=>r.side==='con');
  const col = (title,rows,prefix) => `
    <div>
      <h3 style="font-size:15px;color:var(--navy);">${title}</h3>
      ${rows.map((r,i)=>`<div class="fill-row"><div class="fr-num">${i+1}</div><input type="text" data-${prefix}="${i}" placeholder="what did you hear?"></div>`).join('')}
    </div>`;
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Note-Taking Skill: Pros and Cons</h2>
  <p class="section-sub">Listen to John and Amanda talk about John's dormitory. Take notes in a Pros/Cons chart.</p>
  <div class="panel">
    ${renderAudioTrack(AUDIO.notetaking, 'Pros and Cons', "John and Amanda talk about John's dormitory.")}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:22px;">
      ${col('Pros', pros, 'pro')}
      ${col('Cons', cons, 'con')}
    </div>
    <button class="reveal-btn" id="s6check">Check My Answers</button>
    <div class="answer-key" id="s6key"></div>
  </div>`;
}
function wireS6(){
  wireAudioTracks();
  document.getElementById('s6check').addEventListener('click', ()=>{
    const pros = PROSCONS_ROWS.filter(r=>r.side==='pro').map(r=>r.label).join(', ');
    const cons = PROSCONS_ROWS.filter(r=>r.side==='con').map(r=>r.label).join(', ');
    const key = document.getElementById('s6key');
    key.className = 'answer-key show';
    key.innerHTML = `<b>Pros:</b> ${pros}<br><b>Cons:</b> ${cons}`;
    markActivityComplete('s6', {score:`${PROSCONS_ROWS.length} notes`});
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
