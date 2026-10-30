import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import type { Declaration } from "~/payload/payload-types";
import {
	getObsolescence,
	obsoleteSince,
} from "~/domain/declaration/obsolescence";

type ObsolescenceLineProps = {
	declaration: Pick<Declaration, "publishedContent" | "published_at">;
	/** Outside the list's Statut cell, the deadline shows only once Bientôt obsolète or Obsolète. */
	inStatusCell?: boolean;
};

const formatDeadline = (publishedAt: string) =>
	obsoleteSince(new Date(publishedAt)).toLocaleDateString("fr-FR", {
		timeZone: "UTC",
	});

export function ObsolescenceLine({
	declaration,
	inStatusCell = false,
}: ObsolescenceLineProps) {
	const { classes, cx } = useStyles();
	const obsolescence = getObsolescence(declaration, new Date());
	if (!declaration.publishedContent || !declaration.published_at) return null;
	if (Number.isNaN(new Date(declaration.published_at).getTime())) return null;
	const deadline = formatDeadline(declaration.published_at);

	if (obsolescence === "valid") {
		if (!inStatusCell) return null;
		return (
			<span className={fr.cx("fr-text--xs", "fr-mb-0")}>
				Périme le {deadline}
			</span>
		);
	}

	if (obsolescence === "expiring") {
		return (
			<p className={cx(fr.cx("fr-text--xs", "fr-mb-0"), classes.line)}>
				<span
					className={cx(
						fr.cx("fr-icon-warning-line", "fr-icon--sm"),
						classes.icon,
					)}
					aria-hidden="true"
				/>
				Obsolète le <strong>{deadline}</strong>
			</p>
		);
	}
	return (
		<p className={cx(fr.cx("fr-text--xs", "fr-mb-0"), classes.line)}>
			{inStatusCell ? "Depuis le " : "Obsolète depuis le "}
			<strong>{deadline}</strong>
		</p>
	);
}

const useStyles = tss.withName(ObsolescenceLine.name).create({
	line: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("1v"),
	},
	icon: {
		color: fr.colors.decisions.text.default.warning.default,
	},
});
