export function buildInverse(matrix, keys) {
  const inv = {};
  for (const a of keys) {
    for (const b of keys) {
      const r = matrix[a] && matrix[a][b];
      if (!r) continue;
      if (!inv[r]) inv[r] = [];
      if (keys.indexOf(a) <= keys.indexOf(b)) inv[r].push([a, b]);
    }
  }
  return inv;
}

// BFS: find ALL shortest paths (up to MAX_PATHS), respecting blocked items
// Returns array of paths, each path is an array of {from, combineWith, result, alternatives}
export const MAX_PATHS_DISPLAY = 20;   // how many to show in UI
export const MAX_PATHS_DFS = 2000;     // internal DFS cap (allows filter to discard bad paths)

export function bfsAllPaths(matrix, keys, start, target, blocked, maxDepth) {
  blocked = blocked || new Set();
  maxDepth = maxDepth || 99;
  if (start === target) return [[]];
  if (blocked.has(target) || blocked.has(start)) return null;

  const available = keys.filter(k => !blocked.has(k));

  // Phase 1: BFS to find min distance from start to each reachable node
  const dist = new Map([[start, 0]]);
  const bfsQueue = [start];
  while (bfsQueue.length) {
    const cur = bfsQueue.shift();
    for (const partner of available) {
      const result = matrix[cur] && matrix[cur][partner];
      if (!result || blocked.has(result) || dist.has(result)) continue;
      dist.set(result, dist.get(cur) + 1);
      bfsQueue.push(result);
    }
  }

  if (!dist.has(target)) return null;
  if (dist.get(target) > maxDepth) return null;

  // Phase 2: DFS along shortest-path edges to collect all paths
  const allPaths = [];

  function dfs(cur, path) {
    if (allPaths.length >= MAX_PATHS_DFS) return;
    if (cur === target) { allPaths.push([...path]); return; }
    const curDist = dist.get(cur);
    for (const partner of available) {
      const result = matrix[cur] && matrix[cur][partner];
      if (!result || blocked.has(result)) continue;
      if (dist.get(result) !== curDist + 1) continue;
      path.push({ from: cur, combineWith: partner, result });
      dfs(result, path);
      path.pop();
    }
  }

  dfs(start, []);
  if (allPaths.length === 0) return null;

  // Enrich: for each step collect all ingredients that produce the same result,
  // excluding circular ones (ingredient === result — you'd need the target to craft itself)
  const enriched = allPaths.map(path =>
    path.map(step => {
      // Exclude ingredients that equal the target (you'd need the target to craft the target)
      const alts = available.filter(k =>
        matrix[step.from] && matrix[step.from][k] === step.result && k !== target
      );
      return { ...step, alternatives: alts };
    })
  ).filter(path =>
    // Drop paths where any step has no valid ingredient
    path.every(step => step.alternatives.length > 0)
  );

  if (enriched.length === 0) return null;

  // Deduplicate: two paths are the same if they traverse the same sequence of nodes
  const seen = new Set();
  const deduped = enriched.filter(path => {
    const key = path.map(s => s.from + '>' + s.result).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return deduped.slice(0, MAX_PATHS_DISPLAY);
}
