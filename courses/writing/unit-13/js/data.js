/* Unit 13: Essay Structure: Introduction, Body, Conclusion. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 13,
  title: 'Essay Structure: Introduction, Body, Conclusion',
  output: 'An introduction with a thesis, one body paragraph (timed), and a conclusion for one essay.',
  can: 'write an introduction, a body paragraph, and a conclusion that fit together.',
  bloom: 'Analyze, Apply, Create',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 12 before you start.', does: 'Remember what a thesis is.',
      items: [
        { q: 'What does a thesis tell the reader?',
          options: ['The main idea of the whole essay.', 'The title of the essay and the name.', 'The last example in the last paragraph.'],
          answer: 'The main idea of the whole essay.', why: 'The thesis tells the main idea of the whole essay.' },
        { q: 'The body points must ___ the thesis.',
          options: ['match', 'change', 'replace'], answer: 'match', why: 'Each body paragraph explains one point from the thesis.' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'Introduction, body, conclusion', bloom: 'Understand',
      sub: 'Each part of an essay has a job.', does: 'Meet the jobs of the three parts of an essay.',
      points: [
        'Introduction: a general statement, some background, and the thesis (last sentence).',
        'Body paragraph: topic sentence, details and examples, closing sentence.',
        'Conclusion: restate the thesis in new words, summarize the main points, and give a final thought.',
        'Use linking words between paragraphs: First, Second, Third, In addition, In conclusion.',
        'Practice timing: write one body paragraph in 25 minutes.'
      ],
      models: [{
        title: 'Model essay: why students should learn English',
        hint: 'Tap each sentence. See its job in the essay.',
        sentences: [
          { text: 'English is used all over the world.', kind: 'k1', tag: 'Intro: general', note: 'A general statement. It starts the introduction.' },
          { text: 'Many students in Thailand study it, but some do not know why it is important.', kind: 'k1', tag: 'Intro: background', note: 'Background. It gives the reader some information about the topic.' },
          { text: 'Students should learn English because it helps them get good jobs, travel with confidence, and use the internet.', kind: 'k1', tag: 'Thesis', note: 'The thesis is the last sentence of the introduction. It names the three body points.' },
          { text: 'First, English helps students get good jobs.', kind: 'k2', tag: 'Body 1: topic', note: 'The topic sentence of the first body paragraph. First is a linking word.' },
          { text: 'Many companies in Phuket, such as hotels and tour agencies, want workers who speak English.', kind: 'k2', tag: 'Body 1: detail', note: 'A detail that supports the point.' },
          { text: 'For example, a hotel receptionist talks to guests from many countries every day.', kind: 'k2', tag: 'Body 1: example', note: 'An example makes the detail real.' },
          { text: 'Second, English makes travel easier.', kind: 'k2', tag: 'Body 2: topic', note: 'The topic sentence of the second body paragraph. Second is a linking word.' },
          { text: 'When students go to other countries, they can ask for directions, order food, and make new friends.', kind: 'k2', tag: 'Body 2: detail', note: 'Details that support the point.' },
          { text: 'Third, English opens the internet.', kind: 'k2', tag: 'Body 3: topic', note: 'The topic sentence of the third body paragraph. Third is a linking word.' },
          { text: 'Many websites, videos, and online courses are in English, so students can learn almost anything for free.', kind: 'k2', tag: 'Body 3: detail', note: 'A detail that supports the point.' },
          { text: 'In conclusion, learning English gives students better jobs, easier travel, and more knowledge.', kind: 'k3', tag: 'Conclusion: thesis', note: 'The conclusion repeats the thesis in new words.' },
          { text: 'Therefore, every student should study English hard.', kind: 'k3', tag: 'Conclusion: final thought', note: 'A final thought. Do not add a new idea in the conclusion.' }
        ],
        after: 'Notice: the introduction ends with the thesis. Each body paragraph starts with a linking word and one main point. The conclusion repeats the thesis in new words.'
      }],
      lang: {
        title: 'Essay language',
        rows: [
          ['Introduction', '______ is ______ all over the world.  /  Many people ______.'],
          ['Between paragraphs', 'First, ...  Second, ...  Third, ...  In addition, ...'],
          ['Conclusion', 'In conclusion, ...  /  To sum up, ...  /  Therefore, ...']
        ]
      }
    },
    {
      id: 'label', type: 'choose', title: 'Label the sentences', bloom: 'Analyze',
      sub: 'These sentences come from the model essay.', does: 'Name the part of the essay for each sentence.',
      options: [{ v: 'I', label: 'Introduction' }, { v: 'B', label: 'Body' }, { v: 'C', label: 'Conclusion' }],
      hint: 'Not this one. Think about what the sentence does in the essay.',
      items: [
        { q: 'English is used all over the world.', answer: 'I', why: 'It is a general statement. It starts the introduction.' },
        { q: 'Second, English makes travel easier.', answer: 'B', why: 'It is the topic sentence of the second body paragraph.' },
        { q: 'Students should learn English because it helps them get good jobs, travel with confidence, and use the internet.', answer: 'I', why: 'It is the thesis. The thesis is the last sentence of the introduction.' },
        { q: 'Many websites, videos, and online courses are in English.', answer: 'B', why: 'It is a detail in the third body paragraph.' },
        { q: 'In conclusion, learning English gives students better jobs, easier travel, and more knowledge.', answer: 'C', why: 'It repeats the thesis in new words. It starts the conclusion.' },
        { q: 'Therefore, every student should study English hard.', answer: 'C', why: 'It is the final thought of the conclusion.' }
      ]
    },
    {
      id: 'order', type: 'order', title: 'Put the essay parts in order', bloom: 'Analyze',
      sub: 'The parts of an essay follow a clear order.', does: 'Put the parts of an essay in order.',
      prompt: 'Tap the parts in the order they appear in an essay.',
      hint: 'An essay starts with the introduction and ends with the conclusion.',
      sets: [{
        items: [
          'Introduction: general statement and background',
          'Thesis: the last sentence of the introduction',
          'Body paragraph 1',
          'Body paragraph 2',
          'Body paragraph 3',
          'Conclusion: the thesis in new words, and a final thought'
        ],
        why: 'The introduction comes first. The thesis ends the introduction. Then come the body paragraphs. The conclusion comes last.'
      }]
    },
    {
      id: 'conclusion', type: 'choose', title: 'Choose the best conclusion', bloom: 'Apply',
      sub: 'A conclusion matches the thesis. It does not add a new idea.', does: 'Choose a conclusion that matches the thesis.',
      hint: 'Not this one. A conclusion repeats the thesis in new words. It does not start a new idea.',
      items: [
        { lead: 'Thesis: Students should exercise regularly because it improves health, mood, and study results.', q: 'Which is the best conclusion?',
          options: ['Exercise is a topic that many people like to talk about at school.', 'In conclusion, regular exercise gives students better health, mood, and results.', 'I also like soccer and swimming, and I play them on weekends.'],
          answer: 'In conclusion, regular exercise gives students better health, mood, and results.', why: 'It repeats the thesis in new words. It matches the three points.' },
        { lead: 'The three body points are money, responsibility, and friends.', q: 'Which sentence is the best conclusion?',
          options: ['In conclusion, jobs give students money, responsibility, and friends.', 'Another reason is that jobs are near the university.', 'Coffee is a popular drink in many countries around the world.'],
          answer: 'In conclusion, jobs give students money, responsibility, and friends.', why: 'It matches the three body points. The other choices add a new idea.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan the frame', bloom: 'Apply',
      sub: 'Build the frame of an essay. Choose the right sentence for each part.', does: 'Build the introduction and conclusion frame.',
      topic: 'Why students should learn English',
      slots: [
        { key: 'general', mode: 'one', prompt: 'Choose the best general statement for the introduction.', options: [
          { t: 'English is used all over the world.', ok: true, why: 'It is a general statement. It starts the introduction.' },
          { t: 'First, English helps students get good jobs.', ok: false, why: 'This is the topic sentence of a body paragraph.' },
          { t: 'In conclusion, English is useful.', ok: false, why: 'This belongs in the conclusion.' }
        ] },
        { key: 'background', mode: 'one', prompt: 'Choose the best background sentence.', options: [
          { t: 'Many students in Thailand study it, but some do not know why it is important.', ok: true, why: 'It gives background about the topic and leads to the thesis.' },
          { t: 'Tourism is good for Phuket.', ok: false, why: 'This is a different topic.' },
          { t: 'Therefore, every student should study English hard.', ok: false, why: 'This is a final thought. It belongs in the conclusion.' }
        ] },
        { key: 'concl', mode: 'one', prompt: 'Choose the best sentence to restate the thesis in the conclusion.', options: [
          { t: 'In conclusion, learning English gives students better jobs, easier travel, and more knowledge.', ok: true, why: 'It repeats the thesis in new words.' },
          { t: 'Another reason is the internet.', ok: false, why: 'This adds a new reason. A conclusion does not add new ideas.' },
          { t: 'English is used all over the world.', ok: false, why: 'This is the general statement of the introduction.' }
        ] },
        { key: 'final', mode: 'one', prompt: 'Choose the best final thought.', options: [
          { t: 'Therefore, every student should study English hard.', ok: true, why: 'It is a final thought that matches the thesis.' },
          { t: 'I like pizza.', ok: false, why: 'This is a different idea.' },
          { t: 'First, English helps students get good jobs.', ok: false, why: 'This is the topic sentence of a body paragraph.' }
        ] }
      ],
      rows: [
        { label: 'General statement', slot: 'general', wait: 'Complete step 1' },
        { label: 'Background', slot: 'background', wait: 'Complete step 2' },
        { label: 'Thesis (from Unit 12)', fixed: 'Students should learn English because it helps them get good jobs, travel with confidence, and use the internet.' },
        { label: 'Conclusion: restate the thesis', slot: 'concl', wait: 'Complete step 3' },
        { label: 'Final thought', slot: 'final', wait: 'Complete step 4' }
      ],
      afterText: 'Your frame is ready. Now write your own frame in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Plan first. Then write on page {p3}.',
      task: 'Use your Unit 12 outline. Write (1) your introduction, (2) one body paragraph in 25 minutes, and (3) your conclusion. Use a visible timer for the body paragraph.',
      topics: ['Use the topic of your Unit 12 outline'],
      framesTitle: 'Essay language',
      frames: ['______ is ______ all over the world.', 'Many people ______.', 'First, ______. Second, ______. Third, ______.', 'In conclusion, ______.', 'Therefore, ______.'],
      levels: [
        { level: 'A1', text: 'Introduction 3 sentences. Body 5. Conclusion 2.' },
        { level: 'A2', text: 'Introduction 3 to 4. Body 6 to 8. Conclusion 3.' },
        { level: 'B1', text: 'Introduction 4. Body 8 to 10. Conclusion 3 to 4.' }
      ],
      checklist: [
        'The thesis is the last sentence of the introduction.',
        'The body paragraph has a topic sentence and details.',
        'The conclusion matches the thesis.',
        'I used linking words between parts.',
        'I finished the body paragraph in 25 minutes.'
      ],
      selfStudy: 'Draft the other two body paragraphs at home. Keep your outline beside you and check each point against the thesis.'
    }
  ],

  exit: {
    outcome: 'I can write an introduction, a body paragraph, and a conclusion that fit together.',
    questions: [
      { q: 'Which part comes at the end of the introduction?', options: ['A final thought', 'The first body paragraph', 'The thesis'], answer: 2 },
      { q: 'What should a conclusion NOT have?', options: ['A new idea', 'The thesis in new words', 'A final thought'], answer: 0 }
    ]
  }
};
