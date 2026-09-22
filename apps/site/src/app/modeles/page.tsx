"use client";

import { fr } from "@codegouvfr/react-dsfr";
import DownloadCard from "~/components/rgaa/DownloadCard";
import PageHero from "~/components/rgaa/PageHero";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";
import { tss } from "tss-react";

export default function TemplatesPage() {
	const { classes, cx } = useStyles();

	return (
		<>
			<StartDsfrOnHydration />
			<PageHero
				breadcrumbCurrentPageLabel="Modèles à télécharger"
				breadcrumbSegments={[
					{ label: "Ressources", linkProps: { href: "/ressources" } },
				]}
				title="Modèles à télécharger"
				description="La partie «Évaluation de la conformité à la norme» du RGAA contient les instructions pour mener à bien l’audit d’un site internet, intranet ou extranet (échantillonnage des pages, critères applicables, taux de conformité…).Voici en complément, des modèles de documents pour réaliser un audit."
				pictogram="coding"
				backgroundColor={fr.colors.decisions.background.alt.blueEcume.default}
			/>
			<div className={fr.cx("fr-container", "fr-my-10v")}>
				<div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
					<div
						className={cx(
							fr.cx("fr-col-12", "fr-col-sm-12", "fr-col-md-10", "fr-col-lg-8"),
							classes.content,
						)}
					>
						<DownloadCard
							title="Grille d’audit"
							downloadProps={[
								{
									label: "Au format ODS",
									detail: "61,88 Ko",
									// TODO: add link
									href: "#",
								},
							]}
						/>
						<DownloadCard
							title="Rapport d’audit"
							downloadProps={[
								{
									label: "Au format ODT",
									detail: "61,88 Ko",
									// TODO: add link
									href: "#",
								},
								{
									label: "Au format PDF",
									detail: "61,88 Ko",
									// TODO: add link
									href: "#",
								},
							]}
						/>
						<DownloadCard
							title="Déclaration d’accessibilité"
							downloadProps={[
								{
									label: "Au format ODT",
									detail: "61,88 Ko",
									// TODO: add link
									href: "#",
								},
								{
									label: "Au format PDF",
									detail: "61,88 Ko",
									// TODO: add link
									href: "#",
								},
							]}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

const useStyles = tss.withName(TemplatesPage.name).create({
	content: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
	},
});
