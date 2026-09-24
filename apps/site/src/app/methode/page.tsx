import { fr } from "@codegouvfr/react-dsfr";
import type { Metadata } from "next";
import PageHero from "~/components/rgaa/PageHero";
import { getAllReferentiels } from "~/lib/rgaa-data";
import TechnicalMethodSections from "~/components/rgaa/TechnicalMethodSections";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";
import { getReferentielStyle } from "~/components/rgaa/referentiels";
export const metadata: Metadata = {
	title: "Méthode technique - Critères et tests",
};

export default function TechnicalMethodPage() {
	const referentiels = getAllReferentiels().map((referentiel) => {
		const { iconId, href, heroPagebackgroundColor, circleBackgroundColor } =
			getReferentielStyle(referentiel.id);

		return {
			id: referentiel.id,
			title: referentiel.title,
			iconId,
			href,
			heroPagebackgroundColor,
			circleBackgroundColor,
		};
	});

	return (
		<>
			<StartDsfrOnHydration />
			<PageHero
				breadcrumbCurrentPageLabel="Méthode technique"
				breadcrumbSegments={[]}
				title="Critères et tests"
				description="Ici un texte décrivant le fait que le RGAA s’appuie désormais sur 3 référentiels. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa."
				pictogram="technical-error"
				linkButtons={referentiels}
				badgeColor={fr.colors.decisions.text.actionHigh.blueEcume.default}
				badgeBackgroundColor={
					fr.colors.decisions.background.alt.blueEcume.active
				}
				backgroundColor={fr.colors.decisions.background.alt.blueEcume.default}
				ellipseColor={
					fr.colors.decisions.background.actionLow.blueEcume.default
				}
			/>
			<TechnicalMethodSections referentiels={getAllReferentiels()} />
		</>
	);
}
