/* ===================== UNIT 6 CONTENT DATA — FOOD & EATING =====================
   Rebuilt 2026-10-23 backward from its output (OBE): order a whole meal in a
   restaurant in a group of 3 (two customers, one waiter), with no script, then
   do it for real at a real restaurant (the graded group video assignment).
   Every class section trains one skill the meal needs:
     why you choose food ("because", Unit 3) -> food and restaurant words
     -> hear the waiter and the price -> order politely (ladder) -> add up the
     total -> the Sunny Café role-play.
   Food and Culture, the Practice Lab and the reflection are take-home.
   The computer voice is the browser's own text-to-speech (en-US).
   Content sourced from the "Cultural Differences: Food and Eating" study guide
   for English for Communication, A1 level. Instructions are kept short. */

/* ===== Section 1: How Do You Choose Food? ===== */
const CHOOSE_FOOD_PHOTOS = ['rice','noodles','chicken','salad'];
const CHOOSE_REASONS = [
  {ic:'❤️', lbl:'I like it'},
  {ic:'💰', lbl:'Cheap'},
  {ic:'🥗', lbl:'Healthy'},
  {ic:'🌶️', lbl:'Spicy'},
  {ic:'👀', lbl:'Looks good'}
];

/* ===== Section 2: Food Vocabulary (6 words, real photos) ===== */
const FOOD_VOCAB = [
  {id:'rice',    ic:'🍚', nm:'Rice',    ex:'I like rice.'},
  {id:'noodles', ic:'🍜', nm:'Noodles', ex:'I like noodles.'},
  {id:'chicken', ic:'🍗', nm:'Chicken', ex:'I like chicken.'},
  {id:'beef',    ic:'🥩', nm:'Beef',    ex:'I like beef.'},
  {id:'salad',   ic:'🥗', nm:'Salad',   ex:'I like salad.'},
  {id:'soup',    ic:'🍲', nm:'Soup',    ex:'I like soup.'}
];

/* ===== Section 3: Food and Culture ===== */
const CULTURE_TABLE = {
  rows: ['What do people eat?', 'What time do people eat?', 'Eating with?', 'Utensils?'],
  countries: [
    {flag:'🇹🇭', name:'Thailand', values:['Rice and noodles', '3 times a day', 'Family', 'Spoon / Fork']},
    {flag:'🇯🇵', name:'Japan', values:['Rice and fish (Sushi)', '3 times a day', 'Family', 'Chopsticks']},
    {flag:'🇺🇸', name:'USA', values:['Many types (Burgers, pizza)', '3 times a day', 'Family / Friends', 'Fork / Knife']}
  ]
};
const CULTURE_QUESTIONS = [
  {q:'Chopsticks or fork?', opts:['Chopsticks','Fork']},
  {q:'Home or restaurant?', opts:['Home','Restaurant']},
  {q:'Spicy or not spicy?', opts:['Spicy','Not spicy']}
];
const CULTURE_TIP = [
  'Some food may be spicy.',
  'Some people don\'t eat certain food.',
  'Different cultures, different ways.',
  'Be open. Be kind. Enjoy together.'
];

/* ===== Section 4: Restaurant Vocabulary (matching) ===== */
const RESTAURANT_VOCAB = [
  {id:'menu', ic:'📋', nm:'Menu'},
  {id:'server', ic:'🧑‍🍳', nm:'Waiter / Server'},
  {id:'customer', ic:'🙋', nm:'Customer'},
  {id:'table', ic:'🍽️', nm:'Table'},
  {id:'order', ic:'👍', nm:'Order'},
  {id:'bill', ic:'🧾', nm:'Bill'},
  {id:'water', ic:'💧', nm:'Water'},
  {id:'food', ic:'🍛', nm:'Food'},
  {id:'drink', ic:'🥤', nm:'Drink'}
];

