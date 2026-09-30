const {test} = require('node:test');
const assert = require('node:assert/strict');
const Papa = require('papaparse');
const {parse, merge, filter} = require('../map-gallery/catalog.js');
const RAW = 'https://raw.githubusercontent.com/nrennie/30DayMapChallenge/refs/heads/main/';
const header = 'year,prompt,number,tool,image_url\n';
const csv = header+`2025,Day 26 (Transport),26,R,${RAW}2025/maps/day_26.png\n2022,Day 29 (Out of Comfort Zone),29,Python,${RAW}2022/maps/day_29.png\n2025,Day 9 (Analog),09,pencil,${RAW}2025/maps/day_09.jpg`;
test('themes, day numbers, tools and guessed script paths', () => {
  const [a,b,c] = parse(csv,Papa);
  assert.equal(a.d,'2025-26'); assert.equal(a.t,'Transport'); assert.equal(a.n,26);
  assert.match(a.c,/2025\/scripts\/day_26\.R$/);
  assert.match(b.c,/2022\/scripts\/day_29\.py$/);
  assert.equal(c.l,'Hand-drawn'); assert.equal(c.c,undefined);
  assert.match(c.i,/main\/2025\/maps\/day_09\.jpg$/);
});
test('merge keeps snapshot script paths and packages, sorts newest first', () => {
  const incoming = parse(csv,Papa);
  const old = [{d:'2021-01',y:'2021',n:1,t:'Points'}, {...incoming[0],t:'Old',c:'exact.R',p:'sf, osmdata'}];
  const rows = merge(old,incoming);
  assert.equal(rows.length,4); assert.equal(rows[0].d,'2025-26');
  assert.equal(rows[0].t,'Transport'); assert.equal(rows[0].c,'exact.R'); assert.equal(rows[0].p,'sf, osmdata');
  assert.equal(rows[3].t,'Points');
});
test('search covers theme, day, package, year and tool', () => {
  const rows = merge([{...parse(csv,Papa)[0],p:'osmdata, sf'}],parse(csv,Papa));
  assert.equal(filter(rows,'all','all','transport osmdata').length,1);
  assert.equal(filter(rows,'all','all','day 29').length,1);
  assert.equal(filter(rows,'2022','Python','').length,1);
  assert.equal(filter(rows,'2025','R','comfort').length,0);
});
test('reject malformed, empty and unsafe exports', () => {
  for (const text of ['<html>error</html>',header,csv.replace('2025/maps/day_26.png','2025/../secret.png'),csv.replace(',26,R',',31,R'),csv+'\ninvalid,row']) {
    assert.throws(() => parse(text,Papa));
  }
});
