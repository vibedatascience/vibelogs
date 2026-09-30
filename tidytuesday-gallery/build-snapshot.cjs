#!/usr/bin/env node
/* Rebuild tidytuesday-gallery/snapshot.js.
   Usage: node tidytuesday-gallery/build-snapshot.cjs <gkaramanis/tidytuesday clone> [nrennie/tidytuesday clone]
   Rennie rows come from her data/all_weeks.csv (it already lists packages), merged over the current snapshot.
   Karamanis rows come from his repo tree; each week's README supplies the official TidyTuesday date
   and the featured plot, and packages are read from the chosen script. A partial clone
   (--filter=blob:none --no-checkout) is enough: only READMEs and chosen scripts are fetched. */
const fs = require('fs'), path = require('path'), {execFileSync} = require('child_process');
const {parse, merge} = require('./catalog.js');
const [dir, rennieDir] = process.argv.slice(2);
const Papa = require('papaparse');
if (!dir) { console.error('usage: build-snapshot.cjs <karamanis clone>'); process.exit(1); }
const git = (...a) => execFileSync('git', ['-C', dir, ...a], {encoding:'utf8', maxBuffer:1 << 26});
const show = p => { try { return git('show', `HEAD:${p}`); } catch { return null; } };
const RAW = 'https://raw.githubusercontent.com/gkaramanis/tidytuesday/master/';
const rel = u => decodeURIComponent(u.slice(RAW.length));
const enc = p => p.split('/').map(encodeURIComponent).join('/');

global.window = {};
eval(fs.readFileSync(path.join(__dirname, 'snapshot.js'), 'utf8'));
let rennie = window.GALLERY_SNAPSHOT.filter(x => (x.m || 'nrennie') === 'nrennie').map(x => ({...x, k:`${x.d}-nrennie`, m:'nrennie'}));
if (rennieDir) rennie = merge(rennie, parse('nrennie', execFileSync('git', ['-C', rennieDir, 'show', 'HEAD:data/all_weeks.csv'], {encoding:'utf8'}), Papa));

function packages(p, src) {
  if (!src) return '';
  const names = /\.py$/i.test(p)
    ? [...src.matchAll(/^\s*(?:import|from)\s+([A-Za-z0-9_]+)/gm)].map(m => m[1])
    : [...[...src.matchAll(/(?:library|require)\(\s*["']?([A-Za-z0-9.]+)/g), ...src.matchAll(/\b([A-Za-z][A-Za-z0-9.]+)::/g)].map(m => m[1]),
       ...[...src.matchAll(/p_load\(([^)]*)\)/g)].flatMap(m => m[1].replace(/#.*$/gm, '').split(',').map(s => s.trim()).filter(s => /^[A-Za-z][A-Za-z0-9.]*$/.test(s)))];
  return [...new Set(names.filter(n => !['base', 'utils', 'stats', 'grDevices', 'tools', 'pacman'].includes(n)))].join(', ');
}

const files = git('ls-tree', '-r', '--name-only', 'HEAD').trim().split('\n');
const tree = {tree: files.map(p => ({path:p, type:'blob'}))};
const have = new Set(files);
let fixedDate = 0, fixedImg = 0;
const karamanis = parse('karamanis', JSON.stringify(tree)).map(r => {
  const folder = r.k.slice('karamanis:'.length);
  const readme = show(`${folder}/README.md`) || '';
  const date = readme.match(/tidytuesday\/(?:tree|blob)\/(?:master|main)\/data\/\d{4}\/(\d{4}-\d{2}-\d{2})/);
  if (date && date[1] !== r.d) { r = {...r, d:date[1], y:date[1].slice(0,4)}; fixedDate++; }
  const img = readme.match(/!\[[^\]]*\]\(([^)\s]+\.(?:png|jpe?g|gif|webp))\)/i);
  const imgPath = img && path.posix.normalize(`${folder}/${decodeURIComponent(img[1])}`);
  if (imgPath && have.has(imgPath) && RAW + enc(imgPath) !== r.i) { r = {...r, i:RAW + enc(imgPath)}; fixedImg++; }
  return r.c ? {...r, p:packages(rel(r.c), show(rel(r.c)))} : r;
});
const rows = merge([], [...rennie, ...karamanis]);
fs.writeFileSync(path.join(__dirname, 'snapshot.js'), 'window.GALLERY_SNAPSHOT = ' + JSON.stringify(rows, null, 2) + ';\n');
console.log(`${rows.length} plots: ${rennie.length} nrennie, ${karamanis.length} karamanis (README fixed ${fixedDate} dates, ${fixedImg} plots)`);
