import './styles/theme.css';
import { setCurrentCat, currentCat, lbl } from './state.js';
import { rebuildAllSelects } from './ui/selects.js';
import { renderBlockedUI } from './ui/blocked.js';
import { toggleBlocked, clearBlocked } from './lib/storage.js';
import { doReverse, refreshReverse, drillExtendPath, drillSplitPath, drillPathBack } from './tabs/reverse.js';
import { doForward } from './tabs/forward.js';
import { doPath } from './tabs/path.js';
import { doCraft } from './tabs/craft.js';
import { doInventory, loadInventoryFromText, clearInventory, findInventoryPath, initInventory, onAnyTypeChange } from './tabs/inventory.js';

// Expose functions on window so HTML onclick attributes work
window.doReverse = doReverse;
window.doForward = doForward;
window.doPath = doPath;
window.doCraft = doCraft;
window.doInventory = doInventory;
window.loadInventoryFromText = loadInventoryFromText;
window.clearInventory = clearInventory;
window.findInventoryPath = findInventoryPath;
window.onAnyTypeChange = onAnyTypeChange;

window.drillExtendPath = drillExtendPath;
window.drillSplitPath = drillSplitPath;
window.drillPathBack = drillPathBack;

window.showDrillPopover = function (event, component, pathIndex, keyA, keyB) {
  event.stopPropagation();

  const existing = document.getElementById('drill-popover');
  if (existing) existing.remove();

  const labelA = lbl(keyA);
  const labelB = lbl(keyB);
  const sameItem = keyA === keyB;

  const popover = document.createElement('div');
  popover.id = 'drill-popover';
  popover.className = 'drill-popover';

  const rect = event.target.getBoundingClientRect();
  popover.style.position = 'absolute';
  popover.style.top = (rect.bottom + window.scrollY + 6) + 'px';
  popover.style.left = (rect.left + window.scrollX) + 'px';

  let btns;
  if (sameItem) {
    btns = `<button class="drill-popover-btn" onclick="drillExtendPath('${component}',${pathIndex},'${keyA}');closeDrillPopover()">
      Jak wytwarzam: <strong>${labelA}</strong>
    </button>`;
  } else {
    btns = `
    <button class="drill-popover-btn" onclick="drillExtendPath('${component}',${pathIndex},'${keyA}');closeDrillPopover()">
      Tylko: <strong>${labelA}</strong>
    </button>
    <button class="drill-popover-btn" onclick="drillExtendPath('${component}',${pathIndex},'${keyB}');closeDrillPopover()">
      Tylko: <strong>${labelB}</strong>
    </button>
    <button class="drill-popover-btn drill-popover-btn-both" onclick="drillSplitPath('${component}',${pathIndex},'${keyA}','${keyB}');closeDrillPopover()">
      Oba: <strong>${labelA}</strong> + <strong>${labelB}</strong>
    </button>`;
  }

  popover.innerHTML = `<div class="drill-popover-title">Co chcesz wytwarzać?</div>${btns}`;
  document.body.appendChild(popover);

  // Clamp to viewport width
  const pw = popover.offsetWidth;
  const left = parseFloat(popover.style.left);
  if (left + pw > window.innerWidth - 8) {
    popover.style.left = Math.max(8, window.innerWidth - pw - 8) + 'px';
  }

  setTimeout(() => {
    document.addEventListener('click', window.closeDrillPopover, { once: true });
  }, 0);
};

window.closeDrillPopover = function () {
  const el = document.getElementById('drill-popover');
  if (el) el.remove();
};

window.onCatChange = function () {
  setCurrentCat(document.getElementById('catSelect').value);
  rebuildAllSelects();
  renderBlockedUI();
  doReverse();
  doForward();
  doPath();
  doCraft();
  doInventory();
};

window.toggleBlockedItem = function (attr, key) {
  toggleBlocked(currentCat, attr, key);
  renderBlockedUI();
  doPath();
};

window.clearBlocked = function () {
  clearBlocked(currentCat);
  renderBlockedUI();
  doPath();
};

window.switchTab = function (name) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  event.target.classList.add('active');
  if (name === 'reverse') refreshReverse();
  else if (name === 'forward') doForward();
  else if (name === 'path') doPath();
  else if (name === 'craft') doCraft();
  else if (name === 'inventory') doInventory();
};

// Init
rebuildAllSelects();
renderBlockedUI();
doReverse();
doForward();
doPath();
doCraft();
initInventory();
doInventory();
