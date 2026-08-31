/* ===================== UNIT 13 CONTENT DATA — THE DIFFICULT SPONSOR REQUEST =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   decision task, rubric. Nothing here is UI logic — see app.js for rendering/
   state/voice/progress-tracking.

   Bloom's level: EVALUATE. Students listen individually to a sponsor's request,
   then INDIVIDUALLY weigh three possible responses against a short policy
   reference and select and justify one, before finally practicing delivering
   that decision in PAIRS. This shifts the unit's core work to an individual
   evaluative decision (not a pair or group task), a deliberate variation from
   Units 10-12, per the instructor's explicit request to vary group size and
   skill emphasis across Units 9-15. Invented content, part of the Units 9-15
   OBE/Bloom's expansion, not drawn from the official workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Two Sponsors, One Entrance'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Choose and Defend'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: The Request'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Make the Decision'},
  {key:'s8', label:'Speaking Practice'},
  {key:'crossword', label:'Flashcard Drill'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Two Sponsors, One Entrance =====
   Opens with a prediction step before the full situation is revealed,
   instead of jumping straight to the facts + decision. */
const OPENING_SCENARIO = {
  facts: [
    'Your event has two sponsors: Sponsor A and Sponsor B.',
    'Sponsor A signed a contract for exclusive entrance signage.'
  ],
  predictQuestion: "Your phone rings. It's Sponsor B calling. What do you think they want?",
  predictGuesses: [
    'To cancel their sponsorship',
    'To ask for the same exclusive signage Sponsor A already has',
    'To pay for extra event tickets',
    'To complain about the venue'
  ],
  predictAnswerIndex: 1,
  message: "Sponsor B just asked to also put up signage at the entrance, and Sponsor A's contract is very clear.",
  question: 'What should you do?',
  options: [
    {text:"Check the contract with Sponsor A before answering.", good:true, note:'Good instinct. You need the exact facts before you can respond fairly.'},
    {text:'Say yes to Sponsor B right away to keep them happy.', good:false, note:'This risks breaking a signed contract with Sponsor A, which is a serious problem.'},
    {text:'Explain the situation honestly and offer Sponsor B an alternative.', good:true, note:"Yes. Being honest and offering something else keeps the relationship positive."},
    {text:"Ignore Sponsor B's request.", good:false, note:"Ignoring a sponsor's request looks unprofessional. Respond, even if the answer is no."},
    {text:"Ask your manager for guidance if you're unsure.", good:true, note:'A reasonable step, especially for a decision this sensitive.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'9:00', point:'Sponsor contracts reviewed', where:'Events Office'},
  {time:'10:00', point:'Sponsor requests logged', where:'Shared tracking sheet'},
  {time:'11:00', point:'Policy check for new requests', where:'Compared against contracts'},
  {time:'2:00 p.m.', point:'Response sent to sponsors', where:'Within 24 hours of the request'},
  {time:'4:00 p.m.', point:'Sponsor satisfaction check-in', where:'Quick call or message'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's sponsor relations briefing. At 9 a.m., sponsor contracts are reviewed at the Events Office. At 10 a.m., any new sponsor requests are logged on the shared tracking sheet. At 11 a.m., we check new requests against existing contracts and policy. At 2 p.m., responses are sent to sponsors, always within 24 hours of their request. And at 4 p.m., we do a quick sponsor satisfaction check-in, just a short call or message.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'sponsor', ic:'🤝', nm:'Sponsor', type:'n.', def:'A company that pays money to support an event in exchange for promotion.', ex:'Our main sponsor wants extra signage.'},
  {id:'policy', ic:'📜', nm:'Policy', type:'n.', def:'An official rule that a company or event follows.', ex:'That request goes against our sponsorship policy.'},
  {id:'exclusive', ic:'🔒', nm:'Exclusive', type:'adj.', def:'Only for one person or company, not shared with others.', ex:'They want exclusive rights to the entrance area.'},
  {id:'compromise', ic:'🤲', nm:'Compromise', type:'n./v.', def:'An agreement where both sides accept less than they originally wanted.', ex:'Let\'s find a compromise both sponsors can accept.'},
  {id:'decline', ic:'🙅', nm:'Decline', type:'v.', def:'To politely refuse a request.', ex:'We had to decline the request professionally.'},
  {id:'diplomatic', ic:'🕊️', nm:'Diplomatic', type:'adj.', def:'Careful and polite, especially when saying something difficult.', ex:'Be diplomatic when you explain the decision.'},
  {id:'contractual', ic:'📄', nm:'Contractual', type:'adj.', def:'Agreed to formally in a contract.', ex:"That's a contractual obligation we can't change."},
  {id:'alternative', ic:'🔀', nm:'Alternative', type:'n.', def:'A different option offered instead of the original request.', ex:'We offered an alternative location instead.'},
  {id:'weigh', ic:'⚖️', nm:'Weigh', type:'v.', def:'To think carefully about the good and bad sides of something before deciding.', ex:'Weigh both sides before you respond.'},
  {id:'firm', ic:'🛑', nm:'Firm', type:'adj.', def:'Clear and not willing to change, said politely.', ex:'Stay firm but polite when you explain the policy.'}
];
const VOCAB_SECONDARY = [
  {id:'obligation', nm:'Obligation', def:'Something you must do because you agreed to it.'},
  {id:'partnership', nm:'Partnership', def:'A working relationship between an event and its sponsor.'},
  {id:'tier', nm:'Sponsorship Tier', def:'A level of sponsorship (like Gold or Silver) with different benefits.'},
  {id:'signage', nm:'Signage', def:'Signs, banners, or logos displayed at a venue.'},
  {id:'consistent', nm:'Consistent', def:'Treating every situation the same way, following the same rule.'}
];

/* ===== Section 2b: Choose and Defend (Evaluate-level) =====
   Same situation and objective as before (weigh a sponsor request against
   policy, and justify a position), presented as stance cards without
   sentence-starter scaffolding — appropriate for Evaluate level, where
   students should reason more independently than at Units 9-10's Apply
   level. Only "avoid answering" is treated as indefensible; the other
   three stances are each genuinely arguable, matching real Evaluate-level
   ambiguity. */
const STANCE_CHALLENGE = {
  scenario: "A major sponsor asks for their logo to be twice the size allowed in the sponsorship policy. They are your event's largest sponsor by far, and other smaller sponsors would notice if you said yes.",
  question: 'Choose a position, then defend it in one or two sentences.',
  stances: [
    {text:'Decline, and explain that the policy applies to every sponsor equally.'},
    {text:'Accept, since they are the largest sponsor.'},
    {text:'Offer a compromise: extra signage elsewhere instead of a bigger logo.'},
    {text:'Avoid answering and hope they forget.'}
  ],
  weakIndex: 3
};

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'sponsor', word:'Sponsor', meaning:'A company that pays money to support an event in exchange for promotion'},
  {id:'policy', word:'Policy', meaning:'An official rule that a company or event follows'},
  {id:'exclusive', word:'Exclusive', meaning:'Only for one person or company, not shared with others'},
  {id:'compromise', word:'Compromise', meaning:'An agreement where both sides accept less than they originally wanted'},
  {id:'decline', word:'Decline', meaning:'To politely refuse a request'},
  {id:'diplomatic', word:'Diplomatic', meaning:'Careful and polite, especially when saying something difficult'},
  {id:'alternative', word:'Alternative', meaning:'A different option offered instead of the original request'},
  {id:'firm', word:'Firm', meaning:'Clear and not willing to change, said politely'}
];

const FILL_BLANK = [
  {q:'Our main __________ wants extra signage.', a:'sponsor'},
  {q:'That request goes against our sponsorship __________.', a:'policy'},
  {q:'They want __________ rights to the entrance area.', a:'exclusive'},
  {q:"Let's find a __________ both sponsors can accept.", a:'compromise'},
  {q:'We had to __________ the request professionally.', a:'decline'},
  {q:'Be __________ when you explain the decision.', a:'diplomatic'},
  {q:'We offered an __________ location instead.', a:'alternative'},
  {q:'Stay __________ but polite when you explain the policy.', a:'firm'}
];

const VOCAB_SITUATIONS = [
  {q:'A sponsor asks for something your policy doesn\'t allow. What is the first thing you should do?', model:'"Let me make sure I understand your request, and let me weigh this carefully before I respond."'},
  {q:'You must refuse a sponsor\'s request. How do you stay professional?', model:'"I need to decline this politely, but I want to offer a diplomatic alternative instead."'},
  {q:'A colleague asks why you didn\'t just say yes to keep the sponsor happy.', model:'"It\'s a contractual issue. We have to stay consistent with our policy for every sponsor."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Handling Difficult Sponsor Requests',
  paragraphs: [
    'Sponsors are essential partners at MICE events, but sponsor requests do not always fit neatly within existing contracts and policies. When two sponsors want the same exclusive benefit, or a sponsor asks for something outside their tier, the event team faces a genuinely difficult decision.',
    'The first step is always to weigh the request against existing contractual obligations. A signed exclusive agreement with one sponsor cannot simply be broken to please another, no matter how large or important that second sponsor is. Consistency protects the event\'s reputation with every sponsor, not just the loudest one.',
    'When a request cannot be fully granted, the most professional response rarely stops at a simple no. A well-handled decline offers a genuine alternative, something the sponsor can still value, delivered diplomatically rather than defensively.',
    'Staying firm does not mean being cold. The best sponsor relations professionals combine a clear, consistent policy with warm, respectful communication, explaining the reasoning honestly rather than hiding behind vague excuses.',
    'For Wellness Tourism events, sponsor requests might involve exclusive product placement in a spa area or branding on wellness materials, the same principles apply: honor existing agreements, stay consistent, and offer real alternatives when you must say no.'
  ]
};
const READING_QUESTIONS = [
  {q:'Why can\'t an exclusive agreement with one sponsor simply be broken for another?', opts:['It would take too much time','Consistency protects the event\'s reputation with every sponsor','Sponsors never notice these things'], correct:1},
  {q:'What does a well-handled decline usually include?', opts:['Nothing else, just a firm no','A genuine alternative, delivered diplomatically','A long apology with no explanation'], correct:1},
  {q:'What does "staying firm" NOT mean, according to the article?', opts:['Being cold or unfriendly','Following a clear, consistent policy','Explaining your reasoning honestly'], correct:0},
  {q:'How does the same thinking apply to Wellness Tourism events?', opts:['It doesn\'t apply at all','The same principles: honor agreements, stay consistent, offer alternatives','Wellness sponsors never make requests'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  understanding:{title:'Understanding the Request', items:[
    'Let me make sure I understand your request.',
    "So you're asking for…, is that right?",
    'Thank you for letting us know.'
  ]},
  responding:{title:'Responding Professionally', items:[
    "I understand why you'd want that.",
    "Unfortunately, our policy doesn't allow…",
    'What I can offer instead is…',
    'I need to check this before I confirm.'
  ]},
  deciding:{title:'Explaining a Decision', items:[
    "After reviewing this, we've decided…",
    'We have to stay consistent with our policy.',
    'We really value your partnership, and…',
    'I hope this alternative works for you.'
  ]}
};

/* ===== Section 6: Listening Script — "The Request" =====
   Two characters: Nan (Sponsorship Coordinator) and Ms. Preecha (Sponsor B
   representative), the call that sets up the individual decision task. */
const BEFORE_LISTEN = {
  setup: 'Ms. Preecha from Sponsor B calls Nan with a request. Listen and find out exactly what she is asking for.',
  guesses: [
    'She wants to cancel her sponsorship completely.',
    'She wants entrance signage, the same spot Sponsor A has exclusively.',
    'She wants a full refund.',
    'She wants to add a third sponsor to the event.'
  ]
};
const LISTEN = {
  intro: 'The Events Office. Sponsorship Coordinator Nan takes a call from Ms. Preecha, from Sponsor B.',
  lines: [
    {who:'Ms. Preecha', text:'Hi Nan, it\'s Preecha from Sponsor B. I wanted to ask about signage at the main entrance for the event.', kind:'delegate'},
    {who:'Nan', text:'Of course, Ms. Preecha. Let me make sure I understand, you\'d like Sponsor B\'s signage placed at the main entrance?', kind:'staff'},
    {who:'Ms. Preecha', text:"That's right. We think it would give us much better visibility as guests arrive.", kind:'delegate'},
    {who:'Nan', text:'I completely understand why you\'d want that spot, it\'s the most visible location at the venue. I do need to check something before I confirm anything, though.', kind:'staff'},
    {who:'Ms. Preecha', text:'Is there a problem?', kind:'delegate'},
    {who:'Nan', text:'Possibly. Sponsor A has a Gold-tier contract that includes exclusive entrance signage, so I need to review that carefully before I respond.', kind:'staff'},
    {who:'Ms. Preecha', text:'Ah, I didn\'t realize that. When can you get back to me?', kind:'delegate'},
    {who:'Nan', text:'Our policy is to respond within 24 hours, so you\'ll have my answer by tomorrow at the latest. Thank you so much for your patience.', kind:'staff'},
    {who:'Ms. Preecha', text:'Of course, I appreciate you checking. Talk soon.', kind:'delegate'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does Ms. Preecha ask for?', opts:['A refund','Signage at the main entrance','A different sponsorship tier'], correct:1},
  {q:'Why does Nan say she needs to check before confirming?', opts:['She is too busy today','Sponsor A has an exclusive contract for that exact location','She doesn\'t like Sponsor B'], correct:1},
  {q:'What tier is Sponsor A\'s contract?', opts:['Silver', 'Gold', 'Bronze'], correct:1},
  {q:'How quickly does Nan promise to respond?', opts:['Immediately, on the call','Within 24 hours','Within a week'], correct:1},
  {q:'How does Ms. Preecha react to the delay?', opts:['She gets angry and hangs up','She appreciates that Nan is checking carefully','She cancels her sponsorship'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Confirming the exact request before reacting to it', example:"\"Let me make sure I understand, you'd like…\""},
  {strategy:'Validating the sponsor\'s reasoning without agreeing yet', example:"\"I completely understand why you'd want that spot…\""},
  {strategy:'Being honest about a possible conflict, without oversharing details', example:'"I do need to check something before I confirm anything."'},
  {strategy:'Giving a specific, reliable timeline', example:'"Our policy is to respond within 24 hours."'},
  {strategy:'Thanking the sponsor for their patience', example:'"Thank you so much for your patience."'}
];

/* ===== Section 6b: Make the Decision =====
   INDIVIDUAL evaluation task: read a short policy reference and the exact
   request, weigh three possible responses (each with real trade-offs, not
   a simple right/wrong), select one, and justify it in writing. This is
   Unit 13's distinct mechanic, a genuine Evaluate-level task done alone
   before the pair speaking practice that follows in Section 10. */
const POLICY_CARD = [
  'Exclusive signage rights must be honored exactly as contracted.',
  'All sponsors receive equal logo size unless a higher tier was purchased.',
  'New requests must be answered within 24 hours.',
  'If a request cannot be granted, an alternative should be offered when possible.'
];
const THE_REQUEST = 'Sponsor B (Silver Tier) has asked to place their own signage at the main entrance, the same location where Sponsor A (Gold Tier) has an exclusive contract.';
const DECISION_OPTIONS = [
  {text:'Accept fully: allow Sponsor B to place signage at the main entrance too.', quality:'weak', note:"This breaks Sponsor A's exclusive contract, a serious problem even if it makes Sponsor B happy today."},
  {text:'Decline, and offer Sponsor B prominent signage at the registration desk instead.', quality:'strong', note:'This honors the exclusive contract, follows the policy of offering an alternative, and keeps Sponsor B valued.'},
  {text:'Decline with no alternative offered.', quality:'weak', note:'This follows the contract, but ignores the policy point about offering an alternative when possible.'}
];
const MODEL_DECISION = 'We should decline Sponsor B\'s request for entrance signage, since Sponsor A holds an exclusive Gold-tier contract for that location. To keep the relationship strong, we should offer Sponsor B prominent alternative signage at the registration desk, another highly visible spot, and respond within our 24-hour policy window.';

/* ===== Section 8: Speaking Practice — Role-Play ===== */
const ROLEPLAY_CARDS = {
  staff:{title:'Role Card A: Sponsorship Coordinator', body:'You must deliver the decision to Sponsor B.',
    role:'Explain the decision diplomatically, referencing the policy, and offer the alternative.',
    phrases:["After reviewing this, we've decided…", "Unfortunately, our policy doesn't allow…", 'What I can offer instead is…', 'We really value your partnership.']},
  visitor:{title:'Role Card B: Sponsor B Representative', body:'You receive the decision and are a little disappointed.',
    role:"Ask one follow-up question or push back once politely, then accept the alternative.",
    phrases:['I understand, but is there anything else you could offer?', 'Can you reconsider?', 'I see, that makes sense.', 'Thank you for explaining this so clearly.']}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'A different sponsor asks for the exact same request next month. How do you make sure your answer stays consistent?'},
  {tag:'Scenario 2', text:'Sponsor B\'s representative gets frustrated and raises their voice slightly. Stay calm and diplomatic.'},
  {tag:'Scenario 3', text:'Your manager asks you to make an exception "just this once." How do you respond professionally?'}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they explain the decision clearly, referencing the policy?',
  'Did they stay diplomatic, not defensive?',
  'Did they offer a genuine alternative?',
  'Did they handle the pushback question calmly?',
  'Did they thank the sponsor for their understanding?',
  'Did their language sound professional and consistent?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'A sponsor asks for their product to be the only one served at the gala dinner, but another sponsor already has that exclusive right. Decide and justify.'},
  {tag:'Situation B', text:'A wellness sponsor asks for their treatments to be the only ones offered during the retreat, but this conflicts with another sponsor\'s contract. Decide and justify.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Write a short, professional email (4–6 sentences) to Sponsor B, explaining your decision and offering the alternative.',
  discussion: [
    {title:'Tourism Business Management', text:'A trade fair sponsor requests exclusive rights to the main stage, but another sponsor already holds that exclusive contract. Write your decision email.'},
    {title:'Wellness Tourism Management', text:'A wellness retreat sponsor requests exclusive branding on all guest welcome kits, but another sponsor already holds that exclusive contract. Write your decision email.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Sponsorship Vocabulary', sub:'I can use sponsor, policy, exclusive, and compromise correctly.'},
  {k:'weigh', lbl:'Weighing a Decision', sub:'I can weigh three response options and choose the strongest one.'},
  {k:'justify', lbl:'Justifying a Decision', sub:'I can justify my decision clearly, referencing a policy or reason.'},
  {k:'diplomatic', lbl:'Being Diplomatic', sub:'I can deliver a difficult decision politely and offer an alternative.'},
  {k:'writing', lbl:'Writing a Decision Email', sub:'I can write a short, professional decision email to a sponsor.'}
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 13: The Difficult Sponsor Request',
  unitCode: 'unit-13'
};
