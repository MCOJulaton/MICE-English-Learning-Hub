/* ===================== TEACHER DASHBOARD — data layer =====================
   Course configuration (assessment categories/weights, CLOs, grade scale) and
   the TeacherBackend abstraction, following the exact pattern already proven
   by the Quiz Hub's QuizBackend (js/quiz-engine.js): a real FirebaseBackend
   (Auth + Firestore) used once teacher-firebase-config.js has real values,
   with automatic fallback to a LocalBackend (this browser only, via
   localStorage) so every screen can be built and tested before that project
   exists. Both backends expose the identical async API — teacher-app.js never
   needs to know which one is active.

   Phase 1: sign-in, dashboard shell, course -> group -> student navigation,
   basic student profile (identity, nickname, teacher notes).
   Phase 2 (this update): Assessment Management (course.assessments, editable),
   score entry per student with an explicit Not Yet Graded / Graded / Excused
   status (a blank score is never silently treated as zero), automatic grade
   calculation from that data (never a manually duplicated total), attendance
   (per-date records + a bulk "take attendance for the whole group" flow),
   and the auto-computed Student Summary Tracker + dashboard "Needs
   Attention" list. Rubrics, CLO attainment, presentations, and evidence
   uploads are still Phase 3+. */

/* ===================== COURSE CONFIG — from the real TQF3 course specs ===================== */
const TEACHER_GRADE_SCALE = [
  { grade:'A',  meaning:'Excellent',   min:80,  max:100 },
  { grade:'B+', meaning:'Very Good',   min:75,  max:79.99 },
  { grade:'B',  meaning:'Good',        min:70,  max:74.99 },
  { grade:'C+', meaning:'Fairly Good', min:65,  max:69.99 },
  { grade:'C',  meaning:'Fair',        min:60,  max:64.99 },
  { grade:'D+', meaning:'Poor',        min:55,  max:59.99 },
  { grade:'D',  meaning:'Very Poor',   min:50,  max:54.99 },
  { grade:'E/F',meaning:'Fail',        min:0,   max:49.99 }
];

const TEACHER_COURSE_CONFIG = {
  mice: {
    courseId:'mice', courseName:'English for MICE Industries', courseCode:'6335417',
    clos: [
      { id:'CLO1', text:'Demonstrate knowledge of English vocabulary and professional expressions related to the MICE industry, including meetings, incentive events, conferences, and exhibitions.' },
      { id:'CLO2', text:'Communicate professionally in English with international clients, guests, delegates, and colleagues in real MICE industry workplace situations, including greetings, service interactions, scheduling, and reservations.' },
      { id:'CLO3', text:'Comprehend and respond accurately to spoken English in MICE contexts, including phone calls, event announcements, delegate enquiries, and professional hospitality interactions.' },
      { id:'CLO4', text:'Handle complaints, professional refusals, emergency communications, and unexpected workplace situations using appropriate and professional English communication strategies.' },
      { id:'CLO5', text:'Produce short professional written communication and deliver a structured MICE product or event presentation in English with professional clarity, appropriate register, and audience awareness.' },
      { id:'CLO6', text:'Collaborate respectfully, equitably, and productively with peers in pair and group communication tasks throughout the semester.' }
    ],
    cloAttainmentBenchmark: { studentPct:70, scorePct:70, speakingMinRubric:3.0 },
    categories: [
      { id:'attendance', label:'Attendance & Active Participation', weight:10, weeks:'1-17', clos:['CLO6'] },
      { id:'vocabListening', label:'Vocabulary & Listening Quizzes', weight:15, weeks:'2, 6, 10', clos:['CLO1','CLO3'] },
      { id:'speakingRoleplay', label:'Speaking Tasks & Classroom Role Plays', weight:25, weeks:'4, 7, 8, 11, 12', clos:['CLO2','CLO4'] },
      { id:'writing', label:'Professional Writing Tasks', weight:10, weeks:'—', clos:['CLO5'] },
      { id:'midterm', label:'Midterm Examination', weight:20, weeks:'9', clos:['CLO2','CLO3'] },
      { id:'capstone', label:'Capstone MICE Event Presentation', weight:10, weeks:'16', clos:['CLO5'] },
      { id:'final', label:'Final Examination', weight:10, weeks:'17', clos:['CLO2','CLO3','CLO5'] }
    ],
    rubrics: ['mice-speaking', 'mice-presentation'],
    finalWeightPct: 100
  },
  wellness: {
    courseId:'wellness', courseName:'English for Wellness Tourism', courseCode:'6335219',
    clos: [
      { id:'CLO1', text:'Demonstrate knowledge of English vocabulary and expressions related to health and wellness tourism services, facilities, and therapeutic practices.' },
      { id:'CLO2', text:'Communicate professionally in English with international guests, clients, and colleagues in real wellness tourism workplace situations.' },
      { id:'CLO3', text:'Comprehend and respond accurately to spoken English in wellness tourism and hospitality contexts, including reservations, consultations, and guided activities.' },
      { id:'CLO4', text:'Explain wellness services, spa treatments, therapies, nutrition programmes, and wellness activities to guests using clear and appropriate English.' },
      { id:'CLO5', text:'Handle guest complaints, difficult situations, and wellness emergencies professionally and calmly using appropriate English communication strategies.' },
      { id:'CLO6', text:'Plan and deliver a structured wellness tourism presentation in English with professional clarity, appropriate register, and audience awareness.' },
      { id:'CLO7', text:'Collaborate respectfully and productively with peers in pair and group communication tasks throughout the semester.' }
    ],
    cloAttainmentBenchmark: { studentPct:70, scorePct:70, speakingMinRubric:3.0 },
    categories: [
      { id:'attendance', label:'Attendance & Active Participation', weight:10, weeks:'—', clos:['CLO7'] },
      { id:'vocabListening', label:'Vocabulary & Listening Quizzes', weight:15, weeks:'2, 7', clos:['CLO1','CLO3'] },
      { id:'speakingRoleplay', label:'Speaking Tasks & Role Plays', weight:25, weeks:'4, 5, 6, 10, 11, 14', clos:['CLO2','CLO4'] },
      { id:'classActivities', label:'Classroom Activities & Assignments', weight:10, weeks:'—', clos:['CLO5'] },
      { id:'midterm', label:'Midterm Examination', weight:20, weeks:'—', clos:['CLO2','CLO3'] },
      { id:'presentation', label:'Final Wellness Tourism Group Presentation', weight:10, weeks:'16', clos:['CLO6'] },
      { id:'final', label:'Final Examination', weight:10, weeks:'—', clos:['CLO2','CLO3','CLO6'] }
    ],
    rubrics: ['wellness-speaking', 'wellness-presentation'],
    finalWeightPct: 100
  },
  efc: {
    courseId:'efc', courseName:'English for Communication', courseCode:'9901004 / 9901104',
    clos: [
      { id:'CLO1', text:"Comprehend spoken English in everyday and academic situations, including listening for main ideas, details, and speakers' opinions in a variety of contexts." },
      { id:'CLO2', text:'Communicate orally in English using appropriate vocabulary, grammar, and pronunciation in everyday and semi-formal situations.' },
      { id:'CLO3', text:"Read and interpret short English texts on everyday topics, identifying main ideas, supporting details, and the writer's purpose." },
      { id:'CLO4', text:'Write grammatically accurate English sentences and paragraphs for everyday communicative purposes, including descriptions, opinions, and short responses.' },
      { id:'CLO5', text:'Participate actively and collaboratively in English language activities including group discussions, partner interviews, and class presentations.' }
    ],
    cloAttainmentBenchmark: { studentPct:70, scorePct:70, speakingMinRubric:3.0 },
    categories: [
      { id:'attendance', label:'Attendance & Active Participation', weight:10, weeks:'—', clos:['CLO5'] },
      { id:'slTest1', label:'Speaking & Listening Test #1 (Information Gap Task)', weight:10, weeks:'8', clos:['CLO1','CLO2'] },
      { id:'midterm', label:'Midterm Examination', weight:20, weeks:'9', clos:['CLO1','CLO3','CLO4'] },
      { id:'slTest2', label:'Speaking & Listening Test #2 (Group Discussion/Decision-Making)', weight:15, weeks:'14', clos:['CLO1','CLO2','CLO5'] },
      { id:'presentation', label:'Group Presentation with Q&A', weight:15, weeks:'15', clos:['CLO2','CLO5'] },
      { id:'final', label:'Final Examination', weight:30, weeks:'16', clos:['CLO1','CLO2','CLO3','CLO4'] }
    ],
    rubrics: ['efc-speaking-listening'],
    // This course is only ONE part of a student's total final grade — a Thai
    // co-teacher grades the other 70% under a separate scheme this dashboard
    // never sees. finalWeightPct is how much of the 100-point scale above
    // this course actually contributes once combined with that other grade.
    finalWeightPct: 30
  }
};

