import { TRPCError } from "@trpc/server";
import z from "zod";
import type { User } from "~/payload/payload-types";
import { fetchOrReturnRealValue } from "~/utils/tools";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const accessRightRouter = createTRPCRouter({
	getByDeclarationId: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			const { id } = input;

			const accessRights = await ctx.payload.find({
				collection: "access-rights",
				where: {
					declaration: {
						equals: id,
					},
				},
				limit: 100,
			});

			const tmpAccessRights = await Promise.all(
				accessRights.docs.map(async (ar) => ({
					...ar,
					user: await fetchOrReturnRealValue(ar.user, "users"),
				})),
			);

			return tmpAccessRights;
		}),

	create: publicProcedure
		.input(
			z.object({
				declarationId: z.number(),
				email: z.email(),
				role: z.enum(["reader", "admin"]),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { declarationId, email, role } = input;

			const users = await ctx.payload.find({
				collection: "users",
				where: {
					email: {
						equals: email,
					},
				},
				limit: 1,
			});

			if (users.totalDocs === 0)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Utilisateur avec l'email ${email} non trouvé`,
				});

			const user = users.docs[0] as User;

			const accessRight = await ctx.payload.create({
				collection: "access-rights",
				data: {
					declaration: declarationId,
					user: user.id,
					role,
					status: "pending",
				},
			});

			return accessRight;
		}),
});
