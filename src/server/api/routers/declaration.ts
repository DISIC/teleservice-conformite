import { TRPCError } from "@trpc/server";
import z from "zod";
import type { Payload } from "payload";

import { declarationGeneral } from "~/utils/form/declaration/schema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { kindOptions } from "~/payload/collections/Entity";
import { isDeclarationOwner, getDefaultDeclarationName, fetchOrReturnRealValue } from "../utils/payload-helper";
import { declarationStatusOptions } from "~/payload/collections/Declaration";

type DeclarationStatus = typeof declarationStatusOptions[number]["value"];

const statusValues = declarationStatusOptions.map(o => o.value) as [
  DeclarationStatus,
  ...DeclarationStatus[]
];

const createOrUpdateEntity = async (payload: Payload, entityId: number | undefined, organisation: string, domain: string) => {
	if (!entityId) {
		const entity = await payload.create({
			collection: "entities",
			draft: true,
			data: {
				name: organisation,
				kind: kindOptions.find((field) => field.label === domain)?.value ?? "none",
			},
		});

		return entity.id;
	}

	await payload.update({
		collection: "entities",
		id: entityId,
		data: {
			name: organisation,
			kind: kindOptions.find((field) => field.label === domain)?.value ?? "none",
		},
	});

	return entityId;
};

export const declarationRouter = createTRPCRouter({
	getInfoFromAra: userProtectedProcedure
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

			return { data: araJson };
		}),
	create: userProtectedProcedure
		.input(
			declarationGeneral
				.extend({
					general: declarationGeneral.shape.general
						.omit({ name: true })
						.extend({
							name: z.string().optional(),
							entityId: z.number().optional(),
							status: z.enum(statusValues).optional(),
						})
				})
		)
		.mutation(async ({ input, ctx }) => {
			const { organisation, kind, url, domain, name, entityId, status } = input.general;

			const declarationName = name ?? await getDefaultDeclarationName(ctx.payload, Number(ctx.session?.user?.id) ?? null);
			const newEntityId = await createOrUpdateEntity(ctx.payload, entityId ?? undefined, organisation, domain);
			
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User must be logged in to create a declaration",
				});
			}
			
			const declaration = await ctx.payload.create({
				collection: "declarations",
				data: {
					name: declarationName,
					app_kind: kind,
					url,
					entity: newEntityId,
					created_by: Number(ctx.session.user.id),
					status: status ?? "unpublished",
				},
			});

			return { data: declaration.id };
		}),
	delete: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const { id } = input;

      const isOwner = await isDeclarationOwner({
        payload: ctx.payload,
        declarationId: id,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      if (!isOwner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be owner of the declaration to delete it",
        });
      }

			await ctx.payload.update({
				collection: "declarations",
				id,
				data: { deletedAt: new Date().toISOString() },
				trash: true,
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

      const isOwner = await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      if (!isOwner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be owner of the declaration to update it",
        });
      }

			await ctx.payload.update({
				collection: "entities",
				id: entityId,
				data: {
					name: organisation,
					kind: kindOptions.find((field) => field.label === domain)?.value ?? "none",
				},
			});

      const result = await ctx.payload.update({
				collection: "declarations",
				id: declarationId,
				data: {
					name,
					app_kind: kind,
					url,
					status: "unpublished",
				},
			});

			const { audit, contact, actionPlan, created_by, entity } = result;
			
			const sanitizedAudit = await fetchOrReturnRealValue(
				audit ?? null,
				"audits",
			);
	
			const sanitizedContact = await fetchOrReturnRealValue(
				contact ?? null,
				"contacts",
			);
	
			const sanitizedActionPlan = await fetchOrReturnRealValue(
				actionPlan ?? null,
				"action-plans",
			);
	
			const sanitizedEntity = await fetchOrReturnRealValue(
				entity ?? null,
				"entities",
			);
			
			const sanitizedUser = await fetchOrReturnRealValue(
				created_by ?? null,
				"users",
			);

			const updatedDeclaration = {
				...result,
				audit: sanitizedAudit,
				contact: sanitizedContact,
				actionPlan: sanitizedActionPlan,
				created_by: sanitizedUser,
				entity: sanitizedEntity,
			};

			return { data: updatedDeclaration };
		}),
	updateName: userProtectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, name } = input;

			const isOwner = await isDeclarationOwner({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			if (!isOwner) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Must be owner of the declaration to update its name",
				});
			}

			const updatedDeclaration = await ctx.payload.update({
				collection: "declarations",
				id,
				data: {
					name,
				},
			});

			return { data: updatedDeclaration };
		}),
	updateStatus: userProtectedProcedure
		.input(
			z.object({
				id: z.number(),
				status: z.enum(statusValues),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, status } = input;

			const isOwner = await isDeclarationOwner({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			if (!isOwner) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Must be owner of the declaration to update its status",
				});
			}

			const updatedDeclaration = await ctx.payload.update({
				collection: "declarations",
				id,
				data: {
					status,
				},
			});

			return { data: updatedDeclaration };
		}),
});
