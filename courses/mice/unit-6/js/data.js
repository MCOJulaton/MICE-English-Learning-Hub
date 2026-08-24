/* ===================== UNIT 6 CONTENT DATA — SCHEDULES & TIME =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   role-play, rubric. Nothing here is UI logic — see app.js for rendering/state/
   voice/progress-tracking. Sourced from the official workbook
   (Workbooks/Workbook Final/Units-4-6.pdf, pages 24-37) — no invented content. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Your First Day on the Event Team'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'What Would You Do?'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: A Speaker Is Running Late'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Update the Schedule'},
  {key:'s8', label:'Speaking Practice'},
  {key:'crossword', label:'Vocabulary Crossword'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check & Take Home'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Your First Day on the Event Team =====
   Opens with a concrete situation instead of a general "welcome to the
   unit" framing, so students are thinking like event staff from the first
   screen. The options are intentionally not single-correct: several are
   reasonable, one is an overreaction, which is itself the teaching point. */
const OPENING_SCENARIO = {
  facts: [
    'You are working at a large business conference.',
    'There are 800 delegates.',
    'The keynote speech starts at 9:00 a.m.',
    'It is now 8:45 a.m.'
  ],
  message: 'The keynote speaker is running late.',
  question: 'What should the event team do?',
  options: [
    {text:'Inform the delegates.', good:true, note:'Good instinct. Delegates should hear about a change as soon as the team knows.'},
    {text:'Change the schedule.', good:true, note:'Yes. A short, clear adjustment keeps the rest of the day on track.'},
    {text:'Ask everyone to wait.', good:true, note:'Fine for a few minutes, but delegates still need to be told what is happening.'},
    {text:'Start another activity.', good:true, note:'A strong option. Networking or a short activity fills the gap well.'},
    {text:'Cancel the keynote.', good:false, note:'Too extreme for a short delay. Cancellation is for real emergencies, not late arrivals.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'9:00 a.m.', session:'Opening Keynote', location:'Ballroom A'},
  {time:'10:15 a.m.', session:'Networking Coffee Break', location:'Main Lobby'},
  {time:'10:45 a.m.', session:'Breakout: Wellness Travel Trends', location:'Room C'},
  {time:'12:30 p.m.', session:'Lunch', location:'Delegate Dining, 2nd Floor'},
  {time:'2:00 p.m.', session:'Panel Discussion', location:'Ballroom A'}
];
const WARMUP_SCRIPT = "Good morning! Let me read out today's schedule. At 9 a.m., the Opening Keynote begins in Ballroom A. At 10:15, we'll have a networking coffee break in the Main Lobby. At 10:45, the breakout session on wellness travel trends starts in Room C. Lunch is at 12:30 in Delegate Dining, on the second floor. Finally, the panel discussion begins at 2 p.m., back in Ballroom A.";

/* ===== Section 2: Key Vocabulary =====
   Reduced from 15 to 10 core, active words: the ones students actually need
   for the speaking and listening tasks in this unit. Each gets a short,
   real MICE example instead of a dictionary-style sentence, so students see
   the word working in an event situation, not just defined. The other 5
   useful-but-secondary terms moved to VOCAB_SECONDARY below: still present
   in the unit, just not treated as must-memorize. */
const VOCAB = [
  {id:'schedule', ic:'📅', nm:'Schedule', type:'n.', def:'A plan showing when events or sessions happen.', ex:'Check the event schedule before you start your shift.'},
  {id:'ontime', ic:'✅', nm:'On Time', type:'adj. phr.', def:'Starting or arriving at the planned time, not early or late.', ex:'The morning session started on time.'},
  {id:'delayed', ic:'⏳', nm:'Delayed', type:'adj.', def:'Happening later than planned.', ex:'The keynote speaker is delayed.'},
  {id:'postponed', ic:'📆', nm:'Postponed', type:'adj.', def:'Moved to a later date. It will still happen.', ex:'The workshop is postponed until 2:00 p.m.'},
  {id:'canceled', ic:'❌', nm:'Canceled', type:'adj.', def:'Stopped completely. It will not happen at all.', ex:'The evening banquet has been canceled.'},
  {id:'session', ic:'🗂️', nm:'Session', type:'n.', def:'A period of time for one talk, activity, or meeting.', ex:'The morning session is running over time.'},
  {id:'runsheet', ic:'📋', nm:'Run Sheet', type:'n.', def:'A minute-by-minute plan used by event staff on the day.', ex:'The event team checks the run sheet.'},
  {id:'timeslot', ic:'⏱️', nm:'Time Slot', type:'n.', def:'The period of time given to one speaker or session.', ex:'Each speaker has a 30-minute time slot.'},
  {id:'overrun', ic:'⏰', nm:'Overrun', type:'v.', def:'To continue past the planned finishing time.', ex:'The keynote has overrun by ten minutes.'},
  {id:'update', ic:'🔄', nm:'Update', type:'v.', def:'To give the newest, correct information.', ex:'Can you update the run sheet?'}
];
const VOCAB_SECONDARY = [
  {id:'timetable', nm:'Timetable', def:'A detailed list of times, often used for transport or repeating events.'},
  {id:'punctual', nm:'Punctual', def:'Arriving or starting at the agreed time. Not late.'},
  {id:'announcement', nm:'Announcement', def:'A spoken or written message giving important information to a group.'},
  {id:'duration', nm:'Duration', def:'The total length of time something lasts.'},
  {id:'interval', nm:'Interval', def:'A short break between two parts of an event.'}
];

/* ===== Section 2b: What Would You Do? (event decision challenge) =====
   A heavier, slower version of the opening scenario: now students choose
   an option AND explain their choice, with sentence starters to help. */
const EVENT_CHALLENGE = {
  facts: [
    'The keynote speaker is 30 minutes late.',
    'The next session starts at 10:00.',
    'There are 800 delegates waiting.'
  ],
  question: 'What should the event team do? Choose the best option, then explain why.',
  options: [
    {text:'Tell the delegates about the delay right away.'},
    {text:'Change the schedule and move the next session later.'},
    {text:'Start a short networking activity while they wait.'},
    {text:'Say nothing and hope the speaker arrives soon.'}
  ],
  weakIndex: 3,
  support: ["I think we should…", "We can…", "Let's…", "The keynote is delayed.", "We need to change the schedule.", "We should tell the delegates."]
};

/* ===== Section 3: Vocabulary Activities ===== */
/* Activity 1 — Matching (word <-> meaning), reuses the same click-to-match
   component as Communication Unit 6's Restaurant Vocabulary (match-cols/match-item). */
const MATCH_PAIRS = [
  {id:'runsheet', word:'Run Sheet', meaning:'A minute-by-minute plan used by event staff on the day'},
  {id:'overrun', word:'Overrun', meaning:'To continue beyond the planned finishing time'},
  {id:'postponed', word:'Postponed', meaning:'Moved to a later date, but it will still happen'},
  {id:'interval', word:'Interval', meaning:'A planned pause or break between parts of an event'},
  {id:'punctual', word:'Punctual', meaning:'Arriving or starting at the agreed time; not late'},
  {id:'timeslot', word:'Time Slot', meaning:'A specific period allocated to one speaker or activity'},
  {id:'delayed', word:'Delayed', meaning:'Happening later than planned due to a problem'},
  {id:'duration', word:'Duration', meaning:'The total length of time a session or event lasts'}
];

/* Activity 2: fill in the blank, adapted from the workbook. */
const FILL_BLANK = [
  {q:'Please check the event __________ in your brochure. It lists all sessions with start and end times.', a:'schedule'},
  {q:"The opening keynote was __________ by 20 minutes because the speaker's flight was late.", a:'delayed'},
  {q:'Due to the storm, the outdoor evening event has been __________ and will not take place tonight.', a:'canceled'},
  {q:'The afternoon breakout __________ on wellness travel trends starts at 2:30 p.m. in Room C.', a:'session'},
  {q:'Every event team member received a copy of the __________ with their role highlighted for the day.', a:'run sheet'},
  {q:'The MC made an __________ asking all delegates to take their seats for the opening ceremony.', a:'announcement'},
  {q:"The morning session started exactly __________. This shows the team's excellent preparation.", a:'on time'},
  {q:'There will be a 20-minute __________ between the panel discussion and the afternoon workshop.', a:'interval'}
];

/* Activity 3 — Discussion situations, model-answer reveal (same pattern as
   Unit 4/5's L4_PROMPTS "Show model answer" activities). */
const VOCAB_SITUATIONS = [
  {q:'A delegate asks: "What time does the morning session finish?" You don\'t have the schedule.', model:'"I\'m not certain, but let me check that for you right now."'},
  {q:'The keynote speaker has overrun by 15 minutes. The next speaker is waiting. What do you say?', model:'"We will take a brief five-minute pause before our next speaker."'},
  {q:'A delegate arrives at 10:15 a.m. and is upset because they missed the 9:00 a.m. opening. How do you respond?', model:'"I completely understand your frustration. Let me help you catch up. Here\'s a quick summary of what you missed."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Time Management and Schedule Communication in MICE Events',
  paragraphs: [
    'A well-run MICE event looks effortless to the delegates attending it: sessions start on time, breaks happen when expected, and every transition feels smooth. But behind the scenes, managing time at a large-scale event requires a highly detailed plan, a dedicated team, and sharp communication skills.',
    'The run sheet is the backbone of every MICE event. It lists every activity, every speaker, every break, and every behind-the-scenes task with exact start and end times, often planned to the minute. A typical run sheet for a full-day conference might list 30 to 50 individual action items, each assigned to a specific team member. Event professionals treat the run sheet as their most important document on event day.',
    'Despite the best planning, schedules change. A speaker overruns their time slot, technical equipment fails, or a VIP guest arrives late. In these moments, the event team must communicate quickly and professionally. The MC plays a key role using language such as "We will take a brief five-minute pause before our next speaker" or "Due to a slight adjustment, today\'s workshop will now begin at 2:45 rather than 2:30." Calm, confident language prevents delegates from feeling frustrated.',
    'For front-line staff, the ability to answer schedule questions accurately is essential. Always carry a copy of the event program. If a delegate asks about timing, give a specific, confident answer. If you are unsure, say "Let me check that for you right now" rather than guessing. Giving incorrect timing information can significantly damage the guest experience.',
    'For Wellness Tourism professionals, time management also applies to treatment schedules and activity rosters. When a guest\'s massage appointment overruns and they miss a group yoga session, it is the coordinator\'s role to manage, adjust, and communicate, always calmly and always with the guest\'s experience at the center.'
  ]
};
const READING_QUESTIONS = [
  {q:'What is a "run sheet" and why is it important?', opts:['A guest feedback form','A minute-by-minute plan listing every activity, speaker, and task, the most important document on event day','A list of delegate names'], correct:1},
  {q:'What should you say if a delegate asks about timing and you are not sure of the answer?', opts:['Guess a reasonable time','"Let me check that for you right now"','Say nothing and walk away'], correct:1},
  {q:'According to the article, what should you always carry on event day?', opts:['A copy of the event program','A printed guest list','A spare microphone'], correct:0},
  {q:'How does time management apply differently in a wellness tourism setting?', opts:['It doesn\'t apply at all','It only applies to VIP guests','It applies to treatment schedules and activity rosters, managed calmly around the guest\'s experience'], correct:2}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  asking:{title:'Asking About Time', items:[
    'What time does the… start / finish?',
    'When is the next session?',
    'Is the schedule running on time today?',
    'How long is the lunch break?',
    'What time should we be back in our seats?'
  ]},
  delay:{title:'Communicating a Delay', items:[
    'The… has been delayed by approximately [X] minutes.',
    'We apologize for the short delay. We will begin shortly.',
    'Due to [reason], the schedule has been adjusted slightly.',
    'The [session] will now begin at [new time].',
    'We appreciate your patience.'
  ]},
  disrupt:{title:'Handling Disruptions', items:[
    'I completely understand your frustration.',
    'Let me check the updated schedule for you.',
    'We are doing everything we can to get back on track.',
    'The [session / speaker] should be with us in about [X] minutes.',
    'In the meantime, please help yourself to refreshments.'
  ]}
};

/* ===== Section 6: Listening Script — "A Speaker Is Running Late" =====
   Four characters. VoiceEngine only ships two voice slots (staff/delegate),
   so voices are assigned by role type rather than adding a third slot:
   Fah and Win (event operations) use 'staff'; Krit and Ploy use 'delegate'.
   This keeps the shared VoiceEngine untouched for every other unit. */
const BEFORE_LISTEN = {
  setup: 'The keynote speaker is late. Listen and find out what the event team decides to do.',
  guesses: [
    'They cancel the keynote.',
    'They change the schedule and make an announcement.',
    'They ask the delegates to leave.',
    'They do nothing and wait.'
  ]
};
const LISTEN = {
  intro: 'Backstage. 8:45 a.m. The opening keynote is scheduled for 9:00 a.m. Event Manager Fah gets an urgent call.',
  lines: [
    {who:'Fah', text:"Okay… her flight was diverted, and now she's stuck in traffic. New arrival estimate, 9:40 at the earliest. Right, I'll handle it.", kind:'staff'},
    {who:'Fah', text:'Everyone, quick team meeting. Two minutes.', kind:'staff'},
    {who:'Krit', text:'What do you want me to say?', kind:'krit'},
    {who:'Fah', text:"Go out and make the announcement, calm and professional. Don't say she's stuck in traffic. Say there's been a brief travel delay. Tell them the keynote starts at 9:45. Apologize, and thank them for waiting.", kind:'staff'},
    {who:'Krit', text:'Should I tell them what to do in the meantime?', kind:'krit'},
    {who:'Fah', text:"Yes, send them to the lobby for coffee and networking. Keep it positive. It's a bonus break, not a problem.", kind:'staff'},
    {who:'Ploy', text:'Should I keep the coffee service running longer?', kind:'ploy'},
    {who:'Fah', text:'Yes please. Coffee and tea until 9:30, and refresh the pastries.', kind:'staff'},
    {who:'Win', text:'What about the rest of the day? If the keynote moves to 10:30, everything shifts.', kind:'win'},
    {who:'Fah', text:"I've already updated the run sheet. Morning breakouts move from 11:00 to 11:20. Lunch stays at 12:30. We'll trim the panel Q&A to 15 minutes to make up the time. I'll brief that speaker myself.", kind:'staff'},
    {who:'Win', text:'And if delegates ask us directly?', kind:'win'},
    {who:'Fah', text:'Point them to the updated schedule on the event app. Only give confirmed times. Never guess.', kind:'staff'},
    {who:'Krit', text:"Okay, I'm heading out.", kind:'krit'},
    {who:'Fah', text:"Smooth, professional, positive. That's it. Go.", kind:'staff'},
    {who:'Krit', text:"Good morning, everyone, and welcome to the Thailand Health and Business Tourism Forum. I'm Krit, your MC for the next three days. Just a quick update: due to a brief travel delay, Dr. Lawson's keynote will now begin at 9:45. We're sorry for the short wait, and we really appreciate your patience. In the meantime, please help yourself to refreshments in the lobby, just through the doors on your left, and take a few minutes to connect with the people around you. We'll call you back in at 9:40. Thank you so much.", kind:'krit'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'Why is the opening session delayed?', opts:['The venue double-booked the room','The keynote speaker\'s flight was diverted and she is stuck in traffic','The equipment failed'], correct:1},
  {q:'What does the event manager ask the MC to announce to delegates?', opts:['That the whole day is canceled','That there has been a brief travel delay and the keynote begins at 9:45','That the speaker is stuck in traffic'], correct:1},
  {q:'What is the adjusted start time for the keynote session?', opts:['9:15', '9:45', '10:30'], correct:1},
  {q:'What does the event manager suggest the catering team do while delegates wait?', opts:['Stop coffee service to save cost','Keep coffee and tea available and refresh the pastries','Serve a full lunch early'], correct:1},
  {q:'How does the MC phrase the announcement to avoid upsetting delegates?', opts:['"The speaker is running very late, sorry."', '"Due to a short travel delay… we sincerely apologize… please help yourself to refreshments."', 'The MC doesn\'t explain anything'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Using a professional euphemism instead of a blunt phrase', example:'"a brief travel delay" instead of "stuck in traffic"'},
  {strategy:'Keeping the tone positive during a problem', example:'"it\'s a bonus break, not a problem"'},
  {strategy:'Giving delegates something to do while they wait', example:'"please help yourself to refreshments… connect with the people around you"'},
  {strategy:'Communicating a new time clearly', example:'"will now begin at 9:45"'},
  {strategy:'Thanking the audience for their patience', example:'"we really appreciate your patience… thank you so much"'}
];

/* ===== Section 6b: Update the Schedule =====
   A short, practical task that sits between the listening and the speaking
   role-play: students take the ORIGINAL_SCHEDULE, apply SCHEDULE_PROBLEM,
   and work out the new times themselves before checking the model answer. */
const ORIGINAL_SCHEDULE = [
  {time:'9:00', session:'Keynote Speech'},
  {time:'10:00', session:'Business Workshop'},
  {time:'11:00', session:'Coffee Break'}
];
const SCHEDULE_PROBLEM = 'The keynote speaker will now arrive at 9:30.';
const UPDATED_SCHEDULE = [
  {time:'9:30', session:'Keynote Speech', status:'DELAYED'},
  {time:'10:30', session:'Business Workshop', status:'MOVED'},
  {time:'11:30', session:'Coffee Break', status:'MOVED'}
];

/* ===== Section 8: Speaking Practice — Role-Play ===== */
const ROLEPLAY_CARDS = {
  manager:{title:'Role Card A: Event Manager', body:'You are the event manager. A delay has just occurred.',
    role:'Brief your MC on what happened, what to announce, and how to keep delegates calm. Agree on the new time together.',
    phrases:['We have a situation: the [speaker / session] has…', 'I need you to announce that…', 'The new start time will be…', 'Please keep the tone calm and positive.', 'Suggest delegates use the time to…']},
  mc:{title:'Role Card B: MC', body:'You are the MC. You are about to face 600 delegates.',
    role:'Listen to the event manager\'s briefing, ask one clarifying question, then make the announcement to the class as your audience.',
    phrases:['Good morning, everyone…', 'I have a brief update for you today…', 'Due to a short [delay / adjustment]…', 'We sincerely apologize for the inconvenience.', 'In the meantime, please feel free to…', 'We will be back on track by…']}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'The catering team informs you that lunch will be 25 minutes late. Announce this professionally to 500 delegates currently in sessions.'},
  {tag:'Scenario 2', text:'A wellness workshop presenter has just canceled due to illness. Communicate this to 30 delegates who specifically registered for that session and offer an alternative.'},
  {tag:'Scenario 3', text:'An important delegate missed their afternoon session because a staff member gave them the wrong time. Handle the situation professionally.'}
];

/* ===== Vocabulary Crossword (optional, light review) =====
   Two linked clusters on one grid, hand-placed and checked for letter
   conflicts (see below): SCHEDULE/SESSION/CANCELED/DELAYED/UPDATE share a
   row, and INTERVAL/POSTPONED/OVERRUN form a second small group. row/col
   are 0-indexed grid coordinates; dir is 'A' (across) or 'D' (down). */
const CROSSWORD_WORDS = [
  {word:'SCHEDULE', clue:'A plan that shows when events happen.', row:0, col:0, dir:'A'},
  {word:'SESSION', clue:'A period of time for one activity or talk.', row:0, col:0, dir:'D'},
  {word:'CANCELED', clue:'Stopped completely. It will not happen.', row:0, col:1, dir:'D'},
  {word:'DELAYED', clue:'Happening later than planned.', row:0, col:4, dir:'D'},
  {word:'UPDATE', clue:'To give the newest, correct information.', row:0, col:5, dir:'D'},
  {word:'INTERVAL', clue:'A short break between two parts of an event.', row:9, col:3, dir:'D'},
  {word:'POSTPONED', clue:'Moved to a later date, but it will still happen.', row:11, col:0, dir:'A'},
  {word:'OVERRUN', clue:'To continue past the planned finish time.', row:14, col:2, dir:'A'}
];

/* ===== Practice: Peer Checklist + bonus announcement ===== */
const PEER_CHECKLIST = [
  'Did they stay calm and professional throughout?',
  'Did they explain the delay clearly without blaming anyone?',
  'Did they communicate the new time clearly and confidently?',
  'Did they suggest something useful for delegates to do in the meantime?',
  'Did they thank delegates for their patience?',
  'Did they use language from the Useful Phrases section?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'The afternoon keynote has been moved from Ballroom A to Conference Room 3 on the second floor due to a technical issue.'},
  {tag:'Situation B', text:'The morning wellness workshop has been canceled due to the presenter\'s illness. Delegates may join the networking session in the lobby instead.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Write a short written announcement (4–6 sentences) to delegates about a schedule change. Choose ONE: (a) lunch delayed 20 minutes, (b) afternoon session moved to a different room, (c) evening banquet postponed to the following evening.',
  discussion: [
    {title:'Tourism Business Management', text:'You are managing a corporate conference when three back-to-back delays hit: the morning speaker overruns, catering is late, and a breakout room becomes unavailable. How do you prioritize and communicate? What do you say first, and to whom?'},
    {title:'Wellness Tourism Management', text:'A group of international wellness retreat guests has arrived expecting a full-day schedule of spa treatments and workshops. Due to staff illness, two treatments must be postponed. How do you communicate this in a way that maintains the calm, healing atmosphere of the retreat?'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC, same pattern as Unit 4/5) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Schedule & Time Vocabulary', sub:'I can use schedule and time vocabulary correctly in written and spoken English.'},
  {k:'delay', lbl:'Communicating a Delay', sub:'I can communicate a schedule delay or change professionally and calmly.'},
  {k:'unsure', lbl:'Handling Uncertainty', sub:'I know how to respond when a delegate asks about timing and I am not sure of the answer.'},
  {k:'writing', lbl:'Writing an Update', sub:'I can write a short, professional schedule update announcement.'},
  {k:'quiz', lbl:'Quiz Readiness', sub:'I feel prepared for the Mini Quiz on schedule and time vocabulary.'}
];

/* ===================== ASSETS ===================== */
const STUDY_GUIDE_DATA_URI = "../../../assets/study-guide/Unit6-MICE-Schedules-Time-Study-Guide.jpg";
const STUDY_GUIDE_FILENAME = "Unit6-MICE-Schedules-Time-Study-Guide.jpg";

const SECTION_PHOTOS = {
  hero:      { src:'../../../assets/images/mice-u6-hero.jpg',      alt:'Event team reviewing a run sheet together on clipboards at a MICE venue' },
  briefing:  { src:'../../../assets/images/mice-u6-briefing.jpg',  alt:'Two event staff with headsets coordinating backstage during a live event' },
  mc:        { src:'../../../assets/images/mice-u6-mc.jpg',        alt:'An MC speaking confidently on stage with a microphone at a MICE event' },
  staff:     { src:'../../../assets/images/mice-u6-staff.jpg',     alt:'A smiling MICE staff member holding a clipboard, wearing a name badge' }
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 6: Schedules & Time',
  unitCode: 'unit-6'
};
