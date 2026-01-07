import { TRPCError } from "@trpc/server";
import z from "zod";
import { toolOptions, testEnvironmentOptions } from "~/payload/collections/Audit";
import type { appKindOptions } from "~/payload/collections/Declaration";
import type {
  ZDeclarationAudit,
  ZDeclarationGeneral,
  ZDeclarationMultiStepFormSchema,
} from "~/utils/form/declaration/schema";
import { auditFormSchema } from "~/utils/form/audit/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

const linkToDeclaration = async (
  ctx: any,
  declarationId: number,
  auditId: number
) => {
  try {
    await ctx.payload.update({
      collection: "declarations",
      id: declarationId,
      data: {
        audit: auditId,
      },
    });
  } catch(error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to link audit to declaration: ${(error as Error).message}`,
    });
  }

};

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

      await linkToDeclaration(ctx, declarationId, audit.id);

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