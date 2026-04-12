import { getCat, lbl } from '../state.js';

export function doForward() {
  const cat = getCat();
  const aType = document.getElementById('fwd-a-type').value;
  const bType = document.getElementById('fwd-b-type').value;
  const aPrefix = cat.prefixes ? document.getElementById('fwd-a-prefix').value : '__any__';
  const bPrefix = cat.prefixes ? document.getElementById('fwd-b-prefix').value : '__any__';
  const aSuffix = cat.suffixes ? document.getElementById('fwd-a-suffix').value : '__any__';
  const bSuffix = cat.suffixes ? document.getElementById('fwd-b-suffix').value : '__any__';

  const rType = cat.typeMatrix[aType] && cat.typeMatrix[aType][bType];
  const rPref = (cat.prefixes && aPrefix !== '__any__' && bPrefix !== '__any__')
    ? (cat.prefixMatrix[aPrefix] && cat.prefixMatrix[aPrefix][bPrefix])
    : null;
  const rSuff = (cat.suffixes && aSuffix !== '__any__' && bSuffix !== '__any__')
    ? (cat.suffixMatrix[aSuffix] && cat.suffixMatrix[aSuffix][bSuffix])
    : null;

  let html = '<div class="card" style="border-color:#c9952a;">';
  html += '<div class="attr-label mb-3">Wynik łączenia</div>';
  html += `<div class="mb-2"><span class="attr-label" style="margin-right:8px;">Typ:</span><span class="result-badge">${rType ? lbl(rType) : '—'}</span></div>`;
  if (cat.prefixes) {
    html += `<div class="mb-2"><span class="attr-label" style="margin-right:8px;">Prefiks:</span>`;
    if (aPrefix === '__any__' || bPrefix === '__any__') {
      html += '<span style="color:#888">wybierz oba prefiksy</span>';
    } else {
      html += `<span class="result-badge">${rPref ? lbl(rPref) : '—'}</span>`;
    }
    html += '</div>';
  }
  if (cat.suffixes) {
    html += `<div class="mb-2"><span class="attr-label" style="margin-right:8px;">Sufiks:</span>`;
    if (aSuffix === '__any__' || bSuffix === '__any__') {
      html += '<span style="color:#888">wybierz oba sufiksy</span>';
    } else {
      html += `<span class="result-badge">${rSuff ? lbl(rSuff) : '—'}</span>`;
    }
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('fwd-result').innerHTML = html;
}
