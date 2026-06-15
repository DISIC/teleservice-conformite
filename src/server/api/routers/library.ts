import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import z from "zod";
import { contact as contactSchema } from "~/forms/contact/contactSchema";
import { schemaForm } from "~/forms/schema/schemaSchema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";
import { recalculateDeclarationStatus } from "../utils/publish-comparison";

type LibraryKind = "contact" | "schema";

const LIBRARY_COLLECTION = {
	contact: "contacts",
	schema: "schemas",
} as const satisfies Record<LibraryKind, "contacts" | "schemas">;

/** Throws unless `user` (a relationship value) resolves to the current user. */
function assertOwner(user: unknown, userId: number) {
	const ownerId =
		typeof user === "object" && user ? (user as { id: number }).id : user;
	if (ownerId !== userId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Cet élément n'appartient pas à votre bibliothèque.",
		});
	}
}

/** Asserts the current user owns the Library parent (ownership-only callers). */
async function getOwnedLibraryItem(
	payload: Payload,
	userId: number,
	kind: LibraryKind,
	id: number,
) {
	const item = await payload.findByID({
		collection: LIBRARY_COLLECTION[kind],
		id,
		depth: 0,
	});
	assertOwner(item?.user, userId);
	return item;
}

/**
 * Propagation fan-out (ADR-0004): rewrite the linked copy in every declaration
 * pointing at this parent, then recompute each one's published/modified status
 * (a published declaration whose copy just changed flips to Modifiée). Linked
 * groups are read-only in the UI and writable only here — the single choke point
 * that keeps a copy in sync with its parent. Sequential rather than one
 * transaction: fine at this scale (a user's declarations, single digits–dozens).
 */
async function propagateToLinkedDeclarations(
	payload: Payload,
	kind: LibraryKind,
	parentId: number,
	values: Record<string, unknown>,
) {
	const linked = await payload.find({
		collection: "declarations",
		where: { [`${kind}.parent`]: { equals: parentId } },
		depth: 0,
		limit: 1000,
	});

	for (const declaration of linked.docs) {
		await payload.update({
			collection: "declarations",
			id: declaration.id,
			data: {
				[kind]: {
					...declaration[kind],
					...values,
					parent: parentId,
					toVerify: false,
				},
			},
		});

		await recalculateDeclarationStatus(payload, declaration.id);
	}
}

