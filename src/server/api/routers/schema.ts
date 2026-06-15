import z from "zod";
import { schemaForm } from "~/forms/schema/schemaSchema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";
import { recalculateDeclarationStatus } from "../utils/publish-comparison";

export const schemaRouter = createTRPCRouter({
	/**
	 * Custom-mode save: writes the schema group inline on the declaration row and
	 * detaches any Library parent (`parent: null`). Linking to a Library parent is
	 * a separate gesture owned by the Library router (ADR-0004).
	 */
	upsert: userProtectedProcedure
		.input(
			z.object({
				values: schemaForm,
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
				data: { schema: { ...values, parent: null, toVerify: false } },
			});

			await recalculateDeclarationStatus(ctx.payload, declarationId);

			return { data: updated.schema };
		}),
});
