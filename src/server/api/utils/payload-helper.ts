import { getPayload, type Payload } from "payload";
import payloadConfig from "~/payload/payload.config";
import type {
	Config,
	Declaration,
	Entity,
	User,
} from "~/payload/payload-types";

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
