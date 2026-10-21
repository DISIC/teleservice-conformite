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

const TEST_COLLAPSE = '[data-accordion="test"] > .fr-accordion > .fr-collapse';
const REFERENCE_COLLAPSE =
	'[data-accordion="reference"] > .fr-accordion > .fr-collapse';

const COLLAPSE_GROUPS = [
	{
		selector: `${TEST_COLLAPSE}, ${REFERENCE_COLLAPSE}`,
		expandLabel: "Tout déplier",
		collapseLabel: "Tout replier",
	},
	{
		selector: TEST_COLLAPSE,
		expandLabel: "Déplier les tests",
		collapseLabel: "Replier les tests",
	},
	{
		selector: REFERENCE_COLLAPSE,
		expandLabel: "Déplier les notes et références",
		collapseLabel: "Replier les notes et références",
	},
];

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

	const getDisplayOptions = (): DisplayOption[] => {
		const root = topicsRef.current;

		if (!root) return [];

		// A group still unfolds while any of its accordions is folded.
		return COLLAPSE_GROUPS.map(({ selector, expandLabel, collapseLabel }) => {
			const collapses = [...root.querySelectorAll(selector)];
			const allExpanded = collapses.every((collapse) =>
				collapse.classList.contains("fr-collapse--expanded"),
			);

			return {
				label: allExpanded ? collapseLabel : expandLabel,
				onSelect: () => setCollapsesExpanded(collapses, !allExpanded),
			};
		});
	};

	return (
		<div className={classes.grid}>
			<div className={classes.leftSidebar}>
				<Badge as="span" className={classes.badge}>
					{criterias.referentiel}
				</Badge>
				<TopicSidebarList topics={allTopics} />
			</div>
			<div className={classes.rightContent} ref={topicsRef}>
				<PopoverButton getOptions={getDisplayOptions} />
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
