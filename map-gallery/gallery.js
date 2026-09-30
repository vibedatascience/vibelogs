(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const catalog = window.GalleryCatalog, HOUR = 3600000, CHECKED = 'maps-checked-v2';
  const cacheKey = id => `maps-${id}-v2`;
  let rows = window.GALLERY_SNAPSHOT, visible = [], year = 'all', maker = 'all', tool = 'all';
  let checked = 0, busy = false, current = null, codeRequest = null, generation = 0;
  const codes = new Map();
  const maker$ = catalog.makerName;
  const live = catalog.SOURCES.filter(s => s.live);
  const label = x => `Day ${x.n} · ${x.y}`;
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* Refresh still works without storage. */ } };
  for (const src of live) {
    try {
      const saved = read(cacheKey(src.id));
      if (saved && typeof saved.text === 'string') rows = catalog.merge(rows, catalog.parse(src.id, saved.text, window.Papa));
    } catch { /* Storage may hold an older format. */ }
  }
  const c0 = read(CHECKED);
  if (Number.isFinite(c0) && c0 <= Date.now()) checked = c0;

  function chip(kind, value, text, on) {
    return `<button class="chip ${kind} ${on?'on':''}" data-${kind}="${escape(value)}" aria-pressed="${on}">${escape(text)}</button>`;
  }
  function filters() {
    const years = [...new Set(rows.map(x => x.y))].sort().reverse();
    const makers = [...new Map(catalog.SOURCES.map(s => [s.maker, s.name]))].filter(([m]) => rows.some(x => x.m === m));
    const tools = [...new Set(rows.map(x => x.l))].sort();
    $('filters').innerHTML = chip('y','all','All years',year==='all') + years.map(y => chip('y',y,y,year===y)).join('') +
      '<span class="sep" aria-hidden="true"></span>' + makers.map(([m, name]) => chip('m',m,name,maker===m)).join('') +
      '<span class="sep" aria-hidden="true"></span>' + tools.map(l => chip('l',l,l,tool===l)).join('');
  }
  function render() {
    visible = catalog.filter(rows, {year, maker, tool, query:$('search').value});
    $('count').textContent = `${visible.length} of ${rows.length} maps`;
    $('surprise').disabled = !visible.length;
    $('empty').hidden = !!visible.length;
    $('grid').innerHTML = visible.map(x => `<button class="card" data-key="${escape(x.d)}" aria-label="${escape(x.t)}, ${label(x)}, by ${escape(maker$(x.m))}"><img loading="lazy" src="${escape(x.i)}" alt="${escape(x.t)}${x.s ? ': '+escape(x.s) : ''}"><span class="meta"><span><span class="tag">${escape(maker$(x.m))} · ${escape(x.l)}</span><span class="t" style="display:block">${escape(x.t)}</span>${x.s ? `<span class="s">${escape(x.s)}</span>` : ''}</span><span class="d">${label(x)}</span></span></button>`).join('');
  }
  function status(message) {
    $('status').textContent = message;
  }
  async function refresh(force = false) {
    if (busy) return;
    if (!force && Date.now()-checked < HOUR) { status('Checked recently'); return; }
    busy = true;
    $('refresh').disabled = true;
    status('Checking for new maps…');
    const old = rows, failed = [];
    for (const src of live) {
      try {
        const response = await fetch(src.url, {cache:'no-cache', signal:AbortSignal.timeout(15000)});
        if (!response.ok) throw Error(`HTTP ${response.status}`);
        const text = await response.text(), incoming = catalog.parse(src.id, text, window.Papa);
        // A malformed or truncated upstream index must never erase the saved gallery.
        if (incoming.length < src.min) throw Error('Incomplete catalogue');
        rows = catalog.merge(rows, incoming);
        write(cacheKey(src.id), {text});
      } catch { failed.push(src.name); }
    }
    const added = rows.length-old.length;
    if (failed.length < live.length) { checked = Date.now(); write(CHECKED, checked); }
    if (JSON.stringify(old) !== JSON.stringify(rows)) { filters(); render(); }
    status(failed.length ? `Couldn’t check ${failed.join(' and ')}. Showing saved maps` : added ? `${added} new maps added` : 'Up to date');
    busy = false;
    $('refresh').disabled = false;
  }
  function notebook(text) {
    try {
      const cells = JSON.parse(text).cells || [];
      return cells.filter(c => c.cell_type === 'code').map(c => [].concat(c.source).join('')).filter(Boolean).join('\n\n# ----\n\n');
    } catch { return text; }
  }
  function setCode(text, item) {
    $('mc').textContent = text;
    $('mc').className = 'language-'+(item.l==='R'?'r':item.l==='Python'?'python':'javascript');
    $('mc').removeAttribute('data-highlighted');
    if (window.hljs) window.hljs.highlightElement($('mc'));
  }
  async function loadCode() {
    if (!$('mdet').open || !current?.c) return;
    const item = current, ticket = generation;
    if (codes.has(item.c)) { setCode(codes.get(item.c), item); return; }
    codeRequest?.abort();
    const controller = new AbortController();
    codeRequest = controller;
    const timer = setTimeout(() => controller.abort(), 15000);
    $('mc').textContent = 'Loading…';
    try {
      const response = await fetch(item.c, {signal:controller.signal});
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      let text = await response.text();
      // Notebooks arrive as JSON; show just their code cells.
      if (/\.ipynb$/i.test(item.c)) text = notebook(text);
      codes.set(item.c, text);
      if (ticket === generation && $('dlg').open) setCode(text, item);
    } catch {
      if (ticket === generation && $('dlg').open) $('mc').textContent = 'Could not load code. Open GitHub above, or close and reopen this section to retry.';
    } finally { clearTimeout(timer); }
  }
  function open(item) {
    generation++;
    codeRequest?.abort();
    current = item;
    $('mt').textContent = item.t;
    $('md').textContent = `${label(item)} · ${maker$(item.m)}`;
    $('mi').src = item.i;
    $('mi').alt = item.s ? `${item.t}: ${item.s}` : item.t;
    $('mg').href = item.g;
    $('packages').textContent = [item.s, item.p].filter(Boolean).join(' · ');
    $('packages').hidden = !item.p && !item.s;
    $('mdet').open = false;
    $('mdet').hidden = !item.c;
    $('msum').textContent = 'Show code ('+decodeURIComponent(item.c?.split('/').pop() || '')+')';
    $('mc').textContent = '';
    const index = visible.findIndex(x => x.d === item.d);
    $('prev').disabled = index <= 0;
    $('next').disabled = index < 0 || index >= visible.length-1;
    $('position').textContent = `${index+1} / ${visible.length}`;
    if (!$('dlg').open) $('dlg').showModal();
    document.querySelector('.mbody').scrollTop = 0;
  }
  function move(delta) {
    const index = visible.findIndex(x => x.d === current?.d);
    if (visible[index+delta]) open(visible[index+delta]);
  }
  $('filters').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.y) year = b.dataset.y;
    if (b.dataset.m) maker = maker === b.dataset.m ? 'all' : b.dataset.m;
    if (b.dataset.l) tool = tool === b.dataset.l ? 'all' : b.dataset.l;
    // Preserve keyboard focus while updating the pressed state.
    $('filters').querySelectorAll('button').forEach(c => {
      const on = c.dataset.y ? c.dataset.y === year : c.dataset.m ? c.dataset.m === maker : c.dataset.l === tool;
      c.classList.toggle('on',on); c.setAttribute('aria-pressed',on);
    });
    render();
  });
  $('search').addEventListener('input', render);
  $('clear').addEventListener('click', () => { year = maker = tool = 'all'; $('search').value=''; filters(); render(); $('search').focus(); });
  $('refresh').addEventListener('click', () => refresh(true));
  $('surprise').addEventListener('click', () => { if (visible.length) open(visible[Math.floor(Math.random()*visible.length)]); });
  $('grid').addEventListener('click', e => { const card=e.target.closest('[data-key]'); if (card) open(visible.find(x => x.d === card.dataset.key)); });
  $('mdet').addEventListener('toggle',loadCode);
  $('prev').addEventListener('click', () => move(-1));
  $('next').addEventListener('click', () => move(1));
  $('close').addEventListener('click', () => $('dlg').close());
  $('dlg').addEventListener('click', e => { if (e.target === $('dlg')) $('dlg').close(); });
  $('dlg').addEventListener('close', () => { generation++; codeRequest?.abort(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  setInterval(() => { if (!document.hidden) refresh(); }, HOUR);
  filters(); render(); refresh();
})();
