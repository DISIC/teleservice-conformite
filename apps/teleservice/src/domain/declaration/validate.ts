import type { z } from "zod";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { SECTION_SLUGS, SECTIONS, type SectionSlug } from "./sections";
import {
	deriveSourceMode,
	type PendingSourceModes,
	SOURCE_LINK_FIELD,
} from "./sourceMode";

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
	pendingSourceModes: PendingSourceModes,
): DeclarationError[] {
	const { validation } = SECTIONS[slug];
	const { sourceMode } = validation;
	const pending = sourceMode && pendingSourceModes[sourceMode.kind];
	// Choosing Linked supersedes any saved custom draft: only the missing item counts.
	if (
		sourceMode &&
		pending === "linked" &&
		deriveSourceMode(sourceMode.kind, declaration) !== "linked"
	) {
		return [
			{
				section: slug,
				field: SOURCE_LINK_FIELD[sourceMode.kind],
				message: sourceMode.linkMessage,
			},
		];
	}
	if (validation.isApplicable?.(declaration) === false) return [];
	if (pending !== "custom" && sourceMode?.isUndecided(declaration)) {
		return [
			{
				section: slug,
				field: sourceMode.field,
				message: sourceMode.message,
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
 * using the persisted `declaration` (not live form instances) plus any source
 * choice the declarant made but has not persisted yet. Returns a flat,
 * ordered list of field-level errors — empty when the declaration is complete
 * enough to publish.
 */
export function validateDeclaration(
	declaration: PopulatedDeclaration,
	pendingSourceModes: PendingSourceModes = {},
): DeclarationError[] {
	return SECTION_SLUGS.flatMap((slug) =>
		validateSection(declaration, slug, pendingSourceModes),
	);
}
