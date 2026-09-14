/* ===================== SHARED MISSION COMPONENTS =====================
   Surprise Challenge (a late curveball scenario, same mechanic as each
   unit's own opening scenario) and Exit Ticket (a short reflection).
   Extracted from Unit 9 once Unit 15 needed the same shape for its own
   capstone twist. Both take their content as a `data` parameter instead
   of reading a unit-local global, plus an `eyebrow` label to display,
   since the section number differs per unit depending on where it's
   inserted into that unit's own SECTION_META/RENDERERS arrays.

   Depends only on the global markActivityComplete() already defined in
   every unit's own app.js — no other unit-local coupling. */

function renderSurprise(data, eyebrow){
  const facts = data.facts.map(f=>`<li>${f}</li>`).join('');
  const options = data.options.map((o,i)=>`
    <button class="choice-btn scenario-choice" data-i="${i}">${o.text}</button>`).join('');
  return `
  <div class="section-eyebrow">${eyebrow}</div>
  <h2 class="section-title">Surprise Challenge</h2>
  <p class="section-sub">Something unexpected happens. Read the situation, then decide what you'd do.</p>
  <div class="panel">
    <ul style="margin:0 0 0 18px;padding:0;line-height:1.9;font-size:14.5px;color:var(--ink);">${facts}</ul>
    <div class="scenario-message">${data.message}</div>
    <p style="font-weight:700;color:var(--navy);margin-top:16px;">${data.question}</p>
    <p style="color:var(--muted);font-size:12.5px;margin-top:2px;">More than one answer can be reasonable. Choose everything you think is a good idea.</p>
    <div class="choices" id="surpriseChoices" style="margin-top:14px;">${options}</div>
    <div class="feedback" id="surpriseFeedback" style="display:block;"></div>
    ${data.liveTask ? `
    <hr class="hairline">
    <h3 style="font-size:15px;color:var(--navy);">Now Perform It</h3>
    <p style="color:var(--ink);margin-top:6px;font-size:14.5px;">${data.liveTask}</p>` : ''}
  </div>`;
}
function wireSurprise(data){
  const choicesEl = document.getElementById('surpriseChoices');
  const feedbackEl = document.getElementById('surpriseFeedback');
  const chosen = new Set();
  choicesEl.addEventListener('click', e=>{
    const btn = e.target.closest('.scenario-choice'); if(!btn) return;
    const i = +btn.dataset.i;
    const opt = data.options[i];
    btn.classList.toggle('sel');
    btn.classList.toggle(opt.good ? 'correct' : 'wrong', btn.classList.contains('sel'));
    if(btn.classList.contains('sel')) chosen.add(i); else chosen.delete(i);
    feedbackEl.className = 'feedback show ' + (opt.good ? 'good' : 'meh');
    feedbackEl.textContent = opt.note;
    if(chosen.size >= 2) markActivityComplete('surprise', {completionStatus:'reached'});
  });
}

function renderExit(data, eyebrow){
  return `
  <div class="section-eyebrow">${eyebrow}</div>
  <h2 class="section-title">Exit Ticket</h2>
  <p class="section-sub">${data.prompt}</p>
  <div class="panel">
    <textarea id="exitWriting" class="challenge-textarea" rows="3" placeholder="Type your answer here…"></textarea>
    <div class="feedback" id="exitFb"></div>
  </div>`;
}
function wireExit(data){
  const box = document.getElementById('exitWriting');
  const fb = document.getElementById('exitFb');
  box.addEventListener('input', ()=>{
    const len = box.value.trim().length;
    if(len >= data.minChars){
      fb.className = 'feedback show good';
      fb.textContent = 'Thanks. That\'s a real, useful reflection.';
      markActivityComplete('exit', {score:`${box.value.trim().length} chars`});
    } else if(len > 0){
      fb.className = 'feedback show meh';
      fb.textContent = 'Keep going, just a little more.';
    } else {
      fb.className = 'feedback';
    }
  });
}
