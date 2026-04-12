import { getCat, currentCat } from '../state.js';
import { bfsAllPaths } from '../lib/matrix.js';
import { getBlocked } from '../lib/storage.js';
import { renderPathSection } from '../ui/render.js';

export function doPath() {
  const cat = getCat();
  const aType = document.getElementById('path-a-type').value;
  const bType = document.getElementById('path-b-type').value;
  const aPrefix = cat.prefixes ? document.getElementById('path-a-prefix').value : '__any__';
  const bPrefix = cat.prefixes ? document.getElementById('path-b-prefix').value : '__any__';
  const aSuffix = cat.suffixes ? document.getElementById('path-a-suffix').value : '__any__';
  const bSuffix = cat.suffixes ? document.getElementById('path-b-suffix').value : '__any__';

  const bTypes    = getBlocked(currentCat, 'types');
  const bPrefixes = getBlocked(currentCat, 'prefixes');
  const bSuffixes = getBlocked(currentCat, 'suffixes');
  const maxDepth  = parseInt(document.getElementById('max-depth').value) || 6;

  let html = '';

  const typePaths = bfsAllPaths(cat.typeMatrix, cat.subtypes, aType, bType, bTypes, maxDepth);
  html += renderPathSection('Typ', aType, bType, typePaths);

  if (cat.prefixes && aPrefix !== '__any__' && bPrefix !== '__any__') {
    const prefPaths = bfsAllPaths(cat.prefixMatrix, cat.prefixes, aPrefix, bPrefix, bPrefixes, maxDepth);
    html += renderPathSection('Prefiks', aPrefix, bPrefix, prefPaths);
  }

  if (cat.suffixes && aSuffix !== '__any__' && bSuffix !== '__any__') {
    const suffPaths = bfsAllPaths(cat.suffixMatrix, cat.suffixes, aSuffix, bSuffix, bSuffixes, maxDepth);
    html += renderPathSection('Sufiks', aSuffix, bSuffix, suffPaths);
  }

  document.getElementById('path-result').innerHTML = html || '<p style="color:#888">Wybierz przedmioty startowy i docelowy.</p>';
}
