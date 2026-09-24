import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { type BadgeVariant, SECTION_BADGE } from "~/domain/declaration/state";

/** A Section's status flag, rendered the same way in the SideMenu and on its title. */
export function SectionBadge({ variant }: { variant: BadgeVariant }) {
	const { label, color, bgColor } = SECTION_BADGE[variant];
	return (
		<Badge small noIcon style={{ color, backgroundColor: bgColor }}>
			{label}
		</Badge>
	);
}
