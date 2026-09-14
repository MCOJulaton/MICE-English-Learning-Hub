/* ===================== UNIT 15 CONTENT DATA — DESIGNING THE DELEGATE JOURNEY =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   journey-building task, rubric. Nothing here is UI logic — see app.js for
   rendering/state/voice/progress-tracking.

   Bloom's level: CREATE / INTEGRATION. This is the final unit before the real
   Midterm-review-style workbook content resumes (this site stops at Unit 15,
   per the instructor's explicit boundary: Unit 16 and the real final exam are
   out of scope). Students design and write FOUR original messages across a
   VIP delegate's whole journey (welcome email, arrival greeting, a problem
   recovery moment, and a farewell), in PAIRS, pulling together booth pitching
   (Unit 9), information handling (Unit 10), root-cause thinking (Unit 11),
   comparison and justification (Unit 12), difficult decisions (Unit 13), and
   multi-audience messaging (Unit 14) into one connected, original piece of
   work. Invented content, part of the Units 9-15 OBE/Bloom's expansion, not
   drawn from the official workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'One Guest, One Whole Journey'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Sort the Requests'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: Planning the Journey'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Build the Journey'},
  {key:'s8', label:'Speaking Practice'},
  {key:'surprise', label:'Surprise Twist'},
  {key:'crossword', label:'Capstone Review'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: One Guest, One Whole Journey =====
   Opens as an incoming client brief instead of a plain facts list, matching
   the "assignment just landed" framing already used for Unit 12's opening. */
