/* ===================== APP STATE / ROUTER =====================
   Same router/progress/voice/checkin/deep-link architecture as every
   other unit in the hub (copied from Unit 6, unchanged in shape) — see
   that file's comments for the full rationale. Nothing here is a new
   system; Unit 7 plugs into the existing one. */
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
   Same shared Google Apps Script endpoint as every other unit — one
   Sheet, one reporting model across the whole hub. */
const DATA_ENDPOINT = "https://script.google.com/macros/s/AKfycbxDECOuXf3HMxPVLT1fhfOHE5g-Gq1juG5enaCoUrShk9vEMfctgy-URKmqmvPGeoE/exec";

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','practice','s12'];

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
function sendGranularRecord(label, opts={}){
  sendProgressRecord(buildRecord(label, {score: opts.score ?? null, completionStatus: opts.completionStatus || 'completed'}));
}
function completedCount(){ return TRACKED_ACTIVITIES.filter(k => Progress.activities[k]).length; }
function updateTopbarBadge(){
  const elx = document.getElementById('studentBadge');
  if(!elx) return;
  if(!Progress.studentName){ elx.style.display='none'; return; }
  elx.style.display='';
  elx.innerHTML = `<b>${Progress.studentName}</b> · ${completedCount()}/${TRACKED_ACTIVITIES.length} done`;
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

/* ===================== VOICE ENGINE ===================== */
const VoiceEngine = (function(){
  let allVoices = [];
  let voiceA = null, voiceB = null;
  let slower = false;
  let queue = [];
  let queueIndex = 0;
  let playing = false, paused = false;
  let onStateChange = ()=>{};

  const QUALITY_HINTS = ['natural','neural','premium','enhanced','online','wavenet','studio'];
  const GOOD_NAMES = ['google us english','samantha','ava','zoe','aria','jenny','guy','matthew','joanna','ryan','emma'];

  function scoreVoice(v){
    const n = v.name.toLowerCase();
    let score = 0;
    if(v.lang && v.lang.toLowerCase().startsWith('en-us')) score += 3;
    else if(v.lang && v.lang.toLowerCase().startsWith('en')) score += 1;
    QUALITY_HINTS.forEach(h=>{ if(n.includes(h)) score += 4; });
    GOOD_NAMES.forEach(g=>{ if(n.includes(g)) score += 2; });
    if(n.includes('compact') || n.includes('espeak')) score -= 5;
    return score;
  }

  function refresh(){
    allVoices = window.speechSynthesis.getVoices() || [];
    const ranked = [...allVoices].sort((a,b)=> scoreVoice(b)-scoreVoice(a));
    voiceA = ranked[0] || allVoices[0] || null;
    voiceB = ranked[1] || allVoices[1] || allVoices[0] || null;
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
    const voice = kind==='b' ? voiceB : voiceA;
    if(voice) u.voice = voice;
    u.lang = 'en-US';
    u.rate = (slower ? 0.86 : 1.0);
    u.pitch = kind==='b' ? 1.04 : 0.98;
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
      queue = [{text, kind: kind||'a'}];
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
  VoiceEngine.speakLine(text, kind==='b' ? 'b' : 'a');
}
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>Food <span>Culture</span></h1>
    <p>Unit 7: Markets, meals, and eating habits. Explore food culture, shop at the market, and talk about what you want to eat.</p>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Market words</div>
      <div class="signchip"><span class="arrow">→</span> Shop on a budget</div>
      <div class="signchip"><span class="arrow">→</span> Talk about food</div>
    </div>
    <button class="startbtn" onclick="goNext()">Look. Choose. Speak. →</button>
  </div>`;
}

/* ===== Section 1: Food Culture Around Us ===== */
function renderS1(){
  const questions = CULTURE_CHOICE_QUESTIONS.map((q,qi)=>`
    <p style="font-weight:700;color:var(--navy);font-size:16px;margin-top:${qi===0?'0':'22px'};">${q.q}</p>
    <div class="big-choice-grid" data-q="${qi}">
      ${q.opts.map((o,i)=>`<div class="big-choice" data-i="${i}"><div class="bc-ic">${o.ic}</div><div class="bc-lbl">${o.lbl}</div></div>`).join('')}
    </div>`).join('');
  const rows = CULTURE_TABLE.rows.map((r,ri)=>`
    <tr><td>${r}</td>${CULTURE_TABLE.countries.map(c=>`<td>${c.values[ri]}</td>`).join('')}</tr>`).join('');
  const head = CULTURE_TABLE.countries.map(c=>`<th><span class="culture-flag">${c.flag}</span>${c.name}</th>`).join('');
  const tip = CULTURE_INTRO_TIP.map(t=>`<li>${t}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 1</div>
  <h2 class="section-title">Food Culture Around Us</h2>
  <p class="section-sub">Look. Choose one answer for each question.</p>
  <div class="panel">
    ${questions}
    <div id="s1result" class="feedback" style="margin-top:18px;"></div>
  </div>
  <div class="panel" id="s1culture" style="display:none;">
    <div class="section-eyebrow">Around the World</div>
    <h3 style="font-size:18px;color:var(--navy);margin-top:6px;">How do people eat?</h3>
    <div class="culture-table-wrap" style="margin-top:14px;">
      <table class="culture-table">
        <thead><tr><th></th>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="rule-box" style="margin-top:18px;">
      <b>Remember</b>
      <ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul>
    </div>
  </div>`;
}
function wireS1(){
  const answered = new Set();
  const result = document.getElementById('s1result');
  const cultureBox = document.getElementById('s1culture');
  document.querySelectorAll('#app [data-q]').forEach(grid=>{
    grid.addEventListener('click', e=>{
      const c = e.target.closest('.big-choice'); if(!c) return;
      [...grid.children].forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      answered.add(grid.dataset.q);
      if(answered.size >= CULTURE_CHOICE_QUESTIONS.length){
        result.className = 'feedback show good';
        result.textContent = 'Thanks! Everyone eats a little differently.';
        cultureBox.style.display = 'block';
        markActivityComplete('s1', {score:`${answered.size}/${CULTURE_CHOICE_QUESTIONS.length}`});
      }
    });
  });
}

/* ===== Section 2: Find the Food ===== */
function renderS2(){
  const tiles = FIND_SCENE.map((id,i)=>{
    const it = MARKET_ITEMS.find(m=>m.id===id);
    return `<div class="find-tile" data-i="${i}" data-id="${id}">${it.ic}</div>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 2</div>
  <h2 class="section-title">Find the Food</h2>
  <p class="section-sub">Look at the market. Click the food.</p>
  <div class="panel">
    <div class="mission-banner" id="s2mission"><span id="s2instruction"></span><span class="count" id="s2count"></span></div>
    <div class="find-scene" id="s2scene">${tiles}</div>
    <div id="s2win" class="feedback" style="margin-top:16px;"></div>
  </div>`;
}
function wireS2(){
  let missionIdx = 0;
  let foundInMission = new Set();
  const instrEl = document.getElementById('s2instruction');
  const countEl = document.getElementById('s2count');
  const win = document.getElementById('s2win');
  const scene = document.getElementById('s2scene');

  function startMission(){
    foundInMission = new Set();
    scene.querySelectorAll('.find-tile').forEach(t=>t.classList.remove('found','wrong'));
    const m = FIND_MISSIONS[missionIdx];
    instrEl.textContent = m.instruction;
    countEl.textContent = `0/${m.count}`;
  }
  startMission();

  scene.addEventListener('click', e=>{
    const tile = e.target.closest('.find-tile'); if(!tile) return;
    if(tile.classList.contains('found')) return;
    const m = FIND_MISSIONS[missionIdx];
    if(tile.dataset.id === m.targetId){
      tile.classList.add('found');
      foundInMission.add(tile.dataset.i);
      countEl.textContent = `${foundInMission.size}/${m.count}`;
      if(foundInMission.size >= m.count){
        if(missionIdx < FIND_MISSIONS.length - 1){
          win.className = 'feedback show good'; win.textContent = 'Good! Next mission.';
          setTimeout(()=>{ missionIdx++; startMission(); win.className='feedback'; }, 900);
        } else {
          win.className = 'feedback show good'; win.textContent = 'Great! You found all the food.';
          markActivityComplete('s2', {score:`${FIND_MISSIONS.length} missions`});
        }
      }
    } else {
      tile.classList.add('wrong');
      setTimeout(()=> tile.classList.remove('wrong'), 500);
    }
  });
}

/* ===== Section 3: Spot the Difference (two real photos, click hotspots) ===== */
function renderS3(){
  const total = MARKET_DIFFERENCES.length;
  const hotspotsHtml = (side) => MARKET_DIFFERENCES.map(d => `
    <button type="button" class="diff-hotspot" data-id="${d.id}"
      style="left:${d.hotspot.left}%;top:${d.hotspot.top}%;width:${d.hotspot.width}%;height:${d.hotspot.height}%;"
      aria-label="Check this area of Image ${side.toUpperCase()} for a difference"></button>
  `).join('');
  const photoCol = (side) => `
    <div class="diff-photo-col">
      <div class="diff-scene-title">Image ${side.toUpperCase()}</div>
      <div class="diff-photo-wrap" data-side="${side}">
        <img src="${MARKET_DIFF_IMAGES[side].src}" alt="${MARKET_DIFF_IMAGES[side].alt}">
        ${hotspotsHtml(side)}
      </div>
    </div>`;
  return `
  <div class="section-eyebrow">Section 3</div>
  <h2 class="section-title">Spot the Difference</h2>
  <p class="section-sub">Spot the ${total} differences!</p>
  <div class="panel">
    <div class="mission-banner"><span>Differences found</span><span class="count" id="s3count">0/${total}</span></div>
    <div class="diff-photo-scenes">
      ${photoCol('a')}
      ${photoCol('b')}
    </div>
    <div class="diff-try-again" id="s3tryagain" hidden>Try again!</div>
    <div class="diff-answers">
      <div class="diff-answers-title">Differences Found</div>
      <ul class="diff-answers-list" id="s3answerslist"></ul>
    </div>
    <div id="s3win" class="feedback" style="margin-top:16px;"></div>
    <div class="diff-complete" id="s3complete" hidden>
      <p class="diff-complete-msg">Excellent! You found all ${total} differences!</p>
      <div class="diff-language-challenge">
        <h3>Can you describe 3 things you can buy at this market?</h3>
        <div class="diff-blank-row"><span>I can buy</span><input type="text" class="diff-blank-input" id="s3blank0" placeholder="tomatoes"><span>.</span></div>
        <div class="diff-blank-row"><span>I can buy</span><input type="text" class="diff-blank-input" id="s3blank1" placeholder="mangoes"><span>.</span></div>
        <div class="diff-blank-row"><span>I can buy</span><input type="text" class="diff-blank-input" id="s3blank2" placeholder="carrots"><span>.</span></div>
        <button type="button" class="startbtn" id="s3finishBtn">Finish Activity →</button>
      </div>
    </div>
  </div>`;
}
function wireS3(){
  const found = new Set();
  const total = MARKET_DIFFERENCES.length;
  const countEl = document.getElementById('s3count');
  const win = document.getElementById('s3win');
  const answersList = document.getElementById('s3answerslist');
  const tryAgain = document.getElementById('s3tryagain');
  const completeBlock = document.getElementById('s3complete');
  let tryAgainTimer = null;

  function markFound(id){
    if(found.has(id)) return;
    const diff = MARKET_DIFFERENCES.find(d => d.id === id);
    found.add(id);
    document.querySelectorAll(`#app .diff-hotspot[data-id="${id}"]`).forEach(btn => {
      btn.classList.add('found');
      btn.disabled = true;
      const circle = document.createElement('div');
      circle.className = 'diff-circle';
      circle.style.left = btn.style.left;
      circle.style.top = btn.style.top;
      circle.style.width = btn.style.width;
      circle.style.height = btn.style.height;
      btn.insertAdjacentElement('afterend', circle);
    });
    const li = document.createElement('li');
    li.textContent = diff.label;
    answersList.appendChild(li);
    countEl.textContent = `${found.size}/${total}`;
    if(found.size >= total){
      win.className = 'feedback show good';
      win.textContent = 'You found all the differences!';
      completeBlock.hidden = false;
      markActivityComplete('s3', {score:`${found.size}/${total}`});
      completeBlock.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
  }

  document.querySelectorAll('#app .diff-hotspot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      markFound(btn.dataset.id);
    });
  });

  document.querySelectorAll('#app .diff-photo-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => {
      clearTimeout(tryAgainTimer);
      tryAgain.hidden = false;
      tryAgainTimer = setTimeout(() => { tryAgain.hidden = true; }, 1200);
    });
  });

  document.getElementById('s3finishBtn').addEventListener('click', () => {
    goNext();
  });
}

