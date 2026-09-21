/* ===================== APP STATE / ROUTER =====================
   Same router/progress/voice/checkin/deep-link architecture as every
   other unit in the hub (copied from Unit 7, unchanged in shape) — see
   that file's comments for the full rationale. Nothing here is a new
   system; Unit 8 plugs into the existing one. */
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
  const answers = opts.answers || '';
  const prev = Progress.activities[key];
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
const CHECKIN_STORAGE_KEY = 'efc_u8_checkin';
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

/* Registered once at module load (not inside wireS2, which reruns every
   time Section 2 is revisited) so this never accumulates duplicate
   listeners. Looks up the lightbox fresh each keypress since it only
   exists in the DOM while Section 2 is the active section. */
document.addEventListener('keydown', e=>{
  if(e.key !== 'Escape') return;
  const lightbox = document.getElementById('vcLightbox');
  if(lightbox) lightbox.classList.remove('show');
});

/* ===================== AUDIO PLAYER (real licensed Q Skills recordings) =====================
   First unit on the site to embed real MP3 tracks instead of TTS. One
   <audio> element per src (lazily created), only one plays at a time.
   Any element with [data-audio-btn="<src>"] toggles play/pause on that
   track and gets the .playing class synced to real playback state. */
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
    restart(src){
      const a = get(src);
      stopOthers(src);
      a.currentTime = 0;
      a.play();
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
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>Free-Time <span>Activities</span></h1>
    <p>Unit 8: Sociology, Day 1. Listen to a real class discussion about how people spend their free time, and find out why board games are back in style.</p>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> New vocabulary</div>
      <div class="signchip"><span class="arrow">→</span> Real listening practice</div>
      <div class="signchip"><span class="arrow">→</span> Notice reasons</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Warm-Up ===== */
function renderS1(){
  const qs = WARMUP_QUESTIONS.map(q=>`<li>${q}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Warm-Up: What Do You Enjoy?</h2>
  <p class="section-sub">Talk with your classmates before you listen.</p>
  <div class="panel">
    <div class="rule-box"><b>Discuss</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${qs}</ul></div>
    <p style="margin-top:18px;font-weight:600;color:var(--navy);">${WARMUP_PHOTO_PROMPT}</p>
    ${renderAudioTrack(AUDIO.qClassroom, 'The Q Classroom', 'Listen to students talk about their own free-time interests.')}
    <button class="startbtn" id="s1done" style="margin-top:20px;">We discussed it →</button>
  </div>`;
}
function wireS1(){
  wireAudioTracks();
  document.getElementById('s1done').addEventListener('click', ()=>{ markActivityComplete('s1'); goNext(); });
}

/* ===== Section 2: Key Vocabulary ===== */
function renderS2(){
  const cards = VOCAB.map(v=>`
    <div class="vocab-card" data-vocab="${v.id}">
      ${v.img ? `<img class="vc-photo" src="${v.img}" alt="A photo showing the meaning of '${v.nm}'" loading="lazy">` : ''}
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
  <p class="section-sub">Click a card to see the meaning. Click a photo to zoom in and discuss it. Then complete the sentences.</p>
  <div class="panel"><div class="vocab-grid">${cards}</div></div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Complete each sentence.</h3>
    ${fills}
    <button class="reveal-btn" id="s2check">Check My Answers</button>
    <div class="answer-key" id="s2key"></div>
  </div>
  <div class="vc-lightbox" id="vcLightbox">
    <button class="vc-lightbox-close" id="vcLightboxClose" aria-label="Close">${icon('x',{size:22})}</button>
    <img id="vcLightboxImg" src="" alt="">
    <div class="vc-lightbox-caption" id="vcLightboxCaption"></div>
  </div>`;
}
function wireS2(){
  document.querySelectorAll('#app .vocab-card').forEach(c=>c.addEventListener('click', ()=> c.classList.toggle('open')));
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', e=>{ e.stopPropagation(); speak(b.dataset.say); }));

  /* Click a vocab photo to zoom it in for whole-class discussion, without
     also toggling that card's definition open/closed. */
  const lightbox = document.getElementById('vcLightbox');
  const lightboxImg = document.getElementById('vcLightboxImg');
  const lightboxCaption = document.getElementById('vcLightboxCaption');
  function openLightbox(v){
    lightboxImg.src = v.img;
    lightboxImg.alt = `A photo showing the meaning of '${v.nm}'`;
    lightboxCaption.textContent = `${v.nm}: ${v.def}`;
    lightbox.classList.add('show');
  }
  function closeLightbox(){ lightbox.classList.remove('show'); }
  document.querySelectorAll('#app .vc-photo').forEach(img=>{
    img.addEventListener('click', e=>{
      e.stopPropagation();
      const v = VOCAB.find(x=>x.id === e.target.closest('.vocab-card').dataset.vocab);
      if(v) openLightbox(v);
    });
  });
  document.getElementById('vcLightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e=>{ if(e.target === lightbox) closeLightbox(); });
  document.getElementById('s2check').addEventListener('click', ()=>{
    let correct = 0;
    VOCAB_FILL.forEach((f,i)=>{
      const inp = document.querySelector(`[data-fill="${i}"]`);
      if(inp.value.trim().toLowerCase() === f.answer) correct++;
    });
    const key = document.getElementById('s2key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Answer Key</b><br>' + VOCAB_FILL.map((f,i)=>`${i+1}. ${f.answer}`).join(' &nbsp; ');
    markActivityComplete('s2', {score:`${correct}/${VOCAB_FILL.length}`});
  });
}

/* ===== Section 3: Note-Taking Skill (real audio) ===== */
function renderS3(){
  const tip = NOTETAKING_TIP.map(t=>`<li>${t}</li>`).join('');
  const rows = NOTETAKING_ROWS.map((r,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt">A student ${r.activity}. Why?</div>
      <input type="text" data-nt="${i}" placeholder="reason">
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Note-Taking Skill: Taking Notes on Reasons</h2>
  <p class="section-sub">Listen for reasons, then take short notes.</p>
  <div class="panel">
    <div class="rule-box"><b>Tip</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul></div>
    ${renderAudioTrack(AUDIO.notetaking, 'Note-Taking Skill', 'Listen to two students talk at the mall.')}
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">Write the reason for each activity.</h3>
    ${rows}
    <button class="reveal-btn" id="s3check">Check My Answers</button>
    <div class="answer-key" id="s3key"></div>
  </div>`;
}
function wireS3(){
  wireAudioTracks();
  document.getElementById('s3check').addEventListener('click', ()=>{
    const key = document.getElementById('s3key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Answer Key</b><br>' + NOTETAKING_ROWS.map((r,i)=>`${i+1}. ${r.answer}`).join('<br>');
    markActivityComplete('s3', {score:`${NOTETAKING_ROWS.length} notes taken`});
  });
}

/* ===== Section 4: Listening: Free-Time Activities (real audio) ===== */
function renderS4(){
  const tfRows = LISTEN_TF.map((t,i)=>`
    <div class="sit-card" data-tf="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${t.stmt}</p>
      <div class="choices" data-tfchoices="${i}">
        <button class="choice-btn" data-v="T"><span class="letter">T</span> True</button>
        <button class="choice-btn" data-v="F"><span class="letter">F</span> False</button>
        <button class="choice-btn" data-v="N"><span class="letter">N</span> Not enough information</button>
      </div>
      <div class="feedback" data-tffb="${i}"></div>
    </div>`).join('');
  const mcRows = LISTEN_MC.map((item,i)=>`
    <div class="sit-card" data-mq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${item.q}</p>
      <div class="choices" data-mchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-mfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Listening: Free-Time Activities</h2>
  <p class="section-sub">Listen to a class discussion about free-time activities. You may listen more than once.</p>
  <div class="panel">
    ${renderAudioTrack(AUDIO.listening, 'Free-Time Activities', 'A class discusses how people spend their free time.')}
    <h3 style="font-size:16px;color:var(--navy);margin-top:22px;">Activity A: True, False, or Not Enough Information</h3>
    ${tfRows}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Activity B: Choose the Best Answer</h3>
    ${mcRows}
  </div>`;
}
function wireS4(){
  wireAudioTracks();
  const tfDone = new Set(), mcDone = new Set();
  function checkOverall(){ if(tfDone.size>=LISTEN_TF.length && mcDone.size>=LISTEN_MC.length) markActivityComplete('s4', {score:`${tfDone.size+mcDone.size}/${LISTEN_TF.length+LISTEN_MC.length}`}); }
  LISTEN_TF.forEach((t,i)=>{
    const box = document.querySelector(`[data-tfchoices="${i}"]`);
    const fb = document.querySelector(`[data-tffb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(btn.dataset.v === t.answer){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent=t.note; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Try again. Listen again if you need to.'; }
      tfDone.add(i); checkOverall();
    });
  });
  LISTEN_MC.forEach((item,i)=>{
    const box = document.querySelector(`[data-mchoices="${i}"]`);
    const fb = document.querySelector(`[data-mfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Try again.'; }
      mcDone.add(i); checkOverall();
    });
  });
}

/* ===== Section 5: Listening for Reasons (skill review, same audio) ===== */
function renderS5(){
  const rows = REASONS_CHART.map((r,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt">${r.q}</div>
      <input type="text" data-rc="${i}" placeholder="your answer">
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 5 · Skill Review</div>
  <h2 class="section-title">Listening for Reasons</h2>
  <p class="section-sub">Listen again. This time, focus only on the reasons. Answer every question, then press Check to see model answers.</p>
  <div class="panel">
    ${renderAudioTrack(AUDIO.listening, 'Free-Time Activities (listen again)', 'Same recording as Section 4 — focus on why, not what.')}
    ${rows}
    <button class="reveal-btn" id="s5check">Check My Answers</button>
    <div class="feedback" id="s5nudge"></div>
    <div class="answer-key" id="s5key"></div>
  </div>`;
}
function wireS5(){
  wireAudioTracks();
  document.getElementById('s5check').addEventListener('click', ()=>{
    const nudge = document.getElementById('s5nudge');
    const values = REASONS_CHART.map((r,i)=> document.querySelector(`[data-rc="${i}"]`).value.trim());
    if(values.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please answer every question before checking.';
      return;
    }
    nudge.className = 'feedback';
    // These are open "why" listening-comprehension questions -- a fair
    // paraphrase is a correct answer, so this isn't exact-match graded.
    // Your answer and the model answer are shown side by side so YOU can
    // judge it, and both are sent to the sheet for the same reason.
    const key = document.getElementById('s5key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Your Answers vs. Model Answers</b><br>' + REASONS_CHART.map((r,i)=>
      `${i+1}. Your answer: ${values[i]}<br>&nbsp;&nbsp;Model answer: ${r.answer}`
    ).join('<br><br>');
    const answers = REASONS_CHART.map((r,i)=>`Q${i+1}: ${values[i]} [model: ${r.answer}]`).join(' | ');
    markActivityComplete('s5', {score:`${values.length}/${values.length} answered`, answers});
  });
}

/* ===== Section 6: Noticing Differences (critical thinking) ===== */
function renderS6(){
  const tip = CONTRAST_TIP.map(t=>`<li>${t}</li>`).join('');
  const rows = CONTRAST_ITEMS.map((c,i)=>{
    const parts = c.sentence.split('___');
    return `<div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt">${parts[0]}<input type="text" data-ct="${i}" style="width:110px;display:inline-block;margin:0 4px;" placeholder="but / while / however">${parts[1]}</div>
    </div>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 6 · Critical Thinking</div>
  <h2 class="section-title">Noticing Differences</h2>
  <p class="section-sub">Choose the best contrast word for each sentence. Answer every question, then press Check.</p>
  <div class="panel">
    <div class="rule-box"><b>Tip</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul></div>
    ${rows}
    <button class="reveal-btn" id="s6check">Check My Answers</button>
    <div class="feedback" id="s6nudge"></div>
    <div class="answer-key" id="s6key"></div>
  </div>`;
}
function wireS6(){
  document.getElementById('s6check').addEventListener('click', ()=>{
    const nudge = document.getElementById('s6nudge');
    const inputs = CONTRAST_ITEMS.map((c,i)=> document.querySelector(`[data-ct="${i}"]`));
    const values = inputs.map(inp=>inp.value.trim());
    if(values.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please answer every question before checking.';
      return;
    }
    nudge.className = 'feedback';
    let correct = 0;
    const results = CONTRAST_ITEMS.map((c,i)=>{
      const given = values[i];
      const isCorrect = given.toLowerCase() === c.answer;
      if(isCorrect) correct++;
      inputs[i].classList.toggle('correct', isCorrect);
      inputs[i].classList.toggle('wrong', !isCorrect);
      return {given, isCorrect};
    });
    const key = document.getElementById('s6key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Results</b><br>' + results.map((r,i)=>
      r.isCorrect
        ? `${i+1}. ${r.given}, correct`
        : `${i+1}. ${r.given}, not quite. Correct answer: ${CONTRAST_ITEMS[i].answer}`
    ).join('<br>');
    const answers = results.map((r,i)=>`Q${i+1}: ${r.given}${r.isCorrect ? ' [correct]' : ` [wrong, correct: ${CONTRAST_ITEMS[i].answer}]`}`).join(' | ');
    markActivityComplete('s6', {score:`${correct}/${CONTRAST_ITEMS.length}`, answers});
  });
}

/* ===== Section 7: Building Vocabulary — do / play / go ===== */
function renderS7(){
  const groupList = (label, words) => `<div class="phrase-group"><h4>${label}</h4><div class="phrase-list">${words.map(w=>`<div class="phrase-card"><span class="txt">${w}</span></div>`).join('')}</div></div>`;
  const fills = COLLOC_FILL.map((f,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt">${f.sentence}</div>
      <input type="text" data-cf="${i}" placeholder="do / play / go">
    </div>`).join('');
  const personal = COLLOC_PERSONAL.map((q,i)=>`<div class="sit-card"><p style="font-weight:700;color:var(--navy);">${i+1}. ${q}</p></div>`).join('');
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Building Vocabulary: do / play / go</h2>
  <p class="section-sub">Some free-time words pair with do, some with play, and some with go.</p>
  <div class="panel">
    ${groupList('do +', COLLOCATIONS.do)}
    ${groupList('play +', COLLOCATIONS.play)}
    ${groupList('go +', COLLOCATIONS.go)}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Complete each sentence.</h3>
    ${fills}
    <button class="reveal-btn" id="s7check">Check My Answers</button>
    <div class="answer-key" id="s7key"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Answer with a partner.</h3>
    ${personal}
  </div>`;
}
function wireS7(){
  document.getElementById('s7check').addEventListener('click', ()=>{
    let correct = 0;
    COLLOC_FILL.forEach((f,i)=>{ if(document.querySelector(`[data-cf="${i}"]`).value.trim().toLowerCase() === f.answer) correct++; });
    const key = document.getElementById('s7key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Answer Key</b><br>' + COLLOC_FILL.map((f,i)=>`${i+1}. ${f.answer}`).join(' &nbsp; ');
    markActivityComplete('s7', {score:`${correct}/${COLLOC_FILL.length}`});
  });
}

/* ===== Section 8: Free-Time Activity Hunt (application task) =====
   The unit's one speaking/application activity: LISTEN -> UNDERSTAND -> ASK
   -> COLLECT INFORMATION -> REPORT. A worksheet, not a quiz -- there is no
   "correct answer" here (it's real information from classmates), so this
   section never uses .model-answer/.reveal-btn. The two model reports are
   always-visible examples, not answers to unlock. */
function renderS8(){
  const examples = HUNT_ACTIVITY_EXAMPLES.map(a=>`<div class="phrase-card"><span class="txt">${a}</span></div>`).join('');
  const reasonBank = Object.entries(HUNT_REASON_BANK).map(([head, items])=>`
    <div class="phrase-group"><h4>${head}</h4><div class="phrase-list">${items.map(i=>`<div class="phrase-card"><span class="txt">${i}</span></div>`).join('')}</div></div>
  `).join('');
  const huntRows = [0,1,2,3].map(i=>`
    <div class="hunt-row">
      <div class="hunt-num">${i+1}</div>
      <input type="text" class="hunt-input" data-hunt-name="${i}" placeholder="Classmate's name">
      <input type="text" class="hunt-input" data-hunt-activity="${i}" placeholder="Free-time activity">
      <input type="text" class="hunt-input" data-hunt-why="${i}" placeholder="Why? (reason)">
      <select class="hunt-select" data-hunt-io="${i}">
        <option value="">Indoor or outdoor?</option>
        <option value="indoor">Indoor</option>
        <option value="outdoor">Outdoor</option>
      </select>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 8 · Classroom Activity</div>
  <h2 class="section-title">Free-Time Activity Hunt</h2>
  <p class="section-sub">Listen → Ask → Collect information → Report. Use what you learned in this unit to talk to your classmates.</p>

  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Part 1: Find 4 Classmates</h3>
    <p style="color:var(--muted);font-size:13.5px;margin-top:6px;">Find 4 different classmates. Ask each one this question:</p>
    <div class="rule-box" style="margin-top:10px;"><b>"What do you do in your free time?"</b></div>
    <p style="color:var(--muted);font-size:13px;margin-top:14px;">Some ideas (you can use another activity too):</p>
    <div class="phrase-list" style="margin-top:8px;">${examples}</div>

    <h3 style="font-size:16px;color:var(--navy);margin-top:24px;">Part 2: Ask Why</h3>
    <p style="color:var(--muted);font-size:13.5px;margin-top:6px;">Then ask each classmate this question too:</p>
    <div class="rule-box" style="margin-top:10px;"><b>"Why do you like it?"</b></div>
    <p style="color:var(--muted);font-size:13px;margin-top:14px;">You can use your classmate's own words, or one of these:</p>
    ${reasonBank}
  </div>

  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">My Worksheet</h3>
    <p class="section-sub">Write your classmates' answers here.</p>
    <div class="hunt-table">
      <div class="hunt-row hunt-head">
        <div class="hunt-num">#</div>
        <div>Classmate</div>
        <div>Activity</div>
        <div>Why?</div>
        <div>Indoor / Outdoor</div>
      </div>
      ${huntRows}
    </div>
  </div>

  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Part 3: Indoor or Outdoor?</h3>
    <p style="color:var(--muted);font-size:13.5px;margin-top:6px;">Look at the 4 activities in your worksheet. For each one, choose Indoor or Outdoor above.</p>
    <p style="color:var(--muted);font-size:13px;margin-top:10px;">For example:</p>
    <div class="hunt-io-examples">
      <div><b>Indoor:</b> ${HUNT_INDOOR_OUTDOOR_EXAMPLES.indoor.join(', ')}</div>
      <div><b>Outdoor:</b> ${HUNT_INDOOR_OUTDOOR_EXAMPLES.outdoor.join(', ')}</div>
    </div>
    <p style="font-weight:600;color:var(--navy);margin-top:18px;">Do you prefer indoor or outdoor activities?</p>
    <div class="choices" id="s8prefChoices">
      <button class="choice-btn" data-pref="indoor">☐ Indoor</button>
      <button class="choice-btn" data-pref="outdoor">☐ Outdoor</button>
    </div>
    <div class="fill-row" style="margin-top:16px;">
      <div class="fr-prompt">I prefer <span id="s8prefWord">___</span> activities because</div>
      <input type="text" id="s8prefWhy" placeholder="a simple reason">
    </div>
  </div>

  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Part 4: Report</h3>
    <p class="section-sub">Your teacher will choose some students to give a short report to the class. You can look at your worksheet while you speak. You do not need to remember it.</p>
    <div class="rule-box"><b>Example report</b><p style="margin-top:8px;">${HUNT_MODEL_REPORT_LONG}</p></div>
    <div class="rule-box" style="margin-top:14px;"><b>Shorter example</b><p style="margin-top:8px;">${HUNT_MODEL_REPORT_SHORT}</p></div>
    <button class="startbtn" id="s8done" style="margin-top:20px;">I'm ready to report →</button>
  </div>`;
}
function wireS8(){
  document.querySelectorAll('#app [data-pref]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-pref]').forEach(b=>{ b.classList.remove('chosen'); b.textContent = '☐ ' + b.textContent.replace(/^[☐☑]\s*/,''); });
      btn.classList.add('chosen');
      btn.textContent = '☑ ' + btn.textContent.replace(/^[☐☑]\s*/,'');
      const wordEl = document.getElementById('s8prefWord');
      if(wordEl) wordEl.textContent = btn.dataset.pref;
    });
  });
  document.getElementById('s8done').addEventListener('click', ()=>{
    const filled = [0,1,2,3].filter(i=>{
      const nameInp = document.querySelector(`[data-hunt-name="${i}"]`);
      return nameInp && nameInp.value.trim();
    }).length;
    markActivityComplete('s8', {score:`${filled}/4 classmates`});
    goNext();
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 8 COMPLETE</div>
    <h1>You can talk about <span>free-time activities.</span></h1>
    <p>Next: Unit 9 continues Sociology with agreeing, disagreeing, and your group discussion assignment.</p>
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
