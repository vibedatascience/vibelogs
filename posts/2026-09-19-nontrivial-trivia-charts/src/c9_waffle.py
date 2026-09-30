from style import *
f, ax = fig(14,9,dark=True); ax.set_aspect("equal"); ax.set_anchor("W"); ax.set_xticks([]); ax.set_yticks([])
n = 100
xx, yy = np.meshgrid(np.arange(n), np.arange(n))
ax.scatter(xx,yy,s=2.2,color="#CFCAC2",lw=0,zorder=1)
ext = [(i,0) for i in range(10)]
ax.scatter([i for i,_ in ext],[0]*10,s=30,color=RED,lw=0,zorder=3); ax.scatter([50],[0],s=30,color=AMBER,lw=0,zorder=3)
ax.set_xlim(-2,150); ax.set_ylim(-3,101)
ax.text(104,98,"10,000 dots. One dot is a\n0.01% chance this year.",font=SANS,size=11,color=DINK,linespacing=1.5,va="top")
ax.scatter(105,80,s=40,color=AMBER); ax.text(108.5,80,"Dying in a car crash, USA:\nabout 0.01% per year. One dot.",va="center",font=SANS,size=10.5,color=DINK,linespacing=1.4)
ax.scatter([105+i*1.6 for i in range(10)],[67]*10,s=28,color=RED); ax.text(104,63,"Human extinction, per the\n2006 Stern Review: 0.1% per\nyear. Ten dots.",va="top",font=SANS,size=10.5,color=DINK,linespacing=1.4)
ax.text(104,41,"Taken at face value, an American\nis ten times more likely to die\nalongside everyone else than\nalone in a car.",font=SERIF,size=10.5,color=AMBER_TXT,linespacing=1.5,va="top")
ax.text(104,13,"Both numbers are rough. The\nStern figure is a modelling\nassumption, not a measurement.",font=SANS,size=9,color=DMUTE,linespacing=1.4,va="top")
head(f,"The odds that this is the year everything ends","The Global Challenges Foundation pointed out in 2016 that the official risk numbers imply extinction is likelier than a fatal\ncar crash. Here are those two numbers at the same scale.",dark=True,src="Stern Review (2006) via the book")
plt.subplots_adjust(left=0.05,right=0.97,top=0.83,bottom=0.05); save("c9_waffle")
