/* ===================== UNIT 8 CONTENT DATA — SOCIOLOGY: FREE-TIME ACTIVITIES =====================
   Paired with real Q: Skills for Success (3rd Ed., Listening & Speaking Intro)
   recordings for Unit 4 "Sociology" (licensed audio, used with the instructor's
   own course materials — see /assets/audio/comm-unit8/). Comprehension questions,
   vocabulary explanations, and practice activities below are ORIGINAL, written
   for this site — not copied from the textbook. Correct answers are grounded in
   the real Teacher's Book answer key so they stay accurate to the audio content.
   Architecture and component library carried over from Unit 7 (SECTION_META/
   RENDERERS router, VoiceEngine, big-choice-grid, etc.) plus a new AudioPlayer
   module in app.js for the real MP3 tracks (first unit on the site to use one). */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up: What Do You Enjoy?'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s3', label:'Note-Taking Skill'},
  {key:'s4', label:'Listening: Free-Time Activities'},
  {key:'s5', label:'Listening for Reasons'},
  {key:'s6', label:'Noticing Differences'},
  {key:'s7', label:'Collocations: do / play / go'},
  {key:'s8', label:'Free-Time Activity Hunt'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 8, Sociology: Free-Time Activities',
  unitCode: 'unit-8'
};

/* ===== Audio tracks (real licensed recordings) ===== */
const AUDIO = {
  qClassroom: '../../../assets/audio/comm-unit8/01-q-classroom.mp3',
  notetaking: '../../../assets/audio/comm-unit8/02-notetaking-skill.mp3',
  listening: '../../../assets/audio/comm-unit8/03-listening-activities.mp3'
};

/* ===== Section 1: Warm-Up ===== */
const WARMUP_QUESTIONS = [
  'What do you like to do in your free time?',
  'Do you like activities you do alone, or activities with other people?',
  'Is there an activity you have done since you were a child?'
];
const WARMUP_PHOTO_PROMPT = 'Look at your classmates. Point to someone. Guess one thing they enjoy doing in their free time.';

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'modern', ic:'🏙️', nm:'Modern', type:'adj.', def:'New and up to date, not old-fashioned.', ex:'That is a very modern shopping mall.', img:'../../../assets/images/comm-unit8-vocab/modern.jpg'},
  {id:'outdoors', ic:'🌳', nm:'Outdoors', type:'adv.', def:'Outside, not inside a building.', ex:'I love spending my free time outdoors.', img:'../../../assets/images/comm-unit8-vocab/outdoors.jpg'},
  {id:'crowded', ic:'👥', nm:'Crowded', type:'adj.', def:'Full of many people.', ex:'The night market gets very crowded on weekends.', img:'../../../assets/images/comm-unit8-vocab/crowded.jpg'},
  {id:'provide', ic:'🎁', nm:'Provide', type:'v.', def:'To give someone something they need.', ex:'The park provides free bikes for visitors.', img:'../../../assets/images/comm-unit8-vocab/provide.jpg'},
  {id:'nature', ic:'🍃', nm:'Nature', type:'n.', def:'The outdoor world of plants, animals, and land, away from cities.', ex:'She feels calm whenever she is close to nature.', img:'../../../assets/images/comm-unit8-vocab/nature.jpg'},
  {id:'scene', ic:'🎭', nm:'Scene', type:'n.', def:'The general feeling or atmosphere of a place.', ex:'The coffee shop has a relaxing scene in the evening.', img:'../../../assets/images/comm-unit8-vocab/scene.jpg'},
  {id:'relaxing', ic:'😌', nm:'Relaxing', type:'adj.', def:'Making you feel calm, not stressed.', ex:'Reading before bed is relaxing for me.', img:'../../../assets/images/comm-unit8-vocab/relaxing.jpg'},
  {id:'tradition', ic:'🎎', nm:'Tradition', type:'n.', def:'Something people have done for a long time and still do.', ex:'Playing cards with family on weekends is a tradition in her house.', img:'../../../assets/images/comm-unit8-vocab/tradition.jpg'}
];
const VOCAB_FILL = [
  {sentence:'On Sunday, our house is always ___ with cousins and aunts and uncles.', answer:'crowded'},
  {sentence:'I like phones that are simple, not the newest, most ___ model.', answer:'modern'},
  {sentence:'Walking in the mountains puts me close to ___.', answer:'nature'},
  {sentence:'A hot bath after a long day is very ___.', answer:'relaxing'},
  {sentence:'The gym ___ free towels for every member.', answer:'provide'},
  {sentence:'Every August, my family visits our grandparents. It is a family ___.', answer:'tradition'},
  {sentence:'I would rather sit ___ than stay inside all day.', answer:'outdoors'},
  {sentence:'This cafe has a quiet, friendly ___ in the morning.', answer:'scene'}
];

