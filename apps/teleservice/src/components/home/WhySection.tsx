import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { tss } from "tss-react";
import { newTabLinkProps } from "~/lib/newTabLink";

const REASONS = [
	{
		title: "Une obligation de déclaration pour tous les services publics",
		description:
			"Depuis la loi du XXXXX, tous les services numériques publics doivent déposer via le téléservice leur déclaration d’accessibilité.",
		linkLabel:
			"En savoir plus sur la publication de la déclaration d’accessibilité",
		href: "#",
	},
	{
		title: "Un outil conçu pour répondre aux obligations légales",
		description:
			"Vos déclarations d’accessibilité sont générées au format réglementaire, et indiquent automatiquement la conformité du service, les contenus inaccessibles, ainsi que les moyens de contact et voies de recours éventuels.",
		linkLabel:
			"En savoir plus sur le contenu de la déclaration d’accessibilité",
		href: "#",
	},
];

export function WhySection() {
	const { classes, cx } = useStyles();

	return (
		<section className={cx(fr.cx("fr-container"), classes.section)}>
			<h2 className={classes.heading}>
				Pourquoi utiliser le téléservice de déclaration ?
			</h2>
			<div className={classes.content}>
				<ul className={classes.list}>
					{REASONS.map(({ title, description, linkLabel, href }) => (
						<li key={title} className={classes.card}>
							<h3 className={fr.cx("fr-mb-4v")}>
								<span aria-hidden="true">👉</span> {title}
							</h3>
							<p className={classes.cardText}>{description}</p>
							<a
								href={href}
								{...newTabLinkProps(linkLabel)}
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
					description="Le téléservice de déclaration n’est pas un outil d’audit d’accessibilité."
					severity="warning"
					small
				/>
			</div>
		</section>
	);
}

const useStyles = tss.withName(WhySection.name).create({
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
		paddingRight: fr.spacing("10w"),
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
	cardText: {
		margin: 0,
	},
	cardLink: {
		marginTop: "auto",
		paddingTop: fr.spacing("12v"),
		alignSelf: "flex-start",
		color: fr.colors.decisions.text.mention.grey.default,
		backgroundImage: "none",
		"::after": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
	},
});
