/* ===================== MICE INTEGRATED LISTENING CHALLENGE =====================
   Units 7 and 8, merged into one lesson: Client Service, Professional
   Hospitality, Problem Solving, and Emergency Communication.

   This lesson runs AFTER the teacher's own Kahoot/Blooket review. It has
   two on-screen parts: a teacher-led discussion (whole class, one screen),
   then group check-in and the listening challenge itself (one shared
   device per group of 5-6 students).

   Audio note: this site has no server-side TTS or bundled MP3s. Every
   conversation is read aloud live in the browser (Web Speech API), with
   a different voice locale assigned per character for accent variety
   (see VOICES below). If you later want to swap in a real recorded
   MP3 for a listening, add an "audioSrc" field to that listening object
   (see app.js, function playListening) and the player will use the file
   instead of the browser voice automatically.

   Nothing here is UI logic, see app.js for rendering, state, voice, and
   progress tracking. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'discuss', label:'Teacher Discussion'},
  {key:'checkin', label:'Group Check-In'},
  {key:'listen1', label:'Listening 1'},
  {key:'listen2', label:'Listening 2'},
  {key:'reflect', label:'Reflection'},
  {key:'complete', label:'Complete'}
];

/* ===== Part 1: 20-Minute Teacher Discussion (one shared screen) =====
   10 short talking points, about 2 minutes each. Click through as a
   class. This is teacher-led, not something each student clicks alone. */
const DISCUSSION_POINTS = [
  {
    n:1, title:'Welcoming a Guest',
    teach:'The first few seconds matter. A warm, clear welcome starts every guest interaction well, in normal service and in a sudden problem.',
    ask:'What do you say when a guest arrives?',
    phrases:['How can I help you?', 'Is there anything else I can help you with?'],
    dialogue:[{who:'Staff', text:'Good morning! How can I help you?'},{who:'Guest', text:'Hi, I have a question about my registration.'}]
  },
  {
    n:2, title:'Asking What the Problem Is',
    teach:'Before staff can help, they need to understand the problem. Ask one simple, direct question.',
    ask:'What question can you ask to find out the problem?',
    phrases:['What happened?', 'What seems to be the problem?'],
    dialogue:[{who:'Guest', text:'My badge isn’t printing.'},{who:'Staff', text:'Okay, what happened exactly?'}]
  },
  {
    n:3, title:'Showing You Are Listening',
    teach:'Small reactions show the guest you are paying attention. This is not a special phrase, it is a habit.',
    ask:'What can you say to show you are listening?',
    phrases:['Okay, I see.', 'Right, got it.'],
    dialogue:null
  },
  {
    n:4, title:'Apologizing Professionally',
    teach:'A short, sincere apology is enough. Students do not need a long explanation, just a clear "I’m sorry."',
    ask:'What do you say to apologize for a problem?',
    phrases:['I’m sorry about that.'],
    dialogue:[{who:'Guest', text:'My badge isn’t working.'},{who:'Staff', text:'I’m sorry about that, let me check.'}]
  },
  {
    n:5, title:'Offering Help',
    teach:'After the apology, offer to act. This moves the conversation from "sorry" to "solving it."',
    ask:'What can you say when you want to help someone?',
    phrases:['Let me help you.', 'Let me check.'],
    dialogue:null
  },
  {
    n:6, title:'Suggesting a Simple Solution',
    teach:'Once staff understand the problem, they offer ONE clear solution. Not five options, just one clear next step.',
    ask:'What is one solution you could offer a guest with a problem?',
    phrases:['Please wait a moment.', 'Let me help you.'],
    dialogue:null
  },
  {
    n:7, title:'Asking a Manager or Colleague for Help',
    teach:'Staff cannot solve everything alone. Asking a colleague or manager quickly is professional, not a weakness.',
    ask:'When should staff ask someone else for help?',
    phrases:['I will call the manager.'],
    dialogue:[{who:'Staff', text:'I’m not sure how to fix this. I will call the manager.'}]
  },
  {
    n:8, title:'When an Unexpected Problem Happens',
    teach:'Sometimes the situation suddenly changes: a guest feels sick, an alarm sounds, equipment fails. This needs faster, clearer communication.',
    ask:'What is one unexpected problem that could happen at an event?',
    phrases:['Please stay calm.'],
    dialogue:null
  },
  {
    n:9, title:'Keeping Guests Calm',
    teach:'A calm staff voice helps guests feel safe. Speak slowly and clearly, do not shout, even if the situation feels urgent.',
    ask:'How can staff help a guest feel calm?',
    phrases:['Please stay calm.', 'Please don’t worry.'],
    dialogue:null
  },
  {
    n:10, title:'Giving Simple, Clear Instructions',
    teach:'One instruction at a time, in short sentences. This matters most in an emergency, but it helps in normal service too. Now you are ready for the listening challenge: listen for how staff use all of these skills together in real conversations.',
    ask:'What short instruction can staff give to guide a guest?',
    phrases:['Please follow me.', 'This way, please.'],
    dialogue:[{who:'Staff', text:'Please follow me. This way, please.'}]
  }
];