/* ===================== RUBRIC TEMPLATES ===================== */
const MICE_SPEAKING_RUBRIC = {
  id:'mice-speaking', title:'MICE Speaking Rubric', maxScore:100,
  criteria: [
    { id:'fluency', label:'Fluency', max:20, levels:[
      { level:4, label:'Excellent', desc:'Smooth, confident, natural pace. No disruptive pauses. Communication flows naturally.' },
      { level:3, label:'Good', desc:'Minor hesitation, mostly clear. Pauses do not impede communication.' },
      { level:2, label:'Satisfactory', desc:'Frequent pauses. Communication occasionally breaks down.' },
      { level:1, label:'Developing', desc:'Very limited output. Long silences. Cannot sustain interaction.' }
    ]},
    { id:'pronunciation', label:'Pronunciation & Intelligibility', max:20, levels:[
      { level:4, label:'Excellent', desc:'Clear, intelligible, professional. Easily understood by international MICE clients.' },
      { level:3, label:'Good', desc:'Mostly understandable. Minor pronunciation errors.' },
      { level:2, label:'Satisfactory', desc:'Some difficulty. Occasional clarification/repetition needed.' },
      { level:1, label:'Developing', desc:'Difficult to understand. Frequent mispronunciation impedes communication.' }
    ]},
    { id:'vocabulary', label:'Vocabulary & Register', max:20, levels:[
      { level:4, label:'Excellent', desc:'Accurate MICE vocabulary. Appropriate professional register.' },
      { level:3, label:'Good', desc:'Adequate vocabulary, minor gaps. Mostly professional register.' },
      { level:2, label:'Satisfactory', desc:'Limited MICE vocabulary. Some word-choice errors. Occasionally casual.' },
      { level:1, label:'Developing', desc:'Very limited vocabulary. Frequent errors. Inappropriate register.' }
    ]},
    { id:'interaction', label:'Interaction & Responsiveness', max:20, levels:[
      { level:4, label:'Excellent', desc:'Responds naturally and promptly. Listens attentively. Sustains professional exchange.' },
      { level:3, label:'Good', desc:'Good back-and-forth. Mostly responsive.' },
      { level:2, label:'Satisfactory', desc:'Difficulty maintaining exchange. Misses some cues.' },
      { level:1, label:'Developing', desc:'Cannot sustain interaction. Fails to respond appropriately. Does not demonstrate active listening.' }
    ]},
    { id:'conduct', label:'Professional Conduct', max:20, levels:[
      { level:4, label:'Excellent', desc:'Polite, courteous, professional. Formal register. Genuine client focus.' },
      { level:3, label:'Good', desc:'Mostly professional. Minor lapses.' },
      { level:2, label:'Satisfactory', desc:'Some casual/unclear language. Not consistently professional.' },
      { level:1, label:'Developing', desc:'Unprofessional register. Inappropriate language. Does not demonstrate professional demeanour.' }
    ]}
  ],
  usedFor: ['Speaking Task 1','Speaking Task 2','Speaking Task 3','Speaking Task 4','Speaking Task 5','Midterm Speaking','Final Speaking']
};

const WELLNESS_SPEAKING_RUBRIC = Object.assign({}, MICE_SPEAKING_RUBRIC, {
  id:'wellness-speaking', title:'Wellness Tourism Speaking Rubric',
  usedFor: ['Graded role plays','Midterm speaking component','Final examination speaking component']
});

const MICE_PRESENTATION_RUBRIC = {
  id:'mice-presentation', title:'MICE Capstone Presentation Rubric', maxScore:100,
  type:'group', durationNote:'3-5 minutes, includes Q&A, Week 16, 10% of final grade',
  fields: ['group','topic','groupScore','individualAdjustments','qaPerformance','teacherFeedback','peerFeedback']
};

const WELLNESS_PRESENTATION_RUBRIC = {
  id:'wellness-presentation', title:'Final Wellness Tourism Presentation Rubric', maxScore:100,
  type:'group', durationNote:'3-5 minutes, includes Q&A, Week 16, 10% of final grade',
  sampleTopics: ['Wellness resort package','Wellness tourism route in Phuket','Spa/retreat programme','Thai therapeutic treatment'],
  fields: ['group','topic','groupScore','individualAdjustments','qaPerformance','teacherFeedback','peerFeedback']
};

const EFC_SPEAKING_LISTENING_RUBRIC = {
  id:'efc-speaking-listening', title:'English for Communication Speaking & Listening Rubric', maxScore:100,
  criteria: [
    { id:'pronunciation', label:'Pronunciation & Clarity', max:20 },
    { id:'vocabGrammar', label:'Vocabulary & Grammar', max:20 },
    { id:'fluency', label:'Fluency & Flow', max:20 },
    { id:'content', label:'Content & Response', max:20 },
    { id:'interaction', label:'Interaction / Listening Response', max:20 }
  ],
  levelScale: [
    { level:4, label:'Excellent' }, { level:3, label:'Good' },
    { level:2, label:'Satisfactory' }, { level:1, label:'Developing' }
  ],
  usedFor: ['Speaking & Listening Test #1', 'Speaking & Listening Test #2']
};

const TEACHER_RUBRICS = {
  'mice-speaking': MICE_SPEAKING_RUBRIC,
  'mice-presentation': MICE_PRESENTATION_RUBRIC,
  'wellness-speaking': WELLNESS_SPEAKING_RUBRIC,
  'wellness-presentation': WELLNESS_PRESENTATION_RUBRIC,
  'efc-speaking-listening': EFC_SPEAKING_LISTENING_RUBRIC
};

function gradeForScore(pct, scale){
  const bands = scale && scale.length ? scale : TEACHER_GRADE_SCALE;
  // Match by min only (bands are stored highest-first): a computed pct can
  // land in the tiny gap between one band's stated max (e.g. 79.99) and the
  // next band's min (80), and falling through there must never default to
  // the last band (Fail) — it should land in the band above the gap.
  const sorted = bands.slice().sort((a, b) => b.min - a.min);
  return sorted.find(g => pct >= g.min) || bands[bands.length - 1];
}

/* ===================== GRADE / ATTENDANCE CALCULATION =====================
   Pure functions, no I/O — safe to call from any renderer. Scores are keyed
   by status so a blank/never-entered score is NEVER treated as zero: only
   status:'graded' contributes to the current grade; status:'excused' removes
   that assessment's weight from the denominator entirely (no penalty);
   status:'not-graded' (or no entry at all) simply hasn't happened yet and
   counts toward "remaining", never toward the current percentage. */
function courseAssessmentWeightTotal(course){
  return (course.assessments || []).reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
}

// GRADE-BEARING LAYER (Category Grading architecture): the course grade is
// computed from ONE overall score per assessment CATEGORY
// (student.categoryScores[categoryId]), never from the individual activity
// instances in course.assessments — those remain learning evidence only
// (see computeCategoryScoreSummary below, and Assessment History /
// Speaking Development / CLO Attainment, which still read student.scores
// directly and are untouched by this). A category with no categoryScores
// entry yet is excluded from earnedPoints/gradedWeight entirely (counted
// under remainingWeight) — it is NEVER treated as a zero. Track granularly,
// assess holistically.
function computeStudentGrade(course, student){
  const catScores = student.categoryScores || {};
  let gradedWeight = 0, excusedWeight = 0, earnedPoints = 0;
  (course.categories || []).forEach(cat => {
    const w = Number(cat.weight) || 0;
    const entry = catScores[cat.id];
    if(!entry || entry.status === 'not-graded') return;
    if(entry.status === 'excused'){ excusedWeight += w; return; }
    if(entry.status === 'graded' && typeof entry.score === 'number'){
      gradedWeight += w;
      const maxScore = Number(entry.maxScore) || 100;
      const pct = maxScore > 0 ? Math.max(0, Math.min(entry.score, maxScore)) / maxScore : 0;
      earnedPoints += pct * w;
    }
  });
  const applicableWeight = Math.max(0, 100 - excusedWeight);
  const remainingWeight = Math.max(0, applicableWeight - gradedWeight);
  const currentPct = gradedWeight > 0 ? (earnedPoints / gradedWeight) * 100 : null;
  const complete = gradedWeight > 0 && remainingWeight <= 0.01;
  return {
    gradedWeight, excusedWeight, remainingWeight, applicableWeight, currentPct,
    letter: currentPct !== null ? gradeForScore(currentPct, course.gradeScale) : null,
    status: gradedWeight === 0 ? 'not-started' : (complete ? 'complete' : 'in-progress')
  };
}

// Per-category summary used by the Group/Class category table, Student
// Profile Assessment Summary, and Course Report — bundles the grade-bearing
// overall score together with a count of the underlying evidence (graded
// individual activities under this category), so the UI can show "6
// activities completed" alongside the overall score without every caller
// re-deriving that count. Never writes anything; read-only.
function computeCategoryScoreSummary(course, student, categoryId){
  const entry = (student.categoryScores || {})[categoryId];
  const linkedAssessments = (course.assessments || []).filter(a => a.categoryId === categoryId);
  const scores = student.scores || {};
  const evidenceCount = linkedAssessments.filter(a => {
    const e = scores[a.id];
    return e && e.status === 'graded' && typeof e.score === 'number';
  }).length;
  const gradedPcts = linkedAssessments.reduce((arr, a) => {
    const e = scores[a.id];
    const maxScore = Number(a.maxScore) || 0;
    if(e && e.status === 'graded' && typeof e.score === 'number' && maxScore > 0){
      arr.push(Math.max(0, Math.min(e.score, maxScore)) / maxScore * 100);
    }
    return arr;
  }, []);
  const suggestedPct = gradedPcts.length ? Math.round((gradedPcts.reduce((x, y) => x + y, 0) / gradedPcts.length) * 10) / 10 : null;
  return {
    score: entry && typeof entry.score === 'number' ? entry.score : null,
    maxScore: entry ? (Number(entry.maxScore) || 100) : 100,
    status: entry ? entry.status : 'not-graded',
    pct: entry && entry.status === 'graded' && typeof entry.score === 'number'
      ? (entry.maxScore > 0 ? entry.score / entry.maxScore * 100 : 0) : null,
    updatedAt: entry ? entry.updatedAt : null,
    evidenceCount, totalActivities: linkedAssessments.length, suggestedPct
  };
}

