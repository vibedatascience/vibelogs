import matplotlib as mpl, matplotlib.pyplot as plt, numpy as np
from matplotlib import font_manager as fm
for f in ["fonts/Fraunces.ttf","fonts/Commissioner.ttf"]: fm.fontManager.addfont(f)
SERIF, SANS = "Fraunces", "Commissioner"
exec(open("chart.py").read().split("yr = np.array")[0].split("SERIF, SANS")[1].split("\n",1)[1])
BG, INK, MUTE = "#F4EFE6", "#1F1A17", "#8A7F73"
col = {"Mesopotamia":"#B5653A","Mediterranean":"#7A5C9E","China":"#B4342B","The West":"#2C5F7A","Japan":"#2C5F7A"}
yr = np.array([r[0] for r in rows]); pop = np.array([r[2] for r in rows]); reg = [r[3] for r in rows]

fig, ax = plt.subplots(figsize=(16,9.5), facecolor=BG); ax.set_facecolor(BG)
ax.set_yscale("log"); ax.set_ylim(2.5e3,6e7); ax.set_xlim(-4100,2160)
for i in range(len(rows)):
    x0 = yr[i]; x1 = yr[i+1] if i+1 < len(rows) else 2060
    ax.fill_between([x0,x1],[pop[i],pop[i]],2.5e3,color=col[reg[i]],alpha=.28,lw=0,zorder=2)
ax.step(np.append(yr,2060),np.append(pop,pop[-1]),where="post",color=INK,lw=1.1,zorder=3)

ax.set_yticks([1e4,1e5,1e6,1e7]); ax.set_yticklabels(["10,000","100,000","1 million","10 million"],font=SANS,size=10,color=MUTE)
ax.set_xticks([-4000,-3000,-2000,-1000,0,1000,2000]); ax.set_xticklabels(["4000 BCE","3000 BCE","2000 BCE","1000 BCE","1 CE","1000","2000"],font=SANS,size=10,color=MUTE)
ax.tick_params(length=0); ax.tick_params(axis="y",which="minor",length=0); ax.yaxis.set_minor_formatter(mpl.ticker.NullFormatter())
ax.grid(axis="y",color=BG,lw=.8,zorder=4); [s.set_visible(False) for s in ax.spines.values()]

def lab(i, txt=None, dx=0, dy=6, ha="left", rot=0, size=8.5, c=None):
    ax.annotate(txt or rows[i][1].split(" /")[0],(yr[i]+dx,pop[i]),xytext=(2,dy),textcoords="offset points",ha=ha,va="bottom",font=SANS,size=size,color=c or INK,rotation=rot,zorder=5)
for i in [0,1,2,3,7,9,10,17,19]: lab(i)
lab(4,"Babylon",dy=6); lab(12,"Constantinople",dy=-14,dx=20)
lab(14,"Chang'an",dy=6); lab(15,"Kaifeng",dy=6,dx=60); lab(16,"Hangzhou",dy=6,dx=40)
lab(5,"Thebes",dy=-14); lab(8,"Babylon",dy=6)
ax.annotate("London 6.6M",(yr[20],pop[20]),xytext=(-6,4),textcoords="offset points",ha="right",font=SANS,size=8.5,color=INK)
ax.annotate("New York 12.4M",(yr[21],pop[21]),xytext=(-6,4),textcoords="offset points",ha="right",font=SANS,size=8.5,color=INK)
ax.annotate("Tokyo 38M",(yr[22],pop[22]),xytext=(-6,6),textcoords="offset points",ha="right",font=SERIF,size=13,weight="bold",color=col["Japan"])

def note(xy,txt,xt,ha="left"):
    ax.annotate(txt,xy,xytext=xt,textcoords="data",ha=ha,va="center",font=SERIF,size=10,style="italic",color=INK,
                arrowprops=dict(arrowstyle="-",color=INK,lw=.7,connectionstyle="arc3,rad=0.15"),zorder=6)
note((-1050,5e4),"Late Bronze Age collapse.\nThe biggest city on Earth\nloses nearly half its people.",(-2000,2.5e5))
note((450,8e5),"Rome slips before it falls.\nThe capital is already\nin Constantinople.",(0,7e6),"center")
note((1300,5e5),"Mongols invade. China has\nno million-person city\nfor the first time in 500 years.",(950,1.4e7),"center")
ax.axhline(1e6,color=INK,lw=.7,ls=(0,(4,3)),zorder=4)
ax.text(-3950,1.25e6,"One million people: the ceiling from Rome to Beijing, nearly two thousand years",font=SERIF,size=10.5,style="italic",color=INK)

ax.text(-4000,4.2e7,"Mesopotamia & Egypt",font=SANS,size=10,weight="bold",color=col["Mesopotamia"])
ax.text(-2600,4.2e7,"Mediterranean",font=SANS,size=10,weight="bold",color=col["Mediterranean"])
ax.text(-1600,4.2e7,"China",font=SANS,size=10,weight="bold",color=col["China"])
ax.text(-1100,4.2e7,"The West & Japan",font=SANS,size=10,weight="bold",color=col["The West"])

fig.text(0.06,0.945,"Six thousand years of the biggest city on Earth, drawn to scale",font=SERIF,size=28,weight="bold",color=INK)
fig.text(0.06,0.895,"Each plateau is the world's largest urban area holding the title until the next estimate. Time runs left to right at a constant rate,\n"
         "so the modern skyscraper era is the thin sliver on the far right. Population on a log scale.",font=SANS,size=12,color=INK,linespacing=1.5)
fig.text(0.06,0.02,"Data: Ian Morris (Stanford), via Jonn Elledge, Nontrivial Trivia (2024)  |  Where cities tied, the first is shown",font=SANS,size=9,color=MUTE)
plt.subplots_adjust(left=0.06,right=0.98,top=0.83,bottom=0.08)
plt.savefig("/mnt/user-data/outputs/largest_city_continuous.png",dpi=160,facecolor=BG)
