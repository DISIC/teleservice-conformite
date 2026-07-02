import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import z from "zod";
import type { Contact, Declaration, Schema } from "~/payload/payload-types";
import { userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";
import { recalculateDeclarationStatus } from "../utils/publish-comparison";

/** Contact and Schema are symmetric by invariant: every Library-section flow is
 *  written once here and instantiated per kind; adapters carry the field mapping. */
export type LibrarySectionKind = "contact" | "schema";

type SectionGroup<K extends LibrarySectionKind> = Declaration[K];
type ParentDoc<K extends LibrarySectionKind> = K extends "contact"
	? Contact
	: Schema;

export const LIBRARY_COLLECTION = {
	contact: "contacts",
	schema: "schemas",
} as const satisfies Record<LibrarySectionKind, "contacts" | "schemas">;

type LibrarySectionAdapter<K extends LibrarySectionKind> = {
	collection: (typeof LIBRARY_COLLECTION)[K];
	/** Mode flags every content write must reset; `skipped` is schema's only extension. */
	contentFlags: Partial<SectionGroup<K>>;
	contentFromParent: (parent: ParentDoc<K>) => Partial<SectionGroup<K>>;
};

const ADAPTERS: { [K in LibrarySectionKind]: LibrarySectionAdapter<K> } = {
	contact: {
		collection: "contacts",
		contentFlags: {},
		contentFromParent: (parent) => ({
			name: parent.name,
			email: parent.email ?? "",
			url: parent.url ?? "",
		}),
	},
	schema: {
		collection: "schemas",
		contentFlags: { skipped: false },
		contentFromParent: (parent) => ({
			name: parent.name,
			url: parent.url ?? "",
			actionPlanUrls: (parent.actionPlanUrls ?? []).map((plan) => ({
				name: plan.name,
				url: plan.url,
			})),
		}),
	},
};

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
export async function getOwnedLibraryItem(
	payload: Payload,
	userId: number,
	kind: LibrarySectionKind,
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

/** Single write path for a declaration's contact/schema group — no save may
 *  skip the status recompute. */
export async function writeLibrarySectionGroup<K extends LibrarySectionKind>(
	payload: Payload,
	declarationId: number,
	kind: K,
	group: Partial<SectionGroup<K>>,
) {
	const updated = await payload.update({
		collection: "declarations",
		id: declarationId,
		data: { [kind]: group } as Partial<Pick<Declaration, K>>,
	});

	const status = await recalculateDeclarationStatus(payload, declarationId);

	return { data: updated[kind], status };
}

/**
 * Rewrite the linked copy in every declaration pointing at this parent, then
 * recompute each one's published/modified status. Linked groups are read-only in
 * the UI and writable only here — the single choke point that keeps copies in sync.
 */
async function propagateToLinkedDeclarations<K extends LibrarySectionKind>(
	payload: Payload,
	kind: K,
	parentId: number,
	values: Partial<SectionGroup<K>>,
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

/** Custom-mode save: detaches any Library parent. The draft input stays
 *  lenient so half-filled autosaves persist; the publish gate rechecks. */
export function librarySectionUpsert<
	K extends LibrarySectionKind,
	TValues extends Partial<SectionGroup<K>>,
>(kind: K, draft: z.ZodType<TValues>) {
	return userProtectedProcedure
		.input(z.object({ values: draft, declarationId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: input.declarationId,
				userId: Number(ctx.session.user.id),
			});

			return writeLibrarySectionGroup(ctx.payload, input.declarationId, kind, {
				...input.values,
				...ADAPTERS[kind].contentFlags,
				parent: null,
				toVerify: false,
			});
		});
}

/** Library-parent CRUD + linking for one kind — instantiated twice by the
 *  library router, so both kinds get identical lifecycle rules by construction. */
export function libraryParentProcedures<
	K extends LibrarySectionKind,
	TValues extends Partial<SectionGroup<K>> & { name: string },
>(kind: K, parentSchema: z.ZodType<TValues>) {
	const adapter = ADAPTERS[kind];

	return {
		list: userProtectedProcedure.query(async ({ ctx }) => {
			const result = await ctx.payload.find({
				collection: adapter.collection,
				where: { user: { equals: Number(ctx.session.user.id) } },
				limit: 100,
				depth: 0,
			});
			return result.docs as ParentDoc<K>[];
		}),

		/**
		 * Create a parent (no propagation — nothing links it yet) or update one and
		 * fan the new content out to every linked declaration.
		 */
		upsert: userProtectedProcedure
			.input(z.object({ values: parentSchema, id: z.number().optional() }))
			.mutation(async ({ input, ctx }) => {
				const userId = Number(ctx.session.user.id);

				if (!input.id) {
					const created = await ctx.payload.create({
						collection: adapter.collection,
						data: { ...input.values, user: userId } as never,
					});
					return created;
				}

				await getOwnedLibraryItem(ctx.payload, userId, kind, input.id);

				const updated = await ctx.payload.update({
					collection: adapter.collection,
					id: input.id,
					data: input.values as never,
				});

				await propagateToLinkedDeclarations(
					ctx.payload,
					kind,
					input.id,
					input.values,
				);

				return updated;
			}),

		/**
		 * Delete a parent. Null the `parent` on every linked declaration first,
		 * leaving each copy's content untouched, then delete the parent row.
		 */
		delete: userProtectedProcedure
			.input(z.object({ id: z.number() }))
			.mutation(async ({ input, ctx }) => {
				const userId = Number(ctx.session.user.id);
				await getOwnedLibraryItem(ctx.payload, userId, kind, input.id);

				const linked = await ctx.payload.find({
					collection: "declarations",
					where: { [`${kind}.parent`]: { equals: input.id } },
					depth: 0,
					limit: 1000,
				});

				for (const declaration of linked.docs) {
					await ctx.payload.update({
						collection: "declarations",
						id: declaration.id,
						data: { [kind]: { ...declaration[kind], parent: null } },
					});
				}

				await ctx.payload.delete({
					collection: adapter.collection,
					id: input.id,
				});
				return { id: input.id };
			}),

		/**
		 * Link a declaration to a Library parent: copy the parent's content into the
		 * declaration's group and set `parent` (linked mode — read-only in the form).
		 */
		link: userProtectedProcedure
			.input(z.object({ declarationId: z.number(), parentId: z.number() }))
			.mutation(async ({ input, ctx }) => {
				const userId = Number(ctx.session.user.id);
				await hasAccessToDeclaration({
					payload: ctx.payload,
					declarationId: input.declarationId,
					userId,
				});

				const parent = await ctx.payload.findByID({
					collection: adapter.collection,
					id: input.parentId,
					depth: 0,
				});
				assertOwner(parent?.user, userId);

				const declaration = await ctx.payload.findByID({
					collection: "declarations",
					id: input.declarationId,
					depth: 0,
				});

				return writeLibrarySectionGroup(
					ctx.payload,
					input.declarationId,
					kind,
					{
						...declaration[kind],
						...adapter.contentFromParent(parent as ParentDoc<K>),
						...adapter.contentFlags,
						parent: input.parentId,
						toVerify: false,
					},
				);
			}),
	};
}
