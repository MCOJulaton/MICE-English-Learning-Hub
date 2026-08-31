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

const TRACKED_ACTIVITIES = ['s1','s2','s2b','s3','s4','s5','s6','s7','s6b','s8','crossword','practice','s9','s10'];

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

/* ===================== DEEP LINKS ===================== */
function applyDeepLinkAfterCheckin(){
  const params = new URLSearchParams(location.search);
  const sectionKey = params.get('section');
  if(!sectionKey) return;
  const idx = SECTION_META.findIndex(s => s.key === sectionKey);
  if(idx < 0) return;
  goTo(idx);
}

/* ===================== STUDENT CHECK-IN =====================
   Explicit check-in only — opening the page is never treated as attendance. */
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
   Two named characters: Mali (event planner, default British female voice)
   and Todd (event planner, American male voice). Same novelty-voice-
   exclusion + pitch-safety-net pattern established for Units 9-11's own
   VoiceEngine copies. */
const VoiceEngine = (function(){
  let allVoices = [];
  let staffVoice = null, delegateVoice = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const FEMALE_NAME_HINTS = /\b(kate|serena|stephanie|fiona|hazel|libby|sonia|olivia|amy|emma|joanna|shelley|grandma|moira|tessa|karen|susan|zira|samantha|victoria|ava|allison|zoe|nicky|jenny|aria|michelle|female)\b/i;
  const MALE_NAME_HINTS = /\b(daniel|arthur|george|oliver|ryan|brian|matthew|guy|eddy|rocko|reed|grandpa|alex|tom|aaron|gordon|justin|bruce|male)\b/i;
  const NOVELTY_NAME_HINTS = /\b(fred|albert|zarvox|whisper|bells|bahh|boing|bubbles|cellos|hysterical|pipe organ|trinoids|wobble|bad news|jester|junior|kathy|princess|ralph|deranged|good news|superstar)\b/i;

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    const notNovelty = v => !NOVELTY_NAME_HINTS.test(v.name);
    const goodVoices = allVoices.filter(notNovelty);
    function pickFrom(list, loc, lang, genderRe){
      return list.find(v => new RegExp('^'+loc+'$','i').test(v.lang) && genderRe.test(v.name))
          || list.find(v => new RegExp('^'+lang+'-','i').test(v.lang) && genderRe.test(v.name))
          || list.find(v => /^en/i.test(v.lang) && genderRe.test(v.name));
    }
    const ukFemaleVoice = pickFrom(goodVoices,'en-GB','en',FEMALE_NAME_HINTS)
                        || goodVoices.find(v => /^en-gb$/i.test(v.lang))
                        || pickFrom(allVoices,'en-GB','en',FEMALE_NAME_HINTS)
                        || goodVoices.find(v => /^en/i.test(v.lang))
                        || goodVoices[0] || allVoices[0] || null;
    const usMaleVoice = pickFrom(goodVoices,'en-US','en',MALE_NAME_HINTS)
                      || goodVoices.find(v => /^en-us$/i.test(v.lang))
                      || pickFrom(allVoices,'en-US','en',MALE_NAME_HINTS)
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
    const voice = kind === 'delegate' ? delegateVoice : staffVoice;
    if(voice) u.voice = voice;
    u.lang = (voice && voice.lang) ? voice.lang : 'en-GB';
    u.rate = (slower ? 0.86 : 1.0);
    u.pitch = kind === 'delegate' ? 0.88 : 1.06;
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

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">THAILAND HEALTH &amp; BUSINESS TOURISM FORUM</div>
    <h1>Two proposals. <span>Which one do you recommend, and why?</span></h1>
    <p>Unit 12: Choosing a Catering Vendor. Compare two real proposals with a partner, weigh the trade-offs, and justify your recommendation.</p>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> 2 Vendors</div>
      <div class="signchip"><span class="arrow">→</span> 1 Recommendation</div>
      <div class="signchip"><span class="arrow">→</span> Trade-Offs</div>
      <div class="signchip"><span class="arrow">→</span> Justify It</div>
    </div>
    <button class="startbtn" onclick="goNext()">Open the proposals →</button>
  </div>`;
}

function renderS1(){
  const rows = WARMUP_SCHEDULE.map(()=>`
    <tr><td></td><td></td><td></td></tr>`).join('');
  const cm = OPENING_SCENARIO.clientMessage;
  const options = OPENING_SCENARIO.options.map((o,i)=>`
    <button class="choice-btn scenario-choice" data-i="${i}">${o.text}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Two Proposals, One Decision</h2>
  <p class="section-sub">It's decision day. Read the client's message, then decide what you'd do.</p>
  <div class="panel">
    <div class="email-template">
      <p style="color:var(--muted);font-size:12.5px;">From: ${cm.from}</p>
      <p style="font-weight:700;color:var(--navy);margin-top:4px;">${cm.subject}</p>
      <p style="margin-top:14px;">${cm.body}</p>
    </div>
    <div class="scenario-message">${OPENING_SCENARIO.message}</div>
    <p style="font-weight:700;color:var(--navy);margin-top:16px;">${OPENING_SCENARIO.question}</p>
    <p style="color:var(--muted);font-size:12.5px;margin-top:2px;">More than one answer can be reasonable. Choose everything you think is a good idea.</p>
    <div class="choices" id="scenarioChoices" style="margin-top:14px;">${options}</div>
    <div class="feedback" id="scenarioFeedback" style="display:block;"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Let's Start the Shift</h3>
    <p class="section-sub" style="margin-top:4px;">Before you compare proposals, listen to today's decision-day plan. Fill in the table as you listen, then reveal the answers to check yourself.</p>
    <div class="playbar" style="margin-top:16px;">
      <button class="play-btn" id="s1play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY TODAY'S PLAN</div>
        <div class="play-sub" id="s1status">Listen for: the time, the task, and where or with whom.</div>
      </div>
      <button class="tb-btn" id="s1replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
    </div>
    <table class="dictation-table" id="s1table">
      <thead><tr><th>Time</th><th>Task</th><th>Where / With Whom</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <button class="reveal-btn" id="s1reveal" style="margin-top:14px;">Show answers</button>
    <div class="model-answer" id="s1answers">
      ${WARMUP_SCHEDULE.map(w=>`<div>${w.time} · ${w.point} · ${w.where}</div>`).join('')}
    </div>
    <hr class="hairline">
    <h3 style="font-size:16px;color:var(--navy);">Not Just the Cheapest Option</h3>
    <p style="color:var(--ink);margin-top:8px;line-height:1.6;font-size:14.5px;">Choosing a supplier for a MICE event is rarely as simple as picking the lowest price. A good recommendation weighs several factors together and can be explained clearly to a client who is trusting your judgment.</p>
  </div>`;
}
function wireS1(){
  const scenarioChoices = document.getElementById('scenarioChoices');
  const scenarioFeedback = document.getElementById('scenarioFeedback');
  const chosen = new Set();
  scenarioChoices.addEventListener('click', e=>{
    const btn = e.target.closest('.scenario-choice'); if(!btn) return;
    const i = +btn.dataset.i;
    const opt = OPENING_SCENARIO.options[i];
    btn.classList.toggle('sel');
    btn.classList.toggle(opt.good ? 'correct' : 'wrong', btn.classList.contains('sel'));
    if(btn.classList.contains('sel')) chosen.add(i); else chosen.delete(i);
    scenarioFeedback.className = 'feedback show ' + (opt.good ? 'good' : 'meh');
    scenarioFeedback.textContent = opt.note;
    if(chosen.size >= 2) sendGranularRecord('Unit 12: Opening scenario', {completionStatus:'reached'});
  });

  const playBtn = document.getElementById('s1play');
  const replayBtn = document.getElementById('s1replay');
  const statusEl = document.getElementById('s1status');
  const revealBtn = document.getElementById('s1reveal');
  const answers = document.getElementById('s1answers');
  const idleStatus = 'Listen for: the time, the task, and where or with whom.';
  function play(){
    VoiceEngine.speakLine(WARMUP_SCRIPT, 'staff');
  }
  VoiceEngine.onChange(()=>{
    const isPlaying = VoiceEngine.isPlaying();
    playBtn.innerHTML = isPlaying ? icon('stop',{size:20}) : icon('play',{size:20});
    playBtn.title = isPlaying ? 'Stop' : 'Play';
    statusEl.textContent = isPlaying ? 'Playing…' : idleStatus;
  });
  playBtn.addEventListener('click', ()=>{
    if(VoiceEngine.isPlaying()) VoiceEngine.stop(); else play();
  });
  replayBtn.addEventListener('click', play);
  revealBtn.addEventListener('click', ()=>{
    answers.classList.add('show');
    markActivityComplete('s1');
  });
}

function renderS2(){
  const cards = VOCAB.map(v=>`
    <div class="loc-card" data-id="${v.id}">
      <div class="ic">${v.ic}</div>
      <div class="nm">${v.nm}</div>
      <div class="loc-detail">
        <div class="vocab-example">"${v.ex}"</div>
        <span style="font-family:'Oswald';font-size:11px;color:var(--muted);">${v.type}</span> ${v.def}
        <br><button class="audio-mini" data-say="${v.ex.replace(/"/g,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
      </div>
    </div>`).join('');
  const secondary = VOCAB_SECONDARY.map(v=>`
    <div class="secondary-word"><b>${v.nm}:</b> ${v.def}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Key Vocabulary</h2>
  <p class="section-sub">These 10 words come up again and again in this unit. Click a word to see it used in a real comparison situation.</p>
  <div class="panel">
    <div class="loc-grid">${cards}</div>
    <hr class="hairline">
    <h3 style="font-size:16px;color:var(--navy)">Quick Check</h3>
    <p id="s2question" style="font-weight:700;color:var(--orange-deep);margin-top:6px;"></p>
    <p style="color:var(--muted);font-size:13px;">Click the matching card above.</p>
    <div class="feedback" id="s2feedback"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Useful Words</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">A few more words you'll see in this unit. You don't need to memorize these, just recognize them.</p>
    <div class="secondary-word-list">${secondary}</div>
  </div>`;
}
let s2target = null;
function wireS2(){
  const grid = document.querySelector('#app .loc-grid');
  const qEl = document.getElementById('s2question');
  const fb = document.getElementById('s2feedback');
  function newQuestion(){
    const pick = VOCAB[Math.floor(Math.random()*VOCAB.length)];
    s2target = pick.id;
    qEl.textContent = `Which word means: "${pick.def}"`;
    fb.className='feedback';
  }
  newQuestion();
  grid.addEventListener('click', e=>{
    const audioBtn = e.target.closest('.audio-mini');
    if(audioBtn){ speak(audioBtn.dataset.say,'staff'); e.stopPropagation(); return; }
    const card = e.target.closest('.loc-card'); if(!card) return;
    if(card.dataset.id === s2target){
      fb.className='feedback show good'; fb.textContent='Correct!';
      markActivityComplete('s2');
      setTimeout(newQuestion, 900);
    } else if(card.classList.contains('open')){
      card.classList.remove('open');
    } else {
      card.classList.add('open');
      if(card.dataset.id !== s2target){
        fb.className='feedback show meh'; fb.textContent="That's a word, but not the one asked for. Keep looking!";
      }
    }
  });
}

/* ===== Section 2b: Rank What Matters Most ===== */
function renderS2b(){
  const items = RANK_FACTORS.map((f,i)=>`<div class="big-choice" data-orig="${i}" style="min-height:70px;"><div class="bc-lbl">${f.text}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Rank What Matters Most</h2>
  <p class="section-sub">Before comparing the two vendors, rank these three factors from most important (1) to least important (3) for this event.</p>
  <div class="panel">
    <div class="big-choice-grid" id="rankSource">${items}</div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:22px;">Your ranking:</h3>
    <ol class="rank-list" id="rankList"></ol>
    <p class="rank-empty-note" id="rankEmpty">Click factors above to rank them, in order.</p>
  </div>`;
}
function wireS2b(){
  const order = [];
  const list = document.getElementById('rankList');
  const emptyNote = document.getElementById('rankEmpty');
  function render(){
    list.innerHTML = order.map((idx,i)=>`<li><span class="rk-num">${i+1}</span>${RANK_FACTORS[idx].text}</li>`).join('');
    emptyNote.style.display = order.length ? 'none' : 'block';
    if(order.length >= RANK_FACTORS.length) markActivityComplete('s2b', {score: order.map(i=>RANK_FACTORS[i].text).join(' > ')});
  }
  document.querySelectorAll('#app [data-orig]').forEach(card=>{
    card.addEventListener('click', ()=>{
      const idx = +card.dataset.orig;
      if(order.includes(idx)){ order.splice(order.indexOf(idx),1); card.classList.remove('sel'); }
      else { order.push(idx); card.classList.add('sel'); }
      render();
    });
  });
}

function renderS3(){
  const words = MATCH_PAIRS.map(v=>`<div class="match-item" data-word="${v.id}">${v.word}</div>`).join('');
  const meanings = shuffle(MATCH_PAIRS).map(v=>`<div class="match-item" data-pic="${v.id}">${v.meaning}</div>`).join('');
  const blanks = FILL_BLANK.map((f,i)=>`
    <div class="fillblank-card">
      <p class="fillblank-q">${i+1}. ${f.q.replace('__________', '<span class="fillblank-gap">______</span>')}</p>
      <div class="fillblank-row">
        <input type="text" class="fillblank-input" id="fbInput${i}" placeholder="Type your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
        <button class="tb-btn" id="fbCheck${i}" style="background:var(--teal);border-color:var(--teal);">Check</button>
      </div>
      <div class="feedback" data-bfb="${i}"></div>
    </div>`).join('');
  const situations = VOCAB_SITUATIONS.map((s,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${s.q}</p>
      <button class="reveal-btn" data-showsit="${i}">Show model answer</button>
      <div class="model-answer" id="vocabsit${i}">${s.model}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Vocabulary Activities</h2>
  <p class="section-sub">Let's practice this unit's words three ways: matching, fill in the blank, and real situations.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Activity 1: Match the Word with Its Meaning</h3>
    <p class="match-hint">Click a word, then click its meaning to connect them. Click a connected item to undo it.</p>
    <div class="match-wrap">
      <svg class="match-svg"></svg>
      <div class="match-cols">
        <div><div class="match-col-title">Word</div>${words}</div>
        <div><div class="match-col-title">Meaning</div>${meanings}</div>
      </div>
    </div>
    <div class="feedback" id="s3matchfb"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Activity 2: Fill in the Blank</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Type the correct word for each sentence, then press Check.</p>
    ${blanks}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Activity 3: What Would You Say?</h3>
    ${situations}
  </div>`;
}
function wireS3(){
  const matchWrap = document.querySelector('.match-wrap');
  const matchSvg = document.querySelector('.match-svg');
  const matchFb = document.getElementById('s3matchfb');
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
        checkS3Done();
      } else {
        matchFb.className='feedback show meh'; matchFb.textContent="That's not a match. Try again.";
        drawConnections({wordEl, picEl:p});
        setTimeout(()=>drawConnections(), 700);
        clearSelection();
      }
    });
  });

  const blanksAnswered = new Set();
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
        blanksAnswered.add(i);
      } else {
        input.classList.add('wrong');
        fb.className='feedback show meh'; fb.textContent='Not quite. Try again.';
      }
      checkS3Done();
    }
    document.getElementById(`fbCheck${i}`).addEventListener('click', check);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); check(); } });
    input.addEventListener('input', ()=> input.classList.remove('correct','wrong'));
  });

  document.querySelectorAll('#app [data-showsit]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(`vocabsit${btn.dataset.showsit}`).classList.add('show');
      checkS3Done();
    });
  });
  function checkS3Done(){
    const matchDone = connections.size >= MATCH_PAIRS.length;
    const blanksDone = blanksAnswered.size >= FILL_BLANK.length;
    if(matchDone && blanksDone) markActivityComplete('s3', {score:`${connections.size}/${MATCH_PAIRS.length} matched`});
  }
}

