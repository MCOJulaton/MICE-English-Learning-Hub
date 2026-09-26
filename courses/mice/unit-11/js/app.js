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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12'];

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
const CHECKIN_STORAGE_KEY = 'mice_u11_checkin';
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
   Two roles used across this unit's example lines: 'staff' (British
   English female voice, the MICE staff member modelling the apology/
   saying-no patterns) and 'delegate' (American male voice, the guest or
   delegate raising the problem). Same novelty-voice-exclusion +
   quality-sort + pitch-safety-net pattern established for Units 9 and
   10's own VoiceEngine copies, kept in sync with Unit 10's picker logic
   so the staff voice sounds the same across units. */
const VoiceEngine = (function(){
  let allVoices = [];
  let staffVoice = null, delegateVoice = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const FEMALE_NAME_HINTS = /\b(kate|serena|stephanie|fiona|hazel|libby|sonia|olivia|amy|emma|joanna|shelley|flo|sandy|moira|tessa|karen|susan|zira|samantha|victoria|ava|allison|zoe|nicky|jenny|aria|michelle|female)\b/i;
  const MALE_NAME_HINTS = /\b(daniel|arthur|george|oliver|ryan|brian|matthew|guy|eddy|rocko|reed|alex|tom|aaron|gordon|justin|bruce|male)\b/i;
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
    u.pitch = kind === 'delegate' ? 0.88 : (kind === 'manager' ? 0.97 : 1.06);
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
    <h1>Unit 11: <span>Apologizing &amp; Saying No Professionally</span></h1>
    <p>A guest has a problem. What do you say? In this unit you'll learn two simple patterns, then practice them across real MICE situations: Meetings, Incentives, Conferences, Exhibitions, and Wellness Tourism.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> 2 Patterns</div>
      <div class="signchip"><span class="arrow">→</span> 5 MICE Areas</div>
      <div class="signchip"><span class="arrow">→</span> Real Practice</div>
      <div class="signchip"><span class="arrow">→</span> Quiz + Speaking</div>
    </div>
    <button class="startbtn" onclick="goNext()">Start practicing →</button>
  </div>`;
}

/* ===== Section 1: Quick Start ===== */
function renderS1(){
  const facts = QUICK_START.facts.map(f=>`<li>${f}</li>`).join('');
  const options = QUICK_START.options.map((o,i)=>`<button class="choice-btn scenario-choice" data-i="${i}">${o.text}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Quick Start</h2>
  <p class="section-sub">Read the situation, then guess what a professional would say.</p>
  <div class="panel">
    <ul style="margin:0 0 0 18px;padding:0;line-height:1.9;font-size:14.5px;color:var(--ink);">${facts}</ul>
    <div class="scenario-message">${QUICK_START.message}</div>
    <p style="font-weight:700;color:var(--navy);margin-top:16px;">${QUICK_START.question}</p>
    <div class="choices" id="scenarioChoices" style="margin-top:14px;">${options}</div>
    <div class="feedback" id="scenarioFeedback" style="display:block;"></div>
  </div>`;
}
function wireS1(){
  const scenarioChoices = document.getElementById('scenarioChoices');
  const scenarioFeedback = document.getElementById('scenarioFeedback');
  scenarioChoices.addEventListener('click', e=>{
    const btn = e.target.closest('.scenario-choice'); if(!btn) return;
    const i = +btn.dataset.i;
    const opt = QUICK_START.options[i];
    document.querySelectorAll('#scenarioChoices .choice-btn').forEach(b=>b.classList.remove('sel','correct','wrong'));
    btn.classList.add('sel', opt.good ? 'correct' : 'wrong');
    scenarioFeedback.className = 'feedback show ' + (opt.good ? 'good' : 'meh');
    scenarioFeedback.textContent = opt.note;
    markActivityComplete('s1', {completionStatus:'reached'});
  });
}

/* ===== Section 2: Learn the Patterns ===== */
function renderS2(){
  const patternBlock = (p) => `
    <div class="pattern-block">
      <h3 style="font-size:16px;color:var(--navy);">${p.name}</h3>
      <p style="font-family:'Oswald';font-weight:700;color:var(--orange-deep);letter-spacing:.03em;margin-top:4px;">${p.formula}</p>
      <div class="pattern-steps">
        ${p.steps.map(s=>`<div class="pattern-step"><span class="pattern-key">${s.k}</span><span class="pattern-ex">"${s.example}"</span></div>`).join('')}
      </div>
    </div>`;
  const tips = PATTERN_TIPS.map(t=>`<li>${t}</li>`).join('');
  const never = NEVER_SAY.map(n=>`<span class="phrase-card"><span class="txt">${n}</span></span>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Learn the Patterns</h2>
  <p class="section-sub">Two short patterns. Learn them now, you'll use them the rest of this unit.</p>
  <div class="panel">
    ${patternBlock(APOLOGY_PATTERN)}
    <button class="audio-mini" data-say="${APOLOGY_PATTERN.steps.map(s=>s.example).join(' ')}" style="margin-top:8px;"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
  </div>
  <div class="panel">
    ${patternBlock(SAYING_NO_PATTERN)}
    <button class="audio-mini" data-say="${SAYING_NO_PATTERN.steps.map(s=>s.example).join(' ')}" style="margin-top:8px;"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Tips</h3>
    <ul style="margin:8px 0 0 18px;padding:0;line-height:1.9;font-size:14px;color:var(--ink);">${tips}</ul>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--orange-deep);font-size:13px;">NEVER SAY:</p>
    <div class="phrase-list" style="margin-top:8px;">${never}</div>
  </div>`;
}
function wireS2(){
  document.querySelectorAll('#app .audio-mini').forEach(btn=>{
    btn.addEventListener('click', ()=> speak(btn.dataset.say, 'staff'));
  });
  markActivityComplete('s2', {completionStatus:'reached'});
}

/* ===== Section 3: Take Note (personal phrase bank) ===== */
function renderS3(){
  const banks = TAKE_NOTE_BANKS.map(b=>`
    <div class="panel">
      <h3 style="font-size:15px;color:var(--navy);">${b.label}</h3>
      <p style="color:var(--muted);font-size:12.5px;margin-top:2px;">${b.sub}</p>
      <textarea id="note-${b.id}" class="challenge-textarea" rows="4" style="margin-top:10px;" placeholder="${b.placeholder}"></textarea>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Take Note</h2>
  <p class="section-sub">Build your own phrase bank. Use the patterns from Section 2, then add your own words. You'll use this later.</p>
  ${banks}`;
}
function wireS3(){
  const NOTE_KEY = 'mice_u11_takenote';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(NOTE_KEY)) || {}; } catch(e){}
  TAKE_NOTE_BANKS.forEach(b=>{
    const box = document.getElementById(`note-${b.id}`);
    if(saved[b.id]) box.value = saved[b.id];
    box.addEventListener('input', ()=>{
      saved[b.id] = box.value;
      try { localStorage.setItem(NOTE_KEY, JSON.stringify(saved)); } catch(e){}
      const filled = TAKE_NOTE_BANKS.every(x => (saved[x.id]||'').trim().length > 0);
      if(filled) markActivityComplete('s3', {completionStatus:'reached'});
    });
  });
}

/* ===== Section 4: Vocabulary ===== */
function renderS4(){
  const cards = VOCAB.map(v=>`
    <div class="loc-card" data-id="${v.id}">
      <img class="photo" src="${v.photo}" alt="${v.nm}" loading="lazy">
      <div class="nm">${v.nm}</div>
      <div class="loc-detail">
        <div class="vocab-example">"${v.ex}"</div>
        <span style="font-family:'Oswald';font-size:11px;color:var(--muted);">${v.type}</span> ${v.def}
        <br><button class="audio-mini" data-say="${v.ex.replace(/"/g,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
      </div>
    </div>`).join('');
  const blanks = FILL_BLANK.map((f,i)=>`
    <div class="fillblank-row">
      <p style="font-size:14px;color:var(--ink);flex:1;min-width:220px;">${i+1}. ${f.q}</p>
      <input type="text" class="dictation-input" id="fbInput${i}" style="max-width:200px;">
      <button class="tb-btn" id="fbCheck${i}" style="padding:8px 14px;font-size:12.5px;">Check</button>
      <div class="feedback" data-bfb="${i}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Vocabulary</h2>
  <p class="section-sub">Click a photo to zoom in. Click a word to see it used in a real situation.</p>
  <div class="panel">
    <div class="loc-grid">${cards}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Fill in the Blank</h3>
    ${blanks}
  </div>
  <div class="photo-lightbox" id="photoLightbox">
    <img id="photoLightboxImg" src="" alt="">
    <button class="photo-lightbox-close" id="photoLightboxClose" aria-label="Close">&times;</button>
  </div>`;
}
function wireS4(){
  document.querySelectorAll('#app .loc-card .audio-mini').forEach(btn=>{
    btn.addEventListener('click', e=>{ speak(btn.dataset.say,'staff'); e.stopPropagation(); });
  });
  document.querySelectorAll('#app .loc-card').forEach(card=>{
    card.addEventListener('click', ()=> card.classList.toggle('open'));
  });
  const lightbox = document.getElementById('photoLightbox');
  const lightboxImg = document.getElementById('photoLightboxImg');
  function openLightbox(src, alt){
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('show');
  }
  function closeLightbox(){
    lightbox.classList.remove('show');
  }
  document.querySelectorAll('#app .loc-card .photo').forEach(img=>{
    img.addEventListener('click', e=>{
      e.stopPropagation();
      openLightbox(img.src, img.alt);
    });
  });
  lightbox.addEventListener('click', closeLightbox);
  document.getElementById('photoLightboxClose').addEventListener('click', e=>{ e.stopPropagation(); closeLightbox(); });
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
      if(blanksAnswered.size >= FILL_BLANK.length) markActivityComplete('s4', {score:`${blanksAnswered.size}/${FILL_BLANK.length}`});
    }
    document.getElementById(`fbCheck${i}`).addEventListener('click', check);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); check(); } });
    input.addEventListener('input', ()=> input.classList.remove('correct','wrong'));
  });
}

/* ===== Section 5: Choose the Best Response ===== */
function renderS5(){
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Choose the Best Response</h2>
  <p class="section-sub">Read the situation. Choose the most professional response.</p>
  <div class="panel">
    <div class="race-progress" id="crProgress"></div>
    <p id="crTag" style="font-family:'Oswald';font-size:12px;letter-spacing:.05em;color:var(--orange-deep);margin-top:10px;"></p>
    <p id="crSituation" style="font-weight:700;color:var(--navy);font-size:16px;margin-top:4px;"></p>
    <div class="choices" id="crChoices" style="margin-top:14px;grid-template-columns:1fr;"></div>
    <div class="feedback" id="crFeedback"></div>
  </div>`;
}
function wireS5(){
  let idx = 0, correct = 0;
  const progressEl = document.getElementById('crProgress');
  const tagEl = document.getElementById('crTag');
  const sitEl = document.getElementById('crSituation');
  const choicesEl = document.getElementById('crChoices');
  const fb = document.getElementById('crFeedback');
  function showQuestion(){
    if(idx >= CHOOSE_RESPONSE_ITEMS.length){
      progressEl.textContent = 'Done';
      tagEl.textContent = '';
      sitEl.textContent = `Finished! ${correct}/${CHOOSE_RESPONSE_ITEMS.length} correct.`;
      choicesEl.innerHTML = '';
      fb.className = 'feedback';
      markActivityComplete('s5', {score:`${correct}/${CHOOSE_RESPONSE_ITEMS.length}`});
      return;
    }
    const item = CHOOSE_RESPONSE_ITEMS[idx];
    progressEl.textContent = `Situation ${idx+1} of ${CHOOSE_RESPONSE_ITEMS.length}`;
    tagEl.textContent = item.tag.toUpperCase();
    sitEl.textContent = item.situation;
    choicesEl.innerHTML = item.options.map((o,i)=>`<button class="choice-btn" data-i="${i}" style="text-align:left;">${o.text}</button>`).join('');
    fb.className = 'feedback';
  }
  choicesEl.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn || btn.disabled) return;
    document.querySelectorAll('#crChoices .choice-btn').forEach(b=>b.disabled = true);
    const item = CHOOSE_RESPONSE_ITEMS[idx];
    const opt = item.options[+btn.dataset.i];
    btn.classList.add(opt.good ? 'correct' : 'wrong');
    if(opt.good) correct++;
    fb.className = 'feedback show ' + (opt.good ? 'good' : 'meh');
    fb.textContent = opt.note;
    idx++;
    setTimeout(showQuestion, 1400);
  });
  showQuestion();
}

