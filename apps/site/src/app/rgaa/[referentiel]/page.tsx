import { fr } from "@codegouvfr/react-dsfr";
import type { Metadata } from "next";
import CriteriaList from "~/components/rgaa/CriteriaList";
import PageHero from "~/components/rgaa/PageHero";
import {
	getReference,
	REFERENCE_IDS,
	REFERENCES,
	type ReferenceId,
} from "~/components/rgaa/references";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";

type Params = { referentiel: ReferenceId };

// Static export: the three referentiel pages are rendered at build time, nothing else exists.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
	return REFERENCE_IDS.map((referentiel) => ({ referentiel }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>;
}): Promise<Metadata> {
	const { referentiel } = await params;
	return { title: getReference(referentiel).pageTitle };
}

export default async function ReferencePage({
	params,
}: {
	params: Promise<Params>;
}) {
	const { referentiel } = await params;
	const reference = getReference(referentiel);
	const otherReferences = REFERENCES.filter(({ id }) => id !== referentiel);

	return (
		<>
			<StartDsfrOnHydration />
			<PageHero
				breadcrumbCurrentPageLabel="Critères et tests"
				breadcrumbSegments={[
					{ label: "Méthode technique", linkProps: { href: "/methode" } },
				]}
				title={reference.pageTitle}
				description="Ici un texte décrivant le référentiel et son périmètre d’application : Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Certains critères ne sont pas applicables……"
				pictogram={reference.pictogram}
				references={otherReferences}
				badgeColor={reference.badgeColor}
				badgeBackgroundColor={reference.badgeBackgroundColor}
				backgroundColor={reference.background}
			/>
			{referentiel === "web" && (
				<section className={fr.cx("fr-container", "fr-py-8w")}>
					<CriteriaList reference={referentiel} />
				</section>
			)}
		</>
	);
}
