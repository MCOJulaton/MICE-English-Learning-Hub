/* Quiz Hub: make-up Long Quiz (individual, timed). Content and settings: ../makeup-data.js.
   Flow: rules and sign-in -> 5 parts, one at a time (no going back) -> submit -> receipt.
   The score is NOT shown to the student. Answers go to the same Google Sheet pipeline the unit pages use,
   one row for each part and one summary row (with the objective score and integrity notes for the teacher).
   Student-facing text: American English, simple wording, no dashes. */
(function () {
  'use strict';

  const Q = (typeof MAKEUP_QUIZ_W !== 'undefined') ? MAKEUP_QUIZ_W : MAKEUP_QUIZ; // the Wellness page loads its own data file
  const PAGE = (location.pathname.split('/').pop() || 'makeup.html');
  const EYEBROW = Q.eyebrow || 'ENGLISH FOR MICE · MAKE-UP';
  const GUIDE = Q.guide || 'guides/MICE-MakeUp-Quiz-Guide.pdf';
  const DATA_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxDECOuXf3HMxPVLT1fhfOHE5g-Gq1juG5enaCoUrShk9vEMfctgy-URKmqmvPGeoE/exec';
  const KEY = 'mkq_' + Q.id;
  const PENDING = 'mkq_pending';
  const PENDING_FS = 'mkq_pending_fs';
  const FS_URL = 'https://firestore.googleapis.com/v1/projects/mice-teacher-dashboard-5f9da/databases/(default)/documents/makeupResults';
  const FS_KEY = 'AIzaSyDpmwdnYvY9JguBE-Bi97l2J6DlEfo_lpU';
  const app = document.getElementById('app');
  const timerBox = document.getElementById('timer');
  const timerText = document.getElementById('timerText');
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  let SET = { open: false, minutes: Q.minutes, codeHash: '', code: Q.code, source: 'static' }; // filled by MakeupLive.load() (live settings from the Teacher Dashboard)

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const totalPoints = Q.parts.reduce((a, p) => a + p.points, 0);

  /* ---------- saved state (this browser only) ---------- */
  let S = null;
  function load() { try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
  load();

  /* ---------- helpers ---------- */
  async function sha(id, v) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(Q.salt + '|' + id + '|' + v));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
  }
  function rng(str) {
    let a = 0; for (let i = 0; i < str.length; i++) a = (Math.imul(a, 31) + str.charCodeAt(i)) >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shuffled(list, seedText) {
    const a = list.slice(), r = rng(seedText);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const pad = (n) => String(n).padStart(2, '0');
  const mins = () => (S && S.minutes) || SET.minutes;
  const deadline = () => S.startedAt + mins() * 60000;
  const left = () => Math.max(0, deadline() - Date.now());

  /* ---------- screens ---------- */
  function showClosed() {
    app.innerHTML = `<section class="mk-card"><div class="mk-eyebrow">${esc(EYEBROW)}</div>
      <h1>This quiz is not open</h1>
      <p class="mk-sub">${SET.source === 'static' && !isLocal ? 'We could not check if the quiz is open. Check your internet and reload this page. If it still says this, ask your teacher.' : 'This quiz is not open right now. Ask your teacher when it opens and for the access code.'}</p>
      <a class="mk-btn ghost" href="index.html">Back to the Quiz Hub</a>
      <p class="mk-resultlink">Already finished? <a href="${PAGE}#result">Check my result</a></p></section>`;
  }

  function showIntro(err) {
    const done = S && S.submitted;
    if (done) { showDone(); return; }
    app.innerHTML = `<section class="mk-card">
      <div class="mk-eyebrow">${esc(EYEBROW)}</div>
      <h1>${esc(Q.title || 'Long Quiz: Units 9 to 11')}</h1>
      <p class="mk-sub">${totalPoints} points · ${SET.minutes} minutes · ${Q.parts.length} parts</p>
      <ul class="mk-rules">
        <li>No AI. No translator. No notes.</li>
        <li>Type your own answers. You cannot paste.</li>
        <li>You have ${SET.minutes} minutes. The timer starts when you press Start. If the time ends, your answers are sent.</li>
        <li>Stay on the quiz page after you start. Your teacher can see your progress. Your teacher can also see when you leave the page.</li>
        <li>After you start, you cannot go back. When you press &ldquo;Next part&rdquo;, you cannot go back to the last part.</li>
        <li>You can do the quiz <b>one time only</b>.</li>
        <li>Use good internet. Charge your phone, laptop, or iPad. Make sure it has enough battery to finish the quiz.</li>
        <li>If the internet stops, stay on the page. Your answers are sent to your teacher when the internet comes back.</li>
      </ul>
      <div class="mk-guidebox"><b>Please open the guide for more help.</b> It has pictures and every step.<a class="mk-guidelink" href="${esc(GUIDE)}" target="_blank" rel="noopener">Open the guide (PDF)</a></div>
      <div class="mk-field"><label for="sid">Student ID</label><input id="sid" inputmode="numeric" autocomplete="off" maxlength="20"></div>
      <div class="mk-field"><label for="sname">Full name (first name and last name)</label><input id="sname" autocomplete="off" maxlength="80"></div>
      <div class="mk-field"><label for="scode">Access code from your teacher</label><input id="scode" autocomplete="off" autocapitalize="characters" maxlength="30"></div>
      <label class="mk-check"><input type="checkbox" id="honor"> <span>I promise to follow these rules. No AI, no translator, no notes. I will type my own answers.</span></label>
      ${err ? `<div class="mk-err" role="alert">${esc(err)}</div>` : ''}
      <button type="button" class="mk-btn" id="startBtn">START THE QUIZ</button>
      <p class="mk-resultlink">Already finished? <a href="${PAGE}#result">Check my result</a></p>
    </section>`;
    document.getElementById('startBtn').addEventListener('click', start);
  }

  async function start() {
    const sid = document.getElementById('sid').value.trim();
    const name = document.getElementById('sname').value.trim();
    const code = document.getElementById('scode').value.trim();
    if (!/^[A-Za-z0-9-]{5,20}$/.test(sid)) return showIntro('Write your student ID (5 or more letters or numbers).');
    if (name.split(/\s+/).length < 2) return showIntro('Write your first name and your last name.');
    if (!SET.open && !isLocal) return showClosed();
    if (!isLocal && !(await MakeupLive.checkCode(code, SET))) return showIntro('The access code is not correct. Ask your teacher.');
    if (!document.getElementById('honor').checked) return showIntro('Please tick the box to promise to follow the rules.');
    S = { sid, name, minutes: SET.minutes, startedAt: Date.now(), partIdx: 0, answers: {}, integrity: { leaves: 0, leaveSec: 0, paste: 0, keys: {}, partSec: {} }, partStart: Date.now(), submitted: false };
    save();
    renderPart();
  }

  /* ---------- the parts ---------- */
  const seed = () => S.sid + '|' + Q.id;
  function partItems(p) {
    if (p.type === 'mc' || p.type === 'tf') return shuffled(p.items, seed() + p.id);
    return p.items;
  }
  function ans(id) { return S.answers[id]; }

  function renderPart() {
    if (!S || S.submitted) return showDone();
    const p = Q.parts[S.partIdx];
    timerBox.hidden = false;
    const bar = Q.parts.map((x, i) => `<span class="${i < S.partIdx ? 'done' : i === S.partIdx ? 'now' : ''}"></span>`).join('');
    let body = '';
    if (p.type === 'mc') {
      body = partItems(p).map((it, n) => `<div class="mk-q"><p class="mk-qtext"><b>${n + 1}.</b> ${esc(it.q)}</p>
        <div class="mk-opts${p.stack ? '' : ' two'}" role="group" aria-label="Question ${n + 1}">${shuffled(it.options, seed() + it.id).map((o) => `<button type="button" class="mk-opt${ans(it.id) === o ? ' sel' : ''}" data-id="${it.id}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`).join('');
    } else if (p.type === 'tf') {
      body = partItems(p).map((it, n) => `<div class="mk-q"><p class="mk-qtext"><b>${n + 1}.</b> ${esc(it.q)}</p>
        <div class="mk-opts tf" role="group" aria-label="Sentence ${n + 1}">${['TRUE', 'FALSE'].map((o) => `<button type="button" class="mk-opt${ans(it.id) === o ? ' sel' : ''}" data-id="${it.id}" data-v="${o}">${o}</button>`).join('')}</div></div>`).join('');
    } else if (p.type === 'notes') {
      body = p.items.map((it) => { const a = ans(it.id) || {}; return `<div class="mk-q"><p class="mk-qtext"><b>${esc(it.title)}</b></p>
        <div class="mk-call">${esc(it.text)}</div>
        ${[['who', 'Who:'], ['what', 'What:'], ['contact', 'Contact Info:'], ['follow', 'Follow-up:']].map(([f, lab]) => `<div class="mk-field"><label for="${it.id}_${f}">${lab}</label><input id="${it.id}_${f}" data-note="${it.id}" data-f="${f}" value="${esc(a[f] || '')}" autocomplete="off" spellcheck="false"></div>`).join('')}</div>`; }).join('');
    } else if (p.type === 'order') {
      body = p.items.map((it) => { const seq = ans(it.id) || []; const pool = shuffled(it.parts, seed() + it.id).filter((t) => !seq.includes(t));
        return `<div class="mk-q" data-order="${it.id}"><p class="mk-qtext"><b>${esc(it.title)}</b></p>
          <div class="mk-seq" aria-label="Your sentence">${seq.length ? seq.map((t) => `<button type="button" class="mk-chip placed" data-oid="${it.id}" data-part="${esc(t)}" data-take="1">${esc(t)}</button>`).join('') : '<span class="ph">Tap the parts in order.</span>'}</div>
          <div class="mk-pool" aria-label="Parts">${pool.map((t) => `<button type="button" class="mk-chip" data-oid="${it.id}" data-part="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`; }).join('');
    } else if (p.type === 'writing') {
      body = p.items.map((it, n) => `<div class="mk-q"><p class="mk-qtext"><b>${n + 1}.</b> ${esc(it.text)}</p>${itemTable(it)}
        <div class="mk-field"><label for="${it.id}">Your answer (${esc(p.hint || '3 to 5 sentences')})</label><textarea id="${it.id}" data-write="${it.id}" spellcheck="false">${esc(ans(it.id) || '')}</textarea></div>
        <div class="mk-count" data-count="${it.id}"></div></div>`).join('');
    }
    const last = S.partIdx === Q.parts.length - 1;
    app.innerHTML = `<section class="mk-card">
      <div class="mk-progress" aria-hidden="true">${bar}</div>
      <div class="mk-points">PART ${S.partIdx + 1} OF ${Q.parts.length} · ${p.points} POINTS</div>
      <h2>${esc(p.title)}</h2><p class="mk-sub">${esc(p.direction)}</p>
      ${body}
      <div id="confirmBox"></div>
      <div class="mk-actions"><button type="button" class="mk-btn" id="nextBtn">${last ? 'FINISH AND SEND' : 'NEXT PART'}</button></div>
    </section>`;
    wirePart(p, last);
    window.scrollTo({ top: 0 });
  }

  function itemTable(it) {
    if (!it.table) return '';
    const head = it.tableHead ? `<thead><tr>${it.tableHead.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>` : '';
    return `<table class="mk-table">${head}<tbody>${it.table.map((r) => `<tr>${r.map((c, k) => (k === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table>`;
  }

  function wirePart(p, last) {
    app.querySelectorAll('.mk-opt').forEach((b) => b.addEventListener('click', () => {
      S.answers[b.dataset.id] = b.dataset.v; save();
      app.querySelectorAll(`.mk-opt[data-id="${b.dataset.id}"]`).forEach((x) => x.classList.toggle('sel', x === b));
    }));
    app.querySelectorAll('[data-note]').forEach((inp) => inp.addEventListener('input', () => {
      const a = S.answers[inp.dataset.note] || (S.answers[inp.dataset.note] = {}); a[inp.dataset.f] = inp.value; keyCount(inp.dataset.note); save();
    }));
    app.querySelectorAll('[data-write]').forEach((ta) => {
      const id = ta.dataset.write, cnt = app.querySelector(`[data-count="${id}"]`);
      const upd = () => { const w = (ta.value.trim().match(/\S+/g) || []).length; cnt.textContent = w + ' words'; };
      upd();
      ta.addEventListener('input', () => { S.answers[id] = ta.value; keyCount(id); upd(); save(); });
    });
    app.querySelectorAll('input[data-note], textarea').forEach((el) => {
      ['paste', 'drop'].forEach((ev) => el.addEventListener(ev, (e) => { e.preventDefault(); S.integrity.paste += 1; save(); toast('Pasting is not allowed. Please type your answer.'); }));
    });
    app.querySelectorAll('.mk-chip').forEach((c) => c.addEventListener('click', () => {
      const id = c.dataset.oid, t = c.dataset.part, seq = S.answers[id] || (S.answers[id] = []);
      if (c.dataset.take) S.answers[id] = seq.filter((x) => x !== t); else if (!seq.includes(t)) seq.push(t);
      save(); renderPart();
    }));
    document.getElementById('nextBtn').addEventListener('click', () => askConfirm(p, last));
  }
  function keyCount(id) { S.integrity.keys[id] = (S.integrity.keys[id] || 0) + 1; }

  function missing(p) {
    let n = 0;
    p.items.forEach((it) => {
      const a = S.answers[it.id];
      if (p.type === 'mc' || p.type === 'tf') { if (!a) n += 1; }
      else if (p.type === 'notes') { if (!a || !(a.who || '').trim() || !(a.what || '').trim() || !(a.contact || '').trim() || !(a.follow || '').trim()) n += 1; }
      else if (p.type === 'order') { if (!a || a.length < it.parts.length) n += 1; }
      else if (p.type === 'writing') { if (!a || !a.trim()) n += 1; }
    });
    return n;
  }
  function askConfirm(p, last) {
    const n = missing(p);
    document.getElementById('confirmBox').innerHTML = `<div class="mk-confirm">
      <p>${n ? `${n} question${n > 1 ? 's are' : ' is'} not finished. ` : ''}${last ? 'Send your quiz now? You cannot change your answers after this.' : 'Go to the next part? You cannot come back to this part.'}</p>
      <div class="mk-actions" style="margin-top:0"><button type="button" class="mk-btn ghost" id="noBtn">GO BACK</button><button type="button" class="mk-btn gold" id="yesBtn">${last ? 'YES, SEND' : 'YES, NEXT PART'}</button></div></div>`;
    document.getElementById('noBtn').addEventListener('click', () => { document.getElementById('confirmBox').innerHTML = ''; });
    document.getElementById('yesBtn').addEventListener('click', () => {
      S.integrity.partSec[p.id] = Math.round((Date.now() - S.partStart) / 1000); S.partStart = Date.now();
      if (last) { finish('finished'); return; }
      S.partIdx += 1; save(); renderPart();
    });
  }

  /* ---------- timer, leaving the page ---------- */
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (!S || S.submitted || !S.startedAt) return;
    if (document.hidden) { hiddenAt = Date.now(); }
    else if (hiddenAt) {
      S.integrity.leaves += 1; S.integrity.leaveSec += Math.round((Date.now() - hiddenAt) / 1000); hiddenAt = 0; save();
      toast('You left the quiz page. Your teacher can see this.');
    }
  });
  function toast(msg) {
    const old = document.querySelector('.mk-banner'); if (old) old.remove();
    const d = document.createElement('div'); d.className = 'mk-banner'; d.setAttribute('role', 'alert'); d.textContent = msg; document.body.appendChild(d);
    setTimeout(() => d.remove(), 4000);
  }
  setInterval(() => {
    if (!S || S.submitted || !S.startedAt) { timerBox.hidden = true; return; }
    const ms = left();
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    timerText.textContent = pad(m) + ':' + pad(s);
    timerBox.classList.toggle('warn', ms <= 5 * 60000);
    if (ms <= 0) finish('time');
  }, 1000);

  /* ---------- scoring (objective parts) and sending ---------- */
  async function score() {
    const out = { p1: 0, p2: 0, p4: 0, notes: [0, 0] };
    for (const p of Q.parts) {
      if (p.type === 'mc' || p.type === 'tf') {
        let n = 0;
        for (const it of p.items) { const a = S.answers[it.id]; if (a && (await sha(it.id, a)) === it.h) n += 1; }
        out[p.id] = n;
      } else if (p.type === 'order') {
        let pts = 0;
        for (const it of p.items) {
          const seq = S.answers[it.id] || []; let c = 0;
          for (let k = 0; k < it.hs.length; k++) if (seq[k] && (await sha(it.id + '#' + k, seq[k])) === it.hs[k]) c += 1;
          pts += c === it.hs.length ? 2 : c >= 2 ? 1 : 0;
        }
        out.p4 = pts;
      } else if (p.type === 'notes') {
        p.items.forEach((it, i) => {
          const a = S.answers[it.id] || {}, sg = it.suggest, who = (a.who || '').toLowerCase(), digits = String(a.contact || '').replace(/\D/g, '');
          const req = (a.what || '').toLowerCase(), time = (a.follow || '').toLowerCase();
          let pts = 0;
          if (sg.name.some((t) => who.includes(t)) && digits.includes(sg.digits)) pts += 1;
          if (sg.request.every((grp) => grp.some((t) => req.includes(t)))) pts += 1;
          if (sg.time.some((t) => time.includes(t))) pts += 1;
          out.notes[i] = pts;
        });
      }
    }
    return out;
  }

  const pending = () => { try { return JSON.parse(localStorage.getItem(PENDING) || '[]'); } catch (e) { return []; } };
  const setPending = (l) => { try { localStorage.setItem(PENDING, JSON.stringify(l)); } catch (e) { /* ignore */ } };
  function sendRecord(rec) {
    if (isLocal) { console.log('[preview only, not sent]', rec.activity, rec.score); return Promise.resolve(); } // never send test data to the real sheet
    return fetch(DATA_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(rec) });
  }
  async function flush() {
    const list = pending(); if (!list.length) return true;
    const rest = [];
    for (const r of list) { try { await sendRecord(r); } catch (e) { rest.push(r); } }
    setPending(rest);
    return rest.length === 0;
  }
  /* A second copy of every attempt goes to the Teacher Dashboard (Firestore makeupResults/{receipt}), so the teacher can
     read the answers and enter marks without opening the sheet. It is sent quietly: if it fails, it is retried and the
     student is not told. The Google Sheet copy above stays the backup. */
  const toFs = (v) => (typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : { stringValue: String(v) });
  const pendingFs = () => { try { return JSON.parse(localStorage.getItem(PENDING_FS) || '[]'); } catch (e) { return []; } };
  const setPendingFs = (l) => { try { localStorage.setItem(PENDING_FS, JSON.stringify(l)); } catch (e) { /* ignore */ } };
  async function sendResult(doc) {
    if (isLocal) return true;
    const fields = {}; Object.keys(doc).forEach((k) => { fields[k] = toFs(doc[k]); });
    try {
      const r = await fetch(FS_URL + '?documentId=' + encodeURIComponent(doc.receipt) + '&key=' + FS_KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) });
      return r.ok || r.status === 409; // 409 = this receipt is already saved
    } catch (e) { return false; }
  }
  async function flushFs() {
    const list = pendingFs(); if (!list.length) return;
    const rest = [];
    for (const d of list) { if (!(await sendResult(d))) rest.push(d); }
    setPendingFs(rest);
  }
  window.addEventListener('online', () => { flush(); flushFs(); });
  setInterval(flush, 20000);
  setInterval(flushFs, 30000);

  async function finish(why) {
    if (!S || S.submitted) return;
    S.submitted = true; S.finishedAt = Date.now(); S.why = why;
    const sc = await score();
    const objective = sc.p1 + sc.p2 + sc.p4;
    const notesSuggested = sc.notes[0] + sc.notes[1];
    S.receipt = (await sha('receipt', S.sid + '|' + S.finishedAt)).slice(0, 8).toUpperCase();
    S.scoreInfo = { p1: sc.p1, p2: sc.p2, p4: sc.p4, notesSuggested };
    save();
    const base = { studentId: S.sid, studentName: S.name, course: Q.course, unit: Q.unit, date: new Date().toISOString().slice(0, 10), timestamp: new Date().toISOString() };
    const rec = (activity, score, answers) => Object.assign({}, base, { activity, score, completionStatus: why === 'time' ? 'time-up' : 'completed', answers });
    const names = Q.sheetNames || {};
    const dflt = { p1: 'makeup-p1-vocabulary', p2: 'makeup-p2-true-false', p3: 'makeup-p3-notes (suggested, teacher confirms)', p4: 'makeup-p4-sentence-order', p5: 'makeup-p5-writing (teacher marks)', summary: 'makeup-summary' };
    const partScore = (p) => (p.type === 'mc' || p.type === 'tf' ? sc[p.id] : p.type === 'order' ? sc.p4 : p.type === 'notes' ? notesSuggested : null);
    const records = Q.parts.map((p) => rec(names[p.id] || dflt[p.id], partScore(p), JSON.stringify(pickAnswers(p.id))));
    records.push(rec(names.summary || dflt.summary, objective, JSON.stringify({ form: Q.form, receipt: S.receipt, objectiveOf26: objective, notesSuggestedOf6: notesSuggested, writingPending: true, integrity: S.integrity, minutesUsed: Math.round((S.finishedAt - S.startedAt) / 60000), ended: why })));
    setPending(pending().concat(records));
    const result = { studentId: S.sid, name: S.name, receipt: S.receipt, form: Q.form, finishedAt: S.finishedAt, why: why || 'done', p1: sc.p1, p2: sc.p2, p4: sc.p4, notesSuggested, objective,
      minutes: Math.round((S.finishedAt - S.startedAt) / 60000), leaves: S.integrity.leaves || 0, leaveSec: S.integrity.leaveSec || 0, paste: S.integrity.paste || 0,
      answers: JSON.stringify(Object.fromEntries(Q.parts.map((p) => [p.id, pickAnswers(p.id)]))) };
    if (!(await sendResult(result))) setPendingFs(pendingFs().concat([result]));
    await flush();
    showDone();
  }
  function pickAnswers(partId) {
    const p = Q.parts.find((x) => x.id === partId), o = {};
    p.items.forEach((it) => { if (S.answers[it.id] !== undefined) o[it.id] = S.answers[it.id]; });
    return o;
  }

  function backupText() {
    const lines = [`${Q.unit}`, `Student ID: ${S.sid}`, `Name: ${S.name}`, `Receipt: ${S.receipt}`, `Finished: ${new Date(S.finishedAt).toLocaleString()}`, ''];
    Q.parts.forEach((p) => {
      lines.push(p.title);
      p.items.forEach((it, n) => { const a = S.answers[it.id]; lines.push(`${n + 1}. ${typeof a === 'object' ? JSON.stringify(a) : (a === undefined ? '(no answer)' : a)}`); });
      lines.push('');
    });
    return lines.join('\n');
  }
  function showDone() {
    timerBox.hidden = true;
    app.innerHTML = `<section class="mk-card">
      <div class="mk-eyebrow">${esc(EYEBROW)}</div>
      <h1>${S.why === 'time' ? 'Time is up. Your quiz was sent.' : 'Your quiz was sent.'}</h1>
      <p class="mk-sub">Thank you. Your teacher will mark it. You will see your result when it is ready.</p>
      <p>Your receipt code:</p>
      <div class="mk-receipt">${esc(S.receipt || '')}</div>
      <p>Take a screenshot of this page. If your teacher cannot find your answers, show this receipt.</p>
      <div class="mk-actions" style="justify-content:flex-start"><button type="button" class="mk-btn ghost" id="dl">SAVE A COPY OF MY ANSWERS</button><a class="mk-btn" href="index.html">BACK TO THE QUIZ HUB</a></div>
      ${pending().length ? '<div class="mk-note">Your answers are waiting to be sent. Stay on a good internet connection and keep this page open.</div>' : ''}
      <div class="mk-note">After your teacher marks your quiz, come back to this page and press <a href="${PAGE}#result">Check my result</a>. You need your receipt code.</div>
    </section>`;
    document.getElementById('dl').addEventListener('click', () => {
      const blob = new Blob([backupText()], { type: 'text/plain' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `makeup-quiz-${S.sid}.txt`; a.click(); URL.revokeObjectURL(a.href);
    });
  }


  /* ---------- check my result (after the teacher releases it) ---------- */
  const REL_URL = 'https://firestore.googleapis.com/v1/projects/mice-teacher-dashboard-5f9da/databases/(default)/documents/makeupReleased/';
  const val = (f) => (!f ? '' : f.stringValue !== undefined ? f.stringValue : f.integerValue !== undefined ? Number(f.integerValue) : f.doubleValue !== undefined ? f.doubleValue : '');
  const nz = (n) => (n === '' || n == null ? 0 : n);
  function showResultChecker(msg, sidPrefill, rcPrefill) {
    timerBox.hidden = true;
    app.innerHTML = `<section class="mk-card">
      <div class="mk-eyebrow">${esc(EYEBROW)}</div>
      <h1>Check my result</h1>
      <p class="mk-sub">Your teacher must mark your quiz first. Type your Student ID and your receipt code.</p>
      <div class="mk-field"><label for="rsid">Student ID</label><input id="rsid" type="text" autocomplete="off" value="${esc(sidPrefill || (S && S.sid) || '')}"></div>
      <div class="mk-field"><label for="rrc">Receipt code (8 letters and numbers)</label><input id="rrc" type="text" autocomplete="off" maxlength="8" value="${esc(rcPrefill || (S && S.receipt) || '')}"></div>
      ${msg ? `<div class="${msg.ok ? 'mk-note' : 'mk-err'}" role="alert">${esc(msg.text)}</div>` : ''}
      <div class="mk-actions" style="justify-content:flex-start"><button type="button" class="mk-btn" id="rgo">SHOW MY RESULT</button><a class="mk-btn ghost" href="${PAGE}">BACK</a></div>
    </section>`;
    document.getElementById('rgo').addEventListener('click', fetchResult);
  }
  async function fetchResult() {
    const sid = document.getElementById('rsid').value.trim(), rc = document.getElementById('rrc').value.trim().toUpperCase();
    if (!sid || !/^[0-9A-F]{8}$/.test(rc)) return showResultChecker({ ok: false, text: 'Check your Student ID and your receipt code. The receipt code has 8 letters and numbers.' }, sid, rc);
    let r;
    try { r = await fetch(REL_URL + rc + '?key=AIzaSyDpmwdnYvY9JguBE-Bi97l2J6DlEfo_lpU', { cache: 'no-store' }); }
    catch (e) { return showResultChecker({ ok: false, text: 'No internet. Try again.' }, sid, rc); }
    if (r.status === 404) return showResultChecker({ ok: true, text: 'Your result is not ready yet. Your teacher is still marking. Try again later.' }, sid, rc);
    if (!r.ok) return showResultChecker({ ok: false, text: 'We cannot show results right now. Try again later or tell your teacher.' }, sid, rc);
    const d = (await r.json()).fields || {};
    if (val(d.form) && val(d.form) !== Q.form) return showResultChecker({ ok: false, text: 'This receipt code is for the other make-up quiz. Go to the other quiz page to check it.' }, sid, rc);
    if (String(val(d.studentId)).toLowerCase() !== sid.toLowerCase()) return showResultChecker({ ok: false, text: 'The Student ID does not match this receipt code.' }, sid, rc);
    showResult(d);
  }
  function showResult(d) {
    const parse = (f) => { try { return JSON.parse(val(f) || '{}'); } catch (e) { return {}; } };
    const rv = parse(d.review), model = parse(d.model), stk = parse(d.stickers);
    const STAR = '<svg class="mk-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
    const sticker = (on) => (on ? `<span class="mk-sticker">${STAR}Very good!</span>` : '');
    const row = (label, v, max, k) => `<div class="mk-sc"><span>${label} ${sticker(stk[k])}</span><b>${nz(v)} / ${max}</b></div>`;
    const mcList = (items) => items.map((it, n) => `<div class="mk-rq ${it.ok ? 'ok' : 'no'}"><p class="mk-qtext"><b>${n + 1}.</b> ${esc(it.q)}</p>
      <p>Your answer: <b>${esc(it.you || '(no answer)')}</b> ${it.ok ? '&#10003;' : '&#10007;'}</p>${it.ok ? '' : `<p>Correct answer: <b>${esc(it.correct)}</b></p>`}</div>`).join('');
    const orderList = (items) => items.map((it) => `<div class="mk-rq ${it.pts === 2 ? 'ok' : 'no'}"><p class="mk-qtext"><b>${esc(it.title)}</b></p>
      <p>Your sentence: <b>${esc(it.you || '(no answer)')}</b></p><p>Correct sentence: <b>${esc(it.correct)}</b></p><p>Points: ${it.pts} of 2</p></div>`).join('');
    const notes = ((rv[(Q.parts.find((x) => x.type === 'notes') || {}).id] || [])).map((it) => `<div class="mk-rq"><p class="mk-qtext"><b>${esc(it.title)}</b></p><div class="mk-call">${esc(it.text)}</div>
      <p>Your notes:</p><p class="mk-yours">Who: ${esc(it.who || '(empty)')}<br>What: ${esc(it.what || it.req || '(empty)')}<br>Contact Info: ${esc(it.contact || '(empty)')}<br>Follow-up: ${esc(it.follow || it.time || '(empty)')}</p></div>`).join('');
    const writingList = (arr, p) => arr.map((it, n) => `<div class="mk-rq">${p && p.id !== 'p3' ? sticker(stk['w' + (n + 1)]) : ''}<p class="mk-qtext"><b>${n + 1}.</b> ${esc(it.q)}</p>${p && p.items[n] ? itemTable(p.items[n]) : ''}<p>Your answer:</p><p class="mk-yours">${esc(it.you || '(no answer)')}</p></div>`).join('');
    const modelBox = (t, title) => (t ? `<div class="mk-model"><b>${title}</b><p>${esc(t).replace(/\n/g, '<br>')}</p></div>` : '');
    const scoreRows = Q.scoreRows || [{ k: 'p1', label: 'Part 1 Vocabulary', max: 10 }, { k: 'p2', label: 'Part 2 True or False', max: 10 }, { k: 'p3', label: 'Part 3 Taking Notes', max: 6 },
      { k: 'p4', label: 'Part 4 Sentence Order', max: 6 }, { k: 'w1', label: 'Part 5 Writing 1', max: 4 }, { k: 'w2', label: 'Part 5 Writing 2', max: 4 }];
    const partReview = (p) => {
      const items = rv[p.id] || [];
      if (p.type === 'mc' || p.type === 'tf') return mcList(items);
      if (p.type === 'order') return orderList(items);
      const top = p.id === 'p3' && stk.p3 ? `<div class="mk-stickerrow">${sticker(true)}</div>` : '';
      if (p.type === 'notes') return top + notes + modelBox(model[p.id], 'Model notes');
      return top + writingList(items, p) + modelBox(model[p.id], 'Model answers');
    };
    const comment = val(d.comment);
    app.innerHTML = `<section class="mk-card">
      <div class="mk-eyebrow">${esc(EYEBROW)}</div>
      <h1>Your result</h1>
      <p class="mk-sub">${esc(val(d.name))} · Student ID ${esc(val(d.studentId))}</p>
      <div class="mk-total"><b>${nz(val(d.total))}</b> <span>out of ${totalPoints} points</span></div>
      ${scoreRows.some((r) => stk[r.k]) ? `<div class="mk-stickers"><b>Your teacher gave you a sticker for:</b> ${scoreRows.filter((r) => stk[r.k]).map((r) => `<span class="mk-sticker">${STAR}${esc(r.label)}</span>`).join('')}</div>` : ''}
      ${comment ? `<div class="mk-note"><b>Your teacher says:</b> ${esc(comment)}</div>` : ''}
      <div class="mk-scores">${scoreRows.map((r) => row(r.label, val(d[r.k]), r.max, r.k)).join('')}</div>
      ${Q.parts.map((p) => `<details class="mk-det"><summary>${esc(p.title)}</summary>${partReview(p)}</details>`).join('')}
      <div class="mk-actions" style="justify-content:flex-start"><button type="button" class="mk-btn ghost" id="prn">SAVE OR PRINT</button><a class="mk-btn" href="index.html">BACK TO THE QUIZ HUB</a></div>
    </section>`;
    document.getElementById('prn').addEventListener('click', () => { document.querySelectorAll('.mk-det').forEach((x) => { x.open = true; }); window.print(); });
  }
  window.addEventListener('hashchange', () => location.reload());

  /* ---------- start ---------- */
  (async function init() {
    if (location.hash === '#result') { showResultChecker(); return; }
    SET = await MakeupLive.load();
    flushFs();
    if (S && S.submitted) { showDone(); }
    else if (S && S.startedAt && left() <= 0) { finish('time'); }
    else if (S && S.startedAt) { renderPart(); }          // a student already in the quiz can always continue
    else if (!(SET.open || isLocal)) { showClosed(); }
    else { showIntro(); }
  })();

  /* test hook for the teacher on localhost only */
  if (isLocal) window.__mkq = { reset() { localStorage.removeItem(KEY); localStorage.removeItem(PENDING); location.reload(); } };
})();
