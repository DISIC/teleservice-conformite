import type { CollectionConfig } from "payload";
import { toVerifyField } from "../fields/common";

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
			name: "entity",
			label: { fr: "Administration associée" },
			type: "relationship",
			relationTo: "entities",
			required: false,
			admin: {
				description: {
					fr: "Si renseigné, ce contact est partagé au niveau de l'administration et peut être réutilisé sur plusieurs déclarations.",
				},
			},
		},
		toVerifyField,
	],
};