const OPENING_SCENARIO = {
  clientMessage: {
    from: 'director@thailandforum.org',
    subject: 'VIP Journey Plan Needed: Mr. Larsson',
    body: "Team, Mr. Larsson arrives in two days and this is our top VIP journey this quarter. I need the full plan today: a welcome email, an arrival greeting, a proactive plan in case anything goes wrong, and a farewell message. Please have a complete draft ready by end of day."
  },
  message: 'You are designing the entire journey for one VIP delegate, from first email to final farewell.',
  question: 'What should guide your design?',
  options: [
    {text:"Think about the guest's experience at every single touchpoint.", good:true, note:'Exactly right. The whole journey matters, not just one big moment.'},
    {text:'Only focus on the biggest, most visible moment.', good:false, note:'Small moments, like a warm email or a remembered name, matter just as much as big ones.'},
    {text:'Make every message feel personal, not generic.', good:true, note:'Yes. A guest can always tell the difference between a real message and a copy-paste.'},
    {text:'Copy the exact same message for every guest, every time.', good:false, note:"A guest notices when a message feels generic. Personalizing it makes the journey feel real."},
    {text:'Plan for something to go wrong, and prepare a calm response.', good:true, note:'A great instinct. The best journeys still include a plan for recovery, not just the perfect path.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'Pre-Event', point:'Confirmation email sent', where:'Personalized, sets the first impression'},
  {time:'Arrival', point:'Welcome and registration', where:'The first face-to-face moment'},
  {time:'During the Event', point:'Guidance and support', where:'Answering questions, solving small problems'},
  {time:'A Problem Occurs', point:'Proactive recovery', where:'Solved calmly, before it becomes a bigger issue'},
  {time:'Departure', point:'Farewell message', where:"The final impression, and what they'll remember"}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's overview of the delegate journey. Pre-event, a confirmation email is sent, personalized, and it sets the first impression. At arrival, there's the welcome and registration, the first face-to-face moment. During the event, we offer guidance and support, answering questions and solving small problems. If a problem occurs, we respond proactively, solving it calmly before it becomes bigger. And at departure, a farewell message leaves the final impression, the thing they'll actually remember.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'itinerary', ic:'🗺️', nm:'Itinerary', type:'n.', def:'A planned route or schedule for a journey or visit.', ex:"We sent the delegate their full itinerary in advance."},
  {id:'touchpoint', ic:'📍', nm:'Touchpoint', type:'n.', def:'A moment when a guest interacts with the event team.', ex:"The welcome email is the guest's first touchpoint."},
  {id:'journey', ic:'🧭', nm:'Journey', type:'n.', def:'The whole experience a guest has, from start to finish.', ex:"Think about the guest's whole journey, not just one moment."},
  {id:'seamless', ic:'🪡', nm:'Seamless', type:'adj.', def:'Smooth, without any noticeable problems or breaks.', ex:'A seamless experience feels effortless to the guest.'},
  {id:'personalize', ic:'✍️', nm:'Personalize', type:'v.', def:'To make something feel special and specific to one person.', ex:"Personalize the welcome message with the guest's name."},
  {id:'integrate', ic:'🧩', nm:'Integrate', type:'v.', def:'To combine different parts into one smooth whole.', ex:"Integrate everything you've learned into one experience."},
  {id:'milestone', ic:'🚩', nm:'Milestone', type:'n.', def:'An important point or stage in a process.', ex:'Registration is the first milestone in the guest journey.'},
  {id:'proactive', ic:'⚡', nm:'Proactive', type:'adj.', def:'Acting before a problem happens, not just reacting.', ex:'Be proactive: solve small problems before the guest notices.'},
  {id:'farewell', ic:'👋', nm:'Farewell', type:'n.', def:'A goodbye, especially a polite or formal one.', ex:'End with a warm farewell message.'},
  {id:'craft', ic:'🎨', nm:'Craft', type:'v.', def:'To carefully create something with skill.', ex:'Craft a message that feels personal, not generic.'}
];
const VOCAB_SECONDARY = [
  {id:'firstimpression', nm:'First Impression', def:'The feeling someone gets the very first time they interact with you.'},
  {id:'lastingmemory', nm:'Lasting Memory', def:'What someone remembers and keeps thinking about after an experience ends.'},
  {id:'genuine', nm:'Genuine', def:'Real and sincere, not fake or forced.'},
  {id:'anticipate', nm:'Anticipate', def:'To expect something and prepare for it before it happens.'},
  {id:'wraparound', nm:'End-to-End', def:'Covering the entire process, from the very beginning to the very end.'}
];

/* ===== Section 2b: Sort the Requests (light categorization) =====
   A warm-up before Section 9's Build the Journey task: sort the client's
   notes into the journey stage each one belongs to, so students are already
   thinking in four stages before they have to write in four stages. Same
   underlying objective as before (getting the whole journey scenario clear
   in students' minds), presented as a lighter categorization task rather
   than a full choose-and-explain challenge, since Section 9 already carries
   this unit's major Create-level demand. */
const STAGE_LABELS = {welcome:'Welcome', arrival:'Arrival', recovery:'Recovery', farewell:'Farewell'};
const CLIENT_REQUESTS = [
  {text:'Mention the keynote he specifically asked to attend.', stage:'welcome'},
  {text:"Confirm his seat is reserved near the front.", stage:'welcome'},
  {text:'Greet him by name, not just hand him a badge.', stage:'arrival'},
  {text:'Have someone personally walk him to registration.', stage:'arrival'},
  {text:"Arrange a backup plan in case his room isn't ready.", stage:'recovery'},
  {text:'Offer lounge access if anything is delayed.', stage:'recovery'},
  {text:'Send a personal thank-you mentioning something from his visit.', stage:'farewell'},
  {text:"Don't let it end with just a generic goodbye.", stage:'farewell'}
];

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'itinerary', word:'Itinerary', meaning:'A planned route or schedule for a journey or visit'},
  {id:'touchpoint', word:'Touchpoint', meaning:'A moment when a guest interacts with the event team'},
  {id:'journey', word:'Journey', meaning:'The whole experience a guest has, from start to finish'},
  {id:'seamless', word:'Seamless', meaning:'Smooth, without any noticeable problems or breaks'},
  {id:'personalize', word:'Personalize', meaning:'To make something feel special and specific to one person'},
  {id:'milestone', word:'Milestone', meaning:'An important point or stage in a process'},
  {id:'proactive', word:'Proactive', meaning:'Acting before a problem happens, not just reacting'},
  {id:'farewell', word:'Farewell', meaning:'A goodbye, especially a polite or formal one'}
];

const FILL_BLANK = [
  {q:'We sent the delegate their full __________ in advance.', a:'itinerary'},
  {q:"The welcome email is the guest's first __________.", a:'touchpoint'},
  {q:"Think about the guest's whole __________, not just one moment.", a:'journey'},
  {q:'A __________ experience feels effortless to the guest.', a:'seamless'},
  {q:"__________ the welcome message with the guest's name.", a:'personalize'},
  {q:'Registration is the first __________ in the guest journey.', a:'milestone'},
  {q:'Be __________: solve small problems before the guest notices.', a:'proactive'},
  {q:'End with a warm __________ message.', a:'farewell'}
];

