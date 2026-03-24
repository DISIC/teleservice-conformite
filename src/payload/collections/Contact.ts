import type { CollectionConfig } from "payload";
import { makeRecalculateAfterChangeHook } from "~/server/api/utils/publish-comparison";
import { toVerifyField } from "../fields/common";

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
		afterChange: [makeRecalculateAfterChangeHook("contact")],
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
		toVerifyField,
	],
};
