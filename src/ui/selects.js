import { getCat, lbl } from '../state.js';

export function populateSelect(id, items, includeAny, anyLabel) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '';
  if (includeAny) {
    const opt = document.createElement('option');
    opt.value = '__any__';
    opt.textContent = anyLabel || '(dowolny)';
    sel.appendChild(opt);
  }
  for (const item of [...items].sort((a, b) => lbl(a).localeCompare(lbl(b), undefined, { sensitivity: 'base' }))) {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = lbl(item);
    sel.appendChild(opt);
  }
}

export function showEl(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? '' : 'none';
}

export function rebuildAllSelects() {
  const cat = getCat();
  const hasPref = cat.prefixes && cat.prefixes.length > 0;
  const hasSuff = cat.suffixes && cat.suffixes.length > 0;

  // Reverse tab
  populateSelect('rev-type', cat.subtypes, false);
  showEl('rev-prefix-wrap', hasPref);
  if (hasPref) populateSelect('rev-prefix', cat.prefixes, true, '(dowolny prefiks)');
  showEl('rev-suffix-wrap', hasSuff);
  if (hasSuff) populateSelect('rev-suffix', cat.suffixes, true, '(dowolny sufiks)');

  // Forward tab
  populateSelect('fwd-a-type', cat.subtypes, false);
  populateSelect('fwd-b-type', cat.subtypes, false);
  showEl('fwd-a-prefix-wrap', hasPref);
  showEl('fwd-b-prefix-wrap', hasPref);
  showEl('fwd-a-suffix-wrap', hasSuff);
  showEl('fwd-b-suffix-wrap', hasSuff);
  if (hasPref) {
    populateSelect('fwd-a-prefix', cat.prefixes, true, '(brak)');
    populateSelect('fwd-b-prefix', cat.prefixes, true, '(brak)');
  }
  if (hasSuff) {
    populateSelect('fwd-a-suffix', cat.suffixes, true, '(brak)');
    populateSelect('fwd-b-suffix', cat.suffixes, true, '(brak)');
  }

  // Path tab
  populateSelect('path-a-type', cat.subtypes, false);
  populateSelect('path-b-type', cat.subtypes, false);
  showEl('path-a-prefix-wrap', hasPref);
  showEl('path-b-prefix-wrap', hasPref);
  showEl('path-a-suffix-wrap', hasSuff);
  showEl('path-b-suffix-wrap', hasSuff);
  if (hasPref) {
    populateSelect('path-a-prefix', cat.prefixes, true, '(brak)');
    populateSelect('path-b-prefix', cat.prefixes, true, '(brak)');
  }
  if (hasSuff) {
    populateSelect('path-a-suffix', cat.suffixes, true, '(brak)');
    populateSelect('path-b-suffix', cat.suffixes, true, '(brak)');
  }

  // Craft tab
  populateSelect('craft-type', cat.subtypes, false);
  showEl('craft-prefix-wrap', hasPref);
  showEl('craft-suffix-wrap', hasSuff);
  if (hasPref) populateSelect('craft-prefix', cat.prefixes, true, '(dowolny prefiks)');
  if (hasSuff) populateSelect('craft-suffix', cat.suffixes, true, '(dowolny sufiks)');
}
