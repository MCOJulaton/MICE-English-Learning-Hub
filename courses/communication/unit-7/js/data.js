/* ===================== UNIT 7 CONTENT DATA — FOOD CULTURE: MARKETS, MEALS & EATING HABITS =====================
   All lesson content lives here. Nothing here is UI logic — see app.js.
   Unit 7 continues Unit 6 (Cultural Studies: Food & Eating), moving from
   the restaurant into the food market. A1 level: instructions stay short
   (2–7 words), vocabulary stays small and repeated across activities so
   it reinforces itself, and every section asks students to DO something
   rather than read. Icon-driven throughout for most sections, since no
   source workbook/photos were supplied for this unit initially, so
   market items use large emoji icons (works better than photos for
   click-count activities like "find 3 apples" anyway, since it needs
   several identical tiles). Section 3 (Spot the Difference) is the one
   exception: it uses two real photos the teacher supplied later, since a
   real photo pair is what a spot-the-difference activity actually needs. */

/* ===== Section 1: Food Culture Around Us ===== */
const CULTURE_CHOICE_QUESTIONS = [
  { q:'Where do you buy food?', opts:[
    {ic:'🏠', lbl:'Home'}, {ic:'🍽️', lbl:'Restaurant'}, {ic:'🥭', lbl:'Market'}, {ic:'🛒', lbl:'Supermarket'}
  ]},
  { q:'Who do you eat with?', opts:[
    {ic:'👨‍👩‍👧', lbl:'Family'}, {ic:'👥', lbl:'Friends'}, {ic:'🧑', lbl:'Alone'}
  ]},
  { q:'When do you eat breakfast?', opts:[
    {ic:'🌅', lbl:'Early'}, {ic:'🌤️', lbl:'Late'}, {ic:'🚫', lbl:'I don\'t eat breakfast'}
  ]}
];
const CULTURE_TABLE = {
  rows: ['Where do people buy food?', 'What time do people eat?', 'Eating with?', 'Common food place'],
  countries: [
    {flag:'🇹🇭', name:'Thailand', values:['Markets and supermarkets', '3 times a day', 'Family', 'Fresh market']},
    {flag:'🇯🇵', name:'Japan', values:['Supermarkets and small shops', '3 times a day', 'Family', 'Convenience store']},
    {flag:'🇺🇸', name:'USA', values:['Supermarkets', '3 times a day', 'Family / Friends', 'Grocery store']}
  ]
};
const CULTURE_INTRO_TIP = [
  'People buy food in different places.',
  'Meal times can be different too.',
  'There is no one "right" way to eat.',
  'Be curious. Be respectful.'
];

/* ===== Section 2A: Find the Food (Farmers' Market scene) =====
   A grid of market items. Each mission asks students to click a set
   number of one target item. Two missions, back to back. */
const MARKET_ITEMS = [
  {id:'apple',      ic:'🍎', nm:'apple',      tag:'fruit'},
  {id:'mango',      ic:'🥭', nm:'mango',      tag:'fruit'},
  {id:'banana',     ic:'🍌', nm:'banana',     tag:'fruit'},
  {id:'pineapple',  ic:'🍍', nm:'pineapple',  tag:'fruit'},
  {id:'orange',     ic:'🍊', nm:'orange',     tag:'fruit'},
  {id:'carrot',     ic:'🥕', nm:'carrot',     tag:'vegetable'},
  {id:'tomato',     ic:'🍅', nm:'tomato',     tag:'vegetable'},
  {id:'vegetables', ic:'🥬', nm:'vegetables', tag:'vegetable'}
];
/* Fixed scene layout so "find 3 apples" always has exactly 3 apples in it.
   Each tile references a MARKET_ITEMS id. */
const FIND_SCENE = [
  'apple','mango','banana','apple','carrot','tomato','apple','mango',
  'pineapple','orange','vegetables','banana','tomato','mango','carrot','orange'
];
const FIND_MISSIONS = [
  { targetId:'apple', count:3, instruction:'Find 3 apples.' },
  { targetId:'mango', count:3, instruction:'Find 3 mangoes.' }
];

/* ===== Section 2B: Spot the Difference =====
   Two real photos of the same market stall, framed identically, with 8
   real differences between them (sign text, blackboard text, lamp color,
   a shopper's hat, a weighing scale, a blue basket, the seller's apron,
   and the price sign). Each hotspot is a percentage-based rectangle over
   the shared photo area (both images are the same 756x741 crop, so one
   set of coordinates works for both), generously sized around the real
   object per Unit 7's brief -- students click near the object, not on
   an exact pixel. */
