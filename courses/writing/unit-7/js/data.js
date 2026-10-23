/* Unit 7: Narrative Writing. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 7,
  title: 'Narrative Writing',
  output: 'A narrative paragraph about a meaningful or everyday experience.',
  can: 'tell a short story in order, with time words and correct past tense verbs.',
  bloom: 'Understand, Apply, Create',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 6 before you start.', does: 'Remember how to describe with specific details.',
      items: [
        { q: 'Which sentence is the most specific?',
          options: ['The market is a very nice place and I like it a lot.', 'The market has bright lights and the smell of grilled chicken.', 'The market is good and it is a good place to go.'],
          answer: 'The market has bright lights and the smell of grilled chicken.', why: 'Bright lights and the smell of grilled chicken are details the reader can imagine.' },
        { q: 'Which sentence uses the sense of hearing?',
          options: ['Music comes from the small stage.', 'The sand is hot under my feet.', 'The soup is spicy.'],
          answer: 'Music comes from the small stage.', why: 'You hear music with your ears.' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'Tell what happened', bloom: 'Understand',
      sub: 'A story has a beginning, a middle, and an end.', does: 'Learn how to tell a story in order.',
      points: [
        'A narrative tells what happened. Put the events in time order: beginning, middle, end.',
        'Use the past tense for finished events: went, ate, saw, started.',
        'Use time markers to show the order: first, then, after that, suddenly, finally.',
        'Add one or two details so the reader can imagine the story.'
      ],
      models: [{
        title: 'Model paragraph: a day at the beach',
        sentences: [
          { text: 'Last Saturday, my friends and I went to the beach.', kind: 'k1', tag: 'Start', note: 'The first sentence tells when (last Saturday), where (the beach), and who (my friends and I).' },
          { text: 'First, we took a minibus at nine o’clock.', kind: 'k2', tag: 'Event 1', note: 'The time marker First starts the events. The verb took is past.' },
          { text: 'When we arrived, the sky was bright and blue.', kind: 'k2', tag: 'Event 2', note: 'This sentence adds a detail: the sky was bright and blue. The verbs arrived and was are past.' },
          { text: 'Then we swam and played volleyball for two hours.', kind: 'k2', tag: 'Event 3', note: 'Then shows the next event. The verbs swam and played are past.' },
          { text: 'After that, we ate grilled fish for lunch.', kind: 'k2', tag: 'Event 4', note: 'After that shows the next event. Ate is the past of eat.' },
          { text: 'Suddenly, it started to rain, so we ran to a small cafe.', kind: 'k2', tag: 'Event 5', note: 'Suddenly shows a surprise. Started and ran are past.' },
          { text: 'Finally, we drank hot tea and laughed until the rain stopped.', kind: 'k2', tag: 'Event 6', note: 'Finally shows the last event. Drank is the past of drink.' },
          { text: 'It was a simple day, but I will always remember it.', kind: 'k3', tag: 'End', note: 'The last sentence tells how you feel about the day.' }
        ],
        after: 'Notice: the events are in time order and all the verbs are in the past.'
      }],
      lang: {
        title: 'Time markers and past verbs',
        rows: [
          ['Time markers', 'last weekend, yesterday, first, then, after that, next, suddenly, finally'],
          ['Past verbs 1', 'go, went. eat, ate. buy, bought. see, saw.'],
          ['Past verbs 2', 'take, took. have, had. come, came. meet, met.'],
          ['Past verbs 3', 'begin, began. sleep, slept. make, made. write, wrote.']
        ]
      }
    },
    {
      id: 'order', type: 'order', title: 'Put the events in order', bloom: 'Analyze',
      sub: 'Time order makes a story easy to follow.', does: 'Put the events of a story in order.',
      prompt: 'Tap the events in the order they happened.',
      hint: 'Think about the day: first travel, then arrive, then fun, then lunch, then rain, then tea.',
      sets: [{
        items: [
          'We took a minibus to the beach.',
          'We arrived at the beach.',
          'We swam in the sea.',
          'We ate grilled fish for lunch.',
          'It started to rain.',
          'We drank hot tea in a cafe.'
        ],
        why: 'This is the order of the day, from the minibus to the hot tea.'
      }]
    },
    {
      id: 'verbs', type: 'choose', title: 'Fix the verb', bloom: 'Apply',
      sub: 'Each sentence tells about the past. Choose the correct sentence.', does: 'Choose the correct past tense verb.',
      prompt: 'Each first sentence has one verb mistake. Choose the correct sentence. In your workbook you write the correct sentence yourself.',
      hint: 'Not this one. Use the correct past form of the verb. Many common verbs are irregular.',
      items: [
        { lead: 'Last week, I go to the market.', q: 'Which sentence is correct?',
          options: ['Last week, I went to the market.', 'Last week, I goed to the market.', 'Last week, I gone to the market.'],
          answer: 'Last week, I went to the market.', why: 'Go is irregular. The past of go is went.' },
        { lead: 'We eated noodles for dinner.', q: 'Which sentence is correct?',
          options: ['We ate noodles for dinner.', 'We eaten noodles for dinner.', 'We eat noodles for dinner yesterday.'],
          answer: 'We ate noodles for dinner.', why: 'Eat is irregular. The past of eat is ate.' },
        { lead: 'She buyed a new phone yesterday.', q: 'Which sentence is correct?',
          options: ['She bought a new phone yesterday.', 'She buy a new phone yesterday.', 'She boughted a new phone yesterday.'],
          answer: 'She bought a new phone yesterday.', why: 'Buy is irregular. The past of buy is bought.' },
        { lead: 'The movie begin at eight. (It happened last night.)', q: 'Which sentence is correct?',
          options: ['The movie began at eight.', 'The movie begun at eight.', 'The movie beginned at eight.'],
          answer: 'The movie began at eight.', why: 'Begin is irregular. The past of begin is began.' },
        { lead: 'I was tired, so I sleeped early.', q: 'Which sentence is correct?',
          options: ['I was tired, so I slept early.', 'I was tired, so I sleep early.', 'I was tired, so I sleeping early.'],
          answer: 'I was tired, so I slept early.', why: 'Sleep is irregular. The past of sleep is slept.' },
        { lead: 'They didn’t went to class on Friday.', q: 'Which sentence is correct?',
          options: ['They didn’t go to class on Friday.', 'They didn’t went to class on Friday.', 'They not go to class on Friday.'],
          answer: 'They didn’t go to class on Friday.', why: 'After didn’t, use the base verb: go. Do not use went.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan your story', bloom: 'Apply',
      sub: 'Plan a story in 3 small steps. Use short notes.', does: 'Plan a story with a beginning, a middle, and an end.',
      topic: 'A day at the beach',
      slots: [
        { key: 'start', mode: 'one', prompt: 'Choose the best beginning. It tells when, where, and who.', options: [
          { t: 'Last Saturday, my friends and I went to the beach.', ok: true, why: 'It tells when, where, and who. The verb went is past.' },
          { t: 'Last Saturday, my friends and I go to the beach.', ok: false, why: 'The story is finished. Use the past tense: went.' },
          { t: 'I like the beach.', ok: false, why: 'This does not start a story. It does not tell when or what happened.' }
        ] },
        { key: 'events', mode: 'many', count: 3, prompt: 'Choose 3 events that are part of the story, in time order.',
          hint: 'Ask: did it happen on that day, and is it part of the story?',
          whyOk: 'These three events happened on the day, in time order. Each begins with a time marker.',
          options: [
            { t: 'First, we took a minibus at nine o’clock.', ok: true },
            { t: 'I eat noodles every day.', ok: false },
            { t: 'Then we swam and played volleyball.', ok: true },
            { t: 'Beaches are usually crowded in April.', ok: false },
            { t: 'After that, we ate grilled fish for lunch.', ok: true },
            { t: 'My brother has a motorbike.', ok: false }
          ] },
        { key: 'end', mode: 'one', prompt: 'Choose the best ending. It tells the result or a feeling.', options: [
          { t: 'It was a simple day, but I will always remember it.', ok: true, why: 'It tells how you feel about the day.' },
          { t: 'I sleep early every night.', ok: false, why: 'This is a habit. It is not the end of this story.' },
          { t: 'Tomorrow I will go to school.', ok: false, why: 'This is a different time. The story is about last Saturday.' }
        ] }
      ],
      rows: [
        { label: 'Beginning: when, where, who', slot: 'start', wait: 'Complete step 1' },
        { label: 'Middle: event 1', slot: 'events', i: 0, wait: 'Complete step 2' },
        { label: 'Middle: event 2', slot: 'events', i: 1, wait: 'Complete step 2' },
        { label: 'Middle: event 3', slot: 'events', i: 2, wait: 'Complete step 2' },
        { label: 'End: result or feeling', slot: 'end', wait: 'Complete step 3' }
      ],
      afterText: 'Your plan is ready. Now plan your own story in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Plan first. Then write on page {p3}.',
      task: 'Write a narrative paragraph. Tell the events in order. Use time markers and the past tense.',
      topics: ['A day I remember', 'My first day at the university', 'A trip with friends or family'],
      framesTitle: 'Useful frames',
      frames: ['Last ______, I ______.', 'First, ______. Then, ______.', 'After that, ______.', 'Suddenly, ______.', 'Finally, ______.', 'It was ______, but I ______.'],
      levels: [
        { level: 'A1', text: '60 to 80 words.' },
        { level: 'A2', text: '100 to 120 words.' },
        { level: 'B1', text: '130 to 160 words.' }
      ],
      checklist: [
        'I told when and where at the start.',
        'I wrote at least 6 events, in the correct order.',
        'I used at least 4 time markers.',
        'At least 8 out of 10 verbs are correct past forms.',
        'I included at least 2 specific details.',
        'I checked irregular verbs (went, ate, bought).'
      ],
      selfStudy: 'Practice the past forms of 15 irregular verbs. Write your draft and edit all the verbs.'
    }
  ],

  exit: {
    outcome: 'I can tell a short story in order, with time words and correct past tense verbs.',
    questions: [
      { q: 'Which sentence is correct?', options: ['Yesterday, I eated noodles.', 'Yesterday, I ate noodles.', 'Yesterday, I eat noodles.'], answer: 1 },
      { q: 'Which word shows a surprise in a story?', options: ['Because', 'Also', 'Suddenly'], answer: 2 }
    ]
  }
};
