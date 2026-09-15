# Intégration du site RGAA 5 et du téléservice — décisions d'architecture

- **Statut :** compréhension partagée, rien n'est encore mis en œuvre.
- **Session :** 11–14 septembre 2026.
- **Remplace :** les choix techniques du document de cadrage « Intégration du site RGAA5 dans téléservice conformité ». Les objectifs de ce document (contenu versionné en fichiers, contributions par PR, bascule en deux temps, redirections) sont conservés ; plusieurs de ses choix d'architecture sont remplacés, voir § 2.
- **Vocabulaire :** les termes Référentiel, Critère, Test, Thématique, Terme, Version et Données publiées sont définis dans `CONTEXT.md` (groupe « RGAA 5 référentiel »). Ce document les utilise sans les redéfinir.

## 1. Résumé

Deux applications dans un monorepo pnpm :

- **`apps/site`** : le site public RGAA 5, application Next.js sur l'App Router, exportée en statique (`output: "export"`), hébergée sur une application statique Clever Cloud, sur le domaine racine (`accessibilite.numerique.gouv.fr` après bascule, un domaine distinct pendant la cohabitation).
- **`apps/teleservice`** : l'application actuelle, inchangée (Pages Router, Payload, Postgres), sur un sous-domaine.

Le RGAA 5 vit dans un seul dossier racine **`rgaa/`** : `rgaa/content/`, les sources en markdown pur éditées par les contributeurs externes, et `rgaa/data/`, les **Données publiées** générées (fichiers JSON versionnés, nouvelle structure, schéma JSON publié). Un paquet **`packages/content`** lit les sources, les valide (Zod) et produit les données. La CI exécute la même validation sur toute PR touchant `rgaa/content/`, avec des erreurs en français, et régénère puis commite `rgaa/data/` à chaque fusion sur `main` ; le site les sert à une URL versionnée.

Le site RGAA 4.1.2 reste sur Netlify depuis son dépôt actuel et passe sur un sous-domaine `v4` à la bascule (seul changement : DNS). Toutes les anciennes URL redirigent vers le nouveau site ; les ancres normatives atterrissent sur le référentiel Web.

## 2. Ce qui change par rapport au document de cadrage

| Sujet                              | Document de cadrage                                                                                 | Décision de la session                                                                          | Pourquoi                                                                                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Déployable                         | Une seule application Next.js                                                                       | Deux applications (site statique + téléservice) dans un monorepo                                | Performance du site, en-têtes distincts, déploiements séparés. Le choix des deux en-têtes distincts a supprimé l'argument « une seule coque cohérente » qui justifiait l'application unique |
| Domaine du téléservice             | Sous-chemin `/declarations` du domaine racine                                                       | Sous-domaine                                                                                    | Clever Cloud route par domaine, pas par chemin ; un proxy annulerait les gains du statique                                                                                                  |
| Sérialisation des données publiées | YAML à la place du JSON actuel (« plus lisible et plus sûr », convertible en JSON)                  | JSON, schéma JSON publié                                                                        | Fichiers générés, jamais édités à la main, consommés par des programmes : le typage implicite du YAML lit `1.10` comme 1.1, le JSON se lit sans bibliothèque partout                        |
| Format des sources (critères)      | Non tranché ; l'exemple YAML du cadrage illustrait la structure d'un critère                        | Dossier par critère, markdown à frontmatter, un fichier par test                                | Habitude des contributeurs, conflits de fusion, prose lisible ; le YAML ne subsiste que dans le frontmatter (2–3 champs)                                                                    |
| Référentiels                       | « Chaque référentiel est indépendant »                                                              | Une seule liste de Critères, projetée par Référentiel                                           | Contradiction interne du cadrage ; une modification d'intitulé ne doit pas être répétée trois fois                                                                                          |
| Espace authentifié                 | `/declarations/workspace`                                                                           | `/dashboard/*` conservé, `/declarations` devient la page d'accueil publique du téléservice      | Aucun renommage, frontière claire pour l'en-tête                                                                                                                                            |
| Fichiers JSON générés              | Commités par un hook pre-commit (jamais exécuté par les contributeurs éditant depuis le navigateur) | Générés au build du site et commités sur `main` par la CI dans `rgaa/data/`, à côté des sources | Disponibilité sur GitHub et historique pour les outils, comme avant ; plus de JSON obsolète en attente d'un mainteneur                                                                      |
| Structure des données publiées     | Reprise implicite du format RGAA 4                                                                  | Nouvelle structure (Référentiels, applicabilité), versionnée dans l'URL                         | Le format RGAA 4 n'a pas de notion de Référentiel ; les outils doivent changer de toute façon                                                                                               |
| En-tête                            | Un seul site cohérent                                                                               | Deux en-têtes distincts avec un bouton de bascule en haut à droite                              | Décision produit                                                                                                                                                                            |
| Prévisualisation des PR            | Non traitée                                                                                         | Aucune pour l'instant                                                                           | La mise en page est fixée par les composants DSFR ; le rendu markdown de GitHub suffit                                                                                                      |

