/* ===================== UNIT 10 CONTENT DATA: WHAT MAKES A GOOD HOME? =====================
   CEFR A1 to low A2. The student is a HOME DESIGNER:
     LOOK > LEARN > SAY WHY > HELP MINA (coins) > DESIGN MY HOME > DRAW > SPEAK > PRESENT
   Small core vocabulary, repeated in every section. All student-facing English
   is short, American spelling, no dashes. Clients speak in the first person. */

/* Keys stay the same after Section 6 was removed, so saved progress and deep links keep working. */
const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up'},
  {key:'s2', label:'Rooms'},
  {key:'s3', label:'Home Features'},
  {key:'s4', label:'I Like / I Want / Because'},
  {key:'s5', label:'Client: Mina'},
  {key:'s7', label:'Design Your Home'},
  {key:'s8', label:'Write About Your Home'},
  {key:'s9', label:'Speaking Practice'},
  {key:'s10', label:'My Perfect Home'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 10, Architecture: What Makes a Good Home?',
  unitCode: 'unit-10'
};

const IMG = '../../../assets/images/comm-unit10/';

/* ===== Section 1: Warm-Up ===== */
const HOME_TYPES = [
  {id:'apartment', name:'Apartment', img:IMG+'apartment.jpg'},
  {id:'small', name:'Small house', img:IMG+'small-house.jpg'},
  {id:'family', name:'Family house', img:IMG+'family-house.jpg'},
  {id:'modern', name:'Modern house', img:IMG+'modern-house.jpg'},
  {id:'beach', name:'Beach house', img:IMG+'beach-house.jpg'}
];
const WARMUP_QUESTIONS = [
  {id:'size', q:'Is it big or small?', opts:[{t:'Big', say:'It is big.'}, {t:'Small', say:'It is small.'}]},
  {id:'beautiful', q:'Is it beautiful?', opts:[{t:'Yes', say:'Yes, it is beautiful.'}, {t:'No', say:'No, it is not beautiful.'}]},
  {id:'beach', q:'Is it near the beach?', opts:[{t:'Yes', say:'Yes, it is near the beach.'}, {t:'No', say:'No, it is not near the beach.'}]},
  {id:'live', q:'Would you like to live there?', opts:[{t:'Yes', say:'Yes, I would like to live there.'}, {t:'No', say:'No, I would not like to live there.'}]}
];

/* ===== Section 2: Rooms ===== */
const ROOMS = [
  {id:'bedroom', word:'bedroom', img:IMG+'bedroom.jpg'},
  {id:'bathroom', word:'bathroom', img:IMG+'bathroom.jpg'},
  {id:'kitchen', word:'kitchen', img:IMG+'kitchen.jpg'},
  {id:'livingroom', word:'living room', img:IMG+'livingroom.jpg'},
  {id:'diningroom', word:'dining room', img:IMG+'diningroom.jpg'},
  {id:'garden', word:'garden', img:IMG+'garden.jpg'},
  {id:'balcony', word:'balcony', img:IMG+'balcony.jpg'}
];

/* Explore the house: the things we usually see in each room.
   items: belong in the room. not: do not belong (shown as wrong choices). */
const HOUSE_ROWS = [['bedroom', 'bathroom', 'balcony'], ['livingroom', 'diningroom', 'kitchen']];
const ITEM_WORDS = {
  bed:'bed', wardrobe:'wardrobe', pillow:'pillow', lamp:'lamp',
  shower:'shower', toilet:'toilet', sink:'sink', mirror:'mirror',
  stove:'stove', fridge:'fridge', pot:'pot',
  sofa:'sofa', tv:'TV', table:'table',
  chair:'chair', plate:'plate', glass:'glass',
  tree:'tree', flower:'flower', grass:'grass', bench:'bench',
  plant:'plant', railing:'railing'
};
const ROOM_ITEMS = {
  bedroom:   {items:['bed', 'wardrobe', 'pillow', 'lamp'], not:['stove', 'shower', 'tree']},
  bathroom:  {items:['shower', 'toilet', 'sink', 'mirror'], not:['bed', 'sofa', 'stove']},
  kitchen:   {items:['stove', 'fridge', 'sink', 'pot'], not:['bed', 'shower', 'tree']},
  livingroom:{items:['sofa', 'tv', 'table', 'lamp'], not:['toilet', 'stove', 'tree']},
  diningroom:{items:['table', 'chair', 'plate', 'glass'], not:['bed', 'shower', 'tree']},
  garden:    {items:['tree', 'flower', 'grass', 'bench'], not:['sofa', 'bed', 'stove']},
  balcony:   {items:['plant', 'chair', 'table', 'railing'], not:['bed', 'stove', 'shower']}
};

