// Inventory-aware composite craft search.
// State: composite item = { type, prefix, suffix }. prefix/suffix may be '__any__'.

// Single source of truth for the search time budget. UI strings derive their
// "X s" display from this constant — change this value to change everything.
export const SEARCH_TIMEOUT_MS = 10000;

const REACH_MAX_ITERS = 12;
const REACH_MAX_SET = 8000;

export function itemKey(item) {
  return item.type + '|' + item.prefix + '|' + item.suffix;
}

export function sameItem(a, b) {
  return a.type === b.type && a.prefix === b.prefix && a.suffix === b.suffix;
}

export function combine(A, B, cat) {
  const tm = cat.typeMatrix;
  const t = tm[A.type] && tm[A.type][B.type];
  if (!t) return null;

  let p = '__any__';
  if (cat.prefixes) {
    if (A.prefix === '__any__' || B.prefix === '__any__') {
      p = '__any__';
    } else {
      const r = cat.prefixMatrix[A.prefix] && cat.prefixMatrix[A.prefix][B.prefix];
      if (!r) return null;
      p = r;
    }
  }

  let s = '__any__';
  if (cat.suffixes) {
    if (A.suffix === '__any__' || B.suffix === '__any__') {
      s = '__any__';
    } else {
      const r = cat.suffixMatrix[A.suffix] && cat.suffixMatrix[A.suffix][B.suffix];
      if (!r) return null;
      s = r;
    }
  }

  return { type: t, prefix: p, suffix: s };
}

// Build the closure of all composites producible from inventory by repeated combination,
// ignoring consumption (over-approximation). Returns { set, capped, timedOut }.
// Uses frontier-style expansion: each pair is combined only when at least one side is new.
export function buildReachable(inventory, cat, deadline = Infinity) {
  const reachable = new Map(); // key -> composite
  for (const item of inventory) {
    reachable.set(itemKey(item), { type: item.type, prefix: item.prefix, suffix: item.suffix });
  }
  let frontier = [...reachable.values()];
  let iter = 0;
  let capped = false;
  let timedOut = false;
  while (frontier.length > 0 && iter < REACH_MAX_ITERS) {
    if (Date.now() > deadline) { timedOut = true; break; }
    const allItems = [...reachable.values()];
    const newItems = [];
    outer: for (const a of frontier) {
      for (const b of allItems) {
        const r = combine(a, b, cat);
        if (!r) continue;
        const k = itemKey(r);
        if (!reachable.has(k)) {
          reachable.set(k, r);
          newItems.push(r);
          if (reachable.size >= REACH_MAX_SET) {
            capped = true;
            break outer;
          }
        }
      }
    }
    if (capped) break;
    frontier = newItems;
    iter++;
  }
  return { set: reachable, capped, timedOut };
}

// Precompute single-bit BigInts for each inventory index.
function buildBits(n) {
  const bits = new Array(n);
  let b = 1n;
  for (let i = 0; i < n; i++) { bits[i] = b; b <<= 1n; }
  return bits;
}

function maskToIndices(mask, bits) {
  const out = [];
  for (let i = 0; i < bits.length; i++) {
    if ((mask & bits[i]) !== 0n) out.push(i);
  }
  return out;
}

