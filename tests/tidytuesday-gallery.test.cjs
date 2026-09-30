const {test} = require('node:test');
const assert = require('node:assert/strict');
const Papa = require('papaparse');
const {parse, merge, filter} = require('../tidytuesday-gallery/catalog.js');
const header = 'week,title,img_fpath,code_fpath,code_type,pkgs\n';
const csv = header+'01-06-2021,"A title, with commas",2021/01-06-2021///01062021.jpg,2021/01-06-2021/01062021.R,R,"ggplot2, sf"\n2027-01-05,New plot,2027/2027-01-05/plot.png,2027/2027-01-05/+page.svelte,JavaScript,SveltePlot';
test('upstream dates, quoted CSV, repeated slashes and Svelte paths', () => {
  const [a,b] = parse(csv,Papa);
  assert.equal(a.d,'2021-06-01');
  assert.equal(a.t,'A title, with commas');
  assert.match(a.i,/2021\/01-06-2021\/01062021.jpg$/);
  assert.match(a.g,/github.com\/nrennie\/tidytuesday\/tree\/main\//);
  assert.equal(b.l,'Svelte'); assert.equal(b.y,'2027');
  assert.match(b.c,/%2Bpage.svelte$/);
});
test('merge retains legacy years, updates existing plots and sorts latest first', () => {
  const incoming = parse(csv,Papa);
  const old = [{d:'2019-01-01',t:'Legacy'}, {...incoming[0],t:'Old title'}];
  const rows = merge(old,incoming);
  assert.equal(rows.length,3);assert.equal(rows[0].y,'2027');
  assert.equal(rows[1].t,incoming[0].t);assert.equal(rows[2].t,'Legacy');
});
test('search combines topic, package, date, language and year filters', () => {
  const rows = parse(csv,Papa);
  assert.equal(filter(rows,'2021','R','TITLE sf').length,1);
  assert.equal(filter(rows,'all','all','2027 svelte').length,1);
  assert.equal(filter(rows,'2027','R','').length,0);
});
test('reject malformed, empty, unsafe and impossible-date exports', () => {
  for (const text of ['<html>error</html>',header,csv.replace('01-06-2021','2021-02-30'),csv.replace('2021/01-06-2021///01062021.jpg','2021/01-06-2021/../other.jpg'),csv+'\ninvalid,row']) {
    assert.throws(() => parse(text,Papa));
  }
});

test('blank upstream titles use a readable date fallback', () => {
  const row = parse(header+'2026-09-08,,2026/2026-09-08/plot.png,2026/2026-09-08/plot.R,R,',Papa)[0];
  assert.equal(row.t,'TidyTuesday · 2026-09-08');
});

const {parse: parseAny, isoTuesday, SOURCES} = require('../tidytuesday-gallery/catalog.js');
const ktree = paths => JSON.stringify({tree: paths.map(path => ({path, type:'blob'}))});
test('ISO week folders map to that week\'s TidyTuesday', () => {
  assert.equal(isoTuesday(2026, 3), '2026-01-13');
  assert.equal(isoTuesday(2026, 1), '2025-12-30');
  assert.equal(isoTuesday(2023, 20), '2023-05-16');
  assert.equal(isoTuesday(2020, 2), '2020-01-07');
});
test('karamanis tree: every folder style, main plot and script, no making-of or cleaning scripts', () => {
  const rows = parseAny('karamanis', ktree([
    '2026/2026-week_03/README.md', '2026/2026-week_03/afica-cleaning-script.R', '2026/2026-week_03/africa_languages.R',
    '2026/2026-week_03/plots/africa_languages-making-of.mp4', '2026/2026-week_03/plots/africa_languages.png',
    '2020/2020-week04/deprecated/spotify-decades.R', '2020/2020-week04/plots/spotify-artists.png', '2020/2020-week04/plots/spotify.png',
    '2020/2020-week04/spotify-artists.R', '2020/2020-week04/spotify.R',
    '2019/2019-week-11/board_games.R', '2019/2019-week-11/gametitles.png', '2019/2019-week-11/data/raw.png',
    'yearly-roundup/2024.png', '2026/2026-week_09/README.md',
  ]));
  assert.equal(rows.length, 3);
  const a = rows.find(r => r.y === '2026'), s = rows.find(r => r.y === '2020'), b = rows.find(r => r.y === '2019');
  assert.equal(a.d, '2026-01-13'); assert.equal(a.k, 'karamanis:2026/2026-week_03'); assert.equal(a.m, 'karamanis');
  assert.match(a.i, /plots\/africa_languages\.png$/); assert.match(a.c, /\/africa_languages\.R$/);
  assert.match(s.i, /plots\/spotify-artists\.png$/); assert.match(s.c, /\/spotify-artists\.R$/);
  assert.equal(b.d, '2019-03-12'); assert.match(b.i, /gametitles\.png$/);
  assert.equal(SOURCES.find(x => x.id === 'karamanis').url, 'https://api.github.com/repos/gkaramanis/tidytuesday/git/trees/master?recursive=1');
});
test('karamanis rows take Rennie\'s dataset title for the same week and keep checked snapshot fields', () => {
  const k = parseAny('karamanis', ktree(['2021/2021-week21/plots/mario.png', '2021/2021-week21/mario.R']))[0];
  const r = parse(header+'2021-05-25,Mario Kart World Records,2021/2021-05-25/20210525.png,2021/2021-05-25/20210525.R,R,sf', Papa)[0];
  let rows = merge([], [r, k]);
  assert.equal(rows.find(x => x.m === 'karamanis').t, 'Mario Kart World Records');
  const snap = {...rows.find(x => x.m === 'karamanis'), d:'2021-05-26', i:'readme.png', p:'ggplot2'};
  rows = merge([r, snap], [k]);
  const again = rows.find(x => x.m === 'karamanis');
  assert.equal(again.d, '2021-05-26'); assert.equal(again.i, 'readme.png'); assert.equal(again.p, 'ggplot2');
  assert.equal(rows.length, 2);
  assert.equal(filter(rows, 'all', 'all', 'karamanis').length, 1);
  assert.equal(filter(rows, 'all', 'all', '', 'nrennie').length, 1);
});
test('karamanis rejects API errors and empty trees', () => {
  assert.throws(() => parseAny('karamanis', '{"message":"API rate limit exceeded"}'));
  assert.throws(() => parseAny('karamanis', ktree(['README.md'])));
  assert.throws(() => parseAny('nobody', 'x', Papa));
});
