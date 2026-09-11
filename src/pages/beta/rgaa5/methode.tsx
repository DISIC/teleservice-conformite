import Badge from "@codegouvfr/react-dsfr/Badge";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import { fr } from "@codegouvfr/react-dsfr";
import Application from "@codegouvfr/react-dsfr/picto/Application";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";
import Search from "@codegouvfr/react-dsfr/picto/Search";
import TechnicalError from "@codegouvfr/react-dsfr/picto/TechnicalError";
import type { GetStaticProps } from "next";
import Head from "next/head";
import type { ComponentType } from "react";
import type { PictoProps } from "@codegouvfr/react-dsfr/picto/utils/PictoWrapper";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import RgaaHeader from "~/components/rgaa/RgaaHeader";
import { tss } from "tss-react";

type Referential = {
	title: string;
	description: string;
	iconId: string;
	Picto: ComponentType<PictoProps>;
	background: string;
	circleBackground: string;
	href: string;
};

const REFERENTIALS: Referential[] = [
	{
		title: "Référentiel web",
		description:
			"Domaine d’application du référentiel Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		iconId: "ri-search-line",
		Picto: Search,
		background: fr.colors.decisions.background.alt.pinkMacaron.default,
		circleBackground: fr.colors.decisions.background.alt.pinkMacaron.active,
		href: "/beta/rgaa5/rgaa/web",
	},
	{
		title: "Référentiel application mobile",
		description:
			"Domaine d’application du référentiel Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		iconId: "ri-smartphone-line",
		Picto: Application,
		background: fr.colors.decisions.background.alt.yellowTournesol.default,
		circleBackground: fr.colors.decisions.background.alt.yellowTournesol.active,
		href: "/beta/rgaa5/rgaa/mobile",
	},
	{
		title: "Référentiel bureautique",
		description:
			"Domaine d’application du référentiel Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		iconId: "ri-file-text-line",
		Picto: DocumentSearch,
		background: fr.colors.decisions.background.alt.greenEmeraude.default,
		circleBackground: fr.colors.decisions.background.alt.greenEmeraude.active,
		href: "/beta/rgaa5/rgaa/desktop",
	},
];

type TechnicalMethodPageProps = Record<string, never>;

const TechnicalMethodPage: PageWithHeader<TechnicalMethodPageProps> = () => {
	const { classes, cx } = useStyles();

	return (
		<>
			<Head>
				<title>RGAA 5 - Méthode technique - Critères et tests</title>
			</Head>
			<div className={classes.hero}>
				<div className={fr.cx("fr-container")}>
					<Breadcrumb
						currentPageLabel="Méthode technique"
						homeLinkProps={{ href: "/beta/rgaa5" }}
						segments={[]}
					/>
					<div className={classes.heroContent}>
						<div className={classes.heroText}>
							<Badge as="span" small noIcon className={classes.betaTag}>
								beta
							</Badge>
							<h1 className={classes.title}>Critères et tests</h1>
							<p className={classes.description}>
								Ici un texte décrivant le fait que le RGAA s’appuie désormais
								sur 3 référentiels. Lorem ipsum dolor sit amet, consectetuer
								adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.
							</p>
							<ul className={classes.referentialTags}>
								{REFERENTIALS.map(({ title, iconId, href }) => (
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
							<TechnicalError fontSize="7.5rem" />
						</div>
					</div>
				</div>
			</div>

			<section className={cx(fr.cx("fr-container"), classes.section)}>
				<h2>Pourquoi 3 référentiels ?</h2>
				<p className={classes.sectionText}>
					Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
					commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
					et magnis dis parturient montes, nascetur ridiculus mus. Donec quam
					felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla
					consequat massa quis enim.
				</p>
			</section>

			<section className={cx(fr.cx("fr-container"), classes.cardsSection)}>
				<div className={classes.cardsGrid}>
					{REFERENTIALS.map((referential) => (
						<Card
							key={referential.title}
							title={referential.title}
							desc={referential.description}
							enlargeLink
							linkProps={{ href: referential.href }}
							imageComponent={
								<div
									className={classes.cardMedia}
									style={{ backgroundColor: referential.background }}
								>
									<div
										className={classes.cardMediaCircle}
										style={{ backgroundColor: referential.circleBackground }}
									>
										<referential.Picto fontSize="4.5rem" />
									</div>
								</div>
							}
						/>
					))}
				</div>
			</section>

			<div className={classes.changeSection}>
				<div className={cx(fr.cx("fr-container"), classes.changeContent)}>
					<h2>Qu’est-ce qui change ?</h2>
					<p className={classes.sectionText}>
						Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
						commodo ligula eget dolor. Aenean massa. Cum sociis natoque
						penatibus et magnis dis parturient montes, nascetur ridiculus mus.
						Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.
						Nulla consequat massa quis enim.
					</p>
					<Button
						priority="secondary"
						size="large"
						iconId="fr-icon-arrow-right-line"
						iconPosition="right"
						linkProps={{ href: "/beta/rgaa5/" }}
					>
						Voir les notes de version
					</Button>
				</div>
			</div>
		</>
	);
};

TechnicalMethodPage.renderHeader = () => <RgaaHeader />;

export default TechnicalMethodPage;

export const getStaticProps: GetStaticProps<
	TechnicalMethodPageProps
> = async () => {
	return { props: {} };
};

const useStyles = tss.withName(TechnicalMethodPage.name).create({
	hero: {
		backgroundColor: fr.colors.decisions.background.alt.blueEcume.default,
		paddingBlock: fr.spacing("8w"),
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
	betaTag: {
		backgroundColor: fr.colors.decisions.background.alt.blueEcume.active,
		color: fr.colors.decisions.text.actionHigh.blueEcume.default,
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
	section: {
		paddingBlock: fr.spacing("8w"),
		maxWidth: "50rem",
	},
	sectionText: {
		fontSize: "1.125rem",
		lineHeight: "1.75rem",
		color: fr.colors.decisions.text.default.grey.default,
	},
	cardsSection: {
		paddingBottom: fr.spacing("8w"),
	},
	cardsGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: fr.spacing("3w"),

		"@media (max-width: 62em)": {
			gridTemplateColumns: "1fr",
		},
	},
	cardMedia: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		aspectRatio: "368 / 216",
	},
	cardMediaCircle: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "10rem",
		height: "10rem",
		borderRadius: "50%",
	},
	changeSection: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		paddingBlock: fr.spacing("8w"),
	},
	changeContent: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: fr.spacing("2w"),
		maxWidth: "50rem",
	},
});
