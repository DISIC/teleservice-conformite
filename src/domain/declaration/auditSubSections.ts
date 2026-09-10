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
import type { SectionValidation } from "./sectionValidation";

/**
 * Audit Sub-section registry. The four Sub-sections persist into the single
 * `audit` group on the Declaration row — the slice is a UI grouping, not a data split.
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
	validation: SectionValidation;
};

// `isRealised` has no default: `null` means the declarant has not answered yet.
const isAuditMissing = (d: PopulatedDeclaration) => d.audit?.isRealised == null;

// Only a realised audit has slices to complete: until the declarant answers
// "réalisé", these Sub-sections stay unflagged.
const realisedSubSectionToComplete =
	(hasData: (d: PopulatedDeclaration) => boolean) =>
	(d: PopulatedDeclaration) =>
		d.audit?.isRealised === true && !hasData(d);

export const AUDIT_SUB_SECTIONS: Record<
	AuditSubSectionSlug,
	AuditSubSectionMeta
> = {
	"audit-general": {
		title: "Réalisation de l'audit",
		// Complete once the audit question is answered; the date itself is optional
		// and does not gate completeness.
		isToComplete: (d) => isAuditMissing(d),
		validation: {
			schema: auditGeneral,
			fromDeclaration: (d) => auditToGeneralValues(d.audit),
		},
	},
	"audit-outils": {
		title: "Outils et environnements",
		isToComplete: realisedSubSectionToComplete(
			(d) =>
				(d.audit?.usedTools?.length ?? 0) > 0 &&
				(d.audit?.testEnvironments?.length ?? 0) > 0,
		),
		validation: {
			schema: auditTools,
			fromDeclaration: (d) => auditToToolsValues(d.audit),
			isApplicable: (d) => d.audit?.isRealised === true,
		},
	},
	"audit-contenus": {
		title: "Contenus vérifiés",
		isToComplete: realisedSubSectionToComplete(
			(d) => !!d.audit?.compliantElements,
		),
		validation: {
			schema: auditContents,
			fromDeclaration: (d) => auditToContentsValues(d.audit),
			isApplicable: (d) => d.audit?.isRealised === true,
		},
	},
	"audit-non-conformites": {
		title: "Non conformités & dérogations",
		isToComplete: () => false,
		validation: {
			schema: auditNonConformities,
			fromDeclaration: (d) => auditToNonConformitiesValues(d.audit),
			isApplicable: (d) => d.audit?.isRealised === true,
		},
	},
};
