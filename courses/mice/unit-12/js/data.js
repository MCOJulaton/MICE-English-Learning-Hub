/* ===================== UNIT 12 CONTENT DATA — CHOOSING A CATERING VENDOR =====================
   All lesson content lives here: vocabulary, phrases, reading, listening script,
   vendor comparison, rubric. Nothing here is UI logic — see app.js for
   rendering/state/voice/progress-tracking.

   Bloom's level: ANALYZE → EVALUATE. Students compare two vendor proposals in
   PAIRS (each partner reads only one vendor's proposal, reading-heavy rather
   than another listening/group task) and must weigh trade-offs to justify a
   recommendation, a genuine step toward evaluation over Unit 11's analyze-level
   task. Invented content, part of the Units 9-15 OBE/Bloom's expansion, not
   drawn from the official workbook. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Two Proposals, One Decision'},
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

/* ===== Section 1: Two Proposals, One Decision =====
   Opens as an actual client message instead of a facts list, since a real
   client request is what kicks off this whole comparison-and-recommend task. */
const OPENING_SCENARIO = {
  clientMessage: {
    from: 'client@goldenhotel.com',
    subject: 'Catering Decision Needed Today',
    body: 'Hi team, I need a caterer confirmed for our 80-guest gala by the end of today. I have two proposals attached. Please let me know which one you recommend, and why.'
  },
  message: 'Both proposals look professional, but they are quite different.',
  question: 'What should you do first?',
  options: [
    {text:'Compare the two proposals side by side.', good:true, note:'Good instinct. You can\'t justify a recommendation without comparing both fairly.'},
    {text:'Choose the cheaper one without reading both carefully.', good:false, note:"Price matters, but it's not the only factor. Compare everything first."},
    {text:'Ask the client what matters most to them.', good:true, note:'Yes. Knowing their priority (budget, menu, flexibility) makes your recommendation much stronger.'},
    {text:'Pick randomly since both look fine at a glance.', good:false, note:'A quick guess wastes the useful information already in front of you.'},
    {text:'List the advantages and disadvantages of each.', good:true, note:"Excellent. That's exactly how a professional recommendation gets built."}
  ]
};

const WARMUP_SCHEDULE = [
  {time:'9:00', point:'Vendor proposals received', where:'Events Office'},
  {time:'10:00', point:'Compare proposals as a team', where:'Meeting Room 2'},
  {time:'11:30', point:'Client preference call', where:'Confirm what matters most to them'},
  {time:'1:00 p.m.', point:'Final decision due', where:'Send recommendation to client'},
  {time:'2:00 p.m.', point:'Contract confirmation', where:'Signed and filed'}
];
const WARMUP_SCRIPT = "Good morning, team! Here's today's plan for the catering decision. At 9 a.m., vendor proposals are received at the Events Office. At 10 a.m., we compare the proposals as a team in Meeting Room 2. At 11:30, we have a call with the client to confirm what matters most to them. At 1 p.m., our final decision and recommendation is due to be sent to the client. And at 2 p.m., the contract gets confirmed, signed, and filed.";

/* ===== Section 2: Key Vocabulary ===== */
const VOCAB = [
  {id:'compare', ic:'⚖️', nm:'Compare', type:'v.', def:'To look at two or more things to see how they are similar or different.', ex:'Let\'s compare the two proposals before deciding.'},
  {id:'tradeoff', ic:'🔄', nm:'Trade-Off', type:'n.', def:'Giving up one good thing to get another good thing.', ex:'Choosing the cheaper option is a trade-off between price and quality.'},
  {id:'budget', ic:'💰', nm:'Budget', type:'n.', def:'The amount of money available to spend.', ex:'This package fits within our budget.'},
  {id:'valueformoney', ic:'💎', nm:'Value for Money', type:'n. phr.', def:'Getting a good result for the price you pay.', ex:'This option offers better value for money.'},
  {id:'flexible', ic:'🤸', nm:'Flexible', type:'adj.', def:'Able to change or adapt easily.', ex:'This vendor is more flexible about last-minute changes.'},
  {id:'reviews', ic:'⭐', nm:'Reviews', type:'n.', def:'Opinions or ratings from people who used a service before.', ex:'Check the vendor\'s reviews from previous events.'},
  {id:'suitable', ic:'✅', nm:'Suitable', type:'adj.', def:'Right or appropriate for a particular purpose.', ex:'Which package is more suitable for a formal dinner?'},
  {id:'justify', ic:'📝', nm:'Justify', type:'v.', def:'To give good reasons for a decision.', ex:'You must justify your recommendation to the client.'},
  {id:'advantage', ic:'👍', nm:'Advantage', type:'n.', def:'A good or helpful feature of something.', ex:'The main advantage of Vendor A is the price.'},
  {id:'disadvantage', ic:'👎', nm:'Disadvantage', type:'n.', def:'A negative or unhelpful feature of something.', ex:'One disadvantage of Vendor B is the higher price.'}
];
const VOCAB_SECONDARY = [
  {id:'proposal', nm:'Proposal', def:'A detailed written offer describing a service and its price.'},
  {id:'quote', nm:'Quote', def:'The exact price a vendor offers for a specific service.'},
  {id:'priority', nm:'Priority', def:'The thing that matters most and should be considered first.'},
  {id:'menu2', nm:'Menu Options', def:'The different food and drink choices a caterer can provide.'},
  {id:'overall', nm:'Overall', def:'Considering everything together, not just one detail.'}
];