## 3. Décisions détaillées

Chaque décision indique les alternatives écartées et la raison du choix.

### 3.1 Topologie et hébergement

**Décision.** Deux déployables, un domaine chacun. `apps/site` sur une application statique Clever Cloud (runtime « Static with Apache », répertoire servi via `CC_WEBROOT`, redirections via `.htaccess`). `apps/teleservice` sur son application Clever Cloud actuelle, sur un sous-domaine du domaine RGAA après la bascule.

**Alternatives écartées.**

- _Une seule application Next.js servant les deux_ (le cadrage). Écartée après la décision des deux en-têtes : elle ne rapportait plus la cohérence visuelle et coûtait l'hydratation d'une page de cent accordéons, des déploiements couplés (une coquille dans un critère redéploie le téléservice) et un serveur Node devant du contenu statique.
- _Proxy applicatif pour découper un domaine par chemins._ Écarté : Clever Cloud route par domaine ; un proxy Next.js vers l'application statique annulerait la robustesse et l'isolation recherchées.
- _Pages RGAA sur l'App Router de l'application téléservice existante._ Même défaut que l'application unique.

**Conséquences.** Le bouton de bascule entre les deux espaces est un lien entre deux hôtes. La table de redirections vit dans l'hébergement statique, pas dans Next.js. Les deux applications déploient indépendamment.

### 3.2 Frameworks

**Décision.** Next.js dans les deux applications. `apps/site` sur l'**App Router** avec `output: "export"` et l'intégration `next-appdir` de react-dsfr ; `apps/teleservice` reste sur le **Pages Router** (pas de migration de routeur pour la symétrie). react-dsfr reste la bibliothèque de composants des deux côtés.

**Alternatives écartées.**

- _Astro._ Meilleure sortie possible (zéro JavaScript, collections de contenu validées par Zod), mais react-dsfr n'y est ni supporté ni documenté : ses composants exigent une initialisation (`withDsfr`, `DsfrProvider` ou `startReactDsfr`) que le rendu statique d'Astro n'exécute pas. Le seul chemin fiable serait des îlots React hydratés, qui rendent l'avantage zéro-JS, dans un cadre non supporté et sans expert dans l'équipe.
- _11ty._ Reprendrait les gabarits Nunjucks existants, mais sans bibliothèque de composants React, et le site actuel tourne sur une 11ty 1.0 bêta à mettre à niveau.
- _TanStack Start._ Équivalent à Next.js pour la fonctionnalité markdown (même loader, même prérendu), mais l'admin Payload 3 est construite sur Next.js et le support SSR de react-dsfr hors Next est mince : une réécriture du téléservice sans gain.
- _DSFR vanilla (`@gouvfr/dsfr`) sans bibliothèque de composants._ Refusé par l'équipe.
- _Pages Router pour le site._ Retenu un temps quand le site devait partager la coque du téléservice dans un seul déployable ; cette raison a disparu. L'App Router garde le contenu hors du bundle client (composants serveur), offre des layouts imbriqués qui épousent l'architecture (racine → référentiel → page), l'API Metadata (titres, `sitemap`, `robots` compatibles avec l'export) et c'est le routeur dans lequel Next.js investit.

**Ce que l'on cède.** Par rapport à Astro, les pages embarquent le runtime React et s'hydratent. Pour un site de référence lu par des professionnels sur poste de travail, c'est le moindre des gains ; l'App Router en limite déjà le coût.

