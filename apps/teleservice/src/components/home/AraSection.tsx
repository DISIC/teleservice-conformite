import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import { tss } from "tss-react";
import AraLogo from "~/assets/ara-logo.svg";

export function AraSection() {
	const { classes } = useStyles();

	return (
		<section className={fr.cx("fr-container")}>
			<div className={classes.block}>
				<Image
					src={AraLogo}
					alt="Logo de l'outil Ara"
					className={classes.artwork}
				/>
				<div className={classes.content}>
					<h2 className={classes.heading}>En un clic avec Ara</h2>
					<p className={classes.text}>
						Si vous utilisez l’outil{" "}
						<a
							href="https://ara.numerique.gouv.fr"
							target="_blank"
							rel="noopener noreferrer"
						>
							Ara
						</a>{" "}
						pour réaliser votre audit, récupérez en un clic toutes les données
						nécessaires au dépôt de votre déclaration sur le téléservice de
						déclaration d’accessibilité numérique.
					</p>
				</div>
			</div>
		</section>
	);
}

const useStyles = tss.withName(AraSection.name).create({
	block: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4w"),
		marginBlock: fr.spacing("9w"),
		padding: fr.spacing("7w"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		"@media (max-width: 768px)": {
			flexDirection: "column",
			alignItems: "flex-start",
		},
	},
	artwork: {
		flexShrink: 0,
		width: fr.spacing("30v"),
		height: fr.spacing("24v"),
	},
	content: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
	},
	heading: {
		margin: 0,
	},
	text: {
		margin: 0,
	},
});
