/* ===================== UNIT 5 CONTENT DATA — DAILY ROUTINE =====================
   All lesson content lives here: vocabulary, grammar, practice, Bingo,
   discussion, speaking, assignment, exit ticket. Nothing here is UI logic —
   see app.js for rendering/state/voice/progress-tracking. Content sourced
   from the "My Daily Routine" lesson build for English for Communication,
   1st Year Accounting, A1 level. */

const VOCAB = [
  {id:'wake', ic:'🌅', nm:'Wake Up', thai:'ตื่นนอน', ex:'"I usually wake up at 6:30 in the morning."'},
  {id:'ready', ic:'🪥', nm:'Get Ready', thai:'เตรียมตัว', ex:'"First, I get ready for class."'},
  {id:'class', ic:'🎓', nm:'Attend Class', thai:'เข้าเรียน', ex:'"I attend class at 9 o\'clock every day."'},
  {id:'notes', ic:'📝', nm:'Review Notes', thai:'ทบทวนโน้ต', ex:'"After class, I review my notes."'},
  {id:'bed', ic:'🛏️', nm:'Go To Bed', thai:'เข้านอน', ex:'"I usually go to bed at ten p.m."'}
];

const GRAMMAR_EX = [
  {tag:'Habit', text:'I usually wake up at 6 a.m.'},
  {tag:'Sequence', text:'First, I get ready. Then, I attend class.'},
  {tag:'Time', text:'I attend class at 9 o\'clock.'},
  {tag:'Sequence', text:'After class, I review my notes.'},
  {tag:'Habit', text:'I go to bed at 10 p.m.'},
  {tag:'Question', text:'What time do you usually wake up?'}
];

const GRAMMAR_CHECK = [
  {q:'Choose the correct sentence.', opts:['I usually wakes up at 6.','I usually wake up at 6.','I usual wake up at 6.','I waking up at 6 usually.'], correct:1},
  {q:'Which word starts describing the FIRST thing you do?', opts:['Finally','After that','First','Then'], correct:2}
];

const PRACTICE_SENTENCES = [
  {text:'I usually ______ at 6:30 in the morning.', opts:['wake up','go to bed','attend class'], correct:0},
  {text:'______ that, I get ready for class.', opts:['First','After','Go'], correct:1},
  {text:'I ______ class at 9 o\'clock every day.', opts:['attend','attends','attending'], correct:0},
  {text:'In the evening, I ______ my notes before the exam.', opts:['review','reviews','reviewing'], correct:0}
];

/* "Find Someone Who..." Bingo — 24 items + 1 free space, 5x5 grid.
   Winning lines (row/column/diagonal) use the same index layout as the grid. */
