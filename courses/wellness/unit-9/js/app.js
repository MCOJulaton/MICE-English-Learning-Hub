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

const TRACKED_ACTIVITIES = ['s1','s2','s2b','s3','s4','s5','s6','s7','s6b','s8','surprise','crossword','practice','s9','s10','exit'];

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
  saveCheckinState();
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
  el.innerHTML = `<b>${Progress.studentName}</b> · ${completedCount()}/${TRACKED_ACTIVITIES.length} done <button type="button" id="studentSwitchBtn" class="student-switch-btn" title="Not you? Check in again">Switch</button>`;
  const switchBtn = document.getElementById('studentSwitchBtn');
  if(switchBtn) switchBtn.addEventListener('click', resetCheckin);
}

/* ===================== RESUME IF THE PAGE RELOADS OR CLOSES =====================
   Saves check-in + current section to this browser only (localStorage), scoped to
   this unit, so an accidental reload/back/close picks up where you left off instead
   of showing the check-in gate again. Expires at midnight so it still asks a fresh
   check-in next class rather than skipping it forever on a shared computer. */
const CHECKIN_STORAGE_KEY = 'wellness_u9_checkin';
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
    saveCheckinState();
    applyDeepLinkAfterCheckin();
    setTimeout(()=>{ gate.style.display='none'; }, 900);
  });
}

/* ===================== VOICE ENGINE =====================
   Two named characters: Mai (wellness concierge, default British female
   voice) and Mrs. Andersen (guest, American female voice via 'delegate').
   Includes a novelty-voice exclusion list and a pitch safety net, ported
   from the fix already applied to the MICE/Wellness Integrated Listening
   Challenge apps, so this file doesn't reintroduce the gender-mismatch/
   robotic-voice bug those units had before that fix. */
