/* ===================== UNIT 11 CONTENT DATA — APOLOGIZING & SAYING NO PROFESSIONALLY =====================
   All lesson content lives here: patterns, vocabulary, scenarios, quiz link, rubric.
   Nothing here is UI logic — see app.js for rendering/state/voice/progress-tracking.

   Real TQF3 Week 11 topic (CLO 2, CLO 4): Apologizing and saying no
   professionally in a MICE context. Practice-heavy, not explanation-heavy —
   every section after "Learn the Patterns" is students producing language,
   not reading about it. Replaces the previous invented "Double-Booked Room"
   unit, which taught root-cause analysis, a real skill but not this week's
   real TQF topic. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Quick Start'},
  {key:'s2', label:'Learn the Patterns'},
  {key:'s3', label:'Take Note'},
  {key:'s4', label:'Vocabulary'},
  {key:'s5', label:'Choose the Best Response'},
  {key:'s6', label:'Fix the Response'},
  {key:'s7', label:'Build the Response'},
  {key:'s8', label:'What Would You Say?'},
  {key:'s9', label:'MICE Scenario Challenge'},
  {key:'s10', label:'Unit Quiz'},
  {key:'s11', label:'Speaking Role Play'},
  {key:'s12', label:'Quick Review'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Quick Start ===== */
const QUICK_START = {
  facts: [
    'A guest calls asking to join a workshop that is already full.',
    'This kind of request happens all the time at MICE events.'
  ],
  message: '"Hi, I really wanted to join the 10 AM workshop. Can I still get in?"',
  question: 'Before you learn anything else, what do you think a professional MICE staff member should say first?',
  options: [
    {text:'"No, sorry, it\'s full."', good:false, note:"Honest, but it stops there. The guest is left with no help and no next step."},
    {text:'"That\'s not possible today."', good:false, note:"A flat refusal. It doesn't acknowledge the guest or offer any way forward."},
    {text:'"I understand, and I\'m sorry it\'s full. Let me see what I can offer you instead."', good:true, note:'This is the pattern this unit teaches: acknowledge, apologize, then offer something. You will practice this exact structure today.'}
  ]
};

/* ===== Section 2: Learn the Patterns ===== */
const APOLOGY_PATTERN = {
  name: 'How to Apologize',
  formula: 'SORRY → REASON → SOLUTION',
  steps: [
    {k:'SORRY', example:"I'm sorry about the delay."},
    {k:'REASON', example:'The room is not ready yet.'},
    {k:'SOLUTION', example:'Let me check another room for you.'}
  ]
};
const SAYING_NO_PATTERN = {
  name: 'How to Say No Professionally',
  formula: 'POLITE NO → REASON → ALTERNATIVE',
  steps: [
    {k:'POLITE NO', example:"I'm afraid that won't be possible"},
    {k:'REASON', example:'because the room is already booked.'},
    {k:'ALTERNATIVE', example:'But I can offer you another room.'}
  ]
};
const PATTERN_TIPS = [
  'Be polite.',
  'Say sorry clearly.',
  'Show that you understand the problem.',
  "Don't blame the guest.",
  'Offer help when possible.',
  'Use a calm and professional tone.'
];
const NEVER_SAY = ['"No."', '"We can\'t."', '"That\'s impossible."', '"That\'s not my problem."'];

/* ===== Section 3: Take Note (personal phrase bank) ===== */
const TAKE_NOTE_BANKS = [
  {id:'apology', label:'My Apology Phrases', sub:'SORRY → REASON → SOLUTION', placeholder:'Write your own apology phrase here...'},
  {id:'no', label:'My "Saying No" Phrases', sub:'POLITE NO → REASON → ALTERNATIVE', placeholder:'Write your own polite-refusal phrase here...'}
];

/* ===== Section 4: Vocabulary =====
   Each word has a real photo (not an emoji) illustrating its meaning,
   generated via Gamma and stored locally at assets/images/mice-u11-vocab-<id>.jpg,
   matching this site's existing asset-naming convention. */
