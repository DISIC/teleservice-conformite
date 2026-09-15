export type Test = {
	number: string;
	label: string;
	methodologies?: string[];
};

export type Criterium = {
	number: string;
	title: string;
	tests: Test[];
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
	reference: string;
	topics: Topic[];
};

export const DEFAULT_TOPICS = [
	"Images",
	"Cadres",
	"Couleurs",
	"Multimédia",
	"Tableaux",
	"Liens",
	"Scripts et composants interactifs",
	"Éléments obligatoires",
	"Structuration de l’information",
	"Présentation de l’information",
	"Formulaires",
	"Navigation",
	"Consultation",
	"Documentation et fonctionnalités d’accessibilité",
	"Outils d’édition",
	"Services d’assistance",
	"Communication en temps réel",
];

export function getAllTopicNames(criterias: Criterias): string[] {
	return criterias.topics.map((topic) => topic.topic);
}
