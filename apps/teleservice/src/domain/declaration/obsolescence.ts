import type { Declaration } from "~/payload/payload-types";

// A declaration must be republished every three years; past that it is deemed non compliant.
export const OBSOLESCENCE_YEARS = 3;
// The declarant is warned this long before the deadline.
const EXPIRING_MONTHS = 3;

/** Valide → Bientôt obsolète → Obsolète, read from the last publish date and today. Never stored. */
export type Obsolescence = "valid" | "expiring" | "obsolete";

const addMonths = (date: Date, months: number): Date =>
	new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth() + months,
			date.getUTCDate(),
		),
	);

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
