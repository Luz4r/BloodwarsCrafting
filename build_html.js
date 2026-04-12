const fs = require('fs');
const CATEGORIES = JSON.parse(fs.readFileSync('C:/Users/piore/Desktop/Bloodwars/data.json', 'utf8'));

// Polish display labels
const LABELS = {
  // types
  czapka:'czapka', kask:'kask', helm:'helm', maska:'maska', obrecz:'obręcz',
  kominiarka:'kominiarka', kapelusz:'kapelusz', opaska:'opaska', bandana:'bandana', korona:'korona',
  koszulka:'koszulka', kurtka:'kurtka', marynarka:'marynarka', kamizelka:'kamizelka', gorset:'gorset',
  peleryna:'peleryna', smoking:'smoking', kolczuga:'kolczuga', 'zbroja warstwowa':'zbroja warstwowa',
  'pelna zbroja':'pełna zbroja',
  szorty:'szorty', spodnie:'spodnie', spodnica:'spódnica', kilt:'kilt',
  pierscien:'pierścień', sygnet:'sygnet', bransoleta:'bransoleta',
  naszyjnik:'naszyjnik', lancuch:'łańcuch', amulet:'amulet', krawat:'krawat', apaszka:'apaszka',
  palka:'pałka', noz:'nóż', sztylet:'sztylet', kastet:'kastet', miecz:'miecz', rapier:'rapier',
  kama:'kama', topor:'topór', wakizashi:'wakizashi', 'piesc niebios':'pięść niebios',
  maczuga:'maczuga', lom:'łom', 'miecz dwureczny':'miecz dwuręczny', 'topor dwureczny':'topór dwuręczny',
  korbacz:'korbacz', kosa:'kosa', pika:'pika', halabarda:'halabarda', katana:'katana',
  'pila lancuchowa':'piła łańcuchowa',
  'krotki luk':'krótki łuk', luk:'łuk', shurek:'shurek', 'dlugi luk':'długi łuk',
  kusza:'kusza', 'noz do rzucania':'nóż do rzucania', 'luk refleksyjny':'łuk refleksyjny',
  oszczep:'oszczep', pilum:'pilum', 'toporek do rzucania':'toporek do rzucania',
  'ciezka kusza':'ciężka kusza',
  glock:'glock', beretta:'beretta', uzi:'uzi', magnum:'magnum', 'desert eagle':'desert eagle',
  mp5k:'mp5k', skorpion:'skorpion',
  'karabin m.':'karabin m.', 'polautomat s.':'półautomat s.', 'karabin s.':'karabin s.',
  'ak-47':'ak-47', 'fn-fal':'fn-fal', strzelba:'strzelba', 'miotacz p.':'miotacz p.',
};

function label(k) { return LABELS[k] || k; }

const dataJson = JSON.stringify(CATEGORIES);

