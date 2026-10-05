/* ===================== UNIT 16 CONTENT DATA: THE WELLNESS FEATURE =====================
   The integrated final unit. Students use what they practiced in Units 3 to 15 (consulting,
   recommending, explaining, confirming, handling a guest's concern) to make ONE group
   output: a real wellness feature (video + group presentation + individual reflection).
   The site is the toolkit. The writing is done on the printed Group Capstone Sheet and
   Individual Reflection sheet. Model examples are examples only: groups research their own facts.
   CLO 2, CLO 4, CLO 6, CLO 7. Final Wellness Tourism Group Presentation. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Your Mission'},
  {key:'s2', label:'Idea Lab'},
  {key:'s3', label:'Anatomy of a Feature'},
  {key:'s4', label:'Strong Information'},
  {key:'s5', label:'Guest Language'},
  {key:'s6', label:'A Real Consideration'},
  {key:'s7', label:'Plan, Film, Present'},
  {key:'s8', label:'Questions and Rehearsal'},
  {key:'s9', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

const COURSE_META = {
  course: 'English for Wellness Tourism',
  courseCode: 'wellness',
  unit: 'Unit 16, Integrated Unit: The Wellness Feature (Final Project)',
  unitCode: 'unit-16'
};

const FINAL_DATE = 'October 21';

/* ===== Section 1: Your Mission ===== */
const BRIEF = {
  from: 'Phuket Wellness Tourism Board',
  subject: 'Feature needed: a real wellness experience in Phuket',
  body: 'Our visitors want to know what Phuket really offers for wellness. Please produce a short professional feature about ONE real wellness activity. Research it properly, show it happening, and explain it the way a good consultant would. Then present what you found to the class.'
};
const OUTPUTS = [
  {ic:'🎬', title:'Group Video Feature', text:'6 to 8 minutes. Opening, feature, closing. Real footage of the activity.'},
  {ic:'🎤', title:'Group Presentation', text:'Explain what you found and why you chose it. Every student speaks.'},
  {ic:'✍️', title:'Individual Reflection', text:'Five prompts, in your own simple English, on your own sheet.'}
];
/* Where each part of the feature comes from in the earlier units */
const INTEGRATION = [
  {from:'Units 3 and 5', skill:'Describing places and guiding', use:'Opening, feature, where in Phuket'},
  {from:'Units 4 and 9', skill:'Customer service and the concierge desk', use:'Guest language (target 7)'},
  {from:'Units 6 and 10', skill:'Reservations and personalizing a day', use:'Ideal for, duration, confirming'},
  {from:'Units 11 and 12', skill:'Promotion and choosing a package', use:'Benefits and recommending'},
  {from:'Units 13 and 14', skill:'Difficult requests and a guest who needs help', use:'A real consideration (target 8)'},
  {from:'Unit 15', skill:'Designing a guest\'s whole day', use:'Putting everything together'}
];
const MISSION_RULES = [
  {stmt:'Only one student in the group needs to research and write an information target.', answer:'F', note:'Every student researches and writes at least one target. In bigger groups, some students take two.'},
  {stmt:'You can use an AI tool to create the video if it looks real.', answer:'F', note:'No AI-generated video. Use real footage you record yourselves.'},
  {stmt:'You must ask permission before you film at a real spa or wellness venue.', answer:'T', note:'Always ask first. Never film a guest without permission.'},
  {stmt:'Every student must speak in the final group presentation.', answer:'T', note:'Yes. Everyone speaks, even if only one person edited the video.'},
  {stmt:'The video feature should be about 6 to 8 minutes long.', answer:'T', note:'Six to eight minutes, with an opening, the feature, and a closing.'},
  {stmt:'"Written by" on the Group Sheet means "the person who says it on camera".', answer:'F', note:'Written by means who researched and wrote that target. Another student can say it on camera.'}
];

/* ===== Section 3: Anatomy of a Feature =====
   A model feature for a Thai herbal compress massage. This is a MODEL only.
   Groups must research and write their own real content. */
