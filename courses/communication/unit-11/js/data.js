/* ===================== UNIT 11 CONTENT DATA: DESIGN A HOME (GROUP PROJECT) =====================
   CEFR A1 to low A2. Unit 10 was each student's own home. Unit 11 is the group's home:
     REVIEW > WHERE IS IT? > OUR NEIGHBORHOOD > AGREE / DISAGREE > PLAN > FLOOR PLAN > SCRIPT > PRESENT
   All student-facing English is short, American spelling, no dashes. Same coin game as Unit 10,
   but the whole group shares one budget and must agree. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Review'},
  {key:'s2', label:'Where Is It?'},
  {key:'s3', label:'Our Neighborhood'},
  {key:'s4', label:'Agree and Disagree'},
  {key:'s5', label:'Plan Our Home'},
  {key:'s6', label:'Floor Plan'},
  {key:'s7', label:'Our Script'},
  {key:'s8', label:'Final Presentation'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 11, Architecture: Design a Home',
  unitCode: 'unit-11'
};

const IMG = '../../../assets/images/comm-unit10/';

/* ===== Section 1: Review (words from Unit 10) ===== */
const ROOMS = [
  {id:'bedroom', word:'bedroom', img:IMG+'bedroom.jpg'},
  {id:'bathroom', word:'bathroom', img:IMG+'bathroom.jpg'},
  {id:'kitchen', word:'kitchen', img:IMG+'kitchen.jpg'},
  {id:'livingroom', word:'living room', img:IMG+'livingroom.jpg'},
  {id:'diningroom', word:'dining room', img:IMG+'diningroom.jpg'},
  {id:'garden', word:'garden', img:IMG+'garden.jpg'},
  {id:'balcony', word:'balcony', img:IMG+'balcony.jpg'}
];
/* Picture to word. Each round: a picture, the right word, two other words. */
const REVIEW_ROUNDS = [
  {id:'bedroom', answer:'bedroom', opts:['bedroom', 'kitchen', 'garden']},
  {id:'kitchen', answer:'kitchen', opts:['bathroom', 'kitchen', 'balcony']},
  {id:'garden', answer:'garden', opts:['garden', 'living room', 'bedroom']},
  {id:'livingroom', answer:'living room', opts:['dining room', 'bathroom', 'living room']},
  {id:'bathroom', answer:'bathroom', opts:['bathroom', 'bedroom', 'kitchen']},
  {id:'balcony', answer:'balcony', opts:['garden', 'balcony', 'dining room']},
  {id:'study', answer:'study room', opts:['study room', 'pool', 'kitchen']},
  {id:'pool', answer:'pool', opts:['garden', 'pool', 'study room']}
];
const REVIEW_SAY = [
  'My home has two bedrooms.',
  'It has a big kitchen.',
  'I want a garden because it is beautiful.'
];

/* ===== Section 2: Where Is It? ===== */
const PREPS = [
  {id:'in', word:'in', say:'The ball is in the box.'},
  {id:'on', word:'on', say:'The ball is on the box.'},
  {id:'next', word:'next to', say:'The ball is next to the box.'},
  {id:'between', word:'between', say:'The ball is between the boxes.'},
  {id:'behind', word:'behind', say:'The ball is behind the box.'},
  {id:'front', word:'in front of', say:'The ball is in front of the box.'}
];
const PREP_ROUNDS = ['behind', 'in', 'next', 'on', 'between', 'front', 'in', 'behind', 'next', 'between'];
const PREP_OPTIONS = ['in', 'on', 'next to', 'between', 'behind', 'in front of'];

/* ===== Section 3: Our Neighborhood =====
   The street has two sides. top: one side. bottom: the other side.
   Same column = across from. Same side and touching = next to. */
const PLACES = [
  {id:'park', word:'park', art:'a park', the:'the park'},
  {id:'coffee', word:'coffee shop', art:'a coffee shop', the:'the coffee shop'},
  {id:'bank', word:'bank', art:'a bank', the:'the bank'},
  {id:'university', word:'university', art:'a university', the:'the university'},
  {id:'busstop', word:'bus stop', art:'a bus stop', the:'the bus stop'},
  {id:'supermarket', word:'supermarket', art:'a supermarket', the:'the supermarket'},
  {id:'mall', word:'shopping mall', art:'a shopping mall', the:'the shopping mall'},
  {id:'hospital', word:'hospital', art:'a hospital', the:'the hospital'}
];
const MAP_TOP = ['park', 'coffee', 'bank', 'university'];
const MAP_BOTTOM = ['busstop', 'supermarket', 'mall', 'hospital'];
/* Each round: a question and 3 sentences. The first one is the right answer (shuffled on screen). */
const MAP_ROUNDS = [
  {q:'Where is the park?', answer:'The park is across from the bus stop.', wrong:['The park is across from the bank.', 'The park is across from the hospital.']},
  {q:'Where is the coffee shop?', answer:'The coffee shop is between the park and the bank.', wrong:['The coffee shop is between the bank and the university.', 'The coffee shop is between the bus stop and the mall.']},
  {q:'Where is the supermarket?', answer:'The supermarket is next to the bus stop.', wrong:['The supermarket is next to the hospital.', 'The supermarket is next to the park.']},
  {q:'Where is the university?', answer:'The university is across from the hospital.', wrong:['The university is across from the mall.', 'The university is across from the bus stop.']},
  {q:'Where is the bank?', answer:'The bank is next to the university.', wrong:['The bank is next to the park.', 'The bank is next to the hospital.']},
  {q:'Where is the shopping mall?', answer:'The shopping mall is between the supermarket and the hospital.', wrong:['The shopping mall is between the bus stop and the supermarket.', 'The shopping mall is between the park and the coffee shop.']},
  {q:'Where is the hospital?', answer:'The hospital is next to the shopping mall.', wrong:['The hospital is next to the supermarket.', 'The hospital is next to the university.']},
  {q:'Where is the bus stop?', answer:'The bus stop is across from the park.', wrong:['The bus stop is across from the coffee shop.', 'The bus stop is across from the university.']}
];
const MAP_MODEL = [
  'The coffee shop is next to the park.',
  'The bank is between the coffee shop and the university.',
  'The mall is across from the bank.',
  'The supermarket is across from the coffee shop.'
];

