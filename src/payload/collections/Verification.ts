import type { CollectionConfig } from "payload";

export const Verifications: CollectionConfig = {
  slug: "verifications",
  labels: {
    singular: {
      fr: "Vérification",
    },
    plural: {
      fr: "Vérifications",
    },
  },
  fields: [
    {
      name: "identifier",
      type: "text",
      required: true,
    },
    {
      name: "value",
      type: "text",
      required: true,
    },
    {
      name: "expiresAt",
      type: "date",
      required: true,
    },
  ],
};
