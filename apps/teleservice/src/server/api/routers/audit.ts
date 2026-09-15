import z from "zod";
import { createTRPCRouter, declarationProcedure } from "../trpc";
import { auditPatch, saveSection } from "../utils/section-write";

export const auditRouter = createTRPCRouter({
	update: declarationProcedure
		.input(z.object({ values: auditPatch }))
		.mutation(async ({ input, ctx }) => ({
			data: await saveSection(
				ctx.payload,
				ctx.declaration,
				"audit",
				input.values,
			),
		})),
});
