import type { CollectionConfig } from "payload";

export const Sessions: CollectionConfig = {
  slug: "sessions",
  admin: {
    group: "Authentification",
  },
  labels: {
    singular: {
      fr: "Session",
    },
    plural: {
      fr: "Sessions",
    },
  },
  fields: [
    {
      name: "expiresAt",
      type: "date",
      required: true,
    },
    {
      name: "token",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "ipAddress",
      type: "text",
    },
    {
      name: "userAgent",
      type: "text",
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
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
  ],
};
