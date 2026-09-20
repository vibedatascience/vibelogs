import matplotlib as mpl, matplotlib.pyplot as plt, numpy as np
from matplotlib import font_manager as fm
for f in ["fonts/Fraunces.ttf","fonts/Commissioner.ttf"]: fm.fontManager.addfont(f)
SERIF, SANS = "Fraunces", "Commissioner"
d = [("Russia",17.10,4.21,146),("Canada",9.98,8.93,42),("China",9.60,2.82,1408),("United States",9.53,3.96,340),("Brazil",8.52,0.65,213),
     ("Australia",7.69,0.76,27),("India",3.29,9.55,1413),("Argentina",2.78,1.57,47),("Kazakhstan",2.72,0.92,20),("Algeria",2.38,0,47)]
BG, INK, MUTE, GREY = "#F4EFE6", "#1F1A17", "#8A7F73", "#B9B0A3"
ACC, ACC2 = "#1E6F8C", "#C0392B"
hi = {"Canada","Australia","Kazakhstan"}; dense = {"India","China"}

fig, ax = plt.subplots(figsize=(15,10), facecolor=BG); ax.set_facecolor(BG)
ax.set_yscale("log"); ax.set_xlim(1.5,18.5); ax.set_ylim(9,2600)
for n,a,w,p in d:
    c = ACC if n in hi else ACC2 if n in dense else GREY
    ax.scatter(a,p,s=560,color=c,zorder=3,edgecolor=BG,lw=2)
    ax.scatter(a,p,s=560*w/30,color=BG,zorder=4,alpha=.85) if w>0 else None
    dens = p*1e6/(a*1e6)
    off = {"United States":(0,24),"China":(0,22),"Russia":(0,22),"Brazil":(0,-24),"India":(18,0),"Argentina":(16,-4),"Algeria":(-16,-4),"Kazakhstan":(0,-24),"Australia":(0,-24),"Canada":(0,-24)}[n]
    ha = "left" if off[0]>0 else "right" if off[0]<0 else "center"
    ax.annotate(f"{n}\n{dens:.0f} people / km²" if n!="Argentina" and n!="Algeria" else f"{n}, {dens:.0f} / km²",(a,p),xytext=off,textcoords="offset points",ha=ha,va="center",
                font=SANS,size=10,color=c if c!=GREY else MUTE,weight="bold" if c!=GREY else "normal",linespacing=1.4,zorder=5)
ax.set_xticks([2,4,6,8,10,12,14,16,18]); ax.set_xticklabels([f"{v}M km²" for v in [2,4,6,8,10,12,14,16,18]],font=SANS,size=10,color=MUTE)
ax.set_yticks([10,100,1000]); ax.set_yticklabels(["10M people","100M","1 billion"],font=SANS,size=10,color=MUTE)
ax.tick_params(length=0); ax.tick_params(axis="y",which="minor",length=0); ax.yaxis.set_minor_formatter(mpl.ticker.NullFormatter())
ax.grid(color="#DDD5C8",lw=.7,zorder=0); [s.set_visible(False) for s in ax.spines.values()]

ax.text(5.2,1900,"Crowded",font=SERIF,size=13,style="italic",color=ACC2); ax.text(5.2,1600,"India and China: two of the ten biggest\ncountries hold a third of all people",font=SANS,size=10,color=INK,linespacing=1.4,va="top")
ax.text(11.5,38,"Empty",font=SERIF,size=13,style="italic",color=ACC); ax.text(11.5,32,"Canada, Australia and Kazakhstan together cover\n20 million km² and hold fewer people than Vietnam",font=SANS,size=10,color=INK,linespacing=1.4,va="top")
ax.scatter(15.6,1600,s=560,color=GREY,edgecolor=BG,lw=2); ax.scatter(15.6,1600,s=560*9/30,color=BG,alpha=.85)
ax.text(16.2,1600,"The hole shows the share of the\ncountry that is water. Canada and\nIndia are about 9% lake and river.",va="center",font=SANS,size=9.5,color=INK,linespacing=1.4)

fig.text(0.05,0.945,"Big countries come in two kinds: crowded and empty",font=SERIF,size=28,weight="bold",color=INK)
fig.text(0.05,0.895,"The ten largest countries by total area, against their population in 2025. Area is drawn to a plain scale, population on a log scale,\n"
         "which is the only way to keep India and Kazakhstan on the same page.",font=SANS,size=12,color=INK,linespacing=1.5)
fig.text(0.05,0.02,"Data: Jonn Elledge, Nontrivial Trivia (2024). Density is population divided by total area, water included.",font=SANS,size=9,color=MUTE)
plt.subplots_adjust(left=0.08,right=0.97,top=0.83,bottom=0.09)
plt.savefig("/mnt/user-data/outputs/largest_countries_area_pop.png",dpi=160,facecolor=BG)
