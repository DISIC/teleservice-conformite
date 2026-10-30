import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { tss } from "tss-react";
import { newTabLinkProps } from "~/lib/newTabLink";

const STEPS = [
	{
		title: "Déposez votre déclaration sur le téléservice.",
		description:
			"Sa durée de validité est de 3 ans pour le référentiel d’accessibilité en vigueur, ou 18 mois après la date de publication d’une nouvelle version du référentiel. Elle doit être mise à jour en cas de modification substantielle du service numérique.",
	},
	{
		title: "Publiez le lien de la télédéclaration sur votre site.",
		description:
			"À l’issue du dépôt, un lien unique est transmis par le téléservice. Vous devez le publier sur votre site à la place de votre précédente déclaration d’accessibilité.",
		linkLabel: "En savoir plus sur le dépôt de la déclaration d’accessibilité",
		href: "#",
	},
];

export function LegalObligationsSection() {
	const { classes, cx } = useStyles();

	return (
		<section className={cx(fr.cx("fr-container"), classes.section)}>
			<h2 className={classes.heading}>
				Répondre aux obligations légales en 2 étapes
			</h2>
			<div className={classes.content}>
				<ul className={classes.list}>
					{STEPS.map(({ title, description, linkLabel, href }, index) => (
						<li key={title} className={classes.card}>
							<h3 className={fr.cx("fr-mb-4v")}>
								<span aria-hidden="true">Étape {index + 1}</span>
								<br />
								<span className={classes.cardTitle}>{title}</span>
							</h3>
							<p className={classes.cardText}>{description}</p>
							<a
								href={href}
								{...(linkLabel && newTabLinkProps(linkLabel))}
								className={cx(
									fr.cx("fr-link", "fr-link--sm"),
									classes.cardLink,
								)}
							>
								{linkLabel}
							</a>
						</li>
					))}
				</ul>
				<Alert
					description="L’obligation légale porte sur le dépôt de la déclaration sur le téléservice, et non sur le taux de conformité du service numérique."
					severity="warning"
					small
				/>
			</div>
		</section>
	);
}

const useStyles = tss.withName(LegalObligationsSection.name).create({
	section: {
		display: "grid",
		gridTemplateColumns: "3fr 7fr",
		alignItems: "center",
		gap: fr.spacing("7w"),
		paddingBlock: fr.spacing("9w"),
		"@media (max-width: 992px)": {
			gridTemplateColumns: "1fr",
			gap: fr.spacing("4w"),
			paddingBlock: fr.spacing("6w"),
		},
	},
	heading: {
		margin: 0,
		paddingRight: fr.spacing("4w"),
		"@media (max-width: 992px)": {
			paddingRight: 0,
		},
	},
	list: {
		listStyle: "none",
		margin: 0,
		padding: 0,
		display: "grid",
		gridTemplateColumns: "repeat(2, 1fr)",
		gap: fr.spacing("4w"),
		"@media (max-width: 768px)": {
			gridTemplateColumns: "1fr",
		},
	},
	card: {
		display: "flex",
		flexDirection: "column",
		padding: fr.spacing("10v"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
	content: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4w"),
	},
	cardTitle: {
		fontWeight: "normal",
	},
	cardText: {
		margin: 0,
	},
	cardLink: {
		marginTop: "auto",
		alignSelf: "flex-start",
		color: fr.colors.decisions.text.mention.grey.default,
		backgroundImage: "none",
		"::after": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
	},
});
