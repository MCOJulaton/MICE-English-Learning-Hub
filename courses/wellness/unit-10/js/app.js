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
    d.className = 'dot' + (i===current?' active':'') + (Progress.activities[s.key]?' done':'');
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

const TRACKED_ACTIVITIES = ['s1','s2','s2b','s3','s4','s5','s5b','s6','s7','s6b','s8','crossword','practice','s9','s10'];

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
   Two named characters, differentiated by accent AND by a pitch+rate pair
   (never by pitch alone, since some runtimes have no distinct US female
   voice and would otherwise fall back to the identical voice object):

     Ploy ('staff' kind)     — wellness consultant — en-GB — pitch 0.98 — rate 0.97
     Khun Aing ('delegate') — guest (Section 8 listening) — en-US — pitch 1.08 — rate 1.04

   Same novelty-voice-exclusion + pitch-safety-net pattern established for
   Unit 9's own VoiceEngine copy, plus a distinct-voice-name preference (see
   refresh() below) so the two slots pick two different underlying voices
   whenever the runtime has them, rather than only relying on lang/locale.
   QUALITY_NAME_HINTS nudges the picker toward whichever installed voices
   are actually the most natural-sounding (Chrome's network "Google UK
   English" voices, or an OS's "Enhanced"/"Premium"/"Natural" voices) —
   voice quality itself is set by the browser/OS the page runs on, not by
   this code, so a classroom Chrome with only legacy voices installed will
   still sound more robotic than one with better voices available. The
   pitch gap between the two characters is kept mild on purpose: a large
   pitch swing is what makes browser TTS sound like a cartoon, not less
   robotic. */
const VoiceEngine = (function(){
  let allVoices = [];
  let staffVoice = null, delegateVoice = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const FEMALE_NAME_HINTS = /\b(kate|serena|stephanie|fiona|hazel|libby|sonia|olivia|amy|emma|joanna|shelley|flo|sandy|moira|tessa|karen|susan|zira|samantha|victoria|ava|allison|zoe|nicky|jenny|aria|michelle|female)\b/i;
  const NOVELTY_NAME_HINTS = /\b(fred|albert|zarvox|whisper|bells|bahh|boing|bubbles|cellos|hysterical|pipe organ|trinoids|wobble|bad news|jester|junior|kathy|princess|ralph|deranged|good news|superstar|grandma|grandpa)\b/i;
  const QUALITY_NAME_HINTS = /\b(google|natural|enhanced|premium|online|neural)\b/i;

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    const notNovelty = v => !NOVELTY_NAME_HINTS.test(v.name);
    const goodVoices = [...allVoices.filter(notNovelty)]
      .sort((a,b) => (QUALITY_NAME_HINTS.test(b.name)?1:0) - (QUALITY_NAME_HINTS.test(a.name)?1:0));
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
    /* Both speakers are female here, so the delegate voice is a genuinely
       different accent (US) rather than a different gender, and pitch does
       the rest of the differentiation in makeUtterance() below. */
    const usFemaleVoice = pickFrom(goodVoices,'en-US','en',FEMALE_NAME_HINTS)
                        || goodVoices.find(v => /^en-us$/i.test(v.lang))
                        || pickFrom(allVoices,'en-US','en',FEMALE_NAME_HINTS)
                        /* Before collapsing to the same voice object as ukFemaleVoice
                           (which would leave pitch/rate as the only differentiator),
                           prefer ANY other English voice with a genuinely different
                           voice.name over matching by lang/locale alone. */
                        || goodVoices.find(v => /^en/i.test(v.lang) && (!ukFemaleVoice || v.name !== ukFemaleVoice.name))
                        || ukFemaleVoice;
    staffVoice = ukFemaleVoice;
    delegateVoice = usFemaleVoice;
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
    /* Rate offset alongside the pitch offset below, so the two characters
       are never differentiated by pitch alone — matters most on runtimes
       where delegateVoice falls back to the same voice object as
       staffVoice (see the distinct-name preference in refresh() above). */
    const rateOffset = kind === 'delegate' ? 1.04 : 0.97;
    u.rate = (slower ? 0.86 : 1.0) * rateOffset;
    u.pitch = kind === 'delegate' ? 1.08 : 0.98;
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
    <div class="cover-badge">WELLNESS TOURISM MANAGEMENT PROGRAM</div>
    <h1>One guest. <span>Real constraints. One personal day.</span></h1>
    <p>Unit 10: Personalizing a Wellness Day. Learn to run a short wellness consultation, recommend activities that fit a guest's goal, explain a constraint instead of just saying no, and confirm the finished plan.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Ask</div>
      <div class="signchip"><span class="arrow">→</span> Recommend</div>
      <div class="signchip"><span class="arrow">→</span> Adjust</div>
      <div class="signchip"><span class="arrow">→</span> Confirm</div>
    </div>
    <button class="startbtn" onclick="goNext()">Meet your first guest →</button>
  </div>`;
}

function renderS1(){
  const rows = WARMUP_SCHEDULE.map(()=>`
    <tr><td></td><td></td><td></td></tr>`).join('');
  const dialogueHtml = OPENING_SCENARIO.dialogue.map(l=>`<p style="margin-top:8px;line-height:1.6;"><b style="color:var(--navy);">${l.who}:</b> ${l.text}</p>`).join('');
  const options = OPENING_SCENARIO.options.map((o,i)=>`
    <button class="choice-btn scenario-choice" data-i="${i}">${o.text}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Meet the Guest</h2>
  <p class="section-sub">Before you plan anything, read the guest's intake card and decide what actually matters first.</p>
  <div class="panel">
    <img class="section-photo" src="${SECTION_PHOTOS.meetGuest.src}" alt="${SECTION_PHOTOS.meetGuest.alt}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;object-position:center;border-radius:12px;margin-bottom:14px;">
    <div class="sit-card">${dialogueHtml}</div>
    <div class="scenario-message">${OPENING_SCENARIO.message}</div>
    <p style="font-weight:700;color:var(--navy);margin-top:16px;">${OPENING_SCENARIO.question}</p>
    <p style="color:var(--muted);font-size:12.5px;margin-top:2px;">More than one answer can be reasonable. Choose everything you think is a good idea.</p>
    <div class="choices" id="scenarioChoices" style="margin-top:14px;">${options}</div>
    <div class="feedback" id="scenarioFeedback" style="display:block;"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Listen and Identify</h3>
    <p class="section-sub" style="margin-top:4px;">Listen to the guest's profile. Fill in the table as you listen, then reveal the answers to check yourself.</p>
    <div class="playbar" style="margin-top:16px;">
      <button class="play-btn" id="s1play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY THE GUEST PROFILE</div>
        <div class="play-sub" id="s1status">Listen for: her goal, her preferences, and her time limit.</div>
      </div>
      <button class="tb-btn" id="s1replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
    </div>
    <table class="dictation-table" id="s1table">
      <thead><tr><th>Category</th><th>Detail</th><th>Source</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <button class="reveal-btn" id="s1reveal" style="margin-top:14px;">Show answers</button>
    <div class="model-answer" id="s1answers">
      ${WARMUP_SCHEDULE.map(w=>`<div>${w.time} · ${w.point} · ${w.where}</div>`).join('')}
    </div>
    <hr class="hairline">
    <h3 style="font-size:16px;color:var(--navy);">One Guest, One Plan</h3>
    <p style="color:var(--ink);margin-top:8px;line-height:1.6;font-size:14.5px;">A wellness day isn't a fixed schedule handed to every guest. It's built around one person: her goal, what she prefers, what she'd rather avoid, and how much time she actually has. Everything you recommend later in this unit should serve what you just read here.</p>
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
    if(chosen.size >= 2) sendGranularRecord('Unit 10: Opening scenario', {completionStatus:'reached'});
  });

  const playBtn = document.getElementById('s1play');
  const replayBtn = document.getElementById('s1replay');
  const statusEl = document.getElementById('s1status');
  const revealBtn = document.getElementById('s1reveal');
  const answers = document.getElementById('s1answers');
  const idleStatus = "Listen for: her goal, her preferences, and her time limit.";
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

/* Turns "[[id:Label]]" tokens in CONSULTATION_GUIDE strings into clickable
   terms looked up against VOCAB by id — this is how Section 2 teaches the
   10 words as a real discussion instead of a flat glossary. */
function vocabTermize(text){
  return text.replace(/\[\[(\w+):([^\]]+)\]\]/g, (m, id, label) =>
    `<span class="vocab-term" data-id="${id}" style="color:var(--teal);font-weight:700;cursor:pointer;border-bottom:2px dotted var(--teal);padding:0 1px;border-radius:2px;">${label}</span>`);
}
function renderS2(){
  const pointsHtml = CONSULTATION_GUIDE.points.map(p=>`<p style="margin-top:12px;line-height:1.7;color:var(--ink);font-size:14.5px;">${vocabTermize(p)}</p>`).join('');
  const secondary = VOCAB_SECONDARY.map(v=>`
    <div class="secondary-word"><b>${v.nm}:</b> ${v.def}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">What I Tell Every New Consultant</h2>
  <p class="section-sub">Ten words you'll use constantly with guests, the way an experienced consultant actually talks about the job. Click any highlighted word to see what it means.</p>
  <div class="panel">
    <div class="sit-card">
      <p style="font-style:italic;color:var(--muted);font-size:13px;">A senior wellness consultant talks to a new hire:</p>
      <p style="margin-top:10px;line-height:1.7;color:var(--ink);font-size:14.5px;">${vocabTermize(CONSULTATION_GUIDE.intro)}</p>
      ${pointsHtml}
    </div>
    <hr class="hairline">
    <div class="sit-card" id="s2wordpanel">
      <p style="color:var(--muted);font-size:13.5px;">Click a highlighted word above to see its meaning here.</p>
    </div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy)">Quick Check</h3>
    <p id="s2question" style="font-weight:700;color:var(--orange-deep);margin-top:6px;"></p>
    <p style="color:var(--muted);font-size:13px;">Click the matching highlighted word in the discussion above.</p>
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
  const terms = document.querySelectorAll('#app .vocab-term');
  const panel = document.getElementById('s2wordpanel');
  const qEl = document.getElementById('s2question');
  const fb = document.getElementById('s2feedback');
  function newQuestion(){
    const pick = VOCAB[Math.floor(Math.random()*VOCAB.length)];
    s2target = pick.id;
    qEl.textContent = `Which word means: "${pick.def}"`;
    fb.className='feedback';
  }
  function showWord(v){
    panel.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:22px;">${v.ic}</div>
        <div><div style="font-weight:700;color:var(--navy);font-family:'Oswald';">${v.nm}</div><span style="font-family:'Oswald';font-size:11px;color:var(--muted);">${v.type}</span></div>
      </div>
      <p style="margin-top:8px;color:var(--ink);font-size:14px;">${v.def}</p>
      <div class="vocab-example" style="margin-top:8px;">"${v.ex}"</div>
      <button class="audio-mini" id="s2wordAudio" style="margin-top:8px;"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>`;
    document.getElementById('s2wordAudio').addEventListener('click', ()=> speak(v.ex,'staff'));
  }
  newQuestion();
  terms.forEach(term=>{
    term.addEventListener('click', ()=>{
      const id = term.dataset.id;
      const v = VOCAB.find(x=>x.id===id);
      if(!v) return;
      terms.forEach(t=>t.style.background='');
      term.style.background = 'rgba(15,110,108,0.14)';
      showWord(v);
      if(id === s2target){
        fb.className='feedback show good'; fb.textContent='Correct!';
        markActivityComplete('s2');
        setTimeout(newQuestion, 900);
      } else {
        fb.className='feedback show meh'; fb.textContent="That's a word, but not the one asked for. Keep looking!";
      }
    });
  });
}

