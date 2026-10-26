/* Unit 2: Contact Details: Names, Numbers, and Email. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 2,
  title: 'Contact Details: Names, Numbers, and Email',
  output: 'At a reception desk, take a visitor’s details: name, company, phone, and email. Ask them to spell, read the details back, and write everything correctly on a visitor form.',
  can: 'take a visitor’s details, check them, and write them on a form.',
  bloom: 'Understand, Apply',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 1 before you start.', does: 'Remember how to introduce yourself.',
      items: [
        { q: 'Which sentence is correct?', options: ['I work at Sunrise Hotel.', 'I am work at Sunrise Hotel.', 'I works at Sunrise Hotel.'], answer: 'I work at Sunrise Hotel.', why: 'Use I work at + a place. The verb has no s after I.' },
        { say: 'Good afternoon, Ms. Lee. I am Anan. I am a tour guide.', q: 'What is Anan’s job?', options: ['He is a tour guide.', 'He is a cashier.', 'He is a student.'], answer: 'He is a tour guide.', why: 'Anan says: I am a tour guide.' }
      ]
    },
    {
      id: 'reception', type: 'learn', title: 'At the reception desk', bloom: 'Understand',
      sub: 'Ask for details, ask to spell, and read them back.', does: 'Hear a reception conversation.',
      points: [
        'Ask politely: May I have your name, please?',
        'If you do not understand: Could you say that again, please? Could you spell that, please?',
        'Read the details back: Is that ___? This makes sure you have it right.'
      ],
      models: [{
        title: 'At the desk: a receptionist and a visitor',
        hint: 'Tap each line to hear it. Or listen to the whole dialogue.', audio: true,
        sentences: [
          { text: 'Good morning. How can I help you?', kind: 'k1', tag: 'Receptionist', note: 'A polite opening.' },
          { text: 'Good morning. I have a meeting with Mr. Tan.', kind: 'k2', tag: 'Visitor', note: 'The visitor says why he is here.' },
          { text: 'May I have your name, please?', kind: 'k1', tag: 'Receptionist', note: 'A polite request for the name.' },
          { text: 'My name is Somchai Wong.', kind: 'k2', tag: 'Visitor', note: 'The visitor gives his name.' },
          { text: 'Could you spell that, please?', kind: 'k1', tag: 'Receptionist', note: 'Ask for the spelling when a name is new.' },
          { text: 'S-O-M-C-H-A-I. W-O-N-G.', say: 'S, O, M, C, H, A, I. W, O, N, G.', kind: 'k2', tag: 'Visitor', note: 'The visitor says each letter.' },
          { text: 'And your phone number?', kind: 'k1', tag: 'Receptionist', note: 'A short question for the next detail.' },
          { text: 'It is 081 234 5678.', say: 'It is zero eight one, two three four, five six seven eight.', kind: 'k2', tag: 'Visitor', note: 'Say phone numbers in groups. You can say zero or oh.' },
          { text: 'Is that 081 234 5678?', say: 'Is that zero eight one, two three four, five six seven eight?', kind: 'k1', tag: 'Receptionist', note: 'Read the number back to check.' },
          { text: 'Yes, that is right. Thank you.', kind: 'k2', tag: 'Visitor', note: 'The visitor confirms.' }
        ],
        after: 'Notice: ask, spell, read back, confirm.'
      }],
      lang: {
        title: 'Useful words',
        rows: [
          ['Easy to mix up', 'B and P. E and I. G and J. M and N. Say: B for Bangkok, P for Phuket.'],
          ['Numbers', '0 is zero or oh. Say phone numbers in small groups: 081, 234, 5678. Double 5 means 55.'],
          ['Email', 'Say at for the @ sign, dot for the . sign, dash for a short line, and underscore for a low line. anna.lee@sunrise.com is: anna dot lee at sunrise dot com.']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the reception phrases out loud.',
      phrases: [
        { text: 'May I have your name, please?', frame: 'May I ___ your ___, please?', keys: 'may / have / name', cue: 'Ask for the visitor’s name politely.' },
        { text: 'Could you spell that, please?', frame: 'Could you ___ that, ___?', keys: 'spell / please', cue: 'Ask the visitor to spell the name.' },
        { text: 'Could you say that again, please?', frame: 'Could you ___ that ___, please?', keys: 'say / again', cue: 'You did not hear. Ask again politely.' },
        { text: 'Is that 081 234 5678?', say: 'Is that zero eight one, two three four, five six seven eight?', frame: 'Is ___ 081 ___ 5678?', keys: 'is / that / number', cue: 'Read the phone number back to check it.' },
        { text: 'Please sign in and take a seat.', frame: 'Please ___ in and ___ a ___.', keys: 'sign / take / seat', cue: 'Ask the visitor to sign in and sit down.' }
      ]
    },
    {
      id: 'letters', type: 'dictate', title: 'Listen to letters', bloom: 'Apply',
      sub: 'Listen to the letters. Type the word.', does: 'Hear and write letters.',
      prompt: 'Type the word you hear. Listen slowly if you need to.',
      hint: 'Listen again slowly. Write each letter, then put them together.',
      items: [
        { say: 'S, O, M, C, H, A, I', q: 'A name', answer: 'Somchai', why: 'S, O, M, C, H, A, I is Somchai.' },
        { say: 'W, O, N, G', q: 'A family name', answer: 'Wong', why: 'W, O, N, G is Wong.' },
        { say: 'P, H, U, K, E, T', q: 'A place', answer: 'Phuket', why: 'P, H, U, K, E, T is Phuket.' },
        { say: 'B, A, N, G, K, O, K', q: 'A place', answer: 'Bangkok', why: 'B, A, N, G, K, O, K is Bangkok.' }
      ]
    },
    {
      id: 'numbers', type: 'dictate', title: 'Listen to numbers and emails', bloom: 'Apply',
      sub: 'Type the phone number or the email address.', does: 'Hear and write phone numbers and email addresses.',
      prompt: 'Type what you hear. For a phone number, write the digits. For an email, use @ and dots.',
      hint: 'Listen again slowly. Write the digits or letters in small groups.',
      items: [
        { say: 'zero eight one, two three four, five six seven eight', q: 'A phone number', label: 'Phone number', numeric: true, answer: '0812345678', why: 'The number is 081 234 5678.' },
        { say: 'zero nine eight, seven six five, four three two one', q: 'A phone number', label: 'Phone number', numeric: true, answer: '0987654321', why: 'The number is 098 765 4321.' },
        { say: 'anna dot lee at sunrise dot com', q: 'An email address', label: 'Email', answer: 'anna.lee@sunrise.com', why: 'anna dot lee at sunrise dot com is anna.lee@sunrise.com.' },
        { say: 'm dot tan at andaman dash tours dot com', q: 'An email address', label: 'Email', answer: 'm.tan@andaman-tours.com', why: 'Dash is a short line, so the address is m.tan@andaman-tours.com.' }
      ]
    },
    {
      id: 'form', type: 'dictate', title: 'Fill in the visitor form', bloom: 'Apply',
      sub: 'Listen to a visitor. Write the details on the form.', does: 'Listen and fill in a visitor form.',
      prompt: 'Listen to the visitor. Then type the details in the form.',
      hint: 'Listen again slowly. Check each box one by one.',
      items: [
        { say: 'Hello. My name is Mali Chai. I am from Island Supply. My phone number is zero eight nine, one two three, four five six seven. My email is mali at island dash supply dot com.',
          q: 'Visitor form',
          fields: [
            { label: 'Name', answer: 'Mali Chai' },
            { label: 'Company', answer: 'Island Supply' },
            { label: 'Phone', answer: '0891234567', numeric: true },
            { label: 'Email', answer: 'mali@island-supply.com' }
          ], why: 'Mali Chai, Island Supply, 089 123 4567, mali@island-supply.com.' }
      ]
    },
    {
      id: 'confirm', type: 'choose', title: 'Check and confirm', bloom: 'Apply',
      sub: 'Choose the best thing to say.', does: 'Choose polite phrases for checking details.',
      hint: 'Not this one. Be polite and ask for what you need.',
      items: [
        { q: 'You do not hear the visitor’s name. What do you say?', options: ['Could you say that again, please?', 'What? I cannot hear you at all.', 'Speak louder. I cannot hear you.'], answer: 'Could you say that again, please?', why: 'This is polite and clear.' },
        { q: 'You do not know how to write the name. What do you say?', options: ['Could you spell that, please?', 'Write your name for me right now.', 'I do not know your name at all.'], answer: 'Could you spell that, please?', why: 'Ask politely for the spelling.' },
        { q: 'You want to check the phone number. What do you say?', options: ['Is that 081 234 5678?', 'Your number is wrong. Say it again.', 'Say again the number to me.'], answer: 'Is that 081 234 5678?', why: 'Read the number back and ask Is that ...?' },
        { q: 'The visitor is ready. What do you say last?', options: ['Please sign in and take a seat.', 'Go over there and wait there now.', 'I am busy now. You must wait here.'], answer: 'Please sign in and take a seat.', why: 'This is polite and clear.' }
      ]
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'The reception desk role-play.',
      task: 'Work in pairs. Play the receptionist, then the visitor. The receptionist takes 4 details (name, company, phone, email), asks the visitor to spell, reads the details back, and writes them on the visitor form.',
      condition: 'Sit back to back. The receptionist can only listen. No script on paper. You may look at the phrase card.',
      cards: [
        { who: 'Visitor card 1', text: 'Your name is Pim Rattana. Your company is Sea Star Travel. Your phone number is 081 555 0142. Your email is pim@seastar.com.' },
        { who: 'Visitor card 2', text: 'Your name is Kitti Boon. Your company is Green Garden Cafe. Your phone number is 098 777 3021. Your email is kitti.boon@greengarden.com.' },
        { who: 'Receptionist', text: 'Greet the visitor. Ask for 4 details. Ask the visitor to spell at least 2 words. Read the details back. Write them on the form.' }
      ],
      phrases: [
        { text: 'Good morning. How can I help you?' },
        { text: 'May I have your name, please?' },
        { text: 'Could you spell that, please?' },
        { text: 'Could you say that again, please?' },
        { text: 'Is that ___?' },
        { text: 'Please sign in and take a seat.' }
      ],
      checklist: [
        'I took 4 details: name, company, phone, and email.',
        'I asked the visitor to spell at least 2 words.',
        'I read the details back with “Is that ...?”.',
        'At least 6 of the 7 boxes on my form are correct.',
        'I did not read from paper.'
      ],
      selfStudy: 'Practice spelling 5 names and 3 email addresses aloud.'
    }
  ],

  exit: {
    outcome: 'I can take a visitor’s details, check them, and write them on a form.',
    questions: [
      { q: 'You do not hear the name. What do you say?', options: ['Could you say that again, please?', 'Speak louder. I cannot hear you.', 'No, no, no. I do not understand you.'], answer: 0 },
      { q: 'Which email address is written correctly?', options: ['anna.lee@sunrise,com', 'anna.lee@sunrise.com', 'anna.lee sunrise.com'], answer: 1 }
    ]
  }
};
