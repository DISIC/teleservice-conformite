import z from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import { isDeclarationOwner, linkToDeclaration } from "../utils/payload-helper";
import { sourceOptions } from "~/payload/selectOptions";

export const schemaRouter = createTRPCRouter({
  create: userProtectedProcedure
    .input(
      z.object({
        currentYearSchemaUrl: z.string().optional(),
        previousYearsSchemaUrl: z.string().optional(),
        declarationId: z.number(),
        status: z.enum(sourceOptions.map(option => option.value)).optional().default("default"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { currentYearSchemaUrl, previousYearsSchemaUrl, declarationId, status } = input;
      
      await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });
      
      const schema = await ctx.payload.create({
        collection: "action-plans",
        data: {
          currentYearSchemaUrl: currentYearSchemaUrl ?? "",
          previousYearsSchemaUrl: previousYearsSchemaUrl ?? "",
          declaration: declarationId,
          status: status || "default",
        },
      });

      await linkToDeclaration(ctx.payload, declarationId, schema.id, "actionPlan");

      return { data: schema.id };
    }),
  update: userProtectedProcedure
    .input(
      z.object({
        currentYearSchemaUrl: z.string().optional(),
        previousYearsSchemaUrl: z.string().optional(),
        schemaId: z.number(),
        declarationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { currentYearSchemaUrl, previousYearsSchemaUrl, schemaId, declarationId  } = input;

      await isDeclarationOwner({
        payload: ctx.payload,
        declarationId,
        userId: Number(ctx.session?.user?.id) ?? null,
      });

      const updatedSchema = await ctx.payload.update({
        collection: "action-plans",
        id: schemaId,
        data: {
          currentYearSchemaUrl: currentYearSchemaUrl ?? "",
          previousYearsSchemaUrl: previousYearsSchemaUrl ?? "",
          status: "default",
        },
      });

      return { data: updatedSchema };
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

      const schemaRecord = await ctx.payload.findByID({
        collection: "action-plans",
        id,
      });

      if (!schemaRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Schema with id ${id} not found`,
        });
      }

      const updatedSchema = await ctx.payload.update({
        collection: "action-plans",
        id,
        data: {
          status,
        },
      });

      return { data: updatedSchema };
    }),
});