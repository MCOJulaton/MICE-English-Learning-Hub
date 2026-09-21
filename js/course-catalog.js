/* ===================== COURSE CATALOG — single source of truth =====================
   Course → Unit → { practice, downloads, assignment }. The Practice Hub, Downloadables
   Hub, and Assignments Hub all read from this ONE file — each renders a different facet
   of the same data. They are not three unrelated pages; they are three doors into the
   same course/unit structure. Add a new unit's resources here once and all three hubs
   (plus their cross-links) update automatically — no hub ever needs its own hard-coded
   list again.

   Scoped to the units that currently have real content: MICE 4/5/6, Communication
   5/6/7, Wellness 3-6 (10 units total — Quiz Hub's own registry in quizzes/quiz-data.js
   still only covers the original 9; add Unit 7 there too if a quiz is ever built for
   it). Numbered-but-empty placeholder units ("Coming soon" cards on the course listing
   pages) have nothing to show in any of these three hubs, so they're intentionally
   left out of this catalog.

   ===== Unit record shape =====
   unitId        matches that unit's own COURSE_META.unitCode, e.g. 'unit-5'
   unit          full display name, e.g. 'Unit 5: Giving Directions at Events'
   short         compact label for tight layouts, e.g. 'Unit 5'
   href          root-absolute link to the unit's own index.html
   locked        true if the unit itself isn't open yet
   lockMsg       toast text shown when a locked unit/resource is clicked

   practice.activities[]   { label, icon, section? , tab? } — exactly one of section/tab.
     `section` = deep-links straight to a real SECTION_META key (unit has no separate
                 tabbed practice section: Wellness units, MICE Unit 6).
     `tab`     = unit has a dedicated tabbed "Practice Sets" section; deep-links to
                 ?section=practice&tab=<key> (MICE 4/5, Communication 5/6).

   blurb         one-sentence description shown on the course-listing card.

   unlockAt      optional ISO timestamp with explicit UTC offset, e.g.
                 '2026-08-24T07:00:00+07:00'. When set on a locked unit, the unit
                 unlocks itself automatically once that moment passes — no further
                 edits needed. Once unlocked (by this or by locked:false) a unit
                 never re-locks. See isUnitLocked() below for the actual check;
                 every page that shows lock state (course-listing cards, Practice
                 Hub, Downloads Hub) calls that one function, so setting unlockAt
                 here is the only edit a scheduled unlock ever requires.

                 Standing weekly class schedule, for computing the next unlockAt
                 when a new unit is ready (all times Asia/Bangkok, UTC+7):
                   English for Communication  — Monday    07:00
                   English for MICE           — Tuesday   07:00 (class also meets
                                                 Thursday, but Thursday isn't a
                                                 separate unlock trigger — whatever
                                                 unlocked Tuesday just stays open)
                   English for Wellness Tourism — Wednesday 06:00
                   Business Communication     — no fixed day yet; leave unlockAt
                                                 unset and unlock manually (locked:false)
                                                 until a schedule exists.

   downloads.materials[]   { title, type, file, icon } — one row per real file.

   assignment   { id, title, type, requiredStatus, dueDate, dueTimeNote, submissionType,
                  description, instructions[], detailUrl } or null if the unit has no
                  assignment yet. detailUrl always points at a real standalone page —
                  every assignment now has one; the hub itself never shows full
                  instructions inline.
   ===================================================================================== */
