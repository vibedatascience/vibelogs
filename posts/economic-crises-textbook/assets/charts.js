/* Tiny SVG chart engine for the Economic Crises textbook.
   Renders line / area / bar / stacked-bar charts from data arrays into
   <div data-chart> placeholders. Colors come from CSS custom properties. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, attrs) {
    const t = el("text", Object.assign({ x, y, "font-size": 11, fill: css("--ink-2") }, attrs || {}), parent);
    t.textContent = s;
    return t;
  }

  // shared tooltip
  let tip;
  function showTip(html, ev) {
    if (!tip) { tip = document.createElement("div"); tip.className = "tip"; document.body.appendChild(tip); }
    tip.innerHTML = html; tip.style.display = "block";
    tip.style.left = Math.min(ev.clientX + 14, window.innerWidth - 180) + "px";
    tip.style.top = (ev.clientY + 14) + "px";
  }
  function hideTip() { if (tip) tip.style.display = "none"; }

  function niceTicks(min, max, n) {
    const span = max - min || 1;
    const step0 = span / (n || 5);
    const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    let step = mag;
    for (const m of [1, 2, 2.5, 5, 10]) { if (step0 <= m * mag) { step = m * mag; break; } }
    const t = [];
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) t.push(+v.toFixed(10));
    return t;
  }

  function scale(domain, range) {
    const [d0, d1] = domain, [r0, r1] = range;
    const f = (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);
    f.domain = domain; f.range = range;
    return f;
  }

  const SLOT = ["--s1", "--s2", "--s3", "--s4", "--s5", "--s6", "--s7", "--s8"];
  const color = (c, i) => c ? (c.startsWith("--") ? css(c) : c) : css(SLOT[i % 8]);

  /* ---------- line / area chart ----------
     cfg: {series:[{name, data:[[x,y],...], color, width, dash, area, label:[x,y,anchor]}],
           xTicks, xFmt, yFmt, yMin, yMax, yLabel, h, annotations:[{x,y,text,dx,dy,anchor}],
           vlines:[{x,label}], hlines:[{y,label}], bands:[{x0,x1}], legend:true} */
  function lineChart(root, cfg) {
    const W = 720, H = cfg.h || 340;
    const m = Object.assign({ t: 14, r: 16, b: 34, l: 48 }, cfg.margin || {});
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" }, root);
    if (cfg.title) el("title", {}, svg).textContent = cfg.title;

    let xs = [], ys = [];
    cfg.series.forEach(s => s.data.forEach(p => { xs.push(p[0]); ys.push(p[1]); }));
    (cfg.hlines || []).forEach(h => ys.push(h.y));
    const xMin = cfg.xMin ?? Math.min(...xs), xMax = cfg.xMax ?? Math.max(...xs);
    let yMin = cfg.yMin ?? Math.min(...ys), yMax = cfg.yMax ?? Math.max(...ys);
    if (yMin > 0 && cfg.zero !== false && yMin < (yMax - yMin)) yMin = 0;
    const pad = (yMax - yMin) * 0.06;
    if (cfg.yMax === undefined) yMax += pad;
    if (cfg.yMin === undefined && yMin !== 0) yMin -= pad;

    const x = scale([xMin, xMax], [m.l, W - m.r]);
    const y = scale([yMin, yMax], [H - m.b, m.t]);

    (cfg.bands || []).forEach(b => el("rect", {
      x: x(b.x0), y: m.t, width: x(b.x1) - x(b.x0), height: H - m.b - m.t,
      fill: css("--grid"), opacity: 0.5
    }, svg));

    const yTicks = cfg.yTicks || niceTicks(yMin, yMax, 5);
    yTicks.forEach(v => {
      el("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: css("--grid"), "stroke-width": 1 }, svg);
      txt(svg, m.l - 7, y(v) + 3.5, (cfg.yFmt || (d => d))(v), { "text-anchor": "end", "font-variant-numeric": "tabular-nums" });
    });
    const xt = cfg.xTicks || niceTicks(xMin, xMax, 8);
    xt.forEach(v => {
      txt(svg, x(v), H - m.b + 16, (cfg.xFmt || (d => d))(v), { "text-anchor": "middle", "font-variant-numeric": "tabular-nums" });
    });
    el("line", { x1: m.l, x2: W - m.r, y1: y(Math.max(yMin, Math.min(0, yMax))), y2: y(Math.max(yMin, Math.min(0, yMax))), stroke: css("--axis"), "stroke-width": 1.2 }, svg);

    (cfg.hlines || []).forEach(hl => {
      el("line", { x1: m.l, x2: W - m.r, y1: y(hl.y), y2: y(hl.y), stroke: css("--muted"), "stroke-dasharray": "4 4" }, svg);
      if (hl.label) txt(svg, W - m.r - 4, y(hl.y) - 5, hl.label, { "text-anchor": "end", fill: css("--ink-2") });
    });
    (cfg.vlines || []).forEach(vl => {
      el("line", { x1: x(vl.x), x2: x(vl.x), y1: m.t, y2: H - m.b, stroke: css("--muted"), "stroke-dasharray": "4 4" }, svg);
      if (vl.label) txt(svg, x(vl.x) + 4, m.t + 10, vl.label, { fill: css("--ink-2") });
    });
    if (cfg.yLabel) txt(svg, m.l - 36, m.t + 2, cfg.yLabel, { "font-size": 10.5 });

    cfg.series.forEach((s, i) => {
      const c = color(s.color, i);
      const pts = s.data.map(p => `${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join(" ");
      if (s.area) {
        const d = `M${x(s.data[0][0])},${y(Math.max(yMin, 0))} L` + pts + ` L${x(s.data[s.data.length - 1][0])},${y(Math.max(yMin, 0))} Z`;
        el("path", { d, fill: c, opacity: 0.15, stroke: "none" }, svg);
      }
      el("polyline", {
        points: pts, fill: "none", stroke: c,
        "stroke-width": s.width || 2, "stroke-linejoin": "round", "stroke-linecap": "round",
        "stroke-dasharray": s.dash || "none"
      }, svg);
      if (s.label) {
        const [lx, ly, anchor] = s.label;
        txt(svg, x(lx), y(ly), s.name, { fill: c, "font-weight": 650, "text-anchor": anchor || "start", "font-size": 11.5 });
      }
    });

    (cfg.annotations || []).forEach(a => {
      if (a.px !== undefined) el("circle", { cx: x(a.px), cy: y(a.py), r: 3, fill: css("--ink-1") }, svg);
      const lines = a.text.split("\n");
      lines.forEach((ln, j) => txt(svg, x(a.x), y(a.y) + j * 13, ln, { "text-anchor": a.anchor || "start", fill: css("--ink-2"), "font-size": 10.5 }));
      if (a.arrow) el("line", { x1: x(a.arrow[0]), y1: y(a.arrow[1]), x2: x(a.arrow[2]), y2: y(a.arrow[3]), stroke: css("--muted"), "stroke-width": 1 }, svg);
    });

    // hover crosshair
    const hoverLine = el("line", { y1: m.t, y2: H - m.b, stroke: css("--muted"), "stroke-width": 1, opacity: 0 }, svg);
    svg.addEventListener("mousemove", (ev) => {
      const r = svg.getBoundingClientRect();
      const mx = ((ev.clientX - r.left) / r.width) * W;
      if (mx < m.l || mx > W - m.r) { hoverLine.setAttribute("opacity", 0); hideTip(); return; }
      hoverLine.setAttribute("x1", mx); hoverLine.setAttribute("x2", mx); hoverLine.setAttribute("opacity", 0.6);
      const xv = xMin + ((mx - m.l) / (W - m.r - m.l)) * (xMax - xMin);
      let html = `<b>${(cfg.xFmt || (d => Math.round(d)))(xv)}</b>`;
      cfg.series.forEach((s, i) => {
        let best = null;
        for (const p of s.data) if (!best || Math.abs(p[0] - xv) < Math.abs(best[0] - xv)) best = p;
        if (best && Math.abs(best[0] - xv) < (xMax - xMin) / 8)
          html += `<br><span style="color:${color(s.color, i)}">●</span> ${s.name}: ${(cfg.yFmt || (d => d))(+best[1].toFixed(2))}`;
      });
      showTip(html, ev);
    });
    svg.addEventListener("mouseleave", () => { hoverLine.setAttribute("opacity", 0); hideTip(); });

    if (cfg.legend) legend(root, cfg.series.map((s, i) => [s.name, color(s.color, i)]));
    return svg;
  }

  /* ---------- bar chart (grouped or single, vertical) ----------
     cfg: {cats:[...], series:[{name, data:[...], color}], yFmt, h, direct:true} */
  function barChart(root, cfg) {
    const W = 720, H = cfg.h || 320;
    const m = Object.assign({ t: 16, r: 12, b: cfg.rotate ? 74 : 40, l: 46 }, cfg.margin || {});
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}` }, root);
    const all = cfg.series.flatMap(s => s.data);
    let yMax = cfg.yMax ?? Math.max(...all) * 1.12;
    let yMin = cfg.yMin ?? Math.min(0, ...all);
    const y = scale([yMin, yMax], [H - m.b, m.t]);
    const n = cfg.cats.length, ns = cfg.series.length;
    const slot = (W - m.l - m.r) / n;
    const bw = Math.min(slot * 0.72 / ns, 64);

    niceTicks(yMin, yMax, 5).forEach(v => {
      el("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: css("--grid") }, svg);
      txt(svg, m.l - 7, y(v) + 3.5, (cfg.yFmt || (d => d))(v), { "text-anchor": "end", "font-variant-numeric": "tabular-nums" });
    });
    el("line", { x1: m.l, x2: W - m.r, y1: y(Math.max(0, yMin)), y2: y(Math.max(0, yMin)), stroke: css("--axis"), "stroke-width": 1.2 }, svg);

    cfg.cats.forEach((c, ci) => {
      const cx = m.l + slot * ci + slot / 2;
      cfg.series.forEach((s, si) => {
        const v = s.data[ci];
        if (v === null || v === undefined) return;
        const bx = cx - (ns * bw) / 2 + si * bw;
        const y0 = y(Math.max(0, v)), y1 = y(Math.min(0, v));
        const hgt = Math.max(Math.abs(y1 - y0), 1);
        const r = el("rect", {
          x: bx + 1, y: y0, width: bw - 2, height: hgt,
          fill: color(s.color, si), rx: 3
        }, svg);
        r.addEventListener("mousemove", ev => showTip(`<b>${c}</b><br>${s.name}: ${(cfg.yFmt || (d => d))(v)}`, ev));
        r.addEventListener("mouseleave", hideTip);
        if (cfg.direct) txt(svg, bx + bw / 2, y0 - 5, (cfg.yFmt || (d => d))(v), { "text-anchor": "middle", "font-size": 10.5, fill: css("--ink-1"), "font-weight": 600 });
      });
      const label = txt(svg, cx, H - m.b + 16, c, { "text-anchor": cfg.rotate ? "end" : "middle", "font-size": 10.5 });
      if (cfg.rotate) label.setAttribute("transform", `rotate(-40 ${cx} ${H - m.b + 16})`);
    });
    if (cfg.legend !== false && ns > 1) legend(root, cfg.series.map((s, i) => [s.name, color(s.color, i)]));
    return svg;
  }

  /* ---------- stacked bar ----------
     cfg {cats, series:[{name,data,color}], yFmt, h, labels:[[ci,si,"57%"],...]} */
  function stackedBar(root, cfg) {
    const W = 720, H = cfg.h || 330;
    const m = Object.assign({ t: 16, r: 12, b: 42, l: 52 }, cfg.margin || {});
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}` }, root);
    const n = cfg.cats.length;
    const posT = cfg.cats.map((_, i) => cfg.series.reduce((a, s) => a + Math.max(0, s.data[i] || 0), 0));
    const negT = cfg.cats.map((_, i) => cfg.series.reduce((a, s) => a + Math.min(0, s.data[i] || 0), 0));
    const yMax = cfg.yMax ?? Math.max(...posT) * 1.08;
    const yMin = cfg.yMin ?? Math.min(0, ...negT) * 1.08;
    const y = scale([yMin, yMax], [H - m.b, m.t]);
    const slot = (W - m.l - m.r) / n;
    const bw = Math.min(slot * 0.66, 90);

    niceTicks(yMin, yMax, 5).forEach(v => {
      el("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: css("--grid") }, svg);
      txt(svg, m.l - 7, y(v) + 3.5, (cfg.yFmt || (d => d))(v), { "text-anchor": "end", "font-variant-numeric": "tabular-nums" });
    });
    el("line", { x1: m.l, x2: W - m.r, y1: y(0), y2: y(0), stroke: css("--axis"), "stroke-width": 1.2 }, svg);

    cfg.cats.forEach((c, ci) => {
      const cx = m.l + slot * ci + slot / 2;
      let up = 0, dn = 0;
      cfg.series.forEach((s, si) => {
        const v = s.data[ci] || 0; if (!v) return;
        let y0, y1;
        if (v > 0) { y0 = y(up + v); y1 = y(up); up += v; }
        else { y0 = y(dn); y1 = y(dn + v); dn += v; }
        const r = el("rect", {
          x: cx - bw / 2, y: Math.min(y0, y1) + 1, width: bw, height: Math.max(Math.abs(y1 - y0) - 2, 1),
          fill: color(s.color, si), rx: 2
        }, svg);
        r.addEventListener("mousemove", ev => showTip(`<b>${c}</b><br>${s.name}: ${(cfg.yFmt || (d => d))(v)}`, ev));
        r.addEventListener("mouseleave", hideTip);
      });
      const label = txt(svg, cx, H - m.b + 16, c, { "text-anchor": cfg.rotate ? "end" : "middle", "font-size": 10.5 });
      if (cfg.rotate) label.setAttribute("transform", `rotate(-30 ${cx} ${H - m.b + 16})`);
    });
    (cfg.labels || []).forEach(([ci, si, s2]) => {
      const cx = m.l + slot * ci + slot / 2;
      let up = 0; for (let k = 0; k < si; k++) up += Math.max(0, cfg.series[k].data[ci] || 0);
      const v = cfg.series[si].data[ci];
      txt(svg, cx, y(up + v / 2) + 4, s2, { "text-anchor": "middle", fill: "#fff", "font-weight": 650, "font-size": 11.5 });
    });
    if (cfg.line) { // overlay line series [{x-index,y}]
      const pts = cfg.line.data.map((v, i) => `${m.l + slot * i + slot / 2},${y(v)}`).join(" ");
      el("polyline", { points: pts, fill: "none", stroke: css("--muted"), "stroke-width": 2 }, svg);
    }
    legend(root, cfg.series.map((s, i) => [s.name, color(s.color, i)]).concat(cfg.line ? [[cfg.line.name, css("--muted")]] : []));
    return svg;
  }

  function legend(root, items) {
    const d = document.createElement("div");
    d.style.cssText = "display:flex;flex-wrap:wrap;gap:.4rem 1.1rem;font-family:var(--sans);font-size:.78rem;color:var(--ink-2);margin-top:.45rem";
    items.forEach(([name, c]) => {
      const s = document.createElement("span");
      s.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${c};margin-right:.35rem;vertical-align:-1px"></span>${name}`;
      d.appendChild(s);
    });
    root.appendChild(d);
  }

  window.EC = { lineChart, barChart, stackedBar, el, txt, css, scale, niceTicks, legend, showTip, hideTip };

  // theme toggle
  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector("button.theme");
    if (btn) btn.addEventListener("click", () => {
      const r = document.documentElement;
      const cur = r.getAttribute("data-theme") ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      r.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
      // re-render charts with new palette
      document.querySelectorAll("[data-chart]").forEach(d => { d.innerHTML = ""; });
      if (window.renderCharts) window.renderCharts();
    });
    if (window.renderCharts) window.renderCharts();
  });
})();
