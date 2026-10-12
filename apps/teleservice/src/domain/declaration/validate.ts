import type { z } from "zod";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { SECTION_SLUGS, SECTIONS, type SectionSlug } from "./sections";

/** A single field-level completeness error, carrying its Section for routing. */
export type DeclarationError = {
	section: SectionSlug;
	/** Dot-joined Zod path within the section's form values (e.g. `general.name`). */
	field: string;
	/** Visible label of the field, when the Section declares one. */
	label?: string;
	message: string;
};

// An array item's label is numbered from 1 so two items with the same error stay distinct.
function fieldLabel(
	labels: Record<string, string>,
	path: PropertyKey[],
): string | undefined {
	const key = path
		.map((s) => (typeof s === "number" ? "*" : String(s)))
		.join(".");
	const label = labels[key];
	if (!label) return undefined;
	const index = path.find((s) => typeof s === "number");
	return typeof index === "number" ? `${label} ${index + 1}` : label;
}

/**
 * Runs `schema` against `values` and flattens any issues into ordered
 * `DeclarationError`s, preserving the schema's field order.
 */
function runSchema(
	section: SectionSlug,
	schema: z.ZodType,
	values: unknown,
	labels: Record<string, string>,
): DeclarationError[] {
	const result = schema.safeParse(values);
	if (result.success) return [];
	return result.error.issues.map((issue) => ({
		section,
		field: issue.path.join("."),
		label: fieldLabel(labels, issue.path),
		message: issue.message,
	}));
}

function validateSection(
	declaration: PopulatedDeclaration,
	slug: SectionSlug,
): DeclarationError[] {
	const { validation } = SECTIONS[slug];
	if (validation.isApplicable?.(declaration) === false) return [];
	if (validation.sourceMode?.isUndecided(declaration)) {
		return [
			{
				section: slug,
				field: validation.sourceMode.field,
				message: validation.sourceMode.message,
			},
		];
	}
	return runSchema(
		slug,
		validation.schema,
		validation.fromDeclaration(declaration),
		validation.fieldLabels,
	);
}

/**
 * Validates the whole declaration against every visible Section's Zod schema,
 * using the persisted `declaration` (not live form instances). Returns a flat,
 * ordered list of field-level errors — empty when the declaration is complete
 * enough to publish.
 */
export function validateDeclaration(
	declaration: PopulatedDeclaration,
): DeclarationError[] {
	return SECTION_SLUGS.flatMap((slug) => validateSection(declaration, slug));
}
