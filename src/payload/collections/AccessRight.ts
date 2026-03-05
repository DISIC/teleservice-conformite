import type { CollectionConfig } from "payload";

export const AccessRights: CollectionConfig = {
	slug: "access-rights",
	labels: {
		singular: {
			fr: "Droit d'accès",
		},
		plural: {
			fr: "Droits d'accès",
		},
	},
	fields: [
		{
			name: "role",
			type: "select",
			options: [{ label: "Admin", value: "admin" }],
			required: true,
		},
		{
			name: "status",
			type: "select",
			options: [
				{ label: "En attente", value: "pending" },
				{ label: "Approuvé", value: "approved" },
				{ label: "Rejeté", value: "rejected" },
			],
			required: true,
		},
		{
			name: "user",
			type: "relationship",
			relationTo: "users",
		},
		{
			name: "tmpUserEmail",
			label: "Email de l'invité (si l'utilisateur n'existe pas encore)",
			type: "text",
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "declaration",
			type: "relationship",
			relationTo: "declarations",
			required: true,
		},
		{
			name: "invitedBy",
			type: "relationship",
			relationTo: "users",
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "inviteExpiresAt",
			type: "date",
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "inviteTokenHash",
			type: "text",
			admin: {
				readOnly: true,
				position: "sidebar",
			},
		},
	],
};
