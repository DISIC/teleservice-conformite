import { formOptions } from "@tanstack/react-form";
import z from "zod";
import { rgaaVersionOptions } from "~/payload/collections/Audit";
import { appKindOptions } from "~/payload/collections/Declaration";
import type { disproportionnedCharge } from "../audit/schema";

export const declarationGeneral = z.object({
  general: z.object({
    organisation: z
      .string()
      .meta({ kind: "select" })
      .min(1, { message: "Le nom de l'organisation est requis" }),
    kind: z.enum(appKindOptions.map((option) => option.value)),
    name: z.string().min(1, { message: "Le nom de l'application est requis" }),
    url: z.union([z.url({ error: "L'URL n'est pas valide" }), z.literal("")]),
    domain: z
      .string()
      .meta({ kind: "select" })
      .min(1, { message: "Le domaine est requis" }),
  }),
});

export type ZDeclarationGeneral = z.infer<typeof declarationGeneral>;

export const declarationGeneralDefaultValues: ZDeclarationGeneral = {
  general: {
    organisation: "",
    kind: "website",
    name: "",
    url: "",
    domain: "",
  },
};

export const declarationAudit = z.object({
  audit: z.object({
    date: z.iso.date().min(1, { message: "La date est requise" }),
    report: z.union([z.url(), z.literal("")]),
    realisedBy: z.string().min(1, {
      message: "L'organisation ayant réalisé l'audit est requise",
    }),
    rgaa_version: z.enum(rgaaVersionOptions.map((option) => option.value)),
    rate: z
      .number()
      .min(0, { message: "Le taux doit être entre 0 et 100" })
      .max(100, { message: "Le taux doit être entre 0 et 100" }),
    compliantElements: z.string().optional(),
    technologies: z.array(z.string()).min(1, {
      message: "Au moins une technologie doit être sélectionnée",
    }),
    testEnvironments: z
      .array(z.string())
      .min(1, {
        message: "Au moins un environnement de test doit être sélectionné",
      }),
    disproportionnedCharge: z.string().optional(),
    nonCompliantElements: z.string().optional(),
    optionalElements: z.string().optional(),
  }),
});

export type ZDeclarationAudit = z.infer<typeof declarationAudit>;

export const declarationAuditDefaultValues: ZDeclarationAudit = {
  audit: {
    date: "",
    report: "",
    realisedBy: "",
    rgaa_version: "rgaa_4",
    rate: 0,
    technologies: [],
    testEnvironments: [],
    nonCompliantElements: "",
    optionalElements: "",
    disproportionnedCharge: "",
    compliantElements: "",
  },
};

export const declarationSchema = z.object({
  schema: z.object({
    annualSchemaDone: z.boolean(),
    currentYearSchemaDone: z.boolean(),
    currentSchemaUrl: z.url().optional(),
    currentSchemaFile: z.file().optional(),
  }),
});

export type ZSchema = z.infer<typeof declarationSchema>;

export const declarationSchemaDefaultValues: ZSchema = {
  schema: {
    annualSchemaDone: false,
    currentYearSchemaDone: false,
    currentSchemaUrl: undefined,
    currentSchemaFile: undefined,
  },
};

export const declarationContact = z.object({
  contact: z.object({
    contactOptions: z.array(z.enum(["email", "url"])),
    contactName: z.string(),
    contactEmail: z.string(),
  }),
});

export type ZDeclarationContact = z.infer<typeof declarationContact>;

export const declarationContactDefaultValues: ZDeclarationContact = {
  contact: {
    contactOptions: [],
    contactName: "",
    contactEmail: "",
  },
};

export const declarationMultiStepFormSchema = z.object({
  section: z.enum(["general", "audit", "schema", "contact"]),
  ...declarationGeneral.shape,
  ...declarationAudit.shape,
  ...declarationSchema.shape,
  ...declarationContact.shape,
});

export type ZDeclarationMultiStepFormSchema = z.infer<
  typeof declarationMultiStepFormSchema
>;

const defaultValues: ZDeclarationMultiStepFormSchema = {
  section: "general",
  ...declarationGeneralDefaultValues,
  ...declarationAuditDefaultValues,
  ...declarationSchemaDefaultValues,
  ...declarationContactDefaultValues,
};

export const readOnlyFormOptions = formOptions({
  defaultValues,
  validators: {
    onSubmit: ({ value, formApi }) => {
      if (value.section === "general") {
        return formApi.parseValuesWithSchema(
          declarationGeneral as typeof declarationMultiStepFormSchema,
        );
      }

      if (value.section === "audit") {
        return formApi.parseValuesWithSchema(
          declarationAudit as typeof declarationMultiStepFormSchema,
        );
      }

      if (value.section === "schema") {
        return formApi.parseValuesWithSchema(
          declarationSchema as typeof declarationMultiStepFormSchema,
        );
      }

      if (value.section === "contact") {
                return formApi.parseValuesWithSchema(
          declarationContact as typeof declarationMultiStepFormSchema,
        );
      }
    },
  },
});