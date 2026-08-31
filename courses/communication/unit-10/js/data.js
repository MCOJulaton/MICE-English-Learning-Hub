/* ===================== UNIT 10 CONTENT DATA — ARCHITECTURE: LET'S FIND A NEW APARTMENT =====================
   Architecture Day 1 (Listening Day), paired with real Q: Skills for Success
   Unit 5 recordings (licensed audio, see /assets/audio/comm-unit10/).
   Comprehension questions and practice activities below are ORIGINAL,
   written for this site — not copied from the textbook. Correct answers
   are grounded in the real Teacher's Book answer key so they stay
   accurate to the audio content. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up: A Good Home'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s3', label:"Listening: Let's Find a New Apartment"},
  {key:'s4', label:'Ranking Information'},
  {key:'s5', label:'Listening for Opinions'},
  {key:'s6', label:'Note-Taking: Pros & Cons'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 10, Architecture: Let\'s Find a New Apartment',
  unitCode: 'unit-10'
};

/* ===== Audio tracks (real licensed recordings) ===== */
const AUDIO = {
  qClassroom: '../../../assets/audio/comm-unit10/01-q-classroom.mp3',
  listening1: '../../../assets/audio/comm-unit10/02-listening1-activities.mp3',
  listenSkillEx: '../../../assets/audio/comm-unit10/03-listening-skill-examples.mp3',
  listenSkillAct: '../../../assets/audio/comm-unit10/04-listening-skill-activity.mp3',
  notetaking: '../../../assets/audio/comm-unit10/05-notetaking-skill.mp3'
};

/* ===== Section 1: Warm-Up ===== */
const HOME_WORDS = ['Apartment','House','Mansion','Studio','Dormitory','Condo'];
const QCLASSROOM_MATCH = [
  {student:'Yuna', idea:'A home should be quiet and peaceful.'},
  {student:'Felix', idea:'A home should have modern conveniences.'},
  {student:'Marcus', idea:'A home should be affordable.'},
  {student:'Sophy', idea:'A home should be close to family.'}
];

/* ===== Section 2: Key Vocabulary ===== */
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

/* ===== Section 3: Listening 1 — Let's Find a New Apartment (real audio) ===== */
const APARTMENT_NOTES = ['First Street', 'Beach', 'Downtown'];
const APARTMENT_POINTS = [
  {stmt:'Rent here is one of the cheapest options.', answer:'Beach or Downtown'},
  {stmt:'This apartment is very close to campus.', answer:'First Street'},
  {stmt:'The neighbors seem friendly and nice.', answer:'Beach'},
  {stmt:'This apartment is close to restaurants and shops.', answer:'Downtown'},
  {stmt:'It is near public transportation.', answer:'Beach or Downtown'},
  {stmt:'The rent is expensive here.', answer:'First Street'},
  {stmt:'This apartment can be noisy.', answer:'Downtown'},
  {stmt:'This apartment is far from campus.', answer:'Beach or Downtown'},
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
  {stmt:'All three apartments are within walking distance of campus.', answer:'F', note:'At least one apartment is far from campus.'}
];

/* ===== Section 4: Ranking Information (critical thinking) ===== */
const RANK_FEATURES = [
  'Close to campus', 'Low rent', 'Private bedroom', 'Near public transportation',
  'Quiet neighborhood', 'Friendly neighbors', 'Close to shops and restaurants', 'Modern kitchen'
];

/* ===== Section 5: Listening Skill — Listening for Opinions (real audio) ===== */
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

/* ===== Section 6: Note-Taking Skill — Pros and Cons (real audio) ===== */
const PROSCONS_ROWS = [
  {label:'Likes his roommate', side:'pro'},
  {label:'Likes the people in the dormitory', side:'pro'},
  {label:'Great location', side:'pro'},
  {label:'Not very private', side:'con'},
  {label:'Can be noisy', side:'con'},
  {label:'The room is small', side:'con'}
];
