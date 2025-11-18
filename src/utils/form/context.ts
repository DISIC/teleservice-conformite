import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { TextField } from "~/components/form/TextField";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
	},
	formComponents: {},
	fieldContext,
	formContext,
});

export type DefaultFieldProps = {
	label: string;
	disabled?: boolean;
};
