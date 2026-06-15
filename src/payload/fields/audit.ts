import type { Field } from "payload";

import { rgaaVersionOptions } from "../selectOptions";
import { toVerifyField } from "./common";

const isRealised = (
	_: unknown,
	siblingData: { isRealised?: boolean } | undefined,
) => Boolean(siblingData?.isRealised);

const requiredWhenRealised = (
	value: unknown,
	{ siblingData }: { siblingData?: { isRealised?: boolean } },
) => {
	if (
		siblingData?.isRealised &&
		(value === null || value === undefined || value === "")
	) {
		return "Ce champ est obligatoire";
	}

	return true;
};

/**
 * Audit content, folded onto the declaration row as a 1:1 group (ADR-0004).
 * Replaces the deleted `audits` collection; the four Audit Sub-section forms
 * (ADR-0002) patch this group. Conditions read `siblingData` — i.e. the audit
 * group object itself — so `isRealised` gates the realised-only fields.
 */
export const auditGroup: Field = {
	name: "audit",
	type: "group",
	label: { fr: "Audit" },
	fields: [
		{
			name: "isRealised",
			type: "checkbox",
			label: { fr: "Audit réalisé" },
			defaultValue: false,
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
			validate: requiredWhenRealised,
		},
		{
			name: "realisedBy",
			type: "text",
			label: { fr: "Entite ou personne ayant realise l'audit" },
			admin: { condition: isRealised },
			validate: requiredWhenRealised,
		},
		{
			name: "rate",
			type: "number",
			label: { fr: "Taux de conformité" },
			admin: { condition: isRealised },
			validate: requiredWhenRealised,
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
