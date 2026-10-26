/* ===================== TEACHER DASHBOARD — router + renderers =====================
   Phase 1: sign-in gate, dashboard shell, course -> group -> student
   navigation, basic student profile (nickname + notes editable), global
   search. Phase 2 (this update): Assessment Management, score entry with an
   explicit Not Yet Graded / Graded / Excused status, auto-computed grades,
   attendance (bulk "take attendance" for a whole group + per-student
   history), the Group Summary Tracker, and a dashboard "Needs Attention"
   list. Same hash-driven single-page pattern as Phase 1, extended with two
   new route shapes (assessments, attendance) rather than redesigned. */

let ROSTER = null;
let SESSION = null;
let ACTIVE_TERM = null;
let ALL_TERMS = [];
let assessmentFormEditingId = null; // set while the Add Assessment form is editing an existing one

function el(id){ return document.getElementById(id); }
function todayISO(){ return new Date().toISOString().slice(0, 10); }
function fmtDate(iso){ return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }); }
function timeAgo(iso){
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if(mins < 1) return 'just now';
  if(mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if(hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if(days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

/* ===================== CSV EXPORT (Phase 5) ===================== */
function csvEscape(v){
  if(v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function downloadCSV(filename, rows){
  const csv = rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function genderIcon(gender, size){
  return icon(gender === 'M' ? 'userMale' : 'userFemale', { size: size || 20, className: 'avatar-icon avatar-' + (gender === 'M' ? 'male' : 'female') });
}

function evidenceTypeIcon(mime){
  mime = mime || '';
  const name = mime.startsWith('video/') ? 'play' : mime.startsWith('audio/') ? 'headphones' : 'file';
  return icon(name, { size: 16, className: 'icon-inline' });
}
function fmtBytes(n){
  if(!n) return '0 KB';
  if(n < 1024*1024) return Math.round(n/1024) + ' KB';
  return (n / (1024*1024)).toFixed(1) + ' MB';
}

// Plain inline SVG, no charting library — a handful of rubric-graded tasks
// per student doesn't need one. Plots total score % per task, oldest first.
function buildSpeakingChartSVG(rows){
  const W = 560, H = 170, padL = 34, padR = 14, padT = 12, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const xFor = (i) => rows.length > 1 ? padL + (plotW * i) / (rows.length - 1) : padL + plotW / 2;
  const yFor = (pct) => padT + plotH - (plotH * Math.max(0, Math.min(100, pct))) / 100;
  const gridLines = [0, 25, 50, 75, 100].map(v => `
    <line x1="${padL}" y1="${yFor(v)}" x2="${W - padR}" y2="${yFor(v)}" stroke="var(--line)" stroke-width="1"/>
    <text x="${padL - 8}" y="${yFor(v) + 3}" font-size="9" fill="var(--muted)" text-anchor="end">${v}</text>
  `).join('');
  const points = rows.map((r, i) => ({ x: xFor(i), y: yFor(r.pct), r }));
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
  const dots = points.map(p => `
    <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--teal)"/>
    <text x="${p.x}" y="${p.y - 10}" font-size="10" fill="var(--ink)" text-anchor="middle" font-weight="600">${Math.round(p.r.pct)}%</text>
    <text x="${p.x}" y="${H - 8}" font-size="9" fill="var(--muted)" text-anchor="middle">${p.r.week ? 'Wk ' + p.r.week : ''}</text>
  `).join('');
  return `
    <svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;">
      ${gridLines}
      <polyline points="${polyline}" fill="none" stroke="var(--teal)" stroke-width="2"/>
      ${dots}
    </svg>
  `;
}

function statusPill(status){
  const cls = {
    'On Track': 'pill-good', 'Needs Attention': 'pill-bad', 'Missing Work': 'pill-warn',
    'No Data Yet': 'pill-neutral', 'complete': 'pill-good', 'in-progress': 'pill-warn', 'not-started': 'pill-neutral'
  }[status] || 'pill-neutral';
  return `<span class="pill ${cls}">${status}</span>`;
}
// Separate from statusPill on purpose: a hard absence-count policy (3
// warning, 4+ over the limit) independent of the attendance % that already
// feeds "Needs Attention" — a long term can keep that percentage looking
// fine while a student has still burned through their real allowed
// absences. Empty string when neither threshold is hit, so callers can
// always append it inline without a conditional.
function absencePill(student){
  const { absences, level } = computeAbsenceFlag(student);
  if(!level) return '';
  const label = level === 'exceeded' ? `${absences} Absences — Over Limit` : `${absences} Absences — Warning`;
  return ` <span class="pill ${level === 'exceeded' ? 'pill-bad' : 'pill-warn'}">${label}</span>`;
}

function parseHash(){
  // #/course/:courseId
  // #/course/:courseId/assessments
  // #/course/:courseId/group/:groupId
  // #/course/:courseId/group/:groupId/student/:studentId
  // #/course/:courseId/group/:groupId/attendance/:date?
  const parts = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
  const route = { view: 'dashboard' };
  if(parts[0] === 'course' && parts[1]){
    route.view = 'course'; route.courseId = parts[1];
    if(parts[2] === 'assessments'){
      route.view = 'assessments';
    } else if(parts[2] === 'clo'){
      route.view = 'clo';
    } else if(parts[2] === 'report'){
      route.view = 'courseReport';
    } else if(parts[2] === 'settings'){
      route.view = 'settings';
    } else if(parts[2] === 'group' && parts[3]){
      route.view = 'group'; route.groupId = parts[3];
      if(parts[4] === 'student' && parts[5]){
        route.view = 'student'; route.studentId = parts[5];
        if(parts[6] === 'report'){ route.view = 'studentReport'; }
      } else if(parts[4] === 'attendance'){
        route.view = 'attendance'; route.date = parts[5] ? decodeURIComponent(parts[5]) : todayISO();
      } else if(parts[4] === 'team' && parts[5]){
        route.view = 'team'; route.assessmentId = parts[5];
      }
    }
  } else if(parts[0] === 'search'){
    route.view = 'search'; route.q = decodeURIComponent(parts[1] || '');
  } else if(parts[0] === 'new-term'){
    route.view = 'newTerm';
  } else if(parts[0] === 'deadlines'){
    route.view = 'deadlines';
  } else if(parts[0] === 'makeup-quiz'){
    route.view = 'makeupQuiz'; route.quiz = parts[1] === 'wellness' ? 'wellness' : 'mice';
  } else if(parts[0] === 'unit-activity'){
    route.view = 'unitActivity';
  } else if(parts[0] === 'makeup-results'){
    route.view = 'makeupResults'; route.quiz = parts[1] === 'wellness' ? 'wellness' : 'mice';
  }
  return route;
}

function findCourse(courseId){ return ROSTER.courses.find(c => c.courseId === courseId); }
function findGroup(courseId, groupId){ const c = findCourse(courseId); return c && c.groups.find(g => g.groupId === groupId); }
function findStudent(courseId, groupId, studentId){ const g = findGroup(courseId, groupId); return g && g.students.find(s => s.studentId === studentId); }
function categoryFor(course, categoryId){ return (course.categories || []).find(c => c.id === categoryId); }

/* ===================== SIGN-IN ===================== */
function renderSignIn(){
  const modeNote = TeacherBackend.mode === 'local'
    ? `<div class="demo-banner">${icon('info',{size:16})} <b>Local Demo Mode.</b> Firebase isn't configured yet (see teacher/js/teacher-firebase-config.js), so this sign-in is a name field only — not a real password check — and everything you enter is stored in this browser only. Fine for testing the dashboard; do not enter real sensitive student data until Firebase is connected.</div>`
    : `<div class="demo-banner demo-banner--live">${icon('check',{size:16})} Connected to Firebase. Sign in with your authorized account.</div>`;

  el('app').innerHTML = `
    <div class="signin-shell">
      <div class="signin-card">
        <div class="signin-badge">ELH</div>
        <h1>Teacher Dashboard</h1>
        <p class="signin-sub">Private area for MA. Cristina Julaton. Not part of the student-facing site.</p>
        ${modeNote}
        <form id="signinForm" class="signin-form">
          ${TeacherBackend.mode === 'local' ? `
            <label>Your name<input type="text" id="signinName" placeholder="e.g. Ajarn Tina" required></label>
          ` : `
            <label>Email<input type="email" id="signinEmail" required></label>
            <label>Password<input type="password" id="signinPassword" required></label>
          `}
          <button type="submit" class="btn-primary">Sign in</button>
          <div id="signinError" class="signin-error" hidden></div>
        </form>
      </div>
    </div>
  `;

  el('signinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = el('signinError');
    errEl.hidden = true;
    try{
      if(TeacherBackend.mode === 'local'){
        SESSION = await TeacherBackend.signIn(el('signinName').value.trim());
      } else {
        SESSION = await TeacherBackend.signIn(el('signinEmail').value.trim(), el('signinPassword').value);
      }
      await boot();
    } catch(err){
      errEl.textContent = err.message || 'Sign-in failed.';
      errEl.hidden = false;
    }
  });
}

/* ===================== TOPBAR ===================== */
function termKey(t){ return t.academicYear + '|' + t.semester; }

function renderTopbar(){
  const termOptions = ALL_TERMS.map(t => `<option value="${termKey(t)}" ${ACTIVE_TERM && termKey(t)===termKey(ACTIVE_TERM) ? 'selected' : ''}>${t.label}</option>`).join('');
  return `
    <div class="teacher-topbar">
      <a class="teacher-brand" href="#/">${icon('clipboard',{size:18})} Teacher Dashboard</a>
      <a class="teacher-hub-link" href="../index.html">${icon('home',{size:14})} Learning Hub</a>
      <details class="teacher-menu" id="toolsMenu">
        <summary class="teacher-hub-link">${icon('clipboard',{size:14})} Class tools <span class="chev" aria-hidden="true">&#9662;</span></summary>
        <div class="teacher-menu-panel">
          <div class="tm-group">Assignments</div>
          <a class="tm-item${/^#\/deadlines/.test(location.hash) ? ' on' : ''}" href="#/deadlines"><b>Deadlines</b><span>Change due dates students see</span></a>
          <div class="tm-group">Student work</div>
          <a class="tm-item${/^#\/unit-activity/.test(location.hash) ? ' on' : ''}" href="#/unit-activity"><b>Unit Activity</b><span>Who finished what in each unit</span></a>
          <div class="tm-group">Make-up quizzes</div>
          <a class="tm-item${/^#\/makeup-quiz/.test(location.hash) ? ' on' : ''}" href="#/makeup-quiz"><b>Open, close, and codes</b><span>MICE and Wellness quizzes</span></a>
          <a class="tm-item${/^#\/makeup-results/.test(location.hash) ? ' on' : ''}" href="#/makeup-results"><b>Quiz Results</b><span>Mark and release results</span></a>
          <div class="tm-foot">Signed in as ${SESSION ? escHtml(SESSION.name) : ''}</div>
        </div>
      </details>
      <form id="globalSearchForm" class="teacher-search">
        <input type="search" id="globalSearchInput" placeholder="Search name, nickname, or student ID">
      </form>
      <div class="teacher-topbar-right">
        <select id="termSwitcher" class="term-switcher" title="Switch academic term">${termOptions}</select>
        ${TeacherBackend.mode === 'local' ? '<span class="mode-pill">Local Demo Mode</span>' : '<span class="mode-pill mode-pill--live">Live</span>'}
        <button id="signOutBtn" class="btn-ghost" title="${SESSION ? escHtml(SESSION.name) : ''}">Sign out</button>
      </div>
    </div>
  `;
}

function wireTopbar(){
  const tools = document.getElementById('toolsMenu');
  if(tools) tools.addEventListener('click', e => { if(e.target.closest('.tm-item')) tools.open = false; });
  if(!window.__toolsMenuWired){   // page-wide listeners are added only once, however often the top bar is drawn
    window.__toolsMenuWired = true;
    document.addEventListener('click', e => { const t = document.getElementById('toolsMenu'); if(t && t.open && !t.contains(e.target)) t.open = false; });
    document.addEventListener('keydown', e => { const t = document.getElementById('toolsMenu'); if(e.key === 'Escape' && t) t.open = false; });
  }
  el('signOutBtn').addEventListener('click', async () => {
    await TeacherBackend.signOutTeacher();
    SESSION = null;
    location.hash = '';
    renderSignIn();
  });
  el('globalSearchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = el('globalSearchInput').value.trim();
    if(q) location.hash = '#/search/' + encodeURIComponent(q);
  });
  el('termSwitcher').addEventListener('change', async (e) => {
    const [academicYear, semester] = e.target.value.split('|');
    await TeacherBackend.setActiveTerm(academicYear, semester);
    ACTIVE_TERM = { academicYear, semester };
    ROSTER = await TeacherBackend.getRoster();
    location.hash = '#/';
    renderRoute();
  });
}

/* ===================== DASHBOARD ===================== */
function renderDashboard(){
  const courseCount = ROSTER.courses.length;
  const groupCount = ROSTER.courses.reduce((n, c) => n + c.groups.length, 0);
  const studentCount = ROSTER.courses.reduce((n, c) => n + c.groups.reduce((m, g) => m + g.students.length, 0), 0);

  const courseCards = ROSTER.courses.map(course => {
    const groups = course.groups.length;
    const students = course.groups.reduce((n, g) => n + g.students.length, 0);
    return `
      <a class="course-card" href="#/course/${course.courseId}">
        <div class="course-card-name">${course.courseName}</div>
        <div class="course-card-code">${course.courseCode}</div>
        <div class="course-card-stats">${groups} group${groups===1?'':'s'} &middot; ${students} student${students===1?'':'s'}</div>
      </a>
    `;
  }).join('');

  // "Students Needing Attention" — computed live from grades + attendance,
  // never a manually maintained list.
  const attention = [];
  ROSTER.courses.forEach(course => {
    course.groups.forEach(group => {
      group.students.forEach(s => {
        const status = computeStudentStatus(course, s);
        if(status === 'Needs Attention' || status === 'Missing Work' || computeAbsenceFlag(s).level === 'exceeded'){
          attention.push({ course, group, student: s, status });
        }
      });
    });
  });
  const attentionRows = attention.slice(0, 8).map(r => `
    <a class="attention-row" href="#/course/${r.course.courseId}/group/${r.group.groupId}/student/${r.student.studentId}">
      ${genderIcon(r.student.gender, 18)}
      <span class="attention-name">${r.student.name}</span>
      <span class="attention-course">${r.course.courseName} &middot; Group ${r.group.groupId}</span>
      ${statusPill(r.status)}${absencePill(r.student)}
    </a>
  `).join('') || '<p class="empty-note">No one flagged yet — grades and attendance are computed as you enter them.</p>';

  const scoresEntered = countScoresEntered(ROSTER);
  const avgAttendance = averageAttendancePct(ROSTER);
  const activityIcon = { score: 'clipboard', attendance: 'check', evidence: 'file' };
  const activityVerb = { score: 'Score', attendance: 'Attendance', evidence: 'Evidence' };
  const recentActivity = computeRecentActivity(ROSTER, 8);
  const activityRows = recentActivity.map(ev => `
    <a class="attention-row" href="#/course/${ev.courseId}/group/${ev.groupId}/student/${ev.studentId}">
      ${icon(activityIcon[ev.type], { size: 16, className: 'icon-inline' })}
      <span class="attention-name">${ev.studentName}</span>
      <span class="attention-course">${ev.detail} &middot; ${ev.courseName}</span>
      <span class="field-hint">${timeAgo(ev.time)}</span>
    </a>
  `).join('') || '<p class="empty-note">Nothing recorded yet in this term.</p>';

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <div class="course-actions" style="justify-content:space-between;">
        <h1 style="margin:0;">My Teaching Overview</h1>
        <a class="btn-ghost btn-small" href="#/new-term">${icon('rotateCcw',{size:14})} Start New Semester</a>
      </div>
      <div class="course-meta">${(() => { const t = ALL_TERMS.find(x => ACTIVE_TERM && termKey(x)===termKey(ACTIVE_TERM)); return t ? t.label : ''; })()}</div>
      <div class="overview-stats">
        <div class="stat-box"><b>${courseCount}</b><span>Courses</span></div>
        <div class="stat-box"><b>${groupCount}</b><span>Groups</span></div>
        <div class="stat-box"><b>${studentCount}</b><span>Students</span></div>
        <div class="stat-box"><b>${attention.length}</b><span>Need Attention</span></div>
        <div class="stat-box"><b>${scoresEntered}</b><span>Assessments Completed</span></div>
        <div class="stat-box"><b>${avgAttendance === null ? '—' : avgAttendance + '%'}</b><span>Average Attendance</span></div>
      </div>
      <h2 class="section-heading">Courses</h2>
      <div class="course-grid">${courseCards}</div>

      <h2 class="section-heading">Students Needing Attention</h2>
      <div class="attention-list">${attentionRows}</div>
      ${attention.length > 8 ? `<p class="field-hint">Showing 8 of ${attention.length}. Open a course for the full group tracker.</p>` : ''}

      <h2 class="section-heading">Recent Activity</h2>
      <div class="attention-list">${activityRows}</div>
    </main>
  `;
  wireTopbar();
}

/* ===================== START NEW SEMESTER ===================== */
function renderNewTerm(){
  const currentLabel = (() => { const t = ALL_TERMS.find(x => ACTIVE_TERM && termKey(x)===termKey(ACTIVE_TERM)); return t ? t.label : 'the current term'; })();
  const suggestedYear = ACTIVE_TERM ? String(Number(ACTIVE_TERM.academicYear) + (ACTIVE_TERM.semester === '2' ? 1 : 0)) : '';
  const suggestedSem = ACTIVE_TERM && ACTIVE_TERM.semester === '1' ? '2' : '1';

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <span>Start New Semester</span></nav>
      <h1>Start New Semester</h1>
      <p class="field-hint">Creates a completely separate term — nothing in ${currentLabel} is touched. Every academic year/semester gets its own storage, so old grades, attendance, and evidence stay exactly as they are.</p>

      <form id="newTermForm" class="assessment-form">
        <label>Academic Year
          <input type="text" id="newTermYear" value="${suggestedYear}" placeholder="e.g. 2027" required>
        </label>
        <label>Semester
          <select id="newTermSemester">
            <option value="1" ${suggestedSem==='1'?'selected':''}>1</option>
            <option value="2" ${suggestedSem==='2'?'selected':''}>2</option>
            <option value="3">3 (Summer)</option>
          </select>
        </label>
        <label style="grid-column:1/-1;">Label
          <input type="text" id="newTermLabel" placeholder="auto-filled, editable">
        </label>
        <fieldset class="clo-fieldset" style="grid-column:1/-1;">
          <legend>Starting point</legend>
          <label style="flex-direction:row;align-items:center;gap:8px;font-weight:400;margin-bottom:10px;">
            <input type="radio" name="newTermSource" value="clone" checked>
            Clone course/group/student structure from ${currentLabel} — same names, IDs, gender, and assessment definitions, but every grade, attendance record, and evidence file starts empty.
          </label>
          <label style="flex-direction:row;align-items:center;gap:8px;font-weight:400;">
            <input type="radio" name="newTermSource" value="blank">
            Start completely blank — just the 3 course shells (MICE, Wellness, EFC), no groups or students yet. Add them yourself under each course.
          </label>
        </fieldset>
        <div class="assessment-form-actions">
          <button type="submit" class="btn-primary" id="newTermSubmitBtn">Create Semester</button>
        </div>
        <div id="newTermError" class="signin-error" hidden></div>
      </form>
    </main>
  `;
  wireTopbar();

  const updateLabelPlaceholder = () => {
    const y = el('newTermYear').value.trim() || '____';
    const s = el('newTermSemester').value;
    el('newTermLabel').placeholder = `AY${y} / Semester ${s}`;
  };
  el('newTermYear').addEventListener('input', updateLabelPlaceholder);
  el('newTermSemester').addEventListener('change', updateLabelPlaceholder);
  updateLabelPlaceholder();

  el('newTermForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = el('newTermError');
    errEl.hidden = true;
    const academicYear = el('newTermYear').value.trim();
    const semester = el('newTermSemester').value;
    if(!/^\d{4}$/.test(academicYear)){ errEl.textContent = 'Enter a 4-digit academic year.'; errEl.hidden = false; return; }
    const label = el('newTermLabel').value.trim() || `AY${academicYear} / Semester ${semester}`;
    const cloneFromCurrent = document.querySelector('input[name="newTermSource"]:checked').value === 'clone';
    const btn = el('newTermSubmitBtn');
    btn.disabled = true; btn.textContent = 'Creating…';
    try{
      await TeacherBackend.createTerm({ academicYear, semester, label, cloneFromCurrent });
      ACTIVE_TERM = await TeacherBackend.getActiveTerm();
      ALL_TERMS = await TeacherBackend.listTerms();
      ROSTER = await TeacherBackend.getRoster();
      location.hash = '#/';
      renderRoute();
    } catch(err){
      btn.disabled = false; btn.textContent = 'Create Semester';
      errEl.textContent = err.message || 'Could not create that semester.';
      errEl.hidden = false;
    }
  });
}

/* ===================== COURSE (groups) ===================== */
function renderCourse(courseId){
  const course = findCourse(courseId);
  if(!course){ location.hash = '#/'; return; }

  const groupCards = course.groups.map(group => {
    const genders = group.students.reduce((acc, s) => { acc[s.gender] = (acc[s.gender]||0)+1; return acc; }, {});
    return `
      <a class="group-card" href="#/course/${course.courseId}/group/${group.groupId}">
        <div class="group-card-title">Group ${group.groupId}</div>
        <div class="group-card-schedule">${group.schedule}</div>
        <div class="group-card-stats">${group.students.length} students &middot; ${genders.F||0} F / ${genders.M||0} M</div>
      </a>
    `;
  }).join('');

  const weightTotal = courseAssessmentWeightTotal(course);
  const weightNote = weightTotal > 100
    ? `<div class="weight-banner weight-banner--warn">${icon('info',{size:14})} Assessment weights total ${weightTotal}% — exceeds 100%.</div>`
    : weightTotal < 100
      ? `<div class="weight-banner">${weightTotal}% of 100% allocated so far &middot; ${(100-weightTotal).toFixed(1)}% not yet assigned to an assessment.</div>`
      : `<div class="weight-banner weight-banner--ok">${icon('check',{size:14})} Assessment weights total exactly 100%.</div>`;

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <span>${course.courseName}</span></nav>
      <h1>${course.courseName}</h1>
      <div class="course-meta">Course code ${course.courseCode} &middot; ${course.groups.length} group${course.groups.length===1?'':'s'}</div>

      <div class="course-actions">
        <a class="btn-ghost" href="#/course/${courseId}/assessments">${icon('clipboard',{size:14})} Manage Assessments (${(course.assessments||[]).length})</a>
        <a class="btn-ghost" href="#/course/${courseId}/clo">CLO Attainment</a>
        <a class="btn-ghost" href="#/course/${courseId}/report">Course Report</a>
        <a class="btn-ghost" href="#/course/${courseId}/settings">${icon('info',{size:14})} Assessment Settings</a>
      </div>
      ${weightNote}

      <h2 class="section-heading">Groups</h2>
      <div class="group-grid">${groupCards}</div>

      <h2 class="section-heading">Add Group</h2>
      <form id="addGroupForm" class="inline-edit-form" style="flex-wrap:wrap;">
        <input type="text" id="newGroupId" placeholder="Group ID, e.g. 5" required style="max-width:140px;">
        <input type="text" id="newGroupSchedule" placeholder="Schedule, e.g. Fri 13:30-17:30, Room 143">
        <button type="submit" class="btn-ghost btn-small">Add Group</button>
        <span id="addGroupError" class="signin-error" hidden></span>
      </form>
    </main>
  `;
  wireTopbar();
  el('addGroupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = el('addGroupError');
    errEl.hidden = true;
    const groupId = el('newGroupId').value.trim();
    if(!groupId){ errEl.textContent = 'Enter a group ID.'; errEl.hidden = false; return; }
    try{
      await TeacherBackend.addGroup(courseId, { groupId, schedule: el('newGroupSchedule').value.trim() });
      ROSTER = await TeacherBackend.getRoster();
      renderCourse(courseId);
    } catch(err){
      errEl.textContent = err.message || 'Could not add that group.';
      errEl.hidden = false;
    }
  });
}

/* ===================== ASSESSMENT MANAGEMENT ===================== */
function renderAssessments(courseId){
  const course = findCourse(courseId);
  if(!course){ location.hash = '#/'; return; }
  const config = TEACHER_COURSE_CONFIG[courseId];
  const weightTotal = courseAssessmentWeightTotal(course);

  const categoryOptions = course.categories.map(c => `<option value="${c.id}">${c.label} (weight budget ${c.weight}%)</option>`).join('');
  const rubricOptions = ['<option value="">No rubric</option>'].concat(
    config.rubrics.map(rid => `<option value="${rid}">${TEACHER_RUBRICS[rid].title}</option>`)
  ).join('');
  const cloChecks = config.clos.map(c => `
    <label class="clo-check"><input type="checkbox" name="clo" value="${c.id}"> ${c.id}</label>
  `).join('');
  const cloFieldset = `
    <div class="clo-fieldset-actions">
      <button type="button" class="btn-ghost btn-small" id="cloSelectAll">Select All</button>
      <button type="button" class="btn-ghost btn-small" id="cloClearAll">Clear All</button>
    </div>
    <div class="clo-check-grid">${cloChecks}</div>
  `;

  const rows = (course.assessments || []).slice().sort((a,b) => (a.week||'').localeCompare(b.week||'')).map(a => {
    const cat = categoryFor(course, a.categoryId);
    return `
      <tr>
        <td>${cat ? cat.label : a.categoryId}</td>
        <td>${a.title}</td>
        <td>${a.week || '—'}</td>
        <td>${a.maxScore}</td>
        <td>${a.weight}%</td>
        <td>${(a.clos||[]).join(', ') || '—'}</td>
        <td>${a.rubricId ? TEACHER_RUBRICS[a.rubricId].title : '—'}</td>
        <td class="table-actions">
          <button class="btn-ghost btn-small" data-edit="${a.id}">Edit</button>
          <button class="btn-ghost btn-small btn-danger" data-delete="${a.id}">Delete</button>
        </td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="8" class="empty-note">No assessments yet. Add the first one below.</td></tr>`;

  const weightNote = weightTotal > 100
    ? `<div class="weight-banner weight-banner--warn">${icon('info',{size:14})} Weights exceed 100% by ${(weightTotal-100).toFixed(1)} points. Grades will overweight this course until fixed.</div>`
    : weightTotal < 100
      ? `<div class="weight-banner">${weightTotal}% of 100% allocated &middot; ${(100-weightTotal).toFixed(1)}% still unassigned.</div>`
      : `<div class="weight-banner weight-banner--ok">${icon('check',{size:14})} Weights total exactly 100%.</div>`;

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <a href="#/course/${courseId}">${course.courseName}</a> <span>&rsaquo;</span> <span>Assessments</span></nav>
      <h1>Manage Assessments</h1>
      <div class="course-meta">${course.courseName}</div>
      ${weightNote}

      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Category</th><th>Assessment</th><th>Week</th><th>Max</th><th>Weight</th><th>CLOs</th><th>Rubric</th><th></th></tr></thead>
          <tbody id="assessmentRows">${rows}</tbody>
        </table>
      </div>

      <h2 class="section-heading" id="assessmentFormHeading">Add Assessment</h2>
      <form id="assessmentForm" class="assessment-form">
        <input type="hidden" id="asId">
        <label>Category
          <select id="asCategory" required>${categoryOptions}</select>
        </label>
        <label>Title
          <input type="text" id="asTitle" placeholder="e.g. Speaking Role Play 1" required>
        </label>
        <label>Week
          <input type="text" id="asWeek" placeholder="e.g. 4">
        </label>
        <label>Max score
          <input type="number" id="asMax" min="1" value="100" required>
        </label>
        <label>Weight (% of final grade)
          <input type="number" id="asWeight" min="0" max="100" step="0.5" value="5" required>
        </label>
        <label>Rubric
          <select id="asRubric">${rubricOptions}</select>
        </label>
        <fieldset class="clo-fieldset">
          <legend>CLOs</legend>
          ${cloFieldset}
        </fieldset>
        <div class="assessment-form-actions">
          <button type="submit" class="btn-primary" id="asSubmitBtn">Add Assessment</button>
          <button type="button" class="btn-ghost" id="asCancelBtn" hidden>Cancel edit</button>
        </div>
        <div id="assessmentFormError" class="signin-error" hidden></div>
      </form>
    </main>
  `;
  wireTopbar();

  el('assessmentRows').querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = course.assessments.find(x => x.id === btn.dataset.edit);
      if(!a) return;
      assessmentFormEditingId = a.id;
      el('asId').value = a.id;
      el('asCategory').value = a.categoryId;
      el('asTitle').value = a.title;
      el('asWeek').value = a.week || '';
      el('asMax').value = a.maxScore;
      el('asWeight').value = a.weight;
      el('asRubric').value = a.rubricId || '';
      el('assessmentForm').querySelectorAll('input[name="clo"]').forEach(cb => { cb.checked = (a.clos||[]).includes(cb.value); });
      el('assessmentFormHeading').textContent = 'Edit Assessment';
      el('asSubmitBtn').textContent = 'Save Changes';
      el('asCancelBtn').hidden = false;
      el('assessmentForm').scrollIntoView({ behavior:'smooth' });
    });
  });
  el('assessmentRows').querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if(!confirm('Delete this assessment? Any scores already entered for it will be removed too.')) return;
      await TeacherBackend.deleteAssessment(courseId, btn.dataset.delete);
      ROSTER = await TeacherBackend.getRoster();
      renderAssessments(courseId);
    });
  });
  el('asCancelBtn').addEventListener('click', () => renderAssessments(courseId));

  el('cloSelectAll').addEventListener('click', () => {
    el('assessmentForm').querySelectorAll('input[name="clo"]').forEach(cb => { cb.checked = true; });
  });
  el('cloClearAll').addEventListener('click', () => {
    el('assessmentForm').querySelectorAll('input[name="clo"]').forEach(cb => { cb.checked = false; });
  });

  el('assessmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = el('assessmentFormError');
    errEl.hidden = true;
    const maxScore = Number(el('asMax').value);
    const weight = Number(el('asWeight').value);
    if(!(maxScore > 0)){ errEl.textContent = 'Max score must be greater than 0.'; errEl.hidden = false; return; }
    if(weight < 0 || weight > 100){ errEl.textContent = 'Weight must be between 0 and 100.'; errEl.hidden = false; return; }
    const clos = Array.from(el('assessmentForm').querySelectorAll('input[name="clo"]:checked')).map(cb => cb.value);
    const payload = {
      categoryId: el('asCategory').value,
      title: el('asTitle').value.trim(),
      week: el('asWeek').value.trim(),
      maxScore, weight,
      rubricId: el('asRubric').value || null,
      clos
    };
    if(assessmentFormEditingId){
      await TeacherBackend.updateAssessment(courseId, assessmentFormEditingId, payload);
    } else {
      await TeacherBackend.addAssessment(courseId, payload);
    }
    assessmentFormEditingId = null;
    ROSTER = await TeacherBackend.getRoster();
    renderAssessments(courseId);
  });
}