const FEATURE_PARTS = [
  {id:'opening', label:'Opening', job:'Introduce your group and the activity you chose.'},
  {id:'feature', label:'Feature', job:'Present your information targets. Show the activity actually happening.'},
  {id:'closing', label:'Closing', job:'Recommend the activity and tell viewers where to experience it in Phuket.'}
];
const MODEL_LINES = [
  {text:'Hello and welcome. Today we are looking at an old Thai tradition that is still very popular with guests.', part:'opening'},
  {text:'We are Group 3, and our feature is about the Thai herbal compress massage.', part:'opening'},
  {text:'A therapist steams herbal balls and presses them on the body, starting with the shoulders.', part:'feature'},
  {text:'The warm herbs, such as lemongrass, help to ease sore muscles.', part:'feature'},
  {text:'A session usually takes about sixty to ninety minutes.', part:'feature'},
  {text:'If a guest has sensitive skin, the therapist should check the herbs with the guest first.', part:'feature'},
  {text:'If you are tired from traveling or exercise, this is a great way to recover.', part:'closing'},
  {text:'You can try it at traditional Thai massage centers around Phuket.', part:'closing'},
  {text:'Thank you for watching, and we hope you enjoy your own wellness experience.', part:'closing'}
];
const FEATURE_TIPS = [
  'Clear sound. Viewers forgive simple pictures, not bad audio.',
  'Understandable English. Short sentences sound natural.',
  'Accurate information. Check your facts.',
  'A natural presenting voice, not a monotone read. Speak to the viewer: "you" and "your".',
  'Professional, respectful behavior, especially at a real venue.',
  'Real footage or a real demonstration of the activity, shown while you talk about it.'
];


/* ===== Section 2: Idea Lab =====
   Creative, open brainstorming. Wild ideas first, real facts later.
   Activities come from the Wellness Feature Capstone Guide. Groups may choose any other real activity. */
const LAB_ACTIVITIES = [
  {id:'massage', ic:'💆', label:'Traditional Thai Massage', spark:'What happens in the first five minutes?'},
  {id:'spa', ic:'🧖', label:'Spa and Beauty Treatments', spark:'Which treatment would surprise a first-time guest?'},
  {id:'yoga', ic:'🧘', label:'Yoga and Meditation', spark:'Where in Phuket is the most peaceful place to practice?'},
  {id:'springs', ic:'♨️', label:'Hot Springs and Hydrotherapy', spark:'Why do guests feel so relaxed afterwards?'},
  {id:'herbal', ic:'🌿', label:'Herbal and Aromatherapy', spark:'Which herbs or smells are special to Thailand?'},
  {id:'retreat', ic:'🏃', label:'Fitness and Wellness Retreats', spark:'What does a perfect day at a retreat look like?'},
  {id:'consult', ic:'💬', label:'Guest Consultation Language', spark:'How does a good consultant make a guest feel heard?'},
  {id:'marketing', ic:'📣', label:'Wellness Tourism Marketing', spark:'How do you make a wellness experience look irresistible?'}
];
const LAB_STYLES = [
  {id:'host', label:'One Host', text:'One confident host takes the viewer through everything.'},
  {id:'cohosts', label:'Two Co-Hosts', text:'Two hosts talk to each other and to the viewer.'},
  {id:'demo', label:'Host and Demonstrator', text:'A host explains while someone shows the activity.'},
  {id:'segments', label:'Segment Presenters', text:'Each student presents one segment, like a magazine show.'},
  {id:'narrator', label:'Narrator and On-Screen Demonstration', text:'A voice explains while the camera shows the real activity.'},
  {id:'own', label:'Your Own Format', text:'Invent something new. Be creative and professional.'}
];
const LAB_ANGLES = [
  {id:'first', label:'A first-time guest', text:'Follow one guest trying it for the first time.'},
  {id:'myth', label:'Myth or fact', text:'Bust common ideas guests have about the activity.'},
  {id:'behind', label:'Behind the scenes', text:'Show what staff do that guests never see.'},
  {id:'oldnew', label:'Old tradition, new twist', text:'Show how a Thai tradition meets modern wellness.'},
  {id:'ask', label:'Guests ask, we answer', text:'Real guest questions, clear professional answers.'},
  {id:'beginner', label:'A beginner\'s guide', text:'Everything a beginner needs to know, step by step.'},
  {id:'journey', label:'Before and after', text:'How a guest feels before and after the experience.'},
  {id:'local', label:'A local\'s view', text:'A real practitioner or local person shares their story.'}
];
const LAB_SPARKS = [
  'What would surprise a visitor from another country?',
  'What can the camera show that words cannot?',
  'What is the one thing a guest should never miss?',
  'What question would a nervous guest ask?',
  'What makes this experience Thai and not just anywhere?',
  'If you had only 30 seconds to convince a guest, what would you say?',
  'What is the most beautiful thing a viewer will see?',
  'Who is the perfect guest for this, and who is not?'
];
const LAB_RULES = [
  'Wild ideas first. Real facts later.',
  'Every idea counts for the first five minutes. Do not say "no".',
  'Then choose ONE real activity you can actually visit in Phuket.'
];

