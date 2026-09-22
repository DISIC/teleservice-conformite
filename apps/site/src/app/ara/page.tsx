"use client";

import { fr } from "@codegouvfr/react-dsfr";
import PageHero from "~/components/rgaa/PageHero";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";
import { tss } from "tss-react";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import araLogo from "~/assets/ara-logo.svg";

export default function AraPage() {
	const { classes, cx } = useStyles();

	return (
		<>
			<StartDsfrOnHydration />
			<PageHero
				breadcrumbCurrentPageLabel="Ara - Outil d’audit d’accessibilité"
				breadcrumbSegments={[
					{ label: "Ressources", linkProps: { href: "/ressources" } },
				]}
				title="Ara, outil d’audit d’accessibilité"
				description="Ara est l’outil développé par la direction interministérielle du numérique (DINUM) pour réaliser des audits de conformité au Référentiel Général d’Amélioration de l’Accessibilité (RGAA)."
				imageSrc={araLogo}
				imageAlt="Ara"
				backgroundColor={fr.colors.decisions.background.alt.blueEcume.default}
				ellipseColor={
					fr.colors.decisions.background.actionLow.blueEcume.default
				}
			/>
			<div className={fr.cx("fr-container", "fr-my-10v")}>
				<div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
					<div
						className={cx(
							fr.cx("fr-col-12", "fr-col-sm-12", "fr-col-md-10", "fr-col-lg-8"),
							classes.content,
						)}
					>
						<div className={classes.paragraph}>
							<p>
								<b>Basé sur la dernière version</b> (RGAA version 4.1.2) vous
								pouvez:
							</p>
							<ul>
								<li>
									Faire un état des lieux (audit partiel de 25 ou 50 critères)
								</li>
								<li>
									Faire un audit complet, dit de conformité (106 critères)
								</li>
								<li>
									Générer votre rapport d’audit et votre déclaration
									d’accessibilité
								</li>
							</ul>
						</div>
						<CallOut
							buttonProps={{
								children: "Je réalise un audit",
								//TODO: add link
								linkProps: { href: "#" },
								iconId: "ri-share-box-line",
								iconPosition: "right",
							}}
							title="Réalisez vos audits d’accessibilité numérique"
						>
							Ara n’audite pas automatiquement votre site et nécessite une bonne
							connaissance de la méthode technique du RGAA.
						</CallOut>
					</div>
				</div>
			</div>
		</>
	);
}

const useStyles = tss.withName(AraPage.name).create({
	content: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("10v"),
	},
	paragraph: {
		fontFamily: "Marianne",
		fontWeight: 400,
		fontSize: "18px",
		lineHeight: "28px",
		"& ul": {
			paddingInline: fr.spacing("5v"),
		},
	},
});
