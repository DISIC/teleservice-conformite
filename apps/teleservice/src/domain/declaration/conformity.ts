export type ConformitySeverity = "success" | "info" | "warning" | "error";

type ConformityStatus = { label: string; severity: ConformitySeverity };

export const NON_CONFORME: ConformityStatus = {
	label: "Non conforme",
	severity: "error",
};

// RGAA thresholds: below 50 % non conforme, 50–99 % partiellement conforme, 100 % conforme.
export const getConformityStatus = (rate: number): ConformityStatus => {
	if (rate < 50) {
		return NON_CONFORME;
	}
	if (rate >= 50 && rate <= 99) {
		return { label: "Partiellement conforme", severity: "info" };
	}

	return { label: "Conforme", severity: "success" };
};

// French locale: decimal comma, space before the percent sign.
export const formatRate = (rate: number): string =>
	`${rate.toString().replace(".", ",")} %`;
