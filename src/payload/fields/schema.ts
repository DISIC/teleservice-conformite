import type { Field } from "payload";

import { readOnlyWhenLibraryParentSet, toVerifyField } from "./common";

/**
 * Schéma et plan d'actions content folded onto the declaration row as a group.
 * Symmetric with the contact group; `parent` links to a Library schema.
 */
export const schemaGroup: Field = {
	name: "schema",
	type: "group",
	label: { fr: "Schéma et plan d'actions" },
	fields: [
		{
			name: "name",
			type: "text",
			label: { fr: "Nom du schéma pluriannuel" },
			access: {
				update: readOnlyWhenLibraryParentSet("schema"),
			},
		},
		{
			name: "url",
			type: "text",
			label: { fr: "Lien du schéma pluriannuel" },
			access: {
				update: readOnlyWhenLibraryParentSet("schema"),
			},
		},
		{
			name: "actionPlanUrls",
			type: "array",
			label: { fr: "Liens des plans d'actions" },
			labels: {
				singular: { fr: "Plan d'actions" },
				plural: { fr: "Plans d'actions" },
			},
			access: {
				update: readOnlyWhenLibraryParentSet("schema"),
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
			name: "parent",
			type: "relationship",
			relationTo: "schemas",
			hasMany: false,
			label: { fr: "Schéma de la bibliothèque" },
		},
		{
			// Schema is optional; declarant explicitly opts out rather than leaving it blank.
			name: "skipped",
			type: "checkbox",
			label: { fr: "Aucun schéma" },
			defaultValue: false,
			required: true,
		},
		toVerifyField,
	],
};
