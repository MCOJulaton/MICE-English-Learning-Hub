/* ===================== THE WELLNESS GUEST JOURNEY: CONTENT DATA =====================
   An integrated Wellness Tourism unit. Students follow one guest through a full
   visit to a fictional resort, Harmony Wellness Resort, using the major
   communication skills from Units 3-6 (customer service, guiding, reservations)
   inside one connected story instead of four separate mini-lessons.

   Every section is written to stand on its own: a student arriving late can
   look at the current screen, join a group, and take part without needing
   the earlier 30-45 minutes. Nothing here is UI logic, see app.js for
   rendering, state, voice, and progress tracking. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s0', label:'Welcome to Harmony Wellness Resort'},
  {key:'s0b', label:'What Would You Do?'},
  {key:'s1', label:'Mission 1: Take Care of the Guest'},
  {key:'s1game', label:'Guest Service Challenge'},
  {key:'s1speak', label:'Now You Say It'},
  {key:'s2', label:'Mission 2: Guide the Guest'},
  {key:'s2game', label:'Build the Wellness Tour'},
  {key:'s2speak', label:'Be the Wellness Guide'},
  {key:'s3', label:'Mission 3: Manage the Reservation'},
  {key:'s3game', label:'Spa Booking Challenge'},
  {key:'s3speak', label:'Reservation Problem: Role-Play'},
  {key:'s4', label:'Final Challenge: Take Care of Your Guest'},
  {key:'s5', label:'Reflection'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 0: Warm-Up: Welcome to Harmony Wellness Resort =====
   Fully self-contained: works whether it is 8:30 or 9:00. */
const WARMUP_INTRO = 'You are working at Harmony Wellness Resort today. A guest is arriving soon.';
const WARMUP_QUESTION = 'What do you think a wellness guest needs most?';
const WARMUP_CARDS = [
  {id:'stay', label:'Comfortable accommodation'},
  {id:'service', label:'Friendly service'},
  {id:'activities', label:'Wellness activities'},
  {id:'food', label:'Healthy food'},
  {id:'spa', label:'Spa treatments'},
  {id:'info', label:'Information and directions'},
  {id:'booking', label:'Help with reservations'}
];
const WARMUP_SUPPORT = [
  'I think ___ is important because...',
  'For me, ___ is important.',
  'I agree.',
  "I don't agree because..."
];

/* ===== Section 0b: Warm-Up 2: What Would You Do? =====
   The transition into the guest journey story. */
const ARRIVAL_SCENARIO = {
  facts: [
    'A guest arrives at the resort.',
    'They look tired.',
    "They don't know where to go.",
    'They have a reservation for a wellness treatment.'
  ],
  question: 'What should you do first?',
  options: [
    {text:'Ignore the guest until they ask for help.', correct:false},
    {text:'Welcome the guest and ask how you can help.', correct:true},
    {text:'Tell the guest to find the reception desk.', correct:false}
  ],
  why: 'A good first step is always to welcome the guest yourself and offer help directly, not to walk away or send them somewhere else.',
  speakPrompt: 'What would you say to this guest? Try it in simple English before you look at the phrases below.',
  usefulPhrases: ['Hello. Welcome.', 'How can I help you?', 'Do you have a reservation?']
};

/* ===== Mission 1: Take Care of the Guest (Units 3-4 territory) ===== */
const MISSION1_RECAP = 'The guest has checked in. Now something has gone wrong.';
const MISSION1_SCENARIO = {
  situation: 'The guest booked a wellness treatment for 2:00 p.m., but the treatment is delayed.',
  question: 'What would you do?',
  speakQuestion: 'What would you say to the guest?',
  options: [
    {text:'"You have to wait."', correct:false},
    {text:'"I\'m sorry for the delay. Let me check that for you."', correct:true},
    {text:'"It is not my problem."', correct:false}
  ],
  why: 'A short apology plus a clear next step (checking on it) is what turns a delay into a manageable moment for the guest.'
};
const MISSION1_KEY_IDEAS = [
  'Welcome the guest first, before anything else.',
  'Listen carefully to what they actually need.',
  'Show empathy. A delay is frustrating, say so.',
  'Apologize, briefly and sincerely.',
  'Offer a solution, not just an apology.',
  'Follow up so the guest knows you kept your word.'
];
const MISSION1_PHRASES = [
  "I'm sorry about the delay.",
  'Let me check that for you.',
  'I completely understand.',
  'Would you like me to...?',
  "I'll take care of that right away.",
  "I'll let you know as soon as it's ready."
];

