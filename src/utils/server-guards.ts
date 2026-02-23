import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";
import type { GetServerSidePropsContext, Redirect } from "next";
import { getPayload } from "payload";
import { getDeclarationById } from "~/server/api/utils/payload-helper";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { auth } from "~/utils/auth";

export interface DeclarationParams extends ParsedUrlQuery {
	id: string;
}

export interface DeclarationProps {
	declaration: PopulatedDeclaration;
}

/**
 * Récupère une déclaration côté serveur avec les vérifications de sécurité
 * @param context - Le contexte Next.js getServerSideProps
 * @param options - Options additionnelles (redirectUrl, trash)
 * @returns Les props avec la déclaration ou une redirection
 */
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

	// Validation de l'ID
	if (!id || typeof id !== "string") return { redirect };

	// Récupération du payload
	const payload = await getPayload({ config });

	// Vérification de la session
	const session = await auth.api.getSession({
		headers: context.req.headers as HeadersInit,
	});

	if (!session) return { redirect };

	// Récupération de la déclaration
	const declaration = await getDeclarationById(
		payload,
		session,
		Number.parseInt(id),
		{ trash },
	);

	if (!declaration) return { redirect };

	return {
		props: {
			declaration,
		} as DeclarationProps,
	};
}
