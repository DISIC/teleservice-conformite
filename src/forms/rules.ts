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

/** URL format is checked only once a value exists; emptiness stays a
 *  completeness concern owned by each schema's own required rules. */
export function optionalUrlIssue(
	ctx: IssueCtx,
	path: IssuePath,
	value: string,
) {
	if (value && !z.url().safeParse(value).success)
		ctx.addIssue({ code: "custom", path, message: URL_MESSAGE });
}

/** Required URL: empty and malformed both read as an invalid link. */
export function requiredUrlIssue(
	ctx: IssueCtx,
	path: IssuePath,
	value: string,
) {
	if (!z.url().safeParse(value).success)
		ctx.addIssue({ code: "custom", path, message: URL_MESSAGE });
}

export function requiredIssue(
	ctx: IssueCtx,
	path: IssuePath,
	value: string,
	message: string,
) {
	if (!value) ctx.addIssue({ code: "custom", path, message });
}
