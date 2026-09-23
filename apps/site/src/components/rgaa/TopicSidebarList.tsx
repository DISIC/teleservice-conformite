"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { tss } from "tss-react";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";

export type TopicSidebarItem = {
	number: number;
	topic: string;
	notApplicable: boolean;
};

interface TopicSidebarListProps {
	topics: TopicSidebarItem[];
}

export default function TopicSidebarList({ topics }: TopicSidebarListProps) {
	const { classes } = useStyles();
	const pathname = usePathname();
	const [selectedNumber, setSelectedNumber] = useState(topics[0]?.number);

	const items = topics.map((topic) => {
		return {
			isActive: topic.number === selectedNumber,
			text: (
				<div className={classes.menuItem}>
					{`${topic.number}. ${topic.topic}`}
					{topic.notApplicable && (
						<Badge small noIcon className={classes.badge}>
							Non applicable
						</Badge>
					)}
				</div>
			),
			linkProps: {
				href: `${pathname}#${topic.number}`,
				onClick: () => setSelectedNumber(topic.number),
			},
		};
	});

	return (
		<SideMenu
			title="Thématiques"
			burgerMenuButtonText="Dans cette rubrique"
			items={items}
			sticky
		/>
	);
}

const useStyles = tss.withName(TopicSidebarList.name).create({
	badge: {
		marginLeft: fr.spacing("2v"),
	},
	menuItem: {
		display: "inline",
	},
});
