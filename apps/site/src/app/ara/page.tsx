import { fr } from "@codegouvfr/react-dsfr";
import AraContent from "~/components/rgaa/AraContent";
import PageHero from "~/components/rgaa/PageHero";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";
import { getPageDescription } from "~/lib/navigation";
import araLogo from "~/assets/ara-logo.svg";

export default function AraPage() {
	return (
		<>
			<StartDsfrOnHydration />
			<PageHero
				breadcrumbCurrentPageLabel="Ara - Outil d’audit d’accessibilité"
				breadcrumbSegments={[
					{ label: "Ressources", linkProps: { href: "/ressources" } },
				]}
				title="Ara, outil d’audit d’accessibilité"
				description={getPageDescription("/ara")}
				imageSrc={araLogo}
				imageAlt="Ara"
				backgroundColor={fr.colors.decisions.background.alt.blueEcume.default}
				ellipseColor={
					fr.colors.decisions.background.actionLow.blueEcume.default
				}
			/>
			<AraContent />
		</>
	);
}
