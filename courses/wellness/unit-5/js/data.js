/* ===================== UNIT 5 CONTENT DATA =====================
   English for Wellness Tourism — Unit 5: Wellness Tourism Guiding Skills
   Sourced verbatim from the course workbook. Nothing here is UI logic —
   see app.js for rendering/state/voice/progress-tracking. */

const VOCAB = [
  {w:'tour guide', t:'n.', d:'a person who leads and informs visitors about places of interest'},
  {w:'itinerary', t:'n.', d:'a detailed plan of a journey including destinations, times, and activities'},
  {w:'route', t:'n.', d:'the path or course taken during a tour or wellness journey'},
  {w:'highlight', t:'n.', d:'the most interesting, enjoyable, or memorable part of a tour'},
  {w:'commentary', t:'n.', d:'spoken information and explanation provided by a guide during a tour'},
  {w:'pace', t:'n.', d:'the speed at which a tour moves or activities are carried out'},
  {w:'landmark', t:'n.', d:'a well-known place or feature that is easy to recognize'},
  {w:'narrate', t:'v.', d:'to describe and explain what guests are seeing or experiencing'},
  {w:'engage', t:'v.', d:"to capture and maintain someone's interest and active involvement"},
  {w:'transition', t:'n.', d:'the smooth movement from one part of a tour or topic to the next'},
  {w:'escort', t:'v./n.', d:'to accompany and guide someone to a place; the person who does this'},
  {w:'scenic', t:'adj.', d:'having beautiful natural or cultural surroundings worth viewing'},
  {w:'immersive', t:'adj.', d:'creating the feeling of being completely surrounded by an experience'},
  {w:'authentic', t:'adj.', d:'genuine, real, and true to original traditions, not artificial'},
  {w:'anecdote', t:'n.', d:'a short and interesting story used to illustrate a point or entertain guests'}
];

/* Core vocabulary: the 8 words students actively practice (matching and
   fill in the blank). Everything else in VOCAB is a "Useful Word". */
const CORE_VOCAB_IDS = ['itinerary','commentary','engage','landmark','immersive','authentic','transition','scenic'];

/* Activity 1 — Matching (Section 2, exact 8 pairs) */
const MATCH_PAIRS = [
  {id:'itinerary', word:'itinerary', meaning:'a detailed plan of a journey including times and activities'},
  {id:'commentary', word:'commentary', meaning:'spoken information provided by a guide during a tour'},
  {id:'engage', word:'engage', meaning:"to capture and maintain someone's interest"},
  {id:'landmark', word:'landmark', meaning:'a well-known and easily recognisable place'},
  {id:'immersive', word:'immersive', meaning:'creating the feeling of being surrounded by an experience'},
  {id:'authentic', word:'authentic', meaning:'genuine and true to original traditions'},
  {id:'transition', word:'transition', meaning:'moving smoothly from one topic or location to the next'},
  {id:'scenic', word:'scenic', meaning:'having beautiful natural or cultural surroundings'}
];

/* Activity 2 — Fill in the Blank (exact 8 sentences) */
const FILL_BLANK = [
  {q:"The tour guide gave a fascinating __________ about the history of Thai herbal medicine and its use in wellness treatments.", a:'commentary'},
  {q:'Our wellness __________ through Phuket visits five different health and relaxation destinations over two days.', a:'route'},
  {q:'A great guide knows how to __________ guests by asking questions and sharing interesting local stories.', a:'engage'},
  {q:'The meditation session in the mountain pavilion was truly __________. Guests said they forgot they were in a resort.', a:'immersive'},
  {q:'The itinerary includes a morning yoga session, an herbal treatment, and an afternoon __________ walk through the hills.', a:'scenic'},
  {q:'Please wait at the main gate and our guide will __________ you to the wellness garden for the start of the tour.', a:'escort'},
  {q:'The ancient banyan tree at the center of the resort has become an iconic __________ that guests always remember.', a:'landmark'},
  {q:'We try to make every tour feel __________ by using real Thai herbs, traditional techniques, and local stories.', a:'authentic'}
];

/* Activity 3 — Useful Guiding Phrases (study + "top 3" selection activity) */
const GUIDING_PHRASES = [
  'Follow me as we make our way to...',
  'Take a moment to look around you...',
  'Notice the... on your left / right.',
  'What you are seeing here is...',
  'This place is special because...',
  'An interesting fact about this is...',
  'I would like to share a quick story about...',
  'Before we move on, are there any questions?',
  'Let us now make our way towards...'
];

