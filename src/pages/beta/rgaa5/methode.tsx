import type { GetStaticProps } from "next";
import Head from "next/head";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import RgaaHeader from "~/components/rgaa/RgaaHeader";

type TechnicalMethodPageProps = Record<string, never>;

const TechnicalMethodPage: PageWithHeader<TechnicalMethodPageProps> = () => {
	return (
		<>
			<Head>
				<title>RGAA 5 - Méthode technique - Critères et tests</title>
			</Head>
		</>
	);
};

TechnicalMethodPage.renderHeader = () => <RgaaHeader />;

export default TechnicalMethodPage;

export const getStaticProps: GetStaticProps<
	TechnicalMethodPageProps
> = async () => {
	return { props: {} };
};