function renderS4(){
  const qs = READING_QUESTIONS.map((q,i)=>`
    <div class="sit-card" data-rq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${q.q}</p>
      <div class="choices">
        ${q.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-rqfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Reading: Comparing Vendors</h2>
  <p class="section-sub">Read the article below. Think about how these ideas apply to the comparison in Section 9.</p>
  <div class="panel">
    <div class="reading-article">
      <h3 style="font-size:15px;color:var(--navy);">${READING.title}</h3>
      ${READING.paragraphs.map(p=>`<p>${p}</p>`).join('')}
    </div>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Comprehension Check</h3>
    ${qs}
  </div>`;
}
function wireS4(){
  const answered = new Set();
  READING_QUESTIONS.forEach((q,i)=>{
    const box = document.querySelector(`[data-rq="${i}"] .choices`);
    const fb = document.querySelector(`[data-rqfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === q.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else { btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Check the article again.'; }
      answered.add(i);
      if(answered.size >= READING_QUESTIONS.length) markActivityComplete('s4', {score:`${answered.size}/${READING_QUESTIONS.length}`});
    });
  });
}

function renderS5(){
  const tabKeys = Object.keys(PHRASE_TABS);
  const tabs = tabKeys.map((k,i)=>`<button class="tab-btn${i===0?' active':''}" data-tab="${k}">${PHRASE_TABS[k].title}</button>`).join('');
  const panels = tabKeys.map((k,i)=>`
    <div class="tab-panel${i===0?' active':''}" data-panel="${k}">
      <div class="phrase-list">
        ${PHRASE_TABS[k].items.map(p=>`
          <div class="phrase-card">
            <span class="txt">"${p}"</span>
            <button class="audio-mini" data-say="${p.replace(/"/g,'').replace(/…|\[|\]/g,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button>
          </div>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Useful Phrases</h2>
  <p class="section-sub">The phrases event planners use when comparing options, organized by moment.</p>
  <div class="panel">
    <div class="tabs">${tabs}</div>
    ${panels}
  </div>`;
}
function wireS5(){
  const tabKeys = Object.keys(PHRASE_TABS);
  const visited = new Set([tabKeys[0]]);
  document.querySelectorAll('#app .tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app .tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app .tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app .tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add('active');
      visited.add(btn.dataset.tab);
      if(visited.size >= tabKeys.length) markActivityComplete('s5');
    });
  });
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'staff')));
}

