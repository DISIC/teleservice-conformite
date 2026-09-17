import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import SignDocument from "@codegouvfr/react-dsfr/picto/SignDocument";
import { tss } from "tss-react";

type HomeHeroProps = {
	onStart: () => void;
};

export function HomeHero({ onStart }: HomeHeroProps) {
	const { classes, cx } = useStyles();

	return (
		<div className={classes.band}>
			<div className={cx(fr.cx("fr-container"), classes.container)}>
				<div className={classes.content}>
					<Badge noIcon small severity="info">
						BETA
					</Badge>
					<h1 className={classes.title}>
						Publiez et centralisez vos déclarations d’accessibilité conformément
						aux exigences légales.
					</h1>
					<p className={classes.lead}>
						Ce téléservice centralise l’ensemble des déclarations
						d’accessibilité numérique des services publics. Il permet un
						meilleur suivi de la politique d’accessibilité de l’État.
					</p>
					<Button onClick={onStart}>Commencer</Button>
				</div>
				<div className={classes.artwork} aria-hidden="true">
					<span className={classes.halo} />
					<span className={classes.disc}>
						<SignDocument fontSize="7rem" />
					</span>
				</div>
			</div>
		</div>
	);
}

const useStyles = tss.withName(HomeHero.name).create({
	band: {
		backgroundColor: fr.colors.options.beigeGrisGalet._975_75.default,
		paddingBlock: fr.spacing("10w"),
		"@media (max-width: 768px)": {
			paddingBlock: fr.spacing("6w"),
		},
	},
	container: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: fr.spacing("8w"),
		"@media (max-width: 992px)": {
			flexDirection: "column",
			alignItems: "flex-start",
			gap: fr.spacing("4w"),
		},
	},
	content: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: fr.spacing("4v"),
		maxWidth: "45rem",
	},
	title: {
		margin: 0,
	},
	lead: {
		margin: 0,
		fontSize: "1.125rem",
		lineHeight: "1.75rem",
	},
	artwork: {
		position: "relative",
		flexShrink: 0,
		width: "14rem",
		height: "14rem",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		"@media (max-width: 992px)": {
			alignSelf: "center",
			width: "10rem",
			height: "10rem",
		},
	},
	halo: {
		position: "absolute",
		inset: 0,
		borderRadius: "50%",
		border: `1.25rem solid ${fr.colors.options.beigeGrisGalet._925_125.default}`,
		clipPath: "inset(0 0 0 50%)",
	},
	disc: {
		position: "relative",
		width: "85%",
		height: "85%",
		borderRadius: "50%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: fr.colors.decisions.background.default.grey.default,
	},
});