/* Section 3 — Reading: Sample Commentary, Old Town Phuket Wellness Route */
const READING = {
  title: 'Sample Commentary: Old Town Phuket Wellness Route',
  stops: [
    {name: "STOP 1: Phuket's Healing Herb Garden", paragraphs: [
      "Welcome, everyone, to the first stop on our wellness journey: Phuket's Healing Herb Garden. This garden has been here for over 30 years and features more than 150 different medicinal plants native to southern Thailand.",
      'Notice the fragrance as we walk in. That refreshing, slightly minty scent comes from the bai toey, or pandan leaves, on your left. Pandan has been used in Thai traditional medicine for centuries to calm the nervous system and improve sleep quality. Our wellness restaurant also uses it to flavour herbal teas and desserts.',
      "Just ahead, you will see the galangal plants, the tall ones with the distinctive ginger-like roots. Galangal, or kha in Thai, is one of the main ingredients in herbal compress massage, which we will experience at our next stop. (Guiding phrase: 'Please follow me as we make our way through the garden...')"
    ]},
    {name: 'STOP 2: The Traditional Thai Therapy Center', paragraphs: [
      'We have arrived at the Traditional Thai Therapy Center, just a three-minute walk from the herb garden. This center has trained certified Thai massage therapists for over 25 years, following authentic ancient Thai medical traditions.',
      "As you step inside, notice how the space feels different: cooler, quieter, and filled with the warm scent of lemongrass and kaffir lime. This is intentional. The environment is carefully designed to help your body and mind begin to relax before the treatment even starts. (Guiding phrase: 'Take a moment to breathe in this space. What do you notice?')",
      'For guests who have booked a treatment today, please proceed to the reception counter on your right. For those who are observing, you are welcome to sit in our herbal tea lounge while I continue with the commentary.'
    ]},
    {name: 'STOP 3: The Meditation Pavilion', paragraphs: [
      'And now, my personal favorite stop: the Meditation Pavilion. Please take a moment to look around you. The pavilion faces east to catch the early morning light, and on a clear evening, the sky turns the most extraordinary shades of gold and pink at sunset.',
      "Guided meditation takes place here every morning at 6:30 and every evening at 7:00. Many guests tell me this becomes the highlight of their entire wellness stay, not a treatment or a pool, but simply sitting quietly in this space. (Guiding phrase: 'I would encourage all of you to join at least one session during your stay.')"
    ]}
  ],
  closing: 'Thank you for joining me on today\'s wellness route. I hope it has given you a sense of what wellness tourism truly means: not just treatments and relaxation, but a genuine connection with the healing traditions of Thailand. Please feel free to ask me anything at any time during your stay. I am always here to help make your wellness journey as meaningful as possible.'
};
const READING_QUESTIONS = [
  {q:'What is pandan (bai toey) used for in Thai traditional medicine?', model:'It is used to calm the nervous system and improve sleep quality, and to flavour herbal teas and desserts.'},
  {q:'Why is the environment inside the therapy center designed the way it is?', model:"It is designed to feel cooler, quieter, and fragrant, to help guests' bodies and minds begin to relax before treatment starts."},
  {q:'Find ONE guiding phrase used in the script and write it below.', model:'Any one of: "Please follow me as we make our way through the garden...", "Take a moment to breathe in this space. What do you notice?", "I would encourage all of you to join at least one session during your stay."'},
  {q:"What does the guide say is often the highlight of guests' wellness stays?", model:'Simply sitting quietly in the Meditation Pavilion, not a treatment or a pool.'},
  {q:'Which stop on the route would you most like to guide guests through? Why?', model:'This is your own opinion. There is no single correct answer. Explain your choice using vocabulary from this unit.'}
];
/* Activity 5 — Identify the Technique (exact sentences from the script) */
const TECHNIQUES = [
  {label:'An interesting fact', text:'This center has trained certified Thai massage therapists for over 25 years, following authentic ancient Thai medical traditions.'},
  {label:'An invitation to notice something', text:'Notice the fragrance as we walk in. That refreshing, slightly minty scent comes from the bai toey, or pandan leaves, on your left.'},
  {label:'A personal recommendation', text:'I would encourage all of you to join at least one session during your stay.'},
  {label:'An invitation for questions or interaction', text:'Take a moment to breathe in this space. What do you notice?'}
];

