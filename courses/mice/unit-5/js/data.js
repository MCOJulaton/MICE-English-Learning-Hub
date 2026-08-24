/* ===================== UNIT 5 CONTENT DATA =====================
   All lesson content lives here: vocabulary, direction language, floor-plan
   routes, dialogue, role-plays, practice items, rubric. Nothing here is UI
   logic — see app.js for rendering/state/voice/progress-tracking. */

const LOCATIONS = [
  {id:'entrance', ic:'🚪', nm:'Main Entrance', ex:'"Welcome! The main entrance faces the drop-off area."'},
  {id:'registration', ic:'🗂️', nm:'Registration Desk', ex:'"The registration desk is opposite the main entrance."'},
  {id:'lobby', ic:'🏛️', nm:'Main Lobby', ex:'"Go straight ahead through the main lobby."'},
  {id:'ballroom', ic:'🎤', nm:'Ballroom A', ex:'"Ballroom A is at the end of the main corridor, on your left."'},
  {id:'restrooms', ic:'🚻', nm:'Restrooms', ex:'"The restrooms are just before the reception desk, on your left."'},
  {id:'corridor', ic:'➡️', nm:'Main Corridor', ex:'"Turn right at the end of the lobby into the main corridor."'},
  {id:'elevator', ic:'🛗', nm:'Elevator', ex:'"Take the elevator to the second floor."'},
  {id:'escalator', ic:'🔼', nm:'Escalator', ex:'"You can also take the escalator, just past the registration desk."'},
  {id:'catering', ic:'🍽️', nm:'Catering / Lunch Area', ex:'"The catering area is on the second floor. Follow the signs for Delegate Dining."'},
  {id:'vip', ic:'⭐', nm:'VIP Lounge', ex:'"The VIP lounge is on the second floor, next to the terrace."'},
  {id:'terrace', ic:'🌿', nm:'Outdoor Terrace', ex:'"The outdoor wellness terrace is just past the VIP lounge."'},
  {id:'firstaid', ic:'⛑️', nm:'First Aid Station', ex:'"The first aid station is opposite the registration desk."'},
  {id:'fireexit', ic:'🚨', nm:'Fire Exit', ex:'"Follow the green signs to the nearest fire exit."'}
];

const DIRECTIONS = [
  {ic:'⬆️', lbl:'Go straight ahead'},
  {ic:'↩️', lbl:'Turn left'},
  {ic:'↪️', lbl:'Turn right'},
  {ic:'🏁', lbl:'At the end of the corridor'},
  {ic:'📍', lbl:'Next to'},
  {ic:'🔄', lbl:'Opposite'},
  {ic:'👉', lbl:'Just past'},
  {ic:'🛗', lbl:'Take the elevator'},
  {ic:'🔼', lbl:'Take the escalator'},
  {ic:'2️⃣', lbl:'Go to the second floor'},
  {ic:'🪧', lbl:'Follow the signs'},
  {ic:'⬅️', lbl:'On your left'},
  {ic:'➡️', lbl:'On your right'}
];

const HELP_TABS = {
  offer:{title:'Offering Help', items:[
    'May I help you find something?','Are you looking for the…?',
    'Can I point you in the right direction?','Of course! Let me show you.'
  ]},
  give:{title:'Giving Directions', items:[
    'Go straight ahead…','Turn left / turn right…','Take the elevator to the second floor.',
    'Follow the signs for…','It\'s just past…','It\'s next to… / It\'s opposite…'
  ]},
  extra:{title:'Additional Help', items:[
    'Would you like me to walk with you?','If you get lost, please ask any of our staff.'
  ]},
  unsure:{title:'If You Are Unsure', items:[
    'I\'m sorry. I\'m not sure, but let me find out for you.'
  ]}
};

/* ===== FLOOR PLAN DATA (real floor-plan shapes, not abstract grid squares) =====
   Coordinates are in a 900x560 SVG viewBox per floor. Each destination has an
   ordered list of waypoints [x,y] that trace the ACTUAL walking path described
   in the Unit 5 script, so "Show Route" always matches the spoken directions. */