/* ===== Guest Service Challenge (Mission 1 signature game) =====
   5 scored rounds. The correct answer is the professional, empathetic
   response, not simply the most grammatically correct sentence. */
const GUEST_ROUNDS = [
  {
    id:'room', skill:'Apology & Offering a Solution',
    guest: "Hi, I'm checking in, but you said my room might not be ready yet?",
    options: [
      {text:'"Rooms are never ready on time here."'},
      {text:'"I\'m sorry, your room needs a little more time. Would you like to relax in our lounge while you wait?"', correct:true},
      {text:'"That\'s not my department."'}
    ],
    why: 'A short apology plus an easy alternative (the lounge) keeps the guest comfortable while they wait.'
  },
  {
    id:'spa', skill:'Apology & Checking Information',
    guest: 'My spa treatment was supposed to start ten minutes ago.',
    options: [
      {text:'"I apologize for the wait. Let me check with the therapist right now."', correct:true},
      {text:'"You\'ll have to wait longer, I\'m sure."'},
      {text:'"Maybe you came at the wrong time."'}
    ],
    why: 'Apologize, then act. Checking right away shows the guest you are taking it seriously.'
  },
  {
    id:'yoga', skill:'Offering Help',
    guest: "Excuse me, I can't find the yoga studio anywhere.",
    options: [
      {text:'"It\'s over there somewhere."'},
      {text:'"Of course, let me show you the way. It\'s just past the Wellness Garden."', correct:true},
      {text:'"You should have asked at reception."'}
    ],
    why: 'Offering to walk the guest there, or at least giving a clear landmark, is far more helpful than a vague gesture.'
  },
  {
    id:'request', skill:'Active Listening',
    guest: 'Could I request a quiet room, away from the pool area?',
    options: [
      {text:'"I\'ll do my best to arrange that for you."', correct:true},
      {text:'"That\'s a strange request."'},
      {text:'"We can\'t do that."'}
    ],
    why: 'Even if you cannot promise it instantly, acknowledging the request and offering to try keeps the guest heard.'
  },
  {
    id:'towels', skill:'Empathy & Follow-Up',
    guest: "Honestly, the towels in my room weren't very clean.",
    options: [
      {text:'"I\'m very sorry to hear that. I\'ll have fresh towels sent up right away."', correct:true},
      {text:'"That\'s unusual, we always clean them."'},
      {text:'"I\'ll mention it to someone."'}
    ],
    why: 'Apologize, then give a specific action and a timeframe. "I\'ll mention it" promises nothing.'
  }
];

/* ===== Now You Say It (Mission 1 speaking follow-up) =====
   A genuine pair speaking task, not another quiz: students respond as
   staff in real time instead of choosing from options. */
const NOW_YOU_SAY_IT = {
  timeEstimate: '10 to 15 minutes',
  challenge: 'Try to respond without reading a full script.',
  problems: [
    'The room is not ready.',
    'The guest cannot find the yoga studio.',
    'A massage appointment is delayed.',
    'A special request was not communicated.',
    'The guest needs help finding a wellness facility.',
    'The guest is unhappy because they have been waiting.'
  ],
  selfCheck: [
    'Welcomed the guest politely?',
    'Showed understanding?',
    'Offered a solution?',
    "Checked if the guest was satisfied?"
  ]
};

