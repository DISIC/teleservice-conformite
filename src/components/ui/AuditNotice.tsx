import { fr } from "@codegouvfr/react-dsfr";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import type { ComponentType, ReactNode } from "react";
import { tss } from "tss-react";

type AuditNoticeProps = {
	/** DSFR pictogram component (e.g. `Error`). */
	Pictogram: ComponentType<{ className?: string }>;
	heading: ReactNode;
	/** Notice body — description text and any links. */
	children: ReactNode;
};

/**
 * Fixed notice layout (pictogram + heading + body) for audit Sub-sections that
 * are not applicable. Only the content varies between cases — e.g. the
 * "no audit realised" notice or, on the general Sub-section, the
 * `isAuditRealised === false` case.
 */
export function AuditNotice({
	Pictogram,
	heading,
	children,
}: AuditNoticeProps) {
	const { classes } = useStyles();
	return (
		<Notice
			iconDisplayed={false}
			title={
				<span className={classes.noticeTitle}>
					<Pictogram className={classes.noticePictogram} />
					<span className={classes.noticeContent}>
						<span className={classes.noticeHeading}>{heading}</span>
						{children}
					</span>
				</span>
			}
		/>
	);
}

const useStyles = tss.withName(AuditNotice.name).create({
	noticeTitle: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4v"),
		color: fr.colors.decisions.text.default.grey.default,
	},
	noticePictogram: {
		flexShrink: 0,
		width: "3.5rem",
		height: "3.5rem",
	},
	noticeContent: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
		fontWeight: "normal",
	},
	noticeHeading: {
		fontWeight: 700,
	},
});
