import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import type { Declaration } from "~/payload/payload-types";
import {
	getObsolescence,
	obsoleteSince,
} from "~/domain/declaration/obsolescence";

type ObsolescenceLineProps = {
	declaration: Pick<Declaration, "publishedContent" | "published_at">;
	/** Under an Obsolète badge the word is already said: the line starts at "depuis le". */
	underBadge?: boolean;
};

const formatDeadline = (publishedAt: string) =>
	obsoleteSince(new Date(publishedAt)).toLocaleDateString("fr-FR", {
		timeZone: "UTC",
	});

/** The deadline, shown only once it is actionable: nothing while the declaration is Valide. */
export function ObsolescenceLine({
	declaration,
	underBadge = false,
}: ObsolescenceLineProps) {
	const { classes, cx } = useStyles();
	const obsolescence = getObsolescence(declaration, new Date());
	if (obsolescence === "valid" || !declaration.published_at) return null;
	const deadline = formatDeadline(declaration.published_at);

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
			{underBadge ? "Depuis le " : "Obsolète depuis le "}
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
