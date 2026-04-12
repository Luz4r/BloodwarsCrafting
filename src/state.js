import { CATEGORIES, LABELS } from './data/categories.js';

export { CATEGORIES };

export let currentCat = 'glowa';

export function getCat() { return CATEGORIES[currentCat]; }

export function lbl(k) { return LABELS[k] || k; }

export function setCurrentCat(cat) { currentCat = cat; }