/* ===== Section 3: Note-Taking Skill (real audio: notetaking) ===== */
const NOTETAKING_TIP = [
  'Speakers often give a reason for what they do.',
  'Listen for the clue words why, because, and since.',
  'Write only the key words for the reason, not the whole sentence.'
];
const NOTETAKING_ROWS = [
  {activity:'goes to the mall on Saturday', answer:'to buy clothes'},
  {activity:'eats at the food court after class', answer:'because the food is delicious'},
  {activity:'sits at a coffee shop most afternoons', answer:'to meet friends'},
  {activity:'sits on a bench near the entrance', answer:'to watch people walk by'},
  {activity:'visits three or four clothing stores in one trip', answer:'to buy clothes'},
  {activity:'calls a friend before going out', answer:'to meet friends for coffee'}
];

/* ===== Section 4: Listening: Free-Time Activities (real audio: listening) ===== */
const LISTEN_TF = [
  {stmt:'The speakers agree that free-time activities have not changed at all in recent years.', answer:'F', note:'Not true. The discussion notes a change: board games have become more popular.'},
  {stmt:'One clear point in the discussion is that sales of board games have gone up.', answer:'T', note:'Correct. The speakers mention that board game sales have increased.'},
  {stmt:'The speakers give the exact number of board games sold last year.', answer:'N', note:'Not enough information. A general increase is mentioned, not an exact number.'},
  {stmt:'Every speaker in the discussion says they dislike board games.', answer:'F', note:'Not true. At least one speaker explains a personal reason for enjoying them.'},
  {stmt:'A speaker named Gia says the main reason she likes board games is that she wants to win.', answer:'F', note:'Not quite. Gia\'s reason is closer to relaxing and spending time with people, not winning.'}
];
const LISTEN_MC = [
  {q:'What are the people in the discussion mainly talking about?', opts:['A new restaurant','Free-time activities','A school assignment','A trip they are planning'], correct:1},
  {q:'What change in free-time activities does the discussion mention?', opts:['Fewer people play sports','More people are traveling','Board games have become more popular','People are reading less'], correct:2},
  {q:'What reason is given for enjoying an activity in person, with other people?', opts:['It feels more social','It is cheaper online','It takes less time','It requires no planning'], correct:0},
  {q:'Which word best describes how one speaker feels about their free-time activity?', opts:['Boring','Relaxing','Stressful','Expensive'], correct:1},
  {q:'What does one speaker say people should NOT focus too much on during the activity?', opts:['The rules','Winning','The time','The score sheet'], correct:1},
  {q:'Overall, what feeling do the speakers connect most with their free-time activity?', opts:['Excitement','Relaxation','Competition','Confusion'], correct:1}
];

