import z from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { linkToDeclaration } from "../utils/payload-helper";

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

      await linkToDeclaration(ctx.payload, declarationId, contact.id, "contact");

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