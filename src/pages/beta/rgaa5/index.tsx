import type { GetStaticProps } from "next";
import Head from "next/head";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import RgaaHeader from "~/components/rgaa/RgaaHeader";

type RgaaPageProps = Record<string, never>;

const RgaaPage: PageWithHeader<RgaaPageProps> = () => {
	return (
		<>
			<Head>
				<title>RGAA 5</title>
			</Head>
		</>
	);
};

RgaaPage.renderHeader = () => <RgaaHeader />;

export default RgaaPage;

export const getStaticProps: GetStaticProps<RgaaPageProps> = async () => {
	return { props: {} };
};
