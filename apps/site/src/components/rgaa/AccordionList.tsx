"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import DisabledTopicAccordion from "./DisabledTopicAccordion";
import TopicCriteria from "./TopicCriteria";
import { type Criterias } from "./helpers/topics";
import { getReferentielStyle } from "./referentiels";
import { usePathname } from "next/navigation";
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
	const { classes } = useStyles({ topicAccordionBackgroundColor });
	const pathname = usePathname();

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
						<h2 className={classes.title}>
							<span className={classes.number}>{topic.number}.</span>
							<span>{topic.topic}</span>
							<Button
								iconId="fr-icon-links-fill"
								title={`Lien vers ${topic.number} ${topic.topic}`}
								priority="tertiary no outline"
								linkProps={{ href: `${pathname}#${topic.number}` }}
								className={classes.link}
							/>
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
			backgroundColor: topicAccordionBackgroundColor,
			paddingBlock: fr.spacing("4v"),
			paddingRight: fr.spacing("4v"),
			paddingLeft: fr.spacing("6v"),
			marginBottom: 0,
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
		number: {
			marginRight: fr.spacing("3v"),
		},
	}));