/* ===== Section 6: Fix the Response ===== */
function renderS6(){
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Fix the Response</h2>
  <p class="section-sub">This response is unprofessional. Choose the better version.</p>
  <div class="panel">
    <div class="race-progress" id="frProgress"></div>
    <div class="scenario-message" id="frBad" style="margin-top:10px;"></div>
    <div class="choices" id="frChoices" style="margin-top:14px;grid-template-columns:1fr;"></div>
    <div class="feedback" id="frFeedback"></div>
  </div>`;
}
function wireS6(){
  let idx = 0, correct = 0;
  const progressEl = document.getElementById('frProgress');
  const badEl = document.getElementById('frBad');
  const choicesEl = document.getElementById('frChoices');
  const fb = document.getElementById('frFeedback');
  function showQuestion(){
    if(idx >= FIX_RESPONSE_ITEMS.length){
      progressEl.textContent = 'Done';
      badEl.textContent = `Finished! ${correct}/${FIX_RESPONSE_ITEMS.length} correct.`;
      choicesEl.innerHTML = '';
      fb.className = 'feedback';
      markActivityComplete('s6', {score:`${correct}/${FIX_RESPONSE_ITEMS.length}`});
      return;
    }
    const item = FIX_RESPONSE_ITEMS[idx];
    progressEl.textContent = `Sentence ${idx+1} of ${FIX_RESPONSE_ITEMS.length}`;
    badEl.textContent = `"${item.bad}"`;
    choicesEl.innerHTML = item.options.map((o,i)=>`<button class="choice-btn" data-i="${i}" style="text-align:left;">${o.text}</button>`).join('');
    fb.className = 'feedback';
  }
  choicesEl.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn || btn.disabled) return;
    document.querySelectorAll('#frChoices .choice-btn').forEach(b=>b.disabled = true);
    const item = FIX_RESPONSE_ITEMS[idx];
    const opt = item.options[+btn.dataset.i];
    btn.classList.add(opt.good ? 'correct' : 'wrong');
    if(opt.good) correct++;
    fb.className = 'feedback show ' + (opt.good ? 'good' : 'meh');
    fb.textContent = opt.note;
    idx++;
    setTimeout(showQuestion, 1400);
  });
  showQuestion();
}

/* ===== Section 7: Build the Response (click chunks in order) ===== */
function renderS7(){
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Build the Response</h2>
  <p class="section-sub">Click the pieces in the correct order to build a professional response.</p>
  <div class="panel">
    <div class="race-progress" id="brProgress"></div>
    <p id="brSituation" style="font-weight:700;color:var(--navy);margin-top:10px;"></p>
    <div class="scenario-message" id="brAssembly" style="min-height:44px;"></div>
    <div class="choices" id="brChunks" style="margin-top:14px;"></div>
    <div style="margin-top:12px;display:flex;gap:10px;">
      <button class="tb-btn" id="brReset">Reset</button>
      <button class="tb-btn primary" id="brCheck">Check</button>
    </div>
    <div class="feedback" id="brFeedback"></div>
  </div>`;
}
function wireS7(){
  let idx = 0, correct = 0;
  let order = [], shuffled = [];
  const progressEl = document.getElementById('brProgress');
  const sitEl = document.getElementById('brSituation');
  const assemblyEl = document.getElementById('brAssembly');
  const chunksEl = document.getElementById('brChunks');
  const fb = document.getElementById('brFeedback');
  function renderChunksFor(item){
    assemblyEl.textContent = order.length ? order.map(i=>item.chunks[i]).join(' ') : '...';
    chunksEl.innerHTML = shuffled.map(i=>`<button class="choice-btn" data-i="${i}" ${order.includes(i)?'disabled':''} style="text-align:left;">${item.chunks[i]}</button>`).join('');
  }
  function showQuestion(){
    if(idx >= BUILD_RESPONSE_ITEMS.length){
      progressEl.textContent = 'Done';
      sitEl.textContent = `Finished! ${correct}/${BUILD_RESPONSE_ITEMS.length} correct.`;
      assemblyEl.textContent = '';
      chunksEl.innerHTML = '';
      document.getElementById('brReset').style.display='none';
      document.getElementById('brCheck').style.display='none';
      fb.className = 'feedback';
      markActivityComplete('s7', {score:`${correct}/${BUILD_RESPONSE_ITEMS.length}`});
      return;
    }
    const item = BUILD_RESPONSE_ITEMS[idx];
    progressEl.textContent = `Item ${idx+1} of ${BUILD_RESPONSE_ITEMS.length}`;
    sitEl.textContent = item.situation;
    order = [];
    shuffled = shuffle(item.chunks.map((c,i)=>i));
    fb.className = 'feedback';
    renderChunksFor(item);
  }
  chunksEl.addEventListener('click', e=>{
    const btn = e.target.closest('.choice-btn'); if(!btn || btn.disabled) return;
    const item = BUILD_RESPONSE_ITEMS[idx];
    order.push(+btn.dataset.i);
    renderChunksFor(item);
  });
  document.getElementById('brReset').addEventListener('click', ()=>{
    order = [];
    renderChunksFor(BUILD_RESPONSE_ITEMS[idx]);
    fb.className = 'feedback';
  });
  document.getElementById('brCheck').addEventListener('click', ()=>{
    const item = BUILD_RESPONSE_ITEMS[idx];
    if(order.length < item.chunks.length){
      fb.className = 'feedback show meh'; fb.textContent = 'Use all the pieces first.';
      return;
    }
    const isCorrect = order.every((v,i)=>v===i);
    if(isCorrect){
      correct++;
      fb.className = 'feedback show good'; fb.textContent = 'Correct! Great response.';
    } else {
      fb.className = 'feedback show meh'; fb.textContent = `Not quite. The correct order was: "${item.chunks.join(' ')}"`;
    }
    idx++;
    setTimeout(showQuestion, 1600);
  });
  showQuestion();
}

