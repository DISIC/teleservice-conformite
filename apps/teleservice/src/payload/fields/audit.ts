import type { Field } from "payload";

import { rgaaVersionOptions } from "../selectOptions";
import { toVerifyField } from "./common";

const isRealised = (
	_: unknown,
	siblingData: { isRealised?: boolean } | undefined,
) => Boolean(siblingData?.isRealised);

/**
 * Audit content folded onto the declaration row as a 1:1 group. Conditions read
 * `siblingData` from the audit group itself, so `isRealised` gates the
 * realised-only fields.
 *
 * No required-field validation here: the row is a draft that autosave writes
 * one partial slice at a time — completeness is enforced by the publish gate.
 */
export const auditGroup: Field = {
	name: "audit",
	type: "group",
	label: { fr: "Audit" },
	fields: [
		{
			// No default: `null` means "not answered yet", `true`/`false` are real answers.
			name: "isRealised",
			type: "checkbox",
			label: { fr: "Audit réalisé" },
		},
		{
			name: "date",
			type: "date",
			label: { fr: "Date de realisation de l'audit" },
			admin: { condition: isRealised },
		},
		{
			name: "rgaa_version",
			type: "select",
			label: { fr: "Version RGAA" },
			options: [...rgaaVersionOptions],
			index: true,
			hasMany: false,
			admin: { condition: isRealised },
		},
		{
			name: "realisedBy",
			type: "text",
			label: { fr: "Entite ou personne ayant realise l'audit" },
			admin: { condition: isRealised },
		},
		{
			name: "rate",
			type: "number",
			label: { fr: "Taux de conformité" },
			admin: { condition: isRealised },
		},
		{
			name: "compliantElements",
			type: "textarea",
			label: { fr: "Éléments ayant fait l’objet de vérification" },
			admin: { condition: isRealised },
		},
		{
			name: "nonCompliantElements",
			type: "textarea",
			label: { fr: "Éléments non conformes" },
			admin: { condition: isRealised },
		},
		{
			name: "disproportionnedCharge",
			type: "textarea",
			label: { fr: "Éléments avec dérogation pour charge disproportionnée" },
			admin: { condition: isRealised },
		},
		{
			name: "optionalElements",
			type: "textarea",
			label: { fr: "Éléments non soumis à l’obligation d’accessibilité" },
			admin: { condition: isRealised },
		},
		{
			name: "auditReport",
			type: "text",
			label: { fr: "Rapport d'audit" },
			admin: { condition: isRealised },
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
			admin: { condition: isRealised },
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
			admin: { condition: isRealised },
		},
		{
			name: "technologies",
			type: "array",
			label: { fr: "Technologies utilisées" },
			fields: [
				{
					name: "name",
					type: "text",
					label: { fr: "Nom de la technologie" },
					required: true,
				},
			],
			admin: { condition: isRealised },
		},
		toVerifyField,
	],
};
