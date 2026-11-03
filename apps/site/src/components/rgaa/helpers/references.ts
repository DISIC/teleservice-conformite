import type { Reference, TechniquePrefix } from "@rgaa/content";

const WCAG21_FR_URL = "https://www.w3.org/Translations/WCAG21-fr/";
const WCAG22_URL = "https://www.w3.org/TR/WCAG22/";
const TECHNIQUES_URL = "https://www.w3.org/WAI/WCAG21/Techniques/";

const WCAG22_ONLY = new Set([
	"2.4.11",
	"2.4.12",
	"2.4.13",
	"2.5.7",
	"2.5.8",
	"3.2.6",
	"3.3.7",
	"3.3.8",
	"3.3.9",
]);

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

export const isWcag = (standard: string) => standard.startsWith("WCAG");

export function wcagSuccessCriterionUrl({
	reference,
	title,
}: Pick<Reference, "reference" | "title">): string {
	const anchor = title.toLowerCase().replaceAll(" ", "-").replace(/[,()]/g, "");
	const base = WCAG22_ONLY.has(reference) ? WCAG22_URL : WCAG21_FR_URL;
	return `${base}#${anchor}`;
}

export function enClause({ reference, title, level }: Reference) {
	if (WCAG22_ONLY.has(reference)) return undefined;
	return `9.${reference} ${title}${level ? ` (${level})` : ""}`;
}

export function techniqueUrl(technique: string): string {
	const prefix = /^[A-Z]+/.exec(technique)?.[0] as TechniquePrefix;
	return `${TECHNIQUES_URL}${TECHNIQUE_PATHS[prefix]}/${technique}`;
}
