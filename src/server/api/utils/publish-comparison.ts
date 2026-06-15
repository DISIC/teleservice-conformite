import type { Payload } from "payload";
import type { Declaration } from "~/payload/payload-types";
import { hasContentChangedSincePublish } from "~/utils/declaration/status";
import type { PopulatedDeclaration } from "./payload-helper";

type DeclarationFieldOverrides = Partial<
	Pick<Declaration, "name" | "app_kind" | "url">
>;

type RecalculateOverrides = {
	/**
	 * Pending general-info fields a caller is about to write, used to preview the
	 * resulting status without a read-then-write race. When set, this function
	 * computes the status but leaves the write to the caller (which folds it into
	 * the same `declarations` update).
	 */
	declarationFields?: DeclarationFieldOverrides;
};

/**
 * Recomputes Modifiée/Publiée for a declaration whose content may have drifted
 * from its published snapshot. Since ADR-0004 the audit/contact/schema content
 * is read straight off the declaration row — no per-section rows to hydrate.
 * No-op for drafts (no `publishedContent` to compare against).
 */
export async function recalculateDeclarationStatus(
	payload: Payload,
	declarationId: number,
	overrides: RecalculateOverrides = {},
): Promise<"published" | "unpublished" | null> {
	const declaration = await payload.findByID({
		collection: "declarations",
		id: declarationId,
		depth: 0,
	});

	if (!declaration?.publishedContent) return null;

	const entity = declaration.entity
		? await payload.findByID({
				collection: "entities",
				id: declaration.entity as number,
			})
		: null;

	const populatedDeclaration: PopulatedDeclaration = {
		...(declaration as PopulatedDeclaration),
		...overrides.declarationFields,
		entity: entity ?? null,
		created_by: null,
	};

	const isModified = hasContentChangedSincePublish(populatedDeclaration);
	const newStatus = isModified ? "unpublished" : "published";

	if (!overrides.declarationFields && declaration.status !== newStatus) {
		await payload.update({
			collection: "declarations",
			id: declarationId,
			data: { status: newStatus },
		});
	}

	return newStatus;
}
