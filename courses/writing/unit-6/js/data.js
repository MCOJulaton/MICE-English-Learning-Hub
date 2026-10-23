/* Unit 6: Descriptive Writing. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 6,
  title: 'Descriptive Writing',
  output: 'A descriptive paragraph about a familiar person, place, or object.',
  can: 'describe something with specific details in a clear order.',
  bloom: 'Understand, Apply, Create',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 5 before you start.', does: 'Remember transitions and reference words.',
      items: [
        { q: 'Which word shows the order of steps?',
          options: ['First', 'However', 'Because'], answer: 'First', why: 'First, next, then, and finally show order.' },
        { q: 'My friend Ann studies English. She wants to be a teacher. What does She mean?',
          options: ['Ann', 'My teacher', 'The sentence'], answer: 'Ann', why: 'A reference word points back to a person or thing. She means Ann.' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'Help the reader see', bloom: 'Understand',
      sub: 'Use specific words, the senses, and a clear order.', does: 'Learn how to describe with specific details.',
      points: [
        'A descriptive paragraph helps the reader see, hear, smell, taste, or feel something.',
        'Use specific words, not only “nice” or “good”. Say “bright red umbrella” or “cold sweet coconut”.',
        'Use an order: from left to right, from near to far, from top to bottom, or from the most important to the least.',
        'Use position words: on the left, in the middle, behind, next to, in front of.'
      ],
      models: [{
        title: 'Model paragraph: the night market',
        sentences: [
          { text: 'The night market near my house is full of life.', kind: 'k1', tag: 'TS', note: 'The topic sentence tells what you describe and your main idea: full of life.' },
          { text: 'On the left side, food stalls sell grilled chicken and sweet pancakes, and the smell of sugar and smoke fills the air.', kind: 'k2', tag: 'Left', note: 'Position: on the left side. Senses: taste (sweet pancakes) and smell (sugar and smoke).' },
          { text: 'In the middle, a small stage has live music every Friday.', kind: 'k2', tag: 'Middle', note: 'Position: in the middle. Sense: hear (live music).' },
          { text: 'On the right side, people sell colorful T-shirts and handmade bracelets.', kind: 'k2', tag: 'Right', note: 'Position: on the right side. Sense: see (colorful T-shirts).' },
          { text: 'I love this place because it is noisy, bright, and friendly.', kind: 'k3', tag: 'CS', note: 'The closing sentence tells how you feel.' }
        ],
        after: 'Notice: the order is left, middle, right. Every detail is specific.'
      }],
      lang: {
        title: 'Word bank',
        rows: [
          ['Sight', 'bright, colorful, tall, crowded, tiny'],
          ['Sound', 'noisy, quiet, loud, soft'],
          ['Smell and taste', 'sweet, spicy, salty, fresh, smoky'],
          ['Touch', 'soft, cold, hot, smooth'],
          ['Position', 'on the left, in the middle, behind, next to, in front of']
        ]
      }
    },
    {
      id: 'senses', type: 'choose', title: 'Sort the details', bloom: 'Analyze',
      sub: 'Which sense does each detail use?', does: 'Sort details by the five senses.',
      options: [{ v: 'SEE', label: 'See' }, { v: 'HEAR', label: 'Hear' }, { v: 'SMELL', label: 'Smell' }, { v: 'TASTE', label: 'Taste' }, { v: 'TOUCH', label: 'Touch' }],
      hint: 'Not this one. Which part of your body tells you this?',
      items: [
        { q: 'The soup is spicy and sour.', answer: 'TASTE', why: 'You taste spicy and sour with your tongue.' },
        { q: 'The sand is hot under my feet.', answer: 'TOUCH', why: 'You feel hot sand with your feet.' },
        { q: 'Music comes from the small stage.', answer: 'HEAR', why: 'You hear music with your ears.' },
        { q: 'Bright lights hang above the stalls.', answer: 'SEE', why: 'You see bright lights with your eyes.' },
        { q: 'The air smells like grilled fish.', answer: 'SMELL', why: 'You smell the air with your nose.' },
        { q: 'The towel is soft and dry.', answer: 'TOUCH', why: 'You feel soft and dry with your hands.' }
      ]
    },
    {
      id: 'specific', type: 'choose', title: 'Make it specific', bloom: 'Apply',
      sub: 'Choose the sentence a reader can really see.', does: 'Choose specific details.',
      prompt: 'Each sentence is too general. Choose the best description. In your workbook you write the new sentence yourself.',
      hint: 'Not this one. Which sentence has details you can see, hear, smell, taste, or feel?',
      items: [
        { lead: 'It is a nice place.', q: 'Which sentence is the most specific?',
          options: ['It is a nice place because it has tall trees and a small stream.', 'It is a nice place because it is a very nice place for me.', 'It is a nice place and I like this nice place very much.'],
          answer: 'It is a nice place because it has tall trees and a small stream.', why: 'Tall trees and a small stream are details you can see.' },
        { lead: 'The food is good.', q: 'Which sentence is the most specific?',
          options: ['The noodle soup is hot, spicy, and full of fresh herbs.', 'The food is very good, and it is really, really good.', 'The food is good and tasty, and I like it a lot.'],
          answer: 'The noodle soup is hot, spicy, and full of fresh herbs.', why: 'Hot, spicy, and fresh herbs tell the reader what the soup is like.' },
        { lead: 'My bag is nice.', q: 'Which sentence is the most specific?',
          options: ['My bag is a small blue backpack with a yellow zipper.', 'My bag is very nice and good, and it is a nice bag.', 'My bag is a nice bag and I like my bag very much.'],
          answer: 'My bag is a small blue backpack with a yellow zipper.', why: 'Small, blue, backpack, and yellow zipper are details the reader can see.' },
        { lead: 'The beach is beautiful.', q: 'Which sentence is the most specific?',
          options: ['The beach has soft white sand and clear green water.', 'The beach is very, very beautiful, and it is a nice place.', 'The beach is a beautiful place and I like it very much.'],
          answer: 'The beach has soft white sand and clear green water.', why: 'Soft white sand and clear green water show what is beautiful.' }
      ]
    },
    {
      id: 'order', type: 'order', title: 'Describe in order', bloom: 'Analyze',
      sub: 'A clear order helps the reader see the picture.', does: 'Put a description in order.',
      prompt: 'Describe the room from left to right. Tap the sentences in the right order. The first and last sentences are the topic sentence and the closing sentence.',
      hint: 'Look for the position words: on the left, next to, on the right.',
      sets: [{
        items: [
          'My room is small, but I love it.',
          'On the left side, there is a single bed with a soft blue blanket.',
          'Next to the bed, a wooden desk holds my laptop and a small green plant.',
          'On the right side, a tall window lets in warm morning light.',
          'It is a quiet and comfortable place where I study and rest.'
        ],
        why: 'The details go from left to right: the bed, the desk, and the window.'
      }]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan it', bloom: 'Apply',
      sub: 'Make a plan for a description. Use short notes.', does: 'Plan a description.',
      topic: 'My room',
      slots: [
        { key: 'order', mode: 'one', prompt: 'Choose an order for the description.', options: [
          { t: 'From left to right', ok: true, why: 'A clear order helps the reader follow the picture.' },
          { t: 'Jump from the window to the bed to the door to the desk', ok: false, why: 'The reader cannot follow this. Choose a clear order.' },
          { t: 'No order. Write what I remember first.', ok: false, why: 'Without an order, the reader cannot see the room.' }
        ] },
        { key: 'details', mode: 'many', count: 3, prompt: 'Choose 3 specific details with a position and a sense.',
          hint: 'Ask: can I see, hear, smell, taste, or feel it?',
          whyOk: 'These three details are specific. Each has a position and something the reader can see.',
          options: [
            { t: 'on the left: a single bed with a soft blue blanket', ok: true },
            { t: 'a nice room', ok: false },
            { t: 'next to the bed: a wooden desk with a green plant', ok: true },
            { t: 'a good place', ok: false },
            { t: 'on the right: a tall window and warm morning light', ok: true },
            { t: 'a very good thing', ok: false }
          ] },
        { key: 'feeling', mode: 'one', prompt: 'Choose the best ending. It tells how you feel.', options: [
          { t: 'I love this room because it is quiet and comfortable.', ok: true, why: 'It tells how you feel and why.' },
          { t: 'The room is nice.', ok: false, why: 'This is too general. It does not tell how you feel.' },
          { t: 'I went to the market yesterday.', ok: false, why: 'This is a different idea.' }
        ] }
      ],
      rows: [
        { label: 'What I describe', fixed: 'My room' },
        { label: 'Order I will use', slot: 'order', wait: 'Complete step 1' },
        { label: 'Detail 1 (position + sense)', slot: 'details', i: 0, wait: 'Complete step 2' },
        { label: 'Detail 2 (position + sense)', slot: 'details', i: 1, wait: 'Complete step 2' },
        { label: 'Detail 3 (position + sense)', slot: 'details', i: 2, wait: 'Complete step 2' },
        { label: 'How I feel about it', slot: 'feeling', wait: 'Complete step 3' }
      ],
      afterText: 'Your plan is ready. Now make your own plan in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Plan first. Then write on page {p3}.',
      task: 'Write a descriptive paragraph. Use a clear order and at least 5 specific details.',
      topics: ['A place I know well (a market, beach, room, or cafe)', 'A person in my family or a friend', 'An object that is special to me'],
      framesTitle: 'Useful frames',
      frames: ['On the left side, ______.', 'In the middle, ______.', 'Next to ______, there is ______.', 'The air smells like ______.', 'I love this place because ______.'],
      levels: [
        { level: 'A1', text: '60 to 80 words.' },
        { level: 'A2', text: '100 to 120 words.' },
        { level: 'B1', text: '130 to 160 words.' }
      ],
      checklist: [
        'My topic sentence tells what I describe.',
        'I used a clear order (left to right, near to far, and so on).',
        'I included at least 5 specific details.',
        'I used at least 2 senses.',
        'I used position words.',
        'I read the paragraph and fixed errors.'
      ],
      selfStudy: 'Collect 10 descriptive words for your topic from a dictionary or from class notes. Write your first draft at home if you need more time.'
    }
  ],

  exit: {
    outcome: 'I can describe something with specific details in a clear order.',
    questions: [
      { q: 'Which sentence is the most specific?', options: ['The beach is a very good place and I like it a lot.', 'The beach is beautiful, and it is a nice place to go.', 'The beach has soft white sand and clear green water.'], answer: 2 },
      { q: 'Which words show position?', options: ['on the left, in the middle, next to', 'first, then, after that, finally', 'because, so, but, however, also'], answer: 0 }
    ]
  }
};
