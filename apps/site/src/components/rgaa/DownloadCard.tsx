"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { Download } from "@codegouvfr/react-dsfr/Download";
import type { ReactNode } from "react";
import { tss } from "tss-react";

interface DownloadCardProps {
	title: string;
	downloadProps?: {
		label: string;
		detail: string;
		href: string;
	}[];
	children?: ReactNode;
}

export default function DownloadCard({
	title,
	downloadProps,
	children,
}: DownloadCardProps) {
	const { classes, cx } = useStyles();

	return (
		<div className={classes.cardStyle}>
			<h2 className={cx("fr-h4")}>{title}</h2>
			{downloadProps && (
				<ul>
					{downloadProps.map(({ label, detail, href }) => (
						<li key={href + label}>
							<Download details={detail} label={label} linkProps={{ href }} />
						</li>
					))}
				</ul>
			)}
			{children}
		</div>
	);
}

const useStyles = tss.withName(DownloadCard.name).create({
	cardStyle: {
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		padding: fr.spacing("8v"),
	},
});
