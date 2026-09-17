import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

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
		title: "Un outil facilitateur, conçu pour répondre aux obligations légales",
		description:
			"Votre déclaration est générée selon le format réglementaire, conformément aux exigences légales.",
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
			<ul className={classes.list}>
				{REASONS.map(({ title, description, linkLabel, href }) => (
					<li key={title} className={classes.card}>
						<h3 className={classes.cardTitle}>
							<span aria-hidden="true">👉</span> {title}
						</h3>
						<p className={classes.cardText}>{description}</p>
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className={fr.cx("fr-link", "fr-link--sm")}
						>
							{linkLabel}
						</a>
					</li>
				))}
			</ul>
		</section>
	);
}

const useStyles = tss.withName(WhySection.name).create({
	section: {
		display: "grid",
		gridTemplateColumns: "1fr 2fr",
		alignItems: "center",
		gap: fr.spacing("6w"),
		paddingBlock: fr.spacing("10w"),
		"@media (max-width: 992px)": {
			gridTemplateColumns: "1fr",
			gap: fr.spacing("4w"),
			paddingBlock: fr.spacing("6w"),
		},
	},
	heading: {
		margin: 0,
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
		gap: fr.spacing("3v"),
		padding: fr.spacing("4w"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
	cardTitle: {
		margin: 0,
		color: fr.colors.decisions.text.title.blueFrance.default,
	},
	cardText: {
		margin: 0,
		flex: 1,
	},
});