/* ===== Section 4: Build Your Market Basket ===== */
let basketSelection = [];
function renderS4(){
  const choices = BASKET_CHOICES.map(id=>{
    const it = MARKET_ITEMS.find(m=>m.id===id);
    return `<div class="big-choice" data-id="${id}"><div class="bc-ic">${it.ic}</div><div class="bc-lbl">${it.nm}</div></div>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Build Your Market Basket</h2>
  <p class="section-sub">Choose 3 or 4 foods.</p>
  <div class="panel">
    <div class="big-choice-grid" id="s4grid">${choices}</div>
    <div class="basket-display" id="s4basket">
      <span class="basket-empty-note">Your basket is empty. Choose some food!</span>
    </div>
    <div class="basket-sentence" id="s4sentence" style="display:none;"></div>
  </div>`;
}
function wireS4(){
  basketSelection = [];
  const grid = document.getElementById('s4grid');
  const basket = document.getElementById('s4basket');
  const sentence = document.getElementById('s4sentence');
  function update(){
    if(basketSelection.length === 0){
      basket.innerHTML = '<span class="basket-empty-note">Your basket is empty. Choose some food!</span>';
      sentence.style.display = 'none';
      return;
    }
    basket.innerHTML = basketSelection.map(id=>{
      const it = MARKET_ITEMS.find(m=>m.id===id);
      return `<span class="basket-chip">${it.ic} ${it.nm}</span>`;
    }).join('');
    const names = basketSelection.map(id=>MARKET_ITEMS.find(m=>m.id===id).nm);
    const list = names.length===1 ? names[0] : names.slice(0,-1).join(', ') + ' and ' + names[names.length-1];
    sentence.style.display = 'block';
    sentence.textContent = `Say it: "I want to buy ${list}."`;
    if(basketSelection.length >= 3) markActivityComplete('s4', {score: names.join(', ')});
  }
  grid.addEventListener('click', e=>{
    const c = e.target.closest('.big-choice'); if(!c) return;
    const id = c.dataset.id;
    if(basketSelection.includes(id)){
      basketSelection = basketSelection.filter(x=>x!==id);
      c.classList.remove('sel');
    } else {
      if(basketSelection.length >= 4) return;
      basketSelection.push(id);
      c.classList.add('sel');
    }
    update();
  });
}

/* ===== Section 5: Market Budget Challenge ===== */
function renderS5(){
  const choices = MARKET_ITEMS.map(it=>`
    <div class="big-choice" data-id="${it.id}">
      <div class="bc-ic">${it.ic}</div>
      <div class="bc-lbl">${it.nm}</div>
      <div class="bc-price">${BUDGET_PRICES[it.id]} baht</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Market Budget Challenge</h2>
  <p class="section-sub">You have ${BUDGET_LIMIT} baht. Buy ${BUDGET_MISSION_ITEMS} foods.</p>
  <div class="panel">
    <div class="budget-bar">
      <div><div class="bb-label">YOU HAVE</div><div class="bb-value">${BUDGET_LIMIT} ฿</div></div>
      <div><div class="bb-label">IN YOUR BASKET</div><div class="bb-value" id="s5total">0 ฿</div></div>
      <div><div class="bb-label">ITEMS</div><div class="bb-value" id="s5items">0/${BUDGET_MISSION_ITEMS}</div></div>
    </div>
    <div class="big-choice-grid" id="s5grid" style="margin-top:20px;">${choices}</div>
    <div id="s5fb" class="feedback" style="margin-top:16px;"></div>
  </div>`;
}
function wireS5(){
  let cart = [];
  const grid = document.getElementById('s5grid');
  const totalEl = document.getElementById('s5total');
  const itemsEl = document.getElementById('s5items');
  const fb = document.getElementById('s5fb');
  function total(){ return cart.reduce((s,id)=> s + BUDGET_PRICES[id], 0); }
  function update(){
    const t = total();
    totalEl.textContent = `${t} ฿`;
    totalEl.classList.toggle('over', t > BUDGET_LIMIT);
    itemsEl.textContent = `${cart.length}/${BUDGET_MISSION_ITEMS}`;
    if(t > BUDGET_LIMIT){
      fb.className = 'feedback show meh'; fb.textContent = 'Too expensive. Try removing something.';
    } else if(cart.length === BUDGET_MISSION_ITEMS){
      fb.className = 'feedback show good'; fb.textContent = 'Good choice! You stayed under budget.';
      markActivityComplete('s5', {score:`${t}/${BUDGET_LIMIT} baht`});
    } else {
      fb.className = 'feedback';
    }
  }
  grid.addEventListener('click', e=>{
    const c = e.target.closest('.big-choice'); if(!c) return;
    const id = c.dataset.id;
    if(cart.includes(id)){
      cart = cart.filter(x=>x!==id);
      c.classList.remove('sel');
    } else {
      if(cart.length >= BUDGET_MISSION_ITEMS) return;
      cart.push(id);
      c.classList.add('sel');
    }
    update();
  });
}

/* ===== Section 6: Food Habits & Culture ===== */
function renderS6(){
  const questions = HABITS_QUESTIONS.map((q,i)=>`
    <div class="sit-card">
      <p style="font-weight:700;color:var(--navy);">${q.q}</p>
      <div class="choices" data-hq="${i}">
        ${q.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
    </div>`).join('');
  const tip = HABITS_TIP.map(t=>`<li>${t}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 6</div>
  <h2 class="section-title">Food Habits &amp; Culture</h2>
  <p class="section-sub">Choose. There is no wrong answer.</p>
  <div class="panel">
    ${questions}
    <div class="rule-box" id="s6tip" style="margin-top:18px;display:none;">
      <b>Remember</b>
      <ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul>
    </div>
  </div>`;
}
function wireS6(){
  const answered = new Set();
  const tip = document.getElementById('s6tip');
  HABITS_QUESTIONS.forEach((q,i)=>{
    const box = document.querySelector(`[data-hq="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct'));
      btn.classList.add('correct');
      answered.add(i);
      if(answered.size >= HABITS_QUESTIONS.length){
        tip.style.display = 'block';
        markActivityComplete('s6');
      }
    });
  });
}

/* ===== Section 7: Useful English ===== */
function renderS7(){
  const patterns = USEFUL_PATTERNS.map(p=>`
    <div class="phrase-group">
      <h4>${p.pattern}</h4>
      <div class="phrase-list">
        ${p.examples.map(ex=>`<div class="phrase-card"><span class="txt">${ex}</span><button class="audio-mini" data-say="${ex}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>`).join('')}
      </div>
    </div>`).join('');
  const mcq = USEFUL_MCQ.map((item,i)=>`
    <div class="sit-card" data-uq="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${item.q}</p>
      <div class="choices" data-uchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-ufb="${i}"></div>
    </div>`).join('');
  const starters = SENTENCE_STARTERS.map((s,i)=>`<button class="kw" data-start="${i}">${s}</button>`).join('');
  const endings = SENTENCE_ENDINGS.map((s,i)=>`<button class="kw" data-end="${i}">${s}</button>`).join('');
  return `
  <div class="section-eyebrow">Section 7</div>
  <h2 class="section-title">Useful English</h2>
  <p class="section-sub">Listen. Choose the right word. Build your own sentence.</p>
  <div class="panel">${patterns}</div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Choose the correct word.</h3>
    ${mcq}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Build your own sentence.</h3>
    <p class="section-sub" style="margin-top:6px;">Click one, then the other.</p>
    <div class="keyword-row" style="margin-top:16px;">${starters}</div>
    <div class="keyword-row">${endings}</div>
    <div class="basket-sentence" id="s7sentence" style="display:none;background:var(--cream);color:var(--navy);border:1px solid var(--line);"></div>
  </div>`;
}
function wireS7(){
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'a')));
  const answered = new Set();
  USEFUL_MCQ.forEach((item,i)=>{
    const box = document.querySelector(`[data-uchoices="${i}"]`);
    const fb = document.querySelector(`[data-ufb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Great!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Try again.'; }
      if(!answered.has(i)){ answered.add(i); if(answered.size >= USEFUL_MCQ.length) markActivityComplete('s7'); }
    });
  });
  let startIdx = null, endIdx = null;
  const sentenceBox = document.getElementById('s7sentence');
  function updateSentence(){
    if(startIdx===null || endIdx===null) return;
    sentenceBox.style.display = 'block';
    sentenceBox.textContent = `${SENTENCE_STARTERS[startIdx]} ${SENTENCE_ENDINGS[endIdx]}.`;
  }
  document.querySelectorAll('#app [data-start]').forEach(btn=>btn.addEventListener('click', ()=>{
    document.querySelectorAll('#app [data-start]').forEach(b=>b.classList.remove('sel')); btn.classList.add('sel');
    startIdx = +btn.dataset.start; updateSentence();
  }));
  document.querySelectorAll('#app [data-end]').forEach(btn=>btn.addEventListener('click', ()=>{
    document.querySelectorAll('#app [data-end]').forEach(b=>b.classList.remove('sel')); btn.classList.add('sel');
    endIdx = +btn.dataset.end; updateSentence();
  }));
}

/* ===== Section 8: Speaking Task 1 — What Do I Want? ===== */
function renderS8(){
  const fallbackGrid = BASKET_CHOICES.map(id=>{
    const it = MARKET_ITEMS.find(m=>m.id===id);
    return `<div class="big-choice" data-id="${id}"><div class="bc-ic">${it.ic}</div><div class="bc-lbl">${it.nm}</div></div>`;
  }).join('');
  const reasons = TASTE_REASONS.map((r,i)=>`<div class="big-choice" data-reason="${i}"><div class="bc-ic">${r.ic}</div><div class="bc-lbl">${r.lbl}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Speaking Task 1</div>
  <h2 class="section-title">What Do I Want?</h2>
  <p class="section-sub">Talk about YOUR food choices.</p>
  <div class="panel">
    <div id="s8fromBasket"></div>
    <div id="s8pickerWrap" style="display:none;">
      <p style="font-weight:700;color:var(--navy);">Choose 2–3 foods.</p>
      <div class="big-choice-grid" id="s8picker">${fallbackGrid}</div>
    </div>
    <div class="basket-sentence" id="s8sentence1" style="display:none;"></div>
    <hr class="hairline">
    <p style="font-weight:700;color:var(--navy);">Why do you like it?</p>
    <div class="big-choice-grid">${reasons}</div>
    <div class="basket-sentence" id="s8sentence2" style="display:none;"></div>
    <p style="color:var(--muted);font-size:12.5px;margin-top:14px;">Choose food → Build sentence → Practice with your partner → Your teacher may ask you to speak.</p>
  </div>`;
}
function wireS8(){
  const fromBasket = document.getElementById('s8fromBasket');
  const pickerWrap = document.getElementById('s8pickerWrap');
  let mySelection = [...basketSelection];

  function renderChosen(){
    if(mySelection.length === 0){
      fromBasket.innerHTML = '';
      pickerWrap.style.display = 'block';
      return;
    }
    pickerWrap.style.display = 'none';
    const names = mySelection.map(id=>MARKET_ITEMS.find(m=>m.id===id).nm);
    const list = names.length===1 ? names[0] : names.slice(0,-1).join(', ') + ' and ' + names[names.length-1];
    fromBasket.innerHTML = `<div class="basket-display">${mySelection.map(id=>{
      const it = MARKET_ITEMS.find(m=>m.id===id);
      return `<span class="basket-chip">${it.ic} ${it.nm}</span>`;
    }).join('')}</div>`;
    const s1 = document.getElementById('s8sentence1');
    s1.style.display = 'block';
    s1.textContent = `Say it: "I want to buy ${list}."`;
  }
  renderChosen();

  if(mySelection.length === 0){
    document.getElementById('s8picker').addEventListener('click', e=>{
      const c = e.target.closest('.big-choice'); if(!c) return;
      const id = c.dataset.id;
      if(mySelection.includes(id)){ mySelection = mySelection.filter(x=>x!==id); c.classList.remove('sel'); }
      else { if(mySelection.length>=3) return; mySelection.push(id); c.classList.add('sel'); }
      if(mySelection.length > 0) renderChosen();
    });
  }

  document.querySelectorAll('#app [data-reason]').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-reason]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      const reason = TASTE_REASONS[+c.dataset.reason].lbl;
      const firstFood = mySelection.length ? MARKET_ITEMS.find(m=>m.id===mySelection[0]).nm : 'this food';
      const s2 = document.getElementById('s8sentence2');
      s2.style.display = 'block';
      s2.textContent = `Say it: "I like ${firstFood} because it's ${reason}."`;
      markActivityComplete('s8', {score: reason});
    });
  });
}

