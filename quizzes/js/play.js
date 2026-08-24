/* ===================== QUIZ PLAY — the student's own device ===================== */
const ANSWER_CLASSES = ['qh-a1','qh-a2','qh-a3','qh-a4'];
const ANSWER_SHAPES = [
  '<svg viewBox="0 0 24 24"><path d="M12 2 L22 20 L2 20 Z"/></svg>',
  '<svg viewBox="0 0 24 24"><path d="M12 2 L22 12 L12 22 L2 12 Z"/></svg>',
  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
  '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>'
];

const app = document.getElementById('app');
let pin = null, playerId = null, quiz = null;
let unsubscribe = null;
let answeredIndex = -1; // last question index this player has already answered

function saved(){
  try { return JSON.parse(sessionStorage.getItem('qh_player') || 'null'); } catch(e){ return null; }
}
function save(data){ sessionStorage.setItem('qh_player', JSON.stringify(data)); }
function clearSaved(){ sessionStorage.removeItem('qh_player'); }

async function init(){
  const remembered = saved();
  if(remembered && await QuizBackend.sessionExists(remembered.pin)){
    pin = remembered.pin; playerId = remembered.playerId; quiz = findQuiz(remembered.quizId);
    unsubscribe = QuizBackend.subscribeSession(pin, onSessionChange);
  } else {
    clearSaved();
    renderJoin();
  }
}

function renderJoin(err){
  app.innerHTML = `
    <div class="qh-join-card">
      <h1 class="qh-display">Join a Game</h1>
      <p class="sub">Enter your details and the PIN your teacher shows on screen.</p>
      <div class="qh-join-error ${err ? 'show' : ''}" id="joinErr">${err || ''}</div>
      <div class="qh-field"><label for="jPin">Game PIN</label><input type="text" id="jPin" class="qh-pin-input" inputmode="numeric" maxlength="6" placeholder="123456" autocomplete="off"></div>
      <div class="qh-field"><label for="jId">Student ID</label><input type="text" id="jId" autocomplete="off"></div>
      <div class="qh-field"><label for="jFirst">First Name</label><input type="text" id="jFirst" autocomplete="off"></div>
      <div class="qh-field"><label for="jLast">Last Name</label><input type="text" id="jLast" autocomplete="off"></div>
      <button class="qh-btn qh-btn-primary" id="joinBtn" style="width:100%;margin-top:20px;justify-content:center;">Enter →</button>
    </div>`;
  document.getElementById('joinBtn').addEventListener('click', doJoin);
  document.getElementById('jPin').addEventListener('keydown', e => { if(e.key==='Enter') doJoin(); });
}

async function doJoin(){
  const pinVal = document.getElementById('jPin').value.trim();
  const idVal = document.getElementById('jId').value.trim();
  const firstVal = document.getElementById('jFirst').value.trim();
  const lastVal = document.getElementById('jLast').value.trim();
  const errEl = document.getElementById('joinErr');
  if(!pinVal || !idVal || !firstVal || !lastVal){
    errEl.textContent = 'Please fill in every field.'; errEl.classList.add('show'); return;
  }
  const exists = await QuizBackend.sessionExists(pinVal);
  if(!exists){
    errEl.textContent = `No live game found for PIN ${pinVal}. Check the PIN and try again.`;
    errEl.classList.add('show');
    return;
  }
  playerId = (crypto.randomUUID ? crypto.randomUUID() : 'p' + Date.now() + Math.random().toString(16).slice(2));
  pin = pinVal;
  const playerObj = {studentId: idVal, firstName: firstVal, lastName: lastVal, score: 0, joinedAt: QuizBackend.serverNow()};
  await QuizBackend.setPlayer(pin, playerId, playerObj);

  // Read the session once to learn which quiz this PIN belongs to (needed for
  // rendering answers/timer client-side), then subscribe for live updates.
  // (LocalBackend calls its callback synchronously on subscribe, before this
  // function even returns an unsubscribe handle — so `off` must exist first.)
  const probe = await new Promise(resolve => {
    let off = () => {};
    off = QuizBackend.subscribeSession(pin, s => { off(); resolve(s); });
  });
  quiz = probe ? findQuiz(probe.quizId) : null;
  save({pin, playerId, quizId: probe ? probe.quizId : null, studentId: idVal, firstName: firstVal, lastName: lastVal});
  unsubscribe = QuizBackend.subscribeSession(pin, onSessionChange);
}

function onSessionChange(session){
  if(!session){
    clearSaved();
    renderStatus(null, 'Game ended', 'This session is no longer active.', true);
    return;
  }
  if(session.status === 'lobby') renderWaiting(session);
  else if(session.status === 'question') renderQuestionOrWaiting(session);
  else if(session.status === 'reveal') renderReveal(session);
  else if(session.status === 'final') renderFinal(session);
}

