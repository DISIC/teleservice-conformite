import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { SubscribeButton, CancelButton } from "~/components/form/ActionButtons";

import { CheckboxField } from "~/components/form/fields/CheckboxField";
import { CheckboxGroupField } from "~/components/form/fields/CheckboxGroupField";
import { NumberField } from "~/components/form/fields/NumberField";
import { RadioField } from "~/components/form/fields/RadioField";
import { SelectField } from "~/components/form/fields/SelectField";
import { TextField } from "~/components/form/fields/TextField";
import { UploadField } from "~/components/form/fields/UploadField";
import { TagGroupField } from "~/components/form/fields/TagGroupField";
import { SelectCardField } from "~/components/form/fields/SelectCardField";

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
		TagGroupField,
		SelectCardField,
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
	description?: string | React.ReactNode;
	placeholder?: string;
};
