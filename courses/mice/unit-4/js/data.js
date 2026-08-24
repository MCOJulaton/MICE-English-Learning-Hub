/* ===================== UNIT 4 CONTENT DATA =====================
   All lesson content lives here: vocabulary, safety-net phrases, the
   "Because Bridge", 8 professional pro-tips, listening script, role-play
   material, practice items, rubric. Nothing here is UI logic — see app.js
   for rendering/state/voice/progress-tracking. Content sourced from the
   Unit 4 slide deck and the Unit 4 section of the Student Activity
   Workbook (Units 4-6), ENL 120133, Phuket Rajabhat University. */

/* The slide deck's "Point & Say" practice (Slide 4) uses only these 5 core
   words — this is the live in-class pronunciation set, kept small on purpose.
   The full 15-word glossary (introduction, business card, professional
   manner, approach, name tag, follow up, rapport, colleague, exchange,
   reception) lives in the printed Student Activity Workbook, Unit 4 Section 1. */
const VOCAB = [
  {id:'greet', ic:'👋', nm:'Greet', type:'v.', def:'To welcome or acknowledge someone when you meet them, using words or gestures.', ex:'"Always greet guests with a warm smile and eye contact."'},
  {id:'handshake', ic:'🤝', nm:'Handshake', type:'n.', def:'The act of clasping and shaking another person\'s right hand as a polite greeting or sign of agreement.', ex:'"He gave a confident handshake and held eye contact."'},
  {id:'first-impression', ic:'✨', nm:'First Impression', type:'n.', def:'The opinion or feeling formed about someone the first time you meet them, often lasting and difficult to change.', ex:'"Research shows first impressions form within 7 seconds."'},
  {id:'small-talk', ic:'💬', nm:'Small Talk', type:'n.', def:'Light, polite conversation about everyday topics, used to break the ice before a business discussion begins.', ex:'"Good small talk topics include the event, the keynote, and travel."'},
  {id:'icebreaker', ic:'🧊', nm:'Icebreaker', type:'n.', def:'An activity or question designed to help people feel comfortable and begin conversations with strangers.', ex:'"\'How\'s the expo going for you?\' is a friendly icebreaker."'}
];

const SAFETY_NET_TABS = {
  intro:{title:'The Introduction', items:[
    {ph:'Hi, I don\'t think we\'ve met. I\'m [name].', note:'A friendly, low-pressure opener for someone standing nearby.'},
    {ph:'Good evening. My name is [name] from [company].', note:'Always state your name AND where you are from: it gives the other person something to respond to.'},
    {ph:'I work in [role] at [company / university].', note:'Adds a little detail without dominating the conversation.'},
    {ph:'I specialize in [area of work].', note:'Useful once the conversation is flowing and they ask what you do.'},
    {ph:'It\'s wonderful to meet you!', note:'A warm close to the introduction stage.'}
  ]},
  icebreaker:{title:'The Icebreaker', items:[
    {ph:'How is the event?', note:'A simple, friendly question that opens the door to small talk.'},
    {ph:'Have you attended this event before?', note:'Easy to answer, and invites them to share more.'},
    {ph:'What did you think of the morning session?', note:'Shows you were paying attention and gives a shared topic.'},
    {ph:'Where have you traveled from today?', note:'A safe, welcoming topic at international MICE events.'},
    {ph:'What brings you to this event?', note:'Opens the door to hearing about their role and goals.'}
  ]},
  close:{title:'Cards & Following Up', items:[
    {ph:'Here is my card.', note:'Offering your card shows professionalism and makes it easy to follow up.'},
    {ph:'May I give you my card?', note:'A polite way to offer, especially with international colleagues.'},
    {ph:'It was great to meet you, [name].', note:'Use their name naturally as you close the conversation.'},
    {ph:'I\'ll send you that information by email.', note:'A concrete next step keeps the connection alive.'},
    {ph:'Let\'s stay connected.', note:'A warm, simple way to end and signal you want to follow up.'}
  ]}
};

