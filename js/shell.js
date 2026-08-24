/* Shared behaviour for the hub and course-listing pages. */

let showToast = ()=>{}; // set up below, shared by both card types

function initToast(){
  const toast = document.getElementById('toastBanner');
  let hideTimer = null;
  showToast = function(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(()=> toast.classList.remove('show'), 2600);
  };
}

/* Plain (non-photo) locked cards: clicking shows a "Coming Soon" toast
   instead of navigating anywhere. Used by the course-unit listing pages,
   and by any other locked block that pairs `.is-locked` with a
   `data-soon-msg` attribute (e.g. locked Practice Hub unit blocks and
   locked Downloadables Hub material cards) — the selector below is
   generic on purpose so those reuse this same toast logic. */
function wireLockedCards(){
  document.querySelectorAll('.is-locked[data-soon-msg]:not(.pick-card-photo)').forEach(card=>{
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-disabled','true');
    const fire = ()=> showToast(card.dataset.soonMsg || 'Coming soon. This is not available yet.');
    card.addEventListener('click', fire);
    card.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); fire(); } });
  });
}

/* Photo cards (hub course cards): the title/description/status are hidden
   until the photo is hovered (mouse) or tapped (touch). On a touch device
   there's no hover, so the first tap reveals the overlay instead of acting
   immediately — a second tap then follows the link, or (for a locked card)
   shows the "Coming Soon" toast. */
function wirePhotoCards(){
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.querySelectorAll('.pick-card-photo').forEach(card=>{
    const isLocked = card.classList.contains('is-locked');
    if(isLocked){
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-disabled','true');
    }

    card.addEventListener('click', e=>{
      if(!hasHover && !card.classList.contains('revealed')){
        e.preventDefault();
        document.querySelectorAll('.pick-card-photo.revealed').forEach(c=>{ if(c!==card) c.classList.remove('revealed'); });
        card.classList.add('revealed');
        return;
      }
      if(isLocked){
        e.preventDefault();
        showToast(card.dataset.soonMsg || 'Coming soon. This is not available yet.');
      }
      // active card, already revealed (or hover-capable device): let the <a> navigate normally
    });

    card.addEventListener('keydown', e=>{
      if(e.key!=='Enter' && e.key!==' ') return;
      if(!card.classList.contains('revealed')){
        e.preventDefault();
        card.classList.add('revealed');
        if(isLocked) showToast(card.dataset.soonMsg || 'Coming soon. This is not available yet.');
      } else if(isLocked){
        e.preventDefault();
        showToast(card.dataset.soonMsg || 'Coming soon. This is not available yet.');
      }
    });
  });

  // Tapping/clicking anywhere outside a revealed card closes it again.
  document.addEventListener('click', e=>{
    if(!e.target.closest('.pick-card-photo')){
      document.querySelectorAll('.pick-card-photo.revealed').forEach(c=>c.classList.remove('revealed'));
    }
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initToast();
  wireLockedCards();
  wirePhotoCards();
});
