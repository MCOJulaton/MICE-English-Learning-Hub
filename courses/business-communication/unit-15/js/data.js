/* Unit 15: Job Interview. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 15,
  title: 'Job Interview',
  output: 'Take part in a 4-minute mock job interview: answer 6 common questions and ask 1 question of your own.',
  can: 'answer common interview questions and ask a question of my own.',
  bloom: 'Apply, Evaluate, Create',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 14 before you start.', does: 'Remember how to apply for a job.',
      items: [
        { q: 'Which sentence is good in an application email?', options: ['I would like an interview.', 'Call me today. I am waiting for you.', 'I want work now. Give me the job.'], answer: 'I would like an interview.', why: 'It is polite and clear.' },
        { q: 'Which is part of a CV?', options: ['Education', 'A weather report', 'A shopping list'], answer: 'Education', why: 'A CV has name, contact, education, skills, and experience.' }
      ]
    },
    {
      id: 'interview', type: 'learn', title: 'A job interview', bloom: 'Understand',
      sub: 'Greet, answer 6 questions, ask one question, and say thank you.', does: 'Hear a short job interview.',
      points: [
        'Greet politely and sit down when the interviewer asks: Good morning. Nice to meet you. Thank you.',
        'Answer in full sentences, not one word.',
        'Use your CV: your skills, your experience, and why you want the job.',
        'Ask one question at the end, and say thank you.'
      ],
      models: [{
        title: 'A short interview for a receptionist job',
        hint: 'Tap each line to hear it. Or listen to the whole interview.', audio: true,
        sentences: [
          { text: 'Good morning, Nok. Please sit down. Tell me about yourself.', kind: 'k1', tag: 'Interviewer', note: 'A common first question.' },
          { text: 'Good morning. Thank you. My name is Nok. I study business at the university. I like talking to people.', kind: 'k2', tag: 'Nok', note: 'Greet, thank, and say two or three facts about yourself.' },
          { text: 'What can you do?', kind: 'k1', tag: 'Interviewer', note: 'A question about skills.' },
          { text: 'I can speak English, and I can use Word and Excel.', kind: 'k2', tag: 'Nok', note: 'Name two skills that match the job.' },
          { text: 'What experience do you have?', kind: 'k1', tag: 'Interviewer', note: 'A question about experience.' },
          { text: 'I worked at a cafe for one year. I served customers and answered the phone.', kind: 'k2', tag: 'Nok', note: 'Say where, how long, and what you did.' },
          { text: 'Why do you want this job?', kind: 'k1', tag: 'Interviewer', note: 'A question about your reason.' },
          { text: 'I want this job because I like helping people. I also want to practice my English.', kind: 'k2', tag: 'Nok', note: 'Use because and give a reason.' },
          { text: 'Do you have any questions for me?', kind: 'k1', tag: 'Interviewer', note: 'The interviewer invites your question.' },
          { text: 'Yes. What are the working hours? Thank you for your time.', kind: 'k2', tag: 'Nok', note: 'Ask one question and say thank you.' }
        ],
        after: 'Notice: full sentences, skills, experience, a reason, one question, thanks.'
      }],
      lang: {
        title: 'Interview words',
        rows: [
          ['Questions you hear', 'Tell me about yourself. What can you do? What experience do you have? What is your strength? Why do you want this job? When can you start?'],
          ['Answers', 'My name is ___. I can ___. I worked at ___ for ___. My strength is ___. I want this job because ___. I can start on ___.'],
          ['Your question', 'What are the working hours? What will my duties be?'],
          ['Closing', 'Thank you for your time. I look forward to hearing from you.']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each answer out loud until you can say it with no paper.', does: 'Say the interview answers out loud.',
      phrases: [
        { text: 'My name is Nok. I study business. I like talking to people.', frame: 'My ___ is ___. I ___ business. I ___ talking to ___.', keys: 'name / study / like / people', cue: 'Tell about yourself.' },
        { text: 'I can speak English, and I can use Excel.', frame: 'I can ___ English, and I can ___ Excel.', keys: 'speak / use', cue: 'Say your skills.' },
        { text: 'I worked at a cafe for one year.', frame: 'I ___ at a ___ for ___ ___.', keys: 'worked / cafe / one / year', cue: 'Say your experience.' },
        { text: 'My strength is that I am polite and on time.', frame: 'My ___ is that I am ___ and on ___.', keys: 'strength / polite / time', cue: 'Say a strength.' },
        { text: 'I want this job because I like helping people.', frame: 'I ___ this job ___ I like ___ people.', keys: 'want / because / helping', cue: 'Say why you want the job.' },
        { text: 'What are the working hours? Thank you for your time.', frame: 'What are the ___ ___? Thank you for your ___.', keys: 'working / hours / time', cue: 'Ask your question and say thank you.' }
      ]
    },
    {
      id: 'listen', type: 'choose', title: 'What does the interviewer ask?', bloom: 'Understand',
      sub: 'Listen to the question. Choose the best answer.', does: 'Understand interview questions by ear.',
      hint: 'Not this one. Listen again slowly. What is the question about?',
      items: [
        { say: 'Tell me about yourself.', q: 'What is the best answer?', options: ['My name is Nok. I study business. I like talking to people.', 'Yes, I do. I like it very much, and I thank you.', 'The weather is hot today, and the sky is very blue.'], answer: 'My name is Nok. I study business. I like talking to people.', why: 'It tells about you in full sentences.' },
        { say: 'What experience do you have?', q: 'What is the best answer?', options: ['I worked at a cafe for one year.', 'I like pizza and football.', 'No, thank you.'], answer: 'I worked at a cafe for one year.', why: 'It talks about experience.' },
        { say: 'When can you start?', q: 'What is the best answer?', options: ['I can start next Monday.', 'I am a student at the university.', 'It costs 200 baht for each box.'], answer: 'I can start next Monday.', why: 'It answers when.' },
        { say: 'Do you have any questions for me?', q: 'What is the best answer?', options: ['Yes. What are the working hours?', 'I am sorry, I cannot come.', 'Please send an email.'], answer: 'Yes. What are the working hours?', why: 'It asks a question about the job.' }
      ]
    },
    {
      id: 'order', type: 'order', title: 'Put the interview in order', bloom: 'Analyze',
      sub: 'An interview has an order.', does: 'Put the parts of an interview in order.',
      prompt: 'Tap the lines in the order of the interview.',
      hint: 'The greeting comes first. Thanks come last.',
      sets: [{
        items: [
          'Good morning, Nok. Please sit down.',
          'Tell me about yourself.',
          'What can you do?',
          'Why do you want this job?',
          'Do you have any questions for me?',
          'Thank you for your time. Goodbye.'
        ],
        why: 'The order is: greeting, about you, skills, reason, your question, thanks.'
      }]
    },
    {
      id: 'best', type: 'choose', title: 'Which answer is better?', bloom: 'Evaluate',
      sub: 'Choose the better interview answer.', does: 'Judge which interview answers are better.',
      hint: 'Not this one. A good answer is a full sentence and gives a reason or a detail.',
      items: [
        { lead: 'Question: Why do you want this job?', q: 'Which answer is better?', options: ['I want this job because I like helping people.', 'Money, because I need a lot of money now.', 'Because yes, I want it very much, I think.'], answer: 'I want this job because I like helping people.', why: 'It is a full sentence with a reason.' },
        { lead: 'Question: What is your strength?', q: 'Which answer is better?', options: ['My strength is that I am polite and I am always on time.', 'I am good. I am a very good person, I think.', 'Maybe polite, maybe not, I do not know much.'], answer: 'My strength is that I am polite and I am always on time.', why: 'It is specific and clear.' },
        { lead: 'Question: What experience do you have?', q: 'Which answer is better?', options: ['I worked at a cafe for one year. I served customers.', 'I have nothing. I have never worked at all.', 'A little, I think, but I do not remember well.'], answer: 'I worked at a cafe for one year. I served customers.', why: 'It says where, how long, and what you did.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Build your answers', bloom: 'Apply',
      sub: 'Build 3 good answers in 3 small steps.', does: 'Build good interview answers.',
      topic: 'Interview for a receptionist job',
      slots: [
        { key: 'about', mode: 'one', prompt: 'Tell me about yourself.', options: [
          { t: 'My name is Nok. I study business at the university. I like talking to people.', ok: true, why: 'Name, study, and a personal fact in full sentences.' },
          { t: 'I am Nok. Student.', ok: false, why: 'It is too short.' },
          { t: 'I have many things. It is hard to say.', ok: false, why: 'It does not answer the question.' }
        ] },
        { key: 'strength', mode: 'one', prompt: 'What is your strength?', options: [
          { t: 'My strength is that I am polite and I am always on time.', ok: true, why: 'Clear and specific.' },
          { t: 'Strength is good.', ok: false, why: 'It is not clear.' },
          { t: 'I do not have a strength.', ok: false, why: 'Always find a positive answer.' }
        ] },
        { key: 'why', mode: 'one', prompt: 'Why do you want this job?', options: [
          { t: 'I want this job because I like helping people and I want to use my English.', ok: true, why: 'It gives two reasons.' },
          { t: 'Because I need it.', ok: false, why: 'It is too short and not positive.' },
          { t: 'I want this job. Pay good.', ok: false, why: 'The grammar is not clear and it is only about money.' }
        ] }
      ],
      plannerTitle: 'Your answers',
      rows: [
        { label: 'About me', slot: 'about', wait: 'Complete step 1' },
        { label: 'My strength', slot: 'strength', wait: 'Complete step 2' },
        { label: 'Why this job', slot: 'why', wait: 'Complete step 3' }
      ],
      afterText: 'The model answers are ready. In class you will answer 6 questions with your own answers.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'The mock job interview, 4 minutes.',
      task: 'Take part in a mock job interview for the job advert from Unit 14. The interviewer asks 6 questions. Answer in full sentences. At the end, ask one question of your own and say thank you.',
      condition: 'One student at a time, with the teacher or a panel of 2 students. No script on paper. Your CV may be on the table.',
      cards: [
        { who: 'The 6 questions', text: 'Tell me about yourself. What can you do? What experience do you have? What is your strength? Why do you want this job? When can you start?' },
        { who: 'Your question', text: 'Ask one: What are the working hours? What will my duties be? Then say: Thank you for your time.' }
      ],
      phrases: [
        { text: 'Good morning. Nice to meet you. Thank you.' },
        { text: 'My name is ___. I study ___. I like ___.' },
        { text: 'I can ___ and I can ___.' },
        { text: 'I worked at ___ for ___.' },
        { text: 'I want this job because ___.' },
        { text: 'What are the working hours? Thank you for your time.' }
      ],
      checklist: [
        'I answered all 6 questions in full sentences.',
        'My answers matched the job and my CV.',
        'I asked one clear question of my own.',
        'I greeted politely and said thank you at the end.',
        'The interviewer understood me the first or second time.'
      ],
      selfStudy: 'Practice the 6 interview answers aloud with a friend. Write what you can do now in English at work.'
    }
  ],

  exit: {
    outcome: 'I can answer common interview questions and ask a question of my own.',
    questions: [
      { q: 'Which answer is better for “Why do you want this job?”', options: ['Money, because I need a lot of money now.', 'I want this job because I like helping people.', 'Because yes, I want it very much, I think.'], answer: 1 },
      { q: 'What do you say at the end of an interview?', options: ['Thank you for your time.', 'OK, finished. That is all I have to say.', 'Bye now. It is time to go home.'], answer: 0 }
    ]
  }
};
