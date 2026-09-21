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
  {key:'s5', label:'What Would You Say?'},
  {key:'s6', label:'Listening: The Request'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Negotiate the Outcome'},
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

/* ===== Section 6 (What Would You Say?): situation → phrase category =====
   Grounded in Ms. Suriya's own consultation request from LISTEN below,
   so the situations aren't abstract -- they walk through her actual case. */
const PHRASE_SITUATIONS = [
  {cue:"Ms. Suriya has just asked for the private wellness coach consultation. Before you react, you want to be sure exactly what she's asking for.", correct:'understanding', wrongs:['responding','deciding']},
  {cue:"You know that consultation isn't part of her Serenity Retreat package, but you don't want to shut the request down on the spot.", correct:'responding', wrongs:['understanding','deciding']},
  {cue:"You've checked her entitlement, and now you need to tell her the final outcome.", correct:'deciding', wrongs:['understanding','responding']}
];

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
const MODEL_DECISION = 'We agreed to decline the free wellness coach consultation, since it is exclusive to the Balance & Renewal package. To keep Ms. Suriya feeling genuinely valued, the Coordinator offered a complimentary short wellness check-in with the coach plus a real upgrade elsewhere in her current package, and the Manager approved it on the spot so the response could go out the same day.';

/* Role-lock wrapper (see js/role-lock.js) — a real 3-party information gap
   for Section 9. Each of the three roles gets a private brief with a real
   priority/walk-away point AND one fact the other two don't have, turning
   the old solo multiple-choice decision into a genuine negotiation where
   no single student has the full picture. POLICY_CARD and THE_REQUEST
   above stay shared/public (plausibly known to all three going in). */
const S6B_ROLES = {
  guest: {
    label: "I'm Ms. Suriya (the Guest)",
    heading: 'Ms. Suriya — Private Brief',
    instructions: "Read your private thoughts below, then negotiate with the Coordinator and Manager out loud. Don't share this screen — describe your position in your own words instead.",
    body: "Your real priority is feeling like a genuinely valued guest, not the specific coach session itself. You'd accept a real alternative that makes you feel prioritized, but not a token gesture that feels like being brushed off. One thing the others don't know: you're considering booking the resort's full-week Renewal Journey package for your whole family next year, and how this request is handled will affect that decision."
  },
  staff: {
    label: "I'm the Guest Relations Coordinator",
    heading: 'Guest Relations Coordinator — Private Brief',
    instructions: "Read your private authority below, then negotiate with the Guest and Manager out loud. Don't share this screen — describe your position in your own words instead.",
    body: "You can offer a complimentary short wellness check-in or a treatment upgrade elsewhere in her current package without approval, but you cannot offer the paid coach consultation itself or change her package tier without your Manager's sign-off. One thing the others don't know: the wellness coach's schedule is fully booked for the rest of this week anyway, so even an approved session couldn't happen until next week at the earliest."
  },
  manager: {
    label: "I'm the Spa Manager",
    heading: 'Spa Manager — Private Brief',
    instructions: "Read your private context below, then negotiate with the Guest and Coordinator out loud. Don't share this screen — describe your position in your own words instead.",
    body: "You have the authority to approve a one-time exception or a discounted coach session if you judge it protects the guest relationship. One thing the others don't know: this is the third request this month for services outside a guest's booked tier, and ownership is watching whether tier boundaries are being held consistently, so the resolution needs to protect that consistency, not just satisfy this one guest."
  }
};

/* ===== Section 8: Speaking Practice — Negotiate in Character =====
   Now a 3-role performance matching the 3-party negotiation in Section 9,
   using the dynamic Object.keys(ROLEPLAY_CARDS) tab pattern already proven
   in Units 11 and 14 (replacing the old hardcoded 2-tab version). */
const ROLEPLAY_CARDS = {
  staff:{title:'Role Card A: Guest Relations Coordinator', body:'You must find a compromise that respects the package tiers.',
    role:"Propose a genuine compromise, referencing policy, without revealing the coach's full schedule to the guest.",
    phrases:["After reviewing this, I think we should…", "Unfortunately, our policy doesn't allow…", 'What I can offer instead is…', "Let me check with our Manager before I confirm anything."]},
  guest:{title:'Role Card B: Ms. Suriya (Guest)', body:'You want to feel like a genuinely valued guest, not just told no.',
    role:"Explain what matters most to you, and push back once politely if the first offer feels like a brush-off.",
    phrases:['We were hoping for something more personal.', 'Is there anything else you could offer?', "That could work, if it feels genuine.", 'Thank you for hearing me out.']},
  manager:{title:'Role Card C: Spa Manager', body:'You must approve a compromise that protects both the guest relationship and tier consistency.',
    role:'Listen to both sides, then approve or adjust the compromise being proposed.',
    phrases:["Let's make sure this works for everyone.", 'I can approve that, as long as…', 'We value every guest, at every tier.', "Let's confirm this in writing today."]}
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

/* ===================== TEACHER GUIDE (courses/wellness/unit-13/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Unit 13: A Guest\'s Difficult Request',
  learningOutcome: 'Each of three students reads a private brief with a real priority and one fact the other two don\'t have, then negotiates a fair outcome out loud — a genuine EVALUATE-level negotiation with real information asymmetry, not a solo decision or a duologue.',
  bloomsLevel: 'Evaluate',
  addieFocus: 'A real 3-party negotiation: the Guest, the Coordinator, and the Manager each see only their own private brief. No one role has enough information alone to reach the strongest outcome — they must negotiate out loud and combine what each of them knows, which is the actual professional skill (a compromise no single person could have proposed alone).',
  grouping: 'Groups of 3, each member on their own device or browser tab for Section 9 (Negotiate the Outcome) — this is now technically enforced, not just instructed.',
  timing: [
    {block:'Warm-Up: A Guest Wants More', time:'15 min', ref:'Section 1'},
    {block:'Key Vocabulary', time:'15 min', ref:'Section 2'},
    {block:'Choose and Defend', time:'10 min', ref:'Section 3'},
    {block:'Vocabulary Activities', time:'20 min', ref:'Section 4'},
    {block:'Reading', time:'15 min', ref:'Section 5'},
    {block:'What Would You Say?', time:'10 min', ref:'Section 6'},
    {block:'Listening: The Request', time:'15 min', ref:'Section 7'},
    {block:'After Listening', time:'10 min', ref:'Section 8'},
    {block:'Negotiate the Outcome (3-Party Negotiation)', time:'20 min', ref:'Section 9 — groups of 3, each on a separate device'},
    {block:'Speaking Practice: Negotiate in Character', time:'15 min', ref:'Section 10'},
    {block:'Flashcard Drill, Peer Checklist, Writing, Self-Check', time:'35 min', ref:'Sections 11-14'}
  ],
  materials: [
    'One device per student for Section 9 (the negotiation now requires this — a shared screen defeats the lock)',
    'Speakers or headphones for the listening sections'
  ],
  teacherPrompts: [
    'Before Section 9: "If everyone in your group could read all three briefs, would you still need to talk to each other?"',
    'During Section 9: "Are you sharing what your brief says out loud, or just typing your own conclusion?"',
    'After Section 9: "Which single fact, if the group had known it earlier, would have changed the negotiation the most?"'
  ],
  commonProblems: [
    {problem: 'A group of 3 shares one or two devices for Section 9.', fix: 'Section 9 now locks to one private brief per browser/session — if they share devices, only that many roles can be seen at once, and the picker screen makes this visible immediately. Have each student open the unit on their own phone or laptop before starting Section 9.'},
    {problem: 'A student clicks "Start Over" just to read another role\'s brief.', fix: 'This is visible and expected for solo practice, but the copy in the picker and the Start Over footer both say plainly that doing this outside a real group of 3 defeats the point of the activity — reinforce this verbally when circulating.'},
    {problem: 'Each student writes a slightly different summary of "what we agreed."', fix: 'This is expected, not a bug — there is no shared backend to sync one record across three devices, so each student independently records their own understanding of the negotiated outcome. Minor wording differences are fine; a genuinely contradictory summary is worth discussing as a class.'}
  ],
  fastClassExtension: 'Have groups swap one member with another group and re-negotiate from where the new member\'s prior group left off, using a different final compromise.',
  slowClassCompression: 'Section 3 (Choose and Defend) and Section 8 (After Listening) can be assigned as homework if time is short — neither gates a later section.',
  assessment: 'Speaking (the negotiation and in-character practice, Sections 9-10) and Writing (Section 13) are the two most useful grading points; the self-check in Section 14 is student-reflective, not evaluative.'
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 13: A Guest\'s Difficult Request',
  unitCode: 'unit-13'
};
