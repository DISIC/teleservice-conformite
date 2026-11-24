import { fr } from "@codegouvfr/react-dsfr";
import type { GetServerSideProps, Redirect } from "next";
import Head from "next/head";
import { tss } from "tss-react";
import ErrorPage from "~/components/declaration/ErrorPage";
import { DepositedHeader } from "~/components/declaration/DepositedHeader";
import DepositedTemplate from "~/components/declaration/DepositedTemplate";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import { loadDeclarationForPage } from "~/lib/server-guards";
import {
	parseDepositedDeclaration,
	type DepositedDeclaration,
} from "~/domain/declaration/deposited/snapshot";
import { pageTitle } from "~/lib/serviceName";

type PublishPageProps = {
	depositedContent: DepositedDeclaration | null;
	deleted?: boolean;
	today: string;
};

const PublishPage: PageWithHeader<PublishPageProps> = ({
	depositedContent,
	deleted,
	today,
}) => {
	const { classes } = useStyles();

	if (!depositedContent) {
		return <ErrorPage deleted={deleted} />;
	}

	return (
		<>
			<Head>
				<title>
					{pageTitle(`Déclaration d’accessibilité de ${depositedContent.name}`)}
				</title>
			</Head>
			<section
				id="deposited-declaration-section"
				className={fr.cx("fr-container")}
			>
				<div className={classes.depositedDeclarationContainer}>
					<DepositedTemplate
						declaration={depositedContent}
						today={new Date(today)}
					/>
				</div>
			</section>
		</>
	);
};

// The public page describes the document, not the téléservice.
PublishPage.renderHeader = ({ depositedContent, today }) =>
	depositedContent ? (
		<DepositedHeader declaration={depositedContent} today={new Date(today)} />
	) : null;

export default PublishPage;

const useStyles = tss.withName("PublishPage").create({
	depositedDeclarationContainer: {
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

	const depositedContent = declaration?.deletedAt
		? null
		: parseDepositedDeclaration(declaration?.depositedContent);

	return {
		props: {
			depositedContent,
			deleted: !!declaration?.deletedAt,
			today: new Date().toISOString(),
		},
	};
};
