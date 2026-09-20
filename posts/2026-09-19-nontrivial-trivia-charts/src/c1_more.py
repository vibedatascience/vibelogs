from style import *
# ---------- animals ----------
A = [("Fruit flies",1947,"USA",1,"V2 rocket, 68 miles"),("Albert II, rhesus monkey",1948,"USA",0,"parachute failure"),("Mouse",1950,"USA",0,"parachute failure"),("Tsygan and Dezik, dogs",1951,"USSR",1,"suborbital"),
     ("Laika, dog",1957,"USSR",0,"first to orbit; died in space"),("Marfusa, rabbit",1959,"USSR",1,"132 miles"),("Sally, Amy and Moe, mice",1960,"USA",1,"returned"),("Ham, chimp",1961,"USA",1,"suborbital"),
     ("Enos, chimp",1961.5,"USA",1,"first chimp in orbit"),("Felicette, cat",1963,"France",1,"100 miles"),("Veterok and Ugolyok, dogs",1966,"USSR",1,"22 days in orbit"),("Two tortoises",1968,"USSR",1,"circled the Moon"),
     ("Arabella and Anita, spiders",1973,"USA",0,"spun webs on Skylab; died in orbit")]
cc = {"USA":BLUE,"USSR":RED,"France":AMBER}
f, ax = fig(14,8.5)
lane = {"USA":2,"USSR":1,"France":0}
for n,y,c,ok,note in A:
    yy = lane[c]
    ax.scatter(y,yy,s=260,color=cc[c] if ok else BG,edgecolor=cc[c],lw=2.2,zorder=3)
    dx,dy,ha = {"Fruit flies":(-8,16,"right"),"Albert II, rhesus monkey":(0,-16,"center"),"Mouse":(8,16,"left"),"Sally, Amy and Moe, mice":(-8,-16,"right"),"Ham, chimp":(0,16,"center"),"Enos, chimp":(8,-16,"left"),
                "Tsygan and Dezik, dogs":(0,-16,"center"),"Marfusa, rabbit":(0,-16,"center"),"Two tortoises":(0,-16,"center")}.get(n,(0,16,"center"))
    ax.annotate(f"{n}\n{int(y)}, {note}",(y,yy),xytext=(dx,dy),textcoords="offset points",ha=ha,va="bottom" if dy>0 else "top",font=SANS,size=8.6,color=INK,linespacing=1.35)
for c,yy in lane.items():
    ax.hlines(yy,1945,1975,color=LINE,lw=1,zorder=1); ax.text(1944.5,yy,c,ha="right",va="center",font=SANS,size=12,weight="bold",color=cc[c])
ax.set_xlim(1944.3,1977); ax.set_ylim(-0.9,2.9); ax.set_yticks([]); ax.set_xticks(range(1945,1976,5)); ax.set_xticklabels([str(v) for v in range(1945,1976,5)],font=SANS,size=10,color=MUTE)
ax.scatter(1946,2.75,s=160,color=MUTE); ax.text(1946.6,2.75,"came back alive",va="center",font=SANS,size=9.5,color=MUTE)
ax.scatter(1951.5,2.75,s=160,color=BG,edgecolor=MUTE,lw=2); ax.text(1952.1,2.75,"did not",va="center",font=SANS,size=9.5,color=MUTE)
head(f,"Thirteen animal flights, 1947 to 1973","Every flight in the list, by country. Fruit flies went first, on a captured German V2 in 1947. Nine of the thirteen came back alive.\nLaika, the first living thing to orbit the Earth, did not; nor did the two spiders on Skylab in 1973.")
plt.subplots_adjust(left=0.08,right=0.97,top=0.82,bottom=0.08); save("c1b_animals")
# ---------- planets ----------
P = [("Mercury",4879,0.39,0,0.24,"#8A7F73"),("Venus",12104,0.72,0,0.62,"#D9B36C"),("Earth",12756,1,1,1,BLUE),("Mars",6792,1.52,2,1.88,RED),("Jupiter",142984,5.2,79,11.6,ORANGE),("Saturn",120536,9.58,82,29,"#C9B79C"),("Uranus",51118,19.2,27,84,TEAL),("Neptune",49528,30.05,14,164,"#2F4A8A")]
f, ax = fig(14,9.5); ax.set_xscale("log"); ax.set_yscale("log"); nolog_minor(ax)
k = 70/142984
for n,d,au,m,per,c in P:
    ax.scatter(au,per,s=max(3.1416*(d*k/2)**2,14),color=c,zorder=3,edgecolor=BG,lw=1)
    off = {"Mercury":(10,6),"Venus":(10,-4),"Earth":(10,2),"Mars":(10,2),"Jupiter":(-44,20),"Saturn":(-40,22),"Uranus":(14,-8),"Neptune":(14,-8)}[n]
    ax.annotate(f"{n}\n{d:,} km across, {m} moon{'s' if m!=1 else ''}",(au,per),xytext=off,textcoords="offset points",ha="left" if off[0]>0 else "right",va="center",font=SANS,size=9.5,color=INK,linespacing=1.35,zorder=5)
xs = np.logspace(np.log10(0.3),np.log10(40),50); ax.plot(xs,xs**1.5,color=LINE,lw=1.2,ls=(0,(4,3)),zorder=1)
ax.text(1.6,0.3,"Kepler's third law: period = distance^1.5",font=SERIF,size=10.5,style="italic",color=MUTE)
ax.set_xlim(0.3,60); ax.set_ylim(0.15,300)
ax.set_xticks([0.5,1,2,5,10,20,40]); ax.set_xticklabels(["0.5 AU","1","2","5","10","20","40"],font=SANS,size=10,color=MUTE)
ax.set_yticks([0.25,1,4,16,64,256]); ax.set_yticklabels(["3 months","1 year","4","16","64","256 years"],font=SANS,size=10,color=MUTE); ax.grid(color=LINE,lw=.5,zorder=0)
head(f,"The eight planets, drawn to scale where it can be done","Distance from the Sun against orbital period, both on log scales, so all eight fit on one page. Each dot is the planet's true\nrelative size: Jupiter is 29 times Mercury's diameter. Neptune is 78 times further out than Mercury and takes 164 years to go round.")
plt.subplots_adjust(left=0.08,right=0.97,top=0.83,bottom=0.08); save("c1c_planets")
print("done")
