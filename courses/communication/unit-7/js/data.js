/* ===================== UNIT 7 CONTENT DATA — FOOD CULTURE: MARKETS, MEALS & EATING HABITS =====================
   Rebuilt 2026-10-23 backward from its output (OBE): role-play a market. The
   customer buys 3 different foods and stays under 200 baht, the seller gives
   prices and the total, then they swap roles. It is also the graded video
   assignment (assignments/comm-u7-market-roleplay). Every class section trains
   one skill the role-play needs:
     food culture (warm-up) -> market words -> add up prices (budget)
     -> ask for food and prices -> ladder -> food habits survey -> role-play.
   Spot the Difference, Food Habits and the Practice Lab moved to take-home.
   The computer voice is the browser's own text-to-speech (en-US).
   A1 level: instructions stay short, vocabulary stays small and repeated, and
   market items use large emoji icons (they need several identical tiles). */

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
  {key:'s1', label:'Warm-Up: Food Culture Around Us'},
  {key:'s2', label:'Find the Food'},
  {key:'s3', label:'Basket and Budget'},
  {key:'s4', label:'Useful English'},
  {key:'s5', label:'Say It!'},
  {key:'s6', label:'Food Survey'},
  {key:'s7', label:'Market Role-Play Prep'},
  {key:'s8', label:'Speaking Task: Market Role-Play'},
  {key:'practice', label:'Practice Lab'},
  {key:'s9', label:'Self-Check & Take Home'},
  {key:'exit', label:'Exit Ticket'},
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

/* ===================== REBUILD ADDITIONS (2026-10-23) ===================== */
const LESSON_OBJECTIVES = [
  'Talk about where you buy food and who you eat with.',
  'Say the market foods and add up prices in baht.',
  'Ask for food and prices: "I’d like ___, please. How much is it?"',
  'Play both the customer and the seller.',
  'Buy 3 foods under 200 baht in a market role-play, with no script.'
];

/* ===== Section 1 extras ===== */
const CULTURE_SAY = ['I buy food at the market.', 'I eat with my family.', 'I eat breakfast early.', 'What about you?'];
const CULTURE_STEPS = [
  'Look at the questions. Choose one answer for each.',
  'Look at how people eat in Thailand, Japan and the USA.',
  'Tell a partner: "I buy food at ___. I eat with ___."',
  'Ask: "What about you?" Say "Me too!" or "Really?"'
];

/* ===== Section 3: Basket and Budget ===== */
const BASKET_STEPS = [
  'Part A: choose 3 or 4 foods. Say: "I’d like ___, please."',
  'Part B: you have 200 baht. Buy 3 foods. Add up the prices.',
  'Say the total: "That is ___ baht."'
];

/* ===== Section 4: Useful English extras ===== */
const MARKET_PHRASES = [
  {who:'Customer', say:'I’d like ___, please.', ex:'I’d like mangoes, please.'},
  {who:'Customer', say:'How much is it?', ex:'How much is it?'},
  {who:'Customer', say:'No, thank you.', ex:'No, thank you.'},
  {who:'Seller', say:'Can I help you?', ex:'Can I help you?'},
  {who:'Seller', say:'How many?', ex:'How many?'},
  {who:'Seller', say:'It’s ___ baht.', ex:'It’s sixty baht.'},
  {who:'Seller', say:'Anything else?', ex:'Anything else?'}
];

