/* ===================== UNIT 11 CONTENT DATA — THE GUEST WHO DIDN'T FEEL WELL =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   evidence cards, rubric. Nothing here is UI logic — see app.js for rendering/
   state/voice/progress-tracking.

   Bloom's level: ANALYZE. Students work in GROUPS of 3, each reading a different
   piece of evidence (a jigsaw reading task, not another listening or speaking
   drill), and must combine what they each found to identify the root cause of
   a guest's mild skin reaction after a treatment, then propose a prevention
   step. Kept deliberately mild and clinical, not alarming: a manageable skin
   sensitivity, handled calmly and professionally, never framed as a medical
   emergency. This is the unit's distinct mechanic, a genuine step toward
   analysis over Units 9-10's apply-level tasks, per the instructor's explicit
   request to vary group size and skill emphasis across Units 9-15. Invented
   content, part of the Units 9-15 OBE/Bloom's expansion, not drawn from the
   official workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'A Guest Feels Uncomfortable'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Find the Mistake'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'What Would You Say?'},
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

/* ===== Section 1: A Guest Feels Uncomfortable ===== */
const OPENING_SCENARIO = {
  facts: [
    'A guest had an aromatherapy massage this morning.',
    'An hour later, she notices mild redness and itching on her arm.',
    'She is not in pain, just uncomfortable and a little worried.'
  ],
  message: 'The guest comes to the spa desk to ask what might have caused this.',
  question: 'What should you do first?',
  options: [
    {text:'Stay calm and reassure the guest while you look into it.', good:true, note:'Good instinct. Reassurance first keeps the guest comfortable while you investigate.'},
    {text:'Check the treatment notes to see which products were used.', good:true, note:'Yes. The treatment notes are the first real evidence you need.'},
    {text:'Guess it was probably nothing and send her away.', good:false, note:"A guess isn't good enough here. The guest deserves a real answer, and future guests deserve prevention."},
    {text:'Blame the therapist immediately without checking anything.', good:false, note:'Blaming someone before you have evidence can be unfair and often wrong.'},
    {text:'Ask the guest if she has any known sensitivities.', good:true, note:'A thoughtful question. Her own history is an important piece of the puzzle too.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'8:00', point:'Treatment room check', where:'All products checked and labeled'},
  {time:'9:00', point:'Guest health forms reviewed', where:'Front desk, before each treatment'},
  {time:'10:00', point:'First treatments begin', where:'Spa Wing'},
  {time:'2:00 p.m.', point:'Product restocking', where:'Confirmed against the ingredient log'},
  {time:'5:00 p.m.', point:'Daily incident log reviewed', where:'Spa Manager\'s Office'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's spa readiness briefing. At 8 a.m., every treatment room is checked, and all products are checked and labeled. At 9 a.m., guest health forms are reviewed at the front desk before each treatment. At 10 a.m., the first treatments begin in the Spa Wing. At 2 p.m., product restocking is confirmed against the ingredient log. And at 5 p.m., the daily incident log is reviewed in the Spa Manager's Office.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'evidence', ic:'🔎', nm:'Evidence', type:'n.', def:'Facts or information that help you understand what really happened.', ex:'Look at the evidence before you decide.'},
  {id:'rootcause', ic:'🌱', nm:'Root Cause', type:'n. phr.', def:'The real, original reason a problem happened, not just its symptoms.', ex:"Don't just treat the symptom, find the root cause."},
  {id:'investigate', ic:'🕵️', nm:'Investigate', type:'v.', def:'To find out the facts about a problem carefully.', ex:'The team investigated why the guest had a reaction.'},
  {id:'reaction', ic:'⚠️', nm:'Reaction', type:'n.', def:'A physical response, especially a negative one, to a treatment or product.', ex:'The guest had a mild skin reaction after her massage.'},
  {id:'sensitivity', ic:'🌸', nm:'Sensitivity', type:'n.', def:'Being easily affected or irritated by a specific substance.', ex:'She mentioned a sensitivity to certain essential oils.'},
  {id:'ingredient', ic:'🧴', nm:'Ingredient', type:'n.', def:'One part of a product, like an oil or lotion.', ex:'Check every ingredient in the massage oil we used.'},
  {id:'flag', ic:'🚩', nm:'Flag', type:'v.', def:'To mark or note something as important so others notice it.', ex:"Always flag a guest's known sensitivity in their file."},
  {id:'precaution', ic:'🛡️', nm:'Precaution', type:'n.', def:'An action taken in advance to prevent a problem.', ex:'A patch test is a simple precaution before a new treatment.'},
  {id:'patchtest', ic:'🩹', nm:'Patch Test', type:'n.', def:"A small test of a product on the skin before full use, to check for a reaction.", ex:'We recommend a patch test for any new guest with sensitive skin.'},
  {id:'prevent', ic:'✅', nm:'Prevent', type:'v.', def:'To stop something from happening in the future.', ex:'What can we do to prevent this next time?'}
];
const VOCAB_SECONDARY = [
  {id:'redness', nm:'Redness', def:'A pink or red color on the skin, often a sign of mild irritation.'},
  {id:'consult2', nm:'Consult', def:'To ask a colleague, or a medical professional, for advice.'},
  {id:'documented', nm:'Documented', def:'Written down officially, so there is a clear record.'},
  {id:'alternative2', nm:'Alternative', def:'A different option offered instead of the original one.'},
  {id:'reassure2', nm:'Reassure', def:'To say or do something to reduce someone\'s worry.'}
];

/* ===== Section 2b: Find the Mistake =====
   Same underlying skill as before (evaluating a claim against the evidence
   instead of accepting it at face value), presented as spot-the-error in a
   colleague's draft instead of a single choose-and-explain challenge,
   mirroring MICE Unit 11's own Find the Mistake task. */
const DRAFT_SUMMARY = [
  {text:'Ms. Fontaine had a 60-minute aromatherapy massage using a lavender and eucalyptus blend.', wrong:false},
  {text:'Her health form clearly listed no known sensitivities at all.', wrong:true, why:'Actually, her health form DID note a mild sensitivity to lavender, it just was never flagged in the digital system.'},
  {text:'The sensitivity was written on paper but never entered into the digital system.', wrong:false},
  {text:'Going forward, every handwritten note will be transferred into the digital sensitivity field.', wrong:false}
];

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'evidence', word:'Evidence', meaning:'Facts or information that help you understand what really happened'},
  {id:'rootcause', word:'Root Cause', meaning:'The real, original reason a problem happened, not just its symptoms'},
  {id:'reaction', word:'Reaction', meaning:'A physical response, especially a negative one, to a treatment or product'},
  {id:'sensitivity', word:'Sensitivity', meaning:'Being easily affected or irritated by a specific substance'},
  {id:'ingredient', word:'Ingredient', meaning:'One part of a product, like an oil or lotion'},
  {id:'flag', word:'Flag', meaning:'To mark or note something as important so others notice it'},
  {id:'precaution', word:'Precaution', meaning:'An action taken in advance to prevent a problem'},
  {id:'patchtest', word:'Patch Test', meaning:'A small test of a product on the skin to check for a reaction'}
];

