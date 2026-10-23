/* Unit 1: Welcome and Diagnostic Writing. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 1,
  title: 'Welcome and Diagnostic Writing',
  output: 'A diagnostic paragraph (60 to 100 words), your writer inventory, and your tool-use declaration.',
  can: 'write a short paragraph about myself and say what I want to improve in my writing.',
  bloom: 'Understand, Apply',
  minutes: 20,

  steps: [
    {
      id: 'course', type: 'learn', title: 'How this course works', bloom: 'Understand',
      sub: 'Every unit has the same routine. Learn it once.', does: 'Learn how the course and the writing process work.',
      points: [
        'Write in every unit. Each unit ends with one output: a sentence set, a paragraph, an outline, or an essay.',
        'Plan, write a draft, get feedback, revise, and edit. This is the writing process.',
        'Keep all your work in your workbook and in your folder. At the end, you choose your best work for your portfolio.',
        'Write your own work. Read the rules for tools and honest writing on page {rules}.'
      ],
      models: [{
        title: 'The writing process',
        hint: 'Tap each step. See what it means.',
        sentences: [
          { text: 'Plan', kind: 'k1', tag: '1', note: 'Think of ideas. Make short notes. Do not write full sentences yet.' },
          { text: 'Draft', kind: 'k2', tag: '2', note: 'Write your first version. Do not stop to fix every small mistake.' },
          { text: 'Get feedback', kind: 'k3', tag: '3', note: 'Ask a classmate or your teacher to read your draft. They say one good thing and one thing to improve.' },
          { text: 'Revise', kind: 'k4', tag: '4', note: 'Change your ideas, your order, and your details to make the writing better.' },
          { text: 'Edit', kind: 'k1', tag: '5', note: 'Fix grammar, spelling, and punctuation at the end.' }
        ],
        after: 'Good writers plan first, write a draft, ask for feedback, change their ideas, and then check the small details.'
      }],
      table: {
        title: 'Your workbook: 3 pages in every unit',
        rows: [
          ['Page 1: Learn', 'Read the unit output and the “I can” goal. Study the model text and the useful language.'],
          ['Page 2: Practice and Plan', 'Do the practice tasks. Then fill in the planner for your writing.'],
          ['Page 3: Write and Check', 'Write the unit output. Use the checklist. Write your tool-use declaration.']
        ]
      }
    },
    {
      id: 'rules', type: 'choose', title: 'Tools and honest writing', bloom: 'Apply',
      sub: 'Your writing must be your own. Some tools can help you learn.', does: 'Learn the rules for tools and honest writing.',
      prompt: 'Is each action allowed in this course? Choose Allowed or Not allowed.',
      options: ['Allowed', 'Not allowed'],
      hint: 'Not this one. Remember: tools can help you learn, but you must write your own work.',
      items: [
        { q: 'You ask an AI tool to explain the words “controlling idea”.', answer: 'Allowed',
          why: 'AI can explain words and give practice examples when the task says so. Then you write your own text and say what you used.' },
        { q: 'You ask an AI tool to write your paragraph. Then you hand it in.', answer: 'Not allowed',
          why: 'An AI-written paragraph is not your own writing. You do not practice, and you must not hand it in as yours.' },
        { q: 'You look up the word “strainer” in a dictionary.', answer: 'Allowed',
          why: 'A dictionary is allowed. Write it in your tool-use declaration.' },
        { q: 'You copy three sentences from a website and change two words.', answer: 'Not allowed',
          why: 'Copying is not allowed. Use your own words and name your source.' },
        { q: 'You write your own draft. Then a classmate gives you comments.', answer: 'Allowed',
          why: 'Peer feedback is encouraged. Your partner gives comments. Your partner does not write your text.' },
        { q: 'You use a tool and you do not tell your teacher.', answer: 'Not allowed',
          why: 'Always be honest. At the end of every piece of writing, write one line: Tools I used: ______.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan your paragraph', bloom: 'Apply',
      sub: 'A plan uses short notes. Make one in 3 small steps.', does: 'Plan a paragraph before you write.',
      topic: 'My daily life as a university student',
      slots: [
        { key: 'first', mode: 'one', prompt: 'Choose the best first sentence. It tells the main idea.', options: [
          { t: 'My daily life as a university student is busy, but I enjoy it.', ok: true, why: 'It names the topic and tells what you will say about it.' },
          { t: 'I am a student.', ok: false, why: 'This is true, but it does not tell the main idea of the paragraph.' },
          { t: 'My brother has a new motorbike.', ok: false, why: 'This is about a different topic.' }
        ] },
        { key: 'ideas', mode: 'many', count: 3, prompt: 'Choose 3 ideas that fit your first sentence.',
          hint: 'Ask: is it about my daily life as a student?',
          whyOk: 'These three ideas are all about daily life as a student.',
          options: [
            { t: 'wake up at six o’clock', ok: true },
            { t: 'my neighbor’s dog', ok: false },
            { t: 'study English and business', ok: true },
            { t: 'the weather in Europe', ok: false },
            { t: 'eat lunch with friends', ok: true },
            { t: 'a movie from last year', ok: false }
          ] },
        { key: 'last', mode: 'one', prompt: 'Choose the best last sentence.', options: [
          { t: 'I am tired in the evening, but I feel happy because I am learning new things.', ok: true, why: 'It ends the paragraph and goes back to the main idea.' },
          { t: 'Tomorrow I will buy a new bag.', ok: false, why: 'This is a new idea. A last sentence goes back to the main idea.' },
          { t: 'My friend likes soccer.', ok: false, why: 'This is about a different topic.' }
        ] }
      ],
      plannerTitle: 'Your plan',
      rows: [
        { label: 'Topic', fixed: 'My daily life as a university student' },
        { label: 'First sentence', slot: 'first', wait: 'Complete step 1' },
        { label: 'Idea 1', slot: 'ideas', i: 0, wait: 'Complete step 2' },
        { label: 'Idea 2', slot: 'ideas', i: 1, wait: 'Complete step 2' },
        { label: 'Idea 3', slot: 'ideas', i: 2, wait: 'Complete step 2' },
        { label: 'Last sentence', slot: 'last', wait: 'Complete step 3' }
      ],
      afterText: 'Your plan is ready. Now plan your own diagnostic paragraph in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Plan and write your paragraph.',
      task: 'Choose ONE topic. Plan for 3 minutes. Then write 60 to 100 words on page {p2}. Write your best English. Do not use a translator or an AI tool for this paragraph. Your teacher uses it to see where to help you. Then complete your writer inventory and self-assessment on page {p3}.',
      topics: ['A. My daily life as a university student', 'B. A place I like in Phuket', 'C. My favorite food and why I like it'],
      frames: [
        '______ is ______ because ______.',
        'First, ______. Then, ______. After that, ______.',
        'I like ______ because ______.'
      ],
      levels: [
        { level: 'A1', text: 'Write 40 to 60 words. Short sentences are fine.' },
        { level: 'A2', text: 'Write 60 to 100 words.' },
        { level: 'B1', text: 'Write 60 to 100 words with a clear first sentence and a last sentence.' }
      ],
      checklist: [
        'I wrote complete sentences.',
        'My paragraph is about one topic.',
        'I gave at least two details.',
        'My ideas are in a clear order.',
        'I used capital letters and periods.',
        'I read it one more time.'
      ],
      selfStudy: 'Set up your writing folder. Read the rules on page {rules}. Write 5 sentences to introduce yourself on a separate page. Bring both to the next class.'
    }
  ],

  exit: {
    outcome: 'I can write a short paragraph about myself and say what I want to improve in my writing.',
    questions: [
      { q: 'Which is the right order of the writing process?', options: ['Plan, draft, get feedback, revise, edit', 'Edit, draft, plan, revise, get feedback', 'Draft, edit, plan, get feedback, revise'], answer: 0 },
      { q: 'Your teacher asks you to write a paragraph yourself. What is the honest choice?', options: ['Ask an AI tool to write it, then hand it in.', 'Write it yourself and say which tools you used.', 'Copy a paragraph from a website and change two words.'], answer: 1 }
    ]
  }
};