// Forward search: enumerate items reachable by linear combination from inventory
// (each step takes the previous result and combines it with one fresh inventory
// item). Tracks consumption — each result has a real, provable path. Returns
// Map<itemKey, record> where record = { item, depth, steps, consumed, consumedMask, producedBy }.
//
// Linear-only: misses non-linear paths like (A+B)+(C+D), but those start at
// depth 3 and are dwarfed by linear coverage. Polynomial in inventory size,
// so it's fast even when the AND-OR search would explode.
function forwardSearchLinear(inventory, cat, maxDepth, deadline, bits) {
  const best = new Map();
  for (let i = 0; i < inventory.length; i++) {
    const it = inventory[i];
    const k = itemKey(it);
    if (best.has(k)) continue;
    best.set(k, {
      item: { type: it.type, prefix: it.prefix, suffix: it.suffix },
      depth: 0,
      steps: [],
      consumed: [i],
      consumedMask: bits[i],
      producedBy: { kind: 'inv', invIdx: i },
    });
  }
  let frontier = [...best.values()];
  for (let d = 1; d <= maxDepth; d++) {
    if (Date.now() > deadline) break;
    const newFrontier = [];
    for (const r of frontier) {
      if (Date.now() > deadline) break;
      for (let j = 0; j < inventory.length; j++) {
        if ((r.consumedMask & bits[j]) !== 0n) continue;
        const inv = inventory[j];
        const combined = combine(r.item, inv, cat);
        if (!combined) continue;
        const k = itemKey(combined);
        const existing = best.get(k);
        if (existing && existing.depth <= d) continue;
        const aSource = r.depth === 0
          ? r.producedBy
          : { kind: 'step', stepIdx: r.steps.length - 1 };
        const newStep = {
          a: r.item,
          b: { type: inv.type, prefix: inv.prefix, suffix: inv.suffix },
          result: combined,
          aSource,
          bSource: { kind: 'inv', invIdx: j },
        };
        const rec = {
          item: combined,
          depth: d,
          steps: [...r.steps, newStep],
          consumed: [...r.consumed, j],
          consumedMask: r.consumedMask | bits[j],
          producedBy: { kind: 'step', stepIdx: r.steps.length },
        };
        best.set(k, rec);
        newFrontier.push(rec);
      }
    }
    frontier = newFrontier;
  }
  return best;
}

// Bucket forward-search records into "near-matches" relative to the target.
// Each record carries its own real path, so the UI can render results instantly
// on click without re-running the slow AND-OR search.
function collectNearMatches(forwardMap, target) {
  if (!forwardMap) return null;
  const targetKey = itemKey(target);
  const both = [];
  const prefixOnly = [];
  const suffixOnly = [];
  for (const r of forwardMap.values()) {
    if (itemKey(r.item) === targetKey) continue;
    const pMatch = r.item.prefix === target.prefix;
    const sMatch = r.item.suffix === target.suffix;
    if (pMatch && sMatch) both.push(r);
    else if (pMatch) prefixOnly.push(r);
    else if (sMatch) suffixOnly.push(r);
  }
  const byDepthThenKey = (a, b) =>
    a.depth - b.depth || itemKey(a.item).localeCompare(itemKey(b.item));
  both.sort(byDepthThenKey);
  prefixOnly.sort(byDepthThenKey);
  suffixOnly.sort(byDepthThenKey);
  const CAP = 24;
  return {
    both: both.slice(0, CAP),
    prefixOnly: prefixOnly.slice(0, CAP),
    suffixOnly: suffixOnly.slice(0, CAP),
    bothTotal: both.length,
    prefixOnlyTotal: prefixOnly.length,
    suffixOnlyTotal: suffixOnly.length,
  };
}

// Pick the shallowest forward-search record matching the target. For non-anyType,
// that's an exact key lookup. For anyType, scan for any item whose prefix/suffix
// match — type is free.
function pickForwardWin(forwardMap, target, anyType) {
  if (!anyType) {
    return forwardMap.get(itemKey(target)) || null;
  }
  let best = null;
  for (const r of forwardMap.values()) {
    if (r.item.prefix === target.prefix && r.item.suffix === target.suffix) {
      if (!best || r.depth < best.depth) best = r;
    }
  }
  return best;
}

function pairsForType(targetType, cat) {
  const out = [];
  const subs = cat.subtypes;
  for (const a of subs) {
    const row = cat.typeMatrix[a];
    if (!row) continue;
    for (const b of subs) {
      if (row[b] === targetType) out.push([a, b]);
    }
  }
  return out;
}

