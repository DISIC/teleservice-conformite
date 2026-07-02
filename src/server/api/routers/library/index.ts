import z from "zod";
import { contact, contactDraft } from "~/forms/contact/contactSchema";
import { schemaDraft, schemaForm } from "~/forms/schema/schemaSchema";
import { createTRPCRouter, userProtectedProcedure } from "../../trpc";
import * as service from "./service";

export type { LibrarySectionKind } from "./service";

const kindInput = z.enum(["contact", "schema"]);

export const contactRouter = createTRPCRouter({
	upsert: userProtectedProcedure
		.input(z.object({ values: contactDraft, declarationId: z.number() }))
		.mutation(({ input, ctx }) =>
			service.upsertSection(
				ctx.payload,
				Number(ctx.session.user.id),
				"contact",
				input.declarationId,
				input.values,
			),
		),
});

export const schemaRouter = createTRPCRouter({
	upsert: userProtectedProcedure
		.input(z.object({ values: schemaDraft, declarationId: z.number() }))
		.mutation(({ input, ctx }) =>
			service.upsertSection(
				ctx.payload,
				Number(ctx.session.user.id),
				"schema",
				input.declarationId,
				input.values,
			),
		),
	skip: userProtectedProcedure
		.input(z.object({ declarationId: z.number() }))
		.mutation(({ input, ctx }) =>
			service.skipSchema(
				ctx.payload,
				Number(ctx.session.user.id),
				input.declarationId,
			),
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
	linkContact: userProtectedProcedure
		.input(z.object({ declarationId: z.number(), parentId: z.number() }))
		.mutation(({ input, ctx }) =>
			service.linkParent(
				ctx.payload,
				Number(ctx.session.user.id),
				"contact",
				input.declarationId,
				input.parentId,
			),
		),
	linkSchema: userProtectedProcedure
		.input(z.object({ declarationId: z.number(), parentId: z.number() }))
		.mutation(({ input, ctx }) =>
			service.linkParent(
				ctx.payload,
				Number(ctx.session.user.id),
				"schema",
				input.declarationId,
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
