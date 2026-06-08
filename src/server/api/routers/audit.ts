import z from "zod";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";

/**
 * Lenient all-optional partial: any one Sub-section slice may arrive on its
 * own (ADR-0002). `isRealised` is supplied explicitly by the general form —
 * never inferred from the presence of unrelated fields.
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
	upsert: userProtectedProcedure
		.input(
			z.object({
				values: auditUpsertValues,
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

			const { usedTools, testEnvironments, technologies, date, ...scalars } =
				values;

			// Only touch the relation/array fields the submitted slice actually
			// carries — every audit field is optional in the partial schema.
			const data = {
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

			const audit = id
				? await ctx.payload.update({ collection: "audits", id, data })
				: await ctx.payload.create({
						collection: "audits",
						draft: true,
						data: { ...data, declaration: declarationId },
					});

			return { data: audit };
		}),
});
