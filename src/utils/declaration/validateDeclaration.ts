import type { ZodType } from "zod";
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
import { getVisibleSections, type SectionSlug } from "./sections";

/** A single field-level completeness error, carrying its Section for routing. */
export type DeclarationError = {
	section: SectionSlug;
	/** Dot-joined Zod path within the section's form values (e.g. `general.name`). */
	field: string;
	message: string;
};

/**
 * Runs `schema` against `values` and flattens any issues into ordered
 * `DeclarationError`s, preserving the schema's field order.
 */
function runSchema(
	section: SectionSlug,
	schema: ZodType,
	values: unknown,
): DeclarationError[] {
	const result = schema.safeParse(values);
	if (result.success) return [];
	return result.error.issues.map((issue) => ({
		section,
		field: issue.path.join("."),
		message: issue.message,
	}));
}

/** The three non-Réalisation audit Sub-sections are only collected once the
 *  audit is declared as realised (see CONTEXT.md Invariants). */
function isAuditRealised(declaration: PopulatedDeclaration): boolean {
	return declaration.audit?.isRealised === true;
}

function validateSection(
	declaration: PopulatedDeclaration,
	slug: SectionSlug,
): DeclarationError[] {
	switch (slug) {
		case "infos":
			return runSchema(
				slug,
				declarationGeneralRefined,
				declarationToGeneralValues(declaration),
			);
		case "schema":
			return runSchema(
				slug,
				schemaForm,
				declarationToSchemaValues(declaration),
			);
		case "contact":
			return runSchema(
				slug,
				contactForm,
				declarationToContactValues(declaration),
			);
		case "audit-general":
			return runSchema(
				slug,
				auditGeneral,
				auditToGeneralValues(declaration.audit),
			);
		case "audit-outils":
			return isAuditRealised(declaration)
				? runSchema(slug, auditTools, auditToToolsValues(declaration.audit))
				: [];
		case "audit-contenus":
			return isAuditRealised(declaration)
				? runSchema(
						slug,
						auditContents,
						auditToContentsValues(declaration.audit),
					)
				: [];
		case "audit-non-conformites":
			return isAuditRealised(declaration)
				? runSchema(
						slug,
						auditNonConformities,
						auditToNonConformitiesValues(declaration.audit),
					)
				: [];
	}
}

/**
 * Validates the WHOLE declaration against every visible Section's Zod schema,
 * using the persisted `declaration` (not live form instances — only one Section
 * is mounted at a time, ADR-0001). Returns a flat, ordered list of field-level
 * errors in visible-Section order, then schema field order — empty when the
 * declaration is complete enough to publish. Powers the "Prévisualiser et
 * publier" gate and its live error summary (ADR-0003).
 */
export function validateDeclaration(
	declaration: PopulatedDeclaration,
): DeclarationError[] {
	return getVisibleSections(declaration).flatMap((slug) =>
		validateSection(declaration, slug),
	);
}
