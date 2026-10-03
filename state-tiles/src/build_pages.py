"""Write the State tiles index page and one page per map from catalog.json.

Add a map: put data/<slug>.json, data/<slug>.csv, img/<slug>.png and thumbs/<slug>.png
in place, add an entry to catalog.json, then run this from the state-tiles folder:

    python3 src/build_pages.py
"""
import json, html, os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(HERE)
cat = json.load(open('catalog.json'))

for m in cat['maps']:
    d = json.load(open(f"data/{m['slug']}.json"))
    m['years'] = f"{d['years'][0]}-{d['years'][-1]}"
for t in {m['topic'] for m in cat['maps']}:
    if t not in cat['topics']:
        cat['topics'].append(t)
json.dump(cat, open('catalog.json', 'w'), indent=2, ensure_ascii=False)
open('catalog.json', 'a').write('\n')

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link href="https://fonts.googleapis.com/css2?family=Old+Standard+TT:wght@700&family=Roboto+Condensed:wght@400;600;700&display=swap" rel="stylesheet">')
FOOT = ('<footer>Each tile is one state, and time runs left to right. '
        'Gray means no data. Style after 1POINT21 Interactive\'s "Where are Americans born?". '
        '<a href="https://github.com/vibedatascience/vibelogs/tree/main/state-tiles/src">Code</a></footer>')


def head(title, desc, img, rel):
    e = html.escape
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="author" content="Rahul">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="https://rahulch.site/state-tiles/{img}">
<meta name="twitter:card" content="summary_large_image">
{FONTS}
<link rel="stylesheet" href="{rel}app.css">
</head>'''


n = len(cat['maps'])
index = head('State tiles', f'{n} tile-grid maps of the fifty states over time.', 'thumb.jpg', '') + f'''
<body data-root="./">
<div class="wrap">
<a class="back" href="../">&larr; rahulch.site</a>
<div class="ix-head">
  <div>
    <h1>State tiles</h1>
    <div class="ix-sub"><span id="count">{n} maps</span> of the fifty states over time. One small chart per state.</div>
  </div>
  <div class="search">
    <label for="q">Search maps</label>
    <input id="q" type="search" placeholder="taxes, coal, 1860..." autocomplete="off">
  </div>
</div>
<div class="tabs" id="tabs"></div>
<div class="cards" id="cards"></div>
<p class="empty" id="empty" hidden>No map matches that search.</p>
{FOOT}
</div>
<script src="app.js"></script>
</body>
</html>
'''
open('index.html', 'w').write(index)

for m in cat['maps']:
    s = m['slug']
    os.makedirs(s, exist_ok=True)
    page = head(f"{m['title']} | State tiles", m['caption'], f'img/{s}.png', '../') + f'''
<body data-root="../" data-slug="{s}">
<div class="wrap">
<nav class="bar">
  <div class="l"><a class="all" href="../">&larr; All maps</a><span class="muted" id="topic"></span></div>
  <div class="r"><a id="prev" href="../"></a><span class="muted" id="pos"></span><a id="next" href="../"></a></div>
</nav>
<div class="head">
  <div>
    <h1>{html.escape(m['title'])}</h1>
    <div class="years" id="years"></div>
  </div>
  <div class="legend" id="legend"></div>
</div>
<div class="readout" id="readout"><span class="hint">Hover or tap a tile to read the numbers for that year.</span></div>
<svg class="grid" id="grid" role="img" aria-label="Tile grid map: {html.escape(m['title'])}"></svg>
<p class="caption" id="caption"></p>
<p class="note" id="note"></p>
<div class="links" id="links"></div>
<section class="more" id="more">
  <h2 id="more-h"></h2>
  <div class="cards" id="more-cards"></div>
</section>
{FOOT}
</div>
<script src="../app.js"></script>
</body>
</html>
'''
    open(f'{s}/index.html', 'w').write(page)
print('wrote index +', n, 'map pages')
