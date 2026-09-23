"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { useRef, useState } from "react";
import { tss } from "tss-react";
import type { Criterias } from "./helpers/topics";
import { getReferentielStyle, type ReferentielId } from "./referentiels";
import CriteriumReference from "./CriteriumReference";
import CriteriumTests from "./CriteriumTests";
import DisabledCriteriumAccordion from "./DisabledCriteriumAccordion";
import { renderMarkdownInline } from "./helpers/markdown";
import Button from "@codegouvfr/react-dsfr/Button";
import { usePathname } from "next/navigation";

type TopicCriteriaProps = {
	referentielId: ReferentielId;
	topic: Criterias["topics"][number];
};

export default function TopicCriteria({
	referentielId,
	topic,
}: TopicCriteriaProps) {
	const pathname = usePathname();
	const { testAccordionBackgroundColor } = getReferentielStyle(referentielId);
	const { classes, cx } = useStyles();
	const [expandedCriteria, setExpandedCriteria] = useState<
		Record<string, boolean>
	>({});
	const [expandedReferences, setExpandedReferences] = useState<
		Record<string, boolean>
	>({});
	const criteriaRef = useRef<HTMLDivElement>(null);

	return (
		<div ref={criteriaRef} className={classes.topicCriteria}>
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
						className={classes.criteriumContainer}
					>
						<h3 className={cx("fr-h4")}>
							<span className={classes.number}>{criteriumNumber}</span>
							<span>{renderMarkdownInline(criterium.title)}</span>
							<Button
								iconId="fr-icon-links-fill"
								title={`Lien vers ${criteriumNumber} ${criterium.title}`}
								priority="tertiary no outline"
								linkProps={{ href: `${pathname}#${criteriumNumber}` }}
								className={classes.link}
							/>
						</h3>
						<CriteriumTests
							criteriumNumber={criteriumNumber}
							tests={criterium.tests}
							defaultExpanded={expandedCriteria[criterium.number] ?? false}
							onExpandedChange={(expanded) =>
								setExpandedCriteria((value) => ({
									...value,
									[criterium.number]: expanded,
								}))
							}
							accordionBackgroundColor={testAccordionBackgroundColor}
						/>
						<CriteriumReference
							criteriumNumber={criteriumNumber}
							appendix={criterium.appendix}
							defaultExpanded={expandedReferences[criterium.number] ?? false}
							onExpandedChange={(expanded) =>
								setExpandedReferences((value) => ({
									...value,
									[criterium.number]: expanded,
								}))
							}
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
		marginBottom: fr.spacing("12v"),
	},
	link: {
		"&&": {
			color: fr.colors.decisions.text.mention.grey.default,
			backgroundColor: "transparent",
			"--hover-tint": "transparent",
			"--active-tint": "transparent",

			"&:hover, &:active": {
				color: fr.colors.decisions.text.title.grey.default,
			},
		},
	},
	titleContainer: {
		marginBottom: fr.spacing("6v"),
		display: "flex",
		alignItems: "center",

		"& > h3": {
			marginBottom: 0,
		},
	},
	number: {
		marginRight: fr.spacing("3v"),
	},
});