const VoiceEngine = (function(){
  let allVoices = [];
  let staffVoice = null, delegateVoice = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const FEMALE_NAME_HINTS = /\b(kate|serena|stephanie|fiona|hazel|libby|sonia|olivia|amy|emma|joanna|moira|tessa|karen|susan|zira|samantha|victoria|ava|allison|zoe|nicky|jenny|aria|michelle|female)\b/i;
  /* Apple's "personality"-tier voices (Eddy, Flo, Grandma, Grandpa, Reed,
     Rocko, Sandy, Shelley) have exaggerated, characterful prosody — Apple
     itself groups them separately from its standard voices in System
     Settings. They used to be listed as regular gender hints here, which
     meant "Grandma" could get picked as the staff voice — a real bug found
     by testing, not a hypothetical one. Treated as novelty now, same as
     the classic joke voices below. */
  const NOVELTY_NAME_HINTS = /\b(fred|albert|zarvox|whisper|bells|bahh|boing|bubbles|cellos|hysterical|pipe organ|trinoids|wobble|bad news|jester|junior|kathy|princess|ralph|deranged|good news|superstar|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)\b/i;
  /* Signals a modern neural/cloud voice engine (Edge's "Online (Natural)"
     voices, Chrome/Google's cloud voices, Apple's Enhanced/Premium tiers) —
     these sound genuinely natural, unlike the classic robotic local voices
     (e.g. Microsoft Zira/David, plain espeak) that ship by default on many
     Windows machines. Scored highest so a natural voice always wins over a
     name-matched-but-robotic one when both are available. */
  const QUALITY_HINTS = /\b(online \(natural\)|neural|enhanced|premium|natural)\b/i;

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    const notNovelty = v => !NOVELTY_NAME_HINTS.test(v.name);
    const goodVoices = allVoices.filter(notNovelty);
    function scoreVoice(v, loc, lang, genderRe){
      let base;
      if(new RegExp('^'+loc+'$','i').test(v.lang)) base = 100;
      else if(new RegExp('^'+lang+'-','i').test(v.lang)) base = 40;
      else if(/^en/i.test(v.lang)) base = 10;
      else return -1;
      let bonus = 0;
      if(genderRe.test(v.name)) bonus += 8;
      if(QUALITY_HINTS.test(v.name)) bonus += 20;
      return base + bonus;
    }
    function bestVoice(list, loc, lang, genderRe){
      let best = null, bestScore = -1;
      for(const v of list){
        const s = scoreVoice(v, loc, lang, genderRe);
        if(s > bestScore){ bestScore = s; best = v; }
      }
      return best;
    }
    const ukFemaleVoice = bestVoice(goodVoices,'en-GB','en',FEMALE_NAME_HINTS)
                        || bestVoice(allVoices,'en-GB','en',FEMALE_NAME_HINTS)
                        || goodVoices.find(v => /^en/i.test(v.lang))
                        || goodVoices[0] || allVoices[0] || null;
    /* Both speakers are female here, so the delegate voice is a genuinely
       different accent (US) rather than a different gender, with a light
       pitch nudge in makeUtterance() below helping the two stay distinct. */
    const usFemaleVoice = bestVoice(goodVoices,'en-US','en',FEMALE_NAME_HINTS)
                        || bestVoice(allVoices,'en-US','en',FEMALE_NAME_HINTS)
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
    u.rate = (slower ? 0.86 : 1.0);
    /* Both speakers are female here, so a small pitch nudge (not a big
       bend, which reads as more robotic on a synthesized voice) helps
       them stay distinct alongside the genuine UK vs US accent change. */
    u.pitch = kind === 'delegate' ? 1.05 : 1.0;
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

/* Small CORE/EXTENSION/HOMEWORK pill, used to tell a teacher at a glance
   which activities fit a 2-3 hour class vs extra time vs after class. */
function tierTag(tier){
  const label = tier==='core' ? 'CORE' : tier==='extension' ? 'EXTENSION' : 'HOMEWORK';
  return `<span class="tier-tag ${tier}">${label}</span>`;
}

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">WELLNESS TOURISM MANAGEMENT PROGRAM</div>
    <h1>Every guest is curious. <span>Can you explain it well?</span></h1>
    <p>Unit 9: The Wellness Concierge Desk. Learn to understand a guest's goal, give a clear overview, and recommend the program that genuinely suits them.</p>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Harmony Wellness Resort</div>
      <div class="signchip"><span class="arrow">→</span> 1 Curious Guest</div>
      <div class="signchip"><span class="arrow">→</span> Short Overview</div>
      <div class="signchip"><span class="arrow">→</span> Real Recommendation</div>
    </div>
    <button class="startbtn" onclick="goNext()">Start your shift →</button>
  </div>`;
}

function renderMissionProgress(){
  const rows = MISSION_STEPS.map(m=>`
    <div class="checklist-row${Progress.activities[m.key] ? ' checked' : ''}" style="cursor:default;">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${m.label}</div>
    </div>`).join('');
  return `
  <div class="panel" id="missionProgressPanel">
    <h3 style="font-size:15px;color:var(--navy);">Your Mission</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Come back to this screen any time to see how far you've gotten.</p>
    <div style="margin-top:10px;">${rows}</div>
  </div>`;
}
function renderS1(){
  const rows = WARMUP_SCHEDULE.map(()=>`
    <tr><td></td><td></td><td></td></tr>`).join('');
  const facts = OPENING_SCENARIO.facts.map(f=>`<li>${f}</li>`).join('');
  const options = OPENING_SCENARIO.options.map((o,i)=>`
    <button class="choice-btn scenario-choice" data-i="${i}">${o.text}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Mission Brief: Your First Question of the Day</h2>
  <p class="section-sub">Your mission today: understand a guest's real goal, explain a program clearly, and recommend one that genuinely suits them. Read the situation below, then decide what you'd do.</p>
  <div class="panel">
    <ul style="margin:0 0 0 18px;padding:0;line-height:1.9;font-size:14.5px;color:var(--ink);">${facts}</ul>
    <div class="scenario-message">${OPENING_SCENARIO.message}</div>
    <p style="font-weight:700;color:var(--navy);margin-top:16px;">${OPENING_SCENARIO.question}</p>
    <p style="color:var(--muted);font-size:12.5px;margin-top:2px;">More than one answer can be reasonable. Choose everything you think is a good idea.</p>
    <div class="choices" id="scenarioChoices" style="margin-top:14px;">${options}</div>
    <div class="feedback" id="scenarioFeedback" style="display:block;"></div>
  </div>
  ${renderMissionProgress()}
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Let's Start the Shift</h3>
    <p class="section-sub" style="margin-top:4px;">Before the desk opens, listen to today's wellness schedule. Fill in the table as you listen, then reveal the answers to check yourself.</p>
    <div class="playbar" style="margin-top:16px;">
      <button class="play-btn" id="s1play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY TODAY'S SCHEDULE</div>
        <div class="play-sub" id="s1status">Listen for: the time, the activity, and where it happens.</div>
      </div>
      <button class="tb-btn" id="s1replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
    </div>
    <table class="dictation-table" id="s1table">
      <thead><tr><th>Time</th><th>Activity</th><th>Where</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <button class="reveal-btn" id="s1reveal" style="margin-top:14px;">Show answers</button>
    <div class="model-answer" id="s1answers">
      ${WARMUP_SCHEDULE.map(w=>`<div>${w.time} · ${w.point} · ${w.where}</div>`).join('')}
    </div>
    <hr class="hairline">
    <h3 style="font-size:16px;color:var(--navy);">Every Guest Arrives With Questions</h3>
    <p style="color:var(--ink);margin-top:8px;line-height:1.6;font-size:14.5px;">Concierge work is different from most wellness roles. You might explain the same programs many times a day, but for each guest, it's the first time they're hearing it. Every conversation needs to feel fresh, warm, and genuinely tailored to that one guest, even on your busiest day.</p>
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
    if(chosen.size >= 2) sendGranularRecord('Unit 9: Opening scenario', {completionStatus:'reached'});
  });

  const playBtn = document.getElementById('s1play');
  const replayBtn = document.getElementById('s1replay');
  const statusEl = document.getElementById('s1status');
  const revealBtn = document.getElementById('s1reveal');
  const answers = document.getElementById('s1answers');
  const idleStatus = 'Listen for: the time, the task, and who does it.';
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

