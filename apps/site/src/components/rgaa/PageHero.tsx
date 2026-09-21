"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import BetaBadge from "./BetaBadge";
import Pictogram, { type PictogramId } from "./Pictogram";
import type { ReferentielCard } from "./referentiels";
import ellipse from "../../assets/ellipse.svg";

export type LinkButtonsProps = Pick<
	ReferentielCard,
	"id" | "title" | "iconId" | "href"
>;

type PageHeroProps = {
	breadcrumbCurrentPageLabel: ReactNode;
	breadcrumbSegments: {
		label: string;
		linkProps: {
			href: string;
		};
	}[];
	title: string;
	description: string;
	pictogram: PictogramId;
	linkButtons?: LinkButtonsProps[];
	badgeColor: string;
	badgeBackgroundColor: string;
	backgroundColor: string;
	ellipseColor: string;
};

export default function PageHero(props: PageHeroProps) {
	const {
		breadcrumbCurrentPageLabel,
		breadcrumbSegments,
		title,
		description,
		pictogram,
		linkButtons,
		badgeColor,
		badgeBackgroundColor,
		backgroundColor,
		ellipseColor,
	} = props;
	const { classes } = useStyles({ backgroundColor, ellipseColor });

	return (
		<div className={classes.hero}>
			<div className={fr.cx("fr-container")}>
				<Breadcrumb
					currentPageLabel={breadcrumbCurrentPageLabel}
					// TODO: add link
					homeLinkProps={{ href: "#" }}
					segments={breadcrumbSegments}
				/>
				<div className={classes.heroContent}>
					<div className={classes.heroIllustrationWrapper}>
						<div className={classes.heroIllustration}>
							<Pictogram id={pictogram} fontSize="inherit" />
						</div>
					</div>
					<div className={classes.heroText}>
						<BetaBadge
							color={badgeColor}
							backgroundColor={badgeBackgroundColor}
						/>
						<h1 className={classes.title}>{title}</h1>
						<p className={classes.description}>{description} </p>
						<ul className={classes.referentialTags}>
							{linkButtons?.length &&
								linkButtons.map(({ id, title, iconId, href }) => (
									<li key={id}>
										<Button
											priority="secondary"
											size="small"
											iconId={iconId as never}
											iconPosition="left"
											linkProps={{ href }}
										>
											{title}
										</Button>
									</li>
								))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

const useStyles = tss
	.withName(PageHero.name)
	.withParams<{ backgroundColor: string; ellipseColor: string }>()
	.create(({ backgroundColor, ellipseColor }) => ({
		hero: {
			backgroundColor,
			paddingTop: fr.spacing("6v"),
			paddingBottom: fr.spacing("12v"),
			[fr.breakpoints.down("md")]: {
				paddingBlock: fr.spacing("4v"),
			},
		},
		heroContent: {
			display: "flex",
			flexDirection: "row-reverse",
			alignItems: "center",
			gap: fr.spacing("4w"),
			marginTop: fr.spacing("4w"),
			[fr.breakpoints.down("md")]: {
				flexDirection: "column",
				alignItems: "stretch",
			},
		},
		heroText: {
			display: "flex",
			flex: 1,
			minWidth: 0,
			flexDirection: "column",
			alignItems: "flex-start",
			gap: fr.spacing("2w"),
		},
		title: {
			marginBottom: 0,
		},
		description: {
			fontSize: "1.25rem",
			lineHeight: "2rem",
			color: fr.colors.decisions.text.default.grey.default,
			marginBottom: 0,
		},
		referentialTags: {
			display: "flex",
			flexWrap: "wrap",
			gap: fr.spacing("3v"),
			listStyle: "none",
			margin: 0,
			padding: 0,
			[fr.breakpoints.down("md")]: {
				alignSelf: "stretch",
				flexDirection: "column",
				flexWrap: "nowrap",
				"& .fr-btn": {
					width: "100%",
					justifyContent: "flex-start",
				},
			},
		},
		heroIllustrationWrapper: {
			position: "relative",
			flexShrink: 0,
			"&::before": {
				content: '""',
				position: "absolute",
				zIndex: 0,
				top: "50%",
				left: "50%",
				transform: "translateY(-50%)",
				width: "152px",
				height: "256px",
				backgroundColor: ellipseColor,
				maskImage: `url(${ellipse.src})`,
				maskRepeat: "no-repeat",
				maskSize: "contain",
				maskPosition: "center",
			},
			[fr.breakpoints.down("md")]: {
				alignSelf: "center",
				"&::before": {
					width: "70px",
					height: "118px",
				},
			},
		},
		heroIllustration: {
			position: "relative",
			zIndex: 1,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			width: "216px",
			height: "216px",
			fontSize: "7.5rem",
			backgroundColor: fr.colors.decisions.background.default.grey.default,
			borderRadius: "50%",
			[fr.breakpoints.down("md")]: {
				width: "100px",
				height: "100px",
				fontSize: "3.5rem",
			},
		},
	}));
