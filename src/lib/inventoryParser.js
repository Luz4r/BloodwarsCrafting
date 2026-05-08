import { CATEGORIES } from '../data/categories.js';
import { lbl } from '../state.js';
import {
  normalize,
  tokenize,
  getPrefixFormIndex,
  getSuffixFormIndex,
  getCatTypesByLength,
  getAllCatKeys,
} from './labels.js';

const QUALITY_WORDS = new Set([
  'legendarny', 'legendarna', 'legendarne',
  'dobry', 'dobra', 'dobre',
  'doskonaly', 'doskonala', 'doskonale',
]);

const NOISE_PATTERNS = [
  /^---$/,
  /^\d+\.(?:\s|$)/,
  /^\d+(?:\s+\d+)*\s*$/,
  /^wartosc:/i,
  /\(rozwin\)/,
  /^przedmiotow z tej/,
  /^zbrojownia/,
  /^zdefiniowane zestawy/,
  /^aktywne premie/,
  /^copyright/,
  /^bw team/,
  /^pln(?:\s|$)/,
  /^krew(?:\s|$)/,
  /^pieniadze(?:\s|$)/,
  /^ludzie(?:\s|$)/,
  /^\+?\d+\s+pln/,
  /^\+?\d+\s+l\s/,
  /^[+-]?\d+(?:\s\d+)*\s*(pln|l)\s*\/\s*h$/,
];

function isNoise(line) {
  const n = normalize(line);
  if (!n) return true;
  for (const re of NOISE_PATTERNS) if (re.test(n)) return true;
  return false;
}

function stripEnchant(line) {
  return line.replace(/\s*\(\+\d+\)\s*$/, '').trim();
}

function stripQualityTokens(tokens) {
  let i = 0;
  while (i < tokens.length && QUALITY_WORDS.has(tokens[i])) i++;
  return tokens.slice(i);
}

// Find longest type match across all categories.
// Returns { catKey, typeKey, start, end } or null. start/end are token indices, end exclusive.
function findTypeSpan(tokens) {
  let best = null;
  for (const catKey of getAllCatKeys()) {
    const types = getCatTypesByLength(catKey);
    for (const { key, tokens: typeTokens } of types) {
      const tlen = typeTokens.length;
      if (tlen > tokens.length) continue;
      for (let i = 0; i + tlen <= tokens.length; i++) {
        let match = true;
        for (let j = 0; j < tlen; j++) {
          if (tokens[i + j] !== typeTokens[j]) { match = false; break; }
        }
        if (match) {
          const score = tlen;
          if (!best || score > best.score) {
            best = { catKey, typeKey: key, start: i, end: i + tlen, score };
          }
          break; // first occurrence in this line is fine
        }
      }
    }
  }
  if (!best) return null;
  return { catKey: best.catKey, typeKey: best.typeKey, start: best.start, end: best.end };
}

function matchPrefix(tokens, catKey) {
  if (tokens.length === 0) return '__any__';
  const cat = CATEGORIES[catKey];
  if (!cat || !cat.prefixes) return null;
  const idx = getPrefixFormIndex(catKey);
  // Try whole span first, then progressively shorter from the right (in case stray quality residue)
  for (let start = 0; start < tokens.length; start++) {
    const joined = tokens.slice(start).join(' ');
    if (idx.has(joined)) {
      // Tokens before `start` must all be quality words; they'd already be stripped, so a non-zero start
      // here means leftover noise we don't trust — accept only start=0.
      if (start === 0) return idx.get(joined);
    }
  }
  return null;
}

function matchSuffix(tokens, catKey) {
  if (tokens.length === 0) return '__any__';
  const cat = CATEGORIES[catKey];
  if (!cat || !cat.suffixes) return null;
  const idx = getSuffixFormIndex(catKey);
  // Greedy: try longest span starting at 0
  for (let len = tokens.length; len >= 1; len--) {
    const joined = tokens.slice(0, len).join(' ');
    if (idx.has(joined) && len === tokens.length) {
      return idx.get(joined);
    }
  }
  return null;
}

function parseLine(line) {
  if (isNoise(line)) return null;
  const stripped = stripEnchant(line);
  if (!stripped) return null;
  const allTokens = tokenize(stripped);
  if (!allTokens.length) return null;
  const tokens = stripQualityTokens(allTokens);
  if (!tokens.length) return null;

  const span = findTypeSpan(tokens);
  if (!span) return null;

  const before = tokens.slice(0, span.start);
  const after = tokens.slice(span.end);

  const cat = CATEGORIES[span.catKey];
  const hasPref = !!(cat.prefixes && cat.prefixes.length);
  const hasSuff = !!(cat.suffixes && cat.suffixes.length);

  let prefix = '__any__';
  if (before.length) {
    if (!hasPref) return null;
    const m = matchPrefix(before, span.catKey);
    if (!m) return null;
    prefix = m;
  }

  let suffix = '__any__';
  if (after.length) {
    if (!hasSuff) return null;
    const m = matchSuffix(after, span.catKey);
    if (!m) return null;
    suffix = m;
  }

  return {
    cat: span.catKey,
    type: span.typeKey,
    prefix,
    suffix,
    raw: line.trim(),
  };
}

export function parseInventory(rawText) {
  const items = [];
  const skippedLines = [];
  const lines = (rawText || '').split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const item = parseLine(line);
    if (item) items.push(item);
    else if (!isNoise(line)) skippedLines.push(line.trim());
  }
  return { items, skipped: skippedLines.length, skippedLines };
}

export function itemDisplayName(item) {
  if (!item) return '';
  const parts = [];
  if (item.prefix && item.prefix !== '__any__') parts.push(lbl(item.prefix));
  parts.push(lbl(item.type));
  if (item.suffix && item.suffix !== '__any__') parts.push(lbl(item.suffix));
  return parts.join(' ');
}
