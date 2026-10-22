import type { PublishedDeclaration } from "~/domain/declaration/published/snapshot";
import { getConformityStatus } from "~/domain/declaration/conformity";
import {
	OBSOLESCENCE_YEARS,
	obsolescenceOf,
} from "~/domain/declaration/obsolescence";
import {
	CONFORMITY_BADGE_SEVERITY,
	DEFENSEUR_URL,
	DELEGUE_URL,
	appKindOf,
	badge,
	bulletList,
	formatFrDate,
	hasText,
	obsoleteSinceDay,
	rgaaVersionNumber,
	section,
	serviceName,
	serviceSubject,
} from "~/domain/declaration/published/markdownParts";
import { buildRgaa5Markdown } from "~/domain/declaration/published/markdownRgaa5";

export { formatFrDate };

export type PublishedMarkdownOptions = {
	/** Obsolescence is a fact about the reading day, not the snapshot. */
	today: Date;
};

export const publicationLabel = (
	d: Pick<PublishedDeclaration, "firstPublishedAt" | "publishedAt">,
): string =>
	d.publishedAt === d.firstPublishedAt
		? `Publiée le ${formatFrDate(d.publishedAt)}`
		: `Mise à jour : ${formatFrDate(d.publishedAt)}`;

const introduction = (d: PublishedDeclaration): string[] => {
	const entity = `**${d.entityName}**`;
	const schemaLinks = [
		hasText(d.schema.schemaUrl)
			? `**${hasText(d.schema.schemaName) ? d.schema.schemaName : "Schéma pluriannuel de mise en accessibilité"}** : ${d.schema.schemaUrl}`
			: null,
		...d.schema.actionPlanUrls
			.filter((plan) => hasText(plan.url))
			.map(
				(plan) =>
					`**${hasText(plan.name) ? plan.name : "Plan d’actions"}** : ${plan.url}`,
			),
	].filter((line): line is string => line !== null);

	const kind = appKindOf(d.appKindLabel);
	const scope =
		kind && kind !== "other"
			? `Cette déclaration d’accessibilité s’applique au **${d.appKindLabel.toLowerCase()} ${d.url}**`
			: `Cette déclaration d’accessibilité s’applique à **${d.url}**`;

	return [
		`${entity} s’engage à rendre ses sites internet, intranet, extranet et ses progiciels accessibles (et ses applications mobiles et mobilier urbain numérique) conformément à l’article 47 de la loi n°2005-102 du 11 février 2005.`,
		"",
		...(schemaLinks.length > 0
			? [
					`À cette fin, ${entity} met en œuvre la stratégie et les actions suivantes :`,
					"",
					...bulletList(
						schemaLinks.map((line, index) =>
							index < schemaLinks.length - 1 ? `${line} ;` : line,
						),
					),
					"",
				]
			: []),
		scope,
		"",
	];
};

const conformity = (d: PublishedDeclaration, obsolete: boolean): string[] => {
	const subject = `${serviceSubject(d.appKindLabel)} ${serviceName(d)}`;
	const rgaa = `avec le référentiel général d’amélioration de l’accessibilité (RGAA)`;
	const version = `, version ${rgaaVersionNumber(d.audit.rgaa_version)}.`;

	if (!d.audit.isRealised) {
		return section(
			"## État de conformité",
			badge("Non conforme", "error"),
			"",
			`${subject} n’a pas fait l’objet d’un audit de conformité et est réputé **non conforme** ${rgaa}.`,
		);
	}

	const status = getConformityStatus(d.audit.rate, {
		hasBlockingElements: hasText(d.audit.blockingElements),
	});
	const sentence = obsolete
		? `Conformément à la législation, cette déclaration ayant été publiée il y a plus de ${OBSOLESCENCE_YEARS} ans, ${subject.charAt(0).toLowerCase()}${subject.slice(1)} est réputé **non conforme** ${rgaa}${version}`
		: `${subject} est **${status.label.toLowerCase()}** ${rgaa}${version}`;

	return section(
		"## État de conformité",
		obsolete
			? badge("Non conforme", "error")
			: badge(status.label, CONFORMITY_BADGE_SEVERITY[status.label] ?? "info"),
		"",
		sentence,
		"",
		"### Résultats des tests",
		"",
		`L’audit de conformité réalisé par **${d.audit.realised_by}** révèle que **${d.audit.rate}%** des critères du **RGAA version ${rgaaVersionNumber(d.audit.rgaa_version)}** sont respectés.`,
	);
};