/* Section 4 — Listening: A Wellness Guide at Work — Baan Sabai Resort */
const LISTEN = {
  intro: 'Nook, a wellness guide at Baan Sabai Resort, leads four tourists through the resort grounds.',
  lines: [
    {who:'Nook', kind:'staff', text:'Good morning, everyone! My name is Nook, and I will be your wellness guide during your stay here at Baan Sabai. Are you ready to begin?'},
    {who:'Tourist 1', kind:'delegate', text:'Yes! We are very excited.'},
    {who:'Nook', kind:'staff', text:'Wonderful! Please feel free to ask me anything at any time. This is your tour and I want it to be as enjoyable as possible.'},
    {who:'Nook', kind:'staff', text:'Let us start right here in our Wellness Garden. As you can see, it is filled with tropical plants, water features, and hundreds of orchids. We designed this space for guests to slow down and reconnect with nature. Many guests come here each morning simply to sit quietly and breathe fresh air.'},
    {who:'Tourist 2', kind:'delegate', text:'What is that tree with the purple flowers?'},
    {who:'Nook', kind:'staff', text:'Excellent question! That is a jacaranda tree. It has been here since the resort first opened 15 years ago. It blooms every year in this season and has become one of our most beloved landmarks. Guests love to take photographs here.'},
    {who:'Nook', kind:'staff', text:'Now, let us move towards the spa and treatment center. Please follow me along this shaded walkway, and notice how the air becomes cooler and more peaceful as we approach.'},
    {who:'Nook', kind:'staff', text:'Here we are! Our spa offers 25 different treatments, all using natural ingredients, many grown right here in our herbal garden. I strongly recommend booking at least 24 hours in advance for popular treatments like the herbal compress and traditional Thai massage.'},
    {who:'Tourist 3', kind:'delegate', text:'Can we book a treatment today even though we just arrived?'},
    {who:'Nook', kind:'staff', text:'Absolutely! Same-day bookings are welcome, just visit the reception desk and they will do their very best to accommodate you. The front desk opens at 7 a.m. and our last treatment appointment is at 8 p.m.'},
    {who:'Nook', kind:'staff', text:'And finally, my personal favorite, the Meditation Pavilion. (pausing) Take a moment to breathe in this space. The pavilion faces east to welcome the morning light, and at sunset, the view here is truly extraordinary.'},
    {who:'Nook', kind:'staff', text:'We hold guided meditation every morning at 6:30 and every evening at 7. I encourage you all to join at least once. Many guests tell me it becomes the highlight of their entire stay.'},
    {who:'Tourist 4', kind:'delegate', text:'What if someone has never meditated before?'},
    {who:'Nook', kind:'staff', text:'That is the perfect reason to come! Our sessions are led by a certified mindfulness instructor and are completely beginner-friendly. All you need to do is arrive, sit comfortably, and breathe. The rest will take care of itself. I look forward to seeing you there.'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does the guide say guests often do in the Wellness Garden each morning?', model:'Many guests come here each morning simply to sit quietly and breathe fresh air.'},
  {q:'What is special about the jacaranda tree?', model:'It has been there since the resort opened 15 years ago and has become one of the most beloved landmarks.'},
  {q:'When does guided meditation take place? (Give both times)', model:'Every morning at 6:30 and every evening at 7.'}
];

/* Section 6 — "Be The Tour Guide" main interactive: 5 stops, each with a
   guiding phrase AND a guest question the student must answer as the guide —
   real tour guiding is an interaction, not a memorized speech.
   bestAs is used by the Section 7 "Build the Wellness Tour" sequencing game
   below to give position feedback: 'opening' stops are calm and welcoming,
   'closing' stops are memorable highlights, 'flexible' works well anywhere
   in the middle. */
const TOUR_STOPS = [
  {id:'garden', ic:'🌳', nm:'Wellness Garden', info:'This garden features tropical plants, orchids, and quiet seating for guests to relax and reconnect with nature.', phrase:'"Take a moment to look around you. Notice the tropical plants and the sound of water nearby."', guestQ:'"What is this place?"', modelA:'"This is our wellness garden, a peaceful space where guests can relax and enjoy nature, especially in the morning."', bestAs:'opening'},
  {id:'therapy', ic:'💆', nm:'Traditional Thai Therapy Center', info:'Certified therapists have offered traditional Thai massage and herbal compress therapy here for over 25 years.', phrase:'"Notice how the air becomes cooler and more peaceful as we approach."', guestQ:'"What can we do here?"', modelA:'"Guests can book a traditional Thai massage or herbal compress therapy. Treatments usually take 60 to 90 minutes."', bestAs:'flexible'},
  {id:'meditation', ic:'🧘', nm:'Meditation Pavilion', info:"This is many guides' personal favorite stop. Guided meditation happens here every morning and evening.", phrase:'"I would encourage all of you to join at least one session during your stay."', guestQ:'"How long does it take?"', modelA:'"A guided session usually lasts about 30 minutes, but you are welcome to stay longer and simply enjoy the quiet."', bestAs:'closing'},
  {id:'herbgarden', ic:'🌿', nm:'Herbal Garden', info:'This is where the resort grows the plants used in its treatments: over 150 different medicinal plants.', phrase:'"Notice the fragrance as we walk in. That scent comes from fresh Thai herbs."', guestQ:'"Can we come back later?"', modelA:'"Of course. The herbal garden tour runs daily at 9 a.m., so you are always welcome to join again."', bestAs:'flexible'},
  {id:'restaurant', ic:'🍽️', nm:'Wellness Restaurant', info:'The restaurant serves fresh, organic Thai and international dishes, including herbal teas grown on-site.', phrase:'"This place is special because every dish uses ingredients grown right here at the resort."', guestQ:'"What do you recommend?"', modelA:'"I recommend trying our herbal tea. It is made from herbs grown right here in the garden you just saw."', bestAs:'flexible'},
  {id:'beach', ic:'🏝️', nm:'Wellness Beach', info:'A quiet stretch of private beach used for sunrise yoga, walking meditation, and simply relaxing by the water.', phrase:'"Notice how different the pace feels here, right by the water."', guestQ:'"Is this open all day?"', modelA:'"Yes, the beach is open all day, though we recommend sunrise for the yoga sessions, it is the most peaceful time."', bestAs:'flexible'}
];

/* Section 7 — "Build the Wellness Tour" (signature game): students choose
   3 of the stops above and arrange them into a logical order, each with a
   guiding task, before performing the full tour in Section 8. */
const TOUR_TASKS = [
  {n:1, label:'Introduce the place'},
  {n:2, label:'Give one interesting fact'},
  {n:3, label:'Invite guest interaction'}
];

/* Section 7 — final task: "My Wellness Tour" (3-stop tour, from the
   workbook's Mini Wellness Tour group activity + writing task) */
const OPENING_LINE_HINT = 'e.g. "Welcome, everyone! My name is... and I will be your guide today."';

/* Section 8 — Reflection (Section 7 Can-Do statements, verbatim) */
const REFLECTION = [
  'I can use guiding language to describe a wellness attraction or facility in English.',
  'I can share an interesting fact, anecdote, or recommendation during a tour.',
  'I can manage the pace and flow of a short guided wellness experience.',
  'I can invite guest interaction and answer questions during a tour.'
];

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Guiding Vocabulary'},
  {key:'s2', label:'Vocabulary In Context'},
  {key:'s3', label:'Guiding Phrases'},
  {key:'s4', label:'Reading: Sample Route'},
  {key:'s5', label:'Listen: The Guide At Work'},
  {key:'s6', label:'Be The Tour Guide'},
  {key:'s6b', label:'Build the Wellness Tour'},
  {key:'s7', label:'My Wellness Tour'},
  {key:'s8', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 5: Wellness Tourism Guiding',
  unitCode: 'unit-5'
};

/* ===================== TAKE-HOME ASSET ===================== */
const STUDY_GUIDE_DATA_URI = "../../../assets/study-guide/Unit5-Wellness-Tourism-Guiding-Study-Guide.jpg";
const STUDY_GUIDE_FILENAME = "Unit5-Wellness-Tourism-Guiding-Study-Guide.jpg";

/* ===================== SECTION PHOTOS =====================
   Paths are relative to /courses/wellness/unit-5/index.html. */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/wt-u5-hero.jpg', alt:'A wellness tour guide leading a small group of guests through a garden' },
  tour1: { src:'../../../assets/images/wt-u5-tour1.jpg', alt:'A tour guide walking with guests at sunset' },
  tour2: { src:'../../../assets/images/wt-u5-tour2.jpg', alt:'A tour guide gesturing while describing something to guests' }
};