/* ===== Section 2b: Rank What Matters Most (Understand-level prioritization) =====
   Same objective as before (recognize that a good comparison needs a clear
   priority, not just a price check), different mechanic — rank factors by
   importance instead of picking one "best" multiple-choice option. There is
   no single correct order here; completion is gated on ranking all three,
   since this is a values judgment the vendor comparison in s6b then tests. */
const RANK_FACTORS = [
  {text:'Price'},
  {text:'Dietary flexibility'},
  {text:'Past reviews'}
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
  {q:"Let's __________ the two proposals before deciding.", a:'compare'},
  {q:'Choosing the cheaper option is a __________ between price and quality.', a:'trade-off'},
  {q:'This package fits within our __________.', a:'budget'},
  {q:'This option offers better __________.', a:'value for money'},
  {q:'This vendor is more __________ about last-minute changes.', a:'flexible'},
  {q:"Check the vendor's __________ from previous events.", a:'reviews'},
  {q:'You must __________ your recommendation to the client.', a:'justify'},
  {q:'One __________ of Vendor B is the higher price.', a:'disadvantage'}
];

const VOCAB_SITUATIONS = [
  {q:'Your manager asks why you recommended the more expensive vendor. What do you say?', model:'"I can justify it: even though it costs more, it offers better value for money and much better reviews."'},
  {q:'A colleague only wants to look at the price. What do you remind them?', model:'"Price matters, but let\'s compare everything, including flexibility and reviews, before we decide."'},
  {q:'You need to explain a trade-off to a client. What do you say?', model:'"There is a trade-off here: the cheaper option has a smaller menu, while the flexible option costs more."'}
];

/* ===== Section 4: Reading ===== */
const READING = {
  title: 'Comparing Vendors: More Than Just Price',
  paragraphs: [
    'When a MICE event needs a supplier, whether catering, AV, or transport, it is tempting to simply pick whichever proposal has the lowest price. Experienced event professionals know that the cheapest option is not always the best value for money.',
    'A fair comparison looks at several factors together: price, of course, but also flexibility, past reviews, and how suitable the option is for this specific event. A vendor that is slightly more expensive but extremely flexible might actually save the team money and stress later, if the event schedule changes at the last minute.',
    'This kind of decision almost always involves a trade-off. Choosing a cheaper vendor might mean a smaller menu or less flexibility. Choosing a more expensive vendor might mean a smaller profit margin for the event. Neither choice is automatically right, it depends on what matters most for this particular event.',
    'The final, essential step is being able to justify the decision. A recommendation without reasons sounds like a guess. A recommendation that clearly explains the advantages, disadvantages, and trade-offs sounds like a professional judgment the client can trust.',
    'For Wellness Tourism events, this same thinking applies to comparing spa treatment providers or wellness activity partners: a guest\'s experience depends on getting genuine value, not just the lowest number on the invoice.'
  ]
};
const READING_QUESTIONS = [
  {q:'What mistake do the article suggests it is tempting to make?', opts:['Reading the proposal too carefully','Simply picking whichever proposal has the lowest price','Asking the client too many questions'], correct:1},
  {q:'What factors should a fair comparison look at, according to the article?', opts:['Only the price','Price, flexibility, past reviews, and suitability together','Only the number of reviews'], correct:1},
  {q:'What almost always happens when comparing two vendor options?', opts:['One is always perfect in every way','A trade-off, since neither choice is automatically right','The prices are always identical'], correct:1},
  {q:'What makes a recommendation sound professional rather than like a guess?', opts:['Choosing quickly without explaining anything','Clearly explaining the advantages, disadvantages, and trade-offs','Always choosing the most expensive option'], correct:1}
];

