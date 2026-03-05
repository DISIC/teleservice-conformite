import { TRPCError } from "@trpc/server";
import z from "zod";
import type { ActionPlan } from "~/payload/payload-types";
import { schemaForm } from "~/utils/form/schema/schema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import {
	hasAccessToDeclaration,
	linkToDeclaration,
} from "../utils/payload-helper";

export const schemaRouter = createTRPCRouter({
	upsert: userProtectedProcedure
		.input(
			schemaForm
				.omit({
					hasDoneCurrentYearSchema: true,
					hasDonePreviousYearsSchema: true,
				})
				.extend({
					currentYearSchemaUrl: z.string().optional(),
					previousYearsSchemaUrl: z.string().optional(),
					id: z.number().optional(),
					declarationId: z.number(),
				}),
		)
		.mutation(async ({ input, ctx }) => {
			const {
				id,
				declarationId,
				currentYearSchemaUrl,
				previousYearsSchemaUrl,
			} = input;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			let upsertedContact: ActionPlan;

			if (!id) {
				upsertedContact = await ctx.payload.create({
					collection: "action-plans",
					data: {
						currentYearSchemaUrl: currentYearSchemaUrl ?? "",
						previousYearsSchemaUrl: previousYearsSchemaUrl ?? "",
						declaration: declarationId,
						toVerify: false,
					},
				});

				await linkToDeclaration(
					ctx.payload,
					declarationId,
					upsertedContact.id,
					"actionPlan",
				);
			} else {
				const existingActionPlan = await ctx.payload.findByID({
					collection: "action-plans",
					id,
				});

				if (!existingActionPlan)
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Action plan with id ${id} not found`,
					});

				upsertedContact = await ctx.payload.update({
					collection: "action-plans",
					id,
					data: {
						currentYearSchemaUrl: currentYearSchemaUrl ?? "",
						previousYearsSchemaUrl: previousYearsSchemaUrl ?? "",
						toVerify: false,
					},
				});
			}

			return { data: upsertedContact };
		}),
});
