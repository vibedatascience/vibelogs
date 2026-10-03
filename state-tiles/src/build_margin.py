import pandas as pd, numpy as np, re
from io import StringIO
abbr=pd.read_csv('pres_1856_2024.csv')[['state','st']].drop_duplicates().set_index('state').st.to_dict()
abbr['District of Columbia']='DC'
DC={'D. C.','D.C.','DC','District of Columbia','Washington, D.C.'}
def norm(x):
    x=re.sub(r'\[.*?\]','',str(x)).replace('†','').replace('*','').strip()
    if x in DC: return 'District of Columbia'
    return x if x in abbr else None
def party(lab):
    l=lab.strip()
    if 'National Union' in l or re.search(r'(?<!Liberal )Republican$',l): return 'R'
    bad=['(Southern)','Social Democratic','Unpledged','National Democrat','Straight-Out','Southern Democrat','Dixiecrat']
    if 'Democratic' in l and not any(b in l for b in bad): return 'D'
    return 'O'
def num(v):
    s=str(v).replace(',','').replace('%','').strip()
    m=re.match(r'^([\d.]+)$',s)
    return float(m.group(1)) if m else 0.0
rows=[]
for y in range(1856,1973,4):
    best=None
    for t in pd.read_html(StringIO(open(f'wiki_{y}.html').read())):
        if not isinstance(t.columns,pd.MultiIndex): continue
        top=[str(c[0]) for c in t.columns]
        if any('Democratic' in c for c in top):
            n=t.iloc[:,0].map(norm).notna().sum()
            if best is None or n>best[0]: best=(n,t)
    t=best[1]
    cands=[c for c in t.columns if c[1]=='%' and not str(c[0]).startswith(('Margin','State Total','Unnamed'))]
    seen=set()
    for _,r in t.iterrows():
        s=norm(r.iloc[0])
        if not s or s in seen: continue
        seen.add(s)
        vals=sorted([(num(r[c]),party(str(c[0])),str(c[0])) for c in cands],reverse=True)
        if vals[0][0]==0: continue
        rows.append(dict(year=y,st=abbr[s],win=vals[0][1],winner=vals[0][2],w=vals[0][0],r=vals[1][0],second=vals[1][2],rp=vals[1][1]))
m=pd.read_csv('mit.csv'); m=m[m.candidate.notna()]
m['state']=m.state.str.title().str.replace(' Of ',' of ')
for (y,s),d in m.groupby(['year','state']):
    tot=d.totalvotes.iloc[0]
    c=d.groupby('candidate').apply(lambda g: pd.Series(dict(v=g.candidatevotes.sum(),p=g.loc[g.candidatevotes.idxmax(),'party_simplified']))).sort_values('v',ascending=False)
    p=lambda x: {'DEMOCRAT':'D','REPUBLICAN':'R'}.get(x,'O')
    rows.append(dict(year=y,st=abbr[s],win=p(c.p.iloc[0]),winner=c.index[0],w=100*c.v.iloc[0]/tot,r=100*c.v.iloc[1]/tot,second=c.index[1],rp=p(c.p.iloc[1])))
x=pd.DataFrame(rows); x['margin']=(x.w-x.r).round(2)
x.to_csv('pres_margin.csv',index=False)
print(x.win.value_counts().to_dict())
print(x[x.win=='O'].groupby('year').st.apply(lambda s: ' '.join(sorted(s))).to_string())
chk=[('CA',1912),('PA',2024),('GA',2020),('NY',2020),('MS',1936),('VA',1860),('WI',1924),('ME',1992)]
print(x.set_index(['st','year']).loc[chk,['win','winner','margin']].to_string())
