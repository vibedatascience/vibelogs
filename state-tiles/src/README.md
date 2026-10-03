# State tiles: code

Python scripts behind rahulch.site/state-tiles. Run them in this order from a folder holding the raw downloads.

1. `build.py` parses Wikipedia state results tables (1856-1972) and the MIT Election Lab file (1976-2024) into `pres_1856_2024.csv`.
2. `build_bea.py` builds farm and manufacturing earnings shares from BEA SAINC5H/5S/5N.
3. `build_more.py` builds government paychecks (BEA SAINC5), state tax mix (Census STC) and energy use by sector (EIA SEDS).
4. `plot_og.py` draws the presidential vote poster. `plot_og_generic.py <name>` draws the others (`elec`, `energy`, `tax`, `earn`, `gov`, `income`).
5. `export.py` writes `data/<slug>.csv` and `data/<slug>.json` for each map.
6. `build_house.py`, `build_homeown.py`, `build_age.py`, `build_urban.py` and `build_gdp.py` build the House, homeownership, age, urban and economy datasets; `tiles_lib.publish()` writes each map's data, poster and card image.
7. `build_pages.py` writes the gallery index and one page per map from `catalog.json`.

To add a map: put `data/<slug>.json`, `data/<slug>.csv`, `img/<slug>.png` (poster) and `thumbs/<slug>.png` (720px card image) in place, add an entry to `catalog.json`, and run `python3 src/build_pages.py`.

Raw downloads:

- https://en.wikipedia.org/wiki/1860_United_States_presidential_election (and every election page 1856-1972)
- https://doi.org/10.7910/DVN/42MVDX
- https://www.eia.gov/electricity/data/state/annual_generation_state.xls
- https://www.eia.gov/state/seds/CDF/Complete_SEDS.csv
- https://www2.census.gov/programs-surveys/stc/datasets/historical/STC-Historical-DB.xlsx
- https://apps.bea.gov/regional/zip/SAINC.zip

Requires pandas, numpy, matplotlib, scipy, lxml, openpyxl and xlrd.
- https://voteview.com/static/data/out/members/HSall_members.csv
- https://www2.census.gov/programs-surveys/decennial/tables/time-series/coh-owner/owner-tab.txt
- https://www.census.gov/housing/hvs/data/rates/tab3_state05_2026_hmr.xlsx
- https://www2.census.gov/programs-surveys/popest/ (PE-19, st_int_asrh, ST-99-9, st-est00int-agesex, SC-EST2020-AGESEX-CIV, sc-est2024-agesex-civ)
- https://www.census.gov/population/censusdata/urpop0090.txt (via the Internet Archive) and https://www2.census.gov/geo/docs/reference/ua/State_Urban_Rural_Pop_2020_2010.xlsx
- https://apps.bea.gov/regional/zip/SAGDP.zip and https://apps.bea.gov/regional/zip/SAGDP_SIC.zip
