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
			fieldLabels: {
				isAuditRealised:
					"Avez-vous réalisé un audit d’accessibilité de votre service numérique ?",
				date: "Date de réalisation de l’audit",
				realisedBy: "Entité ou personne ayant réalisé l’audit",
				rate: "Taux de conformité global",
				hasBlockingElements: "L’audit a-t-il remonté des éléments bloquants ?",
			},
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
			fieldLabels: {
				usedTools: "Liste des outils utilisés pour évaluer l’accessibilité",
				testEnvironments:
					"Liste des environnements utilisés pour évaluer l’accessibilité",
			},
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
			fieldLabels: {
				compliantElements:
					"Éléments ayant fait l’objet de la vérification de conformité",
			},
			isApplicable: (d) => d.audit?.isRealised === true,
		},
	},
	"audit-non-conformites": {
		title: "Non conformités & dérogations",
		// Only the blocking elements are mandatory here, and only once the audit reported some.
		isToComplete: (d) =>
			d.audit?.hasBlockingElements === true && !d.audit?.blockingElements,
		validation: {
			schema: auditNonConformities,
			fromDeclaration: (d) => auditToNonConformitiesValues(d.audit),
			fieldLabels: { blockingElements: "Éléments bloquants" },
			isApplicable: (d) => d.audit?.isRealised === true,
		},
	},
};
