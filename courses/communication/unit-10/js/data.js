/* ===================== UNIT 10 CONTENT DATA — ARCHITECTURE: LET'S FIND A NEW APARTMENT =====================
   Architecture Day 1 (Listening Day), paired with real Q: Skills for Success
   Unit 5 recordings (licensed audio, see /assets/audio/comm-unit10/).
   Comprehension questions and practice activities below are ORIGINAL,
   written for this site — not copied from the textbook. Correct answers
   are grounded in the real Teacher's Book answer key so they stay
   accurate to the audio content.

   RESTRUCTURED for a 120-minute accessible class (see teacher.html for
   the full timed lesson plan, the Kahoot review bank, and gesture/TPR
   notes). Same topic, same vocabulary, same three apartments, same
   audio as before -- reorganized so students can participate by
   pointing, choosing, and matching before being asked to speak or
   write independently. Two brand-new pieces are added here, and both
   are built from facts already established elsewhere in this file,
   nothing about the audio is invented:
     - APARTMENT_FACTS / DETECTIVE_QUESTIONS (Section 3): a GIVEN
       reference table (campus distance + rent only) for a pre-listening
       pair task, so weaker students compare real facts before they have
       to extract anything from audio.
     - DECISION_REASONS (Section 7): reuses the SAME feature words
       already taught in Section 1's warm-up and Section 4's detective
       table, so the final decision task recombines known vocabulary
       rather than introducing new claims about the recording. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s3', label:'Apartment Detective'},
  {key:'s4', label:'Guided Listening'},
  {key:'s5', label:'Stand Up & Vote'},
  {key:'s6', label:'Opinions & Pros/Cons'},
  {key:'s7', label:'Group Decision'},
  {key:'s8', label:'Share Your Choice'},
  {key:'s9', label:'Exit Ticket'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 10, Architecture: Let\'s Find a New Apartment',
  unitCode: 'unit-10'
};

/* ===== Audio tracks (real licensed recordings, unchanged) ===== */
const AUDIO = {
  qClassroom: '../../../assets/audio/comm-unit10/01-q-classroom.mp3',
  listening1: '../../../assets/audio/comm-unit10/02-listening1-activities.mp3',
  listenSkillEx: '../../../assets/audio/comm-unit10/03-listening-skill-examples.mp3',
  listenSkillAct: '../../../assets/audio/comm-unit10/04-listening-skill-activity.mp3',
  notetaking: '../../../assets/audio/comm-unit10/05-notetaking-skill.mp3'
};

/* ===== Section 1: Warm-Up =====
   Point-and-choose FIRST (contrast pairs, then home-type words), real
   listening comes last and is framed as a bonus extension -- nothing
   in this section requires independent speech. */
const CONTRAST_PAIRS = [
  {id:'quiet-noisy', a:{img:'../../../assets/images/comm-unit10/quiet.jpg', lbl:'Quiet'}, b:{img:'../../../assets/images/comm-unit10/noisy.jpg', lbl:'Noisy'}},
  {id:'cheap-expensive', a:{img:'../../../assets/images/comm-unit10/cheap.jpg', lbl:'Cheap'}, b:{img:'../../../assets/images/comm-unit10/expensive.jpg', lbl:'Expensive'}},
  {id:'near-far', a:{img:'../../../assets/images/comm-unit10/near.jpg', lbl:'Near Campus'}, b:{img:'../../../assets/images/comm-unit10/far.jpg', lbl:'Far From Campus'}}
];
const HOME_WORDS = ['Apartment','House','Mansion','Studio','Dormitory','Condo'];
const QCLASSROOM_MATCH = [
  {student:'Yuna', idea:'A home should be quiet and peaceful.'},
  {student:'Felix', idea:'A home should have modern conveniences.'},
  {student:'Marcus', idea:'A home should be affordable.'},
  {student:'Sophy', idea:'A home should be close to family.'}
];

/* ===== Section 2: Key Vocabulary (unchanged content; see teacher.html
   for the gesture/TPR cue that goes with each word) ===== */
