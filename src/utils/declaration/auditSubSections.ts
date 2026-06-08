import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

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
	"audit-general",
	"audit-outils",
	"audit-contenus",
	"audit-non-conformites",
] as const;

export type AuditSubSectionSlug = (typeof AUDIT_SUB_SECTION_SLUGS)[number];

type AuditSubSectionMeta = {
	title: string;
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
	"audit-general": {
		title: "Réalisation de l'audit",
		isVisible: () => true,
		// Complete once the audit question is answered (the row exists); the date
		// itself is optional and does not gate completeness.
		isToComplete: (d) => isAuditMissing(d),
	},
	"audit-outils": {
		title: "Outils et environnements",
		isVisible: () => true,
		isToComplete: (d) =>
			isAuditMissing(d) || (d.audit?.usedTools?.length ?? 0) === 0,
	},
	"audit-contenus": {
		title: "Contenus vérifiés",
		isVisible: () => true,
		isToComplete: (d) => isAuditMissing(d) || !d.audit?.compliantElements,
	},
	"audit-non-conformites": {
		title: "Non conformités & dérogations",
		isVisible: () => true,
		isToComplete: (d) => isAuditMissing(d) || !d.audit?.nonCompliantElements,
	},
};
