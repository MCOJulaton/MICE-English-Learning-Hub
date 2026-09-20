// js/answer-lock.js
// Site-wide answer-locking safety net: keeps any ".model-answer" element's
// real content out of the DOM until its paired ".reveal-btn" is actually
// clicked, instead of relying on CSS alone (display:none) to hide an answer
// that's already sitting in the page source. Works transparently underneath
// every unit's existing render()/wire() code -- no other file needs to
// change how it builds or reveals a .model-answer element.
//
// Known limitation: the real answer text still lives in each unit's
// downloadable data.js. This closes the realistic "Inspect Element" peeking
// path, not a determined read of the Sources panel -- same honesty
// js/role-lock.js already states about its own limits.
(function(){
  const store = new WeakMap();
  function strip(el){ if(store.has(el)) return; store.set(el, el.innerHTML); el.innerHTML = ''; }
  function restore(el){ if(el.classList.contains('show') && store.has(el)) el.innerHTML = store.get(el); }
  function scan(root){
    if(root.nodeType!==1) return;
    if(root.matches && root.matches('.model-answer')) strip(root);
    if(root.querySelectorAll) root.querySelectorAll('.model-answer').forEach(strip);
  }
  const mo = new MutationObserver(muts => {
    for(const m of muts){
      if(m.type==='childList') m.addedNodes.forEach(scan);
      else if(m.type==='attributes' && m.target.classList && m.target.classList.contains('model-answer')) restore(m.target);
    }
  });
  (function arm(){
    const app = document.getElementById('app');
    if(!app){ requestAnimationFrame(arm); return; }
    scan(app);
    mo.observe(app, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
  })();
})();
