"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRef, useState } from "react";
import { tss } from "tss-react";
import AccordionList from "./AccordionList";
import { setCollapsesExpanded } from "./helpers/collapse";
import { type Criterias, getTopicSidebarItem } from "./helpers/topics";
import { getReferentielStyle, type ReferentielInfos } from "./referentiels";
import TopicSidebarList from "./TopicSidebarList";

interface CriteriaListProps {
	referentiel: ReferentielInfos;
	criterias: Criterias;
}

export default function CriteriaList({
	referentiel,
	criterias,
}: CriteriaListProps) {
	const allTopics = getTopicSidebarItem(criterias);
	const { badgeBackgroundColor, badgeColor } = getReferentielStyle(
		referentiel.id,
	);

	const { classes } = useStyles({
		backgroundColor: badgeBackgroundColor,
		color: badgeColor,
	});

	const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(
		() => Object.fromEntries(allTopics.map((topic) => [topic.topic, true])),
	);

	const topicsRef = useRef<HTMLDivElement>(null);

	const allExpanded = allTopics.every((topic) => expandedTopics[topic.topic]);

	const toggleAll = () => {
		setExpandedTopics(
			allExpanded
				? {}
				: Object.fromEntries(allTopics.map((topic) => [topic.topic, true])),
		);
		setCollapsesExpanded(
			topicsRef.current?.querySelectorAll(
				"[data-topic-accordion] > .fr-accordion > .fr-collapse",
			) ?? [],
			!allExpanded,
		);
	};

	return (
		<div className={classes.grid}>
			<div className={classes.leftSidebar}>
				<Badge className={classes.badge}>{criterias.referentiel}</Badge>
				<TopicSidebarList topics={allTopics} />
			</div>
			<div className={classes.rightContent} ref={topicsRef}>
				<Button
					className={classes.toggleButton}
					iconId={allExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}
					iconPosition="right"
					onClick={toggleAll}
					priority="secondary"
				>
					{allExpanded ? "Tout replier" : "Tout déplier"}
				</Button>
				<AccordionList
					referentiel={referentiel}
					criterias={criterias}
					expandedTopics={expandedTopics}
					onTopicExpandedChange={(topic, expanded) =>
						setExpandedTopics((value) => ({ ...value, [topic]: expanded }))
					}
				/>
			</div>
		</div>
	);
}

const useStyles = tss
	.withName(CriteriaList.name)
	.withParams<{ backgroundColor: string; color: string }>()
	.create(({ backgroundColor, color }) => ({
		grid: {
			display: "grid",
			gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)",
			gap: fr.spacing("4w"),
			[fr.breakpoints.down("md")]: {
				gridTemplateColumns: "minmax(0, 1fr)",
				gridAutoFlow: "row",
			},
		},
		badge: {
			alignSelf: "left",
			backgroundColor,
			color,
			[fr.breakpoints.down("md")]: {
				alignSelf: "center",
			},
		},
		leftSidebar: {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("3w"),
			[fr.breakpoints.down("md")]: {
				flexDirection: "column-reverse",
			},
		},
		rightContent: {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("5w"),
		},
		toggleButton: {
			alignSelf: "flex-end",
		},
	}));
