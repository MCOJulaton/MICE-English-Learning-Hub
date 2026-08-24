/* ===================== QUIZ HUB ENGINE =====================
   A small backend-agnostic adapter used by both host.js and play.js.
   Picks a real-time transport automatically:
     - FirebaseBackend: real Firebase Realtime Database, syncs across any
       device, used once js/firebase-config.js has real values in it.
     - LocalBackend: localStorage + the native 'storage' event, syncs across
       browser tabs on the SAME computer only. Zero setup, used automatically
       whenever Firebase isn't configured yet — this is "Local Demo Mode".
   Both expose the exact same session-shaped API, so host.js/play.js never
   need to know which one is active. */

const QuizBackend = (function(){
  const LOCAL_PREFIX = 'qh_session_';
  const localSubs = {}; // pin -> Set of callbacks (same-tab notifications)

  /* ---------- LOCAL BACKEND (localStorage, same-machine demo mode) ---------- */
  const LocalBackend = {
    mode: 'local',
    _read(pin){
      try{
        const raw = localStorage.getItem(LOCAL_PREFIX + pin);
        return raw ? JSON.parse(raw) : null;
      } catch(e){ return null; }
    },
    _write(pin, obj){
      localStorage.setItem(LOCAL_PREFIX + pin, JSON.stringify(obj));
      this._notify(pin, obj);
    },
    _notify(pin, obj){
      (localSubs[pin] || new Set()).forEach(cb => cb(obj));
    },
    async createSession(pin, sessionObj){
      this._write(pin, sessionObj);
    },
    async updateSession(pin, partial){
      const cur = this._read(pin) || {};
      this._write(pin, Object.assign({}, cur, partial));
    },
    async setPlayer(pin, playerId, playerObj){
      const cur = this._read(pin) || {};
      cur.players = cur.players || {};
      cur.players[playerId] = playerObj;
      this._write(pin, cur);
    },
    async setAnswer(pin, qIndex, playerId, answerObj){
      const cur = this._read(pin) || {};
      cur.answers = cur.answers || {};
      cur.answers[qIndex] = cur.answers[qIndex] || {};
      cur.answers[qIndex][playerId] = answerObj;
      this._write(pin, cur);
    },
    async deleteSession(pin){
      localStorage.removeItem(LOCAL_PREFIX + pin);
      this._notify(pin, null);
    },
    async sessionExists(pin){
      return !!this._read(pin);
    },
    subscribeSession(pin, cb){
      localSubs[pin] = localSubs[pin] || new Set();
      localSubs[pin].add(cb);
      // Fire immediately with current value, like Firebase onValue does.
      cb(this._read(pin));
      const storageListener = (e) => {
        if(e.key === LOCAL_PREFIX + pin){
          cb(e.newValue ? JSON.parse(e.newValue) : null);
        }
      };
      window.addEventListener('storage', storageListener);
      return () => {
        localSubs[pin].delete(cb);
        window.removeEventListener('storage', storageListener);
      };
    },
    serverNow(){ return Date.now(); }
  };

  /* ---------- FIREBASE BACKEND (real cross-device live sync) ---------- */
  let fb = null; // { app, db, ref, set, update, onValue, off, remove, get }
  let fbReadyPromise = null;
  async function ensureFirebase(){
    if(fb) return fb;
    if(fbReadyPromise) return fbReadyPromise;
    fbReadyPromise = (async () => {
      const appMod = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js');
      const dbMod = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js');
      const app = appMod.initializeApp(FIREBASE_CONFIG);
      const db = dbMod.getDatabase(app);
      fb = { app, db, dbMod };
      return fb;
    })();
    return fbReadyPromise;
  }
  const FirebaseBackend = {
    mode: 'firebase',
    async createSession(pin, sessionObj){
      const { db, dbMod } = await ensureFirebase();
      await dbMod.set(dbMod.ref(db, 'sessions/' + pin), sessionObj);
    },
    async updateSession(pin, partial){
      const { db, dbMod } = await ensureFirebase();
      await dbMod.update(dbMod.ref(db, 'sessions/' + pin), partial);
    },
    async setPlayer(pin, playerId, playerObj){
      const { db, dbMod } = await ensureFirebase();
      await dbMod.set(dbMod.ref(db, 'sessions/' + pin + '/players/' + playerId), playerObj);
    },
    async setAnswer(pin, qIndex, playerId, answerObj){
      const { db, dbMod } = await ensureFirebase();
      await dbMod.set(dbMod.ref(db, 'sessions/' + pin + '/answers/' + qIndex + '/' + playerId), answerObj);
    },
    async deleteSession(pin){
      const { db, dbMod } = await ensureFirebase();
      await dbMod.remove(dbMod.ref(db, 'sessions/' + pin));
    },
    async sessionExists(pin){
      const { db, dbMod } = await ensureFirebase();
      const snap = await dbMod.get(dbMod.ref(db, 'sessions/' + pin));
      return snap.exists();
    },
    subscribeSession(pin, cb){
      let unsub = () => {};
      let cancelled = false;
      ensureFirebase().then(({ db, dbMod }) => {
        if(cancelled) return;
        const r = dbMod.ref(db, 'sessions/' + pin);
        const handler = (snap) => cb(snap.val());
        dbMod.onValue(r, handler);
        unsub = () => dbMod.off(r, 'value', handler);
      });
      return () => { cancelled = true; unsub(); };
    },
    serverNow(){ return Date.now(); } // good enough for classroom-scale scoring
  };

  const backend = (typeof isFirebaseConfigured === 'function' && isFirebaseConfigured()) ? FirebaseBackend : LocalBackend;

  function randomPin(){
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async function generateUniquePin(){
    for(let i = 0; i < 8; i++){
      const pin = randomPin();
      const exists = await backend.sessionExists(pin);
      if(!exists) return pin;
    }
    return randomPin() + Math.floor(Math.random()*9); // extremely unlikely fallback
  }

  return {
    mode: backend.mode,
    randomPin,
    generateUniquePin,
    createSession: backend.createSession.bind(backend),
    updateSession: backend.updateSession.bind(backend),
    setPlayer: backend.setPlayer.bind(backend),
    setAnswer: backend.setAnswer.bind(backend),
    deleteSession: backend.deleteSession.bind(backend),
    sessionExists: backend.sessionExists.bind(backend),
    subscribeSession: backend.subscribeSession.bind(backend),
    serverNow: backend.serverNow.bind(backend)
  };
})();

/* ===================== SCORING =====================
   Kahoot-style: correct answers score more points the faster they're
   submitted. Base 500 for any correct answer within the time limit, up to
   1000 for an instant answer. Wrong or no answer scores 0. */
function computeQuizPoints(correct, msElapsed, timeLimitMs){
  if(!correct) return 0;
  const remaining = Math.max(0, 1 - (msElapsed / timeLimitMs));
  return Math.round(500 + 500 * remaining);
}

function playerFullName(p){
  return p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : (p.name || 'Player');
}

function rankPlayers(playersObj){
  const list = Object.keys(playersObj || {}).map(id => Object.assign({id}, playersObj[id]));
  list.sort((a,b) => (b.score||0) - (a.score||0));
  return list;
}
