import type { CollectionConfig } from "payload";

import { appKindOptions, declarationStatusOptions } from "../selectOptions";

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

				await payload.delete({
					collection: "action-plans",
					where: {
						declaration: {
							equals: declarationId,
						},
					},
				});

				await payload.delete({
					collection: "contacts",
					where: {
						declaration: {
							equals: declarationId,
						},
					},
				});
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
			name: "audit",
			type: "relationship",
			relationTo: "audits",
			label: { fr: "Audit associé" },
		},
		{
			name: "actionPlan",
			type: "relationship",
			relationTo: "action-plans",
			label: { fr: "Plan d'actions associé" },
		},
		{
			name: "contact",
			type: "relationship",
			relationTo: "contacts",
			label: { fr: "Contact associé" },
		},
		{
			name: "publishedContent",
			type: "text",
			label: { fr: "Contenu publié" },
			required: false,
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
