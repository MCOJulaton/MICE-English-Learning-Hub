/* ===================== UNIT 3 CONTENT DATA, LIKES AND DISLIKES =====================
   English for Communication, third class. Same speaking-first ladder as
   Units 1 and 2: see it, hear it, say it, then use it with no paper, and the
   paper support fades on purpose.
   The core idea: say what you like or do not like, ALWAYS add "because", and
   ask back. It builds on the Unit 2 chat pattern (Ask, Answer, Add, Ask back):
   the ADD is now a reason with "because".
   All content is ORIGINAL, written for this site. A1 language, American
   English, no dashes. The computer voice is the browser's own text-to-speech
   (en-US), so there are no audio files to host.
   Planned for about 90 minutes in a 2-hour class slot. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up: Thumbs Up, Thumbs Down'},
  {key:'s2', label:'How Much Do You Like It?'},
  {key:'s3', label:'Listen: Who Likes What?'},
  {key:'s4', label:'Say It!'},
  {key:'s5', label:'Games: This or That'},
  {key:'s5b', label:'Notes and He/She'},
  {key:'s6', label:'Speaking Task: Favorites Interview'},
  {key:'s7', label:'Self-Check'},
  {key:'exit', label:'Exit Ticket'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 3, Likes and Dislikes',
  unitCode: 'unit-3'
};

const LESSON_OBJECTIVES = [
  'Say what you like and what you do not like.',
  'Give a reason with "because".',
  'Ask and answer: "What’s your favorite ___?"',
  'Take short keyword notes when you listen.',
  'Tell a new partner what your partner likes.'
];

/* ===== Section 1: Warm-Up, Thumbs Up, Thumbs Down ===== */
const THUMBS = {
  steps: [
    'Your teacher says a sentence, like "I like coffee."',
    'Show your thumb: thumbs up means you like it. Thumbs down means you do not like it.',
    'Look at a classmate. If you are the same, say: "Me too!" or "Me neither."',
    'If you are different, ask: "Why?" Your classmate says: "Because..."',
    'Your teacher says more sentences. Try to say something every time.'
  ],
  sentences: ['I like pizza.', 'I love music.', 'I don’t like rainy days.', 'I hate waking up early.', 'I like swimming.'],
  helpers: ['Me too!', 'Me neither.', 'Why?', 'Because it’s fun.']
};

/* ===== Section 2: How Much Do You Like It? ===== */
const SCALE_CARDS = [
  {say:'I love pizza.', level:'plus2', label:'love', note:'Very, very good. A strong word.'},
  {say:'I like pizza.', level:'plus1', label:'like', note:'Good.'},
  {say:'I don’t like pizza.', level:'minus1', label:'don’t like', note:'Not good. This is polite and clear.'},
  {say:'I hate pizza.', level:'minus2', label:'hate', note:'Very, very bad. A strong word. Use it for small things, like Mondays!'}
];
const SCALE_TIP = '"Dislike" and "don’t like" mean the same. In speaking we say "I don’t like it."';

const STRONGER_QUIZ = [
  {q:'Which word is stronger?', options:['like','love'], correct:1},
  {q:'Which word is stronger?', options:['don’t like','hate'], correct:1},
  {q:'You think spiders are terrible! You say: "I ___ spiders."', options:['hate','like','love'], correct:0}
];

const REASON_WORDS = [
  {word:'fun', ex:'I like swimming because it’s fun.'},
  {word:'boring', ex:'I don’t like homework because it’s boring.'},
  {word:'delicious', ex:'I love pizza because it’s delicious.'},
  {word:'relaxing', ex:'I like music because it’s relaxing.'},
  {word:'exciting', ex:'I like soccer because it’s exciting.'},
  {word:'too hot', ex:'I don’t like April because it’s too hot.'},
  {word:'expensive', ex:'I don’t like shopping because it’s expensive.'},
  {word:'interesting', ex:'I like movies because they’re interesting.'}
];

const FRAMES = [
  {frame:'I like ___ because it’s ___.', example:'I like coffee because it’s delicious.'},
  {frame:'I don’t like ___ because it’s ___.', example:'I don’t like rainy days because they’re boring.'},
  {frame:'My favorite ___ is ___.', example:'My favorite food is noodles.'},
  {frame:'What’s your favorite ___?', example:'What’s your favorite color?'},
  {frame:'I like ___, but I don’t like ___.', example:'I like tea, but I don’t like coffee.'}
];

