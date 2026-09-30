const {test} = require('node:test');
const assert = require('node:assert/strict');
const Papa = require('papaparse');
const {SOURCES, parse, merge, filter, theme, makerName} = require('../map-gallery/catalog.js');
const RAW = 'https://raw.githubusercontent.com/nrennie/30DayMapChallenge/refs/heads/main/';
const header = 'year,prompt,number,tool,image_url\n';
const csv = header+`2025,Day 26 (Transport),26,R,${RAW}2025/maps/day_26.png\n2022,Day 29 (Out of Comfort Zone),29,Python,${RAW}2022/maps/day_29.png\n2025,Day 9 (Analog),09,pencil,${RAW}2025/maps/day_09.jpg`;
const tree = paths => JSON.stringify({tree: paths.map(path => ({path, type:'blob'}))});
const karamanis = tree([
  '2024/02-lines-euroleague_movements/02-lines-euroleague-movements-2.png',
  '2024/02-lines-euroleague_movements/02-lines-euroleague-movements-1.png',
  '2024/02-lines-euroleague_movements/02-lines-euroleague-movements.R',
  '2024/30-final-basketglobe/basketball8.png',
  '2024/30-final-basketglobe/30-final-basketglobe.png',
  '2024/30-final-basketglobe/30-final-basketglobe.R',
  '2021/14-new-tool/14-new-tool-geotype.png',
  '2021/09-monochrome/deprecated/09-monochrome-elevation.R',
  '2021/data/country-centroids.csv',
  '2021/21-elevation/blender files/render.png',
  'README.md',
]);

