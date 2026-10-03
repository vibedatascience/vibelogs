import pandas as pd, numpy as np, re, sys
sys.path.insert(0,'..'); from names import ABBR, NAMES
FIPS={}
rows=[]
num=lambda s: float(str(s).replace(',','')) if str(s).strip() not in ('','nan') else 0.0
# 1970-1979: 5-year groups; under 18 = 0-14 + 3/5 of 15-19
p=pd.read_csv('pe-19.csv',skiprows=5,dtype=str); p.columns=[c.strip() for c in p.columns]
agec=p.columns[4:]
p=p[p['State Name'].isin(ABBR)]
for c in agec: p[c]=p[c].map(num)
g=p.groupby(['Year of Estimate','State Name'])[list(agec)].sum()
for (y,s),r in g.iterrows():
    FIPS[str(p[p['State Name']==s]['FIPS State Code'].iloc[0]).zfill(2)]=ABBR[s]
    v=r.values; kid=v[0]+v[1]+v[2]+0.6*v[3]; old=v[13:].sum(); tot=v.sum()
    rows.append(dict(st=ABBR[s],year=int(y),kids=kid,adults=tot-kid-old,old=old))
# 1981-1989: st_int_asrh.txt, code SS Y RS then 18 five-year groups
acc={}
for l in open('st_int_asrh.txt'):
    t=l.split(); code=t[0]; v=np.array([float(x) for x in t[1:19]])
    k=(code[:2],1980+int(code[2])); acc[k]=acc.get(k,0)+v
for (f,y),v in acc.items():
    if f not in FIPS: continue
    kid=v[0]+v[1]+v[2]+0.6*v[3]; old=v[13:].sum(); tot=v.sum()
    rows.append(dict(st=FIPS[f],year=y,kids=kid,adults=tot-kid-old,old=old))
# 1990-1999: st-99-09 blocks, July 1 columns (first 10 numbers, 1999 first)
L=open('st-99-09.txt').read().splitlines()
for i,l in enumerate(L):
    s=l.strip()
    if s in ABBR and i+1<len(L) and L[i+1].startswith('Total'):
        blk={}
        for j in range(i+1,i+12):
            m=re.match(r'\s*(Total|Under 5 years|5 to 17 years|65 years and over)\s+([\d\s]+)$',L[j])
            if m: blk[m.group(1)]=[float(x) for x in m.group(2).split()][:10]
        for k,y in enumerate(range(1999,1989,-1)):
            kid=blk['Under 5 years'][k]+blk['5 to 17 years'][k]; old=blk['65 years and over'][k]; tot=blk['Total'][k]
            rows.append(dict(st=ABBR[s],year=y,kids=kid,adults=tot-kid-old,old=old))
# 2000-2009 and 2010-2024: single-year files
def single(f,cols,ys):
    d=pd.read_csv(f,dtype={'STATE':str}); d=d[(d.SEX==0)&(d.NAME.isin(ABBR))]
    for c,y in zip(cols,ys):
        a=d[d.AGE<999].groupby('NAME').apply(lambda g: pd.Series(dict(kids=g.loc[g.AGE<18,c].sum(),old=g.loc[g.AGE>=65,c].sum(),tot=g[c].sum())))
        for s,r in a.iterrows(): rows.append(dict(st=ABBR[s],year=y,kids=r.kids,adults=r.tot-r.kids-r.old,old=r.old))
single('st00.csv',[f'POPESTIMATE{y}' for y in range(2000,2010)],range(2000,2010))
single('sc20.csv',[f'POPEST{y}_CIV' for y in range(2010,2020)],range(2010,2020))
single('sc24.csv',[f'POPEST{y}_CIV' for y in range(2020,2025)],range(2020,2025))
a=pd.DataFrame(rows).groupby(['st','year']).first().reset_index()
t=a[['kids','adults','old']].sum(axis=1)
for c in ['kids','adults','old']: a[c+'_pct']=(100*a[c]/t).round(2)
a.to_csv('../age.csv',index=False)
print(a.groupby('st').size().describe()[['min','max']].to_dict(), sorted(a.year.unique())[:3], sorted(a.year.unique())[-2:])
print(a[a.st.isin(['FL','UT','ME','AK'])&a.year.isin([1970,1979,1981,1989,1990,1999,2000,2009,2010,2024])].pivot(index='year',columns='st',values='old_pct'))