const FLOOR_PATHS = {
  ground: {
    entrance: [450,505],
    registration: {
      path:[[450,505],[450,400],[450,330]],
      text:'Go straight ahead. The registration desk is directly opposite the main entrance.',
      steps:['Straight ahead']
    },
    ballroom: {
      path:[[450,505],[450,400],[450,205],[650,205],[755,205]],
      text:'Go straight ahead through the main lobby. At the end of the lobby, turn right into the main corridor. Ballroom A is on your left.',
      steps:['Straight ahead','Turn right','End of corridor']
    },
    restrooms: {
      path:[[450,505],[450,400],[380,400],[195,400],[195,330]],
      text:'Turn left immediately before the reception desk. The restrooms are at the end of the short corridor.',
      steps:['Turn left','Short corridor']
    },
    firstaid: {
      path:[[450,505],[450,400],[520,400],[615,400],[615,340]],
      text:'The first aid station is opposite the registration desk.',
      steps:['Turn right','Opposite registration']
    },
    fireexit: {
      path:[[450,505],[450,400],[380,400],[220,400],[150,430]],
      text:'Follow the green signs down the west corridor to the nearest fire exit.',
      steps:['Turn left','Follow the signs']
    },
    liftlobby: {
      path:[[450,505],[450,400],[520,400],[615,400]],
      text:'The elevator and escalator are just past the registration desk, on your right.',
      steps:['Turn right','Just past registration']
    }
  },
  second: {
    liftlobby: [450,505],
    catering: {
      path:[[450,505],[450,390],[450,265]],
      text:'From the lift lobby, go straight ahead. Follow the signs for Delegate Dining.',
      steps:['Straight ahead','Follow the signs']
    },
    vip: {
      path:[[450,505],[450,430],[700,430],[700,350]],
      text:'From the lift lobby, the VIP lounge is on your right, next to the outdoor terrace.',
      steps:['Turn right']
    },
    terrace: {
      path:[[450,505],[450,430],[700,430],[830,430],[830,350]],
      text:'The outdoor terrace is just past the VIP lounge.',
      steps:['Turn right','Just past the VIP lounge']
    }
  }
};
const SECOND_FLOOR_DESTS = ['catering','vip','terrace'];

const ROLEPLAYS = [
  {ic:'🎤', title:'Conference', role:'MICE Staff', situation:'A delegate cannot find Ballroom A.', dest:'Ballroom A', challenge:'The delegate is worried they will miss the opening keynote. Reassure them.'},
  {ic:'🗂️', title:'Registration', role:'MICE Staff', situation:'A delegate needs the registration desk.', dest:'Registration Desk', challenge:'The delegate did not receive their badge at the hotel.'},
  {ic:'🚻', title:'Restroom', role:'MICE Staff', situation:'A guest asks for the nearest restroom.', dest:'Restrooms', challenge:'The guest is in a hurry. Keep the directions very short.'},
  {ic:'🍽️', title:'Catering', role:'MICE Staff', situation:'A delegate asks where lunch is.', dest:'Catering Area', challenge:'The delegate has a food allergy and wants to ask staff there too.'},
  {ic:'⭐', title:'VIP', role:'MICE Staff', situation:'A guest asks for the VIP lounge.', dest:'VIP Lounge', challenge:'Check the guest\'s badge shows VIP access before directing them.'},
  {ic:'🌿', title:'Wellness', role:'MICE Staff', situation:'A guest asks for the outdoor wellness area.', dest:'Outdoor Terrace', challenge:'Recommend the best time of day to visit.'},
  {ic:'🚨', title:'Safety', role:'MICE Staff', situation:'A visitor asks for the nearest fire exit.', dest:'Fire Exit', challenge:'Stay calm and professional. This is a safety question.'},
  {ic:'⛑️', title:'First Aid', role:'MICE Staff', situation:'A guest asks where the first aid station is.', dest:'First Aid Station', challenge:'Ask if they need you to walk with them.'}
];

