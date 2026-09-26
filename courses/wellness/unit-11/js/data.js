/* ===================== UNIT 11 CONTENT DATA — WELLNESS TOURISM PROMOTION =====================
   Supplementary lesson supporting real CLO 4, CLO 6, and CLO 7 (see the
   TQF3 Wellness Tourism spec) and preparing students for the real,
   TQF-specified Week 16 Final Wellness Tourism Group Presentation
   (topics include "promoting a spa or retreat programme"). This is NOT
   an official TQF unit — it is a supplementary promotional-English lesson
   built to feed directly into that final presentation.

   Practice-heavy, output-based: LEARN -> NOTICE -> PRACTICE -> CREATE ->
   SUBMIT. The final output is a real WRITTEN promotional advertisement
   (a Promotion Card + a 60-100 word ad), not a flyer, poster, or graphic
   — the assessed product is the students' own English, not a design.
   Replaces the previous invented "The Guest Who Didn't Feel Well" unit,
   which was unrelated to this lesson's purpose. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Look at the Ad'},
  {key:'s2', label:'Vocabulary & Phrases'},
  {key:'s3', label:'Language Practice'},
  {key:'s4', label:'Choose Your Product'},
  {key:'s5', label:'Promotion Card'},
  {key:'s6', label:'Write Your Advertisement'},
  {key:'s7', label:'Output Check'},
  {key:'s8', label:'Extra Practice'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Look at the Ad (warm-up) =====
   Each ad's `options` mixes phrases that really do appear in its text
   (correct:true) with plausible promotional phrases that do NOT appear
   in that ad (correct:false) — a real judgment task, not just clicking
   everything. */
const SAMPLE_ADS = [
  {
    title:'Ad 1: Phuket Relaxation Retreat',
    image:'../../../assets/images/wellness-u11-ad1.jpg',
    text:'Phuket Relaxation Retreat is a one-day wellness experience for tourists who want to relax and feel refreshed. Our package includes Thai massage, yoga, a healthy lunch, and meditation. Guests can enjoy a peaceful wellness experience and reduce stress. The price is 2,500 THB. Come and enjoy Phuket! Book your wellness experience today!',
    options: [
      {text:'Our package includes', correct:true},
      {text:'Guests can enjoy', correct:true},
      {text:'The price is', correct:true},
      {text:'Come and enjoy', correct:true},
      {text:'Book your', correct:true},
      {text:'It is suitable for', correct:false},
      {text:'The programme lasts', correct:false}
    ]
  },
  {
    title:'Ad 2: Andaman Mindfulness Retreat',
    image:'../../../assets/images/wellness-u11-ad2.jpg',
    text:'Discover the Andaman Mindfulness Retreat, a 3-day programme for guests who want to slow down. Our package includes daily meditation, gentle yoga, and natural healthy food. Guests can experience a calm mind and a healthy body. The programme lasts three days. Come and enjoy a peaceful escape by the sea!',
    options: [
      {text:'Discover', correct:true},
      {text:'Our package includes', correct:true},
      {text:'Guests can experience', correct:true},
      {text:'The programme lasts', correct:true},
      {text:'Come and enjoy', correct:true},
      {text:'Book your', correct:false},
      {text:'This package is perfect for', correct:false}
    ]
  }
];
const WARMUP_QUESTIONS = [
  'What is this?',
  'What is the product?',
  'Who is it for?',
  'What can tourists do?',
  'What information can you see?',
  'Which words make the ad interesting?'
];

/* ===== Section 2: Vocabulary & Promotional Phrases =====
   10 essential words only, each with a real photo (not an emoji)
   illustrating its meaning, generated via Gamma and stored locally at
   assets/images/wellness-u11-vocab-<id>.jpg, matching this site's
   existing asset-naming convention. */
