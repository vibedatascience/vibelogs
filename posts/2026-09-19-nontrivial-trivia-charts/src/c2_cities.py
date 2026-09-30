from style import *
from cities_data import *
yr = np.array([r[0] for r in rows]); pop = np.array([r[2] for r in rows]); reg = [r[3] for r in rows]
f, ax = fig(16,10.5)
ax.set_yscale("log"); ax.set_ylim(2.5e3,6e7); ax.set_xlim(-4100,2160); nolog_minor(ax)
for i in range(len(rows)):
    x0 = yr[i]; x1 = yr[i+1] if i+1 < len(rows) else 2060
    ax.fill_between([x0,x1],[pop[i],pop[i]],2.5e3,color=col[reg[i]],alpha=.3,lw=0,zorder=2)
ax.step(np.append(yr,2060),np.append(pop,pop[-1]),where="post",color=INK,lw=1.4,zorder=3)
ax.set_yticks([1e4,1e5,1e6,1e7]); ax.set_yticklabels(["10,000","100,000","1 million","10 million"],font=SANS,size=10,color=MUTE)
ax.set_xticks([-4000,-3000,-2000,-1000,0,1000,2000]); ax.set_xticklabels(["4000 BCE","3000 BCE","2000 BCE","1000 BCE","1 CE","1000","2000"],font=SANS,size=10,color=MUTE)
ax.grid(axis="y",color=BG,lw=1,zorder=4)
def lab(i, txt=None, dx=0, dy=4, ha="left"):
    ax.annotate(txt or rows[i][1].split(" /")[0],(yr[i]+dx,pop[i]),xytext=(2,dy),textcoords="offset points",ha=ha,va="bottom",font=SANS,size=8.5,color=INK,zorder=5)
for i in [0,1,2,10]: lab(i)
lab(7,"Babylon",ha="right",dx=-40); lab(9,"Alexandria",ha="right",dx=-40)
lab(12,"Constantinople",dy=-13,dx=20); lab(14,"Chang'an, Kaifeng,\nHangzhou")
lab(5,"Thebes",dy=-13)
ax.annotate("Nanjing",(1400,5e5),xytext=(2,-13),textcoords="offset points",ha="left",va="bottom",font=SANS,size=8.5,color=INK,zorder=5)
ax.annotate("London 6.6M",(yr[20],pop[20]),xytext=(-5,0),textcoords="offset points",ha="right",va="center",font=SANS,size=8.5,weight="bold",color=INK)
ax.annotate("New York 12.4M",(yr[21],pop[21]),xytext=(-5,0),textcoords="offset points",ha="right",va="center",font=SANS,size=8.5,weight="bold",color=INK)
ax.annotate("Tokyo 38M",(yr[22],pop[22]),xytext=(-5,0),textcoords="offset points",ha="right",va="center",font=SERIF,size=13,weight="bold",color=col["Japan"])
def note(xy,txt,xt,ha="left"):
    ax.annotate(txt,xy,xytext=xt,textcoords="data",ha=ha,va="center",font=SERIF,size=10,color=INK,linespacing=1.35,
                arrowprops=dict(arrowstyle="-",color=INK,lw=.8,connectionstyle="arc3,rad=0.15",shrinkA=4),zorder=6)
note((-1050,5e4),"Late Bronze Age collapse.\nThe biggest city on Earth\nloses nearly half its people.",(-2870,1.25e4))
note((450,8e5),"Rome slips before it falls.\nThe capital is already\nin Constantinople.",(-700,4e6),"center")
note((1300,5e5),"Mongols invade. China has\nno million-person city\nfor the first time in 500 years.",(1150,5e4),"center")
ax.axhline(1e6,color=INK,lw=.8,ls=(0,(4,3)),zorder=4)
ax.text(-3950,8.6e5,"One million: the ceiling from Rome to Beijing, for 2,000 years",font=SERIF,size=10,color=INK,va="top")
for nm,k in REG: f.text(0.05,0.85,nm,font=SANS,size=10.5,weight="bold",color=col[k])
head(f,"Six thousand years of the biggest city on Earth, drawn to scale","Each plateau is the world's largest urban area holding the title until the next estimate. Time runs left to right at a constant rate, so the modern skyscraper era is the thin sliver on the far right. Population on a log scale.",
     credit=CREDIT,src="Where cities tied, the first is shown")
plt.subplots_adjust(left=0.1,right=0.97,top=0.83,bottom=0.08); save("c2_cities")
