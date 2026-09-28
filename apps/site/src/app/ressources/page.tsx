import type { Metadata } from "next";
import PageHero from "~/components/rgaa/PageHero";
import { fr } from "@codegouvfr/react-dsfr";
import TileGrid, { type TileGridItem } from "~/components/rgaa/TileGrid";
import { RESSOURCES_LINKS } from "~/lib/navigation";

export const metadata: Metadata = {
	title: "Ressources",
};

export default function RessourcesPage() {
	const tiles: TileGridItem[] = RESSOURCES_LINKS.map(
		({ text, href, description }) => ({
			title: text,
			description,
			href,
		}),
	);

	return (
		<>
			<PageHero
				breadcrumbCurrentPageLabel="Ressources"
				breadcrumbSegments={[]}
				title="Ressources"
				badgeColor={fr.colors.decisions.text.actionHigh.blueEcume.default}
				badgeBackgroundColor={
					fr.colors.decisions.background.alt.blueEcume.active
				}
				backgroundColor={fr.colors.decisions.background.alt.blueEcume.default}
			/>
			<div className={fr.cx("fr-container", "fr-my-16v")}>
				<div className={fr.cx("fr-mx-15w")}>
					<TileGrid tiles={tiles} />
				</div>
			</div>
		</>
	);
}
