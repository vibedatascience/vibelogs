from style import *
from cities_data import *
yr = np.array([r[0] for r in rows]); pop = np.array([r[2] for r in rows]); x = np.arange(len(rows))
f, ax = fig(16,11)
ax.plot(x,pop,color=INK,lw=1.3,zorder=2,alpha=.7)
ax.scatter(x,pop,s=70,c=[col[r[3]] for r in rows],zorder=3,edgecolor=BG,lw=1.2)
ax.set_yscale("log"); ax.set_ylim(2.5e3,4e8); ax.set_xlim(-0.8,len(rows)-0.3); nolog_minor(ax)
ax.set_yticks([1e4,1e5,1e6,1e7]); ax.set_yticklabels(["10,000","100,000","1 million","10 million"],font=SANS,size=10,color=MUTE)
ax.set_xticks(x); ax.set_xticklabels([f"{abs(y)} BCE" if y<0 else str(y) for y in yr],font=SANS,size=8.5,color=MUTE,rotation=90)
ax.grid(axis="y",color=LINE,lw=.8)
short = {2:"Memphis / Ur",4:"Babylon / Thebes"}
for i,(y,city,p,reg) in enumerate(rows):
    up = i != 21
    ax.annotate(short.get(i,city) if i!=22 else "Tokyo, 38M",(i,p),xytext=(0,8 if up else -8),textcoords="offset points",ha="center",va="bottom" if up else "top",
                font=SANS if i!=22 else SERIF,size=8.5 if i!=22 else 12,weight="bold",color=col[reg],rotation=90,zorder=4,
                bbox=dict(fc=BG,ec="none",pad=0.6))
def note(i,txt,xt,ha="center"):
    ax.annotate(txt,(i,pop[i]),xytext=xt,textcoords="data",ha=ha,va="center",font=SERIF,size=9.5,color=INK,linespacing=1.35,
                arrowprops=dict(arrowstyle="-",color=MUTE,lw=.8,shrinkB=6,shrinkA=3),zorder=5)
note(5,"Late Bronze Age collapse:\nthe largest city on Earth\nshrinks by nearly half",(5.5,7e3))
note(11,"Rome before the fall:\nthe capital has already\nmoved to Constantinople",(11,4e4))
note(17,"The Mongols invade;\nChina loses its\nmillion-person city",(17,6e4))
note(20,"Industrial Revolution:\nLondon is the first\nWestern no.1 in 1,500 years",(16.4,1.1e8))
for nm,k in REG: f.text(0.05,0.85,nm,font=SANS,size=10.5,weight="bold",color=col[k])
head(f,"The largest city on Earth, for six thousand years","Estimated population of the world's biggest urban area at each date. For most of history the answer was a Mesopotamian, Egyptian or Chinese city, and the ceiling sat at roughly one million people until industrialisation blew the roof off.",
     credit=CREDIT,src="Log scale. Dates are evenly spaced, not to scale. Where cities tied, the first is shown")
plt.subplots_adjust(left=0.1,right=0.97,top=0.83,bottom=0.1); save("c2b_logline")
