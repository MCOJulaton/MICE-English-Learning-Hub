/* ===================== EXIT TICKET (shared by the English for Communication units) =====================
   A 2-minute check at the end of a unit, tied to the unit's output (not a generic quiz):
     1. two "show me" questions (multiple choice, A1 language),
     2. a confidence rating, 1 to 5, for the unit's main outcome,
     3. an optional one-line "what is still hard".
   The student presses "Send my exit ticket". The unit's own markActivityComplete records the
   score, the confidence and the optional note on the progress sheet, so the teacher can see who
   is not confident before the next class. Each unit supplies its own config (EXIT_CFG in data.js):
     { outcome: 'I can ...', questions: [{ q, options:[...], correct: index, say?: 'text to hear' }, ...] }
   Nothing here blocks a student from moving on. */
(function(){
  function e(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  if(!document.getElementById('exitTicketStyle')){
    const st = document.createElement('style');
    st.id = 'exitTicketStyle';
    st.textContent = `
      .exit-q{font-weight:700;color:var(--navy);margin:0 0 10px;}
      .exit-conf{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}
      .exit-conf button{width:48px;height:48px;border-radius:50%;border:2px solid var(--line);background:#fff;color:var(--navy);font:inherit;font-weight:800;font-size:17px;cursor:pointer;}
      .exit-conf button:hover{border-color:var(--teal);}
      .exit-conf button.sel{background:var(--orange);color:#fff;border-color:var(--orange-deep);}
      .exit-scale{display:flex;justify-content:space-between;max-width:300px;font-size:12px;color:var(--muted);margin-top:6px;}
      .exit-input{font:inherit;width:100%;padding:10px 12px;border:2px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);min-height:44px;margin-top:8px;}
      .exit-input:focus{outline:3px solid var(--teal-light);outline-offset:1px;border-color:var(--teal);}
      .exit-send{margin-top:16px;}
      .exit-send:disabled{opacity:.45;cursor:default;}
    `;
    document.head.appendChild(st);
  }

  window.renderExitTicket = function(cfg){
    const qs = cfg.questions.map((q,i)=>`
      <div class="sit-card">
        <p class="exit-q">${i + 1}. ${e(q.q)}</p>
        ${q.say ? `<button type="button" class="reveal-btn" data-exsay="${i}" style="margin-bottom:10px;">Listen</button>` : ''}
        <div class="choices" data-exq="${i}">${q.options.map((o,j)=>`<button type="button" class="choice-btn" data-v="${j}"><span class="letter">${'ABC'[j]}</span> ${e(o)}</button>`).join('')}</div>
      </div>`).join('');
    return `
    <div class="section-eyebrow">Exit Ticket</div>
    <h2 class="section-title">Before You Go</h2>
    <p class="section-sub">Two quick questions and one rating. It takes 2 minutes. It helps your teacher, and it helps you.</p>
    <div class="panel">${qs}</div>
    <div class="panel">
      <p class="exit-q">How confident are you? <b>${e(cfg.outcome)}</b></p>
      <div class="exit-conf" id="exitConf">${[1,2,3,4,5].map(n=>`<button type="button" data-n="${n}" aria-label="Confidence ${n} of 5">${n}</button>`).join('')}</div>
      <div class="exit-scale"><span>Not confident</span><span>Very confident</span></div>
      <p class="exit-q" style="margin-top:18px;">One thing that is still hard (optional)</p>
      <input type="text" class="exit-input" id="exitNote" maxlength="80" placeholder="For example: prices, he or she, because..." autocomplete="off">
      <button type="button" class="startbtn exit-send" id="exitSend" disabled>Send my exit ticket →</button>
      <div class="feedback" id="exitFb"></div>
    </div>`;
  };

  window.wireExitTicket = function(cfg, onDone){
    const answered = {};
    let conf = 0, sent = false;
    const send = document.getElementById('exitSend');
    function ready(){ send.disabled = sent || !(Object.keys(answered).length >= cfg.questions.length && conf); }
    cfg.questions.forEach((q,i)=>{
      const box = document.querySelector(`[data-exq="${i}"]`);
      const hear = document.querySelector(`[data-exsay="${i}"]`);
      if(hear) hear.addEventListener('click', ()=>{ if(typeof speak === 'function') speak(q.say); });
      box.addEventListener('click', ev=>{
        const btn = ev.target.closest('.choice-btn'); if(!btn || sent) return;
        [...box.children].forEach(b=>b.classList.remove('sel','correct','wrong'));
        btn.classList.add('sel');
        answered[i] = +btn.dataset.v;
        ready();
      });
    });
    document.getElementById('exitConf').addEventListener('click', ev=>{
      const b = ev.target.closest('button'); if(!b || sent) return;
      document.querySelectorAll('#exitConf button').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel'); conf = +b.dataset.n; ready();
    });
    send.addEventListener('click', ()=>{
      if(send.disabled) return;
      sent = true; send.disabled = true;
      let right = 0;
      cfg.questions.forEach((q,i)=>{
        const box = document.querySelector(`[data-exq="${i}"]`);
        const ok = answered[i] === q.correct; if(ok) right++;
        box.children[answered[i]].classList.remove('sel'); box.children[answered[i]].classList.add(ok ? 'correct' : 'wrong');
        if(!ok) box.children[q.correct].classList.add('correct');
      });
      const note = (document.getElementById('exitNote').value || '').trim();
      const score = `${right}/${cfg.questions.length} | confidence ${conf}/5`;
      const fb = document.getElementById('exitFb');
      fb.className = 'feedback show ' + (right === cfg.questions.length && conf >= 3 ? 'good' : 'meh');
      fb.textContent = right === cfg.questions.length
        ? (conf >= 3 ? 'Thank you! Your exit ticket is sent. Well done.' : 'Thank you! Your answers are right. Practice a little more to feel confident.')
        : 'Thank you! Your exit ticket is sent. Look at the green answers and practice them at home.';
      onDone(score, note ? `Still hard: ${note}` : '');
    });
  };
})();
