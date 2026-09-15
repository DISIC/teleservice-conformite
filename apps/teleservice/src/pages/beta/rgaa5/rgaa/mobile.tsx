import type { GetStaticProps } from "next";
import Head from "next/head";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import RgaaHeader from "~/components/rgaa/RgaaHeader";
import PageHero from "~/components/rgaa/PageHero";
import { ROOTPATH } from "..";
import { REFERENCES } from "~/components/rgaa/references";
import { fr } from "@codegouvfr/react-dsfr";
import Application from "@codegouvfr/react-dsfr/picto/Application";

type MobileReferencePageProps = Record<string, never>;

const MobileReferencePage: PageWithHeader<MobileReferencePageProps> = () => {
	const otherReferences = REFERENCES.filter(
		(reference) => reference.id !== "mobile",
	);

	return (
		<>
			<Head>
				<title>RGAA 5 - Référentiel application mobile</title>
			</Head>
			<PageHero
				breadcrumbCurrentPageLabel="Critères et tests"
				breacrumbSegments={[
					{
						label: "Méthode technique",
						linkProps: { href: `${ROOTPATH}/methode` },
					},
				]}
				title="Référentiel application mobile"
				description="Ici un texte décrivant le référentiel et son périmètre d’application : Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Certains critères ne sont pas applicables……"
				Pictogram={Application}
				references={otherReferences}
				badgeColor={fr.colors.decisions.text.label.yellowTournesol.default}
				badgeBackgroundColor={
					fr.colors.decisions.background.actionLow.yellowTournesol.default
				}
				backgroundColor={
					fr.colors.decisions.background.alt.yellowTournesol.default
				}
			/>
		</>
	);
};

MobileReferencePage.renderHeader = () => <RgaaHeader />;

export default MobileReferencePage;

export const getStaticProps: GetStaticProps<
	MobileReferencePageProps
> = async () => {
	return { props: {} };
};
