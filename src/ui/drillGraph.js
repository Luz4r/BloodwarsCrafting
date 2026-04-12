import { lbl } from '../state.js';

const NODE_W = 140;
const NODE_H = 36;
const H_GAP = 24;
const V_GAP = 60;
const PAD = 20;

function truncate(str, max = 16) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

// Build a tree by de-duplicating shared path prefixes
function buildTree(targetKey, paths) {
  const root = { key: targetKey, children: [] };
  for (const path of paths) {
    let node = root;
    for (const item of path) {
      let child = node.children.find(c => c.key === item);
      if (!child) {
        child = { key: item, children: [] };
        node.children.push(child);
      }
      node = child;
    }
  }
  return root;
}

function calcLeafCount(node) {
  if (node.children.length === 0) { node.leafCount = 1; return; }
  node.children.forEach(calcLeafCount);
  node.leafCount = node.children.reduce((s, c) => s + c.leafCount, 0);
}

function assignPositions(node, startX, depth) {
  const span = node.leafCount * (NODE_W + H_GAP) - H_GAP;
  node.x = startX + span / 2;
  node.y = PAD + depth * (NODE_H + V_GAP) + NODE_H / 2;
  let cx = startX;
  for (const child of node.children) {
    const childSpan = child.leafCount * (NODE_W + H_GAP) - H_GAP;
    assignPositions(child, cx, depth + 1);
    cx += childSpan + H_GAP;
  }
}

function treeDepth(node) {
  if (!node.children.length) return 0;
  return 1 + Math.max(...node.children.map(treeDepth));
}

function collectAll(node, nodes = [], edges = []) {
  nodes.push(node);
  for (const child of node.children) {
    edges.push({ p: node, c: child });
    collectAll(child, nodes, edges);
  }
  return { nodes, edges };
}

function renderTreeSVG(targetKey, paths) {
  const root = buildTree(targetKey, paths);
  calcLeafCount(root);
  assignPositions(root, PAD, 0);

  const depth = treeDepth(root);
  const svgW = root.leafCount * (NODE_W + H_GAP) - H_GAP + PAD * 2;
  const svgH = (depth + 1) * (NODE_H + V_GAP) - V_GAP + PAD * 2 + NODE_H;

  const { nodes, edges } = collectAll(root);

  let out = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">`;

  // Edges behind nodes
  for (const { p, c } of edges) {
    const x1 = p.x, y1 = p.y + NODE_H / 2;
    const x2 = c.x, y2 = c.y - NODE_H / 2;
    const my = (y1 + y2) / 2;
    out += `<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" class="tg-edge"/>`;
  }

  // Nodes
  for (const n of nodes) {
    const isRoot = n === root;
    const isLeaf = n.children.length === 0;
    const cls = isRoot ? 'tg-node tg-root' : isLeaf ? 'tg-node tg-leaf' : 'tg-node tg-mid';
    const fullLabel = lbl(n.key);
    const displayLabel = truncate(fullLabel);
    out += `<g class="${cls}">
      <rect x="${n.x - NODE_W / 2}" y="${n.y - NODE_H / 2}" width="${NODE_W}" height="${NODE_H}" rx="6"/>
      <text x="${n.x}" y="${n.y + 5}" text-anchor="middle">${displayLabel}</text>
      <title>${fullLabel}</title>
    </g>`;
  }

  out += '</svg>';
  return out;
}

export function renderDrillGraph(prefTarget, prefPaths, sufTarget, sufPaths) {
  const container = document.getElementById('drill-graph');
  const content = document.getElementById('drill-graph-content');
  if (!container || !content) return;

  const hasPref = prefPaths.length > 0;
  const hasSuf = sufPaths.length > 0;

  if (!hasPref && !hasSuf) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  let html = '';

  if (hasPref) {
    html += `<div class="tg-section">
      <div class="attr-label" style="margin-bottom:8px;">Prefiks: ${lbl(prefTarget)}</div>
      <div class="tg-scroll">${renderTreeSVG(prefTarget, prefPaths)}</div>
    </div>`;
  }

  if (hasSuf) {
    if (hasPref) html += '<div style="border-top:1px solid #3a2a10;margin:12px 0;"></div>';
    html += `<div class="tg-section">
      <div class="attr-label" style="margin-bottom:8px;">Sufiks: ${lbl(sufTarget)}</div>
      <div class="tg-scroll">${renderTreeSVG(sufTarget, sufPaths)}</div>
    </div>`;
  }

  content.innerHTML = html;
}