/* ===== Section 3: Home Features (12 words) ===== */
const FEATURE_PAIRS = [
  {id:'big-small', a:{word:'big', img:IMG+'family-house.jpg'}, b:{word:'small', img:IMG+'small-house.jpg'}},
  {id:'clean-dirty', a:{word:'clean', img:IMG+'bedroom.jpg'}, b:{word:'dirty', img:IMG+'dirty.jpg'}},
  {id:'quiet-noisy', a:{word:'quiet', img:IMG+'quiet.jpg'}, b:{word:'noisy', img:IMG+'noisy.jpg'}},
  {id:'cheap-expensive', a:{word:'cheap', img:IMG+'cheap.jpg'}, b:{word:'expensive', img:IMG+'expensive.jpg'}},
  {id:'modern-old', a:{word:'modern', img:IMG+'modern-house.jpg'}, b:{word:'old', img:IMG+'old-house.jpg'}}
];
const FEATURE_SINGLES = [
  {id:'safe', word:'safe'},
  {id:'beautiful', word:'beautiful'},
  {id:'comfortable', word:'comfortable'}
];

/* Section 3 crossword: 14 rows x 13 columns, 13 words, picture clues (no text). r,c = start cell. */
const CW_ROWS = 14;
const CW_COLS = 13;
const CW_WORDS = [
  {word:'safe',        r:0,  c:2,  dir:'D', num:1},
  {word:'dirty',       r:2,  c:8,  dir:'D', num:2},
  {word:'modern',      r:2,  c:12, dir:'D', num:3},
  {word:'expensive',   r:3,  c:2,  dir:'A', num:4},
  {word:'comfortable', r:5,  c:2,  dir:'A', num:5},
  {word:'clean',       r:5,  c:2,  dir:'D', num:5},
  {word:'old',         r:5,  c:6,  dir:'D', num:6},
  {word:'big',         r:5,  c:10, dir:'D', num:7},
  {word:'cheap',       r:7,  c:0,  dir:'A', num:8},
  {word:'noisy',       r:9,  c:2,  dir:'A', num:9},
  {word:'small',       r:9,  c:5,  dir:'D', num:10},
  {word:'quiet',       r:9,  c:8,  dir:'D', num:11},
  {word:'beautiful',   r:11, c:3,  dir:'A', num:12}
];

/* ===== Section 4: I Like / I Want / Because ===== */
const STARTERS = ['I like', 'I want', "I don't want"];
const THINGS = [
  {id:'bighouse', text:'a big house', img:IMG+'family-house.jpg'},
  {id:'quiet', text:'a quiet home', img:IMG+'quiet.jpg'},
  {id:'modern', text:'a modern home', img:IMG+'modern-house.jpg'},
  {id:'kitchen', text:'a big kitchen', img:IMG+'kitchen.jpg'},
  {id:'garden', text:'a garden', img:IMG+'garden.jpg'},
  {id:'balcony', text:'a balcony', img:IMG+'balcony.jpg'},
  {id:'smallbed', text:'a small bedroom', img:IMG+'cheap.jpg'},
  {id:'cheap', text:'a cheap home', img:IMG+'small-house.jpg'}
];
const REASONS = [
  {id:'comfortable', text:'because it is comfortable.'},
  {id:'beautiful', text:'because it is beautiful.'},
  {id:'quiet', text:'because it is quiet.'},
  {id:'near', text:'because it is near my university.'},
  {id:'cooking', text:'because I like cooking.'}
];
const WHY_ITEMS = [
  {stem:'I like a big kitchen', img:IMG+'kitchen.jpg', answer:'cooking', opts:['cooking', 'quiet', 'near']},
  {stem:'I like my sofa', img:IMG+'livingroom.jpg', answer:'comfortable', opts:['comfortable', 'cooking', 'near']},
  {stem:'I like this home', img:IMG+'beach-house.jpg', answer:'beautiful', opts:['beautiful', 'cooking', 'near']},
  {stem:'I want this apartment', img:IMG+'apartment.jpg', answer:'near', opts:['near', 'beautiful', 'cooking']},
  {stem:'I like this room', img:IMG+'quiet.jpg', answer:'quiet', opts:['quiet', 'cooking', 'near']}
];

/* ===== Sections 5 to 7: the coin game =====
   Every home starts with 1 bedroom, 1 bathroom, 1 small kitchen (free).
   Everything else costs coins. */
const NUMBER_WORDS = {1:'one', 2:'two', 3:'three', 4:'four'};
const BUILD_ROWS = [
  {id:'bedrooms', label:'Bedrooms', icon:'bedroom', type:'count', opts:[1,2,3,4]},
  {id:'bathrooms', label:'Bathrooms', icon:'bathroom', type:'count', opts:[1,2,3]},
  {id:'kitchen', label:'Kitchen', icon:'kitchen', type:'kitchen', opts:['small','big']},
  {id:'near', label:'Near university', icon:'near', type:'toggle', cost:2},
  {id:'livingroom', label:'Living room', icon:'livingroom', type:'toggle', cost:1},
  {id:'study', label:'Study room', icon:'study', type:'toggle', cost:1},
  {id:'balcony', label:'Balcony', icon:'balcony', type:'toggle', cost:1},
  {id:'garden', label:'Garden', icon:'garden', type:'toggle', cost:2},
  {id:'pool', label:'Pool', icon:'pool', type:'toggle', cost:3}
];
const KITCHEN_BIG_COST = 2;
const COST_CHIPS = [
  {icon:'bedroom', label:'Extra bedroom', cost:1},
  {icon:'bathroom', label:'Extra bathroom', cost:1},
  {icon:'kitchen', label:'Big kitchen', cost:2},
  {icon:'near', label:'Near university', cost:2},
  {icon:'livingroom', label:'Living room', cost:1},
  {icon:'study', label:'Study room', cost:1},
  {icon:'balcony', label:'Balcony', cost:1},
  {icon:'garden', label:'Garden', cost:2},
  {icon:'pool', label:'Pool', cost:3}
];
const BUDGET_OWN = 10;
const MY_HOME_KEY = 'efc_u10_myhome';

