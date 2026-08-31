/* ===================== UNIT 12 CONTENT DATA — CHOOSING THE RIGHT PACKAGE =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   package comparison, rubric. Nothing here is UI logic — see app.js for
   rendering/state/voice/progress-tracking.

   Bloom's level: ANALYZE → EVALUATE. Students compare two wellness package
   proposals in PAIRS (each partner reads only one package's details,
   reading-heavy rather than another listening/group task) and must weigh
   trade-offs to justify a recommendation for a specific guest, a genuine
   step toward evaluation over Unit 11's analyze-level task. Invented
   content, part of the Units 9-15 OBE/Bloom's expansion, not drawn from
   the official workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Two Packages, One Guest'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s2b', label:'Rank What Matters Most'},
  {key:'s3', label:'Vocabulary Activities'},
  {key:'s4', label:'Reading'},
  {key:'s5', label:'Useful Phrases'},
  {key:'s6', label:'Listening: Making the Call'},
  {key:'s7', label:'After Listening'},
  {key:'s6b', label:'Compare and Decide'},
  {key:'s8', label:'Speaking Practice'},
  {key:'crossword', label:'Quick Match'},
  {key:'practice', label:'Peer Checklist & Bonus'},
  {key:'s9', label:'Writing Task'},
  {key:'s10', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Two Packages, One Guest =====
   Opens as an incoming client email instead of a plain facts list, matching
   the "decision needed today" framing already used for MICE Unit 12. */
