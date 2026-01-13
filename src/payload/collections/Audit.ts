import type { CollectionConfig } from "payload";

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

export const toolOptions = [
	{ label: "Wave", value: "wave" },
	{ label: "NVDA", value: "nvda" },
	{ label: "Web Developer Toolbar", value: "web_developer_toolbar" },
	{ label: "HeadingsMap", value: "headings_map" },
	{ label: "JAWS", value: "jaws" },
	{ label: "Assistant RGAA", value: "assistant_rgaa" },
	{ label: "Tanaguru", value: "tanaguru" },
] as const;

export const testEnvironmentOptions = [
	{ label: "NVDA (Firefox)", value: "nvda_firefox" },
	{ label: "JAWS (Firefox)", value: "jaws_firefox" },
	{ label: "VoiceOver (Safari)", value: "voiceover_safari" },
	{ label: "ZoomText (Windows ou Mac OSX)", value: "zoomtext_windows_mac" },
	{ label: "Dragon Naturally Speaking (Windows ou Mac OSX)", value: "dragon_naturally_speaking_windows_mac" },
] as const;

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
		},
		{
			name: "rgaa_version",
			type: "select",
			label: { fr: "Version RGAA" },
			options: [...rgaaVersionOptions],
			index: true,
		},
		{
			name: "realisedBy",
			type: "text",
			label: { fr: "Entite ou personne ayant realise l'audit" },
		},
		{
			name: "rate",
			type: "number",
			label: { fr: "Taux de conformité" },
		},
		{
			name: "compliantElements",
			type: "textarea",
			label: { fr: "Échantillon contrôlé" },
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
			name: "exemption",
			type: "textarea",
			label: { fr: "Éléments non soumis à l’obligation d’accessibilité" },
		},
		{
			name: "auditReport",
			type: "text",
			label: { fr: "Rapport d'audit" },
		},
		{
			name: "toolsUsed",
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
			type: "select",
			label: { fr: "Environnements de test" },
			index: true,
			options : [...testEnvironmentOptions],
			hasMany: true,
		},
		{
			name: "declaration",
			type: "relationship",
			relationTo: "declarations",
			label: { fr: "déclaration associée" },
		},
	],
};
