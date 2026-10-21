"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { tss } from "tss-react";
import { belowStickyTopicHeading } from "./helpers/styles";
import { renderMarkdownInline } from "./helpers/markdown";

interface DisabledCriteriumAccordionProps {
	number: string;
	title: string;
}

export default function DisabledCriteriumAccordion({
	number,
	title,
}: DisabledCriteriumAccordionProps) {
	const { classes, cx } = useStyles();

	return (
		<div id={number} className={classes.root}>
			<h3 className={cx(fr.cx("fr-h4"), classes.title)}>
				<span>{number} </span>
				<span>{renderMarkdownInline(title)}</span>
				<Badge as="span" small noIcon className={classes.badge}>
					Non applicable
				</Badge>
			</h3>
		</div>
	);
}

const useStyles = tss.withName(DisabledCriteriumAccordion.name).create({
	root: {
		scrollMarginTop: belowStickyTopicHeading,
		marginBottom: fr.spacing("6w"),
		background: "inherit",
	},
	title: {
		margin: 0,
		color: fr.colors.decisions.text.disabled.grey.default,
	},
	badge: {
		marginLeft: fr.spacing("2v"),
		verticalAlign: "middle",
	},
});
