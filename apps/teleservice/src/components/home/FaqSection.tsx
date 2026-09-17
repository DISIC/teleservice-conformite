import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { tss } from "tss-react";

import { Loader } from "~/components/ui/Loader";
import { api } from "~/lib/api";

export function FaqSection() {
	const { classes, cx } = useStyles();
	const { data: faq = [], isLoading } = api.settings.faq.useQuery();

	if (!isLoading && faq.length === 0) return null;

	return (
		<section className={cx(fr.cx("fr-container"), classes.section)}>
			<h2 className={classes.heading}>Questions fréquentes</h2>
			{isLoading ? (
				<Loader />
			) : (
				<div className={fr.cx("fr-accordions-group")}>
					{faq.map(({ id, question, answer }) => (
						<Accordion key={id ?? question} label={question} titleAs="h3">
							<p className={classes.answer}>{answer}</p>
						</Accordion>
					))}
				</div>
			)}
		</section>
	);
}

const useStyles = tss.withName(FaqSection.name).create({
	section: {
		maxWidth: "48rem",
		paddingBlock: fr.spacing("7w"),
	},
	heading: {
		textAlign: "center",
		marginBottom: fr.spacing("4w"),
	},
	answer: {
		margin: 0,
		whiteSpace: "pre-line",
	},
});
