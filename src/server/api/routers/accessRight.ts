import * as crypto from "node:crypto";
import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import z from "zod";
import type {
	AccessRight,
	Declaration,
	Entity,
	User,
} from "~/payload/payload-types";
import {
	getInvitationUserEmailHtml,
	getInviteAcceptRecapEmailHtml,
} from "~/emails";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import {
	fetchOrReturnRealValue,
	findByIdPopulated,
	findPopulated,
	hasAccessToDeclaration,
} from "../utils/payload-helper";

type EmailToInviteUserDeclarationProps = {
	payload: Payload;
	emailToInvite: string;
	declaration: Declaration;
	invitedBy: { name: string };
	token: string;
	entity: Entity;
};

const getInviteExpiresAt = () =>
	new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const sendEmailToInviteUserDeclaration = async ({
	payload,
	emailToInvite,
	declaration,
	invitedBy,
	token,
	entity,
}: EmailToInviteUserDeclarationProps) => {
	await payload.sendEmail({
		to: emailToInvite,
		subject: "Invitation à collaborer sur une déclaration",
		html: await getInviteAcceptRecapEmailHtml({
			link: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/accept-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(emailToInvite)}`,
			fullName: `${invitedBy.name}`,
			declarationName: declaration?.name || `Déclaration #${declaration.id}`,
			administrationName: `${entity.name}`,
		}),
	});
};

export interface AccessRightAugmented extends AccessRight {
	user: User | null;
}

export const accessRightRouter = createTRPCRouter({
	getByDeclarationId: userProtectedProcedure
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

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session.user.id),
			});

			const declaration = await findByIdPopulated(
				ctx.payload,
				"declarations",
				declarationId,
				1,
			);
			if (!declaration)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Declaration not found",
				});

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

			// Pending invitees are stored by email and linked to their user on first signup.
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
					inviteExpiresAt: getInviteExpiresAt(),
				},
				depth: 1,
			});

			await sendEmailToInviteUserDeclaration({
				payload: ctx.payload,
				emailToInvite: email,
				declaration,
				invitedBy: ctx.session.user,
				token,
				entity: declaration.entity,
			});

			return accessRight;
		}),

	validateInvite: userProtectedProcedure
		.input(z.object({ token: z.string() }))
		.mutation(async ({ input, ctx }) => {
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

			const invites = await findPopulated(ctx.payload, {
				collection: "access-rights",
				where: {
					inviteTokenHash: { equals: tokenHash },
					status: { equals: "pending" },
				},
				limit: 1,
				depth: 2,
			});

			const invite = invites.docs[0];
			if (!invite || !invite.inviteExpiresAt || !invite.invitedBy)
				throw new TRPCError({ code: "NOT_FOUND" });

			const currentEntity = invite.declaration.entity;

			if (
				(invite.user && invite.user.id !== currentUser.id) ||
				(!invite.user && invite.tmpUserEmail !== currentUser.email)
			)
				throw new TRPCError({ code: "UNAUTHORIZED" });

			const isExpired =
				invite.inviteExpiresAt && new Date(invite.inviteExpiresAt) < new Date();
			if (isExpired) throw new TRPCError({ code: "BAD_REQUEST" });

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
				html: await getInvitationUserEmailHtml({
					link: `${declarationListLink}/${invite.declaration.id}`,
					linkDeclarationList: declarationListLink,
					fullName: currentUser.name,
					declarationName:
						invite.declaration.name || `Déclaration #${invite.declaration.id}`,
					administrationName: currentEntity.name,
				}),
			});

			return updatedInvite;
		}),

	resendInviteMail: userProtectedProcedure
		.input(z.number())
		.mutation(async ({ input: id, ctx }) => {
			const accessRight = await findByIdPopulated(
				ctx.payload,
				"access-rights",
				id,
				2,
			);

			if (!accessRight)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Access right not found",
				});

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: accessRight.declaration.id,
				userId: Number(ctx.session.user.id),
			});

			const currentEntity = accessRight.declaration.entity;

			if (accessRight.status !== "pending")
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only pending invites can be resent",
				});

			const token = crypto.randomBytes(32).toString("hex");
			const inviteTokenHash = crypto
				.createHash("sha256")
				.update(token)
				.digest("hex");

			await ctx.payload.update({
				collection: "access-rights",
				id,
				data: {
					inviteTokenHash,
					inviteExpiresAt: getInviteExpiresAt(),
				},
			});

			await sendEmailToInviteUserDeclaration({
				payload: ctx.payload,
				emailToInvite:
					accessRight.tmpUserEmail || (accessRight.user?.email as string),
				declaration: accessRight.declaration,
				invitedBy: { name: ctx.session.user.name },
				token,
				entity: currentEntity,
			});

			return accessRight;
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

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: accessRight.declaration as number,
				userId: Number(ctx.session.user.id),
			});

			const deletedAccesRight = await ctx.payload.delete({
				collection: "access-rights",
				id,
			});

			return deletedAccesRight;
		}),
});
