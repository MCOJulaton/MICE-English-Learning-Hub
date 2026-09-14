/* ===================== UNIT 14 CONTENT DATA — A GUEST NEEDS HELP =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   multi-audience messaging task, rubric. Nothing here is UI logic — see app.js
   for rendering/state/voice/progress-tracking.

   Bloom's level: EVALUATE → CREATE. This is the unit's major HOTS/group
   performance task, per the instructor's spec: students work in GROUPS,
   listen to a calm response briefing, then must evaluate and select the
   strongest message for each of THREE different audiences (the guest
   herself, her travel companion, and the internal team log), recognizing
   that the same mild incident needs a genuinely different tone and content
   for each. Kept deliberately mild and clinical throughout, never framed as
   a medical emergency: a manageable skin reaction handled calmly and
   professionally. Invented content, part of the Units 9-15 OBE/Bloom's
   expansion, not drawn from the official workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'A Guest Needs Help'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Choose Your Response'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: The Response Briefing'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Three Messages, One Guest'},
  {key:'s8', label:'Speaking Practice'},
  {key:'crossword', label:'Odd One Out'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: A Guest Needs Help =====
   Opens as an incoming alert bulletin instead of a plain facts list, to
   match the urgency of this unit's response-briefing premise. */
const OPENING_SCENARIO = {
  alertLines: [
    'ALERT: Mild Reaction in Treatment Room 3',
    'Time: 10:15 a.m., mid-facial',
    'Guest: mild redness and swelling, companion waiting in lobby'
  ],
  message: 'The therapist calmly pauses the treatment and calls for support.',
  question: 'What should the team do first?',
  options: [
    {text:'Stay calm and reassure the guest immediately.', good:true, note:'Good instinct. A calm, caring response is the very first thing a guest needs.'},
    {text:'Panic and call out loudly for help.', good:false, note:'An extreme reaction that would alarm the guest and everyone nearby.'},
    {text:'Monitor the guest closely and get a cool compress.', good:true, note:'Yes. A practical, caring first step while the situation is assessed.'},
    {text:'Say nothing and hope it goes away on its own.', good:false, note:'Silence during a visible reaction usually makes a guest more anxious, not less.'},
    {text:'Let the spa manager know right away.', good:true, note:'Exactly right. Getting the manager informed quickly helps everyone respond well.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'8:00', point:'Treatment room readiness check', where:'All products checked and labeled'},
  {time:'8:30', point:'Response roles reviewed', where:'Each staff member knows their role'},
  {time:'9:00', point:'First treatments begin', where:'Spa Wing'},
  {time:'2:00 p.m.', point:'Communication templates ready', where:'Guest, companion, and log versions'},
  {time:'5:00 p.m.', point:'Daily incident log reviewed', where:'Spa Manager\'s Office'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's readiness briefing. At 8 a.m., every treatment room is checked, and all products are checked and labeled. At 8:30, response roles are reviewed, so every staff member knows their role. At 9 a.m., the first treatments begin in the Spa Wing. At 2 p.m., communication templates are ready, guest, companion, and log versions. And at 5 p.m., the daily incident log is reviewed in the Spa Manager's Office.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'respond2', ic:'🤲', nm:'Respond', type:'v.', def:'To react quickly and appropriately to a situation.', ex:'The team responded calmly to the guest\'s discomfort.'},
  {id:'calm2', ic:'😌', nm:'Calm', type:'adj./v.', def:'Not anxious or panicked, or to help someone feel that way.', ex:'Stay calm and reassure the guest first.'},
  {id:'companion', ic:'🧑‍🤝‍🧑', nm:'Companion', type:'n.', def:'A person traveling or staying with a guest.', ex:'Her travel companion is waiting in the lobby.'},
  {id:'discomfort', ic:'😣', nm:'Discomfort', type:'n.', def:'A mild, manageable physical feeling of being unwell.', ex:'She mentioned some discomfort on her cheek.'},
  {id:'monitor', ic:'👀', nm:'Monitor', type:'v.', def:'To watch someone or something carefully over time.', ex:'We monitored the guest for fifteen minutes.'},
  {id:'update2', ic:'🔄', nm:'Update', type:'v./n.', def:'To give someone the newest, correct information.', ex:'I want to give her companion a quick update.'},
  {id:'audience2', ic:'🎯', nm:'Audience', type:'n.', def:'A specific group of people receiving a message.', ex:'Different audiences need different messages.'},
  {id:'deescalate', ic:'🕊️', nm:'De-escalate', type:'v.', def:'To make a tense or worrying situation calmer.', ex:'A calm voice can de-escalate a worried guest quickly.'},
  {id:'transparent2', ic:'🔍', nm:'Transparent', type:'adj.', def:'Open and honest, not hiding information.', ex:'Being transparent in the incident log helps prevent it happening again.'},
  {id:'incident', ic:'📋', nm:'Incident', type:'n.', def:'An event, usually minor, that needs to be noted and handled.', ex:'Every incident is recorded in the daily log.'}
];
const VOCAB_SECONDARY = [
  {id:'compress', nm:'Cool Compress', def:'A cool, damp cloth used to soothe mild skin irritation.'},
  {id:'reassure3', nm:'Reassure', def:'To say or do something to reduce someone\'s worry.'},
  {id:'protocol2', nm:'Protocol', def:'The official set of steps to follow in a specific situation.'},
  {id:'briefing2', nm:'Briefing', def:'A short meeting to share important information quickly.'},
  {id:'tone2', nm:'Tone', def:'The feeling or attitude a message gives, such as calm, formal, or caring.'}
];

/* ===== Section 2b: Choose Your Response (Evaluate-level decision cards) =====
   Same situation and objective as before, presented as decision cards
   without sentence-starter scaffolding, matching the reduced scaffolding
   already introduced at Unit 13's Evaluate level. */
const CRISIS_DECISION = {
  facts: [
    'The guest\'s discomfort has lasted about 10 minutes so far.',
    'A cool compress is helping, but her cheek is still slightly swollen.',
    'Her travel companion has just asked the front desk what is happening.'
  ],
  question: 'What should the team do right now? Choose a response, then defend it.',
  options: [
    {text:'Give the companion a brief, honest, calm update.'},
    {text:'Refuse to tell the companion anything at all.'},
    {text:"Make promises about the cause before it's confirmed."},
    {text:'Ignore the companion completely and walk away.'}
  ],
  weakIndex: 3
};

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'respond2', word:'Respond', meaning:'To react quickly and appropriately to a situation'},
  {id:'calm2', word:'Calm', meaning:'Not anxious or panicked, or to help someone feel that way'},
  {id:'companion', word:'Companion', meaning:'A person traveling or staying with a guest'},
  {id:'discomfort', word:'Discomfort', meaning:'A mild, manageable physical feeling of being unwell'},
  {id:'monitor', word:'Monitor', meaning:'To watch someone or something carefully over time'},
  {id:'deescalate', word:'De-escalate', meaning:'To make a tense or worrying situation calmer'},
  {id:'transparent2', word:'Transparent', meaning:'Open and honest, not hiding information'},
  {id:'incident', word:'Incident', meaning:'An event, usually minor, that needs to be noted and handled'}
];

