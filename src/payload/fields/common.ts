import type { Field } from "payload";

export const toVerifyField: Field = {
	name: "toVerify",
	type: "checkbox",
	label: { fr: "À vérifier" },
	defaultValue: false,
	required: true,
};
