import { Badge } from "@codegouvfr/react-dsfr/Badge";
import type { Declaration } from "~/payload/payload-types";
import { getObsolescence } from "~/domain/declaration/obsolescence";
import { getDeclarationStatus, type Status } from "~/domain/declaration/status";

const STATUS_PRESENTATION: Record<
	Status,
	{ label: string; severity?: "success" }
> = {
	draft: { label: "Brouillon" },
	deposited: { label: "Publiée", severity: "success" },
};

type StatusBadgeProps = {
	declaration: Pick<Declaration, "depositedContent" | "deposited_at">;
};

// Obsolète replaces the Status badge; Bientôt obsolète keeps it and is signalled next to the badge.
export function StatusBadge({ declaration }: StatusBadgeProps) {
	if (getObsolescence(declaration, new Date()) === "obsolete") {
		return (
			<Badge as="span" small severity="warning">
				Obsolète
			</Badge>
		);
	}
	const { label, severity } =
		STATUS_PRESENTATION[getDeclarationStatus(declaration)];
	return (
		<Badge as="span" noIcon small severity={severity}>
			{label}
		</Badge>
	);
}
