"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import Pictogram, { type PictogramId } from "./Pictogram";
import type { ReferentielInfos, ReferentielStyle } from "./referentiels";
import ellipse from "../../assets/ellipse.svg";

export type LinkButtonsProps = Pick<ReferentielInfos, "id" | "title"> &
	Pick<ReferentielStyle, "iconId" | "href">;

// The hero illustration is optional, and is either one of our named pictograms or an image asset, never both.
type HeroIllustration =
	| { pictogram?: never; imageSrc?: never; imageAlt?: never }
	| { pictogram: PictogramId; imageSrc?: never; imageAlt?: never }
	| {
			imageSrc: string | StaticImageData;
			imageAlt?: string;
			pictogram?: never;
	  };

type PageHeroProps = HeroIllustration & {
	breadcrumbCurrentPageLabel: ReactNode;
	breadcrumbSegments: {
		label: string;
		linkProps: {
			href: string;
		};
	}[];
	title: string;
	description?: string | ReactNode;
	linkButtons?: LinkButtonsProps[];
	backgroundColor: string;
	ellipseColor?: string;
};

export default function PageHero(props: PageHeroProps) {
	const {
		breadcrumbCurrentPageLabel,
		breadcrumbSegments,
		title,
		description,
		pictogram,
		imageSrc,
		imageAlt,
		linkButtons,
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
					{(imageSrc || pictogram) && (
						<div className={classes.heroIllustrationWrapper}>
							<span className={classes.ellipse} aria-hidden="true" />
							<div className={classes.heroIllustration}>
								{imageSrc ? (
									<Image
										className={classes.image}
										src={imageSrc}
										alt={imageAlt ?? ""}
										width={216}
										height={216}
									/>
								) : (
									pictogram && <Pictogram id={pictogram} fontSize="inherit" />
								)}
							</div>
						</div>
					)}
					<div className={classes.heroText}>
						<h1 className={classes.title}>{title}</h1>
						{description && (
							<p className={classes.description}>{description}</p>
						)}
						{linkButtons?.length && (
							<ul className={classes.referentielTags}>
								{linkButtons.map(({ id, title, iconId, href }) => (
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
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

const useStyles = tss
	.withName(PageHero.name)
	.withParams<{ backgroundColor: string; ellipseColor?: string }>()
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
			alignItems: "flex-start",
			gap: fr.spacing("4w"),
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
			gap: fr.spacing("3v"),
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
		referentielTags: {
			display: "flex",
			flexWrap: "wrap",
			gap: fr.spacing("3v"),
			listStyle: "none",
			margin: 0,
			padding: 0,
			marginTop: fr.spacing("3v"),
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
			paddingLeft: "calc(216px / 2)",
			[fr.breakpoints.down("md")]: {
				alignSelf: "center",
				paddingLeft: "calc(100px / 2)",
			},
		},
		ellipse: {
			display: "block",
			width: "152px",
			height: "256px",
			backgroundColor: ellipseColor,
			maskImage: `url(${ellipse.src})`,
			maskRepeat: "no-repeat",
			maskSize: "contain",
			maskPosition: "center",
			[fr.breakpoints.down("md")]: {
				width: "70px",
				height: "118px",
			},
		},
		image: {
			width: "60%",
			height: "auto",
			objectFit: "contain",
		},
		heroIllustration: {
			position: "absolute",
			top: "50%",
			left: 0,
			transform: "translateY(-50%)",
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
