/* ===================== UNIT 3 CONTENT DATA =====================
   English for Wellness Tourism — Unit 3: Describing Wellness Destinations
   Sourced from the course workbook (Unit 3: Vocabulary & Expressions in
   Wellness Tourism). Nothing here is UI logic — see app.js for
   rendering/state/voice/progress-tracking. */

/* Real facilities from the Baan Sabai Wellness Resort brochure + guided-tour
   listening script. Used by both the Explore section (s1) and the Describe
   It speaking task (s6), so both reuse the same one set of facilities. */
const FACILITIES = [
  {id:'lobby', ic:'🛎️', nm:'Reception Lobby', what:'The welcome area where guests check in.', can:'Guests can ask staff for help. The team is available 24 hours a day.', words:'sanctuary, amenity', phrase:'"Our staff are available 24 hours to help you with any requests during your stay."'},
  {id:'garden', ic:'🌳', nm:'Wellness Garden', what:'A peaceful outdoor space with tropical plants and water features.', can:'Guests can relax and enjoy nature in the quiet seating areas.', words:'serene, sanctuary', phrase:'"Our wellness garden is a peaceful outdoor space, perfect for guests who want to relax and enjoy nature."'},
  {id:'spa', ic:'💆', nm:'Spa & Treatment Center', what:'A full-service spa with over 25 different wellness treatments.', can:'Guests can book a traditional Thai massage, herbal compress therapy, or aromatherapy, all performed by certified therapists in private rooms.', words:'herbal therapy, aromatherapy, holistic center', phrase:'"We offer over 25 different wellness treatments, all performed by certified therapists."'},
  {id:'restaurant', ic:'🍽️', nm:'Wellness Restaurant', what:'A restaurant serving nutritious Thai and international cuisine.', can:'Guests can enjoy meals made with fresh, organic ingredients. Vegetarian, vegan, and gluten-free options are available.', words:'organic, wellness retreat', phrase:'"Our wellness restaurant serves fresh, organic dishes, and we cater to all dietary needs."'},
  {id:'yoga', ic:'🧘', nm:'Yoga &amp; Meditation Pavilion', what:'An open-air pavilion surrounded by lush gardens.', can:'Guests can join morning yoga or evening guided meditation sessions here.', words:'meditation, revitalize', phrase:'"This area is perfect for guests who want to start or end their day feeling calm and revitalized."'},
  {id:'fitness', ic:'🏊', nm:'Fitness Center, Pool &amp; Steam Room', what:'A fitness center, swimming pool, and steam room in the east wing.', can:'Guests can use these facilities daily from 6 a.m. to 10 p.m.', words:'wellness route, amenity', phrase:'"The fitness center, pool, and steam room are open from 6 a.m. to 10 p.m. daily."'},
  {id:'herbgarden', ic:'🌿', nm:'Herbal Garden', what:'The garden where the resort grows the plants used in its treatments.', can:'Guests can join a guided herbal garden tour every day at 9 a.m.', words:'herbal therapy, nature therapy, organic', phrase:'"Guests are welcome to join our daily herbal garden tour at 9 a.m."'}
];

/* Activity 1 — Matching (Section 2, exact 8 pairs from the workbook) */
const MATCH_PAIRS = [
  {id:'sanctuary', word:'sanctuary', meaning:'a peaceful, protected place for rest and recovery'},
  {id:'sauna', word:'sauna', meaning:'a heated room used to promote relaxation and sweating for health benefits'},
  {id:'aromatherapy', word:'aromatherapy', meaning:'the use of essential oils from plants for health and relaxation'},
  {id:'retreat', word:'wellness retreat', meaning:'a program or place dedicated to improving health and well-being'},
  {id:'serene', word:'serene', meaning:'calm, peaceful, and untroubled'},
  {id:'revitalize', word:'revitalize', meaning:'to give someone new energy and a feeling of being refreshed'},
  {id:'route', word:'wellness route', meaning:'a planned travel path visiting wellness destinations and experiences'},
  {id:'naturetherapy', word:'nature therapy', meaning:'using outdoor environments for healing and improving wellbeing'}
];

/* Full Section 1 vocabulary reference table (15 words) */
const VOCAB = [
  {w:'wellness retreat', t:'n.', d:'a program or place dedicated to improving health, relaxation, and well-being'},
  {w:'sanctuary', t:'n.', d:'a peaceful, protected place designed for rest and recovery'},
  {w:'sauna', t:'n.', d:'a heated room used to promote relaxation and sweating for health benefits'},
  {w:'hot spring', t:'n.', d:'naturally heated water from the ground, used for therapeutic bathing'},
  {w:'meditation', t:'n.', d:'the practice of focusing the mind to achieve calm and mental clarity'},
  {w:'yoga', t:'n.', d:'a practice combining physical postures, breathing exercises, and mindfulness'},
  {w:'herbal therapy', t:'n.', d:'treatment using plants and natural herbs to promote healing'},
  {w:'aromatherapy', t:'n.', d:'the use of essential oils from plants to improve health and relaxation'},
  {w:'nature therapy', t:'n.', d:'using outdoor natural environments for healing and improving wellbeing'},
  {w:'wellness route', t:'n.', d:'a planned travel path visiting wellness destinations and experiences'},
  {w:'holistic center', t:'n.', d:'a facility that treats the whole person: body, mind, and spirit'},
  {w:'amenity', t:'n.', d:"a feature or service available at a facility for guests' comfort"},
  {w:'serene', t:'adj.', d:'calm, peaceful, and untroubled, a common quality of wellness environments'},
  {w:'revitalize', t:'v.', d:'to give someone new energy, strength, or a feeling of being refreshed'},
  {w:'organic', t:'adj.', d:'produced without artificial chemicals, used to describe food and products'}
];

