/* ===================== LIVE DEADLINES (student side) =====================
   The teacher edits assignment deadlines in the Teacher Dashboard (Deadlines screen).
   The dashboard saves them to ONE Firestore document, siteSettings/deadlines. This file
   reads that document (public read, via the Firestore REST API) and uses it on:
     - the Assignments Hub rows,
     - each assignment page's "Due ..." badge,
     - any element with data-deadline="<assignment id>" (used inside unit pages).
   It refreshes every 30 seconds while the page is visible, so a deadline changed during
   class shows up on students' screens within about half a minute, with no reload.

   If the document does not exist, cannot be read, or has no entry for an assignment, the
   default in js/course-catalog.js (dueDate) is used, and a blank default shows
   "Deadline to be announced". Nothing here can break a page: every failure is silent.

   The project id and key below are the public web identifiers of the Firebase project
   (the same ones the dashboard uses). They only identify the project; Firestore security
   rules decide who may read or write. Only the teacher's account may write.

   Firestore rule needed (Firebase console -> Firestore Database -> Rules), inside
   "match /databases/{database}/documents { ... }":
     match /siteSettings/{doc} {
       allow read: if true;
       allow write: if request.auth != null && request.auth.uid == "<TEACHER_UID>";
     }
*/
const LiveDeadlines = (function(){
  const PROJECT_ID = "mice-teacher-dashboard-5f9da";
  const API_KEY = "AIzaSyDpmwdnYvY9JguBE-Bi97l2J6DlEfo_lpU";
  const URL = 'https://firestore.googleapis.com/v1/projects/' + PROJECT_ID + '/databases/(default)/documents/siteSettings/deadlines?key=' + API_KEY;
  const TBA = 'Deadline to be announced';
  let live = null;          // { assignmentId: { dueDate, dueTimeNote } }, or null until first load

  function fmt(dueDate, note){
    if(!dueDate) return TBA;
    const d = new Date(dueDate + 'T00:00:00');
    if(isNaN(d)) return TBA;
    return 'Due ' + d.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }) + (note ? ' \u00B7 ' + note : '');
  }
  function str(v){ return v && typeof v.stringValue === 'string' ? v.stringValue : ''; }
  function parse(doc){
    const out = {};
    const map = doc && doc.fields && doc.fields.deadlines && doc.fields.deadlines.mapValue && doc.fields.deadlines.mapValue.fields;
    if(!map) return out;
    Object.keys(map).forEach(id => {
      const f = map[id].mapValue && map[id].mapValue.fields;
      if(f) out[id] = { dueDate: str(f.dueDate), dueTimeNote: str(f.dueTimeNote) };
    });
    return out;
  }
  function catalogAssignment(id){
    if(typeof COURSE_CATALOG === 'undefined') return null;
    for(const c of COURSE_CATALOG) for(const u of c.units) if(u.assignment && u.assignment.id === id) return u.assignment;
    return null;
  }
  function textFor(id){
    if(live && live[id]) return fmt(live[id].dueDate, live[id].dueTimeNote);
    const a = catalogAssignment(id);
    return a ? fmt(a.dueDate, a.dueTimeNote) : TBA;
  }
  function applyToCatalog(){
    if(!live || typeof COURSE_CATALOG === 'undefined') return;
    COURSE_CATALOG.forEach(c => c.units.forEach(u => {
      const a = u.assignment;
      if(a && live[a.id]){ a.dueDate = live[a.id].dueDate; a.dueTimeNote = live[a.id].dueTimeNote; }
    }));
  }
  function fillElements(root){
    (root || document).querySelectorAll('[data-deadline]').forEach(el => {
      const t = textFor(el.getAttribute('data-deadline'));
      if(el.textContent !== t) el.textContent = t;
    });
  }
  function refreshAll(){
    applyToCatalog();
    fillElements(document);
    window.dispatchEvent(new CustomEvent('deadlines-updated'));
  }
  async function load(){
    try{
      const r = await fetch(URL, { cache:'no-store' });
      if(r.status === 404){ live = {}; }
      else if(r.ok){ live = parse(await r.json()); }
      else return;                       // permission denied or offline: keep what we have
    }catch(e){ return; }
    refreshAll();
  }
  function start(){
    load();
    setInterval(() => { if(!document.hidden) load(); }, 30000);
    document.addEventListener('visibilitychange', () => { if(!document.hidden) load(); });
    if(typeof MutationObserver !== 'undefined'){
      let queued = false;
      new MutationObserver(() => {
        if(queued) return; queued = true;
        requestAnimationFrame(() => { queued = false; fillElements(document); });
      }).observe(document.documentElement, { childList:true, subtree:true });
    }
    document.addEventListener('DOMContentLoaded', () => fillElements(document));
  }
  return { start, load, textFor, fmt, TBA };
})();
LiveDeadlines.start();