function pairsForComponent(targetVal, keys, matrix, hasComponent) {
  // Returns array of [a, b] pairs (where a,b ∈ keys ∪ '__any__') such that combining yields targetVal.
  if (!hasComponent) {
    // Category lacks this component — only ('__any__','__any__') is possible.
    return [['__any__', '__any__']];
  }
  if (targetVal === '__any__') {
    // Result lacks component iff at least one input lacks it.
    const out = [['__any__', '__any__']];
    for (const k of keys) {
      out.push([k, '__any__']);
      out.push(['__any__', k]);
    }
    return out;
  }
  // Real value — both inputs must be real keys.
  const out = [];
  for (const a of keys) {
    const row = matrix[a];
    if (!row) continue;
    for (const b of keys) {
      if (row[b] === targetVal) out.push([a, b]);
    }
  }
  return out;
}

function candidatePairsFor(target, cat, reachable) {
  const tPairs = pairsForType(target.type, cat);
  const pPairs = pairsForComponent(target.prefix, cat.prefixes || [], cat.prefixMatrix || {}, !!cat.prefixes);
  const sPairs = pairsForComponent(target.suffix, cat.suffixes || [], cat.suffixMatrix || {}, !!cat.suffixes);

  const out = [];
  const seen = new Set();
  for (const [ta, tb] of tPairs) {
    for (const [pa, pb] of pPairs) {
      for (const [sa, sb] of sPairs) {
        const A = { type: ta, prefix: pa, suffix: sa };
        const B = { type: tb, prefix: pb, suffix: sb };
        const ka = itemKey(A);
        const kb = itemKey(B);
        // Reachable=null means closure was capped; skip filtering.
        if (reachable && (!reachable.has(ka) || !reachable.has(kb))) continue;
        // Canonical ordering for unordered pairs
        const canon = ka <= kb ? ka + '#' + kb : kb + '#' + ka;
        if (seen.has(canon)) continue;
        seen.add(canon);
        out.push([A, B]);
      }
    }
  }
  return out;
}

// Pre-rank candidates with a fixed inventory-key heuristic — doesn't depend on
// which indices are still available, so we can compute it once per target and
// reuse across every recursive call. Soft heuristic: pairs whose A or B sit in
// inventory are tried first.
function rankCandidatesGlobal(candidates, invKeySet) {
  return candidates.slice().sort((p, q) => score(q) - score(p));
  function score([A, B]) {
    let s = 0;
    if (invKeySet.has(itemKey(A))) s += 2;
    if (invKeySet.has(itemKey(B))) s += 2;
    return s;
  }
}

function findInvIndex(target, availMask, ctx) {
  const indices = ctx.itemToIndices.get(itemKey(target));
  if (!indices) return -1;
  for (const idx of indices) {
    if ((availMask & ctx.bits[idx]) !== 0n) return idx;
  }
  return -1;
}