const PHRASE_BANK = {
  'Greeting and Offering Help': ['How can I help you?', 'Let me help you.', 'Is there anything else I can help you with?'],
  'Understanding the Problem': ['What happened?', 'Are you OK?', 'Okay, I see.'],
  'Apologizing and Checking': ['I’m sorry about that.', 'Let me check.', 'Please wait a moment.'],
  'Getting Help': ['I will call the manager.'],
  'Staying Calm and Giving Instructions': ['Please stay calm.', 'Please follow me.', 'This way, please.']
};

/* ===== Voice locales, for accent variety across the 12 conversations =====
   These are BCP-47 language/region codes passed to the Web Speech API.
   Actual voice availability depends on the visitor's own device, the
   engine falls back gracefully (see app.js VoiceEngine) if a given
   locale is not installed. Every character speaks standard, correct
   grammar, only the requested voice locale changes between characters. */
const LOCALE = {
  US:'en-US', GB:'en-GB', IN:'en-IN', AU:'en-AU', IE:'en-IE', ZA:'en-ZA'
};

/* ===== Character gender, so the voice picked for each speaker actually
   matches who they are, not just the requested accent. Used by
   VoiceEngine.resolveVoice() in app.js. ===== */
const GENDER = {
  Mia:'F', Alvarez:'M', Nok:'F', Park:'F', Ann:'F', Ploy:'F', Chen:'F', Chef:'M',
  Tom:'M', Diaz:'F', Fah:'F', Win:'M', Osei:'M', Beam:'F', Nan:'F', Friend:'F',
  FirstAid:'F', Job:'M', Silva:'F', Colleague:'M', Tar:'M', Guest:'F', Mint:'F',
  Leo:'M', Dao:'F', Sam:'M'
};

/* ===== The 12 conversations, 2 per group =====
   Every conversation blends Unit 7 (welcome, question, apology, help,
   solution) with a Unit 8 beat (asking a colleague for help, staying
   calm, or a genuinely unexpected situation), so no conversation is
   "only Unit 7" or "only Unit 8." */
