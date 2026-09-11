'use strict';

const FB = 'https://hacker-news.firebaseio.com/v0';
const ALG = 'https://hn.algolia.com/api/v1';
const FEEDS = {top: 'topstories', new: 'newstories', best: 'beststories', ask: 'askstories', show: 'showstories', jobs: 'jobstories'};
const CATS = ['show hn', 'ask hn', 'code', 'paper', 'blog', 'news', 'ai', 'older', 'other'];
const NEWS = ['bbc.com', 'reuters.com', 'theguardian.com', 'nytimes.com', 'wsj.com', 'ft.com', 'bloomberg.com', 'techcrunch.com', 'arstechnica.com', 'theverge.com', 'wired.com', 'economist.com', 'cnbc.com', 'theregister.com', '404media.co', 'theatlantic.com', 'apnews.com', 'cnn.com', 'washingtonpost.com'];
const BLOGS = ['substack.com', 'bearblog.dev', 'github.io', 'wordpress.com', 'blogspot.com', 'neocities.org', 'micro.blog', 'write.as'];
const PAGE = 30;
const $ = s => document.querySelector(s);
const main = $('#main');
const today = new Date().toISOString().slice(0, 10);
const items = new Map();
const lists = new Map();
let route, controller, previewController, generation = 0, activeList;

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
}
function safeURL(value) {
  try {
    const url = new URL(value, 'https://news.ycombinator.com/');
    return value && ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
function domain(value) {
  try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return ''; }
}
function ago(time) {
  if (!Number.isFinite(time)) return 'unknown time';
  const seconds = Math.max(0, Date.now() / 1000 - time);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 86400 * 7) return Math.floor(seconds / 86400) + 'd ago';
  return new Date(time * 1000).toISOString().slice(0, 10);
}
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value && value >= '2007-02-19' && value <= today;
}
function shiftDay(value, amount) {
  return new Date(Date.parse(value + 'T00:00:00Z') + amount * 86400000).toISOString().slice(0, 10);
}
function yearAgo(value) {
  const date = new Date(value + 'T00:00:00Z'), month = date.getUTCMonth();
  date.setUTCFullYear(date.getUTCFullYear() - 1);
  // February 29 becomes February 28 when the previous year is not a leap year.
  if (date.getUTCMonth() !== month) date.setUTCDate(0);
  return date.toISOString().slice(0, 10);
}
function dateLabel(value) {
  return new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'}).format(new Date(value + 'T00:00:00Z'));
}
function parseRoute() {
  const [feed, query = ''] = location.hash.slice(1).split('?');
  const p = new URLSearchParams(query);
  const from = p.get('from') || '', to = p.get('to') || '';
  const datesOK = validDate(from) && validDate(to) && from <= to;
  return {
    feed: Object.hasOwn(FEEDS, feed) ? feed : 'top', q: (p.get('q') || '').trim().slice(0, 300),
    from: datesOK ? from : '', to: datesOK ? to : '', sort: p.get('sort') === 'newest' ? 'newest' : 'popular',
    topic: CATS.includes(p.get('topic')) ? p.get('topic') : '',
    story: /^\d{1,12}$/.test(p.get('story') || '') ? p.get('story') : ''
  };
}
function hashFor(r) {
  const p = new URLSearchParams();
  for (const k of ['q', 'from', 'to', 'topic', 'story']) if (r[k]) p.set(k, r[k]);
  if (r.sort === 'newest' && (r.q || r.from)) p.set('sort', r.sort);
  return '#' + r.feed + (p.size ? '?' + p.toString() : '');
}
function listKey(r) { return JSON.stringify([r.feed, r.q, r.from, r.to, r.sort]); }
function isArchive(r) { return Boolean(r.q || r.from); }
function saveScroll() { history.replaceState({...history.state, scroll: window.scrollY}, '', location.href); }
function navigate(next, focus = '') {
  saveScroll();
  const hash = hashFor(next);
  const returnHash = next.story && !route.story ? hashFor(route) : null;
  history.pushState({scroll: 0, returnHash, focus}, '', hash);
  renderRoute();
}
function current(g) { return g === generation && !controller.signal.aborted; }
function restoreScroll(scroll) {
  const g = generation;
  requestAnimationFrame(() => {
    if (current(g)) {
      window.scrollTo(0, scroll);
      const control = document.getElementById(history.state?.focus || '');
      (control && !control.disabled && control.getClientRects().length ? control : main).focus({preventScroll: true});
    }
  });
}
async function json(url, signal) {
  const local = new AbortController();
  const abort = () => local.abort();
  if (signal.aborted) abort();
  signal.addEventListener('abort', abort, {once: true});
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; local.abort(); }, 15000);
  try {
    const response = await fetch(url, {signal: local.signal});
    if (!response.ok) throw new Error('The data service returned HTTP ' + response.status + '.');
    return await response.json();
  } catch (error) {
    if (timedOut) throw new Error('The data service took too long to respond.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
  }
}
async function item(id, signal) {
  const key = String(id);
  if (items.has(key)) return items.get(key);
  const value = await json(`${FB}/item/${key}.json`, signal);
  if (value) {
    items.set(key, value);
    if (items.size > 2000) items.delete(items.keys().next().value);
  }
  return value;
}
async function batch(ids, signal) {
  const result = new Array(ids.length);
  let cursor = 0;
  await Promise.all(Array.from({length: Math.min(6, ids.length)}, async () => {
    while (cursor < ids.length) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const i = cursor++;
      result[i] = await item(ids[i], signal);
    }
  }));
  return result;
}
function errorBox(host, message, retry) {
  host.innerHTML = `<p class="error" role="alert">${esc(message)} Please try again.</p><button class="retry">Retry</button>`;
  host.querySelector('button').onclick = retry;
}
function errorMessage(error) {
  return error instanceof TypeError ? 'Could not connect to Hacker News. Check your connection.' : error.message || 'Could not load this view.';
}
function syncControls() {
  $('#nav').innerHTML = Object.keys(FEEDS).map(f => `<button data-feed="${f}" class="${!isArchive(route) && route.feed === f ? 'on' : ''}" aria-pressed="${!isArchive(route) && route.feed === f}">${f}</button>`).join('');
  $('#nav').querySelectorAll('button').forEach(b => b.onclick = () => navigate({feed: b.dataset.feed}));
  $('#q').value = route.q;
  $('#tmfrom').value = route.from || today;
  $('#tmto').value = route.to || today;
  $('#day').value = route.from || today;
  $('#prevday').disabled = $('#day').value <= '2007-02-19';
  $('#nextday').disabled = $('#day').value >= today;
  setDateMode(Boolean(route.from && route.from !== route.to));
  $('#searchscope').textContent = route.from ? `Searches HN stories submitted ${dateLabel(route.from)}${route.from !== route.to ? ' through ' + dateLabel(route.to) : ''} (UTC).` : 'Searches all HN stories.';
}
function setDateMode(range) {
  $('#dateform').hidden = !range;
  $('#daycontrols').hidden = range;
  $('#range-toggle').setAttribute('aria-expanded', String(range));
  $('#range-toggle').textContent = range ? 'Single day' : 'Custom range';
  $('#datelabel').textContent = range ? 'Custom range (UTC)' : 'Browse a day (UTC)';
  $('#datelabel').htmlFor = range ? 'tmfrom' : 'day';
  $('#datehint').textContent = range ? 'Set both dates, then apply the range.' : 'Choose a day to load its stories.';
}
function showDay(value, focus) {
  if (!validDate(value)) return;
  navigate({...route, from: value, to: value, topic: '', story: ''}, focus);
}
function remember(key, list) {
  lists.delete(key);
  lists.set(key, list);
  if (lists.size > 8) lists.delete(lists.keys().next().value);
}
async function fetchPage(list, r, signal) {
  if (!isArchive(r)) {
    const ids = list.ids || await json(`${FB}/${FEEDS[r.feed]}.json`, signal);
    if (!Array.isArray(ids)) throw new Error('Hacker News returned an invalid feed.');
    const slice = ids.slice(list.cursor, list.cursor + PAGE);
    const data = await batch(slice, signal);
    return {ids, cursor: list.cursor + slice.length, page: list.page + 1, more: list.cursor + slice.length < ids.length,
      stories: data.filter(it => it && !it.deleted && !it.dead && it.title && ['story', 'job'].includes(it.type))};
  }
  const params = new URLSearchParams({tags: 'story', hitsPerPage: String(PAGE), page: String(list.page)});
  if (r.q) params.set('query', r.q);
  if (r.from) {
    const start = Date.parse(r.from + 'T00:00:00Z') / 1000;
    const end = Date.parse(r.to + 'T00:00:00Z') / 1000 + 86400;
    params.set('numericFilters', `created_at_i>=${start},created_at_i<${end}`);
  }
  const data = await json(`${ALG}/${r.sort === 'newest' ? 'search_by_date' : 'search'}?${params}`, signal);
  if (!Array.isArray(data.hits)) throw new Error('Search returned an invalid response.');
  return {page: list.page + 1, more: list.page + 1 < data.nbPages,
    stories: data.hits.filter(h => h.title && /^\d+$/.test(h.objectID)).map(h => ({id: Number(h.objectID), title: h.title, url: h.url, score: h.points, by: h.author, time: h.created_at_i, descendants: h.num_comments}))};
}
function appendPage(list, data) {
  const seen = new Set(list.stories.map(it => it.id));
  for (const it of data.stories) if (!seen.has(it.id)) { list.stories.push(it); seen.add(it.id); }
  for (const k of ['ids', 'cursor', 'page', 'more']) if (data[k] !== undefined) list[k] = data[k];
}
async function renderRoute() {
  previewController?.abort();
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal, g = ++generation;
  const scroll = history.state?.scroll || 0;
  route = parseRoute();
  activeList = null;
  syncControls();
  main.setAttribute('aria-busy', 'true');
  main.innerHTML = '<div class="loading" role="status">Loading</div>';
  if (route.story) { await renderStory(route.story, g, signal, scroll); return; }
  const key = listKey(route), r = {...route};
  try {
    let list = lists.get(key);
    if (!list) {
      list = {stories: [], cursor: 0, page: 0, more: true, loading: false};
      const data = await fetchPage(list, r, signal);
      if (!current(g)) return;
      appendPage(list, data);
      remember(key, list);
    }
    if (!current(g)) return;
    activeList = list;
    renderList();
    restoreScroll(scroll);
  } catch (error) {
    if (current(g)) {
      main.setAttribute('aria-busy', 'false');
      errorBox(main, errorMessage(error), renderRoute);
    }
  }
}
function classify(it) {
  const title = it.title || '', host = domain(it.url), tags = [];
  const at = d => host === d || host.endsWith('.' + d);
  if (/^Show HN[:\s]/i.test(title)) tags.push('show hn');
  if (/^(Ask|Tell) HN[:\s]/i.test(title)) tags.push('ask hn');
  if (['github.com', 'gitlab.com', 'codeberg.org'].some(at)) tags.push('code');
  if (['arxiv.org', 'nature.com', 'science.org'].some(at) || /\[pdf\]\s*$/i.test(title)) tags.push('paper');
  if (NEWS.some(at)) tags.push('news');
  if (BLOGS.some(at) || /\.(dev|blog)$/.test(host)) tags.push('blog');
  if (/\b(LLMs?|GPT\w*|AI|A\.I\.|OpenAI|Anthropic|Claude|Gemini|DeepSeek|transformers?|diffusion|machine learning|artificial intelligence|language models?)\b/i.test(title)) tags.push('ai');
  const year = title.match(/\((19\d\d|20\d\d)\)\s*$/)?.[1];
  if (year && Number(year) < Number(today.slice(0, 4))) tags.push('older');
  return tags.length ? tags : ['other'];
}
function storyHash(id) { return hashFor({...route, story: String(id)}); }
function titleLink(it) {
  const url = safeURL(it.url);
  return url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(it.title)}</a>`
    : `<a href="${esc(storyHash(it.id))}" data-open="${esc(it.id)}">${esc(it.title)}</a>`;
}
function metadata(it) {
  const host = domain(safeURL(it.url));
  const points = it.score == null ? '' : `${esc(it.score)} points · `;
  return `${host ? `<b>${esc(host)}</b> · ` : ''}${points}by ${esc(it.by || '[deleted]')} · ${ago(it.time)} · <a class="cbtn" href="${esc(storyHash(it.id))}" data-open="${esc(it.id)}">${esc(it.descendants || 0)} comments</a>`;
}
function snapshotSlot(it) {
  const url = safeURL(it.url);
  return url ? `<a class="snapshot" data-snapshot="${esc(it.id)}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(it.title)}" hidden></a>` : '';
}
function commentSlot(it) {
  return `<blockquote class="pull" data-comment-for="${esc(it.id)}" hidden></blockquote>`;
}
function loadSnapshot(it, host, signal) {
  if (!host) return;
  const image = new Image();
  image.alt = `Page preview: ${it.title}`;
  image.loading = 'eager';
  image.fetchPriority = 'low';
  image.decoding = 'async';
  image.referrerPolicy = 'no-referrer';
  let timer;
  const cleanup = () => {
    clearTimeout(timer);
    image.onload = image.onerror = null;
    signal.removeEventListener('abort', discard);
  };
  const discard = () => {
    cleanup();
    image.removeAttribute('src');
    host.remove();
  };
  image.onload = () => {
    if (signal.aborted || !host.isConnected) { discard(); return; }
    cleanup();
    host.hidden = false;
    if (host.parentElement.classList.contains('lead-layout')) host.parentElement.classList.add('has-snapshot');
  };
  image.onerror = discard;
  signal.addEventListener('abort', discard, {once: true});
  timer = setTimeout(discard, 20000);
  host.append(image);
  const target = new URL(safeURL(it.url));
  target.hash = '';
  image.src = 'https://image.thum.io/get/width/640/crop/400/noanimate/' + target.href;
}
async function loadFeaturedComment(it, host, signal, threadURL) {
  if (!host || it.descendants === 0) return;
  const story = it.kids ? it : await item(it.id, signal);
  // Only inspect a few top-level comments; do not traverse their replies.
  for (const id of (story?.kids || []).slice(0, 3)) {
    if (signal.aborted || !host.isConnected) return;
    const comment = await item(id, signal);
    if (!comment || comment.deleted || comment.dead || !comment.text) continue;
    const text = document.createElement('div');
    text.innerHTML = richText(comment.text).replace(/<\/(p|pre|blockquote|li)>|<br\s*\/?>/gi, '$& ');
    let excerpt = text.textContent.replace(/\s+/g, ' ').trim();
    if (!excerpt) continue;
    if (excerpt.length > 240) excerpt = excerpt.slice(0, 237).replace(/\s+\S*$/, '') + '…';
    if (signal.aborted || !host.isConnected) return;
    const link = document.createElement('a');
    link.href = threadURL;
    link.dataset.open = String(it.id);
    link.append(document.createTextNode('“' + excerpt + '”'));
    const author = document.createElement('span');
    author.className = 'who';
    author.textContent = `— ${comment.by || '[deleted]'} · featured comment →`;
    link.append(author);
    host.replaceChildren(link);
    host.hidden = false;
    return;
  }
}
function loadFeaturedPreviews(stories) {
  previewController = new AbortController();
  const signal = previewController.signal, list = $('#list');
  const featured = stories.slice(0, 5).map(it => ({it, threadURL: storyHash(it.id)}));
  // Give headlines a paint before starting optional image and comment requests.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (signal.aborted || !list.isConnected) return;
    for (const {it, threadURL} of featured) {
      loadSnapshot(it, list.querySelector(`[data-snapshot="${it.id}"]`), signal);
      loadFeaturedComment(it, list.querySelector(`[data-comment-for="${it.id}"]`), signal, threadURL).catch(() => {});
    }
  }));
}
function renderPaper(stories) {
  if (!stories.length) return `<p class="message">${activeList.stories.length ? 'No loaded stories match this topic. Choose another topic or load more stories.' : 'No stories found. Try different search terms or dates.'}</p>`;
  const [lead, ...rest] = stories;
  const cards = rest.slice(0, 4), index = rest.slice(4);
  const tags = it => classify(it).map(c => `<span class="cat mini">${esc(c)}</span>`).join('');
  return `<div class="paper"><article class="lead"><div class="kick">${esc(classify(lead).join(' · '))}</div><div class="lead-layout"><div><h2>${titleLink(lead)}</h2><div class="deck">${metadata(lead)}</div>${commentSlot(lead)}</div>${snapshotSlot(lead)}</div></article>
    ${cards.length ? `<div class="secrow">${cards.map(it => `<article class="seccard">${snapshotSlot(it)}${tags(it)}<h2>${titleLink(it)}</h2><div class="deck">${metadata(it)}</div>${commentSlot(it)}</article>`).join('')}</div>` : ''}
    ${index.length ? `<div class="idxhead">More stories</div><div class="idx">${index.map(it => `<article class="irow">${tags(it)}<span class="t">${titleLink(it)}</span><div class="m">${metadata(it)}</div></article>`).join('')}</div>` : ''}</div>`;
}
function renderList() {
  previewController?.abort();
  const list = activeList;
  const archive = isArchive(route);
  const dates = route.from ? dateLabel(route.from) + (route.from !== route.to ? ' – ' + dateLabel(route.to) : '') : '';
  const title = route.q ? `Search: ${route.q}` : dates || `${route.feed[0].toUpperCase() + route.feed.slice(1)} stories`;
  const scope = archive ? `${route.from ? `Submitted ${dates} (UTC)` : 'All dates'} · ${route.sort === 'newest' ? 'Newest first' : route.q ? 'Ranked by search relevance' : 'Ranked by points'}` : 'Live HN ranking · Use Refresh to get the latest stories.';
  const filtered = route.topic ? list.stories.filter(it => classify(it).includes(route.topic)) : list.stories;
  const counts = Object.fromEntries(CATS.map(c => [c, list.stories.filter(it => classify(it).includes(c)).length]));
  main.setAttribute('aria-busy', 'false');
  main.innerHTML = `<div class="viewhead"><h1>${esc(title)}</h1><div class="viewactions">
    ${archive ? `<label>Sort <select id="sort"><option value="popular">${route.q ? 'Relevance' : 'Points'}</option><option value="newest">Newest</option></select></label><button id="exit">Back to live</button>` : ''}<button id="refresh">Refresh</button></div></div>
    <p class="resultnote">${esc(scope)}</p><p class="topicnote" role="status">${route.topic ? `${filtered.length} matching · ` : ''}${list.stories.length} stories loaded. Topics are automatic and can overlap.</p>
    <div id="chips" class="chips" role="group" aria-label="Filter loaded stories by topic">${['', ...CATS.filter(c => counts[c] || route.topic === c)].map(c => `<button data-topic="${c}" aria-pressed="${route.topic === c}" class="${route.topic === c ? 'on' : ''}">${c || 'all'} (${c ? counts[c] : list.stories.length})</button>`).join('')}</div>
    <div id="list">${renderPaper(filtered)}</div><div id="morestatus" aria-live="polite"></div>${list.more ? '<button class="morebtn">Load more stories</button>' : '<p class="hint">End of available results.</p>'}`;
  $('#chips').querySelectorAll('button').forEach(b => b.onclick = () => navigate({...route, topic: b.dataset.topic}));
  $('#refresh').onclick = () => {
    for (const it of list.stories) items.delete(String(it.id));
    lists.delete(listKey(route));
    saveScroll();
    renderRoute();
  };
  if (archive) {
    $('#sort').value = route.sort;
    $('#sort').onchange = e => navigate({...route, sort: e.target.value});
    $('#exit').onclick = () => navigate({feed: route.feed});
  }
  if ($('.morebtn')) $('.morebtn').onclick = loadMore;
  loadFeaturedPreviews(filtered);
}
async function loadMore() {
  const list = activeList, g = generation, r = {...route}, signal = controller.signal;
  if (!list || list.loading || !list.more) return;
  list.loading = true;
  const button = $('.morebtn'), status = $('#morestatus');
  button.disabled = true;
  button.textContent = 'Loading stories…';
  status.textContent = '';
  try {
    const data = await fetchPage(list, r, signal);
    if (!current(g)) return;
    const count = list.stories.length, scroll = window.scrollY;
    appendPage(list, data);
    renderList();
    window.scrollTo(0, scroll);
    $('#morestatus').textContent = `${list.stories.length - count} more stories loaded.`;
    if ($('.morebtn')) $('.morebtn').focus({preventScroll: true});
  } catch (error) {
    if (current(g)) {
      status.innerHTML = `<p class="error" role="alert">${esc(errorMessage(error))} Use “Load more stories” to retry.</p>`;
      button.disabled = false;
      button.textContent = 'Load more stories';
    }
  } finally { list.loading = false; }
}

// Rebuild HN rich text from an allowlist; never insert API HTML directly.
function richText(html) {
  const source = document.createElement('template');
  source.innerHTML = html || '';
  const allowed = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'CODE', 'PRE', 'A', 'BLOCKQUOTE', 'UL', 'OL', 'LI']);
  const drop = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'MATH', 'FORM', 'INPUT', 'IMG', 'VIDEO', 'AUDIO']);
  function copy(node, target) {
    if (node.nodeType === Node.TEXT_NODE) { target.append(document.createTextNode(node.textContent)); return; }
    if (node.nodeType !== Node.ELEMENT_NODE || drop.has(node.tagName)) return;
    const out = allowed.has(node.tagName) ? document.createElement(node.tagName.toLowerCase()) : document.createDocumentFragment();
    if (node.tagName === 'A') {
      const url = safeURL(node.getAttribute('href'));
      if (url) { out.href = url; out.target = '_blank'; out.rel = 'noopener noreferrer'; }
    }
    node.childNodes.forEach(child => copy(child, out));
    target.append(out);
  }
  const result = document.createElement('div');
  source.content.childNodes.forEach(node => copy(node, result));
  return result.innerHTML;
}
function returnLink() {
  return `<a class="back" data-return href="${esc(hashFor({...route, story: ''}))}">← Back to ${route.q ? 'search results' : route.from ? 'date results' : esc(route.feed) + ' stories'}</a>`;
}
async function renderStory(id, g, signal, scroll) {
  try {
    const it = await item(id, signal);
    if (!current(g)) return;
    main.setAttribute('aria-busy', 'false');
    if (!it || it.deleted || it.dead) {
      main.innerHTML = `${returnLink()}<p class="message">This story is unavailable or has been removed.</p><a href="https://news.ycombinator.com/item?id=${id}" target="_blank" rel="noopener">Check on Hacker News ↗</a>`;
      return;
    }
    const url = safeURL(it.url);
    main.innerHTML = `${returnLink()}<h1 class="dtitle">${esc(it.title || 'Discussion')}</h1><div class="dmeta">${esc(it.score ?? 0)} points · by ${esc(it.by || '[deleted]')} · ${ago(it.time)} · ${esc(it.descendants || 0)} comments</div>
      <p class="dmeta">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Read article at ${esc(domain(url))} ↗</a> · ` : ''}<a href="https://news.ycombinator.com/item?id=${id}" target="_blank" rel="noopener">Open on HN ↗</a></p>
      ${it.text ? `<div class="dtext">${richText(it.text)}</div>` : ''}<h2 class="chead">Discussion</h2><p class="hint">Expand replies as you read. Select a comment’s author line to collapse it.</p><div id="cmts"></div>`;
    if (it.kids?.length) await commentGroup(it.kids, $('#cmts'), 0, it.by, g, signal, true);
    else $('#cmts').innerHTML = '<p class="message">No comments yet.</p>';
    if (current(g)) restoreScroll(scroll);
  } catch (error) {
    if (current(g)) {
      main.setAttribute('aria-busy', 'false');
      main.innerHTML = returnLink() + '<div id="threaderror"></div>';
      errorBox($('#threaderror'), errorMessage(error), renderRoute);
    }
  }
}
async function commentGroup(ids, host, depth, op, g, signal, auto) {
  let cursor = 0, busy = false;
  const content = document.createElement('div'), status = document.createElement('div'), button = document.createElement('button');
  button.className = 'loadkids';
  host.append(content, status, button);
  const label = () => {
    const remaining = ids.length - cursor;
    button.textContent = cursor ? `Load ${Math.min(15, remaining)} more ${depth ? 'replies' : 'comments'} (${remaining} remaining)` : depth ? `Show ${remaining} ${remaining === 1 ? 'reply' : 'replies'}` : `Load ${Math.min(15, remaining)} comments`;
  };
  label();
  async function load() {
    if (busy || !current(g) || !host.isConnected) return;
    busy = true; button.disabled = true; button.textContent = 'Loading comments…'; status.textContent = '';
    try {
      const slice = ids.slice(cursor, cursor + 15);
      const comments = await batch(slice, signal);
      if (!current(g) || !host.isConnected) return;
      for (const c of comments) {
        if (!c) continue;
        const el = document.createElement('article');
        el.className = 'cmt ' + (depth ? depth >= 4 ? 'deep' : '' : 'd0');
        const removed = c.deleted || c.dead;
        el.innerHTML = `<button class="cmeta" aria-expanded="true"><span class="au">${esc(c.by || '[deleted]')}</span>${c.by && c.by === op ? '<span class="op">OP</span>' : ''} ${ago(c.time)} <span class="tog">[−]</span></button>
          <div class="cbody"><div class="ctext">${removed ? `<span class="dead">[${c.deleted ? 'deleted' : 'flagged'}]</span>` : richText(c.text)}</div><a class="commentlink" href="https://news.ycombinator.com/item?id=${esc(c.id)}" target="_blank" rel="noopener">On HN ↗</a><div class="kids"></div></div>`;
        const toggle = el.querySelector('.cmeta');
        toggle.onclick = () => {
          const collapsed = el.classList.toggle('collapsed');
          toggle.setAttribute('aria-expanded', String(!collapsed));
          toggle.querySelector('.tog').textContent = collapsed ? '[+]' : '[−]';
        };
        content.append(el);
        if (c.kids?.length) commentGroup(c.kids, el.querySelector('.kids'), depth + 1, op, g, signal, false);
      }
      cursor += slice.length;
      if (cursor >= ids.length) button.remove();
      else label();
    } catch (error) {
      if (current(g) && host.isConnected) {
        status.innerHTML = `<p class="error" role="alert">${esc(errorMessage(error))}</p>`;
        button.textContent = 'Retry loading comments';
      }
    } finally { busy = false; button.disabled = false; }
  }
  button.onclick = load;
  if (auto) await load();
}

