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
      <a class="teacher-hub-link" href="../index.html">${icon('home',{size:14})} Back to Learning Hub</a>
      <form id="globalSearchForm" class="teacher-search">
        <input type="search" id="globalSearchInput" placeholder="Search name, nickname, or student ID">
      </form>
      <div class="teacher-topbar-right">
        <select id="termSwitcher" class="term-switcher" title="Switch academic term">${termOptions}</select>
        ${TeacherBackend.mode === 'local' ? '<span class="mode-pill">Local Demo Mode</span>' : '<span class="mode-pill mode-pill--live">Live</span>'}
        <span class="teacher-who">${SESSION ? SESSION.name : ''}</span>
        <button id="signOutBtn" class="btn-ghost">Sign out</button>
      </div>
    </div>
  `;
}

function wireTopbar(){
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

function exportGradebookCSV(courseId){
  const course = findCourse(courseId);
  const assessments = course.assessments || [];
  const showFinalIntegration = typeof course.finalWeightPct === 'number' && course.finalWeightPct < 100;
  const header = ['Student ID', 'Official Name', 'Nickname', 'Group'].concat(assessments.map(a => `${a.title} (/${a.maxScore})`)).concat(['Current Grade %', 'Letter Grade', 'Not Yet Graded %']);
  if(showFinalIntegration) header.push(`Final Grade Integration (/${course.finalWeightPct})`);
  const rows = [header];
  allCourseStudents(course).forEach(({ s, group }) => {
    const grade = computeStudentGrade(course, s);
    const row = [s.studentId, `${s.title} ${s.name}`, s.nickname || '', group.groupId];
    assessments.forEach(a => {
      const entry = (s.scores || {})[a.id];
      if(!entry || entry.status === 'not-graded') row.push('Not Yet Graded');
      else if(entry.status === 'excused') row.push('Excused');
      else row.push(entry.score);
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
        <td>${fmtPct(grade.currentPct)}${grade.remainingWeight > 0 ? ` <span class="field-hint">(${grade.remainingWeight.toFixed(0)}% left)</span>` : ''}</td>
        ${showFinalIntegration ? `<td>${finalIntegration && finalIntegration.integratedScore !== null ? `${finalIntegration.integratedScore} / ${finalIntegration.finalWeightPct}` : '—'}</td>` : ''}
        <td>${att.pct === null ? '—' : att.pct + '%'}</td>
        <td>${statusPill(status)}${absencePill(s)}</td>
      </tr>
    `;
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
function objectsFromAOA(aoa){
  const rows = aoa.filter(r => r.some(c => String(c || '').trim() !== ''));
  if(rows.length < 2) return [];
  /* Unlike a spreadsheet, a PDF or Word extraction can have title text or
     other prose before the real table starts, so row 0 isn't reliably the
     header — find the first row that actually contains a recognized
     ID/Name/Status column name, falling back to row 0 if nothing matches. */
  const knownHeaders = [...ATT_ID_HEADERS, ...ATT_NAME_HEADERS, ...ATT_STATUS_HEADERS];
  const looksLikeHeader = r => r.length > 1 && r.some(c => knownHeaders.includes(String(c || '').trim().toLowerCase()));
  const headerIdx = rows.findIndex(looksLikeHeader);
  const dataRows = rows.slice(headerIdx === -1 ? 0 : headerIdx);
  if(dataRows.length < 2) return [];
  const headers = dataRows[0].map(h => String(h || '').trim());
  return dataRows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i] !== undefined ? r[i] : ''; });
    return obj;
  });
}

async function parseAttendanceSpreadsheet(file){
  const XLSX = await loadXLSX();
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return extractAttendanceRows(rows);
}

/* PDF has no real column structure once text is extracted — only word
   positions. Words are grouped into lines by y-position, then a horizontal
   gap wider than ~20pt between adjacent words is treated as a column break.
   This reads clean, table-formatted PDFs reasonably well; anything with an
   unusual layout will need manual correction in the review table. */
async function parseAttendancePDF(file){
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
  return extractAttendanceRows(objectsFromAOA(aoa));
}

/* Word tables are read directly when the document has one (most reliable —
   mammoth preserves real table structure). If there's no table, falls back
   to splitting each line of plain text on wide gaps/tabs, same heuristic
   as the PDF reader. */
async function parseAttendanceDocx(file){
  const mammoth = await loadMammoth();
  const buf = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buf });
  const doc = new DOMParser().parseFromString(result.value, 'text/html');
  const table = doc.querySelector('table');
  let aoa;
  if(table){
    aoa = [...table.querySelectorAll('tr')].map(tr =>
      [...tr.querySelectorAll('td,th')].map(td => td.textContent.trim())
    );
  } else {
    const text = doc.body.textContent || '';
    aoa = text.split('\n').map(line => line.trim()).filter(Boolean)
      .map(line => line.split(/\s{2,}|\t/).map(c => c.trim()).filter(Boolean));
  }
  return extractAttendanceRows(objectsFromAOA(aoa));
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
    const autoAttendance = a.categoryId === 'attendance';
    return `
      <tr>
        <td>${a.title}<div class="field-hint">${cat ? cat.label : ''} &middot; Week ${a.week || '—'} &middot; ${a.weight}%${autoAttendance ? ' &middot; Auto-calculated from attendance records — edit below to override until attendance next changes' : ''}</div></td>
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
