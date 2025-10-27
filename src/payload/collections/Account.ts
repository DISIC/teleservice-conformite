import type { CollectionConfig } from "payload";

export const Accounts: CollectionConfig = {
  slug: "accounts",
  labels: {
    singular: {
      fr: "Compte",
    },
    plural: {
      fr: "Comptes",
    },
  },
  fields: [
    {
      name: "accountId",
      type: "text",
      required: true,
    },
    {
      name: "providerId",
      type: "text",
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "userId",
      type: "number",
      virtual: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        afterRead: [
          ({ siblingData }) =>
            typeof siblingData.user === "number"
              ? siblingData.user
              : siblingData.user?.id,
        ],
      },
    },
    {
      name: "accessToken",
      type: "text",
    },
    {
      name: "refreshToken",
      type: "text",
    },
    {
      name: "idToken",
      type: "text",
    },
    {
      name: "accessTokenExpiresAt",
      type: "date",
    },
    {
      name: "refreshTokenExpiresAt",
      type: "date",
    },
    {
      name: "scope",
      type: "text",
    },
    {
      name: "password",
      type: "text",
    },
  ],
};
