const fs = require('fs');

function norm(s) {
  if (!s) return '';
  s = s.trim().replace(/\s+/g, ' ').toLowerCase();
  s = s.replace(/czpaka/g, 'czapka');
  s = s.replace(/kominiaka/g, 'kominiarka');
  s = s.replace(/laniwy/g, 'leniwy');
  s = s.replace(/smiercionoscny/g, 'smiercionosny');
  s = s.replace(/runiczmy/g, 'runiczny');
  s = s.replace(/elegencki/g, 'elegancki');
  s = s.replace(/utwardzany/g, 'utwardzony');
  s = s.replace(/pytowy/g, 'plytowy');
  s = s.replace(/szamasnki/g, 'szamanski');
  s = s.replace(/szmanski/g, 'szamanski');
  s = s.replace(/szamański/g, 'szamanski');
  s = s.replace(/nakromancki/g, 'nekromancki');
  s = s.replace(/niedziwiedzi/g, 'niedzwiedzi');
  s = s.replace(/niedziwedzi/g, 'niedzwiedzi');
  s = s.replace(/pajęczy/g, 'pajeczy');
  s = s.replace(/jastrzębi/g, 'jastrzebi');
  s = s.replace(/siły/g, 'sily');
  s = s.replace(/siła/g, 'sila');
  s = s.replace(/krwii/g, 'krwi');
  s = s.replace(/zodbywcy/g, 'zdobywcy');
  s = s.replace(/zjodzieja/g, 'zlodzieja');
  s = s.replace(/zlodzija/g, 'zlodzieja');
  s = s.replace(/grabierzcy/g, 'grabiezcy');
  s = s.replace(/adrenainy/g, 'adrenaliny');
  s = s.replace(/lekie/g, 'lekkie');
  s = s.replace(/gietknie/g, 'gietkie');
  s = s.replace(/krwiopiijcy/g, 'krwiopijcy');
  s = s.replace(/pełna zbroja/g, 'pelna zbroja');
  s = s.replace(/długi łuk/g, 'dlugi luk');
  s = s.replace(/szybkostrzelności/g, 'szybkostrzelnosci');
  s = s.replace(/szybkostrzelnosci szybkostrzelnosci/g, 'szybkostrzelnosci');
  s = s.replace(/siewcy smierci siewcy smierci/g, 'siewcy smierci');
  s = s.replace(/cichych ruchów/g, 'cichych ruchow');
  s = s.replace(/handlarza bronią/g, 'handlarza bronia');
  s = s.replace(/tropciela/g, 'tropiciela');
  s = s.replace(/skorupy zlowia/g, 'skorupy zolwia');
  s = s.replace(/skorupy zowlia/g, 'skorupy zolwia');
  s = s.replace(/przyjacielski przyjacielski/g, 'przyjacielski');
  return s;
}

function readPage(n) {
  const path = `C:/Users/piore/Desktop/Bloodwars/page_${n}.txt`;
  if (!fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf8').split('\n')
    .map(l => l.split('\t').map(norm))
    .filter(l => l.some(x => x));
}

function parseMatrix(rows) {
  const header = rows[0];
  const keys = header.slice(1).filter(x => x);
  const matrix = {};
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    const rowKey = row[0];
    matrix[rowKey] = {};
    for (let j = 0; j < keys.length; j++) {
      matrix[rowKey][keys[j]] = row[j + 1] || '';
    }
  }
  return { keys, matrix };
}

function splitSections(allRows) {
  const knownHeaders = [
    'hełmy', 'hełm pref', 'hełm suff',
    'zbroja', 'zbroja pref', 'zbroja suf',
    'gacie', 'gacie pref', 'gacie suf',
    'pierscienie', 'pierscien pref', 'pierscien suf',
    'szyja', 'szyja pref', 'szyja suf',
    'biala1h', 'biala1h pref', 'biala1h suf',
    'biala2h', 'biala2h pref', 'biala2h suf',
    'dystans', 'dystans suf',
    'palna 1h', 'palna 2h'
  ];
  const sections = [];
  let current = null;
  for (const row of allRows) {
    const first = row[0];
    if (knownHeaders.includes(first)) {
      if (current) sections.push(current);
      current = { label: first, rows: [row] };
    } else if (current) {
      current.rows.push(row);
    }
  }
  if (current) sections.push(current);
  return sections;
}

const allRows = [];
for (let i = 1; i <= 12; i++) {
  allRows.push(...readPage(i));
}

const sections = splitSections(allRows);
const sectionMap = {};
for (const s of sections) {
  sectionMap[s.label] = s;
}

function getMatrix(label) {
  const s = sectionMap[label];
  if (!s) return null;
  return parseMatrix(s.rows);
}

const CATEGORIES = {};

