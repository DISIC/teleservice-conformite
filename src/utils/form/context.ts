import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { CheckboxField } from "~/components/form/CheckboxField";
import { NumberField } from "~/components/form/NumberField";
import { SelectField } from "~/components/form/SelectField";
import { TextField } from "~/components/form/TextField";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		TextField,
		SelectField,
		CheckboxField,
		NumberField,
	},
	formComponents: {},
	fieldContext,
	formContext,
});

export type DefaultFieldProps = {
	label: string;
	disabled?: boolean;
};
