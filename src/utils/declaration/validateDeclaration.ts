import type { z } from "zod";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { SECTION_SLUGS, SECTIONS, type SectionSlug } from "./sections";

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
	schema: z.ZodType,
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

function validateSection(
	declaration: PopulatedDeclaration,
	slug: SectionSlug,
): DeclarationError[] {
	const { validation } = SECTIONS[slug];
	if (validation.isApplicable?.(declaration) === false) return [];
	return runSchema(
		slug,
		validation.schema,
		validation.fromDeclaration(declaration),
	);
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
	return SECTION_SLUGS.flatMap((slug) => validateSection(declaration, slug));
}
