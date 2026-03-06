import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
	slug: "users",
	admin: {
		group: "Authentification",
		useAsTitle: "email",
	},
	labels: {
		singular: {
			fr: "Utilisateur",
		},
		plural: {
			fr: "Utilisateurs",
		},
	},
	fields: [
		{
			name: "name",
			label: { fr: "Nom" },
			type: "text",
			required: true,
		},
		{
			name: "email",
			type: "email",
			required: true,
			unique: true,
		},
		{
			name: "emailVerified",
			type: "checkbox",
			defaultValue: false,
		},
		{
			name: "accessRights",
			label: { fr: "Droits d'accès" },
			type: "join",
			collection: "access-rights",
			on: "user",
			hasMany: true,
		},
		{
			name: "siret",
			type: "number",
			admin: {
				hidden: true,
			},
		},
		{
			name: "sessions",
			type: "join",
			collection: "sessions",
			on: "user",
		},
		{
			name: "accounts",
			type: "join",
			collection: "accounts",
			on: "user",
		},
		{
			name: "entity",
			type: "relationship",
			relationTo: "entities",
			admin: {
				position: "sidebar",
			},
		},
	],
};
