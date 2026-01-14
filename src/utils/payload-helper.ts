import { type Payload, getPayload } from "payload";
import payloadConfig from "~/payload/payload.config";
import type { Audit, Contact, ActionPlan, Declaration, Entity, User } from "~/payload/payload-types";

export type DeclarationWithPopulated = Declaration & {
	audit: Audit | null;
	contact: Contact | null;
	actionPlan: ActionPlan | null;
	created_by: User | null;
	entity: Entity | null;
};

export function isPopulated<T>(relation: number | T): relation is T {
	return typeof relation === "object" && relation !== null;
}

export function getPopulated<T>(relation: number | T): T | null {
	return isPopulated(relation) ? relation : null;
}

export function getPopulatedArray<T>(
	relations: (number | T)[] | undefined,
): T[] {
	if (!relations) return [];
	return relations.filter(isPopulated);
}

type CollectionMap = {
  audits: Audit;
  contacts: Contact;
  "action-plans": ActionPlan;
	users: User;
	entities: Entity;
  declarations: Declaration;
};

export async function fetchOrReturnRealValue<
  T extends keyof CollectionMap,
>(
  item: number | CollectionMap[T] | null,
  collection: T,
): Promise<CollectionMap[T] | null> {
  let value: CollectionMap[T];

	if (!item) {
		return null;
	}

	if (typeof item === "number") {
		const payload = await getPayload({ config: payloadConfig });

		value = (await payload.findByID({
			collection,
			id: item,
		})) as CollectionMap[T];
	} else {
		value = item as CollectionMap[T];
	}

	return value;
}

export async function getDeclarationById(
	payload: Payload,
	declarationId: number,
) {
	try {
		const result = await payload.findByID({
			collection: "declarations",
			id: declarationId,
			depth: 0,
		});

		if (!result) {
			return null;
		}

		const { audit, contact, actionPlan, created_by, entity } = result;

		const sanitizedAudit = await fetchOrReturnRealValue(
			audit ?? null,
			"audits",
		);

		const sanitizedContact = await fetchOrReturnRealValue(
			contact ?? null,
			"contacts",
		);

		const sanitizedActionPlan = await fetchOrReturnRealValue(
			actionPlan ?? null,
			"action-plans",
		);

		const sanitizedEntity = await fetchOrReturnRealValue(
			entity ?? null,
			"entities",
		);
		
		const sanitizedUser = await fetchOrReturnRealValue(
			created_by ?? null,
			"users",
		);

		const declaration = {
			...result,
			audit: sanitizedAudit,
			contact: sanitizedContact,
			actionPlan: sanitizedActionPlan,
			created_by: sanitizedUser,
			entity: sanitizedEntity,
			updatedAtFormatted: new Date(result.updatedAt).toLocaleDateString("fr-FR"),
		};

		return declaration;
	} catch (error) {
		console.error("Error fetching declaration by ID:", error);

		return null;
	}
}