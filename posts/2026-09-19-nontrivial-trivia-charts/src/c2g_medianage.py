from style import *
import textwrap
old = [("Monaco",55.4),("Japan",48.6),("Germany",47.8),("Italy",46.5),("Andorra",46.2),("Greece",45.3),("San Marino",45.2),("Slovenia",44.9),("Portugal",44.6),("Austria",44.5)]
young = [("Benin",17),("Mozambique",17),("Zambia",16.9),("Malawi",16.8),("DR Congo",16.7),("Chad",16.1),("Mali",16),("Angola",15.9),("Uganda",15.7),("Niger",14.8)]
rows = old + young
OLD, YOUNG = "#B8741A", "#138A77"

f, ax = fig(14,12)
y = np.arange(len(rows))[::-1]
for i,(c,v) in enumerate(rows):
    col = OLD if i < 10 else YOUNG
    ax.hlines(y[i],0,v,color=LINE,lw=2.2,zorder=1)
    ax.hlines(y[i],0,v,color=col,lw=2.2,alpha=.55,zorder=2)
    ax.scatter(v,y[i],s=170,color=col,zorder=3,edgecolor=BG,lw=1.5)
    ax.text(v+1,y[i],f"{v:g}",va="center",ha="left",font=SANS,size=11,weight="bold",color=col)
    ax.text(-0.8,y[i],c,va="center",ha="right",font=SANS,size=11.5,color=INK)
ax.set_xlim(0,62); ax.set_ylim(-0.8,len(rows)-0.2)
ax.set_yticks([]); ax.set_xticks([0,15,30,45,60]); ax.set_xticklabels(["0","15","30","45","60 yrs"],font=SANS,size=10,color=MUTE)
ax.tick_params(length=0); [s.set_visible(False) for s in ax.spines.values()]
for v in [15,30,45,60]: ax.axvline(v,color=LINE,lw=.6,zorder=0)

ax.axhspan(9.5-0.03,9.5+0.03,color=MUTE,alpha=0); ax.hlines(9.5,0,60,color=MUTE,lw=.6,ls=(0,(3,3)))
ax.annotate("",xy=(17.2,9.5),xytext=(44.3,9.5),arrowprops=dict(arrowstyle="<->",color=INK,lw=1.1,shrinkA=0,shrinkB=0))
ax.text(31,9.5,"a 27-year gap between the\n10th oldest and the 10th youngest",ha="center",va="center",font=SERIF,size=10.5,style="italic",color=INK,
        bbox=dict(boxstyle="round,pad=0.45",fc=BG,ec="none"))
ax.text(60.5,y[13],"The oldest: long lives, few births,\nand a lot of yachts",ha="right",va="center",font=SERIF,size=10.5,style="italic",color=OLD)
ax.text(20,y[19],"Half of Niger is younger than 15",ha="left",va="center",font=SERIF,size=10.5,style="italic",color=YOUNG)

f.text(0.05,0.85,"OLDEST",font=SANS,size=11,weight="bold",color=OLD); f.text(0.115,0.85,"YOUNGEST",font=SANS,size=11,weight="bold",color=YOUNG)
head(f,"The oldest and youngest countries on Earth","Median age of the population: the age at which half the country is older than you and half younger. The ten oldest are all in Europe bar Japan; the ten youngest are all in sub-Saharan Africa. Nothing in between makes either list.",credit="Data: CIA World Factbook, via Jonn Elledge, Nontrivial Trivia (2024)")
plt.subplots_adjust(left=0.17,right=0.95,top=0.82,bottom=0.08)
save("c2g_medianage")
