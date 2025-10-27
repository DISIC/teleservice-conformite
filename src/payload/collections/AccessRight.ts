import type { CollectionConfig } from "payload";

export const AccessRights: CollectionConfig = {
  slug: "access-rights",
  fields: [
    {
      name: "role",
      type: "select",
      options: [{ label: "Admin", value: "admin" }],
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "En attente", value: "pending" },
        { label: "Approuvé", value: "approved" },
        { label: "Rejeté", value: "rejected" },
      ],
      required: true,
    },
  ],
};
