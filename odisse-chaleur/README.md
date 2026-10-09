# Sous la surface

**Odissé Dataviz Challenge 2026, défi principal : Impacts de la chaleur.**
Version interactive : https://rahulch.site/odisse-chaleur/ · Affiche : `affiche.png` (300 dpi) et `affiche.pdf`.

## Objectif

Montrer que la chaleur tue surtout en dehors des canicules. Entre 2014 et 2025, Santé publique France estime à 47 258 les décès attribuables à la chaleur pendant les étés en France hexagonale. Seuls 13 143 (28 %) sont survenus pendant une canicule. Les 34 115 autres (72 %) ont eu lieu des jours sans canicule, et c'est le cas chaque année. La visualisation représente chaque été comme un iceberg : au-dessus de la ligne, les décès pendant les canicules, la partie que voient les alertes ; en dessous, le reste de l'été. Un point vaut 10 décès. Le message s'adresse au grand public et aux décideurs : la prévention doit couvrir tout l'été, pas seulement les périodes de vigilance. Un sélecteur permet de retrouver le même découpage pour chacun des 96 départements.

## Données

Source : Odissé, Santé publique France, Licence Ouverte 2.0.

- Canicules : Décès attribuables à la chaleur pendant l'été et pendant les vagues de chaleur (France ; Département), 2014 à 2025, tous âges et 75 ans et plus.
- Canicules : Nombres de jours de canicule (France ; Département), 2004 à 2025.

Traitements : décès hors canicule = décès attribuables sur la période de surveillance (1er juin au 15 septembre) moins décès attribuables pendant les canicules. Les nombres de points sont arrondis à la dizaine ; les valeurs exactes et les intervalles de confiance à 95 % figurent dans les infobulles et le tableau. Aucune donnée externe à Odissé. Les décès attribuables sont une estimation populationnelle (Pascal et al., 2024), pas un décompte des certificats de décès.

## Outils

HTML, CSS et JavaScript sans bibliothèque (SVG généré dans le navigateur). Données récupérées par l'API Odissé avec `prepare_data.py` (Python, bibliothèque standard), qui produit `data.js`. Palette vérifiée pour les daltonismes (rouge #E60023, bleu #2d6cb5) ; la position au-dessus ou au-dessous de la ligne encode aussi la catégorie.

## Licences

- Code : licence MIT (`LICENSE`).
- Textes et visuels : licence CC BY 4.0.
- Données : Licence Ouverte 2.0, Santé publique France (Odissé).

Inspiration : visualisation unitaire de This is a Teenager d'Alvin Chang (The Pudding), or aux Information is Beautiful Awards 2024.

Auteur : Rahul Chaudhary.