/* ===== THE "BECAUSE BRIDGE" ===== */
const BRIDGE = {
  scene: 'You are at the Phuket Tourism International Convention. You just met someone from a hotel company.',
  prompt: '"So, what do you think of the expo?"',
  formula: '"I like _______ because _______."',
  youSay: '"I like this expo because I can meet so many people from the hotel industry."',
  theyReply: '"That\'s great! I agree. What about your company? What do you do?"',
  hintWords: ['this conference', 'the networking', 'our booth', 'this event', 'meeting new people'],
  tip: 'The Because Bridge doesn\'t just answer: it opens the door for the next question. That\'s how you keep a conversation alive!'
};
const BRIDGE_ROUNDS = [
  {starter:'"So, what do you think of the conference so far?"', opts:['"It\'s okay."','"I like the keynote sessions because they\'re directly useful to my company."','"I don\'t know yet."'], correct:1, why:'Option B names something specific AND gives a reason, a real Because Bridge that invites a follow-up question.'},
  {starter:'"What made you choose to attend this year?"', opts:['"I like this event because it\'s the best place to meet wellness-industry partners."','"My boss told me to come."','"No particular reason."'], correct:0, why:'This answer gives a genuine reason and naturally invites "Oh, what does your company do?"'},
  {starter:'"Have you visited our booth yet?"', opts:['"Maybe later."','"I like your booth because the wellness packages look really innovative. Tell me more?"','"I\'m too busy right now."'], correct:1, why:'A specific compliment + "because" + a question keeps the conversation open, exactly like the model.'}
];

/* ===== EIGHT PRO TIPS (Model It!) =====
   avoidImg/doImg sourced from the original Unit 4 slide deck (STEP 10/12
   panels), not stock photos — keeps every tip visually grounded in the
   same material the teacher already presents in class. */
