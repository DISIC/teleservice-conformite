"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import { tss } from "tss-react";
import Pictogram from "./Pictogram";
import { getReferentielStyle, type ReferentielInfos } from "./referentiels";
import ellipse from "../../assets/ellipse.svg";

// Same illustration as the hero, scaled from its 216px circle and 152x256 half-circle.
const CIRCLE_SIZE = "10rem";
const scaled = (heroPx: number) => `calc(${CIRCLE_SIZE} * ${heroPx} / 216)`;

export default function TechnicalMethodSections({
	referentiels,
}: {
	referentiels: ReferentielInfos[];
}) {
	const { classes, cx } = useStyles();
	const cards = referentiels.map((referentiel) => {
		const { href, heroPagebackgroundColor, circleBackgroundColor, pictogram } =
			getReferentielStyle(referentiel.id);

		return {
			...referentiel,
			href,
			heroPagebackgroundColor,
			circleBackgroundColor,
			pictogram,
		};
	});

	return (
		<>
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
					{cards.map((referentiel) => (
						<Card
							key={referentiel.id}
							title={referentiel.title}
							desc={referentiel.description}
							enlargeLink
							linkProps={{ href: referentiel.href }}
							imageComponent={
								<div
									className={classes.cardMedia}
									style={{
										backgroundColor: referentiel.heroPagebackgroundColor,
									}}
								>
									<div className={classes.cardIllustration}>
										<span
											className={classes.ellipse}
											style={{
												backgroundColor: referentiel.circleBackgroundColor,
											}}
											aria-hidden="true"
										/>
										<div className={classes.cardMediaCircle}>
											<Pictogram id={referentiel.pictogram} fontSize="4.5rem" />
										</div>
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
					{/* // TODO: add link */}
					<Button
						priority="secondary"
						size="large"
						iconId="fr-icon-arrow-right-line"
						iconPosition="right"
						linkProps={{ href: "#" }}
					>
						Voir les notes de version
					</Button>
				</div>
			</div>
		</>
	);
}

const useStyles = tss.withName(TechnicalMethodSections.name).create({
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
	cardIllustration: {
		position: "relative",
		paddingLeft: `calc(${CIRCLE_SIZE} / 2)`,
	},
	ellipse: {
		display: "block",
		width: scaled(152),
		height: scaled(256),
		maskImage: `url(${ellipse.src})`,
		maskRepeat: "no-repeat",
		maskSize: "contain",
		maskPosition: "center",
	},
	cardMediaCircle: {
		position: "absolute",
		top: "50%",
		left: 0,
		transform: "translateY(-50%)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: CIRCLE_SIZE,
		height: CIRCLE_SIZE,
		borderRadius: "50%",
		backgroundColor: fr.colors.decisions.background.default.grey.default,
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
