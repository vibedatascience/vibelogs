from style import *
C = [("Washington",31,"George Washington, 1st president","P"),("Jefferson",26,"Thomas Jefferson, 3rd president","P"),("Franklin",25,"Benjamin Franklin, founding father","F"),("Jackson",24,"Andrew Jackson, 7th president","P"),
     ("Lincoln",24,"Abraham Lincoln, 16th president","P"),("Madison",20,"James Madison, 4th president","P"),("Clay",18,"Henry Clay, senator and Speaker","S"),("Montgomery",18,"Richard Montgomery, revolutionary general","G"),
     ("Union",18,"the Union, or unions of older counties","A"),("Marion",17,"Francis Marion, revolutionary general","G"),("Monroe",17,"James Monroe, 5th president","P")]
col = {"P":RED,"F":BLUE,"S":TEAL,"G":ORANGE,"A":MUTE}
f, ax = fig(14,9.5); y = np.arange(len(C))[::-1]
for i,(n,k,who,t) in enumerate(C):
    ax.barh(y[i],k,color=col[t],height=0.64,zorder=3)
    ax.text(-0.5,y[i],f"{n} County",ha="right",va="center",font=SANS,size=11.5,weight="bold",color=INK)
    ax.text(k+0.5,y[i],f"{k}",va="center",font=SERIF,size=13,weight="bold",color=col[t]); ax.text(k+2.6,y[i],who,va="center",font=SANS,size=9.5,color=MUTE)
ax.set_xlim(0,52); ax.set_ylim(-0.7,len(C)-0.3); ax.set_yticks([]); ax.set_xticks([0,10,20,30]); ax.set_xticklabels(["0","10","20","30 counties"],font=SANS,size=10,color=MUTE)
ax.text(33,2.3,"3,142 counties in the United States.\n130 of them, about 4 percent, are named\nfor five men. 31 of the 50 states have a\nWashington County; a 32nd is Washington.",font=SERIF,size=11,style="italic",color=INK,linespacing=1.55)
for i,(k,nm) in enumerate([("P","President"),("F","Founding father"),("G","General"),("S","Senator"),("A","Abstract")]): f.text(0.05+i*0.11,0.845,nm,font=SANS,size=10.5,weight="bold",color=col[k])
head(f,"The eleven most common US county names","Number of counties carrying each name, and who it is for. Six of the eleven are presidents; Union is the only one\nnot named after a person.")
plt.subplots_adjust(left=0.17,right=0.97,top=0.83,bottom=0.07); save("c2d_counties")