const GROUPS = [
  { id:1, label:'Group 1',
    listenings:[
      { id:'g1l1', title:'Registration Trouble',
        setting:'At the registration desk, early morning. A guest cannot find his name on the list.',
        voices:{ 'Mia':LOCALE.GB, 'Alvarez':LOCALE.US },
        script:[
          {who:'Mia', text:'Good morning. Welcome to the conference. How can I help you?'},
          {who:'Alvarez', text:'Hi. I think there’s a problem with my registration.'},
          {who:'Mia', text:'Okay, let me check. Can I have your name, please?'},
          {who:'Alvarez', text:'Sure, it’s Carlos Alvarez.'},
          {who:'Mia', text:'Alvarez... hmm, I don’t see it here. Just a moment.'},
          {who:'Alvarez', text:'Really? I registered online last week.'},
          {who:'Mia', text:'I’m sorry about that. Let me look again... oh, here it is. It’s listed under "C. Alvarez."'},
          {who:'Alvarez', text:'Ah, that makes sense.'},
          {who:'Mia', text:'Sorry for the confusion. Here is your badge and your welcome pack.'},
          {who:'Alvarez', text:'Thank you. Actually, I have a meeting with the director in five minutes. Where is Room B?'},
          {who:'Mia', text:'It’s just down this hallway, on your right. Would you like me to walk you there?'},
          {who:'Alvarez', text:'Yes, please, that would be great.'},
          {who:'Mia', text:'Of course. Follow me.'}
        ],
        questions:[
          {q:'What is the guest’s name?', a:'Carlos Alvarez.'},
          {q:'Why can Mia not find his registration at first?', a:'It is listed under "C. Alvarez," not his full name.'},
          {q:'What does Mia give the guest?', a:'His badge and his welcome pack.'},
          {q:'Why does Mia offer to walk the guest to Room B?', a:'Because he has a meeting with the director in five minutes and needs to get there quickly.', support:'"I have a meeting with the director in five minutes."'},
          {q:'Why does Mia say sorry for the confusion?', a:'Because she could not find his name right away and made him wait.', support:'"I don’t see it here" and "Sorry for the confusion."'}
        ]
      },
      { id:'g1l2', title:'Badge Printer Problem',
        setting:'At check-in. The badge printer suddenly stops working.',
        voices:{ 'Nok':LOCALE.IN, 'Park':LOCALE.US, 'Ann':LOCALE.GB },
        script:[
          {who:'Nok', text:'Hello, welcome! Can I help you check in?'},
          {who:'Park', text:'Yes, please. My name is Susan Park.'},
          {who:'Nok', text:'Great, I found you. Let me print your badge...'},
          {who:'Nok', text:'Oh, that’s strange. The printer isn’t working.'},
          {who:'Park', text:'Oh no, is that a problem?'},
          {who:'Nok', text:'Just a moment, let me try again... No, it’s still not printing.'},
          {who:'Park', text:'Okay, no rush. I can wait.'},
          {who:'Nok', text:'Thank you for your patience. I’ll call my colleague to check it.'},
          {who:'Nok', text:'Hi Ann, the badge printer at desk two isn’t working. Can you help?', stage:'on the radio'},
          {who:'Ann', text:'Sure, I’ll bring the backup printer now.', stage:'voice on radio'},
          {who:'Nok', text:'Thanks so much. Ms. Park, it will take about two minutes. Would you like to sit down while you wait?'},
          {who:'Park', text:'Sure, thank you.'},
          {who:'Nok', text:'No problem. I’ll bring your badge to you as soon as it’s ready.'}
        ],
        questions:[
          {q:'What is the guest’s name?', a:'Susan Park.'},
          {q:'What problem happens?', a:'The badge printer stops working.'},
          {q:'Who does Nok call for help?', a:'Her colleague, Ann.'},
          {q:'Why does Nok ask Ms. Park to sit down?', a:'Because it will take about two minutes for the backup printer to arrive, so she has to wait.', support:'"It will take about two minutes... would you like to sit down while you wait?"'},
          {q:'Why does Nok call Ann?', a:'Because the printer is broken and Nok cannot fix it herself, so she needs help.', support:'"The badge printer at desk two isn’t working. Can you help?"'}
        ]
      }
    ]
  },
  { id:2, label:'Group 2',
    listenings:[
      { id:'g2l1', title:'Allergy at the Buffet',
        setting:'At the lunch buffet. A guest asks about a food allergy.',
        voices:{ 'Ploy':LOCALE.US, 'Chen':LOCALE.GB, 'Chef':LOCALE.IE },
        script:[
          {who:'Ploy', text:'Hi there! Welcome to the lunch buffet. Can I help you with anything?'},
          {who:'Chen', text:'Yes, actually. I’m allergic to nuts. Is it safe for me to eat here?'},
          {who:'Ploy', text:'Right, I see. Let me check for you, one moment.'},
          {who:'Chen', text:'Thank you, I really appreciate it.'},
          {who:'Ploy', text:'Excuse me, Chef, a guest is allergic to nuts. Which dishes should she avoid?', stage:'to the chef'},
          {who:'Chef', text:'The noodles have peanuts. But the curry and the rice are both fine.', stage:'voice'},
          {who:'Ploy', text:'Got it, thank you. Mrs. Chen, the curry and the rice are safe for you. Just avoid the noodles, they have peanuts.'},
          {who:'Chen', text:'Perfect, thank you so much for checking.'},
          {who:'Ploy', text:'Of course. Is there anything else I can help you with?'},
          {who:'Chen', text:'No, that’s everything. Thanks again.'},
          {who:'Ploy', text:'You’re welcome. Enjoy your lunch!'}
        ],
        questions:[
          {q:'What is Mrs. Chen allergic to?', a:'Nuts.'},
          {q:'Who does Ploy ask about the food?', a:'The chef.'},
          {q:'Which dish should Mrs. Chen avoid?', a:'The noodles.'},
          {q:'Why does Ploy check with the chef before answering?', a:'Because Ploy does not know which dishes have nuts, so she needs to confirm with someone who knows.', support:'"Let me check for you" and "Which dishes should she avoid?"'},
          {q:'Why can Mrs. Chen eat the curry and the rice?', a:'Because the chef said they do not have nuts, so they are safe.', support:'"The curry and the rice are both fine."'}
        ]
      },
      { id:'g2l2', title:'Lost Badge Holder',
        setting:'In the main hallway. A guest cannot find her badge holder.',
        voices:{ 'Tom':LOCALE.AU, 'Diaz':LOCALE.US },
        script:[
          {who:'Tom', text:'Hi, is everything okay?'},
          {who:'Diaz', text:'Not really. I think I lost my badge holder somewhere.'},
          {who:'Tom', text:'Oh no, sorry to hear that. When did you last have it?'},
          {who:'Diaz', text:'I had it in the main hall, maybe an hour ago.'},
          {who:'Tom', text:'Okay. Did you check the lost and found near the entrance?'},
          {who:'Diaz', text:'No, I didn’t know we had one.'},
          {who:'Tom', text:'No worries, it’s right by the front desk. Let’s go check together.'},
          {who:'Diaz', text:'Oh, thank you, that’s really kind of you.'},
          {who:'Tom', text:'Ah, here it is! Is this yours?', stage:'a moment later'},
          {who:'Diaz', text:'Yes! That’s it, thank you so much.'},
          {who:'Tom', text:'You’re welcome. Next time, you can also just call the front desk, they can announce it too.'},
          {who:'Diaz', text:'Good to know. Thanks again for your help.'}
        ],
        questions:[
          {q:'What did Ms. Diaz lose?', a:'Her badge holder.'},
          {q:'Where did she last have it?', a:'In the main hall.'},
          {q:'Where do they find the badge holder?', a:'At the lost and found, near the front desk.'},
          {q:'Why does Tom go with Ms. Diaz instead of just telling her where to go?', a:'Because she did not know there was a lost and found, so he offers to show her.', support:'"I didn’t know we had one" and "Let’s go check together."'},
          {q:'Why does Tom tell her about calling the front desk next time?', a:'So she knows another way to get help if she loses something again.', support:'"Next time, you can also just call the front desk, they can announce it too."'}
        ]
      }
    ]
  },
  { id:3, label:'Group 3',
    listenings:[
      { id:'g3l1', title:'Speaker Running Late',
        setting:'Backstage before the keynote. The main speaker is stuck in traffic.',
        voices:{ 'Fah':LOCALE.GB, 'Win':LOCALE.IN },
        script:[
          {who:'Fah', text:'Win, have you heard from the keynote speaker? He’s supposed to start in ten minutes.'},
          {who:'Win', text:'Yes, I just spoke with him. He’s stuck in traffic.'},
          {who:'Fah', text:'Oh no. How long until he gets here?'},
          {who:'Win', text:'He said about twenty minutes, maybe more.'},
          {who:'Fah', text:'Okay, we can’t just wait. Let’s move the coffee break earlier.'},
          {who:'Win', text:'Good idea. I’ll let the guests know right now.'},
          {who:'Fah', text:'Thanks. Can you also check with him again in ten minutes?'},
          {who:'Win', text:'Sure, I’ll call him again then.'},
          {who:'Fah', text:'Great. Let’s keep everyone updated so nobody gets worried.'},
          {who:'Win', text:'Agreed. I’ll go tell the guests now.'}
        ],
        questions:[
          {q:'Why is the speaker late?', a:'He is stuck in traffic.'},
          {q:'How long does the speaker say he will take?', a:'About twenty minutes, maybe more.'},
          {q:'What do Fah and Win decide to do instead of waiting?', a:'Move the coffee break earlier.'},
          {q:'Why does Fah decide to move the coffee break earlier?', a:'Because they cannot wait twenty minutes and the keynote is supposed to start soon.', support:'"He’s supposed to start in ten minutes" and "we can’t just wait."'},
          {q:'Why does Fah ask Win to check with the speaker again in ten minutes?', a:'To get an update and make sure they know when he will really arrive.', support:'"Can you also check with him again in ten minutes?"'}
        ]
      },
      { id:'g3l2', title:'Wrong Room',
        setting:'Outside a session room. A guest has walked into the wrong workshop.',
        voices:{ 'Osei':LOCALE.ZA, 'Beam':LOCALE.US },
        script:[
          {who:'Osei', text:'Excuse me, is this the marketing workshop?'},
          {who:'Beam', text:'Hmm, actually no, this is the finance session. The marketing workshop is in Room C.'},
          {who:'Osei', text:'Oh, I think I’m in the wrong place then.'},
          {who:'Beam', text:'No worries, that happens a lot. It’s easy to mix up.'},
          {who:'Osei', text:'The session starts in two minutes though. Can I still make it?'},
          {who:'Beam', text:'Yes, if you hurry. Room C is just around the corner, past the elevators.'},
          {who:'Osei', text:'Okay, thank you. Which way exactly?'},
          {who:'Beam', text:'Turn left here, then it’s the second door on your right.'},
          {who:'Osei', text:'Got it. Thanks so much for your help.'},
          {who:'Beam', text:'No problem, good luck! I hope you enjoy the workshop.'}
        ],
        questions:[
          {q:'Which workshop is the guest looking for?', a:'The marketing workshop.'},
          {q:'Where is that workshop?', a:'In Room C.'},
          {q:'How does Beam tell the guest to get there?', a:'Turn left, then it is the second door on the right, past the elevators.'},
          {q:'Why is Mr. Osei worried?', a:'Because the session starts in two minutes and he is in the wrong room, so he might be late.', support:'"The session starts in two minutes though. Can I still make it?"'},
          {q:'Why does Beam say "that happens a lot"?', a:'To make the guest feel better about going to the wrong room by accident.', support:'"No worries, that happens a lot. It’s easy to mix up."'}
        ]
      }
    ]
  },
  { id:4, label:'Group 4',
    listenings:[
      { id:'g4l1', title:'Guest Feels Dizzy',
        setting:'In the main hall. A guest suddenly feels unwell.',
        voices:{ 'Nan':LOCALE.IE, 'Friend':LOCALE.US, 'FirstAid':LOCALE.GB },
        script:[
          {who:'Friend', text:'Excuse me, can you help? My friend isn’t feeling well.'},
          {who:'Nan', text:'Of course. What happened?'},
          {who:'Friend', text:'He suddenly feels dizzy and a bit hot. He’s sitting right over there.'},
          {who:'Nan', text:'Okay, please stay calm, I’ll call the first aid team right now.'},
          {who:'Nan', text:'Hi, this is Nan at the main hall. A guest is feeling dizzy, can someone come quickly?', stage:'on the radio'},
          {who:'FirstAid', text:'Yes, we’re on our way. Please have him sit down and give him some water.', stage:'voice on radio'},
          {who:'Nan', text:'Will do, thank you.'},
          {who:'Nan', text:'They’re coming now. Let’s get you some water while we wait.'},
          {who:'Friend', text:'Thank you so much for helping.'},
          {who:'Nan', text:'Of course, don’t worry. He’ll be looked after very soon.'}
        ],
        questions:[
          {q:'What is wrong with the guest?', a:'He feels dizzy and hot.'},
          {q:'Who does Nan call?', a:'The first aid team.'},
          {q:'What does the first aid team ask Nan to do?', a:'Have him sit down and give him water.'},
          {q:'Why does Nan call the first aid team?', a:'Because the guest is feeling dizzy and hot and needs help she cannot give alone.', support:'"My friend isn’t feeling well... he suddenly feels dizzy."'},
          {q:'Why does Nan tell the friend to stay calm?', a:'So the situation does not become more stressful while they wait for help.', support:'"Please stay calm, I’ll call the first aid team right now."'}
        ]
      },
      { id:'g4l2', title:'Twisted Ankle',
        setting:'Near the escalators. A guest has hurt her ankle.',
        voices:{ 'Job':LOCALE.AU, 'Silva':LOCALE.IN, 'Colleague':LOCALE.US },
        script:[
          {who:'Silva', text:'Ow! I think I twisted my ankle on the escalator.'},
          {who:'Job', text:'Oh no, are you okay? Can you stand?'},
          {who:'Silva', text:'It hurts a lot. I don’t think I can walk right now.'},
          {who:'Job', text:'Okay, please don’t try to walk. Let me get you a chair first.'},
          {who:'Silva', text:'Thank you.'},
          {who:'Job', text:'I’m going to call our first aid team so they can look at your ankle properly.'},
          {who:'Job', text:'Hi, this is Job near the escalators. A guest has hurt her ankle, can you bring a wheelchair?', stage:'on the radio'},
          {who:'Colleague', text:'Sure, I’ll be there in two minutes.', stage:'voice on radio'},
          {who:'Job', text:'Thanks. Mrs. Silva, someone is coming to help you in just a moment.'},
          {who:'Silva', text:'Thank you, I appreciate it.'},
          {who:'Job', text:'Of course. Please try to stay off your foot until they arrive.'}
        ],
        questions:[
          {q:'What happened to Mrs. Silva?', a:'She twisted her ankle on the escalator.'},
          {q:'What does Job get for her first?', a:'A chair.'},
          {q:'What does Job ask his colleague to bring?', a:'A wheelchair.'},
          {q:'Why does Job tell Mrs. Silva not to walk?', a:'Because her ankle hurts a lot and walking could make it worse.', support:'"It hurts a lot. I don’t think I can walk right now" and "please don’t try to walk."'},
          {q:'Why does Job call his colleague?', a:'Because Mrs. Silva cannot walk and needs a wheelchair, more help than Job can give alone.', support:'"A guest has hurt her ankle, can you bring a wheelchair?"'}
        ]
      }
    ]
  },
  { id:5, label:'Group 5',
    listenings:[
      { id:'g5l1', title:'Fire Alarm',
        setting:'During a session. The fire alarm suddenly goes off.',
        voices:{ 'Tar':LOCALE.US, 'Guest':LOCALE.GB },
        script:[
          {who:'Tar', text:'Excuse me, everyone, please listen. The fire alarm has gone off.'},
          {who:'Guest', text:'Oh no, is this a drill?'},
          {who:'Tar', text:'We’re not sure yet, so please stay calm and leave the room with me now.'},
          {who:'Guest', text:'Okay. Where should we go?'},
          {who:'Tar', text:'Follow me, please. The nearest exit is this way, past the stairs.'},
          {who:'Guest', text:'Should we take the elevator? It’s faster.'},
          {who:'Tar', text:'No, please don’t use the elevator, we need to use the stairs.'},
          {who:'Guest', text:'Got it, we’re right behind you.'},
          {who:'Tar', text:'Thank you. Once we’re outside, please go to the parking area. Staff will be counting everyone there.'},
          {who:'Guest', text:'Okay, we understand.'},
          {who:'Tar', text:'Thanks for staying calm, everyone. This way, please.'}
        ],
        questions:[
          {q:'What has happened?', a:'The fire alarm has gone off.'},
          {q:'Where does Tar tell everyone to go first?', a:'Outside, following him, past the stairs, to the exit.'},
          {q:'Where should everyone go once they are outside?', a:'The parking area.'},
          {q:'Why does Tar say not to use the elevator?', a:'Because during a fire alarm the stairs are safer to use than the elevator.', support:'"No, please don’t use the elevator, we need to use the stairs."'},
          {q:'Why does Tar ask everyone to go to the parking area?', a:'So staff can count everyone there and make sure everyone is safe.', support:'"Staff will be counting everyone there."'}
        ]
      },
      { id:'g5l2', title:'Strange Smell',
        setting:'Near the coffee station. Staff notice an unusual smell.',
        voices:{ 'Mint':LOCALE.ZA, 'Colleague':LOCALE.US },
        script:[
          {who:'Mint', text:'Hey, do you smell that? It smells like something is burning near the coffee station.'},
          {who:'Colleague', text:'Yeah, I noticed that too. Let’s check it out.'},
          {who:'Mint', text:'I don’t see any smoke, but it’s best not to take chances.'},
          {who:'Colleague', text:'Agreed. Let’s clear this area just in case.'},
          {who:'Mint', text:'Excuse me, everyone, could you please move away from this area for a moment?'},
          {who:'Guest', text:'Sure, is everything alright?', stage:'background'},
          {who:'Mint', text:'We’re just checking something, nothing to worry about. Thank you for your patience.'},
          {who:'Colleague', text:'I’ll call facilities to come take a look right away.'},
          {who:'Mint', text:'Good idea. Let’s keep this area clear until they arrive.'},
          {who:'Colleague', text:'Will do. Better safe than sorry.'}
        ],
        questions:[
          {q:'What do Mint and the colleague notice?', a:'A strange smell, like something burning, near the coffee station.'},
          {q:'What do they decide to do with the area?', a:'Clear it and ask guests to move away.'},
          {q:'Who does the colleague call?', a:'Facilities.'},
          {q:'Why do they clear the area even though they don’t see smoke?', a:'Because it is best not to take chances, even without seeing smoke.', support:'"I don’t see any smoke, but it’s best not to take chances."'},
          {q:'Why does Mint tell the guest "nothing to worry about"?', a:'To keep the guest calm while they check the problem, without causing panic.', support:'"We’re just checking something, nothing to worry about."'}
        ]
      }
    ]
  },
  { id:6, label:'Group 6',
    listenings:[
      { id:'g6l1', title:'Microphone Failure',
        setting:'During a live presentation. The microphone suddenly stops working.',
        voices:{ 'Ann':LOCALE.GB, 'Leo':LOCALE.US },
        script:[
          {who:'Ann', text:'Leo, the microphone just stopped working. The speaker can’t be heard.'},
          {who:'Leo', text:'Let me check... I think the battery might be low.'},
          {who:'Ann', text:'Do we have a spare?'},
          {who:'Leo', text:'Yes, I have one right here. Give me just a moment.'},
          {who:'Ann', text:'Okay, please hurry, the guests are starting to look confused.'},
          {who:'Leo', text:'Almost done... okay, try it now.'},
          {who:'Ann', text:'Hello, can everyone hear me now?', stage:'into the mic'},
          {who:'Guests', text:'Yes!', stage:'background'},
          {who:'Ann', text:'Great, thank you, Leo, that was really fast.'},
          {who:'Leo', text:'No problem. I’ll stay close to the stage in case it happens again.'},
          {who:'Ann', text:'Good thinking, thanks for being ready.'}
        ],
        questions:[
          {q:'What problem happens?', a:'The microphone stops working.'},
          {q:'What does Leo think the problem is?', a:'The battery is low.'},
          {q:'What does Leo do to fix it?', a:'He changes the battery for a spare one.'},
          {q:'Why does Ann tell Leo to hurry?', a:'Because the guests are starting to look confused, and the speaker cannot be heard.', support:'"The speaker can’t be heard" and "the guests are starting to look confused."'},
          {q:'Why does Leo stay close to the stage after fixing the microphone?', a:'In case the problem happens again, so he can help quickly.', support:'"I’ll stay close to the stage in case it happens again."'}
        ]
      },
      { id:'g6l2', title:'Power Outage',
        setting:'In the exhibition hall. The lights suddenly go out.',
        voices:{ 'Dao':LOCALE.IN, 'Sam':LOCALE.AU },
        script:[
          {who:'Dao', text:'Sam, the lights just went out in the exhibition hall!'},
          {who:'Sam', text:'Yeah, I think it’s a power outage. Let me check with facilities.'},
          {who:'Dao', text:'Okay, in the meantime, let’s reassure the guests so nobody panics.'},
          {who:'Sam', text:'Good idea. I’ll go tell people it should be back soon.'},
          {who:'Dao', text:'Excuse me, everyone, please stay calm, we’re checking on the power right now.'},
          {who:'Guest', text:'Is it safe to stay here?', stage:'background'},
          {who:'Dao', text:'Yes, please don’t worry, just stay where you are for now.'},
          {who:'Sam', text:'Facilities said it should be back within five minutes.', stage:'returning'},
          {who:'Dao', text:'Perfect, thank you. Let’s let everyone know.'},
          {who:'Sam', text:'I’m on it.'},
          {who:'Dao', text:'Thanks for the quick update, Sam.'}
        ],
        questions:[
          {q:'What happens in the exhibition hall?', a:'The lights go out, a power outage.'},
          {q:'Who does Sam contact?', a:'Facilities.'},
          {q:'How long does facilities say the power will take to come back?', a:'About five minutes.'},
          {q:'Why does Dao tell the guests to stay calm?', a:'So nobody panics while they are checking on the power problem.', support:'"Let’s reassure the guests so nobody panics" and "please stay calm."'},
          {q:'Why does Dao ask everyone to stay where they are?', a:'Because it is safe, and moving around in the dark could be more dangerous.', support:'"Yes, please don’t worry, just stay where you are for now."'}
        ]
      }
    ]
  }
];

/* ===== Closing reflection (short, about 5 minutes) ===== */
const REFLECTION_QUESTIONS = [
  'What is one useful phrase you learned today?',
  'What should MICE staff do when a guest has a problem?',
  'What should staff do when an unexpected problem happens?'
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'MICE Integrated Listening Challenge (Units 7-8)',
  unitCode: 'listening-challenge'
};
