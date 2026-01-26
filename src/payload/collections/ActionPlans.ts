import type { CollectionConfig } from "payload";

export const ActionPlans: CollectionConfig = {
  slug: "action-plans",
  labels: {
    singular: { fr: "Plan d'action" },
    plural: { fr: "Plans d'actions" },
  },
  fields: [
    {
      name: "currentYearSchemaUrl",
      type: "text",
      label: { fr: "Lien du schéma annuel" },
      required: false,
    },
    {
      name: "previousYearsSchemaUrl",
      type: "text",
      label: { fr: "Lien du bilan des actions" },
      required: false,
    },
    {
      name: "declaration",
      type: "relationship",
      relationTo: "declarations",
      label: { fr: "Déclaration associée" },
      required: true,
    },
    {
			name: "status",
			type: "select",
			label: { fr: "Statut" },
			defaultValue: "default",
			options: [
				{ label: "default", value: "default" },
				{ label: "Non vérifié", value: "unverified" },
			],
			required: false,
		},
  ],
};