/* ===================== CLO ATTAINMENT (course-wide) ===================== */
function renderCLOAttainment(courseId){
  const course = findCourse(courseId);
  if(!course){ location.hash = '#/'; return; }
  const benchmark = TEACHER_COURSE_CONFIG[courseId].cloAttainmentBenchmark || { studentPct:70, scorePct:70, speakingMinRubric:3.0 };
  const rows = computeCourseCLOAttainment(course).map(r => `
    <tr>
      <td><b>${r.cloId}</b></td>
      <td>${r.text}</td>
      <td>${r.assessedCount} of ${ROSTER.courses.find(c=>c.courseId===courseId).groups.reduce((n,g)=>n+g.students.length,0)}</td>
      <td>${r.assessedCount > 0 ? `${r.metCount} of ${r.assessedCount}` : '—'}</td>
      <td>${fmtPct(r.attainmentPct)}</td>
      <td>${r.benchmarkMet === null ? '<span class="pill pill-neutral">Not enough data</span>' : (r.benchmarkMet ? '<span class="pill pill-good">Met</span>' : '<span class="pill pill-bad">Below target</span>')}</td>
    </tr>
  `).join('');

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <a href="#/course/${courseId}">${course.courseName}</a> <span>&rsaquo;</span> <span>CLO Attainment</span></nav>
      <h1>CLO Attainment</h1>
      <div class="course-meta">${course.courseName} &middot; across all ${course.groups.length} groups</div>
      <div class="course-actions"><button class="btn-ghost btn-small" id="exportCLOBtn">${icon('download',{size:14})} Export CLO Attainment CSV</button></div>
      <div class="weight-banner">Benchmark from the course document: at least ${benchmark.studentPct}% of assessed students must score &ge;${benchmark.scorePct}% on assessments linked to a CLO. For speaking CLOs specifically, the course document also expects a rubric level of &ge;${benchmark.speakingMinRubric}/4 ("Good") — worth checking by eye against the rubric-graded scores, since a raw score benchmark alone can't fully capture that.</div>

      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>CLO</th><th>Description</th><th>Students Assessed</th><th>&ge;${benchmark.scorePct}%</th><th>Attainment</th><th>Benchmark</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="field-hint">"Students Assessed" only counts students who already have at least one graded assessment linked to that CLO — students not yet graded on anything for a CLO are left out of the denominator rather than counted as not meeting it.</p>
    </main>
  `;
  wireTopbar();
  el('exportCLOBtn').addEventListener('click', () => exportCLOAttainmentCSV(courseId));
}

/* ===================== EXPORTS (course-level) ===================== */
function allCourseStudents(course){
  const out = [];
  course.groups.forEach(g => g.students.forEach(s => out.push({ s, group: g })));
  return out;
}

function exportStudentListCSV(courseId){
  const course = findCourse(courseId);
  const rows = [['Student ID', 'Official Name', 'Nickname', 'Gender', 'Group', 'GPAX']];
  allCourseStudents(course).forEach(({ s, group }) => {
    rows.push([s.studentId, `${s.title} ${s.name}`, s.nickname || '', s.gender === 'M' ? 'Male' : 'Female', group.groupId, s.gpax || '']);
  });
  downloadCSV(`${courseId}_student_list.csv`, rows);
}

// Reflects the grade-bearing layer: one overall score per assessment
// category, matching what computeStudentGrade actually computes — not the
// individual activity instances (see exportStudentRecordCSV for the
// activity-level evidence detail).
function exportGradebookCSV(courseId){
  const course = findCourse(courseId);
  const categories = course.categories || [];
  const showFinalIntegration = typeof course.finalWeightPct === 'number' && course.finalWeightPct < 100;
  const header = ['Student ID', 'Official Name', 'Nickname', 'Group'].concat(categories.map(c => `${c.label} (${c.weight}%)`)).concat(['Current Grade %', 'Letter Grade', 'Not Yet Graded %']);
  if(showFinalIntegration) header.push(`Final Grade Integration (/${course.finalWeightPct})`);
  const rows = [header];
  allCourseStudents(course).forEach(({ s, group }) => {
    const grade = computeStudentGrade(course, s);
    const row = [s.studentId, `${s.title} ${s.name}`, s.nickname || '', group.groupId];
    categories.forEach(cat => {
      const summary = computeCategoryScoreSummary(course, s, cat.id);
      if(summary.status === 'excused') row.push('Excused');
      else if(summary.score === null) row.push('Not Yet Graded');
      else row.push(summary.score);
    });
    row.push(grade.currentPct !== null ? Math.round(grade.currentPct * 10) / 10 : '');
    row.push(grade.letter ? grade.letter.grade : '');
    row.push(Math.round(grade.remainingWeight * 10) / 10);
    if(showFinalIntegration){
      const finalIntegration = computeFinalGradeIntegration(course, grade);
      row.push(finalIntegration && finalIntegration.integratedScore !== null ? finalIntegration.integratedScore : '');
    }
    rows.push(row);
  });
  downloadCSV(`${courseId}_gradebook.csv`, rows);
}

function exportCLOAttainmentCSV(courseId){
  const course = findCourse(courseId);
  const rows = [['CLO', 'Description', 'Students Assessed', 'Students Met Benchmark', 'Attainment %', 'Benchmark Met']];
  computeCourseCLOAttainment(course).forEach(r => {
    rows.push([r.cloId, r.text, r.assessedCount, r.metCount, r.attainmentPct !== null ? Math.round(r.attainmentPct * 10) / 10 : '', r.benchmarkMet === null ? 'Not enough data' : (r.benchmarkMet ? 'Yes' : 'No')]);
  });
  downloadCSV(`${courseId}_clo_attainment.csv`, rows);
}

function exportAttendanceCSV(courseId, groupId){
  const group = findGroup(courseId, groupId);
  const dateSet = new Set();
  group.students.forEach(s => (s.attendance || []).forEach(r => dateSet.add(r.date)));
  const dates = Array.from(dateSet).sort();
  const header = ['Student ID', 'Official Name', 'Nickname'].concat(dates).concat(['Attendance %']);
  const rows = [header];
  group.students.forEach(s => {
    const att = computeAttendanceStats(s);
    const row = [s.studentId, `${s.title} ${s.name}`, s.nickname || ''];
    dates.forEach(d => {
      const r = (s.attendance || []).find(x => x.date === d);
      row.push(r ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : '');
    });
    row.push(att.pct !== null ? att.pct : '');
    rows.push(row);
  });
  downloadCSV(`${courseId}_group${groupId}_attendance.csv`, rows);
}

function exportStudentRecordCSV(courseId, groupId, studentId){
  const course = findCourse(courseId);
  const student = findStudent(courseId, groupId, studentId);
  const grade = computeStudentGrade(course, student);
  const att = computeAttendanceStats(student);
  const finalIntegration = computeFinalGradeIntegration(course, grade);
  const rows = [
    ['Student Record', `${student.title} ${student.name}`],
    ['Nickname', student.nickname || ''],
    ['Student ID', student.studentId],
    ['Course', course.courseName],
    ['Group', groupId],
    ['Current Grade %', grade.currentPct !== null ? Math.round(grade.currentPct * 10) / 10 : 'Not yet graded'],
    ['Letter Grade', grade.letter ? grade.letter.grade : ''],
    ['Attendance %', att.pct !== null ? att.pct : 'No records']
  ];
  if(finalIntegration){
    rows.push([`Final Grade Integration (${finalIntegration.finalWeightPct}% of total)`, finalIntegration.integratedScore !== null ? `${finalIntegration.integratedScore} / ${finalIntegration.finalWeightPct}` : 'Not yet calculable']);
  }
  rows.push([], ['Assessment', 'Category', 'Week', 'Status', 'Score', 'Max Score']);
  (course.assessments || []).forEach(a => {
    const entry = (student.scores || {})[a.id] || { status: 'not-graded' };
    const cat = categoryFor(course, a.categoryId);
    rows.push([a.title, cat ? cat.label : '', a.week || '', entry.status, entry.status === 'graded' ? entry.score : '', a.maxScore]);
  });
  rows.push([]);
  rows.push(['Date', 'Attendance Status', 'Note']);
  (student.attendance || []).forEach(r => rows.push([r.date, r.status, r.note || '']));
  downloadCSV(`${student.studentId}_${student.name.replace(/\s+/g,'_')}_record.csv`, rows);
}

/* ===================== COURSE REPORT ===================== */
function renderCourseReport(courseId){
  const course = findCourse(courseId);
  if(!course){ location.hash = '#/'; return; }
  const students = allCourseStudents(course);

  const grades = students.map(({ s }) => computeStudentGrade(course, s));
  const gradedGrades = grades.filter(g => g.currentPct !== null);
  const classAverage = gradedGrades.length ? gradedGrades.reduce((sum, g) => sum + g.currentPct, 0) / gradedGrades.length : null;

  const assessmentAverages = (course.assessments || []).map(a => {
    const scores = [];
    students.forEach(({ s }) => {
      const entry = (s.scores || {})[a.id];
      if(entry && entry.status === 'graded' && typeof entry.score === 'number') scores.push(entry.score / a.maxScore * 100);
    });
    return { title: a.title, avg: scores.length ? scores.reduce((x, y) => x + y, 0) / scores.length : null, graded: scores.length, total: students.length };
  });

  const categoryPerformance = (course.categories || []).map(cat => {
    const pcts = [];
    students.forEach(({ s }) => {
      const summary = computeCategoryScoreSummary(course, s, cat.id);
      if(summary.pct !== null) pcts.push(summary.pct);
    });
    return { label: cat.label, weight: cat.weight, avg: pcts.length ? pcts.reduce((x, y) => x + y, 0) / pcts.length : null, graded: pcts.length, total: students.length };
  });

  const attStats = students.map(({ s }) => computeAttendanceStats(s));
  const attWithData = attStats.filter(a => a.pct !== null);
  const attAverage = attWithData.length ? attWithData.reduce((sum, a) => sum + a.pct, 0) / attWithData.length : null;

  const dist = {};
  course.gradeScale.forEach(g => { dist[g.grade] = 0; });
  gradedGrades.forEach(g => { dist[g.letter.grade]++; });
  const notYetGraded = grades.length - gradedGrades.length;

  const attention = students.filter(({ s }) => { const st = computeStudentStatus(course, s); return st === 'Needs Attention' || st === 'Missing Work' || computeAbsenceFlag(s).level === 'exceeded'; });
  const cloRows = computeCourseCLOAttainment(course);

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <a href="#/course/${courseId}">${course.courseName}</a> <span>&rsaquo;</span> <span>Course Report</span></nav>
      <h1>Course Report</h1>
      <div class="course-meta">${course.courseName} &middot; ${students.length} students across ${course.groups.length} groups</div>

      <div class="course-actions">
        <button class="btn-ghost btn-small" id="exportStudentListBtn">${icon('download',{size:14})} Student List CSV</button>
        <button class="btn-ghost btn-small" id="exportGradebookBtn">${icon('download',{size:14})} Gradebook CSV</button>
        <button class="btn-ghost btn-small" id="exportCLOBtn2">${icon('download',{size:14})} CLO Attainment CSV</button>
      </div>

      <div class="overview-stats">
        <div class="stat-box"><b>${fmtPct(classAverage)}</b><span>Class Average</span></div>
        <div class="stat-box"><b>${attAverage === null ? '—' : Math.round(attAverage) + '%'}</b><span>Avg Attendance</span></div>
        <div class="stat-box"><b>${notYetGraded}</b><span>Not Yet Graded</span></div>
        <div class="stat-box"><b>${attention.length}</b><span>Need Attention</span></div>
      </div>

      <h2 class="section-heading">Grade Distribution</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>${course.gradeScale.map(g => `<th>${g.grade}</th>`).join('')}<th>Not Yet Graded</th></tr></thead>
          <tbody><tr>${course.gradeScale.map(g => `<td>${dist[g.grade]}</td>`).join('')}<td>${notYetGraded}</td></tr></tbody>
        </table>
      </div>

      <h2 class="section-heading">Assessment Averages</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Assessment</th><th>Class Average</th><th>Graded</th></tr></thead>
          <tbody>${assessmentAverages.map(a => `<tr><td>${a.title}</td><td>${fmtPct(a.avg)}</td><td>${a.graded} of ${a.total}</td></tr>`).join('') || '<tr><td colspan="3" class="empty-note">No assessments yet.</td></tr>'}</tbody>
        </table>
      </div>

      <h2 class="section-heading">Assessment Category Performance</h2>
      <p class="field-hint">This is the grade-bearing view — the overall category score each teacher enters (see each student's Assessment Summary). Assessment Averages above breaks the same data down by individual activity for reference.</p>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Category</th><th>Weight</th><th>Class Average</th><th>Students Graded</th></tr></thead>
          <tbody>${categoryPerformance.map(c => `<tr><td>${c.label}</td><td>${c.weight}%</td><td>${fmtPct(c.avg)}</td><td>${c.graded} of ${c.total}</td></tr>`).join('') || '<tr><td colspan="4" class="empty-note">No assessment categories yet.</td></tr>'}</tbody>
        </table>
      </div>

      <h2 class="section-heading">CLO Attainment</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>CLO</th><th>Assessed</th><th>Attainment</th><th>Benchmark</th></tr></thead>
          <tbody>${cloRows.map(r => `<tr><td>${r.cloId}</td><td>${r.assessedCount}</td><td>${fmtPct(r.attainmentPct)}</td><td>${r.benchmarkMet === null ? '<span class="pill pill-neutral">Not enough data</span>' : (r.benchmarkMet ? '<span class="pill pill-good">Met</span>' : '<span class="pill pill-bad">Below target</span>')}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="field-hint"><a href="#/course/${courseId}/clo">Full CLO Attainment page &rsaquo;</a></p>

      <h2 class="section-heading">Students Needing Attention</h2>
      <div class="attention-list">
        ${attention.map(({ s, group }) => `
          <a class="attention-row" href="#/course/${courseId}/group/${group.groupId}/student/${s.studentId}">
            ${genderIcon(s.gender, 18)}
            <span class="attention-name">${s.name}</span>
            <span class="attention-course">Group ${group.groupId}</span>
            ${statusPill(computeStudentStatus(course, s))}${absencePill(s)}
          </a>
        `).join('') || '<p class="empty-note">No one flagged.</p>'}
      </div>
    </main>
  `;
  wireTopbar();
  el('exportStudentListBtn').addEventListener('click', () => exportStudentListCSV(courseId));
  el('exportGradebookBtn').addEventListener('click', () => exportGradebookCSV(courseId));
  el('exportCLOBtn2').addEventListener('click', () => exportCLOAttainmentCSV(courseId));
}

/* ===================== ASSESSMENT SETTINGS (Phase 7) ===================== */
function renderAssessmentSettings(courseId){
  const course = findCourse(courseId);
  if(!course){ location.hash = '#/'; return; }

  const categoryRows = course.categories.map(c => `
    <tr>
      <td>${c.label}<div class="field-hint">Weeks ${c.weeks} &middot; ${(c.clos||[]).join(', ')}</div></td>
      <td><input type="number" class="settings-weight" data-category="${c.id}" value="${c.weight}" min="0" max="100" step="0.5" style="max-width:100px;"> %</td>
    </tr>
  `).join('');

  const gradeRows = course.gradeScale.map((g, i) => `
    <tr>
      <td><input type="text" class="settings-grade-label" data-idx="${i}" value="${g.grade}" style="max-width:70px;"></td>
      <td><input type="text" class="settings-grade-meaning" data-idx="${i}" value="${g.meaning}"></td>
      <td><input type="number" class="settings-grade-min" data-idx="${i}" value="${g.min}" min="0" max="100" step="0.01"></td>
      <td><input type="number" class="settings-grade-max" data-idx="${i}" value="${g.max}" min="0" max="100" step="0.01"></td>
    </tr>
  `).join('');

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <a href="#/course/${courseId}">${course.courseName}</a> <span>&rsaquo;</span> <span>Assessment Settings</span></nav>
      <h1>Assessment Settings</h1>
      <div class="course-meta">${course.courseName} &middot; editing this term's own copy only — the official course-document defaults are never changed, so a future term can always start fresh from them.</div>

      <h2 class="section-heading">Category Weights</h2>
      <div id="categoryWeightBanner" class="weight-banner"></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Category</th><th>Weight</th></tr></thead>
          <tbody id="categoryRows">${categoryRows}</tbody>
        </table>
      </div>
      <div class="assessment-form-actions" style="margin:12px 0;">
        <button id="saveCategoriesBtn" class="btn-primary btn-small">Save Category Weights</button>
        <button id="resetCategoriesBtn" class="btn-ghost btn-small">Reset to Official Defaults</button>
        <span id="categoriesSaved" class="field-hint" hidden>Saved.</span>
      </div>
      <p class="field-hint">This is each category's overall budget — it's separate from the individual weight you give each assessment on the Manage Assessments page, so keep them in sync yourself if you want the two to match exactly.</p>

      <h2 class="section-heading">Grade Scale</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Grade</th><th>Meaning</th><th>Min %</th><th>Max %</th></tr></thead>
          <tbody id="gradeScaleRows">${gradeRows}</tbody>
        </table>
      </div>
      <div class="assessment-form-actions" style="margin:12px 0;">
        <button id="saveGradeScaleBtn" class="btn-primary btn-small">Save Grade Scale</button>
        <button id="resetGradeScaleBtn" class="btn-ghost btn-small">Reset to Official Defaults</button>
        <span id="gradeScaleError" class="signin-error" hidden></span>
        <span id="gradeScaleSaved" class="field-hint" hidden>Saved.</span>
      </div>

      <h2 class="section-heading">Final Grade Weight</h2>
      <p class="field-hint">For a course shared with a co-teacher (e.g. English for Communication, where a Thai teacher grades the other portion), set how much of the student's TOTAL final grade this course actually contributes. Leave at 100% for a standalone course where your grade IS the final grade.</p>
      <div class="assessment-form-actions" style="margin:12px 0; align-items:center;">
        <label style="display:flex; align-items:center; gap:8px;">
          This course is
          <input type="number" id="finalWeightInput" value="${typeof course.finalWeightPct === 'number' ? course.finalWeightPct : 100}" min="0" max="100" step="1" style="max-width:80px;">
          % of the student's total final grade.
        </label>
      </div>
      <div class="assessment-form-actions" style="margin:12px 0;">
        <button id="saveFinalWeightBtn" class="btn-primary btn-small">Save</button>
        <button id="resetFinalWeightBtn" class="btn-ghost btn-small">Reset to Official Default</button>
        <span id="finalWeightError" class="signin-error" hidden></span>
        <span id="finalWeightSaved" class="field-hint" hidden>Saved.</span>
      </div>
    </main>
  `;
  wireTopbar();

  function refreshCategoryBanner(){
    const total = Array.from(document.querySelectorAll('.settings-weight')).reduce((sum, inp) => sum + (Number(inp.value) || 0), 0);
    const banner = el('categoryWeightBanner');
    if(total > 100){ banner.className = 'weight-banner weight-banner--warn'; banner.textContent = `Category weights total ${total}% — exceeds 100%.`; }
    else if(total < 100){ banner.className = 'weight-banner'; banner.textContent = `${total}% of 100% allocated.`; }
    else { banner.className = 'weight-banner weight-banner--ok'; banner.textContent = 'Category weights total exactly 100%.'; }
  }
  refreshCategoryBanner();
  document.querySelectorAll('.settings-weight').forEach(inp => inp.addEventListener('input', refreshCategoryBanner));

  el('saveCategoriesBtn').addEventListener('click', async () => {
    const weights = {};
    document.querySelectorAll('.settings-weight').forEach(inp => { weights[inp.dataset.category] = Number(inp.value) || 0; });
    await TeacherBackend.updateCategoryWeights(courseId, weights);
    ROSTER = await TeacherBackend.getRoster();
    el('categoriesSaved').hidden = false;
    setTimeout(() => { el('categoriesSaved').hidden = true; }, 1800);
  });
  el('resetCategoriesBtn').addEventListener('click', async () => {
    if(!confirm('Reset category weights to the official course-document defaults for this term?')) return;
    const defaults = {};
    TEACHER_COURSE_CONFIG[courseId].categories.forEach(c => { defaults[c.id] = c.weight; });
    await TeacherBackend.updateCategoryWeights(courseId, defaults);
    ROSTER = await TeacherBackend.getRoster();
    renderAssessmentSettings(courseId);
  });

  el('saveGradeScaleBtn').addEventListener('click', async () => {
    const errEl = el('gradeScaleError');
    errEl.hidden = true;
    const count = document.querySelectorAll('.settings-grade-label').length;
    const rows = [];
    for(let i = 0; i < count; i++){
      const grade = document.querySelector(`.settings-grade-label[data-idx="${i}"]`).value.trim();
      const meaning = document.querySelector(`.settings-grade-meaning[data-idx="${i}"]`).value.trim();
      const min = Number(document.querySelector(`.settings-grade-min[data-idx="${i}"]`).value);
      const max = Number(document.querySelector(`.settings-grade-max[data-idx="${i}"]`).value);
      if(!grade || isNaN(min) || isNaN(max) || min > max){
        errEl.textContent = 'Every row needs a grade label, and Min must not be greater than Max.';
        errEl.hidden = false;
        return;
      }
      rows.push({ grade, meaning, min, max });
    }
    await TeacherBackend.updateGradeScale(courseId, rows);
    ROSTER = await TeacherBackend.getRoster();
    el('gradeScaleSaved').hidden = false;
    setTimeout(() => { el('gradeScaleSaved').hidden = true; }, 1800);
  });
  el('resetGradeScaleBtn').addEventListener('click', async () => {
    if(!confirm('Reset the grade scale to the official default for this term?')) return;
    await TeacherBackend.updateGradeScale(courseId, JSON.parse(JSON.stringify(TEACHER_GRADE_SCALE)));
    ROSTER = await TeacherBackend.getRoster();
    renderAssessmentSettings(courseId);
  });

  el('saveFinalWeightBtn').addEventListener('click', async () => {
    const errEl = el('finalWeightError');
    errEl.hidden = true;
    const pct = Number(el('finalWeightInput').value);
    if(isNaN(pct) || pct < 0 || pct > 100){
      errEl.textContent = 'Enter a number between 0 and 100.';
      errEl.hidden = false;
      return;
    }
    await TeacherBackend.updateFinalWeightPct(courseId, pct);
    ROSTER = await TeacherBackend.getRoster();
    el('finalWeightSaved').hidden = false;
    setTimeout(() => { el('finalWeightSaved').hidden = true; }, 1800);
  });
  el('resetFinalWeightBtn').addEventListener('click', async () => {
    const officialDefault = typeof TEACHER_COURSE_CONFIG[courseId].finalWeightPct === 'number' ? TEACHER_COURSE_CONFIG[courseId].finalWeightPct : 100;
    if(!confirm(`Reset this to the official default (${officialDefault}%) for this term?`)) return;
    await TeacherBackend.updateFinalWeightPct(courseId, officialDefault);
    ROSTER = await TeacherBackend.getRoster();
    renderAssessmentSettings(courseId);
  });
}