const PRO_TIPS = [
  {id:'eye', ic:'👀', title:'Eye Contact', avoid:'Looking away, staring at the floor, or checking your surroundings. It signals you are not interested or not confident.', avoidImg:'../../../assets/images/u4-tip-eye-avoid.jpg', doThis:'Look them in the eye. It shows you are engaged, confident, and respectful.', doImg:'../../../assets/images/u4-tip-eye-do.jpg'},
  {id:'smile', ic:'😊', title:'Smile', avoid:'A fake or stiff expression. People can tell when a smile is not real. It makes you seem nervous or untrustworthy.', avoidImg:'../../../assets/images/u4-tip-smile-avoid.jpg', doThis:'A warm, genuine smile. It makes you look approachable, friendly, and easy to talk to.', doImg:'../../../assets/images/u4-tip-smile-do.jpg'},
  {id:'name', ic:'🏷️', title:'Use Their Name', avoid:'Never using the person\'s name or forgetting it right away. It signals you weren\'t really listening when they introduced themselves.', avoidImg:'../../../assets/images/u4-tip-name-avoid.jpg', doThis:'Use their name naturally: "Nice to meet you, [name]!" People feel valued when you remember and use their name.', doImg:'../../../assets/images/u4-tip-name-do.jpg'},
  {id:'listen', ic:'👂', title:'Listen More', avoid:'Talking too much about yourself without pausing. Dominating the conversation makes others feel unheard.', avoidImg:'../../../assets/images/u4-tip-listen-avoid.jpg', doThis:'Listen more than you talk. Nod, ask follow-up questions, and show genuine interest in what they say.', doImg:'../../../assets/images/u4-tip-listen-do.jpg'},
  {id:'shake', ic:'🤝', title:'Firm Handshake', avoid:'A weak, limp handshake. It signals low confidence and leaves a poor first impression before you even speak.', avoidImg:'../../../assets/images/u4-tip-shake-avoid.jpg', doThis:'A firm, confident handshake with eye contact. It immediately communicates that you are professional and self-assured.', doImg:'../../../assets/images/u4-tip-shake-do.jpg'},
  {id:'posture', ic:'🧍', title:'Stand Tall', avoid:'Slouching, crossing your arms, or looking small. Poor posture makes you appear unconfident and unapproachable.', avoidImg:'../../../assets/images/u4-tip-posture-avoid.jpg', doThis:'Stand tall with open body language. Good posture makes you look and feel more confident before you say a word.', doImg:'../../../assets/images/u4-tip-posture-do.jpg'},
  {id:'followup', ic:'📧', title:'Follow Up', avoid:'Meeting someone and never following up. Without a follow-up, the connection is quickly forgotten.', avoidImg:'../../../assets/images/u4-tip-followup-avoid.jpg', doThis:'Send a short message or email after the event. A simple "Great to meet you!" keeps the connection alive.', doImg:'../../../assets/images/u4-tip-followup-do.jpg'},
  {id:'phone', ic:'📵', title:'Avoid Your Phone', avoid:'Checking your phone while talking to someone. It sends a clear message: "You are not important to me."', avoidImg:'../../../assets/images/u4-tip-phone-avoid.jpg', doThis:'Keep your phone in your pocket. Give the person your full, undivided attention: it is the greatest sign of respect.', doImg:'../../../assets/images/u4-tip-phone-do.jpg'}
];
const EYE_CONTACT_TECHNIQUES = [
  {ic:'🔺', title:'The Triangle Method', body:'Move your gaze slowly between the person\'s left eye → right eye → mouth, forming a triangle. Repeat every few seconds. It feels natural and avoids an intense stare.', img:'../../../assets/images/u4-eyecontact-triangle.jpg'},
  {ic:'⏱️', title:'The 3-Second Rule', body:'Hold eye contact for about 3 seconds, then glance away briefly before returning. This keeps you engaged without making the other person uncomfortable.', img:'../../../assets/images/u4-eyecontact-timer.jpg'},
  {ic:'😊', title:'The Eyebrow Flash', body:'When you first meet someone, give a quick, natural raise of your eyebrows as you make eye contact. It signals friendliness and openness instantly.', img:'../../../assets/images/u4-eyecontact-eyebrow.jpg'}
];

/* ===== LISTENING SCRIPT: Networking at the Thailand Health & Business Tourism Forum ===== */
const LISTEN = {
  intro: 'A networking reception at the Thailand Health and Business Tourism Forum, Phuket. Soft music. Guests move around with drinks and name tags. Aim notices Narumon\'s name tag and approaches.',
  lines: [
    {who:'Aim', text:'Good evening! I notice your name tag says Serene Group Wellness Resorts. I\'ve heard a lot about your properties.'},
    {who:'Narumon', text:'Yes! I\'m Narumon, Wellness Events Manager at Serene Group. We handle incentive retreats and wellness conferences for corporate clients, mostly from Europe and Australia. And you are…?'},
    {who:'Aim', text:'I\'m Aim. Nice to meet you, Narumon. I work as a Corporate Event Coordinator at Pacific Convention Services in Bangkok. We mainly handle large-scale conferences and trade exhibitions.'},
    {who:'Narumon', text:'Oh, fantastic! Pacific Convention, you managed the ASEAN Business Summit last year, didn\'t you? That was an impressive event.'},
    {who:'Aim', text:'We did! 2,000 delegates over three days. I\'m still recovering! Have you attended this forum before?'},
    {who:'Narumon', text:'This is my second time. It\'s one of the best places to meet people who understand both the business and the wellness side of our industry. How about you?'},
    {who:'Aim', text:'First time for me. The morning keynote was outstanding: Dr. Lawson\'s research on wellness incentive travel trends was exactly what our corporate clients are asking about right now.'},
    {who:'Narumon', text:'Completely agree. We\'re seeing more clients requesting wellness add-ons for conferences: group yoga, meditation workshops, even Thai herbal spa sessions on the last evening.'},
    {who:'Aim', text:'That\'s really interesting. Our clients would love to know more. May I give you my card? I think there could be some great opportunities for us to collaborate.'},
    {who:'Narumon', text:'Of course. Please do. Oh, Pacific Convention, I\'ve actually been looking for a large-event partner for an upcoming project. Let me give you mine as well.'},
    {who:'Aim', text:'Thank you so much. Wellness Events Manager: wonderful title. I\'ll send you an email tomorrow so we have each other\'s contacts on record.'},
    {who:'Narumon', text:'Perfect. It was genuinely lovely to meet you, Aim. Let\'s make sure we actually follow up this time!'},
    {who:'Aim', text:'I promise: email by 9 a.m. tomorrow. Enjoy the rest of the reception!'},
    {who:'Narumon', text:'You too. I look forward to hearing from you!'}
  ]
};

