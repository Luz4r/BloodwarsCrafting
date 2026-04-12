import { getCat, lbl, currentCat } from '../state.js';
import { renderCraftSection } from '../ui/render.js';

export function doCraft() {
  const cat = getCat();
  const myType = document.getElementById('craft-type').value;
  const myPrefix = cat.prefixes ? document.getElementById('craft-prefix').value : '__any__';
  const mySuffix = cat.suffixes ? document.getElementById('craft-suffix').value : '__any__';

  let html = '';

  // Type: for each partner type, what result do I get?
  {
    const byResult = {};
    for (const partner of cat.subtypes) {
      const result = cat.typeMatrix[myType] && cat.typeMatrix[myType][partner];
      if (!result) continue;
      if (!byResult[result]) byResult[result] = [];
      byResult[result].push(partner);
    }
    html += renderCraftSection('Typ: ' + lbl(myType), byResult);
  }

  // Prefix
  if (cat.prefixes && myPrefix !== '__any__') {
    const byResult = {};
    for (const partner of cat.prefixes) {
      const result = cat.prefixMatrix[myPrefix] && cat.prefixMatrix[myPrefix][partner];
      if (!result) continue;
      if (!byResult[result]) byResult[result] = [];
      byResult[result].push(partner);
    }
    html += renderCraftSection('Prefiks: ' + lbl(myPrefix), byResult);
  }

  // Suffix
  if (cat.suffixes && mySuffix !== '__any__') {
    const byResult = {};
    for (const partner of cat.suffixes) {
      const result = cat.suffixMatrix[mySuffix] && cat.suffixMatrix[mySuffix][partner];
      if (!result) continue;
      if (!byResult[result]) byResult[result] = [];
      byResult[result].push(partner);
    }
    html += renderCraftSection('Sufiks: ' + lbl(mySuffix), byResult);
  }

  document.getElementById('craft-results').innerHTML = html || '<p style="color:#888">Brak wyników.</p>';
}