/* ===================== GROUP (student list + summary tracker) ===================== */
function renderGroup(courseId, groupId){
  const course = findCourse(courseId);
  const group = course && findGroup(courseId, groupId);
  if(!course || !group){ location.hash = '#/'; return; }

  const showFinalIntegration = typeof course.finalWeightPct === 'number' && course.finalWeightPct < 100;
  const rows = group.students.map(s => {
    const grade = computeStudentGrade(course, s);
    const att = computeAttendanceStats(s);
    const status = computeStudentStatus(course, s);
    const finalIntegration = computeFinalGradeIntegration(course, grade);
    return `
      <tr class="tracker-row" data-href="#/course/${courseId}/group/${groupId}/student/${s.studentId}">
        <td class="tracker-name">${genderIcon(s.gender, 18)} ${s.name}${s.nickname ? ` <span class="student-row-nick">"${s.nickname}"</span>` : ''}</td>
        <td>${fmtPct(grade.currentPct)} ${grade.letter ? `<strong>${grade.letter.grade}</strong>` : ''}${grade.remainingWeight > 0 ? ` <span class="field-hint">(${grade.remainingWeight.toFixed(0)}% left)</span>` : ''}</td>
        ${showFinalIntegration ? `<td>${finalIntegration && finalIntegration.integratedScore !== null ? `${finalIntegration.integratedScore} / ${finalIntegration.finalWeightPct}` : '—'}</td>` : ''}
        <td class="tracker-att-pct">${att.pct === null ? '—' : att.pct + '%'}</td>
        <td class="tracker-status">${statusPill(status)}${absencePill(s)}</td>
      </tr>
    `;
  }).join('');

  const categories = course.categories || [];
  const catScoreRows = group.students.map(s => {
    const cells = categories.map(cat => {
      const summary = computeCategoryScoreSummary(course, s, cat.id);
      if(cat.id === 'attendance'){
        return `<td><span class="field-hint cat-attendance-auto">${summary.score === null ? 'Not yet graded' : `${summary.score} (auto)`}</span></td>`;
      }
      return `<td><input type="number" class="cat-score" data-student="${s.studentId}" data-category="${cat.id}" min="0" max="${summary.maxScore}" placeholder="${summary.score === null ? '—' : ''}" value="${summary.score === null ? '' : summary.score}" title="${summary.suggestedPct !== null ? `Suggested: ${summary.suggestedPct} (avg of ${summary.evidenceCount} graded ${summary.evidenceCount === 1 ? 'activity' : 'activities'})` : 'No graded activities yet'}"></td>`;
    }).join('');
    const catGrade = computeStudentGrade(course, s);
    const catGradeCell = `<td class="cat-final-grade">${fmtPct(catGrade.currentPct)} ${catGrade.letter ? `<strong>${catGrade.letter.grade}</strong>` : ''}</td>`;
    return `<tr data-student="${s.studentId}"><td class="tracker-name">${genderIcon(s.gender, 18)} ${s.name}</td>${cells}${catGradeCell}</tr>`;
  }).join('');

  const groupAssessments = (course.assessments || []).filter(a => {
    const rubric = a.rubricId ? TEACHER_RUBRICS[a.rubricId] : null;
    return rubric && rubric.type === 'group';
  });
  const presentationLinks = groupAssessments.map(a => {
    const count = (group.presentationTeams || []).filter(t => t.assessmentId === a.id).length;
    return `<a class="btn-ghost btn-small" href="#/course/${courseId}/group/${groupId}/team/${a.id}">${a.title} (${count} team${count===1?'':'s'})</a>`;
  }).join('');

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <a href="#/course/${courseId}">${course.courseName}</a> <span>&rsaquo;</span> <span>Group ${groupId}</span></nav>
      <h1>${course.courseName} &mdash; Group ${groupId}</h1>
      <div class="course-meta">${group.schedule} &middot; ${group.students.length} students</div>

      <div class="course-actions">
        <a class="btn-primary btn-small" href="#/course/${courseId}/group/${groupId}/attendance/${todayISO()}">${icon('check',{size:14})} Take Attendance (today)</a>
        <a class="btn-ghost" href="#/course/${courseId}/assessments">Manage Assessments</a>
        <button class="btn-ghost btn-small" id="exportAttendanceBtn">${icon('download',{size:14})} Export Attendance CSV</button>
      </div>

      ${groupAssessments.length > 0 ? `
        <h2 class="section-heading">Presentation Teams</h2>
        <div class="course-actions">${presentationLinks}</div>
      ` : ''}

      <h2 class="section-heading">Student Summary Tracker</h2>
      <div class="table-wrap">
        <table class="data-table tracker-table">
          <thead><tr><th>Student</th><th>Current Grade</th>${showFinalIntegration ? `<th>Final Integration (${course.finalWeightPct}%)</th>` : ''}<th>Attendance</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="field-hint">Current Grade is calculated only from assessments already graded — it is not diluted by work that hasn't happened yet. Click any row to open that student's profile.${showFinalIntegration ? ` Final Integration is this course's grade converted to the ${course.finalWeightPct}% it actually contributes to each student's total final grade.` : ''}</p>

      <h2 class="section-heading">Assessment Category Scores</h2>
      <p class="field-hint">Enter one overall score (out of 100) per assessment category — this is what actually contributes to Current Grade above. Individual activities under Manage Assessments remain available as supporting evidence and are never averaged in automatically. Attendance &amp; Active Participation is calculated automatically from attendance records (plus an optional website engagement bonus, see Import Scores below) and can't be edited here directly. Hover a box to see a suggested score based on graded activities in that category, if any.</p>
      <div class="table-wrap">
        <table class="data-table sticky-col-table">
          <thead><tr><th>Student</th>${categories.map(cat => `<th>${cat.label} (${cat.weight}%)</th>`).join('')}<th>Final Grade</th></tr></thead>
          <tbody>${catScoreRows}</tbody>
        </table>
      </div>
      <div class="assessment-form-actions" style="margin-top:16px;">
        <button id="saveCategoryScoresBtn" class="btn-primary">Save Category Scores</button>
        <span id="categoryScoresSaved" class="field-hint" hidden>Saved.</span>
      </div>

      <h2 class="section-heading">Import Scores from a File</h2>
      <p class="field-hint">Upload an exam score sheet (Excel, CSV, PDF, or Word) to fill in one category's column above. This only fills in the table above — nothing is saved until you review it and click "Save Category Scores." PDF and Word tables are read automatically but are less reliable than Excel/CSV, so double-check the results.</p>
      <form id="scoreImportForm" class="inline-edit-form" style="flex-wrap:wrap;">
        <input type="file" id="scoreImportFile" accept=".xlsx,.xls,.csv,.pdf,.docx">
        <select id="scoreImportCategory">${categories.filter(c => c.id !== 'attendance').map(c => `<option value="${c.id}">${c.label}</option>`).join('')}<option value="__siteEngagement">Attendance Bonus (Website Engagement, up to +5)</option></select>
        <button type="submit" class="btn-ghost btn-small" id="scoreImportBtn">Read File</button>
      </form>
      <div id="scoreImportColumnPick" class="inline-edit-form" style="flex-wrap:wrap;margin-top:10px;" hidden>
        <label style="display:flex;align-items:center;gap:8px;">Which column has the score?
          <select id="scoreImportColumn"></select>
        </label>
        <label style="display:flex;align-items:center;gap:8px;">Max score for this column
          <input type="number" id="scoreImportMax" min="1" style="width:70px;">
        </label>
        <button type="button" class="btn-primary btn-small" id="scoreImportFillBtn">Fill In Scores</button>
      </div>
      <div id="scoreImportSummary" hidden></div>

      <h2 class="section-heading">Import Attendance (Multiple Dates)</h2>
      <p class="field-hint">Catch up several weeks of paper attendance sheets in one upload. The file needs a Student ID (or Name) column plus one column per date, headed with the exact date (e.g. 2026-08-13) — each cell holds Present/Absent/Late/Excused. This applies immediately (there's no separate Save step, same as the attendance bonus above) and re-computes every affected grade right away.</p>
      <form id="attImportMultiForm" class="inline-edit-form" style="flex-wrap:wrap;">
        <input type="file" id="attImportMultiFile" accept=".xlsx,.xls,.csv,.pdf,.docx">
        <button type="submit" class="btn-ghost btn-small" id="attImportMultiBtn">Apply Attendance</button>
      </form>
      <div id="attImportMultiSummary" hidden></div>

      <h2 class="section-heading">Add Student</h2>
      <form id="addStudentForm" class="assessment-form">
        <label>Student ID<input type="text" id="newStudentId" required></label>
        <label>Title
          <select id="newStudentTitle"><option value="Ms.">Ms.</option><option value="Mr.">Mr.</option></select>
        </label>
        <label>Full Name (no title)<input type="text" id="newStudentName" placeholder="e.g. Somsri Jaidee" required></label>
        <label>Gender
          <select id="newStudentGender"><option value="F">Female</option><option value="M">Male</option></select>
        </label>
        <label>GPAX (optional)<input type="number" id="newStudentGpax" step="0.01" min="0" max="4"></label>
        <div class="assessment-form-actions">
          <button type="submit" class="btn-primary btn-small">Add Student</button>
          <span id="addStudentError" class="signin-error" hidden></span>
        </div>
      </form>

      <h2 class="section-heading">Danger Zone</h2>
      <button class="btn-ghost btn-small btn-danger" id="deleteGroupBtn">Delete Group ${groupId} (and every student in it)</button>
    </main>
  `;
  wireTopbar();
  document.querySelectorAll('.tracker-row').forEach(tr => {
    tr.addEventListener('click', () => { location.hash = tr.dataset.href; });
  });
  el('exportAttendanceBtn').addEventListener('click', () => exportAttendanceCSV(courseId, groupId));

  /* Score import: Read File parses the upload and lists its numeric-looking
     columns; the teacher then picks which column is the real score (with a
     "total" column preferred as the default guess) before anything fills
     in, since a score sheet usually has several numeric columns and this
     can't safely guess which one matters. The parsed rows are cached in
     scoreImportRows so picking a different column re-fills without
     re-reading the file. */
  let scoreImportRows = null;
  el('scoreImportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = el('scoreImportFile').files[0];
    const summaryEl = el('scoreImportSummary');
    const pickEl = el('scoreImportColumnPick');
    pickEl.hidden = true;
    scoreImportRows = null;
    if(!file){
      summaryEl.hidden = false; summaryEl.className = 'import-summary has-warnings';
      summaryEl.innerHTML = 'Choose a file first.';
      return;
    }
    const btn = el('scoreImportBtn');
    btn.disabled = true; btn.textContent = 'Reading…';
    try{
      const objRows = await parseScoreFile(file);
      if(!objRows.length) throw new Error('No rows found in that file.');
      const candidates = detectScoreColumns(objRows);
      if(!candidates.length) throw new Error("Could not find a numeric score column in that file. Check it has a header row with Student ID and at least one score column.");
      scoreImportRows = objRows;
      const colSelect = el('scoreImportColumn');
      colSelect.innerHTML = candidates.map(h => `<option value="${h}">${h}</option>`).join('');
      const totalCol = candidates.find(h => /total/i.test(h));
      if(totalCol) colSelect.value = totalCol;
      el('scoreImportMax').value = guessMaxScoreFromHeader(colSelect.value) || 100;
      pickEl.hidden = false;
      summaryEl.hidden = false; summaryEl.className = 'import-summary';
      summaryEl.innerHTML = `Read ${objRows.length} row${objRows.length===1?'':'s'}. Pick which column has the score, then click "Fill In Scores".`;
    } catch(err){
      summaryEl.hidden = false; summaryEl.className = 'import-summary has-warnings';
      summaryEl.innerHTML = err.message || 'Could not read that file.';
    } finally {
      btn.disabled = false; btn.textContent = 'Read File';
    }
  });

  el('scoreImportColumn').addEventListener('change', () => {
    const guessed = guessMaxScoreFromHeader(el('scoreImportColumn').value);
    if(guessed) el('scoreImportMax').value = guessed;
  });

  el('scoreImportFillBtn').addEventListener('click', async () => {
    const summaryEl = el('scoreImportSummary');
    if(!scoreImportRows) return;
    const scoreHeader = el('scoreImportColumn').value;
    const maxScore = Number(el('scoreImportMax').value) || 100;
    const categoryId = el('scoreImportCategory').value;
    const rows = extractScoreRows(scoreImportRows, scoreHeader);
    const { matched, unmatchedRows, unmatchedStudents } = matchScoreRows(rows, group.students);
    const hasWarnings = unmatchedRows.length > 0 || unmatchedStudents.length > 0;
    summaryEl.hidden = false;
    summaryEl.className = 'import-summary' + (hasWarnings ? ' has-warnings' : '');

    if(categoryId === '__siteEngagement'){
      // No visible input box exists for Attendance (it's auto-computed,
      // read-only) -- there's nothing to "review before save" the normal
      // way, so this commits immediately and re-renders the affected cells
      // in place as its own visible confirmation, instead of waiting for a
      // separate Save click that has nowhere to point to.
      const records = {};
      matched.forEach(m => { records[m.studentId] = Math.max(0, Math.min(100, m.score / maxScore * 100)); });
      await TeacherBackend.setGroupSiteEngagementBulk(courseId, groupId, records);
      ROSTER = await TeacherBackend.getRoster();
      const freshCourse = findCourse(courseId);
      const freshGroup = findGroup(courseId, groupId);
      document.querySelectorAll('.tracker-table tbody tr.tracker-row').forEach(tr => {
        const studentId = tr.dataset.href.split('/').pop();
        const s = freshGroup.students.find(x => x.studentId === studentId);
        if(!s) return;
        const grade = computeStudentGrade(freshCourse, s);
        const gradeCell = tr.children[1];
        gradeCell.innerHTML = `${fmtPct(grade.currentPct)} ${grade.letter ? `<strong>${grade.letter.grade}</strong>` : ''}${grade.remainingWeight > 0 ? ` <span class="field-hint">(${grade.remainingWeight.toFixed(0)}% left)</span>` : ''}`;
      });
      document.querySelectorAll('.sticky-col-table tbody tr[data-student]').forEach(tr => {
        const s = freshGroup.students.find(x => x.studentId === tr.dataset.student);
        if(!s) return;
        const summary = computeCategoryScoreSummary(freshCourse, s, 'attendance');
        const attCell = tr.querySelector('.cat-attendance-auto');
        if(attCell) attCell.textContent = summary.score === null ? 'Not yet graded' : `${summary.score} (auto)`;
        const grade = computeStudentGrade(freshCourse, s);
        const finalGradeCell = tr.querySelector('.cat-final-grade');
        if(finalGradeCell) finalGradeCell.innerHTML = `${fmtPct(grade.currentPct)} ${grade.letter ? `<strong>${grade.letter.grade}</strong>` : ''}`;
      });
      let html = `<strong>Applied the website engagement bonus to ${matched.length} student${matched.length===1?'':'s'}</strong> (up to +${ATTENDANCE_SITE_BONUS_MAX} points on top of their class attendance, already saved). Attendance & Active Participation above is updated.`;
      if(unmatchedRows.length){
        html += `<div style="margin-top:8px;">${unmatchedRows.length} row${unmatchedRows.length===1?'':'s'} in the file could not be applied:<ul>${unmatchedRows.map(r => `<li>${r.label} — ${r.reason}</li>`).join('')}</ul></div>`;
      }
      if(unmatchedStudents.length){
        html += `<div style="margin-top:8px;">${unmatchedStudents.length} student${unmatchedStudents.length===1?'':'s'} in this group had no row in the file, left unchanged:<ul>${unmatchedStudents.map(s => `<li>${s.name}</li>`).join('')}</ul></div>`;
      }
      summaryEl.innerHTML = html;
      return;
    }

    const categoryLabel = (categories.find(c => c.id === categoryId) || {}).label || categoryId;
    matched.forEach(m => {
      const input = document.querySelector(`.cat-score[data-student="${m.studentId}"][data-category="${categoryId}"]`);
      if(input){ input.value = m.score; input.max = maxScore; }
    });
    let html = `<strong>Filled in ${matched.length} student${matched.length===1?'':'s'}</strong> for ${categoryLabel} (out of ${maxScore}). Review the table above, then click "Save Category Scores" to make it official.`;
    if(unmatchedRows.length){
      html += `<div style="margin-top:8px;">${unmatchedRows.length} row${unmatchedRows.length===1?'':'s'} in the file could not be filled in automatically:<ul>${unmatchedRows.map(r => `<li>${r.label} — ${r.reason}</li>`).join('')}</ul></div>`;
    }
    if(unmatchedStudents.length){
      html += `<div style="margin-top:8px;">${unmatchedStudents.length} student${unmatchedStudents.length===1?'':'s'} in this group had no row in the file, left unchanged:<ul>${unmatchedStudents.map(s => `<li>${s.name}</li>`).join('')}</ul></div>`;
    }
    summaryEl.innerHTML = html;
  });

  el('attImportMultiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = el('attImportMultiFile').files[0];
    const summaryEl = el('attImportMultiSummary');
    if(!file){
      summaryEl.hidden = false; summaryEl.className = 'import-summary has-warnings';
      summaryEl.innerHTML = 'Choose a file first.';
      return;
    }
    const btn = el('attImportMultiBtn');
    btn.disabled = true; btn.textContent = 'Reading…';
    try{
      const objRows = await parseScoreFile(file);
      if(!objRows.length) throw new Error('No rows found in that file.');
      const { rows, dateHeaders } = extractMultiDateAttendanceRows(objRows);
      if(!dateHeaders.length) throw new Error('No date columns found — column headers must be exact dates, like 2026-08-13.');
      const { matched, unmatchedRows, unmatchedStudents } = matchMultiDateAttendanceRows(rows, group.students, dateHeaders);
      const records = {};
      matched.forEach(m => { records[m.studentId] = m.byDate; });
      await TeacherBackend.setGroupAttendanceBulkMultiDate(courseId, groupId, records);
      ROSTER = await TeacherBackend.getRoster();
      const freshCourse = findCourse(courseId);
      const freshGroup = findGroup(courseId, groupId);
      document.querySelectorAll('.tracker-table tbody tr.tracker-row').forEach(tr => {
        const studentId = tr.dataset.href.split('/').pop();
        const s = freshGroup.students.find(x => x.studentId === studentId);
        if(!s) return;
        const grade = computeStudentGrade(freshCourse, s);
        const att = computeAttendanceStats(s);
        const status = computeStudentStatus(freshCourse, s);
        const gradeCell = tr.children[1];
        gradeCell.innerHTML = `${fmtPct(grade.currentPct)} ${grade.letter ? `<strong>${grade.letter.grade}</strong>` : ''}${grade.remainingWeight > 0 ? ` <span class="field-hint">(${grade.remainingWeight.toFixed(0)}% left)</span>` : ''}`;
        const attCell = tr.querySelector('.tracker-att-pct');
        if(attCell) attCell.textContent = att.pct === null ? '—' : att.pct + '%';
        const statusCell = tr.querySelector('.tracker-status');
        if(statusCell) statusCell.innerHTML = `${statusPill(status)}${absencePill(s)}`;
      });
      document.querySelectorAll('.sticky-col-table tbody tr[data-student]').forEach(tr => {
        const s = freshGroup.students.find(x => x.studentId === tr.dataset.student);
        if(!s) return;
        const summary = computeCategoryScoreSummary(freshCourse, s, 'attendance');
        const attAutoCell = tr.querySelector('.cat-attendance-auto');
        if(attAutoCell) attAutoCell.textContent = summary.score === null ? 'Not yet graded' : `${summary.score} (auto)`;
        const grade = computeStudentGrade(freshCourse, s);
        const finalGradeCell = tr.querySelector('.cat-final-grade');
        if(finalGradeCell) finalGradeCell.innerHTML = `${fmtPct(grade.currentPct)} ${grade.letter ? `<strong>${grade.letter.grade}</strong>` : ''}`;
      });
      const hasWarnings = unmatchedRows.length > 0 || unmatchedStudents.length > 0;
      summaryEl.hidden = false;
      summaryEl.className = 'import-summary' + (hasWarnings ? ' has-warnings' : '');
      let html = `<strong>Applied attendance for ${matched.length} student${matched.length===1?'':'s'}</strong> across ${dateHeaders.length} date${dateHeaders.length===1?'':'s'} (${dateHeaders.join(', ')}), already saved. Attendance, Current Grade, and Status above are updated.`;
      if(unmatchedRows.length){
        html += `<div style="margin-top:8px;">${unmatchedRows.length} row${unmatchedRows.length===1?'':'s'} in the file could not be applied:<ul>${unmatchedRows.map(r => `<li>${r.label} — ${r.reason}</li>`).join('')}</ul></div>`;
      }
      if(unmatchedStudents.length){
        html += `<div style="margin-top:8px;">${unmatchedStudents.length} student${unmatchedStudents.length===1?'':'s'} in this group had no row in the file, left unchanged:<ul>${unmatchedStudents.map(s => `<li>${s.name}</li>`).join('')}</ul></div>`;
      }
      summaryEl.innerHTML = html;
    } catch(err){
      summaryEl.hidden = false; summaryEl.className = 'import-summary has-warnings';
      summaryEl.innerHTML = err.message || 'Could not read that file.';
    } finally {
      btn.disabled = false; btn.textContent = 'Apply Attendance';
    }
  });

  el('saveCategoryScoresBtn').addEventListener('click', async () => {
    const byCategory = {};
    document.querySelectorAll('.cat-score').forEach(input => {
      const raw = input.value.trim();
      if(raw === '') return;
      const categoryId = input.dataset.category;
      const studentId = input.dataset.student;
      const maxScore = Number(input.max) || 100;
      byCategory[categoryId] = byCategory[categoryId] || {};
      byCategory[categoryId][studentId] = { score: Number(raw), maxScore, status: 'graded' };
    });
    for(const categoryId of Object.keys(byCategory)){
      await TeacherBackend.setGroupCategoryScoresBulk(courseId, groupId, categoryId, byCategory[categoryId]);
    }
    ROSTER = await TeacherBackend.getRoster();
    // Patch the tracker table's Current Grade column in place (rather than
    // a full re-render) so the "Saved." confirmation stays visible.
    const freshCourse = findCourse(courseId);
    const freshGroup = findGroup(courseId, groupId);
    document.querySelectorAll('.tracker-table tbody tr.tracker-row').forEach(tr => {
      const studentId = tr.dataset.href.split('/').pop();
      const s = freshGroup.students.find(x => x.studentId === studentId);
      if(!s) return;
      const grade = computeStudentGrade(freshCourse, s);
      const gradeCell = tr.children[1];
      gradeCell.innerHTML = `${fmtPct(grade.currentPct)} ${grade.letter ? `<strong>${grade.letter.grade}</strong>` : ''}${grade.remainingWeight > 0 ? ` <span class="field-hint">(${grade.remainingWeight.toFixed(0)}% left)</span>` : ''}`;
    });
    document.querySelectorAll('.sticky-col-table tbody tr[data-student]').forEach(tr => {
      const s = freshGroup.students.find(x => x.studentId === tr.dataset.student);
      if(!s) return;
      const grade = computeStudentGrade(freshCourse, s);
      const finalGradeCell = tr.querySelector('.cat-final-grade');
      if(finalGradeCell) finalGradeCell.innerHTML = `${fmtPct(grade.currentPct)} ${grade.letter ? `<strong>${grade.letter.grade}</strong>` : ''}`;
    });
    el('categoryScoresSaved').hidden = false;
    setTimeout(() => { el('categoryScoresSaved').hidden = true; }, 1800);
  });

  el('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = el('addStudentError');
    errEl.hidden = true;
    const studentId = el('newStudentId').value.trim();
    const name = el('newStudentName').value.trim();
    if(!studentId || !name){ errEl.textContent = 'Student ID and name are required.'; errEl.hidden = false; return; }
    const gpax = el('newStudentGpax').value ? Number(el('newStudentGpax').value) : 0;
    try{
      await TeacherBackend.addStudent(courseId, groupId, {
        studentId, name, title: el('newStudentTitle').value, gender: el('newStudentGender').value, gpax
      });
      ROSTER = await TeacherBackend.getRoster();
      renderGroup(courseId, groupId);
    } catch(err){
      errEl.textContent = err.message || 'Could not add that student.';
      errEl.hidden = false;
    }
  });

  el('deleteGroupBtn').addEventListener('click', async () => {
    if(!confirm(`Delete Group ${groupId} and all ${group.students.length} students in it? This cannot be undone.`)) return;
    await TeacherBackend.deleteGroup(courseId, groupId);
    ROSTER = await TeacherBackend.getRoster();
    location.hash = `#/course/${courseId}`;
  });
}

