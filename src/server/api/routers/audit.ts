import { TRPCError } from "@trpc/server";
import z from "zod";

import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { linkToDeclaration, isDeclarationOwner } from "../utils/payload-helper";
import { auditFormSchema } from "~/utils/form/audit/schema";
import { testEnvironmentOptions, sourceOptions } from "~/payload/selectOptions";

const optionalAuditFormSchema = auditFormSchema
  .partial()
  .omit({
    usedTools: true,
    testEnvironments: true,
  })
  .extend({
    declarationId: z.number(),
    status: z.enum(sourceOptions.map(option => option.value)).optional().default("default"),
    technologies: z.array(z.string()).optional().default([]),
    usedTools: z.array(z.string()).optional().default([]),
    testEnvironments: z.array(z.string()).optional().default([]),
  });

export const auditRouter = createTRPCRouter({
  create: userProtectedProcedure
    .input(
      optionalAuditFormSchema
    )
    .mutation(async ({ input, ctx }) => {
      const { declarationId, usedTools = [], testEnvironments = [], technologies = [], ...rest } = input;

      await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      const audit = await ctx.payload.create({
        collection: "audits",
        draft: true,
        data: {
          ...rest,
          testEnvironments: testEnvironments.map((tech) => ({ name: tech })),
          usedTools: usedTools.map((tech) => ({ name: tech })),
          technologies: technologies.map((tech) => ({ name: tech })),
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

      await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      await ctx.payload.delete({
        collection: "audits",
        id,
      });

      return { data: true };
    }),
  update: userProtectedProcedure
    .input(
      z.object({
        audit: auditFormSchema.omit({ section: true }).extend({ id: z.number(), declarationId: z.number(), technologies: z.array(z.string()).optional() }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, declarationId, technologies = [], ...rest } = input.audit;

      await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      const updatedAudit = await ctx.payload.update({
        collection: "audits",
        id,
        data: {
          ...rest,
          usedTools: rest.usedTools.map((tech) => ({ name: tech })),
          testEnvironments: rest.testEnvironments.map((tech) => ({ name: tech })),
          technologies: technologies.map((tech) => ({ name: tech })),
          status: "default",
        },
      });

      return { data: updatedAudit };
    }),
  updateStatus: userProtectedProcedure
    .input(
      z.object({
        declarationId: z.number(),
        id: z.number(),
        status: z.enum(sourceOptions.map(option => option.value)),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { declarationId, id, status } = input;

      await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      const audit = await ctx.payload.findByID({
        collection: "audits",
        id,
      });

      if (!audit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Audit with id ${id} not found`,
        });
      }

      const updatedAudit = await ctx.payload.update({
        collection: "audits",
        id,
        data: {
          status,
        },
      });

      return { data: updatedAudit  };
    }),
});