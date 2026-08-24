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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','practice','s11'];

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
}
function sendGranularRecord(label, opts={}){
  sendProgressRecord(buildRecord(label, {score: opts.score ?? null, completionStatus: opts.completionStatus || 'completed'}));
}
function completedCount(){
  return TRACKED_ACTIVITIES.filter(k => Progress.activities[k]).length;
}
function updateTopbarBadge(){
  const el = document.getElementById('studentBadge');
  if(!el) return;
  if(!Progress.studentName){ el.style.display='none'; return; }
  el.style.display='';
  el.innerHTML = `<b>${Progress.studentName}</b> · ${completedCount()}/${TRACKED_ACTIVITIES.length} done`;
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
    <h1>My Daily <span>Routine</span> as a Student</h1>
    <p>Unit 5: 1st Year Accounting · A1. Talk about what you do every day: waking up, getting ready, attending class, studying, and going to bed, using time words and simple present tense.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.wake.src}" alt="${SECTION_PHOTOS.wake.alt}" loading="lazy">
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> 5 routine words</div>
      <div class="signchip"><span class="arrow">→</span> Time &amp; sequencing</div>
      <div class="signchip"><span class="arrow">→</span> Speak about your day</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

function renderS1(){
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Warm-Up</h2>
  <p class="section-sub">Quick question before we start. There are no wrong answers here.</p>
  <div class="panel">
    <div class="scene">
      <div class="avatar">?</div>
      <div class="bubble">What time did you wake up today?</div>
    </div>
    <p style="margin-top:16px;color:var(--muted);font-size:14px;">Say your answer out loud to a partner or to the class.</p>
    <button class="startbtn" id="s1done" style="margin-top:18px;">I've shared my answer →</button>
  </div>`;
}
function wireS1(){
  document.getElementById('s1done').addEventListener('click', ()=>{ markActivityComplete('s1'); goNext(); });
}

function renderS2(){
  const cards = VOCAB.map(v=>{
    const photo = SECTION_PHOTOS[v.id];
    return `
    <div class="loc-card" data-id="${v.id}">
      <div class="ic">${v.ic}</div>
      <div class="nm">${v.nm}</div>
      <div class="loc-detail">
        ${photo ? `<img class="venue-photo loc-photo" src="${photo.src}" alt="${photo.alt}" loading="lazy" style="margin-bottom:10px;">` : ''}
        <b style="color:var(--navy);">${v.thai}</b><br>${v.ex}
        <br><button class="audio-mini" data-say="${v.ex.replace(/"/g,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
      </div>
    </div>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Vocabulary</h2>
  <p class="section-sub">Tap each card, then tap Listen. Repeat the word out loud.</p>
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
    const card = e.target.closest('.loc-card'); if(!card) return;
    card.classList.toggle('open');
    opened.add(card.dataset.id);
    if(opened.size >= VOCAB.length) markActivityComplete('s2');
  });
}

function renderS3(){
  const examples = GRAMMAR_EX.map(g=>`<div class="phrase-card"><span class="txt"><b style="color:var(--orange-deep);font-size:11px;">${g.tag.toUpperCase()}</b> · ${g.text}</span><button class="audio-mini" data-say="${g.text}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>`).join('');
  const quiz = GRAMMAR_CHECK.map((q,i)=>`
    <div class="sit-card" data-gq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${q.q}</p>
      <div class="choices" data-gchoices="${i}">
        ${q.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-gfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Grammar &amp; Phrases</h2>
  <p class="section-sub">Talking about routines: simple present, time words, and sequencing.</p>
  <div class="panel">
    <div class="rule-box">
      Use <b>simple present</b> for habits: <i>I wake up, I attend class.</i><br>
      Use <b>time words</b>: at 6 a.m. · in the morning · after class · before bed.<br>
      Use <b>sequencing words</b> to put things in order: <i>First, Then, After that, Finally.</i>
    </div>
    <div class="phrase-list" style="margin-top:16px;">${examples}</div>
    <hr class="hairline">
    <h3 style="font-size:16px;color:var(--navy);">Quick Check</h3>
    ${quiz}
  </div>`;
}
function wireS3(){
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'a')));
  const answered = new Set();
  GRAMMAR_CHECK.forEach((q,i)=>{
    const box = document.querySelector(`[data-gchoices="${i}"]`);
    const fb = document.querySelector(`[data-gfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === q.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Try again.'; }
      answered.add(i);
      if(answered.size >= GRAMMAR_CHECK.length) markActivityComplete('s3');
    });
  });
}

function renderS4(){
  const cards = PRACTICE_SENTENCES.map((p,i)=>`
    <div class="sit-card" data-pq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${p.text}</p>
      <div class="choices" data-pchoices="${i}">
        ${p.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-pfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Guided Practice</h2>
  <p class="section-sub">Build the sentence. Choose the correct word for each blank.</p>
  <div class="panel">${cards}</div>`;
}
function wireS4(){
  const answered = new Set(); let correctCount = 0;
  PRACTICE_SENTENCES.forEach((p,i)=>{
    const box = document.querySelector(`[data-pchoices="${i}"]`);
    const fb = document.querySelector(`[data-pfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === p.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Try again.'; }
      if(!answered.has(i)){
        answered.add(i);
        if(+btn.dataset.i === p.correct) correctCount++;
        if(answered.size >= PRACTICE_SENTENCES.length) markActivityComplete('s4', {score:`${correctCount}/${PRACTICE_SENTENCES.length}`});
      }
    });
  });
}