const VOCAB = [
  {id:'apologize', photo:'../../../assets/images/mice-u11-vocab-apologize.jpg', nm:'Apologize', type:'v.', def:'To say sorry for a problem.', ex:'I want to apologize for the delay.'},
  {id:'delay', photo:'../../../assets/images/mice-u11-vocab-delay.jpg', nm:'Delay', type:'n.', def:'When something happens later than planned.', ex:"I'm sorry for the delay."},
  {id:'unavailable', photo:'../../../assets/images/mice-u11-vocab-unavailable.jpg', nm:'Unavailable', type:'adj.', def:'Not able to be used or given right now.', ex:'That room is unavailable this afternoon.'},
  {id:'alternative', photo:'../../../assets/images/mice-u11-vocab-alternative.jpg', nm:'Alternative', type:'n.', def:'A different choice.', ex:'I can offer you an alternative.'},
  {id:'inconvenience', photo:'../../../assets/images/mice-u11-vocab-inconvenience.jpg', nm:'Inconvenience', type:'n.', def:'A small problem or trouble.', ex:"I'm sorry for the inconvenience."},
  {id:'solution', photo:'../../../assets/images/mice-u11-vocab-solution.jpg', nm:'Solution', type:'n.', def:'A way to fix a problem.', ex:'Let me find a solution for you.'},
  {id:'unfortunately', photo:'../../../assets/images/mice-u11-vocab-unfortunately.jpg', nm:'Unfortunately', type:'adv.', def:'Sadly, it is a problem that...', ex:'Unfortunately, that item is not available.'},
  {id:'request', photo:'../../../assets/images/mice-u11-vocab-request.jpg', nm:'Request', type:'v./n.', def:'To ask for something.', ex:'The guest made a special request.'},
  {id:'accommodate', photo:'../../../assets/images/mice-u11-vocab-accommodate.jpg', nm:'Accommodate', type:'v.', def:'To make a change to help someone.', ex:'We will try to accommodate your request.'},
  {id:'flexible', photo:'../../../assets/images/mice-u11-vocab-flexible.jpg', nm:'Flexible', type:'adj.', def:'Able to change easily when needed.', ex:'Please be flexible with the schedule.'}
];
const FILL_BLANK = [
  {q:"I'm sorry for the __________. The bus will arrive in 10 minutes.", a:'delay'},
  {q:"I'm afraid that room is __________ today, but I can offer you another one.", a:'unavailable'},
  {q:'That treatment is fully booked. Would you like an __________?', a:'alternative'},
  {q:'I understand this is an __________. Let me see what I can do.', a:'inconvenience'},
  {q:'Let me find a __________ for you right away.', a:'solution'}
];

/* ===== Section 5: Choose the Best Response (5 scenarios, M/I/C/E/Wellness) ===== */
const CHOOSE_RESPONSE_ITEMS = [
  {tag:'Meetings', situation:'The meeting room is double-booked. Another group is already inside.', options:[
    {text:"That's not my problem.", good:false, note:'This blames no one, but it helps no one either. Always acknowledge and help.'},
    {text:"I'm very sorry about this mix-up. Let me find you another room right away.", good:true, note:'Correct! Apologize, then offer a solution immediately.'},
    {text:'You will have to wait outside.', good:false, note:'An instruction with no apology and no real solution.'}
  ]},
  {tag:'Incentives', situation:'A guest on the incentive trip asks for a private car, but only the shared shuttle is available.', options:[
    {text:"Sorry, we don't have that.", good:false, note:'Too short. No alternative offered.'},
    {text:"I'm afraid a private car isn't available today, but I can arrange the next shuttle for you in 10 minutes.", good:true, note:'Correct! Polite no, then a reason, then an alternative.'},
    {text:'A private car is not possible.', good:false, note:'A blunt refusal with no softening language and no alternative.'}
  ]},
  {tag:'Conferences', situation:'A speaker is running 20 minutes late and delegates are waiting.', options:[
    {text:"I'm sorry for the delay. The speaker will begin in about 20 minutes. Thank you for your patience.", good:true, note:'Correct! A clear apology with real information.'},
    {text:"I don't know when they will start.", good:false, note:'Unhelpful. Guests need real information, not uncertainty.'},
    {text:"It's not my fault.", good:false, note:'Defensive. Never make excuses.'}
  ]},
  {tag:'Exhibitions', situation:"A booth has a technical problem, the screen isn't turning on.", options:[
    {text:"That's a technical issue, not mine to fix.", good:false, note:'Passes the problem along without helping.'},
    {text:"I'm sorry, we're having a small technical problem. Let me call our technician to fix it now.", good:true, note:'Correct! Apologize, then commit to a real next step.'},
    {text:'It will probably work again soon.', good:false, note:'Vague and unhelpful. Offer a real action instead.'}
  ]},
  {tag:'Wellness Tourism', situation:"A guest's favorite treatment is unavailable this week because the therapist is on leave.", options:[
    {text:"That treatment isn't available. Sorry.", good:false, note:'No alternative given.'},
    {text:"I'm sorry, that treatment isn't available this week. May I recommend a similar treatment with another therapist?", good:true, note:'Correct! Apology plus a real alternative.'},
    {text:'You should have booked earlier.', good:false, note:'Blames the guest. Never do this.'}
  ]}
];

