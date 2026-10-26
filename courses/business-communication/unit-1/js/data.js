/* Unit 1: Hello at Work: Introducing Yourself. All text and answers live here (the engine is ../../js/lesson.js).
   Student-facing text: American English, A1 wording, no dashes. */

const UNIT = {
  number: 1,
  title: 'Hello at Work: Introducing Yourself',
  output: 'Introduce yourself to a new colleague or customer in 1 minute, then give them a business card you made.',
  can: 'introduce myself politely at work and give a business card.',
  bloom: 'Understand, Apply',
  minutes: 30,

  steps: [
    {
      id: 'meet', type: 'learn', title: 'Meet at work', bloom: 'Understand',
      sub: 'Greet, say who you are, say what you do, and say one thing you can do.', does: 'Hear a first meeting at work.',
      points: [
        'Greet politely: Good morning. Good afternoon. Good evening. Then say: Nice to meet you.',
        'Use a title with a family name: Mr. Tan, Ms. Lee.',
        'Say your name, your job or study, and where you work or study.',
        'Say one thing you can do: I can use Excel.'
      ],
      models: [{
        title: 'A first meeting: Nok and Mr. Tan',
        hint: 'Tap each line to hear it. Or listen to the whole dialogue.',
        audio: true,
        sentences: [
          { text: 'Good morning. I am Tan Wei, the sales manager. Nice to meet you.', kind: 'k1', tag: 'Mr. Tan', note: 'Mr. Tan greets, says his name and his job, and says Nice to meet you.' },
          { text: 'Good morning, Mr. Tan. Nice to meet you. My name is Nok.', kind: 'k2', tag: 'Nok', note: 'Nok greets with the title Mr. Tan, says Nice to meet you, and says her name.' },
          { text: 'I am a new receptionist at Sunrise Hotel.', kind: 'k2', tag: 'Nok', note: 'Nok says her job (receptionist) and her workplace (Sunrise Hotel).' },
          { text: 'Welcome, Nok. What can you do?', kind: 'k1', tag: 'Mr. Tan', note: 'Mr. Tan welcomes her and asks about her skills.' },
          { text: 'I can speak English, and I can use Excel.', kind: 'k2', tag: 'Nok', note: 'Nok says two skills with I can.' },
          { text: 'Great. Here is my business card.', kind: 'k1', tag: 'Mr. Tan', note: 'Mr. Tan gives his business card.' }
        ],
        after: 'Notice: greeting, name, job, workplace, skill. You will do the same in class.'
      }],
      lang: {
        title: 'Useful words',
        rows: [
          ['Greetings', 'Good morning (before 12:00). Good afternoon (12:00 to 5:00). Good evening (after 5:00).'],
          ['Titles', 'Mr. Tan (man). Ms. Lee (woman). Use a title and a family name.'],
          ['My job', 'I am a receptionist. I am a cashier. I am a tour guide. I am a student.'],
          ['My workplace', 'I work at Sunrise Hotel. I study business at the university.'],
          ['My skill', 'I can use Excel. I can speak English. I can drive.']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud. You see less and less, until you say it with no paper.', does: 'Say the key phrases out loud.',
      phrases: [
        { text: 'Good morning. Nice to meet you.', frame: 'Good ___. Nice to ___ you.', keys: 'morning / nice / meet', cue: 'Greet someone politely.' },
        { text: 'My name is Nok. I am a receptionist.', frame: 'My ___ is ___. I am a ___.', keys: 'name / Nok / receptionist', cue: 'Say your name and your job.' },
        { text: 'I work at Sunrise Hotel. I study business.', frame: 'I ___ at ___. I ___ ___.', keys: 'work / Sunrise Hotel / study / business', cue: 'Say where you work or what you study.' },
        { text: 'I can use Excel. I can speak English.', frame: 'I ___ use ___. I ___ speak ___.', keys: 'can / Excel / can / English', cue: 'Say two things you can do.' },
        { text: 'What do you do? Where do you work?', frame: 'What ___ you ___? Where ___ you ___?', keys: 'what / do / where / work', cue: 'Ask about the other person’s job and workplace.' }
      ]
    },
    {
      id: 'listen', type: 'choose', title: 'Listen to introductions', bloom: 'Understand',
      sub: 'Listen. Choose the right answer. You can listen again.', does: 'Listen to introductions and find the information.',
      hint: 'Not this one. Listen again and think about the job, the workplace, or the skill.',
      items: [
        { say: 'Hello. My name is Mali. I am a cashier at Island Mart.', q: 'What is Mali’s job?',
          options: ['She is a cashier.', 'She is a receptionist.', 'She is a tour guide.'], answer: 'She is a cashier.', why: 'Mali says: I am a cashier.' },
        { say: 'Good afternoon, Ms. Lee. I am Anan. I work at Andaman Tours. I am a tour guide.', q: 'Where does Anan work?',
          options: ['At Andaman Tours.', 'At Sunrise Hotel.', 'At Island Mart.'], answer: 'At Andaman Tours.', why: 'Anan says: I work at Andaman Tours.' },
        { say: 'Nice to meet you. I am a student. I study tourism. I can speak English and Thai.', q: 'What can the student do?',
          options: ['Speak English and Thai.', 'Use Excel and drive.', 'Cook and sing.'], answer: 'Speak English and Thai.', why: 'The student says: I can speak English and Thai.' }
      ]
    },
    {
      id: 'manners', type: 'choose', title: 'Choose the right words', bloom: 'Apply',
      sub: 'Choose what fits the time and the person.', does: 'Choose polite greetings and correct sentences.',
      hint: 'Not this one. Think about the time of day, the title, and the correct sentence.',
      items: [
        { q: 'It is 9:00 in the morning. You meet your manager, Mr. Tan. What do you say?',
          options: ['Good morning, Mr. Tan.', 'Good afternoon, Mr. Tan.', 'Good evening, Mr. Tan.'], answer: 'Good morning, Mr. Tan.', why: 'Use Good morning before 12:00.' },
        { q: 'It is 3:00 in the afternoon. A customer, Ms. Lee, comes to your desk. What do you say?',
          options: ['Good morning, Ms. Lee.', 'Good afternoon, Ms. Lee.', 'Good night, Ms. Lee.'], answer: 'Good afternoon, Ms. Lee.', why: 'Use Good afternoon from 12:00 to 5:00.' },
        { q: 'Which sentence is correct?',
          options: ['I am a receptionist at Sunrise Hotel.', 'I am work receptionist at Sunrise Hotel.', 'I receptionist at Sunrise Hotel.'], answer: 'I am a receptionist at Sunrise Hotel.', why: 'Use I am + a job: I am a receptionist.' },
        { q: 'Which sentence is correct?',
          options: ['I work at Andaman Tours.', 'I am work at Andaman Tours.', 'I works at Andaman Tours.'], answer: 'I work at Andaman Tours.', why: 'Use I work at + a place. The verb work has no s after I.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Plan your introduction', bloom: 'Apply',
      sub: 'Build a 1-minute introduction in 4 small steps.', does: 'Build an introduction from the right sentences.',
      topic: 'Nok introduces herself to a new colleague',
      slots: [
        { key: 'greet', mode: 'one', prompt: 'Choose the best greeting.', options: [
          { t: 'Good morning. Nice to meet you.', ok: true, why: 'A polite greeting and Nice to meet you.' },
          { t: 'Hi you. Bye.', ok: false, why: 'This is not polite, and Bye is for the end.' },
          { t: 'Good night. Nice to see.', ok: false, why: 'Good night is for going to bed. Say Nice to meet you.' }
        ] },
        { key: 'name', mode: 'one', prompt: 'Choose the best sentence for your name and job.', options: [
          { t: 'My name is Nok. I am a receptionist.', ok: true, why: 'Correct: My name is ... I am a ...' },
          { t: 'My name Nok. I receptionist.', ok: false, why: 'Use is after name, and am a before a job.' },
          { t: 'I am Nok. I am work receptionist.', ok: false, why: 'Do not use am with work. Say: I am a receptionist.' }
        ] },
        { key: 'place', mode: 'one', prompt: 'Choose the best sentence for your workplace.', options: [
          { t: 'I work at Sunrise Hotel.', ok: true, why: 'Correct: I work at + a place.' },
          { t: 'I am work in Sunrise Hotel.', ok: false, why: 'Do not use am with work.' },
          { t: 'I works at Sunrise Hotel.', ok: false, why: 'After I, the verb work has no s.' }
        ] },
        { key: 'skill', mode: 'one', prompt: 'Choose the best sentence for your skill.', options: [
          { t: 'I can use Excel and speak English.', ok: true, why: 'Correct: I can + a verb.' },
          { t: 'I can to use Excel.', ok: false, why: 'After can, do not use to.' },
          { t: 'I can uses Excel.', ok: false, why: 'After can, use the base verb: use.' }
        ] }
      ],
      plannerTitle: 'Your introduction',
      rows: [
        { label: 'Greeting', slot: 'greet', wait: 'Complete step 1' },
        { label: 'Name and job', slot: 'name', wait: 'Complete step 2' },
        { label: 'Workplace', slot: 'place', wait: 'Complete step 3' },
        { label: 'Skill', slot: 'skill', wait: 'Complete step 4' }
      ],
      afterText: 'Your model introduction is ready. In class you will make your own, with your own name, job, and skill.'
    },
    {
      id: 'card', type: 'pick', title: 'Check a business card', bloom: 'Analyze',
      sub: 'A business card must be correct. Find the 2 mistakes.', does: 'Find the mistakes on a business card.',
      prompt: 'This is Nok’s business card. Tap the 2 lines with a mistake. Then tap Check.',
      flag: 'mistake',
      hint: 'Look at the spelling of the job and at the email address.',
      sets: [{
        items: [
          { t: 'Name: Nok Srisuk', on: false },
          { t: 'Job: Receptionest', on: true },
          { t: 'Company: Sunrise Hotel', on: false },
          { t: 'Phone: 081 234 5678', on: false },
          { t: 'Email: nok.srisuk@sunrise,com', on: true }
        ],
        why: 'The job is receptionist, with an i. The email needs a dot before com, not a comma.'
      }]
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'The business mixer: introduce yourself to 3 partners.',
      task: 'Introduce yourself for 1 minute to 3 different partners. Say a greeting, your name, your job or study, your workplace or school, and one thing you can do. Ask your partner two questions. Then give your business card.',
      condition: 'Use 4 keywords on a small card. Do not read sentences from paper. Make your business card with your name, job, phone, and email.',
      cards: [
        { who: 'Speaker', text: 'Greet. Say your name. Say your job or study. Say your workplace or school. Say one skill with “I can ...”. Give your business card.' },
        { who: 'Listener', text: 'Listen. Then say: Nice to meet you. Ask: What do you do? Where do you work? Say thank you for the card.' }
      ],
      phrases: [
        { text: 'Good morning. Nice to meet you.' },
        { text: 'My name is ___. I am a ___.' },
        { text: 'I work at ___. / I study ___.' },
        { text: 'I can use ___. / I can speak ___.' },
        { text: 'What do you do? Where do you work?' },
        { text: 'Here is my business card.' }
      ],
      checklist: [
        'I greeted politely and said “Nice to meet you”.',
        'I said my name, my job or study, and my workplace or school.',
        'I said one skill with “I can ...”.',
        'I did not read from paper. I used keywords only.',
        'My business card has my name, job, phone, and email, all correct.'
      ],
      selfStudy: 'Practice your introduction aloud 3 times. Finish your business card.'
    }
  ],

  exit: {
    outcome: 'I can introduce myself politely at work and give a business card.',
    questions: [
      { q: 'It is 10:00 in the morning. You meet Ms. Lee. What do you say?', options: ['Good afternoon, Ms. Lee. Nice to meet you.', 'Good morning, Ms. Lee. Nice to meet you.', 'Good night, Ms. Lee. Nice to meet you.'], answer: 1 },
      { q: 'Which sentence is correct?', options: ['I works at Andaman Tours.', 'I am work at Andaman Tours.', 'I work at Andaman Tours.'], answer: 2 }
    ]
  }
};
