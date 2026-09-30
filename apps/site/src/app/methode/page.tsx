import type { Metadata } from "next";
import PageHero from "~/components/rgaa/PageHero";
import { fr } from "@codegouvfr/react-dsfr";
import TileGrid, { type TileGridItem } from "~/components/rgaa/TileGrid";
import { METHODE_LINKS } from "~/lib/navigation";

export const metadata: Metadata = {
	title: "Méthode technique",
};

export default function MethodePage() {
	const tiles: TileGridItem[] = METHODE_LINKS.map(
		({ text, href, description }) => ({
			title: text,
			description,
			href,
		}),
	);

	return (
		<>
			<PageHero
				breadcrumbCurrentPageLabel="Méthode technique"
				breadcrumbSegments={[]}
				title="Méthode technique"
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
