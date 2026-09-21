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

/**
 * Records that the declarant has seen the declaration and answers whether they
 * had already left it once: the "À compléter" guidance appears only from the
 * second visit on, never during the first pass through the walkthrough. The
 * mark lives on the caller's own access right, so co-declarants each get a
 * first pass.
 */
export async function trackDeclarationVisit(
	payload: Payload,
	userId: number,
	declarationId: number,
): Promise<boolean> {
	const accessRight = await payload.find({
		collection: "access-rights",
		where: {
			declaration: { equals: declarationId },
			user: { equals: userId },
			status: { equals: "approved" },
		},
		limit: 1,
		depth: 0,
	});

	const own = accessRight.docs[0];
	if (!own) return false;
	if (own.firstVisitedAt) return true;

	await payload.update({
		collection: "access-rights",
		id: own.id,
		data: { firstVisitedAt: new Date().toISOString() },
	});
	return false;
}
