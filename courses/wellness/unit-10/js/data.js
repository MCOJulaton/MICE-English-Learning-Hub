/* ===================== UNIT 10 CONTENT DATA — THE RETREAT PROGRAM BOARD =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   the guest-day builder, rubric. Nothing here is UI logic — see app.js for
   rendering/state/voice/progress-tracking.

   Bloom's level: APPLY → ANALYZE. Section 9 ("Build the Guest's Wellness Day")
   is a SOLO constraint-scheduling task: the student builds one guest's day
   from a fixed menu of activities and time slots, checks it against real
   constraints (limited availability, a fixed lunch, a firm departure time),
   and revises it until it's valid — a genuine step up from Unit 9's
   Apply-level task. Section 10 ("Explain the Wellness Day") is the paired
   speaking component: Student A explains the finished plan, Student B plays
   the guest and asks scripted follow-up questions. Invented content, part of
   the Units 9-15 OBE/Bloom's expansion, not drawn from the official
   workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Your First Call of the Day'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Put the Steps in Order'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: A Mix-Up'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:"Build the Guest's Wellness Day"},
  {key:'s8', label:'Explain the Wellness Day'},
  {key:'crossword', label:'Vocabulary Identification'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Your First Call of the Day =====
   Opens as a short phone transcript instead of a plain facts list, matching
   the "confusing call" framing already used for MICE Unit 10's opening. */
