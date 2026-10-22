import { fr } from "@codegouvfr/react-dsfr";
import type { Metadata } from "next";
import GlossaryAlphabet from "~/components/rgaa/GlossaryAlphabet";
import GlossarySections from "~/components/rgaa/GlossarySections";
import PageHero from "~/components/rgaa/PageHero";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";
import { getPageDescription } from "~/lib/navigation";
import { getGlossaryByLetter } from "~/lib/rgaa-data";

export const metadata: Metadata = { title: "Glossaire" };

export default function GlossairePage() {
	const glossary = getGlossaryByLetter();

	return (
		<>
			<StartDsfrOnHydration />
			<PageHero
				breadcrumbCurrentPageLabel="Glossaire"
				breadcrumbSegments={[
					{ label: "Méthode technique", linkProps: { href: "/methode" } },
				]}
				title="Glossaire"
				description={getPageDescription("/glossaire")}
				pictogram="archive"
				backgroundColor={fr.colors.decisions.background.alt.blueEcume.default}
				ellipseColor={
					fr.colors.decisions.background.actionLow.blueEcume.default
				}
			/>
			<div className={fr.cx("fr-container", "fr-my-8w")}>
				<div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
					<div className={fr.cx("fr-col-12", "fr-col-md-10", "fr-col-lg-8")}>
						<GlossaryAlphabet letters={glossary.map(({ letter }) => letter)} />
						<GlossarySections letters={glossary} />
					</div>
				</div>
			</div>
		</>
	);
}
