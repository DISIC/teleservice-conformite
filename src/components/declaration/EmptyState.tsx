import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function EmptyState() {
	const { classes } = useStyles();

	return (
		<div className={classes.emptyStateContainer}>
			<Conclusion fontSize="5.25rem" />
			<h2 className={classes.emptyStateTitle}>
				Créez votre déclaration d’accessibilité
			</h2>
			<p className={classes.emptyStateDescription}>
				Publiez une déclaration conforme pour répondre aux obligations légales
			</p>
			<Button
				linkProps={{
					href: "/dashboard/form",
				}}
				priority="primary"
			>
				Créer une déclaration
			</Button>
		</div>
	);
}

const useStyles = tss.withName(EmptyState.name).create({
	emptyStateContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
		padding: `${fr.spacing("16v")} ${fr.spacing("20v")}`,
		gap: fr.spacing("8v"),
	},
	emptyStateTitle: {
		fontFamily: "Marianne",
		fontWeight: 700,
		fontSize: fr.typography[1].style.fontSize,
		lineHeight: fr.typography[1].style.lineHeight,
		color: fr.colors.decisions.text.title.blueFrance.default,
		margin: 0,
	},
	emptyStateDescription: {
		fontFamily: "Marianne",
		fontWeight: 400,
		fontSize: "1.25rem",
		lineHeight: "2rem",
		color: fr.colors.decisions.text.mention.grey.default,
		margin: 0,
	},
});
