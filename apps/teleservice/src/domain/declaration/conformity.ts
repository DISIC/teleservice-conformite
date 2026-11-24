import type { BadgeProps } from "@codegouvfr/react-dsfr/Badge";

export type ConformitySeverity = NonNullable<BadgeProps["severity"]>;

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
		return { label: "Partiellement conforme", severity: "new" };
	}

	return { label: "Conforme", severity: "success" };
};

type AuditOutcome = {
	isRealised: boolean;
	rate: number;
	blockingElements: string;
};

// No audit, or a blocking element, makes the service non-conformant whatever its rate.
export const getAuditConformity = (audit: AuditOutcome): ConformityStatus =>
	!audit.isRealised || audit.blockingElements.trim().length > 0
		? NON_CONFORME
		: getConformityStatus(audit.rate);

// Legal wording of the footer mention: "Accessibilité : totalement conforme".
export const footerConformityLabel = (status: ConformityStatus): string =>
	status.label === "Conforme"
		? "totalement conforme"
		: status.label.toLowerCase();

// French locale: decimal comma, space before the percent sign.
export const formatRate = (rate: number): string =>
	`${rate.toString().replace(".", ",")} %`;
