import { type testEnvironmentOptions, toolOptions } from "~/payload/selectOptions";

export const getConformityStatus = (rate: number): string => {
	if (rate < 50) {
		return "non conforme";
	}
	if (rate >= 50 && rate <= 99) {
		return "partiellement conforme";
	}

	return "conforme";
};

export const extractToolsFromUrl = (tools: string[]): string[] => {
	const toolLabels = toolOptions.map((option) => option.label);

	return [...new Set(tools.reduce((acc: string[], option) => {
		const matchedTool = toolLabels.find((label) =>
			option.toLowerCase().includes(label.toLowerCase()),
		);

		if (matchedTool) {
			const toolOptionValue = toolOptions.find(
				(tool) => tool.label === matchedTool,
			)?.value;
			if (toolOptionValue && !acc.includes(toolOptionValue))
				acc.push(toolOptionValue);
		} else {
			acc.push(option);
		}

		return acc;
	}, []))];
};

type EnvValue = (typeof testEnvironmentOptions)[number]["value"];

const normalizeText = (s: string) =>
	s
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/[()]/g, " ")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();

// For each environment value, define groups of synonyms where
// at least one token per group must be present in the sentence.
const ENV_MATCHERS: Record<EnvValue, string[][]> = {
	nvda_firefox: [["nvda"], ["firefox"]],
	jaws_firefox: [["jaws"], ["firefox"]],
	voiceover_safari: [["voiceover"], ["safari"]],
	zoomtext_windows_mac: [["zoomtext"], ["windows", "mac", "macos", "osx"]],
	dragon_naturally_speaking_windows_mac: [
		["dragon naturally speaking", "dragon", "naturally speaking"],
		["windows", "mac", "macos", "osx"],
	],
};

const textIncludesAny = (text: string, terms: string[]) => {
	return terms.some((t) => {
		const n = normalizeText(t);
		if (!n) return false;
		const re = new RegExp(
			`(^|\\n|\\s)${n.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, "\\$&")}($|\\s)`,
		);
		return re.test(text);
	});
};

export function extractTestEnvironmentsFromUrl(lines: string[]): EnvValue[] {
	const found = new Set<EnvValue>();
	const normalizedLines = lines.map((l) => normalizeText(l || ""));

	for (const line of normalizedLines) {
		for (const env of Object.keys(ENV_MATCHERS) as EnvValue[]) {
			const groups = ENV_MATCHERS[env];
			const matchesAllGroups = groups.every((group) =>
				textIncludesAny(line, group),
			);
			if (matchesAllGroups) found.add(env);
		}
	}

	return [...new Set(Array.from(found))];
}

export const copyToClipboard = (textToCopy: string, fn: () => void) => {
	navigator.clipboard
		.writeText(textToCopy)
		.then(fn)
		.catch((err) => {
			console.error("Failed to copy:", err);
		});
};
