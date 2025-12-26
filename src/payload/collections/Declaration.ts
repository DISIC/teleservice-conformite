import type { CollectionConfig } from "payload";

export const appKindOptions = [
  {
    label: "Site web",
    value: "website",
		description: "Site internet, intranet, extranet, application métier, ...",
  },
  {
    label: "Application mobile iOs",
    value: "mobile_app_ios",
  },
  {
    label: "Application mobile Android",
    value: "mobile_app_android",
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
			defaultValue: "unpublished",
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
			name: "entity",
			type: "relationship",
			relationTo: "entities",
			label: { fr: "Administration" },
		},
		{
			name: "app_kind",
			type: "text",
			label: { fr: "Type de produit numérique" },
		},
		{
			name: "url",
			type: "text",
			label: { fr: "URL du service numérique" },
		},
		{
			name: "technologies",
			type: "array",
			label: { fr: "Technologies utilisées" },
			fields: [
				{
					name: "technology_name",
					type: "text",
					label: { fr: "Nom de la technologie" },
				},
			],
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
		},
	],
};
