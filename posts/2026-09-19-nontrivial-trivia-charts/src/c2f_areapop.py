from style import *
import textwrap
d = [("Russia",17.10,4.21,146),("Canada",9.98,8.93,42),("China",9.60,2.82,1408),("United States",9.53,3.96,340),("Brazil",8.52,0.65,213),
     ("Australia",7.69,0.76,27),("India",3.29,9.55,1413),("Argentina",2.78,1.57,47),("Kazakhstan",2.72,0.92,20),("Algeria",2.38,0,47)]
GREY = "#A89F93"
ACC, ACC2 = "#1E6F8C", "#C0392B"
hi = {"Canada","Australia","Kazakhstan"}; dense = {"India","China"}

f, ax = fig(15,11)
ax.set_yscale("log"); ax.set_xlim(1.5,18.5); ax.set_ylim(9,2600)
for n,a,w,p in d:
    c = ACC if n in hi else ACC2 if n in dense else GREY
    ax.scatter(a,p,s=420,color=c,zorder=3,edgecolor=BG,lw=2)
    ax.scatter(a,p,s=420*w/30,color=BG,zorder=4,alpha=.85) if w>0 else None
    dens = p*1e6/(a*1e6)
    off = {"United States":(24,0),"China":(0,22),"Russia":(0,22),"Brazil":(0,-24),"India":(18,0),"Argentina":(16,-4),"Algeria":(-16,-4),"Kazakhstan":(0,-24),"Australia":(0,-24),"Canada":(0,-24)}[n]
    ha = "left" if off[0]>0 else "right" if off[0]<0 else "center"
    ax.annotate(f"{n}\n{dens:.0f} people / km²" if n!="Argentina" and n!="Algeria" else f"{n}, {dens:.0f} / km²",(a,p),xytext=off,textcoords="offset points",ha=ha,va="center",
                font=SANS,size=10,color=c if c!=GREY else MUTE,weight="bold" if c!=GREY else "normal",linespacing=1.4,zorder=5)
ax.set_xticks([2,4,6,8,10,12,14,16,18]); ax.set_xticklabels([f"{v}M km²" for v in [2,4,6,8,10,12,14,16,18]],font=SANS,size=10,color=MUTE)
ax.set_yticks([10,100,1000]); ax.set_yticklabels(["10M people","100M","1 billion"],font=SANS,size=10,color=MUTE)
ax.tick_params(length=0); ax.tick_params(axis="y",which="minor",length=0); ax.yaxis.set_minor_formatter(mpl.ticker.NullFormatter())
ax.grid(color="#DDD5C8",lw=.7,zorder=0); [s.set_visible(False) for s in ax.spines.values()]

ax.text(3.9,900,"Crowded",font=SERIF,size=13,color=ACC2); ax.text(3.9,780,"India and China: two of the\nten biggest countries hold\na third of all people",font=SANS,size=10,color=INK,linespacing=1.4,va="top")
ax.text(11.9,38,"Empty",font=SERIF,size=13,style="italic",color=ACC); ax.text(11.9,32,"Canada, Australia and Kazakhstan\ntogether cover 20 million km² and\nhold fewer people than Vietnam",font=SANS,size=10,color=INK,linespacing=1.4,va="top")
ax.scatter(12.4,1500,s=420,color=GREY,edgecolor=BG,lw=2); ax.scatter(12.4,1500,s=420*9/30,color=BG,alpha=.85)
ax.text(13.0,1500,"The hole shows the share\nof the country that is water.\nCanada and India are\nabout 9% lake and river.",va="center",font=SANS,size=9.5,color=INK,linespacing=1.4)

head(f,"Big countries come in two kinds: crowded and empty","The ten largest countries by total area, against their population in 2025. Area is drawn to a plain scale, population on a log scale, which is the only way to keep India and Kazakhstan on the same page.",src="Density is population divided by total area, water included")
plt.subplots_adjust(left=0.08,right=0.97,top=0.83,bottom=0.09)
save("c2f_areapop")
