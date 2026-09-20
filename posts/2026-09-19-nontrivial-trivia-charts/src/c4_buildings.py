from style import *
b = [(-2570,"Great Pyramid of Giza",147,"E"),(1311,"Lincoln Cathedral",160,"C"),(1549,"St Mary's, Stralsund",151,"C"),(1647,"Strasbourg Cathedral",142,"C"),(1874,"St Nicholas', Hamburg",147,"C"),
     (1876,"Rouen Cathedral",151,"C"),(1880,"Cologne Cathedral",157,"C"),(1890,"Ulm Minster",162,"C"),(1901,"Philadelphia City Hall",167,"U"),(1908,"Singer Building",187,"U"),(1909,"Met Life Tower",213,"U"),
     (1913,"Woolworth Building",241,"U"),(1930,"Bank of Manhattan",283,"U"),(1930.5,"Chrysler Building",319,"U"),(1931,"Empire State Building",381,"U"),(1972,"1 World Trade Center",417,"U"),(1973,"Sears Tower",442,"U"),
     (1998,"Petronas Towers",452,"A"),(2004,"Taipei 101",509,"A"),(2010,"Burj Khalifa",828,"A")]
col = {"E":ORANGE,"C":PURPLE,"U":BLUE,"A":RED}
f, ax = fig(15,9)
X0 = 1290
yr = [max(x[0],X0) for x in b]+[2035]; ht = [x[2] for x in b]
for i in range(len(b)):
    ax.fill_between([yr[i],yr[i+1]],[ht[i],ht[i]],0,color=col[b[i][3]],alpha=.3,lw=0,zorder=2)
ax.step(yr,ht+[ht[-1]],where="post",color=INK,lw=1.1,zorder=3)
ax.set_xlim(X0,2040); ax.set_ylim(0,900); ax.set_yticks([0,200,400,600,800]); ax.set_yticklabels(["0","200 m","400 m","600 m","800 m"],font=SANS,size=10,color=MUTE)
ax.set_xticks([1300,1400,1500,1600,1700,1800,1900,2000]); ax.set_xticklabels([str(v) for v in [1300,1400,1500,1600,1700,1800,1900,2000]],font=SANS,size=10,color=MUTE); ax.grid(axis="y",color=LINE,lw=.6,zorder=0)
def lab(i,dx=0,dy=8,ha="left",rot=0): ax.annotate(b[i][1],(max(b[i][0],X0)+dx,b[i][2]),xytext=(3,dy),textcoords="offset points",ha=ha,va="bottom",font=SANS,size=9,color=INK,rotation=rot,zorder=5)
lab(1); lab(2,dy=-16); lab(3,dy=8); lab(7,dy=8); lab(12,dy=-16); lab(14,ha="right",dx=-3,dy=6); lab(17,ha="right",dx=-3,dy=6); lab(18,dy=-16,dx=-2,ha="right"); lab(19,dy=8,ha="right",dx=-3)
ax.text(X0+5,20,"Before 1311: the Great Pyramid held the record for roughly 3,880 years, at 147 m.\nLincoln Cathedral beat it by 13 metres.",font=SERIF,size=10.5,style="italic",color=INK,linespacing=1.5,va="bottom")
ax.text(1730,500,"Six centuries of churches, all\nbetween 142 and 162 metres. The\nrecord bounced between France and\nGermany as spires blew down\nand burned.",font=SERIF,size=10.5,style="italic",color=PURPLE,linespacing=1.5)
ax.text(1790,660,"Steel frames and elevators: New York\nadds 275 metres in 30 years, then\nstops for four decades.",font=SERIF,size=10.5,style="italic",color=BLUE,linespacing=1.5)
ax.annotate("Burj Khalifa is 60% taller\nthan anything before it",(2010,828),xytext=(1930,800),textcoords="data",ha="center",va="center",font=SERIF,size=10.5,style="italic",color=RED,arrowprops=dict(arrowstyle="-",color=RED,lw=.7))
for i,(k,nm) in enumerate([("E","Egypt"),("C","European churches"),("U","United States"),("A","Asia and the Gulf")]): f.text(0.05+i*0.13,0.845,nm,font=SANS,size=10.5,weight="bold",color=col[k])
head(f,"The tallest building on Earth, 1300 to today","Height of the world's tallest building at each date. The chart starts in 1300 because the first 3,900 years are one flat line\nat the Great Pyramid; the interesting part is what happens once anyone else tries.")
plt.subplots_adjust(left=0.06,right=0.97,top=0.83,bottom=0.08); save("c4_buildings")