/* ===== Section 2: Wellness Concierge — What Does Your Guest Need? =====
   Individual discovery opening (see CONCIERGE_GUESTS in data.js). State
   lives at module scope, same convention as every other multi-phase
   section in this project's unit family: it survives across renderAll()
   calls within the same page load, and each phase transition just
   re-renders the whole section via renderAll(). */
function freshS2State(){
  return { phase:'guest', guestIndex:0, chosenIndex:null };
}
let s2State = freshS2State();

function renderS2(){
  return s2State.phase === 'guest' ? renderConciergeGuest() : renderConciergeBoard();
}

function renderConciergeGuest(){
  const g = CONCIERGE_GUESTS[s2State.guestIndex];
  const chosen = s2State.chosenIndex;
  const problemLines = g.problem.map(p=>`<p>"${p}"</p>`).join('');
  const optsHtml = g.options.map((o,i)=>`
    <button class="choice-btn${chosen===i ? (o.good?' correct':' wrong') : ''}" data-i="${i}" ${chosen!=null?'disabled':''} style="${chosen!=null && chosen!==i ? 'opacity:.5;' : ''}">${o.text}</button>`).join('');
  const progress = `Guest ${s2State.guestIndex+1} of ${CONCIERGE_GUESTS.length}`;
  const feedbackHtml = chosen!=null
    ? `<div class="feedback show ${g.options[chosen].good?'good':'meh'}">${g.options[chosen].note}</div>${renderConciergeReveal(g)}`
    : '';
  const nextLabel = s2State.guestIndex >= CONCIERGE_GUESTS.length-1 ? 'SEE ALL WORDS →' : 'NEXT GUEST →';
  const nextBtn = chosen!=null ? `<button class="startbtn" id="conciergeNextBtn" style="margin-top:16px;">${nextLabel}</button>` : '';
  return `
  <div class="section-eyebrow">Section 2 ${tierTag('core')}</div>
  <h2 class="section-title">🌿 Wellness Concierge: What Does Your Guest Need?</h2>
  <p class="section-sub">You are the concierge today. Read what each guest needs, then choose the best option.</p>
  <div class="panel" style="text-align:center;">
    <div class="race-progress">${progress}</div>
    <div class="concierge-guestcard">
      <div class="concierge-photo" style="background-image:url('${g.photo}')"></div>
      <div class="concierge-name">${g.name}</div>
      <div class="scenario-message">${problemLines}</div>
    </div>
    <div class="choices" id="conciergeChoices" style="margin-top:16px;">${optsHtml}</div>
    ${feedbackHtml}
    ${nextBtn}
  </div>`;
}

