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
			label: { fr: "Nom de la déclaration" },
		},
		{
			name: "status",
			type: "select",
			label: { fr: "Statut" },
			options: [
				{
					label: "Publié",
					value: "published",
				},

				{
					label: "Non publié",
					value: "unpublished",
				},
			],
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
		},
		{
			name: "service",
			type: "relationship",
			relationTo: "services",
			label: { fr: "Service" },
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
			label: { fr: "Plan d'actions" },
		}
	],
};
