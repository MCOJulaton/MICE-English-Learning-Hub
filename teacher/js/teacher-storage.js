/* ===================== TEACHER DASHBOARD — local file storage (Phase 4) =====================
   Evidence/portfolio files (videos, documents, images) need somewhere to put
   the actual bytes — localStorage can't hold them (it's a ~5-10MB text-only
   store, already used for the roster JSON). This wraps IndexedDB, which the
   browser gives every origin a much larger blob-capable store for, so file
   uploads genuinely work in Local Demo Mode instead of being a placeholder.

   This is still entirely browser-local: nothing here syncs across devices
   and nothing here is secure. Once Firebase Storage is configured (see
   teacher-firebase-config.js), TeacherBackend's evidence methods upload to
   Storage instead and this file stops being used — same graceful-upgrade
   pattern as everything else in this dashboard. */
const TeacherLocalFiles = (function(){
  const DB_NAME = 'teacherDashboardFiles';
  const STORE = 'evidenceBlobs';
  let dbPromise = null;

  function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function putBlob(key, blob){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getBlob(key){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteBlob(key){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  return { putBlob, getBlob, deleteBlob };
})();
