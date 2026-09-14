/* ===================== UNIT 9 CONTENT DATA — EXHIBITION BOOTH COMMUNICATION =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   role-play, rubric. Nothing here is UI logic — see app.js for rendering/state/
   voice/progress-tracking.

   Bloom's level: APPLY. Students take language they already know from Units 1-8
   (greetings, client service phrases, professional register) and apply it to a
   new situation: working a trade-exhibition booth, pitching a product, and
   turning a visitor into a lead. This unit is invented content designed for the
   course's OBE/Bloom's progression (Units 9-15), not drawn from the official
   workbook, at the instructor's explicit request. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Mission Brief'},
  {key:'s2', label:'MICE Detectives'},
  {key:'s2b', label:'Good Practice or Needs Work?'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: A Visitor Stops By'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Build Your Pitch'},
  {key:'s8', label:'Speaking Practice'},
  {key:'surprise', label:'Surprise Challenge'},
  {key:'crossword', label:'Vocabulary Race'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'exit', label:'Exit Ticket'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Your First Minute at the Booth =====
   Opens with a concrete situation, same pattern as Units 5/6: a short list of
   facts, a message, and several reasonable (not single-correct) options. */
const OPENING_SCENARIO = {
  facts: [
    'You are working at your company\'s booth at a trade exhibition.',
    'The exhibition hall opens in 15 minutes.',
    'About 3,000 visitors are expected today.',
    'This is your first time working a booth.'
  ],
  message: 'A visitor is walking toward your booth right now.',
  question: 'What should you do?',
  options: [
    {text:'Smile and greet them.', good:true, note:'A warm greeting invites the visitor to stop. Always start here.'},
    {text:'Wait for them to speak first.', good:false, note:'Visitors often need an invitation to start the conversation. Waiting can make you look uninterested.'},
    {text:'Ask an open question, like "Are you looking for something specific today?"', good:true, note:'Good instinct. An open question starts a real conversation instead of a simple yes or no.'},
    {text:'Hand them a brochure immediately, without speaking.', good:false, note:'A brochure without a greeting can feel impersonal. Start with a warm welcome first.'},
    {text:'Introduce yourself and your company.', good:true, note:'Yes. A short, friendly introduction sets a professional tone right away.'}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'8:45', task:'Final booth setup check', person:'All staff'},
  {time:'9:00', task:'Doors open to visitors', person:'All staff'},
  {time:'11:00', task:'First live product demo', person:'Booth Lead'},
  {time:'1:00 p.m.', task:'Lunch rotation begins', person:'Staff Team'},
  {time:'3:00 p.m.', task:'VIP walkthrough', person:'Booth Lead'}
];
const WARMUP_SCRIPT = "Good morning, team! Let's go over today's booth schedule. At 8:45, we'll do a final booth setup check, everyone should be at their stations. At 9:00, the doors open to visitors. At 11:00, we'll run our first live product demo, so make sure the screen is ready. Lunch rotation begins at 1 p.m., please take turns so the booth is never empty. Finally, at 3 p.m., we have a VIP walkthrough, so let's have our best pitch ready.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'exhibitor', ic:'🏬', nm:'Exhibitor', type:'n.', def:'A company that has a booth at an exhibition to show its products.', ex:'Every exhibitor must set up their booth before the hall opens.'},
  {id:'booth', ic:'🧱', nm:'Booth', type:'n.', def:'A small stand or display area at an exhibition.', ex:'Our booth is in Hall B, number 24.'},
  {id:'visitor', ic:'🚶', nm:'Visitor', type:'n.', def:'A person who walks around and visits booths at an exhibition.', ex:'A visitor stopped to ask about our new product.'},
  {id:'pitch', ic:'🎤', nm:'Pitch', type:'n./v.', def:'A short, clear explanation of a product made to attract interest.', ex:'Can you give me your pitch in under a minute?'},
  {id:'lead', ic:'🎯', nm:'Lead', type:'n.', def:'A visitor who shows real interest and might become a customer.', ex:'We collected over twenty leads today.'},
  {id:'brochure', ic:'📄', nm:'Brochure', type:'n.', def:'A printed booklet with information about a product or company.', ex:'Please take a brochure before you go.'},
  {id:'badgescanner', ic:'📇', nm:'Badge Scanner', type:'n.', def:'A device that reads a visitor\'s badge to save their contact information.', ex:'Use the badge scanner to save the visitor\'s details.'},
  {id:'followup', ic:'📧', nm:'Follow Up', type:'v. phr.', def:'To contact someone again after a first meeting.', ex:'I\'ll follow up with you by email next week.'},
  {id:'targetaudience', ic:'👥', nm:'Target Audience', type:'n.', def:'The group of people a product or pitch is designed for.', ex:'Our target audience is hotel and resort managers.'},
  {id:'competitor', ic:'⚔️', nm:'Competitor', type:'n.', def:'Another company offering a similar product or service.', ex:'Our competitor\'s booth is right next to ours this year.'}
];
const VOCAB_SECONDARY = [
  {id:'giveaway', nm:'Giveaway', def:'A free item offered to attract visitors to a booth.'},
  {id:'foottraffic', nm:'Foot Traffic', def:'The number of people walking past or visiting a booth.'},
  {id:'usp', nm:'USP (Unique Selling Point)', def:'The one feature that makes a product different from its competitors.'},
  {id:'boothstaff', nm:'Booth Staff', def:'The team working at a booth during an exhibition.'},
  {id:'qualify', nm:'Qualify (a Lead)', def:'To ask questions and find out if a visitor is a serious potential customer.'}
];

