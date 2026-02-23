import type { ParsedUrlQuery } from "node:querystring";
import { fr } from "@codegouvfr/react-dsfr";
import config from "@payload-config";
import type { GetServerSideProps, Redirect } from "next";
import Head from "next/head";
import { getPayload } from "payload";
import { tss } from "tss-react";
import ErrorPage from "~/components/declaration/ErrorPage";
import PublishedDeclarationTemplate, {
	type PublishedDeclaration,
} from "~/components/declaration/PublishedDeclarationTemplate";
import { getDeclarationById } from "~/server/api/utils/payload-helper";
import { auth } from "~/utils/auth";

export default function PublishPage({
	publishedContent,
	deleted,
}: { publishedContent: PublishedDeclaration | null; deleted?: boolean }) {
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
					<PublishedDeclarationTemplate declaration={publishedContent} />
				</div>
			</section>
		</>
	);
}

const useStyles = tss.withName(PublishPage.name).create({
	publishedDeclarationContainer: {
		paddingBlock: fr.spacing("12v"),

		"& > h1": {
			marginBottom: fr.spacing("10v"),
		},
		"& > h2, h3, h4, h5, h6": {
			marginBottom: fr.spacing("4v"),
		},
		"& > p": {
			marginBottom: fr.spacing("10v"),
		},
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
		Number.parseInt(id),
		{ trash: true },
	);

	if (
		!declaration ||
		!declaration.publishedContent ||
		!!declaration.deletedAt
	) {
		return {
			props: {
				publishedContent: null,
				deleted: !!declaration?.deletedAt,
			},
		};
	}

	return {
		props: {
			publishedContent: JSON.parse(
				declaration.publishedContent,
			) as PublishedDeclaration,
		},
	};
};
