/* Unit 9: Comparison and Contrast. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 9,
  title: 'Comparison and Contrast',
  output: 'A comparison paragraph about two familiar things.',
  can: 'compare two things using a clear basis of comparison and connecting words.',
  bloom: 'Understand, Apply, Analyze, Create',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 8 before you start.', does: 'Remember how to explain steps and give feedback.',
      items: [
        { q: 'Which word usually starts the first step of a process?',
          options: ['First', 'Finally', 'However'], answer: 'First', why: 'First starts the steps. Finally starts the last step.' },
        { q: 'Good feedback says one thing that works and one thing to ___.',
          options: ['improve', 'copy', 'delete'], answer: 'improve', why: 'Good feedback is kind and specific: one strength and one suggestion.' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'Same and different', bloom: 'Understand',
      photos: [
        { file: 'pow-u9-home.jpg', alt: 'A family eats dinner together at a table in a home.', caption: 'Living at home' },
        { file: 'pow-u9-dorm.jpg', alt: 'Two students study at desks in a small dormitory room.', caption: 'Living in a dormitory' }
      ],
      sub: 'Compare two things on the same points.', does: 'Learn how to compare two things.',
      points: [
        'Compare = how two things are the same. Contrast = how they are different.',
        'Choose a basis of comparison: price, size, speed, comfort, location. Compare both things on the same basis.',
        'Organize by point: first price (A and B), then comfort (A and B). Or by subject: all of A, then all of B.',
        'Use connectors: both, also, similarly, but, however, while, whereas, on the other hand.'
      ],
      models: [{
        title: 'Model paragraph: home or dormitory',
        sentences: [
          { text: 'Living at home and living in a dormitory are different in several ways.', kind: 'k1', tag: 'TS', note: 'The topic sentence names both things: living at home and living in a dormitory.' },
          { text: 'First, living at home is usually cheaper because students do not pay rent.', kind: 'k2', tag: 'Cost', note: 'Basis 1: cost. Home is cheaper.' },
          { text: 'However, a dormitory is closer to the university, so students save time on travel.', kind: 'k2', tag: 'Distance', note: 'Basis 2: distance. However shows a contrast.' },
          { text: 'Both choices have good food: at home, family members cook, while in a dormitory, students can buy cheap meals nearby.', kind: 'k2', tag: 'Food', note: 'Basis 3: food. Both shows a similarity. While shows a difference.' },
          { text: 'Also, at home you share the house with your family, whereas in a dormitory you meet many new friends.', kind: 'k2', tag: 'People', note: 'Basis 4: people. Whereas shows a difference.' },
          { text: 'In conclusion, home is cheaper and more comfortable, but a dormitory is more convenient and more social.', kind: 'k3', tag: 'CS', note: 'The closing sentence gives the overall view.' }
        ],
        after: 'Notice: both things are compared on every point: cost, distance, food, and people.'
      }],
      lang: {
        title: 'Comparison language',
        rows: [
          ['Same', 'both, also, similarly, too, like'],
          ['Different', 'but, however, while, whereas, on the other hand'],
          ['Comparatives', 'cheaper than, more comfortable than, bigger than'],
          ['Superlative end', 'the best, the most important']
        ]
      }
    },
    {
      id: 'sort', type: 'choose', title: 'Sort the facts', bloom: 'Analyze',
      sub: 'Compare a coffee shop and the library.', does: 'Sort facts into same and different.',
      options: [{ v: 'CS', label: 'Coffee shop only' }, { v: 'L', label: 'Library only' }, { v: 'B', label: 'Both' }],
      hint: 'Not this one. Think: can you do this in both places, or only in one?',
      items: [
        { q: 'You can talk loudly.', answer: 'CS', why: 'You can talk loudly in a coffee shop, but not in the library.' },
        { q: 'You can borrow books.', answer: 'L', why: 'You borrow books at the library.' },
        { q: 'You can sit and study.', answer: 'B', why: 'You can sit and study in both places.' },
        { q: 'You can buy drinks easily.', answer: 'CS', why: 'A coffee shop sells drinks. Most libraries do not.' },
        { q: 'You must keep quiet.', answer: 'L', why: 'The library has a quiet rule.' },
        { q: 'You can meet friends.', answer: 'B', why: 'You can meet friends in both places.' }
      ]
    },
    {
      id: 'join', type: 'choose', title: 'Join the ideas', bloom: 'Apply',
      sub: 'Use a comparison word to join two ideas.', does: 'Join ideas with comparison words.',
      prompt: 'Choose the best sentence. In your workbook you write the combined sentence yourself.',
      hint: 'Not this one. Check the comma and the connecting word.',
      items: [
        { lead: 'Patong is busy. Kata is quiet. (while)', q: 'Which sentence is correct?',
          options: ['Patong is busy, while Kata is quiet.', 'Patong is busy while, Kata is quiet.', 'Patong is busy, because Kata is quiet.'],
          answer: 'Patong is busy, while Kata is quiet.', why: 'While shows a difference. Put a comma before it.' },
        { lead: 'Tea is cheap. Coffee is expensive. (but)', q: 'Which sentence is correct?',
          options: ['Tea is cheap, but coffee is expensive.', 'Tea is cheap but, coffee is expensive.', 'Tea is cheap, so coffee is expensive.'],
          answer: 'Tea is cheap, but coffee is expensive.', why: 'But shows a difference. Put a comma before it.' },
        { lead: 'Trains are fast. Buses are slow. (However, ...)', q: 'Which sentence is correct?',
          options: ['Trains are fast. However, buses are slow.', 'Trains are fast, however, buses are slow.', 'Trains are fast. However buses are slow.'],
          answer: 'Trains are fast. However, buses are slow.', why: 'However starts a new sentence. Put a comma after it.' },
        { lead: 'My phone is light. My laptop is light. (Both ...)', q: 'Which sentence is correct?',
          options: ['Both my phone and my laptop are light.', 'Both my phone and my laptop is light.', 'Both my phone but my laptop are light.'],
          answer: 'Both my phone and my laptop are light.', why: 'Both ... and ... shows a similarity. Two things need the verb are.' }
      ]
    },
    {
      id: 'basis', type: 'pick', title: 'Same basis for both', bloom: 'Analyze',
      sub: 'A fair comparison uses the same basis for both things.', does: 'Check that both things are compared on the same basis.',
      prompt: 'You compare tea and coffee on price. Tap the 2 sentences that compare them on price. Then tap Check.',
      flag: 'compares price',
      hint: 'Ask: does it tell the price?',
      sets: [{
        items: [
          { t: 'Tea costs 20 baht.', on: true },
          { t: 'Tea comes from leaves.', on: false },
          { t: 'Coffee costs 60 baht.', on: true },
          { t: 'Coffee is popular in the morning.', on: false }
        ],
        why: 'Only these two sentences give the price of each drink. That is the same basis for both.'
      }]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan it', bloom: 'Apply',
      sub: 'Plan a comparison in 3 small steps. Use short notes.', does: 'Plan a comparison paragraph.',
      topic: 'Studying alone and studying in a group',
      slots: [
        { key: 'ts', mode: 'one', prompt: 'Choose the best topic sentence. It names both things.', options: [
          { t: 'Studying alone and studying in a group are different.', ok: true, why: 'It names both things and says they are different.' },
          { t: 'I study alone.', ok: false, why: 'This names only one thing.' },
          { t: 'Group study is good.', ok: false, why: 'This names only one thing. It does not compare.' }
        ] },
        { key: 'basis', mode: 'many', count: 3, prompt: 'Choose 3 points you can compare for both things.',
          hint: 'Ask: can I say something about both studying alone and studying in a group?',
          whyOk: 'You can compare both ways of studying on these three points.',
          options: [
            { t: 'noise: alone is quieter, a group is noisier', ok: true },
            { t: 'the color of my notebook', ok: false },
            { t: 'help: a group explains hard ideas', ok: true },
            { t: 'my favorite food', ok: false },
            { t: 'time: alone at any time, a group needs a meeting time', ok: true },
            { t: 'the name of my university', ok: false }
          ] },
        { key: 'view', mode: 'one', prompt: 'Choose the best closing sentence. It gives your overall view.', options: [
          { t: 'In my opinion, studying alone is better for memorizing, while a group is better for hard topics.', ok: true, why: 'It gives your overall view and compares both ways.' },
          { t: 'I also like tea.', ok: false, why: 'This is a different idea.' },
          { t: 'Groups have more people.', ok: false, why: 'This is only one fact. It does not give your overall view.' }
        ] }
      ],
      rows: [
        { label: 'Topic sentence', slot: 'ts', wait: 'Complete step 1' },
        { label: 'Basis 1', slot: 'basis', i: 0, wait: 'Complete step 2' },
        { label: 'Basis 2', slot: 'basis', i: 1, wait: 'Complete step 2' },
        { label: 'Basis 3', slot: 'basis', i: 2, wait: 'Complete step 2' },
        { label: 'Closing view', slot: 'view', wait: 'Complete step 3' }
      ],
      afterText: 'Your plan is ready. Now make your own comparison chart in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Make a chart first. Then write on page {p3}.',
      task: 'Write a comparison paragraph about two things. Use a clear basis of comparison, at least 3 similarities or differences, and 3 comparison connectors.',
      topics: ['Two places in Phuket (or two places I know)', 'Studying alone and studying in a group', 'Two ways to travel to the university'],
      framesTitle: 'Useful frames',
      frames: ['______ and ______ are different in several ways.', 'Both ______ and ______ are ______.', '______ is ______, while ______ is ______.', '______ is ______, but ______ is ______.', 'In conclusion, ______.'],
      levels: [
        { level: 'A1', text: '60 to 80 words. Write 2 similarities or differences with but and and.' },
        { level: 'A2', text: '100 to 120 words.' },
        { level: 'B1', text: '130 to 160 words. Use comparatives and connectors in different places.' }
      ],
      checklist: [
        'My topic sentence names both things.',
        'I chose a clear basis of comparison.',
        'I wrote at least 3 similarities or differences.',
        'I used at least 3 connectors.',
        'I compared both things each time.',
        'My closing sentence gives my overall view.'
      ],
      selfStudy: 'Make a comparison chart for your topic. Then draft the paragraph. Check each connector: is the comma in the right place?'
    }
  ],

  exit: {
    outcome: 'I can compare two things using a clear basis of comparison and connecting words.',
    questions: [
      { q: 'Which sentence shows a difference?', options: ['Both tea and coffee are very popular drinks.', 'Tea and coffee are drinks that many people like.', 'Tea is cheap, but coffee is expensive.'], answer: 2 },
      { q: 'Which word shows two things are the same?', options: ['Both', 'However', 'Whereas'], answer: 0 }
    ]
  }
};