const VOCAB = [
  {id:'comfortable', ic:'🛋️', nm:'Comfortable', type:'adj.', def:'Making you feel physically relaxed and at ease.', ex:'This sofa is very comfortable.'},
  {id:'location', ic:'📍', nm:'Location', type:'n.', def:'The place where something is.', ex:'The location of the apartment is close to campus.'},
  {id:'noisy', ic:'🔊', nm:'Noisy', type:'adj.', def:'Making a lot of loud sound.', ex:'The street outside is very noisy at night.'},
  {id:'private', ic:'🔒', nm:'Private', type:'adj.', def:'Belonging to one person, not shared with others.', ex:'I want a private bedroom, not a shared one.'},
  {id:'rent', ic:'💵', nm:'Rent', type:'n./v.', def:'Money you pay regularly to live in a place you do not own.', ex:'The rent for this apartment is 4,000 baht a month.'},
  {id:'roommate', ic:'🧑‍🤝‍🧑', nm:'Roommate', type:'n.', def:'A person you share a room or home with.', ex:'My roommate and I split the rent equally.'},
  {id:'problem', ic:'⚠️', nm:'Problem', type:'n.', def:'A situation that causes difficulty.', ex:'The biggest problem with this apartment is the noise.'},
  {id:'public transportation', ic:'🚌', nm:'Public Transportation', type:'n.', def:'Buses, trains, and other transportation anyone can use.', ex:'The apartment is near public transportation.'}
];
const VOCAB_FILL = [
  {sentence:'I need a ___ bedroom because I don\'t like sharing.', answer:'private'},
  {sentence:'The ___ for this apartment is too expensive for me.', answer:'rent'},
  {sentence:'My new bed is so ___, I never want to get up.', answer:'comfortable'},
  {sentence:'This neighborhood has a great ___, close to everything.', answer:'location'},
  {sentence:'The main ___ with this apartment is the small kitchen.', answer:'problem'},
  {sentence:'It is hard to sleep here because the street is so ___.', answer:'noisy'},
  {sentence:'I found a ___ to share rent with in the dormitory.', answer:'roommate'},
  {sentence:'This apartment is close to ___, so I don\'t need a car.', answer:'public transportation'}
];

/* ===== Section 3: Apartment Detective — Pair Task (NEW) =====
   Pre-listening. Facts are GIVEN directly in a table, not hidden in
   audio -- this is a reading/discussion/matching task for pairs, built
   entirely from the two clearest, most certain facts already in the
   Teacher's Book answer key (campus distance and rent). Section 4's
   listening then covers everything else, so nothing is spoiled. */
const APARTMENT_FACTS = [
  {feature:'Distance to campus', ic:'📍', firstStreet:'Close (walking distance)', beach:'Far', downtown:'Far'},
  {feature:'Rent', ic:'💵', firstStreet:'Expensive', beach:'Cheap', downtown:'Cheap'}
];
const DETECTIVE_QUESTIONS = [
  {q:'Which apartment is closest to campus?', opts:['First Street','Beach','Downtown'], answer:'First Street'},
  {q:'Which apartment has expensive rent?', opts:['First Street','Beach','Downtown'], answer:'First Street'},
  {q:'Which apartments have cheap rent?', opts:['First Street','Beach','Beach and Downtown'], answer:'Beach and Downtown'}
];
const DETECTIVE_FRAME = 'I think ___ is good for rent because it is ___.';

/* ===== Section 4: Guided Listening — Let's Find a New Apartment (real audio) =====
   Two listens, as requested: Listen 1 is one simple multiple-choice
   question (Karen's overall favorite). Listen 2 is the detail-matching
   task -- trimmed to the facts NOT already given in Section 3, so the
   two sections don't overlap, plus a partner-check step before the
   True/False answer check. */
