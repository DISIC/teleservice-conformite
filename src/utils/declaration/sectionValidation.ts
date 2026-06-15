import type { z } from "zod";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export type SectionValidation<TSchema extends z.ZodType = z.ZodType> = {
	schema: TSchema;
	fromDeclaration: (declaration: PopulatedDeclaration) => z.input<TSchema>;
	/**
	 * Whether this Section currently participates in the publish gate.
	 * Separate from visibility: non-realised audit Sub-sections stay navigable
	 * but their fields are not applicable yet.
	 */
	isApplicable?: (declaration: PopulatedDeclaration) => boolean;
};

export function defineSectionValidation<TSchema extends z.ZodType>(
	validation: SectionValidation<TSchema>,
): SectionValidation<TSchema> {
	return validation;
}
