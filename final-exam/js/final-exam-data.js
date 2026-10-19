/* ===================== FINAL EXAM BRIEFING — course data + renderers =====================
   Student-facing page written for A1 readers. Shows each exam part, what to do, and an
   example that is NOT on the exam. No exam questions or answers appear here.
   Loaded by final-exam/index.html and by each course page (mice/, wellness/). */

/* ---- tiny HTML helpers ---- */
const feChip = (text, tone) => `<span class="fe-chip${tone === 'teal' ? ' teal' : ''}">${text}</span>`;
const feAct = (chip, text, tone) => `<div class="fe-act">${feChip(chip, tone)}<span class="t">${text}</span></div>`;
const feLetters = (letters, circled) => `<div class="fe-letters" aria-label="Letters ${letters.join(', ')}, ${circled} is circled">${
  letters.map(l => `<span class="fe-letter${l === circled ? ' circled' : ''}">${l}</span>`).join('')}</div>`;
const feTF = () => `<div class="fe-tf"><span>TRUE</span><span class="f">FALSE</span></div>`;
const feBoxes = () => `<div class="fe-boxes"><span>1</span><span>2</span><span>3</span><span>4</span></div>`;
const feLet = (t, on) => `<span class="fe-let${on ? ' circled' : ''}">${t.slice(0, 1)}</span>${t.slice(1)}`;
const feOpts = (list, circled) => `<div class="fe-opts">${list.map((t, i) => `<span class="fe-opt">${feLet(t, i === circled)}</span>`).join('')}</div>`;
const feOptBlock = (t, circled) => `<div class="fe-opt-block">${feLet(t, circled)}</div>`;
const feHint = () => `<p class="fe-hint">The correct answer has a circle.</p>`;
const feExample = (label, inner, dark) => `<div class="fe-example${dark ? ' dark' : ''}"><div class="lbl">${label}</div>${inner}</div>`;

