import type { Declaration } from "~/payload/payload-types";
import {
	extractDeclarationContentToPublish,
	parsePublishedDeclaration,
} from "~/domain/declaration/published/snapshot";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

/** Brouillon until the first publish action, Publiée forever after — even while modified. */
export type Status = "draft" | "published";

/**
 * How the declaration details page presents its Sections for editing. Derived
 * from {@link Status} but a distinct concept — it describes interaction, not lifecycle.
 */
export type EditingMode = "sequential" | "standalone";

/** `sequential` for a never-published Brouillon, `standalone` afterwards. */
export function getEditingMode(status: Status): EditingMode {
	return status === "draft" ? "sequential" : "standalone";
}

export function getDeclarationStatus(
	declaration: Pick<Declaration, "publishedContent">,
): Status {
	return declaration.publishedContent ? "published" : "draft";
}

/** Returns `false` when no snapshot exists — a draft has nothing to differ from. */
export function hasContentChangedSincePublish(
	declaration: PopulatedDeclaration,
): boolean {
	if (!declaration.publishedContent) return false;
	const published = parsePublishedDeclaration(declaration.publishedContent);
	// An unreadable snapshot can only be repaired by republishing.
	if (!published) return true;
	// The publish date is set by publishing itself, so it is never a content change.
	const current = extractDeclarationContentToPublish(declaration, {
		publishedAt: new Date(published.publishedAt),
	});
	return JSON.stringify(current) !== JSON.stringify(published);
}

// Published: Modifiée when the row drifts from its snapshot, Publiée when restored. Brouillon: unchanged.
export function statusAfterEdit(
	declaration: PopulatedDeclaration,
): "published" | "unpublished" {
	if (!declaration.publishedContent) return declaration.status ?? "unpublished";
	return hasContentChangedSincePublish(declaration)
		? "unpublished"
		: "published";
}
