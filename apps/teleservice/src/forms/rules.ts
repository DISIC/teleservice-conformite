import z from "zod";

type IssuePath = (string | number)[];
type IssueCtx = {
	addIssue: (issue: {
		code: "custom";
		path: IssuePath;
		message: string;
	}) => void;
};

const URL_MESSAGE = "Lien invalide (ex: https://www.example.fr)";

const httpUrl = z.url({ protocol: /^https?$/ });

/** Only http(s) URLs are links: any other scheme (javascript:, data:…) can run code when clicked. */
export function isHttpUrl(value: string | null | undefined): value is string {
	return httpUrl.safeParse(value).success;
}

/** URL format is checked only once a value exists; emptiness stays a
 *  completeness concern owned by each schema's own required rules. */
export function optionalUrlIssue(
	ctx: IssueCtx,
	path: IssuePath,
	value: string,
) {
	if (value && !isHttpUrl(value))
		ctx.addIssue({ code: "custom", path, message: URL_MESSAGE });
}

/** Required URL: empty and malformed both read as an invalid link. */
export function requiredUrlIssue(
	ctx: IssueCtx,
	path: IssuePath,
	value: string,
) {
	if (!isHttpUrl(value))
		ctx.addIssue({ code: "custom", path, message: URL_MESSAGE });
}

export function requiredIssue(
	ctx: IssueCtx,
	path: IssuePath,
	value: string | undefined,
	message: string,
) {
	if (!value) ctx.addIssue({ code: "custom", path, message });
}

export const INVALID_DATE_MESSAGE = "Date invalide";

export const DATE_FORMAT_HINT =
	"Format attendu : jj/mm/aaaa, par exemple 06/06/2026.";

/** Earliest accepted date: a typed year like `0030` is a typo, and Postgres cannot read it back. */
export const MIN_DATE = "1900-01-01";

/** A date input typed by hand can hold an impossible date (e.g. a 5-digit year or year 0030). */
export function isValidDate(value: string | undefined): value is string {
	return z.iso.date().safeParse(value).success && value! >= MIN_DATE;
}

/** Optional date field: empty, or a valid date from {@link MIN_DATE} on. */
export const optionalDateField = z
	.string()
	.refine((value) => value === "" || isValidDate(value), {
		message: INVALID_DATE_MESSAGE,
	});

const DATE = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Europe/Paris",
});

/** Today as `YYYY-MM-DD` in Paris time, so the browser, SSR and the UTC server agree on the date. */
export function todayIsoDate(now = new Date()): string {
	return DATE.format(now);
}

/** Format rule for a date whose field is only shown conditionally; the schema decides when it applies. */
export function invalidDateIssue(
	ctx: IssueCtx,
	path: IssuePath,
	value: string,
) {
	if (value && !isValidDate(value))
		ctx.addIssue({ code: "custom", path, message: INVALID_DATE_MESSAGE });
}

export function notFutureDateIssue(
	ctx: IssueCtx,
	path: IssuePath,
	value: string,
	message: string,
) {
	if (value && value > todayIsoDate())
		ctx.addIssue({ code: "custom", path, message });
}
