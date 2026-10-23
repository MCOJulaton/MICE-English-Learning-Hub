/* Unit 5: Coherence and Cohesion. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 5,
  title: 'Coherence and Cohesion',
  output: 'Your Unit 4 paragraph, revised with transitions and reference words marked.',
  can: 'put ideas in a logical order and connect them with transitions and reference words.',
  bloom: 'Analyze, Apply, Evaluate',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 4 before you start.', does: 'Remember what unity means.',
      items: [
        { q: 'What does unity mean in a paragraph?',
          options: ['Every sentence supports the main idea.', 'The paragraph is very long.', 'The paragraph has many different topics.'],
          answer: 'Every sentence supports the main idea.', why: 'A paragraph has unity when every sentence supports the main idea.' },
        { q: 'Which sentence is more specific?',
          options: ['The food is good and I like it very much.', 'The food at the canteen is fresh and cheap.', 'The food is very nice and it is very good.'],
          answer: 'The food at the canteen is fresh and cheap.', why: 'It says where (the canteen) and why (fresh and cheap).' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'Order and connection', bloom: 'Understand',
      sub: 'Good ideas need a clear order and clear connections.', does: 'Learn how transitions and reference words connect ideas.',
      points: [
        'Coherence means your ideas are in a logical order.',
        'Cohesion means your sentences are connected with transitions (first, next, however) and reference words (it, they, this).',
        'Use a transition at the start of a sentence and put a comma after it.',
        'Use reference words so you do not repeat the same noun again and again.'
      ],
      models: [
        {
          title: 'Before and after: transitions',
          hint: 'Read the “after” paragraph. Tap each sentence to see how the transition helps.',
          sentences: [
            { text: 'Every morning, I get up at six.', kind: 'k1', tag: 'Time', note: 'Every morning tells when. It starts the story.' },
            { text: 'After that, I take a shower.', kind: 'k2', tag: 'Order', note: 'After that shows the next step. Put a comma after it.' },
            { text: 'Then I eat breakfast.', kind: 'k2', tag: 'Order', note: 'Then shows the next step.' },
            { text: 'Next, I take the bus to the university.', kind: 'k2', tag: 'Order', note: 'Next shows the next step. Put a comma after it.' },
            { text: 'Finally, I arrive at eight.', kind: 'k3', tag: 'End', note: 'Finally shows the last step.' }
          ],
          after: 'Before: I get up at six. I take a shower. I eat breakfast. The order is not shown. After: the transitions show the order.'
        },
        {
          title: 'Reference words',
          hint: 'Tap each sentence. See what the reference word means.',
          sentences: [
            { text: 'My friend Ann studies English.', kind: 'k1', tag: 'Ann', note: 'First, name the person.' },
            { text: 'She wants to be a teacher.', kind: 'k4', tag: 'She = Ann', note: 'She means Ann. You do not repeat the name.' }
          ]
        }
      ],
      lang: {
        title: 'Transitions',
        rows: [
          ['Order', 'first, second, next, then, after that, finally'],
          ['Adding', 'also, in addition, another reason is'],
          ['Contrast', 'but, however'],
          ['Example', 'for example, for instance'],
          ['Result', 'so, as a result'],
          ['End', 'in short, in conclusion']
        ]
      }
    },
    {
      id: 'order', type: 'order', title: 'Put the sentences in order', bloom: 'Analyze',
      sub: 'Find the logical order. Look for transitions.', does: 'Put sentences in a logical order.',
      prompt: 'These are the steps for taking a test. Tap the sentences in the right order.',
      hint: 'Look for words like First, Then, After that, Next, and Finally.',
      sets: [{
        items: [
          'I follow three steps when I take a test.',
          'First, I look at the whole test for two minutes.',
          'Then I read the question carefully.',
          'After that, I answer the easy questions.',
          'Next, I spend more time on the hard ones.',
          'Finally, I read my answers again and fix my mistakes.'
        ],
        why: 'The first sentence tells the main idea. Then the transitions show the order of the steps.'
      }]
    },
    {
      id: 'words', type: 'choose', title: 'Choose the best word', bloom: 'Apply',
      sub: 'Choose the transition or reference word that fits.', does: 'Choose the best transition or reference word.',
      hint: 'Not this one. Think about the meaning: order, contrast, result, or who or what.',
      items: [
        { q: 'I was tired. ___, I went to class.', options: ['However', 'Because', 'Finally'], answer: 'However',
          why: 'However shows contrast. You were tired, but you went to class.' },
        { q: 'I like pizza. ___ I like noodles.', options: ['Also', 'But', 'However'], answer: 'Also',
          why: 'Also adds another idea.' },
        { q: 'Ann is my friend. Use a reference word: ___ studies English.', options: ['She', 'They', 'It'], answer: 'She',
          why: 'She means Ann. It stops you from repeating the name.' },
        { q: 'The test was hard. ___, many students felt worried.', options: ['So', 'Finally', 'Also'], answer: 'So',
          why: 'So shows a result. The test was hard, so students felt worried.' },
        { q: '___, open your notebook. ___, write the date.', options: ['First / Next', 'In conclusion / Because', 'Because / However'], answer: 'First / Next',
          why: 'First and Next show the order of two steps.' }
      ]
    },
    {
      id: 'revise', type: 'choose', title: 'Add transitions', bloom: 'Evaluate',
      sub: 'Make a plain paragraph easier to follow.', does: 'Revise a paragraph with transitions.',
      prompt: 'This paragraph is about the library. Choose the best transition for each blank.',
      hint: 'Not this one. Which word connects the two ideas best?',
      items: [
        { lead: 'My favorite place to study is the library. ___, it is quiet, so I can focus.', q: 'Which word starts the first reason?',
          options: ['First', 'However', 'In conclusion'], answer: 'First', why: 'First starts the list of reasons.' },
        { lead: 'First, it is quiet. ___, the air is cool and the chairs are comfortable.', q: 'Which word adds a second reason?',
          options: ['Also', 'However', 'Finally'], answer: 'Also', why: 'Also adds another reason.' },
        { lead: 'The air is cool and the chairs are comfortable. ___, I can use the free computers there.', q: 'Which phrase adds one more reason?',
          options: ['For example', 'In addition', 'But'], answer: 'In addition', why: 'In addition adds one more reason.' },
        { lead: 'It is quiet, cool, and full of books. ___, I finish my homework faster there.', q: 'Which phrase shows the result?',
          options: ['As a result', 'At first', 'For example'], answer: 'As a result', why: 'As a result shows what happens because of the reasons.' }
      ]
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Plan your revision. Then rewrite on page {p3}.',
      task: 'Rewrite your Unit 4 paragraph. Add at least 4 transitions or reference words. Underline them.',
      topics: ['Revise your Unit 4 paragraph'],
      framesTitle: 'Useful words',
      frames: ['First, ______. Next, ______. Finally, ______.', 'Also, ______. In addition, ______.', 'For example, ______.', 'In short, ______.'],
      levels: [
        { level: 'A1', text: '60 to 80 words.' },
        { level: 'A2', text: '100 to 120 words.' },
        { level: 'B1', text: '130 to 160 words.' }
      ],
      checklist: [
        'My ideas are in a logical order.',
        'I added at least 4 transitions or reference words.',
        'I put a comma after each transition at the start of a sentence.',
        'I underlined the new words.',
        'My paragraph is easier to read than before.',
        'I wrote the tools I used (or none).'
      ],
      selfStudy: 'Rewrite the paragraph a second time after your teacher or partner gives you comments. Keep the first and second versions in your folder.'
    }
  ],

  exit: {
    outcome: 'I can put ideas in a logical order and connect them with transitions and reference words.',
    questions: [
      { q: 'Which sentence uses a reference word?', options: ['Ann is my friend. Ann studies English.', 'Ann is my friend. She studies English.', 'Ann is my friend. Studies English.'], answer: 1 },
      { q: 'Which sentence is correct?', options: ['After that I take a shower.', 'After that I, take a shower.', 'After that, I take a shower.'], answer: 2 }
    ]
  }
};
