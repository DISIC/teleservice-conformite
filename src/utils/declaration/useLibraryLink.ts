import type { DeclarationChangeFn } from "~/components/declaration/sections/Content";
import { declarationToContactValues } from "~/forms/contact/contactSchema";
import { declarationToSchemaValues } from "~/forms/schema/schemaSchema";
import { api } from "~/lib/api";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { applyLibrarySection, type LibrarySectionKind } from "./sourceMode";

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
	kind: LibrarySectionKind;
	declaration: PopulatedDeclaration;
	onDeclarationChange: DeclarationChangeFn;
};

const LIBRARY_COPY: Record<
	LibrarySectionKind,
	{ label: string; placeholder: string }
> = {
	contact: {
		label: "Utiliser un contact de votre bibliothèque",
		placeholder: "Sélectionner un contact",
	},
	schema: {
		label: "Utiliser un schéma de votre bibliothèque",
		placeholder: "Sélectionner un schéma",
	},
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

	const applySchema = applyLibrarySection("schema", onDeclarationChange);
	const applyContact = applyLibrarySection("contact", onDeclarationChange);

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

	const items =
		kind === "schema"
			? (schemasQuery.data ?? []).map((schema) => ({
					id: schema.id,
					label: schema.name,
					hint: schema.url || "",
				}))
			: (contactsQuery.data ?? []).map((contact) => ({
					id: contact.id,
					label: contact.name,
					hint: contact.email || contact.url || "",
				}));

	const onSelect = (id: number) => {
		const input = { parentId: id, declarationId: declaration.id };
		if (kind === "schema") linkSchema.mutate(input);
		else linkContact.mutate(input);
	};

	// Detach keeps the mirrored content: re-save it as a custom copy.
	const onUnlink = () => {
		if (kind === "schema")
			unlinkSchema.mutate({
				values: declarationToSchemaValues(declaration),
				declarationId: declaration.id,
			});
		else
			unlinkContact.mutate({
				values: declarationToContactValues(declaration),
				declarationId: declaration.id,
			});
	};

	return {
		...LIBRARY_COPY[kind],
		items,
		linkedParentId: parentId(declaration[kind]?.parent),
		onSelect,
		onUnlink,
		refetch: kind === "schema" ? schemasQuery.refetch : contactsQuery.refetch,
	};
}
