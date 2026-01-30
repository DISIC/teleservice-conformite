import type { CollectionConfig } from "payload";

import { sourceOptions } from "../selectOptions";

export const ActionPlans: CollectionConfig = {
  slug: "action-plans",
  labels: {
    singular: { fr: "Plan d'action" },
    plural: { fr: "Plans d'actions" },
  },
  hooks: {
    beforeChange: [
      async (args) => {
        const { req, originalDoc, data, operation } = args;

        if (operation !== "update" || (data?.status === "default" && originalDoc?.status === "unverified")) return;

        const declaration = await req.payload.findByID({
          id: data.declaration ?? originalDoc?.declaration,
          collection: "declarations",
        });

        const { 
          actionPlan: {
            currentYearSchemaUrl,
            previousYearsSchemaUrl,
          },
        } = JSON.parse(declaration?.publishedContent ?? "{}");

        console.log(currentYearSchemaUrl, previousYearsSchemaUrl);
        console.log(data.currentYearSchemaUrl, data.previousYearsSchemaUrl);

        const status = (currentYearSchemaUrl === data.currentYearSchemaUrl && previousYearsSchemaUrl === data.previousYearsSchemaUrl) ? "published" : "unpublished";

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
      name: "currentYearSchemaUrl",
      type: "text",
      label: { fr: "Lien du schéma annuel" },
      required: false,
    },
    {
      name: "previousYearsSchemaUrl",
      type: "text",
      label: { fr: "Lien du bilan des actions" },
      required: false,
    },
    {
      name: "declaration",
      type: "relationship",
      relationTo: "declarations",
      label: { fr: "Déclaration associée" },
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