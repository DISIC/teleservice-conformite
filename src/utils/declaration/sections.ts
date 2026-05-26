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

/**
 * Virtual parents — currently only used to model Audit's SideMenu grouping.
 * Not a slug in its own right (Audit is reached via `audit-realisation`).
 */
export type SectionParentKey = "audit";

export const DEFAULT_SECTION: SectionSlug = "infos";

type SectionMeta = {
	title: string;
	parent?: SectionParentKey;
	/** Whether the Section is currently navigable from SideMenu/footer. */
	isVisible: (declaration: PopulatedDeclaration) => boolean;
	/** "À compléter" — required data is missing. */
	isToComplete: (declaration: PopulatedDeclaration) => boolean;
	/** "À vérifier" — content is AI-generated and needs human review. */
	isToVerify: (declaration: PopulatedDeclaration) => boolean;
};

const isAuditMissing = (d: PopulatedDeclaration) => !d.audit;
const isAuditExpanded = (d: PopulatedDeclaration) =>
	d.audit?.isRealised === true;

/**
 * Single source of truth for everything a SectionSlug carries: label, visibility,
 * badge predicates, and SideMenu parent grouping. Add or rename a Section by
 * editing this object — `SECTION_TITLES`, `getVisibleSections`,
 * `isSectionToComplete`, and `isSectionToVerify` all derive from here.
 */
export const SECTIONS: Record<SectionSlug, SectionMeta> = {
	infos: {
		title: "Informations générales",
		isVisible: () => true,
		isToComplete: () => false,
		isToVerify: () => false,
	},
	"audit-realisation": {
		title: "Réalisation de l'audit",
		parent: "audit",
		// Always visible — it's the anchor sub-section, reachable even when
		// no audit exists yet (the rest unlock once isRealised === true).
		isVisible: () => true,
		isToComplete: (d) => isAuditMissing(d) || d.audit?.date == null,
		isToVerify: () => false,
	},
	"audit-outils": {
		title: "Outils et environnements",
		parent: "audit",
		isVisible: isAuditExpanded,
		isToComplete: (d) =>
			isAuditMissing(d) || (d.audit?.usedTools?.length ?? 0) === 0,
		isToVerify: () => false,
	},
	"audit-contenus": {
		title: "Contenus vérifiés",
		parent: "audit",
		isVisible: isAuditExpanded,
		isToComplete: (d) => isAuditMissing(d) || !d.audit?.compliantElements,
		isToVerify: () => false,
	},
	"audit-non-conformites": {
		title: "Non conformités & dérogations",
		parent: "audit",
		isVisible: isAuditExpanded,
		isToComplete: (d) => isAuditMissing(d) || !d.audit?.nonCompliantElements,
		isToVerify: () => false,
	},
	schema: {
		title: "Schéma pluriannuel & plans d'action",
		isVisible: () => true,
		isToComplete: (d) => !d.schema,
		isToVerify: (d) => d.schema?.toVerify === true,
	},
	contact: {
		title: "Contact",
		isVisible: () => true,
		isToComplete: (d) => !d.contact,
		isToVerify: (d) => d.contact?.toVerify === true,
	},
};

export const SECTION_TITLES = Object.fromEntries(
	SECTION_SLUGS.map((slug) => [slug, SECTIONS[slug].title]),
) as Record<SectionSlug, string>;

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

export function getVisibleSections(
	declaration: PopulatedDeclaration,
): SectionSlug[] {
	return SECTION_SLUGS.filter((slug) => SECTIONS[slug].isVisible(declaration));
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
	return `/dashboard/declarations/${declarationId}?section=${slug}`;
}

export function isSectionToComplete(
	declaration: PopulatedDeclaration,
	slug: SectionSlug,
): boolean {
	return SECTIONS[slug].isToComplete(declaration);
}

export function isSectionToVerify(
	declaration: PopulatedDeclaration,
	slug: SectionSlug,
): boolean {
	return SECTIONS[slug].isToVerify(declaration);
}

export function isAuditToVerify(declaration: PopulatedDeclaration): boolean {
	return declaration.audit?.toVerify === true;
}