/* ===== Section 5: Useful Phrases ===== */
const PHRASE_TABS = {
  comparing:{title:'Comparing Options', items:[
    "Let's compare the two proposals.",
    "What's the main advantage of this one?",
    "What's the trade-off here?",
    'Which is more suitable for our event?'
  ]},
  recommending:{title:'Making a Recommendation', items:[
    'I recommend Vendor A because…',
    'The main advantage is…',
    'However, one disadvantage is…',
    'Overall, I think this offers better value for money.'
  ]},
  justifying:{title:'Justifying Your Choice', items:[
    'We chose this because…',
    "Even though it's more expensive, it offers…",
    'This fits our budget and still…',
    'I can justify this decision because…'
  ]}
};

/* ===== Section 6: Listening Script — "Making the Call" =====
   Two characters: Mali and Todd, event planning colleagues comparing vendors. */
const BEFORE_LISTEN = {
  setup: 'Mali and Todd compare two vendors and make a recommendation. Listen and find out which one they choose.',
  guesses: [
    'They choose the cheaper vendor without discussion.',
    'They compare both, then justify their final choice.',
    'They cannot decide and cancel the event.',
    'They choose the vendor with the worst reviews.'
  ]
};
const LISTEN = {
  intro: 'The Events Office. Mali and Todd are comparing two catering proposals for an 80-guest gala dinner.',
  lines: [
    {who:'Mali', text:"Okay, let's compare the two proposals. Vendor A quoted 45,000 baht, Vendor B quoted 62,000.", kind:'staff'},
    {who:'Todd', text:"That's a big difference. What's the trade-off?", kind:'delegate'},
    {who:'Mali', text:'Vendor A has a smaller menu, just three main dishes, and their reviews are average. Vendor B has six main dishes, dietary options, and excellent reviews.', kind:'staff'},
    {who:'Todd', text:'Do we know what the client cares about most?', kind:'delegate'},
    {who:'Mali', text:'Yes, I checked. The client specifically mentioned they have several guests with dietary requirements.', kind:'staff'},
    {who:'Todd', text:'That changes things. Vendor A might not be suitable if they can\'t handle that flexibly.', kind:'delegate'},
    {who:'Mali', text:'Exactly. Even though Vendor B costs more, I think it offers better value for money here, because it actually meets what the client needs.', kind:'staff'},
    {who:'Todd', text:'Agreed. Let\'s recommend Vendor B, and I\'ll write up the justification for the client.', kind:'delegate'},
    {who:'Mali', text:'Perfect. Mention the dietary flexibility first, that\'s the strongest reason.', kind:'staff'}
  ]
};
const LISTEN_QUESTIONS = [
  {q:'What is Vendor A\'s quote?', opts:['45,000 baht', '62,000 baht', '80,000 baht'], correct:0},
  {q:'What is one disadvantage of Vendor A?', opts:['It has excellent reviews','It has a smaller menu with average reviews','It costs too much'], correct:1},
  {q:'What does the client specifically care about, according to Mali?', opts:['The color of the tablecloths','Several guests have dietary requirements','The exact seating chart'], correct:1},
  {q:'Which vendor do Mali and Todd recommend?', opts:['Vendor A', 'Vendor B', 'Neither, they cancel the event'], correct:1},
  {q:'What reason does Mali say should come first in the justification?', opts:['The price difference','The dietary flexibility','The number of reviews'], correct:1}
];

/* ===== Section 7: After Listening — script analysis (bonus) ===== */
const SCRIPT_ANALYSIS = [
  {strategy:'Starting the comparison with hard numbers', example:'"Vendor A quoted 45,000 baht, Vendor B quoted 62,000."'},
  {strategy:'Naming the trade-off directly', example:'"What\'s the trade-off?"'},
  {strategy:'Checking the client\'s actual priority before deciding', example:'"Do we know what the client cares about most?"'},
  {strategy:'Justifying the choice with a clear reason, not just a feeling', example:'"...it actually meets what the client needs."'},
  {strategy:'Deciding which reason to lead with in the final justification', example:'"Mention the dietary flexibility first, that\'s the strongest reason."'}
];

/* ===== Section 6b: Compare and Decide =====
   PAIR task using the .ab-toggle/.ab-btn/.ab-view component (same pattern
   as Unit 10's info-gap and Unit 11's jigsaw, applied here to a comparison
   task instead): Student A reads Vendor A's full proposal, Student B reads
   Vendor B's, then together they must agree on and justify a recommendation. */
