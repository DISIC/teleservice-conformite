import Badge from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

interface DisabledTopicAccordionProps {
	topicName: string;
	topicIndex: number;
	referenceName: string;
}

export default function DisabledTopicAccordion({
	topicName,
	topicIndex,
	referenceName,
}: DisabledTopicAccordionProps) {
	const { classes, cx } = useStyles();

	return (
		<div id={`${topicIndex}`} className={classes.root}>
			<div className={classes.header}>
				<h2 className={classes.title}>{`${topicIndex}. ${topicName}`}</h2>
				<span className={cx(fr.cx("ri-links-line"), classes.icon)} />
				<Badge small noIcon>
					Non applicable
				</Badge>
			</div>
			<p className={classes.description}>
				{`Cette thématique n’est pas applicable au référentiel ${referenceName}.`}
			</p>
		</div>
	);
}

const useStyles = tss.withName(DisabledTopicAccordion.name).create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
		padding: fr.spacing("3w"),
		background: fr.colors.decisions.background.alt.grey.default,
	},
	header: {
		display: "inline",
	},
	title: {
		display: "inline",
		margin: 0,
		marginRight: fr.spacing("2v"),
		color: fr.colors.decisions.text.disabled.grey.default,
	},
	icon: {
		display: "inline",
		marginRight: fr.spacing("2v"),
		color: fr.colors.decisions.text.disabled.grey.default,

		"&::before": {
			"--icon-size": "1.5rem",
		},
	},
	description: {
		margin: 0,
		color: fr.colors.decisions.text.default.grey.default,
	},
});