function renderStatus(statusIcon, title, sub, showLeave){
  app.innerHTML = `
    <div class="qh-status-screen">
      ${statusIcon ? `<div class="qh-status-icon">${statusIcon}</div>` : ''}
      <div class="qh-status-title">${title}</div>
      <div class="qh-status-sub">${sub}</div>
      ${showLeave ? `<a href="play.html" class="qh-btn qh-btn-secondary" style="margin-top:10px;">Join Another Game</a>` : ''}
    </div>`;
  if(showLeave){
    const a = app.querySelector('a');
    a.addEventListener('click', () => clearSaved());
  }
}

function renderWaiting(session){
  const me = (session.players || {})[playerId];
  renderStatus(null, "You're in!", `Waiting for the host to start "${session.title}"…`, false);
  if(me){
    const wrap = app.querySelector('.qh-status-screen');
    wrap.insertAdjacentHTML('beforeend', `<div class="qh-status-name">${playerFullName(me)}</div>`);
  }
}

function renderQuestionOrWaiting(session){
  const qIndex = session.currentIndex;
  const already = session.answers && session.answers[qIndex] && session.answers[qIndex][playerId];
  if(already || answeredIndex === qIndex){
    renderStatus(icon('check',{size:48}), 'Answer locked in!', 'Waiting for everyone else to finish…', false);
    return;
  }
  const q = quiz.questions[qIndex];
  app.innerHTML = `
    <div class="qh-answer-wrap">
      <div class="qh-answer-meta">Question ${qIndex+1} of ${quiz.questions.length}. Look at the shared screen!</div>
      <div class="qh-answer-grid-play">
        ${q.answers.map((a,i) => `
          <button class="qh-answer-tap ${ANSWER_CLASSES[i]}" data-i="${i}" aria-label="Answer ${i+1}">${ANSWER_SHAPES[i]}</button>
        `).join('')}
      </div>
    </div>`;
  app.querySelectorAll('.qh-answer-tap').forEach(btn => {
    btn.addEventListener('click', async () => {
      if(answeredIndex === qIndex) return;
      answeredIndex = qIndex;
      const choiceIndex = +btn.dataset.i;
      const correct = choiceIndex === q.correct;
      const msElapsed = Date.now() - session.questionStartedAt;
      const pointsEarned = computeQuizPoints(correct, msElapsed, q.timeLimit * 1000);
      await QuizBackend.setAnswer(pin, qIndex, playerId, {
        choiceIndex, correct, pointsEarned, answeredAt: QuizBackend.serverNow()
      });
      renderStatus(icon('check',{size:48}), 'Answer locked in!', 'Waiting for everyone else to finish…', false);
    });
  });
}

function renderReveal(session){
  const qIndex = session.currentIndex;
  const mine = session.answers && session.answers[qIndex] && session.answers[qIndex][playerId];
  const ranked = rankPlayers(session.players);
  const myRank = ranked.findIndex(p => p.id === playerId) + 1;
  const me = (session.players || {})[playerId];
  const correct = mine ? mine.correct : false;
  app.innerHTML = `
    <div class="qh-status-screen">
      <div class="qh-status-icon">${correct ? icon('check',{size:48}) : mine ? icon('x',{size:48}) : ''}</div>
      <div class="qh-reveal-result ${correct ? 'correct' : 'wrong'}">${correct ? 'Correct!' : mine ? 'Not quite' : "Time's up"}</div>
      <div class="qh-reveal-points">+${mine ? mine.pointsEarned : 0} points</div>
      <div class="qh-reveal-rank">Total score: ${me ? me.score : 0} · Rank ${myRank || '—'} of ${ranked.length}</div>
    </div>`;
}

function renderFinal(session){
  const ranked = rankPlayers(session.players);
  const myRank = ranked.findIndex(p => p.id === playerId) + 1;
  const me = (session.players || {})[playerId];
  app.innerHTML = `
    <div class="qh-status-screen">
      <div class="qh-status-title">Game Over!</div>
      <div class="qh-reveal-points" style="font-size:24px;">${me ? me.score : 0} points</div>
      <div class="qh-reveal-rank">You finished ${myRank || '—'} of ${ranked.length}</div>
      <a href="play.html" class="qh-btn qh-btn-primary" style="margin-top:14px;" id="leaveBtn">Join Another Game</a>
    </div>`;
  document.getElementById('leaveBtn').addEventListener('click', () => clearSaved());
}

init();
