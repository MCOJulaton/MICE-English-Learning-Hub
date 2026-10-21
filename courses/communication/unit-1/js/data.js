/* ===================== UNIT 1 CONTENT DATA — HELLO! GREETINGS & INTRODUCTIONS =====================
   English for Communication, first real class. Focus of the whole unit: turn
   English on paper into English students can SAY and UNDERSTAND by ear.
   Every section follows the same ladder:
     see it (a frame on the page) -> hear it (computer voice, American English)
     -> say it (repeat, then pairs) -> use it with no paper (speaking games).
   The support fades on purpose: full sentences, then frames with blanks, then
   keywords only, then nothing.
   All content is ORIGINAL, written for this site. A1 language, American
   English, no dashes. The computer voice is the browser's own text-to-speech
   (en-US), so there are no audio files to host.
   Planned for about 90 minutes in a 2-hour class slot (30 minutes spare). */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up: Hello Mingle'},
  {key:'s2', label:'Say Hello'},
  {key:'s3', label:"Who's Talking?"},
  {key:'s4', label:'Say It!'},
  {key:'s5', label:'Fun Facts'},
  {key:'s6', label:'Speaking Task: Meet and Introduce'},
  {key:'s7', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 1, Hello! Greetings & Introductions',
  unitCode: 'unit-1'
};

const LESSON_OBJECTIVES = [
  'Greet people and say how you are.',
  'Say your name, where you are from, and what you study.',
  'Say one fun fact about yourself.',
  'Introduce a classmate to the class.'
];

/* ===== Section 1: Warm-Up, Hello Mingle (class game, no paper) ===== */
const MINGLE = {
  steps: [
    'Stand up with your phone or notebook put away.',
    'Walk to a classmate you do not know well.',
    'Say: "Hello! I’m ___." Then wave or shake hands.',
    'Say: "Nice to meet you." Your classmate says it, too.',
    'Find a new classmate. Do this 3 times.'
  ],
  helpers: ['Hello!', 'Hi!', 'I’m ___.', 'Nice to meet you.', 'Nice to meet you, too.']
};

/* ===== Section 2: Say Hello ===== */
const GREETINGS_BY_TIME = [
  {say:'Good morning.', when:'Before 12:00 p.m.'},
  {say:'Good afternoon.', when:'12:00 p.m. to 5:00 p.m.'},
  {say:'Good evening.', when:'After 5:00 p.m.'}
];
const TIME_QUIZ = [
  {time:'8:00 a.m.', options:['Good morning.','Good afternoon.','Good evening.'], correct:0},
  {time:'2:00 p.m.', options:['Good morning.','Good afternoon.','Good evening.'], correct:1},
  {time:'7:00 p.m.', options:['Good morning.','Good afternoon.','Good evening.'], correct:2}
];
const GREETING_TIP = '"Good night" is not a greeting. We say "Good night" when we say goodbye at night.';

const HOW_ARE_YOU = {
  ask: 'How are you?',
  answers: ['I’m fine, thank you.', 'I’m good.', 'Not bad.', 'I’m tired.'],
  back: 'And you?'
};

const INTRO_FRAMES = [
  {frame:'Hello. My name is ___.', example:'Hello. My name is Nok.'},
  {frame:'I’m from ___.', example:'I’m from Phuket.'},
  {frame:'I study ___.', example:'I study tourism.'},
  {frame:'Nice to meet you.', example:'Nice to meet you.'},
  {frame:'Nice to meet you, too.', example:'Nice to meet you, too.'}
];

/* Build it: tap the words in order, then say the sentence out loud. */
const BUILD_IT = [
  {words:['My','name','is','Mai.'], answer:'My name is Mai.'},
  {words:['I’m','from','Phuket.'], answer:'I’m from Phuket.'},
  {words:['I','study','English.'], answer:'I study English.'},
  {words:['Nice','to','meet','you.'], answer:'Nice to meet you.'}
];

/* ===== Section 3: Who's Talking? (listening game) =====
   The computer voice reads an introduction. Students pick the right card.
   Options differ by ONE detail, so they must listen for the key word. */
const WHO_TALKING = [
  {
    say:'Hello, my name is Ben. I’m from Phuket. I study tourism.',
    pitch:0.8,
    options:[
      {name:'Ben', from:'Phuket', study:'tourism'},
      {name:'Ben', from:'Phuket', study:'business'},
      {name:'Ben', from:'Krabi', study:'tourism'}
    ], correct:0, key:['Ben','Phuket','tourism']
  },
  {
    say:'Good morning. I’m Anna. I’m from Germany. I study English.',
    pitch:1.1,
    options:[
      {name:'Anna', from:'Germany', study:'art'},
      {name:'Anna', from:'Germany', study:'English'},
      {name:'Anna', from:'Japan', study:'English'}
    ], correct:1, key:['Anna','Germany','English']
  },
  {
    say:'Hi! I’m Tom. I have two dogs. I can play the guitar.',
    pitch:0.8,
    options:[
      {name:'Tom', from:'', study:'', fact:'two cats, guitar'},
      {name:'Tom', from:'', study:'', fact:'two dogs, piano'},
      {name:'Tom', from:'', study:'', fact:'two dogs, guitar'}
    ], correct:2, key:['two dogs','guitar']
  },
  {
    say:'Good evening. My name is Fon. I’m from Hat Yai. I speak three languages.',
    pitch:1.1,
    options:[
      {name:'Fon', from:'Hat Yai', study:'', fact:'2 languages'},
      {name:'Fon', from:'Hat Yai', study:'', fact:'3 languages'},
      {name:'Fon', from:'Hua Hin', study:'', fact:'3 languages'}
    ], correct:1, key:['Hat Yai','three languages']
  }
];

