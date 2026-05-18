import DeclarationMarkdownToJsx from "~/components/declaration/DeclarationMarkdownToJsx";
import type { PublishedDeclaration } from "~/utils/declaration-content";
import { getConformityStatus } from "~/utils/declaration-helper";

export { extractDeclarationContentToPublish } from "~/utils/declaration-content";

export default function PublishedDeclarationTemplate({
	declaration,
	mode = "published",
}: {
	declaration: PublishedDeclaration;
	mode?: "preview" | "published";
}) {
	const hasSchemaUrl = declaration.schema.schemaUrl.trim().length > 0;
	const actionPlanUrls = declaration.schema.actionPlanUrls.filter(
		(item) => item.url.trim().length > 0,
	);
	const showSchemaLinks = hasSchemaUrl || actionPlanUrls.length > 0;

	const actionPlanLinks = showSchemaLinks
		? [
				`À cette fin, ${declaration.entityName} met en œuvre la stratégie et les actions suivantes :`,
				"",
				...(hasSchemaUrl
					? [
							`- Lien URL du schéma pluriannuel : ${declaration.schema.schemaUrl};`,
							"",
						]
					: []),
				...actionPlanUrls.map(
					(item) => `- Lien URL d'un plan d'actions : ${item.url};`,
				),
				actionPlanUrls.length > 0 ? "" : null,
			].filter((line): line is string => line !== null)
		: [];
	const hasNonConformites =
		!!declaration.audit.nonCompliantElements &&
		declaration.audit.nonCompliantElements.trim().length > 0;
	const hasDisproportionnedCharge =
		!!declaration.audit.disproportionnedCharge &&
		declaration.audit.disproportionnedCharge.trim().length > 0;
	const hasOptionalElements =
		!!declaration.audit.optionalElements &&
		declaration.audit.optionalElements.trim().length > 0;
	const hasAnyNonAccessible =
		hasNonConformites || hasDisproportionnedCharge || hasOptionalElements;

	const nonAccessibleParts = hasAnyNonAccessible
		? [
				"## Contenus non accessibles",
				"Les contenus listés ci-dessous ne sont pas accessibles pour les raisons suivantes.",
				"",
				...(hasNonConformites
					? [
							"### Non-conformités",
							`${declaration.audit.nonCompliantElements}`,
							"",
						]
					: []),
				...(hasDisproportionnedCharge
					? [
							"### Dérogations pour charge disproportionnée",
							`${declaration.audit.disproportionnedCharge}`,
							"",
						]
					: []),
				...(hasOptionalElements
					? [
							"### Contenus non soumis à l’obligation d’accessibilité",
							`${declaration.audit.optionalElements}`,
							"",
						]
					: []),
			]
		: [];

	const hasTechnologies =
		Array.isArray(declaration.audit.technologies) &&
		declaration.audit.technologies.length > 0;

	const technologiesSection = hasTechnologies
		? [
				"### Technologies utilisées pour la réalisation du site",
				`${declaration.audit.technologies
					.map((tech) => `- ${tech.name}`)
					.join("\n")}`,
				"",
			]
		: [];

	const hasTestEnvironments =
		Array.isArray(declaration.audit.testEnvironments) &&
		declaration.audit.testEnvironments.length > 0;

	const testEnvironmentsSection = hasTestEnvironments
		? [
				"#### Environnement de test",
				"Agents utilisateurs, technologies d’assistance et outils utilisés pour vérifier l’accessibilité",
				`${declaration.audit.testEnvironments.map((env) => `- ${env}`).join("\n")}`,
				"",
			]
		: [];

	const hasUsedTools =
		Array.isArray(declaration.audit.usedTools) &&
		declaration.audit.usedTools.length > 0;

	const usedToolsSection = hasUsedTools
		? [
				"#### Outils pour évaluer l’accessibilité",
				`${declaration.audit.usedTools.map((tool) => `- ${tool}`).join("\n")}`,
				"",
			]
		: [];

	const hasCompliantElements =
		!!declaration.audit.compliantElements &&
		declaration.audit.compliantElements.trim().length > 0;

	const compliantElementsSection = hasCompliantElements
		? [
				"#### Pages du site ayant fait l’objet de la vérification de conformité",
				`${declaration.audit.compliantElements}`,
				"",
			]
		: [];

	const previewMd = [
		"# Déclaration d’accessibilité",
		"",
		`## ${declaration.name}`,
		`${declaration.entityName} s’engage à rendre ses sites internet, intranet, extranet et ses progiciels accessibles (et ses applications mobiles et mobilier urbain numérique) conformément à  l’article 47 de la loi n°2005-102 du 11 février 2005.`,
		...actionPlanLinks,
		`Cette déclaration d’accessibilité s’applique au ${declaration.appKindLabel} ${declaration.url}`,
		"",
		"### État de conformité",
		`${declaration.entityName} ${declaration.url} est ${getConformityStatus(declaration.audit.rate).label.toLowerCase()} avec le référentiel général d’amélioration de l’accessibilité  (RGAA), version ${declaration.audit.rgaa_version} en raison des non-conformités et des dérogations  énumérées ci-dessous.`,
		"",
		"### Résultats des tests",
		`L’audit de conformité réalisé par ${declaration.audit.realised_by} révèle que ${declaration.audit.rate}% des critères de la version ${declaration.audit.rgaa_version} sont respectés `,
		"",
		...nonAccessibleParts,
		"### Établissement de cette déclaration d’accessibilité",
		`Cette déclaration a été établie le ${new Date().toLocaleDateString("fr-FR")}. Elle a été mise à jour le ${new Date().toLocaleDateString("fr-FR")}.`,
		"",
		...technologiesSection,
		...testEnvironmentsSection,
		...usedToolsSection,
		...compliantElementsSection,
		"### Retour d’information et contact",
		"Si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable de Impôts particulier pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme.",
		`${declaration.contact.url ? `- Envoyer un message sur le formulaire : ${declaration.contact.url}` : ""}`,
		"",
		`${declaration.contact.email ? `- Contacter le responsable de l’accessibilité : ${declaration.contact.email}` : ""}`,
		"",
		"### Voies de recours",
		"Si vous constatez un défaut d’accessibilité vous empêchant d’accéder à un contenu ou une fonctionnalité du site, que vous nous le signalez et  que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes  en droit de faire parvenir vos doléances ou une demande de saisine au  Défenseur des droits.",
		"Plusieurs moyens sont à votre disposition:",
		"- Écrire un message au [Défenseur des droits](https://formulaire.defenseurdesdroits.fr/formulaire_saisine/)",
		"- Contacter le délégué du [Défenseur des droits dans votre région](https://www.defenseurdesdroits.fr/saisir/delegues)",
		"- Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre):<br/>Défenseur des droits<br/>Libre réponse 71120<br/>75342 Paris CEDEX 07",
	].join("\n");

	return <DeclarationMarkdownToJsx content={previewMd} mode={mode} />;
}