/* ===== Section 4: Strong Information =====
   One round per information target. Pick the stronger line. Examples only. */
const TARGET_ROUNDS = [
  {no:1, target:'ACTIVITY', weak:'It is a nice massage.', strong:'It is a traditional massage that uses warm herbal balls pressed on the body.'},
  {no:2, target:'IDEAL FOR', weak:'It is for everyone.', strong:'It is ideal for guests with tired muscles after hiking or a long flight.'},
  {no:3, target:'DURATION', weak:'It takes some time.', strong:'A session takes about sixty to ninety minutes.'},
  {no:4, target:'BENEFITS', weak:'It is good for you.', strong:'It can relax tight muscles and help guests sleep better.'},
  {no:5, target:'WHERE IN PHUKET', weak:'You can find it somewhere in Phuket.', strong:'You can book it at a named spa in Patong, and the staff can explain the treatment in English.'},
  {no:6, target:'HOW IT IS DONE', weak:'They do the treatment.', strong:'First the guest lies down. Then the therapist presses warm herbal balls along the back, arms, and legs.'},
  {no:7, target:'GUEST LANGUAGE', weak:'Do you want massage?', strong:'Would you like to try a herbal compress massage? It can help you relax after your trip.'},
  {no:8, target:'A REAL CONSIDERATION', weak:'Some people cannot do it.', strong:'Guests who are pregnant or have skin allergies should tell the therapist before the treatment.'},
  {no:9, target:'THAI / LOCAL SIGNIFICANCE', weak:'It is from Thailand.', strong:'Thai people have used herbs for healing for generations, and the practice is part of traditional Thai medicine.'},
  {no:10, target:'ADVICE', weak:'Be nice to guests.', strong:'Always ask the guest about allergies and the pressure they prefer before you begin.'}
];
const STRONG_RULE = 'A strong line is specific. It tells the guest who, what, how long, where, or how. Avoid words like "nice", "good", "some", and "somewhere".';

/* ===== Section 5: Guest Language ===== */
const CONSULT_STEPS = [
  {id:'ask', label:'Ask the goal', ic:'👂', phrases:[
    'What would you like to get from your wellness experience today?',
    'Are you looking for relaxation or more energy?',
    'Is there any area of your body that feels tense?'
  ]},
  {id:'recommend', label:'Recommend', ic:'🌿', phrases:[
    'Based on what you told me, I would recommend the herbal compress massage.',
    'This treatment would be a good fit for you because it helps tired muscles.',
    'Many guests with the same goal really enjoy this one.'
  ]},
  {id:'explain', label:'Explain', ic:'💬', phrases:[
    'The treatment takes about ninety minutes and includes a warm herbal compress.',
    'First, the therapist checks your pressure preference. Then the massage begins.',
    'The main benefits are relaxed muscles and better sleep.'
  ]},
  {id:'confirm', label:'Confirm', ic:'✅', phrases:[
    'Shall I book that for you at three o\'clock?',
    'So that is the herbal compress massage at three o\'clock. Is that correct?',
    'Do you have any questions before we begin?'
  ]}
];
const CONSULT_NOTE = 'These four steps came from your earlier units. Your feature should use all four in the guest language, target 7.';

/* ===== Section 6: A Real Consideration =====
   Target 8. The guest worries. Choose the best staff response.
   A good response: thank or acknowledge, give accurate information, offer a solution, check back. */
