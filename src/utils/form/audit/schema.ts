import { formOptions } from "@tanstack/react-form";
import z from "zod";

import { rgaaVersionOptions, toolOptions, testEnvironmentOptions } from "~/payload/collections/Audit";

export const auditDate = z.object({
  date: z.iso.date().min(1, { message: "La date est requise" }),
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
  date: "",
  realisedBy: "",
  rgaa_version: "rgaa_4",
  rate: 0,
};

export const tools = z.object({
  technologies: z.array(
      z.string()
    )
    .min(1, {
      message: "Au moins une technologie doit être sélectionnée",
    }),
  testEnvironments: z
    .array(
      z.enum(
        testEnvironmentOptions.map((test) => test.value) as [string, ...string[]]
      )
    )
    .min(1, {
      message: "Au moins un environnement de test doit être sélectionné",
    }),
});

export type ZTools = z.infer<typeof tools>;

export const toolsDefaultValues: ZTools = {
  technologies: [],
  testEnvironments: [],
};

export const compliantElements = z.object({
  compliantElements: z.array(z.object({ name: z.string(), url: z.string() })),
});

export type ZCompliantElements = z.infer<typeof compliantElements>;

export const compliantElementsDefaultValues: ZCompliantElements = {
  compliantElements: [],
};

export const nonCompliantElements = z.discriminatedUnion(
  "hasNonCompliantElements",
  [
    z.object({
      hasNonCompliantElements: z.literal(false),
      nonCompliantElements: z.string().optional(),
    }),
    z.object({
      hasNonCompliantElements: z.literal(true),
      nonCompliantElements: z.string().trim().min(1, {
        message: "Ajoutez un élément non conforme",
      }),
    }),
  ]
);

export type ZNonCompliantElements = z.infer<typeof nonCompliantElements>;

export const nonCompliantElementsDefaultValues: ZNonCompliantElements = {
  hasNonCompliantElements: false,
  nonCompliantElements: "",
};

export const disproportionnedCharge = z.discriminatedUnion(
  "hasDisproportionnedCharge",
  [
    z.object({
      hasDisproportionnedCharge: z.literal(false),
      disproportionnedCharge: z.array(
      z.object({
        name: z.string(),
        reason: z.string(),
        duration: z.string(),
        alternative: z.string(),
      })
    ).optional(),
    }),
    z.object({
      hasDisproportionnedCharge: z.literal(true),
      disproportionnedCharge: z.string().trim().min(1, {
        message: "Ajoutez au moins une dérogation pour charge disproportionnée",
      }),
    }),
  ]
);

export type ZDisproportionnedCharge = z.infer<typeof disproportionnedCharge>;

export const disproportionnedChargeDefaultValues: ZDisproportionnedCharge = {
  hasDisproportionnedCharge: false,
  disproportionnedCharge: [],
};

export const optionalElements = z.discriminatedUnion(
  "hasOptionalElements",
  [
    z.object({
      hasOptionalElements: z.literal(false),
      optionalElements: z.string().optional(),
    }),
    z.object({
      hasOptionalElements: z.literal(true),
      optionalElements: z.string().trim().min(1, {
        message: "Ajoutez une exemption",
      }),
    }),
  ]
);

export type ZOptionalElements = z.infer<typeof optionalElements>;

export const optionalElementsDefaultValues: ZOptionalElements = {
  hasOptionalElements: false,
  optionalElements: "",
};

export const files = z.object({
  grid: z.union([z.url(), z.literal("")]),
  report: z.union([z.url(), z.literal("")]),
});

export type ZFiles = z.infer<typeof files>;

export const filesDefaultValues: ZFiles = {
  grid: "",
  report: "",
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
  ...files.shape,
}).and(nonCompliantElements).and(disproportionnedCharge).and(optionalElements);

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