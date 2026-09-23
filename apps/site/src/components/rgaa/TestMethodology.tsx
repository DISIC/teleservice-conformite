import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import { renderMarkdown } from "./helpers/markdown";

interface TestMethodologyProps {
	testNumber: string;
	methodology: string;
}

export default function TestMethodology({
	testNumber,
	methodology,
}: TestMethodologyProps) {
	const { classes } = useStyles();
	return (
		<Accordion
			titleAs="h6"
			label={`Méthodologie du test ${testNumber}`}
			className={classes.methodologyAccordion}
		>
			{renderMarkdown(methodology)}
		</Accordion>
	);
}

const useStyles = tss.withName(TestMethodology.name).create({
	methodologyAccordion: {
		marginLeft: fr.spacing("13v"),

		[fr.breakpoints.down("md")]: {
			marginLeft: 0,
		},

		"& > .fr-accordion__title > .fr-accordion__btn": {
			fontFamily: "Marianne",
			fontWeight: 400,
			fontSize: "18px",
			lineHeight: "32px",
			letterSpacing: 0,
			color: fr.colors.decisions.text.title.grey.default,
		},

		"& > .fr-collapse": {
			margin: 0,
		},

		"& > .fr-accordion__title > .fr-accordion__btn[aria-expanded='true']": {
			backgroundColor: "inherit",
		},
	},
});