const OPENING_SCENARIO = {
  dialogue: [
    {who:'Tam (Spa Wing Desk)', text:"Hi, it's Tam. A guest is asking about Day 4, and I don't see the morning hike time on my sheet."},
    {who:'You', text:'That\'s strange, my printed schedule says it\'s definitely at 8 a.m., before breakfast.'},
    {who:'Tam (Spa Wing Desk)', text:"Hmm. Something doesn't match between our two sheets, and the guest is still waiting."}
  ],
  message: 'The guest is still waiting for an answer.',
  question: 'What should you do?',
  options: [
    {text:'Call your colleague and ask them to check.', good:true, note:'Good instinct. Two people checking together find the right answer faster.'},
    {text:'Guess based on what usually happens.', good:false, note:'A wrong guess can send a guest to the wrong activity entirely. Always confirm first.'},
    {text:'Check the shared program board together over the phone.', good:true, note:'Yes. The program board is the one source everyone should trust.'},
    {text:'Ask the guest to call back later.', good:false, note:'That sounds like giving up. Ask for a moment to check instead.'},
    {text:'Ask a nearby colleague if they happen to remember.', good:true, note:'Reasonable, as long as you still confirm against the program board if unsure.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'6:30', point:'Program board finalized', where:'Confirmed by the retreat coordinator'},
  {time:'7:00', point:'Guests receive daily schedule cards', where:'At breakfast'},
  {time:'10:00', point:'First schedule change of the day', where:'Posted on the guest app'},
  {time:'1:00 p.m.', point:'Afternoon activity confirmations', where:'Available at the concierge desk'},
  {time:'6:00 p.m.', point:'Program board updated for tomorrow', where:'Reviewed by both coordinators'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's coordination rundown. At 6:30, the program board is finalized, confirmed by the retreat coordinator. At 7 a.m., guests receive their daily schedule cards at breakfast. At 10 a.m., if there's a schedule change, it's posted on the guest app. At 1 p.m., afternoon activity confirmations are available at the concierge desk. And at 6 p.m., the program board is updated for tomorrow, reviewed by both coordinators together.";

/* ===== Section 2: Key Vocabulary =====
   Scheduling vocabulary for building a guest's wellness day around real
   constraints, replacing the old coordinate/cross-check/verify set that
   nearly duplicated MICE Unit 10's own vocabulary list. */
const VOCAB = [
  {id:'goal', ic:'🎯', nm:'Goal', type:'n.', def:"A guest's main aim or purpose for their wellness stay.", ex:"The guest's goal is to reduce stress and sleep better."},
  {id:'preference', ic:'💭', nm:'Preference', type:'n.', def:'Something a person would rather have or do, given a choice.', ex:"The guest's preference is gentle movement, not high-intensity activity."},
  {id:'constraint', ic:'🚧', nm:'Constraint', type:'n.', def:'A limit that restricts what is possible in a plan.', ex:'The 15:00 departure time is a real constraint on today\'s program.'},
  {id:'available', ic:'✅', nm:'Available', type:'adj.', def:'Free to be booked or used.', ex:'The Quiet Garden is available from 10:15 to 15:00.'},
  {id:'fullybooked', ic:'🚫', nm:'Fully Booked', type:'adj.', def:'Completely reserved, with no space left.', ex:'The spa is fully booked before 10:00 this morning.'},
  {id:'slot', ic:'🕒', nm:'Slot', type:'n.', def:'A scheduled block of time for one activity.', ex:"Let's find a slot that fits before lunch."},
  {id:'alternative', ic:'🔀', nm:'Alternative', type:'n.', def:'A different option that could work instead.', ex:'If the spa is full, gentle yoga is a good alternative.'},
  {id:'suit', ic:'🤝', nm:'Suit', type:'v.', def:"To fit well with someone's needs, goals, or schedule.", ex:'Which activity best suits a guest who wants to relax?'},
  {id:'adjust', ic:'🛠️', nm:'Adjust', type:'v.', def:'To change something slightly to fit new information.', ex:'We had to adjust the plan once we saw the spa was full.'},
  {id:'prioritize', ic:'📌', nm:'Prioritize', type:'v.', def:'To decide which activity matters most and plan around it.', ex:"Prioritize the guest's quiet time over a second treatment."},
  {id:'fixed', ic:'🔒', nm:'Fixed', type:'adj.', def:'Part of a schedule that cannot move.', ex:'Lunch is fixed at 12:30, so build the rest of the day around it.'}
];
const VOCAB_SECONDARY = [
  {id:'itinerary2', nm:'Itinerary', def:"The full planned schedule of activities for a guest's stay."},
  {id:'depart2', nm:'Depart', def:'To leave, especially at a set time.'},
  {id:'duration2', nm:'Duration', def:'How long an activity lasts.'},
  {id:'overlap2', nm:'Overlap', def:'When two scheduled activities share the same block of time.'},
  {id:'confirm2', nm:'Confirm', def:'To say clearly that something is settled and correct.'}
];

/* ===== Section 2b: Put the Steps in Order (sequencing) =====
   Same underlying objective as before (handling an information request the
   right way), presented as a click-to-order sequencing task instead of a
   single choose-and-explain challenge, mirroring MICE Unit 10's own
   sequencing task for its own Apply-to-Analyze step up. */
const SEQUENCE_STEPS = [
  {text:"Listen carefully to the guest's question."},
  {text:'Check your own program board first.'},
  {text:"Cross-check with a colleague if you're not sure."},
  {text:'Confirm the verified answer with the guest.'},
  {text:'Relay any changes to the rest of the team.'}
];

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'goal', word:'Goal', meaning:"A guest's main aim or purpose for their wellness stay"},
  {id:'preference', word:'Preference', meaning:'Something a person would rather have or do, given a choice'},
  {id:'constraint', word:'Constraint', meaning:'A limit that restricts what is possible in a plan'},
  {id:'slot', word:'Slot', meaning:'A scheduled block of time for one activity'},
  {id:'alternative', word:'Alternative', meaning:'A different option that could work instead'},
  {id:'adjust', word:'Adjust', meaning:'To change something slightly to fit new information'},
  {id:'prioritize', word:'Prioritize', meaning:'To decide which activity matters most and plan around it'},
  {id:'fixed', word:'Fixed', meaning:'Part of a schedule that cannot move'}
];

const FILL_BLANK = [
  {q:"The guest's main __________ is to reduce stress and sleep better.", a:'goal'},
  {q:"Gentle movement is this guest's __________, not high-intensity activity.", a:'preference'},
  {q:'The 15:00 departure time is a real __________ on today\'s plan.', a:'constraint'},
  {q:'The Quiet Garden is __________ from 10:15 to 15:00.', a:'available'},
  {q:'If the spa is full, gentle yoga is a good __________.', a:'alternative'},
  {q:'We had to __________ the plan once we saw the spa was full.', a:'adjust'},
  {q:"You should __________ the guest's quiet time over a second treatment.", a:'prioritize'},
  {q:'Lunch is __________ at 12:30, so build the rest of the day around it.', a:'fixed'}
];

const VOCAB_SITUATIONS = [
  {q:"A guest asks for the spa at 9 a.m., but it's fully booked until 10:00. What do you say?", model:'"I\'m sorry, that slot is fully booked until 10:00. I can offer you the spa from 13:00 to 15:00 instead. Would that work with your schedule?"'},
  {q:"A guest's requested activity doesn't suit their stated goal of gentle relaxation. What do you say?", model:'"Based on what you\'ve told me, I\'d actually suggest something gentler that still fits your goal. May I recommend an alternative?"'},
  {q:"You need to build a full day around a guest's fixed lunch and a 15:00 departure. What do you say to yourself before starting?", model:'"Let me prioritize the fixed points first: lunch at 12:30 and departure by 15:00, then fit everything else around them."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Building a Program Around One Guest',
  paragraphs: [
    "A wellness resort's daily program isn't one fixed printed schedule handed to every guest. Each guest arrives with a different goal, a different set of preferences, and a different amount of time. The day has to be built around exactly that one person.",
    'The first step is understanding the guest\'s goal. A guest who wants to recover from a stressful week needs a very different day from a guest training for a triathlon, even if both are staying at the same resort on the same weekend.',
    "The next step is checking what's actually available. A popular treatment can be fully booked during the exact hours a guest is free, and a fixed commitment like lunch can't move at all. Good staff check real availability before promising anything.",
    "Real skill shows up when something doesn't fit. Instead of simply saying no, a good coordinator offers an alternative that still serves the same goal: a different time, a different activity, or a shorter version of the same idea.",
    'Finally, the plan has to be confirmed out loud, clearly, so the guest knows exactly what to expect and why anything that didn\'t fit was left out. A guest who understands the reasoning trusts the plan far more than one who is just handed a schedule.'
  ]
};
const READING_QUESTIONS = [
  {q:"What does a wellness resort's daily program need to be built around, according to the article?", opts:['The cheapest available option',"One specific guest's goal, preferences, and time",'A fixed schedule every guest receives'], correct:1},
  {q:'What should staff check before promising an activity?', opts:['Real availability, including fully-booked slots and fixed commitments','Nothing, guests should just be told yes','Only what the guest wants to hear'], correct:0},
  {q:"What should a coordinator do when something doesn't fit the guest's time?", opts:['Just say no','Offer an alternative that still serves the same goal','Cancel the whole day'], correct:1},
  {q:'Why does the article say a confirmed plan matters?', opts:["It doesn't matter at all","So the guest understands the plan and trusts the reasoning",'So staff can move on to the next guest faster'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  understanding:{title:"Understanding the Guest's Goal", items:[
    'What are you hoping to get from your stay today?',
    "Is there anything in particular you'd like to avoid?",
    'How much time do you have with us today?',
    'Would you prefer something gentle or more active?'
  ]},
  constraint:{title:'Explaining a Constraint', items:[
    'That slot is fully booked, but I can offer you…',
    "I'm sorry, that treatment isn't available until…",
    "Because lunch is fixed at 12:30, we'll need to…",
    "That would run past your departure time, so let's…"
  ]},
  confirming:{title:'Confirming the Plan', items:[
    'So your day will look like this…',
    'Let me read that back to you to confirm.',
    'Does that plan work for you?',
    "I'll make sure everything is ready at each time."
  ]}
};

/* ===== Section 6: Listening Script — "A Mix-Up" =====
   Two characters: Ploy, a program coordinator (staff voice), and guest Khun
   Anong (delegate voice) — the same guest whose day is built in Section 9,
   so students hear the negotiation before they build the plan themselves. */
const BEFORE_LISTEN = {
  setup: "Ploy is helping Khun Anong plan her wellness day in person. Listen and find out how they solve the spa scheduling problem.",
  guesses: [
    'Ploy tells her the spa is impossible today.',
    'They negotiate and find a plan that still works.',
    'Khun Anong gives up and leaves without a plan.',
    "Ploy ignores the guest's departure time."
  ]
};
const LISTEN = {
  intro: 'Harmony Wellness Resort. Ploy, a program coordinator, is building today\'s plan with guest Khun Anong, who must leave by 15:00.',
  lines: [
    {who:'Ploy', text:"Good morning, Khun Anong. I understand your goal today is to reduce stress and sleep better. Is that right?", kind:'staff'},
    {who:'Khun Anong', text:"Yes, exactly. And I'd love the spa treatment this morning, before it gets busy.", kind:'delegate'},
    {who:'Ploy', text:"I'm sorry, that slot is fully booked until 10:00. But I can offer you the spa from 13:00 to 15:00 instead.", kind:'staff'},
    {who:'Khun Anong', text:'I need to leave by 15:00 though. Will that still give me enough time?', kind:'delegate'},
    {who:'Ploy', text:"It's tight. Let's put the spa right at 13:00, so you're finished exactly as you need to leave.", kind:'staff'},
    {who:'Khun Anong', text:"That works. What can I do this morning instead, since I don't want anything too active?", kind:'delegate'},
    {who:'Ploy', text:"I'd suggest gentle yoga at 11:30, and some quiet time in the garden before that. Both fit your goal much better than the guided hike.", kind:'staff'},
    {who:'Khun Anong', text:'Perfect. And lunch?', kind:'delegate'},
    {who:'Ploy', text:'Lunch is fixed at 12:30 for all guests, so that stays exactly where it is.', kind:'staff'},
    {who:'Khun Anong', text:'So my day is: quiet garden, yoga, lunch, then the spa at 13:00?', kind:'delegate'},
    {who:'Ploy', text:"Exactly right. I'll confirm that plan for you now.", kind:'staff'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does Khun Anong want first thing this morning?', opts:['A guided hike','The spa treatment','Lunch'], correct:1},
  {q:"Why can't she have the spa in the morning?", opts:["She hasn't paid yet",'That slot is fully booked until 10:00','The spa is closed'], correct:1},
  {q:'What time does Ploy offer instead?', opts:['10:00','11:30','13:00'], correct:2},
  {q:"Why doesn't Ploy suggest the guided hike?", opts:["It's fully booked","It doesn't match her goal of gentle movement","It's too short"], correct:1},
  {q:'What happens to lunch in the final plan?', opts:["It's moved to 13:00",'It stays fixed at 12:30',"It's skipped"], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Naming a constraint clearly instead of avoiding it', example:'"That slot is fully booked until 10:00."'},
  {strategy:'Offering an alternative instead of just saying no', example:'"I can offer you the spa from 13:00 to 15:00 instead."'},
  {strategy:"Checking the alternative still meets the guest's goal", example:'"Both fit your goal much better than the guided hike."'},
  {strategy:'Protecting a fixed commitment without being asked twice', example:'"Lunch is fixed at 12:30 for all guests, so that stays exactly where it is."'},
  {strategy:'Confirming the final plan out loud', example:'"So my day is: quiet garden, yoga, lunch, then the spa at 13:00? Exactly right."'}
];

/* ===== Section 6b: Build the Guest's Wellness Day =====
   SOLO constraint-scheduling task, replacing the old RoleLock two-device
   split-schedule info-gap (js/role-lock.js is untouched — this unit's own
   app.js simply stops calling it). The student works alone: understand one
   guest's needs, check what's actually available, read the real
   constraints, then build and adjust a day plan until it's valid — a
   genuine build → check → adjust loop, not a single info-gap-then-reveal.

   GUEST_PROFILE / ACTIVITIES / CONSTRAINTS form the data model that
   renderS6b/wireS6b in app.js validate against. */
const GUEST_PROFILE = {
  name: 'Guest: Khun Anong',
  goal: 'Reduce stress and improve sleep during a short stay',
  preferences: [
    'Prefers gentle movement over high-intensity activity',
    'Wants at least one quiet block with no talking'
  ],
  timeLimit: 'Must leave the resort by 15:00 today',
  arrival: '09:00'
};
const ACTIVITIES = [
  {id:'spa', name:'Signature Spa Treatment', icon:'💆', duration:60, suitsGoal:true,
    availability:[{start:'08:00',end:'10:00',status:'fully booked'},{start:'13:00',end:'15:00',status:'available'}]},
  {id:'yoga', name:'Gentle Morning Yoga', icon:'🧘', duration:45, suitsGoal:true,
    availability:[{start:'11:30',end:'12:15',status:'available'}]},
  {id:'hike', name:'Guided Hike', icon:'🥾', duration:90, suitsGoal:false,
    availability:[{start:'08:00',end:'09:30',status:'available'}]},
  {id:'lunch', name:'Wellness Lunch', icon:'🍽️', duration:60, fixed:true,
    availability:[{start:'12:30',end:'13:30',status:'fixed, resort-wide seating'}]},
  {id:'silence', name:'Quiet Garden (unstructured)', icon:'🌿', duration:30, suitsGoal:true,
    availability:[{start:'10:15',end:'15:00',status:'available'}]}
];
const CONSTRAINTS = [
  'The guest must leave by 15:00. Nothing should be scheduled after 14:30 if it runs long.',
  'The spa is fully booked before 10:00 today.',
  'Lunch is fixed at 12:30 and cannot move.',
  'Yoga does not start until 11:30.'
];
/* Comprehension gate before the builder unlocks — reuses the site's
   existing .choice-btn/.feedback multiple-choice pattern (see wireS1's
   scenarioChoices for the same idiom). */
const S6B_CHECK_QUESTIONS = [
  {q:"Why might the Guided Hike not suit this guest?", opts:["It's too expensive","It's high-intensity, and the guest prefers gentle movement","It's fully booked"], correct:1},
  {q:'What time must the guest leave the resort?', opts:['10:00','13:00','15:00'], correct:2}
];

/* ===== Section 8: Explain the Wellness Day =====
   Student A explains the day plan they built in Section 9 out loud.
   Student B plays the guest and asks two scripted follow-up questions from
   the bank below. Reuses the same checklist-row shape as the old
   INTERVIEW_QUESTIONS UI, reframed as an explanation checklist rather than
   a flat Q&A script. */
const EXPLANATION_CHECKLIST = [
  "Did you state the guest's goal (reduce stress and improve sleep)?",
  "Did you explain why any requested activity couldn't fit (for example, the hike, or the fully-booked spa slot)?",
  'Did you offer the alternative you chose, and why it still fits the goal?',
  'Did you confirm the final schedule out loud, in order?'
];
const FOLLOWUP_QUESTIONS = [
  "Why isn't the hike in my plan?",
  'Can I still fit in the spa before 10?'
];
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'The guest arrives 30 minutes late. Rebuild the morning without missing lunch.'},
  {tag:'Scenario 2', text:'The guest asks to swap yoga for a second spa slot. Is that possible today?'},
  {tag:'Scenario 3', text:'The guest asks for a quiet block right after the spa treatment. Where would you put it?'}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they name the mix-up clearly and calmly?',
  'Did they check the program board instead of guessing?',
  'Did they coordinate naturally with their colleague on the phone?',
  'Did they confirm the correct information before answering the guest?',
  'Did they thank the guest for waiting?',
  'Did their language sound organized and professional?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'Your printed card and your colleague\'s screen disagree about the closing brunch venue. Call and sort it out.'},
  {tag:'Situation B', text:'A guest calls back three times about the same outstanding question. Handle the fourth call professionally.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: "Write a short note (4 to 6 sentences) that a coordinator could hand to the front desk, describing the wellness day you built for Khun Anong. Include her goal, what changed from her original request, and the final schedule.",
  discussion: [
    {title:'Tourism Business Management', text:'A corporate wellness group\'s most popular treatment is fully booked for the whole morning. Write the note you would hand to the front desk explaining the alternative you offered and why it still meets the group\'s goal.'},
    {title:'Wellness Tourism Management', text:'A guest\'s afternoon treatment had to move to a different time because of a fixed lunch seating. Write the note you would hand to the front desk so every staff member gives the guest the same confirmed plan.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Scheduling Vocabulary', sub:'I can use goal, constraint, available, alternative, and fixed correctly.'},
  {k:'build', lbl:'Building a Program', sub:"I can build a guest's day using the activities and time slots available."},
  {k:'adjust', lbl:'Adjusting Around Constraints', sub:"I can adjust a plan when something doesn't fit, without just saying no."},
  {k:'explain', lbl:'Explaining a Plan', sub:"I can calmly explain why an activity didn't fit and what I offered instead."},
  {k:'writing', lbl:'Writing a Clear Update', sub:'I can write a short, clear note describing a confirmed plan.'}
];

/* ===================== TEACHER GUIDE (courses/wellness/unit-10/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Unit 10: The Retreat Program Board',
  learningOutcome: "Students build a personalized wellness day for one guest, working within real constraints (limited availability, a fixed lunch, and a firm departure time) and explaining the plan and any trade-offs out loud — a genuine step up from Unit 9's task toward independent constraint-based problem-solving.",
  bloomsLevel: 'Apply → Analyze',
  addieFocus: "A solo build-check-adjust task: the student assembles a day from a fixed menu of activities and time slots, checks it against real constraints, and revises it until it's valid — the actual professional skill this unit teaches (designing a program around one guest, not just relaying a fixed schedule).",
  grouping: "Individual work for Section 9 (Build the Guest's Wellness Day). Paired speaking practice only in Section 10 (Explain the Wellness Day), where Student A explains the finished plan and Student B, playing the guest, asks two follow-up questions.",
  timing: [
    {block:'Warm-Up: First Call of the Day', time:'15 min', ref:'Section 1'},
    {block:'Key Vocabulary', time:'15 min', ref:'Section 2'},
    {block:'Put the Steps in Order', time:'10 min', ref:'Section 3'},
    {block:'Vocabulary Activities', time:'20 min', ref:'Section 4'},
    {block:'Reading', time:'15 min', ref:'Section 5'},
    {block:'Useful Phrases', time:'10 min', ref:'Section 6'},
    {block:'Listening: A Mix-Up', time:'15 min', ref:'Section 7'},
    {block:'After Listening', time:'10 min', ref:'Section 8'},
    {block:"Build the Guest's Wellness Day", time:'20 min', ref:'Section 9 — individual work'},
    {block:'Explain the Wellness Day', time:'15 min', ref:'Section 10 — pairs'},
    {block:'Vocabulary Identification, Peer Checklist, Writing, Self-Check', time:'35 min', ref:'Sections 11-14'}
  ],
  materials: [
    'One device per student for Section 9 (individual work, not shared)',
    'Speakers or headphones for the listening sections'
  ],
  teacherPrompts: [
    'Before Section 9: "What do you do when a guest\'s favorite activity is fully booked?"',
    'During Section 9: "Does your plan still include lunch? Does it finish by 15:00?"',
    'After Section 9: "What would you say to the guest to explain a change you made?"'
  ],
  commonProblems: [
    {problem: 'A student adds every activity without checking the constraints first.', fix: '"Check My Day" gives specific feedback on each broken rule — encourage a genuine build → check → adjust loop rather than guessing once and stopping.'},
    {problem: 'A student removes lunch to make the day "easier" to fit together.', fix: 'Lunch is a fixed constraint and cannot be dropped — the checker will flag this. Have them add it back and re-check.'}
  ],
  fastClassExtension: "Have students swap finished day-plans with a partner and explain each other's plan in Section 10, including any trade-offs they made.",
  slowClassCompression: 'Sections 3 (Put the Steps in Order) and 8 (After Listening) can be assigned as homework if time is short — neither gates a later section.',
  assessment: 'Speaking (building and explaining the wellness day, Sections 9-10), Writing (Section 13), and vocabulary accuracy (Sections 2 and 11) are the three most useful grading points; the self-check in Section 14 is student-reflective, not evaluative.'
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 10: The Retreat Program Board',
  unitCode: 'unit-10'
};
