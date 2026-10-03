// State tiles: shared code for the index and the map pages.
(function () {
  var COL = ['#0783c8', '#7bccf9', '#fe5e32'];
  var G = {AK:[0,0],ME:[10,0],WA:[0,1],ID:[1,1],MT:[2,1],ND:[3,1],MN:[4,1],IL:[5,1],WI:[6,1],MI:[7,1],NY:[8,1],VT:[9,1],NH:[10,1],
    OR:[0,2],NV:[1,2],WY:[2,2],SD:[3,2],IA:[4,2],IN:[5,2],OH:[6,2],PA:[7,2],NJ:[8,2],RI:[9,2],MA:[10,2],
    CA:[0,3],UT:[1,3],CO:[2,3],NE:[3,3],MO:[4,3],KY:[5,3],WV:[6,3],VA:[7,3],MD:[8,3],CT:[9,3],
    AZ:[1,4],NM:[2,4],KS:[3,4],AR:[4,4],TN:[5,4],NC:[6,4],SC:[7,4],DC:[8,4],DE:[9,4],
    OK:[3,5],LA:[4,5],MS:[5,5],AL:[6,5],GA:[7,5],HI:[0,6],TX:[3,6],FL:[8,6]};
  var root = document.body.getAttribute('data-root') || './';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function getJSON(u) { return fetch(u).then(function (r) { return r.json(); }); }
  function years(m, d) { return d ? d.years[0] + '-' + d.years[d.years.length - 1] : ''; }

  function card(m) {
    return '<a class="card" href="' + root + m.slug + '/">' +
      '<img src="' + root + 'thumbs/' + m.slug + '.png" alt="' + esc(m.title) + '" loading="lazy" width="720" height="456">' +
      '<div class="topic">' + esc(m.topic) + '</div>' +
      '<div class="title">' + esc(m.title) + '</div>' +
      '<div class="meta">' + esc(m.years) + ' &middot; ' + esc(m.short_source) + '</div></a>';
  }

  // ---------- index ----------
  function index(cat) {
    // old links like /state-tiles/#taxes go to the map's own page
    function jump() {
      var h = location.hash.slice(1);
      if (h && cat.maps.some(function (m) { return m.slug === h; })) { location.replace(root + h + '/'); return true; }
    }
    window.addEventListener('hashchange', jump);
    if (jump()) return;
    var st = { topic: 'All', q: '' };
    $('count').textContent = cat.maps.length + ' maps';
    function render() {
      var tabs = ['All'].concat(cat.topics);
      $('tabs').innerHTML = tabs.map(function (t) {
        var n = t === 'All' ? cat.maps.length : cat.maps.filter(function (m) { return m.topic === t; }).length;
        return '<button data-t="' + esc(t) + '" class="' + (st.topic === t ? 'active' : '') + '">' + esc(t) + ' <span>' + n + '</span></button>';
      }).join('');
      var q = st.q.trim().toLowerCase();
      var shown = cat.maps.filter(function (m) {
        var hay = (m.title + ' ' + m.topic + ' ' + m.caption + ' ' + m.short_source + ' ' + m.years).toLowerCase();
        return (st.topic === 'All' || m.topic === st.topic) && (!q || hay.indexOf(q) > -1);
      });
      $('cards').innerHTML = shown.map(card).join('');
      $('empty').hidden = shown.length > 0;
    }
    $('tabs').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      st.topic = b.getAttribute('data-t'); render();
    });
    $('q').addEventListener('input', function (e) { st.q = e.target.value; render(); });
    render();
  }

  // ---------- map page ----------
  function mapPage(cat, slug) {
    var i = -1;
    cat.maps.forEach(function (m, k) { if (m.slug === slug) i = k; });
    var m = cat.maps[i], N = cat.maps.length;
    var prev = cat.maps[(i - 1 + N) % N], next = cat.maps[(i + 1) % N];
    $('topic').textContent = m.topic;
    $('pos').textContent = (i + 1) + ' of ' + N;
    $('prev').href = root + prev.slug + '/'; $('prev').innerHTML = '&lsaquo; ' + esc(prev.title);
    $('next').href = root + next.slug + '/'; $('next').innerHTML = esc(next.title) + ' &rsaquo;';
    $('caption').textContent = m.caption;
    $('note').textContent = m.note;
    var L = '<a href="' + root + 'img/' + slug + '.png">Poster (PNG)</a><a href="' + root + 'data/' + slug + '.csv">Data (CSV)</a>';
    m.sources.forEach(function (s) { L += '<a href="' + esc(s[1]) + '">' + esc(s[0]) + '</a>'; });
    $('links').innerHTML = L;
    var same = cat.maps.filter(function (x) { return x.topic === m.topic && x.slug !== slug; });
    if (same.length) { $('more-h').textContent = 'More in ' + m.topic; $('more-cards').innerHTML = same.map(card).join(''); }
    else { $('more').hidden = true; }

    getJSON(root + 'data/' + slug + '.json').then(function (set) {
      $('years').textContent = years(m, set) + (set.type === 'margin' ? " \u00b7 winner's lead over the runner-up, up to 60 points" : '');
      var lg = '';
      for (var k = 2; k >= 0; k--) lg += '<span style="color:' + COL[k] + '">' + esc(set.labels[k]) + '</span>';
      $('legend').innerHTML = lg;
      drawGrid($('grid'), set);
    });
  }

  function drawGrid(svg, set) {
    var T = 100, GAP = 7, STEP = T + GAP, W = 11 * STEP - GAP, H = 7 * STEP - GAP, NS = 'http://www.w3.org/2000/svg';
    var yrs = set.years, y0 = yrs[0], y1 = yrs[yrs.length - 1], cross, sel;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    function el(tag, a) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); return e; }
    function marginTile(g, rows, X) {
      var cap = set.cap || 60, mid = T / 2, pts = [], first = null, step = X(yrs[1]) - X(yrs[0]);
      for (var i = 0; i < yrs.length; i++) {
        var r = rows[i]; if (!r) continue;
        if (first === null) first = X(yrs[i]);
        pts.push([X(yrs[i]), Math.max(-cap, Math.min(cap, r[0]))]);
      }
      if (first === null) return;
      g.appendChild(el('rect', { x: first, y: 0, width: T - first, height: T, fill: '#ffffff' }));
      var P = [pts[0]];   // add a point wherever the line crosses zero
      for (var k = 1; k < pts.length; k++) {
        var a = pts[k - 1], b = pts[k];
        if (a[1] * b[1] < 0) { var t = a[1] / (a[1] - b[1]); P.push([a[0] + t * (b[0] - a[0]), 0]); }
        P.push(b);
      }
      function area(sign, color) {
        var d = 'M' + P[0][0] + ',' + mid;
        P.forEach(function (p) { var v = sign > 0 ? Math.max(0, p[1]) : Math.min(0, p[1]); d += ' L' + p[0] + ',' + (mid - v / cap * mid); });
        d += ' L' + P[P.length - 1][0] + ',' + mid + 'Z';
        g.appendChild(el('path', { d: d, fill: color }));
      }
      area(1, COL[2]); area(-1, COL[0]);
      for (var i2 = 0; i2 < yrs.length; i2++) {
        var r2 = rows[i2]; if (!r2 || r2[1] !== 'O') continue;
        var hh = Math.max(Math.min(r2[3] - r2[6], cap) / cap * mid, 2);
        g.appendChild(el('rect', { x: X(yrs[i2]) - step * 0.45, y: mid - hh / 2, width: step * 0.9, height: hh, fill: COL[1] }));
      }
      g.appendChild(el('line', { x1: first, x2: T, y1: mid, y2: mid, stroke: '#111', 'stroke-width': 0.7, 'stroke-opacity': 0.55 }));
    }
    Object.keys(G).forEach(function (st) {
      var c = G[st], rows = set.s[st] || [];
      var g = el('g', { transform: 'translate(' + c[0] * STEP + ',' + c[1] * STEP + ')' });
      g.appendChild(el('rect', { x: 0, y: 0, width: T, height: T, fill: '#efefef' }));
      var X = function (yr) { return (yr - y0) / (y1 - y0) * T; };
      if (set.type === 'margin') { marginTile(g, rows, X); }
      else {
      var seg = [], segs = [];
      for (var i = 0; i < yrs.length; i++) { var r = rows[i]; if (r && r[0] != null) seg.push(i); else if (seg.length) { segs.push(seg); seg = []; } }
      if (seg.length) segs.push(seg);
      segs.forEach(function (sg) {
        var xs = sg.map(function (i) { return X(yrs[i]); });
        if (sg.length === 1) { var x = xs[0]; xs = [Math.max(0, x - 0.8), Math.min(T, x + 0.8)]; sg = [sg[0], sg[0]]; }
        var a = sg.map(function (i) { return T - rows[i][0] / 100 * T; });
        var b = sg.map(function (i) { return T - (rows[i][0] + rows[i][1]) / 100 * T; });
        var top = 'M' + xs[0] + ',0 ' + xs.map(function (x, j) { return 'L' + x + ',' + b[j]; }).join(' ') + ' L' + xs[xs.length - 1] + ',0Z';
        var fb = xs.map(function (x, j) { return x + ',' + b[j]; }), ra = xs.map(function (x, j) { return x + ',' + a[j]; }).reverse();
        var mid = 'M' + fb.join(' L') + ' L' + ra.join(' L') + 'Z';
        var bot = 'M' + xs[0] + ',' + T + ' ' + xs.map(function (x, j) { return 'L' + x + ',' + a[j]; }).join(' ') + ' L' + xs[xs.length - 1] + ',' + T + 'Z';
        g.appendChild(el('path', { d: top, fill: COL[2] }));
        g.appendChild(el('path', { d: mid, fill: COL[1] }));
        g.appendChild(el('path', { d: bot, fill: COL[0] }));
      });
      }
      var t = el('text', { x: T - 6, y: T - 7, 'text-anchor': 'end', 'class': set.type === 'margin' ? 'lbl halo' : 'lbl' }); t.textContent = st; g.appendChild(t);
      var hit = el('rect', { x: 0, y: 0, width: T, height: T, 'class': 'hit' }); hit.setAttribute('data-st', st); g.appendChild(hit);
      svg.appendChild(g);
    });
    cross = el('line', { 'class': 'cross', x1: 0, x2: 0, y1: 0, y2: T, visibility: 'hidden' }); svg.appendChild(cross);
    sel = el('rect', { 'class': 'sel', width: T, height: T, visibility: 'hidden' }); svg.appendChild(sel);

    function fmt(v) { return v == null ? '-' : (v < 10 ? v.toFixed(1) : Math.round(v)) + '%'; }
    function show(st, fx) {
      var rows = set.s[st] || [], c = G[st];
      fx = Math.max(0, Math.min(1, fx));
      var yr = y0 + fx * (y1 - y0), best = 0;
      for (var i = 1; i < yrs.length; i++) if (Math.abs(yrs[i] - yr) < Math.abs(yrs[best] - yr)) best = i;
      var x = c[0] * STEP + (yrs[best] - y0) / (y1 - y0) * T;
      cross.setAttribute('x1', x); cross.setAttribute('x2', x); cross.setAttribute('y1', c[1] * STEP); cross.setAttribute('y2', c[1] * STEP + T); cross.setAttribute('visibility', 'visible');
      sel.setAttribute('x', c[0] * STEP); sel.setAttribute('y', c[1] * STEP); sel.setAttribute('visibility', 'visible');
      var r = rows[best], h = '<b>' + esc(set.names[st]) + ', ' + yrs[best] + '</b>';
      var PC = { D: COL[0], O: COL[1], R: COL[2] }, PL = { D: 'D', O: '3rd', R: 'R' };
      if (set.type === 'margin' && r) {
        h += '<span class="v"><i style="background:' + PC[r[1]] + '"></i>' + esc(r[2]) + ' (' + PL[r[1]] + ') ' + r[3].toFixed(1) + '%</span>' +
             '<span class="v"><i style="background:' + PC[r[5]] + '"></i>' + esc(r[4]) + ' (' + PL[r[5]] + ') ' + r[6].toFixed(1) + '%</span>' +
             '<span class="v">lead ' + (r[3] - r[6]).toFixed(1) + ' pts</span>';
      }
      else if (!r || r[0] == null) h += ' <span class="hint">no data</span>';
      else {
        var v = [r[0], r[1], Math.max(0, 100 - r[0] - r[1])];
        for (var k = 2; k >= 0; k--) h += '<span class="v"><i style="background:' + COL[k] + '"></i>' + esc(set.labels[k]) + ' ' + fmt(v[k]) + '</span>';
      }
      $('readout').innerHTML = h;
    }
    function onMove(e) {
      var st = e.target.getAttribute && e.target.getAttribute('data-st'); if (!st) return;
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var p = pt.matrixTransform(svg.getScreenCTM().inverse());
      show(st, (p.x - G[st][0] * STEP) / T);
    }
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerdown', onMove);
  }

  getJSON(root + 'catalog.json').then(function (cat) {
    // years for cards come from the data files' first and last year, kept in the catalog by the build script
    var slug = document.body.getAttribute('data-slug');
    if (slug) mapPage(cat, slug); else index(cat);
  });
})();