const FINAL_EXAM_COURSES = [
  {
    id: 'mice', name: 'English for MICE Industry', short: 'MICE',
    sub: 'The exam has 5 parts and 40 points.',
    hubText: '5 parts, 40 points. What to bring, what to do, and one example for each part.',
    glance: [['Part 1', 'Vocabulary: choose the word', 10], ['Part 2', 'True or False', 10], ['Part 3', 'Taking Notes from phone calls', 9], ['Part 4', 'Put the sentence in order', 5], ['Part 5', 'Writing', 6]],
    totalNote: '5 parts, 3 pages',
    total: 40,
    howto: ['Read each instruction first.', 'Do all five parts.', 'Write your answers in the spaces.', 'Write clearly, so your teacher can read your answers.', 'Check your answers at the end.'],
    words: [
      ['Circle', 'Draw a circle around your answer.', feLetters(['A', 'B', 'C'], 'B')],
      ['Write', 'Write words or numbers on the line.', '<span class="fe-line">TRUE</span>'],
      ['Choose', 'Pick the one best answer.', ''],
      ['Read', 'Look at the words and understand them.', ''],
      ['Put in order', 'Write 1, 2, 3, 4 in the boxes.', ''],
      ['Take notes', 'Write short words. Full sentences are not needed.', '']
    ],
    parts: [
      {
        pill: 'Part 1 · 10 points', title: 'Vocabulary',
        body: `<div class="fe-actions">${feAct('Read', 'the meaning.')}${feAct('Choose', 'the correct word.')}${feAct('Circle', 'A, B, C, or D.', 'teal')}${feLetters(['A', 'B', 'C', 'D'], 'B')}</div>`,
        example: feExample('Example (not on the exam)', `<p>1. A small card with your name and phone number.</p>${feOpts(['A. Badge', 'B. Business card', 'C. Brochure', 'D. Hold'], 1)}${feHint()}`),
        tip: 'Tip: read all four words before you circle.',
        study: 'Study the words from Units 9, 10, and 11.'
      },
      {
        pill: 'Part 2 · 10 points', title: 'True or False',
        body: `<div class="fe-actions">${feAct('Read', 'each sentence.')}${feAct('Write', 'on the line:', 'teal')}${feTF()}</div>`,
        example: feExample('Examples (not on the exam)', `<div class="fe-tf-row"><span class="q">1. A business card has a name and a phone number.</span><span class="a">TRUE</span></div><div class="fe-tf-row"><span class="q">2. You say goodbye before you say hello.</span><span class="a">FALSE</span></div><p class="fe-hint">You write TRUE or FALSE on the line.</p>`),
        tip: 'Tip: read the whole sentence. One wrong word can make it FALSE.',
        study: 'Think about what we learned in Units 9, 10, and 11.'
      },
      {
        pill: 'Part 3 · 9 points', title: 'Taking Notes',
        body: `<p style="margin-top:14px;font-size:17px;line-height:1.55;">Read each phone call. Write short notes in the form. You do not need to write full sentences. There are 3 phone calls. Each call is 3 points.</p>
          <table class="fe-table"><thead><tr><th>Write</th><th>What goes there</th></tr></thead><tbody>
          <tr><td><b>Who</b></td><td>The caller’s name and company</td></tr>
          <tr><td><b>What</b></td><td>What the caller wants or needs</td></tr>
          <tr><td><b>Contact Info</b></td><td>The caller’s phone number</td></tr>
          <tr><td><b>Follow-up</b></td><td>What happens next: a deadline or a call back time</td></tr></tbody></table>`,
        example: `<div class="fe-example-grid">${
          feExample('Phone call (not on the exam)', `<p>Khun Arun from Blue Coast Tours calls the MICE Console. He wants to speak with the catering manager, but the manager is in a meeting. His phone number is 076-555-0123. He needs 2 more vegetarian meals for tomorrow’s lunch. He wants a call back before 4:00 p.m.</p>`)}${
          feExample('Short notes', `<p><b>Who:</b> Khun Arun, Blue Coast Tours</p><p><b>What:</b> needs 2 more vegetarian meals for tomorrow’s lunch, c/o catering manager</p><p><b>Contact Info:</b> 076-555-0123</p><p><b>Follow-up:</b> call back before 4:00 p.m.</p>`, true)}</div>`,
        tip: 'Tip: use short words. Check the numbers and the times carefully.',
        extra: `<div class="fe-example-grid">${feExample('Long (not needed)', `<p>Khun Arun says that he needs two more vegetarian meals for tomorrow’s lunch. He wants to speak with the catering manager.</p>`)}${feExample('Short note (good)', `<p><b>What:</b> needs 2 more vegetarian meals for tomorrow’s lunch, c/o catering manager</p><p><b>Follow-up:</b> call back @ 1:00 p.m.</p>`, true)}</div><div class="fe-cards"><div class="fe-card"><h3>@</h3><p>means “at”. Use it for a time.</p></div><div class="fe-card"><h3>c/o</h3><p>means “for this person”. The message is for the catering manager.</p></div><div class="fe-card"><h3>2</h3><p>Use numbers: write 2, not “two”.</p></div></div><p class="fe-study">Shortcuts are optional. Short, clear words are enough.</p>`
      },
      {
        pill: 'Part 4 · 5 points', title: 'Put the sentence in order',
        body: `<div class="fe-actions">${feAct('Look', 'at the four parts.')}${feAct('Write', '1, 2, 3, 4 in the boxes.', 'teal')}${feBoxes()}${feAct('Make', 'ONE sentence. Number 1 is first.')}</div>`,
        example: feExample('Example (not on the exam)', `<p class="fe-hint" style="margin-top:6px">On the paper:</p><p class="fe-order">1. <span class="fe-box"></span> after lunch. <span class="fe-box"></span> I will <span class="fe-box"></span> back <span class="fe-box"></span> call&nbsp;you</p><p class="fe-hint">Your answer:</p><p class="fe-order">1. <span class="fe-box">4</span> after lunch. <span class="fe-box">1</span> I will <span class="fe-box">3</span> back <span class="fe-box">2</span> call&nbsp;you</p><p class="ans">I will call you back after lunch.</p>`),
        tip: 'Tip: the first part has a capital letter. The last part has a full stop.'
      },
      {
        pill: 'Part 5 · 6 points', title: 'Writing',
        body: `<p style="margin-top:14px;font-size:17px;line-height:1.55;">Read the situation. Write what you say. Write 3 to 5 sentences. Use polite words.</p>
          <div class="fe-step-row"><div class="fe-step-card"><div class="n">1</div><h3>Sorry</h3></div><div class="fe-step-card"><div class="n">2</div><h3>Reason</h3></div><div class="fe-step-card"><div class="n">3</div><h3>Alternative</h3></div></div>`,
        example: feExample('Example (not on the exam)', `<p>Ms. Lin wants a quiet table in the restaurant at 7:00 p.m. All the quiet tables are booked. You can offer a table by the window at 7:00 p.m., or a quiet table at 8:30 p.m.</p><p class="ans">I am very sorry, Ms. Lin. All the quiet tables are booked at 7:00 p.m. I can offer you a table by the window at 7:00 p.m., or a quiet table at 8:30 p.m. Which one would you like? Thank you for your understanding.</p>`),
        tip: 'Tip: use only the facts in the situation.'
      }
    ],
    ready: ['Study the words from Units 9, 10, and 11.', 'Practice notes from a phone call: Who, What, Contact Info, Follow-up.', 'Practice an apology: sorry, reason, alternative.', 'Look at your Long Quiz again.', 'Bring your pen. Put your phone away.']
  },
  {
    id: 'wellness', name: 'English for Wellness Tourism', short: 'Wellness',
    sub: 'The exam has 4 parts and 40 points.',
    hubText: '4 parts, 40 points. What to bring, what to do, and one example for each part.',
    glance: [['Part 1', 'Good Practice or Needs Work', 10], ['Part 2', 'Vocabulary: choose the word', 10], ['Part 3', 'Wellness Tourism Promotion', 10], ['Part 4', 'Choosing the Right Package', 10]],
    totalNote: '4 parts',
    total: 40,
    howto: ['Read each instruction first.', 'Do all four parts.', 'Write your answers in the spaces.', 'Write clearly, so your teacher can read your answers.', 'Check your answers at the end.'],
    words: [
      ['Circle', 'Draw a circle around your answer.', feLetters(['A', 'B', 'C'], 'B')],
      ['Write', 'Write words or numbers on the line.', '<span class="fe-line">900 baht</span>'],
      ['Choose', 'Pick the one best answer or the one package.', ''],
      ['Read', 'Look at the words and understand them.', ''],
      ['Finish', 'Add the missing words to complete it.', ''],
      ['Say why', 'Give a reason. Use the word “because”.', '']
    ],
    parts: [
      {
        pill: 'Part 1 · 10 points', title: 'Good Practice or Needs Work',
        body: `<div class="fe-actions">${feAct('Read', 'the situation.')}<div class="fe-act"><span class="t">A and B are two things a staff member can say.</span></div>${feAct('Circle', 'A or B for the GOOD PRACTICE answer.', 'teal')}${feLetters(['A', 'B'], 'B')}</div>`,
        example: feExample('Example (not on the exam)', `<p>1. A guest says, “I have a headache.”</p>${feOptBlock('A. “Try our loud music class.”', false)}${feOptBlock('B. “Our quiet tea room is a good place to rest.”', true)}${feHint()}`),
        tip: 'Tip: Is it polite? Is it helpful? Does it fit the guest?'
      },
      {
        pill: 'Part 2 · 10 points', title: 'Vocabulary',
        body: `<div class="fe-actions">${feAct('Read', 'the meaning.')}${feAct('Choose', 'the correct word.')}${feAct('Circle', 'A, B, C, or D.', 'teal')}${feLetters(['A', 'B', 'C', 'D'], 'D')}</div>`,
        example: feExample('Example (not on the exam)', `<p>1. A person who stays at a hotel.</p>${feOpts(['A. Guest', 'B. Driver', 'C. Chef', 'D. Guard'], 0)}${feHint()}`),
        tip: 'Tip: read all four words before you circle.',
        study: 'Study the wellness words from our lessons.'
      },
      {
        pill: 'Part 3 · 10 points', title: 'Wellness Tourism Promotion',
        body: `<div class="fe-actions">${feAct('Read', 'the information in the box.')}${feAct('Finish', 'the advertisement.')}${feAct('Write', 'the missing words on the lines (1 to 10).', 'teal')}</div>`,
        example: `<div class="fe-example-grid">${
          feExample('Example box (not on the exam)', `<p><b>Product:</b> Sunset Boat Tour<br><b>Place:</b> Chalong Bay<br><b>Time:</b> 5:00 p.m. to 7:00 p.m.<br><b>Price:</b> 900 baht</p>`)}${
          feExample('The advertisement', `<p>Join our <b>(1) Sunset Boat Tour</b> at <b>(2) Chalong Bay</b>. The tour ends at <b>(3) 7:00 p.m.</b> The price is only <b>(4) 900 baht</b> per person. Book today!</p>`, true)}</div>`,
        tip: 'Tip: copy the facts from the box exactly. Check the spelling and the numbers.'
      },
      {
        pill: 'Part 4 · 10 points (5 each)', title: 'Choosing the Right Package',
        body: `<p style="margin-top:14px;font-size:17px;line-height:1.55;">Read the situation. Use the table. Choose ONE package. Write 4 to 5 sentences. Say why it is better.</p>
          <div class="fe-step-row"><div class="fe-step-card"><div class="n">1</div><h3>Choose a package</h3></div><div class="fe-step-card"><div class="n">2</div><h3>Say why</h3></div><div class="fe-step-card"><div class="n">3</div><h3>One advantage</h3></div><div class="fe-step-card"><div class="n">4</div><h3>One disadvantage</h3></div></div>`,
        example: feExample('Best answer (example not on the exam)', `<p>Ms. Kim is tired. She has one day. Her budget is 3,000 baht.<br>Package X: Yoga Morning, 1,800 baht, 3 hours, yoga and tea.<br>Package Y: Spa Day, 2,800 baht, 6 hours, massage, lunch, and sauna.</p><p class="ans">I choose Package Y for Ms. Kim. It is better because she is tired and wants to relax. One advantage is that it has a massage, lunch, and a sauna. One disadvantage is that it costs 2,800 baht. But it is inside her budget of 3,000 baht, so it is good value for money.</p><p>Words you can use: budget, flexible, advantage, disadvantage, value for money, suitable.</p>`),
        tip: 'Tip: use the facts from the table, for example the price, the time, and what is included.'
      }
    ],
    ready: ['Study the wellness words from our lessons.', 'Practice with a partner: good practice or needs work?', 'Practice reading information and finishing an advertisement.', 'Practice choosing a package and saying why.', 'Bring your pen. Put your phone away.']
  }
];