/* ===== Section 6: Fix the Response ===== */
const FIX_RESPONSE_ITEMS = [
  {bad:"You should have told us earlier. We can't do anything now.", options:[
    {text:"You should have told us earlier. We can't do anything now.", good:false, note:'This is the same unprofessional line. It blames the guest.'},
    {text:"I understand, and I'm sorry for the short notice. Let me see what I can do.", good:true, note:'Correct! Acknowledge, apologize, offer help.'}
  ]},
  {bad:"That's not my problem.", options:[
    {text:"I'm sorry about the problem. Let me see what I can do.", good:true, note:'Correct! This takes ownership of helping.'},
    {text:"That's not my job.", good:false, note:'Still refuses to help.'}
  ]},
  {bad:"We don't have that.", options:[
    {text:"We don't have that. Sorry.", good:false, note:'Still no alternative offered.'},
    {text:"I'm afraid that's not available, but I can offer you an alternative.", good:true, note:'Correct! Polite no, then an alternative.'}
  ]}
];

/* ===== Section 7: Build the Response (click the chunks in order) ===== */
const BUILD_RESPONSE_ITEMS = [
  {situation:'Complete a polite apology with a solution.', chunks:["I'm sorry,", 'that table is booked,', 'but I can offer you', 'another table.']},
  {situation:'Complete a fast, professional fix.', chunks:['Let me find', 'a solution', 'for you', 'right away.']},
  {situation:'Complete a polite refusal with an alternative.', chunks:["I'm afraid that won't be possible,", 'but I can offer you', 'the 3 PM slot', 'instead.']}
];

/* ===== Section 8: What Would You Say? (open response, self-check) ===== */
const WHAT_WOULD_YOU_SAY_ITEMS = [
  {situation:'A guest complains that their invoice has the wrong amount.', model:"I'm very sorry about that mistake. Let me check the invoice and correct it right away."},
  {situation:'A delegate wants a front-row seat, but the front row is already full.', model:"I'm afraid the front row is full, but I can offer you an excellent seat in the second row."},
  {situation:"An exhibitor needs extra power outlets that your team can't provide today.", model:"I understand, and I'm sorry we can't add extra outlets today. I can request that for your booth at the next event."}
];

/* ===== Section 9: MICE Scenario Challenge (7 scenarios, all 5 MICE areas) ===== */
const SCENARIO_BANK = [
  {tag:'Meetings', situation:'The meeting room is double-booked. Another group is already inside.', model:"I'm very sorry about this mix-up. Let me find you another room right away."},
  {tag:'Meetings', situation:'A client asks to change the meeting room at the last minute.', model:"I'm afraid that specific room isn't available right now, but I can offer you Room B, which is free."},
  {tag:'Incentives', situation:'A guest on the incentive trip asks for a private car, but only the shared shuttle is available.', model:"I'm afraid a private car isn't available today, but I can arrange the next shuttle for you in 10 minutes."},
  {tag:'Conferences', situation:'A speaker is running 20 minutes late and delegates are waiting.', model:"I'm sorry for the delay. The speaker will begin in about 20 minutes. Thank you for your patience."},
  {tag:'Exhibitions', situation:"A booth has a technical problem, the screen isn't turning on.", model:"I'm sorry, we're having a small technical problem. Let me call our technician to fix it now."},
  {tag:'Wellness Tourism', situation:'A guest wants a dietary change for their wellness meal plan with no advance notice.', model:'I understand. Let me check with the kitchen and see what we can arrange for you.'},
  {tag:'Wellness Tourism', situation:"A guest's favorite treatment is unavailable this week because the therapist is on leave.", model:"I'm sorry, that treatment isn't available this week. May I recommend a similar treatment with another therapist?"}
];

