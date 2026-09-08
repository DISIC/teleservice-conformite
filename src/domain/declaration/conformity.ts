// RGAA thresholds: below 50 % non conforme, 50–99 % partiellement conforme, 100 % conforme.
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
