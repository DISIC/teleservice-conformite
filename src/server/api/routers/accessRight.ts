import * as crypto from "node:crypto";
import { TRPCError } from "@trpc/server";
import z from "zod";
import type { User } from "~/payload/payload-types";
import { getInvitationUserEmailHtml } from "~/utils/emails";
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
				sort: "createdAt",
				limit: 10,
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

			const tmpDeclaration = await ctx.payload.findByID({
				collection: "declarations",
				id: declarationId,
			});

			const declaration = {
				...tmpDeclaration,
				entity: await fetchOrReturnRealValue(
					tmpDeclaration.entity as number,
					"entities",
				),
			};

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

			const token = crypto.randomBytes(32).toString("hex");
			const inviteTokenHash = crypto
				.createHash("sha256")
				.update(token)
				.digest("hex");

			const accessRight = await ctx.payload.create({
				collection: "access-rights",
				data: {
					declaration: declarationId,
					user: user.id,
					role,
					status: "pending",
					inviteTokenHash,
					invitedBy: null,
					inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0], // 7 days from now
				},
			});

			await ctx.payload.sendEmail({
				to: email,
				subject: "Invitation à collaborer sur une déclaration",
				html: getInvitationUserEmailHtml({
					link: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/accept-invite?token=${token}&declarationId=${declarationId}`,
					fullName: `${user.name}`,
					declarationName: declaration?.name || `Déclaration #${declarationId}`,
					administrationName: `${declaration.entity.name}`,
				}),
			});

			return accessRight;
		}),

	validateInvite: publicProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ input, ctx }) => {
			const { token } = input;

			const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

			const invites = await ctx.payload.find({
				collection: "access-rights",
				where: {
					inviteTokenHash: { equals: tokenHash },
					status: { equals: "pending" },
				},
				limit: 1,
			});

			const invite = invites.docs[0];
			if (!invite || !invite.inviteExpiresAt)
				throw new TRPCError({ code: "NOT_FOUND" });

			const isExpired = new Date(invite.inviteExpiresAt) < new Date();
			if (isExpired) throw new TRPCError({ code: "BAD_REQUEST" });

			const updatedInvite = await ctx.payload.update({
				collection: "access-rights",
				id: invite.id,
				data: {
					status: "approved",
					inviteExpiresAt: null,
					inviteTokenHash: null,
				},
			});

			return updatedInvite;
		}),
});
