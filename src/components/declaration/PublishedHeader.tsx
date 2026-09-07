import { fr } from "@codegouvfr/react-dsfr";
import { Header } from "@codegouvfr/react-dsfr/Header";
import type { PublishedDeclaration } from "~/utils/declaration-content";
import { tss } from "tss-react";
import { publicationLabel } from "~/utils/declaration/publishedMarkdown";

export const PUBLISHED_HEADER_TITLE = "Déclaration d’accessibilité numérique";

export function PublishedHeader({
	declaration,
}: {
	declaration: PublishedDeclaration;
}) {
	const { classes, cx } = useStyles();
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
				title: "Accueil Téléservice Conformité",
			}}
			serviceTitle={PUBLISHED_HEADER_TITLE}
			serviceTagline={[declaration.name, declaration.url]
				.filter((part) => part.trim().length > 0)
				.join(" ")}
			quickAccessItems={[
				<p
					key="publication"
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
				</p>,
			]}
		/>
	);
}

const useStyles = tss.withName(PublishedHeader.name).create({
	publication: {
		"&::before": {
			marginRight: fr.spacing("2v"),
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
	},
});
