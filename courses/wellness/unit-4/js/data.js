/* ===================== UNIT 4 CONTENT DATA =====================
   English for Wellness Tourism — Unit 4: Customer Service in Wellness Tourism
   Sourced verbatim from the course workbook. Nothing here is UI logic —
   see app.js for rendering/state/voice/progress-tracking. */

const VOCAB = [
  {w:'hospitality', t:'n.', d:'the friendly, warm, and generous treatment of guests'},
  {w:'greeting', t:'n.', d:"the words or actions used to welcome someone on their arrival"},
  {w:'check-in', t:'n.', d:'the process of registering as a guest on arrival at a hotel or resort'},
  {w:'check-out', t:'n.', d:'the process of leaving and settling payment at the end of a stay'},
  {w:'enquiry', t:'n.', d:'a question or request for information about a service'},
  {w:'complaint', t:'n.', d:"an expression of dissatisfaction about a service or experience"},
  {w:'resolution', t:'n.', d:"a solution found to address a guest's problem or complaint"},
  {w:'attentive', t:'adj.', d:"paying close and careful attention to guests' needs and comfort"},
  {w:'courteous', t:'adj.', d:'polite, respectful, and considerate in behavior at all times'},
  {w:'professional', t:'adj.', d:'behaving in a skilled, appropriate, and responsible manner at work'},
  {w:'concierge', t:'n.', d:'a hotel or resort staff member who assists guests with special requests'},
  {w:'service-minded', t:'adj.', d:'focused on providing the best possible care and service to every guest'},
  {w:'exceed expectations', t:'v. phr.', d:'to do even better than what a guest expected or hoped for'},
  {w:'rapport', t:'n.', d:'a warm and friendly relationship built between staff and guests'},
  {w:'empathy', t:'n.', d:'the ability to understand and share how another person feels'}
];

/* Core vocabulary: the 8 words students actively practice (matching, fill in
   the blank, and inside the Guest Service Challenge). Everything else in
   VOCAB is a "Useful Word": still shown, not the memorization focus. */
const CORE_VOCAB_IDS = ['hospitality','greeting','complaint','attentive','concierge','service-minded','rapport','empathy'];

/* Activity 1 — Matching (Section 2, exact 8 pairs) */
const MATCH_PAIRS = [
  {id:'hospitality', word:'hospitality', meaning:'the friendly and warm treatment of guests'},
  {id:'attentive', word:'attentive', meaning:"paying close attention to guests' needs"},
  {id:'concierge', word:'concierge', meaning:'a staff member who assists guests with special requests'},
  {id:'empathy', word:'empathy', meaning:'the ability to understand how another person feels'},
  {id:'greeting', word:'greeting', meaning:'the first words or actions used to welcome someone'},
  {id:'complaint', word:'complaint', meaning:'an expression of dissatisfaction about a service'},
  {id:'servicemind', word:'service-minded', meaning:'focused on providing the best possible care to guests'},
  {id:'rapport', word:'rapport', meaning:'a friendly relationship built with a guest'}
];

/* Activity 2 — Fill in the Blank (exact 8 sentences) */
const FILL_BLANK = [
  {q:'The receptionist displayed excellent __________ by greeting every guest with a genuine smile.', a:'hospitality'},
  {q:'Our front desk team is trained to be __________, always noticing when a guest might need assistance.', a:'attentive'},
  {q:'The __________ arranged a private car, restaurant reservation, and evening activity for the VIP guest.', a:'concierge'},
  {q:'When the guest complained about the noise, the staff listened with __________ and found a solution quickly.', a:'empathy'},
  {q:'Always try to __________: doing something small but unexpected that truly delights the guest.', a:'exceed expectations'},
  {q:'Building a strong __________ with regular guests makes them feel like they are visiting old friends.', a:'rapport'},
  {q:'Even when under pressure, our staff remain calm and __________ in every interaction.', a:'professional'},
  {q:'The manager turned the complaint into a __________ within 10 minutes, and the guest left satisfied.', a:'resolution'}
];

