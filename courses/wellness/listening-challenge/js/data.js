/* ===================== WELLNESS TOURISM INTEGRATED LISTENING CHALLENGE =====================
   Units 7 and 8, merged into one lesson: Spa & Wellness Services, and
   Symptoms & Health Conditions. Grounded in the actual course syllabus
   (TQF3, Week 10 Unit 7 and Week 11 Unit 8): the five named treatments,
   the key expressions, and the two patient profile types (stressed
   office worker, elderly guest with joint pain) all come from there.

   This lesson runs AFTER the teacher's own Kahoot/Blooket review. It has
   two on-screen parts: a teacher-led discussion (whole class, one
   screen), then group check-in and the listening challenge (one shared
   device per group of 5-6 students). Unlike the MICE version, each
   group gets exactly ONE listening, followed by a group analysis task.

   Audio note: this site has no server-side TTS or bundled MP3s. Every
   conversation is read aloud live in the browser (Web Speech API), with
   a voice chosen to match both the requested accent AND the speaking
   character's gender (see GENDER and app.js VoiceEngine.resolveVoice).
   If you later want to swap in a real recorded MP3 for a listening, add
   an "audioSrc" field to that listening object (see app.js, function
   playListening) and the player will use the file instead of the
   browser voice automatically.

   Nothing here is UI logic, see app.js for rendering, state, voice, and
   progress tracking. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'discuss', label:'Teacher Discussion'},
  {key:'checkin', label:'Group Check-In'},
  {key:'listen', label:'Listening Challenge'},
  {key:'analysis', label:'Group Wellness Decision'},
  {key:'reflect', label:'Reflection'},
  {key:'complete', label:'Complete'}
];

/* ===== Part 1: 20-Minute Teacher Discussion (one shared screen) =====
   10 short talking points, about 2 minutes each, combining Unit 7
   (explaining services) and Unit 8 (understanding a guest's concern)
   the whole way through, not as two separate halves. */
const DISCUSSION_POINTS = [
  {
    n:1, title:'Wellness Services at Harmony Health Centre',
    teach:'Our center offers several treatments: Thai massage, facial, body wrap, detox programme, and float therapy. Staff need to know these well enough to explain them simply.',
    ask:'Which of these treatments have you heard of before?',
    phrases:['Our treatments include...'],
    dialogue:null
  },
  {
    n:2, title:'How Staff Explain a Service',
    teach:'Good explanations are short and clear: what it is, how long it takes, and what it helps with.',
    ask:'What can you say to explain a treatment to a guest?',
    phrases:['This treatment is ideal for...', 'The duration is approximately...', 'The benefits include...'],
    dialogue:[{who:'Staff', text:'This treatment is ideal for relaxation. The duration is approximately sixty minutes.'}]
  },
  {
    n:3, title:'Understanding a Guest\'s Needs',
    teach:'Before recommending anything, staff first need to know what the guest is looking for: relaxing or active, gentle or firm.',
    ask:'What question can you ask to understand what a guest wants?',
    phrases:['What kind of treatment are you looking for?', 'Are you looking for something relaxing?'],
    dialogue:null
  },
  {
    n:4, title:'Asking About Symptoms or Concerns',
    teach:'Sometimes a guest mentions a concern without being asked, like feeling tired or having sore muscles. Staff should notice this and ask a simple follow-up.',
    ask:'How would you describe feeling very tired with sore muscles, in simple English?',
    phrases:['I feel very tired lately.', 'My shoulders feel tense.'],
    dialogue:[{who:'Guest', text:'I feel very tired lately, and my muscles ache.'},{who:'Staff', text:'I see, how long have you had that?'}]
  },
  {
    n:5, title:'Listening Carefully',
    teach:'Small reactions show the guest you are paying attention. This is a habit, not a special phrase.',
    ask:'What can you say to show you are listening?',
    phrases:['I see.', 'Okay, I understand.'],
    dialogue:null
  },
  {
    n:6, title:'Identifying What the Guest Needs',
    teach:'Staff connect what the guest says to what they actually need. Tired and tense usually means the guest needs something gentle and calming.',
    ask:'If a guest is tired and tense, what might they need?',
    phrases:['Based on what you\'ve described...'],
    dialogue:null
  },
  {
    n:7, title:'Is This Service Suitable?',
    teach:'Not every treatment fits every guest. A treatment with a lot of stretching may not suit someone with joint pain, for example.',
    ask:'Can you think of a reason a treatment might not be right for a guest?',
    phrases:['Would you say the pain is sharp or dull?'],
    dialogue:null
  },
  {
    n:8, title:'Explaining Simply',
    teach:'Staff should keep explanations clear and short. No complicated medical words are needed.',
    ask:'How would you explain a treatment in one simple sentence?',
    phrases:['Let me explain one of our treatments.'],
    dialogue:null
  },
  {
    n:9, title:'When to Ask a Senior Colleague for Support',
    teach:'Staff are not doctors. If a guest describes a health concern, staff should never diagnose. Instead, they check with a senior therapist or manager before confirming.',
    ask:'Why should staff ask a senior colleague instead of guessing?',
    phrases:['I\'ll check with our senior therapist.'],
    dialogue:[{who:'Staff', text:'I\'d like to check with our senior therapist first, just to be safe.'}]
  },
  {
    n:10, title:'Giving an Appropriate Recommendation',
    teach:'A good recommendation connects the guest\'s need to a specific service, and explains why. Now you are ready for the listening challenge: listen for the guest\'s need, and decide if the recommended service really fits.',
    ask:'What makes a recommendation feel appropriate rather than just guessed?',
    phrases:['Based on what you\'ve described, I would suggest...'],
    dialogue:null
  }
];