const FOUR_STEPS = [
  {n:1, label:'Acknowledge', say:'Thank you for telling me.'},
  {n:2, label:'Inform or reassure', say:'Some treatments are not suitable in that case.'},
  {n:3, label:'Offer a solution', say:'I can suggest a gentler option.'},
  {n:4, label:'Check back', say:'Would that work for you?'}
];
const WORRIES = [
  {guest:'I am pregnant. Can I have the massage?', answer:'Thank you for telling me. Some treatments are not suitable during pregnancy, so I will check with our therapist and suggest a safe option for you.', wrong:['Yes, of course. No problem at all.', 'I do not know. Please ask someone else.']},
  {guest:'I have a nut allergy. Is the oil safe for me?', answer:'Thank you for telling me. Let me check the ingredients, and we can use an oil without nuts if you prefer.', wrong:['It is only a small amount of oil.', 'That is not really our problem.']},
  {guest:'The pressure is too strong for me.', answer:'I am sorry about that. I will ask the therapist to use lighter pressure. Please tell us if it is still too much.', wrong:['Please be quiet. It is almost finished.', 'This is the normal pressure.']},
  {guest:'I am not very fit. Is the yoga class too hard for me?', answer:'That is fine. The class has easy options, and the teacher will show you a gentler version.', wrong:['You should be fit before you come.', 'Everyone can do it, just try.']},
  {guest:'The price seems quite high.', answer:'I understand. Would you like to see a shorter treatment that costs less?', wrong:['That is the price. It cannot change.', 'Then you can go to another spa.']},
  {guest:'I only have forty five minutes before my tour.', answer:'No problem. We have a forty five minute treatment that fits your time. Shall I book it for you?', wrong:['Then you should come back another day.', 'Forty five minutes is too short for anything.']}
];

/* ===== Section 7: Plan, Film, Present ===== */
const MILESTONES = [
  {id:'activity', title:'Choose one real activity', text:'Pick something realistic that you can actually research and visit in Phuket.'},
  {id:'targets', title:'Assign the 10 targets', text:'Write who researches each target on the Group Sheet. Every student has at least one.'},
  {id:'research', title:'Research and write', text:'Everyone writes their own target in their own words.'},
  {id:'venue', title:'Find a real venue or practitioner', text:'Ask permission to film. Optional but recommended: ask a practitioner for one short clip, a tip, or an answer to a question.'},
  {id:'plan', title:'Plan the video and the presentation', text:'On the Group Sheet: your opening, your feature format, your closing, what you will share, and how you will organize it.'},
  {id:'film', title:'Film the feature', text:'Opening, feature, closing. Real footage. Clear sound. 6 to 8 minutes.'},
  {id:'rehearse', title:'Rehearse the presentation', text:'Everyone speaks. Ask another group for feedback.'},
  {id:'reflect', title:'Write your reflection', text:'Each student writes their own, using the five prompts.'}
];
const FILM_RULES = [
  {stmt:'We ask the spa manager for permission before we film.', ok:true},
  {stmt:'We film a guest during a massage without asking.', ok:false},
  {stmt:'We use an AI tool to create the video.', ok:false},
  {stmt:'We record in a quiet place so the sound is clear.', ok:true},
  {stmt:'We show the spa\'s private staff price list on camera.', ok:false},
  {stmt:'We ask a therapist for one short tip, and we ask permission first.', ok:true}
];
const ROLE_IDEAS = [
  {role:'Researcher and writer', text:'Everyone. At least one information target each.'},
  {role:'Host', text:'Welcomes viewers and guides them through the feature.'},
  {role:'Co-Host or Presenter', text:'Shares the host role or presents a segment.'},
  {role:'Demonstrator', text:'Shows the activity happening on camera.'},
  {role:'Videographer or Editor', text:'Records, handles sound, and puts the video together.'},
  {role:'Other', text:'Anything your group needs. Write it on the Group Sheet.'}
];

