import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

import { getDeclarationById } from "~/server/api/utils/payload-helper";
import PublishedDeclarationTemplate, {
	type PublishedDeclaration,
} from "~/components/declaration/PublishedDeclarationTemplate";

export default function PublishPage({
	publishedContent,
}: { publishedContent: PublishedDeclaration }) {
	const { classes } = useStyles();

	return (
		<div className={classes.container}>
			<PublishedDeclarationTemplate declaration={publishedContent} />
		</div>
	);
}

const useStyles = tss.withName(PublishPage.name).create({
	container: {
		marginBlock: fr.spacing("10v"),
		marginInline: fr.spacing("16v"),
	},
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params as Params;

	if (!id || typeof id !== "string") {
		return {
			props: {},
			redirect: { destination: "/" },
		};
	}

	const payload = await getPayload({ config });

	const declaration = await getDeclarationById(payload, Number.parseInt(id));

	if (!declaration?.publishedContent) {
		return {
			props: {},
			redirect: { destination: "/" },
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