const S5_ROUNDS = {
  1:{q:'Round 1: WHO? What are the names and job roles of the two people?',
     opts:['Aim (Corporate Event Coordinator) and Narumon (Wellness Events Manager)','Aim (Wellness Events Manager) and Narumon (MC)','Dr. Lawson and Narumon, both keynote speakers'], correct:0},
  2:{q:'Round 2: WHERE? What event are they attending?',
     opts:['The ASEAN Business Summit','The Thailand Health and Business Tourism Forum','A hotel staff training day'], correct:1},
  3:{q:'Round 3: SMALL TALK. What small talk topic do they discuss?',
     opts:['The weather in Phuket','The morning keynote on wellness incentive travel trends','Their travel budget'], correct:1},
  4:{q:'Round 4: THE CARD. What happens when Aim offers a business card?',
     opts:['Narumon politely declines it','Narumon accepts it, and then offers her own card in return','Narumon puts it away without looking at it'], correct:1},
  5:{q:'Round 5: LISTEN WITHOUT TEXT. Replay the audio (no transcript) and answer: what do Aim and Narumon agree to do after the event?',
     opts:['Meet again tomorrow morning in person','Aim will send a follow-up email by 9 a.m. the next day','Nothing, they just say goodbye'], correct:1}
};

/* ===== SAY IT YOURSELF (Section 7) ===== */
const S7_LEVELS = {
  1:{title:'Level 1: Full Support', body:`
      <p>Complete the Introduction:</p>
      <p style="font-family:'Oswald';font-size:18px;color:var(--navy);">Hi, I'm <input class="lvl-input" id="l1a" style="width:150px;display:inline-block;" placeholder="your name"> from <input class="lvl-input" id="l1b" style="width:190px;display:inline-block;" placeholder="your company / school">.</p>
      <button class="reveal-btn" id="l1check">Check</button>
      <div class="model-answer" id="l1fb"></div>`},
  2:{title:'Level 2: Keyword Support', body:`
      <div class="keyword-row">
        <span class="kw">I LIKE</span><span class="kw-arrow">→</span>
        <span class="kw">THIS EVENT</span><span class="kw-arrow">→</span>
        <span class="kw">BECAUSE</span><span class="kw-arrow">→</span>
        <span class="kw">MEETING NEW PEOPLE</span>
      </div>
      <p>Say the full sentence aloud using these keywords (the Because Bridge), then check your version.</p>
      <button class="reveal-btn" data-reveal="l2model">Show model answer</button>
      <div class="model-answer" id="l2model">"I like this event because I get to meet so many new people from the industry."</div>`},
  3:{title:'Level 3: Phrases Only', body:`
      <p>Look at the Safety Net phrases in Section 4. Someone asks: <b>"Have you attended this event before?"</b> Answer aloud using the phrase list, no sentence frame.</p>
      <button class="reveal-btn" data-reveal="l3model">Show model answer</button>
      <div class="model-answer" id="l3model">"This is actually my first time. The morning keynote was excellent. Have you been before?"</div>`},
  4:{title:'Level 4: Real Situation', body:`
      <p id="l4prompt" style="font-weight:700;color:var(--orange-deep);"></p>
      <button class="tb-btn" id="l4new" style="background:var(--teal);border-color:var(--teal);margin-top:10px;">New scenario</button>
      <button class="reveal-btn" data-reveal="l4model">Show model answer</button>
      <div class="model-answer" id="l4model"></div>`}
};
const L4_PROMPTS = [
  {q:'You see the morning\'s keynote speaker standing alone. Approach them and start a professional conversation.', a:'"Excuse me, I really enjoyed your keynote this morning. I\'m [name] from [company]. Do you have a moment to chat?"'},
  {q:'You accidentally bump into someone. Apologize professionally and turn it into a networking moment.', a:'"I\'m so sorry about that! I\'m [name], by the way. I don\'t think we\'ve met. What brings you to the event?"'},
  {q:'You meet someone who works at a competitor company. Keep the conversation professional and positive.', a:'"It\'s great to meet a fellow event professional! I\'d love to hear how things are going on your side of the industry."'},
  {q:'You want to end a conversation politely and offer your card.', a:'"It\'s been wonderful talking with you. Here\'s my card. I\'ll follow up by email this week!"'}
];

