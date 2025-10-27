import type { CollectionConfig } from "payload";

export const Domains: CollectionConfig = {
  slug: "domains",
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
      required: true,
    },
  ],
};