const VENDOR_A = {
  name:'Vendor A: Golden Spoon Catering',
  price:'45,000 baht for 80 guests',
  menu:'3 main dishes, standard menu only',
  dietary:'Limited: vegetarian only, no other options',
  reviews:'3.5 out of 5 stars from past events',
  flexibility:'Menu is fixed once booked, changes are not possible'
};
const VENDOR_B = {
  name:'Vendor B: Andaman Feast Co.',
  price:'62,000 baht for 80 guests',
  menu:'6 main dishes, seasonal menu',
  dietary:'Vegetarian, vegan, halal, and allergy options available',
  reviews:'4.8 out of 5 stars from past events',
  flexibility:'Menu can be adjusted up to 3 days before the event'
};
const MODEL_RECOMMENDATION = 'We recommend Vendor B. Even though it costs more, it offers far better dietary flexibility and much stronger reviews, which matches exactly what this client asked for. The extra cost is justified by the lower risk of an unhappy guest with a dietary requirement.';

/* ===== Section 8: Speaking Practice — Negotiation =====
   Reframed as a price/terms negotiation with the chosen vendor, rather than
   a present-and-justify scene, so it doesn't just repeat the "explain your
   choice" shape already covered in s6b and the Writing Task. */
const ROLEPLAY_CARDS = {
  staff:{title:'Role Card A: Event Planner', body:'You chose Vendor B, but the price is a little over budget.',
    role:'Negotiate with the vendor. Try to get a better price or some added value, without being rude.',
    phrases:['Is there any flexibility on the price?', 'Could you include… at no extra cost?', "We'd like to move forward if we can agree on…", 'What can you offer within our budget?']},
  visitor:{title:'Role Card B: Vendor Representative', body:'You want to win this contract, but you also need to protect your margin.',
    role:'Listen to the request and negotiate a fair compromise.',
    phrases:['Let me see what I can do.', 'I can offer a discount if…', "That's a bit difficult, but I can…", 'We have a deal.']}
};
const CHALLENGE_SCENARIOS = [
  {tag:'Scenario 1', text:'The client says the price difference is too high and pushes back. Justify your recommendation further.'},
  {tag:'Scenario 2', text:'A colleague strongly disagrees with your choice and prefers the other vendor. Discuss and try to reach an agreement.'},
  {tag:'Scenario 3', text:'The client asks you to compare a third, brand-new vendor with no reviews yet. What do you say?'}
];

/* ===== Practice: Peer Checklist + bonus situations ===== */
const PEER_CHECKLIST = [
  'Did they compare both options fairly, not just by price?',
  'Did they mention at least one advantage and one disadvantage?',
  'Did they explain the trade-off clearly?',
  'Did they justify their final recommendation with a real reason?',
  'Did they answer the client\'s questions confidently?',
  'Did their language sound professional and well-organized?'
];
const BONUS_ANNOUNCEMENT_SITUATIONS = [
  {tag:'Situation A', text:'Compare two AV equipment vendors: one cheaper with basic equipment, one pricier with premium equipment and 24-hour support.'},
  {tag:'Situation B', text:'Compare two wellness activity partners for a retreat: one offers only yoga, the other offers yoga, meditation, and spa treatments at a higher price.'}
];

/* ===== Section 9: Writing Task ===== */
const WRITING_TASK = {
  prompt: 'Write a short recommendation email (4–6 sentences) to a client explaining which vendor you chose and why, including at least one trade-off you considered.',
  discussion: [
    {title:'Tourism Business Management', text:'You are comparing two transport companies for a delegate airport shuttle service: one cheaper with older vehicles, one pricier with newer vehicles and better punctuality. Write your recommendation.'},
    {title:'Wellness Tourism Management', text:'You are comparing two spa suppliers for a wellness retreat: one offers lower prices but fewer treatment types, the other offers more treatment types at a higher price. Write your recommendation.'}
  ]
};

/* ===== Section 10: Self-Check (RUBRIC) ===== */
const RUBRIC = [
  {k:'vocab', lbl:'Comparison Vocabulary', sub:'I can use compare, trade-off, advantage, and disadvantage correctly.'},
  {k:'compare', lbl:'Comparing Fairly', sub:'I can compare two options by more than just price.'},
  {k:'tradeoff', lbl:'Explaining a Trade-Off', sub:'I can clearly explain the trade-off between two options.'},
  {k:'justify', lbl:'Justifying a Recommendation', sub:'I can justify a recommendation with a real, clear reason.'},
  {k:'writing', lbl:'Writing a Recommendation', sub:'I can write a short, clear recommendation email to a client.'}
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 12: Choosing a Catering Vendor',
  unitCode: 'unit-12'
};
