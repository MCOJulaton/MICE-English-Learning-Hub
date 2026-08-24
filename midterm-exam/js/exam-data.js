/* ===================== MIDTERM EXAM — shared course data + renderers =====================
   Loaded by the hub page (midterm-exam/index.html) and by each course's own
   detail page (midterm-exam/{mice,wellness,communication}/index.html), so
   the exam content is written once and never drifts between pages.

   English for MICE and English for Wellness Tourism share the same exam
   shape (group interview + individual reflection + listening test), so one
   render function covers both. English for Communication is structurally
   different (no interview, no group, no video -- a 2-hour listening +
   written communication exam instead), so it gets its own data shape and
   its own render function. */

/* MIDTERM_EXAM_LOCKED itself lives in /js/exam-lock.js (loaded before this
   file) since the Quiz Hub also needs to read it, without pulling in all
   the course data below just for one boolean. */
function renderExamLockedNotice(){
  return `
    <div class="exam-locked-notice">
      ${icon('lock', {size:28})}
      <h2>This exam is not open yet.</h2>
      <p>Please check back later, or ask your teacher when it opens.</p>
    </div>`;
}

const INTERVIEW_COURSES = [
  {
    id:'mice', anchor:'mice', name:'English for MICE', tag:'Real MICE Industry Interview + Listening',
    subtitle:'MICE Industry Interview',
    intro:'Students will work in groups of 4 and interview a real person who has experience working in the MICE industry.',
    interviewees:['Event Coordinator','Event Organizer','Event Staff','Conference Staff','Exhibition Staff','Convention Centre Staff','Hotel Event Staff','Wedding or Event Planner','Another professional who works with MICE events'],
    intervieweeNote:'The interviewee does not need this exact job title. What matters is real work experience in events or the MICE industry.',
    groupIntro:'Your group does one interview together. Speak English with the interviewee as much as you reasonably can.',
    groupPurpose:['listening','asking questions','understanding real workplace English','speaking','professional communication'],
    checklistTitle:'Information You Must Collect',
    checklistIntro:'Use these points to prepare your own natural questions. This is not a script to read aloud.',
    checklist:[
      {label:'About the Professional', items:['Name','Job position','Company or organization','Years of experience']},
      {label:'About the Job', items:['Main responsibilities','Types of events they work with','What a normal working day is like']},
      {label:'Communication', items:['Who they communicate with','How English is used at work','Important communication skills']},
      {label:'Challenges', items:['A common problem during an event','How they handle the problem']},
      {label:'Advice', items:['Important skills for students','Advice for students who want to work in MICE']}
    ],
    reflectionQs:['What did you learn from the MICE professional?','What was the most interesting part of the interview?','What communication skill did you notice?','What MICE skill would you like to improve?','What advice from the professional was most useful?','How can this experience help your future career?'],
    listeningTopics:['event registration','event schedules','meeting arrangements','venues','event services','guest communication','directions','event problems','customer service','MICE terminology'],
    assessment:{
      group:['Interview preparation','Quality and completeness of information','Appropriate MICE content','Use of English','Organization and presentation','Teamwork'],
      individual:['Individual reflection','Individual participation','Understanding of the interview']
    },
    beforeExamDay:['Form a group of 4','Find a suitable MICE professional','Ask for permission to interview and record','Prepare your own natural interview questions','Conduct the interview','Record the interview','Check that the video plays correctly','Keep the video ready for your presentation','Review MICE vocabulary and communication topics']
  },
  {
    id:'wellness', anchor:'wellness', name:'English for Wellness Tourism', tag:'Real Wellness Professional Interview + Listening',
    subtitle:'Wellness Professional Interview',
    intro:'Students will work in groups of 4 and interview a real person who works in a wellness-related workplace.',
    interviewees:['Wellness Resort Staff','Spa Staff','Wellness Therapist','Wellness Centre Staff','Hotel Wellness Department Staff','Yoga or Wellness Centre Staff','Wellness Tourism Professional','Another professional who works in wellness tourism'],
    intervieweeNote:'The interviewee does not need this exact job title. What matters is real work experience in a wellness-related business.',
    groupIntro:'Your group does one interview together. Speak English with the interviewee as much as you reasonably can.',
    groupPurpose:['listening','asking questions','understanding real workplace English','speaking','professional communication'],
    checklistTitle:'Information You Must Collect',
    checklistIntro:'Use these points to prepare your own natural questions. This is not a script to read aloud.',
    checklist:[
      {label:'About the Professional', items:['Name','Job position','Workplace','Years of experience']},
      {label:'About the Job', items:['Main responsibilities','Wellness services provided','Typical guests or customers','Typical working day']},
      {label:'Communication', items:['How they communicate with guests','Common guest questions','How English is used at work']},
      {label:'Customer Service', items:['Common guest problems','How they handle difficult situations','What makes good wellness service']},
      {label:'Advice', items:['Important skills for students','English skills needed','Advice for students who want to work in wellness tourism']}
    ],
    reflectionQs:['What did you learn from the wellness professional?','What did you find most interesting?','What communication skills did you observe?','What did you learn about working with wellness guests?','What skill would you like to improve?','What advice was most useful to you?'],
    listeningTopics:['welcoming guests','wellness services','guest needs','customer service','handling complaints','giving directions','guiding guests','wellness activities','reservations','appointments','cancellations','professional communication'],
    assessment:{
      group:['Interview preparation','Relevant information obtained','Appropriate wellness tourism content','Use of English','Organization and presentation','Teamwork'],
      individual:['Individual reflection','Individual participation','Understanding of the interview']
    },
    beforeExamDay:['Form a group of 4','Find a suitable wellness professional','Ask for permission to interview and record','Prepare your own natural interview questions','Conduct the interview','Record the interview','Check that the video plays correctly','Keep the video ready for your presentation','Review Wellness Tourism vocabulary and communication topics']
  }
];

