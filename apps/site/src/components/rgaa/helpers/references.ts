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

// EN 301 549 restates each WCAG success criterion per platform: 9 web, 10 non-web documents, 11 non-web software (mobile apps).
const EN_301_549_CHAPTERS: Record<ReferentielId, number> = {
	web: 9,
	bureautique: 10,
	mobile: 11,
};

// Clauses whose EN 301 549 V4.1.1 title differs from the WCAG one; null marks a clause the standard declares void.
const EN_301_549_CLAUSE_TITLES: Record<
	ReferentielId,
	Record<string, string | null>
> = {
	web: { "4.1.1": null },
	bureautique: {
		"2.4.1": null,
		"2.4.2": "Non-web document titled",
		"2.4.5": null,
		"3.1.1": "Language of non-web document",
		"4.1.1": null,
	},
	mobile: {
		"2.4.1": null,
		"2.4.2": "Non-web software titled",
		"2.4.5": null,
		"3.1.1": "Language of non-web software",
		"3.1.2": null,
		"3.2.3": null,
		"4.1.1": null,
	},
};

export function enClause(
	{ reference, title, level }: Reference,
	referentielId: ReferentielId,
): string | undefined {
	const clauseTitle = EN_301_549_CLAUSE_TITLES[referentielId][reference];
	if (clauseTitle === null) return undefined;
	const chapter = EN_301_549_CHAPTERS[referentielId];
	return `${chapter}.${reference} ${clauseTitle ?? title}${level ? ` (${level})` : ""}`;
}

export function techniqueUrl(technique: string): string {
	const prefix = /^[A-Z]+/.exec(technique)?.[0] as TechniquePrefix;
	return `${TECHNIQUES_URL}${TECHNIQUE_PATHS[prefix]}/${technique}`;
}
