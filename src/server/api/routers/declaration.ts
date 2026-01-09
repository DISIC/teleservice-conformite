import { TRPCError } from "@trpc/server";
import z from "zod";

import type { appKindOptions } from "~/payload/collections/Declaration";
import type { ZDeclarationMultiStepFormSchema } from "~/utils/form/declaration/schema";
import { declarationGeneral } from "~/utils/form/declaration/schema";
import { createTRPCRouter, publicProcedure, userProtectedProcedure } from "../trpc";
import { kindOptions } from "~/payload/collections/Entity";

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

			const returnValue: Pick<
				ZDeclarationMultiStepFormSchema,
				"general" | "audit"
			> = {
				general: {
					name: araJson.procedureName,
					kind: "website" as (typeof appKindOptions)[number]["value"],
					organisation: araJson.procedureInitiator,
					url: araJson.procedureUrl,
					domain: "",
				},
				audit: {
					url: `https://ara.numerique.gouv.fr/declaration/${id}`,
					date: new Date(araJson.publishDate).toISOString().split("T")[0] || "",
					rgaa_version: "rgaa_4",
					realisedBy: araJson.context.auditorOrganisation,
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
					tools: araJson.context.tools,
				},
			};

			return returnValue;
		}),
	create: userProtectedProcedure
		.input(declarationGeneral)
		.mutation(async ({ input, ctx }) => {
			const { organisation, kind, url, domain, name } = input.general;

      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to create a declaration",
        });
      }

			const entity = await ctx.payload.create({
				collection: "entities",
				data: {
					name: organisation,
					kind: domain as any,
				},
			});

			const declaration = await ctx.payload.create({
				collection: "declarations",
				data: {
					name,
					app_kind: kind,
					url,
					entity: entity.id,
					created_by: Number(ctx.session.user.id),
				},
			});

			return { data: declaration.id };
		}),
	delete: publicProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const { id } = input;

			await ctx.payload.delete({
				collection: "declarations",
				id,
			});

			return { data: id };
		}),
	update: userProtectedProcedure
		.input(
			z.object({
				general: declarationGeneral.shape.general.extend({ declarationId: z.number(), entityId: z.number() }),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { organisation, kind, url, domain, name, declarationId, entityId } = input.general;

      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to create a declaration",
        });
      }

      const declaration = await ctx.payload.update({
				collection: "declarations",
				id: declarationId,
				data: {
					name,
					app_kind: kind,
					url,
				},
			});

			await ctx.payload.update({
				collection: "entities",
				id: entityId,
				data: {
					name: organisation,
					kind: kindOptions.find((field) => field.label === domain)?.value,
				},
			});

			return { data: declaration.id };
		}),
});
