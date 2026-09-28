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
  {key:'s1', label:'Grammar: Agree or Disagree in a Sentence'},
  {key:'s2', label:"Let's Discuss It"},
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
  note: 'Notice how B agreed there, and used a pronoun to do it. That is exactly what you are about to practice: agreeing or disagreeing, in a full, correct sentence.'
};
/* ===== Sentence practice: build an agree/disagree sentence with the right pronoun =====
   Replaces the old standalone pronoun drills (circle-the-pronoun, replace-the-noun),
   which had no connection to the rest of the unit. Every item here is a statement
   plus two full-sentence replies, same pronoun, only the case changes, so this is
   the exact grammar point (subject vs object pronouns) practiced inside the unit's
   real skill: reacting to a statement. Deliberately mixes agree and disagree, and
   varies the opening phrase each time ("That's true," "I don't think so," "Not
   really," and so on) instead of repeating plain "I agree" / "I disagree" ten
   times, so students see there are many natural ways to react, before Section 4
   teaches the specific set phrases. First 5 test the subject slot (before the
   verb), next 5 test the object slot (after the verb or a preposition), covering
   I/me, he/him, she/her, we/us, they/them once each, in order, in both halves. */
const PRONOUN_SENTENCE_PRACTICE = [
  {statement:'Coffee is better than tea.', a:'I think so too. I drink it every morning.', b:'I think so too. Me drink it every morning.', correct:'a'},
  {statement:'Anan is a hardworking student.', a:'That\'s true. Him studies every day.', b:'That\'s true. He studies every day.', correct:'b'},
  {statement:'Nok is a talented singer.', a:'Yes, that\'s right. She has a beautiful voice.', b:'Yes, that\'s right. Her has a beautiful voice.', correct:'a'},
  {statement:'Working alone is better than group work.', a:'I don\'t think so. Us learn more from working together.', b:'I don\'t think so. We learn more from working together.', correct:'b'},
  {statement:'Somchai and Pim are good dancers.', a:'I agree. They practice every weekend.', b:'I agree. Them practice every weekend.', correct:'a'},
  {statement:'Fast food is good for you.', a:'I disagree. Doctors always warn I about it.', b:'I disagree. Doctors always warn me about it.', correct:'b'},
  {statement:'Teachers should give more homework.', a:'I don\'t agree. Teachers shouldn\'t give we more work.', b:'I don\'t agree. Teachers shouldn\'t give us more work.', correct:'b'},
  {statement:'Somchai is a great football player.', a:'Definitely. Everyone respects him.', b:'Definitely. Everyone respects he.', correct:'a'},
  {statement:'My classmates are unfriendly.', a:'Not really. I enjoy talking to they.', b:'Not really. I enjoy talking to them.', correct:'b'},
  {statement:'Nok is difficult to work with.', a:'I don\'t think that\'s true. Everyone likes her.', b:'I don\'t think that\'s true. Everyone likes she.', correct:'a'}
];

/* ===== Section 2, main activity: Let's Discuss It =====
   A real discussion, not a quiz: a statement, students decide agree or disagree
   with a partner and say why out loud, in a full sentence, using what Section 1
   just built. No on-screen right answer, this is spoken practice, one step
   closer to the real graded video in Section 4. A model sentence appears after
   they click, for comparison, not correction. */
const DISCUSS_STATEMENTS = [
  {id:'uniform', text:'Students should wear school uniforms.', model:'"I disagree. It doesn\'t let students express themselves."'},
  {id:'translator', text:'It is okay to use a translator app during an English test.', model:'"I disagree. It doesn\'t help us learn the language."'},
  {id:'cook', text:'Everyone should learn how to cook.', model:'"I agree. It is a useful skill for everyone."'},
  {id:'city', text:'Living in a big city is better than living in a small town.', model:'"I agree. It has more jobs and more things to do."'},
  {id:'reading', text:'Reading books is more useful than watching videos.', model:'"I disagree. Videos can teach us just as much."'}
];

/* ===== Section 2, bonus activity: Pronunciation — Reduced Pronouns (real audio) =====
   Demoted to optional practice, not required to move on. Kept because Section 6's
   Listening Quiz, Part A, reuses this exact same dialogue with blanks. */
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

/* ===== Section 3: Speaking Skill — Agreeing and Disagreeing =====
   Each phrase has a real generated audio file (British female voice, not
   browser text-to-speech, which sounded robotic on many devices) instead of
   a live speak() call. */
const AGREE_PHRASES = [
  {type:'Agreeing', ex:'I do too.', audio:'../../../assets/audio/comm-unit9/phrase-i-do-too.mp3'},
  {type:'Agreeing', ex:'Me too.', audio:'../../../assets/audio/comm-unit9/phrase-me-too.mp3'},
  {type:'Agreeing', ex:"I don't either.", audio:'../../../assets/audio/comm-unit9/phrase-i-dont-either.mp3'},
  {type:'Agreeing', ex:'Me neither.', audio:'../../../assets/audio/comm-unit9/phrase-me-neither.mp3'},
  {type:'Disagreeing (politely)', ex:"Oh, I don't know.", audio:'../../../assets/audio/comm-unit9/phrase-oh-i-dont-know.mp3'},
  {type:'Disagreeing (politely)', ex:"I'm not sure about that.", audio:'../../../assets/audio/comm-unit9/phrase-not-sure.mp3'}
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
/* ===== Model dialogue for the Speaking Task =====
   A worked example, shown before students write their own script, so they see
   the format once (short back-and-forth, correct pronouns, a phrase from
   Section 4, one simple reason) instead of guessing what "a script" means.
   Deliberately uses a topic from Section 1's warm-up, not one of the 8 real
   graded topics below, so it never doubles as a ready-made answer. */
const MODEL_DIALOGUE = {
  topic: 'Weekends should be three days long.',
  lines: [
    'A: I think weekends should be three days long.',
    'B: Oh, I don\'t know. I think two days is enough.',
    'A: Really? It would give us more time to relax.',
    'B: I\'m not sure about that. A longer weekend might just mean more homework for us.',
    'A: Maybe, but I still think it\'s better for me. I need more rest.',
    'B: I understand. I just prefer things stay the same.'
  ]
};
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
