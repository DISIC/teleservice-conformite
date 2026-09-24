import { fr } from "@codegouvfr/react-dsfr";
import type { Metadata } from "next";
import CriteriaList from "~/components/rgaa/CriteriaList";
import PageHero from "~/components/rgaa/PageHero";
import {
	REFERENTIELS_IDS,
	getReferentielStyle,
	type ReferentielId,
} from "~/components/rgaa/referentiels";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";
import {
	getAllReferentiels,
	getCriterias,
	getReferentiel,
} from "~/lib/rgaa-data";

type Params = { referentiel: ReferentielId };

// Static export: the three referentiel pages are rendered at build time, nothing else exists.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
	return REFERENTIELS_IDS.map((referentiel) => ({ referentiel }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>;
}): Promise<Metadata> {
	const { referentiel } = await params;
	return { title: getReferentiel(referentiel).title };
}

export default async function ReferentielsPage({
	params,
}: {
	params: Promise<Params>;
}) {
	const { referentiel } = await params;
	const referentielStyle = getReferentielStyle(referentiel);
	const referentielInfos = getReferentiel(referentiel);
	const criterias = getCriterias(referentiel);
	const otherReferentiels = getAllReferentiels()
		.filter(({ id }) => id !== referentiel)
		.map((referentiel) => {
			const { iconId, href } = getReferentielStyle(referentiel.id);

			return {
				id: referentiel.id,
				title: referentiel.title,
				iconId,
				href,
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
				title={referentielInfos.title}
				description={referentielInfos.description}
				pictogram={referentielStyle.pictogram}
				linkButtons={otherReferentiels}
				badgeColor={referentielStyle.badgeColor}
				badgeBackgroundColor={referentielStyle.badgeBackgroundColor}
				backgroundColor={referentielStyle.heroPagebackgroundColor}
				ellipseColor={referentielStyle.circleBackgroundColor}
			/>
			<section
				className={fr.cx("fr-container", "fr-px-0", "fr-px-md-2w", "fr-py-8w")}
			>
				<CriteriaList referentiel={referentielInfos} criterias={criterias} />
			</section>
		</>
	);
}
