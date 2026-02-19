import { TRPCError } from "@trpc/server";
import z from "zod";

import { auditStatusOptions } from "~/payload/selectOptions";
import { auditFormSchema } from "~/utils/form/audit/schema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { isDeclarationOwner, linkToDeclaration } from "../utils/payload-helper";

const optionalAuditFormSchema = auditFormSchema
	.partial()
	.omit({
		usedTools: true,
		testEnvironments: true,
	})
	.extend({
		declarationId: z.number(),
		status: z
			.enum(auditStatusOptions.map((option) => option.value))
			.optional()
			.default("default"),
		technologies: z.array(z.string()).optional().default([]),
		usedTools: z.array(z.string()).optional().default([]),
		testEnvironments: z.array(z.string()).optional().default([]),
	});

export const auditRouter = createTRPCRouter({
	create: userProtectedProcedure
		.input(optionalAuditFormSchema)
		.mutation(async ({ input, ctx }) => {
			const {
				declarationId,
				usedTools = [],
				testEnvironments = [],
				technologies = [],
				date,
				status,
				...rest
			} = input;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			const hasMinimumFields =
				Boolean(rest.rgaa_version) &&
				Boolean(rest.realisedBy?.trim()) &&
				typeof rest.rate === "number" &&
				rest.rate > 0 &&
				Boolean(rest.compliantElements?.trim());
			const statusToSave =
				status ?? (hasMinimumFields ? "default" : "notRealised");

			const audit = await ctx.payload.create({
				collection: "audits",
				draft: true,
				data: {
					...rest,
					date: date && date !== "" ? date : undefined,
					testEnvironments: testEnvironments.map((tech) => ({ name: tech })),
					usedTools: usedTools.map((tech) => ({ name: tech })),
					technologies: technologies.map((tech) => ({ name: tech })),
					declaration: declarationId,
					status: statusToSave,
				},
			});

			await linkToDeclaration(ctx.payload, declarationId, audit.id, "audit");

			return { data: audit.id };
		}),
	delete: userProtectedProcedure
		.input(z.object({ id: z.number(), declarationId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const { id, declarationId } = input;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			await ctx.payload.delete({
				collection: "audits",
				id,
			});

			return { data: true };
		}),
	update: userProtectedProcedure
		.input(
			z.object({
				audit: auditFormSchema
					.partial()
					.omit({ section: true, isAuditRealised: true })
					.extend({
						id: z.number(),
						declarationId: z.number(),
						technologies: z.array(z.string()).optional(),
						status: z
							.enum(auditStatusOptions.map((option) => option.value))
							.optional()
							.default("default"),
					}),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const {
				id,
				declarationId,
				technologies = [],
				date,
				status,
				...rest
			} = input.audit;

			const normalizedDate = date && date !== "" ? date : undefined;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			const hasMinimumFields =
				Boolean(rest.rgaa_version) &&
				Boolean(rest.realisedBy?.trim()) &&
				typeof rest.rate === "number" &&
				rest.rate > 0 &&
				Boolean(rest.compliantElements?.trim());

			const statusToSave =
				status ?? (hasMinimumFields ? "default" : "notRealised");

			const updatedAudit = await ctx.payload.update({
				collection: "audits",
				id,
				data: {
					...rest,
					date: normalizedDate,
					usedTools: rest.usedTools?.map((tech) => ({ name: tech })) ?? [],
					testEnvironments:
						rest?.testEnvironments?.map((tech) => ({ name: tech })) ?? [],
					technologies: technologies?.map((tech) => ({ name: tech })) ?? [],
					status: statusToSave,
				},
			});

			return { data: updatedAudit };
		}),
	updateStatus: userProtectedProcedure
		.input(
			z.object({
				declarationId: z.number(),
				id: z.number(),
				status: z.enum(auditStatusOptions.map((option) => option.value)),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { declarationId, id, status } = input;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			const updatedAudit = await ctx.payload.update({
				collection: "audits",
				id,
				data: {
					status,
				},
			});

			return { data: updatedAudit };
		}),
});
