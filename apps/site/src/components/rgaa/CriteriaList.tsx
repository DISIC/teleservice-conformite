"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useRef } from "react";
import { tss } from "tss-react";
import AccordionList from "./AccordionList";
import { setCollapsesExpanded } from "./helpers/collapse";
import { type Criterias, getTopicSidebarItem } from "./helpers/topics";
import PopoverButton, { type DisplayOption } from "./PopoverButton";
import { getReferentielStyle, type ReferentielInfos } from "./referentiels";
import TopicSidebarList from "./TopicSidebarList";

const TOPIC_COLLAPSE = "[data-topic-accordion] > .fr-accordion > .fr-collapse";
const TEST_COLLAPSE = '[data-accordion="test"] > .fr-accordion > .fr-collapse';
const REFERENCE_COLLAPSE =
	'[data-accordion="reference"] > .fr-accordion > .fr-collapse';

const DISPLAY_OPTION_SELECTORS: Record<
	DisplayOption,
	{ expand: string[]; collapse: string[] }
> = {
	all: {
		expand: [TOPIC_COLLAPSE, TEST_COLLAPSE, REFERENCE_COLLAPSE],
		collapse: [],
	},
	tests: {
		expand: [TOPIC_COLLAPSE, TEST_COLLAPSE],
		collapse: [REFERENCE_COLLAPSE],
	},
	references: {
		expand: [TOPIC_COLLAPSE, REFERENCE_COLLAPSE],
		collapse: [TEST_COLLAPSE],
	},
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

	const topicsRef = useRef<HTMLDivElement>(null);

	const applyDisplayOption = (option: DisplayOption) => {
		const root = topicsRef.current;

		if (!root) return;

		const { expand, collapse } = DISPLAY_OPTION_SELECTORS[option];

		for (const selector of expand) {
			setCollapsesExpanded(root.querySelectorAll(selector), true);
		}
		for (const selector of collapse) {
			setCollapsesExpanded(root.querySelectorAll(selector), false);
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
				<AccordionList referentiel={referentiel} criterias={criterias} />
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
