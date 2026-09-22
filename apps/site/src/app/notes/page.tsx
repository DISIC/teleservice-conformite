import { fr } from "@codegouvfr/react-dsfr";
import type { Metadata } from "next";
import MarkdownSections from "~/components/rgaa/MarkdownSections";
import SectionSidebarList from "~/components/rgaa/SectionSidebarList";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";
import { readVersionedMarkdown, splitSections } from "~/lib/content";
import PageHero from "~/components/rgaa/PageHero";
import CurrentSectionLabel from "~/components/rgaa/CurrentSectionLabel";

export const metadata: Metadata = { title: "Notes de version" };

export default function ReleaseNotesPage() {
	const sections = splitSections(readVersionedMarkdown("notes-de-version"));
	const headings = sections.map(({ id, label }) => ({ id, label }));

	return (
		<>
			<StartDsfrOnHydration />
			<PageHero
				breadcrumbCurrentPageLabel={<CurrentSectionLabel sections={headings} />}
				breadcrumbSegments={[
					{ label: "Notes de version", linkProps: { href: "/notes" } },
				]}
				title="Notes de version"
				description="Lorem ipsum"
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
