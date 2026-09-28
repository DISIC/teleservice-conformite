import { getReferentielStyle } from "~/components/rgaa/referentiels";
import { getAllReferentiels } from "~/lib/rgaa-data";

export type NavLink = { text: string; href: string; description: string };
export type NavEntry = NavLink | { text: string; links: NavLink[] };

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
		description: PLACEHOLDER_DESCRIPTION,
	},
	{
		text: "Modèles à télécharger",
		href: "/modeles",
		description: PLACEHOLDER_DESCRIPTION,
	},
	{
		text: "Note de révision du RGAA 4.12 vers le RGAA 5",
		href: "/notes",
		description: PLACEHOLDER_DESCRIPTION,
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
	{ text: "Méthode technique", links: METHODE_LINKS },
	{ text: "Ressources", links: RESSOURCES_LINKS },
];
