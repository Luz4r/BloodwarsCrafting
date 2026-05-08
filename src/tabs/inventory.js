import { getCat, lbl, currentCat } from '../state.js';
import { parseInventory, itemDisplayName } from '../lib/inventoryParser.js';
import { findCraftPath } from '../lib/craftSearch.js';

const STORAGE_KEY = 'bw_inventory';

let parsedItems = [];

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { text: '', items: [] };
    const parsed = JSON.parse(raw);
    return {
      text: parsed.text || '',
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { text: '', items: [] };
  }
}

function saveStored(text, items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, items }));
  } catch {}
}

function renderItemBadge(item) {
  const parts = [];
  parts.push(`<span class="result-badge" style="font-size:0.85em;">${lbl(item.type)}</span>`);
  if (item.prefix && item.prefix !== '__any__') {
    parts.push(`<span class="result-badge" style="font-size:0.85em;background:#1a2a08;border-color:#7a9a4a;color:#c8e87e;">${lbl(item.prefix)}</span>`);
  }
  if (item.suffix && item.suffix !== '__any__') {
    parts.push(`<span class="result-badge" style="font-size:0.85em;background:#0a1a2a;border-color:#4a7a9a;color:#7ec8e3;">${lbl(item.suffix)}</span>`);
  }
  return parts.join(' ');
}

function renderParsedSummary(items) {
  if (items.length === 0) return '<span style="color:#888;">Brak rozpoznanych przedmiotów.</span>';
  const byCat = {};
  for (const it of items) {
    if (!byCat[it.cat]) byCat[it.cat] = [];
    byCat[it.cat].push(it);
  }
  let html = `<details style="margin-top:6px;"><summary style="cursor:pointer;color:#a07030;font-size:0.85em;">Pokaż rozpoznane (${items.length})</summary>`;
  html += '<div style="margin-top:8px;">';
  for (const cat of Object.keys(byCat)) {
    html += `<div style="margin-bottom:8px;"><span class="attr-label" style="display:inline-block;margin-right:8px;">${cat}</span><span style="color:#888;font-size:0.82em;">(${byCat[cat].length})</span><div style="margin-top:4px;">`;
    for (const item of byCat[cat]) {
      html += `<div style="margin:2px 0;font-size:0.85em;color:#a07030;" title="${(item.raw || '').replace(/"/g, '&quot;')}">${itemDisplayName(item)}</div>`;
    }
    html += '</div></div>';
  }
  html += '</div></details>';
  return html;
}

function renderSourceLabel(source, steps) {
  if (source.kind === 'inv') {
    return `<span style="color:#7ec87e;font-size:0.78em;">(z zbrojowni)</span>`;
  }
  return `<span style="color:#c9952a;font-size:0.78em;">(wynik kroku ${source.stepIdx + 1})</span>`;
}

function renderResult(result, target, inventoryForCat) {
  if (result.kind === 'no-inventory') {
    return `<p style="color:#888;">Brak przedmiotów z tej kategorii w zbrojowni.</p>`;
  }
  if (result.kind === 'unreachable') {
    return `<div class="no-path">Z aktualnej zbrojowni nie da się wytworzyć tego przedmiotu — brakuje surowców do osiągnięcia tego celu.</div>`;
  }
  if (result.kind === 'too-deep') {
    return `<div class="no-path">Nie znaleziono ścieżki w limicie kroków. Zwiększ limit lub uzupełnij surowce.</div>`;
  }

  const { steps, consumed, depth } = result;
  let html = '';
  if (depth === 0) {
    html += `<div class="card" style="border-color:#4a7a4a;background:#0f1f0f;margin-bottom:12px;">
      <div class="attr-label" style="color:#7ec87e;">Cel już istnieje w zbrojowni</div>
      <div style="margin-top:6px;">${renderItemBadge(target)}</div>
    </div>`;
    return html;
  }

  html += `<div class="card" style="border-color:#c9952a;margin-bottom:12px;">
    <div class="attr-label">Znaleziono ścieżkę: ${steps.length} krok(ów), ${consumed.length} zużytych przedmiotów</div>
    <div style="margin-top:6px;">Cel: ${renderItemBadge(target)}</div>
  </div>`;

  // Consumed inventory list
  html += `<div class="attr-section"><div class="attr-label">Zużywane przedmioty</div><div>`;
  for (const idx of consumed) {
    const it = inventoryForCat[idx];
    const tip = (it.raw || '').replace(/"/g, '&quot;');
    html += `<div style="margin:2px 0;font-size:0.88em;color:#a07030;" title="${tip}">• ${itemDisplayName(it)}</div>`;
  }
  html += `</div></div>`;

  // Steps
  html += `<div class="attr-section"><div class="attr-label">Kroki łączenia</div>`;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    html += `<div class="step">
      <div style="color:#888;margin-bottom:4px;">Krok ${i + 1}</div>
      <div style="margin-bottom:4px;">
        <span class="from">${renderItemBadge(step.a)}</span>
        ${renderSourceLabel(step.aSource, steps)}
      </div>
      <div style="margin-bottom:4px;">
        <span class="arrow">+</span>
        <span class="partner">${renderItemBadge(step.b)}</span>
        ${renderSourceLabel(step.bSource, steps)}
      </div>
      <div>
        <span class="arrow">→</span>
        <span class="result">${renderItemBadge(step.result)}</span>
      </div>
    </div>`;
  }
  html += `</div>`;
  return html;
}

