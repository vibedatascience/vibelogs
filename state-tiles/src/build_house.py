import pandas as pd, sys
sys.path.insert(0,'..'); from names import NAMES
d=pd.read_csv('HSall_members.csv')
h=d[(d.chamber=='House')&(d.congress>=57)&d.state_abbrev.isin(NAMES)&(d.state_abbrev!='DC')].copy()
known=h[h.occupancy.notna()]; known=known[known.occupancy<=1]
unk=h[h.occupancy.isna()].drop_duplicates(['congress','state_abbrev','district_code'],keep='first')
s=pd.concat([known,unk])
s['p']=s.party_code.map({100:'D',200:'R'}).fillna('O')
c=s.groupby(['state_abbrev','congress','p']).size().unstack(fill_value=0).reset_index()
c.columns.name=None; c=c.rename(columns={'state_abbrev':'st'})
for k in 'DOR':
    if k not in c: c[k]=0
c['year']=2*c.congress+1786; c['seats']=c.D+c.O+c.R
c.to_csv('../house.csv',index=False)
print(c.groupby('year').seats.sum().loc[[1900,1912,1932,1964,1994,2024]].to_dict())
q=c.set_index(['st','year'])
for k in [('GA',1900),('GA',2024),('TX',1960),('TX',2024),('CA',2024),('NY',2024),('MN',1934),('WI',1934),('VT',1990)]:
    print(k, q.loc[k,['D','O','R']].to_dict() if k in q.index else '-')