// Some courses (English for Communication) are only ONE component of a
// student's total final grade — a co-teacher grades the rest under a
// separate scheme this dashboard never sees. course.finalWeightPct is how
// much of the 0-100 scale above this course actually contributes once
// combined with that other grade; 100 means this course's own grade IS the
// final grade, so there's nothing extra to convert or show. Returns null in
// that case so the UI can simply omit the row for courses like MICE/Wellness.
function computeFinalGradeIntegration(course, grade){
  const pct = typeof course.finalWeightPct === 'number' ? course.finalWeightPct : 100;
  if(pct >= 100) return null;
  return {
    finalWeightPct: pct,
    integratedScore: grade.currentPct !== null ? Math.round(grade.currentPct * (pct / 100) * 10) / 10 : null
  };
}

function computeAttendanceStats(student){
  const records = student.attendance || [];
  const countable = records.filter(r => r.status !== 'excused');
  const presentLike = countable.filter(r => r.status === 'present' || r.status === 'late').length;
  return {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    late: records.filter(r => r.status === 'late').length,
    absent: records.filter(r => r.status === 'absent').length,
    excused: records.filter(r => r.status === 'excused').length,
    pct: countable.length > 0 ? Math.round((presentLike / countable.length) * 100) : null
  };
}

// Institutional absence-limit policy, independent of the attendance %
// above: a student can quietly sit above the 80% "Needs Attention"
// threshold for weeks (a long term makes 3-4 absences look small as a
// percentage) while still having burned through their actual allowed
// absences. "Late" never counts here — only a real "absent" mark does.
const ATTENDANCE_ABSENCE_WARNING = 3;
const ATTENDANCE_ABSENCE_EXCEEDED = 4;
function computeAbsenceFlag(student){
  const absences = (student.attendance || []).filter(r => r.status === 'absent').length;
  let level = null;
  if(absences >= ATTENDANCE_ABSENCE_EXCEEDED) level = 'exceeded';
  else if(absences === ATTENDANCE_ABSENCE_WARNING) level = 'warning';
  return { absences, level };
}

// Max points added on top of in-class attendance % for full website
// engagement (check-ins/activities completed on the course site), per the
// teacher's explicit choice: attendance stays primary, the site is a small
// bonus, never the other way around.
const ATTENDANCE_SITE_BONUS_MAX = 5;

// Keeps the 'attendance' CATEGORY's overall score live (grade-bearing layer
// — see computeStudentGrade): whenever attendance changes, categoryScores
// .attendance is recalculated from computeAttendanceStats and overwritten.
// Deliberately NOT a one-time default or a sticky override — the next real
// attendance change (or the next roster load, via migrateRosterShape)
// recomputes and replaces it, matching "always live" rather than
// "auto-fill once." This is intentionally read-only in the UI (Group/Class
// category table and Student Profile Assessment Summary both render it
// without an editable input) so a manual edit can never be entered only to
// be silently overwritten next sync. Any pre-existing 'attendance'-category
// assessment instance under course.assessments (e.g. a teacher-created
// "Attendance & Active Participation" record) is left completely alone —
// it's ordinary evidence now, not a sync target.
// In-class attendance % is the base; student.siteEngagementPct (0-100, set
// via the Import Scores tool's "Attendance Bonus" target, never auto-synced
// itself) adds up to ATTENDANCE_SITE_BONUS_MAX points on top, capped at 100.
// A student with no countable attendance yet still gets no score at all,
// even with real site activity — the bonus never becomes the whole grade.
function syncAttendanceScoresForStudent(course, student){
  if(!course || !student) return;
  const cat = (course.categories || []).find(c => c.id === 'attendance');
  if(!cat) return;
  const stats = computeAttendanceStats(student);
  if(stats.pct === null) return; // no countable attendance yet — leave ungraded, don't force a zero
  const sitePct = Math.max(0, Math.min(100, Number(student.siteEngagementPct) || 0));
  const bonus = sitePct / 100 * ATTENDANCE_SITE_BONUS_MAX;
  const finalPct = Math.round(Math.min(100, stats.pct + bonus) * 10) / 10;
  student.categoryScores = student.categoryScores || {};
  student.categoryScores.attendance = {
    score: finalPct,
    maxScore: 100,
    status: 'graded',
    updatedAt: new Date().toISOString()
  };
}
function syncAttendanceScoresForCourse(course){
  if(!course) return;
  (course.groups || []).forEach(g => (g.students || []).forEach(s => syncAttendanceScoresForStudent(course, s)));
}

function computeStudentStatus(course, student){
  const grade = computeStudentGrade(course, student);
  const att = computeAttendanceStats(student);
  if(grade.status === 'not-started' && att.total === 0) return 'No Data Yet';
  const attLow = att.pct !== null && att.pct < 80;
  const gradeLow = grade.currentPct !== null && grade.currentPct < 60;
  const missingWork = grade.remainingWeight >= 30 && grade.gradedWeight > 0;
  if(attLow || gradeLow) return 'Needs Attention';
  if(missingWork) return 'Missing Work';
  return 'On Track';
}

function fmtPct(n){ return n === null || n === undefined ? '—' : Math.round(n * 10) / 10 + '%'; }

/* ===================== DASHBOARD-WIDE STATS (Phase 8) ===================== */
// Total individual scores actually recorded (status:'graded') across every
// course/group/student in this term — "how much grading is actually done",
// not the number of assessment definitions.
function countScoresEntered(roster){
  let count = 0;
  roster.courses.forEach(course => {
    course.groups.forEach(group => {
      group.students.forEach(s => {
        Object.values(s.scores || {}).forEach(entry => { if(entry && entry.status === 'graded') count++; });
      });
    });
  });
  return count;
}

function averageAttendancePct(roster){
  const pcts = [];
  roster.courses.forEach(course => {
    course.groups.forEach(group => {
      group.students.forEach(s => {
        const stats = computeAttendanceStats(s);
        if(stats.pct !== null) pcts.push(stats.pct);
      });
    });
  });
  return pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
}

