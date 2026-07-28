"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CatalogBook } from "./catalog";

type Chapter = { title: string; body: string };
type Phase = "rising" | "opening" | "reading" | "closing";

const MARK = /^\s*(chapter|act|scene|letter|book|part|canto|volume)\s+([ivxlcdm]+|\d+)\b/i;

function splitChapters(raw: string): Chapter[] {
  const lines = raw.split("\n");
  const marks: { i: number; title: string }[] = [];
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.length > 0 && t.length < 90 && MARK.test(t)) marks.push({ i, title: t });
  });
  const out: Chapter[] = [];
  if (marks.length >= 3) {
    if (marks[0].i > 0) {
      out.push({ title: "Front matter", body: lines.slice(0, marks[0].i).join("\n") });
    }
    marks.forEach((m, k) => {
      const end = k + 1 < marks.length ? marks[k + 1].i : lines.length;
      let title = m.title;
      const next = (lines[m.i + 1] ?? "").trim();
      if (next && next.length < 70 && !MARK.test(next) && /[a-z]/i.test(next)) {
        title += " \u00b7 " + next;
      }
      out.push({ title, body: lines.slice(m.i, end).join("\n") });
    });
  } else {
    const paras = raw.split(/\n{2,}/);
    let buf: string[] = [];
    let size = 0;
    let n = 1;
    for (const p of paras) {
      buf.push(p);
      size += p.length;
      if (size > 14000) {
        out.push({ title: "Section " + n++, body: buf.join("\n\n") });
        buf = [];
        size = 0;
      }
    }
    if (buf.length) out.push({ title: "Section " + n, body: buf.join("\n\n") });
    return out;
  }
  const solid = out.filter((c) => c.body.replace(/\s+/g, " ").trim().length >= 600);
  if (solid.length >= 3) return solid;
  const paras = raw.split(/\n{2,}/);
  const chunks: Chapter[] = [];
  let buf: string[] = [];
  let size = 0;
  let n = 1;
  for (const p of paras) {
    buf.push(p);
    size += p.length;
    if (size > 14000) {
      chunks.push({ title: "Section " + n++, body: buf.join("\n\n") });
      buf = [];
      size = 0;
    }
  }
  if (buf.length) chunks.push({ title: "Section " + n, body: buf.join("\n\n") });
  return chunks;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function chapterHtml(c: Chapter) {
  const paras = c.body.split(/\n{2,}/).filter((p) => p.trim());
  let html = '<h2 class="rdr-h">' + esc(c.title.slice(0, 90)) + "</h2>";
  let first = true;
  paras.forEach((p, idx) => {
    const ls = p.split("\n").filter((l) => l.trim());
    if (!ls.length) return;
    if (idx === 0 && ls.length === 1 && ls[0].trim().length < 90) return;
    const avg = ls.reduce((a, l) => a + l.trim().length, 0) / ls.length;
    if (ls.length > 1 && avg < 52) {
      html += '<p class="rdr-verse">' + ls.map((l) => esc(l.trim())).join("<br>") + "</p>";
    } else {
      html += '<p class="' + (first ? "rdr-first" : "") + '">' + esc(ls.map((l) => l.trim()).join(" ")) + "</p>";
      first = false;
    }
  });
  return html;
}

