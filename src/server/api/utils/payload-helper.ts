import { TRPCError } from "@trpc/server";
import { getPayload, type Payload } from "payload";
import payloadConfig from "~/payload/payload.config";
import type {
	ActionPlan,
	Audit,
	Config,
	Contact,
	Declaration,
	Entity,
	User,
} from "~/payload/payload-types";
import type { Session } from "~/utils/auth-client";

export type PopulatedDeclaration = Omit<
	Declaration,
	"audit" | "contact" | "entity" | "actionPlan" | "created_by"
> & {
	audit: Audit | null;
	contact: Contact | null;
	actionPlan: ActionPlan | null;
	created_by: User | null;
	entity: Entity | null;
};

export async function fetchOrReturnRealValue<
	T extends keyof Config["collections"],
>(
	item: number | Config["collections"][T],
	collection: T,
): Promise<Config["collections"][T]> {
	if (typeof item === "number") {
		const payload = await getPayload({ config: payloadConfig });

		return (await payload.findByID({
			collection,
			id: item,
		})) as Config["collections"][T];
	}

	return item as Config["collections"][T];
}

export async function getPopulatedDeclaration(
	declaration: Declaration,
): Promise<PopulatedDeclaration> {
	const { audit, contact, actionPlan, created_by, entity } = declaration;

	const sanitizedAudit = audit?.docs?.[0]
		? await fetchOrReturnRealValue(audit.docs[0], "audits")
		: null;

	const sanitizedContact = contact?.docs?.[0]
		? await fetchOrReturnRealValue(contact.docs[0], "contacts")
		: null;

	const sanitizedActionPlan = actionPlan?.docs?.[0]
		? await fetchOrReturnRealValue(actionPlan.docs[0], "action-plans")
		: null;

	const sanitizedEntity = entity
		? await fetchOrReturnRealValue(entity, "entities")
		: null;

	const sanitizedUser = created_by
		? await fetchOrReturnRealValue(created_by, "users")
		: null;

	return {
		...declaration,
		audit: sanitizedAudit,
		contact: sanitizedContact,
		actionPlan: sanitizedActionPlan,
		created_by: sanitizedUser,
		entity: sanitizedEntity,
	};
}

export async function getDeclarationById(
	payload: Payload,
	session: Session,
	declarationId: number,
	options?: { trash?: boolean },
) {
	try {
		const result = await payload.findByID({
			collection: "declarations",
			id: declarationId,
			depth: 0,
			trash: options?.trash ?? false,
		});

		const hasAccessRight = await payload.find({
			collection: "access-rights",
			where: {
				declaration: { equals: declarationId },
				user: { equals: session.user.id },
				status: { equals: "approved" },
			},
		});

		if (hasAccessRight.totalDocs === 0) {
			return null;
		}

		const declaration = await getPopulatedDeclaration(result);

		return declaration;
	} catch (error) {
		console.error("Error fetching declaration by ID:", error);

		return null;
	}
}

export async function hasAccessToDeclaration({
	payload,
	userId,
	declarationId,
}: {
	payload: Payload;
	userId: number | null;
	declarationId: number | null;
}): Promise<boolean> {
	if (!userId || !declarationId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "User not authorized to access this declaration.",
		});
	}

	const declaration = await payload.findByID({
		collection: "declarations",
		id: declarationId,
	});

	if (!declaration) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Declaration not found.",
		});
	}

	const accessRight = await payload.find({
		collection: "access-rights",
		where: {
			declaration: { equals: declarationId },
			user: { equals: userId },
			status: { equals: "approved" },
		},
		limit: 1,
	});

	if (accessRight.totalDocs === 0) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Must have an approved access right to access this declaration.",
		});
	}

	return true;
}

export const getDefaultDeclarationName = async (
	payload: Payload,
	activeUserId: number | null,
): Promise<string> => {
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
		},
	});

	return `${prefix}_${declarations.totalDocs + 1}`;
};