const LABELS_OBJ = {
  czapka:'czapka',kask:'kask',helm:'helm',maska:'maska',obrecz:'obręcz',
  kominiarka:'kominiarka',kapelusz:'kapelusz',opaska:'opaska',bandana:'bandana',korona:'korona',
  koszulka:'koszulka',kurtka:'kurtka',marynarka:'marynarka',kamizelka:'kamizelka',gorset:'gorset',
  peleryna:'peleryna',smoking:'smoking',kolczuga:'kolczuga','zbroja warstwowa':'zbroja warstwowa',
  'pelna zbroja':'pełna zbroja',
  szorty:'szorty',spodnie:'spodnie',spodnica:'spódnica',kilt:'kilt',
  pierscien:'pierścień',sygnet:'sygnet',bransoleta:'bransoleta',
  naszyjnik:'naszyjnik',lancuch:'łańcuch',amulet:'amulet',krawat:'krawat',apaszka:'apaszka',
  palka:'pałka',noz:'nóż',sztylet:'sztylet',kastet:'kastet',miecz:'miecz',rapier:'rapier',
  kama:'kama',topor:'topór',wakizashi:'wakizashi','piesc niebios':'pięść niebios',
  maczuga:'maczuga',lom:'łom','miecz dwureczny':'miecz dwuręczny','topor dwureczny':'topór dwuręczny',
  korbacz:'korbacz',kosa:'kosa',pika:'pika',halabarda:'halabarda',katana:'katana',
  'pila lancuchowa':'piła łańcuchowa',
  'krotki luk':'krótki łuk',luk:'łuk',shurek:'shurek','dlugi luk':'długi łuk',
  kusza:'kusza','noz do rzucania':'nóż do rzucania','luk refleksyjny':'łuk refleksyjny',
  oszczep:'oszczep',pilum:'pilum','toporek do rzucania':'toporek do rzucania',
  'ciezka kusza':'ciężka kusza',
  glock:'glock',beretta:'beretta',uzi:'uzi',magnum:'magnum','desert eagle':'desert eagle',
  mp5k:'mp5k',skorpion:'skorpion',
  'karabin m.':'karabin m.','polautomat s.':'półautomat s.','karabin s.':'karabin s.',
  'ak-47':'ak-47','fn-fal':'fn-fal',strzelba:'strzelba','miotacz p.':'miotacz p.',
  utwardzony:'utwardzony',wzmocniony:'wzmocniony',pomocny:'pomocny',ozdobny:'ozdobny',
  elegancki:'elegancki',rogaty:'rogaty',zlosliwy:'złośliwy',leniwy:'leniwy',
  smiercionosny:'śmiercionośny',bojowy:'bojowy',magnetyczny:'magnetyczny',krwawy:'krwawy',
  kunsztowny:'kunsztowny',kuloodporny:'kuloodporny',szamanski:'szamański',tygrysi:'tygrysi',
  szturmowy:'szturmowy',runiczny:'runiczny',rytualny:'rytualny',
  cwiekowany:'ćwiekowany',wladczy:'władczy',lekki:'lekki',luskowy:'łuskowy',plytowy:'płytowy',
  gietki:'giętki',lowiecki:'łowiecki',elfi:'elfi',
  krotkie:'krótkie',pikowane:'pikowane',wzmocnione:'wzmocnione',aksamitne:'aksamitne',
  cwiekowane:'ćwiekowane',kuloodporne:'kuloodporne',gietkie:'giętkie',kolcze:'kolcze',
  szamanskie:'szamańskie',krwawe:'krwawe',elfie:'elfie',tygrysie:'tygrysie',pancerne:'pancerne',
  runiczne:'runiczne',kompozytowe:'kompozytowe',smiercionosne:'śmiercionośne',
  miedziany:'miedziany',srebrny:'srebrny',szmaragdowy:'szmaragdowy',zloty:'złoty',
  platynowy:'platynowy',rubinowy:'rubinowy',dystyngowany:'dystyngowany',przebiegly:'przebiegły',
  kardynalski:'kardynalski',elastyczny:'elastyczny',nekromancki:'nekromancki',gwiezdny:'gwiezdny',
  niedzwiedzi:'niedźwiedzi',twardy:'twardy',zwierzecy:'zwierzęcy',tanczacy:'tańczący',
  archaiczny:'archaiczny',hipnotyczny:'hipnotyczny',diamentowy:'diamentowy',msciwy:'mściwy',
  spaczony:'spaczony',plastikowy:'plastikowy',zdradziecki:'zdradziecki',tytanowy:'tytanowy',
  sloneczny:'słoneczny',pajeczy:'pajęczy',jastrzebi:'jastrzębi',czarny:'czarny',
  ostry:'ostry',zebaty:'zębaty',kosciany:'kościany',wzmacniajacy:'wzmacniający',krysztalowy:'kryształowy',
  mistyczny:'mistyczny',okrutny:'okrutny',przyjacielski:'przyjacielski',kasajacy:'kasający',
  opiekunczy:'opiekuńczy',swiecacy:'świecący',jadowity:'jadowity',zabojczy:'zabójczy',
  zatruty:'zatruty',przeklety:'przeklęty',zwinny:'zwinny',antyczny:'antyczny',szybki:'szybki',
  demoniczny:'demoniczny',kosztowny:'kosztowny',szeroki:'szeroki',ciezki:'ciężki',
  napromieniowany:'napromieniowany',
  podroznika:'podróżnika',przezornosci:'przezorności',wytrzymalosci:'wytrzymałości',
  pasterza:'pasterza',narkomana:'narkomana',ochrony:'ochrony',zmyslow:'zmysłów',
  wieszcza:'wieszcza',kary:'kary',gladiatora:'gladiatora',krwi:'krwi',
  'skorupy zolwia':'skorupy żółwia',slonca:'słońca',adrenaliny:'adrenaliny',
  prekognicji:'prekognicji','smoczej luski':'smoczej łuski',mocy:'mocy',magii:'magii',
  adepta:'adepty',straznika:'strażnika',zlodzieja:'złodzieja',silacza:'siłacza',
  szermierza:'szermierza',zabojcy:'zabójcy',gwardzisty:'gwardzisty',kobry:'kobry',
  unikow:'uników',grabiezcy:'grabieżcy',mistrza:'mistrza',centuriona:'centuriona',
  odpornosci:'odporności',kaliguli:'Kaliguli','siewcy smierci':'siewcy śmierci',
  szybkosci:'szybkości',orchidei:'orchidei',
  rzezimieszka:'rzezimieszka',przemytnika:'przemytnika','cichych ruchow':'cichych ruchów',
  skrytosci:'skrytości','handlarza bronia':'handlarza bronią',
  'lowcy cieni':'łowcy cieni',weza:'węża',inkow:'Inków',tropiciela:'tropiciela',nocy:'nocy',
  wystepku:'występku',urody:'urody',wladzy:'władzy',sily:'siły',geniuszu:'geniuszu',
  madrosci:'mądrości','twardej skory':'twardej skóry',wilkolaka:'wilkołaka',sztuki:'sztuki',
  celnosci:'celności',mlodosci:'młodości',lisa:'lisa',szczescia:'szczęścia',
  nietoperza:'nietoperza',koncentracji:'koncentracji',lewitacji:'lewitacji',
  przebieglosci:'przebiegłości',szalenca:'szaleńca',latwosci:'łatwości',
  pielgrzyma:'pielgrzyma',zdolnosci:'zdolności',
  dowodcy:'dowódcy',sekty:'sekty',bolu:'bólu',zwinnosci:'zwinności',zarazy:'zarazy',
  odwagi:'odwagi',trafienia:'trafienia',przodkow:'przodków',zdobywcy:'zdobywcy',
  kontuzji:'kontuzji',mestwa:'męstwa',precyzji:'precyzji',zemsty:'zemsty',
  podkowy:'podkowy',drakuli:'Drakuli',bieglosci:'biegłości',klanu:'klanu',
  imperatora:'imperatora',samobojcy:'samobójcy',
  zdrady:'zdrady',podstepu:'podstępu',hazardzisty:'hazardzisty',olowiu:'ołowiu',
  inkwizytora:'inkwizytora',krwiopijcy:'krwiopijcy',autokraty:'autokraty',
  bazyliszka:'bazyliszka',
  'dalekiego zasiegu':'dalekiego zasięgu',doskonalosci:'doskonałości',reakcji:'reakcji',
  driady:'driady',szybkostrzelnosci:'szybkostrzelności',wilka:'wilka',
};
const labelsJson = JSON.stringify(LABELS_OBJ);