/* ===== Section 9: Food Survey ===== */
let surveyChosen = [];
function renderS9(){
  const questions = SURVEY_QUESTIONS.map((q,i)=>`<div class="big-choice" data-sq="${i}" style="min-height:90px;"><div class="bc-lbl">${q}</div></div>`).join('');
  return `
  <div class="section-eyebrow">Section 9</div>
  <h2 class="section-title">Food Survey</h2>
  <p class="section-sub">Choose 3 questions to ask a classmate.</p>
  <div class="panel">
    <div class="big-choice-grid">${questions}</div>
    <div id="s9form" style="margin-top:20px;"></div>
  </div>`;
}
function wireS9(){
  surveyChosen = [];
  const form = document.getElementById('s9form');
  window.surveyAnswers = window.surveyAnswers || {};
  function renderForm(){
    if(surveyChosen.length === 0){ form.innerHTML = ''; return; }
    form.innerHTML = `<p style="font-weight:700;color:var(--navy);">Ask your partner. Write their answer.</p>` +
      surveyChosen.map(i=>`
        <div class="survey-row">
          <label>${SURVEY_QUESTIONS[i]}</label>
          <input type="text" data-sanswer="${i}" placeholder="Type your partner's answer" value="${window.surveyAnswers[i] || ''}">
        </div>`).join('');
    form.querySelectorAll('[data-sanswer]').forEach(inp=>{
      inp.addEventListener('input', ()=>{
        window.surveyAnswers[inp.dataset.sanswer] = inp.value;
        const filled = surveyChosen.filter(i => (window.surveyAnswers[i]||'').trim()).length;
        if(filled >= 2) markActivityComplete('s9', {score:`${filled}/${surveyChosen.length} answered`});
      });
    });
  }
  document.querySelectorAll('#app [data-sq]').forEach(c=>{
    c.addEventListener('click', ()=>{
      const i = +c.dataset.sq;
      if(surveyChosen.includes(i)){
        surveyChosen = surveyChosen.filter(x=>x!==i);
        c.classList.remove('sel');
      } else {
        if(surveyChosen.length >= 3) return;
        surveyChosen.push(i);
        c.classList.add('sel');
      }
      renderForm();
      if(surveyChosen.length >= 3) markActivityComplete('s9', {score:'3 questions chosen'});
    });
  });
}