function renderConciergeReveal(g){
  const words = g.reveal.map(r=>{
    const v = VOCAB.find(x=>x.id===r.id);
    return `
    <div class="concierge-word">
      <div class="concierge-word-ic">${v.ic}</div>
      <div class="concierge-word-nm">${v.nm}</div>
      <p class="concierge-word-def">${v.def}</p>
      <p class="concierge-word-ex">"${r.ex}"</p>
    </div>`;
  }).join('');
  return `<hr class="hairline"><p style="font-weight:700;color:var(--navy);">New words from ${g.name}:</p><div class="concierge-word-row">${words}</div>`;
}

function renderConciergeBoard(){
  const cards = VOCAB.map(v=>`
    <div class="loc-card is-open-static" data-id="${v.id}">
      <div class="ic">${v.ic}</div>
      <div class="nm">${v.nm}</div>
      <div class="loc-detail" style="display:block;">
        <div class="vocab-example">"${v.ex}"</div>
        ${v.def}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 2 ${tierTag('core')}</div>
  <h2 class="section-title">🧠 Words You Discovered</h2>
  <div class="panel">
    <div class="loc-grid">${cards}</div>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--navy);">Great work! You helped 5 guests and discovered 10 important wellness words.</p>
    <p style="color:var(--muted);font-size:14px;margin-top:6px;">🎯 Ready to begin your shift?</p>
    <button class="startbtn" id="conciergeContinueBtn" style="margin-top:12px;">CONTINUE →</button>
  </div>`;
}

function wireS2(){
  if(s2State.phase === 'guest') wireConciergeGuest();
  else wireConciergeBoard();
}

function wireConciergeGuest(){
  if(s2State.chosenIndex == null){
    document.getElementById('conciergeChoices').addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      s2State.chosenIndex = +btn.dataset.i;
      renderAll();
    });
  }
  const nextBtn = document.getElementById('conciergeNextBtn');
  if(nextBtn) nextBtn.addEventListener('click', ()=>{
    if(s2State.guestIndex >= CONCIERGE_GUESTS.length-1){
      s2State.phase = 'board';
    } else {
      s2State.guestIndex++;
      s2State.chosenIndex = null;
    }
    renderAll();
  });
}

function wireConciergeBoard(){
  document.getElementById('conciergeContinueBtn').addEventListener('click', ()=>{
    markActivityComplete('s2', {score:`${CONCIERGE_GUESTS.length}/${CONCIERGE_GUESTS.length} guests helped`});
    goNext();
  });
}

