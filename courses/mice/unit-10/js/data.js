/* ===================== UNIT 10 CONTENT DATA — THE INFORMATION DESK =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   info-gap, rubric. Nothing here is UI logic — see app.js for rendering/state/
   voice/progress-tracking.

   Bloom's level: APPLY → ANALYZE. Students combine scattered pieces of information
   from two different sources into one correct, organized whole — a genuine step up
   from Unit 9's Apply-level pitch, and structured as PAIR work with a LISTENING-heavy
   information-gap task (not another solo speaking role-play), per the instructor's
   explicit request to vary activity type and group size across Units 9-15. Invented
   content, part of the Units 9-15 OBE/Bloom's expansion, not drawn from the official
   workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Your First Call of the Day'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Put the Steps in Order'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: A Discrepancy'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Complete the Master Sheet'},
  {key:'s8', label:'Speaking Practice'},
  {key:'crossword', label:'Vocabulary Identification'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Your First Call of the Day =====
   Opens as an actual mini phone transcript instead of a facts list, since
   this unit's whole premise is a coordination call between two desks. */
const OPENING_SCENARIO = {
  dialogue: [
    {who:'Beam (2nd Floor Desk)', text:'Hi, it\'s Beam. A delegate is asking about the digital marketing workshop, and I don\'t see anything about Room 5 on my sheet.'},
    {who:'You', text:'That\'s strange, my printed schedule says it\'s definitely in Room 5.'},
    {who:'Beam (2nd Floor Desk)', text:'Hmm. Something doesn\'t match between our two sheets, and the delegate is still waiting.'}
  ],
  message: 'The delegate is still waiting for an answer.',
  question: 'What should you do?',
  options: [
    {text:'Check the master sheet together before answering.', good:true, note:'Yes. The master sheet is the one source everyone should trust.'},
    {text:'Tell the delegate whichever answer sounds more confident.', good:false, note:'Confidence isn\'t the same as correctness. A wrong answer, said confidently, is still wrong.'},
    {text:'Ask the delegate to check the app themselves.', good:false, note:'That puts the work back on the delegate. Your job is to confirm it for them.'},
    {text:'Stay on the phone with Beam until you both agree on one answer.', good:true, note:'Good instinct. Don\'t hang up until you\'re both looking at the same correct information.'},
    {text:'Apologize for the confusion and ask for one moment to confirm.', good:true, note:'A great way to buy the time you need without leaving the delegate confused.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'8:30', point:'Registration desk opens', where:'Ground floor, Desks 1-4'},
  {time:'9:15', point:'AV testing complete', where:'Confirmed by the IT team'},
  {time:'10:00', point:'Room change: Workshop moves to Room 5', where:'Posted on the event app'},
  {time:'1:00 p.m.', point:'Lunch seating map ready', where:'Available at the Information Desk'},
  {time:'3:30 p.m.', point:'VIP arrival', where:'Escort from the main entrance'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's information rundown. At 8:30, the registration desk opens on the ground floor, desks 1 through 4. At 9:15, AV testing is complete, confirmed by the IT team. At 10:00, there's a room change: the workshop moves to Room 5, posted on the event app, so please update anyone who still has the old room number. At 1 p.m., the lunch seating map will be ready at the Information Desk. And at 3:30, we have a VIP arrival, escorted from the main entrance.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'coordinate', ic:'🔗', nm:'Coordinate', type:'v.', def:'To organize different people or things so they work well together.', ex:'The two desks must coordinate to avoid giving different answers.'},
  {id:'crosscheck', ic:'🔍', nm:'Cross-Check', type:'v.', def:'To compare two sources of information to make sure they match.', ex:'Please cross-check the guest list with the registration desk.'},
  {id:'discrepancy', ic:'⚠️', nm:'Discrepancy', type:'n.', def:'A difference between two pieces of information that should match.', ex:'There\'s a discrepancy between the printed schedule and the app.'},
  {id:'inquiry', ic:'❓', nm:'Inquiry', type:'n.', def:'A question someone asks in order to get information.', ex:'We received an inquiry about the lunch seating.'},
  {id:'consolidate', ic:'📋', nm:'Consolidate', type:'v.', def:'To combine several pieces of information into one.', ex:'Let\'s consolidate all the schedule changes into one sheet.'},
  {id:'pointofcontact', ic:'👤', nm:'Point of Contact', type:'n. phr.', def:'The person someone should talk to for a specific topic.', ex:'I\'m the point of contact for AV questions today.'},
  {id:'relay', ic:'📨', nm:'Relay', type:'v.', def:'To pass a message from one person to another.', ex:'Please relay this update to the front desk team.'},
  {id:'outstanding', ic:'⏳', nm:'Outstanding', type:'adj.', def:'Not yet finished or answered.', ex:'There are three outstanding questions from this morning.'},
  {id:'verify', ic:'✅', nm:'Verify', type:'v.', def:'To check that something is true or correct.', ex:'Always verify the room number before you tell a guest.'},
  {id:'mastersheet', ic:'📑', nm:'Master Sheet', type:'n.', def:'The one official document that has all the correct, current information.', ex:'Only trust the master sheet, not old printouts.'}
];
const VOCAB_SECONDARY = [
  {id:'confirm', nm:'Confirm', def:'To say clearly that something is true or correct.'},
  {id:'update2', nm:'Real-Time', def:'Happening and updating immediately, without delay.'},
  {id:'onhold', nm:'On Hold', def:'Waiting on the phone while someone checks something for you.'},
  {id:'colleague', nm:'Colleague', def:'A person you work with.'},
  {id:'source', nm:'Source', def:'Where a piece of information originally comes from.'}
];

/* ===== Section 2b: Put the Steps in Order (sequencing) =====
   Understand-level check: same objective as before (recognize the correct
   professional process for resolving an information request), different
   mechanic — order the steps instead of picking one "best" option. Array
   order below IS the correct order; the render function shuffles it. */
const SEQUENCE_STEPS = [
  {text:'Listen carefully to the delegate\'s question.'},
  {text:'Check your own sheet first.'},
  {text:'Cross-check with a colleague or the master sheet if you\'re not sure.'},
  {text:'Confirm the verified answer with the delegate.'},
  {text:'Relay any changes to the rest of the team.'}
];

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'coordinate', word:'Coordinate', meaning:'To organize different people or things so they work well together'},
  {id:'crosscheck', word:'Cross-Check', meaning:'To compare two sources of information to make sure they match'},
  {id:'discrepancy', word:'Discrepancy', meaning:'A difference between two pieces of information that should match'},
  {id:'consolidate', word:'Consolidate', meaning:'To combine several pieces of information into one'},
  {id:'pointofcontact', word:'Point of Contact', meaning:'The person someone should talk to for a specific topic'},
  {id:'relay', word:'Relay', meaning:'To pass a message from one person to another'},
  {id:'outstanding', word:'Outstanding', meaning:'Not yet finished or answered'},
  {id:'mastersheet', word:'Master Sheet', meaning:'The one official document that has all the correct, current information'}
];

