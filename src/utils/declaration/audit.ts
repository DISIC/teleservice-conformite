import type { Declaration } from "~/payload/payload-types";

/**
 * The audit group of a declaration whose audit was not realised: the answer
 * alone, with no detail left. Single source of truth for both ends — what the
 * declarant's "non réalisé" answer writes to the row, and what the publish
 * snapshot extracts whatever the row still carries.
 */
export const NO_AUDIT = {
	isRealised: false,
	date: null,
	rgaa_version: null,
	realisedBy: null,
	rate: null,
	compliantElements: null,
	nonCompliantElements: null,
	disproportionnedCharge: null,
	optionalElements: null,
	auditReport: null,
	usedTools: [],
	testEnvironments: [],
	technologies: [],
} satisfies Omit<Declaration["audit"], "toVerify">;
