import type { CollectionConfig } from "payload";

export const Admins: CollectionConfig = {
  auth: true,
  slug: "admins",
  admin: {
    group: "Authentification",
  },
  labels: {
    singular: {
      fr: "Administrateur",
    },
    plural: {
      fr: "Administrateurs",
    },
  },
  fields: [],
};
