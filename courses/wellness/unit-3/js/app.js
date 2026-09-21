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
   Same shared Google Sheet as every other course/unit on this site. */
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
const CHECKIN_STORAGE_KEY = 'wellness_u3_checkin';
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

/* ===================== VOICE ENGINE ===================== */
const VoiceEngine = (function(){
  let allVoices = [];
  let staffVoice = null, delegateVoice = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const QUALITY_HINTS = ['natural','neural','premium','enhanced','online','wavenet','studio'];
  const GOOD_NAMES = ['google us english','samantha','ava','zoe','aria','jenny','guy','matthew','joanna','ryan','emma'];

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    const thaiVoice = allVoices.find(v => /th[-_]?th/i.test(v.lang) || /thai/i.test(v.name));
    const rishiVoice = allVoices.find(v => /rishi/i.test(v.name));
    const ukMaleVoice = allVoices.find(v => /google uk english male/i.test(v.name))
                      || allVoices.find(v => /^en-gb$/i.test(v.lang) && /male/i.test(v.name))
                      || allVoices.find(v => /^en-gb$/i.test(v.lang));
    staffVoice = thaiVoice || rishiVoice || allVoices[0] || null;
    delegateVoice = ukMaleVoice || allVoices[1] || allVoices[0] || null;
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
    const voice = kind==='delegate' ? delegateVoice : staffVoice;
    if(voice) u.voice = voice;
    u.lang = 'en-US';
    u.rate = (slower ? 0.86 : 1.0);
    u.pitch = kind==='delegate' ? 1.06 : 0.98;
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
      queue = [{text, kind: kind||'staff'}];
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
    speakConversation(lines){
      this.stop();
      queue = lines.map(l=>({text:l.text, kind: l.kind || 'staff'}));
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
  VoiceEngine.speakLine(text, kind==='delegate' ? 'delegate' : 'staff');
}
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">WELLNESS TOURISM MANAGEMENT PROGRAM</div>
    <h1>Can you <span>describe</span> a wellness place?</h1>
    <p>Unit 3: Describing Wellness Destinations. Explore a real wellness resort, learn the words and phrases that describe it, and practice introducing a wellness place to a guest.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <button class="startbtn" onclick="goNext()">Begin the lesson →</button>
  </div>`;
}

/* ---- Section 1: Explore The Destination ---- */
function renderS1(){
  const cards = FACILITIES.map(f=>{
    const photo = SECTION_PHOTOS[f.id];
    return `
    <div class="loc-card" data-id="${f.id}">
      <div class="ic">${f.ic}</div>
      <div class="nm">${f.nm}</div>
      <div class="loc-detail">
        ${photo ? `<img class="venue-photo loc-photo" src="${photo.src}" alt="${photo.alt}" loading="lazy" style="margin-bottom:10px;">` : ''}
        <p><b>What it is:</b> ${f.what}</p>
        <p><b>What guests can do:</b> ${f.can}</p>
        <p><b>Useful words:</b> ${f.words}</p>
        <p><b>Example:</b> ${f.phrase}</p>
        <button class="audio-mini" data-say="${f.phrase.replace(/"/g,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
      </div>
    </div>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Explore The Destination</h2>
  <p class="section-sub">Click each area of Baan Sabai Wellness Resort to see what it is, what guests can do there, and useful words and phrases.</p>
  <div class="panel">
    <div class="loc-grid">${cards}</div>
  </div>`;
}
function wireS1(){
  const opened = new Set();
  document.querySelectorAll('#app .loc-card').forEach(card=>{
    card.addEventListener('click', e=>{
      const audioBtn = e.target.closest('.audio-mini');
      if(audioBtn){ speak(audioBtn.dataset.say,'staff'); e.stopPropagation(); return; }
      card.classList.toggle('open');
      opened.add(card.dataset.id);
      if(opened.size >= FACILITIES.length) markActivityComplete('s1');
    });
  });
}

/* ---- Section 2: Wellness Vocabulary (reference table + matching) ---- */
function renderS2(){
  const vocabRows = VOCAB.map(v=>`
    <div class="phrase-card"><span class="txt"><b>${v.w}</b> <i style="color:var(--muted);font-weight:400;">(${v.t})</i>: ${v.d}</span></div>`).join('');
  const words = MATCH_PAIRS.map(v=>`<div class="match-item" data-word="${v.id}">${v.word}</div>`).join('');
  const meanings = shuffle(MATCH_PAIRS).map(v=>`<div class="match-item" data-pic="${v.id}">${v.meaning}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Wellness Vocabulary</h2>
  <p class="section-sub">Study the words below, then match each word to its meaning.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Key Vocabulary</h3>
    <div class="phrase-list">${vocabRows}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Activity: Match the Word with Its Meaning</h3>
    <p class="match-hint">Click a word, then click its meaning to connect them. Click a connected item to undo it.</p>
    <div class="match-wrap">
      <svg class="match-svg"></svg>
      <div class="match-cols">
        <div><div class="match-col-title">Word</div>${words}</div>
        <div><div class="match-col-title">Meaning</div>${meanings}</div>
      </div>
    </div>
    <div class="feedback" id="s2matchfb"></div>
  </div>`;
}
function wireS2(){
  const matchWrap = document.querySelector('.match-wrap');
  const matchSvg = document.querySelector('.match-svg');
  const matchFb = document.getElementById('s2matchfb');
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
  function clearSelection(){
    document.querySelectorAll('#app [data-word]').forEach(x=>x.classList.remove('sel'));
    selectedWord = null;
  }
  function unmatch(id){
    connections.delete(id);
    document.querySelector(`[data-word="${id}"]`).classList.remove('matched');
    document.querySelector(`[data-pic="${id}"]`).classList.remove('matched');
    drawConnections();
  }
  document.querySelectorAll('#app [data-word]').forEach(w=>{
    w.addEventListener('click', ()=>{
      if(w.classList.contains('matched')){ unmatch(w.dataset.word); return; }
      clearSelection();
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
        wordEl.classList.add('matched'); wordEl.classList.remove('sel');
        p.classList.add('matched');
        connections.set(selectedWord, {wordEl, picEl:p});
        matchFb.className='feedback show good'; matchFb.textContent='Great match!';
        selectedWord = null;
        drawConnections();
        if(connections.size >= MATCH_PAIRS.length) markActivityComplete('s2');
      } else {
        matchFb.className='feedback show meh'; matchFb.textContent="That's not a match. Try again.";
        drawConnections({wordEl, picEl:p});
        setTimeout(()=>drawConnections(), 700);
        clearSelection();
      }
    });
  });
}

/* ---- Section 3: Vocabulary In Context (typed fill-in-the-blank) ---- */
function renderS3(){
  const blanks = FILL_BLANK.map((f,i)=>`
    <div class="fillblank-card">
      <p class="fillblank-q">${i+1}. ${f.q.replace('__________', '<span class="fillblank-gap">______</span>')}</p>
      <div class="fillblank-row">
        <input type="text" class="fillblank-input" id="fbInput${i}" placeholder="Type your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
        <button class="tb-btn" id="fbCheck${i}" style="background:var(--teal);border-color:var(--teal);">Check</button>
      </div>
      <div class="feedback" data-bfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Vocabulary In Context</h2>
  <p class="section-sub">Type the correct word for each sentence, then press Check. You can try again if you get it wrong.</p>
  <div class="panel">${blanks}</div>`;
}
function wireS3(){
  const answered = new Set();
  FILL_BLANK.forEach((f,i)=>{
    const input = document.getElementById(`fbInput${i}`);
    const fb = document.querySelector(`[data-bfb="${i}"]`);
    function check(){
      const val = input.value.trim().toLowerCase();
      if(!val) return;
      input.classList.remove('correct','wrong');
      if(val === f.a.toLowerCase()){
        input.classList.add('correct');
        fb.className='feedback show good'; fb.textContent='Correct!';
      } else {
        input.classList.add('wrong');
        fb.className='feedback show meh'; fb.textContent='Not quite. Try again.';
      }
      answered.add(i);
      if(answered.size >= FILL_BLANK.length) markActivityComplete('s3');
    }
    document.getElementById(`fbCheck${i}`).addEventListener('click', check);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); check(); } });
    input.addEventListener('input', ()=> input.classList.remove('correct','wrong'));
  });
}

/* ---- Section 4: Reading — Baan Sabai brochure ---- */
function renderS4(){
  const paras = READING.paragraphs.map(p=>`<p style="margin-top:12px;line-height:1.7;">${p}</p>`).join('');
  const qCards = READING_QUESTIONS.map((q,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${q.q}</p>
      <button class="reveal-btn" data-reveal="rq${i}">Show model answer</button>
      <div class="model-answer" id="rq${i}">${q.model}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Reading: Baan Sabai Wellness Resort</h2>
  <p class="section-sub">Read the brochure below, then answer the comprehension questions.</p>
  <div class="panel">
    <h3 style="font-family:'Oswald';color:var(--orange-deep);font-size:17px;">${READING.title}</h3>
    ${paras}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Comprehension Questions</h3>
    ${qCards}
  </div>`;
}
function wireS4(){
  const revealed = new Set();
  document.querySelectorAll('#app [data-reveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.reveal).classList.toggle('show');
      revealed.add(btn.dataset.reveal);
      if(revealed.size >= READING_QUESTIONS.length) markActivityComplete('s4');
    });
  });
}

