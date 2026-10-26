/* Unit 11: Meetings: Suggest, Agree, and Decide. Engine: ../../js/lesson.js. American English, A1 wording, no dashes. */

const UNIT = {
  number: 11,
  title: 'Meetings: Suggest, Agree, and Decide',
  output: 'Take part in a 4-minute team meeting in groups of 4 to choose a time and a task for an event, then write 3 action points (who, what, when).',
  can: 'take part in a short meeting, agree or disagree politely, and write action points.',
  bloom: 'Apply, Analyze, Evaluate',
  minutes: 30,

  steps: [
    {
      id: 'warmup', type: 'choose', title: 'Warm-up', bloom: 'Remember',
      sub: 'Remember Unit 10 before you start.', does: 'Remember polite service phrases.',
      items: [
        { q: 'Which phrase says sorry and shows you understand?', options: ['I am sorry about that. I understand.', 'That is your problem, not our problem.', 'Please wait here until I am free.'], answer: 'I am sorry about that. I understand.', why: 'It is polite and it shows you listen.' },
        { q: 'Which solution is clear?', options: ['I will send a new one tomorrow.', 'Maybe later, maybe not today.', 'We will see what happens next.'], answer: 'I will send a new one tomorrow.', why: 'It has an action and a day.' }
      ]
    },
    {
      id: 'meeting', type: 'learn', title: 'A short team meeting', bloom: 'Understand',
      sub: 'Suggest ideas, agree or disagree politely, and decide together.', does: 'Hear a short meeting.',
      points: [
        'Start the meeting: Let’s begin. Any ideas?',
        'Suggest: How about the cafe? Let’s go on Friday.',
        'Agree: I agree. That is a good idea. Disagree politely: I am not sure. How about ___?',
        'Decide: Let’s choose ___. OK, we agree.'
      ],
      models: [{
        title: 'Choosing a place for a team party',
        hint: 'Tap each line to hear it. Or listen to the whole meeting.', audio: true,
        sentences: [
          { text: 'Let’s begin. We need a place for the team party. Any ideas?', kind: 'k1', tag: 'Nok (leader)', note: 'The leader starts and asks for ideas.' },
          { text: 'How about the beach restaurant?', kind: 'k2', tag: 'Anan', note: 'A suggestion with How about.' },
          { text: 'I am not sure. It is far. How about the cafe near the office?', kind: 'k4', tag: 'Mali', note: 'Disagree politely, give a reason, and suggest something else.' },
          { text: 'I agree with Mali. The cafe is a good idea.', kind: 'k3', tag: 'Kitti', note: 'Agree and say who you agree with.' },
          { text: 'What time is good for everyone?', kind: 'k1', tag: 'Nok (leader)', note: 'A question to move the meeting on.' },
          { text: 'Let’s meet at 6:00 on Friday.', kind: 'k2', tag: 'Anan', note: 'A suggestion with Let’s.' },
          { text: 'OK. Let’s choose the cafe on Friday at 6:00. We agree.', kind: 'k1', tag: 'Nok (leader)', note: 'The leader makes the decision.' }
        ],
        after: 'Notice: start, suggest, disagree politely, agree, ask, decide.'
      }],
      lang: {
        title: 'Meeting words',
        rows: [
          ['Start', 'Let’s begin. Any ideas? What do you think?'],
          ['Suggest', 'How about ___? Let’s ___. Why don’t we ___?'],
          ['Agree', 'I agree. That is a good idea. Yes, me too.'],
          ['Disagree politely', 'I am not sure. That is a good idea, but ___. How about ___?'],
          ['Decide', 'Let’s choose ___. OK, we agree. The decision is ___.'],
          ['Take turns', 'Can I say something? What do you think, Mali?']
        ]
      }
    },
    {
      id: 'say', type: 'ladder', title: 'Say it', bloom: 'Apply',
      sub: 'Say each phrase out loud until you can say it with no paper.', does: 'Say the meeting phrases out loud.',
      phrases: [
        { text: 'Let’s begin. Any ideas?', frame: 'Let’s ___. ___ ideas?', keys: 'begin / any', cue: 'Start the meeting.' },
        { text: 'How about the cafe near the office?', frame: 'How ___ the ___ near the ___?', keys: 'about / cafe / office', cue: 'Make a suggestion.' },
        { text: 'I agree. That is a good idea.', frame: 'I ___. That is a ___ idea.', keys: 'agree / good', cue: 'Agree with an idea.' },
        { text: 'I am not sure. It is far. How about Friday?', frame: 'I am not ___. It is ___. How ___ Friday?', keys: 'sure / far / about', cue: 'Disagree politely and suggest something else.' },
        { text: 'Let’s choose the cafe. OK, we agree.', frame: 'Let’s ___ the ___. OK, we ___.', keys: 'choose / cafe / agree', cue: 'Make the decision.' }
      ]
    },
    {
      id: 'listen', type: 'choose', title: 'Who says what?', bloom: 'Understand',
      sub: 'Listen to each line. What does the speaker do?', does: 'Understand what people do in a meeting.',
      options: ['Suggests', 'Agrees', 'Disagrees politely', 'Decides'],
      hint: 'Not this one. Listen for the key words: How about, I agree, I am not sure, Let’s choose.',
      items: [
        { say: 'How about Friday at six?', answer: 'Suggests', why: 'How about ... is a suggestion.' },
        { say: 'I agree. That is a good idea.', answer: 'Agrees', why: 'I agree says yes.' },
        { say: 'I am not sure. It is too far. How about the cafe?', answer: 'Disagrees politely', why: 'I am not sure and a reason is a polite disagreement.' },
        { say: 'OK. Let’s choose the cafe. We agree.', answer: 'Decides', why: 'Let’s choose ... We agree is a decision.' }
      ]
    },
    {
      id: 'polite', type: 'choose', title: 'Disagree politely', bloom: 'Evaluate',
      sub: 'Choose the most polite reply.', does: 'Choose polite ways to disagree.',
      hint: 'Not this one. A polite disagreement says why and suggests another idea.',
      items: [
        { lead: 'Anan: How about the beach restaurant?', q: 'You think it is too far. What do you say?', options: ['I am not sure. It is far. How about the cafe?', 'No. That is a bad idea. I say no.', 'The beach is stupid. I do not go.'], answer: 'I am not sure. It is far. How about the cafe?', why: 'It gives a reason and a new idea.' },
        { lead: 'Mali: Let’s meet on Monday.', q: 'You are busy on Monday. What do you say?', options: ['Good idea, but I am busy. How about Tuesday?', 'Monday? Never. I do not like Monday at all.', 'I do not like Monday. Choose another day.'], answer: 'Good idea, but I am busy. How about Tuesday?', why: 'It is polite and suggests another day.' },
        { lead: 'Kitti: I think we need 5 chairs.', q: 'You agree. What do you say?', options: ['I agree. That is a good idea.', 'OK.', 'Yes, fine, whatever, I do not care.'], answer: 'I agree. That is a good idea.', why: 'It is clear and positive.' }
      ]
    },
    {
      id: 'plan', type: 'plan', title: 'Write action points', bloom: 'Apply',
      sub: 'After a meeting, write who does what and when.', does: 'Write action points: who, what, when.',
      topic: 'The team party at the cafe on Friday at 6:00',
      slots: [
        { key: 'book', mode: 'one', prompt: 'Choose the best action point for booking the cafe.', options: [
          { t: 'Mali will book the cafe on Wednesday.', ok: true, why: 'It has who (Mali), what (book the cafe), and when (Wednesday).' },
          { t: 'Mali book cafe.', ok: false, why: 'It has no when, and the grammar is not clear.' },
          { t: 'Someone books the cafe.', ok: false, why: 'It does not say who and it does not say when.' }
        ] },
        { key: 'invite', mode: 'one', prompt: 'Choose the best action point for inviting the team.', options: [
          { t: 'Anan will send the invitation by Tuesday.', ok: true, why: 'It has who, what, and when.' },
          { t: 'Anan will sends the invitation by Tuesday.', ok: false, why: 'After will, use the base verb: send.' },
          { t: 'Invitation Tuesday.', ok: false, why: 'It does not say who or what to do.' }
        ] },
        { key: 'food', mode: 'one', prompt: 'Choose the best action point for the food.', options: [
          { t: 'Kitti will choose the menu on Thursday.', ok: true, why: 'It has who, what, and when.' },
          { t: 'Kitti choose the menu will Thursday.', ok: false, why: 'The word order is wrong.' },
          { t: 'We will do the food later.', ok: false, why: 'It does not say who or when.' }
        ] }
      ],
      plannerTitle: 'Action points',
      rows: [
        { label: 'Action 1', slot: 'book', wait: 'Complete step 1' },
        { label: 'Action 2', slot: 'invite', wait: 'Complete step 2' },
        { label: 'Action 3', slot: 'food', wait: 'Complete step 3' }
      ],
      afterText: 'Your action points are ready. In class you will write 3 action points after your own meeting.'
    },
    {
      id: 'yourturn', type: 'yourturn', title: 'Your turn in class', bloom: 'Create',
      sub: 'The team meeting, 4 minutes.',
      task: 'Work in groups of 4. Choose a time and a task for an event. Each person speaks at least 3 times: give an idea, agree or disagree politely, and ask a question. The group decides in 4 minutes. Then each person writes the 3 action points.',
      condition: 'No script on paper. You may look at the phrase card. The note taker may write keywords during the meeting.',
      cards: [
        { who: 'Meeting card', text: 'Event: a class party. Options: Friday at 5:00, Saturday at 12:00, or Sunday at 3:00. Places: the cafe, the park, or the classroom.' },
        { who: 'Roles', text: 'Leader: starts the meeting and makes the decision. Note taker: writes the decision. Two members: give ideas and ask questions.' }
      ],
      phrases: [
        { text: 'Let’s begin. Any ideas?' },
        { text: 'How about ___? / Let’s ___.' },
        { text: 'I agree. That is a good idea.' },
        { text: 'I am not sure. How about ___?' },
        { text: 'What do you think? / Can I say something?' },
        { text: 'Let’s choose ___. OK, we agree.' }
      ],
      checklist: [
        'I spoke at least 3 times and my sentences were on topic.',
        'I gave an idea and agreed or disagreed politely at least once.',
        'I asked at least one clear question.',
        'My group decided the time and the task.',
        'I wrote 3 action points with who, what, and when.'
      ],
      selfStudy: 'Practice the meeting phrases aloud. Write an invitation to a meeting.'
    }
  ],

  exit: {
    outcome: 'I can take part in a short meeting, agree or disagree politely, and write action points.',
    questions: [
      { q: 'Which sentence is a polite disagreement?', options: ['I am not sure. How about Tuesday?', 'No, never. I do not want that.', 'Bad idea. I do not like it.'], answer: 0 },
      { q: 'Which action point is the best?', options: ['Do it later. We do not know.', 'Mali will book the cafe on Wednesday.', 'Someone books the cafe sometime.'], answer: 1 }
    ]
  }
};
