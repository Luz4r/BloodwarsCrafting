import { lbl } from '../state.js';
import { MAX_PATHS_DISPLAY } from '../lib/matrix.js';

export function renderPairsSection(title, pairs, kind, opts = {}) {
  const { clickable = false, pathIndex = -1, isDrillSection = false } = opts;
  const canDrill = clickable && (kind === 'pref' || kind === 'suf');

  let h = `<div class="attr-section${isDrillSection ? ' drill-sub-section' : ''}"><div class="attr-label">${title}</div>`;
  if (pairs.length === 0) {
    h += '<p style="color:#888;font-size:0.9em;">Brak kombinacji.</p></div>';
    return h;
  }
  const shown = pairs.slice(0, 50);
  h += `<div class="pairs-count">${pairs.length} kombinacja(i)${pairs.length > 50 ? ' — pokazano pierwsze 50' : ''}</div>`;
  h += '<table><thead><tr><th>Składnik A</th><th>+</th><th>Składnik B</th></tr></thead><tbody>';
  for (const [a, b] of shown) {
    if (canDrill) {
      h += `<tr>
        <td><span class="drill-chip" onclick="showDrillPopover(event,'${kind}',${pathIndex},'${a}','${b}')">${lbl(a)}</span></td>
        <td style="color:#c9952a;text-align:center">+</td>
        <td><span class="drill-chip" onclick="showDrillPopover(event,'${kind}',${pathIndex},'${a}','${b}')">${lbl(b)}</span></td>
      </tr>`;
    } else {
      h += `<tr><td>${lbl(a)}</td><td style="color:#c9952a;text-align:center">+</td><td>${lbl(b)}</td></tr>`;
    }
  }
  h += '</tbody></table></div>';
  return h;
}

export function renderPathSection(attrName, start, target, paths) {
  let h = `<div class="attr-section"><div class="attr-label">${attrName}: ${lbl(start)} → ${lbl(target)}</div>`;
  if (start === target) {
    h += `<div class="same-val">Już osiągnięty — to ten sam atrybut.</div>`;
  } else if (!paths || paths.length === 0) {
    h += `<div class="no-path">Brak ścieżki — nie można osiągnąć ${lbl(target)} od ${lbl(start)} przy aktualnych ustawieniach (sprawdź blokady lub zwiększ limit kroków).</div>`;
  } else {
    const plural = paths.length > 1 ? ` (${paths.length}${paths.length >= MAX_PATHS_DISPLAY ? '+' : ''} ścieżek)` : '';
    h += `<div style="color:#7a9a7a;font-size:0.82em;margin-bottom:8px;">Minimalna liczba kroków: ${paths[0].length}${plural}</div>`;
    paths.forEach((path, pi) => {
      if (paths.length > 1) {
        h += `<div style="color:#c9952a;font-size:0.85em;margin-top:10px;margin-bottom:4px;">— Ścieżka ${pi+1} —</div>`;
      }
      if (path.length === 0) {
        h += `<div class="same-val">Już osiągnięty.</div>`;
      } else {
        for (let i = 0; i < path.length; i++) {
          const step = path[i];
          const alts = step.alternatives || [step.combineWith];
          const altsHtml = alts.map(a => `<strong>${lbl(a)}</strong>`).join(' <span style="color:#888">lub</span> ');
          h += `<div class="step">
            <span style="color:#888">Krok ${i+1}:</span>
            <span class="from">${lbl(step.from)}</span>
            <span class="arrow">+</span>
            <span class="partner">[${altsHtml}]</span>
            <span class="arrow">→</span>
            <span class="result">${lbl(step.result)}</span>
          </div>`;
        }
      }
    });
  }
  h += '</div>';
  return h;
}

export function renderCraftSection(title, byResult) {
  let h = `<div class="attr-section"><div class="attr-label">${title}</div>`;
  const results = Object.keys(byResult);
  if (results.length === 0) {
    h += '<p style="color:#888;font-size:0.9em;">Brak kombinacji.</p></div>';
    return h;
  }
  h += '<table><thead><tr><th>Wynik</th><th>Połącz z (partner)</th></tr></thead><tbody>';
  for (const result of results) {
    const partners = byResult[result];
    h += `<tr><td><span class="result-badge">${lbl(result)}</span></td><td>${partners.map(p => lbl(p)).join(', ')}</td></tr>`;
  }
  h += '</tbody></table></div>';
  return h;
}
