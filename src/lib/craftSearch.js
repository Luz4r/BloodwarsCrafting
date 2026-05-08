// Inventory-aware composite craft search.
// State: composite item = { type, prefix, suffix }. prefix/suffix may be '__any__'.

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
// ignoring consumption (over-approximation). Returns { set: Map, capped: boolean }.
// Uses frontier-style expansion: each pair is combined only when at least one side is new.
export function buildReachable(inventory, cat) {
  const reachable = new Map(); // key -> composite
  for (const item of inventory) {
    reachable.set(itemKey(item), { type: item.type, prefix: item.prefix, suffix: item.suffix });
  }
  let frontier = [...reachable.values()];
  let iter = 0;
  let capped = false;
  while (frontier.length > 0 && iter < REACH_MAX_ITERS) {
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
  return { set: reachable, capped };
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

function rankCandidates(candidates, inventory, available) {
  // Move pairs where A or B is directly in available inventory to the front.
  const invKeys = new Set();
  for (const idx of available) invKeys.add(itemKey(inventory[idx]));
  return candidates.slice().sort((p, q) => score(q) - score(p));
  function score([A, B]) {
    let s = 0;
    if (invKeys.has(itemKey(A))) s += 2;
    if (invKeys.has(itemKey(B))) s += 2;
    return s;
  }
}

function findInvIndex(target, available, inventory) {
  for (const idx of available) {
    if (sameItem(inventory[idx], target)) return idx;
  }
  return -1;
}

function solve(target, available, K, inventory, cat, ctx) {
  // Base: target is directly in inventory
  const directIdx = findInvIndex(target, available, inventory);
  if (directIdx !== -1) {
    return {
      steps: [],
      consumed: new Set([directIdx]),
      producedBy: { kind: 'inv', invIdx: directIdx },
    };
  }
  if (K <= 0) return null;

  // Memoize "failure with this exact available set" via available-bitmask + targetKey + K.
  // For inventory > 32 the bitmask approach gets expensive; skip cache then.
  const cacheKey = ctx.availSig != null
    ? itemKey(target) + '|' + K + '|' + ctx.availSig(available)
    : null;
  if (cacheKey && ctx.failureCache.has(cacheKey)) return null;

  const candidates = candidatePairsFor(target, cat, ctx.reachable);
  const ranked = rankCandidates(candidates, inventory, available);

  for (const [A, B] of ranked) {
    for (let K1 = 0; K1 <= K - 1; K1++) {
      const K2 = K - 1 - K1;
      const resA = solve(A, available, K1, inventory, cat, ctx);
      if (!resA) continue;
      let availableForB = available;
      if (resA.consumed.size > 0) {
        availableForB = new Set(available);
        for (const idx of resA.consumed) availableForB.delete(idx);
      }
      const resB = solve(B, availableForB, K2, inventory, cat, ctx);
      if (!resB) continue;

      // Concatenate steps with index remapping for resB
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
      const consumed = new Set([...resA.consumed, ...resB.consumed]);
      return {
        steps,
        consumed,
        producedBy: { kind: 'step', stepIdx: steps.length - 1 },
      };
    }
  }

  if (cacheKey) ctx.failureCache.add(cacheKey);
  return null;
}

export function findCraftPath({ cat, inventory, target, maxDepth = 5 }) {
  if (!inventory || inventory.length === 0) return { kind: 'no-inventory' };

  // Fast path: target directly in inventory.
  for (let i = 0; i < inventory.length; i++) {
    if (sameItem(inventory[i], target)) {
      return {
        kind: 'found',
        steps: [],
        consumed: [i],
        producedBy: { kind: 'inv', invIdx: i },
        depth: 0,
      };
    }
  }

  const built = buildReachable(inventory, cat);
  const reachable = built.capped ? null : built.set;
  if (reachable && !reachable.has(itemKey(target))) return { kind: 'unreachable' };

  // Build availSig if inventory size allows bitmask
  let availSig = null;
  if (inventory.length <= 32) {
    availSig = (set) => {
      let m = 0;
      for (const idx of set) m |= (1 << idx);
      return m.toString(36);
    };
  } else if (inventory.length <= 60) {
    availSig = (set) => {
      let lo = 0, hi = 0;
      for (const idx of set) {
        if (idx < 30) lo |= (1 << idx);
        else hi |= (1 << (idx - 30));
      }
      return lo.toString(36) + '#' + hi.toString(36);
    };
  } else {
    availSig = null;
  }

  const ctx = {
    reachable,
    failureCache: new Set(),
    availSig,
  };

  const allAvailable = new Set();
  for (let i = 0; i < inventory.length; i++) allAvailable.add(i);

  for (let K = 0; K <= maxDepth; K++) {
    const res = solve(target, allAvailable, K, inventory, cat, ctx);
    if (res) {
      return {
        kind: 'found',
        steps: res.steps,
        consumed: [...res.consumed],
        producedBy: res.producedBy,
        depth: K,
      };
    }
  }
  return { kind: 'too-deep' };
}
