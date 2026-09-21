/* ===================== UNIT 15 CONTENT DATA — DESIGNING A GUEST'S WELLNESS DAY =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   journey-building task, rubric. Nothing here is UI logic — see app.js for
   rendering/state/voice/progress-tracking.

   Bloom's level: CREATE / INTEGRATION. This is the final unit before the real
   Midterm-review-style workbook content resumes (this site stops at Unit 15,
   per the instructor's explicit boundary: Unit 16 and the real final exam are
   out of scope). Students design and write FOUR original messages across a
   VIP guest's whole day, in PAIRS, pulling together program explanation
   (Unit 9), information handling (Unit 10), root-cause thinking (Unit 11),
   comparison and justification (Unit 12), difficult decisions (Unit 13), and
   calm multi-audience care (Unit 14) into one connected, original piece of
   work. Invented content, part of the Units 9-15 OBE/Bloom's expansion, not
   drawn from the official workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'One Guest, One Whole Day'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Sort the Requests'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'What Would You Say?'},
  {key:'s6', label:'Listening: Planning the Day'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Build the Day'},
  {key:'s8', label:'Speaking Practice'},
  {key:'surprise', label:'Surprise Twist'},
  {key:'crossword', label:'Capstone Review'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: One Guest, One Whole Day =====
   Opens as an incoming client brief instead of a plain facts list, matching
   the "assignment just landed" framing already used for Unit 12's opening. */