/* Section 3 — Reading: The Five Principles of Excellent Customer Service */
const READING = {
  title: 'The Five Principles of Excellent Customer Service in Wellness Tourism',
  paragraphs: [
    'In wellness tourism, excellent customer service is not just about doing a job well. It is about making guests feel genuinely cared for from the moment they arrive to the moment they leave. Research shows that guests who feel truly welcomed and valued are far more likely to return and recommend the resort to others.',
    "<b>Principle 1: Make a Strong First Impression.</b> Studies show that guests form an opinion about a resort within the first 30 seconds of arriving. A warm, genuine greeting (with eye contact, a smile, and the guest's name) immediately communicates that they are valued. Simple phrases like <i>'We are so glad you are here'</i> or <i>'Welcome back, Ms. Parker. It is lovely to see you again'</i> carry enormous impact.",
    "<b>Principle 2: Listen Actively.</b> When a guest speaks, give them your full and undivided attention. Do not interrupt, look at your screen, or finish their sentences. Nod, maintain gentle eye contact, and confirm what you have heard: <i>'So you would like a treatment that focuses on your back and shoulders. Is that correct?'</i> Active listening shows respect and ensures no important detail is missed.",
    '<b>Principle 3: Be Attentive and Anticipate Needs.</b> The best wellness tourism staff notice what guests need before being asked. If a guest is standing alone and looking uncertain, approach and offer help. If a guest returns tired from an excursion, offer water and a cool towel. If a guest mentions they have an early flight, note their breakfast time preferences. These small gestures create a feeling of being truly looked after.',
    "<b>Principle 4: Handle Complaints Professionally.</b> Even in the finest resorts, things occasionally go wrong. What separates excellent service from average service is how staff respond when they do. Never argue with a guest or make excuses. Instead, listen carefully, apologize sincerely, and take immediate action: <i>'I am so sorry to hear that, Mr. Chen. Let me take care of that for you right away.'</i> A complaint handled well can turn a dissatisfied guest into a loyal one.",
    "<b>Principle 5: Follow Up and Show You Care.</b> After resolving an issue or providing a service, follow up to ensure the guest is satisfied. A simple check-in (<i>'How was your massage this afternoon, Ms. Rivera? Is there anything else I can arrange for you?'</i>) shows that the guest's experience matters beyond the transaction. Small follow-up gestures, such as a handwritten note or a complimentary amenity, leave a lasting impression and reinforce the resort's commitment to genuine hospitality."
  ]
};
const READING_QUESTIONS = [
  {q:'What happens within the first 30 seconds of a guest arriving?', model:'The guest forms an opinion about the resort: a warm, genuine greeting matters enormously.'},
  {q:'Give TWO examples of active listening from the article.', model:'Any two of: giving full attention, not interrupting, not looking at a screen, confirming what you heard.'},
  {q:'What should you focus on when handling a complaint?', model:'Listen carefully, apologize sincerely, and take immediate action. Never argue or make excuses.'},
  {q:'Why is following up with guests important?', model:"It shows the guest's experience matters beyond the transaction and reinforces genuine hospitality."},
  {q:'Which of the five principles do you think is most challenging? Why?', model:'This is your own opinion. There is no single correct answer. Explain your choice.'}
];

/* Section 3 — What Would You Say? Real workplace situations: choose the
   most professional response, then see why it works. Replaces a
   reveal-only "model answer" format with an actual decision, so students
   practice evaluating language, not just reading it. */
const SCENARIO_CHOICES = [
  {
    tag:'Situation 1', guest:'A guest arrives early. Their room is not ready yet.',
    options:[
      "I'm sorry, your room isn't ready. You'll have to wait in the lobby.",
      "I'm sorry, your room isn't quite ready yet. While we prepare it, may I offer you a welcome drink in our lounge?",
      "That's not possible right now."
    ], correct:1,
    why:"This response apologizes, then offers something positive instead of just leaving the guest to wait. That's the difference between managing a problem and just stating it."
  },
  {
    tag:'Situation 2', guest:'A guest complains that their spa treatment started late.',
    options:[
      "You have to wait.",
      "I'm sorry for the delay. Let me check the status of your treatment.",
      "It is not my responsibility."
    ], correct:1,
    why:'A sincere apology plus immediate action. The guest feels heard, and they know something is actually being done.'
  },
  {
    tag:'Situation 3', guest:'A guest cannot find the yoga studio.',
    options:[
      "It's over there somewhere.",
      "I'm not sure. You'll have to find it yourself.",
      "The yoga studio is just past the wellness garden, on your left. Would you like me to walk you there?"
    ], correct:2,
    why:'Specific, clear directions, plus an offer to personally help. Vague directions ("over there somewhere") leave the guest just as lost as before.'
  },
  {
    tag:'Situation 4', guest:'A guest has a special request that was not communicated to the staff.',
    options:[
      "No one told us about that, so we can't do anything.",
      "I apologize for the miscommunication. Let me see what we can arrange for you right now.",
      "That's the front desk's fault, not mine."
    ], correct:1,
    why:"This takes ownership of the mistake, without blaming a colleague, and moves straight to finding a solution. Guests don't need to hear whose fault it was."
  }
];

