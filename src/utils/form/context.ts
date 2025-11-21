import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { SubscribeButton } from "~/components/form/SubmitButton";

import { CheckboxField } from "~/components/form/fields/CheckboxField";
import { NumberField } from "~/components/form/fields/NumberField";
import { RadioField } from "~/components/form/fields/RadioField";
import { SelectField } from "~/components/form/fields/SelectField";
import { TextField } from "~/components/form/fields/TextField";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		TextField,
		SelectField,
		CheckboxField,
		NumberField,
		RadioField,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});

export type DefaultFieldProps = {
	label: string;
	className?: string;
	disabled?: boolean;
};
