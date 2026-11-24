import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { ReactNode } from "react";

import { CancelButton, SubscribeButton } from "~/components/form/ActionButtons";

import { CheckboxField } from "~/components/form/fields/CheckboxField";
import { CheckboxGroupField } from "~/components/form/fields/CheckboxGroupField";
import { NumberField } from "~/components/form/fields/NumberField";
import { RadioField } from "~/components/form/fields/RadioField";
import { RichRadioField } from "~/components/form/fields/RichRadioField";
import { SelectField } from "~/components/form/fields/SelectField";
import { TagGroupField } from "~/components/form/fields/TagGroupField";
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
		TagGroupField,
		RichRadioField,
	},
	formComponents: {
		SubscribeButton,
		CancelButton,
	},
	fieldContext,
	formContext,
});

export type DefaultFieldProps = {
	readOnlyField?: boolean;
	required?: boolean;
	infoStateMessage?: ReactNode;
};

type FieldMeta = { errors: Array<{ message: string }>; isTouched: boolean };

// Errors stay hidden until the field is touched, so a pristine required field
// isn't flagged before the declarant reaches it. An error replaces the info message.
export function getFieldState(meta: FieldMeta): {
	state: "default" | "error";
	stateRelatedMessage: string;
};
export function getFieldState(
	meta: FieldMeta,
	infoStateMessage: ReactNode,
): { state: "default" | "error" | "info"; stateRelatedMessage: ReactNode };
export function getFieldState(
	meta: FieldMeta,
	infoStateMessage?: ReactNode,
): { state: "default" | "error" | "info"; stateRelatedMessage: ReactNode } {
	const errors = meta.isTouched ? meta.errors : [];
	if (errors.length > 0) {
		return {
			state: "error",
			stateRelatedMessage: errors.map((e) => e.message).join(", "),
		};
	}
	if (infoStateMessage) {
		return { state: "info", stateRelatedMessage: infoStateMessage };
	}
	return { state: "default", stateRelatedMessage: "" };
}