/* ===== Section 2b: What Would You Do? (schedule mix-up challenge) ===== */
function renderS2b(){
  const shuffled = shuffle(SEQUENCE_STEPS.map((s,i)=>({text:s.text, origIndex:i})));
  const items = shuffled.map(s=>`<div class="big-choice" data-orig="${s.origIndex}" style="min-height:70px;"><div class="bc-lbl">${s.text}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">The Consultation Process</h2>
  <p class="section-sub">Click each step in the order you would actually do it, running a wellness consultation.</p>
  <div class="panel">
    <div class="big-choice-grid" id="seqSource">${items}</div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:22px;">Your order:</h3>
    <ol class="rank-list" id="seqList"></ol>
    <p class="rank-empty-note" id="seqEmpty">Click steps above to add them here, in order.</p>
    <button class="reveal-btn" id="seqCheck" style="margin-top:14px;">Check My Order</button>
    <div class="feedback" id="seqFeedback"></div>
  </div>`;
}
function wireS2b(){
  const order = [];
  const list = document.getElementById('seqList');
  const emptyNote = document.getElementById('seqEmpty');
  const fb = document.getElementById('seqFeedback');
  function render(){
    list.innerHTML = order.map((origIdx,i)=>`<li><span class="rk-num">${i+1}</span>${SEQUENCE_STEPS[origIdx].text}</li>`).join('');
    emptyNote.style.display = order.length ? 'none' : 'block';
  }
  document.querySelectorAll('#app [data-orig]').forEach(card=>{
    card.addEventListener('click', ()=>{
      const idx = +card.dataset.orig;
      if(order.includes(idx)){ order.splice(order.indexOf(idx),1); card.classList.remove('sel'); }
      else { order.push(idx); card.classList.add('sel'); }
      render();
    });
  });
  document.getElementById('seqCheck').addEventListener('click', ()=>{
    if(order.length < SEQUENCE_STEPS.length){
      fb.className = 'feedback show meh'; fb.textContent = 'Add all the steps first.';
      return;
    }
    const correct = order.every((idx,i)=> idx===i);
    if(correct){
      fb.className = 'feedback show good'; fb.textContent = 'Perfect order!';
      markActivityComplete('s2b', {score:'correct order'});
    } else {
      fb.className = 'feedback show meh'; fb.textContent = 'Not quite the right order yet. Click a step above to remove it, then try again.';
    }
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
  <h2 class="section-title">Reading</h2>
  <p class="section-sub">Read the article below. Think about how these ideas apply to the consultation and day-building sections ahead.</p>
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
      ${PHRASE_TABS[k].img ? `<img class="section-photo" src="${PHRASE_TABS[k].img}" alt="A photo illustrating ${PHRASE_TABS[k].title}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;object-position:center;border-radius:12px;margin-bottom:14px;">` : ''}
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
  <p class="section-sub">The phrases wellness consultants use, organized by consultation stage.</p>
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

/* ===== Section 5b: Guided Consultation Practice =====
   PAIRED rehearsal of the ASKING half of a consultation, using a fixed
   question guide plus two guest cards students role-play from. Distinct
   from Section 8 (Explain and Confirm), which rehearses EXPLAINING a
   plan that's already been built. Reuses the phrase-card/sit-card/
   checklist-row idioms already used throughout this unit. */
function renderS5b(){
  const guide = CONSULTATION_QUESTION_GUIDE.map(q=>`<div class="phrase-card"><span class="txt">"${q}"</span></div>`).join('');
  const cards = GUEST_CARDS_PRACTICE.map(c=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${c.tag}: ${c.name}</p>
      <p style="margin-top:6px;color:var(--ink);font-size:14px;"><b>Goal:</b> ${c.goal}</p>
      <p style="margin-top:4px;color:var(--ink);font-size:14px;"><b>Preference:</b> ${c.preference}</p>
      <p style="margin-top:4px;color:var(--ink);font-size:14px;"><b>Avoid:</b> ${c.avoid}</p>
      <p style="margin-top:4px;color:var(--ink);font-size:14px;"><b>Time:</b> ${c.time}</p>
    </div>`).join('');
  const checklist = CONSULTATION_PRACTICE_CHECKLIST.map((c,i)=>`
    <div class="checklist-row" data-cpc="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${c}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Guided Consultation Practice</h2>
  <p class="section-sub">Student A is staff and asks the question guide below. Student B plays the guest, using the card. Switch roles, then try the second card.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Question Guide (Student A)</h3>
    <div class="phrase-list" style="margin-top:10px;">${guide}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Guest Cards (Student B)</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Answer in character, based on the card, not on what you personally think.</p>
    ${cards}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Practice Checklist</h3>
    <div style="margin-top:10px;">${checklist}</div>
  </div>`;
}
function wireS5b(){
  const rows = document.querySelectorAll('#app .checklist-row');
  const checked = new Set();
  rows.forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.cpc); else checked.delete(row.dataset.cpc);
      if(checked.size >= rows.length) markActivityComplete('s5b', {completionStatus:'reached'});
    });
  });
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
  <div class="section-eyebrow">Section 8</div>
  <h2 class="section-title">Model Consultation</h2>
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
        <div class="play-label">PLAY THE CONSULTATION</div>
        <div class="play-sub" id="s6status">Ploy holds a wellness consultation with Khun Aing.</div>
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
        ? (VoiceEngine.isPaused() ? 'Paused' : 'Playing the consultation…')
        : 'Ploy holds a wellness consultation with Khun Aing.';
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
      <div class="checklist-lbl">${a.strategy}<span style="display:block;font-weight:400;color:var(--muted);font-size:12.5px;margin-top:2px;">${a.example}</span></div>
    </div>`).join('');
  const weakCards = WEAK_ITINERARIES.map(w=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${w.tag}</p>
      <p style="margin-top:6px;color:var(--ink);font-size:14px;font-family:monospace;">${w.plan}</p>
      <p style="margin-top:8px;color:var(--muted);font-size:12.5px;">${w.hint}</p>
    </div>`).join('');
  const problemTypes = ITINERARY_PROBLEM_TYPES.map(t=>`<li>${t}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">After Listening</h2>
  <p class="section-sub">With a partner, discuss: what did Ploy do well in the consultation? What would you have done differently?</p>
  <div class="panel">
    <p style="color:var(--muted);font-size:13.5px;">Talk it through together. This isn't graded, but it's how you build real speaking fluency before the practice sections ahead.</p>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Script Analysis</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">These are real strategies used by professional wellness consultants worldwide. Click each one once you can point to where it happened in the consultation.</p>
    <div style="margin-top:10px;">${rows}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Optional Extension: Spot the Problem <span style="font-family:var(--font-display);font-size:11px;letter-spacing:.06em;color:var(--teal);background:rgba(0,0,0,0.04);border-radius:999px;padding:3px 10px;margin-left:6px;vertical-align:middle;">OPTIONAL</span></h3>
    <p style="color:var(--muted);font-size:13px;margin-top:6px;">These two sample itineraries are weak. With a partner, find the problem in each one. It's one of these four types:</p>
    <ul style="margin-top:8px;padding-left:20px;line-height:1.8;font-size:13.5px;color:var(--ink);">${problemTypes}</ul>
    <div style="margin-top:12px;">${weakCards}</div>
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

/* ===== Section 6b: Build the Guest's Wellness Day =====
   SOLO constraint-scheduling task (see the header comment above
   GUEST_PROFILE/ACTIVITIES/CONSTRAINTS in data.js for the full rationale).
   RoleLock (js/role-lock.js) is never called from this unit any more — this
   is a genuine build → check → adjust loop, not a two-device info-gap. */
function renderS6b(){
  const prefs = GUEST_PROFILE.preferences.map(p=>`<li>${p}</li>`).join('');
  const checkQs = S6B_CHECK_QUESTIONS.map((q,i)=>`
    <div class="sit-card" data-s6bq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${q.q}</p>
      <div class="choices">
        ${q.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-s6bqfb="${i}"></div>
    </div>`).join('');

  const activityCards = ACTIVITIES.map(a=>`
    <div class="role-card" data-open-act="${a.id}">
      ${a.img ? `<img class="section-photo" src="${a.img}" alt="A photo showing ${a.name}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;object-position:center;border-radius:10px;margin-bottom:10px;">` : ''}
      <div class="icon">${a.icon}</div>
      <h4>${a.name}${a.fixed ? ' <span style="color:var(--orange-deep);font-size:11px;">(FIXED)</span>' : ''}</h4>
      <div class="role-body">
        <div style="margin-bottom:6px;">Duration: ${a.duration} min${a.suitsGoal===false ? " · doesn't match the guest's goal" : ''}</div>
        ${a.availability.map(w=>`<div>${w.start} to ${w.end}: <b style="color:${w.status==='fully booked' ? 'var(--danger)' : 'var(--green-safe)'};">${w.status}</b></div>`).join('')}
      </div>
    </div>`).join('');

  const constraintsList = CONSTRAINTS.map((c,i)=>`
    <div class="checklist-row" data-constraint="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${c}</div>
    </div>`).join('');

  const buildCards = ACTIVITIES.map(a=>`
    <div class="big-choice" data-plan-act="${a.id}" style="min-height:auto;align-items:stretch;text-align:left;cursor:default;">
      <div class="bc-lbl" style="font-weight:700;color:var(--navy);">${a.icon} ${a.name}</div>
      <div style="display:grid;gap:6px;margin-top:8px;width:100%;">
        ${a.availability.map((w,wi)=>`
        <button class="tb-btn planAddBtn" data-act="${a.id}" data-win="${wi}" style="justify-content:space-between;width:100%;">
          <span>${w.start} to ${w.end}</span><span style="font-size:11px;">${w.status}</span>
        </button>`).join('')}
      </div>
    </div>`).join('');

  return `
  <div class="section-eyebrow">Section 10</div>
  <h2 class="section-title">Build a Wellness Day</h2>
  <p class="section-sub">Design a day for one guest, working within her real goals and her real limits.</p>

  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">1. Understand the Guest's Needs</h3>
    <div class="sit-card" style="margin-top:12px;">
      <p style="font-weight:700;color:var(--navy);">${GUEST_PROFILE.name}</p>
      <p style="margin-top:6px;color:var(--ink);"><b>Goal:</b> ${GUEST_PROFILE.goal}</p>
      <ul style="margin-top:8px;padding-left:20px;color:var(--ink);line-height:1.7;">${prefs}</ul>
      <p style="margin-top:8px;color:var(--ink);"><b>Time limit:</b> ${GUEST_PROFILE.timeLimit}</p>
      <p style="margin-top:4px;color:var(--ink);"><b>Arrival:</b> ${GUEST_PROFILE.arrival}</p>
    </div>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Quick Check</h3>
    ${checkQs}
  </div>

  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">2. Check the Options</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Click a card to see its duration and availability.</p>
    <div class="role-grid" style="margin-top:14px;">${activityCards}</div>
  </div>

  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">3. Consider the Constraints</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Tick each one off once you've read it.</p>
    <div style="margin-top:10px;">${constraintsList}</div>
  </div>

  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">4. Build &amp; Adjust the Program</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Click a time slot to add it to My Wellness Day. Click it again to remove it, or pick a different slot for the same activity to swap.</p>
    <div class="big-choice-grid" id="planSource" style="margin-top:14px;">${buildCards}</div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:22px;">My Wellness Day</h3>
    <ol class="rank-list" id="planList"></ol>
    <p class="rank-empty-note" id="planEmpty">Click a time slot above to add it here.</p>
    <button class="reveal-btn" id="planCheck" style="margin-top:14px;">Check My Day</button>
    <div class="feedback" id="planFeedback"></div>
  </div>`;
}
function wireS6b(){
  /* Step 1: comprehension gate */
  const s6bAnswered = new Set();
  S6B_CHECK_QUESTIONS.forEach((q,i)=>{
    const box = document.querySelector(`[data-s6bq="${i}"] .choices`);
    const fb = document.querySelector(`[data-s6bqfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === q.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else { btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Not quite. Look at the guest profile again.'; }
      s6bAnswered.add(i);
    });
  });

  /* Step 2: activity cards — informational only, no scoring */
  document.querySelectorAll('#app [data-open-act]').forEach(card=>{
    card.addEventListener('click', ()=> card.classList.toggle('open'));
  });

  /* Step 3: constraints checklist */
  const readConstraints = new Set();
  document.querySelectorAll('#app [data-constraint]').forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) readConstraints.add(row.dataset.constraint); else readConstraints.delete(row.dataset.constraint);
    });
  });

  /* Step 4: build → check → adjust */
  const plan = []; // {actId, winIdx}
  const list = document.getElementById('planList');
  const emptyNote = document.getElementById('planEmpty');
  const fb = document.getElementById('planFeedback');
  const toMin = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };

  function renderPlan(){
    list.innerHTML = plan.map(p=>{
      const act = ACTIVITIES.find(a=>a.id===p.actId);
      const win = act.availability[p.winIdx];
      return `<li>${act.icon} <b>${act.name}</b>: ${win.start} to ${win.end}</li>`;
    }).join('');
    emptyNote.style.display = plan.length ? 'none' : 'block';
    document.querySelectorAll('#app .planAddBtn').forEach(btn=>{
      const isSel = plan.some(p=>p.actId===btn.dataset.act && p.winIdx===+btn.dataset.win);
      btn.classList.toggle('primary', isSel);
    });
  }

  document.querySelectorAll('#app .planAddBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const actId = btn.dataset.act, winIdx = +btn.dataset.win;
      const existing = plan.find(p=>p.actId===actId);
      if(existing && existing.winIdx===winIdx){
        plan.splice(plan.indexOf(existing),1);
      } else {
        if(existing) plan.splice(plan.indexOf(existing),1); // swap this activity's chosen slot
        plan.push({actId, winIdx});
      }
      fb.className = 'feedback';
      renderPlan();
    });
  });

  document.getElementById('planCheck').addEventListener('click', ()=>{
    if(!plan.length){
      fb.className = 'feedback show meh';
      fb.textContent = 'Add at least one activity to the day first.';
      return;
    }
    const violations = [];
    if(!plan.some(p=>p.actId==='lunch')){
      violations.push('Lunch at 12:30 is fixed and required. Add the Wellness Lunch to your day.');
    }
    plan.forEach(p=>{
      const act = ACTIVITIES.find(a=>a.id===p.actId);
      const win = act.availability[p.winIdx];
      if(win.status === 'fully booked'){
        const alt = act.availability.find(w=>w.status==='available');
        violations.push(`${act.name} at ${win.start} to ${win.end} is fully booked.${alt ? ` Try ${alt.start} to ${alt.end} instead.` : ''}`);
      }
      if(toMin(win.start) < toMin(GUEST_PROFILE.arrival)){
        violations.push(`${act.name} starts at ${win.start}, before the guest even arrives at ${GUEST_PROFILE.arrival}.`);
      }
      if(toMin(win.end) > toMin('15:00')){
        violations.push(`${act.name} finishes at ${win.end}, after the guest's 15:00 departure.`);
      }
      if(act.suitsGoal === false){
        violations.push(`${act.name} is high-intensity and doesn't match the guest's preference for gentle movement.`);
      }
    });
    /* Note: no pairwise "overlap" check here on purpose. Several
       availability windows (e.g. the Quiet Garden's 10:15-15:00) describe
       a broad window an activity could be PLACED in, not the activity's
       actual duration occupying that whole range — treating the full
       window as a reserved block would falsely flag valid combinations. */

    if(violations.length){
      fb.className = 'feedback show meh';
      fb.innerHTML = violations.map(v=>`&bull; ${v}`).join('<br>');
      return;
    }
    if(s6bAnswered.size < S6B_CHECK_QUESTIONS.length || readConstraints.size < CONSTRAINTS.length){
      fb.className = 'feedback show meh';
      fb.textContent = "This day plan works! Before it counts as complete, answer the Quick Check above and tick off all the constraints.";
      return;
    }
    fb.className = 'feedback show good';
    fb.textContent = "This day works. It fits the guest's goal, respects every constraint, and gets her out by 15:00.";
    markActivityComplete('s6b', {score: `${plan.length} activities, valid day`});
  });
}

/* ===== Section 8: Explain the Wellness Day =====
   Student A explains the day plan built in Section 9 out loud. Student B
   plays the guest and asks the two scripted follow-up questions below,
   while the class ticks the explanation checklist together. */
function renderS8(){
  const checklist = EXPLANATION_CHECKLIST.map((c,i)=>`
    <div class="checklist-row" data-ec="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${c}</div>
    </div>`).join('');
  const followups = FOLLOWUP_QUESTIONS.map(q=>`<div class="phrase-card"><span class="txt">"${q}"</span></div>`).join('');
  const scenarios = CHALLENGE_SCENARIOS.map(s=>`
    <div class="phrase-card"><span class="txt"><b>${s.tag}:</b> ${s.text}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 11</div>
  <h2 class="section-title">Explain and Confirm</h2>
  <p class="section-sub">Student A explains the day plan they built in Section 10 out loud, then confirms it. Student B plays the guest and asks the follow-up questions below.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Student B: Ask These</h3>
    <div class="phrase-list" style="margin-top:10px;">${followups}</div>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Explanation Checklist</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Check off each item once Student A has covered it, then switch roles and go again.</p>
    <div style="margin-top:10px;">${checklist}</div>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Extra Challenge</h3>
    <div class="phrase-list" style="margin-top:10px;">${scenarios}</div>
  </div>`;
}
function wireS8(){
  const rows = document.querySelectorAll('#app .checklist-row');
  const checked = new Set();
  rows.forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.ec); else checked.delete(row.dataset.ec);
      if(checked.size >= rows.length) markActivityComplete('s8', {completionStatus:'reached'});
    });
  });
}