/* Section 4 — Listening: check-in at Tranquil Phuket Wellness Resort */
const LISTEN = {
  intro: 'Prae, a receptionist at Tranquil Phuket Wellness Resort, welcomes Mr. Chen, a guest who has just arrived after a long flight.',
  lines: [
    {who:'Prae', kind:'staff', text:'Good afternoon, and welcome to Tranquil Phuket Wellness Resort. My name is Prae, and it is truly my pleasure to welcome you today. How was your journey?'},
    {who:'Mr. Chen', kind:'delegate', text:'Quite long, honestly. The flight from Singapore took longer than expected. I am feeling rather tired.'},
    {who:'Prae', kind:'staff', text:'I understand completely. Traveling can be exhausting. You have arrived at the perfect place to rest and recover. May I have your name so I can locate your reservation?'},
    {who:'Mr. Chen', kind:'delegate', text:'Yes, it is David Chen. I booked a four-night stay.'},
    {who:'Prae', kind:'staff', text:'Of course, Mr. Chen. I have your reservation right here: four nights in our Garden Wellness Villa, including our signature wellness package with daily yoga sessions, two herbal treatment sessions, and full use of our spa facilities.'},
    {who:'Mr. Chen', kind:'delegate', text:'That sounds wonderful. I was hoping to start with a massage today. Do I need to book in advance?'},
    {who:'Prae', kind:'staff', text:'Not at all! Since you are feeling tired from your journey, I would especially recommend our Welcome Relaxation Massage. It is specifically designed for guests arriving from long flights. I can book that for you right now if you would like.'},
    {who:'Mr. Chen', kind:'delegate', text:'Yes, please. That would be perfect.'},
    {who:'Prae', kind:'staff', text:'I have booked you for the Welcome Massage at 5 p.m. in our Lotus Spa, just about two hours from now, giving you time to settle in and freshen up first.'},
    {who:'Mr. Chen', kind:'delegate', text:'You have thought of everything. Thank you.'},
    {who:'Prae', kind:'staff', text:"We always try to anticipate our guests' needs. Before I show you to your villa, may I ask whether you have any dietary preferences for our wellness restaurant?"},
    {who:'Mr. Chen', kind:'delegate', text:'Yes, actually, I am vegetarian.'},
    {who:'Prae', kind:'staff', text:'Noted, Mr. Chen. I will inform our kitchen team right away so all your meals are prepared with vegetarian options. Is there anything else I can arrange for your arrival?'},
    {who:'Mr. Chen', kind:'delegate', text:'No, I think that covers everything. I really appreciate how attentive you have been.'},
    {who:'Prae', kind:'staff', text:'It is our pleasure. We want your time at Tranquil Phuket to be everything you hoped for. Please do not hesitate to contact us at any time. Here is our wellness host card with a direct line. Now, please allow me to escort you to your villa.'}
  ]
};
/* After-listening comprehension: a mixture of formats rather than
   all multiple choice or all reveal-the-answer. */
