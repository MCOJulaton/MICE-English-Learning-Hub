/* Unit 11: Opinion Writing. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 11,
  title: 'Opinion Writing',
  output: 'An opinion paragraph with a clear claim, reasons, and examples.',
  can: 'state my opinion and support it with reasons and examples.',
  bloom: 'Understand, Apply, Evaluate, Create',
  minutes: 25,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 10 before you start.', does: 'Remember causes, effects, and paraphrasing.',
      items: [
        { q: 'Which word shows a cause?',
          options: ['Because', 'So', 'As a result'], answer: 'Because', why: 'Because gives the cause. So and as a result give the effect.' },
        { q: 'What is plagiarism?',
          options: ['Using someone else’s words or ideas as your own.', 'Writing an idea in your own words and naming it.', 'Naming the source of an idea in your writing.'],
          answer: 'Using someone else’s words or ideas as your own.', why: 'Plagiarism is not allowed in this course. Use your own words and name your source.' }
      ]
    },
    {
      id: 'learn', type: 'learn', title: 'Claim, reason, example', bloom: 'Understand',
      sub: 'An opinion needs reasons. A reason needs an example.', does: 'Learn claim, reason, example, and another view.',
      points: [
        'An opinion paragraph states a claim (what you think) and supports it with reasons.',
        'Give an example for each reason. An example makes the reason real.',
        'Show that you know another view: “Some people think ... However, ...”',
        'Use phrases: In my opinion, I believe, One reason is, For example, For instance, For these reasons.'
      ],
      models: [{
        title: 'Model paragraph: later classes',
        sentences: [
          { text: 'In my opinion, universities should start classes later in the morning.', kind: 'k1', tag: 'Claim', note: 'The claim says what you think. In my opinion starts it.' },
          { text: 'One reason is that students need more sleep.', kind: 'k2', tag: 'Reason 1', note: 'This is the first reason. One reason is starts it.' },
          { text: 'For example, many students wake up at five o’clock to travel to school, so they are tired in the first class.', kind: 'k4', tag: 'Example 1', note: 'This is an example for reason 1. For example starts it.' },
          { text: 'Another reason is that students learn better when they feel fresh.', kind: 'k2', tag: 'Reason 2', note: 'This is the second reason. Another reason is starts it.' },
          { text: 'For instance, my test scores are higher in afternoon classes than in morning classes.', kind: 'k4', tag: 'Example 2', note: 'This is an example for reason 2. For instance starts it.' },
          { text: 'Some people think a late start means a late finish.', kind: 'k3', tag: 'Other view', note: 'This shows that you know another view.' },
          { text: 'However, a good schedule can solve this problem.', kind: 'k3', tag: 'My answer', note: 'However answers the other view.' },
          { text: 'For these reasons, I believe later classes are better for students.', kind: 'k1', tag: 'Closing', note: 'The closing sentence goes back to the claim.' }
        ],
        after: 'Notice: two reasons, each with an example, and an answer to another view.'
      }],
      lang: {
        title: 'Opinion language',
        rows: [
          ['Claim', 'In my opinion, ...  /  I believe that ...  /  I think ... should ...'],
          ['Reasons', 'One reason is ...  /  Another reason is ...  /  This is because ...'],
          ['Examples', 'For example, ...  /  For instance, ...'],
          ['Other view', 'Some people think ... However, ...'],
          ['End', 'For these reasons, ...']
        ]
      }
    },
    {
      id: 'parts', type: 'choose', title: 'Claim, reason, or example?', bloom: 'Analyze',
      sub: 'Name the job of each sentence.', does: 'Name the job of each sentence in an opinion.',
      options: [{ v: 'C', label: 'Claim' }, { v: 'R', label: 'Reason' }, { v: 'E', label: 'Example' }],
      hint: 'Not this one. A claim says what you think. A reason says why. An example shows the reason.',
      items: [
        { q: 'I think students should wear comfortable clothes to class.', answer: 'C', why: 'It says what the writer thinks.' },
        { q: 'One reason is that comfortable clothes help students focus.', answer: 'R', why: 'It says why. One reason is starts a reason.' },
        { q: 'For example, last week it was very hot, and I could not think in my uniform.', answer: 'E', why: 'It gives a real example. For example starts an example.' },
        { q: 'Public parks should be free for everyone.', answer: 'C', why: 'It says what the writer thinks.' },
        { q: 'Free parks give families a safe place to relax.', answer: 'R', why: 'It says why parks should be free.' },
        { q: 'For instance, many families in my town walk and play in the park on weekends.', answer: 'E', why: 'It gives a real example. For instance starts an example.' }
      ]
    },
    {
      id: 'support', type: 'choose', title: 'Is the support good?', bloom: 'Evaluate',
      sub: 'Good reasons and examples match the claim.', does: 'Judge reasons, examples, and answers to another view.',
      prompt: 'Claim: Students should have part-time jobs.',
      hint: 'Not this one. Ask: does it support the claim?',
      items: [
        { q: 'Which sentence is a good reason?',
          options: ['Jobs teach responsibility.', 'I like my new phone very much.', 'The weather is hot in April.'],
          answer: 'Jobs teach responsibility.', why: 'It explains why students should have jobs.' },
        { q: 'Which example supports the reason “Jobs teach responsibility”?',
          options: ['Cafes sell many kinds of coffee and cold drinks.', 'A student who works in a cafe must arrive on time.', 'My brother likes soccer and plays every weekend.'],
          answer: 'A student who works in a cafe must arrive on time.', why: 'It shows a real situation where a job teaches responsibility.' },
        { q: 'Some people think a job takes too much study time. Which sentence answers this view?',
          options: ['Jobs are very good and many students like them.', 'Some students like cafes and want to work there.', 'However, students can choose a few hours on weekends.'],
          answer: 'However, students can choose a few hours on weekends.', why: 'It answers the other view and keeps the claim strong.' }
      ]
    },
    {
      id: 'opinion', type: 'choose', title: 'Give your opinion', bloom: 'Apply',
      sub: 'Choose the sentence with an opinion and a reason.', does: 'Choose clear opinion sentences with reasons.',
      prompt: 'In your workbook you write your own opinion and reason for each topic.',
      hint: 'Not this one. A good sentence has an opinion phrase, a claim, and a reason. Check the grammar too.',
      items: [
        { lead: 'Topic: Homework', q: 'Which sentence is the best?',
          options: ['I think homework is useful because it helps students practice.', 'I think homework because it is useful for students.', 'I am agree that homework is useful for students.'],
          answer: 'I think homework is useful because it helps students practice.', why: 'It has an opinion phrase (I think), a claim, and a reason (because ...). Say “I agree”, not “I am agree”.' },
        { lead: 'Topic: Fast food', q: 'Which sentence is the best?',
          options: ['In my opinion, fast food is unhealthy because it has too much fat.', 'In my opinion, fast food because it is a food for people.', 'Fast food is a kind of food that many people eat.'],
          answer: 'In my opinion, fast food is unhealthy because it has too much fat.', why: 'It has an opinion phrase, a claim, and a reason.' },
        { lead: 'Topic: Phones in class', q: 'Which sentence is the best?',
          options: ['I believe phones are bad in class because they can be a distraction.', 'I believe phones in class because it is a distraction for me.', 'I am agree that phones in class are good for students.'],
          answer: 'I believe phones are bad in class because they can be a distraction.', why: 'It has an opinion phrase, a claim, and a reason.' },
        { lead: 'Topic: Wearing a uniform', q: 'Which sentence is the best?',
          options: ['I think a uniform is good because it saves time.', 'I think a uniform because it is good for all students.', 'Uniform, yes. It is a good thing for students.'],
          answer: 'I think a uniform is good because it saves time.', why: 'It has an opinion phrase, a claim, and a reason.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan it', bloom: 'Apply',
      sub: 'Plan an opinion paragraph in 3 small steps.', does: 'Plan an opinion paragraph.',
      topic: 'Should students have part-time jobs?',
      slots: [
        { key: 'claim', mode: 'one', prompt: 'Choose the best claim.', options: [
          { t: 'In my opinion, students should have part-time jobs.', ok: true, why: 'It says what you think. It starts with an opinion phrase.' },
          { t: 'Many students have part-time jobs.', ok: false, why: 'This is only a fact. It does not say what you think.' },
          { t: 'I am agree with part-time jobs.', ok: false, why: 'Say “I agree”, not “I am agree”. This sentence also does not give a clear claim.' }
        ] },
        { key: 'reasons', mode: 'many', count: 2, prompt: 'Choose 2 reasons that support the claim.',
          hint: 'Ask: does it explain why students should have jobs?',
          whyOk: 'These two reasons explain why students should have part-time jobs.',
          options: [
            { t: 'Jobs teach responsibility.', ok: true },
            { t: 'Some jobs are in cafes.', ok: false },
            { t: 'Students can earn money.', ok: true },
            { t: 'Saturday is a weekend day.', ok: false },
            { t: 'Coffee is a drink.', ok: false },
            { t: 'My phone is new.', ok: false }
          ] },
        { key: 'other', mode: 'one', prompt: 'Choose the best other view and answer.', options: [
          { t: 'Some people think a job takes too much study time. However, students can choose a few hours on weekends.', ok: true, why: 'It shows another view and answers it.' },
          { t: 'Some people like coffee.', ok: false, why: 'This is not another view about part-time jobs.' },
          { t: 'Jobs are good, and I think so.', ok: false, why: 'This repeats your claim. It does not show another view.' }
        ] }
      ],
      rows: [
        { label: 'Claim', slot: 'claim', wait: 'Complete step 1' },
        { label: 'Reason 1', slot: 'reasons', i: 0, wait: 'Complete step 2' },
        { label: 'Reason 2', slot: 'reasons', i: 1, wait: 'Complete step 2' },
        { label: 'Other view and my answer', slot: 'other', wait: 'Complete step 3' }
      ],
      afterText: 'Your plan is ready. Now add an example for each reason in your own plan in your workbook, page {p2}.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn', bloom: 'Create',
      sub: 'Open your workbook to page {p2}. Plan first. Then write on page {p3}.',
      task: 'Write an opinion paragraph. State your claim, give at least 2 reasons with examples, and mention another view.',
      topics: ['Should students have part-time jobs?', 'Should students use phones in class?', 'Is it better to live at home or in a dormitory?'],
      framesTitle: 'Opinion language',
      frames: ['In my opinion, ______.', 'One reason is that ______. For example, ______.', 'Another reason is that ______. For instance, ______.', 'Some people think ______. However, ______.', 'For these reasons, I believe ______.'],
      levels: [
        { level: 'A1', text: '60 to 80 words. Write a claim and 2 reasons with because. Use the frames.' },
        { level: 'A2', text: '100 to 120 words.' },
        { level: 'B1', text: '130 to 160 words. Include another view and a stronger conclusion.' }
      ],
      checklist: [
        'My claim is clear in the first sentence.',
        'I gave at least 2 reasons.',
        'I gave an example for each reason.',
        'I mentioned another view.',
        'I used opinion phrases and a closing sentence.',
        'My writing is my own, and I wrote my tool-use declaration.'
      ],
      selfStudy: 'Brainstorm reasons and examples for your topic. Draft the paragraph. Ask one friend: “What is my claim?” They should be able to tell you.'
    }
  ],

  exit: {
    outcome: 'I can state my opinion and support it with reasons and examples.',
    questions: [
      { q: 'Which sentence is a claim?', options: ['For example, many families walk in the park.', 'Free parks give families a safe place.', 'In my opinion, parks should be free.'], answer: 2 },
      { q: 'Which phrase starts an example?', options: ['For instance', 'In my opinion', 'However'], answer: 0 }
    ]
  }
};
