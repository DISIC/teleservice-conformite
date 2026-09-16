# RGAA 5 — sources et données publiées

Ce dossier contient tout le RGAA 5 :

- `content/` : les sources, en markdown, éditées par les contributeurs. C'est ici que l'on corrige un critère, un test ou un terme du glossaire.
- `data/` : les Données publiées (JSON), générées automatiquement à partir de `content/` par l'intégration continue à chaque fusion sur `main`. Ne jamais les modifier à la main.

## Arborescence de `content/`

```
content/
  thematiques.yml                 la liste des Thématiques (numéro et intitulé)
  criteres/
    1.1/                          un dossier par Critère, nommé par son numéro
      index.md                    l'intitulé du Critère, en une phrase, sans en-tête
      web/                        un dossier par Référentiel auquel le Critère s'applique
        annexe.md                 références normatives et techniques, uniquement dans l'en-tête
        cas-particuliers.md       facultatif, texte seul
        notes-techniques.md       facultatif, texte seul
        tests/1.md, 2.md…         un fichier par Test : intitulé dans l'en-tête, méthodologie en corps
      mobile/                     même contenu pour le Référentiel Applications mobiles
      bureautique/                même contenu pour le Référentiel Logiciels bureautiques
  glossaire/<slug>.md             un fichier par Terme : intitulé dans l'en-tête, définition en corps
```

Un Critère s'applique à un Référentiel dès qu'il possède le dossier correspondant (`web`, `mobile` ou `bureautique`) ; il n'y a pas d'autre marqueur d'applicabilité. Un Critère absent d'un Référentiel y est affiché « Non applicable », jamais retiré ni renuméroté.

## Les fichiers

**`thematiques.yml`**

```yaml
- number: 1
  title: Images
```

**`criteres/1.1/index.md`** : la seule phrase du fichier est l'intitulé du Critère. Les mots du glossaire sont des liens `[alternative textuelle](#alternative-textuelle-image)`.

**`criteres/1.1/web/annexe.md`** : uniquement un en-tête, le corps reste vide.

```yaml
---
references:
  - standard: WCAG 2.1
    reference: "1.1.1"
    title: Non-text Content
    level: A
techniques:
  - H36
  - H37
---
```

Les numéros sont toujours entre guillemets : sans guillemets, `1.10` serait lu comme le nombre 1,1.

**`criteres/1.1/web/tests/1.md`** : l'en-tête porte l'intitulé et, si le test énumère des conditions, la liste `conditions`. Le corps est la méthodologie.

```markdown
---
title: Chaque image vectorielle (balise `<svg>`) porteuse d'information vérifie-t-elle ces conditions ?
conditions:
  - La balise `<svg>` possède un attribut WAI-ARIA `role="img"` ;
  - La balise `<svg>` a une alternative textuelle.
---

1. Retrouver dans le document les éléments `<svg>` ;
2. …
```

Les tests sont numérotés de 1 à n sans trou, par Référentiel : le test 1.1.1 du Référentiel Mobile n'est pas celui du Référentiel Web.

**`glossaire/alternative-textuelle-image.md`** : le nom du fichier est le slug que les liens utilisent. Par défaut un Terme s'applique aux trois Référentiels ; pour le restreindre, ajouter `referentiels` dans l'en-tête.

```markdown
---
title: Alternative textuelle (image)
referentiels:
  - web
---

« Nom accessible » restitué par les technologies d'assistance…
```

## Vérifications automatiques

Chaque pull request qui touche `content/` est vérifiée : en-têtes conformes, fichiers attendus dans chaque dossier, tests numérotés sans trou, au moins un test par Référentiel présent, et chaque lien de glossaire pointe vers un Terme qui existe et s'applique au Référentiel du texte. Les messages sont en français et indiquent le fichier concerné.

Pour lancer la vérification en local, depuis la racine du dépôt :

```bash
pnpm --filter @rgaa/content check
```

## Générer les Données publiées en local

La génération écrit `data/5/criteres.json` et `data/5/glossaire.json` à partir de `content/`, après la même vérification :

```bash
pnpm --filter @rgaa/content build:data
```