/* ===== Section 5: How to Order Food ===== */
const ORDER_PHRASES = [
  'Can I have ___, please?',
  'I\'d like ___, please.',
  'Anything else?',
  'Yes, please.',
  'No, thank you.',
  'How much is it?',
  'Can I have the bill, please?'
];
const ORDER_FOOD_CHOICES = [
  {ic:'🍚', nm:'fried rice'},
  {ic:'🍜', nm:'noodles'},
  {ic:'🍗', nm:'chicken'},
  {ic:'🥗', nm:'salad'}
];
const ORDER_DRINK_CHOICES = [
  {ic:'💧', nm:'water'},
  {ic:'🧃', nm:'juice'},
  {ic:'🥤', nm:'soda'},
  {ic:'🥛', nm:'milk'}
];

/* ===== Section 6: Restaurant Conversation (branching, decision points) ===== */
const CONVERSATION_STEPS = [
  {
    server: 'Hello. What would you like?',
    opts: [
      {t:'I\'d like fried rice, please.', correct:true},
      {t:'I\'m a student.', correct:false},
      {t:'Good morning school.', correct:false}
    ],
    feedbackGood:'Great! That\'s how you order food.'
  },
  {
    server: 'Anything to drink?',
    opts: [
      {t:'Water, please.', correct:true},
      {t:'I am 20 years old.', correct:false},
      {t:'Yes, it is raining.', correct:false}
    ],
    feedbackGood:'Good choice!'
  },
  {
    server: 'Anything else?',
    opts: [
      {t:'No, thank you.', correct:true},
      {t:'Can I have a pen?', correct:false},
      {t:'I like blue.', correct:false}
    ],
    feedbackGood:'Perfect.'
  },
  {
    server: 'Here you are. Enjoy your meal!',
    opts: [
      {t:'Thank you.', correct:true},
      {t:'Goodbye forever.', correct:false},
      {t:'I don\'t understand.', correct:false}
    ],
    feedbackGood:'Excellent! You finished the conversation.'
  }
];

/* ===== Section 7: Build Your Order ===== */
const BUILD_MAINS = [
  {ic:'🍚', nm:'Fried rice'},
  {ic:'🍜', nm:'Noodles'},
  {ic:'🍗', nm:'Chicken'},
  {ic:'🥗', nm:'Salad'}
];
const BUILD_DRINKS = [
  {ic:'💧', nm:'Water'},
  {ic:'🧃', nm:'Juice'},
  {ic:'🥤', nm:'Soda'},
  {ic:'🥛', nm:'Milk'}
];
const BUILD_DESSERTS = [
  {ic:'🍨', nm:'Ice cream'},
  {ic:'🍎', nm:'Fruit'},
  {ic:'🍰', nm:'Cake'},
  {ic:'✖️', nm:'None'}
];

/* ===== Section 8: Speaking Task, Ordering Food at a Restaurant =====
   Final classroom speaking task before the real-restaurant assignment. Groups
   of 3: two Customers and one Waiter, ordering from a small sample menu. */
