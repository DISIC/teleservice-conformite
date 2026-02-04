import type { CollectionConfig } from "payload";

import { sourceOptions, rgaaVersionOptions, testEnvironmentOptions, toolOptions } from "../selectOptions";

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

				console.log("AUDIT:", audit);
				console.log("NEW CONTENT:", newContent);

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
