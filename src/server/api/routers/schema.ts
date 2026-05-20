import { TRPCError } from "@trpc/server";
import z from "zod";
import type { Schema } from "~/payload/payload-types";
import { schemaForm } from "~/utils/form/schema/schema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";

export const schemaRouter = createTRPCRouter({
	upsert: userProtectedProcedure
		.input(
			z.object({
				values: schemaForm,
				id: z.number().optional(),
				declarationId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, declarationId, values } = input;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session.user.id),
			});

			let upsertedSchema: Schema;

			if (!id) {
				upsertedSchema = await ctx.payload.create({
					collection: "schemas",
					data: { ...values, toVerify: false },
				});
				await ctx.payload.update({
					collection: "declarations",
					id: declarationId,
					data: { schema: upsertedSchema.id },
				});
			} else {
				const existing = await ctx.payload.findByID({
					collection: "schemas",
					id,
				});

				if (!existing)
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Schema with id ${id} not found`,
					});

				upsertedSchema = await ctx.payload.update({
					collection: "schemas",
					id,
					data: { ...values, toVerify: false },
				});
			}

			return { data: upsertedSchema };
		}),
	linkExisting: userProtectedProcedure
		.input(
			z.object({
				schemaId: z.number(),
				declarationId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: input.declarationId,
				userId: Number(ctx.session.user.id),
			});

			const declaration = await ctx.payload.findByID({
				collection: "declarations",
				id: input.declarationId,
				depth: 0,
			});

			const previousSchemaId =
				typeof declaration.schema === "number"
					? declaration.schema
					: declaration.schema?.id;

			await ctx.payload.update({
				collection: "declarations",
				id: input.declarationId,
				data: { schema: input.schemaId },
			});

			if (previousSchemaId && previousSchemaId !== input.schemaId) {
				const previous = await ctx.payload.findByID({
					collection: "schemas",
					id: previousSchemaId,
					depth: 0,
				});
				if (previous && !previous.entity) {
					const stillUsed = await ctx.payload.find({
						collection: "declarations",
						where: { schema: { equals: previousSchemaId } },
						limit: 1,
					});
					if (stillUsed.totalDocs === 0) {
						await ctx.payload.delete({
							collection: "schemas",
							id: previousSchemaId,
						});
					}
				}
			}

			return { schemaId: input.schemaId };
		}),
});
