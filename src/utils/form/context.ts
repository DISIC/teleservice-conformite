import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { JSX } from "react";

import { SubscribeButton, CancelButton } from "~/components/form/ActionButtons";

import { CheckboxField } from "~/components/form/fields/CheckboxField";
import { CheckboxGroupField } from "~/components/form/fields/CheckboxGroupField";
import { NumberField } from "~/components/form/fields/NumberField";
import { RadioField } from "~/components/form/fields/RadioField";
import { SelectField } from "~/components/form/fields/SelectField";
import { TextField } from "~/components/form/fields/TextField";
import { UploadField } from "~/components/form/fields/UploadField";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		TextField,
		UploadField,
		SelectField,
		CheckboxField,
		CheckboxGroupField,
		NumberField,
		RadioField,
	},
	formComponents: {
		SubscribeButton,
		CancelButton,
	},
	fieldContext,
	formContext,
});

export type DefaultFieldProps = {
	label: string;
	className?: string;
	disabled?: boolean;
	readOnly?: boolean;
	description?: string | JSX.Element;
	placeholder?: string;
};
