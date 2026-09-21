import type { Appendix } from "@rgaa/content";
import type { TopicSidebarItem } from "../TopicSidebarList";

export type Test = {
	number: string;
	label: string;
	conditions: string[];
	methodologies?: string[];
};

export type Criterium = {
	number: string;
	title: string;
	tests: Test[];
	appendix?: Appendix;
};

export type Criteria = {
	number: string;
	criterium: Criterium;
};

export type Topic = {
	topic: string;
	number: number;
	criteria: Criteria[];
};

export type Criterias = {
	referentiel: string;
	topics: Topic[];
};

export function getTopicSidebarItem(criterias: Criterias): TopicSidebarItem[] {
	return criterias.topics.map((topic) => ({
		topic: topic.topic,
		number: topic.number,
		notApplicable: !topic.criteria.length,
	}));
}
