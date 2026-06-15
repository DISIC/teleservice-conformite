import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	auditContents,
	auditGeneral,
	auditNonConformities,
	auditTools,
	auditToContentsValues,
	auditToGeneralValues,
	auditToNonConformitiesValues,
	auditToToolsValues,
} from "~/forms/audit/auditSchema";
import { defineSectionValidation } from "./sectionValidation";

/**
 * Audit Sub-section registry. Single source of truth for the four UI slices
 * that the SideMenu renders as nested entries under "Audit" and that the
 * `?section=audit-...` URL addresses individually.
 *
 * The four Sub-sections persist into the single `audit` group on the Declaration
 * row (ADR-0004) — the slice is a UI grouping, not a data split (CONTEXT.md).
 * Adding a Sub-section means editing this file and adding a render branch
 * in `components/declaration/sections/items/Audit.tsx`.
 */

export const AUDIT_SUB_SECTION_SLUGS = [
	"audit-general",
	"audit-outils",
	"audit-contenus",
	"audit-non-conformites",
] as const;

export type AuditSubSectionSlug = (typeof AUDIT_SUB_SECTION_SLUGS)[number];

type AuditSubSectionMeta = {
	title: string;
	/** "À compléter" — Sub-section's slice of the audit row is missing data. */
	isToComplete: (declaration: PopulatedDeclaration) => boolean;
	validation: ReturnType<typeof defineSectionValidation>;
};

// The audit group always exists on the row (ADR-0004); "missing" now means the
// realised question has not been answered yet — `isRealised` is null until the
// declarant picks an answer (the field has no default).
const isAuditMissing = (d: PopulatedDeclaration) => d.audit?.isRealised == null;

export const AUDIT_SUB_SECTIONS: Record<
	AuditSubSectionSlug,
	AuditSubSectionMeta
> = {
	"audit-general": {
		title: "Réalisation de l'audit",
		// Complete once the audit question is answered; the date itself is optional
		// and does not gate completeness.
		isToComplete: (d) => isAuditMissing(d),
		validation: defineSectionValidation({
			schema: auditGeneral,
			fromDeclaration: (d) => auditToGeneralValues(d.audit),
		}),
	},
	"audit-outils": {
		title: "Outils et environnements",
		isToComplete: (d) =>
			isAuditMissing(d) || (d.audit?.usedTools?.length ?? 0) === 0,
		validation: defineSectionValidation({
			schema: auditTools,
			fromDeclaration: (d) => auditToToolsValues(d.audit),
			isApplicable: (d) => d.audit?.isRealised === true,
		}),
	},
	"audit-contenus": {
		title: "Contenus vérifiés",
		isToComplete: (d) => isAuditMissing(d) || !d.audit?.compliantElements,
		validation: defineSectionValidation({
			schema: auditContents,
			fromDeclaration: (d) => auditToContentsValues(d.audit),
			isApplicable: (d) => d.audit?.isRealised === true,
		}),
	},
	"audit-non-conformites": {
		title: "Non conformités & dérogations",
		isToComplete: (d) => isAuditMissing(d) || !d.audit?.nonCompliantElements,
		validation: defineSectionValidation({
			schema: auditNonConformities,
			fromDeclaration: (d) => auditToNonConformitiesValues(d.audit),
			isApplicable: (d) => d.audit?.isRealised === true,
		}),
	},
};