const VOCAB_SITUATIONS = [
  {q:'You are writing a welcome email for a specific guest. How do you make it feel real, not generic?', model:'"I always personalize it, mentioning something specific about their visit or interests."'},
  {q:'A small problem could happen later in the day. What is the proactive approach?', model:'"I try to anticipate it and prepare a plan before the guest even notices anything is wrong."'},
  {q:'A guest is leaving after a great event. What kind of message do you craft?', model:'"I craft a genuine farewell that leaves a lasting memory, not just a quick goodbye."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Designing the Complete Guest Journey',
  paragraphs: [
    'Every skill covered so far in this course, greeting a visitor, handling information, finding a root cause, comparing options, making a difficult decision, and communicating to different audiences, comes together in one place: the complete guest journey.',
    'A guest experiences an event as a series of touchpoints: an email before they arrive, a greeting at registration, small moments of guidance throughout the day, and a farewell as they leave. Each touchpoint is a small opportunity to either build trust or lose it.',
    'The best event professionals think about the whole journey as one connected experience, not a set of separate tasks. A guest who receives a personalized welcome email, is greeted warmly by name, has a small problem solved proactively, and leaves with a genuine farewell remembers the event as seamless, even if small things went wrong along the way.',
    'Integrating these moments takes craft. It means anticipating what a guest might need at each stage, and personalizing the message for that specific moment, rather than repeating the same generic script everywhere.',
    'For Wellness Tourism professionals, this same thinking applies to a guest\'s wellness journey: from the first booking confirmation, through a warmly guided arrival, any small adjustment made along the way, to a heartfelt farewell that makes them want to return.'
  ]
};
const READING_QUESTIONS = [
  {q:'What does the article say comes together in the complete guest journey?', opts:['Only the final exam','Every skill covered in the course, from greeting to crisis communication','Only the welcome email'], correct:1},
  {q:'What is a "touchpoint," according to the article?', opts:['A type of venue map','A small opportunity, at each stage of a guest\'s visit, to build or lose trust','A kind of sponsorship contract'], correct:1},
  {q:'How do the best event professionals think about the guest journey?', opts:['As many separate, unrelated tasks','As one connected experience, not separate tasks','As only the arrival moment'], correct:1},
  {q:'What does "integrating" these moments require, according to the article?', opts:['Repeating the same generic script everywhere','Anticipating guest needs and personalizing each message','Avoiding contact with the guest'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  welcoming:{title:'Starting the Journey', items:[
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
  closing:{title:'Ending the Journey', items:[
    'Thank you so much for joining us.',
    "It's been a pleasure having you here.",
    'We hope to see you again soon.',
    'Safe travels, and take care.'
  ]}
};

/* ===== Section 6: Listening Script — "Planning the Journey" =====
   Two characters: Fern (event coordinator) and Beam (colleague), planning
   VIP delegate Mr. Larsson's whole journey together. */
const BEFORE_LISTEN = {
  setup: 'Fern and Beam plan VIP delegate Mr. Larsson\'s whole journey together. Listen and find out what they decide for each stage.',
  guesses: [
    'They only plan the welcome email and nothing else.',
    'They plan every stage: welcome, arrival, support, and farewell.',
    'They decide not to do anything special for him.',
    'They plan only the farewell message.'
  ]
};
const LISTEN = {
  intro: 'The Events Office. Fern and Beam are planning the full journey for VIP delegate Mr. Larsson.',
  lines: [
    {who:'Fern', text:"Let's plan Mr. Larsson's whole journey, not just his arrival. What have we got so far?", kind:'staff'},
    {who:'Beam', text:"I've drafted his welcome email, personalized with a note about the keynote he requested to attend.", kind:'delegate'},
    {who:'Fern', text:'Good start. For arrival, let\'s make sure someone greets him by name at registration, not just hands him a badge.', kind:'staff'},
    {who:'Beam', text:'I\'ll brief the registration team. What about during the event itself?', kind:'delegate'},
    {who:'Fern', text:"Let's be proactive there. I know his flight lands late, so his hotel room might not be ready right when he arrives. Let's prepare a backup plan just in case.", kind:'staff'},
    {who:'Beam', text:'Smart. I\'ll arrange a lounge access pass, so if his room isn\'t ready, he has somewhere comfortable to wait.', kind:'delegate'},
    {who:'Fern', text:'Perfect, that\'s exactly the kind of touchpoint that makes the journey feel seamless. Last thing, the farewell.', kind:'staff'},
    {who:'Beam', text:"I'll craft a personal thank-you note mentioning something specific from his visit, not just a generic goodbye.", kind:'delegate'},
    {who:'Fern', text:"Excellent. That's his whole journey planned, start to finish."}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What did Beam personalize in the welcome email?', opts:['The room number','A note about the keynote Mr. Larsson requested to attend','The flight schedule'], correct:1},
  {q:'What does Fern want to happen at arrival?', opts:['Nothing special, just hand him a badge','Someone greets him by name at registration','He waits in line like everyone else'], correct:1},
  {q:'What potential problem do Fern and Beam anticipate?', opts:['His flight might be canceled','His hotel room might not be ready when he arrives','He might not attend at all'], correct:1},
  {q:'What proactive solution does Beam arrange?', opts:['A free upgrade','Lounge access in case the room is not ready','Nothing, they will wait and see'], correct:1},
  {q:'What kind of farewell does Beam plan to craft?', opts:['A generic goodbye card','A personal thank-you note mentioning something specific from the visit','No farewell at all'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Thinking about the whole journey, not just one stage', example:"\"Let's plan Mr. Larsson's whole journey, not just his arrival.\""},
  {strategy:'Personalizing a message with a specific detail', example:'"...personalized with a note about the keynote he requested to attend."'},
  {strategy:'Anticipating a problem before it happens', example:'"...his hotel room might not be ready... let\'s prepare a backup plan just in case."'},
  {strategy:'Connecting a proactive solution back to the guest experience', example:"\"That's exactly the kind of touchpoint that makes the journey feel seamless.\""},
  {strategy:'Ending with a personal, specific farewell instead of a generic one', example:'"...mentioning something specific from his visit, not just a generic goodbye."'}
];

/* ===== Section 6b: Build the Journey =====
   PAIR/individual CREATE task: students write their own original message
   for each of four touchpoints in the delegate journey, using a scenario
   prompt and placeholder for support, then check their work against a
   model journey. This is Unit 15's distinct mechanic and the course's
   final integration task. */
const JOURNEY_STAGES = [
  {key:'welcome', label:'1. Welcome Email (Pre-Event)', prompt:'Write one or two sentences welcoming VIP delegate Mr. Larsson and mentioning one detail about the event.', placeholder:'e.g. Dear Mr. Larsson, we are delighted to welcome you to...'},
  {key:'arrival', label:'2. Arrival Greeting', prompt:'Write what you would say when Mr. Larsson arrives at registration.', placeholder:'e.g. Welcome, Mr. Larsson! We are so glad...'},
  {key:'recovery', label:'3. Problem Recovery', prompt:"Mr. Larsson mentions his room isn't ready yet. Write your calm, proactive response.", placeholder:'e.g. I completely understand, and I have already arranged...'},
  {key:'farewell', label:'4. Farewell Message', prompt:'Write your farewell message as Mr. Larsson leaves the event.', placeholder:'e.g. Thank you so much for joining us, Mr. Larsson...'}
];
const MODEL_JOURNEY = [
  {key:'welcome', text:'"Dear Mr. Larsson, we are delighted to welcome you to the Thailand Health and Business Tourism Forum, and we\'ve reserved your seat at the front for the keynote you specifically requested."'},
  {key:'arrival', text:'"Welcome, Mr. Larsson! It\'s wonderful to finally meet you in person. Let me personally show you to registration."'},
  {key:'recovery', text:'"I completely understand, and I\'ve already arranged lounge access for you in the meantime, so you can relax comfortably while your room is prepared."'},
  {key:'farewell', text:'"Thank you so much for joining us, Mr. Larsson. It\'s been a genuine pleasure hosting you, especially seeing you enjoy the keynote you were so looking forward to. Safe travels, and we hope to welcome you again soon."'}
];

/* ===== Section 8: Speaking Practice — Role-Play ===== */
const ROLEPLAY_CARDS = {
  staff:{title:'Role Card A: Event Coordinator', body:'You guide Mr. Larsson through his whole journey today.',
    role:'Perform all four touchpoints from Section 9, in order, as one connected mini-scene.',
    phrases:["Welcome, we're so glad you're here.", 'Let me take care of that for you.', "I've already arranged...", 'Thank you so much for joining us.']},
  visitor:{title:'Role Card B: Mr. Larsson (VIP Delegate)', body:'You are the VIP delegate experiencing the journey.',
    role:'React naturally at each stage, including mentioning the room problem at the right moment.',
    phrases:['Thank you, I\'m looking forward to this.', 'Actually, I have a small problem…', 'That\'s very kind of you, thank you.', "It's been a wonderful visit."]}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'Design the journey for a first-time delegate instead of a VIP. How does your approach change?'},
  {tag:'Scenario 2', text:'A second small problem happens right after you solve the first one. Stay proactive and calm.'},
  {tag:'Scenario 3', text:'The delegate mentions this is their last MICE event before retiring. How does that change your farewell message?'}
];

/* ===== Capstone Review (Remember-level review, replaces the crossword slot) =====
   Light, untimed recall touching one key word from each of Units 9-15, since
   this is the last unit before the course closes. Definition first, pick the
   matching word, same identification shape as Unit 10's own review slot. */
const CAPSTONE_REVIEW = [
  {unit:9, def:'A small stand or display area at an exhibition.', options:['Visitor','Booth','Exhibitor','Outage'], correct:1},
  {unit:10, def:'A difference between two pieces of information that should match.', options:['Coordinate','Trade-Off','Discrepancy','Itinerary'], correct:2},
  {unit:11, def:'The real, original reason a problem happened, not just its symptoms.', options:['Evidence','Root Cause','Conflict','Proactive'], correct:1},
  {unit:12, def:'Giving up one good thing to get another good thing.', options:['Budget','Compare','Trade-Off','Milestone'], correct:2},
  {unit:13, def:'Only for one person or company, not shared with others.', options:['Sponsor','Seamless','Policy','Exclusive'], correct:3},
  {unit:14, def:'A period when power or a service stops working.', options:['Backup','Journey','Outage','Contain'], correct:2},
  {unit:15, def:'A moment when a guest interacts with the event team.', options:['Farewell','Craft','Touchpoint','Itinerary'], correct:2}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did each message feel personalized, not generic?',
  'Did the arrival greeting feel warm and specific?',
  'Was the problem recovery calm and proactive?',
  'Did the farewell feel genuine, not just a quick goodbye?',
  'Did all four messages feel connected, like one journey?',
  'Did their language sound professional and confident throughout?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'Design the journey for a group of 5 first-time exhibitors, from their first email to their farewell after the exhibition.'},
  {tag:'Situation B', text:'Design the wellness journey for a guest attending their first-ever spa retreat, from booking confirmation to their farewell.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Choose ONE touchpoint you have NOT written yet in this unit, and write an original message (4–6 sentences) for a new guest of your choice.',
  discussion: [
    {title:'Tourism Business Management', text:'Design the arrival touchpoint for a group of international trade-fair exhibitors visiting Thailand for the first time.'},
    {title:'Wellness Tourism Management', text:'Design the farewell touchpoint for a guest completing a 5-day wellness retreat, someone who arrived stressed and is leaving feeling renewed.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Journey Vocabulary', sub:'I can use touchpoint, journey, personalize, and proactive correctly.'},
  {k:'create', lbl:'Creating Original Messages', sub:'I can create my own original message for a specific touchpoint.'},
  {k:'personalize', lbl:'Personalizing a Message', sub:'I can personalize a message so it feels specific, not generic.'},
  {k:'integrate', lbl:'Integrating the Whole Journey', sub:'I can design a connected set of messages across a guest\'s whole visit.'},
  {k:'confidence', lbl:'Overall Confidence', sub:'I feel confident using the English skills from Units 9 to 15 together.'}
];

/* ===== Surprise Challenge: a mid-presentation twist =====
   Reuses the shared SURPRISE_CHALLENGE shape (js/mission-components.js),
   the same one Unit 9 pioneered — Unit 15 is the second consumer now that
   a capstone unit needs the identical mechanic. Revealed after Section 8's
   performance, matching Unit 9's own placement late in the lesson. */
const SURPRISE_CHALLENGE = {
  facts: [
    "It's the afternoon of Mr. Larsson's visit, and his journey has gone perfectly so far.",
    'A message arrives: his flight home has been moved up two hours, departing much sooner than planned.'
  ],
  message: 'He still wants to attend the closing keynote, but now he may need to leave the event early to catch his new flight.',
  question: 'What do you do?',
  options: [
    {text:'Let him find out on his own when he checks his phone later.', good:false, note:"A guest should never have to discover a change to their own plans by accident. Tell him yourself, right away."},
    {text:'Tell him proactively, and offer to arrange transport timed around the new departure.', good:true, note:'Exactly the proactive instinct this unit has been building toward — solve it before he even has to ask.'},
    {text:'Suggest he skip the keynote entirely to be safe.', good:false, note:'This solves the transport problem but ignores what he actually cares about — seeing the keynote was the whole reason he wanted a front-row seat.'},
    {text:'Offer to have someone quietly signal him partway through the keynote if he needs to leave.', good:true, note:'A thoughtful compromise — he still gets to attend, and leaves with dignity rather than awkwardly interrupting himself.'}
  ],
  liveTask: 'Now perform it: with your partner, act out this exact moment as a continuation of your Section 9 journey. One of you is the Event Coordinator delivering this news, one of you is Mr. Larsson reacting to it.'
};

/* ===================== TEACHER GUIDE (courses/mice/unit-15/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Unit 15: Designing the Delegate Journey',
  learningOutcome: 'Students write four original, connected messages across a VIP delegate\'s whole journey (welcome, arrival, problem recovery, farewell), integrating booth pitching, information handling, root-cause thinking, comparison, difficult decisions, and multi-audience messaging from Units 9-14 into one CREATE-level capstone.',
  bloomsLevel: 'Create / Integration',
  addieFocus: 'This is the capstone: no new mechanic to learn, just the deliberate combination of every skill built across Units 9-14 into one connected piece of original writing and performance.',
  grouping: 'Pairs for Section 9 (Build the Journey) and Section 10 (Perform the Journey) — no private information here, so one shared device per pair is fine.',
  timing: [
    {block:'Warm-Up: One Guest, One Whole Journey', time:'15 min', ref:'Section 1'},
    {block:'Key Vocabulary', time:'15 min', ref:'Section 2'},
    {block:'Sort the Requests', time:'10 min', ref:'Section 3'},
    {block:'Vocabulary Activities', time:'20 min', ref:'Section 4'},
    {block:'Reading', time:'15 min', ref:'Section 5'},
    {block:'Useful Phrases', time:'10 min', ref:'Section 6'},
    {block:'Listening: Planning the Journey', time:'15 min', ref:'Section 7'},
    {block:'After Listening', time:'10 min', ref:'Section 8'},
    {block:'Build the Journey (Capstone Writing)', time:'25 min', ref:'Section 9'},
    {block:'Speaking Practice: Perform the Journey', time:'20 min', ref:'Section 10'},
    {block:'Capstone Review, Peer Checklist, Writing, Self-Check', time:'25 min', ref:'Sections 11-14'}
  ],
  materials: [
    'No special materials beyond a device per pair — this capstone reuses skills from every prior unit rather than introducing new content'
  ],
  teacherPrompts: [
    'Before Section 9: "Which earlier unit does each of the four touchpoints remind you of — booth pitching, information handling, or something else?"',
    'During Section 9: "Does your farewell message actually connect back to something specific from your welcome email?"',
    'After Section 10: "If you had to cut one of the four touchpoints, which would hurt the guest experience the most, and why?"'
  ],
  commonProblems: [
    {problem: 'Students treat the four touchpoints as separate, unconnected tasks.', fix: 'Point them back to the Reading (Section 5), which explicitly frames the journey as one connected experience, not four separate ones — a strong answer references a detail from an earlier touchpoint in a later one.'},
    {problem: 'A pair finishes Section 9 quickly with generic, unpersonalized messages.', fix: 'Push them to add one specific, invented detail per message (a name, a preference, a small fact) — genuinely personalized writing is the actual assessment target here, not just grammatical correctness.'}
  ],
  fastClassExtension: 'Have pairs design a fifth touchpoint the course never covered (e.g. a mid-event check-in) and justify why it belongs in the journey.',
  slowClassCompression: 'Section 3 (Sort the Requests) and Section 8 (After Listening) can be assigned as homework if time is short — neither gates a later section.',
  assessment: 'Speaking (Perform the Journey, Section 10) and Writing (both Section 9\'s four touchpoints and Section 13\'s new one) are the primary grading points for this capstone; the self-check in Section 14 is student-reflective, not evaluative.'
};

/* ===================== ASSETS ===================== */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/mice-u15-hero.jpg', alt:'A hotel staff member warmly welcoming guests at a check-in counter' }
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 15: Designing the Delegate Journey',
  unitCode: 'unit-15'
};
