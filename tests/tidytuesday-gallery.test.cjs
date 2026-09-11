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
