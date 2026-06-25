import z from "zod";
import { contactDraft } from "~/forms/contact/contactSchema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";
import { recalculateDeclarationStatus } from "../utils/publish-comparison";

export const contactRouter = createTRPCRouter({
	/**
	 * Custom-mode save: writes the contact group inline on the declaration row and
	 * detaches any Library parent. Linking to a Library parent is handled by the
	 * Library router.
	 */
	upsert: userProtectedProcedure
		.input(
			z.object({
				values: contactDraft,
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
				data: { contact: { ...values, parent: null, toVerify: false } },
			});

			const status = await recalculateDeclarationStatus(
				ctx.payload,
				declarationId,
			);

			return { data: updated.contact, status };
		}),
});
