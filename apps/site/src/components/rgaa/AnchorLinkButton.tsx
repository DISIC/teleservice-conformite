"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import type { MouseEvent } from "react";
import { useNumberedHeadingStyles } from "./helpers/styles";

interface AnchorLinkButtonProps {
	targetId: string;
	title: string;
}

export default function AnchorLinkButton({
	targetId,
	title,
}: AnchorLinkButtonProps) {
	const { classes } = useNumberedHeadingStyles();

	// The browser does not scroll again when the hash is already the target's.
	const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		if (window.location.hash !== `#${targetId}`)
			window.location.hash = targetId;
		else document.getElementById(targetId)?.scrollIntoView({ block: "start" });
	};

	return (
		<Button
			iconId="fr-icon-links-fill"
			title={title}
			priority="tertiary no outline"
			size="small"
			linkProps={{ href: `#${targetId}`, onClick }}
			className={classes.link}
		/>
	);
}
