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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s9','s8'];

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
const CHECKIN_STORAGE_KEY = 'wellness_u4_checkin';
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

/* ===================== VOICE ENGINE =====================
   Default voice is British English female (staffVoice, used for Prae and
   any single-line "Listen" audio elsewhere in the unit). The Section 5
   listening has two characters, so Mr. Chen (kind:'delegate') gets a
   genuinely different American English male voice, so students can tell
   the two speakers apart by ear. Every search has a graceful fallback to
   the default British female voice if a specific voice isn't available
   on the device, so the unit's default is never at risk of breaking. */
const VoiceEngine = (function(){
  let allVoices = [];
  let staffVoice = null, delegateVoice = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const FEMALE_NAME_HINTS = /(kate|serena|stephanie|fiona|hazel|libby|sonia|olivia|amy|emma|joanna|shelley|grandma|moira|tessa|karen|susan|zira|samantha|victoria|ava|allison|zoe|nicky|jenny|aria|michelle)/i;
  const MALE_NAME_HINTS = /(daniel|arthur|george|oliver|ryan|brian|matthew|guy|eddy|rocko|reed|grandpa|alex|fred|tom|aaron|gordon|justin|bruce)/i;

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    const ukFemaleVoice = allVoices.find(v => /google uk english female/i.test(v.name))
                        || allVoices.find(v => /^en-gb$/i.test(v.lang) && /female/i.test(v.name))
                        || allVoices.find(v => /^en-gb$/i.test(v.lang) && FEMALE_NAME_HINTS.test(v.name))
                        || allVoices.find(v => /^en-gb$/i.test(v.lang) && !MALE_NAME_HINTS.test(v.name))
                        || allVoices.find(v => /^en-gb$/i.test(v.lang))
                        || allVoices.find(v => /female/i.test(v.name) && /^en/i.test(v.lang))
                        || allVoices[0] || null;
    const usMaleVoice = allVoices.find(v => /google us english male/i.test(v.name))
                      || allVoices.find(v => /^en-us$/i.test(v.lang) && /male/i.test(v.name) && !/female/i.test(v.name))
                      || allVoices.find(v => /^en-us$/i.test(v.lang) && MALE_NAME_HINTS.test(v.name))
                      || allVoices.find(v => /^en-us$/i.test(v.lang) && !FEMALE_NAME_HINTS.test(v.name))
                      || allVoices.find(v => /^en-us$/i.test(v.lang))
                      || ukFemaleVoice;
    staffVoice = ukFemaleVoice;
    delegateVoice = usMaleVoice;
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
    u.lang = (voice && voice.lang) ? voice.lang : 'en-GB';
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
window.addEventListener('pagehide', ()=> VoiceEngine.stop());
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">WELLNESS TOURISM MANAGEMENT PROGRAM</div>
    <h1>Can you <span>handle this guest?</span></h1>
    <p>Unit 4: Customer Service. Welcome a tired or unhappy guest, listen for what they need, and respond with real empathy, like a real wellness resort professional.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <button class="startbtn" onclick="goNext()">Begin the shift →</button>
  </div>`;
}

/* ---- Section 1: Hospitality Vocabulary ---- */
function renderS1(){
  const coreVocab = VOCAB.filter(v=>CORE_VOCAB_IDS.includes(v.w));
  const usefulVocab = VOCAB.filter(v=>!CORE_VOCAB_IDS.includes(v.w));
  const vocabRows = coreVocab.map(v=>`
    <div class="phrase-card"><span class="txt"><b>${v.w}</b> <i style="color:var(--muted);font-weight:400;">(${v.t})</i>: ${v.d}</span></div>`).join('');
  const usefulRows = usefulVocab.map(v=>`
    <div class="secondary-word"><b>${v.w}:</b> ${v.d}</div>`).join('');
  const words = MATCH_PAIRS.map(v=>`<div class="match-item" data-word="${v.id}">${v.word}</div>`).join('');
  const meanings = shuffle(MATCH_PAIRS).map(v=>`<div class="match-item" data-pic="${v.id}">${v.meaning}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Hospitality Vocabulary</h2>
  <p class="section-sub">These 8 core words come up again and again in this unit. Study them, then match each word to its meaning.</p>
  <div class="panel">
    <img class="venue-photo" src="${SECTION_PHOTOS.concierge.src}" alt="${SECTION_PHOTOS.concierge.alt}" loading="lazy" style="margin-bottom:20px;">
    <h3 style="font-size:15px;color:var(--navy);">Core Vocabulary</h3>
    <div class="phrase-list">${vocabRows}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Useful Words</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">A few more words you'll see in this unit. You don't need to memorize these, just recognize them.</p>
    <div class="secondary-word-list">${usefulRows}</div>
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
    <div class="feedback" id="s1matchfb"></div>
  </div>`;
}
function wireS1(){
  const matchWrap = document.querySelector('.match-wrap');
  const matchSvg = document.querySelector('.match-svg');
  const matchFb = document.getElementById('s1matchfb');
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
  function clearSelection(){ document.querySelectorAll('#app [data-word]').forEach(x=>x.classList.remove('sel')); selectedWord = null; }
  function unmatch(id){
    connections.delete(id);
    document.querySelector(`[data-word="${id}"]`).classList.remove('matched');
    document.querySelector(`[data-pic="${id}"]`).classList.remove('matched');
    drawConnections();
  }
  document.querySelectorAll('#app [data-word]').forEach(w=>{
    w.addEventListener('click', ()=>{
      if(w.classList.contains('matched')){ unmatch(w.dataset.word); return; }
      clearSelection(); w.classList.add('sel'); selectedWord = w.dataset.word;
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
        if(connections.size >= MATCH_PAIRS.length) markActivityComplete('s1');
      } else {
        matchFb.className='feedback show meh'; matchFb.textContent="That's not a match. Try again.";
        drawConnections({wordEl, picEl:p});
        setTimeout(()=>drawConnections(), 700);
        clearSelection();
      }
    });
  });
}

/* ---- Section 2: Vocabulary In Context ---- */
function renderS2(){
  const blanks = FILL_BLANK.map((f,i)=>`
    <div class="fillblank-card">
      <p class="fillblank-q">${i+1}. ${f.q}</p>
      <div class="fillblank-row">
        <input type="text" class="fillblank-input" id="fbInput${i}" placeholder="Type your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
        <button class="tb-btn" id="fbCheck${i}" style="background:var(--teal);border-color:var(--teal);">Check</button>
      </div>
      <div class="feedback" data-bfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Vocabulary In Context</h2>
  <p class="section-sub">Type the correct word or phrase for each sentence, then press Check. You can try again if you get it wrong.</p>
  <div class="panel">${blanks}</div>`;
}
function wireS2(){
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
      if(answered.size >= FILL_BLANK.length) markActivityComplete('s2');
    }
    document.getElementById(`fbCheck${i}`).addEventListener('click', check);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); check(); } });
    input.addEventListener('input', ()=> input.classList.remove('correct','wrong'));
  });
}

/* ---- Section 3: Reading — Five Principles ---- */
function renderS3(){
  const paras = READING.paragraphs.map(p=>`<p style="margin-top:12px;line-height:1.7;">${p}</p>`).join('');
  const qCards = READING_QUESTIONS.map((q,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${q.q}</p>
      <button class="reveal-btn" data-reveal="rq${i}">Show model answer</button>
      <div class="model-answer" id="rq${i}">${q.model}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Reading: Five Principles of Excellent Service</h2>
  <p class="section-sub">Read the article below, then answer the comprehension questions.</p>
  <div class="panel">${paras}</div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Comprehension Questions</h3>
    ${qCards}
  </div>`;
}
function wireS3(){
  const revealed = new Set();
  document.querySelectorAll('#app [data-reveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.reveal).classList.toggle('show');
      revealed.add(btn.dataset.reveal);
      if(revealed.size >= READING_QUESTIONS.length) markActivityComplete('s3');
    });
  });
}

