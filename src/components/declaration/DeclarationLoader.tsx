import System from "@codegouvfr/react-dsfr/picto/System";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

export default function DeclarationLoader() {
	const { classes } = useStyles();

	return (
		<div className={classes.loaderContainer}>
			<System fontSize="6rem" />
			<h1 className={classes.title}>Création de votre déclaration</h1>
			<p className={classes.description}>
				Merci de vérifier les informations récupérées et de les modifier si
				nécessaire
			</p>
		</div>
	);
}

const useStyles = tss.withName(DeclarationLoader.name).create({
	loaderContainer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: "1rem",
		marginBlock: fr.spacing("20v"),
		marginInline: fr.spacing("10v"),
	},
	title: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		fontSize: "1.5rem",
		fontWeight: 700,
		lineHeight: "2rem",
		textAlign: "center",
	},
	description: {
		fontSize: "1.25rem",
		textAlign: "center",
	},
});
