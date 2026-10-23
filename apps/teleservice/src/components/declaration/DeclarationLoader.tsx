import { fr } from "@codegouvfr/react-dsfr";
import System from "@codegouvfr/react-dsfr/picto/System";
import { LinearProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { tss } from "tss-react";
import { useProgress } from "~/hooks/useProgress";

// A live region only announces changes: the <output> must be in the DOM, empty, before its text is set.
const STATUS_ANNOUNCE_DELAY_MS = 100;

interface DeclarationLoaderProps {
	duration?: number;
}

export default function DeclarationLoader({
	duration = 1500,
}: DeclarationLoaderProps) {
	const { classes, cx } = useStyles();
	const [status, setStatus] = useState("");

	const progress = useProgress({
		duration: duration + 500,
	});

	useEffect(() => {
		const timeout = setTimeout(
			() => setStatus("Création de votre déclaration en cours"),
			STATUS_ANNOUNCE_DELAY_MS,
		);
		return () => clearTimeout(timeout);
	}, []);

	return (
		<div className={cx(classes.loaderContainer)}>
			<div className={fr.cx("fr-container")}>
				<System fontSize="6rem" />
				<h1 className={classes.title}>Création de votre déclaration</h1>
				<output className={fr.cx("fr-sr-only")}>{status}</output>
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
		position: "fixed",
		inset: 0,
		zIndex: 1000,
		background: fr.colors.decisions.background.default.grey.default,
		display: "flex",
		width: "100%",
		"& > .fr-container": {
			height: "100%",
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
