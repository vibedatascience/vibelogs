import matplotlib as mpl, matplotlib.pyplot as plt, numpy as np
from matplotlib import font_manager as fm
for f in ["fonts/Fraunces.ttf","fonts/Commissioner.ttf"]: fm.fontManager.addfont(f)
SERIF, SANS = "Fraunces", "Commissioner"
BG, INK, MUTE, LINE = "#F4EFE6", "#1F1A17", "#8A7F73", "#D9D0C3"
DBG, DINK, DMUTE, DLINE = "#1B2431", "#F2EDE4", "#8B94A3", "#2C3848"
RED, BLUE, AMBER, TEAL, PURPLE, ORANGE = "#B4342B", "#1E6F8C", "#E9B872", "#5FC4B0", "#7A5C9E", "#B5653A"
def fig(w=14, h=9, dark=False):
    f, ax = plt.subplots(figsize=(w,h), facecolor=DBG if dark else BG); ax.set_facecolor(DBG if dark else BG)
    ax.tick_params(length=0); [s.set_visible(False) for s in ax.spines.values()]
    return f, ax
def head(f, title, sub, dark=False, src="", top=0.945, sub_y=0.895):
    ink = DINK if dark else INK; mute = DMUTE if dark else MUTE
    f.text(0.05,top,title,font=SERIF,size=26,weight="bold",color=ink)
    f.text(0.05,sub_y,sub,font=SANS,size=12,color=ink,linespacing=1.5)
    f.text(0.05,0.02,"Data: Jonn Elledge, Nontrivial Trivia (2024)"+(". "+src if src else ""),font=SANS,size=9,color=mute)
def save(name): plt.savefig(f"post/{name}.png",dpi=110,facecolor=plt.gcf().get_facecolor())
def nolog_minor(ax):
    ax.tick_params(axis="y",which="minor",length=0); ax.yaxis.set_minor_formatter(mpl.ticker.NullFormatter())
    ax.tick_params(axis="x",which="minor",length=0); ax.xaxis.set_minor_formatter(mpl.ticker.NullFormatter())
