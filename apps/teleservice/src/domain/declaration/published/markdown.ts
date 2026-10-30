import { appKindOptions } from "~/payload/selectOptions";
import type { PublishedDeclaration } from "~/domain/declaration/published/snapshot";
import { getConformityStatus } from "~/domain/declaration/conformity";
import {
	OBSOLESCENCE_YEARS,
	obsolescenceOf,
	obsoleteSince,
} from "~/domain/declaration/obsolescence";

/** Snapshot dates are calendar dates (YYYY-MM-DD), as the Zod contract enforces. */
type IsoDate = string;

export type PublishedMarkdownOptions = {
	/** Obsolescence is a fact about the reading day, not the snapshot. */
	today: Date;
};

const DEFENSEUR_URL =
	"https://formulaire.defenseurdesdroits.fr/formulaire_saisine/";
const DELEGUE_URL = "https://www.defenseurdesdroits.fr/saisir/delegues";

export const formatFrDate = (date: IsoDate): string => {
	const [year, month, day] = date.split("-");
	return `${day}/${month}/${year}`;
};

const obsoleteSinceDay = (publishedAt: IsoDate): IsoDate =>
	obsoleteSince(new Date(publishedAt)).toISOString().slice(0, 10);

export const publicationLabel = (
	d: Pick<PublishedDeclaration, "firstPublishedAt" | "publishedAt">,
): string =>
	d.publishedAt === d.firstPublishedAt
		? `Publiée le ${formatFrDate(d.publishedAt)}`
		: `Mise à jour : ${formatFrDate(d.publishedAt)}`;

const hasText = (value: string | null | undefined): value is string =>
	!!value && value.trim().length > 0;

const badge = (label: string, severity: "success" | "info" | "error") =>
	`<p class="fr-badge fr-badge--${severity} fr-badge--sm fr-badge--no-icon">${label}</p>`;

const CONFORMITY_BADGE_SEVERITY: Record<string, "success" | "info" | "error"> =
	{
		Conforme: "success",
		"Partiellement conforme": "info",
		"Non conforme": "error",
	};

const serviceSubject = (appKindLabel: PublishedDeclaration["appKindLabel"]) => {
	const kind = appKindOptions.find((o) => o.label === appKindLabel)?.value;
	switch (kind) {
		case "website":
			return "Le site";
		case "mobile_app":
			return "L’application mobile";
		default:
			return "Le service";
	}
};

const lowerFirst = (text: string) =>
	`${text.charAt(0).toLowerCase()}${text.slice(1)}`;

const rgaaVersionNumber = (label: string) => label.replace(/^RGAA\s*/, "");

const bulletList = (items: string[]) => items.map((item) => `- ${item}`);

const escapeLinkText = (text: string) => text.replace(/[\\[\]]/g, "\\$&");

// Declarations saved before URL validation may hold a bare host like "www.site.gouv.fr".
const absoluteUrl = (url: string) =>
	/^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`;

const linkDestination = (url: string) =>
	/[\s()<>]/.test(url)
		? `<${url.replace(/[<>\s]/g, (char) => encodeURIComponent(char))}>`
		: url;

const link = (label: string, url: string) =>
	`[${escapeLinkText(label)}](${linkDestination(absoluteUrl(url.trim()))})`;

const section = (heading: string, ...lines: (string | null)[]) => [
	heading,
	"",
	...lines.filter((line): line is string => line !== null),
	"",
];

const introduction = (d: PublishedDeclaration): string[] => {
	const entity = `**${d.entityName}**`;
	const schemaLinks = [
		hasText(d.schema.schemaUrl)
			? `**${link(hasText(d.schema.schemaName) ? d.schema.schemaName : "Schéma pluriannuel de mise en accessibilité", d.schema.schemaUrl)}**`
			: null,
		...d.schema.actionPlanUrls
			.filter((plan) => hasText(plan.url))
			.map(
				(plan) =>
					`**${link(hasText(plan.name) ? plan.name : "Plan d’actions", plan.url)}**`,
			),
	].filter((line): line is string => line !== null);

	const kind = appKindOptions.find((o) => o.label === d.appKindLabel)?.value;
	const service = hasText(d.url) ? link(d.name, d.url) : d.name;
	const scope =
		kind === "website"
			? `Cette déclaration d’accessibilité s’applique au **site web ${service}**`
			: kind === "mobile_app"
				? `Cette déclaration d’accessibilité s’applique à **l’application mobile ${service}**`
				: `Cette déclaration d’accessibilité s’applique à **${service}**`;

	return [
		`${entity} s’engage à rendre ses sites internet, intranet, extranet et ses progiciels accessibles (et ses applications mobiles et mobilier urbain numérique) conformément à l’article 47 de la loi n°2005-102 du 11 février 2005.`,
		"",
		...(schemaLinks.length > 0
			? [
					`À cette fin, ${entity} met en œuvre la stratégie et les actions suivantes :`,
					"",
					...bulletList(schemaLinks),
					"",
				]
			: []),
		scope,
		"",
	];
};

const conformity = (d: PublishedDeclaration, obsolete: boolean): string[] => {
	const subject = `${serviceSubject(d.appKindLabel)} **${d.name}**`;
	const rgaa = `avec le référentiel général d’amélioration de l’accessibilité (RGAA)`;
	const version = `, version ${rgaaVersionNumber(d.audit.rgaa_version)}.`;
	const rgaaWithVersion = `avec le référentiel général d’amélioration de l’accessibilité version ${rgaaVersionNumber(d.audit.rgaa_version)}`;

	if (!d.audit.isRealised) {
		return section(
			"## État de conformité",
			badge("Non conforme", "error"),
			"",
			`${subject} n’a pas fait l’objet d’un audit de conformité et est réputé **non conforme** ${rgaa}.`,
			"",
			"### Résultats des tests",
			"",
			`En l’absence d’audit, ${lowerFirst(subject)} est **non conforme** ${rgaa}.`,
		);
	}

	// A blocking element makes the service non-conformant whatever its rate.
	const status = hasText(d.audit.blockingElements)
		? getConformityStatus(0)
		: getConformityStatus(d.audit.rate);
	const sentence = obsolete
		? `Conformément à la législation, cette déclaration ayant été publiée il y a plus de ${OBSOLESCENCE_YEARS} ans, ${lowerFirst(subject)} est réputé **non conforme** ${rgaa}${version}`
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
		status.label === "Non conforme"
			? `${subject} est **non conforme** ${rgaaWithVersion}.`
			: `L’audit de conformité réalisé par **${d.audit.realised_by}** révèle que **${d.audit.rate}%** des critères du **RGAA version ${rgaaVersionNumber(d.audit.rgaa_version)}** sont respectés.`,
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

	return [
		`# Déclaration d’accessibilité de ${declaration.name}`,
		"",
		...(obsolete ? [obsoleteNotice(), ""] : []),
		...introduction(declaration),
		...conformity(declaration, obsolete),
		...nonAccessibleContent(declaration),
		...establishment(declaration, obsolete),
		...feedbackAndContact(declaration),
	]
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.trimEnd()
		.concat("\n");
}
