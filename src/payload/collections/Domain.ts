import type { CollectionConfig } from "payload";

export const Domains: CollectionConfig = {
  slug: "domains",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
  ],
};
