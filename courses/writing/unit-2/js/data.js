/* Unit 2: Sentence Foundations. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 2,
  title: 'Sentence Foundations',
  output: 'A set of 10 correct sentences: 5 simple and 5 combined.',
  can: 'tell a complete sentence from a fragment or a run-on, and fix and combine sentences.',
  bloom: 'Remember, Understand, Apply',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 1 before you start.', does: 'Remember what you learned in Unit 1.',
      items: [
        { q: 'What is the first step of the writing process?',
          options: ['Plan', 'Edit', 'Revise'], answer: 'Plan',
          why: 'First you plan your ideas with short notes. Then you write a draft.' },
        { q: 'Which action is allowed in this course?',
          options: ['Look up a word in a dictionary.', 'Ask an AI tool to write your paragraph.', 'Copy sentences from a website.'],
          answer: 'Look up a word in a dictionary.',
          why: 'A dictionary is allowed. Write it in your tool-use declaration.' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'Complete, fragment, run-on', bloom: 'Understand',
      sub: 'A good sentence has all its parts.', does: 'Meet complete sentences, fragments, and run-ons.',
      points: [
        'A complete sentence has a subject (who or what), a verb (action or state), and a complete idea.',
        'A fragment is missing a part. “Because I was tired.” has no main idea.',
        'A run-on joins two sentences with no punctuation or joining word. “I was hungry I ate noodles.”',
        'Start with a capital letter. End with a period.'
      ],
      models: [{
        title: 'Look at the examples',
        hint: 'Tap each sentence. See what it is.',
        sentences: [
          { text: 'The market opens at five o’clock.', kind: 'k2', tag: 'Complete', note: 'It has a subject (the market), a verb (opens), and a complete idea.' },
          { text: 'Opens at five o’clock.', kind: 'k3', tag: 'Fragment', note: 'There is no subject. Who or what opens at five o’clock?' },
          { text: 'The market opens at five I go there.', kind: 'k4', tag: 'Run-on', note: 'Two sentences are joined with nothing between them.' },
          { text: 'The market opens at five, so I go there.', kind: 'k2', tag: 'Fixed', note: 'The comma and the joining word so fix the run-on.' }
        ],
        after: 'Notice: fixed sentences use a comma before and, but, and so. You do not need a comma before because in this book.'
      }],
      lang: {
        title: 'Joining words',
        rows: [
          ['and: adds an idea', 'I like tea, and I like coffee.'],
          ['but: shows a difference', 'The room is small, but it is clean.'],
          ['so: shows a result', 'It was hot, so we swam.'],
          ['because: shows a reason', 'We swam because it was hot.']
        ]
      }
    },
    {
      id: 'label', type: 'choose', title: 'Label each one', bloom: 'Analyze',
      sub: 'Is it a complete sentence, a fragment, or a run-on?', does: 'Label sentences as complete, fragment, or run-on.',
      options: [{ v: 'C', label: 'Complete' }, { v: 'F', label: 'Fragment' }, { v: 'R', label: 'Run-on' }],
      hint: 'Not this one. Look for a subject, a verb, and one complete idea.',
      items: [
        { q: 'Phuket has many beautiful beaches.', answer: 'C', why: 'It has a subject, a verb, and a complete idea.' },
        { q: 'Because the weather is hot in April.', answer: 'F', why: 'Because starts an idea that is not finished. It needs a main idea.' },
        { q: 'I study English every day I like writing.', answer: 'R', why: 'Two sentences are joined with no punctuation or joining word.' },
        { q: 'My friend and I walk to the university.', answer: 'C', why: 'It has a subject, a verb, and a complete idea.' },
        { q: 'Eating at the night market.', answer: 'F', why: 'It has no subject and no main verb.' },
        { q: 'The bus was late we waited for 30 minutes.', answer: 'R', why: 'Two sentences are joined with nothing between them.' },
        { q: 'She works at a hotel.', answer: 'C', why: 'It has a subject, a verb, and a complete idea.' },
        { q: 'The food is cheap it is also delicious.', answer: 'R', why: 'Two sentences are joined with nothing between them.' }
      ]
    },
    {
      id: 'fix', type: 'choose', title: 'Fix and combine', bloom: 'Apply',
      sub: 'Choose the one correct sentence. In your workbook you write the fix yourself.', does: 'Fix fragments and run-ons. Combine sentences.',
      prompt: 'Choose the best sentence. For 5 to 8, use the word in brackets.',
      hint: 'Not this one. Check the comma, the joining word, and the meaning.',
      items: [
        { lead: 'Because I was tired.', q: 'Which sentence fixes the fragment?',
          options: ['I went home early because I was tired.', 'Because I was tired, so I went home early.', 'I went home early I was tired.'],
          answer: 'I went home early because I was tired.', why: 'Now the sentence has a main idea. The word because gives the reason.' },
        { lead: 'My brother likes soccer he plays every weekend.', q: 'Which sentence fixes the run-on?',
          options: ['My brother likes soccer, and he plays every weekend.', 'My brother likes soccer, he plays every weekend.', 'My brother likes soccer he plays every weekend.'],
          answer: 'My brother likes soccer, and he plays every weekend.', why: 'A comma and the joining word and fix the run-on.' },
        { lead: 'Walking on the beach in the morning.', q: 'Which sentence fixes the fragment?',
          options: ['I like walking on the beach in the morning.', 'I walking on the beach in the morning.', 'Because I like walking on the beach in the morning.'],
          answer: 'I like walking on the beach in the morning.', why: 'Now the sentence has a subject (I) and a verb (like).' },
        { lead: 'The test was difficult I studied hard.', q: 'Which sentence fixes the run-on?',
          options: ['The test was difficult, but I studied hard.', 'The test was difficult, I studied hard.', 'The test was difficult I studied hard.'],
          answer: 'The test was difficult, but I studied hard.', why: 'A comma and the joining word but fix the run-on.' },
        { lead: 'I was hungry. I bought some noodles. (so)', q: 'Which sentence combines them?',
          options: ['I was hungry, so I bought some noodles.', 'I was hungry so, I bought some noodles.', 'I was hungry, because I bought some noodles.'],
          answer: 'I was hungry, so I bought some noodles.', why: 'The comma comes before so. Being hungry is the reason. Buying noodles is the result.' },
        { lead: 'The room is small. It is clean. (but)', q: 'Which sentence combines them?',
          options: ['The room is small, but it is clean.', 'The room is small but, it is clean.', 'The room is small, because it is clean.'],
          answer: 'The room is small, but it is clean.', why: 'The comma comes before but. Small and clean are different ideas.' },
        { lead: 'We like Phuket. The people are friendly. (because)', q: 'Which sentence combines them?',
          options: ['We like Phuket because the people are friendly.', 'Because we like Phuket. The people are friendly.', 'We like Phuket so the people are friendly.'],
          answer: 'We like Phuket because the people are friendly.', why: 'Because gives the reason. You do not need a comma before because.' },
        { lead: 'Tom plays guitar. Ann sings. (and)', q: 'Which sentence combines them?',
          options: ['Tom plays guitar, and Ann sings.', 'Tom plays guitar, Ann sings.', 'Tom plays guitar, and Ann sing.'],
          answer: 'Tom plays guitar, and Ann sings.', why: 'A comma and the joining word and join the ideas. The verb needs an s after a name: Ann sings.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan your day', bloom: 'Apply',
      sub: 'Build a model day at the university. Choose the correct sentence each time.', does: 'Plan sentences about a day at the university.',
      topic: 'A day at the university',
      slots: [
        { key: 'morning', mode: 'one', prompt: 'Morning: choose the correct sentence.', options: [
          { t: 'I wake up at six o’clock, and I take the bus.', ok: true, why: 'It has a comma and the joining word and.' },
          { t: 'I wake up at six o’clock I take the bus.', ok: false, why: 'This is a run-on. Add a comma and a joining word.' },
          { t: 'Wake up at six o’clock.', ok: false, why: 'This is a fragment. It has no subject.' }
        ] },
        { key: 'class', mode: 'one', prompt: 'Class: choose the correct sentence.', options: [
          { t: 'My first class is English, and I like it.', ok: true, why: 'It has a comma and the joining word and.' },
          { t: 'My first class is English I like it.', ok: false, why: 'This is a run-on. Add a comma and a joining word.' },
          { t: 'Because my first class is English.', ok: false, why: 'This is a fragment. It has no main idea.' }
        ] },
        { key: 'lunch', mode: 'one', prompt: 'Lunch: choose the correct sentence.', options: [
          { t: 'The canteen is crowded, so we sit outside.', ok: true, why: 'It has a comma and the joining word so. Crowded is the reason.' },
          { t: 'The canteen is crowded we sit outside.', ok: false, why: 'This is a run-on. Add a comma and a joining word.' },
          { t: 'Eating lunch at the canteen with friends.', ok: false, why: 'This is a fragment. It has no subject and no main verb.' }
        ] },
        { key: 'after', mode: 'one', prompt: 'After class: choose the correct sentence.', options: [
          { t: 'I go to the library after class because I need to study.', ok: true, why: 'Because gives the reason. You do not need a comma before because.' },
          { t: 'Going to the library after class.', ok: false, why: 'This is a fragment. It has no subject and no main verb.' },
          { t: 'I go to the library after class I need to study.', ok: false, why: 'This is a run-on. Add the joining word because.' }
        ] }
      ],
      rows: [
        { label: 'Morning', slot: 'morning', wait: 'Complete step 1' },
        { label: 'Class', slot: 'class', wait: 'Complete step 2' },
        { label: 'Lunch', slot: 'lunch', wait: 'Complete step 3' },
        { label: 'After class', slot: 'after', wait: 'Complete step 4' }
      ],
      afterText: 'Your model day is ready. Now plan your own day in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Plan your day. Then write 10 sentences.',
      task: 'Write 10 sentences about your day at the university. Write 5 simple sentences and 5 combined sentences (use and, but, so, or because).',
      topics: ['My day at the university', 'My weekend', 'My family and my home'],
      framesTitle: 'Joining frames',
      frames: [
        'I was ______, so I ______.',
        'The ______ is ______, but it is ______.',
        'We like ______ because ______.',
        'I ______, and I ______.'
      ],
      levels: [
        { level: 'A1', text: '10 short sentences.' },
        { level: 'A2', text: '10 sentences. 5 are combined.' },
        { level: 'B1', text: '10 sentences. 2 of them use because.' }
      ],
      checklist: [
        'Every sentence starts with a capital letter.',
        'Every sentence ends with a period.',
        'Every sentence has a subject and a verb.',
        'My combined sentences use and, but, so, or because.',
        'I used a comma before and, but, and so.',
        'I checked my spelling.'
      ],
      selfStudy: 'Do the sentence practice set (20 items) from your teacher. Start your error log on page {errlog}: write 5 of your own errors from this unit.'
    }
  ],

  exit: {
    outcome: 'I can tell a complete sentence from a fragment or a run-on, and I can fix and combine sentences.',
    questions: [
      { q: 'Which one is a complete sentence?', options: ['Works at a hotel.', 'She works at a hotel.', 'Because she works at a hotel.'], answer: 1 },
      { q: 'Which sentence is correct?', options: ['It was hot so, we swam.', 'It was hot, because we swam.', 'It was hot, so we swam.'], answer: 2 }
    ]
  }
};