/* ===== Mission 2: Guide the Guest (Unit 5 territory) ===== */
const MISSION2_RECAP = 'The guest is happy with your service. Now they want to explore the resort.';
const RESORT_MAP = [
  {id:'reception', nm:'Reception'},
  {id:'garden', nm:'Wellness Garden'},
  {id:'thai', nm:'Thai Massage Centre'},
  {id:'meditation', nm:'Meditation Pavilion'},
  {id:'cafe', nm:'Healthy Café'}
];
const MISSION2_PROMPTS = [
  'Where should we go first?',
  'Where should we go next?',
  'How would you introduce this place to the guest?'
];
const GUIDING_PHRASES = [
  'Welcome to...',
  'This is...',
  'Here you can...',
  'On your left...',
  'On your right...',
  "Let's go to...",
  'Would you like to...?',
  'Do you have any questions?'
];

/* ===== Build the Wellness Tour (Mission 2 signature game) =====
   Reuses the sequencing mechanic: students choose 3 stops, in order, then
   get feedback on whether the sequence works as a tour. */
const TOUR_STOPS = [
  {id:'garden', nm:'Wellness Garden', bestAs:'opening'},
  {id:'thai', nm:'Thai Massage Centre', bestAs:'flexible'},
  {id:'meditation', nm:'Meditation Pavilion', bestAs:'closing'},
  {id:'cafe', nm:'Healthy Café', bestAs:'flexible'},
  {id:'herbgarden', nm:'Herbal Garden', bestAs:'flexible'},
  {id:'beach', nm:'Wellness Beach', bestAs:'flexible'}
];
const TOUR_TASKS = [
  {n:1, label:'Introduce the place'},
  {n:2, label:'Give one interesting fact'},
  {n:3, label:'Invite guest interaction'}
];

/* ===== Be the Wellness Guide (Mission 2 speaking follow-up) =====
   Students use the tour they just built (or the full stop list, for a
   late arrival who has not built one yet) to guide a partner out loud. */
const BE_THE_GUIDE = {
  timeEstimate: '10 to 15 minutes',
  extraPhrases: [
    "Next, we'll visit...",
    'This area is special because...',
    'Have you tried...?'
  ],
  selfCheck: [
    'Gave clear directions?',
    'Explained the place?',
    'Spoke clearly?',
    'Invited the guest to interact?'
  ]
};

/* ===== Mission 3: Manage the Reservation (Unit 6 territory) =====
   Same fictional spa the students already know from Unit 6, so the
   story stays connected across the course. */
const MISSION3_RECAP = 'The guest enjoyed the tour and now wants to book a treatment.';
const SPA_MENU = [
  {id:'thai', name:'Thai Massage', duration:'90 min', price:'2,200 baht'},
  {id:'swedish', name:'Swedish Massage', duration:'90 min', price:'2,600 baht'},
  {id:'compress', name:'Herbal Compress', duration:'90 min', price:'2,400 baht'},
  {id:'aroma', name:'Aromatherapy', duration:'60 min', price:'1,800 baht'},
  {id:'yoga', name:'Yoga Session', duration:'60 min', price:'900 baht'}
];
const SPA_SCHEDULE = [
  {time:'9:00', status:'available'},
  {time:'10:30', status:'booked'},
  {time:'12:00', status:'available'},
  {time:'2:00', status:'available'},
  {time:'3:30', status:'booked'},
  {time:'5:00', status:'available'}
];
const SPA_GUEST_REQUEST = "Hi, I'd like to book a Thai massage for two people on Saturday afternoon.";
const BOOKING_STEPS = [
  {id:'service', prompt:'What service is the guest asking for?',
    options:[{t:'Thai Massage', correct:true},{t:'Swedish Massage'},{t:'Aromatherapy'}]},
  {id:'count', prompt:'How many guests need to be booked?',
    options:[{t:'One guest'},{t:'Two guests', correct:true},{t:'A group of four'}]},
  {id:'time', prompt:'The guest wants Saturday afternoon. Which time should you offer?',
    options:[{t:'3:30 p.m.'},{t:'2:00 p.m.', correct:true},{t:'10:30 a.m.'}]},
  {id:'ask', prompt:"How should you ask for the guest's name and a contact number?",
    options:[
      {t:'"May I have your name and a contact number, please?"', correct:true},
      {t:'"What\'s your name and number?"'},
      {t:'"Name and number."'}
    ]},
  {id:'special', prompt:'What should you check before you confirm the booking?',
    options:[
      {t:'"Do you have any allergies or preferences we should know about?"', correct:true},
      {t:'Nothing, just confirm the booking.'},
      {t:'"What is your favorite color?"'}
    ]}
];

