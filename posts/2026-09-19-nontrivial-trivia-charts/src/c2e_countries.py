from style import *
import textwrap
steps = [("UN members",193,"The uncontested list. If it's in the UN,\nit's a sovereign state by definition.","pol"),
 ("UN observers",2,"Holy See (never applied) and Palestine\n(applied in 2011, refused).","pol"),
 ("Recognised by someone",6,"Taiwan, Western Sahara, Kosovo, South Ossetia,\nAbkhazia, Northern Cyprus.","pol"),
 ("Recognised by no one",3,"Artsakh, Transnistria, Somaliland. Run\nthemselves, acknowledged by nobody.","pol"),
 ("Olympic committee",2,"Puerto Rico, Bermuda, Aruba and the Cook\nIslands all march under their own flag.","sport"),
 ("FIFA members",5,"England, Scotland, Wales and Northern\nIreland each get a World Cup team.","sport"),
 ("ISO country codes",38,"Everything with a two-letter web domain,\nincluding Christmas Island and Antarctica.","bur")]
col = {"pol":"#1F1A17","sport":"#B4342B","bur":"#C9B79C"}

col = {"pol":"#1F1A17","sport":"#B4342B","bur":"#B59E78"}
f, ax = fig(14,12)
y = np.arange(len(steps))[::-1]; base = 0
for i,(lab,n,why,kind) in enumerate(steps):
    lo = 185 if i==0 else base; hi = 193 if i==0 else base+n
    ax.barh(y[i],hi-lo,left=lo,height=0.5,color=col[kind],zorder=3)
    ax.annotate(str(hi),(hi,y[i]),xytext=(5,0),textcoords="offset points",va="center",font=SERIF,size=14,weight="bold",color=INK,zorder=5)
    ax.annotate("" if i==0 else f"+{n}",(hi,y[i]),xytext=(42,0),textcoords="offset points",va="center",font=SANS,size=10.5,weight="bold",color=col[kind] if kind!="bur" else "#8C7650")
    ax.text(183.8,y[i]+0.12,lab,ha="right",va="bottom",font=SANS,size=11,weight="bold",color=INK)
    ax.text(183.8,y[i]+0.08,"\n".join(textwrap.wrap(why.replace("\n"," "),42)),ha="right",va="top",font=SANS,size=8.8,color=MUTE,linespacing=1.35,wrap=False)
    if i: ax.plot([base,base],[y[i]+0.25,y[i-1]-0.25],color=MUTE,lw=.8,ls=(0,(3,2)),zorder=2)
    base = hi
ax.axvspan(194,204,color="#B4342B",alpha=.08,zorder=1)
ax.text(199,6.62,"The author's answer:\n194 to 204",ha="center",va="bottom",font=SERIF,size=10,color="#B4342B",linespacing=1.3)
ax.axvline(185,color=INK,lw=.9,zorder=4)
ax.set_xlim(185,262); ax.set_ylim(-0.6,7.3)
ax.set_xticks([185,200,215,230,245]); ax.set_xticklabels(["185","200","215","230","245 countries"],font=SANS,size=9.5,color=MUTE)
ax.set_yticks([]); ax.grid(axis="x",color=LINE,lw=.6,zorder=0)
for k,t in [("pol","Politics"),("sport","Sport"),("bur","Bureaucracy")]:
    f.text(0.05,0.85,t,font=SANS,size=10.5,weight="bold",color=col[k] if k!="bur" else "#8C7650")
head(f,"How many countries are there? Somewhere between 193 and 249","Every definition adds a few more. The first three steps are about diplomacy; the next two are about who gets a team; the last one is about who gets a dropdown entry. Bars sit on a broken axis starting at 185.",credit="Data: Jonn Elledge, Nontrivial Trivia (2024), correct as of 2025")
plt.subplots_adjust(left=0.47,right=0.97,top=0.83,bottom=0.07)
save("c2e_countries")
