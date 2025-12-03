import type { CollectionConfig } from "payload";

export const ActionPlans: CollectionConfig = {
  slug: "action-plans",
  labels: {
    singular: { fr: "Plan d'action" },
    plural: { fr: "Plans d'actions" },
  },
  fields: [
    {
      name: "currentYearSchemaDone",
      type: "select",
      label: { fr: "Réalisation d’un schéma pluriannuel" },
      options: [
        {
          label: "Oui",
          value: "true",
        },
        {
          label: "Non",
          value: "false",
        },
      ],
    },
    {
      name: "multiyearSchemaDone",
      type: "select",
      label: { fr: "Réalisation d’un schéma pluriannuel" },
      options: [
        {
          label: "Oui",
          value: "true",
        },
        {
          label: "Non",
          value: "false",
        },
      ],
    },
    {
      name: "annualSchemaLink",
      type: "text",
      label: { fr: "Lien du schéma annuel" },
    },
    {
      name: "annualSchema",
      type: "upload",
      label: { fr: "Schéma annuel" },
      relationTo: "media",
    },
    {
      name: "previousAnnualSchemaDone",
      type: "select",
      label: { fr: "Réalisation du schéma annuel - années précédentes" },
      options: [
        {
          label: "Oui",
          value: "true",
        },
        {
          label: "Non",
          value: "false",
        },
      ],
    },
    {
      name: "actionSummary",
      type: "upload",
      label: { fr: "Bilans des actions" },
      relationTo: "media",
    },
  ],
};