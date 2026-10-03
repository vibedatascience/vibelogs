import pandas as pd, numpy as np, re, sys
sys.path.insert(0,'..'); from names import ABBR
rows=[]
yrs=[2000,1990,1980,1970,1960,1950,1940,1930,1920,1910,1900]
for l in open('owner-tab.txt').read().splitlines():
    if '\t' not in l: continue
    name=l.split('\t')[0].strip()
    name={'Dist. of Columbia':'District of Columbia'}.get(name,name)
    if name not in ABBR: continue
    toks=re.findall(r'\d+\.\d%|NA',l)
    if len(toks)!=11: print('skip',name,toks); continue
    for y,t in zip(yrs,toks):
        if t!='NA': rows.append(dict(st=ABBR[name],year=y,own=float(t[:-1]),src='decennial census'))
d=pd.read_excel('hvs_state.xlsx',header=None); year=None; acc={}; blk=-1
# blocks run newest first: 2026, 2025, ... 2005
for _,r in d.iterrows():
    if str(r[0]).strip()=='State': blk+=1; year=2026-blk; continue
    nm=re.sub(r'\.+$','',str(r[0])).strip()
    if year and nm in ABBR:
        q=[float(r[i]) for i in (1,3,5,7) if isinstance(r[i],(int,float)) and not pd.isna(r[i])]
        if len(q)==4: acc[(ABBR[nm],year)]=np.mean(q)
for (st,y),v in acc.items():
    if 2005<=y<=2025: rows.append(dict(st=st,year=y,own=round(v,1),src='CPS/HVS annual average'))
h=pd.DataFrame(rows).sort_values(['st','year']); h['rent']=(100-h.own).round(1); h['mid']=0.0
h.to_csv('../homeown.csv',index=False)
print(h.groupby('src').year.agg(['min','max','nunique']), h.st.nunique())
print(h[h.st.isin(['NY','DC','WV','ID','CA'])&h.year.isin([1900,1940,1960,2000,2005,2025])].pivot(index='st',columns='year',values='own'))
