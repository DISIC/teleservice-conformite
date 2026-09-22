import type { Metadata } from "next";
import MarkdownSections from "~/components/rgaa/MarkdownSections";
import CurrentSectionLabel from "~/components/rgaa/CurrentSectionLabel";
import PageHero from "~/components/rgaa/PageHero";
import SectionSidebarList from "~/components/rgaa/SectionSidebarList";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";
import { fr } from "@codegouvfr/react-dsfr";
import { readMarkdownPage, splitSections } from "~/lib/content";

export const metadata: Metadata = { title: "Obligations légales" };

export default function LegalObligationsPage() {
	const content = readMarkdownPage("obligations-legales");
	const sections = splitSections(content);
	const headings = sections.map(({ id, label }) => ({ id, label }));

	return (
		<>
			<StartDsfrOnHydration />
			<PageHero
				breadcrumbCurrentPageLabel={<CurrentSectionLabel sections={headings} />}
				breadcrumbSegments={[
					{ label: "Obligations légales", linkProps: { href: "/obligations" } },
				]}
				title="Obligations légales"
				description="lorem ipsum"
				pictogram="justice-scales"
				badgeBackgroundColor={
					fr.colors.decisions.background.alt.blueEcume.active
				}
				badgeColor={fr.colors.decisions.border.default.blueEcume.default}
				backgroundColor={fr.colors.decisions.background.alt.blueEcume.default}
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
