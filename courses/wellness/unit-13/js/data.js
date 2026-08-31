/* ===================== UNIT 13 CONTENT DATA — A GUEST'S DIFFICULT REQUEST =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   decision task, rubric. Nothing here is UI logic — see app.js for rendering/
   state/voice/progress-tracking.

   Bloom's level: EVALUATE. Students listen individually to a guest's request,
   then INDIVIDUALLY weigh three possible responses against a short policy
   reference and select and justify one, before finally practicing delivering
   that decision in PAIRS. This shifts the unit's core work to an individual
   evaluative decision (not a pair or group task), a deliberate variation from
   Units 10-12, per the instructor's explicit request to vary group size and
   skill emphasis across Units 9-15. Invented content, part of the Units 9-15
   OBE/Bloom's expansion, not drawn from the official workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'A Guest Wants More'},
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

/* ===== Section 1: A Guest Wants More =====
   Opens with a prediction step before the full situation is revealed,
   instead of jumping straight to the facts + decision. */
const OPENING_SCENARIO = {
  facts: [
    'A guest booked the Serenity Retreat, the resort\'s more affordable package.',
    'She has just learned that a higher package includes a private wellness coach consultation.'
  ],
  predictQuestion: "She walks up to the front desk with a serious look on her face. What do you think she's going to ask for?",
  predictGuesses: [
    'To cancel her stay early',
    'To get the wellness coach consultation without paying the price difference',
    'To complain about her room',
    'To book extra spa treatments'
  ],
  predictAnswerIndex: 1,
  message: 'She is waiting at the front desk for your answer, and the package policy is very clear.',
  question: 'What should you do?',
  options: [
    {text:'Check the package policy carefully before answering.', good:true, note:'Good instinct. You need the exact facts before you can respond fairly.'},
    {text:'Say yes right away to keep her happy.', good:false, note:'This risks being unfair to every other guest who paid for that package tier.'},
    {text:'Explain the situation honestly and offer her an alternative.', good:true, note:'Yes. Being honest and offering something else keeps the relationship positive.'},
    {text:'Tell her the request is impossible and walk away.', good:false, note:'That sounds abrupt. Explain warmly, even when the answer is no.'},
    {text:'Ask your manager for guidance if you\'re unsure.', good:true, note:'A reasonable step, especially for a decision this sensitive.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'9:00', point:'Package tiers reviewed', where:'Wellness Office'},
  {time:'10:00', point:'Guest requests logged', where:'Shared tracking sheet'},
  {time:'11:00', point:'Policy check for new requests', where:'Compared against package terms'},
  {time:'2:00 p.m.', point:'Response sent to guests', where:'Within a few hours of the request'},
  {time:'4:00 p.m.', point:'Guest satisfaction check-in', where:'Quick chat or message'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's guest relations briefing. At 9 a.m., package tiers are reviewed at the Wellness Office. At 10 a.m., any new guest requests are logged on the shared tracking sheet. At 11 a.m., we check new requests against the package terms. At 2 p.m., responses are sent to guests, usually within a few hours of the request. And at 4 p.m., we do a quick guest satisfaction check-in, just a short chat or message.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'policy', ic:'📜', nm:'Policy', type:'n.', def:'An official rule that a company or resort follows.', ex:'That request goes against our package policy.'},
  {id:'tier', ic:'🏅', nm:'Tier', type:'n.', def:'A level of package or service, usually with different prices and benefits.', ex:'The wellness coach consultation is only included in the higher tier.'},
  {id:'upgrade', ic:'⬆️', nm:'Upgrade', type:'n./v.', def:'To move to a higher-level package or service, usually for an extra cost.', ex:'She can upgrade her package for the price difference.'},
  {id:'exception', ic:'❗', nm:'Exception', type:'n.', def:'A case where the usual rule is not applied.', ex:'We try not to make an exception, since it would be unfair to other guests.'},
  {id:'consistent', ic:'⚖️', nm:'Consistent', type:'adj.', def:'Treating every situation the same way, following the same rule.', ex:'We have to stay consistent with our package policy.'},
  {id:'decline', ic:'🙅', nm:'Decline', type:'v.', def:'To politely refuse a request.', ex:'We had to decline the request professionally.'},
  {id:'diplomatic', ic:'🕊️', nm:'Diplomatic', type:'adj.', def:'Careful and polite, especially when saying something difficult.', ex:'Be diplomatic when you explain the decision.'},
  {id:'alternative', ic:'🔀', nm:'Alternative', type:'n.', def:'A different option offered instead of the original request.', ex:'We offered her a shorter complimentary session instead.'},
  {id:'firm', ic:'🛑', nm:'Firm', type:'adj.', def:'Clear and not willing to change, said politely.', ex:'Stay firm but polite when you explain the policy.'},
  {id:'entitlement', ic:'🎫', nm:'Entitlement', type:'n.', def:'What someone is officially allowed to have based on their package.', ex:'Check her entitlement before deciding what you can offer.'}
];
const VOCAB_SECONDARY = [
  {id:'obligation2', nm:'Obligation', def:'Something you must do because it was promised or agreed.'},
  {id:'relationship2', nm:'Relationship', def:'The ongoing connection between the resort and a returning guest.'},
  {id:'terms', nm:'Package Terms', def:'The specific details of what is and is not included in a package.'},
  {id:'complimentary', nm:'Complimentary', def:'Given for free, as a courtesy.'},
  {id:'considerate', nm:'Considerate', def:'Careful about the feelings of other people.'}
];

/* ===== Section 2b: Choose and Defend (Evaluate-level) =====
   Same situation and objective as before (weigh a guest request against
   policy, and justify a position), presented as stance cards without
   sentence-starter scaffolding, appropriate for Evaluate level, mirroring
   MICE Unit 13's own Choose and Defend task. */
const STANCE_CHALLENGE = {
  scenario: 'A returning guest asks for a private treatment room upgrade, normally reserved for the top package tier. She has stayed at the resort many times, and other guests on the same tier would notice if she got it for free.',
  question: 'Choose a position, then defend it in one or two sentences.',
  stances: [
    {text:'Decline, and explain that the policy applies to every guest equally.'},
    {text:'Accept, since she is a loyal returning guest.'},
    {text:'Offer a compromise, like a small complimentary upgrade elsewhere instead.'},
    {text:'Avoid answering and hope she forgets.'}
  ],
  weakIndex: 3
};

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'policy', word:'Policy', meaning:'An official rule that a company or resort follows'},
  {id:'tier', word:'Tier', meaning:'A level of package or service, usually with different prices and benefits'},
  {id:'upgrade', word:'Upgrade', meaning:'To move to a higher-level package or service, usually for an extra cost'},
  {id:'exception', word:'Exception', meaning:'A case where the usual rule is not applied'},
  {id:'consistent', word:'Consistent', meaning:'Treating every situation the same way, following the same rule'},
  {id:'decline', word:'Decline', meaning:'To politely refuse a request'},
  {id:'diplomatic', word:'Diplomatic', meaning:'Careful and polite, especially when saying something difficult'},
  {id:'entitlement', word:'Entitlement', meaning:'What someone is officially allowed to have based on their package'}
];

const FILL_BLANK = [
  {q:'That request goes against our package __________.', a:'policy'},
  {q:'The wellness coach consultation is only included in the higher __________.', a:'tier'},
  {q:'She can __________ her package for the price difference.', a:'upgrade'},
  {q:'We try not to make an __________, since it would be unfair to other guests.', a:'exception'},
  {q:'We have to stay __________ with our package policy.', a:'consistent'},
  {q:'We had to __________ the request professionally.', a:'decline'},
  {q:'We offered her a shorter complimentary session as an __________.', a:'alternative'},
  {q:'Check her __________ before deciding what you can offer.', a:'entitlement'}
];

const VOCAB_SITUATIONS = [
  {q:'A guest asks for something outside her package. What is the first thing you should do?', model:'"Let me check the package policy carefully before I answer, so I can be fair and accurate."'},
  {q:'You must decline a guest\'s request. How do you stay professional?', model:'"I need to decline this politely, but I want to offer a diplomatic alternative instead."'},
  {q:'A colleague asks why you didn\'t just say yes to keep the guest happy.', model:'"It\'s a fairness issue. We have to stay consistent with our policy for every guest."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Handling Difficult Guest Requests',
  paragraphs: [
    'Guest relationships are essential at a wellness resort, but requests do not always fit neatly within existing package terms. When a guest asks for something outside her tier, or a loyal returning guest expects special treatment, staff face a genuinely difficult decision.',
    'The first step is always to weigh the request against the package policy. A benefit reserved for a higher tier cannot simply be given away to please one guest, no matter how loyal or important that guest is. Consistency protects the resort\'s reputation with every guest, not just the loudest one.',
    'When a request cannot be fully granted, the most professional response rarely stops at a simple no. A well-handled decline offers a genuine alternative, something the guest can still value, delivered diplomatically rather than defensively.',
    'Staying firm does not mean being cold. The best guest relations professionals combine a clear, consistent policy with warm, respectful communication, explaining the reasoning honestly rather than hiding behind vague excuses.',
    'The same thinking applies across MICE events too: an exclusive sponsor benefit, an upgraded delegate perk, all require the same careful balance between fairness and genuine hospitality.'
  ]
};
const READING_QUESTIONS = [
  {q:'Why can\'t a higher-tier benefit simply be given away to please one guest?', opts:['It would take too much time','Consistency protects the resort\'s reputation with every guest','Guests never notice these things'], correct:1},
  {q:'What does a well-handled decline usually include?', opts:['Nothing else, just a firm no','A genuine alternative, delivered diplomatically','A long apology with no explanation'], correct:1},
  {q:'What does "staying firm" NOT mean, according to the article?', opts:['Being cold or unfriendly','Following a clear, consistent policy','Explaining your reasoning honestly'], correct:0},
  {q:'How does the article say this same thinking applies to MICE events?', opts:['It doesn\'t apply at all','The same balance between fairness and hospitality applies to sponsor and delegate perks','MICE events never have this issue'], correct:1}
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
    'We really value having you here, and…',
    'I hope this alternative works for you.'
  ]}
};

