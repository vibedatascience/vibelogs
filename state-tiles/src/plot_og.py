import pandas as pd, numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyBboxPatch

a = pd.read_csv("pres_1856_2024.csv")

# colors sampled from the original graphic
DARK, LIGHT, ORANGE = "#0783c8", "#7bccf9", "#fe5e32"
BG, NODATA, GAPC = "#f8f8f8", "#dddddd", "#ffffff"
LABEL, GREYTXT, TITLE = "#0d3a60", "#8a8a8a", "#111111"
SERIF, COND = "TeX Gyre Schola", "TeX Gyre Heros Cn"
Y0, Y1 = 1856, 2024
YEARS = np.arange(Y0, Y1 + 1, 4)

G = {
 "ME": (10, 0),
 "WA": (0, 1), "ID": (1, 1), "MT": (2, 1), "ND": (3, 1), "MN": (4, 1), "IL": (5, 1),
 "WI": (6, 1), "MI": (7, 1), "NY": (8, 1), "VT": (9, 1), "NH": (10, 1),
 "OR": (0, 2), "NV": (1, 2), "WY": (2, 2), "SD": (3, 2), "IA": (4, 2), "IN": (5, 2),
 "OH": (6, 2), "PA": (7, 2), "NJ": (8, 2), "RI": (9, 2), "MA": (10, 2),
 "CA": (0, 3), "UT": (1, 3), "CO": (2, 3), "NE": (3, 3), "MO": (4, 3), "KY": (5, 3),
 "WV": (6, 3), "VA": (7, 3), "MD": (8, 3), "CT": (9, 3),
 "AZ": (1, 4), "NM": (2, 4), "KS": (3, 4), "AR": (4, 4), "TN": (5, 4), "NC": (6, 4),
 "SC": (7, 4), "DC": (8, 4), "DE": (9, 4),
 "OK": (3, 5), "LA": (4, 5), "MS": (5, 5), "AL": (6, 5), "GA": (7, 5),
 "HI": (0, 6), "TX": (3, 6), "FL": (8, 6),
}


def segments(valid):
    segs, cur = [], []
    for i, v in enumerate(valid):
        if v:
            cur.append(i)
        elif cur:
            segs.append(cur); cur = []
    if cur:
        segs.append(cur)
    return segs


def tile(ax, st, x0, y0, w, h, label_fs=17, label=True):
    X = lambda yr: x0 + (yr - Y0) / (Y1 - Y0) * w
    d = a[a.st == st].set_index("year").reindex(YEARS)
    valid = d.D.notna().values
    tot = (d.D + d.O + d.R).values
    D, O = d.D.values / tot, d.O.values / tot
    # no-data background for the whole tile; data areas paint over it
    ax.add_patch(Rectangle((x0, y0), w, h, fc=NODATA, lw=0, zorder=1))
    for seg in segments(valid):
        if len(seg) == 1:  # isolated election: give it a small width
            i = seg[0]; xs = np.array([YEARS[i] - 1.2, YEARS[i] + 1.2]); idx = [i, i]
        else:
            xs = YEARS[seg].astype(float); idx = seg
        px = X(xs)
        bD = y0 + D[idx] * h
        bO = bD + O[idx] * h
        ax.fill_between(px, y0, bD, color=DARK, lw=0, zorder=2)
        ax.fill_between(px, bD, bO, color=LIGHT, lw=0, zorder=2)
        ax.fill_between(px, bO, y0 + h, color=ORANGE, lw=0, zorder=2)
    if label:
        ax.text(x0 + w * 0.94, y0 + h * 0.07, st, ha="right", va="bottom", fontsize=label_fs,
                fontfamily=COND, color=LABEL, alpha=0.88, zorder=4)
    return X


W_IN, H_IN = 16, 12.7
fig = plt.figure(figsize=(W_IN, H_IN), facecolor=BG, dpi=200)
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, W_IN); ax.set_ylim(0, H_IN); ax.axis("off")

# grid measured from the original: column step 91px, row step 92px, ~5px white gutters
step_x, step_y = 1.292, 1.305
gutter = 0.072
gx0, gtop = 1.14, 10.49
for st, (c, r) in G.items():
    x0 = gx0 + c * step_x
    yt = gtop - r * step_y
    tile(ax, st, x0, yt - (step_y - gutter), step_x - gutter, step_y - gutter)

# title, centered over the left half like the original
ax.text(4.55, 11.62, "How did each", ha="center", va="center", fontsize=44,
        fontfamily=SERIF, fontweight="bold", color=TITLE)
ax.text(4.55, 10.84, "state vote?", ha="center", va="center", fontsize=44,
        fontfamily=SERIF, fontweight="bold", color=TITLE)

# legend: Alaska drawn large, exactly like the reference
lx0, lx1, ly0, ly1 = 9.07, 11.10, 10.21, 12.27
tile(ax, "AK", lx0, ly0, lx1 - lx0, ly1 - ly0, label=False)
X = lambda yr: lx0 + (yr - Y0) / (Y1 - Y0) * (lx1 - lx0)
ax.text(X(2010), ly0 + 0.04, "AK", ha="right", va="bottom", fontsize=15, fontfamily=COND,
        color=LABEL, alpha=0.88, zorder=5)
ax.text((lx0 + X(1960)) / 2, (ly0 + ly1) / 2, "no data", ha="center", va="center", rotation=90,
        fontsize=15, fontfamily=COND, color=GREYTXT, zorder=5)
ax.text(lx0 - 0.04, ly1, "100%", ha="right", va="top", fontsize=10, fontfamily=COND, color="#555555")
ax.text(lx0 - 0.04, ly0, "0%", ha="right", va="bottom", fontsize=10, fontfamily=COND, color="#555555")
ax.text(lx0, ly0 - 0.06, "1856", ha="center", va="top", fontsize=10, fontfamily=COND, color="#555555")
ax.text(lx1, ly0 - 0.06, "2024", ha="center", va="top", fontsize=10, fontfamily=COND, color="#555555")
tx = lx1 + 0.08
ax.text(tx, 12.18, "Republican", ha="left", va="center", fontsize=15, fontfamily=COND, fontweight="bold", color=ORANGE)
ax.text(tx, 11.80, "third parties", ha="left", va="center", fontsize=15, fontfamily=COND, fontweight="bold", color=LIGHT)
ax.text(tx, 10.52, "Democrat", ha="left", va="center", fontsize=15, fontfamily=COND, fontweight="bold", color=DARK)

# footer, same placement as the original
ax.text(0.30, 0.48, "RAHUL", ha="left", va="center", fontsize=17, fontfamily=COND, fontweight="bold", color="#555555")
ax.text(1.18, 0.48, "CH", ha="left", va="center", fontsize=17, fontfamily=COND, color="#555555")
ax.text(15.75, 0.60,
        "source: Wikipedia state-by-state results tables, 1856-1972, cross-checked against the pscl and cluster R datasets.",
        ha="right", va="center", fontsize=7.5, fontfamily=COND, color="#666666")
ax.text(15.75, 0.40,
        "MIT Election Data and Science Lab, U.S. President 1976-2024, Harvard Dataverse, doi:10.7910/DVN/42MVDX. Share of the popular vote.",
        ha="right", va="center", fontsize=7.5, fontfamily=COND, color="#666666")

fig.savefig("/home/claude/how_each_state_voted_og.png", dpi=200, facecolor=BG)
print("ok")
