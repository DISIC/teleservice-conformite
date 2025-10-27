import type { CollectionConfig } from "payload";

export const Entities: CollectionConfig = {
  slug: "entities",
  labels: {
    singular: {
      fr: "Entité",
    },
    plural: {
      fr: "Entités",
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "siret",
      type: "text",
      required: true,
      unique: true,
      minLength: 14,
      maxLength: 14,
    },
  ],
};
