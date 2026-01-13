import { TRPCError } from "@trpc/server";
import z from "zod";

import { testEnvironmentOptions } from "~/payload/collections/Audit";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { linkToDeclaration } from "../utils/payload-helper";

const auditSchema = z.object({
  date: z.iso.date(),
  realisedBy: z.string(),
  rgaa_version: z.enum(["rgaa_4", "rgaa_5"]),
  rate: z.number().min(0).max(100),
  compliantElements: z.string().optional(),
  technologies: z.array(
    z.string()
  ).min(1),
  testEnvironments: z.array(
    z.string()
  ).min(1),
  nonCompliantElements: z.string().optional(),
  disproportionnedCharge: z.string().optional(),
  optionalElements: z.string().optional(),
  grid: z.string().optional(),
  report: z.string().optional(),
});

export const auditRouter = createTRPCRouter({
  create: userProtectedProcedure
    .input(
      auditSchema.extend({ declarationId: z.number() }),
    )
    .mutation(async ({ input, ctx }) => {
      const { declarationId, technologies, testEnvironments, ...rest } = input;

      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to create a declaration",
        });
      }

      const audit = await ctx.payload.create({
        collection: "audits",
        data: {
          ...rest,
          toolsUsed: technologies.map((tech) => ({ name: tech })),
          testEnvironments: testEnvironments.reduce((acc: (typeof testEnvironmentOptions[number]["value"])[], env) => {
            const value = testEnvironmentOptions.find((test) => test.value === env)?.value;

            if (value) {
              acc.push(value);
            }

            return acc;
          }, []),
          declaration: declarationId,
        },
      });

      await linkToDeclaration(ctx.payload, declarationId, audit.id, "audit");

      return { data: audit.id };
    }),
  delete: userProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to create a declaration",
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
        audit: auditSchema.extend({ id: z.number() }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input.audit;

      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User must be logged in to create a declaration",
        });
      }

      const updatedAudit = await ctx.payload.update({
        collection: "audits",
        id,
        data: {
          ...rest,
          testEnvironments: rest.testEnvironments.reduce((acc: (typeof testEnvironmentOptions[number]["value"])[], env) => {
            const value = testEnvironmentOptions.find((test) => test.value === env)?.value;

            if (value) {
              acc.push(value);
            }

            return acc;
          }, []),
          toolsUsed: rest.technologies.map((tech) => ({ name: tech })),
        },
      });

      return { data: updatedAudit };
    }),
});