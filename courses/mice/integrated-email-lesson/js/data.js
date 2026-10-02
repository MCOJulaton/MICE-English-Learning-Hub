/* ===================== INTEGRATED MICE COMMUNICATION LESSON =====================
   "Professional MICE Emails: Responding to a Problem"

   This is an INTEGRATED lesson, not a new official TQF weekly unit. It reviews
   and reuses content from TQF Weeks 11-15 (Apologising & Saying No, Handling
   Complaints, Working Across Cultures, Professional Email & Business Writing,
   Catering & Wellness Services) inside one Professional Email & Business
   Writing lesson (Week 14, CLO 5). See TEACHER_GUIDE below for the full
   TQF/OBE alignment.

   This page is the TEACHING and PRACTICE side of the lesson only (SEE,
   UNDERSTAND, PRACTICE). The graded OUTPUT (planning boxes + the final
   email + the submitted checklist) is a separate printed worksheet,
   matching this course's existing hand-written-output pattern -- the
   final task section here previews the 4 scenarios and points students
   to that worksheet, it does not collect the graded email itself.

   Nothing here is UI logic, see app.js for rendering/state/progress. */

const SECTION_META = [
  {key:'cover', label:'Cover'},
  {key:'s1', label:'Warm-Up'},
  {key:'s2', label:'Types of Emails'},
  {key:'s3', label:'Email Structure'},
  {key:'s4', label:'Language Bank'},
  {key:'s5', label:'Guided Practice'},
  {key:'s6', label:'Final Writing Task'},
  {key:'s7', label:'Self-Check'},
  {key:'complete', label:'Complete'}
];

/* ===== Section 1: Warm-Up ===== */
const WARMUP_SITUATION = 'An international conference is being held in Phuket. The client tells the event team that several international delegates have dietary requirements, but the original catering plan cannot cover all of them.';
const WARMUP_QUESTIONS = [
  'What happened?',
  'What is the problem?',
  'Who needs help?',
  'What should the event team do?'
];

/* ===== Section 2: Types of Professional MICE Emails =====
   Same 4 model emails used on the printed output worksheet (Example D
   there matches the Apology/Problem Response email here), so students
   see the exact same models in both places. Each item is a matching
   activity: students choose the purpose before it is revealed. */
const EMAIL_TYPES = [
  {
    id: 'inquiry', purpose: 'Inquiry',
    subject: 'Question about Conference Program',
    lines: [
      'Dear Ms. Carter,',
      'I hope this email finds you well. I am writing to inquire about the conference program for next week. Could you please confirm the start time for the opening session?',
      'Thank you for your help.'
    ],
    signoff: ['Best regards,', 'Siriporn (MICE Event Coordinator)']
  },
  {
    id: 'request', purpose: 'Request',
    subject: 'Request for Extra Microphones',
    lines: [
      'Dear Khun Anan,',
      'I am writing to request two extra wireless microphones for the panel discussion on Friday. We currently have only two, but there will be four speakers.',
      'Please let me know if this is possible.'
    ],
    signoff: ['Kind regards,', 'Nattapong']
  },
  {
    id: 'confirmation', purpose: 'Confirmation',
    subject: 'Confirmation of Room Booking',
    lines: [
      'Dear Mr. Lee,',
      'Thank you for your booking request. This email is to confirm that Meeting Room B is reserved for your group from 9:00 AM to 12:00 PM on Monday.',
      'Please let us know if you need anything else.'
    ],
    signoff: ['Best regards,', 'Ploy (Event Coordinator)']
  },
  {
    id: 'apology', purpose: 'Apology / Problem Response',
    subject: 'Regarding Your Catering Request',
    lines: [
      'Dear Khun Somchai,',
      'Thank you for informing us about the dietary requirements for your delegates. I completely understand how important this is.',
      'Unfortunately, our original menu cannot accommodate every request. However, we can offer a separate vegetarian and halal menu option for the affected guests.',
      'Could you please confirm if this solution works for you by tomorrow?',
      'Thank you for your understanding.'
    ],
    signoff: ['Best regards,', 'Aim (Catering Coordinator)']
  }
];
const EMAIL_PURPOSE_OPTIONS = ['Inquiry', 'Request', 'Confirmation', 'Apology / Problem Response'];

/* ===== Section 3: Email Structure =====
   Maps directly onto the official Week 14 template (Subject line ->
   Greeting -> Opening sentence/purpose -> Body/details -> Closing/next
   step -> Sign-off). "Problem or Details" and "Solution or Action" here
   are the Body step split into two labeled sentences for A1-A2 clarity. */
const STRUCTURE_PARTS = [
  {part: 'Subject', does: 'Tells the reader what the email is about, in a few words.'},
  {part: 'Greeting', does: '"Dear [Name]," — always polite and professional.'},
  {part: 'Purpose', does: 'One sentence that says why you are writing.'},
  {part: 'Problem or Details', does: 'Explain the situation simply. What happened?'},
  {part: 'Solution or Action', does: 'What you (or your team) will do about it.'},
  {part: 'Next Step', does: 'What you need from the reader, or what happens next.'},
  {part: 'Closing', does: 'A polite final sentence, e.g. "Thank you for your understanding."'},
  {part: 'Sign-off', does: '"Best regards," / "Kind regards," + your name and role.'}
];

