from style import *
rec = [(2001,"Abu Dhabi, UAE",122),(2003,"Amman, Jordan",127),(2004,"Aqaba, Jordan",130),(2008,"Ashgabat, Turkmenistan",133),(2010,"Baku, Azerbaijan",162),(2011,"Dushanbe, Tajikistan",165),(2014,"Jeddah, Saudi Arabia",171)]
other = [(1988,"Kijong-dong, North Korea\n(a mast, not a pole, says Guinness)",160),(2005,"Sheboygan, Wisconsin\n(an insurance company)",122),(2017,"Wagah, Pakistan\n(two miles from India's)",122)]
f, ax = fig(14,8.5)
xs = [r[0] for r in rec]+[2027]; hs = [r[2] for r in rec]
ax.fill_between(xs,hs+[hs[-1]],0,step="post",color=RED,alpha=.12,zorder=1); ax.step(xs,hs+[hs[-1]],where="post",color=RED,lw=2,zorder=3)
for x,n,h in rec:
    ax.scatter(x,h,s=90,color=RED,zorder=4,edgecolor=BG,lw=1.5)
    off={2001:(-6,-4,"right","top"),2003:(-6,6,"right","bottom"),2004:(6,-4,"left","top"),2008:(0,10,"center","bottom"),2010:(-6,6,"right","bottom"),2011:(6,-4,"left","top"),2014:(0,10,"center","bottom")}[x]
    ax.annotate(f"{n}\n{h} m",(x,h),xytext=off[:2],textcoords="offset points",ha=off[2],va=off[3],font=SANS,size=9.3,color=INK,linespacing=1.35)
for x,n,h in other:
    ax.scatter(x,h,s=90,color=MUTE,zorder=4,edgecolor=BG,lw=1.5)
    ax.annotate(n,(x,h),xytext=(0,-12 if x!=1988 else 10),textcoords="offset points",ha="center",va="top" if x!=1988 else "bottom",font=SANS,size=8.8,color=MUTE,linespacing=1.35)
ax.set_xlim(1985,2027); ax.set_ylim(90,195); ax.set_yticks([100,125,150,175]); ax.set_yticklabels(["100 m","125 m","150 m","175 m"],font=SANS,size=10,color=MUTE); ax.grid(axis="y",color=LINE,lw=.6,zorder=0)
ax.set_xticks([1990,1995,2000,2005,2010,2015,2020,2025]); ax.set_xticklabels([str(v) for v in [1990,1995,2000,2005,2010,2015,2020,2025]],font=SANS,size=10,color=MUTE)
ax.text(1986,94,"Seven record-holders in 13 years, all built by one US defence contractor,\nTrident Support. The same firm talked Guinness into disqualifying North Korea's.",font=SERIF,size=10.5,style="italic",color=INK,linespacing=1.5,va="bottom")
head(f,"The flagpole arms race","Height of the world's tallest free-standing flagpole since the race began in 2001, with three notable also-rans in grey. The Jeddah pole\nweighs 500 tons and flies a flag a quarter the size of a football pitch.")
plt.subplots_adjust(left=0.06,right=0.97,top=0.83,bottom=0.08); save("c8_flagpoles")
