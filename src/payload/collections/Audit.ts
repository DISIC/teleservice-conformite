import type { CollectionConfig } from "payload";
import { makeRecalculateAfterChangeHook } from "~/server/api/utils/publish-comparison";
import { toVerifyField } from "../fields/common";
import { rgaaVersionOptions } from "../selectOptions";

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
	hooks: {
		beforeChange: [
			async (args) => {
				const { originalDoc, data, operation } = args;

				if (operation !== "update") return;

				if (data.status === "notRealised") {
					return {
						declaration: data.declaration ?? originalDoc?.declaration,
						status: data.status,
						date: null,
						rgaa_version: null,
						realisedBy: null,
						rate: null,
						compliantElements: null,
						nonCompliantElements: null,
						disproportionnedCharge: null,
						optionalElements: null,
						auditReport: null,
						usedTools: [],
						testEnvironments: [],
						technologies: [],
					};
				}
			},
		],
		afterChange: [makeRecalculateAfterChangeHook("audit")],
	},
	fields: [
		{
			name: "isRealised",
			type: "checkbox",
			label: { fr: "Audit réalisé" },
			defaultValue: false,
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "date",
			type: "date",
			label: { fr: "Date de realisation de l'audit" },
			admin: {
				position: "sidebar",
				condition: (_, siblingData) => siblingData?.isRealised,
			},
		},
		{
			name: "rgaa_version",
			type: "select",
			label: { fr: "Version RGAA" },
			options: [...rgaaVersionOptions],
			index: true,
			hasMany: false,
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
			validate: (
				value: string | null | undefined,
				{ siblingData }: { siblingData?: { isRealised?: boolean } },
			) => {
				if (siblingData?.isRealised && !value) {
					return "Ce champ est obligatoire";
				}

				return true;
			},
		},
		{
			name: "realisedBy",
			type: "text",
			label: { fr: "Entite ou personne ayant realise l'audit" },
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
			validate: (
				value: string | null | undefined,
				{ siblingData }: { siblingData?: { isRealised?: boolean } },
			) => {
				if (siblingData?.isRealised && !value) {
					return "Ce champ est obligatoire";
				}

				return true;
			},
		},
		{
			name: "rate",
			type: "number",
			label: { fr: "Taux de conformité" },
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
			validate: (
				value: number | null | undefined,
				{ siblingData }: { siblingData?: { isRealised?: boolean } },
			) => {
				if (siblingData?.isRealised && value == null) {
					return "Ce champ est obligatoire";
				}

				return true;
			},
		},
		{
			name: "compliantElements",
			type: "textarea",
			label: { fr: "Éléments ayant fait l’objet de vérification" },
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
			validate: (
				value: string | null | undefined,
				{ siblingData }: { siblingData?: { isRealised?: boolean } },
			) => {
				if (siblingData?.isRealised && !value) {
					return "Ce champ est obligatoire";
				}

				return true;
			},
		},
		{
			name: "nonCompliantElements",
			type: "textarea",
			label: { fr: "Éléments non conformes" },
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
		},
		{
			name: "disproportionnedCharge",
			type: "textarea",
			label: { fr: "Éléments avec dérogation pour charge disproportionnée" },
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
		},
		{
			name: "optionalElements",
			type: "textarea",
			label: { fr: "Éléments non soumis à l’obligation d’accessibilité" },
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
		},
		{
			name: "auditReport",
			type: "text",
			label: { fr: "Rapport d'audit" },
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
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
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
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
				},
			],
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
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
			admin: {
				condition: (_, siblingData) => siblingData?.isRealised,
			},
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