const FILL_BLANK = [
  {q:'Look at the __________ before you decide.', a:'evidence'},
  {q:"Don't just treat the symptom, find the __________.", a:'root cause'},
  {q:'The guest had a mild skin __________ after her massage.', a:'reaction'},
  {q:'She mentioned a __________ to certain essential oils.', a:'sensitivity'},
  {q:'Check every __________ in the massage oil we used.', a:'ingredient'},
  {q:"Always __________ a guest's known sensitivity in their file.", a:'flag'},
  {q:'A __________ is a simple precaution before a new treatment.', a:'patch test'},
  {q:'What can we do to __________ this next time?', a:'prevent'}
];

const VOCAB_SITUATIONS = [
  {q:'A guest asks what might have caused her skin reaction. What do you say?', model:'"Let me investigate that for you, I want to look at the evidence carefully before I answer."'},
  {q:'You find out a guest has a known sensitivity. What should always happen with that information?', model:"\"It should always be flagged clearly in her file, so every therapist sees it.\""},
  {q:'A colleague asks how to prevent this happening again. What do you suggest?', model:'"As a precaution, I\'d recommend a quick patch test for any guest with sensitive skin."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Investigating a Guest Reaction: Finding the Root Cause',
  paragraphs: [
    'When a guest reports a mild skin reaction after a treatment, the easy response is to apologize and move on. But experienced spa professionals know that responding well means finding the real root cause, not just calming the guest down.',
    'Finding a root cause means gathering evidence from more than one source. A guest\'s health form, the therapist\'s treatment notes, and the product ingredient list might each tell only part of the story. Only by comparing all three together does the real explanation usually appear.',
    'It is also important not to jump to an assumption. It would be easy to assume the guest simply has sensitive skin in general, but the evidence might point to something more specific, like a particular oil that was never properly flagged in her file.',
    'Once the root cause is clear, the most valuable step is prevention. A patch test, a clearly flagged file note, or double-checking a guest\'s form before a new treatment are all simple precautions that protect both the guest and the spa\'s reputation.',
    'Handling this calmly matters too. A guest who feels genuinely cared for, listened to, and informed almost always leaves with more trust in the resort, not less, even after something went mildly wrong.'
  ]
};
const READING_QUESTIONS = [
  {q:'What is described as the easy response to a guest reaction, according to the article?', opts:['To apologize and move on without investigating','To immediately call a doctor','To ignore the guest completely'], correct:0},
  {q:'What does finding a root cause usually require?', opts:['Guessing quickly','Comparing evidence from more than one source','Blaming the guest'], correct:1},
  {q:'What is the risk of assuming the guest "just has sensitive skin in general"?', opts:['There is no risk at all','It might miss a more specific cause, like a particular ingredient','It always saves time'], correct:1},
  {q:'What is described as the most valuable step once the cause is clear?', opts:['Apologizing again','Prevention, like a patch test or a clearly flagged file note','Closing the investigation immediately'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  investigating:{title:'Investigating a Reaction', items:[
    "Let's check the treatment notes.",
    'What does the evidence show?',
    'Has this happened before with this guest?',
    "Let's not assume, let's verify."
  ]},
  discussing:{title:'Discussing With Your Group', items:[
    'I think the cause might be…',
    'Look at this, it shows…',
    'That matches what I found too.',
    'So the root cause seems to be…'
  ]},
  reassuring:{title:'Reassuring the Guest', items:[
    "I completely understand, let's find out what happened.",
    'Thank you for letting us know right away.',
    "We're looking into this carefully.",
    'We will make sure this is noted for your next visit.'
  ]}
};

/* ===== Section 6 (What Would You Say?): situation → phrase category =====
   Grounded in Ms. Fontaine's own lavender-sensitivity case from LISTEN
   below, so the situations walk through her actual case, not an abstract
   one. */
const PHRASE_SITUATIONS = [
  {cue: 'Ms. Fontaine had a reaction after her aromatherapy massage, and you want to find out why before assuming anything.', correct:'investigating', wrongs:['discussing','reassuring']},
  {cue: "You've found her health form note about the lavender sensitivity, and now you need to compare it with what Aran found in the treatment record.", correct:'discussing', wrongs:['investigating','reassuring']},
  {cue: "You've found the root cause, and now it's time to speak with Ms. Fontaine herself.", correct:'reassuring', wrongs:['investigating','discussing']}
];

/* ===== Section 6: Listening Script — "The Investigation" =====
   Two characters: Nid (spa coordinator) and Aran (senior therapist),
   investigating the guest's reaction together over the phone. */
const BEFORE_LISTEN = {
  setup: 'Nid calls Aran to investigate the guest\'s reaction. Listen and find out what they discover.',
  guesses: [
    'The therapist made a careless mistake.',
    'A known sensitivity was never flagged in the guest\'s file.',
    'There was never actually a reaction at all.',
    'The guest is not telling the truth.'
  ]
};
const LISTEN = {
  intro: 'The Spa Office. Coordinator Nid calls senior therapist Aran to figure out what happened during this morning\'s massage.',
  lines: [
    {who:'Nid', text:"Hi Aran, it's Nid. I'm looking into the guest reaction from this morning. I want to investigate before we assume anything.", kind:'staff'},
    {who:'Aran', text:'Good idea. What does her treatment note say?', kind:'delegate'},
    {who:'Nid', text:'It says a lavender and eucalyptus blend was used for her aromatherapy massage.', kind:'staff'},
    {who:'Aran', text:'Let me check her health form… okay, I found it. She wrote here that she has a mild sensitivity to lavender.', kind:'delegate'},
    {who:'Nid', text:'That\'s the connection. Was that sensitivity flagged anywhere for the therapist to see?', kind:'staff'},
    {who:'Aran', text:"No, it wasn't flagged in the system, it was only written on the paper form, and the therapist never saw it.", kind:'delegate'},
    {who:'Nid', text:'So the root cause is that her sensitivity was documented but never actually flagged for the treatment team.', kind:'staff'},
    {who:'Aran', text:'Exactly. I\'ll make sure every noted sensitivity gets flagged clearly in the system going forward, not just written on paper.', kind:'delegate'},
    {who:'Ploy (Spa Manager)', text:"Nid, Aran, sorry I'm late joining. Can you both confirm the root cause for me quickly?", kind:'manager'},
    {who:'Nid', text:'Of course. Her lavender sensitivity was documented on paper but never flagged in the digital system, so the therapist never saw it.', kind:'staff'},
    {who:'Ploy (Spa Manager)', text:"Understood. Let's make sure every paper note gets transferred digitally from now on. Thank you both.", kind:'manager'},
    {who:'Nid', text:'Good. I\'ll reassure the guest now and let her know we\'ve found the cause.', kind:'staff'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What treatment did the guest have?', opts:['A facial','An aromatherapy massage with lavender and eucalyptus','A manicure'], correct:1},
  {q:"What does the guest's health form say?", opts:['She has no sensitivities at all','She has a mild sensitivity to lavender','She is allergic to eucalyptus only'], correct:1},
  {q:'Was the sensitivity flagged for the treatment team to see?', opts:['Yes, clearly flagged in the system','No, it was only written on the paper form','It was announced over the radio'], correct:1},
  {q:'What is identified as the root cause?', opts:["The therapist's carelessness","Her sensitivity was documented but never actually flagged for the team","The guest lied about her sensitivity"], correct:1},
  {q:'What does Aran plan to do to prevent this happening again?', opts:['Nothing, it was a one-time issue','Make sure every noted sensitivity gets flagged clearly in the system','Stop offering aromatherapy massages'], correct:1},
  {q:'What does Ploy, the Spa Manager, ask Nid and Aran to do when she joins?', opts:['Cancel all massages for the week','Confirm the root cause for her','Fire the therapist immediately'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Refusing to assume before checking the evidence', example:'"I want to investigate before we assume anything."'},
  {strategy:'Comparing multiple sources (treatment note, health form)', example:'"Let me check her health form…"'},
  {strategy:'Stating the root cause clearly once it\'s found', example:'"So the root cause is that her sensitivity was documented but never actually flagged."'},
  {strategy:'Proposing prevention, not just a one-time fix', example:"\"I'll make sure every noted sensitivity gets flagged clearly in the system going forward.\""},
  {strategy:'Still reassuring the guest while investigating the cause', example:"\"I'll reassure the guest now and let her know we've found the cause.\""}
];

/* ===== Section 6b: Solve the Mystery =====
   GROUP jigsaw task, extending the .ab-toggle component to three roles
   instead of two. Each group member reads a different evidence card (only
   their own screen), then the group compares aloud to find the root cause
   together — this unit's distinct mechanic (a genuine group analysis
   task) rather than a repeat of Units 9-10's solo/pair mechanics. */
const EVIDENCE_CARDS = {
  A:{title:'Card A: The Treatment Note', body:"Guest: Ms. Fontaine. Treatment: 60-minute aromatherapy massage. Products used: lavender and eucalyptus oil blend. Note: guest requested a stronger scent than usual."},
  B:{title:"Card B: The Guest's Health Form", body:"Filled out at check-in last week. Question: 'Do you have any known sensitivities?' Answer, handwritten: 'Mild sensitivity to lavender, please avoid if possible.'"},
  C:{title:'Card C: The Front Desk System Log', body:"System note: the guest's health form was scanned and filed, but the 'sensitivity' field was left blank in the digital system, since it was only written by hand in the notes section, which therapists do not see before a treatment."}
};
const MODEL_CONCLUSION = "The root cause was that the guest's lavender sensitivity was written on her paper health form, but never entered into the digital 'sensitivity' field that therapists actually check before a treatment. The therapist was not being careless, the information simply never reached them. To prevent this, every handwritten note on a health form should be transferred into the digital sensitivity field before a guest's first treatment.";

/* Role-lock wrapper (see js/role-lock.js) — a real per-student information
   gap for Section 9, replacing the old same-screen A/B/C toggle. Generalized
   over Object.keys(EVIDENCE_CARDS), matching the 3-role dynamic pattern
   already used for this unit's own s8. */
const S6B_ROLES = Object.fromEntries(Object.keys(EVIDENCE_CARDS).map(k => [k, {
  label: `I have ${EVIDENCE_CARDS[k].title}`,
  heading: EVIDENCE_CARDS[k].title,
  instructions: "Describe what your card shows to the rest of your group out loud. Don't share your screen — the group needs to hear it from you, not read it themselves.",
  body: EVIDENCE_CARDS[k].body
}]));
const PREVENTION_IDEAS = [
  'Train front desk staff to transfer every handwritten note into the digital sensitivity field before filing.',
  'Have the therapist personally re-ask about sensitivities before every single treatment, even repeat guests.',
  'Do nothing differently, since this will probably never happen again.'
];
const PREVENTION_WEAK_INDEX = 2;

/* ===== Section 8: Speaking Practice — Group Report-Out (3 roles) =====
   Group of 3, matching this unit's 3-card evidence jigsaw in Section 9: a
   genuine 3-role speaking mechanic instead of a 2-role role-play relabeled
   as "group" work, mirroring MICE Unit 11's own 3-role upgrade for its own
   group unit. */
const ROLEPLAY_CARDS = {
  investigator:{title:'Role Card A: Investigator', body:'You gathered the evidence for your group.',
    role:'Present what the evidence showed to the group, as if reporting to the spa manager.',
    phrases:["We investigated the guest's reaction.", 'The evidence showed…', 'The root cause was…', 'The therapist was not at fault.']},
  manager:{title:'Role Card B: Spa Manager', body:'You will decide what happens next.',
    role:'Respond to the investigator\'s report and announce the prevention plan.',
    phrases:['Thank you for investigating this.', 'To prevent this next time, we will…', "I'll update our front desk training.", "Let's make sure the guest feels cared for."]},
  guest:{title:'Role Card C: The Guest', body:'You are Ms. Fontaine, waiting to understand what happened.',
    role:'Listen to the explanation, then ask one honest follow-up question.',
    phrases:["I just want to understand what happened.", 'Will this happen again?', 'Thank you for looking into it so carefully.', "I appreciate you explaining this clearly."]}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'The guest is understandably a little upset and wants a clear explanation. Explain the evidence calmly and kindly.'},
  {tag:'Scenario 2', text:'A similar mix-up happens again a month later. Is this now a pattern? What do you say to the spa manager?'},
  {tag:'Scenario 3', text:'A new therapist asks how to avoid this happening on their own shifts. Give them clear advice.'}
];

/* ===== Spot the Error (Remember-level review, replaces the crossword slot) ===== */
const ERROR_SPOT_ITEMS = [
  {text:'Check the evidence before you decide.', word:'evidence', correct:true},
  {text:'She had a mild sensitivity to lavender.', word:'sensitivity', correct:true},
  {text:'The team investigated why the guest had a reaction.', word:'investigated', correct:true},
  {text:"Always ingredient a guest's known sensitivity in their file.", word:'ingredient', correct:false, shouldBe:'flag'},
  {text:'A patch test is a simple root cause before a new treatment.', word:'root cause', correct:false, shouldBe:'precaution'},
  {text:'What can we do to prevent this next time?', word:'prevent', correct:true},
  {text:'Check every flag in the massage oil we used.', word:'flag', correct:false, shouldBe:'ingredient'},
  {text:"Don't just treat the symptom, find the precaution.", word:'precaution', correct:false, shouldBe:'root cause'}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they present the evidence clearly, in order?',
  'Did they explain the root cause, not just the symptom?',
  'Did they avoid unfairly blaming the therapist?',
  'Did they propose a real prevention idea, not just an apology?',
  'Did they use vocabulary from this unit correctly?',
  'Did their language sound calm, organized, and professional?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'A guest\'s skin felt unusually dry after a facial. Investigate a possible root cause and propose a prevention idea.'},
  {tag:'Situation B', text:'A guest with a nut allergy was served a snack containing almonds during a wellness cooking class. Investigate and propose a prevention idea.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Write a short incident report (4–6 sentences) explaining what happened, the root cause you found, and your prevention recommendation.',
  discussion: [
    {title:'Tourism Business Management', text:'A corporate wellness group member had a mild reaction to a scented hand cream given as a welcome gift. Investigate a possible root cause and write your incident report.'},
    {title:'Wellness Tourism Management', text:'A guest attending a group yoga class felt dizzy after using a particular essential oil diffuser in the room. Investigate a possible root cause and write your incident report.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Investigation Vocabulary', sub:'I can use evidence, root cause, sensitivity, and prevent correctly.'},
  {k:'evidence', lbl:'Reading Evidence Carefully', sub:'I can read a piece of evidence and understand what it shows.'},
  {k:'combine', lbl:'Combining Evidence With a Group', sub:'I can combine what my group found to identify a root cause together.'},
  {k:'present', lbl:'Presenting a Conclusion', sub:'I can present my group\'s conclusion and prevention idea clearly.'},
  {k:'writing', lbl:'Writing an Incident Report', sub:'I can write a short, clear incident report with a root cause and a fix.'}
];

/* ===================== TEACHER GUIDE (courses/wellness/unit-11/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Unit 11: The Guest Who Didn\'t Feel Well',
  learningOutcome: 'Each of three students reads a different evidence card (a real jigsaw, not a shared reading), describes it aloud to the group, and together they combine what they each found to identify the true root cause and propose a genuine prevention idea — an Analyze-level task building on Units 9-10\'s Apply-level tasks.',
  bloomsLevel: 'Analyze',
  addieFocus: 'A real jigsaw: each of the three group members sees only their own evidence card. No one member can solve the mystery alone — they must describe their card out loud and listen to the other two, which is the actual professional skill (combining partial evidence from colleagues into one root-cause conclusion).',
  grouping: 'Groups of 3, each member on their own device or browser tab for Section 9 (Solve the Mystery) — this is now technically enforced, not just instructed.',
  timing: [
    {block:'Warm-Up: A Guest Feels Uncomfortable', time:'15 min', ref:'Section 1'},
    {block:'Key Vocabulary', time:'15 min', ref:'Section 2'},
    {block:'Find the Mistake', time:'10 min', ref:'Section 3'},
    {block:'Vocabulary Activities', time:'20 min', ref:'Section 4'},
    {block:'Reading', time:'15 min', ref:'Section 5'},
    {block:'What Would You Say?', time:'10 min', ref:'Section 6'},
    {block:'Listening: The Investigation', time:'15 min', ref:'Section 7'},
    {block:'After Listening', time:'10 min', ref:'Section 8'},
    {block:'Solve the Mystery (Jigsaw)', time:'20 min', ref:'Section 9 — groups of 3, each on a separate device'},
    {block:'Speaking Practice: Group Report-Out', time:'15 min', ref:'Section 10'},
    {block:'Spot the Error, Peer Checklist, Writing, Self-Check', time:'35 min', ref:'Sections 11-14'}
  ],
  materials: [
    'One device per student for Section 9 (the jigsaw now requires this — a shared screen defeats the lock)',
    'Speakers or headphones for the listening sections'
  ],
  teacherPrompts: [
    'Before Section 9: "If everyone in your group could already see all three cards, is this really testing whether you can combine evidence from each other?"',
    'During Section 9: "Are you describing your card out loud, or is someone reading over your shoulder?"',
    'After Section 9: "Which piece of evidence, on its own, would NOT have been enough to solve the mystery?"'
  ],
  commonProblems: [
    {problem: 'A group of 3 shares one or two devices for Section 9.', fix: 'Section 9 now locks to one card per browser/session — if they share devices, only that many cards can be seen at once, and the picker screen makes this visible immediately. Have each student open the unit on their own phone or laptop before starting Section 9.'},
    {problem: 'A student clicks "Start Over" just to see another card.', fix: 'This is visible and expected for solo practice, but the copy in the picker and the Start Over footer both say plainly that doing this outside a real group of 3 defeats the point of the activity — reinforce this verbally when circulating.'}
  ],
  fastClassExtension: 'Have groups swap one member with another group and re-explain their conclusion to a partial newcomer who only knows two of the three cards.',
  slowClassCompression: 'Section 3 (Find the Mistake) and Section 8 (After Listening) can be assigned as homework if time is short — neither gates a later section.',
  assessment: 'Speaking (the jigsaw description and Group Report-Out, Sections 9-10) and Writing (Section 13) are the two most useful grading points; the self-check in Section 14 is student-reflective, not evaluative.'
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 11: The Guest Who Didn\'t Feel Well',
  unitCode: 'unit-11'
};
