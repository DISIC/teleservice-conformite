import type { GetStaticProps } from "next";
import Head from "next/head";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import RgaaHeader from "~/components/rgaa/RgaaHeader";
import PageHero from "~/components/rgaa/PageHero";
import { ROOTPATH } from "..";
import { REFERENCES } from "~/components/rgaa/references";
import { fr } from "@codegouvfr/react-dsfr";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";

type DesktopReferencePageProps = Record<string, never>;

const DesktopReferencePage: PageWithHeader<DesktopReferencePageProps> = () => {
	const otherReferences = REFERENCES.filter(
		(reference) => reference.id !== "bureautique",
	);

	return (
		<>
			<Head>
				<title>RGAA 5 - Référentiel bureautique</title>
			</Head>
			<PageHero
				breadcrumbCurrentPageLabel="Critères et tests"
				breacrumbSegments={[
					{
						label: "Méthode technique",
						linkProps: { href: `${ROOTPATH}/methode` },
					},
				]}
				title="Référentiel bureautique"
				description="Ici un texte décrivant le référentiel et son périmètre d’application : Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Certains critères ne sont pas applicables……"
				Pictogram={DocumentSearch}
				references={otherReferences}
				badgeColor={fr.colors.decisions.text.label.greenEmeraude.default}
				badgeBackgroundColor={
					fr.colors.decisions.background.contrast.greenEmeraude.default
				}
				backgroundColor={
					fr.colors.decisions.background.alt.greenEmeraude.default
				}
			/>
		</>
	);
};

DesktopReferencePage.renderHeader = () => <RgaaHeader />;

export default DesktopReferencePage;

export const getStaticProps: GetStaticProps<
	DesktopReferencePageProps
> = async () => {
	return { props: {} };
};
