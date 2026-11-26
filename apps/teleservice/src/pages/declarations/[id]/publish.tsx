import { fr } from "@codegouvfr/react-dsfr";
import type { GetServerSideProps, Redirect } from "next";
import Head from "next/head";
import { tss } from "tss-react";
import { DepositedHeader } from "~/components/declaration/DepositedHeader";
import DepositedTemplate from "~/components/declaration/DepositedTemplate";
import {
	type NotFoundProps,
	orNotFound,
} from "~/components/layout/NotFoundPage";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import { loadDeclarationForPage, notFoundResponse } from "~/lib/server-guards";
import {
	parseDepositedDeclaration,
	type DepositedDeclaration,
} from "~/domain/declaration/deposited/snapshot";
import { pageTitle } from "~/lib/serviceName";

type PublishPageProps = {
	depositedContent: DepositedDeclaration;
	today: string;
};

function PublishPage({ depositedContent, today }: PublishPageProps) {
	const { classes } = useStyles();

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
}

const PublishRoute: PageWithHeader<PublishPageProps | NotFoundProps> =
	orNotFound(PublishPage);

// The public page describes the document, not the téléservice.
PublishRoute.renderHeader = (props) =>
	"notFound" in props ? null : (
		<DepositedHeader
			declaration={props.depositedContent}
			today={new Date(props.today)}
		/>
	);

export default PublishRoute;

const useStyles = tss.withName("PublishPage").create({
	depositedDeclarationContainer: {
		paddingBlock: fr.spacing("12v"),
	},
});

export const getServerSideProps: GetServerSideProps<
	PublishPageProps | NotFoundProps
> = async (context) => {
	const redirect: Redirect = {
		destination: "/",
		permanent: false,
	};

	const { session, declaration } = await loadDeclarationForPage(context, {
		trash: true,
	});

	if (!session) return { redirect };

	if (declaration?.deletedAt)
		return notFoundResponse(context, "deletedDeclaration", true);

	const depositedContent = parseDepositedDeclaration(
		declaration?.depositedContent,
	);
	if (!depositedContent) return notFoundResponse(context, "page", true);

	return {
		props: { depositedContent, today: new Date().toISOString() },
	};
};
