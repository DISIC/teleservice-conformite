import type { GetStaticProps } from "next";
import Head from "next/head";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import RgaaHeader from "~/components/rgaa/RgaaHeader";

type MobileReferencePageProps = Record<string, never>;

const MobileReferencePage: PageWithHeader<MobileReferencePageProps> = () => {
	return (
		<>
			<Head>
				<title>RGAA 5</title>
			</Head>
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
