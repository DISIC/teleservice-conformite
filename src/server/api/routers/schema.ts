import z from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { linkToDeclaration } from "../utils/payload-helper";

export const schemaRouter = createTRPCRouter({
  create: userProtectedProcedure
    .input(
      z.object({
        annualSchemaLink: z.string().optional(),
        declarationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { annualSchemaLink, declarationId } = input;

      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to create a declaration",
        });
      }

      const schema = await ctx.payload.create({
        collection: "action-plans",
        data: {
          annualSchemaLink,
          declaration: declarationId,
        },
      });

      await linkToDeclaration(ctx.payload, declarationId, schema.id, "actionPlan");

      return { data: schema.id };
    }),
});