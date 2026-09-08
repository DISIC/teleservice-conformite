import z from "zod";
import { contact, contactDraft } from "~/forms/contact/contactSchema";
import { schemaDraft, schemaForm } from "~/forms/schema/schemaSchema";
import {
	createTRPCRouter,
	declarationProcedure,
	userProtectedProcedure,
} from "../../trpc";
import * as service from "./service";

export type { LibrarySectionKind } from "./service";

const kindInput = z.enum(["contact", "schema"]);

export const contactRouter = createTRPCRouter({
	upsert: declarationProcedure
		.input(z.object({ values: contactDraft }))
		.mutation(({ input, ctx }) =>
			service.upsertSection(
				ctx.payload,
				"contact",
				ctx.declaration.id,
				input.values,
			),
		),
});

export const schemaRouter = createTRPCRouter({
	upsert: declarationProcedure
		.input(z.object({ values: schemaDraft }))
		.mutation(({ input, ctx }) =>
			service.upsertSection(
				ctx.payload,
				"schema",
				ctx.declaration.id,
				input.values,
			),
		),
	skip: declarationProcedure.mutation(({ ctx }) =>
		service.skipSchema(ctx.payload, ctx.declaration.id),
	),
});

export const libraryRouter = createTRPCRouter({
	listContacts: userProtectedProcedure.query(({ ctx }) =>
		service.listParents(ctx.payload, Number(ctx.session.user.id), "contact"),
	),
	listSchemas: userProtectedProcedure.query(({ ctx }) =>
		service.listParents(ctx.payload, Number(ctx.session.user.id), "schema"),
	),
	upsertContact: userProtectedProcedure
		.input(z.object({ values: contact, id: z.number().optional() }))
		.mutation(({ input, ctx }) =>
			service.upsertParent(
				ctx.payload,
				Number(ctx.session.user.id),
				"contact",
				input.values,
				input.id,
			),
		),
	upsertSchema: userProtectedProcedure
		.input(z.object({ values: schemaForm, id: z.number().optional() }))
		.mutation(({ input, ctx }) =>
			service.upsertParent(
				ctx.payload,
				Number(ctx.session.user.id),
				"schema",
				input.values,
				input.id,
			),
		),
	deleteContact: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(({ input, ctx }) =>
			service.deleteParent(
				ctx.payload,
				Number(ctx.session.user.id),
				"contact",
				input.id,
			),
		),
	deleteSchema: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(({ input, ctx }) =>
			service.deleteParent(
				ctx.payload,
				Number(ctx.session.user.id),
				"schema",
				input.id,
			),
		),
	linkContact: declarationProcedure
		.input(z.object({ parentId: z.number() }))
		.mutation(({ input, ctx }) =>
			service.linkParent(
				ctx.payload,
				Number(ctx.session.user.id),
				"contact",
				ctx.declaration,
				input.parentId,
			),
		),
	linkSchema: declarationProcedure
		.input(z.object({ parentId: z.number() }))
		.mutation(({ input, ctx }) =>
			service.linkParent(
				ctx.payload,
				Number(ctx.session.user.id),
				"schema",
				ctx.declaration,
				input.parentId,
			),
		),
	linkedDeclarations: userProtectedProcedure
		.input(z.object({ kind: kindInput, id: z.number() }))
		.query(({ input, ctx }) =>
			service.getLinkedDeclarations(
				ctx.payload,
				Number(ctx.session.user.id),
				input.kind,
				input.id,
			),
		),
});
