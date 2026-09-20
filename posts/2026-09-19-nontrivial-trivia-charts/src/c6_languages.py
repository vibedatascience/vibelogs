from style import *
L = [("English",369.7,1268),("Mandarin Chinese",921.5,1120),("Hindi",342,637.3),("Spanish",463,537.9),("French",77.3,276.6),("Standard Arabic",0,274),("Bengali",228.5,265.2),("Russian",153.6,258),
     ("Portuguese",227.9,252.2),("Indonesian",43.6,199),("Urdu",69,170.6),("German",75.5,131.6),("Japanese",126.2,126.4),("Swahili",16.2,98.5),("Marathi",83.1,95.3)]
f, ax = fig(14,10.5)
y = np.arange(len(L))[::-1]
for i,(n,nat,tot) in enumerate(L):
    share = (tot-nat)/tot
    c = RED if share>0.5 else BLUE
    ax.hlines(y[i],nat,tot,color=c,lw=3,alpha=.35,zorder=1)
    ax.scatter(nat,y[i],s=110,color=BG,edgecolor=c,lw=2,zorder=3); ax.scatter(tot,y[i],s=110,color=c,zorder=3)
    ax.text(-25,y[i],n,ha="right",va="center",font=SANS,size=11.5,color=INK,weight="bold" if share>0.5 else "normal")
    ax.text(tot+22,y[i],f"{tot:,.0f}M",va="center",font=SANS,size=9.5,color=c,weight="bold")
    if share>0.15: ax.text((nat+tot)/2,y[i]+0.32,f"{share:.0%} learned it",ha="center",va="bottom",font=SANS,size=8.3,color=c)
ax.set_xlim(-30,1400); ax.set_ylim(-0.7,len(L)-0.3); ax.set_yticks([]); ax.set_xticks([0,250,500,750,1000,1250]); ax.set_xticklabels(["0","250M","500M","750M","1bn","1.25bn"],font=SANS,size=10,color=MUTE); ax.grid(axis="x",color=LINE,lw=.6,zorder=0)
ax.scatter(700,2.2,s=110,color=BG,edgecolor=MUTE,lw=2); ax.text(725,2.2,"native speakers",va="center",font=SANS,size=9.5,color=MUTE)
ax.scatter(700,1.4,s=110,color=MUTE); ax.text(725,1.4,"all speakers, native plus learned",va="center",font=SANS,size=9.5,color=MUTE)
ax.text(700,0.0,"Red: more than half of the language's speakers learned it.",font=SANS,size=9.5,color=RED)
head(f,"Most people who speak English learned it","The 15 most spoken languages, from native speakers to total speakers. The gap is the second-language crowd. Mandarin has\nmore than twice English's native speakers and still comes second.",src="Native counts derived as total minus second-language speakers where the book lists both")
plt.subplots_adjust(left=0.16,right=0.97,top=0.83,bottom=0.07); save("c6_languages")
