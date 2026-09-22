"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { Download } from "@codegouvfr/react-dsfr/Download";
import { tss } from "tss-react";

interface DownloadCardProps {
	title: string;
	downloadProps: {
		label: string;
		detail: string;
		href: string;
	}[];
}

export default function DownloadCard({
	title,
	downloadProps,
}: DownloadCardProps) {
	const { classes } = useStyles();

	return (
		<div className={classes.cardStyle}>
			<h4 className={classes.cardTitleStyle}>{title}</h4>
			<ul>
				{downloadProps.map(({ label, detail, href }) => (
					<li key={href + label}>
						<Download details={detail} label={label} linkProps={{ href }} />
					</li>
				))}
			</ul>
		</div>
	);
}

const useStyles = tss.withName(DownloadCard.name).create({
	cardStyle: {
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		padding: fr.spacing("8v"),
	},
	cardTitleStyle: {
		fontSize: "24px",
		lineHeight: "32px",
		fontFamily: "Marianne",
		fontWeight: 700,
	},
});
