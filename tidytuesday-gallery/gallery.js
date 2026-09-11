(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const catalog = window.GalleryCatalog, CACHE = 'nrennie-catalog-v1', HOUR = 3600000;
  let rows = window.GALLERY_SNAPSHOT, visible = [], year = 'all', language = 'all';
  let checked = 0, busy = false, current = null, codeRequest = null, generation = 0;
  const codes = new Map();
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE));
    if (saved && typeof saved.csv === 'string') {
      rows = catalog.merge(rows, catalog.parse(saved.csv, window.Papa));
      if (Number.isFinite(saved.checked) && saved.checked <= Date.now()) checked = saved.checked;
    }
  } catch { /* Storage may be disabled or contain an older format. */ }
  function filters() {
    const years = [...new Set(rows.map(x => x.y))].sort().reverse();
    const languages = [...new Set(rows.map(x => x.l))].sort();
    $('filters').innerHTML = [['all','All years'], ...years.map(y => [y,y])].map(([y,label]) => `<button class="chip ${year===y?'on':''}" data-y="${escape(y)}" aria-pressed="${year===y}">${escape(label)}</button>`).join('') + languages.map(l => `<button class="chip lang ${language===l?'on':''}" data-l="${escape(l)}" aria-pressed="${language===l}">${escape(l)}</button>`).join('');
  }
  function render() {
    visible = catalog.filter(rows, year, language, $('search').value);
    $('count').textContent = `${visible.length} of ${rows.length} plots`;
    $('surprise').disabled = !visible.length;
    $('empty').hidden = !!visible.length;
    $('grid').innerHTML = visible.map(x => `<button class="card" data-date="${x.d}" aria-label="${escape(x.t)} — ${x.d}"><img loading="lazy" src="${escape(x.i)}" alt="${escape(x.t)}"><span class="meta"><span><span class="tag">${escape(x.l)}</span><span class="t" style="display:block">${escape(x.t)}</span></span><span class="d">${x.d}</span></span></button>`).join('');
  }
  function status(message) {
    $('status').textContent = `${message} · Latest plot ${rows[0].d}`;
  }
  async function refresh(force = false) {
    if (busy) return;
    if (!force && Date.now()-checked < HOUR) { status('Checked recently'); return; }
    busy = true;
    $('refresh').disabled = true;
    status('Checking for new plots…');
    try {
      const response = await fetch(catalog.URL, {cache:'no-cache', signal:AbortSignal.timeout(15000)});
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const csv = await response.text(), incoming = catalog.parse(csv, window.Papa);
      // A malformed/truncated upstream export must never erase the saved gallery.
      if (incoming.length < 200) throw Error('Incomplete catalogue');
      const old = rows, updated = catalog.merge(rows, incoming), added = updated.length-old.length;
      rows = updated;
      checked = Date.now();
      try { localStorage.setItem(CACHE, JSON.stringify({csv,checked})); } catch { /* Refresh still works without storage. */ }
      if (JSON.stringify(old) !== JSON.stringify(rows)) { filters(); render(); }
      status(added ? `${added} new plots added` : 'Up to date');
    } catch {
      status('Couldn’t check for updates. Showing saved plots');
    } finally {
      busy = false;
      $('refresh').disabled = false;
    }
  }
  function setCode(text, item) {
    $('mc').textContent = text;
    $('mc').className = 'language-'+(item.l==='R'?'r':item.l==='Python'?'python':item.l==='Svelte'?'xml':'javascript');
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
      const text = await response.text();
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
    $('md').textContent = item.d;
    $('mi').src = item.i;
    $('mi').alt = item.t;
    $('mg').href = item.g;
    $('packages').textContent = item.p || '';
    $('packages').hidden = !item.p;
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
    if (b.dataset.l) language = language === b.dataset.l ? 'all' : b.dataset.l;
    // Preserve keyboard focus while updating the pressed state.
    $('filters').querySelectorAll('button').forEach(c => {
      const on = c.dataset.y ? c.dataset.y === year : c.dataset.l === language;
      c.classList.toggle('on',on); c.setAttribute('aria-pressed',on);
    });
    render();
  });
  $('search').addEventListener('input', render);
  $('clear').addEventListener('click', () => { year = language = 'all'; $('search').value=''; filters(); render(); $('search').focus(); });
  $('refresh').addEventListener('click', () => refresh(true));
  $('surprise').addEventListener('click', () => { if (visible.length) open(visible[Math.floor(Math.random()*visible.length)]); });
  $('grid').addEventListener('click', e => { const card=e.target.closest('[data-date]'); if (card) open(visible.find(x => x.d === card.dataset.date)); });
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
