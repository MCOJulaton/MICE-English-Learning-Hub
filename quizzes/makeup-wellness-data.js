/* ===================== WELLNESS TOURISM LONG QUIZ, UNITS 9 TO 12: MAKE-UP (FORM B) =====================
   Used by quizzes/makeup-wellness.html (same page code as the MICE make-up: js/makeup.js).
   A PARALLEL form of Wellness-LongQuiz-Units9-12: same 4 parts, same points (40), same kinds of questions, different questions.
   Open and close it, set the access code and the minutes live in the Teacher Dashboard (Make-up Quiz, Wellness tab). No push needed.
   The lines open / code / minutes below are only the FALLBACK if the live settings cannot be read (closed by default).
   Only HASHES of the correct answers are stored here. The plain key is in the teacher answer key file. */
const MAKEUP_QUIZ_W = {
  id: 'wellness-longquiz-u9-12-makeup-b',
  form: 'WB',
  course: 'English for Wellness Tourism',
  unit: 'Long Quiz: Units 9 to 12 (make-up, Form B)',
  title: 'Long Quiz: Units 9 to 12',
  eyebrow: 'ENGLISH FOR WELLNESS TOURISM · MAKE-UP',
  liveDoc: 'makeupQuizWellness',
  guide: 'guides/Wellness-MakeUp-Quiz-Guide.pdf',
  open: false,
  code: 'WELL-MAKEUP',
  minutes: 60,
  salt: "wlq-b",
  marks: [{ key: 'p3', label: 'Part 3 Promotion (0 to 10)', max: 10 }, { key: 'w1', label: 'Part 4 Situation 1 (0 to 5)', max: 5 }, { key: 'w2', label: 'Part 4 Situation 2 (0 to 5)', max: 5 }],
  scoreRows: [{ k: 'p1', label: 'Part 1 Good Practice', max: 10 }, { k: 'p2', label: 'Part 2 Vocabulary', max: 10 }, { k: 'p3', label: 'Part 3 Promotion', max: 10 }, { k: 'w1', label: 'Part 4 Situation 1', max: 5 }, { k: 'w2', label: 'Part 4 Situation 2', max: 5 }],
  sheetNames: { p1: 'makeup-w-p1-good-practice', p2: 'makeup-w-p2-vocabulary', p3: 'makeup-w-p3-promotion (teacher marks)', p4: 'makeup-w-p4-package-writing (teacher marks)', summary: 'makeup-w-summary' },
  parts: [
  {
    "id": "p1",
    "type": "mc",
    "stack": true,
    "title": "Part 1: Good Practice or Needs Work",
    "points": 10,
    "direction": "Read the situation. Two things a staff member can say are shown. Choose the GOOD PRACTICE answer.",
    "items": [
      {
        "id": "g1",
        "q": "A guest says, “I have back pain.”",
        "options": [
          "“I recommend a gentle stretching class.”",
          "“Try our hardest workout. It will fix everything.”"
        ],
        "h": "5b6b4c59f88677f5c712fbe0"
      },
      {
        "id": "g2",
        "q": "A guest arrives at the concierge desk. He looks lost.",
        "options": [
          "“Hello! How can I help you today?”",
          "“Please wait over there. I am very busy right now.”"
        ],
        "h": "1e369a5ca378e7fba61b2139"
      },
      {
        "id": "g3",
        "q": "A guest has never done yoga before.",
        "options": [
          "“Start with our beginner class. The pace is slow.”",
          "“Join the advanced class. It is the best for everyone.”"
        ],
        "h": "751496dd5a3cbb759e888b04"
      },
      {
        "id": "g4",
        "q": "A guest says, “I am here for three days.”",
        "options": [
          "“What would you like to do or feel on this trip?”",
          "“Everyone does the same three-day program.”"
        ],
        "h": "3e81bed6cad74924648bc3be"
      },
      {
        "id": "g5",
        "q": "A guest wants a program, but she has a bad knee.",
        "options": [
          "“We can adjust the program to protect your knee.”",
          "“The program is the same for everyone. No changes.”"
        ],
        "h": "28ec6d8e1223975cb2053656"
      },
      {
        "id": "g6",
        "q": "The cooking class is fully booked today.",
        "options": [
          "“It is full today. Would you like a spa session, or the same class tomorrow?”",
          "“It is full. There is nothing we can do.”"
        ],
        "h": "25d30fd25a2221e9de76cfda"
      },
      {
        "id": "g7",
        "q": "A guest says, “I have a meeting at 4:00 p.m.”",
        "options": [
          "“No problem. We will finish your day by 3:30 p.m.”",
          "“Your meeting is not our problem. Our day ends at 5:00.”"
        ],
        "h": "cd0d5f7101dfa6b0d5a85287"
      },
      {
        "id": "g8",
        "q": "You finish planning a guest’s day.",
        "options": [
          "“Let me confirm: massage at 10:00 and lunch at 1:00. Is that OK?”",
          "“Good. Goodbye.”"
        ],
        "h": "7962b98821af6073414f013c"
      },
      {
        "id": "g9",
        "q": "A guest says, “I do not like cold water.”",
        "options": [
          "“OK, we can skip the cold plunge. How about the warm sauna?”",
          "“The cold plunge is the best part. You must try it.”"
        ],
        "h": "9f151021e667429512c27819"
      },
      {
        "id": "g10",
        "q": "The sunset boat leaves at 5:30 p.m. It cannot wait.",
        "options": [
          "“The boat leaves at 5:30 p.m. We will plan your afternoon before that.”",
          "“Let us make the boat wait until 8:00.”"
        ],
        "h": "5e92933ed7ca645fd987a194"
      }
    ]
  },
  {
    "id": "p2",
    "type": "mc",
    "title": "Part 2: Vocabulary",
    "points": 10,
    "direction": "Read the meaning. Choose the correct word.",
    "items": [
      {
        "id": "v1",
        "q": "The best or most special part of something.",
        "options": [
          "Highlight",
          "Overview",
          "Pace",
          "Wellbeing"
        ],
        "h": "497c68a678e7d16637be34d9"
      },
      {
        "id": "v2",
        "q": "How fast or slow an activity moves.",
        "options": [
          "Pace",
          "Intensity",
          "Duration",
          "Highlight"
        ],
        "h": "7e5d95d66482b95fdbd08d43"
      },
      {
        "id": "v3",
        "q": "To suggest something as a good choice.",
        "options": [
          "Recommend",
          "Confirm",
          "Depart",
          "Adjust"
        ],
        "h": "bf738730e727d9a2f1b597a3"
      },
      {
        "id": "v4",
        "q": "A general feeling of being healthy, comfortable, and happy.",
        "options": [
          "Wellbeing",
          "Availability",
          "Constraint",
          "Highlight"
        ],
        "h": "122fa6e474e71337cc9aee7f"
      },
      {
        "id": "v5",
        "q": "To relax and let go of stress after a busy time.",
        "options": [
          "Unwind",
          "Depart",
          "Adjust",
          "Recommend"
        ],
        "h": "f6b8b07ac1099645bf54e222"
      },
      {
        "id": "v6",
        "q": "Whether there is free time or space open.",
        "options": [
          "Availability",
          "Duration",
          "Preference",
          "Pace"
        ],
        "h": "988a098e3fc2ee0e9065f605"
      },
      {
        "id": "v7",
        "q": "Part of a schedule that cannot move.",
        "options": [
          "Fixed",
          "Flexible",
          "Open",
          "Adjust"
        ],
        "h": "319a0373d945c96cc2ba2975"
      },
      {
        "id": "v8",
        "q": "To leave, especially at a set time.",
        "options": [
          "Depart",
          "Confirm",
          "Unwind",
          "Recommend"
        ],
        "h": "b114eb4a1869fdabe14456e5"
      },
      {
        "id": "v9",
        "q": "How long an activity lasts.",
        "options": [
          "Duration",
          "Pace",
          "Availability",
          "Intensity"
        ],
        "h": "c9030551d6625cbdf6d36dd0"
      },
      {
        "id": "v10",
        "q": "To change something a little to fit new information.",
        "options": [
          "Adjust",
          "Confirm",
          "Prioritize",
          "Depart"
        ],
        "h": "ca95b3d6003902a12f597167"
      }
    ]
  },
  {
    "id": "p3",
    "type": "writing",
    "title": "Part 3: Wellness Tourism Promotion",
    "points": 10,
    "hint": "4 to 6 sentences",
    "direction": "Write a short promotion with 4 to 6 sentences. Use the facts in the box. (10 points)",
    "items": [
      {
        "id": "pr1",
        "text": "Look at the information in the box. Write a short promotion. Use the facts. Make guests want to buy it. Example start: “Come and enjoy a calm evening at the Moon Garden Spa!”",
        "tableHead": null,
        "table": [
          [
            "Product",
            "Moonlight Meditation Evening"
          ],
          [
            "Place",
            "Rawai Beach, Phuket"
          ],
          [
            "Good for",
            "Busy workers who cannot sleep well"
          ],
          [
            "Includes",
            "Evening meditation class, 45-minute aromatherapy massage, herbal tea"
          ],
          [
            "Benefits",
            "Better sleep, a calm mind"
          ],
          [
            "Time",
            "3 hours (6:00 p.m. to 9:00 p.m.)"
          ],
          [
            "Price",
            "1,800 baht per person"
          ]
        ]
      }
    ]
  },
  {
    "id": "p4",
    "type": "writing",
    "title": "Part 4: Choosing the Right Package",
    "points": 10,
    "hint": "4 to 6 sentences",
    "direction": "Read each situation. Choose one package. Write 4 to 6 sentences. Say why. You can use these words: budget, flexible, advantage, disadvantage, value for money, suitable. Tip: 1. Choose a package. 2. Say why. 3. Give one advantage. 4. Give one disadvantage. (5 points each)",
    "items": [
      {
        "id": "s1",
        "text": "Situation 1. Mai is a teacher. She is very tired after a long school term. Her school schedule can change at the last minute. Her budget is 4,000 baht. Which package is better for Mai?",
        "tableHead": [
          "",
          "Package A: Calm Garden Retreat",
          "Package B: Flexible Wellness Break"
        ],
        "table": [
          [
            "Price",
            "2,800 baht",
            "3,800 baht"
          ],
          [
            "Schedule",
            "Fixed. No changes.",
            "Flexible. You can change the times."
          ],
          [
            "Reviews",
            "4.1 stars",
            "4.7 stars"
          ]
        ]
      },
      {
        "id": "s2",
        "text": "Situation 2. Mr. Chen has one free afternoon on vacation. It is his first wellness trip. He wants to relax. His budget is 2,000 baht. He does not need to change his schedule. Which package is better for Mr. Chen?",
        "tableHead": [
          "",
          "Package C: Afternoon Spa",
          "Package D: Two-Day Wellness Escape"
        ],
        "table": [
          [
            "Price",
            "2,000 baht",
            "5,500 baht"
          ],
          [
            "Time",
            "Half a day",
            "Two days"
          ],
          [
            "Includes",
            "Massage and herbal tea",
            "Yoga, massage, and all meals"
          ],
          [
            "Schedule",
            "Fixed",
            "Flexible"
          ]
        ]
      }
    ]
  }
]
};
