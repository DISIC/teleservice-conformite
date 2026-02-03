import type { CollectionConfig } from "payload";

import { sourceOptions } from "../selectOptions";

export const Contacts: CollectionConfig = {
  slug: "contacts",
  admin: {
    useAsTitle: "email",
  },
  labels: {
    singular: { fr: "Contact" },
    plural: { fr: "Contacts" },
  },
  hooks: {
    beforeChange: [
      async (args) => {
        const { req, originalDoc, data, operation } = args;

        if (operation !== "update") return;

        const declaration = await req.payload.findByID({
          id: data?.declaration ?? originalDoc?.declaration,
          collection: "declarations",
        });

        if (!declaration?.publishedContent) return;

        const { 
          contact: {
			      url = "",
			      email = "", 
		      },
        } = JSON.parse(declaration?.publishedContent ?? "{}");

        const status = (email === data?.email && url === data?.url) ? "published" : "unpublished";

        await req.payload.update({
          collection: "declarations",
          id: data.declaration ?? originalDoc?.declaration,
          data: {
            status,
          },
        });
      },
    ],
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
    },
    {
			name: "status",
			type: "select",
			label: { fr: "Statut" },
			defaultValue: "default",
			options: [...sourceOptions],
			required: false,
		},
  ],
};