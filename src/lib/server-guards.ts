import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";
import type { GetServerSidePropsContext, Redirect } from "next";
import { getPayload } from "payload";
import type { Contact, Schema } from "~/payload/payload-types";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { getDeclarationById } from "~/server/api/utils/payload-helper";
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
