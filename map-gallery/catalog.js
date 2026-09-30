/* Catalogue of #30DayMapChallenge maps from several makers.
   Each source knows where its live index lives and how to turn it into rows:
   {d key, m maker, y year, n day, t theme, s topic, i image, c code, g GitHub link, l tool, p packages}. */
(function(root) {
  const THEMES = root.MAP_THEMES || (typeof require !== 'undefined' ? require('./themes.js') : {});
  const HAND = new Set(['watercolour', 'watercolor', 'pen', 'pencil', 'paper', 'crochet']);
  const IMG = /\.(png|jpe?g|gif|webp)$/i;
  const raw = repo => `https://raw.githubusercontent.com/${repo}/main/`;
  const pad = n => String(n).padStart(2, '0');
  const enc = p => p.split('/').map(encodeURIComponent).join('/');
  const theme = (y, n) => THEMES[y]?.[n-1] || `Day ${n}`;
  function safe(p) {
    const clean = String(p || '');
    if (!/^\d{4}\//.test(clean) || /[?#\\]/.test(clean) || clean.split('/').some(x => !x || x === '.' || x === '..')) throw Error('Invalid path');
    return clean;
  }
  function day(y, n) {
    if (!/^\d{4}$/.test(y) || !(n >= 1 && n <= 30)) throw Error('Invalid map');
  }

  /* Nicola Rennie publishes data/all_data.csv, rebuilt from her yearly READMEs. */
  function parseRennie(csv, papa) {
    const repo = 'nrennie/30DayMapChallenge', RAW = raw(repo);
    const result = papa.parse(csv, {header:true, skipEmptyLines:'greedy'});
    if (result.errors.length || !['year','prompt','number','image_url'].every(f => result.meta.fields?.includes(f))) throw Error('Invalid catalogue');
    return result.data.map(x => {
      const y = String(x.year || '').trim(), n = Number.parseInt(x.number, 10);
      day(y, n);
      const img = safe(String(x.image_url || '').split('/refs/heads/main/').pop().split('/main/').pop());
      if (!/^\d{4}\/maps\/day_\d{2}\.(png|jpe?g|gif)$/i.test(img)) throw Error('Invalid image path');
      const t0 = String(x.tool || '').trim(), l = HAND.has(t0.toLowerCase()) ? 'Hand-drawn' : (t0 || 'Other');
      const m = String(x.prompt || '').trim().match(/^Day\s*\d+\s*\((.*)\)\s*$/i);
      const row = {d:`${y}-${pad(n)}-nrennie`, m:'nrennie', y, n, t:(m ? m[1] : '').trim() || theme(y, n), s:'', i:RAW+img, g:`https://github.com/${repo}/tree/main/${y}`, l, p:''};
      // Her CSV has no script column; scripts live at {year}/scripts/day_NN.{R,py}.
      if (l !== 'Hand-drawn' && l !== 'Tableau') {
        const code = `${y}/scripts/day_${pad(n)}.${l === 'Python' ? 'py' : 'R'}`;
        row.c = RAW + code;
        row.g = `https://github.com/${repo}/blob/main/${code}`;
      }
      return row;
    });
  }

  /* Georgios Karamanis has no index, so read the repo tree: {year}/{NN-theme-topic}/{files}. */
  function parseKaramanis(text) {
    const repo = 'gkaramanis/30DayMapChallenge', RAW = raw(repo);
    const tree = typeof text === 'string' ? JSON.parse(text) : text;
    if (!Array.isArray(tree?.tree)) throw Error('Invalid tree');
    const folders = new Map();
    tree.tree.forEach(e => {
      const f = e.type === 'blob' && String(e.path).match(/^(\d{4})\/([^/]+)\/([^/]+)$/);
      if (!f || f[2] === 'data') return;
      const k = `${f[1]}/${f[2]}`;
      if (!folders.has(k)) folders.set(k, {y:f[1], folder:f[2], files:[]});
      folders.get(k).files.push(f[3]);
    });
    const rows = [];
    for (const {y, folder, files} of folders.values()) {
      const dm = folder.match(/^(\d{1,2})(?:-\d{1,2})?[-_]/);
      const imgs = files.filter(x => IMG.test(x)).sort();
      if (!dm || !imgs.length) continue;
      const n = Number(dm[1]);
      day(y, n);
      const base = x => x.replace(/\.[^.]+$/, '');
      const img = imgs.find(x => base(x) === folder) || imgs[0];
      const codes = files.filter(x => /\.(R|py|js)$/i.test(x)).sort();
      const code = codes.find(x => base(x) === base(img)) || codes.find(x => base(x) === folder) || codes[0];
      const t = theme(y, n);
      const skip = new Set(t.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
      // Topic comes from the image name minus the day number and theme words.
      const s = base(img).split(/[-_ ]+/).filter(w => !/^\d{1,2}$/.test(w) && !skip.has(w.toLowerCase())).join(' ');
      const dir = `${y}/${folder}`;
      rows.push({d:`${y}-${pad(n)}-karamanis-${folder}`, m:'karamanis', y, n, t, s,
        i:RAW+enc(safe(`${dir}/${img}`)), c:code ? RAW+enc(safe(`${dir}/${code}`)) : undefined,
        g:code ? `https://github.com/${repo}/blob/main/${enc(`${dir}/${code}`)}` : `https://github.com/${repo}/tree/main/${enc(dir)}`,
        l:code ? (/\.py$/i.test(code) ? 'Python' : /\.js$/i.test(code) ? 'JavaScript' : 'R') : 'Other', p:''});
      if (!code) delete rows[rows.length-1].c;
    }
    return rows;
  }

  const SOURCES = [
    {id:'nrennie', name:'Nicola Rennie', repo:'nrennie/30DayMapChallenge', url:raw('nrennie/30DayMapChallenge')+'data/all_data.csv', min:60, parse:parseRennie},
    {id:'karamanis', name:'Georgios Karamanis', repo:'gkaramanis/30DayMapChallenge', url:'https://api.github.com/repos/gkaramanis/30DayMapChallenge/git/trees/main?recursive=1', min:60, parse:parseKaramanis},
  ];

  function parse(id, text, papa) {
    const src = SOURCES.find(s => s.id === id);
    if (!src) throw Error('Unknown source');
    const rows = src.parse(text, papa);
    if (!rows.length) throw Error('Empty catalogue');
    return rows;
  }
  function merge(previous, incoming) {
    const rows = new Map(previous.map(x => [x.d,x]));
    incoming.forEach(x => {
      const old = rows.get(x.d);
      // The snapshot knows exact script paths and packages; keep them over guesses.
      rows.set(x.d, old ? {...x, c:old.c ?? x.c, g:old.c ? old.g : x.g, p:old.p || x.p} : x);
      if (rows.get(x.d).c === undefined) delete rows.get(x.d).c;
    });
    return [...rows.values()].sort((a,b) => b.d.localeCompare(a.d));
  }
  function filter(rows, {year = 'all', maker = 'all', tool = 'all', query = ''} = {}) {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const name = id => SOURCES.find(s => s.id === id)?.name || id;
    return rows.filter(x => (year === 'all' || x.y === year) && (maker === 'all' || x.m === maker) && (tool === 'all' || x.l === tool) &&
      words.every(w => `${x.t} ${x.s || ''} day ${x.n} ${x.y} ${x.l} ${name(x.m)} ${x.p || ''}`.toLocaleLowerCase().includes(w)));
  }
  const api = {SOURCES, parse, merge, filter, theme};
  if (typeof module !== 'undefined') module.exports = api;
  else root.GalleryCatalog = api;
})(globalThis);
