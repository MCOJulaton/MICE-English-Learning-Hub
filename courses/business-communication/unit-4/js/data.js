/* Unit 4: Time and Schedules: Appointments. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 4,
  title: 'Time and Schedules: Appointments',
  output: 'Make, change, and cancel an appointment in a role-play (receptionist and customer) and write it correctly in a weekly calendar.',
  can: 'make, change, and cancel an appointment.',
  bloom: 'Understand, Apply',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 3 before you start.', does: 'Remember the present simple for work.',
      items: [
        { q: 'Anan ___ tourists to the beach every day.', options: ['takes', 'take', 'taking'], answer: 'takes', why: 'After a name, add s: takes.' },
        { q: 'Which sentence says what you use at work?', options: ['I use a computer and a phone.', 'I am use a computer.', 'I using phone computer.'], answer: 'I use a computer and a phone.', why: 'Use I use + tools.' }
      ]
    },
    {
      id: 'appointments', type: 'learn', title: 'Make an appointment', bloom: 'Understand',
      sub: 'Suggest a time, accept it, change it, or cancel it.', does: 'Hear how to make, change, and cancel an appointment.',
      points: [
        'Suggest a time: Are you free on Tuesday?',
        'Accept or refuse: Yes, that is fine. / I am sorry, I am busy.',
        'Change an appointment: Could we change it to Wednesday?',
        'Cancel politely: I am sorry, I need to cancel my appointment.'
      ],
      models: [
        {
          title: 'Making an appointment on the phone',
          hint: 'Tap each line to hear it. Or listen to the whole call.', audio: true,
          sentences: [
            { text: 'Hello. I would like to make an appointment, please.', kind: 'k2', tag: 'Customer', note: 'I would like to ... is polite.' },
            { text: 'Of course. Are you free on Monday the third?', kind: 'k1', tag: 'Receptionist', note: 'Suggest a day and a date.' },
            { text: 'I am sorry, I am busy on Monday. How about Tuesday the fourth?', kind: 'k2', tag: 'Customer', note: 'Say sorry, then suggest another day.' },
            { text: 'Tuesday is fine. What time would you like?', kind: 'k1', tag: 'Receptionist', note: 'Accept, then ask about the time.' },
            { text: 'Is two thirty OK?', say: 'Is two thirty okay?', kind: 'k2', tag: 'Customer', note: 'Two thirty is 2:30.' },
            { text: 'Yes, two thirty is fine. See you on Tuesday.', kind: 'k1', tag: 'Receptionist', note: 'Confirm the day and the time.' }
          ],
          after: 'Notice: suggest, refuse, suggest again, accept, confirm.'
        },
        {
          title: 'Changing and canceling',
          audio: true,
          sentences: [
            { text: 'I am sorry, I cannot come on Tuesday. Could we change it to Wednesday at ten o’clock?', kind: 'k2', tag: 'Change', note: 'Say sorry, say why you call, and suggest a new time.' },
            { text: 'Yes, Wednesday at ten o’clock is fine.', kind: 'k1', tag: 'Accept', note: 'Accept and repeat the new time.' },
            { text: 'I am sorry, I need to cancel my appointment.', kind: 'k2', tag: 'Cancel', note: 'This is how to cancel politely.' },
            { text: 'No problem. Thank you for calling.', kind: 'k1', tag: 'Reply', note: 'A polite reply to a cancellation.' }
          ]
        }
      ],
      lang: {
        title: 'Time and date words',
        rows: [
          ['Times', 'two o’clock (2:00). two thirty or half past two (2:30). a quarter past two (2:15). a quarter to three (2:45).'],
          ['Days', 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Before noon: a.m. After noon: p.m.'],
          ['Dates', 'the first, the second, the third, the fourth, the fifth ... Say: Monday the third.']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the appointment phrases out loud.',
      phrases: [
        { text: 'Are you free on Tuesday?', frame: 'Are you ___ on ___?', keys: 'free / Tuesday', cue: 'Ask if the person is free on a day.' },
        { text: 'Yes, that is fine. / I am sorry, I am busy.', frame: 'Yes, that is ___. / I am ___, I am ___.', keys: 'fine / sorry / busy', cue: 'Accept a time, or say you are busy.' },
        { text: 'Is two thirty OK?', say: 'Is two thirty okay?', frame: 'Is ___ ___ OK?', keys: 'two / thirty', cue: 'Suggest a time.' },
        { text: 'Could we change it to Wednesday at ten o’clock?', frame: 'Could we ___ it to ___ at ___?', keys: 'change / Wednesday / ten', cue: 'Ask to change the appointment.' },
        { text: 'I am sorry, I need to cancel my appointment.', frame: 'I am ___, I ___ to ___ my ___.', keys: 'sorry / need / cancel', cue: 'Cancel the appointment politely.' }
      ]
    },
    {
      id: 'times', type: 'choose', title: 'Listen to times and days', bloom: 'Understand',
      sub: 'Listen. Choose the right time or day.', does: 'Hear times, days, and dates.',
      hint: 'Not this one. Listen again slowly. Think about half past, a quarter past, and a quarter to.',
      items: [
        { say: 'The meeting is at half past nine.', q: 'What time is the meeting?', options: ['9:30', '9:15', '9:45'], answer: '9:30', why: 'Half past nine is 9:30.' },
        { say: 'The appointment is at a quarter to four.', q: 'What time is the appointment?', options: ['3:45', '4:15', '4:45'], answer: '3:45', why: 'A quarter to four is 3:45.' },
        { say: 'Could we meet on Tuesday the fourth?', q: 'Which day and date do you hear?', options: ['Tuesday the 4th', 'Tuesday the 14th', 'Thursday the 4th'], answer: 'Tuesday the 4th', why: 'You hear Tuesday and the fourth.' },
        { say: 'I am free at a quarter past two.', q: 'What time is the person free?', options: ['2:15', '2:30', '2:45'], answer: '2:15', why: 'A quarter past two is 2:15.' }
      ]
    },
    {
      id: 'calendar', type: 'dictate', title: 'Fill in the calendar', bloom: 'Apply',
      sub: 'Listen to a caller. Write the appointment.', does: 'Listen and write an appointment in a calendar.',
      prompt: 'Listen to the caller. Type the day, the date number, and the time.',
      hint: 'Listen again slowly. Write the day, then the date, then the time.',
      items: [
        { say: 'Hello. I would like an appointment. Can I come on Wednesday the sixth at ten o’clock?', q: 'Appointment 1',
          fields: [
            { label: 'Day', answer: 'Wednesday' },
            { label: 'Date (number)', answer: '6', numeric: true },
            { label: 'Time', answer: '10:00', accept: ['10', '10am', '10:00am'] }
          ], why: 'Wednesday the 6th at 10:00.' },
        { say: 'Good morning. Can I change my appointment? Friday the eighth at a quarter past two, please.', q: 'Appointment 2',
          fields: [
            { label: 'Day', answer: 'Friday' },
            { label: 'Date (number)', answer: '8', numeric: true },
            { label: 'Time', answer: '2:15', accept: ['2:15pm', '14:15'] }
          ], why: 'Friday the 8th at 2:15.' }
      ]
    },
    {
      id: 'order', type: 'order', title: 'Put the call in order', bloom: 'Analyze',
      sub: 'A call has steps. Find the order.', does: 'Put an appointment call in order.',
      prompt: 'Tap the lines in the order of the call.',
      hint: 'First the greeting, last the thanks.',
      sets: [{
        items: [
          'Good morning. Andaman Tours. How can I help you?',
          'I would like to make an appointment, please.',
          'Are you free on Tuesday?',
          'Yes. Tuesday at two thirty is fine.',
          'Thank you. See you on Tuesday.'
        ],
        why: 'The call goes: greeting, request, suggestion, acceptance, thanks.'
      }]
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'Make, change, and cancel an appointment.',
      task: 'Work in pairs. The customer calls the receptionist. Find a time when you are both free and make an appointment. Then change it. Then cancel it. Write each change in your calendar.',
      condition: 'Each person has a different calendar. Do not show your calendar. Sit so you cannot see your partner’s paper. No script on paper.',
      cards: [
        { who: 'Receptionist calendar', text: 'Monday: busy all day. Tuesday: free 9:00 to 12:00. Wednesday: free after 2:00 p.m. Thursday: busy. Friday: free 10:00 to 1:00.' },
        { who: 'Customer calendar', text: 'Monday: free all day. Tuesday: busy in the morning, free after 1:00 p.m. Wednesday: free 2:00 to 4:00. Thursday: busy. Friday: free all day.' },
        { who: 'The tasks', text: 'First, make an appointment. Next, the customer changes it to another day. Last, the customer cancels it. Swap roles and do it again.' }
      ],
      phrases: [
        { text: 'I would like to make an appointment, please.' },
        { text: 'Are you free on ___?' },
        { text: 'I am sorry, I am busy. How about ___?' },
        { text: 'Could we change it to ___?' },
        { text: 'I am sorry, I need to cancel my appointment.' }
      ],
      checklist: [
        'We made, changed, and canceled an appointment (3 of 3).',
        'I said the days, dates, and times correctly.',
        'I used polite phrases (Are you free ...? Could we ...? I am sorry ...).',
        'My calendar shows all 3 changes correctly.',
        'I understood the times the first or second time.'
      ],
      selfStudy: 'Write your own week calendar and say 3 appointments aloud.'
    }
  ],

  exit: {
    outcome: 'I can make, change, and cancel an appointment.',
    questions: [
      { q: 'Which time is 2:30?', options: ['A quarter past two', 'Half past two', 'Half past three'], answer: 1 },
      { q: 'You cannot come to your appointment. What do you say?', options: ['I am sorry, I cannot come. Could we change it?', 'No, I do not come to the appointment.', 'This appointment is bad. Change it now.'], answer: 0 }
    ]
  }
};