/* Reservation problem: a second guest calls right after the first booking,
   so 2:00 p.m. really is gone now, no contradiction with the schedule above. */
const RESERVATION_PROBLEM = {
  setup: 'Later that day, another guest calls. "I\'d like to book a Swedish massage at 2:00 p.m." But 2:00 p.m. is now fully booked, the first guest just took it.',
  question: 'What can you say?',
  usefulPhrases: [
    "I'm sorry, we're fully booked at 2:00.",
    'We have 5:00 available.',
    'Would that be okay?'
  ]
};

/* ===== Spa Booking Challenge (Mission 3 signature game) =====
   5 scored challenge scenarios, same CHECK -> ASK -> FIND -> SUGGEST ->
   CONFIRM logic as the workplace booking simulation students already know. */
const SPA_CHALLENGES = [
  {tag:'Challenge 1', guest:'"Actually, could we come at 3:30 instead? That works much better for us."',
    options:[
      {t:'"I\'m sorry, that time is fully booked. May I suggest 5:00, or would you like to join our waitlist?"', correct:true},
      {t:'"Sorry, no."'},
      {t:'"That time is not possible."'}
    ],
    why:'3:30 is already booked. The professional response offers an alternative time or a waitlist spot, politely.'},
  {tag:'Challenge 2', guest:'"I am so sorry, but something has come up. Can we cancel our booking?"',
    options:[
      {t:'"Of course, I can process that cancellation for you right away."', correct:true},
      {t:'"Why do you want to cancel?"'},
      {t:'"You cannot cancel now."'}
    ],
    why:'A polite, immediate response is the professional way to handle a cancellation request.'},
  {tag:'Challenge 3', guest:'"Could we move our appointment to 5:00 instead of 2:00?"',
    options:[
      {t:'"Let me check availability for 5:00... Yes, that time is open. I will update your booking right away."', correct:true},
      {t:'"No, the time is fixed once it is booked."'},
      {t:'"Sure, I will just change it." (without checking the schedule)'}
    ],
    why:'Always check availability on the schedule before confirming a time change.'},
  {tag:'Challenge 4', guest:'"If 3:30 opens up, could you let us know?"',
    options:[
      {t:'"Of course. I have added you to our waitlist. We will contact you immediately if a spot becomes available."', correct:true},
      {t:'"We don\'t offer that."'},
      {t:'"Just call back later and check."'}
    ],
    why:'Offering the waitlist and confirming a follow-up is the professional way to handle a fully booked time.'},
  {tag:'Challenge 5', guest:'"One more thing, I am allergic to nut-based oils."',
    options:[
      {t:'"Thank you for letting me know. I will note that and make sure only nut-free oil is used."', correct:true},
      {t:'"That should be fine, don\'t worry about it."'},
      {t:'(say nothing and move on)'}
    ],
    why:'A guest\'s special requirement must always be acknowledged and noted, never ignored.'}
];

/* ===== Reservation Problem: Role-Play (Mission 3 speaking follow-up) =====
   A full pair role-play, not the reveal-style scenario earlier in Mission 3.
   Students negotiate a real solution instead of reading a model answer. */
const RESERVATION_ROLEPLAY = {
  timeEstimate: '10 to 15 minutes',
  baseSituation: 'The guest wants a 2:00 p.m. massage, but 2:00 p.m. is fully booked.',
  steps: [
    'Apologize and politely explain the problem.',
    'Offer an alternative.',
    'Ask if the alternative is acceptable.',
    'Confirm the final booking.'
  ],
  examplePhrases: [
    "I'm sorry, but 2:00 p.m. is fully booked.",
    'We have 5:00 p.m. available. Would that work for you?',
    'Great. Let me confirm your appointment.'
  ],
  variations: [
    'The guest thinks the alternative time is too late.',
    'The guest wants two people, but only one appointment is available.',
    'The guest has a special requirement.',
    'The guest wants to change an existing reservation.'
  ]
};

