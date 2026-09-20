from style import *
q = [("Valdivia, Chile 1960",9.5,1655,"1,655 confirmed"),("Alaska 1964",9.2,131,"131, mostly tsunami"),("Sumatra 2004",9.1,283100,"283,100, mostly tsunami"),("Tohoku, Japan 2011",9.1,15703,"15,703 plus 4,647 missing"),
     ("Kamchatka 1952",9.0,12500,"10,000 to 15,000, tsunami"),("Maule, Chile 2010",8.8,523,"523"),("Ecuador 1906",8.8,1000,"500 to 1,500, tsunami"),("Rat Islands, Alaska 1965",8.7,0,"none; $10,000 damage"),
     ("Assam-Tibet 1950",8.6,780,"at least 780"),("Sumatra 2012",8.6,10,"10, eight of them heart attacks")]
f, ax = fig(14,9.5); ax.set_yscale("log"); nolog_minor(ax)
ax.set_xlim(8.5,9.65); ax.set_ylim(0.5,2e6)
for n,m,d,txt in q:
    dv = 0.7 if d==0 else d
    big = d>=10000
    ax.scatter(m,dv,s=200,color=RED if big else MUTE,zorder=3,edgecolor=BG,lw=1.5)
    off = {"Tohoku, Japan 2011":(10,-16),"Sumatra 2004":(10,4),"Maule, Chile 2010":(10,-12),"Kamchatka 1952":(-10,4),"Ecuador 1906":(10,12),"Alaska 1964":(10,0),"Valdivia, Chile 1960":(-10,0)}.get(n,(10,0))
    ax.annotate(f"{n}\n{txt}",(m,dv),xytext=off,textcoords="offset points",ha="right" if off[0]<0 else "left",va="center",font=SANS,size=9.5,color=RED if big else INK,weight="bold" if big else "normal",linespacing=1.35)
ax.set_yticks([1,10,100,1000,1e4,1e5,1e6]); ax.set_yticklabels(["0 or 1","10","100","1,000","10,000","100,000","1 million"],font=SANS,size=10,color=MUTE)
ax.set_xticks([8.6,8.8,9.0,9.2,9.4]); ax.set_xticklabels(["M 8.6","8.8","9.0","9.2","9.4"],font=SANS,size=10,color=MUTE); ax.grid(color=LINE,lw=.6,zorder=0)
ax.text(8.52,4e5,"Every death toll above 10,000 on this chart came from\nthe wave, not the shaking. The quakes struck at sea,\nfar from people, and then the sea came to them.",font=SERIF,size=11,style="italic",color=INK,linespacing=1.5,va="top")
head(f,"The biggest earthquakes ever recorded mostly killed very few people","The ten largest quakes by magnitude (USGS) against their recorded death tolls, on a log scale. Magnitude barely predicts deaths;\nwhether a tsunami reached a coastline does.",src="Tolls are the book's figures; where a range was given the midpoint is plotted")
plt.subplots_adjust(left=0.08,right=0.97,top=0.83,bottom=0.08); save("c5_quakes")