const BINGO_ITEMS = [
  {ic:'🌅', short:'Wakes before 6am', q:'What time do you wake up?'},
  {ic:'🌙', short:'Sleeps after 11pm', q:'What time do you go to bed?'},
  {ic:'☕', short:'Coffee every morning', q:'Do you drink coffee every morning?'},
  {ic:'📚', short:'Studies every day', q:'Do you study every day?'},
  {ic:'🏃', short:'Exercises before class', q:'Do you exercise before class?'},
  {ic:'🍳', short:'Eats breakfast daily', q:'Do you eat breakfast every morning?'},
  {ic:'📝', short:'Reviews notes after class', q:'Do you review your notes after class?'},
  {ic:'🚶', short:'Walks to university', q:'Do you walk to university?'},
  {ic:'🏍️', short:'Rides a motorbike', q:'Do you ride a motorbike to class?'},
  {ic:'😴', short:'Naps in the afternoon', q:'Do you take a nap in the afternoon?'},
  {ic:'🍽️', short:'Cooks own breakfast', q:'Do you cook your own breakfast?'},
  {ic:'🎧', short:'Music while studying', q:'Do you listen to music while studying?'},
  {ic:'⭐', short:'FREE SPACE', q:'', free:true},
  {ic:'📱', short:'Checks phone on waking', q:'Do you check your phone right after waking up?'},
  {ic:'⏰', short:'Class before 9am', q:'Do you have class before 9 a.m.?'},
  {ic:'🍜', short:'Eats lunch on campus', q:'Do you eat lunch on campus?'},
  {ic:'🌃', short:'Homework at night', q:'Do you do homework at night?'},
  {ic:'🛏️', short:'Sleeps before 10pm', q:'Do you go to bed before 10 p.m.?'},
  {ic:'🌤️', short:'Wakes after 7am', q:'Do you wake up after 7 a.m.?'},
  {ic:'💧', short:'Water in the morning', q:'Do you drink water first thing in the morning?'},
  {ic:'📖', short:'Reviews before exams', q:'Do you review your notes before an exam?'},
  {ic:'🚌', short:'Takes the bus', q:'Do you take the bus to university?'},
  {ic:'🏋️', short:'Exercises after class', q:'Do you exercise after class?'},
  {ic:'🏠', short:'Breakfast at home', q:'Do you eat breakfast at home?'},
  {ic:'👯', short:'Studies with a friend', q:'Do you study with a friend?'}
];
const BINGO_LINES = [
  [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
  [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
  [0,6,12,18,24],[4,8,12,16,20]
];

const REPORT_STARTERS = [
  'Anna wakes up at 5:30.',
  'Ben goes to bed after 11 p.m.',
  'Three students drink coffee every morning.',
  'Most students eat breakfast every day.'
];

const DISCUSSION_PROMPTS = [
  'Who wakes up the earliest?',
  'Who sleeps the latest?',
  'What is the most common morning habit?',
  'Is our class healthy?',
  'How many students exercise before class?'
];

const INTERVIEW_QUESTIONS = [
  'What time do you usually wake up?',
  'What do you do to get ready in the morning?',
  'What time do you attend your first class?',
  'What do you usually do after class?',
  'What time do you usually go to bed?',
  'What\'s your favorite part of your daily routine?'
];

const VLOG_HOOKS = ['Hey guys! Come spend a day in my life as a university student.', 'POV: it\'s another day as an accounting student.'];
const VLOG_TRANSITIONS = ['First things first, I...', 'Fast forward to...', 'A few hours later...', 'Meanwhile...'];
const VLOG_ROUTINE = ['I usually wake up at...', 'After class, I...', 'Before bed, I...'];
const VLOG_OUTRO = ['That\'s a wrap! See you in the next one!', 'Thanks for watching my day as a uni student!'];

const EXIT_TICKET = [
  {q:'Which word means "to look at your notes again to remember them"?', opts:['get ready','review notes','attend class','go to bed'], correct:1},
  {q:'Complete: "I ______ to bed at 10 p.m."', opts:['go','goes','going','gone'], correct:0}
];

/* ===================== PRACTICE SETS (reused across 6 tabs) ===================== */
const LAB_VOCAB = [
  {q:'Which word means "to open your eyes and get out of bed"?', opts:['wake up','get ready','go to bed','review notes'], correct:0},
  {q:'Which word means "to brush your teeth and put on clothes"?', opts:['attend class','get ready','review notes','wake up'], correct:1},
  {q:'Which word means "to go to your lessons at university"?', opts:['get ready','go to bed','attend class','wake up'], correct:2},
  {q:'Which word means "to look at your notes again before an exam"?', opts:['wake up','review notes','attend class','go to bed'], correct:1},
  {q:'Which word means "to sleep at night"?', opts:['get ready','attend class','go to bed','review notes'], correct:2}
];

const LAB_GRAMMAR = [
  {q:'I usually ______ at 6 a.m.', opts:['wake up','wakes up','waking up'], correct:0, explain:'We use the base verb after "I". No -s!'},
  {q:'She usually ______ at 6 a.m.', opts:['wake up','wakes up','waking up'], correct:1, explain:'We add -s for "she / he / it".'},
  {q:'______, I get ready. Then, I attend class.', opts:['Finally','First','After'], correct:1, explain:'"First" starts the sequence.'},
  {q:'After class, I ______ my notes.', opts:['review','reviews','reviewing'], correct:0, explain:'Base verb after "I".'},
  {q:'I go to bed ______ 10 p.m.', opts:['in','at','on'], correct:1, explain:'We use "at" with clock times.'}
];

const LAB_TIME = [
  {q:'What time do you usually wake up?', choices:['Before 6am','6–7am','7–8am','After 8am']},
  {q:'What time do you attend your first class?', choices:['Before 8am','8–9am','9–10am','After 10am']},
  {q:'What time do you usually go to bed?', choices:['Before 9pm','9–10pm','10–11pm','After 11pm']}
];

const LAB_LISTEN = [
  {audio:'I usually wake up at six thirty.', opts:['I wake up at 6:30.','I wake up at 7:30.','I go to bed at 6:30.'], correct:0},
  {audio:'First, I get ready. Then I attend class.', opts:['I get ready, then I go to bed.','I get ready, then I attend class.','I attend class, then I get ready.'], correct:1},
  {audio:'After class, I review my notes.', opts:['I review my notes before class.','I review my notes after class.','I don\'t review my notes.'], correct:1},
  {audio:'I usually go to bed at ten p.m.', opts:['I go to bed at 10 a.m.','I wake up at 10 p.m.','I go to bed at 10 p.m.'], correct:2}
];

const LAB_SPEAK_PROMPTS = [
  {seconds:30, text:'Speak for 30 seconds: Tell me about your morning.'},
  {seconds:60, text:'Speak for 1 minute: Tell me about your daily routine.'}
];
const LAB_SPEAK_STARTERS = ['I usually...', 'First,...', 'Then,...', 'After that,...', 'Finally,...', 'I go to bed at...'];

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up'},
  {key:'s2', label:'Vocabulary'},
  {key:'s3', label:'Grammar & Phrases'},
  {key:'s4', label:'Guided Practice'},
  {key:'s5', label:'Find Someone Who'},
  {key:'s6', label:'Report Back'},
  {key:'s7', label:'Class Discussion'},
  {key:'s8', label:'Partner Interview'},
  {key:'s9', label:'Vlog Assignment'},
  {key:'s10', label:'Exit Ticket'},
  {key:'practice', label:'Practice Sets'},
  {key:'s11', label:'Self-Check & Take Home'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 5: My Daily Routine',
  unitCode: 'unit-5'
};

const STUDY_GUIDE_DATA_URI = "../../../assets/study-guide/Unit5-Daily-Routine-Study-Guide.jpg";
const STUDY_GUIDE_FILENAME = "Unit5-Daily-Routine-Study-Guide.jpg";

/* Real photos for each of the 5 core vocabulary words — same person across
   all 5, showing one continuous day, so the set reads as one story. */
const SECTION_PHOTOS = {
  wake:  { src:'../../../assets/images/dr-wake.jpg',  alt:'A young man stretching and waking up in bed' },
  ready: { src:'../../../assets/images/dr-ready.jpg', alt:'A young man getting ready, putting on a shirt' },
  class: { src:'../../../assets/images/dr-class.jpg', alt:'A university student with a backpack and notebook outside a classroom' },
  notes: { src:'../../../assets/images/dr-notes.jpg', alt:'A student reviewing handwritten notes at a desk' },
  bed:   { src:'../../../assets/images/dr-bed.jpg',   alt:'A young man turning off an alarm clock and going to bed at night' }
};
