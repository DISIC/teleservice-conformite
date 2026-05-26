import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export const SECTION_SLUGS = [
	"infos",
	"audit-realisation",
	"audit-outils",
	"audit-contenus",
	"audit-non-conformites",
	"schema",
	"contact",
] as const;

export type SectionSlug = (typeof SECTION_SLUGS)[number];
export type AuditSubSectionSlug = Extract<SectionSlug, `audit-${string}`>;

export const DEFAULT_SECTION: SectionSlug = "infos";

export const SECTION_TITLES: Record<SectionSlug, string> = {
	infos: "Informations générales",
	"audit-realisation": "Réalisation de l'audit",
	"audit-outils": "Outils et environnements",
	"audit-contenus": "Contenus vérifiés",
	"audit-non-conformites": "Non conformités & dérogations",
	schema: "Schéma pluriannuel & plans d'action",
	contact: "Contact",
};

export function isAuditSubSection(
	slug: SectionSlug,
): slug is AuditSubSectionSlug {
	return slug.startsWith("audit-");
}

export function isSectionSlug(value: unknown): value is SectionSlug {
	return (
		typeof value === "string" &&
		(SECTION_SLUGS as readonly string[]).includes(value)
	);
}

export function parseSectionFromQuery(value: unknown): SectionSlug {
	return isSectionSlug(value) ? value : DEFAULT_SECTION;
}

/**
 * Sections navigable for a given declaration, in walk order.
 * Audit Sub-sections beyond "Réalisation" only appear when isRealised === true.
 */
export function getVisibleSections(
	declaration: PopulatedDeclaration,
): SectionSlug[] {
	const auditExpanded = declaration.audit?.isRealised === true;
	return SECTION_SLUGS.filter(
		(slug) =>
			!isAuditSubSection(slug) || slug === "audit-realisation" || auditExpanded,
	);
}

export function getPrevNextSections(
	current: SectionSlug,
	visible: SectionSlug[],
): { prev: SectionSlug | null; next: SectionSlug | null } {
	const i = visible.indexOf(current);
	if (i === -1) return { prev: null, next: null };
	return {
		prev: i > 0 ? (visible[i - 1] ?? null) : null,
		next: i < visible.length - 1 ? (visible[i + 1] ?? null) : null,
	};
}

export function sectionHref(
	declarationId: PopulatedDeclaration["id"],
	slug: SectionSlug,
): string {
	return `/dashboard/declaration/${declarationId}?section=${slug}`;
}

/** "À compléter" — section/sub-section is empty and needs to be filled. */
export function isSectionToComplete(
	declaration: PopulatedDeclaration,
	slug: SectionSlug,
): boolean {
	switch (slug) {
		case "infos":
			return false;
		case "audit-realisation":
			return !declaration.audit || declaration.audit.date == null;
		case "audit-outils":
			return (
				!declaration.audit || (declaration.audit.usedTools?.length ?? 0) === 0
			);
		case "audit-contenus":
			return !declaration.audit || !declaration.audit.compliantElements;
		case "audit-non-conformites":
			return !declaration.audit || !declaration.audit.nonCompliantElements;
		case "schema":
			return !declaration.schema;
		case "contact":
			return !declaration.contact;
	}
}

/**
 * "À vérifier" — Section has AI-generated content needing human review.
 * Tracked at Section level only; not fanned out to Sub-sections.
 */
export function isSectionToVerify(
	declaration: PopulatedDeclaration,
	slug: SectionSlug,
): boolean {
	if (slug === "schema") return declaration.schema?.toVerify === true;
	if (slug === "contact") return declaration.contact?.toVerify === true;
	return false;
}

export function isAuditToVerify(declaration: PopulatedDeclaration): boolean {
	return declaration.audit?.toVerify === true;
}
