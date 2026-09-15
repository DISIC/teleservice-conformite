import z from "zod";
import { declarationGeneral } from "~/forms/declaration/declarationSchema";
import {
	createTRPCRouter,
	declarationProcedure,
	userProtectedProcedure,
} from "../../trpc";
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
	delete: declarationProcedure.mutation(async ({ ctx }) => ({
		data: await service.deleteDeclaration(ctx.payload, ctx.declaration),
	})),
	update: declarationProcedure
		.input(
			z.object({
				general: declarationGeneral.shape.general.extend({
					entityId: z.number(),
				}),
			}),
		)
		.mutation(async ({ input, ctx }) => ({
			data: await service.updateDeclaration(
				ctx.payload,
				ctx.declaration,
				input.general,
			),
		})),
	updateName: declarationProcedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input, ctx }) => ({
			data: await service.updateDeclarationName(
				ctx.payload,
				ctx.declaration,
				input.name,
			),
		})),
	publish: declarationProcedure.mutation(async ({ ctx }) => ({
		data: await service.publishDeclaration(ctx.payload, ctx.declaration),
	})),
	getPreviousPublishedRate: declarationProcedure.query(({ ctx }) =>
		service.getPreviousPublishedRate(ctx.payload, ctx.declaration),
	),
	revertToPublished: declarationProcedure.mutation(async ({ ctx }) => ({
		data: await service.revertToPublished(ctx.payload, ctx.declaration),
	})),
});