const FILL_BLANK = [
  {q:'The two desks must __________ to avoid giving different answers.', a:'coordinate'},
  {q:'Please __________ the guest list with the registration desk.', a:'cross-check'},
  {q:"There's a __________ between the printed schedule and the app.", a:'discrepancy'},
  {q:'We received an __________ about the lunch seating.', a:'inquiry'},
  {q:'Let\'s __________ all the schedule changes into one sheet.', a:'consolidate'},
  {q:'Please __________ this update to the front desk team.', a:'relay'},
  {q:'There are three __________ questions from this morning.', a:'outstanding'},
  {q:'Only trust the __________, not old printouts.', a:'master sheet'}
];

const VOCAB_SITUATIONS = [
  {q:'A delegate says the app shows a different room than your printed sheet. What do you say?', model:'"Thank you for telling me. Let me cross-check that with the master sheet right now."'},
  {q:"A colleague asks you to pass a schedule change to another desk. What do you say?", model:'"Of course, I\'ll relay that to them right away."'},
  {q:'You have three questions you still haven\'t answered from earlier. A colleague asks how it\'s going. What do you say?', model:'"I still have three outstanding questions, but I\'m working through them now."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Working the Information Desk',
  paragraphs: [
    'At a large MICE event, information changes constantly: a room gets swapped, a session runs late, a speaker arrives early. The Information Desk exists to give delegates one reliable place to get the current, correct answer, not yesterday\'s answer.',
    'The most important habit for information desk staff is trusting one master sheet, not memory and not old printouts. When a printed schedule and the event app disagree, that is called a discrepancy, and it should never be guessed away. Staff cross-check both against the master sheet before answering a delegate.',
    'Good information desk staff also coordinate constantly with colleagues. If one desk learns about a change, they relay it to every other desk immediately, so no delegate gets a different answer depending on which desk they ask. A team that consolidates updates quickly looks organized. A team that doesn\'t looks unprofessional, even if every individual staff member is trying hard.',
    'Not every question can be answered instantly. When a question is genuinely outstanding, the professional response is not to guess, it is to say so honestly, take the delegate\'s contact information, and verify the answer before following up.',
    'For Wellness Tourism events, this matters even more: a guest asking about their treatment schedule needs an answer they can plan their whole day around, so double-checking before answering isn\'t slow, it\'s respectful of their time.'
  ]
};
const READING_QUESTIONS = [
  {q:'What is the Information Desk\'s main purpose, according to the article?', opts:['To sell tickets','To give delegates one reliable place to get the current, correct answer','To collect complaints only'], correct:1},
  {q:'What should staff do when the printed schedule and the app disagree?', opts:['Guess which one is right','Cross-check both against the master sheet','Tell the delegate to choose'], correct:1},
  {q:'What happens when a team doesn\'t consolidate updates quickly?', opts:['Nothing changes','They look unprofessional, even if individuals are trying hard','Delegates don\'t notice at all'], correct:1},
  {q:'What is the professional response to a genuinely outstanding question?', opts:['Guess an answer so the delegate isn\'t kept waiting','Say so honestly, take their contact details, and verify before following up','Ignore the question'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  checking:{title:'Checking Information', items:[
    'Let me check that for you.',
    'I\'ll cross-check that with my colleague.',
    'Let me verify that before I confirm.',
    'One moment, I\'m looking at the master sheet.',
    'Could you repeat that question, please?'
  ]},
  coordinating:{title:'Coordinating With a Colleague', items:[
    'Can you confirm something for me?',
    'I have a delegate asking about…',
    'According to my sheet, it says…',
    'That doesn\'t match what I have. Let\'s check the master sheet.',
    'Thanks, I\'ll relay that to the delegate.'
  ]},
  closing:{title:'Closing With the Delegate', items:[
    'Thank you for waiting.',
    'I can confirm that for you now.',
    'I\'m sorry for the earlier confusion.',
    'Is there anything else I can help you with?'
  ]}
};

/* ===== Section 6: Listening Script — "A Discrepancy" =====
   Two characters: Fon and Beam, both Information Desk staff, on different floors. */
const BEFORE_LISTEN = {
  setup: 'Fon calls Beam to sort out a discrepancy. Listen and find out how they solve it.',
  guesses: [
    'They argue about who made the mistake.',
    'They check the master sheet together and fix it.',
    'They tell the delegate to figure it out.',
    'They ignore the problem.'
  ]
};
const LISTEN = {
  intro: 'The Information Desk, ground floor. Fon calls her colleague Beam, who is at the second-floor desk.',
  lines: [
    {who:'Fon', text:'Hi Beam, it\'s Fon. I have a delegate here asking about the afternoon workshop, and I think we might have a discrepancy.', kind:'staff'},
    {who:'Beam', text:'Okay, what does your sheet say?', kind:'delegate'},
    {who:'Fon', text:'My printed schedule says the digital marketing workshop is in Room 3 at 2 p.m.', kind:'staff'},
    {who:'Beam', text:'Hmm, that doesn\'t match what I have. My screen shows it moved to Room 5 this morning.', kind:'delegate'},
    {who:'Fon', text:'That\'s exactly the discrepancy. Let\'s cross-check with the master sheet before I tell the delegate anything.', kind:'staff'},
    {who:'Beam', text:'Good idea. Give me one second… okay, confirmed, Room 5 is correct. The move was posted on the event app at 10 a.m.', kind:'delegate'},
    {who:'Fon', text:'Perfect, thank you. I\'ll tell the delegate Room 5, and I\'ll also relay this to the printed-schedule table so they stop handing out the old version.', kind:'staff'},
    {who:'Beam', text:'Good call. I\'ll do the same on my end.', kind:'delegate'},
    {who:'Fon', text:'Thanks, Beam. Talk soon.', kind:'staff'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does the discrepancy involve?', opts:['The lunch menu','Which room the digital marketing workshop is in','The keynote speaker\'s name'], correct:1},
  {q:'What does Fon\'s printed schedule say?', opts:['Room 3 at 2 p.m.', 'Room 5 at 2 p.m.', 'Room 3 at 3 p.m.'], correct:0},
  {q:'What does Beam\'s screen show?', opts:['The workshop was canceled','The workshop moved to Room 5','The workshop moved to Room 1'], correct:1},
  {q:'What do Fon and Beam do before telling the delegate anything?', opts:['Guess which one is right','Cross-check with the master sheet','Ask the delegate to wait until tomorrow'], correct:1},
  {q:'What does Fon plan to do after the call?', opts:['Nothing else is needed','Relay the correct information to the printed-schedule table','Complain to her manager'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Naming the problem clearly and calmly', example:'"I think we might have a discrepancy."'},
  {strategy:'Comparing both sources instead of guessing', example:'"Let\'s cross-check with the master sheet before I tell the delegate anything."'},
  {strategy:'Confirming the source of the correct information', example:'"The move was posted on the event app at 10 a.m."'},
  {strategy:'Taking responsibility for relaying the fix, not just fixing it locally', example:'"I\'ll also relay this to the printed-schedule table."'},
  {strategy:'Ending the call efficiently, without unnecessary small talk', example:'"Thanks, Beam. Talk soon."'}
];

/* ===== Section 6b: Complete the Master Sheet =====
   PAIR information-gap task, using the same .ab-toggle/.ab-btn/.ab-view component
   Unit 5 built for its own info-gap (Section 8). Student A holds the morning
   schedule, Student B holds the afternoon schedule; each must ask their partner
   for the half they don't have, then check their combined sheet against the
   model. This is Unit 10's distinct mechanic (a genuine combine-and-organize
   task) rather than a repeat of Unit 9's solo pitch-builder. */
const SHEET_A = [
  {time:'8:30', session:'Registration Opens', room:'Ground Floor'},
  {time:'9:30', session:'Opening Keynote', room:'Ballroom A'},
  {time:'10:45', session:'Morning Coffee Break', room:'Main Lobby'},
  {time:'11:15', session:'Workshop: Digital Marketing', room:'Room 5'}
];
const SHEET_B = [
  {time:'1:00 p.m.', session:'Lunch', room:'Delegate Dining'},
  {time:'2:00 p.m.', session:'Panel Discussion', room:'Ballroom A'},
  {time:'3:15 p.m.', session:'Afternoon Coffee Break', room:'Main Lobby'},
  {time:'4:00 p.m.', session:'Closing Remarks', room:'Ballroom A'}
];
const MASTER_SHEET_FULL = [...SHEET_A, ...SHEET_B];

/* Role-lock wrapper (see js/role-lock.js) — a real per-student information
   gap for Section 9, replacing the old same-screen A/B toggle. */
const S6B_ROLES = {
  A: {
    label: "I'm Student A: Morning Schedule",
    heading: 'Student A, you have the morning schedule',
    instructions: "Ask Student B for the afternoon schedule and write it down. Don't share your screen — describe your rows out loud instead.",
    rows: SHEET_A,
    phrases: [
      "Can you confirm something for me?",
      "What time is the [session]?",
      "Which room is that in?",
      "Thanks, I'll write that down."
    ]
  },
  B: {
    label: "I'm Student B: Afternoon Schedule",
    heading: 'Student B, you have the afternoon schedule',
    instructions: "Ask Student A for the morning schedule and write it down. Don't share your screen — describe your rows out loud instead.",
    rows: SHEET_B,
    phrases: [
      "I have a question about the morning schedule.",
      "What time does the [session] start?",
      "Could you repeat that, please?",
      "Got it, thank you."
    ]
  }
};

/* ===== Section 8: Speaking Practice — The Information Interview =====
   Apply-level speaking task: Student A (delegate) asks each question aloud,
   Student B (Information Desk) answers using today's rundown from Section 1,
   then they check it off together. A structured Q&A interview, distinct
   from a free-form 2-role scene, but still genuine spoken practice. */
const INTERVIEW_QUESTIONS = [
  'What time does registration open, and where?',
  'Has the AV testing been completed?',
  'Which room is the digital marketing workshop in now?',
  'When will the lunch seating map be ready?',
  'What time is the VIP arrival, and where should they be met?'
];
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'Your colleague tells you the VIP arrival time changed, but you already told a delegate the old time. What do you do?'},
  {tag:'Scenario 2', text:'A delegate insists the app is wrong and gets frustrated when you ask to double-check. Stay calm and professional.'},
  {tag:'Scenario 3', text:'Two colleagues both claim their information is correct and it isn\'t your job to decide who is right. What do you say?'}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they name the discrepancy clearly and calmly?',
  'Did they check the master sheet instead of guessing?',
  'Did they coordinate naturally with their colleague on the phone?',
  'Did they confirm the correct information before answering the delegate?',
  'Did they thank the delegate for waiting?',
  'Did their language sound organized and professional?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'Your printed sheet and your colleague\'s screen disagree about the lunch venue. Call and sort it out.'},
  {tag:'Situation B', text:'A delegate calls back three times about the same outstanding question. Handle the fourth call professionally.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Write a short internal message (4–6 sentences) to the whole Information Desk team, relaying a schedule change you just confirmed. Include what changed, the correct information, and where it came from.',
  discussion: [
    {title:'Tourism Business Management', text:'The keynote speaker\'s flight was delayed and the opening session now starts 30 minutes late. Write the message you would relay to every desk before delegates start arriving.'},
    {title:'Wellness Tourism Management', text:'A wellness guest\'s afternoon treatment was moved to a different therapist due to a scheduling conflict. Write the message you would relay so every desk gives the guest the same correct information.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Information Desk Vocabulary', sub:'I can use coordinate, cross-check, discrepancy, and master sheet correctly.'},
  {k:'combine', lbl:'Combining Information', sub:'I can ask for and combine information I don\'t have with a partner.'},
  {k:'coordinate', lbl:'Coordinating by Phone', sub:'I can coordinate with a colleague to confirm information before answering a guest.'},
  {k:'discrepancy', lbl:'Handling a Discrepancy', sub:'I can calmly identify and resolve a discrepancy between two sources.'},
  {k:'writing', lbl:'Relaying Information in Writing', sub:'I can write a short, clear message relaying a confirmed update.'}
];

/* ===================== TEACHER GUIDE (courses/mice/unit-10/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Unit 10: The Information Desk',
  learningOutcome: 'Students combine two incomplete sources of schedule information into one correct, organized whole, by asking a partner for the half they don\'t have — a genuine step up from Unit 9\'s solo pitch-building toward joint problem-solving.',
  bloomsLevel: 'Apply → Analyze',
  addieFocus: 'A real information gap: Student A and Student B each hold a different half of a conference schedule. Neither can complete the master sheet alone — they must ask each other, listen, and cross-check, which is the actual professional skill this unit teaches (coordinating with a colleague to resolve a discrepancy).',
  grouping: 'Pairs, each partner on their own device or browser tab for Section 9 (Complete the Master Sheet) — this is now technically enforced, not just instructed.',
  timing: [
    {block:'Warm-Up: First Call of the Day', time:'15 min', ref:'Section 1'},
    {block:'Key Vocabulary', time:'15 min', ref:'Section 2'},
    {block:'Put the Steps in Order', time:'10 min', ref:'Section 3'},
    {block:'Vocabulary Activities', time:'20 min', ref:'Section 4'},
    {block:'Reading', time:'15 min', ref:'Section 5'},
    {block:'Useful Phrases', time:'10 min', ref:'Section 6'},
    {block:'Listening: A Discrepancy', time:'15 min', ref:'Section 7'},
    {block:'After Listening', time:'10 min', ref:'Section 8'},
    {block:'Complete the Master Sheet (Info-Gap)', time:'20 min', ref:'Section 9 — pairs on separate devices'},
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
    'After Section 9: "Which was harder — getting the information, or getting it accurately?"'
  ],
  commonProblems: [
    {problem: 'A pair shares one device for Section 9.', fix: 'Section 9 now locks to one role per browser/session — if they share a device, only one of them can see a role\'s content at a time, and the picker screen makes this visible immediately. Have each student open the unit on their own phone or laptop before starting Section 9.'},
    {problem: 'A student clicks "Start Over" just to see the other role.', fix: 'This is visible and expected for solo practice, but the copy in the picker and the Start Over footer both say plainly that doing this outside a real pair defeats the point of the activity — reinforce this verbally when circulating.'}
  ],
  fastClassExtension: 'Have pairs swap partners and repeat Section 9 with a different information sequence, or add a spoken accuracy check where the partner reads back the combined sheet.',
  slowClassCompression: 'Sections 3 (Put the Steps in Order) and 8 (After Listening) can be assigned as homework if time is short — neither gates a later section.',
  assessment: 'Speaking (info-gap coordination, Section 9), Writing (Section 13), and vocabulary accuracy (Sections 2 and 11) are the three most useful grading points; the self-check in Section 14 is student-reflective, not evaluative.'
};

/* ===================== ASSETS ===================== */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/mice-u10-hero.jpg', alt:'A hotel information desk staff member ready to help behind an elegant reception counter' }
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 10: The Information Desk',
  unitCode: 'unit-10'
};
