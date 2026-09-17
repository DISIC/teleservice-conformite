"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRef, useState } from "react";
import { tss } from "tss-react";
import AccordionList from "./AccordionList";
import { setCollapsesExpanded } from "./helpers/collapse";
import { type Criterias, getAllTopicNames } from "./helpers/topics";
import exampleCriterias from "./reference-criterias.json";
import type { ReferenceId } from "./references";
import TopicSidebarList from "./TopicSidebarList";

const colors = {
	web: {
		backgroundColor: fr.colors.decisions.background.alt.pinkMacaron.default,
		color: fr.colors.decisions.text.actionHigh.pinkMacaron.default,
	},
	mobile: {
		backgroundColor: fr.colors.decisions.background.alt.yellowTournesol.default,
		color: fr.colors.decisions.text.actionHigh.yellowTournesol.default,
	},
	bureautique: {
		backgroundColor: fr.colors.decisions.background.alt.greenEmeraude.default,
		color: fr.colors.decisions.text.actionHigh.greenEmeraude.default,
	},
};

interface CriteriaListProps {
	reference: ReferenceId;
	criterias?: Criterias;
}

export default function CriteriaList({
	reference,
	criterias = exampleCriterias,
}: CriteriaListProps) {
	const { classes } = useStyles(colors[reference]);

	const allTopics = getAllTopicNames(criterias);

	const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(
		() => Object.fromEntries(allTopics.map((topic) => [topic, true])),
	);

	const topicsRef = useRef<HTMLDivElement>(null);

	const allExpanded = allTopics.every((topic) => expandedTopics[topic]);

	const toggleAll = () => {
		setExpandedTopics(
			allExpanded
				? {}
				: Object.fromEntries(allTopics.map((topic) => [topic, true])),
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
				<Badge className={classes.badge}>{criterias.reference}</Badge>
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
					reference={reference}
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
			gridTemplateColumns: "1fr 2fr",
			gap: fr.spacing("4w"),
			[fr.breakpoints.down("md")]: {
				gridTemplateColumns: "1fr",
				gridAutoFlow: "row",
			},
		},
		badge: {
			alignSelf: "center",
			backgroundColor,
			color,
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