// HEŁMY
const glTm = getMatrix('hełmy');
const glPm = getMatrix('hełm pref');
const glSm = getMatrix('hełm suff');
CATEGORIES.glowa = {
  name: 'Nakrycia głowy',
  subtypes: glTm.keys,
  prefixes: glPm.keys,
  suffixes: glSm.keys,
  typeMatrix: glTm.matrix,
  prefixMatrix: glPm.matrix,
  suffixMatrix: glSm.matrix,
};

// ZBROJE
const zbTm = getMatrix('zbroja');
const zbPm = getMatrix('zbroja pref');
const zbSm = getMatrix('zbroja suf');
CATEGORIES.zbroja = {
  name: 'Zbroje',
  subtypes: zbTm.keys,
  prefixes: zbPm.keys,
  suffixes: zbSm.keys,
  typeMatrix: zbTm.matrix,
  prefixMatrix: zbPm.matrix,
  suffixMatrix: zbSm.matrix,
};

// GACIE
const gaTm = getMatrix('gacie');
const gaPm = getMatrix('gacie pref');
const gaSm = getMatrix('gacie suf');
CATEGORIES.gacie = {
  name: 'Spodnie',
  subtypes: gaTm.keys,
  prefixes: gaPm.keys,
  suffixes: gaSm.keys,
  typeMatrix: gaTm.matrix,
  prefixMatrix: gaPm.matrix,
  suffixMatrix: gaSm.matrix,
};

// PIERŚCIENIE
const piTm = getMatrix('pierscienie');
const piPm = getMatrix('pierscien pref');
const piSm = getMatrix('pierscien suf');
CATEGORIES.pierscienie = {
  name: 'Pierścienie',
  subtypes: piTm.keys,
  prefixes: piPm.keys,
  suffixes: piSm.keys,
  typeMatrix: piTm.matrix,
  prefixMatrix: piPm.matrix,
  suffixMatrix: piSm.matrix,
};

// SZYJA
const syTm = getMatrix('szyja');
const syPm = getMatrix('szyja pref');
const sySm = getMatrix('szyja suf');
CATEGORIES.szyja = {
  name: 'Amulety / Szyja',
  subtypes: syTm.keys,
  prefixes: syPm.keys,
  suffixes: sySm.keys,
  typeMatrix: syTm.matrix,
  prefixMatrix: syPm.matrix,
  suffixMatrix: sySm.matrix,
};

// BIAŁA 1H
const b1Tm = getMatrix('biala1h');
const b1Pm = getMatrix('biala1h pref');
const b1Sm = getMatrix('biala1h suf');
CATEGORIES.biala1h = {
  name: 'Broń biała 1h',
  subtypes: b1Tm.keys,
  prefixes: b1Pm.keys,
  suffixes: b1Sm.keys,
  typeMatrix: b1Tm.matrix,
  prefixMatrix: b1Pm.matrix,
  suffixMatrix: b1Sm.matrix,
};

// BIAŁA 2H
const b2Tm = getMatrix('biala2h');
const b2Pm = getMatrix('biala2h pref');
const b2Sm = getMatrix('biala2h suf');
CATEGORIES.biala2h = {
  name: 'Broń biała 2h',
  subtypes: b2Tm.keys,
  prefixes: b2Pm.keys,
  suffixes: b2Sm.keys,
  typeMatrix: b2Tm.matrix,
  prefixMatrix: b2Pm.matrix,
  suffixMatrix: b2Sm.matrix,
};

// DYSTANS
const dyTm = getMatrix('dystans');
const dySm = getMatrix('dystans suf');
CATEGORIES.dystans = {
  name: 'Broń dystansowa',
  subtypes: dyTm.keys,
  prefixes: null,
  suffixes: dySm.keys,
  typeMatrix: dyTm.matrix,
  prefixMatrix: null,
  suffixMatrix: dySm.matrix,
};

// PALNA 1H
const p1Tm = getMatrix('palna 1h');
CATEGORIES.palna1h = {
  name: 'Broń palna 1h',
  subtypes: p1Tm.keys,
  prefixes: null,
  suffixes: null,
  typeMatrix: p1Tm.matrix,
  prefixMatrix: null,
  suffixMatrix: null,
};

// PALNA 2H
const p2Tm = getMatrix('palna 2h');
CATEGORIES.palna2h = {
  name: 'Broń palna 2h',
  subtypes: p2Tm.keys,
  prefixes: null,
  suffixes: null,
  typeMatrix: p2Tm.matrix,
  prefixMatrix: null,
  suffixMatrix: null,
};

// Verify
for (const [key, cat] of Object.entries(CATEGORIES)) {
  const ts = cat.subtypes.length;
  const ps = cat.prefixes ? cat.prefixes.length : 0;
  const ss = cat.suffixes ? cat.suffixes.length : 0;
  const tmRows = Object.keys(cat.typeMatrix).length;
  console.log(`${key}: ${ts} types (matrix rows: ${tmRows}), ${ps} prefixes, ${ss} suffixes`);
}

fs.writeFileSync('C:/Users/piore/Desktop/Bloodwars/data.json', JSON.stringify(CATEGORIES), 'utf8');
console.log('Data written to data.json');
