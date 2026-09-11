import type { GetStaticProps } from "next";
import Head from "next/head";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import RgaaHeader from "~/components/rgaa/RgaaHeader";

type DesktopReferencePageProps = Record<string, never>;

const DesktopReferencePage: PageWithHeader<DesktopReferencePageProps> = () => {
	return (
		<>
			<Head>
				<title>RGAA 5</title>
			</Head>
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
