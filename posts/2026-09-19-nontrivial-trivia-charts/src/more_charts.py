from style import *
# ---------- ch4b: years held ----------
b = [("Great Pyramid of Giza",-2570,1311,"E"),("Lincoln Cathedral",1311,1548,"C"),("St Mary's, Stralsund",1549,1647,"C"),("Strasbourg Cathedral",1647,1874,"C"),("St Nicholas', Hamburg",1874,1876,"C"),
     ("Rouen Cathedral",1876,1880,"C"),("Cologne Cathedral",1880,1890,"C"),("Ulm Minster",1890,1901,"C"),("Philadelphia City Hall",1901,1908,"U"),("Singer Building",1908,1909,"U"),("Met Life Tower",1909,1913,"U"),
     ("Woolworth Building",1913,1930,"U"),("Bank of Manhattan",1930,1930.1,"U"),("Chrysler Building",1930.1,1931,"U"),("Empire State Building",1931,1972,"U"),("1 World Trade Center",1972,1973,"U"),("Sears Tower",1973,1998,"U"),
     ("Petronas Towers",1998,2004,"A"),("Taipei 101",2004,2010,"A"),("Burj Khalifa",2010,2026,"A")]
col = {"E":ORANGE,"C":PURPLE,"U":BLUE,"A":RED}
d = sorted([(n,max(e-s,0.08),k) for n,s,e,k in b],key=lambda x:x[1])
f, ax = fig(14,10.5); ax.set_xscale("log"); nolog_minor(ax)
y = np.arange(len(d))
for i,(n,v,k) in enumerate(d):
    ax.hlines(y[i],0.05,v,color=col[k],lw=2,alpha=.6); ax.scatter(v,y[i],s=110,color=col[k],zorder=3)
    lab = "1 month" if v<0.5 else f"{v:,.0f} yr" if v>=2 else f"{v:.0f} yr"
    ax.text(v*1.25,y[i],lab,va="center",font=SANS,size=10,weight="bold",color=col[k]); ax.text(0.045,y[i],n,ha="right",va="center",font=SANS,size=10.5,color=INK)
ax.set_xlim(0.05,9000); ax.set_ylim(-0.7,len(d)-0.3); ax.set_yticks([]); ax.set_xticks([0.1,1,10,100,1000]); ax.set_xticklabels(["","1 year","10","100","1,000"],font=SANS,size=10,color=MUTE); ax.grid(axis="x",color=LINE,lw=.6,zorder=0)
ax.text(120,4,"Median reign: 6 years.\nThe Pyramid held it five times\nlonger than all nineteen other\nrecord-holders combined.",font=SERIF,size=11,style="italic",color=INK,linespacing=1.5,va="center")
for i,(k,nm) in enumerate([("E","Egypt"),("C","European churches"),("U","United States"),("A","Asia and the Gulf")]): f.text(0.05+i*0.13,0.845,nm,font=SANS,size=10.5,weight="bold",color=col[k])
head(f,"How long each tallest building kept the title","Years each holder of the world's tallest building record lasted, on a log scale. Four held it for less than two years;\nthe Bank of Manhattan lost it to the Chrysler Building within a month.")
plt.subplots_adjust(left=0.22,right=0.96,top=0.83,bottom=0.07); save("c4b_reigns")
# ---------- ch4c: by country ----------
ctry = [("Egypt",1,3881,ORANGE),("United States",9,97,BLUE),("Germany",4,121,PURPLE),("France",2,231,PURPLE),("England",1,237,PURPLE),("United Arab Emirates",1,16,RED),("Malaysia",1,6,RED),("Taiwan",1,6,RED)]
f, ax = fig(14,8)
ctry = sorted(ctry,key=lambda x:x[1]); y=np.arange(len(ctry))
for i,(n,c,yr,cl) in enumerate(ctry):
    ax.barh(y[i],c,color=cl,height=0.6,zorder=3); ax.text(c+0.12,y[i],f"{c} building{'s' if c>1 else ''}, {yr:,} years in total",va="center",font=SANS,size=10.5,color=INK)
    ax.text(-0.12,y[i],n,ha="right",va="center",font=SANS,size=11.5,color=INK,weight="bold")
