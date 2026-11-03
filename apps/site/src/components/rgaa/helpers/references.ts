const WCAG_FR_URL = "https://www.w3.org/Translations/WCAG21-fr/";
const TECHNIQUES_URL = "https://www.w3.org/WAI/WCAG21/Techniques/";

const TECHNIQUE_PATHS: Record<string, string> = {
	SC: "client-side-script",
	SV: "server-side-script",
	A: "aria",
	C: "css",
	F: "failures",
	G: "general",
	H: "html",
	S: "smil",
};

export function wcagSuccessCriterionUrl(title: string): string {
	const anchor = title.toLowerCase().replaceAll(" ", "-").replace(/[,()]/g, "");
	return `${WCAG_FR_URL}#${anchor}`;
}

export function techniqueUrl(technique: string): string {
	const path =
		TECHNIQUE_PATHS[technique.slice(0, 2)] ??
		TECHNIQUE_PATHS[technique.charAt(0)];
	return path ? `${TECHNIQUES_URL}${path}/${technique}` : TECHNIQUES_URL;
}
