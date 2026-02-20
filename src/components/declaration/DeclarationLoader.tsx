import System from "@codegouvfr/react-dsfr/picto/System";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import { LinearProgress } from "@mui/material";
import { useProgress } from "~/hooks/useProgress";

export default function DeclarationLoader() {
	const { classes, cx } = useStyles();

	const progress = useProgress({
		duration: 1500,
	});

	return (
		<div className={cx(classes.loaderContainer)}>
			<div className={fr.cx("fr-container")}>
				<System fontSize="6rem" />
				<h1 className={classes.title}>Création de votre déclaration</h1>
				<p className={cx(fr.cx("fr-mb-2v"), classes.description)}>
					Merci de vérifier les informations récupérées et de les modifier si
					nécessaire
				</p>
				<div className={cx(classes.progressContainer)}>
					<p className={cx(fr.cx("fr-mb-0"))}>{progress}%</p>
					<LinearProgress
						variant="determinate"
						className={fr.cx("fr-p-1v")}
						value={progress}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={progress}
					/>
				</div>
			</div>
		</div>
	);
}

const useStyles = tss.withName(DeclarationLoader.name).create({
	loaderContainer: {
		background: fr.colors.decisions.background.default.grey.default,
		display: "flex",
		width: "100%",
		flex: 1,
		"& > .fr-container": {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			gap: "1rem",
			backgroundColor: fr.colors.decisions.background.default.grey.default,
			"span[role='progressbar']": {
				backgroundColor: fr.colors.decisions.background.alt.grey.hover,
				borderRadius: "1rem",
				"& > .MuiLinearProgress-bar": {
					backgroundColor:
						fr.colors.decisions.background.flat.blueFrance.default,
				},
			},
			"@media (max-width: 1024px)": {
				paddingInline: fr.spacing("4v"),
			},
		},
	},
	progressContainer: {
		width: "80%",
		"& > p": {
			...fr.typography[18].style,
			textAlign: "right",
		},
		"@media (max-width: 1024px)": {
			width: "100%",
		},
	},
	title: {
		...fr.typography[2].style,
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		textAlign: "center",
		marginBottom: 0,
	},
	description: {
		textAlign: "center",
		...fr.typography[20].style,
	},
});
