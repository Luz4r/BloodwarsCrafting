# Bloodwars Ring Crafting Tool — Web App Plan (v2)

## Context
User has 9 CSV files covering all Bloodwars Moria item categories. Each CSV contains item subtype combination matrices, plus prefix and/or suffix combination matrices. The web app needs three features:
1. **Forward lookup** — pick two items, see what they combine into
2. **Reverse lookup** — pick a desired item, see all ingredient pairs that produce it
3. **Crafting path** — pick a starting item + desired target, see the step-by-step crafting path (NEW)

---

## Output File
- **Create:** `C:/Users/piore/Desktop/Bloodwars/index.html` (single HTML file, no backend)

## Source CSVs (read-only reference)
All in `C:/Users/piore/Desktop/Bloodwars/`

| File | Category | Subtypes | Prefixes | Suffixes |
|------|----------|----------|----------|----------|
| ringi.csv | Pierścienie (Rings) | 3 | 28 | 20 |
| amu.csv | Amulety (Amulets) | 6 | 29 | 20 |
| biała 1h.csv | Broń biała 1h | 11 | 21 | 23 |
| biała 2h.csv | Broń biała 2h | 11 | 22 | 19 |
| dystans.csv | Broń dystansowa | 12 | **0** | 9 |
| gatki.csv | Spodnie | 5 | 18 | 16 |
| głowa.csv | Nakrycia głowy | 11 | 19 | 18 |
| klata.csv | Zbroje | 11 | 17 | 21 |
| palna 1 i 2h.csv | Broń palna | 16 | **0** | **0** |

---

## Architecture

### Data Embedding Strategy
Embed all 9 CSV datasets as JS objects directly in `<script>` tag (no fetch, works on `file://`).

Each category object:
```js
const CATEGORIES = {
  rings: {
    name: 'Pierścienie',
    subtypes: ['pierscien', 'sygnet', 'bransoleta'],
    prefixes: [...],   // null/[] for dystans, palna
    suffixes: [...],   // null/[] for palna
    typeMatrix: { pierscien: { pierscien: 'pierscien', sygnet: 'bransoleta', ... }, ... },
    prefixMatrix: { ... },  // null for dystans, palna
    suffixMatrix: { ... },  // null for palna
  },
  amulets: { ... },
  // ...all 9 categories
};
```

### Data Normalization
Apply during transcription — canonical ASCII-lowercase forms for all keys. Known typos to fix:
- `nakromancki` → `nekromancki`
- `niedziwiedzi`, `niedziwedzi` → `niedzwiedzi`
- `pajęczy`, `jastrzębi` → `pajeczy`, `jastrzebi`
- `siły` → `sily`

---

## Core Logic

### Forward Lookup (O(1))
```js
function forwardLookup(cat, itemA, itemB) {
  return {
    type:   cat.typeMatrix[itemA.type][itemB.type],
    prefix: cat.prefixMatrix?.[itemA.prefix]?.[itemB.prefix] ?? null,
    suffix: cat.suffixMatrix?.[itemA.suffix]?.[itemB.suffix] ?? null,
  };
}
```

### Inverse Maps (built at category load)
```js
function buildInverse(matrix, keys) {
  const inv = {};
  for (const a of keys) for (const b of keys) {
    const r = matrix[a]?.[b];
    if (!r) continue;
    if (!inv[r]) inv[r] = [];
    if (keys.indexOf(a) <= keys.indexOf(b)) inv[r].push([a, b]);
  }
  return inv;
}
```

### Reverse Lookup
Given target (type, prefix, suffix) → all ingredient pairs from the three inverse maps, combined.

### Crafting Path — NEW FEATURE (BFS per attribute)
For each attribute independently (type, prefix, suffix), find the shortest sequence of crafts from source → target:

