/* Business Communication: shared lesson engine for all 15 units (A1 workplace English).
   A unit page loads js/data.js (which defines UNIT) and then this file. The engine draws the steps,
   plays the computer voice, checks the answers on the page, and keeps progress (which steps are done)
   on this device only, in localStorage. Nothing is sent anywhere.
   The class produces the output (a role-play, a call, an email, a presentation). The page prepares students for it.

   Step types (set `type` in data.js):
     learn     key ideas, tap-through models (with audio for dialogues), language box, optional table
     ladder    phrases to say out loud in 4 rounds: see it, fill the gaps, keywords only, no paper
     choose    questions with one answer each; an item can have `say` (the computer voice reads it)
     dictate   listen, then type what you hear (one answer, or a form with several fields)
     pick      tap all the lines that match, then Check
     order     tap the lines in the right order
     plan      build a planner or message from choices
     yourturn  the output in class: task, role cards, phrase card, checklist, self-study
   Every step can have: id, title, sub, bloom (shown as a "Thinking" chip), does (one line for the cover).
   The first step (cover) and the exit check are added automatically.
   Student-facing text: American English, A1 wording, no dashes. */
(function () {
  'use strict';

  const U = UNIT; // defined by the unit's js/data.js
  const STORE_KEY = 'bc-unit' + U.number + '-v1';
  const PAGES = {};

  const app = document.getElementById('app');
  const dots = document.getElementById('progressWrap');
  const brandSub = document.getElementById('brandSub');
  const btnBack = document.getElementById('btnBack');
  const btnNext = document.getElementById('btnNext');

  const sub = (s) => String(s).replace(/\{([a-z0-9]+)\}/g, (m, k) => (k in PAGES ? PAGES[k] : m));
  const esc = (s) => sub(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

  /* ---------- computer voice (the browser's own text-to-speech, American English) ---------- */
  const TTS = 'speechSynthesis' in window;
  let voice = null;
  function pickVoice() {
    if (!TTS) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find((v) => /^en[-_]US/i.test(v.lang) && /samantha|google us|allison|ava|joelle|zoe|aaron|nicky/i.test(v.name))
      || vs.find((v) => /^en[-_]US/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
  }
  if (TTS) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text, o) {
    if (!TTS) return;
    o = o || {};
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'en-US'; if (voice) u.voice = voice;
    u.rate = o.rate || 0.9; u.pitch = o.pitch || 1;
    if (o.onend) u.onend = o.onend;
    speechSynthesis.speak(u);
  }
  /* Listen buttons: one click handler for the whole page (buttons carry data-say). */
  const listenRow = (text, extra) => !TTS ? '' : `<div class="listen-row">
      <button type="button" class="btn ghost" data-say="${esc(text)}">Listen</button>
      <button type="button" class="btn ghost" data-say="${esc(text)}" data-slow="1">Listen slowly</button>${extra || ''}</div>`;
  app.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-say]'); if (!b) return;
    speak(b.dataset.say, { rate: b.hasAttribute('data-slow') ? 0.65 : 0.9 });
  });
  const noVoiceNote = () => (TTS ? '' : '<p class="note">This device cannot play the computer voice. Ask your teacher to play the sound in class.</p>');

  /* ---------- saved progress ---------- */
  let state = { step: 0, done: {}, exit: null };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved && typeof saved.step === 'number' && saved.done) state = Object.assign(state, saved);
  } catch (e) { /* private mode or blocked storage: work without saving */ }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }
  function markDone(id) { if (state.done[id]) return; state.done[id] = true; save(); paintChrome(); }

  /* ---------- helpers ---------- */
  function say(box, kind, html) { box.className = 'say ' + kind; box.innerHTML = html; }
  const pill = (kind, text) => `<span class="pill ${kind || 'k1'}">${esc(text)}</span>`;
  const think = (s) => (s.bloom ? `<span class="think">Thinking: ${esc(s.bloom)}</span>` : '');
  /* Same intro block every hub unit uses: eyebrow, title, one italic line. */
  const intro = (s, n, total) => `<div class="section-head">
      <div class="section-eyebrow">STEP ${n} OF ${total}</div>
      <h1 class="section-title">${esc(s.title)}</h1>
      ${s.sub ? `<p class="section-sub">${esc(s.sub)}</p>` : ''}
      ${think(s)}
    </div>`;

  /* Optional photos at the top of a step: photo:{file,alt,caption} or photos:[...]. Files are in assets/images/. */
  const photoHtml = (s) => {
    const list = s.photos || (s.photo ? [s.photo] : []);
    if (!list.length) return '';
    return `<div class="photos${list.length > 1 ? ' two' : ''}">${list.map((p) => `<figure class="photo">
      <img src="../../../assets/images/${p.file}" alt="${esc(p.alt)}" loading="lazy">
      ${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`;
  };

  /* Same shuffle every time, so a question does not change when the student comes back to it. */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffled(list, seed) {
    const a = list.slice(); const r = rng(seed);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* ---------- tap-through model (learn step) ---------- */
  function renderModel(m, k) {
    return `<div class="model" data-model="${k}">
      <h3 class="model-title">${esc(m.title)}</h3>
      <p class="hint">${esc(m.hint || 'Tap each line. See its job.')}</p>
      <p class="model-text">${m.sentences.map((s, i) =>
        `<button type="button" class="sent" data-i="${i}" aria-pressed="false">${esc(s.text)}<span class="sent-tag" hidden></span></button>`).join(' ')}</p>
      ${m.audio && TTS ? `<div class="listen-row"><button type="button" class="btn ghost" data-play-all>Listen to the whole dialogue</button></div>` : ''}
      <div class="say info" role="status" aria-live="polite">Tap a line to hear it and see what it does.</div>
      <p class="meter" data-meter>Seen 0 of ${m.sentences.length}</p>
      ${m.after ? `<p class="after" hidden>${esc(m.after)}</p>` : ''}
    </div>`;
  }
  function wireModel(root, m, onAll) {
    const box = root.querySelector('.say');
    const meter = root.querySelector('[data-meter]');
    const after = root.querySelector('.after');
    const seen = new Set();
    const all = root.querySelector('[data-play-all]');
    if (all) all.addEventListener('click', () => {
      let i = 0;
      const next = () => { if (i >= m.sentences.length) return; const t = m.sentences[i++]; speak(t.say || t.text, { onend: () => setTimeout(next, 350) }); };
      next();
    });
    root.querySelectorAll('.sent').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i, s = m.sentences[i], kind = s.kind || 'k2';
        if (m.audio) speak(s.say || s.text);
        seen.add(i);
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('seen', 'role-' + kind);
        const tag = btn.querySelector('.sent-tag'); tag.hidden = false; tag.textContent = sub(s.tag || '');
        root.querySelectorAll('.sent').forEach((b) => b.classList.remove('current'));
        btn.classList.add('current');
        say(box, 'info', `${s.tag ? pill(kind, s.tag) : ''} <span>${esc(s.note || '')}</span>`);
        meter.textContent = `Seen ${seen.size} of ${m.sentences.length}`;
        if (seen.size === m.sentences.length) { if (after) after.hidden = false; meter.classList.add('ok'); if (onAll) onAll(); }
      });
    });
  }

  /* ---------- step type: learn ---------- */
  const learn = {
    render(s) {
      const langBox = s.lang ? `<section class="card"><h2>${esc(s.lang.title)}</h2>${s.lang.rows
        ? `<ul class="lang-rows">${s.lang.rows.map((r) => `<li><b>${esc(r[0])}</b><span>${esc(r[1])}</span></li>`).join('')}</ul>`
        : `<ul class="frames">${s.lang.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`}</section>` : '';
      const table = s.table ? `<section class="card"><h2>${esc(s.table.title)}</h2>
          <table class="table2"><tbody>${s.table.rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>
          ${s.table.note ? `<p class="hint" style="margin-top:10px">${esc(s.table.note)}</p>` : ''}</section>` : '';
      return `<section class="card"><h2>${esc(s.pointsTitle || 'Remember')}</h2>
          <ul class="learn">${s.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        </section>
        ${(s.models || []).map((m, k) => `<section class="card">${renderModel(m, k)}</section>`).join('')}
        ${table}${langBox}`;
    },
    wire(root, s) {
      const models = s.models || [];
      if (!models.length) { markDone(s.id); return; }
      let left = models.length;
      models.forEach((m, k) => wireModel(root.querySelector(`[data-model="${k}"]`), m, () => { left -= 1; if (!left) markDone(s.id); }));
    }
  };

  /* ---------- step type: choose ---------- */
  /* Normalizes questions: shared options (strings or {v,label}) or options per question.
     `answer` is the right option text (or its index). Per-question options are shuffled, shared ones keep their order. */
  function prepChoose(s, stepIndex) {
    if (s._items) return s._items;
    const shared = s.options ? s.options.map((o) => (typeof o === 'string' ? { v: o, label: o } : o)) : null;
    s._items = s.items.map((it, n) => {
      let opts, ans;
      if (shared) {
        opts = shared; ans = shared.findIndex((o) => o.v === it.answer);
      } else {
        const base = it.options.map((t, i) => ({ label: t, ok: (typeof it.answer === 'number' ? i === it.answer : t === it.answer) }));
        opts = it.noShuffle ? base : shuffled(base, 7919 * (stepIndex + 1) + 31 * (n + 1));
        ans = opts.findIndex((o) => o.ok);
      }
      if (ans < 0) throw new Error('No right answer in step "' + s.id + '", question ' + (n + 1));
      return { q: it.q, say: it.say, lead: it.lead, opts, ans, why: it.why || '', hint: it.hint || s.hint || 'Not this one. Read it again and try again.' };
    });
    return s._items;
  }
  const choose = {
    render(s, i) {
      const items = prepChoose(s, i);
      return `<section class="card">
        ${s.prompt ? `<p class="hint">${esc(s.prompt)}</p>` : ''}
        ${items.map((it, n) => {
          const long = it.opts.some((o) => o.label.length > 22);
          return `<div class="q" data-q="${n}">
            ${it.lead ? `<p class="lead">${esc(it.lead)}</p>` : ''}
            ${it.say ? listenRow(it.say) : ''}
            ${it.q ? `<p class="q-text"><b>${n + 1}.</b> ${esc(it.q)}</p>` : `<p class="q-text"><b>${n + 1}.</b></p>`}
            <div class="${long ? 'stack' : 'choices'}" role="group" aria-label="Question ${n + 1}">
              ${it.opts.map((o, k) => `<button type="button" class="${long ? 'option' : 'choice'}" data-k="${k}">${esc(o.label)}</button>`).join('')}
            </div>
            <div class="say" role="status" aria-live="polite"></div>
          </div>`;
        }).join('')}
        <p class="meter" data-meter>Correct 0 of ${items.length}</p>
      </section>`;
    },
    wire(root, s, i) {
      const items = prepChoose(s, i);
      let right = 0;
      const meter = root.querySelector('[data-meter]');
      root.querySelectorAll('.q').forEach((q) => {
        const it = items[+q.dataset.q];
        const box = q.querySelector('.say');
        q.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
          if (q.classList.contains('solved')) return;
          if (+b.dataset.k === it.ans) {
            q.classList.add('solved'); b.classList.add('right');
            q.querySelectorAll('[data-k]').forEach((x) => { x.disabled = true; });
            say(box, 'good', `<b>Yes.</b> <span>${esc(it.why)}</span>`);
            right += 1; meter.textContent = `Correct ${right} of ${items.length}`;
            if (right === items.length) { meter.classList.add('ok'); markDone(s.id); }
          } else {
            b.classList.add('wrong'); b.disabled = true;
            say(box, 'bad', esc(it.hint));
          }
        }));
      });
    }
  };

  /* ---------- step type: pick ---------- */
  const pick = {
    sets(s) { return s.sets || [{ lead: s.lead, items: s.items }]; },
    render(s) {
      const sets = pick.sets(s), tiles = s.layout === 'tiles', flag = s.flag || 'does not belong';
      return `<section class="card">
        ${s.prompt ? `<p class="hint">${esc(s.prompt)}</p>` : ''}
        ${sets.map((set, n) => `<div class="set" data-set="${n}">
          ${set.lead ? `<p class="lead">${esc(set.lead)}</p>` : ''}
          <div class="${tiles ? 'tiles' : 'stack'}">
            ${set.items.map((it, k) => `<button type="button" class="${tiles ? 'tile' : 'sent-row'}" data-k="${k}" data-flag="${esc(flag)}" aria-pressed="false">${esc(it.t)}</button>`).join('')}
          </div>
          <button type="button" class="btn" data-check>Check</button>
          <div class="say" role="status" aria-live="polite"></div>
        </div>`).join('')}
      </section>`;
    },
    wire(root, s) {
      const sets = pick.sets(s), tiles = s.layout === 'tiles';
      let solved = 0;
      root.querySelectorAll('.set').forEach((el) => {
        const set = sets[+el.dataset.set], box = el.querySelector('.say');
        const rows = [...el.querySelectorAll('[data-k]')];
        rows.forEach((r) => r.addEventListener('click', () => {
          if (el.classList.contains('solved')) return;
          const on = r.getAttribute('aria-pressed') !== 'true';
          r.setAttribute('aria-pressed', String(on)); r.classList.toggle('flag', on);
        }));
        el.querySelector('[data-check]').addEventListener('click', () => {
          if (el.classList.contains('solved')) return;
          let wrongPicks = 0, missed = 0;
          rows.forEach((r, k) => {
            const flagged = r.getAttribute('aria-pressed') === 'true', target = !!set.items[k].on;
            r.classList.remove('is-bad');
            if (flagged && !target) { wrongPicks += 1; if (!tiles) r.classList.add('is-bad'); }
            if (!flagged && target) missed += 1;
          });
          if (!wrongPicks && !missed) {
            el.classList.add('solved');
            rows.forEach((r, k) => { r.disabled = true; if (!tiles) r.classList.add(set.items[k].on ? 'is-ok' : 'is-off'); });
            say(box, 'good', `<b>Yes.</b> <span>${esc(set.why || s.why || '')}</span>`);
            solved += 1; if (solved === sets.length) markDone(s.id);
          } else {
            const parts = [];
            if (wrongPicks) parts.push(`${plural(wrongPicks, 'line')} you tapped ${wrongPicks === 1 ? 'is' : 'are'} not right${tiles ? '' : ' (red)'}`);
            if (missed) parts.push(`you missed ${missed}`);
            say(box, 'bad', `Almost. ${esc(parts.join(', and '))}. ${esc(set.hint || s.hint || 'Look again.')}`);
          }
        });
      });
    }
  };

  /* ---------- step type: order ---------- */
  const order = {
    sets(s) { return s.sets || [{ lead: s.lead, items: s.items }]; },
    render(s) {
      return `<section class="card">
        ${s.prompt ? `<p class="hint">${esc(s.prompt)}</p>` : ''}
        ${order.sets(s).map((set, n) => `<div class="set" data-set="${n}">
          ${set.lead ? `<p class="lead">${esc(set.lead)}</p>` : ''}
          <p class="hint">Your order</p>
          <div class="order-line" data-line></div>
          <p class="hint">Tap a line to add it</p>
          <div class="order-pool" data-pool></div>
          <div data-actions></div>
          <div class="say" role="status" aria-live="polite"></div>
        </div>`).join('')}
      </section>`;
    },
    wire(root, s, stepIndex) {
      const sets = order.sets(s); let solved = 0;
      root.querySelectorAll('.set').forEach((el) => {
        const n = +el.dataset.set, set = sets[n], count = set.items.length;
        const line = el.querySelector('[data-line]'), pool = el.querySelector('[data-pool]');
        const actions = el.querySelector('[data-actions]'), box = el.querySelector('.say');
        /* the scrambled order: never the right order */
        let seed = 104729 * (stepIndex + 1) + 13 * (n + 1), perm;
        do { perm = shuffled(set.items.map((_, k) => k), seed++); } while (perm.every((v, k) => v === k) && count > 1);
        let placed = [], done = false;
        function paint(marks) {
          line.innerHTML = placed.length ? placed.map((idx, pos) =>
            `<button type="button" class="placed${marks ? (marks[pos] ? ' right' : ' wrong') : ''}" data-pos="${pos}"${done ? ' disabled' : ''}><span class="n">${pos + 1}</span><span>${esc(set.items[idx])}</span></button>`).join('')
            : '<p class="order-empty">Nothing yet.</p>';
          pool.innerHTML = perm.filter((idx) => !placed.includes(idx)).map((idx) =>
            `<button type="button" class="sent-row" data-idx="${idx}"${done ? ' disabled' : ''}>${esc(set.items[idx])}</button>`).join('');
          pool.querySelectorAll('[data-idx]').forEach((b) => b.addEventListener('click', () => {
            if (done) return; placed.push(+b.dataset.idx); box.className = 'say'; box.innerHTML = '';
            if (placed.length === count) check(); else paint();
          }));
          line.querySelectorAll('[data-pos]').forEach((b) => b.addEventListener('click', () => {
            if (done) return; placed = placed.slice(0, +b.dataset.pos); box.className = 'say'; box.innerHTML = ''; actions.innerHTML = ''; paint();
          }));
        }
        function check() {
          const marks = placed.map((idx, pos) => idx === pos);
          paint(marks);
          if (marks.every(Boolean)) {
            done = true; paint(marks);
            say(box, 'good', `<b>Yes.</b> <span>${esc(set.why || s.why || 'This is the right order.')}</span>`);
            solved += 1; if (solved === sets.length) markDone(s.id);
          } else {
            say(box, 'bad', `Almost. The red lines are not in the right place. ${esc(set.hint || s.hint || 'Think about what happens first.')}`);
            actions.innerHTML = '<button type="button" class="btn ghost" data-again>Try again</button>';
            actions.querySelector('[data-again]').addEventListener('click', () => { placed = []; actions.innerHTML = ''; box.className = 'say'; box.innerHTML = ''; paint(); });
          }
        }
        paint();
      });
    }
  };

  /* ---------- step type: ladder ---------- */
  /* phrases: [{ text, say?, frame, keys, cue }]. Four rounds for each phrase. The student says it aloud and taps "I said it". */
  const ROUNDS = [
    ['Round 1 of 4: see it, hear it, say it', 'text'],
    ['Round 2 of 4: fill the gaps', 'frame'],
    ['Round 3 of 4: keywords only', 'keys'],
    ['Round 4 of 4: no paper. Say it from this idea.', 'cue']
  ];
  const ladder = {
    render(s) {
      return `<section class="card">
        <p class="hint">${esc(s.prompt || 'Say each phrase out loud. Each phrase has 4 rounds. You see less and less. Do not read from paper in round 4.')}</p>
        ${noVoiceNote()}<div data-ladder></div></section>`;
    },
    wire(root, s) {
      const host = root.querySelector('[data-ladder]'); let p = 0, r = 0, shownModel = false;
      function paint() {
        if (p >= s.phrases.length) {
          host.innerHTML = '<div class="say good"><b>Well done.</b> You said every phrase with no paper.</div>'; markDone(s.id); return;
        }
        const ph = s.phrases[p], [label, key] = ROUNDS[r];
        const shown = ph[key] || ph.text;
        host.innerHTML = `<p class="meter" style="margin-top:0">Phrase ${p + 1} of ${s.phrases.length}</p>
          <p class="ladder-round">${esc(label)}</p>
          <p class="ladder-phrase${key === 'cue' ? ' cue' : ''}">${esc(shown)}</p>
          ${listenRow(ph.say || ph.text)}
          ${shownModel ? `<div class="say info"><b>The model:</b> <span>${esc(ph.text)}</span></div><button type="button" class="btn" data-next>${p === s.phrases.length - 1 ? 'Finish' : 'Next phrase'}</button>`
            : `<button type="button" class="btn" data-said>I said it</button>`}`;
        const said = host.querySelector('[data-said]'), next = host.querySelector('[data-next]');
        if (said) said.addEventListener('click', () => { if (r < 3) { r += 1; } else { shownModel = true; } paint(); });
        if (next) next.addEventListener('click', () => { p += 1; r = 0; shownModel = false; paint(); });
      }
      paint();
    }
  };

  /* ---------- step type: dictate ---------- */
  /* items: [{ say, lead?, q?, answer }] or [{ say, fields:[{ label, answer, accept? }] }]. The student listens and types. */
  const norm = (t) => String(t).toLowerCase().replace(/[^a-z0-9@._:-]/g, '');
  const dictate = {
    fieldsOf(it, s) { return it.fields || [{ label: it.label || s.label || 'Type what you hear', answer: it.answer, accept: it.accept }]; },
    render(s) {
      return `<section class="card">
        ${s.prompt ? `<p class="hint">${esc(s.prompt)}</p>` : ''}${noVoiceNote()}
        ${s.items.map((it, n) => `<div class="q" data-q="${n}">
          ${it.lead ? `<p class="lead">${esc(it.lead)}</p>` : ''}
          ${it.q ? `<p class="q-text"><b>${n + 1}.</b> ${esc(it.q)}</p>` : `<p class="q-text"><b>${n + 1}.</b> Listen and type.</p>`}
          ${listenRow(it.say)}
          ${dictate.fieldsOf(it, s).map((f, k) => `<div class="field"><label for="d${n}_${k}">${esc(f.label)}</label>
            <input id="d${n}_${k}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-f="${k}" inputmode="${f.numeric ? 'numeric' : 'text'}"></div>`).join('')}
          <button type="button" class="btn" data-check>Check</button>
          <div class="say" role="status" aria-live="polite"></div>
        </div>`).join('')}
        <p class="meter" data-meter>Correct 0 of ${s.items.length}</p>
      </section>`;
    },
    wire(root, s) {
      let right = 0, resolved = 0;
      const meter = root.querySelector('[data-meter]');
      root.querySelectorAll('.q').forEach((q) => {
        const it = s.items[+q.dataset.q], fields = dictate.fieldsOf(it, s), box = q.querySelector('.say');
        const inputs = [...q.querySelectorAll('input')]; let tries = 0;
        q.querySelector('[data-check]').addEventListener('click', () => {
          if (q.classList.contains('solved')) return;
          let bad = 0;
          inputs.forEach((inp, k) => {
            const f = fields[k], ok = [f.answer].concat(f.accept || []).some((a) => norm(a) === norm(inp.value));
            inp.classList.toggle('right', ok); inp.classList.toggle('wrong', !ok && inp.value.trim() !== ''); if (!ok) bad += 1;
          });
          if (!bad) {
            q.classList.add('solved'); inputs.forEach((i) => { i.disabled = true; });
            say(box, 'good', `<b>Yes.</b> <span>${esc(it.why || 'You heard it right.')}</span>`);
            right += 1; resolved += 1;
          } else {
            tries += 1;
            if (tries >= 2) {
              q.classList.add('solved'); inputs.forEach((i, k) => { i.disabled = true; i.value = fields[k].answer; i.classList.remove('wrong'); });
              say(box, 'info', `The answer is shown. Listen again and compare. ${esc(it.why || '')}`); resolved += 1;
            } else say(box, 'bad', `${bad === 1 ? 'One answer is' : bad + ' answers are'} not right. ${esc(it.hint || s.hint || 'Listen again, slowly.')}`);
          }
          meter.textContent = `Correct ${right} of ${s.items.length}`;
          if (resolved === s.items.length) { if (right === s.items.length) meter.classList.add('ok'); markDone(s.id); }
        });
      });
    }
  };

  /* ---------- step type: plan ---------- */
  /* slots: [{ key, label, prompt, mode:'one'|'many', count, options:[{t, ok, why}], whyOk }]
     rows:  planner table rows: { label, fixed } or { label, slot, i } */
  const plan = {
    render(s) {
      const slotHtml = s.slots.map((sl, n) => {
        const head = `<h3>${n + 1}. ${esc(sl.prompt)}</h3>`;
        if (sl.mode === 'many') {
          return `<div class="slot" data-slot="${sl.key}" data-mode="many">${head}
            <div class="tiles">${sl.options.map((o, k) => `<button type="button" class="tile" data-k="${k}" aria-pressed="false">${esc(o.t)}</button>`).join('')}</div>
            <button type="button" class="btn" data-check>Check my choices</button>
            <div class="say" role="status" aria-live="polite"></div></div>`;
        }
        return `<div class="slot" data-slot="${sl.key}" data-mode="one">${head}
          <div class="stack">${sl.options.map((o, k) => `<button type="button" class="option" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>
          <div class="say" role="status" aria-live="polite"></div></div>`;
      }).join('');
      return `<section class="card">
          ${s.topic ? `<p>Topic: <b>${esc(s.topic)}</b></p>` : ''}
          ${slotHtml}
        </section>
        <section class="card"><h2>${esc(s.plannerTitle || 'Your planner')}</h2>
          <table class="planner"><tbody>${s.rows.map((r, n) => r.fixed != null
            ? `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.fixed)}</td></tr>`
            : `<tr><th scope="row">${esc(r.label)}</th><td data-row="${n}" class="empty">${esc(r.wait || 'Finish the step above')}</td></tr>`).join('')}</tbody></table>
          <p class="after" data-planner-done hidden>${esc(s.afterText || 'Your planner is ready. Now plan your own in class.')}</p>
        </section>`;
    },
    wire(root, s) {
      const got = {}, chosen = {};
      const slotsLeft = () => s.slots.filter((sl) => !got[sl.key]).length;
      function fill() {
        s.rows.forEach((r, n) => {
          if (r.fixed != null) return;
          const val = chosen[r.slot]; if (val == null) return;
          const text = Array.isArray(val) ? val[r.i || 0] : val;
          if (text == null) return;
          const c = root.querySelector(`[data-row="${n}"]`); c.textContent = sub(text); c.classList.remove('empty');
        });
        if (!slotsLeft()) { root.querySelector('[data-planner-done]').hidden = false; markDone(s.id); }
      }
      s.slots.forEach((sl) => {
        const el = root.querySelector(`[data-slot="${sl.key}"]`), box = el.querySelector('.say');
        if (sl.mode === 'many') {
          const tiles = [...el.querySelectorAll('.tile')];
          tiles.forEach((t) => t.addEventListener('click', () => {
            if (el.classList.contains('solved')) return;
            const on = t.getAttribute('aria-pressed') !== 'true';
            t.setAttribute('aria-pressed', String(on)); t.classList.toggle('flag', on);
          }));
          el.querySelector('[data-check]').addEventListener('click', () => {
            if (el.classList.contains('solved')) return;
            const picked = tiles.filter((t) => t.getAttribute('aria-pressed') === 'true');
            if (picked.length !== sl.count) { say(box, 'bad', `Choose exactly ${sl.count}. You chose ${picked.length}.`); return; }
            const bad = picked.filter((t) => !sl.options[+t.dataset.k].ok);
            if (bad.length) { say(box, 'bad', `${bad.length === 1 ? 'One choice does' : bad.length + ' choices do'} not fit. ${esc(sl.hint || 'Ask: does it fit the topic sentence?')}`); return; }
            el.classList.add('solved'); tiles.forEach((t) => { t.disabled = true; });
            chosen[sl.key] = picked.map((t) => sl.options[+t.dataset.k].t);
            say(box, 'good', `<b>Yes.</b> <span>${esc(sl.whyOk || '')}</span>`);
            got[sl.key] = true; fill();
          });
        } else {
          el.querySelectorAll('.option').forEach((b) => b.addEventListener('click', () => {
            if (el.classList.contains('solved')) return;
            const o = sl.options[+b.dataset.k];
            if (o.ok) {
              el.classList.add('solved'); b.classList.add('right');
              el.querySelectorAll('.option').forEach((x) => { x.disabled = true; });
              say(box, 'good', `<b>Yes.</b> <span>${esc(o.why || sl.whyOk || '')}</span>`);
              chosen[sl.key] = o.t; got[sl.key] = true; fill();
            } else { b.classList.add('wrong'); say(box, 'bad', `${esc(o.why || '')} Try again.`); }
          }));
        }
      });
    }
  };

  /* ---------- step type: yourturn ---------- */
  const yourturn = {
    render(s) {
      const card = (title, body) => body ? `<section class="card"><h2>${esc(title)}</h2>${body}</section>` : '';
      return card('Your task in class', s.task ? `<p>${esc(s.task)}</p>${s.condition ? `<p class="hint">${esc(s.condition)}</p>` : ''}` : '')
        + card('Role cards', s.cards ? s.cards.map((c) => `<div class="role-card"><b>${esc(c.who)}</b><p>${esc(c.text)}</p></div>`).join('') : '')
        + card('Phrase card', s.phrases ? `<p class="hint">You may look at this card. Do not read from a paper.</p><ul class="phrase-list">${s.phrases.map((x) => `<li><span>${esc(x.text)}</span>${TTS ? `<button type="button" class="btn ghost small" data-say="${esc(x.say || x.text)}">Listen</button>` : ''}</li>`).join('')}</ul>` : '')
        + card('Choose a topic', s.topics ? `<ul class="learn">${s.topics.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '')
        + card(s.framesTitle || 'Useful frames', s.frames ? `<ul class="frames">${s.frames.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : '')
        + card(s.levelsTitle || 'How much to write', s.levels ? `<ul class="levels">${s.levels.map((l) => `<li><b>${esc(l.level)}</b> ${esc(l.text)}</li>`).join('')}</ul>` : '')
        + card(s.checklistTitle || 'Check yourself', s.checklist ? `<p class="hint">Tap each box when it is true.</p>
            <div class="stack">${s.checklist.map((t) => `<button type="button" class="check" aria-pressed="false"><span class="box" aria-hidden="true"></span>${esc(t)}</button>`).join('')}</div>` : '')
        + card('Self-study for this unit', s.selfStudy ? `<p>${esc(s.selfStudy)}</p>${s.selfModel ? renderModel(s.selfModel, 0) : ''}` : '')
        + card('Extra practice', s.extra ? `<p class="hint">These open in a new tab.</p>
            <ul class="extra">${s.extra.map((x) => `<li><a class="extra-link" href="${x.url}" target="_blank" rel="noopener">${esc(x.name)} <span aria-hidden="true">↗</span></a><span class="extra-why">${esc(x.why)}</span></li>`).join('')}</ul>` : '')
        + (s.reminder ? `<section class="note" style="margin-top:18px">${esc(s.reminder)}</section>` : '');
    },
    wire(root, s) {
      root.querySelectorAll('.check').forEach((b) => b.addEventListener('click', () => {
        const on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(on)); b.classList.toggle('on', on);
      }));
      if (s.selfModel) wireModel(root.querySelector('[data-model="0"]'), s.selfModel);
      markDone(s.id);
    }
  };

  /* ---------- the cover (first step) and the exit check (last step) ---------- */
  const cover = {
    render() {
      const does = U.steps.filter((s) => s.does).map((s) => `<li>${esc(s.does)}</li>`).join('');
      return `<section class="cover">
          <div class="cover-badge">BUSINESS COMMUNICATION · UNIT ${U.number}</div>
          <h1>${esc(U.title).replace(/^(\S+)/, '<span>$1</span>')}</h1>
          <p>This unit’s output: ${esc(U.output)}</p>
          <button type="button" class="startbtn" id="coverStart">START THE LESSON <span aria-hidden="true">→</span></button>
        </section>
        <section class="panel">
          <div class="section-eyebrow">YOUR GOAL THIS UNIT</div>
          <p class="big">I can ${esc(U.can)}</p>
          <p class="hint">Thinking skills: ${esc(U.bloom.split(', ').join(' \u00b7 '))}</p>
        </section>
        <section class="panel">
          <div class="section-eyebrow">WHAT YOU WILL DO</div>
          <ol class="plain-list">${does}<li>Do your output in class.</li><li>Check what you learned.</li></ol>
          <p class="note">It takes about ${U.minutes || 20} minutes. Turn the sound on and use headphones if you can.</p>
          ${noVoiceNote()}
        </section>`;
    },
    wire(root) { markDone('start'); const b = root.querySelector('#coverStart'); if (b) b.addEventListener('click', () => go(1)); }
  };

  const exitStep = {
    render(s, i, total) {
      const X = U.exit;
      const body = state.exit
        ? exitResultHtml()
        : `<section class="card">
            ${X.questions.map((q, n) => `<div class="q" data-q="${n}">
              <p class="q-text"><b>${n + 1}.</b> ${esc(q.q)}</p>
              <div class="stack" role="group" aria-label="Question ${n + 1}">${q.options.map((o, k) => `<button type="button" class="option" data-k="${k}">${esc(o)}</button>`).join('')}</div>
            </div>`).join('')}
          </section>
          <section class="card">
            <h2>How confident are you?</h2>
            <p>${esc(X.outcome)}</p>
            <div class="confidence" id="exitConf" role="group" aria-label="Confidence from 1 to 5">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" aria-label="Confidence ${n} of 5">${n}</button>`).join('')}</div>
            <div class="conf-scale"><span>Not confident</span><span>Very confident</span></div>
            <button type="button" class="btn" id="exitSend" disabled>See my result</button>
            <div class="say" id="exitFb" role="status" aria-live="polite"></div>
          </section>`;
      return `<div class="section-head">
          <div class="section-eyebrow">STEP ${i + 1} OF ${total}</div>
          <h1 class="section-title">${esc(s.title)}</h1>
          <p class="section-sub">${esc(s.sub)}</p>
          ${think(s)}
        </div>${body}`;
    },
    wire(root, s) {
      if (state.exit) { markDone(s.id); return; }
      const X = U.exit, answered = {}; let conf = 0;
      const send = root.querySelector('#exitSend');
      const ready = () => { send.disabled = !(Object.keys(answered).length >= X.questions.length && conf); };
      root.querySelectorAll('.q').forEach((q) => {
        const n = +q.dataset.q;
        q.querySelectorAll('.option').forEach((b) => b.addEventListener('click', () => {
          q.querySelectorAll('.option').forEach((x) => x.classList.remove('flag'));
          b.classList.add('flag'); answered[n] = +b.dataset.k; ready();
        }));
      });
      root.querySelector('#exitConf').addEventListener('click', (ev) => {
        const b = ev.target.closest('button'); if (!b) return;
        root.querySelectorAll('#exitConf button').forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel'); conf = +b.dataset.n; ready();
      });
      send.addEventListener('click', () => {
        if (send.disabled) return;
        let right = 0;
        X.questions.forEach((q, n) => {
          const box = root.querySelector(`[data-q="${n}"] .stack`);
          const ok = answered[n] === q.answer; if (ok) right += 1;
          box.children[answered[n]].classList.remove('flag'); box.children[answered[n]].classList.add(ok ? 'right' : 'wrong');
          if (!ok) box.children[q.answer].classList.add('right');
          [...box.children].forEach((x) => { x.disabled = true; });
        });
        state.exit = { right, total: X.questions.length, conf }; save();
        const fb = root.querySelector('#exitFb');
        say(fb, right === X.questions.length && conf >= 3 ? 'good' : 'info', exitMessage());
        send.disabled = true; markDone(s.id);
        root.insertAdjacentHTML('beforeend', doneCard());
      });
    }
  };
  function exitMessage() {
    const e = state.exit, all = e.right === e.total;
    return all ? (e.conf >= 3 ? 'Well done! Your answers are right and you feel ready.' : 'Your answers are right. Practice a little more to feel confident.')
      : 'Look at the green answers. Practice them before your next class.';
  }
  function exitResultHtml() {
    const e = state.exit;
    return `<section class="card"><h2>Your result</h2>
      <p>You answered ${e.right} of ${e.total} correctly. Your confidence: ${e.conf} out of 5.</p>
      <div class="say ${e.right === e.total && e.conf >= 3 ? 'good' : 'info'}">${exitMessage()}</div></section>${doneCard()}`;
  }
  function doneCard() {
    return `<section class="card done-card"><h2>Great work!</h2>
      <p>You finished Unit ${U.number}. Now do your output in class. You are ready.</p>
      <a class="btn" href="../index.html">Back to all units</a></section>`;
  }

  /* ---------- assemble the steps ---------- */
  const TYPES = { learn, ladder, choose, dictate, pick, order, plan, yourturn };
  const STEPS = [Object.assign({ id: 'start', title: 'Start', type: 'cover' }, { impl: cover })];
  U.steps.forEach((s) => { if (!TYPES[s.type]) throw new Error('Unknown step type: ' + s.type); STEPS.push(Object.assign({}, s, { impl: TYPES[s.type] })); });
  if (U.exit) STEPS.push({ id: 'exit', title: 'Exit check', sub: 'Two quick questions and one rating. It takes 2 minutes. It helps you, and it stays on your device.', bloom: 'Evaluate', impl: exitStep });

  /* ---------- navigation and chrome ---------- */
  function paintChrome() {
    const total = STEPS.length;
    dots.innerHTML = STEPS.map((s, i) =>
      `<span class="dot-wrap"><button type="button" class="dot${i === state.step ? ' active' : ''}${state.done[s.id] ? ' done' : ''}" data-go="${i}" aria-label="Step ${i + 1}: ${esc(s.title)}${state.done[s.id] ? ', done' : ''}"${i === state.step ? ' aria-current="step"' : ''}></button></span>`).join('');
    dots.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(+b.dataset.go)));
    brandSub.textContent = `Business Communication · Unit ${U.number} · Step ${state.step + 1} of ${total}`;
    btnBack.disabled = state.step === 0;
    btnNext.innerHTML = state.step === total - 1 ? 'All units' : 'Next →';
  }
  function go(i) {
    state.step = Math.max(0, Math.min(STEPS.length - 1, i));
    save();
    const s = STEPS[state.step], total = STEPS.length;
    app.innerHTML = s.type === 'cover' || s.id === 'exit'
      ? s.impl.render(s, state.step, total)
      : intro(s, state.step + 1, total) + photoHtml(s) + s.impl.render(s, state.step);
    paintChrome();
    s.impl.wire(app, s, state.step);
    window.scrollTo({ top: 0, behavior: 'auto' });
    app.focus({ preventScroll: true });
  }
  btnBack.addEventListener('click', () => go(state.step - 1));
  btnNext.addEventListener('click', () => {
    if (state.step === STEPS.length - 1) { window.location.href = '../index.html'; return; }
    go(state.step + 1);
  });
  const reset = document.getElementById('btnReset');
  if (reset) reset.addEventListener('click', () => {
    if (!window.confirm('Start Unit ' + U.number + ' again? Your steps will be cleared on this device.')) return;
    state = { step: 0, done: {}, exit: null }; save(); go(0);
  });

  document.title = 'Unit ' + U.number + ' · ' + U.title + ' · Business Communication';
  go(Math.min(state.step, STEPS.length - 1));
})();