const nonAccessibleContent = (d: PublishedDeclaration): string[] => {
	if (!d.audit.isRealised) return [];
	const parts = [
		["### Éléments bloquants", d.audit.blockingElements],
		["### Non-conformités", d.audit.nonCompliantElements],
		[
			"### Dérogations pour charge disproportionnée",
			d.audit.disproportionnedCharge,
		],
		[
			"### Contenus non soumis à l’obligation d’accessibilité",
			d.audit.optionalElements,
		],
	].filter((part): part is [string, string] => hasText(part[1]));

	if (parts.length === 0) return [];
	return section(
		"## Contenus non accessibles",
		...parts.flatMap(([heading, text]) => [heading, "", text.trim(), ""]),
	);
};

const establishment = (
	d: PublishedDeclaration,
	obsolete: boolean,
): string[] => {
	const established = `Cette déclaration a été établie le **${formatFrDate(d.firstPublishedAt)}**.`;
	const dates = obsolete
		? `${established} Elle est obsolète depuis le **${formatFrDate(obsoleteSinceDay(d.publishedAt))}**.`
		: d.publishedAt !== d.firstPublishedAt
			? `${established} Elle a été mise à jour le **${formatFrDate(d.publishedAt)}**.`
			: established;

	const auditDetails = d.audit.isRealised
		? [
				...(d.audit.testEnvironments.length > 0
					? [
							"### Environnement de test",
							"",
							"Les vérifications de restitution de contenus ont été réalisées sur la base de la combinaison fournie par la base de référence du RGAA, avec les versions suivantes :",
							"",
							...bulletList(d.audit.testEnvironments),
							"",
						]
					: []),
				...(d.audit.usedTools.length > 0
					? [
							"### Outils pour évaluer l’accessibilité",
							"",
							...bulletList(d.audit.usedTools),
							"",
						]
					: []),
				...(hasText(d.audit.compliantElements)
					? [
							"### Pages du site ayant fait l’objet de la vérification de conformité",
							"",
							d.audit.compliantElements.trim(),
							"",
						]
					: []),
			]
		: [];

	return [
		"## Établissement de cette déclaration d’accessibilité",
		"",
		dates,
		"",
		...auditDetails,
	];
};

const feedbackAndContact = (d: PublishedDeclaration): string[] => {
	const channels = [
		hasText(d.contact.url)
			? `Envoyer un message sur le formulaire : ${d.contact.url}`
			: null,
		hasText(d.contact.email)
			? `Contacter le responsable de l’accessibilité : ${d.contact.email}`
			: null,
	].filter((line): line is string => line !== null);

	return [
		"## Retour d’information et contact",
		"",
		`Si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable de ${d.name} pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme.`,
		"",
		...(channels.length > 0
			? [
					...bulletList(
						channels.map((line, index) =>
							index < channels.length - 1 ? `${line} ;` : line,
						),
					),
					"",
				]
			: []),
		"### Voies de recours",
		"",
		"Si vous constatez un défaut d’accessibilité vous empêchant d’accéder à un contenu ou une fonctionnalité du site, que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes en droit de faire parvenir vos doléances ou une demande de saisine au Défenseur des droits.",
		"",
		"Plusieurs moyens sont à votre disposition :",
		"",
		`- Écrire un message au [Défenseur des droits](${DEFENSEUR_URL})`,
		`- Contacter le [délégué](${DELEGUE_URL}) du Défenseur des droits dans votre région`,
		"- Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre) :<br/>Défenseur des droits<br/>Libre réponse 71120<br/>75342 Paris CEDEX 07",
	];
};

const rgaa4Sections = (
	d: PublishedDeclaration,
	obsolete: boolean,
): string[] => [
	...introduction(d),
	...conformity(d, obsolete),
	...nonAccessibleContent(d),
	...establishment(d, obsolete),
	...feedbackAndContact(d),
];

export const OBSOLETE_NOTICE_CLASS = "declaration-obsolete";

const obsoleteNotice = () =>
	[
		`<div class="${OBSOLETE_NOTICE_CLASS}">`,
		badge("Obsolète", "error"),
		'<p class="fr-h6">Cette déclaration est obsolète.</p>',
		`<p>Cette déclaration a été publiée il y a plus de ${OBSOLESCENCE_YEARS} ans. Conformément à la législation, elle doit être actualisée et publiée à nouveau.</p>`,
		"</div>",
	].join("\n");

export function buildPublishedMarkdown(
	declaration: PublishedDeclaration,
	{ today }: PublishedMarkdownOptions,
): string {
	const obsolete =
		hasText(declaration.publishedAt) &&
		obsolescenceOf(new Date(declaration.publishedAt), today) === "obsolete";

	const lines =
		declaration.audit.rgaa_version === "RGAA 5"
			? [
					buildRgaa5Markdown(declaration, {
						obsolete,
						obsoleteNotice: obsolete ? obsoleteNotice() : "",
					}),
				]
			: [
					`# ${declaration.name}`,
					"",
					...(obsolete ? [obsoleteNotice(), ""] : []),
					...rgaa4Sections(declaration, obsolete),
				];

	return lines
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.trimEnd()
		.concat("\n");
}
