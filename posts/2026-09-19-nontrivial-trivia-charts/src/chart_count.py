import matplotlib.pyplot as plt, numpy as np, textwrap
from matplotlib import font_manager as fm
for f in ["fonts/Fraunces.ttf","fonts/Commissioner.ttf"]: fm.fontManager.addfont(f)
SERIF, SANS = "Fraunces", "Commissioner"
steps = [("UN members",193,"The uncontested list. If it's in the UN,\nit's a sovereign state by definition.","pol"),
 ("UN observers",2,"Holy See (never applied) and Palestine\n(applied in 2011, refused).","pol"),
 ("Recognised by someone",6,"Taiwan, Western Sahara, Kosovo, South Ossetia,\nAbkhazia, Northern Cyprus.","pol"),
 ("Recognised by no one",3,"Artsakh, Transnistria, Somaliland. Run\nthemselves, acknowledged by nobody.","pol"),
 ("Olympic committee",2,"Puerto Rico, Bermuda, Aruba and the Cook\nIslands all march under their own flag.","sport"),
 ("FIFA members",5,"England, Scotland, Wales and Northern\nIreland each get a World Cup team.","sport"),
 ("ISO country codes",38,"Everything with a two-letter web domain,\nincluding Christmas Island and Antarctica.","bur")]
BG, INK, MUTE = "#F4EFE6", "#1F1A17", "#8A7F73"
col = {"pol":"#1F1A17","sport":"#B4342B","bur":"#C9B79C"}

fig, ax = plt.subplots(figsize=(17,10.5), facecolor=BG); ax.set_facecolor(BG)
base = 0; xs = np.arange(len(steps))
for i,(lab,n,why,kind) in enumerate(steps):
    lo = 0 if i==0 else base
    ax.bar(i,n if i else 8,bottom=lo if i else 185,width=0.62,color=col[kind],zorder=3)
    top = (185 if i==0 else base) + (n if i else 8)
    base = 193 if i==0 else base+n
    ax.text(i,base+0.8,str(base),ha="center",va="bottom",font=SERIF,size=15,weight="bold",color=INK,zorder=5)
    ax.text(i,183.4,lab,ha="center",va="top",font=SANS,size=10.5,weight="bold",color=INK)
    ax.text(i,182.0,f"+{n}" if i else "",ha="center",va="top",font=SANS,size=10.5,color=col[kind] if kind!="bur" else MUTE)
    ax.text(i,180.4,"\n".join(textwrap.wrap(why.replace("\n"," "),26)),ha="center",va="top",font=SANS,size=8.8,color=MUTE,linespacing=1.4)
    if i: ax.plot([i-1+0.31,i-0.31],[base-n,base-n],color=MUTE,lw=.8,ls=(0,(3,2)),zorder=2)

ax.axhspan(194,204,color="#B4342B",alpha=.07,zorder=1)
ax.text(6.55,199,"The author's answer:\nsomewhere between\n194 and 204",ha="right",va="center",font=SERIF,size=11,style="italic",color="#B4342B")
ax.axhline(185,color=INK,lw=.9,zorder=4)
ax.set_xlim(-0.6,6.75); ax.set_ylim(170,258)
ax.set_xticks([]); ax.set_yticks([]); [s.set_visible(False) for s in ax.spines.values()]
ax.plot([-0.31,-0.31],[185.4,186.8],color=BG,lw=3,zorder=6); ax.plot([-0.4,-0.2],[185.4,186.8],color=INK,lw=1,zorder=7); ax.plot([-0.4,-0.2],[186.4,187.8],color=INK,lw=1,zorder=7)

for k,t,x in [("pol","Politics",0.0),("sport","Sport",0.11),("bur","Bureaucracy",0.18)]:
    fig.text(0.05+x,0.845,t,font=SANS,size=10.5,weight="bold",color=col[k] if k!="bur" else "#9E8C6E")

fig.text(0.05,0.945,"How many countries are there? Somewhere between 193 and 249",font=SERIF,size=27,weight="bold",color=INK)
fig.text(0.05,0.895,"Every definition adds a few more. The first three steps are about diplomacy; the next two are about who gets a team;\n"
         "the last one is about who gets a dropdown entry. Bars sit on a broken axis starting at 185.",font=SANS,size=12,color=INK,linespacing=1.5)
fig.text(0.05,0.02,"Data: Jonn Elledge, Nontrivial Trivia (2024), correct as of 2025",font=SANS,size=9,color=MUTE)
plt.subplots_adjust(left=0.05,right=0.97,top=0.83,bottom=0.05)
plt.savefig("/mnt/user-data/outputs/how_many_countries.png",dpi=160,facecolor=BG)
