const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../posts/hn-reader/discovery.js'), 'utf8');
const D = vm.runInNewContext(source + '\nDiscovery', {URL, URLSearchParams});
const plain = value => JSON.parse(JSON.stringify(value));
const signal = new AbortController().signal;
const hit = (id, time = id, url = `https://site${id}.example/article`) => ({objectID: String(id), title: `Article ${id}`, created_at_i: time, points: 500 - id, author: 'reader', num_comments: 12, url});
const emptyList = () => ({stories: [], page: 0});

test('periods use UTC calendar boundaries, including Sunday, leap day and New Year', () => {
  assert.deepEqual(plain(D.period('2026-09-13', 'week')), {from: '2026-09-07', to: '2026-09-13'});
  assert.deepEqual(plain(D.period('2026-01-01', 'week')), {from: '2025-12-29', to: '2026-01-01'});
  assert.deepEqual(plain(D.period('2024-02-29', 'month')), {from: '2024-02-01', to: '2024-02-29'});
  assert.deepEqual(plain(D.period('2026-09-11', 'year')), {from: '2026-01-01', to: '2026-09-11'});
  assert.deepEqual(plain(D.period('2026-09-11', 'all')), {from: '', to: ''});
});

test('topic requests cover every configured query and both UTC date boundaries', async () => {
  const calls = [];
  await D.topicPage(emptyList(), {interest: 'data', from: '2026-03-08', to: '2026-03-08', sort: 'newest'}, async (endpoint, params) => {
    calls.push({endpoint, query: params.get('query'), date: params.get('numericFilters'), fields: params.get('restrictSearchableAttributes')});
    return {hits: [], nbPages: 0};
  }, signal);
  assert.deepEqual(calls.map(c => c.query), plain(D.topics.data.queries));
  assert(calls.every(c => c.endpoint === 'search_by_date' && c.fields === 'title' && c.date === 'created_at_i>=1772928000,created_at_i<1773014400'));
});

test('topic paging merges streams chronologically without duplicate IDs or URLs', async () => {
  const queries = plain(D.topics.data.queries), calls = [];
  const all = queries.map((query, q) => Array.from({length: 45}, (_, i) => hit(q * 100 + i + 1, 10000 - i * 4 - q)));
  // Same article submitted twice, including a tracking URL, should appear once.
  all[1][0].url = all[0][0].url + '?utm_source=hn#section';
  all[2][0] = {...all[0][0]};
  const request = async (endpoint, params) => {
    const q = queries.indexOf(params.get('query')), page = Number(params.get('page'));
    calls.push([q, page]);
    return {hits: all[q].slice(page * 10, page * 10 + 10), nbPages: 5};
  };
  const list = emptyList();
  for (let i = 0; i < 20; i++) {
    const data = await D.topicPage(list, {interest: 'data', sort: 'newest'}, request, signal);
    list.stories.push(...data.stories); list.topicPages = data.topicPages; list.page = data.page;
    if (!data.more) break;
  }
  assert.equal(list.stories.length, 178);
  assert.equal(new Set(list.stories.map(it => it.id)).size, 178);
  assert.equal(new Set(list.stories.map(D.canonicalURL)).size, 178);
  assert(list.stories.every((it, i, list) => i === 0 || list[i - 1].time >= it.time));
  assert.equal(new Set(calls.map(JSON.stringify)).size, calls.length, 'Stream pages must not be requested twice');
});

test('failed topic requests leave cached pages intact so retry cannot skip results', async () => {
  const list = emptyList(), before = JSON.stringify(list);
  await assert.rejects(D.topicPage(list, {interest: 'science'}, async () => { throw new Error('offline'); }, signal), /offline/);
  assert.equal(JSON.stringify(list), before);
  const data = await D.topicPage(list, {interest: 'science'}, async () => ({hits: [hit(1)], nbPages: 1}), signal);
  assert.equal(data.stories.length, 1);
});

test('duplicate-heavy pages have a bounded request budget and remain pageable', async () => {
  let calls = 0;
  const data = await D.topicPage(emptyList(), {interest: 'science'}, async () => { calls++; return {hits: [hit(1)], nbPages: 1000}; }, signal);
  assert(calls <= 12);
  assert.equal(data.stories.length, 1);
  assert.equal(data.more, true);
});

test('mix plans span five distinct topics and completed years', () => {
  const plan = plain(D.mixPlan('savedmix', '2026-09-11'));
  assert.equal(new Set(plan.map(p => p.interest)).size, 5);
  assert.equal(new Set(plan.map(p => p.year)).size, 5);
  assert(plan.every(p => p.year >= 2014 && p.year <= 2025));
  assert.deepEqual(plan, plain(D.mixPlan('savedmix', '2026-09-11')));
});

test('mix selection is stable despite network timing and uses unique sources', async () => {
  const plan = plain(D.mixPlan('savedmix', '2026-09-11'));
  const request = reverse => async (_, params) => {
    const index = plan.findIndex(p => p.queries[0] === params.get('query'));
    assert(index >= 0);
    assert.match(params.get('numericFilters'), /points>=50,num_comments>=5/);
    await new Promise(resolve => setTimeout(resolve, (reverse ? 5 - index : index) * 2));
    const time = Date.parse(`${plan[index].year}-06-01T00:00:00Z`) / 1000;
    return {hits: [hit(index * 10 + 1, time, 'https://same.example/shared'), hit(index * 10 + 2, time), hit(index * 10 + 3, time)], nbPages: 1};
  };
  const a = await D.surprise('savedmix', '2026-09-11', request(false), signal);
  const b = await D.surprise('savedmix', '2026-09-11', request(true), signal);
  assert.deepEqual(plain(a), plain(b));
  assert.equal(a.stories.length, 5);
  assert.equal(new Set(a.stories.map(it => new URL(it.url).hostname)).size, 5);
  assert.equal(new Set(a.stories.map(it => new Date(it.time * 1000).getUTCFullYear())).size, 5);
  assert.equal(a.more, false);
});

test('sparse mixes try alternate queries without inventing matches', async () => {
  let calls = 0;
  const data = await D.surprise('empty', '2026-09-11', async () => { calls++; return {hits: [], nbPages: 0}; }, signal);
  assert.equal(calls, 10);
  assert.equal(data.stories.length, 0);
});
