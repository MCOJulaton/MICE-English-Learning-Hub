/* ===================== UNIT 10 CONTENT DATA — THE RETREAT PROGRAM BOARD =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   info-gap, rubric. Nothing here is UI logic — see app.js for rendering/state/
   voice/progress-tracking.

   Bloom's level: APPLY → ANALYZE. Students combine scattered pieces of a
   week-long retreat schedule from two different sources into one correct,
   organized whole — a genuine step up from Unit 9's Apply-level task, and
   structured as PAIR work with a LISTENING-heavy information-gap task (not
   another solo explanation task), per the instructor's explicit request to
   vary activity type and group size across Units 9-15. Invented content,
   part of the Units 9-15 OBE/Bloom's expansion, not drawn from the official
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
  {key:'s6b', label:'Complete the Program Board'},
  {key:'s8', label:'Speaking Practice'},
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

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'coordinate', ic:'🔗', nm:'Coordinate', type:'v.', def:'To organize different people or things so they work well together.', ex:'The two coordinators must coordinate to avoid giving different answers.'},
  {id:'crosscheck', ic:'🔍', nm:'Cross-Check', type:'v.', def:'To compare two sources of information to make sure they match.', ex:'Please cross-check the program board with the guest app.'},
  {id:'update', ic:'🔄', nm:'Update', type:'v./n.', def:'To give the newest, correct information.', ex:'Can you update the program board for tomorrow?'},
  {id:'combine', ic:'🧩', nm:'Combine', type:'v.', def:'To put different things together to make one complete whole.', ex:"Let's combine both halves of the schedule into one full week."},
  {id:'consult', ic:'💬', nm:'Consult', type:'v.', def:'To ask a colleague for information or advice before deciding.', ex:'I always consult my colleague before confirming a change.'},
  {id:'record', ic:'📒', nm:'Record', type:'n.', def:'A written account of information, kept for later reference.', ex:'Check the program record for last week\'s activities.'},
  {id:'verify', ic:'✅', nm:'Verify', type:'v.', def:'To check that something is true or correct.', ex:'Always verify the activity time before you tell a guest.'},
  {id:'coordinator', ic:'👤', nm:'Coordinator', type:'n.', def:'A staff member responsible for organizing the retreat program.', ex:"I'm the coordinator for the morning activities this week."},
  {id:'adjust', ic:'🛠️', nm:'Adjust', type:'v.', def:'To change something slightly to fit new information.', ex:'We had to adjust the schedule after the weather changed.'},
  {id:'programboard', ic:'📋', nm:'Program Board', type:'n.', def:'The one official document showing the full retreat schedule.', ex:'Only trust the program board, not last week\'s printout.'}
];
const VOCAB_SECONDARY = [
  {id:'confirm2', nm:'Confirm', def:'To say clearly that something is true or correct.'},
  {id:'realtime', nm:'Real-Time', def:'Happening and updating immediately, without delay.'},
  {id:'onhold2', nm:'On Hold', def:'Waiting on the phone while someone checks something for you.'},
  {id:'colleague2', nm:'Colleague', def:'A person you work with.'},
  {id:'source2', nm:'Source', def:'Where a piece of information originally comes from.'}
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
  {id:'coordinate', word:'Coordinate', meaning:'To organize different people or things so they work well together'},
  {id:'crosscheck', word:'Cross-Check', meaning:'To compare two sources of information to make sure they match'},
  {id:'combine', word:'Combine', meaning:'To put different things together to make one complete whole'},
  {id:'consult', word:'Consult', meaning:'To ask a colleague for information or advice before deciding'},
  {id:'record', word:'Record', meaning:'A written account of information, kept for later reference'},
  {id:'coordinator', word:'Coordinator', meaning:'A staff member responsible for organizing the retreat program'},
  {id:'adjust', word:'Adjust', meaning:'To change something slightly to fit new information'},
  {id:'programboard', word:'Program Board', meaning:'The one official document showing the full retreat schedule'}
];

const FILL_BLANK = [
  {q:'The two coordinators must __________ to avoid giving different answers.', a:'coordinate'},
  {q:'Please __________ the program board with the guest app.', a:'cross-check'},
  {q:"Let's __________ both halves of the schedule into one full week.", a:'combine'},
  {q:'I always __________ my colleague before confirming a change.', a:'consult'},
  {q:"Check the program __________ for last week's activities.", a:'record'},
  {q:'Always __________ the activity time before you tell a guest.', a:'verify'},
  {q:'We had to __________ the schedule after the weather changed.', a:'adjust'},
  {q:'Only trust the __________, not last week\'s printout.', a:'program board'}
];

const VOCAB_SITUATIONS = [
  {q:'A guest says the app shows a different activity than your printed card. What do you say?', model:'"Thank you for telling me. Let me cross-check that with the program board right now."'},
  {q:'A colleague asks you to combine two half-schedules into one. What do you say?', model:'"Of course, let me consult my notes and combine them for you."'},
  {q:'The weather forces a change to tomorrow\'s outdoor session. What do you say to a guest?', model:'"We had to adjust tomorrow\'s schedule slightly because of the weather, here\'s the update."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Coordinating the Retreat Program Board',
  paragraphs: [
    'A week-long wellness retreat has dozens of moving parts: yoga sessions, treatments, meal times, and workshops, each with its own room, therapist, and time slot. Guests rely on one thing above all: knowing they can trust the schedule they\'re given.',
    'The most important habit for retreat staff is trusting one shared program board, not memory and not last week\'s printout. When a printed schedule card and the guest app disagree, staff cross-check both against the program board before answering a guest.',
    'Good retreat staff also coordinate constantly with colleagues, even ones on a completely different floor or shift. If one coordinator learns about a change, they relay it to every other coordinator immediately, so no guest gets a different answer depending on who they ask.',
    'Combining scattered pieces of a schedule takes real communication skill. Two staff each holding half a week\'s program must ask each other clear questions, listen carefully, and record the answer accurately, not just guess at what the other person probably means.',
    'For guests who booked a retreat specifically to relax, discovering that the schedule keeps changing without warning undoes exactly the calm they came for. A well-coordinated program board protects that experience.'
  ]
};
const READING_QUESTIONS = [
  {q:'What do guests rely on above all, according to the article?', opts:['The cheapest possible price','Being able to trust the schedule they\'re given','Having no schedule at all'], correct:1},
  {q:'What should staff do when the printed card and the app disagree?', opts:['Guess which one is right','Cross-check both against the program board','Tell the guest to choose'], correct:1},
  {q:'What does combining two halves of a schedule require, according to the article?', opts:['Guessing what the other person probably means','Clear questions, careful listening, and accurate recording','Nothing special at all'], correct:1},
  {q:'Why does an unreliable schedule matter especially for retreat guests?', opts:['It doesn\'t matter to them at all','It undoes the calm and relaxation they came for','Guests never notice schedule changes'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  checking:{title:'Checking Information', items:[
    'Let me check that for you.',
    'I\'ll cross-check that with my colleague.',
    'Let me verify that before I confirm.',
    'One moment, I\'m looking at the program board.'
  ]},
  coordinating:{title:'Coordinating With a Colleague', items:[
    'Can you confirm something for me?',
    'I have a guest asking about…',
    'According to my board, it says…',
    'That doesn\'t match what I have. Let\'s check the program board.'
  ]},
  closing:{title:'Closing With the Guest', items:[
    'Thank you for waiting.',
    'I can confirm that for you now.',
    "I'm sorry for the earlier confusion.",
    'Is there anything else I can help you with?'
  ]}
};

/* ===== Section 6: Listening Script — "A Mix-Up" =====
   Two characters: Ploy and Tam, both retreat coordinators, on different floors. */