/* ===== INFORMATION GAP (Section 8) ===== */
const ROLE_CARDS_AB = {
  A:{title:'Student A: Conference Event Manager', body:'You work for a MICE event company in Bangkok. You are attending the networking reception to meet potential partners.',
     phrases:['Hi, I don\'t think we\'ve met. I\'m [name] from…','What brings you to this forum today?','I thought the session on… was really insightful.','May I give you my card? I think we could…','I\'ll send you an email by tomorrow morning.']},
  B:{title:'Student B: Wellness Resort Sales Manager', body:'You manage corporate wellness packages and incentive retreats at a Phuket resort. You are looking for event industry partners.',
     phrases:['It\'s lovely to meet you. I\'m [name], Sales Manager at…','Oh, I\'ve heard of your company!','We\'ve been seeing a lot of interest in wellness add-ons for…','Thank you, let me give you mine as well.','I look forward to staying in touch.']}
};

/* ===== SOMETHING WENT WRONG (Section 9) ===== */
const SITUATIONS = [
  {tag:'Situation 1', visitor:'You just realized you already forgot the name they told you 10 seconds ago.', task:'Recover honestly and professionally.', model:'"I\'m so sorry. Could you remind me of your name again? I want to make sure I remember it."'},
  {tag:'Situation 2', visitor:'"So, what do you think of the expo?"', task:'You have nothing prepared. Answer using the Because Bridge instead of freezing.', model:'"I like it because the exhibitors this year are really diverse. Have you found anything interesting?"'},
  {tag:'Situation 3', visitor:'Your phone buzzes loudly while you\'re talking to someone.', task:'Show them they matter more than your phone.', model:'"Sorry about that. I\'ll deal with it later. Please, go on. You were saying…?"'},
  {tag:'Situation 4', visitor:'Someone asks a question about your company that you genuinely don\'t know the answer to.', task:'Do NOT invent an answer.', model:'"That\'s a great question. I\'m honestly not sure, but let me find out and follow up with you by email."'}
];

/* ===== REAL MICE ROLE-PLAY: EXPO SIMULATION (Section 10) ===== */
const ROLEPLAYS = [
  {ic:'🎤', title:'Keynote Speaker', role:'Attendee', situation:'You see the morning\'s keynote speaker standing alone.', challenge:'Approach them and start a professional conversation using the Introduction + Icebreaker phrases.'},
  {ic:'🤕', title:'Accidental Bump', role:'Attendee', situation:'You accidentally bump into someone while crossing the expo floor.', challenge:'Apologize professionally and turn it into a networking moment.'},
  {ic:'🏢', title:'Competitor Company', role:'Attendee', situation:'You meet someone who works at a competitor company.', challenge:'Keep the conversation professional and positive, no oversharing.'},
  {ic:'🧳', title:'Conference Organizer', role:'Bangkok MICE Company', situation:'A potential corporate client is looking for a conference organizer in Phuket.', challenge:'Introduce yourself and steer small talk toward their event needs.'},
  {ic:'🌿', title:'Wellness Resort Director', role:'European Wellness Resort', situation:'You meet the director of a resort interested in Thailand wellness partnerships.', challenge:'Introduce your resort\'s wellness programs naturally, without sounding like a sales pitch.'},
  {ic:'🍹', title:'Reception Small Talk', role:'Any Delegate', situation:'You are standing near the drinks table with someone you have not met.', challenge:'Use an icebreaker question, then the Because Bridge, then offer your card.'}
];