const VOCAB = [
  {id:'resort', photo:'../../../assets/images/wellness-u11-vocab-resort.jpg', nm:'Wellness Resort', type:'n.', def:'A hotel that offers health and relaxation services.', ex:'Guests love this wellness resort in Phuket.'},
  {id:'spa', photo:'../../../assets/images/wellness-u11-vocab-spa.jpg', nm:'Spa', type:'n.', def:'A place with treatments like massage and skin care.', ex:'The hotel spa is open every day.'},
  {id:'retreat', photo:'../../../assets/images/wellness-u11-vocab-retreat.jpg', nm:'Retreat', type:'n.', def:'A quiet place to relax and improve your health.', ex:'Join our yoga retreat this weekend.'},
  {id:'massage', photo:'../../../assets/images/wellness-u11-vocab-massage.jpg', nm:'Massage', type:'n.', def:'Pressing and rubbing the body to relax it.', ex:'A Thai massage can reduce stress.'},
  {id:'yoga', photo:'../../../assets/images/wellness-u11-vocab-yoga.jpg', nm:'Yoga', type:'n.', def:'Gentle exercise and breathing for body and mind.', ex:'We offer a morning yoga class.'},
  {id:'meditation', photo:'../../../assets/images/wellness-u11-vocab-meditation.jpg', nm:'Meditation', type:'n.', def:'Quiet time to calm your mind.', ex:'Meditation helps guests feel peaceful.'},
  {id:'package', photo:'../../../assets/images/wellness-u11-vocab-package.jpg', nm:'Package', type:'n.', def:'A group of services sold together.', ex:'Our wellness package includes three activities.'},
  {id:'relaxing', photo:'../../../assets/images/wellness-u11-vocab-relaxing.jpg', nm:'Relaxing', type:'adj.', def:'Calm and comfortable, not stressful.', ex:'It is a relaxing place for tourists.'},
  {id:'suitablefor', photo:'../../../assets/images/wellness-u11-vocab-suitablefor.jpg', nm:'Suitable For', type:'phr.', def:'Right or good for someone.', ex:'This package is suitable for busy tourists.'},
  {id:'included', photo:'../../../assets/images/wellness-u11-vocab-included.jpg', nm:'Included', type:'adj.', def:'Part of the package, no extra cost.', ex:'Breakfast is included in the price.'}
];
const FILL_BLANK = [
  {q:'Guests can __________ a relaxing massage.', a:'enjoy'},
  {q:'Our package __________ yoga, meditation, and a healthy lunch.', a:'includes'},
  {q:'This package is __________ for tourists who want to relax.', a:'suitable'},
  {q:'The programme __________ for one full day.', a:'lasts'},
  {q:'__________ your wellness experience today!', a:'Book'}
];
const PROMO_PHRASES = [
  'Our package includes...', 'Guests can enjoy...', 'This package is perfect for...', 'It is suitable for...',
  'Guests can experience...', 'The programme lasts...', 'The price is...', 'Come and enjoy...',
  'Relax and refresh...', 'Discover...', 'Book your...', 'Enjoy a wellness experience in Phuket.'
];

/* ===== Section 3: Language Practice ===== */
const CHOOSE_PHRASE_ITEMS = [
  {situation:'You want to describe a massage in your ad.', options:[
    {text:'We have a massage.', good:false, note:'Too plain for an advertisement. It just states a fact.'},
    {text:'Guests can enjoy a relaxing massage.', good:true, note:'Correct! "Guests can enjoy..." sounds like real promotional English.'}
  ]},
  {situation:'You want to say what is in your package.', options:[
    {text:'The package has yoga and meditation.', good:false, note:'Understandable, but flat. Not promotional.'},
    {text:'Our package includes yoga and meditation.', good:true, note:'Correct! "Our package includes..." is a natural promotional phrase.'}
  ]},
  {situation:'You want to say who the package is for.', options:[
    {text:'It is good for busy people.', good:false, note:'A plain sentence, not promotional language.'},
    {text:'This package is perfect for busy people.', good:true, note:'Correct! "This package is perfect for..." sells the idea.'}
  ]},
  {situation:'You want to invite tourists to your retreat.', options:[
    {text:'Come here.', good:false, note:'Too short and plain for an advertisement.'},
    {text:'Come and enjoy a peaceful retreat.', good:true, note:'Correct! "Come and enjoy..." is warm and inviting.'}
  ]},
  {situation:'You want to end your ad with the price.', options:[
    {text:'The price is 2,000.', good:false, note:'Missing the currency and no call to action.'},
    {text:'Book your wellness experience for only 2,000 THB!', good:true, note:'Correct! This includes a clear price and a call to action.'}
  ]}
];
const REORDER_ITEMS = [
  {situation:'Build a sentence about what is included.', chunks:['Our package', 'includes', 'a Thai massage.']},
  {situation:'Build a sentence inviting a guest to relax.', chunks:['Guests can enjoy', 'a peaceful', 'retreat.']},
  {situation:'Build a sentence about who the package is for.', chunks:['This package', 'is perfect', 'for tourists.']},
  {situation:'Build a sentence with a call to action.', chunks:['Book your', 'wellness experience', 'today!']}
];