/* ===== Section 8: Questions and Rehearsal ===== */
const QA_ROUNDS = [
  {q:'How long does the treatment take?', answer:'It usually takes about sixty to ninety minutes, depending on the package.', wrong:['Maybe long. I am not sure.', 'I forgot. Sorry.']},
  {q:'Is it safe for pregnant guests?', answer:'Some treatments are not suitable during pregnancy, so guests should tell the therapist first.', wrong:['Yes, it is safe for everyone.', 'I do not want to answer that.']},
  {q:'Why did your group choose this activity?', answer:'We chose it because it is part of Thai culture, popular with visitors, and we could visit a real venue.', wrong:['Because it was easy.', 'We did not choose. The teacher chose.']},
  {q:'What was the hardest part of your project?', answer:'The hardest part was explaining the benefits clearly, so we practiced our sentences together.', wrong:['Nothing was hard.', 'Our group did not work together.']},
  {q:'What advice would you give a new consultant?', answer:'Always ask about allergies and the pressure a guest prefers before you begin.', wrong:['Be nice.', 'Do not talk too much.']}
];
const DONT_KNOW = [
  'That is a good question. I am not sure, but I can find out.',
  'I do not have that information with me. Let me check and get back to you.',
  'Could you repeat the question, please?'
];
/* What the group presentation must include (from the Wellness Feature Capstone Guide) */
const PRESENTATION_CONTENT = [
  'Which activity you chose, and why',
  'Who it is ideal for',
  'Real information about the duration and the benefits',
  'Where guests can experience it in Phuket',
  'One consideration a guest might ask about',
  'Something surprising or interesting you learned',
  'Advice for a new wellness consultant'
];
const PRESENTATION_RULES = [
  'Every student speaks.',
  'You may show ONE short clip from your video if it helps.',
  'Your group decides how to organize it.'
];
const REHEARSAL_CHECKS = [
  'We said which activity we chose and why.',
  'We said who it is ideal for.',
  'We gave real information about the duration and benefits.',
  'We said where guests can try it in Phuket.',
  'We talked about one consideration and a good staff response.',
  'We shared something surprising we learned.',
  'We gave advice for a new wellness consultant.',
  'Every member spoke.',
  'We used a professional tone and looked at the audience.',
  'We showed no more than one short clip.'
];

/* ===== Section 9: Self-Check ===== */
/* The first seven match the Project Checklist on the printed Group Capstone Sheet */
const READY_CHECKS = [
  'Everyone researched and wrote at least one information target.',
  'We identified a real activity and a real venue or practitioner in Phuket.',
  'We received permission to film, if filming at a real venue.',
  'We completed the video feature.',
  'We prepared our presentation.',
  'Everyone contributed to the presentation.',
  'Everyone completed the individual reflection.',
  'We practiced answering questions from classmates.'
];
/* Exact prompts from the Individual Reflection sheet */
const REFLECTION_PROMPTS = [
  'What did researching this wellness activity teach you that you did not know before?',
  'What did you learn about how staff should handle a guest\'s real question or concern about this activity?',
  'What did you learn about using English to explain or recommend a wellness activity?',
  'What wellness or communication skill do you want to improve for your future career? Why?',
  'What advice would you give a new wellness consultant about recommending this activity? How can you use this advice in your future study or work?'
];
const RUBRIC = [
  {c:'Content Accuracy', d:'Useful information related to the information targets', l4:'Covers all 10 targets with clear, accurate details.', l3:'Covers most targets with useful details.', l2:'Covers some targets. Some information is unclear.', l1:'Covers few targets. Information is missing or unclear.'},
  {c:'Wellness Tourism Connection', d:'Clear connection to topics from this course', l4:'Clearly connects the feature to several course topics (consultation language, recommending, explaining, confirming).', l3:'Connects the feature to course topics.', l2:'Makes a weak connection to course topics.', l1:'Little or no connection to course topics.'},
  {c:'English Communication', d:'Clear, understandable English and appropriate communication', l4:'English is clear, natural, and easy to understand throughout.', l3:'English is mostly clear and easy to understand.', l2:'English is understandable but has noticeable errors.', l1:'English is difficult to understand.'},
  {c:'Presentation', d:'Clear, organized, and understandable presentation', l4:'Clear, well organized, and easy to follow.', l3:'Organized and easy to follow.', l2:'Somewhat organized but hard to follow at times.', l1:'Disorganized and hard to follow.'},
  {c:'Professionalism', d:'Professional behavior, respectful conduct, and appropriate content', l4:'Professional behavior and appropriate conduct throughout, including at any real venue.', l3:'Mostly professional behavior and appropriate conduct.', l2:'Some unprofessional moments or behavior.', l1:'Unprofessional behavior or inappropriate content.'},
  {c:'Teamwork', d:'Evidence that group members contributed to the project', l4:'Clear evidence every member contributed fully.', l3:'Evidence most members contributed.', l2:'Some members contributed little.', l1:'Little evidence of teamwork.'}
];
