import z from "zod";
import { auditFormSchema } from "~/forms/audit/auditSchema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";

const optionalAuditFormSchema = auditFormSchema
	.partial()
	.omit({
		usedTools: true,
		testEnvironments: true,
	})
	.extend({
		declarationId: z.number(),
		technologies: z.array(z.string()).optional().default([]),
		usedTools: z.array(z.string()).optional().default([]),
		testEnvironments: z.array(z.string()).optional().default([]),
	});

export const auditRouter = createTRPCRouter({
	create: userProtectedProcedure
		.input(optionalAuditFormSchema)
		.mutation(async ({ input, ctx }) => {
			const {
				isAuditRealised,
				declarationId,
				usedTools = [],
				testEnvironments = [],
				technologies = [],
				date,
				...rest
			} = input;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session.user.id),
			});

			const audit = await ctx.payload.create({
				collection: "audits",
				draft: true,
				data: {
					...rest,
					isRealised: isAuditRealised,
					date: date && date !== "" ? date : undefined,
					testEnvironments: testEnvironments.map((tech) => ({ name: tech })),
					usedTools: usedTools.map((tech) => ({ name: tech })),
					technologies: technologies.map((tech) => ({ name: tech })),
					declaration: declarationId,
				},
			});

			return { data: audit.id };
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
					}),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, declarationId, technologies, date, usedTools, ...rest } =
				input.audit;
			const { testEnvironments, ...scalarFields } = rest;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session.user.id),
			});

			// Each save carries only the sub-section being edited, so only touch
			// `isRealised` when the "Réalisation de l'audit" fields are present —
			// other sub-sections must leave it untouched. `compliantElements` lives
			// in its own sub-section and no longer gates the realised state.
			const touchesRealisation =
				scalarFields.rgaa_version !== undefined ||
				scalarFields.realisedBy !== undefined ||
				scalarFields.rate !== undefined;

			const isRealised =
				Boolean(scalarFields.rgaa_version) &&
				Boolean(scalarFields.realisedBy?.trim()) &&
				typeof scalarFields.rate === "number" &&
				scalarFields.rate > 0;

			const updatedAudit = await ctx.payload.update({
				collection: "audits",
				id,
				data: {
					...scalarFields,
					// Only overwrite fields the submitted sub-section actually owns.
					...(date !== undefined && {
						date: date && date !== "" ? date : null,
					}),
					...(usedTools !== undefined && {
						usedTools: usedTools.map((tech) => ({ name: tech })),
					}),
					...(testEnvironments !== undefined && {
						testEnvironments: testEnvironments.map((tech) => ({ name: tech })),
					}),
					...(technologies !== undefined && {
						technologies: technologies.map((tech) => ({ name: tech })),
					}),
					...(touchesRealisation && { isRealised }),
					toVerify: false,
				},
			});

			return { data: updatedAudit };
		}),
});
