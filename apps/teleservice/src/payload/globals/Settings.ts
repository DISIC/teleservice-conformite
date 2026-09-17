import type { GlobalConfig } from "payload";

export const Settings: GlobalConfig = {
	slug: "settings",
	label: { fr: "Paramètres" },
	access: {
		read: () => true,
		update: ({ req }) => Boolean(req.user),
	},
	fields: [
		{
			name: "faq",
			label: { fr: "Questions fréquentes" },
			labels: {
				singular: { fr: "Question" },
				plural: { fr: "Questions" },
			},
			type: "array",
			fields: [
				{
					name: "question",
					label: { fr: "Question" },
					type: "text",
					required: true,
				},
				{
					name: "answer",
					label: { fr: "Réponse" },
					type: "textarea",
					required: true,
				},
			],
		},
	],
};
