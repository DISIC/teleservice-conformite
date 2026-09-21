"use client";

import SideMenu from "@codegouvfr/react-dsfr/SideMenu";
import type { MarkdownHeading } from "~/lib/content";

interface SectionSidebarListProps {
	sections: MarkdownHeading[];
}

export default function SectionSidebarList({
	sections,
}: SectionSidebarListProps) {
	const items = sections.map(({ id, label }) => ({
		text: label,
		linkProps: { href: `#${id}` },
	}));

	return (
		<SideMenu
			aria-label="Sommaire"
			burgerMenuButtonText="Dans cette rubrique"
			items={items}
			sticky
		/>
	);
}
