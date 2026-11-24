import type { Declaration } from "~/payload/payload-types";
import {
	extractDeclarationContentToDeposit,
	parseDepositedDeclaration,
} from "~/domain/declaration/deposited/snapshot";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

/** Brouillon until the first deposit, Déposée once deposited, Publiée once the service's link to its public page is verified. */
export type Status = "draft" | "deposited" | "published";

/**
 * How the declaration details page presents its Sections for editing. Derived
 * from {@link Status} but a distinct concept — it describes interaction, not lifecycle.
 */
export type EditingMode = "sequential" | "standalone";

/** `sequential` for a never-deposited Brouillon, `standalone` afterwards. */
export function getEditingMode(status: Status): EditingMode {
	return status === "draft" ? "sequential" : "standalone";
}

export function getDeclarationStatus(
	declaration: Pick<Declaration, "depositedContent" | "link_verified_at">,
): Status {
	if (!declaration.depositedContent) return "draft";
	return declaration.link_verified_at ? "published" : "deposited";
}

/** Returns `false` when no snapshot exists — a draft has nothing to differ from. */
export function hasContentChangedSinceDeposit(
	declaration: PopulatedDeclaration,
): boolean {
	if (!declaration.depositedContent) return false;
	const deposited = parseDepositedDeclaration(declaration.depositedContent);
	// An unreadable snapshot can only be repaired by redepositing.
	if (!deposited) return true;
	// The deposit date is set by depositing itself, so it is never a content change.
	const current = extractDeclarationContentToDeposit(declaration, {
		depositedAt: new Date(deposited.depositedAt),
	});
	return JSON.stringify(current) !== JSON.stringify(deposited);
}

// Deposited: Modifiée when the row drifts from its snapshot, clean again when restored. Brouillon: unchanged.
export function statusAfterEdit(
	declaration: PopulatedDeclaration,
): "deposited" | "undeposited" {
	if (!declaration.depositedContent) return declaration.status ?? "undeposited";
	return hasContentChangedSinceDeposit(declaration)
		? "undeposited"
		: "deposited";
}
