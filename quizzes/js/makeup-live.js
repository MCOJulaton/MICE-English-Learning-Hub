/* ===================== MAKE-UP QUIZ: LIVE SETTINGS (student side) =====================
   The teacher opens and closes the make-up quiz, sets the access code, and sets the minutes in the
   Teacher Dashboard (Make-up Quiz screen). The dashboard saves ONE Firestore document:
   siteSettings/makeupQuiz = { open, codeHash, minutes, updatedAt }.
   This file reads it (public read, Firestore REST). The code is stored only as a hash, so reading the
   document does not show the code. If the document cannot be read, the settings in makeup-data.js are
   used (closed by default). No push to the site is needed to open or close the quiz.
   Same Firestore rule as the live deadlines (siteSettings/{doc}: read true, write teacher only). */
const MakeupLive = (function () {
  const PROJECT_ID = 'mice-teacher-dashboard-5f9da';
  const API_KEY = 'AIzaSyDpmwdnYvY9JguBE-Bi97l2J6DlEfo_lpU';
  // The Wellness page loads makeup-wellness-data.js (MAKEUP_QUIZ_W); every other page uses the MICE data (MAKEUP_QUIZ).
  const QZ = (typeof MAKEUP_QUIZ_W !== 'undefined') ? MAKEUP_QUIZ_W : MAKEUP_QUIZ;
  const urlFor = (z) => 'https://firestore.googleapis.com/v1/projects/' + PROJECT_ID + '/databases/(default)/documents/siteSettings/' + (z.liveDoc || 'makeupQuiz') + '?key=' + API_KEY;
  const SALT = 'mice-lq-code|';

  async function hashCode(code) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + String(code).trim().toUpperCase()));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /* Returns { open, minutes, codeHash, code, source }. source is 'live' or 'static'. */
  /* load() uses this page's quiz. The Quiz Hub page loads both quizzes, so it passes the one it wants: load(MAKEUP_QUIZ_W). */
  async function load(z) {
    z = z || QZ;
    const fallback = { open: !!z.open, minutes: z.minutes, codeHash: '', code: z.code, source: 'static' };
    try {
      const r = await fetch(urlFor(z), { cache: 'no-store' });
      if (!r.ok) return fallback;
      const d = await r.json(), f = d && d.fields;
      if (!f) return fallback;
      const num = (v) => (v && v.integerValue !== undefined ? parseInt(v.integerValue, 10) : (v && v.doubleValue !== undefined ? Math.round(v.doubleValue) : NaN));
      return {
        open: !!(f.open && f.open.booleanValue),
        minutes: num(f.minutes) > 0 ? num(f.minutes) : z.minutes,
        codeHash: f.codeHash && f.codeHash.stringValue ? f.codeHash.stringValue : '',
        code: '',
        source: 'live'
      };
    } catch (e) { return fallback; }
  }

  async function checkCode(entered, settings) {
    const c = String(entered || '').trim();
    if (!c) return false;
    if (settings.codeHash) return (await hashCode(c)) === settings.codeHash;
    return c.toUpperCase() === String(settings.code || '').toUpperCase();
  }

  return { load, hashCode, checkCode };
})();
