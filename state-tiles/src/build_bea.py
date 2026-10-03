import pandas as pd, numpy as np
files={'H':('SAINC5H__ALL_AREAS_1929_1957.csv',range(1929,1958)),
       'S':('SAINC5S__ALL_AREAS_1958_2001.csv',range(1958,2001)),
       'N':('SAINC5N__ALL_AREAS_1998_2025.csv',range(2001,2026))}
abbr=pd.read_csv('pres_1856_2024.csv')[['state','st']].drop_duplicates().set_index('state').st.to_dict()
out=[]
for k,(f,yrs) in files.items():
    d=pd.read_csv('bea/'+f,encoding='latin1',dtype=str)
    d['GeoName']=d.GeoName.str.strip().str.replace(' *','',regex=False)
    d['Description']=d.Description.str.strip()
    d=d[d.GeoName.isin(abbr)]
    tot=d[d.LineCode.str.strip()=='35']; farm=d[d.LineCode.str.strip()=='81']
    man=d[d.Description=='Manufacturing']
    print(k,'manufacturing linecodes',man.LineCode.unique())
    for nm,sub in [('total',tot),('farm',farm),('mfg',man)]:
        s=sub.set_index('GeoName')[[str(y) for y in yrs]]
        s=s.apply(pd.to_numeric,errors='coerce')
        s=s.stack().rename('v').reset_index(); s.columns=['state','year','v']; s['var']=nm
        out.append(s)
x=pd.concat(out); x['year']=x.year.astype(int)
p=x.pivot_table(index=['state','year'],columns='var',values='v').reset_index()
p['st']=p.state.map(abbr)
p['farm_s']=p.farm.clip(lower=0)/p.total; p['mfg_s']=p.mfg/p.total
p['rest_s']=1-p.farm_s-p.mfg_s
print(p.isna().sum().to_dict()); print(len(p), p.st.nunique())
p.to_csv('earnings_1929_2025.csv',index=False)
print(p[p.st.isin(['IA','MI','NY'])&p.year.isin([1929,1950,1980,2025])][['st','year','farm_s','mfg_s','rest_s']].round(3).to_string())
