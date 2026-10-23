/* ===================== UNIT 4 CONTENT DATA, MY SCHOOL =====================
   English for Communication, fourth class. Built backward from its output
   (OBE): the output is a 1 to 2 minute school tour for a new student, with one
   opinion about what makes a good school. Every section trains one skill the
   tour needs, so this unit does NOT copy the Unit 1 to 3 section list:
     places (This is the ___) -> There is / There are -> Is there a ___?
     -> opinion with "because" (from Unit 3) -> the tour.
   The places are real PKRU places. PKRU_PLACES below is the ONE place to edit
   them: change a name, an icon or a model sentence and the whole unit updates.
   The model sentences are only models, so keep them true for your campus.
   All content is ORIGINAL, written for this site. A1 language, American
   English, no dashes. The computer voice is the browser's own text-to-speech
   (en-US), so there are no audio files to host.
   Planned for about 90 minutes in a 2-hour class slot. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up: My Favorite Place'},
  {key:'s2', label:'PKRU Places: There Is, There Are'},
  {key:'s3', label:'Listen: Mark the Map'},
  {key:'s4', label:'Say It!'},
  {key:'s5', label:'Game: Hidden Place'},
  {key:'s6', label:'What Makes a Good School?'},
  {key:'s7', label:'Speaking Task: School Tour'},
  {key:'s8', label:'Self-Check'},
  {key:'exit', label:'Exit Ticket'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 4, My School: What Makes a Good School?',
  unitCode: 'unit-4'
};

const LESSON_OBJECTIVES = [
  'Name places at PKRU: "This is the library."',
  'Say what is there: "There is a ___. There are two ___."',
  'Answer: "Is there a ___?" with "Yes, there is." or "No, there isn’t."',
  'Give an opinion: "I think a good school has ___ because ___."',
  'Give a school tour of 1 to 2 minutes with no paper.'
];

/* ===== The PKRU places (EDIT HERE) =====
   id: short key. name: the words after "the". icon: the picture used on the map.
   model: 2 short model sentences. They are examples, not facts students must copy.
   Replace these with the real names on your campus. */
/* photo: a file in assets/images/. To use a REAL PKRU photo, save it over the file with the same name (.jpg). */
const PKRU_PLACES = [
  {id:'library', photo:'efc-u4-library.jpg',  name:'library',             icon:'📚', model:'There are many books. There are quiet tables.'},
  {id:'mgmt', photo:'efc-u4-mgmt.jpg',     name:'management building', icon:'🏢', model:'There are many offices. There is a front desk.'},
  {id:'canteen', photo:'efc-u4-canteen.jpg',  name:'canteen',             icon:'🍜', model:'There are many tables. There is a lot of food.'},
  {id:'classes', photo:'efc-u4-classes.jpg',  name:'classroom building',  icon:'🏫', model:'There are many classrooms. There are stairs.'},
  {id:'field', photo:'efc-u4-field.jpg',    name:'sports field',        icon:'⚽', model:'There is a big field. There are two goals.'},
  {id:'parking', photo:'efc-u4-parking.jpg',  name:'parking lot',         icon:'🅿️', model:'There are many motorbikes. There are some cars.'}
];

/* ===== Section 1: Warm-Up, My Favorite Place ===== */
const FAV_PLACE = {
  steps: [
    'Think of your favorite place at school. It can be a room, a table, or a quiet corner.',
    'Draw it quickly on paper, or see it in your head. Two minutes only.',
    'Tell your partner: "My favorite place is ___ because it’s ___."',
    'Ask: "What about you?" Listen. Then say "Me too!" or "Why?"',
    'Change partners and do it again.'
  ],
  sentences: ['My favorite place is the library.', 'My favorite place is the canteen.', 'I like the sports field because it’s fun.', 'I like the library because it’s quiet.'],
  helpers: ['What about you?', 'Me too!', 'Why?', 'Because it’s quiet.']
};
const FAV_CHECKS = ['I named a place at school.', 'I said "because" and a reason.', 'I asked "What about you?"'];