/* ===== Section 4: Say It! (the speaking ladder) ===== */
const MODEL_INTRO = [
  'Hello! My name is Nok.',
  'I’m from Phuket.',
  'I study tourism.',
  'Nice to meet you.'
];
const SOUND_TIPS = {
  contractions: [
    {full:'I am', short:'I’m'},
    {full:'It is', short:'It’s'},
    {full:'What is', short:'What’s'}
  ],
  contractionNote: 'In speaking, we say the short form. "I’m" is one quick sound.',
  stress: {text:'My NAME is Nok.', note:'Say the important word a little louder and longer.'},
  intonation: [
    {text:'How are you?', arrow:'down', note:'The voice goes down at the end.'},
    {text:'And you?', arrow:'up', note:'The voice goes up at the end.'}
  ]
};
const ECHO_RACE = {
  steps: [
    'Make 2 teams. Each team sits in a line.',
    'Your teacher says a sentence. Team 1 says it back together.',
    'The teacher gives points: 1 point for correct words, 1 point for a clear, loud voice.',
    'Next, Team 2 says the next sentence. Keep going.',
    'Last round: one student from each team says the sentence alone.'
  ]
};

/* ===== Section 5: Fun Facts ===== */
const FUN_FACT_FRAME = 'A fun fact about me: I ___.';
const WORD_BANK = [
  {group:'I have ...', items:['a cat','a dog','two sisters','a brother','a big family']},
  {group:'I can ...', items:['swim','cook','sing','dance','draw','play the guitar','speak 2 languages']},
  {group:'I like ...', items:['coffee','music','soccer','cats','spicy food']},
  {group:'I live ...', items:['in Phuket','near the beach','with my family']}
];
const TRUE_FALSE_GAME = {
  steps: [
    'Think of 3 facts about you. Two are true. One is false.',
    'Say your 3 facts to your group.',
    'Your group says: "I think number 2 is false."',
    'You say: "Yes, you’re right!" or "No, it’s true!"',
    'Take turns. One point for each correct guess.'
  ],
  guessFrames: ['I think number 1 is false.', 'I think number 2 is false.', 'I think number 3 is false.']
};
const FIND_SOMEONE = {
  intro: 'You get a printed paper from your teacher. Walk around. Ask questions. Write a name.',
  questions: [
    {q:'Do you have a pet?', yes:'Yes, I do.', no:'No, I don’t.'},
    {q:'Can you swim?', yes:'Yes, I can.', no:'No, I can’t.'},
    {q:'Do you speak 2 languages?', yes:'Yes, I do.', no:'No, I don’t.'},
    {q:'Do you like coffee?', yes:'Yes, I do.', no:'No, I don’t.'}
  ],
  rule: 'One name for each box. Ask: "Do you have a pet?" Do not just point at the paper. Say the question!'
};

/* ===== Section 6: Speaking Task ===== */
const SPEED_MEETING = {
  title:'Speed Meeting',
  steps:[
    'Sit face to face with a new partner. You have 1 minute.',
    'Greet: "Hello! How are you?"',
    'Say your name, where you are from, and what you study.',
    'Say your fun fact: "A fun fact about me: I ___."',
    'Ask back: "And you? What’s your name?"',
    'Listen. Write your partner’s information on your partner card.',
    'Move to a new partner. Do this 3 times.'
  ]
};
const PARTNER_CARD_FIELDS = [
  {key:'pname', label:'Partner’s name'},
  {key:'pfrom', label:'From'},
  {key:'pstudy', label:'Studies'},
  {key:'pfact', label:'Fun fact'}
];
const INTRODUCE_PARTNER = {
  title:'Introduce Your Partner',
  steps:[
    'Choose one partner from your card.',
    'Stand up. Look at your classmates, not at your paper.',
    'Say: "This is ___. She/He is from ___. She/He studies ___."',
    'Say your partner’s fun fact.',
    'Your partner says: "Thank you!"'
  ],
  model:[
    'This is Mai.',
    'She’s from Krabi.',
    'She studies business.',
    'A fun fact about Mai: she has two cats.'
  ],
  sTip:[
    {i:'I study', she:'She studies'},
    {i:'I have', she:'She has'},
    {i:'I can swim', she:'She can swim (no s)'}
  ],
  sTipNote:'For he or she, we add -s to many verbs. After "can", we do not add -s.'
};
const PEER_CHECKLIST = [
  'Said a greeting.',
  'Said their name.',
  'Said where they are from.',
  'Said what they study.',
  'Said a fun fact.',
  'Asked back (And you?).',
  'Spoke clearly, with eyes up (not reading from paper).'
];

/* ===== Section 7: Self-Check ===== */
const CAN_DO = [
  'I can greet someone: Good morning, Hello, Hi.',
  'I can ask and answer: How are you?',
  'I can say my name, where I’m from, and what I study.',
  'I can understand a short introduction when I listen.',
  'I can say one fun fact about me.',
  'I can introduce a classmate to the class.'
];
const SCALE = [
  {v:1, label:'Not yet'},
  {v:2, label:'Almost'},
  {v:3, label:'Yes!'}
];

/* ===== Extra practice (take-home, separate site) ===== */
const EXTRA = {
  label:'Extra practice: English Expedition, Station 1 "Meet the World"',
  note:'Hello, names, "I am / you are", and likes. About 12 minutes, on your phone.',
  href:'https://wonder-library.vercel.app/#/english'
};
