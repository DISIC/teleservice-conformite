import { fr } from "@codegouvfr/react-dsfr";
import type { Metadata } from "next";
import PageHero from "~/components/rgaa/PageHero";
import { getPageDescription } from "~/lib/navigation";
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
				breadcrumbCurrentPageLabel="Critères et tests"
				breadcrumbSegments={[
					{ label: "Méthode technique", linkProps: { href: "/methode" } },
				]}
				title="Critères et tests"
				description={getPageDescription("/methode/introduction")}
				pictogram="technical-error"
				linkButtons={referentiels}
				backgroundColor={fr.colors.decisions.background.alt.blueEcume.default}
				ellipseColor={
					fr.colors.decisions.background.actionLow.blueEcume.default
				}
			/>
			<TechnicalMethodSections referentiels={getAllReferentiels()} />
		</>
	);
}
