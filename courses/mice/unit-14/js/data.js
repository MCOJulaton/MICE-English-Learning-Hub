/* ===================== UNIT 14 CONTENT DATA — EVENT DAY CRISIS: THE POWER OUTAGE =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   multi-audience messaging task, rubric. Nothing here is UI logic — see app.js
   for rendering/state/voice/progress-tracking.

   Bloom's level: EVALUATE → CREATE. This is the unit's major HOTS/group
   performance task, per the instructor's spec: students work in GROUPS,
   listen to a crisis briefing, then must evaluate and select the strongest
   message for each of THREE different audiences (delegates, VIP sponsors,
   the press), recognizing that the same crisis needs a genuinely different
   tone and content for each. Invented content, part of the Units 9-15
   OBE/Bloom's expansion, not drawn from the official workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'The Lights Go Out'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Choose Your Response'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: The Crisis Briefing'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Three Messages, One Crisis'},
  {key:'s8', label:'Speaking Practice'},
  {key:'crossword', label:'Odd One Out'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: The Lights Go Out =====
   Opens as an incoming alert bulletin instead of a plain facts list, to
   match the urgency of this unit's crisis premise. */
const OPENING_SCENARIO = {
  alertLines: [
    'ALERT: Power Outage in Ballroom A',
    'Time: 9:42 a.m., mid-keynote',
    'Affected: approx. 800 delegates, several VIP sponsors, 3 journalists present'
  ],
  message: 'The power has gone out, and everyone is looking at the event team.',
  question: 'What should the team do first?',
  options: [
    {text:'Stay calm and check what caused the outage.', good:true, note:"Good instinct. You can't respond well until you know what's actually happening."},
    {text:'Panic and run toward the exit.', good:false, note:'An extreme reaction that would spread panic through the whole room.'},
    {text:'Reassure the room with a calm, brief announcement.', good:true, note:'Yes. Even without all the answers yet, calm reassurance helps immediately.'},
    {text:"Say nothing and hope it fixes itself quickly.", good:false, note:'Silence during a visible problem usually makes people more anxious, not less.'},
    {text:"Contact the venue's technical team immediately.", good:true, note:'Exactly right. Getting the real experts involved fast is essential.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'9:00', point:'Emergency roles assigned', where:'Each staff member knows their role'},
  {time:'9:15', point:'Backup systems tested', where:'Generator and battery signage checked'},
  {time:'9:30', point:'Crisis communication templates ready', where:'Delegate, sponsor, and press versions'},
  {time:'9:45', point:'Final briefing before doors open', where:'All staff confirm readiness'},
  {time:'10:00', point:'Event begins', where:'Normal operations'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's crisis-readiness briefing. At 9 a.m., emergency roles are assigned, so every staff member knows their role. At 9:15, backup systems are tested, the generator and battery signage are checked. At 9:30, crisis communication templates are ready, delegate, sponsor, and press versions. At 9:45, we have a final briefing before doors open, so all staff can confirm readiness. And at 10 a.m., the event begins under normal operations.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'outage', ic:'💡', nm:'Outage', type:'n.', def:'A period when power or a service stops working.', ex:'The power outage affected two conference halls.'},
  {id:'backup', ic:'🔋', nm:'Backup', type:'n./adj.', def:'A second system used if the main one fails.', ex:'The backup generator started within two minutes.'},
  {id:'contain', ic:'🧯', nm:'Contain', type:'v.', def:'To stop a problem from getting bigger or spreading.', ex:'The team worked quickly to contain the situation.'},
  {id:'stakeholder', ic:'👥', nm:'Stakeholder', type:'n.', def:'A person or group with an interest in how an event goes.', ex:'Sponsors and delegates are both important stakeholders.'},
  {id:'transparent', ic:'🔍', nm:'Transparent', type:'adj.', def:'Open and honest, not hiding information.', ex:'Being transparent with the press builds trust.'},
  {id:'reassure', ic:'🤲', nm:'Reassure', type:'v.', def:'To say or do something to reduce someone\'s worry.', ex:'Reassure the delegates that the situation is under control.'},
  {id:'statement', ic:'📢', nm:'Statement', type:'n.', def:'An official, prepared message given to explain something.', ex:'The press office prepared an official statement.'},
  {id:'escalate', ic:'📈', nm:'Escalate', type:'v.', def:'To make a manager or higher authority aware of a serious problem.', ex:'Escalate this to the event director immediately.'},
  {id:'resolve', ic:'✅', nm:'Resolve', type:'v.', def:'To successfully deal with and end a problem.', ex:'The technical team resolved the outage within 20 minutes.'},
  {id:'audience', ic:'🎯', nm:'Audience', type:'n.', def:'A specific group of people receiving a message.', ex:'Different audiences need different messages.'}
];
const VOCAB_SECONDARY = [
  {id:'disruption', nm:'Disruption', def:'Something that interrupts an event or plan.'},
  {id:'protocol', nm:'Protocol', def:'The official set of steps to follow in a specific situation.'},
  {id:'briefing', nm:'Briefing', def:'A short meeting to share important information quickly.'},
  {id:'liaison', nm:'Liaison', def:'A person who communicates between two groups, like an event and a sponsor.'},
  {id:'tone', nm:'Tone', def:'The feeling or attitude a message gives, such as calm, formal, or urgent.'}
];

/* ===== Section 2b: Choose Your Response (Evaluate-level decision cards) =====
   Same situation and objective as before, presented as decision cards
   without sentence-starter scaffolding — matching the reduced scaffolding
   already introduced at Unit 13's Evaluate level. */
const CRISIS_DECISION = {
  facts: [
    'The power outage has lasted 8 minutes so far.',
    'Backup generators are starting, but full power is still 5 minutes away.',
    'A journalist is already asking questions.'
  ],
  question: 'What should the team do right now? Choose a response, then defend it.',
  options: [
    {text:'Give the journalist a brief, honest, calm statement.'},
    {text:'Refuse to speak to the journalist at all.'},
    {text:"Make promises about the cause before it's confirmed."},
    {text:'Ignore the journalist completely and walk away.'}
  ],
  weakIndex: 3
};

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'outage', word:'Outage', meaning:'A period when power or a service stops working'},
  {id:'backup', word:'Backup', meaning:'A second system used if the main one fails'},
  {id:'contain', word:'Contain', meaning:'To stop a problem from getting bigger or spreading'},
  {id:'stakeholder', word:'Stakeholder', meaning:'A person or group with an interest in how an event goes'},
  {id:'transparent', word:'Transparent', meaning:'Open and honest, not hiding information'},
  {id:'reassure', word:'Reassure', meaning:'To say or do something to reduce someone\'s worry'},
  {id:'escalate', word:'Escalate', meaning:'To make a manager or higher authority aware of a serious problem'},
  {id:'resolve', word:'Resolve', meaning:'To successfully deal with and end a problem'}
];

const FILL_BLANK = [
  {q:'The power __________ affected two conference halls.', a:'outage'},
  {q:'The __________ generator started within two minutes.', a:'backup'},
  {q:'The team worked quickly to __________ the situation.', a:'contain'},
  {q:'Sponsors and delegates are both important __________.', a:'stakeholders'},
  {q:'Being __________ with the press builds trust.', a:'transparent'},
  {q:'__________ the delegates that the situation is under control.', a:'reassure'},
  {q:'__________ this to the event director immediately.', a:'escalate'},
  {q:'The technical team __________ the outage within 20 minutes.', a:'resolved'}
];

const VOCAB_SITUATIONS = [
  {q:'Delegates look worried during a technical problem. What do you say to reassure them?', model:'"Please remain calm, we are resolving this now, and we expect it to be fixed shortly."'},
  {q:'A journalist asks what happened before you have all the facts. What do you say?', model:'"I can confirm we had a power issue. We will share further details once confirmed."'},
  {q:'Your manager needs to know about a serious problem right away. What do you say?', model:"\"I need to escalate this to you immediately, we have a power outage in Ballroom A.\""}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Crisis Communication: One Event, Many Audiences',
  paragraphs: [
    'When something goes seriously wrong at a MICE event, the event team is not just solving a technical problem, they are communicating with several very different audiences at the same time, often within minutes of each other.',
    'Delegates need reassurance above all: a calm, brief message that tells them the situation is under control and gives them a simple next step, like remaining seated. Long technical explanations only add to their worry.',
    'VIP sponsors and stakeholders need something different: a more personal, detailed update, often delivered one-on-one, that acknowledges the disruption to their investment specifically and promises a proper follow-up.',
    'The press needs the most carefully worded message of all: a short, transparent, professional statement with only confirmed facts, never guesses or blame, since anything said to a journalist may be quoted publicly.',
    'What connects all three messages is honesty and calm confidence, delivered with the tone that specific audience actually needs. For Wellness Tourism events, this same skill applies to a crisis like a sudden weather closure of an outdoor wellness activity: guests, sponsors, and any media present all need a message crafted for them specifically, not one generic announcement.'
  ]
};
const READING_QUESTIONS = [
  {q:'What do delegates need most during a crisis, according to the article?', opts:['A long technical explanation','Calm reassurance and a simple next step','Nothing, silence is best'], correct:1},
  {q:'How is a message to VIP sponsors different from a message to delegates?', opts:['It should be identical','It should be more personal, detailed, and often delivered one-on-one','It should be much shorter'], correct:1},
  {q:'What makes a press statement different from the other two messages?', opts:['It can include guesses about the cause','It must be carefully worded with only confirmed facts, since it may be quoted publicly','It should include blame'], correct:1},
  {q:'What connects all three types of messages, according to the article?', opts:['Using exactly the same words each time','Honesty and calm confidence, delivered in the right tone for that audience','Avoiding the topic completely'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  reassuring:{title:'Reassuring Delegates', items:[
    'Please remain calm, we are resolving this now.',
    'Thank you for your patience.',
    'We expect power to be restored shortly.',
    'Your safety is our top priority.'
  ]},
  updating:{title:'Updating Sponsors and VIPs', items:[
    'I wanted to personally update you.',
    "Here is exactly what happened, and what we're doing.",
    'We sincerely apologize for the disruption.',
    'We will follow up with you directly afterward.'
  ]},
  statement:{title:'Speaking to the Press', items:[
    'Here is our official statement.',
    'We are actively resolving the situation.',
    'We will share more details once confirmed.',
    'Thank you for your understanding.'
  ]}
};

/* ===== Section 6: Listening Script — "The Crisis Briefing" =====
   Two characters: Kob (Event Director) and Fai (Technical Lead), on radio. */
const BEFORE_LISTEN = {
  setup: 'Kob and Fai coordinate the response to the power outage over radio. Listen and find out what caused it and what the plan is.',
  guesses: [
    'A visitor accidentally unplugged a cable.',
    'A main breaker tripped from overloaded equipment.',
    'The whole city lost power.',
    'It was a planned test, not a real problem.'
  ]
};
const LISTEN = {
  intro: 'Backstage, Ballroom A. Event Director Kob radios Technical Lead Fai the moment the lights go out.',
  lines: [
    {who:'Kob', text:'Fai, this is Kob. We just lost power in Ballroom A, mid-keynote. What do you see on your end?', kind:'staff'},
    {who:'Fai', text:'Checking now… it looks like the main breaker tripped, probably overloaded from the extra AV equipment we added this morning.', kind:'delegate'},
    {who:'Kob', text:'Can we contain it and get backup power running?', kind:'staff'},
    {who:'Fai', text:'Yes, the backup generator is starting now, that will give us emergency lighting within a minute. Full power once we reset the breaker, about five minutes.', kind:'delegate'},
    {who:'Kob', text:'Good. I need to make an announcement to reassure the room right now, and I have a journalist here already asking questions.', kind:'staff'},
    {who:'Fai', text:'Keep it simple and honest with both. Overloaded breaker, backup power is on, full power in about five minutes. Nothing more confirmed than that yet.', kind:'delegate'},
    {who:'Kob', text:'Understood. I\'ll escalate to the event director\'s office too, just so they\'re not surprised if this makes the news.', kind:'staff'},
    {who:'Fai', text:'Good call. I\'ll radio you the moment it\'s fully resolved.', kind:'delegate'},
    {who:'Kob', text:'Thanks, Fai. Talk soon.', kind:'staff'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What caused the power outage, according to Fai?', opts:['A city-wide blackout','The main breaker tripped from overloaded AV equipment','A visitor unplugged a cable'], correct:1},
  {q:'How long until emergency lighting comes on from the backup generator?', opts:['About one minute', 'About five minutes', 'About thirty minutes'], correct:0},
  {q:'How long until full power is expected to be restored?', opts:['One minute', 'About five minutes', 'About one hour'], correct:1},
  {q:'What two things does Kob need to do right after this call?', opts:['Nothing, he can wait','Make an announcement and speak briefly with a journalist','Cancel the rest of the event'], correct:1},
  {q:'What does Fai advise Kob to say to both the room and the journalist?', opts:['Nothing at all','Something simple and honest: cause, backup status, and expected time','A long technical explanation'], correct:1}
];

/* ===== Section 6, continued: The Announcement (monologue broadcast) =====
   A genuine single-voice broadcast, matching this unit's "radio briefing"
   framing more literally than the 2-person Kob/Fai call above — Kob's
   actual PA announcement to the ballroom, added rather than replacing the
   valuable 2-voice investigative dialogue. */
const BROADCAST = {
  text: 'Ladies and gentlemen, may I have your attention please. We are currently experiencing a brief power issue in Ballroom A. Our technical team is already resolving it, and we expect power to be fully restored within the next five minutes. Please remain in your seats, and thank you very much for your patience.'
};
const BROADCAST_QUESTIONS = [
  {q:'What does Kob ask the room to do while power is restored?', opts:['Move to another room','Remain in their seats','Leave the building'], correct:1},
  {q:'How long does Kob say power will take to be fully restored?', opts:["About five minutes","About thirty minutes","He doesn't say"], correct:0}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Getting the real facts before communicating anything', example:'"What do you see on your end?"'},
  {strategy:'Asking directly whether the problem can be contained', example:'"Can we contain it and get backup power running?"'},
  {strategy:'Planning to reassure and inform at the same time', example:'"I need to make an announcement to reassure the room right now."'},
  {strategy:'Keeping the message simple and honest for every audience', example:'"Keep it simple and honest with both."'},
  {strategy:'Escalating proactively, before being asked', example:"\"I'll escalate to the event director's office too, just so they're not surprised.\""}
];

/* ===== Section 6b: Three Messages, One Crisis =====
   GROUP task: for each of three audiences (delegates, sponsors, press),
   students evaluate three candidate messages and select the strongest one,
   recognizing that the same facts need a genuinely different message for
   each audience. This is Unit 14's distinct mechanic and its major HOTS
   group performance task. */
const AUDIENCE_MESSAGES = {
  delegates:{
    title:'Audience 1: Delegates in the Room',
    options:[
      {text:'"Ladies and gentlemen, please remain calm. We are experiencing a brief power issue and our technical team is resolving it now. We expect power back within a few minutes. Thank you for your patience."', quality:'strong', note:'Calm, clear, honest, and gives a simple expectation, exactly what a worried room needs.'},
      {text:'"Everyone, there\'s been a serious problem, we don\'t know how long this will take, please stay in your seats."', quality:'weak', note:'This sounds alarming and vague, likely to increase anxiety rather than reduce it.'},
      {text:'"Nothing to worry about, everything is totally fine!"', quality:'weak', note:"This isn't honest, the lights are visibly out, and dismissing it can feel insincere."}
    ]
  },
  sponsors:{
    title:'Audience 2: VIP Sponsors',
    options:[
      {text:'"Quick note letting you know we had a small hiccup, no big deal, don\'t worry about it."', quality:'weak', note:'Too casual for a VIP relationship, and dismisses their concern instead of acknowledging it.'},
      {text:'"I wanted to personally update you: we\'ve had a brief power outage in Ballroom A. Our technical team is on it, and backup power should be fully restored within 5 minutes. I sincerely apologize for the disruption and will follow up with you directly afterward."', quality:'strong', note:'Personal, specific, honest, and promises real follow-up, exactly what a valued sponsor deserves.'},
      {text:'"There has been a power outage. More information later."', quality:'weak', note:'Too brief and impersonal for a VIP relationship, it reads like a message meant for anyone.'}
    ]
  },
  press:{
    title:'Audience 3: The Press',
    options:[
      {text:'"No comment."', quality:'weak', note:'This looks evasive to a journalist and can make the story seem worse than it is.'},
      {text:'"It\'s not a big deal, please don\'t write about this."', quality:'weak', note:'Trying to control what a journalist writes is unprofessional and rarely works.'},
      {text:'"At approximately 9:42 a.m., Ballroom A experienced a brief power outage. Backup systems activated immediately, and our technical team is actively resolving the issue. We will share further details once confirmed. Thank you for your understanding."', quality:'strong', note:'Factual, transparent, professional, and includes only confirmed information, exactly right for the press.'}
    ]
  }
};

/* ===== Section 8: Speaking Practice — Team Relay (3 roles) =====
   Group of 3, matching this unit's 3-audience s6b task exactly: a genuine
   3-role speaking mechanic instead of a 2-role role-play relabeled as
   "group" work — fixes that mismatch directly, and mirrors Unit 11's
   3-role upgrade for its own group unit. */
const ROLEPLAY_CARDS = {
  director:{title:'Role Card A: Event Director', body:'You must announce the situation to the room.',
    role:'Deliver the delegate announcement calmly and clearly to the group.',
    phrases:['Ladies and gentlemen…', 'Please remain calm…', 'We expect power to be restored…', 'Thank you for your patience.']},
  liaison:{title:'Role Card B: Sponsor Liaison', body:'You must personally update a VIP sponsor.',
    role:'Deliver the sponsor update warmly and personally, then answer one question.',
    phrases:['I wanted to personally update you.', 'I sincerely apologize for the disruption.', 'We will follow up with you directly.', 'Is there anything else I can explain?']},
  press:{title:'Role Card C: Press Officer', body:'You must give an official statement to a journalist.',
    role:'Deliver the press statement clearly and professionally, using only confirmed facts.',
    phrases:['Here is our official statement.', 'We are actively resolving the situation.', 'We will share more details once confirmed.', 'Thank you for your understanding.']}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'The outage lasts longer than expected, 15 minutes instead of 5. Update all three audiences again.'},
  {tag:'Scenario 2', text:'A delegate live-streams the outage on social media before your announcement. How does this change your press statement?'},
  {tag:'Scenario 3', text:'A second, smaller problem happens right after the first is resolved. How do you manage communicating two issues calmly?'}
];

/* ===== Odd One Out (Remember-level review, replaces the crossword slot) =====
   Three words share a category, one doesn't — the odd word is called out
   explicitly below so the "why" always teaches something on reveal. */
const ODD_ONE_OUT = [
  {words:['Outage','Backup','Contain','Stakeholder'], odd:'Stakeholder', why:'Stakeholder is a person or group. The others describe the technical problem itself.'},
  {words:['Reassure','Escalate','Transparent','Resolve'], odd:'Transparent', why:'Transparent describes a quality. The others are all actions someone takes.'}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they choose a genuinely different message for each audience?',
  'Was the delegate message calm and reassuring?',
  'Was the sponsor message personal and detailed?',
  'Was the press message factual and professional?',
  'Did they explain WHY each message fits its audience?',
  'Did their language sound calm and organized, not panicked?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'A sudden thunderstorm forces an outdoor exhibition to move indoors with only 10 minutes\' notice. Draft messages for delegates, exhibitors, and the press.'},
  {tag:'Situation B', text:'A wellness retreat\'s outdoor yoga session must be canceled due to extreme heat. Draft messages for guests, the retreat sponsor, and a local wellness magazine covering the event.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Choose ONE audience (delegates, sponsors, or press) and write your own original message (4–6 sentences) for a NEW crisis: the main stage screen has failed 10 minutes before the keynote.',
  discussion: [
    {title:'Tourism Business Management', text:'A trade fair\'s registration system crashes right as 500 delegates arrive at once. Choose one audience and write your message.'},
    {title:'Wellness Tourism Management', text:'A wellness retreat\'s spa facility has a plumbing failure the morning of a major treatment day. Choose one audience and write your message.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Crisis Communication Vocabulary', sub:'I can use outage, contain, transparent, and resolve correctly.'},
  {k:'audiences', lbl:'Recognizing Different Audiences', sub:'I understand that delegates, sponsors, and press need different messages.'},
  {k:'evaluate', lbl:'Evaluating Messages', sub:'I can evaluate which message is strongest for a specific audience.'},
  {k:'create', lbl:'Creating an Original Message', sub:'I can create my own clear, appropriate message for a new crisis.'},
  {k:'group', lbl:'Working as a Group', sub:'I contributed to my group\'s discussion and decisions.'}
];

/* ===================== ASSETS ===================== */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/mice-u14-hero.jpg', alt:'A large audience seated in a dim conference hall' }
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 14: Event Day Crisis: The Power Outage',
  unitCode: 'unit-14'
};
