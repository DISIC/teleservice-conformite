import z from "zod";
import { contact } from "~/forms/contact/contactSchema";
import { schemaForm } from "~/forms/schema/schemaSchema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { getOwnedLibraryItem, libraryParentProcedures } from "./librarySection";

const contactParents = libraryParentProcedures("contact", contact);
const schemaParents = libraryParentProcedures("schema", schemaForm);

export const libraryRouter = createTRPCRouter({
	listContacts: contactParents.list,
	listSchemas: schemaParents.list,
	upsertContact: contactParents.upsert,
	upsertSchema: schemaParents.upsert,
	deleteContact: contactParents.delete,
	deleteSchema: schemaParents.delete,
	linkContact: contactParents.link,
	linkSchema: schemaParents.link,

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
