import { CATEGORIES } from '../data/categories.js';
import { lbl } from '../state.js';

export function normalize(s) {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(s) {
  const n = normalize(s);
  return n ? n.split(' ') : [];
}

function expandPrefixForms(displayLabel) {
  const base = normalize(displayLabel);
  const out = new Set();
  if (!base) return out;
  out.add(base);
  if (/[yiae]$/.test(base)) {
    const stem = base.slice(0, -1);
    for (const v of ['y', 'i', 'a', 'e', 'ia', 'ie']) out.add(stem + v);
  }
  if (/(ia|ie|iy)$/.test(base)) {
    const stem = base.slice(0, -2);
    for (const v of ['y', 'i', 'a', 'e', 'ia', 'ie']) out.add(stem + v);
  }
  return out;
}

const _prefixIdx = new Map();
const _suffixIdx = new Map();
const _typeTokensIdx = new Map();

function buildPrefixIndexFor(catKey) {
  const cat = CATEGORIES[catKey];
  const idx = new Map();
  if (!cat || !cat.prefixes) return idx;
  // Pass 1: register canonical base forms (these always win).
  for (const key of cat.prefixes) {
    const base = normalize(lbl(key));
    if (base) idx.set(base, key);
  }
  // Pass 2: register expanded forms only if the slot is still free.
  for (const key of cat.prefixes) {
    const forms = expandPrefixForms(lbl(key));
    for (const f of forms) {
      if (!idx.has(f)) idx.set(f, key);
    }
  }
  return idx;
}

function buildSuffixIndexFor(catKey) {
  const cat = CATEGORIES[catKey];
  const idx = new Map();
  if (!cat || !cat.suffixes) return idx;
  for (const key of cat.suffixes) {
    const f = normalize(lbl(key));
    if (!f) continue;
    if (idx.has(f) && idx.get(f) !== key) continue;
    idx.set(f, key);
  }
  return idx;
}

function buildTypeTokensFor(catKey) {
  const cat = CATEGORIES[catKey];
  const out = [];
  if (!cat || !cat.subtypes) return out;
  for (const key of cat.subtypes) {
    const tokens = tokenize(lbl(key));
    if (tokens.length) out.push({ key, tokens });
  }
  out.sort((a, b) => b.tokens.length - a.tokens.length || b.tokens.join(' ').length - a.tokens.join(' ').length);
  return out;
}

export function getPrefixFormIndex(catKey) {
  if (!_prefixIdx.has(catKey)) _prefixIdx.set(catKey, buildPrefixIndexFor(catKey));
  return _prefixIdx.get(catKey);
}

export function getSuffixFormIndex(catKey) {
  if (!_suffixIdx.has(catKey)) _suffixIdx.set(catKey, buildSuffixIndexFor(catKey));
  return _suffixIdx.get(catKey);
}

export function getCatTypesByLength(catKey) {
  if (!_typeTokensIdx.has(catKey)) _typeTokensIdx.set(catKey, buildTypeTokensFor(catKey));
  return _typeTokensIdx.get(catKey);
}

export function getAllCatKeys() {
  return Object.keys(CATEGORIES);
}
