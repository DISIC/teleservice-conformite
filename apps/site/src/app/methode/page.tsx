import type { Metadata } from "next";
import PageHero from "~/components/rgaa/PageHero";
import { fr } from "@codegouvfr/react-dsfr";
import TileGrid, { type TileGridItem } from "~/components/rgaa/TileGrid";
import { getAllReferentiels } from "~/lib/rgaa-data";
import { getReferentielStyle } from "~/components/rgaa/referentiels";

export const metadata: Metadata = {
	title: "Méthode technique",
};

export default function MethodePage() {
	const referentielInfos = getAllReferentiels();

	const referentielTileInfos = referentielInfos.map((referentiel) => {
		const { href } = getReferentielStyle(referentiel.id);

		return {
			id: referentiel.id,
			title: referentiel.title,
			description: referentiel.description,
			href,
		};
	});

	const tiles: TileGridItem[] = [
		{
			title: "Introduction",
			description:
				"Ici un texte décrivant le fait que le RGAA s’appuie désormais sur 3 référentiels  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. ",
			href: "/methode/introduction",
		},
		...referentielTileInfos,
	];

	return (
		<>
			<PageHero
				breadcrumbCurrentPageLabel="Méthode technique"
				breadcrumbSegments={[]}
				title="Méthode technique"
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
