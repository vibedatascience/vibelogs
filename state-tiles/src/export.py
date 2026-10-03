import pandas as pd, numpy as np, json, os
OUT='/home/claude/vibelogs/state-tiles'
os.makedirs(OUT+'/data',exist_ok=True)
names=pd.read_csv('pres_1856_2024.csv')[['st','state']].drop_duplicates().set_index('st').state.to_dict()
names['DC']='District of Columbia'
D=[
 ('president','pres_1856_2024.csv',('D','O','R'),'year',100,['Democrat','third parties','Republican']),
 ('electricity','elec_1990_2024.csv',('coal','gas','clean'),'year',1,['coal','natural gas & oil','nuclear, hydro, wind, solar']),
 ('energy-use','energy_use_1960_2023.csv',('bld_s','ind_s','trn_s'),'year',1,['homes & businesses','industry','transportation']),
 ('taxes','taxes_1902_2025.csv',('sales_s','income_s','other_s'),'year',1,['sales taxes','income taxes','property, severance, licenses & other']),
 ('earnings','earnings_1929_2025.csv',('rest_s','mfg_s','farm_s'),'year',1,['everything else','manufacturing','farming']),
 ('paychecks','govpay_1929_2025.csv',('priv_s','sl_s','fed_s'),'year',1,['private sector','state & local government','federal government']),
 ('income','income_1929_2025.csv',('work_s','capital_s','transfers_s'),'year',1,['work','dividends, interest & rent','government benefits']),
]
allj={}
for slug,f,cols,yc,scale,labels in D:
    d=pd.read_csv(f)
    d=d[d.st.isin(names)]
    x=d[['st',yc]+list(cols)].copy()
    v=x[list(cols)].clip(lower=0).astype(float)
    v=v.div(v.sum(axis=1),axis=0)*100
    x[list(cols)]=v.round(2)
    x=x.dropna().sort_values(['st',yc])
    csv=x.rename(columns=dict(zip(cols,[l.replace(',','') .replace(' ','_').replace('&','and') + '_pct' for l in labels])))
    csv.insert(1,'state',csv.st.map(names))
    csv.to_csv(f'{OUT}/data/{slug}.csv',index=False)
    years=sorted(x[yc].unique().tolist())
    S={}
    for st,g in x.groupby('st'):
        g=g.set_index(yc).reindex(years)
        S[st]=[[None if np.isnan(a) else round(a,1), None if np.isnan(b) else round(b,1)] for a,b in zip(g[cols[0]],g[cols[1]])]
    allj[slug]=dict(years=[int(y) for y in years],labels=labels,s=S)
    print(slug,len(x),years[0],years[-1])
for slug,d in allj.items():
    d['names']=names
    json.dump(d,open(f'{OUT}/data/{slug}.json','w'),separators=(',',':'))
