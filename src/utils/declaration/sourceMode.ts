import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export type SourceModeKind = "contact" | "schema";

/** Linked = mirrors a Library item; custom = inline; skipped = schema only. */
export type SourceModeValue = "linked" | "custom" | "skipped";

/**
 * Radio input `name` per kind. Doubles as the gate error's `field`, so the
 * error summary and `?field=` focus route to the radio when no mode is chosen.
 */
export const SOURCE_MODE_FIELD: Record<SourceModeKind, string> = {
	contact: "contact.sourceMode",
	schema: "schema.sourceMode",
};

function hasParent(parent: unknown): boolean {
	if (typeof parent === "number") return true;
	return !!parent && typeof parent === "object" && "id" in parent;
}

/**
 * Derives the selected radio option from persisted state — no stored `mode`.
 * `null` means Undecided: nothing chosen yet, so the publish gate must block.
 */
export function deriveSourceMode(
	kind: SourceModeKind,
	declaration: PopulatedDeclaration,
): SourceModeValue | null {
	const group = declaration[kind];
	if (hasParent(group?.parent)) return "linked";
	if (kind === "schema" && declaration.schema?.skipped) return "skipped";
	if (group?.name) return "custom";
	return null;
}

export function isSourceModeUndecided(
	kind: SourceModeKind,
	declaration: PopulatedDeclaration,
): boolean {
	return deriveSourceMode(kind, declaration) === null;
}