export const libraryRouter = createTRPCRouter({
	listContacts: userProtectedProcedure.query(async ({ ctx }) => {
		const result = await ctx.payload.find({
			collection: "contacts",
			where: { user: { equals: Number(ctx.session.user.id) } },
			limit: 100,
			depth: 0,
		});
		return result.docs;
	}),

	listSchemas: userProtectedProcedure.query(async ({ ctx }) => {
		const result = await ctx.payload.find({
			collection: "schemas",
			where: { user: { equals: Number(ctx.session.user.id) } },
			limit: 100,
			depth: 0,
		});
		return result.docs;
	}),

	/**
	 * Create a parent (no propagation — nothing links it yet) or update one and
	 * fan the new content out to every linked declaration.
	 */
	upsertContact: userProtectedProcedure
		.input(z.object({ values: contactSchema, id: z.number().optional() }))
		.mutation(async ({ input, ctx }) => {
			const userId = Number(ctx.session.user.id);

			if (!input.id) {
				return ctx.payload.create({
					collection: "contacts",
					data: { ...input.values, user: userId },
				});
			}

			await getOwnedLibraryItem(ctx.payload, userId, "contact", input.id);

			const updated = await ctx.payload.update({
				collection: "contacts",
				id: input.id,
				data: input.values,
			});

			await propagateToLinkedDeclarations(
				ctx.payload,
				"contact",
				input.id,
				input.values,
			);

			return updated;
		}),

	upsertSchema: userProtectedProcedure
		.input(z.object({ values: schemaForm, id: z.number().optional() }))
		.mutation(async ({ input, ctx }) => {
			const userId = Number(ctx.session.user.id);

			if (!input.id) {
				return ctx.payload.create({
					collection: "schemas",
					data: { ...input.values, user: userId },
				});
			}

			await getOwnedLibraryItem(ctx.payload, userId, "schema", input.id);

			const updated = await ctx.payload.update({
				collection: "schemas",
				id: input.id,
				data: input.values,
			});

			await propagateToLinkedDeclarations(
				ctx.payload,
				"schema",
				input.id,
				input.values,
			);

			return updated;
		}),

	/**
	 * Delete a parent. Detach is structural (ADR-0004): null the `parent` on every
	 * linked declaration first, leaving each copy's content untouched, then delete
	 * the parent row. No published declaration is affected.
	 */
	deleteContact: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const userId = Number(ctx.session.user.id);
			await getOwnedLibraryItem(ctx.payload, userId, "contact", input.id);

			const linked = await ctx.payload.find({
				collection: "declarations",
				where: { "contact.parent": { equals: input.id } },
				depth: 0,
				limit: 1000,
			});

			for (const declaration of linked.docs) {
				await ctx.payload.update({
					collection: "declarations",
					id: declaration.id,
					data: { contact: { ...declaration.contact, parent: null } },
				});
			}

			await ctx.payload.delete({ collection: "contacts", id: input.id });
			return { id: input.id };
		}),

	deleteSchema: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const userId = Number(ctx.session.user.id);
			await getOwnedLibraryItem(ctx.payload, userId, "schema", input.id);

			const linked = await ctx.payload.find({
				collection: "declarations",
				where: { "schema.parent": { equals: input.id } },
				depth: 0,
				limit: 1000,
			});

			for (const declaration of linked.docs) {
				await ctx.payload.update({
					collection: "declarations",
					id: declaration.id,
					data: { schema: { ...declaration.schema, parent: null } },
				});
			}

			await ctx.payload.delete({ collection: "schemas", id: input.id });
			return { id: input.id };
		}),

	/**
	 * Link a declaration to a Library parent: copy the parent's content into the
	 * declaration's group and set `parent` (linked mode — read-only in the form).
	 */
	linkContact: userProtectedProcedure
		.input(z.object({ declarationId: z.number(), contactId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const userId = Number(ctx.session.user.id);
			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: input.declarationId,
				userId,
			});

			const parent = await ctx.payload.findByID({
				collection: "contacts",
				id: input.contactId,
				depth: 0,
			});
			assertOwner(parent?.user, userId);

			const declaration = await ctx.payload.findByID({
				collection: "declarations",
				id: input.declarationId,
				depth: 0,
			});

			await ctx.payload.update({
				collection: "declarations",
				id: input.declarationId,
				data: {
					contact: {
						...declaration.contact,
						name: parent.name,
						email: parent.email ?? "",
						url: parent.url ?? "",
						parent: input.contactId,
						toVerify: false,
					},
				},
			});

			await recalculateDeclarationStatus(ctx.payload, input.declarationId);
			return { id: input.declarationId };
		}),

	linkSchema: userProtectedProcedure
		.input(z.object({ declarationId: z.number(), schemaId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const userId = Number(ctx.session.user.id);
			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: input.declarationId,
				userId,
			});

			const parent = await ctx.payload.findByID({
				collection: "schemas",
				id: input.schemaId,
				depth: 0,
			});
			assertOwner(parent?.user, userId);

			const declaration = await ctx.payload.findByID({
				collection: "declarations",
				id: input.declarationId,
				depth: 0,
			});

			await ctx.payload.update({
				collection: "declarations",
				id: input.declarationId,
				data: {
					schema: {
						...declaration.schema,
						name: parent.name,
						url: parent.url ?? "",
						actionPlanUrls: (parent.actionPlanUrls ?? []).map((plan) => ({
							name: plan.name,
							url: plan.url,
						})),
						parent: input.schemaId,
						toVerify: false,
					},
				},
			});

			await recalculateDeclarationStatus(ctx.payload, input.declarationId);
			return { id: input.declarationId };
		}),

	/**
	 * Pre-check for the edit/delete warning modals: which of the user's
	 * declarations link this parent, and which of those are published (they will
	 * flip to Modifiée on an edit). The modal lists the published ones first.
	 */
	linkedDeclarations: userProtectedProcedure
		.input(z.object({ kind: z.enum(["contact", "schema"]), id: z.number() }))
		.query(async ({ input, ctx }) => {
			const userId = Number(ctx.session.user.id);
			await getOwnedLibraryItem(ctx.payload, userId, input.kind, input.id);

			const linked = await ctx.payload.find({
				collection: "declarations",
				where: { [`${input.kind}.parent`]: { equals: input.id } },
				depth: 0,
				limit: 1000,
			});

			return linked.docs.map((declaration) => ({
				id: declaration.id,
				name: declaration.name ?? "",
				isPublished: Boolean(declaration.publishedContent),
			}));
		}),
});
