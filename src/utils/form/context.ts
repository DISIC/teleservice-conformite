import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { CheckboxField } from "~/components/form/CheckboxField";
import { NumberField } from "~/components/form/NumberField";
import { RadioField } from "~/components/form/RadioField";
import { SelectField } from "~/components/form/SelectField";
import { SubscribeButton } from "~/components/form/SubmitButton";
import { TextField } from "~/components/form/TextField";

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
