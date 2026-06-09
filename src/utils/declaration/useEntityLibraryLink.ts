import { useRouter } from "next/router";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";

export type EntityLibraryLink = {
	label: string;
	placeholder: string;
	items: { id: number; label: string; hint?: string }[];
	selectedId: number | null;
	onSelect: (id: number) => void;
	refetch: () => void;
};

type UseEntityLibraryLinkArgs = {
	kind: "schemas" | "contacts";
	declaration: PopulatedDeclaration;
};

export function useEntityLibraryLink({
	kind,
	declaration,
}: UseEntityLibraryLinkArgs): EntityLibraryLink {
	const { reload } = useRouter();
	const entityId = declaration.entity?.id;

	const schemasQuery = api.entityLibrary.listSchemas.useQuery(
		{ entityId: Number(entityId) },
		{ enabled: !!entityId && kind === "schemas" },
	);
	const contactsQuery = api.entityLibrary.listContacts.useQuery(
		{ entityId: Number(entityId) },
		{ enabled: !!entityId && kind === "contacts" },
	);

	const linkSchema = api.schema.linkExisting.useMutation({
		onSuccess: async () => reload(),
	});
	const linkContact = api.contact.linkExisting.useMutation({
		onSuccess: async () => reload(),
	});

	if (kind === "schemas") {
		return {
			label: "Utiliser un schéma existant de l'administration",
			placeholder: "Sélectionner un schéma",
			items: (schemasQuery.data ?? []).map((s) => ({
				id: s.id,
				label: s.schemaName,
				hint: s.schemaUrl || "",
			})),
			selectedId: declaration.schema?.id ?? null,
			onSelect: (id) =>
				linkSchema.mutate({ schemaId: id, declarationId: declaration.id }),
			refetch: schemasQuery.refetch,
		};
	}

	const currentContactEntityId =
		declaration.contact?.entity &&
		typeof declaration.contact.entity === "object"
			? declaration.contact.entity.id
			: typeof declaration.contact?.entity === "number"
				? declaration.contact.entity
				: null;

	return {
		label: "Utiliser un contact existant de l'administration",
		placeholder: "Sélectionner un contact",
		items: (contactsQuery.data ?? []).map((c) => ({
			id: c.id,
			label: c.name,
			hint: c.email || c.url || "",
		})),
		selectedId: currentContactEntityId
			? (declaration.contact?.id ?? null)
			: null,
		onSelect: (id) =>
			linkContact.mutate({ contactId: id, declarationId: declaration.id }),
		refetch: contactsQuery.refetch,
	};
}
