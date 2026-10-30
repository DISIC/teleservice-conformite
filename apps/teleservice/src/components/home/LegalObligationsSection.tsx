import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { CardGridSection } from "~/components/home/CardGridSection";

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
	const { classes } = useStyles();

	return (
		<CardGridSection
			heading="Répondre aux obligations légales en 2 étapes"
			items={STEPS.map(({ title, ...step }, index) => ({
				...step,
				title: (
					<>
						<span>Étape {index + 1}</span>
						<br />
						<span className={classes.cardTitle}>{title}</span>
					</>
				),
			}))}
			alert="L’obligation légale porte sur le dépôt de la déclaration sur le téléservice, et non sur le taux de conformité du service numérique."
			classes={{ heading: classes.heading, cardLink: classes.cardLink }}
		/>
	);
}

const useStyles = tss.withName(LegalObligationsSection.name).create({
	heading: {
		paddingRight: fr.spacing("4w"),
	},
	cardTitle: {
		fontWeight: "normal",
	},
	cardLink: {
		paddingTop: 0,
	},
});