function refreshDom() {
  const cat = getCat();
  const hasPref = !!(cat.prefixes && cat.prefixes.length);
  const hasSuff = !!(cat.suffixes && cat.suffixes.length);
  const prefWrap = document.getElementById('inv-target-prefix-wrap');
  const suffWrap = document.getElementById('inv-target-suffix-wrap');
  if (prefWrap) prefWrap.style.display = hasPref ? '' : 'none';
  if (suffWrap) suffWrap.style.display = hasSuff ? '' : 'none';

  // Status
  const statusEl = document.getElementById('inv-status');
  const detailEl = document.getElementById('inv-detail');
  if (statusEl) {
    if (parsedItems.length === 0) {
      statusEl.innerHTML = '<span style="color:#888;">Wklej tekst z gry i naciśnij Wczytaj.</span>';
    } else {
      const inCat = parsedItems.filter(it => it.cat === currentCat).length;
      statusEl.innerHTML = `<span style="color:#7ec87e;">Rozpoznano ${parsedItems.length} przedmiot(ów)</span> <span style="color:#888;">— w aktualnej kategorii (${cat.name}): ${inCat}</span>`;
    }
  }
  if (detailEl) {
    detailEl.innerHTML = parsedItems.length ? renderParsedSummary(parsedItems) : '';
  }
}

export function doInventory() {
  refreshDom();
  // Clear result on changes — only show after explicit Find
  const resultEl = document.getElementById('inv-result');
  if (resultEl && !resultEl.dataset.fresh) {
    resultEl.innerHTML = '';
  }
  resultEl && (resultEl.dataset.fresh = '');
}

export function loadInventoryFromText(rawText) {
  const { items } = parseInventory(rawText);
  parsedItems = items;
  saveStored(rawText, items);
  refreshDom();
}

export function clearInventory() {
  parsedItems = [];
  saveStored('', []);
  const ta = document.getElementById('inv-paste');
  if (ta) ta.value = '';
  const resultEl = document.getElementById('inv-result');
  if (resultEl) resultEl.innerHTML = '';
  refreshDom();
}

export function findInventoryPath() {
  const cat = getCat();
  const hasPref = !!(cat.prefixes && cat.prefixes.length);
  const hasSuff = !!(cat.suffixes && cat.suffixes.length);

  const target = {
    type: document.getElementById('inv-target-type').value,
    prefix: hasPref ? document.getElementById('inv-target-prefix').value : '__any__',
    suffix: hasSuff ? document.getElementById('inv-target-suffix').value : '__any__',
  };

  const inventoryForCat = parsedItems
    .filter(it => it.cat === currentCat)
    .map(it => ({ type: it.type, prefix: it.prefix, suffix: it.suffix, raw: it.raw }));

  const maxDepthEl = document.getElementById('inv-max-depth');
  const maxDepth = Math.max(1, Math.min(8, parseInt(maxDepthEl && maxDepthEl.value) || 5));

  const result = findCraftPath({ cat, inventory: inventoryForCat, target, maxDepth });
  const resultEl = document.getElementById('inv-result');
  if (resultEl) {
    resultEl.innerHTML = renderResult(result, target, inventoryForCat);
    resultEl.dataset.fresh = '1';
  }
}

export function initInventory() {
  const stored = loadStored();
  if (Array.isArray(stored.items) && stored.items.length) {
    parsedItems = stored.items;
  }
  const ta = document.getElementById('inv-paste');
  if (ta && stored.text) ta.value = stored.text;
  refreshDom();
}
