/* ===================== APP STATE / ROUTER =====================
   Same router/progress/voice/checkin/deep-link/audio architecture as
   Unit 8 (copied, unchanged in shape) — see that file's comments for
   the full rationale. Nothing here is a new system; Unit 9 plugs into
   the existing one. */
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

const TRACKED_ACTIVITIES = ['s1','s2','s3','s4','s5','s6'];

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

/* ===================== VOICE ENGINE (TTS, for vocab/phrases) ===================== */
const VoiceEngine = (function(){
  let allVoices = [];
  let voiceA = null;
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
    onStateChange();
  }
  if('speechSynthesis' in window){
    window.speechSynthesis.onvoiceschanged = refresh;
    refresh();
  }
  function splitSentences(text){
    return text.replace(/([.!?])\s+/g,'$1|').split('|').map(s=>s.trim()).filter(Boolean);
  }
  function makeUtterance(text){
    const u = new SpeechSynthesisUtterance(text);
    if(voiceA) u.voice = voiceA;
    u.lang = 'en-US'; u.rate = 1.0; u.pitch = 0.98;
    return u;
  }
  function playNext(){
    if(queueIndex >= queue.length){ playing=false; paused=false; onStateChange(); return; }
    const item = queue[queueIndex];
    const sentences = splitSentences(item.text);
    let sIdx = 0;
    function playSentence(){
      if(sIdx >= sentences.length){ queueIndex++; setTimeout(playNext, 420); return; }
      const u = makeUtterance(sentences[sIdx]);
      u.onend = ()=>{ sIdx++; setTimeout(playSentence, 160); };
      window.speechSynthesis.speak(u);
    }
    playSentence();
  }
  return {
    isPlaying(){ return playing; },
    onChange(fn){ onStateChange = fn; },
    speakLine(text){
      this.stop();
      queue = [{text}];
      queueIndex = 0; playing = true; paused = false; onStateChange();
      playNext();
    },
    stop(){ window.speechSynthesis.cancel(); playing=false; paused=false; queue=[]; queueIndex=0; onStateChange(); }
  };
})();
function speak(text){
  if(!('speechSynthesis' in window)) { alert('Text-to-speech is not supported in this browser.'); return; }
  VoiceEngine.speakLine(text);
}

/* ===================== AUDIO PLAYER (real licensed Q Skills recordings) ===================== */
const AudioPlayer = (function(){
  const els = new Map();
  let onStateChange = ()=>{};
  function get(src){
    if(!els.has(src)){
      const a = new Audio(src);
      a.preload = 'none';
      a.addEventListener('play', notify);
      a.addEventListener('pause', notify);
      a.addEventListener('ended', notify);
      els.set(src, a);
    }
    return els.get(src);
  }
  function notify(){ onStateChange(); }
  function stopOthers(exceptSrc){
    els.forEach((a,src)=>{ if(src!==exceptSrc && !a.paused) a.pause(); });
  }
  return {
    onChange(fn){ onStateChange = fn; },
    toggle(src){
      const a = get(src);
      if(a.paused){ stopOthers(src); a.play(); }
      else { a.pause(); }
    },
    isPlaying(src){ const a = els.get(src); return !!a && !a.paused && !a.ended; },
    stopAll(){ els.forEach(a=>a.pause()); }
  };
})();
function renderAudioTrack(src, label, sub){
  return `<div class="playbar audio-track" data-audio-wrap="${src}">
    <button class="play-btn" data-audio-btn="${src}" aria-label="Play ${label}">${icon('play',{size:22})}</button>
    <div><div class="play-label">${label}</div><div class="play-sub">${sub}</div></div>
  </div>`;
}
function wireAudioTracks(){
  document.querySelectorAll('#app [data-audio-btn]').forEach(btn=>{
    btn.addEventListener('click', ()=> AudioPlayer.toggle(btn.dataset.audioBtn));
  });
  AudioPlayer.onChange(()=>{
    document.querySelectorAll('#app [data-audio-btn]').forEach(btn=>{
      const playing = AudioPlayer.isPlaying(btn.dataset.audioBtn);
      btn.classList.toggle('playing', playing);
      btn.innerHTML = playing ? icon('pause',{size:22}) : icon('play',{size:22});
    });
  });
}

/* ===================== SECTION RENDERERS ===================== */
function renderCover(){
  return `
  <div class="cover">
    <div class="cover-badge">ENGLISH FOR COMMUNICATION</div>
    <h1>Agree, Disagree <span>& Discuss</span></h1>
    <p>Unit 9: Sociology, Day 2. Practice pronouns and reduced pronunciation, learn to agree and disagree politely, then prepare your group discussion assignment.</p>
    <div class="signdock">
      <div class="signchip"><span class="arrow">→</span> Grammar practice</div>
      <div class="signchip"><span class="arrow">→</span> Real speaking audio</div>
      <div class="signchip"><span class="arrow">→</span> Group discussion</div>
    </div>
    <button class="startbtn" onclick="goNext()">Let's begin →</button>
  </div>`;
}

