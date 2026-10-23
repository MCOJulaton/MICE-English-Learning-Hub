/* Unit 15: Peer Review, Revision, and Portfolio. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 15,
  title: 'Peer Review, Revision, and Portfolio',
  output: 'A revised essay, a peer feedback record, a reflection, and your complete portfolio.',
  can: 'give useful feedback, revise my essay, and show my progress in a portfolio.',
  bloom: 'Evaluate, Create',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 14 before you start.', does: 'Remember how to check your own draft.',
      items: [
        { q: 'Which is a good way to check your draft?',
          options: ['Read it aloud and mark places that sound strange.', 'Do not read it again because it is finished.', 'Ask a tool to write a new essay for you.'],
          answer: 'Read it aloud and mark places that sound strange.', why: 'When you read aloud, you hear places that need revision.' },
        { q: 'What does the introduction end with?',
          options: ['The thesis', 'The conclusion', 'A new example'], answer: 'The thesis', why: 'The thesis is the last sentence of the introduction.' }
      ]
    },
    {
      id: 'feedback', type: 'learn', title: 'How to give good feedback', bloom: 'Understand',
      sub: 'Be kind, be specific, and help your partner.', does: 'Learn how to give good feedback.',
      points: [
        'Be kind and specific: “Your thesis is clear because it names three points.”',
        'Say one strength and one thing to improve.',
        'Use the checklist. Do not rewrite your partner’s essay.',
        'Ask a question: “Can you add an example here?”'
      ],
      models: [{
        title: 'Feedback comments',
        hint: 'Tap each comment. Is it useful?',
        sentences: [
          { text: 'Good job.', kind: 'k3', tag: 'Not useful', note: 'This is kind, but it does not say what is good. The writer cannot learn from it.' },
          { text: 'Your thesis is clear because it names three points.', kind: 'k2', tag: 'Strength', note: 'This says one specific thing that works, and why.' },
          { text: 'Please add an example to the second body paragraph.', kind: 'k1', tag: 'Suggestion', note: 'This is kind and specific. It tells the writer what to do.' },
          { text: 'I do not understand this sentence. Can you explain?', kind: 'k4', tag: 'Question', note: 'A question helps the writer see what is not clear.' }
        ],
        after: 'Notice: good feedback says one strength and one suggestion. It is kind and specific.'
      }],
      table: {
        title: 'Peer review steps',
        rows: [
          ['Step 1', 'Read your partner’s essay once without a pen.'],
          ['Step 2', 'Read again. Use the Peer Feedback Sheet on page {peer}.'],
          ['Step 3', 'Talk for 3 minutes. Take notes on your partner’s comments about your essay.'],
          ['Step 4', 'Decide what to change. Write your changes in your revision plan.']
        ]
      },
      lang: {
        title: 'Sentence starters',
        lines: [
          'I like ______ because ______.',
          'Your thesis is ______. / Your thesis could be clearer because ______.',
          'Please add an example to ______.',
          'I do not understand ______. Can you explain?',
          'Check the verbs in paragraph ______.'
        ]
      }
    },
    {
      id: 'useful', type: 'choose', title: 'Is this feedback useful?', bloom: 'Evaluate',
      sub: 'Choose the comment that helps the writer most.', does: 'Judge peer feedback.',
      hint: 'Not this one. Useful feedback is kind and specific.',
      items: [
        { q: 'Which comment is kind and specific?',
          options: ['Your essay is bad and you must write it again.', 'Your thesis is clear because it names three points.', 'Good job. I like it. It is a very good essay.'],
          answer: 'Your thesis is clear because it names three points.', why: 'It says what works and why.' },
        { q: 'Which comment gives a helpful suggestion?',
          options: ['Change everything in the essay and start again.', 'I do not like essays, so I cannot help you.', 'Please add an example to the second body paragraph.'],
          answer: 'Please add an example to the second body paragraph.', why: 'It tells the writer exactly what to do.' },
        { q: 'Which question helps the writer?',
          options: ['Can you add an example here?', 'Why did you write this?', 'Is this your essay?'],
          answer: 'Can you add an example here?', why: 'It shows where the writer can make the essay better.' },
        { q: 'You do not understand a sentence in your partner’s essay. What do you say?',
          options: ['This sentence is wrong. You must change it now.', 'I do not understand this sentence. Can you explain?', 'Nobody can read this. It is not clear at all.'],
          answer: 'I do not understand this sentence. Can you explain?', why: 'It is kind, and it helps the writer find the problem.' }
      ]
    },
    {
      id: 'revision', type: 'choose', title: 'Real revision', bloom: 'Evaluate',
      sub: 'Revision changes ideas, order, and details. It is more than spelling.', does: 'Choose changes that improve an essay.',
      hint: 'Not this one. A real revision makes the ideas clearer or stronger.',
      items: [
        { q: 'Which change is a real revision?',
          options: ['Fix one spelling mistake in the first paragraph.', 'Add an example to the second body paragraph.', 'Change the color of the pen you used.'],
          answer: 'Add an example to the second body paragraph.', why: 'An example makes a point stronger. Fixing one spelling mistake is editing, not a big revision.' },
        { q: 'Your partner says: “I do not understand your second reason.” Which revision is best?',
          options: ['Delete the whole body paragraph.', 'Change only the spelling.', 'Explain the reason with a clear example.'],
          answer: 'Explain the reason with a clear example.', why: 'This answers your partner’s problem and makes the paragraph clearer.' },
        { q: 'Your revision plan needs at least 5 changes. What do you write for each change?',
          options: ['What I changed and why.', 'Only the page number.', 'Nothing.'],
          answer: 'What I changed and why.', why: 'Your teacher can then see how your essay improved.' }
      ]
    },
    {
      id: 'portfolio', type: 'pick', title: 'Build your portfolio', bloom: 'Evaluate',
      sub: 'Your portfolio shows your best work and how you improved.', does: 'Decide what belongs in your portfolio.',
      prompt: 'Tap the 8 things that belong in your portfolio. Do not tap the 3 things that do not belong. Then tap Check.',
      flag: 'in my portfolio',
      hint: 'Ask: is it my own work, and does it show how I improved?',
      sets: [{
        items: [
          { t: 'Diagnostic paragraph and writer inventory (Unit 1)', on: true },
          { t: 'A paragraph copied from a website', on: false },
          { t: 'Two paragraphs: first draft and revised version', on: true },
          { t: 'One paragraph from Units 6 to 11 (my best pattern paragraph)', on: true },
          { t: 'An essay written by an AI tool', on: false },
          { t: 'Essay outline and thesis (Unit 12)', on: true },
          { t: 'First essay draft and revised essay (Units 14 and 15)', on: true },
          { t: 'At least one peer feedback record', on: true },
          { t: 'A classmate’s essay', on: false },
          { t: 'Tool-use declarations on each piece', on: true },
          { t: 'Reflection', on: true }
        ],
        why: 'Your portfolio has your own work, your drafts and revisions, a peer feedback record, your tool-use declarations, and your reflection.'
      }]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan your reflection', bloom: 'Create',
      sub: 'A reflection tells what you learned and what is next. Use examples from your own writing.', does: 'Plan a reflection about your progress.',
      topic: 'My reflection on this course',
      slots: [
        { key: 'learned', mode: 'one', prompt: 'Choose the best sentence about what you learned.', options: [
          { t: 'In this course, I learned how to plan before I write.', ok: true, why: 'It says something you learned.' },
          { t: 'The course is in a building.', ok: false, why: 'This is a fact. It is not something you learned.' },
          { t: 'I like Fridays.', ok: false, why: 'This is a different idea.' }
        ] },
        { key: 'better', mode: 'one', prompt: 'Choose the best sentence about what is better. Use an example.', options: [
          { t: 'My revised essay is better than my first draft because I added examples and fixed my verbs.', ok: true, why: 'It compares two pieces of your writing and gives examples.' },
          { t: 'My essay is good.', ok: false, why: 'This is too general. Give an example from your writing.' },
          { t: 'I wrote an essay.', ok: false, why: 'This is only a fact. It does not say what is better.' }
        ] },
        { key: 'goal', mode: 'one', prompt: 'Choose the best sentence about your next goal.', options: [
          { t: 'My next goal is to write faster and make fewer grammar mistakes.', ok: true, why: 'It is a clear and realistic goal.' },
          { t: 'Goals are important.', ok: false, why: 'This is general. Say your own goal.' },
          { t: 'I will never write again.', ok: false, why: 'This is not a goal for your writing.' }
        ] }
      ],
      plannerTitle: 'Your reflection plan',
      rows: [
        { label: 'What I learned', slot: 'learned', wait: 'Complete step 1' },
        { label: 'What is better in my writing', slot: 'better', wait: 'Complete step 2' },
        { label: 'My next goal', slot: 'goal', wait: 'Complete step 3' }
      ],
      afterText: 'Your plan is ready. Now write your own reflection in your workbook, page {p3}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p1}. Review, revise, and build your portfolio.',
      task: 'Peer review your partner’s essay with the Peer Feedback Sheet on page {peer}. Write your revision plan with at least 5 changes on page {p2}. Revise your essay on separate paper or in a typed document, and attach it to your portfolio. Keep your first draft. Then write your reflection and complete the portfolio checklist on page {p3} (see also page {port}).',
      framesTitle: 'Sentence starters',
      frames: ['I like ______ because ______.', 'Your thesis is ______. / Your thesis could be clearer because ______.', 'Please add an example to ______.', 'I do not understand ______. Can you explain?', 'Check the verbs in paragraph ______.'],
      levels: [
        { level: 'A1', text: 'Write a guided reflection with frames: 3 to 5 sentences.' },
        { level: 'A2', text: 'Write a reflection of 100 to 130 words.' },
        { level: 'B1', text: 'Quote a before-and-after example from your own writing in your reflection.' }
      ],
      checklist: [
        'Diagnostic paragraph and writer inventory (Unit 1)',
        'Two paragraphs: first draft and revised version (for example Units 4 and 5)',
        'One paragraph from Units 6 to 11 (my best pattern paragraph)',
        'Essay outline and thesis (Unit 12)',
        'First essay draft and revised essay (Units 14 and 15)',
        'At least one peer feedback record',
        'Tool-use declarations on each piece',
        'Reflection'
      ],
      selfStudy: 'Put everything in your folder. Keep your first draft and your revised essay. Bring your portfolio on the date your teacher tells you.',
      reminder: 'Remember: write your own work, and write your tool-use declaration.'
    }
  ],

  exit: {
    outcome: 'I can give useful feedback, revise my essay, and show my progress in a portfolio.',
    questions: [
      { q: 'Which comment is the best peer feedback?', options: ['Good job. I like your essay. It is very good.', 'Your thesis is clear. Please add an example to paragraph 2.', 'Not good. You must write the whole essay again.'], answer: 1 },
      { q: 'What do you write for each change in your revision plan?', options: ['Nothing, because the teacher knows.', 'Only the date of the change.', 'What I changed and why.'], answer: 2 }
    ]
  }
};
