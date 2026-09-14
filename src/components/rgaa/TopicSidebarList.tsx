import Badge from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useRouter } from "next/router";
import { useState } from "react";

const DEFAULT_TOPICS = [
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

interface TopicSidebarListProps {
	topics: string[];
}

export default function TopicSidebarList({ topics }: TopicSidebarListProps) {
	const { classes } = useStyles();
	const { pathname } = useRouter();
	const [selectedTopic, setSelectedTopic] = useState(DEFAULT_TOPICS[0]);

	return (
		<div className={classes.root}>
			<h6 className={classes.title}>Thématiques</h6>
			<ol className={classes.list}>
				{DEFAULT_TOPICS.map((topic, index) => (
					<li key={topic} className={classes.item}>
						<a
							href={`${pathname}#${index + 1}`}
							className={classes.link}
							aria-current={topic === selectedTopic ? "page" : undefined}
							onClick={() => setSelectedTopic(topic)}
						>
							{`${index + 1}. ${topic}`}
							{topic === selectedTopic && (
								<span className={classes.selectedLabel}> (sélectionné)</span>
							)}
						</a>
						{!topics.includes(topic) && (
							<Badge small noIcon>
								Non applicable
							</Badge>
						)}
					</li>
				))}
			</ol>
		</div>
	);
}

const useStyles = tss.withName(TopicSidebarList.name).create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2w"),
	},
	title: {
		margin: 0,
	},
	list: {
		display: "flex",
		flexDirection: "column",
		margin: 0,
		paddingLeft: 0,
	},
	item: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("3v"),
		padding: `${fr.spacing("3v")} 0`,
	},
	link: {
		fontFamily: "Marianne",
		fontWeight: 700,
		fontSize: "16px",
		lineHeight: "24px",
		letterSpacing: "0%",
		textDecoration: "none",
		"--underline-img": "none",
		color: fr.colors.decisions.text.default.grey.default,
		borderLeft: "2px solid transparent",
		paddingLeft: fr.spacing("2v"),

		"&[aria-current='page']": {
			color: fr.colors.decisions.text.active.blueFrance.default,
			borderLeftColor: fr.colors.decisions.border.active.blueFrance.default,
		},
	},
	selectedLabel: {
		fontWeight: 400,
	},
});
