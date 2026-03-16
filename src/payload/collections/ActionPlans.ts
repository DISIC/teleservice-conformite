import type { CollectionConfig } from "payload";
import { toVerifyField } from "../fields/common";
import { recalculateDeclarationStatus } from "~/server/api/utils/publish-comparison";

export const ActionPlans: CollectionConfig = {
	slug: "action-plans",
	labels: {
		singular: { fr: "Plan d'action" },
		plural: { fr: "Plans d'actions" },
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
		toVerifyField,
	],
};
