/* ===================== GLOBAL SITE NAVIGATION — renderer =====================
   Renders the persistent header into <div id="siteNav"></div>. Include
   nav-data.js before this file, and nav.css in <head>. Purely additive —
   pages that don't include this file (every unit lesson page) are
   completely unaffected. */
function renderSiteNav(){
  const mount = document.getElementById('siteNav');
  if(!mount) return;

  const path = location.pathname.replace(/\/index\.html$/, '/') || '/';
  function isActive(item){
    const [itemPathRaw, itemHash] = item.href.split('#');
    const itemPath = itemPathRaw.replace(/\/index\.html$/, '/') || '/';
    // Hash-only links (e.g. Courses -> /index.html#courses) only ever highlight
    // via an exact hash match — otherwise they'd always tie with Home on '/'.
    if(itemHash) return path === itemPath && location.hash === `#${itemHash}`;
    // Home has no hash of its own — don't let it also light up when a
    // hash-based item (like Courses) is the one actually active.
    if(itemPath === '/') return path === '/' && !location.hash;
    return path.startsWith(itemPath);
  }

  const linksHTML = NAV_ITEMS.map(item =>
    `<a class="site-nav-link${isActive(item) ? ' active' : ''}" href="${item.href}">${item.label}</a>`
  ).join('');
  const mobileLinksHTML = NAV_ITEMS.map(item =>
    `<a${isActive(item) ? ' class="active"' : ''} href="${item.href}">${item.label}</a>`
  ).join('');

  mount.innerHTML = `
    <div class="site-nav">
      <div class="site-nav-inner">
        <a class="site-nav-brand" href="/index.html">
          <div class="site-nav-badge">ELH</div>
          <span class="site-nav-brand-txt">English Learning Hub</span>
        </a>
        <nav class="site-nav-links" aria-label="Main navigation">${linksHTML}</nav>
        <button class="site-nav-burger" id="siteNavBurger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <nav class="site-nav-mobile" id="siteNavMobile" aria-label="Mobile navigation">${mobileLinksHTML}</nav>
  `;

  const burger = document.getElementById('siteNavBurger');
  const mobileNav = document.getElementById('siteNavMobile');
  burger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}
document.addEventListener('DOMContentLoaded', renderSiteNav);
