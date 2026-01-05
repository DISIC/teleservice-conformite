import type { CollectionConfig } from "payload";

export const contactMeanOptions = [
  {
    label: "Formulaire en ligne",
    value: "form_url",
  },
  {
    label: "Point de contact",
    value: "email",
  },
] as const;

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
      name: "email",
      label: { fr: "Email de contact email" },
      type: "email",
    },
    {
      name: "url",
      label: { fr: "Lien URL du formulaire" },
      type: "text",
    },
    {
      name: "declaration",
      label: { fr: "Déclaration associée" },
      type: "relationship",
      relationTo: "declarations",
      required: true,
    }
  ],
};