function renderS5(){
  const squares = BINGO_ITEMS.map((item,i)=>{
    if(item.free) return `<div class="bingo-sq free"><div class="b-em"></div><div class="b-txt">FREE</div></div>`;
    return `<div class="bingo-sq" data-sq="${i}"><div class="b-em">${item.ic}</div><div class="b-txt">${item.short}</div></div>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Find Someone Who... Bingo</h2>
  <p class="section-sub">Walk and talk! Ask classmates the full question (e.g. "What time do you wake up?") and tap the square to save their name.</p>
  <div class="panel">
    <div class="bingo-grid">${squares}</div>
    <div id="bingoWinBanner" class="bingo-win-banner" style="display:none;">BINGO! Keep asking or move on when you're ready.</div>
    <div id="bingoEditor"></div>
  </div>`;
}
function wireS5(){
  const filled = {};
  const grid = document.querySelector('#app .bingo-grid');
  const editorWrap = document.getElementById('bingoEditor');
  const winBanner = document.getElementById('bingoWinBanner');
  function checkWin(){
    return BINGO_LINES.some(line => line.every(idx => idx===12 || filled[idx]!==undefined));
  }
  function closeEditor(){ editorWrap.innerHTML=''; }
  grid.addEventListener('click', e=>{
    const sq = e.target.closest('.bingo-sq[data-sq]'); if(!sq) return;
    const i = +sq.dataset.sq;
    const item = BINGO_ITEMS[i];
    editorWrap.innerHTML = `
      <div class="bingo-editor">
        <div class="beq">"${item.q}"</div>
        <input class="lvl-input" id="bingoNameInput" placeholder="Classmate's name" value="${filled[i]||''}">
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="tb-btn primary" id="bingoSave">Save</button>
          <button class="tb-btn" id="bingoCancel">Cancel</button>
        </div>
      </div>`;
    document.getElementById('bingoSave').addEventListener('click', ()=>{
      const name = document.getElementById('bingoNameInput').value.trim();
      if(!name) return;
      filled[i] = name;
      sq.classList.add('filled');
      sq.querySelector('.b-txt').textContent = name;
      closeEditor();
      if(checkWin()) winBanner.style.display='block';
      if(Object.keys(filled).length >= 5) markActivityComplete('s5', {score:`${Object.keys(filled).length}/24`});
    });
    document.getElementById('bingoCancel').addEventListener('click', closeEditor);
  });
}

function renderS6(){
  const starters = REPORT_STARTERS.map(s=>`<div class="phrase-card"><span class="txt">${s}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Report Back</h2>
  <p class="section-sub">Tell the class what you discovered during Bingo. Use sentences like these:</p>
  <div class="panel">
    <div class="phrase-list">${starters}</div>
    <button class="startbtn" id="s6done" style="margin-top:18px;">I've reported back →</button>
  </div>`;
}
function wireS6(){
  document.getElementById('s6done').addEventListener('click', ()=>{ markActivityComplete('s6'); goNext(); });
}

function renderS7(){
  const cards = DISCUSSION_PROMPTS.map((p,i)=>`<div class="disc-card"><div class="disc-num">${i+1}</div><div>${p}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Class Discussion</h2>
  <p class="section-sub">Your teacher will guide a short discussion using these questions.</p>
  <div class="panel">
    ${cards}
    <button class="startbtn" id="s7done" style="margin-top:18px;">We discussed as a class →</button>
  </div>`;
}
function wireS7(){
  document.getElementById('s7done').addEventListener('click', ()=>{ markActivityComplete('s7'); goNext(); });
}

let timerState = { seconds:300, running:false, round:1, intervalId:null };
function renderS8(){
  const q = INTERVIEW_QUESTIONS[0];
  return `
  <div class="section-eyebrow">Section 8</div>
  <h2 class="section-title">Partner Interview</h2>
  <p class="section-sub">Pair up. Partner A interviews Partner B using the questions below. When the timer ends, switch roles.</p>
  <div class="panel">
    <div class="timer-card">
      <div class="timer-round" id="timerRoundLbl">Round 1 of 2 · Partner A asks</div>
      <div class="timer-num" id="timerDisplay">5:00</div>
      <div class="timer-sub" id="timerSub">Ready when you are</div>
      <div class="timer-btns">
        <button class="tb-btn primary" id="timerStart">Start</button>
        <button class="tb-btn" id="timerReset">Reset</button>
      </div>
    </div>
    <div class="interview-card">
      <div class="interview-nav">
        <button id="prevQ" disabled>‹</button>
        <div class="cnt3" id="interviewCnt">Question 1 of ${INTERVIEW_QUESTIONS.length}</div>
        <button id="nextQ">›</button>
      </div>
      <div class="interview-q" id="interviewQ">"${q}"</div>
      <button class="listen-btn audio-mini" id="listenQ" data-say="${q}" style="margin-top:12px;"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
    </div>
  </div>`;
}
function wireS8(){
  let qIdx = 0;
  const visited = new Set([0]);
  const display = document.getElementById('timerDisplay');
  const sub = document.getElementById('timerSub');
  const roundLbl = document.getElementById('timerRoundLbl');
  const startBtn = document.getElementById('timerStart');
  const resetBtn = document.getElementById('timerReset');
  clearInterval(timerState.intervalId);
  timerState = { seconds:300, running:false, round:1, intervalId:null };

  function renderTimer(){
    const m = Math.floor(timerState.seconds/60), s = timerState.seconds%60;
    display.textContent = `${m}:${s<10?'0':''}${s}`;
    display.classList.toggle('urgent', timerState.seconds<=10 && timerState.seconds>0);
    roundLbl.textContent = `Round ${timerState.round} of 2 · ${timerState.round===1?'Partner A asks':'Partner B asks'}`;
    sub.textContent = timerState.running ? 'Interviewing now…' : (timerState.seconds===0 ? "Time's up!" : 'Ready when you are');
    startBtn.textContent = timerState.running ? 'Pause' : (timerState.seconds===300 ? 'Start' : 'Resume');
  }
  startBtn.addEventListener('click', ()=>{
    if(timerState.running){
      timerState.running = false; clearInterval(timerState.intervalId);
    } else {
      timerState.running = true;
      timerState.intervalId = setInterval(()=>{
        if(timerState.seconds>0){ timerState.seconds--; renderTimer(); }
        else {
          clearInterval(timerState.intervalId); timerState.running=false;
          if(timerState.round===1){ timerState.round=2; timerState.seconds=300; }
          renderTimer();
        }
      }, 1000);
    }
    renderTimer();
  });
  resetBtn.addEventListener('click', ()=>{
    clearInterval(timerState.intervalId);
    timerState = { seconds:300, running:false, round:1, intervalId:null };
    renderTimer();
  });

  function showQ(){
    document.getElementById('interviewQ').textContent = `"${INTERVIEW_QUESTIONS[qIdx]}"`;
    document.getElementById('interviewCnt').textContent = `Question ${qIdx+1} of ${INTERVIEW_QUESTIONS.length}`;
    document.getElementById('prevQ').disabled = qIdx===0;
    document.getElementById('nextQ').disabled = qIdx===INTERVIEW_QUESTIONS.length-1;
    document.getElementById('listenQ').dataset.say = INTERVIEW_QUESTIONS[qIdx];
    visited.add(qIdx);
    if(visited.size >= INTERVIEW_QUESTIONS.length) markActivityComplete('s8');
  }
  document.getElementById('prevQ').addEventListener('click', ()=>{ if(qIdx>0){ qIdx--; showQ(); } });
  document.getElementById('nextQ').addEventListener('click', ()=>{ if(qIdx<INTERVIEW_QUESTIONS.length-1){ qIdx++; showQ(); } });
  document.getElementById('listenQ').addEventListener('click', e=>speak(e.target.dataset.say,'a'));
}

function renderS9(){
  const phraseGroup = (title, items) => `
    <div class="phrase-group">
      <h4>${title}</h4>
      <div class="phrase-list">${items.map(p=>`<div class="phrase-card"><span class="txt">${p}</span><button class="audio-mini" data-say="${p}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>`).join('')}</div>
    </div>`;
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">"A Day in My Life" Vlog</h2>
  <p class="section-sub">Just like a TikTok or Reels "day in my life" video, film yourself going through your day and narrate it in English.</p>
  <div class="panel">
    <span class="deadline-chip">Due Friday · Submit on OpenChat</span>
    <div class="assign-box">
      <h3>Make a 1–2 minute vlog</h3>
      <ul>
        <li>Length: <b>1–2 minutes</b></li>
        <li>Use at least <b>4</b> routine phrases from today's lesson</li>
        <li>Use at least <b>2</b> vlog phrases (hook, transition, or outro)</li>
        <li>Mention at least <b>3</b> different times of day</li>
        <li>Send the video file or link on <b>OpenChat</b> by <b>Friday</b></li>
      </ul>
    </div>
    ${phraseGroup('Hook (start strong)', VLOG_HOOKS)}
    ${phraseGroup('Transitions (move through your day)', VLOG_TRANSITIONS)}
    ${phraseGroup('Routine phrases (from today)', VLOG_ROUTINE)}
    ${phraseGroup('Outro (end it well)', VLOG_OUTRO)}
    <button class="startbtn" id="s9done" style="margin-top:18px;">I understand the assignment →</button>
  </div>`;
}
function wireS9(){
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'a')));
  document.getElementById('s9done').addEventListener('click', ()=>{ markActivityComplete('s9'); goNext(); });
}

function renderS10(){
  const q = (item, i, prefix) => `
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${item.q}</p>
      <div class="choices" data-exitchoices="${prefix}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-exitfb="${prefix}"></div>
    </div>`;
  return `
  <div class="section-eyebrow">Section 10</div>
  <h2 class="section-title">Exit Ticket</h2>
  <p class="section-sub">Before you go: two quick questions and a confidence check.</p>
  <div class="panel">
    ${q(EXIT_TICKET[0], 0, '0')}
    ${q(EXIT_TICKET[1], 1, '1')}
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">How confident do you feel talking about your daily routine?</p>
      <div class="rate" data-k="confidence" style="margin-top:12px;">
        ${[1,2,3,4,5].map(n=>`<button data-n="${n}">${n}</button>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:6px;">
        <span>Not confident</span><span>Very confident</span>
      </div>
    </div>
  </div>`;
}
function wireS10(){
  const answered = new Set(); let correctCount = 0; let confidenceSet = false;
  function checkDone(){
    if(answered.size >= EXIT_TICKET.length && confidenceSet){
      markActivityComplete('s10', {score:`${correctCount}/${EXIT_TICKET.length}, confidence rated`});
    }
  }
  EXIT_TICKET.forEach((item,i)=>{
    const box = document.querySelector(`[data-exitchoices="${i}"]`);
    const fb = document.querySelector(`[data-exitfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite.'; }
      if(!answered.has(i)){
        answered.add(i);
        if(+btn.dataset.i === item.correct) correctCount++;
        checkDone();
      }
    });
  });
  const rate = document.querySelector('#app .rate');
  rate.addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    [...rate.children].forEach(b=>b.classList.remove('sel'));
    btn.classList.add('sel');
    confidenceSet = true;
    checkDone();
  });
}

