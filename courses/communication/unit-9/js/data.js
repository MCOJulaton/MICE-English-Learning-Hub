/* ===================== UNIT 9 CONTENT DATA — SOCIOLOGY: AGREE, DISAGREE & DISCUSS =====================
   Sociology Day 2 (Speaking Day) — continues Unit 8, paired with the same
   real Q: Skills for Success Unit 4 recordings (licensed audio, see
   /assets/audio/comm-unit9/). Comprehension questions, grammar practice,
   and speaking prompts below are ORIGINAL, written for this site — not
   copied from the textbook. Correct answers for the "Consider the Ideas"
   checklist are grounded in the real Teacher's Book answer key. The
   Unit Assignment rubric criteria are reproduced from the real Teacher's
   Book rubric for the instructor's own grading use. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Grammar: Subject & Object Pronouns'},
  {key:'s2', label:'Pronunciation: Reduced Pronouns'},
  {key:'s3', label:'Speaking Skill: Agree & Disagree'},
  {key:'s4', label:'Consider the Ideas'},
  {key:'s5', label:'Plan Your Group Discussion'},
  {key:'s6', label:'Unit Assignment & Rubric'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 9, Sociology: Agree, Disagree & Discuss',
  unitCode: 'unit-9'
};

/* ===== Audio tracks (real licensed recordings) ===== */
const AUDIO = {
  pronExamples: '../../../assets/audio/comm-unit9/04-pronunciation-examples.mp3',
  pronActivity: '../../../assets/audio/comm-unit9/05-pronunciation-activity.mp3',
  speakExamples: '../../../assets/audio/comm-unit9/06-speaking-skill-examples.mp3',
  speakActivity: '../../../assets/audio/comm-unit9/07-speaking-skill-activity.mp3',
  considerIdeas: '../../../assets/audio/comm-unit9/08-consider-the-ideas.mp3'
};

/* ===== Section 1: Grammar — Subject and Object Pronouns ===== */
const PRONOUN_TABLE = [
  {subject:'I', object:'me'}, {subject:'you', object:'you'}, {subject:'he', object:'him'},
  {subject:'she', object:'her'}, {subject:'it', object:'it'}, {subject:'we', object:'us'}, {subject:'they', object:'them'}
];
const PRONOUN_CIRCLE = [
  {sentence:'___ enjoys playing board games with friends.', opts:['He','Him'], answer:0},
  {sentence:'My sister invited ___ to the game night.', opts:['I','me'], answer:1},
  {sentence:'___ always play tennis on Saturday mornings.', opts:['We','Us'], answer:0},
  {sentence:'Can you give the notebook to ___?', opts:['she','her'], answer:1},
  {sentence:'___ is a relaxing way to spend the afternoon.', opts:['It','It\'s'], answer:0},
  {sentence:'I want to sit next to ___ at the concert.', opts:['they','them'], answer:1},
  {sentence:'Please tell ___ about the new hiking trail.', opts:['I','me'], answer:1},
  {sentence:'___ enjoy playing chess more than video games.', opts:['They','Them'], answer:0}
];
const PRONOUN_REPLACE = [
  {sentence:'Mai and I like going to the market on weekends.', underline:'Mai and I', answer:'We'},
  {sentence:'Please give the tickets to Somchai and Nok.', underline:'Somchai and Nok', answer:'them'},
  {sentence:'The board game was too easy for the children.', underline:'the children', answer:'them'},
  {sentence:'My friend enjoys hiking every weekend.', underline:'My friend', answer:'She (or He)'},
  {sentence:'I told the teacher about the school trip.', underline:'the teacher', answer:'her (or him)'},
  {sentence:'The new sports center opened last month.', underline:'The new sports center', answer:'It'}
];

/* ===== Section 2: Pronunciation — Reduced Pronouns (real audio) ===== */
const REDUCED_TIP = [
  'In fast, casual speech, he, him, her, and them often lose their first sound.',
  'This does NOT happen when the pronoun is the very first word of a sentence.',
  'Listen for this reduced sound, but always write the full pronoun.'
];
const REDUCED_DIALOGUE = [
  {line:'A: Did you invite Anan to the game night?', blank:false},
  {line:'B: Yes, I invited ___. He said ___ will come after work.', answers:['him','he']},
  {line:'A: What about Pim? Did you ask ___?', answers:['her']},
  {line:'B: Not yet. I will call ___ tonight.', answers:['her']}
];

