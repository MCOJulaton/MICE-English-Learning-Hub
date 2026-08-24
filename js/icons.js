/* ===================== SHARED ICON SYSTEM =====================
   A small, consistent set of line icons (Lucide style: 24x24 source
   grid, 2px stroke, round caps/joins) for the handful of places across
   the site where an icon serves a real functional purpose — locked
   content, downloads, audio, etc. This is the ONLY icon system the
   site uses; nothing here is decorative, and nothing outside this file
   should introduce a different icon style. Vocabulary/content emoji
   (used to help A1 learners recognize a word, e.g. an apple emoji next
   to "apple") are a separate, deliberate exception — see the emoji
   cleanup notes in memory for the reasoning.

   Usage: `${ICONS.lock}` inserts the icon at its default 16px size.
   For a different size/class, use `icon('lock', {size:20, className:'x'})`.
   Every icon uses stroke="currentColor" so it always matches the
   surrounding text color — including each course's own theme, with
   no extra configuration needed. Pair with the .icon-inline utility
   class (in css/theme.css) when placing an icon next to text so it
   aligns on the same baseline instead of sitting a few px off. */
const ICON_PATHS = {
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3v-7a9 9 0 0 1 18 0v7h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>',
  rotateCcw: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  pause: '<rect width="4" height="16" x="6" y="4" rx="1"/><rect width="4" height="16" x="14" y="4" rx="1"/>',
  stop: '<rect x="5" y="5" width="14" height="14" rx="1.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  userMale: '<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/><path d="M15 5.5 18 2.5"/><path d="M15.5 2.5h3v3"/>',
  userFemale: '<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/><path d="M12 12v2"/><path d="M10 14h4"/>'
};

function icon(name, opts = {}){
  const size = opts.size || 16;
  const cls = opts.className ? ` class="${opts.className}"` : '';
  const path = ICON_PATHS[name];
  if(!path){ return ''; }
  return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

const ICONS = Object.keys(ICON_PATHS).reduce((acc, name) => {
  acc[name] = icon(name);
  return acc;
}, {});