/* ===================== PRESENTATION TEAM SCORING ===================== */
let teamFormEditingId = null;

function renderPresentationTeams(courseId, groupId, assessmentId){
  const course = findCourse(courseId);
  const group = course && findGroup(courseId, groupId);
  const a = course && (course.assessments || []).find(x => x.id === assessmentId);
  if(!course || !group || !a){ location.hash = '#/'; return; }
  const rubric = TEACHER_RUBRICS[a.rubricId];
  teamFormEditingId = null;

  const teams = (group.presentationTeams || []).filter(t => t.assessmentId === assessmentId);
  const teamRows = teams.map(t => `
    <tr>
      <td>${t.topic || '—'}</td>
      <td>${t.memberIds.map(id => { const s = group.students.find(x => x.studentId === id); return s ? s.name : id; }).join(', ')}</td>
      <td>${t.groupScore} / ${a.maxScore}</td>
      <td class="table-actions">
        <button class="btn-ghost btn-small" data-edit-team="${t.id}">Edit</button>
        <button class="btn-ghost btn-small btn-danger" data-delete-team="${t.id}">Delete</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="4" class="empty-note">No presentation teams recorded yet.</td></tr>`;

  const memberRows = group.students.map(s => `
    <tr>
      <td><input type="checkbox" class="team-member" data-student="${s.studentId}"></td>
      <td>${genderIcon(s.gender, 16)} ${s.name}${s.nickname ? ` <span class="student-row-nick">"${s.nickname}"</span>` : ''}</td>
      <td><input type="number" class="team-override" data-student="${s.studentId}" min="0" max="${a.maxScore}" placeholder="same as group score" disabled></td>
    </tr>
  `).join('');

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs">
        <a href="#/">Dashboard</a> <span>&rsaquo;</span>
        <a href="#/course/${courseId}">${course.courseName}</a> <span>&rsaquo;</span>
        <a href="#/course/${courseId}/group/${groupId}">Group ${groupId}</a> <span>&rsaquo;</span>
        <span>${a.title}</span>
      </nav>
      <h1>${rubric.title}</h1>
      <div class="course-meta">${a.title} &middot; ${rubric.durationNote || ''}</div>
      ${rubric.sampleTopics ? `<p class="field-hint">Sample topics: ${rubric.sampleTopics.join(', ')}</p>` : ''}

      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Topic</th><th>Members</th><th>Group Score</th><th></th></tr></thead>
          <tbody id="teamRows">${teamRows}</tbody>
        </table>
      </div>

      <h2 class="section-heading" id="teamFormHeading">Add Presentation Team</h2>
      <form id="teamForm" class="assessment-form">
        <label>Topic
          <input type="text" id="teamTopic" placeholder="e.g. Wellness resort package">
        </label>
        <label>Group Score (out of ${a.maxScore})
          <input type="number" id="teamGroupScore" min="0" max="${a.maxScore}" required>
        </label>
        <div class="clo-fieldset" style="grid-column:1/-1;">
          <legend>Team Members (check who presented; optionally override an individual score)</legend>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>On team</th><th>Student</th><th>Individual override</th></tr></thead>
              <tbody id="teamMemberRows">${memberRows}</tbody>
            </table>
          </div>
        </div>
        <label style="grid-column:1/-1;">Q&amp;A Performance
          <textarea id="teamQA" rows="2" placeholder="How did the group handle questions?"></textarea>
        </label>
        <label style="grid-column:1/-1;">Teacher Feedback
          <textarea id="teamTeacherFeedback" rows="2"></textarea>
        </label>
        <label style="grid-column:1/-1;">Peer Feedback
          <textarea id="teamPeerFeedback" rows="2" placeholder="optional"></textarea>
        </label>
        <div class="assessment-form-actions">
          <button type="submit" class="btn-primary" id="teamSubmitBtn">Add Team</button>
          <button type="button" class="btn-ghost" id="teamCancelBtn" hidden>Cancel edit</button>
        </div>
        <div id="teamFormError" class="signin-error" hidden></div>
      </form>
    </main>
  `;
  wireTopbar();

  document.querySelectorAll('.team-member').forEach(cb => {
    cb.addEventListener('change', () => {
      const override = document.querySelector(`.team-override[data-student="${cb.dataset.student}"]`);
      override.disabled = !cb.checked;
      if(!cb.checked) override.value = '';
    });
  });

  el('teamRows').querySelectorAll('[data-edit-team]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = teams.find(x => x.id === btn.dataset.editTeam);
      if(!t) return;
      teamFormEditingId = t.id;
      el('teamTopic').value = t.topic || '';
      el('teamGroupScore').value = t.groupScore;
      el('teamQA').value = t.qaPerformance || '';
      el('teamTeacherFeedback').value = t.teacherFeedback || '';
      el('teamPeerFeedback').value = t.peerFeedback || '';
      document.querySelectorAll('.team-member').forEach(cb => {
        const on = t.memberIds.includes(cb.dataset.student);
        cb.checked = on;
        const override = document.querySelector(`.team-override[data-student="${cb.dataset.student}"]`);
        override.disabled = !on;
        override.value = (on && t.individualScores && typeof t.individualScores[cb.dataset.student] === 'number') ? t.individualScores[cb.dataset.student] : '';
      });
      el('teamFormHeading').textContent = 'Edit Presentation Team';
      el('teamSubmitBtn').textContent = 'Save Changes';
      el('teamCancelBtn').hidden = false;
      el('teamForm').scrollIntoView({ behavior: 'smooth' });
    });
  });
  el('teamRows').querySelectorAll('[data-delete-team]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if(!confirm('Delete this presentation team? Members will lose the score it gave them for this assessment.')) return;
      await TeacherBackend.deletePresentationTeam(courseId, groupId, btn.dataset.deleteTeam);
      ROSTER = await TeacherBackend.getRoster();
      renderPresentationTeams(courseId, groupId, assessmentId);
    });
  });
  el('teamCancelBtn').addEventListener('click', () => renderPresentationTeams(courseId, groupId, assessmentId));

  el('teamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = el('teamFormError');
    errEl.hidden = true;
    const groupScore = Number(el('teamGroupScore').value);
    if(el('teamGroupScore').value === '' || isNaN(groupScore) || groupScore < 0 || groupScore > a.maxScore){
      errEl.textContent = `Group score must be between 0 and ${a.maxScore}.`; errEl.hidden = false; return;
    }
    const memberIds = Array.from(document.querySelectorAll('.team-member:checked')).map(cb => cb.dataset.student);
    if(memberIds.length === 0){ errEl.textContent = 'Check at least one team member.'; errEl.hidden = false; return; }
    const individualScores = {};
    let overrideError = false;
    memberIds.forEach(id => {
      const input = document.querySelector(`.team-override[data-student="${id}"]`);
      if(input.value !== ''){
        const v = Number(input.value);
        if(isNaN(v) || v < 0 || v > a.maxScore) overrideError = true;
        else individualScores[id] = v;
      }
    });
    if(overrideError){ errEl.textContent = `Individual overrides must be between 0 and ${a.maxScore}.`; errEl.hidden = false; return; }
    const payload = {
      assessmentId, topic: el('teamTopic').value.trim(), groupScore, memberIds, individualScores,
      qaPerformance: el('teamQA').value, teacherFeedback: el('teamTeacherFeedback').value, peerFeedback: el('teamPeerFeedback').value
    };
    if(teamFormEditingId){
      await TeacherBackend.updatePresentationTeam(courseId, groupId, teamFormEditingId, payload);
    } else {
      await TeacherBackend.addPresentationTeam(courseId, groupId, payload);
    }
    teamFormEditingId = null;
    ROSTER = await TeacherBackend.getRoster();
    renderPresentationTeams(courseId, groupId, assessmentId);
  });
}

/* ===================== ATTENDANCE: IMPORT FROM FILE =====================
   Reads a teacher-supplied .xlsx/.xls/.csv/.pdf/.docx (e.g. an online-class
   attendance sheet already kept in Excel, or a scanned/exported roster)
   entirely client-side — no server, no API key, no cost. Pre-fills the
   on-screen status <select> for each matched student; nothing is written to
   the roster until the teacher reviews the table and clicks the existing
   "Save Attendance" button, same confirm-before-save principle as everything
   else in this dashboard. Each format's reader library is loaded lazily from
   a CDN, only when that format is actually used, so none of them add weight
   to the normal attendance page.

   PDF and Word don't carry real column structure once read, unlike xlsx/csv,
   so table extraction there is a best-effort heuristic (column breaks in PDF
   are inferred from runs of 2+ spaces in the reconstructed line text; Word
   tables are read directly when present, otherwise lines are split the same
   way). Expect to
   review the match summary more carefully for these two formats. Legacy
   .doc (pre-2007 binary Word) has no reliable client-side reader and isn't
   supported — ask the teacher to save as .docx or export to Excel/CSV. */
let xlsxLoadPromise = null;
function loadXLSX(){
  if(window.XLSX) return Promise.resolve(window.XLSX);
  if(xlsxLoadPromise) return xlsxLoadPromise;
  xlsxLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => { xlsxLoadPromise = null; reject(new Error('Could not load the spreadsheet reader. Check your internet connection and try again.')); };
    document.head.appendChild(s);
  });
  return xlsxLoadPromise;
}

let pdfjsLoadPromise = null;
function loadPDFJS(){
  if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if(pdfjsLoadPromise) return pdfjsLoadPromise;
  pdfjsLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.min.js';
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    s.onerror = () => { pdfjsLoadPromise = null; reject(new Error('Could not load the PDF reader. Check your internet connection and try again.')); };
    document.head.appendChild(s);
  });
  return pdfjsLoadPromise;
}

let mammothLoadPromise = null;
function loadMammoth(){
  if(window.mammoth) return Promise.resolve(window.mammoth);
  if(mammothLoadPromise) return mammothLoadPromise;
  /* mammoth's browser bundle calls setImmediate internally (a Node global,
     not a browser one) to chunk its zip/XML processing without blocking the
     UI thread. Polyfill it before the script loads, or every .docx read
     hangs forever with no error. */
  if(typeof window.setImmediate === 'undefined'){
    window.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
  }
  mammothLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/mammoth@1.7.2/mammoth.browser.min.js';
    s.onload = () => resolve(window.mammoth);
    s.onerror = () => { mammothLoadPromise = null; reject(new Error('Could not load the Word document reader. Check your internet connection and try again.')); };
    document.head.appendChild(s);
  });
  return mammothLoadPromise;
}

const ATT_ID_HEADERS = ['studentid', 'student id', 'id', 'studentnumber', 'student number'];
const ATT_NAME_HEADERS = ['name', 'student name', 'student', 'fullname', 'full name'];
const ATT_STATUS_HEADERS = ['status', 'attendance', 'present', 'presence'];

function normalizeAttStatus(raw){
  if(raw === null || raw === undefined) return null;
  const v = String(raw).trim().toLowerCase();
  if(v === '') return null;
  if(['present', 'p', 'yes', 'y', 'true', '1', '✓', 'x', 'here'].includes(v)) return 'present';
  if(['absent', 'a', 'no', 'n', 'false', '0', 'ab'].includes(v)) return 'absent';
  if(['late', 'l', 'tardy'].includes(v)) return 'late';
  if(['excused', 'ex', 'excuse'].includes(v)) return 'excused';
  return null;
}
function normalizeAttName(raw){
  return String(raw || '')
    .toLowerCase()
    .replace(/\b(mr|mrs|ms|miss|mx|dr)\.?\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
function normalizeAttId(raw){
  return String(raw || '').replace(/\D/g, '');
}

/* Shared by every format: given rows already shaped as plain objects keyed
   by column header (the same shape XLSX.utils.sheet_to_json produces),
   find the ID/Name/Status columns and return {idRaw, nameRaw, statusRaw}
   rows — flexible about column headers/order, since the teacher's own file
   layout isn't controlled by this dashboard. */
function extractAttendanceRows(objRows){
  if(!objRows.length) return [];
  const headers = Object.keys(objRows[0]);
  const findHeader = (candidates) => headers.find(h => candidates.includes(String(h).trim().toLowerCase()));
  const idHeader = findHeader(ATT_ID_HEADERS);
  const nameHeader = findHeader(ATT_NAME_HEADERS);
  const statusHeader = findHeader(ATT_STATUS_HEADERS);
  return objRows.map(r => ({
    idRaw: idHeader ? r[idHeader] : '',
    nameRaw: nameHeader ? r[nameHeader] : '',
    statusRaw: statusHeader ? r[statusHeader] : ''
  })).filter(r => String(r.idRaw).trim() || String(r.nameRaw).trim());
}

/* Converts an array-of-arrays (first row = header) into the same
   object-per-row shape XLSX.utils.sheet_to_json produces, so the PDF/Word
   extractors below can reuse extractAttendanceRows unchanged. */
const AOA_KNOWN_HEADERS = [...ATT_ID_HEADERS, ...ATT_NAME_HEADERS, ...ATT_STATUS_HEADERS];
const aoaLooksLikeHeaderRow = r => r.length > 1 && r.some(c => AOA_KNOWN_HEADERS.includes(String(c || '').trim().toLowerCase()));
/* True only if some row in this sheet is a genuine, recognized ID/Name/
   Status header row — as opposed to objectsFromAOA below, which always
   returns *something* by falling back to row 0 when it can't find one.
   Used to pick the right SHEET out of a multi-sheet workbook (see
   spreadsheetToObjectRows) before trusting objectsFromAOA's own row-level
   fallback within that sheet. */
function aoaHasRealHeader(aoa){
  const rows = aoa.filter(r => r.some(c => String(c || '').trim() !== ''));
  return rows.some(aoaLooksLikeHeaderRow);
}
function objectsFromAOA(aoa){
  const rows = aoa.filter(r => r.some(c => String(c || '').trim() !== ''));
  if(rows.length < 2) return [];
  /* Unlike a spreadsheet, a PDF or Word extraction can have title text or
     other prose before the real table starts, so row 0 isn't reliably the
     header — find the first row that actually contains a recognized
     ID/Name/Status column name, falling back to row 0 if nothing matches. */
  const headerIdx = rows.findIndex(aoaLooksLikeHeaderRow);
  const dataRows = rows.slice(headerIdx === -1 ? 0 : headerIdx);
  if(dataRows.length < 2) return [];
  const headers = dataRows[0].map(h => String(h || '').trim());
  return dataRows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i] !== undefined ? r[i] : ''; });
    return obj;
  });
}

/* Shared by attendance and score import: every column, unfiltered, keyed
   by header exactly as XLSX.utils.sheet_to_json produces it. */
async function spreadsheetToObjectRows(file){
  const XLSX = await loadXLSX();
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  /* Reading straight to objects (sheet_to_json with no header option) trusts
     row 1 as the header row, which breaks on this dashboard's own score
     sheet template: row 1 is a title ("Phuket Rajabhat University —
     Midterm Score Sheet"), row 2 a course/instructor line, row 3 blank,
     and the REAL header row (No./Student ID/Name/.../Listening (/20)/...)
     is row 4. Reading as an array-of-arrays and reusing objectsFromAOA's
     existing "find the row that actually looks like a header" logic
     (already relied on for PDF/Word) fixes this the same way for
     Excel/CSV, and isn't fooled by leading title rows.

     This workbook also isn't always one sheet: this dashboard's own score
     sheet template ships as "Rubric Key" + one sheet per group (e.g.
     "Group 1 & 2"), and always reading wb.SheetNames[0] would silently
     read the Rubric Key table (Criterion/Excellent/Good/...) instead of
     any real student data — a real bug hit in testing, not hypothetical.
     Try every sheet in order and use the first one that actually contains
     a genuine ID/Name header row (aoaHasRealHeader, not objectsFromAOA's
     own row-0 fallback, which would happily "succeed" on the Rubric Key
     sheet too and always win by being first) so a multi-sheet workbook
     works the same as the single-sheet exports teachers sometimes save
     instead. */
  for(const sheetName of wb.SheetNames){
    const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
    if(aoaHasRealHeader(aoa)) return objectsFromAOA(aoa);
  }
  return [];
}
async function parseAttendanceSpreadsheet(file){
  return extractAttendanceRows(await spreadsheetToObjectRows(file));
}

/* PDF has no real column structure once text is extracted — only word
   positions. Words are grouped into lines by y-position, then a horizontal
   gap wider than ~20pt between adjacent words is treated as a column break.
   This reads clean, table-formatted PDFs reasonably well; anything with an
   unusual layout will need manual correction in the review table. Shared by
   both attendance and score import (see parseScorePDF below), each of which
   turns this same array-of-arrays into rows its own way. */
async function pdfToAOA(file){
  const pdfjsLib = await loadPDFJS();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const aoa = [];
  for(let p = 1; p <= pdf.numPages; p++){
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const lineMap = new Map();
    content.items.forEach(item => {
      const y = Math.round(item.transform[5]);
      let key = null;
      for(const k of lineMap.keys()){ if(Math.abs(k - y) <= 3){ key = k; break; } }
      if(key === null) key = y;
      if(!lineMap.has(key)) lineMap.set(key, []);
      lineMap.get(key).push(item);
    });
    const sortedKeys = [...lineMap.keys()].sort((a, b) => b - a);
    sortedKeys.forEach(k => {
      const items = lineMap.get(k).sort((a, b) => a.transform[4] - b.transform[4]);
      /* A single space joins every item; real column boundaries end up as a
         run of 2+ spaces because pdf.js text items commonly carry their own
         trailing/leading space, stacking with the one added here. Splitting
         on that run of whitespace turned out far more reliable than an
         x-position gap threshold, which varies too much by table style to
         hardcode. */
      const rowText = items.map(it => it.str).join(' ');
      const cells = rowText.split(/\s{2,}/).map(c => c.trim()).filter(c => c !== '');
      if(cells.length) aoa.push(cells);
    });
  }
  return aoa;
}
async function parseAttendancePDF(file){
  return extractAttendanceRows(objectsFromAOA(await pdfToAOA(file)));
}

/* Word tables are read directly when the document has one (most reliable —
   mammoth preserves real table structure). If there's no table, falls back
   to splitting each line of plain text on wide gaps/tabs, same heuristic
   as the PDF reader. Shared by attendance and score import, same reasoning
   as pdfToAOA above. */
async function docxToAOA(file){
  const mammoth = await loadMammoth();
  const buf = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buf });
  const doc = new DOMParser().parseFromString(result.value, 'text/html');
  const table = doc.querySelector('table');
  if(table){
    return [...table.querySelectorAll('tr')].map(tr =>
      [...tr.querySelectorAll('td,th')].map(td => td.textContent.trim())
    );
  }
  const text = doc.body.textContent || '';
  return text.split('\n').map(line => line.trim()).filter(Boolean)
    .map(line => line.split(/\s{2,}|\t/).map(c => c.trim()).filter(Boolean));
}
async function parseAttendanceDocx(file){
  return extractAttendanceRows(objectsFromAOA(await docxToAOA(file)));
}

/* Reads the file and returns raw {idRaw, nameRaw, statusRaw} rows,
   dispatching to the right reader by file extension. */
async function parseAttendanceFile(file){
  const name = file.name.toLowerCase();
  if(name.endsWith('.pdf')) return parseAttendancePDF(file);
  if(name.endsWith('.docx')) return parseAttendanceDocx(file);
  if(name.endsWith('.doc')) throw new Error("Legacy .doc files can't be read directly. Please save it as .docx in Word, or export to Excel/CSV instead.");
  return parseAttendanceSpreadsheet(file);
}

/* ===================== SCORE IMPORT (exam/assessment score sheets) =====================
   Same file-reading pipeline as attendance import above (same loaders, same
   pdfToAOA/docxToAOA/spreadsheetToObjectRows, same ID/name matching), but a
   score sheet has no fixed "status" column — it usually has several numeric
   columns (Listening /20, Fluency /10, Total /50...), so unlike attendance
   this can't guess which one to use. Instead it reads every column, lists
   the numeric-looking ones as candidates, and the teacher picks which one
   is the actual score before anything fills in. */
async function parseScoreFile(file){
  const name = file.name.toLowerCase();
  if(name.endsWith('.pdf')) return objectsFromAOA(await pdfToAOA(file));
  if(name.endsWith('.docx')) return objectsFromAOA(await docxToAOA(file));
  if(name.endsWith('.doc')) throw new Error("Legacy .doc files can't be read directly. Please save it as .docx in Word, or export to Excel/CSV instead.");
  return spreadsheetToObjectRows(file);
}

const SCORE_IGNORE_HEADERS = ['no.', 'no', 'nickname', ...ATT_ID_HEADERS, ...ATT_NAME_HEADERS];

/* A column counts as a score candidate if most of its non-blank values
   parse as a number once stray symbols (a stray "%", a trailing "pts") are
   stripped — real score columns are consistently numeric, so this is a
   simple, reliable filter without needing the teacher to pre-clean the
   file. */
function detectScoreColumns(objRows){
  if(!objRows.length) return [];
  const headers = Object.keys(objRows[0]);
  return headers.filter(h => !SCORE_IGNORE_HEADERS.includes(String(h).trim().toLowerCase())).filter(h => {
    const values = objRows.map(r => r[h]).filter(v => String(v).trim() !== '');
    if(!values.length) return false;
    const numericCount = values.filter(v => normalizeScoreValue(v) !== null).length;
    return numericCount / values.length >= 0.6;
  });
}

/* Column headers like "Midterm Total (/50)" or "Listening (out of 20)"
   carry their own max score — pre-fill it so the teacher usually has
   nothing to type, only to double-check. */
function guessMaxScoreFromHeader(header){
  const m = String(header).match(/\((?:out of\s*)?\/?\s*(\d+(?:\.\d+)?)\)/i);
  return m ? Number(m[1]) : null;
}
function normalizeScoreValue(raw){
  if(raw === null || raw === undefined) return null;
  const cleaned = String(raw).trim().replace(/[^\d.\-]/g, '');
  if(cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
function extractScoreRows(objRows, scoreHeader){
  if(!objRows.length) return [];
  const headers = Object.keys(objRows[0]);
  const findHeader = (candidates) => headers.find(h => candidates.includes(String(h).trim().toLowerCase()));
  const idHeader = findHeader(ATT_ID_HEADERS);
  const nameHeader = findHeader(ATT_NAME_HEADERS);
  return objRows.map(r => ({
    idRaw: idHeader ? r[idHeader] : '',
    nameRaw: nameHeader ? r[nameHeader] : '',
    scoreRaw: scoreHeader ? r[scoreHeader] : ''
  })).filter(r => String(r.idRaw).trim() || String(r.nameRaw).trim());
}

/* Same match-by-ID-then-name strategy as matchAttendanceRows, and the same
   principle: anything it can't confidently match is reported back rather
   than guessed, so the teacher fixes it by hand in the table instead of a
   score silently landing on the wrong student. */
function matchScoreRows(rows, students){
  const matched = [];
  const unmatchedRows = [];
  const matchedStudentIds = new Set();
  rows.forEach(row => {
    const score = normalizeScoreValue(row.scoreRaw);
    let student = null;
    const idNorm = normalizeAttId(row.idRaw);
    if(idNorm) student = students.find(s => normalizeAttId(s.studentId) === idNorm);
    if(!student && row.nameRaw){
      const nameNorm = normalizeAttName(row.nameRaw);
      student = students.find(s => normalizeAttName(s.name) === nameNorm);
      if(!student){
        student = students.find(s => nameNorm && (normalizeAttName(s.name).includes(nameNorm) || nameNorm.includes(normalizeAttName(s.name))));
      }
    }
    if(student && score !== null){
      matched.push({ studentId: student.studentId, name: student.name, score });
      matchedStudentIds.add(student.studentId);
    } else {
      unmatchedRows.push({ label: row.nameRaw || row.idRaw || '(blank row)', reason: !student ? 'no matching student in this group' : 'score not recognized' });
    }
  });
  const unmatchedStudents = students.filter(s => !matchedStudentIds.has(s.studentId));
  return { matched, unmatchedRows, unmatchedStudents };
}

/* Matches parsed rows against this group's real roster — by student ID
   first (most reliable), falling back to a normalized name match. Never
   guesses past that: anything it can't confidently match is reported back
   so the teacher can fix it by hand in the table instead of silently
   marking the wrong student. */
function matchAttendanceRows(rows, students){
  const matched = [];
  const unmatchedRows = [];
  const matchedStudentIds = new Set();
  rows.forEach(row => {
    const status = normalizeAttStatus(row.statusRaw);
    let student = null;
    const idNorm = normalizeAttId(row.idRaw);
    if(idNorm) student = students.find(s => normalizeAttId(s.studentId) === idNorm);
    if(!student && row.nameRaw){
      const nameNorm = normalizeAttName(row.nameRaw);
      student = students.find(s => normalizeAttName(s.name) === nameNorm);
      if(!student){
        student = students.find(s => nameNorm && (normalizeAttName(s.name).includes(nameNorm) || nameNorm.includes(normalizeAttName(s.name))));
      }
    }
    if(student && status){
      matched.push({ studentId: student.studentId, name: student.name, status });
      matchedStudentIds.add(student.studentId);
    } else {
      unmatchedRows.push({ label: row.nameRaw || row.idRaw || '(blank row)', reason: !student ? 'no matching student in this group' : 'status not recognized' });
    }
  });
  const unmatchedStudents = students.filter(s => !matchedStudentIds.has(s.studentId));
  return { matched, unmatchedRows, unmatchedStudents };
}

/* Multi-date variant of extractAttendanceRows: instead of one statusRaw
   column, treats every column whose header is a plain YYYY-MM-DD date as
   its own date's status column. Feeds the "catch up several weeks of paper
   attendance sheets at once" import (see setGroupAttendanceBulkMultiDate).
   Files here are always machine-generated with clean ISO date headers, not
   a teacher-authored layout, so a strict date-format match is fine — unlike
   ATT_STATUS_HEADERS above, which has to tolerate whatever a real exported
   gradebook happens to call its one status column. */
function extractMultiDateAttendanceRows(objRows){
  if(!objRows.length) return { rows: [], dateHeaders: [] };
  const headers = Object.keys(objRows[0]);
  const findHeader = (candidates) => headers.find(h => candidates.includes(String(h).trim().toLowerCase()));
  const idHeader = findHeader(ATT_ID_HEADERS);
  const nameHeader = findHeader(ATT_NAME_HEADERS);
  const dateHeaders = headers.filter(h => /^\d{4}-\d{2}-\d{2}$/.test(String(h).trim()));
  const rows = objRows.map(r => ({
    idRaw: idHeader ? r[idHeader] : '',
    nameRaw: nameHeader ? r[nameHeader] : '',
    byDateRaw: Object.fromEntries(dateHeaders.map(h => [h, r[h]]))
  })).filter(r => String(r.idRaw).trim() || String(r.nameRaw).trim());
  return { rows, dateHeaders };
}

/* Same match-by-ID-then-name strategy as matchAttendanceRows, applied once
   per row but across every date column at once. A row only counts as
   matched if at least one date column had a recognized status — a fully
   blank row (student not marked on any of these dates yet) is reported
   back rather than silently doing nothing, same "never guess" principle. */
function matchMultiDateAttendanceRows(rows, students, dateHeaders){
  const matched = [];
  const unmatchedRows = [];
  const matchedStudentIds = new Set();
  rows.forEach(row => {
    let student = null;
    const idNorm = normalizeAttId(row.idRaw);
    if(idNorm) student = students.find(s => normalizeAttId(s.studentId) === idNorm);
    if(!student && row.nameRaw){
      const nameNorm = normalizeAttName(row.nameRaw);
      student = students.find(s => normalizeAttName(s.name) === nameNorm);
      if(!student){
        student = students.find(s => nameNorm && (normalizeAttName(s.name).includes(nameNorm) || nameNorm.includes(normalizeAttName(s.name))));
      }
    }
    if(!student){
      unmatchedRows.push({ label: row.nameRaw || row.idRaw || '(blank row)', reason: 'no matching student in this group' });
      return;
    }
    const byDate = {};
    let anyRecognized = false;
    dateHeaders.forEach(h => {
      const status = normalizeAttStatus(row.byDateRaw[h]);
      if(status){ byDate[h] = status; anyRecognized = true; }
    });
    if(anyRecognized){
      matched.push({ studentId: student.studentId, name: student.name, byDate });
      matchedStudentIds.add(student.studentId);
    } else {
      unmatchedRows.push({ label: row.nameRaw || row.idRaw, reason: 'no recognized status in any date column' });
    }
  });
  const unmatchedStudents = students.filter(s => !matchedStudentIds.has(s.studentId));
  return { matched, unmatchedRows, unmatchedStudents };
}

/* ===================== ATTENDANCE (bulk, whole group / one date) ===================== */
function renderAttendance(courseId, groupId, date){
  const course = findCourse(courseId);
  const group = course && findGroup(courseId, groupId);
  if(!course || !group){ location.hash = '#/'; return; }

  const rows = group.students.map(s => {
    const existing = (s.attendance || []).find(r => r.date === date);
    const status = existing ? existing.status : 'present';
    const note = existing ? existing.note : '';
    return `
      <tr>
        <td>${genderIcon(s.gender, 18)} ${s.name}${s.nickname ? ` <span class="student-row-nick">"${s.nickname}"</span>` : ''}</td>
        <td>
          <select class="att-status" data-student="${s.studentId}">
            <option value="present" ${status==='present'?'selected':''}>Present</option>
            <option value="late" ${status==='late'?'selected':''}>Late</option>
            <option value="absent" ${status==='absent'?'selected':''}>Absent</option>
            <option value="excused" ${status==='excused'?'selected':''}>Excused</option>
          </select>
        </td>
        <td><input type="text" class="att-note" data-student="${s.studentId}" placeholder="optional note" value="${note}"></td>
      </tr>
    `;
  }).join('');

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs">
        <a href="#/">Dashboard</a> <span>&rsaquo;</span>
        <a href="#/course/${courseId}">${course.courseName}</a> <span>&rsaquo;</span>
        <a href="#/course/${courseId}/group/${groupId}">Group ${groupId}</a> <span>&rsaquo;</span>
        <span>Attendance</span>
      </nav>
      <h1>Take Attendance</h1>
      <div class="course-meta">${course.courseName} &middot; Group ${groupId}</div>

      <form id="attendanceDateForm" class="inline-edit-form" style="margin:12px 0;">
        <label style="display:flex;align-items:center;gap:8px;">Date
          <input type="date" id="attendanceDate" value="${date}">
        </label>
        <button type="submit" class="btn-ghost btn-small">Go</button>
      </form>

      <h2 class="section-heading">Import from a File</h2>
      <p class="field-hint">For online classes already tracked elsewhere — Excel, CSV, PDF, or Word. This only fills in the table below — nothing is saved until you review it and click "Save Attendance." PDF and Word tables are read automatically but are less reliable than Excel/CSV, so double-check the results.</p>
      <form id="attendanceImportForm" class="inline-edit-form" style="flex-wrap:wrap;">
        <input type="file" id="attendanceImportFile" accept=".xlsx,.xls,.csv,.pdf,.docx">
        <button type="submit" class="btn-ghost btn-small" id="attendanceImportBtn">Read File</button>
      </form>
      <div id="attendanceImportSummary" hidden></div>

      <div class="table-wrap" style="margin-top:16px;">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Status</th><th>Note</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="assessment-form-actions" style="margin-top:16px;">
        <button id="saveAttendanceBtn" class="btn-primary">Save Attendance for ${fmtDate(date)}</button>
        <span id="attendanceSaved" class="field-hint" hidden>Saved.</span>
      </div>

      <h2 class="section-heading">Attendance Sheet for ${fmtDate(date)}</h2>
      <p class="field-hint">Optional backup evidence — a photo or scan of the paper sign-in sheet for this exact session, in case attendance is ever questioned. ${TeacherBackend.mode === 'local' ? 'Stored in this browser only (Local Demo Mode).' : 'Stored in Firebase Storage.'}</p>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>File</th><th>Note</th><th></th></tr></thead>
          <tbody id="attendanceSheetRows"></tbody>
        </table>
      </div>
      <form id="attendanceSheetForm" class="inline-edit-form" style="margin-top:10px;flex-wrap:wrap;">
        <input type="file" id="attendanceSheetFile" accept="image/*,.pdf" required>
        <input type="text" id="attendanceSheetNote" placeholder="optional note">
        <button type="submit" class="btn-ghost btn-small" id="attendanceSheetUploadBtn">Upload Sheet</button>
        <span id="attendanceSheetError" class="signin-error" hidden></span>
      </form>

      <h2 class="section-heading">Fix a Date</h2>
      <p class="field-hint">Logged a whole class session under the wrong day? Move every record for this group from one date to another in one step — a student who already has a record on the target date is left untouched rather than overwritten.</p>
      <form id="moveDateForm" class="inline-edit-form" style="flex-wrap:wrap;">
        <label style="display:flex;align-items:center;gap:8px;">From <input type="date" id="moveFromDate" value="${date}"></label>
        <label style="display:flex;align-items:center;gap:8px;">To <input type="date" id="moveToDate"></label>
        <button type="submit" class="btn-ghost btn-small">Move</button>
        <span id="moveDateResult" class="field-hint" hidden></span>
      </form>
    </main>
  `;
  wireTopbar();

  el('attendanceDateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    location.hash = `#/course/${courseId}/group/${groupId}/attendance/${encodeURIComponent(el('attendanceDate').value)}`;
  });

  el('attendanceImportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = el('attendanceImportFile').files[0];
    const summaryEl = el('attendanceImportSummary');
    if(!file){
      summaryEl.hidden = false; summaryEl.className = 'import-summary has-warnings';
      summaryEl.innerHTML = 'Choose a file first.';
      return;
    }
    const btn = el('attendanceImportBtn');
    btn.disabled = true; btn.textContent = 'Reading…';
    try{
      const rawRows = await parseAttendanceFile(file);
      const { matched, unmatchedRows, unmatchedStudents } = matchAttendanceRows(rawRows, group.students);
      matched.forEach(m => {
        const sel = document.querySelector(`.att-status[data-student="${m.studentId}"]`);
        if(sel) sel.value = m.status;
      });
      const hasWarnings = unmatchedRows.length > 0 || unmatchedStudents.length > 0;
      summaryEl.hidden = false;
      summaryEl.className = 'import-summary' + (hasWarnings ? ' has-warnings' : '');
      let html = `<strong>Read ${rawRows.length} row${rawRows.length===1?'':'s'} — filled in ${matched.length} student${matched.length===1?'':'s'}.</strong> Review the table below, then click "Save Attendance" to make it official.`;
      if(unmatchedRows.length){
        html += `<div style="margin-top:8px;">${unmatchedRows.length} row${unmatchedRows.length===1?'':'s'} in the file could not be filled in automatically:<ul>${unmatchedRows.map(r => `<li>${r.label} — ${r.reason}</li>`).join('')}</ul></div>`;
      }
      if(unmatchedStudents.length){
        html += `<div style="margin-top:8px;">${unmatchedStudents.length} student${unmatchedStudents.length===1?'':'s'} in this group had no row in the file, left unchanged:<ul>${unmatchedStudents.map(s => `<li>${s.name}</li>`).join('')}</ul></div>`;
      }
      summaryEl.innerHTML = html;
    } catch(err){
      summaryEl.hidden = false; summaryEl.className = 'import-summary has-warnings';
      summaryEl.innerHTML = err.message || 'Could not read that file.';
    } finally {
      btn.disabled = false; btn.textContent = 'Read File';
    }
  });

  el('saveAttendanceBtn').addEventListener('click', async () => {
    const records = {};
    document.querySelectorAll('.att-status').forEach(sel => {
      const studentId = sel.dataset.student;
      const noteInput = document.querySelector(`.att-note[data-student="${studentId}"]`);
      records[studentId] = { status: sel.value, note: noteInput ? noteInput.value.trim() : '' };
    });
    await TeacherBackend.setGroupAttendanceBulk(courseId, groupId, date, records);
    ROSTER = await TeacherBackend.getRoster();
    el('attendanceSaved').hidden = false;
    setTimeout(() => { el('attendanceSaved').hidden = true; }, 1800);
  });

  el('moveDateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fromDate = el('moveFromDate').value;
    const toDate = el('moveToDate').value;
    const resultEl = el('moveDateResult');
    if(!fromDate || !toDate){ resultEl.textContent = 'Pick both dates.'; resultEl.hidden = false; return; }
    if(fromDate === toDate){ resultEl.textContent = 'Those are the same date.'; resultEl.hidden = false; return; }
    if(!confirm(`Move every attendance record for Group ${groupId} from ${fmtDate(fromDate)} to ${fmtDate(toDate)}?`)) return;
    const { moved, skipped } = await TeacherBackend.moveGroupAttendanceDate(courseId, groupId, fromDate, toDate);
    ROSTER = await TeacherBackend.getRoster();
    resultEl.textContent = `Moved ${moved} record${moved===1?'':'s'}.` + (skipped > 0 ? ` ${skipped} skipped (already had a record on the target date).` : '');
    resultEl.hidden = false;
    if(toDate === date){ renderAttendance(courseId, groupId, date); }
  });

  renderAttendanceSheetRows(courseId, groupId, date);
  el('attendanceSheetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = el('attendanceSheetError');
    errEl.hidden = true;
    const file = el('attendanceSheetFile').files[0];
    if(!file){ errEl.textContent = 'Choose a file first.'; errEl.hidden = false; return; }
    const btn = el('attendanceSheetUploadBtn');
    btn.disabled = true; btn.textContent = 'Uploading…';
    try{
      await TeacherBackend.uploadAttendanceSheet(courseId, groupId, file, { date, note: el('attendanceSheetNote').value.trim() });
      ROSTER = await TeacherBackend.getRoster();
      el('attendanceSheetFile').value = '';
      el('attendanceSheetNote').value = '';
      renderAttendanceSheetRows(courseId, groupId, date);
    } catch(err){
      errEl.textContent = err.message || 'Upload failed.';
      errEl.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Upload Sheet';
    }
  });
}