ax.set_xlim(0,12); ax.set_ylim(-0.7,len(ctry)-0.3); ax.set_yticks([]); ax.set_xticks([])
head(f,"Who has held the tallest-building record","Number of record-holding buildings per country since 2570 BCE, and the years each country held the record in total.\nThe US built nine of the twenty; Egypt built one and kept it for 3,881 years.")
plt.subplots_adjust(left=0.2,right=0.96,top=0.83,bottom=0.05); save("c4c_countries")
# ---------- ch6b: stacked native / learned ----------
L = [("English",369.7,1268),("Mandarin Chinese",921.5,1120),("Hindi",342,637.3),("Spanish",463,537.9),("French",77.3,276.6),("Standard Arabic",0,274),("Bengali",228.5,265.2),("Russian",153.6,258),
     ("Portuguese",227.9,252.2),("Indonesian",43.6,199),("Urdu",69,170.6),("German",75.5,131.6),("Japanese",126.2,126.4),("Swahili",16.2,98.5),("Marathi",83.1,95.3)]
Ls = sorted(L,key=lambda x:(x[2]-x[1])/x[2])
f, ax = fig(14,10); y=np.arange(len(Ls))
for i,(n,nat,tot) in enumerate(Ls):
    sh=(tot-nat)/tot
    ax.barh(y[i],nat/tot*100,color=BLUE,height=0.62,zorder=3); ax.barh(y[i],sh*100,left=nat/tot*100,color=RED,height=0.62,zorder=3)
    ax.text(-1.2,y[i],n,ha="right",va="center",font=SANS,size=11,color=INK); ax.text(101.2,y[i],f"{sh:.0%}",va="center",font=SANS,size=10.5,weight="bold",color=RED)
    if nat/tot>0.12: ax.text(nat/tot*100/2,y[i],f"{nat:,.0f}M",ha="center",va="center",font=SANS,size=8.5,color=BG)
    if sh>0.12: ax.text(nat/tot*100+sh*100/2,y[i],f"{tot-nat:,.0f}M",ha="center",va="center",font=SANS,size=8.5,color=BG)
ax.set_xlim(0,108); ax.set_ylim(-0.7,len(Ls)-0.3); ax.set_yticks([]); ax.set_xticks([0,25,50,75,100]); ax.set_xticklabels(["0%","25%","50%","75%","100%"],font=SANS,size=10,color=MUTE)
f.text(0.05,0.845,"Native speakers",font=SANS,size=10.5,weight="bold",color=BLUE); f.text(0.16,0.845,"Learned it",font=SANS,size=10.5,weight="bold",color=RED)
head(f,"Share of each language's speakers who learned it","The 15 most spoken languages, split into native and second-language speakers, sorted by the learner share. Japanese is\nalmost entirely native; Swahili and Standard Arabic are almost entirely learned.")
plt.subplots_adjust(left=0.16,right=0.95,top=0.83,bottom=0.07); save("c6b_stacked")
# ---------- ch6c: bump native rank -> total rank ----------
nat_rank = {n:i+1 for i,(n,_,_) in enumerate(sorted(L,key=lambda x:-x[1]))}
tot_rank = {n:i+1 for i,(n,_,_) in enumerate(sorted(L,key=lambda x:-x[2]))}
f, ax = fig(14,10.5)
for n,nat,tot in L:
    r0,r1 = nat_rank[n],tot_rank[n]; c = RED if r1<r0-1 else BLUE if r1>r0+1 else MUTE
    ax.plot([0,1],[r0,r1],color=c,lw=2.5 if c!=MUTE else 1.2,alpha=.85,zorder=2); ax.scatter([0,1],[r0,r1],s=80,color=c,zorder=3)
    ax.text(-0.04,r0,f"{n}  {nat:,.0f}M",ha="right",va="center",font=SANS,size=10.5,color=c,weight="bold" if c!=MUTE else "normal")
    ax.text(1.04,r1,f"{tot:,.0f}M  {n}",ha="left",va="center",font=SANS,size=10.5,color=c,weight="bold" if c!=MUTE else "normal")
