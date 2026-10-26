/* Unit 8: Visitors and Directions: Around the Workplace. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const PLAN_PHOTO = {
  file: 'bc-u8-floorplan.png',
  alt: 'A floor plan of Sunrise Hotel offices. First floor: canteen, restroom, stairs, lobby, reception, elevator, and the main entrance at the bottom. Second floor: meeting room 1, meeting room 2, manager’s office, training room, restroom, elevator, and a hall at the bottom.',
  caption: 'The floor plan. On the first floor you are at the main entrance, at the bottom.'
};

const UNIT = {
  number: 8,
  title: 'Visitors and Directions: Around the Workplace',
  output: 'Welcome a visitor and give directions to 3 places on a floor plan in 1 minute, then write a 5-sentence message to a visitor that explains how to get to the meeting room.',
  can: 'welcome a visitor and give clear directions inside a building.',
  bloom: 'Understand, Apply',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 7 before you start.', does: 'Remember how to reply to an email.',
      items: [
        { q: 'Which sentence says sorry and gives a reason?', options: ['I am sorry, I cannot come because I have a class.', 'No, I do not come to the appointment.', 'Sorry. I have class. Bye now. See you.'], answer: 'I am sorry, I cannot come because I have a class.', why: 'It says sorry and gives a short reason.' },
        { q: 'Which sentence suggests a new time?', options: ['Could we meet at 2:00 instead?', 'You must come at 2:00 today.', 'Two o’clock is better than nine.'], answer: 'Could we meet at 2:00 instead?', why: 'It is polite and clear.' }
      ]
    },
    {
      id: 'welcome', type: 'learn', title: 'Welcome a visitor', bloom: 'Understand',
      photo: PLAN_PHOTO,
      sub: 'Welcome the visitor. Then tell them how to get there.', does: 'Hear how to give directions.',
      points: [
        'Welcome the visitor: Welcome to Sunrise Hotel. Please sign in.',
        'Say where a place is: next to, behind, opposite, on the second floor.',
        'Give directions: Go straight. Turn left. Turn right. Take the elevator.',
        'Put the steps in order: First, Then, Next, Finally.'
      ],
      models: [{
        title: 'At the reception desk',
        hint: 'Look at the floor plan. Tap each line to hear it, or listen to the whole dialogue.', audio: true,
        sentences: [
          { text: 'Welcome to Sunrise Hotel. How can I help you?', kind: 'k1', tag: 'Receptionist', note: 'A polite welcome.' },
          { text: 'I have a meeting with Mr. Tan.', kind: 'k2', tag: 'Visitor', note: 'The visitor says why he is here.' },
          { text: 'Please sign in. Mr. Tan is in meeting room 2, on the second floor.', kind: 'k1', tag: 'Receptionist', note: 'Say where the meeting is.' },
          { text: 'How do I get there?', kind: 'k2', tag: 'Visitor', note: 'The visitor asks for directions.' },
          { text: 'First, take the elevator next to reception to the second floor.', kind: 'k1', tag: 'Receptionist', note: 'Step 1: the elevator is next to reception.' },
          { text: 'Then, meeting room 2 is next to the manager’s office.', kind: 'k1', tag: 'Receptionist', note: 'Step 2: say where the room is.' },
          { text: 'Thank you very much.', kind: 'k2', tag: 'Visitor', note: 'The visitor says thank you.' },
          { text: 'You are welcome. Have a good meeting.', kind: 'k1', tag: 'Receptionist', note: 'A polite ending.' }
        ],
        after: 'Notice: welcome, sign in, where, how to get there, polite ending.'
      }],
      lang: {
        title: 'Places and directions',
        rows: [
          ['Places', 'reception, lobby, elevator, stairs, restroom, canteen, meeting room, manager’s office, training room'],
          ['Where', 'next to, behind, in front of, opposite, on the left, on the right, on the second floor'],
          ['Directions', 'Go straight. Turn left. Turn right. Take the elevator. Take the stairs.'],
          ['Order', 'First, Then, Next, Finally.']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the direction phrases out loud.',
      phrases: [
        { text: 'Welcome to Sunrise Hotel. How can I help you?', frame: 'Welcome ___ Sunrise Hotel. How can I ___ you?', keys: 'to / help', cue: 'Welcome the visitor.' },
        { text: 'Please sign in and take a seat.', frame: 'Please ___ in and ___ a seat.', keys: 'sign / take', cue: 'Ask the visitor to sign in and sit.' },
        { text: 'First, take the elevator to the second floor.', frame: 'First, ___ the ___ to the ___ floor.', keys: 'take / elevator / second', cue: 'Give step 1.' },
        { text: 'Then, go straight. Turn left.', frame: 'Then, go ___. ___ left.', keys: 'straight / turn', cue: 'Give step 2.' },
        { text: 'Meeting room 2 is next to the manager’s office.', frame: 'Meeting room 2 is ___ to the ___.', keys: 'next / office', cue: 'Say where the room is.' }
      ]
    },
    {
      id: 'listen', type: 'choose', title: 'Listen to directions', bloom: 'Understand',
      photo: PLAN_PHOTO,
      sub: 'Look at the plan. Listen. Choose the place.', does: 'Listen to directions and find the place.',
      hint: 'Not this one. Look at the plan and listen again slowly.',
      items: [
        { say: 'The restroom is behind reception.', q: 'Where is the restroom on the first floor?', options: ['Behind reception.', 'Next to the canteen.', 'On the second floor.'], answer: 'Behind reception.', why: 'On the plan, the restroom is above reception, behind it.' },
        { say: 'The canteen is behind the lobby.', q: 'Where is the canteen?', options: ['Behind the lobby.', 'Next to the elevator.', 'On the second floor.'], answer: 'Behind the lobby.', why: 'On the plan, the canteen is above the lobby, behind it.' },
        { say: 'Take the elevator next to reception to the second floor. Meeting room 1 is on the left.', q: 'Where does the visitor go?', options: ['Meeting room 1.', 'Meeting room 2.', 'The training room.'], answer: 'Meeting room 1.', why: 'The speaker says: Meeting room 1.' },
        { say: 'The manager’s office is next to meeting room 2, on the second floor.', q: 'Where is the manager’s office?', options: ['Next to meeting room 2.', 'Next to the canteen.', 'On the first floor.'], answer: 'Next to meeting room 2.', why: 'The manager’s office is next to meeting room 2.' }
      ]
    },
    {
      id: 'look', type: 'choose', title: 'Use the plan', bloom: 'Apply',
      photo: PLAN_PHOTO,
      sub: 'Look at the plan. Choose the best sentence.', does: 'Say where places are on the plan.',
      hint: 'Not this one. Look at the plan again. Check the floor and the place next to it.',
      items: [
        { q: 'Where is the elevator on the first floor?', options: ['It is next to reception.', 'It is behind the canteen.', 'It is next to the entrance.'], answer: 'It is next to reception.', why: 'On the plan, the elevator is on the right of reception.' },
        { q: 'Where are the stairs on the first floor?', options: ['They are behind the elevator.', 'They are in front of reception.', 'They are next to the canteen.'], answer: 'They are behind the elevator.', why: 'On the plan, the stairs are above the elevator.' },
        { q: 'Where is meeting room 2?', options: ['It is next to the manager’s office.', 'It is behind reception.', 'It is on the first floor.'], answer: 'It is next to the manager’s office.', why: 'On the second floor, meeting room 2 is next to the manager’s office.' },
        { q: 'Where is the training room?', options: ['It is on the second floor, below meeting room 1.', 'It is on the first floor, in the lobby.', 'It is next to the stairs.'], answer: 'It is on the second floor, below meeting room 1.', why: 'The training room is on the second floor, below meeting room 1.' }
      ]
    },
    {
      id: 'order', type: 'order', title: 'Put the directions in order', bloom: 'Analyze',
      sub: 'Directions must be in the right order.', does: 'Put directions in order.',
      prompt: 'A visitor wants meeting room 2. Tap the lines in the right order.',
      hint: 'Welcome first. The place comes last.',
      sets: [{
        items: [
          'Welcome to Sunrise Hotel. Please sign in.',
          'First, take the elevator next to reception.',
          'Then, go to the second floor.',
          'Finally, meeting room 2 is next to the manager’s office.',
          'Have a good meeting.'
        ],
        why: 'Welcome, then the steps in order, then the place.'
      }]
    },
    {
      id: 'plan', type: 'plan', title: 'Write a message to a visitor', bloom: 'Apply',
      sub: 'Build a short message in 4 small steps.', does: 'Build a short message with directions.',
      topic: 'A message to Mr. Wong: how to get to meeting room 2',
      slots: [
        { key: 'welcome', mode: 'one', prompt: 'Choose the first sentence.', options: [
          { t: 'Dear Mr. Wong, welcome to Sunrise Hotel.', ok: true, why: 'A polite start with a welcome.' },
          { t: 'Mr. Wong, come here.', ok: false, why: 'This is not polite.' },
          { t: 'Hello. Where you are?', ok: false, why: 'This is not a welcome, and the grammar is wrong.' }
        ] },
        { key: 'signin', mode: 'one', prompt: 'Choose the second sentence.', options: [
          { t: 'Please sign in at reception.', ok: true, why: 'This is the first thing a visitor does.' },
          { t: 'Sign in at the canteen.', ok: false, why: 'The sign-in is at reception, not at the canteen.' },
          { t: 'Do not sign in.', ok: false, why: 'Visitors must sign in.' }
        ] },
        { key: 'route', mode: 'one', prompt: 'Choose the third sentence.', options: [
          { t: 'Then take the elevator next to reception to the second floor.', ok: true, why: 'This follows the plan: the elevator is next to reception.' },
          { t: 'Then take the stairs to the canteen.', ok: false, why: 'The meeting room is not at the canteen.' },
          { t: 'Then go behind to there.', ok: false, why: 'This is not clear.' }
        ] },
        { key: 'room', mode: 'one', prompt: 'Choose the fourth and fifth sentences.', options: [
          { t: 'Meeting room 2 is next to the manager’s office. See you there.', ok: true, why: 'It says where the room is and ends politely.' },
          { t: 'Meeting room 2 is in the lobby. Bye.', ok: false, why: 'Meeting room 2 is on the second floor.' },
          { t: 'Meeting room 2 far. Come fast.', ok: false, why: 'This is not polite or clear.' }
        ] }
      ],
      plannerTitle: 'Your message',
      rows: [
        { label: 'Sentence 1', slot: 'welcome', wait: 'Complete step 1' },
        { label: 'Sentence 2', slot: 'signin', wait: 'Complete step 2' },
        { label: 'Sentence 3', slot: 'route', wait: 'Complete step 3' },
        { label: 'Sentences 4 and 5', slot: 'room', wait: 'Complete step 4' }
      ],
      afterText: 'The model message is ready. In class you will write your own message with 5 sentences.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      photo: PLAN_PHOTO,
      sub: 'Give directions, then write a message.',
      task: 'Work in pairs. The guide welcomes the visitor and gives directions to 3 places on the floor plan. The visitor listens and repeats the route. Swap roles with new places. Then write a 5-sentence message to a visitor who is going to meeting room 2.',
      condition: 'The visitor cannot see the guide’s plan. No script on paper. Write the message on paper or on a computer.',
      cards: [
        { who: 'Round 1 places', text: 'Visitor 1 wants: the canteen, meeting room 1, and the restroom on the second floor.' },
        { who: 'Round 2 places', text: 'Visitor 2 wants: the manager’s office, the training room, and the stairs on the first floor.' }
      ],
      phrases: [
        { text: 'Welcome to ___. How can I help you?' },
        { text: 'First, take the elevator to the second floor.' },
        { text: 'Then, turn left. / Turn right.' },
        { text: '___ is next to / behind / opposite ___.' },
        { text: 'Finally, ___ is on your left.' }
      ],
      checklist: [
        'My visitor reached all 3 places.',
        'I used 4 or more direction words (turn left, go straight, next to, on the second floor).',
        'I welcomed the visitor politely.',
        'My message has 5 sentences in the right order.',
        'The visitor could say the route back to me.'
      ],
      selfStudy: 'Give directions at home or at school aloud. Review Units 1 to 8 for the midterm.'
    }
  ],

  exit: {
    outcome: 'I can welcome a visitor and give clear directions inside a building.',
    questions: [
      { q: 'Which sentence welcomes a visitor?', options: ['Come here now. I am waiting for you.', 'Welcome to Sunrise Hotel. How can I help you?', 'Who are you? What do you want here?'], answer: 1 },
      { q: 'Which sentence gives a direction?', options: ['Go straight. Turn left.', 'Is it far?', 'I do not know the way.'], answer: 0 }
    ]
  }
};
