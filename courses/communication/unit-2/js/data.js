/* ===================== UNIT 2 CONTENT DATA, SMALL TALK =====================
   English for Communication, second class. Same speaking-first ladder as
   Unit 1: see it, hear it, say it, then use it with no paper, and the paper
   support fades on purpose.
   The core idea of the unit is one simple pattern students can use in any
   chat:   ASK  ->  ANSWER  ->  ADD  ->  ASK BACK   (and react in between).
   All content is ORIGINAL, written for this site. A1 language, American
   English, no dashes. The computer voice is the browser's own text-to-speech
   (en-US), so there are no audio files to host.
   Planned for about 90 minutes in a 2-hour class slot. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up: Stand Up, Sit Down'},
  {key:'s2', label:'The Small Talk Pattern'},
  {key:'s3', label:'Listen to the Chat'},
  {key:'s4', label:'Say It!'},
  {key:'s5', label:'Games: Spin & Talk'},
  {key:'s6', label:'Speaking Task: Small Talk Chat'},
  {key:'s7', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 2, Small Talk',
  unitCode: 'unit-2'
};

const LESSON_OBJECTIVES = [
  'Start a short chat with a question.',
  'Answer with a full sentence and add one more idea.',
  'Ask back: "What about you?"',
  'React with "Really?", "Me too", and "Me neither".'
];

/* ===== Section 1: Warm-Up, Stand Up, Sit Down ===== */
const STAND_UP = {
  steps: [
    'Your teacher says a sentence, like "I like coffee."',
    'If it is true for you, stand up. If not, stay seated.',
    'Look at the students who are standing. Say: "Me too!"',
    'If you stay seated and your classmate stands, ask: "Do you like coffee?"',
    'Your teacher says more sentences. Try to say something every time.'
  ],
  sentences: ['I like coffee.', 'I have a pet.', 'I can swim.', 'I don’t like rainy days.', 'I go to bed late.'],
  helpers: ['Me too!', 'Me neither.', 'Really?', 'Do you like coffee?']
};

/* ===== Section 2: The Small Talk Pattern ===== */
const PATTERN = [
  {key:'ASK', name:'Ask', ex:'Do you like music?', note:'Start with a question.'},
  {key:'ANSWER', name:'Answer', ex:'Yes, I do.', note:'Use a full, short answer.'},
  {key:'ADD', name:'Add', ex:'I listen to music every day.', note:'Give one more idea. This keeps the chat alive.'},
  {key:'ASKBACK', name:'Ask back', ex:'What about you?', note:'Give the question back.'}
];
const MODEL_CHAT = [
  {who:'A', text:'What do you do on weekends?', role:'ASK'},
  {who:'B', text:'I play soccer with my friends.', role:'ANSWER'},
  {who:'B', text:'We play at the beach.', role:'ADD'},
  {who:'A', text:'That’s cool!', role:'REACT'},
  {who:'B', text:'What about you?', role:'ASKBACK'},
  {who:'A', text:'I watch movies at home.', role:'ANSWER'},
  {who:'A', text:'I like comedies.', role:'ADD'}
];
const ROLE_LABEL = {ASK:'Ask', ANSWER:'Answer', ADD:'Add', ASKBACK:'Ask back', REACT:'React'};
const VOICE = {A:{pitch:1.15}, B:{pitch:0.8}};