const OPENING_SCENARIO = {
  clientMessage: {
    from: 'j.morrison@guestmail.com',
    subject: 'Package Decision Needed Today',
    body: "Hi team, I need to book my wellness package before I leave for the airport today. I saw two options on your website. Could you recommend one for me, and tell me why?"
  },
  message: 'Both packages look wonderful, but they are quite different.',
  question: 'What should you do first?',
  options: [
    {text:'Compare the two packages side by side.', good:true, note:'Good instinct. You can\'t justify a recommendation without comparing both fairly.'},
    {text:'Choose the cheaper one without reading both carefully.', good:false, note:"Price matters, but it's not the only factor. Compare everything first."},
    {text:'Ask the guest what matters most to them.', good:true, note:'Yes. Knowing their priority (budget, flexibility, intensity) makes your recommendation much stronger.'},
    {text:'Pick randomly since both look fine at a glance.', good:false, note:'A quick guess wastes the useful information already in front of you.'},
    {text:'List the advantages and disadvantages of each.', good:true, note:"Excellent. That's exactly how a professional recommendation gets built."}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'9:00', point:'Package proposals received', where:'Wellness Office'},
  {time:'10:00', point:'Compare proposals as a team', where:'Meeting Room 2'},
  {time:'11:30', point:'Guest preference call', where:'Confirm what matters most to them'},
  {time:'1:00 p.m.', point:'Final recommendation due', where:'Send recommendation to guest'},
  {time:'2:00 p.m.', point:'Booking confirmation', where:'Confirmed and filed'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's plan for the package recommendation. At 9 a.m., package proposals are received at the Wellness Office. At 10 a.m., we compare the proposals as a team in Meeting Room 2. At 11:30, we have a call with the guest to confirm what matters most to them. At 1 p.m., our final recommendation is due to be sent to the guest. And at 2 p.m., the booking gets confirmed and filed.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'compare', ic:'⚖️', nm:'Compare', type:'v.', def:'To look at two or more things to see how they are similar or different.', ex:"Let's compare the two packages before deciding."},
  {id:'tradeoff', ic:'🔄', nm:'Trade-Off', type:'n.', def:'Giving up one good thing to get another good thing.', ex:'Choosing the cheaper package is a trade-off between price and flexibility.'},
  {id:'budget', ic:'💰', nm:'Budget', type:'n.', def:'The amount of money available to spend.', ex:'This package fits within our budget.'},
  {id:'valueformoney', ic:'💎', nm:'Value for Money', type:'n. phr.', def:'Getting a good result for the price you pay.', ex:'This option offers better value for money.'},
  {id:'flexible', ic:'🤸', nm:'Flexible', type:'adj.', def:'Able to change or adapt easily.', ex:'This package is more flexible about last-minute changes.'},
  {id:'reviews', ic:'⭐', nm:'Reviews', type:'n.', def:'Opinions or ratings from people who used a service before.', ex:"Check the package's reviews from previous guests."},
  {id:'suitable', ic:'✅', nm:'Suitable', type:'adj.', def:'Right or appropriate for a particular purpose.', ex:'Which package is more suitable for a stressed guest?'},
  {id:'justify', ic:'📝', nm:'Justify', type:'v.', def:'To give good reasons for a decision.', ex:'You must justify your recommendation to the guest.'},
  {id:'advantage', ic:'👍', nm:'Advantage', type:'n.', def:'A good or helpful feature of something.', ex:'The main advantage of Package A is the price.'},
  {id:'disadvantage', ic:'👎', nm:'Disadvantage', type:'n.', def:'A negative or unhelpful feature of something.', ex:'One disadvantage of Package A is its fixed schedule.'}
];
const VOCAB_SECONDARY = [
  {id:'proposal2', nm:'Proposal', def:'A detailed written offer describing a package and its price.'},
  {id:'quote2', nm:'Quote', def:'The exact price offered for a specific package.'},
  {id:'priority2', nm:'Priority', def:'The thing that matters most and should be considered first.'},
  {id:'inclusions', nm:'Inclusions', def:'The specific treatments and activities a package contains.'},
  {id:'overall2', nm:'Overall', def:'Considering everything together, not just one detail.'}
];

/* ===== Section 2b: Rank What Matters Most (ranking) =====
   Same underlying objective as before (weighing what actually matters
   before recommending), presented as a ranking task instead of a single
   choose-and-explain challenge, mirroring MICE Unit 12's own ranking task
   for its own Analyze-to-Evaluate step up. */
const RANK_FACTORS = [
  {text:'Price'},
  {text:'Schedule flexibility'},
  {text:'Past guest reviews'}
];

/* ===== Section 3: Vocabulary Activities ===== */
const MATCH_PAIRS = [
  {id:'compare', word:'Compare', meaning:'To look at two or more things to see how they are similar or different'},
  {id:'tradeoff', word:'Trade-Off', meaning:'Giving up one good thing to get another good thing'},
  {id:'valueformoney', word:'Value for Money', meaning:'Getting a good result for the price you pay'},
  {id:'flexible', word:'Flexible', meaning:'Able to change or adapt easily'},
  {id:'reviews', word:'Reviews', meaning:'Opinions or ratings from people who used a service before'},
  {id:'suitable', word:'Suitable', meaning:'Right or appropriate for a particular purpose'},
  {id:'justify', word:'Justify', meaning:'To give good reasons for a decision'},
  {id:'advantage', word:'Advantage', meaning:'A good or helpful feature of something'}
];

const FILL_BLANK = [
  {q:"Let's __________ the two packages before deciding.", a:'compare'},
  {q:'Choosing the cheaper package is a __________ between price and flexibility.', a:'trade-off'},
  {q:'This package fits within our __________.', a:'budget'},
  {q:'This option offers better __________.', a:'value for money'},
  {q:'This package is more __________ about last-minute changes.', a:'flexible'},
  {q:"Check the package's __________ from previous guests.", a:'reviews'},
  {q:'You must __________ your recommendation to the guest.', a:'justify'},
  {q:'One __________ of Package A is its fixed schedule.', a:'disadvantage'}
];

const VOCAB_SITUATIONS = [
  {q:'Your manager asks why you recommended the more expensive package. What do you say?', model:'"I can justify it: even though it costs more, it offers better value for money and much better flexibility."'},
  {q:'A colleague only wants to look at the price. What do you remind them?', model:"\"Price matters, but let's compare everything, including flexibility and reviews, before we decide.\""},
  {q:'You need to explain a trade-off to a guest. What do you say?', model:'"There is a trade-off here: the cheaper package has a fixed schedule, while the flexible package costs more."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Comparing Wellness Packages: More Than Just Price',
  paragraphs: [
    'When a guest is choosing between wellness packages, it is tempting to simply recommend whichever one has the lowest price. Experienced wellness professionals know that the cheapest option is not always the best value for money.',
    'A fair comparison looks at several factors together: price, of course, but also flexibility, past reviews, and how suitable the package is for this specific guest. A package that is slightly more expensive but extremely flexible might actually suit a stressed guest far better than a rigid, cheaper schedule.',
    'This kind of decision almost always involves a trade-off. Choosing a cheaper package might mean a fixed schedule with no room for change. Choosing a more flexible package might mean a higher price. Neither choice is automatically right, it depends on what matters most for this particular guest.',
    'The final, essential step is being able to justify the decision. A recommendation without reasons sounds like a guess. A recommendation that clearly explains the advantages, disadvantages, and trade-offs sounds like a professional judgment the guest can trust.',
    'For guests recovering from a stressful period especially, flexibility often matters more than a lower price, since a rigid schedule can add pressure rather than remove it.'
  ]
};
const READING_QUESTIONS = [
  {q:'What mistake does the article suggest it is tempting to make?', opts:['Reading the proposal too carefully','Simply recommending whichever package has the lowest price','Asking the guest too many questions'], correct:1},
  {q:'What factors should a fair comparison look at, according to the article?', opts:['Only the price','Price, flexibility, past reviews, and suitability together','Only the number of reviews'], correct:1},
  {q:'What almost always happens when comparing two package options?', opts:['One is always perfect in every way','A trade-off, since neither choice is automatically right','The prices are always identical'], correct:1},
  {q:'Why might flexibility matter more than price for a stressed guest, according to the article?', opts:['It never matters more','A rigid schedule can add pressure rather than remove it','Stressed guests never care about schedules'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  comparing:{title:'Comparing Options', items:[
    "Let's compare the two packages.",
    "What's the main advantage of this one?",
    "What's the trade-off here?",
    'Which is more suitable for this guest?'
  ]},
  recommending:{title:'Making a Recommendation', items:[
    'I recommend Package A because…',
    'The main advantage is…',
    'However, one disadvantage is…',
    'Overall, I think this offers better value for money.'
  ]},
  justifying:{title:'Justifying Your Choice', items:[
    'We chose this because…',
    "Even though it's more expensive, it offers…",
    'This fits your budget and still…',
    'I can justify this decision because…'
  ]}
};

/* ===== Section 6: Listening Script — "Making the Call" =====
   Two characters: Mali and Todd, wellness coordinators comparing packages. */
const BEFORE_LISTEN = {
  setup: 'Mali and Todd compare two packages and make a recommendation. Listen and find out which one they choose.',
  guesses: [
    'They choose the cheaper package without discussion.',
    'They compare both, then justify their final choice.',
    'They cannot decide and cancel the booking.',
    'They choose the package with the worst reviews.'
  ]
};
const LISTEN = {
  intro: 'The Wellness Office. Mali and Todd are comparing two package proposals for a guest staying four nights.',
  lines: [
    {who:'Mali', text:"Okay, let's compare the two packages. Package A is quoted at 28,000 baht, Package B is 42,000.", kind:'staff'},
    {who:'Todd', text:"That's a big difference. What's the trade-off?", kind:'delegate'},
    {who:'Mali', text:'Package A has a fixed daily schedule, no changes once booked, and reviews around 4.2. Package B is fully flexible, you can adjust activities daily, and reviews are 4.9.', kind:'staff'},
    {who:'Todd', text:'Do we know what the guest cares about most?', kind:'delegate'},
    {who:'Mali', text:"Yes, I checked. The guest specifically mentioned they've been extremely stressed and want to be able to adjust their schedule if they're too tired on a given day.", kind:'staff'},
    {who:'Todd', text:"That changes things. Package A might not be suitable if they can't adjust it at all.", kind:'delegate'},
    {who:'Mali', text:'Exactly. Even though Package B costs more, I think it offers better value for money here, because it actually meets what the guest needs.', kind:'staff'},
    {who:'Todd', text:"Agreed. Let's recommend Package B, and I'll write up the justification for the guest.", kind:'delegate'},
    {who:'Mali', text:"Perfect. Mention the flexibility first, that's the strongest reason.", kind:'staff'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:"What is Package A's quote?", opts:['28,000 baht', '42,000 baht', '55,000 baht'], correct:0},
  {q:'What is one disadvantage of Package A?', opts:['It has excellent reviews','It has a fixed schedule with average reviews','It costs too much'], correct:1},
  {q:'What does the guest specifically care about, according to Mali?', opts:['The color of the towels','Being able to adjust their schedule if too tired','The exact room number'], correct:1},
  {q:'Which package do Mali and Todd recommend?', opts:['Package A', 'Package B', 'Neither, they cancel the booking'], correct:1},
  {q:'What reason does Mali say should come first in the justification?', opts:['The price difference','The flexibility','The number of reviews'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Starting the comparison with hard numbers', example:'"Package A is quoted at 28,000 baht, Package B is 42,000."'},
  {strategy:'Naming the trade-off directly', example:'"What\'s the trade-off?"'},
  {strategy:"Checking the guest's actual priority before deciding", example:'"Do we know what the guest cares about most?"'},
  {strategy:'Justifying the choice with a clear reason, not just a feeling', example:'"...it actually meets what the guest needs."'},
  {strategy:'Deciding which reason to lead with in the final justification', example:"\"Mention the flexibility first, that's the strongest reason.\""}
];

/* ===== Section 6b: Compare and Decide =====
   PAIR task using the .ab-toggle/.ab-btn/.ab-view component (same pattern
   as Unit 10's info-gap and Unit 11's jigsaw, applied here to a comparison
   task instead): Student A reads Package A's full proposal, Student B
   reads Package B's, then together they must agree on and justify a
   recommendation. */
const VENDOR_A = {
  name:'Package A: Serenity Retreat',
  price:'28,000 baht for 4 nights',
  menu:'Daily meditation, 2 spa treatments, quiet garden access',
  dietary:'Standard menu only, no personalization',
  reviews:'4.2 out of 5 stars from past guests',
  flexibility:'Fixed daily schedule, no changes once booked'
};
const VENDOR_B = {
  name:'Package B: Balance & Renewal',
  price:'42,000 baht for 4 nights',
  menu:'Daily yoga and meditation, 4 spa treatments, private wellness consultation',
  dietary:'Personalized menu available on request',
  reviews:'4.9 out of 5 stars from past guests',
  flexibility:'Fully flexible, activities can be adjusted daily'
};
const MODEL_RECOMMENDATION = 'We recommend Package B. Even though it costs more, it offers far better flexibility and much stronger reviews, which matches exactly what this guest asked for. The extra cost is justified by how much better it fits a guest who needs to adjust their schedule day to day.';

/* ===== Section 8: Speaking Practice — Negotiate the Recommendation =====
   Same 2-person interaction (this stays PAIR work), reframed as a real
   negotiation instead of a one-way presentation, mirroring MICE Unit 12's
   own Negotiate the Deal task. */
const ROLEPLAY_CARDS = {
  staff:{title:'Role Card A: Wellness Coordinator', body:"The guest is hesitant about Package B's higher price.",
    role:'Negotiate a solution. Try to offer added value or a small compromise, without simply dropping the price.',
    phrases:['I understand the price is a concern.', 'What if we included…', 'We could offer…', 'Does that work better for you?']},
  visitor:{title:'Role Card B: Guest', body:'You like Package B, but the price feels a little high.',
    role:'Push back gently on the price, then listen to what the coordinator offers.',
    phrases:['The price is a bit higher than I expected.', 'Is there anything you can do?', 'What would that include?', "Okay, that sounds fair."]}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'The guest says the price difference is too high and pushes back. Justify your recommendation further.'},
  {tag:'Scenario 2', text:'A colleague strongly disagrees with your choice and prefers the other package. Discuss and try to reach an agreement.'},
  {tag:'Scenario 3', text:'The guest asks you to compare a third, brand-new package with no reviews yet. What do you say?'}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they compare both options fairly, not just by price?',
  'Did they mention at least one advantage and one disadvantage?',
  'Did they explain the trade-off clearly?',
  'Did they justify their final recommendation with a real reason?',
  "Did they answer the guest's questions confidently?",
  'Did their language sound professional and well-organized?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'Compare two fitness program add-ons: one cheaper with group classes only, one pricier with a private personal trainer.'},
  {tag:'Situation B', text:'Compare two spa treatment upgrades for a guest: one offers only massage, the other offers massage, facial, and a nutrition consultation at a higher price.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Write a short recommendation email (4–6 sentences) to a guest explaining which package you chose and why, including at least one trade-off you considered.',
  discussion: [
    {title:'Tourism Business Management', text:'You are comparing two group wellness retreat packages for a corporate client: one cheaper with a fixed group schedule, one pricier with individually tailored activities. Write your recommendation.'},
    {title:'Wellness Tourism Management', text:'You are comparing two detox program packages: one offers lower prices but fewer consultations, the other offers more personal consultations at a higher price. Write your recommendation.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Comparison Vocabulary', sub:'I can use compare, trade-off, advantage, and disadvantage correctly.'},
  {k:'compare', lbl:'Comparing Fairly', sub:'I can compare two options by more than just price.'},
  {k:'tradeoff', lbl:'Explaining a Trade-Off', sub:'I can clearly explain the trade-off between two options.'},
  {k:'justify', lbl:'Justifying a Recommendation', sub:'I can justify a recommendation with a real, clear reason.'},
  {k:'writing', lbl:'Writing a Recommendation', sub:'I can write a short, clear recommendation email to a guest.'}
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 12: Choosing the Right Package',
  unitCode: 'unit-12'
};