const PHRASE_BANK = {
  'Explaining a Service': ['This treatment is ideal for...', 'The duration is approximately...', 'The benefits include...'],
  'Understanding Needs': ['What kind of treatment are you looking for?', 'Are you looking for something relaxing?'],
  'Asking About Concerns': ['I see, how long have you had that?', 'Would you say the pain is sharp or dull?'],
  'Recommending Appropriately': ['Based on what you\'ve described, I would suggest...', 'I\'d like to check with our senior therapist first.']
};

/* ===== Voice locales and gender, for realistic international variety
   across the 6 conversations. Gender is explicit per character (not
   guessed from the name), so the voice actually matches who is
   speaking. See app.js VoiceEngine.resolveVoice(). ===== */
const LOCALE = {
  US:'en-US', GB:'en-GB', IN:'en-IN', AU:'en-AU', IE:'en-IE', ZA:'en-ZA'
};
const GENDER = {
  Mai:'F', Laura:'F', Kai:'M', David:'M', Nid:'F', Anna:'F',
  Somchai:'M', Emma:'F', Priya:'F', Harris:'M', Ben:'M', Sara:'F'
};

/* ===== The 6 conversations, one per group =====
   Every conversation blends Unit 7 (a real treatment from the menu,
   explained using the course's key expressions) with Unit 8 (the guest
   describes a real concern that affects which service actually fits),
   so no conversation is "only services" or "only symptoms." No line of
   dialogue diagnoses a medical condition. */
