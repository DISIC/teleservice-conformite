import { TRPCError } from "@trpc/server";
import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const declarationRouter = createTRPCRouter({
	getInfoFromAra: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const { id } = input;

			const araResponse = await fetch(
				`https://ara.numerique.gouv.fr/api/reports/${id}`,
			);

			if (!araResponse.ok) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Failed to fetch ARA info: ${araResponse.statusText}`,
				});
			}

			const araJson = await araResponse.json();

			const returnValue = {
				name: "",
				app_kind: "",
				administration: araJson.procedureInitiator,
				url: araJson.procedureUrl,
				published_at: new Date(araJson.publishDate).toISOString(),
				rgaa_version: "rgaa_4",
				rate: araJson.accessibilityRate,
			};

			return returnValue;
		}),
});
