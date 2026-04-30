import { TRPCError } from "@trpc/server";
import z from "zod";
import type { Contact } from "~/payload/payload-types";
import { contact } from "~/utils/form/contact/schema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";

export const contactRouter = createTRPCRouter({
	upsert: userProtectedProcedure
		.input(
			contact.extend({
				id: z.number().optional(),
				declarationId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, declarationId, ...formValues } = input;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session.user.id),
			});

			let upsertedContact: Contact;

			if (!id) {
				upsertedContact = await ctx.payload.create({
					collection: "contacts",
					data: { ...formValues, declaration: declarationId, toVerify: false },
				});
			} else {
				const existingContact = await ctx.payload.findByID({
					collection: "contacts",
					id,
				});

				if (!existingContact)
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Contact with id ${id} not found`,
					});

				upsertedContact = await ctx.payload.update({
					collection: "contacts",
					id,
					data: { ...formValues, toVerify: false },
				});
			}

			return { data: upsertedContact };
		}),
});
