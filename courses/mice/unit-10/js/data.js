/* ===================== UNIT 10 CONTENT DATA — ANSWERING THE PHONE AT THE INFORMATION DESK =====================
   All lesson content lives here: vocabulary, phrases, reading, listening scripts,
   role-play cards, rubric. Nothing here is UI logic — see app.js for rendering/state/
   voice/progress-tracking.

   Real TQF3 alignment: Week 10, "Professional Phone Communication" (CLO2/CLO3).
   Students learn the 7-step call structure (greet, introduce, offer help, clarify,
   decide/check, respond, close), including a genuine three-way decision inside the
   call (answer it yourself, transfer to another department, or take a message when
   the person is unavailable) — not just an "answer the question" task. Bloom's:
   Remember (vocab/phrases) -> Understand (structure/etiquette) -> Apply (controlled
   + guided practice) -> Analyze (spot the mistakes) -> Evaluate (peer checklist) ->
   Create (independent role-plays and the live final call, which this site does not
   and cannot auto-grade). */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Your First Call of the Day'},
  {key:'s2', label:'How We Answer the Phone'},
  {key:'s2b', label:'Put the Steps in Order'},
  {key:'s3', label:'Vocabulary by Ear'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: Good Call, Poor Call'},
  {key:'s7', label:'After Listening: Spot the Mistakes'},
  {key:'s6b', label:'Complete the Master Sheet'},
  {key:'s8', label:'Delegate Information Desk Challenge'},
  {key:'crossword', label:'Vocabulary Identification'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Your First Call of the Day =====
   Opens as a real inbound call gone wrong: the staff member skips the
   greeting entirely and guesses instead of checking. */
const OPENING_SCENARIO = {
  dialogue: [
    {who:'Staff', text:'Information Desk, yeah, hi.'},
    {who:'Caller', text:'Hi, I\'m calling about my session, I think the room changed?'},
    {who:'Staff', text:'Probably still Room 3, should be fine.'}
  ],
  message: 'The caller hangs up still unsure, and the staff member never actually checked anything.',
  question: 'What should the staff member have done differently?',
  options: [
    {text:'Greet the caller properly and give the venue name.', good:true, note:'Yes. A caller should always hear who they\'ve reached, right away.'},
    {text:'Answer with whatever sounds likely, to save time.', good:false, note:'Sounding confident isn\'t the same as being correct. Guessing is the fastest way to give a caller the wrong information.'},
    {text:'Ask a clarifying question before answering.', good:true, note:'Good instinct. Confirm exactly which session and time before you say anything.'},
    {text:'Check the schedule instead of guessing.', good:true, note:'Exactly. If you\'re not sure, check first, even if that means a short hold.'},
    {text:'Tell the caller to call back later.', good:false, note:'That pushes the work back onto the caller. Your job is to help them now, even if that means checking and calling them back yourself.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'8:30', point:'Registration desk opens', where:'Ground floor, Desks 1-4'},
  {time:'9:15', point:'AV testing complete', where:'Confirmed by the IT team'},
  {time:'10:00', point:'Room change: Workshop moves to Room 5', where:'Posted on the event app'},
  {time:'1:00 p.m.', point:'Lunch seating map ready', where:'Available at the Information Desk'},
  {time:'3:30 p.m.', point:'VIP arrival', where:'Escort from the main entrance'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's information rundown, the kind of thing callers will ask you about today. At 8:30, the registration desk opens on the ground floor, desks 1 through 4. At 9:15, AV testing is complete, confirmed by the IT team. At 10:00, there's a room change: the workshop moves to Room 5, posted on the event app, so please update anyone who still has the old room number. At 1 p.m., the lunch seating map will be ready at the Information Desk. And at 3:30, we have a VIP arrival, escorted from the main entrance.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'greet', ic:'👋', nm:'Greet', type:'v.', def:'To welcome someone politely at the start of a conversation.', ex:'Always greet the caller before you ask why they\'re calling.'},
  {id:'introduce', ic:'🙋', nm:'Introduce', type:'v.', def:'To tell someone your name so they know who they\'re speaking to.', ex:'Introduce yourself before you offer to help.'},
  {id:'direct', ic:'➡️', nm:'Direct (a call)', type:'v. phr.', def:'To send a caller or their question to the right person or desk.', ex:'I\'ll direct your call to the registration desk.'},
  {id:'hold', ic:'⏸️', nm:'Hold', type:'v./n.', def:'To wait on the phone while someone checks something for you.', ex:'May I put you on hold for a moment?'},
  {id:'transfer', ic:'🔀', nm:'Transfer', type:'v.', def:'To connect a caller to a different person or extension without ending the call.', ex:'I\'m going to transfer you to the AV team now.'},
  {id:'extension', ic:'☎️', nm:'Extension', type:'n.', def:'A short internal phone number connecting directly to one desk or person.', ex:'You can reach the VIP desk on extension 204.'},
  {id:'caller', ic:'📞', nm:'Caller', type:'n.', def:'The person who is calling.', ex:'The caller wanted to know if the keynote had started.'},
  {id:'confirm', ic:'✅', nm:'Confirm', type:'v.', def:'To say clearly that something is true or correct.', ex:'I can confirm your session moved to Ballroom B.'},
  {id:'followup', ic:'🔁', nm:'Follow Up', type:'v. phr.', def:'To contact someone again later with an answer you didn\'t have yet.', ex:'I\'ll follow up with you by three o\'clock.'},
  {id:'message', ic:'📝', nm:'Message', type:'n./v.', def:'Information you write down and pass on for someone else.', ex:'Could I take a message for the events manager?'}
];
const VOCAB_SECONDARY = [
  {id:'urgent', nm:'Urgent', def:'Needing action right away.'},
  {id:'venue', nm:'Venue', def:'The place where an event is held.'},
  {id:'polite', nm:'Polite', def:'Respectful and well-mannered.'},
  {id:'pace', nm:'Pace', def:'The speed someone speaks at.'},
  {id:'garbled', nm:'Garbled', def:'Unclear or hard to understand, often over a bad line.'}
];

/* Section 2 is taught as a practical "what, why, how" guide instead of a
   flat glossary — the 10 VOCAB words above appear highlighted in real
   context (app.js turns each [[id:label]] token into a clickable term
   that looks up VOCAB by id), not as isolated definitions. */
const PHONE_GUIDE = {
  what: 'Every day, the Information Desk phone connects you to a real [[caller:caller]] with a real need: something you can answer yourself, something another department needs to handle, or someone who isn\'t available right now. Answering it well is a skill with real steps, not just good manners.',
  why: 'The first few seconds of a call shape how professional the whole event feels. A caller who is [[greet:greeted]] properly and helped calmly trusts everything else you tell them, even if the answer takes a moment to find.',
  steps: [
    '[[greet:Greet]] the caller immediately and clearly. Don\'t just say "hello", name the venue so the caller knows they\'ve reached the right place.',
    '[[introduce:Introduce]] yourself by name. A caller who knows who they\'re speaking to trusts the call more.',
    'Ask what the caller needs, then listen. Most calls fall into one of three types: something you can answer yourself, something that needs another department, or someone who isn\'t available right now.',
    'If you can answer directly, [[confirm:confirm]] the details before you speak. Don\'t guess.',
    'If another department can help, ask permission, then [[direct:direct]] the call, or [[transfer:transfer]] it, to the right [[extension:extension]].',
    'If the person they need is out, take a [[message:message]]: get the caller\'s name, number, and reason for calling.',
    'Before you hang up, [[followup:follow up]] on anything you promised, and only put the caller on [[hold:hold]] when you actually need a moment to check something, never to stall.'
  ]
};

/* ===== Section 2b: Put the Steps in Order (sequencing) =====
   The 7-step call structure, also reused as the per-card checklist in
   Section 10's Delegate Information Desk Challenge. Steps 5-6 carry a real
   three-way decision (answer it yourself / transfer / take a message) —
   the ordering UI is linear, so the branch is written into the step text
   itself and taught concretely through Sections 5 and 10. Array order
   below IS the correct order; the render function shuffles it. */
const SEQUENCE_STEPS = [
  {text:'Answer promptly and greet the caller.'},
  {text:'Introduce yourself.'},
  {text:'Ask how you can help.'},
  {text:'Clarify exactly what the caller needs.'},
  {text:'Decide: can I answer this myself, does another department need to help, or is the person unavailable?'},
  {text:'Respond accordingly: check and confirm it yourself, or ask permission and transfer, or take a full message.'},
  {text:'Close professionally (confirm what was agreed, promise a follow-up if needed, thank the caller).'}
];

/* ===== Section 3: Vocabulary by Ear =====
   An audio-first recall activity: VoiceEngine speaks each word's definition
   aloud (never the word itself), and the student picks the matching word
   from four shuffled choices, drawing directly on VOCAB above (no separate
   content needed). Recognizing vocabulary by ear is a literal real-world
   skill for someone answering phones, and it's a different mechanic from
   the crossword slot below, which is a text-based word/definition quiz. */
const VOCAB_SITUATIONS = [
  {q:'A caller asks a question you\'re not sure about. What do you say?', model:'"Let me check that for you. May I put you on hold for a moment?"'},
  {q:'A caller needs a different department. What do you say?', model:'"I\'ll transfer you to the registration desk now, one moment please."'},
  {q:'The person a caller wants isn\'t available. What do you say?', model:'"I\'m sorry, they\'re not available right now. Could I take a message?"'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Answering the Phone at the Information Desk',
  paragraphs: [
    'For many delegates and colleagues, the phone call to the Information Desk is their very first contact with the whole event, before they\'ve even met a staff member in person. How that call is answered shapes their opinion of the entire team, long before the first question is even asked.',
    'Every good call starts the same way: answer promptly, greet the caller by naming the venue, and give your own name. "How may I help you?" is the natural, friendly default for a general enquiry. "How may I direct your call?" is especially useful when you already expect the caller might need transferring, since it signals from the very first line that you\'re ready to route their call, not just answer it.',
    'Once the caller explains what they need, a good staff member makes one more decision before saying anything else: can I answer this myself, does another department need to help, or is the person they\'re asking for simply not available? Deciding this early, calmly, keeps the rest of the call on track.',
    'If the answer is yours to give, the worst thing you can do is guess. A confident wrong answer is still wrong, and callers remember being misled far longer than they remember being asked to wait. The professional habit is to check, even if that means asking, "May I put you on hold for a moment?"',
    'If someone else needs to help, or the person the caller wants isn\'t available, the call still ends well when it\'s handled properly. Before transferring, ask permission and say who you\'re connecting them to. When taking a message, get the caller\'s name, organisation, phone number, reason for calling, and preferred follow-up time, then repeat it all back to confirm nothing was missed.',
    'A good call doesn\'t just end, it closes. That means confirming what was agreed, promising a specific follow-up if something wasn\'t confirmed yet, and thanking the caller before hanging up. A line like "I\'ll make sure that\'s taken care of" tells the caller their request didn\'t disappear the moment the call ended.'
  ]
};
const READING_QUESTIONS = [
  {q:'Why does the article say the first phone call matters so much?', opts:['It\'s often a caller\'s first contact with the whole event, before meeting anyone in person','It\'s the only call of the day','Callers never call more than once'], correct:0},
  {q:'When is "How may I direct your call?" especially useful, according to the article?', opts:['When there\'s nothing to do','When the caller might need transferring','When the line is bad'], correct:1},
  {q:'What decision should staff make right after clarifying the request?', opts:['Whether to end the call','Whether they can answer it themselves, need another department, or the person is unavailable','What time it is'], correct:1},
  {q:'What should staff do instead of guessing an answer?', opts:['Say it confidently anyway','Check, even if that means asking to put the caller on hold','Transfer every call'], correct:1},
  {q:'What should staff get before ending a message-taking call?', opts:['Just a name','Name, organisation, phone number, reason for calling, and preferred follow-up time, then repeat it back','Nothing, just hang up'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  answering:{title:'Answering & Introducing', items:[
    'Good afternoon, [venue name], how may I help you?',
    'Good afternoon, [venue name], how may I direct your call?',
    'My name is ___, I\'m on the Information Desk today.',
    'How can I help you?',
    'Thank you for calling.'
  ]},
  clarifying:{title:'Clarifying', items:[
    'Just to confirm, is that…?',
    'Could you repeat that, please?',
    'I\'m sorry, could you say that once more?',
    'So you\'re asking about…, is that right?'
  ]},
  checking:{title:'Checking & Confirming', items:[
    'May I put you on hold for a moment?',
    'Thank you for holding.',
    'Let me just check that for you.',
    'I don\'t have that confirmed yet, but here\'s what I can tell you.'
  ]},
  transferring:{title:'Asking Permission & Transferring', img:'../../../assets/images/mice-unit10-phone/transfer-call.jpg', items:[
    'I\'m going to transfer you to [department] now, is that alright?',
    'May I put you on hold while I transfer you?',
    'I\'ll connect you with someone who can help with that.',
    'Thanks for holding, I\'m transferring you now.'
  ]},
  message:{title:'Taking a Message', items:[
    'I\'m sorry, they\'re not available right now. Could I take a message?',
    'Could I get your name and organisation, please?',
    'What\'s the best number to reach you on?',
    'So just to confirm: [name], [organisation], [number], calling about [reason], and you\'d like a call back [time]. Is that right?'
  ]},
  closing:{title:'Confirming & Closing', items:[
    'I can confirm that…',
    'I\'ll make sure that\'s taken care of.',
    'Is there anything else I can help you with?',
    'Thank you for calling. Have a great afternoon.'
  ]}
};

/* ===== Section 6: Listening — Good Call, Poor Call =====
   Two short model calls via the shared VoiceEngine two-voice system.
   GOOD_CALL demonstrates the "answer it myself" branch cleanly, using
   the natural default greeting. POOR_CALL contains four deliberate
   etiquette violations for Section 7's Spot the Mistakes. */
const BEFORE_LISTEN = {
  setup: 'The phone rings at the Information Desk. Listen and find out how Ploy handles the call.',
  guesses: [
    'She answers questions immediately, without checking anything.',
    'She greets the caller, checks the schedule, and confirms before answering.',
    'She tells the caller to call back later.',
    'She transfers the call without finding out what they need.'
  ]
};
const GOOD_CALL = {
  intro: 'The Information Desk phone rings. Ploy answers.',
  lines: [
    {who:'Staff (Ploy)', kind:'staff', text:'Good afternoon, Thailand Health and Business Tourism Forum, how may I help you?'},
    {who:'Caller (Doctor Narin)', kind:'delegate', text:'Oh, hi. This is Doctor Narin from the Wellness Tourism panel. I\'m calling about my session room, I think it might have changed?'},
    {who:'Staff (Ploy)', kind:'staff', text:'Thank you for calling, Doctor Narin. My name is Ploy, I\'m on the Information Desk today. I\'d be happy to check that for you.'},
    {who:'Staff (Ploy)', kind:'staff', text:'Just to confirm, is that the wellness panel scheduled for two o\'clock this afternoon?'},
    {who:'Caller (Doctor Narin)', kind:'delegate', text:'Yes, that\'s the one.'},
    {who:'Staff (Ploy)', kind:'staff', text:'Thank you. May I put you on hold for a moment while I check the master schedule?'},
    {who:'Caller (Doctor Narin)', kind:'delegate', text:'Of course, go ahead.'},
    {who:'Staff (Ploy)', kind:'staff', text:'Thanks for holding, Doctor Narin. I can confirm your panel has moved to Ballroom B, starting at the same time, two o\'clock.'},
    {who:'Caller (Doctor Narin)', kind:'delegate', text:'Ballroom B, got it. Thank you.'},
    {who:'Staff (Ploy)', kind:'staff', text:'You\'re very welcome. I\'ll make sure that\'s taken care of, and I\'ll let the registration desk know as well. Is there anything else I can help you with?'},
    {who:'Caller (Doctor Narin)', kind:'delegate', text:'No, that\'s everything. Thanks so much.'},
    {who:'Staff (Ploy)', kind:'staff', text:'Thank you for calling. Have a great afternoon.'}
  ]
};
const GOOD_CALL_QUESTIONS = [
  {q:'What does Ploy say immediately after picking up the phone?', opts:['"Hello? Who is this?"','"Good afternoon, Thailand Health and Business Tourism Forum, how may I help you?"','"Please hold."'], correct:1},
  {q:'What does Doctor Narin ask about?', opts:['Lunch seating','Her session room','The keynote speaker'], correct:1},
  {q:'What does Ploy do before giving the final answer?', opts:['Guesses the room','Asks to put the caller on hold and checks the schedule','Transfers the call'], correct:1},
  {q:'What is the confirmed final answer?', opts:['Room 5, three o\'clock','Ballroom B, same time, two o\'clock','The session was cancelled'], correct:1},
  {q:'What does Ploy do right before ending the call?', opts:['Hangs up immediately','Asks if there\'s anything else, then thanks the caller','Transfers the caller again'], correct:1}
];
const POOR_CALL = {
  intro: 'The Information Desk phone rings. A different staff member answers.',
  lines: [
    {who:'Caller', kind:'delegate', text:'Hi, um, I\'m calling about the AV setup for my talk later, is someone testing it?'},
    {who:'Staff', kind:'staff', text:'Yeah, should be fine, they always test around nine.'},
    {who:'Caller', kind:'delegate', text:'Are you sure? I was told it changed today.'},
    {who:'Staff', kind:'staff', text:'I don\'t think so, I haven\'t heard anything.'},
    {who:'Caller', kind:'delegate', text:'Okay… well, could you check for me, just to be safe?'},
    {who:'Staff', kind:'staff', text:'Sure, hang on.'},
    {who:'Staff', kind:'staff', text:'Yeah it\'s nine forty-five now, not nine fifteen.'},
    {who:'Caller', kind:'delegate', text:'Oh okay, thank you. Is that confirmed?'},
    {who:'Staff', kind:'staff', text:'Should be. Anyway, is that all?'},
    {who:'Caller', kind:'delegate', text:'I guess so…'},
    {who:'Staff', kind:'staff', text:'Okay bye.'}
  ]
};

/* ===== Section 7: After Listening — Spot the Mistakes =====
   The four deliberate violations in POOR_CALL, named for students to
   match against what they just heard. */
const CALL_ANALYSIS = [
  {mistake:'No greeting', example:'"Yeah, should be fine..." with no venue name or self-introduction.', fix:'Start with "Good afternoon, [venue], how may I help you?"'},
  {mistake:'Guessing instead of checking', example:'"Should be fine, they always test around nine." / "I don\'t think so, I haven\'t heard anything."', fix:'Say "Let me check that for you" instead of answering from memory.'},
  {mistake:'Putting the caller on hold without asking', example:'"Sure, hang on." (then silence)', fix:'Ask "May I put you on hold for a moment?" and wait for a yes.'},
  {mistake:'Abrupt, rude close', example:'"Should be. Anyway, is that all?" ... "Okay bye."', fix:'Confirm the answer, ask if there\'s anything else, and thank the caller before ending the call.'}
];

/* ===== Section 6b: Complete the Master Sheet (advanced / bonus) =====
   The colleague cross-check info-gap task from the unit's earlier design.
   Kept as an advanced/bonus scenario, not the core skill of this unit —
   uses the shared RoleLock component (js/role-lock.js). Each partner
   commits to one role once; from then on only that role's half of the
   schedule is ever rendered on their device. */
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

const S6B_ROLES = {
  A: {
    label: "I'm Student A: Morning Schedule",
    heading: 'Student A, you have the morning schedule',
    instructions: "Ask Student B for the afternoon schedule and write it down. Don't share your screen. Describe your rows out loud instead.",
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
    instructions: "Ask Student A for the morning schedule and write it down. Don't share your screen. Describe your rows out loud instead.",
    rows: SHEET_B,
    phrases: [
      "I have a question about the morning schedule.",
      "What time does the [session] start?",
      "Could you repeat that, please?",
      "Got it, thank you."
    ]
  }
};

/* ===== Section 8: Delegate Information Desk Challenge =====
   Apply/Create-level speaking task: Student A plays the caller and reads
   the callerLine aloud; Student B is Information Desk staff and works
   through the 7-step call structure (DESK_CHALLENGE_STEPS), ticking each
   step as they do it. Ten cards: the original six re-framed as inbound
   calls, plus four new cards covering lost items, an unclear/garbled
   request, a transfer, and message-taking — so all three branches of the
   decision point (answer / transfer / message) get a dedicated card.
   Switch roles and go again. */
const DESK_CHALLENGE_STEPS = [
  'Answer promptly and greet the caller.',
  'Introduce yourself.',
  'Ask how you can help.',
  'Clarify exactly what the caller needs.',
  'Decide: can I answer this myself, does another department need to help, or is the person unavailable?',
  'Respond accordingly: check and confirm it yourself, or ask permission and transfer, or take a full message.',
  'Close professionally (confirm what was agreed, promise a follow-up if needed, thank the caller).'
];
const DESK_CHALLENGES = [
  {
    id:'location', tag:'Card 1', title:'Where Is the Session?',
    delegateLine:'The phone rings. Hi, I\'m calling about the digital marketing workshop, do you know which room it\'s in?',
    complication:'Your printed sheet says Room 3. The event app now shows Room 5.',
    img:'../../../assets/images/mice-unit10-phone/location.jpg',
    steps: DESK_CHALLENGE_STEPS
  },
  {
    id:'avtime', tag:'Card 2', title:'AV Setup Time Changed',
    delegateLine:'The phone rings. Is the AV team still testing? I need to plug in my laptop before my talk.',
    complication:'AV setup time moved from 9:15 to 9:45 this morning. Not every desk knows yet.',
    img:'../../../assets/images/mice-unit10-phone/avtime.jpg',
    steps: DESK_CHALLENGE_STEPS
  },
  {
    id:'lunch', tag:'Card 3', title:'Lunch Seating Update',
    delegateLine:'The phone rings. Where am I sitting for lunch? My badge doesn\'t show a table number.',
    complication:'The lunch seating map was just updated. Your printed copy is from yesterday.',
    img:'../../../assets/images/mice-unit10-phone/lunch.jpg',
    steps: DESK_CHALLENGE_STEPS
  },
  {
    id:'viparrival', tag:'Card 4', title:'VIP Arrival Time Changed',
    delegateLine:'The phone rings. You told me the VIP arrives at 3:30. Is that still true?',
    complication:'The VIP arrival time just changed to 4:00. You already told this caller 3:30.',
    img:'../../../assets/images/mice-unit10-phone/viparrival.jpg',
    steps: DESK_CHALLENGE_STEPS
  },
  {
    id:'conflicting', tag:'Card 5', title:'Two Different Answers',
    delegateLine:'The phone rings. One of your colleagues told me something different on the phone earlier. Who\'s right?',
    complication:'Two staff members gave different information. It\'s not your job to guess who\'s right.',
    img:'../../../assets/images/mice-unit10-phone/conflicting.jpg',
    steps: DESK_CHALLENGE_STEPS
  },
  {
    id:'unconfirmed', tag:'Card 6', title:'Not Confirmed Yet',
    delegateLine:'The phone rings. Has the keynote speaker\'s flight landed? Will the session start on time?',
    complication:'This information is not confirmed yet. You don\'t have a final answer right now.',
    tip:'Saying "I don\'t know yet" the right way is part of the skill. Try: "I don\'t have that confirmed yet. Here\'s what I can tell you, and I\'ll follow up by [time]."',
    img:'../../../assets/images/mice-unit10-phone/unconfirmed.jpg',
    steps: DESK_CHALLENGE_STEPS
  },
  {
    id:'lostitem', tag:'Card 7', title:'A Lost Item',
    delegateLine:'The phone rings. Hi, I think I left my conference bag at the registration desk, or maybe in Ballroom A.',
    complication:'No description yet. You\'ll need to ask clarifying questions (color, contents, last seen where) and take a callback number before promising to check.',
    img:'../../../assets/images/mice-unit10-phone/lost-conference-bag.jpg',
    steps: DESK_CHALLENGE_STEPS
  },
  {
    id:'unclear', tag:'Card 8', title:'A Bad Line',
    delegateLine:'The phone rings, and the line is bad. Hi, [garbled] room [cuts out] is it three?',
    complication:'The request is genuinely unclear over a bad connection. Don\'t guess what was said, ask the caller to repeat it.',
    img:'../../../assets/images/mice-unit10-phone/unclear-phone-call.jpg',
    steps: DESK_CHALLENGE_STEPS
  },
  {
    id:'transfer', tag:'Card 9', title:'Transfer a Call',
    delegateLine:'The phone rings. Hi, I need to speak with someone on the registration team about a badge problem.',
    complication:'This isn\'t something the Information Desk handles directly. Say who you\'ll transfer the caller to, ask permission to put them on hold, then transfer professionally.',
    tip:'Practice the transfer branch: "I\'m going to transfer you to the registration team, is that alright? May I put you on hold while I transfer you?"',
    img:'../../../assets/images/mice-unit10-phone/registration-team.jpg',
    steps: DESK_CHALLENGE_STEPS
  },
  {
    id:'takemessage', tag:'Card 10', title:'Take a Message',
    delegateLine:'The phone rings. Hi, could I speak with the events manager? It\'s about tomorrow\'s schedule.',
    complication:'The events manager is unavailable. Ask for the caller\'s name, organisation, phone number, reason for calling, and preferred follow-up time, then repeat the details back to confirm.',
    tip:'Practice the message branch: get all five details, then read them back: "So just to confirm: [name], [organisation], [number], calling about [reason], and you\'d like a call back [time]. Is that right?"',
    img:'../../../assets/images/mice-unit10-phone/taking-message.jpg',
    steps: DESK_CHALLENGE_STEPS
  }
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they greet the caller properly and give the venue name?',
  'Did they introduce themselves and ask how they could help?',
  'Did they ask a clarifying question instead of guessing?',
  'Did they choose the right response: answer, transfer, or take a message?',
  'Did they check the information, or ask permission before holding or transferring?',
  'Did they close the call politely and thank the caller?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'A caller says they left an item somewhere on the venue floor. Take the call, using the full seven-step process.'},
  {tag:'Situation B', text:'A caller\'s request is unclear over a bad connection. Take the call, ask them to repeat, and close professionally.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'After a call, staff often write down what was discussed for someone else. Write a short internal note (4 to 6 sentences) confirming a caller\'s request and what you told them, so a colleague can follow up if needed.',
  discussion: [
    {title:'Tourism Business Management', text:'A caller asked about the keynote speaker\'s delayed flight and whether the opening session would start on time. Write the note you\'d leave for the team confirming what you told them.'},
    {title:'Wellness Tourism Management', text:'A wellness guest called asking about their afternoon treatment, which was moved to a different therapist. Write the note you\'d leave so every desk gives the guest the same correct information.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Phone Vocabulary', sub:'I can use greet, hold, transfer, confirm, and message correctly.'},
  {k:'structure', lbl:'Call Structure', sub:'I can follow the seven steps of a professional call, from greeting to close.'},
  {k:'clarify', lbl:'Clarifying & Checking', sub:'I can ask a clarifying question and check information instead of guessing.'},
  {k:'decide', lbl:'Deciding & Responding Correctly', sub:'I can decide whether to answer, transfer, or take a message, and do it correctly.'},
  {k:'etiquette', lbl:'Etiquette, Tone & Closing', sub:'I can keep a clear pace, a polite tone, and close a call professionally.'}
];

/* ===================== TEACHER GUIDE (courses/mice/unit-10/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Unit 10: Answering the Phone at the Information Desk',
  learningOutcome: 'Students can handle a professional MICE information-desk phone inquiry independently: greeting the caller, introducing themselves, clarifying the request, deciding whether to answer it themselves, transfer it, or take a message, and closing the call politely — the full seven-step call structure specified in the Week 10 TQF3 syllabus (Professional Phone Communication, CLO2/CLO3).',
  bloomsLevel: 'Remember -> Understand -> Apply -> Analyze -> Evaluate -> Create',
  bloomsStages: [
    {level:'Remember', where:'Sections 2 and 6 (vocabulary and phrase bank)'},
    {level:'Understand', where:'Sections 3, 5, and 7 (call structure, reading, and the good-call model)'},
    {level:'Apply', where:'Sections 4 and 12 (controlled practice and guided pair calls)'},
    {level:'Analyze', where:'Section 8 (Spot the Mistakes, using the poor call)'},
    {level:'Evaluate', where:'Section 12 (peer checklist)'},
    {level:'Create', where:'Section 10 (realistic role-plays, including transfer and message-taking), Section 13, and the independent final call'}
  ],
  addieFocus: 'Analysis: mishandled calls create a poor first impression before a delegate ever meets a staff member in person, and real workplace calls are rarely a simple "answer it" situation. Design: the seven-step structure, including the answer/transfer/message decision, and the three TQF3-assessed phrases drive every section. Development: vocabulary, the six-tab phrase bank, and a good-call/poor-call script pair built with the shared VoiceEngine two-voice system. Implementation: a guided (Sections 1-9) -> controlled (Section 4) -> guided-pair (Section 12) -> realistic role-play (Section 10, all three branches) progression. Evaluation: the peer checklist, the self-check rubric, and the independent final call.',
  grouping: 'Core pairing happens in Section 12 (guided pair calls with a checklist) and Section 10 (realistic role-plays) — one caller, one Information Desk staff member, swap and repeat. Section 9 (Complete the Master Sheet) is now an optional/advanced bonus scenario, not the core paired activity, so its one-device-per-student RoleLock requirement only applies to pairs who choose to attempt it.',
  timing: [
    {block:'Warm-Up: Your First Call of the Day', time:'10 min', ref:'Section 1'},
    {block:'Key Vocabulary', time:'15 min', ref:'Section 2'},
    {block:'Put the Steps in Order', time:'10 min', ref:'Section 3'},
    {block:'Vocabulary by Ear (audio recall)', time:'15 min', ref:'Section 4'},
    {block:'Reading', time:'15 min', ref:'Section 5'},
    {block:'Useful Phrases', time:'15 min', ref:'Section 6'},
    {block:'Listening: Good Call, Poor Call', time:'15 min', ref:'Section 7'},
    {block:'After Listening: Spot the Mistakes', time:'10 min', ref:'Section 8'},
    {block:'Vocabulary Identification', time:'10 min', ref:'Section 11'},
    {block:'Peer Checklist: Guided Pair Calls', time:'20 min', ref:'Section 12'},
    {block:'Delegate Information Desk Challenge (10 realistic role-play cards)', time:'32 min', ref:'Section 10'},
    {block:'Writing Task', time:'10 min', ref:'Section 13'},
    {block:'Self-Check', time:'5 min', ref:'Section 14'},
    {block:'Core total: roughly 182 minutes, already a full class period', time:'', ref:''},
    {block:'(Optional/Advanced) Complete the Master Sheet', time:'+20 min', ref:'Section 9 — take-home or extension only'}
  ],
  timingNote: 'The core flow above (excluding the optional/advanced Section 9) already fills a full class period. If your class also wants to run Section 9, plan a second short session or assign it as take-home extension, don\'t compress the core seven-stage flow to fit it in. If Section 10 needs to be trimmed for time, drop Card 7 (lost item) or Card 8 (bad line) first — they reinforce clarification, which is already covered elsewhere. Keep Card 9 (transfer) and Card 10 (take a message): they are what makes the lesson genuinely workplace-like, since not every real call should end with the Information Desk staff member answering the question themselves.',
  materials: [
    'Speakers or headphones for the listening sections',
    'One device per student only for the optional/advanced Section 9 (the info-gap requires it, a shared screen defeats the lock)'
  ],
  decisionTree: [
    'Can I answer this myself?',
    '  Yes -> check/confirm -> answer -> close',
    '  Another department can help -> ask permission -> hold/transfer -> close',
    '  No answer / person unavailable -> take message -> confirm details -> promise follow-up -> close'
  ],
  teacherPrompts: [
    'What\'s the first thing you should say when you pick up the phone, and why does it matter before you even know what the caller wants?',
    'Are you actually asking a clarifying question, or just guessing at what the caller means?',
    'How do you decide whether to answer, transfer, or take a message? What tells you which one is right?',
    'If you didn\'t have the answer yet, what did you say instead of guessing?'
  ],
  commonProblems: [
    {problem:'A student skips the greeting entirely.', fix:'Point back to Section 3 (Put the Steps in Order) and the good-call model in Section 7. Step 1 is not optional, even on a busy day.'},
    {problem:'A student guesses instead of checking, or holds/transfers without asking permission first.', fix:'Reference Section 8\'s Spot the Mistakes: "May I put you on hold" and "is that alright?" are correct professional habits, not signs of not knowing the answer.'},
    {problem:'A student rushes the close.', fix:'Model "I\'ll make sure that\'s taken care of," graded by peer-checklist item 6 (close politely and thank the caller).'},
    {problem:'A student tries to answer every call themselves instead of transferring or taking a message when that\'s the right call.', fix:'Use Cards 9 and 10 in Section 10 explicitly, and ask the class: "What tells you this call isn\'t yours to answer?"'}
  ],
  fastClassExtension: 'Swap partners and run one additional Section 10 card, or attempt the optional/advanced Section 9 cross-check info-gap.',
  slowClassCompression: 'Section 11 (vocabulary ID) and Section 8 (Spot the Mistakes) can be assigned as homework. Section 9 is already excluded from the core time budget.',
  assessment: 'The summative check is a short, live, teacher-observed phone call performed by each student. The website does not and cannot auto-grade a real spoken call. The site\'s role is rehearsal, Section 10\'s realistic role-plays (all three branches: answer, transfer, message) are the closest in-app practice for this. Grade the live call against the same criteria as Section 14\'s self-check rubric and Section 12\'s peer checklist: greeting, structure, clarifying, deciding/responding correctly, and etiquette/closing.'
};

/* ===================== ASSETS ===================== */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/mice-unit10-phone/hero-information-desk-phone.jpg', alt:'A staff member answering the phone at a MICE event Information Desk' },
  goodCall: { src:'../../../assets/images/mice-unit10-phone/answering-greeting.jpg', alt:'A staff member greeting a caller warmly while answering the phone' },
  masterSheet: { src:'../../../assets/images/mice-unit10-phone/checking-schedule.jpg', alt:'A staff member checking and confirming a schedule with a colleague' }
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 10: Answering the Phone at the Information Desk',
  unitCode: 'unit-10'
};
