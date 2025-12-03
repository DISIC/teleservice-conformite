import type { CollectionConfig } from "payload";

export const Entities: CollectionConfig = {
  slug: "entities",
  admin: {
    useAsTitle: "name",
  },
  labels: {
    singular: {
      fr: "Administration",
    },
    plural: {
      fr: "Administrations",
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: { fr: "Nom de l'administration" },
    },
    {
      name: "siret",
      type: "number",
      label: { fr: "SIRET" },
    },
    {
      name: "field",
      type: "text",
      label: { fr: "Secteur d'activité de l'administration" },
    },
  ],
};