/* ===== Section 8: What Would You Say? (open response, self-check) ===== */
function renderS8(){
  const items = WHAT_WOULD_YOU_SAY_ITEMS.map((it,i)=>`
    <div class="sit-card" data-wq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${it.situation}</p>
      <textarea class="challenge-textarea" rows="3" style="margin-top:10px;" placeholder="Write what you would say..."></textarea>
      <button class="reveal-btn" data-reveal="${i}" style="margin-top:10px;">Show a model answer</button>
      <div class="model-answer" id="wqModel${i}">"${it.model}"</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 8</div>
  <h2 class="section-title">What Would You Say?</h2>
  <p class="section-sub">No choices this time. Write your own response, then compare it to a model answer.</p>
  <div class="panel">${items}</div>`;
}
function wireS8(){
  const revealed = new Set();
  document.querySelectorAll('#app [data-reveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(`wqModel${btn.dataset.reveal}`).classList.add('show');
      revealed.add(btn.dataset.reveal);
      if(revealed.size >= WHAT_WOULD_YOU_SAY_ITEMS.length) markActivityComplete('s8', {completionStatus:'reached'});
    });
  });
}

/* ===== Section 9: MICE Scenario Challenge ===== */
function renderS9(){
  const cards = SCENARIO_BANK.map((s,i)=>`
    <div class="sit-card" data-sc="${i}">
      <p style="font-family:'Oswald';font-size:11px;letter-spacing:.05em;color:var(--orange-deep);">${s.tag.toUpperCase()}</p>
      <p style="font-weight:700;color:var(--navy);margin-top:4px;">${s.situation}</p>
      <button class="reveal-btn" data-screveal="${i}" style="margin-top:10px;">Show a model answer</button>
      <div class="model-answer" id="scModel${i}">"${s.model}"</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">MICE Scenario Challenge</h2>
  <p class="section-sub">Work with a partner. Take turns: one person reads the situation out loud, the other responds using today's patterns. Try all 7 before checking the model answers.</p>
  <div class="panel">${cards}</div>`;
}
function wireS9(){
  const revealed = new Set();
  document.querySelectorAll('#app [data-screveal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById(`scModel${btn.dataset.screveal}`).classList.add('show');
      revealed.add(btn.dataset.screveal);
      if(revealed.size >= 5) markActivityComplete('s9', {score:`${revealed.size}/${SCENARIO_BANK.length} reviewed`});
    });
  });
}