const SITUATIONS = [
  {tag:'Situation 1', visitor:'"Sorry, I don\'t understand."', task:'Explain again, more slowly and simply.', model:'"No problem, let me say that again, more slowly. Go straight ahead, then turn right."'},
  {tag:'Situation 2', visitor:'"So I go straight and then turn right?"', task:'Confirm or correct.', model:'"That\'s right: straight ahead, then turn right at the end of the corridor."'},
  {tag:'Situation 3', visitor:'"How far is it?"', task:'Give a simple estimate.', model:'"It\'s not far, about two minutes\' walk from here."'},
  {tag:'Situation 4', visitor:'"Where is the media room?"', task:'You genuinely don\'t know. Do NOT invent an answer.', model:'"I\'m sorry. I\'m not sure, but let me find out for you."'}
];

const LISTEN = {
  intro: 'A delegate, Mr. Bauer, has just arrived. He looks uncertain near the main entrance. Staff member Nat approaches.',
  lines: [
    {who:'Nat', text:'Good morning, sir! You look like you might be looking for something. May I help you?'},
    {who:'Bauer', text:'Oh yes, thank you! I just arrived and I\'m a bit lost. I\'m looking for Ballroom A. I think there\'s a plenary session starting soon.'},
    {who:'Nat', text:'Of course! Ballroom A is very easy to find. Go straight ahead through the main lobby. You\'ll pass the large reception desk on your left. At the end of the lobby, turn right. You\'ll be in the main corridor. Ballroom A is about 20 metres down on your left.'},
    {who:'Bauer', text:'Straight ahead, turn right, then it\'s on the left. Got it. Thank you! Oh, where are the restrooms?'},
    {who:'Nat', text:'The nearest restrooms are on this floor. When you enter the lobby, turn left immediately before the reception desk. The restrooms are at the end of that short corridor.'},
    {who:'Bauer', text:'Perfect. I also need to collect my delegate badge. I didn\'t receive it at the hotel.'},
    {who:'Nat', text:'No problem at all! The registration desk is right here on this level: the large desk directly opposite the main entrance.'},
    {who:'Bauer', text:'Ah, I see it! I walked right past it.'},
    {who:'Nat', text:'It happens to everyone! One last question: where is the lunch break held?'},
    {who:'Nat', text:'The catering area is on the second floor. Take the escalator or elevator just to your right after the registration desk. Follow the signs for "Delegate Dining."'},
    {who:'Bauer', text:'Wonderful. You have been incredibly helpful. Thank you so much.'}
  ]
};

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'You Are The MICE Staff'},
  {key:'s2', label:'Explore The Venue'},
  {key:'s3', label:'Follow The Signs'},
  {key:'s4', label:'How To Help A Guest'},
  {key:'s5', label:'Listen To The Delegate'},
  {key:'s6', label:'The Interactive Map'},
  {key:'s7', label:'Say It Yourself'},
  {key:'s8', label:'Information Gap'},
  {key:'s9', label:'Something Went Wrong'},
  {key:'s10', label:'Real MICE Role-Play'},
  {key:'practice', label:'Practice Sets'},
  {key:'s11', label:'Final Challenge'},
  {key:'s12', label:'Self-Check & Take Home'},
  {key:'complete', label:'Complete'}
];

const S5_ROUNDS = {
  1:{q:'Round 1: WHO? Who needs help? Where is he?',
     opts:['A delegate named Mr. Bauer, near the main entrance','A staff member, near the elevator','A journalist, in Ballroom A'], correct:0},
  2:{q:'Round 2: WHERE? Where does Mr. Bauer want to go first?',
     opts:['The VIP lounge','Ballroom A','The fire exit'], correct:1},
  3:{q:'Round 3: WHICH WAY? Which direction words does Nat use for Ballroom A?',
     opts:['Go straight ahead, then turn right','Turn left, then take the elevator','Go straight ahead, then turn left'], correct:0},
  4:{q:'Round 4: FOLLOW THE ROUTE. Nat says: "Take the escalator or elevator just to your right after the registration desk." Where does this route lead?',
     opts:['The restrooms','The catering area (2nd floor)','The fire exit'], correct:1},
  5:{q:'Round 5: LISTEN WITHOUT TEXT. Replay the audio (no transcript) and answer: where are the restrooms?',
     opts:['Turn left immediately before the reception desk','Take the elevator to floor 2','Opposite the main entrance'], correct:0}
};

