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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8'];

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
  const answers = opts.answers || '';
  const prev = Progress.activities[key];
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
const CHECKIN_STORAGE_KEY = 'wellness_u11_checkin';
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
   Two named characters: Nid (spa coordinator, default British
   female voice) and Aran (senior therapist, American male voice). Same
   novelty-voice-exclusion + pitch-safety-net pattern established for
   Units 9 and 10's own VoiceEngine copies. */
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
  const objectives = [
    'Use promotional words and phrases correctly.',
    'Complete a Promotion Card for a wellness product.',
    'Write a short promotional advertisement (60-100 words) with a partner.'
  ].map(o=>`<li>${o}</li>`).join('');
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR WELLNESS TOURISM</div>
    <h1>Wellness Tourism <span>Promotion</span></h1>
    <p>How can we promote a wellness tourism experience to tourists? Learn promotional English, then write your own advertisement with a partner.</p>
    <img class="section-hero-photo" src="${SECTION_PHOTOS.hero.src}" alt="${SECTION_PHOTOS.hero.alt}" loading="lazy">
    <div class="cover-objectives">
      <b>By the end of this lesson, you can:</b>
      <ul>${objectives}</ul>
    </div>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Promotional Phrases</div>
      <div class="signchip"><span class="arrow">→</span> Promotion Card</div>
      <div class="signchip"><span class="arrow">→</span> Write an Ad</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Look at the Ad ===== */
function renderS1(){
  const questions = WARMUP_QUESTIONS.map(q=>`<li>${q}</li>`).join('');
  const ads = SAMPLE_ADS.map((ad,ai)=>`
    <div class="sit-card">
      <h3 style="font-size:15px;color:var(--navy);">${ad.title}</h3>
      <img src="${ad.image}" alt="${ad.title}" loading="lazy" style="width:100%;border-radius:12px;border:1px solid var(--line);margin-top:10px;cursor:zoom-in;" class="ad-flyer-img" data-adimg="${ai}">
      <p style="margin-top:12px;color:var(--ink);">${ad.text}</p>
      <p style="margin-top:12px;font-weight:700;color:var(--orange-deep);font-size:13px;">Which phrases below are really in this ad?</p>
      <div class="choices" data-adchoices="${ai}" style="margin-top:8px;">
        ${ad.options.map((o,oi)=>`<button class="choice-btn" data-oi="${oi}" style="text-align:left;">${o.text}</button>`).join('')}
      </div>
      <div class="feedback" id="adFeedback${ai}"></div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Look at the Ad</h2>
  <p class="section-sub">Read two real-style wellness ads. Think about these questions with a partner:</p>
  <div class="panel">
    <ul style="margin:0 0 0 18px;padding:0;line-height:1.9;font-size:14.5px;color:var(--ink);">${questions}</ul>
  </div>
  <div class="panel">${ads}</div>
  <div class="photo-lightbox" id="photoLightbox">
    <img id="photoLightboxImg" src="" alt="">
    <button class="photo-lightbox-close" id="photoLightboxClose" aria-label="Close">&times;</button>
  </div>`;
}
function wireS1(){
  const found = new Set();
  SAMPLE_ADS.forEach((ad,ai)=>{
    const box = document.querySelector(`[data-adchoices="${ai}"]`);
    const fb = document.getElementById(`adFeedback${ai}`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || btn.disabled) return;
      const opt = ad.options[+btn.dataset.oi];
      btn.disabled = true;
      btn.classList.add(opt.correct ? 'correct' : 'wrong');
      fb.className = 'feedback show ' + (opt.correct ? 'good' : 'meh');
      fb.textContent = opt.correct ? 'Yes! That phrase is in this ad.' : 'Not in this ad, good try, keep looking.';
      if(opt.correct){
        found.add(`${ai}-${btn.dataset.oi}`);
        if(found.size >= 8) markActivityComplete('s1', {completionStatus:'reached'});
      }
    });
  });
  const lightbox = document.getElementById('photoLightbox');
  const lightboxImg = document.getElementById('photoLightboxImg');
  document.querySelectorAll('.ad-flyer-img').forEach(img=>{
    img.addEventListener('click', ()=>{
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('show');
    });
  });
  lightbox.addEventListener('click', ()=> lightbox.classList.remove('show'));
  document.getElementById('photoLightboxClose').addEventListener('click', e=>{ e.stopPropagation(); lightbox.classList.remove('show'); });
}

