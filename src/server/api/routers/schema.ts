import z from "zod";
import { schemaDraft } from "~/forms/schema/schemaSchema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";
import { recalculateDeclarationStatus } from "../utils/publish-comparison";

export const schemaRouter = createTRPCRouter({
	/**
	 * Custom-mode save: writes the schema group inline on the declaration row and
	 * detaches any Library parent. Linking to a Library parent is handled by the
	 * Library router.
	 */
	upsert: userProtectedProcedure
		.input(
			z.object({
				values: schemaDraft,
				declarationId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { declarationId, values } = input;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session.user.id),
			});

			const updated = await ctx.payload.update({
				collection: "declarations",
				id: declarationId,
				data: {
					schema: { ...values, parent: null, skipped: false, toVerify: false },
				},
			});

			const status = await recalculateDeclarationStatus(
				ctx.payload,
				declarationId,
			);

			return { data: updated.schema, status };
		}),

	/**
	 * Skip mode: record the declarant's deliberate "no schema" choice. Clears any
	 * content and Library link so the schema section is empty and not-applicable.
	 */
	skip: userProtectedProcedure
		.input(z.object({ declarationId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const { declarationId } = input;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session.user.id),
			});

			const updated = await ctx.payload.update({
				collection: "declarations",
				id: declarationId,
				data: {
					schema: {
						name: "",
						url: "",
						actionPlanUrls: [],
						parent: null,
						skipped: true,
						toVerify: false,
					},
				},
			});

			const status = await recalculateDeclarationStatus(
				ctx.payload,
				declarationId,
			);

			return { data: updated.schema, status };
		}),
});
