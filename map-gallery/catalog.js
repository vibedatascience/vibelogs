/* Nicola Rennie's #30DayMapChallenge catalogue (data/all_data.csv) is rebuilt from her yearly READMEs. */
(function(root) {
  const RAW = 'https://raw.githubusercontent.com/nrennie/30DayMapChallenge/main/';
  const URL = RAW + 'data/all_data.csv';
  const HAND = new Set(['watercolour', 'watercolor', 'pen', 'pencil', 'paper', 'crochet']);
  function image(value) {
    const clean = String(value || '').split('/refs/heads/main/').pop().split('/main/').pop();
    if (!/^\d{4}\/maps\/day_\d{2}\.(png|jpe?g|gif)$/i.test(clean)) throw Error('Invalid image path');
    return clean;
  }
  function tool(value) {
    const t = String(value || '').trim();
    if (!t) return 'Other';
    return HAND.has(t.toLowerCase()) ? 'Hand-drawn' : t;
  }
  function parse(csv, papa) {
    const result = papa.parse(csv, {header:true, skipEmptyLines:'greedy'});
    if (result.errors.length || !['year','prompt','number','image_url'].every(f => result.meta.fields?.includes(f))) throw Error('Invalid catalogue');
    const rows = result.data.map(x => {
      const y = String(x.year || '').trim(), n = Number.parseInt(x.number, 10);
      if (!/^\d{4}$/.test(y) || !(n >= 1 && n <= 30)) throw Error('Invalid map');
      const nn = String(n).padStart(2, '0'), l = tool(x.tool);
      const m = String(x.prompt || '').trim().match(/^Day\s*\d+\s*\((.*)\)\s*$/i);
      const t = (m ? m[1] : String(x.prompt || '')).trim() || `Day ${n}`;
      const row = {d:`${y}-${nn}`, y, n, t, i:RAW+image(x.image_url), g:`https://github.com/nrennie/30DayMapChallenge/tree/main/${y}`, l, p:''};
      // The upstream CSV has no script column; scripts follow {year}/scripts/day_NN.{R,py}.
      if (l !== 'Hand-drawn' && l !== 'Tableau') {
        const code = `${y}/scripts/day_${nn}.${l === 'Python' ? 'py' : 'R'}`;
        row.c = RAW + code;
        row.g = `https://github.com/nrennie/30DayMapChallenge/blob/main/${code}`;
      }
      return row;
    });
    if (!rows.length) throw Error('Empty catalogue');
    return rows;
  }
  function merge(previous, incoming) {
    const rows = new Map(previous.map(x => [x.d,x]));
    incoming.forEach(x => {
      const old = rows.get(x.d);
      // The snapshot knows exact script paths and packages; keep them over guesses.
      rows.set(x.d, old ? {...x, c:old.c ?? x.c, g:old.c ? old.g : x.g, p:old.p || x.p} : x);
    });
    return [...rows.values()].sort((a,b) => b.d.localeCompare(a.d));
  }
  function filter(rows, year, language, query) {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter(x => (year === 'all' || x.y === year) && (language === 'all' || x.l === language) && words.every(w => `${x.t} day ${x.n} ${x.y} ${x.l} ${x.p || ''}`.toLocaleLowerCase().includes(w)));
  }
  const api = {URL, parse, merge, filter};
  if (typeof module !== 'undefined') module.exports = api;
  else root.GalleryCatalog = api;
})(globalThis);