/* ===== Section 2b: What Would You Do? (concierge decision challenge) ===== */
function renderS2b(){
  const items = GUEST_INTERACTIONS.map((b,i)=>`
    <div class="sit-card" data-beh="${i}">
      <p style="color:var(--ink);font-size:14.5px;">${b.text}</p>
      <div class="choices" style="margin-top:10px;grid-template-columns:1fr 1fr;">
        <button class="choice-btn" data-cat="good">Good Practice</button>
        <button class="choice-btn" data-cat="needswork">Needs Work</button>
      </div>
      <div class="feedback" data-behfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 ${tierTag('core')}</div>
  <h2 class="section-title">Good Practice or Needs Work?</h2>
  <p class="section-sub">Read each behavior at the concierge desk. Sort it into the right category.</p>
  <div class="panel">${items}</div>`;
}
function wireS2b(){
  const sorted = new Set();
  GUEST_INTERACTIONS.forEach((b,i)=>{
    const box = document.querySelector(`[data-beh="${i}"] .choices`);
    const fb = document.querySelector(`[data-behfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(x=>x.classList.remove('correct','wrong'));
      const chosenGood = btn.dataset.cat === 'good';
      if(chosenGood === b.good){
        btn.classList.add('correct');
        fb.className = 'feedback show good';
        fb.textContent = 'Correct!';
      } else {
        btn.classList.add('wrong');
        fb.className = 'feedback show meh';
        fb.textContent = b.good ? 'Actually, this is good practice. Try the next one.' : 'Actually, this needs work. Try the next one.';
      }
      sorted.add(i);
      if(sorted.size >= GUEST_INTERACTIONS.length) markActivityComplete('s2b', {score:`${sorted.size}/${GUEST_INTERACTIONS.length} sorted`});
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
  <div class="section-eyebrow">Section 4 ${tierTag('extension')}</div>
  <h2 class="section-title">Vocabulary Activities</h2>
  <p class="section-sub">Optional extra practice, use this if you have extra time. Let's practice this unit's words three ways: matching, fill in the blank, and real situations.</p>
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
  <div class="section-eyebrow">Section 5 ${tierTag('core')}</div>
  <h2 class="section-title">Reading: Explaining Wellness Programs Well</h2>
  <p class="section-sub">Read the article below. Think about how these ideas apply to the role play in Section 8.</p>
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
  <div class="section-eyebrow">Section 6 ${tierTag('core')}</div>
  <h2 class="section-title">Useful Phrases</h2>
  <p class="section-sub">The phrases wellness concierges use, organized by moment.</p>
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
  <div class="section-eyebrow">Section 7 ${tierTag('core')}</div>
  <h2 class="section-title">Listening: A Curious Guest</h2>
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
        <div class="play-sub" id="s6status">Mai greets Mrs. Andersen at the concierge desk.</div>
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
        : 'Mai greets Mrs. Andersen at the concierge desk.';
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
  return `
  <div class="section-eyebrow">Section 8 ${tierTag('extension')}</div>
  <h2 class="section-title">After Listening</h2>
  <p class="section-sub">With a partner, discuss: what did Mai do well? What would you have done differently?</p>
  <div class="panel">
    <p style="color:var(--muted);font-size:13.5px;">Talk it through together. This isn't graded, but it's how you build real speaking fluency before the role-play.</p>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Script Analysis</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">These are real strategies used by professional wellness concierges worldwide. Click each one once you can point to where it happened in the call.</p>
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

/* ===== Section 6b: Build Your Explanation ===== */
function renderS6b(){
  const inputs = PITCH_FORMULA.map(f=>`
    <div class="schedule-input-row">
      <span class="schedule-session">${f.label}</span>
      <input type="text" class="schedule-time-input" id="explain_${f.key}" placeholder="${f.placeholder}" autocomplete="off">
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 9 ${tierTag('core')}</div>
  <h2 class="section-title">Build Your Explanation</h2>
  <p class="section-sub">A real concierge task: use the formula below to build a clear, personalized explanation.</p>
  <div class="panel">
    <p style="font-weight:700;color:var(--navy);">Fill in each part of the formula.</p>
    <div id="pitchInputs" style="margin-top:10px;">${inputs}</div>
    <button class="reveal-btn" id="pitchReveal" style="margin-top:14px;">Show a model explanation</button>
    <div class="model-answer" id="pitchAnswer">${MODEL_PITCH}</div>
  </div>`;
}
function wireS6b(){
  document.getElementById('pitchReveal').addEventListener('click', ()=>{
    document.getElementById('pitchAnswer').classList.add('show');
    markActivityComplete('s6b');
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
  const roleKeys = Object.keys(ROLEPLAY_CARDS);
  /* Tabs show the card's own "Role Card A/B/C" title rather than
     "Round 1/2/3": this is a roleplay with a fixed pair of parts to act
     out, not sequential rounds, and "Round" read as turn-taking and
     confused students about who does what. */
  const tabs = roleKeys.map((k,i)=>`<button class="tab-btn${i===0?' active':''}" data-role="${k}">${ROLEPLAY_CARDS[k].title}</button>`).join('');
  const panels = roleKeys.map((k,i)=>`<div class="tab-panel${i===0?' active':''}" data-rolepanel="${k}">${cards(k)}</div>`).join('');
  const flowSteps = ['ASK','UNDERSTAND','EXPLAIN','RECOMMEND','RESPOND'].map((s,i,arr)=>`<span class="txt"><b>${s}</b></span>${i<arr.length-1?'<span style="color:var(--muted);">→</span>':''}`).join('');
  return `
  <div class="section-eyebrow">Section 10 🎯 SPEAKING MISSION ${tierTag('core')}</div>
  <h2 class="section-title">Speaking Practice: At the Concierge Desk</h2>
  <p class="section-sub">Practice the role play in pairs. Three different guests will approach your desk today. Notice what each one actually needs, and adjust.</p>
  <div class="panel">
    <p style="font-weight:700;color:var(--navy);font-size:13px;">Follow this flow:</p>
    <div class="phrase-card" style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:center;">${flowSteps}</div>
  </div>
  <div class="panel">
    <div class="tabs">${tabs}</div>
    ${panels}
    <p style="color:var(--muted);font-size:12.5px;margin-top:14px;">Practice once using the phrases above. Then try again with less support, in your own words.</p>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Extra Challenge Scenarios</h3>
    <div class="phrase-list" style="margin-top:10px;">${scenarios}</div>
  </div>`;
}
function wireS8(){
  const roleKeys = Object.keys(ROLEPLAY_CARDS);
  const viewed = new Set([roleKeys[0]]);
  document.querySelectorAll('#app [data-role]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-role]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-rolepanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-rolepanel="${btn.dataset.role}"]`).classList.add('active');
      viewed.add(btn.dataset.role);
      if(viewed.size >= roleKeys.length) markActivityComplete('s8', {completionStatus:'reached'});
    });
  });
}

/* ===== Vocabulary Race (Remember-level review, replaces the crossword slot) ===== */
function renderCrossword(){
  return `
  <div class="section-eyebrow">Section 12 ${tierTag('core')}</div>
  <h2 class="section-title">Quick Review: Vocabulary Race</h2>
  <p class="section-sub">Quick recall. Read the definition, tap the matching word, keep going.</p>
  <div class="panel">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;">
      <div class="race-progress" id="raceProgress">Word 1 of ${VOCAB.length}</div>
      <div class="race-timer" id="raceTimer">Time: 0.0s</div>
    </div>
    <p id="raceQuestion" style="font-weight:700;color:var(--navy);font-size:17px;margin-top:16px;"></p>
    <div class="choices" id="raceChoices" style="margin-top:14px;"></div>
    <div class="feedback" id="raceFeedback"></div>
  </div>`;
}
function wireCrossword(){
  const order = shuffle(VOCAB);
  let idx = 0, correct = 0;
  const startTime = Date.now();
  const timerEl = document.getElementById('raceTimer');
  const progressEl = document.getElementById('raceProgress');
  const qEl = document.getElementById('raceQuestion');
  const choicesEl = document.getElementById('raceChoices');
  const fb = document.getElementById('raceFeedback');
  const timerInt = setInterval(()=>{ timerEl.textContent = `Time: ${((Date.now()-startTime)/1000).toFixed(1)}s`; }, 100);

  function showQuestion(){
    if(idx >= order.length){
      clearInterval(timerInt);
      const finalTime = ((Date.now()-startTime)/1000).toFixed(1);
      progressEl.textContent = 'Done';
      qEl.textContent = `Finished! ${correct}/${order.length} correct in ${finalTime}s.`;
      choicesEl.innerHTML = '';
      fb.className = 'feedback';
      markActivityComplete('crossword', {score:`${correct}/${order.length} in ${finalTime}s`});
      return;
    }
    const item = order[idx];
    progressEl.textContent = `Word ${idx+1} of ${order.length}`;
    qEl.textContent = item.def;
    const distractors = shuffle(VOCAB.filter(v=>v.id!==item.id)).slice(0,3);
    const opts = shuffle([item, ...distractors]);
    choicesEl.innerHTML = opts.map(o=>`<button class="choice-btn" data-id="${o.id}">${o.nm}</button>`).join('');
    fb.className = 'feedback';
  }
  choicesEl.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn) return;
    const item = order[idx];
    if(btn.dataset.id === item.id){ correct++; fb.className='feedback show good'; fb.textContent='Correct!'; }
    else { fb.className='feedback show meh'; fb.textContent=`Not quite. It was "${item.nm}".`; }
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
  <div class="section-eyebrow">Section 13 ${tierTag('extension')}</div>
  <h2 class="section-title">Peer Checklist &amp; Bonus</h2>
  <p class="section-sub">Evaluate your partner's explanation and recommendation. Check off each item as you observe it.</p>
  <div class="panel">
    ${checklist}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Bonus: Explain a Different Program</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:6px;">Choose ONE situation below and prepare a short explanation using the Useful Phrases from Section 6.</p>
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
  <div class="section-eyebrow">Section 14 ${tierTag('homework')}</div>
  <h2 class="section-title">Writing Task</h2>
  <p class="section-sub">${WRITING_TASK.prompt}</p>
  <div class="panel">
    <div class="email-template">
      <p>Dear [Guest Name],</p>
      <textarea id="s9writing" class="challenge-textarea" rows="5" style="margin-top:14px;" placeholder="Write your 4–6 sentence follow-up email here…"></textarea>
      <p style="margin-top:24px;">We look forward to working with you.</p>
      <p style="margin-top:10px;">Warm regards,<br>Wellness Concierge Team</p>
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
      fb.textContent = 'Nice work. That reads like a real follow-up email.';
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
  <div class="section-eyebrow">Section 15 ${tierTag('core')}</div>
  <h2 class="section-title">Self-Check</h2>
  <p class="section-sub">Rate yourself honestly. Your teacher remains the final evaluator.</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this lesson, you should feel more confident understanding a guest's goal, explaining a program clearly, and making a genuine recommendation.</p>
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
    <div class="cover-badge">UNIT 9 COMPLETE</div>
    <h1>You can <span>explain it well.</span></h1>
    <p>Keep practicing understanding the guest first, and remember: every recommendation should genuinely suit them.</p>
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
  {r:renderS6, w:wireS6},
  {r:renderS7, w:wireS7},
  {r:renderS6b, w:wireS6b},
  {r:renderS8, w:wireS8},
  {r:()=>renderSurprise(SURPRISE_CHALLENGE, `Section 11 ${tierTag('core')}`), w:()=>wireSurprise(SURPRISE_CHALLENGE)},
  {r:renderCrossword, w:wireCrossword},
  {r:renderPractice, w:wirePractice},
  {r:renderS9, w:wireS9},
  {r:renderS10, w:wireS10},
  {r:()=>renderExit(EXIT_TICKET, `Section 16 ${tierTag('core')}`), w:()=>wireExit(EXIT_TICKET)},
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
