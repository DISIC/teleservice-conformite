import {
	contactForm,
	declarationToContactValues,
} from "~/forms/contact/contactSchema";
import {
	declarationGeneralRefined,
	declarationToGeneralValues,
} from "~/forms/declaration/declarationSchema";
import {
	declarationToSchemaValues,
	schemaForm,
} from "~/forms/schema/schemaSchema";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	defineSectionValidation,
	type SectionValidation,
} from "./sectionValidation";
import {
	AUDIT_SUB_SECTION_SLUGS,
	AUDIT_SUB_SECTIONS,
	type AuditSubSectionSlug,
} from "./auditSubSections";

export type { AuditSubSectionSlug };

export const SECTION_SLUGS = [
	"infos",
	...AUDIT_SUB_SECTION_SLUGS,
	"schema",
	"contact",
] as const;

export type SectionSlug = (typeof SECTION_SLUGS)[number];

/**
 * Virtual parents — currently only used to model Audit's SideMenu grouping.
 * Not a slug in its own right (Audit is reached via `audit-general`).
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
	validation: SectionValidation;
};

const auditSubSectionEntries = Object.fromEntries(
	AUDIT_SUB_SECTION_SLUGS.map((slug) => [
		slug,
		{
			title: AUDIT_SUB_SECTIONS[slug].title,
			parent: "audit" as const,
			isVisible: AUDIT_SUB_SECTIONS[slug].isVisible,
			isToComplete: AUDIT_SUB_SECTIONS[slug].isToComplete,
			isToVerify: () => false,
			validation: AUDIT_SUB_SECTIONS[slug].validation,
		} satisfies SectionMeta,
	]),
) as unknown as Record<AuditSubSectionSlug, SectionMeta>;

/**
 * Single source of truth for everything a SectionSlug carries: label, visibility,
 * badge predicates, and SideMenu parent grouping. Add or rename a Section by
 * editing this object — `SECTION_TITLES`, `getVisibleSections`,
 * `isSectionToComplete`, and `isSectionToVerify` all derive from here.
 *
 * Audit Sub-sections are pulled in from `auditSubSections.ts` (their metadata
 * is shared with the AuditSection component).
 */
export const SECTIONS: Record<SectionSlug, SectionMeta> = {
	infos: {
		title: "Informations générales",
		isVisible: () => true,
		isToComplete: () => false,
		isToVerify: () => false,
		validation: defineSectionValidation({
			schema: declarationGeneralRefined,
			fromDeclaration: declarationToGeneralValues,
		}),
	},
	...auditSubSectionEntries,
	schema: {
		title: "Schéma pluriannuel & plans d'action",
		isVisible: () => true,
		isToComplete: (d) => !d.schema,
		isToVerify: (d) => d.schema?.toVerify === true,
		validation: defineSectionValidation({
			schema: schemaForm,
			fromDeclaration: declarationToSchemaValues,
		}),
	},
	contact: {
		title: "Contact",
		isVisible: () => true,
		isToComplete: (d) => !d.contact,
		isToVerify: (d) => d.contact?.toVerify === true,
		validation: defineSectionValidation({
			schema: contactForm,
			fromDeclaration: declarationToContactValues,
		}),
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
	/** Field path (e.g. `general.name`) to focus once the Section mounts. */
	field?: string,
): string {
	const base = `/dashboard/declarations/${declarationId}?section=${slug}`;
	return field ? `${base}&field=${encodeURIComponent(field)}` : base;
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
