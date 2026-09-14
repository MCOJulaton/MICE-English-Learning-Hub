/* ===================== ROLE LOCK =====================
   Shared component for genuine student-to-student information-gap sections
   (Units 10-13). Replaces the old same-screen A/B toggle pattern, which let
   one student click through every role's "private" content solo and still
   get full credit.

   A student commits to one role once; from then on only that role's content
   is returned by the render function — the other role's data is never
   interpolated into the HTML at all, not just visually hidden. The commit
   is stored in sessionStorage (not a JS variable, which renderAll() would
   destroy on every navigation; not the in-memory Progress object, which a
   page reload already wipes) so it survives both re-render and reload.

   Zero unit-local coupling: every unit passes in its own storage key and
   its own {roleId: {label, pickerText}} object. Depends only on the
   global renderAll() already defined in every unit's app.js.

   Known, stated limitation: this is a static site with no login and no
   backend. The lock stops the one-click, same-screen solo-cheat path — it
   is a UI-level fix for a real classroom failure mode, not a cryptographic
   guarantee. A student using devtools can still read the other role's data
   from the page's own JS. The picker copy says this plainly rather than
   overselling the mechanic. */
const RoleLock = (function(){

  function init(storageKey, roles){
    const myRole = sessionStorage.getItem(storageKey);
    return {
      myRole: (myRole && roles[myRole]) ? myRole : null,
      pick(roleId){
        sessionStorage.setItem(storageKey, roleId);
        renderAll();
      },
      reset(){
        sessionStorage.removeItem(storageKey);
        renderAll();
      }
    };
  }

  function renderPicker(storageKey, roles, introText){
    const roleIds = Object.keys(roles);
    const buttons = roleIds.map(id => `<button class="startbtn rolelock-pick-btn" data-rolelock-pick="${id}" style="display:block;width:100%;text-align:left;margin-top:10px;">${roles[id].label}</button>`).join('');
    return `
    <div class="panel rolelock-picker">
      <p style="color:var(--ink);font-size:14.5px;line-height:1.6;">${introText || 'Choose the role your teacher assigned you.'}</p>
      <div class="rolelock-note" style="margin-top:10px;padding:12px 14px;border-radius:10px;background:var(--cream);border:1px solid var(--line);font-size:13px;color:var(--muted);line-height:1.6;">
        Do this on your <b>own device or browser tab</b>. If you and your partner are sharing one screen, only one of you should pick below — this activity only works as a real information gap if each of you sees just your own role.
      </div>
      <div style="margin-top:16px;">${buttons}</div>
    </div>`;
  }

  function renderLockedFooter(storageKey){
    return `
    <div class="rolelock-footer" style="margin-top:18px;padding-top:14px;border-top:1px dashed var(--line);font-size:12.5px;color:var(--muted);">
      <button class="reveal-btn" data-rolelock-reset="${storageKey}" style="font-size:12.5px;padding:6px 12px;">Start Over</button>
      <span style="margin-left:10px;">Not your role, or handing this screen to someone else? Start Over clears your choice. This lesson has no login, so this only works if you each open it separately — if you're practicing alone, Start Over lets you see the other side, but you'll only get the real activity's value with a partner on their own device.</span>
    </div>`;
  }

  function wire(storageKey, roles){
    const pickBtns = document.querySelectorAll(`[data-rolelock-pick]`);
    pickBtns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        sessionStorage.setItem(storageKey, btn.dataset.rolelockPick);
        renderAll();
      });
    });
    const resetBtn = document.querySelector(`[data-rolelock-reset="${storageKey}"]`);
    if(resetBtn){
      resetBtn.addEventListener('click', ()=>{
        sessionStorage.removeItem(storageKey);
        renderAll();
      });
    }
  }

  return { init, renderPicker, renderLockedFooter, wire };
})();
