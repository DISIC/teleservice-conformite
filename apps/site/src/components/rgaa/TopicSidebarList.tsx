"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { tss } from "tss-react";
import { DEFAULT_TOPICS } from "./helpers/topics";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";

interface TopicSidebarListProps {
	topics: string[];
}

export default function TopicSidebarList({ topics }: TopicSidebarListProps) {
	const { classes } = useStyles();
	const pathname = usePathname();
	const [selectedTopic, setSelectedTopic] = useState(DEFAULT_TOPICS[0]);

	const items = DEFAULT_TOPICS.map((topic, index) => {
		const isActive = topic === selectedTopic;

		return {
			isActive,
			text: (
				<div className={classes.menuItem}>
					{`${index + 1}. ${topic}`}
					{isActive && (
						<span className={classes.selectedLabel}>(sélectionné)</span>
					)}
					{!topics.includes(topic) && (
						<Badge small noIcon className={classes.badge}>
							Non applicable
						</Badge>
					)}
				</div>
			),
			linkProps: {
				href: `${pathname}#${index + 1}`,
				onClick: () => setSelectedTopic(topic),
			},
		};
	});

	return (
		<SideMenu
			title="Thématiques"
			burgerMenuButtonText="Thématiques"
			items={items}
			sticky
		/>
	);
}

const useStyles = tss.withName(TopicSidebarList.name).create({
	selectedLabel: {
		fontWeight: 400,
		marginLeft: fr.spacing("1v"),
	},
	badge: {
		marginLeft: fr.spacing("2v"),
	},
	menuItem: {
		display: "inline",
	},
});
