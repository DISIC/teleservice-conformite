/**
 * Markdown of a published RGAA 5 declaration.
 *
 * {{name}} inserts a value; {{#name}}…{{/name}} keeps its content only when
 * the value is set, {{^name}}…{{/name}} only when it is not.
 *
 * Values: name, serviceKind (« le site »…), ofService (« du site »…), entity,
 * publishedOn, updatedOn, obsoleteNotice, contactForm, contactEmail,
 * arcomUrl, defenseurUrl, delegueUrl, strategyLinks, isRealised, obsolete,
 * obsolescenceYears, conformityBadge, status, version, auditedPages, auditor,
 * auditDate, auditReport, rate, hasNonAccessibleContent, blockingElements,
 * nonCompliantElements, disproportionnedCharge, optionalElements,
 * hasTestDetails, testEnvironments, usedTools.
 */
export const RGAA5_TEMPLATE = `
# Déclaration d’accessibilité pour {{serviceKind}} {{name}}

<p class="fr-text--xs fr-mb-0">Publiée le {{publishedOn}}{{#updatedOn}}<br/>Mise à jour le {{updatedOn}}{{/updatedOn}}</p>

{{obsoleteNotice}}

## Retour d’information et contact

### Contacter le responsable {{ofService}}

Après avoir consulté la page relative à l’accessibilité {{ofService}}, si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter son responsable pour être orienté vers une solution alternative accessible ou obtenir le contenu sous une autre forme :

{{#contactForm}}- **Envoyer un message** {{contactForm}}
{{/contactForm}}{{#contactEmail}}- Contacter {{entity}} {{contactEmail}}
{{/contactEmail}}

## Voies de recours

### Contacter l’Arcom

Pour signaler un défaut de conformité et en l’absence d’une solution alternative accessible, vous pouvez saisir l’Autorité de régulation de la communication audiovisuelle et numérique (ARCOM) :

- **Écrire un message à l’Arcom**<br/>[{{arcomUrl}}]({{arcomUrl}})

- **Envoyer un courrier**<br/>ARCOM<br/>2-10 rue Brahms<br/>75012 Paris

### Contacter le Défenseur des droits

Si vous vous estimez lésé dans vos droits et libertés ou victime de discrimination, vous pouvez saisir le Défenseur des droits :

- **Écrire un message au Défenseur des droits**<br/>[{{defenseurUrl}}]({{defenseurUrl}})

- **Contacter le délégué du Défenseur des droits dans votre région**<br/>[{{delegueUrl}}]({{delegueUrl}})

- **Envoyer un courrier par la Poste**<br/><small>Gratuit, ne pas mettre de timbre</small><br/>Défenseur des droits<br/>Libre réponse 71120<br/>75342 Paris CEDEX 07

## Engagement en matière d’accessibilité numérique

**{{entity}}** s’engage à rendre ses services de communication au public en ligne accessibles conformément à l’article 47 de la loi n° 2005-102 du 11 février 2005.

{{#strategyLinks}}
À cette fin, la stratégie et les actions suivantes ont été planifiées :

{{strategyLinks}}
{{/strategyLinks}}

## État de conformité

{{conformityBadge}}

{{^isRealised}}
**{{name}}** n’a pas fait l’objet d’un audit de conformité et est réputé **non conforme** avec le référentiel général d’amélioration de l’accessibilité.
{{/isRealised}}

{{#isRealised}}
{{#obsolete}}
Conformément à la législation, cette déclaration ayant été publiée il y a plus de {{obsolescenceYears}} ans, **{{name}}** est réputé **non conforme** avec le référentiel général d’amélioration de l’accessibilité version **{{version}}**
{{/obsolete}}
{{^obsolete}}
**{{name}}** est **{{status}}** avec le référentiel général d’amélioration de l’accessibilité version **{{version}}**
{{/obsolete}}

{{#auditedPages}}
## Échantillon audité

Éléments {{ofService}} ayant fait l’objet de la vérification de conformité :

{{auditedPages}}
{{/auditedPages}}

## Résultats des tests

L’audit de conformité réalisé par **{{auditor}}**{{#auditDate}}, le {{auditDate}},{{/auditDate}} révèle que :

- **{{rate}}%** des critères RGAA version **{{version}}** sont respectés.{{#auditReport}}
  - **Rapport de test** {{auditReport}}{{/auditReport}}
{{/isRealised}}

{{#hasNonAccessibleContent}}
## Contenus non accessibles

Les contenus {{ofService}} listés ci-dessous ne sont pas conformes aux exigences d’accessibilité pour les raisons suivantes :

{{#blockingElements}}
### Non-conformités bloquantes

{{blockingElements}}
{{/blockingElements}}

{{#nonCompliantElements}}
### Non-conformités non bloquantes

{{nonCompliantElements}}
{{/nonCompliantElements}}

{{#disproportionnedCharge}}
### Dérogations pour charge disproportionnée

{{disproportionnedCharge}}
{{/disproportionnedCharge}}

{{#optionalElements}}
### Contenus non soumis à l’obligation d’accessibilité

{{optionalElements}}
{{/optionalElements}}
{{/hasNonAccessibleContent}}

{{#hasTestDetails}}
## Technologies utilisées pour la réalisation {{ofService}}

{{#testEnvironments}}
Les tests des pages web ont été effectués avec les combinaisons de logiciels de navigation et lecteurs d’écran suivants :

{{testEnvironments}}
{{/testEnvironments}}

{{#usedTools}}
Les outils suivants ont été utilisés lors de l’évaluation :

{{usedTools}}
{{/usedTools}}
{{/hasTestDetails}}
`;