/* ===== Section 6: Listening Script — "The Request" =====
   Two characters: Nan (guest relations coordinator) and Ms. Suriya
   (the guest making the request), the call that sets up the individual
   decision task. */
const BEFORE_LISTEN = {
  setup: 'Ms. Suriya asks Nan for something outside her package. Listen and find out exactly what she is asking for.',
  guesses: [
    'She wants to cancel her stay completely.',
    'She wants the wellness coach consultation included only in a higher package.',
    'She wants a full refund.',
    'She wants to change her room only.'
  ]
};
const LISTEN = {
  intro: 'The Wellness Office. Guest relations coordinator Nan speaks with Ms. Suriya, a Serenity Retreat guest.',
  lines: [
    {who:'Ms. Suriya', text:'Hi Nan, I wanted to ask about the wellness coach consultation. I heard other guests get it.', kind:'delegate'},
    {who:'Nan', text:'Of course, Ms. Suriya. Let me make sure I understand, you\'d like to add the private wellness coach consultation?', kind:'staff'},
    {who:'Ms. Suriya', text:'Yes, exactly. I think it would really help me plan the rest of my stay.', kind:'delegate'},
    {who:'Nan', text:'I completely understand why you\'d want that, it\'s a wonderful part of the experience. I do need to check something before I confirm anything, though.', kind:'staff'},
    {who:'Ms. Suriya', text:'Is there a problem?', kind:'delegate'},
    {who:'Nan', text:'Possibly. That consultation is included only in our Balance & Renewal package, so I need to review your entitlement carefully before I respond.', kind:'staff'},
    {who:'Ms. Suriya', text:'Ah, I didn\'t realize that. When can you get back to me?', kind:'delegate'},
    {who:'Nan', text:'I can have an answer for you within the hour. Thank you so much for your patience.', kind:'staff'},
    {who:'Ms. Suriya', text:'Of course, I appreciate you checking. Talk soon.', kind:'delegate'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does Ms. Suriya ask for?', opts:['A refund','The private wellness coach consultation','A different room'], correct:1},
  {q:'Why does Nan say she needs to check before confirming?', opts:['She is too busy today','That consultation is included only in a higher package tier','She doesn\'t like Ms. Suriya'], correct:1},
  {q:'Which package includes the wellness coach consultation?', opts:['Serenity Retreat', 'Balance & Renewal', 'Neither package'], correct:1},
  {q:'How quickly does Nan promise to respond?', opts:['Immediately, on the call','Within the hour','Within a week'], correct:1},
  {q:'How does Ms. Suriya react to the delay?', opts:['She gets upset and hangs up','She appreciates that Nan is checking carefully','She cancels her stay'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Confirming the exact request before reacting to it', example:"\"Let me make sure I understand, you'd like…\""},
  {strategy:'Validating the guest\'s reasoning without agreeing yet', example:"\"I completely understand why you'd want that…\""},
  {strategy:'Being honest about a possible conflict, without oversharing details', example:'"I do need to check something before I confirm anything."'},
  {strategy:'Giving a specific, reliable timeline', example:'"I can have an answer for you within the hour."'},
  {strategy:'Thanking the guest for their patience', example:'"Thank you so much for your patience."'}
];

/* ===== Section 6b: Make the Decision =====
   INDIVIDUAL evaluation task: read a short policy reference and the exact
   request, weigh three possible responses (each with real trade-offs, not
   a simple right/wrong), select one, and justify it in writing. This is
   Unit 13's distinct mechanic, a genuine Evaluate-level task done alone
   before the pair speaking practice that follows in Section 10. */
const POLICY_CARD = [
  'Package inclusions are fixed once booked and cannot be upgraded mid-stay without an official package change.',
  'All guests are treated with equal warmth and attentiveness regardless of package tier.',
  'New requests must be answered within a reasonable time, ideally the same day.',
  'If a request cannot be granted, an alternative should be offered when possible.'
];
const THE_REQUEST = 'A Serenity Retreat guest (Ms. Suriya) has asked for the private wellness coach consultation that is only included in the Balance & Renewal package.';
const DECISION_OPTIONS = [
  {text:'Accept fully: give her the consultation for free, without a package change.', quality:'weak', note:'This is unfair to every other guest on the same tier who paid for a different package, a serious problem even if it makes her happy today.'},
  {text:'Decline, and offer her the option to upgrade for the price difference, or a shorter complimentary wellness chat instead.', quality:'strong', note:'This respects the package tiers, follows the policy of offering an alternative, and keeps the guest genuinely valued.'},
  {text:'Decline with no alternative offered.', quality:'weak', note:'This follows the package terms, but ignores the policy point about offering an alternative when possible.'}
];
const MODEL_DECISION = 'We should decline the free consultation, since it is exclusive to the Balance & Renewal package. To keep the relationship warm, we should offer Ms. Suriya the option to upgrade for the price difference, or a shorter complimentary wellness chat as a gesture of goodwill, and respond within the same day.';

/* ===== Section 8: Speaking Practice — Role-Play ===== */
const ROLEPLAY_CARDS = {
  staff:{title:'Role Card A: Guest Relations Coordinator', body:'You must deliver the decision to Ms. Suriya.',
    role:'Explain the decision diplomatically, referencing the policy, and offer the alternative.',
    phrases:["After reviewing this, we've decided…", "Unfortunately, our policy doesn't allow…", 'What I can offer instead is…', 'We really value having you here.']},
  visitor:{title:'Role Card B: Ms. Suriya (Guest)', body:'You receive the decision and are a little disappointed.',
    role:"Ask one follow-up question or push back once politely, then accept the alternative.",
    phrases:['I understand, but is there anything else you could offer?', 'Can you reconsider?', 'I see, that makes sense.', 'Thank you for explaining this so clearly.']}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'A different guest asks for the exact same request next week. How do you make sure your answer stays consistent?'},
  {tag:'Scenario 2', text:'Ms. Suriya gets a little frustrated and raises her voice slightly. Stay calm and diplomatic.'},
  {tag:'Scenario 3', text:'Your manager asks you to make an exception "just this once." How do you respond professionally?'}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they explain the decision clearly, referencing the policy?',
  'Did they stay diplomatic, not defensive?',
  'Did they offer a genuine alternative?',
  'Did they handle the pushback question calmly?',
  'Did they thank the guest for their understanding?',
  'Did their language sound professional and consistent?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'A guest asks for a treatment normally reserved for couples\' packages, but she is traveling alone. Decide and justify.'},
  {tag:'Situation B', text:'A guest asks to extend her spa access hours beyond what her package allows, since she is leaving early tomorrow. Decide and justify.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Write a short, professional email (4–6 sentences) to Ms. Suriya, explaining your decision and offering the alternative.',
  discussion: [
    {title:'Tourism Business Management', text:'A conference delegate requests VIP lounge access normally reserved for a higher sponsorship tier. Write your decision email.'},
    {title:'Wellness Tourism Management', text:'A guest requests a couples\' treatment room upgrade, but her package only includes individual treatments. Write your decision email.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Policy Vocabulary', sub:'I can use policy, tier, upgrade, and compromise correctly.'},
  {k:'weigh', lbl:'Weighing a Decision', sub:'I can weigh three response options and choose the strongest one.'},
  {k:'justify', lbl:'Justifying a Decision', sub:'I can justify my decision clearly, referencing a policy or reason.'},
  {k:'diplomatic', lbl:'Being Diplomatic', sub:'I can deliver a difficult decision politely and offer an alternative.'},
  {k:'writing', lbl:'Writing a Decision Email', sub:'I can write a short, professional decision email to a guest.'}
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 13: A Guest\'s Difficult Request',
  unitCode: 'unit-13'
};
