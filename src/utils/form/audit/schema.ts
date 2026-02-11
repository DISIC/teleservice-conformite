import { formOptions } from "@tanstack/react-form";
import z from "zod";

import { rgaaVersionOptions, testEnvironmentOptions } from "~/payload/selectOptions";

export const auditDate = z.object({
  date: z.iso.date().optional().or(z.literal("")),
  realisedBy: z.string().min(1, {
    message: "L'organisation ayant réalisé l'audit est requise",
  }),
  rgaa_version: z.enum(rgaaVersionOptions.map((option) => option.value)),
  rate: z.number()
    .min(0, { message: "Le taux doit être entre 0 et 100" })
    .max(100, { message: "Le taux doit être entre 0 et 100" }),
});

export type ZAuditDate = z.infer<typeof auditDate>;

export const auditDateDefaultValues: ZAuditDate = {
  date: undefined,
  realisedBy: "",
  rgaa_version: "rgaa_4",
  rate: 0,
};

export const tools = z.object({
  usedTools: z.array(
      z.string()
    ).optional(),
  testEnvironments: z
    .array(
      z.string()
    )
    .min(1, {
      message: "Au moins un environnement de test doit être sélectionné",
    }),
});

export type ZTools = z.infer<typeof tools>;

export const toolsDefaultValues: ZTools = {
  usedTools: [],
  testEnvironments: [],
};

export const compliantElements = z.object({
  compliantElements: z.string().min(1, { message: "Les éléments conformes sont requis" }),
});

export type ZCompliantElements = z.infer<typeof compliantElements>;

export const compliantElementsDefaultValues: ZCompliantElements = {
  compliantElements: "",
};

export const nonCompliantElements = z.object({
  nonCompliantElements: z.string().optional(),
});

export type ZNonCompliantElements = z.infer<typeof nonCompliantElements>;

export const nonCompliantElementsDefaultValues: ZNonCompliantElements = {
  nonCompliantElements: "",
};

export const disproportionnedCharge = z.object({
  disproportionnedCharge: z.string().optional(),
});

export type ZDisproportionnedCharge = z.infer<typeof disproportionnedCharge>;

export const disproportionnedChargeDefaultValues: ZDisproportionnedCharge = {
  disproportionnedCharge: "",
};

export const optionalElements = z.object({
  optionalElements: z.string().optional(),
});

export type ZOptionalElements = z.infer<typeof optionalElements>;

export const optionalElementsDefaultValues: ZOptionalElements = {
  optionalElements: "",
};

export const files = z.object({
  report: z.url("Lien invalide (ex: https://www.example.fr)").optional().or(z.literal("")),
});

export type ZFiles = z.infer<typeof files>;

export const filesDefaultValues: ZFiles = {
  report: undefined,
};

const sections = [
  "auditDate",
  "tools",
  "compliantElements",
  "nonCompliantElements",
  "disproportionnedCharge",
  "optionalElements",
  "files",
] as const;

export type AuditFormSection = typeof sections[number];

export const auditFormSchema = z.object({
  section: z.enum(sections),
  ...auditDate.shape,
  ...tools.shape,
  ...compliantElements.shape,
  ...nonCompliantElements.shape,
  ...disproportionnedCharge.shape,
  ...optionalElements.shape,
  ...files.shape,
});

export type ZAuditFormSchema = z.infer<
  typeof auditFormSchema
>;

const defaultValues: ZAuditFormSchema = {
  section: "auditDate",
  ...auditDateDefaultValues,
  ...toolsDefaultValues,
  ...compliantElementsDefaultValues,
  ...nonCompliantElementsDefaultValues,
  ...disproportionnedChargeDefaultValues,
  ...optionalElementsDefaultValues,
  ...filesDefaultValues,
};

export const auditMultiStepFormOptions = formOptions({
	defaultValues,
	validators: {
    onSubmit: ({ value, formApi }) => {
      if (value.section === "auditDate") {
        return formApi.parseValuesWithSchema(
          auditDate as typeof auditFormSchema,
        );
      }

      if (value.section === "tools") {
        return formApi.parseValuesWithSchema(
          tools as typeof auditFormSchema,
        );
      }

      if (value.section === "compliantElements") {
        return formApi.parseValuesWithSchema(
          compliantElements as typeof auditFormSchema,
        );
      }

      if (value.section === "nonCompliantElements") {
        return formApi.parseValuesWithSchema(
          nonCompliantElements as typeof auditFormSchema,
        );
      }

      if (value.section === "disproportionnedCharge") {
        return formApi.parseValuesWithSchema(
          disproportionnedCharge as typeof auditFormSchema,
        );
      }

      if (value.section === "optionalElements") {
        return formApi.parseValuesWithSchema(
          optionalElements as typeof auditFormSchema,
        );
      }

      if (value.section === "files") {
        return formApi.parseValuesWithSchema(
          files as typeof auditFormSchema,
        );
      }
    },
  },
});