/* ===== Final Integrated Challenge =====
   Groups of 3-4. No full script is given, only the situation, the goal,
   useful language, and the six-step journey the group must complete. */
const FINAL_CHALLENGE = {
  intro: 'You are now working as a wellness resort team. Your guest has arrived and needs assistance. Your team must guide the guest through the complete wellness journey.',
  situation: 'A guest named Jordan arrives at Harmony Wellness Resort after a long flight. Jordan looks tired and is not sure where to go. Jordan has a spa reservation later this afternoon.',
  goal: 'As a team, complete the whole guest journey. Welcome Jordan, find out what Jordan needs, solve any problem, guide Jordan around the resort, recommend a short tour, and confirm a booking.',
  flow: ['WELCOME', 'UNDERSTAND', 'HELP', 'GUIDE', 'RECOMMEND', 'BOOK'],
  usefulLanguage: [
    'Hello, welcome to Harmony Wellness Resort.',
    'How can I help you today?',
    "I'm sorry about that. Let me check for you.",
    "Let's start with the Wellness Garden.",
    'Would you like to join a short tour before your treatment?',
    'Let me check our availability for you.',
    'Your appointment is confirmed.'
  ],
  roles: {
    a:{title:'Role Card A: Wellness Guest', body:'You are Jordan. You just arrived, you are tired, and you are not sure where to go. You have a spa reservation later today.'},
    b:{title:'Role Card B: Wellness Guide / Staff', body:'You welcome Jordan, find out what Jordan needs, solve any problem, then guide Jordan around the resort.'},
    c:{title:'Role Card C: Wellness Receptionist', body:'You help Jordan confirm or adjust the spa booking, checking the schedule and any special requests.'},
    d:{title:'Role Card D (optional): Second Guest or Staff Member', body:'If your group has 4 students, add a second guest joining Jordan, or a second staff member helping with the tour or the booking.'}
  },
  prepTime: '8 to 10 minutes to prepare. About 3 to 4 minutes to perform.'
};

/* Surprise Problem Cards: each group draws ONE unexpected problem once
   the team has planned its journey, so they must analyze and respond in
   the moment rather than rehearse a fixed script. Bloom's: analyze,
   evaluate, create. */
const SURPRISE_CARDS = [
  {id:'a', text:'The guest wants to change their spa appointment from 2:00 p.m. to 5:00 p.m.'},
  {id:'b', text:'The guest says they are allergic to nut-based oils.'},
  {id:'c', text:'The guest wants a quiet wellness activity before their treatment.'},
  {id:'d', text:"The guest's friend wants to join the treatment, but only one appointment is available."},
  {id:'e', text:'The guest cannot find the wellness center and is becoming frustrated.'},
  {id:'f', text:'The guest wants a different wellness treatment after hearing the recommendation.'}
];

/* Wellness Supervisor Check: for the audience while another group
   performs, so watching students still have a meaningful task. Kept
   simple and focused on communication and task completion, not grammar. */
const SUPERVISOR_CHECK = [
  'Welcomed the guest professionally',
  "Understood the guest's needs",
  'Solved the problem',
  'Gave clear guidance',
  'Recommended an appropriate wellness activity or service',
  'Handled the reservation correctly',
  'Communicated politely and naturally'
];

/* ===== Reflection ===== */
const REFLECTION_QUESTIONS = [
  'What part of the wellness guest journey was easiest for you?',
  'What part was most difficult?',
  "How did you solve the guest's problem?",
  'What English expression did you use successfully?',
  'What would you improve next time?'
];
const EXIT_TICKET_PROMPT = 'Today, I can now';

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'The Wellness Guest Journey',
  unitCode: 'guest-journey'
};
