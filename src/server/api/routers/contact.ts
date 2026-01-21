import z from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure, userProtectedProcedure } from "../trpc";
import { linkToDeclaration, isDeclarationOwner } from "../utils/payload-helper";

export const contactRouter = createTRPCRouter({
  create: userProtectedProcedure
    .input(
      z.object({
        email: z.string().optional(),
        url: z.string().optional(),
        declarationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, url, declarationId } = input;

      const isOwner = await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      if (!isOwner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be owner of the declaration to create a contact",
        });
      }

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
  update: userProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        email: z.string().optional(),
        url: z.string().optional(),
        declarationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, email, url, declarationId } = input;

      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to create a declaration",
        });
      }

      const isOwner = await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      if (!isOwner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be owner of the declaration to update a contact",
        });
      }

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