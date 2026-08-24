/* ===================== GLOBAL SITE NAVIGATION — single source of truth =====================
   Used by nav.js to render the persistent header on every hub-level page
   (hub root, course listings, Practice/Downloadables/Assignments/Suggestions/About).
   Paths are root-absolute (start with /) since this file is loaded from many
   different folder depths — this assumes the site is hosted from its own
   domain root, which is how it's deployed on Netlify. Individual lesson
   pages (unit-4, unit-5, unit-6 apps) do NOT load this — they keep their
   own existing topbar untouched. */
const NAV_ITEMS = [
  { key:'home',         label:'Home',          href:'/index.html' },
  { key:'courses',      label:'Courses',       href:'/index.html#courses' },
  { key:'practice',     label:'Practice',      href:'/practice/index.html' },
  { key:'downloads',    label:'Downloadables', href:'/downloads/index.html' },
  { key:'quizzes',      label:'Quiz Hub',      href:'/quizzes/index.html' },
  { key:'assignments',  label:'Assignments',   href:'/assignments/index.html' },
  { key:'suggestions',  label:'Suggestions',   href:'/suggestions/index.html' },
  { key:'about',        label:'About',         href:'/about/index.html' }
];