/* ===== Section 2 (revision): MICE Detectives — Find the 10 Differences =====
   Individual visual-mystery reboot of the opening vocabulary activity, per the
   instructor's explicit revision request. Replaces the old click-a-card quiz
   with a spot-the-difference puzzle: the student finds 10 real differences
   between two exhibition-booth photos, and each difference reveals one of
   this unit's 10 target words. Reuses the same 10 words/order as VOCAB above
   rather than duplicating them — VOCAB itself is untouched, since the later
   Vocabulary Race section still reads it directly. Zone coordinates are
   percentages of the image (left/top/width/height), used both as forgiving
   click-hit boxes on Picture B and as the crop window for each word's
   zoomed reveal. */
const PUZZLE_IMAGES = {
  a: '../../../assets/images/mice-u9-puzzle-a.jpg',
  b: '../../../assets/images/mice-u9-puzzle-b.jpg'
};
const PUZZLE_DIFFERENCES = [
  {
    id:'exhibitor', word:'Exhibitor', ic:'🏬',
    zone:{left:38, top:47, width:15, height:9},
    question:'Look at the table in the back. Count the staff. Is it the same in both pictures?',
    def:'A company at an exhibition.',
    ex:'Thailand is an exhibitor.',
    note:'An exhibitor brings a team to run the booth. Picture B has one more team member working at the back table.'
  },
  {
    id:'booth', word:'Booth', ic:'🧱',
    zone:{left:27, top:29, width:28, height:16},
    question:'Look at the big screen. Is it showing the same place?',
    def:"A company's space at an exhibition.",
    ex:'This is our booth.',
    note:"The screen is part of Thailand's booth. In Picture A, it shows Krabi. In Picture B, it shows Wat Arun. The booth's own display changed."
  },
  {
    id:'visitor', word:'Visitor', ic:'🚶',
    zone:{left:0, top:47, width:25, height:34},
    question:"Look at this visitor's jacket. Is it the same color?",
    def:'A person who comes to an exhibition.',
    ex:'The visitor is looking at our booth.',
    note:"This visitor is at the booth in both pictures, but his jacket color is different."
  },
  {
    id:'pitch', word:'Pitch', ic:'🎤',
    zone:{left:56, top:36, width:21, height:19},
    question:'Look at this staff member. What is he doing in each picture?',
    def:'A short presentation to a customer.',
    ex:'I give a short pitch.',
    note:'In Picture A, he is speaking with a microphone. That is a pitch. In Picture B, he is doing something else.'
  },
  {
    id:'lead', word:'Lead', ic:'🎯',
    zone:{left:65, top:56, width:14, height:28},
    question:'Look near the back of the booth. Is there a new visitor?',
    def:'A person who may become a customer.',
    ex:'This visitor is a lead.',
    note:'This visitor only appears in Picture B. She is showing real interest in the booth, so she could be a lead.'
  },
  {
    id:'brochure', word:'Brochure', ic:'📄',
    zone:{left:33, top:64, width:14, height:12},
    question:'Look right next to the brochures on the counter. Is the same item there?',
    def:'A small booklet with information.',
    ex:'Here is our brochure.',
    note:'The stack of brochures is on the counter in both pictures, but the item right next to them is different.'
  },
  {
    id:'badgescanner', word:'Badge Scanner', ic:'📇',
    zone:{left:80, top:43, width:20, height:34},
    question:'Look at the far right side. Is there a machine there?',
    def:'A machine that scans a badge.',
    ex:'Please scan your badge.',
    note:'In Picture A, there is a badge scanner in this corner. In Picture B, it is gone.'
  },
  {
    id:'followup', word:'Follow Up', ic:'📧',
    zone:{left:48, top:57, width:16, height:12},
    question:'Read the small sign on the counter. Is the message the same?',
    def:'To contact a customer again later.',
    ex:'I will follow up tomorrow.',
    note:"The sign's message is different in each picture. A good follow-up message stays just as clear and friendly."
  },
  {
    id:'targetaudience', word:'Target Audience', ic:'👥',
    zone:{left:78, top:26, width:22, height:16},
    question:'Read the words on the green wall. Are they the same?',
    def:'The people you want to reach.',
    ex:'Our target audience is business travelers.',
    note:'The message on the wall is different in each picture. A company chooses words that speak to its target audience.'
  },
  {
    id:'competitor', word:'Competitor', ic:'⚔️',
    zone:{left:0, top:19, width:22, height:14},
    question:'Look at the booth next door. Is it the same country?',
    def:'Another company selling something similar.',
    ex:'They are our competitor.',
    note:"In Picture A, the neighbor is Singapore. In Picture B, it is Malaysia. Both sell wellness travel, so they are Thailand's competitors."
  }
];

