import type { DeclarationChangeFn } from "~/components/declaration/sections/defineSection";
import { applySavedDeclaration } from "~/components/declaration/sections/applySavedDeclaration";
import type { LibrarySectionKind } from "~/domain/declaration/sourceMode";
import { declarationToContactValues } from "~/forms/contact/contactSchema";
import { declarationToSchemaValues } from "~/forms/schema/schemaSchema";
import { api } from "~/lib/api";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export type LibraryLink = {
	label: string;
	placeholder: string;
	items: { id: number; label: string; hint?: string }[];
	linkedParentId: number | null;
	onSelect: (id: number) => void;
	onUnlink: () => void;
};

type UseLibraryLinkArgs = {
	/** `null` for a Section without a Library: queries stay off, the link is inert. */
	kind: LibrarySectionKind | null;
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

	const apply = applySavedDeclaration(onDeclarationChange);

	const linkSchema = api.library.linkSchema.useMutation({ onSuccess: apply });
	const linkContact = api.library.linkContact.useMutation({
		onSuccess: apply,
	});
	const unlinkSchema = api.schema.upsert.useMutation({ onSuccess: apply });
	const unlinkContact = api.contact.upsert.useMutation({ onSuccess: apply });

	const items =
		kind === "schema"
			? (schemasQuery.data ?? []).map((schema) => ({
					id: schema.id,
					label: schema.name,
					hint: schema.url || "",
				}))
			: kind === "contact"
				? (contactsQuery.data ?? []).map((contact) => ({
						id: contact.id,
						label: contact.name,
						hint: contact.email || contact.url || "",
					}))
				: [];

	const onSelect = (id: number) => {
		const input = { parentId: id, declarationId: declaration.id };
		if (kind === "schema") linkSchema.mutate(input);
		else if (kind === "contact") linkContact.mutate(input);
	};

	// Detach keeps the mirrored content: re-save it as a custom copy.
	const onUnlink = () => {
		if (kind === "schema")
			unlinkSchema.mutate({
				values: declarationToSchemaValues(declaration),
				declarationId: declaration.id,
			});
		else if (kind === "contact")
			unlinkContact.mutate({
				values: declarationToContactValues(declaration),
				declarationId: declaration.id,
			});
	};

	return {
		...(kind ? LIBRARY_COPY[kind] : { label: "", placeholder: "" }),
		items,
		linkedParentId: kind ? parentId(declaration[kind]?.parent) : null,
		onSelect,
		onUnlink,
	};
}
