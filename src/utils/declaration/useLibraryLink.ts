import { declarationToContactValues } from "~/forms/contact/contactSchema";
import { declarationToSchemaValues } from "~/forms/schema/schemaSchema";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import type { DeclarationChangeFn } from "~/components/declaration/sections/Content";
import { api } from "~/lib/api";

export type LibraryLink = {
	label: string;
	placeholder: string;
	items: { id: number; label: string; hint?: string }[];
	linkedParentId: number | null;
	onSelect: (id: number) => void;
	onUnlink: () => void;
	refetch: () => void;
};

type UseLibraryLinkArgs = {
	kind: "schema" | "contact";
	declaration: PopulatedDeclaration;
	onDeclarationChange: DeclarationChangeFn;
};

/** Reads the group's `parent` id (depth 0 → a number; defensive for objects). */
function parentId(parent: unknown): number | null {
	if (typeof parent === "number") return parent;
	if (parent && typeof parent === "object" && "id" in parent) {
		return (parent as { id: number }).id;
	}
	return null;
}

/**
 * Wires a Section's Library picker to the per-user Library: lists parents, links
 * the declaration to one, or detaches it to a custom copy. Linking/unlinking
 * folds the returned group and recomputed status into local state, re-rendering
 * the section in place.
 */
export function useLibraryLink({
	kind,
	declaration,
	onDeclarationChange,
}: UseLibraryLinkArgs): LibraryLink {
	const schemasQuery = api.library.listSchemas.useQuery(undefined, {
		enabled: kind === "schema",
	});
	const contactsQuery = api.library.listContacts.useQuery(undefined, {
		enabled: kind === "contact",
	});

	const applySchema = (result: {
		data: PopulatedDeclaration["schema"];
		status: "published" | "unpublished" | null;
	}) =>
		onDeclarationChange((prev) => ({
			...prev,
			schema: result.data,
			status: result.status ?? prev.status,
		}));

	const applyContact = (result: {
		data: PopulatedDeclaration["contact"];
		status: "published" | "unpublished" | null;
	}) =>
		onDeclarationChange((prev) => ({
			...prev,
			contact: result.data,
			status: result.status ?? prev.status,
		}));

	const linkSchema = api.library.linkSchema.useMutation({
		onSuccess: applySchema,
	});
	const linkContact = api.library.linkContact.useMutation({
		onSuccess: applyContact,
	});
	const unlinkSchema = api.schema.upsert.useMutation({
		onSuccess: applySchema,
	});
	const unlinkContact = api.contact.upsert.useMutation({
		onSuccess: applyContact,
	});

	if (kind === "schema") {
		return {
			label: "Utiliser un schéma de votre bibliothèque",
			placeholder: "Sélectionner un schéma",
			items: (schemasQuery.data ?? []).map((s) => ({
				id: s.id,
				label: s.name,
				hint: s.url || "",
			})),
			linkedParentId: parentId(declaration.schema?.parent),
			onSelect: (id) =>
				linkSchema.mutate({ schemaId: id, declarationId: declaration.id }),
			onUnlink: () =>
				unlinkSchema.mutate({
					values: declarationToSchemaValues(declaration),
					declarationId: declaration.id,
				}),
			refetch: schemasQuery.refetch,
		};
	}

	return {
		label: "Utiliser un contact de votre bibliothèque",
		placeholder: "Sélectionner un contact",
		items: (contactsQuery.data ?? []).map((c) => ({
			id: c.id,
			label: c.name,
			hint: c.email || c.url || "",
		})),
		linkedParentId: parentId(declaration.contact?.parent),
		onSelect: (id) =>
			linkContact.mutate({ contactId: id, declarationId: declaration.id }),
		onUnlink: () =>
			unlinkContact.mutate({
				values: declarationToContactValues(declaration),
				declarationId: declaration.id,
			}),
		refetch: contactsQuery.refetch,
	};
}
