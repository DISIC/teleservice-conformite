import { TRPCError } from "@trpc/server";
import z from "zod";
import type { Contact } from "~/payload/payload-types";
import { contact } from "~/forms/contact/contactSchema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";

export const contactRouter = createTRPCRouter({
	upsert: userProtectedProcedure
		.input(
			z.object({
				values: contact,
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

			let upsertedContact: Contact;

			if (!id) {
				upsertedContact = await ctx.payload.create({
					collection: "contacts",
					data: { ...values, toVerify: false },
				});
				await ctx.payload.update({
					collection: "declarations",
					id: declarationId,
					data: { contact: upsertedContact.id },
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
					data: { ...values, toVerify: false },
				});
			}

			return { data: upsertedContact };
		}),

	linkExisting: userProtectedProcedure
		.input(
			z.object({
				contactId: z.number(),
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

			const previousContactId =
				typeof declaration.contact === "number"
					? declaration.contact
					: declaration.contact?.id;

			await ctx.payload.update({
				collection: "declarations",
				id: input.declarationId,
				data: { contact: input.contactId },
			});

			// Clean up the previous contact if it was a declaration-scoped (entity-less) row
			// and nothing else points at it.
			if (previousContactId && previousContactId !== input.contactId) {
				const previous = await ctx.payload.findByID({
					collection: "contacts",
					id: previousContactId,
					depth: 0,
				});
				if (previous && !previous.entity) {
					const stillUsed = await ctx.payload.find({
						collection: "declarations",
						where: { contact: { equals: previousContactId } },
						limit: 1,
					});
					if (stillUsed.totalDocs === 0) {
						await ctx.payload.delete({
							collection: "contacts",
							id: previousContactId,
						});
					}
				}
			}

			return { contactId: input.contactId };
		}),
});
