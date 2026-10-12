import { declarationToContactValues } from "~/forms/contact/contactSchema";
import { declarationToSchemaValues } from "~/forms/schema/schemaSchema";
import type { LibrarySectionKind } from "~/server/api/routers/library";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export type { LibrarySectionKind } from "~/server/api/routers/library";

/** Linked = mirrors a Library item; custom = inline; skipped = schema only. */
export type SourceModeValue = "linked" | "custom" | "skipped";

/**
 * Radio input `name` per kind. Doubles as the gate error's `field`, so the
 * error summary and `?field=` focus route to the radio when no mode is chosen.
 */
export const SOURCE_MODE_FIELD: Record<LibrarySectionKind, string> = {
	contact: "contact.sourceMode",
	schema: "schema.sourceMode",
};

/** `name` of the Library item select; the gate error's `field` while Linked is chosen but nothing picked. */
export const SOURCE_LINK_FIELD: Record<LibrarySectionKind, string> = {
	contact: "contact.parent",
	schema: "schema.parent",
};

/** Radio choices made in the UI but not persisted yet (Linked waits for an item). */
export type PendingSourceModes = Partial<
	Record<LibrarySectionKind, SourceModeValue>
>;

function hasParent(parent: unknown): boolean {
	if (typeof parent === "number") return true;
	return !!parent && typeof parent === "object" && "id" in parent;
}

const SECTION_VALUES: Record<
	LibrarySectionKind,
	(declaration: PopulatedDeclaration) => Record<string, string | unknown[]>
> = {
	contact: declarationToContactValues,
	schema: declarationToSchemaValues,
};

/** Autosave persists partial drafts, so any content field — not `name` alone —
 *  marks the group as an in-progress custom edit. */
function hasCustomContent(
	kind: LibrarySectionKind,
	declaration: PopulatedDeclaration,
): boolean {
	return Object.values(SECTION_VALUES[kind](declaration)).some((value) =>
		Array.isArray(value) ? value.length > 0 : Boolean(value),
	);
}

/**
 * Derives the selected radio option from persisted state — no stored `mode`.
 * `null` means Undecided: nothing chosen yet, so the publish gate must block.
 */
export function deriveSourceMode(
	kind: LibrarySectionKind,
	declaration: PopulatedDeclaration,
): SourceModeValue | null {
	if (hasParent(declaration[kind]?.parent)) return "linked";
	if (kind === "schema" && declaration.schema?.skipped) return "skipped";
	if (hasCustomContent(kind, declaration)) return "custom";
	return null;
}

export function isSourceModeUndecided(
	kind: LibrarySectionKind,
	declaration: PopulatedDeclaration,
): boolean {
	return deriveSourceMode(kind, declaration) === null;
}