function renderAttendanceSheetRows(courseId, groupId, date){
  const group = findGroup(courseId, groupId);
  const sheets = (group.attendanceSheets || []).filter(sh => sh.date === date);
  el('attendanceSheetRows').innerHTML = sheets.map(sh => `
    <tr>
      <td>${evidenceTypeIcon(sh.fileType)} ${sh.fileName}<div class="field-hint">${fmtBytes(sh.sizeBytes)}</div></td>
      <td>${sh.note || '—'}</td>
      <td class="table-actions">
        <button class="btn-ghost btn-small view-sheet" data-sheet="${sh.id}">View</button>
        <button class="btn-ghost btn-small btn-danger delete-sheet" data-sheet="${sh.id}">Delete</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="3" class="empty-note">No sheet uploaded for this date.</td></tr>`;

  el('attendanceSheetRows').querySelectorAll('.view-sheet').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sh = sheets.find(x => x.id === btn.dataset.sheet);
      const url = await TeacherBackend.getAttendanceSheetURL(sh);
      if(url) window.open(url, '_blank');
      else alert('Could not load this file.');
    });
  });
  el('attendanceSheetRows').querySelectorAll('.delete-sheet').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sh = sheets.find(x => x.id === btn.dataset.sheet);
      if(!confirm(`Delete "${sh.fileName}"?`)) return;
      await TeacherBackend.deleteAttendanceSheet(courseId, groupId, sh);
      ROSTER = await TeacherBackend.getRoster();
      renderAttendanceSheetRows(courseId, groupId, date);
    });
  });
}

/* ===================== STUDENT PROFILE ===================== */
function renderStudent(courseId, groupId, studentId){
  const course = findCourse(courseId);
  const group = course && findGroup(courseId, groupId);
  const student = group && findStudent(courseId, groupId, studentId);
  if(!course || !group || !student){ location.hash = '#/'; return; }

  const grade = computeStudentGrade(course, student);
  const att = computeAttendanceStats(student);
  const status = computeStudentStatus(course, student);
  const finalIntegration = computeFinalGradeIntegration(course, grade);

  const cloRows = computeStudentCLOAttainment(course, student);
  const speakingRows = computeSpeakingDevelopment(course, student);
  const timelineEvents = computeStudentTimeline(course, student);

  const assessmentRows = (course.assessments || []).slice().sort((a,b) => (a.week||'').localeCompare(b.week||'')).map(a => {
    const entry = (student.scores || {})[a.id] || { status: 'not-graded', score: null };
    const cat = categoryFor(course, a.categoryId);
    const rubric = a.rubricId ? TEACHER_RUBRICS[a.rubricId] : null;
    const rubricGradeable = isRubricGradeable(rubric);

    if(rubricGradeable){
      const statusLabel = entry.status === 'graded' ? 'Graded' : entry.status === 'excused' ? 'Excused' : 'Not Yet Graded';
      return `
        <tr>
          <td>${a.title}<div class="field-hint">${cat ? cat.label : ''} &middot; Week ${a.week || '—'} &middot; ${a.weight}% &middot; ${rubric.title}</div></td>
          <td>${statusLabel}</td>
          <td>${entry.status==='graded' && entry.score !== null ? `${entry.score} / ${a.maxScore}` : '—'}</td>
          <td><button class="btn-ghost btn-small open-rubric" data-assessment="${a.id}">${entry.status==='graded' ? 'Edit Rubric Score' : 'Grade with Rubric'}</button></td>
        </tr>
      `;
    }
    return `
      <tr>
        <td>${a.title}<div class="field-hint">${cat ? cat.label : ''} &middot; Week ${a.week || '—'} &middot; ${a.weight}%</div></td>
        <td>
          <select class="score-status" data-assessment="${a.id}">
            <option value="not-graded" ${entry.status==='not-graded'?'selected':''}>Not Yet Graded</option>
            <option value="graded" ${entry.status==='graded'?'selected':''}>Graded</option>
            <option value="excused" ${entry.status==='excused'?'selected':''}>Excused</option>
          </select>
        </td>
        <td><input type="number" class="score-value" data-assessment="${a.id}" data-max="${a.maxScore}" min="0" max="${a.maxScore}" placeholder="/ ${a.maxScore}" value="${entry.status==='graded' && entry.score !== null ? entry.score : ''}" ${entry.status!=='graded'?'disabled':''}></td>
        <td><button class="btn-ghost btn-small save-score" data-assessment="${a.id}">Save</button></td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="4" class="empty-note">No assessments defined for this course yet.</td></tr>`;

  const categorySummaryRows = (course.categories || []).map(cat => {
    const summary = computeCategoryScoreSummary(course, student, cat.id);
    const weightedScore = summary.pct !== null ? Math.round(summary.pct / 100 * cat.weight * 10) / 10 : null;
    const evidenceHint = summary.totalActivities > 0 ? `${summary.evidenceCount} of ${summary.totalActivities} activities graded` : 'No individual activities recorded';
    if(cat.id === 'attendance'){
      return `
        <tr>
          <td>${cat.label}<div class="field-hint">Auto-calculated from attendance records</div></td>
          <td>${cat.weight}%</td>
          <td>${summary.score === null ? 'Not Yet Graded' : summary.score}</td>
          <td>${weightedScore === null ? '—' : weightedScore}</td>
          <td></td>
        </tr>
      `;
    }
    return `
      <tr>
        <td>${cat.label}<div class="field-hint">${evidenceHint}${summary.suggestedPct !== null ? ` &middot; Suggested: ${summary.suggestedPct}` : ''}</div></td>
        <td>${cat.weight}%</td>
        <td><input type="number" class="cat-summary-score" data-category="${cat.id}" min="0" max="100" placeholder="${summary.score === null ? 'Not Yet Graded' : ''}" value="${summary.score === null ? '' : summary.score}"></td>
        <td class="cat-summary-weighted" data-category="${cat.id}">${weightedScore === null ? '—' : weightedScore}</td>
        <td><button class="btn-ghost btn-small save-cat-summary" data-category="${cat.id}">Save</button></td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="5" class="empty-note">No assessment categories defined for this course yet.</td></tr>`;

  const attendanceRows = (student.attendance || []).map(r => `
    <tr><td>${fmtDate(r.date)}</td><td>${r.status.charAt(0).toUpperCase()+r.status.slice(1)}</td><td>${r.note || '—'}</td></tr>
  `).join('') || `<tr><td colspan="3" class="empty-note">No attendance recorded yet.</td></tr>`;

  const evidenceRows = (student.evidence || []).map(ev => {
    const linkedA = ev.linkedAssessmentId ? (course.assessments || []).find(a => a.id === ev.linkedAssessmentId) : null;
    return `
      <tr>
        <td>${evidenceTypeIcon(ev.fileType)} ${ev.fileName}<div class="field-hint">${fmtBytes(ev.sizeBytes)} &middot; ${fmtDate(ev.uploadedAt.slice(0,10))}</div></td>
        <td>${ev.description || '—'}${ev.tag ? `<div class="field-hint">${ev.tag}</div>` : ''}</td>
        <td>${linkedA ? linkedA.title : '—'}</td>
        <td class="table-actions">
          <button class="btn-ghost btn-small view-evidence" data-evidence="${ev.id}">View</button>
          <button class="btn-ghost btn-small btn-danger delete-evidence" data-evidence="${ev.id}">Delete</button>
        </td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="4" class="empty-note">No evidence uploaded yet. A grade works fine without any — evidence is optional supporting material.</td></tr>`;

  const evidenceAssessmentOptions = ['<option value="">Not linked to a specific assessment</option>'].concat(
    (course.assessments || []).map(a => `<option value="${a.id}">${a.title}</option>`)
  ).join('');

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs">
        <a href="#/">Dashboard</a> <span>&rsaquo;</span>
        <a href="#/course/${courseId}">${course.courseName}</a> <span>&rsaquo;</span>
        <a href="#/course/${courseId}/group/${groupId}">Group ${groupId}</a> <span>&rsaquo;</span>
        <span>${student.name}</span>
      </nav>

      <div class="profile-header">
        ${genderIcon(student.gender, 40)}
        <div>
          <h1>${student.title} ${student.name}</h1>
          <div class="profile-sub">${course.courseName} &middot; Group ${groupId} &middot; Student ID ${student.studentId}</div>
        </div>
      </div>
      <div class="course-actions">
        <a class="btn-ghost btn-small" href="#/course/${courseId}/group/${groupId}/student/${studentId}/report">${icon('file',{size:14})} Print / Save as PDF</a>
        <button class="btn-ghost btn-small" id="exportStudentRecordBtn">${icon('download',{size:14})} Export CSV</button>
      </div>

      <div class="profile-grid">
        <section class="profile-card">
          <h2>Basic Information</h2>
          <dl class="profile-dl">
            <dt>Official name</dt><dd>${student.title} ${student.name}</dd>
            <dt>Student ID</dt><dd>${student.studentId}</dd>
            <dt>Course</dt><dd>${course.courseName}</dd>
            <dt>Group</dt><dd>${groupId}</dd>
            <dt>Gender</dt><dd>${student.gender === 'M' ? 'Male' : 'Female'}</dd>
            <dt>GPAX (reference only)</dt><dd>${student.gpax ? student.gpax.toFixed(2) : '—'}</dd>
          </dl>
        </section>

        <section class="profile-card">
          <h2>Nickname</h2>
          <p class="field-hint">Shown next to the official name on the student list. The official name above never changes.</p>
          <form id="nicknameForm" class="inline-edit-form">
            <input type="text" id="nicknameInput" value="${student.nickname || ''}" placeholder="e.g. Mimi">
            <button type="submit" class="btn-primary btn-small">Save</button>
          </form>
        </section>

        <section class="profile-card profile-card--wide">
          <h2>Academic Summary</h2>
          <dl class="profile-dl profile-dl--grid4">
            <dt>Current Grade</dt><dd>${fmtPct(grade.currentPct)} ${grade.letter ? `(${grade.letter.grade})` : ''}</dd>
            <dt>Graded so far</dt><dd>${grade.gradedWeight.toFixed(1)}% of grade</dd>
            <dt>Not yet graded</dt><dd>${grade.remainingWeight.toFixed(1)}% of grade</dd>
            <dt>Attendance</dt><dd>${att.pct === null ? '—' : att.pct + '%'} (${att.present} present, ${att.late} late, ${att.absent} absent, ${att.excused} excused)</dd>
            ${finalIntegration ? `<dt>Final Grade Integration (${finalIntegration.finalWeightPct}%)</dt><dd>${finalIntegration.integratedScore === null ? '—' : `${finalIntegration.integratedScore} / ${finalIntegration.finalWeightPct}`}</dd>` : ''}
          </dl>
          <div style="margin-top:10px;">${statusPill(status)}${absencePill(student)}</div>
          ${grade.excusedWeight > 0 ? `<p class="field-hint">${grade.excusedWeight.toFixed(1)}% of the grade is excused and excluded from this calculation entirely.</p>` : ''}
          ${finalIntegration ? `<p class="field-hint">This course is ${finalIntegration.finalWeightPct}% of the student's total final grade — the remaining ${100 - finalIntegration.finalWeightPct}% comes from elsewhere. ${finalIntegration.integratedScore !== null ? `Their ${fmtPct(grade.currentPct)} grade here converts to ${finalIntegration.integratedScore} out of ${finalIntegration.finalWeightPct} points toward that total.` : ''}</p>` : ''}
        </section>

        <section class="profile-card profile-card--wide">
          <h2>Assessment Summary</h2>
          <p class="field-hint">The overall score entered per category is what contributes to Current Grade above. Individual activities in Assessment History below remain available as evidence supporting each category score, but are never auto-averaged in.</p>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Assessment</th><th>Weight</th><th>Overall Score</th><th>Weighted Score</th><th></th></tr></thead>
              <tbody id="categorySummaryRows">${categorySummaryRows}</tbody>
            </table>
          </div>
        </section>

        <section class="profile-card profile-card--wide">
          <h2>Assessment History</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Assessment</th><th>Status</th><th>Score</th><th></th></tr></thead>
              <tbody id="assessmentScoreRows">${assessmentRows}</tbody>
            </table>
          </div>
        </section>

        <div id="rubricPanelContainer" class="profile-card--wide"></div>

        <section class="profile-card profile-card--wide">
          <h2>Speaking Development</h2>
          <p class="field-hint">Only tasks graded with the rubric panel show here, since that's the only place criterion-level scores get recorded.</p>
          ${speakingRows.length === 0 ? '<p class="empty-note">No rubric-graded speaking tasks yet.</p>' : `
            <div class="speaking-chart-wrap">${buildSpeakingChartSVG(speakingRows)}</div>
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr><th>Task</th><th>Score</th>${speakingRows[0].criteria.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
                <tbody>
                  ${speakingRows.map(r => `
                    <tr>
                      <td>${r.title}${r.week ? `<div class="field-hint">Week ${r.week}</div>` : ''}</td>
                      <td>${r.score} / ${r.maxScore}</td>
                      ${r.criteria.map(c => `<td>${c.level || '—'}/4</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </section>

        <section class="profile-card profile-card--wide">
          <h2>CLO Attainment</h2>
          <p class="field-hint">Calculated from this student's graded assessments only — a CLO with no graded work linked to it yet shows "Not yet assessed" rather than 0%.</p>
          <div class="clo-list">
            ${cloRows.map(r => `
              <div class="clo-row">
                <div class="clo-row-head"><b>${r.cloId}</b><span>${r.pct === null ? 'Not yet assessed' : fmtPct(r.pct)}</span></div>
                <div class="clo-bar"><div class="clo-bar-fill" style="width:${r.pct === null ? 0 : Math.min(100, r.pct)}%"></div></div>
                <p class="field-hint">${r.text}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="profile-card profile-card--wide">
          <h2>Attendance History</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Date</th><th>Status</th><th>Note</th></tr></thead>
              <tbody>${attendanceRows}</tbody>
            </table>
          </div>
        </section>

        <section class="profile-card profile-card--wide">
          <h2>Evidence / Portfolio</h2>
          <p class="field-hint">Optional supporting material — videos, documents, images. A grade never requires evidence; this is just where to keep it if you have it. ${TeacherBackend.mode === 'local' ? 'Stored in this browser only (Local Demo Mode) — not synced anywhere.' : 'Stored in Firebase Storage.'}</p>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>File</th><th>Description</th><th>Linked Assessment</th><th></th></tr></thead>
              <tbody id="evidenceRows">${evidenceRows}</tbody>
            </table>
          </div>
          <form id="evidenceForm" class="assessment-form" style="margin-top:12px;">
            <label>File
              <input type="file" id="evidenceFile" required>
            </label>
            <label>Description
              <input type="text" id="evidenceDescription" placeholder="e.g. Speaking Role Play 1 recording">
            </label>
            <label>Tag
              <select id="evidenceTag">
                <option value="">No tag</option>
                <option value="Speaking">Speaking</option>
                <option value="Assignment">Assignment</option>
                <option value="Feedback">Feedback</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>Link to assessment
              <select id="evidenceAssessment">${evidenceAssessmentOptions}</select>
            </label>
            <div class="assessment-form-actions">
              <button type="submit" class="btn-primary btn-small" id="evidenceUploadBtn">Upload</button>
              <span id="evidenceError" class="signin-error" hidden></span>
            </div>
          </form>
        </section>

        <section class="profile-card profile-card--wide">
          <h2>Timeline</h2>
          <p class="field-hint">Every graded assessment, attendance record, and evidence upload for this student, oldest first.</p>
          ${timelineEvents.length === 0 ? '<p class="empty-note">Nothing recorded yet this term.</p>' : `
            <div class="timeline-list">
              ${timelineEvents.map(ev => `
                <div class="timeline-row">
                  ${icon(ev.type === 'score' ? 'clipboard' : ev.type === 'attendance' ? 'check' : 'file', { size: 16, className: 'icon-inline' })}
                  <span class="timeline-date">${fmtDate(ev.time.slice(0,10))}</span>
                  <span class="timeline-label">${ev.label}</span>
                  <span class="field-hint">${ev.detail}</span>
                </div>
              `).join('')}
            </div>
          `}
        </section>

        <section class="profile-card profile-card--wide">
          <h2>Private Teacher Notes</h2>
          <p class="field-hint">Never shown to students or on the public site. Visible only here.</p>
          <form id="notesForm" class="inline-edit-form inline-edit-form--stack">
            <textarea id="notesInput" rows="4" placeholder="e.g. Needs more confidence when speaking. Strong vocabulary.">${student.notes || ''}</textarea>
            <button type="submit" class="btn-primary btn-small">Save notes</button>
          </form>
        </section>

        <section class="profile-card profile-card--wide">
          <h2>Danger Zone</h2>
          <p class="field-hint">Removes this student from this course/group entirely, including every score, attendance record, and uploaded evidence. This cannot be undone.</p>
          <button class="btn-ghost btn-small btn-danger" id="deleteStudentBtn">Delete ${student.name}</button>
        </section>
      </div>
    </main>
  `;
  wireTopbar();
  el('exportStudentRecordBtn').addEventListener('click', () => exportStudentRecordCSV(courseId, groupId, studentId));
  el('deleteStudentBtn').addEventListener('click', async () => {
    if(!confirm(`Delete ${student.name}? All their scores, attendance, and evidence in this course will be permanently removed.`)) return;
    await TeacherBackend.deleteStudent(courseId, groupId, studentId);
    ROSTER = await TeacherBackend.getRoster();
    location.hash = `#/course/${courseId}/group/${groupId}`;
  });

  el('nicknameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = el('nicknameInput').value.trim();
    await TeacherBackend.updateStudent(courseId, groupId, studentId, { nickname: val });
    student.nickname = val;
    showSaved('nicknameForm');
  });
  el('notesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = el('notesInput').value;
    await TeacherBackend.updateStudent(courseId, groupId, studentId, { notes: val });
    student.notes = val;
    showSaved('notesForm');
  });

  document.querySelectorAll('.score-status').forEach(sel => {
    sel.addEventListener('change', () => {
      const input = document.querySelector(`.score-value[data-assessment="${sel.dataset.assessment}"]`);
      input.disabled = sel.value !== 'graded';
      if(sel.value !== 'graded') input.value = '';
    });
  });
  document.querySelectorAll('.save-score').forEach(btn => {
    btn.addEventListener('click', async () => {
      const assessmentId = btn.dataset.assessment;
      const status = document.querySelector(`.score-status[data-assessment="${assessmentId}"]`).value;
      const input = document.querySelector(`.score-value[data-assessment="${assessmentId}"]`);
      const max = Number(input.dataset.max);
      let score = null;
      if(status === 'graded'){
        score = Number(input.value);
        if(input.value === '' || isNaN(score)){ alert('Enter a score, or change status to Not Yet Graded / Excused.'); return; }
        if(score < 0 || score > max){ alert(`Score must be between 0 and ${max}.`); return; }
      }
      await TeacherBackend.setStudentScore(courseId, groupId, studentId, assessmentId, { status, score });
      ROSTER = await TeacherBackend.getRoster();
      renderStudent(courseId, groupId, studentId);
    });
  });

  document.querySelectorAll('.save-cat-summary').forEach(btn => {
    btn.addEventListener('click', async () => {
      const categoryId = btn.dataset.category;
      const input = document.querySelector(`.cat-summary-score[data-category="${categoryId}"]`);
      const raw = input.value.trim();
      if(raw === ''){
        await TeacherBackend.setStudentCategoryScore(courseId, groupId, studentId, categoryId, { status: 'not-graded', score: null, maxScore: 100 });
      } else {
        const score = Number(raw);
        if(isNaN(score) || score < 0 || score > 100){ alert('Score must be between 0 and 100.'); return; }
        await TeacherBackend.setStudentCategoryScore(courseId, groupId, studentId, categoryId, { status: 'graded', score, maxScore: 100 });
      }
      ROSTER = await TeacherBackend.getRoster();
      renderStudent(courseId, groupId, studentId);
    });
  });

  document.querySelectorAll('.open-rubric').forEach(btn => {
    btn.addEventListener('click', () => {
      openRubricPanel(courseId, groupId, studentId, btn.dataset.assessment);
    });
  });

  el('evidenceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = el('evidenceError');
    errEl.hidden = true;
    const fileInput = el('evidenceFile');
    const file = fileInput.files[0];
    if(!file){ errEl.textContent = 'Choose a file first.'; errEl.hidden = false; return; }
    const btn = el('evidenceUploadBtn');
    btn.disabled = true; btn.textContent = 'Uploading…';
    try{
      await TeacherBackend.uploadEvidence(courseId, groupId, studentId, file, {
        description: el('evidenceDescription').value.trim(),
        tag: el('evidenceTag').value,
        linkedAssessmentId: el('evidenceAssessment').value || null
      });
      ROSTER = await TeacherBackend.getRoster();
      renderStudent(courseId, groupId, studentId);
    } catch(err){
      btn.disabled = false; btn.textContent = 'Upload';
      errEl.textContent = err.message || 'Upload failed.';
      errEl.hidden = false;
    }
  });

  document.querySelectorAll('.view-evidence').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ev = (student.evidence || []).find(x => x.id === btn.dataset.evidence);
      if(!ev) return;
      const url = await TeacherBackend.getEvidenceURL(ev);
      if(url) window.open(url, '_blank');
      else alert('Could not load this file. It may have been removed from local storage.');
    });
  });
  document.querySelectorAll('.delete-evidence').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ev = (student.evidence || []).find(x => x.id === btn.dataset.evidence);
      if(!ev) return;
      if(!confirm(`Delete "${ev.fileName}"? This cannot be undone.`)) return;
      await TeacherBackend.deleteEvidence(courseId, groupId, studentId, ev);
      ROSTER = await TeacherBackend.getRoster();
      renderStudent(courseId, groupId, studentId);
    });
  });
}

