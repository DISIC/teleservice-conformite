import type { CollectionConfig } from "payload";

export const Domains: CollectionConfig = {
  slug: "domains",
  admin: {
    useAsTitle: "name",
  },
  labels: {
    singular: {
      fr: "Domaine",
    },
    plural: {
      fr: "Domaines",
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: { fr: "Nom" },
      required: true,
    },
  ],
};
