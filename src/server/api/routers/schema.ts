import z from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { linkToDeclaration } from "../utils/payload-helper";

export const schemaRouter = createTRPCRouter({
  create: userProtectedProcedure
    .input(
      z.object({
        currentYearSchemaUrl: z.union([z.url(), z.literal("")]),
        previousYearsSchemaUrl: z.union([z.url(), z.literal("")]),
        declarationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { currentYearSchemaUrl, previousYearsSchemaUrl, declarationId } = input;

      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to create a declaration",
        });
      }

      const schema = await ctx.payload.create({
        collection: "action-plans",
        data: {
          currentYearSchemaUrl,
          previousYearsSchemaUrl,
          declaration: declarationId,
        },
      });

      await linkToDeclaration(ctx.payload, declarationId, schema.id, "actionPlan");

      return { data: schema.id };
    }),
  update: userProtectedProcedure
    .input(
      z.object({
        currentYearSchemaUrl: z.union([z.url(), z.literal("")]),
        previousYearsSchemaUrl: z.union([z.url(), z.literal("")]),
        schemaId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { currentYearSchemaUrl, previousYearsSchemaUrl, schemaId  } = input;

      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to update a schema",
        });
      }

      const updatedSchema = await ctx.payload.update({
        collection: "action-plans",
        id: schemaId,
        data: {
          currentYearSchemaUrl,
          previousYearsSchemaUrl,
        },
      });

      return { data: updatedSchema };
    }),
});