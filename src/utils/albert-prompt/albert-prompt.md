Analyse le contenu HTML et extrait le service (url et type), le taux d'accessibilité numérique, la date de publication, la liste des pages auditées, l'entité responsable, la version RGAA, les environnements de test, les outils utilises, les environnements de test, les outils utilisés, les contenus non conformes, les dérogations pour charge disproportionnée, les contenus non soumis à l’obligation d’accessibilité ET les informations de contact.

RÈGLES POUR LE SERVICE :
1. Cherche une section avec les mots-clés : "État de conformité", si tu trouves une URL dans cette section, extrais-la.
2. Si tu trouve une phrase comme "Cette déclaration d’accessibilité s’applique au [type de service] [URL du service]", extrais l'URL et le type de service.
3. Si tu trouves une phrase comme "[nom du service] https://handicap.gouv.fr/ est partiellement conforme avec le référentiel général d’amélioration de l’accessibilité (RGAA)." ou "Le site [nom du service] est en conformité partielle avec le RGAA version 4.", extrais le nom du service [nom du service].
4. Retourne le format suivant: service = { name: "Handicap.gouv.fr", url: "https://url.du.service", type: "site" } ou service = { name: "Handicap.gouv.fr", url: "https://url.du.service", type: null } ou service = { name: "Handicap.gouv.fr", url: null, type: "site" }
5. Si tu trouves une phrase comme "Le site [URL du service] est en conformité partielle avec le RGAA version 4.", extrais l'URL.
6. Si aucune URL n'est trouvée → service = { name: null, url: null, type: null }

RÈGLES POUR LE TAUX :
1. Si tu trouves "Accessibilité : totalement conforme" → taux = "100%"
2. Si tu trouves un pourcentage explicite (exemple: "83,08 % des critères" ou "83.08%") → utilise le pourcentage exact
3. Si tu trouves "non conforme" → taux = "0%"
4. Si rien n'est trouvé → taux = null

RÈGLES POUR LA DATE DE PUBLICATION :
1. Cherche des phrases comme "Établie le [date]", "Cette déclaration a été établie le [date]", "Publiée le [date]"
2. La date peut être au format "JJ/MM/AAAA" (ex: 17/11/2025) ou "JJ mois AAAA" (ex: 9 octobre 2024)
3. Convertis TOUJOURS la date au format "DD/MM/YYYY" (ex: 09/10/2024)
4. Si aucune date n'est trouvée → publishedAt = null

RÈGLES POUR LE NOM DE LA SOCIÉTÉ AYANT RÉALISÉ L'AUDIT :
1. Cherche des phrases comme "L’audit de conformité réalisé par [nom] révèle que 94% des critères du RGAA version 4.1.2 sont respectés."
2. Extrait le nom de la société (ex: "Access Ethics", "Access42", etc.)
3. Retourne le format auditRealizedBy = "[nom]"
4. Si rien n'est trouvé → auditRealizedBy = null

RÈGLES POUR LA VERSION RGAA :
1. Cherche des phrases comme "conformité au RGAA version [numéro]" ou "RGAA version [numéro]"
2. Extrait le numéro de version (ex: "4.1", "4.0", "3.0", etc.)
3. Retourne le format rgaaVersion = "[numéro]"
4. Si rien n'est trouvé → rgaaVersion = null

RÈGLES POUR LES PAGES AUDITÉES :
1. Cherche une section avec les mots-clés : "Échantillon", "Pages auditées", "Pages testées", "Liste des pages"
2. Extrait la liste des pages/URLs qui ont été auditées (souvent dans une liste <ul> ou <ol>)
3. Pour chaque page, utilise le format :
   - Si une URL est associée : "Nom de la page - https://url.complete"
   - Si pas d'URL : juste "Nom de la page"