const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bloodwars — Kreator Przedmiotów</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { background:#0f0f0f; color:#e5c97a; font-family:'Segoe UI',sans-serif; }
  select, button { background:#1a1a1a; border:1px solid #5a3e1b; color:#e5c97a; border-radius:4px; padding:4px 8px; }
  select:focus, button:hover { border-color:#c9952a; outline:none; }
  .tab-btn { padding:8px 20px; border-radius:6px 6px 0 0; border:1px solid #5a3e1b; border-bottom:none; cursor:pointer; }
  .tab-btn.active { background:#2a1f08; border-color:#c9952a; color:#f5d78e; }
  .tab-btn:not(.active) { background:#111; color:#a07030; }
  .tab-content { display:none; }
  .tab-content.active { display:block; }
  .card { background:#1a1a1a; border:1px solid #5a3e1b; border-radius:8px; padding:16px; }
  .result-badge { display:inline-block; background:#2a1f08; border:1px solid #c9952a; border-radius:6px; padding:4px 12px; font-weight:bold; color:#f5d78e; }
  table { border-collapse:collapse; width:100%; }
  th { background:#2a1f08; color:#c9952a; padding:6px 10px; text-align:left; border:1px solid #3a2a10; }
  td { padding:5px 10px; border:1px solid #2a1f08; }
  tr:hover td { background:#1f1808; }
  .step { background:#1a1a1a; border-left:3px solid #c9952a; padding:8px 12px; margin:4px 0; border-radius:0 6px 6px 0; }
  .step .from { color:#a07030; }
  .step .arrow { color:#c9952a; margin:0 6px; }
  .step .partner { color:#7ec8e3; }
  .step .result { color:#f5d78e; font-weight:bold; }
  .no-path { color:#cc4444; padding:8px; }
  .same-val { color:#888; font-style:italic; }
  h2 { color:#c9952a; border-bottom:1px solid #3a2a10; padding-bottom:6px; margin-bottom:12px; }
  .attr-section { margin-bottom:20px; }
  .attr-label { color:#c9952a; font-size:0.85em; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
  label { color:#a07030; font-size:0.9em; }
  .pairs-count { color:#888; font-size:0.85em; margin-bottom:8px; }
</style>
</head>
<body class="min-h-screen p-4">

<div class="max-w-5xl mx-auto">
  <h1 class="text-3xl font-bold text-center mb-2" style="color:#f5d78e;">⚔ Bloodwars — Kreator Przedmiotów</h1>
  <p class="text-center text-sm mb-6" style="color:#7a5c2a;">Moria — łączenie przedmiotów</p>

  <!-- Category selector -->
  <div class="card mb-4 flex items-center gap-4 flex-wrap">
    <label class="font-semibold" style="color:#c9952a;">Kategoria:</label>
    <select id="catSelect" onchange="onCatChange()" class="text-base">
      <option value="glowa">Nakrycia głowy</option>
      <option value="zbroja">Zbroje</option>
      <option value="gacie">Spodnie</option>
      <option value="pierscienie">Pierścienie</option>
      <option value="szyja">Amulety / Szyja</option>
      <option value="biala1h">Broń biała 1h</option>
      <option value="biala2h">Broń biała 2h</option>
      <option value="dystans">Broń dystansowa</option>
      <option value="palna1h">Broń palna 1h</option>
      <option value="palna2h">Broń palna 2h</option>
    </select>
  </div>

  <!-- Tabs -->
  <div class="flex gap-0 mb-0">
    <button class="tab-btn active" onclick="switchTab('reverse')">🔍 Szukaj Składników</button>
    <button class="tab-btn" onclick="switchTab('forward')">⚗ Wynik Łączenia</button>
    <button class="tab-btn" onclick="switchTab('path')">🗺 Ścieżka Wytwarzania</button>
  </div>

  <div class="card" style="border-radius:0 8px 8px 8px; border-top-color:#c9952a;">

    <!-- ===== REVERSE TAB ===== -->
    <div id="tab-reverse" class="tab-content active">
      <h2>Szukaj Składników</h2>
      <p class="text-sm mb-4" style="color:#888;">Wybierz pożądany przedmiot, aby zobaczyć wszystkie kombinacje składników.</p>
      <div class="flex flex-wrap gap-4 mb-4">
        <div id="rev-type-wrap">
          <label>Typ</label><br>
          <select id="rev-type" onchange="doReverse()"></select>
        </div>
        <div id="rev-prefix-wrap">
          <label>Prefiks</label><br>
          <select id="rev-prefix" onchange="doReverse()"></select>
        </div>
        <div id="rev-suffix-wrap">
          <label>Sufiks</label><br>
          <select id="rev-suffix" onchange="doReverse()"></select>
        </div>
      </div>
      <div id="rev-results"></div>
    </div>

    <!-- ===== FORWARD TAB ===== -->
    <div id="tab-forward" class="tab-content">
      <h2>Wynik Łączenia</h2>
      <p class="text-sm mb-4" style="color:#888;">Wybierz dwa przedmioty, aby zobaczyć wynik ich połączenia.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="card">
          <div class="attr-label mb-2">Przedmiot A</div>
          <div class="flex flex-col gap-2">
            <div id="fwd-a-type-wrap"><label>Typ</label><br><select id="fwd-a-type" onchange="doForward()"></select></div>
            <div id="fwd-a-prefix-wrap"><label>Prefiks</label><br><select id="fwd-a-prefix" onchange="doForward()"></select></div>
            <div id="fwd-a-suffix-wrap"><label>Sufiks</label><br><select id="fwd-a-suffix" onchange="doForward()"></select></div>
          </div>
        </div>
        <div class="card">
          <div class="attr-label mb-2">Przedmiot B</div>
          <div class="flex flex-col gap-2">
            <div id="fwd-b-type-wrap"><label>Typ</label><br><select id="fwd-b-type" onchange="doForward()"></select></div>
            <div id="fwd-b-prefix-wrap"><label>Prefiks</label><br><select id="fwd-b-prefix" onchange="doForward()"></select></div>
            <div id="fwd-b-suffix-wrap"><label>Sufiks</label><br><select id="fwd-b-suffix" onchange="doForward()"></select></div>
          </div>
        </div>
      </div>
      <div id="fwd-result"></div>
    </div>

    <!-- ===== PATH TAB ===== -->
    <div id="tab-path" class="tab-content">
      <h2>Ścieżka Wytwarzania</h2>
      <p class="text-sm mb-4" style="color:#888;">Wybierz przedmiot startowy i docelowy — zobaczysz kroki wymagane do jego wytworzenia.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div class="card">
          <div class="attr-label mb-2">Przedmiot startowy</div>
          <div class="flex flex-col gap-2">
            <div id="path-a-type-wrap"><label>Typ</label><br><select id="path-a-type" onchange="doPath()"></select></div>
            <div id="path-a-prefix-wrap"><label>Prefiks</label><br><select id="path-a-prefix" onchange="doPath()"></select></div>
            <div id="path-a-suffix-wrap"><label>Sufiks</label><br><select id="path-a-suffix" onchange="doPath()"></select></div>
          </div>
        </div>
        <div class="card">
          <div class="attr-label mb-2">Przedmiot docelowy</div>
          <div class="flex flex-col gap-2">
            <div id="path-b-type-wrap"><label>Typ</label><br><select id="path-b-type" onchange="doPath()"></select></div>
            <div id="path-b-prefix-wrap"><label>Prefiks</label><br><select id="path-b-prefix" onchange="doPath()"></select></div>
            <div id="path-b-suffix-wrap"><label>Sufiks</label><br><select id="path-b-suffix" onchange="doPath()"></select></div>
          </div>
        </div>
      </div>
      <!-- Blocked items panel -->
      <div class="card mt-4" style="border-color:#3a2a10;">
        <div class="flex justify-between items-center mb-3 flex-wrap gap-3">
          <div class="attr-label" style="margin-bottom:0;">Zablokowane składniki <span style="color:#888;font-weight:normal;font-size:0.85em;">(kliknij aby wykluczyć z ścieżki)</span></div>
          <div class="flex items-center gap-3">
            <label style="font-size:0.85em;color:#a07030;">Maks. kroków:</label>
            <input type="number" id="max-depth" min="1" max="20" value="6"
              onchange="doPath()"
              style="width:56px;background:#1a1a1a;border:1px solid #5a3e1b;color:#e5c97a;border-radius:4px;padding:3px 6px;text-align:center;">
            <button onclick="clearBlocked()" style="font-size:0.8em;padding:2px 10px;">Wyczyść blokady</button>
          </div>
        </div>
        <div style="margin-bottom:6px;"><span style="color:#888;font-size:0.82em;">Typy:</span><br><div id="blocked-types-chips" style="margin-top:4px;"></div></div>
        <div id="blocked-prefix-row" style="margin-bottom:6px;"><span style="color:#888;font-size:0.82em;">Prefiksy:</span><br><div id="blocked-prefix-chips" style="margin-top:4px;"></div></div>
        <div id="blocked-suffix-row"><span style="color:#888;font-size:0.82em;">Sufiksy:</span><br><div id="blocked-suffix-chips" style="margin-top:4px;"></div></div>
      </div>

      <div id="path-result" style="margin-top:16px;"></div>
    </div>

  </div>
</div>

<script>
const CATEGORIES = ${dataJson};

// Polish display labels
const LABELS = ${labelsJson};

function lbl(k) { return LABELS[k] || k; }

let currentCat = 'glowa';

function getCat() { return CATEGORIES[currentCat]; }

// Build inverse map for a matrix
function buildInverse(matrix, keys) {
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
const MAX_PATHS_DISPLAY = 20;   // how many to show in UI
const MAX_PATHS_DFS = 2000;     // internal DFS cap (allows filter to discard bad paths)

function bfsAllPaths(matrix, keys, start, target, blocked, maxDepth) {
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

// Blocked items state per category
const blockedState = {};
function getBlocked(catKey, attr) {
  if (!blockedState[catKey]) blockedState[catKey] = { types: new Set(), prefixes: new Set(), suffixes: new Set() };
  return blockedState[catKey][attr];
}
function toggleBlocked(attr, key) {
  const s = getBlocked(currentCat, attr);
  if (s.has(key)) s.delete(key); else s.add(key);
  renderBlockedUI();
  doPath();
}
function clearBlocked() {
  blockedState[currentCat] = { types: new Set(), prefixes: new Set(), suffixes: new Set() };
  renderBlockedUI();
  doPath();
}

function renderBlockedUI() {
  const cat = getCat();
  function buildChips(containerId, items, attr) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const blocked = getBlocked(currentCat, attr);
    el.innerHTML = items.map(k =>
      \`<span onclick="toggleBlocked('\${attr}','\${k.replace(/'/g,"\\\\'")}')"
        style="cursor:pointer;display:inline-block;padding:3px 10px;margin:2px;border-radius:20px;font-size:0.82em;border:1px solid \${blocked.has(k) ? '#cc4444' : '#5a3e1b'};background:\${blocked.has(k) ? '#3a0a0a' : '#1a1a1a'};color:\${blocked.has(k) ? '#ff8888' : '#a07030'};"
        title="\${blocked.has(k) ? 'Kliknij aby odblokować' : 'Kliknij aby zablokować'}">\${lbl(k)}</span>\`
    ).join('');
  }
  buildChips('blocked-types-chips', cat.subtypes, 'types');
  const hasPref = cat.prefixes && cat.prefixes.length > 0;
  const hasSuff = cat.suffixes && cat.suffixes.length > 0;
  showEl('blocked-prefix-row', hasPref);
  showEl('blocked-suffix-row', hasSuff);
  if (hasPref) buildChips('blocked-prefix-chips', cat.prefixes, 'prefixes');
  if (hasSuff) buildChips('blocked-suffix-chips', cat.suffixes, 'suffixes');
}

// Populate a select element
function populateSelect(id, items, includeAny, anyLabel) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '';
  if (includeAny) {
    const opt = document.createElement('option');
    opt.value = '__any__';
    opt.textContent = anyLabel || '(dowolny)';
    sel.appendChild(opt);
  }
  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = lbl(item);
    sel.appendChild(opt);
  }
}

function showEl(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? '' : 'none';
}

function onCatChange() {
  currentCat = document.getElementById('catSelect').value;
  rebuildAllSelects();
  renderBlockedUI();
  doReverse();
  doForward();
  doPath();
}

function rebuildAllSelects() {
  const cat = getCat();
  const hasPref = cat.prefixes && cat.prefixes.length > 0;
  const hasSuff = cat.suffixes && cat.suffixes.length > 0;

  // Reverse tab
  populateSelect('rev-type', cat.subtypes, false);
  showEl('rev-prefix-wrap', hasPref);
  if (hasPref) populateSelect('rev-prefix', cat.prefixes, true, '(dowolny prefiks)');
  showEl('rev-suffix-wrap', hasSuff);
  if (hasSuff) populateSelect('rev-suffix', cat.suffixes, true, '(dowolny sufiks)');

  // Forward tab
  populateSelect('fwd-a-type', cat.subtypes, false);
  populateSelect('fwd-b-type', cat.subtypes, false);
  showEl('fwd-a-prefix-wrap', hasPref);
  showEl('fwd-b-prefix-wrap', hasPref);
  showEl('fwd-a-suffix-wrap', hasSuff);
  showEl('fwd-b-suffix-wrap', hasSuff);
  if (hasPref) {
    populateSelect('fwd-a-prefix', cat.prefixes, true, '(brak)');
    populateSelect('fwd-b-prefix', cat.prefixes, true, '(brak)');
  }
  if (hasSuff) {
    populateSelect('fwd-a-suffix', cat.suffixes, true, '(brak)');
    populateSelect('fwd-b-suffix', cat.suffixes, true, '(brak)');
  }

  // Path tab
  populateSelect('path-a-type', cat.subtypes, false);
  populateSelect('path-b-type', cat.subtypes, false);
  showEl('path-a-prefix-wrap', hasPref);
  showEl('path-b-prefix-wrap', hasPref);
  showEl('path-a-suffix-wrap', hasSuff);
  showEl('path-b-suffix-wrap', hasSuff);
  if (hasPref) {
    populateSelect('path-a-prefix', cat.prefixes, true, '(brak)');
    populateSelect('path-b-prefix', cat.prefixes, true, '(brak)');
  }
  if (hasSuff) {
    populateSelect('path-a-suffix', cat.suffixes, true, '(brak)');
    populateSelect('path-b-suffix', cat.suffixes, true, '(brak)');
  }
}

// ===== REVERSE =====
function doReverse() {
  const cat = getCat();
  const targetType = document.getElementById('rev-type').value;
  const targetPrefix = cat.prefixes ? document.getElementById('rev-prefix').value : '__any__';
  const targetSuffix = cat.suffixes ? document.getElementById('rev-suffix').value : '__any__';

  let html = '';

  // Type pairs
  {
    const inv = buildInverse(cat.typeMatrix, cat.subtypes);
    const pairs = inv[targetType] || [];
    html += renderPairsSection('Typ: ' + lbl(targetType), pairs, 'typ');
  }

  // Prefix pairs
  if (cat.prefixes && targetPrefix !== '__any__') {
    const inv = buildInverse(cat.prefixMatrix, cat.prefixes);
    const pairs = inv[targetPrefix] || [];
    html += renderPairsSection('Prefiks: ' + lbl(targetPrefix), pairs, 'pref');
  }

  // Suffix pairs
  if (cat.suffixes && targetSuffix !== '__any__') {
    const inv = buildInverse(cat.suffixMatrix, cat.suffixes);
    const pairs = inv[targetSuffix] || [];
    html += renderPairsSection('Sufiks: ' + lbl(targetSuffix), pairs, 'suf');
  }

  document.getElementById('rev-results').innerHTML = html || '<p style="color:#888">Brak wyników.</p>';
}

function renderPairsSection(title, pairs, kind) {
  let h = \`<div class="attr-section"><div class="attr-label">\${title}</div>\`;
  if (pairs.length === 0) {
    h += '<p style="color:#888;font-size:0.9em;">Brak kombinacji.</p></div>';
    return h;
  }
  const shown = pairs.slice(0, 50);
  h += \`<div class="pairs-count">\${pairs.length} kombinacja(i)\${pairs.length > 50 ? ' — pokazano pierwsze 50' : ''}</div>\`;
  h += '<table><thead><tr><th>Składnik A</th><th>+</th><th>Składnik B</th></tr></thead><tbody>';
  for (const [a, b] of shown) {
    h += \`<tr><td>\${lbl(a)}</td><td style="color:#c9952a;text-align:center">+</td><td>\${lbl(b)}</td></tr>\`;
  }
  h += '</tbody></table></div>';
  return h;
}

// ===== FORWARD =====
function doForward() {
  const cat = getCat();
  const aType = document.getElementById('fwd-a-type').value;
  const bType = document.getElementById('fwd-b-type').value;
  const aPrefix = cat.prefixes ? document.getElementById('fwd-a-prefix').value : '__any__';
  const bPrefix = cat.prefixes ? document.getElementById('fwd-b-prefix').value : '__any__';
  const aSuffix = cat.suffixes ? document.getElementById('fwd-a-suffix').value : '__any__';
  const bSuffix = cat.suffixes ? document.getElementById('fwd-b-suffix').value : '__any__';

  const rType = cat.typeMatrix[aType] && cat.typeMatrix[aType][bType];
  const rPref = (cat.prefixes && aPrefix !== '__any__' && bPrefix !== '__any__')
    ? (cat.prefixMatrix[aPrefix] && cat.prefixMatrix[aPrefix][bPrefix])
    : null;
  const rSuff = (cat.suffixes && aSuffix !== '__any__' && bSuffix !== '__any__')
    ? (cat.suffixMatrix[aSuffix] && cat.suffixMatrix[aSuffix][bSuffix])
    : null;

  let html = '<div class="card" style="border-color:#c9952a;">';
  html += '<div class="attr-label mb-3">Wynik łączenia</div>';
  html += \`<div class="mb-2"><span class="attr-label" style="margin-right:8px;">Typ:</span><span class="result-badge">\${rType ? lbl(rType) : '—'}</span></div>\`;
  if (cat.prefixes) {
    html += \`<div class="mb-2"><span class="attr-label" style="margin-right:8px;">Prefiks:</span>\`;
    if (aPrefix === '__any__' || bPrefix === '__any__') {
      html += '<span style="color:#888">wybierz oba prefiksy</span>';
    } else {
      html += \`<span class="result-badge">\${rPref ? lbl(rPref) : '—'}</span>\`;
    }
    html += '</div>';
  }
  if (cat.suffixes) {
    html += \`<div class="mb-2"><span class="attr-label" style="margin-right:8px;">Sufiks:</span>\`;
    if (aSuffix === '__any__' || bSuffix === '__any__') {
      html += '<span style="color:#888">wybierz oba sufiksy</span>';
    } else {
      html += \`<span class="result-badge">\${rSuff ? lbl(rSuff) : '—'}</span>\`;
    }
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('fwd-result').innerHTML = html;
}

// ===== PATH =====
function doPath() {
  const cat = getCat();
  const aType = document.getElementById('path-a-type').value;
  const bType = document.getElementById('path-b-type').value;
  const aPrefix = cat.prefixes ? document.getElementById('path-a-prefix').value : '__any__';
  const bPrefix = cat.prefixes ? document.getElementById('path-b-prefix').value : '__any__';
  const aSuffix = cat.suffixes ? document.getElementById('path-a-suffix').value : '__any__';
  const bSuffix = cat.suffixes ? document.getElementById('path-b-suffix').value : '__any__';

  const bTypes    = getBlocked(currentCat, 'types');
  const bPrefixes = getBlocked(currentCat, 'prefixes');
  const bSuffixes = getBlocked(currentCat, 'suffixes');
  const maxDepth  = parseInt(document.getElementById('max-depth').value) || 6;

  let html = '';

  const typePaths = bfsAllPaths(cat.typeMatrix, cat.subtypes, aType, bType, bTypes, maxDepth);
  html += renderPathSection('Typ', aType, bType, typePaths);

  if (cat.prefixes && aPrefix !== '__any__' && bPrefix !== '__any__') {
    const prefPaths = bfsAllPaths(cat.prefixMatrix, cat.prefixes, aPrefix, bPrefix, bPrefixes, maxDepth);
    html += renderPathSection('Prefiks', aPrefix, bPrefix, prefPaths);
  }

  if (cat.suffixes && aSuffix !== '__any__' && bSuffix !== '__any__') {
    const suffPaths = bfsAllPaths(cat.suffixMatrix, cat.suffixes, aSuffix, bSuffix, bSuffixes, maxDepth);
    html += renderPathSection('Sufiks', aSuffix, bSuffix, suffPaths);
  }

  document.getElementById('path-result').innerHTML = html || '<p style="color:#888">Wybierz przedmioty startowy i docelowy.</p>';
}

function renderPathSection(attrName, start, target, paths) {
  let h = \`<div class="attr-section"><div class="attr-label">\${attrName}: \${lbl(start)} → \${lbl(target)}</div>\`;
  if (start === target) {
    h += \`<div class="same-val">Już osiągnięty — to ten sam atrybut.</div>\`;
  } else if (!paths || paths.length === 0) {
    h += \`<div class="no-path">Brak ścieżki — nie można osiągnąć \${lbl(target)} od \${lbl(start)} przy aktualnych ustawieniach (sprawdź blokady lub zwiększ limit kroków).</div>\`;
  } else {
    const plural = paths.length > 1 ? \` (\${paths.length}\${paths.length >= MAX_PATHS_DISPLAY ? '+' : ''} ścieżek)\` : '';
    h += \`<div style="color:#7a9a7a;font-size:0.82em;margin-bottom:8px;">Minimalna liczba kroków: \${paths[0].length}\${plural}</div>\`;
    paths.forEach((path, pi) => {
      if (paths.length > 1) {
        h += \`<div style="color:#c9952a;font-size:0.85em;margin-top:10px;margin-bottom:4px;">— Ścieżka \${pi+1} —</div>\`;
      }
      if (path.length === 0) {
        h += \`<div class="same-val">Już osiągnięty.</div>\`;
      } else {
        for (let i = 0; i < path.length; i++) {
          const step = path[i];
          const alts = step.alternatives || [step.combineWith];
          const altsHtml = alts.map(a => \`<strong>\${lbl(a)}</strong>\`).join(' <span style="color:#888">lub</span> ');
          h += \`<div class="step">
            <span style="color:#888">Krok \${i+1}:</span>
            <span class="from">\${lbl(step.from)}</span>
            <span class="arrow">+</span>
            <span class="partner">[\${altsHtml}]</span>
            <span class="arrow">→</span>
            <span class="result">\${lbl(step.result)}</span>
          </div>\`;
        }
      }
    });
  }
  h += '</div>';
  return h;
}

// Tab switching
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  event.target.classList.add('active');
  if (name === 'reverse') doReverse();
  else if (name === 'forward') doForward();
  else if (name === 'path') doPath();
}

// Init
rebuildAllSelects();
renderBlockedUI();
doReverse();
doForward();
doPath();
</script>
</body>
</html>`;

fs.writeFileSync('C:/Users/piore/Desktop/Bloodwars/index.html', html, 'utf8');
console.log('index.html written, size:', html.length, 'chars');
