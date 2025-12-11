import type { CollectionConfig } from "payload";

export const Contacts: CollectionConfig = {
  slug: "contacts",
  admin: {
    useAsTitle: "email",
  },
  labels: {
    singular: { fr: "Contact" },
    plural: { fr: "Contacts" },
  },
  fields: [
    {
      name: "mean",
      label: { fr: "Moyen de contact" },
      type: "select",
      options: [
        {
          label: "Email",
          value: "email",
        },
        {
          label: "Téléphone",
          value: "phone",
        },
        {
          label: "Formulaire en ligne",
          value: "online_form",
        },
      ],
      required: true,
    },
    {
      name: "email",
      label: { fr: "Adresse email" },
      type: "email",
    },
  ],
};