const OPENING_SCENARIO = {
  clientMessage: {
    from: 'director@harmonywellness.com',
    subject: 'VIP Day Plan Needed: Ms. Renner',
    body: "Team, Ms. Renner arrives tomorrow and this is our top VIP day this quarter. I need the full plan today: a welcome email, an arrival greeting, a proactive plan in case anything goes wrong, and a farewell message. Please have a complete draft ready by end of day."
  },
  message: 'You are designing the entire wellness day for one VIP guest, from first email to final farewell.',
  question: 'What should guide your design?',
  options: [
    {text:"Think about the guest's experience at every single touchpoint.", good:true, note:'Exactly right. The whole day matters, not just one big moment.'},
    {text:'Only focus on the biggest, most visible treatment.', good:false, note:'Small moments, like a warm email or a remembered preference, matter just as much as big ones.'},
    {text:'Make every message feel personal, not generic.', good:true, note:'Yes. A guest can always tell the difference between a real message and a copy-paste.'},
    {text:'Copy the exact same message for every guest, every time.', good:false, note:"A guest notices when a message feels generic. Personalizing it makes the day feel real."},
    {text:'Plan for something to go wrong, and prepare a calm response.', good:true, note:'A great instinct. The best days still include a plan for recovery, not just the perfect schedule.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'Pre-Arrival', point:'Welcome email sent', where:'Personalized, sets the first impression'},
  {time:'Arrival', point:'Welcome and check-in', where:'The first face-to-face moment'},
  {time:'During the Day', point:'Guidance and support', where:'Answering questions, solving small problems'},
  {time:'A Problem Occurs', point:'Proactive recovery', where:'Solved calmly, before it becomes a bigger issue'},
  {time:'Departure', point:'Farewell message', where:"The final impression, and what she'll remember"}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's overview of a guest's wellness day. Pre-arrival, a welcome email is sent, personalized, and it sets the first impression. At arrival, there's the welcome and check-in, the first face-to-face moment. During the day, we offer guidance and support, answering questions and solving small problems. If a problem occurs, we respond proactively, solving it calmly before it becomes bigger. And at departure, a farewell message leaves the final impression, the thing she'll actually remember.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'itinerary', ic:'🗺️', nm:'Itinerary', type:'n.', def:'A planned schedule for a day or visit.', ex:'We sent the guest her full itinerary in advance.'},
  {id:'touchpoint', ic:'📍', nm:'Touchpoint', type:'n.', def:'A moment when a guest interacts with the resort team.', ex:"The welcome email is the guest's first touchpoint."},
  {id:'journey', ic:'🧭', nm:'Journey', type:'n.', def:'The whole experience a guest has, from start to finish.', ex:"Think about the guest's whole journey, not just one moment."},
  {id:'seamless', ic:'🪡', nm:'Seamless', type:'adj.', def:'Smooth, without any noticeable problems or breaks.', ex:'A seamless day feels effortless to the guest.'},
  {id:'personalize', ic:'✍️', nm:'Personalize', type:'v.', def:'To make something feel special and specific to one person.', ex:"Personalize the welcome message with the guest's name and goal."},
  {id:'integrate', ic:'🧩', nm:'Integrate', type:'v.', def:'To combine different parts into one smooth whole.', ex:"Integrate everything you've learned into one connected day."},
  {id:'milestone', ic:'🚩', nm:'Milestone', type:'n.', def:'An important point or stage in a process.', ex:"Check-in is the first milestone of the guest's day."},
  {id:'proactive', ic:'⚡', nm:'Proactive', type:'adj.', def:'Acting before a problem happens, not just reacting.', ex:'Be proactive: solve small problems before the guest notices.'},
  {id:'farewell', ic:'👋', nm:'Farewell', type:'n.', def:'A goodbye, especially a polite or formal one.', ex:'End with a warm farewell message.'},
  {id:'craft', ic:'🎨', nm:'Craft', type:'v.', def:'To carefully create something with skill.', ex:'Craft a message that feels personal, not generic.'}
];
const VOCAB_SECONDARY = [
  {id:'firstimpression2', nm:'First Impression', def:'The feeling someone gets the very first time they interact with you.'},
  {id:'lastingmemory2', nm:'Lasting Memory', def:'What someone remembers and keeps thinking about after an experience ends.'},
  {id:'genuine2', nm:'Genuine', def:'Real and sincere, not fake or forced.'},
  {id:'anticipate2', nm:'Anticipate', def:'To expect something and prepare for it before it happens.'},
  {id:'endtoend', nm:'End-to-End', def:'Covering the entire process, from the very beginning to the very end.'}
];

/* ===== Section 2b: Sort the Requests (light categorization) =====
   A warm-up before Section 9's Build the Day task: sort the client's notes
   into the day stage each one belongs to, so students are already thinking
   in four stages before they have to write in four stages. Same underlying
   objective as before (getting the whole guest-day scenario clear in
   students' minds), presented as a lighter categorization task rather than
   a full choose-and-explain challenge, since Section 9 already carries this
   unit's major Create-level demand. */
const STAGE_LABELS = {welcome:'Welcome', arrival:'Arrival', recovery:'Recovery', farewell:'Farewell'};
const CLIENT_REQUESTS = [
  {text:'Mention the stress-relief program she specifically requested.', stage:'welcome'},
  {text:'Confirm her preferred treatment time is reserved.', stage:'welcome'},
  {text:'Greet her by name, not just hand her a room key.', stage:'arrival'},
  {text:'Have someone personally walk her to check-in.', stage:'arrival'},
  {text:"Arrange a backup plan in case her treatment slot isn't ready.", stage:'recovery'},
  {text:'Offer a quiet lounge space if anything is delayed.', stage:'recovery'},
  {text:'Send a personal thank-you mentioning something from her stay.', stage:'farewell'},
  {text:"Don't let it end with just a generic goodbye.", stage:'farewell'}
];

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'itinerary', word:'Itinerary', meaning:'A planned schedule for a day or visit'},
  {id:'touchpoint', word:'Touchpoint', meaning:'A moment when a guest interacts with the resort team'},
  {id:'journey', word:'Journey', meaning:'The whole experience a guest has, from start to finish'},
  {id:'seamless', word:'Seamless', meaning:'Smooth, without any noticeable problems or breaks'},
  {id:'personalize', word:'Personalize', meaning:'To make something feel special and specific to one person'},
  {id:'milestone', word:'Milestone', meaning:'An important point or stage in a process'},
  {id:'proactive', word:'Proactive', meaning:'Acting before a problem happens, not just reacting'},
  {id:'farewell', word:'Farewell', meaning:'A goodbye, especially a polite or formal one'}
];