/* ===== Section 2: PKRU Places, There Is, There Are ===== */
const IS_ARE_RULE = {
  one: {label:'one thing', frame:'There is a ___.', example:'There is a library.'},
  many: {label:'two or more', frame:'There are ___.', example:'There are many books.'},
  note: 'In speech we often say "There’s a library." That is the same as "There is a library."'
};
const FRAMES = [
  {frame:'This is the ___.', example:'This is the library.'},
  {frame:'There is a ___.', example:'There is a quiet room.'},
  {frame:'There are two ___.', example:'There are two canteens.'},
  {frame:'Is there a ___?', example:'Is there a library?'},
  {frame:'Are there any ___?', example:'Are there any computers?'},
  {frame:'Yes, there is. / No, there isn’t.', example:'Yes, there is.'}
];
const IS_ARE_QUIZ = [
  {q:'There ___ a library.', options:['is','are'], correct:0},
  {q:'There ___ many students.', options:['is','are'], correct:1},
  {q:'There ___ two canteens.', options:['is','are'], correct:1},
  {q:'There ___ a big field.', options:['is','are'], correct:0}
];
const ANSWER_QUIZ = [
  {q:'Is there a library? You see a library on the map. You say:', options:['Yes, there is.','Yes, there are.','Yes, it is.'], correct:0},
  {q:'Is there a swimming pool? There is no pool. You say:', options:['No, there isn’t.','No, there aren’t.','No, I don’t.'], correct:0},
  {q:'Are there any classrooms? There are many. You say:', options:['Yes, there is.','Yes, there are.','Yes, they are.'], correct:1}
];
const PICK_QUESTION = [
  {goal:'You want to know if there is a library.', options:['Is there a library?','There is library?','Are there a library?'], correct:0},
  {goal:'You want to know about many computers.', options:['Are there any computers?','Is there any computers?','There are computers?'], correct:0},
  {goal:'You want to name a place for a new student.', options:['This is the library.','This the library is.','It library is.'], correct:0}
];

/* ===== Section 3: Listen, Mark the Map =====
   Part A: hear a short description, tap the place on the map.
   Part B: one or many? Listen for "There is" or "There are". */
const LISTEN_PLACES = [
  {say:'There are many books. There are quiet tables. You can read here.', pitch:1.12, answer:'library', options:['library','canteen','parking lot']},
  {say:'There are many tables. There is a lot of food. You can eat here.', pitch:0.85, answer:'canteen', options:['management building','canteen','sports field']},
  {say:'There are many offices. Staff work here. You can ask for help here.', pitch:1.05, answer:'management building', options:['library','management building','classroom building']},
  {say:'There is a big field. There are two goals. You can play soccer here.', pitch:0.9, answer:'sports field', options:['sports field','parking lot','canteen']}
];
const LISTEN_COUNT = [
  {say:'There is a canteen.', pitch:1.1, answer:0},
  {say:'There are three libraries.', pitch:0.85, answer:1},
  {say:'There are many classrooms.', pitch:1.05, answer:1},
  {say:'There is a big field.', pitch:0.9, answer:0}
];
const COUNT_OPTIONS = ['One (There is)', 'Many (There are)'];

/* ===== Section 4: Say It! ===== */
const SOUND_TIPS = {
  contraction: {written:'There is', fast:'"There’s"', ex:'There’s a library.', note:'In fast speech, "There is" is short: "There’s".'},
  plural: [
    {text:'classrooms', note:'The -s sounds like /z/. Say "classroomz".'},
    {text:'books', note:'The -s sounds like /s/. Say "books".'}
  ],
  question: {text:'Is there a library?', note:'The voice goes up at the end of a yes/no question.'}
};
const LADDER_MODEL = [
  'This is the library.',
  'There are many books.',
  'This is the canteen.',
  'There is a lot of food.'
];
const ECHO_RACE = {
  steps: [
    'Make 2 teams. Your teacher shows a place on the map.',
    'Team 1 says: "This is the ___. There is / There are ___."',
    'Give 1 point for the place and 1 point for the right "is" or "are".',
    'Team 2 gets the next place. Keep going.',
    'Last round: one student from each team says three places alone.'
  ]
};

/* ===== Section 5: Game, Hidden Place ===== */
const HIDDEN = {
  steps: [
    'Work in a group of 3 or 4. One student is the Keeper. The Keeper presses "Pick a secret place" and looks. Nobody else looks!',
    'The others ask yes/no questions: "Is there a bed?" "Are there any books?" The Keeper answers: "Yes, there is." or "No, there isn’t."',
    'You can ask only 8 questions. Then guess: "Is it the library?"',
    'Right guess: you win a point. Then a new Keeper takes the phone.'
  ],
  starters: ['Is there a ___?', 'Are there any ___?', 'Can you eat here?', 'Is it the ___?'],
  answers: ['Yes, there is.', 'Yes, there are.', 'No, there isn’t.', 'No, there aren’t.']
};
const HIDDEN_CLUES = ['books', 'tables', 'food', 'offices', 'a field', 'motorbikes', 'stairs', 'a front desk'];

