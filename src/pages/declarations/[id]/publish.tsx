import type { ParsedUrlQuery } from "node:querystring";
import { fr } from "@codegouvfr/react-dsfr";
import config from "@payload-config";
import type { GetServerSideProps, Redirect } from "next";
import Head from "next/head";
import { getPayload } from "payload";
import { tss } from "tss-react";
import ErrorPage from "~/components/declaration/ErrorPage";
import { PublishedHeader } from "~/components/declaration/PublishedHeader";
import PublishedTemplate from "~/components/declaration/PublishedTemplate";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import { getDeclarationById } from "~/server/api/utils/payload-helper";
import { auth } from "~/lib/auth";
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

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params as Params;

	const redirect: Redirect = {
		destination: "/",
		permanent: false,
	};

	if (!id || typeof id !== "string") {
		return { redirect };
	}

	const payload = await getPayload({ config });

	const session = await auth.api.getSession({
		headers: context.req.headers as HeadersInit,
	});

	if (!session) return { redirect };

	const declaration = await getDeclarationById(
		payload,
		session,
		Number.parseInt(id, 10),
		{ trash: true },
	);

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
