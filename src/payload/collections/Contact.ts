import type { CollectionConfig } from "payload";

/**
 * Library ("Schémas et Contacts") parent — a user's reusable contact. Owned
 * per-user via `user`. Declarations hold their own copy in the `contact` group
 * and may link to one of these parents.
 */
export const Contacts: CollectionConfig = {
	slug: "contacts",
	admin: {
		useAsTitle: "name",
	},
	labels: {
		singular: { fr: "Contact" },
		plural: { fr: "Contacts" },
	},
	fields: [
		{
			name: "name",
			label: { fr: "Nom du contact" },
			type: "text",
			required: true,
		},
		{
			name: "email",
			label: { fr: "Email de contact" },
			type: "email",
		},
		{
			name: "url",
			label: { fr: "Lien URL du formulaire" },
			type: "text",
		},
		{
			name: "user",
			label: { fr: "Propriétaire" },
			type: "relationship",
			relationTo: "users",
			required: true,
		},
		{
			name: "declarations",
			label: { fr: "Déclarations liées" },
			type: "join",
			collection: "declarations",
			on: "contact.parent",
			hasMany: true,
			admin: {
				allowCreate: false,
			},
		},
	],
};
