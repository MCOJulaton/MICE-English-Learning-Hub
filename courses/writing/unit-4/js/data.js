/* Unit 4: Unity and Paragraph Development. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 4,
  title: 'Unity and Paragraph Development',
  output: 'One unified paragraph, with a topic sentence, relevant details, and a closing sentence.',
  can: 'write a paragraph with one main idea and details that all match the main idea.',
  bloom: 'Apply, Analyze, Create',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 3 before you start.', does: 'Remember the parts of a paragraph.',
      items: [
        { q: 'What does the concluding sentence do?',
          options: ['It goes back to the main idea.', 'It starts a new idea.', 'It gives the first detail.'],
          answer: 'It goes back to the main idea.', why: 'The concluding sentence ends the paragraph. It goes back to the main idea.' },
        { q: 'Which sentence has a topic and a controlling idea?',
          options: ['Phuket Old Town.', 'Phuket Old Town is a great place for photos.', 'I went to Phuket Old Town last year.'],
          answer: 'Phuket Old Town is a great place for photos.',
          why: 'The topic is Phuket Old Town. The controlling idea is a great place for photos.' }
      ]
    },
    {
      id: 'unity', type: 'learn', title: 'One idea, strong details', bloom: 'Understand',
      sub: 'Every sentence must help the main idea.', does: 'Learn what unity is and how to make details specific.',
      points: [
        'A paragraph has unity when every sentence supports the main idea.',
        'Take out sentences that are about a different idea.',
        'Make details specific. Say who, what, where, or when, or give an example.'
      ],
      models: [
        {
          title: 'Model paragraph (unified)',
          sentences: [
            { text: 'My favorite place to study is the university library.', kind: 'k1', tag: 'TS', note: 'The topic sentence names the place and the idea: favorite place to study.' },
            { text: 'It is quiet, so I can focus on my work.', kind: 'k2', tag: 'D1', note: 'A specific detail: quiet. It explains why the library is good for study.' },
            { text: 'The air conditioning keeps the room cool, which helps me think clearly.', kind: 'k2', tag: 'D2', note: 'A specific detail: cool air. It explains why the library is good for study.' },
            { text: 'I can also find many books and use the free computers there.', kind: 'k2', tag: 'D3', note: 'A specific detail: books and free computers. It explains why the library is good for study.' },
            { text: 'Because of these things, I finish my homework faster in the library than at home.', kind: 'k3', tag: 'CS', note: 'The closing sentence goes back to the main idea.' }
          ],
          after: 'Notice: every detail explains why the library is good for study.'
        },
        {
          title: 'Weak and strong details',
          hint: 'Tap each sentence. Which one helps the reader more?',
          sentences: [
            { text: 'The library is good.', kind: 'k3', tag: 'Weak', note: 'This is too general. The reader asks: why is it good?' },
            { text: 'The library is quiet, so I can focus on my homework.', kind: 'k2', tag: 'Strong', note: 'This gives a reason: quiet. It also tells what you do: focus on your homework.' }
          ]
        }
      ],
      lang: {
        title: 'Ways to add detail',
        lines: ['For example, ______.', 'This helps me ______ because ______.', 'I can ______ there / in this way.', 'One reason is that ______.']
      }
    },
    {
      id: 'belong', type: 'pick', title: 'Take out what does not belong', bloom: 'Analyze',
      sub: 'One off-topic sentence breaks the unity.', does: 'Find the sentences that do not belong.',
      prompt: 'This paragraph is about a part-time job. Two sentences are about a different idea. Tap them. Then tap Check.',
      hint: 'Ask: is it about my part-time job?',
      sets: [{
        items: [
          { t: '(1) I have a part-time job at a cafe near the university.', on: false },
          { t: '(2) I work there on Saturdays and Sundays.', on: false },
          { t: '(3) My brother likes soccer very much.', on: true },
          { t: '(4) The job gives me money for my books and food.', on: false },
          { t: '(5) I also practice my English with foreign customers.', on: false },
          { t: '(6) The weather in April is very hot.', on: true },
          { t: '(7) My job helps me in many ways.', on: false }
        ],
        why: 'Sentences 3 and 6 are about soccer and the weather. All the other sentences are about the part-time job.'
      }]
    },
    {
      id: 'specific', type: 'choose', title: 'Make it specific', bloom: 'Apply',
      sub: 'Choose the sentence with the most helpful detail.', does: 'Choose strong, specific details.',
      prompt: 'Each sentence is too general. Choose the best way to add a specific detail. In your workbook you write the new sentence yourself.',
      hint: 'Not this one. A specific detail tells who, what, where, or when.',
      items: [
        { lead: 'My room is nice.', q: 'Which sentence is the most specific?',
          options: ['My room is nice because it has a big window and a soft bed.', 'My room is nice because it is a very, very nice room to be in.', 'My room is nice because it is good and I like it a lot.'],
          answer: 'My room is nice because it has a big window and a soft bed.', why: 'A big window and a soft bed are details the reader can imagine.' },
        { lead: 'I like my class.', q: 'Which sentence is the most specific?',
          options: ['I like my class because the teacher uses games to teach new words.', 'I like my class because it is a very good class and I like it.', 'I like my class because the class is good and very nice.'],
          answer: 'I like my class because the teacher uses games to teach new words.', why: 'It tells what the teacher does. That is a specific reason.' },
        { lead: 'The food is good.', q: 'Which sentence is the most specific?',
          options: ['The food at the canteen is good because it is fresh and cheap.', 'The food at the canteen is good because it is nice.', 'The food is good because it is nice and it is very good food.'],
          answer: 'The food at the canteen is good because it is fresh and cheap.', why: 'It says where (the canteen) and why (fresh and cheap).' },
        { lead: 'My friend is helpful.', q: 'Which sentence is the most specific?',
          options: ['My friend is helpful because she shares her notes when I miss class.', 'My friend is helpful because she is a good person and very nice.', 'My friend is helpful, very helpful, and she is always helpful.'],
          answer: 'My friend is helpful because she shares her notes when I miss class.', why: 'It gives an example: she shares her notes when I miss class.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan it', bloom: 'Apply',
      sub: 'Make a plan for a unified paragraph. Use short notes.', does: 'Plan a unified paragraph.',
      topic: 'A hobby I enjoy: playing the guitar',
      slots: [
        { key: 'ts', mode: 'one', prompt: 'Choose the best topic sentence.', options: [
          { t: 'Playing the guitar is a hobby I enjoy because it helps me relax.', ok: true, why: 'It has a topic (playing the guitar) and a controlling idea (a hobby I enjoy because it helps me relax).' },
          { t: 'I play the guitar.', ok: false, why: 'This is only a fact. It does not tell the main idea.' },
          { t: 'My sister has a new school bag.', ok: false, why: 'This is about a different topic.' }
        ] },
        { key: 'details', mode: 'many', count: 3, prompt: 'Choose 3 details with examples that fit the topic sentence.',
          hint: 'Ask: is it about why I enjoy the guitar?',
          whyOk: 'These three details all explain why you enjoy the guitar. Each one has an example.',
          options: [
            { t: 'relaxing: I play for 20 minutes after class', ok: true },
            { t: 'the price of my phone', ok: false },
            { t: 'friends: I play in a small club on Fridays', ok: true },
            { t: 'the bus to the market', ok: false },
            { t: 'learning: I learn one new song every week', ok: true },
            { t: 'my neighbor’s new car', ok: false }
          ] },
        { key: 'cs', mode: 'one', prompt: 'Choose the best closing sentence.', options: [
          { t: 'For these reasons, playing the guitar is the best hobby for me.', ok: true, why: 'It goes back to the main idea.' },
          { t: 'I also like to cook.', ok: false, why: 'This is a new idea. A closing sentence goes back to the main idea.' },
          { t: 'My guitar is made of wood.', ok: false, why: 'This is a fact about the guitar. It does not close the paragraph.' }
        ] }
      ],
      rows: [
        { label: 'Topic sentence', slot: 'ts', wait: 'Complete step 1' },
        { label: 'Detail 1 (with example)', slot: 'details', i: 0, wait: 'Complete step 2' },
        { label: 'Detail 2 (with example)', slot: 'details', i: 1, wait: 'Complete step 2' },
        { label: 'Detail 3 (with example)', slot: 'details', i: 2, wait: 'Complete step 2' },
        { label: 'Closing sentence', slot: 'cs', wait: 'Complete step 3' }
      ],
      afterText: 'Your plan is ready. Now make your own plan in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Plan first. Then write on page {p3}.',
      task: 'Write one unified paragraph. Use your plan. Start with a topic sentence. End with a closing sentence.',
      topics: ['My favorite place to study', 'A hobby I enjoy', 'A club or activity at my university'],
      framesTitle: 'Ways to add detail',
      frames: ['For example, ______.', 'This helps me ______ because ______.', 'I can ______ there / in this way.', 'One reason is that ______.'],
      levels: [
        { level: 'A1', text: '60 to 80 words.' },
        { level: 'A2', text: '100 to 120 words.' },
        { level: 'B1', text: '130 to 160 words.' }
      ],
      checklist: [
        'My topic sentence has a clear controlling idea.',
        'Every sentence is about the main idea.',
        'I gave at least 3 specific details.',
        'I used an example in at least one detail.',
        'My closing sentence goes back to the main idea.',
        'I checked capital letters, periods, and spelling.'
      ],
      selfStudy: 'Finish your paragraph at home if you did not finish it. Check it with the checklist. Bring the final copy to the next class: you will revise it.'
    }
  ],

  exit: {
    outcome: 'I can write a paragraph with one main idea and details that all match the main idea.',
    questions: [
      { q: 'A paragraph is about my part-time job at a cafe. Which sentence does NOT belong?', options: ['I make coffee and clean tables.', 'The job gives me money for books.', 'My brother likes soccer.'], answer: 2 },
      { q: 'Which detail is the most specific?', options: ['The library is very good and I like it a lot.', 'The library is quiet, so I can focus on my homework.', 'The library is a nice place and it is very nice.'], answer: 1 }
    ]
  }
};