const BECAUSE_QUIZ = [
  {q:'I like swimming ___ it’s fun.', options:['because','but','or'], correct:0},
  {q:'I like tea, ___ I don’t like coffee.', options:['because','but','so'], correct:1},
  {q:'I don’t like homework ___ it’s boring.', options:['but','because','and'], correct:1}
];
const PICK_QUESTION = [
  {goal:'You want to know your partner’s favorite food.', options:['What’s your favorite food?','What food favorite?','Do you favorite food?'], correct:0},
  {goal:'You want to know the reason.', options:['Why do you like it?','Why you like?','What because?'], correct:0},
  {goal:'You want to know if they like music.', options:['Do you like music?','You like music do?','Are you like music?'], correct:0}
];

/* ===== Section 3: Listen, Who Likes What? =====
   Part A: three speakers, three topics each. Students tick Like or Don't like.
   Part B: listen for the reason after "because". */
const SPEAKERS = [
  {
    name:'Mai', pitch:1.15,
    say:'I love pizza. I like swimming. I don’t like rainy days.',
    items:[{topic:'pizza', like:true},{topic:'swimming', like:true},{topic:'rainy days', like:false}]
  },
  {
    name:'Tom', pitch:0.8,
    say:'I hate spicy food. I like coffee. I love soccer.',
    items:[{topic:'spicy food', like:false},{topic:'coffee', like:true},{topic:'soccer', like:true}]
  },
  {
    name:'Fon', pitch:1.1,
    say:'I don’t like early mornings. I like music. I hate homework.',
    items:[{topic:'early mornings', like:false},{topic:'music', like:true},{topic:'homework', like:false}]
  }
];
const REASON_LISTEN = [
  {say:'I like swimming because it’s fun.', pitch:1.15, q:'Why does the speaker like swimming?', options:['It’s fun.','It’s cheap.','It’s hot.'], correct:0},
  {say:'I don’t like homework because it’s boring.', pitch:0.8, q:'Why doesn’t the speaker like homework?', options:['It’s difficult.','It’s boring.','It’s long.'], correct:1},
  {say:'I love music because it’s relaxing.', pitch:1.1, q:'Why does the speaker love music?', options:['It’s relaxing.','It’s loud.','It’s new.'], correct:0}
];

/* ===== Section 4: Say It! ===== */
const SOUND_TIPS = {
  stress: [
    {text:'I LOVE pizza.', note:'The feeling word is the important word. Say it louder and longer.'},
    {text:'I don’t LIKE it.', note:'In "don’t like", the word "like" is strong.'}
  ],
  because: {written:'because', fast:'"b’cuz"', ex:'I like it because it’s fun.', note:'In fast speech, "because" is short: "b’cuz".'},
  choice: {text:'Tea or coffee?', note:'The voice goes up on "tea" and down on "coffee".'}
};
const LADDER_MODEL = [
  'I like music.',
  'I like music because it’s relaxing.',
  'I don’t like homework.',
  'I don’t like homework because it’s boring.'
];
const ECHO_RACE = {
  steps: [
    'Make 2 teams. Your teacher says a topic, like "pizza" or "rainy days".',
    'Team 1 says a full sentence: "I like pizza because it’s delicious."',
    'Give 1 point for the right sentence and 1 point for a reason with "because".',
    'Team 2 gets the next topic. Keep going.',
    'Last round: one student from each team says two sentences alone: one like and one dislike.'
  ]
};

/* ===== Section 5: Games ===== */
const THIS_OR_THAT = [
  {a:'tea', b:'coffee'},
  {a:'beach', b:'mountains'},
  {a:'cats', b:'dogs'},
  {a:'rainy days', b:'sunny days'},
  {a:'pizza', b:'noodles'},
  {a:'morning', b:'night'},
  {a:'reading books', b:'watching movies'},
  {a:'hot weather', b:'cool weather'}
];
const TOT_CHECKS = ['I chose one', 'I said because', 'I asked back'];
const TOT_RULES = [
  'Sit with a partner. Press "Next" to get two choices.',
  'Choose one. Say: "I like ___ because it’s ___."',
  'Then ask back: "What about you?" Your partner chooses and gives a reason.',
  'Check each box when you do it. Do 3 pairs at least.'
];
const BAR_GRAPH = {
  title:'Extra game, if there is time: Human Bar Graph',
  steps: [
    'Your teacher asks a question with 3 choices, like "What is your favorite season? Hot, rainy, or cool?"',
    'Walk to the corner of the room for your choice. Stand in a line with your group.',
    'Now the class is a bar graph! Count how many students are in each line.',
    'Say a sentence about the class: "Eight students like the rainy season."',
    'Ask a student in another line: "Why do you like the cool season?" They answer with "because".'
  ]
};
const QUESTION_BALL = {
  title:'Game: Question Ball',
  steps: [
    'Stand in a big circle. The teacher has a soft ball.',
    'The teacher asks a student: "What’s your favorite food?" and throws the ball.',
    'The student answers with "because", then asks a NEW question to another student and throws the ball.',
    'You cannot repeat a question. Listen to the others!'
  ],
  questions:['What’s your favorite food?', 'What’s your favorite sport?', 'What’s your favorite place in Phuket?', 'What’s your favorite day of the week?', 'Do you like hot weather?']
};

