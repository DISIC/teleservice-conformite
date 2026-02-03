import type { CollectionConfig } from "payload";

import { sourceOptions, rgaaVersionOptions } from "../selectOptions";

export const Audits: CollectionConfig = {
	slug: "audits",
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
			name: "date",
			type: "date",
			label: { fr: "Date de realisation de l'audit" },
			admin: {
				position: "sidebar",
				date: {
					pickerAppearance: "dayOnly",
				},
			},
			required: true,
		},
		{
			name: "rgaa_version",
			type: "select",
			label: { fr: "Version RGAA" },
			options: [...rgaaVersionOptions],
			index: true,
			required: true,
		},
		{
			name: "realisedBy",
			type: "text",
			label: { fr: "Entite ou personne ayant realise l'audit" },
			required: true,
		},
		{
			name: "rate",
			type: "number",
			label: { fr: "Taux de conformité" },
			required: true,
		},
		{
			name: "compliantElements",
			type: "textarea",
			label: { fr: "Éléments ayant fait l’objet de vérification" },
			required: true,
		},
		{
			name: "nonCompliantElements",
			type: "textarea",
			label: { fr: "Éléments non conformes" },
		},
		{
			name: "disproportionnedCharge",
			type: "textarea",
			label: { fr: "Éléments avec dérogation pour charge disproportionnée" },
		},
		{
			name: "optionalElements",
			type: "textarea",
			label: { fr: "Éléments non soumis à l’obligation d’accessibilité" },
		},
		{
			name: "auditReport",
			type: "text",
			label: { fr: "Rapport d'audit" },
		},
		{
			name: "usedTools",
			type: "array",
			label: { fr: "Outils utilisés" },
			fields: [
				{
					name: "name",
					type: "text",
					label: { fr: "Nom de l’outil" },
					required: true,
				},
			],
		},
		{
			name: "testEnvironments",
			type: "array",
			label: { fr: "Environnements de test" },
			fields: [
				{
					name: "name",
					type: "text",
					label: { fr: "Nom de l’environnement de test" },
					required: true,
				}
		],
		},
		{
			name: "technologies",
			type: "array",
			fields: [
				{
					name: "name",
					type: "text",
					label: { fr: "Nom de la technologie" },
					required: true,
				},
			],
			label: { fr: "Technologies utilisées" },
			required: false,
		},
		{
			name: "declaration",
			type: "relationship",
			relationTo: "declarations",
			label: { fr: "déclaration associée" },
			required: true,
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "status",
			type: "select",
			label: { fr: "Statut" },
			defaultValue: "default",
			options: [...sourceOptions],
			required: false,
		}
	],
};
