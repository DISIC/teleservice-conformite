import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const linkToDeclaration = async (
  ctx: any,
  declarationId: number,
  contactId: number
) => {
  try {
    await ctx.payload.update({
      collection: "declarations",
      id: declarationId,
      data: {
        contact: contactId,
      },
    });
  } catch(error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to link contact to declaration: ${(error as Error).message}`,
    });
  }

};

export const contactRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        email: z.string().optional(),
        url: z.string().optional(),
        declarationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, url, declarationId } = input;

      const contact = await ctx.payload.create({
        collection: "contacts",
        data: {
          email,
          url,
          declaration: declarationId,
        },
      });

      await linkToDeclaration(ctx, declarationId, contact.id);

      return { data: contact.id };
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        email: z.string().optional(),
        url: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, email, url } = input;

      const contact = await ctx.payload.update({
        collection: "contacts",
        id,
        data: {
          email,
          url,
        },
      });

      return { data: contact };
    }),
});