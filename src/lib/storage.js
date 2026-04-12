// Blocked items state per category — persisted in localStorage
const STORAGE_KEY = 'bw_blocked';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Revive plain arrays back into Sets
    const state = {};
    for (const cat of Object.keys(parsed)) {
      state[cat] = {
        types: new Set(parsed[cat].types || []),
        prefixes: new Set(parsed[cat].prefixes || []),
        suffixes: new Set(parsed[cat].suffixes || []),
      };
    }
    return state;
  } catch {
    return {};
  }
}

function saveState(state) {
  const serializable = {};
  for (const cat of Object.keys(state)) {
    serializable[cat] = {
      types: [...state[cat].types],
      prefixes: [...state[cat].prefixes],
      suffixes: [...state[cat].suffixes],
    };
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

const blockedState = loadState();

export function getBlocked(catKey, attr) {
  if (!blockedState[catKey]) blockedState[catKey] = { types: new Set(), prefixes: new Set(), suffixes: new Set() };
  return blockedState[catKey][attr];
}

export function toggleBlocked(catKey, attr, key) {
  const s = getBlocked(catKey, attr);
  if (s.has(key)) s.delete(key); else s.add(key);
  saveState(blockedState);
}

export function clearBlocked(catKey) {
  blockedState[catKey] = { types: new Set(), prefixes: new Set(), suffixes: new Set() };
  saveState(blockedState);
}