ax.set_ylim(15.7,0.3); ax.set_xlim(-0.75,1.75); ax.set_yticks([]); ax.set_xticks([])
ax.text(0,0.0,"Rank by native speakers",ha="center",font=SERIF,size=13,weight="bold",color=INK); ax.text(1,0.0,"Rank by all speakers",ha="center",font=SERIF,size=13,weight="bold",color=INK)
f.text(0.05,0.845,"Climbs 2+ places",font=SANS,size=10.5,weight="bold",color=RED); f.text(0.16,0.845,"Falls 2+ places",font=SANS,size=10.5,weight="bold",color=BLUE)
head(f,"Add the learners and the language league table reshuffles","Rank of the 15 most spoken languages by native speakers on the left and by all speakers on the right. English climbs from\nthird to first; Standard Arabic goes from last to sixth; Spanish, Bengali and Portuguese all drop.")
plt.subplots_adjust(left=0.03,right=0.97,top=0.82,bottom=0.04); save("c6c_bump")
# ---------- ch7b: dumbbell survivors ----------
s4 = [("Avatar (2009)",2.924,4.0),("Titanic (1997)",2.223,3.7),("Avengers: Endgame (2019)",2.718,3.3),("Star Wars: The Force Awakens (2015)",2.056,2.6)]
f, ax = fig(14,6.5); y=np.arange(4)[::-1]
for i,(n,a,b_) in enumerate(s4):
    ax.hlines(y[i],a,b_,color=RED,lw=3,alpha=.35); ax.scatter(a,y[i],s=140,color=BG,edgecolor=INK,lw=2,zorder=3); ax.scatter(b_,y[i],s=140,color=RED,zorder=3)
    ax.text(a-0.06,y[i],f"${a:.2f}bn",ha="right",va="center",font=SANS,size=10,color=INK); ax.text(b_+0.06,y[i],f"${b_:.1f}bn  (+{(b_/a-1):.0%})",ha="left",va="center",font=SANS,size=10,weight="bold",color=RED)
    ax.text(1.55,y[i],n,ha="right",va="center",font=SANS,size=11.5,color=INK)
ax.set_xlim(1.5,5.0); ax.set_ylim(-0.6,4.1); ax.set_yticks([]); ax.set_xticks([2,3,4,5]); ax.set_xticklabels(["$2bn","$3bn","$4bn","$5bn"],font=SANS,size=10,color=MUTE); ax.grid(axis="x",color=LINE,lw=.6,zorder=0)
ax.scatter(3.9,3.75,s=110,color=BG,edgecolor=INK,lw=2); ax.text(3.97,3.75,"nominal, May 2025",va="center",font=SANS,size=9.5,color=MUTE); ax.scatter(4.5,3.75,s=110,color=RED); ax.text(4.57,3.75,"2023 dollars",va="center",font=SANS,size=9.5,color=MUTE)
head(f,"What inflation does to the four films on both lists","Worldwide gross as reported, and restated in 2023 dollars, for the four films that appear in both top tens. Titanic gains\nthe most, 66 percent, because it is the oldest.",top=0.93,sub_y=0.86)
plt.subplots_adjust(left=0.28,right=0.96,top=0.76,bottom=0.1); save("c7b_dumbbell")
# ---------- ch7c: US share ----------
us = [("Ne Zha 2 (2025)",1),("Avatar (2009)",27),("Avatar: The Way of Water (2022)",29),("Titanic (1997)",30),("Avengers: Endgame (2019)",32),("Avengers: Infinity War (2018)",33),("Inside Out 2 (2024)",38),("Jurassic World (2015)",39),("Spider-Man: No Way Home (2021)",42),("Star Wars: The Force Awakens (2015)",46)]
f, ax = fig(14,8.5); y=np.arange(len(us))[::-1]
for i,(n,p) in enumerate(us):
    c = RED if p<10 else BLUE
    ax.barh(y[i],p,color=c,height=0.6,zorder=3); ax.barh(y[i],100-p,left=p,color=LINE,height=0.6,zorder=2)
    ax.text(-1.2,y[i],n,ha="right",va="center",font=SANS,size=11,color=INK); ax.text(p+1.2 if p>10 else p+1.2,y[i],f"{p}% US",va="center",font=SANS,size=10,weight="bold",color=c)
ax.axvline(50,color=INK,lw=.7,ls=(0,(3,3)),zorder=4); ax.text(50.8,9.55,"half",font=SANS,size=9,color=MUTE)
ax.set_xlim(0,100); ax.set_ylim(-0.7,len(us)-0.3); ax.set_yticks([]); ax.set_xticks([0,25,50,75,100]); ax.set_xticklabels(["0%","25%","50%","75%","100%"],font=SANS,size=10,color=MUTE)
ax.text(62,1.2,"Ne Zha 2 took $1.97bn,\n$17m of it in the US.",font=SERIF,size=11,style="italic",color=RED,linespacing=1.5)
head(f,"None of the ten biggest films made most of its money in the US","US share of worldwide gross for the ten highest-grossing films as of May 2025. The Force Awakens is the most American\nat 46 percent; the Chinese animation Ne Zha 2 is at 1 percent.")
plt.subplots_adjust(left=0.27,right=0.96,top=0.83,bottom=0.07); save("c7c_usshare")
# ---------- ch5b: timeline ----------
q = [("Valdivia, Chile",1960,9.5,1655),("Alaska",1964,9.2,131),("Sumatra",2004,9.1,283100),("Tohoku, Japan",2011,9.1,15703),("Kamchatka",1952,9.0,12500),("Maule, Chile",2010,8.8,523),("Ecuador",1906,8.8,1000),("Rat Islands, Alaska",1965,8.7,0),("Assam-Tibet",1950,8.6,780),("Sumatra",2012,8.6,10)]
f, ax = fig(14,7)
for n,yr,m,d in q:
    ax.vlines(yr,8.5,m,color=LINE,lw=1,zorder=1); ax.scatter(yr,m,s=90+(np.log10(d+1))**2*22,color=RED if d>=10000 else MUTE,zorder=3,edgecolor=BG,lw=1.5)
    off = {("Sumatra",2004):(-8,12),("Tohoku, Japan",2011):(8,12),("Kamchatka",1952):(-8,8),("Assam-Tibet",1950):(0,-16),("Alaska",1964):(8,8),("Rat Islands, Alaska",1965):(6,-14),("Valdivia, Chile",1960):(0,14),("Maule, Chile",2010):(0,-16),("Sumatra",2012):(8,-6),("Ecuador",1906):(0,14)}[(n,yr)]
    ax.annotate(f"{n} {yr}",(yr,m),xytext=off,textcoords="offset points",ha="center" if off[0]==0 else "left" if off[0]>0 else "right",va="center",font=SANS,size=9.2,color=INK)
