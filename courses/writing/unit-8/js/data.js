/* Unit 8: Process Writing and Peer Feedback. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 8,
  title: 'Process Writing and Peer Feedback',
  output: 'A process paragraph and a completed peer feedback sheet.',
  can: 'explain the steps of a process in order, and give a classmate useful feedback.',
  bloom: 'Apply, Analyze, Evaluate',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 7 before you start.', does: 'Remember past tense verbs and time markers.',
      items: [
        { q: 'Which sentence is correct?',
          options: ['We saw a movie last night.', 'We seed a movie last night.', 'We see a movie last night.'],
          answer: 'We saw a movie last night.', why: 'See is irregular. The past of see is saw.' },
        { q: 'Which word tells the reader the order of events?',
          options: ['Then', 'Because', 'However'], answer: 'Then', why: 'First, then, after that, and finally show the order of events.' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'Explain the steps', bloom: 'Understand',
      photo: { file: 'pow-u8-tea.jpg', alt: 'A glass of Thai iced tea with milk. Next to it are a teapot, a strainer, and tea leaves.', caption: 'Thai iced tea, the process in the model paragraph. The tea leaves and the strainer are used in the first steps.' },
      sub: 'A process paragraph explains how to do something, step by step.', does: 'Learn how to explain a process and give good feedback.',
      points: [
        'Start with a topic sentence that says what the process is and why it matters.',
        'Use order words: first, next, then, after that, finally.',
        'Use simple commands (boil, add, open) or “you can ...”. Keep the steps in the correct order.',
        'Good feedback is kind, specific, and helpful: say one thing that works and one thing to improve.'
      ],
      models: [
        {
          title: 'Model paragraph: Thai iced tea',
          sentences: [
            { text: 'Thai iced tea is easy to make at home.', kind: 'k1', tag: 'TS', note: 'The topic sentence names the process.' },
            { text: 'First, boil water and add Thai tea leaves.', kind: 'k2', tag: 'Step 1', note: 'First starts the steps. Boil and add are commands.' },
            { text: 'Wait for five minutes, then pour the tea through a strainer.', kind: 'k2', tag: 'Step 2', note: 'This step has a time (five minutes) and an action (pour).' },
            { text: 'Next, add sugar while the tea is hot and stir well.', kind: 'k2', tag: 'Step 3', note: 'Next shows the next step. While gives a time detail.' },
            { text: 'After that, let it cool for a few minutes.', kind: 'k2', tag: 'Step 4', note: 'After that shows the next step.' },
            { text: 'Then fill a glass with ice and pour in the tea.', kind: 'k2', tag: 'Step 5', note: 'Then shows the next step.' },
            { text: 'Finally, add a little milk on top.', kind: 'k2', tag: 'Step 6', note: 'Finally shows the last step.' },
            { text: 'Now your Thai iced tea is ready to drink.', kind: 'k3', tag: 'Result', note: 'The last sentence tells the result.' }
          ],
          after: 'Notice: each sentence is one step, and the steps are in order.'
        },
        {
          title: 'Feedback: one strength, one suggestion',
          hint: 'Tap each comment. Is it useful?',
          sentences: [
            { text: 'Good.', kind: 'k3', tag: 'Not useful', note: 'This does not say what is good or what to improve.' },
            { text: 'Your topic sentence names the process clearly.', kind: 'k2', tag: 'Strength', note: 'This says one specific thing that works.' },
            { text: 'Please add one more step. How long do I wait?', kind: 'k1', tag: 'Suggestion', note: 'This is kind and specific. It tells the writer what to add.' }
          ]
        }
      ],
      lang: {
        title: 'Process language',
        rows: [
          ['Order', 'first, next, then, after that, finally'],
          ['Commands', 'boil, add, pour, open, click, write, wait, stir'],
          ['Time', 'for five minutes, until it is soft, while it is hot'],
          ['Result', 'Now it is ready. / That is how you ______.']
        ]
      }
    },
    {
      id: 'order', type: 'order', title: 'Order the steps', bloom: 'Analyze',
      sub: 'The steps must be in the right order.', does: 'Put the steps of a process in order.',
      prompt: 'These are the steps for borrowing a book from the library. Tap them in the right order.',
      hint: 'Think: first find the book, then take it to the desk, then return it.',
      sets: [{
        items: [
          'Search for the book on the library computer.',
          'Write down the book number.',
          'Walk to the correct shelf and find the book.',
          'Take the book to the front desk.',
          'Show your student card at the desk.',
          'Return the book after seven days.'
        ],
        why: 'You search, write the number, find the book, go to the desk, show your card, and return the book later.'
      }]
    },
    {
      id: 'connectors', type: 'choose', title: 'Add the order words', bloom: 'Apply',
      sub: 'Which order word starts each step?', does: 'Choose the right order word for each step.',
      prompt: 'These are the steps for logging in to the university website.',
      options: ['First', 'Next', 'Then', 'Finally'],
      hint: 'Not this one. Think about the order. Which step is first? Which is last?',
      items: [
        { q: '___, turn on your computer.', answer: 'First', why: 'This is the first step.' },
        { q: '___, open the university website.', answer: 'Next', why: 'This step comes after turning on the computer.' },
        { q: '___, type your student ID and password.', answer: 'Then', why: 'This step comes after opening the website.' },
        { q: '___, click the Login button.', answer: 'Finally', why: 'This is the last step.' }
      ]
    },
    {
      id: 'feedback', type: 'choose', title: 'Useful feedback', bloom: 'Evaluate',
      sub: 'Choose the comment that helps the writer most.', does: 'Choose useful peer feedback.',
      prompt: 'Your partner wrote a process paragraph. Which comment is the most useful?',
      hint: 'Not this one. A useful comment is kind and specific. It says what works or what to improve.',
      items: [
        { q: 'Which comment says what works?',
          options: ['Good job! I like your paragraph. It is very good.', 'Your steps are in the right order. That makes it easy to follow.', 'I like it a lot. You did a very good job on it.'],
          answer: 'Your steps are in the right order. That makes it easy to follow.', why: 'It says what is good and why.' },
        { q: 'Which comment gives a helpful suggestion?',
          options: ['This is bad. You must write it again, please.', 'Write the whole paragraph again from the start.', 'Please add one more step. How do I open the website?'],
          answer: 'Please add one more step. How do I open the website?', why: 'It is kind and tells the writer what to add.' },
        { q: 'Which comment is the best?',
          options: ['The writing is not good. You need to write again.', 'Your topic sentence names the process. Can you add a closing sentence?', 'Everything is wrong. Please start the paragraph again.'],
          answer: 'Your topic sentence names the process. Can you add a closing sentence?', why: 'It gives one strength and one suggestion.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan it', bloom: 'Apply',
      sub: 'Plan a process in 3 small steps. Use short notes.', does: 'Plan a process paragraph.',
      topic: 'How to log in to the university website',
      slots: [
        { key: 'ts', mode: 'one', prompt: 'Choose the best topic sentence.', options: [
          { t: 'Logging in to the university website is easy when you follow four steps.', ok: true, why: 'It names the process and tells how many steps.' },
          { t: 'The university has a website.', ok: false, why: 'This is only a fact. It does not name the process.' },
          { t: 'I like my computer.', ok: false, why: 'This is about a different topic.' }
        ] },
        { key: 'steps', mode: 'many', count: 4, prompt: 'Choose the 4 steps of the process. They are in the right order.',
          hint: 'Ask: is it a step to log in to the website?',
          whyOk: 'These four steps are in the right order. Each is one clear action.',
          options: [
            { t: 'turn on your computer', ok: true },
            { t: 'open the university website', ok: true },
            { t: 'buy a new keyboard', ok: false },
            { t: 'type your student ID and password', ok: true },
            { t: 'drink some tea', ok: false },
            { t: 'click the Login button', ok: true }
          ] },
        { key: 'result', mode: 'one', prompt: 'Choose the best closing sentence. It tells the result.', options: [
          { t: 'Now you are in your student account.', ok: true, why: 'It tells the result of the process.' },
          { t: 'Computers are very expensive.', ok: false, why: 'This is a different idea. It is not the result of the steps.' },
          { t: 'I log in every day.', ok: false, why: 'This is about your habit. It does not tell the result.' }
        ] }
      ],
      rows: [
        { label: 'Topic sentence', slot: 'ts', wait: 'Complete step 1' },
        { label: 'First', slot: 'steps', i: 0, wait: 'Complete step 2' },
        { label: 'Next', slot: 'steps', i: 1, wait: 'Complete step 2' },
        { label: 'Then', slot: 'steps', i: 2, wait: 'Complete step 2' },
        { label: 'Finally', slot: 'steps', i: 3, wait: 'Complete step 2' },
        { label: 'Result', slot: 'result', wait: 'Complete step 3' }
      ],
      afterText: 'Your plan is ready. Now make your own plan in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Plan first. Then write on page {p3}.',
      task: 'Write a process paragraph. Use your plan. Then complete the Peer Feedback Sheet for a classmate (see page {peer}).',
      topics: ['How to make a food or drink I know', 'How to do a task on my phone or computer', 'How to get ready for an exam'],
      framesTitle: 'Useful frames',
      frames: ['______ is easy to do if you follow these steps.', 'First, ______.', 'Next, ______.', 'After that, ______.', 'Finally, ______.', 'Now it is ready. / That is how you ______.'],
      levels: [
        { level: 'A1', text: '60 to 80 words. Short commands are fine: “Boil water. Add tea.”' },
        { level: 'A2', text: '100 to 120 words.' },
        { level: 'B1', text: '130 to 160 words. Add a warning or a tip.' }
      ],
      checklist: [
        'My topic sentence names the process.',
        'I wrote at least 5 steps, in the correct order.',
        'I used order words and a comma after them.',
        'Each step is clear enough for a beginner.',
        'I wrote a closing sentence.',
        'I gave my classmate one strength and one suggestion.'
      ],
      selfStudy: 'Revise your paragraph after peer comments. Then practice one 20-minute timed paragraph on the Timed Writing page (page {timed}). This helps you prepare for the exams.'
    }
  ],

  exit: {
    outcome: 'I can explain the steps of a process in order, and I can give a classmate useful feedback.',
    questions: [
      { q: 'Which sentence is the best peer feedback?', options: ['Good job. I like your paragraph a lot. Well done.', 'I do not like it. It is not a good paragraph.', 'Your steps are in order. Please add the time for Step 3.'], answer: 2 },
      { q: 'Which word usually starts the last step?', options: ['First', 'Finally', 'Next'], answer: 1 }
    ]
  }
};
