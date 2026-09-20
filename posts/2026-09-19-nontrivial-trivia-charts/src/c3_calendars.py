from style import *
cal = [("Byzantine",7534,"from creation, 5509 BCE"),("Freemasonry",6026,"from creation, 4004 BCE"),("Hebrew",5786,"from creation, 3761 BCE"),("Traditional Korean",4359,"from Dangun, 2333 BCE"),
       ("Buddhist",2569,"from the Buddha's death, 544 BCE"),("Gregorian",2026,"from the birth of Christ, probably wrong by 4 to 6 years"),("Islamic lunar",1447,"from the Hegira, 622 CE, in 354-day years"),
       ("Islamic solar",1405,"from the Hegira, 622 CE, in solar years"),("French Republican",234,"from the First Republic, 1792"),("North Korean Juche",115,"from Kim Il-Sung's birth, 1912")]
f, ax = fig(14,9.5)
y = np.arange(len(cal))[::-1]
for i,(n,v,why) in enumerate(cal):
    c = RED if n=="Gregorian" else MUTE if v<2026 else INK
    ax.hlines(y[i],0,v,color=c,lw=2 if n=="Gregorian" else 1.2,alpha=.7,zorder=2); ax.scatter(v,y[i],s=120,color=c,zorder=3)
    ax.text(v+90,y[i],f"{v:,}",va="center",font=SERIF,size=13,weight="bold",color=c)
    ax.text(-90,y[i]+0.18,n,ha="right",va="center",font=SANS,size=11.5,weight="bold",color=c); ax.text(-90,y[i]-0.22,why,ha="right",va="center",font=SANS,size=8.6,color=MUTE)
ax.axvline(2026,color=RED,lw=.7,ls=(0,(3,3)),zorder=1)
ax.set_xlim(0,8300); ax.set_ylim(-0.7,len(cal)-0.3); ax.set_yticks([]); ax.set_xticks([0,2000,4000,6000,8000]); ax.set_xticklabels(["year 0","2,000","4,000","6,000","8,000"],font=SANS,size=10,color=MUTE)
ax.text(2100,9.4,"where the Gregorian calendar puts us",font=SANS,size=9,style="italic",color=RED)
ax.text(5400,2.2,"Every calendar picks a moment and counts from it.\nThree start at the creation of the world and\nstill disagree by 1,748 years. Holocene, not\nshown, starts at 10000 BCE: it is 12026 HE.",font=SERIF,size=10.5,style="italic",color=INK,linespacing=1.5)
head(f,"What year is it? Depends who you ask","The current year in ten calendars, as of June 2026, with the epoch each one counts from. Anything to the left of the red line\nstarted counting after Christ; anything to the right started counting before.")
plt.subplots_adjust(left=0.30,right=0.96,top=0.83,bottom=0.08); save("c3_calendars")
