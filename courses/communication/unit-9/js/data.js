/* ===================== UNIT 9 CONTENT DATA — SOCIOLOGY: AGREE, DISAGREE & DISCUSS =====================
   Sociology Day 2 (Speaking Day) — continues Unit 8, paired with the same
   real Q: Skills for Success Unit 4 recordings (licensed audio, see
   /assets/audio/comm-unit9/). Comprehension questions, grammar practice,
   and speaking prompts below are ORIGINAL, written for this site — not
   copied from the textbook. Correct answers for the "Consider the Ideas"
   checklist are grounded in the real Teacher's Book answer key.

   Redesigned to be practice-heavy with minimal explanation, A1-A2 language
   throughout. The two comprehension checks with a real, objective answer key
   (the reduced-pronoun dialogue and the Consider the Ideas checklist) are no
   longer scattered mid-unit — they're combined into one Listening Quiz at
   the end (Section 6). Section 3's "listen and decide" exchanges stay where
   they are: the real recording has no single correct answer there, so it
   remains an open discussion prompt, not a quiz item. The old free-time
   group discussion assignment is replaced with a pair video speaking task
   on a current, simple trend statement (Section 5) — same target language
   (pronouns, agree/disagree expressions, reduced pronunciation), same real
   Teacher's Book rubric skills, updated to a video-submission format. The
   topic list lives directly in Section 5, right under "How to do it,"
   there is no separate topic-picking section. Students write their own
   script from the topic themselves, the site does not template it for
   them. The rubric criteria are reproduced from the real Teacher's Book
   rubric for the instructor's own grading use, adapted for the video
   format. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s0', label:'Quick Start: Do You Agree?'},
  {key:'s1', label:'Grammar: Subject & Object Pronouns'},
  {key:'s2', label:'Pronunciation: Reduced Pronouns'},
  {key:'s3', label:'Speaking Skill: Agree & Disagree'},
  {key:'s5', label:'Speaking Task: Agree or Disagree'},
  {key:'s6', label:'Listening Quiz'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 9, Sociology: Agree, Disagree & Discuss',
  unitCode: 'unit-9'
};

/* ===== Assets ===== */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/comm-u9-hero.jpg', alt:'Two students smiling at each other, one holding a green AGREE card, the other holding an orange DISAGREE card' }
};

/* ===== Lesson Objectives (ADDIE Design: state objectives before instruction) =====
   Shown on the cover and repeated briefly at the top of Section 1, so the
   lesson opens with a clear "what you will be able to do," not straight
   into a grammar table. Ordered to match the unit's actual Bloom's arc:
   Remember/Understand pronouns (S1-S2) -> Understand/Apply agree-disagree
   language (S3) -> Analyze/Evaluate an opinion (S4) -> Create a real,
   graded spoken output (S5) -> Remember/Understand review quiz (S6). */
const LESSON_OBJECTIVES = [
  'Use subject and object pronouns correctly (I/me, he/him, she/her, we/us, they/them).',
  'Agree or disagree politely in a conversation.',
  'Share your opinion about a trend and give one simple reason, in a real graded video.'
];

/* ===== Section 0: Quick Start — Do You Agree? =====
   A true topic intro, not an explanation: students just react to a few
   simple, everyday opinions before any teaching happens. This introduces
   "agreeing and disagreeing" as a real thing people do, in Section 1 (not
   buried later in Section 3), and gives the lesson a genuine hook (ADDIE
   Design / Gagné "gain attention") before the grammar starts. Ungraded on
   purpose — there is no right answer, only a reaction. */
const QUICK_START_STATEMENTS = [
  'Coffee is better than tea.',
  'Weekends should be three days long.',
  'It is better to study at night than in the morning.'
];

