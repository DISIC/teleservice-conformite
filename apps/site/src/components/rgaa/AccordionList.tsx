"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { useEffect, useRef } from "react";
import { tss } from "tss-react";
import AnchorLinkButton from "./AnchorLinkButton";
import DisabledTopicAccordion from "./DisabledTopicAccordion";
import TopicCriteria from "./TopicCriteria";
import { type Criterias } from "./helpers/topics";
import { useNumberedHeadingStyles } from "./helpers/styles";
import { getReferentielStyle } from "./referentiels";
import type { ReferentielInfos } from "./referentiels";

interface AccordionListProps {
	referentiel: ReferentielInfos;
	criterias: Criterias;
}

export default function AccordionList({
	referentiel,
	criterias,
}: AccordionListProps) {
	const { topicAccordionBackgroundColor } = getReferentielStyle(referentiel.id);
	const { classes, cx } = useStyles({ topicAccordionBackgroundColor });
	const { classes: headingClasses } = useNumberedHeadingStyles();
	const listRef = useRef<HTMLDivElement>(null);

	// Titles wrap differently per width, so each topic publishes its sticky heading's real height.
	useEffect(() => {
		const headings = listRef.current?.querySelectorAll<HTMLElement>(
			"[data-topic-accordion] > h2",
		);
		if (!headings) return;

		const observer = new ResizeObserver((entries) => {
			for (const { target } of entries) {
				const heading = target as HTMLElement;
				heading.parentElement?.style.setProperty(
					"--topic-heading-height",
					`${heading.offsetHeight}px`,
				);
			}
		});
		for (const heading of headings) observer.observe(heading);

		return () => observer.disconnect();
	}, []);

	return (
		<div className={classes.list} ref={listRef}>
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
						<h2 className={cx(classes.title, headingClasses.title)}>
							<span className={headingClasses.number}>
								{topic.number}.&nbsp;
							</span>
							<span>
								{topic.topic}
								<AnchorLinkButton
									targetId={`${topic.number}`}
									title={`Lien vers ${topic.number} ${topic.topic}`}
								/>
							</span>
						</h2>
						<TopicCriteria referentielId={referentiel.id} topic={topic} />
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
			borderLeft: `4px solid ${topicAccordionBackgroundColor}`,
		},
		title: {
			position: "sticky",
			top: 0,
			// DSFR lifts an accordion holding focus to z-index 1.
			zIndex: 2,
			backgroundColor: topicAccordionBackgroundColor,
			paddingBlock: fr.spacing("4v"),
			paddingRight: fr.spacing("4v"),
			paddingLeft: fr.spacing("6v"),
			marginBottom: 0,
		},
	}));