const COURSE_CATALOG = [
  {
    courseId: 'mice',
    course: 'English for MICE',
    icon: '🏢',
    courseHref: '/courses/mice/index.html',
    units: [
      {
        unitId: 'unit-4',
        unit: 'Unit 4: Professional Greetings & Networking',
        short: 'Unit 4',
        href: '/courses/mice/unit-4/index.html',
        blurb: 'Professional Greetings &amp; Networking. Learn the "Because Bridge," master 8 pro networking tips, and role-play a live MICE expo simulation.',
        locked: false,
        practice: {
          activities: [
            { label:'Quick Review', tab:'review', icon:'🔤' },
            { label:'Build the Bridge', tab:'bridge', icon:'🌉' },
            { label:'Listen & Choose', tab:'listen', icon:'🎧' },
            { label:'Speak It', tab:'speak', icon:'🗣️' }
          ]
        },
        downloads: {
          materials: [
            { title:'Professional Greetings & Networking', type:'Study Guide', file:'/assets/study-guide/Unit4-Professional-Greetings-Networking-Study-Guide.jpg', icon:'📄' }
          ]
        },
        assignment: {
          id: 'a-mice-u4-expo-video',
          title: 'MICE Expo Simulation Video',
          type: 'Video',
          requiredStatus: 'required',
          dueDate: '2026-08-21',
          submissionType: 'video',
          description: 'Record a partner role-play simulating a professional networking conversation at a MICE expo, using the greeting, small talk, and card-exchange language from Unit 4.',
          instructions: [
            'Greet your partner as if meeting for the first time at the expo.',
            'Introduce yourself: name + a made-up company or role.',
            'Use at least 2 of the 8 pro tips naturally in your conversation.',
            'Use "...I like the ___ because..." at least once (the Because Bridge).',
            'Ask one icebreaker question and keep the conversation going.',
            'End by professionally offering your business card.'
          ],
          detailUrl: '/assignments/mice-u4-expo-video/index.html'
        }
      },
      {
        unitId: 'unit-5',
        unit: 'Unit 5: Giving Directions at Events',
        short: 'Unit 5',
        href: '/courses/mice/unit-5/index.html',
        blurb: 'Giving Directions at Events. Explore the venue, listen to a real delegate request, use the interactive floor plan, and role-play as MICE staff.',
        locked: false,
        practice: {
          activities: [
            { label:'Quick Review', tab:'review', icon:'🔤' },
            { label:'Follow the Route', tab:'route', icon:'🗺️' },
            { label:'Listen & Choose', tab:'listen', icon:'🎧' },
            { label:'Say It Yourself', tab:'speak', icon:'🗣️' }
          ]
        },
        downloads: {
          materials: [
            { title:'Giving Directions at Events', type:'Study Guide', file:'/assets/study-guide/Unit5-Giving-Directions-Study-Guide.jpg', icon:'📄' }
          ]
        },
        assignment: {
          id: 'a-mice-u5-staff-challenge-video',
          title: 'Final Challenge: You Are the MICE Staff',
          type: 'Video',
          requiredStatus: 'required',
          dueDate: '2026-08-20',
          dueTimeNote: '11:59 PM',
          submissionType: 'video',
          description: 'A graded pair video. You and a partner play MICE Staff and Delegate, then switch roles and do it again.',
          instructions: [
            'One video, two rounds. You switch roles between rounds.',
            'Round 1: Student A is MICE Staff, Student B is the Delegate.',
            'Round 2: switch. Student B is MICE Staff, Student A is the Delegate.',
            'Each round: greeting, short small talk, 4 directions given, polite closing.',
            'Speak naturally. Do not just read from a script.',
            'Show both students in the same video the whole time.',
            'Submit your video, or a link to it, in our OpenChat group: MICE_WTM.'
          ],
          detailUrl: '/assignments/mice-u5-final-challenge/index.html'
        }
      },
      {
        unitId: 'unit-6',
        unit: 'Unit 6: Schedules & Time',
        short: 'Unit 6',
        href: '/courses/mice/unit-6/index.html',
        blurb: 'Schedules &amp; Time. Read a run sheet, listen to an emergency team briefing, and practice calmly announcing a delay, just like a real MICE event manager.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Speaking Practice', section:'s8', icon:'🗣️' }
          ]
        },
        downloads: {
          materials: [
            { title:'Schedules & Time', type:'Study Guide', file:'/assets/study-guide/Unit6-MICE-Schedules-Time-Study-Guide.jpg', icon:'📄' }
          ]
        },
        assignment: {
          id: 'a-mice-u6-blooket-schedule-time',
          title: 'Blooket Review Game: Schedules & Time',
          type: 'Game',
          requiredStatus: 'required',
          dueDate: '2026-08-22',
          dueTimeNote: '11:59 PM',
          submissionType: 'blooket',
          description: 'Play a Blooket review game covering the vocabulary and language from Unit 6: Schedules & Time. Your result is recorded automatically when you play.',
          instructions: [
            'Open the Blooket game link on the assignment page.',
            'Enter your name exactly as your teacher has asked.',
            'Answer every question in the game.',
            'Finish before the deadline.'
          ],
          detailUrl: '/assignments/mice-u6-blooket-schedule-time/index.html'
        }
      },
      {
        unitId: 'listening-challenge',
        unit: 'MICE Integrated Listening Challenge (Units 7-8)',
        short: 'Integrated Unit',
        href: '/courses/mice/listening-challenge/index.html',
        blurb: 'Client Service, Problem Solving, and Emergency Communication. A 20-minute teacher discussion followed by a group listening challenge: 6 groups, 2 real conversations each, no transcript, just careful listening.',
        locked: false,
        practice: {
          activities: [
            { label:'Teacher Discussion', section:'discuss', icon:'💬' },
            { label:'Group Check-In', section:'checkin', icon:'👥' },
            { label:'Listening 1', section:'listen1', icon:'🎧' },
            { label:'Listening 2', section:'listen2', icon:'🎧' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-9',
        unit: 'Unit 9: Exhibition Booth Communication',
        short: 'Unit 9',
        href: '/courses/mice/unit-9/index.html',
        blurb: 'Exhibition Booth Communication. Greet visitors, give a confident 30-second pitch, handle a competitor comparison, and turn a visitor into a real lead.',
        locked: false,
        practice: {
          activities: [
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Speaking Practice', section:'s8', icon:'🗣️' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-10',
        unit: 'Unit 10: Answering the Phone at the Information Desk',
        short: 'Unit 10',
        href: '/courses/mice/unit-10/index.html',
        blurb: 'Answering the Phone at the Information Desk. Learn the seven-step call: greet, clarify, decide whether to answer, transfer, or take a message, and close every call professionally.',
        locked: false,
        practice: {
          activities: [
            { label:'How We Answer the Phone', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening: Good Call, Poor Call', section:'s6', icon:'🎧' },
            { label:'Delegate Information Desk Challenge', section:'s8', icon:'📞' },
            { label:'Bonus: Colleague Cross-Check', section:'s6b', icon:'📑' },
            { label:'Bonus: Handle Another Call', section:'practice', icon:'🧩' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-11',
        unit: 'Unit 11: The Double-Booked Room',
        short: 'Unit 11',
        href: '/courses/mice/unit-11/index.html',
        blurb: 'The Double-Booked Room. Work in a group of 3, read a different piece of evidence each, and combine what you found to identify the real root cause of a scheduling conflict.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Solve the Mystery', section:'s6b', icon:'🔎' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-12',
        unit: 'Unit 12: Choosing a Catering Vendor',
        short: 'Unit 12',
        href: '/courses/mice/unit-12/index.html',
        blurb: 'Choosing a Catering Vendor. Compare two real vendor proposals with a partner, weigh price against value, and justify a recommendation to the client.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Compare and Decide', section:'s6b', icon:'⚖️' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-13',
        unit: 'Unit 13: The Difficult Sponsor Request',
        short: 'Unit 13',
        href: '/courses/mice/unit-13/index.html',
        blurb: 'The Difficult Sponsor Request. Listen to a sponsor\'s request, weigh three response options against a short policy on your own, then defend your decision with a partner.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Make the Decision', section:'s6b', icon:'⚖️' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-14',
        unit: 'Unit 14: Event Day Crisis: The Power Outage',
        short: 'Unit 14',
        href: '/courses/mice/unit-14/index.html',
        blurb: 'Event Day Crisis. Work in a group, listen to a live crisis briefing, then craft three genuinely different messages for delegates, VIP sponsors, and the press.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Three Messages, One Crisis', section:'s6b', icon:'⚡' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-15',
        unit: 'Unit 15: Designing the Delegate Journey',
        short: 'Unit 15',
        href: '/courses/mice/unit-15/index.html',
        blurb: 'Designing the Delegate Journey. Bring Units 9-14 together: write your own welcome, greeting, problem-recovery, and farewell messages for one VIP guest, then perform the whole journey with a partner.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Build the Journey', section:'s6b', icon:'🧭' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      }
    ]
  },
  {
    courseId: 'communication',
    course: 'English for Communication',
    icon: '💬',
    courseHref: '/courses/communication/index.html',
    units: [
      {
        unitId: 'unit-5',
        unit: 'Unit 5: My Daily Routine',
        short: 'Unit 5',
        href: '/courses/communication/unit-5/index.html',
        blurb: 'My Daily Routine. Learn 5 routine words, time &amp; sequencing words, play "Find Someone Who" Bingo, and interview a partner about their day.',
        locked: false,
        practice: {
          activities: [
            { label:'Vocabulary', tab:'vocab', icon:'🔤' },
            { label:'Grammar Check', tab:'grammar', icon:'🧩' },
            { label:'Your Time', tab:'time', icon:'⏰' },
            { label:'Listen & Choose', tab:'listen', icon:'🎧' },
            { label:'Speak It', tab:'speak', icon:'🗣️' }
          ]
        },
        downloads: {
          materials: [
            { title:'My Daily Routine', type:'Study Guide', file:'/assets/study-guide/Unit5-Daily-Routine-Study-Guide.jpg', icon:'📄' }
          ]
        },
        assignment: {
          id: 'a-comm-u5-vlog',
          title: '"A Day in My Life" Vlog',
          type: 'Video',
          requiredStatus: 'required',
          dueDate: '2026-08-14',
          submissionType: 'video',
          description: 'Film a 1–2 minute vlog narrating your daily routine in English, just like a "day in my life" video.',
          instructions: [
            'Length: 1–2 minutes.',
            'Use at least 4 routine phrases from the unit.',
            'Use at least 2 vlog phrases (a hook, a transition, or an outro).',
            'Mention at least 3 different times of day.'
          ],
          detailUrl: '/assignments/comm-u5-vlog/index.html'
        }
      },
      {
        unitId: 'unit-6',
        unit: 'Unit 6: Cultural Studies: Food & Eating',
        short: 'Unit 6',
        href: '/courses/communication/unit-6/index.html',
        blurb: 'Cultural Studies: Food &amp; Eating. Learn food words, compare food cultures, and order a meal in a restaurant role-play.',
        locked: false,
        practice: {
          activities: [
            { label:'Vocabulary', tab:'vocab', icon:'🔤' },
            { label:'Restaurant Expressions', tab:'expr', icon:'🍽️' },
            { label:'Listen & Choose', tab:'listen', icon:'🎧' },
            { label:'Speak It', tab:'speak', icon:'🗣️' },
            { label:'Partner Practice', tab:'partner', icon:'👥' }
          ]
        },
        downloads: {
          materials: [
            { title:'Food and Eating', type:'Study Guide', file:'/assets/study-guide/Unit6-Food-and-Eating-Study-Guide.jpg', icon:'📄' }
          ]
        },
        assignment: {
          id: 'a-comm-u6-roleplay',
          title: 'Real-Life English: Ordering Food at a Restaurant',
          type: 'Video',
          requiredStatus: 'required',
          dueDate: '2026-08-23',
          dueTimeNote: '11:59 PM',
          submissionType: 'video',
          description: 'Go to a real restaurant, café, or food court with your group and record a short video of yourselves ordering real food in English.',
          instructions: [
            'Work in a group of 3 or 4. Groups of 3 are preferred.',
            'Visit a real restaurant, café, or food court.',
            'Every student must speak English in the video.',
            'Order your real food using simple English, like the Unit 6 model conversation.',
            'Keep the video about 1 to 2 minutes long.',
            'End politely, for example with "Thank you."'
          ],
          detailUrl: '/assignments/comm-u6-roleplay/index.html'
        }
      },
      {
        unitId: 'unit-7',
        unit: 'Unit 7: Cultural Studies: Food Culture (Markets, Meals & Eating Habits)',
        short: 'Unit 7',
        href: '/courses/communication/unit-7/index.html',
        blurb: 'Cultural Studies: Food Culture (Markets, Meals &amp; Eating Habits). Shop at the market, stay on budget, and interview a partner about food.',
        locked: true,
        lockMsg: 'Unit 7 will open before its class session.',
        unlockAt: '2026-08-24T07:00:00+07:00', // Monday, next Communication class
        practice: {
          activities: [
            { label:'Food Vocabulary', tab:'vocab', icon:'🔤' },
            { label:'Food Culture', tab:'culture', icon:'🌏' },
            { label:'Useful English', tab:'useful', icon:'✏️' },
            { label:'Listening', tab:'listen', icon:'🎧' },
            { label:'Speaking', tab:'speak', icon:'🗣️' },
            { label:'Market English', tab:'market', icon:'🥭' }
          ]
        },
        downloads: {
          materials: [
            { title:'Food Culture: Markets, Meals & Eating Habits', type:'Study Guide', file:'/assets/study-guide/Unit7-Food-Culture-Study-Guide.jpg', icon:'📄' }
          ]
        },
        assignment: {
          id: 'a-comm-u7-market-roleplay',
          title: 'Food Market Role-Play',
          type: 'Video',
          requiredStatus: 'required',
          dueDate: '2026-09-04',
          submissionType: 'video',
          description: 'With a partner, act out buying food at a market: one of you is the Customer, one is the Seller. Buy 3 different foods and stay under a 200 baht budget, then switch roles.',
          instructions: [
            'One partner plays Customer, the other plays Seller.',
            'Customer: greet, say what you want, ask the price, pay, say thank you.',
            'Seller: greet, ask how many, ask "Anything else?", give the price, say thank you.',
            'Buy 3 different foods. Stay under 200 baht.',
            'Switch roles and perform again.'
          ],
          detailUrl: '/assignments/comm-u7-market-roleplay/index.html'
        }
      },
      {
        unitId: 'unit-8',
        unit: 'Unit 8: Sociology: Free-Time Activities',
        short: 'Unit 8',
        href: '/courses/communication/unit-8/index.html',
        blurb: 'Sociology: Free-Time Activities. Real Q: Skills for Success listening audio, new vocabulary, and a class discussion about why board games are back in style.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Note-Taking Skill', section:'s3', icon:'📝' },
            { label:'Listening', section:'s4', icon:'🎧' },
            { label:'Collocations: do/play/go', section:'s7', icon:'✏️' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-9',
        unit: 'Unit 9: Sociology: Agree, Disagree & Discuss',
        short: 'Unit 9',
        href: '/courses/communication/unit-9/index.html',
        blurb: 'Sociology: Agree, Disagree &amp; Discuss. Pronouns, reduced pronunciation, real speaking audio, and a graded group discussion about things you enjoy doing in your area.',
        locked: false,
        practice: {
          activities: [
            { label:'Grammar: Pronouns', section:'s1', icon:'🔤' },
            { label:'Pronunciation', section:'s2', icon:'🎧' },
            { label:'Speaking Skill', section:'s3', icon:'🗣️' },
            { label:'Assignment & Rubric', section:'s6', icon:'📋' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-10',
        unit: "Unit 10: Architecture: Let's Find a New Apartment",
        short: 'Unit 10',
        href: '/courses/communication/unit-10/index.html',
        blurb: 'Architecture: Let\'s Find a New Apartment. Real listening audio comparing three apartments, housing vocabulary, and listening for opinions.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Listening', section:'s3', icon:'🎧' },
            { label:'Ranking Information', section:'s4', icon:'📊' },
            { label:'Listening for Opinions', section:'s5', icon:'💬' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-11',
        unit: 'Unit 11: Architecture: Design a Home',
        short: 'Unit 11',
        href: '/courses/communication/unit-11/index.html',
        blurb: 'Architecture: Design a Home. Real listening audio about housing solutions, compound nouns, prepositions of location, and a graded home design presentation.',
        locked: false,
        practice: {
          activities: [
            { label:'Listening', section:'s1', icon:'🎧' },
            { label:'Compound Nouns', section:'s2', icon:'🔤' },
            { label:'Prepositions of Location', section:'s4', icon:'📍' },
            { label:'Assignment & Rubric', section:'s6', icon:'📋' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      }
    ]
  },
  {
    courseId: 'wellness',
    course: 'English for Wellness Tourism',
    icon: '🌿',
    courseHref: '/courses/wellness/index.html',
    units: [
      {
        unitId: 'unit-3',
        unit: 'Unit 3: Describing Wellness Destinations',
        short: 'Unit 3',
        href: '/courses/wellness/unit-3/index.html',
        blurb: 'Describing Wellness Destinations. Explore a real wellness resort, describe its facilities and activities, and play "Guess the Wellness Place" with a partner.',
        locked: true,
        practice: {
          activities: [
            { label:'Vocabulary', section:'s2', icon:'🔤' },
            { label:'Fill in the Blank', section:'s3', icon:'✏️' },
            { label:'Listen: Guided Tour', section:'s5', icon:'🎧' },
            { label:'Describe It', section:'s6', icon:'🗣️' }
          ]
        },
        downloads: {
          materials: [
            { title:'Wellness Services & Treatments', type:'Study Guide', file:'/assets/study-guide/Unit3-Wellness-Services-Treatments-Study-Guide.jpg', icon:'📄' }
          ]
        },
        assignment: null
      },
      {
        unitId: 'unit-4',
        unit: 'Unit 4: Customer Service',
        short: 'Unit 4',
        href: '/courses/wellness/unit-4/index.html',
        blurb: 'Customer Service. Welcome a tired or unhappy guest, listen for what they need, and respond with real empathy phrases, then run the full Guest Service Challenge role-play.',
        locked: true,
        practice: {
          activities: [
            { label:'Vocabulary', section:'s1', icon:'🔤' },
            { label:'Vocabulary In Context', section:'s2', icon:'✏️' },
            { label:'Listen: Check-In', section:'s5', icon:'🎧' },
            { label:'Guest Service Challenge', section:'s6', icon:'🛎️' }
          ]
        },
        downloads: {
          materials: [
            { title:'Customer Service in Wellness Tourism', type:'Study Guide', file:'/assets/study-guide/Unit4-Customer-Service-Study-Guide.jpg', icon:'📄' }
          ]
        },
        assignment: null
      },
      {
        unitId: 'unit-5',
        unit: 'Unit 5: Wellness Tourism Guiding',
        short: 'Unit 5',
        href: '/courses/wellness/unit-5/index.html',
        blurb: 'Wellness Tourism Guiding. Be the tour guide through a wellness destination, use real guiding phrases, and handle a guest\'s question at every stop.',
        locked: true,
        practice: {
          activities: [
            { label:'Vocabulary', section:'s1', icon:'🔤' },
            { label:'Guiding Phrases', section:'s3', icon:'🗣️' },
            { label:'Listen: The Guide At Work', section:'s5', icon:'🎧' },
            { label:'Be The Tour Guide', section:'s6', icon:'🧭' }
          ]
        },
        downloads: {
          materials: [
            { title:'Wellness Tourism Guiding Skills', type:'Study Guide', file:'/assets/study-guide/Unit5-Wellness-Tourism-Guiding-Study-Guide.jpg', icon:'📄' }
          ]
        },
        assignment: null
      },
      {
        unitId: 'unit-6',
        unit: 'Unit 6: Reservations & Appointments',
        short: 'Unit 6',
        href: '/courses/wellness/unit-6/index.html',
        blurb: 'Reservations &amp; Appointments. Take a booking by listening carefully, handle a fully-booked time slot or a cancellation, and confirm a reservation like a real front desk professional.',
        locked: true,
        practice: {
          activities: [
            { label:'Vocabulary', section:'s1', icon:'🔤' },
            { label:'Vocabulary In Context', section:'s2', icon:'✏️' },
            { label:'The Reservation Call', section:'s4', icon:'☎️' },
            { label:'Real-World Challenges', section:'s5', icon:'⚠️' }
          ]
        },
        downloads: {
          materials: [
            { title:'Reservations & Appointments', type:'Study Guide', file:'/assets/study-guide/Unit6-Reservations-Appointments-Study-Guide.jpg', icon:'📄' }
          ]
        },
        assignment: null
      },
      {
        unitId: 'guest-journey',
        unit: 'The Wellness Guest Journey',
        short: 'Integrated Unit',
        href: '/courses/wellness/guest-journey/index.html',
        blurb: 'An integrated communication challenge. Follow one guest through a complete visit to Harmony Wellness Resort: welcome them, guide them, and help them book, using the skills from Units 3 to 6 in one connected story.',
        locked: false,
        practice: {
          activities: [
            { label:'Guest Service Challenge', section:'s1game', icon:'🛎️' },
            { label:'Build the Wellness Tour', section:'s2game', icon:'🧭' },
            { label:'Spa Booking Challenge', section:'s3game', icon:'📅' },
            { label:'Final Challenge', section:'s4', icon:'🌿' }
          ]
        },
        downloads: { materials: [] },
        assignment: {
          id: 'a-wellness-guest-journey-blooket',
          title: 'Blooket Review Game: The Wellness Guest Journey',
          type: 'Game',
          requiredStatus: 'required',
          dueDate: '2026-08-24',
          dueTimeNote: '11:59 PM',
          submissionType: 'blooket',
          description: 'A take-home Blooket review game covering the full guest journey at Harmony Wellness Resort: guest service, guiding a tour, and managing a reservation. Your result is recorded automatically when you play.',
          instructions: [
            'Open the Blooket game link on the assignment page.',
            'Enter your name exactly as your teacher has asked.',
            'Answer every question in the game.',
            'Finish before the deadline.'
          ],
          detailUrl: '/assignments/wellness-guest-journey-blooket/index.html'
        }
      },
      {
        unitId: 'listening-challenge',
        unit: 'Wellness Integrated Listening Challenge (Units 7-8)',
        short: 'Integrated Unit',
        href: '/courses/wellness/listening-challenge/index.html',
        blurb: 'Spa &amp; Wellness Services + Symptoms &amp; Health Conditions. A 20-minute teacher discussion followed by a group listening challenge: 6 groups, one real consultation each, then a group wellness decision.',
        locked: false,
        practice: {
          activities: [
            { label:'Teacher Discussion', section:'discuss', icon:'💬' },
            { label:'Group Check-In', section:'checkin', icon:'👥' },
            { label:'Listening Challenge', section:'listen', icon:'🎧' },
            { label:'Group Wellness Decision', section:'analysis', icon:'📝' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-9',
        unit: 'Unit 9: The Wellness Concierge Desk',
        short: 'Unit 9',
        href: '/courses/wellness/unit-9/index.html',
        blurb: 'The Wellness Concierge Desk. Understand a guest\'s goal, give a clear program overview, and recommend the option that genuinely suits them.',
        locked: false,
        practice: {
          activities: [
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Speaking Practice', section:'s8', icon:'🗣️' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-10',
        unit: 'Unit 10: Personalizing a Wellness Day',
        short: 'Unit 10',
        href: '/courses/wellness/unit-10/index.html',
        blurb: "Personalizing a Wellness Day. Run a short wellness consultation, recommend activities that fit a guest's goal, explain a constraint instead of just saying no, and confirm the finished plan.",
        locked: false,
        practice: {
          activities: [
            { label:'What I Tell Every New Consultant', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Guided Consultation Practice', section:'s5b', icon:'🗣️' },
            { label:'Model Consultation', section:'s6', icon:'🎧' },
            { label:'Build a Wellness Day', section:'s6b', icon:'📑' },
            { label:'Bonus: Difficult Guest Cases', section:'practice', icon:'🧩' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-11',
        unit: 'Unit 11: The Guest Who Didn\'t Feel Well',
        short: 'Unit 11',
        href: '/courses/wellness/unit-11/index.html',
        blurb: 'The Guest Who Didn\'t Feel Well. Work in a group of 3, read a different piece of evidence each, and combine what you found to identify the real root cause of a guest\'s reaction.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Solve the Mystery', section:'s6b', icon:'🔎' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-12',
        unit: 'Unit 12: Choosing the Right Package',
        short: 'Unit 12',
        href: '/courses/wellness/unit-12/index.html',
        blurb: 'Choosing the Right Package. Compare two real wellness packages with a partner, weigh price against flexibility, and justify a recommendation to the guest.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Compare and Decide', section:'s6b', icon:'⚖️' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-13',
        unit: 'Unit 13: A Guest\'s Difficult Request',
        short: 'Unit 13',
        href: '/courses/wellness/unit-13/index.html',
        blurb: 'A Guest\'s Difficult Request. Listen to a guest\'s request, weigh three response options against a short package policy on your own, then defend your decision with a partner.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Make the Decision', section:'s6b', icon:'⚖️' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-14',
        unit: 'Unit 14: A Guest Needs Help',
        short: 'Unit 14',
        href: '/courses/wellness/unit-14/index.html',
        blurb: 'A Guest Needs Help. Work in a group, listen to a calm response briefing, then craft three genuinely different messages for the guest, her companion, and the internal incident log.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Three Messages, One Guest', section:'s6b', icon:'🤲' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      },
      {
        unitId: 'unit-15',
        unit: "Unit 15: Designing a Guest's Wellness Day",
        short: 'Unit 15',
        href: '/courses/wellness/unit-15/index.html',
        blurb: 'Designing a Guest\'s Wellness Day. Bring Units 9-14 together: write your own welcome, greeting, problem-recovery, and farewell messages for one VIP guest, then perform the whole day with a partner.',
        locked: false,
        practice: {
          activities: [
            { label:'Key Vocabulary', section:'s2', icon:'🔤' },
            { label:'Vocabulary Activities', section:'s3', icon:'✏️' },
            { label:'Listening', section:'s6', icon:'🎧' },
            { label:'Build the Day', section:'s6b', icon:'🧭' }
          ]
        },
        downloads: { materials: [] },
        assignment: null
      }
    ]
  }
];

/* ===================== SHARED HELPERS ===================== */
function findCatalogUnit(courseId, unitId){
  const course = COURSE_CATALOG.find(c => c.courseId === courseId);
  if(!course) return null;
  const unit = course.units.find(u => u.unitId === unitId);
  return unit ? { course, unit } : null;
}

/* Builds the real deep-link href for one practice activity, supporting both
   the `tab` (tabbed Practice Sets section) and `section` (direct SECTION_META
   key) patterns described in the header comment above. */
function practiceActivityHref(unit, activity){
  const q = activity.section ? `section=${activity.section}` : `section=practice&tab=${activity.tab}`;
  return `${unit.href}?${q}`;
}

/* Root-absolute link into a hub page that auto-expands + scrolls to one
   specific unit, used for cross-linking between Practice / Downloadables /
   Assignments for the same unit. */
function hubUnitLink(kind, courseId, unitId){
  const path = { practice:'/practice/index.html', downloads:'/downloads/index.html', assignments:'/assignments/index.html' }[kind];
  return `${path}?unit=${courseId}:${unitId}`;
}

/* THE single source of truth for whether a unit is locked. Every page that
   shows lock state (course-listing cards, Practice Hub, Downloads Hub) must
   call this instead of reading unit.locked directly, so a scheduled
   unlockAt takes effect everywhere at once. A unit that has passed its
   unlockAt stays unlocked forever afterward — there is no re-lock path,
   by design (see the header comment above unlockAt). */
function isUnitLocked(unit){
  if(!unit.locked) return false;
  if(unit.unlockAt && Date.now() >= new Date(unit.unlockAt).getTime()) return false;
  return true;
}

/* Renders one course-listing pick-card (active <a> or locked <div>),
   matching the exact markup/classes the course pages have always used by
   hand. Call renderCoursePickCards() below rather than this directly. */
function renderPickCard(unit){
  if(!isUnitLocked(unit)){
    return `<a class="pick-card is-active" href="${unit.href}">
      <div class="pick-title">${unit.short}</div>
      <p class="pick-sub">${unit.blurb}</p>
      <span class="pick-status active">● Available now</span>
    </a>`;
  }
  const lockIcon = typeof icon === 'function' ? icon('lock', {size:13, className:'icon-inline'}) : '';
  return `<div class="pick-card is-locked" data-soon-msg="${unit.lockMsg || 'This unit is not open yet.'}">
      <div class="pick-title">${unit.short}</div>
      <p class="pick-sub">${unit.blurb}</p>
      <span class="pick-status locked">${lockIcon} Coming soon</span>
    </div>`;
}

/* Renders every real (catalog) unit of one course into the given container
   element/id, in catalog order. Placeholder "Coming soon" cards for units
   that don't exist yet stay hand-written in each course page — only units
   that actually have content live in COURSE_CATALOG. */
function renderCoursePickCards(courseId, containerIdOrEl){
  const course = COURSE_CATALOG.find(c => c.courseId === courseId);
  const el = typeof containerIdOrEl === 'string' ? document.getElementById(containerIdOrEl) : containerIdOrEl;
  if(!course || !el) return;
  el.innerHTML = course.units.map(renderPickCard).join('\n');
}
