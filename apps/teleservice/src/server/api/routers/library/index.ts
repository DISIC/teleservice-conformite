import z from "zod";
import { contact, contactDraft } from "~/forms/contact/contactSchema";
import { schemaDraft, schemaForm } from "~/forms/schema/schemaSchema";
import {
	createTRPCRouter,
	declarationProcedure,
	userProtectedProcedure,
} from "../../trpc";
import { saveSection } from "../../utils/section-write";
import * as service from "./service";

export type { LibrarySectionKind } from "./service";

const kindInput = z.enum(["contact", "schema"]);

export const contactRouter = createTRPCRouter({
	upsert: declarationProcedure
		.input(z.object({ values: contactDraft }))
		.mutation(async ({ input, ctx }) => ({
			data: await saveSection(
				ctx.payload,
				ctx.declaration,
				"contact",
				input.values,
			),
		})),
});

export const schemaRouter = createTRPCRouter({
	upsert: declarationProcedure
		.input(z.object({ values: schemaDraft }))
		.mutation(async ({ input, ctx }) => ({
			data: await saveSection(
				ctx.payload,
				ctx.declaration,
				"schema",
				input.values,
			),
		})),
	skip: declarationProcedure.mutation(async ({ ctx }) => ({
		data: await service.skipSchema(ctx.payload, ctx.declaration),
	})),
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
		.mutation(async ({ input, ctx }) => ({
			data: await service.linkParent(
				ctx.payload,
				Number(ctx.session.user.id),
				"contact",
				ctx.declaration,
				input.parentId,
			),
		})),
	linkSchema: declarationProcedure
		.input(z.object({ parentId: z.number() }))
		.mutation(async ({ input, ctx }) => ({
			data: await service.linkParent(
				ctx.payload,
				Number(ctx.session.user.id),
				"schema",
				ctx.declaration,
				input.parentId,
			),
		})),
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
