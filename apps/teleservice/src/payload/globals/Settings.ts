import {
	BoldFeature,
	FixedToolbarFeature,
	ItalicFeature,
	lexicalEditor,
	LinkFeature,
	OrderedListFeature,
	ParagraphFeature,
	UnorderedListFeature,
} from "@payloadcms/richtext-lexical";
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
					type: "richText",
					required: true,
					// Answers sit under an h3 accordion title: no headings, so the page outline stays valid.
					editor: lexicalEditor({
						features: [
							ParagraphFeature(),
							BoldFeature(),
							ItalicFeature(),
							UnorderedListFeature(),
							OrderedListFeature(),
							LinkFeature({ enabledCollections: [] }),
							FixedToolbarFeature(),
						],
					}),
				},
			],
		},
	],
};
