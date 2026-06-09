import z from "zod";

import { submitFormOptions } from "~/forms/formOptions";
import {
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

/**
 * Four independent audit forms — one per Sub-section, each a self-contained
 * route (ADR-0002). No `section` discriminator, no shared multi-step options:
 * every schema validates only the fields its Sub-section owns, so the
 * create-time empty-placeholder bug is structurally impossible.
 *
 * Each `auditTo*Values` mapper sits next to its schema/defaults so the publish
 * gate validates the exact shape its form feeds — keep them in sync.
 */

type Audit = PopulatedDeclaration["audit"];

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

export const auditGeneralFormOptions = submitFormOptions(
	auditGeneralDefaultValues,
	auditGeneral,
);

export function auditToGeneralValues(audit: Audit): ZAuditGeneral {
	return {
		isAuditRealised: audit?.isRealised ?? undefined,
		date: audit?.date ? new Date(audit.date).toLocaleDateString("en-CA") : "",
		realisedBy: audit?.realisedBy ?? "",
		rgaa_version:
			rgaaVersionOptions.find((opt) => opt.value === audit?.rgaa_version)
				?.value ?? "rgaa_4",
		rate: audit?.rate ?? 0,
	};
}

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

export const auditToolsFormOptions = submitFormOptions(
	auditToolsDefaultValues,
	auditTools,
);

export function auditToToolsValues(audit: Audit): ZAuditTools {
	return {
		usedTools: (audit?.usedTools ?? []).map(
			(tool) =>
				toolOptions.find((opt) => opt.value === tool.name)?.value ?? tool.name,
		),
		testEnvironments: (audit?.testEnvironments ?? []).map(
			(env) =>
				testEnvironmentOptions.find((opt) => opt.value === env.name)?.value ??
				env.name,
		),
	};
}

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

export const auditContentsFormOptions = submitFormOptions(
	auditContentsDefaultValues,
	auditContents,
);

export function auditToContentsValues(audit: Audit): ZAuditContents {
	return {
		compliantElements: audit?.compliantElements ?? "",
	};
}

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

export const auditNonConformitiesFormOptions = submitFormOptions(
	auditNonConformitiesDefaultValues,
	auditNonConformities,
);

export function auditToNonConformitiesValues(
	audit: Audit,
): ZAuditNonConformities {
	return {
		nonCompliantElements: audit?.nonCompliantElements ?? "",
		optionalElements: audit?.optionalElements ?? "",
		disproportionnedCharge: audit?.disproportionnedCharge ?? "",
	};
}