function solve(target, availMask, K, inventory, cat, ctx) {
  if (ctx.timedOut) return null;
  if (Date.now() > ctx.deadline) { ctx.timedOut = true; return null; }

  // Base case 1: target is directly available in inventory.
  const directIdx = findInvIndex(target, availMask, ctx);
  if (directIdx !== -1) {
    return {
      steps: [],
      consumedMask: ctx.bits[directIdx],
      producedBy: { kind: 'inv', invIdx: directIdx },
    };
  }

  // Base case 2: a precomputed forward-search path exists for this target,
  // fits the remaining depth budget, and consumes only currently-available
  // indices. The forward record was built with full consumption tracking, so
  // reusing it is provably correct — no fake paths.
  const fwd = ctx.forwardMap.get(itemKey(target));
  if (fwd && fwd.depth <= K && (fwd.consumedMask & ~availMask) === 0n) {
    return {
      steps: fwd.steps.slice(),
      consumedMask: fwd.consumedMask,
      producedBy: fwd.producedBy,
    };
  }

  if (K <= 0) return null;

  // Failure cache keyed by target + remaining budget + available mask.
  const cacheKey = itemKey(target) + '|' + K + '|' + availMask.toString(36);
  if (ctx.failureCache.has(cacheKey)) return null;

  // Memoized, pre-ranked candidate pair list for this target.
  const ranked = ctx.candidatesFor(target);

  for (const [A, B] of ranked) {
    if (ctx.timedOut) return null;
    for (let K1 = 0; K1 <= K - 1; K1++) {
      const K2 = K - 1 - K1;
      const resA = solve(A, availMask, K1, inventory, cat, ctx);
      if (ctx.timedOut) return null;
      if (!resA) continue;
      const availForB = availMask & ~resA.consumedMask;
      const resB = solve(B, availForB, K2, inventory, cat, ctx);
      if (ctx.timedOut) return null;
      if (!resB) continue;

      // Concatenate steps with index remapping for resB.
      const offset = resA.steps.length;
      const remappedB = resB.steps.map(step => ({
        ...step,
        aSource: step.aSource.kind === 'step'
          ? { kind: 'step', stepIdx: step.aSource.stepIdx + offset }
          : step.aSource,
        bSource: step.bSource.kind === 'step'
          ? { kind: 'step', stepIdx: step.bSource.stepIdx + offset }
          : step.bSource,
      }));
      const aSource = resA.producedBy.kind === 'step'
        ? { kind: 'step', stepIdx: resA.producedBy.stepIdx }
        : resA.producedBy;
      const bSource = resB.producedBy.kind === 'step'
        ? { kind: 'step', stepIdx: resB.producedBy.stepIdx + offset }
        : resB.producedBy;
      const newStep = { a: A, b: B, result: target, aSource, bSource };
      const steps = [...resA.steps, ...remappedB, newStep];
      const consumedMask = resA.consumedMask | resB.consumedMask;
      return {
        steps,
        consumedMask,
        producedBy: { kind: 'step', stepIdx: steps.length - 1 },
      };
    }
  }

  ctx.failureCache.add(cacheKey);
  return null;
}

