'use strict';

const Discovery = (() => {
  const topics = {
    ai: {label: 'AI', queries: ['artificial intelligence', 'machine learning', 'LLM', 'AI']},
    programming: {label: 'Programming', queries: ['programming', 'compiler', 'database', 'Linux']},
    data: {label: 'Data science', queries: ['data science', 'statistics', 'visualization', 'data analysis']},
    science: {label: 'Science', queries: ['physics', 'biology', 'astronomy', 'chemistry']},
    design: {label: 'Design', queries: ['graphic design', 'typography', 'interface design', 'usability']},
    history: {label: 'History', queries: ['history', 'archaeology', 'ancient', 'historical']},
    economics: {label: 'Economics', queries: ['economics', 'monetary policy', 'trade policy', 'economic inequality']},
    books: {label: 'Books', queries: ['books', 'literature', 'novelist', 'publishing']},
    cities: {label: 'Cities', queries: ['urban', 'cities', 'transit', 'housing']}
  };
  const pageSize = 30;

  function period(today, kind) {
    const date = new Date(today + 'T00:00:00Z');
    if (kind === 'all') return {from: '', to: ''};
    if (kind === 'week') date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    else if (kind === 'month') date.setUTCDate(1);
    else if (kind === 'year') date.setUTCMonth(0, 1);
    else throw new Error('Unknown period');
    return {from: [date.toISOString().slice(0, 10), '2007-02-19'].sort().at(-1), to: today};
  }

  function canonicalURL(story) {
    try {
      const url = new URL(story.url);
      if (!['http:', 'https:'].includes(url.protocol)) return 'item:' + story.id;
      url.hash = '';
      for (const key of [...url.searchParams.keys()]) {
        if (/^utm_/i.test(key) || ['fbclid', 'gclid'].includes(key)) url.searchParams.delete(key);
      }
      url.searchParams.sort();
      return url.hostname.toLowerCase().replace(/^www\./, '') + url.pathname.replace(/\/$/, '') + url.search;
    } catch { return 'item:' + story.id; }
  }
  function source(story) {
    try { return new URL(story.url).hostname.replace(/^www\./, ''); }
    catch { return 'news.ycombinator.com'; }
  }
  function unique(stories, previous = []) {
    const ids = new Set(previous.map(it => it.id)), urls = new Set(previous.map(canonicalURL));
    return stories.filter(it => {
      const url = canonicalURL(it);
      if (ids.has(it.id) || urls.has(url)) return false;
      ids.add(it.id); urls.add(url); return true;
    });
  }
  function normalize(data) {
    if (!Array.isArray(data.hits) || !Number.isInteger(data.nbPages) || data.nbPages < 0) throw new Error('Search returned an invalid response.');
    return data.hits.filter(h => h.title && /^\d+$/.test(h.objectID) && Number.isFinite(h.created_at_i)).map(h => ({
      id: Number(h.objectID), title: h.title, url: h.url, score: h.points ?? 0,
      by: h.author, time: h.created_at_i, descendants: h.num_comments ?? 0
    }));
  }
  function params(query, r, page = 0) {
    const p = new URLSearchParams({tags: 'story', query, hitsPerPage: String(pageSize), page: String(page),
      restrictSearchableAttributes: 'title', queryType: 'prefixNone', typoTolerance: 'false', removeWordsIfNoResults: 'none'});
    if (r.from) {
      const start = Date.parse(r.from + 'T00:00:00Z') / 1000;
      const end = Date.parse(r.to + 'T00:00:00Z') / 1000 + 86400;
      p.set('numericFilters', `created_at_i>=${start},created_at_i<${end}`);
    }
    return p;
  }

  async function topicPage(list, r, request, signal) {
    const queries = topics[r.interest].queries;
    const streams = (list.topicPages || queries.map(() => ({page: 0, more: true, buffer: []})))
      .map(s => ({...s, buffer: [...s.buffer]}));
    const chosen = [], ids = new Set(list.stories.map(it => it.id)), urls = new Set(list.stories.map(canonicalURL));
    const compare = r.sort === 'newest' ? (a, b) => b.time - a.time || b.score - a.score : (a, b) => b.score - a.score || b.time - a.time;
    let waves = 0;
    while (chosen.length < pageSize) {
      const empty = streams.map((stream, index) => ({stream, index})).filter(({stream}) => !stream.buffer.length && stream.more);
      if (empty.length) {
        // Bound work even when many search pages contain the same submitted links.
        if (waves++ === 3) break;
        await Promise.all(empty.map(async ({stream, index}) => {
          const data = await request(r.sort === 'newest' ? 'search_by_date' : 'search', params(queries[index], r, stream.page), signal);
          stream.buffer = normalize(data).sort(compare);
          stream.page++;
          stream.more = stream.page < data.nbPages;
        }));
        if (streams.some(stream => !stream.buffer.length && stream.more)) continue;
      }
      const available = streams.filter(stream => stream.buffer.length).sort((a, b) => compare(a.buffer[0], b.buffer[0]));
      if (!available.length) break;
      const it = available[0].buffer.shift(), url = canonicalURL(it);
      if (!ids.has(it.id) && !urls.has(url)) { chosen.push({...it, discoveryTopic: r.interest}); ids.add(it.id); urls.add(url); }
    }
    return {stories: chosen, topicPages: streams, page: list.page + 1,
      more: streams.some(stream => stream.buffer.length || stream.more)};
  }

  function random(seed) {
    let value = 2166136261;
    for (const c of seed) value = Math.imul(value ^ c.charCodeAt(0), 16777619);
    return () => {
      value += 0x6D2B79F5;
      let t = Math.imul(value ^ value >>> 15, 1 | value);
      t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffled(values, rand) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function mixPlan(seed, today) {
    const rand = random(seed), lastYear = Number(today.slice(0, 4)) - 1;
    // Older links are more likely to have disappeared; keep the mix to the last 12 completed years.
    const firstYear = Math.max(2008, lastYear - 11);
    const years = shuffled(Array.from({length: Math.max(1, lastYear - firstYear + 1)}, (_, i) => firstYear + i), rand);
    return shuffled(Object.keys(topics), rand).slice(0, 5).map((interest, i) => ({
      interest, year: years[i % years.length], queries: shuffled(topics[interest].queries, rand)
    }));
  }
  async function surprise(seed, today, request, signal) {
    const plans = mixPlan(seed, today);
    const pools = await Promise.all(plans.map(async plan => {
      const range = {from: `${plan.year}-01-01`, to: `${plan.year}-12-31`};
      const p = params(plan.queries[0], range);
      p.set('numericFilters', p.get('numericFilters') + ',points>=50,num_comments>=5');
      let stories = normalize(await request('search', p, signal));
      if (!stories.length) {
        const fallback = params(plan.queries[1], {from: `${Math.max(2008, Number(today.slice(0, 4)) - 12)}-01-01`, to: `${Number(today.slice(0, 4)) - 1}-12-31`});
        fallback.set('numericFilters', fallback.get('numericFilters') + ',points>=50,num_comments>=5');
        stories = normalize(await request('search', fallback, signal));
      }
      return shuffled(unique(stories), random(seed + ':' + plan.interest));
    }));
    const chosen = [], hosts = new Set(), years = new Set();
    for (const [index, pool] of pools.entries()) {
      const candidates = unique(pool, chosen).filter(it => !hosts.has(source(it)));
      const it = candidates.find(it => !years.has(new Date(it.time * 1000).getUTCFullYear())) || candidates[0];
      if (it) { chosen.push({...it, discoveryTopic: plans[index].interest}); hosts.add(source(it)); years.add(new Date(it.time * 1000).getUTCFullYear()); }
    }
    return {stories: chosen, more: false, page: 1};
  }

  return {topics, period, canonicalURL, mixPlan, topicPage, surprise};
})();
