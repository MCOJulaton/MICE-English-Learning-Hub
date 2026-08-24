/* ===================== QUIZ HOST — the live "big screen" ===================== */
const ANSWER_CLASSES = ['qh-a1','qh-a2','qh-a3','qh-a4'];
const ANSWER_SHAPES = [
  '<svg class="shape" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L22 20 L2 20 Z"/></svg>', // triangle
  '<svg class="shape" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L22 12 L12 22 L2 12 Z"/></svg>', // diamond
  '<svg class="shape" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>', // circle
  '<svg class="shape" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>' // square
];

const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
const quizId = params.get('quiz');
const quiz = quizId ? findQuiz(quizId) : null;

let pin = params.get('pin') || null;
let unsubscribe = null;
let timerInterval = null;
let currentSession = null;

function el(html){ const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }

function renderError(msg){
  app.innerHTML = `
    <div style="text-align:center;padding:60px 20px;">
      <p class="qh-heading" style="font-size:22px;color:var(--qh-gold);">${msg}</p>
      <a href="index.html" class="qh-btn qh-btn-secondary" style="margin-top:20px;">← Back to Quiz Hub</a>
    </div>`;
}

async function init(){
  if(!quiz){ renderError('Quiz not found.'); return; }
  if(quiz.locked){ renderError(`${quiz.title} is locked and can't be hosted yet.`); return; }

  if(pin){
    const exists = await QuizBackend.sessionExists(pin);
    if(!exists) pin = null;
  }
  if(!pin){
    pin = await QuizBackend.generateUniquePin();
    await QuizBackend.createSession(pin, {
      quizId: quiz.id, courseName: quiz.courseName, unit: quiz.unit, title: quiz.title,
      status: 'lobby', currentIndex: -1, questionStartedAt: null,
      createdAt: QuizBackend.serverNow(), players: {}, answers: {}
    });
    history.replaceState(null, '', `host.html?quiz=${quiz.id}&pin=${pin}`);
  }
  unsubscribe = QuizBackend.subscribeSession(pin, onSessionChange);
}

function onSessionChange(session){
  currentSession = session;
  if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
  if(!session){ renderError('This session ended.'); return; }
  if(session.status === 'lobby') renderLobby(session);
  else if(session.status === 'question') renderQuestion(session);
  else if(session.status === 'reveal') renderReveal(session);
  else if(session.status === 'final') renderFinal(session);
}

/* ---------- LOBBY ---------- */
function renderLobby(session){
  const players = Object.values(session.players || {});
  app.innerHTML = `
    <div class="qh-host-top">
      <a class="brand" href="index.html"><div class="badge">QH</div><div class="t1">QUIZ HUB</div></a>
      <a href="index.html" class="qh-btn qh-btn-secondary" style="padding:9px 16px;font-size:12.5px;">Cancel</a>
    </div>
    <div class="qh-lobby">
      <div class="qh-lobby-quiz-title">${session.title}</div>
      <div class="qh-pin-card">
        <div class="qh-pin-label">GAME PIN</div>
        <div class="qh-pin-value">${pin}</div>
        <div class="qh-pin-hint">Students go to <b>/quizzes/play.html</b> and enter this PIN.</div>
      </div>
      <div class="qh-player-count">${players.length} player${players.length===1?'':'s'} joined</div>
      <div class="qh-player-grid" id="playerGrid">
        ${players.map(p => `<div class="qh-player-chip">${playerFullName(p)}</div>`).join('')}
      </div>
      <button class="qh-btn qh-btn-primary" id="startBtn" style="font-size:18px;padding:16px 40px;" ${players.length===0?'disabled':''}><span class="icon-inline">${icon('play',{size:18})}</span> Start Game</button>
    </div>`;
  const startBtn = document.getElementById('startBtn');
  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    await QuizBackend.updateSession(pin, {
      status: 'question', currentIndex: 0, questionStartedAt: QuizBackend.serverNow()
    });
  });
}

/* ---------- QUESTION ---------- */
function renderQuestion(session){
  const q = quiz.questions[session.currentIndex];
  const total = Object.keys(session.players || {}).length;
  app.innerHTML = `
    <div class="qh-host-top">
      <a class="brand" href="index.html"><div class="badge">QH</div><div class="t1">QUIZ HUB</div></a>
      <div class="qh-pin-label">PIN <b style="color:var(--qh-gold);">${pin}</b></div>
    </div>
    <div class="qh-q-wrap">
      <div class="qh-q-meta">
        <span>Question ${session.currentIndex+1} / ${quiz.questions.length}</span>
        <div class="qh-timer-ring" id="timerRing" style="--pct:100;"><div class="qh-timer-inner" id="timerNum">${q.timeLimit}</div></div>
      </div>
      <div class="qh-q-text">${q.q}</div>
      <div class="qh-answered-count" id="answeredCount">0 / ${total} answered</div>
      <div class="qh-answers-grid">
        ${q.answers.map((a,i) => `
          <div class="qh-answer-tile ${ANSWER_CLASSES[i]}">
            ${ANSWER_SHAPES[i]}
            <span class="txt">${a}</span>
          </div>`).join('')}
      </div>
      <div class="qh-host-actions">
        <button class="qh-btn qh-btn-secondary" id="revealNowBtn">Reveal Now</button>
      </div>
    </div>`;

  document.getElementById('revealNowBtn').addEventListener('click', () => doReveal(session));

  const deadline = session.questionStartedAt + q.timeLimit * 1000;
  const ring = document.getElementById('timerRing');
  const num = document.getElementById('timerNum');
  timerInterval = setInterval(() => {
    const remainMs = deadline - Date.now();
    const remainS = Math.max(0, Math.ceil(remainMs/1000));
    num.textContent = remainS;
    ring.style.setProperty('--pct', Math.max(0, Math.round((remainMs/(q.timeLimit*1000))*100)));
    updateAnsweredCount();
    if(remainMs <= 0){
      clearInterval(timerInterval); timerInterval = null;
      doReveal(currentSession);
    }
  }, 250);

  function updateAnsweredCount(){
    const answered = Object.keys((currentSession.answers && currentSession.answers[session.currentIndex]) || {}).length;
    const el2 = document.getElementById('answeredCount');
    if(el2) el2.textContent = `${answered} / ${total} answered`;
  }
}

