import { TRPCError } from "@trpc/server";
import z from "zod";

import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { linkToDeclaration, isDeclarationOwner } from "../utils/payload-helper";
import { auditFormSchema } from "~/utils/form/audit/schema";

export const auditRouter = createTRPCRouter({
  create: userProtectedProcedure
    .input(
      auditFormSchema.omit({ section: true }).extend({ declarationId: z.number() }),
    )
    .mutation(async ({ input, ctx }) => {
      const { declarationId, technologies, ...rest } = input;

      const isOwner = await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      if (!isOwner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be owner of the declaration to create an audit",
        });
      }

      const audit = await ctx.payload.create({
        collection: "audits",
        draft: true,
        data: {
          ...rest,
          toolsUsed: technologies.map((tech) => ({ name: tech })),
          declaration: declarationId,
        },
      });

      await linkToDeclaration(ctx.payload, declarationId, audit.id, "audit");

      return { data: audit.id };
    }),
  delete: userProtectedProcedure
    .input(z.object({ id: z.number(), declarationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { id, declarationId } = input;

      const isOwner = await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      if (!isOwner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be owner of the declaration to delete an audit",
        });
      }

      await ctx.payload.delete({
        collection: "audits",
        id,
      });

      return { data: true };
    }),
  update: userProtectedProcedure
    .input(
      z.object({
        audit: auditFormSchema.omit({ section: true }).extend({ id: z.number(), declarationId: z.number() }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, declarationId, ...rest } = input.audit;

      const isOwner = await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      if (!isOwner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be owner of the declaration to update an audit",
        });
      }

      const updatedAudit = await ctx.payload.update({
        collection: "audits",
        id,
        data: {
          ...rest,
          toolsUsed: rest.technologies.map((tech) => ({ name: tech })),
        },
      });

      return { data: updatedAudit };
    }),
});