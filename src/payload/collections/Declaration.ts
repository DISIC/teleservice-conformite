import type { CollectionConfig } from "payload";

import {
	appKindOptions,
	declarationStatusOptions,
	sourceOptions,
} from "../selectOptions";

export const Declarations: CollectionConfig = {
	slug: "declarations",
	versions: true,
	trash: true,
	admin: {
		useAsTitle: "name",
	},
	hooks: {
		beforeDelete: [
			async ({ req, id }) => {
				const payload = req.payload;
				const declarationId = id;

				await payload.delete({
					collection: "audits",
					where: {
						declaration: {
							equals: declarationId,
						},
					},
				});

				const declaration = await payload.findByID({
					collection: "declarations",
					id: declarationId,
					depth: 0,
				});

				const contactId =
					typeof declaration.contact === "number"
						? declaration.contact
						: declaration.contact?.id;
				const schemaId =
					typeof declaration.schema === "number"
						? declaration.schema
						: declaration.schema?.id;

				if (contactId) {
					const contact = await payload.findByID({
						collection: "contacts",
						id: contactId,
						depth: 0,
					});
					if (contact && !contact.entity) {
						await payload.delete({ collection: "contacts", id: contactId });
					}
				}

				if (schemaId) {
					const schema = await payload.findByID({
						collection: "schemas",
						id: schemaId,
						depth: 0,
					});
					if (schema && !schema.entity) {
						await payload.delete({ collection: "schemas", id: schemaId });
					}
				}
			},
		],
	},
	labels: {
		singular: {
			fr: "Déclaration",
		},
		plural: {
			fr: "Déclarations",
		},
	},
	fields: [
		{
			name: "name",
			type: "text",
			label: { fr: "Nom de la déclaration" },
		},
		{
			name: "status",
			type: "select",
			label: { fr: "Statut" },
			defaultValue: "unpublished",
			options: [...declarationStatusOptions],
		},
		{
			name: "published_at",
			type: "date",
			label: { fr: "Date de publication" },
			admin: {
				position: "sidebar",
				date: {
					pickerAppearance: "dayOnly",
				},
			},
		},
		{
			name: "created_by",
			type: "relationship",
			relationTo: "users",
			label: { fr: "Créé par" },
			admin: {
				position: "sidebar",
			},
			required: true,
		},
		{
			name: "entity",
			type: "relationship",
			relationTo: "entities",
			label: { fr: "Administration" },
			required: true,
		},
		{
			name: "app_kind",
			type: "select",
			label: { fr: "Type de produit numérique" },
			options: [...appKindOptions],
			required: true,
		},
		{
			name: "url",
			type: "text",
			label: { fr: "URL du service numérique" },
		},
		{
			name: "publishedContent",
			type: "text",
			label: { fr: "Contenu publié" },
			required: false,
		},
		{
			name: "audit",
			type: "join",
			collection: "audits",
			on: "declaration",
			hasMany: false,
			label: { fr: "Audit associé" },
		},
		{
			name: "schema",
			type: "relationship",
			relationTo: "schemas",
			hasMany: false,
			required: false,
			label: { fr: "Schéma et plan d'actions associé" },
		},
		{
			name: "contact",
			type: "relationship",
			relationTo: "contacts",
			hasMany: false,
			required: false,
			label: { fr: "Contact associé" },
		},
		{
			name: "fromSource",
			type: "select",
			label: { fr: "Provenance de la déclaration" },
			options: [...sourceOptions],
			required: true,
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "accessRights",
			label: { fr: "Droits d'accès" },
			type: "join",
			collection: "access-rights",
			on: "declaration",
			hasMany: true,
			admin: {
				position: "sidebar",
			},
		},
	],
};
