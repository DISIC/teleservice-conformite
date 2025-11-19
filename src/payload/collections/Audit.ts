import type { CollectionConfig } from "payload";
import { getCalcRateFromTwoCriterion } from "../hooks";

export const rgaaVersionOptions = [
	{
		label: "RGAA 4",
		value: "rgaa_4",
	},
	{
		label: "RGAA 5",
		value: "rgaa_5",
	},
] as const;

export const Audits: CollectionConfig = {
	slug: "audits",
	versions: true,
	admin: {
		defaultColumns: ["id", "date", "rate", "declaration"],
	},
	labels: {
		singular: {
			fr: "Audit",
		},
		plural: {
			fr: "Audits",
		},
	},
	fields: [
		{
			name: "declaration",
			type: "relationship",
			relationTo: "declarations",
			required: true,
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "date",
			type: "date",
			label: { fr: "Date de l'audit" },
			required: true,
			admin: {
				position: "sidebar",
				date: {
					pickerAppearance: "dayOnly",
				},
			},
		},
		{
			name: "rgaa_version",
			type: "select",
			label: { fr: "Version RGAA" },
			options: [...rgaaVersionOptions],
			required: true,
		},
		{
			name: "conductedBy",
			type: "text",
			label: { fr: "Réalisé par" },
			required: true,
		},
		{
			type: "row",
			fields: [
				{
					name: "compliant_criterion",
					type: "number",
					label: { fr: "Critères conformes" },
					required: true,
					min: 0,
				},
				{
					name: "non_compliant_criterion",
					type: "number",
					label: { fr: "Critères non conformes" },
					required: true,
					min: 0,
				},
			],
		},
		{
			name: "rate",
			type: "number",
			label: { fr: "Taux de conformité" },
			virtual: true,
			admin: {
				readOnly: true,
				description:
					"Calculé automatiquement à partir des critères conformes et non conformes. (C / (C + NC))",
			},
			hooks: {
				afterRead: [getCalcRateFromTwoCriterion],
			},
		},
	],
};
