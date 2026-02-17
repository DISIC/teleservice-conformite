import type { CollectionConfig } from "payload";

import { auditStatusOptions, rgaaVersionOptions, testEnvironmentOptions, toolOptions } from "../selectOptions";
import type { Audit } from "../payload-types";

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
        const { req, originalDoc, data, operation } = args;

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

				const declaration = await req.payload.findByID({
					collection: "declarations",
					id: data.declaration ?? originalDoc?.declaration,
				});

				if (!declaration?.publishedContent) return;

        const {
					audit
				} = JSON.parse(declaration?.publishedContent ?? "{}");

				const newContent = {
					rgaa_version: rgaaVersionOptions.find(option => option.value === data.rgaa_version)?.label ?? "RGAA 4",
					realised_by: data.realisedBy,
					rate: data.rate,
					nonCompliantElements: data.nonCompliantElements,
					disproportionnedCharge: data.disproportionnedCharge,
					optionalElements: data.optionalElements,
					compliantElements: data.compliantElements,
					technologies: data.technologies,
					testEnvironments: (data.testEnvironments ?? []).map((env: string) => testEnvironmentOptions.find(option => option.value === env)?.label ?? ""),
					usedTools: (data.usedTools ?? []).map((tool: { id: number; name: string; }) => toolOptions.find(option => option.value === tool.name)?.label ?? ""),
				};

				const status = (JSON.stringify(audit) === JSON.stringify(newContent)) ? "published" : "unpublished"; 

        await req.payload.update({
          collection: "declarations",
          id: data.declaration ?? originalDoc?.declaration,
          data: {
            status,
          },
        });
      },
    ],
	},
	fields: [
		{
			name: "date",
			type: "date",
			label: { fr: "Date de realisation de l'audit" },
			admin: {
				position: "sidebar",
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
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
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
			},
			validate: (
				value: string | null | undefined,
				{ siblingData }: { siblingData?: { status?: string } },
			) => {
				if (siblingData?.status !== "notRealised" && !value) {
					return "Ce champ est obligatoire";
				}

				return true;
			}
		},
		{
			name: "realisedBy",
			type: "text",
			label: { fr: "Entite ou personne ayant realise l'audit" },
			admin: {
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
			},
			validate: (
				value: string | null | undefined,
				{ siblingData }: { siblingData?: { status?: string } },
			) => {
				if (siblingData?.status !== "notRealised" && !value) {
					return "Ce champ est obligatoire";
				}

				return true;
			}
		},
		{
			name: "rate",
			type: "number",
			label: { fr: "Taux de conformité" },
			admin: {
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
			},
			validate: (
				value: number | null | undefined,
				{ siblingData }: { siblingData?: { status?: string } },
			) => {
				if (siblingData?.status !== "notRealised" && value == null) {
					return "Ce champ est obligatoire";
				}

				return true;
			}
		},
		{
			name: "compliantElements",
			type: "textarea",
			label: { fr: "Éléments ayant fait l’objet de vérification" },
			admin: {
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
			},
			validate: (
				value: string | null | undefined,
				{ siblingData }: { siblingData?: { status?: string } },
			) => {
				if (siblingData?.status !== "notRealised" && !value) {
					return "Ce champ est obligatoire";
				}

				return true;
			}
		},
		{
			name: "nonCompliantElements",
			type: "textarea",
			label: { fr: "Éléments non conformes" },
			admin: {
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
			},
		},
		{
			name: "disproportionnedCharge",
			type: "textarea",
			label: { fr: "Éléments avec dérogation pour charge disproportionnée" },
			admin: {
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
			},
		},
		{
			name: "optionalElements",
			type: "textarea",
			label: { fr: "Éléments non soumis à l’obligation d’accessibilité" },
			admin: {
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
			},
		},
		{
			name: "auditReport",
			type: "text",
			label: { fr: "Rapport d'audit" },
			admin: {
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
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
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
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
				}
			],
			admin: {
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
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
				condition: (_, siblingData) => siblingData?.status !== "notRealised"
			},
		},
		{
			name: "declaration",
			type: "relationship",
			relationTo: "declarations",
			label: { fr: "déclaration associée" },
			required: true,
		},
		{
			name: "status",
			type: "select",
			label: { fr: "Statut" },
			defaultValue: "default",
			options: [...auditStatusOptions],
		}
	],
};
