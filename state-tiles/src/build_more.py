import pandas as pd, numpy as np
abbr=pd.read_csv('pres_1856_2024.csv')[['state','st']].drop_duplicates().set_index('state').st.to_dict()
ST=set(abbr.values())

# 1) who signs the paychecks: BEA earnings by place of work
files={'H':('SAINC5H__ALL_AREAS_1929_1957.csv',range(1929,1958)),
       'S':('SAINC5S__ALL_AREAS_1958_2001.csv',range(1958,2001)),
       'N':('SAINC5N__ALL_AREAS_1998_2025.csv',range(2001,2026))}
want={'Earnings by place of work':'total','Total earnings':'total','Federal civilian':'fedciv','Military':'mil','State and local':'sl'}
out=[]
for k,(f,yrs) in files.items():
    d=pd.read_csv('bea/'+f,encoding='latin1',dtype=str)
    d['GeoName']=d.GeoName.str.strip().str.replace(' *','',regex=False); d['Description']=d.Description.str.strip()
    d=d[d.GeoName.isin(abbr)&d.Description.isin(want)]
    d['var']=d.Description.map(want)
    s=d.set_index(['GeoName','var'])[[str(y) for y in yrs]].apply(pd.to_numeric,errors='coerce').stack().rename('v').reset_index()
    s.columns=['state','var','year','v']; out.append(s)
x=pd.concat(out); x['year']=x.year.astype(int)
p=x.pivot_table(index=['state','year'],columns='var',values='v').reset_index(); p['st']=p.state.map(abbr)
p=p.sort_values(['st','year'])
for c in ['fedciv','mil','sl']: p[c]=p.groupby('st')[c].transform(lambda s:s.interpolate(limit_direction='both'))
p['fed_s']=(p.fedciv+p.mil)/p.total; p['sl_s']=p.sl/p.total; p['priv_s']=1-p.fed_s-p.sl_s
print('gov', p[['fed_s','sl_s','priv_s']].isna().sum().to_dict(), p.st.nunique())
print(p[p.st.isin(['DC','VA','HI','NY'])&p.year.isin([1929,1944,1970,2025])][['st','year','priv_s','sl_s','fed_s']].round(3).to_string())
p.to_csv('govpay_1929_2025.csv',index=False)

# 2) taxes
d=pd.read_excel('stc_hist.xlsx',header=None); d.columns=d.iloc[0]; d=d.iloc[2:]
d['st']=d.Name.astype(str).str.split().str[0]
d=d[d.st.isin(ST)]
num=lambda c: pd.to_numeric(d[c].replace('X',0),errors='coerce').fillna(0)
t=pd.DataFrame({'st':d.st,'year':d.Year.astype(int),'total':num('C105'),'sales':num('C107'),'income':num('C129')})
t['other']=(t.total-t.sales-t.income).clip(lower=0)
t=t[t.total>0]
s=t[['sales','income','other']].sum(axis=1)
for c in ['sales','income','other']: t[c+'_s']=t[c]/s
print('tax years', sorted(t.year.unique())[:12], t.st.nunique())
print(t[t.st.isin(['TX','NY','AK','OR'])&t.year.isin([1902,1950,2025])][['st','year','sales_s','income_s','other_s']].round(3).to_string())
t.to_csv('taxes_1902_2025.csv',index=False)

# 3) energy use by sector (SEDS, trillion Btu)
e=pd.read_csv('seds.csv',dtype={'Year':int})
e=e[e.MSN.isin(['TERCB','TECCB','TEICB','TEACB'])&e.StateCode.isin(ST)]
q=e.pivot_table(index=['StateCode','Year'],columns='MSN',values='Data').reset_index()
q.columns.name=None; q=q.rename(columns={'StateCode':'st','Year':'year'})
q['bld']=q.TERCB+q.TECCB; q['ind']=q.TEICB; q['trn']=q.TEACB
s=q[['bld','ind','trn']].sum(axis=1)
for c in ['bld','ind','trn']: q[c+'_s']=q[c]/s
print('seds', q.year.min(), q.year.max(), q.st.nunique())
print(q[q.st.isin(['LA','HI','NY','WY'])&q.year.isin([1960,2023])][['st','year','bld_s','ind_s','trn_s']].round(3).to_string())
q.to_csv('energy_use_1960_2023.csv',index=False)
