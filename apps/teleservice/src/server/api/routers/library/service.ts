import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import type { Contact, Declaration, Schema } from "~/payload/payload-types";
import {
	getPopulatedDeclaration,
	type PopulatedDeclaration,
} from "../../utils/payload-helper";
import {
	type DeclarationRowData,
	writeDeclaration,
} from "../../utils/section-write";

/** Contact and Schema are symmetric by invariant: every Library-section flow is
 *  written once here, kind-parametrically; adapters carry the field mapping. */
export type LibrarySectionKind = "contact" | "schema";

type SectionGroup<K extends LibrarySectionKind> = Declaration[K];
type ParentDoc<K extends LibrarySectionKind> = K extends "contact"
	? Contact
	: Schema;

const LIBRARY_COLLECTION = {
	contact: "contacts",
	schema: "schemas",
} as const satisfies Record<LibrarySectionKind, "contacts" | "schemas">;

type LibrarySectionAdapter<K extends LibrarySectionKind> = {
	/** Mode flags every content write must reset; `skipped` is schema's only extension. */
	contentFlags: Partial<SectionGroup<K>>;
	contentFromParent: (parent: ParentDoc<K>) => Partial<SectionGroup<K>>;
};

const ADAPTERS: { [K in LibrarySectionKind]: LibrarySectionAdapter<K> } = {
	contact: {
		contentFlags: {},
		contentFromParent: (parent) => ({
			name: parent.name,
			email: parent.email ?? "",
			url: parent.url ?? "",
		}),
	},
	schema: {
		contentFlags: { skipped: false },
		contentFromParent: (parent) => ({
			name: parent.name,
			url: parent.url ?? "",
			actionPlanUrls: (parent.actionPlanUrls ?? []).map((plan) => ({
				name: plan.name,
				url: plan.url,
			})),
		}),
	},
};

function assertOwner(user: unknown, userId: number) {
	const ownerId =
		typeof user === "object" && user ? (user as { id: number }).id : user;
	if (ownerId !== userId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Cet élément n'appartient pas à votre bibliothèque.",
		});
	}
}

async function getOwnedLibraryItem(
	payload: Payload,
	userId: number,
	kind: LibrarySectionKind,
	id: number,
) {
	const item = await payload.findByID({
		collection: LIBRARY_COLLECTION[kind],
		id,
		depth: 0,
	});
	assertOwner(item?.user, userId);
	return item;
}

function groupData<K extends LibrarySectionKind>(
	kind: K,
	group: Partial<SectionGroup<K>>,
): DeclarationRowData {
	return { [kind]: group } as DeclarationRowData;
}

// Linked copies are hydrated so the status rule sees the whole row, entity included.
function findLinked(
	payload: Payload,
	kind: LibrarySectionKind,
	parentId: number,
) {
	return payload.find({
		collection: "declarations",
		where: { [`${kind}.parent`]: { equals: parentId } },
		depth: 1,
		limit: 1000,
	});
}

/** Linked groups are read-only in the UI and writable only here — the single
 *  choke point that keeps copies in sync with their parent. */
async function propagateToLinkedDeclarations<K extends LibrarySectionKind>(
	payload: Payload,
	kind: K,
	parentId: number,
	values: Partial<SectionGroup<K>>,
) {
	const linked = await findLinked(payload, kind, parentId);

	for (const doc of linked.docs) {
		const declaration = await getPopulatedDeclaration(doc);
		await writeDeclaration(
			payload,
			declaration,
			groupData(kind, {
				...declaration[kind],
				...values,
				parent: parentId,
				toVerify: false,
			}),
		);
	}
}

/** The declarant's deliberate "no schema" choice clears content and Library
 *  link. Schema-only; a Contact is always required to publish. */
export function skipSchema(
	payload: Payload,
	declaration: PopulatedDeclaration,
) {
	return writeDeclaration(payload, declaration, {
		schema: {
			...declaration.schema,
			name: "",
			url: "",
			actionPlanUrls: [],
			parent: null,
			skipped: true,
			toVerify: false,
		},
	});
}

export async function listParents<K extends LibrarySectionKind>(
	payload: Payload,
	userId: number,
	kind: K,
) {
	const result = await payload.find({
		collection: LIBRARY_COLLECTION[kind],
		where: { user: { equals: userId } },
		limit: 100,
		depth: 0,
	});
	return result.docs as ParentDoc<K>[];
}

/** An update fans the new content out to every linked declaration; a create
 *  propagates nothing — nothing links it yet. */
export async function upsertParent<K extends LibrarySectionKind>(
	payload: Payload,
	userId: number,
	kind: K,
	values: Partial<SectionGroup<K>> & { name: string },
	id?: number,
) {
	if (!id) {
		return payload.create({
			collection: LIBRARY_COLLECTION[kind],
			data: { ...values, user: userId } as never,
		});
	}

	await getOwnedLibraryItem(payload, userId, kind, id);

	const updated = await payload.update({
		collection: LIBRARY_COLLECTION[kind],
		id,
		data: values as never,
	});

	await propagateToLinkedDeclarations(payload, kind, id, values);

	return updated;
}

/** Deleting a parent detaches every linked declaration but leaves each copy's
 *  content untouched. */
export async function deleteParent(
	payload: Payload,
	userId: number,
	kind: LibrarySectionKind,
	id: number,
) {
	await getOwnedLibraryItem(payload, userId, kind, id);

	const linked = await findLinked(payload, kind, id);

	for (const doc of linked.docs) {
		const declaration = await getPopulatedDeclaration(doc);
		await writeDeclaration(
			payload,
			declaration,
			groupData(kind, { ...declaration[kind], parent: null }),
		);
	}

	await payload.delete({ collection: LIBRARY_COLLECTION[kind], id });
	return { id };
}

/** Linking copies the parent's content into the declaration's group; the
 *  linked group turns read-only in the form. */
export async function linkParent<K extends LibrarySectionKind>(
	payload: Payload,
	userId: number,
	kind: K,
	declaration: PopulatedDeclaration,
	parentId: number,
) {
	const parent = await payload.findByID({
		collection: LIBRARY_COLLECTION[kind],
		id: parentId,
		depth: 0,
	});
	assertOwner(parent?.user, userId);

	return writeDeclaration(
		payload,
		declaration,
		groupData(kind, {
			...declaration[kind],
			...ADAPTERS[kind].contentFromParent(parent as ParentDoc<K>),
			...ADAPTERS[kind].contentFlags,
			parent: parentId,
			toVerify: false,
		}),
	);
}

/** Pre-check for the edit/delete warning modals — published declarations flip
 *  to Modifiée on a parent edit, so the modal lists them first. */
export async function getLinkedDeclarations(
	payload: Payload,
	userId: number,
	kind: LibrarySectionKind,
	id: number,
) {
	await getOwnedLibraryItem(payload, userId, kind, id);

	const linked = await findLinked(payload, kind, id);

	return linked.docs.map((declaration) => ({
		id: declaration.id,
		name: declaration.name ?? "",
		isPublished: Boolean(declaration.publishedContent),
	}));
}
