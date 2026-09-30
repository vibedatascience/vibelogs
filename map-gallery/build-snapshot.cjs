#!/usr/bin/env node
/* Rebuild map-gallery/snapshot.js from local clones of every source repo.
   Usage: node map-gallery/build-snapshot.cjs <clones dir>
   The clones dir holds one clone per source, named owner_repo (e.g. gkaramanis_30DayMapChallenge).
   Partial clones are fine (git clone --filter=blob:none --no-checkout): only the chosen scripts are fetched.
   The snapshot adds what live indexes lack: exact script paths and the packages each script loads. */
const fs = require('fs'), path = require('path'), {execFileSync} = require('child_process');
const Papa = require('papaparse');
const {SOURCES, parse, merge} = require('./catalog.js');
const clones = process.argv[2];
if (!clones) { console.error('usage: build-snapshot.cjs <clones dir>'); process.exit(1); }

const git = (dir, ...args) => execFileSync('git', ['-C', dir, ...args], {encoding:'utf8', maxBuffer:1 << 26});
const show = (dir, p) => { try { return git(dir, 'show', `HEAD:${p}`); } catch { return null; } };
const rel = (src, url) => decodeURIComponent(url.slice(src.raw.length));

function packages(p, src) {
  if (!src) return '';
  let code = src;
  if (/\.ipynb$/i.test(p)) {
    try { code = JSON.parse(src).cells.filter(c => c.cell_type === 'code').map(c => [].concat(c.source).join('')).join('\n'); } catch { return ''; }
  }
  const names = /\.(py|ipynb)$/i.test(p)
    ? [...code.matchAll(/^\s*(?:import|from)\s+([A-Za-z0-9_]+)/gm)].map(m => m[1])
    : [...code.matchAll(/(?:library|require)\(\s*["']?([A-Za-z0-9.]+)/g), ...code.matchAll(/\b([A-Za-z][A-Za-z0-9.]+)::/g)].map(m => m[1]);
  return [...new Set(names.filter(n => !['base', 'utils', 'stats', 'grDevices', 'tools'].includes(n)))].join(', ');
}

const all = [], counts = [];
for (const src of SOURCES) {
  const dir = path.join(clones, src.repo.replace('/', '_'));
  if (!fs.existsSync(dir)) { console.error(`missing clone: ${dir}`); process.exit(1); }
  let rows;
  if (src.csv) {
    rows = parse(src.id, show(dir, src.csv), Papa);
    const files = new Set(git(dir, 'ls-tree', '-r', '--name-only', 'HEAD').trim().split('\n'));
    // The CSV only lets us guess script paths; check them against the repo.
    rows = rows.map(r => {
      // Her index only knows .jpg and .png; find the image's real extension.
      const img = rel(src, r.i).replace(/\.[^.]+$/, '');
      const real = ['.png', '.jpg', '.jpeg', '.gif'].map(e => img + e).find(p => files.has(p));
      if (real) r = {...r, i:src.raw + real};
      if (!r.c) return r;
      const base = rel(src, r.c).replace(/\.[^.]+$/, '');
      const hit = ['.R', '.py', '.qmd', '.js'].map(e => base + e).find(p => files.has(p));
      if (!hit) { const {c, ...rest} = r; return rest; }
      return {...r, c:src.raw + hit, g:`https://github.com/${src.repo}/blob/${src.branch}/${hit}`};
    });
  } else {
    const tree = {tree: git(dir, 'ls-tree', '-r', '--name-only', 'HEAD').trim().split('\n').map(p => ({path:p, type:'blob'}))};
    rows = parse(src.id, JSON.stringify(tree));
  }
  rows = rows.map(r => r.c ? {...r, p:packages(rel(src, r.c), show(dir, rel(src, r.c)))} : r);
  counts.push(`${src.id} ${rows.length}`);
  all.push(...rows);
}
const rows = merge([], all);
fs.writeFileSync(path.join(__dirname, 'snapshot.js'), 'window.GALLERY_SNAPSHOT = ' + JSON.stringify(rows, null, 1) + ';\n');
console.log(`${rows.length} maps (${counts.join(', ')})`);
