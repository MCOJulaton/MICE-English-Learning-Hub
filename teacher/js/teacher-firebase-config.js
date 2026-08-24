/* ===================== TEACHER DASHBOARD — Firebase config =====================
   Separate from js/firebase-config.js on purpose. That file only configures
   the Quiz Hub's Realtime Database (public, ephemeral quiz sessions). This
   dashboard needs three different Firebase services — Authentication,
   Firestore, and Storage — protected by security rules so ONLY your signed-in
   account can ever read or write anything here. Until this is filled in, the
   dashboard runs in LOCAL DEMO MODE: everything lives in this browser only
   (IndexedDB), sign-in is a name field with no real password check, and nothing
   here is remotely secure. Local Demo Mode is fine for building/testing the
   dashboard's screens — do NOT enter real, sensitive student information into
   it, since it lives in this browser's storage with no protection.

   ===================== HOW TO GO LIVE (one-time, ~15 minutes) =====================
   1. In the Firebase project you already created for the Quiz Hub (or a new
      one — using the same project is fine, these are separate services within
      it), go to Build -> Authentication -> Get started -> Email/Password ->
      Enable.
   2. Still in Authentication, go to the "Users" tab -> "Add user" -> enter
      YOUR OWN email and a strong password. Copy the "User UID" it shows you.
   3. Go to Build -> Firestore Database -> Create database -> pick a region ->
      start in "production mode".
   4. Go to Build -> Storage -> Get started -> production mode, same region.
   5. Go to Project settings (gear icon) -> General -> scroll to "Your apps" ->
      if you already added a web app for the Quiz Hub you can reuse those
      values below; otherwise click the "</>" icon to register a new one.
      Copy the firebaseConfig values into TEACHER_FIREBASE_CONFIG below.
   6. Paste your UID from step 2 into TEACHER_UID below.
   7. Deploy the Firestore and Storage security rules (ask your assistant to
      generate these from the UID above — they restrict every read and write
      to that one account, matching what's described in the architecture
      notes for this dashboard).
   8. Save this file. The dashboard automatically switches from Local Demo
      Mode to live, authenticated, cloud storage — no other code changes
      needed. */

const TEACHER_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDpmwdnYvY9JguBE-Bi97l2J6DlEfo_lpU",
  authDomain: "mice-teacher-dashboard-5f9da.firebaseapp.com",
  projectId: "mice-teacher-dashboard-5f9da",
  storageBucket: "mice-teacher-dashboard-5f9da.firebasestorage.app",
  messagingSenderId: "376218821550",
  appId: "1:376218821550:web:df03b804b75be83e741e3f"
};

// Your Firebase Auth User UID (step 2 above). Security rules check against
// this exact value — it is not a secret (UIDs aren't sensitive), the rules
// deployed on the Firebase project are what actually enforce it.
const TEACHER_UID = "fbuVy7KyawZWJBZcGW74yZ1ZXL92";

function isTeacherFirebaseConfigured(){
  return typeof TEACHER_FIREBASE_CONFIG === 'object' && TEACHER_FIREBASE_CONFIG
    && typeof TEACHER_FIREBASE_CONFIG.apiKey === 'string'
    && TEACHER_FIREBASE_CONFIG.apiKey.indexOf('PASTE_') !== 0
    && typeof TEACHER_UID === 'string'
    && TEACHER_UID.indexOf('PASTE_') !== 0;
}
