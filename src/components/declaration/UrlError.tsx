import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import ConnectionLost from "@codegouvfr/react-dsfr/picto/ConnectionLost";
import { tss } from "tss-react";

type UrlErrorProps = {
	onRetry: () => void;
	onForward: () => void;
};

export default function UrlError({ onRetry, onForward }: UrlErrorProps) {
	const { classes, cx } = useStyles();

	return (
		<div className={cx(classes.container)}>
			<div className={fr.cx("fr-container")}>
				<div className={classes.wrapper}>
					<ConnectionLost fontSize="6rem" />
					<h1 className={classes.title}>Impossible de récupérer les données</h1>
					<p className={cx(fr.cx("fr-mb-2v"), classes.description)}>
						Nous rencontrons actuellement une difficulté pour récupérer les
						données de votre déclaration. Le remplissage automatique n’est donc
						pas disponible. Nous vous invitons à renseigner les informations
						manuellement ou à réessayer.
					</p>
					<div className={classes.buttonsContainer}>
						<Button priority="tertiary" size="large" onClick={onRetry}>
							Réessayer
						</Button>
						<Button
							priority="primary"
							size="large"
							onClick={onForward}
							iconId="ri-arrow-right-s-line"
							iconPosition="right"
						>
							Continuer
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

const useStyles = tss.withName(UrlError.name).create({
	container: {
		background: fr.colors.decisions.background.default.grey.default,
		display: "grid",
		gridTemplateColumns: "repeat(12, 1fr)",
		alignItems: "center",
		flex: 1,
		"& > .fr-container": {
			gridColumn: "5 / span 4",
			rowGap: "12",
		},
	},
	wrapper: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: "1rem",
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		"@media (max-width: 1024px)": {
			paddingInline: fr.spacing("4v"),
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
	buttonsContainer: {
		display: "flex",
		gap: fr.spacing("6v"),
	},
});