/* ===== Section 4: Choose Your Product ===== */
const WELLNESS_PRODUCTS = [
  {id:'spa', text:'A spa', photo:'../../../assets/images/wellness-u11-product-spa.jpg'},
  {id:'resort', text:'A wellness resort', photo:'../../../assets/images/wellness-u11-product-resort.jpg'},
  {id:'yogaretreat', text:'A yoga retreat', photo:'../../../assets/images/wellness-u11-product-yogaretreat.jpg'},
  {id:'thaimassage', text:'A Thai massage experience', photo:'../../../assets/images/wellness-u11-product-thaimassage.jpg'},
  {id:'package', text:'A wellness package', photo:'../../../assets/images/wellness-u11-product-package.jpg'},
  {id:'lifestyle', text:'A healthy lifestyle programme', photo:'../../../assets/images/wellness-u11-product-lifestyle.jpg'},
  {id:'mindfulness', text:'A mindfulness retreat', photo:'../../../assets/images/wellness-u11-product-mindfulness.jpg'},
  {id:'phuketexp', text:'A Phuket wellness experience', photo:'../../../assets/images/wellness-u11-product-phuketexp.jpg'}
];

/* ===== Section 5: Promotion Card ===== */
const CARD_FIELDS = [
  {id:'product', label:'1. Product Name', placeholder:'e.g. Phuket Relaxation Retreat'},
  {id:'location', label:'2. Destination / Location', placeholder:'e.g. Phuket, Thailand'},
  {id:'for', label:'3. Who Is It For?', placeholder:'e.g. Tourists who want to relax'},
  {id:'includes', label:'4. What Does It Include?', placeholder:'e.g. Thai massage, yoga, healthy lunch, meditation'},
  {id:'benefit1', label:'5. Benefit 1', placeholder:'e.g. Reduce stress'},
  {id:'benefit2', label:'6. Benefit 2', placeholder:'e.g. Relax your body and mind'},
  {id:'price', label:'7. Price', placeholder:'e.g. 2,500 THB'},
  {id:'duration', label:'8. Duration', placeholder:'e.g. 1 day'},
  {id:'slogan', label:'9. Promotional Slogan', placeholder:'e.g. "Relax. Refresh. Enjoy Phuket!"'},
  {id:'cta', label:'10. Call to Action', placeholder:'e.g. "Book your wellness experience today!"'}
];
const MODEL_CARD = {
  product:'Phuket Relaxation Retreat', location:'Phuket, Thailand', for:'Tourists who want to relax',
  includes:'Thai massage, yoga, healthy lunch, and meditation', benefit1:'Reduce stress', benefit2:'Relax your body and mind',
  price:'2,500 THB', duration:'1 day', slogan:'"Relax. Refresh. Enjoy Phuket!"', cta:'"Book your wellness experience today!"'
};

/* ===== Section 6: Write Your Advertisement (MAIN OUTPUT) ===== */
const MODEL_AD = 'Phuket Relaxation Retreat is a one-day wellness experience for tourists who want to relax and feel refreshed. The package includes Thai massage, yoga, a healthy lunch, and meditation. Guests can enjoy a peaceful wellness experience and reduce stress. The package costs 2,500 THB. Relax, refresh, and enjoy Phuket! Book your wellness experience today!';

/* ===== Section 7: Output Check ===== */
const CHECKLIST_ITEMS = [
  'We have a product name.',
  'We say what the product is and where it is.',
  'We say who it is for.',
  'We say what is included.',
  'We give at least 2 benefits.',
  'We include the price and how long it lasts.',
  'We use at least 3 promotional phrases from class.',
  'Our advertisement is about 60-100 words.',
  'Both partners wrote part of the advertisement.',
  'Our English is simple and easy to understand.'
];

