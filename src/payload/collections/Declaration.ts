import type { CollectionConfig } from "payload";

export const appKindOptions = [
	{
		label: "Site web",
		value: "website",
	},
	{
		label: "Application mobile",
		value: "mobile_app",
	},
	{
		label: "Autre",
		value: "other",
	},
] as const;

export const Declarations: CollectionConfig = {
	slug: "declarations",
	versions: true,
	admin: {
		useAsTitle: "name",
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
			label: { fr: "Nom" },
			required: true,
		},
		{
			name: "app_kind",
			type: "select",
			label: { fr: "Type d'application" },
			required: true,
			options: [...appKindOptions],
		},
		{
			name: "url",
			type: "text",
			label: { fr: "URL" },
			admin: {
				condition: (_, siblingData) => siblingData?.app_kind === "website",
			},
		},
		{
			name: "status",
			type: "select",
			label: { fr: "Statut" },
			options: [
				{
					label: "En attente",
					value: "pending",
				},

				{
					label: "Terminé",
					value: "completed",
				},
			],
			required: true,
		},
		{
			name: "verified",
			type: "checkbox",
			label: { fr: "Vérifié" },
			defaultValue: false,
			admin: {
				readOnly: true,
				position: "sidebar",
			},
		},
		{
			name: "published_at",
			type: "date",
			label: { fr: "Date de publication" },
			required: true,
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
			name: "domain",
			type: "relationship",
			relationTo: "domains",
			label: { fr: "Domaine" },
			admin: {
				position: "sidebar",
			},
			required: true,
		},
		{
			name: "access_right",
			type: "relationship",
			relationTo: "access-rights",
			label: { fr: "Droit d'accès" },
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "audits",
			type: "join",
			collection: "audits",
			on: "declaration",
			label: { fr: "Audits" },
		},
	],
};
