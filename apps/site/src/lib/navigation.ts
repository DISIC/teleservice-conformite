import { getReferentielStyle } from "~/components/rgaa/referentiels";
import { getAllReferentiels } from "~/lib/rgaa-data";

export type NavLink = { text: string; href: string; description: string };
export type NavEntry =
	| NavLink
	| { text: string; href: string; description?: string; links: NavLink[] };

const PLACEHOLDER_DESCRIPTION =
	"Ici un texte décrivant le fait que le RGAA s’appuie désormais sur 3 référentiels  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. ";

export const METHODE_LINKS: NavLink[] = [
	{
		text: "Introduction",
		href: "/methode/introduction",
		description: PLACEHOLDER_DESCRIPTION,
	},
	...getAllReferentiels().map(({ id, title, description }) => ({
		text: title,
		href: getReferentielStyle(id).href,
		description,
	})),
];

export const RESSOURCES_LINKS: NavLink[] = [
	{
		text: "Documents de référence",
		href: "#",
		description: PLACEHOLDER_DESCRIPTION,
	},
	{ text: "Critères AAA", href: "#", description: PLACEHOLDER_DESCRIPTION },
	{
		text: "Ara - Outil d’audit d’accessibilité",
		href: "/ara",
		description:
			"Ara est l’outil développé par la direction interministérielle du numérique (DINUM) pour réaliser des audits de conformité au Référentiel Général d’Amélioration de l’Accessibilité (RGAA).",
	},
	{
		text: "Modèles à télécharger",
		href: "/modeles",
		description:
			"La partie «Évaluation de la conformité à la norme» du RGAA contient les instructions pour mener à bien l’audit d’un site internet, intranet ou extranet (échantillonnage des pages, critères applicables, taux de conformité…). Voici en complément, des modèles de documents pour réaliser un audit.",
	},
	{
		text: "Note de révision du RGAA 4.12 vers le RGAA 5",
		href: "/notes",
		description:
			"Cette édition comporte les apportés à la version 5 du Référentiel général d’amélioration de l’accessibilité (RGAA). Ils n’invalident pas les audits déjà réalisés.",
	},
];

export const NAVIGATION: NavEntry[] = [
	// TODO: add link
	{ text: "Accueil", href: "/", description: PLACEHOLDER_DESCRIPTION },
	{
		text: "Obligations légales",
		href: "/obligations",
		description: PLACEHOLDER_DESCRIPTION,
	},
	{
		text: "Méthode technique",
		href: "/methode",
		links: METHODE_LINKS,
	},
	{
		text: "Ressources",
		href: "/ressources",
		links: RESSOURCES_LINKS,
	},
];

export function getPageDescription(href: string): string {
	const link = NAVIGATION.flatMap((entry) =>
		"links" in entry ? entry.links : [entry],
	).find((link) => link.href === href);
	if (!link) throw new Error(`No navigation entry for ${href}`);
	return link.description;
}
