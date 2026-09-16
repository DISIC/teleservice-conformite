"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import DisabledTopicAccordion from "./DisabledTopicAccordion";
import { useNumberedAccordionStyles } from "./NumberedAccordion";
import TopicCriteria from "./TopicCriteria";
import { colors } from "./helpers/colors";
import { DEFAULT_TOPICS, type Criterias } from "./helpers/topics";
import type { ReferenceId } from "./references";
import { usePathname } from "next/navigation";

interface AccordionListProps {
	reference: ReferenceId;
	criterias: Criterias;
	expandedTopics: Record<string, boolean>;
	onTopicExpandedChange: (topic: string, expanded: boolean) => void;
}

export default function AccordionList({
	reference,
	criterias,
	expandedTopics,
	onTopicExpandedChange,
}: AccordionListProps) {
	const { classes } = useStyles(colors[reference]);
	const { classes: linkClasses } = useNumberedAccordionStyles();
	const pathname = usePathname();

	// Not an fr-accordions-group: that DSFR group only lets one accordion stay open.
	return (
		<div className={classes.list}>
			{DEFAULT_TOPICS.map((topic, index) => {
				const applicationTopic = criterias.topics.find(
					(t) => t.topic === topic,
				);

				if (!applicationTopic)
					return (
						<DisabledTopicAccordion
							key={topic}
							topicIndex={index + 1}
							topicName={topic}
							referenceName={criterias.reference}
						/>
					);

				return (
					<div
						key={applicationTopic.topic}
						id={`${index + 1}`}
						data-topic-accordion
						className={classes.topicAnchor}
					>
						<Accordion
							titleAs="h2"
							defaultExpanded={expandedTopics[applicationTopic.topic] ?? false}
							onExpandedChange={(expanded) =>
								onTopicExpandedChange(applicationTopic.topic, expanded)
							}
							label={
								<>
									{`${index + 1}. ${topic}`}
									<Button
										iconId="fr-icon-links-fill"
										title={`Lien vers ${index + 1}. ${topic}`}
										priority="tertiary no outline"
										linkProps={{
											href: `${pathname}#${index + 1}`,
											onClickCapture: (event) => event.stopPropagation(),
										}}
										className={linkClasses.link}
									/>
								</>
							}
							className={classes.topicAccordion}
						>
							<TopicCriteria reference={reference} topic={applicationTopic} />
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
