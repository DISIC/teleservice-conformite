import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
	slug: "media",
	labels: {
		singular: { fr: "Média" },
		plural: { fr: "Médias" },
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
