import type { CollectionConfig } from "payload";
import type { Entity } from "../payload-types";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    group: "Authentification",
  },
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
      label: { fr: "Nom" },
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
      name: "accessRights",
      label: { fr: "Droits d'accès" },
      type: "relationship",
      relationTo: "access-rights",
      hasMany: true,
    },
    {
      name: "siret",
      type: "number",
      admin: {
        hidden: true,
      },
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
    {
      name: "entity",
      type: "relationship",
      relationTo: "entities",
      admin: {
        position: "sidebar",
      },
    },
  ],
};
