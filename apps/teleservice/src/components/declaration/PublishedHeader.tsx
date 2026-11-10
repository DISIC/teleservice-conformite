import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Header } from "@codegouvfr/react-dsfr/Header";
import type { PublishedDeclaration } from "~/domain/declaration/published/snapshot";
import { tss } from "tss-react";
import { obsolescenceOf } from "~/domain/declaration/obsolescence";
import { publicationLabel } from "~/domain/declaration/published/markdown";
import { SERVICE_NAME } from "~/lib/serviceName";

export const PUBLISHED_HEADER_TITLE = "Déclaration d’accessibilité numérique";

export function PublishedHeader({
	declaration,
}: {
	declaration: PublishedDeclaration;
}) {
	const { classes, cx } = useStyles();
	const isObsolete =
		obsolescenceOf(new Date(declaration.publishedAt), new Date()) ===
		"obsolete";

	return (
		<Header
			brandTop={
				<>
					RÉPUBLIQUE
					<br />
					FRANÇAISE
				</>
			}
			homeLinkProps={{
				href: "/",
				title: `Accueil ${SERVICE_NAME}`,
			}}
			serviceTitle={PUBLISHED_HEADER_TITLE}
			serviceTagline={declaration.name}
			quickAccessItems={[
				<div key="publication" className={classes.publicationInfo}>
					<p
						className={cx(
							fr.cx(
								"fr-icon-calendar-2-line",
								"fr-icon--sm",
								"fr-text--sm",
								"fr-mb-0",
							),
							classes.publication,
						)}
					>
						{publicationLabel(declaration)}
					</p>
					{isObsolete && (
						<Badge
							as="p"
							small
							severity="warning"
							className={classes.obsoleteBadge}
						>
							Obsolète
						</Badge>
					)}
				</div>,
			]}
		/>
	);
}

const useStyles = tss.withName(PublishedHeader.name).create({
	obsoleteBadge: {
		color: fr.colors.decisions.background.flat.error.default,
		"&::before": {
			color: fr.colors.decisions.background.flat.error.default,
		},
	},
	publicationInfo: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-end",
		gap: fr.spacing("1v"),
	},
	publication: {
		"&::before": {
			marginRight: fr.spacing("2v"),
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
	},
});
