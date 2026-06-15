import type { CollectionConfig } from "payload";

import { auditGroup } from "../fields/audit";
import { contactGroup } from "../fields/contact";
import { schemaGroup } from "../fields/schema";
import {
	appKindOptions,
	declarationStatusOptions,
	mobilePlatformOptions,
	sourceOptions,
} from "../selectOptions";

export const Declarations: CollectionConfig = {
	slug: "declarations",
	versions: true,
	trash: true,
	admin: {
		useAsTitle: "name",
	},
	labels: {
		singular: {
			fr: "Déclaration",
		},
		plural: {
			fr: "Déclarations",
		},
	},
	fields: [
		{
			name: "name",
			type: "text",
			label: { fr: "Nom de la déclaration" },
		},
		{
			name: "status",
			type: "select",
			label: { fr: "Statut" },
			defaultValue: "unpublished",
			options: [...declarationStatusOptions],
		},
		{
			name: "published_at",
			type: "date",
			label: { fr: "Date de publication" },
			admin: {
				position: "sidebar",
				date: {
					pickerAppearance: "dayOnly",
				},
			},
		},
		{
			name: "created_by",
			type: "relationship",
			relationTo: "users",
			label: { fr: "Créé par" },
			admin: {
				position: "sidebar",
			},
			required: true,
		},
		{
			name: "entity",
			type: "relationship",
			relationTo: "entities",
			label: { fr: "Administration" },
			required: true,
		},
		{
			name: "app_kind",
			type: "select",
			label: { fr: "Type de produit numérique" },
			options: appKindOptions.map(({ label, value }) => ({ label, value })),
			required: true,
		},
		{
			name: "mobile_platform",
			type: "select",
			label: { fr: "Plateforme mobile" },
			options: [...mobilePlatformOptions],
			admin: {
				condition: (data) => data?.app_kind === "mobile_app",
			},
		},
		{
			name: "url",
			type: "text",
			label: { fr: "URL du service numérique" },
		},
		{
			name: "publishedContent",
			type: "text",
			label: { fr: "Contenu publié" },
			required: false,
		},
		auditGroup,
		schemaGroup,
		contactGroup,
		{
			name: "fromSource",
			type: "select",
			label: { fr: "Provenance de la déclaration" },
			options: [...sourceOptions],
			required: true,
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "accessRights",
			label: { fr: "Droits d'accès" },
			type: "join",
			collection: "access-rights",
			on: "declaration",
			hasMany: true,
			admin: {
				position: "sidebar",
			},
		},
	],
};
