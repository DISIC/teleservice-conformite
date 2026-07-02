import z from "zod";
import { schemaDraft } from "~/forms/schema/schemaSchema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { hasAccessToDeclaration } from "../utils/payload-helper";
import {
	librarySectionUpsert,
	writeLibrarySectionGroup,
} from "./librarySection";

export const schemaRouter = createTRPCRouter({
	upsert: librarySectionUpsert("schema", schemaDraft),

	/**
	 * Skip mode: record the declarant's deliberate "no schema" choice. Clears any
	 * content and Library link. Schema-only — a Contact is always required to publish.
	 */
	skip: userProtectedProcedure
		.input(z.object({ declarationId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: input.declarationId,
				userId: Number(ctx.session.user.id),
			});

			return writeLibrarySectionGroup(
				ctx.payload,
				input.declarationId,
				"schema",
				{
					name: "",
					url: "",
					actionPlanUrls: [],
					parent: null,
					skipped: true,
					toVerify: false,
				},
			);
		}),
});