const MARKET_DIFF_IMAGES = {
  a: { src:'../../../assets/images/u7-market-diff-a.png', alt:'Market scene A: a customer points and talks with a market seller at a vegetable stall' },
  b: { src:'../../../assets/images/u7-market-diff-b.png', alt:'Market scene B: the same market stall, with eight small differences from Scene A' }
};
const MARKET_DIFFERENCES = [
  { id:'sign',       label:'The market sign is different.',        hotspot:{left:0,  top:2,  width:28, height:36} },
  { id:'blackboard', label:'The blackboard is different.',         hotspot:{left:36, top:1,  width:36, height:25} },
  { id:'lamp',       label:'The lamp is different.',                hotspot:{left:76, top:0,  width:23, height:15} },
  { id:'shopper',    label:'The shopper is wearing a hat.',         hotspot:{left:52, top:31, width:19, height:22} },
  { id:'scale',      label:'There is a weighing scale.',            hotspot:{left:54, top:41, width:18, height:19} },
  { id:'basket',     label:'There is a blue basket.',               hotspot:{left:48, top:56, width:17, height:16} },
  { id:'apron',      label:"The seller's apron is different.",     hotspot:{left:72, top:43, width:26, height:40} },
  { id:'price',      label:'The price is different: 25 / 30.',      hotspot:{left:40, top:70, width:18, height:12} }
];

/* ===== Section 2C: Build Your Market Basket ===== */
const BASKET_CHOICES = ['mango','banana','apple','carrot','tomato','vegetables'];

/* ===== Section 2D: Market Budget Challenge ===== */
const BUDGET_PRICES = {
  mango:60, banana:30, apple:50, carrot:20, vegetables:70, pineapple:90, orange:45, tomato:20
};
const BUDGET_LIMIT = 200;
const BUDGET_MISSION_ITEMS = 3;

/* ===== Section 2E: reasons (used in Speaking Task 1) ===== */
const TASTE_REASONS = [
  {ic:'🍬', lbl:'sweet'}, {ic:'🌶️', lbl:'spicy'}, {ic:'💧', lbl:'juicy'},
  {ic:'🥗', lbl:'healthy'}, {ic:'💰', lbl:'cheap'}, {ic:'🥕', lbl:'fresh'}
];

/* ===== Section 3 (in-app s6): Food Habits & Cultural Differences ===== */
const HABITS_QUESTIONS = [
  {q:'Chopsticks or fork?', opts:['Chopsticks','Fork']},
  {q:'Home or restaurant?', opts:['Home','Restaurant']},
  {q:'Breakfast early or late?', opts:['Early','Late']},
  {q:'Family or friends?', opts:['Family','Friends']}
];
const HABITS_TIP = [
  'In Thailand, many people eat with a spoon and fork.',
  'People may eat breakfast at different times.',
  'Some people eat with family. Some eat alone.',
  'Different habits, same goal: enjoy your food.'
];

/* ===== Section 4 (in-app s7): Useful English ===== */
const USEFUL_PATTERNS = [
  { pattern:'I like + -ing', examples:['I like eating noodles.', 'I like cooking.'] },
  { pattern:'I love + -ing', examples:['I love eating mangoes.', 'I love cooking.'] },
  { pattern:'I want + to', examples:['I want to try sushi.', 'I want to buy mangoes.'] },
  { pattern:'I need + to', examples:['I need to buy vegetables.'] }
];
const USEFUL_MCQ = [
  {q:'I like ___ noodles.', opts:['eat','eating','to eating'], correct:1},
  {q:'I want ___ sushi.', opts:['try','trying','to try'], correct:2},
  {q:'I need ___ vegetables.', opts:['buy','buying','to buy'], correct:2},
  {q:'I love ___ mangoes.', opts:['eat','eating','to eat'], correct:1}
];
const SENTENCE_STARTERS = ['I like', 'I love', 'I want to', 'I need to'];
const SENTENCE_ENDINGS = ['eating noodles', 'cooking', 'buy mangoes', 'try sushi', 'buy vegetables', 'eating mangoes'];

/* ===== Section 5 (in-app s9): Food Survey ===== */
const SURVEY_QUESTIONS = [
  'What food do you like?',
  'Where do you buy food?',
  'What food do you want to try?',
  'Do you eat fast food?',
  'Why do you like it?'
];