/* ===== Section 3: Speaking Skill — Agreeing and Disagreeing (real audio) ===== */
const AGREE_PHRASES = [
  {type:'Agreeing', ex:'I do too.'}, {type:'Agreeing', ex:'Me too.'},
  {type:'Agreeing', ex:"I don't either."}, {type:'Agreeing', ex:'Me neither.'},
  {type:'Disagreeing (politely)', ex:"Oh, I don't know."}, {type:'Disagreeing (politely)', ex:"I'm not sure about that."}
];
const AGREE_LISTEN_PROMPTS = [
  'Exchange 1: A talks about a free-time activity. Does B agree or disagree?',
  'Exchange 2: A shares an opinion about board games. Does B agree or disagree?',
  'Exchange 3: A says an activity is relaxing. Does B agree or disagree?',
  'Exchange 4: A talks about spending time with friends. Does B agree or disagree?',
  'Exchange 5: A shares a strong opinion. Does B agree or disagree?',
  'Exchange 6: A asks a question about free time. Does B agree or disagree?'
];
const AGREE_CREATE_PROMPTS = [
  'I like playing ___ in my free time.',
  'I think ___ is the most relaxing activity.',
  'I would rather spend my free time ___ than ___.',
  'On weekends, I usually ___.',
  'My favorite free-time activity is ___ because ___.',
  'I don\'t really enjoy ___.'
];

/* ===== Section 4: Consider the Ideas (real audio, checklist) ===== */
const CONSIDER_ACTIVITIES = [
  {id:'hiking', label:'Hiking', mentioned:true},
  {id:'tennis', label:'Playing tennis', mentioned:true},
  {id:'soccer', label:'Playing soccer', mentioned:false},
  {id:'gym', label:'Going to the gym', mentioned:false},
  {id:'reading', label:'Reading books', mentioned:true},
  {id:'plays', label:'Going to plays', mentioned:true},
  {id:'museum', label:'Going to a museum', mentioned:true},
  {id:'concerts', label:'Going to concerts', mentioned:true},
  {id:'dance', label:'Taking dance classes', mentioned:true},
  {id:'computer', label:'Taking computer classes', mentioned:true},
  {id:'beach', label:'Lying on the beach', mentioned:true},
  {id:'videogames', label:'Playing video games', mentioned:false}
];

/* ===== Section 5: Plan Your Group Discussion ===== */
const PLAN_ROWS_COUNT = 5;
const PLAN_HEADERS = ['Activity you enjoy', 'Where in your area', 'Why you enjoy it'];

/* ===== Section 6: Unit Assignment & Rubric ===== */
const ASSIGNMENT = {
  title: 'Have a Group Discussion',
  prompt: 'About things you enjoy doing in your area',
  steps: [
    'Form a group of 3 to 4 students.',
    'Each student shares 2-3 activities they enjoy doing in your area, using your notes from Section 5.',
    'Use subject and object pronouns correctly as you talk about yourself and your group members.',
    'Agree or disagree with each other using the expressions from Section 3.',
    'Try to use natural, reduced pronunciation for he, him, her, and them.',
    'Be ready to tell the class one interesting thing you learned about a group member.'
  ]
};
const RUBRIC_ROWS = [
  {lbl:'Student\'s information was clear.', sub:'Ideas were easy to follow and understand.'},
  {lbl:'Student used vocabulary from the unit.', sub:'Free-time and activity words from Unit 8-9.'},
  {lbl:'Student used subject and object pronouns correctly.', sub:'I/me, he/him, she/her, we/us, they/them.'},
  {lbl:'Student used expressions for agreeing and disagreeing.', sub:'"Me too," "I don\'t either," "I\'m not sure," etc.'},
  {lbl:'Student used reduced words correctly.', sub:'Natural pronunciation of him, her, them.'}
];
const RUBRIC_SCALE = [
  {pts:20, note:'Completely successful, almost every time'},
  {pts:15, note:'Mostly successful, most of the time'},
  {pts:10, note:'Partially successful, some of the time'},
  {pts:0, note:'Not successful'}
];
