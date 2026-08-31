/* ===================== UNIT 11 CONTENT DATA — ARCHITECTURE: DESIGN A HOME =====================
   Architecture Day 2, paired with real Q: Skills for Success Unit 5
   recordings (licensed audio, see /assets/audio/comm-unit11/).
   Comprehension questions, grammar/vocabulary practice, and the
   assignment brief below are ORIGINAL, written for this site — not
   copied from the textbook. Correct answers are grounded in the real
   Teacher's Book answer key. The Unit Assignment rubric criteria are
   reproduced from the real Teacher's Book rubric for the instructor's
   own grading use. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Listening 2: Housing Problems'},
  {key:'s2', label:'Building Vocabulary: Compound Nouns'},
  {key:'s3', label:'Pronunciation: Stress in Compound Nouns'},
  {key:'s4', label:'Grammar: Prepositions of Location'},
  {key:'s5', label:'Consider the Ideas'},
  {key:'s6', label:'Unit Assignment & Rubric'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 11, Architecture: Design a Home',
  unitCode: 'unit-11'
};

/* ===== Audio tracks (real licensed recordings) ===== */
const AUDIO = {
  listening2: '../../../assets/audio/comm-unit11/06-listening2-activities.mp3',
  pronExamples: '../../../assets/audio/comm-unit11/07-pronunciation-examples.mp3',
  pronActivity: '../../../assets/audio/comm-unit11/08-pronunciation-activity.mp3',
  considerIdeas: '../../../assets/audio/comm-unit11/09-consider-the-ideas.mp3'
};

/* ===== Section 1: Listening 2 — Housing Problems, Housing Solutions (real audio) ===== */
const HOUSING_CHOICES = [
  {id:'downtown', label:'Cheap apartments downtown', mentioned:true},
  {id:'friends', label:'A house shared with many friends', mentioned:true},
  {id:'newdorm', label:'A brand-new dormitory on campus', mentioned:false},
  {id:'suburb', label:'A house in the suburbs, far from campus', mentioned:false},
  {id:'family', label:'Living at home with family', mentioned:true}
];
const HOUSING_PROSCONS = {
  downtown: {label:'Cheap apartments downtown', pros:['Inexpensive','Near public transportation, restaurants, and shops'], cons:['Small','Can feel unsafe at night','Old buildings, not in great condition']},
  friends: {label:'A house shared with many friends', pros:['Close to campus','Feels safe'], cons:['Expensive','Very crowded and noisy','Hard to study or sleep']},
  family: {label:'Living at home with family', pros:['Safe','No rent to pay'], cons:['Not possible for many students, since their families live far away']}
};
const HOUSING_TF = [
  {stmt:'The new campus being discussed is very large.', answer:'F', note:'Actually, the new campus is small.'},
  {stmt:'The town meeting is about a shortage of student housing.', answer:'T'},
  {stmt:'Downtown apartments are one option discussed at the meeting.', answer:'T'},
  {stmt:'Sharing a house with friends is more expensive than downtown apartments.', answer:'T'},
  {stmt:'Safety is a concern for at least one of the housing options.', answer:'T'},
  {stmt:'Every student at the meeting can live with their families.', answer:'F', note:'Actually, only some students can live with their families — others live too far away.'},
  {stmt:'Rent for downtown apartments is described as increasing.', answer:'T'},
  {stmt:'The city does not want the university to grow.', answer:'F', note:'Actually, the city does want the university to grow.'}
];

/* ===== Section 2: Building Vocabulary — Compound Nouns ===== */
const COMPOUND_TIP = [
  'A compound noun is made of two words that create one meaning.',
  'Some are written as one word (bathtub, backyard).',
  'Some are written as two words (shopping mall, police officer).'
];
const COMPOUND_SPOT = [
  'We keep our bicycles in the driveway.',
  'The new dormitory has three bedrooms and two bathrooms.',
  'On hot days, we swim in the backyard swimming pool.',
  'A fireplace keeps the living room warm in winter.',
  'I need to buy stamps at the post office.',
  'A smoke alarm in the kitchen kept everyone safe.',
  'She bought medicine at the drugstore.',
  'There is a large bookshelf in the dining room.'
];
const COMPOUND_MATCH = [
  {def:'A place where you buy and send mail', answer:'post office'},
  {def:'A piece of furniture for storing books', answer:'bookshelf'},
  {def:'The road from the street to a house', answer:'driveway'},
  {def:'A place in the wall where you burn wood for heat', answer:'fireplace'},
  {def:'An outdoor area behind a house', answer:'backyard'},
  {def:'A small store that sells medicine', answer:'drugstore'},
  {def:'A large building with many stores inside', answer:'shopping mall'},
  {def:'Buses, trains, and other shared vehicles', answer:'public transportation'}
];