function renderS6(){
  const qs = LISTEN_QUESTIONS.map((q,i)=>`
    <div class="sit-card" data-lq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${q.q}</p>
      <div class="choices">
        ${q.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-lqfb="${i}"></div>
    </div>`).join('');
  const guesses = BEFORE_LISTEN.guesses.map((g,i)=>`
    <button class="choice-btn" data-guess="${i}">${g}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Listening: Making the Call</h2>
  <p class="section-sub">${LISTEN.intro}</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Before You Listen</h3>
    <p style="color:var(--ink);margin-top:6px;font-size:14.5px;">${BEFORE_LISTEN.setup}</p>
    <div class="choices" id="predictChoices" style="margin-top:12px;">${guesses}</div>
    <div class="feedback" id="predictFeedback"></div>
  </div>
  <div class="panel">
    <div class="playbar">
      <button class="play-btn" id="s6play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY THE CONVERSATION</div>
        <div class="play-sub" id="s6status">Mali and Todd compare the two proposals.</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="tb-btn" id="s6pause"><span class="icon-inline">${icon('pause',{size:14})}</span> <span class="lbl">Pause</span></button>
        <button class="tb-btn" id="s6resume"><span class="icon-inline">${icon('play',{size:14})}</span> <span class="lbl">Resume</span></button>
        <button class="tb-btn" id="s6replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
        <button class="tb-btn" id="s6slower"><span class="lbl">Slower</span></button>
      </div>
    </div>
    <button class="reveal-btn" id="s6showtranscript" style="margin-top:16px;">Show transcript</button>
    <div class="model-answer" id="s6transcript" style="text-align:left;">
      ${LISTEN.lines.map(l=>`<p><b>${l.who}:</b> ${l.text}</p>`).join('')}
    </div>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Listen and Answer</h3>
    ${qs}
  </div>`;
}
function wireS6(){
  const predictChoices = document.getElementById('predictChoices');
  const predictFeedback = document.getElementById('predictFeedback');
  predictChoices.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    [...predictChoices.children].forEach(b=>b.classList.remove('sel'));
    btn.classList.add('sel');
    predictFeedback.className = 'feedback show good';
    predictFeedback.textContent = "Good guess. Now let's listen and find out.";
  });

  const statusEl = document.getElementById('s6status');
  const playBtn = document.getElementById('s6play');
  const pauseBtn = document.getElementById('s6pause');
  const resumeBtn = document.getElementById('s6resume');
  const replayBtn = document.getElementById('s6replay');
  const slowerBtn = document.getElementById('s6slower');

  VoiceEngine.onChange(()=>{
    const isPlaying = VoiceEngine.isPlaying();
    if(statusEl){
      statusEl.textContent = isPlaying
        ? (VoiceEngine.isPaused() ? 'Paused' : 'Playing the conversation…')
        : 'Mali and Todd compare the two proposals.';
    }
    if(playBtn){
      playBtn.innerHTML = isPlaying ? icon('stop',{size:20}) : icon('play',{size:20});
      playBtn.title = isPlaying ? 'Stop' : 'Play';
    }
  });
  playBtn.addEventListener('click', ()=>{
    if(VoiceEngine.isPlaying()) VoiceEngine.stop(); else VoiceEngine.speakConversation(LISTEN.lines);
  });
  replayBtn.addEventListener('click', ()=> VoiceEngine.speakConversation(LISTEN.lines));
  pauseBtn.addEventListener('click', ()=> VoiceEngine.pause());
  resumeBtn.addEventListener('click', ()=> VoiceEngine.resume());
  slowerBtn.addEventListener('click', ()=>{
    VoiceEngine.setSlower(!VoiceEngine.isSlower());
    slowerBtn.classList.toggle('primary', VoiceEngine.isSlower());
    slowerBtn.innerHTML = VoiceEngine.isSlower() ? '<span class="lbl">Slower: On</span>' : '<span class="lbl">Slower</span>';
  });
  document.getElementById('s6showtranscript').addEventListener('click', function(){
    document.getElementById('s6transcript').classList.add('show');
    this.style.display = 'none';
  });
  const answered = new Set();
  LISTEN_QUESTIONS.forEach((q,i)=>{
    const box = document.querySelector(`[data-lq="${i}"] .choices`);
    const fb = document.querySelector(`[data-lqfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === q.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else { btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Listen again and try once more.'; }
      answered.add(i);
      if(answered.size >= LISTEN_QUESTIONS.length) markActivityComplete('s6', {score:`${answered.size}/${LISTEN_QUESTIONS.length}`});
    });
  });
}

function renderS7(){
  const rows = SCRIPT_ANALYSIS.map((a,i)=>`
    <div class="checklist-row" data-strat="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${a.strategy}<span style="display:block;font-weight:400;color:var(--muted);font-size:12.5px;margin-top:2px;">"${a.example}"</span></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 8</div>
  <h2 class="section-title">After Listening</h2>
  <p class="section-sub">With a partner, discuss: what did Mali and Todd do well? What would you have done differently?</p>
  <div class="panel">
    <p style="color:var(--muted);font-size:13.5px;">Talk it through together. This isn't graded, but it's how you build real speaking fluency before the comparison task.</p>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Script Analysis</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">These are real strategies used by professional event planners worldwide. Click each one once you can point to where it happened in the call.</p>
    <div style="margin-top:10px;">${rows}</div>
  </div>`;
}
function wireS7(){
  const rows = document.querySelectorAll('#app .checklist-row');
  const found = new Set();
  rows.forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) found.add(row.dataset.strat); else found.delete(row.dataset.strat);
      if(found.size >= rows.length) markActivityComplete('s7');
    });
  });
}

/* ===== Section 6b: Compare and Decide =====
   PAIR task using the .ab-toggle/.ab-btn/.ab-view component: Student A
   reads Vendor A's full proposal, Student B reads Vendor B's, then together
   they must agree on and justify a joint recommendation. */
function renderS6b(){
  const rowsOf = v => `
    <div class="rubric-row"><div><div class="lbl">Price</div><div class="sub">${v.price}</div></div></div>
    <div class="rubric-row"><div><div class="lbl">Menu</div><div class="sub">${v.menu}</div></div></div>
    <div class="rubric-row"><div><div class="lbl">Dietary Options</div><div class="sub">${v.dietary}</div></div></div>
    <div class="rubric-row"><div><div class="lbl">Reviews</div><div class="sub">${v.reviews}</div></div></div>
    <div class="rubric-row"><div><div class="lbl">Flexibility</div><div class="sub">${v.flexibility}</div></div></div>`;
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">Compare and Decide</h2>
  <p class="section-sub">Pair speaking. Student A has Vendor A's full proposal. Student B has Vendor B's. Only one screen should be visible per student.</p>
  <div class="panel">
    <div class="ab-toggle">
      <button class="ab-btn active" data-ab="A">Show Student A: Vendor A</button>
      <button class="ab-btn" data-ab="B">Show Student B: Vendor B</button>
    </div>
    <div class="ab-view show" id="abA">
      <h3 style="color:var(--navy);font-size:16px;">Student A, you have ${VENDOR_A.name}'s proposal</h3>
      <p>Describe this proposal to Student B out loud. Do not show your screen to Student B.</p>
      <div style="margin-top:10px;">${rowsOf(VENDOR_A)}</div>
    </div>
    <div class="ab-view" id="abB">
      <h3 style="color:var(--navy);font-size:16px;">Student B, you have ${VENDOR_B.name}'s proposal</h3>
      <p>Describe this proposal to Student A out loud. Do not show your screen to Student A.</p>
      <div style="margin-top:10px;">${rowsOf(VENDOR_B)}</div>
    </div>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--navy);">Together, agree on a recommendation and write your justification.</p>
    <textarea id="recBox" class="challenge-textarea" rows="3" placeholder="We recommend Vendor ___ because…"></textarea>
    <button class="reveal-btn" id="recReveal" style="margin-top:14px;">Show a model recommendation</button>
    <div class="model-answer" id="recAnswer">${MODEL_RECOMMENDATION}</div>
  </div>`;
}
function wireS6b(){
  const seenRoles = new Set(['A']);
  document.querySelectorAll('#app .ab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app .ab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app .ab-view').forEach(v=>v.classList.remove('show'));
      btn.classList.add('active');
      document.getElementById('ab'+btn.dataset.ab).classList.add('show');
      seenRoles.add(btn.dataset.ab);
    });
  });
  document.getElementById('recReveal').addEventListener('click', ()=>{
    document.getElementById('recAnswer').classList.add('show');
  });
  document.getElementById('recBox').addEventListener('input', function(){
    if(this.value.trim().length >= 10 && seenRoles.size >= 2){
      markActivityComplete('s6b', {score:'both vendors viewed'});
    }
  });
}