const EFC_COURSE = {
  id:'communication', anchor:'communication', name:'English for Communication', tag:'Listening + Written Communication',
  subtitle:'Listening and Written Communication',
  intro:'This exam takes about 2 hours. It has two parts: an individual listening test and a written communication task. There is no individual speaking presentation, so the exam stays manageable in the time available.',
  listeningTopics:['meeting someone','introducing yourself','asking for information','making requests','making arrangements','asking for clarification','giving directions','making plans','expressing an opinion','agreeing or disagreeing','responding to a problem','everyday conversations'],
  writingIntro:'You will respond in writing to real communication situations. This checks whether you can use the language from class, not whether you can remember a definition.',
  writingSituations:[
    'You meet a new classmate for the first time. What do you say?',
    'You need to ask someone for information. Write an appropriate response.',
    'You need to make plans with a friend. Write a short conversation.',
    'You have a problem and need to explain it politely.'
  ],
  timing:[
    ['0:00 to 0:10','Instructions and preparation'],
    ['0:10 to 0:35','Listening test, 10 questions'],
    ['0:35 to 1:25','Written communication task'],
    ['1:25 to 1:50','Final written reflection'],
    ['1:50 to 2:00','Collection and checking']
  ],
  timingNote:'These times are a guide, not a strict rule. Your teacher may adjust them on the day.',
  assessment:{
    listening:'10-item individual listening test',
    writing:['Appropriate response to each situation','Use of language from class','Clarity of communication','Grammar and vocabulary']
  },
  beforeExamDay:['Review course vocabulary','Review communication functions','Review listening activities','Review common expressions','Prepare for the 10-question listening test','Review written communication situations']
};

const ALL_MIDTERM_COURSES = [...INTERVIEW_COURSES, EFC_COURSE];

/* ===== Full detail-page body for an interview-based course (MICE, Wellness) =====
   Returns everything that goes inside <main>, starting with the standard
   section-eyebrow/title/sub header used by every other detail page on the
   site (see assignment-detail.css). No accordion wrapper -- this is the
   whole page, so there's no height cap to run into. */