function renderFinalExamHub(){
  return `
    <div class="section-eyebrow">FINAL EXAM</div>
    <h1 class="section-title">What to Expect</h1>
    <p class="section-sub">Choose your course to see the parts of the exam, what to do, and an example for each part.</p>
    <p class="fe-note">The examples on these pages are not on the exam.</p>
    <div class="fe-hub">${FINAL_EXAM_COURSES.map(c => `
      <a class="fe-hub-card" href="${c.id}/index.html">
        <div class="tag">FINAL EXAM</div>
        <h2>${c.name}</h2>
        <p>${c.hubText}</p>
        <span class="go">Open the guide →</span>
      </a>`).join('')}</div>`;
}

function renderFinalExamCourse(c){
  const glanceRows = c.glance.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="pts">${r[2]}</td></tr>`).join('');
  const parts = c.parts.map(p => `
    <section class="fe-part">
      <span class="fe-pill">${p.pill}</span>
      <h2>${p.title}</h2>
      ${p.body}
      ${p.example}
      ${p.tip ? `<p class="fe-tip">${p.tip}</p>` : ''}
      ${p.extra || ''}
      ${p.study ? `<p class="fe-study">${p.study}</p>` : ''}
    </section>`).join('');
  return `
    <div class="section-eyebrow">FINAL EXAM &middot; ${c.name.toUpperCase()}</div>
    <h1 class="section-title">What to Expect</h1>
    <p class="section-sub">${c.sub}</p>
    <p class="fe-note">The examples on this page are not on the exam.</p>

    <section class="fe-part">
      <h2>The exam at a glance</h2>
      <table class="fe-table"><thead><tr><th>Part</th><th>What you do</th><th class="pts">Points</th></tr></thead><tbody>
        ${glanceRows}
        <tr class="total"><td>Total</td><td>${c.totalNote}</td><td class="pts">${c.total}</td></tr>
      </tbody></table>
    </section>

    <section class="fe-part">
      <h2>Before you start</h2>
      <div class="fe-cards">
        <div class="fe-card"><h3>Bring</h3><p>A blue or black pen.</p></div>
        <div class="fe-card"><h3>Write</h3><p>Your name, student ID, and date at the top.</p></div>
        <div class="fe-card dark"><h3>Do not use</h3><p>No phone. No AI. No dictionary. No translation app.</p></div>
      </div>
    </section>

    <section class="fe-part">
      <h2>How to do the exam</h2>
      <ol class="fe-steps">${c.howto.map(h => `<li>${h}</li>`).join('')}</ol>
    </section>

    <section class="fe-part">
      <h2>Words in the instructions</h2>
      <div class="fe-words">${c.words.map(w => `<div class="fe-word"><h3>${w[0]}</h3><p>${w[1]}</p>${w[2]}</div>`).join('')}</div>
    </section>

    ${parts}

    <section class="fe-part">
      <h2>How to get ready</h2>
      <ul class="check-list">${c.ready.map(r => `<li>${r}</li>`).join('')}</ul>
      <p class="fe-tip" style="margin-top:24px;">Good luck!</p>
    </section>`;
}
