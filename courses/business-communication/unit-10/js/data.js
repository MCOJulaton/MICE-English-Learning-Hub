/* Unit 10: Customer Service: Helping and Solving Problems. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 10,
  title: 'Customer Service: Helping and Solving Problems',
  output: 'Handle a customer request and a small problem in a 2-minute role-play: listen, ask a question, offer help, apologize, give a solution, check, and thank.',
  can: 'help a customer and solve a small problem politely.',
  bloom: 'Apply, Analyze',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 9 before you start.', does: 'Remember prices and orders.',
      items: [
        { q: '5 boxes at 120 baht each. What is the total?', options: ['600 baht', '500 baht', '125 baht'], answer: '600 baht', why: '5 times 120 is 600.' },
        { q: 'Which question asks for a quantity?', options: ['How many would you like?', 'How much is it?', 'When will it arrive?'], answer: 'How many would you like?', why: 'Use How many for things you can count.' }
      ]
    },
    {
      id: 'service', type: 'learn', title: 'Solve a problem for a customer', bloom: 'Understand',
      sub: 'Listen, say sorry, give a solution, check, and thank.', does: 'Hear a customer service conversation.',
      points: [
        'Offer help: How can I help you? What is the problem?',
        'Say sorry and show you understand: I am sorry about that. I understand.',
        'Give a solution: I will send a new one tomorrow. We can give you a refund.',
        'Check and thank: Is there anything else? Thank you for your patience.'
      ],
      models: [{
        title: 'A wrong item',
        hint: 'Tap each line to hear it. Or listen to the whole conversation.', audio: true,
        sentences: [
          { text: 'Good afternoon. How can I help you?', kind: 'k1', tag: 'Staff', note: 'Offer help.' },
          { text: 'I ordered blue pens, but I got black pens.', kind: 'k2', tag: 'Customer', note: 'The customer explains the problem.' },
          { text: 'I am sorry about that. I understand. What is your order number?', kind: 'k1', tag: 'Staff', note: 'Say sorry, show you understand, and ask a question.' },
          { text: 'It is A 1 2 3.', say: 'It is A, one, two, three.', kind: 'k2', tag: 'Customer', note: 'The customer gives the order number.' },
          { text: 'Thank you. I will send the blue pens tomorrow.', kind: 'k1', tag: 'Staff', note: 'Give a clear solution with a day.' },
          { text: 'That is great, thank you.', kind: 'k2', tag: 'Customer', note: 'The customer is satisfied.' },
          { text: 'Is there anything else I can help you with?', kind: 'k1', tag: 'Staff', note: 'Check if the customer needs more help.' },
          { text: 'No, that is all.', kind: 'k2', tag: 'Customer', note: 'The customer says no more.' },
          { text: 'Thank you for your patience. Goodbye.', kind: 'k1', tag: 'Staff', note: 'End politely.' }
        ],
        after: 'Notice: offer help, listen, say sorry, solution, check, thank.'
      }],
      lang: {
        title: 'Service words',
        rows: [
          ['Offer help', 'How can I help you? Can I help you? What is the problem?'],
          ['Say sorry', 'I am sorry about that. I am sorry for the problem. I understand.'],
          ['Solutions', 'I will send a new one tomorrow. We can give you a refund. I will check it now.'],
          ['Close', 'Is there anything else? Thank you for your patience.']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the service phrases out loud.',
      phrases: [
        { text: 'How can I help you?', frame: 'How can I ___ you?', keys: 'help', cue: 'Offer help to the customer.' },
        { text: 'I am sorry about that. I understand.', frame: 'I am ___ about that. I ___.', keys: 'sorry / understand', cue: 'Say sorry and show you understand.' },
        { text: 'What is your order number?', frame: 'What is your ___ ___?', keys: 'order / number', cue: 'Ask for the order number.' },
        { text: 'I will send a new one tomorrow.', frame: 'I will ___ a ___ one ___.', keys: 'send / new / tomorrow', cue: 'Give a solution with a day.' },
        { text: 'Is there anything else? Thank you for your patience.', frame: 'Is there ___ else? Thank you for your ___.', keys: 'anything / patience', cue: 'Check and thank.' }
      ]
    },
    {
      id: 'problem', type: 'choose', title: 'What is the problem?', bloom: 'Understand',
      sub: 'Listen to the customer. Choose the problem.', does: 'Understand customer problems.',
      hint: 'Not this one. Listen again for the key words.',
      items: [
        { say: 'My order is late. I ordered it last week, and I still do not have it.', q: 'What is the problem?', options: ['The order is late.', 'The order is wrong.', 'The price is high.'], answer: 'The order is late.', why: 'The customer says: My order is late.' },
        { say: 'I asked for a large shirt, but I got a small shirt.', q: 'What is the problem?', options: ['The size is wrong.', 'The shirt is old.', 'The shirt is expensive.'], answer: 'The size is wrong.', why: 'The customer wanted large and got small.' },
        { say: 'The air conditioner in my room does not work. It is very hot.', q: 'What is the problem?', options: ['The air conditioner does not work.', 'The room is too small.', 'The bed is not clean.'], answer: 'The air conditioner does not work.', why: 'The customer says it does not work.' }
      ]
    },
    {
      id: 'order', type: 'order', title: 'Put the service steps in order', bloom: 'Analyze',
      sub: 'A good service call has steps.', does: 'Put the steps of a service call in order.',
      prompt: 'Tap the lines in the order of the call.',
      hint: 'First offer help. Last say thank you.',
      sets: [{
        items: [
          'How can I help you?',
          'The air conditioner in my room does not work.',
          'I am sorry about that. I understand.',
          'I will send someone to fix it in 10 minutes.',
          'Is there anything else I can help you with?',
          'Thank you for your patience.'
        ],
        why: 'The steps are: offer help, listen, say sorry, solution, check, thank.'
      }]
    },
    {
      id: 'polite', type: 'pick', title: 'Polite or not?', bloom: 'Analyze',
      sub: 'Some phrases help the customer. Some do not.', does: 'Find the polite service phrases.',
      prompt: 'Tap the 4 polite phrases. Then tap Check.',
      flag: 'polite',
      hint: 'Ask: would a customer feel respected?',
      sets: [{
        items: [
          { t: 'I am sorry about that.', on: true },
          { t: 'That is not my problem.', on: false },
          { t: 'I understand.', on: true },
          { t: 'Calm down.', on: false },
          { t: 'I will fix it today.', on: true },
          { t: 'You are wrong.', on: false },
          { t: 'Thank you for your patience.', on: true },
          { t: 'Wait. I am busy.', on: false }
        ],
        why: 'These four phrases show respect and help. The others sound rude.'
      }]
    },
    {
      id: 'solve', type: 'choose', title: 'Choose a solution', bloom: 'Apply',
      sub: 'Choose the best thing to say to the customer.', does: 'Choose a clear, polite solution.',
      hint: 'Not this one. A good solution is polite, clear, and has a day or an action.',
      items: [
        { lead: 'Customer: My order is late.', q: 'What do you say?', options: ['I am sorry about that. I will check it now.', 'It is late. Wait more, please. Do not call again.', 'That is the post office problem, not our problem.'], answer: 'I am sorry about that. I will check it now.', why: 'It says sorry and gives a clear action.' },
        { lead: 'Customer: I got the wrong size.', q: 'What do you say?', options: ['I am sorry. I will send the right size tomorrow.', 'The size is correct. Look at it again.', 'Please buy another one in the right size.'], answer: 'I am sorry. I will send the right size tomorrow.', why: 'It says sorry and gives a clear solution.' },
        { lead: 'Customer: The air conditioner does not work.', q: 'What do you say?', options: ['I understand. I will send someone now.', 'It is hot everywhere in the hotel today.', 'Use the fan and wait for the morning.'], answer: 'I understand. I will send someone now.', why: 'It shows understanding and gives a quick action.' }
      ]
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'The customer service role-play, 2 minutes.',
      task: 'Work in pairs. The customer has a problem. The staff member listens, says sorry, gives a solution, checks, and thanks the customer. Swap roles with a new card.',
      condition: 'No script on paper. You may look at the phrase card. The customer says they are satisfied only if the solution is clear and polite.',
      cards: [
        { who: 'Customer card 1', text: 'You ordered 10 blue pens, but you got 10 black pens. Your order number is B 2 0 5. You want the right pens.' },
        { who: 'Customer card 2', text: 'Your hotel room is too hot. The air conditioner does not work. You want it fixed now.' },
        { who: 'Staff card', text: 'Offer help. Listen. Say sorry. Ask a question. Give a solution with a day or a time. Check. Say thank you.' }
      ],
      phrases: [
        { text: 'How can I help you?' },
        { text: 'I am sorry about that. I understand.' },
        { text: 'What is your order number? / What is your room number?' },
        { text: 'I will send a new one tomorrow. / I will send someone now.' },
        { text: 'Is there anything else I can help you with?' },
        { text: 'Thank you for your patience.' }
      ],
      checklist: [
        'I did all 7 steps: offer help, listen, ask, say sorry, solution, check, thank.',
        'I used 4 or more service phrases correctly.',
        'My solution was clear, with a day or an action.',
        'I was calm and polite.',
        'The customer said they were satisfied.'
      ],
      selfStudy: 'Practice the service phrases aloud and write a short reply to a complaint.'
    }
  ],

  exit: {
    outcome: 'I can help a customer and solve a small problem politely.',
    questions: [
      { q: 'Which phrase says sorry and shows you understand?', options: ['I am sorry about that. I understand.', 'That is your problem, not our problem.', 'Please wait here until I am free.'], answer: 0 },
      { q: 'Which solution is clear?', options: ['Maybe later, maybe not today.', 'I will send a new one tomorrow.', 'We will see what happens next.'], answer: 1 }
    ]
  }
};
