/* Unit 10: Cause and Effect, and Paraphrasing. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 10,
  title: 'Cause and Effect, and Paraphrasing',
  output: 'A cause-and-effect paragraph and a paraphrase task with the source named.',
  can: 'explain causes and effects, and paraphrase a sentence without copying.',
  bloom: 'Understand, Apply, Analyze, Create',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 9 before you start.', does: 'Remember how to compare two things.',
      items: [
        { q: 'Which word shows a difference?',
          options: ['Whereas', 'Both', 'Similarly'], answer: 'Whereas', why: 'Whereas, while, but, and however show a difference.' },
        { q: 'You compare tea and coffee on price. Which sentence is on the same basis?',
          options: ['Tea is cheap, but coffee is expensive.', 'Tea is cheap, and coffee is popular.', 'Tea comes from leaves.'],
          answer: 'Tea is cheap, but coffee is expensive.', why: 'Both drinks are compared on the same basis: price.' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'Why it happens', bloom: 'Understand',
      photo: { file: 'pow-u10-flood.jpg', alt: 'A flooded street. Brown water covers the road and vehicles drive slowly through it.', caption: 'Heavy rain fell all night. The road was flooded. What is the cause? What is the effect?' },
      sub: 'A cause is why. An effect is what happens.', does: 'Learn causes, effects, and paraphrasing.',
      points: [
        'A cause is why something happens. An effect is what happens.',
        'Use connectors: because, since, so, as a result, therefore, lead to, cause.',
        'One cause can lead to an effect, and that effect can become the next cause. This is a chain.',
        'To paraphrase, say the same idea in your own words and your own sentence structure. Do not copy. Name the source: “According to the reading ...”',
        'Plagiarism is using someone else’s words or ideas as your own. It is not allowed in this course.'
      ],
      models: [
        {
          title: 'Model paragraph: lack of sleep',
          sentences: [
            { text: 'Lack of sleep causes several problems for university students.', kind: 'k1', tag: 'TS', note: 'The topic sentence names the problem.' },
            { text: 'One cause is staying up late to study or use the phone.', kind: 'k4', tag: 'Cause', note: 'This is the cause. One cause is is a cause phrase.' },
            { text: 'As a result, students feel tired in class and cannot pay attention.', kind: 'k2', tag: 'Effect 1', note: 'As a result shows an effect.' },
            { text: 'Another effect is that they forget information more easily, so their test scores can go down.', kind: 'k2', tag: 'Effect 2', note: 'Another effect is and so show effects. The effect is explained.' },
            { text: 'In addition, tired students often feel stressed and in a bad mood.', kind: 'k2', tag: 'Effect 3', note: 'In addition adds one more effect.' },
            { text: 'Because of these effects, students should try to sleep at least seven hours every night.', kind: 'k3', tag: 'CS', note: 'The closing sentence gives advice.' }
          ],
          after: 'Notice: each effect is explained, not only listed.'
        },
        {
          title: 'Copy or paraphrase?',
          hint: 'Tap each sentence. Original: “Many students use their phones late at night.”',
          sentences: [
            { text: 'Many students use their phones late in the night.', kind: 'k3', tag: 'Too close', note: 'Only a few words are changed. This is still copying. It is not allowed.' },
            { text: 'A lot of students look at their phones until late.', kind: 'k2', tag: 'Paraphrase', note: 'The words and the sentence are different, but the meaning is the same.' },
            { text: 'According to the reading in this workbook, a lot of students look at their phones until late.', kind: 'k1', tag: 'Source named', note: 'Always name the source of the idea.' }
          ]
        }
      ],
      lang: {
        title: 'Cause and effect language',
        rows: [
          ['Cause', 'because, since, one cause is, due to'],
          ['Effect', 'so, as a result, therefore, another effect is, lead to'],
          ['Linking', 'Because of this, ...  /  This causes ...  /  This leads to ...']
        ]
      }
    },
    {
      id: 'causeeffect', type: 'choose', title: 'Cause or effect?', bloom: 'Analyze',
      sub: 'The cause comes first. The effect is the result.', does: 'Tell a cause from an effect.',
      options: [{ v: 'C', label: 'Cause' }, { v: 'E', label: 'Effect' }],
      hint: 'Not this one. Ask: is it why something happened, or what happened?',
      items: [
        { q: 'Many students stay up late.', answer: 'C', why: 'This is why students feel tired.' },
        { q: 'They feel tired in class.', answer: 'E', why: 'This is what happens because they stay up late.' },
        { q: 'Heavy rain fell all night.', answer: 'C', why: 'This is why the road was flooded.' },
        { q: 'The road was flooded in the morning.', answer: 'E', why: 'This is what happened because of the heavy rain.' },
        { q: 'She did not study.', answer: 'C', why: 'This is why she failed the test.' },
        { q: 'She failed the test.', answer: 'E', why: 'This is what happened because she did not study.' }
      ]
    },
    {
      id: 'chain', type: 'order', title: 'Build a chain', bloom: 'Analyze',
      sub: 'One effect can become the next cause.', does: 'Put a cause and effect chain in order.',
      prompt: 'Tap the sentences in the order of the chain. Start with the first cause.',
      hint: 'Ask: what happens first? What does it cause next?',
      sets: [{
        items: [
          'Many students use their phones late at night.',
          'They go to bed late.',
          'They sleep only five or six hours.',
          'They feel tired in class.',
          'They cannot pay attention.'
        ],
        why: 'Each effect becomes the cause of the next one.'
      }]
    },
    {
      id: 'paraphrase', type: 'choose', title: 'Paraphrase', bloom: 'Apply',
      sub: 'Say the same idea in your own words, and name the source.', does: 'Choose a good paraphrase and a source line.',
      prompt: 'Read the text. In your workbook you write your own paraphrase.',
      hint: 'Not this one. A good paraphrase keeps the meaning but uses different words and a different sentence.',
      items: [
        { lead: 'Text: (1) Many students use their phones late at night. (2) Because of this, they go to bed late and sleep only five or six hours. (3) The next day, they feel tired and have trouble paying attention in class.',
          q: 'Which sentence is the best paraphrase of sentence 2?',
          options: ['Because they use their phones until late, many students sleep for only five or six hours.', 'Because of this, they go to bed late and sleep only five or six hours.', 'Students sleep a lot every night because they use their phones late.'],
          answer: 'Because they use their phones until late, many students sleep for only five or six hours.', why: 'The meaning is the same. The words and the sentence are different.' },
        { lead: 'Sentence 3: The next day, they feel tired and have trouble paying attention in class.',
          q: 'Which sentence is the best paraphrase of sentence 3?',
          options: ['The following day, they are sleepy and find it hard to concentrate in lessons.', 'The next day, they feel tired and have trouble paying attention in class.', 'The next day, they feel full of energy.'],
          answer: 'The following day, they are sleepy and find it hard to concentrate in lessons.', why: 'The meaning is the same. The words are different. The second sentence is a copy, and the third changes the meaning.' },
        { q: 'Which source line is correct?',
          options: ['According to the reading in this workbook (Unit 10).', 'I thought of this idea myself when I read it.', 'No source is needed because it is in the book.'],
          answer: 'According to the reading in this workbook (Unit 10).', why: 'Always name where the idea comes from.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan it', bloom: 'Apply',
      sub: 'Plan a cause and effect paragraph in 3 small steps.', does: 'Plan a cause and effect paragraph.',
      topic: 'What happens when students do not sleep enough',
      slots: [
        { key: 'ts', mode: 'one', prompt: 'Choose the best topic sentence.', options: [
          { t: 'Lack of sleep causes several problems for university students.', ok: true, why: 'It names the problem and tells the reader that effects will follow.' },
          { t: 'Many students have phones.', ok: false, why: 'This is only a fact. It does not name the problem.' },
          { t: 'I sleep eight hours.', ok: false, why: 'This is about you only. It does not tell the main idea.' }
        ] },
        { key: 'effects', mode: 'many', count: 3, prompt: 'Choose 3 effects of lack of sleep.',
          hint: 'Ask: is it something that happens because of lack of sleep?',
          whyOk: 'These three things all happen because of lack of sleep.',
          options: [
            { t: 'tired in class: cannot pay attention', ok: true },
            { t: 'a new phone costs a lot', ok: false },
            { t: 'forget information: test scores go down', ok: true },
            { t: 'the weather in April', ok: false },
            { t: 'stressed: in a bad mood', ok: true },
            { t: 'my favorite movie', ok: false }
          ] },
        { key: 'cs', mode: 'one', prompt: 'Choose the best closing sentence.', options: [
          { t: 'Because of these effects, students should sleep at least seven hours every night.', ok: true, why: 'It goes back to the main idea and gives advice.' },
          { t: 'I also like noodles.', ok: false, why: 'This is a different idea.' },
          { t: 'Some students sleep late.', ok: false, why: 'This is only a cause. It does not close the paragraph.' }
        ] }
      ],
      rows: [
        { label: 'Topic sentence', slot: 'ts', wait: 'Complete step 1' },
        { label: 'Effect 1', slot: 'effects', i: 0, wait: 'Complete step 2' },
        { label: 'Effect 2', slot: 'effects', i: 1, wait: 'Complete step 2' },
        { label: 'Effect 3', slot: 'effects', i: 2, wait: 'Complete step 2' },
        { label: 'Closing sentence', slot: 'cs', wait: 'Complete step 3' }
      ],
      afterText: 'Your plan is ready. Now make your own cause and effect chain in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Plan first. Then write on page {p3}.',
      task: 'Write a cause-and-effect paragraph. Show at least 2 causes or 2 effects. Explain each one. Then paraphrase 2 sentences from the text in your workbook and name the source.',
      topics: ['Why many students feel stressed', 'What happens when students do not sleep enough', 'Why many people choose to travel to Phuket'],
      framesTitle: 'Useful frames',
      frames: ['One cause is ______.', 'As a result, ______.', 'Another effect is that ______.', 'Because of this, ______.', 'According to ______, ______.'],
      levels: [
        { level: 'A1', text: '60 to 80 words. Write 3 sentences with because and so. Paraphrase by changing 3 words.' },
        { level: 'A2', text: '100 to 120 words.' },
        { level: 'B1', text: '130 to 160 words. Add a third level to the chain and a short solution.' }
      ],
      checklist: [
        'My topic sentence names the problem or situation.',
        'I showed at least 2 causes or 2 effects.',
        'I explained each cause or effect.',
        'I used at least 3 cause-and-effect words.',
        'I paraphrased 2 sentences in my own words and named the source.',
        'I wrote my tool-use declaration.'
      ],
      selfStudy: 'Do 5 more paraphrase sentences from the class page. Write your draft and keep your notes to show how your ideas developed.',
      reminder: 'Remember: plagiarism is not allowed. Use your own words and name your source.'
    }
  ],

  exit: {
    outcome: 'I can explain causes and effects, and I can paraphrase a sentence without copying.',
    questions: [
      { q: 'Which phrase shows an effect?', options: ['One cause is', 'As a result', 'Because of'], answer: 1 },
      { q: 'Which sentence is the best paraphrase of “Many students stay up late”?', options: ['Many students stay up late.', 'Many students stay up late at night.', 'A lot of students go to bed late.'], answer: 2 }
    ]
  }
};
