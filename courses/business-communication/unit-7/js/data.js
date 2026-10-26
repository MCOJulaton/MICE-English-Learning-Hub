/* Unit 7: Replying to Emails: Confirm, Apologize, Change. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 7,
  title: 'Replying to Emails: Confirm, Apologize, Change',
  output: 'Reply to 2 emails in 30 to 50 words each: one confirms a meeting, and one says sorry and gives a new time.',
  can: 'reply to an email to confirm, say sorry, and change a time.',
  bloom: 'Apply, Analyze',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 6 before you start.', does: 'Remember the parts of an email.',
      items: [
        { q: 'Which line is a good email greeting?', options: ['Dear Ms. Lee,', 'Hey Lee!', 'To you,'], answer: 'Dear Ms. Lee,', why: 'Dear + a title + a family name is polite.' },
        { q: 'Which request is polite?', options: ['Could you please send me the price?', 'Send me the price list now.', 'I want the price right now.'], answer: 'Could you please send me the price?', why: 'Could you please ... is polite.' }
      ]
    },
    {
      id: 'reply', type: 'learn', title: 'Read and reply', bloom: 'Understand',
      sub: 'First read the email and find the questions. Then answer each one.', does: 'Read emails and the replies.',
      points: [
        'Start a reply with thanks: Thank you for your email.',
        'Answer every question in the email. Say yes or no, and give the time and the place.',
        'To say sorry: I am sorry, I cannot come because ___. To change a time: Could we meet at ___ instead?',
        'Close politely: See you then. Best regards, ___.'
      ],
      models: [
        {
          title: 'Email 1 and a reply that confirms',
          hint: 'Tap each line to see what it does.',
          sentences: [
            { text: 'Mr. Tan: Can we meet on Friday at 10:00 in Room 2? Please confirm.', kind: 'k1', tag: 'Email', note: 'Two things to answer: the time and the place.' },
            { text: 'Dear Mr. Tan, Thank you for your email.', kind: 'k2', tag: 'Reply', note: 'Start with thanks.' },
            { text: 'I can meet you on Friday at 10:00 in Room 2.', kind: 'k2', tag: 'Reply', note: 'This confirms the day, the time, and the place.' },
            { text: 'See you then. Best regards, Nok', kind: 'k2', tag: 'Reply', note: 'A polite ending.' }
          ]
        },
        {
          title: 'Email 2 and a reply that says sorry and changes the time',
          hint: 'Tap each line to see what it does.',
          sentences: [
            { text: 'Ms. Lee: Can you come to a meeting on Monday at 9:00?', kind: 'k1', tag: 'Email', note: 'The question is about Monday at 9:00.' },
            { text: 'Dear Ms. Lee, Thank you for your email.', kind: 'k2', tag: 'Reply', note: 'Start with thanks.' },
            { text: 'I am sorry, I cannot come on Monday at 9:00 because I have a class.', kind: 'k3', tag: 'Sorry', note: 'Say sorry and give a short reason.' },
            { text: 'Could we meet at 2:00 instead?', kind: 'k4', tag: 'New time', note: 'Suggest a new time.' },
            { text: 'Thank you for understanding. Best regards, Nok', kind: 'k2', tag: 'Reply', note: 'Thank the reader and close.' }
          ]
        }
      ],
      lang: {
        title: 'Reply words',
        rows: [
          ['Start', 'Thank you for your email. Thanks for letting me know.'],
          ['Confirm', 'I can meet you on ___ at ___. Yes, that is fine. See you then.'],
          ['Say sorry', 'I am sorry, I cannot come because ___.'],
          ['Change a time', 'Could we meet at ___ instead? Would ___ be better for you?']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each reply sentence out loud until you can say it with no paper.', does: 'Say the reply phrases out loud.',
      phrases: [
        { text: 'Thank you for your email.', frame: 'Thank ___ for your ___.', keys: 'you / email', cue: 'Start a reply.' },
        { text: 'I can meet you on Friday at 10:00.', frame: 'I ___ meet you on ___ at ___.', keys: 'can / Friday / 10:00', cue: 'Confirm a meeting.' },
        { text: 'I am sorry, I cannot come because I have a class.', frame: 'I am ___, I ___ come because I ___ a ___.', keys: 'sorry / cannot / have / class', cue: 'Say sorry and give a reason.' },
        { text: 'Could we meet at 2:00 instead?', frame: 'Could we ___ at ___ ___?', keys: 'meet / 2:00 / instead', cue: 'Suggest a new time.' },
        { text: 'See you then. Best regards, Nok', frame: 'See you ___. Best ___, ___', keys: 'then / regards / name', cue: 'End the reply politely.' }
      ]
    },
    {
      id: 'find', type: 'choose', title: 'What must you answer?', bloom: 'Analyze',
      sub: 'Read the email. Find what you must answer.', does: 'Find the questions in an email.',
      hint: 'Not this one. Read the email again and look for the question or the request.',
      items: [
        { lead: 'Dear Nok, Can we meet on Friday at 10:00 in Room 2? Please confirm. Best regards, Tan Wei', q: 'What does Mr. Tan ask?', options: ['To meet on Friday at 10:00 in Room 2.', 'To send a price list to Room 2.', 'To cancel the bus on Friday.'], answer: 'To meet on Friday at 10:00 in Room 2.', why: 'He asks about Friday, 10:00, and Room 2.' },
        { lead: 'Dear Nok, Can you come to a meeting on Monday at 9:00? Best regards, Ms. Lee', q: 'What day and time does Ms. Lee suggest?', options: ['Monday at 9:00.', 'Friday at 9:00.', 'Monday at 2:00.'], answer: 'Monday at 9:00.', why: 'Ms. Lee asks about Monday at 9:00.' },
        { lead: 'Hello Nok, Our delivery is late. It will come on Thursday, not Wednesday. Is that OK? Best, Pim', q: 'What does Pim ask?', options: ['If Thursday is OK.', 'If you can pay today.', 'If you want a new order.'], answer: 'If Thursday is OK.', why: 'Pim asks: Is that OK? The new day is Thursday.' }
      ]
    },
    {
      id: 'best', type: 'choose', title: 'Choose the best reply', bloom: 'Analyze',
      sub: 'Choose the reply that answers the email.', does: 'Choose the reply that answers the email.',
      hint: 'Not this one. The best reply thanks the writer, answers the question, and is polite.',
      items: [
        { lead: 'Email: Can we meet on Friday at 10:00 in Room 2? Please confirm.', q: 'Which reply confirms the meeting?',
          options: ['Thank you for your email. I can come on Friday at 10:00.', 'OK. I do not know. Maybe I come, maybe not, I think.', 'Thank you. I like Fridays and I like big rooms, too.'], answer: 'Thank you for your email. I can come on Friday at 10:00.', why: 'It thanks the writer and confirms the day, the time, and the place.' },
        { lead: 'Email: Can you come to a meeting on Monday at 9:00?', q: 'You have a class on Monday at 9:00. Which reply is the best?',
          options: ['I am sorry, I have a class. Could we meet at 2:00 instead?', 'No. I have a class on Monday. Change the time now, please.', 'Monday is bad for me. Change it now. I do not like it.'], answer: 'I am sorry, I have a class. Could we meet at 2:00 instead?', why: 'It says sorry, gives a reason, and suggests a new time.' },
        { lead: 'Email: Our delivery is late. It will come on Thursday. Is that OK?', q: 'Thursday is fine for you. Which reply is the best?',
          options: ['Thank you for letting me know. Thursday is fine.', 'Thursday is OK. But do not be late again, please.', 'I do not like late orders. Thursday maybe, I think.'], answer: 'Thank you for letting me know. Thursday is fine.', why: 'It thanks the writer and answers the question clearly.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Build a reply', bloom: 'Apply',
      sub: 'Build a reply that says sorry and changes the time.', does: 'Build a reply that says sorry and changes the time.',
      topic: 'Ms. Lee asks: Can you come to a meeting on Monday at 9:00? You have a class.',
      slots: [
        { key: 'start', mode: 'one', prompt: 'Choose the start.', options: [
          { t: 'Dear Ms. Lee, Thank you for your email.', ok: true, why: 'A polite start.' },
          { t: 'Ms. Lee, I read it.', ok: false, why: 'This is too short and not polite.' },
          { t: 'Hello. Monday?', ok: false, why: 'This is too short. Start with thanks.' }
        ] },
        { key: 'sorry', mode: 'one', prompt: 'Choose the sentence that says sorry.', options: [
          { t: 'I am sorry, I cannot come on Monday because I have a class.', ok: true, why: 'It says sorry and gives a reason.' },
          { t: 'No, I do not come on Monday.', ok: false, why: 'This is too direct and gives no reason.' },
          { t: 'Sorry Monday class no.', ok: false, why: 'The grammar is not clear.' }
        ] },
        { key: 'newtime', mode: 'one', prompt: 'Choose the sentence that gives a new time.', options: [
          { t: 'Could we meet at 2:00 instead?', ok: true, why: 'It suggests a new time politely.' },
          { t: 'You must come at 2:00.', ok: false, why: 'This sounds like an order.' },
          { t: 'Meet 2:00 you.', ok: false, why: 'The grammar is not clear.' }
        ] },
        { key: 'end', mode: 'one', prompt: 'Choose the closing.', options: [
          { t: 'Thank you for understanding. Best regards, Nok', ok: true, why: 'A polite ending.' },
          { t: 'Bye. Nok', ok: false, why: 'Too short and not polite.' },
          { t: 'Answer me today. Nok', ok: false, why: 'This sounds like an order.' }
        ] }
      ],
      plannerTitle: 'Your reply',
      rows: [
        { label: 'Start', slot: 'start', wait: 'Complete step 1' },
        { label: 'Say sorry', slot: 'sorry', wait: 'Complete step 2' },
        { label: 'New time', slot: 'newtime', wait: 'Complete step 3' },
        { label: 'Closing', slot: 'end', wait: 'Complete step 4' }
      ],
      afterText: 'The model reply is ready (about 40 words). In class you will write two replies of your own.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'Write 2 replies.',
      task: 'Read the 2 emails your teacher gives you. Write a reply to each, 30 to 50 words each. Reply 1: confirm the meeting. Reply 2: say sorry, give a reason, and suggest a new time.',
      condition: 'Write in 25 minutes, on a computer or on paper. Use the word bank and the frames. Your partner checks your replies with the checklist.',
      cards: [
        { who: 'Email 1', text: 'From Mr. Tan: Can we meet on Thursday at 11:00 in the meeting room? Please confirm.' },
        { who: 'Email 2', text: 'From Ms. Lee: Can you send me the price list by Friday at 5:00? (You are in training on Friday. You can send it on Monday.)' }
      ],
      frames: ['Thank you for your email.', 'I can meet you on ___ at ___.', 'I am sorry, I cannot ___ because ___.', 'Could we ___ instead?', 'Best regards, ___'],
      checklist: [
        'Both replies answer every question in the email.',
        'Reply 1 confirms the day, the time, and the place.',
        'Reply 2 says sorry with a reason and gives a new time.',
        'Both replies have a greeting, thanks, and a closing.',
        'Each reply is 30 to 50 words.'
      ],
      selfStudy: 'Reply to one more email from a task card.'
    }
  ],

  exit: {
    outcome: 'I can reply to an email to confirm, say sorry, and change a time.',
    questions: [
      { q: 'Which sentence says sorry and gives a reason?', options: ['I am sorry, I cannot come because I have a class.', 'No, I do not come to the appointment.', 'Sorry. I have class. Bye now. See you.'], answer: 0 },
      { q: 'Which sentence suggests a new time?', options: ['You must come at 2:00 today.', 'Could we meet at 2:00 instead?', 'Two o’clock is better than nine.'], answer: 1 }
    ]
  }
};