/* ===== Section 5b: Notes and He/She =====
   Two skills the interview report needs: write keywords (not sentences) while
   you listen, and say he/she with the -s. */
const NOTES_TIP = 'Notes are keywords only. Write "noodles, delicious". Do not write "My favorite food is noodles because they are delicious."';
const NOTES_LISTEN = [
  {say:'My favorite food is noodles because they’re delicious.', pitch:1.1, model:'food: noodles, delicious'},
  {say:'I don’t like rainy days because they’re boring.', pitch:0.85, model:'rainy days (no), boring'},
  {say:'My favorite place in Phuket is the beach because it’s relaxing.', pitch:1.05, model:'place: beach, relaxing'}
];
const HESHE_DRILL = [
  {i:'I like music.', she:'She likes music.'},
  {i:'I love pizza.', she:'He loves pizza.'},
  {i:'I don’t like rainy days.', she:'She doesn’t like rainy days.'},
  {i:'My favorite food is noodles.', she:'His favorite food is noodles.'},
  {i:'I hate homework.', she:'He hates homework.'},
  {i:'I like swimming because it’s fun.', she:'She likes swimming because it’s fun.'}
];

/* ===== Section 6: Speaking Task, Favorites Interview ===== */
const INTERVIEW = {
  title:'Favorites Interview',
  steps:[
    'Find a partner you do not sit with every day.',
    'Ask 5 questions. Use "What’s your favorite ___?" for each one.',
    'After each answer, ask: "Why do you like it?" Listen for "because".',
    'Write short notes on your partner card. Notes only, not full sentences.',
    'Then change partners. Tell your new partner what your first partner likes.'
  ]
};
const CARD_FIELDS = [
  {key:'f1', label:'Favorite food', why:'because ...'},
  {key:'f2', label:'Favorite music', why:'because ...'},
  {key:'f3', label:'Favorite sport or activity', why:'because ...'},
  {key:'f4', label:'Favorite place in Phuket', why:'because ...'},
  {key:'f5', label:'Favorite day of the week', why:'because ...'}
];
const REPORT = {
  title:'Tell the class about your partner',
  model:[
    'Mai’s favorite food is pizza because it’s delicious.',
    'She likes music because it’s relaxing.',
    'She doesn’t like rainy days because they’re boring.'
  ],
  sTip:[
    {i:'I like', she:'She likes'},
    {i:'I love', she:'She loves'},
    {i:'I don’t like', she:'She doesn’t like (no s on like)'},
    {i:'My favorite food is', she:'Her favorite food is'}
  ],
  sTipNote:'For he or she, add -s to like, love and hate. After "doesn’t", do not add -s.'
};
const PEER_CHECKLIST = [
  'Asked 5 favorite questions: "What’s your favorite ___?"',
  'Asked "Why?" after each answer.',
  'My partner gave a reason with "because" every time.',
  'Wrote keyword notes, not full sentences.',
  'Reported 3 sentences about my partner, with "because".',
  'Used he/she and -s right in at least 2 of 3 sentences.',
  'Spoke with no paper, eyes up.'
];

/* ===== Section 7: Self-Check ===== */
const CAN_DO = [
  'I can say what I like and what I do not like.',
  'I can give a reason with because.',
  'I can ask: What’s your favorite ___?',
  'I can understand when someone says what they like.',
  'I can take keyword notes when I listen.',
  'I can tell a new partner what my partner likes.'
];
const SCALE = [
  {v:1, label:'Not yet'},
  {v:2, label:'Almost'},
  {v:3, label:'Yes!'}
];

/* ===== Extra practice (take-home, separate site) ===== */
const EXTRA = {
  label:'Extra practice: English Expedition, Station 1 "Meet the World"',
  note:'Review "I like..." sentences, hobbies and word order. About 12 minutes, on your phone.',
  href:'https://wonder-library.vercel.app/#/english'
};

/* Exit ticket (shared component js/exit-ticket.js): 2 questions tied to the output, a confidence rating, and an optional note. */
const EXIT_CFG = {
  "outcome": "I can ask about favorites and tell a partner what my classmate likes.",
  "questions": [
    {
      "q": "Which sentence gives a reason?",
      "options": [
        "I like pizza.",
        "Do you like pizza?",
        "I like pizza because it is delicious."
      ],
      "correct": 2
    },
    {
      "q": "Mai likes music. How do you tell the class about Mai?",
      "options": [
        "Mai like music.",
        "She likes music.",
        "She like music."
      ],
      "correct": 1
    }
  ]
};
