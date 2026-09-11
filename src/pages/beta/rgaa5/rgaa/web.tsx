import type { GetStaticProps } from "next";
import Head from "next/head";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import RgaaHeader from "~/components/rgaa/RgaaHeader";

type WebReferencePageProps = Record<string, never>;

const WebReferencePage: PageWithHeader<WebReferencePageProps> = () => {
	return (
		<>
			<Head>
				<title>RGAA 5</title>
			</Head>
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
