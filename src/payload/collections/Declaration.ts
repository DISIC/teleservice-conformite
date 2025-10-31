import type { CollectionConfig } from "payload";

export const Declarations: CollectionConfig = {
  slug: "declarations",
  versions: true,
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
      options: [
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
      ],
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
      name: "rate",
      type: "number",
      label: { fr: "Taux" },
      required: true,
      min: 0,
      max: 100,
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
      name: "rgaa_version",
      type: "select",
      label: { fr: "Version RGAA" },
      options: [
        {
          label: "RGAA 4",
          value: "rgaa_4",
        },
        {
          label: "RGAA 5",
          value: "rgaa_5",
        },
      ],
      required: true,
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
  ],
};