/* ===== PRACTICE SETS (Section 11) ===== */
const QUICK_REVIEW = [
  {q:'"Rapport" means:', opts:['A type of business card','A warm, comfortable relationship built through good communication','A formal complaint'], correct:1},
  {q:'Which word means "an activity or question to help people start conversations"?', opts:['Icebreaker','Handshake','Reception'], correct:0},
  {q:'"He gave a confident _____ and held eye contact throughout." ', opts:['name tag','handshake','exchange'], correct:1},
  {q:'"First impression" means:', opts:['A recognizable place','The opinion formed about someone the first time you meet them','A type of email'], correct:1},
  {q:'Which word means "to go up to someone and begin speaking to them"?', opts:['Approach','Follow up','Colleague'], correct:0},
  {q:'"Please take my _____. It has my email on it."', opts:['name tag','business card','reception'], correct:1},
  {q:'"Small talk" is best described as:', opts:['A formal business negotiation','Light, polite conversation about everyday topics','An angry disagreement'], correct:1},
  {q:'Which word means "to contact someone after a meeting to continue the conversation"?', opts:['Exchange','Follow up','Greet'], correct:1},
  {q:'A "colleague" is:', opts:['A person who works in the same field as you','A stranger at an event','Your teacher'], correct:0},
  {q:'"Professional manner" means:', opts:['Behavior that is appropriate and respectful in a work setting','A type of business card','A loud greeting'], correct:0}
];

const BRIDGE_PRACTICE = [
  {starter:'"What do you think of this year\'s exhibitors?"', opts:['"I like the wellness pavilion because it fits exactly what our clients ask for."','"They\'re fine."','"I have no opinion."'], correct:0},
  {starter:'"Is this your first time at the forum?"', opts:['"Yes."','"Yes, and I like it because everyone here is so welcoming and easy to talk to."','"No comment."'], correct:1},
  {starter:'"What brings you to the reception tonight?"', opts:['"Nothing really."','"Just here."','"I like networking events because you never know who you\'ll meet, like you!"'], correct:2},
  {starter:'"How is the conference going for you?"', opts:['"I like it because the sessions are directly useful to my team back home."','"It\'s long."','"I\'m tired."'], correct:0}
];

const LISTEN_CHOOSE = [
  {q:'What does Narumon do at Serene Group?', lines:[
    {who:'Aim', text:'I notice your name tag says Serene Group Wellness Resorts.'},
    {who:'Narumon', text:'Yes! I\'m Narumon, Wellness Events Manager. We handle incentive retreats and wellness conferences.'}
  ], opts:['She is a keynote speaker','She is the Wellness Events Manager','She works in catering'], correct:1},
  {q:'What event did Aim previously manage?', lines:[
    {who:'Narumon', text:'Pacific Convention, you managed the ASEAN Business Summit last year, didn\'t you?'},
    {who:'Aim', text:'We did! 2,000 delegates over three days.'}
  ], opts:['A wellness retreat','The ASEAN Business Summit','A hotel opening'], correct:1},
  {q:'What does Aim ask for before the end of the conversation?', lines:[
    {who:'Aim', text:'May I give you my card? I think there could be some great opportunities for us to collaborate.'},
    {who:'Narumon', text:'Of course. Please do.'}
  ], opts:['Directions to the exit','Permission to give her business card','A ride to the hotel'], correct:1},
  {q:'What do they agree to do the next morning?', lines:[
    {who:'Aim', text:'I promise: email by 9 a.m. tomorrow.'},
    {who:'Narumon', text:'You too. I look forward to hearing from you!'}
  ], opts:['Meet for breakfast','Aim will send a follow-up email','Exchange phone numbers instead'], correct:1}
];

