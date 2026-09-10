import { fr } from "@codegouvfr/react-dsfr";
import type { ReactNode } from "react";
import { tss } from "tss-react";

type PageHeadingProps = {
	title: ReactNode;
	pictogram?: ReactNode;
	entityName?: string | null;
	badge?: ReactNode;
	actions?: ReactNode;
	backButton?: ReactNode;
};

export function PageHeading({
	title,
	pictogram,
	entityName,
	badge,
	actions,
	backButton,
}: PageHeadingProps) {
	const { classes, cx } = useStyles();

	return (
		<div className={classes.band}>
			<div className={cx(fr.cx("fr-container"), classes.container)}>
				{backButton && <div className={classes.back}>{backButton}</div>}
				<div className={classes.row}>
					<div className={classes.heading}>
						{pictogram && (
							<span className={classes.pictogram} aria-hidden="true">
								{pictogram}
							</span>
						)}
						<div className={classes.titles}>
							<div className={classes.titleLine}>
								<h1 className={classes.title}>{title}</h1>
								{badge}
							</div>
							{entityName && <p className={classes.entity}>{entityName}</p>}
						</div>
					</div>
					{actions && <div className={classes.actions}>{actions}</div>}
				</div>
			</div>
		</div>
	);
}

const useStyles = tss.withName(PageHeading.name).create({
	band: {
		backgroundColor: fr.colors.options.beigeGrisGalet._975_75.default,
		paddingBlock: fr.spacing("8v"),
	},
	container: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
	},
	back: {
		alignSelf: "flex-start",
	},
	row: {
		display: "flex",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: fr.spacing("6v"),
		flexWrap: "wrap",
	},
	heading: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4v"),
	},
	pictogram: {
		flexShrink: 0,
		display: "flex",
	},
	titles: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("1v"),
	},
	titleLine: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("3v"),
		flexWrap: "wrap",
	},
	title: {
		margin: 0,
	},
	entity: {
		margin: 0,
		fontSize: "0.875rem",
		lineHeight: "1.5rem",
		color: fr.colors.decisions.text.mention.grey.default,
	},
	actions: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4v"),
		flexWrap: "wrap",
		marginLeft: "auto",
	},
});
