import z from "zod";
import { declarationGeneral } from "~/forms/declaration/declarationSchema";
import {
	createTRPCRouter,
	declarationProcedure,
	userProtectedProcedure,
} from "../../trpc";
import * as service from "./service";
import { getUserEntity } from "./utils";

export const declarationRouter = createTRPCRouter({
	list: userProtectedProcedure
		.input(z.object({ page: z.number().int().min(1) }))
		.query(({ input, ctx }) =>
			service.listOwnedDeclarations(
				ctx.payload,
				Number(ctx.session.user.id),
				input.page,
			),
		),
	// Fetch-only ARA preview consumed by UpdateAuditFromAraModal.
	getInfoFromAra: userProtectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => ({
			data: await service.getAraReportData(input.id),
		})),
	createManual: userProtectedProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ input, ctx }) => {
			const userId = Number(ctx.session.user.id);
			const entity = await getUserEntity(ctx.payload, userId);

			return {
				data: await service.createManualDeclaration(ctx.payload, userId, {
					name: input.name,
					entityId: entity?.id,
				}),
			};
		}),
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
		.input(z.object({ general: declarationGeneral.shape.general }))
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
	deposit: declarationProcedure.mutation(async ({ ctx }) => ({
		data: await service.depositDeclaration(ctx.payload, ctx.declaration),
	})),
	getPreviousDepositedRate: declarationProcedure.query(({ ctx }) =>
		service.getPreviousDepositedRate(ctx.payload, ctx.declaration),
	),
	revertToDeposited: declarationProcedure.mutation(async ({ ctx }) => ({
		data: await service.revertToDeposited(ctx.payload, ctx.declaration),
	})),
});
