/* Unit 14: Getting a Job: CV and Application Email. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 14,
  title: 'Getting a Job: CV and Application Email',
  output: 'Write a one-page CV and a 50 to 70 word application email for a job advert.',
  can: 'write a simple CV and an email to apply for a job.',
  bloom: 'Apply, Create',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 13 before you start.', does: 'Remember chart words.',
      items: [
        { q: 'Sales were 70 in July and 50 in August. What do you say?', options: ['Sales went down.', 'Sales went up.', 'Sales stayed the same.'], answer: 'Sales went down.', why: '70 to 50 is lower, so sales went down.' },
        { q: 'Which month has the smallest number?', options: ['The lowest month', 'The highest month', 'The first month'], answer: 'The lowest month', why: 'The lowest month has the smallest number.' }
      ]
    },
    {
      id: 'advert', type: 'learn', title: 'Read a job advert', bloom: 'Understand',
      sub: 'Find the job, the duties, the skills, and how to apply.', does: 'Read a job advert and a model CV.',
      points: [
        'Read the advert first. Find the job, the duties, the skills they want, and how to apply.',
        'Match your skills to the advert: I can speak English. I can use a computer.',
        'A CV has: name, contact, education, skills, and experience.',
        'An application email is short: why you write, 2 reasons you fit the job, and a request for an interview.'
      ],
      models: [
        {
          title: 'A job advert',
          hint: 'Tap each line to see what to look for.',
          sentences: [
            { text: 'Job: Receptionist at Sunrise Hotel', kind: 'k1', tag: 'Job', note: 'The job and the place.' },
            { text: 'Duties: answer the phone, welcome guests, check emails.', kind: 'k2', tag: 'Duties', note: 'What you do every day.' },
            { text: 'Skills: good English, can use a computer, polite.', kind: 'k4', tag: 'Skills', note: 'What the hotel wants. Match your skills to these.' },
            { text: 'How to apply: send your CV and an email to jobs@sunrise.com.', kind: 'k3', tag: 'How to apply', note: 'Send two things: a CV and an email.' }
          ]
        },
        {
          title: 'A model CV',
          hint: 'Tap each line to see what it is.',
          sentences: [
            { text: 'Name: Nok Srisuk', kind: 'k1', tag: 'Name', note: 'Your full name at the top.' },
            { text: 'Phone: 081 234 5678. Email: nok.srisuk@email.com', kind: 'k1', tag: 'Contact', note: 'Phone and email. Check every digit and letter.' },
            { text: 'Education: 2022 to 2026, Bachelor of Business, Phuket Rajabhat University', kind: 'k2', tag: 'Education', note: 'Dates, degree, school.' },
            { text: 'Skills: I can speak English. I can use Word and Excel.', kind: 'k4', tag: 'Skills', note: 'Skills that match the advert.' },
            { text: 'Experience: Cafe assistant, Green Garden Cafe, 2024 to 2025', kind: 'k3', tag: 'Experience', note: 'Job, place, and dates.' }
          ]
        },
        {
          title: 'A model application email (about 55 words)',
          hint: 'Tap each line to see what it does.',
          sentences: [
            { text: 'Subject: Application for the receptionist job', kind: 'k1', tag: 'Subject', note: 'A clear subject.' },
            { text: 'Dear Hiring Manager,', kind: 'k2', tag: 'Greeting', note: 'Use this when you do not know the name.' },
            { text: 'I am writing to apply for the receptionist job at Sunrise Hotel.', kind: 'k2', tag: 'Purpose', note: 'Say why you write.' },
            { text: 'I can speak English and use a computer. I worked at a cafe for one year.', kind: 'k4', tag: 'Reasons', note: 'Two reasons you fit the job.' },
            { text: 'I would like an interview. Please find my CV below.', kind: 'k3', tag: 'Request', note: 'Ask for an interview.' },
            { text: 'Thank you. Best regards, Nok Srisuk', kind: 'k1', tag: 'Closing', note: 'Thank the reader and sign.' }
          ]
        }
      ]
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the application phrases out loud.',
      phrases: [
        { text: 'I am writing to apply for the receptionist job.', frame: 'I am ___ to ___ for the ___ job.', keys: 'writing / apply / receptionist', cue: 'Say why you write.' },
        { text: 'I can speak English and use a computer.', frame: 'I can ___ English and ___ a computer.', keys: 'speak / use', cue: 'Say two skills.' },
        { text: 'I worked at a cafe for one year.', frame: 'I ___ at a cafe for ___ ___.', keys: 'worked / one / year', cue: 'Say your experience.' },
        { text: 'I would like an interview.', frame: 'I ___ like an ___.', keys: 'would / interview', cue: 'Ask for an interview.' },
        { text: 'Thank you. Best regards, Nok Srisuk', frame: 'Thank ___. Best ___, ___', keys: 'you / regards / name', cue: 'Close the email.' }
      ]
    },
    {
      id: 'match', type: 'choose', title: 'Match your skills to the job', bloom: 'Analyze',
      sub: 'Read the advert. Choose the best skill to write about.', does: 'Choose skills that match a job advert.',
      hint: 'Not this one. Look at the skills in the advert and choose the one that matches.',
      items: [
        { lead: 'Advert: Receptionist at Sunrise Hotel. Skills: good English, can use a computer, polite.', q: 'Which sentence matches the advert best?', options: ['I can speak English and I can use a computer.', 'I can cook Thai food and drive a bus.', 'I can swim and play football.'], answer: 'I can speak English and I can use a computer.', why: 'These skills are in the advert.' },
        { lead: 'Advert: Tour guide at Andaman Tours. Skills: speaks English, knows Phuket, friendly.', q: 'Which sentence matches the advert best?', options: ['I speak English and I know Phuket well.', 'I can use Excel and fix computers.', 'I can write long reports.'], answer: 'I speak English and I know Phuket well.', why: 'These skills are in the advert.' },
        { lead: 'Advert: Cashier at Island Mart. Skills: good with numbers, friendly, can work on weekends.', q: 'Which sentence matches the advert best?', options: ['I am good with numbers and I can work on weekends.', 'I am good at music and I like dancing at night.', 'I like sleeping late on Sundays and Mondays.'], answer: 'I am good with numbers and I can work on weekends.', why: 'These skills are in the advert.' }
      ]
    },
    {
      id: 'cv', type: 'pick', title: 'Check a CV', bloom: 'Analyze',
      sub: 'A CV must be correct. Find the 2 mistakes.', does: 'Find mistakes on a CV.',
      prompt: 'This is Nok’s CV. Tap the 2 lines with a mistake. Then tap Check.',
      flag: 'mistake',
      hint: 'Look at the dates and at the email address.',
      sets: [{
        items: [
          { t: 'Name: Nok Srisuk', on: false },
          { t: 'Phone: 081 234 5678', on: false },
          { t: 'Email: nok.srisuk@email,com', on: true },
          { t: 'Education: 2026 to 2022, Bachelor of Business', on: true },
          { t: 'Skills: I can speak English. I can use Word and Excel.', on: false }
        ],
        why: 'The email needs a dot before com, not a comma. The dates must go from 2022 to 2026.'
      }]
    },
    {
      id: 'plan', type: 'plan', title: 'Build an application email', bloom: 'Apply',
      sub: 'Build a short application email in 5 small steps.', does: 'Build an application email.',
      topic: 'Apply for the receptionist job at Sunrise Hotel',
      slots: [
        { key: 'subject', mode: 'one', prompt: 'Choose the subject line.', options: [
          { t: 'Subject: Application for the receptionist job', ok: true, why: 'It tells the reader what the email is.' },
          { t: 'Subject: Hello', ok: false, why: 'It does not say what the email is.' },
          { t: 'Subject: Job job job', ok: false, why: 'It is not clear.' }
        ] },
        { key: 'purpose', mode: 'one', prompt: 'Choose the sentence that says why you write.', options: [
          { t: 'I am writing to apply for the receptionist job at Sunrise Hotel.', ok: true, why: 'It says why you write.' },
          { t: 'I want work now. Give me the job.', ok: false, why: 'It is not polite or clear.' },
          { t: 'I write to you because I am free.', ok: false, why: 'It does not say what you want.' }
        ] },
        { key: 'reasons', mode: 'one', prompt: 'Choose the sentence with two reasons you fit the job.', options: [
          { t: 'I can speak English and use a computer. I worked at a cafe for one year.', ok: true, why: 'Two skills and one experience, all matching the advert.' },
          { t: 'I like dancing. I have a new bag.', ok: false, why: 'This does not match the job.' },
          { t: 'I am the best. You must choose me.', ok: false, why: 'It sounds like an order and gives no reasons.' }
        ] },
        { key: 'ask', mode: 'one', prompt: 'Choose the request.', options: [
          { t: 'I would like an interview. Please find my CV below.', ok: true, why: 'It asks politely and points to the CV.' },
          { t: 'Call me today. I am waiting for you.', ok: false, why: 'It sounds like an order.' },
          { t: 'Maybe you can see me.', ok: false, why: 'It is not clear.' }
        ] },
        { key: 'close', mode: 'one', prompt: 'Choose the closing.', options: [
          { t: 'Thank you. Best regards, Nok Srisuk', ok: true, why: 'Polite, with a full name.' },
          { t: 'Bye. Nok', ok: false, why: 'Too short and not polite.' },
          { t: 'Answer soon. Nok', ok: false, why: 'It sounds like an order.' }
        ] }
      ],
      plannerTitle: 'Your email',
      rows: [
        { label: 'Subject', slot: 'subject', wait: 'Complete step 1' },
        { label: 'Why you write', slot: 'purpose', wait: 'Complete step 2' },
        { label: 'Two reasons', slot: 'reasons', wait: 'Complete step 3' },
        { label: 'Request', slot: 'ask', wait: 'Complete step 4' },
        { label: 'Closing', slot: 'close', wait: 'Complete step 5' }
      ],
      afterText: 'The model email is ready (about 55 words). In class you will write your own CV and email.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'Write your CV and your application email.',
      task: 'Choose a job advert card. Write a one-page CV with your name, contact, education, 2 skills, and 1 experience or activity. Then write an application email of 50 to 70 words.',
      condition: 'Write in 45 minutes. Use the CV template and the word bank. Use your own real details, and do not share them with the class. Your partner checks your work with the checklist.',
      cards: [
        { who: 'Advert A', text: 'Receptionist at Sunrise Hotel. Skills: good English, can use a computer, polite. Apply: send your CV and an email to jobs@sunrise.com.' },
        { who: 'Advert B', text: 'Tour assistant at Andaman Tours. Skills: speaks English, knows Phuket, friendly. Apply: send your CV and an email to work@andamantours.com.' },
        { who: 'Advert C', text: 'Cashier at Island Mart. Skills: good with numbers, friendly, can work on weekends. Apply: send your CV and an email to team@islandmart.com.' }
      ],
      frames: ['I am writing to apply for the ___ job.', 'I can ___ and ___.', 'I worked at ___ for ___.', 'I would like an interview.', 'Thank you. Best regards, ___'],
      checklist: [
        'My CV has name, contact, education, skills, and experience.',
        'My dates, spelling, and email address are correct.',
        'My email has a subject, a greeting, why I write, 2 reasons, a request, and a closing.',
        'My reasons match the advert.',
        'My email is 50 to 70 words.'
      ],
      selfStudy: 'Finish your CV and your application email. Choose a job advert for Unit 15.'
    }
  ],

  exit: {
    outcome: 'I can write a simple CV and an email to apply for a job.',
    questions: [
      { q: 'Which is part of a CV?', options: ['Education', 'A weather report', 'A shopping list'], answer: 0 },
      { q: 'Which sentence is good in an application email?', options: ['I would like an interview.', 'Call me today. I am waiting for you.', 'I want work now. Give me the job.'], answer: 0 }
    ]
  }
};