/* ===== Section 10: Speaking Task 2 — Food Interview ===== */
function renderS10(){
  return `
  <div class="section-eyebrow">Speaking Task 2</div>
  <h2 class="section-title">Food Interview</h2>
  <p class="section-sub">Ask. Listen. Then switch roles.</p>
  <div class="panel">
    <ol class="flow-list" style="counter-reset:flow;">
      <li>Student A asks. Student B answers.</li>
      <li>Switch. Student B asks. Student A answers.</li>
      <li>Report back using the sentences below.</li>
    </ol>
  </div>
  <div class="panel">
    <div id="s10report"></div>
  </div>`;
}
function wireS10(){
  const report = document.getElementById('s10report');
  window.surveyAnswers = window.surveyAnswers || {};
  const answered = surveyChosen.filter(i => (window.surveyAnswers[i]||'').trim());
  if(answered.length === 0){
    report.innerHTML = `<p style="color:var(--muted);">Go back to <b>Food Survey</b> and write your partner's answers first. Or write them here:</p>` +
      SURVEY_QUESTIONS.map((q,i)=>`
        <div class="survey-row">
          <label>${q}</label>
          <input type="text" data-s10answer="${i}" placeholder="Type your partner's answer" value="${window.surveyAnswers[i] || ''}">
        </div>`).join('');
    report.querySelectorAll('[data-s10answer]').forEach(inp=>{
      inp.addEventListener('input', ()=>{
        window.surveyAnswers[inp.dataset.s10answer] = inp.value;
        const filled = Object.values(window.surveyAnswers).filter(v=>(v||'').trim()).length;
        if(filled >= 2) markActivityComplete('s10', {score:`${filled} answered`});
      });
    });
    return;
  }
  report.innerHTML = `<p style="font-weight:700;color:var(--navy);">Your report:</p>` + answered.map(i=>`
    <div class="sit-card">
      <p style="color:var(--muted);font-size:13px;">${SURVEY_QUESTIONS[i]}</p>
      <p style="font-weight:700;color:var(--orange-deep);margin-top:4px;">"${window.surveyAnswers[i]}"</p>
      <div class="phrase-list" style="margin-top:10px;">
        <div class="phrase-card"><span class="txt">My partner said: "${window.surveyAnswers[i]}"</span><button class="audio-mini" data-say="My partner said: ${window.surveyAnswers[i]}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>
        <div class="phrase-card"><span class="txt">I like ${window.surveyAnswers[i]}.</span><button class="audio-mini" data-say="I like ${window.surveyAnswers[i]}."><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>
      </div>
    </div>`).join('');
  report.querySelectorAll('.audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'a')));
  markActivityComplete('s10', {score:`${answered.length} reported`});
}

/* ===== Section 11: Market Role-Play Prep ===== */
function renderS11(){
  const col = (data, cls) => `
    <div class="roleplay-col ${cls}">
      <h4>${data.title}</h4>
      <ul>${data.tasks.map(t=>`<li>${t}</li>`).join('')}</ul>
      <div class="phrase-list">${data.phrases.map(p=>`<div class="phrase-card"><span class="txt">${p}</span><button class="audio-mini" data-say="${p.replace('___','something')}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>`).join('')}</div>
    </div>`;
  const mission = ROLEPLAY_MISSION.map(m=>`<li>${m}</li>`).join('');
  return `
  <div class="section-eyebrow">Section 11</div>
  <h2 class="section-title">Market Role-Play Prep</h2>
  <p class="section-sub">Work with your partner. This is practice for your final assignment.</p>
  <div class="panel">
    <div class="rule-box"><b>Mission</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${mission}</ul></div>
    <div class="roleplay-cols" style="margin-top:20px;">
      ${col(ROLE_CUSTOMER,'customer')}
      ${col(ROLE_SELLER,'server')}
    </div>
    <button class="startbtn" id="s11done" style="margin-top:20px;">We practiced the role-play →</button>
  </div>`;
}
function wireS11(){
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say,'a')));
  document.getElementById('s11done').addEventListener('click', ()=>{ markActivityComplete('s11'); goNext(); });
}

/* ===================== PRACTICE LAB ===================== */
function renderPractice(){
  const mcCards = (bank, prefix) => bank.map((item,i)=>`
    <div class="sit-card" data-${prefix}q="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${item.q}</p>
      <div class="choices" data-${prefix}choices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-${prefix}fb="${i}"></div>
    </div>`).join('');
  const listenCards = LAB_LISTEN.map((item,i)=>`
    <div class="sit-card" data-lq="${i}">
      <div class="playbar" style="padding:12px 16px;">
        <button class="play-btn" style="width:44px;height:44px;font-size:17px;" data-lplay="${i}">${icon('play',{size:17})}</button>
        <div style="flex:1;"><div class="play-sub">Listen, then choose.</div></div>
      </div>
      <div class="choices" style="margin-top:14px;" data-lchoices="${i}">
        ${item.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
      <div class="feedback" data-lfb="${i}"></div>
    </div>`).join('');
  const speakCards = LAB_SPEAK_PROMPTS.map(p=>`<div class="sit-card"><p style="font-weight:700;color:var(--orange-deep);">${p.text}</p></div>`).join('');
  return `
  <div class="section-eyebrow">Practice Lab</div>
  <h2 class="section-title">Practice Lab</h2>
  <p class="section-sub">Practice more! (Optional)</p>
  <div class="panel">
    <div class="tabs">
      <button class="tab-btn active" data-ptab="vocab">Vocabulary</button>
      <button class="tab-btn" data-ptab="culture">Culture</button>
      <button class="tab-btn" data-ptab="useful">Useful English</button>
      <button class="tab-btn" data-ptab="listen">Listening</button>
      <button class="tab-btn" data-ptab="speak">Speaking</button>
      <button class="tab-btn" data-ptab="market">Market English</button>
    </div>
    <div class="tab-panel active" data-ppanel="vocab">${mcCards(LAB_VOCAB,'v')}</div>
    <div class="tab-panel" data-ppanel="culture">${mcCards(LAB_CULTURE,'c')}</div>
    <div class="tab-panel" data-ppanel="useful">${mcCards(LAB_USEFUL,'u')}</div>
    <div class="tab-panel" data-ppanel="listen">${listenCards}</div>
    <div class="tab-panel" data-ppanel="speak">${speakCards}<p style="color:var(--muted);font-size:12px;margin-top:10px;">Say it aloud. Ask your teacher or partner to check.</p></div>
    <div class="tab-panel" data-ppanel="market">${mcCards(LAB_MARKET_EXPR,'m')}</div>
  </div>`;
}
function wireMC(bank, prefix, onAnswered){
  const answered = new Set();
  bank.forEach((item,i)=>{
    const box = document.querySelector(`[data-${prefix}choices="${i}"]`);
    const fb = document.querySelector(`[data-${prefix}fb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Great!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Try again.'; }
      if(!answered.has(i)){ answered.add(i); if(answered.size >= bank.length) onAnswered(); }
    });
  });
}
function wirePractice(){
  let vDone=false, cDone=false, uDone=false;
  function checkOverall(){
    if(vDone && cDone && uDone) markActivityComplete('practice');
  }
  document.querySelectorAll('#app [data-ptab]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-ptab]').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('#app [data-ppanel]').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`#app [data-ppanel="${btn.dataset.ptab}"]`).classList.add('active');
    });
  });
  wireMC(LAB_VOCAB, 'v', ()=>{ vDone=true; checkOverall(); });
  wireMC(LAB_CULTURE, 'c', ()=>{ cDone=true; checkOverall(); });
  wireMC(LAB_USEFUL, 'u', ()=>{ uDone=true; checkOverall(); });
  wireMC(LAB_MARKET_EXPR, 'm', ()=>{});
  LAB_LISTEN.forEach((item,i)=>{
    document.querySelector(`[data-lplay="${i}"]`).addEventListener('click', ()=> speak(item.audio,'a'));
    const box = document.querySelector(`[data-lchoices="${i}"]`);
    const fb = document.querySelector(`[data-lfb="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === item.correct){ btn.classList.add('correct'); fb.className='feedback show good'; fb.textContent='Excellent!'; }
      else{ btn.classList.add('wrong'); fb.className='feedback show meh'; fb.textContent='Listen again.'; }
    });
  });
}

/* ===== Section 12: Reflection & Take Home ===== */
function renderS12(){
  const rows = REFLECTION_ITEMS.map(r=>`
    <div class="checklist-row" data-k="${r.k}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${r.lbl}</div>
    </div>`).join('');
  const feelings = FEELING_OPTIONS.map((f,i)=>`
    <div class="big-choice" data-feel="${i}" style="flex:1;">
      <div class="bc-ic">${f.ic}</div>
      <div class="bc-lbl">${f.lbl}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 12</div>
  <h2 class="section-title">Reflection</h2>
  <p class="section-sub">What can you do now?</p>
  <div class="panel">
    ${rows}
    <hr class="hairline">
    <p style="font-weight:700;color:var(--navy);">How did you feel?</p>
    <div style="display:flex;gap:12px;margin-top:12px;">${feelings}</div>
  </div>

  <div class="panel takehome-panel">
    <div class="takehome-icon">${icon('download',{size:28})}</div>
    <div class="section-eyebrow" style="margin-top:2px;">TAKE THIS WITH YOU</div>
    <h3 style="font-family:'Oswald';color:#fff;font-size:22px;margin-top:6px;">Food Culture: Study Guide</h3>
    <p style="max-width:60ch;margin-left:auto;margin-right:auto;">Review the key vocabulary, useful expressions, and market English from Unit 7.</p>
    <img src="${STUDY_GUIDE_DATA_URI}" alt="Food Culture: Study Guide preview" class="guide-thumb" loading="lazy">
    <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="downloadGuideBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
  </div>`;
}
function wireS12(){
  const rows = document.querySelectorAll('#app .checklist-row');
  const checked = new Set();
  rows.forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.k); else checked.delete(row.dataset.k);
      if(checked.size >= REFLECTION_ITEMS.length) markActivityComplete('s12', {score:`${checked.size}/${REFLECTION_ITEMS.length} checked`});
    });
  });
  document.querySelectorAll('#app [data-feel]').forEach(c=>{
    c.addEventListener('click', ()=>{
      document.querySelectorAll('#app [data-feel]').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      sendGranularRecord('Unit 7: Feeling', {score: FEELING_OPTIONS[+c.dataset.feel].lbl});
    });
  });
}

/* ===================== COMPLETE (final end screen) ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 7 COMPLETE</div>
    <h1>You can talk about <span>food culture.</span></h1>
    <p>Now try the final assignment: buy food at a market in English with a partner.</p>
    <div class="complete-actions">
      <a href="/assignments/comm-u7-market-roleplay/index.html" class="download-btn">Final Assignment: Market Role-Play →</a>
      <a href="${STUDY_GUIDE_DATA_URI}" download="${STUDY_GUIDE_FILENAME}" id="completeDownloadBtn" class="download-btn"><span class="icon-inline">${icon('download',{size:16})}</span> Download Study Guide</a>
      <button class="tb-btn primary" id="completePracticeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('rotateCcw',{size:16})}</span> Practice Again</button>
      <button class="tb-btn" id="completeHomeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('home',{size:16})}</span> Back to Start</button>
      <a class="tb-btn" id="completeUnitsBtn" href="../index.html" style="padding:16px 26px;font-size:15px;">All Communication Units</a>
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
    const rolePlay = Progress.activities['s11'] ? 'Yes' : 'No';
    const practice = Progress.activities['practice'] ? 'Yes' : 'No';
    stats.innerHTML = `
      <p class="complete-stats-intro">Your progress has been recorded.</p>
      <div class="complete-stats-row">
        <div class="complete-stat"><div class="num">${completedCount()}/${TRACKED_ACTIVITIES.length}</div><div class="lbl">Activities Completed</div></div>
        <div class="complete-stat"><div class="num">${rolePlay}</div><div class="lbl">Role-Play Practiced</div></div>
        <div class="complete-stat"><div class="num">${practice}</div><div class="lbl">Practice Completed</div></div>
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
  {r:renderS8, w:wireS8},
  {r:renderS9, w:wireS9},
  {r:renderS10, w:wireS10},
  {r:renderS11, w:wireS11},
  {r:renderPractice, w:wirePractice},
  {r:renderS12, w:wireS12},
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
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