/* ===== Section 1: Grammar — Subject and Object Pronouns ===== */
function renderS1(){
  const rows = PRONOUN_TABLE.map(p=>`<tr><td>${p.subject}</td><td>${p.object}</td></tr>`).join('');
  const circle = PRONOUN_CIRCLE.map((p,i)=>`
    <div class="sit-card" data-pc="${i}">
      <p style="font-weight:700;color:var(--navy);">${i+1}. ${p.sentence}</p>
      <div class="choices" data-pcchoices="${i}">
        ${p.opts.map((o,j)=>`<button class="choice-btn" data-i="${j}"><span class="letter">${String.fromCharCode(65+j)}</span> ${o}</button>`).join('')}
      </div>
    </div>`).join('');
  const replace = PRONOUN_REPLACE.map((r,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt">${r.sentence.replace(r.underline, `<u>${r.underline}</u>`)}</div>
      <input type="text" data-pr="${i}" placeholder="pronoun">
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 1 · Grammar</div>
  <h2 class="section-title">Subject and Object Pronouns</h2>
  <p class="section-sub">Subject pronouns come before the verb. Object pronouns come after the verb, or after a preposition.</p>
  <div class="panel">
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr><th style="text-align:left;padding:8px;color:var(--navy);font-family:var(--font-display);">Subject</th><th style="text-align:left;padding:8px;color:var(--navy);font-family:var(--font-display);">Object</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Activity A: Choose the correct pronoun.</h3>
    ${circle}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Activity B: Replace the underlined words with a pronoun.</h3>
    ${replace}
    <button class="reveal-btn" id="s1check">Check My Answers</button>
    <div class="answer-key" id="s1key"></div>
  </div>`;
}
function wireS1(){
  const aDone = new Set();
  PRONOUN_CIRCLE.forEach((p,i)=>{
    const box = document.querySelector(`[data-pcchoices="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct','wrong'));
      if(+btn.dataset.i === p.answer) btn.classList.add('correct'); else { btn.classList.add('wrong'); box.children[p.answer].classList.add('correct'); }
      aDone.add(i);
      if(aDone.size >= PRONOUN_CIRCLE.length) checkOverall();
    });
  });
  function checkOverall(){ if(aDone.size >= PRONOUN_CIRCLE.length) markActivityComplete('s1', {score:`${aDone.size}/${PRONOUN_CIRCLE.length}`}); }
  document.getElementById('s1check').addEventListener('click', ()=>{
    const key = document.getElementById('s1key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Answer Key</b><br>' + PRONOUN_REPLACE.map((r,i)=>`${i+1}. ${r.answer}`).join('<br>');
    checkOverall();
  });
}

