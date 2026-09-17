import { fr } from "@codegouvfr/react-dsfr";
import type { Declaration } from "~/payload/payload-types";
import type { StatePresentation } from "./state";

// A declaration must be republished every three years; past that it is deemed non compliant.
export const OBSOLESCENCE_YEARS = 3;
// The declarant is warned this long before the deadline.
const EXPIRING_MONTHS = 3;

/** Valide → Bientôt obsolète → Obsolète, read from the last publish date and today. Never stored. */
export type Obsolescence = "valid" | "expiring" | "obsolete";

// Clamped to the last day of the target month, so a 31st never spills into the next one.
const addMonths = (date: Date, months: number): Date => {
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth() + months;
	const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
};

/** Calendar day (YYYY-MM-DD, UTC): obsolescence flips at midnight, not at the publish hour. */
const calendarDay = (date: Date): string => date.toISOString().slice(0, 10);

/** The day the declaration becomes Obsolète: it is still valid on that day. */
export const obsoleteSince = (publishedAt: Date): Date =>
	addMonths(publishedAt, OBSOLESCENCE_YEARS * 12);

export const obsolescenceOf = (
	publishedAt: Date,
	today: Date,
): Obsolescence => {
	const deadline = obsoleteSince(publishedAt);
	const day = calendarDay(today);
	if (calendarDay(deadline) < day) return "obsolete";
	if (calendarDay(addMonths(deadline, -EXPIRING_MONTHS)) <= day)
		return "expiring";
	return "valid";
};

/** A Brouillon has published nothing to grow old; so has a Publiée row without a publish date. */
export const getObsolescence = (
	declaration: Pick<Declaration, "publishedContent" | "published_at">,
	today: Date,
): Obsolescence => {
	if (!declaration.publishedContent || !declaration.published_at)
		return "valid";
	const publishedAt = new Date(declaration.published_at);
	if (Number.isNaN(publishedAt.getTime())) return "valid";
	return obsolescenceOf(publishedAt, today);
};

/** Notice shown in the empty Declaration state slot; copy for the case where nothing else blocks. */
export const OBSOLESCENCE_PRESENTATION: Record<
	Exclude<Obsolescence, "valid">,
	StatePresentation
> = {
	expiring: {
		bgColor: fr.colors.decisions.background.alt.yellowMoutarde.default,
		badge: {
			label: "Bientôt obsolète",
			color: fr.colors.decisions.text.label.yellowMoutarde.default,
			bgColor: fr.colors.decisions.background.contrast.yellowMoutarde.default,
		},
		heading: "Votre déclaration sera bientôt obsolète.",
		body: `Elle a été publiée il y a près de ${OBSOLESCENCE_YEARS} ans. Vérifiez les informations ci-dessous, puis prévisualisez et publiez avant l’échéance pour la renouveler pour ${OBSOLESCENCE_YEARS} ans.`,
		actions: ["publish"],
	},
	obsolete: {
		bgColor: fr.colors.decisions.background.alt.redMarianne.default,
		badge: {
			label: "Obsolète",
			color: fr.colors.decisions.text.label.redMarianne.default,
			bgColor: fr.colors.decisions.background.contrast.redMarianne.default,
		},
		heading: "Votre déclaration est obsolète.",
		body: `Une déclaration de plus de ${OBSOLESCENCE_YEARS} ans est obsolète. Votre service numérique est alors considéré comme non conforme. Conformément à la législation, vous devez actualiser votre déclaration et la publier à nouveau. `,
		actions: ["publish"],
	},
};