const GROUPS = [
  { id:1, label:'Group 1',
    listening:{ id:'g1', title:'Tired and Tense',
      setting:'At the front desk of Harmony Health Centre. A guest asks about wellness treatments.',
      voices:{ Mai:LOCALE.GB, Laura:LOCALE.US },
      script:[
        {who:'Laura', text:'Hi, I\'d like to ask about your wellness treatments.'},
        {who:'Mai', text:'Of course. What kind of treatment are you looking for?'},
        {who:'Laura', text:'I\'ve been feeling really tired lately, and my shoulders are pretty tense.'},
        {who:'Mai', text:'I see. Are you looking for something relaxing, or something more active?'},
        {who:'Laura', text:'Definitely relaxing. Something gentle would be great.'},
        {who:'Mai', text:'Okay, let me explain one of our treatments. Our float therapy session might be ideal for you.'},
        {who:'Laura', text:'What is that exactly?'},
        {who:'Mai', text:'You float in a quiet pool of warm water. It\'s very calming, and it really helps with tension.'},
        {who:'Laura', text:'That sounds nice. How long does it take?'},
        {who:'Mai', text:'The duration is approximately sixty minutes.'},
        {who:'Laura', text:'Perfect. I think I\'d like to try that.'},
        {who:'Mai', text:'Great choice. I\'ll get that booked for you.'}
      ],
      questions:[
        {q:'What treatment does Mai explain?', a:'Float therapy.'},
        {q:'How does Laura say she feels?', a:'Tired, and her shoulders are tense.'},
        {q:'How long does the float therapy session take?', a:'About sixty minutes (approximately sixty minutes).'},
        {q:'Why does Mai recommend float therapy for Laura?', a:'Because Laura wants something relaxing and gentle, and float therapy is calming and helps with tension.', support:'"Definitely relaxing. Something gentle would be great" and "it really helps with tension."'},
        {q:'Why does Mai ask if Laura wants something relaxing or active?', a:'To understand what kind of treatment would actually suit Laura before recommending one.', support:'"What kind of treatment are you looking for?"'}
      ]
    }
  },
  { id:2, label:'Group 2',
    listening:{ id:'g2', title:'Two Treatments, One Sore Back',
      setting:'At the treatment menu display. A guest compares two services and mentions a physical concern.',
      voices:{ Kai:LOCALE.IN, David:LOCALE.US },
      script:[
        {who:'David', text:'Hi, could you tell me about your facial and your Thai massage?'},
        {who:'Kai', text:'Sure. The facial is great for the skin, very relaxing for the face. The Thai massage focuses on the whole body, with stretching and pressure.'},
        {who:'David', text:'I see. Actually, my lower back has been bothering me since I started this trip.'},
        {who:'Kai', text:'Oh, I understand. In that case, the Thai massage might help more, since it works on muscle tension in the back.'},
        {who:'David', text:'That makes sense. Is it very strong?'},
        {who:'Kai', text:'It can be firm, but we always adjust the pressure to what feels comfortable for you.'},
        {who:'David', text:'Okay, that sounds good. I think I\'ll go with the Thai massage then.'},
        {who:'Kai', text:'Great choice. I\'ll let the therapist know about your back, so she can be extra careful there.'},
        {who:'David', text:'Thank you, I appreciate that.'}
      ],
      questions:[
        {q:'Which two treatments does David ask about?', a:'The facial and the Thai massage.'},
        {q:'What problem does David describe?', a:'His lower back has been bothering him.'},
        {q:'What does Kai say he will tell the therapist?', a:'About David\'s back, so she can be careful there.'},
        {q:'Why does Kai recommend the Thai massage instead of the facial?', a:'Because David has back pain, and the Thai massage works on muscle tension in the back.', support:'"My lower back has been bothering me" and "the Thai massage might help more, since it works on muscle tension in the back."'},
        {q:'Why does Kai tell the therapist about David\'s back?', a:'So the therapist can be extra careful and comfortable with that area during the massage.', support:'"I\'ll let the therapist know about your back, so she can be extra careful there."'}
      ]
    }
  },
  { id:3, label:'Group 3',
    listening:{ id:'g3', title:'Sensitive Skin',
      setting:'At the spa counter. A guest asks about the body wrap and mentions a skin sensitivity.',
      voices:{ Nid:LOCALE.AU, Anna:LOCALE.GB },
      script:[
        {who:'Anna', text:'Hi, I saw the body wrap on your menu. Can you tell me more about it?'},
        {who:'Nid', text:'Of course. It\'s a treatment where we apply a mineral mask, then wrap you to help detoxify the skin.'},
        {who:'Anna', text:'That sounds relaxing. Actually, I should mention my skin gets irritated easily.'},
        {who:'Nid', text:'Okay, thank you for telling me. Do you know if you\'re sensitive to any particular ingredients?'},
        {who:'Anna', text:'I\'m not totally sure, but I react to strong fragrances sometimes.'},
        {who:'Nid', text:'I see. Let me check with our therapist about using an unscented version for you.'},
        {who:'Anna', text:'Oh, that would be great, thank you.'},
        {who:'Nid', text:'Of course. It\'s better to check first, just to be safe.'},
        {who:'Anna', text:'I really appreciate that.'}
      ],
      questions:[
        {q:'What treatment does Anna ask about?', a:'The body wrap.'},
        {q:'What does Anna say about her skin?', a:'It gets irritated easily, and she reacts to strong fragrances.'},
        {q:'What does Nid say she will check?', a:'Whether they can use an unscented version for Anna.'},
        {q:'Why does Nid ask if Anna is sensitive to any ingredients?', a:'Because Anna said her skin gets irritated easily, so Nid wants more information before continuing.', support:'"My skin gets irritated easily" and "Do you know if you\'re sensitive to any particular ingredients?"'},
        {q:'Why does Nid check with the therapist before continuing?', a:'To make sure the treatment is actually safe for Anna\'s sensitive skin, instead of guessing.', support:'"It\'s better to check first, just to be safe."'}
      ]
    }
  },
  { id:4, label:'Group 4',
    listening:{ id:'g4', title:'Stress and Poor Sleep',
      setting:'In the consultation room. A guest, a stressed office worker, is not sure what service she needs.',
      voices:{ Somchai:LOCALE.IN, Emma:LOCALE.US },
      script:[
        {who:'Emma', text:'Hi, I\'m not sure what I need. I\'ve just been really stressed lately, and I\'m not sleeping well.'},
        {who:'Somchai', text:'I understand, that happens a lot with guests who travel for work. How long has this been going on?'},
        {who:'Emma', text:'A few weeks now, I think. My mind just doesn\'t slow down at night.'},
        {who:'Somchai', text:'I see. Based on what you\'ve described, I would suggest our detox programme. It includes gentle activities and gives your body a chance to reset.'},
        {who:'Emma', text:'What does that involve exactly?'},
        {who:'Somchai', text:'It\'s a combination of light meals, stretching, and quiet time. Many guests say it helps them sleep better by the end.'},
        {who:'Emma', text:'That sounds like exactly what I need.'},
        {who:'Somchai', text:'Great. We can also add a short evening session to help you relax before bed.'},
        {who:'Emma', text:'Perfect, let\'s do that.'}
      ],
      questions:[
        {q:'How does Emma describe how she feels?', a:'Stressed, and not sleeping well.'},
        {q:'How long has this been happening?', a:'A few weeks.'},
        {q:'What does Somchai recommend?', a:'The detox programme.'},
        {q:'Why does Somchai recommend the detox programme?', a:'Because Emma is stressed and not sleeping well, and the programme helps guests relax and reset.', support:'"Really stressed lately, and I\'m not sleeping well" and "gives your body a chance to reset."'},
        {q:'Why does Somchai suggest adding an evening session?', a:'To help Emma relax before bed, since her mind doesn\'t slow down at night.', support:'"My mind just doesn\'t slow down at night" and "a short evening session to help you relax before bed."'}
      ]
    }
  },
  { id:5, label:'Group 5',
    listening:{ id:'g5', title:'A Question About Joint Pain',
      setting:'At the reception desk. An older guest asks about a massage and mentions joint pain.',
      voices:{ Priya:LOCALE.AU, Harris:LOCALE.US },
      script:[
        {who:'Harris', text:'Hello, I\'d like to try one of your massages, maybe the Thai massage.'},
        {who:'Priya', text:'Of course. Before we book that, can I ask, do you have any health concerns I should know about?'},
        {who:'Harris', text:'Well, I do have some joint pain in my knees. It\'s been like that for a few years now.'},
        {who:'Priya', text:'I see, thank you for telling me. Would you say the pain is sharp, or more of a dull ache?'},
        {who:'Harris', text:'Mostly a dull ache, but sometimes it\'s worse.'},
        {who:'Priya', text:'Okay. The Thai massage does involve some stretching, so it might not be the most comfortable choice for your knees.'},
        {who:'Harris', text:'Oh, I didn\'t think about that.'},
        {who:'Priya', text:'I\'d recommend the float therapy instead, it\'s very gentle and doesn\'t put pressure on the joints. I can also ask our senior therapist to confirm it\'s a good fit for you.'},
        {who:'Harris', text:'That sounds much better, thank you.'},
        {who:'Priya', text:'Of course. Your comfort is our priority.'}
      ],
      questions:[
        {q:'Which treatment does Mr. Harris first ask about?', a:'The Thai massage.'},
        {q:'What health concern does Mr. Harris mention?', a:'Joint pain in his knees.'},
        {q:'What does Priya recommend instead?', a:'Float therapy.'},
        {q:'Why does Priya suggest float therapy instead of the Thai massage?', a:'Because the Thai massage involves stretching, which might not be comfortable for his knees, but float therapy is gentle and doesn\'t put pressure on the joints.', support:'"The Thai massage does involve some stretching, so it might not be the most comfortable choice for your knees."'},
        {q:'Why does Priya want to ask the senior therapist to confirm?', a:'Because Mr. Harris has joint pain, so she wants to make sure float therapy is really a good fit, not just guess.', support:'"I can also ask our senior therapist to confirm it\'s a good fit for you."'}
      ]
    }
  },
  { id:6, label:'Group 6',
    listening:{ id:'g6', title:'Benefits and Duration',
      setting:'At the wellness desk. A guest asks about the detox programme and mentions low energy.',
      voices:{ Ben:LOCALE.GB, Sara:LOCALE.IN },
      script:[
        {who:'Sara', text:'Hi, I\'ve been curious about your detox programme. Can you tell me about it?'},
        {who:'Ben', text:'Sure. It\'s designed to help the body reset, with healthy meals and light activities.'},
        {who:'Sara', text:'What are the benefits exactly?'},
        {who:'Ben', text:'The benefits include better energy, improved digestion, and a general feeling of lightness.'},
        {who:'Sara', text:'That\'s exactly what I need. I\'ve been feeling really sluggish and low on energy lately.'},
        {who:'Ben', text:'I understand. How long has that been going on?'},
        {who:'Sara', text:'About two weeks, since I started this busy travel schedule.'},
        {who:'Ben', text:'That makes sense. The programme runs for three days, so it could really help reset things for you.'},
        {who:'Sara', text:'Three days sounds manageable. What\'s included each day?'},
        {who:'Ben', text:'Each day includes meals, a short activity session, and some quiet relaxation time.'},
        {who:'Sara', text:'Great, I\'d like to book that.'}
      ],
      questions:[
        {q:'What programme does Sara ask about?', a:'The detox programme.'},
        {q:'How does Sara say she has been feeling?', a:'Sluggish and low on energy.'},
        {q:'How long does the programme run?', a:'Three days.'},
        {q:'Why does Ben think the detox programme could help Sara?', a:'Because she has been feeling sluggish and low on energy, and the programme is designed to help the body reset and improve energy.', support:'"Really sluggish and low on energy lately" and "the benefits include better energy."'},
        {q:'Why does Ben ask how long Sara has been feeling this way?', a:'To understand her situation better before explaining the programme.', support:'"How long has that been going on?"'}
      ]
    }
  }
];

