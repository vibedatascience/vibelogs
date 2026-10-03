import json
_n=json.load(open('/home/claude/vibelogs/state-tiles/data/president.json'))['names']
ABBR={v:k for k,v in _n.items()}   # full name -> postal code
NAMES=_n                           # postal code -> full name
