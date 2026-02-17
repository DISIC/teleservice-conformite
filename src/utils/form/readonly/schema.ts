import { formOptions } from "@tanstack/react-form";
import z from "zod";

import { rgaaVersionOptions, appKindOptions } from "~/payload/selectOptions";

export const declarationGeneral = z.object({
  general: z.object({
    organisation: z
      .string()
      .meta({ kind: "select" })
      .min(1, { message: "Le nom de l'organisation est requis" }),
    kind: z.enum(appKindOptions.map((option) => option.value)),
    name: z.string().min(1, { message: "Le nom de l'application est requis" }),
    url: z.url("Lien invalide (ex: https://www.example.fr)").optional().or(z.literal("")),
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
    url: undefined,
    domain: "",
  },
};

export const declarationAudit = z.object({
  audit: z.object({
    date: z.iso.date().optional().or(z.literal("")),
    report: z.url("Lien invalide (ex: https://www.example.fr)").optional().or(z.literal("")),
    realisedBy: z.string().min(1, {
      message: "L'organisation ayant réalisé l'audit est requise",
    }),
    rgaa_version: z.enum(rgaaVersionOptions.map((option) => option.value)),
    rate: z
      .number()
      .min(0, { message: "Le taux doit être entre 0 et 100" })
      .max(100, { message: "Le taux doit être entre 0 et 100" }),
    compliantElements: z.string().min(1, { message: "Les éléments conformes sont requis" }),
    technologies: z.array(z.string()).optional(),
    usedTools: z.array(z.string()).min(1, {
      message: "Au moins un outil doit être sélectionnée",
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
    date: undefined,
    report: undefined,
    realisedBy: "",
    rgaa_version: "rgaa_4",
    rate: 0,
    usedTools: [],
    technologies: [],
    testEnvironments: [],
    nonCompliantElements: "",
    optionalElements: "",
    disproportionnedCharge: "",
    compliantElements: "",
  },
};

export const declarationSchema = z.object({
  schema: z
    .object({
      hasDoneCurrentYearSchema: z.boolean(),
      currentYearSchemaUrl: z.url("Lien invalide (ex: https://www.example.fr)").optional().or(z.literal("")),
      hasDonePreviousYearsSchema: z.boolean(),
      previousYearsSchemaUrl: z.url("Lien invalide (ex: https://www.example.fr)").optional().or(z.literal("")),
    }),
});

export type ZSchema = z.infer<typeof declarationSchema>;

export const declarationSchemaDefaultValues: ZSchema = {
  schema: {
    hasDoneCurrentYearSchema: false,
    currentYearSchemaUrl: undefined,
    hasDonePreviousYearsSchema: false,
    previousYearsSchemaUrl: undefined,
  },
};

export const declarationContact = z.object({
  contact: z.object({
    contactOptions: z.array(z.enum(["email", "url"])).optional(),
    contactName: z.url("Lien invalide (ex: https://www.example.fr)").optional().or(z.literal("")),
    contactEmail: z.email("Email invalide").or(z.literal("")),
  }),
});

export type ZDeclarationContact = z.infer<typeof declarationContact>;

export const declarationContactDefaultValues: ZDeclarationContact = {
  contact: {
    contactOptions: [],
    contactName: undefined,
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
      console.log(value);
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

    },
  },
});