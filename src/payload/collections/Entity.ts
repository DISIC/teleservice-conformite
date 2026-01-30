import type { CollectionConfig } from "payload";

import { kindOptions } from "../selectOptions";

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
      required: true,
    },
    {
      name: "siret",
      type: "number",
      label: { fr: "SIRET" },
      required: true,
    },
    {
      name: "kind",
      type: "select",
      label: { fr: "Secteur d'activité de l'administration" },
      options: [...kindOptions],
    },
  ],
};