main.addEventListener('click', event => {
  const link = event.target.closest('a[data-open], a[data-return]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (link.hasAttribute('data-return')) {
    if (history.state?.returnHash === link.getAttribute('href')) history.back();
    else navigate({...route, story: ''});
  } else navigate({...route, story: link.dataset.open});
});
$('#searchform').addEventListener('submit', event => {
  event.preventDefault();
  navigate({...route, q: $('#q').value.trim(), topic: '', story: ''});
});
for (const input of [$('#day'), $('#tmfrom'), $('#tmto')]) { input.min = '2007-02-19'; input.max = today; input.value = today; input.oninput = () => $('#tmto').setCustomValidity(''); }
$('#day').addEventListener('change', () => showDay($('#day').value, 'day'));
$('#prevday').onclick = () => showDay(shiftDay(route.from || today, -1), 'prevday');
$('#nextday').onclick = () => showDay(shiftDay(route.from || today, 1), 'nextday');
$('#yesterday').onclick = () => showDay(shiftDay(today, -1), 'yesterday');
$('#yearago').onclick = () => showDay(yearAgo(today), 'yearago');
$('#range-toggle').onclick = () => {
  const opening = $('#dateform').hidden;
  if (!opening && route.from && route.from !== route.to) { showDay(route.from, 'day'); return; }
  setDateMode(opening);
  if (opening) {
    $('#tmfrom').value = route.from || $('#day').value || today;
    $('#tmto').value = route.to || $('#day').value || today;
    $('#tmto').setCustomValidity('');
  }
};
$('#dateform').addEventListener('submit', event => {
  event.preventDefault();
  const from = $('#tmfrom').value, to = $('#tmto').value;
  if (!validDate(from) || !validDate(to) || from > to) {
    $('#tmto').setCustomValidity('Choose an end date on or after the start date, no later than today.');
    $('#tmto').reportValidity(); return;
  }
  navigate({...route, from, to, topic: '', story: ''}, from === to ? 'day' : 'applyrange');
});
window.addEventListener('popstate', renderRoute);
window.addEventListener('hashchange', () => { if (hashFor(parseRoute()) !== hashFor(route)) renderRoute(); });
history.scrollRestoration = 'manual';
history.replaceState({...history.state, scroll: history.state?.scroll || 0}, '', hashFor(parseRoute()));
renderRoute();
