/* Unit 5: On the Phone. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 5,
  title: 'On the Phone',
  output: 'Answer a business phone call: greet and give the company name, ask who is calling, put the caller on hold or transfer, take a message, write it on a message slip, and end politely.',
  can: 'answer a business call and take a message.',
  bloom: 'Apply, Analyze',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 4 before you start.', does: 'Remember times and appointments.',
      items: [
        { say: 'The meeting is at half past two.', q: 'What time is the meeting?', options: ['2:30', '2:15', '3:30'], answer: '2:30', why: 'Half past two is 2:30.' },
        { q: 'You cannot come to your appointment. What do you say?', options: ['I am sorry, I cannot come. Could we change it?', 'No, no. I do not come to your meeting.', 'Change it now. I am too busy today.'], answer: 'I am sorry, I cannot come. Could we change it?', why: 'This is polite and clear.' }
      ]
    },
    {
      id: 'call', type: 'learn', title: 'A business phone call', bloom: 'Understand',
      sub: 'Answer politely. Ask who is calling. Take a message.', does: 'Hear a business phone call.',
      points: [
        'Answer with the company name: Good morning, Sunrise Hotel. How can I help you?',
        'Ask who is calling: Who is calling, please?',
        'If the person is not there: Can I take a message?',
        'Read the number back, then end politely: Thank you for calling. Goodbye.'
      ],
      models: [{
        title: 'A call to Sunrise Hotel',
        hint: 'Tap each line to hear it. Or listen to the whole call.', audio: true,
        sentences: [
          { text: 'Good morning, Sunrise Hotel. How can I help you?', kind: 'k1', tag: 'Receptionist', note: 'Say the greeting and the company name.' },
          { text: 'Hello. Can I speak to Mr. Tan, please?', kind: 'k2', tag: 'Caller', note: 'The caller asks for a person.' },
          { text: 'Who is calling, please?', kind: 'k1', tag: 'Receptionist', note: 'Ask who the caller is.' },
          { text: 'This is Pim from Sea Star Travel.', kind: 'k2', tag: 'Caller', note: 'The caller says her name and company.' },
          { text: 'I am sorry, Mr. Tan is in a meeting. Can I take a message?', kind: 'k1', tag: 'Receptionist', note: 'Say sorry, say why, and offer to take a message.' },
          { text: 'Yes, please. Please ask him to call me back.', kind: 'k2', tag: 'Caller', note: 'This is the message.' },
          { text: 'Could I have your phone number, please?', kind: 'k1', tag: 'Receptionist', note: 'Ask for the number.' },
          { text: 'It is 081 555 0142.', say: 'It is zero eight one, five five five, zero one four two.', kind: 'k2', tag: 'Caller', note: 'Say the number in groups.' },
          { text: 'Let me read that back. 081 555 0142. Is that right?', say: 'Let me read that back. Zero eight one, five five five, zero one four two. Is that right?', kind: 'k1', tag: 'Receptionist', note: 'Read the number back.' },
          { text: 'Yes, thank you.', kind: 'k2', tag: 'Caller', note: 'The caller confirms.' },
          { text: 'I will give Mr. Tan your message. Thank you for calling. Goodbye.', kind: 'k1', tag: 'Receptionist', note: 'End the call politely.' }
        ],
        after: 'Notice: greet, ask who, offer a message, take the details, read back, end politely.'
      }],
      lang: {
        title: 'Useful phone words',
        rows: [
          ['Answer', 'Good morning, ___. How can I help you?'],
          ['Ask who', 'Who is calling, please? May I ask who is calling?'],
          ['Hold or transfer', 'One moment, please. I will put you through.'],
          ['Message', 'Can I take a message? Could I have your name and number?'],
          ['Slow down', 'Could you speak more slowly, please? Could you say that again?']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the phone phrases out loud.',
      phrases: [
        { text: 'Good morning, Sunrise Hotel. How can I help you?', frame: 'Good ___, ___ Hotel. How can I ___ you?', keys: 'morning / Sunrise / help', cue: 'Answer the phone with the company name.' },
        { text: 'Who is calling, please?', frame: 'Who is ___, ___?', keys: 'who / calling / please', cue: 'Ask who the caller is.' },
        { text: 'One moment, please. I will put you through.', frame: 'One ___, please. I will ___ you ___.', keys: 'moment / put / through', cue: 'Ask the caller to wait. Then transfer the call.' },
        { text: 'I am sorry, he is in a meeting. Can I take a message?', frame: 'I am ___, he is in a ___. Can I ___ a ___?', keys: 'sorry / meeting / take / message', cue: 'The person is not available. Offer a message.' },
        { text: 'Could you speak more slowly, please?', frame: 'Could you ___ more ___, please?', keys: 'speak / slowly', cue: 'The caller speaks too fast. Ask politely.' }
      ]
    },
    {
      id: 'slip', type: 'dictate', title: 'Fill in a message slip', bloom: 'Apply',
      sub: 'Listen to a message. Write it on the slip.', does: 'Listen to a message and write it on a slip.',
      prompt: 'Listen to the message. Type the details on the slip.',
      hint: 'Listen again slowly. Check the name, the company, and the number.',
      items: [
        { say: 'Hello. This is Pim from Sea Star Travel. Please ask Mr. Tan to call me back. My number is zero eight one, five five five, zero one four two.', q: 'Message slip 1',
          fields: [
            { label: 'Caller', answer: 'Pim' },
            { label: 'Company', answer: 'Sea Star Travel' },
            { label: 'For', answer: 'Mr. Tan', accept: ['Mr Tan', 'Tan'] },
            { label: 'Phone', answer: '0815550142', numeric: true }
          ], why: 'Pim, Sea Star Travel, for Mr. Tan, 081 555 0142.' },
        { say: 'Good afternoon. I am Anan from Andaman Tours. Please tell Ms. Lee the bus is late. Call me at zero nine eight, seven seven seven, three zero two one.', q: 'Message slip 2',
          fields: [
            { label: 'Caller', answer: 'Anan' },
            { label: 'Company', answer: 'Andaman Tours' },
            { label: 'For', answer: 'Ms. Lee', accept: ['Ms Lee', 'Lee'] },
            { label: 'Phone', answer: '0987773021', numeric: true }
          ], why: 'Anan, Andaman Tours, for Ms. Lee, 098 777 3021.' }
      ]
    },
    {
      id: 'listen', type: 'choose', title: 'Listen to callers', bloom: 'Understand',
      sub: 'Listen. Choose what the caller wants.', does: 'Understand what callers want.',
      hint: 'Not this one. Listen again slowly for the key words.',
      items: [
        { say: 'Hello. Can I speak to Ms. Lee, please?', q: 'What does the caller want?', options: ['To speak to Ms. Lee.', 'To book a room.', 'To cancel the bus on Friday.'], answer: 'To speak to Ms. Lee.', why: 'The caller asks: Can I speak to Ms. Lee?' },
        { say: 'Hello. I would like to book a table for six people for tomorrow night.', q: 'What does the caller want?', options: ['To book a table.', 'To speak to the manager.', 'To change a time.'], answer: 'To book a table.', why: 'The caller says: I would like to book a table.' },
        { say: 'Sorry, the line is bad. Could you speak more slowly, please?', q: 'What does the person want?', options: ['Slower speaking.', 'A new phone number.', 'To leave a message.'], answer: 'Slower speaking.', why: 'The person asks you to speak more slowly.' }
      ]
    },
    {
      id: 'order', type: 'order', title: 'Put the call in order', bloom: 'Analyze',
      sub: 'Find the order of a call.', does: 'Put the steps of a phone call in order.',
      prompt: 'Tap the lines in the order of the call.',
      hint: 'First the greeting. Last the goodbye.',
      sets: [{
        items: [
          'Good morning, Sunrise Hotel. How can I help you?',
          'Can I speak to Mr. Tan, please?',
          'Who is calling, please?',
          'I am sorry, he is in a meeting. Can I take a message?',
          'Let me read that back. Is that right?',
          'Thank you for calling. Goodbye.'
        ],
        why: 'The call goes: greeting, request, who, message, read back, goodbye.'
      }]
    },
    {
      id: 'phrases', type: 'choose', title: 'Choose the best phrase', bloom: 'Apply',
      sub: 'Choose the best thing to say on the phone.', does: 'Choose polite phone phrases.',
      hint: 'Not this one. On the phone, be polite and clear.',
      items: [
        { q: 'The caller speaks too fast. What do you say?', options: ['Could you speak more slowly, please?', 'Too fast. I cannot hear you now.', 'Stop talking. Say it again now.'], answer: 'Could you speak more slowly, please?', why: 'It is polite and clear.' },
        { q: 'You need to ask who is calling. What do you say?', options: ['Who is calling, please?', 'Who are you? Tell me.', 'Name now.'], answer: 'Who is calling, please?', why: 'Please makes it polite.' },
        { q: 'Mr. Tan is not here. What do you say?', options: ['Sorry, he is not here. Can I take a message?', 'He is not here. Call again later.', 'No. He is not here. Goodbye now.'], answer: 'Sorry, he is not here. Can I take a message?', why: 'Say sorry and offer help.' },
        { q: 'The call is finished. What do you say?', options: ['Thank you for calling. Goodbye.', 'OK. The call is finished now.', 'Bye now. I am very busy today.'], answer: 'Thank you for calling. Goodbye.', why: 'It is a polite ending.' }
      ]
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'The phone call role-play, back to back.',
      task: 'Work in pairs, sitting back to back so you cannot see each other. The receptionist answers the call and takes a message. Write it on the message slip. Then swap roles with a new role card.',
      condition: 'No script on paper. You may look at the phrase card. You can ask the caller to repeat or spell.',
      cards: [
        { who: 'Caller card 1', text: 'You are Kitti Boon from Green Garden Cafe. You want to speak to Ms. Lee. She is not there. Leave a message: please call me back about the order. Your phone number is 098 777 3021.' },
        { who: 'Caller card 2', text: 'You are Mali Chai from Island Supply. You want to speak to Mr. Tan. He is in a meeting. Leave a message: the boxes arrive on Friday. Your phone number is 089 123 4567.' },
        { who: 'Receptionist', text: 'Answer with the company name. Ask who is calling. Say the person is not there. Take a message with name, number, and message. Read the number back. End politely.' }
      ],
      phrases: [
        { text: 'Good morning, ___. How can I help you?' },
        { text: 'Who is calling, please?' },
        { text: 'One moment, please. / I am sorry, he is in a meeting.' },
        { text: 'Can I take a message?' },
        { text: 'Let me read that back. Is that right?' },
        { text: 'Thank you for calling. Goodbye.' }
      ],
      checklist: [
        'I did all 6 steps: greet, ask who, hold or transfer, take a message, read back, end.',
        'My message slip has the name, the number, and the message, all correct.',
        'I used polite phone phrases.',
        'I understood without seeing my partner’s face.',
        'I ended the call politely.'
      ],
      selfStudy: 'Practice the 6 phone phrases aloud. Listen to 3 short calls and write the messages.'
    }
  ],

  exit: {
    outcome: 'I can answer a business call and take a message.',
    questions: [
      { q: 'How do you answer a business call?', options: ['Hello? Who is this? What do you want?', 'Good morning, Sunrise Hotel. How can I help you?', 'Yes? Speak now. I am very busy.'], answer: 1 },
      { q: 'The person is in a meeting. What do you say?', options: ['I am sorry, he is in a meeting. Can I take a message?', 'He is busy now. Call back later. Goodbye.', 'No, he is not free. Call later.'], answer: 0 }
    ]
  }
};