/* ===== Section 10: Unit Quiz (Google Form) ===== */
const QUIZ_FORM_URL = 'https://forms.gle/aXAgJ923xmdvBgur9';
const QUIZ_QR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" shape-rendering="crispEdges" role="img" aria-label="QR code that opens the Unit 11 quiz"><path fill="#ffffff" d="M0 0h37v37H0z"/><path stroke="#000000" d="M4 4.5h7m1 0h1m6 0h4m1 0h1m1 0h7M4 5.5h1m5 0h1m1 0h4m2 0h2m6 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m2 0h3m1 0h3m4 0h1m1 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m1 0h4m5 0h2m3 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m2 0h1m1 0h3m4 0h2m2 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m2 0h1m4 0h1m4 0h2m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h1m1 0h2m1 0h2m2 0h2m1 0h1M4 12.5h1m1 0h2m1 0h3m5 0h3m1 0h1m1 0h1m2 0h1m2 0h1m1 0h2M4 13.5h1m1 0h4m1 0h2m1 0h1m1 0h1m7 0h1m1 0h3m3 0h1M4 14.5h1m1 0h3m1 0h1m1 0h2m4 0h1m5 0h1m5 0h2M5 15.5h2m1 0h2m3 0h8m2 0h1m1 0h1m1 0h2m3 0h1M5 16.5h1m1 0h5m3 0h2m2 0h7m3 0h2M11 17.5h1m2 0h1m1 0h2m1 0h4m3 0h1m3 0h3M4 18.5h5m1 0h1m1 0h1m3 0h1m1 0h1m2 0h1m1 0h3m2 0h1m1 0h3M4 19.5h1m1 0h1m1 0h2m2 0h1m2 0h1m1 0h1m1 0h2m4 0h2m1 0h1m2 0h1M4 20.5h3m3 0h4m2 0h1m3 0h1m1 0h1m1 0h2m2 0h2m1 0h1M5 21.5h2m1 0h2m5 0h1m1 0h1m1 0h1m1 0h2m1 0h1m2 0h1m1 0h3M4 22.5h1m2 0h5m1 0h4m2 0h2m1 0h1m1 0h1m2 0h1m2 0h1M8 23.5h1m5 0h1m1 0h1m2 0h3m1 0h1m1 0h2m1 0h1m1 0h1M5 24.5h4m1 0h4m3 0h1m2 0h3m1 0h7M12 25.5h1m1 0h1m1 0h3m1 0h3m1 0h1m3 0h5M4 26.5h7m1 0h3m2 0h1m3 0h4m1 0h1m1 0h2m1 0h1M4 27.5h1m5 0h1m1 0h2m1 0h2m2 0h2m1 0h3m3 0h2m1 0h1M4 28.5h1m1 0h3m1 0h1m4 0h2m1 0h2m1 0h1m2 0h5m1 0h2M4 29.5h1m1 0h3m1 0h1m1 0h2m1 0h1m1 0h2m1 0h2m1 0h3m1 0h3m2 0h1M4 30.5h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h1m2 0h1m1 0h1m4 0h1m2 0h1m1 0h1M4 31.5h1m5 0h1m2 0h6m1 0h1m1 0h1m1 0h1m1 0h1m2 0h1m1 0h1M4 32.5h7m1 0h1m4 0h2m1 0h1m1 0h3m6 0h1"/></svg>';

/* ===== Section 11: Speaking Role Play — Professional Response Role Play ===== */
const ROLEPLAY_CARDS = {
  guest:{title:'Role Card A: Guest / Delegate / Exhibitor', body:'Choose one situation from the MICE Scenario Challenge (Section 9) and present the problem or request to your partner, out loud.',
    role:'Present the problem clearly. Listen to your partner\'s response, and react naturally.',
    phrases:['I have a problem.', 'Could you help me with this?', 'I was hoping for...', 'Is there anything you can do?']},
  staff:{title:'Role Card B: MICE Staff', body:'Listen to your partner\'s problem, then respond using all 4 steps on the right.',
    role:'Acknowledge, apologize or say no politely, then offer a real alternative or solution.',
    phrases:['I understand...', "I'm very sorry about...", "I'm afraid that won't be possible, but...", 'Let me...']}
};
const ROLEPLAY_STEPS = [
  'Acknowledge the problem.',
  'Apologize if necessary.',
  'Say no politely if necessary.',
  'Give an alternative or solution.'
];

