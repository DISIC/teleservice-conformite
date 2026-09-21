"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import DisabledTopicAccordion from "./DisabledTopicAccordion";
import { useNumberedAccordionStyles } from "./NumberedAccordion";
import TopicCriteria from "./TopicCriteria";
import { type Criterias } from "./helpers/topics";
import { getReferentielStyle } from "./referentiels";
import { usePathname } from "next/navigation";
import type { ReferentielInfos } from "./referentiels";

interface AccordionListProps {
	referentiel: ReferentielInfos;
	criterias: Criterias;
	expandedTopics: Record<string, boolean>;
	onTopicExpandedChange: (topic: string, expanded: boolean) => void;
}

export default function AccordionList({
	referentiel,
	criterias,
	expandedTopics,
	onTopicExpandedChange,
}: AccordionListProps) {
	const { topicAccordionBackgroundColor } = getReferentielStyle(referentiel.id);
	const { classes } = useStyles({ topicAccordionBackgroundColor });
	const { classes: linkClasses } = useNumberedAccordionStyles();
	const pathname = usePathname();

	// Not an fr-accordions-group: that DSFR group only lets one accordion stay open.
	return (
		<div className={classes.list}>
			{criterias.topics.map((topic) => {
				if (!topic.criteria.length)
					return (
						<DisabledTopicAccordion
							key={topic.topic}
							topicIndex={topic.number}
							topicName={topic.topic}
							referentielName={referentiel.title}
						/>
					);

				return (
					<div
						key={topic.number}
						id={`${topic.number}`}
						data-topic-accordion
						className={classes.topicAnchor}
					>
						<Accordion
							titleAs="h2"
							defaultExpanded={expandedTopics[topic.topic] ?? false}
							onExpandedChange={(expanded) =>
								onTopicExpandedChange(topic.topic, expanded)
							}
							label={
								<>
									{`${topic.number}. ${topic.topic}`}
									<Button
										iconId="fr-icon-links-fill"
										title={`Lien vers ${topic.number}. ${topic.topic}`}
										priority="tertiary no outline"
										linkProps={{
											href: `${pathname}#${topic.number}`,
											onClickCapture: (event) => event.stopPropagation(),
										}}
										className={linkClasses.link}
									/>
								</>
							}
							className={classes.topicAccordion}
						>
							<TopicCriteria referentielId={referentiel.id} topic={topic} />
						</Accordion>
					</div>
				);
			})}
		</div>
	);
}

const useStyles = tss
	.withName(AccordionList.name)
	.withParams<{ topicAccordionBackgroundColor: string }>()
	.create(({ topicAccordionBackgroundColor }) => ({
		list: {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("5w"),
		},
		topicAnchor: {
			scrollMarginTop: fr.spacing("2w"),
		},
		topicAccordion: {
			color: fr.colors.decisions.text.title.grey.default,
			borderLeft: `4px solid ${topicAccordionBackgroundColor}`,

			"&&::before": {
				boxShadow: "none",
			},

			"& > .fr-collapse": {
				borderBottom: "0px",
				paddingLeft: fr.spacing("3w"),

				[fr.breakpoints.down("md")]: {
					paddingLeft: fr.spacing("2w"),
					paddingRight: fr.spacing("2w"),
				},
			},

			"& > .fr-accordion__title > .fr-accordion__btn": {
				fontFamily: "Marianne",
				fontWeight: 700,
				fontSize: "32px",
				lineHeight: "40px",
				letterSpacing: 0,
				backgroundColor: topicAccordionBackgroundColor,
				color: fr.colors.decisions.text.title.grey.default,
				borderBottom: "0px",

				"--hover-tint": topicAccordionBackgroundColor,
				"--active-tint": topicAccordionBackgroundColor,
			},
		},
	}));
