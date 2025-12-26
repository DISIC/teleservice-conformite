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
	{ label: "Autre", value: "autre" },
]

export const testEnvironmentOptions = [
	{ label: "NVDA (Firefox)", value: "nvda_firefox" },
	{ label: "JAWS (Firefox)", value: "jaws_firefox" },
	{ label: "VoiceOver (Safari)", value: "voiceover_safari" },
	{ label: "ZoomText (Windows ou Mac OSX)", value: "zoomtext_windows_mac" },
	{ label: "Dragon Naturally Speaking (Windows ou Mac OSX)", value: "dragon_naturally_speaking_windows_mac" },
]

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
		},
		{
			name: "conductedBy",
			type: "text",
			label: { fr: "Entite ou personne ayant realise l'audit" },
		},
		{
			name: "rate",
			type: "number",
			label: { fr: "Taux de conformité" },
		},
		{
			name: "pagesAudited",
			type: "array",
			label: { fr: "Pages ayant fait l’objet de vérification" },
			fields: [
				{
					name: "pageName",
					type: "text",
					label: { fr: "Nom de la page" },
				},
				{
					name: "pageURL",
					type: "text",
					label: { fr: "URL de la page" },
				},
			],
		},
		{
			name: "nonCompliances",
			type: "array",
			label: { fr: "Éléments non conformes" },
			fields: [
				{
					name: "nonComplianceDescription",
					type: "text",
					label: { fr: "Description de l'élément non conforme" },
				},
			],
		},
		{
			name: "exemption",
			type: "array",
			label: { fr: "Dérogation pour charge disproportionnée" },
			fields: [
				{
					name: "exemptionDescription",
					type: "text",
					label: { fr: "Description de la justification de la dérogation" },
				},
			],
		},
		{
			name: "nonDeclaredContent",
			type: "array",
			label: { fr: "Contenus non soumis à la déclaration" },
			fields: [
				{
					name: "nonDeclaredContentDescription",
					type: "text",
					label: { fr: "Description du contenu non déclaré" },
				},
			],
		},
		{
			name: "auditReport",
			type: "upload",
			label: { fr: "Rapport d'audit" },
			relationTo: "media",
		},
		{
			name: "auditGrid",
			type: "upload",
			label: { fr: "Grille d'audit" },
			relationTo: "media",
		},
	],
};
