import type { CollectionConfig } from "payload";
import { toVerifyField } from "../fields/common";
import { recalculateDeclarationStatus } from "~/server/api/utils/publish-comparison";

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
			async ({ req, doc, operation }) => {
				if (operation !== "update") return;

				const declarationId = doc.declaration;
				if (!declarationId) return;

				await recalculateDeclarationStatus(
					req.payload,
					typeof declarationId === "number"
						? declarationId
						: Number(declarationId),
				);
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
		toVerifyField,
	],
};
