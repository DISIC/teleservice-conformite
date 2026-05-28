import { TRPCError } from "@trpc/server";
import z from "zod";
import { contact as contactSchema } from "~/forms/contact/contactSchema";
import { schemaForm } from "~/forms/schema/schemaSchema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";

async function assertUserEntityAccess({
	payload,
	userId,
	entityId,
}: {
	payload: any;
	userId: number;
	entityId: number;
}) {
	const user = await payload.findByID({ collection: "users", id: userId });
	const userEntityId =
		typeof user?.entity === "number" ? user.entity : user?.entity?.id;
	if (!userEntityId || userEntityId !== entityId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You do not have access to this entity's library.",
		});
	}
}

export const entityLibraryRouter = createTRPCRouter({
	listContacts: userProtectedProcedure
		.input(z.object({ entityId: z.number() }))
		.query(async ({ input, ctx }) => {
			await assertUserEntityAccess({
				payload: ctx.payload,
				userId: Number(ctx.session.user.id),
				entityId: input.entityId,
			});
			const result = await ctx.payload.find({
				collection: "contacts",
				where: { entity: { equals: input.entityId } },
				limit: 100,
				depth: 0,
			});
			return result.docs;
		}),
	listSchemas: userProtectedProcedure
		.input(z.object({ entityId: z.number() }))
		.query(async ({ input, ctx }) => {
			await assertUserEntityAccess({
				payload: ctx.payload,
				userId: Number(ctx.session.user.id),
				entityId: input.entityId,
			});
			const result = await ctx.payload.find({
				collection: "schemas",
				where: { entity: { equals: input.entityId } },
				limit: 100,
				depth: 0,
			});
			return result.docs;
		}),
	upsertContact: userProtectedProcedure
		.input(
			z.object({
				values: contactSchema,
				id: z.number().optional(),
				entityId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			await assertUserEntityAccess({
				payload: ctx.payload,
				userId: Number(ctx.session.user.id),
				entityId: input.entityId,
			});

			if (input.id) {
				return ctx.payload.update({
					collection: "contacts",
					id: input.id,
					data: { ...input.values, entity: input.entityId, toVerify: false },
				});
			}

			return ctx.payload.create({
				collection: "contacts",
				data: { ...input.values, entity: input.entityId, toVerify: false },
			});
		}),
	upsertSchema: userProtectedProcedure
		.input(
			z.object({
				values: schemaForm,
				id: z.number().optional(),
				entityId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			await assertUserEntityAccess({
				payload: ctx.payload,
				userId: Number(ctx.session.user.id),
				entityId: input.entityId,
			});

			if (input.id) {
				return ctx.payload.update({
					collection: "schemas",
					id: input.id,
					data: { ...input.values, entity: input.entityId, toVerify: false },
				});
			}

			return ctx.payload.create({
				collection: "schemas",
				data: { ...input.values, entity: input.entityId, toVerify: false },
			});
		}),
	deleteContact: userProtectedProcedure
		.input(z.object({ id: z.number(), entityId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			await assertUserEntityAccess({
				payload: ctx.payload,
				userId: Number(ctx.session.user.id),
				entityId: input.entityId,
			});

			const usedBy = await ctx.payload.find({
				collection: "declarations",
				where: { contact: { equals: input.id } },
				limit: 1,
			});
			if (usedBy.totalDocs > 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"Ce contact est utilisé par au moins une déclaration. Détachez-le avant de le supprimer.",
				});
			}

			await ctx.payload.delete({ collection: "contacts", id: input.id });
			return { id: input.id };
		}),
	deleteSchema: userProtectedProcedure
		.input(z.object({ id: z.number(), entityId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			await assertUserEntityAccess({
				payload: ctx.payload,
				userId: Number(ctx.session.user.id),
				entityId: input.entityId,
			});

			const usedBy = await ctx.payload.find({
				collection: "declarations",
				where: { schema: { equals: input.id } },
				limit: 1,
			});
			if (usedBy.totalDocs > 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"Ce schéma est utilisé par au moins une déclaration. Détachez-le avant de le supprimer.",
				});
			}

			await ctx.payload.delete({ collection: "schemas", id: input.id });
			return { id: input.id };
		}),
});
