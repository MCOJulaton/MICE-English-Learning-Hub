/* ===================== UNIT 11 CONTENT DATA — THE DOUBLE-BOOKED ROOM =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   evidence cards, rubric. Nothing here is UI logic — see app.js for rendering/
   state/voice/progress-tracking.

   Bloom's level: ANALYZE. Students work in GROUPS of 3, each reading a different
   piece of evidence (a jigsaw reading task, not another listening or speaking
   drill), and must combine what they each found to identify the root cause of a
   scheduling problem and propose a fix. This is the unit's distinct mechanic, a
   genuine step toward analysis over Units 9-10's apply-level tasks, per the
   instructor's explicit request to vary group size and skill emphasis across
   Units 9-15. Invented content, part of the Units 9-15 OBE/Bloom's expansion,
   not drawn from the official workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Two Groups, One Room'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Find the Mistake'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: The Investigation'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Solve the Mystery'},
  {key:'s8', label:'Speaking Practice'},
  {key:'crossword', label:'Spot the Error'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Two Groups, One Room ===== */
const OPENING_SCENARIO = {
  facts: [
    'Two workshop groups both arrive at Room 3 at the same time.',
    'Both groups have a confirmation email for that room.',
    'The workshops start in 5 minutes.'
  ],
  message: 'Both groups are standing outside Room 3, confused and a little frustrated.',
  question: 'What should you do first?',
  options: [
    {text:'Check the master booking log immediately.', good:true, note:'Good instinct. The log is the one source that can explain what actually happened.'},
    {text:'Ask both groups to wait calmly while you investigate.', good:true, note:'Yes. Buying a moment to investigate calmly is better than reacting immediately.'},
    {text:'Let the two groups decide between themselves.', good:false, note:"This isn't the groups' problem to solve, and it can get tense fast. Staff should investigate and decide."},
    {text:'Cancel both workshops.', good:false, note:'An extreme reaction to a solvable problem. Investigate first.'},
    {text:'Apologize and find each group an alternative room.', good:true, note:'A reasonable immediate fix, as long as you still investigate the cause afterward.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'8:00', point:'Booking log finalized', where:'Confirmed by the Events Office'},
  {time:'9:00', point:'First workshops begin', where:'Rooms 1 through 4'},
  {time:'12:00', point:'Room turnover for the afternoon', where:'Cleaning team resets rooms'},
  {time:'1:00 p.m.', point:'Afternoon sessions begin', where:'Rooms 1 through 4'},
  {time:'5:00 p.m.', point:'Booking log archived', where:'Saved for the next event'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's booking desk briefing. At 8 a.m., the booking log is finalized, confirmed by the Events Office. At 9 a.m., the first workshops begin in Rooms 1 through 4. At noon, there's a room turnover for the afternoon, the cleaning team resets each room. At 1 p.m., afternoon sessions begin, again in Rooms 1 through 4. And at 5 p.m., today's booking log is archived and saved for the next event.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'rootcause', ic:'🌱', nm:'Root Cause', type:'n. phr.', def:'The real, original reason a problem happened, not just its symptoms.', ex:"Don't just fix the symptom, find the root cause."},
  {id:'evidence', ic:'🔎', nm:'Evidence', type:'n.', def:'Facts or information that help you understand what really happened.', ex:'Look at the evidence before you decide.'},
  {id:'conflict', ic:'⚔️', nm:'Conflict', type:'n.', def:'A situation where two things cannot both happen, like a double booking.', ex:'There\'s a scheduling conflict between two sessions.'},
  {id:'overlap', ic:'🔀', nm:'Overlap', type:'v./n.', def:'When two things happen at the same time or place.', ex:'The two bookings overlap by thirty minutes.'},
  {id:'responsible', ic:'🧾', nm:'Responsible', type:'adj.', def:'Having the duty for making sure something is handled correctly.', ex:'Find out who is responsible for the room booking.'},
  {id:'investigate', ic:'🕵️', nm:'Investigate', type:'v.', def:'To find out the facts about a problem carefully.', ex:'The team investigated why the room was double-booked.'},
  {id:'pattern', ic:'🔁', nm:'Pattern', type:'n.', def:'Something that happens in a similar way more than once.', ex:'Is this a one-time mistake, or a pattern?'},
  {id:'prevent', ic:'🛡️', nm:'Prevent', type:'v.', def:'To stop something from happening in the future.', ex:'What can we do to prevent this next time?'},
  {id:'log', ic:'📒', nm:'Log', type:'n.', def:'A written record of events, kept in order.', ex:'Check the booking log for that date.'},
  {id:'assumption', ic:'💭', nm:'Assumption', type:'n.', def:'Something you believe is true without checking it.', ex:"Don't make an assumption, verify it first."}
];
const VOCAB_SECONDARY = [
  {id:'duplicate', nm:'Duplicate', def:'An exact copy of something that should only exist once.'},
  {id:'errormsg', nm:'System Error', def:'A mistake made by a computer program, not by a person.'},
  {id:'confirm2', nm:'Confirmation', def:'A message that proves a booking or request was accepted.'},
  {id:'reference', nm:'Reference Number', def:'A unique code used to identify one specific booking or record.'},
  {id:'timestamp', nm:'Timestamp', def:'The exact date and time something was recorded.'}
];

/* ===== Section 2b: Find the Mistake (Analyze-level error-spotting) =====
   Same objective as before (recognize a flawed conclusion about the Room 3
   conflict), different mechanic — spot the one wrong line in a colleague's
   draft summary instead of picking one "best" multiple-choice option. */
const DRAFT_SUMMARY = [
  {text:'Room 3 was booked by the Sales Team and the Operations Team, both for 9:00 a.m.', wrong:false},
  {text:'The Sales Team made a mistake by submitting their booking twice.', wrong:true, why:'Actually, neither team made a mistake. A system error processed one submission twice.'},
  {text:'Both bookings were confirmed by the system, each with a different reference number.', wrong:false},
  {text:'IT will check for duplicate submissions to help prevent this in the future.', wrong:false}
];

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'rootcause', word:'Root Cause', meaning:'The real, original reason a problem happened, not just its symptoms'},
  {id:'evidence', word:'Evidence', meaning:'Facts or information that help you understand what really happened'},
  {id:'conflict', word:'Conflict', meaning:'A situation where two things cannot both happen, like a double booking'},
  {id:'overlap', word:'Overlap', meaning:'When two things happen at the same time or place'},
  {id:'investigate', word:'Investigate', meaning:'To find out the facts about a problem carefully'},
  {id:'pattern', word:'Pattern', meaning:'Something that happens in a similar way more than once'},
  {id:'prevent', word:'Prevent', meaning:'To stop something from happening in the future'},
  {id:'assumption', word:'Assumption', meaning:'Something you believe is true without checking it'}
];

const FILL_BLANK = [
  {q:"Don't just fix the symptom, find the __________.", a:'root cause'},
  {q:'Look at the __________ before you decide.', a:'evidence'},
  {q:"There's a scheduling __________ between two sessions.", a:'conflict'},
  {q:'The two bookings __________ by thirty minutes.', a:'overlap'},
  {q:'The team __________ why the room was double-booked.', a:'investigated'},
  {q:'Is this a one-time mistake, or a __________?', a:'pattern'},
  {q:'What can we do to __________ this next time?', a:'prevent'},
  {q:"Don't make an __________, verify it first.", a:'assumption'}
];

const VOCAB_SITUATIONS = [
  {q:'Two groups both have a confirmation for the same room. What is the first thing you should say to your team?', model:'"Let\'s not make an assumption. Let\'s check the log and investigate before we decide anything."'},
  {q:'You found the reason the problem happened. How do you explain it to your manager?', model:'"We investigated, and the root cause was actually a system error, not a staff mistake."'},
  {q:'Your manager asks how to stop this from happening again. What do you say?', model:'"To prevent this next time, I recommend the system checks for duplicate bookings automatically."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Solving Problems at MICE Events: Finding the Root Cause',
  paragraphs: [
    'When something goes wrong at a MICE event, like two groups arriving for the same room, the easy reaction is to fix the visible problem and move on. But experienced event professionals know that fixing the symptom without finding the root cause means the same problem will likely happen again.',
    'Finding a root cause means gathering evidence from more than one source and looking for what actually connects them. A booking log, a confirmation email, and a system record might each tell only part of the story. Only by comparing all three together does the real explanation usually appear.',
    'It is also important not to jump to an assumption. It would be easy to assume one of the two teams made a mistake, but the evidence might show something completely different, like a technical error in the booking system itself. Blaming the wrong cause wastes time and can unfairly blame the wrong person.',
    'Once the root cause is clear, the final and most valuable step is prevention. A good event team doesn\'t just resolve today\'s conflict, they ask: is this a pattern, and what change would prevent it from happening at the next event too?',
    'For Wellness Tourism events, this same thinking applies to treatment bookings: a guest arriving for a massage that was double-booked deserves the same careful investigation, not just an apology and a quick fix.'
  ]
};
const READING_QUESTIONS = [
  {q:'Why is fixing only the visible problem not enough, according to the article?', opts:['It takes too long','The same problem will likely happen again if the root cause isn\'t found','It costs more money'], correct:1},
  {q:'What does finding a root cause usually require?', opts:['Guessing quickly','Comparing evidence from more than one source','Blaming one team immediately'], correct:1},
  {q:'What is the risk of making an assumption too early?', opts:['Nothing, assumptions save time','You might unfairly blame the wrong cause or person','It always saves money'], correct:1},
  {q:'What is described as the most valuable final step?', opts:['Apologizing to the groups involved','Asking whether this is a pattern and preventing it next time','Closing the investigation immediately'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  investigating:{title:'Investigating a Problem', items:[
    "Let's check the log.",
    'What does the evidence show?',
    'Is this the first time this happened?',
    "Let's not assume, let's verify."
  ]},
  discussing:{title:'Discussing With Your Group', items:[
    'I think the problem is…',
    'Look at this, it shows…',
    'That matches what I found too.',
    'So the root cause seems to be…'
  ]},
  deciding:{title:'Deciding on a Fix', items:[
    'I recommend we…',
    'To prevent this next time, we should…',
    'Who should be responsible for this?',
    "Let's confirm this with the event manager."
  ]}
};

/* ===== Section 6: Listening Script — "The Investigation" =====
   Three characters: Nid (Events Office coordinator) and Aran (duty
   manager) investigate the double-booking over the phone, and IT Support
   briefly joins the call near the end — a 3-voice exchange matching this
   unit's 3-way jigsaw evidence in s6b. */
const BEFORE_LISTEN = {
  setup: 'Nid calls Aran to investigate the double-booking. Listen and find out what they discover.',
  guesses: [
    'One of the two teams made a careless mistake.',
    'A technical error in the booking system created two bookings.',
    'There was never actually a conflict at all.',
    'The room was booked correctly and someone lied.'
  ]
};
const LISTEN = {
  intro: 'The Events Office. Coordinator Nid calls duty manager Aran to figure out what happened with Room 3.',
  lines: [
    {who:'Nid', text:'Hi Aran, it\'s Nid. I\'m looking into the Room 3 situation. I want to investigate before we assume anyone made a mistake.', kind:'staff'},
    {who:'Aran', text:'Good idea. What does the log show?', kind:'delegate'},
    {who:'Nid', text:'The log shows two confirmed bookings for Room 3 at 9 a.m., one for the Sales Team, one for the Operations Team. Both show as confirmed.', kind:'staff'},
    {who:'Aran', text:'That\'s strange. Do we have the confirmation emails?', kind:'delegate'},
    {who:'Nid', text:'Yes, the Sales Team\'s email has reference number RM3-0472, sent Monday at 2:15 p.m.', kind:'staff'},
    {who:'Aran', text:'Let me check the system record for that exact time… okay, I found it. There was a system error at 2:15 p.m. on Monday. One form submission was processed twice by mistake, creating two different reference numbers, RM3-0472 and RM3-0473, for the same room and time.', kind:'delegate'},
    {who:'Nid', text:'So neither team made a mistake, the system did.', kind:'staff'},
    {who:'Aran', text:'Exactly. I\'ll report this to IT so they can check for duplicate submissions in future. In the meantime, let\'s find both teams an alternative room.', kind:'delegate'},
    {who:'IT Support (joining briefly)', text:'Hi both, I heard the issue come through. I\'ve already flagged it. We\'ll add a check so the system can\'t process one submission twice again.', kind:'manager'},
    {who:'Nid', text:'That\'s exactly what we needed to hear. Thank you.', kind:'staff'},
    {who:'Aran', text:'Agreed. Thanks, both of you, that solves the mystery.', kind:'delegate'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does the booking log show for Room 3?', opts:['Only one booking','Two confirmed bookings at the same time','No bookings at all'], correct:1},
  {q:'What is the reference number on the Sales Team\'s confirmation?', opts:['RM3-0471', 'RM3-0472', 'RM3-0473'], correct:1},
  {q:'What caused the double booking, according to the system record?', opts:['A staff member typed the wrong room','A form submission was processed twice by mistake','The Operations Team booked on purpose'], correct:1},
  {q:'Whose mistake was the double booking?', opts:['The Sales Team\'s', 'The Operations Team\'s', "Neither team's, it was a system error"], correct:2},
  {q:'What does Aran plan to do to prevent this happening again?', opts:['Nothing, it was a one-time issue','Report it to IT to check for duplicate submissions','Delete the booking system'], correct:1},
  {q:'What does IT Support promise near the end of the call?', opts:['A full refund for both teams','A check so the system can\'t process one submission twice again','A new room for every future event'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Refusing to assume before checking the evidence', example:'"I want to investigate before we assume anyone made a mistake."'},
  {strategy:'Comparing multiple sources (log, email, system record)', example:'"Do we have the confirmation emails?"'},
  {strategy:'Stating the root cause clearly once it\'s found', example:'"So neither team made a mistake, the system did."'},
  {strategy:'Proposing prevention, not just a one-time fix', example:'"I\'ll report this to IT so they can check for duplicate submissions in future."'},
  {strategy:'Still solving the immediate problem while investigating the cause', example:'"Let\'s find both teams an alternative room."'}
];

/* ===== Section 6b: Solve the Mystery =====
   GROUP jigsaw reading task, extending the .ab-toggle component to three
   roles instead of two. Each group member reads a different evidence card
   (only their own screen), then the group compares aloud to find the root
   cause together — this unit's distinct mechanic (a genuine group analysis
   task) rather than a repeat of Units 9-10's solo/pair mechanics. */
const EVIDENCE_CARDS = {
  A:{title:'Card A: The Booking Log', body:'Room 3, 9:00 a.m., Sales Team (confirmed 3 days ago, reference RM3-0472).\nRoom 3, 9:00 a.m., Operations Team (confirmed yesterday, reference RM3-0473).\nBoth entries show status: CONFIRMED.'},
  B:{title:'Card B: The Confirmation Email', body:'From: booking-system@venue.com\nSubject: Room 3 Confirmed, 9:00 a.m.\nSent: Monday, 2:15 p.m.\nReference number: RM3-0472.\n(This is the Sales Team\'s copy. No other email was ever sent to them.)'},
  C:{title:'Card C: The IT System Log', body:'System note: a form-submission error occurred at 2:15 p.m. on Monday. The booking system briefly processed one submission twice, creating two separate confirmed bookings under two different reference numbers (RM3-0472 and RM3-0473) for the same room and time.'}
};
const MODEL_CONCLUSION = 'The root cause was a technical error: the booking system processed one form submission twice at 2:15 p.m. on Monday, creating two different confirmation numbers for the same room and time. Neither team made a mistake, the system did. To prevent this, the booking system should check for duplicate submissions within a short time window.';
const PREVENTION_IDEAS = [
  'Have the system automatically reject a second submission within a few minutes of the first.',
  'Have a staff member manually double-check every booking before sending a confirmation.',
  'Do nothing differently, since this will probably never happen again.'
];
const PREVENTION_WEAK_INDEX = 2;

/* ===== Section 8: Speaking Practice — Group Report-Out (3 roles) =====
   Group of 3, matching this unit's 3-way jigsaw evidence: a genuine 3-role
   speaking mechanic rather than a 2-role role-play relabeled as "group
   work" — fixes that mismatch directly. */
const ROLEPLAY_CARDS = {
  investigator:{title:'Role Card A: Investigator', body:'You gathered the evidence for your group.',
    role:'Present what the evidence showed to the group, as if reporting to the Events Office.',
    phrases:["We investigated the Room 3 conflict.", 'The evidence showed…', 'The root cause was…', 'Neither team was at fault.']},
  manager:{title:'Role Card B: Duty Manager', body:'You will decide what happens next.',
    role:'Respond to the investigator\'s report and announce the prevention plan to the group.',
    phrases:['Thank you for investigating this.', 'To prevent this next time, we will…', "I'll report this to IT.", "Let's make sure both teams have a room."]},
  journalist:{title:'Role Card C: Journalist', body:'You heard about the mix-up and want to know what happened.',
    role:'Ask the investigator and duty manager one or two follow-up questions, then summarize what you were told.',
    phrases:['Can you explain what happened?', 'Was anyone at fault?', 'What will you do to prevent this next time?', 'Thank you for the explanation.']}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'One of the two teams is upset and doesn\'t believe it was a system error. Explain the evidence calmly.'},
  {tag:'Scenario 2', text:'The same kind of double-booking happens again a week later. Is this now a pattern? What do you say to your manager?'},
  {tag:'Scenario 3', text:'A journalist at the event asks what happened. Give a short, professional explanation without blaming anyone unfairly.'}
];

/* ===== Spot the Error (Remember-level review, replaces the crossword slot) =====
   Same 10 key words, error-spotting mechanic: judge whether the
   highlighted word is used correctly in each sentence. */
const ERROR_SPOT_ITEMS = [
  {text:'Check the log for that date.', word:'log', correct:true},
  {text:'Is this a one-time mistake, or an assumption?', word:'assumption', correct:false, shouldBe:'pattern'},
  {text:'The two bookings prevent by thirty minutes.', word:'prevent', correct:false, shouldBe:'overlap'},
  {text:'Find out who is responsible for the room booking.', word:'responsible', correct:true},
  {text:"Don't make a pattern, verify it first.", word:'pattern', correct:false, shouldBe:'assumption'},
  {text:'What can we do to prevent this next time?', word:'prevent', correct:true},
  {text:'The team evidence why the room was double-booked.', word:'evidence', correct:false, shouldBe:'investigated'},
  {text:"Don't just fix the symptom, find the root cause.", word:'root cause', correct:true}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they present the evidence clearly, in order?',
  'Did they explain the root cause, not just the symptom?',
  'Did they avoid blaming the wrong team?',
  'Did they propose a real prevention idea, not just an apology?',
  'Did they use vocabulary from this unit correctly?',
  'Did their language sound calm, organized, and professional?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'Two delegates were both given the same seat number at a gala dinner. Investigate and propose a prevention idea.'},
  {tag:'Situation B', text:'A wellness guest\'s spa treatment was double-booked with another guest\'s. Investigate and propose a prevention idea.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Write a short incident report (4–6 sentences) explaining what happened, the root cause you found, and your prevention recommendation.',
  discussion: [
    {title:'Tourism Business Management', text:'Two exhibitor booths were both assigned booth number 24 at a trade fair. Investigate a possible root cause and write your incident report.'},
    {title:'Wellness Tourism Management', text:'Two wellness retreat guests both received a confirmation for the same private yoga session time. Investigate a possible root cause and write your incident report.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Analysis Vocabulary', sub:'I can use root cause, evidence, investigate, and prevent correctly.'},
  {k:'evidence', lbl:'Reading Evidence Carefully', sub:'I can read a piece of evidence and understand what it shows.'},
  {k:'combine', lbl:'Combining Evidence With a Group', sub:'I can combine what my group found to identify a root cause together.'},
  {k:'present', lbl:'Presenting a Conclusion', sub:'I can present my group\'s conclusion and prevention idea clearly.'},
  {k:'writing', lbl:'Writing an Incident Report', sub:'I can write a short, clear incident report with a root cause and a fix.'}
];

/* ===================== ASSETS ===================== */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/mice-u11-hero.jpg', alt:'A glass meeting room door labeled "B Meeting Room" with people visible inside' }
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 11: The Double-Booked Room',
  unitCode: 'unit-11'
};
