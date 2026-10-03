import pandas as pd, re
from io import StringIO
S=set(pd.read_csv('votes.repub.csv').rownames)
DC={'D. C.','D.C.','DC','District of Columbia','Washington, D.C.'}
def norm(x):
    x=re.sub(r'\[.*?\]','',str(x)).replace('†','').replace('*','').strip()
    if x in DC: return 'District of Columbia'
    return x if x in S else None
num=lambda v: float(m.group()) if (m:=re.match(r'^\s*([\d.]+)',str(v).replace(',',''))) and str(v).strip() not in ('-','–') else 0.0
rows=[]
for y in range(1856,1973,4):
    best=None
    for t in pd.read_html(StringIO(open(f'wiki_{y}.html').read())):
        if not isinstance(t.columns,pd.MultiIndex): continue
        top=[str(c[0]) for c in t.columns]
        if any('Democratic' in c for c in top) and any(('Republican' in c) or ('National Union' in c) for c in top):
            n=t.iloc[:,0].map(norm).notna().sum()
            if best is None or n>best[0]: best=(n,t)
    t=best[1]
    dc=[c for c in t.columns if 'Democratic' in str(c[0]) and c[1]=='%'][0]
    rc=[c for c in t.columns if re.search(r'(?<!Liberal )Republican$|National Union',str(c[0])) and c[1]=='%'][0]
    seen=set()
    for _,r in t.iterrows():
        s=norm(r.iloc[0])
        if s and s not in seen:
            seen.add(s); rows.append(dict(year=y,state=s,D=num(r[dc]),R=num(r[rc])))
w=pd.DataFrame(rows)
m=pd.read_csv('mit.csv')
m['state']=m.state.str.title().str.replace(' Of ',' of ')
g=m.groupby(['year','state']).apply(lambda d: pd.Series(dict(
    D=100*d.loc[d.party_simplified=='DEMOCRAT','candidatevotes'].sum()/d.totalvotes.iloc[0],
    R=100*d.loc[d.party_simplified=='REPUBLICAN','candidatevotes'].sum()/d.totalvotes.iloc[0]))).reset_index()
a=pd.concat([w,g]); a['O']=(100-a.D-a.R).clip(lower=0)
abbr=dict(zip(m.state,m.state_po))
a['st']=a.state.map(abbr)
a=a.sort_values(['st','year'])
a.to_csv('pres_1856_2024.csv',index=False)
print(a.groupby('year').size().to_string())
print(a.st.isna().sum(), a[['D','R','O']].describe().round(1))