/* Activity 2 — Fill in the Blank (Section 2, exact 8 sentences + answers) */
const FILL_BLANK = [
  {q:'The mountain resort has a __________ atmosphere: quiet, green, and completely peaceful.', a:'serene'},
  {q:'Guests can join our daily __________ session on the outdoor terrace every morning at 7 a.m.', a:'yoga'},
  {q:'We use fresh Thai herbs in all of our __________ treatments.', a:'herbal therapy'},
  {q:'A three-day __________ can help you feel completely rested and recharged.', a:'wellness retreat'},
  {q:"The resort's swimming pool is one of its most popular __________.", a:'amenities'},
  {q:'The __________ session uses lavender and jasmine oil to promote deep relaxation.', a:'aromatherapy'},
  {q:'After the treatment, many guests say they feel completely __________, full of energy.', a:'revitalized'},
  {q:"Our __________ tour takes guests through Chiang Mai's top health and wellness destinations.", a:'wellness route'}
];

/* Section 3 — Reading: Baan Sabai Wellness Resort brochure (verbatim) */
const READING = {
  title: 'Baan Sabai Wellness Resort: Welcome Brochure',
  paragraphs: [
    'Welcome to Baan Sabai Wellness Resort, your sanctuary for the body, mind, and spirit. Nestled among lush tropical gardens in Phuket, Baan Sabai offers an unmatched wellness experience for guests seeking rest, recovery, and rejuvenation.',
    'Our resort features a full-service spa and treatment center with over 25 different wellness treatments, including traditional Thai massage, herbal compress therapy, hot stone massage, and signature aromatherapy rituals. All treatments are performed by certified therapists in beautifully designed private rooms.',
    'Start your mornings with a guided yoga session in our open-air pavilion, followed by a nourishing breakfast at our wellness restaurant, where every dish is prepared using fresh, organic, and locally sourced ingredients. Vegetarian, vegan, and gluten-free menus are available.',
    "In the afternoon, explore our herbal garden, join a mindfulness workshop, or simply relax by our serene saltwater swimming pool. Guests may also book a nature therapy walk through the resort's surrounding gardens with one of our wellness guides.",
    'Each guest at Baan Sabai begins their stay with a personal wellness consultation. Our wellness advisor will discuss your health goals, recommend appropriate treatments, and design a personalized wellness plan for your time with us.',
    'Whether you are visiting for a weekend escape or an extended wellness retreat, Baan Sabai is dedicated to providing a truly restorative experience. We look forward to welcoming you.'
  ]
};
const READING_QUESTIONS = [
  {q:'Where is Baan Sabai Wellness Resort located?', model:'It is located in Phuket, among lush tropical gardens.'},
  {q:'Name THREE types of treatment offered at the spa.', model:'Any three of: traditional Thai massage, herbal compress therapy, hot stone massage, aromatherapy rituals.'},
  {q:'What kind of food does the wellness restaurant serve?', model:'Fresh, organic, and locally sourced Thai and international food, with vegetarian, vegan, and gluten-free options.'},
  {q:'What does each guest do at the start of their stay?', model:'Each guest begins with a personal wellness consultation with a wellness advisor.'},
  {q:'Which feature of the resort would you most enjoy? Why?', model:'This is your own opinion. There is no single correct answer. Explain your choice using vocabulary from this unit.'}
];

