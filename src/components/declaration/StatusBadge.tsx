import { Badge } from "@codegouvfr/react-dsfr/Badge";
import type { Declaration } from "~/payload/payload-types";
import { getDeclarationStatus, type Status } from "~/domain/declaration/status";

const STATUS_PRESENTATION: Record<
	Status,
	{ label: string; severity?: "success" }
> = {
	draft: { label: "Brouillon" },
	published: { label: "Publiée", severity: "success" },
};

type StatusBadgeProps = {
	declaration: Pick<Declaration, "publishedContent">;
};

export function StatusBadge({ declaration }: StatusBadgeProps) {
	const { label, severity } =
		STATUS_PRESENTATION[getDeclarationStatus(declaration)];
	return (
		<Badge noIcon small severity={severity}>
			{label}
		</Badge>
	);
}
