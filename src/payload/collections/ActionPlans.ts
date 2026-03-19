import type { CollectionConfig } from "payload";
import { recalculateDeclarationStatus } from "~/server/api/utils/publish-comparison";
import { toVerifyField } from "../fields/common";

export const ActionPlans: CollectionConfig = {
	slug: "action-plans",
	labels: {
		singular: { fr: "Plan d'action" },
		plural: { fr: "Plans d'actions" },
	},
	hooks: {
		afterChange: [
			async ({ req, doc, previousDoc, operation, context }) => {
				if (operation !== "update" || previousDoc.toVerify) return;
				if (context?.skipStatusRecalculation) return;

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
