# Bloodwars — Kreator Przedmiotów

A single-page crafting calculator for the Polish browser game Bloodwars (Moria expansion).
It helps players figure out item combination recipes — what items to merge to get a desired result.

## Stack

- **Vanilla JS** — no framework, no TypeScript
- **Vite** — dev server and bundler
- **Tailwind CSS** — via CDN for layout/spacing utilities
- **Custom CSS** — dark fantasy theme in `src/styles/theme.css`

## Commands

```bash
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Project Structure

```
index.html              # markup only — no inline JS or CSS
vite.config.js
.github/workflows/
  deploy.yml            # GitHub Pages deployment on push to master
src/
  main.js               # entry point — imports everything, exposes window.* functions for HTML onclick attrs, runs init
  state.js              # currentCat (active category), getCat(), lbl(), setCurrentCat()
  data/
    categories.js       # exports CATEGORIES (160KB item matrix data) and LABELS (display name map)
  lib/
    matrix.js           # pure functions: buildInverse(), bfsAllPaths(), MAX_PATHS_DISPLAY
    storage.js          # blocked items state — persisted in localStorage via 'bw_blocked' key
    labels.js           # text normalization/tokenization + prefix/suffix form expansion (Polish inflection)
    inventoryParser.js  # parse pasted in-game inventory text into composite items
    craftSearch.js      # inventory-aware composite craft search (BigInt-bitmask AND-OR + linear forward); exports SEARCH_TIMEOUT_MS, combine(), findCraftPath()
  ui/
    selects.js          # populateSelect(), showEl(), rebuildAllSelects()
    blocked.js          # renderBlockedUI() — renders clickable chip UI for blocked path items
    render.js           # renderPairsSection(), renderPathSection(), renderCraftSection()
    drillGraph.js       # SVG path tree for the reverse-tab drill-down ingredient explorer
  tabs/
    reverse.js          # doReverse() — find ingredient pairs that produce a target item; drill-down explorer
    forward.js          # doForward() — combine two items, show result
    path.js             # doPath() — BFS shortest path from item A to item B
    craft.js            # doCraft() — given my item, show all possible results with every partner
    inventory.js        # doInventory() — find craft path to a target type using only items from pasted inventory
  styles/
    theme.css           # all custom CSS: .card, .tab-btn, .step, .result-badge, color scheme
```

## Data Model

All crafting data lives in `src/data/categories.js` as `CATEGORIES`:

```js
CATEGORIES = {
  "glowa": {
    name: "Nakrycia głowy",
    subtypes: ["czapka", "kask", ...],      // item types (10)
    prefixes: ["utwardzony", ...],           // item prefixes (18-19)
    suffixes: ["podroznika", ...],           // item suffixes (18+)
    typeMatrix:   { typeA: { typeB: resultType } },
    prefixMatrix: { prefA: { prefB: resultPrefix } },
    suffixMatrix: { sufA: { sufB: resultSuffix } },
  },
  "zbroja": { ... },
  // 10 categories total: glowa, zbroja, gacie, pierscienie, szyja,
  //                      biala1h, biala2h, dystans, palna1h, palna2h
}
```

Matrices are symmetric lookup tables: `matrix[A][B]` gives the result of combining A with B.
`LABELS` maps internal keys (ASCII) to Polish display strings with diacritics.

## Crafting Rules (Game Mechanics)

**Prefix/suffix only appear in the result if BOTH input items have that component.**
- Item A has prefix only + Item B has prefix and suffix → result has prefix, **no suffix**
- Item A has no prefix + Item B has prefix → result has **no prefix**
- Each component (type, prefix, suffix) is evaluated independently

**How this is implemented throughout the codebase:**
- `__any__` is the sentinel value for "item has no prefix/suffix" (shown as `(brak)` in UI)
- Every tab checks `aPrefix !== '__any__' && bPrefix !== '__any__'` before matrix lookup
- If either item is `__any__`, the result component is `null` and that section is skipped entirely
- The data matrices themselves contain no row/column for "no prefix" — absence is implicit
- This rule is enforced at every level: forward, craft, path, reverse, and BFS

**When adding new features that involve prefix/suffix logic**, always gate matrix lookups with the same `!== '__any__'` double-check on both inputs. Never fall through to the matrix with a missing component.

## Key Patterns

**Window-exposed functions** — HTML uses `onclick="fnName()"` attributes. All callable functions must be assigned to `window.*` in `main.js`. Never use module-scoped functions directly in HTML.

**Live ES module bindings** — `currentCat` is a `let` export from `state.js`. Importing it gives a live binding — always reflects the current value after `setCurrentCat()` is called. No need for a store or event system.

**Adding a new tab:**
1. Create `src/tabs/yourTab.js` — export `doYourTab()`
2. Import and expose in `src/main.js` → `window.doYourTab = doYourTab`
3. Add the tab button and content div in `index.html`
4. Add selects population in `src/ui/selects.js → rebuildAllSelects()`
5. Call `doYourTab()` in `onCatChange()` and init block in `main.js`
6. Add `else if (name === 'yourTab') doYourTab()` in `window.switchTab`

**Adding a new category:**
1. Add the matrix data entry to `CATEGORIES` in `src/data/categories.js`
2. Add the `<option>` to `#catSelect` in `index.html`

## Conventions

- All user-visible Polish strings come from `LABELS` via `lbl(key)` — never hardcode display text
- Internal keys are ASCII (no Polish diacritics) — diacritics only in `LABELS` values
- Results are rendered as HTML strings (template literals) — no virtual DOM
- Blocked items are stored per-category in localStorage key `bw_blocked`
- Inventory tab persists pasted text + parsed items in localStorage key `bw_inventory`
- Long-running inventory searches are bounded by `SEARCH_TIMEOUT_MS` in `src/lib/craftSearch.js` (single source of truth — UI strings derive their "X s" display from it)
- **Legendary rule:** legendary items can only be combined with other legendary items. Inventory-aware features must partition the pool by the legendary flag before searching.
- **Inventory craft search internals** (`src/lib/craftSearch.js`): the AND-OR `solve()` tracks `available`/`consumed` as **BigInt bitmasks** keyed off precomputed `bits[i]` — not Sets or arrays. Forward-search records (`forwardMap`) double as extended base cases in `solve`: any record whose `consumedMask ⊆ availMask` and `depth ≤ K` is reused directly with its own provable steps. Candidate pair lists are memoized per target via a per-search `candidateCache`. The external API still exposes `consumed: number[]` (converted via `maskToIndices` at the boundary). All three (bitmasks, forward base case, candidate cache) are load-bearing for performance — preserve them when modifying.
- **Search must never return fake paths.** Every step in a returned path must be the result of a real `combine()` call, and every consumed inventory index must appear at most once across the whole path. The bitmask `consumedMask = resA.consumedMask | resB.consumedMask` and the `availForB = availMask & ~resA.consumedMask` invariant enforce this — don't bypass them.
- Commit after every major change with a description of what changed
- After every major change, also review and update this CLAUDE.md file so the project structure, conventions, and patterns documented here stay in sync with the codebase