const S6_DEST_LIST = [
  {id:'registration', nm:'Registration Desk'},
  {id:'ballroom', nm:'Ballroom A'},
  {id:'restrooms', nm:'Restrooms'},
  {id:'firstaid', nm:'First Aid Station'},
  {id:'fireexit', nm:'Fire Exit'},
  {id:'catering', nm:'Catering / Lunch Area (2F)'},
  {id:'vip', nm:'VIP Lounge (2F)'},
  {id:'terrace', nm:'Outdoor Terrace (2F)'}
];

const S7_LEVELS = {
  1:{title:'Level 1: Full Support', body:`
      <p>Complete the sentence:</p>
      <p style="font-family:'Oswald';font-size:18px;color:var(--navy);">Go <input class="lvl-input" id="l1a" style="width:110px;display:inline-block;" placeholder="____"> and turn <input class="lvl-input" id="l1b" style="width:110px;display:inline-block;" placeholder="____"> at the <input class="lvl-input" id="l1c" style="width:140px;display:inline-block;" placeholder="____">.</p>
      <button class="reveal-btn" id="l1check">Check</button>
      <div class="model-answer" id="l1fb"></div>`},
  2:{title:'Level 2: Keyword Support', body:`
      <div class="keyword-row">
        <span class="kw">STRAIGHT</span><span class="kw-arrow">→</span>
        <span class="kw">RIGHT</span><span class="kw-arrow">→</span>
        <span class="kw">CORRIDOR</span><span class="kw-arrow">→</span>
        <span class="kw">BALLROOM A</span>
      </div>
      <p>Say the full sentence aloud using these keywords, then check your version.</p>
      <button class="reveal-btn" data-reveal="l2model">Show model answer</button>
      <div class="model-answer" id="l2model">"Go straight ahead, then turn right at the end of the corridor. Ballroom A is on your left."</div>`},
  3:{title:'Level 3: Map Only', body:`
      <p>Look at the map in Section 6. A guest asks: <b>"Excuse me, where is the registration desk?"</b> Answer aloud using the map, with no sentence frame.</p>
      <button class="reveal-btn" data-reveal="l3model">Show model answer</button>
      <div class="model-answer" id="l3model">"Of course, the registration desk is opposite the main entrance. You can't miss it."</div>`},
  4:{title:'Level 4: Real Situation', body:`
      <p id="l4prompt" style="font-weight:700;color:var(--orange-deep);"></p>
      <button class="tb-btn" id="l4new" style="background:var(--teal);border-color:var(--teal);margin-top:10px;">New request</button>
      <button class="reveal-btn" data-reveal="l4model">Show model answer</button>
      <div class="model-answer" id="l4model"></div>`}
};
const L4_PROMPTS = [
  {q:'"Excuse me, where is the registration desk?"', a:'"Of course, it\'s opposite the main entrance, right over there."'},
  {q:'"Could you tell me the way to the restrooms?"', a:'"Sure, turn left just before the reception desk. They\'re at the end of that corridor."'},
  {q:'"I\'m looking for the catering area, could you help?"', a:'"Of course, take the elevator to the second floor and follow the signs for Delegate Dining."'},
  {q:'"Where is Ballroom A? I don\'t want to be late."', a:'"No problem, go straight ahead, then turn right at the end of the corridor. It\'s on your left. Would you like me to walk with you?"'}
];

