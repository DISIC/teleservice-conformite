import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import type { PictoProps } from "@codegouvfr/react-dsfr/picto/utils/PictoWrapper";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import BetaBadge from "./BetaBadge";
import type { ComponentType } from "react";
import type { Reference } from "./references";
import { ROOTPATH } from "~/pages/beta/rgaa5";

type PageHeroProps = {
	breadcrumbCurrentPageLabel: string;
	breacrumbSegments: {
		label: string;
		linkProps: {
			href: string;
		};
	}[];
	title: string;
	description: string;
	Pictogram: ComponentType<PictoProps>;
	references: Reference[];
	badgeColor: string;
	badgeBackgroundColor: string;
	backgroundColor: string;
};

export default function PageHero(props: PageHeroProps) {
	const {
		breadcrumbCurrentPageLabel,
		breacrumbSegments,
		title,
		description,
		Pictogram,
		references,
		badgeColor,
		badgeBackgroundColor,
		backgroundColor,
	} = props;
	const { classes } = useStyles({ backgroundColor });

	return (
		<div className={classes.hero}>
			<div className={fr.cx("fr-container")}>
				<Breadcrumb
					currentPageLabel={breadcrumbCurrentPageLabel}
					homeLinkProps={{ href: ROOTPATH }}
					segments={breacrumbSegments}
				/>
				<div className={classes.heroContent}>
					<div className={classes.heroText}>
						<BetaBadge
							color={badgeColor}
							backgroundColor={badgeBackgroundColor}
						/>
						<h1 className={classes.title}>{title}</h1>
						<p className={classes.description}>{description} </p>
						<ul className={classes.referentialTags}>
							{references?.map(({ title, iconId, href }) => (
								<li key={title}>
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
					<div className={classes.heroIllustration}>
						<Pictogram fontSize="7.5rem" />
					</div>
				</div>
			</div>
		</div>
	);
}

const useStyles = tss
	.withName(PageHero.name)
	.withParams<{ backgroundColor: string }>()
	.create(({ backgroundColor }) => ({
		hero: {
			backgroundColor,
			paddingTop: "24px",
			paddingBottom: "60px",
		},
		heroContent: {
			display: "flex",
			alignItems: "center",
			gap: fr.spacing("4w"),
			marginTop: fr.spacing("4w"),
		},
		heroText: {
			display: "flex",
			flex: 1,
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
		},
		heroIllustration: {
			display: "flex",
			flexShrink: 0,
			alignItems: "center",
			justifyContent: "center",
			width: "16rem",
			height: "16rem",
		},
	}));