### 3.3 Modèle de contenu

Décisions enregistrées dans `CONTEXT.md` ; rappel des choix et des alternatives.

- **Un Critère est une entité unique** (numéro, intitulé, niveau, Thématique partagés), applicable à un, deux ou trois Référentiels. _Écarté :_ trois listes de critères indépendantes (dérive de rédaction, triple correction). L'intitulé ne varie pas par Référentiel ; seuls les Tests varient.
- **Un Test appartient à un couple (Critère, Référentiel)** ; sa numérotation repart à 1 par Référentiel. Le Test 1.2.1 de Mobile n'est pas le Test 1.2.1 de Bureautique.
- **Références normatives, techniques, cas particuliers et notes techniques sont par Référentiel**, à côté des Tests. _Écarté :_ les partager (elles sont technologiques : techniques WCAG côté Web, clauses EN 301 549 côté Mobile).
- **Numérotation stable avec trous** : un Référentiel n'affiche que ses Critères applicables, sans renuméroter ni insérer de « non applicable ». _Écarté :_ renumérotation par Référentiel (casse la promesse « même liste ») et lignes de substitution.
- **Un glossaire partagé**, chaque Terme déclarant ses Référentiels (défaut : les trois). Une notion qui diffère selon la plateforme donne deux Termes nommés distinctement. La CI interdit à un Test de lier un Terme non applicable à son Référentiel. _Écarté :_ trois glossaires, ou des variantes cachées sous un même Terme.
- **Version globale du site** (5.0, 5.1…), les trois Référentiels évoluant ensemble ; seule la Version courante est rendue, les précédentes survivent en Données publiées figées et notes de révision. _Écarté :_ rendre toutes les Versions (multiplication d'URL quasi identiques).

### 3.4 Stockage du contenu et pipeline

**Décision.** Un dossier racine **`rgaa/`** regroupe tout le RGAA : `rgaa/content/`, sources en markdown pur sans aucun code, et `rgaa/data/`, fichiers générés (§ 3.5). Loader dans **`packages/content`**, deux chemins configurés, entrée et sortie. CI sur `rgaa/content/**` avec messages en français ; une modification manuelle sous `rgaa/data/**` échoue en CI.

```
rgaa/
  README.md               guide de contribution en français ; dit en une ligne que data/ est généré
  content/
    thematiques.yml
    criteres/
      1.1/
        index.md          niveau en frontmatter, intitulé en corps
        web/
          annexe.md       références WCAG et techniques en frontmatter ; cas particuliers et notes en corps
          tests/1.md      intitulé en frontmatter, méthodologie en corps
          tests/2.md
        mobile/
          annexe.md
          tests/1.md
    glossaire/<slug>.md   referentiels en frontmatter (défaut : les trois)
    faq/<slug>.md
    pages/…               méthode, obligations, ressources, accueil
    _modeles/             exemples copiables de chaque type de fichier, commentés en français
  data/                   généré par la CI sur main, jamais édité à la main
    5/                    Version courante : web/, mobile/, bureautique/, criteres.json, glossaire.json
    5.0/                  Versions antérieures figées, même disposition
    schema/               schéma JSON publié
```

L'applicabilité d'un Critère à un Référentiel est **déduite de la présence du sous-dossier** ; la CI exige au moins un test dans tout sous-dossier présent. Pas de champ d'applicabilité redondant.

**Contrôles CI.** Frontmatter conforme au schéma ; tout lien de glossaire résout vers un Terme existant et applicable au Référentiel ; tout lien interne résout ; tests numérotés de 1 à n sans trou ni doublon ; au moins un test par sous-dossier de Référentiel présent.

**Alternatives écartées.**

- _Dépôt de contenu séparé, consommé comme release taguée._ Meilleur pour la sécurité (les PR externes ne touchent jamais le dépôt qui déploie un service authentifié) et pour la lisibilité côté contributeur, mais l'équipe veut un seul dépôt. Compensé par : règle de propriétaires de code (`/content/**` → éditeurs), CI filtrée par chemin, et le fait que le site publie lui-même les Données publiées.
- _Sources sous `src/`._ `src/` est le code ; le contenu est une entrée du build, visible à la racine pour les contributeurs.
- _Sources dans `packages/content`._ Mettrait `package.json`, `src/` et `node_modules` sous les yeux des contributeurs, obligerait la règle de propriétaires à découper les fichiers des éditeurs dans un paquet de développeurs, et placerait les tests du loader à côté du texte normatif ; le code reste dans `packages/content`, les sources dans `rgaa/content/`.
- _Deux dossiers racine, `content/` pour les sources et `RGAA/` pour les fichiers générés._ Deux entrées pour un seul sujet ; regroupés sous `rgaa/` avec une frontière à un niveau (`content/` éditeurs, `data/` robot de CI).
- _Fichiers générés non commités, servis uniquement par le site._ Retenu un temps ; abandonné parce que les outils tiers lisent aujourd'hui `RGAA/criteres.json` directement sur GitHub et que le dépôt leur offre l'historique et le diff de chaque changement.
- _Collections Payload._ Incompatible avec la contribution par PR en fichiers.

### 3.5 Données publiées

**Décision.** Nouveau format reflétant le modèle : un fichier par Référentiel (Critères applicables, Tests, références, cas particuliers, notes), un fichier « modèle complet » (tous les Critères avec leur applicabilité), un fichier glossaire (avec applicabilité par Terme). Versionnées dans l'URL (par exemple `/rgaa/data/5/web/criteres.json`). Liens absolus produits depuis une URL de base configurée. **Schéma JSON publié** à côté des fichiers : c'est lui la promesse de compatibilité.

**Où elles vivent.** Deux copies identiques par construction, le générateur étant déterministe :

- **Dans le dépôt, `rgaa/data/`**, régénéré et commité par un workflow à chaque fusion sur `main` (commit du robot de CI). Une PR ne contient jamais de fichiers générés ; une modification manuelle sous `rgaa/data/**` échoue en CI. C'est ce que les outils tiers lisent sur GitHub, avec l'historique et le diff de chaque changement, comme ils lisaient `RGAA/criteres.json`. Les Versions antérieures figées y restent (`rgaa/data/5.0/`), jamais régénérées : le générateur n'écrit que la Version courante.
- **Sur le site, `/rgaa/data/…`**, adresse canonique de téléchargement : le build de `apps/site` régénère depuis `rgaa/content/` dans son export, sans attendre le commit du robot, et copie les Versions figées telles quelles.

_Écarté :_ le hook pre-commit du dépôt RGAA 4, qui ne s'exécutait pas pour les contributeurs éditant depuis le navigateur et laissait le JSON obsolète jusqu'à une régénération manuelle.

**Alternatives écartées.** Reprendre la structure RGAA 4 (aucune place pour le Référentiel, bizarreries pérennisées) ; publier deux structures (double surface à maintenir) ; **sérialiser en YAML** plutôt qu'en JSON, comme le proposait le cadrage pour sa lisibilité : ces fichiers sont générés, jamais édités à la main et lus par des programmes, donc la lisibilité pour l'humain n'est pas le critère. Le YAML type implicitement (`1.10` non cité devient le nombre 1.1 et se confond avec le critère 1.1, `no` devient `false` en YAML 1.1, les parseurs 1.1 et 1.2 divergent), exige une bibliothèque chez chaque consommateur et se valide contre un schéma JSON seulement après conversion. Le JSON a une grammaire unique, aucun type implicite, un parseur natif dans tout navigateur et tout langage, et le schéma JSON s'y applique directement. Une vue YAML resterait générable d'un appel depuis le même modèle, mais ne sera pas publiée : seconde surface à documenter, et celle où `1.10` se trompe. Voir l'annexe B.

### 3.6 URL, navigation, recherche

- **Une page par Référentiel** listant tous ses Critères en accordéons, ancres `#1.1` et `#1.1.1` avec les **règles de slug du site RGAA 4** (reprises pour que les anciens liens profonds survivent au 301, le navigateur conservant le fragment). Une page d'accueil par Référentiel (`/rgaa/web`) pour l'introduction, l'environnement de test et le téléchargement des données. **Une page de glossaire partagée**. _Écarté :_ une page par Critère (triple les URL, change l'habitude de lecture des auditeurs).
- **Téléservice :** `/dashboard/*` et `/declarations/[id]/publish` inchangés ; nouvelle page d'accueil publique à `/declarations` (contenu de l'actuelle racine). La racine `/` est l'accueil RGAA.
- **Deux en-têtes distincts**, chacun avec un bouton en haut à droite vers l'autre espace. _Écarté :_ un en-tête unique dont la navigation dépend de l'arbre de routes.
- **Recherche : Pagefind** exécuté sur l'export statique après `next build`, avec un filtre par Référentiel porté par des attributs de données sur les pages. _Écarté :_ pas de recherche ; index client sur mesure.

