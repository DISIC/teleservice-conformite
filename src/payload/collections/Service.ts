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

export const Services: CollectionConfig = {
  slug: "services",
  versions: true,
  admin: {
    useAsTitle: "name",
  },
  labels: {
    singular: {
      fr: "Service",
    },
    plural: {
      fr: "Services",
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: { fr: "Nom du service numérique" },
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
      type: "select",
      label: { fr: "Type de produit numérique" },
      options: [...appKindOptions],
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
  ],
};