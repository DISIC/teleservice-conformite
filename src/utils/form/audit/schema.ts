import { formOptions } from "@tanstack/react-form";
import z from "zod";

import { rgaaVersionOptions } from "~/payload/collections/Audit";

export const auditDate = z.object({
  date: z.iso.date().min(1, { message: "La date est requise" }),
  realisedBy: z.string().min(1, {
    message: "L'organisation ayant réalisé l'audit est requise",
  }),
  rgaa_version: z.enum(rgaaVersionOptions.map((option) => option.value)),
  rate: z
    .number()
    .min(0, { message: "Le taux doit être entre 0 et 100" })
    .max(100, { message: "Le taux doit être entre 0 et 100" }),
});

export type ZAuditDate = z.infer<typeof auditDate>;

export const auditDateDefaultValues: ZAuditDate = {
  date: "",
  realisedBy: "",
  rgaa_version: "rgaa_4",
  rate: 0,
};

export const tools = z.object({
  technologies: z.array(z.string()).min(1, {
    message: "Au moins une technologie doit être sélectionnée",
  }),
  testEnvironments: z
    .array(z.string())
    .min(1, {
      message: "Au moins un environnement de test doit être sélectionné",
    }),
});

export type ZTools = z.infer<typeof tools>;

export const toolsDefaultValues: ZTools = {
  technologies: [""],
  testEnvironments: [""],
};

export const compliantElements = z.object({
  compliantElements: z.array(z.object({ name: z.string(), url: z.string() })).min(1, {
    message: "Au moins un élément conforme doit être renseigné",
  }),
});

export type ZCompliantElements = z.infer<typeof compliantElements>;

export const compliantElementsDefaultValues: ZCompliantElements = {
  compliantElements: [{ name: "", url: "" }],
};

export const nonCompliantElements = z.object({
  hasNonCompliantElements: z.boolean(),
  nonCompliantElements: z.string()
});

export type ZNonCompliantElements = z.infer<typeof nonCompliantElements>;

export const nonCompliantElementsDefaultValues: ZNonCompliantElements = {
  hasNonCompliantElements: false,
  nonCompliantElements: "",
};

export const disproportionnedCharge = z
  .object({
    hasDisproportionnedCharge: z.boolean(),
    disproportionnedCharge: z.array(
      z.object({
        name: z.string(),
        reason: z.string(),
        duration: z.string(),
        alternative: z.string(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    if (data.hasDisproportionnedCharge && data.disproportionnedCharge.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["disproportionnedCharge"],
        message: "Ajoutez au moins un élément de dérogation",
      });
    }
  });

export type ZDisproportionnedCharge = z.infer<typeof disproportionnedCharge>;

export const disproportionnedChargeDefaultValues: ZDisproportionnedCharge = {
  hasDisproportionnedCharge: false,
  disproportionnedCharge: [{ name: "", reason: "", duration: "", alternative: "" }],
};

export const optionalElements = z.object({
  optionalElements: z.string()
});

export type ZOptionalElements = z.infer<typeof optionalElements>;

export const optionalElementsDefaultValues: ZOptionalElements = {
  optionalElements: "",
};

export const files = z.object({
  grid: z.file().optional(),
  report: z.file().optional(),
});

export type ZFiles = z.infer<typeof files>;

export const filesDefaultValues: ZFiles = {
  grid: undefined,
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