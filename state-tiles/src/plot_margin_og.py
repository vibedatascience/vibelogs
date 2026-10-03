import pandas as pd, numpy as np, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import matplotlib.patheffects as pe
HALO=[pe.withStroke(linewidth=3.5,foreground='white')]
x=pd.read_csv('pres_margin.csv')
DEM,OTH,REP='#0783c8','#7bccf9','#fe5e32'; C={'D':DEM,'O':OTH,'R':REP}
BG,NODATA,TILE='#f8f8f8','#efefef','#ffffff'
LABEL,TITLE,AXT,SRC='#0d3a60','#111111','#555555','#666666'
SERIF,COND='TeX Gyre Schola','TeX Gyre Heros Cn'
Y0,Y1,CAP=1900,2024,60
YEARS=np.arange(Y0,Y1+1,4); NY=len(YEARS)
G={"ME":(10,0),"WA":(0,1),"ID":(1,1),"MT":(2,1),"ND":(3,1),"MN":(4,1),"IL":(5,1),"WI":(6,1),"MI":(7,1),"NY":(8,1),"VT":(9,1),"NH":(10,1),
"OR":(0,2),"NV":(1,2),"WY":(2,2),"SD":(3,2),"IA":(4,2),"IN":(5,2),"OH":(6,2),"PA":(7,2),"NJ":(8,2),"RI":(9,2),"MA":(10,2),
"CA":(0,3),"UT":(1,3),"CO":(2,3),"NE":(3,3),"MO":(4,3),"KY":(5,3),"WV":(6,3),"VA":(7,3),"MD":(8,3),"CT":(9,3),
"AZ":(1,4),"NM":(2,4),"KS":(3,4),"AR":(4,4),"TN":(5,4),"NC":(6,4),"SC":(7,4),"DC":(8,4),"DE":(9,4),
"OK":(3,5),"LA":(4,5),"MS":(5,5),"AL":(6,5),"GA":(7,5),"HI":(0,6),"TX":(3,6),"FL":(8,6)}
def tile(ax,st,x0,y0,w,h,label=True,fs=17):
    d=x[x.st==st].set_index('year').reindex(YEARS)
    ax.add_patch(Rectangle((x0,y0),w,h,fc=NODATA,lw=0,zorder=1))
    X=lambda yr: x0+(yr-Y0)/(Y1-Y0)*w
    mid=y0+h/2; half=h/2
    ok=d.margin.notna().values
    if ok.any():
        first=YEARS[ok.argmax()]
        ax.add_patch(Rectangle((X(first),y0),x0+w-X(first),h,fc=TILE,lw=0,zorder=2))
        sgn=d.win.map({'R':1,'D':-1,'O':0}).values.astype(float)
        m=np.clip(d.margin.values,0,CAP)*sgn
        # densify so the fill switches color exactly where the line crosses zero
        xs=np.linspace(YEARS[0],YEARS[-1],1600); ys=np.interp(xs,YEARS[ok],m[ok])
        valid=np.interp(xs,YEARS,ok.astype(float))>0.999
        px=X(xs); py=mid+ys/CAP*half
        ax.fill_between(px,mid,py,where=valid&(ys>=0),interpolate=True,color=REP,lw=0,zorder=3)
        ax.fill_between(px,mid,py,where=valid&(ys<=0),interpolate=True,color=DEM,lw=0,zorder=3)
        # third-party wins: a light-blue band on the zero line, as tall as the lead
        step=(X(YEARS[1])-X(YEARS[0]))
        for yr,r in d[d.win=='O'].iterrows():
            hh=min(r.margin,CAP)/CAP*half
            hh=max(hh,h*0.02)
            ax.add_patch(Rectangle((X(yr)-step*0.45,mid-hh/2),step*0.9,hh,fc=OTH,ec=OTH,lw=0,zorder=4))
        ax.plot([X(first),x0+w],[mid,mid],color='#111111',lw=0.6,alpha=.55,zorder=5)
    if label:
        ax.text(x0+w*0.95,y0+h*0.06,st,ha='right',va='bottom',fontsize=fs,family=COND,color=LABEL,zorder=6,path_effects=HALO)
fig=plt.figure(figsize=(16,12.7),facecolor=BG,dpi=200); ax=fig.add_axes([0,0,1,1])
ax.set_xlim(0,16); ax.set_ylim(0,12.7); ax.axis('off')
sx,sy,gut=1.292,1.305,0.072; gx0,gtop=1.14,10.49
for st,(c,r) in G.items():
    tile(ax,st,gx0+c*sx,gtop-r*sy-(sy-gut),sx-gut,sy-gut)
ax.text(4.55,11.62,'Who won each state,',ha='center',va='center',fontsize=40,family=SERIF,fontweight='bold',color=TITLE)
ax.text(4.55,10.84,'and by how much?',ha='center',va='center',fontsize=40,family=SERIF,fontweight='bold',color=TITLE)
lx0,lx1,ly0,ly1=9.07,11.10,10.21,12.27
tile(ax,'AK',lx0,ly0,lx1-lx0,ly1-ly0,label=False)
ax.text(lx1-0.06,ly0+0.06,'AK',ha='right',va='bottom',fontsize=15,family=COND,color=LABEL,alpha=.88,zorder=6)
for v,lab in [(60,'R +60'),(30,'R +30'),(0,'0'),(-30,'D +30'),(-60,'D +60')]:
    ax.text(lx0-0.05,ly0+(v+CAP)/(2*CAP)*(ly1-ly0),lab,ha='right',va='center',fontsize=9,family=COND,color=AXT)
ax.text(lx0,ly0-0.06,'1900',ha='center',va='top',fontsize=10,family=COND,color=AXT)
ax.text(lx1,ly0-0.06,'2024',ha='center',va='top',fontsize=10,family=COND,color=AXT)
ax.text((lx0+lx0+(1960-Y0)/(Y1-Y0)*(lx1-lx0))/2,(ly0+ly1)/2,'no data',ha='center',va='center',rotation=90,fontsize=15,family=COND,color='#9a9a9a',zorder=6)
tx=lx1+0.12
ax.text(tx,12.15,'winner\'s lead over the runner-up',fontsize=12,family=COND,color=AXT,va='center')
ax.text(tx,11.85,'line at 0 = tie',fontsize=12,family=COND,color=AXT,va='center')
ax.text(tx,11.35,'Republican won',fontsize=15,family=COND,fontweight='bold',color=REP,va='center')
ax.text(tx,11.0,'third party won (on the 0 line)',fontsize=15,family=COND,fontweight='bold',color=OTH,va='center')
ax.text(tx,10.65,'Democrat won',fontsize=15,family=COND,fontweight='bold',color=DEM,va='center')
ax.text(0.30,0.48,'RAHUL',fontsize=17,family=COND,fontweight='bold',color=AXT,va='center')
ax.text(1.18,0.48,'CH',fontsize=17,family=COND,color=AXT,va='center')
ax.text(15.75,0.60,'source: Wikipedia state-by-state results tables, 1900-1972; MIT Election Data and Science Lab, U.S. President 1976-2024 (doi:10.7910/DVN/42MVDX).',ha='right',va='center',fontsize=7.5,family=COND,color=SRC)
ax.text(15.75,0.40,'Margin = leading candidate\'s share of the popular vote minus the runner-up\'s. Leads over 60 points reach the tile edge. Third-party wins are drawn as a band on the zero line.',ha='right',va='center',fontsize=7.5,family=COND,color=SRC)
fig.savefig('/home/claude/charts/state_president_margin_area.png',dpi=200,facecolor=BG); print('ok')
