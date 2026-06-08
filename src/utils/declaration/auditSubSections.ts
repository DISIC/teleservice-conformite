import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import type { AuditFormSection } from "~/forms/audit/auditSchema";

/**
 * Audit Sub-section registry. Single source of truth for the four UI slices
 * that the SideMenu renders as nested entries under "Audit" and that the
 * `?section=audit-...` URL addresses individually.
 *
 * The four Sub-sections persist into the single `audits` row for the
 * Declaration — the slice is a UI grouping, not a data split (CONTEXT.md).
 * Adding a Sub-section means editing this file and adding a render branch
 * in `components/declaration/sections/items/Audit.tsx`.
 */

export const AUDIT_SUB_SECTION_SLUGS = [
	"audit-realisation",
	"audit-outils",
	"audit-contenus",
	"audit-non-conformites",
] as const;

export type AuditSubSectionSlug = (typeof AUDIT_SUB_SECTION_SLUGS)[number];

type AuditSubSectionMeta = {
	title: string;
	/** Audit form's `section` field — gates which zod sub-schema runs at submit. */
	validator: AuditFormSection;
	/** Whether the Sub-section is navigable. All sub-sections stay visible;
	 *  the ones that depend on the audit being realised show a notice instead
	 *  of their form until then. */
	isVisible: (declaration: PopulatedDeclaration) => boolean;
	/** "À compléter" — Sub-section's slice of the audit row is missing data. */
	isToComplete: (declaration: PopulatedDeclaration) => boolean;
};

const isAuditMissing = (d: PopulatedDeclaration) => !d.audit;

export const AUDIT_SUB_SECTIONS: Record<
	AuditSubSectionSlug,
	AuditSubSectionMeta
> = {
	"audit-realisation": {
		title: "Réalisation de l'audit",
		validator: "isAuditRealised",
		isVisible: () => true,
		isToComplete: (d) => isAuditMissing(d) || d.audit?.date == null,
	},
	"audit-outils": {
		title: "Outils et environnements",
		validator: "tools",
		isVisible: () => true,
		isToComplete: (d) =>
			isAuditMissing(d) || (d.audit?.usedTools?.length ?? 0) === 0,
	},
	"audit-contenus": {
		title: "Contenus vérifiés",
		validator: "compliantElements",
		isVisible: () => true,
		isToComplete: (d) => isAuditMissing(d) || !d.audit?.compliantElements,
	},
	"audit-non-conformites": {
		title: "Non conformités & dérogations",
		validator: "nonCompliantElements",
		isVisible: () => true,
		isToComplete: (d) => isAuditMissing(d) || !d.audit?.nonCompliantElements,
	},
};