/* ===== Section 4: Language Bank =====
   Phrases sourced directly from TQF Weeks 11, 12, 14, and 15 so students
   reuse language they already know, not new vocabulary. */
const LANGUAGE_BANK = [
  {cat: 'Opening an email', phrases: ['I am writing to...', 'I hope this email finds you well.', 'Thank you for your email about...']},
  {cat: 'Explaining a problem', phrases: ['Unfortunately, ...', 'I am writing to inform you that...', 'There has been a small problem with...']},
  {cat: 'Apologizing / acknowledging', phrases: ['I completely understand your concern.', 'I am very sorry for any inconvenience.', 'I understand this is important to you.']},
  {cat: 'Offering a solution', phrases: ["I'm afraid that won't be possible, but what I can offer is...", 'As an alternative, we can...', 'Allow me to check what alternatives are available.']},
  {cat: 'Making a suggestion', phrases: ['We recommend...', 'It might be best to...']},
  {cat: 'Asking for confirmation', phrases: ['Could you please confirm...', 'Please let us know if this works for you.', 'I would be grateful if you could confirm...']},
  {cat: 'Closing an email', phrases: ['Please let me know if you have any questions.', 'I look forward to hearing from you.', 'Thank you for your understanding.']},
  {cat: 'Sign-off', phrases: ['Best regards,', 'Kind regards,', '[Your name], [Your role]']}
];

/* ===== Section 5: Guided Practice =====
   Teacher-led scenario, different from the 4 final-task scenarios so
   nothing is spoiled. Planning questions are shown blank on screen --
   the class builds the answers together out loud, on the board, not
   typed here. This is a live demonstration, not a self-check task. */
const GUIDED_SCENARIO = "A client's AV technician cancels at the last minute, the day before a conference session.";
const PLANNING_QUESTIONS = [
  'Who am I writing to?',
  'What is the problem?',
  'What does the client need?',
  'What solution can I offer?',
  'What should I ask the client to do next?'
];
/* Teacher-only answer key, not rendered on screen -- see teacher.html / TEACHER_GUIDE. */
const GUIDED_MODEL_EMAIL = {
  subject: 'Update on Tomorrow’s AV Support',
  lines: [
    'Dear Khun Preecha,',
    'I am writing to inform you that our AV technician is no longer available for tomorrow’s session.',
    'I am very sorry for the short notice. However, I have arranged for a backup technician to arrive 30 minutes before your session starts.',
    'Could you please confirm that 8:30 AM works for a quick equipment check?'
  ],
  signoff: ['Best regards,', 'Event Team']
};

/* ===== Section 6: Final Writing Task (preview only) =====
   The graded email is written on the printed worksheet, by hand, like
   the rest of this course's final written outputs -- not typed here.
   This section previews the 4 equally-manageable scenarios. */
const FINAL_SCENARIOS = [
  {n: 1, title: 'Catering / Dietary Requirement Problem', situation: 'An international client tells you that several delegates have dietary requirements (vegetarian, halal, allergies) that your original catering plan does not fully cover.'},
  {n: 2, title: 'Conference Schedule Change', situation: 'A session room or time must change one day before the conference, and several delegates need to be informed.'},
  {n: 3, title: 'Venue / Equipment Problem', situation: 'The projector in the main conference room is not working properly, and a client’s presentation starts in one hour.'},
  {n: 4, title: 'A Client Request You Cannot Fully Meet', situation: 'A client asks for 20 extra seats at a gala dinner, but the venue can only add 10 more.'}
];

/* ===== Section 7: Self-Check (practice copy) =====
   Same 8 items as the printed worksheet's checklist. Practicing here is
   formative -- the real, graded check happens on the paper worksheet
   before submission. */
const CHECKLIST_ITEMS = [
  'I wrote a clear subject.',
  'I used a professional greeting.',
  'I explained the situation clearly.',
  'I used polite language.',
  'I offered a solution or alternative.',
  'I included the next step.',
  'I used a professional closing.',
  'I checked my spelling and grammar.'
];

