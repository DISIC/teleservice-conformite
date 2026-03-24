import type { CollectionAfterChangeHook, Payload } from "payload";
import type { ActionPlan, Audit, Contact } from "~/payload/payload-types";
import type { PublishedDeclaration } from "~/utils/declaration-content";
import { extractDeclarationContentToPublish } from "~/utils/declaration-content";
import type { PopulatedDeclaration } from "./payload-helper";

type DocOverrides = {
	contact?: Contact;
	audit?: Audit;
	actionPlan?: ActionPlan;
};

export function makeRecalculateAfterChangeHook(
	overrideKey: keyof DocOverrides,
): CollectionAfterChangeHook {
	return async ({ req, doc, previousDoc, operation, context }) => {
		if (operation !== "update" || previousDoc.toVerify) return;
		if (context?.skipStatusRecalculation) return;

		const declaration = doc.declaration;
		if (!declaration) return;

		await recalculateDeclarationStatus(
			req.payload,
			typeof declaration === "number" ? declaration : Number(declaration.id),
			{ [overrideKey]: doc } as DocOverrides,
		);
	};
}

export async function recalculateDeclarationStatus(
	payload: Payload,
	declarationId: number,
	overrides: DocOverrides = {},
): Promise<void> {
	const declaration = await payload.findByID({
		collection: "declarations",
		id: declarationId,
		depth: 0,
	});

	if (!declaration?.publishedContent) return;

	const published: PublishedDeclaration = JSON.parse(
		declaration.publishedContent,
	);

	const findOne = async <T>(
		override: T | undefined,
		fetch: () => Promise<{ docs: T[] }>,
	): Promise<T | null> =>
		override !== undefined ? override : ((await fetch()).docs[0] ?? null);

	const [audit, contact, actionPlan, entity] = await Promise.all([
		findOne(overrides.audit, () =>
			payload.find({
				collection: "audits",
				where: { declaration: { equals: declarationId } },
				limit: 1,
			}),
		),
		findOne(overrides.contact, () =>
			payload.find({
				collection: "contacts",
				where: { declaration: { equals: declarationId } },
				limit: 1,
			}),
		),
		findOne(overrides.actionPlan, () =>
			payload.find({
				collection: "action-plans",
				where: { declaration: { equals: declarationId } },
				limit: 1,
			}),
		),
		declaration.entity
			? payload.findByID({
					collection: "entities",
					id: declaration.entity as number,
				})
			: null,
	]);

	const populatedDeclaration: PopulatedDeclaration = {
		...(declaration as PopulatedDeclaration),
		audit,
		contact,
		actionPlan,
		entity: entity ?? null,
		created_by: null,
	};

	const current = extractDeclarationContentToPublish(populatedDeclaration);
	const isModified = JSON.stringify(current) !== JSON.stringify(published);

	const newStatus = isModified ? "unpublished" : "published";
	if (declaration.status !== newStatus) {
		await payload.update({
			collection: "declarations",
			id: declarationId,
			data: { status: newStatus },
		});
	}
}
