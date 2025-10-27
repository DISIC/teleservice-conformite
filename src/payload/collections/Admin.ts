import type { CollectionConfig } from "payload";

export const Admins: CollectionConfig = {
  auth: true,
  slug: "admins",
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