const QUESTION_BANK = [
  {head:'Yes or no?', items:[
    {q:'Do you like music?', short:'Yes, I do. / No, I don’t.'},
    {q:'Do you have a pet?', short:'Yes, I do. / No, I don’t.'},
    {q:'Can you cook?', short:'Yes, I can. / No, I can’t.'}
  ]},
  {head:'What, where, why?', items:[
    {q:'What do you do on weekends?', short:'I ...'},
    {q:'Where do you live?', short:'I live in ...'},
    {q:'Why do you like it?', short:'Because ...'}
  ]}
];
const REACTIONS = [
  {say:'Really?', note:'You are surprised or interested.'},
  {say:'That’s cool!', note:'You like what you hear.'},
  {say:'Oh, I see.', note:'You understand.'},
  {say:'Me too.', note:'Same as you. Use after a "yes" sentence.'},
  {say:'Me neither.', note:'Same as you. Use after a "no" sentence.'}
];
const ME_TOO_QUIZ = [
  {line:'I like coffee.', options:['Me too.','Me neither.'], correct:0},
  {line:'I don’t like spicy food.', options:['Me too.','Me neither.'], correct:1},
  {line:'I can swim.', options:['Me too.','Me neither.'], correct:0},
  {line:'I can’t cook.', options:['Me too.','Me neither.'], correct:1}
];
const ME_TOO_TIP = '"Me too" is for sentences with yes. "Me neither" is for sentences with no (don’t, can’t).';
const PICK_QUESTION = [
  {goal:'You want to know if your partner likes music.', options:['Do you like music?','What music?','Why music?'], correct:0},
  {goal:'You want to know where your partner lives.', options:['Where do you live?','Do you live?','What live?'], correct:0},
  {goal:'You want to know the reason.', options:['Why do you like it?','Do you like why?','What like it?'], correct:0}
];

/* ===== Section 3: Listen to the Chat =====
   Part A: pattern detective. Students hear a chat, then find the lines.
   Part B: pick the best reaction to a short sentence. */
const CHATS = [
  {
    title:'Chat 1: Food',
    lines:[
      {who:'A', text:'Do you like spicy food?'},
      {who:'B', text:'Yes, I do.'},
      {who:'B', text:'I eat spicy food every day.'},
      {who:'A', text:'Really? Wow!'},
      {who:'B', text:'How about you?'}
    ],
    tasks:[
      {q:'Which line is the ADD?', correct:2},
      {q:'Which line is the ASK BACK?', correct:4},
      {q:'Which line is the REACTION?', correct:3}
    ]
  },
  {
    title:'Chat 2: Weather',
    lines:[
      {who:'A', text:'I don’t like rainy days.'},
      {who:'B', text:'Me neither!'},
      {who:'B', text:'I like sunny days.'},
      {who:'A', text:'Me too. Where do you go on sunny days?'},
      {who:'B', text:'I go to the beach.'}
    ],
    tasks:[
      {q:'Which line is a QUESTION?', correct:3},
      {q:'Which line means "I am the same as you" (about rain)?', correct:1},
      {q:'Which line is the ANSWER to the question?', correct:4}
    ]
  }
];
const REACTION_LISTEN = [
  {say:'I have three sisters.', pitch:1.15, options:['Really? Wow!','Me neither.','Oh, no.'], correct:0},
  {say:'I don’t like spicy food.', pitch:0.8, options:['Me too.','Me neither.','That’s cool!'], correct:1},
  {say:'I went to the beach on Sunday.', pitch:1.15, options:['Me neither.','That’s nice!','Why not?'], correct:1}
];

/* ===== Section 4: Say It! ===== */
const SOUND_TIPS = {
  linking: [
    {full:'Do you', fast:'"D’you"', ex:'Do you like music?'},
    {full:'What do you', fast:'"Whaddaya"', ex:'What do you do on weekends?'}
  ],
  linkingNote:'In fast speech, words join together. Listen first, then try it. It is OK to say it slowly at first.',
  intonation: [
    {text:'Do you like music?', arrow:'up', note:'Yes or no questions: the voice goes up at the end.'},
    {text:'What do you do on weekends?', arrow:'down', note:'What, where, why questions: the voice goes down at the end.'},
    {text:'Really?', arrow:'up', note:'Show interest. The voice goes up.'}
  ],
  stress:{text:'I LIKE music. I like MUSIC.', note:'Change the important word, and the meaning changes a little.'}
};
const LADDER_CHAT = [
  'Do you like music?',
  'Yes, I do.',
  'I listen to music every day.',
  'What about you?'
];
const ECHO_RACE = {
  steps: [
    'Make 2 teams. Your teacher says a question, and Team 1 answers together.',
    'Team 1 must ANSWER and ADD one more idea.',
    'Then Team 1 asks back: "What about you?" Team 2 answers and adds.',
    'Give 1 point for a full answer, 1 point for adding an idea, and 1 point for asking back.',
    'Last round: one student from each team does the whole pattern alone.'
  ]
};

