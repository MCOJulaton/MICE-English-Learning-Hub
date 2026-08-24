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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s6b','s7','s8'];

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
}
function completedCount(){ return TRACKED_ACTIVITIES.filter(k => Progress.activities[k]).length; }
function updateTopbarBadge(){
  const el = document.getElementById('studentBadge');
  if(!el) return;
  if(!Progress.studentName){ el.style.display='none'; return; }
  el.style.display='';
  el.innerHTML = `<b>${Progress.studentName}</b> · ${completedCount()}/${TRACKED_ACTIVITIES.length} done`;
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
    applyDeepLinkAfterCheckin();
    setTimeout(()=>{ gate.style.display='none'; }, 900);
  });
}

/* ===================== VOICE ENGINE =====================
   Default voice is British English female (staffVoice, used for Nook and
   any single-line "Listen" audio elsewhere in the unit). The Section 5
   listening also has several tourist lines (kind:'delegate'), so they get
   a genuinely different American English voice, distinguishing "the
   guide" from "the guests" by ear. Every search falls back to the default
   British female voice if a specific voice isn't available on the device. */
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
    const usVoice = allVoices.find(v => /^en-us$/i.test(v.lang) && MALE_NAME_HINTS.test(v.name))
                  || allVoices.find(v => /^en-us$/i.test(v.lang) && !FEMALE_NAME_HINTS.test(v.name))
                  || allVoices.find(v => /^en-us$/i.test(v.lang))
                  || ukFemaleVoice;
    staffVoice = ukFemaleVoice;
    delegateVoice = usVoice;
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
    <h1>Can you <span>guide these guests?</span></h1>
    <p>Unit 5: Wellness Tourism Guiding. Be the tour guide through a wellness destination, use real guiding phrases, and answer a guest's question at every stop.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <button class="startbtn" onclick="goNext()">Begin the tour →</button>
  </div>`;
}

/* ---- Section 1: Guiding Vocabulary ---- */
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
  <h2 class="section-title">Guiding Vocabulary</h2>
  <p class="section-sub">These 8 core words come up again and again in this unit. Study them, then match each word to its meaning.</p>
  <div class="panel">
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
      <p class="fillblank-q">${i+1}. ${f.q.replace('__________', '<span class="fillblank-gap">______</span>')}</p>
      <div class="fillblank-row">
        <input type="text" class="fillblank-input" id="fbInput${i}" placeholder="Type your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
        <button class="tb-btn" id="fbCheck${i}" style="background:var(--teal);border-color:var(--teal);">Check</button>
      </div>
      <div class="feedback" data-bfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Vocabulary In Context</h2>
  <p class="section-sub">Type the correct word for each sentence, then press Check. You can try again if you get it wrong.</p>
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

/* ---- Section 3: Guiding Phrases ---- */
function renderS3(){
  const chips = GUIDING_PHRASES.map((p,i)=>`<button class="phrase-chip" data-i="${i}">${p}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Guiding Phrases</h2>
  <p class="section-sub">Study the guiding phrases below. With a partner, take turns reading each one aloud. Then click the 3 phrases you think you will use most in your future job.</p>
  <div class="panel">
    <div class="phrase-chip-row" id="s3chips" style="flex-direction:column;align-items:flex-start;">${chips}</div>
    <p class="guest-progress" id="s3progress">Selected: 0 / 3</p>
  </div>`;
}
function wireS3(){
  const chips = document.getElementById('s3chips');
  const progress = document.getElementById('s3progress');
  document.querySelectorAll('#app .phrase-chip').forEach(b=> b.addEventListener('click', ()=> speak(b.textContent,'staff')));
  chips.addEventListener('click', e=>{
    const chip = e.target.closest('.phrase-chip'); if(!chip) return;
    chip.classList.toggle('sel');
    const count = document.querySelectorAll('#app .phrase-chip.sel').length;
    progress.textContent = `Selected: ${count} / 3`;
    if(count >= 3) markActivityComplete('s3');
  });
}

/* ---- Section 4: Reading — Sample Commentary ---- */
function renderS4(){
  const stops = READING.stops.map(s=>`
    <h4 style="font-family:'Oswald';color:var(--orange-deep);font-size:15px;margin-top:18px;">${s.name}</h4>
    ${s.paragraphs.map(p=>`<p style="margin-top:10px;line-height:1.7;">${p}</p>`).join('')}
  `).join('');
  const qCards = READING_QUESTIONS.map((q,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${q.q}</p>
      <button class="reveal-btn" data-reveal="rq${i}">Show model answer</button>
      <div class="model-answer" id="rq${i}">${q.model}</div>
    </div>`).join('');
  const techCards = TECHNIQUES.map((t,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${t.label}:</p>
      <button class="reveal-btn" data-treveal="tq${i}">Show the sentence</button>
      <div class="model-answer" id="tq${i}">"${t.text}"</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Reading: Sample Wellness Tour</h2>
  <p class="section-sub">${READING.title}. Notice how the guide uses vocabulary and guiding phrases as you read.</p>
  <div class="panel">
    ${stops}
    <hr class="hairline">
    <p style="font-style:italic;color:var(--muted);margin-top:14px;">${READING.closing}</p>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Comprehension Questions</h3>
    ${qCards}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Identify the Technique</h3>
    <p class="section-sub" style="margin-top:0;">Find one example of each guiding technique in the script.</p>
    ${techCards}
  </div>`;
}
function wireS4(){
  const revealed = new Set();
  document.querySelectorAll('#app [data-reveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.reveal).classList.toggle('show');
      revealed.add(btn.dataset.reveal);
      checkS4Done();
    });
  });
  const techRevealed = new Set();
  document.querySelectorAll('#app [data-treveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.treveal).classList.toggle('show');
      techRevealed.add(btn.dataset.treveal);
      checkS4Done();
    });
  });
  function checkS4Done(){
    if(revealed.size >= READING_QUESTIONS.length && techRevealed.size >= TECHNIQUES.length) markActivityComplete('s4');
  }
}

/* ---- Section 5: Listen — The Guide At Work ---- */
function renderS5(){
  const qCards = LISTEN_QUESTIONS.map((q,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${q.q}</p>
      <button class="reveal-btn" data-lreveal="lq${i}">Show model answer</button>
      <div class="model-answer" id="lq${i}">${q.model}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Listen: The Guide At Work</h2>
  <p class="section-sub">${LISTEN.intro}</p>
  <div class="panel">
    <img class="venue-photo" src="${SECTION_PHOTOS.tour2.src}" alt="${SECTION_PHOTOS.tour2.alt}" loading="lazy" style="margin-bottom:20px;">
    <div class="playbar">
      <button class="play-btn" id="s5play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY THE TOUR</div>
        <div class="play-sub" id="s5status">Nook (guide) leads four tourists through the resort.</div>
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
    <h3 style="font-size:15px;color:var(--navy);">While Listening</h3>
    ${qCards}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">After Listening</h3>
    <p style="color:var(--muted);font-size:13.5px;">With a partner, discuss: which guiding phrases did Nook use? Write two you would like to use yourself.</p>
    <button class="reveal-btn" data-lreveal="afterq">Show two examples</button>
    <div class="model-answer" id="afterq">"Please feel free to ask me anything at any time." · "I encourage you all to join at least once."</div>
  </div>`;
}
function wireS5(){
  const statusEl = document.getElementById('s5status');
  const playBtn = document.getElementById('s5play');
  VoiceEngine.onChange(()=>{
    const isPlaying = VoiceEngine.isPlaying();
    if(statusEl){
      statusEl.textContent = isPlaying
        ? (VoiceEngine.isPaused() ? 'Paused' : 'Playing: Nook leads the tour…')
        : 'Nook (guide) leads four tourists through the resort.';
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
  const revealed = new Set();
  document.querySelectorAll('#app [data-lreveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(btn.dataset.lreveal).classList.toggle('show');
      revealed.add(btn.dataset.lreveal);
      if(revealed.size >= LISTEN_QUESTIONS.length + 1) markActivityComplete('s5');
    });
  });
}

/* ---- Section 6: Be The Tour Guide (main interactive) ---- */
let s6index = 0;
function renderS6(){
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Be The Tour Guide</h2>
  <p class="section-sub">Guide your guests through Baan Sabai Wellness Resort, stop by stop. At each stop, a guest will ask you a real question. Answer as the guide, not from a script.</p>
  <div class="panel" id="s6body"></div>`;
}
function wireS6(){
  const body = document.getElementById('s6body');
  const done = new Set();
  function showStop(i){
    const s = TOUR_STOPS[i];
    body.innerHTML = `
      <div class="section-eyebrow">Stop ${i+1} of ${TOUR_STOPS.length}</div>
      <h3 style="font-size:18px;color:var(--navy);margin-top:6px;">${s.ic} ${s.nm}</h3>
      <p style="margin-top:10px;color:var(--ink);">${s.info}</p>
      <div class="phrase-card" style="margin-top:12px;"><span class="txt">${s.phrase}</span> <button class="audio-mini" data-say="${s.phrase.replace(/"/g,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>
      <hr class="hairline">
      <div class="guest-bubble">${s.guestQ}</div>
      <p style="font-weight:700;color:var(--orange-deep);margin-top:14px;">Respond as the guide, aloud.</p>
      <button class="reveal-btn" id="s6showmodel">Show one model answer</button>
      <div class="model-answer" id="s6model">${s.modelA}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
        <button class="tb-btn primary" id="s6spoke" style="background:var(--teal);border-color:var(--teal);">I responded aloud</button>
        ${i < TOUR_STOPS.length-1 ? `<button class="tb-btn" id="s6skip">Next stop →</button>` : ''}
      </div>`;
    document.getElementById('s6showmodel').addEventListener('click', ()=> document.getElementById('s6model').classList.toggle('show'));
    const audioBtn = body.querySelector('.audio-mini');
    if(audioBtn) audioBtn.addEventListener('click', ()=> speak(audioBtn.dataset.say,'staff'));
    const nextBtn = document.getElementById('s6skip');
    if(nextBtn) nextBtn.addEventListener('click', ()=>{ s6index = i+1; showStop(s6index); });
    document.getElementById('s6spoke').addEventListener('click', (e)=>{
      done.add(i);
      e.target.disabled = true;
      e.target.textContent = 'Responded';
      if(done.size >= TOUR_STOPS.length){
        markActivityComplete('s6', {score:`${done.size}/${TOUR_STOPS.length} stops`});
      } else if(i < TOUR_STOPS.length-1){
        setTimeout(()=>{ s6index = i+1; showStop(s6index); }, 500);
      }
    });
  }
  showStop(s6index);
}

/* ---- Section 6b: Build the Wellness Tour (signature interactive) =====
   Click-to-arrange sequencing: choose 3 of the 6 possible stops and place
   them in a logical order, each with its own guiding task. "Check My
   Tour" gives feedback on the sequence, not just whether an answer is
   right or wrong, then leads straight into performing it in Section 7. ===== */
let s6bSlots = [null, null, null];
let s6bActiveSlot = 0;
function renderS6b(){
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Build the Wellness Tour</h2>
  <p class="section-sub">Choose 3 stops and put them in a logical order. Think about what makes a good opening, and what makes a memorable ending.</p>
  <div class="panel" id="s6bBody"></div>`;
}
function s6bReset(){ s6bSlots = [null, null, null]; s6bActiveSlot = 0; }
function wireS6b(){
  const body = document.getElementById('s6bBody');

  function buildFeedback(){
    const stops = s6bSlots.map(id => TOUR_STOPS.find(s=>s.id===id));
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
    const filledCount = s6bSlots.filter(Boolean).length;
    const usedIds = s6bSlots.filter(Boolean);
    const pool = TOUR_STOPS.filter(s=>!usedIds.includes(s.id));
    const slotsHtml = TOUR_TASKS.map((task,i)=>{
      const filled = s6bSlots[i] ? TOUR_STOPS.find(s=>s.id===s6bSlots[i]) : null;
      const isActive = i === s6bActiveSlot && !filled;
      return `
      <div class="tour-slot${filled?' filled':''}${isActive?' active':''}" data-slot="${i}">
        <div class="tour-slot-num">STOP ${task.n}</div>
        ${filled
          ? `<div class="tour-slot-fill">${filled.ic} ${filled.nm}</div><button class="tour-slot-clear" data-clear="${i}" aria-label="Remove this stop">${icon('x',{size:14})}</button>`
          : `<div class="tour-slot-empty">Click a stop below to add it here</div>`}
        <div class="tour-slot-task">Task: ${task.label}</div>
      </div>${i < TOUR_TASKS.length-1 ? '<div class="tour-arrow">↓</div>' : ''}`;
    }).join('');
    const poolHtml = pool.map(s=>`<button class="phrase-chip" data-stop="${s.id}">${s.ic} ${s.nm}</button>`).join('');
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
      <div class="phrase-chip-row" id="s6bPool">${poolHtml || '<p style="color:var(--muted);font-size:13.5px;">All stops placed. Check your tour below, or clear a stop to swap it.</p>'}</div>
      <div id="s6bAction" style="margin-top:18px;"></div>
      <div class="feedback" id="s6bFeedback"></div>`;

    document.querySelectorAll('#s6bBody [data-slot]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const i = +el.dataset.slot;
        if(!s6bSlots[i]){ s6bActiveSlot = i; render(); }
      });
    });
    document.querySelectorAll('#s6bBody [data-clear]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        const i = +btn.dataset.clear;
        s6bSlots[i] = null;
        s6bActiveSlot = i;
        render();
      });
    });
    const poolEl = document.getElementById('s6bPool');
    if(poolEl){
      poolEl.addEventListener('click', e=>{
        const chip = e.target.closest('[data-stop]'); if(!chip) return;
        if(s6bSlots[s6bActiveSlot]) return;
        s6bSlots[s6bActiveSlot] = chip.dataset.stop;
        const nextEmpty = s6bSlots.findIndex(v=>!v);
        s6bActiveSlot = nextEmpty >= 0 ? nextEmpty : s6bActiveSlot;
        render();
      });
    }
    const actionEl = document.getElementById('s6bAction');
    if(filledCount >= 3){
      actionEl.innerHTML = `<button class="tb-btn primary" id="s6bCheck" style="background:var(--orange);border-color:var(--orange-deep);">Check My Tour</button>`;
      document.getElementById('s6bCheck').addEventListener('click', ()=>{
        const fb = document.getElementById('s6bFeedback');
        fb.className = 'feedback show good';
        fb.innerHTML = buildFeedback().map(l=>`<p style="margin-top:6px;">${l}</p>`).join('');
        actionEl.innerHTML = `<button class="tb-btn" id="s6bRedo">Rearrange</button> <button class="tb-btn primary" id="s6bNext" style="background:var(--teal);border-color:var(--teal);">Now say your tour aloud →</button>`;
        document.getElementById('s6bRedo').addEventListener('click', ()=>{ s6bReset(); render(); });
        document.getElementById('s6bNext').addEventListener('click', ()=>{
          markActivityComplete('s6b', {score: s6bSlots.join(' → ')});
          document.getElementById('s6bNext').disabled = true;
          document.getElementById('s6bNext').textContent = 'Nice work! Continue to Section 8 when ready.';
        });
      });
    }
  }
  render();
}

/* ---- Section 7: My Wellness Tour (final task) ---- */
function renderS7(){
  return `
  <div class="section-eyebrow">Section 8</div>
  <h2 class="section-title">My Wellness Tour</h2>
  <p class="section-sub">In groups of 3, design a short 3-stop wellness tour of an imaginary destination. Each person guides one stop. Use the reading in Section 4 as a model.</p>
  <div class="panel">
    <label class="notes-label" for="s7dest">Our wellness destination name</label>
    <input type="text" id="s7dest" class="fillblank-input" style="width:100%;" placeholder="e.g. Sunset Wellness Retreat, Chiang Mai">
    <label class="notes-label" for="s7open">Opening line (write it, then practice saying it)</label>
    <textarea class="notes-field" id="s7open" placeholder="${OPENING_LINE_HINT}"></textarea>
    <label class="notes-label" for="s7n1">Stop 1</label>
    <textarea class="notes-field" id="s7n1" placeholder="Area name and one detail"></textarea>
    <label class="notes-label" for="s7n2">Stop 2</label>
    <textarea class="notes-field" id="s7n2" placeholder="Area name and one detail"></textarea>
    <label class="notes-label" for="s7n3">Stop 3</label>
    <textarea class="notes-field" id="s7n3" placeholder="Area name and one detail"></textarea>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--orange-deep);">Now guide your group through the tour: welcome them, guide them to each stop, describe it, and answer any questions.</p>
    <button class="tb-btn primary" id="s7done" style="background:var(--teal);border-color:var(--teal);">I guided my tour</button>
  </div>`;
}
function wireS7(){
  document.getElementById('s7done').addEventListener('click', (e)=>{
    e.target.disabled = true;
    e.target.textContent = 'Guided!';
    markActivityComplete('s7', {completionStatus:'reached'});
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
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this unit, you can guide guests through a wellness destination and answer simple questions.</p>
  </div>

  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">Wellness Tourism Guiding Skills: Study Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review key guiding vocabulary, useful phrases, and tour communication tips.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="Wellness Tourism Guiding Skills Study Guide preview" class="guide-thumb" loading="lazy">
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
    <div class="cover-badge">UNIT 5 COMPLETE</div>
    <h1>You can <span>guide a wellness tour.</span></h1>
    <p>Keep practicing your guiding phrases. A great guide sounds natural, not memorized.</p>
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
  {r:renderS6b, w:wireS6b},
  {r:renderS7, w:wireS7},
  {r:renderS8, w:wireS8},
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
