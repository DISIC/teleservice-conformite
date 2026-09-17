import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import type { ReactNode } from "react";
import { tss } from "tss-react";

// Hard-coded for now; will be driven by the Payload admin.
const FAQ: { question: string; answer: NonNullable<ReactNode> }[] = [
	{
		question: "Qui doit déposer sa déclaration via le téléservice ?",
		answer: (
			<p>
				<strong>Tous les services numériques publics</strong> doivent déposer
				via le téléservice leur déclaration d’accessibilité.
			</p>
		),
	},
	{
		question: "Quand dois-je déposer ma déclaration via le téléservice ?",
		answer: (
			<p>
				Tous les services numériques publics doivent avoir déposé via le
				téléservice leur déclaration d’accessibilité{" "}
				<strong>avant leur mise en production (à vérifier)</strong>.
			</p>
		),
	},
];

export function FaqSection() {
	const { classes, cx } = useStyles();

	return (
		<section className={cx(fr.cx("fr-container"), classes.section)}>
			<h2 className={classes.heading}>Questions fréquentes</h2>
			<div className={fr.cx("fr-accordions-group")}>
				{FAQ.map(({ question, answer }) => (
					<Accordion key={question} label={question} titleAs="h3">
						{answer}
					</Accordion>
				))}
			</div>
		</section>
	);
}

const useStyles = tss.withName(FaqSection.name).create({
	section: {
		maxWidth: "48rem",
		paddingBlock: fr.spacing("8w"),
	},
	heading: {
		textAlign: "center",
		marginBottom: fr.spacing("4w"),
	},
});