/* ===================== RUBRIC GRADING PANEL ===================== */
function criterionLevelOptions(rubric, criterion){
  return criterion.levels || (rubric.levelScale || []).map(l => ({ level: l.level, label: l.label, desc: '' }));
}

function openRubricPanel(courseId, groupId, studentId, assessmentId){
  const course = findCourse(courseId);
  const student = findStudent(courseId, groupId, studentId);
  const a = (course.assessments || []).find(x => x.id === assessmentId);
  const rubric = TEACHER_RUBRICS[a.rubricId];
  const existing = (student.scores || {})[a.id];
  const existingLevels = (existing && existing.rubric && existing.rubric.levels) || {};
  const existingFeedback = (existing && existing.rubric && existing.rubric.feedback) || {};

  const criteriaHTML = rubric.criteria.map(c => {
    const options = criterionLevelOptions(rubric, c);
    const selected = existingLevels[c.id] || '';
    return `
      <div class="rubric-criterion">
        <div class="rubric-criterion-head"><b>${c.label}</b><span class="rubric-criterion-max">${c.max} pts</span></div>
        <select class="rubric-level-select" data-criterion="${c.id}" data-max="${c.max}">
          <option value="">— Select level —</option>
          ${options.map(o => `<option value="${o.level}" ${String(selected)===String(o.level)?'selected':''}>${o.level} — ${o.label} (${computeCriterionScore(c, o.level)}/${c.max})</option>`).join('')}
        </select>
        <p class="rubric-criterion-desc" data-criterion-desc="${c.id}">${(options.find(o => String(o.level)===String(selected)) || {}).desc || ''}</p>
      </div>
    `;
  }).join('');

  el('rubricPanelContainer').innerHTML = `
    <section class="profile-card profile-card--wide rubric-panel">
      <h2>${rubric.title}</h2>
      <p class="field-hint">${a.title}</p>
      <div class="rubric-criteria">${criteriaHTML}</div>
      <div class="rubric-total">Rubric Total: <b id="rubricTotalDisplay">${(() => { const t = computeRubricTotal(rubric, existingLevels); return t === null ? '— (score every criterion)' : t + ' / ' + a.maxScore; })()}</b></div>
      <div class="rubric-feedback">
        <label>Teacher Feedback<textarea id="rubricComments" rows="2">${existingFeedback.comments || ''}</textarea></label>
        <label>Strengths<textarea id="rubricStrengths" rows="2">${existingFeedback.strengths || ''}</textarea></label>
        <label>Next Improvement Goal<textarea id="rubricImprovement" rows="2">${existingFeedback.improvement || ''}</textarea></label>
      </div>
      <div class="assessment-form-actions">
        <button id="saveRubricBtn" class="btn-primary">Save Rubric Score</button>
        <button id="cancelRubricBtn" class="btn-ghost">Cancel</button>
        <span id="rubricSaveError" class="signin-error" hidden></span>
      </div>
    </section>
  `;
  el('rubricPanelContainer').scrollIntoView({ behavior: 'smooth', block: 'center' });

  function currentLevels(){
    const levels = {};
    document.querySelectorAll('.rubric-level-select').forEach(sel => {
      if(sel.value) levels[sel.dataset.criterion] = Number(sel.value);
    });
    return levels;
  }
  function refreshTotal(){
    const total = computeRubricTotal(rubric, currentLevels());
    el('rubricTotalDisplay').textContent = total === null ? '— (score every criterion)' : total + ' / ' + a.maxScore;
  }

  document.querySelectorAll('.rubric-level-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const c = rubric.criteria.find(x => x.id === sel.dataset.criterion);
      const options = criterionLevelOptions(rubric, c);
      const chosen = options.find(o => String(o.level) === sel.value);
      document.querySelector(`.rubric-criterion-desc[data-criterion-desc="${c.id}"]`).textContent = chosen ? (chosen.desc || '') : '';
      refreshTotal();
    });
  });

  el('cancelRubricBtn').addEventListener('click', () => { el('rubricPanelContainer').innerHTML = ''; });
  el('saveRubricBtn').addEventListener('click', async () => {
    const levels = currentLevels();
    const total = computeRubricTotal(rubric, levels);
    const errEl = el('rubricSaveError');
    if(total === null){
      errEl.textContent = 'Score every criterion before saving.';
      errEl.hidden = false;
      return;
    }
    const feedback = {
      comments: el('rubricComments').value,
      strengths: el('rubricStrengths').value,
      improvement: el('rubricImprovement').value
    };
    await TeacherBackend.setStudentScore(courseId, groupId, studentId, assessmentId, {
      status: 'graded', score: total, rubric: { levels, feedback }
    });
    ROSTER = await TeacherBackend.getRoster();
    renderStudent(courseId, groupId, studentId);
  });
}

