import { TRPCError } from "@trpc/server";
import z from "zod";
import type { Contact } from "~/payload/payload-types";
import { sourceOptions } from "~/payload/selectOptions";
import { contact } from "~/utils/form/contact/schema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { isDeclarationOwner, linkToDeclaration } from "../utils/payload-helper";

export const contactRouter = createTRPCRouter({
	upsert: userProtectedProcedure
		.input(
			contact.omit({ contactType: true }).extend({
				id: z.number().optional(),
				declarationId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, emailContact, contactLink, declarationId } = input;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			let upsertedContact: Contact;

			if (!id) {
				upsertedContact = await ctx.payload.create({
					collection: "contacts",
					data: {
						email: emailContact,
						url: contactLink,
						declaration: declarationId,
					},
				});

				await linkToDeclaration(
					ctx.payload,
					declarationId,
					upsertedContact.id,
					"contact",
				);
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
					data: {
						email: emailContact,
						url: contactLink,
						status: "default",
					},
				});
			}

			return { data: upsertedContact };
		}),

	updateStatus: userProtectedProcedure
		.input(
			z.object({
				declarationId: z.number(),
				id: z.number(),
				status: z.enum(sourceOptions.map((option) => option.value)),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { declarationId, id, status } = input;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			const updatedContact = await ctx.payload.update({
				collection: "contacts",
				id,
				data: {
					status,
				},
			});

			return { data: updatedContact };
		}),
});
