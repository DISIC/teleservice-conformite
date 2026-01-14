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
    },
    {
      name: "previousYearsSchemaUrl",
      type: "text",
      label: { fr: "Lien du bilan des actions" },
    },
    {
      name: "declaration",
      type: "relationship",
      relationTo: "declarations",
      label: { fr: "Déclaration associée" },
      required: true,
    }
  ],
};