import z from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { linkToDeclaration, isDeclarationOwner } from "../utils/payload-helper";
import { sourceOptions } from "~/payload/selectOptions";

export const contactRouter = createTRPCRouter({
  create: userProtectedProcedure
    .input(
      z.object({
        email: z.string().optional().default(""),
        url: z.string().optional().default(""),
        declarationId: z.number(),
        status: z.enum(sourceOptions.map(option => option.value)).optional().default("default"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, url, declarationId, status } = input;

      await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      const contact = await ctx.payload.create({
        collection: "contacts",
        data: {
          email,
          url,
          declaration: declarationId,
          status,
        },
      });

      await linkToDeclaration(ctx.payload, declarationId, contact.id, "contact");

      return { data: contact.id };
    }),
  update: userProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        email: z.string().optional().default(""),
        url: z.string().optional().default(""),
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

      await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      const contact = await ctx.payload.update({
        collection: "contacts",
        id,
        data: {
          email: email ?? "",
          url: url ?? "",
          status: "default",
        },
      });

      return { data: contact };
    }),
  updateStatus: userProtectedProcedure
    .input(
      z.object({
        declarationId: z.number(),
        id: z.number(),
        status: z.enum(sourceOptions.map(option => option.value)),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { declarationId, id, status } = input;

      await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      const updatedContact = await ctx.payload.update({
        collection: "contacts",
        id,
        data: {
          status,
        },
      });

      return { data: updatedContact };
    }),
});