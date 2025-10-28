import type { CollectionConfig } from "payload";

export const ThirdPartyAccess: CollectionConfig = {
  slug: "third-party-access",
  admin: {
    group: "Paramètres",
  },
  labels: {
    singular: {
      fr: "Accès tiers",
    },
    plural: {
      fr: "Accès tiers",
    },
  },
  auth: {
    useAPIKey: true,
    disableLocalStrategy: true,
  },
  fields: [
    {
      name: "service_name",
      label: { fr: "Nom du service" },
      type: "text",
      required: true,
    },
  ],
};
