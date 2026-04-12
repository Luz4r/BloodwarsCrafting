import { getCat, lbl, currentCat } from '../state.js';
import { getBlocked } from '../lib/storage.js';
import { showEl } from './selects.js';

export function renderBlockedUI() {
  const cat = getCat();
  function buildChips(containerId, items, attr) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const blocked = getBlocked(currentCat, attr);
    el.innerHTML = items.map(k =>
      `<span onclick="window.toggleBlockedItem('${attr}','${k.replace(/'/g, "\\'")}')"
        style="cursor:pointer;display:inline-block;padding:3px 10px;margin:2px;border-radius:20px;font-size:0.82em;border:1px solid ${blocked.has(k) ? '#cc4444' : '#5a3e1b'};background:${blocked.has(k) ? '#3a0a0a' : '#1a1a1a'};color:${blocked.has(k) ? '#ff8888' : '#a07030'};"
        title="${blocked.has(k) ? 'Kliknij aby odblokować' : 'Kliknij aby zablokować'}">${lbl(k)}</span>`
    ).join('');
  }
  buildChips('blocked-types-chips', cat.subtypes, 'types');
  const hasPref = cat.prefixes && cat.prefixes.length > 0;
  const hasSuff = cat.suffixes && cat.suffixes.length > 0;
  showEl('blocked-prefix-row', hasPref);
  showEl('blocked-suffix-row', hasSuff);
  if (hasPref) buildChips('blocked-prefix-chips', cat.prefixes, 'prefixes');
  if (hasSuff) buildChips('blocked-suffix-chips', cat.suffixes, 'suffixes');
}
