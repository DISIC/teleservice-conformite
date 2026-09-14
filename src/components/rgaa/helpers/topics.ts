import type { Criterias } from "../CriteriaList";

export function getAllTopicNames(criterias: Criterias): string[] {
	return criterias.topics.map((topic) => topic.topic);
}
