/* ===================== UNIT 10 CONTENT DATA — PERSONALIZING A WELLNESS DAY =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   the guided-practice and guest-day builder, rubric. Nothing here is UI logic —
   see app.js for rendering/state/voice/progress-tracking.

   Real TQF3 alignment check performed before this rewrite: Wellness Tourism's
   actual Week 10 syllabus topic is "Unit 7: Spa & Wellness Services" (reading a
   spa menu, listening to a consultant explain treatment options, and a role
   play where staff explains 2-3 treatments using "This treatment is ideal
   for...", "The duration is approximately...", "The benefits include...").
   This unit's broader "build a personalized wellness day" skill is, like MICE
   and Wellness Units 9-15 generally, invented content that runs alongside the
   real workbook rather than replacing it — but the three real assessed phrases
   above are deliberately woven into Section 6 (Useful Phrases) and
   Section 7 (Model Consultation) so the lesson still practices the literal
   syllabus skill, as one natural part of a broader guest consultation, not a
   disconnected topic. Week 10 is also one of six weeks (4, 5, 6, 10, 11, 14)
   graded with the university's official 100-point, 5-criterion Speaking Rubric
   (Fluency, Pronunciation & Intelligibility, Vocabulary & Register, Interaction
   & Responsiveness, Professional Conduct) — see TEACHER_GUIDE.assessment.

   Bloom's: Remember (vocab/phrases) -> Understand (identify goal/preference/
   constraint, model consultation) -> Apply (guided consultation practice,
   building a day) -> Analyze (why a requested activity doesn't fit) ->
   Evaluate (peer checklist) -> Create (explain a full day, the live final
   consultation, which this site does not and cannot auto-grade). */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Meet the Guest'},
  {key:'s2', label:'What I Tell Every New Consultant'},
  {key:'s2b', label:'The Consultation Process'},
  {key:'s3', label:'Does It Fit?'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Model Consultation'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Build a Wellness Day'},
  {key:'s8', label:'Explain and Confirm'},
  {key:'crossword', label:'Vocabulary Identification'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Meet the Guest =====
   Read/listen to a short guest profile and identify the goal, preferences,
   and time limit — the same guest (Khun Aing) whose day gets built later
   in Section 9, so students meet her once here before planning for her. */
const OPENING_SCENARIO = {
  dialogue: [
    {who:'Intake Card', text:'Guest: Khun Aing. Goal: reduce stress and improve sleep during a short stay.'},
    {who:'Intake Card', text:'Preferences: gentle movement over high-intensity activity, and at least one quiet block with no talking.'},
    {who:'Intake Card', text:'Must leave the resort by 15:00 today. Arrives at 09:00.'}
  ],
  message: "Before you plan anything for a guest, you need to actually understand who they are.",
  question: 'Which of these would you ask about first, before recommending anything?',
  options: [
    {text:'Her goal for the stay.', good:true, note:"Yes. Everything else you recommend should serve this goal."},
    {text:'Whatever activity has the most free space today.', good:false, note:"That serves the schedule, not the guest. Start with her, not the calendar."},
    {text:'Her preferences and anything she\'d like to avoid.', good:true, note:'Good. This tells you what kind of activities are even worth suggesting.'},
    {text:'How much time she actually has with you.', good:true, note:"Yes. A great plan that doesn't fit her schedule isn't a great plan."},
    {text:'The most expensive treatment on the menu.', good:false, note:'That serves the resort\'s revenue, not the guest\'s goal. Recommend based on fit, not price.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'Goal', point:'Reduce stress and improve sleep', where:'Stated on her intake card'},
  {time:'Preference', point:'Gentle movement, not high-intensity', where:'Stated on her intake card'},
  {time:'Preference', point:'At least one quiet block, no talking', where:'Stated on her intake card'},
  {time:'Arrival', point:'09:00', where:'Confirmed at check-in'},
  {time:'Departure', point:'Must leave by 15:00', where:'Confirmed at check-in'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's first guest profile, the kind of thing you'll need to listen for before recommending anything. Her goal: reduce stress and improve sleep. Her preferences: gentle movement, not high-intensity activity, and she'd like at least one quiet block with no talking. She arrives at 09:00, and she must leave the resort by 15:00 today.";

/* ===== Section 2: Key Vocabulary =====
   The essential consultation language: goal, preference, availability,
   fully booked, alternative, fixed, recommend, plus constraint/confirm/suit. */
const VOCAB = [
  {id:'goal', ic:'🎯', nm:'Goal', type:'n.', def:"A guest's main aim or purpose for their wellness stay.", ex:"The guest's goal is to reduce stress and sleep better.", fit:'A guest says her main aim for the stay is to reduce stress and sleep better.'},
  {id:'preference', ic:'💭', nm:'Preference', type:'n.', def:'Something a person would rather have or do, given a choice.', ex:"The guest's preference is gentle movement, not high-intensity activity.", fit:'Given a choice, this guest would always pick a gentle activity over an intense one.'},
  {id:'availability', ic:'📅', nm:'Availability', type:'n.', def:'Whether or not an activity still has free time open.', ex:"Check the spa's availability before you recommend it.", fit:'Before promising anything, you check whether the spa still has free time open this morning.'},
  {id:'fullybooked', ic:'🚫', nm:'Fully Booked', type:'adj.', def:'Completely reserved, with no space left.', ex:'The spa is fully booked before 10:00 this morning.', fit:'Every slot at the spa before 10:00 is already reserved, with no space left.'},
  {id:'alternative', ic:'🔀', nm:'Alternative', type:'n.', def:'A different option that could work instead.', ex:'If the spa is full, gentle yoga is a good alternative.', fit:"The spa's full, so you offer gentle yoga instead, a different option that still works."},
  {id:'fixed', ic:'🔒', nm:'Fixed', type:'adj.', def:'Part of a schedule that cannot move.', ex:'Lunch is fixed at 12:30, so build the rest of the day around it.', fit:'Lunch happens at 12:30 every day, and it can never be moved.'},
  {id:'recommend', ic:'⭐', nm:'Recommend', type:'v.', def:"To suggest something because you believe it's a good fit.", ex:'Based on your goal, I would recommend the quiet garden first.', fit:"Based on her goal, you suggest the quiet garden first, because you believe it's the right choice."},
  {id:'constraint', ic:'🚧', nm:'Constraint', type:'n.', def:'A limit that restricts what is possible in a plan.', ex:'The 15:00 departure time is a real constraint on today\'s program.', fit:'Her 15:00 departure time is a real limit you have to plan the whole day around.'},
  {id:'confirm', ic:'✅', nm:'Confirm', type:'v.', def:'To say clearly that something is settled and correct.', ex:'Let me confirm your itinerary before we finish.', fit:'Before you finish, you say the whole plan back to her, out loud, to make sure nothing was missed.'},
  {id:'suit', ic:'🤝', nm:'Suit', type:'v.', def:"To fit well with someone's needs, goals, or schedule.", ex:'Which activity best suits a guest who wants to relax?', fit:"You're deciding which activity works best with what she actually needs today."}
];

/* Section 2 is taught as a mentor-to-new-hire discussion instead of a flat
   glossary — the 10 VOCAB words above appear highlighted in real context
   (app.js turns each [[id:label]] token into a clickable term that looks
   up VOCAB by id), the way an experienced consultant would actually talk
   about the job, not as isolated definitions. */
const CONSULTATION_GUIDE = {
  intro: 'Every new consultant asks me the same thing: what do I actually say to a guest? Here\'s the real answer, not textbook talk, just how we actually do it.',
  points: [
    'It starts with her [[goal:goal]]. Not what treatment sounds nice, what she\'s actually trying to get out of her stay. Ask first, recommend second.',
    'Once you know her goal, ask about her [[preference:preferences]] too, gentle or active, quiet or social. Two guests with the same goal can want completely different days.',
    'Now check real [[availability:availability]]. Don\'t promise anything you haven\'t actually checked. If something\'s [[fullybooked:fully booked]], say so plainly, then offer a real [[alternative:alternative]], not just "sorry."',
    'Watch for what\'s [[fixed:fixed]], lunch, a group activity, whatever can\'t move. Build everything else around it, not the other way around.',
    'When you actually [[recommend:recommend]] something, say why. "This is ideal for..." means more than just naming a treatment.',
    'If a [[constraint:constraint]] gets in the way, a time limit, a fully-booked slot, explain it clearly. Guests don\'t mind hearing no if they understand why, and what you\'re offering instead.',
    'Pick things that actually [[suit:suit]] her, not just what\'s popular. And before you\'re done, [[confirm:confirm]] the whole plan out loud. That\'s the step everyone forgets.'
  ]
};
const VOCAB_SECONDARY = [
  {id:'itinerary2', nm:'Itinerary', def:"The full planned schedule of activities for a guest's stay."},
  {id:'depart2', nm:'Depart', def:'To leave, especially at a set time.'},
  {id:'duration2', nm:'Duration', def:'How long an activity lasts.'},
  {id:'adjust2', nm:'Adjust', def:'To change something slightly to fit new information.'},
  {id:'prioritize2', nm:'Prioritize', def:'To decide which activity matters most and plan around it.'}
];

/* ===== Section 2b: The Consultation Process (sequencing) =====
   The 8-step consultation structure, also reused conceptually across
   Sections 8 (phrase bank), 9 (model consultation), and the guided
   practice/building sections that follow. Array order below IS the
   correct order; the render function shuffles it. */
const SEQUENCE_STEPS = [
  {text:'Welcome the guest.'},
  {text:'Ask about their goal.'},
  {text:'Ask about preferences and anything to avoid.'},
  {text:'Check time limits and availability.'},
  {text:'Recommend activities that fit.'},
  {text:'Explain any constraint clearly.'},
  {text:'Offer an alternative, not only "no."'},
  {text:'Read the final plan back and confirm it.'}
];

/* ===== Section 3: Does It Fit? =====
   A situational-recognition activity: each round describes something
   happening in a real consultation (VOCAB[].fit), and the student picks
   the word for it from four shuffled choices, drawing directly on VOCAB
   above (no separate content needed). This previews the exact judgment
   Section 9's Build a Wellness Day will ask for later, and is deliberately
   distinct from both what this section used to be (match/fill-blank) and
   from MICE Unit 10's own new vocabulary activity (spoken-definition
   recall) — this one is read, not heard, and about recognizing a situation,
   not a dictionary definition. */
const VOCAB_SITUATIONS = [
  {q:"A guest asks for the spa at 9 a.m., but it's fully booked until 10:00. What do you say?", model:'"That treatment is fully booked at that time, but I can offer you the spa from 13:00 to 15:00 instead. Would that work with your schedule?"'},
  {q:"A guest's requested activity doesn't suit their stated goal of gentle relaxation. What do you say?", model:'"Based on your goal, I would recommend something gentler that still fits what you\'re looking for. May I suggest an alternative?"'},
  {q:"You need to build a full day around a guest's fixed lunch and a 15:00 departure. What do you say to yourself before starting?", model:'"Let me prioritize the fixed points first: lunch at 12:30 and departure by 15:00, then fit everything else around them."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Building a Program Around One Guest',
  paragraphs: [
    "A wellness resort's daily program isn't one fixed printed schedule handed to every guest. Each guest arrives with a different goal, a different set of preferences, and a different amount of time. The day has to be built around exactly that one person.",
    'The first step is understanding the guest\'s goal. A guest who wants to recover from a stressful week needs a very different day from a guest training for a triathlon, even if both are staying at the same resort on the same weekend.',
    "The next step is checking what's actually available. A popular treatment can be fully booked during the exact hours a guest is free, and a fixed commitment like lunch can't move at all. Good staff check real availability before promising anything.",
    "Real skill shows up when something doesn't fit. Instead of simply saying no, a good consultant offers an alternative that still serves the same goal: a different time, a different activity, or a shorter version of the same idea.",
    "Recommending a treatment well means more than naming it. Good staff explain who it's ideal for, roughly how long it takes, and what the benefits actually are, so the guest understands why it was suggested, not just what it is.",
    'Finally, the plan has to be confirmed out loud, clearly, so the guest knows exactly what to expect and why anything that didn\'t fit was left out. A guest who understands the reasoning trusts the plan far more than one who is just handed a schedule.'
  ]
};
const READING_QUESTIONS = [
  {q:"What does a wellness resort's daily program need to be built around, according to the article?", opts:['The cheapest available option',"One specific guest's goal, preferences, and time",'A fixed schedule every guest receives'], correct:1},
  {q:'What should staff check before promising an activity?', opts:['Real availability, including fully-booked slots and fixed commitments','Nothing, guests should just be told yes','Only what the guest wants to hear'], correct:0},
  {q:"What should a consultant do when something doesn't fit the guest's time?", opts:['Just say no','Offer an alternative that still serves the same goal','Cancel the whole day'], correct:1},
  {q:'According to the article, what should staff explain when recommending a treatment?', opts:['Nothing, just the name is enough','Who it\'s ideal for, roughly how long it takes, and the benefits','Only the price'], correct:1},
  {q:'Why does the article say a confirmed plan matters?', opts:["It doesn't matter at all","So the guest understands the plan and trusts the reasoning",'So staff can move on to the next guest faster'], correct:1}
];

/* ===== Section 5: Useful Phrases =====
   All 9 of the essential consultation phrases, organized by consultation
   stage. The "Recommending" tab deliberately embeds the three real,
   syllabus-assessed spa phrases ("ideal for", "duration is approximately",
   "benefits include") as part of explaining a treatment recommendation. */
const PHRASE_TABS = {
  welcoming:{title:'Welcoming & Asking About Goals', items:[
    'Welcome! What are you hoping to get from your stay today?',
    'Would you prefer something gentle or more active?',
    'Is there anything you would like to avoid?',
    'How much time do you have with us today?'
  ]},
  availability:{title:'Checking Availability', items:[
    'Let me check what\'s available for you.',
    'That treatment is fully booked at that time, but I can offer you…',
    'I\'m sorry, that isn\'t available until…'
  ]},
  recommending:{title:'Recommending a Treatment', items:[
    'Based on your goal, I would recommend…',
    'This treatment is ideal for…',
    'The duration is approximately…',
    'The benefits include…'
  ]},
  constraint:{title:'Explaining a Constraint', img:'../../../assets/images/wellness-unit10/fixed-lunch-time.jpg', items:[
    'Because your lunch is fixed at 12:30, the best option would be…',
    'That would run past your departure time, so let\'s…',
    'Because that\'s fully booked, I can offer you an alternative instead.'
  ]},
  confirming:{title:'Confirming the Plan', items:[
    'So your day will look like this…',
    'Let me read the plan back to you to confirm.',
    'Does this itinerary work for you?',
    "I'll make sure everything is ready at each time."
  ]}
};

/* ===== Section 9, Step 0: Warm Up — Ask First =====
   PAIRED, guided rehearsal folded into the start of Section 9, right before
   the solo build: Student A is staff and asks the question guide below;
   Student B plays the guest using the card and answers based on it. Switch
   roles, then repeat once more with the second card for variety. Apply-
   level: practicing the ASKING half of the consultation, distinct from
   Section 10's EXPLAINING half (which happens after a plan is already
   built). Previously its own standalone section (old "Section 7"); folded
   in as a warm-up so the capstone build starts from a guest students have
   already practiced questioning, instead of two disconnected stops. */
const CONSULTATION_QUESTION_GUIDE = [
  'Welcome! What are you hoping to get from your stay today?',
  'Would you prefer something gentle or more active?',
  'Is there anything you would like to avoid?',
  'How much time do you have with us today?'
];
const GUEST_CARDS_PRACTICE = [
  {tag:'Guest Card 1', name:'Khun Somchai', goal:'Increase energy and flexibility during a short business trip', preference:'Prefers active options, enjoys movement', avoid:'Nothing underwater, dislikes swimming', time:'Free until 16:00 today'},
  {tag:'Guest Card 2', name:'Khun Ploenpit', goal:'A calm, quiet reset after a long flight', preference:'Wants gentle, low-effort activities only', avoid:'Anything loud or group-based', time:'Free until 12:00, then a meeting'}
];
const CONSULTATION_PRACTICE_CHECKLIST = [
  'Did Student A ask about the guest\'s goal?',
  'Did Student A ask about preferences and anything to avoid?',
  'Did Student A check how much time the guest has?',
  'Did Student B answer in character, using the guest card?',
  'Did you switch roles and try the second guest card?'
];

/* ===== Section 6: Listening — Model Consultation =====
   Ploy, a wellness consultant (staff voice), holds a full consultation
   with guest Khun Aing (delegate voice), walking through all 8 steps of
   the consultation process end to end — including a treatment
   recommendation that uses the three real, syllabus-assessed spa phrases. */
const BEFORE_LISTEN = {
  setup: "Ploy, a wellness consultant, is helping Khun Aing plan her wellness day. Listen for how Ploy asks questions, explains a constraint, and recommends a treatment.",
  guesses: [
    'Ploy just tells her what to do, without asking any questions.',
    'Ploy asks about her goal, explains what\'s available, and recommends a plan together.',
    'Khun Aing gives up and leaves without a plan.',
    'Ploy ignores her departure time completely.'
  ]
};
const LISTEN = {
  intro: 'Harmony Wellness Resort. Ploy, a wellness consultant, holds a short consultation with guest Khun Aing, who must leave by 15:00.',
  lines: [
    {who:'Ploy', text:'Good morning, Khun Aing! Welcome. What are you hoping to get from your stay with us today?', kind:'staff'},
    {who:'Khun Aing', text:'Hi. I\'d like to reduce stress and sleep better, that\'s really my main goal.', kind:'delegate'},
    {who:'Ploy', text:'Wonderful. Would you prefer something gentle, or more active?', kind:'staff'},
    {who:'Khun Aing', text:'Gentle, please. And I\'d love the spa treatment this morning, before it gets busy.', kind:'delegate'},
    {who:'Ploy', text:'I\'m sorry, that treatment is fully booked at that time, but I can offer you the spa from 13:00 to 15:00 instead.', kind:'staff'},
    {who:'Khun Aing', text:'I need to leave by 15:00 though. Will that still give me enough time?', kind:'delegate'},
    {who:'Ploy', text:'It\'s tight, so let\'s place it right at 13:00, finishing exactly as you need to leave.', kind:'staff'},
    {who:'Khun Aing', text:'That works. What would you recommend for this morning, since I don\'t want anything too active?', kind:'delegate'},
    {who:'Ploy', text:'Based on your goal, I would recommend gentle morning yoga, and some quiet time in the garden beforehand. This spa treatment is ideal for deep relaxation, the duration is approximately sixty minutes, and the benefits include better sleep and reduced tension, so it\'s a perfect way to close your day.', kind:'staff'},
    {who:'Khun Aing', text:'Perfect. And lunch?', kind:'delegate'},
    {who:'Ploy', text:'Because your lunch is fixed at 12:30, the best option would be to keep the morning light and build around it.', kind:'staff'},
    {who:'Khun Aing', text:'So my day is: quiet garden, yoga, lunch, then the spa at 13:00?', kind:'delegate'},
    {who:'Ploy', text:'Exactly right. Let me read the plan back to you to confirm: quiet garden, yoga at 11:30, lunch at 12:30, and the spa at 13:00. Does this itinerary work for you?', kind:'staff'},
    {who:'Khun Aing', text:'Yes, that works perfectly. Thank you.', kind:'delegate'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does Ploy ask first, right after welcoming Khun Aing?', opts:['For her room number','What she\'s hoping to get from her stay','For payment'], correct:1},
  {q:'Why can\'t Khun Aing have the spa first thing in the morning?', opts:['She hasn\'t paid yet','That treatment is fully booked at that time','The spa is closed'], correct:1},
  {q:'What does Ploy recommend instead for the morning?', opts:['A guided hike','Gentle yoga and quiet garden time','Nothing at all'], correct:1},
  {q:'What three things does Ploy explain when recommending the spa treatment?', opts:['The price, the room number, and the therapist\'s name','Who it\'s ideal for, the duration, and the benefits','Nothing, she just names it'], correct:1},
  {q:'What does Ploy do at the very end of the consultation?', opts:['Ends the call abruptly','Reads the plan back to confirm it','Cancels the spa booking'], correct:1}
];

/* ===== Section 7: After Listening — script analysis + Spot the Problem (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Welcoming the guest and asking about her goal first', example:'"Welcome! What are you hoping to get from your stay with us today?"'},
  {strategy:'Naming a constraint clearly instead of avoiding it', example:'"That treatment is fully booked at that time."'},
  {strategy:'Offering an alternative instead of just saying no', example:'"I can offer you the spa from 13:00 to 15:00 instead."'},
  {strategy:'Explaining a treatment recommendation properly (who it suits, how long, the benefits)', example:'"This spa treatment is ideal for deep relaxation, the duration is approximately sixty minutes, and the benefits include better sleep and reduced tension."'},
  {strategy:'Protecting a fixed commitment without being asked twice', example:'"Because your lunch is fixed at 12:30, the best option would be…"'},
  {strategy:'Confirming the final plan out loud', example:'"Let me read the plan back to you to confirm… Does this itinerary work for you?"'}
];
/* Optional/Advanced extension (matches the teacher's "Spot the Problem"
   stage, 20 min if time allows): two weak, read-only sample itineraries
   with deliberate problems for students to identify. */
const WEAK_ITINERARIES = [
  {tag:'Itinerary A', plan:'09:00 Guided Hike, 09:30 Signature Spa Treatment, 12:30 Lunch, 14:45 Gentle Yoga', problem:'overlap', hint:'Look closely at the start and end times of the first two activities.'},
  {tag:'Itinerary B', plan:'08:00 Signature Spa Treatment (fully booked), 11:30 Yoga, 12:30 Lunch, 15:30 Quiet Garden', problem:'unavailable', hint:'One of these was never actually available, and one runs past the guest\'s departure time.'}
];
const ITINERARY_PROBLEM_TYPES = [
  'Overlap: two activities scheduled at the same time',
  'Unsuitable activity: doesn\'t match the guest\'s stated goal or preference',
  'Unavailable treatment: booked during a fully-booked window',
  'Ignored departure time: something scheduled after the guest must leave'
];

/* ===== Section 6b: Build a Wellness Day =====
   SOLO constraint-scheduling task: understand one guest's needs, check
   what's actually available, read the real constraints, then build and
   adjust a day plan until it's valid — a genuine build -> check -> adjust
   loop. GUEST_PROFILE/ACTIVITIES/CONSTRAINTS form the data model that
   renderS6b/wireS6b in app.js validate against. Spa treatments are one
   explicit activity option here (using the real syllabus treatment names),
   not a separate, disconnected topic. */
const GUEST_PROFILE = {
  name: 'Guest: Khun Aing',
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
    img:'../../../assets/images/wellness-unit10/spa-treatment.jpg',
    availability:[{start:'08:00',end:'10:00',status:'fully booked'},{start:'13:00',end:'15:00',status:'available'}]},
  {id:'facial', name:'Facial Treatment', icon:'🧖', duration:45, suitsGoal:true,
    availability:[{start:'10:15',end:'11:00',status:'available'}]},
  {id:'yoga', name:'Gentle Morning Yoga', icon:'🧘', duration:45, suitsGoal:true,
    img:'../../../assets/images/wellness-unit10/morning-yoga.jpg',
    availability:[{start:'11:30',end:'12:15',status:'available'}]},
  {id:'hike', name:'Guided Hike', icon:'🥾', duration:90, suitsGoal:false,
    img:'../../../assets/images/wellness-unit10/guided-hike.jpg',
    availability:[{start:'08:00',end:'09:30',status:'available'}]},
  {id:'lunch', name:'Wellness Lunch', icon:'🍽️', duration:60, fixed:true,
    img:'../../../assets/images/wellness-unit10/wellness-lunch.jpg',
    availability:[{start:'12:30',end:'13:30',status:'fixed, resort-wide seating'}]},
  {id:'silence', name:'Quiet Garden (unstructured)', icon:'🌿', duration:30, suitsGoal:true,
    img:'../../../assets/images/wellness-unit10/quiet-garden.jpg',
    availability:[{start:'10:15',end:'15:00',status:'available'}]},
  {id:'meditation', name:'Guided Meditation', icon:'🧘‍♀️', duration:20, suitsGoal:true,
    availability:[{start:'10:15',end:'10:35',status:'available'},{start:'14:00',end:'14:20',status:'available'}]}
];
const CONSTRAINTS = [
  'The guest must leave by 15:00. Nothing should be scheduled after 14:30 if it runs long.',
  'The spa is fully booked before 10:00 today.',
  'Lunch is fixed at 12:30 and cannot move.',
  'Yoga does not start until 11:30.',
  'The guest wants at least one quiet block with no talking. Include the Quiet Garden or Guided Meditation somewhere in the day.'
];
/* Comprehension gate before the builder unlocks — reuses the site's
   existing .choice-btn/.feedback multiple-choice pattern. */
const S6B_CHECK_QUESTIONS = [
  {q:"Why might the Guided Hike not suit this guest?", opts:["It's too expensive","It's high-intensity, and the guest prefers gentle movement","It's fully booked"], correct:1},
  {q:'What time must the guest leave the resort?', opts:['10:00','13:00','15:00'], correct:2}
];

/* ===== Section 8: Explain and Confirm =====
   Student A explains the day plan they built in Section 9 out loud.
   Student B plays the guest and asks two scripted follow-up questions from
   the bank below. */
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

/* ===== Practice: Peer Checklist + Difficult Guest Cases (bonus) ===== */
const PEER_CHECKLIST = [
  'Did they welcome the guest and ask about her goal?',
  'Did they check availability instead of guessing?',
  'Did they explain a constraint clearly, not just say no?',
  'Did they offer a good alternative that still fits the goal?',
  'Did they recommend at least one activity and explain why it fits?',
  'Did they read the plan back to confirm it?'
];
/* Optional/Advanced extension (matches the teacher's "Difficult Guest
   Cases" stage, 25 min if time allows): role-play cards covering four
   realistic complications beyond the core consultation flow. */
const DIFFICULT_GUEST_CASES = [
  {tag:'Case A', text:'The treatment the guest wants most is fully booked all day, not just one slot. Offer a real alternative that still fits her goal.', img:'../../../assets/images/wellness-unit10/spa-unavailable.jpg'},
  {tag:'Case B', text:'The guest arrives 45 minutes late. Rebuild her day without dropping her fixed lunch or her 15:00 departure.'},
  {tag:'Case C', text:'Halfway through the consultation, the guest changes her goal from "relaxation" to "energy and fitness." Adjust your recommendations.'},
  {tag:'Case D', text:'The guest says she doesn\'t actually like the activity you just recommended. Ask why, then offer something else that still fits her goal.'}
];

/* ===== Section 9 (rendered): Writing Task / Handover Note ===== */
const WRITING_TASK = {
  prompt: "Using the wellness day you built for Khun Aing, write a short handover note (4 to 6 sentences) for the next staff member on shift. Include the guest's goal, the confirmed itinerary, one change you made from her original request, and the reason for that change.",
  discussion: [
    {title:'Tourism Business Management', text:'A corporate wellness group\'s most popular treatment is fully booked for the whole morning. Write the handover note explaining the alternative you offered and why it still meets the group\'s goal.'},
    {title:'Wellness Tourism Management', text:'A guest\'s afternoon treatment had to move to a different time because of a fixed lunch seating. Write the handover note so the next staff member gives the guest the same confirmed plan.'}
  ]
};

/* ===== Section 10 (rendered): Self-Check (RUBRIC) =====
   Mirrors the teacher's stated Final Assessment criteria, so students
   self-check against the same five things a live consultation is graded on. */
const RUBRIC = [
  {k:'questions', lbl:'Asking Appropriate Questions', sub:"I can ask about a guest's goal, preferences, and time limits."},
  {k:'fit', lbl:'Choosing Activities That Fit', sub:"I can choose activities that fit the guest's goal and real constraints, like I did when I built Khun Aing's day."},
  {k:'explain', lbl:'Explaining a Decision', sub:'I can explain one decision or alternative clearly, without just saying no.'},
  {k:'language', lbl:'Professional Language', sub:'I can use polite, professional wellness-tourism language throughout.'},
  {k:'confirm', lbl:'Confirming the Itinerary', sub:'I can read the final plan back and confirm it accurately.'}
];

/* ===================== TEACHER GUIDE (courses/wellness/unit-10/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Unit 10: Personalizing a Wellness Day',
  learningOutcome: "By the end of this lesson, students can conduct a short wellness consultation, create a realistic one-day itinerary around a guest's goals and constraints, explain their choices professionally, and offer an appropriate alternative when a requested activity is unavailable.",
  bloomsLevel: 'Remember -> Understand -> Apply -> Analyze -> Evaluate -> Create',
  bloomsStages: [
    {level:'Remember', where:'Sections 2 and 6 (wellness vocabulary and useful phrases)'},
    {level:'Understand', where:'Sections 1 and 7 (identify a guest\'s goal, preference, and constraint; the model consultation)'},
    {level:'Apply', where:'Sections 4 and 9 (vocabulary practice, and building a day, including the guided warm-up practice folded into the start of Section 9)'},
    {level:'Analyze', where:"Section 9's Check My Day, and the optional Spot the Problem bonus in Section 8"},
    {level:'Evaluate', where:'Section 12 (peer checklist)'},
    {level:'Create', where:'Section 10 (Explain and Confirm), the optional Difficult Guest Cases bonus in Section 12, and the live Final Consultation'}
  ],
  addieFocus: 'Analysis: wellness staff need to understand a guest\'s goals, preferences, time limits, and treatment availability before recommending anything. Design: the lesson moves from language input, to a model consultation, to guided planning, to realistic problem-solving, to a final guest consultation. Development: phrase banks (including the three real syllabus-assessed spa phrases), a guest profile, an activity/availability schedule, model audio, a solo planning tool, guided-practice guest cards, and peer feedback. Implementation: students work individually on building the day (most of Section 9), and in pairs both during Section 9\'s guided warm-up and in Section 10 (Explain and Confirm). Evaluation: the teacher observes a final live consultation; students use a peer checklist and self-check rubric in the meantime.',
  grouping: 'Individual work for most of Section 9 (Build a Wellness Day). Paired practice happens twice: at the start of Section 9 (the guided warm-up, asking questions from a guest card) and in Section 10 (Explain and Confirm, explaining a finished plan) — these are deliberately two different paired skills, asking versus explaining, not one activity repeated twice.',
  timing: [
    {block:'1. Meet the Guest', time:'15 min', ref:'Section 1'},
    {block:'2. Language for Consultation (vocabulary)', time:'15 min', ref:'Section 2'},
    {block:'3. The Consultation Process', time:'15 min', ref:'Section 3'},
    {block:'(Does It Fit? vocabulary practice)', time:'15 min', ref:'Section 4'},
    {block:'(Reading)', time:'10 min', ref:'Section 5'},
    {block:'2. Language for Consultation (phrase bank)', time:'10 min', ref:'Section 6 (Useful Phrases)'},
    {block:'4. Model Consultation', time:'20 min', ref:'Section 7'},
    {block:'(After Listening discussion)', time:'10 min', ref:'Section 8'},
    {block:'5-6. Guided Warm-Up + Build a Wellness Day (capstone)', time:'40 min', ref:'Section 9 — paired warm-up, then individual work'},
    {block:'7. Explain and Confirm', time:'15 min', ref:'Section 10 — pairs'},
    {block:'Vocabulary Identification, Peer Checklist, Writing, Self-Check', time:'35 min', ref:'Sections 11-14'},
    {block:'Core total: roughly 200 minutes across a full site pass (about 20 minutes less than before, from folding the old standalone guided-practice section into the capstone)', time:'', ref:''},
    {block:'(Optional/Extension) Spot the Problem', time:'+20 min', ref:'Section 8 bonus block'},
    {block:'(Optional/Extension) Difficult Guest Cases', time:'+25 min', ref:'Section 12 bonus block'}
  ],
  timingNote: "The teacher's original 150-minute core lesson maps onto this site as Sections 1-10 plus the required Sections 11-14 (vocabulary ID, peer checklist, writing, self-check); the site's extra practice sections (Does It Fit? and Reading) add real time beyond a bare 2.5-hour class, so for a tight 2-3 hour session, treat Sections 4-5 as light/skippable review and prioritize Sections 1, 2, 3, 6, 7, 9, and 10. Spot the Problem and Difficult Guest Cases are clearly marked Optional/Extension bonus blocks inside Sections 8 and 12, not required to complete the unit, matching the teacher's own \"Sections 1-7 required, Sections 8-11 optional extension\" design rule.",
  materials: [
    'One device per student for Section 9 (individual work, not shared)',
    'Speakers or headphones for the listening sections',
    "A different guest card for each pair during Section 9's guided warm-up, if you want to avoid every pair rehearsing the identical exchange"
  ],
  teacherPrompts: [
    'Before Section 9: "What do you do when a guest\'s favorite activity is fully booked?"',
    'During Section 9: "Does your plan still include lunch? Does it finish by 15:00? Does it include a quiet block?"',
    'After Section 9: "What would you say to the guest to explain a change you made?"',
    'During Section 9\'s warm-up: "Are you actually asking the guide questions, or skipping straight to recommending something?"'
  ],
  commonProblems: [
    {problem: 'A student adds every activity without checking the constraints first.', fix: '"Check My Day" gives specific feedback on each broken rule — encourage a genuine build → check → adjust loop rather than guessing once and stopping.'},
    {problem: 'A student removes lunch to make the day "easier" to fit together.', fix: 'Lunch is a fixed constraint and cannot be dropped — the checker will flag this. Have them add it back and re-check.'},
    {problem: 'A student recommends a treatment by name only, without explaining it.', fix: 'Point back to Section 7\'s model consultation: a good recommendation says who it\'s ideal for, roughly how long it takes, and what the benefits are, not just its name.'}
  ],
  fastClassExtension: "Assign the optional Spot the Problem (Section 8) or Difficult Guest Cases (Section 12) bonus blocks, or have students swap finished day-plans with a partner and explain each other's plan in Section 10.",
  slowClassCompression: 'Sections 4 (Does It Fit?) and 5 (Reading) can be assigned as homework if time is short — neither gates a later section. The two Optional/Extension bonus blocks can be skipped entirely.',
  assessment: 'The final assessment is a short, teacher-observed consultation, not an automatically graded website activity. Grade it using the official TQF3 Speaking Assessment Rubric (Fluency, Pronunciation & Intelligibility, Vocabulary & Register, Interaction & Responsiveness, Professional Conduct — 20 points each, 100 total). Week 10 is one of six weeks (4, 5, 6, 10, 11, 14) graded on this same official rubric, so use it here too rather than a separate one, to keep grades comparable across weeks. The in-app Self-Check (Section 14) and Peer Checklist (Section 12) mirror this task\'s specific criteria (asking questions, choosing fitting activities, explaining a decision, professional language, confirming the itinerary) for student practice, but the official rubric above is what determines the grade.'
};

/* ===================== ASSETS ===================== */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/wellness-unit10/hero-guest-consultation.jpg', alt:'A wellness consultant reviewing a treatment card with a guest at an outdoor pavilion overlooking the water' },
  meetGuest: { src:'../../../assets/images/wellness-unit10/departure-constraint.jpg', alt:'A wellness coordinator reviewing an itinerary with a guest who has a travel bag ready beside them' }
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 10: Personalizing a Wellness Day',
  unitCode: 'unit-10'
};