/* ===== Section 6: What Makes a Good School? ===== */
const GOOD_IDEAS = [
  {id:'teachers', text:'good teachers', say:'good teachers'},
  {id:'library',  text:'a big library', say:'a big library'},
  {id:'wifi',     text:'fast Wi-Fi', say:'fast Wi-Fi'},
  {id:'food',     text:'cheap food', say:'cheap food'},
  {id:'friends',  text:'friendly students', say:'friendly students'},
  {id:'clean',    text:'clean toilets', say:'clean toilets'},
  {id:'aircon',   text:'air conditioning', say:'air conditioning'},
  {id:'safe',     text:'a safe campus', say:'a safe campus'}
];
const OPINION_FRAMES = [
  {frame:'I think a good school has ___ because ___.', example:'I think a good school has good teachers because they help us.'},
  {frame:'For me, ___ is number 1.', example:'For me, fast Wi-Fi is number 1.'},
  {frame:'My number 1 is ___ because it’s ___.', example:'My number 1 is a big library because it’s quiet.'}
];
const RANK_STEPS = [
  'Choose your top 3 ideas. Tap them in order: first is number 1.',
  'Tell your partner: "My number 1 is ___ because ___."',
  'Listen to your partner. Ask: "Why?"',
  'Do you have the same number 1? Say "Me too!" If not, that is OK. Everyone can think differently.'
];

/* ===== Section 7: Speaking Task, School Tour ===== */
const TOUR = {
  title:'School Tour',
  steps:[
    'Find a partner you do not sit with every day. Your partner is a new student.',
    'Use the PKRU map below. Look at the pictures, not at paper with sentences.',
    'Tour 1: show 3 or more places. Say "This is the ___." and what is there.',
    'Then give your opinion: "I think a good school has ___ because ___."',
    'Your partner asks you 2 questions: "Is there a ___?" Answer with Yes, there is. or No, there isn’t.',
    'Time: 1 to 2 minutes. Then change roles.'
  ],
  model:[
    'Welcome to PKRU! This is the library.',
    'There are many books and there are quiet tables.',
    'This is the canteen. There is a lot of food.',
    'This is the sports field. There is a big field and there are two goals.',
    'I think a good school has good teachers because they help us.'
  ],
  questions:['Is there a library?', 'Is there a canteen?', 'Are there any computers?', 'Is there a parking lot?']
};
const PEER_CHECKLIST = [
  'Named 3 or more places: "This is the ___."',
  'Used There is / There are right (3 of 3).',
  'Gave an opinion: "I think a good school has ___ because ___."',
  'Answered 2 questions with Yes, there is. / No, there isn’t.',
  'Spoke for 1 to 2 minutes.',
  'Used the map only, eyes up (no reading).'
];

/* ===== Section 8: Self-Check ===== */
const CAN_DO = [
  'I can name places at PKRU: This is the library.',
  'I can say what is there with There is and There are.',
  'I can answer: Is there a ___? Yes, there is. No, there isn’t.',
  'I can give an opinion with I think and because.',
  'I can understand a short description of a place.',
  'I can give a 1 to 2 minute school tour with no paper.'
];
const SCALE = [
  {v:1, label:'Not yet'},
  {v:2, label:'Almost'},
  {v:3, label:'Yes!'}
];

/* ===== Extra practice (take-home, separate site) ===== */
const EXTRA = {
  label:'Extra practice: Wonder Library, English Expedition',
  note:'Listen and read more English about places and school life. About 10 minutes, on your phone.',
  href:'https://wonder-library.vercel.app/#/english'
};

/* Exit ticket (shared component js/exit-ticket.js): 2 questions tied to the output, a confidence rating, and an optional note. */
const EXIT_CFG = {
  "outcome": "I can give a short tour of my school with one opinion.",
  "questions": [
    {
      "q": "There ___ two canteens at our school.",
      "options": [
        "is",
        "are",
        "am"
      ],
      "correct": 1
    },
    {
      "q": "Which sentence is an opinion with a reason?",
      "options": [
        "I think a good school has good teachers because they help us.",
        "This is the library.",
        "There is a library."
      ],
      "correct": 0
    }
  ]
};
