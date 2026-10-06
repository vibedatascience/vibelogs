/* Comment mode for rahulch.site.
   Open any page as /<page>/comments (404.html loads the page and this script).
   Comments live in comments/<slug>.json in vibedatascience/vibelogs. Agents: see COMMENTS.md. */
(function () {
  'use strict';
  if (window.__vlcLoaded) return;
  window.__vlcLoaded = true;

  var REPO = 'vibedatascience/vibelogs', BRANCH = 'main';
  var API = 'https://api.github.com/repos/' + REPO + '/contents/';
  var SITE = location.origin;
  var page = normPage(window.__vlcPath || location.pathname.replace(/\/comments\/?$/, '/'));
  var slug = page.replace(/^\/|\/$/g, '').replace(/\.html$/, '').replace(/\//g, '__') || 'index';
  var FILE = 'comments/' + slug + '.json';
  var LKEY = 'vlc:' + slug, TKEY = 'vlc:token';
  var localOnly = !!document.querySelector('meta[name="comments"][content="local"]');
  var mobile = window.matchMedia('(max-width: 760px)');

  function normPage(p) {
    p = p.replace(/index\.html$/, '');
    if (!/\.html$/.test(p) && !/\/$/.test(p)) p += '/';
    return p;
  }
  function commentUrl() { return SITE + page + (/\/$/.test(page) ? '' : '/') + 'comments'; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  var hm = location.hash.match(/(?:^#|&)t=([^&]+)/);
  if (hm) { lsSet(TKEY, decodeURIComponent(hm[1])); history.replaceState(null, '', location.pathname + location.search); }
  function token() { return lsGet(TKEY) || ''; }
  function canSync() { return !localOnly && !!token(); }

  /* ---------- state ---------- */
  var st = { comments: [], dirty: {}, deleted: {} };
  var tick = 0, sha = null, syncing = false, again = false, syncTimer = null;
  var status = { kind: 'idle', text: '' };
  var showResolved = false, composing = null, activeId = null, expanded = false;
  var found = {}, pos = {};

  try {
    var saved = JSON.parse(lsGet(LKEY) || 'null');
    if (saved) st = { comments: saved.comments || [], dirty: saved.dirty || {}, deleted: saved.deleted || {} };
  } catch (e) {}
  function saveLocal() { lsSet(LKEY, JSON.stringify(st)); }
  function byId(id) { for (var i = 0; i < st.comments.length; i++) if (st.comments[i].id === id) return st.comments[i]; return null; }
  function touch(id) { st.dirty[id] = ++tick + Date.now(); }

  /* ---------- GitHub sync ---------- */
  function b64dec(s) {
    var bin = atob(s.replace(/\s/g, '')), b = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(b);
  }
  function b64enc(str) {
    var b = new TextEncoder().encode(str), s = '';
    for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function gh(method, body) {
    return fetch(API + FILE + (method === 'GET' ? '?ref=' + BRANCH : ''), {
      method: method, cache: 'no-store',
      headers: { Authorization: 'Bearer ' + token(), Accept: 'application/vnd.github+json' },
      body: body ? JSON.stringify(body) : undefined
    });
  }
  function fetchRemote() {
    if (localOnly) return Promise.resolve(null);
    if (token()) {
      return gh('GET').then(function (r) {
        if (r.status === 404) { sha = null; return { comments: [] }; }
        if (r.status === 401 || r.status === 403) throw new Error('token');
        if (!r.ok) throw new Error('GitHub ' + r.status);
        return r.json().then(function (j) { sha = j.sha; return JSON.parse(b64dec(j.content)); });
      });
    }
    return fetch(SITE + '/' + FILE + '?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }
  function merge(remote) {
    if (!remote) return;
    var seen = {}, out = [];
    (remote.comments || []).forEach(function (c) {
      if (st.deleted[c.id]) return;
      seen[c.id] = 1;
      out.push(st.dirty[c.id] ? (byId(c.id) || c) : c);
    });
    st.comments.forEach(function (c) { if (st.dirty[c.id] && !seen[c.id]) out.push(c); });
    st.comments = out;
  }
  function hasPending() { return Object.keys(st.dirty).length + Object.keys(st.deleted).length > 0; }
  function fileBody() {
    return JSON.stringify({
      page: page,
      url: SITE + page,
      comment_mode: commentUrl(),
      how_to_address: 'https://github.com/' + REPO + '/blob/main/COMMENTS.md',
      comments: st.comments
    }, null, 2) + '\n';
  }
  function schedule() {
    saveLocal();
    if (!canSync()) { setStatus(); return; }
    setStatus('pending', 'Unsynced');
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { sync(0); }, 1000);
  }
  function sync(attempt) {
    if (!canSync()) { setStatus(); return; }
    if (syncing) { again = true; return; }
    if (!hasPending()) { setStatus('ok', 'Synced'); return; }
    syncing = true;
    setStatus('busy', 'Saving...');
    var snapD = JSON.parse(JSON.stringify(st.dirty)), snapX = JSON.parse(JSON.stringify(st.deleted));
    fetchRemote().then(function (remote) {
      merge(remote);
      var open = st.comments.filter(function (c) { return c.status === 'open'; }).length;
      var body = { message: 'Comments: ' + slug + ' (' + open + ' open)', content: b64enc(fileBody()), branch: BRANCH };
      if (sha) body.sha = sha;
      return gh('PUT', body).then(function (r) {
        if (r.status === 409 || r.status === 422) throw new Error('conflict');
        if (r.status === 401 || r.status === 403) throw new Error('token');
        if (!r.ok) throw new Error('GitHub ' + r.status);
        return r.json().then(function (j) {
          sha = j.content && j.content.sha;
          Object.keys(snapD).forEach(function (id) { if (st.dirty[id] === snapD[id]) delete st.dirty[id]; });
          Object.keys(snapX).forEach(function (id) { if (st.deleted[id] === snapX[id]) delete st.deleted[id]; });
        });
      });
    }).then(function () {
      syncing = false; saveLocal(); render();
      if (again || hasPending()) { again = false; sync(0); } else setStatus('ok', 'Synced');
    }, function (err) {
      syncing = false; saveLocal(); render();
      var m = String(err && err.message);
      if (m === 'token') { setStatus('err', 'Token rejected'); return; }
      if (m === 'conflict' && attempt < 3) { sync(attempt + 1); return; }
      setStatus('err', 'Not synced, retrying');
      clearTimeout(syncTimer);
      syncTimer = setTimeout(function () { sync(0); }, 15000);
    });
  }
  function refresh() {
    if (syncing || hasPending() || localOnly) return Promise.resolve();
    return fetchRemote().then(function (remote) {
      if (remote) { merge(remote); saveLocal(); render(); }
      setStatus(token() ? 'ok' : null, token() ? 'Synced' : null);
    }, function (err) {
      setStatus('err', String(err && err.message) === 'token' ? 'Token rejected' : 'Offline');
    });
  }

  /* ---------- text index and anchoring ---------- */
  var host;
  function inUI(n) { return host && (n === host || host.contains(n)); }
  function index() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TEXTAREA)$/.test(p.nodeName) || inUI(n)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], s = 0, n, parts = [];
    while ((n = w.nextNode())) { nodes.push({ node: n, start: s }); parts.push(n.data); s += n.data.length; }
    return { nodes: nodes, full: parts.join('') };
  }
  function posOf(ix, c, o) {
    if (c.nodeType === 3) {
      for (var i = 0; i < ix.nodes.length; i++) if (ix.nodes[i].node === c) return ix.nodes[i].start + o;
    }
    var r = document.createRange();
    r.setStart(c, o);
    for (var j = 0; j < ix.nodes.length; j++) if (r.comparePoint(ix.nodes[j].node, 0) >= 0) return ix.nodes[j].start;
    return ix.full.length;
  }
  function nodeAt(ix, p) {
    for (var i = 0; i < ix.nodes.length; i++) {
      var x = ix.nodes[i];
      if (p >= x.start && p < x.start + x.node.data.length) return x.node;
    }
    return null;
  }
  function squish(s) { return (s || '').replace(/\s+/g, ' ').trim(); }
  function sectionOf(node) {
    var hs = document.querySelectorAll('h1,h2,h3,h4,h5,h6'), last = null;
    for (var i = 0; i < hs.length; i++) {
      if (inUI(hs[i])) continue;
      if (hs[i].contains(node) || (hs[i].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)) last = hs[i];
    }
    return last ? squish(last.textContent).slice(0, 100) : '';
  }
  function contextOf(node) {
    var el = node.parentElement;
    if (!el) return '';
    var tr = el.closest('tr');
    if (tr) return squish([].map.call(tr.children, function (c) { return squish(c.textContent); }).join(' | ')).slice(0, 240);
    var b = el.closest('li,p,h1,h2,h3,h4,h5,h6,blockquote,figcaption,pre,dd,dt,td,th,button,label') || el.closest('div,section,article') || el;
    return squish(b.textContent).slice(0, 240);
  }
  function anchorFromRange(range) {
    if (!range || range.collapsed) return null;
    var ix = index();
    var s = posOf(ix, range.startContainer, range.startOffset), e = posOf(ix, range.endContainer, range.endOffset);
    while (s < e && /\s/.test(ix.full[s])) s++;
    while (e > s && /\s/.test(ix.full[e - 1])) e--;
    if (e <= s) return null;
    var n = nodeAt(ix, s);
    return {
      quote: ix.full.slice(s, e).slice(0, 2000),
      prefix: ix.full.slice(Math.max(0, s - 40), s),
      suffix: ix.full.slice(e, e + 40),
      section: n ? sectionOf(n) : '',
      context: n ? contextOf(n) : ''
    };
  }
  function edgeMatch(a, b, fromEnd) {
    var n = 0, la = a.length, lb = b.length;
    while (n < la && n < lb && (fromEnd ? a[la - 1 - n] === b[lb - 1 - n] : a[n] === b[n])) n++;
    return n;
  }
  function locate(ix, c) {
    if (!c.quote) return null;
    var f = ix.full, q = c.quote, pre = c.prefix || '', suf = c.suffix || '';
    var hits = [], i = f.indexOf(q);
    while (i !== -1) { hits.push([i, i + q.length]); i = f.indexOf(q, i + 1); }
    if (!hits.length) {
      var re = new RegExp(q.trim().split(/\s+/).map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('\\s+'), 'g'), m;
      while ((m = re.exec(f))) { hits.push([m.index, m.index + m[0].length]); if (!m[0].length) break; }
    }
    var best = null, bs = -1;
    hits.forEach(function (h) {
      var sc = edgeMatch(f.slice(Math.max(0, h[0] - pre.length), h[0]), pre, true) + edgeMatch(f.slice(h[1], h[1] + suf.length), suf, false);
      if (sc > bs) { bs = sc; best = h; }
    });
    return best;
  }
  function wrap(ix, s, e, id) {
    var todo = [];
    ix.nodes.forEach(function (x) {
      var ns = x.start, ne = x.start + x.node.data.length;
      if (ne <= s || ns >= e) return;
      var a = Math.max(s, ns) - ns, b = Math.min(e, ne) - ns;
      if (!x.node.data.slice(a, b).trim()) return;
      if (/^(TABLE|TBODY|THEAD|TFOOT|TR|SELECT|UL|OL|svg)$/i.test(x.node.parentNode.nodeName)) return;
      if (x.node.parentNode.namespaceURI !== 'http://www.w3.org/1999/xhtml') return;
      todo.push({ t: x.node, a: a, b: b });
    });
    todo.forEach(function (q) {
      var t = q.t;
      if (q.b < t.data.length) t.splitText(q.b);
      var mid = q.a > 0 ? t.splitText(q.a) : t;
      var m = document.createElement('mark');
      m.className = 'vlc-hl' + (id === activeId ? ' vlc-on' : '');
      m.setAttribute('data-vlc', id);
      mid.parentNode.insertBefore(m, mid);
      m.appendChild(mid);
    });
  }
  function clearMarks() {
    var ms = document.querySelectorAll('mark.vlc-hl'), parents = [];
    for (var i = ms.length - 1; i >= 0; i--) {
      var m = ms[i], p = m.parentNode;
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      p.removeChild(m);
      parents.push(p);
    }
    parents.forEach(function (p) { if (p.isConnected) p.normalize(); });
  }
  function renderMarks() {
    clearMarks();
    found = {}; pos = {};
    st.comments.forEach(function (c) {
      if (!c.quote) return;
      var ix = index(), hit = locate(ix, c);
      found[c.id] = !!hit;
      if (!hit) return;
      pos[c.id] = hit[0];
      if (c.status === 'open' || c.id === activeId) wrap(ix, hit[0], hit[1], c.id);
    });
  }

  /* ---------- UI ---------- */
  var pageCss = document.createElement('style');
  pageCss.textContent =
    'mark.vlc-hl{background:rgba(230,0,35,.13);color:inherit;border-bottom:2px solid rgba(230,0,35,.55);cursor:pointer;padding:0}' +
    'mark.vlc-hl.vlc-on{background:rgba(230,0,35,.3)}' +
    '@media (min-width:761px){html.vlc-mode{margin-right:340px}}' +
    '@media (max-width:760px){html.vlc-mode{padding-bottom:64px}}';
  document.head.appendChild(pageCss);
  document.documentElement.classList.add('vlc-mode');

  host = document.createElement('div');
  host.id = 'vlc-root';
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: 'open' });
  root.innerHTML = '<style>' +
    ':host{all:initial}' +
    '*{box-sizing:border-box}' +
    '.p{position:fixed;z-index:2147483000;top:0;right:0;width:340px;height:100%;background:#fff;border-left:1px solid #e2e8f0;display:flex;flex-direction:column;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#16181d}' +
    '.hd{padding:10px 12px 8px;border-bottom:1px solid #e2e8f0}' +
    '.t{display:flex;align-items:baseline;gap:6px;cursor:default}' +
    '.t b{font-size:13px}' +
    '.pg{color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}' +
    '.n{color:#E60023;font-weight:600}' +
    '.x{color:#64748b;text-decoration:none;font-size:16px;line-height:1;padding:0 2px}' +
    '.row{display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap}' +
    'button{font:inherit;border:1px solid #cbd5e1;background:#fff;color:#16181d;border-radius:4px;padding:3px 8px;cursor:pointer}' +
    'button:hover{border-color:#64748b}' +
    'button.pri{background:#E60023;border-color:#E60023;color:#fff}' +
    'button.lnk{border:0;padding:0;background:none;color:#0a3069;text-decoration:underline}' +
    '.st{display:inline-flex;align-items:center;gap:4px;color:#64748b;margin-right:auto}' +
    '.st i{width:7px;height:7px;border-radius:50%;background:#94a3b8;display:inline-block}' +
    '.st.ok i{background:#0d9488}.st.busy i,.st.pending i{background:#f59e0b}.st.err i{background:#E60023}.st.err{color:#E60023}' +
    '.setup{margin-top:8px;padding:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;color:#334155}' +
    '.setup input{width:100%;font:inherit;padding:4px 6px;border:1px solid #cbd5e1;border-radius:4px;margin:6px 0}' +
    '.cp{padding:10px 12px;border-bottom:1px solid #e2e8f0;background:#fffafa}' +
    '.cp textarea{width:100%;min-height:64px;font:inherit;font-size:13px;padding:6px;border:1px solid #cbd5e1;border-radius:4px;resize:vertical;margin-top:6px}' +
    '.cp textarea:focus{outline:none;border-color:#E60023}' +
    '.hint{color:#94a3b8}' +
    '.list{flex:1;overflow:auto;padding:4px 0}' +
    '.c{padding:8px 12px;border-bottom:1px solid #f1f5f9;cursor:pointer}' +
    '.c:hover{background:#f8fafc}.c.on{background:#fff1f2}' +
    '.c.resolved{opacity:.6}' +
    '.meta{display:flex;gap:6px;color:#64748b;font-size:11px}' +
    '.meta .sec{font-weight:600;color:#0a3069;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.meta .tm{margin-left:auto;white-space:nowrap}' +
    '.q{border-left:2px solid #E60023;padding-left:6px;margin:4px 0;color:#475569;font-style:italic;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}' +
    '.q.lost{border-left-color:#94a3b8;text-decoration:line-through}' +
    '.tx{font-size:13px;white-space:pre-wrap;word-wrap:break-word}' +
    '.rp{margin-top:4px;color:#0d9488;white-space:pre-wrap}' +
    '.ac{display:flex;gap:10px;margin-top:4px;color:#64748b;font-size:11px}' +
    '.ac span{color:#f59e0b}' +
    '.empty{padding:16px 12px;color:#64748b}' +
    '.ft{padding:6px 12px;border-top:1px solid #e2e8f0}' +
    '.add{position:fixed;z-index:2147483001;display:none;background:#E60023;color:#fff;border:0;border-radius:16px;padding:6px 12px;font:600 12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.2);cursor:pointer}' +
    '@media (max-width:760px){' +
    '.p{top:auto;bottom:0;width:100%;height:56px;border-left:0;border-top:1px solid #e2e8f0;box-shadow:0 -2px 10px rgba(0,0,0,.06)}' +
    '.p.ex{height:72vh}' +
    '.t{cursor:pointer}' +
    '.p:not(.ex) .list,.p:not(.ex) .ft,.p:not(.ex) .row,.p:not(.ex) .setup{display:none}' +
    '.add{left:50%;transform:translateX(-50%);bottom:68px;font-size:14px;padding:9px 16px}' +
    '}' +
    '</style>' +
    '<div class="p"><div class="hd">' +
    '<div class="t" data-a="toggle"><b>Comments</b><span class="n"></span><span class="pg"></span><a class="x" title="Exit comment mode">&times;</a></div>' +
    '<div class="row"><span class="st"><i></i><span class="stt"></span></span>' +
    '<button data-a="page">+ Page note</button><button data-a="copy">Copy open</button><button data-a="setup" title="Sync settings">Sync</button></div>' +
    '<div class="setup" hidden></div></div>' +
    '<div class="cp" hidden></div>' +
    '<div class="list"></div>' +
    '<div class="ft"><button class="lnk" data-a="resolved"></button></div></div>' +
    '<button class="add" data-a="add">+ Comment</button>';

  var P = root.querySelector('.p'), $ = function (s) { return root.querySelector(s); };
  $('.pg').textContent = page;
  $('.x').href = page;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ago(iso) {
    var d = (Date.now() - new Date(iso)) / 1000;
    if (!(d >= 0)) return '';
    if (d < 60) return 'now';
    if (d < 3600) return Math.floor(d / 60) + 'm';
    if (d < 86400) return Math.floor(d / 3600) + 'h';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  function setStatus(kind, text) {
    if (kind) status = { kind: kind, text: text };
    else if (localOnly) status = { kind: 'idle', text: 'Local only (private page)' };
    else if (!token()) status = { kind: 'idle', text: 'Local only, sync off' };
    var el = $('.st');
    el.className = 'st ' + status.kind;
    $('.stt').textContent = status.text;
  }
  function sorted() {
    var open = st.comments.filter(function (c) { return c.status === 'open'; });
    open.sort(function (a, b) {
      var pa = !a.quote ? -1 : (a.id in pos ? pos[a.id] : 1e12), pb = !b.quote ? -1 : (b.id in pos ? pos[b.id] : 1e12);
      return pa - pb || String(a.created).localeCompare(String(b.created));
    });
    var res = st.comments.filter(function (c) { return c.status !== 'open'; });
    res.sort(function (a, b) { return String(b.resolved || b.created).localeCompare(String(a.resolved || a.created)); });
    return { open: open, res: res };
  }
  function card(c) {
    var lost = c.quote && !found[c.id];
    return '<div class="c ' + (c.status === 'open' ? 'open' : 'resolved') + (c.id === activeId ? ' on' : '') + '" data-id="' + esc(c.id) + '">' +
      '<div class="meta"><span class="sec">' + esc(c.section || (c.quote ? '' : 'Whole page')) + '</span><span class="tm">' + esc(ago(c.created)) + '</span></div>' +
      (c.quote ? '<div class="q' + (lost ? ' lost' : '') + '" title="' + (lost ? 'This text is no longer on the page' : '') + '">' + esc(c.quote) + '</div>' : '') +
      '<div class="tx">' + esc(c.comment) + '</div>' +
      (c.reply ? '<div class="rp">&#8627; ' + esc((c.by ? c.by + ': ' : '') + c.reply) + '</div>' : '') +
      '<div class="ac"><button class="lnk" data-a="' + (c.status === 'open' ? 'resolve' : 'reopen') + '">' + (c.status === 'open' ? 'Resolve' : 'Reopen') + '</button>' +
      '<button class="lnk" data-a="del">Delete</button>' + (st.dirty[c.id] && canSync() ? '<span>unsynced</span>' : '') + '</div></div>';
  }
  function renderPanel() {
    var g = sorted();
    $('.n').textContent = g.open.length ? g.open.length + ' open' : '';
    var html = g.open.map(card).join('');
    if (!g.open.length) html = '<div class="empty">' + (mobile.matches ? 'Select text, then tap + Comment.' : 'Select text on the page to comment. Use "+ Page note" for the whole page.') + '</div>';
    if (showResolved) html += g.res.map(card).join('');
    $('.list').innerHTML = html;
    var f = $('[data-a="resolved"]');
    f.textContent = (showResolved ? 'Hide' : 'Show') + ' resolved (' + g.res.length + ')';
    f.style.display = g.res.length ? '' : 'none';
    P.classList.toggle('ex', expanded);
  }
  function render() { renderMarks(); renderPanel(); }

  function openComposer(anchor) {
    composing = anchor || { quote: '', prefix: '', suffix: '', section: '', context: '' };
    expanded = true;
    var cp = $('.cp');
    cp.hidden = false;
    cp.innerHTML = (composing.quote ? '<div class="q">' + esc(composing.quote) + '</div>' : '<div class="meta"><span class="sec">Whole page</span></div>') +
      '<textarea placeholder="Your comment"></textarea>' +
      '<div class="row"><button class="pri" data-a="save">Comment</button><button data-a="cancel">Cancel</button><span class="hint">' + (mobile.matches ? '' : 'Ctrl/Cmd+Enter') + '</span></div>';
    P.classList.add('ex');
    var ta = cp.querySelector('textarea');
    setTimeout(function () { ta.focus({ preventScroll: true }); }, 0);
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveComposer(); }
      if (e.key === 'Escape') closeComposer();
    });
  }
  function closeComposer() { composing = null; $('.cp').hidden = true; $('.cp').innerHTML = ''; }
  function saveComposer() {
    var ta = $('.cp textarea'), text = ta && ta.value.trim();
    if (!text || !composing) return;
    var c = {
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      created: new Date().toISOString(),
      status: 'open',
      section: composing.section,
      quote: composing.quote,
      prefix: composing.prefix,
      suffix: composing.suffix,
      context: composing.context,
      comment: text
    };
    st.comments.push(c);
    touch(c.id);
    closeComposer();
    activeId = c.id;
    try { window.getSelection().removeAllRanges(); } catch (e) {}
    hideAdd();
    render();
    schedule();
  }
  function focusComment(id, scrollPage) {
    activeId = id;
    expanded = true;
    render();
    var el = root.querySelector('.c[data-id="' + id + '"]');
    if (el) el.scrollIntoView({ block: 'nearest' });
    if (scrollPage) {
      var m = document.querySelector('mark.vlc-hl[data-vlc="' + id + '"]');
      if (m) m.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
  function copyOpen() {
    var g = sorted().open;
    var lines = ['Open comments on ' + SITE + page + ' (' + g.length + ')', 'Stored in ' + FILE + ' in github.com/' + REPO + '. Steps: COMMENTS.md.', ''];
    g.forEach(function (c, i) {
      lines.push((i + 1) + '. [' + (c.section || (c.quote ? 'no heading' : 'Whole page')) + ']' + (c.quote ? ' on "' + squish(c.quote) + '"' : ''));
      if (c.context && c.context !== squish(c.quote)) lines.push('   Context: ' + c.context);
      lines.push('   Comment: ' + c.comment.replace(/\n/g, '\n   '));
      lines.push('   id: ' + c.id);
    });
    var text = lines.join('\n'), btn = $('[data-a="copy"]');
    function done() { btn.textContent = 'Copied ' + g.length; setTimeout(function () { btn.textContent = 'Copy open'; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
    function fallback() {
      var t = document.createElement('textarea');
      t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(t);
    }
  }
  function renderSetup() {
    var s = $('.setup');
    if (localOnly) { s.innerHTML = 'This page is marked private. Comments stay in this browser. Use Copy open to hand them to an agent.'; return; }
    s.innerHTML = token()
      ? 'Sync is on. Comments save to <b>' + esc(FILE) + '</b> in ' + esc(REPO) + '.<div class="row"><button data-a="forget">Remove token from this browser</button></div>'
      : 'Paste a GitHub token with write access to ' + esc(REPO) + '. It stays in this browser only.<input type="password" placeholder="github_pat_..."><div class="row"><button class="pri" data-a="savetok">Save</button></div>';
  }

  /* ---------- events ---------- */
  root.addEventListener('click', function (e) {
    var a = e.target.closest('[data-a]'), cEl = e.target.closest('.c');
    var act = a && a.getAttribute('data-a');
    if (e.target.closest('.x')) return;
    if (act === 'toggle') { if (mobile.matches) { expanded = !expanded; renderPanel(); } return; }
    if (act === 'add') return;
    if (act === 'page') { openComposer(null); return; }
    if (act === 'save') { saveComposer(); return; }
    if (act === 'cancel') { closeComposer(); return; }
    if (act === 'copy') { copyOpen(); return; }
    if (act === 'setup') { var s = $('.setup'); s.hidden = !s.hidden; renderSetup(); return; }
    if (act === 'savetok') {
      var v = $('.setup input').value.trim();
      if (v) { lsSet(TKEY, v); $('.setup').hidden = true; setStatus('busy', 'Connecting...'); if (hasPending()) sync(0); else refresh(); }
      return;
    }
    if (act === 'forget') { lsSet(TKEY, null); renderSetup(); setStatus(); return; }
    if (act === 'resolved') { showResolved = !showResolved; renderPanel(); return; }
    if (cEl) {
      var id = cEl.getAttribute('data-id'), c = byId(id);
      if (!c) return;
      if (act === 'resolve' || act === 'reopen') {
        c.status = act === 'resolve' ? 'resolved' : 'open';
        if (act === 'resolve') { c.resolved = new Date().toISOString(); c.by = c.by || 'Rahul'; } else { delete c.resolved; }
        touch(id); render(); schedule(); return;
      }
      if (act === 'del') {
        if (!confirm('Delete this comment?')) return;
        st.comments = st.comments.filter(function (x) { return x.id !== id; });
        delete st.dirty[id];
        st.deleted[id] = ++tick + Date.now();
        render(); schedule(); return;
      }
      focusComment(id, true);
    }
  });
  document.addEventListener('click', function (e) {
    var m = e.target.closest && e.target.closest('mark.vlc-hl');
    if (m) focusComment(m.getAttribute('data-vlc'), false);
  });

  var addBtn = $('.add'), pendingSel = null, selT = null;
  function hideAdd() { addBtn.style.display = 'none'; pendingSel = null; }
  function updateAdd() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { hideAdd(); return; }
    var r = sel.getRangeAt(0);
    if (inUI(r.commonAncestorContainer) || !document.body.contains(r.commonAncestorContainer)) { hideAdd(); return; }
    pendingSel = anchorFromRange(r);
    if (!pendingSel) { hideAdd(); return; }
    addBtn.style.display = 'block';
    if (!mobile.matches) {
      var rect = r.getBoundingClientRect(), w = addBtn.offsetWidth || 90;
      var maxX = window.innerWidth - 340 - w - 8;
      addBtn.style.left = Math.max(8, Math.min(rect.right - w, maxX)) + 'px';
      addBtn.style.top = Math.min(window.innerHeight - 40, rect.bottom + 6) + 'px';
    } else { addBtn.style.left = ''; addBtn.style.top = ''; }
  }
  document.addEventListener('selectionchange', function () { clearTimeout(selT); selT = setTimeout(updateAdd, 120); });
  window.addEventListener('scroll', function () { if (addBtn.style.display === 'block' && !mobile.matches) updateAdd(); }, { passive: true });
  addBtn.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (pendingSel) { var a = pendingSel; hideAdd(); openComposer(a); }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.altKey && (e.key === 'm' || e.key === 'µ') && pendingSel) { e.preventDefault(); openComposer(pendingSel); hideAdd(); }
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
  setInterval(function () { if (!document.hidden) refresh(); }, 60000);
  window.addEventListener('load', function () { render(); });
  if (mobile.addEventListener) mobile.addEventListener('change', renderPanel);

  /* ---------- start ---------- */
  setStatus();
  render();
  refresh().then(function () { if (hasPending()) sync(0); });
  setTimeout(render, 1500);
  window.__vlc = { state: st, page: page, file: FILE, sync: function () { sync(0); }, refresh: refresh };
})();
