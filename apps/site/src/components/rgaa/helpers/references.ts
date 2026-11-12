import type { Reference, ReferentielId, TechniquePrefix } from "@rgaa/content";

const WCAG_FR_URL = "https://www.w3.org/Translations/WCAG22-fr/";
const TECHNIQUES_URL = "https://www.w3.org/WAI/WCAG22/Techniques/";

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
	return `${WCAG_FR_URL}#${anchor}`;
}

// EN 301 549 restates each WCAG success criterion in the chapter of the matching platform.
const EN_301_549_CHAPTERS: Record<ReferentielId, number> = {
	web: 9,
	mobile: 10,
	bureautique: 11,
};

export function enClause(
	{ reference, title, level }: Reference,
	referentielId: ReferentielId,
) {
	const chapter = EN_301_549_CHAPTERS[referentielId];
	return `${chapter}.${reference} ${title}${level ? ` (${level})` : ""}`;
}

export function techniqueUrl(technique: string): string {
	const prefix = /^[A-Z]+/.exec(technique)?.[0] as TechniquePrefix;
	return `${TECHNIQUES_URL}${TECHNIQUE_PATHS[prefix]}/${technique}`;
}
