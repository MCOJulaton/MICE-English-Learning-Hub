/* ===================== FIREBASE CONFIG — Quiz Hub live sync =====================
   The Quiz Hub needs a way for the host's screen and every student's device to
   stay in sync live. Firebase Realtime Database does that job — free tier,
   built for exactly this. Until this is filled in, the Quiz Hub runs in LOCAL
   DEMO MODE automatically: sessions sync across browser tabs on the SAME
   computer (via localStorage), so you can test the whole host/play flow
   right now with zero setup — it just won't reach other devices yet.

   ===================== HOW TO GO LIVE (one-time, ~10 minutes) =====================
   1. Go to https://console.firebase.google.com and sign in with your Google account.
   2. Click "Add project" (or "Create a project"). Give it any name, e.g.
      "english-hub-quizzes". You can skip Google Analytics — not needed here.
   3. Once the project opens, click the "</>" (Web) icon to add a web app.
      Give it a nickname (e.g. "quiz-hub") and click "Register app".
      You do NOT need Firebase Hosting — you're already hosting on Netlify.
   4. Firebase shows a `firebaseConfig` object with values like apiKey,
      authDomain, databaseURL, projectId, etc. Copy those exact values into
      the FIREBASE_CONFIG object below, replacing the "PASTE_" placeholders.
      (If databaseURL is missing, see step 5 first, then come back and copy it.)
   5. In the left sidebar, go to Build → Realtime Database → "Create Database".
      Choose any region close to you, and start in "test mode" for now
      (you'll lock it down with the rules below before using it with real
      students).
   6. Once created, click the "Rules" tab in Realtime Database and replace
      the contents with this, then click "Publish":

      {
        "rules": {
          "sessions": {
            "$pin": {
              ".read": true,
              ".write": true,
              ".validate": "newData.hasChildren(['quizId','status'])"
            }
          }
        }
      }

      (This keeps write access open to just the /sessions path used by the
      Quiz Hub — nothing else in your database, and no student data beyond
      what they type into the join screen. Good enough for a classroom tool;
      you can tighten it further later if you want.)
   7. Save this file. That's it — the Quiz Hub automatically detects a real
      config and switches from Local Demo Mode to live sync across every
      device, no other code changes needed. */

const FIREBASE_CONFIG = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  databaseURL: "PASTE_YOUR_DATABASE_URL", // looks like https://<project>-default-rtdb.<region>.firebasedatabase.app
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

function isFirebaseConfigured(){
  return typeof FIREBASE_CONFIG === 'object' && FIREBASE_CONFIG
    && typeof FIREBASE_CONFIG.apiKey === 'string'
    && FIREBASE_CONFIG.apiKey.indexOf('PASTE_') !== 0
    && typeof FIREBASE_CONFIG.databaseURL === 'string'
    && FIREBASE_CONFIG.databaseURL.indexOf('PASTE_') !== 0;
}
