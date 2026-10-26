/* ===================== UNIT ACTIVITY MIRROR =====================
   Every unit page already sends each finished activity to the Google Sheet (an Apps Script address). This file
   watches those sends and quietly saves a second copy of the LATEST result of each activity to Firestore
   (unitActivity/{id}), so the Teacher Dashboard can show who did what without opening the sheet.
   It changes nothing about how the unit pages work: the Sheet send still happens first, and if this copy fails the
   student sees nothing and the copy is retried later. Nothing is sent from localhost (test data stays out).
   Load this file BEFORE the unit's js/app.js. */
(function () {
  'use strict';
  const SHEET_PREFIX = 'https://script.google.com/macros/s/AKfycbxDECOuXf3HMxPVLT1fhfOHE5g-Gq1juG5enaCoUrShk9vEMfctgy-URKmqmvPGeoE';
  const FS_URL = 'https://firestore.googleapis.com/v1/projects/mice-teacher-dashboard-5f9da/databases/(default)/documents/unitActivity/';
  const FS_KEY = 'AIzaSyDpmwdnYvY9JguBE-Bi97l2J6DlEfo_lpU';
  const PENDING = 'mice_activity_pending';
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (isLocal || !window.fetch || !window.crypto || !crypto.subtle) return;

  // 'mice/unit-4' from /courses/mice/unit-4/index.html
  const m = location.pathname.match(/\/courses\/([^/]+)\/([^/]+)/);
  const unitKey = m ? m[1] + '/' + m[2] : '';

  const queue = () => { try { return JSON.parse(localStorage.getItem(PENDING) || '[]'); } catch (e) { return []; } };
  const setQueue = (l) => { try { localStorage.setItem(PENDING, JSON.stringify(l.slice(-300))); } catch (e) { /* ignore */ } };

  async function docId(d) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode([d.studentId, d.unitKey, d.activity].join('|')));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
  }
  const typed = (v) => (typeof v === 'number' ? { integerValue: String(Math.round(v)) } : { stringValue: String(v) });

  async function save(d) {
    const fields = {}; Object.keys(d).forEach((k) => { fields[k] = typed(d[k]); });
    try {
      const r = await originalFetch(FS_URL + (await docId(d)) + '?key=' + FS_KEY, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) });
      return r.ok;
    } catch (e) { return false; }
  }
  async function flush() {
    const list = queue(); if (!list.length) return;
    const rest = [];
    for (const d of list) { if (!(await save(d))) rest.push(d); }
    setQueue(rest);
  }
  async function mirror(rec) {
    if (!rec || !rec.studentId || !rec.activity || !unitKey) return;
    const d = {
      studentId: String(rec.studentId).trim().slice(0, 40), studentName: String(rec.studentName || '').slice(0, 120),
      course: String(rec.course || '').slice(0, 120), unit: String(rec.unit || '').slice(0, 200), unitKey,
      activity: String(rec.activity).slice(0, 200), score: rec.score == null ? '' : String(rec.score).slice(0, 60),
      status: String(rec.completionStatus || 'completed').slice(0, 40), ts: Date.now(), date: String(rec.date || '').slice(0, 20)
    };
    if (!(await save(d))) setQueue(queue().concat([d]));
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = function (url, opts) {
    try {
      if (typeof url === 'string' && url.indexOf(SHEET_PREFIX) === 0 && opts && typeof opts.body === 'string') mirror(JSON.parse(opts.body));
    } catch (e) { /* never block the real send */ }
    return originalFetch(url, opts);
  };
  window.addEventListener('online', flush);
  setInterval(flush, 30000);
  setTimeout(flush, 3000);
})();
