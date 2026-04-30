import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";
import type { GetServerSidePropsContext, Redirect } from "next";
import { getPayload } from "payload";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { getDeclarationById } from "~/server/api/utils/payload-helper";
import { authPages } from "~/utils/auth";

export interface DeclarationParams extends ParsedUrlQuery {
	id: string;
}

export interface DeclarationProps {
	declaration: PopulatedDeclaration;
}

export async function guardDeclaration(
	context: GetServerSidePropsContext,
	options?: {
		redirectUrl?: string;
		trash?: boolean;
	},
) {
	const { redirectUrl = "/dashboard", trash = false } = options ?? {};
	const { id } = (context.params ?? {}) as DeclarationParams;

	const redirect: Redirect = {
		destination: redirectUrl,
		permanent: false,
	};

	if (!id || typeof id !== "string") return { redirect };

	const payload = await getPayload({ config });

	const session = await authPages.api.getSession({
		headers: context.req.headers as HeadersInit,
	});

	if (!session) return { redirect };

	const declaration = await getDeclarationById(
		payload,
		session,
		Number.parseInt(id, 10),
		{ trash },
	);

	if (!declaration) return { redirect };

	return {
		props: {
			declaration,
		} as DeclarationProps,
	};
}