/* ===== Section 2b: Good Practice or Needs Work? (booth behavior categorization) =====
   Understand-level check: same objective as before (recognize professional
   booth behavior), different mechanic — sort each behavior into the correct
   category instead of picking one "best" multiple-choice option. */
const BOOTH_BEHAVIORS = [
  {text:'Standing at the front of the booth with a warm smile, ready to greet visitors.', good:true},
  {text:'Looking at your phone while a visitor is standing right in front of you.', good:false},
  {text:'Asking an open question, like "What brings you here today?"', good:true},
  {text:'Talking only about your product\'s price, before the visitor has even asked.', good:false},
  {text:'Offering a quick demo as soon as a visitor shows real interest.', good:true},
  {text:'Interrupting a visitor before they finish asking their question.', good:false}
];

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'exhibitor', word:'Exhibitor', meaning:'A company that has a booth at an exhibition to show its products'},
  {id:'lead', word:'Lead', meaning:'A visitor who shows real interest and might become a customer'},
  {id:'pitch', word:'Pitch', meaning:'A short, clear explanation of a product made to attract interest'},
  {id:'brochure', word:'Brochure', meaning:'A printed booklet with information about a product or company'},
  {id:'followup', word:'Follow Up', meaning:'To contact someone again after a first meeting'},
  {id:'targetaudience', word:'Target Audience', meaning:'The group of people a product or pitch is designed for'},
  {id:'competitor', word:'Competitor', meaning:'Another company offering a similar product or service'},
  {id:'badgescanner', word:'Badge Scanner', meaning:'A device that reads a visitor\'s badge to save their details'}
];

const FILL_BLANK = [
  {q:'Every __________ must set up their booth before the exhibition hall opens.', a:'exhibitor'},
  {q:'Can you give me your __________ in under a minute?', a:'pitch'},
  {q:'We collected over twenty __________ today from interested visitors.', a:'leads'},
  {q:'Please take a __________ before you go, it has all our product details.', a:'brochure'},
  {q:"I'll __________ with you by email next week to answer your questions.", a:'follow up'},
  {q:'Our __________ is mainly hotel and resort managers.', a:'target audience'},
  {q:"Our __________'s booth is right next to ours this year.", a:'competitor'},
  {q:"Use the __________ to save the visitor's contact information.", a:'badge scanner'}
];

