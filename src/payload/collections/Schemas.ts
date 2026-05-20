import type { CollectionConfig } from "payload";
import { toVerifyField } from "../fields/common";

export const Schemas: CollectionConfig = {
	slug: "schemas",
	admin: {
		useAsTitle: "schemaName",
	},
	labels: {
		singular: { fr: "Schéma et plan d'actions" },
		plural: { fr: "Schémas et plans d'actions" },
	},
	fields: [
		{
			name: "schemaName",
			type: "text",
			label: { fr: "Nom du schéma pluriannuel" },
			required: true,
		},
		{
			name: "schemaUrl",
			type: "text",
			label: { fr: "Lien du schéma pluriannuel" },
			required: false,
		},
		{
			name: "actionPlanUrls",
			type: "array",
			label: { fr: "Liens des plans d'actions" },
			labels: {
				singular: { fr: "Plan d'actions" },
				plural: { fr: "Plans d'actions" },
			},
			fields: [
				{
					name: "name",
					type: "text",
					label: { fr: "Nom du plan d'actions" },
					required: true,
				},
				{
					name: "url",
					type: "text",
					label: { fr: "Lien du plan d'actions" },
					required: true,
				},
			],
		},
		{
			name: "entity",
			label: { fr: "Administration associée" },
			type: "relationship",
			relationTo: "entities",
			required: false,
			admin: {
				description: {
					fr: "Si renseigné, ce schéma est partagé au niveau de l'administration et peut être réutilisé sur plusieurs déclarations.",
				},
			},
		},
		toVerifyField,
	],
};
