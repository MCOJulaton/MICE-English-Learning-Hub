/* Unit 3: Paragraph Anatomy. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 3,
  title: 'Paragraph Anatomy',
  output: 'A paragraph planner: topic sentence, 3 supporting details, and a closing idea.',
  can: 'name the parts of a paragraph and plan a paragraph with a clear main idea.',
  bloom: 'Understand, Apply, Analyze',
  minutes: 20,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 2 before you start.', does: 'Remember what you learned about sentences.',
      items: [
        { q: 'Which one is a complete sentence?',
          options: ['Because I was tired at five o’clock.', 'The market opens at five o’clock.', 'Opens at five o’clock every day.'],
          answer: 'The market opens at five o’clock.',
          why: 'It has a subject, a verb, and a complete idea.',
          hint: 'A complete sentence needs a subject, a verb, and a complete idea.' },
        { q: 'Which sentence joins two ideas correctly?',
          options: ['The room is small, but it is clean.', 'The room is small it is clean.', 'The room is small, it is clean.'],
          answer: 'The room is small, but it is clean.',
          why: 'It uses a comma and the joining word but.',
          hint: 'Use a joining word (and, but, so) after the comma.' }
      ]
    },
    {
      id: 'parts', type: 'learn', title: 'Meet the parts', bloom: 'Understand',
      sub: 'A paragraph has a topic sentence, details, and a concluding sentence.',
      does: 'Meet the parts of a paragraph.',
      points: [
        'A paragraph is a group of sentences about ONE main idea.',
        'The topic sentence tells the main idea.',
        'Supporting details explain the main idea. They give reasons or examples.',
        'The concluding sentence ends the paragraph. It goes back to the main idea.'
      ],
      models: [{
        title: 'Model paragraph: Phuket Old Town',
        hint: 'Tap each sentence. See its job.',
        sentences: [
          { text: 'Phuket Old Town is a great place to spend a weekend.', kind: 'k1', tag: 'TS',
            note: 'This is the topic sentence. It tells the main idea. The topic is Phuket Old Town. The controlling idea is a great place to spend a weekend.' },
          { text: 'First, the colorful old buildings are perfect for taking photos.', kind: 'k2', tag: 'D1',
            note: 'Detail 1. It begins with First. It gives a reason the place is great.' },
          { text: 'Second, there are many small cafes where you can try local food and coffee.', kind: 'k2', tag: 'D2',
            note: 'Detail 2. It begins with Second. It gives another reason.' },
          { text: 'Also, the Sunday walking street has music, snacks, and handmade gifts.', kind: 'k2', tag: 'D3',
            note: 'Detail 3. It begins with Also. It gives a third reason.' },
          { text: 'In short, Phuket Old Town is a fun and interesting place for visitors and students.', kind: 'k3', tag: 'CS',
            note: 'This is the concluding sentence. It ends the paragraph. It goes back to the main idea.' }
        ],
        after: 'Notice: every sentence is about the same idea, a great weekend place.'
      }]
    },
    {
      id: 'controlling', type: 'choose', title: 'Topic and idea', bloom: 'Understand',
      sub: 'What is the paragraph about? What will you say about it?',
      does: 'Find the topic and the controlling idea.',
      prompt: 'The topic is what you write about. The controlling idea is what you say about it. Example: Phuket Old Town (topic) is a great place to spend a weekend (controlling idea). Choose the topic or the controlling idea in each sentence.',
      hint: 'Not this one. The controlling idea is what the writer says about the topic.',
      items: [
        { lead: 'My phone is very useful for studying.', q: 'Which words are the topic?',
          options: ['My phone', 'very useful for studying', 'useful for studying'], answer: 'My phone',
          why: 'The topic is what you write about: my phone. The controlling idea is very useful for studying.' },
        { lead: 'Phuket is a wonderful place for a vacation.', q: 'Which words are the controlling idea?',
          options: ['Phuket is a wonderful place', 'a wonderful place for a vacation', 'a place for a vacation'], answer: 'a wonderful place for a vacation',
          why: 'It says what the writer will explain: Phuket is a wonderful place for a vacation.' },
        { lead: 'Our English class is more fun than my other classes.', q: 'Which words are the topic?',
          options: ['Our English class', 'more fun than my other classes', 'my other classes'], answer: 'Our English class',
          why: 'The topic is what you write about: our English class. The controlling idea is more fun than my other classes.' },
        { lead: 'Riding a motorbike in the city can be dangerous.', q: 'Which words are the controlling idea?',
          options: ['Riding a motorbike in the city', 'can be dangerous', 'in the city can be'], answer: 'can be dangerous',
          why: 'It says what the writer will explain: riding a motorbike can be dangerous.' }
      ]
    },
    {
      id: 'find', type: 'choose', title: 'Name the parts', bloom: 'Analyze',
      sub: 'Read each sentence from a paragraph about cooking. Choose its job.',
      does: 'Name the job of each sentence.',
      options: [{ v: 'TS', label: 'Topic sentence' }, { v: 'D', label: 'Detail' }, { v: 'CS', label: 'Concluding sentence' }],
      hint: 'Not this one. Think about what this sentence does. Try again.',
      items: [
        { q: 'Learning to cook is a useful skill for students.', answer: 'TS', why: 'It gives the main idea: cooking is a useful skill.' },
        { q: 'You can save money by making your own meals.', answer: 'D', why: 'It gives a reason cooking is useful.' },
        { q: 'Cooking at home is also healthier than buying fast food.', answer: 'D', why: 'It gives another reason. The word also often starts a new detail.' },
        { q: 'Cooking is a fun way to relax after a long day.', answer: 'D', why: 'It gives a third reason. It is about the same idea.' },
        { q: 'For these reasons, every student should learn to cook.', answer: 'CS', why: 'It ends the paragraph. For these reasons points back to the details.' }
      ]
    },
    {
      id: 'focus', type: 'pick', title: 'Focused or not', bloom: 'Analyze',
      sub: 'A good paragraph keeps to one idea.', does: 'Find the sentences that do not belong.',
      prompt: 'Paragraph A is focused. Paragraph B is not. Tap the 3 sentences in Paragraph B that do not belong. Then tap Check.',
      hint: 'Ask: is it about the library as a study place?',
      sets: [{
        lead: 'Paragraph A: The library is the best place to study at my university. First, it is quiet, so I can think. Second, it has cool air and comfortable chairs. Also, it has many books and free computers. In short, I finish my work faster there.',
        items: [
          { t: 'My favorite place to study is the library.', on: false },
          { t: 'The cafeteria sells good fried rice.', on: true },
          { t: 'My friend has a new phone.', on: true },
          { t: 'The library has free computers.', on: false },
          { t: 'I like blue shirts.', on: true }
        ],
        why: 'The fried rice, the friend’s phone, and the blue shirts are about different ideas. Only the library sentences belong.'
      }]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan it', bloom: 'Apply',
      sub: 'Make a planner in 3 small steps. Use short notes.', does: 'Plan a paragraph.',
      topic: 'A good place to study',
      slots: [
        { key: 'ts', mode: 'one', prompt: 'Choose the best topic sentence.', options: [
          { t: 'The university library is the best place to study.', ok: true, why: 'It has a topic (the library) and a controlling idea (the best place to study).' },
          { t: 'The library has 200 books.', ok: false, why: 'This is only a fact. It has no controlling idea.' },
          { t: 'I go to the library.', ok: false, why: 'It does not tell the main idea. What will you explain?' }
        ] },
        { key: 'details', mode: 'many', count: 3, prompt: 'Choose 3 details that fit the topic sentence.',
          hint: 'Ask: is it about the library as a good study place?',
          whyOk: 'These three details are all about the library as a good study place.',
          options: [
            { t: 'quiet, no noise', ok: true },
            { t: 'my friend’s new phone', ok: false },
            { t: 'cool air, comfortable chairs', ok: true },
            { t: 'fried rice at the cafeteria', ok: false },
            { t: 'many books, free computers', ok: true },
            { t: 'the bus to my university', ok: false }
          ] },
        { key: 'cs', mode: 'one', prompt: 'Choose the best closing idea.', options: [
          { t: 'In short, the library is the best place to study.', ok: true, why: 'It goes back to the main idea.' },
          { t: 'The cafeteria is near the library.', ok: false, why: 'This is a new idea. A closing idea goes back to the main idea.' },
          { t: 'Also, I like my English class.', ok: false, why: 'This is a different idea. It does not close this paragraph.' }
        ] }
      ],
      rows: [
        { label: 'Topic', fixed: 'The university library' },
        { label: 'Topic sentence', slot: 'ts', wait: 'Complete step 1' },
        { label: 'Detail 1', slot: 'details', i: 0, wait: 'Complete step 2' },
        { label: 'Detail 2', slot: 'details', i: 1, wait: 'Complete step 2' },
        { label: 'Detail 3', slot: 'details', i: 2, wait: 'Complete step 2' },
        { label: 'Closing idea', slot: 'cs', wait: 'Complete step 3' }
      ],
      afterText: 'Your planner is ready. Now do your own planner in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Complete the planner for one topic.',
      task: 'Complete the planner for one topic. Then write your topic sentence again, neatly, on the lines on page {p3}.',
      topics: ['A good place to study', 'A useful app or website', 'A person who helps me'],
      frames: [
        'The best ______ is ______ because ______.',
        '______ is a good place to ______.',
        'There are three reasons why ______.',
        'In short, ______. / In conclusion, ______.'
      ],
      levels: [
        { level: 'A1', text: 'Topic sentence and 2 details.' },
        { level: 'A2', text: 'Topic sentence, 3 details, and a closing idea.' },
        { level: 'B1', text: 'Add an example for each detail.' }
      ],
      checklist: [
        'My topic sentence has a topic and a controlling idea.',
        'My three details are about the controlling idea.',
        'No detail is about a different idea.',
        'My closing idea goes back to the main idea.',
        'I used short notes, not full sentences, in the planner.'
      ],
      selfStudy: 'Read the model paragraph below. Tap each sentence and say its part. Then plan a second paragraph on your own topic in your workbook.',
      selfModel: {
        title: 'Model paragraph 2: A smartphone',
        sentences: [
          { text: 'A smartphone is a useful tool for students.', kind: 'k1', tag: 'TS', note: 'Topic sentence. The topic is a smartphone. The controlling idea is a useful tool for students.' },
          { text: 'First, students can look up new words in a dictionary app.', kind: 'k2', tag: 'D1', note: 'Detail 1. It begins with First.' },
          { text: 'Second, they can join online study groups.', kind: 'k2', tag: 'D2', note: 'Detail 2. It begins with Second.' },
          { text: 'Also, they can record a lesson and listen again later.', kind: 'k2', tag: 'D3', note: 'Detail 3. It begins with Also.' },
          { text: 'In short, a smartphone helps students learn in many ways.', kind: 'k3', tag: 'CS', note: 'Concluding sentence. It goes back to the main idea.' }
        ],
        after: 'Notice: all the details are about one idea, how a phone helps students.'
      },
      extra: [
        { name: 'Reading Skills', url: 'https://wonder-library.vercel.app/#/read1', why: 'Practice finding the main idea. A topic sentence tells the main idea.' },
        { name: 'English Grammar, Volume 1', url: 'https://wonder-library.vercel.app/#/gram1', why: 'Practice the present simple. Many topic sentences use it.' }
      ]
    }
  ],

  exit: {
    outcome: 'I can name the parts of a paragraph and plan a paragraph with a clear main idea.',
    questions: [
      { q: 'Which sentence is a topic sentence?', options: ['The library has 200 books and many chairs.', 'The library is the best place to study.', 'I go to the library on Monday every week.'], answer: 1 },
      { q: 'Which sentence ends a paragraph about cooking?', options: ['For these reasons, every student should learn to cook.', 'Cooking at home can save money for many students.', 'Cooking is a useful skill for students at any age.'], answer: 0 }
    ]
  }
};