/* ===== Section 10: Unit Quiz (Google Form) ===== */
function renderS10(){
  return `
  <div class="section-eyebrow">Section 10</div>
  <h2 class="section-title">Unit Quiz</h2>
  <p class="section-sub">15 multiple choice questions and 1 short writing question. Answer by yourself.</p>
  <div class="panel">
    <div class="quiz-cta" style="margin:0;max-width:none;">
      <div class="quiz-cta-qr">${QUIZ_QR_SVG}</div>
      <div class="quiz-cta-text">
        <div class="quiz-cta-label">UNIT 11 QUIZ</div>
        <p>Scan the QR code with your phone, or click the button below to open the quiz.</p>
        <a class="download-btn" id="s10quizlink" href="${QUIZ_FORM_URL}" target="_blank" rel="noopener">Open the Quiz <span class="icon-inline">${icon('arrowRight',{size:16})}</span></a>
      </div>
    </div>
  </div>`;
}
function wireS10(){
  document.getElementById('s10quizlink').addEventListener('click', ()=>{
    markActivityComplete('s10', {completionStatus:'reached'});
  });
}

/* ===== Section 11: Speaking Role Play — Professional Response Role Play ===== */
function renderS11(){
  const cardHTML = (key) => `
    <div class="sit-card">
      <h3 style="font-size:16px;color:var(--navy);">${ROLEPLAY_CARDS[key].title}</h3>
      <p style="margin-top:6px;color:var(--ink);">${ROLEPLAY_CARDS[key].body}</p>
      <p style="margin-top:10px;font-weight:700;color:var(--navy);font-size:13.5px;">${ROLEPLAY_CARDS[key].role}</p>
      <p style="margin-top:10px;font-weight:700;color:var(--orange-deep);font-size:12.5px;">SENTENCE STARTERS:</p>
      <div class="phrase-list" style="margin-top:8px;">
        ${ROLEPLAY_CARDS[key].phrases.map(p=>`<div class="phrase-card"><span class="txt">"${p}"</span></div>`).join('')}
      </div>
    </div>`;
  const roleKeys = Object.keys(ROLEPLAY_CARDS);
  const tabs = roleKeys.map((k,i)=>`<button class="tab-btn${i===0?' active':''}" data-role="${k}">${ROLEPLAY_CARDS[k].title.split(': ')[1]}</button>`).join('');
  const panels = roleKeys.map((k,i)=>`<div class="tab-panel${i===0?' active':''}" data-rolepanel="${k}">${cardHTML(k)}</div>`).join('');
  const steps = ROLEPLAY_STEPS.map((s,i)=>`
    <div class="checklist-row" data-chk="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${s}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 11</div>
  <h2 class="section-title">Speaking Role Play</h2>
  <p class="section-sub">Work with a partner. Pick one scenario from Section 9. Student A presents the problem, Student B responds using all 4 steps below. Then switch roles.</p>
  <div class="panel">
    <div class="tabs">${tabs}</div>
    ${panels}
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Student B's 4 Steps</h3>
    <p style="color:var(--muted);font-size:12.5px;margin-top:4px;">Check off each step as you complete it in your role play.</p>
    ${steps}
  </div>`;
}
function wireS11(){
  document.querySelectorAll('#app [data-role]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-role]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-rolepanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-rolepanel="${btn.dataset.role}"]`).classList.add('active');
    });
  });
  const rows = document.querySelectorAll('#app .checklist-row');
  const checked = new Set();
  rows.forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.chk); else checked.delete(row.dataset.chk);
      if(checked.size >= rows.length) markActivityComplete('s11', {score:`${checked.size}/${rows.length}`});
    });
  });
}

