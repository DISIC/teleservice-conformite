import { formOptions } from "@tanstack/react-form";
import z from "zod";

import { rgaaVersionOptions } from "~/payload/selectOptions";

/**
 * Four independent audit forms — one per Sub-section, each a self-contained
 * route (ADR-0002). No `section` discriminator, no shared multi-step options:
 * every schema validates only the fields its Sub-section owns, so the
 * create-time empty-placeholder bug is structurally impossible.
 */

// ── Réalisation de l'audit (slug `audit-general`) ───────────────────────────
// `isAuditRealised` is always required. When the audit was realised, the date
// fields (realisedBy / rgaa_version / rate) become required too; when it was
// not, they are irrelevant and left untouched.
export const auditGeneral = z
	.object({
		isAuditRealised: z.boolean().optional(),
		date: z.iso.date().optional().or(z.literal("")),
		realisedBy: z.string().optional(),
		rgaa_version: z.enum(rgaaVersionOptions.map((option) => option.value)),
		rate: z.number(),
	})
	.superRefine((data, ctx) => {
		if (data.isAuditRealised === undefined) {
			ctx.addIssue({
				code: "custom",
				message: "La question de la réalisation de l'audit est requise",
				path: ["isAuditRealised"],
			});
		}

		if (data.isAuditRealised === true) {
			if (!data.realisedBy || data.realisedBy.trim() === "") {
				ctx.addIssue({
					code: "custom",
					message: "L'organisation ayant réalisé l'audit est requise",
					path: ["realisedBy"],
				});
			}
			if (data.rate < 0 || data.rate > 100) {
				ctx.addIssue({
					code: "custom",
					message: "Le taux doit être entre 0 et 100",
					path: ["rate"],
				});
			}
		}
	});

export type ZAuditGeneral = z.infer<typeof auditGeneral>;

export const auditGeneralDefaultValues: ZAuditGeneral = {
	isAuditRealised: undefined,
	date: "",
	realisedBy: "",
	rgaa_version: "rgaa_4",
	rate: 0,
};

export const auditGeneralFormOptions = formOptions({
	defaultValues: auditGeneralDefaultValues,
	validators: {
		onSubmit: ({ formApi }) => formApi.parseValuesWithSchema(auditGeneral),
	},
});

// ── Outils et environnements (slug `audit-outils`) ──────────────────────────
export const auditTools = z.object({
	usedTools: z.array(z.string()).optional(),
	testEnvironments: z.array(z.string()).optional(),
});

export type ZAuditTools = z.infer<typeof auditTools>;

export const auditToolsDefaultValues: ZAuditTools = {
	usedTools: [],
	testEnvironments: [],
};

export const auditToolsFormOptions = formOptions({
	defaultValues: auditToolsDefaultValues,
	validators: {
		onSubmit: ({ formApi }) => formApi.parseValuesWithSchema(auditTools),
	},
});

// ── Contenus vérifiés (slug `audit-contenus`) ───────────────────────────────
export const auditContents = z.object({
	compliantElements: z
		.string()
		.min(1, { message: "Les éléments conformes sont requis" }),
});

export type ZAuditContents = z.infer<typeof auditContents>;

export const auditContentsDefaultValues: ZAuditContents = {
	compliantElements: "",
};

export const auditContentsFormOptions = formOptions({
	defaultValues: auditContentsDefaultValues,
	validators: {
		onSubmit: ({ formApi }) => formApi.parseValuesWithSchema(auditContents),
	},
});

// ── Non conformités & dérogations (slug `audit-non-conformites`) ────────────
export const auditNonConformities = z.object({
	nonCompliantElements: z.string().optional(),
	optionalElements: z.string().optional(),
	disproportionnedCharge: z.string().optional(),
});

export type ZAuditNonConformities = z.infer<typeof auditNonConformities>;

export const auditNonConformitiesDefaultValues: ZAuditNonConformities = {
	nonCompliantElements: "",
	optionalElements: "",
	disproportionnedCharge: "",
};

export const auditNonConformitiesFormOptions = formOptions({
	defaultValues: auditNonConformitiesDefaultValues,
	validators: {
		onSubmit: ({ formApi }) =>
			formApi.parseValuesWithSchema(auditNonConformities),
	},
});
