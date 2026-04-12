import { getCat, lbl } from '../state.js';
import { buildInverse } from '../lib/matrix.js';
import { renderPairsSection } from '../ui/render.js';
import { renderDrillGraph } from '../ui/drillGraph.js';

// Each component has an array of independent paths.
// paths[i] = ['itemA', 'itemB', ...] — chain of selected ingredients for that path.
// Empty array = no drill active, show original target section.
let prefPaths = [];
let sufPaths = [];

function resetPaths() {
  prefPaths = [];
  sufPaths = [];
}

function getPaths(component) { return component === 'pref' ? prefPaths : sufPaths; }
function setPaths(component, p) { if (component === 'pref') prefPaths = p; else sufPaths = p; }

// Extend an existing path with one item, or create a new single-item path (pathIndex === -1)
export function drillExtendPath(component, pathIndex, item) {
  const paths = getPaths(component);
  if (pathIndex === -1) {
    setPaths(component, [[item]]);
  } else {
    const next = paths.map((p, i) => i === pathIndex ? [...p, item] : p);
    setPaths(component, next);
  }
  renderReverseResults();
}

// Split a path (or the initial target section) into two parallel paths
export function drillSplitPath(component, pathIndex, itemA, itemB) {
  const paths = getPaths(component);
  const base = pathIndex === -1 ? [] : paths[pathIndex];
  const pathA = [...base, itemA];
  const pathB = [...base, itemB];
  if (pathIndex === -1) {
    setPaths(component, [pathA, pathB]);
  } else {
    const next = [
      ...paths.slice(0, pathIndex),
      pathA,
      pathB,
      ...paths.slice(pathIndex + 1),
    ];
    setPaths(component, next);
  }
  renderReverseResults();
}

// Navigate back: depth === -1 resets ALL paths for this component; depth >= 0 truncates path at pathIndex
export function drillPathBack(component, pathIndex, depth) {
  if (depth === -1) {
    setPaths(component, []);
  } else {
    const paths = getPaths(component);
    const next = paths.map((p, i) => i === pathIndex ? p.slice(0, depth + 1) : p);
    setPaths(component, next);
  }
  renderReverseResults();
}

// Excluded set for a path's leaf: target + all ancestors (everything except the leaf itself)
function buildExcluded(target, path) {
  const excluded = new Set([target]);
  for (let i = 0; i < path.length - 1; i++) excluded.add(path[i]);
  return excluded;
}

function renderPathBreadcrumb(component, targetLabel, path, pathIndex) {
  let h = '<div class="drill-breadcrumb">';
  // Target always resets all paths
  h += `<span class="drill-crumb drill-crumb-ancestor" onclick="drillPathBack('${component}',${pathIndex},-1)">${targetLabel}</span>`;
  for (let i = 0; i < path.length; i++) {
    h += `<span class="drill-crumb-sep"> → </span>`;
    if (i < path.length - 1) {
      h += `<span class="drill-crumb drill-crumb-ancestor" onclick="drillPathBack('${component}',${pathIndex},${i})">${lbl(path[i])}</span>`;
    } else {
      h += `<span class="drill-crumb drill-crumb-current">${lbl(path[i])}</span>`;
    }
  }
  h += '</div>';
  return h;
}

function renderAttrWithDrill(baseLabel, target, inv, paths, component) {
  let h = '';

  if (paths.length === 0) {
    // No drill active — show original target pairs
    const targetPairs = inv[target] || [];
    h += renderPairsSection(baseLabel, targetPairs, component, {
      clickable: true,
      pathIndex: -1,
    });
  } else {
    // One section per path — each shows the leaf item's pairs
    for (let pi = 0; pi < paths.length; pi++) {
      const path = paths[pi];
      const leaf = path[path.length - 1];
      const excluded = buildExcluded(target, path);

      h += renderPathBreadcrumb(component, lbl(target), path, pi);

      const rawPairs = inv[leaf] || [];
      const filteredPairs = rawPairs.filter(([a, b]) => !excluded.has(a) && !excluded.has(b));
      const leafLabel = (component === 'pref' ? 'Prefiks: ' : 'Sufiks: ') + lbl(leaf);
      h += renderPairsSection(leafLabel, filteredPairs, component, {
        clickable: true,
        pathIndex: pi,
        isDrillSection: true,
      });
    }
  }

  return `<div class="drill-attr-block">${h}</div>`;
}

function renderReverseResults() {
  const cat = getCat();
  const targetType = document.getElementById('rev-type').value;
  const targetPrefix = cat.prefixes ? document.getElementById('rev-prefix').value : '__any__';
  const targetSuffix = cat.suffixes ? document.getElementById('rev-suffix').value : '__any__';

  let html = '';

  // Type section — non-drillable
  {
    const inv = buildInverse(cat.typeMatrix, cat.subtypes);
    const pairs = inv[targetType] || [];
    html += renderPairsSection('Typ: ' + lbl(targetType), pairs, 'typ', { clickable: false });
  }

  // Prefix section with drill
  if (cat.prefixes && targetPrefix !== '__any__') {
    const inv = buildInverse(cat.prefixMatrix, cat.prefixes);
    html += renderAttrWithDrill('Prefiks: ' + lbl(targetPrefix), targetPrefix, inv, prefPaths, 'pref');
  } else {
    prefPaths = [];
  }

  // Suffix section with drill
  if (cat.suffixes && targetSuffix !== '__any__') {
    const inv = buildInverse(cat.suffixMatrix, cat.suffixes);
    html += renderAttrWithDrill('Sufiks: ' + lbl(targetSuffix), targetSuffix, inv, sufPaths, 'suf');
  } else {
    sufPaths = [];
  }

  document.getElementById('rev-results').innerHTML = html || '<p style="color:#888">Brak wyników.</p>';

  renderDrillGraph(targetPrefix, prefPaths, targetSuffix, sufPaths);
}

export function doReverse() {
  resetPaths();
  renderReverseResults();
}

export function refreshReverse() {
  renderReverseResults();
}
