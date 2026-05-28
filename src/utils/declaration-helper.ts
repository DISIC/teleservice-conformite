import {
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import type { RouterOutputs } from "~/lib/api";
import type { ZAuditFormSchema } from "~/forms/audit/auditSchema";

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

export const mapAraDataToFormValues = (
	data: RouterOutputs["declaration"]["getInfoFromAra"]["data"],
): Partial<ZAuditFormSchema> => {
	const rateRaw = parseFloat(data.taux?.replace("%", "") ?? "0");
	return {
		isAuditRealised: true,
		realisedBy: data.auditRealizedBy ?? "",
		rgaa_version:
			rgaaVersionOptions.find((o) => o.value === data.rgaaVersion)?.value ??
			"rgaa_4",
		date: data.publishedAt
			? new Date(data.publishedAt).toLocaleDateString("en-CA")
			: "",
		rate: Number.isNaN(rateRaw) ? 0 : rateRaw,
		compliantElements: data.compliantElements.join("\n"),
		testEnvironments: extractTechnologiesFromUrl(
			data.testEnvironments,
			testEnvironmentOptions,
		),
		usedTools: extractTechnologiesFromUrl(data.usedTools, toolOptions),
		nonCompliantElements: data.nonCompliantElements ?? "",
		disproportionnedCharge: data.disproportionnedCharge ?? "",
		optionalElements: data.optionalElements ?? "",
		report: data.schema.currentYearSchemaUrl ?? "",
	};
};

export const copyToClipboard = (textToCopy: string, fn: () => void) => {
	navigator.clipboard
		.writeText(textToCopy)
		.then(fn)
		.catch((err) => {
			console.error("Failed to copy:", err);
		});
};
