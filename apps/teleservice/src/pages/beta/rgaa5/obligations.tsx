import type { GetStaticProps } from "next";
import Head from "next/head";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import RgaaHeader from "~/components/rgaa/RgaaHeader";

type LegalObligationsPageProps = Record<string, never>;

const LegalObligationsPage: PageWithHeader<LegalObligationsPageProps> = () => {
	return (
		<>
			<Head>
				<title>RGAA 5 - Obligations légales</title>
			</Head>
		</>
	);
};

LegalObligationsPage.renderHeader = () => <RgaaHeader />;

export default LegalObligationsPage;

export const getStaticProps: GetStaticProps<
	LegalObligationsPageProps
> = async () => {
	return { props: {} };
};
