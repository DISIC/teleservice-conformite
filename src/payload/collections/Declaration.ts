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
      required: true,
    },
    {
      name: "app_kind",
      type: "select",
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
      admin: {
        condition: (_, siblingData) => siblingData?.app_kind === "website",
      },
    },
    {
      name: "rate",
      type: "number",
      required: true,
      min: 0,
      max: 100,
    },
    {
      name: "status",
      type: "select",
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
      name: "published_at",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
    {
      name: "rgaa_version",
      type: "select",
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
      required: true,
    },
    {
      name: "verified",
      type: "checkbox",
      defaultValue: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "domain",
      type: "relationship",
      relationTo: "domains",
      required: true,
    },
    {
      name: "access_right",
      type: "relationship",
      relationTo: "access-rights",
      required: true,
    },
  ],
};