/* ===== Audio tracks (real licensed recordings) ===== */
const AUDIO = {
  pronExamples: '../../../assets/audio/comm-unit9/04-pronunciation-examples.mp3',
  pronActivity: '../../../assets/audio/comm-unit9/05-pronunciation-activity.mp3',
  speakExamples: '../../../assets/audio/comm-unit9/06-speaking-skill-examples.mp3',
  speakActivity: '../../../assets/audio/comm-unit9/07-speaking-skill-activity.mp3',
  considerIdeas: '../../../assets/audio/comm-unit9/08-consider-the-ideas.mp3'
};

/* ===== Section 1: Grammar — Subject and Object Pronouns =====
   Opens with a short "why this matters" hook (ADDIE Design: connect the
   grammar point to the unit's real communicative function before drilling
   forms) — people constantly use pronouns while agreeing or disagreeing. */
const PRONOUN_HOOK = {
  line1: 'A: I really don\'t like fast food.',
  line2: 'B: I don\'t either! It has too much sugar.',
  note: 'Did you see it? "I" is a subject pronoun. You will need pronouns like this all lesson, so let\'s learn them first.'
};
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
  'In fast speech, he, him, her, and them often lose their first sound.',
  'This does not happen at the start of a sentence.'
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

/* ===== Section 5: Speaking Task — Agree or Disagree (graded, real video) =====
   Replaces the old "Have a Group Discussion" assignment (free-time
   activities) with a real, graded pair video speaking task. The topics
   below are given right on this same section, right under "How to do
   it" — there is no separate topic-picking page. Students write their
   own script from the topic themselves, off-screen; the site only gives
   the situation, not a script template. Same target language (pronouns,
   agree/disagree expressions, reduced pronunciation), same real Teacher's
   Book rubric skills, updated for a pair-video format instead of a group
   discussion. This is its own graded speaking task, not the site's other
   "Unit Assignment." */
const TREND_STATEMENTS = [
  {id:'ai', text:'Everyone should learn how to use AI.'},
  {id:'socialmedia', text:'Social media is good for teenagers.'},
  {id:'online', text:'Online classes are better than classroom classes.'},
  {id:'phones', text:'Students should use their phones in class.'},
  {id:'kpop', text:'K-pop is the best music right now.'},
  {id:'fastfood', text:'Fast food is bad for your health.'},
  {id:'workhome', text:'Working from home is better than going to the office.'},
  {id:'shortvideo', text:'Short videos, like TikTok, are better than long videos.'}
];
const ASSIGNMENT = {
  title: 'Speaking Task: Agree or Disagree',
  prompt: 'Record a short video with your seatmate about a topic below.',
  steps: [
    'Sit with your seatmate.',
    'Choose one topic from the list below.',
    'Write a short script together: one of you agrees, the other disagrees.',
    'Use pronouns correctly: I, you, he, she, we, they, and me, him, her, us, them.',
    'Use an agree or disagree phrase from Section 4.',
    'Give one simple reason for your opinion.',
    'Practice your script 1-2 times before recording.',
    'Record your conversation on video. 30 to 60 seconds is enough.',
    'Send the video to your teacher.'
  ]
};
const RUBRIC_ROWS = [
  {lbl:'Student gave a clear opinion.', sub:'It was clear if the student agreed or disagreed.'},
  {lbl:'Student used subject and object pronouns correctly.', sub:'I/me, he/him, she/her, we/us, they/them.'},
  {lbl:'Student used an expression for agreeing or disagreeing.', sub:'"Me too," "I don\'t either," "I\'m not sure," etc.'},
  {lbl:'Student gave one simple, clear reason.', sub:'A short, understandable reason for their opinion.'},
  {lbl:'Student used reduced words correctly.', sub:'Natural pronunciation of him, her, them.'}
];
const RUBRIC_SCALE = [
  {pts:20, note:'Completely successful, almost every time'},
  {pts:15, note:'Mostly successful, most of the time'},
  {pts:10, note:'Partially successful, some of the time'},
  {pts:0, note:'Not successful'}
];