/* ===== Section 3: Pronunciation — Stress in Compound Nouns (real audio) ===== */
const STRESS_TIP = [
  'In most compound nouns, the stress falls on the FIRST word.',
  'Say POST office, not post OFFICE. Say BOOKshelf, not book SHELF.'
];
const STRESS_WORDS = ['bookshelf', 'backyard', 'drugstore', 'shopping mall', 'fireplace', 'living room'];

/* ===== Section 4: Grammar — Prepositions of Location ===== */
const PREP_PART1 = [
  {sentence:'She lives ___ Thailand.', answer:'in'},
  {sentence:'My apartment is ___ Sukhumvit Road.', answer:'on'},
  {sentence:'I will meet you ___ 25 Riverside Apartments, room 4B.', answer:'at'},
  {sentence:'He grew up ___ Chiang Mai.', answer:'in'},
  {sentence:'The bookstore is ___ Main Street.', answer:'on'},
  {sentence:'We are having the party ___ my house.', answer:'at'}
];
const PREP_PART2 = [
  {sentence:'The pharmacy is ___ the supermarket and the bank.', answer:'between'},
  {sentence:'The park is ___ the library.', answer:'across from'},
  {sentence:'The coffee shop is ___ First Street and Main Street.', answer:'on the corner of'},
  {sentence:'My apartment building is ___ the bus stop.', answer:'next to'},
  {sentence:'The gym is ___ the dormitory.', answer:'behind'},
  {sentence:'The bakery is ___ the flower shop.', answer:'next to'}
];

/* ===== Section 5: Consider the Ideas (real audio, 3-category checklist) ===== */
const CONSIDER_INSIDE = [
  {id:'bedrooms', label:'Four bedrooms', mentioned:true},
  {id:'bathrooms', label:'Three bathrooms', mentioned:true},
  {id:'kitchen', label:'A big kitchen', mentioned:false},
  {id:'livingroom', label:'A big living room', mentioned:true},
  {id:'chairs', label:'Comfortable chairs and sofas', mentioned:true},
  {id:'tv', label:'A big TV', mentioned:false},
  {id:'windows', label:'Big windows', mentioned:true}
];
const CONSIDER_OUTSIDE = [
  {id:'backyard', label:'A big backyard', mentioned:true},
  {id:'frontyard', label:'A big front yard', mentioned:false},
  {id:'table', label:'A table with chairs', mentioned:true},
  {id:'trees', label:'Trees and flowers', mentioned:true},
  {id:'driveway', label:'A big driveway', mentioned:false},
  {id:'pool', label:'A swimming pool', mentioned:true}
];
const CONSIDER_NEIGHBORHOOD = [
  {id:'park', label:'Across the street from a park', mentioned:true},
  {id:'transport', label:'Near public transportation', mentioned:true},
  {id:'mall', label:'Near a shopping mall', mentioned:false},
  {id:'supermarket', label:'Near a supermarket', mentioned:true},
  {id:'quiet', label:'A quiet neighborhood', mentioned:false},
  {id:'neighbors', label:'Nice neighbors', mentioned:true}
];

/* ===== Section 6: Unit Assignment & Rubric ===== */
const ASSIGNMENT = {
  title: 'Design a Home and Give a Presentation',
  prompt: 'Work in a group. Design your dream home, then present it to the class.',
  steps: [
    'Form a group of 3 to 4 students.',
    'Together, decide what your home includes: rooms inside, features outside, and the neighborhood.',
    'Draw a simple floor plan or sketch of your home.',
    'Use compound nouns and prepositions of location to describe where things are.',
    'Practice agreeing and disagreeing as your group makes decisions together.',
    'Present your home design to the class. Every group member should speak.'
  ]
};
const RUBRIC_ROWS = [
  {lbl:'Student\'s information was clear.', sub:'Ideas were easy to follow and understand.'},
  {lbl:'Student used vocabulary from the unit.', sub:'Compound nouns and housing words from Units 10-11.'},
  {lbl:'Student used prepositions of location correctly.', sub:'in/on/at, next to, between, across from, behind.'},
  {lbl:'Student understood the opinions of group members.', sub:'Listened and responded to teammates\' ideas.'},
  {lbl:'Student agreed and disagreed with opinions appropriately.', sub:'Used polite agreeing/disagreeing expressions.'}
];
const RUBRIC_SCALE = [
  {pts:20, note:'Completely successful, almost every time'},
  {pts:15, note:'Mostly successful, most of the time'},
  {pts:10, note:'Partially successful, some of the time'},
  {pts:0, note:'Not successful'}
];
