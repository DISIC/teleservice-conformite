"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import type { Criterias } from "./helpers/topics";
import type { ReferentielId } from "@rgaa/content";
import { getReferentielStyle } from "./referentiels";
import AnchorLinkButton from "./AnchorLinkButton";
import CriteriumReference from "./CriteriumReference";
import CriteriumTests from "./CriteriumTests";
import DisabledCriteriumAccordion from "./DisabledCriteriumAccordion";
import { renderMarkdownInline, toPlainText } from "./helpers/markdown";
import {
	belowStickyTopicHeading,
	useNumberedHeadingStyles,
} from "./helpers/styles";

type TopicCriteriaProps = {
	referentielId: ReferentielId;
	topic: Criterias["topics"][number];
};

export default function TopicCriteria({
	referentielId,
	topic,
}: TopicCriteriaProps) {
	const { testAccordionBackgroundColor } = getReferentielStyle(referentielId);
	const { classes, cx } = useStyles();
	const { classes: headingClasses } = useNumberedHeadingStyles();

	return (
		<div className={classes.topicCriteria}>
			{topic.criteria.map(({ criterium }) => {
				const criteriumNumber = `${topic.number}.${criterium.number}`;

				if (!criterium.tests.length) {
					return (
						<DisabledCriteriumAccordion
							key={`${criterium.title} ${criterium.number}`}
							title={criterium.title}
							number={criteriumNumber}
						/>
					);
				}

				return (
					<div
						key={`${criterium.title} ${criteriumNumber}`}
						id={criteriumNumber}
						className={classes.criteriumContainer}
					>
						<h3 className={cx("fr-h4", headingClasses.title)}>
							<span className={headingClasses.number}>{criteriumNumber}</span>
							<span>
								{renderMarkdownInline(criterium.title)}
								<AnchorLinkButton
									targetId={criteriumNumber}
									title={`Lien vers ${criteriumNumber} ${toPlainText(criterium.title)}`}
								/>
							</span>
						</h3>
						<CriteriumTests
							criteriumNumber={criteriumNumber}
							tests={criterium.tests}
							accordionBackgroundColor={testAccordionBackgroundColor}
						/>
						<CriteriumReference
							criteriumNumber={criteriumNumber}
							appendix={criterium.appendix}
							accordionBackgroundColor={testAccordionBackgroundColor}
						/>
					</div>
				);
			})}
		</div>
	);
}

const useStyles = tss.withName(TopicCriteria.name).create({
	topicCriteria: {
		marginLeft: fr.spacing("6v"),
		marginBlock: fr.spacing("6v"),

		[fr.breakpoints.down("md")]: {
			marginInline: fr.spacing("4v"),
			marginBlock: fr.spacing("6v"),
		},
	},
	criteriumContainer: {
		scrollMarginTop: belowStickyTopicHeading,
		marginBottom: fr.spacing("12v"),
	},
});
