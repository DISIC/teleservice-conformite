import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: { fr: "Média" },
    plural: { fr: "Médias" },
  },
  access: {
		read: () => true,
    create: () => true,
    update: () => true,
	},
  fields: [
    {
			name: "uploadedAt",
			type: "date",
			label: "Date de l'upload",
			index: true,
		},
  ],
  upload: {
    mimeTypes: ["application/pdf"],
  },
};