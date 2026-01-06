import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const linkToDeclaration = async (
  ctx: any,
  declarationId: number,
  actionPlanId: number
) => {
  try {
    await ctx.payload.update({
      collection: "declarations",
      id: declarationId,
      data: {
        actionPlan: actionPlanId,
      },
    });
  } catch(error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to link contact to declaration: ${(error as Error).message}`,
    });
  }

};

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

      await linkToDeclaration(ctx, declarationId, schema.id);

      return { data: schema.id };
    }),
});