/* ===================== TEACHER GUIDE (courses/mice/integrated-email-lesson/teacher.html) ===================== */
const TEACHER_GUIDE = {
  unit: 'Integrated MICE Communication Lesson: Professional MICE Emails',
  learningOutcome: 'Students identify the purpose of different professional MICE emails, learn a reusable 8-part structure, and write one complete professional email responding to a realistic MICE workplace problem, reusing apology/refusal/solution language already practiced in Weeks 11-12.',
  bloomsLevel: 'Apply / Create (CLO 5 primary; reuses CLO 2 / CLO 4 language; CLO 6 via peer-check)',
  addieFocus: 'Integrated, not a new topic: students SEE four real email types, UNDERSTAND one reusable structure, reuse the LANGUAGE BANK from Weeks 11-12-14-15, PRACTICE a guided example as a class, then PLAN and WRITE their own email by hand on the printed worksheet, CHECK it against a checklist, and SUBMIT it for marking.',
  grouping: 'Individual throughout. Peer-check in Part 7 is the only paired step (CLO 6).',
  notTQFUnit: 'This is an Integrated MICE Communication Lesson, not the official title of a new TQF weekly unit. It can be used to deliver the official Week 14 session (Professional Email & Business Writing) -- its output (one individual, checklist-assessed professional email) is exactly the Direct Assessment instrument the TQF specifies for CLO 5 in Week 14.',
  weeksIntegrated: [
    {week: 'Week 11', topic: 'Apologising & Saying No Professionally', role: 'Source of the apology/refusal/solution language reused in Parts 4-6.'},
    {week: 'Week 12', topic: 'Handling Complaints at MICE Events', role: 'Source of the 4-step problem-response framework underlying the Solution/Action step.'},
    {week: 'Week 13', topic: 'Working Across Cultures', role: 'Source of the cross-cultural/dietary awareness angle in the catering scenario.'},
    {week: 'Week 14', topic: 'Professional Email & Business Writing', role: 'The home week. This lesson can deliver Week 14’s official session and its checklist-assessed email task.'},
    {week: 'Week 15', topic: 'Catering & Wellness Services at Events', role: 'Source of the catering/dietary scenario and menu-related vocabulary context.'}
  ],
  clos: [
    {clo: 'CLO 2', text: 'Professional communication with international clients, guests, delegates, and colleagues -- students write a professional response to an international client about a real MICE service problem.'},
    {clo: 'CLO 4', text: 'Handling complaints, professional refusals, unexpected situations -- students reuse, not relearn, the Week 11-12 language inside a new written context.'},
    {clo: 'CLO 5', text: 'Short professional written communication -- the primary CLO. One complete, structured professional email, matching the official Week 14 instrument.'},
    {clo: 'CLO 6', text: 'Respectful, productive collaboration -- the structured peer-check step in Part 7.'}
  ],
  timing: [
    {block: 'Part 1 -- Warm-Up: MICE Situation', time: '10 min', ref: 'Section 1', part: 'SEE'},
    {block: 'Part 2 -- Types of Professional MICE Emails', time: '15 min', ref: 'Section 2', part: 'SEE'},
    {block: 'Part 3 -- Email Structure', time: '10 min', ref: 'Section 3', part: 'UNDERSTAND'},
    {block: 'Part 4 -- Language Bank', time: '10 min', ref: 'Section 4', part: 'UNDERSTAND'},
    {block: 'Part 5 -- Guided Practice (Plan + Build Together)', time: '20 min', ref: 'Section 5', part: 'PRACTICE / PLAN'},
    {block: 'Part 6 -- Final Individual Writing Task (on the printed worksheet)', time: '40 min', ref: 'Section 6', part: 'WRITE'},
    {block: 'Part 7 -- Self-Check and Peer-Check', time: '10 min', ref: 'Section 7', part: 'CHECK'},
    {block: 'Part 8 -- Submission', time: '5 min', ref: '', part: 'SUBMIT'}
  ],
  materials: [
    'The printed Professional MICE Email output worksheet (one per student) -- scenario choice, planning boxes, final email, checklist',
    'This website page, projected, for Parts 1-5 and 7',
    'Board or flip chart for the Part 5 guided example'
  ],
  commonProblems: [
    {problem: 'Student writes one long paragraph with no structure.', fix: 'Remind them each labeled part of the email can be just one short sentence. Point to the Structure section.'},
    {problem: 'Weaker students freeze when choosing a scenario.', fix: 'Pre-teach 2-3 sentence starters for each scenario before Part 6 begins, using the Language Bank.'},
    {problem: 'Class is running short on time.', fix: 'Part 2 (identifying email types) can be assigned as homework before class, freeing 10-15 minutes for Part 6.'},
    {problem: 'A student finishes early.', fix: 'They read and peer-check a second classmate’s email, or add one more sentence of detail to their own.'}
  ],
  assessment: 'The final email (on the printed worksheet) is the graded output, marked with the Professional Email Rubric -- a plain-language adaptation of the official TQF.3 Professional Email Writing Rubric (Section D.3, Week 14): Email Structure & Task Completion, Clarity of Situation & Solution, Professional & Polite Language, Grammar & Vocabulary, 25 points each, 100 total. See the printed worksheet / teacher lesson plan for the full rubric.'
};

const COURSE_META = {
  course: 'English for MICE',
  courseCode: 'mice',
  unit: 'Integrated Lesson: Professional MICE Emails (Weeks 11-15)',
  unitCode: 'integrated-email-lesson'
};