// Merges the three things a teacher actually does day to day — entering a
// score, taking attendance, uploading evidence — into one feed, newest
// first. Anything saved before this field existed has no timestamp and is
// simply left out rather than guessed at.
function computeRecentActivity(roster, limit){
  const events = [];
  roster.courses.forEach(course => {
    course.groups.forEach(group => {
      group.students.forEach(s => {
        Object.keys(s.scores || {}).forEach(assessmentId => {
          const entry = s.scores[assessmentId];
          if(!entry || !entry.updatedAt || entry.status === 'not-graded') return;
          const a = (course.assessments || []).find(x => x.id === assessmentId);
          events.push({
            type: 'score', time: entry.updatedAt, courseId: course.courseId, courseName: course.courseName,
            groupId: group.groupId, studentId: s.studentId, studentName: s.name,
            detail: `${entry.status === 'excused' ? 'Marked excused for' : 'Scored'} ${a ? a.title : 'an assessment'}${entry.status === 'graded' ? ` (${entry.score}/${a ? a.maxScore : '?'})` : ''}`
          });
        });
        (s.attendance || []).forEach(r => {
          if(!r.recordedAt) return;
          events.push({
            type: 'attendance', time: r.recordedAt, courseId: course.courseId, courseName: course.courseName,
            groupId: group.groupId, studentId: s.studentId, studentName: s.name,
            detail: `Marked ${r.status} for ${fmtDateShort(r.date)}`
          });
        });
        (s.evidence || []).forEach(ev => {
          events.push({
            type: 'evidence', time: ev.uploadedAt, courseId: course.courseId, courseName: course.courseName,
            groupId: group.groupId, studentId: s.studentId, studentName: s.name,
            detail: `Uploaded ${ev.fileName}`
          });
        });
      });
    });
  });
  events.sort((a, b) => b.time.localeCompare(a.time));
  return events.slice(0, limit || 8);
}
function fmtDateShort(iso){ return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' }); }

/* ===================== RUBRIC SCORING (Phase 3) =====================
   Criterion-based rubrics (MICE Speaking, Wellness Speaking, EFC Speaking &
   Listening) all use the same official 4-level scale: Level 4 = full marks
   on that criterion, Level 3 = 75%, Level 2 = 50%, Level 1 = 25% — matching
   the "Fluency, Level 3 - Good, 15/20" style example from the course rubric
   documents (15/20 = 75% of a 20-point criterion). `levels` is a plain
   object keyed by criterion id -> level (1-4). Returns null for any
   criterion left unscored so the UI can flag an incomplete rubric instead
   of silently scoring it as zero. */
function isRubricGradeable(rubric){
  return !!(rubric && Array.isArray(rubric.criteria) && rubric.type !== 'group');
}

function computeCriterionScore(criterion, level){
  if(!level) return null;
  return Math.round((level / 4) * criterion.max * 10) / 10;
}

function computeRubricTotal(rubric, levels){
  let total = 0;
  for(const c of rubric.criteria){
    const lvl = levels ? levels[c.id] : null;
    const pts = computeCriterionScore(c, lvl);
    if(pts === null) return null; // incomplete — every criterion must be scored
    total += pts;
  }
  return Math.round(total * 10) / 10;
}

/* ===================== CLO ATTAINMENT (Phase 3) =====================
   Reuses the CLOs already attached to each assessment (set in Assessment
   Management) and the scores already entered — no separate CLO data entry
   anywhere. A CLO only shows a percentage once at least one linked
   assessment has actually been graded; until then it reads "Not yet
   assessed" rather than 0%, for the same reason a blank score is never
   treated as zero. */
function computeStudentCLOAttainment(course, student){
  const scores = student.scores || {};
  const clos = TEACHER_COURSE_CONFIG[course.courseId].clos;
  return clos.map(clo => {
    const linked = (course.assessments || []).filter(a => (a.clos || []).includes(clo.id));
    let earned = 0, possible = 0, gradedCount = 0;
    linked.forEach(a => {
      const entry = scores[a.id];
      if(entry && entry.status === 'graded' && typeof entry.score === 'number'){
        earned += entry.score; possible += (Number(a.maxScore) || 0); gradedCount++;
      }
    });
    return {
      cloId: clo.id, text: clo.text, linkedCount: linked.length, gradedCount,
      pct: gradedCount > 0 && possible > 0 ? (earned / possible) * 100 : null
    };
  });
}

/* ===================== SPEAKING DEVELOPMENT (Phase 9) =====================
   Only assessments actually graded through the rubric panel carry
   per-criterion levels (a plain manually-typed score doesn't), so this pulls
   straight from that stored `entry.rubric.levels` data — nothing new to
   enter. Sorted chronologically by week so a trend across the semester is
   visible at a glance. */
function computeSpeakingDevelopment(course, student){
  const scores = student.scores || {};
  const rows = [];
  (course.assessments || []).forEach(a => {
    const rubric = a.rubricId ? TEACHER_RUBRICS[a.rubricId] : null;
    if(!isRubricGradeable(rubric)) return;
    const entry = scores[a.id];
    if(!entry || entry.status !== 'graded' || !entry.rubric) return;
    rows.push({
      assessmentId: a.id, title: a.title, week: a.week, score: entry.score, maxScore: a.maxScore,
      pct: a.maxScore > 0 ? (entry.score / a.maxScore) * 100 : null,
      criteria: rubric.criteria.map(c => ({ id: c.id, label: c.label, level: entry.rubric.levels ? entry.rubric.levels[c.id] : null }))
    });
  });
  rows.sort((a, b) => (a.week || '').localeCompare(b.week || ''));
  return rows;
}

/* ===================== STUDENT TIMELINE (Phase 9) =====================
   Merges the same three record types as the dashboard's Recent Activity
   feed, but scoped to one student and sorted oldest-first — a running story
   of their semester rather than "what changed most recently". Attendance is
   anchored to the real class-session date; assessments and evidence use the
   timestamp of when they were actually entered/uploaded, since there's no
   separate "assessment happened on this date" field to anchor to. */
function computeStudentTimeline(course, student){
  const events = [];
  Object.keys(student.scores || {}).forEach(assessmentId => {
    const entry = student.scores[assessmentId];
    if(!entry || entry.status === 'not-graded' || !entry.updatedAt) return;
    const a = (course.assessments || []).find(x => x.id === assessmentId);
    events.push({
      time: entry.updatedAt, type: 'score',
      label: a ? a.title : 'Assessment',
      detail: entry.status === 'excused' ? 'Excused' : `${entry.score} / ${a ? a.maxScore : '?'}`
    });
  });
  (student.attendance || []).forEach(r => {
    events.push({
      time: r.date + 'T12:00:00.000Z', type: 'attendance',
      label: r.status.charAt(0).toUpperCase() + r.status.slice(1),
      detail: r.note || ''
    });
  });
  (student.evidence || []).forEach(ev => {
    events.push({ time: ev.uploadedAt, type: 'evidence', label: 'Evidence uploaded', detail: ev.fileName });
  });
  events.sort((a, b) => a.time.localeCompare(b.time));
  return events;
}

// Class-level tracker (spec: "27/32 students >= 70%, 84.4% attainment").
// "Assessed" = has at least one graded assessment linked to that CLO — a
// student who hasn't been graded on anything for a CLO yet is excluded from
// the denominator rather than counted as a miss, since they haven't had the
// chance to demonstrate it yet.
function computeCourseCLOAttainment(course){
  const config = TEACHER_COURSE_CONFIG[course.courseId];
  const benchmark = config.cloAttainmentBenchmark || { studentPct:70, scorePct:70 };
  return config.clos.map(clo => {
    let assessedCount = 0, metCount = 0;
    course.groups.forEach(group => {
      group.students.forEach(student => {
        const row = computeStudentCLOAttainment(course, student).find(r => r.cloId === clo.id);
        if(row && row.pct !== null){
          assessedCount++;
          if(row.pct >= benchmark.scorePct) metCount++;
        }
      });
    });
    const attainmentPct = assessedCount > 0 ? (metCount / assessedCount) * 100 : null;
    return {
      cloId: clo.id, text: clo.text, assessedCount, metCount, attainmentPct,
      benchmarkMet: attainmentPct !== null ? attainmentPct >= benchmark.studentPct : null
    };
  });
}

function newId(prefix){
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ===================== BACKEND ABSTRACTION ===================== */
const TeacherBackend = (function(){
  const LOCAL_KEY = 'teacherDashboard_v1';

  // Every course's category weights and grade scale start as an editable
  // COPY of the official defaults (Assessment Settings) — editing one term's
  // copy never touches TEACHER_COURSE_CONFIG/TEACHER_GRADE_SCALE themselves,
  // so the defaults stay intact for any future term that wants to start
  // fresh from the real course documents again.
  function defaultCategoriesFor(courseId){
    return JSON.parse(JSON.stringify(TEACHER_COURSE_CONFIG[courseId].categories));
  }
  function defaultGradeScaleCopy(){
    return JSON.parse(JSON.stringify(TEACHER_GRADE_SCALE));
  }
  function defaultFinalWeightPctFor(courseId){
    const cfg = TEACHER_COURSE_CONFIG[courseId];
    return (cfg && typeof cfg.finalWeightPct === 'number') ? cfg.finalWeightPct : 100;
  }

  function cloneSeedAsMutableTree(){
    const tree = JSON.parse(JSON.stringify(TEACHER_ROSTER_SEED));
    tree.courses.forEach(course => {
      course.assessments = course.assessments || [];
      course.categories = course.categories || defaultCategoriesFor(course.courseId);
      course.gradeScale = course.gradeScale || defaultGradeScaleCopy();
      course.finalWeightPct = typeof course.finalWeightPct === 'number' ? course.finalWeightPct : defaultFinalWeightPctFor(course.courseId);
      course.groups.forEach(group => {
        group.presentationTeams = group.presentationTeams || [];
        group.attendanceSheets = group.attendanceSheets || [];
        group.students.forEach(s => {
          s.nickname = s.nickname || '';
          s.notes = s.notes || '';
          s.program = s.program || '';
          s.scores = s.scores || {};
          s.categoryScores = s.categoryScores || {};
          s.attendance = s.attendance || [];
          s.evidence = s.evidence || [];
        });
      });
    });
    return tree;
  }

  // Applied to every roster read (fresh seed AND already-saved data) so a
  // teacher's existing nicknames/notes/scores are never lost when this file
  // adds new fields — old records are patched up to the current shape in
  // place rather than replaced.
  function migrateRosterShape(roster){
    roster.courses.forEach(course => {
      course.assessments = course.assessments || [];
      course.categories = course.categories || defaultCategoriesFor(course.courseId);
      course.gradeScale = course.gradeScale || defaultGradeScaleCopy();
      course.finalWeightPct = typeof course.finalWeightPct === 'number' ? course.finalWeightPct : defaultFinalWeightPctFor(course.courseId);
      course.groups.forEach(group => {
        group.presentationTeams = group.presentationTeams || [];
        group.attendanceSheets = group.attendanceSheets || [];
        group.students.forEach(s => {
          s.nickname = s.nickname || '';
          s.notes = s.notes || '';
          s.scores = s.scores || {};
          s.categoryScores = s.categoryScores || {};
          s.attendance = s.attendance || [];
          s.evidence = s.evidence || [];
        });
      });
      // Re-sync on every load, not just on save, so the attendance score
      // stays "live" even after a category/assessment maxScore edit, and so
      // attendance recorded before this feature existed backfills itself.
      syncAttendanceScoresForCourse(course);
    });
    return roster;
  }

  /* ---------- new-term tree builders (Phase 6) ---------- */
  function createBlankRosterTree(academicYear, semester){
    return {
      academicYear, semester,
      courses: Object.keys(TEACHER_COURSE_CONFIG).map(courseId => {
        const cfg = TEACHER_COURSE_CONFIG[courseId];
        return {
          courseId, courseName: cfg.courseName, courseCode: cfg.courseCode, assessments: [], groups: [],
          categories: defaultCategoriesFor(courseId), gradeScale: defaultGradeScaleCopy(),
          finalWeightPct: defaultFinalWeightPctFor(courseId)
        };
      })
    };
  }
  // Reuses the previous term's course/group/student SHAPE (names, IDs,
  // gender, and — deliberately — the assessment definitions, since the
  // official assessment plan doesn't usually change term to term) but wipes
  // every academic record, since none of it belongs to the new term.
  function cloneRosterForNewTerm(sourceRoster, academicYear, semester){
    const clone = JSON.parse(JSON.stringify(sourceRoster));
    clone.academicYear = academicYear;
    clone.semester = semester;
    clone.courses.forEach(course => {
      course.groups.forEach(group => {
        group.presentationTeams = [];
        group.attendanceSheets = [];
        group.students.forEach(s => {
          s.nickname = ''; s.notes = ''; s.scores = {}; s.attendance = []; s.evidence = [];
        });
      });
    });
    return clone;
  }

  /* ---------- pure tree mutators, shared by both backends ---------- */
  function findCourseIn(roster, courseId){ return roster.courses.find(c => c.courseId === courseId); }
  function findGroupIn(roster, courseId, groupId){ const c = findCourseIn(roster, courseId); return c && c.groups.find(g => g.groupId === groupId); }
  function findStudentIn(roster, courseId, groupId, studentId){ const g = findGroupIn(roster, courseId, groupId); return g && g.students.find(s => s.studentId === studentId); }

  /* ---------- manual roster editing (Phase 6) ----------
     Needed so a newly created, blank semester can actually be populated —
     until now every student came from the one seed file. */
  function mutAddGroup(roster, courseId, group){
    const course = findCourseIn(roster, courseId);
    if(!course) throw new Error('Course not found');
    if(course.groups.find(g => g.groupId === group.groupId)) throw new Error(`Group ${group.groupId} already exists in this course.`);
    course.groups.push(Object.assign({ students: [], presentationTeams: [], attendanceSheets: [] }, group));
    return course.groups[course.groups.length - 1];
  }
  function mutDeleteGroup(roster, courseId, groupId){
    const course = findCourseIn(roster, courseId);
    if(!course) return;
    course.groups = course.groups.filter(g => g.groupId !== groupId);
  }
  function mutAddStudent(roster, courseId, groupId, student){
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) throw new Error('Group not found');
    if(group.students.find(s => s.studentId === student.studentId)) throw new Error(`Student ID ${student.studentId} already exists in this group.`);
    group.students.push(Object.assign({
      nickname: '', notes: '', program: '', scores: {}, attendance: [], evidence: []
    }, student));
    return group.students[group.students.length - 1];
  }
  function mutDeleteStudent(roster, courseId, groupId, studentId){
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) return;
    group.students = group.students.filter(s => s.studentId !== studentId);
  }

  /* ---------- Assessment Settings: category weights + grade scale (Phase 7) ----------
     Edits this term's own copy only — TEACHER_COURSE_CONFIG and
     TEACHER_GRADE_SCALE (the real course-document defaults) are never
     touched, so a future term can always start fresh from them again. */
  function mutUpdateCategoryWeights(roster, courseId, weightsByCategoryId){
    const course = findCourseIn(roster, courseId);
    if(!course) throw new Error('Course not found');
    course.categories.forEach(cat => {
      if(Object.prototype.hasOwnProperty.call(weightsByCategoryId, cat.id)){
        cat.weight = Number(weightsByCategoryId[cat.id]);
      }
    });
    return course.categories;
  }
  function mutUpdateGradeScale(roster, courseId, gradeScale){
    const course = findCourseIn(roster, courseId);
    if(!course) throw new Error('Course not found');
    course.gradeScale = gradeScale;
    return course.gradeScale;
  }
  // How much of a student's TOTAL final grade this course actually
  // contributes (see computeFinalGradeIntegration) — 100 for a standalone
  // course, less than 100 for one shared with a co-teacher (e.g. EFC's 30%).
  function mutUpdateFinalWeightPct(roster, courseId, pct){
    const course = findCourseIn(roster, courseId);
    if(!course) throw new Error('Course not found');
    course.finalWeightPct = Number(pct);
    return course.finalWeightPct;
  }

  function mutAddAssessment(roster, courseId, assessment){
    const course = findCourseIn(roster, courseId);
    if(!course) throw new Error('Course not found');
    const record = Object.assign({ id: newId('as'), clos: [] }, assessment);
    course.assessments.push(record);
    return record;
  }
  function mutUpdateAssessment(roster, courseId, assessmentId, patch){
    const course = findCourseIn(roster, courseId);
    const a = course && course.assessments.find(x => x.id === assessmentId);
    if(!a) throw new Error('Assessment not found');
    Object.assign(a, patch);
    return a;
  }
  function mutDeleteAssessment(roster, courseId, assessmentId){
    const course = findCourseIn(roster, courseId);
    if(!course) return;
    course.assessments = course.assessments.filter(a => a.id !== assessmentId);
    course.groups.forEach(g => g.students.forEach(s => { if(s.scores) delete s.scores[assessmentId]; }));
  }
  function mutSetStudentScore(roster, courseId, groupId, studentId, assessmentId, entry){
    const student = findStudentIn(roster, courseId, groupId, studentId);
    if(!student) throw new Error('Student not found');
    student.scores = student.scores || {};
    student.scores[assessmentId] = Object.assign({}, entry, { updatedAt: new Date().toISOString() });
    return student.scores[assessmentId];
  }
  // Grade-bearing layer: one overall score per assessment category (see
  // computeStudentGrade). Deliberately never called for categoryId
  // 'attendance' from the UI — that stays exclusively auto-computed by
  // syncAttendanceScoresForStudent.
  function mutSetStudentCategoryScore(roster, courseId, groupId, studentId, categoryId, entry){
    const student = findStudentIn(roster, courseId, groupId, studentId);
    if(!student) throw new Error('Student not found');
    student.categoryScores = student.categoryScores || {};
    student.categoryScores[categoryId] = Object.assign({}, entry, { updatedAt: new Date().toISOString() });
    return student.categoryScores[categoryId];
  }
  // Whole-group "grade this category for everyone at once" save, mirroring
  // mutSetGroupAttendanceBulk: records = { [studentId]: { score, maxScore, status } }.
  function mutSetGroupCategoryScoresBulk(roster, courseId, groupId, categoryId, records){
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) throw new Error('Group not found');
    group.students.forEach(s => {
      const r = records[s.studentId];
      if(!r) return;
      mutSetStudentCategoryScore(roster, courseId, groupId, s.studentId, categoryId, r);
    });
  }
  // Sets student.siteEngagementPct (0-100) for a whole group at once, then
  // immediately re-syncs the attendance category score for each of them so
  // the bonus (see ATTENDANCE_SITE_BONUS_MAX) takes effect right away —
  // records = { [studentId]: pct }. This is the only writer of
  // siteEngagementPct; it never touches real attendance records.
  function mutSetGroupSiteEngagementBulk(roster, courseId, groupId, records){
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) throw new Error('Group not found');
    const course = findCourseIn(roster, courseId);
    group.students.forEach(s => {
      const pct = records[s.studentId];
      if(pct === undefined) return;
      s.siteEngagementPct = Math.max(0, Math.min(100, Number(pct) || 0));
      syncAttendanceScoresForStudent(course, s);
    });
  }
  function mutUpsertAttendance(roster, courseId, groupId, studentId, date, status, note){
    const student = findStudentIn(roster, courseId, groupId, studentId);
    if(!student) throw new Error('Student not found');
    student.attendance = student.attendance || [];
    const recordedAt = new Date().toISOString();
    const existing = student.attendance.find(r => r.date === date);
    if(existing){ existing.status = status; existing.note = note || ''; existing.recordedAt = recordedAt; }
    else { student.attendance.push({ date, status, note: note || '', recordedAt }); }
    student.attendance.sort((a, b) => a.date < b.date ? 1 : -1);
    syncAttendanceScoresForStudent(findCourseIn(roster, courseId), student);
  }
  function mutSetGroupAttendanceBulk(roster, courseId, groupId, date, records){
    // records: { [studentId]: { status, note } }
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) throw new Error('Group not found');
    group.students.forEach(s => {
      const r = records[s.studentId];
      if(!r) return;
      mutUpsertAttendance(roster, courseId, groupId, s.studentId, date, r.status, r.note);
    });
  }
  // Multi-date version for catching up several weeks of paper attendance
  // sheets at once: records = { [studentId]: { [date]: status } }. Reuses
  // mutUpsertAttendance per (student, date) pair unchanged -- same sort
  // order, same re-sync of the attendance category score -- this just loops
  // it over many dates instead of one.
  function mutSetGroupAttendanceBulkMultiDate(roster, courseId, groupId, records){
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) throw new Error('Group not found');
    group.students.forEach(s => {
      const byDate = records[s.studentId];
      if(!byDate) return;
      Object.keys(byDate).forEach(date => {
        mutUpsertAttendance(roster, courseId, groupId, s.studentId, date, byDate[date], '');
      });
    });
  }
  function mutDeleteAttendance(roster, courseId, groupId, studentId, date){
    const student = findStudentIn(roster, courseId, groupId, studentId);
    if(!student) return;
    student.attendance = (student.attendance || []).filter(r => r.date !== date);
    syncAttendanceScoresForStudent(findCourseIn(roster, courseId), student);
  }
  // Fixes a whole class session logged under the wrong date (e.g. picked
  // the wrong day on the date picker) without re-entering every student by
  // hand. A student who already has a real record on the target date is
  // left alone and counted as "skipped" rather than silently overwritten.
  function mutMoveGroupAttendanceDate(roster, courseId, groupId, fromDate, toDate){
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) throw new Error('Group not found');
    let moved = 0, skipped = 0;
    group.students.forEach(s => {
      const records = s.attendance || [];
      const fromRecord = records.find(r => r.date === fromDate);
      if(!fromRecord) return;
      const toExists = records.find(r => r.date === toDate);
      if(toExists){ skipped++; return; }
      fromRecord.date = toDate;
      moved++;
      s.attendance.sort((a, b) => a.date < b.date ? 1 : -1);
    });
    return { moved, skipped };
  }

  /* ---------- presentation teams (Phase 4) ----------
     A team's group score (and any individual override) is written straight
     into each member's normal scores[assessmentId] entry — the same field
     Assessment History and grade calculation already read — so nothing
     downstream needed to change to support group grading. */
  function applyTeamScores(roster, courseId, groupId, team){
    team.memberIds.forEach(studentId => {
      const score = (team.individualScores && typeof team.individualScores[studentId] === 'number')
        ? team.individualScores[studentId] : team.groupScore;
      mutSetStudentScore(roster, courseId, groupId, studentId, team.assessmentId, {
        status: 'graded', score, presentationTeamId: team.id
      });
    });
  }
  function mutAddPresentationTeam(roster, courseId, groupId, team){
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) throw new Error('Group not found');
    group.presentationTeams = group.presentationTeams || [];
    const record = Object.assign({ id: newId('team') }, team);
    group.presentationTeams.push(record);
    applyTeamScores(roster, courseId, groupId, record);
    return record;
  }
  function mutUpdatePresentationTeam(roster, courseId, groupId, teamId, patch){
    const group = findGroupIn(roster, courseId, groupId);
    const team = group && (group.presentationTeams || []).find(t => t.id === teamId);
    if(!team) throw new Error('Team not found');
    // Members removed from the team lose the score this team gave them.
    if(patch.memberIds){
      const removed = team.memberIds.filter(id => !patch.memberIds.includes(id));
      removed.forEach(studentId => {
        const student = findStudentIn(roster, courseId, groupId, studentId);
        if(student && student.scores && student.scores[team.assessmentId] && student.scores[team.assessmentId].presentationTeamId === teamId){
          student.scores[team.assessmentId] = { status: 'not-graded', score: null };
        }
      });
    }
    Object.assign(team, patch);
    applyTeamScores(roster, courseId, groupId, team);
    return team;
  }
  function mutDeletePresentationTeam(roster, courseId, groupId, teamId){
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) return;
    const team = (group.presentationTeams || []).find(t => t.id === teamId);
    if(team){
      team.memberIds.forEach(studentId => {
        const student = findStudentIn(roster, courseId, groupId, studentId);
        if(student && student.scores && student.scores[team.assessmentId] && student.scores[team.assessmentId].presentationTeamId === teamId){
          student.scores[team.assessmentId] = { status: 'not-graded', score: null };
        }
      });
    }
    group.presentationTeams = (group.presentationTeams || []).filter(t => t.id !== teamId);
  }

  /* ---------- evidence / portfolio metadata (Phase 4) ----------
     File bytes live in TeacherLocalFiles (IndexedDB) or Firebase Storage,
     never in the roster JSON itself — these mutators only touch the small
     metadata record (filename, description, tags, linked assessment). */
  function mutAddEvidence(roster, courseId, groupId, studentId, meta){
    const student = findStudentIn(roster, courseId, groupId, studentId);
    if(!student) throw new Error('Student not found');
    student.evidence = student.evidence || [];
    const record = Object.assign({ id: newId('ev'), uploadedAt: new Date().toISOString() }, meta);
    student.evidence.unshift(record);
    return record;
  }
  function mutDeleteEvidence(roster, courseId, groupId, studentId, evidenceId){
    const student = findStudentIn(roster, courseId, groupId, studentId);
    if(!student) return;
    student.evidence = (student.evidence || []).filter(e => e.id !== evidenceId);
  }

  /* ---------- attendance sheets (Phase 4) ----------
     A scanned/photographed paper attendance sheet covers a whole class
     session at once, so it's stored per (group, date) rather than copied
     onto every student the way per-student evidence is — one upload, not
     one per name on the sheet. */
  function mutAddAttendanceSheet(roster, courseId, groupId, meta){
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) throw new Error('Group not found');
    group.attendanceSheets = group.attendanceSheets || [];
    const record = Object.assign({ id: newId('sheet'), uploadedAt: new Date().toISOString() }, meta);
    group.attendanceSheets.unshift(record);
    return record;
  }
  function mutDeleteAttendanceSheet(roster, courseId, groupId, sheetId){
    const group = findGroupIn(roster, courseId, groupId);
    if(!group) return;
    group.attendanceSheets = (group.attendanceSheets || []).filter(s => s.id !== sheetId);
  }

  /* ---------- LOCAL BACKEND (this browser only, via localStorage) ---------- */
  const SESSION_KEY = 'teacherDashboardSession_v1';
  const TERMS_KEY = 'teacherDashboardTerms_v1';

  const LocalBackend = {
    mode: 'local',
    _rosterKey(academicYear, semester){ return `teacherDashboard_v1_${academicYear}_${semester}`; },
    // Every term's roster lives under its own key so switching or adding a
    // term can never touch another term's data. On first-ever run this also
    // migrates the old single-blob storage key (from before terms existed)
    // into the new shape, so nothing already saved gets lost.
    _readTermsRegistry(){
      try{
        const raw = localStorage.getItem(TERMS_KEY);
        if(raw) return JSON.parse(raw);
      } catch(e){}
      let legacy = null;
      try{
        const legacyRaw = localStorage.getItem(LOCAL_KEY);
        legacy = legacyRaw ? JSON.parse(legacyRaw) : null;
      } catch(e){}
      const academicYear = (legacy && legacy.roster && legacy.roster.academicYear) || TEACHER_ROSTER_SEED.academicYear;
      const semester = (legacy && legacy.roster && legacy.roster.semester) || TEACHER_ROSTER_SEED.semester;
      const registry = {
        terms: [{ academicYear, semester, label: `AY${academicYear} / Semester ${semester}` }],
        activeTerm: { academicYear, semester }
      };
      localStorage.setItem(TERMS_KEY, JSON.stringify(registry));
      if(legacy && legacy.roster) localStorage.setItem(this._rosterKey(academicYear, semester), JSON.stringify(legacy.roster));
      if(legacy && legacy.session) localStorage.setItem(SESSION_KEY, JSON.stringify(legacy.session));
      return registry;
    },
    _writeTermsRegistry(registry){ localStorage.setItem(TERMS_KEY, JSON.stringify(registry)); },
    _activeTermSync(){ return this._readTermsRegistry().activeTerm; },
    async getActiveTerm(){ return this._activeTermSync(); },
    async listTerms(){ return this._readTermsRegistry().terms; },
    async setActiveTerm(academicYear, semester){
      const registry = this._readTermsRegistry();
      if(!registry.terms.find(t => t.academicYear === academicYear && t.semester === semester)){
        throw new Error('That term does not exist yet.');
      }
      registry.activeTerm = { academicYear, semester };
      this._writeTermsRegistry(registry);
    },
    async createTerm({ academicYear, semester, label, cloneFromCurrent }){
      const registry = this._readTermsRegistry();
      if(registry.terms.find(t => t.academicYear === academicYear && t.semester === semester)){
        throw new Error('That academic year and semester already exists.');
      }
      const roster = cloneFromCurrent
        ? cloneRosterForNewTerm(await this.getRoster(), academicYear, semester)
        : createBlankRosterTree(academicYear, semester);
      localStorage.setItem(this._rosterKey(academicYear, semester), JSON.stringify(roster));
      registry.terms.push({ academicYear, semester, label: label || `AY${academicYear} / Semester ${semester}` });
      registry.activeTerm = { academicYear, semester };
      this._writeTermsRegistry(registry);
      return roster;
    },
    async ensureSeeded(){
      const { academicYear, semester } = this._activeTermSync();
      const key = this._rosterKey(academicYear, semester);
      const raw = localStorage.getItem(key);
      const roster = raw ? migrateRosterShape(JSON.parse(raw)) : cloneSeedAsMutableTree();
      localStorage.setItem(key, JSON.stringify(roster));
      return roster;
    },
    async signIn(displayName){
      const session = { name: displayName || 'Teacher', signedInAt: Date.now() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },
    async signOutTeacher(){
      localStorage.removeItem(SESSION_KEY);
    },
    async currentSession(){
      try{
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch(e){ return null; }
    },
    async getRoster(){
      return this.ensureSeeded();
    },
    async _mutate(fn){
      const roster = await this.ensureSeeded();
      const result = fn(roster);
      const { academicYear, semester } = this._activeTermSync();
      localStorage.setItem(this._rosterKey(academicYear, semester), JSON.stringify(roster));
      return result;
    },
    async updateCategoryWeights(courseId, weightsByCategoryId){ return this._mutate(roster => mutUpdateCategoryWeights(roster, courseId, weightsByCategoryId)); },
    async updateGradeScale(courseId, gradeScale){ return this._mutate(roster => mutUpdateGradeScale(roster, courseId, gradeScale)); },
    async updateFinalWeightPct(courseId, pct){ return this._mutate(roster => mutUpdateFinalWeightPct(roster, courseId, pct)); },
    async addGroup(courseId, group){ return this._mutate(roster => mutAddGroup(roster, courseId, group)); },
    async deleteGroup(courseId, groupId){ return this._mutate(roster => mutDeleteGroup(roster, courseId, groupId)); },
    async addStudent(courseId, groupId, student){ return this._mutate(roster => mutAddStudent(roster, courseId, groupId, student)); },
    async deleteStudent(courseId, groupId, studentId){ return this._mutate(roster => mutDeleteStudent(roster, courseId, groupId, studentId)); },
    async updateStudent(courseId, groupId, studentId, patch){
      return this._mutate(roster => {
        const student = findStudentIn(roster, courseId, groupId, studentId);
        if(!student) throw new Error('Student not found');
        Object.assign(student, patch);
        return student;
      });
    },
    async addAssessment(courseId, assessment){ return this._mutate(roster => mutAddAssessment(roster, courseId, assessment)); },
    async updateAssessment(courseId, assessmentId, patch){ return this._mutate(roster => mutUpdateAssessment(roster, courseId, assessmentId, patch)); },
    async deleteAssessment(courseId, assessmentId){ return this._mutate(roster => mutDeleteAssessment(roster, courseId, assessmentId)); },
    async setStudentScore(courseId, groupId, studentId, assessmentId, entry){ return this._mutate(roster => mutSetStudentScore(roster, courseId, groupId, studentId, assessmentId, entry)); },
    async setStudentCategoryScore(courseId, groupId, studentId, categoryId, entry){ return this._mutate(roster => mutSetStudentCategoryScore(roster, courseId, groupId, studentId, categoryId, entry)); },
    async setGroupCategoryScoresBulk(courseId, groupId, categoryId, records){ return this._mutate(roster => mutSetGroupCategoryScoresBulk(roster, courseId, groupId, categoryId, records)); },
    async setGroupSiteEngagementBulk(courseId, groupId, records){ return this._mutate(roster => mutSetGroupSiteEngagementBulk(roster, courseId, groupId, records)); },
    async upsertAttendance(courseId, groupId, studentId, date, status, note){ return this._mutate(roster => mutUpsertAttendance(roster, courseId, groupId, studentId, date, status, note)); },
    async setGroupAttendanceBulk(courseId, groupId, date, records){ return this._mutate(roster => mutSetGroupAttendanceBulk(roster, courseId, groupId, date, records)); },
    async setGroupAttendanceBulkMultiDate(courseId, groupId, records){ return this._mutate(roster => mutSetGroupAttendanceBulkMultiDate(roster, courseId, groupId, records)); },
    async deleteAttendance(courseId, groupId, studentId, date){ return this._mutate(roster => mutDeleteAttendance(roster, courseId, groupId, studentId, date)); },
    async moveGroupAttendanceDate(courseId, groupId, fromDate, toDate){ return this._mutate(roster => mutMoveGroupAttendanceDate(roster, courseId, groupId, fromDate, toDate)); },
    async addPresentationTeam(courseId, groupId, team){ return this._mutate(roster => mutAddPresentationTeam(roster, courseId, groupId, team)); },
    async updatePresentationTeam(courseId, groupId, teamId, patch){ return this._mutate(roster => mutUpdatePresentationTeam(roster, courseId, groupId, teamId, patch)); },
    async deletePresentationTeam(courseId, groupId, teamId){ return this._mutate(roster => mutDeletePresentationTeam(roster, courseId, groupId, teamId)); },
    async addEvidenceMeta(courseId, groupId, studentId, meta){ return this._mutate(roster => mutAddEvidence(roster, courseId, groupId, studentId, meta)); },
    async deleteEvidenceMeta(courseId, groupId, studentId, evidenceId){ return this._mutate(roster => mutDeleteEvidence(roster, courseId, groupId, studentId, evidenceId)); },
    async uploadEvidence(courseId, groupId, studentId, file, meta){
      const key = newId('evfile');
      await TeacherLocalFiles.putBlob(key, file);
      return this.addEvidenceMeta(courseId, groupId, studentId, Object.assign({}, meta, {
        fileName: file.name, fileType: file.type, sizeBytes: file.size, storageKey: key
      }));
    },
    async getEvidenceURL(evidence){
      const blob = await TeacherLocalFiles.getBlob(evidence.storageKey);
      return blob ? URL.createObjectURL(blob) : null;
    },
    async deleteEvidence(courseId, groupId, studentId, evidence){
      await TeacherLocalFiles.deleteBlob(evidence.storageKey);
      return this.deleteEvidenceMeta(courseId, groupId, studentId, evidence.id);
    },
    async addAttendanceSheetMeta(courseId, groupId, meta){ return this._mutate(roster => mutAddAttendanceSheet(roster, courseId, groupId, meta)); },
    async deleteAttendanceSheetMeta(courseId, groupId, sheetId){ return this._mutate(roster => mutDeleteAttendanceSheet(roster, courseId, groupId, sheetId)); },
    async uploadAttendanceSheet(courseId, groupId, file, meta){
      const key = newId('sheetfile');
      await TeacherLocalFiles.putBlob(key, file);
      return this.addAttendanceSheetMeta(courseId, groupId, Object.assign({}, meta, {
        fileName: file.name, fileType: file.type, sizeBytes: file.size, storageKey: key
      }));
    },
    async getAttendanceSheetURL(sheet){
      const blob = await TeacherLocalFiles.getBlob(sheet.storageKey);
      return blob ? URL.createObjectURL(blob) : null;
    },
    async deleteAttendanceSheet(courseId, groupId, sheet){
      await TeacherLocalFiles.deleteBlob(sheet.storageKey);
      return this.deleteAttendanceSheetMeta(courseId, groupId, sheet.id);
    }
  };

  /* ---------- FIREBASE BACKEND (real Auth + Firestore) ---------- */
  let fb = null;
  let fbReadyPromise = null;
  async function ensureFirebase(){
    if(fb) return fb;
    if(fbReadyPromise) return fbReadyPromise;
    fbReadyPromise = (async () => {
      const appMod = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js');
      const authMod = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js');
      const fsMod = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js');
      const storageMod = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js');
      const app = appMod.initializeApp(TEACHER_FIREBASE_CONFIG, 'teacherDashboard');
      const auth = authMod.getAuth(app);
      const db = fsMod.getFirestore(app);
      const storage = storageMod.getStorage(app);
      fb = { app, auth, db, storage, authMod, fsMod, storageMod };
      return fb;
    })();
    return fbReadyPromise;
  }

  function termDocPath(fsMod, db, academicYear, semester){
    return fsMod.doc(db, 'academicYears', academicYear, 'semesters', semester);
  }
  function termsMetaPath(fsMod, db){
    return fsMod.doc(db, 'teacherMeta', 'terms');
  }
  async function ensureTermsRegistry(fsMod, db){
    const ref = termsMetaPath(fsMod, db);
    const snap = await fsMod.getDoc(ref);
    if(snap.exists()) return snap.data();
    const academicYear = TEACHER_ROSTER_SEED.academicYear, semester = TEACHER_ROSTER_SEED.semester;
    const registry = {
      terms: [{ academicYear, semester, label: `AY${academicYear} / Semester ${semester}` }],
      activeTerm: { academicYear, semester }
    };
    await fsMod.setDoc(ref, registry);
    return registry;
  }

  const FirebaseBackend = {
    mode: 'firebase',
    async signIn(email, password){
      const { auth, authMod } = await ensureFirebase();
      const cred = await authMod.signInWithEmailAndPassword(auth, email, password);
      if(cred.user.uid !== TEACHER_UID){
        await authMod.signOut(auth);
        throw new Error('This account is not authorized for the Teacher Dashboard.');
      }
      return { name: cred.user.email, signedInAt: Date.now() };
    },
    async signOutTeacher(){
      const { auth, authMod } = await ensureFirebase();
      await authMod.signOut(auth);
    },
    async currentSession(){
      const { auth } = await ensureFirebase();
      const user = auth.currentUser;
      if(!user || user.uid !== TEACHER_UID) return null;
      return { name: user.email, signedInAt: Date.now() };
    },
    async getActiveTerm(){
      const { db, fsMod } = await ensureFirebase();
      return (await ensureTermsRegistry(fsMod, db)).activeTerm;
    },
    async listTerms(){
      const { db, fsMod } = await ensureFirebase();
      return (await ensureTermsRegistry(fsMod, db)).terms;
    },
    async setActiveTerm(academicYear, semester){
      const { db, fsMod } = await ensureFirebase();
      const registry = await ensureTermsRegistry(fsMod, db);
      if(!registry.terms.find(t => t.academicYear === academicYear && t.semester === semester)){
        throw new Error('That term does not exist yet.');
      }
      registry.activeTerm = { academicYear, semester };
      await fsMod.setDoc(termsMetaPath(fsMod, db), registry);
    },
    async createTerm({ academicYear, semester, label, cloneFromCurrent }){
      const { db, fsMod } = await ensureFirebase();
      const registry = await ensureTermsRegistry(fsMod, db);
      if(registry.terms.find(t => t.academicYear === academicYear && t.semester === semester)){
        throw new Error('That academic year and semester already exists.');
      }
      const roster = cloneFromCurrent
        ? cloneRosterForNewTerm(await this.getRoster(), academicYear, semester)
        : createBlankRosterTree(academicYear, semester);
      await fsMod.setDoc(termDocPath(fsMod, db, academicYear, semester), roster);
      registry.terms.push({ academicYear, semester, label: label || `AY${academicYear} / Semester ${semester}` });
      registry.activeTerm = { academicYear, semester };
      await fsMod.setDoc(termsMetaPath(fsMod, db), registry);
      return roster;
    },
    async getRoster(){
      const { db, fsMod } = await ensureFirebase();
      const { academicYear, semester } = await this.getActiveTerm();
      const ref = termDocPath(fsMod, db, academicYear, semester);
      const snap = await fsMod.getDoc(ref);
      if(snap.exists()) return migrateRosterShape(snap.data());
      const seeded = cloneSeedAsMutableTree();
      await fsMod.setDoc(ref, seeded);
      return seeded;
    },
    async _mutate(fn){
      const { db, fsMod } = await ensureFirebase();
      const { academicYear, semester } = await this.getActiveTerm();
      const ref = termDocPath(fsMod, db, academicYear, semester);
      const roster = await this.getRoster();
      const result = fn(roster);
      await fsMod.setDoc(ref, roster);
      return result;
    },
    async updateCategoryWeights(courseId, weightsByCategoryId){ return this._mutate(roster => mutUpdateCategoryWeights(roster, courseId, weightsByCategoryId)); },
    async updateGradeScale(courseId, gradeScale){ return this._mutate(roster => mutUpdateGradeScale(roster, courseId, gradeScale)); },
    async updateFinalWeightPct(courseId, pct){ return this._mutate(roster => mutUpdateFinalWeightPct(roster, courseId, pct)); },
    async addGroup(courseId, group){ return this._mutate(roster => mutAddGroup(roster, courseId, group)); },
    async deleteGroup(courseId, groupId){ return this._mutate(roster => mutDeleteGroup(roster, courseId, groupId)); },
    async addStudent(courseId, groupId, student){ return this._mutate(roster => mutAddStudent(roster, courseId, groupId, student)); },
    async deleteStudent(courseId, groupId, studentId){ return this._mutate(roster => mutDeleteStudent(roster, courseId, groupId, studentId)); },
    async updateStudent(courseId, groupId, studentId, patch){
      return this._mutate(roster => {
        const student = findStudentIn(roster, courseId, groupId, studentId);
        if(!student) throw new Error('Student not found');
        Object.assign(student, patch);
        return student;
      });
    },
    async addAssessment(courseId, assessment){ return this._mutate(roster => mutAddAssessment(roster, courseId, assessment)); },
    async updateAssessment(courseId, assessmentId, patch){ return this._mutate(roster => mutUpdateAssessment(roster, courseId, assessmentId, patch)); },
    async deleteAssessment(courseId, assessmentId){ return this._mutate(roster => mutDeleteAssessment(roster, courseId, assessmentId)); },
    async setStudentScore(courseId, groupId, studentId, assessmentId, entry){ return this._mutate(roster => mutSetStudentScore(roster, courseId, groupId, studentId, assessmentId, entry)); },
    async setStudentCategoryScore(courseId, groupId, studentId, categoryId, entry){ return this._mutate(roster => mutSetStudentCategoryScore(roster, courseId, groupId, studentId, categoryId, entry)); },
    async setGroupCategoryScoresBulk(courseId, groupId, categoryId, records){ return this._mutate(roster => mutSetGroupCategoryScoresBulk(roster, courseId, groupId, categoryId, records)); },
    async setGroupSiteEngagementBulk(courseId, groupId, records){ return this._mutate(roster => mutSetGroupSiteEngagementBulk(roster, courseId, groupId, records)); },
    async upsertAttendance(courseId, groupId, studentId, date, status, note){ return this._mutate(roster => mutUpsertAttendance(roster, courseId, groupId, studentId, date, status, note)); },
    async setGroupAttendanceBulk(courseId, groupId, date, records){ return this._mutate(roster => mutSetGroupAttendanceBulk(roster, courseId, groupId, date, records)); },
    async setGroupAttendanceBulkMultiDate(courseId, groupId, records){ return this._mutate(roster => mutSetGroupAttendanceBulkMultiDate(roster, courseId, groupId, records)); },
    async deleteAttendance(courseId, groupId, studentId, date){ return this._mutate(roster => mutDeleteAttendance(roster, courseId, groupId, studentId, date)); },
    async moveGroupAttendanceDate(courseId, groupId, fromDate, toDate){ return this._mutate(roster => mutMoveGroupAttendanceDate(roster, courseId, groupId, fromDate, toDate)); },
    async addPresentationTeam(courseId, groupId, team){ return this._mutate(roster => mutAddPresentationTeam(roster, courseId, groupId, team)); },
    async updatePresentationTeam(courseId, groupId, teamId, patch){ return this._mutate(roster => mutUpdatePresentationTeam(roster, courseId, groupId, teamId, patch)); },
    async deletePresentationTeam(courseId, groupId, teamId){ return this._mutate(roster => mutDeletePresentationTeam(roster, courseId, groupId, teamId)); },
    async addEvidenceMeta(courseId, groupId, studentId, meta){ return this._mutate(roster => mutAddEvidence(roster, courseId, groupId, studentId, meta)); },
    async deleteEvidenceMeta(courseId, groupId, studentId, evidenceId){ return this._mutate(roster => mutDeleteEvidence(roster, courseId, groupId, studentId, evidenceId)); },
    async uploadEvidence(courseId, groupId, studentId, file, meta){
      const { storage, storageMod } = await ensureFirebase();
      const key = `teacherData/${TEACHER_ROSTER_SEED.academicYear}/${TEACHER_ROSTER_SEED.semester}/${courseId}/${groupId}/${studentId}/${newId('ev')}/${file.name}`;
      const ref = storageMod.ref(storage, key);
      await storageMod.uploadBytes(ref, file);
      return this.addEvidenceMeta(courseId, groupId, studentId, Object.assign({}, meta, {
        fileName: file.name, fileType: file.type, sizeBytes: file.size, storageKey: key
      }));
    },
    async getEvidenceURL(evidence){
      const { storage, storageMod } = await ensureFirebase();
      return storageMod.getDownloadURL(storageMod.ref(storage, evidence.storageKey));
    },
    async deleteEvidence(courseId, groupId, studentId, evidence){
      const { storage, storageMod } = await ensureFirebase();
      await storageMod.deleteObject(storageMod.ref(storage, evidence.storageKey));
      return this.deleteEvidenceMeta(courseId, groupId, studentId, evidence.id);
    },
    async addAttendanceSheetMeta(courseId, groupId, meta){ return this._mutate(roster => mutAddAttendanceSheet(roster, courseId, groupId, meta)); },
    async deleteAttendanceSheetMeta(courseId, groupId, sheetId){ return this._mutate(roster => mutDeleteAttendanceSheet(roster, courseId, groupId, sheetId)); },
    async uploadAttendanceSheet(courseId, groupId, file, meta){
      const { storage, storageMod } = await ensureFirebase();
      const key = `teacherData/${TEACHER_ROSTER_SEED.academicYear}/${TEACHER_ROSTER_SEED.semester}/${courseId}/${groupId}/attendanceSheets/${newId('sheet')}/${file.name}`;
      await storageMod.uploadBytes(storageMod.ref(storage, key), file);
      return this.addAttendanceSheetMeta(courseId, groupId, Object.assign({}, meta, {
        fileName: file.name, fileType: file.type, sizeBytes: file.size, storageKey: key
      }));
    },
    async getAttendanceSheetURL(sheet){
      const { storage, storageMod } = await ensureFirebase();
      return storageMod.getDownloadURL(storageMod.ref(storage, sheet.storageKey));
    },
    async deleteAttendanceSheet(courseId, groupId, sheet){
      const { storage, storageMod } = await ensureFirebase();
      await storageMod.deleteObject(storageMod.ref(storage, sheet.storageKey));
      return this.deleteAttendanceSheetMeta(courseId, groupId, sheet.id);
    }
  };

  const backend = (typeof isTeacherFirebaseConfigured === 'function' && isTeacherFirebaseConfigured())
    ? FirebaseBackend : LocalBackend;

  return {
    mode: backend.mode,
    signIn: backend.signIn.bind(backend),
    signOutTeacher: backend.signOutTeacher.bind(backend),
    currentSession: backend.currentSession.bind(backend),
    getRoster: backend.getRoster.bind(backend),
    updateStudent: backend.updateStudent.bind(backend),
    addAssessment: backend.addAssessment.bind(backend),
    updateAssessment: backend.updateAssessment.bind(backend),
    deleteAssessment: backend.deleteAssessment.bind(backend),
    setStudentScore: backend.setStudentScore.bind(backend),
    setStudentCategoryScore: backend.setStudentCategoryScore.bind(backend),
    setGroupCategoryScoresBulk: backend.setGroupCategoryScoresBulk.bind(backend),
    setGroupSiteEngagementBulk: backend.setGroupSiteEngagementBulk.bind(backend),
    upsertAttendance: backend.upsertAttendance.bind(backend),
    setGroupAttendanceBulk: backend.setGroupAttendanceBulk.bind(backend),
    setGroupAttendanceBulkMultiDate: backend.setGroupAttendanceBulkMultiDate.bind(backend),
    deleteAttendance: backend.deleteAttendance.bind(backend),
    moveGroupAttendanceDate: backend.moveGroupAttendanceDate.bind(backend),
    addPresentationTeam: backend.addPresentationTeam.bind(backend),
    updatePresentationTeam: backend.updatePresentationTeam.bind(backend),
    deletePresentationTeam: backend.deletePresentationTeam.bind(backend),
    uploadEvidence: backend.uploadEvidence.bind(backend),
    getEvidenceURL: backend.getEvidenceURL.bind(backend),
    deleteEvidence: backend.deleteEvidence.bind(backend),
    uploadAttendanceSheet: backend.uploadAttendanceSheet.bind(backend),
    getAttendanceSheetURL: backend.getAttendanceSheetURL.bind(backend),
    deleteAttendanceSheet: backend.deleteAttendanceSheet.bind(backend),
    getActiveTerm: backend.getActiveTerm.bind(backend),
    listTerms: backend.listTerms.bind(backend),
    setActiveTerm: backend.setActiveTerm.bind(backend),
    createTerm: backend.createTerm.bind(backend),
    addGroup: backend.addGroup.bind(backend),
    deleteGroup: backend.deleteGroup.bind(backend),
    addStudent: backend.addStudent.bind(backend),
    deleteStudent: backend.deleteStudent.bind(backend),
    updateCategoryWeights: backend.updateCategoryWeights.bind(backend),
    updateGradeScale: backend.updateGradeScale.bind(backend),
    updateFinalWeightPct: backend.updateFinalWeightPct.bind(backend)
  };
})();