/* ===== Section 2: Pronunciation — Reduced Pronouns (real audio) ===== */
function renderS2(){
  const tip = REDUCED_TIP.map(t=>`<li>${t}</li>`).join('');
  const dialogueHtml = REDUCED_DIALOGUE.map((d,i)=>{
    if(!d.answers) return `<p style="margin-top:10px;color:var(--ink);">${d.line}</p>`;
    let idx = 0;
    const line = d.line.replace(/___/g, ()=>`<input type="text" data-rd="${i}-${idx++}" style="width:70px;display:inline-block;margin:0 4px;">`);
    return `<p style="margin-top:10px;color:var(--ink);">${line}</p>`;
  }).join('');
  return `
  <div class="section-eyebrow">Section 2 · Pronunciation</div>
  <h2 class="section-title">Reduced Pronouns</h2>
  <p class="section-sub">Listen to how he, him, her, and them sound in fast, natural speech.</p>
  <div class="panel">
    <div class="rule-box"><b>Tip</b><ul style="margin:10px 0 0 18px;padding:0;line-height:1.8;">${tip}</ul></div>
    ${renderAudioTrack(AUDIO.pronExamples, 'Examples', 'Listen to reduced pronouns in short example sentences.')}
  </div>
  <div class="panel">
    ${renderAudioTrack(AUDIO.pronActivity, 'Practice Dialogue', 'Listen and complete the dialogue below.')}
    <div style="margin-top:18px;">${dialogueHtml}</div>
    <button class="reveal-btn" id="s2check">Check My Answers</button>
    <div class="answer-key" id="s2key"></div>
  </div>`;
}
function wireS2(){
  wireAudioTracks();
  document.getElementById('s2check').addEventListener('click', ()=>{
    const key = document.getElementById('s2key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Answer Key</b><br>him, he &nbsp;·&nbsp; her &nbsp;·&nbsp; her';
    markActivityComplete('s2', {score:'completed'});
  });
}

/* ===== Section 3: Speaking Skill — Agreeing and Disagreeing (real audio) ===== */
function renderS3(){
  const phrases = AGREE_PHRASES.map(p=>`<div class="phrase-card"><span class="txt">${p.ex}</span><button class="audio-mini" data-say="${p.ex}"><span class="icon-inline">${icon('headphones',{size:14})}</span></button></div>`).join('');
  const listen = AGREE_LISTEN_PROMPTS.map((p,i)=>`
    <div class="sit-card" data-al="${i}">
      <p style="font-weight:700;color:var(--navy);">${p}</p>
      <div class="choices" data-alchoices="${i}">
        <button class="choice-btn" data-v="agree"><span class="letter">A</span> Agree</button>
        <button class="choice-btn" data-v="disagree"><span class="letter">D</span> Disagree</button>
      </div>
    </div>`).join('');
  const create = AGREE_CREATE_PROMPTS.map((p,i)=>`
    <div class="fill-row">
      <div class="fr-num">${i+1}</div>
      <div class="fr-prompt" style="flex:2;">${p}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 3 · Speaking Skill</div>
  <h2 class="section-title">Agreeing and Disagreeing</h2>
  <p class="section-sub">Use these expressions to agree or disagree politely in a conversation.</p>
  <div class="panel">
    <div class="phrase-list">${phrases}</div>
    ${renderAudioTrack(AUDIO.speakExamples, 'Examples', 'Listen to short example conversations.')}
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Listen and decide: agree or disagree?</h3>
    ${renderAudioTrack(AUDIO.speakActivity, 'Practice Conversations', 'Listen to 6 short exchanges. There is no single right answer — discuss what you hear with a partner.')}
    ${listen}
    <button class="startbtn" id="s3done" style="margin-top:20px;">We discussed all 6 →</button>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Now it's your turn.</h3>
    <p class="section-sub" style="margin-top:0;">Complete each sentence about yourself. Share it with a partner. Agree or disagree with each other.</p>
    ${create}
  </div>`;
}
function wireS3(){
  wireAudioTracks();
  document.querySelectorAll('#app .audio-mini').forEach(b=>b.addEventListener('click', ()=>speak(b.dataset.say)));
  AGREE_LISTEN_PROMPTS.forEach((p,i)=>{
    const box = document.querySelector(`[data-alchoices="${i}"]`);
    box.addEventListener('click', e=>{
      const btn = e.target.closest('.choice-btn'); if(!btn) return;
      [...box.children].forEach(b=>b.classList.remove('correct'));
      btn.classList.add('correct');
    });
  });
  document.getElementById('s3done').addEventListener('click', ()=>{ markActivityComplete('s3'); goNext(); });
}

/* ===== Section 4: Consider the Ideas (real audio) ===== */
function renderS4(){
  const rows = CONSIDER_ACTIVITIES.map(a=>`
    <div class="checklist-row" data-ci="${a.id}">
      <div class="checklist-box">✓</div>
      <div class="checklist-lbl">${a.label}</div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Section 4</div>
  <h2 class="section-title">Consider the Ideas</h2>
  <p class="section-sub">Listen to a group discuss free-time activities. Check the activities they mention.</p>
  <div class="panel">
    ${renderAudioTrack(AUDIO.considerIdeas, 'Consider the Ideas', 'A group discusses activities they enjoy in their area.')}
    <div style="margin-top:20px;">${rows}</div>
    <button class="reveal-btn" id="s4check">Check My Answers</button>
    <div class="answer-key" id="s4key"></div>
  </div>`;
}
function wireS4(){
  wireAudioTracks();
  const checked = new Set();
  document.querySelectorAll('#app .checklist-row').forEach(row=>{
    row.addEventListener('click', ()=>{
      row.classList.toggle('checked');
      if(row.classList.contains('checked')) checked.add(row.dataset.ci); else checked.delete(row.dataset.ci);
    });
  });
  document.getElementById('s4check').addEventListener('click', ()=>{
    let correct = 0;
    document.querySelectorAll('#app .checklist-row').forEach(row=>{
      const a = CONSIDER_ACTIVITIES.find(x=>x.id===row.dataset.ci);
      const isChecked = row.classList.contains('checked');
      if(isChecked === a.mentioned) correct++;
      row.style.borderLeft = a.mentioned ? '4px solid var(--green-safe)' : '4px solid var(--danger)';
    });
    const key = document.getElementById('s4key');
    key.className = 'answer-key show';
    key.innerHTML = '<b>Mentioned in the recording:</b> ' + CONSIDER_ACTIVITIES.filter(a=>a.mentioned).map(a=>a.label).join(', ');
    markActivityComplete('s4', {score:`${correct}/${CONSIDER_ACTIVITIES.length}`});
  });
}

/* ===== Section 5: Plan Your Group Discussion ===== */
function renderS5(){
  const rows = Array.from({length:PLAN_ROWS_COUNT}).map((_,i)=>`
    <tr>
      <td style="padding:8px;"><input type="text" data-plan="${i}-0" placeholder="e.g. hiking"></td>
      <td style="padding:8px;"><input type="text" data-plan="${i}-1" placeholder="e.g. Doi Suthep"></td>
      <td style="padding:8px;"><input type="text" data-plan="${i}-2" placeholder="e.g. it's relaxing"></td>
    </tr>`).join('');
  return `
  <div class="section-eyebrow">Section 5</div>
  <h2 class="section-title">Plan Your Group Discussion</h2>
  <p class="section-sub">Fill in this chart before your discussion. You will use it in Section 6.</p>
  <div class="panel">
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>${PLAN_HEADERS.map(h=>`<th style="text-align:left;padding:8px;color:var(--navy);font-family:var(--font-display);font-size:12.5px;">${h}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <button class="startbtn" id="s5done" style="margin-top:20px;">My chart is ready →</button>
  </div>`;
}
function wireS5(){
  document.getElementById('s5done').addEventListener('click', ()=>{
    const filled = document.querySelectorAll('#app [data-plan]');
    const count = [...filled].filter(i=>i.value.trim()).length;
    markActivityComplete('s5', {score:`${count}/${PLAN_ROWS_COUNT*3} filled`});
    goNext();
  });
}

/* ===== Section 6: Unit Assignment & Rubric ===== */
function renderS6(){
  const steps = ASSIGNMENT.steps.map(s=>`<li>${s}</li>`).join('');
  const rubric = RUBRIC_ROWS.map((r,i)=>`
    <div class="rubric-row">
      <div><div class="lbl">${r.lbl}</div><div class="sub">${r.sub}</div></div>
      <div class="rate" data-rubric="${i}">
        ${RUBRIC_SCALE.map(s=>`<button data-pts="${s.pts}" title="${s.note}">${s.pts}</button>`).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="section-eyebrow">Unit Assignment</div>
  <h2 class="section-title">${ASSIGNMENT.title}</h2>
  <p class="section-sub">${ASSIGNMENT.prompt}</p>
  <div class="panel">
    <div class="assign-box"><h3>How to do it</h3><ul>${steps}</ul></div>
  </div>
  <div class="panel">
    <h3 style="font-size:16px;color:var(--navy);">Self-Check Rubric</h3>
    <p class="section-sub" style="margin-top:4px;">Rate yourself honestly after your discussion. Your teacher will also grade you with this rubric.</p>
    ${rubric}
    <div id="s6total" style="margin-top:18px;font-family:var(--font-display);color:var(--navy);font-size:16px;"></div>
  </div>`;
}
function wireS6(){
  const scores = {};
  document.querySelectorAll('#app [data-rubric]').forEach(row=>{
    row.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...row.children].forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      scores[row.dataset.rubric] = +btn.dataset.pts;
      const total = Object.values(scores).reduce((a,b)=>a+b,0);
      document.getElementById('s6total').textContent = `Self-Check Total: ${total} / ${RUBRIC_ROWS.length*20} points`;
      if(Object.keys(scores).length >= RUBRIC_ROWS.length) markActivityComplete('s6', {score:`${total}/${RUBRIC_ROWS.length*20}`});
    });
  });
}

/* ===================== COMPLETE ===================== */
function renderComplete(){
  return `
  <div class="cover complete-cover">
    <div class="cover-badge">UNIT 9 COMPLETE</div>
    <h1>You can <span>agree, disagree, and discuss.</span></h1>
    <p>Next: Unit 10 begins Architecture, "What makes a good home?"</p>
    <div class="complete-actions">
      <button class="tb-btn primary" id="completePracticeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('rotateCcw',{size:16})}</span> Practice Again</button>
      <button class="tb-btn" id="completeHomeBtn" style="padding:16px 26px;font-size:15px;"><span class="icon-inline">${icon('home',{size:16})}</span> Back to Start</button>
      <a class="tb-btn" id="completeUnitsBtn" href="../index.html" style="padding:16px 26px;font-size:15px;">All Communication Units</a>
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
  {r:renderComplete, w:wireComplete}
];

function renderAll(){
  buildProgress();
  AudioPlayer.stopAll();
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
