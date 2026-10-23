/* Unit 12: From Paragraph to Essay. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 12,
  title: 'From Paragraph to Essay',
  output: 'An essay outline with a working thesis statement.',
  can: 'write a thesis statement and plan the parts of a short essay.',
  bloom: 'Understand, Analyze, Apply, Create',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 11 before you start.', does: 'Remember claims, reasons, and examples.',
      items: [
        { q: 'Which phrase shows another view?',
          options: ['Some people think ... However, ...', 'In my opinion, I believe that ...', 'For example, for instance, ...'],
          answer: 'Some people think ... However, ...', why: 'This phrase shows that you know another view and then you answer it.' },
        { q: 'Which sentence is correct?',
          options: ['I agree with this idea.', 'I am agree with this idea.', 'I agreeing with this idea.'],
          answer: 'I agree with this idea.', why: 'Agree is a verb. Say “I agree”, not “I am agree”.' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'The parts of an essay', bloom: 'Understand',
      sub: 'An essay has three parts, and the thesis is its main idea.', does: 'Learn the parts of an essay and what a thesis does.',
      points: [
        'An essay has three parts: introduction, body, and conclusion.',
        'The introduction ends with a thesis statement. The thesis tells the main idea of the whole essay and often lists the main points.',
        'Each body paragraph explains one main point of the thesis.',
        'The conclusion repeats the thesis in new words and gives a final thought.',
        'A good thesis is an opinion or a claim, not only a fact or an announcement.'
      ],
      models: [{
        title: 'Model essay map: why students should learn English',
        sentences: [
          { text: 'Topic: Why students should learn English', kind: 'k1', tag: 'Topic', note: 'The topic is what the essay is about.' },
          { text: 'Thesis: Students should learn English because it helps them get good jobs, travel with confidence, and use the internet.', kind: 'k1', tag: 'Thesis', note: 'The thesis is a claim. It names the three body points.' },
          { text: 'Body 1: good jobs (hotels and tour companies need English)', kind: 'k2', tag: 'Body 1', note: 'The first body paragraph explains the first point of the thesis.' },
          { text: 'Body 2: travel (ask for directions, order food, make friends)', kind: 'k2', tag: 'Body 2', note: 'The second body paragraph explains the second point of the thesis.' },
          { text: 'Body 3: the internet (websites, videos, and free online courses)', kind: 'k2', tag: 'Body 3', note: 'The third body paragraph explains the third point of the thesis.' },
          { text: 'Conclusion: English gives better jobs, easier travel, and more knowledge.', kind: 'k3', tag: 'Conclusion', note: 'The conclusion repeats the thesis in new words.' }
        ],
        after: 'Notice: the thesis names the three body points. The body points are in the same order as the thesis. The conclusion matches the thesis.'
      }],
      lang: {
        title: 'Thesis frames',
        lines: [
          '______ should ______ because ______, ______, and ______.',
          'There are three reasons why ______: first, ______; second, ______; third, ______.',
          'In my opinion, ______ is important for three reasons.'
        ]
      }
    },
    {
      id: 'thesis', type: 'pick', title: 'Find the thesis', bloom: 'Analyze',
      sub: 'The thesis is the main idea of the whole essay.', does: 'Find the thesis statement in an introduction.',
      prompt: 'Each introduction has 3 sentences. Tap the thesis statement in each one. Then tap Check.',
      flag: 'thesis',
      hint: 'Ask: which sentence gives an opinion and names the main points?',
      sets: [
        { lead: 'Introduction 1',
          items: [
            { t: 'Many students work part-time.', on: false },
            { t: 'Some work in cafes and shops.', on: false },
            { t: 'Students should have part-time jobs because they earn money, learn skills, and meet new people.', on: true }
          ], why: 'The thesis is the last sentence. It gives an opinion and names three points.' },
        { lead: 'Introduction 2',
          items: [
            { t: 'Phuket welcomes visitors from all over the world.', on: false },
            { t: 'Hotels, restaurants, and tours give people jobs.', on: false },
            { t: 'Tourism is good for Phuket because it creates jobs, helps local businesses, and shares Thai culture.', on: true }
          ], why: 'The thesis is the last sentence. It gives an opinion and names three points.' },
        { lead: 'Introduction 3',
          items: [
            { t: 'Many people exercise in the morning.', on: false },
            { t: 'Others prefer the evening.', on: false },
            { t: 'Regular exercise helps students become healthier, happier, and more focused.', on: true }
          ], why: 'The thesis is the last sentence. It gives a claim and names three points.' }
      ]
    },
    {
      id: 'improve', type: 'choose', title: 'Improve the thesis', bloom: 'Apply',
      sub: 'A weak thesis is a fact or an announcement. Make it a clear opinion with reasons.', does: 'Choose a strong thesis.',
      prompt: 'Each thesis is weak. Choose the best new thesis. In your workbook you write the new thesis yourself.',
      hint: 'Not this one. A strong thesis gives an opinion and names three reasons.',
      items: [
        { lead: 'Phones are common.', q: 'Which thesis is the best?',
          options: ['Phones help students learn because they give information, tools, and ways to talk.', 'Phones are very common, and I like phones because they are so useful for me.', 'I will write about phones, and I will explain why people like them.'],
          answer: 'Phones help students learn because they give information, tools, and ways to talk.', why: 'It gives an opinion (phones help students learn) and names three reasons.' },
        { lead: 'I will write about exercise.', q: 'Which thesis is the best?',
          options: ['Students should exercise because it improves their health, mood, and results.', 'This essay is about exercise, and it will tell the reader about exercise.', 'Exercise is a good topic that many students like to talk about.'],
          answer: 'Students should exercise because it improves their health, mood, and results.', why: 'It gives an opinion and names three reasons. “I will write about ...” is only an announcement.' },
        { lead: 'Many things are good and bad about social media.', q: 'Which thesis is the best?',
          options: ['Social media has good things and bad things, and people use it every day.', 'Social media is harmful because it wastes time, hurts sleep, and affects confidence.', 'Social media is everywhere, and many students use it every day.'],
          answer: 'Social media is harmful because it wastes time, hurts sleep, and affects confidence.', why: 'It takes a clear side and names three reasons.' },
        { lead: 'Phuket has beaches.', q: 'Which thesis is the best?',
          options: ['Phuket has many beaches, and many visitors go there to swim every year.', 'Phuket is great for tourism because it has beautiful beaches, good food, and friendly people.', 'I like Phuket very much because it is a very nice place to visit.'],
          answer: 'Phuket is great for tourism because it has beautiful beaches, good food, and friendly people.', why: 'It gives an opinion and names three reasons. “Phuket has beaches” is only a fact.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan your outline', bloom: 'Apply',
      sub: 'Build an essay outline in 3 small steps.', does: 'Plan an essay outline.',
      topic: 'Why part-time jobs are good for students',
      slots: [
        { key: 'thesis', mode: 'one', prompt: 'Choose the best thesis statement.', options: [
          { t: 'Students should have part-time jobs because they earn money, learn responsibility, and make new friends.', ok: true, why: 'It gives an opinion and names three body points.' },
          { t: 'This essay is about part-time jobs.', ok: false, why: 'This is only an announcement. It does not give an opinion.' },
          { t: 'Many students have part-time jobs.', ok: false, why: 'This is only a fact. It does not give an opinion.' }
        ] },
        { key: 'points', mode: 'many', count: 3, prompt: 'Choose the 3 body points. They must match the thesis.',
          hint: 'Ask: is it one of the three points in the thesis?',
          whyOk: 'These three body points match the thesis: money, responsibility, and friends.',
          options: [
            { t: 'money: pay for books and food, learn to save', ok: true },
            { t: 'the color of a uniform', ok: false },
            { t: 'responsibility: arrive on time, finish tasks', ok: true },
            { t: 'my favorite song', ok: false },
            { t: 'friends: meet coworkers, practice communication', ok: true },
            { t: 'a very big city', ok: false }
          ] },
        { key: 'concl', mode: 'one', prompt: 'Choose the best conclusion idea.', options: [
          { t: 'Part-time jobs help students grow in many ways.', ok: true, why: 'It matches the thesis and does not add a new point.' },
          { t: 'I also like to read.', ok: false, why: 'This is a different idea.' },
          { t: 'Jobs are in cafes.', ok: false, why: 'This is a small fact. It does not match the thesis.' }
        ] }
      ],
      rows: [
        { label: 'Topic', fixed: 'Why part-time jobs are good for students' },
        { label: 'Thesis statement', slot: 'thesis', wait: 'Complete step 1' },
        { label: 'Body 1: point and details', slot: 'points', i: 0, wait: 'Complete step 2' },
        { label: 'Body 2: point and details', slot: 'points', i: 1, wait: 'Complete step 2' },
        { label: 'Body 3: point and details', slot: 'points', i: 2, wait: 'Complete step 2' },
        { label: 'Conclusion idea', slot: 'concl', wait: 'Complete step 3' }
      ],
      afterText: 'Your outline is ready. Now make your own outline in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Complete the outline.',
      task: 'Complete the outline. Write your thesis statement neatly on the lines on page {p3}. Check that the body points match the thesis.',
      topics: ['Why students should learn English', 'Why part-time jobs are good for students', 'Why Phuket is a good place for tourism'],
      framesTitle: 'Thesis frames',
      frames: ['______ should ______ because ______, ______, and ______.', 'There are three reasons why ______: first, ______; second, ______; third, ______.', 'In my opinion, ______ is important for three reasons.'],
      levels: [
        { level: 'A1', text: 'A thesis and 3 body points.' },
        { level: 'A2', text: 'A thesis, 3 points, and 2 details for each point.' },
        { level: 'B1', text: 'Add an example for each detail.' }
      ],
      checklist: [
        'My thesis is a clear opinion or claim.',
        'My thesis names my 3 main points.',
        'My 3 body points match my thesis.',
        'Each body point has 2 details.',
        'My conclusion idea matches my thesis.'
      ],
      selfStudy: 'Revise your outline after feedback. Read one model essay from the class page and label the thesis and the three body points.'
    }
  ],

  exit: {
    outcome: 'I can write a thesis statement and plan the parts of a short essay.',
    questions: [
      { q: 'Which sentence is a good thesis?', options: ['English is a language that many people speak all over the world.', 'This essay is about English, and it will tell the reader about English.', 'Students should learn English because it helps them get jobs, travel, and use the internet.'], answer: 2 },
      { q: 'Where does the thesis usually go?', options: ['At the end of the conclusion.', 'At the end of the introduction.', 'In the middle of the body.'], answer: 1 }
    ]
  }
};
