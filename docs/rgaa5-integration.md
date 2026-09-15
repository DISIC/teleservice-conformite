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

| Sujet                          | Document de cadrage                                                                                 | Décision de la session                                                                          | Pourquoi                                                                                                                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Déployable                     | Une seule application Next.js                                                                       | Deux applications (site statique + téléservice) dans un monorepo                                | Performance du site, en-têtes distincts, déploiements séparés. Le choix des deux en-têtes distincts a supprimé l'argument « une seule coque cohérente » qui justifiait l'application unique           |
| Domaine du téléservice         | Sous-chemin `/declarations` du domaine racine                                                       | Sous-domaine                                                                                    | Clever Cloud route par domaine, pas par chemin ; un proxy annulerait les gains du statique                                                                                                            |
| Format des sources (critères)  | Un fichier YAML par critère                                                                         | Dossier par critère, markdown à frontmatter, un fichier par test                                | Habitude des contributeurs, prose lisible et relisible dans le diff GitHub ; le YAML subsiste dans le frontmatter (2–3 champs) ; la granularité (un fichier par test) est un choix distinct du format |
| Référentiels                   | « Chaque référentiel est indépendant »                                                              | Une seule liste de Critères, projetée par Référentiel                                           | Contradiction interne du cadrage ; une modification d'intitulé ne doit pas être répétée trois fois                                                                                                    |
| Espace authentifié             | `/declarations/workspace`                                                                           | `/dashboard/*` conservé, `/declarations` devient la page d'accueil publique du téléservice      | Aucun renommage, frontière claire pour l'en-tête                                                                                                                                                      |
| Fichiers JSON générés          | Commités par un hook pre-commit (jamais exécuté par les contributeurs éditant depuis le navigateur) | Générés au build du site et commités sur `main` par la CI dans `rgaa/data/`, à côté des sources | Disponibilité sur GitHub et historique pour les outils, comme avant ; plus de JSON obsolète en attente d'un mainteneur                                                                                |
| Structure des données publiées | Reprise implicite du format RGAA 4                                                                  | Nouvelle structure (Référentiels, applicabilité), versionnée dans l'URL                         | Le format RGAA 4 n'a pas de notion de Référentiel ; les outils doivent changer de toute façon                                                                                                         |
| En-tête                        | Un seul site cohérent                                                                               | Deux en-têtes distincts avec un bouton de bascule en haut à droite                              | Décision produit                                                                                                                                                                                      |
| Prévisualisation des PR        | Non traitée                                                                                         | Aucune pour l'instant                                                                           | La mise en page est fixée par les composants DSFR ; le rendu markdown de GitHub suffit                                                                                                                |

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
- **Numérotation stable, liste complète sur chaque Référentiel** : chaque page de Référentiel présente tous les Critères dans la même numérotation ; un Critère qui ne s'applique pas y est affiché comme hors référentiel, jamais retiré ni renuméroté, y compris quand une Thématique entière n'a aucun Critère applicable. _Vocabulaire :_ la mention est une phrase (« Ne s'applique pas aux applications mobiles ») ou « Hors référentiel Mobile », jamais « Non applicable », qui est un statut de résultat d'audit. _Écarté :_ n'afficher que les Critères applicables avec des trous dans la numérotation (premier choix de la session, remplacé parce que la page a besoin de la liste complète) ; renumérotation par Référentiel (casse la promesse « même liste »).
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
    5/                    Version courante : criteres.json (modèle complet), glossaire.json
    5.0/                  Versions antérieures figées, même disposition
    schema/               schéma JSON publié
```

L'applicabilité d'un Critère à un Référentiel est **déduite de la présence du sous-dossier** ; la CI exige au moins un test dans tout sous-dossier présent. Pas de champ d'applicabilité redondant.

_Recommandation en attente de validation :_ quand un dossier de Référentiel porte plusieurs champs de prose (cas particuliers, notes techniques), un fichier par champ (`cas-particuliers.md`, `notes-techniques.md`) plutôt que deux sections de titre dans `annexe.md`, dont le frontmatter ne garderait que les références. Chaque fichier n'a alors qu'un corps de prose, le loader n'analyse jamais de titres, et la CI valide un jeu de fichiers fixe par dossier.

**Contrôles CI.** Frontmatter conforme au schéma ; tout lien de glossaire résout vers un Terme existant et applicable au Référentiel ; tout lien interne résout ; tests numérotés de 1 à n sans trou ni doublon ; au moins un test par sous-dossier de Référentiel présent.

**Alternatives écartées.**

- _Dépôt de contenu séparé, consommé comme release taguée._ Meilleur pour la sécurité (les PR externes ne touchent jamais le dépôt qui déploie un service authentifié) et pour la lisibilité côté contributeur, mais l'équipe veut un seul dépôt. Compensé par : règle de propriétaires de code (`/content/**` → éditeurs), CI filtrée par chemin, et le fait que le site publie lui-même les Données publiées.
- _Sources sous `src/`._ `src/` est le code ; le contenu est une entrée du build, visible à la racine pour les contributeurs.
- _Sources dans `packages/content`._ Mettrait `package.json`, `src/` et `node_modules` sous les yeux des contributeurs, obligerait la règle de propriétaires à découper les fichiers des éditeurs dans un paquet de développeurs, et placerait les tests du loader à côté du texte normatif ; le code reste dans `packages/content`, les sources dans `rgaa/content/`.
- _Deux dossiers racine, `content/` pour les sources et `RGAA/` pour les fichiers générés._ Deux entrées pour un seul sujet ; regroupés sous `rgaa/` avec une frontière à un niveau (`content/` éditeurs, `data/` robot de CI).
- _Fichiers générés non commités, servis uniquement par le site._ Retenu un temps ; abandonné parce que les outils tiers lisent aujourd'hui `RGAA/criteres.json` directement sur GitHub et que le dépôt leur offre l'historique et le diff de chaque changement.
- _Collections Payload._ Incompatible avec la contribution par PR en fichiers.

### 3.4 bis Chaîne de transformation : du markdown à la page statique

**Une source de vérité : les schémas Zod de `packages/content`.** Ils servent trois fois sans être écrits deux fois : validation à l'exécution (frontmatter des sources, fichiers publiés), types TypeScript (`type Critere = z.infer<typeof Critere>`) et schéma JSON publié (`z.toJSONSchema`, natif en Zod 4).

```
packages/content/src/
  schema/sources.ts     frontmatter : index de critère, annexe, test, terme, faq, thematiques.yml
  schema/published.ts   sortie : Thematique, Critere, Declinaison, Test, Terme, CriteresFile, GlossaireFile + types inférés
  read.ts               parcourt rgaa/content/, gray-matter, valide le frontmatter, garde le corps en markdown
  build.ts              assemble le modèle, absolutise les liens [texte](#slug), vérifie slugs, applicabilité, numérotation
  write.ts              JSON.stringify(modèle, null, 2) → rgaa/data/<version>/ ; z.toJSONSchema → rgaa/data/schema/
  markdown.ts           markdown-it configuré avec les règles de slug RGAA 4, rend un corps en HTML
  cli.ts                `check` (read + build, erreurs en français, code 1) et `build` (check + write)
  index.ts              readPublished(version), renderMarkdown, les types
```

**Deux consommateurs, un chemin chacun.** La CI exécute `check` sur toute PR touchant `rgaa/content/`, puis `build` et commit sur `main`. Le site appelle `readPublished("5")`, qui lit `rgaa/data/5/criteres.json` sur le disque et l'analyse avec le schéma de sortie : la page reçoit une valeur `CriteresFile` typée et vérifiée, sans type écrit à la main ni conversion forcée.

**Génération statique.** Avec l'App Router et `output: "export"`, chaque route est rendue en HTML à `next build`. Un composant serveur peut lire le disque pendant ce build (il s'exécute dans Node) ; après l'export il n'y a plus de serveur, la lecture ne peut donc avoir lieu nulle part ailleurs. La page de critères d'un Référentiel déclare `generateStaticParams` avec les trois identifiants et `dynamicParams = false`, appelle `readPublished`, parcourt `thematiques` et rend chaque corps markdown en HTML via `renderMarkdown`, inséré avec `dangerouslySetInnerHTML` pour que l'hydratation ne parcoure pas ce contenu. Même schéma, avec `generateStaticParams` sur les slugs, pour le glossaire, la FAQ et les pages éditoriales. Le navigateur reçoit du HTML complet et la charge d'hydratation des seuls accordéons et en-tête ; le JSON n'est jamais envoyé ni récupéré à l'exécution.

**Ordre de build**, exprimé en dépendances pnpm pour qu'un `pnpm build` à la racine l'enchaîne : `packages/content` construit et écrit `rgaa/data/` ; `apps/site` copie `rgaa/data/` dans `public/rgaa/data/` en `prebuild` pour que Next serve les fichiers tels quels sous `/rgaa/data/…` ; `next build` écrit `out/` ; Pagefind indexe `out/`. L'application statique Clever Cloud sert `out/` via `CC_WEBROOT`. Que le build tourne dans le hook de build de Clever Cloud ou dans GitHub Actions est un détail du premier spike.

### 3.5 Données publiées

**Décision.** Nouvelle structure reflétant le modèle, en JSON, trois fichiers par Version : `criteres.json`, le modèle complet, imbriqué comme le document (`topics[] > criteria[] > referentiels{} > tests[]`), chaque Critère avec ses champs partagés et sa déclinaison par Référentiel (Tests + annexe) ; `glossaire.json`, chaque Terme avec ses Référentiels ; le **schéma JSON publié** à côté, promesse de compatibilité. Versionnées dans l'URL (`/rgaa/data/5/criteres.json`).

Règles de forme, toutes visibles dans l'exemple de l'annexe C :

- **Clés en anglais**, comme le JSON RGAA 4 que lisent déjà les outils (`topics`, `criteria`, `number`, `title`, `tests`, `particularCases`, `technicalNotes`) et comme les champs du téléservice ; les noms propres du domaine restent tels quels (`referentiels`, `wcag`), et les valeurs sont en français. Le wrapper `criterium` de RGAA 4 disparaît.
- **Numéros complets en chaînes** (`"1.1"`, `"1.1.1"`, `"1.10"`) : chaque objet porte sa propre citation, celle qu'utilisent les auditeurs, les ancres et la recherche ; un test se cite hors de son arbre. RGAA 4 numérotait localement (`number: 1` à chaque niveau) et devait reconstruire `"1.1.1"` dans `methodologies.json`.
- **La dimension Référentiel** n'est pas sur `tests` mais un niveau au-dessus, dans `referentiels`, objet à trois clés fermées (`web`, `mobile`, `bureautique`) ; une clé absente signifie « hors référentiel ». `tests` est toujours un tableau d'objets.
- **Un groupe `appendix`** par déclinaison réunit ce qui étaye le Critère sans être un test : `references`, `techniques`, `particularCases`, `technicalNotes`. Il reflète le fichier source `annexe.md` et se rend en un bloc sur la page.
- **Rien de dérivable, rien de vide.** Pas d'URL par objet : un bloc `urls` en tête donne les gabarits (`/rgaa/{referentiel}/criteres#{number}`, `/rgaa/glossaire#{slug}`). Pas de `null` ni de `[]` : une clé sans valeur est omise, le schéma la déclare optionnelle.
- **Pas de niveau (A / AA) sur le Critère.** RGAA 4 n'en stockait pas ; l'obligation légale ne distingue pas les niveaux et plusieurs Critères couvrent des critères WCAG de niveaux différents. Le niveau reste une propriété des références WCAG (`level`), sauf si les auteurs de RGAA 5 en définissent un par Critère.
- **Liens absolus** dans les textes markdown, produits depuis une URL de base configurée. Exemple en annexe C.

**Où elles vivent.** Deux copies identiques par construction, le générateur étant déterministe :

- **Dans le dépôt, `rgaa/data/`**, régénéré et commité par un workflow à chaque fusion sur `main` (commit du robot de CI). Une PR ne contient jamais de fichiers générés ; une modification manuelle sous `rgaa/data/**` échoue en CI. C'est ce que les outils tiers lisent sur GitHub, avec l'historique et le diff de chaque changement, comme ils lisaient `RGAA/criteres.json`. Les Versions antérieures figées y restent (`rgaa/data/5.0/`), jamais régénérées : le générateur n'écrit que la Version courante.
- **Sur le site, `/rgaa/data/…`**, adresse canonique de téléchargement : le build de `apps/site` régénère depuis `rgaa/content/` dans son export, sans attendre le commit du robot, et copie les Versions figées telles quelles.

_Écarté :_ le hook pre-commit du dépôt RGAA 4, qui ne s'exécutait pas pour les contributeurs éditant depuis le navigateur et laissait le JSON obsolète jusqu'à une régénération manuelle.

**Alternatives écartées.** Reprendre la structure RGAA 4 (aucune place pour le Référentiel, tests en objet indexé par position, bizarreries pérennisées) ; publier deux structures (double surface à maintenir) ; **un fichier par Référentiel** ne contenant que les Critères applicables (retenu un temps : sans objet dès que chaque page affiche la liste complète, la vue par Référentiel se réduit au modèle complet dont on lit une clé ; un tel fichier, aplati avec un indicateur `applicable`, reste générable en quelques heures si un outil tiers le demande) ; `declinaisons` en tableau plutôt qu'en objet (possible, coûte une recherche par identifiant au lieu d'un accès direct, l'ensemble des clés étant fermé) ; liste de Critères à plat avec un numéro de Thématique (schéma plus plat, mais regroupement à refaire côté page et rupture avec le parcours `topics > criteria` que connaissent les outils).

### 3.6 URL, navigation, recherche

- **Une page par Référentiel** présentant la liste complète des Critères en accordéons, ceux qui ne s'appliquent pas marqués par une phrase (« Ne s'applique pas aux applications mobiles »), jamais « Non applicable », ancres `#1.1` et `#1.1.1` avec les **règles de slug du site RGAA 4** (reprises pour que les anciens liens profonds survivent au 301, le navigateur conservant le fragment). Une page d'accueil par Référentiel (`/rgaa/web`) pour l'introduction, l'environnement de test et le téléchargement des données. **Une page de glossaire partagée**. _Écarté :_ une page par Critère (triple les URL, change l'habitude de lecture des auditeurs).
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
- Un fichier par champ de prose dans les dossiers de Référentiel (§ 3.4), à valider.

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

## Annexe B — Pourquoi les sources sont en markdown à frontmatter et non en YAML

Le cadrage proposait un fichier YAML par critère pour les sources, jugé plus lisible et plus sûr que le JSON généré aujourd'hui, avec l'idée qu'aucun cadriciel comme 11ty ne serait plus là pour « formater » le markdown. Deux mises au point, puis la comparaison.

**11ty n'a jamais été le formateur.** Il appelait deux bibliothèques, `front-matter` pour séparer l'en-tête du corps et `markdown-it` pour rendre le corps, puis versait le résultat dans des gabarits Nunjucks. `packages/content` fait la même chose avec `gray-matter` et `markdown-it` (ou `remark`), en versant dans des composants React. Et le YAML ne supprime pas ce rendu : la prose contenue dans un fichier YAML reste du markdown (accents graves autour de `<img>`, liens vers le glossaire), exactement comme dans les chaînes du JSON RGAA 4 ; elle doit donc passer par le même rendu. Le YAML change le contenant de la prose, pas la chaîne d'outils.

**La granularité n'est pas le format.** Un fichier YAML par test est possible ; les conflits de fusion tiennent au découpage, pas au format.

**Comparaison.**

| Dimension                                                   | Markdown à frontmatter                                                                                   | Fichier YAML                                                                                                                         |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Champs structurés (niveau, références, techniques)          | YAML dans le frontmatter, validé par Zod                                                                 | YAML, validé par Zod : identique                                                                                                     |
| Prose (méthodologies, cas particuliers, notes, définitions) | Native : listes numérotées, sous-listes, code et liens écrits comme ils se lisent                        | Scalaires bloc : prose indentée sous `\|`, l'indentation porte le sens, une erreur rattache silencieusement le texte à une autre clé |
| Risques pour un contributeur dans l'éditeur web             | Une ligne de frontmatter fautive fait échouer un fichier avec une erreur claire                          | `1.10` non cité devient 1.1, un `: ` ou un ` #` dans un texte brut casse ou tronque la valeur, règles de citation à connaître        |
| Relecture sur GitHub                                        | Onglet de prévisualisation rendu, diff de prose                                                          | Pas de prévisualisation, diff indenté                                                                                                |
| Plusieurs champs de prose dans un même enregistrement       | Point faible : deux sections de titre à analyser (le générateur RGAA 4 le fait par expression régulière) | Point fort : deux clés, aucune convention                                                                                            |
| Réemploi du matériau RGAA 4                                 | 119 fichiers de glossaire et les corps de méthodologie repris tels quels                                 | Tout convertir                                                                                                                       |

**Décision.** Le RGAA est de la prose à laquelle sont attachés quelques champs étiquetés, pas des enregistrements auxquels est attachée un peu de prose. Le markdown à frontmatter met chaque nature de contenu dans le format fait pour elle, conserve l'habitude des contributeurs et le matériau RGAA 4, et coûte les deux mêmes bibliothèques que le YAML. Le point fort du YAML (plusieurs champs de prose par enregistrement) est absorbé par la règle « un fichier par champ de prose » proposée au § 3.4.

## Annexe C — Exemple de Données publiées (`rgaa/data/5/criteres.json`)

Imbrication du document : `topics[] > criteria[] > referentiels{} > tests[]`, même profondeur que le `topics > criteria > criterium > tests` de RGAA 4. Critère 1.1 applicable à Web et Mobile, Critère 1.2 à Web seulement (aucune clé `mobile` dans ses `referentiels`). Textes en markdown, liens absolus, numéros complets en chaînes, clés vides omises.

```json
{
	"$schema": "https://accessibilite.numerique.gouv.fr/rgaa/data/schema/criteres.schema.json",
	"rgaa": {
		"version": "5.0",
		"date": "2027-01-15"
	},
	"source": "https://github.com/DISIC/teleservice-conformite/tree/main/rgaa/content",
	"urls": {
		"criterion": "https://accessibilite.numerique.gouv.fr/rgaa/{referentiel}/criteres#{number}",
		"test": "https://accessibilite.numerique.gouv.fr/rgaa/{referentiel}/criteres#{number}",
		"term": "https://accessibilite.numerique.gouv.fr/rgaa/glossaire#{slug}"
	},
	"referentiels": [
		{
			"id": "web",
			"title": "Sites web"
		},
		{
			"id": "mobile",
			"title": "Applications mobiles"
		},
		{
			"id": "bureautique",
			"title": "Logiciels bureautiques"
		}
	],
	"topics": [
		{
			"number": "1",
			"title": "Images",
			"criteria": [
				{
					"number": "1.1",
					"title": "Chaque [image porteuse d’information](https://accessibilite.numerique.gouv.fr/rgaa/glossaire#image-porteuse-d-information) a-t-elle une [alternative textuelle](https://accessibilite.numerique.gouv.fr/rgaa/glossaire#alternative-textuelle-image) ?",
					"referentiels": {
						"web": {
							"tests": [
								{
									"number": "1.1.1",
									"title": "Chaque image (balise `<img>` ou balise possédant l’attribut WAI-ARIA `role=\"img\"`) porteuse d’information a-t-elle une alternative textuelle ?",
									"methodology": "1. Retrouver dans le document les images structurées au moyen d’un élément `<img>` …\n2. Pour chaque image, déterminer si l’image est porteuse d’information ;\n3. …"
								},
								{
									"number": "1.1.2",
									"title": "Chaque image vectorielle (balise `<svg>`) porteuse d’information vérifie-t-elle ces conditions ?",
									"conditions": [
										"La balise `<svg>` possède un attribut WAI-ARIA `role=\"img\"` ;",
										"La balise `<svg>` a une alternative textuelle."
									],
									"methodology": "1. …"
								}
							],
							"appendix": {
								"references": [
									{
										"standard": "WCAG 2.2",
										"reference": "1.1.1",
										"title": "Non-text Content",
										"level": "A"
									}
								],
								"techniques": ["H36", "H37", "H53", "F65", "H24"],
								"technicalNotes": "L’attribut `alt` étant la seule technique totalement supportée …"
							}
						},
						"mobile": {
							"tests": [
								{
									"number": "1.1.1",
									"title": "Chaque image porteuse d’information possède-t-elle une description accessible ?",
									"methodology": "1. Parcourir chaque écran avec le lecteur d’écran de la plateforme …"
								}
							],
							"appendix": {
								"references": [
									{
										"standard": "EN 301 549 v3.2.1",
										"reference": "11.1.1.1",
										"title": "Non-text content (open functionality)"
									}
								],
								"particularCases": "Les icônes décoratives …"
							}
						}
					}
				},
				{
					"number": "1.2",
					"title": "Chaque [image de décoration](https://accessibilite.numerique.gouv.fr/rgaa/glossaire#image-de-decoration) est-elle correctement ignorée par les technologies d’assistance ?",
					"referentiels": {
						"web": {
							"tests": ["…"],
							"appendix": {
								"references": ["…"],
								"techniques": ["…"]
							}
						}
					}
				}
			]
		}
	]
}
```

Lecture de l'exemple : un Critère porte deux champs et une carte `referentiels` ; une déclinaison porte deux blocs, `tests` et `appendix`, qui deviennent deux sections de l'accordéon ; l'absence de `referentiels[ref]` est le marqueur « hors référentiel », et une Thématique dont aucun Critère n'a de clé pour le Référentiel affiché est entièrement marquée. Le même `"1.1.1"` peut apparaître sous `web` et `mobile` avec un contenu différent, l'identité d'un Test étant le couple (Référentiel, numéro). `references` est une liste typée (`standard`, `reference`, `title`, `level`) commune aux critères WCAG et aux clauses EN 301 549 ; les méthodologies sont intégrées aux tests, plus de `methodologies.json`. Le glossaire suit le même en-tête puis `terms: [{ "slug", "title", "referentiels", "definition" }]`, `definition` en markdown. Écartés : numéros locaux par niveau (`number: 1`) qui obligent à reconstruire la citation ; clés en français ; niveau par Critère ; URL par objet ; `null` et tableaux vides.
