/* Unit 3: My Job: What Do You Do at Work? Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 3,
  title: 'My Job: What Do You Do at Work?',
  output: 'Describe a job in 1 minute (your real job, a part-time job, or a job you choose) and write a 5-sentence job profile.',
  can: 'describe a job and write a short job profile.',
  bloom: 'Understand, Apply',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 2 before you start.', does: 'Remember phone numbers and polite phrases.',
      items: [
        { say: 'zero eight one, two three four, five six seven eight', q: 'Which phone number do you hear?', options: ['081 234 5678', '081 234 5687', '018 234 5678'], answer: '081 234 5678', why: 'The number is 081 234 5678.' },
        { q: 'You want the spelling of a name. What do you say?', options: ['Could you spell that, please?', 'Write it down for me now, please.', 'I do not know how to spell it.'], answer: 'Could you spell that, please?', why: 'This is polite and clear.' }
      ]
    },
    {
      id: 'job', type: 'learn', title: 'What do you do every day?', bloom: 'Understand',
      sub: 'Use the present simple to talk about your work.', does: 'Learn how to talk about your daily work.',
      points: [
        'Use the present simple for what you do every day: I answer the phone. I check emails.',
        'Add s after he, she, or a name: Nok answers the phone. He drives a bus.',
        'Say what you use: I use a computer and a phone.',
        'Say what you like: I like helping people.'
      ],
      models: [
        {
          title: 'Nok talks about her job',
          hint: 'Tap each line to hear it. Or listen to the whole talk.', audio: true,
          sentences: [
            { text: 'My name is Nok. I am a receptionist at Sunrise Hotel.', kind: 'k1', tag: 'Job', note: 'Say your name, your job, and your workplace first.' },
            { text: 'Every day, I welcome guests and I answer the phone.', kind: 'k2', tag: 'Duties', note: 'Say what you do every day. The verbs have no s after I.' },
            { text: 'I check emails and I book rooms.', kind: 'k2', tag: 'Duties', note: 'Two more duties.' },
            { text: 'I use a computer and a phone.', kind: 'k4', tag: 'Tools', note: 'Say what you use at work.' },
            { text: 'I like helping people.', kind: 'k3', tag: 'Like', note: 'End with something you like about the job.' }
          ],
          after: 'Notice: job, duties, tools, what you like.'
        },
        {
          title: 'Anan talks about a colleague: he and she need s',
          audio: true,
          sentences: [
            { text: 'Anan is a tour guide.', kind: 'k1', tag: 'Job', note: 'Anan is a man, so we say he.' },
            { text: 'He takes tourists to the beach.', kind: 'k2', tag: 'he + s', note: 'After he, she, or a name, the verb takes s: takes.' },
            { text: 'He explains the places in English.', kind: 'k2', tag: 'he + s', note: 'Explains has s too.' }
          ]
        }
      ],
      lang: {
        title: 'Useful words',
        rows: [
          ['Verbs for work', 'answer, check, write, call, help, serve, clean, drive, book, sell'],
          ['Tools', 'a computer, a phone, a printer, a cash register, a map'],
          ['What I like', 'I like helping people. I like working in a team. I enjoy meeting new people.']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the key sentences out loud.',
      phrases: [
        { text: 'I am a receptionist at Sunrise Hotel.', frame: 'I ___ a ___ at ___.', keys: 'am / receptionist / Sunrise Hotel', cue: 'Say your job and your workplace.' },
        { text: 'Every day, I answer the phone and check emails.', frame: 'Every day, I ___ the phone and ___ emails.', keys: 'answer / check', cue: 'Say two things you do every day.' },
        { text: 'She helps customers. He drives a bus.', frame: 'She ___ customers. He ___ a bus.', keys: 'helps / drives', cue: 'Say what two other people do.' },
        { text: 'I use a computer and a phone.', frame: 'I ___ a ___ and a ___.', keys: 'use / computer / phone', cue: 'Say what you use at work.' },
        { text: 'I like helping people.', frame: 'I ___ helping ___.', keys: 'like / people', cue: 'Say something you like about the job.' }
      ]
    },
    {
      id: 'listen', type: 'choose', title: 'Listen to jobs', bloom: 'Understand',
      sub: 'Listen. Choose the right answer. You can listen again.', does: 'Listen to people describe their jobs.',
      hint: 'Not this one. Listen again for the duties and the tools.',
      items: [
        { say: 'My name is Pim. I am a cashier at Island Mart. I scan products and take money. I say thank you to customers. I use a cash register. I like talking to people.', q: 'What does Pim use at work?',
          options: ['A cash register.', 'A bus and a map.', 'A big kitchen.'], answer: 'A cash register.', why: 'Pim says: I use a cash register.' },
        { say: 'My name is Pim. I am a cashier at Island Mart. I scan products and take money. I say thank you to customers. I use a cash register. I like talking to people.', q: 'What does Pim like?',
          options: ['Talking to people.', 'Driving a bus.', 'Writing reports.'], answer: 'Talking to people.', why: 'Pim says: I like talking to people.' },
        { say: 'Kitti is a driver at Andaman Tours. He drives tourists to the beach every day. He checks the bus and he cleans it. He likes meeting new people.', q: 'What does Kitti do every day?',
          options: ['He drives tourists to the beach.', 'He answers the phone every day.', 'He sells food at the market.'], answer: 'He drives tourists to the beach.', why: 'Kitti drives tourists to the beach every day.' }
      ]
    },
    {
      id: 'addS', type: 'choose', title: 'He, she, or I?', bloom: 'Apply',
      sub: 'Choose the correct verb.', does: 'Choose the correct present simple verb.',
      hint: 'Not this one. After I, you, we, and they, use the base verb. After he, she, or a name, add s.',
      items: [
        { q: 'Nok ___ the phone every day.', options: ['answers', 'answer', 'answering'], answer: 'answers', why: 'After a name, add s: answers.' },
        { q: 'I ___ emails every morning.', options: ['check', 'checks', 'checking'], answer: 'check', why: 'After I, use the base verb: check.' },
        { q: 'Anan ___ tourists to the beach.', options: ['takes', 'take', 'taking'], answer: 'takes', why: 'After a name, add s: takes.' },
        { q: 'They ___ customers at the hotel.', options: ['help', 'helps', 'helping'], answer: 'help', why: 'After they, use the base verb: help.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan your job profile', bloom: 'Apply',
      sub: 'Build a short job profile in 4 small steps.', does: 'Build a job profile from the right sentences.',
      topic: 'Nok’s job profile',
      slots: [
        { key: 'job', mode: 'one', prompt: 'Choose the best first sentence.', options: [
          { t: 'I am a receptionist at Sunrise Hotel.', ok: true, why: 'It says the job and the workplace.' },
          { t: 'I receptionist at Sunrise Hotel.', ok: false, why: 'Use I am a + a job.' },
          { t: 'I am work at Sunrise Hotel receptionist.', ok: false, why: 'Say: I am a receptionist at Sunrise Hotel.' }
        ] },
        { key: 'duties', mode: 'many', count: 3, prompt: 'Choose 3 correct sentences about duties.',
          hint: 'Ask: is it about work, and is the verb correct after I?',
          whyOk: 'These three sentences are about work and the verbs are correct.',
          options: [
            { t: 'I answer the phone.', ok: true },
            { t: 'I play football every night.', ok: false },
            { t: 'I welcome guests.', ok: true },
            { t: 'I answers the phone.', ok: false },
            { t: 'I check emails.', ok: true },
            { t: 'I am check emails.', ok: false }
          ] },
        { key: 'tools', mode: 'one', prompt: 'Choose the best sentence about tools.', options: [
          { t: 'I use a computer and a phone.', ok: true, why: 'Correct: I use + tools.' },
          { t: 'I uses a computer and a phone.', ok: false, why: 'After I, the verb has no s.' },
          { t: 'I use computer and phone a.', ok: false, why: 'Say: a computer and a phone.' }
        ] },
        { key: 'like', mode: 'one', prompt: 'Choose the best sentence about what you like.', options: [
          { t: 'I like helping people.', ok: true, why: 'Correct: I like + verb with ing.' },
          { t: 'I like to helping people.', ok: false, why: 'Say I like helping or I like to help.' },
          { t: 'I am like helping people.', ok: false, why: 'Do not use am before like.' }
        ] }
      ],
      plannerTitle: 'Your job profile',
      rows: [
        { label: 'Job and workplace', slot: 'job', wait: 'Complete step 1' },
        { label: 'Duty 1', slot: 'duties', i: 0, wait: 'Complete step 2' },
        { label: 'Duty 2', slot: 'duties', i: 1, wait: 'Complete step 2' },
        { label: 'Duty 3', slot: 'duties', i: 2, wait: 'Complete step 2' },
        { label: 'Tools', slot: 'tools', wait: 'Complete step 3' },
        { label: 'What I like', slot: 'like', wait: 'Complete step 4' }
      ],
      afterText: 'The model profile is ready. In class you will describe your own job and write 5 sentences.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'Describe a job, then write your job profile.',
      task: 'Describe a job for 1 minute. It can be your real job, a part-time job, or a job you choose. Your partner listens and fills in a table. Then write a 5-sentence job profile.',
      condition: 'Use keywords only, not sentences on paper. Write the profile on paper in class.',
      cards: [
        { who: 'Speaker', text: 'Say your job and workplace. Say 3 duties. Say one tool. Say one thing you like.' },
        { who: 'Listener', text: 'Fill in a table: workplace, duty 1, duty 2, duty 3, tool, one thing the speaker likes. Then say it back: So you work at ___.' }
      ],
      phrases: [
        { text: 'I am a ___ at ___.' },
        { text: 'Every day, I ___ and I ___.' },
        { text: 'She ___ . He ___ .' },
        { text: 'I use a ___ and a ___.' },
        { text: 'I like ___ing.' }
      ],
      checklist: [
        'I said the workplace, 3 duties, a tool, and something I like.',
        'I used the present simple correctly (I answer, she answers).',
        'My partner filled in the table from what they heard.',
        'My profile has 5 sentences with capital letters and periods.',
        'I used at least 5 workplace words.'
      ],
      selfStudy: 'Rewrite your job profile and say it aloud with no paper.'
    }
  ],

  exit: {
    outcome: 'I can describe a job and write a short job profile.',
    questions: [
      { q: 'Which sentence is correct?', options: ['She answer the phone.', 'She answering the phone.', 'She answers the phone.'], answer: 2 },
      { q: 'Which sentence says what you use at work?', options: ['I use a computer.', 'I am use a computer.', 'I using computer.'], answer: 0 }
    ]
  }
};
