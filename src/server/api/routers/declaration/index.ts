import z from "zod";
import { declarationGeneral } from "~/forms/declaration/declarationSchema";
import { createTRPCRouter, userProtectedProcedure } from "../../trpc";
import * as service from "./service";

export const declarationRouter = createTRPCRouter({
	// Fetch-only ARA preview consumed by UpdateAuditFromAraModal.
	getInfoFromAra: userProtectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => ({
			data: await service.getAraReportData(input.id),
		})),
	createManual: userProtectedProcedure
		.input(
			z.object({ name: z.string().min(1), entityId: z.number().optional() }),
		)
		.mutation(async ({ input, ctx }) => ({
			data: await service.createManualDeclaration(
				ctx.payload,
				Number(ctx.session.user.id),
				input,
			),
		})),
	createFromAra: userProtectedProcedure
		.input(z.object({ araUrl: z.string().min(1) }))
		.mutation(async ({ input, ctx }) => ({
			data: await service.createDeclarationFromAra(
				ctx.payload,
				Number(ctx.session.user.id),
				input.araUrl,
			),
		})),
	createFromUrlAnalysis: userProtectedProcedure
		.input(z.object({ url: z.url() }))
		.mutation(async ({ input, ctx }) => ({
			data: await service.createDeclarationFromUrlAnalysis(
				ctx.payload,
				Number(ctx.session.user.id),
				input.url,
			),
		})),
	delete: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => ({
			data: await service.deleteDeclaration(
				ctx.payload,
				Number(ctx.session.user.id),
				input.id,
			),
		})),
	update: userProtectedProcedure
		.input(
			z.object({
				general: declarationGeneral.shape.general.extend({
					declarationId: z.number(),
					entityId: z.number(),
				}),
			}),
		)
		.mutation(async ({ input, ctx }) => ({
			data: await service.updateDeclaration(
				ctx.payload,
				Number(ctx.session.user.id),
				input.general,
			),
		})),
	updateName: userProtectedProcedure
		.input(z.object({ id: z.number(), name: z.string() }))
		.mutation(async ({ input, ctx }) => ({
			data: await service.updateDeclarationName(
				ctx.payload,
				Number(ctx.session.user.id),
				input,
			),
		})),
	publish: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => ({
			data: await service.publishDeclaration(
				ctx.payload,
				Number(ctx.session.user.id),
				input.id,
			),
		})),
	getPreviousPublishedRate: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) =>
			service.getPreviousPublishedRate(
				ctx.payload,
				Number(ctx.session.user.id),
				input.id,
			),
		),
	revertToPublished: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => ({
			data: await service.revertToPublished(
				ctx.payload,
				Number(ctx.session.user.id),
				input.id,
			),
		})),
});
