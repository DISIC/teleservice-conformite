import * as crypto from "node:crypto";
import { TRPCError } from "@trpc/server";
import z from "zod";
import type { AccessRight, User } from "~/payload/payload-types";
import {
	getInvitationUserEmailHtml,
	getInviteAcceptRecapEmailHtml,
} from "~/utils/emails";
import {
	createTRPCRouter,
	publicProcedure,
	userProtectedProcedure,
} from "../trpc";
import { fetchOrReturnRealValue } from "../utils/payload-helper";

export interface AccesRightAugmented extends AccessRight {
	user: User | null;
}

export const accessRightRouter = createTRPCRouter({
	getByDeclarationId: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			const { id } = input;

			const accessRights = await ctx.payload.find({
				collection: "access-rights",
				where: {
					declaration: { equals: id },
				},
				sort: "createdAt",
				limit: 100,
				depth: 1,
			});

			const tmpAccessRights = await Promise.all(
				accessRights.docs.map(async (ar) => ({
					...ar,
					user: ar.user ? await fetchOrReturnRealValue(ar.user, "users") : null,
				})),
			);

			return tmpAccessRights;
		}),

	create: userProtectedProcedure
		.input(
			z.object({
				declarationId: z.number(),
				email: z.email(),
				role: z.enum(["admin"]),
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

			const isAccessRightExist = await ctx.payload.find({
				collection: "access-rights",
				where: {
					declaration: { equals: declarationId },
					or: [
						{ tmpUserEmail: { equals: email } },
						{ "user.email": { equals: email } },
					],
				},
				limit: 1,
			});

			if (isAccessRightExist.totalDocs > 0)
				throw new TRPCError({
					code: "CONFLICT",
					message: "Un droit d'accès existe déjà pour cet utilisateur.",
				});

			const users = await ctx.payload.find({
				collection: "users",
				where: {
					email: {
						equals: email,
					},
				},
				limit: 1,
			});

			// To handle the case user doesn't exist, we create an access right with a null user and the email in tmpUserEmail.
			// When the user will sign up with this email, we will link the access right to the user and send them a notification email.
			let user = null;

			if (users.totalDocs === 1) user = users.docs[0] as User;

			const token = crypto.randomBytes(32).toString("hex");
			const inviteTokenHash = crypto
				.createHash("sha256")
				.update(token)
				.digest("hex");

			const accessRight = await ctx.payload.create({
				collection: "access-rights",
				data: {
					declaration: declarationId,
					user: user ? user.id : null,
					tmpUserEmail: user ? null : email,
					role,
					status: "pending",
					inviteTokenHash,
					invitedBy: Number(ctx.session.user.id),
					inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0], // 7 days from now
				},
				depth: 1,
			});

			await ctx.payload.sendEmail({
				to: email,
				subject: "Invitation à collaborer sur une déclaration",
				html: getInviteAcceptRecapEmailHtml({
					link: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/accept-invite?token=${token}&email=${email}`,
					fullName: `${ctx.session.user.name}`,
					declarationName: declaration?.name || `Déclaration #${declarationId}`,
					administrationName: `${declaration?.entity?.name}`,
				}),
			});

			return accessRight;
		}),

	validateInvite: userProtectedProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ input, ctx }) => {
			const { token } = input;

			const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

			const userExists = await ctx.payload.find({
				collection: "users",
				where: { id: { equals: Number(ctx.session.user.id) } },
				limit: 1,
			});

			if (userExists.totalDocs === 0)
				throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

			const currentUser = userExists.docs[0] as User;

			const invites = await ctx.payload.find({
				collection: "access-rights",
				where: {
					inviteTokenHash: { equals: tokenHash },
					status: { equals: "pending" },
				},
				limit: 1,
				depth: 2,
			});

			const tmpInvite = invites.docs[0];
			if (!tmpInvite || !tmpInvite.inviteExpiresAt)
				throw new TRPCError({ code: "NOT_FOUND" });

			const invite = {
				...tmpInvite,
				user: tmpInvite.user
					? await fetchOrReturnRealValue(tmpInvite.user, "users")
					: null,
				declaration: await fetchOrReturnRealValue(
					tmpInvite.declaration as number,
					"declarations",
				),
				invitedBy: await fetchOrReturnRealValue(
					tmpInvite.invitedBy as number,
					"users",
				),
			};

			const currentEntity = await fetchOrReturnRealValue(
				typeof invite.declaration.entity === "number"
					? invite.declaration.entity
					: invite.declaration.entity.id,
				"entities",
			);

			if (
				(invite.user && invite.user.id !== currentUser.id) ||
				(!invite.user && invite.tmpUserEmail !== currentUser.email)
			)
				throw new TRPCError({ code: "UNAUTHORIZED" });

			const isExpired =
				invite.inviteExpiresAt && new Date(invite.inviteExpiresAt) < new Date();
			if (!invite.inviteExpiresAt && isExpired)
				throw new TRPCError({ code: "BAD_REQUEST" });

			const updatedInvite = await ctx.payload.update({
				collection: "access-rights",
				id: invite.id,
				data: {
					user: currentUser.id,
					status: "approved",
					tmpUserEmail: null,
					inviteExpiresAt: null,
					inviteTokenHash: null,
				},
			});

			const declarationListLink = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/dashboard/declarations`;

			await ctx.payload.sendEmail({
				to: invite.invitedBy.email,
				subject: "Invitation à collaborer sur une déclaration",
				html: getInvitationUserEmailHtml({
					link: `${declarationListLink}/${invite.declaration.id}`,
					linkDeclarationList: declarationListLink,
					fullName: `${currentUser.name}`,
					declarationName:
						invite.declaration?.name || `Déclaration #${invite.declaration.id}`,
					administrationName: `${currentEntity.name}`,
				}),
			});

			return updatedInvite;
		}),

	delete: userProtectedProcedure
		.input(z.number())
		.mutation(async ({ input: id, ctx }) => {
			const accessRight = await ctx.payload.findByID({
				collection: "access-rights",
				id,
				depth: 0,
			});

			if (!accessRight)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Access right not found",
				});

			const currentUserAccessRight = await ctx.payload.find({
				collection: "access-rights",
				where: {
					declaration: { equals: accessRight.declaration as number },
					user: { equals: Number(ctx.session.user.id) },
				},
				limit: 1,
			});

			if (currentUserAccessRight.totalDocs === 0)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Current user cannot remove this access right",
				});

			const deletedAccesRight = await ctx.payload.delete({
				collection: "access-rights",
				id,
			});

			return deletedAccesRight;
		}),
});
