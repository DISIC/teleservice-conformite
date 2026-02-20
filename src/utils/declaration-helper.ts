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

export const extractTechnologiesFromUrl = (tools: string[], options: typeof toolOptions | typeof testEnvironmentOptions = toolOptions): string[] => {
	const toolLabels = options.map((option) => option.label);

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

export const copyToClipboard = (textToCopy: string, fn: () => void) => {
	navigator.clipboard
		.writeText(textToCopy)
		.then(fn)
		.catch((err) => {
			console.error("Failed to copy:", err);
		});
};
