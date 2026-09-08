import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";
import type { GetServerSidePropsContext, Redirect } from "next";
import { getPayload } from "payload";
import type { Contact, Schema } from "~/payload/payload-types";
import { loadOwnedDeclaration } from "~/server/api/utils/declaration-access";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { authPages } from "~/lib/auth";

export interface DeclarationParams extends ParsedUrlQuery {
	id: string;
}

export interface DeclarationProps {
	declaration: PopulatedDeclaration;
}

export interface LibraryProps {
	libraryContacts: Contact[];
	librarySchemas: Schema[];
}

/** Page-side counterpart of `declarationProcedure`: resolves the session and the
 *  owned declaration from `[id]`, or `null` when either is missing. */
export async function loadDeclarationForPage(
	context: GetServerSidePropsContext,
	options: { trash?: boolean } = {},
) {
	const { id } = (context.params ?? {}) as DeclarationParams;
	const declarationId = Number.parseInt(id ?? "", 10);

	const [payload, session] = await Promise.all([
		getPayload({ config }),
		authPages.api.getSession({ headers: context.req.headers as HeadersInit }),
	]);

	if (!session || Number.isNaN(declarationId))
		return { payload, session, declaration: null };

	const declaration = await loadOwnedDeclaration(
		payload,
		Number(session.user.id),
		declarationId,
		options,
	).catch(() => null);

	return { payload, session, declaration };
}

export async function guardDeclaration(
	context: GetServerSidePropsContext,
	options?: {
		redirectUrl?: string;
		trash?: boolean;
		includeLibrary?: boolean;
	},
) {
	const {
		redirectUrl = "/dashboard",
		trash = false,
		includeLibrary = false,
	} = options ?? {};

	const redirect: Redirect = {
		destination: redirectUrl,
		permanent: false,
	};

	const { payload, session, declaration } = await loadDeclarationForPage(
		context,
		{ trash },
	);

	if (!session || !declaration) return { redirect };

	const props: DeclarationProps & Partial<LibraryProps> = { declaration };

	if (includeLibrary) {
		const userId = Number(session.user.id);
		const [contacts, schemas] = await Promise.all([
			payload.find({
				collection: "contacts",
				where: { user: { equals: userId } },
				limit: 100,
				depth: 0,
			}),
			payload.find({
				collection: "schemas",
				where: { user: { equals: userId } },
				limit: 100,
				depth: 0,
			}),
		]);
		props.libraryContacts = contacts.docs;
		props.librarySchemas = schemas.docs;
	}

	return { props };
}
