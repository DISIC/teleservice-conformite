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
      label: { fr: "Nom" },
      required: true,
    },
    {
      name: "siret",
      type: "number",
      required: true,
      label: { fr: "SIRET" },
      unique: true,
    },
  ],
};