/* ===== Section 4: Agree and Disagree ===== */
const AGREE_PHRASES = ['I agree.', 'Good idea!', 'Me too.'];
const DISAGREE_PHRASES = ['I do not agree.', 'Sorry, I do not think so.', 'How about a garden?'];
/* A friend says an idea. You think something. Choose the polite answer. */
const AGREE_ROUNDS = [
  {icon:'pool', idea:'I want a pool.', think:'You think: a pool is expensive.', answer:'I do not agree. A pool is expensive.', wrong:['No! Bad idea.', 'I agree. A pool is cheap.']},
  {icon:'garden', idea:'I want a garden.', think:'You think: a garden is beautiful.', answer:'I agree. A garden is beautiful.', wrong:['I do not agree. A garden is beautiful.', 'No! Bad idea.']},
  {icon:'study', idea:'I want a study room.', think:'You think: we study a lot.', answer:'Good idea! We study a lot.', wrong:['I do not agree. We study a lot.', 'Me too. It is expensive.']},
  {icon:'kitchen', idea:'I want a big kitchen.', think:'You think: it costs two coins. We have only a few coins.', answer:'I do not agree. It costs two coins.', wrong:['I agree. It is free.', 'No! Stop talking.']},
  {icon:'balcony', idea:'I want a balcony.', think:'You think: a balcony is nice and it is only one coin.', answer:'Me too. A balcony is nice.', wrong:['No! I hate it.', 'I do not agree. It is nice.']},
  {icon:'near', idea:'I want a home near the university.', think:'You think: we walk to class. It is not far.', answer:'I agree. We walk to class.', wrong:['I do not agree. We walk to class.', 'No! Bad idea.']}
];
const IDEA_CARDS = [
  {icon:'pool', text:'I want a pool because it is fun.'},
  {icon:'garden', text:'I want a garden because it is beautiful.'},
  {icon:'balcony', text:'I want a balcony because it is comfortable.'},
  {icon:'study', text:'I want a study room because I study a lot.'}
];

/* ===== Section 5: Plan Our Home (the coin game, one budget for the group) ===== */
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
const BUDGET_GROUP = 15;
const GROUP_HOME_KEY = 'efc_u11_grouphome';
const GROUP_PLAN_KEY = 'efc_u11_plan';
const GROUP_REASON_KEY = 'efc_u11_reason';
const GROUP_TALK = [
  'I want a garden because it is beautiful.',
  'I agree.',
  'I do not agree. A pool is expensive.',
  'How about a balcony?',
  'OK. Let us choose a balcony.'
];

/* ===== Section 6: Floor Plan =====
   Six places: three on the top side, three on the bottom side, a hall in the middle.
   top slot i is across from bottom slot i. */
const PLAN_ROOMS = [
  {id:'bedroom', word:'bedroom', the:'the bedroom', has:h=>h.bedrooms >= 1},
  {id:'bathroom', word:'bathroom', the:'the bathroom', has:h=>h.bathrooms >= 1},
  {id:'kitchen', word:'kitchen', the:'the kitchen', has:h=>!!h.kitchen},
  {id:'livingroom', word:'living room', the:'the living room', has:h=>!!h.livingroom},
  {id:'study', word:'study room', the:'the study room', has:h=>!!h.study},
  {id:'balcony', word:'balcony', the:'the balcony', has:h=>!!h.balcony}
];

/* ===== Section 7: Our Script ===== */
const GROUP_REASONS = [
  {id:'comfortable', text:'it is comfortable'},
  {id:'beautiful', text:'it is beautiful'},
  {id:'safe', text:'it is safe'},
  {id:'quiet', text:'it is quiet'}
];

/* ===== Section 8: Final Presentation ===== */
const PRESENT_CHECKS = [
  {ic:'📐', title:'We have our floor plan', text:'Every room is in a place.'},
  {ic:'🗣️', title:'Everyone has lines', text:'Every student speaks. Practice two times.'},
  {ic:'📍', title:'We use "next to", "between", or "across from"', text:'Say where the rooms are.'},
  {ic:'🤝', title:'We say why we agree', text:'Use "because".'},
  {ic:'🙏', title:'We say thank you', text:'Look at the class. Speak slowly.'}
];
const RUBRIC_ROWS = [
  {lbl:'Our information is clear.', sub:'The class can follow our ideas.'},
  {lbl:'We use words from the unit.', sub:'Rooms, features, and places.'},
  {lbl:'We use "in", "on", "next to", "between", "across from" correctly.', sub:'We say where things are.'},
  {lbl:'We listen to our group.', sub:'We hear and use each idea.'},
  {lbl:'We agree and disagree politely.', sub:'"I agree." "I do not agree. How about ...?"'}
];
const RUBRIC_SCALE = [
  {pts:20, note:'Always. Almost every time.'},
  {pts:15, note:'Often. Most of the time.'},
  {pts:10, note:'Sometimes.'},
  {pts:0, note:'Not yet.'}
];
const PRESENT_SECONDS = 180;
