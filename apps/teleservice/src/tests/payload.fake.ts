import type { Payload } from "payload";

type Doc = { id: number | string };
type Where = Record<string, unknown>;

/** Relationships compare by id whether stored populated or as a bare id. */
const idOf = (value: unknown): unknown =>
	value && typeof value === "object" && "id" in value
		? (value as Doc).id
		: value;

const readPath = (doc: unknown, path: string): unknown =>
	path.split(".").reduce<unknown>((value, key) => {
		if (value == null) return undefined;
		if (key === "id" && typeof value !== "object") return value;
		return (value as Record<string, unknown>)[key];
	}, doc);

function matches(doc: Doc, where: Where | undefined): boolean {
	if (!where) return true;
	return Object.entries(where).every(([key, condition]) => {
		if (key === "and")
			return (condition as Where[]).every((clause) => matches(doc, clause));
		if (key === "or")
			return (condition as Where[]).some((clause) => matches(doc, clause));
		const value = readPath(doc, key);
		const operator = condition as { equals?: unknown; contains?: string };
		if ("equals" in operator) return idOf(value) === idOf(operator.equals);
		if ("contains" in operator)
			return (
				typeof value === "string" && value.includes(operator.contains ?? "")
			);
		throw new Error(`fakePayload: unsupported where operator on "${key}"`);
	});
}

const isTrashed = (doc: Doc) =>
	Boolean((doc as { deletedAt?: unknown }).deletedAt);

/**
 * In-memory Payload for the server seams: the calls the services make, with
 * Payload's merge, filter and trash semantics. Rows are stored as seeded, so
 * `depth` is ignored — seed relationships populated when the code reads them so.
 */
export function fakePayload(seed: Record<string, readonly Doc[]> = {}) {
	const store = new Map<string, Map<Doc["id"], Doc>>(
		Object.entries(seed).map(([collection, docs]) => [
			collection,
			new Map(docs.map((doc) => [doc.id, doc])),
		]),
	);
	let nextId = 1000;
	const table = (collection: string) => {
		const rows = store.get(collection) ?? new Map<Doc["id"], Doc>();
		store.set(collection, rows);
		return rows;
	};

	const api = {
		async findByID({
			collection,
			id,
			trash = false,
			disableErrors = false,
		}: {
			collection: string;
			id: Doc["id"];
			trash?: boolean;
			disableErrors?: boolean;
		}) {
			const doc = table(collection).get(id);
			if (doc && (trash || !isTrashed(doc))) return doc;
			if (disableErrors) return null;
			throw new Error(`fakePayload: ${collection}/${id} not found`);
		},
		async find({
			collection,
			where,
			limit,
		}: {
			collection: string;
			where?: Where;
			limit?: number;
		}) {
			const docs = [...table(collection).values()].filter((doc) =>
				matches(doc, where),
			);
			return {
				docs: limit ? docs.slice(0, limit) : docs,
				totalDocs: docs.length,
			};
		},
		async create({
			collection,
			data,
		}: {
			collection: string;
			data: Record<string, unknown>;
		}) {
			const doc = { id: nextId++, ...data } as Doc;
			table(collection).set(doc.id, doc);
			return doc;
		},
		async update({
			collection,
			id,
			data,
		}: {
			collection: string;
			id: Doc["id"];
			data: Record<string, unknown>;
		}) {
			const current = table(collection).get(id);
			if (!current)
				throw new Error(`fakePayload: ${collection}/${id} not found`);
			const next = { ...current, ...data };
			table(collection).set(id, next);
			return next;
		},
		async delete({ collection, id }: { collection: string; id: Doc["id"] }) {
			const doc = table(collection).get(id) ?? null;
			table(collection).delete(id);
			return doc;
		},
	};

	return {
		payload: api as unknown as Payload,
		/** The row as the next request would read it. */
		read<T extends Doc = Doc>(collection: string, id: Doc["id"]) {
			return table(collection).get(id) as T | undefined;
		},
	};
}
