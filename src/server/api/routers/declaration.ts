import { TRPCError } from "@trpc/server";
import z from "zod";
import type { appKindOptions } from "~/payload/collections/Declaration";
import type {
	ZDeclarationAudit,
	ZDeclarationGeneral,
} from "~/utils/form/declaration/schema";
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

			const returnValue: {
				declaration: ZDeclarationGeneral;
				audit: Omit<ZDeclarationAudit, "isAchieved">;
			} = {
				declaration: {
					name: "",
					kind: "mobile_app" as (typeof appKindOptions)[number]["value"],
					organisation: araJson.procedureInitiator,
					appUrl: araJson.procedureUrl,
				} as ZDeclarationGeneral,
				audit: {
					url: `https://ara.numerique.gouv.fr/rapport/${id}/resultats`,
					date: new Date(araJson.publishDate),
					rgaa_version: "rgaa_4",
					realisedBy: araJson.context.auditorOrganization,
					rate: araJson.accessibilityRate,
					pages: araJson.context.samples
						.filter((page: any) => page.url && page.name)
						.map((page: any) => ({
							url: page.url,
							label: page.name,
						})),
					testEnvironments: araJson.context.environments.map((env: any) => ({
						kind: env.platform.toLowerCase(),
						os: env.operatingSystem.toLowerCase(),
					})),
					technologies: araJson.context.technologies,
				},
			};

			return returnValue;
		}),
});