const LISTEN1_QUESTION = {
  q:'Listen one time. Which apartment is Karen\'s favorite?',
  opts:['First Street','Beach','Downtown'],
  answer:'Beach'
};
const APARTMENT_NOTES = ['First Street', 'Beach', 'Downtown'];
const APARTMENT_POINTS = [
  {stmt:'The neighbors seem friendly and nice.', answer:'Beach'},
  {stmt:'This apartment is close to restaurants and shops.', answer:'Downtown'},
  {stmt:'It is near public transportation.', answer:'Beach or Downtown'},
  {stmt:'This apartment can be noisy.', answer:'Downtown'},
  {stmt:'The bedrooms here are not private.', answer:'Beach'},
  {stmt:'The bathroom is very small.', answer:'First Street'}
];
const APARTMENT_TF = [
  {stmt:'Karen and her friend are looking for a new apartment together.', answer:'T'},
  {stmt:'Karen\'s favorite apartment of the three is the one downtown.', answer:'F', note:'Karen\'s favorite is actually the apartment near the beach.'},
  {stmt:'The apartment near the beach does not have private bedrooms.', answer:'T'},
  {stmt:'The apartment downtown has large, spacious bedrooms.', answer:'F', note:'The apartment downtown actually has small bedrooms.'},
  {stmt:'The First Street apartment has three bedrooms and three bathrooms.', answer:'F', note:'It actually has three bedrooms but only one bathroom.'},
  {stmt:'Rent is a concern for at least one of the three apartments.', answer:'T'},
  {stmt:'All three apartments are within walking distance of campus.', answer:'F', note:'Only First Street is within walking distance; Beach and Downtown are far.'}
];

/* ===== Section 5: Stand Up & Vote (NEW, break/movement activity) =====
   Primary mode is physical (see teacher.html for the "walk to a corner
   of the room" version). This on-screen version is the seated/online
   alternative -- a single low-stakes vote per feature, nothing graded. */
const VOTE_FEATURES = [
  {ic:'🤫', lbl:'Quiet'},
  {ic:'💵', lbl:'Cheap'},
  {ic:'📍', lbl:'Near Campus'},
  {ic:'🍳', lbl:'Modern Kitchen'},
  {ic:'🧑‍🤝‍🧑', lbl:'Friendly Neighbors'}
];

/* ===== Section 6: Opinions & Pros/Cons (real audio, combined + shortened steps) =====
   Step A reuses the old Section 5 (Listening for Opinions) and Step B
   reuses the old Section 6 (Note-Taking: Pros & Cons) -- same audio,
   same facts, broken into shorter labeled steps with a "compare with a
   partner first" prompt before each answer check, per the lesson plan. */
const OPINION_TIP = [
  'Speakers often signal an opinion with "I think (that)..."',
  'Opinion verbs like like, love, and hate show how someone feels.',
  'Opinion adjectives like cheap, expensive, beautiful, and ugly are judgments, not facts.',
  'The word only can also signal a value judgment ("It only has one bathroom.").'
];
const OPINION_CONVOS = [
  {names:'Rob and Sam', opts:['They like the location.','They think the rent is good.','They dislike the neighbors.','They think the apartment is too small.'], correct:[0,1]},
  {names:'Mary', opts:["Mary doesn't like taking the bus.","Mary loves her new apartment.","Mary doesn't like her neighbors.","Mary thinks the rent is too high."], correct:[0,2]},
  {names:'Matt and James', opts:['Matt likes James\'s new house.',"James thinks there aren't a lot of bedrooms.",'Matt dislikes the new house.','James loves the small kitchen.'], correct:[0,1]},
  {names:'Kate and Mika', opts:["Kate doesn't like the living room in her new apartment.",'Mika thinks the apartment is in a good location.','Kate loves her new kitchen.','Mika dislikes the location.'], correct:[0,1]}
];
const PROSCONS_ROWS = [
  {label:'Likes his roommate', side:'pro'},
  {label:'Likes the people in the dormitory', side:'pro'},
  {label:'Great location', side:'pro'},
  {label:'Not very private', side:'con'},
  {label:'Can be noisy', side:'con'},
  {label:'The room is small', side:'con'}
];

/* ===== Section 7: Group Decision Task (NEW) =====
   Reasons reuse the SAME words already taught in Section 1 (contrasts)
   and Section 3/4 (apartment facts) -- no new claims about the
   recording, just recombining known vocabulary into a decision. */
const DECISION_REASONS = ['cheap rent','close to campus','quiet','friendly neighbors','near shops','private bedroom'];
const DECISION_FRAME = 'We choose ___ because it is ___.';

/* ===== Section 9: Exit Ticket (NEW) ===== */
const EXIT_PROMPT = 'A good home is ___.';