test('sources: unique ids, live index URLs, shared makers and themes', () => {
  assert.equal(new Set(SOURCES.map(s => s.id)).size, SOURCES.length);
  assert.deepEqual(SOURCES.filter(s => s.live).map(s => s.id), ['nrennie','karamanis']);
  assert.match(SOURCES.find(s => s.id === 'karamanis').url, /api\.github\.com\/repos\/gkaramanis\/30DayMapChallenge\/git\/trees\/main\?recursive=1$/);
  assert.equal(SOURCES.find(s => s.id === 'olive').raw, 'https://raw.githubusercontent.com/xoolive/30DayMapChallenge/master/');
  assert.equal(makerName('wolsing'), 'Ansgar Wolsing');
  assert.equal(theme('2024', 5), 'A journey');
  assert.equal(theme('2019', 10), 'Black & White');
  assert.equal(theme('2031', 5), 'Day 5');
});
test('nrennie CSV: themes, days, tools and guessed script paths', () => {
  const [a,b,c] = parse('nrennie', csv, Papa);
  assert.equal(a.d,'2025-26-nrennie'); assert.equal(a.m,'nrennie'); assert.equal(a.t,'Transport'); assert.equal(a.n,26);
  assert.match(a.c,/2025\/scripts\/day_26\.R$/);
  assert.match(b.c,/2022\/scripts\/day_29\.py$/);
  assert.equal(c.l,'Hand-drawn'); assert.equal(c.c,undefined);
});
test('folder-per-day tree: best image, script, official theme and topic', () => {
  const rows = parse('karamanis', karamanis);
  assert.equal(rows.length, 3);
  const lines = rows.find(r => r.n === 2), final = rows.find(r => r.n === 30), tool = rows.find(r => r.n === 14);
  assert.equal(lines.t, 'Lines'); assert.equal(lines.s, 'euroleague movements');
  assert.match(lines.i, /02-lines-euroleague-movements-1\.png$/);
  assert.match(lines.c, /02-lines-euroleague-movements\.R$/);
  assert.match(final.i, /30-final-basketglobe\.png$/);
  assert.equal(final.t, 'The final map'); assert.equal(final.s, 'basketglobe');
  assert.equal(tool.l, 'Other'); assert.equal('c' in tool, false);
  assert.match(tool.g, /tree\/main\/2021\/14-new-tool$/);
});
test('split plots/ and code/ trees match by day; helper scripts and insets lose', () => {
  const [r] = parse('schien', tree(['2022/plots/day_3/inset.png', '2022/plots/day_3/titled_upheaval_dome.png', '2022/plots/day_3/upheaval_dome_z14.png',
    '2022/R/day_3_polygons/markup.R', '2022/R/day_3_polygons/render_graphic.R', '2022/R/day_3_polygons/load_data.R']));
  assert.match(r.i, /titled_upheaval_dome\.png$/); assert.match(r.c, /render_graphic\.R$/);
  assert.equal(r.s, 'upheaval dome'); assert.equal(r.t, 'Polygons');
  const [w] = parse('wolsing-2021', tree(['plots/day05_osmdata_bike-lanes.png', 'R/day05-data_osm-bike-lanes.R']));
  assert.equal(w.y, '2021'); assert.equal(w.m, 'wolsing'); assert.equal(w.d, '2021-05-wolsing');
});
test('fixed-year sources, date folders, notebooks and odd paths', () => {
  const [h] = parse('hart', tree(['2023/11082023/ghana_kente_colors_08112023.png', '2023/11082023/ghana.R']));
  assert.equal(h.n, 8); assert.equal(h.t, 'Africa'); assert.equal(h.s, 'ghana kente colors');
  const [o] = parse('olive', tree(['contributions/challenge_day07.gif', 'notebooks/challenge_day07.ipynb', 'data/30dmpc_2021.png']));
  assert.equal(o.y, '2021'); assert.equal(o.l, 'Python'); assert.equal(o.s, '');
  const [m] = parse('mills', tree(['2021/Day 01 - Points/Manhattan Spaces (Day 1 Points).png', '2021/Day 01 - Points/Day 1 (Points).R', '2021/Day 02 - Lines/bad#name.png']));
  assert.equal(m.s, 'Manhattan Spaces'); assert.match(m.i, /Manhattan%20Spaces%20\(Day%201%20Points\)\.png$/);
});
test('merge keeps snapshot script paths and packages, sorts newest first across makers', () => {
  const incoming = [...parse('nrennie', csv, Papa), ...parse('karamanis', karamanis)];
  const old = [{d:'2021-01-nrennie',m:'nrennie',y:'2021',n:1,t:'Points'}, {...incoming[0],t:'Old',i:'checked.jpeg',c:'exact.R',p:'sf, osmdata'}];
  const rows = merge(old, incoming);
  assert.equal(rows.length, 7);
  assert.equal(rows[0].d, '2025-26-nrennie'); assert.equal(rows[0].i, 'checked.jpeg'); assert.equal(rows[0].c, 'exact.R'); assert.equal(rows[0].p, 'sf, osmdata');
  assert.equal(rows.at(-1).t, 'Points');
});
test('search and filters cover theme, topic, maker, day, package, year and tool', () => {
  const rows = merge([{...parse('nrennie', csv, Papa)[0], p:'osmdata, sf'}], [...parse('nrennie', csv, Papa), ...parse('karamanis', karamanis)]);
  assert.equal(filter(rows, {query:'transport osmdata'}).length, 1);
  assert.equal(filter(rows, {query:'euroleague'}).length, 1);
  assert.equal(filter(rows, {query:'karamanis'}).length, 3);
  assert.equal(filter(rows, {maker:'karamanis', year:'2024'}).length, 2);
  assert.equal(filter(rows, {year:'2022', tool:'Python'}).length, 1);
  assert.equal(filter(rows, {maker:'nrennie', query:'basketglobe'}).length, 0);
});
test('reject malformed, empty and unsafe indexes', () => {
  for (const text of ['<html>error</html>', header, csv.replace('2025/maps/day_26.png','2025/../secret.png'), csv.replace(',26,R',',31,R'), csv+'\ninvalid,row']) {
    assert.throws(() => parse('nrennie', text, Papa));
  }
  assert.throws(() => parse('karamanis', '{"message":"API rate limit exceeded"}'));
  assert.throws(() => parse('karamanis', '{"tree":[]}'));
  assert.throws(() => parse('nobody', ''));
});
