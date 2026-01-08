import { TRPCError } from "@trpc/server";
import z from "zod";

import { toolOptions, testEnvironmentOptions } from "~/payload/collections/Audit";
import { auditFormSchema } from "~/utils/form/audit/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { linkToDeclaration } from "../utils/payload-helper";

export const auditRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      auditFormSchema
        .omit({
          section: true,
          hasDisproportionnedCharge: true,
          hasOptionalElements: true,
          hasNonCompliantElements: true,
          grid: true,
          report: true,
        })
        .extend({ declarationId: z.number() })
    )
    .mutation(async ({ input, ctx }) => {
      const { declarationId, technologies, testEnvironments, ...rest } = input;

      // Normalize values to valid enum strings (guard against numeric indices)
      const normalizedTools: (typeof toolOptions)[number]["value"][] = technologies.map((v) => {
        const byValue = toolOptions.find((o) => o.value === v)?.value;
        if (byValue) return byValue;
        const idx = Number(v);
        if (!Number.isNaN(idx) && toolOptions[idx]) return toolOptions[idx].value;
        throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid tool value: ${v}` });
      }) as any;

      const normalizedEnvs: (typeof testEnvironmentOptions)[number]["value"][] = testEnvironments.map((v) => {
        const byValue = testEnvironmentOptions.find((o) => o.value === v)?.value;
        if (byValue) return byValue;
        const idx = Number(v);
        if (!Number.isNaN(idx) && testEnvironmentOptions[idx]) return testEnvironmentOptions[idx].value;
        throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid environment value: ${v}` });
      }) as any;

      const audit = await ctx.payload.create({
        collection: "audits",
        data: {
          ...rest,
          toolsUsed: normalizedTools as any,
          testEnvironments: normalizedEnvs as any,
          declaration: declarationId,
        },
      });

      await linkToDeclaration(ctx.payload, declarationId, audit.id);

      return { data: audit.id };
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await ctx.payload.delete({
        collection: "audits",
        id,
      });

      return { data: true };
    }),
  update: publicProcedure
    .input(
      z.object({
        audit: auditFormSchema
          .omit({
            section: true,
            hasDisproportionnedCharge: true,
            hasOptionalElements: true,
            hasNonCompliantElements: true,
          }).extend({ id: z.number() }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input.audit;

      const updatedAudit = await ctx.payload.update({
        collection: "audits",
        id,
        data: {
          ...rest,
        },
      });

      return { data: updatedAudit };
    }),
});