const RESTAURANT_NAME = 'Sunny Café';
const RESTAURANT_MENU = [
  { cat:'Main Dishes', items:[
    {nm:'Fried Rice', price:80},
    {nm:'Chicken Noodles', price:90},
    {nm:'Chicken Fried Rice', price:85},
    {nm:'Pad Thai', price:90},
    {nm:'Vegetable Rice', price:75}
  ]},
  { cat:'Side Dishes', items:[
    {nm:'French Fries', price:50},
    {nm:'Spring Rolls', price:55},
    {nm:'Salad', price:45},
    {nm:'Garlic Bread', price:40},
    {nm:'Chicken Nuggets', price:60}
  ]},
  { cat:'Drinks', items:[
    {nm:'Water', price:20},
    {nm:'Orange Juice', price:45},
    {nm:'Lemon Tea', price:40},
    {nm:'Milk', price:35},
    {nm:'Iced Tea', price:40}
  ]},
  { cat:'Desserts', items:[
    {nm:'Ice Cream', price:50},
    {nm:'Mango Sticky Rice', price:60},
    {nm:'Chocolate Cake', price:65},
    {nm:'Fruit Salad', price:50},
    {nm:'Pancakes', price:55}
  ]}
];
const MODEL_CONVERSATION = [
  {who:'a', label:'Student A', text:'Hi.'},
  {who:'b', label:'Student B', text:'Hi.'},
  {who:'w', label:'Student C (Waiter)', text:'Hello. Welcome to Sunny Café. Here are your menus.'},
  {who:'a', label:'Student A', text:'Thank you.'},
  {who:'b', label:'Student B', text:'What do you like?'},
  {who:'a', label:'Student A', text:'I like fried rice. What about you?'},
  {who:'b', label:'Student B', text:'I like noodles. I want chicken noodles.'},
  {who:'a', label:'Student A', text:'That sounds good.'},
  {who:'w', label:'Student C (Waiter)', text:'Are you ready to order?'},
  {who:'a', label:'Student A', text:'Yes, please.'},
  {who:'w', label:'Student C (Waiter)', text:'What would you like?'},
  {who:'a', label:'Student A', text:"I'd like fried rice, please."},
  {who:'w', label:'Student C (Waiter)', text:'And you?'},
  {who:'b', label:'Student B', text:"I'd like chicken noodles, please."},
  {who:'w', label:'Student C (Waiter)', text:'Would you like a drink?'},
  {who:'a', label:'Student A', text:"I'd like orange juice, please."},
  {who:'b', label:'Student B', text:"I'd like iced tea, please."},
  {who:'w', label:'Student C (Waiter)', text:'Would you like anything else?'},
  {who:'a', label:'Student A', text:"Yes. We'd like spring rolls, please."},
  {who:'b', label:'Student B', text:'And ice cream, please.'},
  {who:'w', label:'Student C (Waiter)', text:'Is that all?'},
  {who:'a', label:'Student A', text:'Yes, thank you.'},
  {who:'w', label:'Student C (Waiter)', text:'Thank you.'}
];
const PRACTICE_ROUNDS = [
  'Round 1: Follow the model conversation.',
  'Round 2: Choose different food from the menu.',
  'Round 3: Practice again without reading every line.'
];
const RESTAURANT_PHRASES_CUSTOMER = [
  'Hello.', 'What do you like?', 'What about you?', "I'd like ___, please.",
  'Can I have ___, please?', "I'd like a drink, please.", "That's all, thank you.", 'Thank you.'
];
const RESTAURANT_PHRASES_WAITER = [
  'Hello. Welcome.', 'Are you ready to order?', 'What would you like?', 'And you?',
  'Would you like a drink?', 'Would you like anything else?', 'Is that all?', 'Thank you.'
];

/* ===== Section 9: Restaurant Challenge (checkpoints) ===== */
const CHALLENGE_STEPS = [
  {label:'Choose', q:'What would you like?', opts:['Fried rice','Noodles','Chicken']},
  {label:'Order', q:'What would you like to drink?', opts:['Water','Juice','Soda']},
  {label:'Drink', q:'Anything else?', opts:['No, thank you.','Yes, please.']},
  {label:'Bill', q:'Ready to pay?', opts:['Can I have the bill, please?']}
];

/* ===== Section 10: Reflection ===== */
const REFLECTION_ITEMS = [
  {k:'choose', lbl:'I can choose food.'},
  {k:'talk', lbl:'I can talk about food.'},
  {k:'order', lbl:'I can order food.'},
  {k:'bill', lbl:'I can ask for the bill.'}
];
const FEELING_OPTIONS = [
  {ic:'😊', lbl:'Good'},
  {ic:'🙂', lbl:'Okay'},
  {ic:'😕', lbl:'Difficult'}
];