const LISTEN_TF = [
  {s:"Mr. Chen's flight was shorter than he expected.", correct:false},
  {s:'Prae recommends the Welcome Relaxation Massage because Mr. Chen is tired from his journey.', correct:true},
  {s:'Mr. Chen has to book his massage himself, later, at the spa.', correct:false},
  {s:'Prae asks about dietary preferences before showing Mr. Chen to his villa.', correct:true}
];
const LISTEN_SELECT = {
  q:'Select everything Prae does well during check-in. (More than one is correct.)',
  opts:[
    {t:'Recommends a treatment suited to how the guest is feeling', good:true},
    {t:'Books the massage immediately, without making the guest ask twice', good:true},
    {t:'Asks about dietary preferences before the guest even mentions food', good:true},
    {t:'Tells the guest to come back later if he wants anything else', good:false}
  ]
};
const LISTEN_SHORT = {
  q:'Write ONE full sentence Prae says that shows empathy (understanding how the guest feels).',
  accept:['i understand completely','you have arrived at the perfect place to rest and recover',"we always try to anticipate our guests' needs","we always try to anticipate our guests needs"],
  hint:'Look for a sentence where Prae responds to how Mr. Chen feels, not just to what he asks for.'
};

/* Empathy phrases (Section 4 "Language Focus" + workbook role-card phrases) */
const EMPATHY_PHRASES = [
  'I understand.',
  "I'm sorry to hear that.",
  'Let me see how I can help.',
  'Let me check that for you.',
  'May I suggest...?'
];

/* Section 6 — The Guest Service Challenge: five real guest situations.
   For each, the student picks the most professional response (not a
   phrase-matching exercise), sees immediately why it works, and builds
   a running score. Every guest quote is the same one used in the
   original version of this section, just now paired with a genuine
   decision instead of an open phrase-picker. A sixth, ungraded bonus
   situation closes the challenge with a typed response. */
const GUEST_ROUNDS = [
  {
    id:'tired', skill:'Empathy',
    guest:'Hi... I just arrived and I am completely exhausted. I have been traveling for almost 20 hours.',
    options:[
      "You should have arranged an earlier check-in.",
      "I understand. You've had such a long journey. Let's get you settled quickly so you can rest.",
      "Okay. Here's your key."
    ], correct:1,
    why:'This response names how the guest feels and moves straight to helping them rest, instead of blaming them or giving a cold, purely functional reply.'
  },
  {
    id:'roomready', skill:'Apology',
    guest:'Excuse me, you told me my room would be ready by now, but it still is not.',
    options:[
      "I'm sorry for the delay. Let me check that for you right now.",
      "It's not ready. You'll have to wait.",
      "That's strange, it should be ready."
    ], correct:0,
    why:"A sincere apology followed by immediate action. The other two options either leave the guest waiting with no plan, or sound like the staff member doesn't believe them."
  },
  {
    id:'treatment', skill:'Offering Solutions',
    guest:"I read online that you also offer a hot stone massage. Is that available? It was not in my package.",
    options:[
      "No, that's not included.",
      "Let me check that for you, and I can suggest a similar option if it's not available.",
      "You should have checked before booking."
    ], correct:1,
    why:"This offers to find out AND has a backup plan ready, rather than a flat refusal that leaves the guest with nothing."
  },
  {
    id:'special', skill:'Exceeding Expectations',
    guest:'My partner and I are celebrating our anniversary during this stay. Is there anything special you could arrange?',
    options:[
      "We don't really do anything special for that.",
      "Congratulations! Let me see how I can arrange something memorable for you both.",
      "You can ask the spa directly."
    ], correct:1,
    why:'This is a genuine opportunity to exceed expectations. Passing the guest along to someone else, or saying no, wastes a moment that could build real loyalty.'
  },
  {
    id:'noisy', skill:'Checking Information',
    guest:'I am sorry to bother you, but the room next to mine is very loud, and I could not sleep at all last night.',
    options:[
      "That happens sometimes.",
      "There's nothing we can do about other guests.",
      "I'm sorry to hear that. Let me check what we can do and arrange a solution right away."
    ], correct:2,
    why:'A real complaint deserves a real response: acknowledge it, then check what options exist (a room change, a quiet-hours reminder to the other guest) instead of shrugging it off.'
  }
];
const BONUS_ROUND = {
  guest:'Could you tell me what wellness services are available at the resort? I am not sure where to start.',
  prompt:'This guest just needs friendly, useful information. Type how you would respond, in your own words.',
  model:'"Of course! We offer massage and spa treatments, daily yoga and meditation sessions, and a wellness restaurant with healthy set menus. Is there something specific you are hoping to try during your stay?"'
};