/* ---- Section 4: What Would You Say? ---- */
function renderS4(){
  const cards = SCENARIO_CHOICES.map((s,i)=>`
    <div class="sit-card" data-scenario="${i}">
      <div style="font-family:'Oswald';font-size:12px;letter-spacing:.08em;color:var(--orange-deep);">${s.tag}</div>
      <p class="visitor">${s.guest}</p>
      <p style="font-weight:700;color:var(--navy);margin-top:10px;font-size:13.5px;">What should you say?</p>
      <div class="choices" data-choices="${i}">
        ${s.options.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-fb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">What Would You Say?</h2>
  <p class="section-sub">Real guest situations from the Five Principles you just read. Choose the most professional response for each.</p>
  <div class="panel">${cards}</div>`;
}
function wireS4(){
  const answered = new Set();
  SCENARIO_CHOICES.forEach((s,i)=>{
    const box = document.querySelector(`[data-choices="${i}"]`);
    const fb = document.querySelector(`[data-fb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      const j = +btn.dataset.i;
      if(j === s.correct){
        btn.classList.add('correct');
        fb.className = 'feedback show good';
        fb.textContent = s.why;
      } else {
        btn.classList.add('wrong');
        fb.className = 'feedback show meh';
        fb.textContent = 'Not the strongest choice here. Think about what the guest actually needs, then try again.';
      }
      answered.add(i);
      if(answered.size >= SCENARIO_CHOICES.length) markActivityComplete('s4');
    });
  });
}

/* ---- Section 5: Listen — Check-In ---- */
function renderS5(){
  const tfCards = LISTEN_TF.map((t,i)=>`
    <div class="sit-card" data-tfcard="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${t.s}</p>
      <div class="choices" id="tfChoices${i}">
        <button class="choice-btn" data-v="true">True</button>
        <button class="choice-btn" data-v="false">False</button>
      </div>
    </div>`).join('');
  const selectChips = LISTEN_SELECT.opts.map((o,i)=>`<button class="phrase-chip" data-i="${i}">${o.t}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Listen: Check-In</h2>
  <p class="section-sub">${LISTEN.intro}</p>
  <div class="panel">
    <img class="venue-photo" src="${SECTION_PHOTOS.checkin.src}" alt="${SECTION_PHOTOS.checkin.alt}" loading="lazy" style="margin-bottom:20px;">
    <div class="playbar">
      <button class="play-btn" id="s5play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY THE CONVERSATION</div>
        <div class="play-sub" id="s5status">Prae (staff) welcomes Mr. Chen (guest) at check-in.</div>
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
    <h3 style="font-size:15px;color:var(--navy);">Listen For...</h3>
    <p style="color:var(--muted);font-size:13.5px;">What does the guest need? What does the staff member do well?</p>
    <h4 style="font-size:13px;color:var(--navy);margin-top:18px;letter-spacing:.04em;">TRUE OR FALSE</h4>
    ${tfCards}
    <hr class="hairline">
    <h4 style="font-size:13px;color:var(--navy);letter-spacing:.04em;">${LISTEN_SELECT.q}</h4>
    <div class="phrase-chip-row" id="selectChips">${selectChips}</div>
    <button class="reveal-btn" id="selectCheck" style="margin-top:14px;">Check my answers</button>
    <div class="feedback" id="selectNudge"></div>
    <div class="feedback" id="selectFb"></div>
    <hr class="hairline">
    <h4 style="font-size:13px;color:var(--navy);letter-spacing:.04em;">${LISTEN_SHORT.q}</h4>
    <p style="color:var(--muted);font-size:12.5px;margin-top:4px;">${LISTEN_SHORT.hint}</p>
    <div class="fillblank-row">
      <input type="text" class="fillblank-input" id="shortInput" placeholder="Type the sentence" autocomplete="off" spellcheck="false">
      <button class="tb-btn" id="shortCheck" style="background:var(--teal);border-color:var(--teal);">Check</button>
    </div>
    <div class="feedback" id="shortFb"></div>
  </div>`;
}
function wireS5(){
  const statusEl = document.getElementById('s5status');
  const playBtn = document.getElementById('s5play');
  VoiceEngine.onChange(()=>{
    const isPlaying = VoiceEngine.isPlaying();
    if(statusEl){
      statusEl.textContent = isPlaying
        ? (VoiceEngine.isPaused() ? 'Paused' : 'Playing: Prae welcomes Mr. Chen…')
        : 'Prae (staff) welcomes Mr. Chen (guest) at check-in.';
    }
    if(playBtn){
      playBtn.innerHTML = isPlaying ? icon('stop',{size:20}) : icon('play',{size:20});
      playBtn.title = isPlaying ? 'Stop' : 'Play';
    }
  });
  playBtn.addEventListener('click', ()=>{
    if(VoiceEngine.isPlaying()) VoiceEngine.stop(); else VoiceEngine.speakConversation(LISTEN.lines);
  });
  document.getElementById('s5replay').addEventListener('click', ()=> VoiceEngine.speakConversation(LISTEN.lines));
  document.getElementById('s5pause').addEventListener('click', ()=> VoiceEngine.pause());
  document.getElementById('s5resume').addEventListener('click', ()=> VoiceEngine.resume());
  const slowerBtn = document.getElementById('s5slower');
  slowerBtn.addEventListener('click', ()=>{
    VoiceEngine.setSlower(!VoiceEngine.isSlower());
    slowerBtn.classList.toggle('primary', VoiceEngine.isSlower());
    slowerBtn.innerHTML = VoiceEngine.isSlower() ? '<span class="lbl">Slower: On</span>' : '<span class="lbl">Slower</span>';
  });
  /* True/False, information-selection, and short-answer, so comprehension
     isn't all reveal-the-answer or all multiple choice. */
  const tfDone = new Set(), tfChoices = {}, selectDone = {v:false}, shortDone = {v:false};
  let selectAnswerText = '', shortAnswerText = '';
  function checkListenComplete(){
    if(tfDone.size >= LISTEN_TF.length && selectDone.v && shortDone.v){
      const tfAnswers = LISTEN_TF.map((t,i)=>`TF${i+1}: ${tfChoices[i]}${tfChoices[i]===t.correct?' [correct]':' [wrong]'}`).join(' | ');
      markActivityComplete('s5', {answers: `${tfAnswers} | Selected: ${selectAnswerText} | Empathy sentence: ${shortAnswerText}`});
    }
  }
  LISTEN_TF.forEach((t,i)=>{
    const box = document.getElementById(`tfChoices${i}`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      const chose = btn.dataset.v === 'true';
      btn.classList.add(chose === t.correct ? 'correct' : 'wrong');
      tfDone.add(i);
      tfChoices[i] = chose;
      checkListenComplete();
    });
  });
  const selectChips = document.getElementById('selectChips');
  const chosenSelect = new Set();
  selectChips.addEventListener('click', e=>{
    const chip = e.target.closest('.phrase-chip'); if(!chip) return;
    chip.classList.toggle('sel');
    const i = +chip.dataset.i;
    if(chosenSelect.has(i)) chosenSelect.delete(i); else chosenSelect.add(i);
  });
  document.getElementById('selectCheck').addEventListener('click', ()=>{
    const nudge = document.getElementById('selectNudge');
    if(!chosenSelect.size){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please select at least one option before checking.';
      return;
    }
    nudge.className = 'feedback';
    [...selectChips.children].forEach((chip,i)=>{
      chip.classList.remove('sel');
      chip.style.borderColor = LISTEN_SELECT.opts[i].good ? 'var(--green-safe)' : 'var(--danger)';
      chip.style.color = LISTEN_SELECT.opts[i].good ? 'var(--green-safe)' : 'var(--danger)';
    });
    const fb = document.getElementById('selectFb');
    const correctCount = [...chosenSelect].filter(i=>LISTEN_SELECT.opts[i].good).length;
    const totalGood = LISTEN_SELECT.opts.filter(o=>o.good).length;
    fb.className = 'feedback show ' + (correctCount===totalGood && chosenSelect.size===totalGood ? 'good' : 'meh');
    fb.textContent = correctCount===totalGood && chosenSelect.size===totalGood
      ? 'Correct! Those are the three things Prae does well.'
      : `Green = things Prae does well (${totalGood} of them). Have another look at the ones marked in red.`;
    selectAnswerText = [...chosenSelect].map(i=>`${LISTEN_SELECT.opts[i].t}${LISTEN_SELECT.opts[i].good?' [correct]':' [wrong]'}`).join('; ');
    selectDone.v = true;
    checkListenComplete();
  });
  document.getElementById('shortCheck').addEventListener('click', ()=>{
    const input = document.getElementById('shortInput');
    const val = input.value.trim().toLowerCase().replace(/[."']/g,'');
    const fb = document.getElementById('shortFb');
    const ok = LISTEN_SHORT.accept.some(a => val.includes(a.replace(/[."']/g,'')) || a.replace(/[."']/g,'').includes(val));
    input.classList.toggle('correct', ok);
    input.classList.toggle('wrong', !ok && val.length>0);
    fb.className = 'feedback show ' + (ok ? 'good' : 'meh');
    fb.textContent = ok ? 'Yes, that\'s an empathy phrase from the conversation!' : 'Not quite that phrase. Try replaying the audio and listening for how Prae responds to how Mr. Chen feels.';
    shortAnswerText = `${input.value.trim()}${ok?' [correct]':' [wrong]'}`;
    shortDone.v = true;
    checkListenComplete();
  });
}

/* ---- Section 6: The Guest Service Challenge (signature interactive) =====
   A five-round workplace decision game, not a quiz. For each guest, the
   student picks the most professional response, sees immediately why it
   works (or doesn't), and builds a running score. A sixth, ungraded bonus
   situation closes it with a typed response. Ends on a Guest Service
   Score screen with a retry option. ===== */
let s6state = { phase:'round', index:0, correct:0, skills:[] };
function renderS6(){
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">The Guest Service Challenge</h2>
  <p class="section-sub">You are the wellness resort staff. Five guests, one at a time. Read what they say, choose the most professional response, and see how you did.</p>
  <div class="panel" id="s6body"></div>`;
}
function s6Reset(){ s6state = { phase:'round', index:0, correct:0, skills:[] }; }
function wireS6(){
  const body = document.getElementById('s6body');

  function showRound(i){
    const r = GUEST_ROUNDS[i];
    body.innerHTML = `
      <div class="section-eyebrow">Guest ${i+1} of ${GUEST_ROUNDS.length}</div>
      <div class="guest-card">
        <div class="guest-bubble">"${r.guest}"</div>
        <p style="font-weight:700;color:var(--navy);margin-top:16px;">What should you say?</p>
        <div class="choices" id="s6choices">
          ${r.options.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
        </div>
        <div class="feedback" id="s6fb"></div>
        <div id="s6nextWrap" style="margin-top:16px;"></div>
      </div>
      <p class="guest-progress">Score so far: ${s6state.correct}/${i}</p>`;
    const choicesBox = document.getElementById('s6choices');
    const fb = document.getElementById('s6fb');
    choicesBox.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      if(choicesBox.classList.contains('answered')) return;
      choicesBox.classList.add('answered');
      const j = +btn.dataset.i;
      const isCorrect = j === r.correct;
      [...choicesBox.children].forEach((b,k)=>{
        if(k === r.correct) b.classList.add('correct');
        else if(k === j) b.classList.add('wrong');
      });
      fb.className = 'feedback show ' + (isCorrect ? 'good' : 'meh');
      fb.textContent = isCorrect ? `Correct. ${r.why}` : `Not quite. ${r.why}`;
      if(isCorrect){ s6state.correct++; s6state.skills.push(r.skill); }
      const nextWrap = document.getElementById('s6nextWrap');
      const isLast = i >= GUEST_ROUNDS.length - 1;
      nextWrap.innerHTML = `<button class="tb-btn primary" id="s6next" style="background:var(--teal);border-color:var(--teal);">${isLast ? 'Continue to the last guest →' : 'Next guest →'}</button>`;
      document.getElementById('s6next').addEventListener('click', ()=>{
        if(isLast){ s6state.phase='bonus'; showBonus(); }
        else { s6state.index = i+1; showRound(s6state.index); }
      });
    });
  }

  function showBonus(){
    body.innerHTML = `
      <div class="section-eyebrow">Bonus Guest (not scored)</div>
      <div class="guest-card">
        <div class="guest-bubble">"${BONUS_ROUND.guest}"</div>
        <p class="guest-need" style="margin-top:14px;">${BONUS_ROUND.prompt}</p>
        <textarea id="s6bonusInput" class="challenge-textarea" rows="3" placeholder="Type your response here…" style="margin-top:14px;"></textarea>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
          <button class="reveal-btn" id="s6bonusReveal">Show a model response</button>
          <button class="tb-btn primary" id="s6bonusDone" style="background:var(--orange);border-color:var(--orange-deep);">See my Guest Service Score →</button>
        </div>
        <div class="model-answer" id="s6bonusModel">${BONUS_ROUND.model}</div>
      </div>`;
    document.getElementById('s6bonusReveal').addEventListener('click', ()=>{
      document.getElementById('s6bonusModel').classList.add('show');
    });
    document.getElementById('s6bonusDone').addEventListener('click', ()=>{
      s6state.phase = 'score';
      showScore();
    });
  }

  function showScore(){
    const n = s6state.correct;
    const total = GUEST_ROUNDS.length;
    let tier;
    if(n===5) tier = 'Excellent Service';
    else if(n===4) tier = 'Very Good';
    else if(n===3) tier = 'Good. Keep Practicing.';
    else tier = "Let's Review the Key Phrases";
    const allSkills = ['Empathy','Apology','Offering Solutions','Exceeding Expectations','Checking Information'];
    const skillRows = allSkills.map(sk=>{
      const got = s6state.skills.includes(sk);
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
        <button class="tb-btn primary" id="s6retry" style="background:var(--teal);border-color:var(--teal);margin-top:20px;">Try the Challenge Again</button>
      </div>`;
    document.getElementById('s6retry').addEventListener('click', ()=>{
      s6Reset();
      showRound(0);
    });
    markActivityComplete('s6', {score:`${n}/${total} (${tier})`});
  }

  if(s6state.phase==='round') showRound(s6state.index);
  else if(s6state.phase==='bonus') showBonus();
  else showScore();
}

/* ---- Section 7: Final Role-Play ---- */
function renderS7(){
  const checklist = PEER_CHECKLIST.map(c=>`
    <div class="rubric-row"><div><div class="lbl">${c}</div></div>
    <div class="rate" data-k="${c}">${['Yes','Partly'].map(n=>`<button data-n="${n}" style="width:auto;border-radius:9px;padding:8px 14px;font-size:12px;">${n}</button>`).join('')}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Can I Handle This Guest?</h2>
  <p class="section-sub">Round 1: Student A = staff, Student B = guest. Round 2: switch roles and try one of the extra scenarios.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Round 1</h3>
    <div class="roleplay-cols">
      <div class="roleplay-col">
        <h4>${ROLEPLAY.round1.a.title}</h4>
        <p>${ROLEPLAY.round1.a.body}</p>
        <div class="phrase-list" style="margin-top:12px;">${ROLEPLAY.round1.a.phrases.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('')}</div>
      </div>
      <div class="roleplay-col">
        <h4>${ROLEPLAY.round1.b.title}</h4>
        <p>${ROLEPLAY.round1.b.body}</p>
        <div class="phrase-list" style="margin-top:12px;">${ROLEPLAY.round1.b.phrases.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('')}</div>
      </div>
    </div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Round 2: Switch Roles, Try an Extra Scenario</h3>
    ${ROLEPLAY.extra.map(s=>`<div class="sit-card"><div style="font-family:'Oswald';font-size:12px;letter-spacing:.08em;color:var(--orange-deep);">${s.tag}</div><p style="margin-top:6px;">${s.text}</p></div>`).join('')}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Peer Feedback Checklist</h3>
    <p style="color:var(--muted);font-size:13px;">While watching your partner's role-play, mark each item.</p>
    ${checklist}
    <button class="tb-btn primary" id="s7done" style="background:var(--teal);border-color:var(--teal);margin-top:16px;">We completed both rounds</button>
  </div>`;
}
function wireS7(){
  const rateGroups = document.querySelectorAll('#app .rate');
  rateGroups.forEach(rate=>{
    rate.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...rate.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
    });
  });
  document.getElementById('s7done').addEventListener('click', (e)=>{
    e.target.disabled = true;
    e.target.textContent = 'Completed!';
    // Live, teacher-observed speaking task — "reached", teacher remains the evaluator.
    markActivityComplete('s7', {completionStatus:'reached'});
  });
}

/* ---- Section 9: Writing — Follow-Up Message ---- */
function renderS9(){
  const situations = WRITING_TASK.situations.map((s,i)=>`
    <button class="choice-btn" data-sit="${i}" style="text-align:left;"><span class="letter">${String.fromCharCode(65+i)}</span> ${s.text}</button>`).join('');
  const phrases = WRITING_TASK.usefulPhrases.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">Writing: Follow-Up Message</h2>
  <p class="section-sub">${WRITING_TASK.prompt}</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Choose ONE Guest</h3>
    <div class="choices" id="s9situations">${situations}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Useful Phrases</h3>
    <div class="phrase-list" style="margin-top:10px;">${phrases}</div>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Your Message</h3>
    <textarea id="s9text" class="challenge-textarea" rows="5" placeholder="Dear [Guest name], I just wanted to follow up…" style="margin-top:12px;"></textarea>
    <button class="tb-btn primary" id="s9done" style="background:var(--teal);border-color:var(--teal);margin-top:14px;">I've written my follow-up message</button>
  </div>`;
}
function wireS9(){
  document.getElementById('s9situations').addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    [...document.getElementById('s9situations').children].forEach(b=>b.classList.remove('correct'));
    btn.classList.add('correct');
  });
  document.getElementById('s9done').addEventListener('click', (e)=>{
    if(document.getElementById('s9text').value.trim().length < 10) return;
    e.target.disabled = true;
    e.target.textContent = 'Message saved for review';
    markActivityComplete('s9', {completionStatus:'reached'});
  });
}

/* ---- Section 8: Self-Check ---- */
function renderS8(){
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
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this unit, you can welcome a guest, understand their needs, and respond professionally.</p>
  </div>

  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">Customer Service in Wellness Tourism: Study Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review key hospitality vocabulary, useful expressions, and service communication tips.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="Customer Service in Wellness Tourism Study Guide preview" class="guide-thumb" loading="lazy">
    <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="downloadGuideBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
  </div>`;
}
function wireS8(){
  const rateGroups = document.querySelectorAll('#app .rate');
  rateGroups.forEach(rate=>{
    rate.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...rate.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      const ratedCount = [...rateGroups].filter(r => r.querySelector('.sel')).length;
      if(ratedCount >= rateGroups.length){
        markActivityComplete('s8', {score: `self-rated ${ratedCount}/${rateGroups.length}`});
      }
    });
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 4 COMPLETE</div>
    <h1>You can <span>help a guest professionally.</span></h1>
    <p>Keep practicing these phrases. Empathy and attentiveness are what guests remember most.</p>
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
  {r:renderS9, w:wireS9},
  {r:renderS8, w:wireS8},
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
  /* Cancel any speech still playing before tearing down the old section,
     so navigating away never leaves audio running in the background. */
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
document.getElementById('btnReset').addEventListener('click', renderAll);

wireCheckin();
if(restoreCheckinState()){
  document.getElementById('checkinGate').style.display='none';
}
renderAll();
