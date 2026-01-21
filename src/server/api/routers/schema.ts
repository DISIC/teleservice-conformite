import z from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { isDeclarationOwner, linkToDeclaration } from "../utils/payload-helper";

export const schemaRouter = createTRPCRouter({
  create: userProtectedProcedure
    .input(
      z.object({
        currentYearSchemaUrl: z.string().optional(),
        previousYearsSchemaUrl: z.string().optional(),
        declarationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { currentYearSchemaUrl, previousYearsSchemaUrl, declarationId } = input;

      const isOwner = await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      if (!isOwner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be owner of the declaration to create a schema",
        });
      }
      
      const schema = await ctx.payload.create({
        collection: "action-plans",
        data: {
          currentYearSchemaUrl: currentYearSchemaUrl ?? "",
          previousYearsSchemaUrl: previousYearsSchemaUrl ?? "",
          declaration: declarationId,
        },
      });

      await linkToDeclaration(ctx.payload, declarationId, schema.id, "actionPlan");

      return { data: schema.id };
    }),
  update: userProtectedProcedure
    .input(
      z.object({
        currentYearSchemaUrl: z.string().optional(),
        previousYearsSchemaUrl: z.string().optional(),
        schemaId: z.number(),
        declarationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { currentYearSchemaUrl, previousYearsSchemaUrl, schemaId, declarationId  } = input;

      const isOwner = await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      if (!isOwner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be owner of the declaration to update a schema",
        });
      }

      const updatedSchema = await ctx.payload.update({
        collection: "action-plans",
        id: schemaId,
        data: {
          currentYearSchemaUrl: currentYearSchemaUrl ?? "",
          previousYearsSchemaUrl: previousYearsSchemaUrl ?? "",
        },
      });

      return { data: updatedSchema };
    }),
});