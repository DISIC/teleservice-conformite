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
		afterChange: [
			async (args) => {
				const { req } = args;

				await req.payload.update({
					collection: "declarations",
					id: args.data.declaration,
					data: {
						status: "unpublished",
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