/* ===== Section 2: Vocabulary & Phrases ===== */
function renderS2(){
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
  const phrases = PROMO_PHRASES.map(p=>`<div class="phrase-card"><span class="txt">${p}</span><button class="audio-mini" data-say="${p.replace(/\.\.\.$/,'')}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>`).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Vocabulary &amp; Phrases</h2>
  <p class="section-sub">Click a photo to zoom in. Click a word to see it used in a real sentence.</p>
  <div class="panel">
    <div class="loc-grid">${cards}</div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Promotional Phrases</h3>
    <p class="section-sub" style="margin-top:2px;">These phrases will help you write your own advertisement later.</p>
    <div class="phrase-list" style="margin-top:10px;">${phrases}</div>
  </div>
  <div class="photo-lightbox" id="photoLightbox">
    <img id="photoLightboxImg" src="" alt="">
    <button class="photo-lightbox-close" id="photoLightboxClose" aria-label="Close">&times;</button>
  </div>`;
}
function wireS2(){
  document.querySelectorAll('#app .audio-mini').forEach(btn=>{
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
  function closeLightbox(){ lightbox.classList.remove('show'); }
  document.querySelectorAll('#app .loc-card .photo').forEach(img=>{
    img.addEventListener('click', e=>{
      e.stopPropagation();
      openLightbox(img.src, img.alt);
    });
  });
  lightbox.addEventListener('click', closeLightbox);
  document.getElementById('photoLightboxClose').addEventListener('click', e=>{ e.stopPropagation(); closeLightbox(); });
  markActivityComplete('s2', {completionStatus:'reached'});
}

/* ===== Section 3: Language Practice (3 activities) ===== */
function renderS3(){
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Language Practice</h2>
  <p class="section-sub">Three short activities. Real practice, not explanation.</p>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">A. Choose the Correct Phrase</h3>
    <div class="race-progress" id="cpProgress"></div>
    <p id="cpSituation" style="font-weight:700;color:var(--navy);margin-top:10px;"></p>
    <div class="choices" id="cpChoices" style="margin-top:14px;grid-template-columns:1fr;"></div>
    <div class="feedback" id="cpFeedback"></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">B. Fill in the Blank</h3>
    ${FILL_BLANK.map((f,i)=>`
      <div class="fillblank-row">
        <p style="font-size:14px;color:var(--ink);flex:1;min-width:220px;">${i+1}. ${f.q}</p>
        <input type="text" class="dictation-input" id="fbInput${i}" style="max-width:180px;">
        <button class="tb-btn" id="fbCheck${i}" style="padding:8px 14px;font-size:12.5px;">Check</button>
        <div class="feedback" data-bfb="${i}"></div>
      </div>`).join('')}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">C. Reorder Words</h3>
    <div class="race-progress" id="roProgress"></div>
    <p id="roSituation" style="font-weight:700;color:var(--navy);margin-top:10px;"></p>
    <div class="scenario-message" id="roAssembly" style="min-height:44px;"></div>
    <div class="choices" id="roChunks" style="margin-top:14px;"></div>
    <div style="margin-top:12px;display:flex;gap:10px;">
      <button class="tb-btn" id="roReset">Reset</button>
      <button class="tb-btn primary" id="roCheck">Check</button>
    </div>
    <div class="feedback" id="roFeedback"></div>
  </div>`;
}
function wireS3(){
  let partsDone = { cp:false, fb:false, ro:false };
  function maybeDone(){ if(partsDone.cp && partsDone.fb && partsDone.ro) markActivityComplete('s3', {completionStatus:'reached'}); }

  /* A. Choose the Correct Phrase */
  (function(){
    let idx = 0, correct = 0;
    const progressEl = document.getElementById('cpProgress');
    const sitEl = document.getElementById('cpSituation');
    const choicesEl = document.getElementById('cpChoices');
    const fb = document.getElementById('cpFeedback');
    function showQuestion(){
      if(idx >= CHOOSE_PHRASE_ITEMS.length){
        progressEl.textContent = 'Done';
        sitEl.textContent = `Finished! ${correct}/${CHOOSE_PHRASE_ITEMS.length} correct.`;
        choicesEl.innerHTML = ''; fb.className = 'feedback';
        partsDone.cp = true; maybeDone();
        return;
      }
      const item = CHOOSE_PHRASE_ITEMS[idx];
      progressEl.textContent = `Item ${idx+1} of ${CHOOSE_PHRASE_ITEMS.length}`;
      sitEl.textContent = item.situation;
      choicesEl.innerHTML = item.options.map((o,i)=>`<button class="choice-btn" data-i="${i}" style="text-align:left;">${o.text}</button>`).join('');
      fb.className = 'feedback';
    }
    choicesEl.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || btn.disabled) return;
      document.querySelectorAll('#cpChoices .choice-btn').forEach(b=>b.disabled=true);
      const item = CHOOSE_PHRASE_ITEMS[idx];
      const opt = item.options[+btn.dataset.i];
      btn.classList.add(opt.good ? 'correct' : 'wrong');
      if(opt.good) correct++;
      fb.className = 'feedback show ' + (opt.good ? 'good' : 'meh');
      fb.textContent = opt.note;
      idx++;
      setTimeout(showQuestion, 1300);
    });
    showQuestion();
  })();

  /* B. Fill in the Blank */
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
      if(blanksAnswered.size >= FILL_BLANK.length){ partsDone.fb = true; maybeDone(); }
    }
    document.getElementById(`fbCheck${i}`).addEventListener('click', check);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); check(); } });
    input.addEventListener('input', ()=> input.classList.remove('correct','wrong'));
  });

  /* C. Reorder Words */
  (function(){
    let idx = 0, correct = 0, order = [], shuffled = [];
    const progressEl = document.getElementById('roProgress');
    const sitEl = document.getElementById('roSituation');
    const assemblyEl = document.getElementById('roAssembly');
    const chunksEl = document.getElementById('roChunks');
    const fb = document.getElementById('roFeedback');
    function renderChunksFor(item){
      assemblyEl.textContent = order.length ? order.map(i=>item.chunks[i]).join(' ') : '...';
      chunksEl.innerHTML = shuffled.map(i=>`<button class="choice-btn" data-i="${i}" ${order.includes(i)?'disabled':''} style="text-align:left;">${item.chunks[i]}</button>`).join('');
    }
    function showQuestion(){
      if(idx >= REORDER_ITEMS.length){
        progressEl.textContent = 'Done';
        sitEl.textContent = `Finished! ${correct}/${REORDER_ITEMS.length} correct.`;
        assemblyEl.textContent = ''; chunksEl.innerHTML = '';
        document.getElementById('roReset').style.display='none';
        document.getElementById('roCheck').style.display='none';
        fb.className = 'feedback';
        partsDone.ro = true; maybeDone();
        return;
      }
      const item = REORDER_ITEMS[idx];
      progressEl.textContent = `Item ${idx+1} of ${REORDER_ITEMS.length}`;
      sitEl.textContent = item.situation;
      order = [];
      shuffled = shuffle(item.chunks.map((c,i)=>i));
      fb.className = 'feedback';
      renderChunksFor(item);
    }
    chunksEl.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn || btn.disabled) return;
      const item = REORDER_ITEMS[idx];
      order.push(+btn.dataset.i);
      renderChunksFor(item);
    });
    document.getElementById('roReset').addEventListener('click', ()=>{
      order = []; renderChunksFor(REORDER_ITEMS[idx]); fb.className = 'feedback';
    });
    document.getElementById('roCheck').addEventListener('click', ()=>{
      const item = REORDER_ITEMS[idx];
      if(order.length < item.chunks.length){
        fb.className = 'feedback show meh'; fb.textContent = 'Use all the pieces first.';
        return;
      }
      const isCorrect = order.every((v,i)=>v===i);
      if(isCorrect){ correct++; fb.className = 'feedback show good'; fb.textContent = 'Correct!'; }
      else { fb.className = 'feedback show meh'; fb.textContent = `Not quite. Correct order: "${item.chunks.join(' ')}"`; }
      idx++;
      setTimeout(showQuestion, 1500);
    });
    showQuestion();
  })();
}

