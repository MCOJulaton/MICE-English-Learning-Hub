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
   Group-based, not individual: this activity runs on one shared device
   per group of 5-6 students, so progress is tracked per group rather
   than per student ID. */
const DATA_ENDPOINT = "https://script.google.com/macros/s/AKfycbxDECOuXf3HMxPVLT1fhfOHE5g-Gq1juG5enaCoUrShk9vEMfctgy-URKmqmvPGeoE/exec";

const TRACKED_ACTIVITIES = ['checkin','listen1','listen2','reflect'];

const Progress = {
  groupId: null, groupLabel: '', members: '',
  date:'', startTime:'',
  activities:{}
};
let pendingRecords = [];

function isEndpointConfigured(){
  return typeof DATA_ENDPOINT === 'string' && DATA_ENDPOINT.trim() !== '' && DATA_ENDPOINT.indexOf('PASTE_') !== 0;
}
function buildRecord(activity, {score=null, completionStatus='completed'}={}){
  return {
    studentId: Progress.groupId ? `Group ${Progress.groupId}` : '',
    studentName: Progress.groupLabel ? `${Progress.groupLabel} (${Progress.members || 'members not listed'})` : '',
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
  if(!Progress.groupLabel){ el.style.display='none'; return; }
  el.style.display='';
  el.innerHTML = `<b>${Progress.groupLabel}</b> · ${completedCount()}/${TRACKED_ACTIVITIES.length} done`;
}

/* ===================== VOICE ENGINE =====================
   Plays a conversation as a sequence of utterances, one voice per
   character, using the requested locale in that character's voices
   map (see data.js). Falls back gracefully through: exact locale,
   same language any region, any English voice, then any voice at all,
   so the activity still works on a device missing a specific accent. */
const VoiceEngine = (function(){
  let allVoices = [];
  let playing = false;
  let queue = [];
  let queueIndex = 0;
  let onStateChange = ()=>{};
  let onCompleteCallback = null;

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    onStateChange();
  }
  if('speechSynthesis' in window){
    window.speechSynthesis.onvoiceschanged = refresh;
    refresh();
  }
  /* Name-hint lists are intentionally broad: they cover the default voices
     shipped by Chrome/Edge/Safari on Windows, macOS, and Android/ChromeOS
     school devices (David/Zira/Mark on Windows, Daniel/Karen/Martha on
     macOS, Natasha/William/Connor/Emily on Edge's "Online (Natural)"
     voices), plus a generic "female"/"male" word match for voices labelled
     that way directly (e.g. "Google UK English Female"). Even with all of
     that, a device may still expose only ONE English voice with no gender
     cue in its name at all — see the pitch step in makeUtterance below,
     which is what actually guarantees male and female characters never
     sound identical even in that worst case. */
  const FEMALE_NAME_HINTS = /\b(female|kate|serena|stephanie|fiona|hazel|libby|sonia|olivia|amy|emma|joanna|moira|tessa|karen|susan|zira|samantha|victoria|ava|allison|zoe|nicky|jenny|aria|michelle|veena|natasha|emily|martha|catherine|linda|salli|kimberly|ivy|kendra|nia|geraldine|elizabeth)\b/i;
  const MALE_NAME_HINTS = /\b(male|daniel|arthur|george|oliver|ryan|brian|matthew|guy|alex|tom|aaron|gordon|justin|rishi|lee|david|mark|william|connor|liam|neil|sean|kevin|joey|russell)\b/i;
  /* macOS in particular ships a set of "novelty" voices alongside its real
     ones (Fred is the textbook example of a deliberately robotic voice;
     Grandma/Grandpa/Eddy/Rocko/Reed/Shelley/Sandy/Flo are cartoonish
     "personality" voices, and Albert/Bad News/Zarvox/etc. are sound
     effects, not speech). A name can be a perfectly good gender match and
     still be one of these — so they're excluded from the primary search
     and only used as an absolute last resort, below, if nothing else at
     all is available for English. */
  const NOVELTY_NAME_HINTS = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|deranged|good news|hysterical|jester|organ|pipe organ|trinoids|whisper|zarvox|junior|ralph|kathy|princess|fred|bruce|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|superstar)\b/i;
  function pickFrom(list, loc, lang, genderRe){
    // Gender match is tried across ANY English accent before falling back
    // to the right accent with the wrong gender — a different accent is a
    // minor, forgivable mismatch for a listening exercise; the wrong
    // gender voice for a named character is not.
    return list.find(v => v.lang.toLowerCase() === loc && genderRe.test(v.name))
        || list.find(v => v.lang.toLowerCase().startsWith(lang + '-') && genderRe.test(v.name))
        || list.find(v => /^en/i.test(v.lang) && genderRe.test(v.name))
        || list.find(v => v.lang.toLowerCase() === loc)
        || list.find(v => v.lang.toLowerCase().startsWith(loc))
        || list.find(v => v.lang.toLowerCase().startsWith(lang + '-'))
        || list.find(v => /^en/i.test(v.lang))
        || null;
  }
  function resolveVoice(locale, gender){
    if(!allVoices.length) return null;
    const loc = (locale || 'en-US').toLowerCase();
    const lang = loc.split('-')[0];
    const genderRe = gender === 'M' ? MALE_NAME_HINTS : FEMALE_NAME_HINTS;
    const goodVoices = allVoices.filter(v => !NOVELTY_NAME_HINTS.test(v.name));
    return pickFrom(goodVoices, loc, lang, genderRe)
        || pickFrom(allVoices, loc, lang, genderRe)
        || allVoices[0];
  }
  function splitSentences(text){
    return text.replace(/([.!?])\s+/g,'$1|').split('|').map(s=>s.trim()).filter(Boolean);
  }
  /* Pitch is shifted by gender on every utterance, on top of whatever
     voice got resolved above. This is the real fix for "every character
     sounds like the same robotic voice": named-voice matching only helps
     when the device actually has 2+ distinct English voices installed,
     but plenty of classroom Chromebooks/Windows PCs expose just one
     ungendered voice (e.g. plain "Google US English"). Shifting pitch
     guarantees male and female characters are still audibly different
     even then, and it also softens the flat, monotone read that reads
     as "robotic" when every line uses the same default pitch. */
  function makeUtterance(text, voice, gender){
    const u = new SpeechSynthesisUtterance(text);
    if(voice){ u.voice = voice; u.lang = voice.lang; }
    u.rate = 0.95;
    u.pitch = gender === 'M' ? 0.88 : 1.12;
    return u;
  }
  function playNext(){
    if(queueIndex >= queue.length){
      playing = false; onStateChange();
      const cb = onCompleteCallback; onCompleteCallback = null;
      if(cb) cb();
      return;
    }
    const item = queue[queueIndex];
    const sentences = splitSentences(item.text);
    let sIdx = 0;
    function playSentence(){
      if(sIdx >= sentences.length){ queueIndex++; setTimeout(playNext, 380); return; }
      const u = makeUtterance(sentences[sIdx], item.voice, item.gender);
      u.onend = ()=>{ sIdx++; setTimeout(playSentence, 150); };
      u.onerror = ()=>{ sIdx++; setTimeout(playSentence, 150); };
      window.speechSynthesis.speak(u);
    }
    playSentence();
  }
  return {
    isPlaying(){ return playing; },
    onChange(fn){ onStateChange = fn; },
    playConversation(script, voicesMap, onComplete){
      this.stop();
      queue = script.map(l => {
        const gender = (typeof GENDER!=='undefined' && GENDER[l.who]) || 'F';
        return { text: l.text, voice: resolveVoice(voicesMap[l.who] || 'en-US', gender), gender };
      });
      onCompleteCallback = onComplete || null;
      queueIndex = 0; playing = true; onStateChange();
      playNext();
    },
    stop(){
      window.speechSynthesis.cancel();
      playing = false; queue = []; queueIndex = 0; onCompleteCallback = null;
      onStateChange();
    }
  };
})();
window.addEventListener('pagehide', ()=> VoiceEngine.stop());

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">MICE INDUSTRY MANAGEMENT PROGRAM</div>
    <h1>MICE Integrated <span>Listening Challenge.</span></h1>
    <p>Units 7 and 8: Client Service, Professional Hospitality, Problem Solving, and Emergency Communication. Complete this after your Kahoot or Blooket review.</p>
    <button class="startbtn" onclick="goNext()">Begin the discussion →</button>
  </div>`;
}

/* ---- Class Discussion (whole-class, one shared screen) ----
   Student-facing only: no teacher notes or "ask the class" framing here.
   That guidance lives in teacher.html, the private teacher reference page,
   since the teacher runs this discussion live and doesn't need her own
   notes echoed back on the screen the class is looking at. */
function renderDiscuss(){
  const cards = DISCUSSION_POINTS.map(p=>`
    <div class="disc-card">
      <div class="disc-num">${p.n}</div>
      <div>
        <h3>${p.title}</h3>
        <p class="disc-ask">${p.ask}</p>
        <div class="phrase-chip-row">${p.phrases.map(ph=>`<span class="phrase-chip static">${ph}</span>`).join('')}</div>
        ${p.dialogue ? `<div class="mini-dialogue">${p.dialogue.map(d=>`<p><b>${d.who}:</b> ${d.text}</p>`).join('')}</div>` : ''}
      </div>
    </div>`).join('');
  const phraseBank = Object.entries(PHRASE_BANK).map(([cat, phrases])=>`
    <div class="panel" style="margin-top:14px;">
      <h4 style="font-size:14px;color:var(--navy);">${cat}</h4>
      <div class="phrase-chip-row">${phrases.map(p=>`<span class="phrase-chip static">${p}</span>`).join('')}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Part 1: Class Discussion</div>
  <h2 class="section-title">Client Service and Emergency Communication</h2>
  <p class="section-sub">About 20 minutes. Let's talk about these topics together as a class.</p>
  <div class="disc-deck">${cards}</div>
  <div class="panel" style="margin-top:26px;">
    <h3 style="font-size:15px;color:var(--navy);">Full Phrase Bank</h3>
    ${phraseBank}
  </div>
  <button class="tb-btn primary" id="discussDone" style="background:var(--orange);border-color:var(--orange-deep);margin-top:22px;">We finished the discussion. Start the challenge →</button>`;
}
function wireDiscuss(){
  document.getElementById('discussDone').addEventListener('click', ()=> goNext());
}

/* ---- Group Check-In ---- */
function renderCheckin(){
  const groupBtns = GROUPS.map(g=>`<button class="pick-tile" data-group="${g.id}">${g.label}</button>`).join('');
  return `
  <div class="section-eyebrow">Group Check-In</div>
  <h2 class="section-title">Get Into Your Groups</h2>
  <p class="section-sub">6 groups, about 5 to 6 students each. Each group uses ONE device. Choose your group number below.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Choose Your Group</h3>
    <div class="pick-grid" id="groupPicks">${groupBtns}</div>
    <h3 style="font-size:15px;color:var(--navy);margin-top:22px;">Group Members</h3>
    <input type="text" id="ciMembers" class="challenge-textarea" placeholder="Type your group members' names, separated by commas">
    <button class="tb-btn primary" id="ciStart" style="background:var(--teal);border-color:var(--teal);margin-top:18px;" disabled>Choose a group first</button>
  </div>
  <div class="panel speak-banner">
    <p><b>Remember:</b> everyone writes their own answer first. Then your group discusses and agrees on ONE final answer.</p>
  </div>
  <div class="panel speak-banner" style="border-color:var(--teal);background:#EAF3F2;">
    <p><b>About AI:</b> you may use AI to check your English after you answer, but your answers must come from the listening.</p>
  </div>`;
}
function wireCheckin(){
  const picks = document.getElementById('groupPicks');
  const startBtn = document.getElementById('ciStart');
  let chosenGroup = null;
  picks.addEventListener('click', e=>{
    const btn = e.target.closest('.pick-tile'); if(!btn) return;
    [...picks.children].forEach(b=>b.classList.remove('sel'));
    btn.classList.add('sel');
    chosenGroup = +btn.dataset.group;
    startBtn.disabled = false;
    startBtn.textContent = `Start as ${GROUPS.find(g=>g.id===chosenGroup).label}`;
  });
  startBtn.addEventListener('click', ()=>{
    if(!chosenGroup) return;
    const members = document.getElementById('ciMembers').value.trim();
    const now = new Date();
    Progress.groupId = chosenGroup;
    Progress.groupLabel = GROUPS.find(g=>g.id===chosenGroup).label;
    Progress.members = members;
    Progress.date = now.toISOString().slice(0,10);
    Progress.startTime = now.toISOString();
    markActivityComplete('checkin', {score: members || 'no members listed'});
    updateTopbarBadge();
    goNext();
  });
}

/* ---- Listening 1 and Listening 2 (shared renderer) ---- */
let listenState = { listen1:{plays:0}, listen2:{plays:0} };
function listenReset(key){ listenState[key] = {plays:0}; }

function currentListening(idx){
  if(!Progress.groupId) return null;
  const group = GROUPS.find(g=>g.id===Progress.groupId);
  return group ? group.listenings[idx] : null;
}

function renderListeningSection(sectionKey, idx, label){
  const listening = currentListening(idx);
  if(!listening){
    return `
    <div class="section-eyebrow">${label}</div>
    <h2 class="section-title">Please Check In First</h2>
    <p class="section-sub">Go back to Group Check-In and choose your group before starting this listening.</p>`;
  }
  const questionsHtml = listening.questions.map((q,qi)=>{
    const qLabel = qi<3 ? `Question ${qi+1}` : `Question ${qi+1} (Why?)`;
    return `
    <div class="reflect-row">
      <p class="reflect-q">${qLabel}: ${q.q}</p>
      <textarea class="challenge-textarea listen-answer" data-qi="${qi}" rows="2" placeholder="Write your group's answer here" disabled></textarea>
      ${qi>=3 ? `<p style="color:var(--muted);font-size:12.5px;font-style:italic;margin-top:8px;">What did you hear that helped you answer?</p><textarea class="challenge-textarea listen-evidence" data-qi="${qi}" rows="2" placeholder="What information from the listening helped you?" disabled></textarea>` : ''}
    </div>`;
  }).join('');
  return `
  <div class="section-eyebrow">${label}</div>
  <h2 class="section-title">${listening.title}</h2>
  <p class="section-sub">${listening.setting}</p>
  <div class="panel">
    <div class="listen-status" id="${sectionKey}Status">Listen carefully. Do not write yet.</div>
    <button class="tb-btn primary listen-play-btn" id="${sectionKey}Play" style="background:var(--orange);border-color:var(--orange-deep);margin-top:16px;">${icon('play',{size:16})} Listen</button>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Answer as a Group</h3>
    <p style="color:var(--muted);font-size:13px;margin-top:4px;">Write your own answer first on paper, then agree with your group before typing the final answer.</p>
    ${questionsHtml}
    <button class="tb-btn primary" id="${sectionKey}Submit" style="background:var(--teal);border-color:var(--teal);margin-top:18px;" disabled>Listen twice first</button>
  </div>`;
}
function wireListeningSection(sectionKey, idx){
  const listening = currentListening(idx);
  if(!listening) return;
  const state = listenState[sectionKey];
  const statusEl = document.getElementById(`${sectionKey}Status`);
  const playBtn = document.getElementById(`${sectionKey}Play`);
  const submitBtn = document.getElementById(`${sectionKey}Submit`);
  const inputs = document.querySelectorAll(`#app .listen-answer, #app .listen-evidence`);

  function refreshUI(){
    if(state.plays >= 2){
      playBtn.disabled = true;
      playBtn.innerHTML = `${icon('check',{size:16})} Finished listening (2 of 2)`;
      statusEl.textContent = 'You have listened twice. Discuss with your group, then finish your answers.';
      inputs.forEach(i=> i.disabled = false);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Our Group\'s Answers';
    } else if(state.plays === 1){
      playBtn.disabled = VoiceEngine.isPlaying();
      playBtn.innerHTML = `${icon('play',{size:16})} Listen Again`;
      statusEl.textContent = VoiceEngine.isPlaying() ? 'Playing...' : 'Good. Now listen one more time, then write your answers.';
      inputs.forEach(i=> i.disabled = false);
    } else {
      playBtn.disabled = VoiceEngine.isPlaying();
      playBtn.innerHTML = `${icon('play',{size:16})} Listen`;
      statusEl.textContent = VoiceEngine.isPlaying() ? 'Playing...' : 'Listen carefully. Do not write yet.';
      inputs.forEach(i=> i.disabled = true);
    }
  }
  playBtn.addEventListener('click', ()=>{
    if(state.plays >= 2 || VoiceEngine.isPlaying()) return;
    refreshUI();
    VoiceEngine.playConversation(listening.script, listening.voices, ()=>{
      state.plays++;
      refreshUI();
    });
  });
  submitBtn.addEventListener('click', ()=>{
    const answers = listening.questions.map((q,qi)=>{
      const a = document.querySelector(`.listen-answer[data-qi="${qi}"]`).value.trim();
      return a;
    });
    const answeredCount = answers.filter(Boolean).length;
    markActivityComplete(sectionKey, {score:`${answeredCount}/${listening.questions.length} answered`});
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitted! Continue when ready.';
  });
  refreshUI();
}
function renderListen1(){ return renderListeningSection('listen1', 0, 'Listening 1 of 2'); }
function wireListen1(){ wireListeningSection('listen1', 0); }
function renderListen2(){ return renderListeningSection('listen2', 1, 'Listening 2 of 2'); }
function wireListen2(){ wireListeningSection('listen2', 1); }

