import { TRPCError } from "@trpc/server";
import z from "zod";
import { sourceOptions } from "~/payload/selectOptions";
import { contact } from "~/utils/form/contact/schema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { isDeclarationOwner, linkToDeclaration } from "../utils/payload-helper";

export const contactRouter = createTRPCRouter({
	create: userProtectedProcedure
		.input(
			contact.omit({ contactType: true }).extend({
				declarationId: z.number(),
				status: z
					.enum(sourceOptions.map((option) => option.value))
					.optional()
					.default("default"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { contactLink, emailContact, declarationId, status } = input;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			const contact = await ctx.payload.create({
				collection: "contacts",
				data: {
					email: emailContact,
					url: contactLink,
					declaration: declarationId,
					status,
				},
			});

			await linkToDeclaration(
				ctx.payload,
				declarationId,
				contact.id,
				"contact",
			);

			return { data: contact.id };
		}),
	update: userProtectedProcedure
		.input(
			contact.omit({ contactType: true }).extend({
				id: z.number(),
				declarationId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, emailContact, contactLink, declarationId } = input;

			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User must be logged in to create a declaration",
				});
			}

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			const contact = await ctx.payload.update({
				collection: "contacts",
				id,
				data: {
					email: emailContact,
					url: contactLink,
					status: "default",
				},
			});

			return { data: contact };
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
