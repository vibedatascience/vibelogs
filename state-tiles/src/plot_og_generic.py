"""Original-style state tile map (stacked 100% areas), reusable for any 3-layer composition."""
import sys, json
import pandas as pd, numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

DARK, LIGHT, ORANGE = "#0783c8", "#7bccf9", "#fe5e32"
BG, NODATA = "#f8f8f8", "#dddddd"
LABEL, GREYTXT, TITLE, AXTXT, SRC = "#0d3a60", "#8a8a8a", "#111111", "#555555", "#666666"
SERIF, COND = "TeX Gyre Schola", "TeX Gyre Heros Cn"

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


def render(df, layers, years, title, legend, source, out):
    """layers: (bottom/dark, middle/light, top/orange) column names holding shares."""
    years = np.asarray(years)
    y0_, y1_ = int(years[0]), int(years[-1])
    step = float(np.median(np.diff(years)))

    def tile(ax, st, x0, y0, w, h, label_fs=17, label=True):
        X = lambda yr: x0 + (yr - y0_) / (y1_ - y0_) * w
        d = df[df.st == st].set_index("year").reindex(years)
        valid = d[layers[0]].notna().values
        A, B, C = (d[c].clip(lower=0).values for c in layers)
        tot = A + B + C
        A, B = A / tot, B / tot
        ax.add_patch(Rectangle((x0, y0), w, h, fc=NODATA, lw=0, zorder=1))
        for seg in segments(valid):
            if len(seg) == 1:
                i = seg[0]; xs = np.array([years[i] - step * 0.3, years[i] + step * 0.3]); idx = [i, i]
            else:
                xs = years[seg].astype(float); idx = seg
            px = X(xs); bA = y0 + A[idx] * h; bB = bA + B[idx] * h
            ax.fill_between(px, y0, bA, color=DARK, lw=0, zorder=2)
            ax.fill_between(px, bA, bB, color=LIGHT, lw=0, zorder=2)
            ax.fill_between(px, bB, y0 + h, color=ORANGE, lw=0, zorder=2)
        if label:
            ax.text(x0 + w * 0.94, y0 + h * 0.07, st, ha="right", va="bottom", fontsize=label_fs,
                    fontfamily=COND, color=LABEL, alpha=0.88, zorder=4)
        first = years[np.argmax(valid)]
        return first

    W_IN, H_IN = 16, 12.7
    fig = plt.figure(figsize=(W_IN, H_IN), facecolor=BG, dpi=200)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W_IN); ax.set_ylim(0, H_IN); ax.axis("off")

    step_x, step_y, gutter = 1.292, 1.305, 0.072
    gx0, gtop = 1.14, 10.49
    for st, (c, r) in G.items():
        x0 = gx0 + c * step_x
        yt = gtop - r * step_y
        tile(ax, st, x0, yt - (step_y - gutter), step_x - gutter, step_y - gutter)

    fs = title.get("size", 44)
    ax.text(4.55, 11.62, title["l1"], ha="center", va="center", fontsize=fs, fontfamily=SERIF, fontweight="bold", color=TITLE)
    ax.text(4.55, 10.84, title["l2"], ha="center", va="center", fontsize=fs, fontfamily=SERIF, fontweight="bold", color=TITLE)

    lx0, lx1, ly0, ly1 = 9.07, 11.10, 10.21, 12.27
    first = tile(ax, "AK", lx0, ly0, lx1 - lx0, ly1 - ly0, label=False)
    X = lambda yr: lx0 + (yr - y0_) / (y1_ - y0_) * (lx1 - lx0)
    ax.text(lx1 - 0.12, ly0 + 0.04, "AK", ha="right", va="bottom", fontsize=15, fontfamily=COND,
            color=LABEL, alpha=0.88, zorder=5)
    if first > y0_:
        ax.text((lx0 + X(first)) / 2, (ly0 + ly1) / 2, "no data", ha="center", va="center", rotation=90,
                fontsize=15, fontfamily=COND, color=GREYTXT, zorder=5)
    ax.text(lx0 - 0.04, ly1, "100%", ha="right", va="top", fontsize=10, fontfamily=COND, color=AXTXT)
    ax.text(lx0 - 0.04, ly0, "0%", ha="right", va="bottom", fontsize=10, fontfamily=COND, color=AXTXT)
    ax.text(lx0, ly0 - 0.06, str(y0_), ha="center", va="top", fontsize=10, fontfamily=COND, color=AXTXT)
    ax.text(lx1, ly0 - 0.06, str(y1_), ha="center", va="top", fontsize=10, fontfamily=COND, color=AXTXT)
    tx = lx1 + 0.08
    (top_lab, mid_lab, bot_lab) = legend
    ax.text(tx, 12.18, top_lab, ha="left", va="center", fontsize=15, fontfamily=COND, fontweight="bold", color=ORANGE)
    ax.text(tx, 11.80, mid_lab, ha="left", va="top", fontsize=15, fontfamily=COND, fontweight="bold", color=LIGHT, linespacing=1.05)
    ax.text(tx, 10.52, bot_lab, ha="left", va="center", fontsize=15, fontfamily=COND, fontweight="bold", color=DARK)

    ax.text(0.30, 0.48, "RAHUL", ha="left", va="center", fontsize=17, fontfamily=COND, fontweight="bold", color=AXTXT)
    ax.text(1.18, 0.48, "CH", ha="left", va="center", fontsize=17, fontfamily=COND, color=AXTXT)
    for i, line in enumerate(source):
        ax.text(15.75, 0.60 - i * 0.20, line, ha="right", va="center", fontsize=7.5, fontfamily=COND, color=SRC)
    fig.savefig(out, dpi=200, facecolor=BG)
    plt.close(fig)