/* ---- Section 5: Listen — The Guided Tour ---- */
function renderS5(){
  const orderWords = TOUR_ORDER.map(t=>`<div class="match-item" data-word="${t.id}">${t.stop}</div>`).join('');
  const orderMeanings = shuffle(TOUR_ORDER).map(t=>`<div class="match-item" data-pic="${t.id}">${t.area}</div>`).join('');
  const qCards = LISTEN_QUESTIONS.map((q,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${q.q}</p>
      <button class="reveal-btn" data-lreveal="lq${i}">Show model answer</button>
      <div class="model-answer" id="lq${i}">${q.model}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Listen: The Guided Tour</h2>
  <p class="section-sub">${LISTEN.intro}</p>
  <div class="panel">
    <div class="playbar">
      <button class="play-btn" id="s5play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY THE TOUR</div>
        <div class="play-sub" id="s5status">A wellness guide describes 7 areas of Baan Sabai Wellness Resort.</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="tb-btn" id="s5pause"><span class="icon-inline">${icon('pause',{size:14})}</span> <span class="lbl">Pause</span></button>
        <button class="tb-btn" id="s5resume"><span class="icon-inline">${icon('play',{size:14})}</span> <span class="lbl">Resume</span></button>
        <button class="tb-btn" id="s5replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
        <button class="tb-btn" id="s5slower"><span class="lbl">Slower</span></button>
      </div>
    </div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Put the Tour in Order</h3>
    <p class="match-hint">Listen to the tour, then match each stop number to the area the guide describes.</p>
    <div class="match-wrap">
      <svg class="match-svg"></svg>
      <div class="match-cols">
        <div><div class="match-col-title">Order Heard</div>${orderWords}</div>
        <div><div class="match-col-title">Area</div>${orderMeanings}</div>
      </div>
    </div>
    <div class="feedback" id="s5matchfb"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">After Listening</h3>
    ${qCards}
  </div>`;
}
function wireS5(){
  const statusEl = document.getElementById('s5status');
  VoiceEngine.onChange(()=>{
    if(statusEl){
      statusEl.textContent = VoiceEngine.isPlaying()
        ? (VoiceEngine.isPaused() ? 'Paused' : 'Playing: the guide describes the resort…')
        : 'A wellness guide describes 7 areas of Baan Sabai Wellness Resort.';
    }
  });
  document.getElementById('s5play').addEventListener('click', ()=> VoiceEngine.speakConversation(LISTEN.lines));
  document.getElementById('s5replay').addEventListener('click', ()=> VoiceEngine.speakConversation(LISTEN.lines));
  document.getElementById('s5pause').addEventListener('click', ()=> VoiceEngine.pause());
  document.getElementById('s5resume').addEventListener('click', ()=> VoiceEngine.resume());
  const slowerBtn = document.getElementById('s5slower');
  slowerBtn.addEventListener('click', ()=>{
    VoiceEngine.setSlower(!VoiceEngine.isSlower());
    slowerBtn.classList.toggle('primary', VoiceEngine.isSlower());
    slowerBtn.innerHTML = VoiceEngine.isSlower() ? '<span class="lbl">Slower: On</span>' : '<span class="lbl">Slower</span>';
  });

  let s5MatchDone = false, s5QDone = false;
  function checkS5Done(){ if(s5MatchDone && s5QDone) markActivityComplete('s5'); }

  const matchWrap = document.querySelectorAll('.match-wrap')[0];
  const matchSvg = matchWrap.querySelector('.match-svg');
  const matchFb = document.getElementById('s5matchfb');
  const connections = new Map();
  let selectedWord = null;
  function sizeSvg(){ const r = matchWrap.getBoundingClientRect(); matchSvg.setAttribute('width', r.width); matchSvg.setAttribute('height', r.height); }
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
  function clearSelection(){ matchWrap.querySelectorAll('[data-word]').forEach(x=>x.classList.remove('sel')); selectedWord = null; }
  function unmatch(id){
    connections.delete(id);
    matchWrap.querySelector(`[data-word="${id}"]`).classList.remove('matched');
    matchWrap.querySelector(`[data-pic="${id}"]`).classList.remove('matched');
    drawConnections();
  }
  matchWrap.querySelectorAll('[data-word]').forEach(w=>{
    w.addEventListener('click', ()=>{
      if(w.classList.contains('matched')){ unmatch(w.dataset.word); return; }
      clearSelection(); w.classList.add('sel'); selectedWord = w.dataset.word;
    });
  });
  matchWrap.querySelectorAll('[data-pic]').forEach(p=>{
    p.addEventListener('click', ()=>{
      if(p.classList.contains('matched')){ unmatch(p.dataset.pic); return; }
      if(!selectedWord) return;
      const wordEl = matchWrap.querySelector(`[data-word="${selectedWord}"]`);
      if(p.dataset.pic === selectedWord){
        wordEl.classList.add('matched'); wordEl.classList.remove('sel');
        p.classList.add('matched');
        connections.set(selectedWord, {wordEl, picEl:p});
        matchFb.className='feedback show good'; matchFb.textContent='Correct order!';
        selectedWord = null;
        drawConnections();
        if(connections.size >= TOUR_ORDER.length){ s5MatchDone = true; checkS5Done(); }
      } else {
        matchFb.className='feedback show meh'; matchFb.textContent="That's not the right order. Try again.";
        drawConnections({wordEl, picEl:p});
        setTimeout(()=>drawConnections(), 700);
        clearSelection();
      }
    });
  });

  const revealed = new Set();
  document.querySelectorAll('#app [data-lreveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.lreveal).classList.toggle('show');
      revealed.add(btn.dataset.lreveal);
      if(revealed.size >= LISTEN_QUESTIONS.length){ s5QDone = true; checkS5Done(); }
    });
  });
}

/* ---- Section 6: Describe It (speaking) ---- */
let s6current = null;
function renderS6(){
  const starters = DESCRIBE_STARTERS.map(s=>`<div class="phrase-card"><span class="txt">${s}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Describe It</h2>
  <p class="section-sub">Choose a facility and describe it to a partner. Use the sentence starters below. Do not read a full script.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Sentence Starters</h3>
    <div class="phrase-list">${starters}</div>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--orange-deep);" id="s6facility">Click "New Facility" to begin.</p>
    <button class="tb-btn primary" id="s6new" style="background:var(--teal);border-color:var(--teal);">New Facility</button>
    <button class="reveal-btn" id="s6showexample">Show one example</button>
    <div class="model-answer" id="s6example"></div>
  </div>`;
}
function wireS6(){
  const facilityEl = document.getElementById('s6facility');
  const exampleEl = document.getElementById('s6example');
  const seen = new Set();
  function newFacility(){
    const f = FACILITIES[Math.floor(Math.random()*FACILITIES.length)];
    s6current = f;
    facilityEl.textContent = `Describe: ${f.nm}`;
    exampleEl.textContent = f.phrase;
    exampleEl.classList.remove('show');
    seen.add(f.id);
    if(seen.size >= 3) markActivityComplete('s6');
  }
  document.getElementById('s6new').addEventListener('click', newFacility);
  document.getElementById('s6showexample').addEventListener('click', ()=> exampleEl.classList.toggle('show'));
  newFacility();
}

/* ---- Section 7: Guess The Wellness Place (pair activity) ---- */
let s7target = null;
function renderS7(){
  const buttons = FACILITIES.map(f=>`<button class="choice-btn" data-id="${f.id}"><span class="letter">${f.ic}</span> ${f.nm}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Guess The Wellness Place</h2>
  <p class="section-sub">Pair activity. Student A clicks "Peek" and describes the facility without saying its name. Student B listens and guesses by clicking a card below.</p>
  <div class="panel">
    <button class="reveal-btn" id="s7peek">Peek (Describer only)</button>
    <p class="model-answer" id="s7peektext"></p>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Student B: Guess the Place</h3>
    <div class="choices" id="s7choices">${buttons}</div>
    <div class="feedback" id="s7feedback"></div>
  </div>`;
}
function wireS7(){
  const peekBtn = document.getElementById('s7peek');
  const peekText = document.getElementById('s7peektext');
  const box = document.getElementById('s7choices');
  const fb = document.getElementById('s7feedback');
  let correctCount = 0;
  function newRound(){
    const f = FACILITIES[Math.floor(Math.random()*FACILITIES.length)];
    s7target = f.id;
    peekText.textContent = '';
    peekText.classList.remove('show');
    peekText.dataset.answer = `The place is: ${f.nm}`;
    fb.className='feedback';
    [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
  }
  peekBtn.addEventListener('click', ()=>{
    peekText.textContent = peekText.dataset.answer || '';
    peekText.classList.toggle('show');
  });
  box.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
    if(btn.dataset.id === s7target){
      btn.classList.add('correct');
      fb.className='feedback show good'; fb.textContent='Correct guess!';
      correctCount++;
      if(correctCount >= 3) markActivityComplete('s7', {score:`${correctCount} rounds`});
      setTimeout(newRound, 1000);
    } else {
      btn.classList.add('wrong');
      fb.className='feedback show meh'; fb.textContent='Not this one. Listen again and guess once more.';
    }
  });
  newRound();
}

/* ---- Section 8: My Wellness Tour (final task) ---- */
function renderS8(){
  const phraseList = TOUR_GUIDING_PHRASES.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 8</div>
  <h2 class="section-title">My Wellness Tour</h2>
  <p class="section-sub">Plan a short tour of your own wellness destination. Choose two areas, write short notes, then speak your tour to a partner.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Guiding Phrases</h3>
    <div class="phrase-list">${phraseList}</div>
  </div>
  <div class="panel">
    <label class="notes-label" for="s8n1">Stop 1: area name &amp; one detail</label>
    <textarea class="notes-field" id="s8n1" placeholder="e.g. The herbal garden: guests can learn about Thai herbs here."></textarea>
    <label class="notes-label" for="s8n2">Stop 2: area name &amp; one detail</label>
    <textarea class="notes-field" id="s8n2" placeholder="e.g. The yoga pavilion: guests can join a morning session."></textarea>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--orange-deep);">Now speak your tour to a partner. Welcome them, guide them to Stop 1, describe it, move to Stop 2, then close politely.</p>
    <button class="tb-btn primary" id="s8done" style="background:var(--teal);border-color:var(--teal);">I practiced my tour with a partner</button>
  </div>`;
}
function wireS8(){
  document.getElementById('s8done').addEventListener('click', (e)=>{
    const n1 = document.getElementById('s8n1').value.trim();
    const n2 = document.getElementById('s8n2').value.trim();
    e.target.disabled = true;
    e.target.textContent = 'Practiced!';
    markActivityComplete('s8', {completionStatus:'reached', score: (n1 && n2) ? 'notes written' : 'no notes'});
  });
}

/* ---- Section 9: Self-Check ---- */
function renderS9(){
  const rows = REFLECTION.map((r,i)=>`
    <div class="rubric-row">
      <div><div class="lbl">${r}</div></div>
      <div class="rate" data-k="r${i}">
        ${[1,2,3].map(n=>`<button data-n="${n}">${n}</button>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">Self-Check</h2>
  <p class="section-sub">Rate yourself honestly: 1 = I need more practice, 2 = I'm getting there, 3 = I feel confident.</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this unit, you can describe a wellness place, facility, or activity in English.</p>
  </div>

  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">Wellness Services &amp; Treatments: Study Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review key wellness vocabulary, useful expressions, and communication tips.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="Wellness Services and Treatments Study Guide preview" class="guide-thumb" loading="lazy">
    <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="downloadGuideBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
  </div>`;
}
function wireS9(){
  const rateGroups = document.querySelectorAll('#app .rate');
  rateGroups.forEach(rate=>{
    rate.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...rate.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      const ratedCount = [...rateGroups].filter(r => r.querySelector('.sel')).length;
      if(ratedCount >= rateGroups.length){
        markActivityComplete('s9', {score: `self-rated ${ratedCount}/${rateGroups.length}`});
      }
    });
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 3 COMPLETE</div>
    <h1>You can <span>describe a wellness place.</span></h1>
    <p>Keep practicing these words and phrases. You'll use them again as a real wellness tourism professional.</p>
    <div class="complete-actions">
      <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="completeDownloadBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
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
