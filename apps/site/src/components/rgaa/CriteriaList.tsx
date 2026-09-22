"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useRef, useState } from "react";
import { tss } from "tss-react";
import AccordionList from "./AccordionList";
import { setCollapsesExpanded } from "./helpers/collapse";
import { type Criterias, getTopicSidebarItem } from "./helpers/topics";
import PopoverButton, { type DisplayOption } from "./PopoverButton";
import { getReferentielStyle, type ReferentielInfos } from "./referentiels";
import TopicSidebarList from "./TopicSidebarList";

const TOPIC_COLLAPSE = "[data-topic-accordion] > .fr-accordion > .fr-collapse";
const CRITERIUM_COLLAPSE =
	'[data-accordion="criterium"] > .fr-accordion > .fr-collapse';
const TEST_COLLAPSE = '[data-accordion="test"] > .fr-accordion > .fr-collapse';

// Each option opens its own level and the levels above it, otherwise what it opens stays out of sight.
const DISPLAY_OPTION_SELECTORS: Record<DisplayOption, string[]> = {
	all: [TOPIC_COLLAPSE, CRITERIUM_COLLAPSE, TEST_COLLAPSE],
	tests: [TOPIC_COLLAPSE, CRITERIUM_COLLAPSE],
	methodologies: [TOPIC_COLLAPSE, CRITERIUM_COLLAPSE, TEST_COLLAPSE],
};

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

	const applyDisplayOption = (option: DisplayOption) => {
		const root = topicsRef.current;

		if (!root) return;

		setExpandedTopics(
			Object.fromEntries(allTopics.map((topic) => [topic.topic, true])),
		);

		for (const selector of DISPLAY_OPTION_SELECTORS[option]) {
			setCollapsesExpanded(root.querySelectorAll(selector), true);
		}
	};

	return (
		<div className={classes.grid}>
			<div className={classes.leftSidebar}>
				<Badge className={classes.badge}>{criterias.referentiel}</Badge>
				<TopicSidebarList topics={allTopics} />
			</div>
			<div className={classes.rightContent} ref={topicsRef}>
				<PopoverButton onValidate={applyDisplayOption} />
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
	}));
