import type { Declaration } from "~/payload/payload-types";
import {
	extractDeclarationContentToPublish,
	parsePublishedDeclaration,
} from "~/utils/declaration-content";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

/** Three visual states derived from `status` + `publishedContent`. */
export type Status = "draft" | "modified" | "published";

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
	declaration: Pick<Declaration, "status" | "publishedContent">,
): Status {
	if (declaration.status === "published") return "published";
	return declaration.publishedContent ? "modified" : "draft";
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