// When anyType is true, target.type is ignored and any reachable item whose prefix/suffix
// match the chosen ones counts as a valid result. The shortest such path wins.
export async function findCraftPath({ cat, inventory, target, maxDepth = 5, timeoutMs = SEARCH_TIMEOUT_MS, anyType = false }) {
  if (!inventory || inventory.length === 0) return { kind: 'no-inventory' };

  const matches = (item) => anyType
    ? item.prefix === target.prefix && item.suffix === target.suffix
    : sameItem(item, target);

  // Fast path: a matching item is directly in inventory.
  for (let i = 0; i < inventory.length; i++) {
    if (matches(inventory[i])) {
      return {
        kind: 'found',
        steps: [],
        consumed: [i],
        producedBy: { kind: 'inv', invIdx: i },
        depth: 0,
        target: { type: inventory[i].type, prefix: target.prefix, suffix: target.suffix },
      };
    }
  }

  const deadline = Date.now() + timeoutMs;
  const bits = buildBits(inventory.length);

  // Yield one tick so the caller's "Searching..." UI can paint before the heavy work starts.
  await new Promise(r => setTimeout(r, 0));

  // Phase 1: linear forward search. Polynomial in inventory size, finishes fast.
  // Three roles: (a) short-circuit return when the target is already producible —
  // catches cases where the AND-OR search would otherwise exhaust its budget;
  // (b) source for near-match suggestions on failure — every record carries its
  // own provable path, so the click handler can render without re-searching;
  // (c) extra base case for the AND-OR solve — any subgoal whose forward record
  // fits the remaining budget and consumed-set constraints resolves instantly.
  const forwardBudget = Math.min(2500, Math.max(500, Math.floor((deadline - Date.now()) / 4)));
  const forwardDeadline = Math.min(deadline, Date.now() + forwardBudget);
  const forwardMap = forwardSearchLinear(inventory, cat, 3, forwardDeadline, bits);

  const quick = pickForwardWin(forwardMap, target, anyType);
  if (quick) {
    return {
      kind: 'found',
      steps: quick.steps,
      consumed: quick.consumed.slice(),
      producedBy: quick.producedBy,
      depth: quick.depth,
      target: quick.item,
    };
  }

  // Yield once more before the heavy AND-OR search.
  await new Promise(r => setTimeout(r, 0));

  const built = buildReachable(inventory, cat, deadline);
  if (built.timedOut) {
    return { kind: 'timeout', nearMatches: collectNearMatches(forwardMap, target) };
  }
  const reachable = built.capped ? null : built.set;

  // Build the concrete list of targets to try (one for non-anyType, many for anyType).
  let targets;
  if (anyType) {
    if (reachable) {
      const seen = new Set();
      targets = [];
      for (const item of reachable.values()) {
        if (item.prefix === target.prefix && item.suffix === target.suffix && !seen.has(item.type)) {
          seen.add(item.type);
          targets.push({ type: item.type, prefix: target.prefix, suffix: target.suffix });
        }
      }
      if (targets.length === 0) return { kind: 'unreachable', nearMatches: collectNearMatches(forwardMap, target) };
    } else {
      // Reachability was capped — fall back to all subtypes.
      targets = cat.subtypes.map(t => ({ type: t, prefix: target.prefix, suffix: target.suffix }));
    }
  } else {
    if (reachable && !reachable.has(itemKey(target))) {
      return { kind: 'unreachable', nearMatches: collectNearMatches(forwardMap, target) };
    }
    targets = [target];
  }

  // Inventory-key set for ranking + index map for direct lookups.
  const invKeySet = new Set();
  const itemToIndices = new Map();
  for (let i = 0; i < inventory.length; i++) {
    const k = itemKey(inventory[i]);
    invKeySet.add(k);
    let arr = itemToIndices.get(k);
    if (!arr) { arr = []; itemToIndices.set(k, arr); }
    arr.push(i);
  }

  // Per-search candidate cache: target key -> ranked pair list. The pair list
  // depends only on target + reachable (both fixed across the search), so we
  // can reuse it for every recursive call requesting the same target.
  const candidateCache = new Map();
  function candidatesFor(t) {
    const key = itemKey(t);
    let cached = candidateCache.get(key);
    if (cached) return cached;
    cached = rankCandidatesGlobal(candidatePairsFor(t, cat, reachable), invKeySet);
    candidateCache.set(key, cached);
    return cached;
  }

  const ctx = {
    reachable,
    forwardMap,
    bits,
    itemToIndices,
    candidatesFor,
    failureCache: new Set(),
    deadline,
    timedOut: false,
  };

  // Initial available mask: every inventory bit set.
  let allAvailableMask = 0n;
  for (let i = 0; i < inventory.length; i++) allAvailableMask |= bits[i];

  for (let K = 0; K <= maxDepth; K++) {
    if (Date.now() > deadline) return { kind: 'timeout', nearMatches: collectNearMatches(forwardMap, target) };
    for (const t of targets) {
      if (ctx.timedOut || Date.now() > deadline) {
        return { kind: 'timeout', nearMatches: collectNearMatches(forwardMap, target) };
      }
      const res = solve(t, allAvailableMask, K, inventory, cat, ctx);
      if (ctx.timedOut) return { kind: 'timeout', nearMatches: collectNearMatches(forwardMap, target) };
      if (res) {
        return {
          kind: 'found',
          steps: res.steps,
          consumed: maskToIndices(res.consumedMask, bits),
          producedBy: res.producedBy,
          depth: K,
          target: t,
        };
      }
    }
    // Yield between depth iterations so the page stays at least minimally responsive.
    await new Promise(r => setTimeout(r, 0));
  }
  return { kind: 'too-deep', nearMatches: collectNearMatches(forwardMap, target) };
}