/* ===== Group Wellness Decision (analysis task, after the listening) =====
   Same six questions for every group, the group fills them in using
   evidence from their own listening, not a generic guess. */
const ANALYSIS_QUESTIONS = [
  {key:'need', label:'What does the guest need?'},
  {key:'concern', label:'What concern or symptom does the guest describe?'},
  {key:'service', label:'What wellness service is being discussed?'},
  {key:'suitable', label:'Is this service suitable, based on the information in the conversation?'},
  {key:'why', label:'Why?'},
  {key:'explain', label:'What should the wellness staff member explain to the guest?'}
];
const ANALYSIS_FRAMES = [
  'We recommend __________ because __________.',
  'The guest needs __________ because __________.'
];

/* ===== Model Group Wellness Decision answers, one per group =====
   Teacher reference only, for guiding whole-class feedback. Not shown
   to students, students complete their own analysis using the same
   ANALYSIS_QUESTIONS above. */
const MODEL_ANALYSIS = {
  1: { need:'Something relaxing and gentle.', concern:'Feeling tired, with tense shoulders.', service:'Float therapy.', suitable:'Yes.', why:'It is calming and helps with tension, which matches what Laura asked for.', explain:'That the session is about 60 minutes, in a quiet pool of warm water, and is gentle and relaxing.', frame1:'We recommend float therapy because Laura wants something relaxing and gentle for her tiredness and tension.', frame2:'The guest needs a calming treatment because she feels tired and tense.' },
  2: { need:'Relief from lower back discomfort.', concern:'His lower back has been bothering him since the trip started.', service:'Thai massage (compared with a facial).', suitable:'Yes, with care.', why:'It works on muscle tension in the back, and the pressure can be adjusted to be comfortable.', explain:'That the pressure will be adjusted, and that the therapist will be told about his back.', frame1:'We recommend the Thai massage because it works on the muscle tension causing David\'s back discomfort.', frame2:'The guest needs a treatment for back tension because his lower back has been bothering him.' },
  3: { need:'A safe treatment for sensitive skin.', concern:'Her skin gets irritated easily, and she reacts to strong fragrances.', service:'Body wrap.', suitable:'Only if adjusted (unscented version), so staff must check first.', why:'The standard body wrap may use scented products, which could irritate her skin, so it needs to be confirmed with the therapist first.', explain:'That staff will check whether an unscented version is available before booking.', frame1:'We recommend the body wrap only after checking for an unscented option, because Anna\'s skin is sensitive to fragrance.', frame2:'The guest needs a fragrance-free option because her skin reacts to strong fragrances.' },
  4: { need:'Help with stress and better sleep.', concern:'Feeling very stressed, with poor sleep for a few weeks.', service:'Detox programme (with an added evening session).', suitable:'Yes.', why:'It includes gentle activities and quiet time, which is designed to help guests relax and reset, matching her stress and sleep concern.', explain:'What the programme includes each day, and how the evening session can help her relax before bed.', frame1:'We recommend the detox programme because Emma is stressed and not sleeping well, and the programme helps guests relax and reset.', frame2:'The guest needs a relaxing, structured programme because her stress is affecting her sleep.' },
  5: { need:'A comfortable treatment that will not hurt his knees.', concern:'Ongoing joint pain (a dull ache) in his knees.', service:'Thai massage was requested, float therapy was recommended instead.', suitable:'The original request (Thai massage) is not suitable, float therapy is a better fit.', why:'The Thai massage involves stretching, which could be uncomfortable for his knees, while float therapy is gentle and does not put pressure on joints.', explain:'Why float therapy is being suggested instead, and that a senior therapist will confirm it is a good fit.', frame1:'We recommend float therapy instead of the Thai massage because Mr. Harris has joint pain and needs a gentler option.', frame2:'The guest needs a low-pressure treatment because his knees have ongoing joint pain.' },
  6: { need:'More energy and better digestion.', concern:'Feeling sluggish and low on energy for about two weeks.', service:'Detox programme.', suitable:'Yes.', why:'The programme\'s benefits (better energy, improved digestion) directly match what Sara described feeling.', explain:'What is included each day (meals, activity, relaxation time), and that the programme runs for three days.', frame1:'We recommend the detox programme because Sara has been feeling sluggish and low on energy, and the programme is designed to improve energy.', frame2:'The guest needs an energy-boosting programme because she has felt sluggish for two weeks.' }
};

/* ===== Closing reflection (short, about 5 minutes) ===== */
const REFLECTION_QUESTIONS = [
  'What is one useful phrase you learned today?',
  'What makes a wellness service suitable for a guest?',
  'Why is it important to listen carefully before recommending a service?'
];

/* ===================== COURSE / UNIT IDENTITY ===================== */
const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Wellness Integrated Listening Challenge (Units 7-8)',
  unitCode: 'listening-challenge'
};
