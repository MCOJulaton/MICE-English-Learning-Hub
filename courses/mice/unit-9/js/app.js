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
    d.className = 'dot' + (i===current?' active':'') + (Progress.activities[s.key] ? ' done' : '');
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

const TRACKED_ACTIVITIES = ['s1','s2','s2b','s3','s4','s5','s6','s7','s6b','s8','casefile','surprise','crossword','practice','s9','s10','exit'];

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
    activity,
    score,
    completionStatus,
    answers
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
  const answers = opts.answers || '';
  if(prev && prev.completionStatus===completionStatus && prev.score===score) return;
  Progress.activities[key] = { status:completionStatus, score, completionStatus };
  sendProgressRecord(buildRecord(key, {score, completionStatus, answers}));
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
const CHECKIN_STORAGE_KEY = 'mice_u9_checkin';
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
   Two named characters: Nok (booth staff, default British female voice) and
   Mr. Andersson (visitor, American male voice). Includes a novelty-voice
   exclusion list and a pitch safety net, ported from the fix already applied
   to the MICE/Wellness Integrated Listening Challenge apps, so this brand
   new file doesn't reintroduce the gender-mismatch/robotic-voice bug those
   units had before that fix. */
const VoiceEngine = (function(){
  let allVoices = [];
  let staffVoice = null, delegateVoice = null;
  /* staffVoice/delegateVoice (used everywhere else in this unit: vocab
     audio, phrases, general narration) conflate accent and gender into one
     flag, which breaks down for the Section 7 listening dialogue: Nok is
     female but speaks with a US accent, Mr. Andersson is male but speaks
     with a UK accent, no combination of the two existing slots covers
     "UK + male". ukMaleVoice/usFemaleVoice are the two extra slots that do,
     used only by that dialogue's 'ukMale'/'usFemale' kinds below.
     *SoundsMale/*SoundsFemale record whether a real name-matched voice was
     found for that slot, versus a same-locale fallback of the wrong
     apparent gender (common on devices with a thin voice pack) — when a
     device has no male-sounding English voice at all, ukMaleVoice and
     delegateVoice both fall back to a female voice, so the two roles that
     are supposed to sound male would otherwise be indistinguishable from
     the female ones. makeUtterance() lowers pitch in that fallback case so
     the roles stay audibly distinct even without a real male voice. */
  let delegateSoundsMale = true;
  let ukMaleVoice = null, ukMaleSoundsMale = true;
  let usFemaleVoice = null;
  /* Manual override for Mr. Andersson's voice, in case this device has no
     voice the auto-detection above recognizes as male at all (still
     possible even with a broad name list and the pitch fallback, if the
     device's only English voices are genuinely all female). Saved per
     device so a teacher only has to pick once. */
  let ukMaleOverrideURI = null;
  try { ukMaleOverrideURI = localStorage.getItem('mice_u9_ukMaleVoiceURI') || null; } catch(e){}
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  /* These lists were too short: they covered mainly Apple's voice names and
     missed extremely common Windows/Edge/Chrome ones (e.g. "David" is the
     default Windows male voice, wasn't in MALE_NAME_HINTS). A real male
     voice that fails this match gets treated as "unconfirmed" and pitch-
     shifted down by makeUtterance() as a distinctness fallback, which is a
     deliberate trade-off when there's truly no male voice, but sounds
     needlessly robotic when the voice was fine and just went unrecognized.
     Kept broad on purpose, covers Apple, Windows/Edge, and Google/Chrome
     voice catalogs. */
  const FEMALE_NAME_HINTS = /\b(kate|serena|stephanie|fiona|hazel|libby|sonia|olivia|amy|emma|joanna|moira|tessa|karen|susan|zira|samantha|victoria|ava|allison|zoe|nicky|jenny|aria|michelle|female|catherine|linda|michelle|jane|laura|elizabeth|sara|sarah|maria|paulina|carmen|helena|monica|natasha|yuna|zhiyu|ximena|nanami|aditi|raveena|heera|isha|neerja|shreya|ananya|danielle|salli|joanna|kendra|kimberly|ivy|isabella|abbi|bella|clara|clarissa|dita|eva|freya|ines|iveta|mia|noora|nova|remi|rosa)\b/i;
  const MALE_NAME_HINTS = /\b(daniel|arthur|george|oliver|ryan|brian|matthew|guy|alex|tom|thomas|aaron|gordon|justin|bruce|male|david|mark|james|christopher|eric|roger|sean|tony|william|conrad|andrew|jacob|jason|paul|richard|kevin|liam|noah|ethan|carlos|diego|jorge|miguel|antonio|luca|marco|fabio|giorgio|felix|hans|jan|piotr|dmitry|takumi|kenji|hiroshi|jian|wei|ravi|arnav|joey|justin|russell|george|nathan|neil)\b/i;
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
    /* scoreVoice() picks the best-scoring en-US voice by LOCALE even when no
       voice matches MALE_NAME_HINTS (locale match outscores a missing
       gender bonus), so usVoiceCandidate can legitimately be a female en-US
       voice on a device with no male English voice at all. Check the name
       match explicitly rather than trusting a non-null result. */
    const usVoiceCandidate = bestVoice(goodVoices,'en-US','en',MALE_NAME_HINTS)
                           || bestVoice(allVoices,'en-US','en',MALE_NAME_HINTS);
    const usMaleVoice = usVoiceCandidate || ukFemaleVoice;
    staffVoice = ukFemaleVoice;
    delegateVoice = usMaleVoice;
    delegateSoundsMale = !!(usVoiceCandidate && MALE_NAME_HINTS.test(usVoiceCandidate.name));

    const ukMaleCandidate = bestVoice(goodVoices,'en-GB','en',MALE_NAME_HINTS)
                          || bestVoice(allVoices,'en-GB','en',MALE_NAME_HINTS);
    const manualOverride = ukMaleOverrideURI ? allVoices.find(v => v.voiceURI === ukMaleOverrideURI) : null;
    if(manualOverride){
      ukMaleVoice = manualOverride;
      ukMaleSoundsMale = true; // trust a manually chosen voice, no pitch fallback needed
    } else {
      ukMaleVoice = ukMaleCandidate || ukFemaleVoice;
      ukMaleSoundsMale = !!(ukMaleCandidate && MALE_NAME_HINTS.test(ukMaleCandidate.name));
    }

    const usFemaleCandidate = bestVoice(goodVoices,'en-US','en',FEMALE_NAME_HINTS)
                            || bestVoice(allVoices,'en-US','en',FEMALE_NAME_HINTS);
    usFemaleVoice = usFemaleCandidate || usMaleVoice;

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
    let voice, pitch = 1.0;
    if(kind === 'delegate'){ voice = delegateVoice; pitch = delegateSoundsMale ? 1.0 : 0.93; }
    else if(kind === 'ukMale'){ voice = ukMaleVoice; pitch = ukMaleSoundsMale ? 1.0 : 0.93; }
    else if(kind === 'usFemale'){ voice = usFemaleVoice; }
    else { voice = staffVoice; }
    if(voice) u.voice = voice;
    u.lang = (voice && voice.lang) ? voice.lang : 'en-GB';
    u.rate = (slower ? 0.86 : 1.0);
    /* Pitch-bending a synthesized voice makes it sound MORE robotic, so when
       a real matching-gender voice was found, pitch stays natural and the
       role relies on genuine accent/gender difference. If a device truly
       has no male-sounding English voice in that accent, the fallback voice
       is really just a second female voice; a small pitch nudge here (not
       a big drop) keeps the two roles a little more distinct without making
       the fallback voice sound obviously synthetic. A student's own natural
       voice is more important than gender-perfect TTS, this is a light
       touch, not a disguise. */
    u.pitch = pitch;
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
    getUkMaleVoiceURI(){ return ukMaleVoice ? ukMaleVoice.voiceURI : null; },
    setUkMaleVoice(voiceURI){
      ukMaleOverrideURI = voiceURI || null;
      try {
        if(ukMaleOverrideURI) localStorage.setItem('mice_u9_ukMaleVoiceURI', ukMaleOverrideURI);
        else localStorage.removeItem('mice_u9_ukMaleVoiceURI');
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
    <div class="cover-badge">PHUKET INTERNATIONAL TRAVEL &amp; TOURISM EXPO</div>
    <h1>Every visitor is a chance. <span>Can you make your pitch?</span></h1>
    <p>Unit 9: Exhibition Booth Communication. Learn to greet visitors, give a confident pitch, handle tough questions, and turn a visitor into a real lead.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> 3,000 Visitors</div>
      <div class="signchip"><span class="arrow">→</span> 120 Exhibitors</div>
      <div class="signchip"><span class="arrow">→</span> 30-Sec Pitch</div>
      <div class="signchip"><span class="arrow">→</span> Follow Up</div>
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
  const rows = WARMUP_SCHEDULE.map((w,i)=>`
    <tr>
      <td><input type="text" class="dictation-input" data-dict="${i}-time" placeholder="time"></td>
      <td><input type="text" class="dictation-input" data-dict="${i}-f2" placeholder="task"></td>
      <td><input type="text" class="dictation-input" data-dict="${i}-f3" placeholder="person"></td>
    </tr>`).join('');
  const facts = OPENING_SCENARIO.facts.map(f=>`<li>${f}</li>`).join('');
  const options = OPENING_SCENARIO.options.map((o,i)=>`
    <button class="choice-btn scenario-choice" data-i="${i}">${o.text}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Mission Brief: Your First Minute at the Booth</h2>
  <p class="section-sub">Your mission today: work a real exhibition booth, discover what different visitors need, and turn one into a lead. Read the situation below, then decide what you'd do.</p>
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
    <p class="section-sub" style="margin-top:4px;">Before the doors open, listen to today's booth schedule. Fill in the table as you listen, then reveal the answers to check yourself.</p>
    <div class="playbar" style="margin-top:16px;">
      <button class="play-btn" id="s1play" title="Play">${icon('play',{size:20})}</button>
      <div style="flex:1;min-width:180px;">
        <div class="play-label">PLAY TODAY'S BOOTH SCHEDULE</div>
        <div class="play-sub" id="s1status">Listen for: the time, the task, and who does it.</div>
      </div>
      <button class="tb-btn" id="s1replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
    </div>
    <table class="dictation-table" id="s1table">
      <thead><tr><th>Time</th><th>Task</th><th>Person</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <button class="reveal-btn" id="s1reveal" style="margin-top:14px;">Show answers</button>
  <div class="feedback" id="s1nudge"></div>
    <div class="model-answer" id="s1answers">
      ${WARMUP_SCHEDULE.map(w=>`<div>${w.time} · ${w.task} · ${w.person}</div>`).join('')}
    </div>
    <hr class="hairline">
    <h3 style="font-size:16px;color:var(--navy);">Booth Work: Fast and Personal</h3>
    <p style="color:var(--ink);margin-top:8px;line-height:1.6;font-size:14.5px;">Booth work is different from most MICE jobs. You have only a few seconds to catch each visitor's attention, and you might talk to hundreds of people in one day. Every conversation is short, but it still needs to feel warm and personal. A visitor who feels rushed or ignored will simply walk to the next booth.</p>
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
    const nudge = document.getElementById('s1nudge');
    const dictInputs = document.querySelectorAll('#s1table .dictation-input');
    const values = [...dictInputs].map(inp=>inp.value.trim());
    if(values.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please fill in the table as you listen before checking.';
      return;
    }
    nudge.className = 'feedback';
    // This is a listening-dictation table, not exact-match gradable (real
    // wording varies) -- report "answered" honestly and send what they
    // wrote next to the model answer so the teacher can judge it.
    answers.classList.add('show');
    const answersStr = WARMUP_SCHEDULE.map((w,i)=>{
      const t = document.querySelector(`[data-dict="${i}-time"]`).value.trim();
      const f2 = document.querySelector(`[data-dict="${i}-f2"]`).value.trim();
      const f3 = document.querySelector(`[data-dict="${i}-f3"]`).value.trim();
      return `Row ${i+1}: ${t} / ${f2} / ${f3} [model: ${w.time} / ${w.task} / ${w.person}]`;
    }).join(' | ');
    markActivityComplete('s1', {score:`${WARMUP_SCHEDULE.length}/${WARMUP_SCHEDULE.length} answered`, answers: answersStr});
  });
}

/* ===== Section 2: MICE Detectives — Find the 10 Differences =====
   Individual visual-mystery puzzle (see PUZZLE_DIFFERENCES in data.js).
   State lives at module scope, same convention as every other multi-phase
   section in this unit's family (e.g. the Wellness Crisis Timeline): it
   survives across renderAll() calls within the same page load, and each
   phase transition just re-renders the whole section via renderAll(). */
function freshS2State(){
  return {
    phase:'find',        // 'find' | 'result' | 'discover' | 'board'
    circles:[],           // [{x,y}] percent coords the student marked on Picture B
    foundIds:[],           // PUZZLE_DIFFERENCES ids matched, in the order found
    discoverOrder:[],      // built once, entering 'discover': found ids first, then missed
    discoverIndex:0,
    discoverRevealed:false,
    timeLeft:300,
    timerId:null
  };
}
let s2State = freshS2State();

function s2ZoneById(id){ return PUZZLE_DIFFERENCES.find(d=>d.id===id); }
function s2ZoneCenter(zone){ return { x: zone.left + zone.width/2, y: zone.top + zone.height/2 }; }
function s2FormatTime(sec){
  const m = Math.floor(sec/60), s = sec%60;
  return `${m}:${s<10?'0':''}${s}`;
}
function s2ZoomStyle(d){
  const zone = d.zone;
  const c = s2ZoneCenter(zone);
  const zoom = Math.max(1.8, Math.min(4.2, 60/Math.max(zone.width, zone.height)));
  /* Most differences are visible in both pictures, so zooming into Picture B
     works fine. "Badge Scanner" is the opposite: it only appears in Picture A
     and is gone in B, so zooming into B for that word showed empty space
     instead of a scanner. zoomImage lets a difference point at Picture A
     when the item itself only exists there. */
  const src = PUZZLE_IMAGES[d.zoomImage || 'b'];
  return `background-image:url('${src}');background-size:${zoom*100}% auto;background-position:${c.x}% ${c.y}%;background-repeat:no-repeat;`;
}
function s2StopTimer(){
  if(s2State.timerId){ clearInterval(s2State.timerId); s2State.timerId = null; }
}

function renderS2(){
  let body = '';
  if(s2State.phase === 'find') body = renderPuzzleFind();
  else if(s2State.phase === 'result') body = renderPuzzleResult();
  else if(s2State.phase === 'discover') body = renderPuzzleDiscover();
  else body = renderPuzzleBoard();
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">🔎 MICE Detectives</h2>
  <p class="section-sub">Something is different at the exhibition. Can you find all 10 differences?</p>
  ${body}`;
}

function renderPuzzleFind(){
  const circles = s2State.circles.map((c,i)=>`
    <div class="puzzle-circle" data-i="${i}" style="left:${c.x}%;top:${c.y}%;"><svg viewBox="0 0 100 100"><path d="M50,8 C72,6 92,26 89,50 C92,76 70,93 46,90 C20,93 7,72 10,45 C7,19 29,6 50,8 Z"/></svg></div>`).join('');
  return `
  <div class="panel">
    <p style="font-weight:700;color:var(--navy);">Look carefully at Picture A and Picture B. Circle the 10 differences in Picture B. You have 5 minutes.</p>
    <div class="puzzle-hud">
      <div class="puzzle-hud-chip">🔎 Differences marked: <b id="puzzleMarked">${s2State.circles.length}</b>/10</div>
      <div class="puzzle-hud-chip" id="puzzleTimerChip">⏱ <b id="puzzleTimer">${s2FormatTime(s2State.timeLeft)}</b></div>
    </div>
    <div class="puzzle-grid">
      <div class="puzzle-col">
        <div class="puzzle-label">Picture A</div>
        <div class="puzzle-imgwrap"><img src="${PUZZLE_IMAGES.a}" alt="Picture A: the exhibition booth"></div>
      </div>
      <div class="puzzle-col">
        <div class="puzzle-label">Picture B <span>tap to circle a difference</span></div>
        <div class="puzzle-imgwrap" id="puzzleImgB"><img src="${PUZZLE_IMAGES.b}" alt="Picture B: the exhibition booth, find what changed" draggable="false">${circles}</div>
      </div>
    </div>
    <p style="color:var(--muted);font-size:13px;margin-top:14px;">Tap a circle again to remove it. Marking a wrong spot is okay, just keep looking!</p>
    <button class="startbtn" id="puzzleCheckBtn" style="margin-top:10px;">CHECK MY ANSWERS</button>
  </div>`;
}

function renderPuzzleResult(){
  const markers = PUZZLE_DIFFERENCES.map(d=>{
    const c = s2ZoneCenter(d.zone);
    const found = s2State.foundIds.includes(d.id);
    return `<div class="puzzle-marker ${found?'found':'missed'}" style="left:${c.x}%;top:${c.y}%;">${found?'✓':'○'}</div>`;
  }).join('');
  const n = s2State.foundIds.length;
  let headline, sub;
  if(n>=10){ headline='🎉 PERFECT!'; sub=`You found all ${n}/10 differences. Amazing eyes!`; }
  else if(n>=8){ headline='🎉 GREAT JOB!'; sub=`You found ${n}/10 differences. Nice work!`; }
  else if(n>=5){ headline='Nice work!'; sub=`You found ${n}/10 differences. Can you find more next time?`; }
  else { headline='Good try!'; sub=`You found ${n}/10 differences. Let's learn all the words now.`; }
  return `
  <div class="panel" style="text-align:center;">
    <h3 style="font-family:'Oswald';font-size:24px;color:var(--navy);">${headline}</h3>
    <p style="color:var(--ink);margin-top:6px;">${sub}</p>
    <div class="puzzle-imgwrap" style="max-width:420px;margin:20px auto 0;"><img src="${PUZZLE_IMAGES.b}" alt="Picture B with differences marked">${markers}</div>
    <div style="margin-top:14px;font-family:'Oswald';font-size:15px;color:var(--navy);">SCORE: ${n}/10</div>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--navy);">🧩 Now discover the MICE words</p>
    <p style="color:var(--muted);font-size:14px;margin-top:4px;">Each difference has a MICE word.</p>
    <button class="startbtn" id="puzzleDiscoverBtn" style="margin-top:12px;">DISCOVER THE WORDS →</button>
  </div>`;
}

function renderPuzzleDiscover(){
  const id = s2State.discoverOrder[s2State.discoverIndex];
  const d = s2ZoneById(id);
  const found = s2State.foundIds.includes(id);
  const progress = `Word ${s2State.discoverIndex+1} of ${s2State.discoverOrder.length}`;
  const statusChip = found
    ? `<span class="puzzle-status found">✓ You found this one!</span>`
    : `<span class="puzzle-status missed">You missed this one. Let's learn it!</span>`;
  const stepInner = s2State.discoverRevealed ? `
    <div class="puzzle-word-reveal">
      <div class="puzzle-word-ic">${d.ic}</div>
      <div class="puzzle-word-nm">${d.word}</div>
      <p class="puzzle-word-def">${d.def}</p>
      <p class="puzzle-word-ex">"${d.ex}" <button class="audio-mini" data-say="${d.ex.replace(/"/g,'')}"><span class="icon-inline">${icon('headphones',{size:13})}</span></button></p>
      <p style="color:var(--muted);font-size:13.5px;margin-top:10px;">${d.note}</p>
    </div>
    <button class="startbtn" id="puzzleNextWordBtn" style="margin-top:16px;">${s2State.discoverIndex >= s2State.discoverOrder.length-1 ? 'SEE ALL WORDS →' : 'NEXT WORD →'}</button>
  ` : `
    <p style="font-weight:700;color:var(--orange-deep);margin-top:14px;">${d.question}</p>
    <button class="startbtn" id="puzzleRevealWordBtn" style="margin-top:14px;">WHAT DO YOU SEE? 👀</button>
  `;
  return `
  <div class="panel" style="text-align:center;">
    <div class="race-progress">${progress}</div>
    ${statusChip}
    <div class="puzzle-zoom-box" style="${s2ZoomStyle(d)}"></div>
    ${stepInner}
  </div>`;
}

function renderPuzzleBoard(){
  const cards = PUZZLE_DIFFERENCES.map(d=>`
    <div class="loc-card is-open-static" data-id="${d.id}">
      <div class="ic">${d.ic}</div>
      <div class="nm">${d.word}</div>
      <div class="loc-detail" style="display:block;">
        <div class="vocab-example">"${d.ex}"</div>
        ${d.def}
      </div>
    </div>`).join('');
  return `
  <div class="panel">
    <h3 style="font-family:'Oswald';font-size:22px;color:var(--navy);">🧠 MICE Words You Discovered</h3>
    <div class="loc-grid" style="margin-top:16px;">${cards}</div>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--navy);">Great work! You have discovered 10 important MICE words.</p>
    <p style="color:var(--muted);font-size:14px;margin-top:6px;">🎯 Ready for the next mission?</p>
    <button class="startbtn" id="puzzleContinueBtn" style="margin-top:12px;">CONTINUE →</button>
  </div>`;
}

function wireS2(){
  if(s2State.phase === 'find') wirePuzzleFind();
  else if(s2State.phase === 'result') wirePuzzleResult();
  else if(s2State.phase === 'discover') wirePuzzleDiscover();
  else wirePuzzleBoard();
}

function wirePuzzleFind(){
  s2StopTimer();
  const wrap = document.getElementById('puzzleImgB');
  const markedEl = document.getElementById('puzzleMarked');
  const timerEl = document.getElementById('puzzleTimer');

  function addOrRemoveCircle(clientX, clientY){
    const rect = wrap.getBoundingClientRect();
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;
    const thresholdPx = rect.width * 0.05;
    const hitIndex = s2State.circles.findIndex(c=>{
      const dx = (xPct - c.x)/100 * rect.width;
      const dy = (yPct - c.y)/100 * rect.height;
      return Math.sqrt(dx*dx + dy*dy) < thresholdPx;
    });
    if(hitIndex >= 0){ s2State.circles.splice(hitIndex,1); }
    else { s2State.circles.push({x:xPct, y:yPct}); }
    markedEl.textContent = s2State.circles.length;
    renderAll();
  }
  wrap.addEventListener('click', e=>{ addOrRemoveCircle(e.clientX, e.clientY); });

  function finishFind(){
    s2StopTimer();
    const rect = wrap.getBoundingClientRect();
    s2State.foundIds = PUZZLE_DIFFERENCES.filter(d=>{
      const z = d.zone;
      const pad = 4;
      const left = Math.max(0, z.left-pad), top = Math.max(0, z.top-pad);
      const right = Math.min(100, z.left+z.width+pad), bottom = Math.min(100, z.top+z.height+pad);
      return s2State.circles.some(c => c.x>=left && c.x<=right && c.y>=top && c.y<=bottom);
    }).map(d=>d.id);
    s2State.phase = 'result';
    renderAll();
  }
  document.getElementById('puzzleCheckBtn').addEventListener('click', finishFind);

  s2State.timerId = setInterval(()=>{
    s2State.timeLeft--;
    if(timerEl) timerEl.textContent = s2FormatTime(Math.max(0,s2State.timeLeft));
    if(s2State.timeLeft <= 0){ finishFind(); }
  }, 1000);
}

function wirePuzzleResult(){
  document.getElementById('puzzleDiscoverBtn').addEventListener('click', ()=>{
    const missed = PUZZLE_DIFFERENCES.map(d=>d.id).filter(id=>!s2State.foundIds.includes(id));
    s2State.discoverOrder = [...s2State.foundIds, ...missed];
    s2State.discoverIndex = 0;
    s2State.discoverRevealed = false;
    s2State.phase = 'discover';
    renderAll();
  });
}

function wirePuzzleDiscover(){
  const revealBtn = document.getElementById('puzzleRevealWordBtn');
  if(revealBtn) revealBtn.addEventListener('click', ()=>{ s2State.discoverRevealed = true; renderAll(); });
  const nextBtn = document.getElementById('puzzleNextWordBtn');
  if(nextBtn) nextBtn.addEventListener('click', ()=>{
    if(s2State.discoverIndex >= s2State.discoverOrder.length-1){
      s2State.phase = 'board';
    } else {
      s2State.discoverIndex++;
      s2State.discoverRevealed = false;
    }
    renderAll();
  });
  document.querySelectorAll('#app .audio-mini').forEach(btn=>{
    btn.addEventListener('click', e=>{ speak(btn.dataset.say,'staff'); e.stopPropagation(); });
  });
}

function wirePuzzleBoard(){
  document.getElementById('puzzleContinueBtn').addEventListener('click', ()=>{
    markActivityComplete('s2', {score:`${s2State.foundIds.length}/10 found`});
    goNext();
  });
}

/* ===== Section 2b: Good Practice or Needs Work? (booth behavior categorization) ===== */
function renderS2b(){
  const items = BOOTH_BEHAVIORS.map((b,i)=>`
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
  <p class="section-sub">Read each behavior from a booth conversation. In pairs, agree together before you click, then sort it into the right category.</p>
  <div class="panel">${items}</div>`;
}
function wireS2b(){
  const sorted = new Set();
  BOOTH_BEHAVIORS.forEach((b,i)=>{
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
      if(sorted.size >= BOOTH_BEHAVIORS.length) markActivityComplete('s2b', {score:`${sorted.size}/${BOOTH_BEHAVIORS.length} sorted`});
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
  <div class="section-eyebrow">Section 4 ${tierTag('core')}</div>
  <h2 class="section-title">Vocabulary Activities</h2>
  <p class="section-sub">Let's practice this unit's words: matching and real situations.</p>
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
    <h3 style="font-size:15px;color:var(--navy);">Activity 2: What Would You Say?</h3>
    ${situations}
  </div>
  <hr class="hairline">
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Extra Practice: Fill in the Blank ${tierTag('extension')}</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Optional, use this if you have extra time. Type the correct word for each sentence, then press Check.</p>
    ${blanks}
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
    if(matchDone) markActivityComplete('s3', {score:`${connections.size}/${MATCH_PAIRS.length} matched`});
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
  <h2 class="section-title">Reading: Working an Exhibition Booth</h2>
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
  <p class="section-sub">The phrases booth staff use, organized by moment.</p>
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
  <h2 class="section-title">Listening: A Visitor Stops By</h2>
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
        <div class="play-sub" id="s6status">Nok (booth staff) greets Mr. Andersson (visitor).</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="tb-btn" id="s6pause"><span class="icon-inline">${icon('pause',{size:14})}</span> <span class="lbl">Pause</span></button>
        <button class="tb-btn" id="s6resume"><span class="icon-inline">${icon('play',{size:14})}</span> <span class="lbl">Resume</span></button>
        <button class="tb-btn" id="s6replay"><span class="icon-inline">${icon('rotateCcw',{size:14})}</span> <span class="lbl">Replay</span></button>
        <button class="tb-btn" id="s6slower"><span class="lbl">Slower</span></button>
      </div>
    </div>
    <div class="voice-picker-row" style="margin-top:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <label for="s6voicepick" style="font-size:12.5px;color:var(--muted);">If Mr. Andersson still sounds wrong, pick a different voice for him:</label>
      <select id="s6voicepick" style="font-size:12.5px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;max-width:100%;"></select>
      <button class="tb-btn" id="s6voicetest" style="padding:4px 10px;"><span class="lbl">Test</span></button>
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

  const voicePick = document.getElementById('s6voicepick');
  function populateVoicePicker(){
    if(!voicePick) return;
    const voices = VoiceEngine.getEnglishVoices();
    const current = VoiceEngine.getUkMaleVoiceURI();
    voicePick.innerHTML = voices.map(v=>
      `<option value="${v.voiceURI}"${v.voiceURI===current?' selected':''}>${v.name} (${v.lang})</option>`
    ).join('');
  }
  VoiceEngine.onChange(()=>{
    const isPlaying = VoiceEngine.isPlaying();
    if(statusEl){
      statusEl.textContent = isPlaying
        ? (VoiceEngine.isPaused() ? 'Paused' : 'Playing the conversation…')
        : 'Nok (booth staff) greets Mr. Andersson (visitor).';
    }
    if(playBtn){
      playBtn.innerHTML = isPlaying ? icon('stop',{size:20}) : icon('play',{size:20});
      playBtn.title = isPlaying ? 'Stop' : 'Play';
    }
    populateVoicePicker();
  });
  populateVoicePicker();
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

  /* Manual voice picker for Mr. Andersson: automatic gender detection can't
     find a voice that doesn't exist on this device, so this lets a teacher
     browse whatever English voices ARE installed and pick one directly,
     saved per device via VoiceEngine.setUkMaleVoice(). populateVoicePicker
     and its first call live above, next to the onChange handler it also
     runs from, since setUkMaleVoice() triggers refresh() -> onChange(). */
  voicePick && voicePick.addEventListener('change', ()=>{
    VoiceEngine.setUkMaleVoice(voicePick.value);
  });
  document.getElementById('s6voicetest').addEventListener('click', ()=>{
    VoiceEngine.speakLine("Hi, I'm just walking around, but this caught my eye.", 'ukMale');
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
  <div class="section-eyebrow">Section 8 ${tierTag('extension')}</div>
  <h2 class="section-title">After Listening</h2>
  <p class="section-sub">With a partner, discuss: what did Nok do well? What would you have done differently?</p>
  <div class="panel">
    <p style="color:var(--muted);font-size:13.5px;">Talk it through together. This isn't graded, but it's how you build real speaking fluency before the role-play.</p>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Script Analysis</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">These are real strategies used by professional booth staff worldwide. Click each one once you can point to where Nok used it in the conversation.</p>
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

/* ===== Section 6b: Build Your Pitch ===== */
function renderS6b(){
  const inputs = PITCH_FORMULA.map(f=>`
    <div class="schedule-input-row">
      <span class="schedule-session">${f.label}</span>
      <input type="text" class="schedule-time-input" id="pitch_${f.key}" placeholder="${f.placeholder}" autocomplete="off">
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 9 🎯 MAIN MICE MISSION ${tierTag('core')}</div>
  <h2 class="section-title">Build Your Pitch</h2>
  <p class="section-sub">This is your main mission: build your pitch here, then perform it live in the next section. Use the formula below to build your own 30-second pitch.</p>
  <div class="panel">
    <p style="font-weight:700;color:var(--navy);">Fill in each part of the formula.</p>
    <div id="pitchInputs" style="margin-top:10px;">${inputs}</div>
    <button class="reveal-btn" id="pitchReveal" style="margin-top:14px;">Show a model pitch</button>
    <div class="feedback" id="pitchNudge"></div>
    <div class="model-answer" id="pitchAnswer">${MODEL_PITCH}</div>
  </div>`;
}
function wireS6b(){
  document.getElementById('pitchReveal').addEventListener('click', ()=>{
    const nudge = document.getElementById('pitchNudge');
    const values = PITCH_FORMULA.map(f=> document.getElementById(`pitch_${f.key}`).value.trim());
    if(values.some(v=>!v)){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Please fill in every part of the formula before checking.';
      return;
    }
    nudge.className = 'feedback';
    // A pitch has no single correct wording -- report "answered" honestly
    // rather than a fake correctness score. The teacher can read and
    // judge the real pitch from the sheet.
    document.getElementById('pitchAnswer').classList.add('show');
    const answers = PITCH_FORMULA.map((f,i)=>`${f.label}: ${values[i]}`).join(' | ');
    markActivityComplete('s6b', {score:`${values.length}/${PITCH_FORMULA.length} answered`, answers});
  });
}

function renderS8(){
  const roleKeys = Object.keys(ROLEPLAY_CARDS);
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
  /* Tabs show the card's own "Role Card A/B/C" title rather than
     "Round 1/2/3": this is a roleplay with a fixed pair of parts to act
     out, not sequential rounds, and "Round" read as turn-taking and
     confused students about who does what. */
  const tabs = roleKeys.map((k,i)=>`<button class="tab-btn${i===0?' active':''}" data-role="${k}">${ROLEPLAY_CARDS[k].title}</button>`).join('');
  const panels = roleKeys.map((k,i)=>`<div class="tab-panel${i===0?' active':''}" data-rolepanel="${k}">${cards(k)}</div>`).join('');
  const scenarios = CHALLENGE_SCENARIOS.map(s=>`
    <div class="phrase-card"><span class="txt"><b>${s.tag}:</b> ${s.text}</span></div>`).join('');
  return `
  <div class="section-eyebrow">Section 10 🎯 MICE MISSION: PERFORM IT ${tierTag('core')}</div>
  <h2 class="section-title">Speaking Practice: Working the Booth</h2>
  <p class="section-sub">Three different visitors stop at your booth today. In pairs, act out each round: one of you is booth staff, the other plays the visitor. Find out what each visitor actually needs before you pitch anything, then switch to the next role card.</p>
  <div class="panel">
    <div class="tabs">${tabs}</div>
    ${panels}
    <p style="color:var(--muted);font-size:12.5px;margin-top:14px;">Practice once using the phrases above. Then try again with less support, in your own words.</p>
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Extra Challenge Scenarios</h3>
    <div class="phrase-list" style="margin-top:10px;">${scenarios}</div>
  </div>
  <div class="alt-activity-note">💡 Looking for a group problem-solving activity instead? Try <b>Booth Communication Case File</b> in the next section.</div>`;
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

/* ===== Section 11 (NEW): Booth Communication Case File =====
   A group problem-solving activity, an alternative to Speaking Practice for
   today's main application task (see CASE_FILES in data.js). This does not
   replace or touch Section 10, it is a separate section a teacher can
   choose instead. This section is instructions only, the actual writing
   happens on a printed Group Worksheet (one per group, same 7 questions),
   so there is no on-screen form here. Phase machine: pick a group -> read
   the case -> see the report guide. There is no login on this static
   site, so "picking a group" just switches which case is shown; nothing is
   sent anywhere, and no real student names are stored. */
function freshCfState(){
  return { phase: 'pick', groupN: null }; // phase: 'pick' | 'case' | 'report'
}
let cfState = freshCfState();
function cfCase(){ return CASE_FILES.find(c=>c.n===cfState.groupN); }

function renderCaseFile(){
  let body;
  if(cfState.phase==='pick') body = renderCfPick();
  else if(cfState.phase==='case') body = renderCfCase();
  else body = renderCfReport();
  return `
  <div class="section-eyebrow">Section 11 📋 BOOTH COMMUNICATION CASE FILE ${tierTag('core')}</div>
  <h2 class="section-title">Can Your Team Solve the Problem?</h2>
  <p class="section-sub">You are the MICE team. Your booth has a problem. Read your case carefully, discuss the situation with your group, and decide what your team should do. There is not only one correct answer, your group must explain WHY you chose your solution.</p>
  ${body}`;
}

function renderCfPick(){
  const cards = CASE_FILES.map(c=>`
    <div class="cf-pick-btn" data-pick="${c.n}">
      <div class="cf-pick-num">Group ${c.n}</div>
      <div class="cf-pick-title">${c.title}</div>
    </div>`).join('');
  return `
  <div class="panel">
    <p style="font-weight:700;color:var(--navy);">Choose your group number.</p>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Each group gets a different case. Nobody else in the class has the same problem to solve.</p>
    <div class="cf-pick-grid">${cards}</div>
  </div>`;
}

function renderCfCase(){
  const c = cfCase();
  const situation = c.situation.map(p=>`<p style="margin-top:8px;">${p}</p>`).join('');
  const facts = c.facts.map(f=>`<div class="cf-fact-row"><span class="cf-fact-k">${f.k}</span><span class="cf-fact-v">${f.v}</span></div>`).join('');
  const questions = c.questions.map(q=>`<li>${q}</li>`).join('');
  return `
  <div class="panel">
    <button class="cf-back-link" id="cfBackToPick">← Choose a different group</button>
    <div class="cf-case-tag">GROUP ${c.n} CASE FILE</div>
    <h3 class="cf-case-title">${c.title}</h3>
    <p class="cf-case-setting">📍 ${c.setting}</p>
    ${situation}
    <hr class="hairline">
    <h4 class="cf-block-h">Key Facts</h4>
    <div class="cf-facts">${facts}</div>
    <hr class="hairline">
    <h4 class="cf-block-h">Your Group Must Decide</h4>
    <ul class="cf-questions">${questions}</ul>
    <hr class="hairline">
    <h4 class="cf-block-h">What To Do</h4>
    <ul class="cf-questions">
      <li>Discuss this case with your group.</li>
      <li>Fill in your Group Worksheet together. Ask your teacher for a printed copy.</li>
      <li>When you're ready, look at the Report Guide to prepare what your group will say to the class.</li>
    </ul>
    <button class="startbtn" id="cfSeeReport" style="margin-top:18px;">SEE THE REPORT GUIDE →</button>
  </div>`;
}

function renderCfReport(){
  const c = cfCase();
  const parts = [
    {who:'Student 1', what:'Situation', hint:`Setting: ${c.setting}. Explain the situation in your own words.`},
    {who:'Student 2', what:'Main problem', hint:'(your answer to Worksheet Question 1)'},
    {who:'Student 3', what:'First step and why', hint:'(Worksheet Question 2)'},
    {who:'Student 4', what:'Your 3-step plan', hint:'(Worksheet Question 3)'},
    {who:'Student 5', what:'Professional English examples', hint:'(Worksheet Question 4)'},
    {who:'Student 6', what:'Result and reason', hint:'(Worksheet Questions 6 and 7)'}
  ];
  const partRows = parts.map(p=>`<div class="cf-report-row"><div class="cf-report-who">${p.who}<span>${p.what}</span></div><div class="cf-report-hint">${p.hint}</div></div>`).join('');
  return `
  <div class="panel">
    <button class="cf-back-link" id="cfBackToCase">← Back to the case</button>
    <div class="cf-case-tag">GROUP ${c.n} REPORT GUIDE</div>
    <h3 class="cf-case-title" style="font-size:19px;">Report to the Class</h3>
    <p style="color:var(--muted);font-size:13.5px;margin-top:6px;">About 3 to 4 minutes. This is a REPORT, not a role-play. Every student in your group must speak.</p>
    <div class="cf-report-list">${partRows}</div>
    <p style="color:var(--muted);font-size:12.5px;margin-top:10px;">Divide these parts among your group so everyone speaks. If your group has more members, split one part between two students, or add a short extra part.</p>
    <hr class="hairline">
    <h4 class="cf-block-h">Don't forget</h4>
    <p style="margin-top:4px;">Use at least 4 MICE vocabulary words from Worksheet Question 5.</p>
    <hr class="hairline">
    <h4 class="cf-block-h">Teacher may ask</h4>
    <ul class="cf-questions">
      <li>${c.teacherFollowUp}</li>
      <li>Why did your group choose this solution?</li>
    </ul>
    <button class="startbtn" id="cfNewGroup" style="margin-top:18px;">CHOOSE A DIFFERENT GROUP</button>
  </div>`;
}

function wireCaseFile(){
  if(cfState.phase==='pick'){
    document.querySelectorAll('#app [data-pick]').forEach(el=>{
      el.addEventListener('click', ()=>{
        cfState.groupN = Number(el.dataset.pick);
        cfState.phase = 'case';
        renderAll();
      });
    });
  } else if(cfState.phase==='case'){
    document.getElementById('cfBackToPick').addEventListener('click', ()=>{ cfState = freshCfState(); renderAll(); });
    document.getElementById('cfSeeReport').addEventListener('click', ()=>{
      markActivityComplete('casefile', {score:`Group ${cfState.groupN}: ${cfCase().title}`});
      cfState.phase = 'report';
      renderAll();
    });
  } else if(cfState.phase==='report'){
    document.getElementById('cfBackToCase').addEventListener('click', ()=>{ cfState.phase = 'case'; renderAll(); });
    document.getElementById('cfNewGroup').addEventListener('click', ()=>{ cfState = freshCfState(); renderAll(); });
  }
}

/* ===== Vocabulary Race (Remember-level quick recall, replaces the crossword slot) =====
   Same objective as the old crossword (recall this unit's 10 key words), a
   faster-paced format: one definition at a time, tap the matching word,
   an elapsed timer keeps the pace up without a punishing countdown. */
function renderCrossword(){
  return `
  <div class="section-eyebrow">Section 13 ${tierTag('core')}</div>
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
  <div class="section-eyebrow">Section 14 ${tierTag('extension')}</div>
  <h2 class="section-title">Peer Checklist &amp; Bonus</h2>
  <p class="section-sub">Evaluate your partner's pitch and booth conversation. Check off each item as you observe it.</p>
  <div class="panel">
    ${checklist}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Bonus: Pitch a Different Product</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:6px;">Choose ONE situation below and prepare a short pitch using the Useful Phrases from Section 6.</p>
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
  <div class="section-eyebrow">Section 15 ${tierTag('homework')}</div>
  <h2 class="section-title">Writing Task</h2>
  <p class="section-sub">${WRITING_TASK.prompt}</p>
  <div class="panel">
    <div class="email-template">
      <p>Dear [Visitor Name],</p>
      <textarea id="s9writing" class="challenge-textarea" rows="5" style="margin-top:14px;" placeholder="Write your 4–6 sentence follow-up email here…"></textarea>
      <p style="margin-top:24px;">We look forward to working with you.</p>
      <p style="margin-top:10px;">Warm regards,<br>Booth Team</p>
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
  <div class="section-eyebrow">Section 16 ${tierTag('core')}</div>
  <h2 class="section-title">Self-Check</h2>
  <p class="section-sub">Rate yourself honestly. Your teacher remains the final evaluator.</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-family:'Oswald';color:var(--navy);font-size:15px;letter-spacing:.03em;">By the end of this lesson, you should feel more confident greeting visitors, giving a pitch, and closing a booth conversation at a MICE event.</p>
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
    <h1>You can <span>work the booth.</span></h1>
    <p>Keep practicing your pitch, and remember: every visitor is a chance to make a real connection.</p>
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
  document.getElementById('completePracticeBtn').addEventListener('click', ()=> goTo(13));
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
  {r:renderCaseFile, w:wireCaseFile},
  {r:()=>renderSurprise(SURPRISE_CHALLENGE, `Section 12 ${tierTag('core')}`), w:()=>wireSurprise(SURPRISE_CHALLENGE)},
  {r:renderCrossword, w:wireCrossword},
  {r:renderPractice, w:wirePractice},
  {r:renderS9, w:wireS9},
  {r:renderS10, w:wireS10},
  {r:()=>renderExit(EXIT_TICKET, `Section 17 ${tierTag('core')}`), w:()=>wireExit(EXIT_TICKET)},
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