/* ===== Section 5: Games ===== */
const SPIN_TOPICS = [
  {topic:'Weekend', q:'What do you do on weekends?'},
  {topic:'Food', q:'What is your favorite food?'},
  {topic:'Music', q:'Do you like music?'},
  {topic:'Sports', q:'Do you play any sports?'},
  {topic:'Weather', q:'Do you like hot weather?'},
  {topic:'Free time', q:'What do you do in your free time?'},
  {topic:'Phones', q:'How often do you use your phone?'},
  {topic:'Coffee or tea', q:'Do you like coffee or tea?'}
];
const SPIN_CHECKS = ['Ask', 'Answer', 'Add', 'Ask back', 'React'];
const SPIN_RULES = [
  'Sit with a partner. Press "Spin" to get a topic and a first question.',
  'Your partner answers and adds one more idea. Then your partner asks back.',
  'Chat for 1 minute. Check each box when you do it.',
  'Press "Next topic" and switch roles. Do 2 topics at least.'
];
const SNAKES = {
  title:'Game: Small Talk Snakes & Ladders',
  intro:'Play in groups of 3 or 4. Your teacher gives you a printed board.',
  steps:[
    'Put one marker on Start. Roll a die. Move that many squares.',
    'Read the question on your square. Answer it with a full sentence.',
    'Add one more idea. Then ask back: "What about you?" The next player answers.',
    'A ladder takes you up. A snake takes you down. Say the number you go to!',
    'The first player to reach Finish wins. The group decides if the answers were good.'
  ]
};
const CHAT_CHAIN = {
  title:'Game: Chat Chain',
  steps:[
    'Stand in a big circle. The teacher starts with a question to one student.',
    'That student answers, adds one idea, then asks a NEW question to the next student.',
    'You cannot repeat a question. Listen to the others!',
    'If you forget the pattern, the class says: "Ask, Answer, Add, Ask back!"'
  ]
};

/* ===== Section 6: Speaking Task, Small Talk Chat ===== */
const CHAT_TASK = {
  title:'Small Talk Chat',
  steps:[
    'Find a partner you do not sit with every day.',
    'Choose a topic from the Spin & Talk game, or a topic you like.',
    'Chat for 2 minutes. Use the pattern: Ask, Answer, Add, Ask back.',
    'Use at least 2 reactions: Really? That’s cool! Me too. Me neither.',
    'Look at your partner, not at your paper. Smile!'
  ],
  starters:['Hi! How are you today?', 'Do you like this weather?', 'What did you do last weekend?', 'Do you have any plans for the weekend?']
};
const PEER_CHECKLIST = [
  'Asked a question to start.',
  'Answered with a full sentence.',
  'Added one more idea.',
  'Asked back: "What about you?"',
  'Used at least 2 reactions.',
  'Kept the chat going for 2 minutes.',
  'Spoke clearly, with eyes up (not reading from paper).'
];
const TRACKER = ['Questions I asked', 'Answers I gave', 'Ideas I added', 'Reactions I used'];

/* ===== Section 7: Self-Check ===== */
const CAN_DO = [
  'I can start a chat with a question.',
  'I can answer with a full sentence.',
  'I can add one more idea.',
  'I can ask back: What about you?',
  'I can use Really? That’s cool! Me too. Me neither.',
  'I can chat with a classmate for 2 minutes.'
];
const SCALE = [
  {v:1, label:'Not yet'},
  {v:2, label:'Almost'},
  {v:3, label:'Yes!'}
];

/* ===== Extra practice (take-home, separate site) ===== */
const EXTRA = {
  label:'Extra practice: Board Games, "Who Is It?"',
  note:'Ask yes or no questions to guess the secret person. Good practice for "Do you...?" and "Is he...?". About 10 minutes.',
  href:'https://wonder-library.vercel.app/#/games'
};
