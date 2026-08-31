/* ===================== UNIT 9 CONTENT DATA — THE WELLNESS CONCIERGE DESK =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   role-play, rubric. Nothing here is UI logic — see app.js for rendering/state/
   voice/progress-tracking.

   Bloom's level: APPLY. Students take language they already know from Units 1-8
   (destinations, customer service, guiding, reservations, spa vocabulary) and
   apply it to a new situation: explaining and recommending a wellness program
   to a curious guest who hasn't booked anything yet, distinct from Unit 6's
   reservation-call task. Architecture and component library are carried over
   from the MICE Units 9-15 build (SECTION_META/RENDERERS router, VoiceEngine,
   ab-toggle, crossword, etc. — all fully generic and theme-token-driven, so
   they re-skin automatically via wellness-theme.css with no CSS changes).
   Invented content, part of the Units 9-15 OBE/Bloom's expansion, not drawn
   from the official workbook, at the instructor's explicit request. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Your First Question of the Day'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Good Practice or Needs Work?'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: A Curious Guest'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Build Your Explanation'},
  {key:'s8', label:'Speaking Practice'},
  {key:'crossword', label:'Vocabulary Race'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Your First Question of the Day ===== */
const OPENING_SCENARIO = {
  facts: [
    'You are working at the wellness concierge desk.',
    'A guest walks up, holding a resort brochure with several programs listed.',
    'They look a little unsure about which one is right for them.'
  ],
  message: 'The guest asks: "Can you tell me more about your wellness programs?"',
  question: 'What should you do?',
  options: [
    {text:'Smile and ask what they are hoping to get from their stay.', good:true, note:'A great start. Understanding their goal first makes your explanation much more useful.'},
    {text:'Immediately list every single program in detail.', good:false, note:'Too much information at once can overwhelm a guest who is still deciding.'},
    {text:'Give a short overview, then ask a follow-up question.', good:true, note:'Yes. A brief overview followed by a question keeps the guest engaged.'},
    {text:'Hand them the brochure and walk away.', good:false, note:'A brochure without a real conversation misses the chance to actually help them.'},
    {text:'Ask what brought them to the resort this time.', good:true, note:'A thoughtful question. Their reason for visiting often reveals what program would suit them.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'7:00', point:'Sunrise yoga', where:'Garden Pavilion'},
  {time:'9:00', point:'Program overview session', where:'Concierge Desk'},
  {time:'11:00', point:'Detox nutrition talk', where:'Wellness Library'},
  {time:'2:00 p.m.', point:'Guided meditation', where:'Quiet Room'},
  {time:'4:00 p.m.', point:'Evening spa treatments begin', where:'Spa Reception'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's wellness schedule. At 7 a.m., sunrise yoga takes place in the Garden Pavilion. At 9 a.m., we have a program overview session at the Concierge Desk for any new arrivals. At 11 a.m., there's a detox nutrition talk in the Wellness Library. At 2 p.m., guided meditation happens in the Quiet Room. And at 4 p.m., evening spa treatments begin at Spa Reception.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'program', ic:'📋', nm:'Program', type:'n.', def:'A planned set of wellness activities or treatments over several days.', ex:'Our Detox Program runs for five days.'},
  {id:'include', ic:'📦', nm:'Include', type:'v.', def:'To have something as one part of a whole package.', ex:'The package includes two spa treatments and daily yoga.'},
  {id:'tailor', ic:'✂️', nm:'Tailor', type:'v.', def:"To design something to fit a specific person's needs.", ex:'We can tailor the program to your goals.'},
  {id:'goal', ic:'🎯', nm:'Goal', type:'n.', def:'What a guest wants to achieve during their stay.', ex:'What is your main wellness goal for this trip?'},
  {id:'intensity', ic:'🔥', nm:'Intensity', type:'n.', def:'How physically demanding an activity or program is.', ex:'This program has a higher intensity than our relaxation retreat.'},
  {id:'suit', ic:'✅', nm:'Suit', type:'v.', def:'To be right or appropriate for someone.', ex:'This might suit you better if you prefer a slower pace.'},
  {id:'overview', ic:'🗒️', nm:'Overview', type:'n.', def:'A short, general summary of something.', ex:'Let me give you a quick overview of our three main programs.'},
  {id:'highlight', ic:'⭐', nm:'Highlight', type:'n./v.', def:'The best or most special part of something.', ex:'The sunrise yoga session is a real highlight for many guests.'},
  {id:'curious', ic:'🤔', nm:'Curious', type:'adj.', def:'Wanting to know more about something.', ex:"I understand you're curious about our programs."},
  {id:'recommend', ic:'💡', nm:'Recommend', type:'v.', def:'To suggest something as a good choice.', ex:"Based on that, I'd recommend our Balance Program."}
];
const VOCAB_SECONDARY = [
  {id:'pace', nm:'Pace', def:'How fast or slow an activity or program moves.'},
  {id:'wellbeing', nm:'Wellbeing', def:'A general state of feeling healthy, comfortable, and happy.'},
  {id:'firsttimer', nm:'First-Timer', def:'A guest who is trying a wellness program for the very first time.'},
  {id:'openminded', nm:'Open-Minded', def:'Willing to try new things without judging them first.'},
  {id:'unwind', nm:'Unwind', def:'To relax and let go of stress after a busy period.'}
];

/* ===== Section 2b: Good Practice or Needs Work? (categorization) =====
   Same underlying objective as before (recognizing good vs. weak concierge
   habits), presented as a sort task instead of a single choose-and-explain
   challenge, mirroring MICE Unit 9's own Good Practice / Needs Work sort. */
const GUEST_INTERACTIONS = [
  {text:'Smiling and making eye contact the moment a guest approaches the desk.', good:true},
  {text:'Continuing to type on the computer while a guest is speaking to you.', good:false},
  {text:'Asking an open question, like "What are you hoping to get from your stay?"', good:true},
  {text:'Talking only about the most expensive program before asking any questions.', good:false},
  {text:'Pausing to check the guest\'s face for confusion, then offering to clarify.', good:true},
  {text:'Rushing through the explanation because a line is forming behind the guest.', good:false}
];

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'program', word:'Program', meaning:'A planned set of wellness activities or treatments over several days'},
  {id:'tailor', word:'Tailor', meaning:"To design something to fit a specific person's needs"},
  {id:'goal', word:'Goal', meaning:'What a guest wants to achieve during their stay'},
  {id:'intensity', word:'Intensity', meaning:'How physically demanding an activity or program is'},
  {id:'suit', word:'Suit', meaning:'To be right or appropriate for someone'},
  {id:'overview', word:'Overview', meaning:'A short, general summary of something'},
  {id:'highlight', word:'Highlight', meaning:'The best or most special part of something'},
  {id:'recommend', word:'Recommend', meaning:'To suggest something as a good choice'}
];

