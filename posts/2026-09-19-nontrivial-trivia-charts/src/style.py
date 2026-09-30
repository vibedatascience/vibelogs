import matplotlib as mpl, matplotlib.pyplot as plt, numpy as np, textwrap, os
from matplotlib import font_manager as fm
from matplotlib.text import Text

_HERE = os.path.dirname(os.path.abspath(__file__))
for _f in ["InterChart-Medium", "InterChart-Bold", "InterChart-ExtraBold", "FrauncesChart-SemiBold", "FrauncesChart-Bold"]:
    fm.fontManager.addfont(os.path.join(_HERE, "fonts", _f + ".ttf"))
SERIF, SANS = "Fraunces Chart", "Inter Chart"
mpl.rcParams.update({"font.family": SANS, "font.size": 11.4, "axes.unicode_minus": False})

# White, high-contrast palette. Dark-mode names kept so older scripts still run.
BG, INK, MUTE, LINE = "#FFFFFF", "#16161A", "#57524C", "#E3E0DA"
DBG, DINK, DMUTE, DLINE = BG, INK, MUTE, LINE
RED, BLUE, AMBER, TEAL, PURPLE, ORANGE = "#B4342B", "#1E6F8C", "#D9962B", "#138A77", "#6C4E93", "#B5653A"
AMBER_TXT = "#A86A0C"

# Every chart is drawn 9.5 inches wide, so text sizes mean the same thing across the post.
WIDTH_IN, DPI = 9.5, 220

# Size transform: small labels grow the most, titles the least.
_orig_set_fontsize = Text.set_fontsize
def _set_fontsize(self, s):
    if isinstance(s, (int, float)): s = 0.8 * s + 3.4
    _orig_set_fontsize(self, s)
Text.set_fontsize = _set_fontsize
def _raw_size(t, s): t._fontproperties.set_size(s); t.stale = True

_H = {}
def fig(w=14, h=9, dark=False):
    k = WIDTH_IN / w
    f, ax = plt.subplots(figsize=(WIDTH_IN, h * k), facecolor=BG); ax.set_facecolor(BG)
    ax.tick_params(length=0); [s.set_visible(False) for s in ax.spines.values()]
    _H.clear()
    return f, ax

def head(f, title, sub, dark=False, src="", top=None, sub_y=None, credit="Data: Jonn Elledge, Nontrivial Trivia (2024)"):
    _H["title"] = f.text(0.045, 0.99, title, font=SERIF, size=26, weight="bold", color=INK, va="top")
    _H["sub"] = f.text(0.045, 0.9, " ".join(sub.split()), font=SANS, size=12, color="#2E2B28", linespacing=1.45, va="top")
    _H["src"] = f.text(0.045, 0.012, credit + (". " + src if src else ""), font=SANS, size=9, color=MUTE, va="bottom")

def _wrap(t, maxw, r):
    words = t.get_text().split(); lines, cur = [], ""
    for w_ in words:
        trial = (cur + " " + w_).strip(); t.set_text(trial)
        if t.get_window_extent(r).width > maxw and cur: lines.append(cur); cur = w_
        else: cur = trial
    lines.append(cur); t.set_text("\n".join(lines))

def _layout(f, ax):
    r = f.canvas.get_renderer(); W, Hh = f.bbox.width, f.bbox.height
    pad = 0.045 * W; maxw = W - 2 * pad; inch = f.dpi
    t, s, src = _H["title"], _H["sub"], _H["src"]
    # title: shrink to fit one line, else wrap
    size = t.get_fontsize()
    while t.get_window_extent(r).width > maxw and size > 19: size -= 0.5; _raw_size(t, size)
    if t.get_window_extent(r).width > maxw: _wrap(t, maxw, r)
    t.set_y(1 - 0.22 * inch / Hh)
    _wrap(s, maxw, r); _wrap(src, maxw, r)
    tb = t.get_window_extent(r); s.set_y((tb.y0 - 0.12 * inch) / Hh)
    sb = s.get_window_extent(r); y = sb.y0 - 0.2 * inch
    # legend row: any other figure text in the header area, re-flowed left to right
    leg = [x for x in f.texts if x not in (t, s, src) and x.get_position()[1] > 0.6]
    if leg:
        leg.sort(key=lambda x: x.get_position()[0]); xx = pad
        for x in leg:
            x.set_va("top"); x.set_position((xx / W, y / Hh)); xx += x.get_window_extent(r).width + 0.28 * inch
        y = min(x.get_window_extent(r).y0 for x in leg) - 0.22 * inch
    else:
        y -= 0.05 * inch
    src.set_x(pad / W)
    floor = src.get_window_extent(r).y1 + 0.15 * inch
    for _ in range(4):
        p = ax.get_position(); tb_ = ax.get_tightbbox(r)
        over_top = tb_.y1 - p.y1 * Hh; under = p.y0 * Hh - tb_.y0
        over_l = p.x0 * W - tb_.x0; over_r = tb_.x1 - p.x1 * W
        new_top = (y - max(over_top, 0)) / Hh; new_bot = (floor + max(under, 0)) / Hh
        l = p.x0; rr = p.x1
        if tb_.x0 < 0.02 * W: l = (0.02 * W + over_l) / W
        if tb_.x1 > 0.985 * W: rr = (0.985 * W - over_r) / W
        f.subplots_adjust(top=new_top, bottom=new_bot, left=l, right=rr)

def save(name):
    f = plt.gcf(); ax = f.axes[0]
    if _H: _layout(f, ax)
    f.savefig(os.path.join(_HERE, "..", "img", f"{name}.png"), dpi=DPI, facecolor=BG)
    plt.close(f)

def nolog_minor(ax):
    ax.tick_params(axis="y", which="minor", length=0); ax.yaxis.set_minor_formatter(mpl.ticker.NullFormatter())
    ax.tick_params(axis="x", which="minor", length=0); ax.xaxis.set_minor_formatter(mpl.ticker.NullFormatter())
