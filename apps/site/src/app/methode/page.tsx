import { fr } from "@codegouvfr/react-dsfr";
import type { Metadata } from "next";
import PageHero from "~/components/rgaa/PageHero";
import { REFERENCES } from "~/components/rgaa/references";
import TechnicalMethodSections from "~/components/rgaa/TechnicalMethodSections";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";

export const metadata: Metadata = {
	title: "Méthode technique - Critères et tests",
};

export default function TechnicalMethodPage() {
	return (
		<>
			<StartDsfrOnHydration />
			<PageHero
				breadcrumbCurrentPageLabel="Méthode technique"
				breadcrumbSegments={[]}
				title="Critères et tests"
				description="Ici un texte décrivant le fait que le RGAA s’appuie désormais sur 3 référentiels. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa."
				pictogram="technical-error"
				references={REFERENCES}
				badgeColor={fr.colors.decisions.text.actionHigh.blueEcume.default}
				badgeBackgroundColor={
					fr.colors.decisions.background.alt.blueEcume.active
				}
				backgroundColor={fr.colors.decisions.background.alt.blueEcume.default}
			/>
			<TechnicalMethodSections references={REFERENCES} />
		</>
	);
}
