import { tss } from "tss-react";
import exampleCriterias from "./reference-criterias.json";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import TopicSidebarList from "./TopicSidebarList";
import { getAllTopicNames } from "./helpers/topics";
import Button from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";
import AccordionList from "./AccordionList";
import type { Criterias } from "./helpers/topics";

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
	reference: "web" | "mobile" | "bureautique";
	criterias?: Criterias;
}

export default function CriteriaList({
	reference,
	criterias = exampleCriterias,
}: CriteriaListProps) {
	const [expanded, setExpanded] = useState(true);
	const { classes } = useStyles(colors[reference]);

	const allTopics = getAllTopicNames(criterias);

	return (
		<div className={classes.grid}>
			<div className={classes.leftSidebar}>
				<Badge className={classes.badge}>{criterias.reference}</Badge>
				<TopicSidebarList topics={allTopics} />
			</div>
			<div className={classes.rightContent}>
				<Button
					className={classes.toggleButton}
					iconId={
						expanded ? "ri-arrow-drop-down-line" : "ri-arrow-drop-up-line"
					}
					iconPosition="right"
					onClick={() => setExpanded((value) => !value)}
					priority="secondary"
				>
					{expanded ? "Tout déplier" : "Tout replier"}
				</Button>
				<AccordionList reference={reference} criterias={criterias} />
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
		},
		badge: {
			backgroundColor,
			color,
		},
		leftSidebar: {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("3w"),
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
