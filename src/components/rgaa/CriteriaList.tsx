import { tss } from "tss-react";
import exampleCriterias from "./reference-criterias.json";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import TopicSidebarList from "./TopicSidebarList";
import { getAllTopicNames } from "./helpers/topics";

export type Test = {
	number: number;
	label: string;
	conditions?: string[];
};

export type Criterium = {
	number: number;
	title: string;
	tests: Test[];
};

export type Criteria = {
	criterium: Criterium;
};

export type Topic = {
	topic: string;
	number: number;
	criteria: Criteria[];
};

export type Criterias = {
	reference: string;
	topics: Topic[];
};

interface CriteriaListProps {
	reference: "web" | "mobile" | "bureautique";
	criterias?: Criterias;
}

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

export default function CriteriaList({
	reference,
	criterias = exampleCriterias,
}: CriteriaListProps) {
	const { classes } = useStyles(colors[reference]);

	const allTopics = getAllTopicNames(criterias);

	return (
		<div className={classes.grid}>
			<div className={classes.leftSidebar}>
				<Badge className={classes.badge}>{criterias.reference}</Badge>
				<TopicSidebarList topics={allTopics} />
			</div>
			{/* <div><AccordionList /></div> */}
		</div>
	);
}

const useStyles = tss
	.withName(CriteriaList.name)
	.withParams<{ backgroundColor: string; color: string }>()
	.create(({ backgroundColor, color }) => ({
		grid: {
			display: "grid",
			gridTemplateColumns: "auto 1fr",
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
	}));