const FILL_BLANK = [
  {q:'We sent the guest her full __________ in advance.', a:'itinerary'},
  {q:"The welcome email is the guest's first __________.", a:'touchpoint'},
  {q:"Think about the guest's whole __________, not just one moment.", a:'journey'},
  {q:'A __________ day feels effortless to the guest.', a:'seamless'},
  {q:"__________ the welcome message with the guest's name and goal.", a:'personalize'},
  {q:"Check-in is the first __________ of the guest's day.", a:'milestone'},
  {q:'Be __________: solve small problems before the guest notices.', a:'proactive'},
  {q:'End with a warm __________ message.', a:'farewell'}
];

const VOCAB_SITUATIONS = [
  {q:'You are writing a welcome email for a specific guest. How do you make it feel real, not generic?', model:'"I always personalize it, mentioning something specific about her goal or preferences."'},
  {q:'A small problem could happen later in the day. What is the proactive approach?', model:"\"I try to anticipate it and prepare a plan before the guest even notices anything is wrong.\""},
  {q:'A guest is leaving after a wonderful day. What kind of message do you craft?', model:'"I craft a genuine farewell that leaves a lasting memory, not just a quick goodbye."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: "Designing a Guest's Complete Wellness Day",
  paragraphs: [
    'Every skill covered so far in this course, explaining a program, handling information, finding a root cause, comparing options, making a difficult decision, and communicating with calm care, comes together in one place: a guest\'s complete wellness day.',
    'A guest experiences a resort as a series of touchpoints: an email before she arrives, a greeting at check-in, small moments of guidance throughout the day, and a farewell as she leaves. Each touchpoint is a small opportunity to either build trust or lose it.',
    'The best wellness professionals think about the whole day as one connected experience, not a set of separate tasks. A guest who receives a personalized welcome email, is greeted warmly by name, has a small problem solved proactively, and leaves with a genuine farewell remembers the day as seamless, even if small things went wrong along the way.',
    'Integrating these moments takes craft. It means anticipating what a guest might need at each stage, and personalizing the message for that specific moment, rather than repeating the same generic script everywhere.',
    'For MICE event professionals, this same thinking applies to a delegate\'s whole event experience: from the first confirmation, through a warmly guided arrival, any small adjustment made along the way, to a heartfelt farewell that makes them want to return.'
  ]
};
const READING_QUESTIONS = [
  {q:'What does the article say comes together in a guest\'s complete wellness day?', opts:['Only the final treatment','Every skill covered in the course, from explaining a program to calm care under pressure','Only the welcome email'], correct:1},
  {q:'What is a "touchpoint," according to the article?', opts:['A type of spa treatment','A small opportunity, at each stage of a guest\'s day, to build or lose trust','A kind of package upgrade'], correct:1},
  {q:'How do the best wellness professionals think about the guest day?', opts:['As many separate, unrelated tasks','As one connected experience, not separate tasks','As only the arrival moment'], correct:1},
  {q:'What does "integrating" these moments require, according to the article?', opts:['Repeating the same generic script everywhere','Anticipating guest needs and personalizing each message','Avoiding contact with the guest'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  welcoming:{title:'Starting the Day', items:[
    "Welcome, we're so glad you're here.",
    'I hope your journey here was comfortable.',
    'Let me personally show you to…',
    'Is there anything you need right away?'
  ]},
  supporting:{title:'Supporting Along the Way', items:[
    'How has everything been so far?',
    'Let me take care of that for you.',
    "I noticed you might need…, so I've already arranged it.",
    "Please don't hesitate to ask."
  ]},
  closing:{title:'Ending the Day', items:[
    'Thank you so much for joining us today.',
    "It's been a pleasure having you here.",
    'We hope to see you again soon.',
    'Take care, and travel safely.'
  ]}
};

/* ===== Section 6 (What Would You Say?): situation → phrase category =====
   Grounded in Fern and Beam's own plan for Ms. Renner's day from LISTEN
   below, so the situations follow her actual day rather than staying
   abstract. */
const PHRASE_SITUATIONS = [
  {cue: 'Ms. Renner has just arrived at check-in. This is the very first moment of her day with you.', correct:'welcoming', wrongs:['supporting','closing']},
  {cue: "Her flight landed late and her treatment slot isn't ready yet, but you've arranged a quiet lounge for her to wait in.", correct:'supporting', wrongs:['welcoming','closing']},
  {cue: 'Her whole day is finished, and Beam is about to hand her the personal thank-you note.', correct:'closing', wrongs:['welcoming','supporting']}
];

/* ===== Section 6: Listening Script — "Planning the Day" =====
   Two characters: Fern (wellness coordinator) and Beam (colleague),
   planning VIP guest Ms. Renner's whole day together. */
const BEFORE_LISTEN = {
  setup: "Fern and Beam plan VIP guest Ms. Renner's whole day together. Listen and find out what they decide for each stage.",
  guesses: [
    'They only plan the welcome email and nothing else.',
    'They plan every stage: welcome, arrival, support, and farewell.',
    'They decide not to do anything special for her.',
    'They plan only the farewell message.'
  ]
};
const LISTEN = {
  intro: "The Wellness Office. Fern and Beam are planning the full day for VIP guest Ms. Renner.",
  lines: [
    {who:'Fern', text:"Let's plan Ms. Renner's whole day, not just her arrival. What have we got so far?", kind:'staff'},
    {who:'Beam', text:"I've drafted her welcome email, personalized with a note about the stress-relief program she requested.", kind:'delegate'},
    {who:'Fern', text:"Good start. For arrival, let's make sure someone greets her by name at check-in, not just hands her a room key.", kind:'staff'},
    {who:'Beam', text:"I'll brief the front desk team. What about during the day itself?", kind:'delegate'},
    {who:'Fern', text:"Let's be proactive there. I know her flight lands late, so her preferred treatment slot might not be available. Let's prepare a backup plan just in case.", kind:'staff'},
    {who:'Beam', text:"Smart. I'll arrange a quiet lounge space, so if her slot isn't ready, she has somewhere comfortable to wait.", kind:'delegate'},
    {who:'Fern', text:"Perfect, that's exactly the kind of touchpoint that makes the day feel seamless. Last thing, the farewell.", kind:'staff'},
    {who:'Beam', text:"I'll craft a personal thank-you note mentioning something specific from her stay, not just a generic goodbye.", kind:'delegate'},
    {who:'Fern', text:"Excellent. That's her whole day planned, start to finish."}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What did Beam personalize in the welcome email?', opts:['The room number','A note about the stress-relief program Ms. Renner requested','The flight schedule'], correct:1},
  {q:'What does Fern want to happen at arrival?', opts:['Nothing special, just hand her a room key','Someone greets her by name at check-in','She waits in line like everyone else'], correct:1},
  {q:'What potential problem do Fern and Beam anticipate?', opts:['Her flight might be canceled','Her preferred treatment slot might not be ready when she arrives','She might not attend at all'], correct:1},
  {q:'What proactive solution does Beam arrange?', opts:['A free upgrade','A quiet lounge space in case the slot is not ready','Nothing, they will wait and see'], correct:1},
  {q:'What kind of farewell does Beam plan to craft?', opts:['A generic goodbye card','A personal thank-you note mentioning something specific from her stay','No farewell at all'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Thinking about the whole day, not just one stage', example:"\"Let's plan Ms. Renner's whole day, not just her arrival.\""},
  {strategy:'Personalizing a message with a specific detail', example:'"...personalized with a note about the stress-relief program she requested."'},
  {strategy:'Anticipating a problem before it happens', example:"\"Her preferred treatment slot might not be ready... let's prepare a backup plan just in case.\""},
  {strategy:'Connecting a proactive solution back to the guest experience', example:"\"That's exactly the kind of touchpoint that makes the day feel seamless.\""},
  {strategy:'Ending with a personal, specific farewell instead of a generic one', example:'"...mentioning something specific from her stay, not just a generic goodbye."'}
];

/* ===== Section 6b: Build the Day =====
   PAIR/individual CREATE task: students write their own original message
   for each of four touchpoints in the guest's day, using a scenario prompt
   and placeholder for support, then check their work against a model. This
   is Unit 15's distinct mechanic and the course's final integration task. */
const JOURNEY_STAGES = [
  {key:'welcome', label:'1. Welcome Email (Pre-Arrival)', prompt:'Write one or two sentences welcoming VIP guest Ms. Renner and mentioning one detail about her wellness goal.', placeholder:'e.g. Dear Ms. Renner, we are delighted to welcome you to...'},
  {key:'arrival', label:'2. Arrival Greeting', prompt:'Write what you would say when Ms. Renner arrives at check-in.', placeholder:'e.g. Welcome, Ms. Renner! We are so glad...'},
  {key:'recovery', label:'3. Problem Recovery', prompt:"Ms. Renner mentions her preferred treatment slot isn't ready yet. Write your calm, proactive response.", placeholder:'e.g. I completely understand, and I have already arranged...'},
  {key:'farewell', label:'4. Farewell Message', prompt:'Write your farewell message as Ms. Renner leaves the resort.', placeholder:'e.g. Thank you so much for joining us, Ms. Renner...'}
];
const MODEL_JOURNEY = [
  {key:'welcome', text:'"Dear Ms. Renner, we are delighted to welcome you to Harmony Wellness Resort, and we\'ve arranged your stress-relief program to begin right after your check-in, exactly as you requested."'},
  {key:'arrival', text:'"Welcome, Ms. Renner! It\'s wonderful to finally meet you in person. Let me personally show you to check-in."'},
  {key:'recovery', text:'"I completely understand, and I\'ve already arranged a quiet lounge space for you in the meantime, so you can relax comfortably while your treatment room is prepared."'},
  {key:'farewell', text:'"Thank you so much for joining us, Ms. Renner. It\'s been a genuine pleasure hosting you, especially seeing you enjoy the stress-relief program you were so looking forward to. Take care, and we hope to welcome you again soon."'}
];

/* ===== Section 8: Speaking Practice — Role-Play ===== */
const ROLEPLAY_CARDS = {
  staff:{title:'Role Card A: Wellness Coordinator', body:"You guide Ms. Renner through her whole day today.",
    role:'Perform all four touchpoints from Section 9, in order, as one connected mini-scene.',
    phrases:["Welcome, we're so glad you're here.", 'Let me take care of that for you.', "I've already arranged...", 'Thank you so much for joining us.']},
  visitor:{title:'Role Card B: Ms. Renner (VIP Guest)', body:'You are the VIP guest experiencing the day.',
    role:'React naturally at each stage, including mentioning the treatment-slot problem at the right moment.',
    phrases:["Thank you, I'm looking forward to this.", 'Actually, I have a small problem…', "That's very kind of you, thank you.", "It's been a wonderful stay."]}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'Design the day for a first-time guest instead of a VIP. How does your approach change?'},
  {tag:'Scenario 2', text:'A second small problem happens right after you solve the first one. Stay proactive and calm.'},
  {tag:'Scenario 3', text:'The guest mentions this is her first wellness retreat ever, and she\'s a little nervous. How does that change your welcome?'}
];

/* ===== Capstone Review (Remember-level review, replaces the crossword slot) =====
   Light, untimed recall touching one key word from each of Units 9-15, since
   this is the last unit before the course closes. Definition first, pick the
   matching word, same identification shape as Unit 10's own review slot. */
const CAPSTONE_REVIEW = [
  {unit:9, def:'A planned set of wellness activities or treatments over several days.', options:['Overview','Program','Recommend','Trade-Off'], correct:1},
  {unit:10, def:'To compare two sources of information to make sure they match.', options:['Coordinate','Itinerary','Cross-Check','Verify'], correct:2},
  {unit:11, def:'The real, original reason a problem happened, not just its symptoms.', options:['Evidence','Root Cause','Sensitivity','Proactive'], correct:1},
  {unit:12, def:'Giving up one good thing to get another good thing.', options:['Budget','Compare','Trade-Off','Milestone'], correct:2},
  {unit:13, def:'Careful and polite, especially when saying something difficult.', options:['Policy','Tier','Entitlement','Diplomatic'], correct:3},
  {unit:14, def:'To make a tense or worrying situation calmer.', options:['Monitor','Companion','De-escalate','Incident'], correct:2},
  {unit:15, def:'A moment when a guest interacts with the resort team.', options:['Farewell','Craft','Touchpoint','Itinerary'], correct:2}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did each message feel personalized, not generic?',
  'Did the arrival greeting feel warm and specific?',
  'Was the problem recovery calm and proactive?',
  'Did the farewell feel genuine, not just a quick goodbye?',
  'Did all four messages feel connected, like one day?',
  'Did their language sound professional and confident throughout?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'Design the day for a group of 5 first-time wellness guests, from their first email to their farewell after a group retreat.'},
  {tag:'Situation B', text:'Design the MICE delegate journey for a guest attending their first-ever wellness-themed conference, from booking confirmation to their farewell.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Choose ONE touchpoint you have NOT written yet in this unit, and write an original message (4–6 sentences) for a new guest of your choice.',
  discussion: [
    {title:'Tourism Business Management', text:'Design the arrival touchpoint for a group of international conference delegates attending a wellness-themed MICE event for the first time.'},
    {title:'Wellness Tourism Management', text:'Design the farewell touchpoint for a guest completing a 5-day wellness retreat, someone who arrived stressed and is leaving feeling renewed.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Journey Vocabulary', sub:'I can use touchpoint, journey, personalize, and proactive correctly.'},
  {k:'create', lbl:'Creating Original Messages', sub:'I can create my own original message for a specific touchpoint.'},
  {k:'personalize', lbl:'Personalizing a Message', sub:'I can personalize a message so it feels specific, not generic.'},
  {k:'integrate', lbl:'Integrating the Whole Day', sub:"I can design a connected set of messages across a guest's whole day."},
  {k:'confidence', lbl:'Overall Confidence', sub:'I feel confident using the English skills from Units 9 to 15 together.'}
];

/* ===== Surprise Twist (revealed after Section 8's performance) =====
   Reuses the shared SURPRISE_CHALLENGE shape (js/mission-components.js),
   the same one Unit 9 pioneered — Unit 15 is the second consumer here too,
   mirroring MICE Unit 15's own capstone integration exactly. */
const SURPRISE_CHALLENGE = {
  facts: [
    "It's mid-morning during Ms. Renner's wellness day, and everything has gone perfectly so far.",
    'A message arrives: the wellness coach she specifically requested by name has a sudden family emergency and cannot see her today.'
  ],
  message: 'Ms. Renner has no idea yet. Her session with that coach is in twenty minutes.',
  question: 'What do you do?',
  options: [
    {text:'Let her show up to the session and find out from an empty room.', good:false, note:"A guest should never discover a change to her own plans by walking into an empty room. Tell her yourself, right away."},
    {text:'Tell her proactively, and reassure her the team is already handling it.', good:true, note:'Exactly the proactive instinct this unit has been building toward — solve it before she even has to ask.'},
    {text:'Cancel the session outright and say nothing further until tomorrow.', good:false, note:'This avoids the awkward conversation but takes away her choice entirely, and leaves her with nothing for the time she had set aside.'},
    {text:'Explain what happened, and offer her a real choice: a highly-rated substitute coach now, or her original coach rescheduled tomorrow.', good:true, note:'A thoughtful compromise — honest about what happened, and it puts her back in control of her own day.'}
  ],
  liveTask: "Now perform it: with your partner, act out this exact moment as a continuation of your Section 9 journey. One of you is the Wellness Coordinator delivering this news, one of you is Ms. Renner reacting to it."
};

/* ===================== TEACHER GUIDE (courses/wellness/unit-15/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: "Unit 15: Designing a Guest's Wellness Day",
  learningOutcome: "Students write four original, connected messages across a VIP guest's whole day (welcome, arrival, problem recovery, farewell), integrating program explanation, information handling, root-cause thinking, comparison, difficult decisions, and multi-audience messaging from Units 9-14 into one CREATE-level capstone.",
  bloomsLevel: 'Create / Integration',
  addieFocus: 'This is the capstone: no new mechanic to learn for Section 9, just the deliberate combination of every skill built across Units 9-14 into one connected piece of original writing and performance, plus a late Surprise Twist that tests whether the proactive, honest instincts from Unit 14 hold up under a new, unplanned wrinkle.',
  grouping: 'Pairs for Section 9 (Build the Day), Section 10 (Perform the Day), and the Surprise Twist — no private information here, so one shared device per pair is fine.',
  timing: [
    {block:'Warm-Up: One Guest, One Whole Day', time:'15 min', ref:'Section 1'},
    {block:'Key Vocabulary', time:'15 min', ref:'Section 2'},
    {block:'Sort the Requests', time:'10 min', ref:'Section 3'},
    {block:'Vocabulary Activities', time:'20 min', ref:'Section 4'},
    {block:'Reading', time:'15 min', ref:'Section 5'},
    {block:'What Would You Say?', time:'10 min', ref:'Section 6'},
    {block:'Listening: Planning the Day', time:'15 min', ref:'Section 7'},
    {block:'After Listening', time:'10 min', ref:'Section 8'},
    {block:'Build the Day (Capstone Writing)', time:'25 min', ref:'Section 9'},
    {block:'Speaking Practice: Perform the Day', time:'20 min', ref:'Section 10'},
    {block:'Surprise Twist', time:'10 min', ref:'Section 11'},
    {block:'Capstone Review, Peer Checklist, Writing, Self-Check', time:'25 min', ref:'Sections 12-15'}
  ],
  materials: [
    'No special materials beyond a device per pair — this capstone reuses skills from every prior unit rather than introducing new content'
  ],
  teacherPrompts: [
    'Before Section 9: "Which earlier unit does each of the four touchpoints remind you of — program explanation, information handling, or something else?"',
    'During Section 9: "Does your farewell message actually connect back to something specific from your welcome email?"',
    'At the Surprise Twist: "Does your response here stay consistent with the proactive, honest habits you practiced in Unit 14?"'
  ],
  commonProblems: [
    {problem: 'Students treat the four touchpoints as separate, unconnected tasks.', fix: 'Point them back to the Reading (Section 5), which explicitly frames the day as one connected experience, not four separate ones — a strong answer references a detail from an earlier touchpoint in a later one.'},
    {problem: 'A pair finishes Section 9 quickly with generic, unpersonalized messages.', fix: 'Push them to add one specific, invented detail per message (a name, a preference, a small fact) — genuinely personalized writing is the actual assessment target here, not just grammatical correctness.'}
  ],
  fastClassExtension: 'Have pairs design a fifth touchpoint the course never covered (e.g. a mid-day check-in) and justify why it belongs in the day.',
  slowClassCompression: 'Section 3 (Sort the Requests) and Section 8 (After Listening) can be assigned as homework if time is short — neither gates a later section.',
  assessment: "Speaking (Perform the Day, Section 10) and Writing (both Section 9's four touchpoints and Section 13's new one) are the primary grading points for this capstone; the self-check in Section 15 is student-reflective, not evaluative."
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: "Unit 15: Designing a Guest's Wellness Day",
  unitCode: 'unit-15'
};