4. Exemples de format attendu :
   - "- Accueil - https://monservice.gouv.fr/"
   - "- Page contact - https://monservice.gouv.fr/contact"
   - "- Mentions légales" (si pas d'URL)
5. Si aucune liste de pages n'est trouvée → auditedPages = []

RÈGLES POUR L'ENTITÉ RESPONSABLE :
1. Cherche le pattern "[Entité] s'engage à rendre son/ses/leur [service/site/sites]"
2. Extrait le nom complet de l'entité AVANT "s'engage"
3. Garde les articles (Le, La, L', Les) dans le nom
4. Exemples:
   - "Le ministère de la Culture s'engage..." → "Le ministère de la Culture"
   - "La DINUM s'engage..." → "La DINUM"
   - "L'Agence Nationale de la Cohésion des Territoires s'engage..." → "L'Agence Nationale de la Cohésion des Territoires"
5. Si non trouvé → responsibleEntity = null

RÈGLES POUR LES ENVIRONNEMENTS DE TEST :
1. Cherche une section avec les mots-clés : "Environnements de test", "Agents utilisateurs, technologies d'assistance et outils utilisés pour vérifier l'accessibilité"
2. Extrait la liste des environnements mentionnés (souvent présentées en liste <ul> ou <ol> ou séparées par des espaces/virgules souvent precedees par des phrases comme "Les vérifications de restitution de contenus ont été réalisées sur la base de la combinaison fournie par la base de référence du RGAA, avec les versions suivantes :" ou "Les vérifications de restitution de contenus ont été réalisées avec les configurations suivantes :", "Les tests des pages web ont été effectués avec les combinaisons de navigateurs web et lecteurs d’écran suivants :")
3. Exemples de formats trouvés :
  - "Environnement de test
      Les vérifications de restitution de contenus ont été réalisées sur la base de la combinaison fournie par la base de référence du RGAA, avec les versions suivantes :
        Sur Mobile iOS avec Safari et VoiceOver
        Sur Ordinateur MacOS avec Safari et VoiceOver
        Sur Ordinateur Windows avec Firefox et JAWS
        Sur Ordinateur Windows avec Firefox et NVDA"
4. Retourne chaque environnement comme un élément séparé dans le tableau
5. Si aucune technologie n'est trouvée → testEnvironments = []

RÈGLES POUR LES OUTILS UTILISÉS :
1. Cherche une section avec les mots-clés : "Outils pour évaluer l’accessibilité", "Agents utilisateurs, technologies d'assistance et outils utilisés pour vérifier l'accessibilité"
2. Extrait la liste des outils mentionnés (souvent présentées en liste <ul> ou <ol> ou séparées par des espaces/virgules souvent precedees par des phrases comme "La vérification de l’accessibilité est le résultat de tests manuels, assistés par des outils", "Les outils de vérification du code suivants ont été utilisés afin de vérifier la conformité aux tests du RGAA :", "La vérification de l’accessibilité est le résultat de tests manuels, assistés par des outils")
3. Exemples de formats trouvés :
  - "Les outils de vérification du code suivants ont été utilisés afin de vérifier la conformité aux tests du RGAA :
    Colour Contrast Analyser ;
    Extension « Web Developer » ;
    Extension « Assistant RGAA » ;
    Extension « WCAG Contrast checker » ;
    Extension « ARC Toolkit » ;
    Extension « HeadingsMap » ;
    Outils pour développeurs intégrés au navigateur Firefox ;
    Validateur HTML du W3C";"
 - "La vérification de l’accessibilité est le résultat de tests manuels, assistés par des outils (feuilles CSS dédiés, extensions HeadingsMaps et WebDeveloper Toolbar, Color Contrast Analyser)."
4. Retourne chaque outil comme un élément séparé dans le tableau (chaque outil en <li> ou séparé par des points-virgules ou des retours à la ligne est un outil différent)
5. Si aucune technologie n'est trouvée → usedTools = []

RÈGLES POUR LE CONTACT :
1. Cherche une section avec les mots-clés : "Nous contacter pour l'accessibilité", "Retour d’information et contact", "Contact".
2. Extrait l'email de contact ou l'URL de contact si disponible
3. Si mail et url trouvé → contact = { email: "exemple@contact.fr", url: "https://contact.fr" }
4. Si mail ou url trouvé → contact = { email: null, url: "https://contact.fr" } ou { email: "example@contact.fr", url: null }
5. Si aucun contact n'est trouvé → contact = { email: null, url: null }

RÈGLES POUR LES NON-CONFORMITÉS :
1. Cherche une section avec les mots-clés : "Non-conformités", "Éléments non conformes", "Problèmes d'accessibilité", "Contenus inaccessibles"
2. Extrait toute la liste des elements dans cette section mentionnées (souvent présentées en liste <ul> ou <ol> ou séparées par des espaces/virgules)
3. Concatene la liste en paragraphe en séparant chaque element de la liste par un saut de ligne si possible et ajoute des tirets si les elements sont en liste ou entre <li></li>
4. Retourne le format attendu:
  - "Liste non exhaustive des erreurs remontées lors de l'audit
      - Des images décoratives ne sont pas ignorées, notamment sur la page d’actualité, impact mineur ;
      - Certains liens ont un nom accessible qui ne reprend pas toujours l’intitulé visible du lien, impact mineur ;
      - Les messages de statut ne sont pas toujours restitués ;
      - Un fichier PDF possède quelques erreurs d’accessibilité au niveau des contrastes, impact mineur ; "
  - "Ne sont listées ici que les non-conformités jugées les plus impactantes et présentes en quantités importantes dans les pages de l’échantillon. Sur demande, le résultat complet de l’audit peut être mis à disposition.
      - certaines images décoratives ne sont pas ignorées par les technologies d’assistance
      -certains médias n’ont pas de transcription textuelle
      - certains liens ont des intitulés qui ne sont pas assez explicites
      - certains contrastes ne sont pas suffisant
      - certains composants riches ou Javascript ne sont pas compatibles avec les technologies d’assistance
      - certains changements de contexte ont lieu sans que l’utilisateur n’en soit averti
      - certaines balises sont utilisées uniquement à des fins de présentation
      - certains titres ne sont pas correctement implémentés
      - certaines listes ne sont pas correctement implémentées
      - certains champs de formulaire ne sont pas correctement implémentés
      - l’ordre de tabulation n’est pas toujours cohérent"
4. Si aucune non-conformité n'est trouvée → nonCompliantElements = ""

RÈGLES POUR LES DÉROGATIONS POUR CHARGE DISPROPORTIONNÉE :
1. Cherche une section avec les mots-clés : "Dérogations pour charge disproportionnée", "Charge disproportionnée"
2. Extrait la liste des dérogations mentionnées (souvent présentées en liste <ul> ou <ol> ou séparées par des espaces/virgules)
3. Concatene la liste en paragraphe en séparant chaque element de la liste par un saut de ligne si possible et ajoute des tirets si les elements sont en liste ou entre <li></li>
4. Si aucune dérogation n'est trouvée → disproportionnedCharge = ""

RÈGLES POUR LES CONTENUES NON SOUMIS À L’OBLIGATION D’ACCESSIBILITÉ :
1. Cherche une section avec les mots-clés : "Contenus non soumis à l’obligation d’accessibilité", "Contenus non accessibles"
2. Extrait la liste des contenus mentionnées (souvent présentées en liste <ul> ou <ol> ou séparées par des espaces/virgules)
3. Concatene la liste en paragraphe en séparant chaque element de la liste par un saut de ligne si possible et ajoute des tirets si les elements sont en liste ou entre <li></li>
4. Si aucun contenu n'est trouvé → optionalElements = ""

RÈGLES POUR SCHEMA ET PLAN :
1. Si tu trouves une phrase comme "schéma pluriannuel et le plan annuel d'accessibilité 2024 de France Titres" ou "À cette fin, ils mettent en œuvre la stratégie et les actions du schéma pluriannuel d'accessibilité numérique 2025-2028 et plan d’actions.",
extraits l'url du schéma pluriannuel et du plan annuel d'accessibilité si disponible.
2. Retourne le format suivant: schema = { currentYearSchemaUrl: "https://url.du.schema" }
3. Si rien n'est trouvé → schema = { currentYearSchemaUrl: null }

RÈGLES POUR LES TECHNOLOGIES :
1. Cherche une section avec les mots-clés : "Technologies utilisées", "Technologies", "Technologie utilisée", "Technologies employées", "Technologies mises en œuvre"
2. Extrait la liste des technologies mentionnées (souvent présentées en liste ou séparées par des espaces/virgules)
3. Technologies courantes à rechercher : HTML5, HTML, CSS, JavaScript, SVG, PHP, React, Vue.js, Angular, Bootstrap, jQuery, etc.
4. Exemples de formats trouvés :
   - "Technologies utilisées pour la réalisation du site HTML5 SVG CSS JavaScript"
   - "Technologies : HTML5, CSS3, JavaScript"
   - Liste à puces avec chaque technologie
5. Retourne chaque technologie comme un élément séparé dans le tableau
6. Si aucune technologie n'est trouvée → technologies = []
7. Limite à 15 technologies maximum

Exemples de réponses attendues :
- {
    "service": { name: "nom du service", url: "https://url.du.service", type: "Site" },
    "taux": "100%",
    "publishedAt": "09/10/2024",
    "rgaaVersion": "4.1"
    "auditRealizedBy": "Access Ethics",
    "auditedPages": ["Accueil - https://site.gouv.fr/"],
    "responsibleEntity": "Le ministère de la Culture",
    "technologies": ["HTML5", "CSS", "JavaScript"],
    "testEnvironments": ["Sur Mobile iOS avec Safari et VoiceOver", "Sur Ordinateur MacOS avec Safari et VoiceOver", "Sur Ordinateur Windows avec Firefox et JAWS", "Sur Ordinateur Windows avec Firefox et NVDA"],
    "usedTools": ["feuilles CSS dédiés", "HeadingsMaps", "WebDeveloper Toolbar", "Color Contrast Analyser"],
    "nonCompliantElements": "",
    "disproportionnedCharge": "",
    "optionalElements": "",
    "contact": { "email": "exemple@contact.fr", "url": "https://contact.fr" },
    "schema": { "currentYearSchemaUrl": "https://url.du.schema" }
  }
- {
    "service": { name: "nom du service", url: "https://url.du.service", type: null },
    "taux": "83.08%",
    "publishedAt": "17/11/2025",
    "rgaaVersion": null,
    "auditRealizedBy": "Access42",
    "auditedPages": [],
    "responsibleEntity": "La DINUM",
    "technologies": [],
    "testEnvironments": ["Sur Mobile iOS avec Safari et VoiceOver", "Sur Ordinateur MacOS avec Safari et VoiceOver", "Sur Ordinateur Windows avec Firefox et JAWS", "Sur Ordinateur Windows avec Firefox et NVDA"],
    "usedTools": [],
    "nonCompliantElements": "Liste des non-conformités...",
    "disproportionnedCharge": "Liste des dérogations...",
    "optionalElements": "Liste des contenus...",
    "contact": { "email": "exemple@contact.fr", "url": "" },
    "schema": { "currentYearSchemaUrl": null }
  }
- {
    "service": { name: null, url: null, type: null },
    "taux": null,
    "publishedAt": null,
    "rgaaVersion": null,
    "auditRealizedBy": null,
    "auditedPages": [],
    "responsibleEntity": null,
    "technologies": [],
    "testEnvironments": [],
    "usedTools": [],
    "nonCompliantElements": "",
    "disproportionnedCharge": "",
    "optionalElements": "",
    "contact": { "email": null, "url": null },
    "schema": { "currentYearSchemaUrl": null }
  } si rien n'est trouvé

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.