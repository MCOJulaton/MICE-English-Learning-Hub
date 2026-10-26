/* Unit 6: Writing Short Emails: Make a Request. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 6,
  title: 'Writing Short Emails: Make a Request',
  output: 'Write a short email (40 to 60 words) to ask for something: information, a meeting time, or a document.',
  can: 'write a short, polite email to ask for something.',
  bloom: 'Understand, Apply, Create',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 5 before you start.', does: 'Remember polite phone phrases.',
      items: [
        { q: 'You need to ask who is calling. What do you say?', options: ['Who is calling, please?', 'Who are you? Tell me.', 'Name now.'], answer: 'Who is calling, please?', why: 'Please makes it polite.' },
        { q: 'Which phrase offers to take a message?', options: ['Can I take a message?', 'Can you call later?', 'Please wait here until I am free.'], answer: 'Can I take a message?', why: 'You offer to write the message.' }
      ]
    },
    {
      id: 'email', type: 'learn', title: 'The parts of an email', bloom: 'Understand',
      sub: 'A short email has a subject, a greeting, a request, thanks, and a closing.', does: 'Read a model email and find the parts.',
      points: [
        'Write a clear subject line: Question about the meeting room.',
        'Start with a greeting and a title: Dear Ms. Lee,',
        'Make one clear request: Could you please send me ___?',
        'Say thank you and close with your name: Thank you. Best regards, Nok Srisuk.'
      ],
      models: [
        {
          title: 'A model email (about 45 words)',
          hint: 'Tap each part to see what it does.',
          sentences: [
            { text: 'Subject: Question about the meeting room', kind: 'k1', tag: 'Subject', note: 'A short, clear subject. The reader knows the topic before opening it.' },
            { text: 'Dear Ms. Lee,', kind: 'k2', tag: 'Greeting', note: 'Dear + a title + a family name.' },
            { text: 'Could you please send me the price of the meeting room for Friday?', kind: 'k3', tag: 'Request', note: 'One clear request. Could you please ... is polite.' },
            { text: 'We need a room for 10 people from 9:00 to 12:00.', kind: 'k4', tag: 'Reason', note: 'A short reason or detail helps the reader answer.' },
            { text: 'Thank you for your help.', kind: 'k2', tag: 'Thanks', note: 'Always say thank you.' },
            { text: 'Best regards, Nok Srisuk', kind: 'k1', tag: 'Closing', note: 'A polite closing and your full name.' }
          ],
          after: 'Notice: five parts and one clear request. It is about 45 words.'
        },
        {
          title: 'Too direct or polite?',
          hint: 'Tap each sentence. Which one is better for work?',
          sentences: [
            { text: 'Send me the price now.', kind: 'k3', tag: 'Too direct', note: 'This sounds like an order. It has no please and no thank you.' },
            { text: 'Could you please send me the price? Thank you.', kind: 'k2', tag: 'Polite', note: 'Could you please ... and Thank you make it polite.' }
          ]
        }
      ],
      lang: {
        title: 'Email words',
        rows: [
          ['Subject', 'Question about ___. Meeting on ___. Request for ___.'],
          ['Greeting', 'Dear Ms. Lee, / Dear Mr. Tan, / Hello Anna, / Hi Anna,'],
          ['Request', 'Could you please send me ___? I would like to ask about ___. Could we meet on ___?'],
          ['Closing', 'Thank you. Best regards, ___. Kind regards, ___.']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each email sentence out loud until you can say it with no paper.', does: 'Say the email phrases out loud.',
      phrases: [
        { text: 'Dear Ms. Lee, I would like to ask about the room.', frame: 'Dear ___, I would ___ to ask about the ___.', keys: 'Ms. Lee / like / room', cue: 'Start an email and say what you ask about.' },
        { text: 'Could you please send me the price?', frame: 'Could you ___ send me the ___?', keys: 'please / price', cue: 'Make a polite request.' },
        { text: 'We need a room for 10 people on Friday.', frame: 'We ___ a ___ for 10 ___ on ___.', keys: 'need / room / people / Friday', cue: 'Give a short reason.' },
        { text: 'Thank you for your help.', frame: 'Thank ___ for your ___.', keys: 'you / help', cue: 'Say thank you.' },
        { text: 'Best regards, Nok Srisuk', frame: 'Best ___, ___ ___', keys: 'regards / your name', cue: 'Close with your name.' }
      ]
    },
    {
      id: 'parts', type: 'order', title: 'Put the email in order', bloom: 'Analyze',
      sub: 'The parts of an email follow an order.', does: 'Put the parts of an email in order.',
      prompt: 'Tap the lines in the order of an email.',
      hint: 'The subject comes first. The closing and your name come last.',
      sets: [{
        items: [
          'Subject: Question about the meeting room',
          'Dear Ms. Lee,',
          'Could you please send me the room price for Friday?',
          'We need a room for 10 people.',
          'Thank you for your help.',
          'Best regards, Nok Srisuk'
        ],
        why: 'An email goes: subject, greeting, request, reason, thanks, closing.'
      }]
    },
    {
      id: 'choose', type: 'choose', title: 'Choose the best words', bloom: 'Apply',
      sub: 'Choose the best subject, greeting, request, and closing.', does: 'Choose the best words for an email.',
      hint: 'Not this one. A good email is clear, polite, and short.',
      items: [
        { q: 'Which subject line is the best?', options: ['Question about the meeting room', 'Hello', 'Please read this message now'], answer: 'Question about the meeting room', why: 'It tells the reader the topic.' },
        { q: 'Which greeting is the best?', options: ['Dear Ms. Lee,', 'Hey Lee!', 'To you,'], answer: 'Dear Ms. Lee,', why: 'Dear + a title + a family name is polite.' },
        { q: 'Which request is the best?', options: ['Could you please send me the price?', 'Send me the price list now.', 'I want the price right now.'], answer: 'Could you please send me the price?', why: 'Could you please ... is polite.' },
        { q: 'Which closing is the best?', options: ['Thank you. Best regards, Nok Srisuk', 'Bye bye, see you. Nok Srisuk', 'Answer me soon. From, Nok Srisuk'], answer: 'Thank you. Best regards, Nok Srisuk', why: 'It says thank you and uses a full name.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Build an email', bloom: 'Apply',
      sub: 'Build a request email in 5 small steps.', does: 'Build a polite request email.',
      topic: 'You need information about a meeting room',
      slots: [
        { key: 'subject', mode: 'one', prompt: 'Choose the subject line.', options: [
          { t: 'Subject: Question about the meeting room', ok: true, why: 'Clear and short.' },
          { t: 'Subject: Hi', ok: false, why: 'The reader does not know the topic.' },
          { t: 'Subject: I have a big problem with everything', ok: false, why: 'This is too long and unclear.' }
        ] },
        { key: 'greeting', mode: 'one', prompt: 'Choose the greeting.', options: [
          { t: 'Dear Ms. Lee,', ok: true, why: 'Polite: Dear + title + family name.' },
          { t: 'Hey you,', ok: false, why: 'Too informal for a first email.' },
          { t: 'Lee,', ok: false, why: 'Too short and not polite.' }
        ] },
        { key: 'request', mode: 'one', prompt: 'Choose the request.', options: [
          { t: 'Could you please send me the room price for Friday?', ok: true, why: 'Polite, clear, and specific.' },
          { t: 'Send me the price now.', ok: false, why: 'This sounds like an order.' },
          { t: 'I want the price of Friday room.', ok: false, why: 'Not polite, and the grammar is wrong.' }
        ] },
        { key: 'reason', mode: 'one', prompt: 'Choose the reason.', options: [
          { t: 'We need a room for 10 people from 9:00 to 12:00.', ok: true, why: 'It gives the details the reader needs.' },
          { t: 'My friend has a new phone.', ok: false, why: 'This is not about the room.' },
          { t: 'The weather is hot.', ok: false, why: 'This does not help the reader answer.' }
        ] },
        { key: 'closing', mode: 'one', prompt: 'Choose the closing.', options: [
          { t: 'Thank you for your help. Best regards, Nok Srisuk', ok: true, why: 'It says thank you and gives a full name.' },
          { t: 'Bye. Nok', ok: false, why: 'Too short and not polite.' },
          { t: 'Answer me today. Nok', ok: false, why: 'This sounds like an order.' }
        ] }
      ],
      plannerTitle: 'Your email',
      rows: [
        { label: 'Subject', slot: 'subject', wait: 'Complete step 1' },
        { label: 'Greeting', slot: 'greeting', wait: 'Complete step 2' },
        { label: 'Request', slot: 'request', wait: 'Complete step 3' },
        { label: 'Reason', slot: 'reason', wait: 'Complete step 4' },
        { label: 'Thanks and closing', slot: 'closing', wait: 'Complete step 5' }
      ],
      afterText: 'The model email is ready (about 45 words). In class you will write your own.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'Write your request email.',
      task: 'Write an email of 40 to 60 words. Use one of the task cards. Include a subject, a greeting, one clear request, a reason, thanks, and a closing with your name. Then your partner checks it with the checklist.',
      condition: 'Write in 20 minutes, on a computer or on paper. You may use the email frame and the word bank.',
      cards: [
        { who: 'Task card A', text: 'Write to Ms. Lee at Sunrise Hotel. Ask for the price of a meeting room on Friday for 10 people.' },
        { who: 'Task card B', text: 'Write to Mr. Tan at Andaman Tours. Ask for a meeting next week. Say you want to talk about a tour for 20 guests.' },
        { who: 'Task card C', text: 'Write to Ms. Pim at Island Supply. Ask her to send the price list. Say you need 50 pens and 10 boxes of paper.' }
      ],
      frames: ['Subject: ___', 'Dear ___,', 'Could you please ___?', 'We need ___.', 'Thank you for your help.', 'Best regards, ___'],
      levels: [{ level: '40 to 60 words', text: 'Count the words. Short lines are fine.' }],
      checklist: [
        'My email has a subject, a greeting, a request, a reason, thanks, and a closing with my name.',
        'My request is clear and polite (Could you please ...?).',
        'My email is 40 to 60 words.',
        'I checked the spelling and the punctuation.',
        'I used no more than 3 mistakes that make the meaning unclear.'
      ],
      selfStudy: 'Rewrite your email and read it aloud. Write one more request email.'
    }
  ],

  exit: {
    outcome: 'I can write a short, polite email to ask for something.',
    questions: [
      { q: 'Which request is polite?', options: ['Send me the price list now.', 'I want the price right now.', 'Could you please send me the price?'], answer: 2 },
      { q: 'Which line is a good email closing?', options: ['Thank you. Best regards, Nok Srisuk', 'Bye bye, see you. Nok Srisuk', 'Answer now. From, Nok Srisuk'], answer: 0 }
    ]
  }
};
