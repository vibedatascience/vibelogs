import pandas as pd, re, sys
sys.path.insert(0,'..'); from names import ABBR
rows=[]; years=None
for l in open('urpop0090.txt'):
    h=re.findall(r'\b(1[89]\d0)\b',l)
    if len(h)>=2 and '%' not in l and 'Table' not in l: years=list(dict.fromkeys(h)); continue
    m=re.match(r'^\s{4,}([A-Z][A-Za-z\. ]+?)\s{2,}[\d,]',l)
    if not m or not years: continue
    name=m.group(1).strip(); name={'Dist. of Columbia':'District of Columbia','District of Columbia':'District of Columbia'}.get(name,name)
    if name not in ABBR: continue
    pct=re.findall(r'(\d+\.\d)%\s+(\d+\.\d)%',l)
    for y,(u,r) in zip(years,pct): rows.append(dict(st=ABBR[name],year=int(y),urban=float(u),rural=float(r)))
x=pd.read_excel('State_Urban_Rural_Pop_2020_2010.xlsx.dl',dtype={'STATEFP':str})
x.columns=[str(c).replace('\n','').replace('  ',' ').strip() for c in x.columns]
for _,r in x.iterrows():
    if r['STATE NAME'] in ABBR:
        for y in (2010,2020):
            u=float(r[f'{y} PCT URBAN POP']); rows.append(dict(st=ABBR[r['STATE NAME']],year=y,urban=round(u,1),rural=round(100-u,1)))
u=pd.DataFrame(rows).drop_duplicates(['st','year']).sort_values(['st','year']); u['mid']=0.0
u.to_csv('../urban.csv',index=False)
print(u.groupby('year').size().to_dict(), u.st.nunique())
print(u[u.st.isin(['VT','WV','CA','NJ','DC','ME'])].pivot(index='st',columns='year',values='urban'))