const FILL_BLANK = [
  {q:"The team __________ calmly to the guest's discomfort.", a:'responded'},
  {q:'Stay __________ and reassure the guest first.', a:'calm'},
  {q:'Her travel __________ is waiting in the lobby.', a:'companion'},
  {q:'She mentioned some __________ on her cheek.', a:'discomfort'},
  {q:'We __________ the guest for fifteen minutes.', a:'monitored'},
  {q:'A calm voice can __________ a worried guest quickly.', a:'de-escalate'},
  {q:'Being __________ in the incident log helps prevent it happening again.', a:'transparent'},
  {q:'Every __________ is recorded in the daily log.', a:'incident'}
];

const VOCAB_SITUATIONS = [
  {q:'A guest looks worried during a mild reaction. What do you say to reassure her?', model:'"Please stay comfortable, we\'re monitoring this closely, and it\'s already improving."'},
  {q:'A companion asks what happened before you have all the facts. What do you say?', model:'"I can confirm she had a mild reaction. We\'re monitoring her closely and I\'ll update you shortly."'},
  {q:'Your manager needs to know about a minor incident right away. What do you say?', model:'"I need to update you on an incident, a guest had a mild skin reaction during her facial."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Responding to a Guest Incident: One Guest, Many Audiences',
  paragraphs: [
    'When something mild but unexpected happens to a guest during a treatment, the spa team is not just managing a physical situation, they are communicating with several very different people at the same time, often within minutes of each other.',
    'The guest herself needs reassurance above all: a calm, caring voice that tells her she is being looked after and gives her a simple sense of what happens next. Clinical language or worried faces only add to her discomfort.',
    'A waiting companion needs something different: a brief, honest update, delivered promptly, that respects their concern without over-explaining medical detail that isn\'t theirs to know in full.',
    'The internal team log needs the most precise version of all: a clear, transparent record of exactly what happened, what was done, and what should change going forward, since anything written here helps prevent the same thing happening to another guest.',
    'What connects all three messages is honesty and genuine care, delivered with the tone that specific person actually needs. For MICE event teams, this same skill applies to a delegate feeling unwell during a session: the delegate, their colleague, and the event log all need a message crafted for them specifically, not one generic response.'
  ]
};
const READING_QUESTIONS = [
  {q:'What does the guest herself need most, according to the article?', opts:['Clinical medical language','Calm reassurance and a simple sense of what happens next','Nothing, silence is best'], correct:1},
  {q:'How is a message to a waiting companion different from a message to the guest?', opts:['It should be identical','A brief, honest update that doesn\'t over-explain private medical detail','It should be much longer'], correct:1},
  {q:'What makes the internal team log different from the other two messages?', opts:['It should be vague to avoid blame','A clear, transparent record of what happened and what should change','It should never be written down'], correct:1},
  {q:'What connects all three types of messages, according to the article?', opts:['Using exactly the same words each time','Honesty and genuine care, delivered in the right tone for that person','Avoiding the topic completely'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  reassuring:{title:'Reassuring the Guest', items:[
    "Please stay comfortable, we're looking after you.",
    'This is mild, and it\'s already improving.',
    'We\'re monitoring this closely.',
    'Your comfort is our top priority.'
  ]},
  updating:{title:'Updating the Companion', items:[
    'I wanted to give you a quick update.',
    "Here's what happened, and what we're doing.",
    "She's comfortable, and our therapist is with her.",
    "I'll let you know as soon as there's more news."
  ]},
  logging:{title:'Writing the Incident Log', items:[
    'Incident summary:…',
    'Action taken:…',
    'Guest condition:…',
    'Recommendation to prevent recurrence:…'
  ]}
};

/* ===== Section 6: Listening Script — "The Response Briefing" =====
   Two characters: Nueng (therapist) and Orn (spa manager), on radio. */
const BEFORE_LISTEN = {
  setup: 'Nueng and Orn coordinate the response to the guest\'s reaction over radio. Listen and find out what caused it and what the plan is.',
  guesses: [
    'A guest accidentally touched the wrong product herself.',
    'A new exfoliating product likely caused a mild reaction.',
    'Nothing happened, it was a false alarm.',
    'It was a planned test, not a real reaction.'
  ]
};
const LISTEN = {
  intro: 'Treatment Room 3. Therapist Nueng radios spa manager Orn the moment she notices the guest\'s reaction.',
  lines: [
    {who:'Nueng', text:'Orn, this is Nueng. My guest in Room 3 has some redness and mild swelling on her cheek. What should I do?', kind:'staff'},
    {who:'Orn', text:'Stay calm and pause the treatment. Which product did you use most recently?', kind:'delegate'},
    {who:'Nueng', text:'A new exfoliating scrub, it was added to our kit yesterday.', kind:'staff'},
    {who:'Orn', text:'Okay, that could be the cause. Get a cool compress for her right away, and reassure her, it\'s mild and it should settle quickly.', kind:'staff'},
    {who:'Nueng', text:'Should I let her companion know? She mentioned waiting in the lobby.', kind:'staff'},
    {who:'Orn', text:'Yes, keep it simple and honest with her too. Mild reaction, being monitored closely, more news soon. Nothing more confirmed than that yet.', kind:'delegate'},
    {who:'Nueng', text:'Understood. I\'ll monitor her for fifteen minutes and update you.', kind:'staff'},
    {who:'Orn', text:'Good. I\'ll start the incident log now, and I\'ll flag that new product for a patch test before we use it again.', kind:'delegate'},
    {who:'Nueng', text:'Thanks, Orn. Talking to her now.', kind:'staff'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does Nueng notice on the guest?', opts:['A headache','Redness and mild swelling on her cheek','A sprained ankle'], correct:1},
  {q:'What product does Orn suspect caused the reaction?', opts:['The regular facial cream','A new exfoliating scrub added yesterday','Sunscreen'], correct:1},
  {q:'What does Orn tell Nueng to get for the guest?', opts:['A glass of juice','A cool compress','A bandage'], correct:1},
  {q:'What does Orn say to tell the companion?', opts:['Nothing at all','Mild reaction, being monitored closely, more news soon','The full medical details'], correct:1},
  {q:'What does Orn plan to do to prevent this happening again?', opts:['Nothing, it was a one-time issue','Start the incident log and flag the product for a patch test','Stop offering facials completely'], correct:1}
];

/* ===== Section 6, continued: The Announcement (monologue broadcast) =====
   A genuine single-voice broadcast, matching this unit's calm-response
   framing more literally than the 2-person Nueng/Orn radio call above:
   Orn's brief PA reassurance to the spa lounge, added rather than
   replacing the valuable 2-voice coordination dialogue. */
const BROADCAST = {
  text: "Good morning, everyone. We'd like to let you know that one of our guests is receiving some extra care and attention from our team right now, and everything is well in hand. Please continue to enjoy your treatments, and thank you for your understanding."
};
const BROADCAST_QUESTIONS = [
  {q:'What does Orn ask other guests to do while the situation is handled?', opts:['Leave the spa immediately','Continue enjoying their treatments','Come to Treatment Room 3'], correct:1},
  {q:'Does Orn give specific medical details in the announcement?', opts:['Yes, full details','No, she keeps it general and reassuring','She refuses to say anything'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Staying calm and reporting facts clearly', example:'"My guest in Room 3 has some redness and mild swelling."'},
  {strategy:'Asking a precise question to narrow down the cause', example:'"Which product did you use most recently?"'},
  {strategy:'Giving a simple, caring instruction', example:"\"Get a cool compress for her right away, and reassure her.\""},
  {strategy:'Keeping the message simple and honest for the companion too', example:'"Keep it simple and honest with her too."'},
  {strategy:'Turning the incident into a genuine prevention step', example:"\"I'll flag that new product for a patch test before we use it again.\""}
];

/* ===== Section 6b: Three Messages, One Guest (Crisis Timeline) =====
   GROUP task: a 4-round ESCALATING timeline, not four independent choice
   groups shown at once. Round 2 only unlocks once Round 1 is answered with
   its strong option, Round 3 only unlocks once Round 2 is resolved, and
   Round 4 (the next-morning follow-up) only unlocks once Round 3 is
   resolved. Completed rounds stay visible above the current one (read-only,
   with their feedback) rather than being replaced, the group must keep
   their story consistent as the situation resolves. Mirrors MICE Unit 14's
   own Crisis Timeline mechanic exactly (see js/app.js renderS6b/wireS6b). */
const AUDIENCE_MESSAGES = {
  guest:{
    title:'Audience 1: The Guest Herself',
    options:[
      {text:'"Ms. Delacroix, I can see you\'re a little uncomfortable. This is a mild reaction, you\'re going to be just fine. Let\'s get you a cool cloth and some water right away."', quality:'strong', note:'Calm, warm, and reassuring, exactly what a guest experiencing discomfort needs to hear.'},
      {text:'"Oh no, this looks really bad, I\'m so sorry, I don\'t know what to do."', quality:'weak', note:'This sounds panicked and unprofessional, likely to increase her worry rather than reduce it.'},
      {text:'"It\'s nothing, don\'t worry about it."', quality:'weak', note:'This dismisses a real, visible discomfort instead of acknowledging and caring for it.'}
    ]
  },
  companion:{
    title:'Audience 2: Her Travel Companion',
    options:[
      {text:'"Hi, I wanted to let you know your friend had a mild skin reaction during her treatment. She\'s comfortable now and our therapist is with her, I\'ll bring you to her in just a moment."', quality:'strong', note:'Honest, calm, and specific, exactly what a concerned companion deserves, without oversharing medical detail.'},
      {text:'"There\'s been an emergency, please come quickly!"', quality:'weak', note:'This is alarmist and imprecise, likely to cause unnecessary panic for a mild, manageable situation.'},
      {text:'"Everything is fine, no need to check on her."', quality:'weak', note:'Too vague and dismissive when the companion has specifically asked, this can feel evasive.'}
    ]
  },
  log:{
    title:'Audience 3: The Internal Incident Log',
    options:[
      {text:'"Incident log: guest had a mild skin reaction, likely linked to the new exfoliating product. Cool compress applied, guest comfortable and monitored for 15 minutes. Recommend patch-testing this product for all guests going forward."', quality:'strong', note:'Factual, transparent, and includes a genuine prevention step, exactly right for an internal record.'},
      {text:'"Nothing to report."', quality:'weak', note:'This fails to document a real incident, losing valuable information that could prevent it happening again.'},
      {text:'"The therapist made a mistake, this shouldn\'t be logged to avoid trouble."', quality:'weak', note:'Hiding an incident is unprofessional and unethical, and it removes any chance of preventing a repeat.'}
    ]
  },
  followup:{
    title:'Audience 4: Next-Morning Check-In (Round 4 — Ms. Delacroix)',
    options:[
      {text:'"Honestly, we were quite worried about you yesterday, that reaction looked pretty alarming at the time!"', quality:'weak', note:'This undercuts the calm reassurance given the day before and makes the situation sound worse in hindsight than it was presented in the moment.'},
      {text:'"Good morning, Ms. Delacroix. I wanted to check in, how is your skin feeling today? Please let us know if you\'d like a complimentary follow-up treatment."', quality:'strong', note:'Warm, brief, and consistent with the earlier reassurance, it closes the loop with genuine care without dwelling on the incident.'},
      {text:'"Please note that our records show the reaction was fully resolved as of yesterday evening, and no further action is required on our part."', quality:'weak', note:'Technically fine, but far too formal and cold for a personal check-in the morning after, it reads like a legal disclaimer, not a caring follow-up.'}
    ]
  }
};

/* Order the four rounds resolve in, for the Crisis Timeline mechanic
   (see js/app.js renderS6b/wireS6b) — each round only unlocks once the
   previous one is answered with its strong option, and prior rounds stay
   visible (read-only) rather than being replaced. */
const CRISIS_ROUND_ORDER = ['guest', 'companion', 'log', 'followup'];

/* ===== Section 8: Speaking Practice — Team Relay (3 roles) =====
   Group of 3, matching this unit's 3-audience s6b task exactly: a genuine
   3-role speaking mechanic instead of a 2-role role-play relabeled as
   "group" work, mirroring MICE Unit 14's own 3-role upgrade. */
const ROLEPLAY_CARDS = {
  therapist:{title:'Role Card A: Therapist', body:'You must reassure the guest directly.',
    role:'Deliver the guest reassurance calmly and clearly to the group.',
    phrases:['I can see you\'re uncomfortable…', 'This is mild, and it\'s improving…', 'Let\'s get you a cool cloth…', 'We\'re monitoring this closely.']},
  manager:{title:'Role Card B: Spa Manager', body:'You must update the waiting companion.',
    role:'Deliver the companion update warmly and honestly, then answer one question.',
    phrases:['I wanted to update you.', "She's comfortable now.", 'Our therapist is with her.', 'Is there anything else I can explain?']},
  logger:{title:'Role Card C: Duty Supervisor', body:'You must report the incident for the official log.',
    role:'Report the incident summary clearly and factually, as if dictating the log entry.',
    phrases:['Incident summary:…', 'Action taken:…', 'Guest condition:…', 'Recommendation to prevent recurrence:…']}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'The discomfort lasts longer than expected, 30 minutes instead of 15. Update all three audiences again.'},
  {tag:'Scenario 2', text:'The guest posts about the reaction on social media before your update reaches the companion. How does this change your approach?'},
  {tag:'Scenario 3', text:'A second guest reports a similar mild reaction the same afternoon. Is this now a pattern? What do you say to the spa manager?'}
];

/* ===== Odd One Out (Remember-level review, replaces the crossword slot) =====
   Three words share a category, one doesn't, the odd word is called out
   explicitly below so the "why" always teaches something on reveal. */
const ODD_ONE_OUT = [
  {words:['Respond','Monitor','Discomfort','De-escalate'], odd:'Discomfort', why:'Discomfort is a feeling. The others are all actions someone takes.'},
  {words:['Companion','Audience','Incident','Transparent'], odd:'Transparent', why:'Transparent describes a quality. The others are all nouns naming a person, group, or event.'}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they choose a genuinely different message for each audience?',
  'Was the guest message warm and reassuring?',
  'Was the companion message honest and appropriately brief?',
  'Was the incident log factual and transparent?',
  'Did they explain WHY each message fits its audience?',
  'Did their language sound calm and organized, not panicked?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'A guest feels briefly light-headed after a hot yoga class. Draft messages for the guest, her companion, and the internal log.'},
  {tag:'Situation B', text:'A guest has a minor allergic itch after trying a new herbal tea in the wellness lounge. Draft messages for the guest, a nearby friend, and the internal log.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Choose ONE audience (the guest, a companion, or the internal log) and write your own original message (4–6 sentences) for a NEW situation: a guest feels mildly dizzy after a sauna session.',
  discussion: [
    {title:'Tourism Business Management', text:'A conference delegate feels unwell during a session due to the heat. Choose one audience and write your message.'},
    {title:'Wellness Tourism Management', text:'A guest has a minor reaction to a new herbal foot soak during a group wellness activity. Choose one audience and write your message.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Response Vocabulary', sub:'I can use respond, monitor, transparent, and incident correctly.'},
  {k:'audiences', lbl:'Recognizing Different Audiences', sub:'I understand that a guest, a companion, and an internal log need different messages.'},
  {k:'evaluate', lbl:'Evaluating Messages', sub:'I can evaluate which message is strongest for a specific audience.'},
  {k:'create', lbl:'Creating an Original Message', sub:'I can create my own clear, appropriate message for a new situation.'},
  {k:'group', lbl:'Working as a Group', sub:'I contributed to my group\'s discussion and decisions.'}
];

const TEACHER_GUIDE = {
  unit: 'Unit 14: A Guest Needs Help',
  learningOutcome: 'Groups respond to a mild guest incident across four rounds, each revealing a new audience, and can only advance by choosing the message that stays consistent with what they already said — a genuine EVALUATE→CREATE synthesis task, not three unconnected multiple-choice picks.',
  bloomsLevel: 'Evaluate → Create',
  addieFocus: 'A real progressive reveal: Round 2 (the Companion) only unlocks once Round 1 (the Guest) is answered correctly, Round 3 (the Internal Log) only unlocks once Round 2 is resolved, and Round 4 (the next-morning check-in) only unlocks once Round 3 is resolved. Prior rounds stay visible above the current one, so the group must keep their story consistent as the situation resolves, instead of picking three isolated "best answers" with no memory of what came before.',
  grouping: 'Groups of 3-4, one shared device per group is fine here — unlike Units 10-13, this section has no private information to protect, so nothing requires separate devices.',
  timing: [
    {block:'Warm-Up: A Guest Needs Help', time:'15 min', ref:'Section 1'},
    {block:'Key Vocabulary', time:'15 min', ref:'Section 2'},
    {block:'Choose Your Response', time:'10 min', ref:'Section 3'},
    {block:'Vocabulary Activities', time:'20 min', ref:'Section 4'},
    {block:'Reading', time:'15 min', ref:'Section 5'},
    {block:'Useful Phrases', time:'10 min', ref:'Section 6'},
    {block:'Listening: The Response Briefing', time:'15 min', ref:'Section 7'},
    {block:'After Listening', time:'10 min', ref:'Section 8'},
    {block:'Three Messages, One Guest (4-Round Timeline)', time:'20 min', ref:'Section 9'},
    {block:'Speaking Practice: Team Relay', time:'15 min', ref:'Section 10'},
    {block:'Odd One Out, Peer Checklist, Writing, Self-Check', time:'35 min', ref:'Sections 11-14'}
  ],
  materials: [
    'One shared device per group is sufficient for Section 9 (no private information here, unlike Units 10-13)',
    'Speakers or headphones for the listening sections'
  ],
  teacherPrompts: [
    'Before Round 2: "Does your Round 1 message to the guest change what you can honestly say to the companion now?"',
    'Before Round 4: "The guest already heard your Round 1 reassurance, does your next-morning check-in match the tone you set there?"',
    'After Section 9: "If the discomfort had lasted 30 minutes instead of 15, which of your four messages would need to change the most?"'
  ],
  commonProblems: [
    {problem: 'A group picks a weak option and doesn\'t understand why the timeline didn\'t advance.', fix: 'This is the intended mechanic, not a bug — a weak pick shows feedback but stays on the same round. Point them back to the feedback text explaining why that option was weak, then have them try again.'},
    {problem: 'A group treats each round as unrelated to the last.', fix: 'Prompt them to re-read the completed round above before answering the new one — the whole point of the timeline is that later messages must stay consistent with earlier ones.'}
  ],
  fastClassExtension: 'After Round 4, ask groups to imagine a second guest reports a similar reaction the next day and draft a fifth message that addresses the pattern, not just the single incident.',
  slowClassCompression: 'Section 3 (Choose Your Response) and Section 8 (After Listening) can be assigned as homework if time is short — neither gates a later section.',
  assessment: 'Speaking (the Team Relay performance, Section 10) and Writing (Section 13, a brand-new situation) are the two most useful grading points; the self-check in Section 14 is student-reflective, not evaluative.'
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 14: A Guest Needs Help',
  unitCode: 'unit-14'
};
