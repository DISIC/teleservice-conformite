import z from "zod";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";
import { recalculateDeclarationStatus } from "../utils/publish-comparison";

/**
 * Lenient all-optional partial: any one Sub-section slice may arrive on its
 * own. `isRealised` is supplied explicitly by the general form — never inferred
 * from the presence of unrelated fields.
 */
const auditUpsertValues = z.object({
	isRealised: z.boolean().optional(),
	date: z.iso.date().optional().or(z.literal("")),
	realisedBy: z.string().optional(),
	rgaa_version: z.enum(["rgaa_4", "rgaa_5"]).optional(),
	rate: z.number().optional(),
	compliantElements: z.string().optional(),
	nonCompliantElements: z.string().optional(),
	disproportionnedCharge: z.string().optional(),
	optionalElements: z.string().optional(),
	usedTools: z.array(z.string()).optional(),
	testEnvironments: z.array(z.string()).optional(),
	technologies: z.array(z.string()).optional(),
});

export const auditRouter = createTRPCRouter({
	update: userProtectedProcedure
		.input(
			z.object({
				values: auditUpsertValues,
				declarationId: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { declarationId, values } = input;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session.user.id),
			});

			const declaration = await ctx.payload.findByID({
				collection: "declarations",
				id: declarationId,
				depth: 0,
			});

			const { usedTools, testEnvironments, technologies, date, ...scalars } =
				values;

			// Merge the slice; optional fields mean only the Sub-section's own fields change.
			const audit = {
				...declaration.audit,
				...scalars,
				...(date !== undefined && {
					date: date && date !== "" ? date : null,
				}),
				...(usedTools !== undefined && {
					usedTools: usedTools.map((name) => ({ name })),
				}),
				...(testEnvironments !== undefined && {
					testEnvironments: testEnvironments.map((name) => ({ name })),
				}),
				...(technologies !== undefined && {
					technologies: technologies.map((name) => ({ name })),
				}),
				toVerify: false,
			};

			const updated = await ctx.payload.update({
				collection: "declarations",
				id: declarationId,
				data: { audit },
			});

			await recalculateDeclarationStatus(ctx.payload, declarationId);

			return { data: updated.audit };
		}),
});