function renderS8(){
  const cards = key => `
    <div class="sit-card">
      <h3 style="font-size:16px;color:var(--navy);">${ROLEPLAY_CARDS[key].title}</h3>
      <p style="margin-top:6px;color:var(--ink);">${ROLEPLAY_CARDS[key].body}</p>
      <p style="margin-top:10px;font-weight:700;color:var(--navy);font-size:13.5px;">${ROLEPLAY_CARDS[key].role}</p>
      <p style="margin-top:10px;font-weight:700;color:var(--orange-deep);font-size:12.5px;">USEFUL PHRASES:</p>
      <div class="phrase-list" style="margin-top:8px;">
        ${ROLEPLAY_CARDS[key].phrases.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('')}
      </div>
    </div>`;
  const scenarios = CHALLENGE_SCENARIOS.map(s=>`
    <div class="phrase-card"><span class="txt"><b>${s.tag}:</b> ${s.text}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 10</div>
  <h2 class="section-title">Speaking Practice: Negotiate the Deal</h2>
  <p class="section-sub">Practice the negotiation in pairs. Student A is the event planner; Student B is the vendor representative. Switch roles for Round 2.</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-role="staff">Round 1: Event Planner</button>
      <button class="tab-btn" data-role="visitor">Round 2: Vendor Rep</button>
    </div>
    <div class="tab-panel active" data-rolepanel="staff">${cards('staff')}</div>
    <div class="tab-panel" data-rolepanel="visitor">${cards('visitor')}</div>
    <p style="color:var(--muted);font-size:12.5px;margin-top:14px;">Practice once using the phrases above. Then try again with less support, in your own words.</p>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Extra Challenge Scenarios</h3>
    <div class="phrase-list" style="margin-top:10px;">${scenarios}</div>
  </div>`;
}
function wireS8(){
  const viewed = new Set(['staff']);
  document.querySelectorAll('#app [data-role]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-role]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-rolepanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-rolepanel="${btn.dataset.role}"]`).classList.add('active');
      viewed.add(btn.dataset.role);
      if(viewed.size >= 2) markActivityComplete('s8', {completionStatus:'reached'});
    });
  });
}