/* ===== Section 6 (in-app s11): Market Role-Play Prep ===== */
const ROLE_CUSTOMER = {
  title: 'You are the CUSTOMER',
  tasks: ['Greet', 'Say what you want', 'Ask how many / how much', 'Pay', 'Say thank you'],
  phrases: ["Hello.", "I'd like ___, please.", "How much is it?", "Anything else? No, thank you.", "Thank you."]
};
const ROLE_SELLER = {
  title: 'You are the SELLER',
  tasks: ['Greet', 'Ask how many', 'Ask "Anything else?"', 'Give the price', 'Say thank you'],
  phrases: ["Hello. Can I help you?", "How many?", "Anything else?", "It's ___ baht.", "Thank you. Have a nice day."]
};
const ROLEPLAY_MISSION = ['Buy 3 different foods.', 'Stay under 200 baht.', 'Use English with your partner.'];

/* ===== Practice Lab ===== */
const LAB_VOCAB = [
  {q:'Which word means 🍎?', opts:['Apple','Mango','Carrot'], correct:0},
  {q:'Which word means 🥭?', opts:['Banana','Mango','Orange'], correct:1},
  {q:'Which word is a vegetable?', opts:['Pineapple','Carrot','Banana'], correct:1},
  {q:'Which word means 🍍?', opts:['Pineapple','Orange','Tomato'], correct:0}
];
const LAB_CULTURE = [
  {q:'In Thailand, people often eat with a spoon and...', opts:['Chopsticks','Fork','Knife'], correct:1},
  {q:'A place with many small food stalls outside is a...', opts:['Market','Office','Bank'], correct:0},
  {q:'True or false: everyone in one culture eats the same way.', opts:['True','False'], correct:1}
];
const LAB_USEFUL = [
  {q:'I ___ eating mangoes.', opts:['want to','love','need to'], correct:1},
  {q:'I ___ to buy vegetables.', opts:['like','love','need'], correct:2},
  {q:'I want ___ sushi.', opts:['to try','trying','try'], correct:0}
];
const LAB_LISTEN = [
  {audio:"I'd like mangoes, please.", opts:["I'd like mangoes.","I'd like bananas.","I don't like mangoes."], correct:0},
  {audio:'How much is it?', opts:['How many is it?','How much is it?','How are you?'], correct:1},
  {audio:"It's forty baht.", opts:["It's fourteen baht.","It's forty baht.","It's four baht."], correct:1}
];
const LAB_SPEAK_PROMPTS = [
  {text:'Say: "I want to buy mangoes."'},
  {text:'Say: "How much is it?"'},
  {text:'Tell your partner your favorite market food.'}
];
const LAB_MARKET_EXPR = [
  {q:'You want to buy something. What do you say?', opts:['How much is it?',"I'd like ___, please.",'Hello.'], correct:1},
  {q:'You want to know the price. What do you say?', opts:['How much is it?','Anything else?','Thank you.'], correct:0},
  {q:'The seller asks "Anything else?" You want nothing more. What do you say?', opts:['Yes, please.','No, thank you.','How many?'], correct:1}
];

/* ===== Reflection ===== */
const REFLECTION_ITEMS = [
  {k:'culture', lbl:'I can talk about food culture.'},
  {k:'market',  lbl:'I can find and buy food at a market.'},
  {k:'useful',  lbl:'I can use I like / love / want / need.'},
  {k:'ask',     lbl:'I can ask and answer questions about food.'}
];
const FEELING_OPTIONS = [
  {ic:'😊', lbl:'Good'},
  {ic:'🙂', lbl:'Okay'},
  {ic:'😕', lbl:'Difficult'}
];

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Food Culture Around Us'},
  {key:'s2', label:'Find the Food'},
  {key:'s3', label:'Spot the Difference'},
  {key:'s4', label:'Build Your Market Basket'},
  {key:'s5', label:'Market Budget Challenge'},
  {key:'s6', label:'Food Habits & Culture'},
  {key:'s7', label:'Useful English'},
  {key:'s8', label:'Speaking Task 1: What Do I Want?'},
  {key:'s9', label:'Food Survey'},
  {key:'s10', label:'Speaking Task 2: Food Interview'},
  {key:'s11', label:'Market Role-Play Prep'},
  {key:'practice', label:'Practice Lab'},
  {key:'s12', label:'Reflection & Take Home'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 7, Cultural Studies: Food Culture (Markets, Meals & Eating Habits)',
  unitCode: 'unit-7'
};

const STUDY_GUIDE_DATA_URI = "../../../assets/study-guide/Unit7-Food-Culture-Study-Guide.jpg";
const STUDY_GUIDE_FILENAME = "Unit7-Food-Culture-Study-Guide.jpg";
