import type { CollectionConfig } from "payload";

import { sourceOptions } from "../selectOptions";

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
			options: [...sourceOptions],
			required: false,
		},
  ],
};