const FILL_BLANK = [
  {q:'Our Detox __________ runs for five days.', a:'program'},
  {q:'The package __________ two spa treatments and daily yoga.', a:'includes'},
  {q:'We can __________ the program to your goals.', a:'tailor'},
  {q:'What is your main wellness __________ for this trip?', a:'goal'},
  {q:'This program has a higher __________ than our relaxation retreat.', a:'intensity'},
  {q:'This might __________ you better if you prefer a slower pace.', a:'suit'},
  {q:'Let me give you a quick __________ of our three main programs.', a:'overview'},
  {q:"Based on that, I'd __________ our Balance Program.", a:'recommend'}
];

const VOCAB_SITUATIONS = [
  {q:'A guest asks what a specific program includes. What do you say?', model:'"Let me give you a quick overview, it includes daily yoga, two spa treatments, and a nutrition talk."'},
  {q:'A guest seems unsure which program is right for them. What do you ask?', model:'"May I ask, what is your main wellness goal for this trip?"'},
  {q:'A guest wants something less physically demanding. What do you suggest?', model:'"In that case, our Balance Program might suit you better, it has a gentler intensity."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Explaining Wellness Programs Well',
  paragraphs: [
    'For many guests, choosing a wellness program is one of the first real decisions of their stay, and it can feel surprisingly overwhelming. A resort brochure full of unfamiliar names and long descriptions does not always help a guest understand what is actually right for them.',
    'The concierge\'s real job is not to recite every detail from the brochure. It is to understand the guest\'s goal first, whether that is relaxation, fitness, better sleep, or simply trying something new, and then explain only what matters for that guest.',
    'A short overview works better than a long list. Mentioning one or two highlights, the sunrise yoga, the private meditation session, gives a guest something specific and appealing to imagine, rather than an abstract list of features.',
    'Tailoring the explanation also means being honest about intensity and pace. A guest hoping to unwind completely will not enjoy a high-intensity fitness program, no matter how impressive it sounds on paper. Suggesting the program that genuinely suits them builds far more trust than simply upselling the most expensive option.',
    'For guests visiting a wellness resort for the very first time, a warm, curious, unhurried conversation at the concierge desk often shapes their entire impression of the stay, long before their first treatment even begins.'
  ]
};
const READING_QUESTIONS = [
  {q:'What is described as the concierge\'s real job, according to the article?', opts:['To recite every detail from the brochure','To understand the guest\'s goal first, then explain what matters for them','To recommend the most expensive program'], correct:1},
  {q:'Why does a short overview work better than a long list?', opts:['It saves the concierge time only','It gives the guest something specific and appealing to imagine','Guests never read long lists'], correct:1},
  {q:'What does "tailoring the explanation" involve, according to the article?', opts:['Being honest about intensity and pace, and suggesting what genuinely suits the guest','Always recommending the same program to everyone','Avoiding any mention of intensity'], correct:0},
  {q:'Why does this first conversation matter so much for first-time guests?', opts:['It doesn\'t matter much at all','It often shapes their entire impression of the stay','It only matters if they complain later'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  understanding:{title:'Understanding the Guest', items:[
    'What is your main wellness goal for this trip?',
    'Have you tried a program like this before?',
    'What brought you to the resort this time?',
    'Are you looking for something relaxing, or more active?'
  ]},
  explaining:{title:'Explaining a Program', items:[
    'Let me give you a quick overview.',
    'This program includes…',
    'One of the highlights is…',
    'It runs for… days, with a… intensity.'
  ]},
  recommending:{title:'Recommending', items:[
    "Based on that, I'd recommend…",
    'This might suit you better if…',
    'We can tailor this to your goals.',
    'Would you like to hear more about that one?'
  ]}
};

/* ===== Section 6: Listening Script — "A Curious Guest" =====
   Two characters: Mai (wellness concierge) and Mrs. Andersen (guest). */
const BEFORE_LISTEN = {
  setup: 'A guest approaches the concierge desk with questions. Listen and find out which program Mai recommends, and why.',
  guesses: [
    'Mai recommends the most expensive program without asking anything.',
    'Mai asks about the guest\'s goal first, then recommends a program that fits.',
    'Mai tells the guest to decide on their own.',
    'Mai recommends every program at once.'
  ]
};
const LISTEN = {
  intro: 'The wellness concierge desk. Mrs. Andersen approaches with a brochure in hand.',
  lines: [
    {who:'Mrs. Andersen', text:'Excuse me, could you tell me more about your wellness programs? There are so many, I\'m not sure where to start.', kind:'delegate'},
    {who:'Mai', text:"Of course! May I ask, what is your main wellness goal for this trip? Are you hoping to relax, or are you looking for something more active?", kind:'staff'},
    {who:'Mrs. Andersen', text:"Honestly, I've been very stressed at work. I think I just want to unwind completely.", kind:'delegate'},
    {who:'Mai', text:'That makes sense. In that case, let me give you a quick overview of our Balance Program. It runs for four days, with a gentle intensity, mostly relaxation-focused.', kind:'staff'},
    {who:'Mrs. Andersen', text:'What does it actually include?', kind:'delegate'},
    {who:'Mai', text:'It includes daily gentle yoga, two full spa treatments, and guided meditation each afternoon. One of the highlights is a private sunset meditation session by the beach.', kind:'staff'},
    {who:'Mrs. Andersen', text:'That sounds exactly like what I need.', kind:'delegate'},
    {who:'Mai', text:"I'm glad to hear that. We can also tailor a few details to your preferences, if you'd like.", kind:'staff'},
    {who:'Mrs. Andersen', text:"Wonderful, thank you so much for explaining that so clearly.", kind:'delegate'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does Mai ask the guest first?', opts:['Her room number','What her main wellness goal is','Her payment method'], correct:1},
  {q:'What does Mrs. Andersen say she wants?', opts:['A very active, high-intensity program','To unwind completely','To try every program at once'], correct:1},
  {q:'How long does the Balance Program run for?', opts:['Two days', 'Four days', 'Ten days'], correct:1},
  {q:'What is mentioned as one of its highlights?', opts:['A cooking class','A private sunset meditation session by the beach','A shopping trip'], correct:1},
  {q:'What does Mai offer at the end of the conversation?', opts:['A discount','To tailor a few details to her preferences','Nothing else'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:"Understanding the guest's goal before recommending anything", example:'"What is your main wellness goal for this trip?"'},
  {strategy:'Giving a short overview instead of a long list', example:'"Let me give you a quick overview of our Balance Program."'},
  {strategy:'Being specific about intensity and pace', example:'"...with a gentle intensity, mostly relaxation-focused."'},
  {strategy:'Mentioning one memorable highlight', example:'"One of the highlights is a private sunset meditation session by the beach."'},
  {strategy:'Offering to personalize the experience further', example:"\"We can also tailor a few details to your preferences.\""}
];

/* ===== Section 6b: Build Your Explanation =====
   A practical construction task in the same spirit as MICE Unit 9's
   "Build Your Pitch": students fill in a formula, then check it against a
   model, but here the formula builds a program explanation instead of a
   sales pitch. */
const PITCH_FORMULA = [
  {key:'goal', label:'Guest goal: what are they hoping to achieve?', placeholder:'e.g. to unwind and de-stress'},
  {key:'program', label:'Program name and length', placeholder:'e.g. the Balance Program, 4 days'},
  {key:'includes', label:'What it includes', placeholder:'e.g. daily yoga, two spa treatments'},
  {key:'highlight', label:'One highlight to mention', placeholder:'e.g. a private sunset meditation session'}
];
const MODEL_PITCH = 'Since you\'re hoping to unwind and de-stress, I\'d recommend the Balance Program, four days of gentle relaxation. It includes daily yoga, two full spa treatments, and guided meditation, and one real highlight is our private sunset meditation session by the beach.';

/* ===== Section 8: Speaking Practice — Role-Play ===== */
const ROLEPLAY_CARDS = {
  staff:{title:'Role Card A: Wellness Concierge', body:'You are working the wellness concierge desk.',
    role:'Ask about the guest\'s goal, give a short overview, and recommend a suitable program.',
    phrases:['What is your main wellness goal?', 'Let me give you a quick overview.', 'This program includes…', 'This might suit you because…']},
  visitor:{title:'Role Card B: Curious Guest', body:'You are a guest, unsure which program to choose.',
    role:'Describe what you are hoping to get from your stay, then ask one follow-up question about the recommendation.',
    phrases:["I'm not really sure where to start.", "I think I want…", 'What does it actually include?', 'That sounds perfect, thank you.']}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'A guest wants a program that does not exist at your resort. Explain kindly and suggest the closest alternative.'},
  {tag:'Scenario 2', text:'A guest with a physical injury asks about a high-intensity program. Recommend something safer, tactfully.'},
  {tag:'Scenario 3', text:'A guest is in a hurry and only has one minute. Give the shortest possible recommendation.'}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they ask about the guest\'s goal before recommending anything?',
  'Did they give a short overview, not a long list?',
  'Did they mention at least one specific highlight?',
  'Did they answer the follow-up question confidently?',
  'Did they offer to tailor the program?',
  'Did their language sound warm, professional, and confident?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'Explain a fitness-focused program to a guest who mentions they exercise every day at home.'},
  {tag:'Situation B', text:'Explain a couples\' wellness package to two guests celebrating an anniversary.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Write a short follow-up email (4–6 sentences) to a guest you spoke with at the concierge desk, summarizing the program you recommended and why.',
  discussion: [
    {title:'Tourism Business Management', text:'A corporate group is visiting for a team wellness retreat and wants a program summary they can share with their whole team. Write your email.'},
    {title:'Wellness Tourism Management', text:'A guest mentioned they are recovering from a stressful year and want something gentle but meaningful. Write your recommendation email.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Program Vocabulary', sub:'I can use program, tailor, intensity, and recommend correctly.'},
  {k:'understand', lbl:'Understanding the Guest', sub:'I can ask a guest about their wellness goal before recommending.'},
  {k:'explain', lbl:'Explaining Clearly', sub:'I can give a short, clear overview of a wellness program.'},
  {k:'recommend', lbl:'Making a Recommendation', sub:'I can recommend a program that genuinely suits the guest.'},
  {k:'writing', lbl:'Follow-Up Writing', sub:'I can write a short, professional follow-up email after a conversation.'}
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 9: The Wellness Concierge Desk',
  unitCode: 'unit-9'
};
