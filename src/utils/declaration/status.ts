import type { BadgeProps } from "@codegouvfr/react-dsfr/Badge";
import type { Declaration } from "~/payload/payload-types";
import { extractDeclarationContentToPublish } from "~/utils/declaration-content";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import type { PublishedDeclaration } from "~/utils/declaration-content";

/** Three visual states derived from `status` + `publishedContent`. See CONTEXT.md. */
export type Status = "draft" | "modified" | "published";

export function getDeclarationStatus(
	declaration: Pick<Declaration, "status" | "publishedContent">,
): Status {
	if (declaration.status === "published") return "published";
	return declaration.publishedContent ? "modified" : "draft";
}

export const STATUS_PRESENTATION: Record<
	Status,
	{ label: string; severity: BadgeProps["severity"] }
> = {
	draft: { label: "Brouillon", severity: undefined },
	modified: { label: "Modifiée", severity: "warning" },
	published: { label: "Publiée", severity: "success" },
};

/** Returns `false` when no snapshot exists — a draft has nothing to differ from. */
export function hasContentChangedSincePublish(
	declaration: PopulatedDeclaration,
): boolean {
	if (!declaration.publishedContent) return false;
	const published: PublishedDeclaration = JSON.parse(
		declaration.publishedContent,
	);
	const current = extractDeclarationContentToPublish(declaration);
	return JSON.stringify(current) !== JSON.stringify(published);
}
