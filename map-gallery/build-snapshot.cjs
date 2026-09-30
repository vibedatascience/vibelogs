#!/usr/bin/env node
/* Rebuild map-gallery/snapshot.js from local clones of each source repo.
   Usage: node map-gallery/build-snapshot.cjs <nrennie clone> <karamanis clone>
   The snapshot adds what the live indexes lack: exact script paths and the packages each script loads. */
const fs = require('fs'), path = require('path'), {execFileSync} = require('child_process');
const Papa = require('papaparse');
const {parse, merge} = require('./catalog.js');
const [rennieDir, karamanisDir] = process.argv.slice(2);
if (!rennieDir || !karamanisDir) { console.error('usage: build-snapshot.cjs <nrennie clone> <karamanis clone>'); process.exit(1); }

function packages(file) {
  if (!fs.existsSync(file)) return '';
  const src = fs.readFileSync(file, 'utf8');
  const names = /\.py$/i.test(file)
    ? [...src.matchAll(/^\s*(?:import|from)\s+([A-Za-z0-9_]+)/gm)].map(m => m[1])
    : [...src.matchAll(/(?:library|require)\(\s*["']?([A-Za-z0-9.]+)/g), ...src.matchAll(/\b([A-Za-z][A-Za-z0-9.]+)::/g)].map(m => m[1]);
  return [...new Set(names.filter(n => !['base', 'utils', 'stats', 'grDevices'].includes(n)))].join(', ');
}
function local(dir, url) {
  return url ? path.join(dir, decodeURIComponent(url.replace(/^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/main\//, ''))) : null;
}

// Nicola Rennie: live CSV, then fix script extensions against the real files.
const rennie = parse('nrennie', fs.readFileSync(path.join(rennieDir, 'data/all_data.csv'), 'utf8'), Papa).map(r => {
  if (!r.c) return r;
  const base = r.c.replace(/\.[^.]+$/, '');
  const hit = ['.R', '.py', '.qmd', '.js'].map(e => base + e).find(u => fs.existsSync(local(rennieDir, u)));
  if (!hit) { const {c, ...rest} = r; return {...rest, g:`https://github.com/nrennie/30DayMapChallenge/tree/main/${r.y}`}; }
  return {...r, c:hit, g:`https://github.com/nrennie/30DayMapChallenge/blob/main/${hit.split('/main/').pop()}`, p:packages(local(rennieDir, hit))};
});

// Georgios Karamanis: the same tree shape the GitHub API returns.
const tree = {tree: execFileSync('git', ['-C', karamanisDir, 'ls-tree', '-r', '--name-only', 'HEAD'], {encoding:'utf8'})
  .trim().split('\n').map(p => ({path:p, type:'blob'}))};
const karamanis = parse('karamanis', JSON.stringify(tree)).map(r => ({...r, p:r.c ? packages(local(karamanisDir, r.c)) : ''}));

const rows = merge([], [...rennie, ...karamanis]);
fs.writeFileSync(path.join(__dirname, 'snapshot.js'), 'window.GALLERY_SNAPSHOT = ' + JSON.stringify(rows, null, 1) + ';\n');
console.log(`${rows.length} maps: ${rennie.length} nrennie, ${karamanis.length} karamanis`);
