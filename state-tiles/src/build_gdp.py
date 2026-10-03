import pandas as pd, sys
sys.path.insert(0,'..'); from names import ABBR
out=[]
for f,yrs,mine in [('bea/SAGDP2S__ALL_AREAS_1963_1997.csv',range(1963,1997),'Mining'),
                   ('bea/SAGDP2__ALL_AREAS_1997_2025.csv',range(1997,2026),'Mining, quarrying, and oil and gas extraction')]:
    d=pd.read_csv(f,encoding='latin1',dtype=str)
    d['GeoName']=d.GeoName.str.strip().str.replace(' *','',regex=False); d['Description']=d.Description.str.strip()
    d=d[d.GeoName.isin(ABBR)]
    want={'All industry total':'total',mine:'mine','Manufacturing':'mfg'}
    d=d[d.Description.isin(want)]; d['var']=d.Description.map(want)
    cols=[str(y) for y in yrs if str(y) in d.columns]
    s=d.set_index(['GeoName','var'])[cols].apply(pd.to_numeric,errors='coerce').stack().rename('v').reset_index()
    s.columns=['state','var','year','v']; out.append(s)
x=pd.concat(out); x['year']=x.year.astype(int)
p=x.pivot_table(index=['state','year'],columns='var',values='v').reset_index()
p['st']=p.state.map(ABBR)
p=p.sort_values(['st','year'])
for c in ['mine','mfg']: p[c]=p.groupby('st')[c].transform(lambda s: s.interpolate(limit_direction='both'))
p['mine_s']=100*p.mine.clip(lower=0)/p.total; p['mfg_s']=100*p.mfg/p.total; p['rest_s']=100-p.mine_s-p.mfg_s
print(p[['mine_s','mfg_s']].isna().sum().to_dict(), p.st.nunique(), p.year.min(), p.year.max())
print(p[p.st.isin(['WY','AK','ND','IN','NY'])&p.year.isin([1963,1981,1999,2014,2016,2025])].pivot(index='year',columns='st',values='mine_s').round(1))
p.to_csv('../gdp.csv',index=False)