/* Clients. needs: what the client wants. Students choose a reason for each need.
   reason: the words after "because". wrong: a reason that does not fit. */
const CLIENTS = {
  mina: {
    id:'mina', name:'Mina', face:'👩‍🎓', color:'#0F766E', coins:5,
    shareName:'Mina', pron:'She', wantVerb:'wants',
    lines:['Hello. I am Mina.', 'I am a student.', 'I study a lot.', 'I want a home near my university.', 'I want a study room.', 'I have 5 coins.'],
    needs:[
      {id:'near', icon:'near', label:'Near university', test:h=>h.near, thing:'a home near the university', reason:'it is near her university', wrong:'she likes cooking'},
      {id:'study', icon:'study', label:'Study room', test:h=>h.study, thing:'a study room', reason:'Mina studies a lot', wrong:'it is a big house'}
    ]
  },
  ploy: {
    id:'ploy', name:'The Ploy family', face:'👨‍👩‍👧‍👦', color:'#1F5FA8', coins:8,
    shareName:'the Ploy family', pron:'They', wantVerb:'want',
    lines:['Hello. We are the Ploy family.', 'We are four people.', 'We want three bedrooms.', 'We want two bathrooms.', 'We want a garden.', 'We have 8 coins.'],
    needs:[
      {id:'beds', icon:'bedroom', label:'3 bedrooms', test:h=>h.bedrooms>=3, thing:'three bedrooms', reason:'we are four people', wrong:'it is near the university'},
      {id:'baths', icon:'bathroom', label:'2 bathrooms', test:h=>h.bathrooms>=2, thing:'two bathrooms', reason:'we are four people', wrong:'we like cooking'},
      {id:'garden', icon:'garden', label:'Garden', test:h=>h.garden, thing:'a garden', reason:'it is safe', wrong:'it is cheap'}
    ]
  },
  noi: {
    id:'noi', name:'Noi', face:'👩‍🍳', color:'#D9740F', coins:7,
    shareName:'Noi', pron:'She', wantVerb:'wants',
    lines:['Hello. I am Noi.', 'I like cooking.', 'I like plants.', 'I want a big kitchen.', 'I want a garden.', 'I have 7 coins.'],
    needs:[
      {id:'kitchen', icon:'kitchen', label:'Big kitchen', test:h=>h.kitchen==='big', thing:'a big kitchen', reason:'Noi likes cooking', wrong:'she is a student'},
      {id:'garden', icon:'garden', label:'Garden', test:h=>h.garden, thing:'a garden', reason:'Noi likes plants', wrong:'it is near the university'}
    ]
  }
};
const PAIR_CLIENTS = ['ploy', 'noi'];

/* ===== Section 8: Write About Your Home (matches Part 3 of the printed worksheet) ===== */
const WRITE_FRAMES = [
  'This is my perfect home.',
  'It has ______ bedrooms and ______ bathrooms.',
  'It has a ______ kitchen.',
  'It also has a ______ and a ______.',
  'My favorite room is the ______ because ______.',
  'I like my home because ______.'
];
const WRITE_CHECKS = [
  'I used "It has ..."',
  'I used "because"',
  'I used 2 describing words (big, quiet, ...)'
];

/* ===== Section 9: Speaking Practice ===== */
const MODEL_SPEECH = [
  'Hello.',
  'This is my perfect home.',
  'It has three bedrooms.',
  'It has two bathrooms.',
  'It has a big kitchen.',
  'It has a garden.',
  'My favorite room is my bedroom.',
  'I like it because it is comfortable.',
  'Thank you.'
];
const FAVORITE_REASONS = ['comfortable', 'beautiful', 'quiet'];

/* ===== Section 10: Final Presentation ===== */
const PRESENT_STEPS = [
  {ic:'📝', title:'Complete your worksheet', text:'Finish your dream home plan and your 6 sentences.'},
  {ic:'🏠', title:'Choose rooms and features', text:'Use your Design Your Home choices.'},
  {ic:'💬', title:'Prepare your sentences', text:'Use your script from Speaking Practice.'},
  {ic:'🗣️', title:'Practice speaking', text:'Say your script two times. Listen. Say it again.'},
  {ic:'🎤', title:'Present to the class', text:'Show your worksheet. Say your sentences. Say thank you.'}
];
const CAN_DO = [
  'I can say hello.',
  'I can name 3 rooms.',
  'I can say what my home has.',
  'I can say what I like.',
  'I can say because.'
];
