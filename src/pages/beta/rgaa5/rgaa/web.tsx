import type { GetStaticProps } from "next";
import Head from "next/head";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import RgaaHeader from "~/components/rgaa/RgaaHeader";
import PageHero from "~/components/rgaa/PageHero";
import { ROOTPATH } from "..";
import { REFERENCES } from "~/components/rgaa/references";
import { fr } from "@codegouvfr/react-dsfr";
import Search from "@codegouvfr/react-dsfr/picto/Search";

type WebReferencePageProps = Record<string, never>;

const WebReferencePage: PageWithHeader<WebReferencePageProps> = () => {
	const otherReferences = REFERENCES.filter(
		(reference) => reference.id !== "web",
	);

	return (
		<>
			<Head>
				<title>RGAA 5 - Référentiel Web</title>
			</Head>
			<PageHero
				breadcrumbCurrentPageLabel="Critères et tests"
				breacrumbSegments={[
					{
						label: "Méthode technique",
						linkProps: { href: `${ROOTPATH}/methode` },
					},
				]}
				title="Référentiel Web"
				description="Ici un texte décrivant le référentiel et son périmètre d’application : Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Certains critères ne sont pas applicables……"
				Pictogram={Search}
				references={otherReferences}
				badgeColor={fr.colors.decisions.text.label.purpleGlycine.default}
				badgeBackgroundColor={
					fr.colors.decisions.background.contrast.pinkMacaron.default
				}
				backgroundColor={fr.colors.decisions.background.alt.pinkMacaron.default}
			/>
		</>
	);
};

WebReferencePage.renderHeader = () => <RgaaHeader />;

export default WebReferencePage;

export const getStaticProps: GetStaticProps<
	WebReferencePageProps
> = async () => {
	return { props: {} };
};
