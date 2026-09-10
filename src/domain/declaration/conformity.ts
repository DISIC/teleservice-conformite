export type ConformitySeverity = "success" | "info" | "warning" | "error";

// RGAA thresholds: below 50 % non conforme, 50–99 % partiellement conforme, 100 % conforme.
export const getConformityStatus = (
	rate: number,
): { label: string; severity: ConformitySeverity } => {
	if (rate < 50) {
		return { label: "Non conforme", severity: "error" };
	}
	if (rate >= 50 && rate <= 99) {
		return { label: "Partiellement conforme", severity: "info" };
	}

	return { label: "Conforme", severity: "success" };
};

// French locale: decimal comma, space before the percent sign.
export const formatRate = (rate: number): string =>
	`${rate.toString().replace(".", ",")} %`;