/* Final role-play — "Can I Handle This Guest?" */
const ROLEPLAY = {
  round1: {
    a:{title:'Student A: Wellness Resort Staff', body:'You are a receptionist at Serenity Wellness Resort. Welcome the guest, check them in, and offer to help with anything they need.',
      phrases:['Good afternoon! Welcome to...', 'My name is... and I will be your...', 'I can see you have booked our... package.', 'May I ask if you have any...?', 'Please do not hesitate to...']},
    b:{title:'Student B: Guest', body:'You have just arrived after a long journey.', phrases:['My name is... I have a reservation.', 'Could you tell me more about...?', 'I was hoping to... today. Is that possible?', 'I should mention that I am...', 'Thank you so much for...']}
  },
  extra: [
    {tag:'Extra Scenario 1', text:'The guest has arrived but their room is not ready yet. Offer an alternative while they wait.'},
    {tag:'Extra Scenario 2', text:'The guest asks about a treatment not included in their package. Politely explain and offer an upgrade option.'}
  ]
};
const PEER_CHECKLIST = [
  'Did they greet the guest warmly and use their name?',
  'Did they listen actively without interrupting?',
  'Did they anticipate a need without being asked?',
  "Did their language sound polite and professional?"
];

/* Section 9 — Writing: a short follow-up message, connected directly to
   the Guest Service Challenge. Follow-up is one of the six service skills
   this unit covers but the challenge itself doesn't have room to score,
   so it gets its own short workplace-document task here instead. */
const WRITING_TASK = {
  prompt: 'Choose ONE guest from the Guest Service Challenge (or from your role-play). Write a short follow-up message, 3–5 sentences, checking that everything was resolved to their satisfaction.',
  situations: [
    {tag:'Option A', text:'Follow up with the guest whose room was not ready when they arrived.'},
    {tag:'Option B', text:'Follow up with the guest who complained about noise from the room next door.'},
    {tag:'Option C', text:'Follow up with the guest celebrating their anniversary, to see how the arrangement went.'}
  ],
  usefulPhrases: [
    'I just wanted to follow up and make sure...',
    'I hope everything was resolved to your satisfaction.',
    'Please let us know if there is anything else we can do.',
    'It was a pleasure looking after you during your stay.'
  ]
};

/* Section 8 — Reflection (Section 7 Can-Do statements, verbatim) */
const REFLECTION = [
  'I can greet and check in a wellness tourism guest professionally in English.',
  'I know and can use the five principles of excellent customer service.',
  "I can respond to a guest's enquiry, request, or complaint appropriately.",
  'I can anticipate guest needs and offer help before being asked.'
];

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Hospitality Vocabulary'},
  {key:'s2', label:'Vocabulary In Context'},
  {key:'s3', label:'Reading: Five Principles'},
  {key:'s4', label:'What Would You Say?'},
  {key:'s5', label:'Listen: Check-In'},
  {key:'s6', label:'The Guest Service Challenge'},
  {key:'s7', label:'Final Role-Play'},
  {key:'s9', label:'Writing: Follow-Up Message'},
  {key:'s8', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 4: Customer Service',
  unitCode: 'unit-4'
};

/* ===================== TAKE-HOME ASSET ===================== */
const STUDY_GUIDE_DATA_URI = "../../../assets/study-guide/Unit4-Customer-Service-Study-Guide.jpg";
const STUDY_GUIDE_FILENAME = "Unit4-Customer-Service-Study-Guide.jpg";

/* ===================== SECTION PHOTOS =====================
   Paths are relative to /courses/wellness/unit-4/index.html. */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/wt-u4-hero.jpg', alt:'A wellness resort staff member welcoming an arriving guest by the pool' },
  concierge: { src:'../../../assets/images/wt-u4-concierge.jpg', alt:'A concierge greeting a guest with a folder in a resort lobby' },
  checkin: { src:'../../../assets/images/wt-u4-checkin.jpg', alt:'A staff member assisting a guest with paperwork at a reception counter' }
};
