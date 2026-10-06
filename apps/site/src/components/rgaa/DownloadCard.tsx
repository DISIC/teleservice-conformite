"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { Download } from "@codegouvfr/react-dsfr/Download";
import { tss } from "tss-react";
import CallOut, { type CallOutProps } from "@codegouvfr/react-dsfr/CallOut";

interface DownloadCardProps {
	title: string;
	downloadProps: {
		label: string;
		detail: string;
		href: string;
	}[];
	callOutProps?: Omit<CallOutProps, "children"> & { description: string };
}

export default function DownloadCard({
	title,
	downloadProps,
	callOutProps,
}: DownloadCardProps) {
	const { classes, cx } = useStyles();
	const { description, ...callOut } = callOutProps ?? {};

	return (
		<div className={classes.cardStyle}>
			<h2 className={cx("fr-h4")}>{title}</h2>
			{callOutProps && <CallOut {...callOut}>{description}</CallOut>}
			{downloadProps && (
				<ul>
					{downloadProps.map(({ label, detail, href }) => (
						<li key={href + label}>
							<Download details={detail} label={label} linkProps={{ href }} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

const useStyles = tss.withName(DownloadCard.name).create({
	cardStyle: {
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		padding: fr.spacing("8v"),
	},
});
