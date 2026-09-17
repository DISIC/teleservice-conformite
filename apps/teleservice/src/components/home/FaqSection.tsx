import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { RichText } from "@payloadcms/richtext-lexical/react";
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
							<RichText data={answer} className={classes.answer} />
						</Accordion>
					))}
				</div>
			)}
		</section>
	);
}

const useStyles = tss.withName(FaqSection.name).create({
	section: {
		maxWidth: "50%",
		paddingBlock: fr.spacing("7w"),
		"@media (max-width: 1023px)": {
			maxWidth: "100%",
		},
	},
	heading: {
		textAlign: "center",
		marginBottom: fr.spacing("4w"),
	},
	answer: {
		"& p": { margin: 0 },
	},
});
