import { TRPCError } from "@trpc/server";
import z from "zod";

import { toolOptions, testEnvironmentOptions } from "~/payload/collections/Audit";
import { auditFormSchema } from "~/utils/form/audit/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { linkToDeclaration } from "../utils/payload-helper";

const auditSchema = z.object({
  date: z.iso.date(),
  realisedBy: z.string(),
  rgaa_version: z.enum(["rgaa_4", "rgaa_5"]),
  rate: z.number().min(0).max(100),
  compliantElements: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
  technologies: z.array(
    z.string()
  ).min(1),
  testEnvironments: z.array(
    z.enum(testEnvironmentOptions.map((test) => test.value) as [string, ...string[]])
  ).min(1),
  nonCompliantElements: z.string().optional(),
  disproportionnedCharge: z.array(z.object({
    name: z.string(),
    reason: z.string(),
    duration: z.string(),
    alternative: z.string(),
  })),
  optionalElements: z.string().optional(),
  grid: z.string().optional(),
  report: z.string().optional(),
});

export const auditRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      auditSchema.extend({ declarationId: z.number() }),
    )
    .mutation(async ({ input, ctx }) => {
      const { declarationId, technologies, testEnvironments, ...rest } = input;

      const audit = await ctx.payload.create({
        collection: "audits",
        data: {
          ...rest,
          toolsUsed: technologies,
          testEnvironments: testEnvironments,
          declaration: declarationId,
        },
      });

      await linkToDeclaration(ctx.payload, declarationId, audit.id, "audit");

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
        audit: auditSchema.extend({ declarationId: z.number(), id: z.number() }),
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