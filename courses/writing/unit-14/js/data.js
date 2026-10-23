/* Unit 14: Writing a Full Essay Draft. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 14,
  title: 'Writing a Full Essay Draft',
  output: 'A complete first draft of a short essay.',
  can: 'plan my time and write a complete short essay from my outline.',
  bloom: 'Apply, Analyze, Create',
  minutes: 20,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 13 before you start.', does: 'Remember the parts of an essay.',
      items: [
        { q: 'What do you do in the conclusion?',
          options: ['Restate the thesis and give a final thought.', 'Add three new reasons and a new topic.', 'Start a new topic with a new thesis.'],
          answer: 'Restate the thesis and give a final thought.', why: 'A conclusion matches the thesis. It does not add new ideas.' },
        { q: 'Which words link the body paragraphs of an essay?',
          options: ['First, Second, Third', 'a, an, the, and, but', 'I, you, we, they, he, she'],
          answer: 'First, Second, Third', why: 'Linking words such as First, Second, and Third show the order of the body paragraphs.' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'Plan your 90 minutes', bloom: 'Understand',
      sub: 'Good writers plan their time before they write.', does: 'Learn how to use your 90 minutes.',
      pointsTitle: 'Your assignment',
      points: [
        'Write a short essay from your Unit 12 outline.',
        'Use your Unit 13 introduction, body, and conclusion if they are good.',
        'Write the other body paragraphs today.',
        'Do not stop to fix every small mistake while you write. Focus on your ideas first.'
      ],
      table: {
        title: 'Your 90 minutes',
        rows: [
          ['0 to 10 minutes', 'Read the criteria. Look at your outline.'],
          ['10 to 25 minutes', 'Check your thesis and plan. Fix the outline.'],
          ['25 to 70 minutes', 'Write your essay.'],
          ['70 to 82 minutes', 'Use the self-review checklist.'],
          ['82 to 90 minutes', 'Write your three revision priorities.']
        ]
      }
    },
    {
      id: 'timeline', type: 'order', title: 'Order your time', bloom: 'Analyze',
      sub: 'Do the steps in the right order.', does: 'Put the steps of the lesson in order.',
      prompt: 'Tap the steps in the order you do them in class.',
      hint: 'First look at your outline. Last, write what to improve.',
      sets: [{
        items: [
          'Read the criteria. Look at your outline.',
          'Check your thesis and plan. Fix the outline.',
          'Write your essay.',
          'Use the self-review checklist.',
          'Write your three revision priorities.'
        ],
        why: 'You prepare first, then write, then check and plan your changes.'
      }]
    },
    {
      id: 'match', type: 'pick', title: 'Check the outline', bloom: 'Analyze',
      sub: 'Before you write, check that your body points match your thesis.', does: 'Check that the body points match the thesis.',
      prompt: 'Thesis: Students should have part-time jobs because they earn money, learn responsibility, and make new friends. Tap the 2 body points that do not match the thesis. Then tap Check.',
      flag: 'does not match',
      hint: 'Ask: is it one of the three points in the thesis?',
      sets: [{
        items: [
          { t: 'Body point: money (pay for books and food)', on: false },
          { t: 'Body point: the weather in April', on: true },
          { t: 'Body point: responsibility (arrive on time)', on: false },
          { t: 'Body point: friends (meet coworkers)', on: false },
          { t: 'Body point: my favorite food', on: true }
        ],
        why: 'The weather and your favorite food are not in the thesis. Take them out of the outline.'
      }]
    },
    {
      id: 'problems', type: 'choose', title: 'Solve writing problems', bloom: 'Evaluate',
      sub: 'Draft writing has common problems. Choose the best fix.', does: 'Choose the best fix for common draft problems.',
      hint: 'Not this one. Think about what helps the reader and matches the thesis.',
      items: [
        { q: 'A student writes one very long body paragraph with three ideas. What should the student do?',
          options: ['Make three body paragraphs, one idea in each.', 'Add a fourth idea to the same paragraph.', 'Remove the thesis from the introduction.'],
          answer: 'Make three body paragraphs, one idea in each.', why: 'Each body paragraph explains one main point of the thesis.' },
        { q: 'Time is almost finished and there is no conclusion. What should you do?',
          options: ['Start a new body paragraph about a new idea.', 'Write a short conclusion now: the thesis and a final thought.', 'Stop writing and hand in the essay now.'],
          answer: 'Write a short conclusion now: the thesis and a final thought.', why: 'An essay needs a conclusion. Two short sentences are enough.' },
        { q: 'A student writes without a plan. What can happen?',
          options: ['The essay will always be perfect and easy to read.', 'The thesis will write itself in the introduction.', 'The ideas can be out of order and may not match the thesis.'],
          answer: 'The ideas can be out of order and may not match the thesis.', why: 'A plan keeps your ideas in order and matched to the thesis.' }
      ]
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Write your essay.',
      task: 'Write a short essay from your Unit 12 outline on pages {p2} and {p3}. Write your title on the first line. Leave a line between paragraphs. When you finish, use the self-review checklist and write your three revision priorities on page {p3}.',
      topics: ['Why students should learn English', 'Why part-time jobs are good for students', 'Why Phuket is a good place for tourism'],
      framesTitle: 'Useful frames',
      frames: ['______ should ______ because ______, ______, and ______.', 'First, ______. Second, ______. Third, ______.', 'For example, ______.', 'In conclusion, ______.'],
      levels: [
        { level: 'A1', text: '120 to 150 words, 3 short paragraphs.' },
        { level: 'A2', text: '180 to 220 words.' },
        { level: 'B1', text: '250 to 300 words.' }
      ],
      checklist: [
        'My introduction ends with a clear thesis.',
        'Each body paragraph has one main point.',
        'My body points match my thesis.',
        'I used linking words between paragraphs.',
        'My conclusion restates the thesis.',
        'I checked verbs, capital letters, periods, and spelling.'
      ],
      selfStudy: 'Read your essay aloud once. Mark places that sound strange. Bring your draft to Unit 15 for peer review.',
      reminder: 'Write your own essay. Remember to write your tool-use declaration.'
    }
  ],

  exit: {
    outcome: 'I can plan my time and write a complete short essay from my outline.',
    questions: [
      { q: 'Where does the thesis go in your essay?', options: ['At the start of the conclusion.', 'At the end of the introduction.', 'Before the title.'], answer: 1 },
      { q: 'You finish your draft early. What should you do next?', options: ['Hand it in without reading it again, to save time.', 'Start a new essay about a different topic today.', 'Use the checklist and write 3 revision priorities.'], answer: 2 }
    ]
  }
};