/* ===== Vocabulary Identification (Remember-level, replaces the crossword slot) =====
   Same objective as the old crossword (recall this unit's 10 key words), a
   different mechanic: read the word, then identify its correct definition
   among 4 options, the reverse direction of Unit 9's Vocabulary Race. */
function renderCrossword(){
  return `
  <div class="section-eyebrow">Section 12</div>
  <h2 class="section-title">Vocabulary Identification</h2>
  <p class="section-sub">Read the word. Identify its correct definition.</p>
  <div class="panel">
    <div class="race-progress" id="idProgress">Word 1 of ${VOCAB.length}</div>
    <p id="idWord" style="font-weight:700;color:var(--navy);font-size:22px;margin-top:14px;font-family:'Oswald';"></p>
    <div class="choices" id="idChoices" style="margin-top:14px;"></div>
    <div class="feedback" id="idFeedback"></div>
  </div>`;
}
function wireCrossword(){
  const order = shuffle(VOCAB);
  let idx = 0, correct = 0;
  const progressEl = document.getElementById('idProgress');
  const wordEl = document.getElementById('idWord');
  const choicesEl = document.getElementById('idChoices');
  const fb = document.getElementById('idFeedback');

  function showQuestion(){
    if(idx >= order.length){
      progressEl.textContent = 'Done';
      wordEl.textContent = `Finished! ${correct}/${order.length} correct.`;
      choicesEl.innerHTML = '';
      fb.className = 'feedback';
      markActivityComplete('crossword', {score:`${correct}/${order.length}`});
      return;
    }
    const item = order[idx];
    progressEl.textContent = `Word ${idx+1} of ${order.length}`;
    wordEl.textContent = item.nm;
    const distractors = shuffle(VOCAB.filter(v=>v.id!==item.id)).slice(0,3);
    const opts = shuffle([item, ...distractors]);
    choicesEl.innerHTML = opts.map(o=>`<button class="choice-btn" data-id="${o.id}">${o.def}</button>`).join('');
    fb.className = 'feedback';
  }
  choicesEl.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    const item = order[idx];
    if(btn.dataset.id === item.id){ correct++; fb.className='feedback show good'; fb.textContent='Correct!'; }
    else { fb.className='feedback show meh'; fb.textContent=`Not quite. It was "${item.def}"`; }
    idx++;
    setTimeout(showQuestion, 700);
  });
  showQuestion();
}

