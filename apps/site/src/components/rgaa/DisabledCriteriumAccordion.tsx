"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { tss } from "tss-react";
import { renderMarkdownInline } from "./helpers/markdown";

interface DisabledCriteriumAccordionProps {
	number: string;
	title: string;
}

export default function DisabledCriteriumAccordion({
	number,
	title,
}: DisabledCriteriumAccordionProps) {
	const { classes } = useStyles();

	return (
		<div id={number} className={classes.root}>
			<h3 className={classes.title}>
				<span>{number}. </span>
				<span>{renderMarkdownInline(title)}</span>
				<Badge small noIcon className={classes.badge}>
					Non applicable
				</Badge>
			</h3>
		</div>
	);
}

const useStyles = tss.withName(DisabledCriteriumAccordion.name).create({
	root: {
		scrollMarginTop: fr.spacing("2w"),
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
