/* TidyTuesday catalogue from several makers.
   Row shape: {k key, m maker, d date, y year, t title, i image, c code, g GitHub link, l language, p packages}.
   Nicola Rennie publishes data/all_weeks.csv. Georgios Karamanis has no index, so his repo tree is read:
   {year}/{year}-week_NN/ holds the script and the plot, and week NN is the ISO week of that TidyTuesday. */
(function(root) {
  const NRAW = 'https://raw.githubusercontent.com/nrennie/tidytuesday/main/';
  const KREPO = 'gkaramanis/tidytuesday', KRAW = `https://raw.githubusercontent.com/${KREPO}/master/`;
  const SOURCES = [
    {id:'nrennie', name:'Nicola Rennie', repo:'nrennie/tidytuesday', live:true, min:200, url:NRAW+'data/all_weeks.csv'},
    {id:'karamanis', name:'Georgios Karamanis', repo:KREPO, live:true, min:200, url:`https://api.github.com/repos/${KREPO}/git/trees/master?recursive=1`},
  ];
  const URL = SOURCES[0].url;
  const makerName = m => SOURCES.find(s => s.id === m)?.name || m;
  const enc = p => p.split('/').map(encodeURIComponent).join('/');
  const file = p => p.split('/').pop();
  const stem = p => file(p).replace(/\.[^.]+$/, '').toLowerCase();

  function path(value) {
    const clean = String(value || '').replace(/\/{2,}/g, '/');
    if (!/^\d{4}\/[\d-]+\/.+/.test(clean) || /[?#\\]/.test(clean) || clean.split('/').some(x => x === '.' || x === '..')) throw Error('Invalid catalogue path');
    return clean.split('/').map(encodeURIComponent).join('/');
  }
  function parseRennie(csv, papa) {
    const result = papa.parse(csv, {header:true, skipEmptyLines:'greedy'});
    if (result.errors.length || !result.meta.fields?.includes('img_fpath')) throw Error('Invalid catalogue');
    const rows = result.data.map(x => {
      let d = x.week;
      if (/^\d{2}-\d{2}-\d{4}$/.test(d)) d = d.split('-').reverse().join('-');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isFinite(Date.parse(d)) || new Date(d).toISOString().slice(0,10) !== d) throw Error('Invalid plot');
      const i = path(x.img_fpath), c = path(x.code_fpath);
      return {k:`${d}-nrennie`, m:'nrennie', d, y:d.slice(0,4), t:x.title?.trim() || `TidyTuesday · ${d}`, i:NRAW+i, c:NRAW+c,
        g:'https://github.com/nrennie/tidytuesday/tree/main/'+c.slice(0,c.lastIndexOf('/')),
        l:c.endsWith('.svelte') ? 'Svelte' : x.code_type || 'Other', p:x.pkgs || ''};
    });
    if (!rows.length) throw Error('Empty catalogue');
    return rows;
  }

  // Tuesday of ISO week w in year y, as YYYY-MM-DD.
  function isoTuesday(y, w) {
    const jan4 = Date.UTC(y, 0, 4), dow = (new Date(jan4).getUTCDay() + 6) % 7;
    return new Date(jan4 - dow*864e5 + (w-1)*7*864e5 + 864e5).toISOString().slice(0,10);
  }
  // Prefer the finished plot next to the script or in plots/; avoid making-of frames, drafts and tests.
  function imageScore(rel, codeStem) {
    const parts = rel.split('/'), s0 = stem(rel);
    let s = parts.length === 1 || (parts.length === 2 && parts[0] === 'plots') ? 2 : -2 * parts.length;
    if (codeStem && s0 === codeStem) s += 3;
    if (/making|frame|draft|test|old|preview|thumb|temp|tmp|sketch|wip|alt|social|square|insta/.test(s0)) s -= 3;
    return s;
  }
  function codeScore(rel) {
    const b = stem(rel);
    let s = rel.includes('/') ? -2 : 0;
    if (/clean|prep|data|scrape|get|download|helper|util|func|test|old/.test(b)) s -= 3;
    return s;
  }
  const best = (list, score) => list.slice().sort((a, b) => score(b) - score(a) || a.localeCompare(b))[0];
  const humanize = s => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();

  function parseKaramanis(text) {
    const tree = typeof text === 'string' ? JSON.parse(text) : text;
    if (!Array.isArray(tree?.tree)) throw Error('Invalid tree');
    const weeks = new Map();
    tree.tree.forEach(e => {
      const p = String(e.path);
      if (e.type !== 'blob' || /[?#\\]/.test(p) || p.split('/').some(x => !x || x === '.' || x === '..')) return;
      const m = p.match(/^(\d{4})\/(\d{4}-week[-_]?(\d{1,2})[^/]*)\/(.+)$/);
      if (!m || /(^|\/)data\//.test(m[4])) return;
      const key = `${m[1]}/${m[2]}`;
      if (!weeks.has(key)) weeks.set(key, {y:m[1], w:Number(m[3]), dir:key, imgs:[], codes:[]});
      if (/\.(png|jpe?g|gif|webp)$/i.test(m[4])) weeks.get(key).imgs.push(m[4]);
      else if (/\.(R|py|qmd|Rmd|js)$/i.test(m[4])) weeks.get(key).codes.push(m[4]);
    });
    const rows = [];
    for (const {y, w, dir, imgs, codes} of weeks.values()) {
      if (!imgs.length || !(w >= 1 && w <= 53)) continue;
      const code = codes.length ? best(codes, codeScore) : null;
      const img = best(imgs, r => imageScore(r, code && stem(code)));
      const d = isoTuesday(Number(y), w);
      if (d.slice(0,4) !== y && w > 1) continue;
      const row = {k:`karamanis:${dir}`, m:'karamanis', d, y:d.slice(0,4), t:humanize(stem(img)), i:KRAW+enc(`${dir}/${img}`),
        g:`https://github.com/${KREPO}/tree/master/${enc(dir)}`,
        l:!code ? 'Other' : /\.py$/i.test(code) ? 'Python' : /\.js$/i.test(code) ? 'JavaScript' : 'R', p:''};
      if (code) row.c = KRAW + enc(`${dir}/${code}`);
      rows.push(row);
    }
    if (!rows.length) throw Error('Empty catalogue');
    return rows;
  }

  // parse(csv, Papa) keeps the original nrennie signature; parse(id, text, Papa) selects a source.
  function parse(a, b, c) {
    if (typeof b !== 'string' && SOURCES.every(s => s.id !== a)) return parseRennie(a, b);
    if (a === 'nrennie') return parseRennie(b, c);
    if (a === 'karamanis') return parseKaramanis(b);
    throw Error('Unknown source');
  }
  function merge(previous, incoming) {
    const key = x => x.k || `${x.d}-${x.m || 'nrennie'}`;
    const rows = new Map(previous.map(x => [key(x), x]));
    incoming.forEach(x => {
      const old = rows.get(key(x));
      // Snapshot rows know packages, and for Karamanis the README-checked date, plot and script; keep them.
      const keep = old && x.m === 'karamanis' ? {d:old.d, y:old.y, i:old.i, c:old.c ?? x.c, g:old.g} : {};
      const row = old ? {...x, ...keep, p:x.p || old.p || ''} : x;
      if (row.c === undefined) delete row.c;
      rows.set(key(x), row);
    });
    return retitle([...rows.values()].sort((a,b) => b.d.localeCompare(a.d) || (a.m || '').localeCompare(b.m || '')));
  }
  // Karamanis rows only know file names; borrow the week's dataset title from Rennie when she has it.
  function retitle(rows) {
    const titles = new Map(rows.filter(x => (x.m || 'nrennie') === 'nrennie').map(x => [x.d, x.t]));
    return rows.map(x => x.m === 'karamanis' && titles.has(x.d) ? {...x, t:titles.get(x.d)} : x);
  }
  function filter(rows, year, language, query, maker = 'all') {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter(x => (year === 'all' || x.y === year) && (language === 'all' || x.l === language) && (maker === 'all' || (x.m || 'nrennie') === maker) &&
      words.every(w => `${x.t} ${x.d} ${x.l} ${makerName(x.m || 'nrennie')} ${x.p || ''}`.toLocaleLowerCase().includes(w)));
  }
  const api = {URL, SOURCES, parse, merge, filter, isoTuesday, makerName};
  if (typeof module !== 'undefined') module.exports = api;
  else root.GalleryCatalog = api;
})(globalThis);
