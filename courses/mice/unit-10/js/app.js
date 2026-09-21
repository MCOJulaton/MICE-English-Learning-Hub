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
   Two roles, matching the good-call script's two characters: Ploy
   ('staff', an Information Desk team member, British English female) and
   Doctor Narin ('delegate', the caller). Doctor Narin's voice defaults to
   Karen (en-AU, female) — confirmed and set as the permanent default after
   live testing found it clearer than the auto-picked British voices on
   this device. The Web Speech API can't produce a genuine Thai accent, so
   the two characters are distinguished by picking two genuinely different
   underlying voices, plus a mild pitch/rate offset (never pitch alone) as
   a fallback — never a large pitch swing, which tends to sound more
   robotic, not less. QUALITY_NAME_HINTS nudges the picker toward whichever
   installed voices are actually the most natural-sounding (Chrome's
   network "Google UK English" voices, or an OS's "Enhanced"/"Premium"/
   "Natural" voices), since voice quality itself is set by the browser/OS
   the page runs on, not by this code — a classroom Chrome with only
   legacy voices installed will still sound more robotic than one with
   better voices available. Same novelty-voice-exclusion pattern
   established for Unit 9's own copy. */
const VoiceEngine = (function(){
  let allVoices = [];
  let staffVoice = null, delegateVoice = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  /* Manual override for Doctor Narin's voice: automatic name/quality hints
     can still land on a voice that's technically "installed" but renders
     at low quality on a given device (some OSes list a persona voice
     before its high-quality data is actually downloaded). This lets a
     teacher browse whatever English voices ARE installed and pick one
     directly, saved per device — same pattern as Unit 9's ukMale picker. */
  let delegateOverrideURI = null;
  try { delegateOverrideURI = localStorage.getItem('mice_u10_delegateVoiceURI') || null; } catch(e){}

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
    /* Ploy: British English female. */
    const ukFemaleVoice = pickFrom(goodVoices,'en-GB','en',FEMALE_NAME_HINTS)
                        || goodVoices.find(v => /^en-gb$/i.test(v.lang))
                        || pickFrom(allVoices,'en-GB','en',FEMALE_NAME_HINTS)
                        || goodVoices.find(v => /^en/i.test(v.lang))
                        || goodVoices[0] || allVoices[0] || null;
    /* Doctor Narin: Karen (en-AU) is the confirmed, preferred default,
       checked for by name first. Falls back to a genuinely different
       en-GB female voice (so the two are distinguishable by ear, not just
       by pitch) only on devices where Karen isn't installed. The manual
       picker below remains available as a further escape hatch. */
    const karenVoice = goodVoices.find(v => /\bkaren\b/i.test(v.name));
    const ukFemaleVoice2 = karenVoice
                        || goodVoices.find(v => /^en-gb$/i.test(v.lang) && FEMALE_NAME_HINTS.test(v.name) && (!ukFemaleVoice || v.name !== ukFemaleVoice.name))
                        || ukFemaleVoice; // no second distinct voice on this runtime — reuse Ploy's voice, pitch/rate differentiates
    const manualOverride = delegateOverrideURI ? allVoices.find(v => v.voiceURI === delegateOverrideURI) : null;
    staffVoice = ukFemaleVoice;
    delegateVoice = manualOverride || ukFemaleVoice2;
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
    /* A rate offset alongside the pitch offset, so the two characters are
       never told apart by pitch alone — and both offsets stay mild, since
       a big pitch swing is what makes browser TTS sound like a cartoon. */
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
    stop(){ window.speechSynthesis.cancel(); playing=false; paused=false; queue=[]; queueIndex=0; onStateChange(); },
    getEnglishVoices(){ return allVoices.filter(v => /^en/i.test(v.lang)); },
    getDelegateVoiceURI(){ return delegateVoice ? delegateVoice.voiceURI : null; },
    setDelegateVoice(voiceURI){
      delegateOverrideURI = voiceURI || null;
      try {
        if(delegateOverrideURI) localStorage.setItem('mice_u10_delegateVoiceURI', delegateOverrideURI);
        else localStorage.removeItem('mice_u10_delegateVoiceURI');
      } catch(e){}
      refresh();
    }
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
    <h1>The phone rings. <span>How you answer it is the job.</span></h1>
    <p>Unit 10: Answering the Phone at the Information Desk. Learn the seven-step call, the right words for every stage, and how to sound calm and professional from hello to goodbye.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Greet</div>
      <div class="signchip"><span class="arrow">→</span> Clarify</div>
      <div class="signchip"><span class="arrow">→</span> Check or Hold</div>
      <div class="signchip"><span class="arrow">→</span> Close</div>
    </div>
    <button class="startbtn" onclick="goNext()">Answer the phone →</button>
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
  <h2 class="section-title">Your First Call of the Day</h2>
  <p class="section-sub">A caller asks about their session, and it goes wrong fast. Read the call, then decide what should have happened differently.</p>
  <div class="panel">
    <div class="sit-card">${dialogueHtml}</div>
    <div class="scenario-message">${OPENING_SCENARIO.message}</div>
    <p style="font-weight:700;color:var(--navy);margin-top:16px;">${OPENING_SCENARIO.question}</p>
    <p style="color:var(--muted);font-size:12.5px;margin-top:2px;">More than one answer can be reasonable. Choose everything you think is a good idea.</p>
    <div class="choices" id="scenarioChoices" style="margin-top:14px;">${options}</div>
    <div class="feedback" id="scenarioFeedback" style="display:block;"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Let's Start the Shift</h3>
    <p class="section-sub" style="margin-top:4px;">Before the desk opens, listen to today's information rundown. Fill in the table as you listen, then reveal the answers to check yourself.</p>
    <div class="playbar" style="margin-top:16px;">
      <button class="play-btn" id="s1play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY TODAY'S RUNDOWN</div>
        <div class="play-sub" id="s1status">Listen for: the time, the information point, and where it's confirmed.</div>
      </div>
      <button class="tb-btn" id="s1replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
    </div>
    <table class="dictation-table" id="s1table">
      <thead><tr><th>Time</th><th>Information Point</th><th>Where to Find It</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <button class="reveal-btn" id="s1reveal" style="margin-top:14px;">Show answers</button>
    <div class="model-answer" id="s1answers">
      ${WARMUP_SCHEDULE.map(w=>`<div>${w.time} · ${w.point} · ${w.where}</div>`).join('')}
    </div>
    <hr class="hairline">
    <h3 style="font-size:16px;color:var(--navy);">Every Call Starts the Same Way</h3>
    <p style="color:var(--ink);margin-top:8px;line-height:1.6;font-size:14.5px;">For many callers, this is their very first contact with the whole event, before they've even met a staff member in person. A confident, professional first ten seconds sets the tone for everything after it, even when the answer takes a moment to find.</p>
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
  const idleStatus = "Listen for: the time, the information point, and where it's confirmed.";
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

/* Turns "[[id:Label]]" tokens in PHONE_GUIDE strings into clickable terms
   looked up against VOCAB by id — this is how Section 2 teaches the 10
   words in real context instead of as a flat glossary. */
function vocabTermize(text){
  return text.replace(/\[\[(\w+):([^\]]+)\]\]/g, (m, id, label) =>
    `<span class="vocab-term" data-id="${id}" style="color:var(--teal);font-weight:700;cursor:pointer;border-bottom:2px dotted var(--teal);padding:0 1px;border-radius:2px;">${label}</span>`);
}
function renderS2(){
  const stepsHtml = PHONE_GUIDE.steps.map(s=>`<li style="margin-top:10px;line-height:1.7;color:var(--ink);font-size:14.5px;">${vocabTermize(s)}</li>`).join('');
  const secondary = VOCAB_SECONDARY.map(v=>`
    <div class="secondary-word"><b>${v.nm}:</b> ${v.def}</div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">How We Answer the Phone</h2>
  <p class="section-sub">Ten words you'll use constantly on the phone, shown the way real Information Desk staff actually use them. Click any highlighted word to see what it means.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">What</h3>
    <p style="color:var(--ink);margin-top:6px;line-height:1.7;font-size:14.5px;">${vocabTermize(PHONE_GUIDE.what)}</p>
    <h3 style="font-size:15px;color:var(--navy);margin-top:18px;">Why It Matters</h3>
    <p style="color:var(--ink);margin-top:6px;line-height:1.7;font-size:14.5px;">${vocabTermize(PHONE_GUIDE.why)}</p>
    <h3 style="font-size:15px;color:var(--navy);margin-top:18px;">How: The Real Steps</h3>
    <ol style="margin-top:6px;padding-left:20px;">${stepsHtml}</ol>
    <hr class="hairline">
    <div class="sit-card" id="s2wordpanel">
      <p style="color:var(--muted);font-size:13.5px;">Click a highlighted word above to see its meaning here.</p>
    </div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy)">Quick Check</h3>
    <p id="s2question" style="font-weight:700;color:var(--orange-deep);margin-top:6px;"></p>
    <p style="color:var(--muted);font-size:13px;">Click the matching highlighted word in the guide above.</p>
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

/* ===== Section 2b: Put the Steps in Order (sequencing) ===== */
function renderS2b(){
  const shuffled = shuffle(SEQUENCE_STEPS.map((s,i)=>({text:s.text, origIndex:i})));
  const items = shuffled.map(s=>`<div class="big-choice" data-orig="${s.origIndex}" style="min-height:70px;"><div class="bc-lbl">${s.text}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Put the Steps in Order</h2>
  <p class="section-sub">Click each step in the order you would actually do it, handling an information request.</p>
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
  <p class="section-sub">Read the article below. Think about how these ideas apply to the phone role-plays in Section 10.</p>
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
  <p class="section-sub">The phrases information desk staff use, organized by moment.</p>
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

/* Shared markup/wiring for one playbar + transcript, reused for both the
   good call and the poor call so Section 7 doesn't duplicate a whole
   render/wire function for a second script. */
function callBlockHtml(prefix, playLabel, idleStatus, call){
  return `
  <div class="playbar">
    <button class="play-btn" id="${prefix}play" title="Play">${icon('play',{size:20})}</button>
    <div style="flex:1;min-width:180px;">
      <div class="play-label">${playLabel}</div>
      <div class="play-sub" id="${prefix}status">${idleStatus}</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button class="tb-btn" id="${prefix}pause"><span class="icon-inline">${icon('pause',{size:14})}</span> <span class="lbl">Pause</span></button>
      <button class="tb-btn" id="${prefix}resume"><span class="icon-inline">${icon('play',{size:14})}</span> <span class="lbl">Resume</span></button>
      <button class="tb-btn" id="${prefix}replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
      <button class="tb-btn" id="${prefix}slower"><span class="lbl">Slower</span></button>
    </div>
  </div>
  <button class="reveal-btn" id="${prefix}showtranscript" style="margin-top:16px;">Show transcript</button>
  <div class="model-answer" id="${prefix}transcript" style="text-align:left;">
    ${call.lines.map(l=>`<p><b>${l.who}:</b> ${l.text}</p>`).join('')}
  </div>`;
}
/* VoiceEngine only supports a single onChange callback at a time, so with
   two call blocks on one page we wire each block's controls here but let
   the caller (wireS6) register one shared onChange that calls updateUI()
   on both, gated by which prefix is actually active. */
function wireCallBlock(prefix, call, idleStatus, opts={}){
  const statusEl = document.getElementById(`${prefix}status`);
  const playBtn = document.getElementById(`${prefix}play`);
  const pauseBtn = document.getElementById(`${prefix}pause`);
  const resumeBtn = document.getElementById(`${prefix}resume`);
  const replayBtn = document.getElementById(`${prefix}replay`);
  const slowerBtn = document.getElementById(`${prefix}slower`);
  function play(){
    if(opts.onActivate) opts.onActivate();
    VoiceEngine.speakConversation(call.lines);
    if(opts.onPlayed) opts.onPlayed();
  }
  playBtn.addEventListener('click', ()=>{
    if(VoiceEngine.isPlaying() && opts.isActive && opts.isActive()) VoiceEngine.stop(); else play();
  });
  replayBtn.addEventListener('click', play);
  pauseBtn.addEventListener('click', ()=> VoiceEngine.pause());
  resumeBtn.addEventListener('click', ()=> VoiceEngine.resume());
  slowerBtn.addEventListener('click', ()=>{
    VoiceEngine.setSlower(!VoiceEngine.isSlower());
    slowerBtn.classList.toggle('primary', VoiceEngine.isSlower());
    slowerBtn.innerHTML = VoiceEngine.isSlower() ? '<span class="lbl">Slower: On</span>' : '<span class="lbl">Slower</span>';
  });
  document.getElementById(`${prefix}showtranscript`).addEventListener('click', function(){
    document.getElementById(`${prefix}transcript`).classList.add('show');
    this.style.display = 'none';
  });
  return {
    updateUI(isActive){
      const isPlaying = VoiceEngine.isPlaying() && isActive;
      if(statusEl) statusEl.textContent = isPlaying ? (VoiceEngine.isPaused() ? 'Paused' : 'Playing…') : idleStatus;
      if(playBtn){
        playBtn.innerHTML = isPlaying ? icon('stop',{size:20}) : icon('play',{size:20});
        playBtn.title = isPlaying ? 'Stop' : 'Play';
      }
    }
  };
}

function renderS6(){
  const qs = GOOD_CALL_QUESTIONS.map((q,i)=>`
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
  <h2 class="section-title">Listening: Good Call, Poor Call</h2>
  <p class="section-sub">Two short calls. One shows the process done right. One shows how it goes wrong.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Before You Listen</h3>
    <p style="color:var(--ink);margin-top:6px;font-size:14.5px;">${BEFORE_LISTEN.setup}</p>
    <div class="choices" id="predictChoices" style="margin-top:12px;">${guesses}</div>
    <div class="feedback" id="predictFeedback"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">The Good Call</h3>
    <img class="section-photo" src="${SECTION_PHOTOS.goodCall.src}" alt="${SECTION_PHOTOS.goodCall.alt}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;object-position:center;border-radius:12px;margin:10px 0 14px;">
    ${callBlockHtml('s6good', 'PLAY THE GOOD CALL', 'Ploy answers a call about a session room.', GOOD_CALL)}
    <div class="voice-picker-row" style="margin-top:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <label for="s6voicepick" style="font-size:12.5px;color:var(--muted);">If Doctor Narin's voice sounds unclear, pick a different one for her:</label>
      <select id="s6voicepick" style="font-size:12.5px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;max-width:100%;"></select>
      <button class="tb-btn" id="s6voicetest" style="padding:4px 10px;"><span class="lbl">Test</span></button>
    </div>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Listen and Answer</h3>
    ${qs}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">The Poor Call</h3>
    <p style="color:var(--ink);margin-top:6px;font-size:14.5px;">${POOR_CALL.intro} Listen once, all the way through. You'll analyze what went wrong in the next section.</p>
    ${callBlockHtml('s6poor', 'PLAY THE POOR CALL', 'A call about AV setup time.', POOR_CALL)}
    <p style="color:var(--muted);font-size:13px;margin-top:12px;">How do you think this caller feels at the end of the call?</p>
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

  let poorPlayed = false;
  let activePrefix = null;
  const answered = new Set();
  function maybeComplete(){
    if(answered.size >= GOOD_CALL_QUESTIONS.length && poorPlayed){
      markActivityComplete('s6', {score:`${answered.size}/${GOOD_CALL_QUESTIONS.length}`});
    }
  }
  const good = wireCallBlock('s6good', GOOD_CALL, 'Ploy answers a call about a session room.', {
    onActivate: ()=>{ activePrefix = 's6good'; },
    isActive: ()=> activePrefix === 's6good'
  });
  const poor = wireCallBlock('s6poor', POOR_CALL, 'A call about AV setup time.', {
    onActivate: ()=>{ activePrefix = 's6poor'; },
    isActive: ()=> activePrefix === 's6poor',
    onPlayed: ()=>{ poorPlayed = true; maybeComplete(); }
  });

  /* Manual voice picker for Doctor Narin: automatic gender/quality detection
     can still pick a voice that renders poorly on a given device, so this
     lets a teacher browse whatever English voices ARE installed and choose
     one directly, saved per device via VoiceEngine.setDelegateVoice(). */
  const voicePick = document.getElementById('s6voicepick');
  function populateVoicePicker(){
    if(!voicePick) return;
    const voices = VoiceEngine.getEnglishVoices();
    const current = VoiceEngine.getDelegateVoiceURI();
    voicePick.innerHTML = voices.map(v=>
      `<option value="${v.voiceURI}"${v.voiceURI===current?' selected':''}>${v.name} (${v.lang})</option>`
    ).join('');
  }
  voicePick && voicePick.addEventListener('change', ()=>{
    VoiceEngine.setDelegateVoice(voicePick.value);
  });
  const voiceTestBtn = document.getElementById('s6voicetest');
  voiceTestBtn && voiceTestBtn.addEventListener('click', ()=>{
    VoiceEngine.speakLine("Oh, hi. This is Doctor Narin, I'm calling about my session room.", 'delegate');
  });

  VoiceEngine.onChange(()=>{
    good.updateUI(activePrefix === 's6good');
    poor.updateUI(activePrefix === 's6poor');
    populateVoicePicker();
  });
  populateVoicePicker();

  GOOD_CALL_QUESTIONS.forEach((q,i)=>{
    const box = document.querySelector(`[data-lq="${i}"] .choices`);
    const fb = document.querySelector(`[data-lqfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === q.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Correct!'; }
      else { btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Listen again and try once more.'; }
      answered.add(i);
      maybeComplete();
    });
  });
}

function renderS7(){
  const rows = CALL_ANALYSIS.map((a,i)=>`
    <div class="checklist-row" data-strat="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${a.mistake}<span style="display:block;font-weight:400;color:var(--muted);font-size:12.5px;margin-top:2px;">${a.example}</span><span style="display:block;font-weight:600;color:var(--teal);font-size:12.5px;margin-top:4px;">Fix: ${a.fix}</span></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 8</div>
  <h2 class="section-title">After Listening: Spot the Mistakes</h2>
  <p class="section-sub">With a partner, discuss: what went wrong in the poor call? How does each mistake compare to what Ploy did in the good call?</p>
  <div class="panel">
    <p style="color:var(--muted);font-size:13.5px;">Talk it through together. This isn't graded, but it's how you build real speaking fluency before the role-play cards.</p>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Call Analysis</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Four real mistakes from the poor call, with the professional fix for each. Click each one once you can point to where it happened.</p>
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

/* ===== Section 6b: Complete the Master Sheet =====
   PAIR information-gap task using the shared RoleLock component
   (js/role-lock.js). Each partner commits to one role once; from then on
   only that role's half of the schedule is ever rendered on their device,
   a real fix for the old same-screen A/B toggle that let one student
   click through both halves solo. They ask each other for the missing
   half out loud, then both converge on the same combined master-sheet
   reveal to self-check. */
const S6B_STORAGE_KEY = 'mice_u10_s6b_role';
function renderS6b(){
  const lock = RoleLock.init(S6B_STORAGE_KEY, S6B_ROLES);
  const rowsFull = MASTER_SHEET_FULL.map(s=>`<div class="schedule-row updated"><span class="schedule-time">${s.time}</span><span class="schedule-session">${s.session}</span><span class="schedule-status">${s.room}</span></div>`).join('');
  const convergence = `
    <hr class="hairline">
    <button class="reveal-btn" id="masterReveal">Show the combined master sheet</button>
    <div class="model-answer" id="masterAnswer">
      <div class="schedule-board">${rowsFull}</div>
    </div>`;

  const badge = `<span style="font-family:var(--font-display);font-size:11px;letter-spacing:.06em;color:var(--teal);background:rgba(0,0,0,0.04);border-radius:999px;padding:3px 10px;margin-left:6px;vertical-align:middle;">OPTIONAL · ADVANCED</span>`;
  if(!lock.myRole){
    return `
    <div class="section-eyebrow">Section 9</div>
    <h2 class="section-title">Complete the Master Sheet ${badge}</h2>
    <p class="section-sub">Advanced/bonus. This is the colleague cross-check skill, useful when two desks disagree, but it's the advanced case, not the core skill of this unit. Pair speaking. Student A has the morning schedule. Student B has the afternoon schedule.</p>
    <img class="section-photo" src="${SECTION_PHOTOS.masterSheet.src}" alt="${SECTION_PHOTOS.masterSheet.alt}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;object-position:center;border-radius:12px;margin-bottom:14px;">
    ${RoleLock.renderPicker(S6B_STORAGE_KEY, S6B_ROLES, "Which schedule did your teacher assign you?")}`;
  }

  const role = S6B_ROLES[lock.myRole];
  const rows = role.rows.map(s=>`<div class="schedule-row"><span class="schedule-time">${s.time}</span><span class="schedule-session">${s.session}</span><span class="schedule-status">${s.room}</span></div>`).join('');
  const phrases = role.phrases.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">Complete the Master Sheet ${badge}</h2>
  <p class="section-sub">Advanced/bonus. This is the colleague cross-check skill, useful when two desks disagree, but it's the advanced case, not the core skill of this unit. Pair speaking. Student A has the morning schedule. Student B has the afternoon schedule.</p>
  <div class="panel">
    <h3 style="color:var(--navy);font-size:16px;">${role.heading}</h3>
    <p>${role.instructions}</p>
    <div class="schedule-board" style="margin-top:14px;">${rows}</div>
    <div class="phrase-list" style="margin-top:16px;">${phrases}</div>
    ${convergence}
    ${RoleLock.renderLockedFooter(S6B_STORAGE_KEY)}
  </div>`;
}
function wireS6b(){
  RoleLock.wire(S6B_STORAGE_KEY, S6B_ROLES);
  const revealBtn = document.getElementById('masterReveal');
  if(revealBtn){
    revealBtn.addEventListener('click', ()=>{
      document.getElementById('masterAnswer').classList.add('show');
      markActivityComplete('s6b', {score: `role ${sessionStorage.getItem(S6B_STORAGE_KEY)} completed`});
    });
  }
}

function renderS8(){
  const cards = DESK_CHALLENGES.map(c=>{
    const steps = c.steps.map((s,i)=>`
      <div class="checklist-row" data-challenge="${c.id}" data-step="${i}">
        <div class="checklist-box">✓</div>
        <div class="checklist-lbl">${s}</div>
      </div>`).join('');
    return `
    <div class="sit-card">
      ${c.img ? `<img class="section-photo" src="${c.img}" alt="A photo illustrating the ${c.title} scenario" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;object-position:center;border-radius:12px;margin-bottom:10px;">` : ''}
      <p style="font-weight:700;color:var(--navy);">${c.tag}: ${c.title}</p>
      <p style="margin-top:8px;color:var(--ink);font-size:14.5px;"><b>Caller:</b> "${c.delegateLine}"</p>
      <p style="margin-top:4px;color:var(--muted);font-size:13.5px;">${c.complication}</p>
      ${c.tip ? `<p style="margin-top:8px;color:var(--teal);font-size:13px;font-weight:600;">${c.tip}</p>` : ''}
      <div style="margin-top:12px;">${steps}</div>
    </div>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 10</div>
  <h2 class="section-title">Delegate Information Desk Challenge</h2>
  <p class="section-sub">Student A is a caller with a question. Student B is Information Desk staff. Act out each card using the 7-step call process from Section 3, deciding whether to answer it yourself, transfer, or take a message, then check off each step as you do it. Switch roles and go again.</p>
  <div class="panel">
    ${cards}
  </div>`;
}
function wireS8(){
  const rows = document.querySelectorAll('#app .checklist-row');
  const checked = new Set();
  rows.forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      const key = `${row.dataset.challenge}-${row.dataset.step}`;
      if(row.classList.contains('checked')) checked.add(key); else checked.delete(key);
      if(checked.size >= rows.length) markActivityComplete('s8', {completionStatus:'reached'});
    });
  });
}

/* ===== Vocabulary Identification (Remember-level, replaces the crossword slot) =====
   Same objective as the old crossword (recall this unit's 10 key words), a
   different mechanic: read the word, then identify its correct definition
   among 4 options — the reverse direction of Unit 9's Vocabulary Race. */
function renderCrossword(){
  return `
  <div class="section-eyebrow">Section 11</div>
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
    else { fb.className='feedback show meh'; fb.textContent='Not quite. Look again.'; }
    idx++;
    setTimeout(showQuestion, 500);
  });
  showQuestion();
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
  <p class="section-sub">Evaluate your partner's phone call. Check off each item as you observe it.</p>
  <div class="panel">
    ${checklist}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Optional Bonus: Handle Another Call <span style="font-family:var(--font-display);font-size:11px;letter-spacing:.06em;color:var(--teal);background:rgba(0,0,0,0.04);border-radius:999px;padding:3px 10px;margin-left:6px;vertical-align:middle;">OPTIONAL</span></h3>
    <p style="color:var(--muted);font-size:13px;margin-top:6px;">Choose ONE situation below and practice it using the Useful Phrases from Section 6. Try this anytime. It's also in the Practice Hub.</p>
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
      <p>Team,</p>
      <textarea id="s9writing" class="challenge-textarea" rows="5" style="margin-top:14px;" placeholder="Write your 4 to 6 sentence update here..."></textarea>
      <p style="margin-top:24px;">Thank you for relaying this to your desk.</p>
      <p style="margin-top:10px;">Best,<br>Information Desk Team</p>
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
      fb.textContent = 'Nice work. That reads like a real team update.';
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
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this lesson, you should feel more confident answering the phone: greeting, clarifying, deciding, and closing every call professionally.</p>
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
    <h1>You can <span>answer the phone.</span></h1>
    <p>Keep practicing the seven steps, greet, clarify, decide, respond, close, and remember: check before you answer, don't guess.</p>
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
