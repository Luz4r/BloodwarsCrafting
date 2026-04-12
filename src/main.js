import './styles/theme.css';
import { setCurrentCat, currentCat } from './state.js';
import { rebuildAllSelects } from './ui/selects.js';
import { renderBlockedUI } from './ui/blocked.js';
import { toggleBlocked, clearBlocked } from './lib/storage.js';
import { doReverse } from './tabs/reverse.js';
import { doForward } from './tabs/forward.js';
import { doPath } from './tabs/path.js';
import { doCraft } from './tabs/craft.js';

// Expose functions on window so HTML onclick attributes work
window.doReverse = doReverse;
window.doForward = doForward;
window.doPath = doPath;
window.doCraft = doCraft;

window.onCatChange = function () {
  setCurrentCat(document.getElementById('catSelect').value);
  rebuildAllSelects();
  renderBlockedUI();
  doReverse();
  doForward();
  doPath();
  doCraft();
};

// currentCat is a live ES module binding — always reads the current value
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
  if (name === 'reverse') doReverse();
  else if (name === 'forward') doForward();
  else if (name === 'path') doPath();
  else if (name === 'craft') doCraft();
};

// Init
rebuildAllSelects();
renderBlockedUI();
doReverse();
doForward();
doPath();
doCraft();
