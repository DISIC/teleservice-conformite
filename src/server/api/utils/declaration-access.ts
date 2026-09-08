import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import {
	getPopulatedDeclaration,
	type PopulatedDeclaration,
} from "./payload-helper";

/** The single ownership rule: a declaration is reachable only through an
 *  approved access right of the caller. Every procedure and page goes through here. */
export async function loadOwnedDeclaration(
	payload: Payload,
	userId: number,
	declarationId: number,
	options: { trash?: boolean } = {},
): Promise<PopulatedDeclaration> {
	if (!userId || !declarationId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "User not authorized to access this declaration.",
		});
	}

	const [declaration, accessRight] = await Promise.all([
		payload.findByID({
			collection: "declarations",
			id: declarationId,
			depth: 0,
			trash: options.trash ?? false,
			disableErrors: true,
		}),
		payload.find({
			collection: "access-rights",
			where: {
				declaration: { equals: declarationId },
				user: { equals: userId },
				status: { equals: "approved" },
			},
			limit: 1,
			depth: 0,
		}),
	]);

	if (!declaration) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Declaration not found.",
		});
	}

	if (accessRight.totalDocs === 0) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Must have an approved access right to access this declaration.",
		});
	}

	return getPopulatedDeclaration(declaration);
}
