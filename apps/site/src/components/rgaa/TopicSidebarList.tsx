"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { tss } from "tss-react";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";

const READING_LINE = 0.2;

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

	useEffect(() => {
		const anchors = topics
			.map(({ number }) => document.getElementById(`${number}`))
			.filter((anchor) => anchor !== null);

		const selectReadTopic = () => {
			const line = window.innerHeight * READING_LINE;
			const read = anchors.filter(
				(anchor) => anchor.getBoundingClientRect().top <= line,
			);
			const current = read.at(-1) ?? anchors[0];
			if (current) setSelectedNumber(Number(current.id));
		};

		const observer = new IntersectionObserver(selectReadTopic, {
			rootMargin: `0px 0px -${100 - READING_LINE * 100}% 0px`,
		});
		for (const anchor of anchors) observer.observe(anchor);

		return () => observer.disconnect();
	}, [topics]);

	const items = topics.map((topic) => {
		return {
			isActive: topic.number === selectedNumber,
			text: (
				<div className={classes.menuItem}>
					{`${topic.number}. ${topic.topic}`}
					{topic.notApplicable && (
						<Badge as="span" small noIcon className={classes.badge}>
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