const QUICK_REVIEW = [
  {q:'"Entrance" means:', opts:['The door you use to leave','The door you use to enter','A long passageway'], correct:1},
  {q:'Which word means "a moving staircase"?', opts:['Elevator','Escalator','Corridor'], correct:1},
  {q:'"The registration desk is _____ the main entrance" (directly facing it).', opts:['next to','opposite','just past'], correct:1},
  {q:'Which phrase means "continue in the same direction"?', opts:['Turn left','Go straight ahead','Turn right'], correct:1},
  {q:'"Landmark" means:', opts:['A recognizable place that helps you find your way','A type of elevator','A business card'], correct:0},
  {q:'"Turn right _____ the end of the corridor."', opts:['next to','at','opposite'], correct:1},
  {q:'"Signage" means:', opts:['A business card','Signs and arrows that give directions','A floor level'], correct:1},
  {q:'Which word means "immediately beside"?', opts:['Opposite','Next to','Just past'], correct:1},
  {q:'"The catering area is on the _____."', opts:['second floor','main entrance','corridor'], correct:0},
  {q:'"It\'s just past the registration desk" means:', opts:['Far away','A little further than the registration desk','Before the registration desk'], correct:1}
];

const PRACTICE_ROUTES = [
  {level:'Route 1 · Easy', floor:'ground', dest:'registration',
   instructions:['Start at the main entrance.','Go straight ahead.','The desk is right in front of you.'],
   opts:['Ballroom A','Registration Desk','Restrooms']},
  {level:'Route 2 · Easy–Medium', floor:'ground', dest:'ballroom',
   instructions:['Start at the main entrance.','Go straight ahead through the lobby.','Turn right at the end of the corridor.'],
   opts:['Ballroom A','First Aid Station','Fire Exit']},
  {level:'Route 3 · Medium', floor:'ground', dest:'restrooms',
   instructions:['Start at the main entrance.','Go straight ahead.','Turn left immediately before the reception desk.'],
   opts:['Restrooms','VIP Lounge','Catering Area']},
  {level:'Route 4 · Challenge (2nd floor)', floor:'second', dest:'vip',
   instructions:['Start at the lift lobby, second floor.','Turn right.','It\'s next to the outdoor terrace.'],
   opts:['Delegate Dining','VIP Lounge','First Aid Station']}
];
const DEST_NAME = {registration:'Registration Desk', ballroom:'Ballroom A', restrooms:'Restrooms',
  firstaid:'First Aid Station', fireexit:'Fire Exit', catering:'Delegate Dining', vip:'VIP Lounge', terrace:'Outdoor Terrace'};

const LISTEN_CHOOSE = [
  {q:'Where does the delegate want to go?',
   lines:[{who:'Bauer',text:'Excuse me, could you tell me where the registration desk is?'},{who:'Nat',text:'Of course, go straight ahead. It\'s right in front of you.'}],
   opts:['Registration Desk','Restrooms','Ballroom A'], correct:0},
  {q:'What direction does the staff member give first?',
   lines:[{who:'Bauer',text:'I\'m looking for Ballroom A.'},{who:'Nat',text:'Go straight ahead, then turn right at the end of the corridor.'}],
   opts:['Turn left','Go straight ahead','Take the elevator'], correct:1},
  {q:'What landmark does the staff member mention?',
   lines:[{who:'Bauer',text:'Where are the restrooms?'},{who:'Nat',text:'Turn left, just before the reception desk.'}],
   opts:['The reception desk','The elevator','Ballroom A'], correct:0},
  {q:'Which floor is the destination on?',
   lines:[{who:'Bauer',text:'Could you tell me where the catering area is?'},{who:'Nat',text:'Take the elevator to the second floor and follow the signs for Delegate Dining.'}],
   opts:['Ground floor','Second floor','Third floor'], correct:1}
];

