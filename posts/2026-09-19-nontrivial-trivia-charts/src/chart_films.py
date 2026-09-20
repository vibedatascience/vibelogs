import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
for f in ["fonts/Fraunces.ttf","fonts/Commissioner.ttf"]: fm.fontManager.addfont(f)
SERIF, SANS = "Fraunces", "Commissioner"
nom = [("Avatar",2009,2.924,1),("Avengers: Endgame",2019,2.718,1),("Avatar: The Way of Water",2022,2.320,1),("Titanic",1997,2.223,0),
       ("Star Wars: The Force Awakens",2015,2.056,1),("Avengers: Infinity War",2018,2.048,1),("Ne Zha 2",2025,1.970,1),
       ("Spider-Man: No Way Home",2021,1.921,1),("Inside Out 2",2024,1.699,1),("Jurassic World",2015,1.671,1)]
adj = [("Gone with the Wind",1939,4.3,0),("Avatar",2009,4.0,1),("Titanic",1997,3.7,0),("Star Wars",1977,3.6,1),("Avengers: Endgame",2019,3.3,1),
       ("The Sound of Music",1965,3.0,0),("E.T. the Extra-Terrestrial",1982,2.9,0),("The Ten Commandments",1956,2.8,0),("Doctor Zhivago",1965,2.6,0),
       ("Star Wars: The Force Awakens",2015,2.6,1)]
BG, INK, MUTE, LINE = "#F4EFE6", "#1F1A17", "#8A7F73", "#D9D0C3"
FR, ST = "#8A7F73", "#B4342B"
fig, ax = plt.subplots(figsize=(15,11), facecolor=BG); ax.set_facecolor(BG)
L, R = 0.0, 1.0
def rank_y(r): return 11-r
for i,(t,y,v,fr) in enumerate(nom,1):
    c = FR if fr else ST
    ax.scatter(L,rank_y(i),s=90,color=c,zorder=3)
    ax.text(L-0.03,rank_y(i),f"{t}  ({y})",ha="right",va="center",font=SANS,size=11,color=c,weight="bold" if not fr else "normal")
    ax.text(L-0.03,rank_y(i)-0.32,f"${v:.2f}bn nominal",ha="right",va="center",font=SANS,size=8.5,color=MUTE)
for i,(t,y,v,fr) in enumerate(adj,1):
    c = FR if fr else ST
    ax.scatter(R,rank_y(i),s=90,color=c,zorder=3)
    ax.text(R+0.03,rank_y(i),f"{t}  ({y})",ha="left",va="center",font=SANS,size=11,color=c,weight="bold" if not fr else "normal")
    ax.text(R+0.03,rank_y(i)-0.32,f"${v:.1f}bn in 2023 dollars",ha="left",va="center",font=SANS,size=8.5,color=MUTE)
nomd = {t:i for i,(t,*_) in enumerate(nom,1)}
for j,(t,y,v,fr) in enumerate(adj,1):
    c = FR if fr else ST
    if t in nomd:
        ax.plot([L,R],[rank_y(nomd[t]),rank_y(j)],color=c,lw=2.2,alpha=.8,zorder=2)
    else:
        ax.plot([R-0.18,R],[rank_y(j),rank_y(j)],color=c,lw=2.2,alpha=.8,zorder=2,ls=(0,(1,2)))
for i,(t,*_) in enumerate(nom,1):
    if t not in {a[0] for a in adj}:
        ax.plot([L,L+0.18],[rank_y(i),rank_y(i)],color=FR,lw=2.2,alpha=.5,zorder=2,ls=(0,(1,2)))
for r in range(1,11):
    ax.text(0.5,rank_y(r),f"#{r}",ha="center",va="center",font=SANS,size=9,color=LINE,zorder=1)
ax.text(L,11.3,"Highest-grossing, May 2025",ha="center",font=SERIF,size=13,weight="bold",color=INK)
ax.text(R,11.3,"Adjusted for inflation",ha="center",font=SERIF,size=13,weight="bold",color=INK)
ax.text(0.5,4.3,"Six films from before 1985\nappear from nowhere.\nFive of them are not franchises.",ha="center",va="center",font=SERIF,size=11,style="italic",color=ST,linespacing=1.5)
ax.text(0.5,8.2,"Only four films\nsurvive the adjustment",ha="center",va="center",font=SERIF,size=11,style="italic",color=INK,linespacing=1.5,
        bbox=dict(boxstyle="round,pad=0.4",fc=BG,ec="none"))
ax.set_xlim(-0.95,1.95); ax.set_ylim(0.2,12); ax.axis("off")
fig.text(0.05,0.94,"Adjust for inflation and the box office stops belonging to franchises",font=SERIF,size=26,weight="bold",color=INK)
fig.text(0.05,0.89,"Left: the top ten films by worldwide gross. Right: the same list once takings are restated in 2023 dollars. Nine of the ten on the left are\n"
         "sequels or franchise launchers; six of the ten on the right were made before Star Wars existed as a business model.",font=SANS,size=12,color=INK,linespacing=1.5)
fig.text(0.05,0.845,"Standalone film",font=SANS,size=10.5,weight="bold",color=ST); fig.text(0.135,0.845,"Part of a franchise",font=SANS,size=10.5,weight="bold",color=FR)
fig.text(0.05,0.02,"Data: Jonn Elledge, Nontrivial Trivia (2024); adjusted figures from Guinness World Records / Wikipedia. Inflation adjustment is unofficial and contested.",font=SANS,size=9,color=MUTE)
plt.subplots_adjust(left=0.03,right=0.97,top=0.82,bottom=0.05)
plt.savefig("/mnt/user-data/outputs/box_office_inflation_slope.png",dpi=160,facecolor=BG)
