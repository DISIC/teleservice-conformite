import { useRouter } from "next/router";
import { declarationToContactValues } from "~/forms/contact/contactSchema";
import { declarationToSchemaValues } from "~/forms/schema/schemaSchema";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
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
 * reloads so the section re-renders read-only (linked) or editable (custom).
 */
export function useLibraryLink({
	kind,
	declaration,
}: UseLibraryLinkArgs): LibraryLink {
	const { reload } = useRouter();

	const schemasQuery = api.library.listSchemas.useQuery(undefined, {
		enabled: kind === "schema",
	});
	const contactsQuery = api.library.listContacts.useQuery(undefined, {
		enabled: kind === "contact",
	});

	const linkSchema = api.library.linkSchema.useMutation({
		onSuccess: async () => reload(),
	});
	const linkContact = api.library.linkContact.useMutation({
		onSuccess: async () => reload(),
	});
	const unlinkSchema = api.schema.upsert.useMutation({
		onSuccess: async () => reload(),
	});
	const unlinkContact = api.contact.upsert.useMutation({
		onSuccess: async () => reload(),
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