/* ===== Quick Match (Remember-level, replaces the crossword slot) =====
   Two columns shown at once (words, definitions); click a word, then its
   match, for a color-lock pair — a different mechanic from s3's SVG-line
   matching and from the sequential recall quizzes used elsewhere. */
function renderCrossword(){
  const words = shuffle(VOCAB).map(v=>`<button class="choice-btn quickmatch-word" data-id="${v.id}">${v.nm}</button>`).join('');
  const defs = shuffle(VOCAB).map(v=>`<button class="choice-btn quickmatch-def" data-id="${v.id}">${v.def}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 11</div>
  <h2 class="section-title">Quick Match</h2>
  <p class="section-sub">Click a word, then click its definition. Match all ${VOCAB.length} pairs.</p>
  <div class="panel">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <div><h3 style="font-size:13px;color:var(--navy);letter-spacing:.04em;">WORDS</h3><div class="choices" style="margin-top:10px;">${words}</div></div>
      <div><h3 style="font-size:13px;color:var(--navy);letter-spacing:.04em;">DEFINITIONS</h3><div class="choices" style="margin-top:10px;">${defs}</div></div>
    </div>
    <div class="feedback" id="qmFeedback"></div>
  </div>`;
}
function wireCrossword(){
  let selectedWord = null;
  const matched = new Set();
  const fb = document.getElementById('qmFeedback');
  document.querySelectorAll('#app .quickmatch-word').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(btn.classList.contains('correct')) return;
      document.querySelectorAll('#app .quickmatch-word').forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      selectedWord = btn.dataset.id;
    });
  });
  document.querySelectorAll('#app .quickmatch-def').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(btn.classList.contains('correct') || !selectedWord) return;
      const wordBtn = document.querySelector(`.quickmatch-word[data-id="${selectedWord}"]`);
      if(btn.dataset.id === selectedWord){
        btn.classList.add('correct'); wordBtn.classList.add('correct'); wordBtn.classList.remove('sel');
        matched.add(selectedWord);
        fb.className = 'feedback show good'; fb.textContent = 'Correct!';
        selectedWord = null;
        if(matched.size >= VOCAB.length) markActivityComplete('crossword', {score:`${matched.size}/${VOCAB.length}`});
      } else {
        fb.className = 'feedback show meh'; fb.textContent = 'Not a match. Try again.';
      }
    });
  });
}

