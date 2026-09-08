import { fr } from "@codegouvfr/react-dsfr";
import type { GetServerSideProps, Redirect } from "next";
import Head from "next/head";
import { tss } from "tss-react";
import ErrorPage from "~/components/declaration/ErrorPage";
import { PublishedHeader } from "~/components/declaration/PublishedHeader";
import PublishedTemplate from "~/components/declaration/PublishedTemplate";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import { loadDeclarationForPage } from "~/lib/server-guards";
import {
	parsePublishedDeclaration,
	type PublishedDeclaration,
} from "~/utils/declaration-content";

type PublishPageProps = {
	publishedContent: PublishedDeclaration | null;
	deleted?: boolean;
};

const PublishPage: PageWithHeader<PublishPageProps> = ({
	publishedContent,
	deleted,
}) => {
	const { classes } = useStyles();

	if (!publishedContent) {
		return <ErrorPage deleted={deleted} />;
	}

	return (
		<>
			<Head>
				<title>
					Déclaration de {publishedContent.name} - Téléservice Conformité
				</title>
			</Head>
			<section
				id="published-declaration-section"
				className={fr.cx("fr-container")}
			>
				<div className={classes.publishedDeclarationContainer}>
					<PublishedTemplate declaration={publishedContent} />
				</div>
			</section>
		</>
	);
};

// The public page describes the document, not the téléservice.
PublishPage.renderHeader = ({ publishedContent }) =>
	publishedContent ? <PublishedHeader declaration={publishedContent} /> : null;

export default PublishPage;

const useStyles = tss.withName("PublishPage").create({
	publishedDeclarationContainer: {
		paddingBlock: fr.spacing("12v"),
	},
});

export const getServerSideProps: GetServerSideProps<PublishPageProps> = async (
	context,
) => {
	const redirect: Redirect = {
		destination: "/",
		permanent: false,
	};

	const { session, declaration } = await loadDeclarationForPage(context, {
		trash: true,
	});

	if (!session) return { redirect };

	const publishedContent = declaration?.deletedAt
		? null
		: parsePublishedDeclaration(declaration?.publishedContent);

	return {
		props: {
			publishedContent,
			deleted: !!declaration?.deletedAt,
		},
	};
};