/* ===== Section 5: Listening for Reasons (same audio, listen again) ===== */
const REASONS_CHART = [
  {q:'Why has interest in board games gone up recently, according to the discussion?', answer:'People enjoy doing it in person, together.'},
  {q:'Why does one speaker say the activity is good for spending time with people?', answer:'It brings family and friends together.'},
  {q:'Why does a speaker call the activity relaxing?', answer:'It is cheap and calm, a break from a busy day.'},
  {q:'What does a speaker say the activity makes you do?', answer:'It makes you think.'},
  {q:'What does a speaker warn people not to worry about too much?', answer:'Winning too much, or focusing only on winning.'},
  {q:'What overall feeling do most speakers connect with the activity?', answer:'A relaxing feeling.'}
];

/* ===== Section 6: Noticing Differences (critical thinking) ===== */
const CONTRAST_TIP = [
  'Speakers show a difference using words like but, while, and however.',
  'Listen for these words. They often signal two people feel differently, or one thing is unlike another.'
];
const CONTRAST_ITEMS = [
  {sentence:'Mai loves playing video games alone, ___ her brother prefers playing board games with the whole family.', answer:'while'},
  {sentence:'Board games can be relaxing, ___ some people still get too competitive.', answer:'but'},
  {sentence:'I enjoy quiet activities like reading; my roommate, ___, loves loud, crowded events.', answer:'however'},
  {sentence:'She likes activities outdoors, ___ he prefers staying inside.', answer:'while'}
];

/* ===== Section 7: Building Vocabulary — Collocations with do / play / go ===== */
const COLLOCATIONS = {
  do: ['aerobics', 'crosswords', 'gymnastics', 'judo', 'nothing'],
  play: ['baseball', 'chess', 'soccer', 'tennis', 'video games'],
  go: ['hiking', 'jogging', 'shopping', 'skiing', 'swimming']
};
const COLLOC_FILL = [
  {sentence:'On weekends, I usually ___ shopping with my sister.', answer:'go'},
  {sentence:'My father likes to ___ crosswords every morning with his coffee.', answer:'do'},
  {sentence:'We ___ soccer every Friday after class.', answer:'play'},
  {sentence:'She wants to ___ hiking in the mountains next month.', answer:'go'},
  {sentence:'On rainy days, I usually ___ nothing and just relax at home.', answer:'do'},
  {sentence:'They ___ chess online almost every night.', answer:'play'}
];
const COLLOC_PERSONAL = [
  'What is one thing you do in your free time?',
  'What is one thing you play, or would like to play?',
  'What is one place you go, or would like to go?'
];

/* ===== Section 8: Free-Time Activity Hunt (classroom application task) =====
   The one speaking/application activity for this unit -- built to be a
   worksheet, not a graded quiz. Students find 4 classmates, ask about their
   free-time activity and the reason for it, sort the 4 activities into
   indoor/outdoor, then give a short spoken report using their own notes.
   No "correct answer" exists here (the data is real, self-reported
   information from classmates), so this section intentionally never uses
   the .reveal-btn/.model-answer pattern -- the two model reports below are
   always-visible examples, not answers to unlock. */
const HUNT_ACTIVITY_EXAMPLES = [
  'watch movies', 'play games', 'listen to music', 'go shopping', 'play sports', 'spend time with friends'
];
const HUNT_REASON_BANK = {
  "It's...": ['fun.', 'relaxing.', 'interesting.', 'exciting.'],
  'I can...': ['spend time with friends.', 'relax.', 'learn something new.', 'enjoy myself.']
};
const HUNT_INDOOR_OUTDOOR_EXAMPLES = {
  indoor: ['watch movies', 'play games', 'listen to music'],
  outdoor: ['play sports', 'go hiking', 'go swimming']
};
const HUNT_MODEL_REPORT_LONG = "I talked to four classmates. May likes watching movies because it is relaxing. Bank likes playing games because it is fun. Fon likes listening to music because it is interesting. Jane likes shopping because she likes spending time with friends. I prefer outdoor activities because I like sports.";
const HUNT_MODEL_REPORT_SHORT = "I talked to four classmates. May likes watching movies. Bank likes playing games. Fon likes music. Jane likes shopping. I prefer outdoor activities.";