/* ===== Section 5: Say It! ===== */
const SOUND_TIPS = {
  contraction: {written:'I would like', fast:'"I’d like"', ex:'I’d like mangoes, please.', note:'In speech, "I would like" is short: "I’d like".'},
  numbers: [
    {text:'fifTEEN (15)', note:'-teen numbers: the end is strong. fif-TEEN.', say:'fifteen baht'},
    {text:'FIFty (50)', note:'-ty numbers: the start is strong. FIF-ty.', say:'fifty baht'}
  ],
  question: {text:'Anything else?', note:'The voice goes up at the end of a question.'}
};
const LADDER_MODEL = [
  'Hello. I’d like mangoes, please.',
  'How many? Three, please.',
  'How much is it? It’s sixty baht.',
  'Anything else? No, thank you. Thank you.'
];
const ECHO_RACE = {
  steps: [
    'Make 2 teams. Your teacher shows a market food picture and a price.',
    'Team 1 says: "I’d like ___, please. How much is it?"',
    'Team 2 answers: "It’s ___ baht."',
    'Give 1 point for the right sentence and 1 point for the right price.',
    'Last round: one student from each team does the whole customer and seller chat alone.'
  ]
};

/* ===== Section 6: Food Survey extras ===== */
const SURVEY_STEPS = [
  'Choose 3 questions. Press "Hear it" and say them.',
  'Walk around. Ask 3 classmates. Write short notes, not sentences.',
  'Tell a partner what you found.'
];
const SURVEY_REPORT = {
  model: ['Mai likes mangoes.', 'She buys food at the market.', 'She wants to try sushi.'],
  tip: 'For he or she, add -s: likes, buys, wants.'
};

/* ===== Section 8: Speaking Task, Market Role-Play ===== */
const MARKET_TASK = {
  steps: [
    'Find a partner. One is the Customer, one is the Seller. Look at the price board, not at paper with sentences.',
    'Customer: buy 3 different foods and stay under 200 baht. Ask the price of each.',
    'Seller: ask "How many?", say the price, ask "Anything else?" and say the total.',
    'Say "Thank you." Then change roles and do it again.',
    'This is the same as your graded video. Practice twice, then record.'
  ]
};
const MARKET_MODEL = [
  {who:'C', text:'Hello.'},
  {who:'S', text:'Hello. Can I help you?'},
  {who:'C', text:'I’d like mangoes, please.'},
  {who:'S', text:'How many?'},
  {who:'C', text:'Three, please. How much is it?'},
  {who:'S', text:'It’s sixty baht. Anything else?'},
  {who:'C', text:'Yes. Bananas, please.'},
  {who:'S', text:'It’s thirty baht. That’s ninety baht in all.'},
  {who:'C', text:'Thank you.'},
  {who:'S', text:'Thank you. Have a nice day.'}
];
const PEER_CHECKLIST = [
  'Bought 3 different foods.',
  'Stayed under 200 baht.',
  'Customer: said "I’d like ___, please" and "How much is it?"',
  'Seller: said "How many?", the price, and "Anything else?"',
  'Said the prices and the total right.',
  'Both students played both roles.',
  'Said "Thank you."',
  'No script: used the price board only, eyes up.'
];

/* ===== Section 9: Self-check ===== */
const CAN_DO = [
  'I can talk about where I buy food and who I eat with.',
  'I can name market foods.',
  'I can add up prices and say the total.',
  'I can ask: How much is it? How many?',
  'I can ask for food: I’d like ___, please.',
  'I can play the customer and the seller with no script.'
];
const SCALE = [
  {v:1, label:'Not yet'},
  {v:2, label:'Almost'},
  {v:3, label:'Yes!'}
];

const PLURAL_FOOD = {apple:'apples', mango:'mangoes', banana:'bananas', pineapple:'pineapples', orange:'oranges', carrot:'carrots', tomato:'tomatoes', vegetables:'vegetables'};

/* Exit ticket (shared component js/exit-ticket.js): 2 questions tied to the output, a confidence rating, and an optional note. */
const EXIT_CFG = {
  "outcome": "I can buy food at a market and stay on budget.",
  "questions": [
    {
      "q": "You want to know the price of mangoes. What do you ask?",
      "options": [
        "How much is it?",
        "How many is it?",
        "What is it?"
      ],
      "correct": 0
    },
    {
      "q": "Mangoes are 60 baht. Bananas are 30 baht. What is the total?",
      "options": [
        "80 baht",
        "90 baht",
        "30 baht"
      ],
      "correct": 1
    }
  ]
};
