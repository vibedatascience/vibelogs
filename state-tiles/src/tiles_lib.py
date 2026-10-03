"""Write one stacked-share State tiles map into the gallery: data JSON + CSV, poster, card thumbnail."""
import json, os, re, numpy as np, pandas as pd, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from PIL import Image
import og
from names import NAMES
OUT = '/home/claude/vibelogs/state-tiles/'
COL = ['#0783c8', '#7bccf9', '#fe5e32']


def publish(slug, df, layers, labels, years, title2, legend, source):
    """df: st, year and the three layer columns (any scale). labels: bottom, middle, top ('' to hide)."""
    years = [int(y) for y in years]
    d = df[df.st.isin(NAMES)].copy()
    v = d[list(layers)].clip(lower=0).astype(float)
    v = v.div(v.sum(axis=1), axis=0) * 100
    d[list(layers)] = v.round(2)
    d = d.dropna(subset=list(layers))
    S = {}
    for st, g in d.groupby('st'):
        g = g.set_index('year').reindex(years)
        S[st] = [None if np.isnan(a) else [round(a, 1), round(b, 1)] for a, b in zip(g[layers[0]], g[layers[1]])]
    json.dump(dict(years=years, labels=list(labels), names=NAMES, s=S), open(f'{OUT}data/{slug}.json', 'w'), separators=(',', ':'))
    csv = d[['st', 'year'] + list(layers)].sort_values(['st', 'year'])
    ren = {c: re.sub(r'[^a-z0-9]+', '_', l.lower()).strip('_') + '_pct' for c, l in zip(layers, labels) if l}
    csv = csv[['st', 'year'] + list(ren)].rename(columns=ren)
    csv.insert(1, 'state', csv.st.map(NAMES))
    csv.to_csv(f'{OUT}data/{slug}.csv', index=False)
    # poster
    tmp = f'/tmp/claude-0/-home-claude-vibelogs/f79bde64-195a-5843-9da9-5dc15dbeea91/scratchpad/{slug}_poster.png'
    og.render(d, layers, years, title2, legend, source, tmp)
    Image.open(tmp).convert('RGB').quantize(colors=64, method=Image.Quantize.MEDIANCUT).save(f'{OUT}img/{slug}.png', optimize=True)
    thumb(slug)
    return tmp


def thumb(slug):
    J = json.load(open(f'{OUT}data/{slug}.json')); yrs = np.array(J['years'], float)
    T = 1.0; GAP = 0.07; S = T + GAP; W = 11 * S - GAP; H = 7 * S - GAP
    fig = plt.figure(figsize=(7.2, 7.2 * H / W), dpi=100, facecolor='#f8f8f8'); ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W); ax.set_ylim(H, 0); ax.axis('off')
    G = dict(og.G); G['AK'] = (0, 0)
    for st, (c, r) in G.items():
        x0, y0 = c * S, r * S
        ax.add_patch(Rectangle((x0, y0), T, T, fc='#efefef', lw=0)); rows = J['s'].get(st)
        if rows:
            X = x0 + (yrs - yrs[0]) / (yrs[-1] - yrs[0]) * T
            a = np.array([np.nan if q is None else q[0] for q in rows]) / 100
            b = np.array([np.nan if q is None else q[1] for q in rows]) / 100
            ok = ~np.isnan(a); ya = y0 + T - a * T; yb = ya - b * T
            ax.fill_between(X, y0 + T, ya, where=ok, color=COL[0], lw=0)
            ax.fill_between(X, ya, yb, where=ok, color=COL[1], lw=0)
            ax.fill_between(X, yb, y0, where=ok, color=COL[2], lw=0)
        ax.text(x0 + T * 0.94, y0 + T * 0.92, st, ha='right', va='bottom', fontsize=6.5, color='#0d3a60', family='TeX Gyre Heros Cn')
    tmp = f'/tmp/claude-0/-home-claude-vibelogs/f79bde64-195a-5843-9da9-5dc15dbeea91/scratchpad/{slug}_thumb.png'
    fig.savefig(tmp, facecolor='#f8f8f8'); plt.close(fig)
    Image.open(tmp).convert('RGB').quantize(colors=48, method=Image.Quantize.MEDIANCUT).save(f'{OUT}thumbs/{slug}.png', optimize=True)