/* ===================== PRACTICE SETS (Section 11) ===================== */
function renderPractice(){
  const vocabCards = LAB_VOCAB.map((item,i)=>`
    <div class="sit-card" data-vq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${item.q}</p>
      <div class="choices" data-vchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-vfb="${i}"></div>
    </div>`).join('');

  const grammarCards = LAB_GRAMMAR.map((item,i)=>`
    <div class="sit-card" data-gg="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${item.q}</p>
      <div class="choices" data-ggchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-ggfb="${i}"></div>
    </div>`).join('');

  const timeCards = LAB_TIME.map((item,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${item.q}</p>
      <div class="choices">
        ${item.choices.map(c=>`<button class="choice-btn" data-selfreport="1"><span class="letter">•</span> ${c}</button>`).join('')}
      </div>
    </div>`).join('');

  const listenCards = LAB_LISTEN.map((item,i)=>`
    <div class="sit-card" data-lq="${i}">
      <div class="playbar" style="padding:12px 16px;">
        <button class="play-btn" style="width:44px;height:44px;font-size:17px;" data-lplay="${i}">${icon('play',{size:17})}</button>
        <div style="flex:1;"><div class="play-sub">Listen, then choose the matching sentence.</div></div>
      </div>
      <div class="choices" style="margin-top:14px;" data-lchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-lfb="${i}"></div>
    </div>`).join('');

  const speakCards = LAB_SPEAK_PROMPTS.map((p,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--orange-deep);">${p.text}</p>
      <div class="keyword-row">${LAB_SPEAK_STARTERS.map(s=>`<span class="kw">${s}</span>`).join('')}</div>
    </div>`).join('');

  return `
  <div class="section-eyebrow">Section 11</div>
  <h2 class="section-title">Practice Sets</h2>
  <p class="section-sub">Review • Grammar • Your Time • Listen • Speak: extra practice before the exit ticket.</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-ptab="vocab">1. Vocab Review</button>
      <button class="tab-btn" data-ptab="grammar">2. Grammar Check</button>
      <button class="tab-btn" data-ptab="time">3. Your Time</button>
      <button class="tab-btn" data-ptab="listen">4. Listen &amp; Choose</button>
      <button class="tab-btn" data-ptab="speak">5. Speak It</button>
    </div>
    <div class="tab-panel active" data-ppanel="vocab">${vocabCards}</div>
    <div class="tab-panel" data-ppanel="grammar">${grammarCards}</div>
    <div class="tab-panel" data-ppanel="time"><p style="color:var(--muted);font-size:13px;margin-bottom:10px;">No wrong answers. Just tell us about your own routine.</p>${timeCards}</div>
    <div class="tab-panel" data-ppanel="listen">${listenCards}</div>
    <div class="tab-panel" data-ppanel="speak">
      ${speakCards}
      <p style="color:var(--muted);font-size:12px;margin-top:10px;">This site cannot grade your pronunciation. Say your answer aloud and ask your teacher or partner to check it.</p>
    </div>
  </div>`;
}
function wirePractice(){
  const vAnswered = new Set(); let vCorrect = 0;
  const gAnswered = new Set(); let gCorrect = 0;
  function checkOverall(){
    if(vAnswered.size >= LAB_VOCAB.length && gAnswered.size >= LAB_GRAMMAR.length){
      markActivityComplete('practice', {score: `Vocab ${vCorrect}/${LAB_VOCAB.length} · Grammar ${gCorrect}/${LAB_GRAMMAR.length}`});
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
  LAB_VOCAB.forEach((item,i)=>{
    const box = document.querySelector(`[data-vchoices="${i}"]`);
    const fb = document.querySelector(`[data-vfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Try again.'; }
      if(!vAnswered.has(i)){ vAnswered.add(i); if(+btn.dataset.i === item.correct) vCorrect++; checkOverall(); }
    });
  });
  LAB_GRAMMAR.forEach((item,i)=>{
    const box = document.querySelector(`[data-ggchoices="${i}"]`);
    const fb = document.querySelector(`[data-ggfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent=item.explain; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent=item.explain; }
      if(!gAnswered.has(i)){ gAnswered.add(i); if(+btn.dataset.i === item.correct) gCorrect++; checkOverall(); }
    });
  });
  document.querySelectorAll('#app [data-selfreport]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const box = btn.parentElement;
      [...box.children].forEach(b=>b.classList.remove('correct'));
      btn.classList.add('correct');
    });
  });
  LAB_LISTEN.forEach((item,i)=>{
    document.querySelector(`[data-lplay="${i}"]`).addEventListener('click', ()=> speak(item.audio,'a'));
    const box = document.querySelector(`[data-lchoices="${i}"]`);
    const fb = document.querySelector(`[data-lfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Listen again and try once more.'; }
    });
  });
}

const RUBRIC = [
  {k:'vocab', lbl:'Vocabulary', sub:'I can use the 5 routine words correctly.'},
  {k:'time', lbl:'Time Words', sub:'I can say what time I do things.'},
  {k:'sequence', lbl:'Sequencing', sub:'I can use First, Then, After that, Finally.'},
  {k:'partner', lbl:'Asking a Partner', sub:'I can ask a classmate about their daily routine.'},
  {k:'confidence', lbl:'Confidence', sub:'I feel confident speaking about my day.'}
];
function renderS11(){
  const rows = RUBRIC.map(r=>`
    <div class="rubric-row">
      <div><div class="lbl">${r.lbl}</div><div class="sub">${r.sub}</div></div>
      <div class="rate" data-k="${r.k}">
        ${[1,2,3].map(n=>`<button data-n="${n}">${n}</button>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 12</div>
  <h2 class="section-title">Self-Check &amp; Take Home</h2>
  <p class="section-sub">Rate yourself honestly. Your teacher remains the final evaluator.</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this lesson, you should feel more confident talking about your daily routine in English.</p>
  </div>

  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">My Daily Routine: Quick Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review the key vocabulary, sentence patterns, and useful phrases from Unit 5.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="My Daily Routine: Quick Guide preview" class="guide-thumb" loading="lazy">
    <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="downloadGuideBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Daily Routine Study Guide</a>
  </div>`;
}
function wireS11(){
  const rateGroups = document.querySelectorAll('#app .rate');
  rateGroups.forEach(rate=>{
    rate.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...rate.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      const ratedCount = [...rateGroups].filter(r => r.querySelector('.sel')).length;
      if(ratedCount >= rateGroups.length){
        markActivityComplete('s11', {score: `self-rated ${ratedCount}/${rateGroups.length}`});
      }
    });
  });
}

/* ===================== COMPLETE (final end screen) ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 5 COMPLETE</div>
    <h1>You can talk about <span>your daily routine.</span></h1>
    <p>Review the guide, keep practicing time words, and don't forget the vlog assignment!</p>
    <div class="complete-actions">
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
  document.getElementById('completePracticeBtn').addEventListener('click', ()=> goTo(11));
  document.getElementById('completeHomeBtn').addEventListener('click', ()=> goTo(0));

  const stats = document.getElementById('completeStats');
  if(stats){
    const vlog = Progress.activities['s9'] ? 'Yes' : 'No';
    const practice = Progress.activities['practice'] ? 'Yes' : 'No';
    stats.innerHTML = `
      <p class="complete-stats-intro">Your progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Activities Completed</div></div>
        <div class="complete-stat"><div class="num">${practice}</div><div class="lbl">Practice Completed</div></div>
        <div class="complete-stat"><div class="num">${vlog}</div><div class="lbl">Vlog Assignment Seen</div></div>
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
  {r:renderS10, w:wireS10},
  {r:renderPractice, w:wirePractice},
  {r:renderS11, w:wireS11},
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
}
function goNext(){ if(current<RENDERERS.length-1){ current++; renderAll(); } }
function goPrev(){ if(current>0){ current--; renderAll(); } }
function goTo(i){ current = Math.max(0, Math.min(RENDERERS.length-1, i)); renderAll(); }

document.getElementById('btnNext').addEventListener('click', goNext);
document.getElementById('btnPrev').addEventListener('click', goPrev);
document.getElementById('btnHome').addEventListener('click', ()=>{ current=0; renderAll(); });
document.getElementById('btnReset').addEventListener('click', renderAll);

renderAll();
wireCheckin();