CONFIGS = {
 "elec": dict(csv="elec_1990_2024.csv", layers=("coal", "gas", "clean"), years=range(1990, 2025),
   title=dict(l1="How does each state", l2="make electricity?", size=40),
   legend=("nuclear, hydro, wind, solar", "natural gas\n& oil", "coal"),
   source=["source: U.S. Energy Information Administration, Net Generation by State by Type of Producer by Energy Source, 1990-2024 (Form EIA-906/920/923).",
           "Total electric power industry. Share of net generation from coal, gas, oil and clean sources; pumped storage and \"other\" excluded."],
   out="state_electricity_og.png"),
 "earn": dict(csv="earnings_1929_2025.csv", layers=("rest_s", "mfg_s", "farm_s"), years=range(1929, 2026),
   title=dict(l1="How does each state", l2="earn a living?", size=40),
   legend=("farming", "manufacturing", "everything else"),
   source=["source: U.S. Bureau of Economic Analysis, SAINC5H/5S/5N Personal income by major component and earnings by industry, 1929-2025.",
           "Share of earnings by place of work. SIC industry definitions before 2001, NAICS from 2001. Negative farm earnings set to zero."],
   out="state_earnings_og.png"),
 "income": dict(csv="income_1929_2025.csv", layers=("work_s", "capital_s", "transfers_s"), years=range(1929, 2026),
   title=dict(l1="Where does the", l2="money come from?", size=42),
   legend=("government benefits", "dividends,\ninterest & rent", "work (wages and\nbusiness income)"),
   source=["source: U.S. Bureau of Economic Analysis, SAINC4 Personal income and employment by major component, 1929-2025.",
           "Share of personal income: net earnings by place of residence, dividends/interest/rent, and personal current transfer receipts."],
   out="state_income_og.png"),
 "gov": dict(csv="govpay_1929_2025.csv", layers=("priv_s", "sl_s", "fed_s"), years=range(1929, 2026),
   title=dict(l1="Who signs", l2="the paychecks?", size=44),
   legend=("federal government\n(civilian + military)", "state & local\ngovernment", "private sector"),
   source=["source: U.S. Bureau of Economic Analysis, SAINC5H/5S/5N earnings by industry, 1929-2025.",
           "Share of earnings by place of work. Federal = federal civilian + military. Suppressed values interpolated."],
   out="state_govpay_og.png"),
 "tax": dict(csv="taxes_1902_2025.csv", layers=("sales_s", "income_s", "other_s"),
   years=[1942, 1944, 1946, 1948] + list(range(1950, 2026)),
   title=dict(l1="How does each state", l2="collect its taxes?", size=40),
   legend=("property, severance,\nlicenses & other", "income taxes\n(personal + corporate)", "sales taxes"),
   source=["source: U.S. Census Bureau, Annual Survey of State Government Tax Collections, historical database (STC-Historical-DB, 2025).",
           "State government taxes only (not local). Fiscal years 1942-2025; biennial until 1950. DC has no state government."],
   out="state_taxes_og.png"),
 "energy": dict(csv="energy_use_1960_2023.csv", layers=("bld_s", "ind_s", "trn_s"), years=range(1960, 2025),
   title=dict(l1="Who uses", l2="each state's energy?", size=40),
   legend=("transportation", "industry", "homes & businesses"),
   source=["source: U.S. Energy Information Administration, State Energy Data System (SEDS), 1960-2024, total energy consumption by end-use sector.",
           "Share of total energy consumed (Btu). Homes & businesses = residential + commercial."],
   out="state_energy_use_og.png"),
}

if __name__ == "__main__":
    for which in sys.argv[1:]:
        c = CONFIGS[which]
        render(pd.read_csv(c["csv"]), c["layers"], c["years"], c["title"], c["legend"], c["source"],
               "/home/claude/charts/" + c["out"])
        print("ok", which)
