import type { Field, FieldAccess } from "payload";

export const toVerifyField: Field = {
	name: "toVerify",
	type: "checkbox",
	label: { fr: "À vérifier" },
	defaultValue: false,
	required: true,
};

export const readOnlyWhenLibraryParentSet = (
	groupName: "contact" | "schema",
): FieldAccess => {
	return ({ data, doc }) => {
		const group = data?.[groupName] ?? doc?.[groupName];
		return !group?.parent;
	};
};
