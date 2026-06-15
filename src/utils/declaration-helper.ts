import { testEnvironmentOptions, toolOptions } from "~/payload/selectOptions";

export const getConformityStatus = (
	rate: number,
): { label: string; severity: "success" | "warning" | "error" } => {
	if (rate < 50) {
		return { label: "Non conforme", severity: "error" };
	}
	if (rate >= 50 && rate <= 99) {
		return { label: "Partiellement conforme", severity: "success" };
	}

	return { label: "Conforme", severity: "success" };
};

export const extractTechnologiesFromUrl = (
	tools: string[],
	options: typeof toolOptions | typeof testEnvironmentOptions,
): string[] => {
	const toolLabels = options.map((option) => option.label);

	return [
		...new Set(
			tools.reduce((acc: string[], option) => {
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
			}, []),
		),
	];
};

/**
 * Standard `onError` for the per-Section save mutations: logs the failed action
 * against its declaration. `subject` is the action phrase, e.g. "saving audit".
 */
export const logMutationError =
	(subject: string, declarationId: number | string) => (error: unknown) =>
		console.error(`Error ${subject} (declaration ${declarationId}):`, error);

export const copyToClipboard = (textToCopy: string, fn: () => void) => {
	navigator.clipboard
		.writeText(textToCopy)
		.then(fn)
		.catch((err) => {
			console.error("Failed to copy:", err);
		});
};