const VOCAB_SITUATIONS = [
  {q:'A visitor walks by your booth without stopping. What do you say to get their attention?', model:'"Hello! Do you have a moment? I\'d love to show you something new."'},
  {q:"A visitor asks a question you don't know the answer to. What do you say?", model:'"That\'s a great question. Let me check with my colleague and get back to you."'},
  {q:'A visitor seems interested but needs to leave quickly. What do you say?', model:'"No problem at all! Let me scan your badge so I can send you the information by email."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Working an Exhibition Booth',
  paragraphs: [
    'Working a booth at a trade exhibition is very different from other MICE roles. In just a few seconds, booth staff must catch a visitor\'s attention, explain what makes their product special, and decide if this visitor could become a real customer, a "lead."',
    'The first few seconds matter most. A warm greeting and a genuine smile invite a visitor to stop. An open question, like "Are you looking for something specific today?", works better than a simple "Hello," because it starts a real conversation instead of a yes-or-no answer.',
    'Every exhibitor should have a short pitch ready, usually under 30 seconds. A good pitch explains the product clearly, mentions the one feature that makes it different (the unique selling point), and invites a follow-up question. Long, complicated pitches lose a visitor\'s interest quickly.',
    'Not every visitor is a serious lead. Experienced booth staff learn to "qualify" a visitor gently, asking a few friendly questions to understand if this person\'s company might really need the product. This is not about being unfriendly. It is about using time wisely across thousands of visitors.',
    'After the exhibition, the real work continues. A lead who is never contacted again is a wasted opportunity. Professional booth staff always follow up within a few days, while the visitor still remembers the conversation.'
  ]
};
const READING_QUESTIONS = [
  {q:'Why do the first few seconds at a booth matter so much?', opts:['Because that is when staff catch a visitor\'s attention and decide if they are a real lead','Because the booth closes after a few seconds','Because visitors must pay an entry fee'], correct:0},
  {q:'What makes a good pitch, according to the article?', opts:['It is long and covers every product detail','It is short, mentions the unique selling point, and invites a question','It only talks about the price'], correct:1},
  {q:'What does it mean to "qualify" a visitor?', opts:['To give them a certificate','To ask friendly questions to find out if they might really need the product','To ask them to leave the booth'], correct:1},
  {q:'What should booth staff do after the exhibition ends?', opts:['Forget about the leads they collected','Wait several months before contacting anyone','Follow up with leads within a few days'], correct:2}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  greeting:{title:'Welcoming a Visitor', items:[
    'Hello! Welcome to our booth.',
    'Are you looking for something specific today?',
    'Have you heard of [company name] before?',
    'Please, take a look around.',
    'Can I show you something quickly?'
  ]},
  pitching:{title:'Giving Your Pitch', items:[
    'Let me show you what makes us different.',
    'In short, we help [target audience] to…',
    'Our most popular product is…',
    'What makes us different is…',
    'Would you like to see a quick demo?'
  ]},
  closing:{title:'Closing & Following Up', items:[
    'Can I scan your badge?',
    'I\'ll send you more information by email.',
    'May I ask what company you\'re from?',
    'Thank you so much for stopping by.',
    'I\'ll follow up with you next week.'
  ]}
};

/* ===== Section 6: Listening Script — "A Visitor Stops By" =====
   Two characters: Nok (booth staff) and Mr. Andersson (visitor). */
const BEFORE_LISTEN = {
  setup: 'A visitor stops at Nok\'s booth. Listen and find out what happens by the end of the conversation.',
  guesses: [
    'The visitor buys the product immediately.',
    'The visitor becomes a lead and Nok will follow up.',
    'The visitor is not interested at all.',
    'The visitor argues with Nok about the price.'
  ]
};
const LISTEN = {
  intro: 'Hall B, Day 1 of the exhibition. Booth staff member Nok greets a visitor who has just stopped in front of her booth.',
  lines: [
    {who:'Nok', text:'Good morning! Welcome to our booth. Are you looking for something specific today?', kind:'staff'},
    {who:'Mr. Andersson', text:"Hi. I'm just walking around, but this caught my eye. What do you do exactly?", kind:'delegate'},
    {who:'Nok', text:'Great question. In short, we help hotels and resorts manage bookings more easily with one simple app. Would you like to see a quick demo?', kind:'staff'},
    {who:'Mr. Andersson', text:'Sure, go ahead.', kind:'delegate'},
    {who:'Nok', text:'This is our booking dashboard. You can see all reservations on one screen, no more switching between five different systems.', kind:'staff'},
    {who:'Mr. Andersson', text:"That's interesting. How is this different from your competitor over there? I saw their booth too.", kind:'delegate'},
    {who:'Nok', text:'Good question. The biggest difference is speed, our system updates in real time, so your front desk always sees the latest booking. Many of our clients switched from them for exactly that reason.', kind:'staff'},
    {who:'Mr. Andersson', text:'I see. My hotel is actually looking for something like this.', kind:'delegate'},
    {who:'Nok', text:"Wonderful. Can I scan your badge? I'll send you more information and a full price list by email.", kind:'staff'},
    {who:'Mr. Andersson', text:'Sure, here you go.', kind:'delegate'},
    {who:'Nok', text:'Thank you so much for stopping by. May I ask what company you\'re from, just so I can personalize the email?', kind:'staff'},
    {who:'Mr. Andersson', text:'Andaman Bay Resort, in Phuket.', kind:'delegate'},
    {who:'Nok', text:"Perfect, I'll follow up with you by early next week. Thank you again, and enjoy the rest of the exhibition!", kind:'staff'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What does Nok\'s company help hotels and resorts do?', opts:['Design their websites','Manage bookings more easily with one app','Train new front-desk staff'], correct:1},
  {q:'What does Nok offer to show the visitor?', opts:['A free hotel stay','A quick demo of the product','A printed contract'], correct:1},
  {q:'How does Nok say her product is different from the competitor\'s?', opts:['It is much cheaper','It updates in real time','It has more colors'], correct:1},
  {q:'What does Nok ask to do at the end of the conversation?', opts:['Scan his badge','Take a photo together','Call his manager'], correct:0},
  {q:'What information does Nok ask for before the visitor leaves?', opts:['His home address','What company he\'s from','His passport number'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Starting with an open question instead of a yes/no greeting', example:'"Are you looking for something specific today?"'},
  {strategy:'Offering a demo instead of only talking', example:'"Would you like to see a quick demo?"'},
  {strategy:'Answering a competitor comparison confidently, without criticizing the competitor', example:'"The biggest difference is speed…"'},
  {strategy:'Asking to scan the badge naturally, as part of the conversation', example:'"Can I scan your badge?"'},
  {strategy:'Personalizing the follow-up by asking the company name', example:'"May I ask what company you\'re from?"'}
];

/* ===== Section 6b: Build Your Pitch =====
   A practical construction task in the same spirit as Unit 6's "Update the
   Schedule": students fill in a formula, then check it against a model. */
const PITCH_FORMULA = [
  {key:'audience', label:'Target audience: who do you help?', placeholder:'e.g. hotel managers'},
  {key:'benefit', label:'Main benefit: what do you help them do?', placeholder:'e.g. save time on bookings'},
  {key:'how', label:'How: what is your product or service?', placeholder:'e.g. one simple app'},
  {key:'usp', label:'Unique selling point: what makes you different?', placeholder:'e.g. everything updates in real time'}
];
const MODEL_PITCH = 'We help hotel managers save time on bookings with one simple app. What makes us different is that everything updates in real time.';

/* ===== Section 8: Speaking Practice — Role-Play =====
   Three genuinely different visitors, not one visitor reworded three times:
   a curious browser (visitor), a time-pressed buyer (vip) who wants one
   direct answer and won't wait for a full pitch, and booth staff who must
   discover what each one actually needs before pitching anything. */
const ROLEPLAY_CARDS = {
  staff:{title:'Role Card A: Booth Staff', body:'You are working your company\'s booth at a trade exhibition.',
    role:'Greet the visitor, find out what they need, give a pitch that fits them, answer their question, and close by scanning their badge.',
    phrases:['Welcome to our booth!', 'Are you looking for something specific today?', 'Let me show you what makes us different.', 'Would you like to see a quick demo?', 'Can I scan your badge?', "I'll follow up with you by email."]},
  visitor:{title:'Role Card B: Curious Visitor', body:'You are visiting the exhibition and stop at this booth. You have time to look around.',
    role:'Ask about the product, compare it to a competitor, and decide if you want to give your contact details.',
    phrases:['What do you do exactly?', 'How is this different from…?', "That's interesting.", 'Can you send me more information?', "I'm actually looking for something like this."]},
  vip:{title:'Role Card C: Time-Pressed Buyer', body:"You are a procurement manager for a large hotel chain. You have exactly 3 minutes before your next meeting.",
    role:"Tell the staff member you're in a hurry, ask ONE direct question about price or contract terms, and only give your contact details if the answer is genuinely useful to you.",
    phrases:['I only have a few minutes.', "Cut to the chase, what does this cost?", "That's not quite what I need.", 'Send me the details if it fits our budget.', "I'll think about it."]}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'A visitor says your price is too high compared to a competitor. Respond professionally and highlight your value.'},
  {tag:'Scenario 2', text:'A very important buyer from a large hotel chain stops by. Give your best pitch and make sure you get their contact details.'},
  {tag:'Scenario 3', text:'A visitor is in a hurry and only has 30 seconds. Give the shortest possible version of your pitch.'}
];

/* ===== Surprise Challenge: a 4th, off-script visitor =====
   Reuses OPENING_SCENARIO's exact shape (facts/message/question/options)
   so it reuses the same proven render/wire mechanic as Section 1 — no new
   UI component needed. Revealed late in the lesson, after the 3 planned
   visitors, so it stays a genuine surprise rather than a 4th rehearsed role. */
const SURPRISE_CHALLENGE = {
  facts: [
    "It's 2:45 p.m. Your booth has been busy all day.",
    'A visitor walks up wearing a badge from your biggest competitor.'
  ],
  message: 'They say: "I\'m actually scouting for my own company, but I\'m curious, what would you tell a real customer right now?"',
  question: 'What do you do?',
  options: [
    {text:'Refuse to talk to them at all.', good:false, note:'You can be professional without giving away your full pitch. A flat refusal can look unprofessional to nearby visitors watching.'},
    {text:'Give your normal pitch, but keep your best details for real leads.', good:true, note:'Smart. Stay professional and give a general answer without handing a competitor your strategy.'},
    {text:'Ask them directly if they work for a competitor before responding.', good:true, note:"Reasonable. A polite, direct question is a normal, professional way to find out who you're speaking to."},
    {text:'Give them your full detailed pitch, including pricing.', good:false, note:"Risky. There's no reason to hand a competitor your full pricing and strategy."}
  ],
  liveTask: "Now perform it: with your partner, act out this exact moment. One of you is the booth staff, one is the visitor. Use the real phrases from Section 5."
};

/* ===== Mission Progress: plain-English steps shown on Section 1 (Mission Brief) =====
   A curated subset of TRACKED_ACTIVITIES, not all 16 — chosen to read as a
   narrative mission arc rather than a technical section list. Checked state
   is computed live from Progress.activities in app.js, not baked in here. */
const MISSION_STEPS = [
  {key:'s2', label:'Learn the language you need'},
  {key:'s6', label:'Listen to a real booth conversation'},
  {key:'s6b', label:'Build your pitch'},
  {key:'s8', label:'Perform for 3 different visitors'},
  {key:'surprise', label:'Handle a surprise visitor'},
  {key:'exit', label:'Reflect on your mission'}
];

/* ===== Exit Ticket: one short reflection, not another writing assignment ===== */
const EXIT_TICKET = {
  prompt: 'In one or two sentences: what is one thing you will do differently the next time you meet a visitor at a booth?',
  minChars: 15
};

/* ===== Teacher Guide (courses/mice/unit-9/teacher.html reads this directly) ===== */
const TEACHER_GUIDE = {
  unit: 'Unit 9: Exhibition Booth Communication',
  learningOutcome: 'By the end of this lesson, students can greet a visitor, discover their needs through questions, deliver a short pitch tailored to what they learned, and close the conversation with a follow-up commitment.',
  bloomsLevel: 'Apply',
  addieFocus: 'Implementation — students apply prior-unit language (greetings, client-service phrases, professional register) to a new professional situation (a trade-exhibition booth) rather than learning new grammar.',
  grouping: 'Pairs for Sections 1–9 (alternating roles); groups of 3–4 for the Surprise Challenge live performance; individual for Writing Task and Self-Check.',
  timing: [
    {block:'Mission Brief', time:'0:00–0:15', ref:'Section 1', tier:'core'},
    {block:'MICE Detectives (opening puzzle)', time:'0:15–0:35', ref:'Section 2', tier:'core'},
    {block:'Good Practice, Matching & Situations', time:'0:35–0:55', ref:'Sections 2b, 3', tier:'core', note:'Section 3\'s Fill in the Blank is EXTENSION, optional if time allows'},
    {block:'Team Task', time:'0:55–1:15', ref:'Sections 4, 5', tier:'core'},
    {block:'Break', time:'1:15–1:25', ref:null, tier:'break'},
    {block:'Input', time:'1:25–1:45', ref:'Section 6', tier:'core', note:'Section 7 (After Listening) is EXTENSION, optional if time allows'},
    {block:'Main MICE Mission: Build', time:'1:45–2:00', ref:'Section 9 — Build Your Pitch', tier:'core'},
    {block:'Main MICE Mission: Perform', time:'2:00–2:20', ref:'Section 10 — Speaking Practice', tier:'core'},
    {block:'Challenge', time:'2:20–2:35', ref:'Section 11 — Surprise Challenge', tier:'core'},
    {block:'Quick Review', time:'2:35–2:45', ref:'Section 12 — Vocabulary Race', tier:'core'},
    {block:'Self-Check & Exit Ticket', time:'2:45–3:00', ref:'Sections 15, 16', tier:'core'}
  ],
  materials: ['Projector or shared screen for check-in and Section 1', 'Student devices (one per pair minimum) for the digital console', 'Printed or projected Role Cards as a backup if speakers/TTS are unreliable in the room'],
  teacherPrompts: [
    'Before Section 1: "Who has ever worked a booth, table, or stall before? What was hard about it?"',
    'Before Section 8: "Remember, your job is to find out what THIS visitor needs before you pitch anything."',
    "Before the Surprise Challenge: don't preview it. Let the reveal be a genuine surprise."
  ],
  commonProblems: [
    {problem:'Students give the same pitch to every visitor regardless of role card.', fix:'Pause the class after Round 1 and ask two pairs to say out loud what their visitor actually needed, before Round 2 starts.'},
    {problem:'Students skip the discovery question and jump straight to pitching.', fix:"Point back to Section 5's \"Welcoming a Visitor\" phrases — the open question is not optional."}
  ],
  fastClassExtension: 'Add a 4th role card on the fly: a visitor who speaks limited English and needs the pitch simplified. Ask fast pairs to perform this as an improvised Round 4.',
  slowClassCompression: "Skip Section 3's fill-in-the-blank activity (vocabulary is already reinforced in Section 2 and the Vocabulary Race) and shorten the Peer Checklist discussion to 3 items.",
  assessment: 'Formative: Mission Progress checklist and dot-nav completion (16 tracked activities), plus the peer checklist during Sections 8/13. Summative: rubric in Section 10 (Self-Check) cross-checked by teacher observation during the live Surprise Challenge performance, plus the Section 9 written follow-up email.'
};

/* ===== Practice: Peer Checklist + bonus pitch situations ===== */
const PEER_CHECKLIST = [
  'Did they greet the visitor warmly and start with an open question?',
  'Did they give a clear, short pitch (about 30 seconds)?',
  'Did they mention what makes their product different?',
  "Did they answer the visitor's question confidently?",
  'Did they scan the badge and confirm a follow-up naturally?',
  'Did their language sound friendly, professional, and confident?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'Pitch a wellness retreat package to a visitor who has only 20 seconds.'},
  {tag:'Situation B', text:'Pitch your product to a visitor who says: "I already use a competitor\'s product and I\'m happy with it."'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Write a short follow-up email (4–6 sentences) to a visitor you met at your booth. Thank them for stopping by, remind them what you discussed, and suggest a next step.',
  discussion: [
    {title:'Tourism Business Management', text:'You met a travel agency owner at your booth who seemed very interested in a group package for corporate clients. Write your follow-up email to turn this lead into a real client.'},
    {title:'Wellness Tourism Management', text:'You met a spa manager at your booth who was comparing your wellness product line to a competitor. Write your follow-up email explaining why your product is the better choice.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Booth & Exhibition Vocabulary', sub:'I can use booth, pitch, lead, and exhibition vocabulary correctly.'},
  {k:'pitch', lbl:'Giving a Pitch', sub:'I can give a short, clear pitch for a product or service.'},
  {k:'compare', lbl:'Handling Comparisons', sub:'I can respond confidently when a visitor compares my product to a competitor.'},
  {k:'closing', lbl:'Closing the Conversation', sub:'I can close a booth conversation naturally and ask to follow up.'},
  {k:'writing', lbl:'Follow-Up Writing', sub:'I can write a short, professional follow-up email after meeting a visitor.'}
];

/* ===================== ASSETS ===================== */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/mice-u9-hero.jpg', alt:'Delegates and exhibitors networking together during a busy exhibition hall reception' }
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 9: Exhibition Booth Communication',
  unitCode: 'unit-9'
};
