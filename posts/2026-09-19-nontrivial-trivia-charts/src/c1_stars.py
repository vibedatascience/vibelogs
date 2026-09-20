from style import *
systems = [("Alpha Centauri",4.24,"3 stars, incl. Proxima","Red / yellow / orange dwarfs",2),("Barnard's Star",5.96,"1 planet","Red dwarf",0),("Luhman 16",6.5,"Brown dwarf pair","Brown dwarf",3),
 ("WISE 0855-0714",7.26,"Coldest object known","Brown dwarf",3),("Wolf 359",7.86,"2 suspected planets","Red dwarf",0),("Lalande 21185",8.31,"1 planet","Red dwarf",0),
 ("Sirius",8.66,"Brightest star in the sky","A-type + white dwarf",1),("Luyten 726-8",8.79,"Flare star pair","Red dwarf",0),("Ross 154",9.6,"Flare star","Red dwarf",0)]
cols = [RED,"#9FC5E8",AMBER,"#8B94A3"]; names = ["Red dwarf","Sun-like or brighter","Multiple-type system","Brown dwarf"]
f, ax = fig(13,12,dark=True); ax.set_aspect("equal"); ax.set_xlim(-11.5,11.5); ax.set_ylim(-11,11.5); ax.set_xticks([]); ax.set_yticks([])
for r in [2,4,6,8,10]:
    ax.add_patch(plt.Circle((0,0),r,fill=False,ec=DLINE,lw=.8)); ax.text(0.15,r+0.15,f"{r} ly",font=SANS,size=9,color=DMUTE)
ax.scatter(0,0,s=260,color=AMBER,zorder=4); ax.text(0,-0.75,"Sun",ha="center",font=SANS,size=10,color=DINK,weight="bold")
angs = np.linspace(20,340,len(systems))
for (n,d,note,typ,ci),a in zip(systems,angs):
    x,y = d*np.cos(np.radians(a)), d*np.sin(np.radians(a))
    ax.plot([0,x],[0,y],color=DLINE,lw=.6,zorder=1)
    ax.scatter(x,y,s=150 if ci!=3 else 70,color=cols[ci],zorder=3,edgecolor=DBG,lw=1)
    ha = "left" if x>=0 else "right"; dx = 0.35 if x>=0 else -0.35
    ax.text(x+dx,y+0.28,n,ha=ha,va="center",font=SANS,size=11,weight="bold",color=DINK)
    ax.text(x+dx,y-0.28,f"{d} light years. {note}.",ha=ha,va="center",font=SANS,size=8.8,color=DMUTE)
for i,(c,nm) in enumerate(zip(cols,names)): f.text(0.05+i*0.17,0.845,nm,font=SANS,size=10.5,weight="bold",color=c)
head(f,"Everyone within ten light years of home","Every known star system and substellar object within 10 light years of the Sun, drawn at true distance from the centre.\nThe angle each sits at is arbitrary; only the ring it falls on matters. It is a very quiet neighbourhood.",dark=True,
     src="Distances as listed in the book. Angles chosen for legibility, not sky position")
plt.subplots_adjust(left=0.03,right=0.97,top=0.80,bottom=0.03); save("c1_stars")
