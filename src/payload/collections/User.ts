import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: {
      fr: "Utilisateur",
    },
    plural: {
      fr: "Utilisateurs",
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
    },
    {
      name: "emailVerified",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "sessions",
      type: "join",
      collection: "sessions",
      on: "user",
    },
    {
      name: "accounts",
      type: "join",
      collection: "accounts",
      on: "user",
    },
  ],
};
