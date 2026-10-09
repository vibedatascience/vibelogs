"""Télécharge les données Odissé (Santé publique France) et génère data.js.

Usage : python3 prepare_data.py
Aucune dépendance externe. Données sous Licence Ouverte 2.0.
"""
import json, urllib.request, collections

API = "https://odisse.santepubliquefrance.fr/api/explore/v2.1/catalog/datasets/{}/exports/json"
IDS = {
    "fr": "canicules-deces-attribuables-a-la-chaleur-pendant-lete-et-pendant-les-vagues-de-chaleur-france",
    "dep": "canicules-deces-attribuables-a-la-chaleur-pendant-l-ete-et-pendant-les-vagues-de-chaleur-departement",
    "jdep": "canicules-nombres-de-jours-de-canicule-departement",
    "jfr": "canicules-nombres-de-jours-de-canicule-france",
}

def get(key):
    with urllib.request.urlopen(API.format(IDS[key]), timeout=120) as r:
        return json.load(r)

def num(v):
    return round(float(v))

def main():
    fr, dep, jdep, jfr = get("fr"), get("dep"), get("jdep"), get("jfr")
    tous = {x["annee"]: x for x in fr if x["classe_age"] == "Tous Ages"}
    plus75 = {x["annee"]: x for x in fr if x["classe_age"] == "Plus de 75 ans"}
    nat = []
    for an in sorted(tous):
        x, o = tous[an], plus75[an]
        nat.append(dict(y=int(an), ch=num(x["dc_chaleur"]), chi=num(x["dc_chaleur_inf"]), chs=num(x["dc_chaleur_sup"]),
                        ca=num(x["dc_canicule"]), cai=num(x["dc_canicule_inf"]), cas=num(x["dc_canicule_sup"]),
                        o75=num(o["dc_chaleur"]), af=float(x["af_chaleur"]), afc=float(x["af_canicule"])))
    days = {int(x["annee"]): int(float(x["nb_jdep_can"])) for x in jfr}
    D = collections.defaultdict(lambda: {"n": "", "r": "", "y": {}})
    for x in dep:
        if x["classe_age"] != "Tous Ages":
            continue
        d = D[x["departements"]]
        d["n"], d["r"] = x["libgeo"], x["reglib"]
        d["y"][int(x["annee"])] = [num(x["dc_chaleur"]), num(x["dc_canicule"])]
    for x in jdep:
        if x["dep"] in D:
            D[x["dep"]].setdefault("j", {})[int(x["annee"])] = int(float(x["nb_j_can"]))
    out = dict(nat=nat, days=days, dep=D)
    with open("data.js", "w", encoding="utf-8") as f:
        f.write("/* Donnees Odisse (Sante publique France), Licence Ouverte 2.0. Generees par prepare_data.py. */\n")
        f.write("window.DATA = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
    tot = sum(n["ch"] for n in nat); can = sum(n["ca"] for n in nat)
    print(f"{tot} décès attribuables, dont {can} pendant les canicules ({100*can/tot:.1f} %)")

if __name__ == "__main__":
    main()
