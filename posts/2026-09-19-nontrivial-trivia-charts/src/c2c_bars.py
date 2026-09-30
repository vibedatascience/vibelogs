from style import *
from cities_data import *
yr = np.array([r[0] for r in rows]); pop = np.array([r[2] for r in rows])/1e6; x = np.arange(len(rows))
f, ax = fig(16,11)
ax.bar(x,pop,width=0.72,color=[col[r[3]] for r in rows],zorder=3)
ax.set_ylim(0,43); ax.set_xlim(-0.7,len(rows)-0.3)
ax.set_yticks([0,10,20,30,40]); ax.set_yticklabels(["0","10M","20M","30M","40M"],font=SANS,size=10,color=MUTE)
ax.set_xticks(x); ax.set_xticklabels([f"{abs(y)} BCE" if y<0 else str(y) for y in yr],font=SANS,size=8.5,color=MUTE,rotation=90)
ax.grid(axis="y",color=LINE,lw=.8,zorder=0)
for i,(y,city,p,reg) in enumerate(rows[:20]):
    ax.text(i,max(pop[i],1.1)+0.45,city.split(" /")[0],ha="center",va="bottom",rotation=90,font=SANS,size=8.5,weight="bold",color=col[reg])
for i,nm in ((20,"London"),(21,"New\nYork"),(22,"Tokyo")):
    t=ax.annotate(nm,(i,pop[i]),xytext=(0,4),textcoords="offset points",ha="center",va="bottom",font=SANS,size=8.5,weight="bold",color=col["Japan"],linespacing=1.1)
    ax.annotate(f"{pop[i]:g}M",(i,pop[i]),xytext=(-4 if i==21 else 0,30 if i==21 else 18),textcoords="offset points",ha="center",va="bottom",font=SERIF,size=10.5,weight="bold",color=col["Japan"])
ax.hlines(1.1,-0.5,19.4,color=INK,lw=.9,ls=(0,(4,3)),zorder=4)
ax.text(0.2,30,"1.1 million: the ceiling for 5,800 years",font=SERIF,size=12,weight="bold",color=INK)
ax.text(0.2,28.8,"Every bar to the left of London sits under the dashed line. Rome, Chang'an,\nKaifeng, Hangzhou and Beijing all top out at roughly one million people.\nThen coal, steel, sewers and railways arrive.",font=SANS,size=9.5,color=INK,va="top",linespacing=1.45)
ax.text(21.45,31,"35x in\n225 years",ha="right",va="center",font=SERIF,size=11,weight="bold",color=INK,linespacing=1.3)
for nm,k in REG: f.text(0.05,0.85,nm,font=SANS,size=10.5,weight="bold",color=col[k])
head(f,"For almost all of history, the biggest city on Earth was a rounding error","Estimated population of the world's largest urban area at each date, on a plain linear scale. Six thousand years of Uruk, Babylon, Rome and Beijing sit flat against the axis. Three bars on the right are what industrialisation did.",
     credit=CREDIT,src="Where cities tied, the first is shown")
plt.subplots_adjust(left=0.08,right=0.97,top=0.83,bottom=0.1); save("c2c_bars")
