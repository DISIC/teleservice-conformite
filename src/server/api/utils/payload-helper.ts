import { TRPCError } from "@trpc/server";
import { getPayload, type Payload } from "payload";
import payloadConfig from "~/payload/payload.config";
import type {
	Config,
	Declaration,
	Entity,
	User,
} from "~/payload/payload-types";
import type { Session } from "~/lib/auth-client";

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export type Populated<T, D extends number = 1> = [D] extends [0]
	? T
	: T extends (infer Item)[]
		? Populated<Item, D>[]
		: T extends object
			? { [K in keyof T]: Populated<Exclude<T[K], number>, Prev[D]> }
			: T;

export async function findByIdPopulated<
	S extends keyof Config["collections"],
	D extends number = 1,
>(
	payload: Payload,
	collection: S,
	id: number,
	depth: D = 1 as D,
): Promise<Populated<Config["collections"][S], D> | null> {
	return (await payload.findByID({ collection, id, depth })) as never;
}

export async function findPopulated<
	S extends keyof Config["collections"],
	D extends number = 1,
>(
	payload: Payload,
	args: { collection: S; depth?: D } & Record<string, unknown>,
): Promise<{
	docs: Populated<Config["collections"][S], D>[];
	totalDocs: number;
}> {
	return (await payload.find({ depth: 1, ...args })) as never;
}

/**
 * A declaration with its two remaining relations resolved to objects. Only
 * `entity` and `created_by` still need hydrating; audit/contact/schema content
 * lives in groups on the row itself.
 */
export type PopulatedDeclaration = Omit<
	Declaration,
	"entity" | "created_by"
> & {
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
	const { created_by, entity } = declaration;

	const sanitizedEntity = entity
		? await fetchOrReturnRealValue(entity, "entities")
		: null;

	const sanitizedUser = created_by
		? await fetchOrReturnRealValue(created_by, "users")
		: null;

	return {
		...declaration,
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
