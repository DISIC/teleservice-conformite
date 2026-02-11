import System from "@codegouvfr/react-dsfr/picto/System";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

export default function DeclarationLoader() {
	const { classes } = useStyles();

	return (
		<div className={classes.loaderContainer}>
			<System fontSize="6rem" />
			<h4 className={classes.title}>Création de votre déclaration</h4>
			<h6 className={classes.description}>
				Merci de vérifier les informations récupérées et de les modifier si
				nécessaire
			</h6>
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
		textAlign: "center",
	},
	description: {
		textAlign: "center",
	},
});
