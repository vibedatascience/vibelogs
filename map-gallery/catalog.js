/* Catalogue of #30DayMapChallenge maps from several makers.
   Row shape: {d key, m maker, y year, n day, t theme, s topic, i image, c code, g GitHub link, l tool, p packages}.
   Nicola Rennie publishes a CSV index. Every other maker is read from their repo's file tree using the
   path patterns below: `img` and `code` regexes capture the day (n) and, unless the source has a fixed
   year, the year (y). The best image and script per day are picked by score. */
(function(root) {
  const THEMES = root.MAP_THEMES || (typeof require !== 'undefined' ? require('./themes.js') : {});
  const HAND = new Set(['watercolour', 'watercolor', 'pen', 'pencil', 'paper', 'crochet']);
  const I = '\\.(png|jpe?g|gif|webp)$';
  const re = s => new RegExp(s, 'i');

  const SOURCES = [
    {id:'nrennie', name:'Nicola Rennie', repo:'nrennie/30DayMapChallenge', branch:'main', live:true, min:60, csv:'data/all_data.csv'},
    {id:'karamanis', name:'Georgios Karamanis', repo:'gkaramanis/30DayMapChallenge', branch:'main', live:true, min:60,
      img:[re(`^(?<y>\\d{4})/(?<n>\\d{1,2})(?:-\\d{1,2})?[-_][^/]+/[^/]+${I}`)],
      code:[re('^(?<y>\\d{4})/(?<n>\\d{1,2})(?:-\\d{1,2})?[-_][^/]+/[^/]+\\.(R|py|js)$')]},
    {id:'scherer', name:'Cédric Scherer', repo:'z3tt/30daymapchallenge', branch:'main', year:'2019',
      img:[re(`^contributions/Day(?<n>\\d{2})_[^/]+/[^/]+${I}`)],
      code:[re('^contributions/Day(?<n>\\d{2})_[^/]+/[^/]+\\.(R|Rmd|py)$')]},
    {id:'mills', name:'Blake R. Mills', repo:'BlakeRMills/30DayMapChallenge', branch:'main',
      img:[re(`^(?<y>\\d{4})/Day (?<n>\\d{2}) - [^/]+/.*${I}`)],
      code:[re('^(?<y>\\d{4})/Day (?<n>\\d{2}) - [^/]+/.*\\.(R|py)$')]},
    {id:'schien', name:'Spencer Schien', repo:'Pecners/30DayMapChallenge', branch:'main',
      img:[re(`^(?<y>\\d{4})/plots/day_(?<n>\\d{1,2})/[^/]+${I}`)],
      code:[re('^(?<y>\\d{4})/R/day_(?<n>\\d{1,2})_[^/]+/[^/]+\\.R$')]},
    {id:'hart', name:'Ryan Hart', repo:'curatedmess/30DayMapChallenge', branch:'main',
      img:[re(`^(?<y>\\d{4})/11(?<n>\\d{2})\\d{4}/[^/]+${I}`)],
      code:[re('^(?<y>\\d{4})/11(?<n>\\d{2})\\d{4}/[^/]+\\.R$')]},
    {id:'wolsing-2021', maker:'wolsing', name:'Ansgar Wolsing', repo:'bydata/30DayMapChallenge-2021', branch:'main', year:'2021',
      img:[re(`^plots/day(?<n>\\d{2})[-_][^/]+${I}`)], code:[re('^R/day(?<n>\\d{2})[-_][^/]+\\.R$')]},
    {id:'wolsing-2022', maker:'wolsing', name:'Ansgar Wolsing', repo:'bydata/30DayMapChallenge-2022', branch:'main', year:'2022',
      img:[re(`^plots/(?<n>\\d{2})-[^/]+${I}`)], code:[re('^R/(?<n>\\d{2})-[^/]+\\.R$')]},
    {id:'olney', name:'Lee Olney', repo:'leeolney3/30DayMapChallenge', branch:'main',
      img:[re(`^(?<y>2021)/(?<n>\\d{2})_[^/]+/[^/]+${I}`), re(`^(?<y>2022)/maps/(?<n>\\d{2})_[^/]+${I}`)],
      code:[re('^(?<y>2021)/(?<n>\\d{2})_[^/]+/[^/]+\\.(R|py|ipynb)$'), re('^(?<y>2022)/scripts/(?<n>\\d{2})_[^/]+\\.R$')]},
    {id:'olive', name:'Xavier Olive', repo:'xoolive/30DayMapChallenge', branch:'master', year:'2021',
      img:[re(`^contributions/challenge_day(?<n>\\d{2})${I}`)], code:[re('^notebooks/challenge_day(?<n>\\d{2})\\.ipynb$')]},
  ].map(s => ({maker:s.id, ...s,
    raw:`https://raw.githubusercontent.com/${s.repo}/${s.branch}/`,
    url:s.csv ? `https://raw.githubusercontent.com/${s.repo}/${s.branch}/${s.csv}` : `https://api.github.com/repos/${s.repo}/git/trees/${s.branch}?recursive=1`}));

  const pad = n => String(n).padStart(2, '0');
  const enc = p => p.split('/').map(encodeURIComponent).join('/');
  const file = p => p.split('/').pop();
  const dir = p => p.slice(0, p.lastIndexOf('/'));
  const stem = p => file(p).replace(/\.[^.]+$/, '').toLowerCase();
  const theme = (y, n) => THEMES[y]?.[n-1] || `Day ${n}`;
  const makerName = m => SOURCES.find(s => s.maker === m)?.name || m;
  const toolOf = p => !p ? 'Other' : /\.(py|ipynb)$/i.test(p) ? 'Python' : /\.js$/i.test(p) ? 'JavaScript' : 'R';
  function safe(p) {
    const clean = String(p || '');
    if (/[?#\\]/.test(clean) || clean.split('/').some(x => !x || x === '.' || x === '..')) throw Error('Invalid path');
    return clean;
  }
  function day(y, n) {
    if (!/^\d{4}$/.test(y) || !(n >= 1 && n <= 30)) throw Error('Invalid map');
  }
  // Prefer shallow, finished-looking images named after their folder; avoid insets, drafts and screenshots.
  function imageScore(p) {
    const f = file(p).toLowerCase();
    let s = -2 * p.split('/').length;
    if (/titled|final|combined|full|main|poster/.test(f)) s += 3;
    if (/inset|small|draft|test|screenshot|_sc\d|lres|without|preview|thumb|_old|icon|logo|legend/.test(f)) s -= 3;
    if (stem(p) === file(dir(p)).toLowerCase()) s += 2;
    return s;
  }
  // Prefer the plotting script next to the image; avoid data loading and helper scripts.
  function codeScore(p, img) {
    const b = stem(p);
    let s = 0;
    if (dir(p) === dir(img)) s += 3;
    if (b === stem(img)) s += 3;
    if (/render|plot|map|main|graphic|final|day/.test(b)) s += 1;
    if (/load|data|query|util|markup|annotate|helper|clean|get|prep|osm_/.test(b)) s -= 2;
    return s;
  }
  const best = (list, score) => list.slice().sort((a, b) => score(b) - score(a) || a.localeCompare(b))[0];
  function topic(img, t) {
    const skip = new Set([...t.toLowerCase().split(/[^a-z0-9]+/), 'day', 'challenge', 'map', 'maps', 'titled', 'final', 'combined', 'inset', 'bg', 'lres', 'hres', 'hd', 'v1', 'v2', 'v3'].filter(Boolean));
    return file(img).replace(/\.[^.]+$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').split(/[-_\s()+]+/)
      .filter(w => w && !/^\d+$/.test(w) && !/^day\d+$/i.test(w) && !skip.has(w.toLowerCase())).join(' ');
  }

  function parseCsv(src, csv, papa) {
    const result = papa.parse(csv, {header:true, skipEmptyLines:'greedy'});
    if (result.errors.length || !['year','prompt','number','image_url'].every(f => result.meta.fields?.includes(f))) throw Error('Invalid catalogue');
    return result.data.map(x => {
      const y = String(x.year || '').trim(), n = Number.parseInt(x.number, 10);
      day(y, n);
      const img = safe(String(x.image_url || '').split('/refs/heads/main/').pop().split('/main/').pop());
      if (!/^\d{4}\/maps\/day_\d{2}\.(png|jpe?g|gif)$/i.test(img)) throw Error('Invalid image path');
      const t0 = String(x.tool || '').trim(), l = HAND.has(t0.toLowerCase()) ? 'Hand-drawn' : (t0 || 'Other');
      const m = String(x.prompt || '').trim().match(/^Day\s*\d+\s*\((.*)\)\s*$/i);
      const row = {d:`${y}-${pad(n)}-${src.maker}`, m:src.maker, y, n, t:(m ? m[1] : '').trim() || theme(y, n), s:'', i:src.raw+img, g:`https://github.com/${src.repo}/tree/${src.branch}/${y}`, l, p:''};
      // Her CSV has no script column; scripts live at {year}/scripts/day_NN.{R,py}.
      if (l !== 'Hand-drawn' && l !== 'Tableau') {
        const code = `${y}/scripts/day_${pad(n)}.${l === 'Python' ? 'py' : 'R'}`;
        row.c = src.raw + code;
        row.g = `https://github.com/${src.repo}/blob/${src.branch}/${code}`;
      }
      return row;
    });
  }

  function parseTree(src, text) {
    const tree = typeof text === 'string' ? JSON.parse(text) : text;
    if (!Array.isArray(tree?.tree)) throw Error('Invalid tree');
    const days = new Map();
    const at = (y, n) => {
      const k = `${y}-${pad(n)}`;
      if (!days.has(k)) days.set(k, {y, n, imgs:[], codes:[]});
      return days.get(k);
    };
    tree.tree.forEach(e => {
      const p = String(e.path);
      // Skip odd paths (query or hash characters, dot segments) rather than failing the whole source.
      if (e.type !== 'blob' || /[?#\\]/.test(p) || p.split('/').some(x => !x || x === '.' || x === '..')) return;
      for (const [kind, list] of [['imgs', src.img], ['codes', src.code]]) {
        for (const r of list) {
          const m = p.match(r);
          if (!m) continue;
          const y = src.year || m.groups.y, n = Number(m.groups.n);
          if (/^\d{4}$/.test(y) && n >= 1 && n <= 30) at(y, n)[kind].push(p);
          break;
        }
      }
    });
    const rows = [];
    for (const {y, n, imgs, codes} of days.values()) {
      if (!imgs.length) continue;
      const img = best(imgs, imageScore), code = codes.length ? best(codes, p => codeScore(p, img)) : null;
      const t = theme(y, n);
      const row = {d:`${y}-${pad(n)}-${src.maker}`, m:src.maker, y, n, t, s:topic(img, t), i:src.raw+enc(img),
        g:`https://github.com/${src.repo}/${code ? 'blob' : 'tree'}/${src.branch}/${enc(code || dir(img))}`, l:toolOf(code), p:''};
      if (code) row.c = src.raw + enc(code);
      rows.push(row);
    }
    return rows;
  }

  function parse(id, text, papa) {
    const src = SOURCES.find(s => s.id === id);
    if (!src) throw Error('Unknown source');
    const rows = src.csv ? parseCsv(src, text, papa) : parseTree(src, text);
    if (!rows.length) throw Error('Empty catalogue');
    return rows;
  }
  function merge(previous, incoming) {
    const rows = new Map(previous.map(x => [x.d,x]));
    incoming.forEach(x => {
      const old = rows.get(x.d);
      // The snapshot knows checked image and script paths and packages; keep them over guesses.
      const row = old ? {...x, i:old.i || x.i, c:old.c ?? x.c, g:old.c ? old.g : x.g, p:old.p || x.p} : x;
      if (row.c === undefined) delete row.c;
      rows.set(x.d, row);
    });
    return [...rows.values()].sort((a,b) => b.d.localeCompare(a.d));
  }
  function filter(rows, {year = 'all', maker = 'all', tool = 'all', query = ''} = {}) {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter(x => (year === 'all' || x.y === year) && (maker === 'all' || x.m === maker) && (tool === 'all' || x.l === tool) &&
      words.every(w => `${x.t} ${x.s || ''} day ${x.n} ${x.y} ${x.l} ${makerName(x.m)} ${x.p || ''}`.toLocaleLowerCase().includes(w)));
  }
  const api = {SOURCES, parse, merge, filter, theme, makerName};
  if (typeof module !== 'undefined') module.exports = api;
  else root.GalleryCatalog = api;
})(globalThis);