```js
function bfsPath(matrix, keys, start, target) {
  if (start === target) return [];
  const visited = new Set([start]);
  // queue: [currentValue, path so far]
  // path entry: { combineWith, result }
  const queue = [[start, []]];
  while (queue.length) {
    const [cur, path] = queue.shift();
    for (const partner of keys) {
      const result = matrix[cur]?.[partner];
      if (!result) continue;
      if (visited.has(result)) continue;
      const newPath = [...path, { from: cur, combineWith: partner, result }];
      if (result === target) return newPath;
      visited.add(result);
      queue.push([result, newPath]);
    }
  }
  return null; // unreachable
}
```

**UI Output for Path Tab:**
```
Prefiks: miedziany → czarny
  Krok 1: miedziany  +  [jastrzebi]  →  twardy
  Krok 2: twardy     +  [X]          →  czarny

Sufiks: urody → latwosci
  Krok 1: ...

Typ: pierscien → sygnet
  Krok 1: pierscien + [bransoleta] → sygnet
```
Each step shows the item to combine with in brackets — the user needs to obtain/craft that item.

---

## UI Design

**Stack:** Single HTML file, Tailwind CSS via CDN (`https://cdn.tailwindcss.com`). Dark/gold theme. Polish language.

**Global:** Category selector dropdown at the top (selects which item type: Pierścienie, Amulety, etc.)

**Three tabs:**
1. **Szukaj Składników** (Reverse — default): Three dropdowns for target → results table
2. **Wynik Łączenia** (Forward): Two item selectors → live result display
3. **Ścieżka Wytwarzania** (Path): Start item + Target item → step-by-step path per attribute

**Special cases:**
- Ranged weapons (`dystans`): hide prefix dropdowns everywhere
- Firearms (`palna`): hide prefix + suffix dropdowns; show only type combinations

---

## Ring Type Matrix (example — all 9 categories will be transcribed)

|            | pierscien  | sygnet     | bransoleta |
|------------|------------|------------|------------|
| pierscien  | pierscien  | bransoleta | sygnet     |
| sygnet     | bransoleta | sygnet     | pierscien  |
| bransoleta | sygnet     | pierscien  | bransoleta |

---

## Implementation Steps

1. Read all 9 CSV files carefully and transcribe data into JS objects (most time-consuming)
2. Apply normalization during transcription
3. Write core functions: `buildInverse()`, `forwardLookup()`, `reverseLookup()`, `bfsPath()`
4. Build HTML skeleton (Tailwind dark theme, category dropdown, three tabs)
5. Implement Forward tab (live update on dropdown change)
6. Implement Reverse tab (button trigger, results table with count + 50-row cap)
7. Implement Path tab (BFS per attribute, step-by-step display)
8. Handle edge cases: no prefix category, no prefix+suffix category, unreachable paths
9. Display labels with Polish diacritics for all keys

## Incremental Implementation Strategy

To avoid context overload (reading all 9 CSVs at once floods ~71KB into context, causing freezing),
transcribe and embed files **one or two at a time**, writing to `index.html` after each batch.

**Order by complexity (simplest first):**
1. `palna.csv` (1KB, no prefix/suffix) — write HTML skeleton + embed this first
2. `dystans.csv` (2.5KB, no prefix)
3. `gatki.csv` (5.9KB)
4. `ringi.csv` (13KB)
5. `amu.csv` (13.4KB)
6. `głowa.csv` + `klata.csv` (8.3KB each, same structure)
7. `biała1h.csv` + `biała2h.csv` (9.5KB + 9KB, same structure)

Each batch: read CSV(s) → transcribe to JS → write/append to `index.html` → continue.

---

## Verification
- Open `index.html` in browser (no server needed — all data embedded)
- Forward: pick two known items, verify result matches CSV
- Reverse: pick a target, spot-check pairs via forward lookup
- Path: pick a start+target, verify each step using forward lookup
- Edge cases: try ranged weapons (no prefix), firearms (no prefix/suffix), same start+target