/* Section 4 — Listening: guided tour of Baan Sabai (one guide, 7 stops) */
const LISTEN = {
  intro: 'A wellness guide leads a small group of guests on a walking tour of Baan Sabai Wellness Resort.',
  lines: [
    {who:'Guide', kind:'staff', text:'Welcome to Baan Sabai Wellness Resort. Let me take you on a tour of our beautiful facilities.'},
    {who:'Guide', kind:'staff', text:'As you enter through the main gate, you will see our reception lobby on your right. Our staff are available 24 hours to help you with any requests during your stay.'},
    {who:'Guide', kind:'staff', text:'Straight ahead, you will find our wellness garden, a peaceful outdoor space with tropical plants, water features, and quiet seating areas for guests to relax and enjoy nature.'},
    {who:'Guide', kind:'staff', text:'On your left is the spa and treatment center. We offer over 25 different treatments, all performed by certified therapists in private, beautifully designed rooms.'},
    {who:'Guide', kind:'staff', text:'Walking further in, you will pass our wellness restaurant. We serve nutritious Thai and international cuisine using fresh, organic ingredients. We cater to all dietary needs, including vegan and gluten-free options.'},
    {who:'Guide', kind:'staff', text:'Just beyond the restaurant is our yoga and meditation pavilion, an open-air space surrounded by lush gardens, perfect for morning yoga and evening guided meditation.'},
    {who:'Guide', kind:'staff', text:'In the east wing, you will find our fitness center, swimming pool, and steam room. These are available from 6 a.m. to 10 p.m. daily.'},
    {who:'Guide', kind:'staff', text:'Finally, our herbal garden at the far end of the resort is where we grow the plants used in our treatments. Guests are welcome to join our daily herbal garden tour at 9 a.m.'},
    {who:'Guide', kind:'staff', text:'We hope you enjoy your stay at Baan Sabai. Our team is here to ensure your experience is peaceful, rejuvenating, and truly memorable.'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What is available in the wellness garden?', model:'Tropical plants, water features, and quiet seating areas for guests to relax in.'},
  {q:'What hours are the fitness center and swimming pool open?', model:'From 6 a.m. to 10 p.m. daily.'},
  {q:'What tour is available for guests at 9 a.m. each day?', model:'A guided herbal garden tour.'}
];
/* "Put the tour in order" — the 7 stops as the guide describes them, used as
   a connecting-line matching activity (order heard <-> area name). */
const TOUR_ORDER = [
  {id:'stop1', stop:'Stop 1', area:'Reception Lobby'},
  {id:'stop2', stop:'Stop 2', area:'Wellness Garden'},
  {id:'stop3', stop:'Stop 3', area:'Spa &amp; Treatment Center'},
  {id:'stop4', stop:'Stop 4', area:'Wellness Restaurant'},
  {id:'stop5', stop:'Stop 5', area:'Yoga &amp; Meditation Pavilion'},
  {id:'stop6', stop:'Stop 6', area:'Fitness Center, Pool &amp; Steam Room'},
  {id:'stop7', stop:'Stop 7', area:'Herbal Garden'}
];

/* Section 6 — Describe It (speaking sentence starters, from Section 5
   "Useful phrases for guiding" + Section 6 discussion instructions) */
const DESCRIBE_STARTERS = [
  '"It is a..."',
  '"Guests can..."',
  '"It is located..."',
  '"This place is good for..."',
  '"Guests can enjoy..."'
];

/* Section 8 — final task: "My Wellness Tour" (folds the workbook's Group
   Presentation activity + "My Dream Wellness Resort" writing task into one
   plan -> short notes -> speak flow) */
const TOUR_GUIDING_PHRASES = [
  'On your left / right, you will find...',
  'Just ahead / behind us is the...',
  'This area is perfect for guests who want to...',
  'We offer... which is designed to...'
];

/* Section 9 — Reflection (Section 7 Can-Do statements, verbatim) */
const REFLECTION = [
  'I can name and describe common wellness tourism facilities in English.',
  'I can use wellness tourism vocabulary accurately in sentences.',
  'I can understand a guided tour of a wellness resort when listening.',
  'I can describe a wellness destination to a guest or colleague.'
];

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Explore The Destination'},
  {key:'s2', label:'Wellness Vocabulary'},
  {key:'s3', label:'Vocabulary In Context'},
  {key:'s4', label:'Reading: Baan Sabai'},
  {key:'s5', label:'Listen: The Guided Tour'},
  {key:'s6', label:'Describe It'},
  {key:'s7', label:'Guess The Wellness Place'},
  {key:'s8', label:'My Wellness Tour'},
  {key:'s9', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 3: Describing Wellness Destinations',
  unitCode: 'unit-3'
};

/* ===================== TAKE-HOME ASSET ===================== */
const STUDY_GUIDE_DATA_URI = "../../../assets/study-guide/Unit3-Wellness-Services-Treatments-Study-Guide.jpg";
const STUDY_GUIDE_FILENAME = "Unit3-Wellness-Services-Treatments-Study-Guide.jpg";

/* ===================== SECTION PHOTOS =====================
   Paths are relative to /courses/wellness/unit-3/index.html. Not every
   facility has a matching real photo — cards without one show icon-only,
   same conditional pattern other units already use. */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/wt-u3-hero.jpg', alt:'Aerial view of a tropical wellness resort with pools and gardens' },
  lobby: { src:'../../../assets/images/wt-u3-lobby.jpg', alt:'Wellness resort reception desk with staff greeting a guest' },
  garden: { src:'../../../assets/images/wt-u3-garden.jpg', alt:'Tropical wellness garden path at golden hour' },
  yoga: { src:'../../../assets/images/wt-u3-yoga.jpg', alt:'Open-air yoga and meditation pavilion at sunrise' }
};