/* ---- Reflection ---- */
function renderReflect(){
  const rows = REFLECTION_QUESTIONS.map((q,i)=>`
    <div class="reflect-row">
      <p class="reflect-q">${q}</p>
      <textarea class="challenge-textarea" id="reflect${i}" rows="2" placeholder="Type your answer..."></textarea>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Reflection</div>
  <h2 class="section-title">Before We Finish</h2>
  <p class="section-sub">A short reflection, about 5 minutes.</p>
  <div class="panel">
    ${rows}
    <button class="tb-btn primary" id="reflectDone" style="background:var(--teal);border-color:var(--teal);margin-top:18px;">Submit Reflection</button>
  </div>`;
}
function wireReflect(){
  document.getElementById('reflectDone').addEventListener('click', (e)=>{
    const answers = REFLECTION_QUESTIONS.map((q,i)=> document.getElementById(`reflect${i}`).value.trim()).filter(Boolean);
    markActivityComplete('reflect', {score:`${answers.length}/${REFLECTION_QUESTIONS.length} answered`});
    e.target.disabled = true;
    e.target.textContent = 'Thank you!';
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">CHALLENGE COMPLETE</div>
    <h1>Great <span>listening.</span></h1>
    <p>You handled client service and emergency situations, just by listening carefully. Ready for a short exam briefing? Your teacher will take it from here.</p>
    <div class="complete-actions">
      <button class="tb-btn primary" id="completePracticeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('rotateCcw',{size:16})}</span> Practice Again</button>
      <button class="tb-btn" id="completeHomeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('home',{size:16})}</span> Back to Start</button>
      <a class="tb-btn" id="completeUnitsBtn" href="../index.html" style="padding:16px 26px;font-size:15px;">All MICE Units</a>
    </div>
    <div class="complete-stats" id="completeStats"></div>
  </div>`;
}
let lessonCompleteSent = false;
function wireComplete(){
  document.getElementById('completePracticeBtn').addEventListener('click', ()=> goTo(2));
  document.getElementById('completeHomeBtn').addEventListener('click', ()=> goTo(0));
  const stats = document.getElementById('completeStats');
  if(stats){
    stats.innerHTML = `
      <p class="complete-stats-intro">Your group's progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Steps Completed</div></div>
      </div>`;
  }
  if(!lessonCompleteSent && Progress.groupId){
    lessonCompleteSent = true;
    sendProgressRecord(buildRecord('Lesson Complete', {score: `${completedCount()}/${TRACKED_ACTIVITIES.length}`, completionStatus:'completed'}));
  }
}

const RENDERERS = [
  {r:renderCover, w:null},
  {r:renderDiscuss, w:wireDiscuss},
  {r:renderCheckin, w:wireCheckin},
  {r:renderListen1, w:wireListen1},
  {r:renderListen2, w:wireListen2},
  {r:renderReflect, w:wireReflect},
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
document.getElementById('btnReset').addEventListener('click', ()=>{
  if(current === RENDERERS.findIndex(r=>r.r===renderListen1)) listenReset('listen1');
  if(current === RENDERERS.findIndex(r=>r.r===renderListen2)) listenReset('listen2');
  renderAll();
});

renderAll();