async function doReveal(session){
  if(!session || session.status !== 'question') return;
  const qIndex = session.currentIndex;
  const q = quiz.questions[qIndex];
  const answersForQ = (session.answers && session.answers[qIndex]) || {};
  const players = session.players || {};
  // Host is the single source of truth for cumulative score updates, to
  // avoid two writers racing on the same player node.
  for(const playerId of Object.keys(answersForQ)){
    const ans = answersForQ[playerId];
    const p = players[playerId];
    if(!p) continue;
    const newScore = (p.score || 0) + (ans.pointsEarned || 0);
    await QuizBackend.setPlayer(pin, playerId, Object.assign({}, p, {score: newScore}));
  }
  await QuizBackend.updateSession(pin, {status: 'reveal'});
}

/* ---------- REVEAL ---------- */
function renderReveal(session){
  const qIndex = session.currentIndex;
  const q = quiz.questions[qIndex];
  const answersForQ = (session.answers && session.answers[qIndex]) || {};
  const total = Object.values(answersForQ).length || 1;
  const counts = q.answers.map((a,i) => Object.values(answersForQ).filter(x => x.choiceIndex === i).length);
  const isLast = qIndex >= quiz.questions.length - 1;
  const ranked = rankPlayers(session.players).slice(0,5);

  app.innerHTML = `
    <div class="qh-host-top">
      <a class="brand" href="index.html"><div class="badge">QH</div><div class="t1">QUIZ HUB</div></a>
      <div class="qh-pin-label">PIN <b style="color:var(--qh-gold);">${pin}</b></div>
    </div>
    <div class="qh-q-wrap">
      <div class="qh-q-meta"><span>Question ${qIndex+1} / ${quiz.questions.length}: Answer Revealed</span></div>
      <div class="qh-q-text" style="font-size:clamp(18px,3vw,28px);">${q.q}</div>
      <div class="qh-answers-grid">
        ${q.answers.map((a,i) => `
          <div class="qh-answer-tile ${ANSWER_CLASSES[i]} ${i===q.correct?'correct':'dimmed'}">
            <div class="bar" style="width:${Math.round((counts[i]/total)*100)}%;"></div>
            ${ANSWER_SHAPES[i]}
            <span class="txt">${a}${i===q.correct?' ✓':''}</span>
            <span class="count">${counts[i]}</span>
          </div>`).join('')}
      </div>
      <div class="qh-section-title" style="color:#fff;margin-top:10px;">Leaderboard</div>
      <div class="qh-leaderboard">
        ${ranked.length ? ranked.map((p,i) => `
          <div class="qh-lb-row"><span class="rank">${i+1}</span><span class="name">${playerFullName(p)}</span><span class="score">${p.score||0}</span></div>
        `).join('') : `<p style="text-align:center;color:#d8ccff;">No one answered this one.</p>`}
      </div>
      <div class="qh-host-actions">
        <button class="qh-btn qh-btn-primary" id="nextBtn" style="font-size:17px;padding:15px 34px;">${isLast ? 'Final Results' : 'Next Question →'}</button>
      </div>
    </div>`;

  document.getElementById('nextBtn').addEventListener('click', async () => {
    if(isLast){
      await QuizBackend.updateSession(pin, {status: 'final'});
    } else {
      await QuizBackend.updateSession(pin, {
        status: 'question', currentIndex: qIndex+1, questionStartedAt: QuizBackend.serverNow()
      });
    }
  });
}

/* ---------- FINAL ---------- */
function renderFinal(session){
  const ranked = rankPlayers(session.players);
  const podiumOrder = [ranked[1], ranked[0], ranked[2]].filter(Boolean); // silver, gold, bronze visual order
  const classFor = (p) => p===ranked[0] ? 'gold' : p===ranked[1] ? 'silver' : 'bronze';

  app.innerHTML = `
    <div class="qh-host-top">
      <a class="brand" href="index.html"><div class="badge">QH</div><div class="t1">QUIZ HUB</div></a>
    </div>
    <div class="qh-lobby">
      <div class="qh-lobby-quiz-title qh-display" style="font-size:clamp(24px,4vw,38px);">Game Over!</div>
      <div class="qh-podium">
        ${podiumOrder.map(p => `
          <div class="qh-podium-step ${classFor(p)}">
            <div class="pname">${playerFullName(p)}</div>
            <div class="pscore">${p.score||0} pts</div>
            <div class="plinth">${classFor(p)==='gold'?'1st':classFor(p)==='silver'?'2nd':'3rd'}</div>
          </div>`).join('')}
      </div>
      <div class="qh-leaderboard">
        ${ranked.map((p,i) => `
          <div class="qh-lb-row"><span class="rank">${i+1}</span><span class="name">${playerFullName(p)}</span><span class="score">${p.score||0}</span></div>
        `).join('')}
      </div>
      <div class="qh-host-actions">
        <a href="host.html?quiz=${quiz.id}" class="qh-btn qh-btn-primary">Play Again</a>
        <a href="index.html" class="qh-btn qh-btn-secondary">Back to Quiz Hub</a>
      </div>
    </div>`;
}

init();
