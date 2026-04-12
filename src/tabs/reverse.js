import { getCat, lbl, currentCat } from '../state.js';
import { buildInverse } from '../lib/matrix.js';
import { renderPairsSection } from '../ui/render.js';

export function doReverse() {
  const cat = getCat();
  const targetType = document.getElementById('rev-type').value;
  const targetPrefix = cat.prefixes ? document.getElementById('rev-prefix').value : '__any__';
  const targetSuffix = cat.suffixes ? document.getElementById('rev-suffix').value : '__any__';

  let html = '';

  // Type pairs
  {
    const inv = buildInverse(cat.typeMatrix, cat.subtypes);
    const pairs = inv[targetType] || [];
    html += renderPairsSection('Typ: ' + lbl(targetType), pairs, 'typ');
  }

  // Prefix pairs
  if (cat.prefixes && targetPrefix !== '__any__') {
    const inv = buildInverse(cat.prefixMatrix, cat.prefixes);
    const pairs = inv[targetPrefix] || [];
    html += renderPairsSection('Prefiks: ' + lbl(targetPrefix), pairs, 'pref');
  }

  // Suffix pairs
  if (cat.suffixes && targetSuffix !== '__any__') {
    const inv = buildInverse(cat.suffixMatrix, cat.suffixes);
    const pairs = inv[targetSuffix] || [];
    html += renderPairsSection('Sufiks: ' + lbl(targetSuffix), pairs, 'suf');
  }

  document.getElementById('rev-results').innerHTML = html || '<p style="color:#888">Brak wyników.</p>';
}