/* ===== Section 12: Quick Review + Self-Check ===== */
const QUICK_REVIEW_PROMPT = 'Write 3 phrases from today that you can really use at work.';
const RUBRIC = [
  {k:'pattern', lbl:'Using the Apology Pattern', sub:'I can say sorry, give a reason, and offer a solution.'},
  {k:'sayno', lbl:'Saying No Professionally', sub:'I can say no politely and offer an alternative.'},
  {k:'vocab', lbl:'Unit Vocabulary', sub:'I can use apologize, alternative, inconvenience, and solution correctly.'},
  {k:'scenario', lbl:'MICE Scenarios', sub:'I can respond professionally in Meetings, Incentives, Conferences, Exhibitions, and Wellness situations.'},
  {k:'speaking', lbl:'Speaking Role Play', sub:'I can acknowledge, apologize or say no, and offer an alternative out loud with a partner.'}
];

/* ===================== TEACHER GUIDE (courses/mice/unit-11/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Unit 11: Apologizing & Saying No Professionally',
  learningOutcome: 'Students apologize for a problem and say no to a request in a way that stays professional, using two fixed patterns (SORRY → REASON → SOLUTION and POLITE NO → REASON → ALTERNATIVE), then apply both patterns across realistic Meetings, Incentives, Conferences, Exhibitions, and Wellness Tourism scenarios. This is an Apply-level, output-based unit (CLO 2, CLO 4): the goal is real-time, unscaffolded production, not analysis.',
  bloomsLevel: 'Apply',
  addieFocus: 'Practice-heavy by design: after the two patterns are taught once (Section 2), every remaining section is students producing language, moving through a real difficulty ladder, choose the best response, fix a bad response, build a response from chunks, respond with no support, then use it across five different MICE work contexts, then a partner role play.',
  grouping: 'Individual practice through Sections 1-10, pairs for Section 11 (Speaking Role Play). No fixed groups are required for this unit.',
  timing: [
    {block:'Quick Start', time:'5 min', ref:'Section 1'},
    {block:'Learn the Patterns', time:'8 min', ref:'Section 2'},
    {block:'Take Note', time:'5 min', ref:'Section 3'},
    {block:'Vocabulary', time:'8 min', ref:'Section 4'},
    {block:'Choose the Best Response', time:'8 min', ref:'Section 5'},
    {block:'Fix the Response', time:'6 min', ref:'Section 6'},
    {block:'Build the Response', time:'6 min', ref:'Section 7'},
    {block:'What Would You Say?', time:'8 min', ref:'Section 8'},
    {block:'MICE Scenario Challenge', time:'10 min', ref:'Section 9'},
    {block:'Unit Quiz (Google Form)', time:'15 min', ref:'Section 10'},
    {block:'Speaking Role Play', time:'12 min', ref:'Section 11'},
    {block:'Quick Review', time:'5 min', ref:'Section 12'}
  ],
  materials: [
    'A phone, tablet, or computer per student to open the Google Form quiz in Section 10',
    'Speakers or headphones if you play the audio examples in Section 2 or Section 4 out loud'
  ],
  teacherPrompts: [
    'Before Section 5: "What is the difference between apologizing and just saying sorry with no plan?"',
    'During Section 9: "Which of these five situations feels closest to a real problem you might face on the job?"',
    'Before Section 11: "What happens if you only apologize and never offer a next step?"'
  ],
  commonProblems: [
    {problem: 'Students memorize the two patterns as fixed sentences and freeze when a scenario does not match one exactly.', fix: 'During Section 9 and Section 11, remind students the pattern is a shape, not a script, they should adapt the wording to the real situation in front of them.'},
    {problem: 'Students skip straight to "I\'m sorry" and never actually offer an alternative or solution.', fix: 'Section 6 (Fix the Response) targets this directly, use it as a checkpoint. If students still skip the solution step in Section 11, stop and re-run one Section 6 item together as a class.'}
  ],
  fastClassExtension: 'Have pairs swap roles and repeat Section 11 with a new, unseen scenario from the MICE Scenario Challenge, cold, no preparation time.',
  slowClassCompression: 'Section 6 (Fix the Response) and Section 7 (Build the Response) can be assigned as homework if time is short, neither gates a later section.',
  assessment: 'The Unit Quiz (Section 10, 15 MC + 1 essay, 20 points) is the primary graded output. The Speaking Role Play (Section 11) is a strong informal speaking check if you want to circulate and listen in, but it is not separately scored on the site.'
};

/* ===================== ASSETS ===================== */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/mice-u11-hero.jpg', alt:'A glass meeting room door labeled "B Meeting Room" with people visible inside' }
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 11: Apologizing & Saying No Professionally',
  unitCode: 'unit-11'
};