const BEFORE_LISTEN = {
  setup: 'Ploy calls Tam to sort out a mix-up. Listen and find out how they solve it.',
  guesses: [
    'They argue about who made the mistake.',
    'They check the program board together and fix it.',
    'They tell the guest to figure it out.',
    'They ignore the problem.'
  ]
};
const LISTEN = {
  intro: 'Harmony Wellness Resort. Ploy calls her colleague Tam, who coordinates the second-floor treatment rooms.',
  lines: [
    {who:'Ploy', text:"Hi Tam, it's Ploy. I have a guest here asking about Day 4, and I think we might have a mix-up.", kind:'staff'},
    {who:'Tam', text:'Okay, what does your board say?', kind:'delegate'},
    {who:'Ploy', text:'My printed schedule says the morning hike is at 8 a.m., before breakfast.', kind:'staff'},
    {who:'Tam', text:"Hmm, that doesn't match what I have. My screen shows it moved to 9:30, right after breakfast.", kind:'delegate'},
    {who:'Ploy', text:"That's exactly the mix-up. Let's cross-check with the program board before I tell the guest anything.", kind:'staff'},
    {who:'Tam', text:'Good idea. Give me one second… okay, confirmed, 9:30 is correct. The move was posted on the guest app yesterday evening.', kind:'delegate'},
    {who:'Ploy', text:"Perfect, thank you. I'll tell the guest 9:30, and I'll also relay this to the breakfast team so they stop handing out the old cards.", kind:'staff'},
    {who:'Tam', text:"Good call. I'll do the same on my end.", kind:'delegate'},
    {who:'Ploy', text:'Thanks, Tam. Talk soon.', kind:'staff'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does the mix-up involve?', opts:['The lunch menu','What time the morning hike starts','The therapist\'s name'], correct:1},
  {q:"What does Ploy's printed schedule say?", opts:['8 a.m., before breakfast', '9:30, after breakfast', '10 a.m., after lunch'], correct:0},
  {q:"What does Tam's screen show?", opts:['The hike was canceled','The hike moved to 9:30','The hike moved to 7 a.m.'], correct:1},
  {q:'What do Ploy and Tam do before telling the guest anything?', opts:['Guess which one is right','Cross-check with the program board','Ask the guest to wait until tomorrow'], correct:1},
  {q:'What does Ploy plan to do after the call?', opts:['Nothing else is needed','Relay the correct information to the breakfast team','Complain to her manager'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Naming the problem clearly and calmly', example:'"I think we might have a mix-up."'},
  {strategy:'Comparing both sources instead of guessing', example:"\"Let's cross-check with the program board before I tell the guest anything.\""},
  {strategy:'Confirming the source of the correct information', example:'"The move was posted on the guest app yesterday evening."'},
  {strategy:'Taking responsibility for relaying the fix, not just fixing it locally', example:"\"I'll also relay this to the breakfast team.\""},
  {strategy:'Ending the call efficiently, without unnecessary small talk', example:'"Thanks, Tam. Talk soon."'}
];

/* ===== Section 6b: Complete the Program Board =====
   PAIR information-gap task, using the same .ab-toggle/.ab-btn/.ab-view
   component the MICE course's Unit 10 built for its own info-gap. Student A
   holds the first-half schedule, Student B holds the second-half schedule;
   each must ask their partner for the half they don't have, then check
   their combined board against the model. This is Unit 10's distinct
   mechanic (a genuine combine-and-organize task) rather than a repeat of
   Unit 9's solo explanation-builder. */
const SHEET_A = [
  {time:'Day 1', session:'Arrival & Welcome Tea', room:'Garden Pavilion'},
  {time:'Day 2', session:'Sunrise Yoga & Nutrition Talk', room:'Garden Pavilion / Wellness Library'},
  {time:'Day 3', session:'Detox Spa Morning', room:'Spa Wing'},
  {time:'Day 4', session:'Guided Hike (9:30, after breakfast)', room:'Trailhead'}
];
const SHEET_B = [
  {time:'Day 5', session:'Silent Reflection Day', room:'Quiet Garden'},
  {time:'Day 6', session:'Couples & Partner Treatments', room:'Spa Wing'},
  {time:'Day 7', session:'Closing Ceremony & Farewell Brunch', room:'Garden Pavilion'}
];
const MASTER_SHEET_FULL = [...SHEET_A, ...SHEET_B];

/* Role-lock wrapper (see js/role-lock.js) — a real per-student information
   gap for Section 9, replacing the old same-screen A/B toggle. */
const S6B_ROLES = {
  A: {
    label: "I'm Student A: Days 1-4",
    heading: 'Student A, you have Days 1-4',
    instructions: "Ask Student B for Days 5-7 and write it down. Don't share your screen — describe your rows out loud instead.",
    rows: SHEET_A,
    phrases: [
      "Can you confirm something for me?",
      "What time is the [session]?",
      "Which room is that in?",
      "Thanks, I'll write that down."
    ]
  },
  B: {
    label: "I'm Student B: Days 5-7",
    heading: 'Student B, you have Days 5-7',
    instructions: "Ask Student A for Days 1-4 and write it down. Don't share your screen — describe your rows out loud instead.",
    rows: SHEET_B,
    phrases: [
      "I have a question about the first half of the week.",
      "What time does the [session] start?",
      "Could you repeat that, please?",
      "Got it, thank you."
    ]
  }
};

/* ===== Section 8: Speaking Practice — The Information Interview =====
   Same 2-person interaction, presented as a real interview drill instead of
   a scripted role-play, extending the info-gap DNA already central to this
   unit's own s6b task, mirroring MICE Unit 10's own Information Interview. */
const INTERVIEW_QUESTIONS = [
  'What time does the sunrise yoga session start, and where?',
  "Has today's schedule change been posted on the guest app?",
  'Which room is the detox spa morning held in?',
  "When will tomorrow's program board be finalized?",
  'What time is the closing ceremony, and where should guests meet?'
];
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'Your colleague tells you the closing ceremony time changed, but you already told a guest the old time. What do you do?'},
  {tag:'Scenario 2', text:'A guest insists the app is wrong and gets frustrated when you ask to double-check. Stay calm and professional.'},
  {tag:'Scenario 3', text:'Two colleagues both claim their information is correct and it isn\'t your job to decide who is right. What do you say?'}
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
  prompt: 'Write a short internal message (4–6 sentences) to the whole coordinator team, relaying a schedule change you just confirmed. Include what changed, the correct information, and where it came from.',
  discussion: [
    {title:'Tourism Business Management', text:'A corporate wellness group\'s closing ceremony time was moved due to a venue conflict. Write the message you would relay to every coordinator before guests start asking.'},
    {title:'Wellness Tourism Management', text:'A guest\'s afternoon treatment was moved to a different therapist due to a scheduling conflict. Write the message you would relay so every coordinator gives the guest the same correct information.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Coordination Vocabulary', sub:'I can use coordinate, cross-check, combine, and program board correctly.'},
  {k:'combine', lbl:'Combining Information', sub:'I can ask for and combine information I don\'t have with a partner.'},
  {k:'coordinate', lbl:'Coordinating by Phone', sub:'I can coordinate with a colleague to confirm information before answering a guest.'},
  {k:'mixup', lbl:'Handling a Mix-Up', sub:'I can calmly identify and resolve a mix-up between two sources.'},
  {k:'writing', lbl:'Relaying Information in Writing', sub:'I can write a short, clear message relaying a confirmed update.'}
];

/* ===================== TEACHER GUIDE (courses/wellness/unit-10/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Unit 10: The Retreat Program Board',
  learningOutcome: 'Students combine two incomplete halves of a week-long retreat schedule into one correct, organized whole, by asking a partner for the half they don\'t have — a genuine step up from Unit 9\'s solo explanation task toward joint problem-solving.',
  bloomsLevel: 'Apply → Analyze',
  addieFocus: 'A real information gap: Student A and Student B each hold a different half of the week\'s program. Neither can complete the program board alone — they must ask each other, listen, and cross-check, which is the actual professional skill this unit teaches (coordinating with a colleague to resolve a mix-up).',
  grouping: 'Pairs, each partner on their own device or browser tab for Section 9 (Complete the Program Board) — this is now technically enforced, not just instructed.',
  timing: [
    {block:'Warm-Up: First Call of the Day', time:'15 min', ref:'Section 1'},
    {block:'Key Vocabulary', time:'15 min', ref:'Section 2'},
    {block:'Put the Steps in Order', time:'10 min', ref:'Section 3'},
    {block:'Vocabulary Activities', time:'20 min', ref:'Section 4'},
    {block:'Reading', time:'15 min', ref:'Section 5'},
    {block:'Useful Phrases', time:'10 min', ref:'Section 6'},
    {block:'Listening: A Mix-Up', time:'15 min', ref:'Section 7'},
    {block:'After Listening', time:'10 min', ref:'Section 8'},
    {block:'Complete the Program Board (Info-Gap)', time:'20 min', ref:'Section 9 — pairs on separate devices'},
    {block:'Speaking Practice: The Information Interview', time:'15 min', ref:'Section 10'},
    {block:'Vocabulary Identification, Peer Checklist, Writing, Self-Check', time:'35 min', ref:'Sections 11-14'}
  ],
  materials: [
    'One device per student for Section 9 (the info-gap now requires this — a shared screen defeats the lock)',
    'Speakers or headphones for the listening sections'
  ],
  teacherPrompts: [
    'Before Section 9: "What happens if you just guess the other half instead of asking your partner?"',
    'During Section 9: "Are you only describing your rows out loud, or is someone peeking at the other screen?"',
    'After Section 9: "Which was harder, getting the information, or getting it accurately?"'
  ],
  commonProblems: [
    {problem: 'A pair shares one device for Section 9.', fix: 'Section 9 now locks to one role per browser/session — if they share a device, only one of them can see a role\'s content at a time, and the picker screen makes this visible immediately. Have each student open the unit on their own phone or laptop before starting Section 9.'},
    {problem: 'A student clicks "Start Over" just to see the other role.', fix: 'This is visible and expected for solo practice, but the copy in the picker and the Start Over footer both say plainly that doing this outside a real pair defeats the point of the activity — reinforce this verbally when circulating.'}
  ],
  fastClassExtension: 'Have pairs swap partners and repeat Section 9 with a different information sequence, or add a spoken accuracy check where the partner reads back the combined board.',
  slowClassCompression: 'Sections 3 (Put the Steps in Order) and 8 (After Listening) can be assigned as homework if time is short — neither gates a later section.',
  assessment: 'Speaking (info-gap coordination, Section 9), Writing (Section 13), and vocabulary accuracy (Sections 2 and 11) are the three most useful grading points; the self-check in Section 14 is student-reflective, not evaluative.'
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 10: The Retreat Program Board',
  unitCode: 'unit-10'
};