/* ===== Practice Lab ===== */
const LAB_FOOD_VOCAB = [
  {q:'Which word means 🍚?', opts:['Rice','Noodles','Soup'], correct:0},
  {q:'Which word means a bowl of noodles in liquid?', opts:['Salad','Soup','Beef'], correct:1},
  {q:'Which word is a green, healthy dish?', opts:['Chicken','Salad','Rice'], correct:1},
  {q:'Which word is a long, thin food?', opts:['Noodles','Beef','Soup'], correct:0}
];
const LAB_RESTAURANT_EXPR = [
  {q:'You want food. What do you say?', opts:['Can I have the bill, please?','I\'d like ___, please.','Good morning.'], correct:1},
  {q:'You finish eating. You want to pay. What do you say?', opts:['Anything else?','Can I have the bill, please?','Hello!'], correct:1},
  {q:'The server asks "Anything else?" You want nothing more. What do you say?', opts:['Yes, please.','No, thank you.','How much is it?'], correct:1}
];
const LAB_LISTEN = [
  {audio:'I\'d like fried rice, please.', opts:['I\'d like fried rice.','I\'d like noodles.','I don\'t like rice.'], correct:0},
  {audio:'Can I have the bill, please?', opts:['Can I have a menu?','Can I have the bill?','Can I have water?'], correct:1},
  {audio:'Anything to drink?', opts:['Anything to eat?','Anything to drink?','Anything else?'], correct:1}
];
const LAB_SPEAK_PROMPTS = [
  {text:'Say: "I\'d like fried rice, please."'},
  {text:'Say: "Can I have the bill, please?"'},
  {text:'Tell your partner your favorite food.'}
];

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up: How Do You Choose Food?'},
  {key:'s2', label:'Food and Restaurant Words'},
  {key:'s3', label:'Listen: At the Restaurant'},
  {key:'s4', label:'How to Order Food'},
  {key:'s5', label:'Restaurant Challenge'},
  {key:'s6', label:'Speaking Task: Sunny Café'},
  {key:'practice', label:'Practice Lab'},
  {key:'s7', label:'Self-Check & Real Restaurant'},
  {key:'exit', label:'Exit Ticket'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Communication',
  courseCode: 'communication',
  unit: 'Unit 6, Cultural Studies: Food & Eating',
  unitCode: 'unit-6'
};

const STUDY_GUIDE_DATA_URI = "../../../assets/study-guide/Unit6-Food-and-Eating-Study-Guide.jpg";
const STUDY_GUIDE_FILENAME = "Unit6-Food-and-Eating-Study-Guide.jpg";

const SECTION_PHOTOS = {
  hero:       { src:'../../../assets/images/u6-hero.jpg',       alt:'A group of friends sharing a meal together at a table' },
  restaurant: { src:'../../../assets/images/u6-restaurant.jpg', alt:'A server writing down a customer\'s order in a restaurant' },
  rice:       { src:'../../../assets/images/u6-rice.jpg',       alt:'A bowl of steamed white rice' },
  noodles:    { src:'../../../assets/images/u6-noodles.jpg',    alt:'A bowl of noodles with herbs' },
  chicken:    { src:'../../../assets/images/u6-chicken.jpg',    alt:'A roasted chicken dish on a plate' },
  beef:       { src:'../../../assets/images/u6-beef.jpg',       alt:'Sliced beef with vegetables on a plate' },
  salad:      { src:'../../../assets/images/u6-salad.jpg',      alt:'A fresh green salad in a bowl' },
  soup:       { src:'../../../assets/images/u6-soup.jpg',       alt:'A bowl of Asian-style soup' }
};

/* ===================== REBUILD ADDITIONS (2026-10-23) ===================== */
const LESSON_OBJECTIVES = [
  'Say why you choose food: "I like ___ because it’s ___."',
  'Understand the waiter and the price in baht.',
  'Order food and a drink politely: "I’d like ___, please."',
  'Play the waiter: "What would you like? Anything else?"',
  'Order a whole meal in a group of 3 with no script.'
];

/* ===== Section 1 extras ===== */
const CHOOSE_FRAME_SENTENCES = ['I like rice because it’s cheap.', 'I like salad because it’s healthy.', 'I like noodles because they look good.', 'I don’t like spicy food because it’s too hot.'];
const CHOOSE_SAY = ['I choose it because I like it.', 'I choose it because it’s cheap.', 'I choose it because it’s healthy.', 'I choose it because it’s spicy.', 'I choose it because it looks good.'];
const CHOOSE_STEPS = [
  'Look at the food. Choose what is important to you.',
  'Say the sentence out loud.',
  'Tell your partner: "I like ___ because it’s ___."',
  'Ask: "What about you?" Say "Me too!" or "Why?"'
];
const CHOOSE_CHECKS = ['I chose what is important to me.', 'I told my partner with "because".', 'I asked "What about you?"'];

/* ===== Section 2: Food and Restaurant Words (quiz) ===== */
const WORDS_QUIZ = [
  {q:'It lists the food and the prices.', options:['menu','bill','table'], correct:0},
  {q:'The person who brings your food.', options:['customer','waiter','water'], correct:1},
  {q:'At the end, you ask for this to pay.', options:['order','drink','bill'], correct:2},
  {q:'You say what you want. You ___ food.', options:['order','menu','table'], correct:0}
];