/* ===== Section 4: Choose Your Product ===== */
function renderS4(){
  const cards = WELLNESS_PRODUCTS.map(p=>`
    <button class="product-card" data-i="${p.id}">
      <img src="${p.photo}" alt="${p.text}" loading="lazy">
      <span>${p.text}</span>
    </button>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Choose Your Product</h2>
  <p class="section-sub">Work with your seatmate. Choose ONE wellness product to promote together.</p>
  <div class="panel">
    <div class="product-grid" id="productChoices">${cards}</div>
    <div class="feedback" id="s4nudge" style="display:block;"></div>
  </div>`;
}
function wireS4(){
  document.getElementById('productChoices').addEventListener('click', e=>{
    const btn = e.target.closest('.product-card'); if(!btn) return;
    document.querySelectorAll('#productChoices .product-card').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    const nudge = document.getElementById('s4nudge');
    nudge.className = 'feedback show good';
    nudge.textContent = 'Good choice! Next, you will build your Promotion Card for this product.';
    markActivityComplete('s4', {answers: btn.querySelector('span').textContent});
  });
}

/* ===== Section 5: Promotion Card ===== */
function renderS5(){
  const fieldList = CARD_FIELDS.map(f=>`<li>${f.label.replace(/^\d+\.\s*/,'')}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Promotion Card</h2>
  <p class="section-sub">Get your printed worksheet. Fill in all 10 fields on paper, together with your seatmate.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Your Promotion Card has 10 fields:</h3>
    <ul style="margin:10px 0 0 18px;padding:0;line-height:1.9;font-size:14.5px;color:var(--ink);">${fieldList}</ul>
    <p class="section-sub" style="margin-top:14px;">Student A: fields 1-5. Student B: fields 6-10.</p>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Model Example</h3>
    <div class="model-answer show" style="margin-top:10px;">
      ${CARD_FIELDS.map(f=>`<div style="margin-top:4px;"><b>${f.label.replace(/^\d+\.\s*/,'')}:</b> ${MODEL_CARD[f.id]}</div>`).join('')}
    </div>
    <button class="startbtn" id="s5done" style="margin-top:20px;">We have our Promotion Card ready →</button>
    <div class="feedback" id="s5nudge"></div>
  </div>`;
}
function wireS5(){
  document.getElementById('s5done').addEventListener('click', ()=>{
    markActivityComplete('s5', {completionStatus:'reached'});
    goNext();
  });
}

/* ===== Section 6: Write Your Advertisement (MAIN OUTPUT) =====
   This is a hand-written task on the printed worksheet, not a typing box —
   the on-screen section previews the task and confirms completion. */
function renderS6(){
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Write Your Advertisement</h2>
  <p class="section-sub">On your printed worksheet, combine your Promotion Card into ONE advertisement, 60 to 100 words. Both partners must write part of it.</p>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Model Advertisement</h3>
    <div class="model-answer show" style="margin-top:10px;">"${MODEL_AD}"</div>
    <button class="audio-mini" id="listenModelAd" style="margin-top:10px;"><span class="icon-inline">${icon('headphones',{size:14})}</span> Listen</button>
  </div>
  <div class="panel">
    <h3 style="font-size:15px;color:var(--navy);">Pair Accountability</h3>
    <p class="section-sub" style="margin-top:2px;">On your worksheet, both students write their name next to the part they wrote:</p>
    <p style="margin-top:10px;color:var(--ink);">Student A: I wrote _________________________.</p>
    <p style="margin-top:6px;color:var(--ink);">Student B: I wrote _________________________.</p>
    <button class="startbtn" id="s6done" style="margin-top:20px;">We wrote our advertisement →</button>
    <div class="feedback" id="s6nudge"></div>
  </div>`;
}
function wireS6(){
  document.getElementById('listenModelAd').addEventListener('click', ()=> speak(MODEL_AD, 'staff'));
  document.getElementById('s6done').addEventListener('click', ()=>{
    markActivityComplete('s6', {completionStatus:'reached'});
    goNext();
  });
}

/* ===== Section 7: Output Check ===== */
function renderS7(){
  const rows = CHECKLIST_ITEMS.map((c,i)=>`
    <div class="checklist-row" data-chk="${i}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${c}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Output Check</h2>
  <p class="section-sub">Check your own advertisement. If there is time, swap with another pair and check theirs too.</p>
  <div class="panel">${rows}</div>`;
}
function wireS7(){
  const rows = document.querySelectorAll('#app .checklist-row');
  const checked = new Set();
  rows.forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.chk); else checked.delete(row.dataset.chk);
      if(checked.size >= rows.length) markActivityComplete('s7', {score:`${checked.size}/${rows.length}`});
    });
  });
}

/* ===== Section 8: Extra Practice (30-minute extension) ===== */
function renderS8(){
  return `
  <div class="section-eyebrow">Section 8 · Optional</div>
  <h2 class="section-title">Extra Practice</h2>
  <p class="section-sub">A new product. Write a second advertisement by yourself this time, using the same structure.</p>
  <div class="panel">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px;font-weight:700;color:var(--navy);">PRODUCT</td><td style="padding:8px;">${EXTENSION_PRODUCT.product}</td></tr>
      <tr><td style="padding:8px;font-weight:700;color:var(--navy);">INCLUDES</td><td style="padding:8px;">${EXTENSION_PRODUCT.includes}</td></tr>
      <tr><td style="padding:8px;font-weight:700;color:var(--navy);">PRICE</td><td style="padding:8px;">${EXTENSION_PRODUCT.price}</td></tr>
      <tr><td style="padding:8px;font-weight:700;color:var(--navy);">DURATION</td><td style="padding:8px;">${EXTENSION_PRODUCT.duration}</td></tr>
      <tr><td style="padding:8px;font-weight:700;color:var(--navy);">FOR</td><td style="padding:8px;">${EXTENSION_PRODUCT.for}</td></tr>
    </table>
  </div>
  <div class="panel">
    <textarea id="extAdText" class="challenge-textarea" rows="6" style="margin-top:6px;" placeholder="Write your second advertisement here..."></textarea>
    <div id="extWordCount" style="margin-top:8px;font-size:13px;color:var(--muted);font-family:'Oswald';">0 words</div>
    <button class="startbtn" id="s8done" style="margin-top:20px;">I'm finished →</button>
    <div class="feedback" id="s8nudge"></div>
  </div>`;
}
function wireS8(){
  const extAdText = document.getElementById('extAdText');
  const extWordCount = document.getElementById('extWordCount');
  extAdText.addEventListener('input', ()=>{
    const words = extAdText.value.trim().split(/\s+/).filter(Boolean).length;
    extWordCount.textContent = `${words} words`;
    extWordCount.style.color = (words >= 40) ? 'var(--green-safe)' : 'var(--muted)';
  });
  document.getElementById('s8done').addEventListener('click', ()=>{
    const nudge = document.getElementById('s8nudge');
    const words = extAdText.value.trim().split(/\s+/).filter(Boolean).length;
    if(words < 30){
      nudge.className = 'feedback show meh';
      nudge.textContent = 'Keep going, write a few more sentences.';
      return;
    }
    nudge.className = 'feedback';
    markActivityComplete('s8', {score:`${words} words`, answers: extAdText.value.trim()});
  });
}

function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 11 COMPLETE</div>
    <h1>You can <span>promote a wellness experience.</span></h1>
    <p>Your advertisement is ready to become part of your final presentation. Next class, you will turn this into presentation points and rehearse.</p>
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
  document.getElementById('completePracticeBtn').addEventListener('click', ()=> goTo(1));
  document.getElementById('completeHomeBtn').addEventListener('click', ()=> goTo(0));
  const stats = document.getElementById('completeStats');
  if(stats){
    const ad = Progress.activities['s6'] ? 'Yes' : 'No';
    stats.innerHTML = `
      <p class="complete-stats-intro">Your progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Activities Completed</div></div>
        <div class="complete-stat"><div class="num">${ad}</div><div class="lbl">Advertisement Written</div></div>
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
