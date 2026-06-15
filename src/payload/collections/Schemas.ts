import type { CollectionConfig } from "payload";

/**
 * Library ("Schémas et Contacts") parent — a user's reusable schéma et plan
 * d'actions. Owned per-user via `user`; symmetric with Contacts.
 */
export const Schemas: CollectionConfig = {
	slug: "schemas",
	admin: {
		useAsTitle: "name",
	},
	labels: {
		singular: { fr: "Schéma et plan d'actions" },
		plural: { fr: "Schémas et plans d'actions" },
	},
	fields: [
		{
			name: "name",
			type: "text",
			label: { fr: "Nom du schéma pluriannuel" },
			required: true,
		},
		{
			name: "url",
			type: "text",
			label: { fr: "Lien du schéma pluriannuel" },
			required: false,
		},
		{
			name: "actionPlanUrls",
			type: "array",
			label: { fr: "Liens des plans d'actions" },
			labels: {
				singular: { fr: "Plan d'actions" },
				plural: { fr: "Plans d'actions" },
			},
			fields: [
				{
					name: "name",
					type: "text",
					label: { fr: "Nom du plan d'actions" },
					required: true,
				},
				{
					name: "url",
					type: "text",
					label: { fr: "Lien du plan d'actions" },
					required: true,
				},
			],
		},
		{
			name: "user",
			label: { fr: "Propriétaire" },
			type: "relationship",
			relationTo: "users",
			required: true,
		},
		{
			name: "declarations",
			label: { fr: "Déclarations liées" },
			type: "join",
			collection: "declarations",
			on: "schema.parent",
			hasMany: true,
			admin: {
				allowCreate: false,
			},
		},
	],
};