/* ===== Section 8: Extra Practice (30-minute extension) ===== */
const EXTENSION_PRODUCT = {
  product:'Phuket Herbal Wellness Day', includes:'Herbal steam, Thai massage, herbal drink',
  price:'1,800 THB', duration:'4 hours', for:'Tourists who want to relax'
};

/* ===================== TEACHER GUIDE (courses/wellness/unit-11/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Unit 11: Wellness Tourism Promotion',
  learningOutcome: 'Students write a short promotional advertisement (60-100 words) for a wellness tourism product or experience, working with a partner, using basic English promotional language. This is a supplementary lesson supporting CLO 4, CLO 6, and CLO 7, and direct preparation for the Week 16 Final Wellness Tourism Group Presentation (one of whose topics is "promoting a spa or retreat programme").',
  bloomsLevel: 'Create (with a full Remember -> Understand -> Apply -> Analyze -> Create progression across the lesson)',
  addieFocus: 'Practice-heavy by design: students read real-style ads, notice the promotional language, practice it in short controlled activities (choose the phrase, fill the blank, reorder words), then use a structured Promotion Card to scaffold their own original written advertisement. No design, flyer, or graphic component — the assessed output is the students’ own written English.',
  grouping: 'Pairs throughout Sections 4-7 (Choose Your Product, Promotion Card, Write Your Advertisement, Output Check). Both students must contribute writing to the final advertisement.',
  timing: [
    {block:'Look at the Ad (warm-up)', time:'15 min', ref:'Section 1'},
    {block:'Vocabulary & Phrases', time:'20 min', ref:'Section 2'},
    {block:'Language Practice (3 activities)', time:'35-40 min', ref:'Section 3'},
    {block:'Choose Your Product', time:'10 min', ref:'Section 4'},
    {block:'Promotion Card', time:'20-25 min', ref:'Section 5'},
    {block:'Write Your Advertisement (MAIN OUTPUT)', time:'25-30 min', ref:'Section 6'},
    {block:'Output Check', time:'10-15 min', ref:'Section 7'},
    {block:'Extra Practice (optional, 30 min)', time:'30 min', ref:'Section 8'}
  ],
  materials: [
    '2-3 real wellness/spa ads or flyers for Section 1 (printed or projected), if available',
    'Students work in pairs from Section 4 onward — seat them together before Section 4'
  ],
  teacherPrompts: [
    'Before Section 5: "Look at the model card. What information does a tourist actually need before booking?"',
    'During Section 6: "Are you both writing, or is one partner doing everything?"',
    'After Section 7: "Which phrase from class did you use in your advertisement?"'
  ],
  commonProblems: [
    {problem: 'One partner writes the whole advertisement while the other watches.', fix: 'Section 5’s Promotion Card splits fields 1-5 and 6-10 between Student A and Student B by design. Enforce this split verbally and check both students can explain their part before Section 6.'},
    {problem: 'Students paste in a fully AI-generated advertisement.', fix: 'There is no image or design step, and the teacher circulates throughout Sections 5-6. Ask students to explain, out loud, why they chose a specific phrase, this quickly surfaces text nobody in the pair actually understands.'}
  ],
  fastClassExtension: 'Move straight to Section 8 (Extra Practice): students independently write a second advertisement for a new product, without a partner.',
  slowClassCompression: 'Section 3’s three practice activities can be trimmed to two if time is short, none of them gate Section 4 onward.',
  assessment: 'The Section 6 written advertisement is the primary graded output (see the simple 6-criterion, 0-2 point rubric in the teacher deliverable). Section 7’s checklist is student self-check, not separately graded.'
};

/* ===================== ASSETS ===================== */
const SECTION_PHOTOS = {
  hero: { src:'../../../assets/images/wellness-u11-hero.jpg', alt:'A spa massage table with fresh flowers and oils beside a pool at a Phuket wellness resort' }
};

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 11: Wellness Tourism Promotion',
  unitCode: 'unit-11'
};
