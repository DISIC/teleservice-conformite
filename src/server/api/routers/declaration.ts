import { TRPCError } from "@trpc/server";
import z from "zod";
import type { Payload } from "payload";

import { declarationGeneral } from "~/utils/form/declaration/schema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { kindOptions } from "~/payload/collections/Entity";
import { getDeclarationById } from "~/utils/payload-helper";
import { isDeclarationOwner } from "../utils/payload-helper";

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
	create: userProtectedProcedure
		.input(declarationGeneral.extend({ general: declarationGeneral.shape.general.extend({ entityId: z.number().optional() }) }))
		.mutation(async ({ input, ctx }) => {
			const { organisation, kind, url, domain, name, entityId } = input.general;

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
					name,
					app_kind: kind,
					url,
					entity: newEntityId,
					created_by: Number(ctx.session.user.id),
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

      const updatedDeclaration = await ctx.payload.update({
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
					kind: kindOptions.find((field) => field.label === domain)?.value ?? "none",
				},
			});

			return { data: updatedDeclaration.id };
		}),
});