### 3.7 Redirections et archive 4.1.2

**Décision.** Après la bascule, **toutes** les anciennes URL du domaine racine redirigent vers le nouveau site : pages éditoriales vers leurs équivalents RGAA 5, ancres normatives (`/methode/criteres-et-tests/#3.2`, `/methode/glossaire/#…`) vers la page du **référentiel Web**, cas le plus fréquent. Table de redirections maintenue dans le dépôt et transformée en `.htaccess` au build.

**Alternative écartée.** Renvoyer les URL normatives vers l'archive 4.1.2 (préserve le sens des citations dans les déclarations publiées sous 4.1.2) et seulement les pages éditoriales vers le nouveau site. L'équipe a privilégié le transfert intégral du référencement.

**Conséquences à assumer.** Le fragment n'atterrit sur le bon critère que si RGAA 5 conserve la numérotation RGAA 4 pour les critères survivants. Mesure peu coûteuse : un lien permanent « Consulter le RGAA 4.1.2 (archive) » en tête des pages critères et glossaire Web, qui transporte le fragment courant vers l'archive. Les URL absolues codées en dur dans les JSON RGAA 4 résoudront vers du contenu RGAA 5 Web.

**Archive.** Le site 4.1.2 reste sur Netlify depuis son dépôt, ouvert aux corrections tant que 4.1.2 reste applicable, puis archivé. À la bascule : uniquement le DNS du sous-domaine `v4`. Hors périmètre de ce projet au-delà du DNS. _Écarté :_ gel et migration vers Clever Cloud ; réimport de 4.1.2 dans la nouvelle plateforme.

