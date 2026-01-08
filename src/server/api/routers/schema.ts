import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import { linkToDeclaration } from "../utils/payload-helper";

export const schemaRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        annualSchemaLink: z.string().optional(),
        declarationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { annualSchemaLink, declarationId } = input;

      const schema = await ctx.payload.create({
        collection: "action-plans",
        data: {
          annualSchemaLink,
          declaration: declarationId,
        },
      });

      await linkToDeclaration(ctx.payload, declarationId, schema.id);

      return { data: schema.id };
    }),
});