/* ===================== PRINTABLE INDIVIDUAL STUDENT REPORT ===================== */
function renderStudentReport(courseId, groupId, studentId){
  const course = findCourse(courseId);
  const group = course && findGroup(courseId, groupId);
  const student = group && findStudent(courseId, groupId, studentId);
  if(!course || !group || !student){ location.hash = '#/'; return; }

  const grade = computeStudentGrade(course, student);
  const att = computeAttendanceStats(student);
  const status = computeStudentStatus(course, student);
  const finalIntegration = computeFinalGradeIntegration(course, grade);
  const cloRows = computeStudentCLOAttainment(course, student);

  const assessmentRows = (course.assessments || []).slice().sort((a,b) => (a.week||'').localeCompare(b.week||'')).map(a => {
    const entry = (student.scores || {})[a.id];
    const cat = categoryFor(course, a.categoryId);
    const scoreText = !entry || entry.status === 'not-graded' ? 'Not Yet Graded' : entry.status === 'excused' ? 'Excused' : `${entry.score} / ${a.maxScore}`;
    const rubricFeedback = entry && entry.rubric && entry.rubric.feedback ? entry.rubric.feedback : null;
    return `
      <tr>
        <td>${a.title}<div class="field-hint">${cat ? cat.label : ''} &middot; Week ${a.week || '—'}</div>${rubricFeedback && rubricFeedback.strengths ? `<div class="field-hint">Strengths: ${rubricFeedback.strengths}</div>` : ''}${rubricFeedback && rubricFeedback.improvement ? `<div class="field-hint">Next goal: ${rubricFeedback.improvement}</div>` : ''}</td>
        <td>${a.weight}%</td>
        <td>${scoreText}</td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="3" class="empty-note">No assessments recorded.</td></tr>`;

  const attendanceRows = (student.attendance || []).map(r => `
    <tr><td>${fmtDate(r.date)}</td><td>${r.status.charAt(0).toUpperCase()+r.status.slice(1)}</td><td>${r.note || '—'}</td></tr>
  `).join('') || `<tr><td colspan="3" class="empty-note">No attendance recorded.</td></tr>`;

  const evidenceList = (student.evidence || []).map(ev => `<li>${ev.fileName}${ev.description ? ` — ${ev.description}` : ''}${ev.tag ? ` (${ev.tag})` : ''}</li>`).join('') || '<li class="empty-note">None uploaded.</li>';

  el('app').innerHTML = `
    <div class="report-toolbar no-print">
      <a href="#/course/${courseId}/group/${groupId}/student/${studentId}">&larr; Back to profile</a>
      <button id="printBtn" class="btn-primary btn-small">${icon('file',{size:14})} Print / Save as PDF</button>
    </div>
    <div class="report-page">
      <div class="report-header">
        <div class="report-org">Phuket Rajabhat University &middot; English Learning Hub &middot; Teacher Reference Only</div>
        <h1>Individual Student Report</h1>
      </div>

      <table class="report-meta-table">
        <tr><th>Official Name</th><td>${student.title} ${student.name}</td><th>Nickname</th><td>${student.nickname || '—'}</td></tr>
        <tr><th>Student ID</th><td>${student.studentId}</td><th>Gender</th><td>${student.gender === 'M' ? 'Male' : 'Female'}</td></tr>
        <tr><th>Course</th><td>${course.courseName}</td><th>Group</th><td>${groupId}</td></tr>
        <tr><th>Report Date</th><td colspan="3">${fmtDate(todayISO())}</td></tr>
      </table>

      <h2>Academic Summary</h2>
      <table class="report-meta-table">
        <tr><th>Current Grade</th><td>${fmtPct(grade.currentPct)} ${grade.letter ? `(${grade.letter.grade} — ${grade.letter.meaning})` : ''}</td><th>Status</th><td>${status}</td></tr>
        <tr><th>Graded So Far</th><td>${grade.gradedWeight.toFixed(1)}% of grade</td><th>Not Yet Graded</th><td>${grade.remainingWeight.toFixed(1)}% of grade</td></tr>
        <tr><th>Attendance</th><td colspan="3">${att.pct === null ? 'No records' : att.pct + '%'} (${att.present} present, ${att.late} late, ${att.absent} absent, ${att.excused} excused)${computeAbsenceFlag(student).level ? ` — ${computeAbsenceFlag(student).absences} absences: ${computeAbsenceFlag(student).level === 'exceeded' ? 'over the limit' : 'warning'}` : ''}</td></tr>
        ${finalIntegration ? `<tr><th>Final Grade Integration</th><td colspan="3">This course counts for ${finalIntegration.finalWeightPct}% of the total final grade (the remaining ${100 - finalIntegration.finalWeightPct}% comes from elsewhere) — ${finalIntegration.integratedScore === null ? 'not yet calculable' : `${finalIntegration.integratedScore} / ${finalIntegration.finalWeightPct} points toward the total`}.</td></tr>` : ''}
      </table>

      <h2>Assessment Results</h2>
      <table class="report-table">
        <thead><tr><th>Assessment</th><th>Weight</th><th>Score</th></tr></thead>
        <tbody>${assessmentRows}</tbody>
      </table>

      <h2>CLO Attainment</h2>
      <table class="report-table">
        <thead><tr><th>CLO</th><th>Description</th><th>Attainment</th></tr></thead>
        <tbody>${cloRows.map(r => `<tr><td>${r.cloId}</td><td>${r.text}</td><td>${r.pct === null ? 'Not yet assessed' : fmtPct(r.pct)}</td></tr>`).join('')}</tbody>
      </table>

      <h2>Attendance History</h2>
      <table class="report-table">
        <thead><tr><th>Date</th><th>Status</th><th>Note</th></tr></thead>
        <tbody>${attendanceRows}</tbody>
      </table>

      <h2>Evidence on File</h2>
      <ul>${evidenceList}</ul>

      <h2>Private Teacher Notes</h2>
      <p>${student.notes ? student.notes.replace(/\n/g, '<br>') : '<span class="empty-note">None recorded.</span>'}</p>
      <p class="field-hint" style="margin-top:24px;">Generated from the Teacher Dashboard. Internal use only — not for distribution to students.</p>
    </div>
  `;
  el('printBtn').addEventListener('click', () => window.print());
}

function showSaved(formId){
  const form = el(formId);
  const btn = form.querySelector('button');
  const original = btn.textContent;
  btn.textContent = 'Saved';
  setTimeout(() => { btn.textContent = original; }, 1400);
}

/* ===================== GLOBAL SEARCH ===================== */
function renderSearch(q){
  const query = (q || '').toLowerCase();
  const results = [];
  ROSTER.courses.forEach(course => {
    course.groups.forEach(group => {
      group.students.forEach(s => {
        if(s.name.toLowerCase().includes(query) || (s.nickname||'').toLowerCase().includes(query) || s.studentId.includes(query)){
          results.push({ course, group, student: s });
        }
      });
    });
  });

  const rows = results.map(r => `
    <a class="student-row" href="#/course/${r.course.courseId}/group/${r.group.groupId}/student/${r.student.studentId}">
      ${genderIcon(r.student.gender)}
      <span class="student-row-name">${r.student.name}${r.student.nickname ? ` <span class="student-row-nick">"${r.student.nickname}"</span>` : ''}</span>
      <span class="student-row-course">${r.course.courseName} &middot; Group ${r.group.groupId}</span>
      <span class="student-row-id">${r.student.studentId}</span>
    </a>
  `).join('') || '<p class="empty-note">No matches.</p>';

  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <span>Search: "${q}"</span></nav>
      <h1>Search results</h1>
      <div class="student-list">${rows}</div>
    </main>
  `;
  wireTopbar();
  el('globalSearchInput').value = q;
}

/* ===================== DEADLINES (live, for students) =====================
   One row per assignment in js/course-catalog.js. Saving writes ONE Firestore document
   (siteSettings/deadlines). Students' open pages re-read it every 30 seconds, so a change
   made here during class appears on their screens within about half a minute. A row left
   blank means "Deadline to be announced". */
const DEADLINE_RULES_SNIPPET = `match /siteSettings/{doc} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.uid == "${typeof TEACHER_UID === 'string' ? TEACHER_UID : 'YOUR_TEACHER_UID'}";
}`;
const FULL_RULES_TEXT = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public settings: students can read, only you can change.
    match /siteSettings/{doc} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == "${typeof TEACHER_UID === 'string' ? TEACHER_UID : 'YOUR_TEACHER_UID'}";
    }

    // Make-up quiz results: a student's browser can create one, only you can read or change them.
    match /makeupResults/{id} {
      allow create: if request.resource.data.keys().hasOnly(['studentId','name','receipt','form','finishedAt','why','p1','p2','p4','notesSuggested','objective','minutes','leaves','leaveSec','paste','answers'])
                    && request.resource.data.answers is string && request.resource.data.answers.size() < 30000;
    }

    // Released make-up results: a student can read ONLY the one document whose id (their receipt code) they know. Nobody can list them.
    match /makeupReleased/{receipt} {
      allow get: if true;
    }

    // Unit activity: a student's browser saves its latest result for each activity. Only you can read it.
    match /unitActivity/{id} {
      allow create, update: if request.resource.data.keys().hasOnly(['studentId','studentName','course','unit','unitKey','activity','score','status','ts','date'])
                            && request.resource.data.studentId is string && request.resource.data.studentId.size() < 40;
    }

    // Everything else: only you.
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == "${typeof TEACHER_UID === 'string' ? TEACHER_UID : 'YOUR_TEACHER_UID'}";
    }
  }
}`;
/* Asks Firestore the same way a student's browser does (no sign-in). Returns 'yes' (students can read it),
   'no' (the rule is not published or not matching), or 'unknown' (offline). A missing document still means
   the rule is fine. */
async function studentsCanRead(docName, coll){
  if(TeacherBackend.mode !== 'firebase') return 'unknown';
  try{
    const c = TEACHER_FIREBASE_CONFIG;
    const r = await fetch('https://firestore.googleapis.com/v1/projects/' + c.projectId + '/databases/(default)/documents/' + (coll || 'siteSettings') + '/' + docName + '?key=' + c.apiKey, { cache: 'no-store' });
    return (r.ok || r.status === 404) ? 'yes' : (r.status === 403 ? 'no' : 'unknown');
  }catch(e){ return 'unknown'; }
}
/* Same idea for saving: asks Firestore as a student's browser would, with no sign-in, whether the two "students can
   save" rules are published. It writes two tiny invisible test documents named _rulecheck (the Results screen skips
   them; the Unit Activity screen never lists the _test unit). 200 or 409 (already there) both mean "allowed". */
async function studentsCanWrite(){
  if(TeacherBackend.mode !== 'firebase') return 'unknown';
  const c = TEACHER_FIREBASE_CONFIG, base = 'https://firestore.googleapis.com/v1/projects/' + c.projectId + '/databases/(default)/documents/';
  const send = (url, method, fields) => fetch(url + (url.indexOf('?') < 0 ? '?' : '&') + 'key=' + c.apiKey, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) });
  try{
    const a = await send(base + 'unitActivity/_rulecheck', 'PATCH', { studentId: { stringValue: '_rulecheck' }, unitKey: { stringValue: '_test' }, activity: { stringValue: 'rule check' } });
    const b = await send(base + 'makeupResults?documentId=_rulecheck', 'POST', { studentId: { stringValue: '_rulecheck' }, answers: { stringValue: '{}' } });
    const ok = r => r.ok || r.status === 409;
    if(ok(a) && ok(b)) return 'yes';
    return (a.status === 403 || b.status === 403) ? 'no' : 'unknown';
  }catch(e){ return 'unknown'; }
}
async function studentsCanUseSite(){
  const [r, w, rel] = await Promise.all([studentsCanRead('makeupQuiz'), studentsCanWrite(), studentsCanRead('_rulecheck', 'makeupReleased')]);
  if(r === 'no' || w === 'no' || rel === 'no') return 'no';
  return (r === 'yes' && w === 'yes' && rel === 'yes') ? 'yes' : 'unknown';
}
function reachBanner(state){
  if(state === 'yes') return '<div class="mk-reach ok"><b>Rules are working.</b> Students can read the quiz setting and save their results here.</div>';
  if(state === 'no') return `<div class="mk-reach bad"><b>The Firebase rules are not fully published yet.</b> Firestore is blocking something students need: reading the quiz setting and deadlines, or saving their quiz and unit results to this dashboard. Fix: in the Firebase console open Firestore Database, then Rules, delete everything, paste the text below, and click Publish. Then press Check again.
    <pre class="deadline-rules">${escHtml(FULL_RULES_TEXT)}</pre></div>`;
  return '<div class="mk-reach warn">Could not check what students can read (offline or Local Demo Mode).</div>';
}
function allCatalogAssignments(){
  const rows = [];
  (typeof COURSE_CATALOG === 'undefined' ? [] : COURSE_CATALOG).forEach(c => c.units.forEach(u => {
    if(u.assignment) rows.push({ id: u.assignment.id, course: c.course, unit: u.short, title: u.assignment.title,
      defaultDate: u.assignment.dueDate || '', defaultNote: u.assignment.dueTimeNote || '' });
  }));
  return rows;
}
function escHtml(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

async function renderDeadlines(){
  const rows = allCatalogAssignments();
  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <span>Deadlines</span></nav>
      <h1>Assignment Deadlines</h1>
      <p class="field-hint">Change a date here and students see it on the Assignments page, on the assignment page, and inside the unit, within about 30 seconds. They do not need to reload. Leave a date empty for "Deadline to be announced".</p>
      ${TeacherBackend.mode === 'local' ? '<p class="field-hint" style="color:var(--danger);"><b>Local Demo Mode:</b> deadlines saved now stay in this browser only. Students will not see them until the dashboard is live.</p>' : ''}
      <div id="deadlinesBody"><p class="field-hint">Loading…</p></div>
    </main>
  `;
  wireTopbar();

  let saved = {};
  let loadError = '';
  try{ saved = await TeacherBackend.getDeadlines(); }
  catch(err){ loadError = err && err.message ? err.message : 'Could not load the saved deadlines.'; }

  const reach = await studentsCanRead('deadlines');
  const valueFor = (r) => saved[r.id] ? saved[r.id] : { dueDate: r.defaultDate, dueTimeNote: r.defaultNote };
  // group the assignments by course, in catalog order
  const byCourse = [];
  rows.forEach(r => { let g = byCourse.find(x => x.course === r.course); if(!g){ g = { course: r.course, items: [] }; byCourse.push(g); } g.items.push(r); });

  const startOfToday = () => { const t = new Date(); t.setHours(0,0,0,0); return t; };
  function whenInfo(dateStr){
    if(!dateStr) return { text: 'No date yet', cls: '' };
    const d = new Date(dateStr + 'T00:00:00');
    if(isNaN(d)) return { text: 'No date yet', cls: '' };
    const diff = Math.round((d - startOfToday()) / 86400000);
    const label = d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
    if(diff === 0) return { text: label + ' · due today', cls: 'soon' };
    if(diff > 0) return { text: label + ' · in ' + diff + ' day' + (diff === 1 ? '' : 's'), cls: diff <= 3 ? 'soon' : '' };
    return { text: label + ' · past due by ' + (-diff) + ' day' + (diff === -1 ? '' : 's'), cls: 'past' };
  }
  function chipFor(live, dateStr){
    if(!dateStr) return { text: 'Not set', cls: 'none' };
    return live ? { text: 'Live', cls: 'live' } : { text: 'Default', cls: 'default' };
  }
  const counts = { upcoming: 0, past: 0, none: 0 };
  rows.forEach(r => {
    const v = valueFor(r);
    if(!v.dueDate) counts.none++;
    else if(whenInfo(v.dueDate).cls === 'past') counts.past++;
    else counts.upcoming++;
  });

  el('deadlinesBody').innerHTML = `
    ${reach === 'no' ? reachBanner(reach) : ''}
    ${loadError ? `<div class="signin-error">${escHtml(loadError)}</div>` : ''}
    <div class="dl-summary">
      <div class="dl-stat"><b>${counts.upcoming}</b><span>Upcoming</span></div>
      <div class="dl-stat past"><b>${counts.past}</b><span>Past due</span></div>
      <div class="dl-stat none"><b>${counts.none}</b><span>No date yet</span></div>
    </div>
    ${byCourse.map(g => `
      <section class="dl-course">
        <h2>${escHtml(g.course)} <small>${g.items.length} assignment${g.items.length === 1 ? '' : 's'}</small></h2>
        <div class="dl-card">
          ${g.items.map(r => {
            const v = valueFor(r), live = !!saved[r.id], w = whenInfo(v.dueDate), ch = chipFor(live, v.dueDate);
            return `
            <div class="deadline-row" data-id="${escHtml(r.id)}">
              <div class="dl-main"><div class="deadline-title">${escHtml(r.title)}</div><div class="dl-unit">${escHtml(r.unit)}</div></div>
              <label class="dl-field"><span>Date</span><input type="date" data-field="dueDate" value="${escHtml(v.dueDate || '')}"></label>
              <label class="dl-field"><span>Time note</span><input type="text" data-field="dueTimeNote" value="${escHtml(v.dueTimeNote || '')}" placeholder="11:59 PM"></label>
              <div class="dl-state"><span class="dl-chip ${ch.cls}" data-chip>${ch.text}</span><span class="dl-when ${w.cls}" data-when>${escHtml(w.text)}</span></div>
              <div class="deadline-actions">
                <button type="button" class="btn-primary btn-small" data-save="${escHtml(r.id)}">Save</button>
                <button type="button" class="btn-ghost btn-small" data-clear="${escHtml(r.id)}">Clear</button>
                <span class="deadline-status" data-status="${escHtml(r.id)}"></span>
              </div>
            </div>`;
          }).join('')}
        </div>
      </section>`).join('')}
    <div class="deadline-setup">
      <h3>One-time setup for students to see changes</h3>
      <p class="field-hint">In the Firebase console, open Firestore Database, then Rules. Add this block inside <code>match /databases/{database}/documents { ... }</code> and click Publish. If you already did this, you do not need to do it again.</p>
      <pre class="deadline-rules">${escHtml(DEADLINE_RULES_SNIPPET)}</pre>
    </div>
  `;

  // keep the "in N days" text and the chip in step with the date being edited
  function refreshRow(row, live){
    const id = row.dataset.id, date = row.querySelector('[data-field="dueDate"]').value;
    const w = whenInfo(date), ch = chipFor(live, date);
    const wEl = row.querySelector('[data-when]'), cEl = row.querySelector('[data-chip]');
    wEl.textContent = w.text; wEl.className = 'dl-when ' + w.cls;
    cEl.textContent = ch.text; cEl.className = 'dl-chip ' + ch.cls;
  }
  document.querySelectorAll('.deadline-row [data-field="dueDate"]').forEach(inp => inp.addEventListener('input', () => {
    const row = inp.closest('.deadline-row');
    refreshRow(row, !!saved[row.dataset.id] && (saved[row.dataset.id].dueDate || '') === inp.value);
  }));

  async function persist(id, patch, statusEl){
    statusEl.textContent = 'Saving…'; statusEl.className = 'deadline-status';
    try{
      const map = Object.assign({}, saved);
      map[id] = Object.assign({ dueDate: '', dueTimeNote: '' }, map[id] || {}, patch);
      await TeacherBackend.setDeadlines(map);
      saved = map;
      statusEl.textContent = 'Saved';
      statusEl.className = 'deadline-status ok';
      const rowEl = statusEl.closest('.deadline-row'); if(rowEl) refreshRow(rowEl, true);
    } catch(err){
      const msg = (err && err.code === 'permission-denied')
        ? 'Not allowed. Publish the rule below, then try again.'
        : (err && err.message ? err.message : 'Could not save.');
      statusEl.textContent = msg; statusEl.className = 'deadline-status bad';
    }
  }
  document.querySelectorAll('[data-save]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.save;
    const row = document.querySelector(`.deadline-row[data-id="${id}"]`);
    persist(id, {
      dueDate: row.querySelector('[data-field="dueDate"]').value || '',
      dueTimeNote: row.querySelector('[data-field="dueTimeNote"]').value.trim()
    }, row.querySelector(`[data-status="${id}"]`));
  }));
  document.querySelectorAll('[data-clear]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.clear;
    const row = document.querySelector(`.deadline-row[data-id="${id}"]`);
    row.querySelector('[data-field="dueDate"]').value = '';
    persist(id, { dueDate: '', dueTimeNote: row.querySelector('[data-field="dueTimeNote"]').value.trim() }, row.querySelector(`[data-status="${id}"]`));
  }));
}

/* ===================== MAKE-UP QUIZ (live control) =====================
   The MICE make-up Long Quiz (Quiz Hub, quizzes/makeup.html). Open or close it, set the access code and the
   minutes here. Saving writes ONE Firestore document (siteSettings/makeupQuiz). The student page reads it, so
   no push to the site is needed. The code is saved only as a hash, so students cannot read it from the
   database. It is shown here in full only right after you set it. Same Firestore rule as the deadlines. */
async function mkHashCode(code){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('mice-lq-code|' + String(code).trim().toUpperCase()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function mkGenerateCode(prefix){
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const rnd = new Uint32Array(4); crypto.getRandomValues(rnd);
  return (prefix || 'MICE') + '-' + Array.from(rnd).map(n => chars[n % chars.length]).join('');
}
async function renderMakeupQuiz(quizKey){
  const key = quizKey === 'wellness' ? 'wellness' : 'mice', def = MK_QUIZZES[key], prefix = key === 'wellness' ? 'WELL' : 'MICE';
  const studentLink = 'https://mice-english-learning-hub.vercel.app/quizzes/' + def.page;
  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <span>Make-up Quiz</span></nav>
      <h1>${escHtml(def.title)}</h1>
      ${mkTabs(key, 'makeup-quiz')}
      <p class="field-hint">Open the quiz when your make-up session starts and close it when the session ends. Students use this link, or go to Quiz Hub, then Exams, and type the access code you tell them: <a href="${studentLink}" target="_blank" rel="noopener">${studentLink}</a>. The change reaches students within seconds. No push is needed. The quiz does not close by itself: press Close the quiz when your deadline passes.</p>
      ${TeacherBackend.mode === 'local' ? '<p class="field-hint" style="color:var(--danger);"><b>Local Demo Mode:</b> settings saved now stay in this browser only. Students will not see them until the Firebase sign-in is set up.</p>' : ''}
      <div id="mkBody"><p class="field-hint">Loading…</p></div>
    </main>
  `;
  wireTopbar();

  let cur = {}, loadError = '', shownCode = '', msg = '', msgOk = true, reach = 'checking';
  try{ cur = await TeacherBackend.getMakeup(def.doc); }
  catch(err){ loadError = err && err.message ? err.message : 'Could not load the saved settings.'; }

  function paint(){
    const open = !!cur.open, hasCode = !!cur.codeHash;
    el('mkBody').innerHTML = `
      <p><a class="btn-primary btn-small" href="#/makeup-results${key === 'mice' ? '' : '/wellness'}" style="display:inline-block;text-decoration:none;">See student results and enter marks</a></p>
      ${reach === 'checking' ? '<div class="mk-reach warn">Checking what students can read…</div>' : reachBanner(reach)}
      ${reach !== 'checking' ? '<p><button type="button" class="btn-ghost btn-small" id="mkRecheck">Check again</button></p>' : ''}
      ${loadError ? `<div class="signin-error">${escHtml(loadError)}</div>` : ''}
      <div class="mk-panel">
        <div class="mk-row"><b>Status:</b> <span class="mk-status ${open ? 'open' : 'closed'}">${open ? 'OPEN: students can start' : 'CLOSED'}</span>
          <span class="field-hint" style="margin:0;">${hasCode ? 'An access code is set.' : 'No access code yet. Students cannot start until you set one.'}</span></div>
        <div class="mk-row">
          <div class="mk-field"><label for="mkMinutes">Time limit (minutes)</label><input id="mkMinutes" type="number" min="5" max="240" value="${escHtml(cur.minutes || 60)}"></div>
          <div class="mk-field"><label for="mkCode">Access code</label><input id="mkCode" type="text" autocomplete="off" placeholder="${hasCode ? 'Leave empty to keep the current code' : 'Type a code, or press Generate'}"></div>
          <button type="button" class="btn-ghost btn-small" id="mkGen">Generate a code</button>
        </div>
        <div class="mk-row">
          <button type="button" class="btn-primary" id="mkOpen">${open ? 'Save and keep it open' : 'Open the quiz now'}</button>
          <button type="button" class="btn-ghost" id="mkClose">Close the quiz</button>
          <button type="button" class="btn-ghost" id="mkSave">Save settings only</button>
        </div>
        ${shownCode ? `<div class="mk-row"><div><div class="field-hint" style="margin:0;">Tell students this code (it is not shown again):</div><div class="mk-code-box">${escHtml(shownCode)}</div></div></div>` : ''}
        ${msg ? `<div class="deadline-status ${msgOk ? 'ok' : 'bad'}" style="display:block;margin-top:8px;">${escHtml(msg)}</div>` : ''}
      </div>
      <ul class="field-hint mk-notes">
        <li>Students already taking the quiz can finish when you close it. Closing only stops new starts.</li>
        <li>Parts 1, 2, and 4 are scored on the page. Part 3 has a suggested score. You mark Part 5 yourself from the sheet.</li>
        <li>The code is saved scrambled. If you forget it, set a new one and tell students.</li>
        <li>For a fair result, run it in a supervised session (computer room, or a video call with cameras on).</li>
      </ul>
      <div class="deadline-setup">
        <h3>One-time setup</h3>
        <p class="field-hint">Only needed if the box at the top says students cannot read the setting. Firebase console, then Firestore Database, then Rules. Replace everything with the text below, click Publish, and press Check again. If your Rules have other parts you need to keep, add the <code>siteSettings</code> block inside <code>match /databases/{database}/documents { ... }</code>.</p>
        <pre class="deadline-rules">${escHtml(FULL_RULES_TEXT)}</pre>
      </div>`;
    const rc = document.getElementById('mkRecheck');
    if(rc) rc.addEventListener('click', () => runReach());
    document.getElementById('mkGen').addEventListener('click', () => { document.getElementById('mkCode').value = mkGenerateCode(prefix); });
    document.getElementById('mkOpen').addEventListener('click', () => save({ open: true }));
    document.getElementById('mkClose').addEventListener('click', () => save({ open: false }));
    document.getElementById('mkSave').addEventListener('click', () => save({}));
  }
  async function save(patch){
    const minutes = parseInt(document.getElementById('mkMinutes').value, 10);
    const code = document.getElementById('mkCode').value.trim();
    if(!(minutes >= 5 && minutes <= 240)){ msg = 'Write a time limit between 5 and 240 minutes.'; msgOk = false; return paint(); }
    const next = Object.assign({ open: false, minutes: 60, codeHash: '' }, cur, patch, { minutes });
    shownCode = '';
    if(code){ next.codeHash = await mkHashCode(code); shownCode = code.toUpperCase(); }
    if(next.open && !next.codeHash){ msg = 'Set an access code first, so only your students can start.'; msgOk = false; return paint(); }
    msg = 'Saving…'; msgOk = true; paint();
    try{
      cur = await TeacherBackend.setMakeup(next, def.doc);
      msg = next.open ? 'Saved. The quiz is OPEN.' : 'Saved. The quiz is CLOSED.'; msgOk = true;
    }catch(err){
      shownCode = '';
      msg = (err && err.code === 'permission-denied') ? 'Not allowed. Publish the rule below, then try again.' : (err && err.message ? err.message : 'Could not save.');
      msgOk = false;
    }
    paint();
    runReach();
  }
  async function runReach(){ reach = 'checking'; paint(); reach = await studentsCanUseSite(); paint(); }
  paint();
  runReach();
}


/* ===================== MAKE-UP QUIZ RESULTS =====================
   One card for each student attempt (Firestore makeupResults/{receipt}, created by the student's browser when the quiz
   is sent). Parts 1, 2, and 4 are already scored. Part 3 starts at the suggested score. You enter the Part 3 score
   (if you change it) and the two writing scores, press Save, and the total out of 40 is kept with the attempt.
   The answer key is NOT in this page. Mark from your printed key (MICE-LongQuiz-Units9-11-MakeUp-FormB-AnswerKey). */
const MK_QUIZZES = {
  mice: { label: 'MICE Long Quiz', doc: 'makeupQuiz', modelDoc: 'makeupModel', form: 'B', page: 'makeup.html', data: '../quizzes/makeup-data.js',
    get: () => (typeof MAKEUP_QUIZ !== 'undefined' ? MAKEUP_QUIZ : null), title: 'Make-up Long Quiz: MICE Units 9 to 11', key: 'MICE-LongQuiz-Units9-11-MakeUp-FormB-AnswerKey' },
  wellness: { label: 'Wellness Long Quiz', doc: 'makeupQuizWellness', modelDoc: 'makeupModelWellness', form: 'WB', page: 'makeup-wellness.html', data: '../quizzes/makeup-wellness-data.js',
    get: () => (typeof MAKEUP_QUIZ_W !== 'undefined' ? MAKEUP_QUIZ_W : null), title: 'Make-up Long Quiz: Wellness Tourism Units 9 to 12', key: 'Wellness-LongQuiz-Units9-12-MakeUp-FormB-AnswerKey' }
};
const MK_DEFAULT_MARKS = [{ key: 'p3', label: 'Part 3 score (0 to 6)', max: 6, def: 'notesSuggested' }, { key: 'w1', label: 'Writing 1 (0 to 4)', max: 4 }, { key: 'w2', label: 'Writing 2 (0 to 4)', max: 4 }];
function mkTabs(active, base){
  return '<div class="mk-tabs">' + Object.keys(MK_QUIZZES).map(k => `<a class="mk-tab${k === active ? ' on' : ''}" href="#/${base}${k === 'mice' ? '' : '/' + k}">${escHtml(MK_QUIZZES[k].label)}</a>`).join('') + '</div>';
}
/* Loads one quiz's data file (questions and hashed key) and returns it. */
function loadMakeupQuizData(key){
  const def = MK_QUIZZES[key || 'mice'];
  if(def.get()) return Promise.resolve(def.get());
  return new Promise(res => { const sc = document.createElement('script'); sc.src = def.data; sc.onload = () => res(def.get()); sc.onerror = () => res(null); document.head.appendChild(sc); });
}

/* Builds the "review" a student sees after you release a result: for each question the student's answer, the correct
   answer, and whether it was right. The correct answers are worked out here from the scrambled key in makeup-data.js
   (the same check the quiz page uses), so no plain answer key is stored in the website. */
async function mkSha(Q, id, v){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(Q.salt + '|' + id + '|' + v));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}
async function mkBuildReview(Q, a){
  const out = {};
  for(const p of Q.parts){
    const ans = a[p.id] || {}; out[p.id] = [];
    if(p.type === 'mc' || p.type === 'tf'){
      const opts = p.type === 'tf' ? ['TRUE', 'FALSE'] : null;
      for(const it of p.items){
        let correct = '';
        for(const o of (opts || it.options)){ if(await mkSha(Q, it.id, o) === it.h){ correct = o; break; } }
        const you = ans[it.id] || '';
        out[p.id].push({ q: it.q, you, correct, ok: !!you && you === correct });
      }
    } else if(p.type === 'order'){
      for(const it of p.items){
        const seq = ans[it.id] || [], key = [];
        for(let k = 0; k < it.hs.length; k++){
          let found = '';
          for(const part of it.parts){ if(await mkSha(Q, it.id + '#' + k, part) === it.hs[k]){ found = part; break; } }
          key.push(found);
        }
        let c = 0; key.forEach((t, k) => { if(seq[k] && seq[k] === t) c += 1; });
        out[p.id].push({ title: it.title, you: seq.join(' '), correct: key.join(' '), pts: c === key.length ? 2 : (c >= 2 ? 1 : 0) });
      }
    } else if(p.type === 'notes'){
      p.items.forEach(it => { const n = ans[it.id] || {}; out[p.id].push({ title: it.title, text: it.text, who: n.who || '', what: n.what || n.req || '', contact: n.contact || '', follow: n.follow || n.time || '' }); });
    } else if(p.type === 'writing'){
      p.items.forEach(it => { out[p.id].push({ q: it.text, you: ans[it.id] || '' }); });
    }
  }
  return out;
}
async function renderMakeupResults(quizKey){
  const key = quizKey === 'wellness' ? 'wellness' : 'mice', def = MK_QUIZZES[key];
  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <a href="#/makeup-quiz${key === 'mice' ? '' : '/wellness'}">Make-up Quiz</a> <span>&rsaquo;</span> <span>Results</span></nav>
      <h1>Make-up Quiz Results</h1>
      ${mkTabs(key, 'makeup-results')}
      <p class="field-hint">The parts with fixed answers are scored for you. Read the written answers, type your scores, and press Save. Mark from your answer key. For the Notes part the page shows a suggestion, but you check the notes and type the score yourself.</p>
      <div id="mrBody"><p class="field-hint">Loading…</p></div>
    </main>`;
  wireTopbar();
  const Q = await loadMakeupQuizData(key);
  const rulesState = await studentsCanUseSite();
  let model = {}; try{ model = await TeacherBackend.getMakeupModel(def.modelDoc); }catch(e){ model = {}; }
  let rows = [], loadError = '';
  try{ rows = await TeacherBackend.listMakeupResults(); }
  catch(err){ loadError = (err && err.code === 'permission-denied') ? 'Not allowed to read the results. Sign in again.' : (err && err.message ? err.message : 'Could not load the results.'); }
  rows = rows.filter(r => r.id !== '_rulecheck' && (def.form === 'B' ? (!r.form || r.form === 'B') : r.form === def.form));
  rows.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
  const MK = (Q && Q.marks) || MK_DEFAULT_MARKS;
  const GRAND = Q ? Q.parts.reduce((a, p) => a + p.points, 0) : 40;
  const autoParts = Q ? Q.parts.filter(p => p.type === 'mc' || p.type === 'tf' || p.type === 'order') : [];
  const manualParts = Q ? Q.parts.filter(p => p.type === 'notes' || p.type === 'writing') : [];
  const parse = r => { try{ return JSON.parse(r.answers || '{}'); } catch(e){ return {}; } };
  const num = (v, max) => { const n = parseFloat(v); return isNaN(n) ? null : Math.max(0, Math.min(max, n)); };
  const totalOf = (r, m) => autoParts.reduce((a, p) => a + (r[p.id] || 0), 0) + MK.reduce((a, k) => a + (m[k.key] == null ? 0 : m[k.key]), 0);
  const marksOf = r => { const m = r.marks || {}, o = { comment: m.comment || '', saved: !!r.marks, stickers: m.stickers || {} }; MK.forEach(k => { o[k.key] = m[k.key]; }); return o; };   // nothing is filled in for you: you read the notes and type the score
  const when = ms => ms ? new Date(ms).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }) : '';
  const fmtMin = s => (s >= 60 ? Math.floor(s / 60) + ' min ' : '') + (s % 60) + ' s';

  function card(r){
    const m = marksOf(r), a = parse(r);
    const flags = [];
    if(r.leaves > 0) flags.push(`Left the page ${r.leaves} time${r.leaves === 1 ? '' : 's'} (${fmtMin(r.leaveSec || 0)})`);
    if(r.paste > 0) flags.push(`Tried to paste ${r.paste} time${r.paste === 1 ? '' : 's'}`);
    if(r.why === 'time') flags.push('Time ran out');
    const sections = manualParts.map(p => {
      const ans = a[p.id] || {};
      const body = p.items.map((it, i) => p.type === 'notes'
        ? `<div class="mr-call"><div class="mr-label">${escHtml(it.title)}</div><div class="mr-text">${escHtml(it.text)}</div>
            <div class="mr-notes"><b>Who:</b> ${escHtml((ans[it.id] || {}).who || '(empty)')}<br><b>What:</b> ${escHtml((ans[it.id] || {}).what || (ans[it.id] || {}).req || '(empty)')}<br><b>Contact Info:</b> ${escHtml((ans[it.id] || {}).contact || '(empty)')}<br><b>Follow-up:</b> ${escHtml((ans[it.id] || {}).follow || (ans[it.id] || {}).time || '(empty)')}</div></div>`
        : `<div class="mr-call"><div class="mr-label">${escHtml(p.title)}${p.items.length > 1 ? ' · answer ' + (i + 1) : ''}</div><div class="mr-text">${escHtml(it.text)}</div><div class="mr-answer">${escHtml(ans[it.id] || '(no answer)')}</div></div>`).join('');
      const sug = p.type === 'notes' ? ` (suggested ${r.notesSuggested}/${p.points})` : '';
      return `<details class="mr-det" open><summary>${escHtml(p.title)}${sug}</summary>${body}</details>`;
    }).join('');
    const autoHtml = autoParts.map(p => `<div><span>${escHtml(p.title.replace(':', ''))}</span><b>${r[p.id] || 0}/${p.points}</b></div>`).join('');
    const autoTotal = autoParts.reduce((x, p) => x + (r[p.id] || 0), 0), autoMax = autoParts.reduce((x, p) => x + p.points, 0);
    return `
    <article class="mr-card" data-id="${escHtml(r.id)}">
      <header class="mr-head">
        <div><div class="mr-name">${escHtml(r.name || '')}</div><div class="mr-sub">ID ${escHtml(r.studentId || '')} · Receipt ${escHtml(r.receipt || r.id)} · ${escHtml(when(r.finishedAt))} · ${r.minutes != null ? r.minutes + ' min used' : ''}</div></div>
        <div class="mr-total"><b data-total>${totalOf(r, m)}</b><span>/ ${GRAND}</span><em class="dl-chip ${m.saved ? 'live' : 'none'}" data-state>${m.saved ? 'Marked' : 'Needs marking'}</em></div>
      </header>
      ${flags.length ? `<div class="mr-flags">${flags.map(f => `<span>${escHtml(f)}</span>`).join('')}</div>` : ''}
      <div class="mr-auto">${autoHtml}<div><span>Scored by the page</span><b>${autoTotal}/${autoMax}</b></div></div>
      ${sections}
      <div class="mr-marks">
        ${MK.map(k => `<div class="dl-field"><span>${escHtml(k.label)}</span><input type="number" min="0" max="${k.max}" step="0.5" data-m="${k.key}" aria-label="${escHtml(k.label)}" value="${m[k.key] == null ? '' : m[k.key]}">${k.def ? `<span class="mr-sug">The page suggests ${r[k.def] || 0} out of ${k.max}. Please check the notes yourself.</span>` : ''}<label class="mr-st"><input type="checkbox" data-st="${k.key}"${m.stickers[k.key] ? ' checked' : ''}> Very good sticker</label></div>`).join('')}
        <div class="deadline-actions"><button type="button" class="btn-primary btn-small" data-save>Save marks</button><button type="button" class="btn-ghost btn-small" data-del>Delete</button><span class="deadline-status" data-status></span></div>
      </div>
      <div class="mr-release-row">
        <label class="dl-field mr-comment"><span>Comment for the student (optional)</span><input type="text" data-m="comment" maxlength="400" value="${escHtml(m.comment)}" placeholder="For example: Good work on the apology."></label>
        <div class="deadline-actions"><button type="button" class="btn-ghost btn-small" data-rel>${r.releasedAt ? 'Take back' : 'Release to student'}</button><em class="dl-chip ${r.releasedAt ? 'live' : 'default'}" data-relchip>${r.releasedAt ? 'Released' : 'Not released'}</em></div>
      </div>
    </article>`;
  }
  const marked = rows.filter(r => r.marks).length;
  el('mrBody').innerHTML = `
    ${rulesState === 'no' ? reachBanner('no') : ''}
    ${loadError ? `<div class="signin-error">${escHtml(loadError)}</div>` : ''}
    <div class="dl-summary">
      <div class="dl-stat"><b>${rows.length}</b><span>Attempts</span></div>
      <div class="dl-stat none"><b>${rows.length - marked}</b><span>Need marking</span></div>
      <div class="dl-stat"><b>${marked}</b><span>Marked</span></div>
    </div>
    <section class="mr-panel">
      <h2>Release results to students</h2>
      <p class="field-hint">Do this after you close the quiz and finish marking. A student then opens the quiz page, presses "Check my result", and types their Student ID and receipt code. They see their points, their answers, and the correct answers. Nothing is shown until you press Release.</p>
      ${manualParts.map(p => `<label class="dl-field"><span>Model ${p.type === 'notes' ? 'notes' : 'answers'} for ${escHtml(p.title)} (shown to students, optional)</span><textarea id="mrModel_${p.id}" rows="${p.type === 'notes' ? 3 : 4}" placeholder="Paste the model ${p.type === 'notes' ? 'notes' : 'answers'} from your answer key.">${escHtml(model[p.id] || '')}</textarea></label>`).join('')}
      <div class="deadline-actions"><button type="button" class="btn-ghost btn-small" id="mrModelSave">Save model answers</button><button type="button" class="btn-primary btn-small" id="mrRelAll">Release all marked results</button><span class="deadline-status" id="mrRelStatus"></span></div>
    </section>
    ${rows.length ? '<p><button type="button" class="btn-ghost btn-small" id="mrCsv">Download all as a spreadsheet (CSV)</button></p>' : '<p class="field-hint">No attempts yet. When a student sends the quiz, it appears here within seconds. Reload this page to see new ones.</p>'}
    ${rows.map(card).join('')}`;

  const byId = id => rows.find(r => r.id === id);
  function readMarks(cardEl){
    const o = {}; MK.forEach(k => { o[k.key] = num(cardEl.querySelector(`[data-m="${k.key}"]`).value, k.max); }); return o;
  }
  function refreshTotal(cardEl){
    const r = byId(cardEl.dataset.id), m = readMarks(cardEl);
    cardEl.querySelector('[data-total]').textContent = totalOf(r, m);
  }
  const readModel = () => { const o = {}; manualParts.forEach(p => { o[p.id] = document.getElementById('mrModel_' + p.id).value.trim(); }); return o; };
  document.querySelectorAll('.mr-card').forEach(c => {
    c.querySelectorAll('[data-m]:not([data-m="comment"])').forEach(i => i.addEventListener('input', () => refreshTotal(c)));
    c.querySelector('[data-save]').addEventListener('click', async () => {
      const r = byId(c.dataset.id), m = readMarks(c), st = c.querySelector('[data-status]');
      if(MK.some(k => m[k.key] == null)){ st.textContent = 'Type all the scores first.'; st.className = 'deadline-status bad'; return; }
      st.textContent = 'Saving…'; st.className = 'deadline-status';
      try{
        const marks = { p3: m.p3, w1: m.w1, w2: m.w2, total: totalOf(r, m), comment: (c.querySelector('[data-m="comment"]').value || '').trim().slice(0, 400), stickers: Object.fromEntries(MK.map(k => [k.key, !!c.querySelector('[data-st="' + k.key + '"]').checked])), markedAt: Date.now() };
        await TeacherBackend.saveMakeupMarks(r.id, marks); r.marks = marks;
        if(r.releasedAt){ await releaseOne(r); }
        st.textContent = r.releasedAt ? 'Saved. The student sees the new marks.' : 'Saved'; st.className = 'deadline-status ok';
        const chip = c.querySelector('[data-state]'); chip.textContent = 'Marked'; chip.className = 'dl-chip live';
      }catch(err){ st.textContent = (err && err.message) ? err.message : 'Could not save.'; st.className = 'deadline-status bad'; }
    });
    c.querySelector('[data-del]').addEventListener('click', async () => {
      const r = byId(c.dataset.id);
      if(!confirm('Delete this attempt (' + (r.name || r.studentId) + ')? This cannot be undone.')) return;
      try{ await TeacherBackend.deleteMakeupResult(r.id); c.remove(); }
      catch(err){ const st = c.querySelector('[data-status]'); st.textContent = (err && err.message) ? err.message : 'Could not delete.'; st.className = 'deadline-status bad'; }
    });
  });
  async function releaseOne(r){
    const m = r.marks; if(!m) throw new Error('Save the marks first.');
    const review = await mkBuildReview(Q, parse(r)), mm = readModel(); model = mm;
    const doc = { studentId: String(r.studentId), name: r.name || '', receipt: r.receipt || r.id, form: r.form || def.form,
      p1: r.p1 || 0, p2: r.p2 || 0, p3: m.p3, p4: r.p4 || 0, w1: m.w1, w2: m.w2, total: m.total != null ? m.total : totalOf(r, m),
      comment: m.comment || '', stickers: JSON.stringify(m.stickers || {}), review: JSON.stringify(review), model: JSON.stringify(Object.fromEntries(manualParts.map(p => [p.id, mm[p.id] || '']))), releasedAt: Date.now() };
    await TeacherBackend.setMakeupReleased(r.id, doc); r.releasedAt = doc.releasedAt;
  }
  function paintRel(c, r){
    c.querySelector('[data-rel]').textContent = r.releasedAt ? 'Take back' : 'Release to student';
    const chip = c.querySelector('[data-relchip]'); chip.textContent = r.releasedAt ? 'Released' : 'Not released'; chip.className = 'dl-chip ' + (r.releasedAt ? 'live' : 'default');
  }
  document.querySelectorAll('.mr-card').forEach(c => c.querySelector('[data-rel]').addEventListener('click', async () => {
    const r = byId(c.dataset.id), st = c.querySelector('[data-status]');
    try{
      if(r.releasedAt){ await TeacherBackend.setMakeupReleased(r.id, null); r.releasedAt = null; st.textContent = 'Taken back. The student cannot see it now.'; }
      else{
        if(!r.marks){ st.textContent = 'Press Save marks first.'; st.className = 'deadline-status bad'; return; }
        st.textContent = 'Releasing…'; st.className = 'deadline-status'; await releaseOne(r); st.textContent = 'Released. The student can check it now.';
      }
      st.className = 'deadline-status ok'; paintRel(c, r);
    }catch(err){ st.textContent = (err && err.message) ? err.message : 'Could not release.'; st.className = 'deadline-status bad'; }
  }));
  const relStatus = document.getElementById('mrRelStatus');
  document.getElementById('mrModelSave').addEventListener('click', async () => {
    try{ model = readModel(); await TeacherBackend.setMakeupModel(model, def.modelDoc);
      relStatus.textContent = 'Saved. It is copied into a result when you release it (release again to update).'; relStatus.className = 'deadline-status ok'; }
    catch(err){ relStatus.textContent = (err && err.message) ? err.message : 'Could not save.'; relStatus.className = 'deadline-status bad'; }
  });
  document.getElementById('mrRelAll').addEventListener('click', async () => {
    const todo = rows.filter(r => r.marks);
    if(!todo.length){ relStatus.textContent = 'No marked results yet. Save marks on each card first.'; relStatus.className = 'deadline-status bad'; return; }
    if(!confirm('Release ' + todo.length + ' marked result' + (todo.length === 1 ? '' : 's') + ' to the students now?')) return;
    let n = 0; relStatus.textContent = 'Releasing…'; relStatus.className = 'deadline-status';
    try{
      model = readModel(); await TeacherBackend.setMakeupModel(model, def.modelDoc);
      for(const r of todo){ await releaseOne(r); n += 1; const c = document.querySelector('.mr-card[data-id="' + r.id + '"]'); if(c) paintRel(c, r); }
      relStatus.textContent = 'Released ' + n + '. ' + (rows.length - todo.length ? (rows.length - todo.length) + ' not marked yet.' : 'All marked results are out.'); relStatus.className = 'deadline-status ok';
    }catch(err){ relStatus.textContent = 'Released ' + n + ' then stopped: ' + ((err && err.message) ? err.message : 'error'); relStatus.className = 'deadline-status bad'; }
  });
  const csvBtn = document.getElementById('mrCsv');
  if(csvBtn) csvBtn.addEventListener('click', () => {
    const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const head = ['Student ID', 'Name', 'Receipt', 'Finished'].concat(autoParts.map(p => p.title.replace(':', '') + ' /' + p.points), MK.map(k => k.label.replace(/ \(0 to \d+\)/, '') + ' /' + k.max), ['Total /' + GRAND, 'Marked', 'Left page', 'Paste tries', 'Minutes']);
    const lines = [head.map(q).join(',')].concat(rows.map(r => { const m = marksOf(r); return [r.studentId, r.name, r.receipt || r.id, r.finishedAt ? new Date(r.finishedAt).toISOString() : ''].concat(autoParts.map(p => r[p.id] || 0), MK.map(k => m[k.key]), [totalOf(r, m), r.marks ? 'yes' : 'no', r.leaves, r.paste, r.minutes]).map(q).join(','); }));
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })); a.download = (key === 'mice' ? 'makeup-quiz-results' : 'makeup-wellness-quiz-results') + '.csv'; a.click(); URL.revokeObjectURL(a.href);
  });
}

const UNIT_ACTIVITY_UNITS = [{"course": "mice", "key": "mice/unit-4", "label": "Unit 4: Professional Greetings & Networking"}, {"course": "mice", "key": "mice/unit-5", "label": "Unit 5: Giving Directions at Events"}, {"course": "mice", "key": "mice/unit-6", "label": "Unit 6: Schedules & Time"}, {"course": "mice", "key": "mice/unit-9", "label": "Unit 9: Exhibition Booth Communication"}, {"course": "mice", "key": "mice/unit-10", "label": "Unit 10: Answering the Phone at the Information Desk"}, {"course": "mice", "key": "mice/unit-11", "label": "Unit 11: Apologizing & Saying No Professionally"}, {"course": "mice", "key": "mice/unit-12", "label": "Unit 12: Choosing a Catering Vendor"}, {"course": "mice", "key": "mice/unit-13", "label": "Unit 13: The Difficult Sponsor Request"}, {"course": "mice", "key": "mice/unit-14", "label": "Unit 14: Event Day Crisis: The Power Outage"}, {"course": "mice", "key": "mice/unit-15", "label": "Unit 15: Designing the Delegate Journey"}, {"course": "mice", "key": "mice/integrated-email-lesson", "label": "Integrated Lesson: Professional MICE Emails (Weeks 11-15)"}, {"course": "mice", "key": "mice/listening-challenge", "label": "MICE Integrated Listening Challenge (Units 7-8)"}, {"course": "communication", "key": "communication/unit-1", "label": "Unit 1, Hello! Greetings & Introductions"}, {"course": "communication", "key": "communication/unit-2", "label": "Unit 2, Small Talk"}, {"course": "communication", "key": "communication/unit-3", "label": "Unit 3, Likes and Dislikes"}, {"course": "communication", "key": "communication/unit-4", "label": "Unit 4, My School: What Makes a Good School?"}, {"course": "communication", "key": "communication/unit-5", "label": "Unit 5: My Daily Routine"}, {"course": "communication", "key": "communication/unit-6", "label": "Unit 6, Cultural Studies: Food & Eating"}, {"course": "communication", "key": "communication/unit-7", "label": "Unit 7, Cultural Studies: Food Culture (Markets, Meals & Eating Habits)"}, {"course": "communication", "key": "communication/unit-8", "label": "Unit 8, Sociology: Free-Time Activities"}, {"course": "communication", "key": "communication/unit-9", "label": "Unit 9, Sociology: Agree, Disagree & Discuss"}, {"course": "communication", "key": "communication/unit-10", "label": "Unit 10, Architecture: What Makes a Good Home?"}, {"course": "communication", "key": "communication/unit-11", "label": "Unit 11, Architecture: Design a Home"}, {"course": "wellness", "key": "wellness/unit-3", "label": "Unit 3: Describing Wellness Destinations"}, {"course": "wellness", "key": "wellness/unit-4", "label": "Unit 4: Customer Service"}, {"course": "wellness", "key": "wellness/unit-5", "label": "Unit 5: Wellness Tourism Guiding"}, {"course": "wellness", "key": "wellness/unit-6", "label": "Unit 6: Reservations & Appointments"}, {"course": "wellness", "key": "wellness/unit-9", "label": "Unit 9: The Wellness Concierge Desk"}, {"course": "wellness", "key": "wellness/unit-10", "label": "Unit 10: Personalizing a Wellness Day"}, {"course": "wellness", "key": "wellness/unit-11", "label": "Unit 11: Wellness Tourism Promotion"}, {"course": "wellness", "key": "wellness/unit-12", "label": "Unit 12: Choosing the Right Package"}, {"course": "wellness", "key": "wellness/unit-13", "label": "Unit 13: A Guest's Difficult Request"}, {"course": "wellness", "key": "wellness/unit-14", "label": "Unit 14: A Guest Needs Help"}, {"course": "wellness", "key": "wellness/unit-15", "label": "Unit 15: Designing a Guest's Wellness Day"}, {"course": "wellness", "key": "wellness/unit-16", "label": "Unit 16, Integrated Unit: The Wellness Feature (Final Project)"}, {"course": "wellness", "key": "wellness/guest-journey", "label": "The Wellness Guest Journey"}, {"course": "wellness", "key": "wellness/listening-challenge", "label": "Wellness Integrated Listening Challenge (Units 7-8)"}];

/* ===================== UNIT ACTIVITY =====================
   The latest result of every activity each student finished in a unit (practice, speaking checks, etc.). The unit
   pages save it to Firestore (unitActivity/{id}) through js/activity-mirror.js, in addition to the Google Sheet.
   Pick a unit, see a grid: one row per student, one column per activity. Students on your roster who have not
   started the unit are listed under the grid. The Sheet keeps the full history of every try. */
const UA_COURSE_TO_ROSTER = { mice: 'mice', wellness: 'wellness', communication: 'efc' };
const UA_COURSE_LABEL = { mice: 'English for MICE', communication: 'English for Communication', wellness: 'English for Wellness Tourism' };
async function renderUnitActivity(){
  let chosen = ''; try{ chosen = localStorage.getItem('teacherUnitActivityKey') || ''; }catch(e){}
  if(!UNIT_ACTIVITY_UNITS.some(u => u.key === chosen)) chosen = UNIT_ACTIVITY_UNITS[0].key;
  const optionHtml = ['mice','communication','wellness'].map(c => `<optgroup label="${escHtml(UA_COURSE_LABEL[c])}">${
    UNIT_ACTIVITY_UNITS.filter(u => u.course === c).map(u => `<option value="${escHtml(u.key)}"${u.key === chosen ? ' selected' : ''}>${escHtml(u.label)}</option>`).join('')}</optgroup>`).join('');
  el('app').innerHTML = `
    ${renderTopbar()}
    <main class="teacher-main">
      <nav class="crumbs"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <span>Unit Activity</span></nav>
      <h1>Unit Activity</h1>
      <p class="field-hint">Choose a unit to see what each student finished and their latest score. Scores show as the student's result (for example 4/5). A tick means the activity was completed with no score. Only work done since this feature went live appears here. Your Google Sheet keeps every try.</p>
      <div class="ua-pick"><label class="dl-field"><span>Unit</span><select id="uaUnit">${optionHtml}</select></label><button type="button" class="btn-ghost btn-small" id="uaReload">Refresh</button></div>
      <div id="uaBody"><p class="field-hint">Loading…</p></div>
    </main>`;
  wireTopbar();
  const sel = document.getElementById('uaUnit');
  sel.addEventListener('change', () => { try{ localStorage.setItem('teacherUnitActivityKey', sel.value); }catch(e){} load(); });
  document.getElementById('uaReload').addEventListener('click', load);

  const when = ms => ms ? new Date(ms).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }) : '';
  function tone(score){
    const m = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(String(score || '').trim());
    if(!m || !(+m[2] > 0)) return '';
    const r = +m[1] / +m[2]; return r >= 0.8 ? 'good' : (r >= 0.5 ? 'mid' : 'low');
  }
  async function load(){
    const key = sel.value, unit = UNIT_ACTIVITY_UNITS.find(u => u.key === key);
    const body = document.getElementById('uaBody'); body.innerHTML = '<p class="field-hint">Loading…</p>';
    let rows = [], err = '';
    const rulesState = await studentsCanWrite();
    try{ rows = await TeacherBackend.listUnitActivity(key); }
    catch(e){ err = (e && e.code === 'permission-denied') ? 'Not allowed to read. Sign in again.' : (e && e.message ? e.message : 'Could not load.'); }
    // students and activities
    const students = new Map(), firstSeen = new Map();
    rows.forEach(r => {
      if(!students.has(r.studentId)) students.set(r.studentId, { id: r.studentId, name: r.studentName || '', cells: {}, last: 0 });
      const st = students.get(r.studentId); st.cells[r.activity] = r; if(r.studentName) st.name = r.studentName; st.last = Math.max(st.last, r.ts || 0);
      firstSeen.set(r.activity, Math.min(firstSeen.has(r.activity) ? firstSeen.get(r.activity) : Infinity, r.ts || Infinity));
    });
    const acts = Array.from(firstSeen.keys()).sort((a, b) => (firstSeen.get(a) - firstSeen.get(b)) || a.localeCompare(b));
    const list = Array.from(students.values()).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
    // roster students with no record
    const rosterId = UA_COURSE_TO_ROSTER[unit.course], notStarted = [];
    const rc = ROSTER && ROSTER.courses.find(c => c.courseId === rosterId);
    if(rc) rc.groups.forEach(g => g.students.forEach(s => { if(!students.has(String(s.studentId))) notStarted.push({ id: s.studentId, name: s.name, group: g.groupName || g.groupId }); }));
    notStarted.sort((a, b) => a.name.localeCompare(b.name));

    const cell = (r) => {
      if(!r) return '<td class="ua-empty">–</td>';
      const sc = String(r.score || '').trim();
      if(sc) return `<td class="ua-score ${tone(sc)}" title="${escHtml(when(r.ts))}">${escHtml(sc)}</td>`;
      if(r.status && r.status !== 'completed') return `<td class="ua-score mid" title="${escHtml(when(r.ts))}">${escHtml(r.status)}</td>`;
      return `<td class="ua-done" title="${escHtml(when(r.ts))}">&#10003;</td>`;
    };
    body.innerHTML = `
      ${rulesState === 'no' ? reachBanner('no') : ''}
      ${err ? `<div class="signin-error">${escHtml(err)}</div>` : ''}
      <div class="dl-summary">
        <div class="dl-stat"><b>${list.length}</b><span>Students started</span></div>
        <div class="dl-stat none"><b>${rc ? notStarted.length : '-'}</b><span>Not started</span></div>
        <div class="dl-stat"><b>${acts.length}</b><span>Activities seen</span></div>
      </div>
      ${list.length ? `<p><button type="button" class="btn-ghost btn-small" id="uaCsv">Download as a spreadsheet (CSV)</button></p>
      <div class="ua-wrap"><table class="ua-table"><thead><tr><th class="ua-sticky">Student</th>${acts.map(a => `<th><span>${escHtml(a)}</span></th>`).join('')}<th>Done</th><th>Last active</th></tr></thead>
        <tbody>${list.map(s => `<tr><th class="ua-sticky"><div class="ua-name">${escHtml(s.name || '(no name)')}</div><div class="ua-id">${escHtml(s.id)} <button type="button" class="ua-del" data-del="${escHtml(s.id)}" title="Remove this student's results for this unit" aria-label="Remove ${escHtml(s.name || s.id)}">remove</button></div></th>${acts.map(a => cell(s.cells[a])).join('')}<td class="ua-count">${Object.keys(s.cells).length}/${acts.length}</td><td class="ua-last">${escHtml(when(s.last))}</td></tr>`).join('')}</tbody></table></div>`
      : '<p class="field-hint">Nothing here yet for this unit. When a student finishes an activity on the website, it appears here within seconds. Press Refresh to see new work.</p>'}
      ${notStarted.length ? `<details class="mr-det" open><summary>Not started yet (${notStarted.length})</summary><p class="ua-ns">${notStarted.map(s => `<span>${escHtml(s.name)} <em>${escHtml(String(s.id))}</em></span>`).join('')}</p></details>` : ''}`;
    body.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
      const id = b.dataset.del, st = students.get(id);
      if(!confirm('Remove all of ' + (st && st.name ? st.name : id) + "'s results for this unit from the dashboard? Your Google Sheet is not changed.")) return;
      try{ await TeacherBackend.deleteUnitActivityFor(key, id); load(); }
      catch(e){ alert((e && e.message) ? e.message : 'Could not remove.'); }
    }));
    const csv = document.getElementById('uaCsv');
    if(csv) csv.addEventListener('click', () => {
      const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
      const lines = [['Student ID', 'Name'].concat(acts, ['Activities done', 'Last active']).map(q).join(',')].concat(list.map(s => [s.id, s.name].concat(acts.map(a => { const r = s.cells[a]; return r ? (String(r.score || '').trim() || (r.status === 'completed' ? 'done' : r.status)) : ''; }), [Object.keys(s.cells).length, s.last ? new Date(s.last).toISOString() : '']).map(q).join(',')));
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })); a.download = key.replace('/', '_') + '_activity.csv'; a.click(); URL.revokeObjectURL(a.href);
    });
  }
  load();
}

