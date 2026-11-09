import type { Reference, TechniquePrefix } from "@rgaa/content";

const WCAG21_FR_URL = "https://www.w3.org/Translations/WCAG21-fr/";
const TECHNIQUES_URL = "https://www.w3.org/WAI/WCAG21/Techniques/";

const TECHNIQUE_PATHS: Record<TechniquePrefix, string> = {
	ARIA: "aria",
	C: "css",
	F: "failures",
	G: "general",
	H: "html",
	SCR: "client-side-script",
	SM: "smil",
	SVR: "server-side-script",
};

export function wcagSuccessCriterionUrl({
	title,
}: Pick<Reference, "title">): string {
	const anchor = title.toLowerCase().replaceAll(" ", "-").replace(/[,()]/g, "");
	return `${WCAG21_FR_URL}#${anchor}`;
}

export function enClause({ reference, title, level }: Reference) {
	return `9.${reference} ${title}${level ? ` (${level})` : ""}`;
}

export function techniqueUrl(technique: string): string {
	const prefix = /^[A-Z]+/.exec(technique)?.[0] as TechniquePrefix;
	return `${TECHNIQUES_URL}${TECHNIQUE_PATHS[prefix]}/${technique}`;
}