function renderInterviewCourseDetail(c){
  const checklistHTML = c.checklist.map((group, i) => `
    <div class="checklist-group">
      <div class="checklist-group-label">${String.fromCharCode(65 + i)}. ${group.label}</div>
      <ul class="check-list" style="margin-top:8px;">${group.items.map(it => `<li>${it}</li>`).join('')}</ul>
    </div>
  `).join('');

  return `
    <div class="section-eyebrow">MIDTERM EXAM &middot; ${c.name.toUpperCase()}</div>
    <h1 class="section-title">${c.name}</h1>
    <p class="section-sub">${c.subtitle}</p>

    <p style="color:var(--ink);font-size:15px;line-height:1.65;margin-top:16px;max-width:70ch;">${c.intro}</p>
    <div class="group-size-badge">${icon('user', {size:14})} 4 students per group</div>

    <div class="exam-block">
      <h3>Who Can You Interview?</h3>
      <ul class="do-list">${c.interviewees.map(x => `<li>${x}</li>`).join('')}</ul>
      <p class="exam-block-hint">${c.intervieweeNote}</p>
    </div>

    <div class="exam-block">
      <h3>Your Group</h3>
      <p>${c.groupIntro}</p>
      <p class="exam-block-hint">This task practices: ${c.groupPurpose.join(', ')}.</p>
    </div>

    <div class="exam-block">
      <h3>${c.checklistTitle}</h3>
      <p class="exam-block-hint" style="margin-top:0;">${c.checklistIntro}</p>
      ${checklistHTML}
    </div>

    <div class="exam-block">
      <h3>Record Your Interview</h3>
      <div class="callout">
        <p><b>Keep your interview video.</b> Bring it for your group presentation during the exam.</p>
        <p>Recommended length: about 5 to 10 minutes.</p>
        <p>Please do not send your interview video to the class OpenChat.</p>
        <p>Ask the interviewee for permission before you record.</p>
      </div>
    </div>

    <div class="exam-block">
      <h3>Individual Reflection</h3>
      <p>Each group member will get an individual reflection sheet on the day of the exam. You do not need to prepare or submit anything online before then. Each student answers on their own.</p>
      <p class="exam-block-hint" style="margin-top:12px;">Suggested areas the reflection may cover:</p>
      <ol class="flow-list">${c.reflectionQs.map(q => `<li>${q}</li>`).join('')}</ol>
    </div>

    <div class="exam-block">
      <h3>Listening Test</h3>
      <p>10 questions. This is an individual test.</p>
      <p class="exam-block-hint" style="margin-top:0;">TOEIC-inspired workplace listening format. The content is related to topics from your course.</p>
      <div class="topic-chip-row">${c.listeningTopics.map(t => `<span class="topic-chip">${t}</span>`).join('')}</div>
    </div>

    <div class="exam-block">
      <h3>What You Will Be Assessed On</h3>
      <p class="exam-block-hint" style="margin-top:0;">Assessment criteria, not a percentage breakdown.</p>
      <div class="rubric-row"><div><div class="lbl">Group component</div><div class="sub">${c.assessment.group.join(', ')}</div></div></div>
      <div class="rubric-row"><div><div class="lbl">Individual component</div><div class="sub">${c.assessment.individual.join(', ')}</div></div></div>
      <div class="rubric-row"><div><div class="lbl">Listening</div><div class="sub">10-item individual listening test</div></div></div>
    </div>

    <div class="exam-block">
      <h3>Before Exam Day</h3>
      <ul class="check-list">${c.beforeExamDay.map(x => `<li>${x}</li>`).join('')}</ul>
    </div>
  `;
}

/* ===== Full detail-page body for English for Communication ===== */
function renderEFCCourseDetail(c){
  return `
    <div class="section-eyebrow">MIDTERM EXAM &middot; ${c.name.toUpperCase()}</div>
    <h1 class="section-title">${c.name}</h1>
    <p class="section-sub">${c.subtitle}</p>

    <p style="color:var(--ink);font-size:15px;line-height:1.65;margin-top:16px;max-width:70ch;">${c.intro}</p>

    <div class="exam-block">
      <h3>Part 1: Listening Test</h3>
      <p>10 questions. This is an individual test.</p>
      <p class="exam-block-hint" style="margin-top:0;">TOEIC-inspired listening format, based on the communication skills and topics from your course.</p>
      <div class="topic-chip-row">${c.listeningTopics.map(t => `<span class="topic-chip">${t}</span>`).join('')}</div>
    </div>

    <div class="exam-block">
      <h3>Part 2: Written Communication</h3>
      <p>${c.writingIntro}</p>
      <div class="phrase-list" style="margin-top:14px;">
        ${c.writingSituations.map((s, i) => `<div class="phrase-card"><span class="txt">${i + 1}. ${s}</span></div>`).join('')}
      </div>
    </div>

    <div class="exam-block">
      <h3>Exam Schedule</h3>
      <ol class="flow-list">${c.timing.map(([t, label]) => `<li><b style="color:var(--navy);">${t}</b> &middot; ${label}</li>`).join('')}</ol>
      <p class="exam-block-hint">${c.timingNote}</p>
    </div>

    <div class="exam-block">
      <h3>What You Will Be Assessed On</h3>
      <p class="exam-block-hint" style="margin-top:0;">Assessment criteria, not a percentage breakdown.</p>
      <div class="rubric-row"><div><div class="lbl">Listening</div><div class="sub">${c.assessment.listening}</div></div></div>
      <div class="rubric-row"><div><div class="lbl">Written communication</div><div class="sub">${c.assessment.writing.join(', ')}</div></div></div>
    </div>

    <div class="exam-block">
      <h3>Before Exam Day</h3>
      <ul class="check-list">${c.beforeExamDay.map(x => `<li>${x}</li>`).join('')}</ul>
    </div>
  `;
}
