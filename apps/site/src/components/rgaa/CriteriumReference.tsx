"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import type { Appendix } from "@rgaa/content";
import CriteriumAppendix from "./CriteriumAppendix";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

type CriteriumReferenceProps = {
	criteriumNumber: string;
	appendix?: Appendix;
	defaultExpanded?: boolean;
	accordionBackgroundColor: string;
	onExpandedChange?: (expanded: boolean) => void;
};

export default function CriteriumReference({
	criteriumNumber,
	appendix,
	accordionBackgroundColor,
	defaultExpanded = false,
	onExpandedChange,
}: CriteriumReferenceProps) {
	const { classes } = useStyles({ accordionBackgroundColor });

	if (!appendix) return null;

	return (
		<div data-accordion="reference">
			<Accordion
				titleAs="h4"
				label={`Notes et références du critère ${criteriumNumber}`}
				className={classes.referenceAccordion}
				defaultExpanded={defaultExpanded}
				onExpandedChange={(value) => onExpandedChange?.(value)}
			>
				<CriteriumAppendix appendix={appendix} />
			</Accordion>
		</div>
	);
}

export const useStyles = tss
	.withName(CriteriumReference.name)
	.withParams<{ accordionBackgroundColor: string }>()
	.create(({ accordionBackgroundColor }) => ({
		referenceAccordion: {
			marginLeft: fr.spacing("13v"),

			[fr.breakpoints.down("md")]: {
				marginLeft: 0,
			},

			"& > .fr-accordion__title > .fr-accordion__btn": {
				fontFamily: "Marianne",
				fontWeight: 400,
				fontSize: "20px",
				lineHeight: "32px",
				letterSpacing: 0,
				color: fr.colors.decisions.text.title.grey.default,
			},

			"& > .fr-collapse": {
				margin: 0,
			},

			"& > .fr-accordion__title > .fr-accordion__btn[aria-expanded='true']": {
				backgroundColor: accordionBackgroundColor,
			},
		},
	}));
