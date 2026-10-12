import type { z } from "zod";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import type { LibrarySectionKind } from "./sourceMode";

export type SectionValidation<TSchema extends z.ZodType = z.ZodType> = {
	schema: TSchema;
	fromDeclaration: (declaration: PopulatedDeclaration) => z.input<TSchema>;
	/**
	 * Whether this Section currently participates in the publish gate.
	 * Separate from visibility: non-realised audit Sub-sections stay navigable
	 * but their fields are not applicable yet.
	 */
	isApplicable?: (declaration: PopulatedDeclaration) => boolean;
	/** Field labels shown in the error summary, keyed by path; `*` stands for an array index. */
	fieldLabels: Record<string, string>;
	/**
	 * Source-mode sections (contact/schema) require an explicit choice before
	 * their field schema runs; while undecided the gate targets the radio
	 * instead of emitting per-field errors.
	 */
	sourceMode?: {
		kind: LibrarySectionKind;
		field: string;
		isUndecided: (declaration: PopulatedDeclaration) => boolean;
		message: string;
		/** Error once Linked is chosen while no Library item is picked yet. */
		linkMessage: string;
	};
};
