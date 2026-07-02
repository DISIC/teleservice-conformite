import type { DeclarationChangeFn } from "~/components/declaration/sections/Content";
import { declarationToContactValues } from "~/forms/contact/contactSchema";
import { declarationToSchemaValues } from "~/forms/schema/schemaSchema";
import type { LibrarySectionKind } from "~/server/api/routers/librarySection";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export type { LibrarySectionKind } from "~/server/api/routers/librarySection";

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

export type LibrarySectionResult<K extends LibrarySectionKind> = {
	data: PopulatedDeclaration[K];
	status: "published" | "unpublished" | null;
};

/** The returned slice doubles as a publish-gate validation override. */
export function applyLibrarySection<K extends LibrarySectionKind>(
	kind: K,
	onDeclarationChange: DeclarationChangeFn,
) {
	return (result: LibrarySectionResult<K>) => {
		const slice = { [kind]: result.data } as Pick<PopulatedDeclaration, K>;
		onDeclarationChange((prev) => ({
			...prev,
			...slice,
			status: result.status ?? prev.status,
		}));
		return slice;
	};
}
