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
  {key:'s1', label:'Your First Minute at the Booth'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Good Practice or Needs Work?'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: A Visitor Stops By'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Build Your Pitch'},
  {key:'s8', label:'Speaking Practice'},
  {key:'crossword', label:'Vocabulary Race'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
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

/* ===== Section 8: Speaking Practice — Role-Play ===== */
const ROLEPLAY_CARDS = {
  staff:{title:'Role Card A: Booth Staff', body:'You are working your company\'s booth at a trade exhibition.',
    role:'Greet the visitor, give your pitch, answer their question, and close by scanning their badge.',
    phrases:['Welcome to our booth!', 'Are you looking for something specific today?', 'Let me show you what makes us different.', 'Would you like to see a quick demo?', 'Can I scan your badge?', "I'll follow up with you by email."]},
  visitor:{title:'Role Card B: Exhibition Visitor', body:'You are visiting the exhibition and stop at this booth.',
    role:'Ask about the product, compare it to a competitor, and decide if you want to give your contact details.',
    phrases:['What do you do exactly?', 'How is this different from…?', "That's interesting.", 'Can you send me more information?', "I'm actually looking for something like this."]}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'A visitor says your price is too high compared to a competitor. Respond professionally and highlight your value.'},
  {tag:'Scenario 2', text:'A very important buyer from a large hotel chain stops by. Give your best pitch and make sure you get their contact details.'},
  {tag:'Scenario 3', text:'A visitor is in a hurry and only has 30 seconds. Give the shortest possible version of your pitch.'}
];

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
