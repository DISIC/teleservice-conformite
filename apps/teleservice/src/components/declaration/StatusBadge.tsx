import { Badge } from "@codegouvfr/react-dsfr/Badge";
import type { Declaration } from "~/payload/payload-types";
import { getObsolescence } from "~/domain/declaration/obsolescence";
import { getDeclarationStatus, type Status } from "~/domain/declaration/status";

const STATUS_PRESENTATION: Record<
	Status,
	{ label: string; severity?: "success" }
> = {
	draft: { label: "Brouillon" },
	published: { label: "Publiée", severity: "success" },
};

type StatusBadgeProps = {
	declaration: Pick<Declaration, "publishedContent" | "published_at">;
};

// Obsolète replaces Publiée; Bientôt obsolète keeps it and is signalled next to the badge.
export function StatusBadge({ declaration }: StatusBadgeProps) {
	if (getObsolescence(declaration, new Date()) === "obsolete") {
		return (
			<Badge small severity="warning">
				Obsolète
			</Badge>
		);
	}
	const { label, severity } =
		STATUS_PRESENTATION[getDeclarationStatus(declaration)];
	return (
		<Badge noIcon small severity={severity}>
			{label}
		</Badge>
	);
}
