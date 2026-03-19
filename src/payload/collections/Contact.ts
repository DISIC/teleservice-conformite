import type { CollectionConfig } from "payload";
import { recalculateDeclarationStatus } from "~/server/api/utils/publish-comparison";
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
		afterChange: [
			async ({ req, doc, operation }) => {
				if (operation !== "update") return;

				const declaration = doc.declaration;
				if (!declaration) return;

				await recalculateDeclarationStatus(
					req.payload,
					typeof declaration === "number"
						? declaration
						: Number(declaration.id),
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