export function VolumeReader({ book, onClose }: { book: CatalogBook; onClose: () => void }) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [ch, setCh] = useState(0);
  const [spread, setSpread] = useState(0);
  const [cols, setCols] = useState(1);
  const [fs, setFs] = useState(1.05);
  const [phase, setPhase] = useState<Phase>("rising");
  const [tocOpen, setTocOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turning, setTurning] = useState<0 | 1 | -1>(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState({ colW: 0, gap: 96, per: 2 });
  const geom = useRef({ colW: 0, gap: 96, per: 2 });
  const storeKey = "gutenberg-shelf:" + (book.gutenbergId ?? book.id);

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    let dead = false;
    const t1 = window.setTimeout(() => !dead && setPhase("opening"), 240);
    const t2 = window.setTimeout(() => !dead && setPhase("reading"), 1500);
    return () => {
      dead = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    let dead = false;
    const id = book.gutenbergId;
    if (!id) {
      setError("no text bundled for this volume");
      return;
    }
    fetch("reader/texts/" + id + ".txt")
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("HTTP " + r.status))))
      .then((raw) => {
        if (dead) return;
        const cs = splitChapters(raw);
        setChapters(cs);
        try {
          const saved = JSON.parse(window.localStorage.getItem(storeKey) ?? "null");
          if (saved && typeof saved.ch === "number") {
            setCh(Math.min(cs.length - 1, saved.ch));
            if (typeof saved.fs === "number") setFs(saved.fs);
          }
        } catch {}
      })
      .catch((e) => !dead && setError(String(e.message ?? e)));
    return () => {
      dead = true;
    };
  }, [book, storeKey]);

  const measure = useCallback(() => {
    const flow = flowRef.current;
    const view = viewRef.current;
    if (!flow || !view) return;
    const narrow = window.innerWidth <= 860;
    const gap = narrow ? 0 : 96;
    const per = narrow ? 1 : 2;
    const colW = narrow ? view.clientWidth : (view.clientWidth - gap) / 2;
    geom.current = { colW, gap, per };
    setGeo({ colW, gap, per });
    flow.style.columnGap = gap + "px";
    flow.style.columnWidth = colW + "px";
    flow.style.fontSize = fs + "rem";
    setCols(Math.max(1, Math.round(flow.scrollWidth / (colW + gap))));
  }, [fs]);

  const html = useMemo(() => (chapters[ch] ? chapterHtml(chapters[ch]) : ""), [chapters, ch]);

  useLayoutEffect(() => {
    measure();
    setSpread(0);
  }, [html, measure]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storeKey, JSON.stringify({ ch, spread, fs }));
    } catch {}
  }, [spread, ch, fs, storeKey]);

  useEffect(() => {
    let t: number;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(measure, 180);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, [measure]);

  const maxSpread = Math.max(0, Math.ceil(cols / geom.current.per) - 1);

  const close = useCallback(() => {
    setPhase("closing");
    window.setTimeout(onClose, 620);
  }, [onClose]);

  const page = useCallback(
    (dir: 1 | -1) => {
      if (phase !== "reading" || !chapters.length) return;
      rootRef.current?.focus({ preventScroll: true });
      const last = Math.max(0, Math.ceil(cols / geo.per) - 1);
      if (dir > 0 && spread >= last) {
        if (ch < chapters.length - 1) {
          setTurning(1);
          setCh(ch + 1);
          window.setTimeout(() => setTurning(0), 430);
        }
        return;
      }
      if (dir < 0 && spread <= 0) {
        if (ch > 0) {
          setTurning(-1);
          setCh(ch - 1);
          window.setTimeout(() => setTurning(0), 430);
        }
        return;
      }
      setTurning(dir);
      setSpread(spread + dir);
      window.setTimeout(() => setTurning(0), 430);
    },
    [phase, cols, spread, ch, chapters.length, geo.per],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        page(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        page(-1);
      }
    };
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [page, close]);

  const touch = useRef(0);
  const left = spread * geo.per + 1;
  const progress = chapters.length
    ? ((ch + (maxSpread ? spread / (maxSpread + 1) : 0)) / chapters.length) * 100
    : 0;

  return (
    <div
      className={"rdr rdr--" + phase}
      role="dialog"
      aria-modal="true"
      aria-label={"Reading " + book.title}
      data-testid="volume-reader"
      tabIndex={-1}
      ref={rootRef}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
      }}
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 46) page(dx < 0 ? 1 : -1);
      }}
    >
      <div className="rdr-scrim" onClick={close} />

      <div className="rdr-bar">
        <button type="button" onClick={close} data-testid="reader-close">
          &larr; back to the shelf
        </button>
        <button type="button" onClick={() => setTocOpen((v) => !v)} disabled={!chapters.length}>
          contents
        </button>
        <button type="button" onClick={() => setFs((v) => Math.max(0.82, v - 0.08))}>
          A-
        </button>
        <button type="button" onClick={() => setFs((v) => Math.min(1.5, v + 0.08))}>
          A+
        </button>
        <span className="rdr-crumb">
          {book.title}
          {chapters[ch] ? ", " + chapters[ch].title.slice(0, 46) : ""}
        </span>
        <a href={book.url} target="_blank" rel="noreferrer">
          gutenberg.org &#8599;
        </a>
      </div>

      {tocOpen ? (
        <nav className="rdr-toc">
          {chapters.map((c, i) => (
            <button
              key={i}
              type="button"
              className={i === ch ? "on" : ""}
              onClick={() => {
                setCh(i);
                setTocOpen(false);
              }}
            >
              {c.title.slice(0, 62)}
            </button>
          ))}
        </nav>
      ) : null}

      <div className="rdr-stage">
        <div className="rdr-book">
          <div className="rdr-spread">
            <div className="rdr-leaf">
              <div className="rdr-view" ref={viewRef}>
                <div
                  className="rdr-flow"
                  ref={flowRef}
                  style={{
                    transform:
                      "translateX(" +
                      -spread * geo.per * (geo.colW + geo.gap) +
                      "px)",
                  }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
              <div className="rdr-nums">
                <span>{cols ? left : ""}</span>
                <span>{geo.per === 2 && left + 1 <= cols ? left + 1 : ""}</span>
              </div>
            </div>
            <button
              type="button"
              className="rdr-hit rdr-hit--l"
              aria-label="Previous page"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => page(-1)}
            />
            <button
              type="button"
              className="rdr-hit rdr-hit--r"
              aria-label="Next page"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => page(1)}
            />
            <div
              className={
                "rdr-turn" + (turning === 1 ? " go" : turning === -1 ? " goback" : "")
              }
            />
            {error ? <div className="rdr-error">{error}</div> : null}
            {!chapters.length && !error ? <div className="rdr-error">opening...</div> : null}
          </div>

          <div className="rdr-cover">
            <div className="rdr-face">
              {book.coverImage ? (
                <img src={book.coverImage} alt="" />
              ) : (
                <div className="rdr-plain" style={{ background: book.cover, color: book.ink }}>
                  <span>{book.shortTitle}</span>
                </div>
              )}
            </div>
            <div className="rdr-face rdr-face--back" />
          </div>
        </div>
      </div>

      <div className="rdr-prog">
        <i style={{ width: progress.toFixed(1) + "%" }} />
      </div>
    </div>
  );
}