/* ===== Section 3: Listen, At the Restaurant ===== */
const LISTEN_TOTAL = [
  {say:'That is eighty-five baht.', pitch:1.1, options:['85 baht','58 baht','80 baht'], correct:0},
  {say:'That is one hundred thirty baht.', pitch:0.85, options:['113 baht','130 baht','103 baht'], correct:1},
  {say:'The total is one hundred seventy baht.', pitch:1.05, options:['170 baht','107 baht','117 baht'], correct:0},
  {say:'That is forty-five baht.', pitch:0.9, options:['54 baht','45 baht','40 baht'], correct:1}
];

/* ===== Section 4: How to Order Food ===== */
const SOUND_TIPS = {
  contraction: {written:'I would like', fast:'"I’d like"', ex:'I’d like fried rice, please.', note:'In speech, "I would like" is short: "I’d like".'},
  numbers: [
    {text:'thirTEEN (13)', note:'-teen numbers: the end is strong. thir-TEEN.', say:'thirteen baht'},
    {text:'THIRty (30)', note:'-ty numbers: the start is strong. THIR-ty.', say:'thirty baht'}
  ],
  polite: {text:'Can I have the bill, please?', note:'The voice goes up at the end of a question. Say "please" with a smile.'}
};
const LADDER_MODEL = [
  'Hello. I’d like fried rice, please.',
  'I’d like orange juice, please.',
  'No, thank you. That’s all.',
  'Can I have the bill, please?'
];
const ECHO_RACE = {
  steps: [
    'Make 2 teams. Your teacher shows a food or drink picture.',
    'Team 1 says: "I’d like ___, please."',
    'Give 1 point for the right sentence and 1 point for "please".',
    'Team 2 gets the next picture. Keep going.',
    'Last round: one student from each team orders a food and a drink alone.'
  ]
};

/* ===== Section 5: Restaurant Challenge, Menu Maths ===== */
const MENU_MATHS_ROUNDS = 3;

/* ===== Section 6: Speaking Task extras ===== */
const ORDER_TASK = {
  steps: [
    'Make a group of 3. Student A and B are customers. Student C is the waiter.',
    'Use the Sunny Café menu. Look at the menu, not at paper with sentences.',
    'Customers order food and a drink. The waiter asks "What would you like?" and "Anything else?"',
    'Ask for the bill. The waiter says the total in baht. The customer says "Thank you."',
    'Round 2: change roles. Everyone is the waiter one time.'
  ]
};
const PEER_CHECKLIST = [
  'Customers ordered food and a drink.',
  'Used "I’d like ___, please" every time.',
  'The waiter asked "What would you like?" and "Anything else?"',
  'Asked for the bill: "Can I have the bill, please?"',
  'The waiter said the total in baht, and the customer understood.',
  'Said "Thank you."',
  'No script: used the menu only, eyes up.'
];

/* ===== Section 7: Self-check ===== */
const CAN_DO = [
  'I can say why I choose food: I like ___ because ___.',
  'I can name food and restaurant words.',
  'I can understand the waiter and the price.',
  'I can order food and a drink: I’d like ___, please.',
  'I can play the waiter: What would you like? Anything else?',
  'I can order a whole meal with my group, with no script.'
];
const SCALE = [
  {v:1, label:'Not yet'},
  {v:2, label:'Almost'},
  {v:3, label:'Yes!'}
];

/* Exit ticket (shared component js/exit-ticket.js): 2 questions tied to the output, a confidence rating, and an optional note. */
const EXIT_CFG = {
  "outcome": "I can order a meal in a restaurant.",
  "questions": [
    {
      "q": "You want fried rice. What do you say?",
      "options": [
        "I’d like fried rice, please.",
        "Fried rice is the bill.",
        "Anything else?"
      ],
      "correct": 0
    },
    {
      "q": "Listen. How much is it?",
      "say": "That is thirty baht.",
      "options": [
        "13 baht",
        "300 baht",
        "30 baht"
      ],
      "correct": 2
    }
  ]
};
