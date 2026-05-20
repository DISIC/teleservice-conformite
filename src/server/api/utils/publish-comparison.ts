import type { CollectionAfterChangeHook, Payload } from "payload";
import type {
	Audit,
	Contact,
	Declaration,
	Schema,
} from "~/payload/payload-types";
import type { PublishedDeclaration } from "~/utils/declaration-content";
import { extractDeclarationContentToPublish } from "~/utils/declaration-content";
import type { PopulatedDeclaration } from "./payload-helper";

type DeclarationFieldOverrides = Partial<
	Pick<Declaration, "name" | "app_kind" | "url">
>;

type DocOverrides = {
	contact?: Contact;
	audit?: Audit;
	schema?: Schema;
	declarationFields?: DeclarationFieldOverrides;
};

export function makeRecalculateAfterChangeHook(
	overrideKey: keyof Omit<DocOverrides, "declarationFields">,
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
): Promise<"published" | "unpublished" | null> {
	const declaration = await payload.findByID({
		collection: "declarations",
		id: declarationId,
		depth: 0,
	});

	if (!declaration?.publishedContent) return null;

	const published: PublishedDeclaration = JSON.parse(
		declaration.publishedContent,
	);

	const fetchById = async <
		T extends keyof Payload["collections"] | "audits" | "contacts" | "schemas",
	>(
		collection: T,
		id: number | null | undefined,
	) => {
		if (!id) return null;
		return (await payload.findByID({
			collection: collection as any,
			id,
		})) as any;
	};

	const contactId =
		typeof declaration.contact === "number"
			? declaration.contact
			: (declaration.contact?.id ?? null);
	const schemaId =
		typeof declaration.schema === "number"
			? declaration.schema
			: (declaration.schema?.id ?? null);

	const [audit, contact, schema, entity] = await Promise.all([
		overrides.audit !== undefined
			? overrides.audit
			: ((
					await payload.find({
						collection: "audits",
						where: { declaration: { equals: declarationId } },
						limit: 1,
					})
				).docs[0] ?? null),
		overrides.contact !== undefined
			? overrides.contact
			: await fetchById("contacts", contactId),
		overrides.schema !== undefined
			? overrides.schema
			: await fetchById("schemas", schemaId),
		declaration.entity
			? payload.findByID({
					collection: "entities",
					id: declaration.entity as number,
				})
			: null,
	]);

	const populatedDeclaration: PopulatedDeclaration = {
		...(declaration as PopulatedDeclaration),
		...overrides.declarationFields,
		audit,
		contact,
		schema,
		entity: entity ?? null,
		created_by: null,
	};

	const current = extractDeclarationContentToPublish(populatedDeclaration);
	const isModified = JSON.stringify(current) !== JSON.stringify(published);
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
