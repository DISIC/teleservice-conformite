import { fr } from "@codegouvfr/react-dsfr";
import type { Metadata } from "next";
import MarkdownSections from "~/components/rgaa/MarkdownSections";
import SectionSidebarList from "~/components/rgaa/SectionSidebarList";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";
import { readMarkdownPage, splitSections } from "~/lib/content";
import PageHero from "~/components/rgaa/PageHero";
import CurrentSectionLabel from "~/components/rgaa/CurrentSectionLabel";

export const metadata: Metadata = { title: "Notes de version" };

export default function ReleaseNotesPage() {
	const content = readMarkdownPage("notes-de-version");
	const sections = splitSections(content);
	const headings = sections.map(({ id, label }) => ({ id, label }));

	return (
		<>
			<StartDsfrOnHydration />
			<PageHero
				breadcrumbCurrentPageLabel={<CurrentSectionLabel sections={headings} />}
				breadcrumbSegments={[
					// TODO: add link
					{ label: "Ressources", linkProps: { href: "#" } },
				]}
				title="Notes de révision du RGAA 4.1.2 vers 5.0"
				description="Cette édition comporte les apportés à la version 5 du Référentiel général d’amélioration de l’accessibilité (RGAA). Ils n’invalident pas les audits déjà réalisés."
				pictogram="catalog"
				backgroundColor={fr.colors.decisions.background.alt.blueEcume.default}
				ellipseColor={
					fr.colors.decisions.background.actionLow.blueEcume.default
				}
			/>
			<div className={fr.cx("fr-container", "fr-my-8w")}>
				<div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
					<div className={fr.cx("fr-col-12", "fr-col-md-4")}>
						<SectionSidebarList sections={headings} />
					</div>
					<div className={fr.cx("fr-col-12", "fr-col-md-8")}>
						<MarkdownSections sections={sections} />
					</div>
				</div>
			</div>
		</>
	);
}