function renderPractice(){
  const checklist = PEER_CHECKLIST.map((c,i)=>`
    <div class="checklist-row" data-chk="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${c}</div>
    </div>`).join('');
  const bonus = DIFFICULT_GUEST_CASES.map(s=>`
    <div class="sit-card">
      ${s.img ? `<img class="section-photo" src="${s.img}" alt="A photo illustrating ${s.tag}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;object-position:center;border-radius:12px;margin-bottom:10px;">` : ''}
      <span class="txt"><b>${s.tag}:</b> ${s.text}</span>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 13</div>
  <h2 class="section-title">Peer Checklist &amp; Bonus</h2>
  <p class="section-sub">Evaluate your partner's consultation. Check off each item as you observe it.</p>
  <div class="panel">
    ${checklist}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Optional Extension: Difficult Guest Cases <span style="font-family:var(--font-display);font-size:11px;letter-spacing:.06em;color:var(--teal);background:rgba(0,0,0,0.04);border-radius:999px;padding:3px 10px;margin-left:6px;vertical-align:middle;">OPTIONAL</span></h3>
    <p style="color:var(--muted);font-size:13px;margin-top:6px;">Choose ONE case below and role-play it using the Useful Phrases from Section 6. Try this anytime. It's also in the Practice Hub.</p>
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
  <div class="section-eyebrow">Section 14</div>
  <h2 class="section-title">Writing Task</h2>
  <p class="section-sub">${WRITING_TASK.prompt}</p>
  <div class="panel">
    <div class="email-template">
      <p>Team,</p>
      <textarea id="s9writing" class="challenge-textarea" rows="5" style="margin-top:14px;" placeholder="Write your 4 to 6 sentence handover note here..."></textarea>
      <p style="margin-top:24px;">Thank you for confirming this with the guest on your shift.</p>
      <p style="margin-top:10px;">Best,<br>Wellness Consultation Team</p>
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
      fb.textContent = 'Nice work. That reads like a real internal update.';
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
  <div class="section-eyebrow">Section 15</div>
  <h2 class="section-title">Self-Check</h2>
  <p class="section-sub">Rate yourself honestly. Your teacher remains the final evaluator.</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this lesson, you should feel more confident running a real wellness consultation: asking the right questions, recommending activities that fit, and confirming the plan out loud.</p>
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
    <div class="cover-badge">UNIT 10 COMPLETE</div>
    <h1>You can <span>run the consultation.</span></h1>
    <p>Keep practicing the loop: ask, recommend, explain, adjust, confirm, and remember: understand the goal before you plan around it.</p>
    <div class="complete-actions">
      <button class="tb-btn" id="completePracticeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('rotateCcw',{size:16})}</span> Practice Again</button>
      <button class="tb-btn" id="completeHomeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('home',{size:16})}</span> Back to Start</button>
      <a class="tb-btn" id="completeUnitsBtn" href="../index.html" style="padding:16px 26px;font-size:15px;">All Wellness Units</a>
    </div>
    <div class="complete-stats" id="completeStats"></div>
  </div>`;
}
let lessonCompleteSent = false;
function wireComplete(){
  document.getElementById('completePracticeBtn').addEventListener('click', ()=> goTo(12));
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
  {r:renderS5b, w:wireS5b},
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
