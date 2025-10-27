import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  auth: true,
  slug: "users",
  labels: {
    singular: {
      fr: "Utilisateur",
    },
    plural: {
      fr: "Utilisateurs",
    },
  },
  fields: [],
};