const SAY_YOURSELF_PRACTICE = [
  {support:'Keyword support', visitor:'"Excuse me, where is the registration desk?"', hint:'OPPOSITE → MAIN ENTRANCE', model:'"It\'s opposite the main entrance. You can\'t miss it."'},
  {support:'Keyword support', visitor:'"Could you tell me the way to the restrooms?"', hint:'LEFT → BEFORE RECEPTION', model:'"Turn left, just before the reception desk."'},
  {support:'Map only, no keywords', visitor:'"I\'m looking for the VIP lounge, could you help?"', hint:null, model:'"Of course, it\'s on the second floor, next to the outdoor terrace."'},
  {support:'Real situation, no support', visitor:'"Excuse me, where is Ballroom A? I don\'t want to be late."', hint:null, model:'"No problem, go straight ahead, then turn right at the end of the corridor. It\'s on your left. Would you like me to walk with you?"'}
];

const RUBRIC = [
  {k:'fluency', lbl:'Fluency', sub:'I could give directions without stopping too much.'},
  {k:'pron', lbl:'Pronunciation', sub:'My partner could understand me.'},
  {k:'vocab', lbl:'Vocabulary', sub:'I used direction words and landmarks.'},
  {k:'inter', lbl:'Interaction', sub:'I listened and responded to my partner.'},
  {k:'prof', lbl:'Professionalism', sub:'I was polite and helpful.'}
];

/* ===================== COURSE / UNIT IDENTITY =====================
   Read by app.js when building progress records, so the same app.js can be
   reused for future units/courses by swapping only this block. */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Unit 5: Giving Directions at Events',
  unitCode: 'unit-5'
};

/* ===================== TAKE-HOME ASSET =====================
   Real file on disk now (was a base64 data URI embedded in this script). */
const STUDY_GUIDE_DATA_URI = "../../../assets/study-guide/Unit5-Giving-Directions-Study-Guide.jpg";
const STUDY_GUIDE_FILENAME = "Unit5-Giving-Directions-Study-Guide.jpg";

/* ===================== SECTION PHOTOS =====================
   A real photo for every venue location, plus the hero and staff/delegate
   photos used elsewhere in the lesson. Paths are relative to
   /courses/mice/unit-5/index.html. Every location-card photo renders at the
   same fixed aspect ratio (see .loc-photo in unit5.css) so the grid reads as
   one consistent set regardless of each source photo's native shape. */
const SECTION_PHOTOS = {
  hero:         { src:'../../../assets/images/venue-hero.jpg',        alt:'Exterior of a large modern convention center at dusk' },
  entrance:     { src:'../../../assets/images/loc-entrance.jpg',      alt:'Glass entrance doors with sunlight streaming into a lobby' },
  registration: { src:'../../../assets/images/registration-desk.jpg', alt:'Hotel-style registration desk with staff assisting a guest' },
  lobby:        { src:'../../../assets/images/loc-lobby.jpg',         alt:'Spacious modern hotel lobby with glass entrance doors' },
  ballroom:     { src:'../../../assets/images/ballroom.jpg',          alt:'Large conference ballroom set up with rows of chairs and a stage' },
  restrooms:    { src:'../../../assets/images/loc-restrooms.jpg',     alt:'Restroom sign (WC) at the end of a corridor' },
  corridor:     { src:'../../../assets/images/loc-corridor.jpg',      alt:'Modern office corridor with an exit sign' },
  elevator:     { src:'../../../assets/images/loc-elevator.jpg',      alt:'Interior of a modern elevator cabin with a button panel and handrail' },
  escalator:    { src:'../../../assets/images/loc-escalator.jpg',     alt:'Escalators inside a modern, spacious building' },
  catering:     { src:'../../../assets/images/catering.jpg',          alt:'Catering buffet and dining area set up for delegates' },
  vip:          { src:'../../../assets/images/vip-lounge.jpg',        alt:'VIP lounge seating area with soft lighting' },
  terrace:      { src:'../../../assets/images/outdoor-terrace.jpg',   alt:'Outdoor terrace with seating overlooking greenery' },
  firstaid:     { src:'../../../assets/images/loc-firstaid.jpg',      alt:'First aid kit bags' },
  fireexit:     { src:'../../../assets/images/loc-fireexit.jpg',      alt:'Illuminated green fire exit sign' },
  staff:        { src:'../../../assets/images/staff-delegate.jpg',    alt:'MICE staff member giving directions to a delegate' }
};