/* ===== Section 12: Quick Review + Self-Check ===== */
function renderS12(){
  const rows = RUBRIC.map(r=>`
    <div class="rubric-row">
      <div><div class="lbl">${r.lbl}</div><div class="sub">${r.sub}</div></div>
      <div class="rate" data-k="${r.k}">
        ${[1,2,3].map(n=>`<button data-n="${n}">${n}</button>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 12</div>
  <h2 class="section-title">Quick Review</h2>
  <p class="section-sub">${QUICK_REVIEW_PROMPT}</p>
  <div class="panel">
    <textarea id="s12review" class="challenge-textarea" rows="3" placeholder="1. ...&#10;2. ...&#10;3. ..."></textarea>
    <div class="feedback" id="s12fb"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Self-Check</h3>
    <p class="section-sub" style="margin-top:2px;">Rate yourself honestly. Your teacher remains the final evaluator.</p>
    ${rows}
  </div>`;
}
function wireS12(){
  const box = document.getElementById('s12review');
  const fb = document.getElementById('s12fb');
  const rateGroups = document.querySelectorAll('#app .rate');
  function checkDone(){
    const wordsOk = box.value.trim().length >= 10;
    const ratedCount = [...rateGroups].filter(r => r.querySelector('.sel')).length;
    if(wordsOk && ratedCount >= rateGroups.length){
      markActivityComplete('s12', {score:`self-rated ${ratedCount}/${rateGroups.length}`, answers: box.value.trim()});
    }
  }
  box.addEventListener('input', ()=>{
    fb.className = box.value.trim().length ? 'feedback show good' : 'feedback';
    fb.textContent = box.value.trim().length ? 'Saved.' : '';
    checkDone();
  });
  rateGroups.forEach(rate=>{
    rate.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...rate.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      checkDone();
    });
  });
}

function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 11 COMPLETE</div>
    <h1>You can <span>apologize and say no professionally.</span></h1>
    <p>Keep practicing: acknowledge the problem, apologize or say no politely, then always offer something real.</p>
    <div class="quiz-cta">
      <div class="quiz-cta-qr">${QUIZ_QR_SVG}</div>
      <div class="quiz-cta-text">
        <div class="quiz-cta-label">UNIT 11 QUIZ</div>
        <p>Scan the QR code with your phone, or click the button below to open the quiz. Answer by yourself.</p>
        <a class="download-btn" href="${QUIZ_FORM_URL}" target="_blank" rel="noopener">Open the Quiz <span class="icon-inline">${icon('arrowRight',{size:16})}</span></a>
      </div>
    </div>
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
  document.getElementById('completePracticeBtn').addEventListener('click', ()=> goTo(1));
  document.getElementById('completeHomeBtn').addEventListener('click', ()=> goTo(0));

  const stats = document.getElementById('completeStats');
  if(stats){
    const quiz = Progress.activities['s10'] ? 'Yes' : 'No';
    const speaking = Progress.activities['s11'] ? 'Yes' : 'No';
    stats.innerHTML = `
      <p class="complete-stats-intro">Your progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Activities Completed</div></div>
        <div class="complete-stat"><div class="num">${quiz}</div><div class="lbl">Quiz Opened</div></div>
        <div class="complete-stat"><div class="num">${speaking}</div><div class="lbl">Speaking Completed</div></div>
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
  {r:renderS3, w:wireS3},
  {r:renderS4, w:wireS4},
  {r:renderS5, w:wireS5},
  {r:renderS6, w:wireS6},
  {r:renderS7, w:wireS7},
  {r:renderS8, w:wireS8},
  {r:renderS9, w:wireS9},
  {r:renderS10, w:wireS10},
  {r:renderS11, w:wireS11},
  {r:renderS12, w:wireS12},
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