/* ===================== ROUTER ===================== */
function renderRoute(){
  if(!SESSION){ renderSignIn(); return; }
  const route = parseHash();
  if(route.view === 'course') renderCourse(route.courseId);
  else if(route.view === 'assessments') renderAssessments(route.courseId);
  else if(route.view === 'clo') renderCLOAttainment(route.courseId);
  else if(route.view === 'courseReport') renderCourseReport(route.courseId);
  else if(route.view === 'settings') renderAssessmentSettings(route.courseId);
  else if(route.view === 'group') renderGroup(route.courseId, route.groupId);
  else if(route.view === 'attendance') renderAttendance(route.courseId, route.groupId, route.date);
  else if(route.view === 'team') renderPresentationTeams(route.courseId, route.groupId, route.assessmentId);
  else if(route.view === 'student') renderStudent(route.courseId, route.groupId, route.studentId);
  else if(route.view === 'studentReport') renderStudentReport(route.courseId, route.groupId, route.studentId);
  else if(route.view === 'search') renderSearch(route.q);
  else if(route.view === 'newTerm') renderNewTerm();
  else if(route.view === 'deadlines') renderDeadlines();
  else if(route.view === 'makeupQuiz') renderMakeupQuiz(route.quiz);
  else if(route.view === 'makeupResults') renderMakeupResults(route.quiz);
  else if(route.view === 'unitActivity') renderUnitActivity();
  else renderDashboard();
}

async function boot(){
  // Check sign-in first — in live Firebase mode, loading the roster/terms
  // means Firestore reads, and the security rules correctly refuse those
  // until someone is actually authenticated. Local Demo Mode has no such
  // gate, but checking session first is harmless there too.
  SESSION = await TeacherBackend.currentSession();
  if(SESSION){
    ACTIVE_TERM = await TeacherBackend.getActiveTerm();
    ALL_TERMS = await TeacherBackend.listTerms();
    ROSTER = await TeacherBackend.getRoster();
  }
  renderRoute();
}

window.addEventListener('hashchange', renderRoute);
document.addEventListener('DOMContentLoaded', boot);
