import type { GetServerSideProps } from "next";
import { loadDeclarationForPage } from "~/lib/server-guards";
import { publicDeclarationPath } from "~/domain/declaration/published/publicPath";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { declaration } = await loadDeclarationForPage(
		{ ...context, params: { id: String(context.params?.slug ?? "") } },
		{ trash: true },
	);

	return {
		redirect: {
			destination: declaration?.published_declaration_slug
				? publicDeclarationPath(declaration)
				: "/",
			permanent: false,
		},
	};
};

export default function LegacyPublishPage() {
	return null;
}