function renderPractice(){
  const checklist = PEER_CHECKLIST.map((c,i)=>`
    <div class="checklist-row" data-chk="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${c}</div>
    </div>`).join('');
  const bonus = BONUS_ANNOUNCEMENT_SITUATIONS.map(s=>`
    <div class="phrase-card"><span class="txt"><b>${s.tag}:</b> ${s.text}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 12</div>
  <h2 class="section-title">Peer Checklist &amp; Bonus</h2>
  <p class="section-sub">Evaluate another pair's recommendation. Check off each item as you observe it.</p>
  <div class="panel">
    ${checklist}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Bonus: Compare Something Else</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:6px;">Choose ONE situation below and discuss a recommendation with your partner.</p>
    <div class="phrase-list" style="margin-top:10px;">${bonus}</div>
  </div>`;
}
function wirePractice(){
  const rows = document.querySelectorAll('#app .checklist-row');
  const checked = new Set();
  rows.forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.chk); else checked.delete(row.dataset.chk);
      if(checked.size >= rows.length) markActivityComplete('practice', {score:`${checked.size}/${rows.length}`});
    });
  });
}

function renderS9(){
  return `
  <div class="section-eyebrow">Section 13</div>
  <h2 class="section-title">Writing Task</h2>
  <p class="section-sub">${WRITING_TASK.prompt}</p>
  <div class="panel">
    <div class="email-template">
      <p>Dear [Client Name],</p>
      <textarea id="s9writing" class="challenge-textarea" rows="5" style="margin-top:14px;" placeholder="Write your 4–6 sentence recommendation here…"></textarea>
      <p style="margin-top:24px;">Please let us know if you have any questions.</p>
      <p style="margin-top:10px;">Best regards,<br>Events Office Team</p>
    </div>
    <div class="feedback" id="s9fb"></div>
    <hr class="hairline">
    <div class="sit-card">
      <h3 style="font-size:14px;color:var(--navy);">Tourism Business Management</h3>
      <p style="margin-top:6px;color:var(--ink);font-size:14px;">${WRITING_TASK.discussion[0].text}</p>
    </div>
    <div class="sit-card" style="margin-top:14px;">
      <h3 style="font-size:14px;color:var(--navy);">Wellness Tourism Management</h3>
      <p style="margin-top:6px;color:var(--ink);font-size:14px;">${WRITING_TASK.discussion[1].text}</p>
    </div>
  </div>`;
}
function wireS9(){
  const box = document.getElementById('s9writing');
  const fb = document.getElementById('s9fb');
  box.addEventListener('input', ()=>{
    const len = box.value.trim().length;
    if(len >= 40){
      fb.className = 'feedback show good';
      fb.textContent = 'Nice work. That reads like a real recommendation.';
      markActivityComplete('s9', {score:`${box.value.trim().split(/\s+/).length} words`});
    } else if(len > 0){
      fb.className = 'feedback show meh';
      fb.textContent = 'Keep going. Aim for 4-6 full sentences.';
    } else {
      fb.className = 'feedback';
    }
  });
}