ax.axvspan(1950,1965,color=AMBER,alpha=.18,zorder=0); ax.text(1957.5,9.62,"1950 to 1965: six of the ten",ha="center",font=SERIF,size=10.5,style="italic",color=INK)
ax.set_xlim(1898,2020); ax.set_ylim(8.5,9.75); ax.set_yticks([8.6,8.8,9.0,9.2,9.4]); ax.set_yticklabels(["M 8.6","8.8","9.0","9.2","9.4"],font=SANS,size=10,color=MUTE); ax.grid(axis="y",color=LINE,lw=.6,zorder=0)
ax.set_xticks([1900,1920,1940,1960,1980,2000,2020]); ax.set_xticklabels([str(v) for v in [1900,1920,1940,1960,1980,2000,2020]],font=SANS,size=10,color=MUTE)
ax.text(1900,9.45,"Dot size scales with deaths.\nRed: more than 10,000.",font=SANS,size=9.5,color=MUTE,linespacing=1.4,va="top")
head(f,"When the biggest earthquakes happened","The ten largest recorded earthquakes by year and magnitude. Six of them fall in a 15-year window after 1950;\nnothing above 8.6 was recorded between 1965 and 2004.",top=0.93,sub_y=0.86)
plt.subplots_adjust(left=0.06,right=0.97,top=0.78,bottom=0.09); save("c5b_timeline")
# ---------- ch5c: rank by magnitude vs rank by deaths ----------
qs = sorted(q,key=lambda x:-x[2]); mr = {f"{n} {y}":i+1 for i,(n,y,m,d) in enumerate(qs)}
ds = sorted(q,key=lambda x:-x[3]); dr = {f"{n} {y}":i+1 for i,(n,y,m,d) in enumerate(ds)}
f, ax = fig(14,8.5)
for n,y,m,d in q:
    k=f"{n} {y}"; r0,r1=mr[k],dr[k]; c = RED if d>=10000 else MUTE
    ax.plot([0,1],[r0,r1],color=c,lw=2.5 if c==RED else 1.2,alpha=.85); ax.scatter([0,1],[r0,r1],s=80,color=c,zorder=3)
    ax.text(-0.04,r0,f"{k}   M{m}",ha="right",va="center",font=SANS,size=10.5,color=c,weight="bold" if c==RED else "normal")
    ax.text(1.04,r1,("10,000 to 15,000 deaths   "+k) if d==12500 else f"{d:,} deaths   {k}" if d else f"0 deaths   {k}",ha="left",va="center",font=SANS,size=10.5,color=c,weight="bold" if c==RED else "normal")
ax.set_ylim(10.7,0.3); ax.set_xlim(-0.8,1.8); ax.set_yticks([]); ax.set_xticks([])
ax.text(0,0.0,"Rank by magnitude",ha="center",font=SERIF,size=13,weight="bold",color=INK); ax.text(1,0.0,"Rank by death toll",ha="center",font=SERIF,size=13,weight="bold",color=INK)
head(f,"Biggest is not deadliest","The ten largest earthquakes ranked by magnitude on the left and by death toll on the right. The largest ever recorded, Valdivia\nat M9.5, is fourth for deaths; the two M8.6 quakes at the bottom stay at the bottom, one of them with ten deaths.")
plt.subplots_adjust(left=0.03,right=0.97,top=0.82,bottom=0.04); save("c5c_rankslope")
print("done")
