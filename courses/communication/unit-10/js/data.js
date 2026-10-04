/* ===================== UNIT 10 CONTENT DATA: WHAT MAKES A GOOD HOME? =====================
   Rebuilt for CEFR A1 to low A2 students. The unit is no longer a textbook
   listening lesson. It is a short path that ends with the student's own
   "My Perfect Home" presentation:
     LOOK > LEARN > CHOOSE > PRACTICE > BUILD > DRAW > SPEAK > PRESENT
   Small core vocabulary, repeated in every section. All student-facing
   English is short, American spelling, no dashes. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up'},
  {key:'s2', label:'Rooms'},
  {key:'s3', label:'Home Features'},
  {key:'s4', label:'I Like / I Want'},
  {key:'s5', label:'Why?'},
  {key:'s6', label:'Which Home?'},
  {key:'s7', label:'Build Your Home'},
  {key:'s8', label:'Draw Your Home'},
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
  {id:'livingroom', word:'living room'},
  {id:'diningroom', word:'dining room'},
  {id:'garden', word:'garden', img:IMG+'garden.jpg'},
  {id:'balcony', word:'balcony', img:IMG+'balcony.jpg'}
];

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

/* ===== Section 4: I Like / I Want ===== */
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
const SENTENCE_CHALLENGES = [
  {thing:'garden', mood:'up', correct:'I want a garden.', wrong:['I want a balcony.', 'I want a kitchen.']},
  {thing:'bighouse', mood:'up', correct:'I like a big house.', wrong:['I like a small house.', 'I like an old house.']},
  {thing:'quiet', mood:'up', correct:'I like a quiet home.', wrong:['I like a noisy home.', 'I like a modern home.']},
  {thing:'smallbed', mood:'down', correct:"I don't want a small bedroom.", wrong:['I want a small bedroom.', "I don't want a big bedroom."]},
  {thing:'kitchen', mood:'up', correct:'I want a big kitchen.', wrong:['I want a small kitchen.', "I don't want a big kitchen."]}
];

/* ===== Section 5: Why? ===== */
const REASONS = [
  {id:'comfortable', text:'because it is comfortable.'},
  {id:'beautiful', text:'because it is beautiful.'},
  {id:'quiet', text:'because it is quiet.'},
  {id:'near', text:'because it is near my university.'},
  {id:'cooking', text:'because I like cooking.'}
];
const WHY_ITEMS = [
  {stem:'I like a big kitchen', img:IMG+'kitchen.jpg', answer:'cooking', opts:['cooking', 'quiet', 'near']},
  {stem:'I like my sofa', icon:'livingroom', answer:'comfortable', opts:['comfortable', 'cooking', 'near']},
  {stem:'I like this home', img:IMG+'beach-house.jpg', answer:'beautiful', opts:['beautiful', 'cooking', 'near']},
  {stem:'I want this apartment', img:IMG+'apartment.jpg', answer:'near', opts:['near', 'beautiful', 'cooking']},
  {stem:'I like this room', img:IMG+'quiet.jpg', answer:'quiet', opts:['quiet', 'cooking', 'near']}
];
const WHY_OWN_THINGS = ['a big kitchen', 'a quiet home', 'a garden', 'a modern home'];

/* ===== Section 6: Which Home Do You Choose? =====
   reason: the words after "because". null means it is not a reason to choose. */
const HOME_CHOICES = [
  {homes:[
    {name:'Home A', facts:[
      {ic:'🛏️', label:'2 bedrooms', reason:'it has two bedrooms'},
      {ic:'🍳', label:'Small kitchen', reason:null},
      {ic:'📍', label:'Near university', reason:'it is near my university'},
      {ic:'💵', label:'Cheap', reason:'it is cheap'}]},
    {name:'Home B', facts:[
      {ic:'🛏️', label:'3 bedrooms', reason:'it has three bedrooms'},
      {ic:'🍳', label:'Big kitchen', reason:'it has a big kitchen'},
      {ic:'🚗', label:'Far from university', reason:null},
      {ic:'💰', label:'Expensive', reason:null}]}
  ]},
  {homes:[
    {name:'Home A', facts:[
      {ic:'🌳', label:'Big garden', reason:'it has a big garden'},
      {ic:'🔊', label:'Noisy', reason:null},
      {ic:'💵', label:'Cheap', reason:'it is cheap'}]},
    {name:'Home B', facts:[
      {ic:'🌇', label:'Balcony', reason:'it has a balcony'},
      {ic:'🤫', label:'Quiet', reason:'it is quiet'},
      {ic:'💰', label:'Expensive', reason:null}]}
  ]},
  {homes:[
    {name:'Home A', img:IMG+'apartment.jpg', facts:[
      {ic:'🛏️', label:'1 bedroom', reason:null},
      {ic:'📍', label:'Near university', reason:'it is near my university'},
      {ic:'💵', label:'Cheap', reason:'it is cheap'}]},
    {name:'Home B', img:IMG+'beach-house.jpg', facts:[
      {ic:'🌊', label:'Near the beach', reason:'it is near the beach'},
      {ic:'🛏️', label:'3 bedrooms', reason:'it has three bedrooms'},
      {ic:'💰', label:'Expensive', reason:null}]},
    {name:'Home C', img:IMG+'family-house.jpg', facts:[
      {ic:'🛏️', label:'4 bedrooms', reason:'it has four bedrooms'},
      {ic:'🌳', label:'Big garden', reason:'it has a big garden'},
      {ic:'🍳', label:'Big kitchen', reason:'it has a big kitchen'}]}
  ]}
];

/* ===== Section 7: Build Your Perfect Home ===== */
const NUMBER_WORDS = {1:'one', 2:'two', 3:'three', 4:'four'};
const BUILD_COUNTS = {
  bedrooms:{label:'Bedrooms', icon:'bedroom', opts:[1,2,3,4]},
  bathrooms:{label:'Bathrooms', icon:'bathroom', opts:[1,2,3]}
};
const BUILD_KITCHEN = ['small', 'big'];
const BUILD_EXTRAS = [
  {id:'livingroom', label:'Living room', icon:'livingroom'},
  {id:'garden', label:'Garden', icon:'garden'},
  {id:'balcony', label:'Balcony', icon:'balcony'},
  {id:'pool', label:'Pool', icon:'pool'},
  {id:'study', label:'Study room', icon:'study'}
];
const MY_HOME_KEY = 'efc_u10_myhome';

/* ===== Section 8: Draw Your Perfect Home ===== */
const DRAW_PROMPTS = [
  'My home has ______ bedrooms.',
  'My home has ______ bathrooms.',
  'My favorite room is the ______.',
  'I want a ______.',
  'I like my home because ______.'
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
  {ic:'✏️', title:'Draw your home', text:'Draw and color your perfect home on the worksheet.'},
  {ic:'🏠', title:'Choose rooms and features', text:'Use your Build Your Home choices.'},
  {ic:'💬', title:'Prepare your sentences', text:'Use your script from Speaking Practice.'},
  {ic:'🗣️', title:'Practice speaking', text:'Say your script two times. Listen. Say it again.'},
  {ic:'🎤', title:'Present to the class', text:'Show your drawing. Say your sentences. Say thank you.'}
];
const CAN_DO = [
  'I can say hello.',
  'I can name 3 rooms.',
  'I can say what my home has.',
  'I can say what I like.',
  'I can say because.'
];