function renderS10(){
  const rows = RUBRIC.map(r=>`
    <div class="rubric-row">
      <div><div class="lbl">${r.lbl}</div><div class="sub">${r.sub}</div></div>
      <div class="rate" data-k="${r.k}">
        ${[1,2,3].map(n=>`<button data-n="${n}">${n}</button>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 14</div>
  <h2 class="section-title">Self-Check</h2>
  <p class="section-sub">Rate yourself honestly. Your teacher remains the final evaluator.</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this lesson, you should feel more confident comparing options fairly and justifying a recommendation.</p>
  </div>`;
}
function wireS10(){
  const rateGroups = document.querySelectorAll('#app .rate');
  rateGroups.forEach(rate=>{
    rate.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...rate.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      const ratedCount = [...rateGroups].filter(r => r.querySelector('.sel')).length;
      if(ratedCount >= rateGroups.length){
        markActivityComplete('s10', {score: `self-rated ${ratedCount}/${rateGroups.length}`});
      }
    });
  });
}

/* ===================== COMPLETE (final end screen) ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 12 COMPLETE</div>
    <h1>You can <span>justify a recommendation.</span></h1>
    <p>Keep practicing weighing trade-offs, and remember: a good recommendation always explains why.</p>
    <div class="complete-actions">
      <button class="tb-btn" id="completePracticeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('rotateCcw',{size:16})}</span> Practice Again</button>
      <button class="tb-btn" id="completeHomeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('home',{size:16})}</span> Back to Start</button>
      <a class="tb-btn" id="completeUnitsBtn" href="../index.html" style="padding:16px 26px;font-size:15px;">All MICE Units</a>
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
    const listening = Progress.activities['s6'] ? 'Yes' : 'No';
    const practice = Progress.activities['practice'] ? 'Yes' : 'No';
    stats.innerHTML = `
      <p class="complete-stats-intro">Your progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Activities Completed</div></div>
        <div class="complete-stat"><div class="num">${practice}</div><div class="lbl">Peer Checklist Completed</div></div>
        <div class="complete-stat"><div class="num">${listening}</div><div class="lbl">Listening Completed</div></div>
      </div>`;
  }
  if(!lessonCompleteSent && Progress.studentId){
    lessonCompleteSent = true;
    sendProgressRecord(buildRecord('Lesson Complete', {score: `${completedCount()}/${TRACKED_ACTIVITIES.length}`, completionStatus:'completed'}));
  }
}

function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

const RENDERERS = [
  {r:renderCover, w:null},
  {r:renderS1, w:wireS1},
  {r:renderS2, w:wireS2},
  {r:renderS2b, w:wireS2b},
  {r:renderS3, w:wireS3},
  {r:renderS4, w:wireS4},
  {r:renderS5, w:wireS5},
  {r:renderS6, w:wireS6},
  {r:renderS7, w:wireS7},
  {r:renderS6b, w:wireS6b},
  {r:renderS8, w:wireS8},
  {r:renderCrossword, w:wireCrossword},
  {r:renderPractice, w:wirePractice},
  {r:renderS9, w:wireS9},
  {r:renderS10, w:wireS10},
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
