import { TRPCError } from "@trpc/server";
import { type Payload, getPayload } from "payload";
import payloadConfig from "~/payload/payload.config";
import type { Audit, Contact, ActionPlan, Declaration, Entity, User } from "~/payload/payload-types";

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

export async function linkToDeclaration(
	payload: Payload,
	declarationId: number,
	keyId: number,
	keyName = "contact",
) {
	try {
		await payload.update({
			collection: "declarations",
			id: declarationId,
			data: {
				[keyName]: keyId,
			},
		});
	} catch(error){
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: `Failed to link contact to declaration: ${(error as Error).message}`,
		});
	}
}

export async function isDeclarationOwner({ payload, userId, declarationId }: { payload: Payload, userId: number | null, declarationId: number | null }): Promise<boolean> {
	if (!userId || !declarationId) return false;
	
	const declaration = await payload.findByID({
		collection: "declarations",
		id: declarationId,
	});

	if (!declaration) return false;

	const createdBy = await fetchOrReturnRealValue(
		declaration.created_by as number,
		"users",
	);

	return (createdBy?.id === userId);
}

export const getDefaultDeclarationName = async (payload: Payload, activeUserId: number | null): Promise<string> => {
	const prefix = "declaration_sans_titre";

	if (activeUserId === null) return `${prefix}_1`;

	const declarations = await payload.find({
		collection: "declarations",
		depth: 0,
		where: {
			name: {
				contains: prefix,
			},
			"created_by.id": {
				equals: activeUserId,
			},
		}
	});

	return `${prefix}_${declarations.totalDocs + 1}`;
};