const SAY_YOURSELF_PRACTICE = [
  {support:'Keyword support', visitor:'Someone says: "Hi, have we met before?"', hint:'HI → I\'M [NAME] → FROM [COMPANY]', model:'"I don\'t think so. Hi, I\'m [name], from [company]. Nice to meet you!"'},
  {support:'Keyword support', visitor:'You want to start small talk with a stranger.', hint:'HAVE YOU → ATTENDED → BEFORE', model:'"Have you attended this event before? It\'s my first time."'},
  {support:'Phrases only: no keywords', visitor:'You want to politely end a conversation and exchange contact details.', hint:null, model:'"It was wonderful to meet you. Here\'s my card. I\'ll be in touch soon!"'},
  {support:'Real situation: no support', visitor:'A stranger asks: "So, what do you think of the expo?"', hint:null, model:'"I like it because I\'ve already met people from three different countries. What about you? What brings you here?"'}
];

const RUBRIC = [
  {k:'fluency', lbl:'Fluency', sub:'I could introduce myself and make small talk without stopping too much.'},
  {k:'pron', lbl:'Pronunciation', sub:'My partner could understand me.'},
  {k:'vocab', lbl:'Vocabulary', sub:'I used networking vocabulary and the Because Bridge.'},
  {k:'inter', lbl:'Interaction', sub:'I listened and responded to my partner, and used their name.'},
  {k:'prof', lbl:'Professionalism', sub:'I was polite, confident, and used the 8 pro tips.'}
];

/* ===================== SECTION META ===================== */
const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'First Impressions'},
  {key:'s2', label:'Key Vocabulary'},
  {key:'s3', label:'The Because Bridge'},
  {key:'s4', label:'Your Safety Net'},
  {key:'s5', label:'Listen: Networking'},
  {key:'s6', label:'Model It: 8 Pro Tips'},
  {key:'s7', label:'Say It Yourself'},
  {key:'s8', label:'Information Gap'},
  {key:'s9', label:'Something Went Wrong'},
  {key:'s10', label:'Expo Role-Play'},
  {key:'practice', label:'Practice Sets'},
  {key:'s11', label:'Final Challenge'},
  {key:'s12', label:'Self-Check & Take Home'},
  {key:'complete', label:'Complete'}
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 4: Professional Greetings & Networking',
  unitCode: 'unit-4'
};

/* ===================== TAKE-HOME ASSET ===================== */
const STUDY_GUIDE_DATA_URI = "../../../assets/study-guide/Unit4-Professional-Greetings-Networking-Study-Guide.jpg";
const STUDY_GUIDE_FILENAME = "Unit4-Professional-Greetings-Networking-Study-Guide.jpg";

/* ===================== SECTION PHOTOS =====================
   Selective — vocabulary / context only, reusing the shared venue photo
   library (Unit 4 has no dedicated location photoset the way Unit 5's
   wayfinding lesson does, so photos are used only where they genuinely
   support the scene). Paths are relative to
   /courses/mice/unit-4/index.html. */
const SECTION_PHOTOS = {
  hero:       { src:'../../../assets/images/u4-hero.jpg',      alt:'Close-up of two professionals shaking hands' },
  warmup:     { src:'../../../assets/images/u4-warmup.jpg',    alt:'Two business professionals greeting each other with a handshake' },
  reception:  { src:'../../../assets/images/u4-reception.jpg', alt:'Delegates wearing lanyards networking and talking at a conference reception' }
};