### 3.8 Contribution

**Décision.** Documentation et gabarits : `rgaa/README.md` en français (arborescence, champs de frontmatter, ouvrir une PR depuis le navigateur, `data/` est généré), dossier `rgaa/content/_modeles/`, gabarit de PR (Référentiel et Critère touchés), formulaires d'issue (« erreur dans un critère ou un test », « proposition d'évolution », « glossaire »). Fichier de propriétaires de code : approbation d'un éditeur requise sur `rgaa/content/**`, écriture de `rgaa/data/**` réservée au robot de CI, approbation d'un développeur ailleurs. Erreurs de CI en français avec fichier et ligne.

**Écarté pour l'instant.** Éditeur guidé adossé à git (Keystatic, Sveltia) : décision à prendre sur constat de friction, pas par avance. Application de prévisualisation (permanente ou éphémère par PR) : inutile tant que la mise en page est fixée par les composants DSFR ; le statique la rend gratuite le jour voulu.

### 3.9 Hors périmètre ou différé

- Alignement de `app_kind` du téléservice avec les Référentiels (« Autre » n'est pas « Bureautique » ; une Déclaration ne nomme pas le Référentiel suivi par son audit). À traiter à la mise en service de RGAA 5 ; pas de champ libre intermédiaire.
- Second contexte de domaine avec carte de contextes : un seul `CONTEXT.md` à la racine, deux groupes de glossaire.
- Tout travail sur le site 4.1.2 au-delà du DNS.

## 4. Plan de construction

Tranches ordonnées ; chacune laisse les deux applications déployables.

1. **Monorepo.** Passage à pnpm ; déplacement de l'application actuelle vers `apps/teleservice/` (historique git conservé) ; déploiement Clever Cloud depuis le sous-dossier ; CI filtrée par chemin. Aucun changement fonctionnel.
2. **`rgaa/content/` et `packages/content`.** Schémas Zod, parsing, contrôles (messages en français), `thematiques.yml`, quelques Critères d'exemple migrés de 4.1.2 pour le réalisme ; job CI sur `rgaa/content/**`.
3. **Squelette `apps/site`.** App Router, react-dsfr `next-appdir`, export statique, coque DSFR avec le bouton de bascule ; déploiement sur l'application statique Clever Cloud au domaine de cohabitation ; génération du `.htaccess` (vide) au build.
4. **Pages selon les maquettes.** Accueil, accueil de Référentiel, page critères (accordéons, ancres aux règles de slug RGAA 4), glossaire, FAQ, pages éditoriales.
5. **Données publiées.** Générateur, schéma JSON publié, workflow de régénération et commit de `rgaa/data/` sur `main`, contrôle CI refusant les modifications manuelles, copie dans l'export du site sous `/rgaa/data/…`, convention de dossier pour les Versions figées.
6. **Pagefind** avec filtre par Référentiel.
7. **Kit de contribution.** `rgaa/README.md`, `_modeles/`, gabarit de PR, formulaires d'issue, propriétaires de code.
8. **Bascule.** Page d'accueil `/declarations` du téléservice, table de redirections complète, DNS (racine vers le site, `v4` vers Netlify, sous-domaine du téléservice).

**Spikes de la première tranche (à lever avant toute fonctionnalité).**

- Espace de travail pnpm démarrant Payload et deux applications Next.js.
- Intégration App Router de react-dsfr sous `output: "export"` ; quels composants exigent une frontière client quand ils sont utilisés depuis un composant serveur.
- Variable Clever Cloud pour déployer un sous-dossier de monorepo (non confirmée dans la documentation lors de la session).
- Génération du `.htaccess` depuis un fichier de redirections du dépôt.

## 5. Points ouverts, à trancher par l'équipe

- Domaine du site pendant la cohabitation ; nom du sous-domaine du téléservice à la bascule.
- Identifiants GitHub des éditeurs propriétaires de `rgaa/content/`.
- RGAA 5 conserve-t-il la numérotation RGAA 4 pour les critères survivants ? (qualité d'atterrissage des anciennes ancres)
- Calendrier : le cadrage vise une mise en ligne en novembre 2026 et une bascule en janvier 2027.
- Architecture exacte des pages éditoriales selon les maquettes.

## Annexe A — Arborescence cible du dépôt

```
rgaa/
  README.md           guide de contribution
  content/            sources markdown, contributeurs
  data/               JSON généré, commité par la CI sur main, Versions figées incluses
apps/site/            Next.js App Router, export statique, domaine racine ; copie rgaa/data/ dans son export
apps/teleservice/     application actuelle, Pages Router, sous-domaine
packages/content/     loader : lit rgaa/content/, écrit rgaa/data/ ; schémas, contrôles, script `check` pour la CI
docs/                 documentation d'équipe (ce document, ADR)
CONTEXT.md            glossaire unique, deux groupes
```

## Annexe B — YAML et JSON : où chacun sert

Le cadrage proposait de publier les fichiers de données en YAML à la place du JSON actuel, le jugeant « plus lisible et plus sûr », et convertible en JSON au besoin. La session a tranché à l'inverse pour ces fichiers et a réservé le YAML aux sources.

**Données publiées : JSON.** Elles sont générées depuis `rgaa/content/`, jamais corrigées à la main (une correction se fait dans le markdown source) et lues par des programmes. Pour un tel usage la sûreté joue contre le YAML : typage implicite (`1.10` non cité devient 1.1, `no` devient `false` sous YAML 1.1), divergences entre parseurs 1.1 et 1.2, bibliothèque nécessaire dans chaque consommateur, validation par schéma JSON possible seulement après conversion. Le JSON a une grammaire unique, aucun type implicite, un parseur natif partout (`fetch().json()` dans le navigateur), et le schéma publié s'y applique directement. Sa lisibilité, avec une indentation de deux espaces et un fichier par Référentiel, suffit à l'inspection.

**Sources : markdown à frontmatter YAML.** Là où des humains saisissent deux ou trois valeurs étiquetées (`niveau`, `referentiels`, références WCAG) le YAML est lisible et sûr, et Zod le valide. La prose (intitulés, méthodologies, cas particuliers, notes) reste en markdown : lisible, relisible dans le diff de GitHub, un fichier par test pour éviter les conflits de fusion, et sans les deux-points ni points d'interrogation qui cassent un scalaire YAML non cité.
