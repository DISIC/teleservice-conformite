import type { Field } from "payload";

import { readOnlyWhenLibraryParentSet, toVerifyField } from "./common";

/**
 * Contact content folded onto the declaration row as a group. `parent` set =
 * linked mode (mirror of a Library parent, read-only in the declaration form);
 * `parent` null = custom mode (editable inline).
 */
export const contactGroup: Field = {
	name: "contact",
	type: "group",
	label: { fr: "Contact" },
	fields: [
		{
			name: "name",
			type: "text",
			label: { fr: "Nom du contact" },
			access: {
				update: readOnlyWhenLibraryParentSet("contact"),
			},
		},
		{
			name: "email",
			type: "email",
			label: { fr: "Email de contact" },
			access: {
				update: readOnlyWhenLibraryParentSet("contact"),
			},
		},
		{
			name: "url",
			type: "text",
			label: { fr: "Lien URL du formulaire" },
			access: {
				update: readOnlyWhenLibraryParentSet("contact"),
			},
		},
		{
			name: "parent",
			type: "relationship",
			relationTo: "contacts",
			hasMany: false,
			label: { fr: "Contact de la bibliothèque" },
		},
		toVerifyField,
	],
};
