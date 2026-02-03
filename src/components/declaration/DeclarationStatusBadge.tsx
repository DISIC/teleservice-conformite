import { Badge } from "@codegouvfr/react-dsfr/Badge";
import type { AlertProps } from "@codegouvfr/react-dsfr/Alert";

export const StatusBadge = ({
	isPublished,
	isModified,
	isDraft,
}: {
	isPublished: boolean;
	isModified: boolean;
	isDraft: boolean;
}) => {
	const statuses = [
		{ show: isPublished, label: "Publiée", severity: "success" },
		{ show: isModified, label: "Modifiée", severity: "warning" },
		{ show: isDraft, label: "Brouillon", severity: "default" },
	];

	return statuses
		.filter((status) => status.show)
		.map(({ label, severity }) => (
			<Badge
				key={label}
				noIcon={true}
				small={true}
				severity={severity as AlertProps.Severity | "new"}
			>
				{label}
			</Badge>
		));
};

export const ValidityBadge = ({
	isExpired,
	expiryDate,
}: {
	isExpired: boolean;
	expiryDate: string | null;
}) => {
	const statuses = [
		{ show: isExpired, label: "périmée - à mettre à jour", severity: "error" },
		{
			show: !!expiryDate,
			label: `Valide jusqu'au ${expiryDate}`,
			severity: "error",
		},
	];

	return statuses
		.filter((status) => status.show)
		.map(({ label, severity }) => (
			<Badge
				key={label}
				noIcon={true}
				small={true}
				severity={severity as AlertProps.Severity | "new"}
			>
				{label}
			</Badge>
		));
};
